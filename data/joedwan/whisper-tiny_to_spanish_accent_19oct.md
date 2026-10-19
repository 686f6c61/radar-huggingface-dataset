# JoeDwan/whisper-tiny_to_spanish_accent_19oct

## Resumen

JoeDwan/whisper-tiny_to_spanish_accent_19oct es un ajuste fino (fine-tuning) de openai/whisper-tiny, el modelo de reconocimiento automático del habla (ASR) de OpenAI, entrenado sobre un dataset denominado "Spanish_english". Lo publica el usuario JoeDwan en HuggingFace el 19 de octubre de 2026, con licencia Apache 2.0 y pesos en safetensors. El objetivo declarado en el nombre del repositorio es adaptar el modelo al acento español, aunque la model card no documenta ni la composición del dataset ni los usos previstos (se limita a "More information needed").

El modelo conserva la arquitectura completa de Whisper tiny: un transformer encoder-decoder de 37.760.640 parámetros totales (unos 38 M), pensado para transcripción de audio en ventanas fijas de 30 segundos. No es un modelo de propósito general ni un LLM: solo acepta audio como entrada y produce texto. Su relevancia es acotada y experimental: se trata de un checkpoint de investigación con 0 descargas y 0 likes en el momento de redactar esta ficha, sin validación externa y con un WER declarado de 13,08 sobre el split de test del dataset del autor, valor que no está verificado ("verified: false" en el model-index).

En la práctica, resulta útil como ejemplo de fine-tuning ligero de Whisper (2000 pasos, learning rate 1e-5, batch de 4) y como punto de partida para experimentos de adaptación de acento en español con recursos mínimos. Cualquier uso en producción requeriría una evaluación propia: el modelo declara únicamente el idioma "en" en sus metadatos y su rendimiento real en castellano no está medido con un benchmark público independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper): 4 capas de encoder y 4 de decoder, d_model 384, 6 cabezas de atencion (arquitectura heredada de openai/whisper-tiny) |
| Parametros totales | 37.760.640 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | ventana de audio fija de 30 s por inferencia; 448 posiciones maximas en el decodificador |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en safetensors; no se distribuyen variantes cuantizadas) |
| Idiomas soportados | en (unico idioma declarado en los metadatos); el ajuste se realizo sobre un dataset llamado "Spanish_english" |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tamano del repo: 0,3 GB, incluye checkpoints intermedios del Trainer) |

## Arquitectura y entrenamiento

Arquitectura Whisper estandar en su variante tiny: encoder-decoder transformer con normalizacion previa, embeddings posicionales sinusoidales, activacion GELU y espectrograma Mel de 80 canales como entrada. El encoder procesa la ventana de 30 segundos y el decoder genera tokens de forma autorregresiva, con tokens especiales para deteccion de idioma, marcas de tiempo y cambio de tarea. No incorpora innovaciones propias: el autor no modifica la arquitectura del modelo base, solo los pesos.

El entrenamiento se realizo con el Trainer de HuggingFace y estos hiperparametros declarados: learning rate 1e-5, batch de entrenamiento 4, batch de evaluacion 1, semilla 42, optimizador AdamW_TORCH_FUSED (beta1 0,9, beta2 0,999, epsilon 1e-8), scheduler linear con 500 pasos de warmup y 2000 pasos totales (aproximadamente 3,9 epocas segun la tabla de resultados). No se documenta el numero de tokens ni de horas de audio, ni la composicion del dataset "Spanish_english", ni si hubo RLHF/DPO (no procede en un modelo ASR). Entorno declarado: Transformers 5.21.0.dev0, PyTorch 2.11.0+cu130, Datasets 5.1.0 y Tokenizers 0.23.2.

## Capacidades

- Transcripcion de voz a texto en ingles (idioma declarado) con posible adaptacion a acentos espanoles, segun la intencion del autor.
- Deteccion automatica de idioma mediante los tokens especiales de Whisper, heredada del modelo base.
- Generacion de marcas de tiempo (timestamps) a nivel de segmento o de palabra, segun la configuracion de decodificacion.
- Traduccion de audio a texto en ingles (tarea "translate" de Whisper), supeditada al idioma de entrada.
- Procesamiento de audio en ventanas de 30 segundos; para audios mas largos es necesario trocear y recomponer.
- No soporta tool calling, function calling ni razonamiento multi-paso: no es un modelo de lenguaje conversacional.
- No tiene modo "thinking", vision ni audio generativo; la salida es exclusivamente texto transcrito.

## Casos de uso

- Prototipado de transcripcion de entrevistas con acento castellano: el modelo permite montar un pipeline rapido con `transformers.pipeline("automatic-speech-recognition")` y validar si el ajuste mejora respecto a whisper-tiny original antes de invertir en un modelo mayor.
- Base para experimentos academicos de adaptacion de acento: sirve como referencia de bajo coste (38 M de parametros) para comparar tecnicas de fine-tuning con pocos datos frente a whisper-base o whisper-small.
- Transcripcion en dispositivos con recursos muy limitados: con 38 M de parametros y pesos de aproximadamente 150 MB en fp32 (75 MB en fp16), puede ejecutarse en CPU o en GPUs integradas para notas de voz cortas.
- Generacion de subtitulos en ingles para contenido con hablantes espanoles: usando las marcas de tiempo de Whisper sobre fragmentos de 30 s, util en herramientas internas de subtitulado no critico.
- Evaluacion comparativa de checkpoints: la tabla de entrenamiento (pasos 1000 y 2000) permite analizar el efecto del sobreajuste y elegir el punto de control optimo en un estudio de caso.
- Filtrado y etiquetado de audio a pequeña escala: transcripcion masiva de clips cortos en pipelines por lotes donde el coste por hora de audio es el factor determinante.
- Docencia y demostraciones de ASR: ejemplo reproducible de fine-tuning de Whisper con hiperparametros documentados, util para talleres practicos.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index y en la tabla de entrenamiento (no verificados por un tercero; "verified: false"):

| Metrica | Dataset / split | Valor | Contexto |
|---|---|---|---|
| WER | Spanish English, test | 13,0846 % | Resultado final declarado en el model-index |
| WER | Conjunto de evaluacion | 12,5871 % | Checkpoint del paso 1000 (epoca 1,95) |
| WER | Conjunto de evaluacion | 13,0846 % | Checkpoint del paso 2000 (epoca 3,89) |
| Validation loss | Conjunto de evaluacion | 0,2311 | Paso 1000 |
| Validation loss | Conjunto de evaluacion | 0,2326 | Paso 2000 |
| Training loss | Entrenamiento | 0,1400 / 0,0276 | Pasos 1000 y 2000 respectivamente |

No se han publicado resultados de benchmarks en la informacion disponible para comparar con otras variantes de Whisper (MMLU, HumanEval o GSM8K no aplican a un modelo ASR).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,15 GB en fp32 y 0,08 GB en fp16 para los pesos; con activaciones y buffers de audio, menos de 1 GB en cualquier configuracion practica.
- GPU recomendadas: ninguna en particular; una RTX 4090 o una A100 estan sobredimensionadas para 38 M de parametros. Cualquier GPU con 2 GB de VRAM es suficiente.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU de consumo de los ultimos diez anos, e incluso en CPU. Se puede ejecutar en tiempo real o mas rapido que tiempo real en una CPU moderna, aunque no se publican medidas de latencia o throughput.
- Opciones de despliegue: pipeline de Transformers (`pipeline("automatic-speech-recognition")`), conversion a CTranslate2 para faster-whisper, exportacion a ggml/GGUF para whisper.cpp, y despliegue gestionado con Text Generation Inference no aplica (no es un modelo de texto). vLLM tiene soporte experimental de Whisper, sujeto a la version.
- Latencia y throughput: no disponibles. La ventana fija de 30 s implica que clips cortos se rellenan hasta esa duracion, lo que penaliza la latencia en audios muy breves.
- Nota de reproducibilidad: las versiones declaradas (Transformers 5.21.0.dev0, PyTorch 2.11.0+cu130) son versiones de desarrollo y pueden no estar disponibles o comportarse de forma distinta en otras instalaciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | WER en espanol | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JoeDwan/whisper-tiny_to_spanish_accent_19oct | 37,8 M | 30 s | 13,08 % (dataset propio, no verificado) | apache-2.0 | HuggingFace, 0 descargas |
| openai/whisper-tiny | 37,8 M | 30 s | no disponible | apache-2.0 (segun model card en HuggingFace) | HuggingFace, ampliamente utilizado |
| openai/whisper-base | 74 M (aprox.) | 30 s | no disponible | apache-2.0 (segun model card en HuggingFace) | HuggingFace |
| openai/whisper-small | 244 M (aprox.) | 30 s | no disponible | apache-2.0 (segun model card en HuggingFace) | HuggingFace |

Los tamanos de whisper-base y whisper-small son los de la familia Whisper publicada por OpenAI; el WER en espanol de las alternativas no se incluye porque no se ha consultado en fuentes proporcionadas. La comparacion de rendimiento real entre este checkpoint y whisper-tiny original no puede establecerse sin ejecutar ambos sobre el mismo conjunto de evaluacion.

## Limitaciones y advertencias

- Model card practicamente vacia: las secciones de descripcion, usos previstos, limitaciones y datos de entrenamiento dicen "More information needed". No hay documentacion sobre el dataset "Spanish_english" (numero de horas, procedencia, hablantes, acentos ni calidad de las transcripciones).
- Idioma declarado "en" en los metadatos, pese a que el nombre del modelo sugiere una adaptacion al espanol. Un pipeline que filtre por idioma o que fuerce el token de idioma puede comportarse de forma inesperada; conviene fijar explicitamente `language="es"` o `language="en"` y evaluar ambos casos.
- Senales de sobreajuste: entre el paso 1000 y el 2000 la loss de validacion sube de 0,2311 a 0,2326 y el WER empeora de 12,5871 a 13,0846. El checkpoint del paso 1000 es probablemente mejor que el final, pero no se distribuye como revision independiente.
- WER de 13,08 % es alto para produccion en transcripcion de uso general; es un valor ademas medido por el propio autor y marcado como no verificado.
- Riesgo de alucinacion tipico de Whisper: en silencios, ruido o musica el modelo puede generar texto plausible no presente en el audio, con especial incidencia en modelos pequenos.
- Limitacion estructural de 30 segundos por inferencia: no hay streaming nativo; los audios largos requieren troceado y pueden perder contexto entre fragmentos.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; el modelo se distribuye sin validacion de la comunidad (0 descargas, 0 likes al redactar esta ficha).
- Entorno de entrenamiento con versiones de desarrollo (Transformers 5.21.0.dev0, PyTorch 2.11.0+cu130): pueden aparecer incompatibilidades al cargar los checkpoints del Trainer con versiones estables.
- No utilizable para tareas de lenguaje, razonamiento, codigo ni agentes: es exclusivamente un modelo ASR.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JoeDwan/whisper-tiny_to_spanish_accent_19oct
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Repositorio de codigo de Whisper (OpenAI): https://github.com/openai/whisper
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Documentacion de Whisper en Transformers: https://huggingface.co/docs/transformers/model_doc/whisper
- faster-whisper (CTranslate2): https://github.com/SYSTRAN/faster-whisper
- whisper.cpp: https://github.com/ggerganov/whisper.cpp
