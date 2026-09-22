# huyleit/mert-v1-95m-music-emotion-int8

## Resumen

El modelo `huyleit/mert-v1-95m-music-emotion-int8` es un motor de reconocimiento de emociones musicales (Music Emotion Recognition, MER) especializado en regresión continua 2D sobre el modelo circunflejo de Russell. Se construye sobre el encoder `m-a-p/MERT-v1-95M` (Music Foundation Transformer, publicado en ICLR 2024), al que se añade una cabeza de temporal attention pooling y una etapa de cuantización dinámica INT8, exportada a formato ONNX. El resultado es un clasificador de audio que, a partir de una señal de onda mono de 15 segundos a 24 kHz, devuelve un tensor `[1, 2]` con las coordenadas de valencia (agrado emocional) y arousal (intensidad energética), ambas normalizadas en el rango `[0.0, 1.0]`.

El modelo lo publica el usuario `huyleit` como componente del proyecto `SE121-microservices`, orientado a sistemas de recomendación de musicoterapia y computación afectiva. Su principal valor diferencial no es la precisión bruta, sino el equilibrio entre rendimiento y coste: el repositorio ocupa 0,1 GB, la inferencia declarada consume aproximadamente 111 MB de RAM y está optimizada para ejecución en CPU mediante ONNX Runtime, lo que lo hace apto para despliegues serverless, microservicios y entornos sin GPU.

Con 95 millones de parámetros en el backbone, una ventana de entrada fija de 360.000 muestras y licencia Apache 2.0, el modelo se posiciona como una pieza de infraestructura ligera para pipelines de análisis afectivo musical a escala, más que como un modelo de propósito general. La model card declara métricas competitivas en arousal (CCC 0,8204) y moderadas en valencia (CCC 0,7358) sobre un conjunto de test independiente de 386 canciones extraído de DEAM y PMEmo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Music Foundation Transformer (MERT-v1-95M, ICLR 2024) + temporal attention pooling + cabeza de regresion; grafo ONNX con cuantizacion dinamica INT8 |
| Parametros totales | Aproximadamente 95 millones en el backbone (segun la nomenclatura de MERT-v1-95M); el numero exacto de parametros de la cabeza de regresion no se especifica -> no disponible |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No aplica contexto textual. Entrada de audio fija: segmento de 15 s a 24.000 Hz mono = 360.000 muestras, tensor `[1, 360000]` float32 |
| Tipos de cuantizacion | INT8 dinamica (dynamic quantized INT8 ONNX); no se documentan otros formatos en el repositorio |
| Idiomas soportados | vi, en (etiquetas declaradas en la model card). La tarea es de clasificacion/regresion sobre audio, por lo que el idioma no afecta a la inferencia |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`mert_emotion_int8.onnx`); el repositorio ocupa 0,1 GB |
| Entrada ONNX | `audio_waveform`, shape `[1, 360000]`, float32 |
| Salida ONNX | `valence_arousal`, shape `[1, 2]` (valencia, arousal) en `[0.0, 1.0]` |
| Pipeline declarado | `audio-classification` (en la practica, regresion continua de dos dimensiones) |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

La arquitectura parte de MERT-v1-95M, un transformer de auto-supervision entrenado sobre audio musical (Music Foundation Transformer), preentrenado por el grupo m-a-p y presentado en ICLR 2024. Sobre las representaciones de ese encoder, el autor añade una etapa de temporal attention pooling que agrega la secuencia temporal en un vector unico, seguida de una cabeza de regresion que produce dos escalares: valencia y arousal. El modelo se exporta a ONNX y se somete a cuantizacion dinamica INT8, lo que reduce el peso del repositorio a 0,1 GB y permite inferencia en CPU con un consumo de memoria declarado de aproximadamente 111 MB.

El protocolo de preprocesado es fijo y determinista: se extrae el segmento central de 15 segundos de la cancion (`[T/2 - 7,5 s, T/2 + 7,5 s]`), se convierte a mono y se remuestrea a 24 kHz. La model card justifica esta eleccion con el paradigma de thin-slicing y el principio de saliencia del estribillo. La evaluacion se realiza sobre un conjunto de test reservado de 386 canciones, aislado como split del 15 % a partir de DEAM y PMEmo (N total = 2.569 pistas); de forma implicita, el entrenamiento de la cabeza se habria realizado sobre el 85 % restante, aproximadamente 2.183 pistas, aunque la model card no detalla la composicion exacta del conjunto de entrenamiento.

No se documenta en la informacion disponible el numero de tokens o horas de audio utilizados en el preentrenamiento de MERT, ni si la adaptacion empleo tecnicas de RLHF, DPO u otras formas de alineacion. Tampoco se detallan hiperparametros de entrenamiento, funcion de perdida o procedimiento de calibracion de la cuantizacion.

## Capacidades

- Regresion continua de valencia y arousal: devuelve dos valores en `[0.0, 1.0]` que situan una cancion en el plano afectivo de Russell, no una etiqueta discreta.
- Clasificacion por cuadrantes emocionales: a partir de las coordenadas se puede derivar Q1 (valencia alta, arousal alto: alegre, eufórico), Q2 (valencia baja, arousal alto: tenso, ansioso), Q3 (valencia baja, arousal bajo: triste, melancolico) y Q4 (valencia alta, arousal bajo: relajado, sereno).
- Procesamiento de audio musical: entrada de onda mono a 24 kHz, con extraccion del segmento central de 15 segundos como paso previo.
- Inferencia en CPU: el grafo ONNX INT8 esta optimizado para ejecucion sin GPU, con `intra_op_num_threads` configurable y nivel de optimizacion de grafo completo.
- Integracion como microservicio: al ser un unico fichero ONNX con entrada y salida nombradas, se puede envolver en FastAPI, Triton, AWS Lambda u otros entornos serverless.
- Idiomas: las etiquetas declaradas son vi y en, pero al tratarse de una tarea sobre senal de audio, la cobertura linguistica no condiciona el resultado.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agentico.
- No dispone de modo thinking ni de cadena de razonamiento explicita.
- No genera texto, codigo ni respuestas conversacionales.
- No procesa imagenes, video ni otras modalidades distintas del audio.

## Casos de uso

- Recomendacion de musicoterapia: el modelo permite etiquetar una biblioteca musical por valencia y arousal y seleccionar pistas que empujen al oyente hacia un estado objetivo (por ejemplo, Q4 para reduccion de estres o Q1 para elevacion del animo), que es exactamente el escenario para el que se desarrollo dentro del proyecto SE121-microservices.
- Clasificacion masiva de catalogos musicales: al consumir unos 111 MB de RAM y ejecutarse en CPU, se pueden procesar decenas de miles de pistas en un pipeline batch sin aprovisionar GPU; basta extraer el segmento central de 15 segundos y remuestrear a 24 kHz.
- Microservicio serverless de analisis afectivo: el fichero ONNX unico se puede desplegar en AWS Lambda, Cloud Run o un contenedor minimo, con tiempos de arranque bajos y sin dependencias de CUDA.
- Generacion dinamica de playlists adaptativas: combinando la prediccion de valencia y arousal con el historial del usuario, un reproductor puede reordenar la cola en tiempo real para mantener o modificar el estado emocional deseado.
- Investigacion en computacion afectiva: el modelo sirve como extractor de caracteristicas afectivas para estudios que correlacionen musica con estado de animo, sueño o ansiedad, aportando dos variables continuas en lugar de etiquetas categoricas.
- Aplicaciones de mindfulness y salud mental: integrado en una app movil o web, puede recomendar sesiones de relajacion o activacion segun el perfil emocional de cada pista, con inferencia local en el dispositivo o en un backend ligero.
- Sonorizacion de contenido audiovisual: agencias y plataformas pueden filtrar candidatos musicales para un spot o una escena buscando un arousal y una valencia concretos (por ejemplo, arousal > 0.7 y valencia > 0.6 para un anuncio energico y positivo).
- Moderacion y coherencia emocional en plataformas de streaming: verificacion automatica de que las playlists etiquetadas como "relax" o "fiesta" cumplen realmente el perfil afectivo declarado.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index de la model card. La evaluacion se realizo sobre un conjunto de test reservado de 386 canciones, aislado como split del 15 % de DEAM y PMEmo (N total = 2.569 pistas). Ninguno de los resultados esta verificado de forma independiente (`verified: false`).

| Metrica | Dimension | Valor |
|---|---|---|
| CCC de Lin (concordancia) | Arousal | 0,8204 |
| CCC de Lin (concordancia) | Valencia | 0,7358 |
| R² | Arousal | 0,6575 |
| R² | Valencia | 0,4783 |
| MAE | Arousal | 0,0861 |
| MAE | Valencia | 0,0895 |

No se han publicado en la informacion disponible resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros), ni comparaciones directas contra otros modelos de reconocimiento de emociones musicales bajo el mismo protocolo de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula. El modelo esta pensado para `CPUExecutionProvider` de ONNX Runtime y la model card declara un consumo de aproximadamente 111 MB de RAM. Al tratarse de pesos INT8 sobre un backbone de 95M de parametros, la huella en GPU seria inferior a 1 GB.
- GPU recomendadas: no se especifica ninguna. Cualquier GPU con soporte de ONNX Runtime CUDA o TensorRT (RTX 3060 en adelante, T4, L4, A10, A100, H100) podria ejecutarlo, pero no aporta ventaja significativa frente a CPU dado el tamano del modelo.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo, e incluso en dispositivos de borde y en CPU de portatil.
- Opciones de despliegue: ONNX Runtime (CPU o CUDA), envoltorios propios en FastAPI o Flask, contenedores Docker minimos, funciones serverless (AWS Lambda, Google Cloud Run, Azure Functions). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que estan orientados a modelos de lenguaje y no aplican a este caso.
- Latencia y throughput: no disponibles en la informacion proporcionada. La model card menciona "ultra-fast CPU inference" como objetivo de diseno, pero no aporta numeros de latencia ni de pistas por segundo.
- Dependencias de inferencia: `onnxruntime`, `soundfile`, `scipy`, `numpy` y `huggingface_hub`.

## Comparativa con modelos similares

La informacion disponible solo permite comparar con el modelo base del que deriva. No se aportan datos de benchmarks de otros sistemas de reconocimiento de emociones musicales bajo el mismo protocolo, por lo que el resto de celdas quedan como no disponibles.

| Modelo | Parametros | Entrada | Formato y despliegue | Rendimiento declarado | Licencia |
|---|---|---|---|---|---|
| `huyleit/mert-v1-95m-music-emotion-int8` | ~95M (backbone) + cabeza de regresion | 15 s de audio mono a 24 kHz | ONNX INT8, CPU, ~111 MB RAM, repo de 0,1 GB | CCC arousal 0,8204; CCC valencia 0,7358 (test de 386 canciones DEAM+PMEmo) | Apache 2.0 |
| `m-a-p/MERT-v1-95M` (modelo base) | ~95M | Audio musical | PyTorch (transformers), requiere fine-tuning para MER | No es un modelo de regresion afectiva; no comparable directamente | no disponible en la informacion proporcionada |
| Otros modelos MER sobre DEAM/PMEmo | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Metricas autodeclaradas: los resultados del model-index aparecen con `verified: false`; no han sido reproducidos por un tercero independiente.
- Cuantizacion sin analisis de degradacion: la model card no compara el rendimiento del modelo INT8 con el del modelo en precision completa, por lo que no se cuantifica la perdida de precision introducida por la cuantizacion.
- Valencia menos fiable que arousal: el R² de valencia (0,4783) es notablemente inferior al de arousal (0,6575), lo que indica que la dimension de agrado emocional explica menos varianza y es mas susceptible de error.
- Sesgo de muestreo por segmento: la prediccion se basa en 15 segundos del centro de la cancion. Canciones con estructura atipica, introducciones largas, cambios drasticos de dinamica o estribillos fuera del centro pueden etiquetarse de forma incorrecta.
- Dominio del conjunto de evaluacion: DEAM y PMEmo son corpus de musica occidental anotados por oyentes; el comportamiento en tradiciones musicales no occidentales, musica instrumental experimental o audio con ruido no esta caracterizado.
- Subjetividad del ground truth: la emocion percibida en musica es una etiqueta subjetiva con alta variabilidad entre anotadores; incluso valores de CCC en torno a 0,8 reflejan el techo de acuerdo humano, no una verdad objetiva.
- Desajuste de pipeline: el modelo esta etiquetado como `audio-classification` pero su salida es una regresion continua de dos valores, lo que puede romper integraciones que esperen etiquetas discretas y probabilidades.
- Entrada rigida: el tensor de entrada debe ser exactamente `[1, 360000]`; no admite lotes variables ni duraciones distintas sin preprocesado previo.
- Sin capacidades generativas ni de agente: no puede usarse para dialogo, codigo, tool calling ni razonamiento multi-paso.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero conviene verificar las condiciones de licencia del modelo base MERT-v1-95M y de los datasets DEAM y PMEmo, cuyos terminos de uso no se detallan en la informacion proporcionada.
- Advertencia de uso en salud mental: el modelo se presenta vinculado a terapia musical y bienestar, pero no es una herramienta de diagnostico clinico ni sustituye la valoracion de un profesional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/huyleit/mert-v1-95m-music-emotion-int8
- Modelo base referenciado en la model card: https://huggingface.co/m-a-p/MERT-v1-95M
- Paper de MERT (Music Foundation Transformer, ICLR 2024): no disponible como URL en la informacion proporcionada
- Repositorio del proyecto `SE121-microservices`: no disponible como URL en la informacion proporcionada
- Demos o espacios asociados: no disponibles
- Nota sobre la busqueda web: los resultados recuperados (foros de MSI sobre tickets de soporte, arranque dual y pantallas negras) no guardan relacion con este modelo y no se han utilizado como fuente.
