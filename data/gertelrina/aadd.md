# gertelrina/aadd

## Resumen

AADD (Automatic Audio Degradation Detection) v3.1 es un modelo de clasificación de audio desarrollado por el usuario gertelrina, pensado para detectar y localizar 12 tipos de degradación en grabaciones de voz con una resolución temporal de 20 ms. Se construye mediante fine-tuning end-to-end del encoder de Whisper-small (88 M de parámetros) y produce una salida sigmoidea por clase y por trama, lo que permite identificar degradaciones simultáneas y su extensión temporal exacta. El modelo se distribuye bajo licencia MIT y está pensado para la curación de datasets de voz (ASR, TTS) y la auditoría de grabaciones.

La relevancia del modelo radica en su enfoque: en lugar de limitarse a clasificar clips completos, localiza cada degradación en el tiempo, algo crítico para filtrar datasets de entrenamiento sin descartar audio limpio. La versión 3.1 corrige un problema de la v3.0 que confundía ruido de fondo real (cafeterías, calles, autobuses) con música, reduciendo los falsos positivos de "music" del 42 % al 28 % en VoiceBank-DEMAND y del 23 % al 16 % en DNS-2020.

El modelo solo ha visto inglés y ruso durante el entrenamiento, con un tamaño de repositorio de 0,4 GB y 281 descargas en Hugging Face. Su velocidad de inferencia (23 ms por segundo de audio en CPU, 6,5 ms en GPU Apple MPS) lo hace viable para procesar datasets completos en pipelines de curación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper-small encoder (transformer) con cabeza de clasificación multi-etiqueta por trama |
| Parametros totales | 88 M (backbone Whisper-small) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventanas de 8 s con solapamiento deslizante para audio de cualquier duración |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en), ruso (ru) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`, fichero `aadd_v3_1_whisper_small_frames.pt`) |
| Resolución temporal | 20 ms por trama |
| Clases detectadas | 12 (noise, music, reverb, clipping, low-pass, high-pass, codec, packet loss, mains hum, clicks, pitch shift, time stretch) |
| Pipeline | audio-classification |
| Tamaño del repositorio | 0,4 GB |

## Arquitectura y entrenamiento

AADD v3.1 parte del encoder de Whisper-small (88 M de parámetros) y se afina end-to-end con una cabeza de clasificación que emite una probabilidad sigmoidea independiente por cada una de las 12 clases de degradación en cada trama de 20 ms. El modelo opera sobre ventanas de 8 segundos y, mediante ventanas deslizantes, procesa audio de duración arbitraria. La salida por trama permite localizar degradaciones con precisión temporal y detectar varias simultáneamente.

El entrenamiento de la v3.1 consistió en un run de 10 000 pasos (lr 1e-5 en el encoder, 3e-4 en la cabeza, 500 pasos de warm-up, scheduler coseno, semilla 1) sobre la v3.0, añadiendo aproximadamente 36 horas de ruido ambiental real de FSD50K (solo clips CC0 / CC BY, sin etiquetas de música ni voz) y babble de multitud sintético a la clase `noise`. Se seleccionó el checkpoint del paso 4 000 con mejor AP de validación. Los datos base de entrenamiento provienen de LibriSpeech (inglés) y Russian LibriSpeech (ruso). No se especifica en la información disponible si hubo RLHF, DPO ni otras técnicas de alineación, algo esperable en un modelo discriminativo de este tipo.

## Capacidades

- Detección multi-etiqueta de 12 tipos de degradación de audio: ruido de fondo, música, reverberación, clipping, filtrado paso bajo / banda estrecha, filtrado paso alto, artefactos de códec, pérdida de paquetes, zumbido de red (mains hum), clics, pitch shift y time stretch.
- Localización temporal a 20 ms de cada degradación, con detección simultánea de varias degradaciones solapadas y onsets aleatorios.
- Procesamiento de audio de duración arbitraria mediante ventanas deslizantes de 8 s.
- Salida configurable por resolución: `resolution=0.1` para segmentos de 0,1 s, `resolution=1.0` por defecto, y acceso a las probabilidades por trama de 20 ms en `res.frame_probs` (forma `(n_frames_20ms, 12)`).
- Agregación a nivel de clip mediante percentil 95 de las probabilidades por trama (umbral por defecto 0,5).
- Uso en CPU y GPU Apple (MPS); no se menciona soporte explícito de CUDA en la información disponible, aunque al ser PyTorch es previsible.
- No soporta tool calling, agentes, visión, audio generativo ni razonamiento multi-paso: es un clasificador discriminativo.

## Casos de uso

- Curación de datasets ASR: escanear corpus completos con `aadd scan my_dataset/ --report report.html` para identificar y filtrar clips con ruido, reverberación o clipping antes del entrenamiento, evitando descartar audio limpio gracias a la localización por tramas.
- Curación de datasets TTS: auditar grabaciones de estudio y descartar tomas con zumbido de red, clics o artefactos de códec que degradarían la calidad del modelo generativo.
- Auditoría de calidad de grabaciones: generar informes HTML con la localización temporal de cada degradación en llamadas o reuniones, útil para equipos de QA de audio.
- Detección de pérdida de paquetes y artefactos de códec en pipelines de telefonía VoIP: identificar tramos concretos con packet loss para su reenvío o reparación.
- Monitorización de streams en producción: procesar audio en tiempo real (43× en CPU, ~150× en MPS) para alertar de degradaciones emergentes como clipping o zumbido.
- Filtrado previo a transcripción: descartar o marcar segmentos ruidosos antes de pasarlos a un ASR, mejorando la precisión efectiva del pipeline al evitar alucinaciones del transcriptor en audio degradado.
- Investigación en calidad de audio: usar las probabilidades por trama como señal débil o feature para modelos de mejora de voz (speech enhancement) o para analizar la distribución de degradaciones en un corpus.

## Benchmarks y rendimiento

Resultados en benchmarks públicos de ruido y reverberación no usados en entrenamiento (mezclas de voz de estudio con ruido real y salas reales o simuladas). Clip score = percentil 95 de las probabilidades por trama.

| Conjunto | Clase | ROC-AUC | Recall a p ≥ 0,5 | Falsos positivos en limpio (p ≥ 0,5) | Detecciones de música sin música presente |
|---|---|---|---|---|---|
| VoiceBank-DEMAND test (824 ruidosos vs 824 limpios) | noise | 0,992 | 0,60 | 0,0 % | 28 % (v3.0: 42 %) |
| DNS Challenge 2020 synthetic dev-test (600 clips) | noise | 0,998 | 0,91 | 0,0 % | 16 % (v3.0: 23 %) |
| DNS Challenge 2020 synthetic dev-test (600 clips) | reverberation | 1,000 | 1,00 | 0,0 % | — |
| Dynamic-SUPERB noise detection (VCTK + MUSAN) | noise | 0,992 | 0,96 | 2,2 % | 0,5 % |
| Dynamic-SUPERB reverberation, sala pequeña / mediana / grande | reverberation | 0,994 / 1,000 / 0,996 | 0,98 / 1,00 / 0,97 | 0 % | 0–1,5 % |

Conjuntos sintéticos held-out (hablantes, ruidos y salas no vistos; hasta tres degradaciones solapadas con onsets aleatorios):

| Conjunto | frame macro-AP (20 ms) | 1-s segment macro-F1 | clip macro-AUC |
|---|---|---|---|
| Inglés (LibriSpeech test-clean), 3 000 × 8 s | 0,955 | 0,905 | 0,989 |
| Ruso (Russian LibriSpeech test), 3 000 × 8 s | 0,960 | 0,881 | 0,987 |
| Inglés, RIRs reales medidas | 0,954 | 0,902 | 0,991 |
| Inglés, RIRs MIT IR survey | 0,946 | 0,883 | 0,990 |

Frame AP por clase (inglés / ruso): pitch shift 0,999 / 0,993; time stretch 0,999 / 0,994; low-pass 0,996 / 0,994; clipping 0,993 / 0,997; packet loss 0,991 / 0,992; high-pass 0,991 / 1,000; music 0,985 / 0,990; reverberation 0,985 / 0,991; clicks 0,976 / 0,979; codec 0,925 / 0,961; background noise 0,898 / 0,799; mains hum 0,726 / 0,825.

Velocidad end-to-end (decodificación, features y modelo, un proceso): 23 ms por segundo de audio en CPU (43× tiempo real, ~84 s por hora de audio) y 6,5 ms en GPU Apple (MPS), medido en un MacBook Pro M3 Pro.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 88 M de parámetros (~350 MB en fp32, ~0,4 GB de repo), por lo que cabe holgadamente en cualquier GPU consumer; no se publican cifras exactas de VRAM.
- GPU recomendadas: cualquier GPU con soporte PyTorch; el autor reporta mediciones en Apple MPS (M3 Pro). No se especifican cifras para A100, H100 o RTX 4090.
- Cabe en GPU consumer: sí, con amplio margen (RTX 3060 en adelante, e incluso GPUs integradas).
- Opciones de despliegue: paquete Python `aadd` (`pip install "aadd @ git+https://github.com/gertelrina/aadd"`), CLI `aadd scan`, API `Detector`, descarga directa vía `huggingface_hub`. No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI (no aplican a un clasificador de este tipo).
- Latencia y throughput: 23 ms por segundo de audio en CPU (43× tiempo real, ~84 s por hora de audio) y 6,5 ms por segundo de audio en Apple MPS.

## Comparativa con modelos similares

No se dispone en la información proporcionada de comparaciones directas con otros modelos de detección de degradación de audio (por ejemplo, clasificadores de calidad tipo DNSMOS, NISQA o detectores de ruido basados en PANNs). Se indican a continuación los datos objetivos del modelo frente a la referencia de su backbone:

| Modelo | Parámetros | Contexto / ventana | Tarea | Licencia |
|---|---|---|---|---|
| AADD v3.1 | 88 M | ventanas de 8 s, resolución 20 ms | Detección multi-etiqueta de 12 degradaciones | MIT |
| Whisper-small (base) | 244 M (completo; encoder ~88 M) | 30 s | ASR multilingüe | MIT |
| Alternativas de detección de calidad de audio | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo se ha entrenado con inglés y ruso; el rendimiento en otros idiomas no está validado.
- El modelo es conservador en ruido leve: en VoiceBank-DEMAND (SNR 2,5–17,5 dB) el recall al umbral por defecto (0,5) es solo del 0,60; se recomienda bajar el umbral al filtrar datos.
- Persisten falsos positivos de "music" en ruido con tonos armónicos sostenidos (música o TV de fondo): 28 % en VoiceBank-DEMAND y 16 % en DNS-2020, aunque el autor señala que en esos casos la detección podría ser correcta.
- La clase `mains hum` es la más débil (frame AP 0,726 en inglés, 0,825 en ruso), seguida de `background noise` en ruso (0,799), lo que limita su fiabilidad en esos casos.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de falsos positivos/negativos en la clasificación; el umbral y la agregación (percentil 95) condicionan fuertemente los resultados.
- No se especifican sesgos demográficos ni de dominio más allá de los idiomas; el entrenamiento con LibriSpeech y Russian LibriSpeech puede introducir sesgo hacia voz de lectura y condiciones de estudio.
- Licencia MIT: permite uso comercial sin restricciones adicionales conocidas, pero conviene revisar la licencia del backbone Whisper-small (MIT) y de los datasets de entrenamiento (LibriSpeech, Russian LibriSpeech, FSD50K) para cumplimiento en producción.
- El modelo no genera texto ni soporta tool calling; su integración en pipelines requiere código adicional para actuar sobre las detecciones.

## Enlaces

- Hugging Face: https://huggingface.co/gertelrina/aadd
- Repositorio GitHub (código, CLI, API Python, informe interactivo): https://github.com/gertelrina/aadd
- Licencia en GitHub: https://github.com/gertelrina/aadd/blob/main/LICENSE
- Modelo base: https://huggingface.co/openai/whisper-small
- Dataset LibriSpeech ASR: https://huggingface.co/datasets/openslr/librispeech_asr
- Dataset Russian LibriSpeech: https://huggingface.co/datasets/istupakov/russian_librispeech
