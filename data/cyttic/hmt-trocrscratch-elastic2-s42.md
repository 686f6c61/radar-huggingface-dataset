# cyttic/hmt-trocrscratch-elastic2-s42

## Resumen

El modelo `cyttic/hmt-trocrscratch-elastic2-s42` es un modelo de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) desarrollado por el grupo cyttic. Se trata de una variante de TrOCR entrenada desde cero (*scratch*) sobre un conjunto de datos propio denominado `cyttic/hhd-optionb-split`, y forma parte de un estudio de aumentación de datos (`htr-metrics-transfer`) en el que se evalúa el efecto de distintas estrategias de *augmentation* sobre el rendimiento final. En este caso concreto, la variante corresponde a la aumentación `elastic2` con semilla 42.

Con 22,4 millones de parámetros, es un modelo compacto orientado a una única tarea: transcribir líneas de texto manuscrito en hebreo. La arquitectura sigue el esquema encoder-decoder de TrOCR (ViT como encoder y un decoder Transformer), aunque el autor indica que se entrenó desde cero en lugar de partir de pesos preentrenados. La decodificación empleada en la evaluación es greedy, sin modelo de lenguaje auxiliar, lo que se traduce en un CER de 0,2533 y un WER de 0,8206 sobre el conjunto de test HHD Option-B.

Su relevancia es fundamentalmente de investigación: no es un modelo de propósito general ni un asistente conversacional, sino un artefacto experimental que documenta el impacto de una técnica de aumentación concreta en una tarea de HTR sobre hebreo. Resulta útil para quienes trabajan en reconocimiento de escritura manuscrita, en evaluación de estrategias de aumentación o en el estudio comparativo de variantes de TrOCR para lenguas con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TrOCR (encoder ViT + decoder Transformer), entrenado desde cero |
| Parametros totales | 22.421.004 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hebreo (he) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura TrOCR, un esquema encoder-decoder en el que un encoder visual de tipo Vision Transformer procesa la imagen de la línea de texto manuscrito y un decoder autorregresivo genera la secuencia de caracteres correspondiente. A diferencia del TrOCR estándar, que parte de pesos preentrenados en imagen y texto, esta variante se entrenó desde cero (*scratch*), lo que implica que tanto el encoder como el decoder se inicializaron aleatoriamente y se ajustaron únicamente con los datos de la tarea.

El entrenamiento se realizó sobre la partición de *train* de `cyttic/hhd-optionb-split`, excluyendo los escritores reservados para el conjunto de desarrollo. La variante corresponde a la aumentación `elastic2` con semilla 42, dentro de un estudio sistemático de aumentación (`htr-metrics-transfer`) cuyo objetivo es medir la transferencia de métricas entre configuraciones. La evaluación se hizo con decodificación greedy y sin modelo de lenguaje, sobre el conjunto de test HHD Option-B. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de RLHF o DPO, que en cualquier caso no resultan habituales en tareas de HTR.

## Capacidades

- Reconocimiento de texto manuscrito (HTR) en hebreo a nivel de línea.
- Transcripción de imágenes de texto manuscrito a secuencia de caracteres mediante decodificación CTC (etiqueta `ctc` en el modelo).
- Entrenamiento y evaluación orientados a la investigación en aumentación de datos.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo *thinking*, visión general, audio ni otras capacidades multimodales más allá del reconocimiento de escritura.
- Capacidad multilingüe limitada al hebreo según la model card.

## Casos de uso

- Investigación en aumentación de datos para HTR: sirve como punto de comparación frente a otras variantes del mismo estudio (`elastic2` frente a otras aumentaciones y semillas) para medir el impacto en CER y WER.
- Transcripción de manuscritos en hebreo en entornos controlados: puede emplearse para digitalizar líneas de texto manuscrito cuando el dominio coincide con el del dataset de entrenamiento (`hhd-optionb-split`).
- Reproducibilidad de experimentos: al estar publicado con licencia MIT y pesos en safetensors, permite replicar el resultado CER 0,2533 / WER 0,8206 con decodificación greedy y sin LM.
- Evaluación comparativa de arquitecturas TrOCR: útil para contrastar el rendimiento de un modelo entrenado desde cero frente a variantes preentrenadas en la misma tarea.
- Docencia y formación: ejemplo práctico de pipeline encoder-decoder para HTR con un modelo de solo 22,4 M de parámetros, manejable en hardware modesto.
- Estudio de transferencia de métricas: el propio nombre del proyecto (`htr-metrics-transfer`) sugiere su uso para analizar cómo se transfieren las métricas entre configuraciones de aumentación y semillas.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| CER | 0,2533 | HHD Option-B test, greedy, sin LM |
| WER | 0,8206 | HHD Option-B test, greedy, sin LM |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no son aplicables a un modelo de HTR.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para 22,4 M de parámetros; el repo ocupa 0,1 GB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente; no requiere A100 ni H100.
- Cabe holgadamente en GPU de consumo: GTX 1050, RTX 2060, RTX 3060, RTX 4090, entre otras.
- También puede ejecutarse en CPU para inferencia por lotes de líneas manuscritas.
- Opciones de despliegue: al ser un modelo TrOCR con pesos safetensors, es compatible con la librería `transformers` de HuggingFace; no se ha documentado soporte específico para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cyttic/hmt-trocrscratch-elastic2-s42 | 22,4 M | no disponible | HTR hebreo | MIT | HuggingFace |
| microsoft/trocr-base-handwritten | ~334 M | no disponible | HTR inglés | MIT | HuggingFace |
| microsoft/trocr-large-handwritten | ~558 M | no disponible | HTR inglés | MIT | HuggingFace |

La comparación directa con TrOCR de Microsoft no es estrictamente equivalente: aquellos están preentrenados y orientados a inglés, mientras que este modelo se entrena desde cero y se especializa en hebreo. No se dispone de datos de benchmarks comparables entre ambos en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental de investigación: no está pensado como producto ni como servicio listo para producción.
- Rendimiento limitado: un WER de 0,8206 indica una tasa de error muy alta a nivel de palabra, aunque el CER de 0,2533 es más moderado a nivel de carácter.
- Entrenado exclusivamente en hebreo: no se espera un comportamiento correcto en otros idiomas.
- Entrenado desde cero sobre un dataset concreto (`hhd-optionb-split`): probablemente generaliza mal fuera del dominio y de los escritores de ese corpus.
- Sin modelo de lenguaje en decodificación: la evaluación se realizó con greedy y sin LM, lo que limita la corrección de errores contextuales.
- Riesgo de alucinación: en HTR se manifiesta como sustituciones, omisiones o inserciones de caracteres, especialmente en pasajes ambiguos.
- Sesgos: no documentados, pero al depender de un corpus concreto puede heredar sesgos de escritura, estilo o vocabulario de ese dataset.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Sin datos de cuantización ni de contexto: no se puede planificar un despliegue en producción sin validación adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cyttic/hmt-trocrscratch-elastic2-s42
- Dataset de entrenamiento: https://huggingface.co/datasets/cyttic/hhd-optionb-split
- Resultados detallados: `results.json` (referenciado en la model card, no se proporciona URL directa)
- Proyecto de investigación: `htr-metrics-transfer` (referenciado en la model card, sin URL directa)
