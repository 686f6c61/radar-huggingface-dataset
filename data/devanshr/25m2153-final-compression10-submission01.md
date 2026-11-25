# DevanshR/25M2153-Final-Compression10-Submission01

## Resumen

`DevanshR/25M2153-Final-Compression10-Submission01` es un modelo derivado de Qwen3.5-4B-Base publicado en Hugging Face por el usuario DevanshR. Por el nombre del repositorio y por el prefijo "Compression10", todo apunta a un experimento de compresión o cuantización sobre el modelo base de Qwen, más que a un modelo entrenado desde cero. El repositorio tiene 2,7 GB, un tamaño coherente con pesos de un modelo de 4B parámetros almacenados en precisión reducida, y declara la etiqueta `image-text-to-text`, por lo que hereda la capacidad multimodal del Qwen3.5 original.

El modelo base, Qwen3.5-4B, es un modelo causal con codificador de visión desarrollado por el equipo Qwen de Alibaba. Combina una arquitectura híbrida de atención lineal (Gated DeltaNet) y atención con compuertas (Gated Attention), con 32 capas, dimensión oculta de 2560 y una ventana de contexto nativa de 262 144 tokens, extensible hasta 1 010 000. Según la model card del autor, Qwen3.5 unifica visión y lenguaje mediante entrenamiento de fusión temprana y cubre 201 idiomas y dialectos.

La relevancia de esta ficha radica en que el repositorio no documenta el proceso de compresión aplicado ni publica benchmarks propios: la model card es, en la práctica, una copia de la del modelo base. Cualquier evaluación de calidad debe hacerse contra el Qwen3.5-4B original, asumiendo la pérdida que introduzca la compresión. La licencia Apache 2.0 permite uso comercial, pero la ausencia de documentación específica es un riesgo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido (Gated DeltaNet + Gated Attention) con codificador de visión |
| Parametros totales | 4B (según modelo base) |
| Parametros activos | no disponible (no se confirma configuración MoE en este repositorio) |
| Longitud de contexto | 262 144 tokens nativos; extensible hasta 1 010 000 |
| Tipos de cuantizacion | no disponible (el nombre del repo sugiere compresión, sin especificar formato) |
| Idiomas soportados | 201 idiomas y dialectos (según modelo base); no verificado en este repositorio |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers, vLLM, SGLang, KTransformers) |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer causal con un layout híbrido: 8 bloques compuestos por 3 capas de Gated DeltaNet (atención lineal con 32 cabezas para V y 16 para QK, dimensión de cabeza 128) seguidas de 1 capa de Gated Attention (16 cabezas para Q, 4 para KV, dimensión 256, RoPE de 64 dimensiones). La FFN tiene dimensión intermedia de 9216 y el embedding de tokens es de 248 320 entradas, atado a la salida LM. Incluye entrenamiento con multi-token prediction (MTP) en varios pasos y un codificador de visión para entrada image-text-to-text.

El entrenamiento del modelo base combina preentrenamiento y postentrenamiento, con aprendizaje por refuerzo escalado en entornos multiagente y entrenamiento multimodal de fusión temprana. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF o DPO en esta variante concreta. Tampoco se documenta el método de compresión aplicado por DevanshR (podría ser cuantización, pruning o destilación), lo que impide evaluar el impacto técnico del proceso.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento y conocimiento general (heredado del modelo base Qwen3.5-4B).
- Comprensión de imágenes y texto combinados (pipeline `image-text-to-text`).
- Capacidades de codificación y agentes según la model card del modelo base.
- Soporte multilingüe amplio (201 idiomas y dialectos declarados en el modelo base).
- No se confirma en este repositorio soporte de tool calling, function calling ni modo thinking explícito; dichas capacidades pertenecen al modelo base y deben validarse empíricamente tras la compresión.

## Casos de uso

- Prototipado rápido de asistentes multimodales: el modelo puede recibir imágenes y texto en un mismo prompt, útil para demos de descripción de imágenes o extracción de información visual en entornos de desarrollo.
- Experimentación académica con modelos comprimidos: sirve para comparar la degradación de calidad frente al Qwen3.5-4B original en tareas de razonamiento y visión.
- Generación de texto en local: con 2,7 GB de pesos, es viable en GPUs de consumo para tareas de generación y resumen sin requisitos de infraestructura elevados.
- Análisis de documentos con contexto largo: la ventana de 262 144 tokens del modelo base permite procesar documentos extensos, aunque la compresión puede afectar a la fidelidad en contextos muy largos.
- Chatbots multilingües de bajo coste: el soporte declarado de 201 idiomas del modelo base lo hace apto para pruebas de conversación en varios idiomas, previa validación de calidad.
- Evaluación de pipelines de despliegue: al ser compatible con transformers, vLLM y SGLang, puede usarse para probar integraciones de serving con modelos comprimidos.

## Benchmarks y rendimiento

La model card del repositorio reproduce los resultados del modelo base Qwen3.5-4B, no los de esta variante comprimida. Se muestran a título de referencia del modelo original:

| Benchmark | Qwen3.5-4B | Qwen3.5-9B | GPT-OSS-20B |
|---|---|---|---|
| MMLU-Pro | 79,1 | 82,5 | 74,8 |
| MMLU-Redux | no disponible en el extracto | no disponible en el extracto | 87,8 |

No se han publicado resultados de benchmarks específicos de esta variante comprimida en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3-4 GB en FP16/BF16 para 4B parámetros; el repositorio de 2,7 GB sugiere pesos en precisión reducida, con un consumo estimado de 3-5 GB incluyendo overhead.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4090 para inferencia local; A100 o H100 para serving de mayor throughput.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más de VRAM en cuantizaciones reducidas.
- Opciones de despliegue: transformers, vLLM, SGLang y KTransformers según la model card; llama.cpp u Ollama no se confirman para este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este repositorio (derivado de Qwen3.5-4B) | 4B | 262 144 | Apache 2.0 | Hugging Face, 39 descargas |
| Qwen/Qwen3.5-4B-Base | 4B | 262 144 | Apache 2.0 | Hugging Face (modelo oficial) |
| Qwen3.5-9B | 9B | no disponible | Apache 2.0 | Hugging Face (según model card) |
| GPT-OSS-20B | 20B | no disponible | no disponible | no disponible |

El modelo oficial Qwen3.5-4B-Base es la alternativa directa y recomendable frente a esta variante comprimida, al carecer esta de documentación sobre el proceso de compresión y de benchmarks propios.

## Limitaciones y advertencias

- La model card no documenta el método de compresión ni sus parámetros, por lo que se desconoce la pérdida de calidad respecto al modelo base.
- No hay benchmarks publicados de esta variante; los resultados mostrados corresponden al Qwen3.5-4B original.
- Riesgo de alucinación inherente a modelos de 4B parámetros, potencialmente agravado por la compresión.
- No se confirma el soporte real de tool calling, agentes o modo thinking en esta variante.
- El soporte de 201 idiomas es una declaración del modelo base, no verificada en este repositorio.
- Licencia Apache 2.0 permite uso comercial, pero la falta de documentación técnica desaconseja su uso en producción sin evaluación previa.
- El repositorio tiene muy poca tracción (39 descargas, 0 likes) y no procede de un canal oficial de Qwen.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/DevanshR/25M2153-Final-Compression10-Submission01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
- Licencia: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
