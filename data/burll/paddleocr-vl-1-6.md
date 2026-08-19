# burll/PaddleOCR-VL-1.6

## Resumen

PaddleOCR-VL-1.6 es un modelo de visión-lenguaje (VLM) ligero de aproximadamente 0.96 mil millones de parámetros, desarrollado por el equipo de PaddlePaddle, especializado en el análisis y parsing de documentos. Su propósito es transformar documentos escaneados, imágenes y PDFs en datos estructurados (texto, tablas, fórmulas, gráficos, sellos, etc.) para su uso en pipelines de procesamiento de documentos, especialmente orientados a la era de los grandes modelos de lenguaje. El modelo se basa en la arquitectura ERNIE 4.5 e integra capacidades de OCR, detección de layout, reconocimiento de tablas y fórmulas, y comprensión conversacional de imágenes.

La relevancia de esta versión radica en que logra una precisión del 96,3 % en el benchmark OmniDocBench v1.6, superando a modelos generalistas mucho más grandes como Gemini-3 Pro o Qwen3-VL-235B-A22B-Instruct, y a la vez mantiene un tamaño reducido que permite su despliegue en hardware de consumo. El modelo introduce mejoras específicas en regiones suboptimizadas del procesamiento de documentos, como caracteres raros, documentos antiguos y sellos, mediante un post-entrenamiento progresivo. Se distribuye bajo licencia Apache 2.0 y está disponible en HuggingFace, ModelScope y el repositorio oficial de PaddleOCR.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language Model basado en ERNIE 4.5 (transformer) |
| Parametros totales | 958.588.736 (~0,96 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles, chino, multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

PaddleOCR-VL-1.6 es un modelo de vision-lenguaje (VLM) que combina un codificador visual con un decodificador de lenguaje basado en la arquitectura ERNIE 4.5. A diferencia de modelos puramente OCR, integra capacidades de razonamiento y generación de texto, lo que le permite no solo reconocer texto, sino también interpretar la estructura del documento (layout, tablas, fórmulas, gráficos) y responder a consultas conversacionales sobre la imagen. El modelo está diseñado para procesar imágenes completas y generar descripciones estructuradas en formato de texto, incluyendo bounding boxes para elementos detectados (spotting).

El entrenamiento se describe como un proceso de "refinamiento de regiones suboptimizadas" y "post-entrenamiento progresivo". Esto implica que, partiendo de la versión anterior (1.5), se identificaron áreas donde el modelo fallaba (por ejemplo, caracteres poco frecuentes, sellos, documentos antiguos, gráficos complejos) y se aplicaron técnicas de optimización específicas sobre esos casos. No se han publicado datos detallados sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de técnicas como RLHF o DPO. El modelo agradece contribuciones de ERNIE, Keye, MinerU y OmniDocBench en su desarrollo.

## Capacidades

- OCR y reconocimiento de texto en imágenes y documentos escaneados, con soporte multilingüe (inglés, chino y otros).
- Análisis de layout: detección de bloques de texto, títulos, párrafos, columnas y estructura general del documento.
- Reconocimiento de tablas y extracción de datos tabulares en formato estructurado.
- Reconocimiento de fórmulas matemáticas (tanto en línea como en bloque) y su conversión a representaciones como LaTeX.
- Detección y reconocimiento de gráficos (charts) y diagramas, incluyendo su descripción semántica.
- Reconocimiento de sellos y marcas de agua, con capacidad de localización (spotting).
- Procesamiento de documentos antiguos y caracteres raros, con precisión mejorada frente a versiones anteriores.
- Interacción conversacional: el modelo acepta imágenes y preguntas en lenguaje natural, devolviendo respuestas textuales (image-text-to-text).
- Integración con el ecosistema PaddleOCR para pipelines de parsing de documentos completos.

## Casos de uso

- Digitalización de archivos históricos: el modelo puede procesar documentos antiguos con caracteres desgastados o poco comunes, extrayendo el texto y su estructura para su archivado y búsqueda posterior.
- Extracción de datos de facturas y recibos: gracias a su capacidad de reconocer tablas y layout, puede convertir facturas escaneadas en registros estructurados (número, fecha, importe, proveedor) listos para integrar en sistemas contables.
- Parsing de artículos científicos: reconoce fórmulas matemáticas, tablas de resultados y gráficos, permitiendo la conversión de PDFs de investigación en representaciones semánticas procesables por LLMs.
- Automatización de formularios administrativos: extrae campos de formularios escaneados (nombre, DNI, direcciones) y los valida contra bases de datos, reduciendo la intervención manual.
- Generación de metadatos para motores de búsqueda documental: al identificar la estructura y el contenido de documentos, puede generar resúmenes y etiquetas para sistemas de recuperación de información.
- Accesibilidad: convierte documentos escaneados en texto legible por lectores de pantalla, incluyendo la descripción de tablas y gráficos para personas con discapacidad visual.
- Análisis de informes financieros: extrae datos de tablas y gráficos en informes anuales o trimestrales para alimentar modelos de análisis predictivo.
- Asistente conversacional de documentos: integrado en chatbots o asistentes, permite a los usuarios hacer preguntas sobre el contenido de un documento subido, como "¿cuál es el total de ventas en 2025?".

## Benchmarks y rendimiento

Según la información disponible, PaddleOCR-VL-1.6 alcanza una precisión del 96,3 % en el benchmark OmniDocBench v1.6, logrando el estado del arte (SOTA) en las categorías globales de texto, fórmulas y tablas. La documentación indica que supera a modelos generalistas como Gemini-3 Pro y Qwen3-VL-235B-A22B-Instruct en este benchmark, aunque no se proporcionan los valores exactos de estos competidores. La versión anterior (1.5) obtuvo un 94,5 % en OmniDocBench v1.5, lo que muestra una mejora significativa.

No se han publicado resultados detallados para otros benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Tampoco se dispone de una tabla comparativa con métricas desglosadas por categoría más allá de la mención de liderazgo en texto, fórmulas y tablas.

## Requisitos de hardware

- El modelo tiene aproximadamente 0,96 mil millones de parámetros. En precisión FP16, el peso ocupa alrededor de 1,9 GB (coincide con el tamaño del repositorio), por lo que se puede cargar en GPUs con al menos 4 GB de VRAM si se usa cuantización de 4 bits, o 8 GB para FP16 con overhead de inferencia.
- GPU recomendadas: tarjetas de consumo como NVIDIA RTX 3060 (12 GB), RTX 4070, RTX 4090, o GPUs de datacenter como A10, A100, L4. Para despliegues en producción con alta concurrencia, se recomienda al menos una A100 40 GB o H100.
- Al ser un modelo ligero, cabe en GPUs de consumo de gama media (8-12 GB VRAM) sin necesidad de hardware especializado.
- Opciones de despliegue: el modelo se distribuye con la librería PaddleOCR, por lo que se puede ejecutar mediante el pipeline oficial de PaddleOCR (PaddlePaddle). También es compatible con HuggingFace Transformers (gracias al tag custom_code) y puede servirse con vLLM o TGI si se adapta. Para entornos locales, se puede usar llama.cpp u Ollama si se convierte a formato GGUF (no se indica que exista oficialmente).
- Latencia y throughput: no se han publicado cifras oficiales. Dado el tamaño del modelo, se estima una latencia de decodificación de entre 20 y 50 ms por token en una GPU moderna, dependiendo de la cuantización y el batch.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | OmniDocBench v1.6 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PaddleOCR-VL-1.6 | 0,96 B | no disponible | 96,3 % (SOTA) | Apache 2.0 | HuggingFace, ModelScope |
| PaddleOCR-VL-1.5 | ~0,9 B | no disponible | 94,5 % (en v1.5) | Apache 2.0 | HuggingFace, ModelScope |
| Gemini-3 Pro | no disponible | no disponible | inferior a PaddleOCR-VL-1.6 (no se especifica valor) | propietaria | API |
| Qwen3-VL-235B-A22B-Instruct | 235 B (MoE, 22 B activos) | no disponible | inferior a PaddleOCR-VL-1.6 (no se especifica valor) | Apache 2.0 | HuggingFace |

No se dispone de datos de otros benchmarks comparativos (como MMLU o HumanEval) para estos modelos. La comparativa se centra en el rendimiento en parsing de documentos, donde PaddleOCR-VL-1.6 destaca por su eficiencia al ser significativamente más pequeño que los competidores generalistas.

## Limitaciones y advertencias

- No se han publicado estudios específicos sobre sesgos del modelo. Al estar entrenado principalmente en documentos en inglés y chino, su rendimiento en otros idiomas puede ser inferior, especialmente en escrituras no latinas o con caracteres poco representados.
- Riesgo de alucinación: como todo modelo generativo, puede producir texto incorrecto o inventar contenido cuando la imagen es ambigua o de baja calidad. En entornos de producción, se recomienda validar las salidas con reglas de negocio.
- La longitud de contexto no está documentada, lo que limita la capacidad de procesar documentos extremadamente largos en una sola pasada. Para documentos de muchas páginas, puede ser necesario dividirlos en fragmentos.
- No se especifican los tipos de cuantización soportados oficialmente. El uso de cuantizaciones no oficiales puede degradar la precisión en tareas de OCR fino.
- El modelo depende de la calidad de la imagen de entrada; imágenes rotadas, con ruido o baja resolución pueden afectar significativamente al rendimiento.
- Aunque la licencia es Apache 2.0 (permisiva para uso comercial), el modelo se distribuye a través de la librería PaddleOCR, que tiene sus propias dependencias y requisitos de instalación que deben revisarse.
- No se han publicado resultados de pruebas de robustez ante ataques adversariales o documentos maliciosamente modificados.

## Enlaces

- Repositorio HuggingFace (original): [PaddlePaddle/PaddleOCR-VL-1.6](https://huggingface.co/PaddlePaddle/PaddleOCR-VL-1.6)
- Repositorio HuggingFace (subida por burll): [burll/PaddleOCR-VL-1.6](https://huggingface.co/burll/PaddleOCR-VL-1.6)
- ModelScope: [PaddlePaddle/PaddleOCR-VL-1.6](https://modelscope.cn/models/PaddlePaddle/PaddleOCR-VL-1.6)
- Repositorio GitHub de PaddleOCR: [PaddlePaddle/PaddleOCR](https://github.com/PaddlePaddle/PaddleOCR)
- Documentación oficial de PaddleOCR-VL-1.6: [PaddleOCR-VL-1.6 Introduction](https://www.paddleocr.ai/main/en/version3.x/algorithm/PaddleOCR-VL/PaddleOCR-VL-1.6.html)
- Paper (arXiv): [2606.03264](https://arxiv.org/abs/2606.03264) (referenciado en los tags, no verificado)
- Demo en HuggingFace: disponible desde el badge de la model card (enlace directo no extraído)
