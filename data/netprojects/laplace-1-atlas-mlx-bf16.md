# netprojects/Laplace-1-Atlas-MLX-bf16

## Resumen

Laplace-1-Atlas es un modelo de decisión de 27B parámetros desarrollado por Juneo Lab, construido sobre Qwen3.8-27B. Su función no es generar texto libre, sino puntuar candidatos: recibe un estado, una pregunta y un conjunto de opciones (hasta 26), y devuelve una distribución de probabilidad sobre esas opciones en un único forward pass. Está diseñado para tareas como decidir quién debe ser propietario de una tarea, quién puede ver qué recurso, si conviene actuar o preguntar primero, o si un resultado cumple el estándar exigido. También puede predecir la siguiente observación de un entorno descrito.

Esta ficha corresponde a la conversión MLX en bf16 publicada por NetProjects (Internet Projects Ltd), no afiliada a Juneo Lab ni a Alibaba Cloud. Mantiene los pesos completos en bf16 de la revisión `cf6ea86` del modelo original y sirve como referencia para el resto de builds cuantizados del mismo autor (4-bit, 6-bit y 8-bit). El repositorio ocupa 54,7 GB y requiere Apple Silicon con memoria unificada abundante.

La relevancia del modelo reside en su enfoque: en lugar de pedir a un LLM que "razone" una decisión en lenguaje natural, expone la decisión como una clasificación sobre logits de letras, lo que facilita integrar el modelo en sistemas de agentes y control de permisos donde la salida debe ser determinista y auditable. Incluye torre de visión, aunque Juneo reporta sus resultados de decisión solo sobre texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8-27B), con torre de visión; no se detalla si es densa o MoE |
| Parametros totales | 27.356.728.560 (27,36B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (esta build); el autor publica además builds MLX de 4-bit, 6-bit y 8-bit |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo es una adaptación de Qwen3.8-27B orientada a la toma de decisiones. La innovación principal no está en la arquitectura base, sino en la interfaz: el modelo lee los candidatos como letras (A, B, C...) y la distribución sobre los logits del siguiente token correspondiente a esas letras proporciona la probabilidad de cada candidato. Este mecanismo, denominado `score_candidates` en la documentación de Juneo, se ha portado a mlx-lm manteniendo el mismo prompt. El modelo también soporta un modo de predicción de la siguiente observación de un entorno, donde se le pasa el estado y la acción como JSON y devuelve la observación siguiente.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card indica que el modelo base es JuneoAI/Laplace-1-Atlas y que la conversión MLX conserva los pesos bf16 completos. Se ha verificado que los 20 archivos de pesos de la revisión upstream coinciden con los hashes SHA-256 del Hub. La torre de visión está incluida y el modelo carga en mlx-vlm, aunque los resultados de decisión reportados son sobre texto.

## Capacidades

- Puntuación de candidatos: devuelve una distribución de probabilidad sobre hasta 26 opciones en un solo forward pass, sin generación autoregresiva.
- Toma de decisiones estructurada: propiedad de tareas, control de acceso, autorización de acciones, validación de resultados contra un estándar.
- Predicción de la siguiente observación de un entorno: recibe estado, historial y acción en JSON y devuelve la observación siguiente.
- Modo thinking configurable: se puede desactivar con `enable_thinking=False` en la plantilla de chat, lo que es el modo recomendado para puntuar candidatos.
- Capacidades de visión: la torre de visión está incluida y el modelo carga en mlx-vlm; se ha verificado que las builds cuantizadas describen correctamente una imagen de prueba.
- Integración con agentes: los tags incluyen `agents`, `agent-safety` y `decision-making`, orientados a sistemas de agentes con control de permisos.
- Servido con API compatible con OpenAI mediante `mlx_lm.server`.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Control de acceso y permisos en sistemas de agentes: el modelo recibe el estado con los permisos del solicitante y la acción propuesta, y devuelve la probabilidad de permitir o denegar. Es adecuado porque la decisión se reduce a una comparación de logits, lo que facilita la auditoría y el registro de la distribución de probabilidad.
- Enrutamiento de tareas entre agentes o trabajadores: dado un estado con la tarea y los candidatos disponibles, el modelo puntúa quién debería ser el propietario. Útil en orquestadores multiagente donde se necesita una asignación rápida y determinista.
- Validación de resultados contra un estándar: se introduce el resultado y el criterio en el estado, y los candidatos son "cumple" / "no cumple". Apropiado para pipelines de QA automatizados donde se requiere una señal probabilística antes de escalar a revisión humana.
- Decisión de actuar o preguntar primero: en un agente conversacional, el modelo puede puntuar si la información disponible basta para actuar o si conviene solicitar aclaración, reduciendo acciones erróneas en producción.
- Predicción de la siguiente observación en entornos simulados: con las reglas del entorno como system prompt y el estado y la acción en JSON, el modelo predice la observación siguiente. Útil para planificación de agentes en entornos con dinámica conocida.
- Moderación y clasificación de solicitudes: los candidatos pueden ser categorías de política (permitir, revisar, bloquear) y el estado incluye las reglas de la política. La salida probabilística permite fijar umbrales de escalado.
- Integración en macOS con MLX: al ser una build MLX, se puede desplegar en estaciones de trabajo Apple Silicon para prototipado local de sistemas de decisión sin depender de GPUs NVIDIA.

## Benchmarks y rendimiento

Los datos disponibles corresponden a JevBench (231 ítems públicos, tiers easy, original y hard, licencia MIT), evaluados con thinking desactivado y una pasada de puntuación de candidatos por ítem. Se compara la build bf16 con las cuantizadas del mismo autor:

| Build | Precision JevBench | easy | original | hard | Memoria pico | KL medio vs bf16 | Misma respuesta top que bf16 |
|---|---|---|---|---|---|---|---|
| bf16 | 91,8% | 48/48 | 71/72 | 93/111 | 53,2 GB | referencia | referencia |
| 8-bit | 92,2% | 48/48 | 71/72 | 94/111 | 29,2 GB | 0,006 | 230/231 |
| 6-bit | 91,8% | 48/48 | 71/72 | 93/111 | 23,0 GB | 0,008 | 231/231 |
| 4-bit | 91,3% | 48/48 | 71/72 | 92/111 | 16,7 GB | 0,079 | 224/231 |

En 24 casos de decisión adicionales escritos para la verificación, todas las builds eligen el mismo candidato que bf16. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada para bf16: 53,2 GB de pico medidos en las pruebas; el repositorio ocupa 54,7 GB en disco.
- Memoria para cuantizaciones: 4-bit aproximadamente 16,7 GB de pico; 6-bit 23,0 GB; 8-bit 29,2 GB.
- Hardware probado: MacBook Pro M5 Max con 128 GB de memoria unificada, mlx 0.32.4, mlx-lm 0.32.2 y mlx-vlm 0.7.11.
- GPU NVIDIA: no aplica a esta build MLX; para CUDA habría que usar los pesos originales de JuneoAI/Laplace-1-Atlas con otro runtime.
- Consumer GPU: la build bf16 no cabe en GPUs de consumo típicas (24 GB o menos); la build 4-bit (16,7 GB de pico) podría caber en GPUs de 24 GB, aunque esta ficha describe la build MLX para Apple Silicon.
- Opciones de despliegue: mlx-lm (`mlx_lm.generate`, `mlx_lm.server` con API compatible con OpenAI) y mlx-vlm para uso con visión.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Laplace-1-Atlas MLX bf16 (esta ficha) | 27,36B | no disponible | Puntuación de candidatos y predicción de estado | Apache 2.0 | Hugging Face, MLX |
| Qwen3.8-27B (base) | 27B (según model card) | no disponible | LLM generativo general | no disponible en esta información | no disponible en esta información |
| Laplace-1-Atlas MLX 6-bit (mismo autor) | 27,36B (cuantizado) | no disponible | Igual, con cuantización de 6 bits | Apache 2.0 | Hugging Face, 22,8 GB, 91,8% JevBench |
| Laplace-1-Atlas MLX 4-bit (mismo autor) | 27,36B (cuantizado) | no disponible | Igual, con cuantización de 4 bits | Apache 2.0 | Hugging Face, 16,1 GB, 91,3% JevBench |

No se dispone de información sobre otros modelos de decisión comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Las probabilidades devueltas son relativas al conjunto de candidatos proporcionado, no una probabilidad calibrada de ser correcto.
- El modelo aconseja; el sistema decide. La model card recomienda mantener comprobaciones de permisos deterministas y no delegar la decisión final únicamente al modelo.
- El rendimiento en el tier hard de JevBench es notablemente inferior (93/111 en bf16) que en easy (48/48) y original (71/72), lo que sugiere dificultad con casos complejos.
- La build bf16 requiere al menos 53,2 GB de memoria en el pico medido, lo que limita su despliegue a equipos Apple Silicon con memoria unificada alta.
- La build 4-bit reduce el tamaño pero aumenta la divergencia respecto a bf16 (KL 0,079 frente a 0,006-0,008 de 8-bit y 6-bit) y discrepa en 7 de 231 ítems de JevBench.
- No se dispone de información sobre sesgos, idiomas soportados ni riesgos de alucinación específicos del modelo.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantías y el autor de la conversión no está afiliado a Juneo Lab ni a Alibaba Cloud.
- El modelo no debe usarse como única fuente de verdad en decisiones de seguridad o permisos sin capas deterministas adicionales.

## Enlaces

- Hugging Face (esta build): https://huggingface.co/netprojects/Laplace-1-Atlas-MLX-bf16
- Modelo base: https://huggingface.co/JuneoAI/Laplace-1-Atlas
- Build 6-bit: https://huggingface.co/netprojects/Laplace-1-Atlas-MLX-6bit
- Build 8-bit: https://huggingface.co/netprojects/Laplace-1-Atlas-MLX-8bit
- Build 4-bit: https://huggingface.co/netprojects/Laplace-1-Atlas-MLX-4bit
- JevBench: https://github.com/fstandhartinger/jevbench
- NetProjects: https://netprojects.com
- mlx-lm: no disponible como enlace en la información proporcionada
- mlx-vlm: no disponible como enlace en la información proporcionada
