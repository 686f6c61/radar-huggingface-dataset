# julienkay/Phi-3-mini-4k-instruct-sentis-uint8

## Resumen

Phi-3-mini-4k-instruct-sentis-uint8 es una conversión no oficial del modelo Phi-3-mini-4k-instruct de Microsoft, realizada por el desarrollador julienkay para su uso con Unity Inference Engine (anteriormente conocido como Sentis) y el paquete de Unity tools.doji.transformers. El modelo original es un transformer decoder-only de 3.800 millones de parámetros con una ventana de contexto de 4.096 tokens, diseñado por Microsoft Research para tareas de razonamiento, generación de texto y conversación.

La aportación de esta versión concreta es el formato: los pesos se han convertido desde una exportación ONNX al formato binario `.sentis` propio de Unity Inference Engine, con cuantización a uint8 de los pesos de las capas MatMul, Gemm, Conv, ConvTranspose y Gather. El resultado es un fichero de 3,56 GiB que puede cargarse directamente en el motor de inferencia de Unity sin conversión adicional, lo que permite ejecutar el modelo dentro de aplicaciones y juegos Unity en dispositivos con recursos limitados.

Es relevante para desarrolladores de Unity que necesiten integrar un LLM conversacional en tiempo de ejecución (NPCs, asistentes embebidos, generación de texto local) sin depender de servicios en la nube. No obstante, se trata de un artefacto de despliegue, no de un modelo nuevo: hereda íntegramente las capacidades y limitaciones del Phi-3-mini original, y su licencia MIT se mantiene.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-3-mini), exportado a ONNX y convertido a formato `.sentis` de Unity Inference Engine |
| Parámetros totales | 3.800 millones (modelo base Phi-3-mini-4k-instruct) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantización | uint8 (pesos de MatMul, Gemm, Conv, ConvTranspose y Gather, con una escala y un zero point por tensor); resto de pesos en float32 |
| Idiomas soportados | No disponible en la información proporcionada (el modelo base soporta principalmente inglés, con capacidades multilingües limitadas) |
| Licencia | MIT |
| Formato de pesos | `.sentis` (Unity Inference Engine); también existe versión ONNX y versión float16 en repositorios separados |
| Tamaño del repositorio | 3,8 GB (fichero `model.sentis` de 3,56 GiB) |
| Versión de Inference Engine | 2.6.1 |

## Arquitectura y entrenamiento

El modelo subyacente es Phi-3-mini-4k-instruct, un transformer decoder-only de 3.800 millones de parámetros entrenado por Microsoft Research. La model card de esta conversión no aporta detalles sobre el entrenamiento original (número de tokens, composición del dataset, uso de RLHF o DPO); esos datos deben consultarse en la model card de `microsoft/Phi-3-mini-4k-instruct`. Lo que sí documenta esta ficha es el proceso de conversión: partiendo de la exportación ONNX del mismo autor, se aplicó `OnnxModelLoader.Save(onnxPath, sentisPath, QuantizationType.Uint8)` con tools.doji.onnx-model-loader.

La innovación técnica de esta versión es el esquema de cuantización: solo los pesos de rango 2 o superior que actúan como entrada de pesos en capas MatMul, Gemm, Conv, ConvTranspose y Gather se almacenan como uint8, con una escala y un zero point por tensor. El resto de pesos permanece en float32. En el dispositivo, los pesos uint8 se desquantizan a float32 justo antes de la capa que los lee por primera vez, de modo que solo existen copias float32 de las capas que se están ejecutando en cada momento. Esto reduce el uso de memoria en comparación con una conversión float32 completa, a costa de un pequeño sobrecoste de desquantización por capa.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat compatible con el tokenizador original (`ApplyChatTemplate`).
- Razonamiento y respuesta a instrucciones, heredados del ajuste instructivo del modelo base.
- Generación de código y resolución de problemas matemáticos de complejidad moderada (capacidades del Phi-3-mini original).
- Inferencia local dentro de Unity, sin dependencia de APIs externas.
- Streaming de tokens mediante `TextStreamer` durante la generación.
- Soporte de configuración de generación (`MaxNewTokens`, `GenerationConfig`) a través de tools.doji.transformers.
- Capacidades multilingües: no disponibles en la información proporcionada para esta conversión; el modelo base está orientado principalmente al inglés.
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio en esta versión.

## Casos de uso

- NPCs conversacionales en videojuegos Unity: el modelo puede gestionar diálogos multi-turno dentro de la ventana de 4.096 tokens, ejecutándose localmente en el dispositivo del jugador y evitando latencia de red y costes de API.
- Asistentes embebidos en aplicaciones de escritorio o móviles desarrolladas con Unity: con 3,56 GiB de pesos cuantizados, es viable en equipos con suficiente memoria, ofreciendo respuestas generativas sin conexión.
- Prototipado rápido de interfaces de chat en Unity: el paquete tools.doji.transformers permite cargar el modelo con `AutoModelForCausalLM.FromPretrainedAsync` y emitir tokens por streaming, lo que acelera la iteración en el diseño de la experiencia de usuario.
- Generación de texto contextual en herramientas de autoría (editores, sandbox): descripciones, diálogos de relleno o variaciones de texto generadas en el propio editor sin salir de Unity.
- Educación y demos interactivas: aplicaciones didácticas que muestran el funcionamiento de un LLM en local, con control total sobre los datos y sin enviar prompts a servidores externos.
- Investigación sobre inferencia en el borde (edge inference): banco de pruebas para medir latencia, consumo de memoria y calidad de la cuantización uint8 en el motor de Unity frente a otras configuraciones (ONNX, float16).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de esta conversión no incluye métricas de calidad (MMLU, HumanEval, GSM8K) ni de rendimiento (latencia, throughput) para la versión uint8 en Unity Inference Engine. Cualquier cifra de calidad debería referenciarse al modelo base `microsoft/Phi-3-mini-4k-instruct`, pero no se aporta en la información proporcionada, por lo que no se reproduce aquí.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: el fichero de pesos ocupa 3,56 GiB; durante la ejecución se generan copias float32 de las capas activas, por lo que el pico de memoria es superior al tamaño del fichero. No se dispone de una cifra exacta de pico en la información proporcionada.
- GPU recomendadas: no disponibles en la información proporcionada. El motor Unity Inference Engine soporta ejecución en GPU y CPU, pero la model card no especifica hardware objetivo ni mínimos.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; el tamaño de pesos sugiere que requiere GPUs con al menos 6-8 GB de memoria libre, pero es una estimación no verificada.
- Opciones de despliegue: Unity Inference Engine 2.6.1 o superior (el fichero puede requerir reconversión desde ONNX con versiones posteriores del motor); paquete tools.doji.transformers para la API de tokenizador y generación; alternativamente, la versión ONNX o float16 del mismo autor para otros entornos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Phi-3-mini-4k-instruct-sentis-uint8 (este) | 3,8 B | 4.096 | `.sentis` uint8 | MIT | Hugging Face (julienkay) |
| Phi-3-mini-4k-instruct-sentis-float16 | 3,8 B | 4.096 | `.sentis` float16 | MIT | Hugging Face (julienkay) |
| Phi-3-mini-4k-instruct-onnx | 3,8 B | 4.096 | ONNX | MIT | Hugging Face (julienkay) |
| microsoft/Phi-3-mini-4k-instruct (original) | 3,8 B | 4.096 | safetensors | MIT | Hugging Face (Microsoft) |

La comparativa se limita a las variantes del mismo modelo base, ya que la información proporcionada no incluye datos de rendimiento que permitan contrastarlo con otros modelos de tamaño similar (por ejemplo, Llama 3.2 3B o Qwen2.5 3B). La diferencia entre las variantes es exclusivamente el formato y el esquema de cuantización; las capacidades del modelo son idénticas en teoría.

## Limitaciones y advertencias

- Es una conversión no oficial: el autor no es Microsoft y no hay garantía de equivalencia numérica exacta con el modelo original.
- La cuantización uint8 introduce pérdida de precisión respecto a float16 o float32; no se documenta la magnitud de esa degradación en la información disponible.
- El fichero fue guardado con Unity Inference Engine 2.6.1; versiones posteriores del motor pueden requerir reconversión desde el ONNX original.
- Ventana de contexto limitada a 4.096 tokens, insuficiente para documentos largos o conversaciones muy extensas.
- Idiomas soportados no documentados en esta conversión; el modelo base está orientado principalmente al inglés.
- Riesgo de alucinación inherente a los LLM de este tamaño; no se han publicado evaluaciones de fidelidad para esta versión.
- Sesgos conocidos del modelo base no documentados en la información proporcionada; deben consultarse en la model card de Microsoft.
- Sin soporte documentado de tool calling, agentes, visión o audio.
- La licencia MIT del modelo base se mantiene, pero el uso comercial debe verificar los términos del modelo original y de las dependencias (Unity Inference Engine, tools.doji.transformers).
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/julienkay/Phi-3-mini-4k-instruct-sentis-uint8
- Versión ONNX: https://huggingface.co/julienkay/Phi-3-mini-4k-instruct-onnx
- Versión Sentis float16: https://huggingface.co/julienkay/Phi-3-mini-4k-instruct-sentis-float16
- Modelo base: https://huggingface.co/microsoft/Phi-3-mini-4k-instruct
- Documentación de Unity Inference Engine: https://docs.unity3d.com/Packages/com.unity.ai.inference@latest
- Paquete tools.doji.transformers: https://github.com/julienkay/tools.doji.transformers
- Herramienta de conversión tools.doji.onnx-model-loader: https://github.com/julienkay/tools.doji.onnx-model-loader
