# hell0ks/gemma-4-26B-A4B-it-multitool-FP8

## Resumen

Gemma 4 26B A4B IT Multitool FP8 es una cuantización en FP8 de un ajuste fino (SFT) sobre Gemma 4 26B A4B IT, el modelo multimodal de Google con arquitectura Mixture-of-Experts (MoE) y 25.805.936.206 parámetros totales. El ajuste lo publica el usuario hell0ks y su objetivo declarado es corregir el comportamiento "perezoso" del modelo base en el uso de herramientas: Gemma 4 tendía a priorizar su conocimiento interno frente a la búsqueda y a evitar llamadas múltiples a funciones dentro de una misma tarea. El resultado es un checkpoint orientado a flujos de tool calling y agentes.

La receta de entrenamiento es un LoRA SFT de 1.500 muestras derivadas del dataset stepfun-ai/Step-3.5-Flash-SFT, con una mezcla deliberada que dedica el 50% de las muestras a llamadas adicionales tras un resultado de herramienta. El checkpoint publicado corresponde al 75% de la fuerza de mezcla del adaptador, tras comprobar que el 100% degradaba el rendimiento en Tool-Eval-Bench y el 50% seguía siendo demasiado conservador.

El interés práctico de esta ficha está en que empaqueta ese ajuste en FP8 dinámico con compressed-tensors para servir en vLLM, manteniendo entrada de texto e imagen y salida de texto. La licencia es doble (Apache 2.0 y CC-BY-NC 2.0), heredada del dataset utilizado, lo que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4, Mixture-of-Experts (MoE) |
| Parametros totales | 25.805.936.206 |
| Parametros activos | 4B (según la denominación A4B del modelo base) |
| Longitud de contexto | hasta 256K tokens (modelo base Gemma 4) |
| Tipos de cuantizacion | FP8 (pesos y activaciones, dinámico, compressed-tensors); el modelo base admite otras cuantizaciones no detalladas |
| Idiomas soportados | más de 140 idiomas en el modelo base; no se documenta el efecto del ajuste sobre idiomas |
| Licencia | Apache 2.0 y CC-BY-NC 2.0 (licencia doble, heredada del dataset) |
| Formato de pesos | safetensors (compressed-tensors, FP8 dinámico) |

## Arquitectura y entrenamiento

El modelo base es Gemma 4 26B A4B IT, un transformer con arquitectura Mixture-of-Experts de 26B parámetros totales y aproximadamente 4B activos por token, con soporte multimodal de entrada (texto e imagen) y salida de texto. Google lo distribuye en cinco tamaños (E2B, E4B, 12B, 26B A4B y 31B) con ventana de contexto de hasta 256K tokens y cobertura de más de 140 idiomas.

Sobre esa base, hell0ks aplica un LoRA SFT con Unsloth Studio sobre 1.500 muestras del dataset stepfun-ai/Step-3.5-Flash-SFT. La preparación incluye normalización de mensajes, definiciones de herramientas, argumentos e identificadores de llamada, eliminación de duplicados, validación de esquemas de argumentos y una revisión de calidad asistida por modelo (GPT-6 Luna, configuración Low). La mezcla de datos es explícita: 20% primeras llamadas a herramienta (300 muestras), 50% llamadas posteriores tras un resultado de herramienta (750), 20% respuesta final o cierre de tarea (300) y 10% sin llamada o con aclaración (150). El checkpoint publicado es la mezcla al 75% del adaptador. Esta versión FP8 aplica cuantización dinámica de pesos y activaciones con compressed-tensors, pensada para inferencia en vLLM.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, heredados de Gemma 4 26B A4B IT.
- Entrada multimodal de imagen y texto con salida de texto (pipeline image-text-to-text).
- Tool calling y function calling, con énfasis específico en llamadas encadenadas tras recibir el resultado de una herramienta.
- Mayor propensión a invocar herramientas de búsqueda en lugar de responder solo con conocimiento paramétrico, respecto al modelo original.
- Soporte de agentes y razonamiento multi-paso dentro de un mismo turno, con múltiples llamadas a funciones.
- Capacidades multilingües del modelo base (más de 140 idiomas), si bien el ajuste se entrenó con un dataset cuya composición lingüística no se detalla.
- Modo de razonamiento más extenso antes de invocar herramientas, efecto secundario documentado del ajuste.
- Generación de código y matemáticas como capacidades heredadas del modelo base; no se aportan métricas específicas tras el ajuste.

## Casos de uso

- Agentes de búsqueda web: el ajuste está diseñado para que el modelo prefiera consultar una herramienta de búsqueda antes que responder de memoria, lo que encaja en pipelines de retrieval y verificación de hechos.
- Automatización de atención al cliente con herramientas: gestión de conversaciones multi-turno con acceso a APIs de pedidos, devoluciones o estado de cuenta, aprovechando la ventana de hasta 256K tokens del modelo base para arrastrar historial largo.
- Orquestación multi-herramienta en una sola tarea: por ejemplo, consultar inventario, comprobar precios y generar una cotización encadenando varias llamadas, escenario que el 50% de la mezcla de entrenamiento refuerza explícitamente.
- Asistentes sobre documentación técnica con imagen: al aceptar entrada de imagen, puede procesar capturas de pantalla o diagramas junto a texto y decidir si necesita una herramienta adicional para completar la respuesta.
- Backends de agentes en producción sobre vLLM: el formato FP8 con compressed-tensors está pensado para servirse en vLLM, lo que facilita integrarlo en infraestructura de inferencia existente con soporte de tool calling.
- Prototipado de flujos agénticos con evaluación reproducible: el autor publica resultados con Tool-Eval-Bench, lo que permite usar el modelo como referencia en pruebas comparativas de uso de herramientas.
- Extracción y normalización de datos estructurados vía funciones: definición de esquemas de argumentos y llamadas a funciones para convertir texto libre o imágenes en registros estructurados.

## Benchmarks y rendimiento

El autor publica resultados en Tool-Eval-Bench con inferencia FP8 y parámetros de muestreo idénticos entre variantes. Los porcentajes indican la fuerza de mezcla del mismo adaptador LoRA entrenado.

| Modelo | Puntuación /100 | Puntos brutos /136 | Fallos por límite de razonamiento |
|---|---:|---:|---:|
| Original | 83 | 113 | 0 |
| LoRA 100% | 72 | 98 | 10 |
| LoRA 50% | 84 | 114 | 2 |
| LoRA 75% (este checkpoint) | 83 | 113 | 3 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar para este checkpoint.

## Requisitos de hardware

- El repositorio ocupa 27,2 GB en safetensors FP8, por lo que la VRAM mínima para cargar los pesos ronda los 27-28 GB, más el espacio para caché KV y activaciones.
- Con contexto de 256K tokens la caché KV crece de forma significativa; para ventanas largas se recomienda hardware con 80 GB o más por GPU (A100 80GB, H100 80GB) o despliegue multi-GPU con tensor parallelism.
- En GPUs de consumo, una RTX 4090 (24 GB) no permite cargar el checkpoint FP8 completo; sería necesario recurrir a cuantizaciones adicionales de menor precisión no incluidas en este repositorio.
- El formato compressed-tensors FP8 dinámico está orientado a vLLM como motor de inferencia principal.
- No se dispone de datos de latencia ni throughput medidos en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hell0ks/gemma-4-26B-A4B-it-multitool-FP8 | 25,8B totales, ~4B activos | hasta 256K (base) | Tool calling agresivo, multimodal, FP8 para vLLM | Apache 2.0 + CC-BY-NC 2.0 | Hugging Face, 0 descargas |
| hell0ks/gemma-4-26B-A4B-it-multitool | 25,8B totales, ~4B activos | hasta 256K (base) | Mismo ajuste en precisión original | Apache 2.0 + CC-BY-NC 2.0 | Hugging Face |
| google/gemma-4-26B-A4B-it | 25,8B totales, ~4B activos | hasta 256K | Modelo base instruct multimodal | Términos de Gemma (no detallados aquí) | Hugging Face |
| trohrbaugh/gemma-4-26B-A4B-it-heretic-ara | 25,8B totales, ~4B activos | hasta 256K (base) | Variante del modelo base usada como punto de partida | no disponible | Hugging Face |

## Limitaciones y advertencias

- El propio autor describe el resultado como "mixto": el modelo ahora invoca más herramientas, pero razona durante más tiempo antes de hacerlo, lo que incrementa la latencia en flujos agénticos.
- La mezcla al 100% del adaptador degradó la puntuación de Tool-Eval-Bench de 83 a 72 y provocó 10 fallos por límite de razonamiento; el checkpoint publicado (75%) mantiene 3 fallos frente a los 0 del original.
- El ajuste se entrenó con solo 1.500 muestras y una revisión de calidad asistida por modelo, lo que limita la cobertura de dominios y esquemas de herramientas no representados en el dataset.
- La licencia es doble (Apache 2.0 y CC-BY-NC 2.0) por herencia del dataset stepfun-ai/Step-3.5-Flash-SFT; la cláusula no comercial condiciona el uso en producción comercial y debe revisarse antes de desplegar.
- El autor no documenta la composición lingüística del dataset de ajuste ni evalúa el impacto del SFT sobre los más de 140 idiomas del modelo base.
- Riesgo de alucinación inherente al modelo base; el ajuste mitiga parcialmente la preferencia por el conocimiento paramétrico, pero no la elimina.
- No hay métricas publicadas de calidad general (MMLU, HumanEval, GSM8K) tras el ajuste, solo de uso de herramientas.
- El checkpoint tiene 0 descargas y 0 likes en el momento de la consulta, sin validación independiente por parte de la comunidad.
- El formato FP8 dinámico con compressed-tensors limita los motores de inferencia compatibles; no se distribuyen pesos GGUF en este repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hell0ks/gemma-4-26B-A4B-it-multitool-FP8
- Versión sin cuantizar del ajuste: https://huggingface.co/hell0ks/gemma-4-26B-A4B-it-multitool
- Modelo base de Google: https://huggingface.co/google/gemma-4-26B-A4B-it
- Modelo de partida del ajuste: https://huggingface.co/trohrbaugh/gemma-4-26B-A4B-it-heretic-ara
- Dataset de SFT: https://huggingface.co/datasets/stepfun-ai/Step-3.5-Flash-SFT
- Herramienta de evaluación: https://github.com/SeraphimSerapis/tool-eval-bench
