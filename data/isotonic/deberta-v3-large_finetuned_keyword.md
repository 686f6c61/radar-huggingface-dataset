# Isotonic/deberta-v3-large_finetuned_keyword

## Resumen

DeBERTa-v3-large finetuneado por el usuario Isotonic para la tarea de extraccion de palabras clave (keyword extraction) mediante etiquetado de tokens (token classification). El modelo parte de `microsoft/deberta-v3-large`, un encoder de la familia DeBERTa v3 que incorpora attention disentangled y un objetivo de preentrenamiento con ELECTRA-style replaced token detection, y lo especializa sobre un dataset sintetico de palabras clave.

El modelo resuelve un problema acotado y bien definido: identificar y clasificar terminos relevantes dentro de un texto, devolviendo etiquetas BIO por token en lugar de generar texto libre. Esto lo hace adecuado para pipelines de procesamiento de lenguaje natural donde se necesita extraer entidades o keywords de forma determinista y de bajo coste computacional, sin generacion autoregresiva.

Es relevante por su simplicidad operativa: al ser un encoder de clasificacion (no un modelo generativo), ofrece inferencia rapida y resultados reproducibles. No obstante, la informacion publica es escasa: la model card esta generada automaticamente, no declara idiomas soportados, no incluye benchmarks externos y el autor no ha detallado la composicion del dataset de entrenamiento mas alla de calificarlo como "sintetico".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DeBERTa v3 con attention disentangled), tarea de token classification |
| Parametros totales | no disponible (el modelo base `microsoft/deberta-v3-large` tiene aproximadamente 435 M, dato no declarado en la ficha del autor) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (DeBERTa v3 soporta hasta 512 tokens en configuracion estandar, no confirmado en esta ficha) |
| Tipos de cuantizacion | no disponible (pesos PyTorch; compatible con cuantizacion dinamica via PyTorch, no documentado por el autor) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | PyTorch (safetensors/bin segun repo de transformers); no se declara GGUF ni ONNX |

## Arquitectura y entrenamiento

El modelo es un finetune completo (no adaptadores) de `microsoft/deberta-v3-large` para token classification. DeBERTa v3 utiliza attention disentangled, que separa el contenido y la posicion relativa en el calculo de la atencion, y un preentrenamiento con replaced token detection al estilo ELECTRA en lugar del masked language modeling clasico. Sobre esa base, el autor anade una cabeza de clasificacion por token y entrena con etiquetas de tipo BIO para marcar palabras clave.

Los hiperparametros declarados son: learning rate 5e-4, batch de entrenamiento y evaluacion de 16, optimizador Adam (betas 0.9/0.999, epsilon 1e-8), scheduler lineal con warmup ratio 0.2, 3 epocas y semilla 42. El entrenamiento se realizo sobre un dataset sintetico de keywords (composicion no detallada). El historial de validacion muestra un comportamiento inestable: el mejor punto se alcanza en el step 1000 (epoch 0.11) con F1 global de 0.8982, y en el step 2000 (epoch 0.22) las metricas colapsan a 0.0, lo que sugiere un posible problema de convergencia o de datos en esa fase del entrenamiento. No se documenta uso de RLHF, DPO ni tecnicas de decodificacion especulativa (no aplican a un encoder de clasificacion).

## Capacidades

- Extraccion de palabras clave mediante etiquetado de tokens (prediccion de etiquetas BIO por token).
- Clasificacion de entidades a nivel de token, reutilizable para tareas de NER o keyphrase extraction con el esquema de etiquetas adecuado.
- Inferencia determinista y de baja latencia al ser un encoder, sin generacion autoregresiva.
- No soporta tool calling ni function calling (no es un modelo generativo).
- No soporta agentes ni razonamiento multi-step.
- Capacidades multilingues: no disponibles; no se declara el idioma de entrenamiento.
- No dispone de thinking mode, vision ni audio.

## Casos de uso

- Extraccion de keywords en articulos y blogs: el modelo etiqueta terminos relevantes token a token, lo que permite construir indices de busqueda o sistemas de tagging automatico sobre corpus editoriales.
- Enriquecimiento de metadatos en bases documentales: integrado en un pipeline de ingesta, marca las palabras clave de cada documento para facilitar filtrado y recuperacion.
- Preprocesamiento para motores de busqueda internos: las keywords extraidas alimentan campos indexables y mejoran la precision de consultas sin necesidad de un LLM generativo.
- Clasificacion de tickets de soporte: extraccion de terminos tecnicos y nombres de producto de descripciones de incidencias para enrutamiento automatico.
- Analisis de resenas y feedback: identificacion de aspectos mencionados (producto, servicio, caracteristica) como paso previo a analisis de sentimiento por aspecto.
- Construccion de datasets de entrenamiento: uso del modelo como etiquetador debil para generar anotaciones de keywords sobre grandes volumenes de texto y luego revisar manualmente una muestra.
- Moderacion y filtrado de contenido: deteccion de terminos sensibles o palabras clave de interes en flujos de texto entrante.

## Benchmarks y rendimiento

Resultados declarados por el autor en el conjunto de evaluacion (model-index sin resultados externos; los datos provienen del historial de entrenamiento de la model card):

| Metrica | Valor |
|---|---|
| Loss (evaluacion) | 0.1190 |
| Overall Precision | 0.9010 |
| Overall Recall | 0.8953 |
| Overall F1 | 0.8982 |
| Overall Accuracy | 0.9589 |
| Key F1 | 0.8982 |

Evolucion durante el entrenamiento:

| Step | Epoch | Validation loss | Precision | Recall | F1 | Accuracy |
|---|---|---|---|---|---|---|
| 500 | 0.05 | 0.1270 | 0.8772 | 0.9142 | 0.8953 | 0.9564 |
| 1000 | 0.11 | 0.1190 | 0.9010 | 0.8953 | 0.8982 | 0.9589 |
| 1500 | 0.16 | 0.1212 | 0.8955 | 0.8991 | 0.8973 | 0.9580 |
| 2000 | 0.22 | 0.8758 | 0.0 | 0.0 | 0.0 | 0.6601 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ya que no aplican a un modelo de token classification.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 1,7-1,8 GB solo para pesos (435 M de parametros), mas overhead de activaciones; en la practica, entre 2 y 3 GB para lotes pequenos.
- En FP16/BF16: aproximadamente 0,9 GB de pesos, con consumo total tipico de 1,5-2 GB.
- GPU recomendadas: cualquier GPU consumer moderna sirve; RTX 3060 12 GB, RTX 4070, RTX 4090, A10, L4, A100 y H100 son mas que suficientes. Tambien es viable en CPU para lotes pequenos.
- Cabe holgadamente en GPU consumer (incluso en GPUs de 4-6 GB).
- Opciones de despliegue: `transformers` con `pipeline("token-classification")`, TorchServe, FastAPI + PyTorch, ONNX Runtime tras exportacion, y `optimum` para aceleracion. No se declara soporte nativo en vLLM, llama.cpp ni Ollama (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles en la informacion proporcionada. Al ser un encoder de ~435 M de parametros, se espera un throughput alto en GPU, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Isotonic/deberta-v3-large_finetuned_keyword | no disponible (~435 M en base) | no disponible | Token classification (keywords) | MIT | Hugging Face |
| microsoft/deberta-v3-large | ~435 M | 512 tokens (estandar) | Modelo base (encoder) | MIT | Hugging Face |
| dslim/bert-base-NER | ~110 M | 512 tokens | Token classification (NER) | MIT | Hugging Face |
| Jean-Baptiste/roberta-large-ner-english | ~355 M | 512 tokens | Token classification (NER) | MIT | Hugging Face |

La comparacion con modelos NER es orientativa: comparten la tarea de etiquetado de tokens, pero el modelo de Isotonic esta especializado en keywords y no en entidades nombradas. No se dispone de benchmarks comparativos publicados entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Dataset de entrenamiento sintetico y no documentado: el rendimiento en texto real puede diferir del reportado en evaluacion.
- Inestabilidad en el entrenamiento: en el step 2000 las metricas colapsan a 0.0, lo que indica un posible problema de convergencia o de datos; conviene validar el checkpoint publicado antes de usarlo en produccion.
- Idiomas soportados no declarados: no se puede asumir buen rendimiento fuera del idioma de entrenamiento.
- Longitud de contexto no confirmada en la ficha; DeBERTa v3 esta limitado a 512 tokens en configuracion estandar, lo que restringe documentos largos sin troceado.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si de falsos positivos y negativos en la extraccion de keywords.
- Sesgos: no documentados por el autor; al entrenar sobre datos sinteticos, los sesgos dependen de como se genero ese dataset.
- Licencia MIT permite uso comercial, pero el autor no ofrece garantias ni soporte.
- La model card esta generada automaticamente y no detalla el esquema de etiquetas, el tokenizador exacto ni el preprocesamiento, lo que complica la reproducibilidad.
- El tamano del repo (27,5 GB) es desproporcionado para un modelo de ~435 M de parametros, lo que sugiere artefactos de entrenamiento adicionales; conviene revisar los archivos antes de descargar.

## Enlaces

- Hugging Face: https://huggingface.co/Isotonic/deberta-v3-large_finetuned_keyword
- Modelo base: https://huggingface.co/microsoft/deberta-v3-large
- Paper DeBERTa v3 (DeBERTaV3: Improving DeBERTa using ELECTRA-Style Pre-Training with Gradient-Disentangled Embedding Sharing): https://arxiv.org/abs/2111.09543
- Repositorio DeBERTa (Microsoft): https://github.com/microsoft/DeBERTa
