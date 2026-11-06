# cyttic/hmt-trocrscratchreg-none-s42

## Resumen

El modelo `cyttic/hmt-trocrscratchreg-none-s42` es un checkpoint de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) publicado por el usuario cyttic en Hugging Face. Se trata de una variante de TrOCR entrenada desde cero (*scratch*) con regularizacion, dentro de un estudio de aumentacion de datos denominado `htr-metrics-transfer`. El identificador indica que la variante concreta corresponde a la configuracion de aumentacion `none` con semilla 42.

El modelo resuelve la transcripcion de imagenes de texto manuscrito a secuencia de caracteres mediante un cabezal CTC (*Connectionist Temporal Classification*), lo que permite alinear directamente imagenes con transcripciones sin necesidad de segmentacion previa a nivel de caracter. Esta pensado para hebreo (`he`), el unico idioma declarado en la model card, y se distribuye con licencia MIT.

Su relevancia es acotada: no es un modelo de proposito general ni compite con los grandes modelos multimodales actuales, sino un artefacto de investigacion reproducible dentro de un estudio comparativo de tecnicas de aumentacion. Con 22,4 millones de parametros y un repositorio de 0,1 GB, es un modelo pequeno, facil de desplegar y pensado para experimentacion controlada en HTR de hebreo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TrOCR (encoder-decoder transformer para vision, con cabezal CTC) |
| Parametros totales | 22.421.004 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a TrOCR (`trocrscratchreg`), es decir, un transformer encoder-decoder orientado a reconocimiento de texto en imagen. El modelo se entrena desde cero (*scratch*), sin inicializar desde un checkpoint preentrenado de TrOCR, y emplea decodificacion CTC, segun indican los tags `htr` y `ctc` de la model card. El sufijo `reg` sugiere la inclusion de regularizacion durante el entrenamiento, aunque la model card no detalla el tipo ni la intensidad.

Los datos de entrenamiento proceden del split `cyttic/hhd-optionb-split`, concretamente del conjunto de entrenamiento menos los escritores reservados para desarrollo. La evaluacion se realiza sobre el test HHD Option-B con decodificacion greedy y sin modelo de lenguaje. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO (poco probables en un modelo HTR de este tamano). La innovacion metodologica del checkpoint no esta en la arquitectura, sino en formar parte de un estudio factorial de aumentacion de datos con semillas fijas para garantizar reproducibilidad.

## Capacidades

- Reconocimiento de texto manuscrito en hebreo a partir de imagenes, con salida de secuencia de caracteres mediante CTC.
- Transcripcion linea a linea de documentos manuscritos (el formato habitual en corpus HTR como HHD).
- Decodificacion greedy sin modelo de lenguaje externo, lo que simplifica el pipeline de inferencia.
- Entrenamiento desde cero, lo que facilita su uso como linea base en experimentos comparativos de HTR.
- No dispone de soporte documentado de tool calling, function calling, agentes ni razonamiento multi-paso.
- No es un modelo multimodal general: no procesa audio, no mantiene conversacion y no genera texto libre fuera de la tarea de transcripcion.
- Capacidad multilingue limitada al hebreo declarado; no hay evidencia de transferencia a otros alfabetos.

## Casos de uso

- Linea base reproducible en investigacion HTR: sirve como referencia fija (semilla 42, aumentacion `none`) para medir el efecto de tecnicas de aumentacion sobre el CER/WER en hebreo manuscrito.
- Digitalizacion de archivos manuscritos en hebreo: transcripcion automatica de lineas de documentos historicos o administrativos para su indexacion posterior, aceptando la necesidad de revision humana dado el CER de 0,5708.
- Generacion de transcripciones preliminares para anotacion asistida: el modelo produce una hipotesis inicial que un anotador corrige, reduciendo el coste de transcripcion manual en corpus nuevos.
- Experimentos de ablacion de aumentacion: al compartir arquitectura y dataset con otras variantes del estudio `htr-metrics-transfer`, permite aislar el impacto de la aumentacion comparando checkpoints con la misma semilla.
- Evaluacion de pipelines CTC sin LM: util para medir el suelo de rendimiento de un sistema HTR antes de anadir un modelo de lenguaje o un corrector ortografico.
- Docencia y prototipado en HTR: su tamano (22,4 M de parametros, 0,1 GB) permite ejecutarlo en CPU o GPU de gama baja para demostrar el funcionamiento de un pipeline CTC extremo a extremo.

## Benchmarks y rendimiento

Los unicos datos publicados en la model card son las metricas de evaluacion sobre el test HHD Option-B con decodificacion greedy y sin modelo de lenguaje:

| Metrica | Valor |
|---|---|
| CER (Character Error Rate) | 0,5708 |
| WER (Word Error Rate) | 1,1451 |

No se han publicado resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no son benchmarks aplicables a esta tarea. Tampoco se aportan metricas de las variantes hermanas del estudio para contextualizar estos valores.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa (22,4 M de parametros, pesos de aproximadamente 90 MB en fp32), por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU para inferencia por lotes pequenos. Cualquier GPU con al menos 2 GB de VRAM (GTX 1050, RTX 3050, etc.) es suficiente.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas e incluso en sistemas embebidos con suficiente memoria.
- Opciones de despliegue: `transformers` con pesos safetensors; no hay variantes GGUF ni integracion documentada con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cyttic/hmt-trocrscratchreg-none-s42 | 22,4 M | no disponible | HTR hebreo (CTC) | MIT | Hugging Face |
| TrOCR base (Microsoft) | ~334 M | no aplica | HTR multilingue (encoder-decoder) | MIT | Hugging Face |
| Otras variantes del estudio `htr-metrics-transfer` | 22,4 M (misma arquitectura) | no disponible | HTR hebreo (CTC) | MIT | Hugging Face (mismo autor) |

La comparacion con TrOCR base es la mas directa por familia arquitectonica, pero no se dispone de metricas comparables en la informacion proporcionada. No hay datos publicados para comparar rendimiento con alternativas especificas de HTR en hebreo.

## Limitaciones y advertencias

- Rendimiento bajo en terminos absolutos: CER de 0,5708 y WER de 1,1451 sobre el test HHD Option-B indican que mas de la mitad de los caracteres se transcriben incorrectamente; no es apto para produccion sin revision humana o sin un modelo de lenguaje corrector.
- Sesgo de dominio y escritor: entrenado sobre un split concreto (`hhd-optionb-split`) excluyendo los escritores de desarrollo, por lo que la generalizacion a otros estilos de escritura, epocas o soportes no esta garantizada.
- Limitacion idiomatica estricta: solo declara hebreo; no se ha evaluado su comportamiento en otros alfabetos o idiomas.
- Sin modelo de lenguaje en la evaluacion: las metricas publicadas corresponden a decodificacion greedy sin LM, de modo que el rendimiento en un pipeline con correccion podria diferir.
- Licencia MIT: permite uso comercial y modificacion con atribucion, pero el autor no ofrece garantias ni soporte; el modelo se publica como artefacto de investigacion.
- Riesgo de alucinacion en el sentido de sustituciones y omisiones de caracteres, inherente a la decodificacion CTC con modelos de baja capacidad.
- Repositorio practicamente sin traccion (0 descargas, 0 likes) y sin documentacion extendida mas alla de la model card; la informacion sobre hiperparametros, preprocesado y tokenizador es escasa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyttic/hmt-trocrscratchreg-none-s42
- Dataset de entrenamiento referenciado: https://huggingface.co/datasets/cyttic/hhd-optionb-split
- Estudio marco (`htr-metrics-transfer`): no disponible como enlace publico en la informacion proporcionada
- Resultados detallados (`results.json`): no disponible como enlace publico en la informacion proporcionada
- Paper de TrOCR (arquitectura de referencia): no disponible en la informacion proporcionada
