# netprojects/Laplace-1-Vector-MLX-bf16

## Resumen

Laplace-1-Vector es un modelo de decisión de 4.112 millones de parámetros (aproximadamente 4B) desarrollado por Juneo Lab sobre la base Spark-X2.6-4B. Su propósito no es la generación de texto abierta, sino la evaluación de candidatos: recibe un estado, una pregunta y un conjunto de opciones, y devuelve una distribución de probabilidad sobre cada candidato en un único forward pass. Está orientado a toma de decisiones en agentes (quién debe ejecutar una tarea, quién puede ver qué, si actuar o preguntar primero) y a la predicción del siguiente estado de un entorno descrito.

La versión aquí documentada es una conversión a MLX en bf16 publicada por NetProjects (Internet Projects Ltd), no afiliada a Juneo Lab ni a XHToken. Mantiene los pesos completos en bf16 como referencia para el resto de builds cuantizados de la familia (4-bit, 6-bit y 8-bit), y está pensada para ejecutarse en Apple Silicon de forma local, manteniendo los datos en la máquina del usuario.

La relevancia actual del modelo radica en su enfoque: en lugar de usar un LLM generativo para tareas de clasificación o enrutamiento, expone una interfaz de scoring determinista y barata (una sola pasada) que encaja en pipelines de agentes donde la latencia y la privacidad son críticas. La arquitectura subyacente es propietaria (tag `spark2_5`), y mlx-lm 0.32 o superior la soporta de forma nativa sin `trust_remote_code`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer `spark2_5` (soporte nativo en mlx-lm >= 0.32) |
| Parametros totales | 4.112.079.360 (~4B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (se ha probado con prompts de hasta 3.313 tokens) |
| Tipos de cuantizacion | bf16 (esta build); existen builds 4-bit, 6-bit y 8-bit de la misma familia |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), librería `mlx` |

## Arquitectura y entrenamiento

El modelo se construye sobre Spark-X2.6-4B según la model card, con la etiqueta de arquitectura `spark2_5` reconocida de forma nativa por mlx-lm 0.32. No se detalla en la información disponible si se trata de un transformer denso, MoE o híbrido, ni el número de tokens de entrenamiento, la composición del dataset o si se aplicaron fases de RLHF o DPO. La información pública se limita a la conversión a MLX y a la validación de paridad con el modelo original.

La innovación técnica destacable no está en la arquitectura sino en la interfaz: el modelo lee los candidatos como letras (A, B, C…) y los logits del siguiente token correspondientes a esas letras, tras softmax, producen la distribución sobre candidatos. Esto convierte una tarea de decisión en un único forward pass sin generación autoregresiva, lo que reduce latencia y coste. La conversión a MLX fue validada contra el código original de Juneo en float32 sobre CPU (Transformers 4.57.1) con 11 prompts, incluido uno de 3.313 tokens: coincidencia de siguiente token del 99,6% (bf16), 98,9% (8-bit), 98,1% (6-bit) y 90,4% (4-bit) sobre 753 posiciones en modo teacher-forced.

## Capacidades

- Scoring de candidatos: dada una tupla (estado, pregunta, lista de hasta 26 candidatos), devuelve una distribución de probabilidad sobre cada opción en una sola pasada.
- Toma de decisiones de agente: enrutamiento de tareas, control de acceso, decisión de actuar o solicitar información, validación de resultados frente a un estándar.
- Predicción del siguiente estado de un entorno: recibe reglas del entorno como system prompt y estado/acción en JSON, y devuelve la siguiente observación.
- Modo thinking desactivable: los ejemplos de la model card usan `enable_thinking=False` para scoring determinista y para predicción de estado.
- Conversación y generación de texto: pipeline `text-generation` y `conversational`, con chat template propio.
- Integración con API compatible OpenAI mediante `mlx_lm.server`.
- Ejecución on-device en Apple Silicon, sin necesidad de GPU dedicada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles.

## Casos de uso

- Enrutamiento de tareas en sistemas multiagente: el modelo recibe el estado del sistema (permisos, contexto, historial) y una lista de agentes candidatos, y devuelve la probabilidad de que cada uno sea el propietario adecuado de la tarea. Al resolverse en un forward pass, la latencia es compatible con bucles de agente en tiempo real.
- Control de acceso y autorización: con las reglas de permisos incluidas en el estado, el modelo puntúa decisiones tipo allow/deny sobre una solicitud concreta. Útil como capa de verificación previa a la ejecución de acciones sensibles.
- Decisión de actuar frente a preguntar: en flujos con stakes altos, se incluye una opción de "devolver al humano" o "solicitar más información" entre los candidatos, y el modelo estima cuál está soportada por el estado.
- Validación de resultados frente a un estándar: dado un resultado producido por otro componente y un conjunto de criterios, el modelo puntúa si cumple el estándar, como paso de QA automatizado en pipelines.
- Predicción de siguiente observación en simulaciones o entornos descritos: útil para planificación de agentes que necesitan anticipar el efecto de una acción antes de ejecutarla, con las reglas del entorno en el system prompt.
- Clasificación privada on-device: al ejecutarse en un Mac con MLX, permite clasificar decisiones sobre datos sensibles sin enviarlos a un servicio externo, cumpliendo requisitos de residencia de datos.
- Ranking de alternativas en asistentes de código o herramientas internas: puntuar opciones de refactor, parches o respuestas candidatas y seleccionar la mejor según el estado del repositorio.

## Benchmarks y rendimiento

La model card reporta resultados en JevBench (231 ítems públicos) para las distintas builds de la familia:

| Build | Tamano | JevBench (231 items) | Misma respuesta top que bf16 |
|---|---|---|---|
| Laplace-1-Vector-MLX-6bit (recomendada) | 3,3 GB | 79,2% | 222 / 231 |
| Laplace-1-Vector-MLX-8bit | 4,4 GB | 79,7% | 229 / 231 |
| Laplace-1-Vector-MLX-4bit | 2,3 GB | 78,4% | 210 / 231 |
| Laplace-1-Vector-MLX-bf16 (esta build) | 8,2 GB | 78,8% | referencia |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La paridad con el modelo original medida en teacher-forced sobre 753 posiciones fue del 99,6% para bf16.

## Requisitos de hardware

- VRAM/unificada estimada para bf16: el repo ocupa 8,2 GB en pesos; en Apple Silicon con memoria unificada se recomienda al menos 16 GB para dejar margen al sistema y al contexto.
- GPU recomendadas: Apple Silicon (probado en MacBook Pro M5 Max con 128 GB). No se documenta soporte para CUDA en esta build MLX.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon con memoria unificada suficiente; las builds 4-bit (2,3 GB) y 6-bit (3,3 GB) reducen el requisito.
- Opciones de despliegue: `mlx-lm` (>= 0.32), `mlx_lm.generate`, `mlx_lm.server` con API compatible OpenAI. Requiere Python 3.11 o superior. Probado con mlx 0.32.4 y mlx-lm 0.32.2.
- Latencia y throughput: no disponibles de forma numérica; al ser scoring en un único forward pass, la latencia por decisión es sustancialmente menor que la de un modelo generativo equivalente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Laplace-1-Vector (esta build, MLX bf16) | ~4B | no disponible | Scoring de candidatos / decisión | Apache 2.0 | Hugging Face, MLX |
| Laplace-1-Vector MLX 6-bit | ~4B | no disponible | Igual, cuantizado | Apache 2.0 | Hugging Face, MLX |
| Laplace-1-Atlas MLX 6-bit (hermano, 27B) | 27B | no disponible | Decisión a mayor escala | Apache 2.0 | Hugging Face, MLX |
| Modelo base JuneoAI/Laplace-1-Vector | ~4B | no disponible | Referencia original | Apache 2.0 | Hugging Face |

No se dispone de información sobre modelos de terceros comparables en la misma categoría de scoring de decisiones en la documentación proporcionada.

## Limitaciones y advertencias

- Las probabilidades devueltas son relativas al conjunto de candidatos suministrado, no una probabilidad calibrada de acierto; no deben interpretarse como confianza absoluta.
- El modelo no genera decisiones abiertas: requiere que el usuario enumere los candidatos (hasta 26) y describa el estado y las reglas. Un estado mal especificado degrada la calidad de la decisión.
- En decisiones de alto riesgo conviene incluir siempre una opción de devolución al humano o de solicitud de más información.
- La build 4-bit cambia la respuesta top en aproximadamente el 9% de los ítems de JevBench frente a bf16; para scoring y ranking se recomienda 6-bit u 8-bit.
- No se documentan sesgos conocidos, idiomas soportados ni comportamiento multilingüe; se desconoce el rendimiento fuera del inglés.
- Riesgo de alucinación en el modo de predicción de siguiente observación: el modelo puede generar estados plausibles pero incorrectos si las reglas del entorno no están bien especificadas.
- Licencia Apache 2.0 permite uso comercial, pero esta build es una conversión de terceros (NetProjects), no afiliada a Juneo Lab ni XHToken; conviene verificar la licencia del modelo base original antes de producción.
- Requiere mlx-lm >= 0.32 y Python 3.11+; no es desplegable en stacks CUDA/vLLM/TGI estándar sin reconversión.
- Solo probado en Apple Silicon (M5 Max); el rendimiento en otros chips Apple no está documentado.

## Enlaces

- Hugging Face (esta build): https://huggingface.co/netprojects/Laplace-1-Vector-MLX-bf16
- Modelo base: https://huggingface.co/JuneoAI/Laplace-1-Vector
- Build 6-bit recomendada: https://huggingface.co/netprojects/Laplace-1-Vector-MLX-6bit
- Build 8-bit: https://huggingface.co/netprojects/Laplace-1-Vector-MLX-8bit
- Build 4-bit: https://huggingface.co/netprojects/Laplace-1-Vector-MLX-4bit
- Hermano 27B (Atlas MLX 6-bit): https://huggingface.co/netprojects/Laplace-1-Atlas-MLX-6bit
- NetProjects: https://netprojects.com
- Librería mlx-lm: no disponible enlace directo en la información proporcionada
