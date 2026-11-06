# PaddlePaddle/PaddleOCR-VL

## Resumen

PaddleOCR-VL es un modelo de visión-lenguaje (VLM) especializado en el análisis y extracción de contenido de documentos, desarrollado por el equipo PaddlePaddle de Baidu. Su componente central es PaddleOCR-VL-0.9B, un modelo compacto de aproximadamente 958 millones de parámetros que combina un codificador visual de resolución dinámica de estilo NaViT con el modelo de lenguaje ERNIE-4.5-0.3B. Está diseñado para tareas de reconocimiento de elementos en documentos: texto, maquetación (layout), tablas, fórmulas y gráficos.

El modelo resuelve el problema del *document parsing* multilingüe con un coste computacional muy contenido: frente a VLMs de decenas de miles de millones de parámetros, ofrece un rendimiento de estado del arte en su categoría con menos de mil millones de parámetros, lo que lo hace desplegable en hardware modesto. Es relevante en el contexto actual de digitalización masiva de documentos, pipelines RAG sobre PDFs y automatización de extracción de datos estructurados.

La versión publicada en Hugging Face corresponde a la librería PaddleOCR y se distribuye bajo licencia Apache 2.0, con pesos en formato safetensors y soporte multilingüe (inglés, chino y otros idiomas). Existe una versión posterior, PaddleOCR-VL-1.6, indicada en la model card como `new_version`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM: codificador visual estilo NaViT de resolución dinámica + LLM ERNIE-4.5-0.3B |
| Parametros totales | 958.588.736 (~0,96B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh, multilingual |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (custom_code, librería PaddleOCR) |

## Arquitectura y entrenamiento

PaddleOCR-VL-0.9B es un modelo visión-lenguaje que empareja un codificador visual de resolución dinámica inspirado en NaViT con el modelo de lenguaje ERNIE-4.5-0.3B de Baidu. El codificador visual procesa la imagen del documento a resolución variable, lo que permite manejar documentos con distintas densidades de texto y maquetaciones sin un redimensionado fijo agresivo. El modelo de lenguaje se encarga del reconocimiento de elementos y la generación de la salida estructurada.

El modelo parte de `baidu/ERNIE-4.5-0.3B-Paddle` como modelo base y se afina específicamente para tareas de *document parsing*. La model card lo describe como un modelo de estado del arte y eficiente en recursos para el análisis de documentos, con capacidad de reconocimiento preciso de elementos. No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) multilingüe sobre imágenes de documentos.
- Análisis de maquetación (*layout*): identificación de bloques, secciones y estructura del documento.
- Extracción y reconocimiento de tablas.
- Reconocimiento de fórmulas matemáticas.
- Interpretación de gráficos (*chart*).
- Generación de texto a partir de imagen (*image-to-text* / *image-text-to-text*).
- Procesamiento conversacional multimodal (tag `conversational`).
- Soporte multilingüe (inglés, chino y otros idiomas).
- Soporte de *tool calling* / *function calling*: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Digitalización de facturas y albaranes: el modelo extrae texto, tablas y campos estructurados de documentos escaneados, adecuado por su especialización en tablas y maquetación y por su reducido tamaño, que permite procesar lotes grandes en hardware asequible.
- Construcción de pipelines RAG sobre PDFs: convierte documentos densos (informes, manuales, papers) en texto estructurado con maquetación preservada, mejorando la calidad de los fragmentos indexados.
- Procesamiento de documentación científica: reconocimiento de fórmulas matemáticas y tablas en artículos académicos para su reutilización en bases de conocimiento.
- Extracción de datos de formularios y documentos administrativos: identificación de bloques y campos mediante el análisis de layout para automatizar la entrada de datos.
- Análisis de gráficos en informes financieros: interpretación de *charts* embebidos para extraer series y etiquetas.
- OCR multilingüe en aplicaciones de digitalización: soporte de inglés, chino y otros idiomas para digitalizar corpus mixtos.
- Preprocesado en sistemas de gestión documental: normalización de documentos heterogéneos a texto estructurado antes de tareas posteriores de NLP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~0,96B parámetros, en FP16 requiere aproximadamente 2 GB de pesos; en cuantizaciones de 8 bits o 4 bits el consumo baja a alrededor de 1 GB o menos. No se dispone de cifras oficiales de VRAM en la información proporcionada.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, el modelo es apto para GPU de consumo.
- Cabe en GPU de consumo: sí, por su tamaño inferior a mil millones de parámetros; modelos concretos no disponibles en la información.
- Opciones de despliegue: la librería oficial es PaddleOCR (PaddlePaddle); también se publica en Hugging Face (pipeline `image-text-to-text`) y ModelScope. Soporte explícito de vLLM, llama.cpp, Ollama o TGI: no disponible en la información proporcionada.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PaddleOCR-VL | ~0,96B | no disponible | Document parsing (OCR, layout, tablas, fórmulas) | apache-2.0 | Hugging Face, ModelScope |
| ERNIE-4.5-0.3B (modelo base) | 0,3B | no disponible | LLM de texto | no disponible en la información | Hugging Face (baidu) |
| Alternativas VLM de document parsing de mayor tamaño | no disponible | no disponible | Document parsing | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento ni de especificaciones de modelos competidores directos que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Es un modelo especializado en *document parsing*; no está pensado como LLM generalista ni para razonamiento abierto.
- Riesgo de alucinación en la transcripción de texto o estructuras, especialmente con documentos de baja calidad, manuscritos o maquetaciones complejas.
- Longitud de contexto no documentada en la información disponible; documentos muy extensos pueden requerir segmentación previa.
- Cobertura idiomática declarada como multilingüe, con inglés y chino como idiomas principales; el rendimiento en otros idiomas no está cuantificado en la información disponible.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las dependencias de la librería PaddleOCR y del modelo base ERNIE.
- Existe una versión posterior (PaddleOCR-VL-1.6) indicada en la model card; para producción conviene evaluar esa versión.
- Requiere la librería PaddleOCR y pesos con `custom_code`; la integración con otros runtimes puede no ser directa.
- No se han publicado en la información disponible datos de sesgos ni evaluaciones de robustez.

## Enlaces

- Hugging Face: https://huggingface.co/PaddlePaddle/PaddleOCR-VL
- ModelScope: https://modelscope.cn/models/PaddlePaddle/PaddleOCR-VL
- Repositorio GitHub PaddleOCR: https://github.com/PaddlePaddle/PaddleOCR
- Documentación PaddleOCR-VL: http://www.paddleocr.ai/main/en/version3.x/algorithm/PaddleOCR-VL/PaddleOCR-VL.html
- Modelo base ERNIE-4.5-0.3B: https://huggingface.co/baidu/ERNIE-4.5-0.3B-Paddle
- Paper (arXiv): https://arxiv.org/abs/2510.14528
- Versión posterior: https://huggingface.co/PaddlePaddle/PaddleOCR-VL-1.6
