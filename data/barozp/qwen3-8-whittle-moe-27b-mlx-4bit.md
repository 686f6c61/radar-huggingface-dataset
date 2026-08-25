# barozp/Qwen3.8-Whittle-MoE-27B-MLX-4bit

## Resumen

Qwen3.8-Whittle-MoE-27B-MLX-4bit es una conversión a formato MLX con cuantización de 4 bits del modelo MoE post-hoc Qwen3.8-Whittle-MoE-27B-A17.8B, desarrollado por logic65 a partir del modelo denso Qwen3.8-27B de Alibaba. El modelo original aplica una técnica de poda de expertos (expert pruning) denominada Whittle: cada capa FFN densa de 17 408 unidades se particiona en 64 "slivers" de experto enrutados de ancho 192 más un experto compartido de ancho 5120, con un router que selecciona 16 de los 64 slivers por token. Esto da como resultado un MoE con 17 800 millones de parámetros activos de un total de 27 000 millones.

La conversión MLX, realizada por barozp, está optimizada para Apple Silicon y permite ejecutar el modelo en hardware de Apple con memoria unificada. El modelo conserva la licencia Apache 2.0 del original y se distribuye en formato safetensors cuantizado a 4 bits con group size 64. Es relevante porque ofrece una alternativa eficiente en memoria a un modelo denso de 27B, manteniendo capacidades de razonamiento y generación de texto, aunque sin soporte multimodal en esta versión MLX (el modelo base Qwen3.8-27B sí es multimodal nativo, pero esta conversión es solo texto).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE post-hoc (expert pruning) sobre transformer denso; 64 expertos enrutados + 1 experto compartido por capa, top-16 routing |
| Parametros totales | 27 000 millones (27B) |
| Parametros activos | 17 800 millones (17.8B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (group_size=64, affine) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors) cuantizado 4-bit |

## Arquitectura y entrenamiento

El modelo parte del denso Qwen3.8-27B de Alibaba. Sobre este, logic65 aplicó la técnica Whittle: cada FFN densa (ancho 17 408) se dividió en 64 slivers de experto de ancho 192 y un experto compartido de ancho 5120. Un router pequeño selecciona 16 de los 64 slivers por token, resultando en 17.8B activos de 27B totales. Tras el tallado inicial, que obtuvo solo 4/39 en una batería de conocimiento, se entrenaron únicamente los routers (router healing), recuperando 27/39. La versión v2.1 añade entrenamiento anti-loop (245 respuestas completas del profesor con top-32 logprobs) y una época de balanceo, reduciendo la tasa de loops de un solo turno del 69% al 8% y los fallos de salida estructurada del 75% al 22%, con una batería de conocimiento de 28/39.

La conversión MLX se realizó directamente desde los pesos bf16 safetensors (no desde GGUF) con `mlx_lm.convert`, usando 4 bits con group_size=64. El modelo no incluye cabeza MTP (`mtp_layers: 0`), por lo que la decodificación especulativa MTPLX no es aplicable; la generación es puramente autorregresiva.

## Capacidades

- Generación de texto y chat conversacional en modo texto.
- Razonamiento paso a paso (el modelo base Qwen3.8-27B está entrenado para razonamiento, aunque esta conversión no expone un modo "thinking" explícito).
- Ejecución local eficiente en Apple Silicon gracias a la cuantización MLX 4-bit.
- Inferencia autorregresiva estándar sin decodificación especulativa.
- No incluye capacidades multimodales (visión, audio) en esta versión MLX; el modelo base denso sí las tiene, pero la conversión es solo texto.
- No se documenta soporte explícito de tool calling o function calling en la model card.

## Casos de uso

- Chatbots y asistentes conversacionales en local: el modelo puede ejecutarse en un Mac con memoria unificada de 16 GB o más, ofreciendo respuestas de texto con razonamiento básico sin depender de la nube.
- Prototipado rápido de aplicaciones de generación de texto: gracias al formato MLX y al servidor compatible con OpenAI (`mlx_lm.server`), se puede integrar en entornos de desarrollo locales para pruebas de concepto.
- Investigación sobre eficiencia de MoE: al ser un MoE post-hoc con router healing, sirve como caso de estudio para técnicas de poda de expertos y recuperación de rendimiento.
- Generación de texto en entornos con restricciones de memoria: los 15.2 GB del repositorio en 4-bit permiten cargar el modelo en hardware de gama media de Apple, donde un denso de 27B en bf16 no cabría.
- Automatización de tareas de redacción y resumen: el modelo puede generar contenido coherente en inglés y otros idiomas (aunque no se especifican), adecuado para borradores y resúmenes.
- Evaluación comparativa de cuantizaciones: al existir versiones hermanas en bf16 y GGUF, permite comparar el impacto de la cuantización MLX 4-bit frente a otros formatos en tareas de generación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card reporta métricas internas de la versión v2.1 del modelo fuente:

| Metrica | Valor |
|---|---|
| Batería de conocimiento (tras router healing) | 27/39 |
| Batería de conocimiento (v2.1) | 28/39 |
| Tasa de loop de un solo turno (v2.1) | 8% (desde 69%) |
| Fallos de salida estructurada (v2.1) | 22% (desde ~75%) |

Estos datos corresponden al modelo bf16 original; la conversión MLX 4-bit puede presentar degradaciones adicionales por cuantización, no cuantificadas en la documentación.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 15.2 GB en disco; en memoria unificada de Apple, se recomienda un mínimo de 16 GB de RAM para cargar el modelo con margen para el contexto y la generación.
- GPU recomendadas: Apple Silicon con al menos 16 GB de memoria unificada (M1 Pro/Max, M2 Pro/Max, M3/M4 series). No está diseñado para GPUs NVIDIA/AMD convencionales, aunque la conversión se realizó en un entorno con backend CUDA de MLX.
- En consumer GPU: no aplicable directamente; el formato MLX está orientado a Apple Silicon. Para GPUs NVIDIA se recomienda usar las versiones GGUF o bf16.
- Opciones de despliegue: `mlx_lm.generate` para generación por línea de comandos, `mlx_lm.server` para un servidor compatible con OpenAI. También puede integrarse en aplicaciones Python mediante la librería `mlx-lm`.
- Latencia y throughput: no disponibles. Al ser un MoE con 17.8B activos, la velocidad dependerá de la memoria unificada y del ancho de banda del chip; sin datos publicados, no se puede estimar con precisión.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-Whittle-MoE-27B-MLX-4bit (este) | 27B | 17.8B | no disponible | Apache 2.0 | MLX 4-bit |
| Qwen3.8-27B (denso original) | 27B | 27B | no disponible | Apache 2.0 | Denso, multimodal |
| logic65/Qwen3.8-Whittle-MoE-27B-A17.8B (bf16) | 27B | 17.8B | no disponible | Apache 2.0 | Safetensors bf16 |
| logic65/Qwen3.8-Whittle-MoE-27B-A17.8B-GGUF | 27B | 17.8B | no disponible | Apache 2.0 | GGUF |

La comparativa se limita a las variantes del mismo modelo, ya que no se dispone de datos de otros MoE comparables en la información proporcionada. La ventaja principal de esta versión MLX es su eficiencia en Apple Silicon frente al denso original, a costa de una posible pérdida de calidad por cuantización y la ausencia de capacidades multimodales.

## Limitaciones y advertencias

- El modelo es solo texto; no hereda las capacidades multimodales del Qwen3.8-27B denso original.
- No incluye cabeza MTP, por lo que no hay decodificación especulativa; la generación es más lenta que en versiones con MTP.
- La cuantización 4-bit puede degradar la calidad de salida en tareas complejas de razonamiento o generación de código, aunque no se han publicado evaluaciones específicas.
- El modelo fuente presenta una tasa de loop de un solo turno del 8% y un 22% de fallos en salida estructurada, lo que indica que puede repetir contenido o producir formatos incorrectos en algunos casos.
- No se documentan los idiomas soportados; se asume que hereda los del modelo base Qwen3.8-27B, pero no está confirmado.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar los términos del modelo base original (Qwen3.8-27B) por si hubiera restricciones adicionales.
- El contexto máximo no está especificado; se desconoce si la conversión MLX mantiene la longitud de contexto del modelo base.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/barozp/Qwen3.8-Whittle-MoE-27B-MLX-4bit
- Modelo fuente bf16: https://huggingface.co/logic65/Qwen3.8-Whittle-MoE-27B-A17.8B
- Versión GGUF: https://huggingface.co/logic65/Qwen3.8-Whittle-MoE-27B-A17.8B-GGUF
- Modelo base denso: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GitHub de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Repositorio GitHub de la serie Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Documento de hallazgos Whittle: https://huggingface.co/logic65/Qwen3.8-Whittle-MoE-27B-A17.8B/blob/main/WHITTLE_FINDINGS.md
