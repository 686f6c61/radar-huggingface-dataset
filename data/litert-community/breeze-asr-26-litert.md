# litert-community/Breeze-ASR-26-LiteRT

## Resumen

Breeze-ASR-26-LiteRT es la exportación a LiteRT (`.tflite`) del modelo Breeze-ASR-26 de MediaTek Research y la NYCU, un fine-tune de Whisper large-v2 de 1.550 millones de parámetros especializado en transcribir habla en hokkien taiwanés (taigi) a caracteres de mandarín. El repositorio lo publica la organización comunitaria `litert-community` y su función es ofrecer una alternativa de inferencia en CPU sin dependencia de PyTorch, pensada para despliegues en escritorio x86 y en dispositivos Android.

La diferencia técnica más relevante respecto a otras exportaciones Whisper de la misma organización es que el decodificador conserva una caché de clave/valor de 256 posiciones, de modo que cada paso de decodificación procesa un único token nuevo en lugar de toda la ventana. El paquete es un único fichero de 1,57 GB con pesos en int8 de rango dinámico y activaciones en float32, que procesa ventanas de audio de 30 segundos.

Su relevancia actual es doble: por un lado, lleva un modelo de ASR especializado en una lengua de bajos recursos (nan, hokkien taiwanés) a un formato ejecutable en hardware de consumo y en móviles; por otro, documenta con detalle el proceso de exportación y las métricas de fidelidad frente al modelo original, algo poco habitual en conversiones cuantizadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder tipo Whisper large-v2, con caché KV en el decodificador |
| Parámetros totales | 1,55 mil millones (modelo base) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | Ventana de audio de 30 s; caché del decodificador de 256 posiciones |
| Tipos de cuantización | int8 de rango dinámico en pesos, activaciones float32 |
| Idiomas soportados | `nan` (hokkien taiwanés, entrada) y `zh` (mandarín, salida) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.tflite` (LiteRT); 1,57 GB |

## Arquitectura y entrenamiento

El modelo subyacente es un fine-tune de Whisper large-v2 realizado por MediaTek Research y la NYCU, descrito en el paper arXiv:2603.19259. La arquitectura es la estándar de Whisper: encoder Transformer que consume espectrogramas log-mel de 80 canales y decodificador autorregresivo que genera tokens de texto. La exportación a LiteRT divide el grafo en dos firmas: `encode`, que procesa una ventana de 30 s y emite las proyecciones cross-attention (32 tensores de clave y valor de forma `[1, 1500, 20, 64]`), y `decode`, que ejecuta un paso autorregresivo con caché propia de `[1, 256, 20, 64]`.

La innovación destacable de esta exportación es precisamente esa caché KV de 256 posiciones: en un servidor Linux x86-64, un paso de decodificación tarda 47 ms frente a los 403 ms de la exportación `export_hf` sin caché con la misma receta int8, es decir, aproximadamente 8,5 veces menos. No se dispone de información sobre la composición exacta del dataset de entrenamiento, el número de tokens utilizados ni si hubo fases de RLHF o DPO; la model card del modelo base indica únicamente que se entrenó con habla sintética.

## Capacidades

- Transcripción de voz en hokkien taiwanés (taigi) a caracteres de mandarín.
- Procesamiento de audio a 16 kHz mono, con ventanas fijas de 30 segundos.
- Decodificación greedy con supresión de tokens configurable (`suppress_tokens` y `begin_suppress_tokens` del modelo base).
- Inferencia en CPU pura mediante XNNPACK, sin necesidad de PyTorch ni de GPU.
- Ejecución en Android a través de la API Kotlin `CompiledModel` de LiteRT.
- Caché de pesos XNNPACK persistente para reducir tiempos de carga y memoria pico.
- No soporta tool calling, function calling, agentes, visión, audio de entrada más allá del ASR ni modo de razonamiento extendido.

## Casos de uso

- Transcripción offline de audio en hokkien taiwanés: el modelo convierte grabaciones de hablantes de taigi en texto mandarín, útil para archivar material audiovisual en esa lengua sin depender de servicios en la nube.
- Subtitulado por lotes en servidores sin GPU: con 47 ms por paso de decodificación en x86-64 y 4 s por ventana de 30 s en un i7-12700KF, se pueden procesar horas de audio en un servidor CPU convencional.
- Aplicaciones Android de accesibilidad: integrado mediante LiteRT 2.3.2 y la API Kotlin, permite transcribir en el propio dispositivo; en un Galaxy A71 5G una ventana tarda entre 21 y 24 s en codificar, adecuado para dictado diferido y no para subtitulado en vivo.
- Digitalización de anuncios y comunicados oficiales: el modelo se evaluó sobre 37 comunicados del Yuan Ejecutivo (febrero de 2024 a abril de 2026) con un CER medio del 37,18 %, por lo que encaja en flujos de transcripción asistida con revisión humana.
- Investigación lingüística sobre taigi: permite generar transcripciones masivas de corpus orales para análisis léxico o fonético, con la ventaja de que el tokenizador y el extractor de características provienen del modelo base y son reproducibles.
- Despliegue en entornos con restricciones de memoria: con la caché de pesos XNNPACK activada, el pico de RSS baja a 2,6 GB, lo que permite ejecutarlo en máquinas modestas o en contenedores con límites ajustados.
- Prototipado rápido sin PyTorch: el script `transcribe.py` descarga el modelo en la primera ejecución y solo requiere `ai-edge-litert`, `transformers`, `librosa` y `huggingface_hub`.

## Benchmarks y rendimiento

Rendimiento en CPU con XNNPACK, caché de pesos activada y decodificación greedy:

| Dispositivo | Hilos | Encode (ventana 30 s) | Paso de decode | RSS pico |
|---|---|---|---|---|
| Intel Core i7-12700KF, Ubuntu en WSL2, ai-edge-litert 2.3.0 | 8 | 4,0 s | 79–81 ms | 2,6 GB |
| Samsung Galaxy A71 5G (Exynos 980, Android 13), LiteRT 2.3.2 | 4 | 21,4–23,6 s | 612–648 ms | 2,6 GB |

Fidelidad frente al modelo original (transformers, float32, greedy) sobre el split de test completo de TaigiSpeech (960 clips, 6 hablantes, CC BY 4.0):

| Métrica | Valor |
|---|---|
| Clips con tokens idénticos | 738 de 960 (76,9 %; IC 95 % 74,2–79,5 %) |
| Caracteres distintos | 4,88 % (IC 95 % 4,10–5,68 %) |

CER sobre comunicados gubernamentales (37 anuncios, febrero de 2024 a abril de 2026, referencia en mandarín oficial):

| Sistema | CER medio |
|---|---|
| Breeze-ASR-26 en transformers, float32 | 39,11 % |
| Este fichero `.tflite` | 37,18 % |

La diferencia de −1,94 puntos (IC 95 % −5,90 a +0,41) no es estadísticamente significativa. Ambos valores superan el 30,13 % del paper, atribuible a diferencias en los clips, a que la referencia es el guion sin refinar y a la ausencia de normalización de numerales. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, por tratarse de un modelo de ASR.

## Requisitos de hardware

- VRAM: no aplica; la inferencia es exclusivamente en CPU.
- Memoria RAM: pico de RSS de 2,6 GB con caché de pesos XNNPACK activada; sin ella, 4,1 GB.
- GPU recomendadas: no disponible; el formato `.tflite` con XNNPACK está orientado a CPU.
- CPU de referencia validada: Intel Core i7-12700KF (8 hilos) y Exynos 980 (4 hilos).
- Cabe en hardware de consumo y en móviles Android de gama media; en el Galaxy A71 5G funciona, aunque con latencias de decodificación de 612–648 ms por token.
- Opciones de despliegue: LiteRT (`ai-edge-litert` en Python, `com.google.ai.edge.litert:litert:2.3.2` en Kotlin, Kotlin 2.3 o superior). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia: unos 6 s de extremo a extremo para un clip de 11,1 s en el escritorio de referencia (encode 4,00 s, decode 2,04 s en 26 pasos); entre 33,7 y 37,5 s para clips de 5,0 y 6,1 s en el Galaxy A71.
- Caché de pesos: fichero de 1,55 GB que reduce la carga de 0,7–0,9 s a 0,05 s.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / ventana | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Breeze-ASR-26-LiteRT | 1,55 B | 30 s de audio, caché KV de 256 | `.tflite` int8 | Apache 2.0 | Inferencia CPU, caché KV, validado en Android |
| Breeze-ASR-26 (original) | 1,55 B | 30 s de audio | safetensors (transformers) | Apache 2.0 | Requiere PyTorch; referencia de precisión float32 |
| Exportación `export_hf` de LiteRT (sin caché) | 1,55 B | 30 s de audio | `.tflite` int8 | Apache 2.0 | 403 ms por paso de decode frente a 47 ms con caché |
| Whisper large-v2 estándar | 1,55 B | 30 s de audio | safetensors, GGUF, etc. | MIT | Multilingüe general; no especializado en taigi |

## Limitaciones y advertencias

- El modelo escribe caracteres de mandarín, no ortografía taigi; no produce transcripción en la lengua original.
- Se entrenó con habla sintética, por lo que la precisión puede degradarse con acentos fuertes, dialectos y terminología especializada, según advierte la model card del modelo base.
- El CER del 37,18 % sobre comunicados oficiales es alto en términos absolutos; el modelo no es apto para transcripción sin revisión humana en contextos de precisión.
- `transcribe.py` corta el audio en fronteras fijas de 30 s, de modo que una palabra situada en el límite puede perderse o quedar truncada.
- La caché KV debe ponerse a cero antes de la primera llamada: un búfer nuevo puede contener NaN y la máscara de atención no lo oculta.
- No existe firma de prefill; el prompt `<|startoftranscript|><|zh|><|transcribe|><|notimestamps|>` (tokens 50258, 50260, 50359, 50363) debe decodificarse token a token en las posiciones 0–3.
- La salida puede diferir ligeramente entre arquitecturas de CPU: un clip que difiere del original en x86 coincidió en el A71.
- No se incluye frontend log-mel en Kotlin; en Android hay que calcular las características por otros medios.
- En el Galaxy A71 5G las latencias (33–37 s para clips de 5–6 s) descartan el uso en subtitulado en vivo.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda conservar los avisos de atribución y verificar las condiciones del modelo base.
- Riesgo de alucinación y de repeticiones: el modelo original repite frases hasta el límite en algunos clips, y dos de ellos quedaron excluidos de la métrica de fidelidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/litert-community/Breeze-ASR-26-LiteRT
- Modelo base: https://huggingface.co/MediaTek-Research/Breeze-ASR-26
- Paper: https://arxiv.org/abs/2603.19259
- LiteRT: https://ai.google.dev/edge/litert
- Dataset TaigiSpeech: https://huggingface.co/datasets/TaigiSpeech/TaigiSpeech
