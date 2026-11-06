# sakasegawa/NVIDIA-NemotronLabs-RE-USE-laughter-GGUF

## Resumen

NVIDIA-NemotronLabs-RE-USE-laughter es una red neuronal de mejora de voz (speech enhancement) desarrollada por NVIDIA dentro de su linea NemotronLabs. El modelo toma una grabacion de voz con ruido y devuelve la misma grabacion limpia, eliminando ruido de fondo, reverberacion, clipping, limitaciones de banda y artefactos de codec, pero conservando la risa del hablante, que otros sistemas de la familia RE-USE eliminan junto con el ruido. Esta orientado a la restauracion de audio previa a tareas de reconocimiento automatico del habla (ASR) o a la escucha humana.

La arquitectura es SEMamba, una red de 9.607.747 parametros que opera sobre la representacion STFT de la senal. El repositorio aqui descrito es una conversion a formato GGUF realizada por el usuario sakasegawa para el runtime speech.cpp 0.10.1 o superior, con los pesos en F32 y las opciones de STFT y de troceado del script oficial `inference_chunk.py`. No es un modelo de lenguaje: no genera texto ni razona, sino que transforma audio en audio (pipeline audio-to-audio).

Su relevancia practica es doble. Por un lado, ofrece una version ejecutable en CPU y GPU de consumo de un modelo de mejora de voz de NVIDIA bajo licencia OpenMDW 1.1. Por otro, el formato GGUF empleado es propio de speech.cpp y no es compatible con llama.cpp, LM Studio u Ollama, lo que conviene tener en cuenta antes de integrarlo en un pipeline existente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SEMamba (red de mejora de voz sobre STFT) |
| Parametros totales | 9.607.747 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa audio en trozos de 5 s con solapamiento de medio trozo) |
| Tipos de cuantizacion | F32 (unico peso publicado en el repositorio) |
| Idiomas soportados | no disponible (el autor indica que acepta voz en cualquier idioma) |
| Licencia | OpenMDW License Agreement, version 1.1 |
| Formato de pesos | GGUF (layout propio de speech.cpp), con fichero auxiliar `.json` de metadatos |
| Frecuencia de muestreo de entrada | 8 a 48 kHz |
| Salida | misma grabacion a la misma frecuencia de muestreo |
| Tamano del fichero de pesos | 38.519.200 bytes (38,5 MB) |
| SHA-256 del GGUF | `15715fbb45e1ba3ae45da52c3018f60ef32f4fd48ff278cb14b402f9e12a32bf` |
| Revision del modelo base | `1b1521dd659608e1e063ada83e0acfe1da473a8b` |

## Arquitectura y entrenamiento

El modelo base es NVIDIA NemotronLabs RE-USE-laughter, una red SEMamba de 9,6 millones de parametros. La conversion a GGUF conserva los pesos en F32 exactamente como estan en el checkpoint original, junto con los parametros de STFT de la receta y los fragmentos del script oficial `inference_chunk.py`. La inferencia se realiza por trozos de 5 segundos con un salto de medio trozo, de modo que cada parte del audio se procesa dos veces y se recompone; una locucion procesada de una sola pasada, como hace `speech asr --enhance`, se procesa una sola vez.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o ajuste fino preferencial, ya que la model card del repositorio convertido no los detalla y la ficha de NVIDIA no se incluye en la informacion proporcionada. La innovacion tecnica destacable es el sesgo del modelo hacia la preservacion de la risa: mientras la variante `re-use` del mismo autor elimina la risa junto con el ruido, esta variante la mantiene, lo que resulta util cuando la risa es parte del contenido que se quiere conservar (podcasts, entrevistas, reuniones). La conversion la realiza el script `reference/semamba/convert.py` a partir de `model.safetensors` (38.592.940 bytes, SHA-256 `35c2a4e284515275d2e49a8e8cb5cd392ae67a1f1d345de1c12a0202c7b6b610`) del modelo de NVIDIA en la revision indicada, con el codigo de nvidia/NVIDIA-NemotronLabs-RE-USE en la revision `31f82f2efad1095034492f236e8dac9239ba713b`.

## Capacidades

- Mejora de voz (speech enhancement): elimina ruido de fondo, reverberacion, clipping, limitaciones de banda y dano por codec.
- Preservacion de risa: mantiene las risas del hablante en la senal mejorada, a diferencia de la variante `re-use`.
- Acepta audio de 8 a 48 kHz y devuelve la misma grabacion a la misma frecuencia de muestreo.
- Extension de banda (BWE): con `--bwe 48000` remuestrea primero a 48 kHz para extender el ancho de banda de la senal.
- Integracion con ASR: la opcion `--enhance` de `speech asr` mejora cada fichero completo antes de reconocerlo.
- Servicio HTTP: `speech serve re-use-laughter` expone el endpoint `POST /v1/audio/enhancements`.
- API C: funcion `speech_enhance()` y variantes para procesar audio por fragmentos.
- Procesamiento por trozos de 5 s con solapamiento para audio de duracion arbitraria.
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto: es un modelo puramente audio-a-audio.

## Casos de uso

- Restauracion de grabaciones de entrevistas y podcasts: el modelo limpia ruido de fondo, reverberacion de sala y artefactos de compresion conservando las risas de los interlocutores, algo que la variante `re-use` eliminaria y que aqui es contenido relevante.
- Preprocesado para ASR: encadenar `speech asr qwen3-asr-1.7b --enhance re-use-laughter` sobre grabaciones ruidosas (por ejemplo, audio de multitudes) mejora cada fichero completo antes de transcribirlo, lo que reduce errores de reconocimiento en entornos adversos.
- Limpieza de llamadas telefonicas: con `--bwe 48000` se remuestrea primero a 48 kHz y se extiende la banda, recuperando inteligibilidad en audio telefonico de banda estrecha.
- Produccion audiovisual y postproduccion: limpiar tomas de campo o de localizacion sin perder las reacciones espontaneas del publico o del entrevistado.
- Archivo y preservacion digital: restaurar grabaciones historicas o de baja calidad (8 kHz, codecs antiguos) manteniendo la naturalidad de la voz y las risas originales.
- Servicio de mejora bajo demanda: desplegar `speech serve` y ofrecer un endpoint HTTP `POST /v1/audio/enhancements` para que otras aplicaciones envien audio y reciban la version limpia.
- Integracion en aplicaciones de escritorio o moviles: gracias a los 9,6 M de parametros y al fichero de 38,5 MB en F32, el modelo cabe en memoria de dispositivos modestos y puede ejecutarse en CPU, como muestran las pruebas en Apple M5 y RTX 2080.

## Benchmarks y rendimiento

El autor publica una comparacion de fidelidad frente al codigo oficial (commit 31f82f2) sobre voz FLEURS con ruido babble a 16 kHz, en trozos de 5 s, medido en un Apple M5:

| Metrica | Valor |
|---|---|
| Distancia de la red frente a la oficial (por trozo, CPU y Metal) | 75,9 a 78,7 dB |
| Distancia del audio mejorado frente al oficial | 63,4 dB |

Rendimiento (RTFx: segundos de audio procesados por segundo de computo, sobre 60 s de voz ruidosa, mediana de tres ejecuciones, 2026-11-01):

| Dispositivo | 16 kHz | 48 kHz |
|---|---|---|
| Apple M5, Metal | 2,86 | 0,96 |
| Apple M5, CPU | 0,17 | no ejecutado |
| NVIDIA GeForce RTX 2080, Vulkan | 3,29 | 1,15 |

No se han publicado resultados de benchmarks estandar de mejora de voz (PESQ, STOI, SI-SDR) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: minima; los pesos ocupan 38,5 MB en F32, por lo que el modelo cabe en cualquier GPU con al menos unos cientos de MB libres, incluyendo iGPU.
- GPU recomendadas: cualquier GPU con soporte Metal o Vulkan. Probado en Apple M5 (Metal) y NVIDIA GeForce RTX 2080 (Vulkan); por tamano, tambien cabe en GTX 1050, RTX 3060, RTX 4090, A100 o H100 sin problema.
- CPU: funciona en CPU pura, aunque lento (RTFx 0,17 en Apple M5 a 16 kHz, es decir, aproximadamente 6 veces mas lento que tiempo real).
- Cabe en GPU de consumo: si, practicamente en cualquiera.
- Despliegue: exclusivamente mediante speech.cpp 0.10.1 o superior (CLI `speech enhance`, servidor `speech serve`, API C `speech_enhance()`). No es compatible con llama.cpp, LM Studio, Ollama ni otros lectores GGUF genericos.
- Latencia y throughput: RTFx de 2,86 a 3,29 a 16 kHz en M5 Metal y RTX 2080 Vulkan; baja a 0,96-1,15 a 48 kHz. El procesamiento por trozos de 5 s con solapamiento duplica el computo respecto a una pasada unica.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Preserva risa | Formato | Licencia |
|---|---|---|---|---|---|
| NVIDIA NemotronLabs RE-USE-laughter (este) | 9,6 M | SEMamba, audio-audio | Si | GGUF (speech.cpp) | OpenMDW 1.1 |
| NVIDIA NemotronLabs RE-USE (`sakasegawa/NVIDIA-NemotronLabs-RE-USE-GGUF`) | 9,6 M (misma familia) | SEMamba, audio-audio | No (elimina la risa con el ruido) | GGUF (speech.cpp) | OpenMDW 1.1 |
| Alternativas genericas de speech enhancement (Demucs, DeepFilterNet, RNNoise) | no disponible en la informacion | diversas | no disponible | no disponible | no disponible |

La comparativa con modelos de la literatura (DeepFilterNet, RNNoise, Demucs) no se puede completar con datos de la informacion proporcionada; no se dispone de parametros, contexto ni resultados comparables de esos sistemas en esta ficha.

## Limitaciones y advertencias

- El fichero GGUF usa el layout propio de speech.cpp: no funciona en llama.cpp, LM Studio, Ollama ni en otros lectores GGUF. Requiere speech.cpp 0.10.1 o superior.
- Solo se publican pesos en F32; no hay variantes cuantizadas en el repositorio, lo que limita opciones si se busca reducir memoria o aumentar velocidad.
- El procesamiento por trozos de 5 s con solapamiento de medio trozo implica que cada parte del audio se procesa dos veces, reduciendo el throughput a la mitad aproximadamente.
- En CPU el rendimiento es bajo (RTFx 0,17 a 16 kHz en Apple M5), por debajo de tiempo real; no es adecuado para streaming en tiempo real sin GPU.
- No hay informacion sobre sesgos del modelo, composicion del dataset de entrenamiento ni evaluaciones de robustez por idioma o acento. El autor afirma que acepta voz en cualquier idioma, pero no se aportan metricas por lengua.
- Riesgo de artefactos o sobre-suavizado en grabaciones extremadamente degradadas; no se documentan tasas de alucinacion ni de insercion de contenido inexistente, un riesgo propio de los modelos generativos de audio.
- La licencia OpenMDW 1.1 permite uso comercial, pero conviene revisar los terminos completos en `LICENSE.OpenMDW-1.1` y las consideraciones eticas de la model card de NVIDIA antes de desplegarlo en produccion.
- El modelo base es de NVIDIA; este repositorio es una conversion de terceros (sakasegawa) y no cuenta con soporte oficial de NVIDIA.
- No dispone de capacidades de texto, razonamiento, tool calling ni agentes; no debe evaluarse como modelo de lenguaje.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sakasegawa/NVIDIA-NemotronLabs-RE-USE-laughter-GGUF
- Modelo base en Hugging Face: https://huggingface.co/nvidia/NVIDIA-NemotronLabs-RE-USE-laughter
- Consideraciones eticas del modelo base: https://huggingface.co/nvidia/NVIDIA-NemotronLabs-RE-USE-laughter#ethical-considerations
- Variante sin preservacion de risa: https://huggingface.co/sakasegawa/NVIDIA-NemotronLabs-RE-USE-GGUF
- speech.cpp (repositorio): https://github.com/nyosegawa/speech.cpp
- Instalacion de speech.cpp: https://github.com/nyosegawa/speech.cpp#install
- Documentacion del modelo en speech.cpp: https://github.com/nyosegawa/speech.cpp/blob/main/docs/models/semamba.md
- Documentacion de la CLI: https://github.com/nyosegawa/speech.cpp/blob/main/docs/cli.md
- Documentacion del servidor: https://github.com/nyosegawa/speech.cpp/blob/main/docs/server.md
- Script de conversion: https://github.com/nyosegawa/speech.cpp/tree/main/reference/semamba
- Codigo de NVIDIA NemotronLabs RE-USE: https://github.com/nvidia/NVIDIA-NemotronLabs-RE-USE
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
