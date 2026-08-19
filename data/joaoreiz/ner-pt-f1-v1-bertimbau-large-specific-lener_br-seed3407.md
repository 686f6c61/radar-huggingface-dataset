# JoaoReiz/ner-pt-f1-v1-bertimbau-large-specific-lener_br-seed3407

## Resumen

El modelo `JoaoReiz/ner-pt-f1-v1-bertimbau-large-specific-lener_br-seed3407` es un sistema de reconocimiento de entidades nombradas (NER) para portugués, desarrollado mediante fine-tuning del modelo BERTimbau large (`neuralmind/bert-large-portuguese-cased`) sobre el subconjunto `lener_br` del protocolo NEVE. Este protocolo define una taxonomía específica de entidades para textos en portugués brasileño, lo que lo hace especialmente útil para tareas de extracción de información en dominios legales, periodísticos y administrativos.

El modelo emplea la arquitectura BERT (Transformer encoder-only) con 333,3 millones de parámetros, una ventana de contexto de 512 tokens y está entrenado exclusivamente en portugués. Su relevancia radica en que ofrece una alternativa especializada y de alto rendimiento frente a modelos multilingües genéricos, al estar ajustado sobre un corpus de dominio concreto y validado mediante la métrica de F1 end-to-end sobre el conjunto de validación. La elección de una semilla fija (3407) garantiza reproducibilidad de los experimentos.

Aunque el repositorio no incluye métricas detalladas ni documentación exhaustiva, el modelo está disponible en formato `safetensors` y es compatible con el ecosistema `transformers` de Hugging Face, lo que facilita su integración en pipelines de procesamiento de lenguaje natural.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (Transformer encoder-only, cased) |
| Parametros totales | 333.360.141 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (no se especifican) |
| Idiomas soportados | Portugues (pt), principalmente variante brasileña |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es BERTimbau large, una variante de BERT con 24 capas, 16 cabezas de atención y una dimensión oculta de 1024, preentrenada sobre el corpus BrWaC (Brazilian Web as Corpus) durante 1.000.000 de pasos con máscara de palabra completa. El fine-tuning se realizó congelando las capas del modelo base y ajustando únicamente la cabeza de clasificación de tokens sobre el conjunto `lener_br` del protocolo NEVE, que define una jerarquía de entidades anotadas en textos brasileños. La selección del mejor checkpoint se basó en la métrica `validation_end_to_end_f1`, y se fijó la semilla 3407 para asegurar reproducibilidad. No se menciona el uso de técnicas como RLHF o DPO, ni se detallan hiperparámetros de entrenamiento (tasa de aprendizaje, épocas, tamaño de lote).

## Capacidades

- Reconocimiento de entidades nombradas (NER) en portugués, con etiquetado a nivel de token (clasificación de tokens).
- Soporte para la taxonomía de entidades del protocolo NEVE, que incluye categorías como personas, organizaciones, lugares, fechas, valores, entre otras, adaptadas al dominio brasileño.
- Procesamiento de textos con una ventana de contexto de 512 tokens, suficiente para párrafos y documentos cortos.
- Integración nativa con la librería `transformers` mediante el pipeline `token-classification`, lo que permite su uso directo en aplicaciones Python.
- No dispone de capacidades generativas, tool calling, ni soporte multimodal; es exclusivamente un modelo de extracción de entidades.

## Casos de uso

- Extracción de entidades en documentos legales: el modelo puede identificar automáticamente nombres de partes, jueces, tribunales y fechas en sentencias y contratos, facilitando la indexación y búsqueda en bases de datos jurídicas.
- Análisis de noticias y artículos periodísticos: permite extraer organizaciones, personas y lugares mencionados en textos informativos para generar metadatos o alimentar sistemas de recomendación de contenido.
- Procesamiento de currículos y ofertas de empleo: identificación de habilidades, empresas y títulos académicos en portugués para automatizar la preselección de candidatos.
- Monitorización de redes sociales: detección de menciones a marcas, productos o personas en comentarios y publicaciones, útil para análisis de reputación y atención al cliente.
- Construcción de grafos de conocimiento: extracción de entidades y sus relaciones en corpus técnicos o científicos en portugués, para alimentar bases de datos semánticas.
- Sistemas de búsqueda semántica: enriquecimiento de índices de búsqueda con etiquetas de entidades, mejorando la precisión de consultas en portales de transparencia o archivos gubernamentales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de F1, precisión ni comparaciones con otros modelos. Se recomienda evaluar el modelo sobre el conjunto de test de `lener_br` o sobre un corpus propio antes de su uso en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, el modelo ocupa aproximadamente 1,3 GB de memoria (coincidiendo con el tamaño del repositorio). En FP16, unos 670 MB. Para inferencia con batch pequeño, una GPU con 4 GB de VRAM es suficiente; con batch grande o procesamiento en tiempo real, se recomiendan 8 GB o más.
- GPU recomendadas: NVIDIA RTX 3060, RTX 4060, T4, V100, A100, H100. También puede ejecutarse en CPU, aunque con mayor latencia (del orden de cientos de milisegundos por secuencia de 512 tokens).
- En consumer GPU: sí, cabe en tarjetas como RTX 3060 (12 GB) o RTX 4070 (12 GB) sin problemas, incluso con cuantización a 8 bits.
- Opciones de despliegue: Hugging Face `transformers` con pipeline de clasificación de tokens, `vLLM` (aunque está orientado a modelos generativos, puede servir para inferencia de encoder), `ONNX Runtime` para optimización en CPU/GPU, o `TensorRT` para despliegue en producción.
- Latencia y throughput estimados: no disponibles. Dependerá del hardware y del tamaño de lote; en una GPU A100 se pueden procesar cientos de secuencias por segundo con batch de 32.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados para este modelo específico. Como referencia, se puede comparar con otros modelos NER para portugués:

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JoaoReiz/ner-pt-f1-v1-bertimbau-large-specific-lener_br-seed3407 | BERT large | 333 M | 512 | no disponible | Hugging Face |
| neuralmind/bert-base-portuguese-cased | BERT base | 110 M | 512 | investigación (para el original) | Hugging Face |
| xlm-roberta-large | XLM-RoBERTa | 560 M | 512 | MIT | Hugging Face |

Nota: el modelo `xlm-roberta-large` es multilingüe y puede adaptarse a NER en portugués, pero no está especializado en el protocolo NEVE. La comparación directa de rendimiento no es posible sin benchmarks publicados.

## Limitaciones y advertencias

- Sesgos del corpus de entrenamiento: al estar preentrenado sobre BrWaC (textos web brasileños), puede reflejar sesgos de género, etnia o clase social presentes en ese corpus.
- Riesgo de alucinación: al ser un modelo de clasificación de tokens, no genera texto, pero puede etiquetar incorrectamente entidades ambiguas o fuera del dominio de entrenamiento.
- Limitación de contexto: la ventana de 512 tokens impide procesar documentos largos de una sola vez; es necesario dividir el texto en fragmentos, lo que puede perder contexto entre ellos.
- Idioma: solo portugués, y principalmente la variante brasileña; el rendimiento en portugués europeo puede ser inferior.
- Licencia no disponible: no se especifican condiciones de uso comercial; se recomienda contactar con el autor antes de utilizar el modelo en aplicaciones comerciales.
- Sin documentación de hiperparámetros ni métricas de evaluación: dificulta la comparación con alternativas y la confianza en su rendimiento para casos concretos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JoaoReiz/ner-pt-f1-v1-bertimbau-large-specific-lener_br-seed3407
- Modelo base BERTimbau large: https://huggingface.co/neuralmind/bert-large-portuguese-cased
- Repositorio de BERTimbau (GitHub): https://github.com/ClaudioSS01/portuguese-Bertimbau
- Documento sobre BERTimbau (Scribd): https://www.scribd.com/document/838534726/bertimbau
- Recurso BERTimbau en PORTULAN CLARIN: https://portulanclarin.net/repository/browse/bertimbau-portuguese-bert-base-language-model/486edb32e93711ebabf702420a8701536b383b588f2f4c85b13b4d04c2867a4b/
