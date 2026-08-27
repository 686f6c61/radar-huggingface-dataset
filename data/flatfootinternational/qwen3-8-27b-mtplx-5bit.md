# FlatFootInternational/qwen3.8-27b-MTPLX-5bit

## Resumen

El modelo `FlatFootInternational/qwen3.8-27b-MTPLX-5bit` es una cuantización en 5 bits del modelo Qwen3.8-27B de Alibaba, adaptada específicamente para ejecución en Apple Silicon mediante la librería MLX. La particularidad de esta versión es que conserva la cabeza de predicción multi-token (MTP) nativa del modelo original, lo que permite decodificación especulativa y acelera la generación en hardware Apple. El autor, FlatFootInternational, ha utilizado la herramienta MTPLX Forge para construir este artefacto a partir del checkpoint oficial de Qwen.

El modelo base Qwen3.8-27B es un transformer denso híbrido con atención lineal en 48 de sus 64 capas, incorpora una torre de visión y una ventana de contexto nativa de 262 144 tokens, extensible a 1 millón. Esta cuantización mantiene todas esas capacidades, pero reduce el peso de las matrices a 5 bits con grupos de 64 pesos, mientras que las partes sensibles (normas, kernels de convolución GDN, parámetros de estado recurrente y la cabeza MTP) se conservan en 16 bits. El resultado es un modelo de 19,4 GB de descarga que cabe en equipos Mac con 32 GB de memoria unificada, ofreciendo una alternativa local de alto rendimiento para tareas de generación de texto, código y flujos agénticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso hibrido con atencion lineal en 48 de 64 capas, torre de vision y cabeza MTP |
| Parametros totales | 27B (modelo base); el archivo safetensors reporta 4 665 462 000, posible error de metadata |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens (extensible a 1M) |
| Tipos de cuantizacion | 5 bits por matriz de pesos, con grupos de 64; partes sensibles en 16 bits |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida que combina atención completa y atención lineal: 48 de las 64 capas usan atención lineal para reducir el coste computacional en contextos largos, mientras que las restantes mantienen atención estándar. Incluye una torre de visión que le permite procesar imágenes, y una cabeza de predicción multi-token (MTP) con profundidad 3, que genera varios tokens por paso y acelera la inferencia mediante verificación en una sola pasada.

Esta versión cuantizada no modifica la arquitectura, sino que comprime las matrices de pesos a 5 bits con agrupación de 64 pesos. Los componentes sensibles a la cuantización (normas, kernels de convolución GDN, parámetros de estado recurrente y la cabeza MTP) se mantienen en 16 bits para preservar la calidad. El proceso de cuantización se realizó con la herramienta MTPLX Forge, que verifica la integridad del artefacto resultante. No se dispone de información detallada sobre el dataset de entrenamiento original, pero el modelo base fue entrenado por Alibaba con un enfoque en codificación, razonamiento y tareas agénticas.

## Capacidades

- Generación de texto y conversación multi-turno con contexto largo (hasta 262 144 tokens).
- Razonamiento paso a paso y resolución de problemas matemáticos y lógicos.
- Generación de código en múltiples lenguajes, con soporte para depuración y explicación.
- Procesamiento de imágenes gracias a la torre de visión integrada (multimodal).
- Soporte de flujos agénticos y automatización de tareas de oficina (redacción, resumen, extracción de información).
- Decodificación especulativa nativa mediante la cabeza MTP, que acelera la generación en hardware Apple.
- Capacidades multilingües heredadas del modelo base, aunque no se especifican los idiomas exactos.

## Casos de uso

- Asistente de programación local: un desarrollador puede ejecutar el modelo en su MacBook para obtener sugerencias de código, refactorización y explicaciones de fragmentos complejos, sin depender de servicios en la nube. La ventana de 262K tokens permite procesar repositorios completos o archivos largos.
- Automatización de oficina: el modelo puede redactar correos, resumir documentos extensos, extraer datos de contratos o generar informes a partir de notas, aprovechando su capacidad de razonamiento y su contexto amplio.
- Chatbot de atención al cliente: con su capacidad de mantener conversaciones multi-turno y su licencia Apache 2.0, puede integrarse en sistemas de soporte para responder consultas técnicas o de producto, manteniendo el historial completo de la conversación.
- Análisis de documentos con imágenes: gracias a la torre de visión, puede procesar capturas de pantalla, diagramas o formularios escaneados y extraer información estructurada, útil en entornos administrativos.
- Desarrollo de agentes autónomos: su soporte para razonamiento multi-paso y su capacidad de tool calling (heredada del modelo base) permiten construir agentes que planifican, ejecutan acciones y verifican resultados, por ejemplo en pruebas automatizadas o scraping de datos.
- Generación de contenido técnico: puede crear documentación, tutoriales o entradas de blog a partir de especificaciones, manteniendo coherencia a lo largo de textos largos gracias a su contexto extendido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica velocidades medidas en un MacBook M5 con 32 GB de memoria unificada, pero no proporciona cifras concretas de tokens por segundo ni comparaciones con otros modelos. Se recomienda consultar el repositorio del modelo base Qwen/Qwen3.8-27B para obtener resultados de evaluaciones estándar (MMLU, HumanEval, GSM8K, etc.) en su versión sin cuantizar.

## Requisitos de hardware

- Memoria unificada: se recomiendan 32 GB o más para ejecutar el modelo con comodidad.
- GPU: diseñado para Apple Silicon (M-series). Probado en MacBook M5 (no Pro ni Max) con 32 GB.
- Almacenamiento: aproximadamente 19,4 GB de descarga (el repositorio ocupa 16,9 GB en HuggingFace).
- Opciones de despliegue: mediante la herramienta `mtplx` (comando `mtplx serve --model FlatFootInternational/qwen3.8-27b-MTPLX-5bit`). También puede cargarse con MLX directamente.
- Latencia y throughput: no se proporcionan cifras exactas; la model card afirma que la decodificación especulativa con MTP acelera la generación, pero no cuantifica la mejora.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Plataforma |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27B | 262K | FP16/BF16 | Apache 2.0 | Multiplataforma |
| FlatFootInternational/qwen3.8-27b-MTPLX-5bit | 27B | 262K | 5-bit MLX | Apache 2.0 | Apple Silicon |
| Qwen3.5-4B (MTPLX) | 4B | No disponible | 5-bit MLX | Apache 2.0 | Apple Silicon |

La comparativa se limita a modelos de la misma familia MTPLX y al modelo base. No se dispone de datos de rendimiento para establecer una comparación cuantitativa con otras alternativas de 27B como Llama 3.1 27B o Mistral Large.

## Limitaciones y advertencias

- La cuantización a 5 bits puede introducir una ligera degradación en la calidad de generación respecto al modelo original en FP16, especialmente en tareas de razonamiento complejo o matemáticas.
- El modelo está optimizado para Apple Silicon; su uso en otras plataformas requeriría conversión a otros formatos (GGUF, etc.) y podría no aprovechar la cabeza MTP.
- No se han publicado evaluaciones de sesgos o alucinaciones específicas para esta versión cuantizada. Como cualquier modelo de lenguaje, puede generar información falsa o inventada.
- La ventana de contexto de 262K tokens es amplia, pero el uso prolongado de contextos muy largos puede agotar la memoria unificada en equipos con 32 GB.
- Aunque la licencia es Apache 2.0, el modelo base Qwen3.8-27B puede tener restricciones adicionales de uso comercial según los términos de Alibaba; se recomienda revisar la documentación oficial.
- El número de descargas y likes es cero, lo que indica que el modelo es reciente y aún no ha sido validado por la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FlatFootInternational/qwen3.8-27b-MTPLX-5bit
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio MTPLX en GitHub: https://github.com/youssofal/mtplx
- Repositorio oficial de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Recetas vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
