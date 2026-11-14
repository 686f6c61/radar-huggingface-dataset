# mpazd/bert-finetuned-ner

## Resumen

bert-finetuned-ner es un modelo de clasificación de tokens (token classification) obtenido mediante fine-tuning supervisado de google-bert/bert-base-cased sobre una tarea de reconocimiento de entidades nombradas (NER). Lo publica el usuario mpazd en Hugging Face y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. El modelo tiene 107.729.677 parámetros y un tamaño de repositorio de 0,4 GB, con pesos en formato safetensors.

Se trata de un BERT base en su variante cased (sensible a mayúsculas y minúsculas), una arquitectura transformer encoder-only con atención bidireccional completa, adecuada para tareas de etiquetado a nivel de token en lugar de generación de texto. El modelo se ha entrenado durante 3 épocas con un learning rate de 5e-05, batch size de 8 y optimizador AdamW fused, según los hiperparámetros declarados en la model card.

Su relevancia es limitada y de ámbito experimental: la model card está generada automáticamente por el Trainer, no especifica el dataset de entrenamiento (aparece como "None dataset"), no declara idiomas soportados y no incluye resultados en el model-index. Los valores de precisión (0,5210) y F1 (0,5888) en el conjunto de evaluación son moderados para una tarea NER, lo que sugiere que debe evaluarse con cautela antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (BERT base, bidireccional) |
| Parametros totales | 107.729.677 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (la model card no lo especifica; BERT base admite hasta 512 tokens por configuración estándar) |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors sin variantes GGUF/ONNX declaradas) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de google-bert/bert-base-cased, un transformer encoder-only con 12 capas, 768 dimensiones ocultas y 12 cabezas de atención, adaptado para clasificación de tokens mediante una cabeza lineal sobre las representaciones contextuales. La atención es bidireccional completa, lo que permite que cada token condicione su etiqueta con el contexto izquierdo y derecho, algo adecuado para NER pero no para generación autorregresiva.

El fine-tuning se realizó durante 3 épocas con learning rate 5e-05, batch size de entrenamiento y evaluación de 8, semilla 42, scheduler lineal y optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-08. No se declara el número de tokens de entrenamiento, la composición del dataset ni si hubo técnicas de alineación como RLHF o DPO; la model card indica explícitamente "None dataset" como conjunto de entrenamiento. Las versiones de framework declaradas son Transformers 5.22.1, PyTorch 2.14.1+cpu, Datasets 4.8.5 y Tokenizers 0.23.3.

## Capacidades

- Clasificación de tokens para reconocimiento de entidades nombradas (NER): asigna una etiqueta BIO/BILOU a cada token de entrada.
- Detección de entidades en texto sensible a mayúsculas (variante cased), útil para nombres propios, acrónimos y entidades con capitalización significativa.
- Procesamiento de secuencias de hasta 512 tokens según la configuración estándar de BERT base (no confirmado en la model card).
- Inferencia por lotes mediante la pipeline `token-classification` de Transformers.
- No soporta generación de texto, tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo thinking.
- Capacidades multilingües: no declaradas; el modelo base bert-base-cased está entrenado principalmente en inglés, pero no se confirma en la información disponible.

## Casos de uso

- Extracción de entidades en documentos internos: etiquetado de nombres de personas, organizaciones y lugares en corpus administrativos o jurídicos en inglés, aprovechando la variante cased para distinguir nombres propios.
- Preprocesado para pipelines de búsqueda y recuperación: enriquecer índices documentales con metadatos de entidades extraídas por token, alimentando motores de búsqueda o sistemas de RAG.
- Anonimización y seudonimización de datos: detección de entidades personales en textos antes de almacenarlos o compartirlos, como paso previo a la sustitución por placeholders.
- Etiquetado asistido en anotación humana: uso como preanotador en herramientas de anotación para reducir el esfuerzo manual, dado su F1 de 0,5888 en evaluación.
- Clasificación de entidades en registros estructurados semiestructurados: extracción de campos como organizaciones o localizaciones en formularios y correos electrónicos.
- Prototipado y experimentación académica: punto de partida para comparar fine-tunings de BERT en NER o para reproducir el pipeline de entrenamiento con los hiperparámetros declarados.
- Filtrado de contenido en moderación: detección de menciones a entidades concretas (marcas, personas) en flujos de texto para reglas de negocio simples.

## Benchmarks y rendimiento

Resultados declarados por el autor en el conjunto de evaluación (no hay entradas en el model-index):

| Metrica | Valor |
|---|---|
| Loss (evaluación) | 0,2462 |
| Precision | 0,5210 |
| Recall | 0,6770 |
| F1 | 0,5888 |
| Accuracy | 0,9475 |

Evolución por época según la model card:

| Epoca | Paso | Validation loss | Precision | Recall | F1 | Accuracy |
|---|---|---|---|---|---|---|
| 1.0 | 249 | 0,2140 | 0,4703 | 0,6193 | 0,5346 | 0,9437 |
| 2.0 | 498 | 0,2176 | 0,5296 | 0,6348 | 0,5774 | 0,9509 |
| 3.0 | 747 | 0,2462 | 0,5210 | 0,6770 | 0,5888 | 0,9475 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,43 GB solo para pesos (107,7 M de parámetros × 4 bytes), más overhead de activaciones y del runtime; en la práctica, menos de 2 GB en la mayoría de configuraciones.
- VRAM estimada en fp16/bf16: alrededor de 0,22 GB para pesos, más overhead; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son más que suficientes. También puede ejecutarse en CPU, como indica el propio entorno de entrenamiento declarado (PyTorch 2.14.1+cpu).
- Cabe en GPU consumer: sí, en todas las GPU consumer modernas e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: pipeline `token-classification` de Transformers, servidores de inferencia compatibles con Hugging Face Inference Endpoints (el tag `endpoints_compatible` está presente), y exportación a ONNX si se requiere. No se declaran pesos GGUF ni soporte nativo para llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mpazd/bert-finetuned-ner | 107,7 M | No disponible (BERT base estándar: 512 tokens) | NER (token classification) | Apache 2.0 | Hugging Face |
| google-bert/bert-base-cased | 108,3 M | 512 tokens | Modelo base (MLM) | Apache 2.0 | Hugging Face |
| dslim/bert-base-NER | 108,3 M | 512 tokens | NER (CoNLL-2003) | MIT | Hugging Face |
| Jean-Baptiste/roberta-large-ner-english | 355 M | 514 tokens | NER | MIT | Hugging Face |

Comparación cualitativa: frente a dslim/bert-base-NER, que reporta F1 en torno a 0,91 en CoNLL-2003, el modelo de mpazd presenta un F1 de 0,5888 en su propio conjunto de evaluación no especificado, por lo que no son directamente comparables y el rendimiento absoluto es inferior. Frente a alternativas basadas en RoBERTa large, el modelo de mpazd es más ligero (107,7 M frente a 355 M) pero también menos preciso según los datos disponibles. No se dispone de datos de benchmarks comunes que permitan una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- Dataset de entrenamiento no especificado: la model card indica "None dataset", por lo que se desconoce la distribución, el dominio y el esquema de etiquetas utilizado.
- Rendimiento moderado: F1 de 0,5888 y precisión de 0,5210 en el conjunto de evaluación, valores bajos para NER en comparación con modelos de referencia; el recall (0,6770) supera claramente a la precisión, lo que sugiere una tendencia a sobreetiquetar entidades.
- Idiomas no declarados: no se confirma el soporte multilingüe; el modelo base está orientado al inglés, pero no hay confirmación explícita.
- Sesgos conocidos: no documentados en la información disponible; al derivar de bert-base-cased, puede heredar sesgos de género, raza y dominio del corpus original de BERT.
- Riesgo de alucinación: no aplica en el sentido generativo (no produce texto libre), pero puede asignar etiquetas incorrectas a tokens ambiguos o fuera de dominio.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución con atribución y aviso de cambios; no hay restricciones adicionales declaradas.
- Caveat para producción: al no existir resultados en el model-index ni documentación del esquema de etiquetas, es imprescindible validar el modelo en el dominio objetivo antes de desplegarlo.
- Longitud de contexto no confirmada en la model card; asumir el límite estándar de BERT base (512 tokens) y truncar entradas más largas.
- Modelo con 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria conocida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mpazd/bert-finetuned-ner
- Modelo base: https://huggingface.co/bert-base-cased
- Repositorio de Transformers: https://github.com/huggingface/transformers
- Documentación de la pipeline de token classification: https://huggingface.co/docs/transformers/tasks/token_classification
