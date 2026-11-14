# Hooshaai/bert-nystrom-attention-sst2

## Resumen

`Hooshaai/bert-nystrom-attention-sst2` es un checkpoint derivado de `google-bert/bert-base-uncased` en el que se han sustituido los bloques de atencion softmax cuadratica de las 12 capas del transformer por un mecanismo de atencion Nystrom, integrado a traves de la libreria NeuralOps. El modelo lo publica el usuario Hooshaai (la model card cita como autor a Taha Majlesi y el repositorio `tahamajs/NeuralOps`), y su objetivo es demostrar que es posible mantener una precision razonable en una tarea de clasificacion de texto con una complejidad operativa subcuadratica, reduciendo el coste computacional del mecanismo de atencion.

El checkpoint se ha afinado y destilado sobre la tarea SST-2 del benchmark GLUE (clasificacion binaria de sentimiento en ingles) mediante el protocolo de destilacion por representaciones en cache de NeuralOps, con el modelo original como profesor. Alcanza un 87,73 % de accuracy en el split de validacion de SST-2, frente al 91,63 % del profesor `bert-base-uncased`, lo que supone una perdida de 3,9 puntos pero con un mecanismo de atencion de coste asintoticamente menor.

Es relevante porque ejemplifica una linea de trabajo practica: reemplazar atencion cuadratica por aproximaciones subcuadraticas en modelos BERT preentrenados sin reentrenar desde cero, serializando solo los pesos de atencion y la cabeza de clasificacion (~55 MB en FP16) y reutilizando los pesos base congelados. El contexto maximo no se especifica en la informacion disponible; al derivar de BERT-base, el limite arquitectonico habitual es de 512 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-base con atencion Nystrom sustituyendo la atencion softmax cuadratica en las 12 capas |
| Parametros totales | ~110 M (heredados de `bert-base-uncased`; el repo solo publica los pesos de atencion y la cabeza, ~55 MB en FP16) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (arquitectura base BERT: 512 tokens como maximo posicional) |
| Tipos de cuantizacion | Pesos publicados en FP16; no se documentan otras cuantizaciones |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`attention_weights.safetensors`, FP16, serializacion `attention_only_fp16`); requiere `trust_remote_code=True` y el shim `modeling_neuralops_bert.py` |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased`, un transformer encoder de 12 capas y ~110 M de parametros, y reemplaza en cada capa el bloque de multi-head attention estandar por `nystrom_attention`, un mecanismo de aproximacion de bajo rango que reduce la complejidad efectiva de O(N^2) a O(N) u O(N log N) segun la implementacion. Los pesos base de BERT permanecen congelados; solo se entrenan y serializan los parametros de atencion y la cabeza de clasificacion, lo que explica el tamano de descarga de ~55 MB frente a los ~450 MB del checkpoint completo.

El entrenamiento sigue el protocolo de destilacion por representaciones en cache de NeuralOps, en dos etapas: primero una alineacion de subespacio oculto y despues una combinacion de KL sobre logits y entropia cruzada de la tarea. Se ejecuto en una NVIDIA GeForce RTX 3090 de 24 GB (clúster HPC Sharif), con 221 pasos de optimizacion, 49,6 s de duracion y un throughput efectivo de 36.507,5 tokens/s, con un pico de VRAM de 7.854 MB. La destilacion evita asignar VRAM al profesor mediante cache offline de representaciones. No se documentan en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset mas alla de GLUE/SST-2, ni si hubo RLHF o DPO (no aplica en un modelo discriminativo de este tipo).

## Capacidades

- Clasificacion binaria de sentimiento en ingles (positivo/negativo) sobre texto de entrada.
- Clasificacion de secuencias cortas en general, al conservar la cabeza `AutoModelForSequenceClassification`.
- Inferencia con atencion subcuadratica, lo que reduce el coste computacional en secuencias largas dentro del limite posicional de BERT.
- Carga modular: los pesos de atencion se aplican sobre los pesos base congelados de `bert-base-uncased` en tiempo de carga.
- Integracion con la API de NeuralOps (`load_pretrained_bert`, `load_surgeried_model`) y con `transformers` mediante `trust_remote_code=True`.
- No soporta generacion de texto, tool calling, agentes, vision, audio ni modo de razonamiento extendido; es un modelo exclusivamente discriminativo.

## Casos de uso

- Analisis de sentimiento en resenas de producto o comentarios de usuarios en ingles: el modelo clasifica cada texto en positivo o negativo con una precision del 87,73 % en SST-2, adecuada para triaje automatico y priorizacion de casos.
- Moderacion de contenido a escala: al reducir el coste de atencion, permite procesar grandes volumenes de textos cortos en lotes con menor coste por token que un BERT estandar.
- Enrutamiento de tickets de soporte: clasificar la polaridad del mensaje del cliente para derivar a colas de atencion prioritaria o estandar.
- Investigacion en atencion subcuadratica: servir como punto de partida reproducible para comparar mecanismos de atencion eficiente sobre una misma base y tarea.
- Destilacion y experimentacion con NeuralOps: usar el checkpoint como estudiante de referencia en pipelines de destilacion por representaciones en cache.
- Clasificacion de documentos cortos en ingles (titulares, tuits, fragmentos de resenas) donde el limite de 512 tokens de BERT no supone un problema.
- Base para fine-tuning adicional en tareas de clasificacion binaria del mismo dominio, aprovechando la licencia MIT y el bajo tamano del checkpoint.

## Benchmarks y rendimiento

Evaluacion sobre el split de validacion de GLUE SST-2 (872 muestras de clasificacion binaria):

| Metrica | Profesor (`bert-base-uncased`) | Estudiante pre-destilacion | Modelo destilado |
|---|---|---|---|
| Accuracy SST-2 | 91,63 % | 81,42 % | 87,73 % |
| Entropia cruzada de validacion | 0,2428 | No calibrada | 0,3874 |
| Delta de accuracy frente al profesor | — | -10,21 pp | -3,90 pp |

Telemetria de entrenamiento (clúster HPC Sharif, RTX 3090 24 GB):

| Metrica | Valor |
|---|---|
| Duracion del entrenamiento | 49,6 s |
| Pasos de optimizacion | 221 |
| Throughput efectivo | 36.507,5 tokens/s |
| Pico de VRAM | 7.854 MB |

No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint publicado ocupa ~55 MB en FP16, pero al cargarse requiere inicializar los pesos base de `bert-base-uncased` (~110 M de parametros, ~220 MB en FP16 y ~440 MB en FP32). En la practica, menos de 1 GB de VRAM para inferencia en precision completa.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM. El autor valido el entrenamiento en una RTX 3090 de 24 GB, pero la inferencia cabe holgadamente en GPUs consumer de gama media (GTX 1650, RTX 3050, RTX 4060) e incluso en CPU.
- Cabe en cualquier GPU consumer actual; tambien en CPU para lotes pequenos.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requiere el shim `modeling_neuralops_bert.py`), API de NeuralOps (`load_pretrained_bert`, `load_surgeried_model`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: el autor reporta 36.507,5 tokens/s durante el entrenamiento en una RTX 3090, pero no se publican cifras de latencia o throughput de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy SST-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/bert-nystrom-attention-sst2` | ~110 M (atencion Nystrom) | No disponible (base BERT: 512) | 87,73 % | MIT | Hugging Face, requiere `trust_remote_code` |
| `google-bert/bert-base-uncased` (profesor) | 110 M | 512 | 91,63 % (segun la model card) | Apache 2.0 | Hugging Face, `transformers` estandar |
| BERT-base con atencion softmax afinado en SST-2 | 110 M | 512 | No disponible en la informacion | Apache 2.0 | Hugging Face |

La comparativa se limita al profesor y a la variante estandar de BERT-base, que son las referencias directas citadas en la model card. No se dispone de datos de otros mecanismos de atencion subcuadratica (Longformer, BigBird, Performer) en la informacion proporcionada.

## Limitaciones y advertencias

- Perdida de precision de 3,90 puntos porcentuales frente al profesor en SST-2, lo que puede ser inaceptable en aplicaciones con umbrales estrictos.
- Modelo exclusivamente en ingles; no soporta otros idiomas.
- Solo clasificacion binaria de sentimiento: no genera texto, no hace tool calling ni razonamiento multi-paso.
- Limitado por la longitud de contexto posicional de BERT-base (512 tokens); textos mas largos requieren truncado.
- Riesgo de sesgos heredados de `bert-base-uncased` y del corpus de SST-2 (resenas de peliculas), con posible degradacion en dominios distintos.
- Requiere `trust_remote_code=True` y ejecucion de codigo remoto (`modeling_neuralops_bert.py`), lo que implica revisar el shim antes de desplegarlo en produccion.
- Dependencia de la libreria NeuralOps y de los pesos base de `bert-base-uncased`; no es un checkpoint autocontenido.
- La model card cita el repositorio `tahamajs/NeuralOps` y el ID `tahamajs/bert-nystrom-attention-sst2` en los ejemplos, mientras que el ID real del repo es `Hooshaai/bert-nystrom-attention-sst2`; conviene verificar la ruta antes de cargar.
- Solo 62 descargas y 2 likes en el momento de la consulta: ecosistema pequeno y poca validacion externa.
- No se documentan evaluaciones de robustez, calibracion mas alla de la entropia cruzada reportada, ni pruebas adversariales.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/bert-nystrom-attention-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/bert-base-uncased
- Benchmark GLUE: https://gluebenchmark.com/
- Dataset SST-2: https://huggingface.co/datasets/glue
