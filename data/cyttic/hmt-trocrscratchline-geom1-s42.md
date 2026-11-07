# cyttic/hmt-trocrscratchline-geom1-s42

## Resumen

`cyttic/hmt-trocrscratchline-geom1-s42` es un modelo de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) publicado por el usuario `cyttic` en Hugging Face. Forma parte de un estudio sistemático de aumento de datos (*augmentation study*) denominado `htr-metrics-transfer`, en el que se entrenan variantes de una misma familia de modelos cambiando la estrategia de aumento geométrico y la semilla aleatoria. En concreto, esta variante corresponde al modelo base `trocrscratchline`, con la configuración de aumento `geom1` y semilla 42.

El modelo tiene 22.421.004 parámetros y se distribuye en formato `safetensors` con un tamaño de repositorio de 0,1 GB. Está especializado en hebreo (`he`) y emplea una arquitectura de tipo TrOCR con decodificación CTC, según las etiquetas del repositorio (`htr`, `ctc`). No es un modelo generativo de propósito general, sino un componente de un *pipeline* de digitalización de documentos manuscritos.

Su relevancia es acotada pero concreta: sirve como punto de comparación reproducible dentro del estudio de transferencia de métricas HTR del autor, y permite a investigadores reproducir exactamente la configuración `geom1`/semilla 42. La información pública disponible es muy limitada: no hay *model card* extendida, ni datos de entrenamiento detallados, ni benchmarks comparativos más allá de las métricas indicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TrOCR (encoder-decoder transformer para HTR) con decodificacion CTC, segun tags del repo |
| Parametros totales | 22.421.004 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | he (hebreo) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se etiqueta como `trocrscratchline` dentro del estudio del autor y lleva las etiquetas `htr` y `ctc`, lo que indica una arquitectura basada en TrOCR (transformer encoder-decoder para reconocimiento de texto en imagen) con cabecera de decodificación CTC. El nombre `scratchline` sugiere un entrenamiento desde cero (*scratch*) sobre líneas de texto, aunque este extremo no se confirma en la información disponible. El recuento de 22,4 millones de parámetros es coherente con una variante compacta de TrOCR orientada a líneas manuscritas, muy por debajo de los ~334 M de TrOCR-base.

El entrenamiento se realizó sobre el split de entrenamiento del dataset `cyttic/hhd-optionb-split`, excluyendo los escritores (*writers*) reservados para desarrollo, y se evaluó sobre el conjunto de test HHD Option-B. La decodificación empleada en la evaluación es *greedy* sin modelo de lenguaje, es decir, sin corrección posterior mediante LM. La configuración de aumento de datos es `geom1` con semilla 42. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF/DPO (poco probables en una tarea HTR supervisada).

## Capacidades

- Reconocimiento de texto manuscrito en hebreo a nivel de línea de texto.
- Decodificación CTC con *greedy decoding* para transcripción directa de imágenes.
- Entrenamiento con aumento geométrico (`geom1`), lo que aporta cierta robustez frente a transformaciones geométricas de la entrada.
- No dispone de soporte documentado de *tool calling* ni de *function calling*.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- Capacidad multilingüe limitada al hebreo según los metadatos del repositorio.
- No dispone de modo *thinking*, visión general, audio ni otras capacidades multimodales más allá de la lectura de imagen de línea.

## Casos de uso

- Digitalización de archivos manuscritos en hebreo: el modelo transcribe líneas de texto manuscrito, lo que permite convertir colecciones escaneadas en texto indexable y buscable.
- Investigación en HTR comparada: sirve como una de las variantes controladas del estudio `htr-metrics-transfer`, permitiendo aislar el efecto del aumento `geom1` frente a otras configuraciones (`geom4`, `trocrctc`, etc.).
- Reproducibilidad de experimentos: al fijar semilla 42 y configuración `geom1`, otros grupos pueden replicar exactamente el resultado reportado (CER 0,1703; WER 0,6620) y usarlo como línea base.
- Extracción de texto para *pipelines* de NLP en hebreo: la salida del modelo puede alimentar etapas posteriores de análisis lingüístico, búsqueda o clasificación documental.
- Anotación asistida de corpus manuscritos: el modelo puede generar transcripciones preliminares que un humano revise, reduciendo el coste de anotación.
- Evaluación de la transferencia de métricas: útil para estudiar cómo se transfieren las métricas CER/WER entre configuraciones de aumento y arquitecturas (`trocrctc` frente a `trocrscratchline`).

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son los del propio autor en la *model card*, sobre el test HHD Option-B con decodificación *greedy* y sin LM:

| Modelo | Aumento | Semilla | CER | WER |
|---|---|---|---|---|
| hmt-trocrscratchline-geom1-s42 (este modelo) | geom1 | 42 | 0,1703 | 0,6620 |
| hmt-trocrctc-geom1-s42 | geom1 | 42 | 0,0773 | 0,3366 |
| hmt-trocrctc-geom4-s42 | geom4 | 42 | 0,0712 | 0,3156 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no son aplicables a un modelo HTR.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 22,4 M de parámetros, la inferencia en FP32 requiere aproximadamente 90 MB de pesos, más el *overhead* del *runtime* y de las activaciones; en la práctica cabe holgadamente en cualquier GPU con al menos 1-2 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna es suficiente; para lotes grandes se recomienda una RTX 3090/4090, A10, L4 o superiores.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo con al menos 2 GB de VRAM (GTX 1650, RTX 3050, etc.).
- Opciones de despliegue: al ser `safetensors` con arquitectura TrOCR, puede cargarse con `transformers` (clase TrOCR/VisionEncoderDecoder) y servirse con TGI o con un servidor propio; llama.cpp/Ollama no están documentados para esta arquitectura en la información disponible.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CER (HHD Option-B) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hmt-trocrscratchline-geom1-s42 | 22,4 M | no disponible | 0,1703 | MIT | Hugging Face |
| hmt-trocrctc-geom1-s42 | no disponible | no disponible | 0,0773 | no disponible | Hugging Face |
| hmt-trocrctc-geom4-s42 | no disponible | no disponible | 0,0712 | no disponible | Hugging Face |

Las dos alternativas pertenecen al mismo estudio del autor y comparten dataset y protocolo de evaluación, por lo que la comparación es directa en cuanto a métricas. No se dispone de información sobre otros modelos HTR comparables (por ejemplo, variantes de TrOCR de Microsoft) en la información proporcionada.

## Limitaciones y advertencias

- Especializado exclusivamente en hebreo; no se debe esperar un rendimiento útil en otros idiomas.
- El WER reportado (0,6620) es elevado, lo que indica una calidad de transcripción limitada a nivel de palabra; el CER (0,1703) es también relativamente alto para producción sin revisión humana.
- La evaluación se realizó con decodificación *greedy* sin modelo de lenguaje, por lo que el rendimiento en producción podría variar si se añade corrección posterior.
- Riesgo de alucinación y de errores sistemáticos en escrituras manuscritas atípicas o con ruido, dado el tamaño reducido del modelo y la ausencia de información sobre la composición del dataset.
- No se dispone de información sobre sesgos demográficos o de estilo de escritura; el conjunto de test excluye los escritores de desarrollo, lo que mitiga parcialmente el sesgo de autor pero no lo elimina.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías ni documentación sobre el origen y los derechos del dataset de entrenamiento (`cyttic/hhd-optionb-split`), lo que conviene verificar antes de un despliegue comercial.
- No hay información sobre cuantizaciones, contexto máximo ni latencia, lo que dificulta planificar un despliegue en producción sin pruebas empíricas.
- El repositorio tiene 0 descargas y 0 *likes*, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyttic/hmt-trocrscratchline-geom1-s42
- Variante relacionada `hmt-trocrctc-geom1-s42`: https://huggingface.co/cyttic/hmt-trocrctc-geom1-s42
- Variante relacionada `hmt-trocrctc-geom4-s42`: https://huggingface.co/cyttic/hmt-trocrctc-geom4-s42
