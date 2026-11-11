# netprojects/Laplace-1-Atlas-MLX-8bit

## Resumen

Laplace-1-Atlas-MLX-8bit es una conversión a formato MLX de 8 bits (cuantización afín, group size 64) del modelo JuneoAI/Laplace-1-Atlas, un modelo de decisión de 27B parámetros construido por Juneo Lab sobre Qwen3.8-27B. El modelo no está diseñado como un generador de texto conversacional al uso, sino como un evaluador de candidatos: recibe un estado, una pregunta y un conjunto de opciones, y devuelve una distribución de probabilidad sobre esas opciones en un único forward pass. Resuelve problemas de enrutamiento, control de acceso, decisión de actuar o preguntar, y validación de resultados.

La relevancia de esta build concreta es la eficiencia en hardware Apple Silicon: reduce el peso de 54,7 GB (bf16) a 29,5 GB manteniendo el 92,2% de acierto en JevBench, ligeramente por encima del bf16 (91,8%), y conserva la misma respuesta de máxima probabilidad que el bf16 en 230 de 231 ítems. El modelo base tiene 27.356.728.560 parámetros reales según los safetensors, con la torre de visión mantenida en bf16.

La conversión está publicada por NetProjects (Internet Projects Ltd), sin afiliación con Juneo Lab ni Alibaba Cloud, bajo licencia Apache 2.0. La librería de referencia es mlx y mlx-lm, con soporte de servidor OpenAI-compatible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.8-27B), con torre de visión bf16; decodificación por logits de letras candidatas |
| Parámetros totales | 27.356.728.560 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | 8 bits afín, group size 64 (existen builds 4-bit, 6-bit, 8-bit y bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), 20 archivos de pesos; tamaño del repo 29,5 GB |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer Qwen3.8-27B adaptado por Juneo Lab para tareas de decisión. La innovación operativa es el uso del modelo como scorer: los candidatos se presentan etiquetados con letras (hasta 26), y los logits del siguiente token para esas letras, tras softmax, producen la distribución de probabilidad sobre los candidatos. Esto permite una decisión en un solo forward pass, sin generación autoregresiva ni modo thinking, y con un prompt de sistema fijo que instruye a devolver únicamente la letra del candidato.

No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO. La model card de la conversión tampoco especifica innovaciones arquitectónicas más allá de la mencionada. La build conserva la torre de visión en bf16 y es compatible con mlx-vlm, aunque los resultados de decisión reportados son sobre texto. Se ha verificado que los 20 archivos de pesos de la revisión upstream coinciden con los hashes SHA-256 del Hub.

## Capacidades

- Puntuación de candidatos: devuelve una distribución de probabilidad sobre hasta 26 opciones etiquetadas con letras en un único forward pass.
- Decisión de enrutamiento: determinar quién debe poseer una tarea, quién puede ver un recurso o si una acción está permitida.
- Decisión de actuar o preguntar: evaluar si procede ejecutar una acción o solicitar más información.
- Validación de resultados: comprobar si un resultado cumple un estándar definido en el estado.
- Predicción del siguiente estado: dado un estado, un historial y una acción, generar la próxima observación del entorno en JSON.
- Soporte de visión: la torre de visión se mantiene en bf16 y el modelo carga en mlx-vlm; se ha verificado la descripción correcta de una imagen de prueba con las builds 4-bit, 6-bit y 8-bit.
- Servidor OpenAI-compatible: `mlx_lm.server` expone el modelo con API compatible con OpenAI.
- Multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Control de acceso y autorización: el modelo recibe el estado con los permisos del solicitante y la petición, y devuelve `allow` o `deny` con probabilidad. Adecuado porque el estado contiene las reglas que gobiernan la decisión y el scorer evalúa candidatos explícitos.
- Enrutamiento de tareas en sistemas multiagente: dado un estado con la tarea y las capacidades de cada agente, el modelo puntúa a qué agente corresponde la tarea. La decisión en un forward pass encaja en pipelines de orquestación de baja latencia.
- Validación de resultados en CI/CD: comprobar si la salida de un paso (test, build, despliegue) cumple el estándar definido en el estado antes de continuar el pipeline.
- Decisión de escalado en atención al cliente: determinar si una solicitud puede resolverse automáticamente o debe escalarse a un humano, con candidatos explícitos y probabilidades asociadas.
- Predicción de siguiente observación en entornos simulados: modelar la transición de estado tras una acción en agentes que operan sobre entornos descritos en JSON, útil para planificación y verificación.
- Evaluación de agentes y safety: usar el modelo como juez de decisiones en pruebas de seguridad de agentes, comparando la opción de máxima probabilidad con la respuesta esperada, como en el protocolo JevBench.
- Enrutamiento de permisos en sistemas de datos: decidir qué campos o registros puede consultar una identidad según el estado de permisos, con las reglas en el campo `state`.

## Benchmarks y rendimiento

Datos de JevBench (231 ítems públicos, tiers easy, original y hard; MIT), con thinking desactivado, medidos en un MacBook Pro M5 Max (128 GB):

| Build | Tamaño | Precisión | easy | original | hard | Memoria pico | KL medio vs bf16 | Igual top answer que bf16 |
|---|---|---|---|---|---|---|---|---|
| bf16 | 54,7 GB | 91,8% | 48/48 | 71/72 | 93/111 | 53,2 GB | referencia | referencia |
| 8-bit | 29,5 GB | 92,2% | 48/48 | 71/72 | 94/111 | 29,2 GB | 0,006 | 230/231 |
| 6-bit | 22,8 GB | 91,8% | 48/48 | 71/72 | 93/111 | 23,0 GB | 0,008 | 231/231 |
| 4-bit | 16,1 GB | 91,3% | 48/48 | 71/72 | 92/111 | 16,7 GB | 0,079 | 224/231 |

En 24 casos de decisión adicionales escritos para esta comprobación, todas las builds eligen el mismo candidato que bf16.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 29,2 GB de pico medido para la build 8-bit en pruebas de decisión; el repo ocupa 29,5 GB.
- Hardware de referencia: MacBook Pro M5 Max con 128 GB de memoria unificada.
- Cabe en Apple Silicon consumer con memoria unificada suficiente (se requiere holgadamente más de 30 GB; la build 4-bit pico de 16,7 GB es la opción para equipos de 24-32 GB).
- GPU NVIDIA/AMD: no es el objetivo de esta build; se distribuye para MLX (Apple Silicon). Para CUDA habría que recurrir al modelo base o a otras conversiones no incluidas en esta información.
- Despliegue: `mlx-lm` (versión probada 0.32.2), `mlx` 0.32.4, `mlx-vlm` 0.7.11 para visión; `mlx_lm.server` para API OpenAI-compatible; `mlx_lm.generate` para CLI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Laplace-1-Atlas-MLX-8bit | 27,36B | no disponible | Scorer de decisiones, base Qwen3.8-27B | Apache 2.0 | Hugging Face (MLX) |
| Laplace-1-Atlas-MLX-6bit | 27,36B (6-bit) | no disponible | Igual, cuantización 6-bit | Apache 2.0 | Hugging Face (MLX) |
| Laplace-1-Atlas-MLX-4bit | 27,36B (4-bit) | no disponible | Igual, cuantización 4-bit | Apache 2.0 | Hugging Face (MLX) |
| JuneoAI/Laplace-1-Atlas (bf16) | 27,36B | no disponible | Modelo original | Apache 2.0 | Hugging Face |

No se dispone en la información proporcionada de comparaciones con modelos de decisión de otros proveedores ni con el Qwen3.8-27B base en tareas equivalentes.

## Limitaciones y advertencias

- Las probabilidades devueltas son relativas al conjunto de candidatos suministrado, no una probabilidad calibrada de acierto.
- El modelo aconseja; el sistema que lo integra debe tomar la decisión final y aplicar sus propias políticas.
- El estado debe contener las reglas que gobiernan la decisión; si faltan, la puntuación carece de base normativa.
- Máximo de 26 candidatos por consulta (etiquetas A-Z).
- La build está pensada para MLX/Apple Silicon; no se ofrecen pesos GGUF ni CUDA en esta información.
- Los benchmarks JevBench son 231 ítems públicos y pueden no representar dominios ajenos al de evaluación.
- La torre de visión se conserva en bf16 y se ha probado en mlx-vlm, pero los resultados de decisión reportados son solo sobre texto.
- No se especifican sesgos conocidos, idiomas soportados ni riesgos de alucinación en la información proporcionada.
- Publicado por NetProjects sin afiliación con Juneo Lab ni Alibaba Cloud; verificar la procedencia upstream (revisión `cf6ea86`) si se requiere trazabilidad.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base JuneoAI/Laplace-1-Atlas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Laplace-1-Atlas-MLX-8bit
- Modelo base: https://huggingface.co/JuneoAI/Laplace-1-Atlas
- Build 6-bit: https://huggingface.co/netprojects/Laplace-1-Atlas-MLX-6bit
- Build 4-bit: https://huggingface.co/netprojects/Laplace-1-Atlas-MLX-4bit
- Build bf16: https://huggingface.co/netprojects/Laplace-1-Atlas-MLX-bf16
- JevBench: https://github.com/fstandhartinger/jevbench
- Publicador: https://netprojects.com
