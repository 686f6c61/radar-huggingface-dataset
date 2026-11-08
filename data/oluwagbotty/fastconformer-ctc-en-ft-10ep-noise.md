# oluwagbotty/fastconformer-ctc-en-ft-10ep-noise

## Resumen

`fastconformer-ctc-en-ft-10ep-noise` es un modelo de reconocimiento automatico del habla (ASR) en ingles desarrollado por el usuario oluwagbotty, resultado de un ajuste fino del modelo `nvidia/stt_en_fastconformer_ctc_large` sobre el split de entrenamiento del dataset CDLI Rwandan English non-standard speech v1.0. El objetivo es transcribir habla no estandar, concretamente la de personas jovenes adultas que tartamudean, en el marco del Rwanda Innovation Sprint impulsado por CDLI (Centre for Digital Language Inclusion, UCL). El modelo se publica como parte de un proyecto de investigacion sobre reconocimiento de voz de bajo coste para personas con disfluencias.

Arquitectonicamente hereda la base de NVIDIA: un encoder FastConformer (variante de Conformer con atencion por bloques y submuestreo de audio) con cabecera CTC, en su version "large" de aproximadamente 115 millones de parametros. El ajuste fino se realizo durante hasta 10 epocas con parada temprana sobre el WER de validacion, usando precision bf16-mixed y un learning rate de 1e-4.

Su relevancia radica en que aborda un nicho poco cubierto por los modelos ASR comerciales: el habla con tartamudeo y disfluencias en contextos de bajos recursos. Los resultados publicados (26,5 % de WER agrupado en test, 17,2 % de CER) son un punto de partida medible para esta tarea, aunque el propio autor advierte de que la muestra de evaluacion es muy reducida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer CTC (encoder Conformer con atencion por bloques, cabecera CTC) |
| Parametros totales | Aproximadamente 115 M (heredados de `nvidia/stt_en_fastconformer_ctc_large`) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR; procesa audio por segmentos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles, con foco en ingles ruandes no estandar) |
| Licencia | cc-by-4.0 |
| Formato de pesos | `.nemo` (formato nativo de NVIDIA NeMo) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura FastConformer CTC de NVIDIA, un encoder basado en Conformer que combina capas de atencion multi-cabeza con convoluciones, aplicando atencion por bloques para reducir el coste computacional en secuencias de audio largas. La cabecera CTC (Connectionist Temporal Classification) permite transcribir sin necesidad de un decodificador autoregresivo, lo que evita el modo de fallo de bucles repetitivos que afecta a modelos como Whisper (el autor reporta 0 bucles en test y dev). No se dispone de datos sobre el numero de tokens de audio empleados en el preentrenamiento original.

El ajuste fino se realizo exclusivamente sobre el split de entrenamiento del dataset `cdli/rwandan_english_nonstandard_speech_v1.0`, con el split de desarrollo empleado para seleccionar el checkpoint y el de test puntuado una sola vez tras el entrenamiento. Se usaron hasta 10 epocas con parada temprana sobre el WER de dev (paciencia de 3 evaluaciones), semilla 42, learning rate 1e-4 y precision bf16-mixed. El split `extra` no se utilizo y ningun hablante aparece en mas de un split. Las grabaciones se hicieron en Ruanda en 2026, en interiores con bajo ruido, mediante una app de tablet, a partir de descripciones libres de imagenes y lectura de frases. No se menciona uso de RLHF ni DPO.

## Capacidades

- Transcripcion de voz a texto en ingles (ASR) con salida en alfabeto ingles en minusculas.
- Reconocimiento de habla no estandar, especificamente habla con tartamudeo (repeticiones, bloqueos y prolongaciones), aunque los bloqueos y prolongaciones no son visibles en el texto.
- Decodificacion greedy sin bucles repetitivos, gracias a la naturaleza no autoregresiva de CTC.
- Manejo de dos tipos de entrada: descripciones libres a partir de imagenes y lectura de frases.
- No soporta tool calling ni function calling (es un modelo ASR puro).
- No soporta agentes ni razonamiento multi-paso.
- Capacidad multilingue limitada al ingles; no se ha evaluado en habla con cambio de codigo (code-switching).
- No dispone de modo "thinking", vision ni audio generativo; solo consume audio y produce texto.

## Casos de uso

- Transcripcion asistida para personas que tartamudean: el modelo puede convertir grabaciones de voz con disfluencias en texto legible, sirviendo como base para herramientas de accesibilidad que muestren la transcripcion al hablante antes de actuar sobre ella.
- Investigacion en ASR inclusivo: permite medir el rendimiento de arquitecturas CTC frente a modelos autoregresivos (como Whisper) en habla no estandar, con metricas de WER y CER comparables.
- Prototipado de aplicaciones de dictado en ingles ruandes: util para validar pipelines de ASR en contextos de bajos recursos donde los modelos comerciales no cubren la variante local.
- Generacion de subtitulos en entornos controlados: en grabaciones de interior con bajo ruido y hablantes adultos, puede producir subtitulos en ingles con un CER del 17,2 % en test.
- Evaluacion de datasets de habla no estandar: el modelo sirve como linea base para comparar futuros ajustes finos sobre el mismo corpus CDLI.
- Docencia y demostraciones de NeMo: al estar en formato `.nemo`, se integra directamente en el ecosistema NVIDIA NeMo para tutoriales y experimentos de ajuste fino.

## Benchmarks y rendimiento

Resultados publicados por el autor (decodificacion greedy, una grabacion cada vez, normalizador de texto basico de Whisper):

| Split | WER agrupado (%) | CER (%) | WER por enunciado (%) | CER por enunciado (%) | Bucles |
|---|---|---|---|---|---|
| test (9 hablantes) | 26,5 | 17,2 | 28,9 | 18,8 | 0 |
| dev (6 hablantes) | 33,6 | 23,5 | 32,4 | 22,3 | 0 |

El autor advierte de que, con solo 9 hablantes en test, las diferencias inferiores a unos 3 puntos de WER entre dos modelos no pueden confirmarse. No se han publicado comparaciones directas con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con aproximadamente 115 M de parametros, el modelo es muy ligero y cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 4-8 GB de VRAM deberia ser suficiente; una RTX 3060, RTX 4060 o superior es mas que adecuada.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU moderna de consumo.
- Opciones de despliegue: NVIDIA NeMo (formato `.nemo` nativo); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no estan orientados a modelos ASR de este tipo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (test) | Licencia | Formato |
|---|---|---|---|---|---|
| `oluwagbotty/fastconformer-ctc-en-ft-10ep-noise` | ~115 M | no disponible | 26,5 % (agrupado) | cc-by-4.0 | `.nemo` |
| `nvidia/stt_en_fastconformer_ctc_large` | ~115 M | no disponible | no disponible | no disponible | `.nemo` |
| `nvidia/stt_en_fastconformer_ctc_xxlarge` | ~1 B | no disponible | no disponible | no disponible | `.nemo` |

No se dispone de resultados de WER comparables para los modelos base de NVIDIA en el mismo conjunto de test, por lo que no es posible cuantificar la mejora del ajuste fino frente a ellos con los datos proporcionados.

## Limitaciones y advertencias

- Pocos hablantes y condiciones estrechas: solo 9 hablantes en test, mayoritariamente hombres jovenes adultos, grabaciones en interiores silenciosos y habla leida o descrita, no conversacional. El rendimiento en ninos, otras discapacidades, entornos ruidosos, audio telefonico o habla con cambio de codigo es desconocido.
- Objetivos verbatim: las repeticiones del tartamudeo se escriben en las transcripciones, y los modelos entrenados con ellas pueden o no reproducirlas; los bloqueos y prolongaciones no son visibles en el texto.
- Sesgo hacia frases leidas: las frases de los prompts de texto tambien aparecen en las transcripciones de entrenamiento, por lo que los resultados con prompts de imagen son la mejor guia para habla abierta.
- No apto para decisiones sobre personas: no debe usarse para diagnosticar o evaluar ninguna condicion del habla, identificar hablantes ni en decisiones clinicas, legales o de aplicacion de la ley. Los terminos de CDLI prohiben reidentificar hablantes y construir voces que imiten a una persona.
- Riesgo de alucinacion y errores de transcripcion: una transcripcion erronea puede cambiar el significado de lo que dijo una persona; se recomienda mostrar el texto al hablante antes de actuar sobre el.
- Licencia cc-by-4.0: permite uso comercial con atribucion, pero los terminos del dataset CDLI imponen restricciones adicionales sobre reidentificacion y sintesis de voz.
- Acceso al dataset restringido: el dataset CDLI esta protegido (gated) y no se incluye en el repositorio del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oluwagbotty/fastconformer-ctc-en-ft-10ep-noise
- Modelo base: https://huggingface.co/nvidia/stt_en_fastconformer_ctc_large
- Modelo base XXLarge (referencia): https://huggingface.co/nvidia/stt_en_fastconformer_ctc_xxlarge
- Dataset CDLI Rwandan English non-standard speech: https://huggingface.co/datasets/cdli/rwandan_english_nonstandard_speech_v1.0
- Documentacion de NVIDIA NeMo: https://docs.nvidia.com/nemo/
