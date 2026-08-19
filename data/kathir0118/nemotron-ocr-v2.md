# Kathir0118/nemotron-ocr-v2

## Resumen

Nemotron OCR v2 es un modelo de reconocimiento óptico de caracteres (OCR) de extremo a extremo desarrollado por NVIDIA, diseñado para extraer texto de imágenes complejas del mundo real, incluyendo documentos, escenas naturales y contenido multilingüe. Forma parte de la colección NVIDIA NeMo Retriever, orientada a pipelines de recuperación de información y generación aumentada por recuperación (RAG). El modelo combina tres componentes neuronales entrenados conjuntamente: un detector de regiones de texto basado en RegNetX-8GF, un reconocedor Transformer pre-norm y un modelo relacional que analiza el diseño y el orden de lectura.

Se distribuye en dos variantes: `v2_english`, optimizada para inglés con manejo a nivel de palabra, y `v2_multilingual`, que soporta inglés, chino (simplificado y tradicional), japonés, coreano y ruso con manejo a nivel de línea. La variante multilingüe tiene 83,85 millones de parámetros, mientras que la inglesa tiene 53,83 millones. El modelo está disponible bajo la NVIDIA Open Model License, con una cláusula adicional de Apache 2.0, y está pensado para uso comercial en producción.

El repositorio analizado (Kathir0118/nemotron-ocr-v2) es una copia del modelo original alojado en `nvidia/nemotron-ocr-v2`. No se han publicado métricas de rendimiento en la información disponible, pero su arquitectura ligera y su enfoque en latencia y throughput lo hacen adecuado para despliegues en entornos empresariales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector-reconocedor híbrido con modelo relacional (RegNetX-8GF + Transformer pre-norm) |
| Parametros totales | v2_english: 53,831,335; v2_multilingual: 83,853,044 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el reconocedor soporta secuencias de hasta 32 tokens en v2_english y 128 en v2_multilingual) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en, zh, ja, ko, ru, es, fr, de, it, nl, pt |
| Licencia | NVIDIA Open Model License (con cláusula adicional Apache 2.0) |
| Formato de pesos | No disponible |

## Arquitectura y entrenamiento

Nemotron OCR v2 emplea una arquitectura híbrida de tres componentes entrenados de forma conjunta y de extremo a extremo. El detector utiliza un backbone convolucional RegNetX-8GF para localizar regiones de texto en la imagen. El reconocedor es un Transformer pre-norm con atención de múltiples cabezas que transcribe el texto de cada región detectada; la variante multilingüe tiene 6 capas, dimensión oculta de 512 y un conjunto de caracteres de 14,244, mientras que la inglesa tiene 3 capas, dimensión 256 y 855 caracteres. El modelo relacional aplica módulos globales multicapa para predecir agrupaciones lógicas, orden de lectura y relaciones de diseño entre los elementos de texto detectados.

No se han proporcionado detalles sobre el volumen de datos de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO. La documentación indica que los datos se seleccionaron de forma responsable y auditable, y que el modelo está optimizado para velocidad y precisión en documentos y escenas naturales. La entrada acepta imágenes RGB en formato PNG/JPEG con valores float32 o uint8, y soporta procesamiento por lotes con redimensionado automático multiescala.

## Capacidades

- Reconocimiento de texto multilingüe: soporta 11 idiomas, incluyendo inglés, chino, japonés, coreano, ruso y varios idiomas europeos (es, fr, de, it, nl, pt).
- Detección de regiones de texto: localiza bloques de texto en imágenes complejas, incluyendo texto multilínea, multibloque y escenas naturales.
- Análisis de diseño y orden de lectura: el modelo relacional predice la estructura lógica del documento, agrupaciones y el orden correcto de lectura.
- Procesamiento por lotes: acepta múltiples imágenes a la vez, con redimensionado automático para mejorar la precisión.
- Integración en pipelines de RAG y agentes: diseñado para alimentar sistemas de recuperación multimodal y aplicaciones de generación aumentada.
- Producción lista: enfocado en baja latencia y alto throughput, con soporte empresarial a través de NVIDIA NIM y NGC.

## Casos de uso

- Digitalización de documentos empresariales: extraer texto de facturas, contratos y formularios escaneados para su indexación en sistemas de gestión documental, gracias a su capacidad de análisis de diseño y orden de lectura.
- Construcción de pipelines RAG multimodales: convertir imágenes de documentos en texto estructurado para alimentar bases vectoriales y motores de búsqueda semántica, aprovechando su soporte multilingüe.
- Asistentes de atención al cliente: procesar capturas de pantalla, fotos de tickets o mensajes con texto para extraer información relevante y responder consultas automáticamente.
- Automatización de entrada de datos: extraer campos específicos de documentos como recibos, albaranes o formularios para integrarlos en ERP o CRM, gracias a la detección precisa de regiones de texto.
- Análisis de documentos históricos o multilingües: transcribir textos en varios idiomas (chino, japonés, coreano, ruso) para archivos digitales o investigación académica.
- Agentes de razonamiento visual: combinar la salida del OCR con modelos de lenguaje para responder preguntas sobre imágenes, como en sistemas de asistencia técnica o revisión de documentos legales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente. Dado el tamaño de parámetros (53-84 millones), el modelo es ligero y debería caber en GPUs con 4-8 GB de VRAM en inferencia, pero no se confirma.
- GPU recomendadas: no se especifican. Por su tamaño, sería viable en GPUs consumer como RTX 3060, RTX 4090, así como en GPUs de datacenter como A100 o H100 para alto rendimiento.
- Opciones de despliegue: disponible como microservicio en NVIDIA NIM y contenedor NGC (nemoretriever-ocr-v2). También se puede ejecutar localmente con frameworks de inferencia de visión, aunque no se mencionan herramientas específicas como vLLM o llama.cpp (no aplicables a este tipo de modelo).
- Latencia y throughput: no se proporcionan datos cuantitativos, pero el diseño está optimizado para baja latencia y alto throughput en producción.

## Comparativa con modelos similares

No se dispone de datos comparativos oficiales con otras soluciones de OCR. Como alternativas de la misma categoría se pueden considerar:

| Modelo | Parametros | Idiomas | Licencia | Notas |
|---|---|---|---|---|
| Nemotron OCR v2 | 53-84 M | 11 | NVIDIA Open Model License | Enfocado en producción y RAG |
| PaddleOCR | ~5-10 M (según variante) | 80+ | Apache 2.0 | OCR ligero y multilingüe, muy usado en la comunidad |
| Tesseract | No aplica (algoritmo clásico) | 100+ | Apache 2.0 | OCR tradicional, sin redes neuronales profundas |

La comparación es orientativa; no se han evaluado rendimientos relativos en la información disponible.

## Limitaciones y advertencias

- La variante `v2_english` solo maneja texto en inglés y a nivel de palabra; la variante multilingüe cubre un conjunto limitado de idiomas (11), aunque la etiqueta de HuggingFace lista más.
- No se han publicado métricas de precisión, por lo que el rendimiento real en tareas específicas debe validarse con datos propios.
- La licencia NVIDIA Open Model License puede imponer restricciones de uso comercial; se recomienda revisar el acuerdo completo antes de desplegar en producción.
- Riesgo de alucinación en textos poco legibles o con ruido, común en modelos de OCR.
- El modelo no incluye capacidades de generación de lenguaje; es exclusivamente un extractor de texto y diseño.
- El repositorio analizado es una copia de terceros (Kathir0118) y no está verificado como oficial; se recomienda usar el repositorio original de NVIDIA.

## Enlaces

- Repositorio analizado: https://huggingface.co/Kathir0118/nemotron-ocr-v2
- Repositorio original: https://huggingface.co/nvidia/nemotron-ocr-v2
- Model card en NVIDIA NIM: https://build.nvidia.com/nvidia/nemotron-ocr-v2/modelcard
- Contenedor NGC: https://catalog.ngc.nvidia.com/orgs/nvidia/teams/nemo-microservices/containers/nemoretriever-ocr-v2
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/nvidia/nemotron-ocr-v2
- Página de modelos Nemotron: https://developer.nvidia.com/topics/ai/nemotron
