# oluwagbotty/nemo-ctc-ky-ft-10ep-noise

## Resumen

El modelo `oluwagbotty/nemo-ctc-ky-ft-10ep-noise` es un sistema de reconocimiento automático del habla (ASR) para kinyarwanda, especializado en habla no estándar, concretamente en personas con tartamudez. Se trata de un ajuste fino (fine-tuning) del modelo `nvidia/stt_rw_conformer_ctc_large` sobre la partición de entrenamiento del dataset CDLI de habla no estándar de Ruanda, cuyos hablantes son mayoritariamente adultos jóvenes que tartamudean. Lo desarrolla el usuario de Hugging Face `oluwagbotty` en el marco de un proyecto de investigación del Rwanda Innovation Sprint, impulsado por el Centre for Digital Language Inclusion (CDLI) del UCL.

El modelo emplea una arquitectura conformer CTC (Connectionist Temporal Classification) de NVIDIA NeMo, lo que implica una decodificación no autorregresiva y, por tanto, inmune al modo de fallo de bucles repetitivos típico de los modelos autorregresivos tipo Whisper. El repositorio ocupa 0,5 GB y los pesos se distribuyen en formato `.nemo`. Su relevancia radica en abordar un nicho poco cubierto: el ASR para lenguas de bajos recursos combinado con habla atípica, un escenario donde los sistemas comerciales suelen degradarse notablemente.

La motivación declarada es la investigación en reconocimiento de voz de bajo coste para personas que tartamudean, con el objetivo de mejorar la accesibilidad de las tecnologías del habla en contextos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer CTC (NVIDIA NeMo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en formato `.nemo`) |
| Idiomas soportados | Kinyarwanda (`rw`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | `.nemo` (checkpoint NeMo) |
| Modelo base | `nvidia/stt_rw_conformer_ctc_large` |
| Dataset de ajuste | `cdli/rwandan_kinyarwanda_nonstandard_speech_v1.0` |
| Tamano del repositorio | 0,5 GB |
| Libreria | NeMo |
| Pipeline | automatic-speech-recognition |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Conformer, un transformer que combina capas de autoatención con convoluciones, y que en este caso se emplea con una cabeza de decodificación CTC. Esta elección implica que la salida se genera de forma no autorregresiva, lo que evita el fenómeno de bucles repetitivos que afecta a modelos generativos como Whisper. El punto de partida es el modelo `nvidia/stt_rw_conformer_ctc_large` de NVIDIA, ya entrenado para kinyarwanda, sobre el que se realiza un ajuste fino supervisado.

El entrenamiento se llevó a cabo únicamente sobre la partición de train del dataset CDLI, usando la partición de dev para seleccionar el checkpoint y la de test para una evaluación única posterior. No se usó la partición `extra` y ningún hablante aparece en más de una partición. Se entrenó hasta 10 épocas con parada temprana sobre el WER de dev (paciencia de 3 evaluaciones), semilla 42, tasa de aprendizaje 1e-4 y precisión `bf16-mixed`. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación, algo esperable en un modelo ASR. El código de entrenamiento se encuentra en `scripts/molab/run_experiments.py` y `experiments/finetune.yaml` del repositorio del proyecto.

## Capacidades

- Reconocimiento automático del habla en kinyarwanda, con especial énfasis en habla tartamuda y no estándar.
- Decodificación CTC greedy, que procesa una grabación cada vez y no genera bucles repetitivos.
- Transcripción de habla leída (frases leídas a partir de texto) y de habla descrita a partir de imágenes (descripciones libres).
- Manejo de repeticiones propias de la tartamudez, ya que las transcripciones de referencia las escriben de forma literal (aunque el modelo puede reproducirlas o no).
- No se documenta soporte de tool calling, agentes, razonamiento multietapa, visión ni audio más allá de la transcripción.
- Capacidad multilingüe limitada al kinyarwanda; no se declaran otros idiomas.

## Casos de uso

- **Transcripción asistida para personas que tartamudean**: el modelo puede convertir grabaciones de habla tartamuda en texto para su revisión posterior por parte del hablante, gracias a su ajuste específico sobre este tipo de habla y a su decodificación CTC sin bucles.
- **Investigación en accesibilidad del habla**: sirve como línea base reproducible para estudiar el rendimiento de ASR en habla atípica en lenguas de bajos recursos, con métricas WER y CER documentadas sobre particiones separadas por hablante.
- **Prototipos de aplicaciones de dictado en kinyarwanda**: puede integrarse en aplicaciones de dictado o subtitulado para contextos ruandeses, siempre que se validen las transcripciones con el hablante antes de actuar sobre ellas.
- **Evaluación comparativa de modelos ASR**: al estar construido sobre un modelo base conocido de NVIDIA y evaluado con un normalizador estándar (el de Whisper y el estilo CDLI), resulta útil como referencia en comparativas de ASR para kinyarwanda.
- **Anotación asistida de corpus de habla no estándar**: puede pretranscribir grabaciones del dataset CDLI para acelerar la revisión manual, teniendo en cuenta que las transcripciones literales de tartamudez requieren corrección humana.
- **Docencia y experimentación con NeMo**: al distribuirse en formato `.nemo` y con código de entrenamiento disponible, es adecuado para prácticas de ajuste fino de modelos Conformer CTC en entornos académicos.

## Benchmarks y rendimiento

Resultados publicados en la model card, con decodificación greedy, una grabación cada vez y normalizador de texto básico de Whisper (y variante con el paso de apóstrofos de CDLI):

| Split | WER agrupado (%) | CER (%) | WER por enunciado (%) | CER por enunciado (%) | Bucles |
|---|---|---|---|---|---|
| test (9 hablantes) | 41,3 | 13,0 | 41,9 | 13,9 | 0 |
| dev (6 hablantes) | 44,8 | 19,2 | 44,6 | 20,4 | 0 |
| test, normalizador estilo CDLI | 38,5 | 12,6 | 39,8 | no disponible | 0 |

El autor advierte que, con solo 9 hablantes de test, las diferencias inferiores a unos 3 puntos de WER entre dos modelos no pueden confirmarse.

## Requisitos de hardware

- **VRAM estimada**: no disponible de forma explícita; el repositorio ocupa 0,5 GB, lo que sugiere que la inferencia en fp32 o bf16 cabe holgadamente en GPUs de consumo, aunque no se publican cifras de VRAM.
- **GPU recomendadas**: no disponible; por el tamaño del checkpoint, una GPU de consumo moderna (por ejemplo, RTX 3060 o superior) debería ser suficiente, pero no hay datos oficiales.
- **¿Cabe en GPU de consumo?**: probablemente sí, dado el tamaño del repositorio, aunque no se confirma en la información disponible.
- **Opciones de despliegue**: NVIDIA NeMo (librería declarada). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que además no son adecuados para modelos CTC de ASR.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `oluwagbotty/nemo-ctc-ky-ft-10ep-noise` | no disponible | no disponible | 41,3 % (agrupado) | CC-BY-4.0 | Hugging Face (34 descargas) |
| `nvidia/stt_rw_conformer_ctc_large` (modelo base) | no disponible | no disponible | no disponible en esta ficha | no disponible en esta ficha | Hugging Face (NVIDIA) |
| Whisper (referencia de normalizador) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de resultados de benchmarks de los modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa directa no es posible.

## Limitaciones y advertencias

- **Pocos hablantes y condiciones estrechas**: solo 9 hablantes en test, mayoritariamente hombres adultos jóvenes, grabaciones en interior con poco ruido, habla leída y descrita a partir de imágenes, no conversacional. El rendimiento en niños, otras discapacidades, entornos ruidosos, audio telefónico o habla con cambio de código es desconocido.
- **Objetivos literales**: las repeticiones por tartamudez se escriben en las transcripciones, y el modelo puede reproducirlas o no; los bloqueos y prolongaciones no son visibles en el texto.
- **Las frases leídas son más fáciles**: las frases leídas también aparecen en las transcripciones de train, por lo que los resultados con descripciones a partir de imágenes son la mejor guía para habla abierta.
- **No apto para decisiones sobre personas**: no debe usarse para diagnosticar o evaluar ninguna condición del habla, identificar hablantes ni en decisiones clínicas, legales o policiales. Los términos de CDLI prohíben reidentificar hablantes y crear voces que imiten a una persona.
- **Riesgo de cambio de significado**: una transcripción errónea puede alterar lo que dijo la persona; debe mostrarse el texto al hablante antes de actuar sobre él.
- **Licencia**: CC-BY-4.0 permite uso comercial con atribución, pero los términos del dataset CDLI imponen restricciones adicionales sobre reidentificación y clonación de voz.
- **Idioma único**: solo kinyarwanda; no se declara soporte para otros idiomas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oluwagbotty/nemo-ctc-ky-ft-10ep-noise
- Modelo base: https://huggingface.co/nvidia/stt_rw_conformer_ctc_large
- Dataset CDLI: https://huggingface.co/datasets/cdli/rwandan_kinyarwanda_nonstandard_speech_v1.0
- Centre for Digital Language Inclusion (CDLI), UCL: no disponible
- Paper, blog o demo del proyecto: no disponible
