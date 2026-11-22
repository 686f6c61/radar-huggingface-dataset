# hcX02/echora-mms-300m-multilingual-lyrics-forced-aligner

## Resumen

Echora MMS 300M Multilingual Lyrics Forced Aligner es un modelo de alineamiento forzado (forced alignment) especializado en sincronizar texto de letras de canciones con audio musical, generando marcas de tiempo a nivel de palabra o sílaba para proyectos de karaoke y visualización de letras. Lo desarrolla el usuario hcX02 en el contexto del proyecto Echora, y parte del modelo base `facebook/mms-300m` de Meta, sobre el que se ha realizado un fine-tuning con supervisión de letras temporizadas.

El modelo resuelve un problema concreto: dado un audio musical y una letra en texto, determinar cuándo se canta cada palabra o sílaba. A diferencia de los alineadores de voz hablada, está entrenado sobre stems vocales separados y contempla coros de fondo superpuestos a la voz principal, una innovación respecto a revisiones anteriores del mismo autor. Cubre siete idiomas: inglés, japonés, coreano, español, indonesio, urdu e hindi, además de letras con escritura mixta.

Arquitectónicamente es un Wav2Vec2 con cabeza CTC de aproximadamente 315 millones de parámetros (315.504.320 según los pesos en safetensors), derivado de MMS-300M. Su relevancia actual radica en que los alineadores multilingües de letras cantadas son escasos y los existentes suelen fallar con coros superpuestos, romanizaciones y cambios fonéticos propios del canto; este modelo aborda explícitamente esos casos, aunque con una licencia restrictiva que limita su uso a proyectos personales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2 con cabeza CTC (MMS CTC forced aligner) |
| Parametros totales | 315.504.320 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo acústico; la ventana depende del pipeline de alineamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ja, ko, es, id, ur, hi, y letras con escritura mixta |
| Licencia | other (uso personal y no comercial únicamente) |
| Formato de pesos | safetensors (repositorio de 3,8 GB) |

## Arquitectura y entrenamiento

El modelo es un Wav2Vec2 de unos 300 millones de parámetros (MMS-300M de Meta) con una cabeza de clasificación CTC adaptada al alineamiento forzado de letras. La versión v8, la actual, se fine-tuneó desde la v6 sobre stems vocales separados, incorporando de nuevo al conjunto de entrenamiento los coros de fondo que se superponen a la voz principal. Incluye una segunda cabeza de salida para coros de fondo (`stream2_head` en la configuración); al cargar con `Wav2Vec2ForCTC` se usa la cabeza de voz principal y los pesos extra se reportan como no utilizados, lo cual es esperado.

El entrenamiento emplea supervisión de letras temporizadas, con canciones de validación y test separadas por artista y emparejadas a la grabación exacta. La evaluación se realiza con precisión de fotogramas de letra y pérdida de alineamiento sobre segmentos temporizados reservados; el autor advierte que estas métricas miden la concordancia con las etiquetas y no garantizan una sincronización perceptualmente correcta para karaoke. La v6 introdujo la expectativa de romanización del coreano por pronunciación (con liaison, nasalización y otros cambios fonéticos), y la v8 mantiene esa expectativa sin cambios; el japonés usa lecturas en kana resueltas a partir de datos de diccionario cuando es posible.

## Capacidades

- Alineamiento forzado de texto de letras con audio musical, generando marcas de tiempo aproximadas a nivel de palabra o sílaba.
- Soporte multilingüe para inglés, japonés, coreano, español, indonesio, urdu e hindi.
- Manejo de letras con escritura mixta (varios sistemas de escritura en la misma canción).
- Alineamiento de coros de fondo cantados solos y, en la v8, coros de fondo superpuestos a la voz principal mediante una segunda cabeza de salida.
- Procesamiento de stems vocales separados, que es el modo de uso recomendado (Echora separa la voz antes de alinear).
- Expectativas lingüísticas específicas: coreano romanizado por pronunciación y japonés en lecturas kana.
- No es un modelo generativo de texto ni un modelo de reconocimiento de voz general: su salida es emisión acústica para alineamiento, no transcripción libre.

## Casos de uso

- Karaoke personal: dado un stem vocal y la letra, el modelo produce los tiempos de cada palabra o sílaba para resaltar la letra sincronizada en un reproductor doméstico; su entrenamiento sobre stems vocales lo hace adecuado para este flujo.
- Visualización de letras en reproductores musicales: integración en un pipeline que combine separación de voz, alineamiento y renderizado de subtítulos temporizados, aprovechando el soporte de siete idiomas.
- Proyectos de subtitulado multilingüe de canciones: el modelo cubre inglés, japonés, coreano, español, indonesio, urdu e hindi, lo que permite un mismo pipeline para repertorios mixtos.
- Investigación en alineamiento de canto: sirve como punto de partida o referencia para estudiar el comportamiento de alineadores CTC en música con coros superpuestos, dado que la v8 restaura coros solapados en el entrenamiento.
- Herramientas de aprendizaje de idiomas basadas en canciones: sincronizar la letra con el audio para resaltar la pronunciación en tiempo real en japonés o coreano, teniendo en cuenta las convenciones de romanización del modelo.
- Prototipos de anotación semiautomática de letras: generar timestamps aproximados que un humano revise después, útil por la advertencia del autor de que las métricas no garantizan una sincronización perceptualmente perfecta.
- Experimentación con letras de escritura mixta: el modelo declara soporte para mezclas de sistemas de escritura, lo que facilita probar repertorios que combinan, por ejemplo, japonés e inglés en la misma canción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona métricas internas de validación (precisión de fotogramas de letra y pérdida de alineamiento sobre segmentos temporizados reservados), pero no se proporcionan valores numéricos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 315,5 millones de parámetros en precisión completa (fp32) el peso ronda 1,26 GB, y en fp16 alrededor de 0,63 GB, sin contar activaciones ni el pipeline de separación de voz.
- GPU recomendadas: no disponible. Por tamaño, el modelo es ligero y no requiere GPU de数据中心; una GPU consumer con 4-8 GB de VRAM debería acomodar los pesos en fp16, aunque no hay confirmación del autor.
- Cabe en GPU consumer: previsiblemente sí por tamaño de pesos, pero no hay datos oficiales de requisitos ni de latencia.
- Opciones de despliegue: la model card documenta carga mediante `transformers` con `Wav2Vec2ForCTC` y `Wav2Vec2Processor`. No se mencionan vLLM, llama.cpp, Ollama ni TGI; el repositorio proporciona solo pesos, y el alineamiento requiere un pipeline compatible que combine emisiones acústicas con el texto de la letra.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Echora MMS 300M Multilingual Lyrics Forced Aligner | 315,5 M | no disponible | 7 + escritura mixta | other (solo personal, no comercial) | Fine-tune de MMS-300M para letras cantadas, con cabeza para coros de fondo |
| facebook/mms-300m | ~300 M | no disponible | ~1.100 idiomas | CC-BY-NC 4.0 | Modelo base multilingüe de Meta; no especializado en alineamiento de letras cantadas |
| Alineadores CTC genéricos sobre wav2vec2 (p. ej. torchaudio MMS_FA) | ~300 M | no disponible | variable | según implementación | Alineamiento de voz hablada; sin entrenamiento específico en canto ni coros superpuestos |

La comparación con alternativas especializadas en alineamiento de letras cantadas no está disponible en la información proporcionada.

## Limitaciones y advertencias

- La calidad del timing varía según la claridad vocal, la densidad instrumental, la calidad de grabación, el idioma y la exactitud de la letra.
- Frases repetidas, notas largas sostenidas, ad-libs, rap, efectos vocales y voces superpuestas pueden producir fronteras inexactas.
- Las series de interjecciones idénticas ("ooh, ooh", "oh-oh-oh") pueden colocarse tarde, con la primera mantenida sobre el resto.
- Las letras romanizadas pueden tener fronteras silábicas más débiles que las escritas en su sistema nativo.
- El coreano debe romanizarse por pronunciación (con liaison, nasalización y otros cambios fonéticos), no letra a letra; la v5 esperaba romanización letra a letra y sigue disponible fijando su revisión.
- Licencia restrictiva: solo uso personal y no comercial. Prohibido el uso en productos comerciales, servicios de pago, redistribución o entrenamiento de otros modelos. El usuario es responsable de tener los derechos sobre el audio y la letra procesados.
- No se concede permiso para usos sensibles a derechos de autor, restringidos por derechos o no autorizados.
- El repositorio contiene solo pesos; se necesita un pipeline de alineamiento forzado compatible para obtener timestamps.
- Al cargar con `Wav2Vec2ForCTC`, los pesos de la segunda cabeza (`stream2_head`) se reportan como no utilizados, lo cual es esperado y no un error.
- No hay datos publicados de benchmarks, latencia ni requisitos de hardware.

## Enlaces

- Hugging Face: https://huggingface.co/hcX02/echora-mms-300m-multilingual-lyrics-forced-aligner
- Modelo base: https://huggingface.co/facebook/mms-300m
- Repositorio de Echora: no disponible (la model card indica abrir issues en el repositorio de Echora, sin enlace explícito)
- Paper, blog o demo: no disponible
