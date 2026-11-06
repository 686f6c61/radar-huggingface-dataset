# Mihai-LeanZero/Qwen3.8-27B-Atlassian-v2-agent-Q4-mlx

## Resumen

Qwen3.8-27B-Atlassian-v2-agent-Q4-mlx es una compilación en 4 bits del adaptador LoRA de LeanZero para Qwen3.8-27B, orientada a tareas de administración de Atlassian (Jira, Confluence, Jira Service Management y Forge) dentro de sesiones de agente goose. El modelo parte del modelo base Qwen/Qwen3.8-27B y entrena un adaptador LoRA nuevo, sin reutilizar pesos ni textos de la versión anterior (v1), para eliminar hábitos heredados como saludar por alias de foro o citar publicaciones. Está pensado para ejecutarse localmente con MLX en hardware Apple Silicon.

El interés técnico está en su enfoque de evaluación: el autor publica métricas de comportamiento agéntico (llamadas a herramientas válidas, argumentos completos, no repetir llamadas, no escribir ficheros cuando se pide "solo dime"), no solo benchmarks de conocimiento. Sobre BFCL obtiene 91.8 frente a 85.7 de v1 en llamada y argumentos correctos, y 85.8 frente a 76.7 en rechazo de herramientas no adecuadas.

La compilación en 4 bits es la más agresiva del release y el propio autor advierte que es más lossy que la de 8 bits, que ya presenta deriva frente a bf16 en contextos de agente largos (KL 0.400, top-1 89.9% hasta 16.384 tokens). Para sesiones largas de goose, la referencia es el adaptador PEFT sobre el base en bf16.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, según tag `qwen3_5`); adaptador LoRA sobre Qwen3.8-27B |
| Parámetros totales | 26.895.993.856 (~26,9 mil millones) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible como spec del modelo; las pruebas de agente se realizan hasta 16.384 tokens |
| Tipos de cuantización | 4 bits (MLX); el release incluye también 6 bits, 8 bits y adaptador PEFT |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), 4 bits; repo de 16,0 GB |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 128 y escala 2.0 aplicado sobre los últimos 32 bloques de Qwen3.8-27B, inicializado desde cero (el primer paso calcula el base exacto), con learning rate 2,0e-05 y filas de hasta 65.536 tokens. No hay arrastre KL hacia versiones anteriores. El mix de entrenamiento contiene 50.095 filas: 30.473 de conocimiento Atlassian y Forge reescrito desde documentación, 10.579 de replay general y con thinking activado (respuestas del propio base), 7.609 de apps Forge, código y correcciones, 778 de administración, organización e identidad, 527 de sesiones de agente goose y 129 de voz del propietario. De los objetivos, 36.940 fueron escritos por el modelo base a partir de un pasaje o prompt, y 405 filas de goose conservan turnos de sus profesores.

La decisión de partir del base en lugar de continuar desde v1 responde a un problema de datos: 131 de las 220 hilos de Atlassian Community usados en v1 contenían saludo por alias, bloque de cita o firma, y ese hábito se heredaba. Antes de entrenar se verificó el base en 120 respuestas sin nombres ni alias no presentes en el prompt, y el mix final se escaneó fila a fila (0 de 50.095 filas con esos patrones; el build se rechaza con un solo acierto). La compilación en 4 bits no se evalúa contra bf16 en la información disponible; la de 8 bits sí: KL 0.001 y top-1 99.5% en texto general, pero KL 0.400 y top-1 89.9% en contextos de agente goose de hasta 16.384 tokens, frente a un umbral de KL ≤ 0.067 y top-1 ≥ 90%.

## Capacidades

- Llamada a herramientas (tool calling) en sesiones de agente goose: solo invoca herramientas presentes en la sesión y rellena todos los argumentos obligatorios.
- Conocimiento de administración de Atlassian: Jira, Confluence, Jira Service Management, Forge y migraciones.
- Generación de aplicaciones Forge y manifiestos válidos (con rendimiento ligeramente inferior a v1).
- Razonamiento multi-paso dentro de una sesión de agente, con control de repetición de llamadas.
- Cumplimiento de instrucciones de contención: no buscar ni escribir ficheros cuando se pide "solo dime" o "no files".
- Delegación de decisiones: pregunta cuando la decisión corresponde a otra persona en lugar de asumirla.
- Trazabilidad: respalda sus afirmaciones con salida de herramientas (no declara ficheros escritos que no se escribieron).
- Estilo de respuesta sin saludos, firmas ni nombres de personas no mencionadas.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Automatización de administración de Jira: el modelo puede interpretar una petición en lenguaje natural y ejecutar la secuencia de llamadas a la API de Jira (crear proyecto, ajustar esquemas, permisos) validando cada argumento obligatorio antes de invocar la herramienta.
- Asistente de migraciones Atlassian: con conocimiento específico de migraciones en el mix de entrenamiento, puede guiar la conversión de espacios de Confluence o proyectos de Jira y consultar el estado mediante herramientas en lugar de responder de memoria.
- Generación de aplicaciones Forge: a partir de un brief, produce código de app y manifiesto; útil en prototipado interno, aunque el autor reporta 27,33 apps completas de 35 frente a 30 de v1, por lo que conviene revisión humana.
- Agente de soporte en Jira Service Management: gestiona conversaciones multi-turno dentro de una sesión goose, consulta tickets y aplica transiciones, con preguntas de aclaración cuando la decisión es del usuario.
- Validación de flujos en Jira (CogniRunner): el modelo puede redactar y revisar condiciones, validadores y post-funciones, apoyándose en el conocimiento de la plataforma incluido en el entrenamiento.
- Clasificación y bloqueo de adjuntos en Confluence (Sentinel Vault): uso como agente que consulta metadatos y aplica reglas de clasificación mediante llamadas a herramientas.
- Despliegue local en Apple Silicon para entornos con requisitos de privacidad: al ser una compilación MLX de 4 bits, permite ejecutar el agente en un Mac sin enviar datos de Jira o Confluence a un servicio externo.

## Benchmarks y rendimiento

| Benchmark | v2 (8 bits) | v1 (8 bits) | Diferencia | Significación |
|---|---|---|---|---|
| BFCL, llamada y argumentos correctos | 91,8 | 85,7 | +6,1 | significativa (cota 95% favorable a v2) |
| BFCL, rechazo de herramientas no adecuadas | 85,8 | 76,7 | +9,1 | significativa (cota 95% favorable a v2) |
| Conocimiento Atlassian, opción múltiple | 74,4% | 71,9% | +2,5 pp (IC 95% -3,94 a +8,96; McNemar p 0,54) | no significativa |
| Conocimiento Atlassian, preguntas libres Forge | 63,3% | 86,7% | -23,3 pp (IC 95% -38,47 a -8,20; McNemar p 0,016) | significativa (peor) |
| Apps Forge completas (35 briefs, 3 muestras) | 27,33 | 30 | -2,67 | no se reporta significación |
| Manifiestos Forge válidos (35 briefs, 3 muestras) | 29,33 | 31,33 | -2,0 | no se reporta significación |
| Slip: busca o escribe ficheros tras "just tell me" / "no files" | 45,2% | 57,7% (13 puntos de slip) | -12,5 pp | significativa (menor tasa) |
| Slip: llama a herramienta no ofrecida en la sesión | 12,5% | 22,5% (50 puntos de slip) | -10,0 pp | significativa (menor tasa) |

Los benchmarks se reportan sobre las compilaciones de 8 bits. No se han publicado resultados específicos de la compilación de 4 bits en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repo de 4 bits ocupa 16,0 GB, por lo que se necesita del orden de 16-20 GB de memoria unificada o VRAM para cargar los pesos, más margen para el contexto.
- GPU recomendadas: no se especifican en la información disponible; el formato MLX está orientado a Apple Silicon (M-series). Para GPUs NVIDIA habría que usar el adaptador PEFT sobre el base en bf16 con transformers o vLLM.
- Cabe en GPU de consumo: en Apple Silicon, un Mac con 24 GB o 32 GB de memoria unificada es el escenario natural para la compilación de 4 bits; en NVIDIA, una RTX 4090 de 24 GB podría alojar los pesos, pero no hay soporte MLX nativo.
- Opciones de despliegue: MLX (librería declarada) para esta compilación; para el adaptador PEFT, transformers o vLLM sobre Qwen3.8-27B en bf16. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-Atlassian-v2-agent (este, 4 bits MLX) | ~26,9 B | no disponible (probado hasta 16.384) | Agente Atlassian, tool calling | Apache 2.0 | Hugging Face, 63 descargas |
| Qwen3.8-27B-Atlassian (v1) | no disponible | no disponible | Agente Atlassian, generación previa | Apache 2.0 (según release) | Hugging Face |
| Qwen3.8-27B-Atlassian-v2-agent Q8-mlx | ~26,9 B | no disponible | Misma versión en 8 bits, referencia de calidad | Apache 2.0 | Hugging Face |
| Qwen3.8-27B-Atlassian-v2-agent-lora-peft | ~26,9 B | no disponible | Adaptador sobre bf16, referencia para sesiones largas | Apache 2.0 | Hugging Face |

No se dispone de comparación con modelos de propósito general de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- La compilación de 4 bits es más lossy que la de 8 bits; el autor solo publica la deriva de la de 8 bits (KL 0.400 y top-1 89.9% en contextos de agente de hasta 16.384 tokens, por debajo del umbral de calidad KL ≤ 0.067 y top-1 ≥ 90%). Para sesiones largas de goose, usar el adaptador PEFT sobre bf16.
- Regresión significativa en preguntas libres de Forge frente a v1: 63,3% frente a 86,7% (McNemar p 0,016).
- Generación de apps Forge ligeramente inferior a v1: 27,33 apps completas de 35 frente a 30, y 29,33 manifiestos válidos frente a 31,33.
- En sesiones de goose retenidas, el autor indica que las métricas no se muestran no inferiores a v1 y que ninguna de las 4 diferencias principales es estadísticamente significativa; además, el modelo no pregunta al decisor que la tarea nombra.
- Riesgo de alucinación en conteos o estados si no hay salida de herramienta que los respalde; el entrenamiento lo penaliza, pero no lo elimina.
- Sesgos de idioma no documentados: no se especifican idiomas soportados ni evaluación multilingüe.
- Licencia Apache 2.0 permite uso comercial, pero el modelo está especializado en Atlassian y su uso fuera de ese dominio no está evaluado.
- Modelo con 63 descargas y 0 likes: ecosistema y validación externa muy limitados; conviene tratar los resultados como reportados por el autor.
- Dependencia del formato MLX: no es directamente desplegable en stacks NVIDIA sin recurrir al adaptador PEFT.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mihai-LeanZero/Qwen3.8-27B-Atlassian-v2-agent-Q4-mlx
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Compilación 8 bits: https://huggingface.co/Mihai-LeanZero/Qwen3.8-27B-Atlassian-v2-agent-Q8-mlx
- Compilación 6 bits: https://huggingface.co/Mihai-LeanZero/Qwen3.8-27B-Atlassian-v2-agent-Q6-mlx
- Adaptador PEFT: https://huggingface.co/Mihai-LeanZero/Qwen3.8-27B-Atlassian-v2-agent-lora-peft
- Write-up del release: https://leanzero.net/portfolio/atlassian-models
- LeanZero: https://leanzero.net
- CogniRunner: https://leanzero.net/portfolio/cognirunner
- Sentinel Vault: https://leanzero.net/portfolio/sentinel-vault
- LeanZero Management: https://leanzero.net/portfolio/leanzero-management
- Migraciones Atlassian: https://leanzero.net/services/atlassian-migrations
- Elzi: https://leanzero.net/portfolio/elzi
