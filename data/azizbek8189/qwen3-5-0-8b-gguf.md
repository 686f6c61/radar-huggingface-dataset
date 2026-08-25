# Azizbek8189/Qwen3.5-0.8B-GGUF

## Resumen

Qwen3.5-0.8B es el modelo más pequeño de la serie Qwen3.5 de Alibaba Cloud, un modelo causal de lenguaje con encoder de visión que integra capacidades multimodales (imagen y texto) en un paquete de solo 0,8 mil millones de parámetros. El repositorio Azizbek8189/Qwen3.5-0.8B-GGUF proporciona los pesos cuantizados en formato GGUF generados con Unsloth Dynamic 2.0, pensados para ejecución local eficiente en CPU y GPU de consumo. Su relevancia actual radica en combinar una ventana de contexto nativa de 262.144 tokens, soporte para 201 idiomas y arquitectura híbrida de última generación (Gated Delta Networks + MoE) en un modelo que cabe en dispositivos edge.

La arquitectura es una evolución de Qwen3, con un layout de 6 bloques compuestos por 3 subcapas de Gated DeltaNet seguidas de FFN y una subcapa de Gated Attention con FFN. El entrenamiento incluye fases de pre-entrenamiento y post-entrenamiento, con RL escalado a millones de agentes y soporte para aprendizaje multimodal con eficiencia casi total. La licencia Apache-2.0 permite uso comercial sin restricciones, lo que lo convierte en una opción atractiva para prototipado, fine-tuning específico y despliegue en dispositivos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal LM con vision encoder, híbrida: Gated DeltaNet (linear attention) + Gated Attention + FFN + MoE sparse |
| Parametros totales | 752.393.024 (0,8B) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (nativa) |
| Tipos de cuantizacion | GGUF (Unsloth Dynamic 2.0); tipos específicos no listados |
| Idiomas soportados | 201 idiomas y dialectos |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (repo); safetensors (modelo base) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura híbrida que combina atención lineal y atención clásica. El layout es `6 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN))`, con hidden dimension de 1024, 24 capas, token embedding de 248320 (padded) y salida LM atada al embedding. La Gated DeltaNet usa 16 cabezas de atención lineal para V y 16 para QK con dimensión de cabeza 128, mientras que la Gated Attention usa 8 cabezas Q y 2 KV con dimensión 256 y RoPE de 64. El FFN tiene dimensión intermedia de 3584. Además se menciona MTP (multi-token prediction) entrenado con multi-steps.

El entrenamiento se realizó en dos etapas: pre-entrenamiento y post-entrenamiento, con un enfoque de RL escalado a millones de agentes con distribuciones de tareas progresivamente complejas. La integración multimodal se logró mediante fusión temprana de tokens de imagen durante el pre-entrenamiento, alcanzando una eficiencia de entrenamiento multimodal cercana al 100% comparada con solo texto. No se especifica el tamaño del dataset ni el número total de tokens de entrenamiento.

## Capacidades

- Generación de texto multimodal: procesa entradas de imagen y texto para generar respuestas textuales, descripciones, razonamiento visual y tareas de visión-lenguaje.
- Razonamiento y modo de pensamiento: la tabla de benchmarks distingue entre "Non-Thinking Mode" y modo de pensamiento, lo que indica soporte para razonamiento multi-step con cadena de pensamiento.
- Soporte multilingüe amplio: 201 idiomas y dialectos con comprensión cultural y regional, superando a la mayoría de modelos de su tamaño.
- Capacidades de agente y razonamiento: la serie Qwen3.5 se describe con mejoras en agentes y razonamiento, aunque no se detalla tool calling explícito para este tamaño.
- Generación de código y matemáticas: el modelo puede generar y completar código y resolver problemas matemáticos, aunque con menor precisión que modelos más grandes de la serie.
- Compresión de contexto: la ventana de 262K tokens permite procesar documentos largos, libros completos o conversaciones multi-turno extensas.

## Casos de uso

- **Despliegue en dispositivos edge**: su tamaño de 0,8B y cuantización GGUF permiten ejecución en smartphones, Raspberry Pi y dispositivos IoT para asistentes locales sin conexión a la nube.
- **Prototipado y experimentación**: los desarrolladores pueden iterar rápidamente sobre ideas de agentes conversacionales o sistemas RAG con contexto largo sin necesidad de GPUs de alta gama.
- **Fine-tuning específico de dominio**: gracias a su pequeño tamaño y licencia Apache-2.0, se puede ajustar con Unsloth en una sola GPU consumer para tareas como clasificación de tickets, extracción de datos o análisis de documentos.
- **Asistente de visión en entornos con recursos limitados**: para descripción de imágenes, OCR y respuesta a preguntas visuales en aplicaciones móviles o sistemas embebidos, aprovechando el encoder de visión integrado.
- **Traducción y comprensión multilingüe en tiempo real**: con soporte de 201 idiomas, puede actuar como traductor o asistente multilingüe en aplicaciones de atención al cliente con contexto largo.
- **Agente conversacional con memoria extendida**: la ventana de 262K tokens permite mantener conversaciones largas con historial completo, útil para chatbots de soporte que necesitan recordar interacciones previas.
- **Análisis de documentos largos con visión**: combinando la entrada de imagen y el contexto extenso, puede procesar libros escaneados, contratos o informes con tablas y figuras, generando resúmenes o extrayendo datos.

## Benchmarks y rendimiento

La información disponible incluye resultados de MMLU-Pro en modo no-thinking de la model card oficial, pero el valor para Qwen3.5-0.8B aparece truncado en el extracto. Los datos disponibles son:

| Modelo | MMLU-Pro (non-thinking) |
|---|---|
| Qwen3-4B-2507 | 69,6 |
| Qwen3-1.7B | 40,2 |
| Qwen3.5-2B | 55,3 |
| Qwen3.5-0.8B | no disponible |

No se han publicado otros benchmarks (HumanEval, GSM8K, etc.) en la información proporcionada. Fuentes externas como Codersera indican que el modelo tiene buena capacidad de recall pero precisión débil en tareas de código, recomendando Qwen3.5-4B para programación.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 2 GB con cuantización GGUF (según estimaciones de free2aitools), lo que lo hace apto para GPUs de consumo como RTX 3060, RTX 4060 o incluso integradas.
- GPUs recomendadas: cualquier GPU con 2-4 GB de VRAM (RTX 3060, RTX 4060, GTX 1660) para inferencia; para fine-tuning con Unsloth se recomienda al menos 8 GB de VRAM.
- Soporte en CPU: el formato GGUF permite ejecución en CPU con llama.cpp, aunque la latencia será mayor que en GPU.
- Opciones de despliegue: llama.cpp, Ollama (comando `ollama run qwen3.5:0.8b`), vLLM, SGLang, KTransformers y transformers de HuggingFace.
- Latencia y throughput: no disponibles; al ser un modelo pequeño, se espera alta velocidad de generación en GPU consumer, típicamente >100 tokens/s en RTX 4090 con cuantización 4-bit.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU-Pro (non-thinking) | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-0.8B | 0,8B | 262K | no disponible | Apache-2.0 | GGUF, safetensors |
| Qwen3-1.7B | 1,7B | 32K | 40,2 | Apache-2.0 | safetensors, GGUF |
| Qwen3.5-2B | 2B | 262K | 55,3 | Apache-2.0 | safetensors, GGUF |
| Qwen3-4B-2507 | 4B | 256K | 69,6 | Apache-2.0 | safetensors, GGUF |

El modelo Qwen3.5-0.8B es significativamente más pequeño que sus alternativas, lo que reduce requisitos de hardware pero también rendimiento en tareas complejas. Su ventaja principal es el contexto nativo de 262K tokens y el soporte multimodal, que no está presente en Qwen3-1.7B. Para tareas de código o razonamiento avanzado, Qwen3.5-2B ofrece un mejor equilibrio entre tamaño y capacidad.

## Limitaciones y advertencias

- **Rendimiento limitado en código**: según análisis de Codersera, el modelo tiene "weak code accuracy", por lo que no es recomendable para generación de código en producción.
- **Alucinaciones y razonamiento superficial**: al ser un modelo de solo 0,8B, puede alucinar más que modelos grandes y fallar en razonamientos complejos o matemáticas avanzadas.
- **Dependencia de cuantización**: la calidad de la cuantización GGUF puede degradar la precisión; Unsloth Dynamic 2.0 afirma superar a otros quants, pero no se aportan datos comparativos.
- **Contexto largo con límites prácticos**: aunque la ventana es de 262K tokens, la atención lineal y la capacidad de memoria pueden degradar la coherencia en secuencias muy largas.
- **Sesgos y datos de entrenamiento**: no se publican detalles sobre la composición del dataset, lo que implica posibles sesgos culturales o de género.
- **Restricciones de licencia**: Apache-2.0 permite uso comercial sin restricciones, pero el modelo base de Qwen puede tener condiciones adicionales (no indicadas en la model card).
- **Falta de benchmarks completos**: los datos de rendimiento son parciales, lo que dificulta una evaluación objetiva antes de usarlo en producción.

## Enlaces

- Repositorio HuggingFace: [Azizbek8189/Qwen3.5-0.8B-GGUF](https://huggingface.co/Azizbek8189/Qwen3.5-0.8B-GGUF)
- Modelo base: [Qwen/Qwen3.5-0.8B](https://huggingface.co/Qwen/Qwen3.5-0.8B)
- Guía de Unsloth para Qwen3.5: [unsloth.ai/docs/models/qwen3.5](https://unsloth.ai/docs/models/qwen3.5)
- Blog oficial de Qwen3.5: [qwen.ai/blog?id=qwen3.5](https://qwen.ai/blog?id=qwen3.5)
- Página en Ollama: [ollama.com/library/qwen3.5:0.8b](https://ollama.com/library/qwen3.5:0.8b)
- Qualcomm AI Hub: [aihub.qualcomm.com/mobile/models/qwen3_5_0_8b](https://aihub.qualcomm.com/mobile/models/qwen3_5_0_8b)
- Análisis de Codersera: [codersera.com/blog/run-and-benchmark-qwen35-08b](https://codersera.com/blog/run-and-benchmark-qwen35-08b/)
