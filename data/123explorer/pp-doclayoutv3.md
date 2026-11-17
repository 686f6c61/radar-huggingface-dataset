# 123explorer/pp-doclayoutv3

## Resumen

`123explorer/pp-doclayoutv3` es un fine-tune del modelo de detección de layout documental `PaddlePaddle/PP-DocLayoutV3`, publicado por el usuario `123explorer`. Se distribuye como un modelo de object detection (con pipeline `object-detection` e `image-segmentation`) orientado a la detección de regiones estructurales en imágenes de documentos: bloques de texto, títulos, tablas, figuras y demás elementos de layout. El modelo se presenta como un "módulo de layout unificado" para pipelines de OCR como PaddleOCR-VL 1.5/1.6, GLM-OCR y Xiaomi-OCR.

Con 33.288.957 parámetros (dato real de los safetensors) y un tamaño de repositorio de 0,1 GB, es un modelo compacto pensado para integrarse como etapa de preprocesado en pipelines de digitalización documental, no como un modelo generativo. La arquitectura es de detección de objetos sobre backbone convolucional (familia PaddleDetection/PaddleOCR), exportada a formato `transformers` con pesos `safetensors`.

Es relevante porque el layout detection es una pieza crítica en cualquier sistema de OCR estructurado: determina qué regiones se envían a OCR, en qué orden de lectura y cómo se reconstruye la estructura del documento. La licencia Apache 2.0 y su tamaño reducido lo hacen desplegable en CPU y GPU de consumo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Detección de objetos (familia PP-DocLayout de PaddleOCR/PaddleDetection) |
| Parámetros totales | 33.288.957 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de texto) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en, zh, multilingual |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | PaddlePaddle/PP-DocLayoutV3 |
| Pipeline | object-detection |
| Tamaño del repositorio | 0,1 GB |
| Fecha de publicación | 2026-11-17 |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `PaddlePaddle/PP-DocLayoutV3`, el módulo de detección de layout de la familia PaddleOCR. Se trata de un detector de objetos (no un transformer generativo) que recibe una imagen de documento y devuelve cajas delimitadoras con etiquetas de clase para cada región estructural. La model card lo describe como "Unified Layout Module for PaddleOCR-VL 1.5/1.6 & GLM-OCR & Xiaomi-OCR-0", lo que indica que el objetivo es servir como etapa común de layout para varios pipelines de OCR-VL.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset de fine-tune, ni si se aplicaron técnicas de RLHF/DPO (no aplicables a un detector). El modelo base PP-DocLayoutV3 está asociado al paper con identificador arXiv 2606.23344, referenciado en los tags del repositorio. Tampoco se documentan innovaciones técnicas específicas del fine-tune más allá de la herencia del modelo base.

## Capacidades

- Detección de layout documental: identificación de regiones estructurales (texto, títulos, tablas, figuras, etc.) en imágenes de documentos.
- Segmentación de imagen: el tag `image-segmentation` sugiere salida a nivel de región/máscara además de cajas.
- Integración en pipelines OCR: diseñado como módulo de layout para PaddleOCR-VL 1.5/1.6, GLM-OCR y Xiaomi-OCR.
- Soporte multilingüe a nivel de documento: etiquetado como en, zh y multilingual, aunque la tarea es visual y no lingüística.
- Compatible con `transformers` y con endpoints (tag `endpoints_compatible`).
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: no es un modelo generativo.

## Casos de uso

- Digitalización de documentos escaneados: el modelo detecta las regiones de texto, tablas y figuras antes de enviarlas a un motor OCR, permitiendo reconstruir el orden de lectura y la estructura del documento.
- Extracción de tablas en facturas y estados financieros: al aislar las regiones de tabla, se pueden aplicar extractores especializados solo a esas áreas, reduciendo errores de OCR en el resto del documento.
- Procesamiento de PDFs científicos: separa títulos, autores, cuerpo, figuras y referencias para indexación estructurada en repositorios académicos.
- Preprocesado en pipelines OCR-VL: actúa como módulo de layout unificado para PaddleOCR-VL, GLM-OCR o Xiaomi-OCR, alimentando cada región al modelo correspondiente.
- Archivística y gestión documental: clasificación y segmentación automática de lotes de documentos escaneados para su catalogación.
- Automatización de formularios y recibos: detección de bloques de campos y valores para su posterior extracción con reglas o modelos especializados.
- Indexación de documentos para RAG: la estructura detectada permite trocear documentos por secciones semánticas en lugar de por longitud fija de caracteres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (33,3 M de parámetros); en la práctica, el consumo dominado por las activaciones de imagen es de pocos cientos de MB.
- GPU recomendadas: cualquier GPU moderna sirve; A100/H100 no son necesarias. Una RTX 4090, RTX 3090 o incluso una GTX 1650 son suficientes.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 2 GB de VRAM; también es viable en CPU para lotes pequeños.
- Opciones de despliegue: `transformers` (pipeline `object-detection`), PaddlePaddle/PaddleOCR nativo, y exportación a ONNX para servir con ONNX Runtime. No se documenta soporte explícito de vLLM, llama.cpp, Ollama o TGI (no aplicables a un detector).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| 123explorer/pp-doclayoutv3 | 33,3 M | Layout detection | Apache 2.0 | Hugging Face |
| PaddlePaddle/PP-DocLayoutV3 (base) | no disponible | Layout detection | no disponible en la información | Hugging Face, ModelScope |
| Otros detectores de layout de la familia PaddleOCR | no disponible | Layout detection | no disponible | Hugging Face, ModelScope |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Es un detector de layout, no un modelo de lenguaje: no genera texto ni responde a instrucciones.
- No se documentan sesgos específicos; al ser un modelo visual, puede presentar sesgos según la distribución de documentos de entrenamiento (idiomas, tipos de maquetación, calidad de escaneo).
- Riesgo de falsos positivos/negativos en layouts atípicos (documentos muy densos, tablas complejas, maquetaciones no vistas en entrenamiento).
- El fine-tune es de un autor individual (`123explorer`) con 0 descargas y 0 likes en el momento de la ficha; no hay validación comunitaria ni benchmarks publicados.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base PP-DocLayoutV3 y de los datos de fine-tune.
- El tag `multilingual` es genérico; el soporte real de idiomas depende del modelo base y no está cuantificado.
- No hay información sobre cuantizaciones disponibles ni sobre latencia en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/123explorer/pp-doclayoutv3
- Modelo base: https://huggingface.co/PaddlePaddle/PP-DocLayoutV3
- Modelo base en ModelScope: https://modelscope.cn/models/PaddlePaddle/PP-DocLayoutV3
- Repositorio PaddleOCR: https://github.com/PaddlePaddle/PaddleOCR
- Paper referenciado (arXiv 2606.23344): https://arxiv.org/abs/2606.23344
