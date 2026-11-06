# cyttic/hmt-trocrscratchreg-elastic2-s42

## Resumen

El modelo `cyttic/hmt-trocrscratchreg-elastic2-s42` es un modelo de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) desarrollado por el grupo CYTTIC, orientado a la transcripción de documentos manuscritos en hebreo. Se trata de un modelo de aproximadamente 22,4 millones de parámetros, lo que lo sitúa en la categoría de modelos ligeros, y se distribuye en formato safetensors con licencia MIT.

El modelo forma parte de un estudio de aumento de datos (*augmentation study*) denominado `htr-metrics-transfer`, en el que se evalúa el impacto de distintas estrategias de aumento sobre el rendimiento en HTR. En concreto, esta variante corresponde a la configuración `trocrscratchreg` con aumento `elastic2` y semilla 42, entrenada sobre el conjunto `cyttic/hhd-optionb-split` (partición de entrenamiento excluyendo los escritores de validación).

La relevancia de esta ficha radica en que documenta una variante experimental concreta dentro de una línea de investigación, con métricas de referencia claras (CER 0,3596 y WER 0,9876 sobre el test HHD Option-B con decodificación greedy y sin modelo de lenguaje). Es un modelo especializado, no un modelo de propósito general, y su interés principal es académico y de reproducibilidad de experimentos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como `trocrscratchreg`, familia TrOCR) |
| Parámetros totales | 22.421.004 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | hebreo (he) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se etiqueta como `trocrscratchreg`, lo que sugiere una variante de la familia TrOCR (Transformer *encoder-decoder* para reconocimiento óptico de caracteres) entrenada desde cero (*scratch*) con regularización. No se dispone en la información proporcionada de detalles adicionales sobre la configuración exacta de capas, dimensiones ocultas o mecanismo de atención.

El entrenamiento se realizó sobre el conjunto `cyttic/hhd-optionb-split`, en su partición de entrenamiento excluyendo los escritores reservados para validación. La variante incorpora una estrategia de aumento de datos etiquetada como `elastic2`, y la semilla utilizada es 42. La evaluación se realizó sobre el test HHD Option-B con decodificación greedy y sin modelo de lenguaje. No se especifica el número de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO, algo poco habitual en tareas HTR.

## Capacidades

- Reconocimiento de texto manuscrito en hebreo (transcripción de imágenes de texto escrito a mano a texto digital).
- Decodificación CTC (etiqueta `ctc` en la model card), orientada a alineamiento secuencial carácter a carácter.
- Entrenamiento específico para HTR, no para generación de texto libre ni para tareas generales de NLP.
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- Capacidad multilingüe limitada al hebreo según los metadatos del modelo.
- No se documentan capacidades de visión general, audio ni modo de razonamiento (*thinking mode*).

## Casos de uso

- Digitalización de archivos manuscritos en hebreo: el modelo puede transcribir imágenes de documentos históricos o administrativos a texto plano, facilitando su indexación y búsqueda. Es adecuado por su especialización en HTR hebreo, aunque con las limitaciones de precisión indicadas por sus métricas.
- Investigación en aumento de datos para HTR: sirve como punto de comparación reproducible (semilla 42, aumento `elastic2`) frente a otras variantes del estudio `htr-metrics-transfer` para medir el efecto del aumento en CER y WER.
- Reproducción de experimentos académicos: al estar publicado con licencia MIT y pesos en safetensors, permite replicar el pipeline de evaluación sobre el test HHD Option-B.
- Prototipado de sistemas de transcripción asistida: puede integrarse como componente inicial en herramientas de transcripción que luego apliquen corrección humana o un modelo de lenguaje para reducir el WER.
- Análisis de manuscritos con vocabulario controlado: en escenarios donde el léxico es limitado y predecible, el modelo puede aportar transcripciones útiles pese a su WER elevado.
- Evaluación comparativa de arquitecturas ligeras de HTR: con 22,4 M de parámetros, es un candidato para estudiar el equilibrio entre tamaño y precisión en entornos con recursos limitados.

## Benchmarks y rendimiento

| Benchmark | Métrica | Resultado |
|---|---|---|
| HHD Option-B test (greedy, sin LM) | CER | 0,3596 |
| HHD Option-B test (greedy, sin LM) | WER | 0,9876 |

No se han publicado en la información disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros), dado que se trata de un modelo especializado en HTR y no de propósito general.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, en torno a 0,1 GB en precisión completa (22,4 M de parámetros), y menos aún con cuantización a 8 o 4 bits.
- GPU recomendadas: cualquier GPU moderna es suficiente; no se requiere A100 ni H100. Una RTX 4090, RTX 3090 o incluso una GPU de gama media como RTX 3060 sobran para este modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo con al menos 1-2 GB de VRAM, e incluso podría ejecutarse en CPU con latencias aceptables.
- Opciones de despliegue: al ser un modelo de la familia TrOCR con pesos safetensors, es compatible con bibliotecas de Hugging Face Transformers; no se documenta soporte específico para vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos sobre modelos comparables de la misma categoría (HTR en hebreo) ni de sus métricas, por lo que la comparativa cuantitativa no está disponible. Como referencia cualitativa, este modelo se sitúa en la categoría de HTR especializado en hebreo con arquitectura ligera basada en TrOCR, pero no se pueden aportar cifras de alternativas sin inventar datos.

## Limitaciones y advertencias

- Rendimiento limitado: un CER de 0,3596 y un WER de 0,9876 indican una tasa de error muy alta, especialmente a nivel de palabra; el modelo no es adecuado para producción sin corrección posterior o un modelo de lenguaje.
- Sesgos conocidos: no documentados en la información disponible; al entrenarse sobre un conjunto específico de escritores, puede generalizar mal a escritores no representados.
- Riesgo de alucinación: en HTR el riesgo se manifiesta como sustituciones o inserciones de caracteres, no como generación libre; aun así, la decodificación greedy sin LM puede producir transcripciones incorrectas con seguridad alta.
- Limitaciones de idioma: el modelo está entrenado únicamente para hebreo; no debe esperarse buen rendimiento en otros alfabetos o idiomas.
- Restricciones de licencia: licencia MIT, que permite uso comercial y modificación con atribución; no obstante, conviene revisar las condiciones del conjunto de datos de entrenamiento original.
- Caveats para producción: al ser una variante experimental de un estudio de aumento, no se documenta su robustez fuera del test HHD Option-B; se recomienda validación adicional antes de cualquier uso real.

## Enlaces

- [Hugging Face: cyttic/hmt-trocrscratchreg-elastic2-s42](https://huggingface.co/cyttic/hmt-trocrscratchreg-elastic2-s42)
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información disponible.
