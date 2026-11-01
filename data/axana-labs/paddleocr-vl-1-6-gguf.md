# axana-labs/PaddleOCR-VL-1.6-GGUF

## Resumen

PaddleOCR-VL-1.6 es un modelo especializado en el análisis y extracción de documentos (document parsing) desarrollado por PaddlePaddle, el framework de aprendizaje profundo de Baidu. Este repositorio concreto, publicado por axana-labs, contiene una versión cuantizada en formato GGUF del modelo original, lo que permite su ejecución en entornos con recursos limitados y su integración con herramientas de inferencia local como llama.cpp u Ollama. El modelo resuelve el problema de convertir documentos visuales (PDF, imágenes escaneadas, capturas) en texto estructurado y semánticamente comprensible.

La versión 1.6 introduce dos innovaciones técnicas principales según su model card: "Under-Optimized Region Refinement" (refinamiento de regiones infra-optimizadas) y "Progressive Post-Training" (post-entrenamiento progresivo). Con 466.654.208 parámetros totales (aproximadamente 466 millones), se posiciona como un modelo compacto pero especializado, diseñado para tareas de OCR y comprensión de layout documental más que para generación de texto general.

El modelo se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial, y está etiquetado como "endpoints_compatible" y "conversational", sugiriendo soporte para despliegue en infraestructuras de inferencia estándar y capacidad de interacción conversacional. Su relevancia actual radica en la creciente demanda de pipelines automatizados de digitalización y extracción de datos de documentos en entornos empresariales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo especializado en visión-lenguaje para parsing documental) |
| Parámetros totales | 466.654.208 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF (el repositorio contiene pesos cuantizados, niveles específicos no disponibles) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo más allá de su especialización en parsing documental. Por el nombre y el contexto (PaddleOCR-VL), se trata de un modelo de visión-lenguaje (VL) que combina un codificador visual con un decodificador de lenguaje para procesar imágenes de documentos y generar representaciones estructuradas. El repositorio GGUF sugiere que los pesos originales han sido convertidos para su uso con motores de inferencia compatibles con este formato.

El entrenamiento, según la model card, emplea una estrategia de "Progressive Post-Training" junto con "Under-Optimized Region Refinement", técnicas que probablemente abordan la mejora iterativa en regiones del documento donde el modelo inicialmente rinde peor (texto pequeño, tablas complejas, layouts irregulares). No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni si se utilizaron técnicas de RLHF o DPO.

## Capacidades

- Extracción de texto de documentos visuales (OCR) con preservación de estructura.
- Comprensión de layout documental: identificación de tablas, columnas, encabezados y bloques de texto.
- Parsing de documentos complejos gracias al refinamiento de regiones infra-optimizadas.
- Capacidad conversacional (etiqueta "conversational" en el repositorio).
- Compatibilidad con endpoints de inferencia estándar (etiqueta "endpoints_compatible").
- Procesamiento de imágenes de documentos en formato visual (implícito en la naturaleza VL del modelo).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, visión o audio: visión implícita por la tarea; no se detallan otras capacidades especiales.

## Casos de uso

- Digitalización masiva de archivos empresariales: el modelo puede procesar lotes de PDF escaneados y extraer texto estructurado para su indexación en sistemas de gestión documental, aprovechando su especialización en regiones complejas del documento.
- Extracción de datos de facturas y recibos: adecuado para identificar campos clave (importes, fechas, emisores) en documentos financieros con layouts variables, gracias al refinamiento de regiones infra-optimizadas.
- Automatización de entrada de datos en CRM/ERP: integración en pipelines que convierten formularios e imágenes en registros estructurados, reduciendo la intervención manual.
- Procesamiento de documentación legal y contratos: extracción de cláusulas y secciones con estructura jerárquica, útil para sistemas de revisión automatizada.
- Análisis de tablas en informes técnicos: el modelo puede interpretar tablas complejas y convertirlas en formatos estructurados (CSV, JSON) para su posterior análisis.
- Digitalización de archivos históricos y académicos: procesamiento de documentos escaneados de baja calidad o con tipografías antiguas, donde el refinamiento progresivo aporta ventajas.
- Integración en asistentes conversacionales documentales: gracias a su naturaleza conversacional, puede emplearse en interfaces donde el usuario sube un documento y formula preguntas sobre su contenido.
- Pipelines de accesibilidad: conversión de documentos visuales a texto para lectores de pantalla y sistemas de accesibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 466 millones de parámetros, en cuantización GGUF de 4 bits se estima un uso de aproximadamente 0,3-0,5 GB de VRAM (sin contar el codificador visual ni overhead); en 8 bits, alrededor de 0,6-0,9 GB. Estas cifras son estimaciones basadas en el número de parámetros, no datos oficiales.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) puede ejecutar el modelo con holgura; para despliegue en producción con concurrencia, se recomiendan GPUs de datacenter como A100 o H100.
- ¿Cabe en consumer GPU? Sí, con amplio margen; incluso GPUs con 4-6 GB de VRAM deberían poder cargarlo en cuantizaciones bajas.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier motor compatible con GGUF; también podría desplegarse mediante servidores compatibles con endpoints estándar (etiqueta "endpoints_compatible").
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| PaddleOCR-VL-1.6 (este) | 466 M | no disponible | Apache 2.0 | GGUF | HuggingFace |
| PaddleOCR-VL-1.6 (original) | 466 M | no disponible | Apache 2.0 | safetensors (presumible) | HuggingFace, ModelScope |
| Alternativas de OCR/VL | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables directos en la documentación proporcionada. La comparativa más directa es con la versión original del mismo modelo (sin cuantizar), disponible en el repositorio oficial de PaddlePaddle.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada; al ser un modelo entrenado por PaddlePaddle, podría heredar sesgos de los datasets de documentos utilizados.
- Riesgo de alucinación: presente en modelos de visión-lenguaje; puede generar texto inexistente en documentos con baja calidad de imagen o layouts atípicos.
- Limitaciones de contexto o idioma: no se especifican idiomas soportados ni longitud de contexto; se recomienda validar el rendimiento en el idioma y tipo de documento objetivo antes de producción.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se mantenga el aviso de licencia y se atribuya adecuadamente.
- Caveats para producción: al ser una cuantización GGUF no oficial (publicada por axana-labs, no por PaddlePaddle), puede haber degradación de precisión respecto al modelo original; se recomienda evaluar la calidad de extracción en el dominio específico antes de desplegar. El repositorio tiene muy pocas descargas (106) y ningún "like", lo que sugiere poca validación comunitaria.
- La model card está truncada en la información proporcionada, por lo que podrían existir detalles adicionales no recogidos aquí.

## Enlaces

- Repositorio HuggingFace (GGUF): https://huggingface.co/axana-labs/PaddleOCR-VL-1.6-GGUF
- Repositorio HuggingFace (original): https://huggingface.co/PaddlePaddle/PaddleOCR-VL-1.6
- ModelScope (original): https://modelscope.cn/models/PaddlePaddle/PaddleOCR-VL-1.6
- Repositorio GitHub PaddleOCR: https://github.com/PaddlePaddle/PaddleOCR
- Paper (referencia arXiv): arxiv:2606.03264 (según tags del repositorio)
