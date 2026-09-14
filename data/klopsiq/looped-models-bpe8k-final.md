# Klopsiq/looped-models-bpe8k-final

## Resumen

LoopedLM BPE8k es el checkpoint final del proyecto de investigacion Looped Models, publicado por el usuario Klopsiq en HuggingFace. Se trata de un modelo de lenguaje de 9.440.513 parametros unicos (aproximadamente 9,44 M) con embeddings de entrada y salida atados, construido sobre dos bloques tipo Qwen compartidos entre si y reutilizados varias veces en profundidad (de ahi el termino "looped"). El objetivo del proyecto no es ofrecer un modelo util para produccion, sino estudiar como se comporta el entrenamiento con profundidad variable y reutilizacion de bloques en un regimen de computo muy reducido.

El modelo se entreno sobre un unico fragmento fijado (pinned shard) de FineWeb, con 24.969.216 tokens BPE, una ventana de contexto de 512 tokens y una profundidad muestreada uniformemente entre 8 y 16 durante el entrenamiento. La profundidad de inferencia seleccionada es T=12. El autor reporta una evaluacion unica sobre un conjunto de test bloqueado (1.048.576 tokens procedentes de 1.251 documentos) con NLL 4,2103 y perplejidad 67,38.

Su relevancia actual es metodologica: documenta con transparencia que la mejora observada dentro del rango de profundidades de entrenamiento no se extrapola a un numero arbitrario de bucles, ya que el rendimiento se degrada mas rapido alla de T=16 que el de una linea base de profundidad fija. Es, por tanto, material de referencia para quienes investigan reciclaje de capas, computo adaptativo y test-time scaling en modelos pequenos, no una alternativa a modelos de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con bloques compartidos (looped transformer); dos bloques estilo Qwen, anchura 512, GQA 8/2 cabezas, relative input injection, Depth-RoPE |
| Parametros totales | 9.440.513 parametros unicos (embeddings de entrada/salida atados) |
| Parametros activos | no disponible (no es un MoE; el bucle no anade parametros, reutiliza los mismos) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (no se publican pesos cuantizados; solo el checkpoint en PyTorch) |
| Idiomas soportados | en (ingles) |
| Licencia | other (el autor indica que aun no se ha seleccionado una licencia especifica para el artefacto del modelo; el dataset FineWeb es ODC-By) |
| Formato de pesos | model.pt (checkpoint de PyTorch con pesos y configuracion, sin estado del optimizador); no hay safetensors ni GGUF |
| Profundidad de inferencia seleccionada | T=12 |
| Tokens de entrenamiento | 24.969.216 tokens BPE de FineWeb |
| Tamano del repositorio | 0,0 GB (segun HuggingFace) |
| Libreria | pytorch (codigo propio, no usa clases AutoModel de Transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer de tipo "looped": en lugar de apilar muchas capas distintas, define dos bloques estilo Qwen que se comparten y se aplican repetidamente en profundidad. Cada bloque tiene anchura 512 y atencion con grouped-query attention de 8 cabezas de consulta frente a 2 de clave/valor (GQA 8/2). El autor incorpora dos mecanismos especificos para que el modelo pueda distinguir iteraciones: relative input injection (inyeccion de la entrada relativa en cada paso) y Depth-RoPE, una variante de RoPE que codifica la profundidad del bucle ademas de la posicion en la secuencia. Los embeddings de entrada y de salida estan atados, lo que explica que el recuento de parametros unicos sea de solo 9,44 M.

El entrenamiento utiliza 24.969.216 tokens BPE procedentes de un unico shard fijado de FineWeb, con contexto de 512 tokens. La profundidad se muestrea uniformemente entre 8 y 16 durante el entrenamiento y se aplica una perdida LM intermedia con decaimiento (decaying intermediate LM loss), es decir, una funcion auxiliar que supervisa las predicciones en profundidades intermedias ademas de la salida final. El checkpoint se selecciono antes de una unica evaluacion sobre test bloqueado y no se sustituyo despues con ablaciones de validacion posteriores al test: NLL 4,2103 y PPL 67,38 sobre 1.048.576 tokens de 1.251 documentos.

El propio informe senala que el metodo mejoro la calidad en validacion y test dentro del rango de profundidades de entrenamiento, pero que la extrapolacion mas alla de T=16 se degrada mas rapido que en una linea base de profundidad fija. Ablaciones posteriores, solo sobre validacion, encontraron que entrenar con profundidades de 8 a 24 desplaza la mejor lectura a T=16 y que el entrenamiento "final-only" supera al objetivo auxiliar en tres de cuatro semillas; el autor las presenta como lineas futuras y no como sustituto de este checkpoint, ya que no cuentan con resultado nuevo en test bloqueado. El repositorio incluye hashes exactos del tokenizer y de los datos en `data_manifest.json`, y los resultados medidos como ficheros JSON.

## Capacidades

- Generacion de texto en ingles a nivel de continuacion de secuencia, con un vocabulario BPE de 8.000 tokens.
- Modelado de lenguaje autoregresivo con ventana de 512 tokens; no se documentan capacidades de contexto largo.
- Razonamiento multi-paso mediante reciclaje de computo: la misma pareja de bloques se aplica T veces en inferencia, lo que permite ajustar el coste de computo por token sin cambiar el numero de parametros.
- Profundidad de inferencia configurable en el rango de entrenamiento (8 a 16), con T=12 como valor seleccionado.
- No hay soporte documentado de tool calling ni de function calling.
- No hay soporte documentado de agentes, uso de herramientas ni multi-step reasoning guiado por instrucciones.
- No hay capacidades multimodales (vision, audio) ni modo "thinking" explicito.
- Multilingue: no; la model card declara unicamente ingles (`language: en`).
- No esta ajustado por instrucciones: no se documenta RLHF, DPO ni SFT de alineamiento.

## Casos de uso

- Reproduccion de experimentos sobre looped transformers: el checkpoint permite recalcular las metricas de test bloqueado (NLL 4,2103, PPL 67,38) y verificar el pipeline descrito en `REPORT.md` usando `inference_example.py`.
- Linea base en estudios de reciclaje de capas: sirve como referencia de dos bloques compartidos con Depth-RoPE frente a arquitecturas de profundidad fija del mismo presupuesto de parametros, especialmente para medir degradacion al extrapolar bucles mas alla de T=16.
- Ablaciones de profundidad de inferencia: al poder fijar T entre 8 y 16, es util para trazar curvas de calidad frente a computo por token en un modelo de 9,44 M de parametros y determinar donde se situa el punto optimo de lectura.
- Investigacion sobre objetivos auxiliares de entrenamiento: la perdida LM intermedia con decaimiento puede compararse con esquemas "final-only" en experimentos controlados de bajo coste, ya que un entrenamiento de 25 M de tokens es asequible en una sola GPU.
- Estudio de tokenizers de vocabulario reducido: el vocabulario BPE de 8.000 tokens sobre FineWeb es un caso concreto para analizar el efecto del tamano del vocabulario en modelos muy pequenos, con los hashes del tokenizer fijados en `data_manifest.json`.
- Docencia y prototipado en entornos sin GPU: con 9,44 M de parametros y contexto 512, el modelo puede ejecutarse en CPU para ilustrar el funcionamiento interno de un transformer con pesos compartidos.
- Pruebas de infraestructura de inferencia: por su tamano (~19 MB en FP16), es util para validar scripts de carga de checkpoints PyTorch personalizados, serializacion de configuracion y empaquetado de artefactos antes de escalar a modelos mayores.

## Benchmarks y rendimiento

| Evaluacion | Conjunto | Resultado |
|---|---|---|
| NLL | Test bloqueado: 1.048.576 tokens de 1.251 documentos | 4,2103 |
| Perplejidad | Test bloqueado: 1.048.576 tokens de 1.251 documentos | 67,38 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, HellaSwag u otros) en la informacion disponible. El autor no reporta comparaciones numericas con modelos de referencia; solo indica cualitativamente que la extrapolacion por encima de T=16 se degrada mas rapido que en la linea base de profundidad fija.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 38 MB en FP32 y 19 MB en FP16/BF16 para los pesos; el consumo real dependera de la implementacion de atencion y del tamano de lote, pero la cache KV para contexto 512 con 2 capas KV y 2 cabezas es del orden de kilobytes por secuencia.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria es suficiente; no se requiere A100, H100 ni RTX 4090. El modelo esta pensado para ejecucion en CPU.
- Cabe holgadamente en cualquier GPU de consumo (GTX 1050, RTX 3060, RTX 4090) e incluso en dispositivos integrados o entornos de CI sin acelerador.
- Opciones de despliegue: el repositorio usa codigo PyTorch propio y no una clase `AutoModel` de Transformers; la via prevista es instalar `requirements.txt` y ejecutar `python inference_example.py`.
- vLLM, llama.cpp, Ollama y TGI: no hay soporte publicado. No se distribuyen pesos en GGUF ni safetensors, por lo que su uso en esos motores requeriria conversion manual no documentada.
- Latencia y throughput estimados: no disponible (el autor no publica mediciones de latencia ni de tokens por segundo).

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparables en la informacion proporcionada, y el autor no incluye ninguna comparacion con otros modelos. A continuacion se recogen unicamente referencias de categoria (modelos muy pequenos de generacion de texto) con datos de conocimiento general, marcados como no verificados en la informacion disponible:

| Modelo | Parametros | Contexto | Licencia | Comparacion de rendimiento |
|---|---|---|---|---|
| LoopedLM BPE8k (este modelo) | 9,44 M | 512 | other (sin licencia especifica seleccionada) | NLL 4,2103 / PPL 67,38 en test propio |
| Pythia-14M (EleutherAI) | ~14 M | 2048 | Apache 2.0 (referencia publica, no verificada aqui) | no disponible |
| GPT-2 small | 124 M | 1024 | licencia MIT modificada (referencia publica, no verificada aqui) | no disponible |
| TinyStories-1M/33M | 1 M - 33 M | 512-2048 | MIT / Apache 2.0 segun variante (referencia publica, no verificada aqui) | no disponible |

La comparacion directa de calidad no es posible: LoopedLM BPE8k solo publica NLL y perplejidad sobre su propio test bloqueado, sin evaluaciones cruzadas ni ejecucion sobre tareas estandar.

## Limitaciones y advertencias

- El autor declara explicitamente que el modelo no esta destinado a uso factual, seguimiento de instrucciones ni despliegue en produccion.
- Sesgos conocidos: no documentados. Al entrenarse unicamente sobre un shard de FineWeb (contenido web en ingles), cabe esperar los sesgos propios de ese corpus, aunque el autor no los analiza.
- Riesgo de alucinacion: muy alto. Con 9,44 M de parametros y 25 M de tokens de entrenamiento, el modelo no tiene capacidad factual fiable; cualquier salida debe tratarse como texto sintetico no verificado.
- Limitacion de contexto: 512 tokens, muy por debajo de los modelos actuales; no admite documentos largos ni conversaciones multi-turno extensas.
- Limitacion de idioma: solo ingles declarado; no hay garantia de comportamiento coherente en castellano ni en otros idiomas.
- Restricciones de licencia: la licencia figura como "other" y el autor indica que aun no se ha seleccionado una licencia especifica para el artefacto del modelo. Esto deja el uso comercial en una situacion juridicamente indeterminada; conviene contactar con el autor antes de cualquier uso mas alla de la investigacion. El dataset FineWeb se distribuye bajo ODC-By.
- Ausencia de alineamiento: no hay RLHF, DPO ni SFT documentados, por lo que el modelo no sigue instrucciones ni aplica filtros de seguridad.
- Extrapolacion de profundidad: el propio informe advierte de que el comportamiento se degrada mas alla de T=16 y que el checkpoint no demuestra test-time scaling util con un numero arbitrario de bucles.
- Reproducibilidad: el repositorio no esta en formato estandar (no hay safetensors, GGUF ni `AutoModel`), de modo que su integracion en herramientas habituales exige trabajo adicional. Ademas, el checkpoint se selecciono antes de la unica apertura del test bloqueado, sin ablaciones posteriores que lo sustituyan.
- Tamano del repositorio reportado como 0,0 GB en HuggingFace, lo que puede dificultar la verificacion previa del contenido antes de la descarga.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Klopsiq/looped-models-bpe8k-final
- Codigo fuente: https://github.com/Klopsiq/T-lab_Looped_Models
- Informe de investigacion: https://github.com/Klopsiq/T-lab_Looped_Models/blob/main/REPORT.md
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo. Los resultados devueltos corresponden a hilos de foro sobre la empresa ManoMano y no guardan ninguna relacion con este modelo ni con el proyecto Looped Models.
