# Hooshaai/bert-lsh-attention-sst2

## Resumen

`bert-lsh-attention-sst2` es un checkpoint de `bert-base-uncased` (110M parametros) en el que el autor, Hooshaai (Taha Majlesi), ha sustituido los bloques de atencion softmax cuadratica de las 12 capas del transformer por un mecanismo de atencion LSH (Locality-Sensitive Hashing) procedente de su libreria NeuralOps. El objetivo es demostrar que es posible reducir la complejidad operativa de la atencion de O(N²) a O(N) o O(N log N) manteniendo un rendimiento razonable en tareas de clasificacion de secuencias, en este caso la tarea SST-2 del benchmark GLUE.

El modelo se ha destilado desde el BERT-base original (profesor) mediante el protocolo "Cached Representation Distillation" de NeuralOps, que evita reservar VRAM para el profesor cacheando offline las representaciones. El entrenamiento se ejecuto en una unica RTX 3090 de 24 GB durante 53,2 segundos y 91 pasos de optimizacion, alcanzando un 79,13 % de accuracy en el split de validacion de SST-2, frente al 91,63 % del profesor. Es, por tanto, un artefacto de investigacion orientado a validar la viabilidad del zoo de atenciones subcuadraticas, no un modelo de produccion.

La relevancia actual reside en el interes creciente por arquitecturas de atencion eficientes que permitan contextos largos con coste lineal. Este checkpoint ofrece un punto de comparacion reproducible (pesos de atencion en FP16 de solo ~55 MB) para quien quiera evaluar el impacto de LSH attention sobre un backbone BERT estandar sin reentrenar desde cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT-base con atencion LSH (subcuadratica, O(N) u O(N log N)) en las 12 capas |
| Parametros totales | 110M (heredados de bert-base-uncased; solo se serializan los pesos de atencion y la cabeza de clasificacion) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base BERT-base soporta 512 tokens; el checkpoint no especifica un cambio) |
| Tipos de cuantizacion | FP16 en los pesos de atencion serializados; no se documentan otras cuantizaciones |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | `attention_weights.safetensors` (FP16, ~55 MB) + shim de codigo remoto `modeling_neuralops_bert.py` que inicializa los pesos base congelados desde `bert-base-uncased` |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura BERT-base (12 capas, 768 dimensiones ocultas, 12 cabezas de atencion, 110M parametros) y reemplaza en cada capa el mecanismo de Multi-Head Attention estandar por `lsh_attention`, una variante basada en hashing sensible a la localidad que agrupa consultas y claves en cubos para aproximar la atencion con coste subcuadratico. Los pesos base de BERT permanecen congelados; solo se entrenan y serializan los parametros de atencion y la cabeza de clasificacion, lo que explica el tamano reducido del repositorio (~55 MB de pesos frente a los ~450 MB del BERT completo).

El entrenamiento sigue el protocolo "Cached Representation Distillation" de NeuralOps en dos etapas: primero una alineacion de subespacio oculto y despues una combinacion de KL sobre logits y entropia cruzada de la tarea. Se ejecuto en una NVIDIA GeForce RTX 3090 (24 GB) durante 53,2 segundos, con 91 pasos de optimizacion, un throughput efectivo de 14.001,2 tokens/segundo y un pico de VRAM de 23.021 MB. El dataset de evaluacion y ajuste es la tarea SST-2 de GLUE (clasificacion binaria de sentimiento, 872 muestras en validacion).

## Capacidades

- Clasificacion de texto binaria (sentimiento positivo/negativo) sobre la tarea SST-2 de GLUE.
- Generacion de representaciones contextuales de secuencias en ingles mediante el backbone BERT-base subyacente.
- Inferencia con `AutoModelForSequenceClassification` de Transformers usando `trust_remote_code=True`.
- Carga modular a traves de la API `neuralops.hub.bert_zoo.load_pretrained_bert` y `neuralops.hub.load_surgeried_model`.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo "thinking", vision ni audio.
- Capacidad multilingue limitada al ingles (heredada de `bert-base-uncased`).

## Casos de uso

- Investigacion sobre atencion eficiente: sirve como punto de referencia reproducible para medir el coste y la degradacion de precision al sustituir softmax por LSH attention en un backbone BERT estandar, con pesos de solo ~55 MB faciles de versionar.
- Analisis de sentimiento en ingles a pequena escala: clasificacion de resenas o comentarios en dos clases con un modelo ligero que se carga junto al BERT-base congelado, adecuado para prototipos y validaciones de pipeline.
- Benchmarking de destilacion: permite comparar el protocolo Cached Representation Distillation de NeuralOps con otras estrategias de knowledge distillation sobre GLUE SST-2 usando el mismo profesor (91,63 % de accuracy).
- Docencia y experimentacion: ejemplo didactico de como se serializan pesos parciales (attention-only) y se reconstruye el modelo completo mediante un shim de codigo remoto, util en cursos de arquitecturas eficientes.
- Pruebas de integracion con la libreria NeuralOps: validacion de las APIs `load_pretrained_bert` y `load_surgeried_model` en entornos de CI antes de desplegar variantes mas grandes del zoo de atenciones.
- Filtrado de contenido en ingles en etapas tempranas de pipelines: clasificacion rapida de polaridad como paso de preprocesado, siempre que se acepte la perdida de precision frente al profesor (79,13 % vs 91,63 %).

## Benchmarks y rendimiento

Evaluacion sobre el split de validacion de GLUE SST-2 (872 muestras binarias):

| Metrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD (`lsh_attention`) | Modelo destilado | Delta |
|---|---|---|---|---|
| Accuracy GLUE SST-2 | 91,63 % | 51,61 % | 79,13 % | +27,52 % |
| Entropia cruzada de validacion | 0,2428 | no calibrada | 0,4690 | no disponible |

Telemetria de entrenamiento (cluster HPC Sharif, RTX 3090 24 GB):

| Metrica | Valor |
|---|---|
| Duracion del entrenamiento | 53,2 s |
| Pasos de optimizacion | 91 |
| Throughput efectivo | 14.001,2 tokens/s |
| Pico de VRAM | 23.021 MB |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint de atencion ocupa ~55 MB en FP16, pero el modelo completo requiere cargar el BERT-base congelado (~440 MB en FP32, ~220 MB en FP16), por lo que la VRAM total rondara 1-2 GB incluyendo activaciones para secuencias cortas.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; el autor entreno en una RTX 3090 de 24 GB, pero el modelo es mucho mas pequeno que ese presupuesto.
- Cabe en GPU de consumo: si, en GTX 1650, RTX 3050, RTX 4060 y superiores.
- Opciones de despliegue: Transformers con `trust_remote_code=True` (requerido por el shim `modeling_neuralops_bert.py`); la libreria NeuralOps proporciona `load_pretrained_bert` y `load_surgeried_model`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: el autor reporta 14.001,2 tokens/s durante el entrenamiento en una RTX 3090; no se publican cifras de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy SST-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `bert-lsh-attention-sst2` (este) | 110M (atencion ~55 MB serializada) | no disponible (base BERT: 512) | 79,13 % | MIT | Hugging Face, requiere `trust_remote_code` |
| `bert-base-uncased` (profesor) | 110M | 512 | 91,63 % (referencia del autor) | Apache 2.0 | Hugging Face, estandar |
| Variantes de atencion eficiente sobre BERT (p. ej. Longformer, BigBird) | 110M-150M | 4096 | no disponible en esta informacion | Apache 2.0 | Hugging Face |

La comparativa se limita a los datos publicados por el autor; no se dispone de resultados de otros modelos de atencion subcuadratica sobre SST-2 en la informacion proporcionada.

## Limitaciones y advertencias

- Perdida de precision notable: 79,13 % frente al 91,63 % del profesor, una caida de 12,5 puntos porcentuales que lo aleja de un uso en produccion con requisitos de calidad.
- El estudiante pre-destilacion apenas alcanza el 51,61 %, lo que indica que el mecanismo LSH por si solo no aprende la tarea sin el proceso de destilacion.
- Solo se ha evaluado en SST-2 (clasificacion binaria de sentimiento); no hay evidencia de generalizacion a otras tareas de GLUE ni a otros dominios.
- Entrenamiento muy corto (91 pasos, 53,2 s) que sugiere un ajuste limitado; la entropia cruzada de 0,4690 es casi el doble que la del profesor (0,2428).
- Soporte unicamente en ingles; no se ha validado en otros idiomas.
- Requiere `trust_remote_code=True` y ejecuta codigo remoto (`modeling_neuralops_bert.py`), lo que implica un riesgo de seguridad y de mantenimiento a largo plazo.
- Depende de la libreria NeuralOps y de la disponibilidad de `bert-base-uncased` en el Hub para reconstruir el modelo completo; si cualquiera de los dos cambia, el checkpoint puede dejar de funcionar.
- Riesgo de alucinacion y sesgos: no evaluados en la informacion disponible; al derivar de `bert-base-uncased` hereda los sesgos de su corpus de preentrenamiento.
- Licencia MIT permite uso comercial, pero la calidad del modelo en su estado actual no lo hace recomendable para produccion sin una evaluacion adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-lsh-attention-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/bert-base-uncased
- Dataset GLUE SST-2: https://huggingface.co/datasets/glue
- Paper de referencia sobre LSH attention (Reformer): no disponible en la informacion proporcionada
