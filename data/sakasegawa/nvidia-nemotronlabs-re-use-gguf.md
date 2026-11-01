# sakasegawa/NVIDIA-NemotronLabs-RE-USE-GGUF

## Resumen

NVIDIA NemotronLabs RE-USE es un modelo de mejora de voz (speech enhancement) desarrollado por NVIDIA Labs. Se trata de una red SEMamba de 9,6 millones de parámetros que recibe audio de voz grabada y devuelve la misma grabación limpia, muestreando a la misma frecuencia de entrada. No es un modelo de lenguaje: su pipeline es `audio-to-audio` y su función es eliminar ruido, reverberación, clipping, limitaciones de banda y daños de códec, además de aislar al hablante principal cuando hay voces solapadas.

Esta ficha concreta corresponde a una conversión a formato GGUF realizada por el usuario sakasegawa para el runtime speech.cpp 0.10.1 o superior. El archivo GGUF emplea el layout propio de speech.cpp, por lo que no es compatible con llama.cpp, LM Studio, Ollama ni otros lectores GGUF estándar. El repositorio incluye los pesos en F32 (38,5 MB), los ajustes de STFT y los fragmentos del `inference_chunk.py` oficial.

Su relevancia actual radica en que permite ejecutar un modelo de mejora de voz de NVIDIA en local, sobre CPU, Metal o Vulkan, con un consumo de recursos mínimo (38,5 MB de pesos) y con integración directa en pipelines de reconocimiento automático de voz (ASR) mediante speech.cpp.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SEMamba (red neuronal para mejora de voz) |
| Parámetros totales | 9.607.747 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de audio, procesa fragmentos de 5 s con solapamiento de medio fragmento) |
| Tipos de cuantización | F32 (única variante publicada en este repo) |
| Idiomas soportados | no disponible (el modelo procesa voz en cualquier idioma; no es un modelo lingüístico) |
| Licencia | OpenMDW License Agreement, versión 1.1 |
| Formato de pesos | GGUF (layout propio de speech.cpp); origen en safetensors (`model.safetensors`, 38.592.940 bytes) |

## Arquitectura y entrenamiento

El modelo es una red SEMamba, una arquitectura basada en state space models (Mamba) aplicada a la mejora de voz. Consta de bloques TFMamba que procesan la señal en el dominio de la frecuencia mediante STFT; el archivo GGUF incluye los ajustes de STFT y los fragmentos del script oficial `inference_chunk.py`. El proceso divide el audio en fragmentos de 5 segundos que comienzan cada medio fragmento, de modo que cada parte del audio se procesa dos veces (salvo en el modo de mejora de una locución completa, que la procesa una sola vez).

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la documentación proporcionada. La conversión a GGUF se realizó desde `model.safetensors` de `nvidia/NVIDIA-NemotronLabs-RE-USE` en la revisión `31f82f2efad1095034492f236e8dac9239ba713b`, usando el script `reference/semamba/convert.py` de speech.cpp. La verificación de precisión compara cada etapa con el código oficial: los bloques TFMamba se sitúan a 124,7–125,8 dB del original en CPU y Metal, la red a 64,8–113,7 dB por fragmento y el audio mejorado a 30,1–67,7 dB; en una RTX 2080 con Vulkan los bloques quedan a 109,3 dB y la red a 78,5 dB o más.

## Capacidades

- Mejora de voz extremo a extremo: elimina ruido, reverberación, clipping, limitaciones de banda y daños de códec.
- Acepta audio de 8 a 48 kHz y devuelve la misma frecuencia de muestreo que la entrada.
- Aislamiento del hablante principal en grabaciones con voces solapadas (descarta el resto de voces).
- Extensión de banda (BWE): con `--bwe 48000` remuestrea primero a 48 kHz para ampliar la banda de la señal.
- Procesamiento independiente del idioma: no requiere conocer el idioma de la voz.
- Integración con ASR: opción `--enhance` para mejorar cada archivo completo antes de reconocerlo.
- Servicio HTTP: `speech serve re-use` expone el endpoint `POST /v1/audio/enhancements`.
- API en C: función `speech_enhance()` y variante para procesar audio por partes.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: no es un modelo de lenguaje.

## Casos de uso

- Limpieza de grabaciones de campo o entrevistas: el modelo elimina ruido de fondo y reverberación manteniendo la voz original, útil para periodismo, investigación cualitativa o archivos orales.
- Preprocesado para pipelines ASR: la mejora previa reduce la tasa de error de palabra en entornos ruidosos; según la model card, baja el WER de parakeet-tdt-0.6b-v3 en LibriSpeech test-clean con ruido de pub a 0 dB del 9,13 % al 8,18 %.
- Restauración de audio telefónico: con `--bwe 48000` se remuestrea y se amplía la banda de una llamada telefónica para mejorar su inteligibilidad antes de transcribirla o archivarla.
- Atención al cliente y centros de llamadas: limpieza de grabaciones de llamadas con ruido de fondo, clipping o códec dañado antes de su análisis o almacenamiento.
- Aislamiento de hablante en reuniones o grabaciones con solapamiento: el modelo conserva al hablante principal y descarta las voces secundarias, útil para diarización previa o para generar resúmenes de una sola voz.
- Procesamiento por lotes en servidor: el endpoint `POST /v1/audio/enhancements` permite ofrecer la mejora como microservicio dentro de una infraestructura existente.
- Mejora en tiempo casi real en dispositivos de consumo: con 38,5 MB de pesos y RTFx de 2,86 en un Apple M5 con Metal a 16 kHz, es viable en portátiles y equipos sin GPU dedicada.

## Benchmarks y rendimiento

Precisión frente al código oficial (commit 31f82f2, nueve entradas de FLEURS con ruido babble o blanco, 8–48 kHz):

| Etapa | Distancia respecto al oficial |
|---|---|
| Bloques TFMamba (Apple M5, CPU y Metal) | 124,7–125,8 dB |
| Red completa por fragmento | 64,8–113,7 dB |
| Audio mejorado | 30,1–67,7 dB |
| Bloques TFMamba (RTX 2080, Vulkan) | 109,3 dB |
| Red completa (RTX 2080, Vulkan) | ≥ 78,5 dB |

Impacto en ASR (mejora previa al reconocimiento):

| Modelo ASR | Conjunto y condición | Sin mejora | Con mejora |
|---|---|---|---|
| parakeet-tdt-0.6b-v3 | LibriSpeech test-clean, ruido de pub a 0 dB (WER) | 9,13 % | 8,18 % |
| reazonspeech-v2 | FLEURS ja, ruido de multitud a 0 dB (CER) | 9,99 % | 9,06 % |
| reazonspeech-v2 | ReazonSpeech (televisión japonesa) (CER) | 4,69 % | 8,36 % |
| Qwen3-ASR 1.7B | FLEURS ja, ruido de multitud a 0 dB (CER) | 9,33 % | 9,06 % |
| Qwen3-ASR 1.7B | ruido de pub (WER) | no disponible | empeora ligeramente |

Velocidad (RTFx, 60 s de voz ruidosa, mediana de tres ejecuciones, 2026-11-01):

| Dispositivo | 16 kHz | 48 kHz |
|---|---|---|
| Apple M5, Metal | 2,86 | 0,96 |
| Apple M5, CPU | 0,17 | no ejecutado |
| NVIDIA GeForce RTX 2080, Vulkan | 3,29 | 1,15 |

## Requisitos de hardware

- VRAM estimada: mínima; los pesos ocupan 38,5 MB en F32, por lo que cabe en cualquier GPU con más de 1 GB de memoria.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Con aceleración, Apple M5 (Metal) y NVIDIA RTX 2080 (Vulkan) están verificados.
- Cabe en cualquier GPU de consumo, incluida una RTX 2080 o inferior, y en portátiles Apple Silicon.
- Despliegue: exclusivamente mediante speech.cpp 0.10.1 o superior (CLI `speech enhance`, servidor `speech serve` y API en C `speech_enhance()`). No es compatible con llama.cpp, LM Studio, Ollama ni TGI.
- Latencia y throughput: RTFx de 3,29 en RTX 2080 con Vulkan a 16 kHz y 2,86 en Apple M5 con Metal; en CPU Apple M5 cae a 0,17 (unas 6 veces más lento que tiempo real). A 48 kHz el RTFx baja a 1,15 en RTX 2080 y 0,96 en M5.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Licencia | Runtime | Notas |
|---|---|---|---|---|---|
| NVIDIA NemotronLabs RE-USE (este GGUF) | 9,6 M | GGUF (speech.cpp) | OpenMDW 1.1 | speech.cpp ≥ 0.10.1 | Elimina ruido y conserva al hablante principal |
| NVIDIA NemotronLabs RE-USE-laughter (GGUF de sakasegawa) | no disponible | GGUF (speech.cpp) | OpenMDW 1.1 | speech.cpp ≥ 0.10.1 | Variante que conserva la risa, que este modelo elimina con el ruido |
| NVIDIA NemotronLabs RE-USE (original) | 9,6 M | safetensors | OpenMDW 1.1 | Código oficial de NVIDIA (PyTorch) | Referencia de precisión frente a la que se valida esta conversión |

No se dispone de información sobre otros modelos comparables de mejora de voz en la documentación proporcionada.

## Limitaciones y advertencias

- Solo funciona en speech.cpp 0.10.1 o superior; el layout GGUF es propio y no lo leen llama.cpp, LM Studio, Ollama ni otros lectores GGUF.
- Elimina las voces secundarias en audio con solapamiento: puede ser indeseable si se necesita conservar todas las voces (para eso existe la variante `re-use-laughter`, que conserva la risa).
- Puede degradar el ASR en audio ya limpio: en ReazonSpeech (televisión japonesa) el CER de reazonspeech-v2 sube del 4,69 % al 8,36 %, y el WER de Qwen3-ASR 1.7B bajo ruido de pub empeora ligeramente.
- El beneficio depende del modelo ASR: Qwen3-ASR 1.7B, que ya comete menos errores en ruido, gana menos con la mejora.
- Cada fragmento de audio se procesa dos veces en el modo por fragmentos (5 s con salto de medio fragmento), lo que duplica el coste computacional frente a la mejora de una locución completa.
- En CPU el rendimiento es bajo (RTFx 0,17 en Apple M5 a 16 kHz), por debajo de tiempo real.
- No se han documentado sesgos específicos del modelo en la información disponible; la model card original de NVIDIA incluye consideraciones éticas enlazadas.
- Licencia OpenMDW 1.1: conviene revisar sus términos antes de un uso comercial; el repositorio incluye `LICENSE.OpenMDW-1.1`.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; es una conversión reciente (creada el 2026-11-01) sin validación comunitaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/sakasegawa/NVIDIA-NemotronLabs-RE-USE-GGUF
- Modelo original: https://huggingface.co/nvidia/NVIDIA-NemotronLabs-RE-USE
- Variante que conserva la risa: https://huggingface.co/sakasegawa/NVIDIA-NemotronLabs-RE-USE-laughter-GGUF
- speech.cpp: https://github.com/nyosegawa/speech.cpp
- Instalación de speech.cpp: https://github.com/nyosegawa/speech.cpp#install
- Documentación del modelo en speech.cpp: https://github.com/nyosegawa/speech.cpp/blob/main/docs/models/semamba.md
- Documentación de la CLI: https://github.com/nyosegawa/speech.cpp/blob/main/docs/cli.md
- Documentación del servidor: https://github.com/nyosegawa/speech.cpp/blob/main/docs/server.md
- Script de conversión: https://github.com/nyosegawa/speech.cpp/tree/main/reference/semamba
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Consideraciones éticas del modelo original: https://huggingface.co/nvidia/NVIDIA-NemotronLabs-RE-USE#ethical-considerations
