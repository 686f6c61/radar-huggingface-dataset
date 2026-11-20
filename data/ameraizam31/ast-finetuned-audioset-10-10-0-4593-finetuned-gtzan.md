# ameraizam31/ast-finetuned-audioset-10-10-0.4593-finetuned-gtzan

## Resumen

`ameraizam31/ast-finetuned-audioset-10-10-0.4593-finetuned-gtzan` es un modelo de clasificacion de audio obtenido mediante ajuste fino del checkpoint `MIT/ast-finetuned-audioset-10-10-0.4593` sobre el conjunto de datos GTZAN, que contiene diez generos musicales. Lo publica el usuario de Hugging Face `ameraizam31` y esta pensado como un clasificador de genero musical listo para usarse con la libreria `transformers` en tareas de `audio-classification`.

El modelo parte del Audio Spectrogram Transformer (AST), una arquitectura basada en transformer puro que opera sobre espectrogramas de Mel en lugar de sobre formas de onda, y que fue preentrenada originalmente en AudioSet. El ajuste fino se realizo con el `Trainer` de `transformers` y Mixed Precision nativo, alcanzando un 91 % de exactitud declarada sobre el conjunto de evaluacion de GTZAN.

Es relevante ahora como ejemplo de reciclaje de un backbone de audio de proposito general hacia una tarea concreta de musica con muy pocos recursos: el repositorio pesa solo 0,3 GB y el modelo tiene 86,2 millones de parametros, por lo que es desplegable en hardware modesto. No obstante, se trata de un modelo de autor individual, con cero descargas y cero likes en el momento de redactar esta ficha, y con una model card autogenerada que no documenta usos previstos ni limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio Spectrogram Transformer (AST), transformer sobre espectrogramas de Mel |
| Parametros totales | 86.196.490 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la entrada es un espectrograma, no una secuencia de texto) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors en fp32/fp16) |
| Idiomas soportados | no disponible (modelo de audio, sin componente linguistico) |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura AST, un transformer de tipo ViT adaptado a audio: la senal se convierte en un espectrograma de Mel y se divide en parches solapados que se tratan como tokens, a los que se anade un token de clasificacion. El checkpoint base `MIT/ast-finetuned-audioset-10-10-0.4593` fue preentrenado en AudioSet con parches de 10x10 y un factor de solapamiento de 10, y este ajuste fino conserva esa configuracion.

El ajuste fino se realizo sobre GTZAN con los siguientes hiperparametros declarados en la model card: learning rate 5e-5, batch de entrenamiento y evaluacion de 8, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-8, scheduler lineal con warmup del 10 %, 10 epocas, semilla 42 y AMP nativo. El entrenamiento consta de 1130 pasos (113 por epoca). No se documenta el numero de tokens de audio, la composicion exacta del split ni si hubo aumento de datos o tecnicas de regularizacion adicionales. La perdida de validacion oscila entre 0,38 y 0,77 a lo largo de las epocas, con una perdida final de 0,4534 y una exactitud estabilizada en 0,91 desde la epoca 8.

## Capacidades

- Clasificacion de audio en 10 clases correspondientes a los generos musicales de GTZAN (blues, classical, country, disco, hiphop, jazz, metal, pop, reggae, rock).
- Extraccion de representaciones de audio mediante el encoder AST subyacente, reutilizable para otras tareas de audio.
- Inferencia por lotes con la pipeline `audio-classification` de `transformers`.
- Compatible con endpoints de Hugging Face (`endpoints_compatible` en los tags).
- No soporta generacion de texto, tool calling, agentes, vision ni razonamiento multi-paso.
- No dispone de modo thinking ni de capacidades multimodales mas alla del audio.
- Capacidades multilingues: no aplica.

## Casos de uso

- Clasificacion automatica de genero musical en bibliotecas personales: el modelo recibe un fragmento de audio y devuelve la etiqueta de genero con su probabilidad, lo que permite etiquetar y organizar colecciones de forma masiva.
- Etiquetado de catalogos en plataformas de streaming o sellos discograficos: como el modelo es pequeno (86 M de parametros, 0,3 GB), puede ejecutarse en CPU o GPU de gama baja para preclasificar lotes antes de una revision humana.
- Sistemas de recomendacion musical: la etiqueta de genero predicha puede usarse como caracteristica adicional en un motor de recomendacion basado en contenido.
- Filtrado y moderacion de contenido en emisoras o podcasts: permite detectar si un audio pertenece al genero esperado en un canal tematico.
- Investigacion en music information retrieval (MIR): sirve como baseline reproducible para comparar tecnicas de clasificacion de genero sobre GTZAN, dado que la particion y los hiperparametros estan documentados.
- Docencia y prototipado rapido: al cargarse con `AutoModelForAudioClassification` en pocas lineas, es util para demostrar pipelines de audio con `transformers` en cursos y talleres.
- Preentrenamiento para tareas derivadas: el encoder puede congelarse y usarse como extractor de caracteristicas en un clasificador de emociones musicales o de instrumentos, aunque requeriria validacion propia.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Metrica | Dataset | Split | Valor |
|---|---|---|---|
| Accuracy | GTZAN (`marsyas/gtzan`, config `all`) | train (segun model-index) | 0,91 |
| Loss | GTZAN (conjunto de evaluacion) | evaluacion | 0,4637 |

Evolucion del entrenamiento declarada:

| Epoca | Training loss | Validation loss | Accuracy |
|---|---|---|---|
| 1 | 0,7757 | 0,5436 | 0,83 |
| 2 | 0,4122 | 0,6070 | 0,79 |
| 3 | 0,1767 | 0,5159 | 0,87 |
| 4 | 0,1191 | 0,3816 | 0,88 |
| 5 | 0,0599 | 0,7680 | 0,84 |
| 6 | 0,0004 | 0,5296 | 0,88 |
| 7 | 0,0002 | 0,4817 | 0,90 |
| 8 | 0,0002 | 0,4637 | 0,91 |
| 9 | 0,0001 | 0,4570 | 0,91 |
| 10 | 0,0001 | 0,4534 | 0,91 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no aplican a un modelo de clasificacion de audio.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,35 GB en fp32 y 0,18 GB en fp16 para los pesos; con activaciones y batches pequenos, menos de 1 GB en la mayoria de configuraciones.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; una RTX 3060, RTX 4060 o superior es mas que suficiente. Para lotes grandes, una A100 o H100 no aporta ventajas significativas por el reducido tamano del modelo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- Tambien es viable en CPU: con 86 M de parametros, la inferencia sobre clips de 30 segundos es rapida en CPU moderna, aunque el preprocesado de espectrogramas anade coste.
- Opciones de despliegue: `transformers` (pipeline `audio-classification`), `optimum` para exportacion a ONNX, TorchServe o FastAPI con un wrapper propio. No se han publicado versiones GGUF ni adaptaciones para llama.cpp u Ollama, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles de forma oficial; en una GPU consumer se espera del orden de milisegundos por clip de 30 segundos, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Dataset | Accuracy declarada | Licencia |
|---|---|---|---|---|---|
| Este modelo (`ameraizam31/...-gtzan`) | 86,2 M | Clasificacion de genero musical | GTZAN | 0,91 | BSD-3-Clause |
| `MIT/ast-finetuned-audioset-10-10-0.4593` (base) | ~86 M | Clasificacion de eventos de audio (527 clases) | AudioSet | no disponible en esta ficha | BSD-3-Clause (heredada) |
| `dima806/music_genres_classification` | no disponible | Clasificacion de genero musical | GTZAN | no disponible | no disponible |
| `m-a-p/MERT-v1-95M` | ~95 M | Representaciones musicales auto-supervisadas | AudioSet y otros | no disponible (modelo base) | CC BY-NC 4.0 |

La comparacion con alternativas concretas es limitada porque no se dispone de resultados homogeneos publicados en la informacion proporcionada. El modelo base de MIT es el referente directo, ya que este checkpoint es un ajuste fino suyo; MERT es una alternativa auto-supervisada orientada a representaciones musicales, no a clasificacion directa.

## Limitaciones y advertencias

- Model card autogenerada por el `Trainer`: las secciones de descripcion, usos previstos y limitaciones no estan completadas por el autor.
- El model-index declara el split `train` como conjunto de evaluacion, lo que sugiere que la exactitud de 0,91 puede haberse medido sobre datos de entrenamiento o que la etiqueta del split es erronea; conviene validar el rendimiento en una particion independiente antes de usarlo en produccion.
- GTZAN es un dataset pequeno y con problemas conocidos de duplicados y etiquetas ruidosas; la exactitud reportada puede no generalizar a audio real de catalogo.
- Solo cubre diez generos musicales; no reconoce subgeneros, instrumentos, emociones ni eventos de audio generales, para lo que habria que recurrir al modelo base de AudioSet.
- Riesgo de sobreajuste: la perdida de entrenamiento cae a 0,0001 en las ultimas epocas mientras la de validacion se mantiene en torno a 0,45.
- No hay informacion sobre sesgos por genero musical, origen cultural o desbalance de clases en el dataset.
- Licencia BSD-3-Clause: permite uso comercial con atribucion y sin endoso; no obstante, el modelo base y el dataset GTZAN pueden tener condiciones adicionales que conviene revisar.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en comunidad ni de validacion externa.
- No apto para tareas generativas, de dialogo ni multimodales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ameraizam31/ast-finetuned-audioset-10-10-0.4593-finetuned-gtzan
- Modelo base: https://huggingface.co/MIT/ast-finetuned-audioset-10-10-0.4593
- Dataset GTZAN en Hugging Face: https://huggingface.co/datasets/marsyas/gtzan
- Paper original de AST (Gong et al., "AST: Audio Spectrogram Transformer"): https://arxiv.org/abs/2104.01778
- Repositorio oficial de AST: https://github.com/YuanGongND/ast
- Documentacion de `transformers` para clasificacion de audio: https://huggingface.co/docs/transformers/tasks/audio_classification
