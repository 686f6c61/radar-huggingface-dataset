# cyttic/hmt-htrvt-stroke1-s43

## Resumen

`cyttic/hmt-htrvt-stroke1-s43` es un modelo de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) desarrollado por el grupo cyttic. Se trata de un checkpoint perteneciente a un estudio de aumento de datos (*augmentation study*) denominado `htr-metrics-transfer`, en el que se entrena un modelo base llamado `htrvt` con distintas estrategias de aumento y semillas. En este caso concreto, la variante corresponde al aumento `stroke1` y la semilla 43.

El modelo resuelve la tarea de transcripción de texto manuscrito mediante una arquitectura con salida CTC (*Connectionist Temporal Classification*), lo que permite alinear secuencias de imagen con secuencias de caracteres sin necesidad de segmentación previa. Está entrenado sobre el conjunto `cyttic/hhd-optionb-split`, excluyendo los escritores de dev, y evaluado sobre el test HHD Option-B con decodificación greedy y sin modelo de lenguaje.

Con 13.821.574 parámetros y un tamaño de repositorio de 0,1 GB, es un modelo compacto orientado a investigación en transferencia de métricas bajo aumentos de datos. Su relevancia es acotada: se trata de un artefacto experimental de un estudio comparativo, no de un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (salida CTC para HTR) |
| Parametros totales | 13.821.574 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hebreo (he) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de que emplea una cabeza de salida CTC para reconocimiento de texto manuscrito. El modelo pertenece a la familia `htrvt` y se ha entrenado sobre el split de entrenamiento de `cyttic/hhd-optionb-split`, excluyendo a los escritores presentes en el conjunto de desarrollo para evitar fuga de información entre particiones.

El experimento forma parte de un estudio de aumento de datos (`htr-metrics-transfer`) en el que se varía la estrategia de aumento (`stroke1`) y la semilla (43). No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de ajuste fino como RLHF o DPO, algo por otra parte poco habitual en tareas HTR. La innovación técnica destacable es metodológica: la evaluación de la transferencia de métricas bajo distintos aumentos con decodificación greedy y sin modelo de lenguaje.

## Capacidades

- Reconocimiento de texto manuscrito (HTR) en hebreo mediante decodificación CTC.
- Transcripción a nivel de carácter y de palabra sobre imágenes de líneas o regiones de texto manuscrito.
- Decodificación greedy sin modelo de lenguaje externo, según la configuración de evaluación reportada.
- Evaluación mediante CER (*Character Error Rate*) y WER (*Word Error Rate*).
- No se ha documentado soporte de tool calling, agentes, razonamiento multi-paso, visión general, audio ni modo *thinking*.
- Capacidad multilingüe limitada al hebreo según la model card.

## Casos de uso

- Digitalización de archivos manuscritos en hebreo: el modelo puede transcribir imágenes de texto manuscrito a texto digital, adecuado para proyectos de preservación documental con material en hebreo.
- Investigación en aumento de datos para HTR: sirve como checkpoint de referencia para comparar el efecto de la estrategia `stroke1` frente a otras variantes del estudio `htr-metrics-transfer`.
- Reproducción de experimentos: al estar identificado por semilla (43) y aumento (`stroke1`), permite reproducir exactamente la configuración reportada con CER 0.0622 y WER 0.2855.
- Evaluación comparativa de decodificadores: útil para medir el impacto de prescindir de un modelo de lenguaje en la decodificación, ya que la evaluación reportada es greedy sin LM.
- Prototipado de pipelines OCR/HTR en hebreo: por su tamaño reducido (13,8 M de parámetros) puede integrarse en entornos con recursos limitados para pruebas de concepto.
- Generación de datos etiquetados: las transcripciones del modelo pueden emplearse como pseudoetiquetas para preentrenar o aumentar otros sistemas HTR en hebreo, con la debida revisión humana.

## Benchmarks y rendimiento

| Metrica | Valor | Configuracion |
|---|---|---|
| CER | 0.0622 | HHD Option-B test, greedy, sin LM |
| WER | 0.2855 | HHD Option-B test, greedy, sin LM |

No se han publicado en la información disponible resultados comparativos con otros modelos en MMLU, HumanEval, GSM8K ni benchmarks equivalentes, que por otra parte no aplican a una tarea HTR.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa, dado el tamaño de 13,8 M de parámetros (aproximadamente 55 MB en fp32 y 28 MB en fp16).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requiere A100 ni H100.
- Cabe holgadamente en GPU consumer (RTX 3060, RTX 4090, GTX 1660, etc.) e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: al ser pesos safetensors con cabeza CTC, requiere un runtime compatible con la arquitectura `htrvt` del autor; no se documenta soporte directo en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma familia ni resultados de otras variantes del estudio `htr-metrics-transfer` que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Modelo experimental de un estudio de aumento de datos; no está pensado como producto final ni como servicio listo para producción.
- Entrenado y evaluado únicamente en hebreo manuscrito; el rendimiento en otros idiomas o en texto impreso no está caracterizado.
- La evaluación reportada usa decodificación greedy sin modelo de lenguaje, por lo que el WER de 0.2855 puede mejorar con un LM, pero también refleja un rendimiento limitado a nivel de palabra.
- Riesgo de alucinación y errores de transcripción inherente a los sistemas CTC, especialmente en escrituras ambiguas o degradadas.
- No se documentan sesgos específicos, pero al entrenarse sobre un conjunto concreto de escritores (`hhd-optionb-split`), puede generalizar mal a escritores, estilos o dominios no representados.
- Licencia MIT: permite uso comercial y modificación, pero no se ofrece ninguna garantía sobre el rendimiento en dominios distintos al evaluado.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere ausencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/cyttic/hmt-htrvt-stroke1-s43
- Dataset de entrenamiento: https://huggingface.co/datasets/cyttic/hhd-optionb-split (referenciado en la model card)
- No se han encontrado en la información disponible enlaces a papers, blogs, repositorios de código ni demos adicionales.
