# cyttic/hmt-trocrscratch-photo3-s42

## Resumen

`cyttic/hmt-trocrscratch-photo3-s42` es un modelo de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) desarrollado por cyttic como parte de un estudio de aumento de datos (*augmentation study*) denominado `htr-metrics-transfer`. El modelo se basa en la arquitectura TrOCR entrenada desde cero (*scratch*) y utiliza decodificación CTC (*Connectionist Temporal Classification*), según indican las etiquetas del repositorio.

El modelo está especializado en hebreo (`he`) y se entrenó sobre la partición de entrenamiento del conjunto `cyttic/hhd-optionb-split`, excluyendo los escritores de la partición de desarrollo. La variante concreta corresponde a la configuración de aumento `photo3` con semilla 42, lo que sugiere que forma parte de una batería de experimentos controlados para medir el impacto de distintas estrategias de aumento de datos en métricas de reconocimiento.

Con 22.421.004 parámetros (aproximadamente 22,4 M) y un tamaño de repositorio de 0,1 GB, es un modelo compacto orientado a investigación más que a despliegue en producción. Su relevancia radica en su carácter reproducible y comparativo dentro del estudio, no en un rendimiento estado del arte: el propio autor reporta CER 0,3847 y WER 0,9562 sobre el test HHD Option-B, cifras que reflejan la dificultad del dominio manuscrito en hebreo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TrOCR (encoder-decoder transformer para reconocimiento de texto) con decodificacion CTC |
| Parametros totales | 22.421.004 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hebreo (he) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la familia TrOCR, un transformer encoder-decoder concebido para reconocimiento óptico de caracteres sobre imágenes de texto. En esta variante concreta se emplea decodificación CTC (etiqueta `ctc` del repositorio), lo que implica un enfoque de alineación secuencia-a-secuencia sin modelo de lenguaje externo durante la inferencia: el autor especifica explícitamente "greedy decoding, no LM". El entrenamiento se realizó desde cero (*scratch*), no por ajuste fino de un TrOCR preentrenado, lo que explica el tamaño relativamente reducido de 22,4 M de parámetros.

Los datos de entrenamiento provienen de la partición de train del conjunto `cyttic/hhd-optionb-split`, excluyendo los escritores presentes en la partición de desarrollo, una separación por escritor que busca evaluar la generalización a escritores no vistos. La configuración experimental corresponde al aumento de datos `photo3` con semilla 42, dentro de un estudio más amplio (`htr-metrics-transfer`) que compara distintas estrategias de aumento. No se dispone de información sobre el número total de tokens, la composición detallada del dataset ni el uso de RLHF o DPO, que no aplican en un modelo HTR de este tipo.

## Capacidades

- Reconocimiento de texto manuscrito en hebreo a partir de imágenes de línea o documento.
- Decodificación CTC con búsqueda voraz (*greedy*), sin modelo de lenguaje auxiliar.
- Salida de transcripción secuencial de caracteres.
- Entrenamiento desde cero, sin dependencia de pesos preentrenados de TrOCR.
- No se documenta soporte de *tool calling*, *function calling*, agentes ni razonamiento multi-paso.
- No se documentan capacidades multimodales más allá de la entrada de imagen para transcripción.
- No se documenta capacidad multilingüe: el modelo está etiquetado únicamente para hebreo.

## Casos de uso

- Investigación en aumento de datos para HTR: el modelo sirve como punto de comparación reproducible (semilla 42, aumento `photo3`) frente a otras configuraciones del estudio `htr-metrics-transfer`, permitiendo aislar el efecto de la estrategia de aumento en CER y WER.
- Transcripción de manuscritos hebreos históricos: puede emplearse como línea base para digitalización de archivos, aunque su CER de 0,3847 exige revisión humana posterior.
- Evaluación de generalización por escritor: al haberse entrenado excluyendo los escritores de desarrollo, es útil para medir el rendimiento sobre escritores no vistos en el conjunto HHD Option-B.
- Prototipado de pipelines OCR/HTR en hebreo: su tamaño de 22,4 M permite integrarlo en entornos con recursos limitados para pruebas de concepto antes de escalar a modelos mayores.
- Reproducción de experimentos académicos: la licencia MIT y la publicación de pesos en safetensors facilitan la replicación de resultados y la comparación con otras variantes del mismo estudio.
- Análisis de errores en reconocimiento de escritura manuscrita: las métricas reportadas (CER/WER) y el detalle en `results.json` permiten estudiar patrones de fallo en decodificación CTC sin LM.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto |
|---|---|---|
| CER | 0,3847 | HHD Option-B test |
| WER | 0,9562 | HHD Option-B test |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a un modelo HTR.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 dado el tamaño de 22,4 M de parámetros (aproximadamente 90 MB de pesos); no se dispone de cifras oficiales.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requiere A100 ni H100.
- Cabe holgadamente en GPU consumer (RTX 3060, RTX 4090, GTX 1660, etc.) e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: al ser un modelo TrOCR con pesos safetensors, puede cargarse con la librería `transformers` de Hugging Face; no se documenta soporte específico de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| cyttic/hmt-trocrscratch-photo3-s42 | 22,4 M | no disponible | MIT | Hugging Face |
| TrOCR base (Microsoft) | no disponible en esta ficha | no disponible | MIT | Hugging Face |
| Otras variantes del estudio `htr-metrics-transfer` | no disponible | no disponible | MIT (presumible) | Hugging Face |

No se dispone de datos de rendimiento de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Rendimiento limitado: CER de 0,3847 y WER de 0,9562 indican una tasa de error elevada, inadecuada para producción sin revisión humana.
- Sesgo de dominio: entrenado exclusivamente sobre el conjunto `cyttic/hhd-optionb-split`, por lo que puede no generalizar a otros estilos de escritura, soportes o calidades de imagen.
- Idiomas: solo hebreo; no se ha validado en otros alfabetos o idiomas.
- Sin modelo de lenguaje: la decodificación CTC voraz sin LM tiende a producir errores de coherencia léxica que un LM podría corregir.
- Riesgo de alucinación: en HTR, la decodificación puede generar caracteres o secuencias plausibles pero incorrectas, especialmente en regiones de imagen degradadas.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías sobre idoneidad para producción.
- Modelo de investigación: forma parte de un estudio de aumento de datos, no de un lanzamiento orientado a producto; no hay documentación de estabilidad, versionado ni soporte.
- Fecha de creación futura (2026-11-05): conviene verificar la integridad y procedencia del repositorio antes de reutilizarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyttic/hmt-trocrscratch-photo3-s42
- Conjunto de datos de entrenamiento: https://huggingface.co/datasets/cyttic/hhd-optionb-split
- No se han encontrado en la búsqueda web papers, blogs, repositorios ni demos adicionales asociados a este modelo.
