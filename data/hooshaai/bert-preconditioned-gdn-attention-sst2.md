# Hooshaai/bert-preconditioned-gdn-attention-sst2

## Resumen

`Hooshaai/bert-preconditioned-gdn-attention-sst2` es un checkpoint derivado de `google-bert/bert-base-uncased` en el que el autor (Taha Majlesi, publicado bajo la organizacion Hooshaai) ha sustituido los bloques de atencion softmax cuadratica de las 12 capas del transformer por el mecanismo `preconditioned_gdn_attention`, parte de la libreria NeuralOps. El objetivo declarado es explorar alternativas de atencion subcuadratica (complejidad efectiva O(N) u O(N log N) frente a O(N^2)) manteniendo el resto de la arquitectura BERT intacta.

El modelo se presenta como un "subquadratic probe" destilado sobre la tarea SST-2 del benchmark GLUE (clasificacion binaria de sentimiento en ingles). Es relevante no por su rendimiento final, sino como artefacto de investigacion: demuestra un flujo de serializacion modular que almacena unicamente los pesos de atencion y la cabeza de clasificacion en FP16 (~55 MB), reconstruyendo el resto del modelo base en tiempo de carga.

Con 110M parametros de base, contexto estandar de BERT (512 tokens) y licencia MIT, el checkpoint esta pensado para reproducir experimentos de destilacion y evaluar mecanismos de atencion alternativos, no para uso en produccion: su accuracy en SST-2 es del 49,08%, practicamente equivalente a la clasificacion aleatoria en una tarea binaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT-base con atencion `preconditioned_gdn_attention` subcuadratica en las 12 capas |
| Parametros totales | 110M (modelo base BERT-base); el repo solo almacena pesos de atencion y cabeza de clasificacion (~55 MB en FP16) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible de forma explicita; se hereda la de `bert-base-uncased` (512 tokens) |
| Tipos de cuantizacion | FP16 en los pesos publicados (`attention_weights.safetensors`); no se documentan otras variantes |
| Idiomas soportados | ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (FP16, atencion y cabeza de clasificacion); requiere `trust_remote_code=True` |

## Arquitectura y entrenamiento

La arquitectura parte de `bert-base-uncased` (12 capas, 768 dimensiones ocultas, 12 cabezas, 110M parametros) y reemplaza la atencion multi-cabeza estandar por `preconditioned_gdn_attention`, un mecanismo de la familia de atencion subcuadratica que el autor situa en complejidad efectiva O(N) u O(N log N). El resto del modelo (embeddings, feed-forward, normalizaciones) se mantiene congelado y se inicializa desde el checkpoint original de BERT en tiempo de carga mediante un shim de codigo remoto (`modeling_neuralops_bert.py`).

El entrenamiento sigue el "NeuralOps Cached Representation Distillation Protocol": destilacion en dos etapas (alineamiento de subespacio oculto y luego KL sobre logits mas entropia cruzada de la tarea) con representaciones del profesor cacheadas offline, de modo que el profesor no consume VRAM durante el entrenamiento. Segun la model card, se ejecuto en una NVIDIA RTX 3090 (24 GB) durante 61,2 segundos, con 13 pasos de optimizacion, throughput de 1740,5 tokens/s y un pico de 7419 MB de VRAM. No se documentan el numero de tokens de entrenamiento, la composicion del dataset mas alla de GLUE/SST-2, ni si hubo RLHF o DPO (no aplica a una tarea de clasificacion).

## Capacidades

- Clasificacion binaria de sentimiento (positivo/negativo) sobre texto en ingles, segun la cabeza de clasificacion SST-2.
- Generacion de texto: no soportada (es un modelo de clasificacion, no causal).
- Razonamiento, codigo y matematicas: no soportados como capacidades declaradas.
- Tool calling / function calling: no soportado.
- Agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingues: limitadas al ingles.
- Capacidades especiales: sustituto experimental de atencion subcuadratica para estudiar eficiencia computacional; serializacion modular de pesos de atencion.

## Casos de uso

- Investigacion sobre atencion subcuadratica: sirve como punto de partida reproducible para medir el impacto de `preconditioned_gdn_attention` frente a softmax cuadratica en tareas de comprension, comparando curvas de convergencia y coste computacional.
- Reproduccion de experimentos de destilacion: el protocolo de representaciones cacheadas permite replicar el flujo en una unica GPU consumer (RTX 3090) sin necesidad de mantener el profesor en memoria.
- Benchmarking de mecanismos de atencion en GLUE: util como baseline negativo ("subquadratic probe") para contrastar con variantes mejor entrenadas o con mas pasos de destilacion.
- Estudio de serializacion modular: ejemplo practico de publicacion de pesos parciales (~55 MB) que se reconstruyen sobre un modelo base congelado, util para disenar pipelines de distribucion eficiente de adaptadores.
- Docencia y formacion: caso didactico de sustitucion de bloques de atencion en un transformer preentrenado y de evaluacion con `AutoModelForSequenceClassification`.
- Pruebas de integracion con la libreria NeuralOps: validacion del API `load_surgeried_model` y del shim de codigo remoto en entornos controlados.

## Benchmarks y rendimiento

Evaluacion publicada en la model card sobre el split de validacion de GLUE SST-2 (872 muestras de clasificacion binaria):

| Metrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD | Modelo destilado post-KD | Delta |
|---|---|---|---|---|
| Accuracy SST-2 | 91,63% | 49,08% | 49,08% | +0,00% |
| Entropia cruzada de validacion | 0,2428 | no calibrada | 0,8858 | no disponible |

Telemetria de entrenamiento (segun model card): RTX 3090 24 GB, 61,2 s, 13 pasos, 1740,5 tokens/s, pico de 7419 MB de VRAM.

No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base BERT-base en FP32 ocupa aproximadamente 450 MB de pesos; en FP16 alrededor de 225 MB. Con overhead de activaciones y tokenizador, cabe holgadamente en GPUs de 4-8 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; el autor entreno en una RTX 3090. Para lotes grandes, A100 o H100 aportan margen pero no son necesarias.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 4 GB de VRAM; tambien puede ejecutarse en CPU para inferencia puntual.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requerido por el shim `modeling_neuralops_bert.py`); API `neuralops.hub.bert_zoo.load_pretrained_bert` y `neuralops.hub.load_surgeried_model`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (son orientados a modelos generativos y no aplican a este checkpoint de clasificacion).
- Latencia y throughput estimados: no disponibles para inferencia; el unico dato publicado es el throughput de entrenamiento (1740,5 tokens/s en RTX 3090).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy SST-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/bert-preconditioned-gdn-attention-sst2` | 110M (base) | no disponible (heredado de BERT-base, 512) | 49,08% | MIT | Hugging Face, requiere `trust_remote_code` |
| `google-bert/bert-base-uncased` (profesor) | 110M | 512 | 91,63% (segun model card) | Apache 2.0 | Hugging Face, `transformers` estandar |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66M | 512 | no disponible en la informacion proporcionada | Apache 2.0 | Hugging Face, `transformers` estandar |
| `roberta-base` fine-tuneado en SST-2 | 125M | 512 | no disponible en la informacion proporcionada | MIT | Hugging Face, `transformers` estandar |

## Limitaciones y advertencias

- Rendimiento muy por debajo del estado del arte: 49,08% de accuracy en una tarea binaria equivale a clasificacion aleatoria; no es apto para uso en produccion.
- El propio autor etiqueta el checkpoint como "subquadratic probe" y reconoce que la destilacion post-KD no mejora al estudiante pre-KD (delta +0,00%).
- Solo soporta ingles; no se documentan capacidades multilingues.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo remoto del repositorio; conviene auditar `modeling_neuralops_bert.py` antes de usarlo en entornos sensibles.
- Dependencia de la libreria NeuralOps y de `bert-base-uncased` para reconstruir el modelo completo; no es un checkpoint autocontenido.
- Riesgo de alucinacion y sesgos: no evaluados en la informacion disponible; al estar entrenado sobre SST-2, hereda los sesgos del corpus de resenas de cine.
- Licencia MIT permite uso comercial, pero el rendimiento hace inviable su uso comercial real; ademas, el modelo base `bert-base-uncased` tiene licencia Apache 2.0, que debe respetarse en la redistribucion.
- No hay soporte documentado para cuantizacion GGUF/INT8 ni para motores de inferencia de alto rendimiento.
- Fecha de creacion del repositorio (2026-11-09) y actualizacion (2026-11-11) segun metadatos de Hugging Face.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-preconditioned-gdn-attention-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia MIT de NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/bert-base-uncased
- Benchmark GLUE: https://gluebenchmark.com/
- Dataset SST-2: https://huggingface.co/datasets/glue
