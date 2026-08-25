# incruit-navi/ko-blind-ner-v3-1

## Resumen

ko-blind-ner-v3-1 es un modelo de reconocimiento de entidades nombradas (NER) especializado en coreano, desarrollado por incruit-navi, la división de inteligencia artificial de la empresa surcoreana de reclutamiento Incruit. Se trata de un ajuste fino del modelo base `klue/roberta-large`, una variante de RoBERTa-large preentrenada sobre el corpus coreano KLUE, con 335 millones de parámetros y una ventana de contexto de 512 tokens. El modelo está orientado a la anonimización de datos personales en textos, una tarea crítica en el ámbito de la selección de personal y el cumplimiento de la normativa coreana de protección de datos (PIPA).

La relevancia del modelo radica en que permite automatizar la detección de entidades como nombres, números de teléfono, direcciones o correos electrónicos en currículos y ofertas de empleo, facilitando procesos de reclutamiento ciego que eviten sesgos discriminatorios. Aunque la model card no detalla el conjunto de datos de entrenamiento ni las etiquetas exactas, el nombre del modelo (blind NER) indica que está diseñado para enmascarar información identificable. Su arquitectura es un transformer encoder clásico, sin componentes MoE ni atención lineal, y se distribuye en formato safetensors compatible con la librería transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa-large (transformer encoder, 24 capas, 16 cabezas, 1024 dimensiones ocultas) |
| Parametros totales | 335.632.409 |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos en FP32; se puede cuantizar con herramientas externas) |
| Idiomas soportados | coreano (ko) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura RoBERTa-large, un transformer encoder preentrenado con un objetivo de modelado de lenguaje enmascarado (MLM). La versión base, `klue/roberta-large`, fue entrenada sobre el corpus KLU, un conjunto de datos coreano de aproximadamente 90 GB que incluye artículos de noticias, enciclopedias y textos web. El ajuste fino se realizó para la tarea de token classification (NER) sobre un dataset no especificado en la model card, con los siguientes hiperparámetros: tasa de aprendizaje de 2e-5, tamaño de lote de 8, 15 épocas y un programador lineal con un calentamiento del 10%. No se menciona el uso de técnicas de alineación como RLHF o DPO; el entrenamiento es un fine-tuning supervisado clásico.

El proceso de entrenamiento se realizó con la librería Transformers 4.45.0 y PyTorch 2.4.0. La pérdida de validación final fue de 0.0624, con una precisión de 0.3208 y un recall de 0.2615 en la última época, lo que sugiere que el modelo aún no ha convergido completamente. No se documentan innovaciones técnicas adicionales, como decodificación especulativa o atención lineal, ya que se trata de un ajuste fino estándar sobre un encoder preentrenado.

## Capacidades

- Reconocimiento de entidades nombradas (NER) en coreano, detectando categorías como personas, organizaciones, ubicaciones y fechas, aunque las etiquetas exactas no están documentadas.
- Anonimización de datos personales: el modelo está diseñado para identificar y enmascarar información identificable en textos, lo que permite el reclutamiento ciego.
- Tokenización a nivel de palabra o subpalabra mediante el tokenizador WordPiece de RoBERTa, con soporte para el vocabulario coreano del corpus KLU.
- Inferencia de clasificación por token, devolviendo etiquetas BIO o IOB2 (no especificado) para cada token de entrada.
- No tiene capacidades de generación de texto, tool calling, agentes o visión, ya que es un modelo encoder exclusivo para clasificación de tokens.
- Limitado a texto en coreano; no se reportan capacidades multilingües.

## Casos de uso

- Reclutamiento ciego: el modelo puede procesar currículos y cartas de presentación en coreano para detectar y enmascarar nombres, direcciones, teléfonos o correos antes de que los reclutadores los lean, cumpliendo con las políticas de igualdad de oportunidades.
- Protección de datos en RRHH: integración en pipelines de gestión de candidatos para anonimizar automáticamente documentos, reduciendo el riesgo de filtración de información personal en cumplimiento de la PIPA coreana.
- Limpieza de datasets de entrenamiento: uso en la preparación de corpus de texto coreano para eliminar entidades personales antes de entrenar modelos de lenguaje, evitando fugas de datos.
- Análisis de ofertas de empleo: extracción de entidades (empresas, ubicaciones, habilidades) de textos de ofertas para estructurar datos en un sistema de búsqueda.
- Procesamiento de CV en plataformas de empleo: clasificación automática de secciones de un CV (educación, experiencia, datos de contacto) mediante la identificación de entidades clave.
- Auditoría de cumplimiento legal: escaneo de comunicaciones internas para detectar y reportar información personal no anonimizada, facilitando la conformidad con regulaciones de privacidad.

## Benchmarks y rendimiento

El autor no ha publicado resultados de benchmarks externos (MMLU, HumanEval, etc.) en la model card. El único dato de rendimiento es el informe de entrenamiento y evaluación interno, que se muestra a continuación. Los resultados corresponden al conjunto de evaluación del propio entrenamiento, con una precisión, recall y F1 finales de 0.3208, 0.2615 y 0.2881 respectivamente. La accuracy es alta (0.9932) debido al desequilibrio de clases típico en NER, donde la mayoría de los tokens no son entidades.

| Metrica | Valor |
|---|---|
| Loss | 0.0624 |
| Precision | 0.3208 |
| Recall | 0.2615 |
| F1 | 0.2881 |
| Accuracy | 0.9932 |

Estos valores son notablemente bajos para una tarea de NER, lo que sugiere que el modelo no está listo para producción sin un ajuste adicional. No se han publicado comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 1.3 GB de memoria para los pesos (335M parámetros), más overhead de activaciones, lo que totaliza unos 2.5-3 GB. Con cuantización INT8, se reduce a unos 700 MB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP32, como NVIDIA GTX 1650, RTX 3060 o superior. Para despliegue en batch, se recomienda una GPU de centro de datos como A10G o T4.
- Cabe en GPUs de consumo: sí, con cuantización puede ejecutarse en GPUs con 2 GB de VRAM, pero el rendimiento real depende del tamaño del lote.
- Opciones de despliegue: se puede servir con vLLM, Hugging Face Inference Endpoints, TGI (Text Generation Inference) o mediante la API de transformers con PyTorch. Para aplicaciones en CPU, se puede exportar a ONNX o usar llama.cpp (aunque este modelo es un encoder, no un decoder).
- Latencia y throughput estimados: en una T4, la inferencia sobre un texto de 512 tokens tarda entre 50 y 100 ms por muestra con lote de 1, con un throughput de 10-20 muestras por segundo. En una RTX 4090, la latencia baja a 20-40 ms.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1 (NER coreano) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| incruit-navi/ko-blind-ner-v3-1 | 335M | 512 | 0.2881 (propio) | no disponible | Hugging Face |
| klue/roberta-large (base) | 335M | 512 | no disponible | MIT | Hugging Face |
| KoELECTRA-base (NER) | 110M | 512 | ~0.86 (KLUE NER) | GPL-3.0 | Hugging Face |
| ETRI NER (BPE) | 110M | 512 | ~0.85 (ETRI dataset) | propietaria | no disponible |

El modelo base `klue/roberta-large` no tiene métricas NER públicas en la misma tarea, pero los modelos NER coreanos como KoELECTRA-base o los modelos de ETRI alcanzan F1 superiores a 0.8 en benchmarks estándar (KLUE-NER). El bajo F1 de este modelo lo sitúa muy por detrás de las alternativas disponibles, lo que indica que no es competitivo para uso general sin un reentrenamiento significativo.

## Limitaciones y advertencias

- El conjunto de datos de entrenamiento no está documentado; se desconoce la cobertura de dominios y la calidad de las anotaciones, lo que limita la confiabilidad en dominios no vistos.
- Las métricas de rendimiento son muy bajas (F1 de 0.28 en el conjunto de validación), lo que indica un alto número de falsos positivos y negativos en la detección de entidades. No se recomienda su uso en producción sin un reentrenamiento con datos etiquetados de mayor calidad.
- La licencia no está especificada en la model card, aunque el modelo base `klue/roberta-large` tiene licencia MIT. Se recomienda contactar con el autor para aclarar los términos de uso comercial.
- La ventana de contexto está limitada a 512 tokens, lo que puede ser insuficiente para documentos largos como CVs de varias páginas; se requeriría un proceso de truncamiento o segmentación.
- Riesgo de sesgo en la anonimización: si el modelo no detecta correctamente todas las entidades, podría dejar datos personales sin enmascarar, lo que viola los requisitos de privacidad.
- No hay soporte para entidades multilingües; el modelo solo procesa coreano, y no se garantiza su rendimiento en textos mezclados con otros idiomas.
- La model card está generada automáticamente y no ofrece detalles sobre las etiquetas de NER utilizadas, lo que dificulta la interpretación de los resultados.

## Enlaces

- [HuggingFace: incruit-navi/ko-blind-ner-v3-1](https://huggingface.co/incruit-navi/ko-blind-ner-v3-1)
- [HuggingFace: klue/roberta-large](https://huggingface.co/klue/roberta-large)
- [Incruit Navi (web oficial)](https://navi.incruit.com/)
- [Modelo anterior: incruit-navi/ko-blind-ner-v3](https://huggingface.co/incruit-navi/ko-blind-ner-v3)
