# DhawalM/mira-invocation-whisper-small-en

## Resumen

Mira invocation detector — Whisper Small English es un clasificador binario de audio desarrollado por el usuario DhawalM que distingue entre una dirección directa al asistente «Mira» y una mención incidental de esa misma palabra. El modelo parte del encoder preentrenado de `openai/whisper-small.en`, al que se añaden un mecanismo de attention pooling y un clasificador reducido; el decodificador de texto de Whisper se descarta por completo, de modo que la inferencia no requiere transcripción, tokenizer ni generación de texto.

Se trata de un ajuste fino supervisado sobre un conjunto de 2.512 clips de audio etiquetados como invocación o no invocación. El checkpoint principal entrena los 12 bloques del encoder, las convoluciones, los embeddings posicionales y la normalización final, con una época de calentamiento de la cabeza clasificadora, otra de calentamiento del encoder, decaimiento del learning rate por capas y planificación coseno, todo en precisión BF16. El autor incluye además un baseline previo que solo ajustaba los cuatro bloques superiores del encoder.

Su relevancia es acotada pero concreta: ejemplifica el patrón de reutilizar un encoder de voz preentrenado como extractor de características para detección de palabra de activación (keyword spotting), un caso de uso en el que normalmente se recurre a arquitecturas específicas como openWakeWord o a modelos de wake word comerciales. El modelo se publica como material de traspaso de un proyecto (handoff), con 0 descargas y 0 likes, sin licencia asignada y con métricas obtenidas sobre un conjunto de validación sintético, por lo que debe considerarse un artefacto de investigación y no un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder de Whisper small.en (12 bloques) + attention pooling + clasificador binario; decodificador de texto descartado |
| Parametros totales | No disponible para el checkpoint. El modelo base `openai/whisper-small.en` tiene aproximadamente 244 M de parametros en total, de los que aqui se conserva unicamente el encoder |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No es contexto de tokens: procesa una ventana de audio de 16 s a 16 kHz, con left-padding hasta 30 s en la demo en vivo |
| Tipos de cuantizacion | No disponible. Los checkpoints son archivos PyTorch propios; se documenta BF16 en CUDA y FP32 como fallback en CPU, sin cuantizacion publicada |
| Idiomas soportados | en (ingles) |
| Licencia | No disponible. El autor no asigna licencia nueva a los pesos ajustados ni a los datos de entrenamiento y remite a la licencia del repositorio upstream `openai/whisper-small.en` |
| Formato de pesos | `.pt` (checkpoints PyTorch especificos del proyecto, no paquetes `from_pretrained` de Transformers), acompanados de `run.csv`, `manifest.csv`, historial de epocas y curvas de umbral |

## Arquitectura y entrenamiento

La arquitectura reutiliza el encoder de Whisper small.en como extractor de caracteristicas acusticas. Sobre sus salidas se aplica un pooling por atencion y una cabeza clasificadora que produce una puntuacion escalar; el resultado se compara con un umbral guardado en el propio checkpoint (0,81757444 en el modelo principal) para decidir entre invocacion y no invocacion. El decodificador de texto se elimina, por lo que el modelo no transcribe ni genera lenguaje. La extraccion de caracteristicas se restaura desde el checkpoint y difiere entre Whisper y HuBERT, un detalle relevante si se intenta reutilizar el codigo con otro encoder.

El entrenamiento se realizo en BF16 con una estrategia en dos fases: una epoca de calentamiento de la cabeza clasificadora y una epoca de calentamiento del encoder, seguidas de ajuste completo de los 12 bloques, convoluciones, posiciones y normalizacion final, con decaimiento del learning rate por capas y planificacion coseno. El checkpoint principal se entreno sobre 2.512 clips; el baseline `baselines/top4/best.pt` uso los mismos clips pero solo ajusto los cuatro bloques superiores. Los datos reales proceden de una unica sesion de microfono y constan de 167 derivados con etiquetas asistidas por ASR, no verificadas por completo de forma humana. La validacion se hizo con un conjunto sintetico de 157 clips compartido por ambos checkpoints, que ademas sirvio para seleccionar la mejor epoca y el umbral.

## Capacidades

- Clasificacion binaria de audio: decide si un fragmento contiene una invocacion directa a «Mira» o una mencion incidental.
- Deteccion de palabra de activacion (wake word) sin transcripcion: no necesita tokenizer, decodificador de texto ni ASR para puntuar una ventana.
- Trabajo con ventanas de audio concretas: selecciona los ultimos 16 segundos de audio mono, remuestrea a 16 kHz y aplica left-padding hasta 30 s.
- Ejecucion en GPU y en CPU: usa BF16 en CUDA y FP32 como fallback en CPU.
- Comparacion interna de variantes: incluye un baseline que solo ajusta los cuatro bloques superiores del encoder, util para estudiar el efecto del ajuste completo.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: es exclusivamente un clasificador de audio en ingles.
- No dispone de capacidades de vision, audio generativo ni modo de razonamiento.

## Casos de uso

- Palabra de activacion en gafas inteligentes: el modelo esta disenado para el caso en que la persona que lleva el dispositivo se dirige directamente a Mira; se integraria en el bucle de captura de audio del wearable para decidir cuando despertar al asistente.
- Prefiltro antes del ASR: al ser un clasificador puramente acustico sin decodificacion, permite descartar audio irrelevante y evitar el coste de transcribir con un modelo de voz completo.
- Distincion de menciones incidentales: util en entornos donde la palabra «Mira» aparece en conversaciones sin que nadie se dirija al asistente, evitando activaciones no deseadas.
- Investigacion en keyword spotting: sirve como punto de partida reproducible para comparar attention pooling frente a ajuste parcial de capas, usando el baseline de cuatro bloques incluido en el repositorio.
- Preanotacion de corpus de audio: puede generar puntuaciones de invocacion para acelerar el etiquetado humano de nuevos clips, siempre que se revise el umbral y el FPR resultante.
- Despliegue en dispositivos con recursos limitados: al conservar solo el encoder de un modelo small, es viable ejecutarlo en CPU, lo que permite prototipos locales sin enviar audio a la nube.
- Evaluacion de umbrales en politica de aplicacion: el umbral guardado puede combinarse con un cooldown de notificaciones definido por la aplicacion (el cooldown no forma parte de los pesos).

## Benchmarks y rendimiento

| Metrica | `best.pt` (run principal) | `baselines/top4/best.pt` |
|---|---|---|
| Clips de entrenamiento | 2512 | 2512 |
| Recall de validacion | 96,72 % | 95,08 % |
| FPR de validacion | 4,17 % | 4,17 % |
| Umbral guardado | 0,81757444 | 0,83440691 |

Estas cifras son las unicas publicadas. El autor advierte expresamente que no constituyen rendimiento independiente de campo, no incluyen verificacion del hablante y no equivalen a una tasa de falsas activaciones por hora. No se han publicado resultados en los benchmarks habituales de la categoria (MMLU, HumanEval, GSM8K, etc.), que por otra parte no aplican a un clasificador de audio.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Como referencia, conservar solo el encoder de un modelo small (unas 88 M de parametros estimadas) supone aproximadamente 0,35 GB en FP32 y la mitad en BF16, aunque el autor no publica cifras de memoria.
- GPU recomendadas: no especificadas. Dado el tamano, cualquier GPU con soporte BF16 (por ejemplo, RTX 3060 o superior) deberia bastar; no se requiere A100 ni H100.
- Cabe en GPU de consumo: si, segun el tamano del encoder, aunque no hay confirmacion oficial en la model card.
- CPU: soportada como fallback en FP32, con la advertencia de que las puntuaciones pueden diferir de las obtenidas en CUDA/BF16.
- Opciones de despliegue: no se contemplan vLLM, TGI, llama.cpp ni Ollama, ya que no es un modelo generativo. La ruta documentada es cargar los checkpoints con el codigo del repositorio `Dhawal-Modi/miraworktrial` (`load_inference`, `predict`, `prepare_window`) bajo Python 3.12. No se documenta exportacion a ONNX ni TorchScript.
- Requisito operativo: hay que preservar `run.csv` junto a cada checkpoint para que el cargador recupere la precision BF16 del entrenamiento.
- Latencia y throughput: no disponibles. No se publican tiempos de inferencia ni numero de ventanas procesadas por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mira invocation detector — Whisper Small English | No disponible (encoder de un modelo small, decodificador descartado) | Ventana de audio de 16 s a 16 kHz (padding a 30 s) | Recall 96,72 %, FPR 4,17 % sobre 157 clips sinteticos | No disponible; se remite a la licencia de `openai/whisper-small.en` | Repositorio HuggingFace con 0 descargas y 0 likes |
| `openai/whisper-small.en` (modelo base) | Aproximadamente 244 M | Audio de hasta 30 s, salida de texto | Tareas de reconocimiento de voz; no comparable directamente con esta tarea | Ver repositorio upstream | Ampliamente disponible y ampliamente utilizado |
| Otras alternativas de deteccion de palabra de activacion (openWakeWord, Porcupine, clasificadores basados en HuBERT) | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | No disponible |

La model card menciona HuBERT de forma tangencial, al indicar que la extraccion de caracteristicas difiere entre Whisper y HuBERT, pero no ofrece comparacion cuantitativa con ningun sistema alternativo de deteccion de invocacion.

## Limitaciones y advertencias

- El modelo no verifica quien habla. Las etiquetas sinteticas asumen que la invocacion la realiza la persona que lleva el dispositivo, de modo que una mencion de «Mira» por parte de otra persona puede clasificarse como positiva.
- Los datos reales son muy limitados: 167 derivados de una unica sesion de microfono, con etiquetas asistidas por ASR y no verificadas por completo de forma humana.
- Las metricas de validacion no son rendimiento independiente de campo, no incluyen verificacion del portador y no se expresan como falsas activaciones por hora.
- Posible sesgo de seleccion: ambos checkpoints usan el mismo conjunto de validacion de 157 clips sinteticos, tanto para elegir la mejor epoca como para fijar el umbral.
- Desajuste entre entrenamiento e inferencia: las ventanas de entrenamiento almacenadas presentan longitudes de contexto reales mixtas, mientras que la demo recorta a 16 segundos.
- El modelo solo esta entrenado y evaluado en ingles.
- Las puntuaciones en CPU con FP32 pueden diferir de las registradas en CUDA con BF16, por lo que el umbral guardado podria no trasladarse sin recalibracion.
- Los checkpoints no son paquetes estandar de Transformers: requieren el codigo del proyecto y Python 3.12, y el cargador necesita el `run.csv` junto al checkpoint para recuperar la precision BF16.
- Restricciones de licencia: el autor no asigna licencia nueva a los pesos ajustados ni a los datos, y remite a la licencia del modelo base. Esto deja el uso comercial en una situacion juridica poco clara y exige revisar el repositorio upstream antes de cualquier despliegue.
- El campo `inference: false` de la model card indica que no hay widget de inferencia en HuggingFace.
- El cooldown de notificaciones es politica de la aplicacion, no una caracteristica de los pesos.
- El modelo no ha sido validado por la comunidad: 0 descargas y 0 likes, sin evaluacion de terceros.
- Riesgo de alucinacion: no aplica en el sentido generativo, ya que el modelo no produce texto, pero si existe riesgo de falsos positivos y falsos negativos en la clasificacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DhawalM/mira-invocation-whisper-small-en
- Dataset de audio de invocacion: https://huggingface.co/datasets/DhawalM/mira-invocation-audio
- Codigo de entrenamiento e inferencia: https://github.com/Dhawal-Modi/miraworktrial
- Modelo base: https://huggingface.co/openai/whisper-small.en
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo: unicamente enlaces promocionales de Google Gemini sin relacion con el artefacto.
