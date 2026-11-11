# herald-dictation/lang-id-voxlingua107-ecapa-gguf

## Resumen

`lang-id-voxlingua107-ecapa-gguf` es la conversión al formato GGUF del modelo de identificación de idioma VoxLingua107 de SpeechBrain, empaquetada por herald-dictation para su uso con la librería `transcribe.cpp`. No se trata de un modelo generativo: es un clasificador de audio que recibe una señal de voz y devuelve el idioma hablado entre un conjunto de 107 lenguas. El modelo original emplea una arquitectura ECAPA-TDNN (Emphasized Channel Attention, Propagation and Aggregation Time Delay Neural Network), una red neuronal convolucional temporal diseñada para tareas de verificación y clasificación de hablante que SpeechBrain reutilizó para identificación de idioma.

El paquete es relevante para desarrolladores que construyen pipelines de dictado o transcripción offline: disponer de un detector de idioma local, ligero y sin dependencias de red permite enrutar el audio al modelo de reconocimiento de voz adecuado antes de transcribir. Con 21.244.679 parámetros y un fichero F16 de aproximadamente 45 MB, el coste de despliegue es muy bajo y cabe en cualquier máquina, incluidos dispositivos de gama baja.

Esta ficha describe la variante GGUF publicada por herald-dictation, que es una copia byte a byte de la conversión de handy-computer, sin cambios en los pesos. La autoría intelectual del modelo corresponde a SpeechBrain; la conversión a GGUF, a los autores de `transcribe.cpp`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ECAPA-TDNN (red convolucional temporal con atención de canal) |
| Parametros totales | 21.244.679 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (clasificador de audio; ventana de entrada definida por el pipeline, no por un contexto de tokens) |
| Tipos de cuantizacion | F16 en este repositorio; otras cuantizaciones en el repositorio original de handy-computer |
| Idiomas soportados | 107 lenguas (ab, af, am, ar, as, az, ba, be, bg, bn, bo, br, bs, ca, ceb, cs, cy, da, de, el, en, eo, es, et, eu, fa, fi, fo, fr, gl, gn, gu, gv, ha, haw, hi, hr, ht, hu, hy, ia, id, is, it, iw, ja, jw, ka, kk, km, kn, ko, la, lb, ln, lo, lt, lv, mg, mi, mk, ml, mn, mr, ms, mt, my, ne, nl, nn, no, oc, pa, pl, ps, pt, ro, ru, sa, sco, sd, si, sk, sl, sn, so, sq, sr, su, sv, sw, ta, te, tg, th, tk, tl, tr, tt, uk, ur, uz, vi, war, yi, yo, zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero `lang-id-voxlingua107-ecapa-F16.gguf`, 45.299.872 bytes) |

## Arquitectura y entrenamiento

El modelo base es VoxLingua107 de SpeechBrain, construido sobre ECAPA-TDNN. Esta arquitectura apila bloques convolucionales 1D con atención de canal y agregación estadística sobre el eje temporal, lo que permite resumir una secuencia de audio en un embedding de hablante o idioma. Sobre ese embedding se aplica una capa de clasificación con una salida por idioma. El modelo original se entrenó con el corpus VoxLingua107, un conjunto de datos recopilado a partir de vídeos de YouTube que cubre 107 lenguas con muestras de habla espontánea y ruidosa.

La conversión a GGUF no modifica los pesos ni el entrenamiento: es un cambio de serialización para que `transcribe.cpp` pueda cargar el modelo en el runtime de Herald. No hay información en la documentación proporcionada sobre el número exacto de tokens de audio, la composición detallada del dataset, ni sobre si se aplicaron etapas de ajuste fino adicionales (RLHF/DPO no aplican a un clasificador). Tampoco se detalla si la conversión incluye optimizaciones de inferencia más allá del cambio de formato.

## Capacidades

- Identificación de idioma a partir de audio de voz entre 107 lenguas.
- Clasificación de audio (`audio-classification`) con salida de etiqueta de idioma.
- Funcionamiento totalmente offline, sin llamadas a servicios externos.
- Integración con el runtime `transcribe.cpp` y con el pipeline de dictado Herald.
- Modelo ligero: 21,2 M de parámetros y fichero F16 de ~45 MB.
- No es un modelo generativo: no produce texto, no hace tool calling, no razona y no soporta agentes.
- No dispone de modo thinking, visión, audio generativo ni capacidades multimodales más allá de la entrada de audio.

## Casos de uso

- Enrutamiento de dictado multilingüe: el modelo detecta el idioma del audio entrante y el pipeline selecciona el modelo de reconocimiento de voz (ASR) correspondiente, evitando transcribir con un modelo de idioma incorrecto.
- Aplicaciones de dictado privado offline: Herald lo usa para identificar el idioma sin enviar audio a la nube, lo que encaja en escenarios de privacidad estricta (sanidad, legal, administración).
- Preprocesado en pipelines de transcripción por lotes: clasificar grandes volúmenes de ficheros de audio por idioma antes de pasarlos a un ASR específico, reduciendo errores y coste computacional.
- Filtrado y organización de archivos de audio: etiquetar automáticamente grabaciones de reuniones, entrevistas o podcasts por idioma para su archivado y búsqueda.
- Detección de cambio de idioma en conversaciones: en sistemas de atención al cliente o transcripción de reuniones, marcar segmentos en los que el hablante cambia de lengua.
- Control de calidad de datasets: verificar que las muestras de audio de un corpus etiquetado coinciden con el idioma declarado antes de usarlas para entrenar otros modelos.
- Integración en herramientas de escritorio: al ser un fichero GGUF de ~45 MB, puede empaquetarse dentro de una aplicación de dictado local sin dependencias externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en F16 (el fichero pesa ~45 MB y el modelo tiene 21,2 M de parámetros); cuantizaciones menores reducen aún más el uso.
- GPU recomendadas: cualquier GPU moderna es suficiente; no requiere A100 ni H100. Una RTX 4090 o incluso una GPU integrada puede ejecutarlo.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo actual e incluso en CPU.
- Opciones de despliegue: `transcribe.cpp` (runtime previsto por el autor); el formato GGUF también puede cargarse con herramientas compatibles con GGUF, aunque la integración específica documentada es con `transcribe.cpp`.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, se espera una latencia muy baja en CPU y GPU, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| herald-dictation/lang-id-voxlingua107-ecapa-gguf | 21,2 M | 107 | Apache 2.0 | GGUF | Hugging Face |
| speechbrain/lang-id-voxlingua107-ecapa (original) | 21,2 M | 107 | Apache 2.0 | PyTorch (SpeechBrain) | Hugging Face |
| handy-computer/lang-id-voxlingua107-ecapa-gguf (conversión origen) | 21,2 M | 107 | Apache 2.0 | GGUF (varias cuantizaciones) | Hugging Face |

No se dispone de datos de rendimiento comparado con otros modelos de identificación de idioma (por ejemplo, alternativas basadas en Whisper o clasificadores comerciales) en la información proporcionada.

## Limitaciones y advertencias

- Es un clasificador de idioma, no un modelo de lenguaje: no genera texto ni responde a instrucciones.
- El rendimiento puede degradarse con audio muy ruidoso, acentos marcados, habla muy corta o códigos de cambio de idioma dentro de una misma frase.
- La lista de 107 idiomas no cubre todas las lenguas del mundo; idiomas fuera de esa lista se asignarán a la clase más cercana, con riesgo de error.
- Riesgo de confusión entre lenguas próximas (por ejemplo, variedades eslavas o románicas) no cuantificado en la documentación disponible.
- Sesgos potenciales heredados del corpus VoxLingua107 (grabaciones de YouTube), con posible desequilibrio en la representación de variedades dialectales.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar el fichero `NOTICE` y los términos del modelo original de SpeechBrain antes de redistribuir.
- Esta publicación es una copia byte a byte de otra conversión; no añade mejoras ni correcciones sobre el modelo original.
- No se documentan métricas de precisión ni curvas de calibración en la información proporcionada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/herald-dictation/lang-id-voxlingua107-ecapa-gguf
- Modelo original de SpeechBrain: https://huggingface.co/speechbrain/lang-id-voxlingua107-ecapa
- Conversión origen de handy-computer: https://huggingface.co/handy-computer/lang-id-voxlingua107-ecapa-gguf
- Runtime transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
