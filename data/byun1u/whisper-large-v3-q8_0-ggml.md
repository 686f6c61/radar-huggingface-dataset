# byun1u/whisper-large-v3-q8_0-ggml

## Resumen

`byun1u/whisper-large-v3-q8_0-ggml` es una cuantizacion en formato GGML del modelo de reconocimiento automatico del habla (ASR) Whisper large-v3 de OpenAI, preparada para su uso con la implementacion en C/C++ whisper.cpp. El autor, byun1u, ha convertido el fichero `ggml-large-v3.bin` original (3.095.033.483 bytes) a cuantizacion q8_0 mediante la herramienta `whisper-quantize` de whisper.cpp v1.9.5, obteniendo un binario de 1.656.538.283 bytes (aproximadamente 1,54 GiB). No es un modelo nuevo ni un reentrenamiento: es una redistribucion cuantizada del mismo conjunto de pesos.

La relevancia de esta ficha es practica: permite ejecutar Whisper large-v3 en entornos donde la version f16 no cabe o no rinde bien, con una perdida de calidad muy contenida. Segun las mediciones del propio autor sobre tres grabaciones de 10 minutos (ingles, ruso y ucraniano), el q8_0 iguala o mejora marginalmente al f16 en WER (21,6 % / 2,5 % / 16,6 % frente a 21,6 % / 2,5 % / 16,7 %), reduce el uso de VRAM de 4261 MiB a 2954 MiB y el tamano del fichero de 2,88 GiB a 1,54 GiB, a costa de un aumento de tiempo de inferencia de en torno al 13-14 %.

El modelo hereda la arquitectura transformer encoder-decoder de Whisper large-v3 (aproximadamente 1.550 millones de parametros), con soporte multilingue y tareas de transcripcion y traduccion. La licencia MIT se mantiene tanto para los pesos de OpenAI como para el formato y el cuantizador de whisper.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3), formato GGML |
| Parametros totales | aproximadamente 1.550 millones (heredados de Whisper large-v3; no indicado de forma explicita en la model card) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | ventana de audio de 30 segundos por segmento (caracteristica de Whisper; no indicado en la model card) |
| Tipos de cuantizacion | q8_0 (ftype 7, version de cuantizacion 2); el autor compara tambien con f16 y q5_0 |
| Idiomas soportados | en, uk, ru y multilingue (etiquetas de la model card); Whisper large-v3 cubre mas idiomas, no detallados aqui |
| Licencia | MIT |
| Formato de pesos | GGML binario (`ggml-large-v3-q8_0.bin`) |
| Tamano del fichero | 1.656.538.283 bytes (1,54 GiB) |
| SHA256 | `24bc434f372355688ab9a623077a63e5361a1c41f4d8d648977e39f9b060f09e` |
| Herramienta de cuantizacion | whisper.cpp v1.9.5 (commit `d1be6fde11ac6e0407606b4e42fe72d34add8037`), `whisper-quantize`, build CPU Release |
| Modelo base | openai/whisper-large-v3 |

## Arquitectura y entrenamiento

El modelo subyacente es Whisper large-v3 de OpenAI, un transformer encoder-decoder entrenado con supervision debil a gran escala sobre pares audio-texto, descrito en el paper "Robust Speech Recognition via Large-Scale Weak Supervision" (Radford et al., 2022, arXiv:2212.04356). La model card de esta ficha no aporta detalles adicionales sobre el dataset de entrenamiento, el numero de tokens ni si hubo etapas de RLHF o DPO; esa informacion corresponde al modelo original de OpenAI y no se reproduce aqui.

La aportacion de este repositorio es exclusivamente de formato y compresion: se parte de `ggml-large-v3.bin` (3.095.033.483 bytes, sha256 `64d182b440b98d5203c4f9bd541544d84c605196c4f7b845dfa11fb23594d1e2`, procedente de `ggerganov/whisper.cpp` en el commit `5359861c739e955e79d9a303bcbc70fb988958b1`) y se aplica cuantizacion q8_0 con `whisper-quantize`. No hay fine-tuning, destilacion ni cambio de vocabulario. El resultado es un fichero compatible con cualquier binario de whisper.cpp que soporte ftype 7.

## Capacidades

- Reconocimiento automatico del habla (transcripcion) sobre audio de hasta 30 segundos por segmento, con gestion interna de audio mas largo.
- Traduccion de audio a texto en ingles (tarea de traduccion de Whisper).
- Deteccion de idioma y transcripcion multilingue; la model card etiqueta explicitamente en, uk, ru y multilingue.
- Generacion de marcas de tiempo a nivel de segmento y de palabra (funcionalidad de whisper.cpp, no especifica de este fichero).
- Ejecucion en CPU y GPU mediante whisper.cpp (backend CUDA verificado por el autor con RTX 3080 Ti).
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un modelo puramente ASR.
- No dispone de modo thinking, vision ni audio generation.

## Casos de uso

- Transcripcion de reuniones y actas: con una ventana efectiva de 30 segundos por segmento y gestion de audio largo en whisper.cpp, el modelo puede procesar grabaciones de horas en local sin enviar audio a servicios externos, algo critico para datos confidenciales.
- Subtitulado de video en produccion: la generacion de marcas de tiempo de whisper.cpp permite emitir ficheros SRT/VTT; el q8_0 mantiene el WER del f16 (21,6 % en el set ingles AMI ES2004b) con un 31 % menos de VRAM, lo que facilita ejecutarlo en la misma maquina que el resto del pipeline de render.
- Transcripcion de contenido en ucraniano y ruso: el autor reporta WER de 16,6 % en ucraniano y 2,5 % en ruso sobre sus sets de prueba, por lo que es adecuado para medios, organismos publicos o soporte a refugiados que necesiten ASR en estas lenguas sin depender de la nube.
- Despliegue en hardware modesto o edge: con 2954 MiB de VRAM en la prueba del autor, el modelo cabe en GPUs de consumo de gama media-alta y en estaciones de trabajo sin acelerador dedicado, habilitando transcripcion on-premise en clinicas, juzgados o aulas.
- Archivado y busqueda de grabaciones historicas: transcripcion por lotes con whisper-cli sobre directorios completos de audio, indexando el texto resultante para busqueda posterior; el menor tamano de fichero (1,54 GiB) reduce el coste de almacenamiento y distribucion del modelo en flotas de maquinas.
- Prototipado e investigacion en ASR: al ser un binario unico y reproducible (sha256 publicado), sirve como linea base cuantizada para comparar tecnicas de post-procesado, diarizacion o puntuacion sin tener que gestionar el stack de PyTorch.

## Benchmarks y rendimiento

Mediciones del autor con whisper.cpp y CUDA (RTX 3080 Ti), beam 5, idioma fijado, sobre tres grabaciones de 10 minutos: ingles (AMI ES2004b, 1.620 palabras), ruso (dialogo actuado, 1.257 palabras) y ucraniano (frases leidas, 1.198 palabras). El propio autor advierte que son conjuntos pequenos y no un benchmark general.

| Modelo | WER en | WER ru | WER uk | Segundos (en / ru / uk) | VRAM | Tamano fichero |
|---|---|---|---|---|---|---|
| large-v3 f16 | 21,6 % | 2,5 % | 16,7 % | 42,7 / 54,9 / 63,6 | 4261 MiB | 2,88 GiB |
| large-v3 q8_0 (este fichero) | 21,6 % | 2,5 % | 16,6 % | 48,4 / 61,4 / 72,5 | 2954 MiB | 1,54 GiB |
| large-v3 q5_0 | 22,9 % | 2,4 % | 16,9 % | 45,2 / 60,3 / 70,1 | 2563 MiB | 1,01 GiB |

Palabras distintas respecto a la transcripcion f16: q8_0, 66 de 1.620 (en), 8 de 1.257 (ru) y 22 de 1.198 (uk); q5_0, 87, 15 y 82 respectivamente.

## Requisitos de hardware

- VRAM medida por el autor con q8_0: 2954 MiB (frente a 4261 MiB en f16 y 2563 MiB en q5_0).
- GPU verificada: RTX 3080 Ti con backend CUDA de whisper.cpp. Por consumo de memoria, cabe en GPUs consumer con 4 GB o mas de VRAM libre, aunque no se han publicado pruebas en otras tarjetas.
- CPU: whisper.cpp permite ejecucion sin GPU; el autor genero el fichero con un build CPU Release, pero no publica latencias en CPU.
- Despliegue: `whisper-cli -m ggml-large-v3-q8_0.bin -f audio.wav` (whisper.cpp). No se mencionan integraciones con vLLM, TGI, Ollama ni llama.cpp en la informacion disponible.
- Throughput observado: 48,4 s (en), 61,4 s (ru) y 72,5 s (uk) para 10 minutos de audio, es decir, entre 8 y 12 veces mas rapido que tiempo real en la RTX 3080 Ti con beam 5.
- Latencia: no se publican cifras de latencia por segmento ni de first-token; solo los tiempos totales anteriores.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (en, set del autor) | VRAM | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| whisper-large-v3 q8_0 (este) | aprox. 1,55 B | 30 s por segmento | 21,6 % | 2954 MiB | MIT | GGML en HF |
| whisper-large-v3 f16 (original) | aprox. 1,55 B | 30 s por segmento | 21,6 % | 4261 MiB | MIT | GGML en HF |
| whisper-large-v3 q5_0 | aprox. 1,55 B | 30 s por segmento | 22,9 % | 2563 MiB | MIT | GGML en HF |

No se dispone de datos en la informacion proporcionada para comparar con otros modelos ASR (por ejemplo, variantes de la familia Whisper de menor tamano o alternativas no pertenecientes a OpenAI).

## Limitaciones y advertencias

- No es un lanzamiento oficial de OpenAI ni de los autores de whisper.cpp; es una cuantizacion de terceros. Conviene verificar el sha256 antes de usarlo en produccion.
- Los benchmarks del autor se basan en tres grabaciones de 10 minutos; no son representativos de dominios como audio telefonico, acentos no nativos o ruido de fondo. El WER del 21,6 % en el set AMI sugiere un rendimiento limitado en conversacion espontanea.
- La cuantizacion q8_0 introduce diferencias de transcripcion respecto al f16 (66 palabras de 1.620 en ingles), por lo que no es identica bit a bit al modelo original.
- Riesgo de alucinacion conocido en Whisper: en silencios, musica o audio de baja calidad puede generar texto inventado; no se han publicado mitigaciones especificas en esta model card.
- La model card solo declara en, uk, ru y multilingue; el comportamiento en otros idiomas no esta verificado en este fichero.
- La licencia MIT permite uso comercial, pero el usuario debe conservar los avisos de copyright de OpenAI y de los autores de ggml/whisper.cpp incluidos en la model card.
- No soporta tool calling ni razonamiento; no debe emplearse como sustituto de un LLM en pipelines de agentes.
- El rendimiento medido corresponde a CUDA con beam 5; con otros backends (CPU, Metal, Vulkan) las cifras pueden diferir y no se han publicado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/byun1u/whisper-large-v3-q8_0-ggml
- Modelo base: https://huggingface.co/openai/whisper-large-v3
- Repositorio whisper.cpp: https://github.com/ggml-org/whisper.cpp
- Fichero fuente `ggml-large-v3.bin` (commit `5359861c739e955e79d9a303bcbc70fb988958b1`): https://huggingface.co/ggerganov/whisper.cpp/blob/5359861c739e955e79d9a303bcbc70fb988958b1/ggml-large-v3.bin
- Repositorio de OpenAI Whisper: https://github.com/openai/whisper
- Paper: Radford et al., "Robust Speech Recognition via Large-Scale Weak Supervision" (2022): https://arxiv.org/abs/2212.04356
