# Mardiyyah/tapt-orig-combdata-pubmedbert-2class-wwmmask-label_all_false

## Resumen

`tapt-orig-combdata-pubmedbert-2class-wwmmask-label_all_false` es un modelo de clasificación de tokens (token classification) desarrollado por el usuario Mardiyyah, consistente en un ajuste fino de BERT sobre el checkpoint `Mardiyyah/CeLLaTe-tapt-pubmedbert-tokenizer-original-wwmask-combinedData`. Está especializado en reconocimiento de entidades nombradas (NER) de dos clases en el dominio biomédico, entrenado sobre el conjunto de datos `OTAR3088/CeLLaTe-ner-2class-iob_final` con etiquetado en formato IOB. El modelo cuenta con 108.895.493 parámetros y se distribuye en formato safetensors bajo licencia Apache 2.0.

El modelo resuelve la tarea de etiquetado secuencial de entidades en textos científicos y biomédicos en inglés, un paso previo habitual en pipelines de extracción de información, normalización de entidades y construcción de bases de conocimiento biomédicas. Su relevancia radica en que parte de un backbone PubMEDBERT adaptado mediante TAPT (Task-Adaptive Pretraining) y tokenizador específico del dominio, lo que lo hace adecuado para vocabulario técnico y terminología médica especializada.

Se trata de un modelo de nicho, sin descargas ni interacciones registradas en Hugging Face en el momento de la consulta, y con una model card generada automáticamente por el Trainer de Transformers que deja sin documentar secciones clave como usos previstos, limitaciones y composición de los datos de entrenamiento. Los resultados declarados en el conjunto de evaluación son moderados: micro F1 de 0,7129 y exactitud de 0,9842, lo que refleja el fuerte desbalance de clases típico en tareas NER.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (transformer encoder), ajustado desde un checkpoint derivado de PubMEDBERT con tokenizador propio |
| Parametros totales | 108.895.493 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32/fp16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder tipo BERT con cabeza de clasificación de tokens, inicializado desde el checkpoint `Mardiyyah/CeLLaTe-tapt-pubmedbert-tokenizer-original-wwmask-combinedData`, que a su vez parte de PubMEDBERT con un tokenizador adaptado al dominio y preentrenamiento adaptativo de tarea (TAPT) sobre datos combinados. El ajuste fino se realizó sobre el dataset `OTAR3088/CeLLaTe-ner-2class-iob_final` con etiquetado IOB de dos clases, orientado a NER biomédico.

Los hiperparámetros de entrenamiento documentados son: learning rate de 2e-05, batch size de 16 con acumulación de gradiente de 2 (batch efectivo de 32), optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal con warmup del 1 %, 20 épocas, semilla 3407 y precisión mixta nativa (AMP). El entrenamiento se ejecutó con Transformers 4.48.2, PyTorch 2.4.1+cu121, Datasets 3.0.2 y Tokenizers 0.21.0. No se documenta el número de tokens de entrenamiento ni la composición detallada del dataset, ni si hubo fases de RLHF o DPO (no aplicables en un modelo discriminativo de este tipo).

## Capacidades

- Clasificación de tokens a nivel de subtoken para tareas de NER con esquema IOB de dos clases (entidad y fuera de entidad).
- Reconocimiento de entidades en textos biomédicos y científicos en inglés, aprovechando el vocabulario y el tokenizador adaptados al dominio.
- Extracción de información estructurada a partir de abstracts y artículos, como paso previo a normalización contra ontologías.
- No soporta generación de texto libre, razonamiento generativo ni matemáticas: es un modelo discriminativo de etiquetado.
- No dispone de soporte documentado de tool calling, function calling ni razonamiento multi-paso con agentes.
- Capacidad multilingüe limitada al inglés (`en`); no se declaran otros idiomas.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Extracción de entidades biomédicas en abstracts de PubMed: el modelo etiqueta secuencias de tokens como entidades, integrándose en un pipeline de preprocesado que alimenta bases de datos de literatura científica.
- Anotación asistida de corpus NER: como preetiquetador para reducir el esfuerzo humano en la creación de conjuntos de datos biomédicos etiquetados, revisando después las predicciones con herramientas de anotación.
- Normalización de entidades contra ontologías médicas: las menciones detectadas se enlazan con MeSH, UMLS o SNOMED CT mediante un componente posterior de entity linking.
- Construcción de grafos de conocimiento biomédicos: las entidades extraídas de miles de documentos permiten poblar nodos y relaciones en un grafo de conocimiento de dominio.
- Búsqueda semántica sobre literatura médica: el etiquetado de entidades permite enriquecer índices y filtrar documentos por tipo de entidad mencionada.
- Monitorización de ensayos clínicos y farmacovigilancia: detección de menciones de fármacos, enfermedades o dianas en informes y resúmenes para revisiones sistemáticas.
- Preprocesado en pipelines de minería de literatura para revisiones sistemáticas: filtrado y clasificación previa de documentos según las entidades detectadas.

## Benchmarks y rendimiento

Resultados declarados por el autor en el conjunto de evaluación (model-index sin entradas adicionales; los datos provienen de la tabla de entrenamiento de la model card):

| Metrica | Valor |
|---|---|
| Loss (evaluación) | 0,0872 |
| Precision | 0,6998 |
| Recall | 0,7265 |
| Micro F1 | 0,7129 |
| Weighted F1 | 0,7127 |
| Macro F1 | 0,7208 |
| Accuracy | 0,9842 |

El mejor punto se alcanzó en la época 13 (step 3419), con micro F1 de 0,7129 y macro F1 de 0,7208. No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 0,45 GB solo para pesos (108,9 M de parámetros); con activaciones y overhead de runtime, aproximadamente 1-2 GB.
- En fp16: aproximadamente 0,22 GB de pesos; el modelo cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (RTX 3050, RTX 4060, GTX 1660, T4). Para lotes grandes, A100 o H100 no son necesarias; una RTX 4090 o L4 permiten throughput alto con batch grande.
- Cabe en GPU consumer sin problema, e incluso puede ejecutarse en CPU para inferencia por lotes con latencia aceptable.
- Opciones de despliegue: `transformers` con `pipeline("token-classification")`, TGI (Text Generation Inference no aplica a clasificación; usar `text-embeddings-inference` no es adecuado), vLLM no soporta clasificación de tokens de forma nativa, ONNX Runtime para optimización, o `optimum` para exportación. Para CPU, `onnxruntime` o `torch` en modo inferencia.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tapt-orig-combdata-pubmedbert-2class-wwmmask-label_all_false | 108,9 M | no disponible | NER biomédico 2 clases | apache-2.0 | Hugging Face |
| BERT-base (Google) | 110 M | 512 tokens | NER general | apache-2.0 | Hugging Face |
| BioBERT | ~110 M | 512 tokens | NER biomédico | apache-2.0 | Hugging Face |
| PubMedBERT | ~110 M | 512 tokens | NER biomédico | MIT | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada; la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo de nicho con cero descargas y cero likes en Hugging Face: no hay evidencia de uso en producción ni validación externa.
- La model card está generada automáticamente y deja sin documentar las secciones de usos previstos, limitaciones y datos de entrenamiento, lo que dificulta evaluar su robustez.
- Riesgo de sesgo derivado del corpus de entrenamiento (literatura biomédica en inglés), que puede infrarepresentar terminología de otras regiones o variantes lingüísticas.
- Riesgo de alucinación en el sentido de falsos positivos y falsos negativos en la detección de entidades: el micro F1 de 0,7129 indica un margen de error considerable para uso clínico directo.
- La exactitud de 0,9842 es engañosa por el desbalance de clases; debe priorizarse el F1 por clase.
- Solo soporta inglés; no se declaran otros idiomas.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte.
- No se documenta la longitud máxima de contexto soportada; asumir 512 tokens por herencia de BERT es una suposición no confirmada.
- No apto para generación de texto, razonamiento ni tareas conversacionales.

## Enlaces

- Hugging Face: https://huggingface.co/Mardiyyah/tapt-orig-combdata-pubmedbert-2class-wwmmask-label_all_false
- Modelo base: https://huggingface.co/Mardiyyah/CeLLaTe-tapt-pubmedbert-tokenizer-original-wwmask-combinedData
- Dataset de entrenamiento: https://huggingface.co/datasets/OTAR3088/CeLLaTe-ner-2class-iob_final
- Repositorio de Transformers: https://github.com/huggingface/transformers
- No se han encontrado papers, blogs, demos ni repositorios adicionales en la información proporcionada.
