# cyttic/hmt-trocrsmall-geom1-s42

## Resumen

`cyttic/hmt-trocrsmall-geom1-s42` es un modelo de reconocimiento de texto manuscrito (HTR, *handwritten text recognition*) publicado por el autor `cyttic` en HuggingFace. Forma parte de un estudio de aumento de datos (*augmentation study*) denominado `htr-metrics-transfer`, en el que se entrena un mismo modelo base (`trocrsmall`) con distintas estrategias de aumento y semillas, y se comparan métricas de error. Este checkpoint concreto corresponde a la variante de aumento `geom1` con semilla 42.

El modelo resuelve la transcripción de imágenes de texto manuscrito en hebreo (`he`), mediante una arquitectura de reconocimiento con decodificación CTC y sin modelo de lenguaje externo. Con 22.421.004 parámetros y un tamaño de repositorio de 0,1 GB, es un modelo compacto orientado a investigación y evaluación comparativa, no a producción generalista.

Su relevancia es acotada pero clara: sirve como punto de referencia reproducible para estudiar cómo afectan las transformaciones geométricas de aumento de datos al rendimiento en HTR sobre un *split* concreto (`cyttic/hhd-optionb-split`). La licencia MIT facilita su reutilización y reproducción experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de reconocimiento de texto manuscrito con cabecera CTC) |
| Parametros totales | 22.421.004 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna más allá de indicar que se trata de un modelo de HTR con decodificación CTC (*Connectionist Temporal Classification*) y sin modelo de lenguaje en la decodificación (*greedy decoding, no LM*). El nombre del modelo base, `trocrsmall`, sugiere una variante pequeña de una familia denominada `troc` del mismo autor, pero no se especifica si se trata de un transformer, una CNN con cabecera recurrente o una arquitectura híbrida. Tampoco se documentan el número de tokens de entrenamiento ni la composición exacta del dataset.

El entrenamiento se realizó sobre el conjunto `cyttic/hhd-optionb-split`, excluyendo los escritores (*writers*) que forman parte del conjunto de desarrollo, lo que evita fuga de información entre entrenamiento y evaluación. La variante `geom1` indica una estrategia de aumento de datos de tipo geométrico (rotaciones, escalados, deformaciones o transformaciones afines, aunque el detalle exacto no se especifica). La semilla 42 fija la reproducibilidad del experimento. No se menciona uso de RLHF, DPO ni técnicas de alineación, algo esperable en un modelo de reconocimiento y no de generación.

## Capacidades

- Reconocimiento de texto manuscrito en hebreo a partir de imágenes de líneas o páginas.
- Decodificación CTC con estrategia *greedy* (sin beam search ni modelo de lenguaje).
- Salida de transcripción a nivel de carácter y de palabra, con métricas CER y WER asociadas.
- Evaluación reproducible sobre el conjunto de test HHD Option-B.
- No soporta *tool calling*, *function calling* ni razonamiento multi-paso: no es un modelo de lenguaje generativo.
- No dispone de capacidades multimodales más allá de la entrada de imagen para HTR.
- No se documentan capacidades multilingües: el único idioma declarado es el hebreo.

## Casos de uso

- Investigación en aumento de datos para HTR: comparar el checkpoint `geom1` con otras variantes del estudio `htr-metrics-transfer` para medir el impacto de las transformaciones geométricas en CER y WER.
- Reproducción de experimentos: al fijar la semilla 42 y publicar `results.json`, permite replicar exactamente las condiciones del estudio y validar resultados de terceros.
- Digitalización de archivos manuscritos en hebreo: transcripción automática de documentos históricos o administrativos, aceptando un CER de 0,1362 como referencia de calidad.
- Evaluación de pipelines de HTR: usar este modelo como *baseline* contra el que medir modelos más grandes o con modelo de lenguaje en la decodificación.
- Extracción de texto para indexación y búsqueda: alimentar motores de búsqueda documental sobre corpus manuscritos en hebreo, con revisión humana posterior dado el nivel de error.
- Docencia y formación: ejemplo compacto (22,4 M de parámetros, 0,1 GB) para ilustrar el entrenamiento y evaluación de sistemas CTC en reconocimiento de escritura.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son los del conjunto HHD Option-B, con decodificación *greedy* y sin modelo de lenguaje:

| Metrica | Valor |
|---|---|
| CER (Character Error Rate) | 0,1362 |
| WER (Word Error Rate) | 0,5334 |
| Conjunto de evaluacion | HHD Option-B test |
| Decodificacion | greedy, sin LM |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no son aplicables a un modelo de HTR.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 22,4 M de parámetros en fp32 el modelo ocupa aproximadamente 90 MB, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 son sobredimensionadas para este modelo.
- Cabe en GPU consumer y también en CPU para inferencia por lotes de tamaño moderado.
- Opciones de despliegue: al ser un modelo de HTR con pesos safetensors, requiere un *runtime* compatible con la arquitectura subyacente (no especificada); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Las alternativas naturales serían otras variantes del mismo estudio (`trocrsmall` con otros aumentos y semillas) o modelos HTR para hebreo de otros autores, pero no se aportan datos de parámetros, contexto ni rendimiento de esos modelos en la información disponible.

| Modelo | Parametros | Contexto | CER | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cyttic/hmt-trocrsmall-geom1-s42 | 22.421.004 | no disponible | 0,1362 | MIT | HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en hebreo manuscrito; no es utilizable para otros idiomas ni para texto impreso sin validación previa.
- El WER de 0,5334 es elevado: más de la mitad de las palabras presentan algún error en el conjunto de evaluación, lo que limita su uso directo en producción sin revisión humana.
- La decodificación es *greedy* y sin modelo de lenguaje, lo que penaliza la coherencia léxica frente a sistemas con LM; los resultados podrían mejorar con beam search o un LM externo, pero no se documenta.
- No se detallan sesgos conocidos ni el dominio de los datos de entrenamiento (época, tipo de escritura, calidad de escaneo), lo que impide estimar su robustez fuera del conjunto HHD.
- Riesgo de alucinación léxica inherente a los sistemas CTC: el modelo puede producir caracteres o palabras plausibles pero incorrectos en regiones ambiguas de la imagen.
- Aunque la licencia MIT permite uso comercial, la ausencia de documentación sobre la procedencia de los datos de entrenamiento implica un riesgo legal no evaluado para despliegues comerciales.
- No se especifican requisitos de preprocesado de imagen (resolución, normalización, segmentación de líneas), lo que dificulta la integración directa en pipelines.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cyttic/hmt-trocrsmall-geom1-s42
- Dataset de entrenamiento: https://huggingface.co/datasets/cyttic/hhd-optionb-split
- Resultados del estudio: `results.json` (referenciado en la model card, sin URL directa disponible)
- Paper, blog, repositorio o demo: no disponibles en la información proporcionada.
