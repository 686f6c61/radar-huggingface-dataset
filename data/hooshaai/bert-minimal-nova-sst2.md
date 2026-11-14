# Hooshaai/bert-minimal-nova-sst2

## Resumen

`bert-minimal-nova-sst2` es un checkpoint derivado de `google-bert/bert-base-uncased` en el que las doce capas de atencion softmax cuadratica originales se han sustituido por el mecanismo `minimal_nova`, perteneciente a la libreria NeuralOps (Attention Zoo). El modelo lo publica el usuario Hooshaai (autor citado en la model card como Taha Majlesi) y su proposito es demostrar que una atencion subcuadratica de complejidad efectiva O(N) u O(N log N) puede igualar practicamente el rendimiento de la atencion cuadratica clasica en una tarea de clasificacion de sentimiento.

El checkpoint se ha destilado sobre la tarea SST-2 del benchmark GLUE mediante el protocolo NeuralOps Cached Representation Distillation, con alineamiento de representaciones en dos etapas (subspace hidden alignment y posterior KL sobre logits mas entropia cruzada de tarea). El resultado reportado es un 90,02 % de accuracy en el split de validacion de SST-2, frente al 91,63 % del profesor BERT-base original, lo que supone una perdida de solo 1,61 puntos.

La relevancia del modelo es fundamentalmente experimental: sirve como prueba de concepto reproducible de atencion subcuadratica sobre un backbone BERT estandar, con un formato de pesos modular muy ligero (unos 55 MB en FP16, solo atencion y cabeza de clasificacion) que se recombina en tiempo de carga con los pesos congelados de BERT-base. No es un modelo generativo ni un asistente conversacional: es un clasificador binario de sentimiento en ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-base con atencion `minimal_nova` (subcuadratica) en las 12 capas |
| Parametros totales | 110 M (backbone BERT-base); pesos entrenados publicados: solo atencion + cabeza de clasificacion (~55 MB FP16) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (hereda la de BERT-base, 512 tokens, no confirmado en la informacion) |
| Tipos de cuantizacion | FP16 en los pesos publicados (`attention_only_fp16`); no se documentan otras cuantizaciones |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`attention_weights.safetensors`), carga via `trust_remote_code=True` o API NeuralOps |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased`, un encoder transformer de 12 capas y 110 M de parametros, y reemplaza en todas las capas el bloque de multi-head attention con softmax cuadratico por el mecanismo `minimal_nova` de NeuralOps, que reduce la complejidad operativa efectiva a O(N) u O(N log N). Los pesos base de BERT permanecen congelados y se inicializan en tiempo de carga desde el repositorio original; el repositorio solo almacena los parametros de atencion entrenados y la cabeza de clasificacion en FP16, mediante un shim de codigo remoto (`modeling_neuralops_bert.py`).

El entrenamiento sigue el NeuralOps Cached Representation Distillation Protocol, con dos etapas: alineamiento de subespacio oculto y despues KL sobre logits combinada con entropia cruzada de la tarea. Se ejecuto en una NVIDIA GeForce RTX 3090 de 24 GB (cluster HPC Sharif), con 268 pasos de optimizacion, 49,8 segundos de duracion, un throughput efectivo de 44.098,4 tokens/s y un pico de VRAM de 23.021 MB. El protocolo evita reservar VRAM para el profesor mediante cacheado offline de representaciones. El conjunto de datos es SST-2 (GLUE), con 872 muestras en el split de validacion usado para evaluacion.

## Capacidades

- Clasificacion binaria de sentimiento (positivo/negativo) en ingles sobre texto corto, formato SST-2.
- Inferencia con `AutoModelForSequenceClassification` de Transformers usando `trust_remote_code=True`.
- Carga modular mediante la API `neuralops.hub.bert_zoo.load_pretrained_bert` o `load_surgeried_model`, que reconstruye el modelo aplicando solo los pesos de atencion destilados sobre BERT-base.
- Atencion subcuadratica: en teoria permite secuencias mas largas con menor coste asintotico que la atencion cuadratica, aunque no se documentan pruebas mas alla de la longitud estandar de SST-2.
- No soporta generacion de texto, tool calling, agentes, vision ni audio.
- No se documentan capacidades multilingues: solo ingles.

## Casos de uso

- Analisis de sentimiento en resenas de producto o comentarios de usuarios en ingles: el modelo clasifica secuencias cortas con un 90,02 % de accuracy en SST-2, suficiente para triaje automatico a gran escala con coste de inferencia bajo.
- Moderacion de comentarios y filtrado de toxicidad como primera etapa: al ser un clasificador binario rapido, puede prefiltrar grandes volumenes de texto antes de pasar a modelos mas costosos.
- Investigacion en atencion subcuadratica: sirve como checkpoint de referencia reproducible para comparar `minimal_nova` con atencion softmax estandar sobre el mismo backbone y la misma tarea.
- Docencia y experimentacion con destilacion de conocimiento: el protocolo de dos etapas y el formato de pesos modular (55 MB) permiten reproducir el pipeline en una unica GPU consumer.
- Base para fine-tuning ligero en tareas de clasificacion similares (por ejemplo, clasificacion de intenciones o deteccion de spam en ingles) reutilizando la atencion ya destilada.
- Benchmark interno de eficiencia: medir latencia y throughput de una atencion subcuadratica frente a BERT-base en el mismo hardware para decidir si merece la pena migrar cargas de clasificacion.

## Benchmarks y rendimiento

Evaluacion sobre el split de validacion de GLUE SST-2 (872 muestras binarias), segun la model card:

| Metrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD (`minimal_nova`) | Modelo destilado | Delta |
|---|---|---|---|---|
| Accuracy SST-2 | 91,63 % | 51,38 % | 90,02 % | +38,65 pp (respecto al pre-KD); -1,61 pp respecto al profesor |
| Entropia cruzada de validacion | 0,2428 | No calibrada | 0,3186 | Convergido |

No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el backbone BERT-base en FP32 ocupa aproximadamente 450 MB de pesos; en FP16, unos 220 MB. Con activaciones y overhead de runtime, cabe holgadamente en cualquier GPU con 2 GB o mas.
- Los pesos publicados en el repositorio son solo de atencion y cabeza de clasificacion (~55 MB en FP16); el backbone se descarga aparte desde `bert-base-uncased`.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4090, etc.); el entrenamiento documentado se hizo en una RTX 3090 de 24 GB, pero por el tamano del modelo no es necesario ese nivel.
- Cabe en GPU consumer: si, sin problema, incluidas GPUs de gama baja y posiblemente CPU para inferencia por lotes pequenos.
- Opciones de despliegue: Transformers con `trust_remote_code=True`, API NeuralOps (`neuralops.hub`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: en entrenamiento se reportan 44.098,4 tokens/s en una RTX 3090; no se documentan cifras de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 accuracy | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `bert-minimal-nova-sst2` | 110 M (backbone) | No disponible | 90,02 % (validacion) | MIT | Hugging Face, requiere `trust_remote_code` |
| `google-bert/bert-base-uncased` (profesor, fine-tuned SST-2) | 110 M | 512 tokens | 91,63 % (validacion, segun la model card) | Apache 2.0 | Hugging Face, estandar |
| Otros checkpoints del NeuralOps Attention Zoo | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de otros modelos comparables (por ejemplo, RoBERTa-base o DeBERTa-v3-base fine-tuned en SST-2) en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en clasificacion binaria de sentimiento en ingles; no es un modelo de proposito general ni generativo.
- La accuracy cae 1,61 puntos respecto al profesor BERT-base (90,02 % frente a 91,63 %), por lo que en produccion con requisitos estrictos puede no ser la mejor opcion.
- El estudiante pre-destilacion tenia un 51,38 % de accuracy, lo que indica que la atencion `minimal_nova` sin destilacion no aprende bien la tarea por si sola; el checkpoint depende fuertemente del protocolo de destilacion.
- Requiere `trust_remote_code=True` y ejecuta codigo remoto (`modeling_neuralops_bert.py`), lo que implica revisar y auditar el codigo antes de usarlo en entornos de produccion.
- Depende de la libreria NeuralOps y de la disponibilidad de `bert-base-uncased` en el Hub para reconstruir el modelo completo.
- Solo se ha evaluado en SST-2; no hay evidencia de generalizacion a otras tareas de clasificacion ni a dominios distintos.
- Riesgo de alucinacion no aplica en sentido generativo, pero si hay riesgo de clasificaciones erroneas en textos ambiguos, sarcasticos o fuera de dominio.
- No se documentan sesgos especificos; al heredar el backbone BERT-base, es previsible que arrastre sesgos de genero, raza y dominio presentes en los datos originales de BERT.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones del backbone base (`bert-base-uncased`, Apache 2.0) y de la libreria NeuralOps.
- El repositorio tiene muy pocas descargas (85) y cero likes en el momento de la consulta; es un artefacto de investigacion con poca validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-minimal-nova-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/bert-base-uncased
- Dataset GLUE / SST-2: https://huggingface.co/datasets/glue
