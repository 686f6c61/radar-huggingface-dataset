# azherali/CodeDetect-BERT-T2

## Resumen

CodeDetect-BERT-T2 es un modelo de clasificación de texto obtenido mediante fine-tuning de `google-bert/bert-base-uncased`, publicado por el usuario azherali en Hugging Face. Por el nombre y la configuración, está orientado a la detección de código (probablemente clasificación binaria o multiclase de fragmentos de texto como código frente a lenguaje natural, o entre lenguajes de programación), aunque la model card no documenta explícitamente la tarea ni el dataset de entrenamiento.

El modelo conserva la arquitectura BERT base original: un transformer encoder de 12 capas con 109.490.699 parámetros totales (~109,5 M), pesos en safetensors y una ventana de contexto de 512 tokens, la estándar de la familia BERT. Se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Su relevancia es limitada: los resultados declarados por el autor son modestos (accuracy 0,5548, F1 0,5115 en el conjunto de evaluación) y la documentación es prácticamente inexistente. Es un modelo de nicho, útil como referencia o punto de partida para tareas de clasificación de código, pero no recomendable para producción sin una evaluación adicional sobre datos propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base, 12 capas) |
| Parametros totales | 109.490.699 (~109,5 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (estandar de bert-base-uncased) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32; compatible con cuantizacion dinamica via PyTorch/ONNX) |
| Idiomas soportados | no disponible (el modelo base es principalmente ingles; la model card no lo especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo de `bert-base-uncased`: un transformer encoder bidireccional de 12 capas, 768 dimensiones ocultas y 12 cabezas de atencion, con una cabeza de clasificacion de secuencia superpuesta para la tarea de text-classification. No se trata de un modelo generativo ni de un MoE; es un clasificador discriminativo.

El entrenamiento se realizo con el `Trainer` de Hugging Face sobre un dataset no identificado (la model card indica "None dataset"). Los hiperparametros documentados son: learning rate 2e-05, batch size de 64 (entrenamiento y evaluacion), optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal con warmup del 10 %, 5 epocas, seed 42 y precision mixta nativa (AMP). El entrenamiento alcanzo 66.175 pasos. No se documenta composicion del dataset, numero de tokens, ni si hubo RLHF/DPO (improcedente en un clasificador). Las versiones de framework fueron Transformers 5.13.1, PyTorch 2.11.0+cu130, Datasets 4.0.0 y Tokenizers 0.22.2.

## Capacidades

- Clasificacion de texto (text-classification): salida de etiquetas y probabilidades para una secuencia de entrada.
- Deteccion de codigo (segun el nombre del modelo): presumiblemente distingue fragmentos de codigo de lenguaje natural o clasifica entre categorias relacionadas con codigo, aunque la tarea exacta no esta documentada.
- Procesamiento de secuencias de hasta 512 tokens.
- Compatible con Text Embeddings Inference (tag `text-embeddings-inference`) y endpoints compatibles.
- No soporta generacion de texto, tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de modo thinking, vision ni audio.
- Capacidades multilingues: no documentadas; hereda el sesgo hacia ingles de bert-base-uncased.

## Casos de uso

- Filtrado de contenido en repositorios: clasificar fragmentos de texto como codigo o prosa para enrutar contenido en pipelines de documentacion o indexacion, aprovechando la cabeza de clasificacion sobre secuencias de hasta 512 tokens.
- Deteccion de bloques de codigo en texto libre: preprocesar articulos, issues o correos para extraer o marcar fragmentos de codigo antes de un analisis posterior.
- Moderacion o triaje de snippets: clasificar entradas de formularios o comentarios que contengan codigo para derivarlos a un revisor humano o a un analizador estatico.
- Etiquetado auxiliar en datasets: usar el modelo como preetiquetador en un flujo de anotacion semiautomatica, con revision humana posterior, dado su bajo coste computacional (~109 M de parametros).
- Baseline de investigacion: punto de partida para comparar fine-tunings de BERT en tareas de clasificacion de codigo, gracias a su licencia Apache 2.0 y pesos safetensors.
- Inferencia en CPU o GPU de gama baja: por su tamano reducido, puede desplegarse en entornos con recursos limitados para clasificacion por lotes de baja latencia.
- Servicio de embeddings/clasificacion ligero: integrable via Text Embeddings Inference o un endpoint compatible para clasificar peticiones en tiempo real.

## Benchmarks y rendimiento

Resultados declarados por el autor en el conjunto de evaluacion (model card). No hay comparaciones con otros modelos en la informacion disponible.

| Metrica | Valor |
|---|---|
| Loss (evaluacion) | 1,6532 |
| Accuracy | 0,5548 |
| F1 | 0,5115 |
| Precision | 0,5100 |
| Recall | 0,5203 |

Evolucion por epoca (validacion):

| Epoca | Paso | Loss validacion | Accuracy | F1 | Precision | Recall |
|---|---|---|---|---|---|---|
| 1.0 | 13235 | 1,2988 | 0,5366 | 0,4938 | 0,5137 | 0,5308 |
| 2.0 | 26470 | 1,3334 | 0,5470 | 0,5079 | 0,5153 | 0,5355 |
| 3.0 | 39705 | 1,4235 | 0,5521 | 0,5082 | 0,5106 | 0,5232 |
| 4.0 | 52940 | 1,5582 | 0,5537 | 0,5077 | 0,5057 | 0,5197 |
| 5.0 | 66175 | 1,6532 | 0,5548 | 0,5115 | 0,5100 | 0,5203 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: ~0,44 GB solo de pesos (109,5 M parametros x 4 bytes), mas activaciones y overhead; en la practica, menos de 1 GB.
- En fp16/bf16: ~0,22 GB de pesos.
- Cabe holgadamente en cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) e incluso en CPU para lotes pequenos.
- GPU recomendadas: no requiere GPU dedicada; una T4 o RTX 3060 es mas que suficiente para throughput alto por lotes.
- Opciones de despliegue: `transformers` (PyTorch), Text Embeddings Inference (tag oficial), ONNX Runtime, y conversiones a otros runtimes. No se documenta soporte GGUF/llama.cpp.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por tamano, se espera inferencia en milisegundos por secuencia en GPU moderna y decenas de milisegundos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| CodeDetect-BERT-T2 | ~109,5 M | 512 | Apache 2.0 | Fine-tuning de bert-base-uncased; accuracy 0,5548 declarada |
| google-bert/bert-base-uncased | ~110 M | 512 | Apache 2.0 | Modelo base; no especializado en clasificacion de codigo |
| CodeBERT (microsoft/codebert-base) | ~125 M | 512 | MIT | Preentrenado en codigo y lenguaje natural; alternativa natural para tareas de codigo |
| GraphCodeBERT (microsoft/graphcodebert-base) | ~125 M | 512 | MIT | Incorpora estructura de grafo de datos; orientado a comprension de codigo |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada; la comparacion se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- Documentacion practicamente inexistente: la model card indica "More information needed" en descripcion, usos previstos y datos de entrenamiento; no se puede verificar la tarea exacta ni el dominio de aplicacion.
- Rendimiento modesto: accuracy 0,5548 y F1 0,5115 en el conjunto de evaluacion declarado, apenas por encima del azar en un problema binario; no apto para produccion sin validacion sobre datos propios.
- Sobreajuste probable: la loss de validacion aumenta de 1,2988 (epoca 1) a 1,6532 (epoca 5) mientras la loss de entrenamiento cae de 1,2780 a 0,4668, senal clasica de sobreajuste.
- Sesgos: hereda los sesgos de bert-base-uncased, entrenado principalmente con texto en ingles de fuentes web; no se documenta mitigacion.
- Riesgo de alucinacion: no aplica en sentido generativo (es un clasificador), pero puede producir etiquetas erroneas con alta confianza en dominios distintos al de entrenamiento.
- Limitacion de contexto: 512 tokens; secuencias mas largas requieren truncado o segmentacion, lo que puede perder informacion relevante.
- Idioma: no se documenta soporte multilingue; el rendimiento fuera del ingles es incierto.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero el autor no ofrece garantias; el modelo se distribuye "tal cual".
- Reputacion: 48 descargas y 0 likes en el momento de la consulta; sin validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/azherali/CodeDetect-BERT-T2
- Modelo base: https://huggingface.co/bert-base-uncased
- Repositorio de Transformers: https://github.com/huggingface/transformers
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
