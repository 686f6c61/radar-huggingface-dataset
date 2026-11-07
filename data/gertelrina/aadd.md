# gertelrina/aadd

## Resumen

AADD (Automatic Audio Degradation Detection) v3.1 es un modelo de clasificación de audio desarrollado por gertelrina que detecta 12 tipos de degradación en grabaciones de voz con una resolución temporal de 20 ms. No es un modelo generativo ni un ASR: es un detector de calidad de audio orientado a la curación de datasets de voz (ASR, TTS) y a la auditoría de grabaciones. Las degradaciones detectables incluyen ruido de fondo, música, reverberación, clipping, filtrado paso bajo y paso alto, artefactos de códec, pérdida de paquetes, zumbido de red eléctrica, clics, cambio de tono (*pitch shift*) y estiramiento temporal (*time stretch*), y pueden coexistir varias en una misma ventana.

El modelo parte del encoder de Whisper-small (88 M de parámetros) y se afina de extremo a extremo para producir una salida sigmoidea por clase y por trama de 20 ms sobre ventanas de 8 s, con soporte para audio de cualquier duración mediante ventanas deslizantes. Está entrenado con voz en inglés (LibriSpeech train-clean-100, 100 h) y ruso (Russian LibriSpeech train, 93 h), con degradaciones sintetizadas al vuelo.

La versión 3.1 (noviembre de 2026) corrige el principal defecto de la 3.0: la confusión de ruido ambiental real (cafeterías, calles, autobuses) con música. Para ello se afinó durante 4000 pasos con 36 h de ruido ambiental real de FSD50K y babble sintético. El modelo se distribuye con licencia MIT y un repositorio de 0,4 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (Whisper-small) con cabeza de clasificación multiclase por trama |
| Parametros totales | 88 M (encoder Whisper-small) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Ventanas de 8 s; audio de cualquier duración mediante ventanas deslizantes |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Inglés (en) y ruso (ru) vistos en entrenamiento |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pt); checkpoint `aadd_v3_1_whisper_small_frames.pt` |
| Resolución temporal | 20 ms por trama; segmentos configurables (por defecto 1,0 s) |
| Clases de degradación | 12 (noise, music, reverb, clipping, low-pass, high-pass, codec, packet loss, mains hum, clicks, pitch shift, time stretch) |
| Modelo base | openai/whisper-small |
| Tamaño del repo | 0,4 GB |

## Arquitectura y entrenamiento

AADD reutiliza el encoder de Whisper-small como extractor de características y lo afina de extremo a extremo junto con una cabeza que emite una probabilidad sigmoidea independiente por cada una de las 12 clases en cada trama de 20 ms. La formulación multietiqueta permite que varias degradaciones estén activas simultáneamente en la misma trama. El entrenamiento se realiza sobre ventanas de 8 s con 0 a 3 eventos de degradación por ventana, aplicados sobre toda la ventana o sobre intervalos de 0,5 a 4 s con inicios aleatorios y un orden fijo de cadena de señal.

Los datos de voz son LibriSpeech train-clean-100 (100 h, inglés) y Russian LibriSpeech train (93 h, ruso), con hablantes de validación y test disjuntos. Las degradaciones se generan al vuelo: ruido y música de MUSAN (−5 a 30 dB SNR para ruido, 0 a 25 dB para música), respuestas al impulso de sala de RIRS_NOISES, clipping duro y suave (2 a 30 % de muestras), filtros Butterworth o por remuestreo paso bajo (1 a 5 kHz) y paso alto (200 a 1000 Hz), códecs MP3 (8 a 41 kbit/s), Opus (10 a 32 kbit/s), Vorbis, GSM, µ-law, A-law, G.721 e IMA-ADPCM, pérdida de paquetes Gilbert-Elliott (5 a 30 %), zumbido de 50/60 Hz, clics, cambio de tono y estiramiento temporal.

La versión 3.1 se obtuvo afinando la 3.0 durante 4000 pasos con 36 h de ruido ambiental real de FSD50K (solo clips CC0/CC BY, sin etiquetas de música ni voz) y babble sintético añadido a la clase de ruido. No se documenta en la información disponible el uso de RLHF ni DPO, algo esperable en un modelo discriminativo de clasificación.

## Capacidades

- Detección multietiqueta de 12 tipos de degradación de audio con resolución de 20 ms.
- Localización temporal de eventos: identifica en qué tramas aparece cada degradación, no solo si existe en el clip.
- Manejo de audio de duración arbitraria mediante ventanas deslizantes de 8 s.
- Detección simultánea de hasta tres degradaciones solapadas con inicios aleatorios.
- Puntuación a nivel de clip (percentil 95 de las probabilidades por trama) y agregación por segmentos configurables.
- Funciona sobre voz en inglés y ruso; no se documenta soporte para otros idiomas.
- Salida estructurada por trama (`frame_probs`, forma `(n_frames_20ms, 12)`) apta para pipelines de curación automática.
- CLI (`aadd scan`) con generación de informes HTML y exportación de segmentos a CSV.
- API de Python (`Detector`) con resolución configurable.
- Inferencia en CPU y en GPU Apple (MPS); no se documenta soporte específico de CUDA más allá de que "en GPU NVIDIA es mucho más rápido".

## Casos de uso

- Curación de datasets ASR: escanear un corpus completo con `aadd scan my_dataset/ --report report.html` para descartar o etiquetar clips con ruido, reverberación o clipping antes de entrenar un modelo de reconocimiento de voz.
- Curación de datasets TTS: filtrar grabaciones con zumbido de red, clics o artefactos de códec que degradarían la calidad del habla sintetizada; el detector localiza las tramas afectadas y permite recortar solo esas regiones.
- Auditoría de calidad de grabaciones telefónicas o de call center: detectar pérdida de paquetes, códecs de baja tasa (GSM, Opus 10 kbit/s) y filtrado de banda estrecha para priorizar la re-grabación o la reparación.
- Monitorización de pipelines de captura en producción: integrar el detector como paso de validación tras la ingesta de audio, con umbrales sobre `detected` para rechazar automáticamente ficheros con SNR insuficiente o reverberación excesiva.
- Verificación de cadenas de procesado de audio: comprobar si un paso de *denoising*, *de-reverb* o compresión ha introducido artefactos no deseados comparando las detecciones antes y después.
- Investigación en calidad de audio: usar las probabilidades por trama como etiquetas débiles o *features* para entrenar modelos de mejora de voz o para analizar la distribución de degradaciones en un corpus.
- Selección de subconjuntos de evaluación: construir *test sets* controlados por tipo y severidad de degradación a partir de un corpus limpio, filtrando con el detector para garantizar la pureza de las condiciones.

## Benchmarks y rendimiento

**Grabaciones reales fuera de dominio** (nunca vistas en entrenamiento; puntuación de clip = percentil 95 de las probabilidades por trama):

| Conjunto | Clase | ROC-AUC | Recall a p ≥ 0,5 | Falsas alarmas en limpio | Detecciones de música (sin música) |
|---|---|---|---|---|---|
| VoiceBank-DEMAND test, 824 ruidosos vs 824 limpios | noise | 0,992 | 0,60 | 0,0 % | 13,9 % de clips (v3.0: 21,1 %) |
| DNS Challenge 2020 synthetic dev-test, 600 clips | noise | 0,998 | 0,91 | 0,0 % | 8,2 % (v3.0: 11,3 %) |
| DNS Challenge 2020 synthetic dev-test, 600 clips | reverberation | 1,000 | 1,00 | 0,0 % | — |
| Dynamic-SUPERB noise detection (VCTK + MUSAN) | noise | 0,992 | 0,96 | 2,2 % | 0,5 % |
| Dynamic-SUPERB reverberation, sala pequeña / media / grande | reverberation | 0,994 / 1,000 / 0,996 | 0,98 / 1,00 / 0,97 | 0 % | 0–1,5 % |

**Conjuntos sintéticos retenidos** (hablantes, ruidos y salas no vistos; hasta tres degradaciones solapadas con inicios aleatorios):

| Conjunto | Frame macro-AP (20 ms) | Macro-F1 por segmento de 1 s | Macro-AUC por clip |
|---|---|---|---|
| Inglés (LibriSpeech test-clean), 3000 × 8 s | 0,955 | 0,905 | 0,989 |
| Ruso (Russian LibriSpeech test), 3000 × 8 s | 0,960 | 0,881 | 0,987 |
| Inglés, RIRs medidas reales | 0,954 | 0,902 | 0,991 |
| Inglés, RIRs del MIT IR survey | 0,946 | 0,883 | 0,990 |

**Frame AP por clase (inglés / ruso):** pitch shift 0,999 / 0,993; time stretch 0,999 / 0,994; low-pass 0,996 / 0,994; clipping 0,993 / 0,997; packet loss 0,991 / 0,992; high-pass 0,991 / 1,000; music 0,985 / 0,990; reverberation 0,985 / 0,991; clicks 0,976 / 0,979; codec 0,925 / 0,961; background noise 0,898 / 0,799; mains hum 0,726 / 0,825.

**Velocidad** (extremo a extremo: decodificación, características y modelo, un proceso): 23 ms por segundo de audio en CPU (43× tiempo real, unos 84 s por hora de audio) y 6,5 ms en GPU Apple (MPS), medidos en un MacBook Pro M3 Pro (6+6 núcleos de CPU, GPU de 18 núcleos, 36 GB), macOS 15.7, PyTorch 2.15, sobre 300 ficheros de LibriSpeech.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 88 M de parámetros en fp32 el modelo ocupa aproximadamente 350 MB, por lo que la huella de memoria es muy reducida.
- GPU recomendadas: cualquier GPU con suficiente memoria para un modelo de 88 M; el autor indica que en GPU NVIDIA es "mucho más rápido" que en CPU, sin cifras concretas. Una RTX 4090, A100 o H100 no suponen ninguna restricción por memoria.
- Cabe en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en iGPU y en CPU. También se ha validado en GPU Apple (MPS).
- Opciones de despliegue: CLI `aadd scan`, API de Python (`from aadd import Detector`), descarga directa del checkpoint con `huggingface_hub`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; el modelo es PyTorch puro y no está pensado para esos servidores de inferencia.
- Latencia y throughput: 23 ms por segundo de audio en CPU (43× tiempo real) y 6,5 ms por segundo de audio en MPS, medidos en un M3 Pro.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / ventana | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| AADD v3.1 | Detección de degradación de audio (12 clases, 20 ms) | 88 M | Ventanas de 8 s, audio arbitrario por ventanas deslizantes | en, ru | MIT | Hugging Face + GitHub |
| Whisper-small (base) | ASR / traducción | 244 M | 30 s | ~99 idiomas | MIT | Hugging Face, OpenAI |
| Modelos de calidad de voz tipo DNS / PESQ | Métricas de calidad (no clasificadores por trama) | no disponible | Clip completo | independiente del idioma | varía | varía |

No se dispone en la información proporcionada de otros detectores de degradación comparables con los que establecer una comparación cuantitativa directa. La comparación con Whisper-small es pertinente porque AADD reutiliza su encoder, pero las tareas son distintas (clasificación multietiqueta por trama frente a transcripción).

## Limitaciones y advertencias

- Solo se ha entrenado con voz en inglés y ruso; el rendimiento en otros idiomas no está validado y podría degradarse.
- La clase `mains hum` es la más débil en los tests sintéticos (frame AP 0,726 en inglés y 0,825 en ruso), seguida de `background noise` en ruso (0,799). No debe asumirse la misma fiabilidad para todas las clases.
- En ruido leve (VoiceBank-DEMAND, SNR 2,5 a 17,5 dB) el modelo es conservador en el umbral por defecto: el recall a p ≥ 0,5 es solo 0,60. El autor recomienda bajar el umbral al filtrar datos, lo que incrementará las falsas alarmas.
- Persisten falsos positivos de música en ruido ambiental real: 13,9 % de clips en VoiceBank-DEMAND y 8,2 % en DNS Challenge 2020. El ruido de "living room" de DEMAND conserva un 86 % de detecciones de música, probablemente porque contiene tonos armónicos sostenidos (música o TV).
- El modelo está entrenado con degradaciones sintetizadas al vuelo; el autor reporta resultados en grabaciones reales fuera de dominio, pero la distribución de degradaciones reales puede diferir de la de entrenamiento.
- Es un clasificador discriminativo: no transcribe, no mejora el audio ni genera texto. No debe usarse como sustituto de un ASR ni de una métrica perceptual de calidad (PESQ, STOI).
- Licencia MIT: permite uso comercial y modificación, pero se recomienda conservar el aviso de copyright. El modelo base Whisper-small es también MIT.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica una adopción muy temprana; no hay evidencia de uso en producción a gran escala.
- La fecha de creación del repositorio (2026-11-05) y la actualización (2026-11-07) son posteriores a la versión 3.1 documentada; conviene verificar que el checkpoint servido coincide con la versión descrita.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gertelrina/aadd
- Repositorio GitHub (código, CLI, API, informe interactivo): https://github.com/gertelrina/aadd
- Releases del repositorio: https://github.com/gertelrina/aadd/releases
- Perfil del autor en GitHub: https://github.com/gertelrina
- Modelo base: https://huggingface.co/openai/whisper-small
- Dataset LibriSpeech ASR: https://huggingface.co/datasets/openslr/librispeech_asr
- Dataset Russian LibriSpeech: https://huggingface.co/datasets/istupakov/russian_librispeech
