# cyttic/hmt-trocrscratchreg-geom3-s42

## Resumen

El modelo `cyttic/hmt-trocrscratchreg-geom3-s42` es un modelo de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) desarrollado por el grupo cyttic en el marco de un estudio de aumentación de datos denominado htr-metrics-transfer. Se trata de un modelo especializado en hebreo (`he`) que emplea una arquitectura TrOCR con cabecera CTC y decodificación greedy, entrenado sobre el corpus `cyttic/hhd-optionb-split` excluyendo los escritores del conjunto de desarrollo.

El modelo forma parte de una familia de variantes experimentales que combinan distintas estrategias de aumentación (`geom3`) y semillas aleatorias (42), con el objetivo de medir la transferencia de métricas entre configuraciones de entrenamiento. Con 22,4 millones de parámetros y un tamaño de repositorio de 0,1 GB, es un modelo compacto orientado a la transcripción de documentos históricos o manuscritos en hebreo.

Su relevancia radica en su carácter de artefacto de investigación reproducible: publica métricas concretas (CER 0,1974 y WER 0,7280 sobre el conjunto de test HHD Option-B) y una licencia MIT permisiva, lo que facilita su reutilización en experimentos académicos de HTR. No obstante, no está pensado como un modelo de propósito general ni como un producto listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TrOCR con cabecera CTC (según tags y model card) |
| Parametros totales | 22.421.004 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card indica que el modelo se basa en la variante `trocrscratchreg`, es decir, un TrOCR entrenado desde cero (*scratch*) con regularización, sobre el que se aplica una cabecera de clasificación temporal conexionista (CTC) para la transcripción de secuencias de caracteres. La decodificación es greedy y no se emplea modelo de lenguaje externo (*no LM*), lo que simplifica el pipeline de inferencia a costa de no corregir errores léxicos.

El entrenamiento se realizó sobre el conjunto `cyttic/hhd-optionb-split`, excluyendo los escritores presentes en el conjunto de desarrollo, con el objetivo de evaluar la generalización a escritores no vistos. La aumentación aplicada se denomina `geom3` y la semilla aleatoria es 42. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO, algo esperable dado que se trata de una tarea de reconocimiento y no de generación de lenguaje.

## Capacidades

- Reconocimiento de texto manuscrito (HTR) en hebreo mediante decodificación CTC greedy.
- Transcripción de imágenes de líneas o regiones de texto manuscrito a secuencia de caracteres.
- Entrenamiento desde cero sobre un corpus específico de escritores, lo que permite estudiar la generalización a escritores no vistos.
- No soporta tool calling ni function calling (no es un modelo de lenguaje conversacional).
- No soporta razonamiento multi-paso ni uso como agente.
- Capacidad multilingüe limitada al hebreo (`he`).
- No dispone de modo *thinking*, visión general, audio ni otras capacidades multimodales más allá de la entrada de imagen para HTR.

## Casos de uso

- Digitalización de manuscritos históricos en hebreo: el modelo transcribe imágenes de texto manuscrito a texto plano, adecuado para proyectos de archivo y patrimonio documental donde se dispone de imágenes de líneas segmentadas.
- Investigación en HTR académica: sirve como punto de comparación reproducible (semilla 42, aumentación `geom3`) para estudiar la transferencia de métricas entre configuraciones de entrenamiento.
- Evaluación de estrategias de aumentación: al formar parte de un estudio de aumentación, permite aislar el efecto de `geom3` frente a otras variantes sobre el CER y el WER.
- Generación de transcripciones auxiliares para anotación humana: con un CER de 0,1974, las salidas pueden servir como preanotación que revisores humanos corrigen, reduciendo el coste de etiquetado.
- Experimentos de generalización a escritores no vistos: al haberse entrenado excluyendo los escritores del conjunto de desarrollo, es útil para medir la robustez ante estilos de escritura nuevos.
- Prototipado de pipelines de OCR/HTR en hebreo: su tamaño reducido (22,4 M de parámetros, 0,1 GB) permite desplegarlo en entornos con recursos limitados para pruebas de concepto.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto | Decodificacion |
|---|---|---|---|
| CER | 0,1974 | HHD Option-B test | greedy, sin LM |
| WER | 0,7280 | HHD Option-B test | greedy, sin LM |

No se han publicado en la información disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros), dado que la tarea es de reconocimiento de texto manuscrito y no de lenguaje general.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, inferior a 1 GB en precisión completa (22,4 M de parámetros, pesos en safetensors de ~0,1 GB).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es suficiente; también es viable en CPU para volúmenes moderados.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con al menos 2 GB de VRAM, e incluso en CPU.
- Opciones de despliegue: al ser un modelo TrOCR con pesos safetensors, puede cargarse con la librería `transformers` de HuggingFace; no se dispone de información sobre soporte específico en vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos de lenguaje y no a HTR.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cyttic/hmt-trocrscratchreg-geom3-s42 | 22,4 M | no disponible | HTR hebreo (CTC) | MIT | HuggingFace |
| TrOCR base (Microsoft) | ~334 M | no aplica | OCR/HTR genérico | MIT | HuggingFace |
| TrOCR large (Microsoft) | ~558 M | no aplica | OCR/HTR genérico | MIT | HuggingFace |

No se dispone de información sobre otros modelos comparables específicos para HTR en hebreo en la documentación proporcionada. La comparación con TrOCR base y large se ofrece como referencia de arquitectura, no de rendimiento en la misma tarea.

## Limitaciones y advertencias

- El WER de 0,7280 es elevado, lo que indica que la transcripción a nivel de palabra contiene errores frecuentes; el CER de 0,1974 sugiere que a nivel de carácter el rendimiento es moderado pero no apto para producción sin revisión.
- El modelo está entrenado exclusivamente en hebreo y no generaliza a otros idiomas.
- Al ser un artefacto de un estudio de aumentación con una única semilla (42), su robustez estadística es limitada; los resultados pueden no ser representativos de otras semillas o configuraciones.
- No emplea modelo de lenguaje en decodificación, por lo que no corrige errores léxicos ni contextuales.
- Riesgo de sesgo hacia los estilos de escritura y el dominio del corpus `hhd-optionb-split`; el rendimiento puede degradarse en manuscritos de otras épocas, soportes o caligrafías.
- Aunque la licencia es MIT y permite uso comercial, la ausencia de garantías y el carácter experimental del modelo desaconsejan su uso en producción sin validación previa.
- No se documentan sesgos demográficos ni de otro tipo en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cyttic/hmt-trocrscratchreg-geom3-s42
- Corpus de entrenamiento: https://huggingface.co/datasets/cyttic/hhd-optionb-split
- No se han encontrado en la información disponible enlaces a papers, blogs, repositorios de código o demos adicionales.
