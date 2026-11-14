# Hooshaai/bert-dynamic-conv-attention-sst2

## Resumen

El modelo `Hooshaai/bert-dynamic-conv-attention-sst2` es un checkpoint derivado de `google-bert/bert-base-uncased` en el que se han sustituido los bloques de atencion softmax cuadratica de las 12 capas del transformer por un mecanismo denominado `dynamic_conv_attention`, perteneciente a la libreria NeuralOps (desarrollada por Taha Majlesi). El objetivo declarado es explorar alternativas subcuadraticas (O(N) u O(N log N)) a la atencion multi-cabeza estandar, reduciendo el coste computacional en secuencias largas. El modelo se ha ajustado y evaluado exclusivamente sobre la tarea SST-2 del benchmark GLUE (clasificacion binaria de sentimiento en ingles).

La relevancia del checkpoint es fundamentalmente experimental: forma parte de un "Attention Zoo" de variantes de atencion preentrenadas y destiladas sobre BERT-Base, y demuestra un protocolo de destilacion con representaciones cacheadas en disco (sin asignar VRAM al modelo profesor). El repositorio almacena unicamente los pesos de atencion y la cabeza de clasificacion en FP16 (~55 MB), mientras que los pesos base congelados se reconstruyen dinamicamente desde `bert-base-uncased` mediante codigo remoto.

Los resultados publicados son, sin embargo, muy limitados: la precision en SST-2 es del 50,92%, identica al modelo estudiante previo a la destilacion y practicamente equivalente a la clasificacion aleatoria en una tarea binaria. El propio autor etiqueta el estado como "Subquadratic Probe", lo que indica que se trata de una prueba de concepto y no de un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT-Base con atencion `dynamic_conv_attention` (subcuadratica) en las 12 capas |
| Parametros totales | 110M (heredados de BERT-Base; el repo solo publica ~55 MB de pesos de atencion en FP16) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP16 (pesos serializados como `attention_only_fp16`); otras no disponibles |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, atencion y cabeza de tarea en FP16); requiere codigo remoto (`trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased` (12 capas, 110M parametros, encoder bidireccional) y reemplaza la atencion multi-cabeza softmax por `dynamic_conv_attention`, un mecanismo convolucional dinamico con complejidad efectiva declarada de O(N) u O(N log N) frente a O(N^2). Los pesos base permanecen congelados y solo se entrenan los parametros de atencion y la cabeza de clasificacion, lo que da lugar a un checkpoint de ~55 MB que se recombina en tiempo de carga con el modelo base descargado desde el Hub.

El entrenamiento sigue el protocolo "Cached Representation Distillation" de NeuralOps: primero una alineacion de subespacio oculto (Stage 1) y despues una combinacion de KL sobre logits y entropia cruzada de tarea (Stage 2). Se ejecuto en una NVIDIA GeForce RTX 3090 (24 GB) durante 48,4 segundos, con 186 pasos de optimizacion y un throughput de 31.500,2 tokens/segundo, alcanzando un pico de 13.512 MB de VRAM. El profesor no consume VRAM porque sus representaciones se cachean offline. El conjunto de datos utilizado es la tarea SST-2 de GLUE (clasificacion binaria de sentimiento).

## Capacidades

- Clasificacion binaria de sentimiento (positivo/negativo) en ingles, heredada de la tarea SST-2.
- Inferencia sobre texto corto con tokenizador WordPiece de BERT-Base.
- Carga modular mediante la API `neuralops.hub.bert_zoo.load_pretrained_bert` o `load_surgeried_model`.
- Integracion con `AutoModelForSequenceClassification` de Hugging Face Transformers usando `trust_remote_code=True`.
- No soporta generacion de texto, tool calling, agentes, vision, audio ni razonamiento multi-paso.
- Capacidad multilingue: limitada al ingles.
- No dispone de modo "thinking", decodificacion especulativa ni atencion lineal mas alla del propio mecanismo convolucional dinamico.

## Casos de uso

- Investigacion sobre atencion subcuadratica: sirve como punto de partida reproducible para comparar `dynamic_conv_attention` con MHA estandar en tareas de clasificacion corta, dado que el codigo y los pesos estan publicados.
- Docencia y experimentacion con destilacion: el protocolo de representaciones cacheadas permite reproducir el pipeline en una unica GPU de 24 GB sin necesidad de servir al profesor en memoria.
- Pruebas de integracion de la libreria NeuralOps: util para validar la API `load_surgeried_model` y el shim de codigo remoto en entornos de CI.
- Benchmark de serializacion modular de pesos: ejemplo de repositorio que publica solo los adaptadores de atencion (~55 MB) en lugar del modelo completo, util para estudiar estrategias de distribucion eficiente de checkpoints.
- Analisis de calibracion: la entropia cruzada de validacion (0,7108) frente a la del profesor (0,2428) permite estudiar el desajuste de calibracion tras destilacion parcial.
- Base para futuros ajustes: al mantener los pesos base de BERT congelados, puede reentrenarse la cabeza o la atencion sobre otros datasets de GLUE sin partir de cero.
- No se recomienda su uso en produccion para analisis de sentimiento real, dado que su precision es practicamente aleatoria.

## Benchmarks y rendimiento

Evaluacion sobre la particion de validacion de GLUE SST-2 (872 muestras binarias):

| Metrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD | Modelo destilado | Delta |
|---|---|---|---|---|
| Precision SST-2 | 91,63% | 50,92% | 50,92% | +0,00% |
| Entropia cruzada de validacion | 0,2428 | no calibrada | 0,7108 | no aplica |

Telemetria de entrenamiento (RTX 3090 24 GB): 48,4 s, 186 pasos, 31.500,2 tokens/s, pico de VRAM 13.512 MB. No se han publicado resultados en otros benchmarks (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint de atencion ocupa ~55 MB en FP16, pero requiere cargar `bert-base-uncased` completo (~440 MB en FP32, ~220 MB en FP16); en la practica cabe en cualquier GPU con 2 GB o mas.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) o profesional (A100, H100) es sobredimensionada para este modelo; el autor uso una RTX 3090 durante el entrenamiento.
- Cabe en GPU consumer: si, en practicamente todas las GPU con al menos 2 GB de VRAM, e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: Hugging Face Transformers con `trust_remote_code=True`, API de NeuralOps (`load_surgeried_model`). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: el autor reporta 31.500,2 tokens/s durante el entrenamiento en una RTX 3090; no se han publicado cifras de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/bert-dynamic-conv-attention-sst2` | 110M (atencion ~55 MB publicada) | no disponible | 50,92% | MIT | Hugging Face, requiere codigo remoto |
| `google-bert/bert-base-uncased` (profesor) | 110M | 512 tokens | 91,63% (referencia del autor) | Apache 2.0 | Hugging Face, estandar |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66M | 512 tokens | no disponible en esta ficha | Apache 2.0 | Hugging Face, estandar |

La comparativa directa con alternativas subcuadraticas (Linear Attention, Performer, Longformer) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Precision en SST-2 del 50,92%, equivalente a la clasificacion aleatoria en una tarea binaria; no es apto para uso en produccion.
- La destilacion no mejoro al estudiante (delta +0,00%), lo que sugiere que el mecanismo de atencion no ha aprendido representaciones utiles en este checkpoint.
- Entropia cruzada de validacion elevada (0,7108) frente al profesor (0,2428): las probabilidades de salida no estan calibradas.
- Solo soporta ingles; no se han evaluado capacidades multilingues.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor; conviene auditar `modeling_neuralops_bert.py` antes de desplegarlo.
- Depende de la libreria `neuralops` y del repositorio base `bert-base-uncased` para reconstruir el modelo completo; si el codigo remoto o el modelo base cambian, el checkpoint puede dejar de cargar.
- Licencia MIT permite uso comercial, pero el estado experimental y la baja precision desaconsejan cualquier aplicacion real.
- No hay informacion sobre sesgos especificos mas alla de los heredados de BERT-Base (entrenado con BookCorpus y Wikipedia en ingles).
- Riesgo de alucinacion no aplica en sentido estricto (es un clasificador), pero las predicciones pueden ser esencialmente aleatorias.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/bert-dynamic-conv-attention-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia MIT de NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base BERT-Base uncased: https://huggingface.co/bert-base-uncased
- Benchmark GLUE: https://gluebenchmark.com/
- Dataset SST-2: https://huggingface.co/datasets/glue
