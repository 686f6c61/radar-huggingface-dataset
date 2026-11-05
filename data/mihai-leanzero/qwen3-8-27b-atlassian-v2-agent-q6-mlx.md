# Mihai-LeanZero/Qwen3.8-27B-Atlassian-v2-agent-Q6-mlx

## Resumen

Qwen3.8-27B-Atlassian-v2-agent-Q6-mlx es un ajuste fino mediante LoRA del modelo base Qwen/Qwen3.8-27B, publicado por Mihai-LeanZero (LeanZero) y distribuido en formato MLX de 6 bits. El modelo está especializado en tareas de administración de Atlassian: Jira, Confluence, Jira Service Management, Forge y migraciones, y está entrenado para operar como agente dentro de goose, el framework sobre el que se construye la aplicación de escritorio Elzi del propio autor. No es un modelo de propósito general: es un artefacto vertical para un dominio y un entorno de agente concretos.

La relevancia técnica de esta ficha no está en el modelo base, sino en la documentación inusualmente honesta que acompaña la release. El autor publica las puertas de calidad que no se superaron, reconoce que esta versión es peor que la v1 en generación de aplicaciones Forge y en preguntas libres sobre Forge, y advierte explícitamente de que el build de 8 bits (y, por extensión, este de 6 bits, aún más lossy) se desvía del bf16 en contextos de agente de hasta 16.384 tokens. Para sesiones largas de agente, el autor indica que la referencia es el adaptador PEFT sobre el base bf16, no este archivo cuantizado.

El modelo tiene 26.895.993.856 parámetros reales según los safetensors, un repositorio de 22,7 GB y licencia Apache 2.0. La model card no detalla la arquitectura interna del base más allá del tag `qwen3_5`, ni la longitud de contexto nativa, ni los idiomas soportados; esos datos no están disponibles en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (tag `qwen3_5`); adaptador LoRA sobre Qwen/Qwen3.8-27B |
| Parametros totales | 26.895.993.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible como spec del base; el autor evalúa contextos de agente de hasta 16.384 tokens |
| Tipos de cuantizacion | 6 bits (MLX); la release incluye también Q8 MLX, Q4 MLX y adaptador PEFT |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX, 6-bit), librería `mlx` |
| Modelo base | Qwen/Qwen3.8-27B |
| Tipo de ajuste | LoRA, rank 128, scale 2.0, sobre los últimos 32 bloques |
| Tamano del repositorio | 22,7 GB |
| Descargas / likes | 22 / 0 |

## Arquitectura y entrenamiento

El adaptador se entrena desde el modelo base, no desde la v1, con el objetivo explícito de romper un sesgo heredado: la v1 saludaba por handle de foro, citaba posts y nombraba a personas que nadie había mencionado. El autor atribuye ese comportamiento a su propio dataset de la ronda anterior (131 de 220 hilos de Atlassian Community contenían saludo por handle, handle, cita de foro o firma). El LoRA es de rank 128 y scale 2.0, aplicado sobre los últimos 32 bloques, inicializado desde cero (el primer paso calcula el base exacto), con learning rate 2.0e-05, filas de hasta 65.536 tokens y sin KL pull hacia ningún modelo anterior.

La mezcla de entrenamiento tiene 50.095 filas: 30.473 de conocimiento Atlassian y Forge reescrito desde documentación; 10.579 de replay general y con thinking activado (respuestas del propio base); 7.609 de apps Forge, código y correcciones; 778 de administración, organización e identidad (sin persona, escritas por el base); 527 de sesiones de agente goose; y 129 de voz (respuestas del propietario). De los objetivos, 36.940 fueron escritos por el modelo base a partir de un pasaje o prompt, 405 filas de goose conservan los turnos de sus profesores y el resto son filas retenidas de rondas anteriores que la v1 no escribió. Se descartaron 474 filas durante la construcción. El mix se escaneó fila a fila en busca de saludos, handles, citas y firmas: 0 de 50.095 filas dieron positivo y ninguna fue escrita por la v1.

## Capacidades

- Llamada a herramientas (tool calling) dentro de sesiones goose: el modelo está entrenado para invocar solo herramientas presentes en la sesión, rellenar todos los argumentos obligatorios (por ejemplo, nombrar el archivo en una edición) y no repetir la misma llamada en bucle.
- Modo de respuesta directa: respeta instrucciones del tipo "just tell me" o "no files", sin buscar ni escribir archivos.
- Escalado de decisiones: pregunta cuando la decisión corresponde a otra persona en lugar de tomarla por su cuenta.
- Grounding en salida de herramientas: el autor lo entrena para no declarar archivos escritos que no se escribieron ni recuentos que ninguna herramienta devolvió.
- Conocimiento de dominio Atlassian: administración, Jira, Confluence, Jira Service Management, Forge y migraciones.
- Generación de aplicaciones Forge y manifiestos (con rendimiento ligeramente inferior a la v1).
- Razonamiento con thinking activado (el mix incluye replay con thinking-on).
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Agente de administración de Jira en sesiones goose: el modelo puede encadenar llamadas a la API de Jira (crear issues, transicionar estados, ajustar permisos) respetando el conjunto de herramientas expuesto en la sesión y sin inventar endpoints, que es exactamente el fallo que el autor mide y reduce frente a la v1.
- Asistente de operaciones sobre Confluence: consulta, edición y clasificación de páginas y adjuntos, con la restricción entrenada de nombrar el archivo en cada edición y no repetir la misma llamada.
- Soporte a migraciones Atlassian: el mix incluye filas específicas de migración, de modo que el modelo puede responder preguntas sobre mapeo de espacios, usuarios y permisos durante un proyecto de migración a Cloud.
- Generación de aplicaciones Forge: a partir de un brief, produce código y manifiesto. Es adecuado para prototipado rápido, aunque el autor reporta 27,33 apps completas de 35 frente a 30 de la v1, por lo que conviene revisar la salida.
- Automatización de Jira Service Management: clasificación y respuesta a tickets con conocimiento de la jerarquía de colas, SLA y campos obligatorios, apoyándose en el conocimiento de administración incluido en el mix.
- Asistente de escritorio Elzi: es el entorno para el que fue entrenado; se integra como motor de un agente local que opera sobre Jira y Confluence desde el escritorio del usuario.
- Validación de flujos en CogniRunner: el conocimiento de condiciones y post-funciones de Jira permite al modelo redactar y revisar reglas de workflow, aunque la verificación final debe hacerse contra la instancia real.

## Benchmarks y rendimiento

| Benchmark | v2 (build 8-bit) | v1 (build 8-bit) | Diferencia | Significancia |
|---|---|---|---|---|
| Atlassian, opción múltiple | 74,4 % | 71,9 % | +2,5 pts (IC 95 % -3,94 a +8,96) | McNemar p 0,54, no significativa |
| Forge, preguntas libres | 63,3 % | 86,7 % | -23,3 pts (IC 95 % -38,47 a -8,20) | McNemar p 0,016, significativa |
| BFCL, llamada correcta y argumentos | 91,8 | 85,7 | favorable a v2 | significativa (cota 95 % favorable) |
| BFCL, rechazo de herramientas no adecuadas | 85,8 | 76,7 | favorable a v2 | significativa (cota 95 % favorable) |
| Forge apps completas (35 briefs, 3 muestras) | 27,33 / 35 | 30 / 35 | -2,67 | no reportada |
| Manifiestos Forge válidos | 29,33 / 35 | 31,33 / 35 | -2,0 | no reportada |

Puntos de deslizamiento en sesiones goose retenidas: tras "just tell me" / "no files", v2 busca o escribe archivos en el 45,2 % de los casos frente al 57,7 % de v1 (13 puntos de deslizamiento); llama a una herramienta no ofrecida por la sesión en el 12,5 % frente al 22,5 % (50 puntos). El autor indica que ninguna de las 4 diferencias principales en sesiones goose es estadísticamente significativa y que estas métricas no se demuestran no inferiores a v1.

Fidelidad de la cuantización (build 8-bit frente a bf16 con adaptador): KL 0,001 y top-1 99,5 % en texto general; KL 0,400 y top-1 89,9 % en contextos de agente goose de hasta 16.384 tokens. La puerta de calidad exigía KL ≤ 0,067 y top-1 ≥ 90 %, por lo que el build de 8 bits no la supera en contexto de agente. No se publican métricas específicas del build de 6 bits más allá de la advertencia de que es "aún más lossy".

## Requisitos de hardware

- VRAM estimada para este build de 6 bits: el repositorio ocupa 22,7 GB, por lo que se necesita al menos ~24 GB de memoria unificada o VRAM para cargarlo completo, más overhead de contexto KV.
- El formato es MLX, así que el despliegue nativo es en Apple Silicon (memoria unificada); no está pensado para CUDA.
- En Apple Silicon, un equipo con 32 GB o más de memoria unificada es el objetivo realista para este build; 24 GB queda muy justo al sumar contexto.
- Para GPU NVIDIA, el autor remite al adaptador PEFT sobre el base bf16, que requiere transformers o vLLM; el base bf16 de ~27B no cabe en GPUs de consumo de 24 GB sin cuantización adicional.
- Opciones de despliegue: MLX (este archivo), transformers/vLLM con el adaptador PEFT sobre bf16 (build de referencia para sesiones largas), y builds Q8 y Q4 MLX de la misma release.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dominio | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B-Atlassian-v2-agent (6-bit MLX) | 26,9 B | no disponible (evaluado a 16.384) | Atlassian + agente goose | Apache 2.0 | MLX safetensors 6-bit |
| Qwen3.8-27B-Atlassian (v1) | mismo base | no disponible | Atlassian + agente goose | Apache 2.0 (según release) | varios |
| Qwen/Qwen3.8-27B (base) | 27 B | no disponible | propósito general | según el base | safetensors, etc. |
| Adaptador PEFT v2 sobre bf16 | mismo base | no disponible | Atlassian + agente goose | Apache 2.0 | PEFT |

Frente a la v1, la v2 gana en tool calling (BFCL) y en puntos de deslizamiento de agente, pero pierde en preguntas libres de Forge y en generación de apps Forge. Frente al base sin ajustar, la diferencia esperable es de conocimiento de dominio y disciplina de agente, aunque el autor no publica una comparación directa contra el base en estos benchmarks. No se dispone de comparación con otros modelos especializados en Atlassian en la información proporcionada.

## Limitaciones y advertencias

- El build de 6 bits es más lossy que el de 8 bits, que ya incumple la puerta de calidad en contextos de agente: KL 0,400 y top-1 89,9 % frente a los umbrales de 0,067 y 90 %. Para sesiones largas de goose, el autor indica el adaptador PEFT sobre bf16 como referencia.
- Regresión significativa en preguntas libres de Forge: 63,3 % frente a 86,7 % de la v1 (p 0,016). No usar este modelo como sustituto de la v1 para consultas abiertas sobre Forge sin validación.
- Menor tasa de apps Forge completas y manifiestos válidos que la v1 (27,33 vs 30 y 29,33 vs 31,33 sobre 35 briefs).
- En sesiones goose retenidas, las métricas principales no se demuestran no inferiores a la v1, y el modelo sigue sin preguntar al decisor que la tarea nombra.
- Persisten tasas de deslizamiento no nulas: 45,2 % de búsquedas o escrituras tras "just tell me" / "no files" y 12,5 % de llamadas a herramientas no ofrecidas por la sesión.
- Sesgo de persona mitigado pero no necesariamente eliminado: el escaneo del mix da 0 de 50.095 filas con saludos, handles, citas o firmas, y el base dio 0 de 120 respuestas con persona no mencionada, pero no se reporta una evaluación equivalente sobre el modelo final.
- Riesgo de alucinación en conocimiento de dominio: el modelo está entrenado para respaldar afirmaciones con salida de herramientas, pero no hay benchmark publicado de fidelidad factual fuera de los conjuntos del autor.
- Idiomas soportados no documentados; no asumir multilingüismo más allá de lo que haga el base.
- Licencia Apache 2.0, sin restricción conocida para uso comercial, pero el modelo se distribuye como artefacto de nicho para un entorno (goose/Elzi) y un stack (MLX/Apple Silicon) concretos.
- Solo 22 descargas y 0 likes: ecosistema mínimo, sin validación independiente de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Mihai-LeanZero/Qwen3.8-27B-Atlassian-v2-agent-Q6-mlx
- Build 8-bit MLX: https://huggingface.co/Mihai-LeanZero/Qwen3.8-27B-Atlassian-v2-agent-Q8-mlx
- Build 4-bit MLX: https://huggingface.co/Mihai-LeanZero/Qwen3.8-27B-Atlassian-v2-agent-Q4-mlx
- Adaptador PEFT (transformers / vLLM sobre bf16): https://huggingface.co/Mihai-LeanZero/Qwen3.8-27B-Atlassian-v2-agent-lora-peft
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Write-up completo de la release: https://leanzero.net/portfolio/atlassian-models
- LeanZero: https://leanzero.net
- CogniRunner: https://leanzero.net/portfolio/cognirunner
- Sentinel Vault: https://leanzero.net/portfolio/sentinel-vault
- LeanZero Management: https://leanzero.net/portfolio/leanzero-management
- Migraciones Atlassian: https://leanzero.net/services/atlassian-migrations
- Elzi: https://leanzero.net/portfolio/elzi
