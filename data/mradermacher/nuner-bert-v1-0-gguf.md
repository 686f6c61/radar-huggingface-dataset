# mradermacher/NuNER-BERT-v1.0-GGUF

## Resumen

NuNER-BERT-v1.0-GGUF es la versión cuantizada en formato GGUF del modelo numind/NuNER-BERT-v1.0, un modelo BERT de tipo encoder especializado en reconocimiento de entidades nombradas (NER) y clasificación de tokens. Lo publica mradermacher, un conocido generador de cuantizaciones GGUF de la comunidad, a partir del modelo original de NuMind. El modelo resuelve el problema de la extracción de entidades en texto en inglés mediante una aproximación de zero-shot y few-shot: NuNER se entrena sobre un dataset anotado automáticamente que cubre un conjunto abierto de tipos de entidad, lo que permite reconocer categorías no vistas durante el entrenamiento sin necesidad de reentrenar.

Técnicamente es un encoder transformer BERT base con 108.891.648 parámetros (aproximadamente 109 millones), lo que lo sitúa en la gama ligera: cabe en cualquier GPU consumer e incluso puede ejecutarse en CPU con latencias bajas. Su ventana de contexto y su tokenizador corresponden a los de un BERT estándar (512 tokens), y está entrenado exclusivamente en inglés. La licencia MIT del modelo original se mantiene en esta cuantización, lo que facilita su uso comercial sin restricciones adicionales.

La relevancia de esta ficha radica en que las cuantizaciones GGUF permiten desplegar el modelo con llama.cpp y Ollama, reduciendo el peso del repositorio a entre 0,2 y 0,3 GB según la cuantización, frente al modelo original en safetensors. Es una opción práctica para pipelines de extracción de información en producción donde el coste por inferencia y la huella de memoria importan más que la flexibilidad de un LLM generativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (base) |
| Parametros totales | 108.891.648 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (BERT estándar: 512 tokens) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es un BERT de tipo encoder con 108,9 millones de parámetros, orientado a clasificación de tokens (token-classification) y extracción de características. NuNER se entrena sobre el dataset numind/NuNER, un corpus anotado automáticamente que cubre un conjunto amplio y abierto de tipos de entidad, lo que le confiere capacidad de reconocimiento zero-shot y few-shot de categorías no presentes explícitamente en el entrenamiento. Esta aproximación, descrita en el paper de NuNER, sustituye la dependencia de datasets NER etiquetados manualmente por un corpus de gran escala generado con modelos de lenguaje.

La cuantización la realiza mradermacher con su pipeline habitual (quantize_version 2, output_tensor_quantised 1, convert_type hf), generando cuantizaciones estáticas en formato GGUF. No se dispone de información sobre el número exacto de tokens de entrenamiento, la composición detallada del dataset ni si hubo fases de RLHF o DPO; al tratarse de un encoder para clasificación de tokens, estos mecanismos de alineación no son de aplicación habitual. Tampoco se han publicado cuantizaciones con imatrix para este modelo según la model card.

## Capacidades

- Reconocimiento de entidades nombradas (NER) en inglés, con soporte para tipos de entidad abiertos y no vistos durante el entrenamiento (zero-shot y few-shot).
- Clasificación de tokens a nivel de palabra o subtoken, adecuada para pipelines de extracción de información.
- Extracción de características (feature-extraction) para tareas downstream como clustering, similitud semántica o clasificación de texto.
- Capacidad multilingüe limitada: entrenado exclusivamente en inglés, por lo que el rendimiento en otros idiomas no está garantizado.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un encoder, no un modelo generativo.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Extracción de entidades en documentos legales y contractuales: el modelo identifica personas, organizaciones, fechas y ubicaciones en textos en inglés, permitiendo poblar bases de datos estructuradas a partir de contratos y expedientes.
- Procesamiento de correos y tickets de soporte: extracción automática de nombres de cliente, productos, números de pedido y fechas para enrutar tickets y generar resúmenes estructurados en sistemas de atención al cliente.
- Anonimización y cumplimiento de privacidad: detección de entidades personales (PII) en logs y textos antes de su almacenamiento o envío a terceros, aprovechando la licencia MIT y el bajo coste de inferencia del modelo cuantizado.
- Enriquecimiento de noticias y contenidos editoriales: identificación de entidades en artículos en inglés para construir grafos de conocimiento, etiquetado temático y sistemas de recomendación.
- Pipelines de búsqueda y recuperación de información: indexación de entidades extraídas para mejorar la precisión de motores de búsqueda internos y sistemas de question answering sobre corpus documentales.
- Preprocesado en flujos de datos biomédicos o financieros en inglés: extracción de fármacos, enfermedades, empresas o instrumentos financieros como paso previo a modelos downstream, gracias a su bajo consumo de memoria (0,2 GB en Q4_K_M) que permite ejecutarlo en paralelo con otros componentes.
- Prototipado rápido y despliegue en edge: al caber en CPU y en GPUs consumer, permite integrar NER en aplicaciones de escritorio, dispositivos con recursos limitados o entornos sin acelerador dedicado mediante llama.cpp u Ollama.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 0,2 GB (Q2_K a Q5_K_M) y 0,3 GB (f16), según los tamaños de archivo indicados en la model card.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es más que suficiente; también funciona en CPU sin acelerador dedicado.
- Cabe en cualquier GPU consumer, incluidas las de gama de entrada con 4 GB o menos de VRAM, e incluso en entornos sin GPU.
- Opciones de despliegue: llama.cpp y Ollama para los archivos GGUF; para el modelo base en safetensors, transformers con PyTorch. No se indica soporte específico de vLLM o TGI para esta cuantización.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo (109 M de parámetros) se espera una latencia de milisegundos por secuencia en GPU y de decenas de milisegundos en CPU, aunque no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| NuNER-BERT-v1.0-GGUF (este) | 108,9 M | no disponible (BERT estándar 512) | MIT | GGUF | Cuantización comunitaria del modelo NuNER; NER zero-shot en inglés |
| numind/NuNER-BERT-v1.0 | 108,9 M | no disponible (BERT estándar 512) | MIT | safetensors | Modelo original sin cuantizar; requiere transformers |
| BERT-base NER estándar (p. ej., dslim/bert-base-NER) | ~110 M | 512 | MIT/Apache-2.0 según variante | safetensors, GGUF | NER supervisado con conjunto cerrado de entidades (PER, ORG, LOC, MISC); no zero-shot |
| GLiNER (modelos pequeños) | variable (decenas a cientos de M) | variable | Apache-2.0 en variantes públicas | safetensors | NER zero-shot con tipos de entidad definidos en prompt; alternativa conceptual directa |

La comparativa se basa en características públicas de los modelos citados; no se dispone de datos de rendimiento comparativos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse sobre un corpus anotado automáticamente, puede heredar sesgos de los modelos que generaron las anotaciones y del corpus subyacente; no se detallan análisis de sesgo en la información disponible.
- Riesgo de alucinación: en un encoder de clasificación de tokens el riesgo se manifiesta como falsos positivos o entidades mal tipadas, especialmente en dominios alejados de la distribución de entrenamiento.
- Limitaciones de contexto e idioma: entrenado solo en inglés y con la ventana estándar de BERT (512 tokens), por lo que textos largos deben fragmentarse y el rendimiento en castellano u otros idiomas no está garantizado.
- Restricciones de licencia: la licencia MIT permite uso comercial sin restricciones adicionales, pero conviene verificar la licencia del modelo base numind/NuNER-BERT-v1.0 y del dataset numind/NuNER en el contexto de uso concreto.
- Caveats para producción: las cuantizaciones de baja precisión (Q2_K, Q3_K) pueden degradar la calidad de la clasificación de tokens; para tareas sensibles se recomienda Q4_K_M o superior. No hay cuantizaciones con imatrix disponibles según la model card, y el modelo no es generativo, por lo que no debe emplearse para tareas de razonamiento o generación de texto.

## Enlaces

- Modelo cuantizado en Hugging Face: https://huggingface.co/mradermacher/NuNER-BERT-v1.0-GGUF
- Modelo base: https://huggingface.co/numind/NuNER-BERT-v1.0
- Dataset de entrenamiento: https://huggingface.co/datasets/numind/NuNER
- Página de resumen del autor de las cuantizaciones: https://hf.tst.eu/model#NuNER-BERT-v1.0-GGUF
- Guía de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
