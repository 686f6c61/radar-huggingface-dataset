# Hooshaai/bert-adasplash-attention-sst2

## Resumen

`Hooshaai/bert-adasplash-attention-sst2` es un checkpoint de BERT-Base (`bert-base-uncased`, 110 millones de parametros) en el que el autor ha sustituido los bloques de atencion softmax cuadratica de las 12 capas del transformer por el mecanismo `adasplash_attention` de la libreria NeuralOps. El resultado es un modelo de clasificacion de sentimiento (SST-2) con complejidad subcuadratica, distribuido como pesos de atencion en FP16 de aproximadamente 55 MB que se aplican sobre los pesos congelados del BERT original.

El modelo se ha destilado desde el propio `bert-base-uncased` mediante el protocolo de destilacion de representaciones en cache de NeuralOps, con alineamiento de subespacio oculto en una primera etapa y KL de logits mas entropia cruzada de tarea en la segunda. Segun la model card, alcanza un 91,17 % de accuracy en el split de validacion de SST-2, solo 0,46 puntos por debajo del profesor (91,63 %), tras 202 pasos de optimizacion en una unica RTX 3090.

Su relevancia es fundamentalmente experimental: sirve como referencia reproducible para evaluar si un mecanismo de atencion subcuadratico puede igualar a la atencion cuadratica estandar en una tarea GLUE concreta, con un coste de entrenamiento declarado de 47,4 segundos y 8,5 GB de VRAM pico. No es un modelo generativo ni un asistente: es un clasificador binario de sentimiento en ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-Base con atencion `adasplash_attention` subcuadratica en las 12 capas |
| Parametros totales | 110 M (base BERT-Base); pesos distribuidos en el repo: solo atencion + cabeza de clasificacion en FP16 (~55 MB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base BERT-Base soporta 512 tokens; la model card no especifica el contexto efectivo del mecanismo adasplash) |
| Tipos de cuantizacion | FP16 (pesos de atencion serializados); no se documentan otras cuantizaciones |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | `attention_weights.safetensors` (FP16) + codigo remoto `modeling_neuralops_bert.py`; pesos base inicializados desde `bert-base-uncased` |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased` y reemplaza la atencion multi-cabeza estandar por `adasplash_attention`, un mecanismo de la Attention Zoo de NeuralOps con complejidad operativa efectiva O(N) u O(N log N) frente a la O(N²) de la atencion softmax cuadratica. La serializacion es modular: el repositorio contiene unicamente los parametros de atencion y la cabeza de clasificacion (FP16, ~55 MB), mientras que los pesos congelados del BERT base se cargan en tiempo de ejecucion desde el checkpoint original mediante el shim de codigo remoto.

El entrenamiento sigue el NeuralOps Cached Representation Distillation Protocol, con dos etapas: alineamiento de subespacio oculto (etapa 1) y KL de logits mas entropia cruzada de tarea (etapa 2). Se ejecuto en una NVIDIA GeForce RTX 3090 de 24 GB, con 202 pasos de optimizacion, 47,4 segundos de duracion, throughput de 34.901 tokens/s y 8.487 MB de VRAM pico, sin asignacion de VRAM para el profesor gracias al cacheado offline de representaciones. El dataset de evaluacion es GLUE SST-2 (872 muestras de validacion).

## Capacidades

- Clasificacion binaria de sentimiento (positivo/negativo) en ingles, tarea SST-2 de GLUE.
- Clasificacion de secuencias cortas con `AutoModelForSequenceClassification` de Transformers (`trust_remote_code=True`).
- Carga modular via la API de NeuralOps (`load_pretrained_bert` con `attention_type="adasplash_attention"` y `task="sequence-classification"`).
- Inferencia con atencion subcuadratica, potencialmente mas eficiente en secuencias largas que la atencion cuadratica (no se aportan mediciones de latencia por longitud).
- No soporta generacion de texto, tool calling, agentes, vision, audio ni modo thinking: es exclusivamente un cabezal de clasificacion.

## Casos de uso

- Clasificacion de sentimiento en resenas o tickets: el modelo devuelve una etiqueta binaria directamente desde `outputs.logits.argmax(dim=-1)`, adecuado para pipelines de moderacion o priorizacion de quejas en ingles.
- Investigacion sobre atencion subcuadratica: permite comparar `adasplash_attention` contra la atencion softmax estandar de BERT-Base en una tarea GLUE controlada, con una diferencia de accuracy documentada de -0,46 puntos.
- Reproduccion de experimentos de destilacion: el protocolo de representaciones cacheadas (sin VRAM de profesor) y los 202 pasos de entrenamiento permiten replicar el setup en una unica GPU consumer.
- Benchmark de eficiencia de mecanismos de atencion: util como baseline para medir coste y calidad de alternativas subcuadraticas en tareas de comprension de lenguaje.
- Prototipado rapido de clasificadores: la descarga de ~55 MB mas los pesos base congelados reduce el coste de almacenamiento frente a un checkpoint completo de 450 MB.
- Evaluacion de robustez de destilacion: sirve para estudiar la degradacion de calibracion (entropia cruzada de validacion de 0,3175 frente a 0,2428 del profesor) en estudiantes destilados con atencion modificada.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el split de validacion de GLUE SST-2 (872 muestras):

| Metrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD | Modelo destilado | Delta |
|---|---|---|---|---|
| Accuracy SST-2 | 91,63 % | 91,63 % | 91,17 % | -0,46 % |
| Entropia cruzada de validacion | 0,2428 | no calibrado | 0,3175 | no disponible |

Telemetria de entrenamiento declarada: 47,4 s, 202 pasos, 34.901 tokens/s, 8.487 MB de VRAM pico en RTX 3090. No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB para el modelo completo en FP16 (110 M de parametros mas overhead de activaciones en secuencias cortas); no se aporta una cifra oficial.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el autor valido el entrenamiento en una RTX 3090 de 24 GB, pero la inferencia cabe en GPUs de gama media.
- Cabe en GPU consumer: si, incluidas tarjetas con 4-8 GB de VRAM para clasificacion de secuencias cortas.
- Opciones de despliegue: Hugging Face Transformers con `trust_remote_code=True`; API de NeuralOps (`load_pretrained_bert`, `load_surgeried_model`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se publican mediciones de inferencia; solo el throughput de entrenamiento (34.901 tokens/s).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/bert-adasplash-attention-sst2` | 110 M (atencion + cabeza en ~55 MB) | no disponible | 91,17 % | MIT | Hugging Face, requiere `trust_remote_code` |
| `bert-base-uncased` (profesor) | 110 M | 512 tokens | 91,63 % | Apache 2.0 | Hugging Face, Transformers estandar |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66 M | 512 tokens | no disponible en esta informacion | Apache 2.0 | Hugging Face, Transformers estandar |
| `roberta-base` fine-tuned en SST-2 | 125 M | 512 tokens | no disponible en esta informacion | MIT | Hugging Face, Transformers estandar |

La comparativa se limita a arquitecturas BERT-like de tamano similar; no se dispone de datos de benchmarks de las alternativas en la informacion proporcionada, por lo que solo se contrasta el resultado del profesor, que figura en la propia model card.

## Limitaciones y advertencias

- Solo ingles: el modelo se entrena y evalua exclusivamente en SST-2, por lo que no debe esperarse un rendimiento fiable en otros idiomas.
- Tarea unica: es un clasificador binario de sentimiento; no genera texto ni responde instrucciones.
- Dependencia de codigo remoto: requiere `trust_remote_code=True` y el shim `modeling_neuralops_bert.py`, lo que implica auditar el codigo antes de usarlo en produccion.
- Pesos incompletos por diseno: el repositorio no contiene los pesos base; la carga depende de que `bert-base-uncased` siga disponible en el Hub.
- Calibracion degradada: la entropia cruzada de validacion sube de 0,2428 a 0,3175, por lo que las probabilidades del estudiante estan peor calibradas que las del profesor.
- Perdida de accuracy de 0,46 puntos frente al profesor, aceptable para experimentacion pero relevante en tareas sensibles.
- Riesgo de alucinacion no aplica en sentido generativo, pero si hay riesgo de clasificaciones erroneas en dominios alejados de resenas de pelicula (SST-2).
- Sesgos: no se documenta ningun analisis de sesgos; al heredar el corpus de BERT-Base y SST-2, puede reproducir sesgos de esos datos.
- Licencia MIT permite uso comercial, pero el modelo base `bert-base-uncased` mantiene su propia licencia Apache 2.0, que debe respetarse.
- Ecosistema limitado: 83 descargas y 0 likes en el momento de la consulta, sin validacion independiente de los resultados declarados.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/bert-adasplash-attention-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/bert-base-uncased
