# leeaandrob/ternary-bonsai-27b-gguf

## Resumen

Ternary-Bonsai-27B es un modelo de lenguaje de 27 000 millones de parámetros (26 895 998 464) con pesos ternarios end-to-end, es decir, cada peso se representa con aproximadamente 1,71 bits, lo que reduce drásticamente el tamaño en disco y en memoria sin sacrificar en exceso la capacidad de razonamiento. El modelo es un espejo (mirror) de los pesos publicados por prism-ml, que a su vez se derivan de la arquitectura híbrida de atención de Qwen3.6-27B. Se distribuye en formato GGUF, pensado para su ejecución en llama.cpp, NeuroGrid y otros motores compatibles con CPU, GPU y Metal.

La relevancia de este modelo radica en su compresión extrema: con un peso desplegado de aproximadamente 7,2 GB, ofrece un rendimiento cercano al 95 % de la versión en FP16 en tareas de razonamiento, según los datos publicados por el autor. Además, incorpora un proyector de visión (CLIP) que le permite procesar imágenes, y mantiene capacidades de tool calling y agente. Su licencia Apache-2.0 permite uso comercial sin restricciones adicionales, lo que lo convierte en una opción atractiva para despliegues en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención (derivado de Qwen3.6-27B), pesos ternarios end-to-end |
| Parametros totales | 26 895 998 464 (27B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262 144 tokens (según fuentes del autor); el comando de ejemplo usa 16 384 |
| Tipos de cuantizacion | Q2_0 (grupo 128), Q2_g64 (grupo 64), PQ2_0 (grupo 128), mmproj-Q8_0 (proyector de visión) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors no disponible en este repo) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura híbrida de atención de Qwen3.6-27B, que combina mecanismos de atención clásicos con capas de atención lineal o de ventana deslizante, aunque los detalles exactos de la arquitectura interna no se especifican en la documentación disponible. La innovación principal es la cuantización ternaria end-to-end: cada peso se reduce a tres valores posibles (-1, 0, +1), lo que permite una representación de 1,71 bits por peso. Este proceso se aplica durante el entrenamiento o mediante una conversión posterior, y el modelo resultante conserva la mayor parte de la capacidad de razonamiento del modelo original.

No se han publicado detalles sobre el conjunto de datos de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas de RLHF o DPO. El autor indica que el modelo mantiene un 95 % de la capacidad de razonamiento en FP16 en 15 benchmarks de modo pensamiento, pero no se especifica el procedimiento exacto de cuantización ni si hubo ajuste fino posterior.

## Capacidades

- Generación de texto y razonamiento complejo, con especial fortaleza en matemáticas (93,40 en benchmark interno) y código (85,96).
- Soporte de tool calling y uso de agentes, con un rendimiento de 74,01 en la categoría de agentic tool use, según los datos publicados.
- Capacidad multimodal: incluye un proyector de visión CLIP (archivo mmproj-Q8_0) que permite procesar imágenes y responder preguntas sobre ellas.
- Contexto largo de hasta 262 144 tokens, lo que permite manejar documentos extensos o conversaciones multi-turno con historial amplio.
- Compatible con el modo pensamiento (thinking mode) del modelo base Qwen3.6, aunque no se detalla su activación en la documentación.
- Multilingüismo: no se especifican los idiomas soportados, pero al derivar de Qwen3.6 es probable que cubra múltiples lenguas, incluido el español.

## Casos de uso

- Despliegue en dispositivos con recursos limitados: gracias a su tamaño de ~7,2 GB, puede ejecutarse en portátiles con 8 GB de RAM o en GPUs de gama media como una RTX 3060, lo que permite aplicaciones de IA generativa sin depender de infraestructura en la nube.
- Asistentes virtuales con contexto largo: su ventana de 262K tokens permite mantener conversaciones prolongadas con historial completo, ideal para atención al cliente o asistentes personales que necesitan recordar interacciones anteriores.
- Generación de código en entornos de desarrollo: con un rendimiento de 85,96 en coding, puede integrarse en IDE o pipelines de CI/CD para autocompletar, revisar o generar código, siempre que se use con las herramientas de tool calling adecuadas.
- Agentes autónomos con tool calling: su capacidad de agentic tool use (74,01) lo hace adecuado para construir agentes que interactúan con APIs, bases de datos o servicios externos, ejecutando acciones de forma autónoma.
- Análisis de imágenes en entornos sin GPU dedicada: el proyector de visión permite clasificar o describir imágenes, útil en aplicaciones de moderación de contenido, accesibilidad o automatización de documentos escaneados.
- Procesamiento de documentos extensos: con 262K tokens de contexto, puede resumir o extraer información de libros, informes o contratos completos sin necesidad de dividirlos en fragmentos.

## Benchmarks y rendimiento

Los datos de rendimiento provienen de la documentación del modelo original (prism-ml). Se presentan los valores publicados, que corresponden a una evaluación interna del autor y no a benchmarks estandarizados externos.

| Benchmark | Resultado |
|---|---|
| Matemáticas | 93,40 |
| Coding | 85,96 |
| Agentic tool use | 74,01 |
| Visión | 65,19 |
| Retención de razonamiento vs FP16 | 95 % (media en 15 benchmarks de modo pensamiento) |

No se dispone de resultados en MMLU, HumanEval, GSM8K u otros benchmarks públicos. Los valores indicados son los únicos disponibles en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: el archivo Q2_0 de 7,17 GB y el Q2_g64 de 7,59 GB requieren al menos 8 GB de VRAM para inferencia en GPU, aunque con contexto largo puede necesitar más memoria adicional.
- GPUs recomendadas: cualquier GPU con 8 GB o más de VRAM, como RTX 3060, RTX 4060, RTX 4070, o GPUs de datacenter como A10, A100 o H100. También funciona en CPU con suficiente RAM (16 GB recomendados).
- Compatibilidad con consumer GPU: sí, cabe en GPUs de gama media y alta de consumo, siempre que se use la cuantización adecuada.
- Opciones de despliegue: llama.cpp (llama-server), NeuroGrid (motor propietario), y potencialmente vLLM, Ollama o TGI si soportan GGUF ternario, aunque no se confirma en la documentación.
- Latencia y throughput: no se proporcionan datos concretos. En NeuroGrid se menciona la posibilidad de procesar hasta 8 secuencias concurrentes con un solo paso de decodificación usando variables de entorno específicas.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de la misma categoría (27B cuantizados a 2 bits o ternarios). Se puede mencionar que, frente a modelos como Qwen2.5-27B cuantizado a 4 bits (que ocupa ~16 GB), Ternary-Bonsai-27B reduce el tamaño a menos de la mitad, pero no hay benchmarks públicos que permitan una comparación directa. Tampoco se conocen alternativas ternarias comerciales comparables en el momento de redactar esta ficha.

## Limitaciones y advertencias

- La cuantización ternaria puede provocar pérdidas de precisión en tareas muy sensibles al detalle, como razonamiento lógico complejo o generación de código con sintaxis estricta, aunque los datos del autor indican una retención del 95 %.
- El modelo puede presentar alucinaciones, especialmente en tareas de generación libre o cuando se le pide información factual no presente en su entrenamiento.
- La documentación no especifica los idiomas soportados; aunque es probable que herede el multilingüismo de Qwen3.6, no hay garantía de un rendimiento uniforme en todos los idiomas.
- Existen dos geometrías de bloque incompatibles entre sí: los archivos con grupo 128 (Q2_0 y PQ2_0) no cargan en llama.cpp estándar, solo en el fork de PrismML o en NeuroGrid. Es crucial seleccionar el archivo correcto según el motor de inferencia.
- El contexto de 262K tokens es teórico; en la práctica, el uso de contexto largo aumenta el consumo de memoria y puede degradar el rendimiento si no se dispone de suficiente VRAM o RAM.
- La licencia Apache-2.0 permite uso comercial, pero el modelo es un mirror de pesos ajenos; el crédito y la responsabilidad legal recaen en el autor original (prism-ml).

## Enlaces

- Repositorio del mirror: https://huggingface.co/leeaandrob/ternary-bonsai-27b-gguf
- Modelo original: https://huggingface.co/prism-ml/Ternary-Bonsai-27B-gguf
- Árbol de archivos del modelo original: https://huggingface.co/prism-ml/Ternary-Bonsai-27B-gguf/tree/main
- Ficha en There's An AI For That: https://theresanaiforthat.com/model/ternary-bonsai-27b-gguf/
- Ficha en AI Models FYI: https://www.aimodels.fyi/models/huggingFace/ternary-bonsai-27b-gguf-prism-ml
- Ficha en AIAny: https://aiany.app/item/ternary-bonsai-27b-gguf
