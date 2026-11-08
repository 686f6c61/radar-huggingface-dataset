# cyttic/hmt-trocrscratchline-photo3-s42

## Resumen

El modelo `cyttic/hmt-trocrscratchline-photo3-s42` es un modelo de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) desarrollado por el grupo cyttic. Se trata de un experimento de investigación centrado en estudiar cómo afecta el aumento de datos (*augmentation*) al rendimiento de un sistema TrOCR entrenado desde cero. El identificador del modelo indica que se usó la variante `trocrscratchline` (TrOCR con línea de texto, entrenado sin pesos preentrenados) junto con una estrategia de aumento denominada `photo3` y la semilla 42.

El modelo resuelve la transcripción de líneas de texto manuscrito en hebreo (`he`) mediante un esquema CTC (*Connectionist Temporal Classification*). Con 22,4 millones de parámetros, es un modelo muy compacto orientado a tareas de OCR/HTR sobre líneas de texto, no a generación libre de lenguaje. Su relevancia es principalmente metodológica: forma parte de un estudio sobre transferencia de métricas HTR y sirve como referencia reproducible para comparar configuraciones de aumento de datos.

No se dispone de información sobre pipeline en Hugging Face ni sobre resultados de benchmarks más allá de las métricas publicadas por el autor en la model card (CER 0,3881 y WER 0,9548 sobre el conjunto de test HHD Option-B con decodificación greedy y sin modelo de lenguaje).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TrOCR (transformer encoder-decoder para HTR), variante `trocrscratchline` |
| Parametros totales | 22.421.004 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a la familia TrOCR aplicada a reconocimiento de líneas de texto manuscrito, con un codificador de visión y un decodificador de texto entrenados desde cero (de ahí el sufijo `scratch`). El modelo emplea una cabeza CTC para el alineamiento entre la secuencia visual y la secuencia de caracteres, lo que permite decodificación greedy sin necesidad de un modelo de lenguaje externo. Con 22,4 millones de parámetros, se sitúa muy por debajo de los TrOCR estándar, lo que sugiere un diseño compacto específico para el corpus de trabajo.

El entrenamiento se realizó sobre el conjunto `cyttic/hhd-optionb-split`, excluyendo los escritores del conjunto de desarrollo, y evaluado sobre el test HHD Option-B. La variante de aumento `photo3` y la semilla 42 forman parte de un estudio sistemático de aumento de datos. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF/DPO (poco probables en un modelo CTC de HTR).

## Capacidades

- Reconocimiento de texto manuscrito en hebreo a nivel de línea.
- Decodificación CTC greedy sin modelo de lenguaje auxiliar.
- Transcripción de secuencias de caracteres a partir de imágenes de líneas de texto.
- No soporta tool calling ni function calling (no es un modelo de lenguaje generativo conversacional).
- No soporta razonamiento multi-paso ni comportamiento de agente.
- Capacidad multilingüe limitada al hebreo según la model card.
- No dispone de modo *thinking*, visión general, audio ni otras modalidades más allá de la entrada de imagen de línea.

## Casos de uso

- Digitalización de archivos manuscritos en hebreo: el modelo puede transcribir líneas de documentos históricos o administrativos escaneados, integrándose en un pipeline de segmentación de líneas previo.
- Estudio comparativo de aumento de datos: sirve como punto de referencia reproducible (semilla 42, aumento `photo3`) para medir el impacto de distintas estrategias de *augmentation* en HTR.
- Evaluación de transferencia de métricas HTR: útil para investigadores que quieran replicar el protocolo CER/WER del autor sobre el conjunto HHD Option-B.
- Prototipado de OCR para líneas manuscritas: al ser un modelo pequeño (22,4 M de parámetros), puede desplegarse en entornos con recursos limitados para pruebas de concepto.
- Generación de datos etiquetados: puede emplearse para preanotar líneas manuscritas que luego se revisen manualmente, acelerando la creación de corpus.
- Investigación en arquitecturas CTC compactas: sirve como base para experimentos con decodificación y post-procesado en hebreo sin depender de modelos de lenguaje grandes.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto / condiciones |
|---|---|---|
| CER | 0,3881 | HHD Option-B test, decodificación greedy, sin LM |
| WER | 0,9548 | HHD Option-B test, decodificación greedy, sin LM |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no son aplicables a un modelo de HTR.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 dado el tamaño de 22,4 M de parámetros (aproximadamente 90 MB de pesos).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no requiere A100 ni H100.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2 GB de VRAM (GTX 1050, RTX 3050, etc.), e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: al ser un modelo de la familia TrOCR con pesos safetensors, puede cargarse con `transformers`; no se dispone de información sobre soporte específico en vLLM, llama.cpp u Ollama (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| cyttic/hmt-trocrscratchline-photo3-s42 | 22,4 M | no disponible | MIT | Hugging Face | HTR hebreo, CTC, entrenado desde cero |
| TrOCR (microsoft/trocr-base-handwritten) | ~334 M | no disponible | MIT | Hugging Face | HTR inglés, preentrenado, arquitectura de referencia |
| TrOCR small | ~62 M | no disponible | MIT | Hugging Face | Variante compacta de TrOCR para HTR |

La comparación con TrOCR estándar es orientativa: el modelo de cyttic está entrenado desde cero y especializado en hebreo, por lo que los parámetros y el rendimiento no son directamente equiparables. No se dispone de datos de benchmarks comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El CER de 0,3881 y el WER de 0,9548 indican un rendimiento modesto; el WER cercano a 1 sugiere que la transcripción a nivel de palabra es poco fiable sin post-procesado o modelo de lenguaje.
- Entrenado exclusivamente para hebreo; no se garantiza su funcionamiento en otros idiomas.
- Al estar entrenado desde cero y sobre un corpus específico, puede presentar sesgos hacia el estilo de escritura y los escritores del dataset `hhd-optionb-split`.
- Riesgo de alucinación de caracteres en imágenes ruidosas o con caligrafías no representadas en el entrenamiento.
- No se especifican limitaciones de longitud de contexto ni de resolución de imagen en la información disponible.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción.
- Modelo de investigación con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación externa.

## Enlaces

- [Hugging Face: cyttic/hmt-trocrscratchline-photo3-s42](https://huggingface.co/cyttic/hmt-trocrscratchline-photo3-s42)
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
