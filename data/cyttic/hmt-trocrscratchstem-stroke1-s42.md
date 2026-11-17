# cyttic/hmt-trocrscratchstem-stroke1-s42

## Resumen

`cyttic/hmt-trocrscratchstem-stroke1-s42` es un modelo de reconocimiento de texto manuscrito (HTR, Handwritten Text Recognition) desarrollado por el grupo cyttic, orientado especificamente a escritura manuscrita en hebreo. Se trata de un checkpoint experimental dentro de un estudio de aumentacion de datos denominado `htr-metrics-transfer`, en el que se evalua como distintas tecnicas de augmentacion afectan a las metricas de transcripcion. El modelo concreto corresponde a la variante `trocrscratchstem` con la aumentacion `stroke1` y la semilla 42.

Arquitectonicamente parte de la familia TrOCR (Transformer-based Optical Character Recognition), es decir, un encoder visual emparejado con un decoder de texto transformer, aunque en este caso el entrenamiento se ha realizado desde cero ("scratch") y con un stem adaptado, y la decodificacion empleada en la evaluacion es CTC greedy sin modelo de lenguaje. El checkpoint contiene 24.928.588 parametros (aproximadamente 25 millones), lo que lo situa en la gama ligera y permite inferencia en hardware modesto.

Su relevancia es acotada pero clara: aporta un punto de referencia reproducible para HTR en hebreo con licencia MIT y pesos en safetensors, util para investigadores que trabajen en transferencia de metricas entre aumentaciones y para quien necesite una linea base de OCR manuscrito hebreo sin dependencia de modelos de lenguaje externos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TrOCR (encoder visual + decoder transformer) entrenado desde cero con stem adaptado; decodificacion CTC |
| Parametros totales | 24.928.588 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion no documentada) |
| Idiomas soportados | hebreo (he) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue el esquema TrOCR: un backbone de vision procesa la imagen de la linea o region de texto manuscrito y un decoder transformer genera la secuencia de caracteres. En esta variante el entrenamiento se realiza desde cero (`trocrscratchstem`), sin partir de pesos preentrenados de OCR, e incorpora un stem adaptado. La cabeza de salida y el procedimiento de decodificacion corresponden a CTC en modo greedy, sin modelo de lenguaje auxiliar, lo que simplifica el pipeline pero limita el uso de correccion linguistica en la salida.

El entrenamiento utiliza el split `cyttic/hhd-optionb-split`, concretamente la particion de train excluyendo los escritores de dev, y se evalua sobre el test HHD Option-B. La aumentacion aplicada en este checkpoint es `stroke1`, una de las variantes del estudio `htr-metrics-transfer`, con semilla 42 para garantizar reproducibilidad. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO (poco probables en una tarea HTR).

## Capacidades

- Reconocimiento de texto manuscrito en hebreo a partir de imagenes.
- Transcripcion a nivel de linea o region mediante decodificacion CTC greedy.
- Generacion de secuencias de caracteres sin modelo de lenguaje externo (salida cruda del decoder).
- Entrenamiento y evaluacion reproducibles gracias a semilla fija (42) y configuracion documentada en `results.json`.
- No soporta tool calling ni function calling.
- No esta disenado para razonamiento multi-paso ni para uso como agente.
- No dispone de modo thinking, vision general, audio ni capacidades multimodales mas alla de la entrada de imagen para OCR.
- Cobertura multilingue limitada al hebreo.

## Casos de uso

- Digitalizacion de archivos manuscritos en hebreo: el modelo transcribe lineas de documentos escaneados y permite construir corpus textuales buscables a partir de colecciones fisicas, con la ventaja de un checkpoint ligero de 25 M de parametros.
- Linea base en investigacion de HTR: sirve como referencia reproducible (semilla 42, aumentacion `stroke1`) para comparar el efecto de otras aumentaciones o arquitecturas en la misma tarea.
- Evaluacion de transferencia de metricas: al formar parte del estudio `htr-metrics-transfer`, permite analizar como varian CER y WER entre configuraciones de entrenamiento sobre el mismo test HHD Option-B.
- Prototipado rapido en entornos con recursos limitados: su tamano permite desplegarlo en CPU o GPU de gama baja para validar pipelines de preprocesado de imagen antes de escalar a modelos mayores.
- Extraccion de texto para indexacion y busqueda: integrado en un pipeline de OCR por lineas, alimenta motores de busqueda o sistemas de gestion documental sobre fondos hebreos.
- Investigacion sobre decodificacion sin LM: util para estudiar el impacto de prescindir de un modelo de lenguaje en la correccion de errores, comparando CER/WER frente a variantes con LM.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre el test HHD Option-B, decodificacion greedy sin modelo de lenguaje:

| Metrica | Valor |
|---|---|
| CER | 0,0790 |
| WER | 0,3541 |

No se han publicado resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 dado el tamano del checkpoint (aproximadamente 25 M de parametros, repo de 0,1 GB); en fp16 o int8 el consumo se reduce aun mas.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; tarjetas como RTX 3060, RTX 4090, A100 o H100 son mas que suficientes y quedaran limitadas por el preprocesado de imagen antes que por el modelo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer e incluso en CPU para volumenes moderados.
- Opciones de despliegue: al ser un checkpoint de tipo TrOCR con pesos safetensors, es compatible con frameworks de inferencia estandar de transformers; no se documentan integraciones especificas con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cyttic/hmt-trocrscratchstem-stroke1-s42 | 24,9 M | no disponible | HTR hebreo, CTC sin LM | MIT | Hugging Face |
| TrOCR base (Microsoft) | no disponible en la informacion proporcionada | no disponible | OCR impreso/manuscrito generico | no disponible | Hugging Face |
| Otros checkpoints del estudio htr-metrics-transfer | no disponible | no disponible | HTR hebreo con distintas aumentaciones | MIT (segun el autor) | Hugging Face |

No se dispone de datos comparativos de rendimiento entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Especializado exclusivamente en hebreo manuscrito; no debe esperarse un rendimiento correcto en otros idiomas o en texto impreso sin reentrenamiento.
- El WER de 0,3541 es elevado en terminos absolutos, lo que indica una tasa de errores a nivel de palabra considerable para produccion sin postprocesado.
- Al decodificar con CTC greedy y sin modelo de lenguaje, no hay correccion linguistica de la salida; los errores ortograficos y de segmentacion se propagan directamente.
- Modelo experimental de un estudio de aumentacion; no se documentan sesgos especificos, pero la calidad dependera de la distribucion de escritores del dataset HHD, lo que puede introducir sesgos hacia estilos de escritura concretos.
- Riesgo de alucinacion en el sentido de inserciones o sustituciones de caracteres no presentes en la imagen, inherente a los sistemas HTR.
- No se documentan limitaciones de longitud de contexto ni de resolucion de imagen en la informacion disponible.
- La licencia MIT permite uso comercial, pero no se ofrecen garantias de calidad ni soporte por parte del autor.
- Al ser un checkpoint con 0 descargas y 0 likes en el momento de la consulta, carece de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyttic/hmt-trocrscratchstem-stroke1-s42
- Dataset de entrenamiento/evaluacion: https://huggingface.co/datasets/cyttic/hhd-optionb-split
- Resultados detallados: `results.json` en el repositorio del modelo
- Paper, blog o repositorio adicional: no disponible
