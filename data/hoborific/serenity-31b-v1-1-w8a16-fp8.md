# hoborific/Serenity-31B-v1.1-W8A16-FP8

## Resumen

Serenity-31B-v1.1-W8A16-FP8 es una versión cuantizada del modelo ReadyArt/Serenity-31B-v1.1, publicada por el usuario hoborific. El modelo original es un transformer multimodal de 31.273 millones de parámetros con arquitectura gemma4_text, que incorpora una torre de visión y está orientado a tareas conversacionales, instruct y roleplay. Esta variante aplica una cuantización offline W8A16 en formato FP8 (float8_e4m3fn) mediante la librería compressed-tensors, con el objetivo de reducir el uso de memoria y acelerar la inferencia en motores como vLLM, especialmente sobre hardware Intel XPU.

La relevancia de esta ficha radica en que la cuantización no solo reduce el tamaño del checkpoint a 33.3 GB, sino que mantiene las activaciones en bf16/fp16 y cuantiza únicamente los pesos de las proyecciones lineales (atención y MLP), dejando embeddings, normas, lm_head, routers y la torre de visión en precisión completa. Esto la convierte en una opción práctica para desplegar un modelo de 31B en entornos con memoria limitada, siempre que se utilice un backend compatible con los kernels W8A16-FP8 de vLLM.

El modelo se distribuye en formato safetensors y está pensado para su uso con vLLM en plataformas Intel XPU o NVIDIA CUDA (SM75+). No se han publicado resultados de benchmarks en la información disponible, por lo que su rendimiento cuantitativo debe evaluarse en función de la calidad del modelo base y de las pruebas propias del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | gemma4_text (transformer multimodal con torre de visión) |
| Parametros totales | 31.273.088.876 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W8A16 FP8 (float8_e4m3fn) con escalas por canal de salida |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (compressed-tensors, float-quantized) |

## Arquitectura y entrenamiento

El modelo base Serenity-31B-v1.1 emplea una arquitectura gemma4_text con 60 capas transformer, un tamaño oculto de 5376, 32 cabezas de consulta y 16 cabezas de clave/valor (grouped-query attention), y un tamaño intermedio de feed-forward de 21504. Al ser multimodal, incluye una torre de visión que permite procesar entradas de imagen y texto, lo que lo clasifica como un modelo image-text-to-text.

La cuantización aplicada en esta versión es offline y utiliza el formato W8A16 FP8 de compressed-tensors: los pesos se almacenan en float8_e4m3fn con escalas simétricas por canal de salida, mientras que las activaciones se mantienen en bf16/fp16. Para cada capa lineal, se calcula una escala inicial basada en `amax / 448` y se refina mediante una búsqueda de error cuadrático medio sobre aproximadamente 9 fracciones de clip (0.8–1.0× amax), seleccionando la escala con menor error por fila. Solo se cuantizan las proyecciones lineales 2D (q/k/v/o y gate/up/down del MLP); el resto de componentes (embeddings, normas, lm_head, routers/experts y la torre de visión) permanecen en bf16 y se listan en la lista de ignorados del checkpoint para que vLLM no los modifique.

No se dispone de información sobre los datos de entrenamiento del modelo base, el número de tokens procesados ni si se aplicaron técnicas de alineación como RLHF o DPO.

## Capacidades

- Generación de texto conversacional e instructivo, orientado a tareas de roleplay y diálogo.
- Procesamiento multimodal: al incluir una torre de visión, puede recibir imágenes como entrada adicional al texto.
- Inferencia eficiente en hardware compatible gracias a la cuantización W8A16 FP8, que reduce el ancho de banda de memoria necesario.
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no especificadas; se recomienda verificar el modelo base.

## Casos de uso

- Despliegue de un asistente conversacional en servidores con aceleradores Intel XPU: el kernel `XPUW8A16FP8LinearKernel` está diseñado específicamente para esta plataforma, permitiendo ejecutar un modelo de 31B con menor huella de memoria.
- Aplicaciones de roleplay y narrativa interactiva: el modelo base está etiquetado como conversational y roleplay, por lo que puede usarse para generar personajes y diálogos coherentes en entornos de ficción.
- Sistemas de chat multimodal en producción: gracias a la torre de visión, puede combinar imágenes y texto en un mismo flujo de conversación, por ejemplo para describir o comentar fotografías.
- Inferencia en GPUs NVIDIA con arquitectura Turing o superior (SM75+): vLLM ofrece kernels `HummingFP8ScaledMMLinearKernel` o `MarlinFP8ScaledMMLinearKernel` que aprovechan la cuantización FP8, reduciendo el consumo de VRAM frente a una versión sin cuantizar.
- Prototipado rápido con vLLM en entornos de desarrollo: al ser un checkpoint compatible con endpoints de vLLM, se puede integrar en pipelines de inferencia existentes sin cambios en el código.
- Evaluación de la calidad de cuantización W8A16 frente a otras estrategias (por ejemplo, FP8 per-tensor de vLLM): el autor documenta un esquema de escalado por canal con búsqueda de clip que puede servir como referencia para comparaciones técnicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de puntuaciones de MMLU, HumanEval, GSM8K u otras pruebas estándar para esta versión cuantizada ni para el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 33.3 GB en disco; con la cuantización FP8, los pesos ocupan aproximadamente 31.3 GB (1 byte por parámetro), más overhead de activaciones y memoria intermedia. Se recomienda al menos 40 GB de VRAM para una ejecución cómoda.
- GPUs recomendadas: NVIDIA A100 40GB/80GB, H100, o cualquier GPU con 40 GB o más de memoria. En GPUs de consumo como la RTX 4090 (24 GB) no cabe el modelo completo en memoria; se necesitaría particionado o descarga parcial, lo que no es compatible con la mayoría de los kernels de vLLM.
- Compatibilidad con Intel XPU: es la plataforma objetivo principal, con soporte específico en vLLM.
- Opciones de despliegue: vLLM (versión con soporte para compressed-tensors y kernels W8A16-FP8). No es compatible con llama.cpp, Ollama ni TGI en su formato actual, ya que estos requieren GGUF u otros formatos.
- Latencia y throughput: no disponibles. Dependerán del hardware, del número de peticiones concurrentes y de la longitud de contexto utilizada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Plataforma objetivo | Licencia |
|---|---|---|---|---|---|
| hoborific/Serenity-31B-v1.1-W8A16-FP8 | 31.3B | no disponible | W8A16 FP8 | vLLM (Intel XPU, NVIDIA SM75+) | no disponible |
| ReadyArt/Serenity-31B-v1.1 (base) | 31.3B | no disponible | sin cuantizar (bf16) | cualquier framework compatible con transformers | no disponible |
| ReadyArt/Serenity-31B-v1.1-GGUF | 31.3B | no disponible | GGUF (varias) | llama.cpp, Ollama, TGI | no disponible |
| hoborific/G4-MeroMero-v2-31B-W8A16-FP8 | 31.3B (estimado) | no disponible | W8A16 FP8 | vLLM (misma familia) | no disponible |

La comparativa se limita a variantes del mismo modelo base y a otro modelo cuantizado del mismo autor. No se dispone de información sobre modelos alternativos de la misma categoría (por ejemplo, otros gemma4 de 31B) para establecer una comparación más amplia.

## Limitaciones y advertencias

- La licencia del modelo no está disponible, por lo que se desconoce si permite uso comercial o tiene restricciones específicas. Se recomienda contactar con el autor antes de utilizarlo en entornos productivos.
- El soporte de backends es restringido: no funciona en ROCm, CPU ni TPU. Intentar cargarlo en estas plataformas con vLLM producirá un error de kernel no disponible.
- La cuantización solo cubre los pesos de las proyecciones lineales; la torre de visión y otros componentes permanecen en bf16, lo que puede limitar la reducción total de memoria en aplicaciones multimodales.
- No se han publicado benchmarks ni evaluaciones de calidad; el rendimiento real debe medirse en el caso de uso concreto.
- Los idiomas soportados no están especificados; el modelo base puede tener cobertura limitada fuera del inglés o de lenguas mayoritarias.
- Al ser un modelo generativo, existe riesgo de alucinaciones y de generar contenido sesgado o inapropiado, especialmente en tareas de roleplay donde la libertad creativa es alta.
- La longitud de contexto no se ha documentado; es necesario verificar el límite real del modelo base para evitar errores de truncamiento.

## Enlaces

- Modelo cuantizado: https://huggingface.co/hoborific/Serenity-31B-v1.1-W8A16-FP8
- Modelo base: https://huggingface.co/ReadyArt/Serenity-31B-v1.1
- Versión GGUF del modelo base: https://huggingface.co/ReadyArt/Serenity-31B-v1.1-GGUF
- Información de arquitectura (hfviewer): https://hfviewer.com/ReadyArt/Serenity-31B-v1.1
- Otro modelo del mismo autor con cuantización similar: https://huggingface.co/hoborific/G4-MeroMero-v2-31B-W8A16-FP8
- Repositorio de compressed-tensors: https://github.com/neuralmagic/compressed-tensors
