# HAizelf/whisper-tiny-minds14-en

## Resumen

whisper-tiny-minds14-en es un ajuste fino (fine-tuning) completo del modelo openai/whisper-tiny, desarrollado por el usuario HAizelf, para reconocimiento automatico del habla (ASR) en ingles. El modelo parte de la arquitectura encoder-decoder transformer de Whisper, con 37,7 millones de parametros, y se ha entrenado especificamente sobre el subconjunto en-US del dataset MINDS-14 de PolyAI, un corpus de grabaciones de dominio telefonico orientadas a intenciones de servicio al cliente.

El objetivo del ajuste es adaptar un modelo ASR generico de muy bajo coste computacional a un dominio concreto (audio telefonico de asistencia), manteniendo el tamano minimo de la familia Whisper. Esto lo hace relevante para prototipado rapido, despliegue en CPU o en GPUs de gama baja, y como ejemplo reproducible de fine-tuning siguiendo la Unidad 5 del curso de audio de Hugging Face.

La relevancia practica es limitada pero clara: se trata de un modelo de demostracion, con 0 descargas y 0 likes en el momento de la consulta, entrenado sobre solo 450 ejemplos y evaluado sobre 113. Su WER normalizado declarado es de 0,2733 sobre el conjunto de evaluacion, un valor alto que refleja tanto la dificultad del dominio como el escaso volumen de datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 37.760.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 30 segundos de audio por ventana (ventana nativa de Whisper) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de openai/whisper-tiny: un transformer encoder-decoder con atención estándar, diseñado para transcribir ventanas de audio de 30 segundos representadas como espectrogramas mel. No incorpora innovaciones arquitectónicas propias; es un ajuste fino completo de todos los pesos del modelo base.

El entrenamiento se realizó sobre los primeros 450 ejemplos del split de entrenamiento de PolyAI/minds14 en configuración en-US, con una tasa de aprendizaje de 3e-5, scheduler constante con 50 pasos de warm-up, batch de 16, precisión mixta fp16 (Native AMP), optimizador AdamW (fused) con betas (0,9; 0,999) y epsilon 1e-8, semilla 42 y 500 pasos totales. La evaluación se hizo sobre los 113 ejemplos restantes del mismo split (filas 450 en adelante), remuestreados a 16 kHz y decodificados con `language="english"` y `task="transcribe"`. Los pesos subidos corresponden al mejor checkpoint (paso 100 de 500), reevaluado antes de la subida. No se documenta el uso de RLHF, DPO ni ningún otro ajuste por preferencias.

## Capacidades

- Reconocimiento automatico del habla (transcripcion) en ingles sobre audio de dominio telefonico y de servicio al cliente.
- Transcripcion de audio remuestreado a 16 kHz con decodificacion forzada a ingles y tarea de transcripcion.
- Funcionamiento como modelo de demostracion reproducible del fine-tuning de Whisper sobre MINDS-14.
- Inferencia de bajo coste: 37,7 millones de parametros permiten ejecucion en CPU y en GPUs de gama baja.
- No dispone de soporte documentado de tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio mas alla de ASR.
- Capacidad multilingue limitada al ingles; no se declara soporte para otros idiomas.

## Casos de uso

- Prototipado rapido de ASR telefonico: permite validar un pipeline de transcripcion sobre audio de call center en ingles con un modelo de 0,2 GB y sin necesidad de GPU dedicada, antes de invertir en modelos mayores.
- Transcripcion de bajo consumo en dispositivos: con 37,7 millones de parametros, puede ejecutarse en CPU o en GPUs integradas para tareas de dictado o subtitulado en ingles con requisitos de latencia moderados.
- Base para fine-tuning adicional: sirve como punto de partida para adaptar Whisper-tiny a otros dominios o subconjuntos de MINDS-14, dado su reducido coste de entrenamiento.
- Clasificacion de intenciones en asistencia al cliente: combinado con un clasificador posterior, la transcripcion del audio telefonico permite inferir la intencion del usuario en flujos de atencion automatizada.
- Material docente y reproducibilidad: util como ejemplo practico de la Unidad 5 del curso de audio de Hugging Face, con hiperparametros y resultados documentados.
- Evaluacion comparativa de tecnicas de ASR: permite medir el impacto de cambios en preprocesado, remuestreo o decodificacion sobre un conjunto de evaluacion pequeno y controlado (113 ejemplos).

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados por un tercero):

| Modelo | Dataset | Split | Metrica | Valor |
|---|---|---|---|---|
| whisper-tiny-minds14-en | MINDS-14 (en-US) | train[450:] (113 ejemplos) | WER normalizado | 0,2733 |
| whisper-tiny-minds14-en | MINDS-14 (en-US) | train[450:] (113 ejemplos) | WER ortografico | 0,2690 |
| whisper-tiny-minds14-en | MINDS-14 (en-US) | train[450:] (113 ejemplos) | Loss | 0,5534 |

Evolucion del entrenamiento documentada por el autor:

| Paso | Epoca | Validation loss | WER | WER ortografico |
|---|---|---|---|---|
| 50 | 1,79 | 0,5138 | 0,3099 | 0,3048 |
| 100 | 3,57 | 0,5534 | 0,2733 | 0,2690 |
| 150 | 5,36 | 0,6489 | 0,2946 | 0,2906 |
| 200 | 7,14 | 0,6207 | 0,3117 | 0,3066 |
| 250 | 8,93 | 0,6687 | 0,3093 | 0,3029 |
| 300 | 10,71 | 0,6554 | 0,2934 | 0,2887 |
| 350 | 12,50 | 0,6896 | 0,3028 | 0,2973 |
| 400 | 14,29 | 0,6978 | 0,3064 | 0,3004 |
| 450 | 16,07 | 0,7098 | 0,3087 | 0,3035 |
| 500 | 17,86 | 0,7133 | 0,3064 | 0,3041 |

No se han publicado resultados de benchmarks adicionales (por ejemplo, sobre LibriSpeech, Common Voice u otros conjuntos) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 37,7 millones de parametros (unos 151 MB de pesos), mas el overhead de activaciones y del procesador de audio; en la practica cabe holgadamente en cualquier GPU con 2 GB o mas.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Para mayor throughput, cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es mas que suficiente.
- Cabe en GPU consumer: si, en cualquier GPU consumer con al menos 2 GB de VRAM, e incluso en CPUs modernas.
- Opciones de despliegue: transformers (pipeline de automatic-speech-recognition), y en general los runners compatibles con modelos Whisper de la libreria transformers; no se han publicado variantes GGUF ni integraciones especificas con vLLM, llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | WER en MINDS-14 en-US |
|---|---|---|---|---|---|
| whisper-tiny-minds14-en | 37,7 M | 30 s por ventana | en | apache-2.0 | 0,2733 (declarado, no verificado) |
| openai/whisper-tiny | 37,7 M | 30 s por ventana | multilingue | apache-2.0 | no disponible en la informacion |
| openai/whisper-base | 74 M | 30 s por ventana | multilingue | apache-2.0 | no disponible en la informacion |
| openai/whisper-small | 244 M | 30 s por ventana | multilingue | apache-2.0 | no disponible en la informacion |

No se dispone de resultados comparativos de WER sobre MINDS-14 en-US para los modelos base de OpenAI en la informacion proporcionada; por tanto, no es posible cuantificar la mejora o el deterioro respecto a ellos.

## Limitaciones y advertencias

- Volumen de entrenamiento muy reducido: solo 450 ejemplos de entrenamiento y 113 de evaluacion, lo que limita la generalizacion y hace que el WER de 0,2733 sea alto en terminos absolutos.
- Sobreajuste evidente: la perdida de validacion empeora a partir del paso 100 (de 0,5138 a 0,7133 en el paso 500), y el checkpoint subido es precisamente el del paso 100.
- Dominio restringido: entrenado sobre audio telefonico de MINDS-14 en-US; el rendimiento fuera de ese dominio (audio limpio, otros acentos, otras condiciones acusticas) no esta documentado y probablemente sea peor.
- Solo ingles: no soporta otros idiomas ni cambios de idioma en la decodificacion.
- Riesgo de alusiones y errores de transcripcion: como todo modelo ASR, puede producir transcripciones incorrectas, especialmente con ruido, acentos no vistos o vocabulario especifico no representado en el corpus.
- Sesgos: no documentados por el autor; el corpus MINDS-14 tiene una composicion demografica y geografica concreta que puede introducir sesgos de acento y de dominio.
- Licencia apache-2.0: permite uso comercial, pero el autor no documenta condiciones adicionales ni garantias; el modelo se distribuye tal cual.
- No verificado: los resultados de benchmark son declarados por el autor y no han sido verificados de forma independiente; el model-index marca `verified: false`.
- Modelo de demostracion: con 0 descargas y 0 likes, no hay evidencia de uso en produccion ni de validacion por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HAizelf/whisper-tiny-minds14-en
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Dataset MINDS-14: https://huggingface.co/datasets/PolyAI/minds14
- Curso de audio de Hugging Face (Unidad 5, referencia del entrenamiento): https://huggingface.co/learn/audio-course
