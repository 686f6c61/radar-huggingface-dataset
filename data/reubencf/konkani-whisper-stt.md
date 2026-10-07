# Reubencf/konkani-whisper-stt

## Resumen

Konkani Whisper STT es un adaptador LoRA de PEFT entrenado por el usuario Reubencf sobre el modelo base `unsloth/whisper-large-v3`, orientado al reconocimiento automatico del habla (ASR) en konkani, una lengua indoaria hablada principalmente en Goa y otras regiones costeras del oeste de la India. El repositorio no duplica los pesos completos de Whisper: solo contiene el adaptador LoRA (rank 64 sobre `q_proj` y `v_proj`) y el processor, con un tamano de repositorio de aproximadamente 0,1 GB. Para usarlo hay que cargar el modelo base `unsloth/whisper-large-v3` y aplicar el adaptador encima.

El modelo se entreno durante una unica epoca completa sobre el split de entrenamiento del dataset `Reubencf/goan-konkani-speech`, con batch size de uno, acumulacion de gradiente de cuatro y learning rate de 1e-4. La salida textual esta en konkani en escritura romana (Romi Konkani). Un detalle tecnico relevante es que, al no existir un token de idioma especifico para konkani en Whisper, el entrenamiento y la inferencia reutilizan el token de marati (mr), la lengua mas cercana disponible en el modelo original.

El interes practico de esta ficha es limitado pero claro: se trata de un adaptador experimental, con cero descargas y cero likes en el momento de la consulta, pensado para cubrir una lengua de bajos recursos que practicamente no tiene cobertura en los sistemas ASR comerciales ni en los checkpoints multilingues genericos de Whisper. Los resultados que reporta el autor se limitan a un muestreo fijo de 128 clips de validacion, por lo que no constituyen una evaluacion completa del split de test.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rank 64 sobre `q_proj` y `v_proj`) sobre encoder-decoder transformer Whisper large-v3 |
| Parametros totales | No disponible (el adaptador ocupa ~0,1 GB; el modelo base Whisper large-v3 ronda los 1.550 millones de parametros) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Ventanas de audio de 30 segundos, segun la arquitectura Whisper; no hay contexto textual explicito |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene pesos del adaptador en safetensors) |
| Idiomas soportados | Konkani (codigo ISO `kok`), en escritura romana (Romi Konkani) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

La arquitectura subyacente es Whisper large-v3, un transformer encoder-decoder disenado para ASR y traduccion de voz, que procesa audio muestreado a 16 kHz y genera texto de forma autorregresiva. Sobre ese modelo se ha insertado un adaptador LoRA de rank 64 restringido a las proyecciones de query y value de la atencion, lo que reduce drasticamente el numero de parametros entrenables y explica que el repositorio ocupe solo 0,1 GB. El processor tambien se incluye en el repo para fijar la configuracion de features de audio e inferencia.

El entrenamiento consistio en una unica epoca sobre el split de entrenamiento del dataset `Reubencf/goan-konkani-speech`, con batch size de uno, acumulacion de gradiente de cuatro pasos y learning rate de 1e-4. No se menciona en la informacion disponible el uso de RLHF, DPO ni ninguna otra fase de alineacion, ni el numero exacto de tokens o de horas de audio empleadas. El autor indica explicitamente que se emplea el token de idioma `mr` (marati) porque Whisper no dispone de token nativo para konkani, y que las metricas de WER y CER se calcularon sobre una muestra fija de 128 clips de validacion, no sobre el split de test completo.

## Capacidades

- Reconocimiento automatico del habla en konkani para audio de hasta 30 segundos por inferencia (con encadenamiento por ventanas para audios mas largos).
- Transcripcion en escritura romana (Romi Konkani), no en escritura devanagari.
- Aprovechamiento del token de idioma `mr` para forzar la decodificacion en una lengua indoaria cercana al konkani.
- Transcripcion de audio a 16 kHz, siguiendo el pipeline estandar de Whisper.
- Capacidad potencial de traduccion de voz (herencia de Whisper large-v3), aunque no se documenta su calidad en el adaptador.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta un modo de razonamiento (thinking mode) ni capacidades de vision o audio mas alla del propio ASR.

## Casos de uso

- Transcripcion de entrevistas y material oral en konkani de Goa: el modelo puede convertir grabaciones de campo o historias orales a texto Romi Konkani, util para archivos linguisticos y proyectos de documentacion de lenguas minoritarias.
- Subtitulado automatico de contenido audiovisual regional: productoras o televisiones locales que emiten en konkani pueden generar subtitulos preliminares y revisarlos despues, reduciendo el trabajo manual frente a partir de cero.
- Digitalizacion de archivos sonoros de radios comunitarias: emisoras que conservan cintas o grabaciones en konkani pueden transcribirlas para crear indices buscables.
- Aplicaciones de accesibilidad para hablantes de konkani: dictado de notas, mensajes o documentos por voz en un idioma que los asistentes comerciales no cubren.
- Investigacion linguistica y corpus: generacion de transcripciones para anotacion posterior, analisis lexico o construccion de corpus de konkani con alineacion audio-texto.
- Prototipos de atencion al cliente en konkani: dado que no hay modelos comerciales para este idioma, un adaptador como este puede servir como base experimental para transcribir llamadas antes de derivar el texto a un LLM.
- Educacion y aprendizaje de la lengua: transcripcion de clases o materiales didacticos en konkani para estudiantes de la diaspora.
- Preservacion del patrimonio inmaterial: transcripcion de canciones, cuentos y tradiciones orales para su catalogacion.

## Benchmarks y rendimiento

La informacion disponible no incluye los valores numericos de WER ni de CER. La model card indica unicamente que esas metricas se calcularon sobre una muestra fija de 128 clips de validacion y advierte explicitamente de que no equivalen a una evaluacion sobre el split de test completo. Por tanto:

"No se han publicado resultados de benchmarks en la informacion disponible."

## Requisitos de hardware

- El adaptador LoRA es muy ligero (~0,1 GB), pero la inferencia requiere cargar el modelo base Whisper large-v3, por lo que la VRAM necesaria viene determinada por este ultimo.
- VRAM estimada para FP16: en torno a 3-4 GB solo para los pesos del modelo, mas overhead de activaciones y buffers. En la practica conviene disponer de 6-8 GB de VRAM para trabajar con comodidad en FP16.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 2-3 GB, suficientes para GPUs de gama media.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 1,5-2 GB, lo que permite ejecucion en GPUs consumer modestas.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (RTX 3060, RTX 3070, RTX 4060, RTX 4070) puede ejecutar el modelo en FP16. Para lotes grandes o despliegue en servidor se recomienda A100, H100, L40S o RTX 4090.
- Cabe en GPU consumer: si, en la mayoria de tarjetas con 6 GB o mas de VRAM, especialmente si se aplica cuantizacion.
- Opciones de despliegue: al ser un adaptador PEFT, la via natural es `transformers` con `peft`; tambien `unsloth` para carga rapida, `vLLM` con soporte de Whisper, `TGI` y, para CPU o entornos ligeros, exportacion a `ctranslate2`/`faster-whisper` o `whisper.cpp` previa fusion del adaptador con el modelo base.
- Latencia y throughput: no disponibles. No se han publicado mediciones de velocidad de inferencia ni de RTF (real-time factor).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Reubencf/konkani-whisper-stt | Adaptador LoRA (~0,1 GB) sobre Whisper large-v3 (~1,55 B) | 30 s por ventana | Konkani (kok) | No disponible | HuggingFace (0 descargas) |
| unsloth/whisper-large-v3 (modelo base) | ~1,55 B | 30 s por ventana | ~99 idiomas, sin konkani | No disponible | HuggingFace |
| openai/whisper-large-v3 (original) | ~1,55 B | 30 s por ventana | ~99 idiomas, sin konkani | MIT (Apache 2.0 en variantes) | HuggingFace |
| Alternativas Indic ASR (por ejemplo, modelos de AI4Bharat para lenguas indoarias) | Variable, tipicamente 0,2-1 B | Variable | Multiples lenguas indoarias | No disponible en detalle | HuggingFace |

Nota: no se dispone de resultados comparativos de WER/CER entre estos modelos dentro de la informacion proporcionada, por lo que la comparacion se limita a parametros, contexto, cobertura idiomatica y disponibilidad. La calidad del adaptador frente a alternativas entrenadas especificamente para konkani no puede evaluarse con los datos disponibles.

## Limitaciones y advertencias

- La model card advierte de que las metricas de WER/CER se calcularon sobre una muestra fija de 128 clips de validacion y no sobre el split de test completo: no deben interpretarse como una evaluacion representativa del rendimiento real.
- El modelo reutiliza el token de idioma de marati (`mr`) porque Whisper no dispone de token nativo para konkani, lo que puede provocar confusiones entre ambas lenguas y errores de transcripcion en palabras divergentes.
- La salida es exclusivamente en escritura romana (Romi Konkani); no se documenta soporte para escritura devanagari ni para otras variantes ortograficas del konkani.
- No hay informacion sobre sesgos, composicion demografica del dataset ni oradores representados, por lo que se desconoce como se comporta el modelo ante distintos acentos, edades o generos.
- No se documenta licencia, lo que impide conocer si se permite el uso comercial. Esta ausencia de licencia explicita es un riesgo legal importante para cualquier despliegue en produccion.
- El repositorio tiene cero descargas y cero likes: es un adaptador experimental, sin evidencia de uso en produccion ni validacion externa por parte de la comunidad.
- No se indica si el dataset de entrenamiento tiene suficiente cobertura de variedades dialectales del konkani; probablemente el sesgo hacia el konkani de Goa (goan-konkani) sea notable.
- Riesgo de alucinacion tipico de los modelos Whisper en audio con ruido, silencios largos o habla no vista durante el entrenamiento, con posibilidad de generar texto inexistente.
- Al ser un adaptador sobre un modelo base grande, los requisitos de VRAM reales son los de Whisper large-v3, no los 0,1 GB del repositorio.

## Enlaces

- HuggingFace: https://huggingface.co/Reubencf/konkani-whisper-stt
- Modelo base: https://huggingface.co/unsloth/whisper-large-v3
- Dataset de entrenamiento: https://huggingface.co/datasets/Reubencf/goan-konkani-speech
- Repositorio del proyecto Unsloth: https://github.com/unslothai/unsloth
- Repositorio de PEFT: https://github.com/huggingface/peft
- Repositorio original de Whisper de OpenAI: https://github.com/openai/whisper
