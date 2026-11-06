# diablomike20/speech-emotion-recognition-with-openai-whisper-large-v3

## Resumen

`diablomike20/speech-emotion-recognition-with-openai-whisper-large-v3` es un ajuste fino del codificador de audio de OpenAI Whisper Large V3 para clasificación de emociones en voz (speech emotion recognition, SER). Lo publica el usuario de Hugging Face diablomike20 partiendo de los pesos de `openai/whisper-large-v3`, reemplazando la cabeza de decodificación de transcripción por una cabeza de clasificación con siete etiquetas emocionales: angry, disgust, fearful, happy, neutral, sad y surprised. Con 637.298.695 parámetros en safetensors y un repositorio de 2,5 GB, es un modelo de audio-classification que se carga con `AutoModelForAudioClassification` dentro de la librería `transformers`.

El problema que resuelve es concreto: dada una grabación de voz, asignar una de siete categorías emocionales. Frente a pipelines clásicos basados en features acústicas artesanales (MFCC, prosodia) y clasificadores ligeros, este modelo aprovecha las representaciones del codificador de Whisper, entrenado con cientos de miles de horas de audio multilingüe, lo que en teoría le permite capturar patrones prosódicos y espectrales más ricos. Es relevante para quien necesite un punto de partida funcional y con licencia permisiva (Apache 2.0) para tareas de análisis afectivo de audio, sin tener que entrenar desde cero.

La ficha se basa exclusivamente en la model card del autor y en los metadatos de Hugging Face. No hay paper asociado, no hay resultados en el `model-index` y no se declaran idiomas soportados. Las cifras de evaluación que se citan proceden del autor y deben tratarse como no verificadas de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (Whisper Large V3) con cabeza de clasificación de audio |
| Parametros totales | 637.298.695 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible como contexto de texto; el preprocesado del autor trunca el audio a 30,0 s |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors en fp32/fp16; no se documentan GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | no disponibles (el dataset de entrenamiento incluye inglés —RAVDESS, SAVEE, TESS— y urdu) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo reutiliza el codificador de Whisper Large V3, un transformer encoder de aproximadamente 637 M de parámetros, y sustituye la cabeza de decodificación seq2seq original por una capa de clasificación lineal sobre el estado oculto agregado, típica de `AutoModelForAudioClassification`. La entrada se procesa con el `WhisperFeatureExtractor` con `do_normalize=True`, que convierte la forma de onda en log-Mel spectrograms normalizados. El audio se carga con Librosa y se trunca o rellena a 30 segundos antes de la extracción de features.

El ajuste fino se realizó sobre una mezcla de cuatro corpus públicos: RAVDESS, SAVEE, TESS y un dataset de habla en urdu. La distribución declarada es de 752 muestras para sad, happy y angry, 716 para neutral, 652 para disgust, fearful y surprised, y 192 para calm; esta última clase se excluyó del entrenamiento por infrarrepresentación. El total ronda las 4.900 muestras, un volumen pequeño para un modelo de este tamaño, lo que aumenta el riesgo de sobreajuste. Los hiperparámetros fueron: learning rate 5e-5, batch size efectivo 10 (2 × 5 pasos de acumulación de gradiente), optimizador Adam con betas (0,9; 0,999) y epsilon 1e-8, scheduler lineal con warmup del 10 %, 25 épocas, precisión mixta nativa (AMP) y semilla 42. No se documenta RLHF, DPO ni ninguna técnica de alineación; es un ajuste supervisado estándar con `Trainer` de `transformers` y seguimiento en Weights & Biases.

## Capacidades

- Clasificación de emociones en audio en siete clases: angry, disgust, fearful, happy, neutral, sad y surprised.
- Procesamiento de clips de audio de hasta 30 segundos mediante truncado o padding explícito en el preprocesado.
- Inferencia estándar de `transformers` (`AutoModelForAudioClassification` + `AutoFeatureExtractor`), compatible con `pipeline("audio-classification")`.
- Integración con el ecosistema `transformers` y despliegue vía Hugging Face Inference Endpoints (tag `endpoints_compatible`).
- No soporta generación de texto, transcripción, tool calling, function calling, razonamiento multi-paso, visión ni audio-to-text: la cabeza de decodificación de Whisper fue reemplazada.
- Capacidades multilingües: no documentadas; el entrenamiento mezcla inglés y urdu, pero no se declara cobertura por idioma ni se evalúa por separado.
- No dispone de modo thinking ni de salidas estructuradas más allá de la distribución de probabilidad sobre las siete etiquetas.

## Casos de uso

- Análisis de satisfacción en centros de llamadas: clasificar cada segmento de 30 s de una llamada en una de las siete emociones y agregar la distribución por agente o por cliente para detectar picos de frustración. El modelo es adecuado porque la etiqueta `angry` y `neutral` cubren el eje principal de escalado.
- Moderación de contenido en plataformas de audio: prefiltrar clips subidos por usuarios y marcar aquellos con alta probabilidad de `angry` o `fearful` para revisión humana. La licencia Apache 2.0 permite integrarlo en producto sin obligaciones de copyleft.
- Investigación en psicología y lingüística afectiva: obtener etiquetas automáticas sobre corpus de voz para estudios de prosodia emocional, usando el modelo como anotador débil y validando una muestra manualmente. El checkpoint sirve como línea base reproducible.
- Enriquecimiento de metadatos en archivos audiovisuales: etiquetar entrevistas, podcasts o grabaciones de archivo con la emoción dominante por segmento para facilitar búsqueda y recuperación. El truncado a 30 s encaja con la segmentación habitual de estos materiales.
- Prototipado de asistentes empáticos: adaptar la respuesta de un agente conversacional según la emoción detectada en el turno del usuario (por ejemplo, derivar a un humano cuando la clase dominante sea `angry`). Requiere añadir ASR por separado, ya que este modelo no transcribe.
- Evaluación de calidad en doblaje y locución: comparar la emoción detectada en la pista original frente a la doblada para verificar que se preserva la intención afectiva. El modelo permite un chequeo automático a escala sobre clips cortos.
- Docencia y demos de SER: ejemplo didáctico de fine-tuning de Whisper para clasificación, con hiperparámetros y curvas publicadas en WandB, útil en cursos de procesamiento de audio.

## Benchmarks y rendimiento

El `model-index` del repositorio está vacío (`results: []`), por lo que no hay benchmarks formales declarados. El autor sí publica métricas de validación en la model card, obtenidas con su propio split de test y no verificables de forma independiente:

| Metrica | Valor declarado por el autor |
|---|---|
| Loss | 0,5008 |
| Accuracy | 0,9199 |
| Precision | 0,9230 |
| Recall | 0,9199 |
| F1 | 0,9198 |

Evolución por época (extracto de la tabla del autor, validación):

| Epoca | Step | Validation loss | Accuracy | F1 |
|---|---|---|---|---|
| 1 | 394 | 0,4911 | 0,8286 | 0,8302 |
| 3 | 1182 | 0,5076 | 0,8692 | 0,8684 |
| 5 | 1971 | 0,4578 | 0,9108 | 0,9114 |
| 8 | 3153 | 0,5008 | 0,9199 | 0,9198 |
| 10 | 3942 | 0,5856 | 0,8895 | 0,8915 |
| 11 | 4336 | 0,8334 | 0,8773 | 0,8770 |

No se han publicado comparaciones con otros modelos de SER en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 2,5-3 GB solo para pesos, más activaciones y buffers del extractor; en la práctica, 4-6 GB cubren un batch pequeño.
- En fp16/bf16: aproximadamente 1,3 GB de pesos, con un consumo total típico de 2-4 GB según batch y longitud de audio.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para uso cómodo en fp16 (RTX 3060 Ti, RTX 4060, RTX 4070, L4, A10). Para throughput alto, A100 o H100 con batch grande.
- Cabe en GPU de consumo: sí, en RTX 3060 de 12 GB, RTX 4060 Ti, RTX 4070 y superiores; en GPUs de 8 GB funciona con batch pequeño y fp16.
- Despliegue: `transformers` con `pipeline("audio-classification")`, Hugging Face Inference Endpoints (tag `endpoints_compatible`), y servidores tipo TGI o vLLM solo si soportan modelos de audio-classification (no es un modelo generativo; verificar compatibilidad antes de asumirlo). `llama.cpp` y `Ollama` no aplican a este tipo de checkpoint salvo conversión manual a GGUF, no documentada.
- Latencia y throughput: no disponibles. Como referencia estructural, el codificador de Whisper Large V3 procesa ventanas de 30 s; el coste por clip es del orden de decenas de milisegundos en GPU moderna, pero no hay medición publicada para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (diablomike20/whisper-large-v3 SER) | 637 M | audio de 30 s | Clasificacion de 7 emociones | Apache 2.0 | Hugging Face, 22 descargas |
| `firdhokk/speech-emotion-recognition-with-openai-whisper-large-v3` | ~637 M | audio de 30 s | Clasificacion de 7 emociones | Apache 2.0 | Hugging Face (checkpoint del que parece derivar el codigo de la model card) |
| `openai/whisper-large-v3` | ~1.550 M | audio de 30 s | Transcripcion y traduccion | Apache 2.0 | Hugging Face, ampliamente usado |
| `superb/wav2vec2-base-superb-er` | ~95 M | audio variable | Clasificacion de 4 emociones (IEMOCAP) | Apache 2.0 | Hugging Face |

El modelo base Whisper Large V3 no es comparable en tarea (transcribe, no clasifica emociones), pero sí en coste computacional: este checkpoint es más ligero al haber descartado el decodificador. `superb/wav2vec2-base-superb-er` es la alternativa clásica de referencia en SER: mucho más pequeño, cuatro clases y entrenado sobre IEMOCAP, lo que facilita comparaciones académicas pero limita la granularidad emocional. No se dispone de datos de rendimiento cruzado entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Dataset de entrenamiento pequeño (unas 4.900 muestras efectivas tras excluir `calm`) para un modelo de 637 M de parámetros; el riesgo de sobreajuste es alto y las métricas del autor (accuracy 0,92) probablemente no se generalicen a dominios distintos.
- Las métricas declaradas proceden del propio split del autor y no están verificadas de forma independiente; el `model-index` está vacío.
- Sesgo de dominio y de idioma: los corpus son actuados (RAVDESS, SAVEE, TESS) y mayoritariamente en inglés, más un dataset en urdu; el comportamiento en español, en habla espontánea o en condiciones de ruido no está evaluado.
- Las emociones actuadas no equivalen a emociones reales; la transferencia a audio de producción (llamadas, reuniones) puede degradarse de forma notable.
- Riesgo de clasificación errónea en emociones acústicamente próximas (`fearful` vs `surprised`, `sad` vs `neutral`) y en hablantes con prosodia atípica.
- El truncado a 30 s descarta información en grabaciones largas; no hay mecanismo de agregación documentado.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Whisper Large V3 arrastra sus propias condiciones; conviene revisar la licencia del checkpoint original antes de desplegar en producto.
- No es un modelo generativo: no transcribe ni responde en lenguaje natural; requiere un pipeline ASR separado si se necesita texto.
- Sin garantías de calibración de probabilidades; las salidas deben tratarse como scores relativos y no como probabilidades calibradas.

## Enlaces

- Hugging Face: https://huggingface.co/diablomike20/speech-emotion-recognition-with-openai-whisper-large-v3
- Modelo base: https://huggingface.co/openai/whisper-large-v3
- Seguimiento de entrenamiento en WandB: https://wandb.ai/firdhoworking-sepuluh-nopember-institute-of-technology/speech-emotion-recognition-with-whisper?nw=nwuserfirdhoworking
- Dataset RAVDESS: https://zenodo.org/records/1188976#.XsAXemgzaUk
- Dataset SAVEE: https://www.kaggle.com/datasets/ejlok1/surrey-audiovisual-expressed-emotion-savee/data
- Dataset TESS: https://tspace.library.utoronto.ca/handle/1807/24487
- Dataset URDU: https://www.kaggle.com/datasets/bitlord/urdu-language-speech-dataset
