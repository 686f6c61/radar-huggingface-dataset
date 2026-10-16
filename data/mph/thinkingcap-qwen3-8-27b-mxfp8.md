# mph/ThinkingCap-Qwen3.8-27B-MXFP8

## Resumen

ThinkingCap-Qwen3.8-27B-MXFP8 es una versión cuantizada en MXFP8 del modelo bottlecapai/ThinkingCap-Qwen3.8-27B, publicada por el usuario mph. Se trata de un modelo multimodal de tipo image-text-to-text (acepta imagen y texto como entrada y genera texto) construido sobre la familia etiquetada como qwen3_5, con 27.781.427.952 parámetros totales (unos 27,78 B) y un repositorio de 32 GB. La cuantización se ha generado con NVIDIA TensorRT Model Optimizer (ModelOpt) v0.47.0.

El interés principal de esta ficha es práctico: MXFP8 almacena pesos y activaciones como valores FP8 (E4M3) con una escala compartida en potencia de dos (E8M0) por cada bloque de 32 elementos. Esto reduce el peso en memoria aproximadamente a la mitad respecto a BF16 manteniendo una precisión cercana, gracias al escalado de grano fino. El resultado es que los pesos ocupan alrededor de 30 GB y caben en una única GPU de 40 GB o más, lo que abarata el despliegue frente a una versión en BF16.

Ahora bien, el modelo exige hardware Blackwell (SM100/SM120) para aprovechar el cómputo MXFP8 nativo, y su licencia Polyform Small Business 1.0.0 no es de código abierto en sentido estricto, con restricciones para uso comercial según el tamaño de la empresa. No se han publicado datos de benchmarks ni la longitud de contexto en la información disponible, y el repositorio no tiene descargas ni valoraciones, por lo que debe considerarse un artefacto reciente y poco validado por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) de la familia etiquetada como qwen3_5, con capas de atención lineal (convolución y proyección) combinadas con capas de atención completa, módulos MTP y codificador de visión. No se especifica si emplea mezcla de expertos (MoE) |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP8: pesos y activaciones en FP8 E4M3 con escala compartida E8M0 por bloque de 32 elementos. Se mantienen en BF16 los embeddings y el lm_head del modelo de lenguaje, los módulos de convolución y proyección de la atención lineal, todos los módulos de visión (visual.*) y los módulos MTP |
| Idiomas soportados | no disponible |
| Licencia | polyform-small-business-1.0.0 (license: other) |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Pipeline | image-text-to-text |
| Modelo base | bottlecapai/ThinkingCap-Qwen3.8-27B (relación: quantized) |
| Herramienta de cuantizacion | NVIDIA TensorRT Model Optimizer (ModelOpt) v0.47.0 |
| Contexto de despliegue | vLLM (--quantization modelopt_mxfp8), SGLang; parsers qwen3 (reasoning) y qwen3_xml / qwen3_coder (tool calling) |

## Arquitectura y entrenamiento

La información disponible describe una arquitectura multimodal con un modelo de lenguaje y un codificador de visión. Del listado de módulos que la cuantización deja en BF16 se deduce la estructura interna: existen capas de atención lineal con módulos de convolución y proyección, además de capas de atención estándar (las proyecciones de atención y MLP son las que sí se cuantizan), un conjunto completo de módulos de visión bajo el prefijo visual.* y módulos MTP (multi-token prediction). La etiqueta qwen3_5 sitúa el modelo en la estirpe Qwen3.5, y los parsers recomendados en el despliegue (qwen3 para razonamiento, qwen3_xml y qwen3_coder para llamada a herramientas) son coherentes con ese linaje.

No se dispone de información sobre el proceso de entrenamiento: no se indica el número de tokens, la composición del dataset, ni si hubo etapas de RLHF, DPO u otras técnicas de alineamiento. Tampoco se detalla el procedimiento de cuantización más allá de la herramienta y la versión empleadas, ni si se realizó calibración con un conjunto de datos concreto. La innovación técnica destacable es, por tanto, la propia cuantización MXFP8 con escalado por bloques de 32 elementos, que permite almacenar pesos cercanos a la mitad del tamaño en BF16 conservando las capas sensibles a la precisión (embeddings, lm_head, visión, MTP y atención lineal) en BF16.

## Capacidades

- Generación de texto conversacional, según la etiqueta conversational del repositorio.
- Procesamiento de entrada multimodal image-text-to-text: admite imágenes junto con texto, gracias al codificador de visión que se conserva en BF16.
- Razonamiento con modo de pensamiento explícito: el despliegue en vLLM y SGLang recomienda el parser de razonamiento qwen3, lo que indica soporte de bloques de pensamiento separados de la respuesta final.
- Llamada a herramientas y funciones: los comandos de despliegue activan --enable-auto-tool-choice y los parsers de tool calling qwen3_xml (vLLM) y qwen3_coder (SGLang).
- Orientación a eficiencia de tokens: el autor etiqueta el modelo con token-efficient y efficient-thinking, aunque no se documenta en qué consiste esa optimización.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Predicción multi-token: la presencia de módulos MTP sugiere soporte de decodificación con predicción de varios tokens, si bien no se documenta su uso en inferencia.
- No se declaran capacidades de audio ni de generación de imagen.

## Casos de uso

- Atención al cliente automatizada: el modelo puede mantener conversaciones multi-turno con entrada de texto e imagen, por ejemplo para que un usuario adjunte una captura de pantalla de un error o una foto de un producto y el sistema responda en el mismo hilo. La licencia Polyform Small Business permite este uso en empresas pequeñas.
- Agentes con llamada a herramientas: al soportar tool calling con los parsers qwen3_xml y qwen3_coder, puede integrarse en agentes que consulten APIs, bases de datos o servicios internos, encadenando varios pasos de razonamiento antes de emitir la acción final.
- Análisis de documentos con imagen: extracción de datos de facturas, albaranes, formularios escaneados o informes con gráficos, combinando el codificador de visión con la generación de texto estructurado.
- Generación y revisión de código en pipelines de CI/CD: el parser qwen3_coder facilita la extracción fiable de bloques de código desde la respuesta del modelo, lo que permite conectarlo a herramientas de revisión automática o de generación de parches.
- Asistentes de razonamiento paso a paso: el modo de pensamiento con parser qwen3 es adecuado para tareas de matemáticas, análisis lógico o planificación, donde interesa separar el razonamiento interno de la respuesta presentada al usuario.
- Despliegue con restricción de memoria en GPUs Blackwell: al reducir los pesos a unos 30 GB, permite servir un modelo de 27,78 B en una única GPU de 40 GB o más, en lugar de repartirlo entre varias, siempre que se use una SM100 o SM120 para el cómputo MXFP8 nativo.
- Clasificación y moderación de contenido multimodal: el modelo puede etiquetar o filtrar imágenes y texto en flujos de publicación, usando su capacidad de entrada image-text-to-text.
- Sistemas RAG con soporte visual: recuperación de fragmentos de documentación y paso de páginas escaneadas o diagramas como imagen al modelo para responder preguntas ancladas en el contexto recuperado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor no incluye cifras de MMLU, HumanEval, GSM8K, MMMU ni de ningún otro conjunto de evaluación, ni comparaciones cuantitativas con el modelo base en BF16 o con otras cuantizaciones. Tampoco se proporcionan datos de latencia o throughput.

## Requisitos de hardware

- VRAM para inferencia: el autor indica que los pesos ocupan alrededor de 30 GB, por lo que se necesita una GPU de 40 GB o más, dejando margen para la caché KV y las activaciones de visión.
- Cómputo MXFP8 nativo: requiere GPUs NVIDIA Blackwell, concretamente SM100 (por ejemplo, B200/GB200) o SM120 (gama RTX Pro Blackwell y sucesores de consumo de esa generación).
- GPU recomendadas: cualquier GPU Blackwell de 40 GB o más para despliegue en una sola tarjeta. Para contextos largos o alta concurrencia, el autor recomienda repartir el modelo en varias GPUs con paralelismo tensorial.
- GPUs Hopper (H100/H200) y Ampere (A100): no se declaran compatibles con el cómputo MXFP8 nativo según la model card, que solo menciona Blackwell. Su viabilidad en estas generaciones no está documentada en la información disponible.
- GPU de consumo: una RTX 5090 con 32 GB no ofrece margen suficiente según la estimación de 30 GB de pesos más caché KV y activaciones, por lo que queda fuera del rango recomendado por el propio autor.
- Opciones de despliegue: vLLM con --quantization modelopt_mxfp8, --trust-remote-code, --enable-prefix-caching, --enable-chunked-prefill, --attention-backend FLASHINFER y --mm-encoder-tp-mode data; y SGLang con --attention-backend flashinfer y --mm-enable-dp-encoder. En ambos casos se recomienda --dtype bfloat16.
- Soporte en llama.cpp, Ollama o TGI: no disponible. El repositorio no publica pesos GGUF y solo se documentan vLLM y SGLang.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion / formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ThinkingCap-Qwen3.8-27B-MXFP8 (este modelo) | 27,78 B | no disponible | MXFP8 (E4M3 con escala E8M0 por bloque de 32), safetensors, pesos ~30 GB | Polyform Small Business 1.0.0 | HuggingFace, 0 descargas |
| bottlecapai/ThinkingCap-Qwen3.8-27B (modelo base) | 27,78 B (heredado) | no disponible | no disponible | no disponible en la informacion proporcionada | HuggingFace |
| Otras alternativas multimodales de ~27 B en FP8 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks del modelo ni de sus alternativas en la información proporcionada, por lo que no es posible establecer una comparación de rendimiento. La comparación significativa que sí puede hacerse es frente a su propio modelo base en BF16: la versión MXFP8 reduce el peso en memoria aproximadamente a la mitad y traslada el requisito de hardware a GPUs Blackwell, a cambio de una posible pérdida de precisión no cuantificada.

## Limitaciones y advertencias

- Licencia Polyform Small Business 1.0.0: no es una licencia de código abierto aprobada por la OSI. Impone restricciones al uso comercial por parte de empresas que superen el umbral de tamaño definido por la propia licencia. Es imprescindible revisar el texto completo antes de cualquier despliegue en producción.
- Ausencia de datos de evaluación: no hay benchmarks publicados, ni comparación de precisión entre esta cuantización MXFP8 y el modelo base en BF16. La degradación introducida por la cuantización es, por tanto, desconocida.
- Riesgo de alucinación: no se documentan medidas de mitigación ni tasas de error. Como en cualquier modelo generativo, las respuestas pueden ser incorrectas o inventadas, especialmente en tareas de razonamiento largo o con imágenes ambiguas.
- Idiomas y contexto no especificados: se desconoce qué idiomas soporta el modelo y cuál es su ventana de contexto máxima, lo que dificulta planificar despliegues con requisitos concretos de longitud.
- Dependencia de hardware específico: el rendimiento óptimo exige GPUs Blackwell (SM100/SM120). En generaciones anteriores no se garantiza ni el rendimiento ni la compatibilidad.
- Madurez del artefacto: el repositorio registra 0 descargas y 0 valoraciones, fue creado y actualizado el mismo día (16 de octubre de 2026) y no procede de un laboratorio con soporte conocido. No hay garantía de mantenimiento ni de corrección de errores.
- Dependencia del modelo base de terceros: el modelo deriva de bottlecapai/ThinkingCap-Qwen3.8-27B, un modelo de la comunidad, no de una publicación oficial de Qwen, por lo que la nomenclatura «Qwen3.8» no debe confundirse con un lanzamiento oficial.
- Necesidad de --trust-remote-code: los comandos de despliegue documentados requieren ejecutar código remoto del repositorio, lo que implica revisar el contenido antes de servirlo en entornos sensibles.
- Módulos sin cuantizar: la visión, los embeddings, el lm_head, la atención lineal y los módulos MTP permanecen en BF16, de modo que el ahorro de memoria no es uniforme y el consumo real puede superar la estimación si se procesan muchas imágenes.
- Caché KV y concurrencia: con contextos largos o alta concurrencia, los 40 GB pueden ser insuficientes, y el autor recomienda paralelismo tensorial en varias GPUs, lo que complica la infraestructura.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mph/ThinkingCap-Qwen3.8-27B-MXFP8
- Modelo base: https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.8-27B
- NVIDIA TensorRT Model Optimizer (ModelOpt): https://github.com/NVIDIA/TensorRT-Model-Optimizer
- Nota sobre la búsqueda web: los resultados obtenidos en la búsqueda se refieren a la conversión de la unidad de velocidad mph a km/h y a organismos de discapacidad, por lo que no guardan relación con el modelo y no se incluyen como enlaces relevantes.
