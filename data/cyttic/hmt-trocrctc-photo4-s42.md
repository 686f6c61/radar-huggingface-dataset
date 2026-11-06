# cyttic/hmt-trocrctc-photo4-s42

## Resumen

`cyttic/hmt-trocrctc-photo4-s42` es un modelo de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) desarrollado por el grupo cyttic. Se trata de un modelo derivado de la familia TrOCR combinado con una cabeza CTC, entrenado específicamente para transcribir texto manuscrito en hebreo. Forma parte de un estudio de aumento de datos (*augmentation study*) denominado `htr-metrics-transfer`, en su primera oleada (*wave 1*), con la variante de aumento `photo4` y semilla 42.

El modelo resuelve la tarea de transcripción automática de imágenes de manuscritos a texto, un problema clásico en digitalización de archivos históricos y documentos. Con 87,3 millones de parámetros y un tamaño de repositorio de 0,3 GB, es un modelo compacto orientado a inferencia eficiente mediante decodificación voraz (*greedy decoding*) sin modelo de lenguaje externo.

Su relevancia radica en que documenta de forma reproducible el efecto de una estrategia concreta de aumento de datos sobre las métricas de error (CER y WER) en hebreo manuscrito, un idioma con relativamente pocos recursos en el ecosistema HTR. El modelo se distribuye con licencia MIT y pesos en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TrOCR con cabeza CTC (transformer encoder-decoder adaptado a CTC) |
| Parametros totales | 87.279.756 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | he (hebreo) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura TrOCR (*Transformer-based Optical Character Recognition*), que combina un encoder de visión con un decoder transformer, en este caso con una cabeza de clasificación temporal conexionista (CTC) para la decodificación de secuencias. El identificador `trocrctc` en el nombre del modelo confirma esta combinación de TrOCR con CTC, una variante habitual para tareas HTR donde la alineación entre imagen y texto no es trivial.

El entrenamiento se realizó sobre el conjunto `cyttic/hhd-optionb-split`, excluyendo los escritores de desarrollo (*dev writers*), con el aumento de datos `photo4` y semilla 42. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO, ya que el modelo card no los detalla. La innovación principal del trabajo es metodológica: el estudio `htr-metrics-transfer` evalúa la transferencia de métricas entre configuraciones de aumento de datos, y este checkpoint corresponde a una de las celdas de ese experimento.

## Capacidades

- Reconocimiento de texto manuscrito (HTR) en imágenes de documentos en hebreo.
- Decodificación CTC con decodificación voraz (*greedy decoding*) sin modelo de lenguaje externo.
- Transcripción de líneas o regiones de texto manuscrito a secuencia de caracteres.
- Evaluación cuantitativa mediante CER (tasa de error de caracteres) y WER (tasa de error de palabras).
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo especializado de visión-texto para OCR/HTR.
- Capacidad multilingüe limitada al hebreo según los metadatos del modelo.

## Casos de uso

- Digitalización de archivos históricos en hebreo: el modelo transcribe líneas manuscritas escaneadas, adecuado para proyectos de preservación documental donde se requiere procesamiento por lotes con decodificación rápida.
- Extracción de texto de manuscritos en colecciones bibliotecarias: integrado en pipelines de OCR previos a la indexación de documentos, aprovechando su tamaño compacto (87 M de parámetros) para despliegue en servidores modestos.
- Investigación en HTR comparada: sirve como checkpoint de referencia en estudios de aumento de datos, permitiendo reproducir el experimento `photo4` con semilla 42 y comparar CER/WER con otras variantes del estudio.
- Preprocesamiento para búsqueda full-text en hebreo: transcribir manuscritos para alimentar motores de búsqueda o sistemas de recuperación de información, con la salvedad de que el WER de 0,4745 requiere revisión humana posterior.
- Anotación asistida de corpus manuscritos: uso como primer paso de transcripción automática que un humano corrige después, reduciendo el coste de anotación en proyectos de lingüística computacional en hebreo.
- Evaluación de robustez frente a condiciones fotográficas: la variante `photo4` está diseñada para estudiar el efecto de aumentos tipo fotografía, útil en escenarios de captura con cámara móvil en lugar de escaneo plano.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son los del modelo card, evaluados sobre HHD Option-B test con decodificación voraz y sin modelo de lenguaje:

| Metrica | Valor |
|---|---|
| CER (Character Error Rate) | 0,1186 |
| WER (Word Error Rate) | 0,4745 |

No se han publicado resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que se trata de un modelo especializado en HTR y no de un modelo de lenguaje general.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,35 GB para los pesos (87,3 M de parámetros), más memoria para activaciones y el encoder de visión.
- VRAM estimada en fp16: aproximadamente 0,18 GB para los pesos.
- Cabe holgadamente en cualquier GPU consumer, incluidas GTX 1650, RTX 3060, RTX 4090, así como en CPU para inferencia por lotes pequeños.
- GPU recomendadas para producción: T4, L4 o A10G para throughput moderado; A100/H100 no son necesarias dado el tamaño del modelo.
- Opciones de despliegue: PyTorch nativo con safetensors, ONNX Runtime tras conversión, o integración en pipelines de Hugging Face Transformers. No se dispone de confirmación de soporte en vLLM, llama.cpp u Ollama, que están orientados a modelos de lenguaje generativos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| cyttic/hmt-trocrctc-photo4-s42 | 87,3 M | no disponible | MIT | HTR hebreo con TrOCR+CTC |
| TrOCR (Microsoft, base) | ~334 M | no disponible | MIT | OCR impreso y manuscrito en inglés |
| TrOCR (Microsoft, large) | ~558 M | no disponible | MIT | OCR impreso y manuscrito en inglés |
| Otros checkpoints cyttic del estudio `htr-metrics-transfer` | no disponible | no disponible | MIT | Variantes de aumento y semilla |

La comparación directa con TrOCR estándar es aproximada: este modelo es una adaptación específica para hebreo manuscrito con cabeza CTC, mientras que los TrOCR originales están entrenados principalmente en inglés. No se dispone de resultados de benchmarks comparativos publicados entre estas variantes en la información disponible.

## Limitaciones y advertencias

- El WER de 0,4745 es elevado: casi la mitad de las palabras presentan errores, lo que hace imprescindible la revisión humana en aplicaciones de producción.
- El CER de 0,1186 indica que aproximadamente un 12 % de los caracteres son incorrectos, aceptable para tareas de indexación pero no para transcripción crítica sin supervisión.
- El modelo está entrenado exclusivamente para hebreo (`language: he`); no se garantiza su funcionamiento en otros idiomas.
- No se dispone de información sobre sesgos del dataset de entrenamiento (`cyttic/hhd-optionb-split`), por lo que se desconoce su comportamiento ante escritores, estilos o dominios no representados.
- Riesgo de alucinación inherente a los modelos generativos de secuencias: la decodificación CTC sin modelo de lenguaje puede producir secuencias plausibles pero incorrectas.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en dominios distintos al de evaluación.
- El modelo es un checkpoint de investigación de una oleada concreta (`wave 1`, semilla 42); no debe considerarse una versión final o de producción del sistema.
- No se dispone de información sobre cuantizaciones soportadas ni sobre el pipeline de Hugging Face asociado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyttic/hmt-trocrctc-photo4-s42
- Dataset de entrenamiento: https://huggingface.co/datasets/cyttic/hhd-optionb-split (referenciado en el model card)
- Resultados detallados: `results.json` dentro del repositorio del modelo
- Paper de TrOCR: no disponible en la información proporcionada
- Repositorio del estudio `htr-metrics-transfer`: no disponible en la información proporcionada
