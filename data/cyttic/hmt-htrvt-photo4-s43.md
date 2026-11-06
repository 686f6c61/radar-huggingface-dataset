# cyttic/hmt-htrvt-photo4-s43

## Resumen

`cyttic/hmt-htrvt-photo4-s43` es un modelo de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) entrenado con arquitectura de tipo transformer y decodificacion CTC. Lo desarrolla el grupo cyttic y forma parte de un estudio de aumento de datos (*augmentation study*) denominado `htr-metrics-transfer`, cuyo objetivo es medir como distintas estrategias de aumento afectan a las metricas de transferencia en HTR. En concreto, este checkpoint corresponde a la variante de modelo `htrvt` con el aumento `photo4` y la semilla 43.

El modelo resuelve la transcripcion de imagenes de texto manuscrito a secuencia de caracteres, trabajando exclusivamente en hebreo (`he`). Con 13.821.574 parametros y un repositorio de 0,1 GB, es un modelo compacto pensado para experimentacion y evaluacion comparativa, no para despliegue generalista. Su interes actual reside en que documenta de forma reproducible una ablacion concreta (aumento fotometrico, semilla fija) sobre un split de entrenamiento y test bien definidos, lo que facilita la comparacion entre variantes del mismo estudio.

La relevancia es acotada pero util: sirve como referencia reproducible para investigadores que trabajan en HTR de hebreo y quieren aislar el efecto del aumento `photo4` frente a otras configuraciones del mismo pipeline. No es un modelo de proposito general ni cubre otras tareas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con decodificacion CTC (segun tags `htr` y `ctc`) |
| Parametros totales | 13.821.574 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue un esquema de reconocimiento de texto manuscrito con backbone transformer y cabeza CTC para alineamiento secuencia-a-secuencia sin necesidad de decodificacion autorregresiva. La decodificacion empleada en la evaluacion es *greedy* y sin modelo de lenguaje externo, lo que simplifica el pipeline y hace que las metricas reflejen directamente la calidad acustica-visual del modelo.

El entrenamiento se realizo sobre el split de entrenamiento de `cyttic/hhd-optionb-split`, excluyendo los escritores asignados al conjunto de desarrollo. La evaluacion se hizo sobre el test HHD Option-B. La variante corresponde al aumento `photo4` con semilla 43 dentro del estudio `htr-metrics-transfer`. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO (no aplicables en HTR, por otra parte).

## Capacidades

- Reconocimiento de texto manuscrito en hebreo a partir de imagenes.
- Transcripcion a nivel de caracter con decodificacion CTC greedy.
- Evaluacion con metricas CER (Character Error Rate) y WER (Word Error Rate).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No es multilingue: solo hebreo.
- No dispone de modo *thinking*, vision general, audio ni otras capacidades especiales mas alla del HTR.

## Casos de uso

- Investigacion comparativa en HTR: usar este checkpoint como referencia de la configuracion `photo4`/semilla 43 para medir el efecto del aumento frente a otras variantes del estudio `htr-metrics-transfer`.
- Reproduccion de resultados: permite replicar las metricas CER 0,0717 y WER 0,3078 sobre el test HHD Option-B con decodificacion greedy y sin LM.
- Digitalizacion de manuscritos en hebreo: transcripcion de documentos historicos o administrativos en hebreo cuando el dominio coincida con el del dataset de entrenamiento.
- Linea base para fine-tuning: al ser un modelo pequeno (13,8 M de parametros) y con licencia MIT, sirve como punto de partida para ajustar a otros corpus de hebreo manuscrito.
- Evaluacion de pipelines de preprocesado: al estar ligado a un aumento concreto (`photo4`), permite analizar como el preprocesado fotometrico afecta al CER/WER final.
- Docencia y experimentacion: modelo ligero y reproducible para practicas de HTR con CTC en entornos con recursos limitados.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre el test HHD Option-B, decodificacion greedy, sin modelo de lenguaje:

| Metrica | Valor |
|---|---|
| CER | 0,0717 |
| WER | 0,3078 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) ni cifras de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja por el tamano del modelo (13,8 M de parametros); cabe holgadamente en cualquier GPU consumer, incluso en CPU.
- GPU recomendadas: no se especifican; cualquier GPU con al menos unos pocos GB de VRAM es suficiente. Una RTX 4090 o A100 estarian sobredimensionadas para este modelo.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna (GTX 1060 en adelante) e incluso en CPU.
- Opciones de despliegue: no se documentan en la informacion disponible; al usar safetensors y CTC, seria desplegable con PyTorch/Transformers o frameworks de HTR compatibles, aunque no se confirma soporte explicito de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de otros modelos comparables del mismo estudio (`htr-metrics-transfer`) ni de alternativas publicas de HTR en hebreo con metricas equiparables. Por tanto:

| Modelo | Parametros | Contexto | CER | WER | Licencia |
|---|---|---|---|---|---|
| cyttic/hmt-htrvt-photo4-s43 | 13,8 M | no disponible | 0,0717 | 0,3078 | MIT |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo especializado exclusivamente en HTR en hebreo; no generaliza a otras tareas ni idiomas.
- El WER (0,3078) es notablemente alto en terminos absolutos, lo que sugiere que la transcripcion a nivel de palabra puede requerir postprocesado o un modelo de lenguaje para uso en produccion.
- Riesgo de sesgo hacia el dominio, estilo de escritura y escritores presentes en `cyttic/hhd-optionb-split`; el rendimiento fuera de ese dominio no esta caracterizado.
- Riesgo de alucinacion en el sentido de sustituciones o inserciones erroneas de caracteres/palabras, inherente a la decodificacion CTC greedy sin LM.
- No se documentan limitaciones de longitud de contexto ni de resolucion de imagen.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene verificar la procedencia y licencia del dataset de entrenamiento antes de un uso comercial.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validacion externa.

## Enlaces

- Hugging Face: https://huggingface.co/cyttic/hmt-htrvt-photo4-s43
- Dataset de entrenamiento referenciado: `cyttic/hhd-optionb-split` (no se proporciona URL directa en la informacion disponible)
- Detalles adicionales: `results.json` dentro del repositorio (no se proporciona URL directa)
- Paper, blog, repositorio de codigo o demo: no disponibles en la informacion proporcionada.
