# mostafaMKH/bert-finetuned-ner

## Resumen

`mostafaMKH/bert-finetuned-ner` es un modelo de reconocimiento de entidades nombradas (NER) obtenido por fine-tuning de `google-bert/bert-base-cased` sobre el dataset CoNLL-2003. El autor, mostafaMKH, publica este modelo con licencia Apache 2.0, lo que permite su uso comercial sin restricciones significativas. El modelo está diseñado para la tarea de clasificación de tokens (token-classification) y es compatible con la librería Transformers de Hugging Face.

Con 107,7 millones de parámetros, hereda la arquitectura BERT base (12 capas, 768 dimensiones ocultas) y su ventana de contexto estándar de 512 tokens. El fine-tuning se realizó durante 3 épocas con una tasa de aprendizaje de 2e-05 y un tamaño de lote de 8, alcanzando un F1 de 0,944 en la partición de validación de CoNLL-2003. Es un modelo ligero y eficiente, adecuado para tareas de extracción de entidades en inglés, y su tamaño reducido permite su despliegue en hardware modesto, incluidas CPUs.

La relevancia de este modelo radica en su simplicidad y reproducibilidad: al estar generado con el Trainer de Hugging Face y publicar todos los hiperparámetros, sirve como referencia para quien necesite un punto de partida sólido en NER clásico sin recurrir a arquitecturas más pesadas o modelos de pago.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT base (Transformer encoder, 12 capas, 768 hidden, 12 cabezas de atencion) |
| Parametros totales | 107.726.601 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (estandar de BERT base) |
| Tipos de cuantizacion | no disponible (solo safetensors en precision completa) |
| Idiomas soportados | no disponible (el dataset de entrenamiento, CoNLL-2003, es en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en BERT base con cased tokenization, es decir, distingue entre mayusculas y minusculas, lo que resulta util para reconocer entidades propias en ingles. La arquitectura es un transformer encoder puro con atencion bidireccional, preentrenado con masked language modeling y next sentence prediction, y posteriormente fine-tuneado para clasificacion de tokens. La cabeza de clasificacion se anade sobre las representaciones de cada token para predecir etiquetas BIO (Begin, Inside, Outside) sobre las cuatro categorias de CoNLL-2003: personas (PER), organizaciones (ORG), localizaciones (LOC) y miscelanea (MISC).

El entrenamiento se realizo con el Trainer de Hugging Face sobre el dataset CoNLL-2003, con los siguientes hiperparametros: learning rate de 2e-05, batch size de 8 tanto en entrenamiento como en evaluacion, seed 42, optimizador AdamW (variante torch fused) con betas (0.9, 0.999) y epsilon 1e-08, scheduler lineal y 3 epocas. La perdida de validacion final fue de 0,0785. No se menciona el uso de tecnicas como RLHF o DPO, ya que se trata de un fine-tuning supervisado clasico.

## Capacidades

- Reconocimiento de entidades nombradas (NER) en texto en ingles, con las cuatro categorias de CoNLL-2003: personas, organizaciones, localizaciones y miscelanea.
- Clasificacion de tokens con etiquetas BIO, lo que permite extraer entidades multi-token (por ejemplo, "New York" como una sola localizacion).
- Procesamiento de secuencias de hasta 512 tokens, suficiente para parrafos y documentos cortos.
- Integracion directa con el pipeline `token-classification` de Transformers, lo que facilita su uso en aplicaciones sin codigo adicional.
- Compatible con la API de Hugging Face (endpoints_compatible), permitiendo su despliegue en inference endpoints.
- No soporta tool calling, generacion de texto libre, vision ni audio; es un modelo exclusivamente discriminativo para NER.

## Casos de uso

- Extraccion de entidades en articulos de noticias: el modelo puede procesar titulares y cuerpos de noticias en ingles para identificar personas, organizaciones y lugares mencionados, facilitando tareas de indexacion y busqueda semantica en redacciones digitales.
- Enriquecimiento de datos para sistemas de recomendacion: al extraer entidades de resenas de productos o posts de redes sociales, se pueden construir perfiles de interes basados en marcas, personas o lugares mencionados.
- Preprocesamiento para sistemas de busqueda empresarial: integrar el modelo en un pipeline de ingestion de documentos para etiquetar entidades y mejorar la precision de busquedas por entidad en intranets corporativas.
- Analisis de documentos legales o financieros: identificar organizaciones, personas y localizaciones en contratos o informes, ayudando a automatizar la clasificacion de documentos por entidades relevantes.
- Construccion de grafos de conocimiento: el modelo puede alimentar un pipeline de extraccion de relaciones donde las entidades detectadas se conectan entre si, por ejemplo, en bases de datos de investigacion academica.
- Sistema de alertas de menciones: monitorizar feeds de noticias o RSS en ingles y generar alertas cuando aparecen entidades especificas (una empresa, un politico, una ciudad), gracias a su baja latencia en CPU.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre la particion de validacion de CoNLL-2003:

| Metrica | Valor |
|---|---|
| Precision | 0,9360 |
| Recall | 0,9522 |
| F1 | 0,9440 |
| Accuracy | 0,9867 |
| Loss | 0,0785 |

Evolucion durante el entrenamiento:

| Epoca | Validation Loss | Precision | Recall | F1 | Accuracy |
|---|---|---|---|---|---|
| 1 | 0,0831 | 0,9335 | 0,9470 | 0,9402 | 0,9857 |
| 2 | 0,0780 | 0,9390 | 0,9509 | 0,9449 | 0,9864 |
| 3 | 0,0785 | 0,9360 | 0,9522 | 0,9440 | 0,9867 |

Estos valores son comparables a los reportados historicamente para BERT base fine-tuneado en CoNLL-2003 (F1 en torno a 0,92-0,95), situandose en la parte alta del rango esperado.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 430 MB en fp32 (107,7 M parametros x 4 bytes), unos 215 MB en fp16. Cabe en cualquier GPU moderna, incluso integradas.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM (GTX 1050 Ti, RTX 2060, etc.). Tambien funciona correctamente en CPU con un rendimiento aceptable para lotes pequenos.
- Compatible con GPUs de consumo: si, todas las GPUs de NVIDIA con soporte CUDA, asi como Apple Silicon via MPS.
- Opciones de despliegue: Transformers (pipeline `token-classification`), TorchServe, Hugging Face Inference Endpoints, ONNX Runtime (si se exporta), y cualquier framework que cargue safetensors.
- Latencia estimada: en CPU moderna, entre 10 y 50 ms por secuencia de 128 tokens; en GPU, por debajo de 5 ms. No se dispone de datos de throughput oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1 (CoNLL-2003) | Licencia | Notas |
|---|---|---|---|---|---|
| mostafaMKH/bert-finetuned-ner | 107,7 M | 512 | 0,944 | Apache 2.0 | Fine-tune de bert-base-cased |
| balamurugan1603/bert-finetuned-ner | 107,7 M | 512 | no disponible | no disponible | Fine-tune de BERT, sin datos publicados |
| nt-ai/bert-finetuned-ner | 107,7 M | 512 | no disponible | Apache 2.0 | Fine-tune de BERT, sin datos publicados |
| bert-base-cased (sin fine-tune) | 107,7 M | 512 | no aplica | Apache 2.0 | Modelo base, no apto para NER sin fine-tuning |

No se dispone de benchmarks publicados para los modelos comparables de balamurugan1603 y nt-ai, por lo que la comparacion directa no es posible. El modelo de mostafaMKH destaca por publicar resultados completos y reproducibles.

## Limitaciones y advertencias

- El modelo solo reconoce las cuatro entidades de CoNLL-2003 (PER, ORG, LOC, MISC); no detecta fechas, cantidades, productos ni otros tipos de entidades.
- Entrenado exclusivamente en ingles; su rendimiento en otros idiomas sera muy pobre o nulo.
- La ventana de contexto de 512 tokens limita el procesamiento de documentos largos; para textos extensos es necesario segmentar.
- La model card es incompleta: no se documentan usos previstos, limitaciones especificas ni sesgos conocidos. El autor indica "More information needed".
- Riesgo de alucinacion en entidades ambiguas o con mayusculas inusuales, especialmente en textos fuera del dominio periodistico de CoNLL-2003.
- No se ha evaluado el modelo en otros datasets (por ejemplo, OntoNotes o WNUT), por lo que su generalizacion a otros dominios no esta verificada.
- El repositorio ocupa 2,2 GB, lo que sugiere que puede contener pesos en multiples precisiones o archivos adicionales; el unico formato confirmado es safetensors.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mostafaMKH/bert-finetuned-ner
- Modelo base: https://huggingface.co/bert-base-cased
- Modelo similar (balamurugan1603): https://huggingface.co/balamurugan1603/bert-finetuned-ner
- Modelo similar (nt-ai): https://huggingface.co/nt-ai/bert-finetuned-ner
- Repositorio de referencia (Liki990): https://github.com/Liki990/bert_model
- Repositorio de referencia (fran-martinez, NER biomedico): https://github.com/fran-martinez/bio_ner_bert
- Articulo sobre fine-tuning de BERT para NER: https://www.linkedin.com/pulse/fine-tuning-bert-named-entity-recognition-ner-arastu-thakur-spukc
