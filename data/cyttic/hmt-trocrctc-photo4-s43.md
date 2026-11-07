# cyttic/hmt-trocrctc-photo4-s43

## Resumen

`cyttic/hmt-trocrctc-photo4-s43` es un modelo de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) desarrollado por el grupo cyttic. Se trata de una variante experimental del modelo TrOCR con cabecera CTC, entrenada para evaluar el efecto de una estrategia de aumento de datos concreta (`photo4`) sobre el rendimiento en transcripcion de manuscritos en hebreo. Forma parte de un estudio sistematico de transferencia de metricas HTR, donde cada modelo se nombra segun el tipo de aumento, el esquema de decodificacion y la semilla utilizada.

El modelo cuenta con 87.279.756 parametros (aproximadamente 87,3 millones) y un tamano de repositorio de 0,3 GB, lo que lo situa en la categoria de modelos ligeros aptos para inferencia en hardware modesto. Esta especializado exclusivamente en hebreo (`language: he`) y su proposito es la transcripcion linea a linea de texto manuscrito, no la generacion de texto libre.

Su relevancia es acotada pero clara: sirve como punto de referencia reproducible dentro de una matriz de experimentos controlados (distintos aumentos, semillas y decodificadores) sobre el conjunto de datos `cyttic/hhd-optionb-split`. Los resultados reportados (CER 0,1225 y WER 0,4886 sobre el test HHD Option-B con decodificacion greedy y sin modelo de lenguaje) permiten comparar directamente el impacto del aumento `photo4` frente a otros enfoques como `none` o `stroke4`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TrOCR con cabecera CTC (encoder-decoder transformer adaptado a CTC) |
| Parametros totales | 87.279.756 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin variantes GGUF publicadas) |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la familia TrOCR, un transformer encoder-decoder originalmente concebido para reconocimiento de texto impreso y manuscrito. En esta variante, la decodificacion se realiza mediante una cabecera CTC (*Connectionist Temporal Classification*), lo que permite alinear secuencias de imagenes con transcripciones sin necesidad de un mecanismo autorregresivo de decodificacion paso a paso. El nombre `trocrctc` en el identificador confirma esta configuracion hibrida.

El entrenamiento se realizo sobre el split de entrenamiento de `cyttic/hhd-optionb-split`, excluyendo los escritores reservados para desarrollo, con el aumento de datos `photo4` y semilla 43. No se dispone de informacion sobre el numero total de tokens, la composicion exacta del dataset ni sobre si se aplicaron tecnicas de RLHF o DPO (poco probables en una tarea HTR). La evaluacion se hizo con decodificacion greedy y sin modelo de lenguaje externo, lo que aísla el rendimiento puro del acoustic model visual.

## Capacidades

- Reconocimiento de texto manuscrito en hebreo a nivel de linea de texto.
- Transcripcion con alineacion CTC, adecuada para secuencias de longitud variable.
- Entrenado especificamente con aumento `photo4`, lo que puede mejorar la robustez frente a variaciones fotograficas (iluminacion, ruido, perspectiva) respecto a modelos sin aumento.
- No soporta tool calling ni function calling.
- No esta disenado para razonamiento multi-paso ni para uso como agente.
- Capacidad multilingue limitada exclusivamente al hebreo.
- No dispone de modo thinking, vision general, audio ni otras capacidades multimodales mas alla de la entrada de imagen de texto.

## Casos de uso

- Digitalizacion de archivos manuscritos en hebreo: el modelo puede transcribir lineas de documentos historicos o administrativos escaneados, integrandose en un pipeline de segmentacion de lineas previo y postprocesado linguistico.
- Investigacion en HTR comparada: sirve como baseline reproducible para estudiar el efecto del aumento `photo4` frente a `none` o `stroke4` con la misma semilla y dataset, facilitando analisis de ablacion.
- Prototipado de OCR para formularios manuscritos: al ser un modelo ligero (87M parametros), permite iteraciones rapidas en entornos con recursos limitados antes de escalar a modelos mayores.
- Evaluacion de robustez fotografica: al estar entrenado con aumento `photo4`, es util para probar la tolerancia a condiciones de captura adversas en documentos fotografados con movil.
- Generacion de transcripciones auxiliares para anotacion humana: las salidas pueden servir como preanotaciones que revisores corrigen, reduciendo el coste de etiquetado en corpus hebreos.
- Despliegue en entornos con GPU de gama media: su tamano reducido permite ejecucion en tarjetas consumer para tareas de transcripcion por lotes en archivística o docencia.

## Benchmarks y rendimiento

Los unicos datos disponibles provienen de la model card y corresponden al test HHD Option-B con decodificacion greedy y sin modelo de lenguaje:

| Metrica | Valor |
|---|---|
| CER (Character Error Rate) | 0,1225 |
| WER (Word Error Rate) | 0,4886 |

No se han publicado resultados comparativos con MMLU, HumanEval, GSM8K ni otros benchmarks estandar, ya que la tarea es HTR y no generacion de texto general. No se dispone de resultados de otros modelos de la misma matriz en la informacion proporcionada para establecer una comparacion numerica directa.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,35 GB solo para pesos, mas activaciones y memoria del tokenizer/imagen; en la practica, menos de 2 GB para lotes pequenos.
- VRAM estimada en fp16: alrededor de 0,18 GB para pesos, con margen adicional para activaciones.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 son mas que suficientes. Tambien puede ejecutarse en CPU para inferencia por lotes de baja frecuencia.
- Cabe holgadamente en GPU consumer (GTX 1650, RTX 3050, etc.).
- Opciones de despliegue: Al ser un modelo safetensors de TrOCR, puede cargarse con `transformers` (clase TrOCRForCausalLM o equivalente con cabecera CTC segun implementacion del autor). No se han publicado pesos GGUF, por lo que llama.cpp u Ollama no estan soportados de forma nativa sin conversion. vLLM y TGI no estan orientados a esta arquitectura CTC.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CER / WER | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cyttic/hmt-trocrctc-photo4-s43 | 87,3M | no disponible | 0,1225 / 0,4886 | MIT | Hugging Face |
| cyttic/hmt-trocrctc-none-s43 | 87,3M | no disponible | no disponible | MIT (presumible) | Hugging Face |
| cyttic/hmt-trocrctc-stroke4-s42 | 87,3M | no disponible | no disponible | MIT (presumible) | Hugging Face |

Los modelos comparables pertenecen a la misma matriz experimental del autor, variando el aumento (`none`, `stroke4`, `photo4`) y la semilla. No se dispone de datos de rendimiento de los otros dos modelos en la informacion proporcionada, por lo que la comparacion cuantitativa no es posible. Fuera de esta familia, no se han identificado alternativas HTR en hebreo con datos publicos en la busqueda realizada.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente en hebreo; no transcribe otros idiomas ni escrituras.
- El WER de 0,4886 es elevado en terminos absolutos, lo que indica que aproximadamente la mitad de las palabras contienen al menos un error; no es adecuado para produccion sin revision humana.
- No se ha evaluado con modelo de lenguaje; el rendimiento en uso real puede variar si se anade postprocesado linguistico.
- Riesgo de alucinacion en el sentido de sustituciones o omisiones de caracteres, especialmente en escritores no vistos durante el entrenamiento.
- Al ser un estudio de aumento con una unica semilla (43), la variabilidad estadistica no esta caracterizada; los resultados pueden no ser robustos a cambios de semilla.
- La licencia MIT permite uso comercial, pero el modelo se distribuye sin garantias y el autor no documenta sesgos especificos.
- No hay pesos cuantizados publicados, lo que limita el despliegue en entornos sin soporte para safetensors o PyTorch.
- El pipeline en Hugging Face no esta declarado (`no disponible`), lo que puede complicar la carga automatica con `pipeline()`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyttic/hmt-trocrctc-photo4-s43
- Modelo relacionado (sin aumento): https://huggingface.co/cyttic/hmt-trocrctc-none-s43
- Modelo relacionado (aumento stroke4): https://huggingface.co/cyttic/hmt-trocrctc-stroke4-s42
