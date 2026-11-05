# cyttic/hmt-trocrscratch-stroke2-s42

## Resumen

El modelo `cyttic/hmt-trocrscratch-stroke2-s42` es un modelo de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) desarrollado por el grupo cyttic. Se trata de una variante de TrOCR entrenada desde cero (*scratch*) sobre un conjunto de datos de escritura manuscrita hebrea, y forma parte de un estudio de aumento de datos (*augmentation study*) denominado `htr-metrics-transfer`, en el que se evalúa el efecto de la técnica de aumento `stroke2` con una semilla fija (42). El modelo emplea una cabeza de clasificación CTC y está etiquetado para la tarea `htr` con el idioma hebreo (`he`).

Con 22.421.004 parámetros y un tamaño de repositorio de 0,1 GB, es un modelo compacto orientado a la transcripción de líneas de texto manuscrito. Su relevancia es principalmente de investigación: no está pensado como un producto de uso general, sino como un artefacto reproducible dentro de un estudio comparativo sobre técnicas de aumento de datos y su transferencia de métricas. Los pesos se distribuyen en formato `safetensors` bajo licencia MIT.

La métrica publicada por el autor es un CER de 0,3568 y un WER de 0,9526 sobre el conjunto de test HHD Option-B, con decodificación greedy y sin modelo de lenguaje. Estos valores reflejan un rendimiento modesto y deben interpretarse en el contexto del estudio, no como un estado del arte en HTR hebreo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TrOCR (encoder-decoder transformer) con cabeza CTC |
| Parametros totales | 22.421.004 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura TrOCR (*Transformer-based Optical Character Recognition*), que combina un encoder de visión con un decoder transformer para la generación de secuencias de texto. En esta variante se emplea una cabeza CTC para la decodificación, lo que permite alinear directamente las características visuales con las etiquetas de caracteres sin necesidad de un decoder autorregresivo en la inferencia. El entrenamiento se realizó desde cero (*scratch*), es decir, sin partir de pesos preentrenados de TrOCR.

Los datos de entrenamiento corresponden al split de entrenamiento del conjunto `cyttic/hhd-optionb-split`, excluyendo los escritores reservados para desarrollo. La variante concreta se distingue por la técnica de aumento `stroke2` y la semilla 42, dentro del estudio `htr-metrics-transfer`. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente en HTR). La decodificación reportada es greedy y sin modelo de lenguaje.

## Capacidades

- Reconocimiento de texto manuscrito (HTR) en hebreo, orientado a la transcripción de líneas o regiones de imagen.
- Decodificación CTC con alineamiento directo entre imagen y secuencia de caracteres.
- Entrenamiento desde cero, lo que permite reproducir el experimento de aumento de datos con la semilla indicada.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al hebreo; no se declaran otros idiomas.
- No se documentan modos especiales como *thinking mode*, visión general, audio u otras modalidades más allá de la entrada de imagen para HTR.

## Casos de uso

- Investigación reproducible en HTR: el modelo sirve como artefacto de referencia para replicar el estudio `htr-metrics-transfer` con la técnica de aumento `stroke2` y semilla 42, comparando CER y WER frente a otras variantes del mismo estudio.
- Transcripción de manuscritos hebreos históricos: puede emplearse para digitalizar líneas de texto manuscrito en hebreo en archivos y colecciones, siempre que se acepte el nivel de error publicado (CER 0,3568).
- Evaluación de técnicas de aumento de datos: permite medir cómo afecta `stroke2` a la transferencia de métricas entre conjuntos de desarrollo y test en tareas de HTR.
- Línea base para comparativas de arquitecturas: al ser un TrOCR entrenado desde cero con cabeza CTC, sirve como referencia frente a modelos preentrenados o con decoder autorregresivo.
- Prototipado en entornos con recursos limitados: con 22,4 M de parámetros y pesos en safetensors, es viable para experimentos en una sola GPU de gama media o incluso en CPU para inferencia por lotes pequeños.
- Generación de datasets etiquetados: puede usarse para preanotar transcripciones que luego se revisen manualmente, reduciendo el coste de anotación en corpus hebreos.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| CER | 0.3568 | HHD Option-B test, greedy, sin LM |
| WER | 0.9526 | HHD Option-B test, greedy, sin LM |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no son aplicables a un modelo de HTR.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para los 22,4 M de parámetros; en la práctica, el cuello de botella es la imagen de entrada, no los pesos.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM (GTX 1650, RTX 3050, RTX 4090, A100, H100) es suficiente; el modelo no requiere aceleradores de gama alta.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: PyTorch con `transformers` o carga directa de `safetensors`; no se documenta soporte específico para vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos de lenguaje y no a HTR con CTC.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| cyttic/hmt-trocrscratch-stroke2-s42 | 22,4 M | no disponible | MIT | HuggingFace | TrOCR desde cero, CTC, hebreo, CER 0,3568 |
| TrOCR (Microsoft, base) | ~334 M | no disponible | MIT | HuggingFace | Preentrenado, orientado a inglés |
| Otras variantes del estudio `htr-metrics-transfer` | no disponible | no disponible | MIT (presumible) | HuggingFace | Mismo pipeline, distinto aumento/semilla |

No se dispone de datos de rendimiento de los modelos comparables en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Rendimiento modesto: CER de 0,3568 y WER de 0,9526 indican una tasa de error elevada para producción sin revisión humana.
- Sesgos conocidos: al entrenarse sobre un conjunto concreto de escritores (`hhd-optionb-split`), puede generalizar mal a escritores, estilos o dominios no representados.
- Riesgo de alucinación: en HTR, el modelo puede producir caracteres o palabras no presentes en la imagen, especialmente en regiones de baja calidad.
- Limitación de idioma: solo hebreo; no se declaran capacidades multilingües.
- Restricciones de licencia: MIT permite uso comercial, pero el autor no ofrece garantías ni soporte; el modelo es un artefacto de investigación.
- Caveat para producción: la decodificación reportada es greedy y sin modelo de lenguaje; añadir un LM podría mejorar el WER, pero no se documenta.
- No se documentan requisitos de contexto, cuantizaciones ni latencias, lo que dificulta su integración en pipelines productivos sin evaluación previa.

## Enlaces

- HuggingFace: https://huggingface.co/cyttic/hmt-trocrscratch-stroke2-s42
- Dataset de entrenamiento: https://huggingface.co/datasets/cyttic/hhd-optionb-split (referenciado en la model card)
- Estudio `htr-metrics-transfer`: no disponible como enlace público en la información proporcionada
- Paper de TrOCR: no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada
