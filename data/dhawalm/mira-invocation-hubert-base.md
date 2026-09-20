# DhawalM/mira-invocation-hubert-base

## Resumen

DhawalM/mira-invocation-hubert-base es un clasificador binario de audio disenado para detectar cuando una persona se dirige directamente a "Mira" frente a menciones incidentales de la palabra. El modelo parte del encoder de voz preentrenado facebook/hubert-base-ls960 y anade un mecanismo de attention pooling y un clasificador reducido; no requiere transcripcion, tokenizer ni decoder de texto en inferencia. Lo publica el usuario DhawalM como entrega de un proyecto de deteccion de palabra de activacion sobre microfono real.

El checkpoint principal es la linea base de 2.002 ventanas grabadas con microfono real. De todo el encoder solo se ajustan los cuatro ultimos bloques, junto con el pooling y el clasificador. Existe un segundo experimento de 2.512 ventanas en `experiments/synthetic-expansion/`, con recall de validacion ligeramente inferior, que se conserva como referencia. La etiqueta positiva corresponde a la persona que lleva las gafas dirigiendose a Mira; el modelo no verifica quien habla.

Es relevante ahora porque ejemplifica el patron de reutilizar un encoder de voz congelado en su mayor parte y ajustar solo una fraccion de los pesos para una tarea de clasificacion acustica muy concreta, sin pipeline de ASR. Los checkpoints son paquetes PyTorch especificos del proyecto, no paquetes estandar de Transformers, y no se les ha asignado una licencia nueva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (HuBERT Base, 12 bloques) con attention pooling y clasificador binario |
| Parametros totales | Aproximadamente 95 M para el encoder HuBERT Base; total del clasificador no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible; la demo usa una ventana de 16 s remuestreada a 16 kHz y rellenada por la izquierda hasta 30 s |
| Tipos de cuantizacion | No disponible; entrenamiento e inferencia en BF16 (FP32 en fallback de CPU) |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible; el handoff no asigna licencia nueva a los pesos ajustados ni a los datos de entrenamiento |
| Formato de pesos | Checkpoints PyTorch propios (`.pt`); no son paquetes `from_pretrained` de Transformers ni safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo combina un encoder de voz HuBERT Base preentrenado con un cabezal de attention pooling y un clasificador pequeno que produce una puntuacion de invocacion. Solo se ajustan los cuatro ultimos bloques del encoder, el pooling y el clasificador; el resto de los pesos permanece congelado. La extraccion de caracteristicas se restaura desde el propio checkpoint y difiere segun se use Whisper o HuBERT como extractor, lo que implica que la configuracion del extractor forma parte del artefacto.

Los datos de entrenamiento del checkpoint principal son 2.002 ventanas derivadas de 167 fragmentos de una unica sesion de microfono real, con etiquetas asistidas por ASR y no verificadas completamente por humanos. El segundo checkpoint amplia a 2.512 ventanas con datos sinteticos. Ambos seleccionan mejor epoca y umbral sobre el mismo conjunto de validacion sintetico de 157 clips. Las ventanas de entrenamiento almacenadas tienen longitudes de contexto real mixtas, mientras que la demo aplica un recorte de 16 segundos. No se realizo entrenamiento nuevo ni evaluacion sobre conjunto de test para esta entrega. Se conserva `run.csv` junto a cada checkpoint para que el cargador recupere la precision BF16 del entrenamiento.

## Capacidades

- Clasificacion binaria de audio: distingue invocacion directa a Mira frente a mencion incidental.
- Deteccion de palabra de activacion sobre audio de microfono real, orientada a llevar las gafas.
- Inferencia sin ASR: no necesita transcripcion, tokenizer ni decoder de texto.
- Procesamiento de ventanas mono a 16 kHz con relleno por la izquierda hasta 30 segundos.
- Salida de una puntuacion continua comparable con un umbral guardado en el checkpoint (0,83004373 en el principal).
- Ejecucion en CUDA con BF16 o en CPU con FP32 como fallback.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio generativo ni capacidades multilingues.

## Casos de uso

- Activacion por voz en gafas inteligentes: el modelo puntua la ventana de audio mas reciente de 16 segundos y activa el asistente cuando la puntuacion supera el umbral guardado, sin necesidad de ejecutar un sistema de reconocimiento de voz completo.
- Deteccion de palabra de activacion en dispositivos con recursos limitados: al ajustar solo cuatro bloques y requerir inferencia BF16 o FP32 sobre un encoder de aproximadamente 95 M de parametros, puede ejecutarse en hardware de consumo o incluso en CPU.
- Filtrado previo en pipelines de voz: colocado delante de un ASR, evita transcribir audio que no contiene una invocacion directa, reduciendo coste computacional.
- Prototipado de interfaz manos libres: permite validar la interaccion por voz en un producto wearable antes de invertir en un sistema de activacion a medida.
- Investigacion en deteccion de habla dirigida: sirve como linea base reproducible con umbral, curva de umbral y predicciones de validacion incluidas en el repositorio.
- Analisis offline de grabaciones: al poder procesar ventanas de audio de forma independiente, permite auditar sesiones completas buscando momentos de invocacion directa.
- Evaluacion de umbrales y tasas de falsos positivos: los artefactos de validacion permiten ajustar el cutoff segun la tolerancia a falsos positivos por hora de la aplicacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos facilitados son las metricas de validacion de los dos checkpoints:

| Checkpoint | Clips de entrenamiento | Recall de validacion | FPR de validacion | Umbral guardado |
|---|---:|---:|---:|---:|
| `best.pt` | 2002 | 72,13 % | 4,17 % | 0,83004373 |
| `experiments/synthetic-expansion/best.pt` | 2512 | 70,49 % | 4,17 % | 0,77046478 |

Ambos checkpoints se seleccionaron sobre el mismo conjunto de validacion sintetico de 157 clips. El autor advierte que estas metricas no equivalen a rendimiento independiente en campo, verificacion del hablante ni falsos positivos por hora.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Como referencia, un encoder HuBERT Base de aproximadamente 95 M de parametros ocupa en torno a 380 MB en FP32 y unos 190 MB en BF16 solo en pesos, mas activaciones y pooling.
- GPUs recomendadas: no especificadas por el autor. Dado el tamano del encoder, cualquier GPU con soporte CUDA y BF16 resulta suficiente; tambien es viable una RTX 3060, RTX 4090 o superior.
- Cabe en GPU de consumo: si, por el tamano reducido del encoder y la ventana de entrada limitada. El autor no documenta valores medidos.
- Despliegue: el modelo se carga con el codigo de entrenamiento del proyecto (`github.com/Dhawal-Modi/miraworktrial`) en Python 3.12, mediante `src.model.inference.load_inference`, `prepare_window` y `predict`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo.
- Latencia y throughput: no disponibles. La demo selecciona los 16 segundos mas recientes, remuestrea a 16 kHz y rellena por la izquierda a 30 segundos; el fallback de CPU usa FP32 y sus puntuaciones pueden diferir de los resultados registrados en CUDA/BF16.

## Comparativa con modelos similares

No se han documentado en la informacion disponible modelos comparables de terceros para esta tarea concreta de deteccion de invocacion. La unica comparacion interna disponible es entre los dos checkpoints del propio proyecto:

| Modelo | Clips de entrenamiento | Recall de validacion | FPR de validacion | Umbral |
|---|---:|---:|---:|---:|
| `best.pt` (principal) | 2002 | 72,13 % | 4,17 % | 0,83004373 |
| `experiments/synthetic-expansion/best.pt` | 2512 | 70,49 % | 4,17 % | 0,77046478 |

La model card menciona que el extractor de caracteristicas difiere entre Whisper y HuBERT, lo que sugiere que existe una variante basada en Whisper en el mismo proyecto, pero no se proporcionan sus pesos, metricas ni enlace, por lo que no se puede comparar aqui.

## Limitaciones y advertencias

- Las etiquetas de entrenamiento son asistidas por ASR y no han sido verificadas completamente por humanos.
- El modelo no verifica quien habla: el positivo esperado se define como la persona que lleva las gafas dirigiendose a Mira, y las etiquetas sinteticas asumen ese supuesto.
- Los datos de entrenamiento provienen de una unica sesion de microfono real, lo que limita la generalizacion a otras voces, entornos acusticos o dispositivos.
- Las metricas reportadas no son rendimiento independiente en campo ni una tasa de falsos positivos por hora; se calcularon sobre un conjunto de validacion sintetico compartido.
- Las ventanas de entrenamiento tienen longitudes de contexto real mixtas, mientras que la demo usa un recorte de 16 segundos, lo que puede introducir desajuste entre entrenamiento e inferencia.
- Las puntuaciones en CPU con FP32 pueden diferir de las obtenidas en CUDA con BF16.
- Solo soporta ingles.
- No se asigna licencia nueva a los pesos ajustados ni a los datos de entrenamiento; la licencia del encoder subyacente depende de facebook/hubert-base-ls960, por lo que el uso comercial queda sin definir.
- No es un paquete estandar de Transformers: requiere el codigo del proyecto y conservar `run.csv` junto al checkpoint para recuperar la precision BF16.
- El enfriamiento de notificaciones es politica de la aplicacion, no forma parte de los pesos.
- No se realizo entrenamiento nuevo ni evaluacion sobre conjunto de test para esta entrega; los checkpoints no se han convertido ni reentrenado para la subida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DhawalM/mira-invocation-hubert-base
- Dataset: https://huggingface.co/datasets/DhawalM/mira-invocation-audio
- Modelo base: https://huggingface.co/facebook/hubert-base-ls960
- Codigo de entrenamiento e inferencia: https://github.com/Dhawal-Modi/miraworktrial
