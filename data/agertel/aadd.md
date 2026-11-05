# agertel/aadd

## Resumen

AADD v3 (Automatic Audio Degradation Detection) es un modelo de clasificación de audio desarrollado por agertel que detecta 12 tipos distintos de degradación en grabaciones de voz con una resolución temporal de 20 ms. El modelo parte del encoder de Whisper-small (88 millones de parámetros) y se ha afinado de extremo a extremo para emitir una probabilidad sigmoide por clase y por frame, permitiendo localizar en el tiempo eventos como ruido de fondo, música, reverberación, clipping, filtrado paso bajo o paso alto, artefactos de códec, pérdida de paquetes, zumbido de red, clics, cambio de tono y estiramiento temporal. Su relevancia actual radica en la curación de datasets de voz para ASR y TTS, donde la detección automática de audio degradado permite filtrar, priorizar o reparar material antes de entrenar.

El modelo se distribuye como un checkpoint PyTorch de 177 MB (repositorio total de 0,2 GB) con licencia MIT, y se acompaña de una CLI y una API de Python en el repositorio de GitHub del autor. Está entrenado con habla en inglés y ruso (LibriSpeech train-clean-100 y Russian LibriSpeech train), con degradaciones sintetizadas al vuelo, y ofrece ventanas deslizantes para procesar audio de cualquier duración.

La propuesta es poco habitual: en lugar de clasificar clips completos, AADD v3 produce una matriz de probabilidades de forma `(n_frames_20ms, 12)`, lo que lo convierte en una herramienta de auditoría y segmentación fina más que en un clasificador global. Es relevante para equipos que construyen pipelines de datos de audio a escala y necesitan identificar qué porción de una grabación está contaminada y por qué tipo de artefacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper-small encoder (transformer) con suma ponderada aprendible de las 13 capas ocultas, dos convoluciones 1-D y cabeza lineal con 12 sigmoides por frame |
| Parametros totales | 88 M (encoder Whisper-small); checkpoint de 177 MB |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventanas de 8 s; audio de cualquier duración mediante ventanas deslizantes; resolución de 20 ms por frame |
| Tipos de cuantizacion | No disponible (checkpoint PyTorch en precisión original; no se documentan variantes GGUF, INT8 ni otras) |
| Idiomas soportados | Inglés y ruso (idiomas vistos en entrenamiento) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`); checkpoint `aadd_v3_whisper_small_frames.pt` |

## Arquitectura y entrenamiento

AADD v3 reutiliza el encoder de Whisper-small como backbone y lo afina de extremo a extremo. Sobre las 13 representaciones ocultas del encoder se aplica una suma ponderada con pesos aprendibles, seguida de dos convoluciones 1-D y una cabeza lineal que emite 12 salidas sigmoides por cada frame de 20 ms. El modelo procesa ventanas de 8 s y, mediante ventanas deslizantes, admite audio de cualquier longitud. La resolución temporal de 20 ms permite localizar el inicio y el fin de cada degradación, y varias degradaciones pueden coexistir en el mismo frame.

El entrenamiento combina habla limpia de LibriSpeech train-clean-100 (100 h, inglés) y Russian LibriSpeech train (93 h, ruso), con hablantes de validación y test disjuntos, y degradaciones generadas al vuelo en ventanas de 8 s con 0 a 3 eventos por ventana, ya sea cubriendo toda la ventana o intervalos de 0,5 a 4 s con inicios aleatorios. El catálogo de degradaciones incluye ruido MUSAN (−5 a 30 dB SNR), música (0 a 25 dB), respuestas al impulso de sala de RIRS_NOISES, clipping duro y suave (2 a 30 % de muestras), paso bajo Butterworth o por remuestreo (1 a 5 kHz), paso alto (200 a 1000 Hz), MP3 a 8–41 kbit/s, Opus a 10–32 kbit/s, Vorbis, GSM, µ-law, A-law, G.721, IMA-ADPCM, pérdida de paquetes con modelo Gilbert–Elliott (5 a 30 %), zumbido de 50/60 Hz, clics, cambio de tono (±2 a 8 semitonos) y estiramiento temporal (0,7–0,9 y 1,15–1,5). Las etiquetas son por frame de 20 ms y se enmascaran los frames donde la degradación está físicamente ausente.

La receta de entrenamiento emplea AdamW con learning rate 3e-5 para el encoder y 1e-3 para la cabeza, 1000 pasos de warm-up, scheduler coseno, precisión bf16, batch de 64 ventanas y 30 000 pasos (aproximadamente 4 300 h de audio generado). El entrenamiento completo se ejecutó en una sola H100 en 2,4 h, y el mejor checkpoint de validación se seleccionó en el paso 16 000 con un macro-AP por frame de 0,969.

## Capacidades

- Detección multi-etiqueta de 12 tipos de degradación de audio por frame de 20 ms: ruido de fondo, música, reverberación, clipping, paso bajo, banda estrecha, paso alto, artefactos de códec, pérdida de paquetes, zumbido de red, clics, cambio de tono y estiramiento temporal.
- Localización temporal fina: devuelve una matriz `(n_frames_20ms, 12)` de probabilidades, lo que permite identificar en qué tramo exacto de una grabación aparece cada degradación.
- Procesamiento de audio de duración arbitraria mediante ventanas deslizantes de 8 s.
- Agregación configurable a resolución de 1 s o 100 ms mediante el parámetro `resolution` de la API.
- Detección simultánea de varias degradaciones solapadas en el mismo instante.
- Soporte de inferencia por archivo individual (`predict_file`) y por directorio completo (`aadd scan`).
- Generación de informes HTML interactivos a partir de un dataset de audio.
- Exportación de resultados a CSV con segmentos por resolución configurable.
- Idiomas de habla cubiertos en entrenamiento: inglés y ruso.

## Casos de uso

- Curación de datasets de ASR: antes de entrenar o evaluar un sistema de reconocimiento de voz, AADD v3 permite escanear el corpus completo y descartar o marcar clips con ruido, reverberación o artefactos de códec, usando la CLI `aadd scan my_dataset/ --report report.html` para obtener un informe HTML con la distribución de degradaciones por archivo.
- Curación de datasets de TTS: en la preparación de corpus para síntesis de voz, el modelo identifica grabaciones con clipping, zumbido o paso bajo que degradarían la calidad del modelo entrenado, y permite filtrar por umbral ajustable según la tolerancia del pipeline.
- Auditoría de calidad de grabaciones telefónicas o de call center: con resolución de 100 ms o 1 s, el modelo detecta pérdida de paquetes, artefactos de códec y banda estrecha en llamadas VoIP, útil para monitorización de calidad en producción y para priorizar revisiones manuales.
- Diagnóstico de cadenas de captura: al localizar en el tiempo clics, zumbido de 50/60 Hz o clipping, el modelo ayuda a identificar fallos de hardware o de configuración en la cadena de grabación (micrófonos, interfaces, cableado).
- Detección de contenido musical o ruidoso en archivos de voz: la clase de música (0 a 25 dB) y la de ruido de fondo permiten separar segmentos aptos para transcripción de los que no lo son, integrándose como paso previo a un pipeline de ASR.
- Investigación en evaluación de robustez de ASR: el modelo sirve para etiquetar automáticamente conjuntos de test con el tipo y la posición de la degradación, permitiendo análisis de error desagregados por artefacto en lugar de métricas agregadas.
- Segmentación previa a restauración de audio: al identificar tramos concretos con reverberación o ruido, se pueden aplicar modelos de enhancement solo donde son necesarios, ahorrando cómputo en lugar de procesar la grabación completa.
- Filtrado en tiempo casi real de streams de audio: con ventanas deslizantes de 8 s y resolución configurable, puede integrarse en sistemas de monitorización continua de calidad de emisión o de ingesta.

## Benchmarks y rendimiento

Resultados fuera de dominio sobre grabaciones reales (puntuación por clip = percentil 95 de las probabilidades por frame):

| Conjunto | Clase | ROC-AUC | Recall a p ≥ 0,5 | Falsas alarmas en limpio |
|---|---|---|---|---|
| VoiceBank-DEMAND test (824 ruidosos vs 824 limpios) | ruido | 0,985 | 0,51 | 0,4 % |
| DNS Challenge 2020 synthetic dev-test (600 clips) | ruido | 0,997 | 0,85 | 0,0 % |
| DNS Challenge 2020 synthetic dev-test (600 clips) | reverberación | 1,000 | 1,00 | 0,0 % |
| Dynamic-SUPERB noise detection (VCTK + MUSAN) | ruido | 0,995 | 0,96 | 1,1 % |
| Dynamic-SUPERB reverberación, sala pequeña / media / grande | reverberación | 0,995 / 1,000 / 0,998 | 0,97 / 1,00 / 0,96 | 0 % |

Resultados sobre conjuntos de test sintéticos retenidos (hablantes, ruidos y salas no vistos; hasta tres degradaciones solapadas con inicios aleatorios):

| Conjunto de test | Macro-AP por frame (20 ms) | Macro-F1 por segmento de 1 s | Macro-AUC por clip |
|---|---|---|---|
| Inglés (LibriSpeech test-clean), 3 000 × 8 s | 0,955 | 0,915 | 0,988 |
| Ruso (Russian LibriSpeech test), 3 000 × 8 s | 0,959 | 0,883 | 0,986 |
| Inglés, RIRs reales medidas | 0,951 | 0,909 | 0,989 |
| Inglés, RIRs del MIT IR survey | 0,940 | 0,892 | 0,988 |

AP por frame y por clase (inglés / ruso): cambio de tono 0,999 / 0,992; estiramiento temporal 0,997 / 0,992; clipping 0,996 / 0,996; paso alto 0,991 / 0,998; pérdida de paquetes 0,989 / 0,990; reverberación 0,987 / 0,989; música 0,983 / 0,985; clics 0,972 / 0,975; paso bajo 0,966 / 0,981; códec 0,920 / 0,949; ruido de fondo 0,885 / 0,803; zumbido de red 0,772 / 0,864.

## Requisitos de hardware

- El checkpoint pesa 177 MB en PyTorch, por lo que la inferencia cabe holgadamente en cualquier GPU de consumo con al menos 2–4 GB de VRAM libre, incluidas RTX 3060, RTX 4060, RTX 4090 y similares.
- GPU recomendadas para producción: cualquier GPU moderna con soporte bf16 (A100, H100, L40S, RTX 4090). El entrenamiento se completó en una sola H100 en 2,4 h, lo que da una idea del coste de reentrenamiento.
- Cabe en CPU para procesamiento por lotes no interactivo, aunque no se documentan latencias concretas en ese modo.
- Opciones de despliegue: la librería oficial `aadd` (instalable con `pip install "aadd[app] @ git+https://github.com/gertelrina/aadd"`), que incluye CLI y API de Python; el checkpoint también puede cargarse directamente con `huggingface_hub.hf_hub_download` y la clase `Detector`. No se documenta soporte nativo para vLLM, TGI, llama.cpp ni Ollama, dado que no es un modelo generativo de texto.
- Latencia y throughput: no se publican cifras concretas en la información disponible; el repositorio incluye un benchmark de velocidad en `eval/`, pero sus valores no se detallan en la model card.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / resolución | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AADD v3 (este modelo) | 88 M (encoder Whisper-small) | Ventanas de 8 s, frames de 20 ms | Detección multi-etiqueta de 12 degradaciones | MIT | HuggingFace + GitHub |
| AADD v2 | EfficientNet-B0 | 1 s, 7 clases sintéticas | Detección de degradaciones sintéticas | MIT | Incluido en el mismo repo |
| AADD v1 | EfficientNet-B0 | 1 s, 7 clases sintéticas | Detección sobre imágenes de mel renderizadas | MIT | Incluido en el mismo repo |
| Whisper-small (modelo base) | 88 M encoder + decoder | 30 s de audio | ASR multilingüe | MIT | HuggingFace (openai/whisper-small) |

No se dispone de comparación con otros detectores de degradación de audio de terceros en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo ha visto habla en inglés y ruso durante el entrenamiento; su comportamiento en otros idiomas no está validado y puede degradarse.
- En ruido leve (VoiceBank-DEMAND, SNR 2,5–17,5 dB) el modelo es conservador con el umbral por defecto (recall de 0,51 a p ≥ 0,5); el autor recomienda bajar el umbral al filtrar datos, lo que incrementará las falsas alarmas.
- El rendimiento es más bajo en las clases de ruido de fondo (AP 0,885 en inglés, 0,803 en ruso) y zumbido de red (0,772 en inglés), por lo que estas detecciones son menos fiables que las de cambio de tono, estiramiento temporal o clipping.
- Las degradaciones se generan sintéticamente durante el entrenamiento; aunque se evalúa con grabaciones reales (VoiceBank-DEMAND, DNS Challenge, Dynamic-SUPERB), pueden existir tipos de degradación del mundo real no cubiertos por el catálogo sintético.
- Riesgo de alucinación en el sentido de falsos positivos: el modelo puede marcar degradaciones en audio limpio, especialmente con umbrales bajos; las tasas de falsas alarmas medidas oscilan entre 0 % y 1,1 % en los conjuntos evaluados.
- La licencia MIT permite uso comercial sin restricciones adicionales, pero el modelo se distribuye sin garantías y el autor no ofrece soporte ni SLA.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica una adopción muy limitada y poca validación por parte de la comunidad.
- No se documentan cuantizaciones ni formatos alternativos de pesos, lo que limita el despliegue en entornos sin PyTorch.
- El modelo no es generativo: no produce transcripciones ni texto, solo probabilidades de degradación; debe combinarse con un ASR u otro sistema para tareas de transcripción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agertel/aadd
- Repositorio GitHub (código, CLI, API y informe interactivo): https://github.com/gertelrina/aadd
- Licencia en GitHub: https://github.com/gertelrina/aadd/blob/main/LICENSE
- Modelo base: https://huggingface.co/openai/whisper-small
- Dataset LibriSpeech ASR: https://huggingface.co/datasets/openslr/librispeech_asr
- Dataset Russian LibriSpeech: https://huggingface.co/datasets/istupakov/russian_librispeech
