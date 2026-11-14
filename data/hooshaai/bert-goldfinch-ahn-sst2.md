# Hooshaai/bert-goldfinch-ahn-sst2

## Resumen

`bert-goldfinch-ahn-sst2` es un checkpoint experimental publicado por el usuario Hooshaai (la model card cita al autor Taha Majlesi y el repositorio NeuralOps) que sustituye los bloques de atencion softmax cuadratica de las 12 capas de `bert-base-uncased` por el mecanismo `goldfinch_ahn`, un operador de atencion subcuadratica (complejidad efectiva O(N) u O(N log N)) implementado en la libreria NeuralOps. El modelo se presenta como una sonda de destilacion: se entrena y evalua sobre la tarea SST-2 del benchmark GLUE mediante el protocolo "Cached Representation Distillation" de NeuralOps, con alineacion de representaciones en dos etapas (subespacio oculto y luego KL sobre logits mas entropia cruzada de tarea).

El repositorio no contiene los pesos completos de BERT, sino unicamente los parametros de atencion y la cabeza de clasificacion en FP16 (`attention_weights.safetensors`, aproximadamente 55 MB). El codigo remoto (`modeling_neuralops_bert.py`) reconstruye el modelo base congelado desde `bert-base-uncased` y aplica encima los pesos destilados. La relevancia de esta publicacion es mas metodologica que practica: sirve como ejemplo de serializacion modular de atencion y de destilacion sin asignacion de VRAM para el profesor, no como un clasificador listo para produccion.

Los resultados publicados son muy limitados: la precision en la particion de validacion de SST-2 es del 49,08 %, identica antes y despues de la destilacion (delta de +0,00 %), frente al 91,63 % del profesor `bert-base-uncased`. La entropia cruzada de validacion posterior a la destilacion figura como `nan`. En la practica, el modelo no supera el azar en una tarea binaria, por lo que debe interpretarse como una prueba de concepto de la infraestructura NeuralOps.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT-base con atencion subcuadratica `goldfinch_ahn` en las 12 capas (sustituye la MHA softmax cuadratica) |
| Parametros totales | 110 M (base BERT-base); el repo solo almacena los pesos de atencion y la cabeza de clasificacion (~55 MB en FP16) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base BERT-base admite 512 tokens, pero la model card no lo especifica) |
| Tipos de cuantizacion | No disponible (pesos publicados en FP16; no se documentan otras cuantizaciones) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (FP16, `attention_weights.safetensors`); requiere `trust_remote_code=True` y la libreria `neuralops` |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased` (12 capas, 110 M de parametros) y reemplaza el mecanismo de atencion multi-cabeza estandar por `goldfinch_ahn`, un operador de la familia de atencion subcuadratica del "Attention Zoo" de NeuralOps. La model card declara complejidad efectiva O(N) u O(N log N) frente a O(N^2) de la MHA clasica, aunque no se detalla la formulacion matematica del mecanismo ni su implementacion concreta. Los pesos base de BERT permanecen congelados; solo se entrenan los parametros de atencion y la cabeza de clasificacion.

El entrenamiento sigue el "NeuralOps Cached Representation Distillation Protocol": una primera etapa de alineacion en el subespacio oculto y una segunda etapa con KL sobre logits mas entropia cruzada de la tarea. Se ejecuto en una unica NVIDIA GeForce RTX 3090 de 24 GB, con 268 pasos de optimizacion, 48,2 segundos de duracion, un throughput efectivo de 45.517,8 tokens/s y un pico de VRAM de 23.021 MB. La model card indica que la VRAM del profesor es cero gracias a la cache offline de representaciones. No se especifica el volumen de datos de entrenamiento ni la composicion exacta del dataset mas alla de GLUE/SST-2.

## Capacidades

- Clasificacion de texto binaria (analisis de sentimiento) sobre la tarea SST-2 de GLUE, con etiquetas 0 (negativo) y 1 (positivo).
- Inferencia con la API estandar de Hugging Face `AutoModelForSequenceClassification` usando `trust_remote_code=True`.
- Carga modular a traves de la API de NeuralOps (`load_pretrained_bert` y `load_surgeried_model`), que reconstruye el modelo base y aplica los pesos de atencion destilados.
- Soporte de serializacion "attention-only": distribucion de pesos reducida (~55 MB) que reutiliza el backbone congelado.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, agentes ni modo thinking.
- Capacidad multilingue: solo ingles.

## Casos de uso

- Investigacion sobre atencion subcuadratica: el checkpoint permite reproducir el pipeline de sustitucion de atencion de NeuralOps sobre BERT-base y medir el impacto en una tarea concreta de GLUE.
- Benchmarking de protocolos de destilacion: sirve para validar el "Cached Representation Distillation Protocol" con asignacion cero de VRAM al profesor, comparando la curva de perdida y la precision frente al profesor original.
- Pruebas de serializacion modular de pesos: util para experimentar con el formato `attention_only_fp16` y verificar la reconstruccion automatica del backbone congelado mediante `modeling_neuralops_bert.py`.
- Docencia y demostraciones: ejemplo minimo de como sustituir la atencion de un transformer preentrenado y evaluar el resultado en una tarea de clasificacion binaria.
- Integracion en pipelines de investigacion con `neuralops`: validacion de la API `load_surgeried_model` y de la carga desde el Hub con codigo remoto.
- No es adecuado para clasificacion de sentimiento en produccion: con un 49,08 % de precision en SST-2, el modelo no supera la linea base aleatoria en una tarea binaria.

## Benchmarks y rendimiento

Evaluacion publicada en la particion de validacion de GLUE SST-2 (872 muestras de clasificacion binaria):

| Metrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD (`goldfinch_ahn`) | Modelo destilado | Delta |
|---|---|---|---|---|
| Precision SST-2 | 91,63 % | 49,08 % | 49,08 % | +0,00 % |
| Entropia cruzada de validacion | 0,2428 | No calibrada | `nan` | No aplica |

Telemetria de entrenamiento (RTX 3090 24 GB): 48,2 s de duracion, 268 pasos, 45.517,8 tokens/s, pico de 23.021 MB de VRAM. No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el backbone BERT-base congelado ocupa aproximadamente 440 MB en FP32 o unos 220 MB en FP16; los pesos de atencion anaden unos 55 MB. En la practica, la inferencia cabe holgadamente en cualquier GPU con 2 GB o mas.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) es suficiente; no requiere A100 ni H100.
- Cabe en GPU consumer: si, sin problema, incluso en GPUs de gama baja o en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` y la libreria `neuralops`; la model card no documenta soporte para vLLM, llama.cpp, Ollama ni TGI (el formato `safetensors` modular con codigo remoto complica estos despliegues).
- Latencia y throughput: no se publican cifras de inferencia; solo se documenta el throughput de entrenamiento (45.517,8 tokens/s en una RTX 3090).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision SST-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `bert-goldfinch-ahn-sst2` | 110 M (solo atencion + cabeza, ~55 MB) | No disponible | 49,08 % | MIT | Hugging Face (codigo remoto) |
| `bert-base-uncased` (profesor) | 110 M | 512 tokens | 91,63 % (referencia de la model card) | Apache 2.0 | Hugging Face, `transformers` |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66 M | 512 tokens | No disponible en la informacion proporcionada | Apache 2.0 | Hugging Face, `transformers` |
| Otros checkpoints del Attention Zoo de NeuralOps | No disponible | No disponible | No disponible | MIT (segun el repo) | Hugging Face (organizacion Hooshaai / tahamajs) |

La comparativa directa con `distilbert` u otros clasificadores SST-2 no puede completarse con datos de la informacion proporcionada; la unica referencia numerica es el profesor BERT-base con 91,63 % de precision.

## Limitaciones y advertencias

- Precision del 49,08 % en SST-2: en una tarea binaria esto equivale practicamente al azar; el modelo no es util para clasificacion de sentimiento real.
- La destilacion no mejora al estudiante (delta de +0,00 %) y la entropia cruzada de validacion posterior es `nan`, lo que sugiere un problema de calibracion o de convergencia en el protocolo.
- Requiere `trust_remote_code=True` y la libreria `neuralops`, lo que implica ejecutar codigo de terceros y anade dependencias no estandar.
- El repositorio no contiene los pesos completos: depende de la disponibilidad futura de `bert-base-uncased` en el Hub para reconstruirse.
- Solo soporta ingles; no hay evidencia de capacidades multilingues.
- No se documentan sesgos especificos, pero al heredar el backbone de `bert-base-uncased` arrastra los sesgos del corpus original (BookCorpus y Wikipedia en ingles).
- Riesgo de alucinacion: no aplica directamente (es un clasificador), pero la cabeza de clasificacion puede producir predicciones poco fiables dado el bajo rendimiento.
- Licencia MIT: permite uso comercial, pero el estado experimental y el rendimiento hacen desaconsejable cualquier uso en produccion.
- No se especifican datos de entrenamiento detallados (volumen, composicion), lo que dificulta evaluar la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-goldfinch-ahn-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/bert-base-uncased
- Benchmark GLUE: https://gluebenchmark.com/
- Dataset SST-2: https://huggingface.co/datasets/glue
