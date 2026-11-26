# agertel/aadd

## Resumen

AADD (Automatic Audio Degradation Detection) v3.1 es un modelo de clasificación de audio desarrollado por agertel (usuario de Hugging Face vinculado al repositorio GitHub gertelrina/aadd). Detecta 12 tipos de degradación en grabaciones de voz con una resolución de 20 ms por frame: ruido de fondo, música, reverberación, clipping, filtrado paso bajo y paso alto, artefactos de códec, pérdida de paquetes, zumbido de red eléctrica, clics, cambio de tono y estiramiento temporal. Varias degradaciones pueden coexistir en la misma señal.

El modelo parte del encoder de Whisper-small (88 M de parámetros) afinado de extremo a extremo. Su propósito es la curación de datasets de voz para ASR y TTS, así como la auditoría de calidad de grabaciones. La versión 3.1 se publicó el 6 de noviembre de 2026 y corrige el principal defecto de la v3.0, que clasificaba erróneamente el ruido de fondo real de cafeterías, calles y autobuses como música, mediante un ajuste fino con aproximadamente 36 horas de ruido ambiental real de FSD50K y babble sintético.

Es relevante porque ofrece detección localizada temporalmente (no solo a nivel de clip) con un coste computacional bajo: 23 ms por segundo de audio en CPU, lo que permite procesar una hora de audio en unos 84 segundos. Está entrenado y evaluado en inglés y ruso, y se distribuye con licencia MIT.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder de Whisper-small (transformer) con cabeza de clasificación multi-etiqueta por frame |
| Parámetros totales | 88 M (backbone Whisper-small encoder) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventanas de 8 s; audio de cualquier duración mediante ventanas deslizantes |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (en), ruso (ru) |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pt: `aadd_v3_1_whisper_small_frames.pt`) |
| Resolución temporal | Frames de 20 ms; segmentos configurables (por defecto 1,0 s) |
| Número de clases | 12 degradaciones simultáneas (salida sigmoide por clase y frame) |
| Tamaño del repositorio | 0,4 GB |
| Pipeline | audio-classification |

## Arquitectura y entrenamiento

El modelo reutiliza el encoder de Whisper-small (88 M de parámetros) y lo afina de extremo a extremo con una cabeza de clasificación que emite una probabilidad sigmoide independiente por cada una de las 12 clases en cada frame de 20 ms. El procesamiento se realiza sobre ventanas de 8 segundos y se aplica ventana deslizante para cubrir audio de cualquier duración, de modo que la salida es una matriz de forma (n_frames_20ms, 12).

El entrenamiento combina datos de LibriSpeech (openslr/librispeech_asr) y Russian LibriSpeech (istupakov/russian_librispeech) con mezclas sintéticas de degradaciones (hasta tres solapadas con inicios aleatorios) y, en la versión 3.1, aproximadamente 36 horas de ruido ambiental real extraído de FSD50K (solo clips CC0/CC BY, sin etiquetas de música ni voz) más babble de multitud sintético añadido a la clase de ruido. La v3.1 corresponde al checkpoint del paso 4.000 de una ejecución de 10.000 pasos (lr 1e-5 en el encoder, 3e-4 en la cabeza, 500 pasos de warm-up, scheduler coseno, semilla 1), seleccionado por mejor AP de validación. No se documenta uso de RLHF ni DPO.

## Capacidades

- Detección multi-etiqueta de 12 degradaciones de audio simultáneas: ruido de fondo, música, reverberación, clipping, paso bajo, banda estrecha, paso alto, artefactos de códec, pérdida de paquetes, zumbido de red, clics, cambio de tono y estiramiento temporal.
- Localización temporal fina: probabilidad por clase cada 20 ms, con agregación configurable a segmentos (por defecto 1,0 s) y puntuación de clip basada en el percentil 95 de las probabilidades de frame.
- Procesamiento de audio de duración arbitraria mediante ventanas deslizantes de 8 s.
- Soporte de dos idiomas en entrenamiento: inglés y ruso.
- API de Python (`Detector`) y CLI (`aadd scan`) para escanear datasets completos y generar informes HTML interactivos.
- Capacidad de filtrar y curar datasets de ASR/TTS identificando clips degradados y el tipo concreto de degradación.
- No dispone de tool calling, capacidades de agente, visión ni audio generation; es un clasificador, no un modelo generativo.

## Casos de uso

- Curación de datasets de ASR: escanear un corpus completo con `aadd scan dataset/ --report report.html` para identificar y descartar clips con ruido, reverberación o clipping antes de entrenar un modelo de reconocimiento de voz, usando la localización a 20 ms para recortar solo los tramos afectados.
- Auditoría de calidad de grabaciones de call center: detectar pérdida de paquetes, artefactos de códec y zumbido de red en llamadas telefónicas, gracias a su resolución temporal y a su velocidad de 43× tiempo real en CPU.
- Filtrado de datos para TTS: eliminar clips con reverberación o cambio de tono que degradarían la naturalidad de un modelo de síntesis, aprovechando las puntuaciones por clase y el umbral configurable.
- Monitorización de pipelines de captura en producción: integrar el detector en un servicio que valide continuamente la calidad de audio entrante y alerte cuando aparezcan degradaciones concretas (clics, clipping, ruido).
- Selección de datos para entrenamiento de modelos de mejora de voz (speech enhancement): etiquetar automáticamente mezclas ruidosas por tipo de ruido y SNR aproximada para construir pares limpio/degradado.
- Investigación en percepción de calidad de audio: usar las probabilidades por frame como señal auxiliar para estudiar la relación entre degradaciones específicas y métricas subjetivas como MOS.
- Verificación de conformidad en archivos de patrimonio sonoro: auditar digitalizaciones para detectar zumbido de red, filtrado de banda o artefactos de códec antes de su archivo definitivo.

## Benchmarks y rendimiento

Resultados en benchmarks públicos de ruido y reverberación no usados en entrenamiento (mezclas de voz de estudio con ruido real y salas reales o simuladas). La puntuación de clip es el percentil 95 de las probabilidades de frame; se marca un clip cuando es ≥ 0,5.

| Conjunto | Clase | ROC-AUC | Recall a p ≥ 0,5 | Falsas alarmas en limpios (misma clase) | Detecciones de música sin música |
|---|---|---|---|---|---|
| VoiceBank-DEMAND test (824 ruidosos vs 824 limpios) | noise | 0,992 | 0,60 | 0,0 % | 28 % de clips ruidosos (v3.0: 42 %) |
| DNS Challenge 2020 dev-test sintético (600 clips) | noise | 0,998 | 0,91 | 0,0 % | 16 % de clips ruidosos (v3.0: 23 %) |
| DNS Challenge 2020 dev-test sintético (600 clips) | reverberation | 1,000 | 1,00 | 0,0 % | — |
| Dynamic-SUPERB noise (VCTK + MUSAN) | noise | 0,992 | 0,96 | 2,2 % | 0,5 % |
| Dynamic-SUPERB reverberation (sala pequeña/mediana/grande) | reverberation | 0,994 / 1,000 / 0,996 | 0,98 / 1,00 / 0,97 | 0 % | 0–1,5 % |

Conjuntos sintéticos held-out (hablantes, ruidos y salas no vistos; hasta tres degradaciones solapadas con inicios aleatorios):

| Conjunto | macro-AP por frame (20 ms) | macro-F1 por segmento de 1 s | macro-AUC por clip |
|---|---|---|---|
| Inglés (LibriSpeech test-clean), 3.000 × 8 s | 0,955 | 0,905 | 0,989 |
| Ruso (Russian LibriSpeech test), 3.000 × 8 s | 0,960 | 0,881 | 0,987 |
| Inglés, RIRs reales medidos | 0,954 | 0,902 | 0,991 |
| Inglés, RIRs del MIT IR survey | 0,946 | 0,883 | 0,990 |

AP por frame y clase (inglés / ruso): pitch shift 0,999 / 0,993; time stretch 0,999 / 0,994; paso bajo 0,996 / 0,994; clipping 0,993 / 0,997; pérdida de paquetes 0,991 / 0,992; paso alto 0,991 / 1,000; música 0,985 / 0,990; reverberación 0,985 / 0,991; clics 0,976 / 0,979; códec 0,925 / 0,961; ruido de fondo 0,898 / 0,799; zumbido de red 0,726 / 0,825.

Velocidad (extremo a extremo: decodificación, features y modelo, un proceso): 23 ms por segundo de audio en CPU (43× tiempo real, unos 84 s por hora de audio) y 6,5 ms en GPU Apple (MPS), medido en un MacBook Pro M3 Pro.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 88 M de parámetros y pesos en fp32 (tamaño del repo 0,4 GB), la huella es inferior a 1 GB, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre; el autor reporta 6,5 ms por segundo de audio en GPU Apple (MPS) de un M3 Pro.
- Cabe en GPU consumer: sí, en cualquier RTX (incluso series 20xx y anteriores) y en GPUs integradas Apple Silicon vía MPS.
- CPU: funciona a 23 ms por segundo de audio (43× tiempo real) en un solo proceso, suficiente para procesamiento por lotes de datasets.
- Opciones de despliegue: paquete Python `aadd` instalable desde GitHub (`pip install "aadd @ git+https://github.com/gertelrina/aadd"`), CLI `aadd scan`, API `Detector` y descarga directa del checkpoint vía `huggingface_hub`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplica a un clasificador de este tamaño).
- Latencia y throughput: 23 ms/s de audio en CPU y 6,5 ms/s en MPS; aproximadamente 84 s por hora de audio en CPU.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Tarea | Idiomas | Licencia |
|---|---|---|---|---|---|
| AADD v3.1 | Clasificador multi-etiqueta por frame | 88 M | Detección de 12 degradaciones de audio | en, ru | MIT |
| Whisper-small (base) | ASR transformer | 244 M | Transcripción de voz | multilingüe | MIT |
| Modelos de speech enhancement (p. ej. Demucs, DNS) | Generativos/separación | variable | Mejora de voz, no detección | no aplica | variable |
| Detección de ruido genérica (clasificadores binarios) | Clasificador binario | variable | Ruido sí/no | variable | variable |

No se dispone en la información proporcionada de resultados comparativos directos con alternativas específicas de detección de degradación. La comparación con Whisper-small es relevante porque AADD reutiliza su encoder: AADD no transcribe, sino que clasifica degradaciones, y su licencia MIT coincide con la del modelo base.

## Limitaciones y advertencias

- Solo se ha entrenado y evaluado en inglés y ruso; el rendimiento en otros idiomas no está documentado.
- El umbral por defecto (0,5 sobre el percentil 95) es conservador con ruido leve: en VoiceBank-DEMAND (SNR 2,5–17,5 dB) el recall de ruido es solo 0,60; el autor recomienda bajarlo al filtrar datos.
- Persisten falsos positivos de "música" en ruido real: 28 % de clips ruidosos en VoiceBank-DEMAND y 16 % en DNS-2020 (aunque en este último el ruido contiene tonos armónicos sostenidos y la detección podría ser correcta). El ruido de fondo se detecta con más frecuencia que en v3.0 (café 84 % → 95 %, plaza pública 55 % → 78 %), lo que puede aumentar los falsos positivos de ruido.
- Las clases con peor AP por frame son zumbido de red (0,726 en inglés) y ruido de fondo (0,799 en ruso), por lo que su fiabilidad es menor que la de otras degradaciones.
- Riesgo de alucinación no aplica (no es un modelo generativo), pero sí hay riesgo de clasificación errónea en condiciones acústicas no representadas en entrenamiento.
- La evaluación se basa mayoritariamente en mezclas sintéticas y benchmarks públicos; el rendimiento en grabaciones reales muy diversas puede diferir.
- Licencia MIT: permite uso comercial sin restricciones adicionales, pero se recomienda conservar el aviso de copyright.
- No se documentan sesgos demográficos ni de otro tipo; al ser un clasificador de señal, el riesgo principal es la variabilidad acústica, no el sesgo social.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/agertel/aadd
- Repositorio GitHub (código, CLI, API Python e informe interactivo): https://github.com/gertelrina/aadd
- Licencia en GitHub: https://github.com/gertelrina/aadd/blob/main/LICENSE
- Modelo base: https://huggingface.co/openai/whisper-small
- Dataset LibriSpeech ASR: https://huggingface.co/datasets/openslr/librispeech_asr
- Dataset Russian LibriSpeech: https://huggingface.co/datasets/istupakov/russian_librispeech
- Checkpoint directo: `aadd_v3_1_whisper_small_frames.pt` en el repositorio de Hugging Face
