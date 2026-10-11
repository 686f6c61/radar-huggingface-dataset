# myflow-ai/whisper-medium.en-gguf

## Resumen

myflow-ai/whisper-medium.en-gguf es una conversion al formato GGUF del modelo openai/whisper-medium.en, publicada por el usuario myflow-ai para su uso con la libreria transcribe.cpp. Se trata de un modelo de reconocimiento automatico del habla (ASR) de tipo encoder-decoder transformer, con 763.873.376 parametros (unos 764 millones) y ventanas de audio de 30 segundos con decodificacion fragmentada para audio largo. La variante ".en" esta entrenada exclusivamente con datos en ingles y prescinde de las tareas de traduccion y deteccion de idioma del Whisper multilingue.

El problema que resuelve es el de disponer de un motor de transcripcion en ingles que se ejecute localmente con requisitos de memoria reducidos: las cuantizaciones publicadas van desde 481 MB (Q4_K_M) hasta 2,85 GB (F32), lo que permite desplegarlo en portatiles y equipos sin GPU dedicada. Frente al Whisper multilingue del mismo tamano, la version en ingles ofrece una calidad de transcripcion superior en ingles a igual coste computacional.

La relevancia actual del repositorio es limitada y debe matizarse: el propio model card reproduce el contenido de la conversion de la organizacion handy-computer (los enlaces de descarga apuntan a handy-computer/whisper-medium.en-gguf, no a myflow-ai), y el repositorio acumula 0 descargas y 0 "likes" en el momento de la consulta. Conviene tratarlo como una copia o espejo de una conversion ya existente, no como una publicacion original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (seq2seq), ventanas de 30 s con decodificacion fragmentada |
| Parametros totales | 763.873.376 (unos 764 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica en el sentido de tokens; ventanas de audio de 30 segundos con decodificacion por fragmentos para audio largo |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | ingles (en) unicamente |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | GGUF (transcribe.cpp); el modelo base original esta en safetensors |
| Tamano del repositorio | 0,8 GB |
| Modelo base | openai/whisper-medium.en (commit 2e98eb6, fijado el 2026-04-25) |
| Libreria | transcribe.cpp |
| Tarea (pipeline) | automatic-speech-recognition |

## Arquitectura y entrenamiento

El modelo base es Whisper, propuesto por Alec Radford et al. (OpenAI) en el articulo "Robust Speech Recognition via Large-Scale Weak Supervision" (arXiv:2212.04356). Se trata de un transformer encoder-decoder entrenado sobre 680.000 horas de audio etiquetado mediante supervision debil a gran escala. Los modelos de la familia Whisper se entrenan en dos regimenes: los checkpoints solo-ingles (como este) se entrenan para reconocimiento del habla, mientras que los multilingues se entrenan simultaneamente para reconocimiento y traduccion. La arquitectura procesa audio en ventanas de 30 segundos y, para audio mas largo, aplica decodificacion fragmentada (chunked long-form decoding).

Esta publicacion concreta no aporta entrenamiento nuevo: es una conversion de pesos a GGUF realizada con transcribe.cpp. Segun el model card, la conversion se valido contra la referencia de transformers en la version 5.6.1 de transcribe.cpp el 2026-04-26. En la informacion disponible no se detallan la composicion exacta del dataset de entrenamiento, el uso de RLHF o DPO, ni innovaciones tecnicas adicionales mas alla de la propia cuantizacion k-quant (Q4_K_M, Q5_K_M, Q6_K) y de las rutinas de decodificacion de transcribe.cpp (greedy, suppress_tokens, temperature fallback y timestamps de segmento activados por defecto).

## Capacidades

- Transcripcion de voz a texto en ingles (ASR) sobre audio de 16 kHz mono.
- Procesamiento de audio largo mediante decodificacion fragmentada sobre ventanas de 30 segundos.
- Marcas de tiempo a nivel de segmento (no de palabra): el model card indica `timestamps: segment`.
- Ejecucion local en CPU (x86 con soporte de Vulkan, y CPU pura) y en GPU/SoC con backend Metal en Apple Silicon, segun los datos de rendimiento publicados.
- NO soporta traduccion de voz (`translate: false` en el model card).
- NO soporta deteccion automatica de idioma (`lang_detect: false`).
- NO soporta transcripcion en streaming (`streaming: false`); requiere ficheros completos o fragmentos ya cerrados.
- No se documentan capacidades de tool calling, function calling, agentes, vision ni audio multimodal. Whisper es un modelo ASR puro, no un modelo de lenguaje conversacional.

## Casos de uso

- Transcripcion de reuniones y notas de voz en ingles: al ser un modelo solo-ingles, rinde mejor que el Whisper multilingue del mismo tamano cuando el audio esta garantizado en ingles; la decodificacion fragmentada permite procesar sesiones largas dividiendolas en ventanas de 30 s.
- Subtitulado offline de video en ingles: las marcas de tiempo a nivel de segmento permiten generar ficheros de subtitulos sincronizados sin necesidad de alineamiento forzado adicional.
- Preprocesado de datasets de audio para entrenamiento de otros modelos: con la cuantizacion Q4_K_M (481 MB) se puede transcribir en lote en una sola GPU de consumo o incluso en CPU, generando transcripciones de referencia a bajo coste.
- Archivado y busqueda de grabaciones: transcripcion masiva de un repositorio de audio corporativo en ingles para indexarlo y permitir busqueda por texto.
- Asistentes de accesibilidad en tiempo casi real: con un factor de tiempo real (RTF) de 45,1x en Metal sobre un M4 Max, permite transcribir fragmentos de audio mucho mas rapido que en tiempo real y alimentar interfaces de subtitulado diferido.
- Despliegue en hardware modesto o en el borde: el modelo Q5_K_M ocupa 556 MB, de modo que cabe en equipos con poca VRAM o sin GPU dedicada, por ejemplo un portatil con Ryzen 4750U (RTF de 4,6x con Vulkan y 1,1x en CPU segun el model card).
- Analisis de llamadas de atencion al cliente en ingles: transcripcion por lotes de grabaciones telefonicas para su posterior analisis de sentimiento o cumplimiento, aceptando el aumento de WER esperable en audio telefonico respecto a LibriSpeech.

## Benchmarks y rendimiento

El model card publica WER sobre la particion completa LibriSpeech test-clean (2620 enunciados), medido con la decodificacion por defecto de transcribe.cpp. El WER autoinformado por OpenAI sobre la misma particion es 3,02%.

| Cuantizacion | Tamano | WER LibriSpeech test-clean (%) |
|---|---:|---:|
| F32 | 2,85 GB | 2,74 |
| F16 | 1,44 GB | 2,73 |
| Q8_0 | 793 MB | 2,72 |
| Q6_K | 618 MB | 2,83 |
| Q5_K_M | 556 MB | 2,74 |
| Q4_K_M | 481 MB | 2,91 |

Notas del autor sobre la medicion: las cifras proceden de una unica ejecucion con backend Metal, cuyas reducciones paralelas no deterministas pueden desplazar el WER del corpus en torno a 0,1 puntos porcentuales entre ejecuciones (efecto atribuido en su mayoria a alucinaciones en clips cortos cercanos al suelo de ruido). La divergencia con el 3,02% de OpenAI se atribuye probablemente a que `model.generate()` usa `<|notimestamps|>` por defecto mientras que el pipeline de transcribe.cpp ejecuta con timestamps activados.

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; no son aplicables a un modelo ASR.

## Requisitos de hardware

- VRAM/peso en disco por cuantizacion: F32 2,85 GB; F16 1,44 GB; Q8_0 793 MB; Q6_K 618 MB; Q5_K_M 556 MB; Q4_K_M 481 MB. Hay que anadir el consumo del runtime (activaciones y buffers de audio), por lo que la VRAM efectiva sera ligeramente superior al peso del fichero.
- Cabe en GPU de consumo: si. Cualquier GPU con 2-3 GB de VRAM libres puede ejecutar incluso la cuantizacion F32; con Q4_K_M o Q5_K_M basta con menos de 1 GB. Tambien es viable en CPU.
- GPU recomendadas: no se especifican modelos concretos en la informacion disponible. Los unicos datos de rendimiento publicados corresponden a un SoC Apple M4 Max (backend Metal) y a un Ryzen 4750U (backend Vulkan/CPU).
- Rendimiento medido (factor de tiempo real, RTF; mayor es mejor):
  - Apple M4 Max: 45,1x con Metal; 3,2x en CPU.
  - AMD Ryzen 4750U: 4,6x con Vulkan; 1,1x en CPU.
- Opciones de despliegue: transcribe.cpp, compilado desde fuente (`cmake -B build && cmake --build build`) y ejecutado con `transcribe-cli -m <modelo.gguf> input.wav`. No se documentan otras opciones (vLLM, TGI, Ollama, llama.cpp) en la informacion disponible.
- Requisito de entrada: audio en WAV mono a 16 kHz; en caso contrario, hay que remuestrear previamente (por ejemplo con `ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav`).
- Latencia y throughput: no se publican valores absolutos de latencia ni de tokens por segundo; solo los RTF anteriores, que expresan cuantas veces mas rapido que el tiempo real procesa el modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Formato | WER LibriSpeech test-clean | Notas |
|---|---:|---|---|---|---|---|
| myflow-ai/whisper-medium.en-gguf (esta ficha) | 763.873.376 | en | Apache-2.0 | GGUF | 2,72-2,91% segun cuantizacion | Conversion para transcribe.cpp |
| openai/whisper-medium.en (base) | 763.873.376 | en | Apache-2.0 | safetensors | 3,02% (autoinformado) | Referencia original en transformers |
| openai/whisper-medium (multilingue) | no disponible en la informacion proporcionada | multilingue | Apache-2.0 | safetensors | no disponible | Anade traduccion y deteccion de idioma |
| openai/whisper-large-v3 | no disponible en la informacion proporcionada | multilingue | Apache-2.0 | safetensors | no disponible | Gama superior, solo multilingue |

La unica comparacion cuantitativa disponible en la informacion proporcionada es la del modelo frente a su propia referencia: la conversion GGUF de transcribe.cpp obtiene un WER entre 0,11 y 0,30 puntos porcentuales inferior al 3,02% autoinformado por OpenAI, aunque el propio autor advierte que la diferencia puede deberse a configuraciones de evaluacion distintas (timestamps activados frente a `<|notimestamps|>`) y no necesariamente a una mejora real del modelo. No hay datos en la informacion disponible para comparar con whisper-small, whisper-large ni con alternativas como wav2vec 2.0 o NeMo.

## Limitaciones y advertencias

- Solo ingles. El modelo no reconoce otros idiomas y no dispone de deteccion automatica de idioma ni de traduccion.
- Sin streaming. Requiere audio completo o fragmentos cerrados; no es adecuado para transcripcion en vivo con baja latencia.
- Marcas de tiempo solo a nivel de segmento, no de palabra, lo que limita su uso en aplicaciones que necesiten alineamiento fino.
- Riesgo de alucinacion en silencios, ruido de fondo o clips muy cortos; el propio autor senala este fenomeno como causa principal de la variabilidad de ~0,1 puntos de WER entre ejecuciones con backend Metal.
- El WER publicado (2,7-2,9%) corresponde a LibriSpeech test-clean, locucion leida y limpia. En audio real (telefonia, acentos, ruido, solapamiento de hablantes) el error esperado es sustancialmente mayor.
- No determinismo con Metal: reducciones paralelas no deterministas pueden alterar ligeramente el resultado entre ejecuciones.
- Procedencia del repositorio: 0 descargas y 0 "likes", y el model card reproduce los enlaces de descarga de la organizacion handy-computer. Antes de usarlo en produccion conviene verificar que los pesos coinciden con la conversion original y que no han sido manipulados.
- Licencia Apache-2.0: permite uso comercial y modificacion, con obligacion de conservar avisos de licencia y atribucion. Al derivar del modelo base de OpenAI, siguen aplicandose los terminos de este.
- Dependencia de una libreria concreta: el despliegue documentado es transcribe.cpp; la compatibilidad con otros runtimes GGUF no esta verificada en la informacion disponible.
- Uso responsable: la transcripcion de conversaciones puede afectar a la privacidad y a la normativa de proteccion de datos; hay que informar a los participantes y aplicar las bases juridicas correspondientes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/myflow-ai/whisper-medium.en-gguf
- Modelo base: https://huggingface.co/openai/whisper-medium.en
- Commit del modelo base usado en la conversion: https://huggingface.co/openai/whisper-medium.en/commit/2e98eb6
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Version de transcribe.cpp usada para la validacion: https://github.com/handy-computer/transcribe.cpp/tree/5.6.1
- Documentacion del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/whisper-medium.en.md
- Conversion original de referencia (handy-computer): https://huggingface.co/handy-computer/whisper-medium.en-gguf
- Articulo de Whisper: https://arxiv.org/abs/2212.04356
- Codigo original de OpenAI Whisper: https://github.com/openai/whisper
- Indice de modelos Whisper en HuggingFace: https://huggingface.co/models?search=openai/whisper
