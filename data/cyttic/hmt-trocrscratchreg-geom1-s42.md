# cyttic/hmt-trocrscratchreg-geom1-s42

## Resumen

`cyttic/hmt-trocrscratchreg-geom1-s42` es un modelo de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) publicado por el grupo cyttic. Se trata de un checkpoint experimental dentro de un estudio de aumento de datos (*augmentation study*) denominado `htr-metrics-transfer`, y no de un modelo de propósito general. La variante corresponde al modelo base `trocrscratchreg` (TrOCR entrenado desde cero) con la estrategia de aumento `geom1` y la semilla 42.

El modelo resuelve la transcripción de imágenes de texto manuscrito a secuencia de caracteres mediante un cabezal CTC (*Connectionist Temporal Classification*), tal como indican sus etiquetas. Está entrenado sobre el conjunto `cyttic/hhd-optionb-split`, excluyendo los escritores del conjunto de desarrollo, y evaluado sobre el test HHD Option-B con decodificación voraz (*greedy*) y sin modelo de lenguaje. El idioma declarado es hebreo (`he`).

Con 22.421.004 parámetros y un repositorio de 0,1 GB, es un modelo compacto orientado a investigación reproducible de HTR más que a despliegue en producción. Su relevancia es acotada: sirve como punto de comparación dentro de un estudio controlado de aumentos geométricos y semillas, y sus métricas (CER 0,2383 y WER 0,8121) deben interpretarse en ese contexto experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TrOCR entrenado desde cero (`trocrscratchreg`) con cabezal CTC |
| Parametros totales | 22.421.004 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la familia TrOCR, es decir, un codificador de visión transformer acoplado a un decodificador transformer de texto, pero en esta variante se entrena *desde cero* (de ahí el sufijo `scratch`) y se emplea un cabezal CTC para la alineación secuencia-a-secuencia, según las etiquetas `htr` y `ctc` de la model card. No se dispone de detalles sobre la configuración exacta de capas, dimensiones ocultas ni resolución de entrada en la información proporcionada.

El entrenamiento se realizó sobre el split de entrenamiento de `cyttic/hhd-optionb-split` menos los escritores del conjunto de desarrollo, aplicando el aumento `geom1` con semilla 42. La evaluación se hizo sobre el test HHD Option-B con decodificación voraz y sin modelo de lenguaje externo. No se indica el número de tokens, la composición del dataset ni si hubo etapas de RLHF o DPO; en HTR estos procesos no son habituales. El autor remite a `results.json` para los detalles del estudio.

## Capacidades

- Reconocimiento de texto manuscrito (HTR) sobre imágenes, con salida de secuencia de caracteres mediante CTC.
- Transcripción en hebreo (`he`), idioma único declarado.
- Decodificación voraz sin modelo de lenguaje, lo que simplifica el pipeline pero limita la corrección lingüística.
- No se declara soporte de *tool calling*, *function calling* ni uso como agente.
- No se declara *thinking mode*, visión general, audio ni capacidades multimodales más allá de la entrada de imagen para HTR.
- No se declara soporte multilingüe más allá del hebreo.

## Casos de uso

- Investigación reproducible en HTR: el checkpoint permite replicar el experimento `geom1` con semilla 42 y comparar contra otras variantes del estudio `htr-metrics-transfer`.
- Ablación de aumentos geométricos: sirve como referencia para medir el efecto de `geom1` frente a otras estrategias de aumento sobre el mismo split.
- Digitalización de manuscritos en hebreo: puede emplearse para transcribir documentos históricos o formularios manuscritos en hebreo, aceptando un CER de 0,2383 como cota de calidad.
- Evaluación de pipelines CTC: útil para probar decodificadores, post-procesado o modelos de lenguaje sobre salidas CTC en hebreo.
- Baseline en competiciones o benchmarks internos de HTR: al ser un modelo pequeño (22,4 M de parámetros) y con licencia MIT, es fácil de integrar como línea base.
- Docencia y prototipado: su tamaño reducido (0,1 GB) permite experimentar en entornos con recursos limitados, aunque la calidad final esté lejos de producción.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| CER | 0,2383 | Test HHD Option-B, greedy, sin LM |
| WER | 0,8121 | Test HHD Option-B, greedy, sin LM |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a un modelo de HTR.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 22,4 M de parámetros en fp32 el peso ronda los 90 MB, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; no se requiere A100 ni H100.
- Cabe en GPU consumer: sí, en RTX 3060, RTX 4090 y similares, e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: no se especifican; al ser safetensors, requiere cargar con la librería correspondiente (probablemente Transformers) o exportar a otro formato.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CER (test indicado) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cyttic/hmt-trocrscratchreg-geom1-s42 | 22,4 M | no disponible | 0,2383 | MIT | HuggingFace |
| Otras variantes del estudio `htr-metrics-transfer` | no disponible | no disponible | no disponible | MIT (presumible) | no disponible |
| TrOCR base (Microsoft) | no disponible en esta ficha | no disponible | no disponible | MIT | HuggingFace |

No se dispone de datos comparativos suficientes en la información proporcionada para establecer una comparativa rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo experimental de investigación: no está pensado para producción y su rendimiento (CER 0,2383, WER 0,8121) es alto en errores para muchas aplicaciones reales.
- Evaluación sin modelo de lenguaje: el WER de 0,8121 indica que la salida a nivel de palabra es muy ruidosa; añadir un LM podría mejorar, pero no se ha evaluado aquí.
- Idioma único: solo hebreo; no se garantiza comportamiento en otros idiomas.
- Sesgos: no se documentan sesgos conocidos, pero al entrenarse sobre un conjunto concreto de escritores, puede generalizar mal a escritores no vistos.
- Riesgo de alucinación: en HTR el riesgo se manifiesta como sustituciones, omisiones e inserciones de caracteres, no como fabricación de contenido libre.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Sin datos de cuantización ni de despliegue: requiere trabajo adicional para integrarlo en un pipeline de producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cyttic/hmt-trocrscratchreg-geom1-s42
- Dataset de entrenamiento: https://huggingface.co/datasets/cyttic/hhd-optionb-split
- Resultados del estudio: `results.json` en el repositorio del modelo (referenciado en la model card)
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información disponible.
