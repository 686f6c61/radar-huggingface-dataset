# netprojects/Laplace-1-Vector-MLX-8bit

## Resumen

Laplace-1-Vector es un modelo de decisión de 4.112 millones de parámetros (aproximadamente 4B) desarrollado por Juneo Lab y construido sobre el modelo base Spark-X2.6-4B. Su propósito no es la generación de texto libre, sino la evaluación de decisiones: recibe un estado, una pregunta y un conjunto de candidatos, y devuelve una distribución de probabilidad sobre cada candidato en un único forward pass. Esto lo hace adecuado para tareas como asignación de responsables, control de acceso, decisión entre actuar o preguntar, o validación de resultados frente a un estándar. También puede predecir la siguiente observación de un entorno descrito.

La versión aquí descrita es una conversión a MLX realizada por NetProjects (Internet Projects Ltd), no afiliada a Juneo Lab ni a XHToken. Está cuantizada a 8 bits con cuantización afín por grupos de 64 en las capas lineales, manteniendo la puerta de salida de atención en bf16, lo que resulta en un peso de 4,4 GB. Está pensada para ejecutarse en Apple Silicon (Macs con chip M-series) junto al agente que la utiliza, manteniendo los datos en local.

El modelo es relevante ahora porque permite incorporar capacidades de decisión y evaluación de seguridad en agentes que corren en dispositivos de consumo, sin depender de APIs externas ni exponer datos sensibles. Su enfoque de "una pasada, múltiples candidatos" es computacionalmente eficiente frente a alternativas de generación autoregresiva para ranking. La licencia Apache 2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (spark2_5), basada en Spark-X2.6-4B |
| Parametros totales | 4.112.079.360 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (se ha probado con prompts de hasta 3.313 tokens) |
| Tipos de cuantizacion | 8-bit (afín, grupo 64; puerta de salida de atención en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La arquitectura es un transformer denominado `spark2_5` en la librería mlx-lm, soportado nativamente desde la versión 0.32 sin necesidad de `trust_remote_code`. El modelo base es Spark-X2.6-4B, sobre el que Juneo Lab construyó Laplace-1-Vector. La conversión a MLX cuantiza las capas lineales a 8 bits con cuantización afín y grupos de 64, mientras que la puerta de salida de atención se mantiene en bf16 para preservar precisión. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La innovación técnica principal es el uso de un único forward pass para puntuar candidatos: el modelo lee los candidatos como letras (A, B, C...) y los logits del siguiente token correspondientes a esas letras proporcionan la distribución de probabilidad. Esto evita la generación autoregresiva y reduce la latencia. El helper `score_candidates` de Juneo se ha portado a mlx-lm manteniendo el mismo prompt. Además, el modelo puede predecir la siguiente observación de un entorno dado su estado y acción, con el modo thinking desactivado.

## Capacidades

- Evaluación y ranking de candidatos: devuelve probabilidades relativas para hasta 26 opciones etiquetadas con letras, en una sola pasada.
- Toma de decisiones en agentes: asignación de propietario de tarea, control de acceso (quién puede ver qué), decisión entre actuar o solicitar más información, validación de resultados frente a estándares.
- Predicción del siguiente estado de un entorno: dado un estado, historial y acción, genera la siguiente observación en JSON.
- Generación de texto conversacional: puede responder preguntas en una frase, como se muestra en el ejemplo de la model card.
- Modo thinking desactivable: el template de chat soporta `enable_thinking=False` para respuestas directas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.
- Capacidades de visión o audio: no disponible.

## Casos de uso

- Control de acceso en agentes: el modelo recibe el estado con los permisos del usuario y la solicitud, y devuelve la probabilidad de permitir o denegar. Es adecuado porque evalúa reglas explícitas en el estado y puede incluir una opción de "solicitar más información" cuando el riesgo es alto.
- Asignación de tareas en sistemas multiagente: dado un estado con la tarea y una lista de agentes candidatos, el modelo puntúa quién debería ser el propietario. La inferencia en una sola pasada permite integrarlo en bucles de orquestación sin añadir latencia significativa.
- Validación de resultados frente a estándares: se introduce el resultado y el criterio de calidad como estado, y los candidatos son "cumple" / "no cumple" / "requiere revisión". Útil en pipelines de CI/CD o revisión automática de código.
- Decisión de escalado a humano: el agente consulta al modelo si debe resolver autónomamente o devolver la decisión a una persona, incluyendo una opción de hand-back entre los candidatos. Apropiado para flujos con stakes altos donde se quiere una salvaguarda.
- Predicción de observaciones en entornos simulados: con las reglas del entorno como system prompt y el estado/acción en JSON, el modelo genera la siguiente observación. Aplicable a simulación de agentes, testing de políticas o entornos de juego.
- Asistente local en Mac para preguntas de criterio: el modelo puede responder en una frase a preguntas como "¿cuándo debería un agente devolver una decisión a una persona?", ejecutándose en local sin enviar datos a la nube.
- Filtrado y ranking de respuestas generadas: dado un conjunto de respuestas candidatas a una pregunta, el modelo las puntúa y permite seleccionar la mejor, integrándose en pipelines de generación aumentada.

## Benchmarks y rendimiento

Los datos disponibles corresponden a JevBench (231 ítems públicos) y a la paridad con el modelo original en float32.

| Build | Tamano | JevBench (231 items) | Misma respuesta top que bf16 |
|---|---|---|---|
| MLX-6bit (recomendado) | 3,3 GB | 79,2% | 222 / 231 |
| MLX-8bit (este modelo) | 4,4 GB | 79,7% | 229 / 231 |
| MLX-4bit | 2,3 GB | 78,4% | 210 / 231 |
| MLX-bf16 | 8,2 GB | 78,8% | referencia |

En paridad con el código original de Juneo en float32 sobre CPU (Transformers 4.57.1), con 11 prompts (incluyendo uno de 3.313 tokens) y 753 posiciones evaluadas con teacher forcing, los builds coinciden en el siguiente token en el 99,6% (bf16), 98,9% (8-bit), 98,1% (6-bit) y 90,4% (4-bit) de las posiciones. No se han publicado resultados de MMLU, HumanEval, GSM8K u otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM/unified memory estimada: 4,4 GB para los pesos en 8-bit; se recomienda al menos 8 GB de memoria unificada para margen de contexto y overhead.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4, M5 en sus variantes Pro/Max/Ultra). Probado en MacBook Pro M5 Max con 128 GB.
- Cabe en GPU de consumo: sí, en cualquier Mac con Apple Silicon y al menos 8 GB de memoria unificada. No está pensado para GPUs NVIDIA (formato MLX).
- Opciones de despliegue: `mlx_lm.generate` (CLI), `mlx_lm.server` (API compatible con OpenAI), Python con `mlx-lm>=0.32`. Requiere Python 3.11 o superior. Probado con mlx 0.32.4 y mlx-lm 0.32.2.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | JevBench | Licencia | Formato |
|---|---|---|---|---|---|
| Laplace-1-Vector MLX-8bit (este) | 4,112B | no disponible | 79,7% | Apache 2.0 | MLX safetensors |
| Laplace-1-Vector MLX-6bit | 4,112B | no disponible | 79,2% | Apache 2.0 | MLX safetensors |
| Laplace-1-Vector MLX-4bit | 4,112B | no disponible | 78,4% | Apache 2.0 | MLX safetensors |
| Laplace-1-Atlas MLX-6bit | 27B (según model card) | no disponible | no disponible | Apache 2.0 | MLX safetensors |

No se dispone de datos de benchmarks de modelos comparables de otros autores en la información proporcionada.

## Limitaciones y advertencias

- Las probabilidades devueltas son relativas a los candidatos suministrados, no una probabilidad calibrada de acierto. No deben interpretarse como confianza absoluta.
- El modelo está diseñado para evaluación de decisiones, no para generación de texto libre extensa; su uso fuera de ese dominio puede degradar la calidad.
- No se dispone de información sobre sesgos conocidos, composición del dataset de entrenamiento ni evaluación de sesgos.
- Riesgo de alucinación: no evaluado en la información disponible; al predecir observaciones de entorno, puede generar JSON plausible pero incorrecto.
- Limitaciones de idioma: no se especifican los idiomas soportados; la model card está en inglés y los ejemplos usan inglés.
- Longitud de contexto: no documentada; se ha probado con prompts de hasta 3.313 tokens, pero no se garantiza un límite superior.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor de la conversión (NetProjects) no está afiliado a Juneo Lab ni a XHToken; verificar la licencia del modelo base original.
- Solo para Apple Silicon: el formato MLX no es compatible con GPUs NVIDIA ni con ecosistemas CUDA; para otros hardware habría que usar el modelo base en Transformers.
- El build de 4 bits cambia la respuesta top en aproximadamente un 9% de los ítems de JevBench respecto a bf16; para tareas de scoring se recomienda 6-bit u 8-bit.
- Requiere mlx-lm 0.32 o superior y Python 3.11 o superior; versiones anteriores no soportan la arquitectura `spark2_5`.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/netprojects/Laplace-1-Vector-MLX-8bit
- Modelo base: https://huggingface.co/JuneoAI/Laplace-1-Vector
- Build 6-bit (recomendado): https://huggingface.co/netprojects/Laplace-1-Vector-MLX-6bit
- Build 4-bit: https://huggingface.co/netprojects/Laplace-1-Vector-MLX-4bit
- Build bf16: https://huggingface.co/netprojects/Laplace-1-Vector-MLX-bf16
- Modelo hermano (27B): https://huggingface.co/netprojects/Laplace-1-Atlas-MLX-6bit
- NetProjects: https://netprojects.com
