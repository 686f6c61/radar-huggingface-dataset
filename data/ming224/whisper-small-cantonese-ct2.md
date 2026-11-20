# Ming224/whisper-small-cantonese-ct2

## Resumen

Whisper-small-cantonese-ct2 es una conversión a CTranslate2 en precisión int8 del modelo Ming224/whisper-small-cantonese, un ajuste fino de openai/whisper-small (242 millones de parámetros) especializado en reconocimiento automático de habla cantonesa de Hong Kong. El modelo resuelve un problema concreto y bien documentado: el Whisper original, al transcribir cantonés, tiende a traducir el habla a mandarín estándar en lugar de escribir los caracteres coloquiales cantoneses (por ejemplo, escribe 在、不、的、他、們 en vez de 喺、唔、嘅、佢、哋). Este ajuste corrige ese comportamiento y produce texto en caracteres tradicionales de Hong Kong.

El modelo se entrenó sobre 22,6 horas de audio validado de Mozilla Common Voice 27.0 (locale zh-HK), con 19.942 clips y 303 hablantes, excluyendo hablantes y frases presentes en los splits oficiales de desarrollo y test. La conversión a CTranslate2 int8 reduce el peso a 237 MB y permite inferencia en CPU de portátil a aproximadamente 0,4 veces el tiempo real, lo que lo hace viable para despliegues ligeros sin GPU.

Es relevante ahora porque el cantonés es una lengua con escasa cobertura en modelos ASR de código abierto, y esta ficha ofrece una alternativa ligera, con licencia Apache 2.0 y métricas publicadas (CER del 11,1 % frente al 38,3 % del Whisper-small zero-shot en un subconjunto de test), pensada para su uso con faster-whisper. Se trata de un proyecto de curso (IERG4320 / IEMS5726A, CUHK, 2026-27), lo que conviene tener en cuenta respecto a su madurez y mantenimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper-small), convertido a CTranslate2 |
| Parametros totales | 242 millones (todos ajustados en el fine-tuning) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de Whisper-small, 30 s por segmento) |
| Tipos de cuantizacion | int8 (conversion CTranslate2); el modelo base admite otras cuantizaciones CTranslate2 no documentadas en la model card |
| Idiomas soportados | yue (cantonés), zh; se debe usar con `language="zh"` porque Whisper-small no tiene token de idioma dedicado para cantonés |
| Licencia | Apache 2.0 |
| Formato de pesos | CTranslate2 (modelo convertido para faster-whisper); el modelo base original esta en formato Whisper/Safetensors |
| Tamano del repositorio | 0,2 GB (modelo convertido de 237 MB) |
| Modelo base | openai/whisper-small |
| Pipeline | automatic-speech-recognition |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper-small: un transformer encoder-decoder con 242 millones de parámetros, diseñado originalmente para transcripción y traducción de voz multilingüe. En este caso, todos los parámetros se ajustaron mediante fine-tuning supervisado sobre pares audio-transcripción, sin que la model card documente etapas de RLHF o DPO. La conversión posterior a CTranslate2 en int8 no altera la arquitectura, solo el formato y la precisión numérica para optimizar la inferencia.

El entrenamiento utilizó Mozilla Common Voice 27.0, locale zh-HK (licencia CC0-1.0): 19.942 clips validados, 22,6 horas y 303 hablantes. Se aplicaron criterios de balanceo (máximo 5 grabaciones por frase y 20 minutos por hablante) y se excluyeron los hablantes y frases de los splits oficiales dev/test para evitar filtración de datos. La configuración fue de 4.000 pasos (unas 3,2 épocas), batch efectivo de 16 (8 × 2 de acumulación de gradiente), learning rate de 1e-5 con 500 pasos de warm-up y decaimiento lineal, precisión fp16 sobre una NVIDIA T4 en Google Colab durante aproximadamente 2 h 50 min. El mejor checkpoint fue el paso 3.500. El texto objetivo se normalizó sin puntuación y en caracteres tradicionales de Hong Kong. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Transcripción de voz cantonesa (Hong Kong) a texto escrito en caracteres tradicionales, incluyendo caracteres coloquiales cantoneses como 喺、唔、嘅、佢、哋.
- Reconocimiento automático de habla (ASR) de un solo paso, sin traducción a mandarín, que es el comportamiento por defecto del Whisper original.
- Salida en texto normalizado sin puntuación, coherente con los objetivos de entrenamiento.
- Funcionamiento en CPU mediante faster-whisper con cuantización int8, sin necesidad de GPU.
- Soporte de decodificación con beam search (la model card usa `beam_size=5`).
- Idiomas: cantonés (yue) y chino (zh); no se documentan capacidades multilingües adicionales.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio más allá de ASR ni modo thinking.

## Casos de uso

- Subtitulado de vídeos y pódcasts en cantonés: el modelo transcribe audio en caracteres tradicionales de Hong Kong, útil para creadores de contenido que necesitan subtítulos sin pasar por una GPU dedicada, dado su rendimiento de 0,4× tiempo real en CPU de portátil.
- Transcripción de reuniones y notas de voz: para grabaciones cortas de habla leída o semileída, el modelo puede integrarse en una aplicación de escritorio con faster-whisper y procesar segmentos de audio de forma local y privada.
- Archivado y búsqueda de contenido audiovisual en cantonés: al convertir audio a texto indexable, permite construir motores de búsqueda sobre archivos de audio históricos, siempre que se segmenten previamente con un detector de actividad de voz (VAD).
- Prototipado académico y de investigación en ASR de lenguas de bajos recursos: sirve como línea base ligera para experimentos con Common Voice zh-HK, con métricas CER publicadas y una receta de entrenamiento reproducible.
- Aplicaciones de accesibilidad para hablantes de cantonés: transcripción en tiempo casi real en dispositivos sin GPU, por ejemplo en entornos educativos o de atención presencial.
- Integración en pipelines de procesamiento por lotes: al ser un modelo CTranslate2 de 237 MB, puede desplegarse en contenedores ligeros y procesar lotes de audio corto con bajo coste de infraestructura.
- Evaluación comparativa de modelos ASR: como checkpoint con CER documentado (11,1 % en un subconjunto de test), resulta útil para comparar el impacto del fine-tuning frente al Whisper-small zero-shot (38,3 %).

## Benchmarks y rendimiento

CER = character error rate (menor es mejor). El texto se normaliza antes de puntuar: se elimina la puntuación, se convierte de simplificado a tradicional de Hong Kong (OpenCC `s2hk`) y se unifican variantes inequívocas.

| Modelo | Conjunto | CER |
|---|---|---|
| whisper-small (zero-shot) | Subconjunto fijo de 300 utterances del test oficial (faster-whisper, int8, beam 5) | 38,3 % |
| whisper-small-cantonese-ct2 | Subconjunto fijo de 300 utterances del test oficial (faster-whisper, int8, beam 5) | 11,1 % |
| whisper-small-cantonese-ct2 | Validación: 500 utterances del split dev oficial (mejor checkpoint, paso 3500) | 10,71 % |

La model card indica que los resultados completos del test se añadirán más adelante. La mayor ganancia se observa en caracteres coloquiales cantoneses, que el modelo ajustado escribe correctamente aproximadamente el 93 % de las veces.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo convertido a int8 ocupa 237 MB, por lo que la inferencia en GPU requiere muy poca memoria; no se especifica una cifra exacta de VRAM en la model card.
- GPU recomendadas: no se documentan requisitos de GPU; el modelo se entrenó en una NVIDIA T4 (Google Colab), y la inferencia está optimizada para CPU.
- Cabe en GPU de consumo: sí, por tamaño (237 MB en int8); no se detallan modelos concretos de GPU de consumo en la documentación.
- Opciones de despliegue: faster-whisper con CTranslate2 (documentado), en dispositivo CPU con `compute_type="int8"`; no se documentan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: aproximadamente 0,4× tiempo real en CPU de portátil según la model card; no se publican cifras de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | CER documentado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ming224/whisper-small-cantonese-ct2 | 242 M | Segmentos de 30 s (Whisper-small) | 11,1 % (subconjunto test), 10,71 % (dev) | Apache 2.0 | Hugging Face, formato CTranslate2 |
| openai/whisper-small (zero-shot) | 242 M | Segmentos de 30 s | 38,3 % (mismo subconjunto test) | MIT (modelo original de OpenAI) | Hugging Face |
| Ming224/whisper-small-cantonese | 242 M | Segmentos de 30 s | no disponible en la informacion proporcionada | Apache 2.0 | Hugging Face, pesos originales |

No se dispone de datos de otros modelos ASR específicos para cantonés en la información proporcionada, por lo que la comparativa se limita a las variantes del propio Whisper-small documentadas.

## Limitaciones y advertencias

- Entrenado sobre habla leída corta (mediana de 3,7 s); no cubre conversación espontánea, ruido de fondo ni grabaciones largas, que deben dividirse previamente (por ejemplo, con un VAD).
- Los errores restantes son mayoritariamente homófonos, especialmente en nombres de lugares y nombres propios.
- La salida no incluye puntuación, porque los objetivos de entrenamiento se normalizaron.
- Los hablantes de Common Voice no están balanceados por género ni edad; el rendimiento en grupos infrarrepresentados puede ser inferior.
- No tiene token de idioma dedicado para cantonés: debe usarse con `language="zh"`, y un uso incorrecto del parámetro de idioma puede degradar la transcripción.
- Riesgo de alucinación inherente a los modelos Whisper en segmentos de audio con silencio o ruido; no se documenta mitigación específica.
- Es un proyecto de curso (CUHK, 2026-27) con 0 descargas y 0 likes en el momento de la consulta; no hay garantía de mantenimiento ni de soporte.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones de los datos de Common Voice (CC0-1.0) y del modelo base de OpenAI en el contexto de producción.
- No se han publicado los resultados completos del conjunto de test; las cifras de test proceden de un subconjunto fijo de 300 utterances.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ming224/whisper-small-cantonese-ct2
- Modelo base ajustado (pesos originales): https://huggingface.co/Ming224/whisper-small-cantonese
- Modelo original de OpenAI: https://huggingface.co/openai/whisper-small
- faster-whisper (repositorio): https://github.com/SYSTRAN/faster-whisper
- Mozilla Common Voice 27.0: no disponible como enlace en la informacion proporcionada
- Paper de Whisper: no disponible como enlace en la informacion proporcionada
