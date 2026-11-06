# cyttic/hmt-trocrscratch-photo2-s42

## Resumen

`cyttic/hmt-trocrscratch-photo2-s42` es un modelo de reconocimiento de texto manuscrito (HTR, *handwritten text recognition*) desarrollado por el usuario `cyttic` como parte de un estudio de aumento de datos (*augmentation study*) denominado `htr-metrics-transfer`. Se trata de un modelo basado en la arquitectura TrOCR (Transformer de visión-lenguaje para OCR) entrenado desde cero (`scratch`) sobre un conjunto de datos de escritura manuscrita en hebreo, con una variante de aumento de imagen etiquetada como `photo2` y semilla de entrenamiento 42.

El modelo tiene 22.421.004 parámetros y se distribuye en formato `safetensors` con un tamaño de repositorio de 0,1 GB. Está especializado en una única tarea: la transcripción de texto manuscrito en hebreo mediante decodificación CTC (*Connectionist Temporal Classification*) con decodificación greedy y sin modelo de lenguaje. Su relevancia es acotada: se trata de un artefacto de investigación reproducible (semilla fija, configuración de aumento concreta) orientado a medir la transferencia de métricas entre distintas condiciones de aumento de datos, no un modelo de propósito general.

La licencia MIT permite uso comercial y modificación, pero el rendimiento reportado por el autor es bajo (CER 0,3811 y WER 0,9713 sobre el test HHD Option-B), lo que lo sitúa como una pieza de un estudio comparativo más que como una herramienta lista para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TrOCR (Transformer encoder-decoder vision-lenguaje) entrenado desde cero |
| Parametros totales | 22.421.004 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | hebreo (he) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura TrOCR, un transformer de visión-lenguaje que combina un codificador de imágenes con un decodificador de texto. En este caso se ha entrenado desde cero (`trocrscratch`), sin partir de pesos preentrenados, lo que explica en parte el rendimiento limitado reportado. La decodificación es CTC con estrategia greedy y sin modelo de lenguaje externo, según indica la model card.

El entrenamiento se realizó sobre el split de entrenamiento de `cyttic/hhd-optionb-split`, excluyendo los escritores (*writers*) que componen el conjunto de desarrollo. La condición de aumento aplicada es `photo2`, y la semilla fija es 42, lo que hace el experimento reproducible. No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo fases de RLHF o DPO (poco probables en una tarea HTR). La evaluación se realizó sobre el test HHD Option-B con decodificación greedy y sin modelo de lenguaje.

## Capacidades

- Reconocimiento de texto manuscrito (HTR) en hebreo: transcripción de imágenes de escritura a mano a texto digital.
- Decodificación CTC greedy: genera la secuencia de caracteres directamente desde las predicciones del modelo, sin corrección posterior por modelo de lenguaje.
- Entrenamiento desde cero: no depende de pesos preentrenados de terceros para su funcionamiento.
- Reproducibilidad experimental: semilla fija (42) y configuración de aumento (`photo2`) documentadas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo *thinking*, visión general, audio ni otras capacidades multimodales más allá de la lectura de imágenes de texto manuscrito.
- Capacidad multilingüe: limitada al hebreo según la model card.

## Casos de uso

- Investigación en HTR: servir como punto de comparación en estudios de transferencia de métricas entre condiciones de aumento de datos, dado que la configuración (semilla, aumento, split) está fijada y es reproducible.
- Digitalización de archivos manuscritos en hebreo con revisión humana: el modelo puede pretranscribir documentos y un corrector humano valida la salida, aceptable dado el CER de 0,3811 en el test reportado.
- Generación de líneas base (*baselines*) para nuevos modelos HTR: al estar entrenado desde cero, permite aislar la contribución de los pesos preentrenados en experimentos posteriores.
- Estudio de robustez frente a aumentos fotográficos: la variante `photo2` permite analizar cómo afectan las transformaciones de imagen a la calidad de transcripción.
- Prototipado académico de pipelines CTC sin modelo de lenguaje: útil para medir el impacto de añadir un LM en etapas posteriores del mismo estudio.
- Reproducción de experimentos: investigadores pueden reentrenar o evaluar el modelo con la misma semilla y split para verificar resultados publicados en `results.json`.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son los del autor sobre el test HHD Option-B, con decodificación greedy y sin modelo de lenguaje:

| Metrica | Valor |
|---|---|
| CER (Character Error Rate) | 0,3811 |
| WER (Word Error Rate) | 0,9713 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones numéricas con modelos similares dentro del mismo estudio.

## Requisitos de hardware

- VRAM estimada para inferencia: con 22,4 M de parámetros, el modelo en fp32 ocupa aproximadamente 90 MB; en fp16, unos 45 MB. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente; no requiere A100 ni H100. Una GTX 1650, RTX 3060 o incluso CPU son viables.
- Cabe en GPU consumer: sí, en todas las gamas actuales, incluidas integradas con suficiente memoria compartida.
- Opciones de despliegue: carga directa con `transformers` (formato safetensors); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y al no ser un modelo de lenguaje generativo estas herramientas no son directamente aplicables.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, la latencia por imagen debería ser de milisegundos en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de datos numéricos de modelos comparables dentro de la información proporcionada. Como referencia cualitativa de la misma familia:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| cyttic/hmt-trocrscratch-photo2-s42 | 22,4 M | no disponible | MIT | Hugging Face |
| TrOCR (variantes oficiales de Microsoft) | no disponible en esta ficha | no disponible | no disponible | Hugging Face |
| Otros modelos del estudio `cyttic` (misma familia hmt-*) | no disponible | no disponible | MIT (presumible) | Hugging Face |

No se han publicado en la información disponible comparaciones de rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Rendimiento bajo en la tarea objetivo: CER de 0,3811 y WER de 0,9713 indican que casi una de cada tres letras y prácticamente todas las palabras se transcriben con error en el test reportado.
- Ausencia de modelo de lenguaje: la decodificación greedy CTC sin LM limita la corrección de errores sistemáticos.
- Entrenamiento desde cero: al no partir de pesos preentrenados, la calidad es inferior a la de modelos TrOCR preentrenados y ajustados.
- Idioma único: solo hebreo; no se documenta soporte para otras lenguas ni para escritura impresa.
- Sesgos conocidos: no documentados en la información disponible, pero al entrenarse sobre un conjunto concreto de escritores, es probable un sesgo hacia sus estilos caligráficos.
- Riesgo de alucinación: en HTR, el modelo puede generar caracteres o palabras no presentes en la imagen, especialmente con entradas fuera de distribución.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías de idoneidad; el bajo rendimiento desaconseja su uso en producción sin revisión humana.
- Artefacto de investigación: la model card lo describe explícitamente como parte de un estudio de aumento de datos, no como un modelo final.

## Enlaces

- Hugging Face: https://huggingface.co/cyttic/hmt-trocrscratch-photo2-s42
- Dataset de entrenamiento: https://huggingface.co/datasets/cyttic/hhd-optionb-split (referenciado en la model card)
- `results.json`: no se proporciona URL directa en la información disponible; se indica que los detalles están en dicho archivo dentro del repositorio o del estudio.
