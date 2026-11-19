# akifkulll/whisper-small-uzbek-usc25h

## Resumen

Whisper-small-uzbek-usc25h es un ajuste fino (fine-tuning) del modelo de reconocimiento automático del habla `openai/whisper-small` para uzbeko, desarrollado por el usuario akifkulll en el marco de un proyecto de curso (COE025 Project 3). El modelo parte de la revisión `973afd24965f72e36ca33b3055d56a652f456b4d` del checkpoint original de OpenAI y se ha entrenado sobre un subconjunto de 25 horas del Uzbek Speech Corpus (USC), en escritura latina y con separación de hablantes entre particiones para evitar fugas de datos.

Se trata de un transformer encoder-decoder de tipo Whisper con 241.734.912 parámetros, una ventana de audio de 30 segundos por inferencia y licencia Apache 2.0. Su relevancia es acotada: cubre una lengua de bajos recursos (uzbeko) con una receta de entrenamiento reproducible y publicada, pero el propio autor solo reporta resultados en el conjunto de desarrollo y deja el test sin evaluar, además de no incluir comparación con otros sistemas.

El modelo es útil como base para experimentos de ASR en uzbeko, para prototipos de transcripción de habla leída y como punto de partida para ajustes posteriores con más datos o con audio espontáneo. No está pensado, con los datos publicados, como solución de producción sin una evaluación adicional sobre el dominio objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), con encoder de audio y decoder autorregresivo |
| Parametros totales | 241.734.912 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | ventana de audio de 30 s por inferencia; clips de más de 30 s no se usaron en entrenamiento |
| Tipos de cuantizacion | no disponible (el repo solo publica pesos en safetensors; no se documentan variantes GGUF, int8 ni int4) |
| Idiomas soportados | uzbeko (código `uz`), en escritura latina |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`); tamaño del repo 1.0 GB |

## Arquitectura y entrenamiento

La arquitectura es la de `openai/whisper-small`: un encoder que procesa espectrogramas log-Mel de 80 canales sobre ventanas de 30 segundos y un decoder transformer que genera tokens de texto de forma autorregresiva, con tokens especiales de idioma y tarea. No hay modificaciones estructurales respecto al modelo base; se trata de un fine-tuning completo sobre el checkpoint preentrenado.

El entrenamiento se realizó sobre 23,922 horas efectivas (27.144 clips) de la partición de train de USC, con hablantes disjuntos respecto a dev y test (semilla 42). Hiperparámetros: learning rate 1e-05, warmup de 500 pasos, 4.000 pasos máximos, batch efectivo de 32 (per_device_batch_size 32, grad_accum 1), precisión bf16, scheduler lineal, sin SpecAugment y evaluación cada 500 pasos. El checkpoint seleccionado fue el 3.000, el de mejor WER en dev. El hardware empleado fue una NVIDIA A100-SXM4-40GB. No se documenta el uso de RLHF, DPO ni ninguna técnica de alineación adicional, algo esperable en una tarea de ASR.

## Capacidades

- Transcripción de voz a texto en uzbeko (escritura latina) para clips de hasta 30 segundos.
- Reconocimiento de habla leída procedente de corpus, que es el dominio de entrenamiento.
- Generación de transcripciones con normalización de texto aplicada en la evaluación (minúsculas, sin puntuación, apóstrofos conservados).
- Soporte de los tokens especiales de idioma y tarea de Whisper (`language="uzbek"`, `task="transcribe"`), tal como muestra el ejemplo de uso de la model card.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio más allá de ASR ni modo de pensamiento.
- No se documenta capacidad multilingüe efectiva: el ajuste se ha hecho solo sobre uzbeko y no se reportan resultados en otras lenguas.

## Casos de uso

- Transcripción de entrevistas y grabaciones de campo en uzbeko: el modelo procesa clips de hasta 30 segundos, por lo que encaja en pipelines que segmentan audio largo en fragmentos y concatenan las salidas; su ventana y su entrenamiento en habla leída lo hacen adecuado para entrevistas con dicción clara.
- Subtitulado de material audiovisual en uzbeko: con un segmentador previo (VAD) que corte en tramos de menos de 30 segundos, se puede generar una pista de subtítulos base que después se revise manualmente, dado el WER reportado del 33,85 % en dev.
- Generación de transcripciones para corpus lingüísticos: al estar entrenado sobre USC, es coherente con tareas de anotación y ampliación de corpus en uzbeko, siempre con revisión humana por la tasa de error.
- Prototipado de asistentes de voz en uzbeko: sirve como componente ASR inicial en una demo o prueba de concepto, con la ventaja de su licencia Apache 2.0 y su tamaño manejable (241 M de parámetros).
- Investigación en ASR de bajos recursos: es un punto de partida reproducible para experimentos de ajuste con más horas, otros dominios o técnicas de aumento de datos, ya que el autor publica la receta completa y los splits.
- Búsqueda y indexación de archivos de audio: transcribir un archivo de audio a texto para permitir búsqueda por palabras clave, aceptando la tasa de error actual y aplicando corrección posterior o búsqueda tolerante a errores.
- Evaluación comparativa de checkpoints de Whisper para uzbeko: al ser un fine-tuning documentado con hiperparámetros y hardware, sirve como referencia en experimentos internos frente a otros ajustes.

## Benchmarks y rendimiento

| Conjunto | WER | CER |
|---|---|---|
| USC dev (durante entrenamiento) | 33,85 % | no disponible |
| USC test | no disponible (el autor indica "n/a") | no disponible |

No se han publicado resultados de benchmarks en la informacion disponible más allá del WER en dev. No hay comparación con otros modelos ni métricas en test.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 1 GB para los pesos (241,7 M de parámetros) más el overhead de activaciones y del procesador de audio; en la práctica, menos de 2 GB en fp32 y aproximadamente 0,5-1 GB en fp16/bf16.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; el autor entrenó en una NVIDIA A100-SXM4-40GB, pero para inferencia no se requiere ese hardware.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o incluso en iGPU con suficiente memoria compartida; también es viable en CPU para volúmenes moderados.
- Opciones de despliegue: `transformers` con `pipeline("automatic-speech-recognition")` es la vía documentada por el autor. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y al no publicarse pesos GGUF no hay una ruta directa a llama.cpp sin conversión previa.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| akifkulll/whisper-small-uzbek-usc25h | 241,7 M | 30 s | uzbeko | Apache 2.0 | Hugging Face, safetensors |
| openai/whisper-small (base) | 241,7 M | 30 s | multilingüe (incluye uzbeko) | Apache 2.0 | Hugging Face, safetensors |
| openai/whisper-medium | 769 M | 30 s | multilingüe | Apache 2.0 | Hugging Face, safetensors |
| openai/whisper-large-v3 | 1.550 M | 30 s | multilingüe | Apache 2.0 | Hugging Face, safetensors |

La comparación con `whisper-small` original es la más directa: mismo tamaño y misma arquitectura, con la diferencia de que este ajuste está especializado en uzbeko. No se dispone de datos de WER del modelo base en USC ni de otros ajustes en uzbeko en la información proporcionada, por lo que no es posible cuantificar la mejora. Los modelos `medium` y `large-v3` ofrecen mayor capacidad y cobertura multilingüe, pero con coste de inferencia notablemente superior y sin evaluación específica en uzbeko en esta ficha.

## Limitaciones y advertencias

- Entrenado y evaluado únicamente sobre habla leída de USC; el rendimiento en habla espontánea, acentos no representados, ruido de fondo o audio telefónico no está caracterizado.
- No se han usado clips de más de 30 segundos en entrenamiento; el audio más largo debe segmentarse antes de la inferencia.
- El único resultado publicado es un WER del 33,85 % en dev; el conjunto de test queda sin evaluar, lo que impide estimar la generalización real.
- Riesgo de alucinación y de transcripciones inventadas, inherente a los modelos generativos de ASR, especialmente con audio ruidoso o silencios largos.
- Sesgos desconocidos: no se documenta la composición demográfica del corpus ni el reparto de género, edad o variantes dialectales, por lo que no se puede evaluar el sesgo por subgrupo.
- Cobertura limitada al uzbeko en escritura latina; no se reporta comportamiento en cirílico ni en otras lenguas, aunque el tokenizador de Whisper sea multilingüe.
- Licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantías y con métricas insuficientes para desplegarlo en producción sin una evaluación propia en el dominio objetivo.
- El proyecto tiene 0 descargas y 0 likes en el momento de la consulta, y proviene de un proyecto de curso: no hay evidencia de mantenimiento ni de soporte.
- No se publican pesos cuantizados; cualquier despliegue en formatos ligeros requiere conversión y validación propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/akifkulll/whisper-small-uzbek-usc25h
- Modelo base: https://huggingface.co/openai/whisper-small
- Dataset Uzbek Speech Corpus: https://huggingface.co/datasets/issai/Uzbek_Speech_Corpus
- Código, splits y evaluación: https://github.com/ata-sesli/nlp-project-3
