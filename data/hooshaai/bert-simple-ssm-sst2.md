# Hooshaai/bert-simple-ssm-sst2

## Resumen

`bert-simple-ssm-sst2` es un checkpoint experimental publicado por Hooshaai (el model card cita como autor a Taha Majlesi y el repositorio NeuralOps) que parte de `google-bert/bert-base-uncased` y sustituye los bloques de atencion softmax cuadratica de sus 12 capas por el mecanismo `simple_ssm` de la libreria NeuralOps. El resultado es un modelo de clasificacion de sentimiento binario (SST-2) con complejidad subcuadratica, distribuido como pesos de atencion y cabeza de clasificacion en FP16 de unos 55 MB, sin reempaquetar los 450 MB del BERT base congelado.

El modelo se ha destilado del profesor `bert-base-uncased` mediante el protocolo Cached Representation Distillation de NeuralOps (alineamiento offline de representaciones, sin VRAM del profesor durante el entrenamiento), ejecutado en una RTX 3090 de 24 GB en 393 pasos y 48,9 segundos. El resultado es un student que alcanza un 61,58 % de accuracy en la validacion de SST-2, frente al 91,63 % del profesor y al 50,00 % del student sin destilar.

Es relevante ahora como pieza de investigacion sobre atencion subcuadratica y destilacion modular: demuestra que es posible intercambiar el mecanismo de atencion de un transformer preentrenado y recuperar parte del rendimiento con un coste de entrenamiento minimo, aunque el resultado esta lejos de ser competitivo con BERT completo en tareas de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT-base con atencion `simple_ssm` subcuadratica (O(N) u O(N log N)) en las 12 capas |
| Parametros totales | 110 M (BERT-base); el repo distribuye solo pesos de atencion y cabeza de clasificacion en FP16 (~55 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada de BERT-base, 512 tokens, no confirmada en la informacion) |
| Tipos de cuantizacion | FP16 (pesos de atencion); no se documentan otras cuantizaciones |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`), con `custom_code` / `trust_remote_code=True` |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased` (transformer encoder de 12 capas, 110 M parametros) y reemplaza la atencion multi-cabeza softmax cuadratica por el mecanismo `simple_ssm` de NeuralOps, que reduce la complejidad operativa efectiva a O(N) u O(N log N). Los pesos base de BERT permanecen congelados y solo se entrenan y serializan los parametros de atencion y la cabeza de clasificacion, lo que explica el tamano de 55 MB del repositorio.

El entrenamiento usa el NeuralOps Cached Representation Distillation Protocol en dos etapas: primero alineamiento de subespacio oculto con el profesor y despues KL sobre logits mas entropia cruzada de la tarea. Se ejecuto en una RTX 3090 de 24 GB, con 393 pasos de optimizacion, 48,9 segundos de duracion y un throughput efectivo de 65.805,6 tokens/s, con un pico de VRAM de 5.432 MB. No se documenta el numero total de tokens de entrenamiento ni la composicion exacta del dataset mas alla de GLUE/SST-2.

## Capacidades

- Clasificacion de sentimiento binario (positivo/negativo) en ingles sobre el formato de SST-2.
- Clasificacion de secuencias cortas de texto con una sola etiqueta de salida.
- Inferencia con atencion subcuadratica, lo que en principio reduce el coste computacional en secuencias largas respecto a MHA cuadratica.
- Carga modular: solo se descargan los pesos de atencion y se reconstruye el resto desde `bert-base-uncased`.
- Compatibilidad con `AutoModelForSequenceClassification` de Hugging Face Transformers mediante `trust_remote_code=True`.
- API de alto nivel de NeuralOps (`load_pretrained_bert`, `load_surgeried_model`).
- No se documentan capacidades de generacion de texto, tool calling, agentes, vision, audio ni modo de razonamiento.

## Casos de uso

- Investigacion sobre atencion subcuadratica: usar el checkpoint como linea base para comparar `simple_ssm` con MHA cuadratica en tareas de GLUE, dado que el model card reporta la accuracy exacta del student y del profesor.
- Reproduccion de destilacion modular: el protocolo Cached Representation Distillation permite repetir el experimento en una unica GPU consumer de 24 GB en menos de un minuto, util para validar variantes de atencion antes de escalar.
- Prototipado de clasificadores de sentimiento de bajo coste: el repo pesa 55 MB, por lo que se puede desplegar en entornos con almacenamiento y ancho de banda limitados, siempre que se acepte la precision reducida del 61,58 %.
- Pruebas de integracion de la libreria NeuralOps en pipelines existentes: el codigo de ejemplo muestra como cargar el modelo con `load_surgeried_model` y ejecutar inferencia en una linea, util para evaluar la ergonomia del framework.
- Benchmarking de eficiencia en secuencias largas: comparar latencia y memoria de `simple_ssm` frente a BERT-base en entradas cercanas al limite de contexto, aunque el modelo solo este entrenado para SST-2.
- Educacion y divulgacion: el model card incluye telemetria detallada de hardware, pasos y throughput, lo que lo convierte en un ejemplo didactico de destilacion con profesor offline.
- No es adecuado como sustituto directo de BERT-base en produccion de analisis de sentimiento por la caida de 30 puntos de accuracy.

## Benchmarks y rendimiento

Evaluacion sobre el split de validacion de GLUE SST-2 (872 muestras de clasificacion binaria), segun el model card:

| Metrica | Profesor (`bert-base-uncased`) | Student sin destilar (`simple_ssm`) | Student destilado | Delta |
|---|---|---|---|---|
| Accuracy SST-2 | 91,63 % | 50,00 % | 61,58 % | +11,58 % |
| Cross-entropy de validacion | 0,2428 | no calibrada | 0,7462 | no disponible |

Telemetria de entrenamiento (cluster Sharif HPC, RTX 3090 24 GB):

| Metrica | Valor |
|---|---|
| Duracion | 48,9 s |
| Pasos de optimizacion | 393 |
| Throughput efectivo | 65.805,6 tokens/s |
| Pico de VRAM | 5.432 MB |

No se han publicado resultados en otros benchmarks (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el model card reporta un pico de 5.432 MB durante el entrenamiento en FP16 con batch pequeno; la inferencia en FP16 sobre BERT-base completo requiere del orden de 1-2 GB, aunque no se documenta una cifra especifica de inferencia.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM es suficiente para cargar BERT-base en FP16; el entrenamiento reportado se hizo en una RTX 3090 de 24 GB.
- Cabe en GPU consumer: si, en RTX 3060, 3070, 3080, 3090, 4060, 4070, 4080, 4090 y equivalentes con 8 GB o mas.
- Opciones de despliegue: Hugging Face Transformers con `trust_remote_code=True`, API de NeuralOps (`load_pretrained_bert`, `load_surgeried_model`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: solo se publica el throughput de entrenamiento (65.805,6 tokens/s); no hay cifras de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy SST-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `bert-simple-ssm-sst2` (este) | 110 M (atencion + cabeza, 55 MB) | no disponible | 61,58 % | MIT | Hugging Face |
| `google-bert/bert-base-uncased` fine-tuneado en SST-2 | 110 M | 512 tokens | 91,63 % (profesor reportado) | Apache 2.0 | Hugging Face |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66 M | 512 tokens | no disponible en la informacion | Apache 2.0 | Hugging Face |
| `roberta-base` fine-tuneado en SST-2 | 125 M | 512 tokens | no disponible en la informacion | MIT | Hugging Face |

La comparativa se limita a parametros, contexto, licencia y disponibilidad; no se dispone de resultados de benchmarks de los modelos alternativos en la informacion proporcionada, por lo que no se comparan cifras de rendimiento mas alla del profesor reportado.

## Limitaciones y advertencias

- Precision muy inferior al profesor: 61,58 % frente a 91,63 % en SST-2, con una cross-entropy de 0,7462 frente a 0,2428. No es apto para produccion de clasificacion de sentimiento sin validacion adicional.
- El student sin destilar rinde al nivel de azar (50,00 %), lo que sugiere que el mecanismo `simple_ssm` no aprende la tarea por si solo en este configuracion.
- Solo entrenado y evaluado en ingles y en SST-2; no hay evidencia de generalizacion a otras tareas de GLUE ni a otros dominios.
- El model card no documenta el numero de tokens de entrenamiento ni la composicion del dataset, lo que dificulta evaluar sesgos de datos.
- Riesgo de alucinacion no aplica directamente (es un clasificador), pero la calibracion de probabilidades es deficiente segun la cross-entropy reportada.
- Dependencia de `custom_code` y `trust_remote_code=True`: el modelo requiere ejecutar codigo remoto (`modeling_neuralops_bert.py`) y la libreria NeuralOps, lo que anade superficie de ataque y riesgo de suministro en pipelines de produccion.
- Los pesos distribuidos son solo de atencion y cabeza; el base BERT congelado se descarga aparte desde `bert-base-uncased`, por lo que el repo de 55 MB no es autocontenido.
- Licencia MIT declarada, pero el codigo remoto y la libreria NeuralOps tienen su propia licencia en GitHub que conviene revisar antes de uso comercial.
- El model card mezcla identificadores (`Hooshaai/bert-simple-ssm-sst2` en Hugging Face frente a `tahamajs/bert-simple-ssm-sst2` en los ejemplos de codigo), lo que puede causar errores de carga si se copia el snippet tal cual.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/bert-simple-ssm-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/bert-base-uncased
- Dataset GLUE: https://huggingface.co/datasets/glue
- Dataset SST-2: https://huggingface.co/datasets/glue/viewer/sst2
- Citacion (BibTeX en el model card): Majlesi, Taha (2026), NeuralOps: Pretrained BERT Subquadratic Attention Zoo on GLUE Benchmark
