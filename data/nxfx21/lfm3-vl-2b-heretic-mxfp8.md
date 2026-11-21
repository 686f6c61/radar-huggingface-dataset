# nxfx21/LFM3-VL-2B-Heretic-mxfp8

## Resumen

LFM3-VL-2B-Heretic-mxfp8 es una cuantización en formato MLX MXFP8 de 8 bits del modelo multimodal nxfx21/LFM3-VL-2B-Heretic, que a su vez es una versión "abliterated" (con los mecanismos de rechazo suprimidos mediante la herramienta Heretic) del modelo LiquidAI/LFM3-VL-2B desarrollado por Liquid AI. El modelo original pertenece a la familia LFM3 (Liquid Foundation Models, tercera generación) y está especializado en tareas de imagen-a-texto, combinando una torre de visión con un backbone de lenguaje de aproximadamente 1.918 millones de parámetros.

La relevancia de esta variante concreta es doble: por un lado, ofrece una versión cuantizada a 8 bits pensada para ejecutarse eficientemente en hardware Apple Silicon mediante el framework MLX y la librería mlx-vlm; por otro, incorpora la modificación "abliterated" que elimina las respuestas de rechazo del modelo base, un cambio con implicaciones éticas y de seguridad importantes que condiciona su uso en producción.

Se trata de un modelo de nicho, publicado por un autor individual (nxfx21) y no por Liquid AI, con cero descargas y cero "likes" en el momento de la consulta. La información disponible en la model card es muy limitada: no se especifican licencia, idiomas soportados, datos de entrenamiento ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (torre de visión + backbone de lenguaje), familia LFM3-VL; detalles internos no disponibles |
| Parametros totales | 1.918.181.888 (aproximadamente 1,92 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP8 de 8 bits (group_size=32) en el backbone de lenguaje; bfloat16 en la torre de visión y el proyector; 9,017 bits por peso en promedio |
| Idiomas soportados | no disponible |
| Licencia | no disponible (sujeto a los términos de la licencia original de LiquidAI/LFM3-VL-2B) |
| Formato de pesos | safetensors (MLX), 2,2 GB de tamaño de repositorio |

## Arquitectura y entrenamiento

El modelo deriva de LiquidAI/LFM3-VL-2B, un modelo multimodal de la familia LFM3 de Liquid AI que combina procesamiento de imagen y texto. La arquitectura concreta del backbone (tipo de atención, capas, dimensiones) no se detalla en la información disponible. La variante aquí descrita aplica dos transformaciones sobre el modelo original: primero una abliteración mediante Heretic v2.1.0 (Trial 12, con 0/100 rechazos y divergencia KL de 0,3608 respecto al modelo base), y después una cuantización MXFP8 de 8 bits con group_size=32 sobre el backbone de lenguaje, manteniendo la torre de visión y el proyector en bfloat16.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si el modelo original empleó RLHF, DPO u otras técnicas de alineación. La conversión a MLX se realizó con mlx-vlm v0.8.0. La abliteración es una técnica que identifica y suprime direcciones en el espacio de activaciones asociadas a comportamientos de rechazo, lo que altera el comportamiento de seguridad del modelo sin reentrenamiento adicional.

## Capacidades

- Generación de texto a partir de imágenes (pipeline image-text-to-text): descripción de imágenes, respuesta a preguntas visuales y conversación multimodal.
- Procesamiento de lenguaje natural conversacional en formato multi-turno.
- Comprensión de imágenes combinada con razonamiento textual.
- Ejecución nativa en Apple Silicon mediante MLX y mlx-vlm.
- Comportamiento "abliterated": el modelo no presenta los rechazos típicos del modelo base ante peticiones que este último declinaría (0/100 rechazos según la model card).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo "thinking", audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Descripción automática de imágenes en local: el modelo puede generar descripciones textuales de imágenes directamente en un Mac con Apple Silicon, sin necesidad de conexión a servicios en la nube, gracias al formato MLX y a su tamaño reducido (2,2 GB).
- Asistentes conversacionales con entrada visual: integración en aplicaciones de chat que reciben capturas de pantalla o fotografías y responden en lenguaje natural, aprovechando el pipeline image-text-to-text.
- Prototipado e investigación sobre alineación y seguridad: la variante abliterated permite estudiar el comportamiento de modelos sin mecanismos de rechazo, útil en entornos de investigación controlados para analizar sesgos y respuestas ante contenido sensible.
- Procesamiento de documentos escaneados o formularios: extracción de información textual a partir de imágenes de documentos en flujos de trabajo locales sobre macOS.
- Análisis de imágenes en herramientas de accesibilidad: generación de descripciones para usuarios con discapacidad visual en aplicaciones de escritorio.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir el impacto de MXFP8 frente a bfloat16 en tareas multimodales sobre hardware Apple, dado que conserva la torre de visión en precisión completa.
- Experimentación con modelos pequeños multimodales: su reducido tamaño (menos de 2 mil millones de parámetros) lo hace adecuado para pruebas de concepto en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/unified memory estimada: el repositorio ocupa 2,2 GB en formato MXFP8; se recomienda al menos 4-6 GB de memoria unificada libre para la inferencia con contexto moderado.
- Hardware objetivo: Apple Silicon (series M1, M2, M3, M4 y superiores) con soporte MLX; no está pensado para GPUs NVIDIA o AMD.
- Cabe en equipos de consumo: sí, en cualquier Mac con chip Apple Silicon y memoria unificada suficiente (8 GB o más recomendable).
- Opciones de despliegue: mlx-vlm (librería principal, con el comando `python -m mlx_vlm generate`); otras opciones como vLLM, llama.cpp, Ollama o TGI no están indicadas en la información disponible y, dado el formato MLX, no son directamente compatibles.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-VL-2B-Heretic-mxfp8 (este) | ~1,92 B | no disponible | MLX safetensors (MXFP8) | no disponible | Hugging Face, 0 descargas |
| LiquidAI/LFM3-VL-2B | no disponible | no disponible | safetensors | términos de Liquid AI (no detallados) | Hugging Face (modelo oficial) |
| nxfx21/LFM3-VL-2B-Heretic | ~1,92 B (presumiblemente) | no disponible | safetensors | no disponible | Hugging Face (modelo base de esta cuantización) |

No se dispone de datos de rendimiento comparativo entre estas variantes ni con modelos de otras familias de tamaño similar; la comparación se limita a parámetros, formato y procedencia.

## Limitaciones y advertencias

- Modelo abliterated: la supresión de los mecanismos de rechazo implica que el modelo puede generar contenido que el modelo original declinaría, incluyendo material potencialmente dañino, ofensivo o inseguro. No es recomendable su uso en aplicaciones de cara al público sin filtros externos.
- Riesgo de alucinación: como todo modelo de lenguaje de tamaño reducido, puede inventar detalles sobre el contenido de las imágenes o en sus respuestas textuales.
- Licencia no disponible: no se especifica la licencia de esta cuantización; el uso comercial queda sujeto a los términos de la licencia original de LiquidAI/LFM3-VL-2B, que no se detallan en la información proporcionada. Verificar antes de cualquier despliegue en producción.
- Idiomas soportados no documentados: se desconoce el grado de competencia multilingüe, especialmente en castellano.
- Longitud de contexto no documentada: no se puede planificar su uso en tareas que requieran ventanas largas sin verificación empírica.
- Compatibilidad limitada: el formato MLX restringe su ejecución a hardware Apple Silicon; no es portable a GPUs NVIDIA ni a la mayoría de infraestructuras de servidores convencionales.
- Procedencia no oficial: es una modificación de un particular, sin garantías de mantenimiento, soporte ni validación por parte de Liquid AI.
- Sesgos: no documentados, pero heredados presumiblemente del modelo base y potencialmente amplificados por la abliteración.
- Sin tracción comunitaria: cero descargas y cero "likes" en el momento de la consulta, lo que reduce la probabilidad de que los problemas estén detectados y documentados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nxfx21/LFM3-VL-2B-Heretic-mxfp8
- Modelo base de la cuantización: https://huggingface.co/nxfx21/LFM3-VL-2B-Heretic
- Modelo original de Liquid AI: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Herramienta de abliteración Heretic: https://github.com/p-e-w/heretic
- Organización Liquid AI en Hugging Face: https://huggingface.co/LiquidAI
