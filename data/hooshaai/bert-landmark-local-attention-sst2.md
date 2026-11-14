# Hooshaai/bert-landmark-local-attention-sst2

## Resumen

`Hooshaai/bert-landmark-local-attention-sst2` es un checkpoint de BERT-Base (`google-bert/bert-base-uncased`, 110M parametros) en el que los bloques de atencion softmax cuadratica de las 12 capas del transformer se han sustituido por el mecanismo `landmark_local_attention` de la libreria NeuralOps. El objetivo es demostrar que una atencion subcuadratica (complejidad efectiva O(N) u O(N log N) frente a O(N^2)) puede destilarse hasta recuperar un rendimiento competitivo en una tarea de clasificacion de secuencias, en este caso el analisis de sentimiento binario de GLUE SST-2.

El modelo se ha entrenado con el protocolo de destilacion de representaciones en cache de NeuralOps (sin asignacion de VRAM para el profesor, alineamiento offline de representaciones) sobre una NVIDIA GeForce RTX 3090 de 24 GB. El resultado reportado es una accuracy del 82,45 % en el split de validacion de SST-2 (872 muestras), partiendo de un estudiante sin destilar que solo alcanzaba el 50,92 % y tomando como referencia un profesor `bert-base-uncased` afinado que llega al 91,63 %.

Su relevancia es doble: por un lado sirve como banco de pruebas reproducible para investigar atencion subcuadratica sobre arquitecturas BERT ya conocidas; por otro, el repositorio distribuye unicamente los pesos de atencion y la cabeza de clasificacion en FP16 (~55 MB), lo que reduce drasticamente el coste de descarga y almacenamiento respecto a un checkpoint completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT-Base (transformer encoder, 12 capas) con atencion `landmark_local_attention` sustituyendo la MHA softmax cuadratica |
| Parametros totales | 110M (base `bert-base-uncased`); el repositorio solo publica pesos de atencion y cabeza de clasificacion (~55 MB en FP16) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de `bert-base-uncased`, 512 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | pesos publicados en FP16 (`attention_only_fp16`); no se documentan otras cuantizaciones |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | `attention_weights.safetensors` (FP16); requiere `trust_remote_code=True` y el shim `modeling_neuralops_bert.py` |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased` y reemplaza en las 12 capas el mecanismo de atencion multi-cabeza estandar por `landmark_local_attention`, una variante de atencion subcuadratica con complejidad efectiva O(N) u O(N log N). Los pesos base de BERT permanecen congelados; solo se entrenan los parametros de atencion y la cabeza de clasificacion, que se serializan aparte y se aplican en tiempo de carga sobre el modelo base descargado desde el Hub.

El entrenamiento sigue el NeuralOps Cached Representation Distillation Protocol en dos etapas: primero una alineacion de subespacio oculto (Stage 1 Subspace Hidden Alignment) y despues una combinacion de KL sobre logits y entropia cruzada de la tarea (Stage 2 Logit KL + Task CE). Se ejecuto en una RTX 3090 de 24 GB con 94 pasos de optimizacion, 53,3 s de duracion, throughput de 14.435,6 tokens/s y un pico de VRAM de 14.749 MB. El dataset de evaluacion y entrenamiento es GLUE SST-2 (clasificacion binaria de sentimiento, 872 muestras de validacion). No se detalla en la informacion disponible el numero total de tokens de entrenamiento ni la composicion completa del dataset mas alla de GLUE/SST-2.

## Capacidades

- Clasificacion de texto binaria (analisis de sentimiento positivo/negativo) sobre secuencias en ingles.
- Razonamiento sobre representaciones contextuales de BERT-Base con atencion subcuadratica, lo que en teoria reduce el coste computacional en secuencias largas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingue limitada al ingles (unico idioma declarado).
- No se documentan modos especiales como thinking mode, vision o audio.
- Carga modular via `neuralops.hub.bert_zoo.load_pretrained_bert` o `neuralops.hub.load_surgeried_model`.

## Casos de uso

- Clasificacion de sentimiento en resenas y feedback de producto: el modelo devuelve una etiqueta binaria (0 negativo, 1 positivo) directamente desde `AutoModelForSequenceClassification`, adecuado para pipelines de monitorizacion de opinion en ingles.
- Filtrado de comentarios en plataformas comunitarias: con 110M parametros y pesos de atencion de ~55 MB, se puede desplegar en CPU o GPU de gama baja para moderacion a gran escala donde el coste por inferencia es critico.
- Investigacion en atencion subcuadratica: sirve como checkpoint de referencia para comparar `landmark_local_attention` frente a MHA estandar en tareas GLUE, con metricas reproducibles (82,45 % en SST-2).
- Destilacion y experimentos de eficiencia: el protocolo NeuralOps y los pesos modulares permiten reproducir el entrenamiento en una sola RTX 3090 en menos de un minuto, util para docencia o prototipado rapido.
- Enrutamiento de tickets de soporte: clasificacion binaria de tono (positivo/negativo) como primera etapa de un pipeline de atencion al cliente en ingles, antes de modelos generativos mas costosos.
- Benchmark de infraestructura: por su tamano reducido y su latencia baja (throughput reportado de 14.435 tokens/s en entrenamiento), es util para validar despliegues de vLLM, TGI o llama.cpp con modelos BERT custom.

## Benchmarks y rendimiento

Evaluacion sobre GLUE SST-2 validation split (872 muestras binarias):

| Metrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD | Modelo destilado | Delta |
|---|---|---|---|---|
| Accuracy SST-2 | 91,63 % | 50,92 % | 82,45 % | +31,54 % |
| Cross-entropy de validacion | 0,2428 | no calibrado | 0,4403 | convergido |

Telemetria de entrenamiento (RTX 3090 24 GB):

| Metrica | Valor |
|---|---|
| Duracion | 53,3 s |
| Pasos de optimizacion | 94 |
| Throughput | 14.435,6 tokens/s |
| Pico de VRAM | 14.749 MB |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el entrenamiento uso 14.749 MB en una RTX 3090, pero la inferencia con pesos FP16 de atencion y base BERT congelado deberia ser muy inferior.
- GPU recomendadas: NVIDIA RTX 3090 (validada en entrenamiento); cualquier GPU con al menos ~8 GB deberia bastar para inferencia, aunque no se confirma en la model card.
- Cabe en GPU consumer: si, el entrenamiento se realizo en una RTX 3090; el modelo base de 110M parametros es ligero.
- Opciones de despliegue: Hugging Face Transformers con `trust_remote_code=True`, API modular de NeuralOps (`load_pretrained_bert`, `load_surgeried_model`). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: solo se reporta throughput de entrenamiento (14.435,6 tokens/s); no hay datos de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 (accuracy) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/bert-landmark-local-attention-sst2` | 110M | no disponible | 82,45 % | MIT | Hugging Face |
| `google-bert/bert-base-uncased` (profesor afinado) | 110M | 512 tokens | 91,63 % | Apache 2.0 | Hugging Face |
| `textattack/bert-base-uncased-SST-2` | 110M | 512 tokens | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66M | 512 tokens | no disponible en esta ficha | Apache 2.0 | Hugging Face |

La comparativa con `textattack/bert-base-uncased-SST-2` y `distilbert-base-uncased-finetuned-sst-2-english` se incluye por categoria (clasificacion SST-2 en ingles), pero no se dispone de sus cifras exactas en la informacion proporcionada; no se inventan.

## Limitaciones y advertencias

- Accuracy del 82,45 % frente al 91,63 % del profesor: la brecha de casi 9 puntos indica que la atencion subcuadratica destilada no iguala al BERT original en esta tarea.
- El estudiante pre-destilacion solo alcanzaba el 50,92 %, lo que sugiere que el mecanismo `landmark_local_attention` sin destilacion no aprende practicamente nada en SST-2; la dependencia del profesor es alta.
- Solo ingles; no se declara soporte multilingue.
- Solo se ha evaluado en SST-2 (clasificacion binaria); no hay evidencia de generalizacion a otras tareas GLUE ni a otros dominios.
- Requiere `trust_remote_code=True` y codigo remoto (`modeling_neuralops_bert.py`), lo que implica revisar el shim antes de ejecutarlo en produccion.
- Los pesos publicados son solo de atencion y cabeza (~55 MB); es necesario descargar `bert-base-uncased` por separado, lo que anade una dependencia externa.
- Riesgo de alucinacion no aplica directamente (es clasificacion, no generacion), pero si hay riesgo de calibracion pobre: la cross-entropy de validacion (0,4403) es notablemente superior a la del profesor (0,2428).
- No se documentan sesgos especificos; al heredar el base de BERT, es probable que arrastre sesgos del corpus original, aunque no se detalla.
- Licencia MIT permite uso comercial, pero el modelo base `bert-base-uncased` tiene licencia Apache 2.0, que debe respetarse por separado.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/bert-landmark-local-attention-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Modelo base: https://huggingface.co/bert-base-uncased
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
