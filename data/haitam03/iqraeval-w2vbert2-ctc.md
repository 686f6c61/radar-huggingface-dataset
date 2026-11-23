# Haitam03/iqraeval-w2vbert2-ctc

## Resumen

`iqraeval-w2vbert2-ctc` es un modelo de reconocimiento automático de habla (ASR) especializado en la transcripción fonémica del árabe leído para detección de errores de pronunciación. Lo desarrolla Haitam03 como contribución al reto Iqra'Eval 2025 y se construye mediante fine-tuning de `facebook/w2v-bert-2.0` (606 millones de parámetros), un modelo preentrenado de representación auto-supervisada de audio. El modelo no transcribe texto ortográfico, sino secuencias de 68 fonemas del inventario IqraEval: la comparación de esa secuencia con la referencia fonémica del texto leído permite identificar sustituciones, omisiones e inserciones.

La relevancia del modelo radica en su enfoque de limpieza de datos: el autor detectó que aproximadamente el 19 % de los errores inyectados artificialmente en el corpus TTS `Iqra_TTS` no eran audibles (la etiqueta indicaba error pero la voz sintética pronunciaba el fonema correcto). Entrenando solo con habla nativa más los clips TTS etiquetados como correctos, el modelo alcanza un F1 de 0,460 en el conjunto de test oficial, superando el baseline de 2025 (0,441) y sus propias variantes anteriores.

Se trata de un modelo pequeño (606 M de parámetros, 2,4 GB en safetensors), entrenado en 2× NVIDIA T4 en unas 10 horas, con licencia MIT y una única salida CTC sobre fonemas. Su ámbito es deliberadamente estrecho: árabe estándar leído, evaluación de pronunciación a nivel fonémico, sin evaluación de reglas de tajwid.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2-BERT (transformer convolucional + atención, encoder auto-supervisado) con cabeza CTC de 69 clases |
| Parametros totales | 605.749.125 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (clips de entrenamiento de hasta 15 s; sin ventana declarada) |
| Tipos de cuantizacion | no disponible (pesos en safetensors fp32/fp16; no se documentan GGUF ni otras) |
| Idiomas soportados | árabe (`ar`), registro de árabe estándar moderno leído |
| Licencia | MIT |
| Formato de pesos | safetensors (repositorio de 2,4 GB) |

## Arquitectura y entrenamiento

El modelo parte de `facebook/w2v-bert-2.0`, un encoder de 606 M de parámetros que combina extractor convolucional de características con un transformer de atención. Sobre esa base se añade un adaptador y una nueva cabeza CTC de 69 vías (68 fonemas del inventario IqraEval más el token blank en el id 68). La salida es una secuencia de fonemas en romanización tipo Buckwalter, con consonantes, geminadas duplicadas (`bb`, `ll`), vocales cortas y largas (`a u i`, `aa uu ii`) y variantes enfáticas (`A U I AA UU II`).

El entrenamiento usa CTC sobre secuencia de fonemas con AdamW (lr 5e-5, cabeza 5e-4, weight decay 0,01), 500 pasos de warm-up y decaimiento coseno sobre 12 000 pasos. El lote es de 32 utterances por paso (4 por GPU × 2 GPUs × 4 pasos de acumulación), con clips de hasta 15 s. Como regularización se congelan las primeras 6 capas del transformer, se aplica SpecAugment con enmascaramiento temporal (p = 0,05), perturbación de velocidad (0,9–1,1×) y ruido añadido con SNR de 10–30 dB. El cómputo total fue de unas 10 horas en 2× NVIDIA T4 en fp16.

La innovación principal no es arquitectónica sino de datos: el corpus `Iqra_TTS` contiene habla sintética con errores de pronunciación inyectados deliberadamente, y un modelo juez entrenado reveló que cerca del 19 % de esos errores no eran audibles (etiqueta errónea). El modelo final se entrena con habla nativa de `Iqra_train` (~79 h de árabe estándar leído) más únicamente los clips TTS etiquetados como `original` (lectura correcta), eliminando las etiquetas falsas. El checkpoint final es el paso 10 000, seleccionado por la curva de desarrollo; checkpoints cercanos puntúan con ±0,005 F1 en test.

## Capacidades

- Reconocimiento fonémico de habla árabe leída: transcribe audio de 16 kHz mono a una secuencia de 68 fonemas del inventario IqraEval.
- Detección de errores de pronunciación por comparación con la referencia fonémica: cada sustitución, omisión o inserción respecto a la referencia cuenta como error detectado.
- Alineación con el pipeline oficial de scoring de IqraEval (`score_testset.py` del repositorio del proyecto).
- Integración con el fonetizador MSA oficial para generar referencias a partir de texto completamente diacritizado.
- Inferencia CTC greedy estándar con `transformers` (`Wav2Vec2BertForCTC` + `AutoFeatureExtractor`).
- No soporta tool calling, function calling, agentes, visión, audio multimodal ni modo de razonamiento extendido.
- Capacidad multilingüe limitada al árabe; no se documenta transferencia a otros idiomas.
- No evalúa reglas de tajwid (madd, ghunna, idgham, etc.), solo correspondencia fonémica con la fonetización MSA de referencia.

## Casos de uso

- Evaluación de recitación coránica a nivel fonémico: el modelo transcribe la recitación a fonemas y el sistema compara con la referencia fonémica del versículo para señalar sustituciones concretas; es el escenario para el que se entrenó y el que evalúa el benchmark oficial.
- Herramientas de aprendizaje de árabe estándar para hablantes no nativos: integrado en una aplicación de práctica de lectura, permite dar retroalimentación por fonema en lugar de solo por palabra, usando el fonetizador MSA para generar la referencia del texto diacritizado.
- Investigación en detección automática de errores de pronunciación (MDD): sirve como línea base reproducible con licencia MIT y checkpoint público para comparar técnicas de limpieza de datos o arquitecturas sobre el corpus IqraEval.
- Preprocesado fonémico para pipelines de síntesis o corrección: la secuencia de fonemas predicha puede alimentar un módulo de alineación forzada o de puntuación de similitud fonética en sistemas de evaluación de lectura.
- Docencia de árabe en entornos educativos: despliegue en servidor modesto (el modelo cabe en GPU de consumo) para puntuar grabaciones de alumnos en lotes nocturnos sin depender de APIs externas.
- Auditoría de calidad de corpus TTS: el modelo, usado como juez, permitió detectar que un 19 % de los errores inyectados en `Iqra_TTS` no eran audibles; puede reutilizarse para validar etiquetas de otros corpus sintéticos de habla árabe.
- Filtrado de datos en la construcción de datasets de habla árabe: transcripción fonémica masiva para descartar clips cuya lectura se desvía de la referencia esperada antes de incluirlos en un corpus de entrenamiento.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (model-index), no verificados de forma independiente. Conjunto de test Iqra'Eval 2025 (`QuranMB.v2`: 98 versículos coránicos × 18 hablantes, anotación humana), scoring oficial; el leaderboard ordena por F1.

| Modelo | F1 | Precision | Recall | PER |
|---|---|---|---|---|
| **iqraeval-w2vbert2-ctc (este modelo)** | **0,460** | **0,336** | 0,729 | **0,140** |
| Reconocedor CTC árabe xlsr-53 del autor (mismos datos, todos los clips TTS) | 0,43 | 0,29 | 0,80 | 0,17 |
| Primer modelo del autor, v1 (`Wav2Vec2-mispronunciation-detector`) | 0,419 | 0,300 | 0,693 | 0,203 |
| Baseline oficial de 2025 | 0,441 | 0,309 | 0,771 | no disponible |

El checkpoint final (paso 10 000) se eligió por la curva de desarrollo; checkpoints cercanos puntúan con ±0,005 F1 en test. El modelo se entrenó solo con datos publicados para el reto de 2025.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,4–3 GB en fp16 para cargar los 606 M de parámetros; en fp32, unos 4,8–5 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; el autor entrenó en 2× NVIDIA T4, por lo que una T4, una RTX 3060 (12 GB) o superiores son suficientes. A100/H100 no son necesarias pero aceleran el throughput en lote.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4090 y equivalentes; también en CPU para inferencia puntual, con mayor latencia.
- Opciones de despliegue: `transformers` (referencia oficial en la model card), vLLM no aplica de forma nativa a CTC ASR, TGI no documentado, llama.cpp/Ollama no aplican al no haber pesos GGUF publicados. Para servicio en producción conviene envolver `Wav2Vec2BertForCTC` en un servidor propio con batching.
- Latencia y throughput estimados: no disponibles en la información proporcionada. El entrenamiento usó clips de hasta 15 s y lote de 4 por GPU en T4; no se publican cifras de RTF ni de utterances por segundo en inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Rendimiento (F1 en QuranMB.v2) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **iqraeval-w2vbert2-ctc** | 606 M | clips hasta 15 s en entrenamiento | 0,460 | MIT | Hugging Face |
| Reconocedor CTC xlsr-53 del autor | no disponible | no disponible | 0,43 | no disponible | no disponible |
| `Haitam03/Wav2Vec2-mispronunciation-detector` (v1) | no disponible | no disponible | 0,419 | no disponible | Hugging Face |
| Baseline oficial Iqra'Eval 2025 | no disponible | no disponible | 0,441 | no disponible | no disponible |

No se dispone de comparación con modelos externos al proyecto (por ejemplo, sistemas comerciales de evaluación de pronunciación o ASR árabe genérico) en la información proporcionada.

## Limitaciones y advertencias

- Las falsas alarmas son la debilidad principal: con precision 0,336, aproximadamente dos de cada tres fonemas marcados como error fueron en realidad leídos correctamente. Muchas corresponden a variaciones legítimas del hablante respecto a la referencia basada en texto (por ejemplo, acortamiento vocálico en habla conectada) que no constituyen error anotado.
- No es un evaluador de tajwid: se entrenó con lectura de estilo árabe estándar y evalúa contra la fonetización MSA de IqraEval, por lo que fenómenos como la longitud de madd, ghunna o idgham no se evalúan.
- El entrenamiento no incluye ejemplos de error, por lo que con entrenamientos más largos el modelo deriva hacia la pronunciación canónica; el autor selecciona el checkpoint por esta razón.
- Riesgo de alucinación en el sentido de errores de transcripción fonémica: el PER de 0,140 implica que una parte de la secuencia predicha no coincide con la referencia incluso en lecturas correctas.
- Dominio restringido: árabe estándar leído, con audio a 16 kHz mono; no se documenta comportamiento con dialectos, habla espontánea, ruido de fondo intenso ni otros idiomas.
- No se publican pesos cuantizados (GGUF, AWQ, GPTQ) ni métricas de latencia en producción; el despliegue en CPU requiere validación propia.
- La licencia MIT permite uso comercial, pero los resultados del benchmark no han sido verificados de forma independiente (`verified: false` en el model-index) y el conjunto de evaluación tiene anotación humana del reto, con posibles sesgos de los anotadores.
- El modelo depende del fonetizador MSA oficial y de texto completamente diacritizado para generar referencias; sin esa pieza el pipeline de detección no es operativo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Haitam03/iqraeval-w2vbert2-ctc
- Modelo base: https://huggingface.co/facebook/w2v-bert-2.0
- Modelo v1 del autor: https://huggingface.co/Haitam03/Wav2Vec2-mispronunciation-detector
- Organización IqraEval en Hugging Face: https://huggingface.co/IqraEval
- Dataset de entrenamiento: https://huggingface.co/datasets/IqraEval/Iqra_train
- Dataset TTS: https://huggingface.co/datasets/IqraEval/Iqra_TTS
- Repositorio oficial de scoring IqraEval: https://github.com/Iqra-Eval/interspeech_IqraEval
- Fonetizador MSA oficial: https://github.com/Iqra-Eval/MSA_phonetiser
- Repositorio del proyecto del autor: https://github.com/hBouanane/wav2vec2-mispronunciation-detector
