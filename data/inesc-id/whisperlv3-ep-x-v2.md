# inesc-id/WhisperLv3-EP-X-v2

## Resumen

WhisperLv3-EP-X-v2 es un modelo de reconocimiento automático del habla (ASR) desarrollado por INESC-ID (Instituto Superior Técnico, Lisboa) como parte del proyecto CAMÕES. Se trata de un ajuste fino de `openai/whisper-large-v3` sobre 425 horas de portugués europeo (EP-425), empaquetado específicamente para su uso con WhisperX mediante CTranslate2 y segmentación basada en VAD. Su propósito es mejorar la transcripción de portugués europeo, un dominio donde los modelos Whisper originales rinden notablemente peor que en otras lenguas.

El modelo es una nueva versión (retrain) de WhisperLv3-EP-X sobre una versión reparada de los datos de entrenamiento, corrigiendo dos problemas del predecesor: la pérdida de la primera parte de las palabras con guion (*nota-se*, *guarda-roupa*) y el uso inconsistente de la ortografía post-Acuerdo Ortográfico de 1990. Con ello reduce el WER medio en portugués europeo del benchmark CAMÕES de 12,36 a 11,98.

Es relevante para cualquier pipeline de ASR en portugués europeo que necesite transcripciones normalizadas (minúsculas, sin puntuación, números escritos con palabras) y con un rendimiento medido de forma rigurosa sobre un benchmark público y reproducible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3) |
| Parámetros totales | 1,55 mil millones (todos ajustados) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 30 segundos por ventana de audio (ventana nativa de Whisper); segmentación externa por VAD en WhisperX |
| Tipos de cuantización | float16 recomendado (formato CTranslate2); otras cuantizaciones de CTranslate2 no documentadas en la información disponible |
| Idiomas soportados | portugués (pt), con especialización en portugués europeo |
| Licencia | MIT |
| Formato de pesos | CTranslate2 (`model.bin`); tamaño del repositorio 3,1 GB |

## Arquitectura y entrenamiento

El modelo parte de `openai/whisper-large-v3`, un transformer encoder-decoder de 1,55 mil millones de parámetros entrenado originalmente por OpenAI para ASR multilingüe. INESC-ID ajusta finamente todos los parámetros sobre EP-425, un conjunto de 425 horas de portugués europeo compuesto por 14 corpus (los mismos datos de entrenamiento del benchmark CAMÕES). Las transcripciones objetivo se normalizan con el normalizador de CAMÕES (minúsculas, sin puntuación, números con palabras) pero protegiendo las palabras con guion. Además, las transcripciones de Fala Bracarense (105 000 enunciados) se reconstruyeron desde las originales para restaurar guiones, clíticos y dígitos que se habían perdido al preparar el corpus (por ejemplo, «lembro-me» se había convertido en «lembrome»).

El ajuste fino se realizó durante 10 épocas con tamaño de lote 256, tasa de aprendizaje 1e-5, schedule coseno con 20 % de warm-up, label smoothing de 0,1 y precisión bf16. El modelo final es la media de los pesos de los checkpoints tras las épocas 2, 3 y 5, ya que las épocas posteriores sobreajustaban. La decodificación se realiza con WhisperX (detección de actividad de voz más faster-whisper con batching), lo que reduce las alucinaciones típicas de Whisper. No se documenta en la información disponible el uso de RLHF ni DPO; el entrenamiento es supervisado sobre transcripciones.

## Capacidades

- Transcripción de voz a texto en portugués europeo con salida normalizada: minúsculas, sin puntuación y números escritos con palabras.
- Manejo correcto de palabras con guion (*nota-se*, *guarda-roupa*, *segunda-feira*), que el predecesor tendía a truncar.
- Ortografía post-Acuerdo Ortográfico de 1990 en el 99 % de las palabras afectadas (*atores*, *projeto*, *ação*), frente al 81 % del modelo anterior.
- Segmentación basada en VAD mediante WhisperX, que reduce alucinaciones en silencios y segmentos ruidosos.
- Decodificación por lotes (batch size 8 en los experimentos reportados) para mayor rendimiento.
- No se documenta soporte de tool calling, agentes, visión ni audio más allá de la transcripción ASR en la información disponible.
- Capacidad multilingüe limitada al portugués: el modelo está especializado en pt y su uso esperado es con `language="pt"` y `task="transcribe"`.

## Casos de uso

- Subtitulado y transcripción de medios audiovisuales en portugués europeo: el modelo genera texto normalizado (sin puntuación, minúsculas) que puede postprocesarse con un modelo de puntuación para producir subtítulos; su WER de 5,15 en broadcast news (ALERT) lo hace adecuado para noticiarios y contenido informativo.
- Actas y transcripción de clases magistrales: en el dominio de charlas y conferencias (LECTRA, MuAViC) obtiene un WER medio de 10,43, útil para generar apuntes automáticos de cursos universitarios en portugués.
- Análisis de entrevistas sociolingüísticas: en el dominio SI (entrevistas sociolingüísticas) alcanza un WER de 25,78, el mejor de los modelos comparados en la información disponible, lo que lo hace apropiado para proyectos de investigación lingüística que requieran transcripción masiva de entrevistas.
- Transcripción de conversaciones espontáneas: con WER de 10,40 en el dominio conversacional (PostPort, VoxCeleb), puede emplearse en análisis de llamadas o reuniones, siempre con revisión humana dado el carácter espontáneo del habla.
- Investigación en ASR para portugués europeo: sirve como línea base reproducible sobre el benchmark CAMÕES con scripts y normalizador públicos, útil para comparar nuevas propuestas de ajuste fino o arquitecturas.
- Pipelines de datos a gran escala: al estar empaquetado en CTranslate2 con soporte de float16 y batching en WhisperX, permite procesar grandes volúmenes de audio en GPU con throughput alto y menor huella de memoria que el checkpoint original de Whisper.
- Aplicaciones de accesibilidad: transcripción de audio a texto para personas con discapacidad auditiva en contextos de portugués europeo, con la advertencia de que la salida normalizada requiere un paso adicional de puntuación y capitalización.

## Benchmarks y rendimiento

Resultados de WER (%) sobre los conjuntos de test del benchmark CAMÕES, decodificados con WhisperX (float16, batch size 8) y el normalizador de CAMÕES (minúsculas, sin puntuación, números con palabras). WER a nivel de corpus por conjunto de test; cada dominio es la media de sus conjuntos de test y EP Avg. es la media de los cinco dominios.

| Modelo | RS | BN | T/L | CS | SI | EP Avg. |
|---|---|---|---|---|---|---|
| WhisperLv3-EP-X (paper) | 7,41 | 4,66 | 10,92 | 10,91 | 27,90 | 12,36 |
| WhisperLv3-EP-X-CPP | 7,99 | 5,58 | 10,54 | 10,75 | 25,91 | 12,15 |
| **WhisperLv3-EP-X-v2 (este modelo)** | 8,15 | 5,15 | 10,43 | 10,40 | 25,78 | **11,98** |

Dominios: RS = habla leída, BN = noticias de broadcast, T/L = charlas y conferencias, CS = habla conversacional, SI = entrevistas sociolingüísticas.

Sin SpeechDat (no disponible públicamente), el modelo obtiene RS 8,59 y EP Avg. 12,07, frente a RS 7,8 y EP Avg. 12,5 del modelo del paper. Con una puntuación que conserva las palabras con guion y equipara grafías pre y post-Acuerdo, el EP Avg. es 11,34 para este modelo, 11,51 para WhisperLv3-EP-X-CPP y 13,13 para WhisperLv3-EP-X.

Desglose por conjunto de test (WER %):

| Dominio | Test set | WhisperLv3-EP-X | Este modelo |
|---|---|---|---|
| RS | BD-Público | 1,38 | 3,53 |
| RS | CommonVoice | 9,48 | 9,23 |
| RS | MLS_extended | 8,80 | 8,77 |
| RS | PT_Adults | 2,27 | 2,78 |
| RS | PT_Children (parte 1) | 20,30 | 23,34 |
| RS | PT_Children (parte 2) | 4,61 | 4,26 |
| RS | PT_Elderly | 8,06 | 8,20 |
| RS | SpeechDat | 4,39 | 5,08 |
| BN | ALERT | 4,66 | 5,15 |
| T/L | LECTRA | 9,34 | 9,06 |
| T/L | MuAViC | 12,50 | 11,80 |
| CS | PostPort | 13,67 | 13,04 |
| CS | VoxCeleb | 8,15 | 7,77 |
| SI | Fala Bracarense | 16,57 | 15,59 |
| SI | PT Fundamental | 39,22 | 35,97 |

## Requisitos de hardware

- VRAM estimada para inferencia en float16: aproximadamente 3,1 GB de pesos más memoria de activaciones y del pipeline de WhisperX; en la práctica, el modelo cabe holgadamente en GPUs de consumo con 8 GB o más.
- GPU recomendadas: cualquier GPU NVIDIA con soporte de float16 y al menos 8 GB de VRAM (RTX 3060 Ti, RTX 4060, RTX 4070, RTX 4090); en entornos de servidor, A100, H100 o L4 para mayor throughput con batching.
- Cabe en GPU de consumo: sí, en modelos con 8 GB o más de VRAM en float16; en cuantizaciones más agresivas de CTranslate2 no se documenta el requisito exacto en la información disponible.
- Opciones de despliegue: WhisperX (recomendado por el autor, con VAD y faster-whisper subyacente), CTranslate2 directamente, faster-whisper; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI en la información disponible, dado que no es un modelo de lenguaje sino de ASR.
- Latencia y throughput: no se publican cifras concretas de latencia ni de throughput en la información disponible; el autor reporta decodificación con batch size 8 y float16 en los experimentos de benchmark.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto de audio | EP Avg. (CAMÕES) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WhisperLv3-EP-X-v2 | 1,55 B | 30 s por ventana (VAD externo) | 11,98 | MIT | Hugging Face (inesc-id) |
| WhisperLv3-EP-X (paper) | 1,55 B | 30 s por ventana (VAD externo) | 12,36 | MIT | Hugging Face (inesc-id) |
| WhisperLv3-EP-X-CPP | 1,55 B | 30 s por ventana (VAD externo) | 12,15 | MIT | Hugging Face (inesc-id) |
| openai/whisper-large-v3 (base) | 1,55 B | 30 s por ventana | no disponible en la información proporcionada | MIT | Hugging Face (openai) |

La comparativa se limita a la familia CAMÕES y al modelo base, ya que la información proporcionada no incluye resultados de otros sistemas ASR sobre el benchmark CAMÕES. La diferencia principal entre las tres variantes CAMÕES es el formato de salida: WhisperLv3-EP-X-v2 y WhisperLv3-EP-X producen texto normalizado, mientras que WhisperLv3-EP-X-CPP produce texto capitalizado y con puntuación.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en portugués europeo; no debe esperarse un rendimiento adecuado en portugués brasileño ni en otras lenguas, aunque el modelo base sea multilingüe.
- La salida es texto normalizado (minúsculas, sin puntuación, números con palabras); para obtener texto capitalizado y punteado debe usarse la variante WhisperLv3-EP-X-CPP o aplicar un postprocesado adicional.
- El normalizador de CAMÕES elimina la primera parte de las palabras con guion en las referencias, por lo que escribir la palabra completa se cuenta como error; esto penaliza artificialmente a este modelo en algunos conjuntos (por ejemplo, BD-Público: 3,53 frente a 1,38 del predecesor) y debe tenerse en cuenta al interpretar los WER.
- Riesgo de alucinación: aunque WhisperX con VAD reduce las alucinaciones típicas de Whisper, persisten en segmentos con ruido, música o silencios largos; se recomienda revisión humana en producción.
- Sesgos conocidos: no se documentan análisis específicos de sesgos en la información disponible; al entrenarse sobre 14 corpus de portugués europeo, puede heredar sesgos de dominio y de hablantes de esos corpus (por ejemplo, peor rendimiento en habla infantil: PT_Children parte 1 con WER 23,34).
- Rendimiento desigual por dominio: el WER en entrevistas sociolingüísticas (PT Fundamental, 35,97) es muy superior al de habla leída, lo que limita su uso sin revisión en dominios muy alejados del entrenamiento.
- Licencia MIT: permite uso comercial y modificación, pero se recomienda citar el paper de CAMÕES y verificar las licencias de los corpus de entrenamiento subyacentes, no detalladas en la información disponible.
- El modelo se distribuye en formato CTranslate2; para usarlo con otras herramientas (por ejemplo, transformers) sería necesaria una conversión no documentada en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/inesc-id/WhisperLv3-EP-X-v2
- Modelo del paper (WhisperLv3-EP-X): https://huggingface.co/inesc-id/WhisperLv3-EP-X
- Variante capitalizada y punteada (WhisperLv3-EP-X-CPP): https://huggingface.co/inesc-id/WhisperLv3-EP-X-CPP
- Paper CAMÕES: https://arxiv.org/abs/2508.19721
- Benchmark CAMÕES en Hugging Face: https://huggingface.co/datasets/inesc-id/camoes_asr
- Repositorio WhisperX: https://github.com/m-bain/whisperX
- Modelo base: https://huggingface.co/openai/whisper-large-v3
