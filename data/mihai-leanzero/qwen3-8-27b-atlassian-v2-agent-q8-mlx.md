# Mihai-LeanZero/Qwen3.8-27B-Atlassian-v2-agent-Q8-mlx

## Resumen

Qwen3.8-27B-Atlassian-v2-agent-Q8-mlx es un ajuste fino mediante LoRA del modelo base Qwen/Qwen3.8-27B, desarrollado por LeanZero (Mihai-LeanZero) y distribuido en formato MLX con cuantización de 8 bits. El modelo está especializado en tareas de administración de Atlassian: Jira, Confluence, Jira Service Management, Forge y migraciones entre instancias. No es un modelo de propósito general, sino un adaptador de comportamiento orientado a operar como agente dentro de Elzi, la aplicación de escritorio construida sobre goose que LeanZero comercializa.

La relevancia de esta versión (v2) radica en que reinicia el entrenamiento desde el modelo base en lugar de continuar desde el adaptador v1. El motivo documentado es la contaminación de la versión anterior con hábitos conversacionales indeseados (saludos por alias de foro, citas de publicaciones, firmas y nombres de personas no mencionadas en el contexto), presentes en 131 de las 220 conversaciones de la comunidad Atlassian usadas como datos. v2 corrige parcialmente esos sesgos y mejora el tool calling, aunque retrocede en generación de aplicaciones Forge y en preguntas abiertas sobre Forge.

El modelo tiene 27.356.728.560 parámetros (27,36 mil millones), se distribuye bajo licencia Apache 2.0 y ocupa 32,7 GB en el repositorio. La build de 8 bits no es equivalente al modelo en bf16 con el adaptador: mantiene la fidelidad en texto general pero diverge en contextos de agente goose largos, por lo que la referencia para sesiones extensas es el adaptador PEFT sobre el base en bf16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.8-27B) con adaptador LoRA, formato MLX |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 65.536 tokens en entrenamiento; contexto nativo del base no disponible en la informacion proporcionada |
| Tipos de cuantizacion | 8 bits (esta build); existen builds Q6 y Q4 en MLX y adaptador PEFT para bf16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX, cuantizacion 8-bit) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer denso de 27,36 mil millones de parámetros, sobre el que se aplica un adaptador LoRA de rango 128 y escala 2.0 en los últimos 32 bloques, inicializado desde cero (el primer paso computa el modelo base exacto), con tasa de aprendizaje 2.0e-05 y filas de hasta 65.536 tokens. No hay tracción KL hacia modelos anteriores ni pesos heredados de v1.

El conjunto de entrenamiento consta de 50.095 filas: 30.473 de conocimiento Atlassian y Forge reescrito desde la documentación; 10.579 de replay general y con thinking activado (respuestas del propio base); 7.609 de aplicaciones Forge, código y correcciones; 778 de administración, organización e identidad sin persona (escritas por el base); 527 de sesiones de agente goose; y 129 de voz (respuestas del propietario). De los objetivos, 36.940 fueron escritos por el modelo base a partir de un pasaje o prompt fuente, 405 filas de goose conservan los turnos de sus profesores y el resto son filas retenidas de rondas anteriores no escritas por v1. Se descartaron 474 filas durante la construcción, entre ellas 275 de thinking general por exceso de objetivos, 103 con nombres de persona no presentes en el contexto y otras de thinking por la misma causa.

La build de 8 bits se evaluó contra los pesos bf16 con el adaptador: en texto general alcanza KL 0,001 y top-1 del 99,5%, pero en contextos de agente goose de hasta 16.384 tokens la divergencia sube a KL 0,400 y top-1 del 89,9%, por debajo del umbral de aceptación del proyecto (KL máximo 0,067 y top-1 mínimo 90%). Para sesiones largas de goose, la referencia es el adaptador PEFT sobre el base en bf16.

## Capacidades

- Tool calling orientado a sesiones goose: llamar únicamente a herramientas presentes en la sesión y rellenar todos los argumentos obligatorios (por ejemplo, una edición debe nombrar su fichero).
- Evitar bucles de llamadas repetidas a la misma herramienta.
- Responder directamente cuando se indica "just tell me" o "no files", sin buscar ni escribir ficheros.
- Escalar decisiones al responsable correspondiente en lugar de tomarlas por su cuenta.
- Respaldar afirmaciones con salida de herramientas: no declarar un fichero terminado que nunca se escribió ni dar recuentos que ninguna herramienta devolvió.
- Abstenerse de saludar, firmar o nombrar a personas que no aparecen en el contexto.
- Conocimiento de administración Atlassian: Jira, Confluence, Jira Service Management, Forge y migraciones.
- Generación de aplicaciones Forge, código y correcciones (con rendimiento ligeramente inferior a v1).
- Modo thinking (el conjunto de entrenamiento incluye filas con thinking activado).
- Capacidades multilingües: no disponible.

## Casos de uso

- Automatización de administración de Jira: el modelo puede ejecutar operaciones sobre proyectos, flujos y permisos invocando las herramientas expuestas en la sesión goose, con la garantía de que solo llama a herramientas existentes y rellena los argumentos requeridos.
- Gestión de incidencias en Jira Service Management: clasificación y respuesta a tickets con contexto de la instancia, apoyándose en la salida de herramientas para no inventar estados ni recuentos.
- Edición y organización de espacios de Confluence: creación y modificación de páginas con argumentos completos (incluido el nombre del fichero o página), evitando declarar cambios no realizados.
- Desarrollo de aplicaciones Forge: generación de esqueletos de aplicación y manifiestos válidos a partir de briefs, adecuado para prototipado interno aunque por detrás de v1 en completitud (27,33 de 35 apps completas frente a 30).
- Migraciones entre instancias Atlassian: asistencia en la planificación y ejecución de tareas de migración gracias al conocimiento específico incluido en los 30.473 registros de documentación reescrita.
- Agente de escritorio Elzi: operación como agente multi-paso dentro de la aplicación de escritorio de LeanZero, con comportamiento entrenado para no desviarse en saludos ni firmas y para pedir confirmación cuando la decisión corresponde a otra persona.
- Asistente interno con restricciones de alcance: en escenarios donde se exige responder sin acceso a ficheros ("no files"), el modelo respeta la restricción mejor que v1 (45,2% de deslizamientos frente a 57,7% en puntos de slip retenidos).

## Benchmarks y rendimiento

| Benchmark | v2 (8-bit) | v1 (8-bit) | Diferencia / significancia |
|---|---|---|---|
| Conocimiento Atlassian, opción múltiple | 74,4% | 71,9% | +2,5 puntos; IC 95% -3,94 a +8,96; McNemar p 0,54 (no significativo) |
| Preguntas abiertas sobre Forge | 63,3% | 86,7% | -23,3 puntos; IC 95% -38,47 a -8,20; McNemar p 0,016 (significativo) |
| BFCL, llamada y argumentos correctos | 91,8 | 85,7 | significativo a favor de v2 |
| BFCL, rechazo de herramientas no adecuadas | 85,8 | 76,7 | significativo a favor de v2 |
| Forge apps completas (35 briefs, 3 muestras) | 27,33 de 35 | 30 de 35 | v1 superior |
| Manifiestos Forge válidos | 29,33 | 31,33 | v1 superior |
| Puntos de slip: busca o escribe tras "just tell me" / "no files" | 45,2% | 57,7% | 13 puntos de slip; significativamente menor en v2 |
| Puntos de slip: llama a herramienta no ofrecida | 12,5% | 22,5% | 50 puntos de slip; significativamente menor en v2 |

En las sesiones goose retenidas, ninguna de las 4 diferencias principales resultó estadísticamente significativa y la métrica de "preguntar al decisor nombrado por la tarea" no se mostró no inferior a v1. Fidelidad de la cuantización 8 bits frente a bf16 con adaptador: texto general KL 0,001 y top-1 99,5%; contextos goose de hasta 16.384 tokens KL 0,400 y top-1 89,9%.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 32,7 GB en 8 bits, por lo que se requiere un equipo con al menos ~33-36 GB de memoria unificada o VRAM para cargar los pesos completos; las builds Q6 y Q4 reducen el requisito de forma proporcional.
- GPU recomendadas: no disponible en la información proporcionada. El formato MLX está diseñado para Apple Silicon, por lo que el despliegue natural es en Mac con memoria unificada suficiente (M2/M3/M4 Max o Ultra con 64 GB o más para margen sobre los 32,7 GB de pesos).
- Cabe en GPU de consumo: no disponible; con 27,36 mil millones de parámetros y 32,7 GB en 8 bits, una RTX 4090 de 24 GB no puede cargar esta build completa; las builds Q4 podrían aproximarse pero no se confirma en la información.
- Opciones de despliegue: MLX (librería declarada); para el adaptador PEFT sobre el base en bf16 se indica compatibilidad con transformers y vLLM.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-Atlassian-v2-agent (esta ficha, 8-bit MLX) | 27,36 B | hasta 65.536 en entrenamiento | Agente Atlassian, tool calling | Apache 2.0 | HuggingFace, builds Q8/Q6/Q4 MLX y PEFT |
| Qwen3.8-27B-Atlassian (v1) | 27,36 B | no disponible | Agente Atlassian (ronda anterior) | Apache 2.0 | HuggingFace (referenciado) |
| Qwen/Qwen3.8-27B (base) | 27,36 B | no disponible | Propósito general | Apache 2.0 | HuggingFace |

La comparación con alternativas de la misma categoría (modelos especializados en Atlassian) no está disponible en la información proporcionada; los únicos comparables documentados son el modelo base y la ronda anterior del mismo autor.

## Limitaciones y advertencias

- La build de 8 bits diverge del bf16 con adaptador en contextos goose largos (hasta 16.384 tokens): KL 0,400 y top-1 89,9%, por debajo del umbral del proyecto (KL ≤ 0,067, top-1 ≥ 90%). Para sesiones largas debe usarse el adaptador PEFT sobre el base en bf16.
- Retroceso significativo en preguntas abiertas sobre Forge: 63,3% frente a 86,7% de v1 (McNemar p 0,016).
- Menor tasa de aplicaciones Forge completas y manifiestos válidos que v1 (27,33 vs 30 y 29,33 vs 31,33 sobre 35 briefs).
- En sesiones goose retenidas, la métrica de preguntar al decisor nombrado no se mostró no inferior a v1, y ninguna de las 4 diferencias principales alcanzó significación estadística.
- Persisten deslizamientos: en el 45,2% de los puntos de slip evaluados sigue buscando o escribiendo ficheros tras instrucciones de "just tell me" / "no files", y en el 12,5% llama a herramientas no ofrecidas en la sesión.
- El modelo está entrenado específicamente para el entorno goose/Elzi; su comportamiento fuera de ese marco de herramientas no está validado.
- Idiomas soportados no documentados; el conocimiento está centrado en documentación Atlassian, presumiblemente en inglés.
- Riesgo de alucinación mitigado por diseño (respaldar afirmaciones con salida de herramientas) pero no eliminado; el propio autor documenta fallos de rondas anteriores en este aspecto.
- Licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantías y con métricas de calidad que no superan a v1 en varias dimensiones.
- Solo 34 descargas y 0 likes en el momento de la ficha: ecosistema de validación externa muy limitado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Mihai-LeanZero/Qwen3.8-27B-Atlassian-v2-agent-Q8-mlx
- Adaptador PEFT LoRA (bf16): https://huggingface.co/Mihai-LeanZero/Qwen3.8-27B-Atlassian-v2-agent-lora-peft
- Build MLX 6 bits: https://huggingface.co/Mihai-LeanZero/Qwen3.8-27B-Atlassian-v2-agent-Q6-mlx
- Build MLX 4 bits: https://huggingface.co/Mihai-LeanZero/Qwen3.8-27B-Atlassian-v2-agent-Q4-mlx
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Write-up completo del release: https://leanzero.net/portfolio/atlassian-models
- LeanZero: https://leanzero.net
- CogniRunner: https://leanzero.net/portfolio/cognirunner
- Sentinel Vault: https://leanzero.net/portfolio/sentinel-vault
- LeanZero Management: https://leanzero.net/portfolio/leanzero-management
- Servicios de migraciones Atlassian: https://leanzero.net/services/atlassian-migrations
- Elzi: https://leanzero.net/portfolio/elzi
