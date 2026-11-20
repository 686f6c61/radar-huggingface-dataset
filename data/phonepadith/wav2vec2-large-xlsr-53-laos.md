# Phonepadith/wav2vec2-large-xlsr-53-laos

## Resumen

El modelo `wav2vec2-large-xlsr-53-laos` es un sistema de reconocimiento automático del habla (ASR) especializado en el idioma lao (ພາສາລາວ), desarrollado por el usuario Phonepadith. Se trata de un ajuste fino del modelo base `facebook/wav2vec2-large-xlsr-53` de Meta, al que se le ha sustituido la cabeza de preentrenamiento por una cabeza CTC nueva entrenada desde cero sobre 101 horas de audio en lao. El modelo resuelve un problema concreto y poco cubierto: el lao no forma parte de los 53 idiomas con los que se preentrenó XLSR-53, y su sistema de escritura es completamente desconocido para el modelo base, por lo que todo el vocabulario de caracteres y la cabeza CTC se aprenden desde cero en este ajuste.

Con 315,6 millones de parámetros (317M según la model card), el modelo se posiciona en la gama media de ASR, compitiendo directamente con alternativas como omniASR CTC v2, Typhoon FastConformer-T o Qwen3-ASR en el mismo conjunto de evaluación. Su relevancia actual radica en que ofrece un CER del 8,82% en un idioma de bajos recursos, con un coste computacional muy contenido (5 horas de entrenamiento en una sola GPU GB10), y con una documentación técnica inusualmente detallada sobre las decisiones de entrenamiento y las trampas de evaluación específicas del lao.

La arquitectura es un transformer wav2vec2 estándar de 24 capas con tamaño oculto 1024, entrenado con CTC sobre un vocabulario de 139 tokens a nivel de carácter. El modelo está pensado para inferencia en producción con audio de 16 kHz mono y se distribuye en formato safetensors a través de Hugging Face con la librería transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2 (transformer, 24 capas, hidden size 1024, `do_stable_layer_norm=True`) con cabeza CTC |
| Parametros totales | 315.580.171 (317M según model card) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de audio; la ventana depende del audio de entrada) |
| Tipos de cuantizacion | No disponible (no se documentan cuantizaciones oficiales; al ser safetensors se puede cuantizar a fp16/bf16/int8 con herramientas externas) |
| Idiomas soportados | Lao (lo) |
| Licencia | `aidctech` (licencia personalizada, ver archivo LICENSE en el repo) |
| Formato de pesos | safetensors |
| Modelo base | `facebook/wav2vec2-large-xlsr-53` |
| Vocabulario CTC | 139 tokens (137 reales + 2 no usados `<s>`/`</s>`) |
| Frecuencia de muestreo | 16 kHz mono (obligatorio) |
| Tamano del repo | 1,3 GB |

## Arquitectura y entrenamiento

El modelo parte de `facebook/wav2vec2-large-xlsr-53`, un transformer de 24 capas con tamaño oculto 1024 y normalización de capa estable. Se descartan las cabezas de preentrenamiento (`quantizer`, `project_q`, `project_hid`) y se inicializa una nueva `lm_head` para CTC sobre un vocabulario de 139 tokens. El codificador convolucional de características se congela (`freeze_feature_encoder()`), ya que se considera un front-end genérico de voz suficientemente bueno y su ajuste fino en un solo idioma tiende a desestabilizar el entrenamiento. El vocabulario es a nivel de carácter y se construye a partir de las transcripciones de entrenamiento: 55 caracteres lao, 26 letras latinas, 10 dígitos, 43 caracteres tailandeses presentes en el corpus y 3 especiales (`[PAD]` como blank CTC, `[UNK]` y `|` como delimitador de palabra). Se eliminaron 63 caracteres con menos de 10 ocurrencias (0,003% del texto).

El entrenamiento se realizó sobre 101 horas de audio en lao durante 8 épocas (7.200 pasos del optimizador), con batch efectivo de 32 (8 × 4 de acumulación de gradientes), learning rate 3e-4 con schedule lineal y 500 pasos de calentamiento, optimizador AdamW con clipping de norma 1.0, precisión bf16 y gradient checkpointing activado. Un detalle crítico documentado por el autor es que se desactivaron por completo SpecAugment (`mask_time_prob=0.0`) y todos los dropout (atención, hidden y `feat_proj`): con los valores estándar (0,05), combinados con bf16 y gradient checkpointing, el CTC no escapaba de la fase de todo-blank y el CER quedaba clavado en 99,88% durante más de 2.000 pasos. El mejor checkpoint se seleccionó por CER de validación en el paso 4.500 de 7.200, no en el paso final. El entrenamiento completo llevó 5 horas y 7 minutos en una única NVIDIA GB10 (DGX Spark) con un pico de 10,6 GB de memoria.

## Capacidades

- Reconocimiento automático del habla en lao a partir de audio de 16 kHz mono, con salida de texto a nivel de carácter.
- Decodificación CTC con vocabulario que cubre caracteres lao, latinos, dígitos y caracteres tailandeses presentes en el corpus.
- Normalización interna de objetivos: NFC, eliminación de puntuación y mayúsculas, conservación de todas las marcas combinantes (tonos y signos vocálicos) y mapeo de espacios al delimitador `|`.
- No modela puntuación (el CTC no la predice, ya que la métrica la descarta).
- No soporta tool calling ni function calling (es un modelo puramente ASR).
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multimodales más allá del audio de entrada (sin visión, sin audio de salida).
- No dispone de modo "thinking" ni capacidades de generación de texto libre.

## Casos de uso

- **Transcripción de reuniones y entrevistas en lao**: el modelo convierte audio de 16 kHz mono en texto con un CER del 8,82%, adecuado para generar actas o subtítulos en entornos donde no existe un ASR comercial fiable para este idioma.
- **Subtitulado automático de vídeo en lao**: integrado en un pipeline de preprocesado (extracción de audio, resample a 16 kHz, inferencia CTC), permite generar pistas de subtítulos para contenido audiovisual en lao con una calidad de referencia razonable.
- **Digitalización de archivos orales**: para bibliotecas, archivos históricos o proyectos de preservación lingüística que dispongan de grabaciones en lao, el modelo ofrece una transcripción automática que reduce drásticamente el coste de la transcripción manual.
- **Atención al cliente en lao**: en combinación con un motor de diálogo o un LLM posterior, el modelo puede transcribir llamadas o mensajes de voz de usuarios laoparlantes para su procesamiento en texto, aunque requiere un componente adicional para la parte conversacional.
- **Investigación lingüística y fonética**: el vocabulario a nivel de carácter y la conservación de marcas combinantes permiten usar el modelo para análisis de tonos y patrones ortográficos, siempre que se use un scorer adecuado que no elimine las marcas.
- **Evaluación comparativa de ASR de bajos recursos**: el modelo sirve como referencia reproducible (checkpoint, hiperparámetros y conjunto de evaluación documentados) para comparar nuevas aproximaciones de ASR en lao bajo las mismas condiciones de scoring.
- **Preprocesado para pipelines de datos**: transcripción masiva de audio en lao para alimentar corpus de texto que luego se usen en el entrenamiento de otros modelos (LLM, TTS, traducción), dado su bajo coste de inferencia.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (model-index). El conjunto de evaluación es un corpus interno de lao con 1.583 clips retenidos (5,5 horas), nunca vistos en entrenamiento ni validación. La métrica es CER (no WER), con normalización NFC, eliminación de puntuación y mayúsculas, y conservación de todas las marcas combinantes.

| Split | Proporción de datos | Clips | Horas | CER |
|---|---|---|---|---|
| Validación | 5,1% | 1.619 | 5,7 | 11,00% |
| Test | 4,9% | 1.583 | 5,5 | 8,82% |

Comparativa con otros ajustes finos en lao del mismo autor, evaluados sobre los mismos 1.583 clips y con el mismo scorer:

| Modelo | Parámetros | CER |
|---|---|---|
| omniASR CTC v2 | 325M | 7,94% |
| Typhoon FastConformer-T | 114M | 8,44% |
| **Este modelo** | **317M** | **8,82%** |
| Qwen3-ASR | 0,78B | 11,47% |
| Whistle | 29MB | 12,31% |

El CER de test (8,82%) es inferior al de validación (11,00%), lo que el autor atribuye a la variabilidad del conjunto y a la selección de checkpoint por validación. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque no aplican a un modelo ASR.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el modelo tiene 315,6M de parámetros. En fp32 ocupa aproximadamente 1,26 GB; en fp16/bf16, unos 0,63 GB; en int8, unos 0,32 GB. A esto hay que sumar la memoria de activaciones y del procesador de audio, por lo que en la práctica se puede inferir con menos de 2 GB en fp32 y menos de 1 GB en fp16.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM es suficiente. Se ha validado en NVIDIA GB10 (DGX Spark) para entrenamiento; para inferencia, una RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema.
- **Cabe en GPU de consumo**: sí, en cualquier GPU consumer moderna (GTX 1650 4 GB en adelante), e incluso en CPU para lotes pequeños.
- **Opciones de despliegue**: transformers (con `Wav2Vec2ForCTC` y `Wav2Vec2Processor`), y potencialmente ONNX Runtime o TorchScript si se exporta. No se documenta soporte oficial para vLLM, llama.cpp, Ollama o TGI, ya que son herramientas orientadas a LLM y no a ASR CTC.
- **Latencia y throughput estimados**: no disponibles en la información proporcionada. El autor reporta 5 h 07 min de entrenamiento en una GB10 con pico de 10,6 GB, pero no se publican cifras de latencia de inferencia.
- **Nota de hardware**: en GPUs NVIDIA Blackwell (sm_120/sm_121) es obligatorio desactivar cuDNN (`torch.backends.cudnn.enabled = False`) antes de la inferencia, según indica la model card.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | CER (test lao) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **wav2vec2-large-xlsr-53-laos** (este) | 317M | No aplica (audio) | 8,82% | `aidctech` | Hugging Face |
| omniASR CTC v2 | 325M | No aplica (audio) | 7,94% | No disponible | No disponible |
| Typhoon FastConformer-T | 114M | No aplica (audio) | 8,44% | No disponible | No disponible |
| Qwen3-ASR | 0,78B | No aplica (audio) | 11,47% | No disponible | No disponible |
| Whistle | 29MB | No aplica (audio) | 12,31% | No disponible | No disponible |

La comparativa se limita al CER sobre el mismo conjunto de evaluación y scorer. No se dispone de datos de contexto, licencia ni disponibilidad de los modelos alternativos en la información proporcionada. El modelo de este análisis es el único con licencia y repositorio documentados en la ficha.

## Limitaciones y advertencias

- **Idioma único**: el modelo solo soporta lao. No es multilingüe y no debe usarse con otros idiomas sin un ajuste fino adicional.
- **Riesgo de alucinación**: como todo modelo CTC, puede generar caracteres o palabras que no corresponden al audio, especialmente en segmentos con ruido, solapamiento de hablantes o audio de baja calidad.
- **Dependencia del scorer**: el autor advierte explícitamente de que no se debe usar `whisper_normalizer.basic.BasicTextNormalizer` para evaluar lao, porque mapea todas las marcas Unicode a espacio y el 21,9% del texto lao es de categoría Mark (tonos y signos vocálicos), lo que elimina errores de tono y produce métricas engañosamente buenas.
- **Formato de audio estricto**: la entrada debe ser 16 kHz mono. Cualquier otra frecuencia o número de canales requiere remuestreo previo; de lo contrario, los resultados serán incorrectos.
- **Licencia restrictiva**: la licencia `aidctech` es personalizada y no estándar. Es imprescindible revisar el archivo LICENSE del repositorio antes de cualquier uso comercial; no se garantiza permiso de uso comercial.
- **Sin puntuación**: el modelo no predice puntuación, por lo que la salida es texto sin signos, lo que puede requerir un postprocesado para aplicaciones finales.
- **Hardware Blackwell**: en GPUs NVIDIA sm_120/sm_121 es necesario desactivar cuDNN, lo que puede afectar al rendimiento y requiere una configuración específica.
- **Vocabulario limitado**: se eliminaron caracteres con menos de 10 ocurrencias, por lo que palabras con caracteres raros o préstamos poco frecuentes pueden producir `[UNK]` o errores.
- **Sin datos de sesgo**: no se documentan análisis de sesgo por género, edad o acento dentro del lao; el corpus de entrenamiento es interno y no se detalla su composición demográfica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phonepadith/wav2vec2-large-xlsr-53-laos
- Modelo base: https://huggingface.co/facebook/wav2vec2-large-xlsr-53
- Licencia (archivo LICENSE en el repo): https://huggingface.co/Phonepadith/wav2vec2-large-xlsr-53-laos/blob/main/LICENSE
- Imagen de comparativa de modelos lao: https://huggingface.co/Phonepadith/wav2vec2-large-xlsr-53-laos/blob/main/performance.png
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
