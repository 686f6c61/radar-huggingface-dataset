# cyttic/hmt-trocrctc-photo2-s42

## Resumen

`cyttic/hmt-trocrctc-photo2-s42` es un modelo de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) en hebreo, desarrollado por el grupo cyttic dentro de un estudio de aumento de datos (*augmentation study*) denominado `htr-metrics-transfer`, oleada 1. El modelo combina una arquitectura TrOCR con una cabeza de clasificación CTC (Connectionist Temporal Classification), de ahí el sufijo `trocrctc`, y se ha entrenado con la variante de aumento `photo2` y la semilla 42.

Con 87,3 millones de parámetros y un tamaño de repositorio de 0,3 GB, es un modelo compacto orientado a la transcripción de líneas o imágenes de texto manuscrito en hebreo. Su relevancia es acotada pero específica: sirve como punto de referencia reproducible para estudiar cómo el aumento de datos de tipo fotográfico afecta a las métricas de HTR, y su licencia MIT facilita la experimentación y la comparación con otras variantes de la misma familia.

No es un modelo de propósito general ni un LLM: no genera lenguaje libre, sino que transcribe secuencias de caracteres a partir de imágenes. Está pensado para investigación en HTR y para pipelines de digitalización de documentos hebreos, no para conversación ni razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TrOCR con cabeza CTC (según nombre y tags `htr`, `ctc`) |
| Parametros totales | 87.279.756 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue el patrón TrOCR, es decir, un encoder de visión transformer seguido de un decoder Transformer para la secuencia de caracteres, pero sustituyendo la decodificación autorregresiva habitual por una cabeza CTC, tal como indican el nombre `trocrctc` y el tag `ctc`. Esta combinación permite alinear directamente las características visuales con la secuencia de etiquetas sin necesidad de un decoder autoregresivo paso a paso, lo que simplifica la inferencia y evita el sesgo de exposición típico de los modelos seq2seq.

El entrenamiento se realizó sobre el split `cyttic/hhd-optionb-split`, excluyendo los escritores de desarrollo (*dev writers*), con el aumento de datos `photo2` y semilla 42. No se dispone de información sobre el número de tokens, la composición exacta del dataset, ni sobre si se aplicaron técnicas de RLHF o DPO (no aplicables en un modelo HTR). La innovación principal del trabajo es metodológica: evaluar la transferencia de métricas entre variantes de aumento en HTR, con decodificación greedy y sin modelo de lenguaje.

## Capacidades

- Reconocimiento de texto manuscrito (HTR) en hebreo a partir de imágenes, con salida de secuencia de caracteres.
- Decodificación CTC greedy, sin modelo de lenguaje externo.
- Entrenado específicamente para líneas o regiones de texto manuscrito, no para documentos completos sin segmentación.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al hebreo; no se documentan otros idiomas.
- No dispone de modo *thinking*, visión general, audio ni otras capacidades multimodales más allá de la entrada de imagen para transcripción.

## Casos de uso

- Digitalización de archivos manuscritos en hebreo: el modelo transcribe líneas o regiones de texto manuscrito, adecuado para proyectos de preservación documental donde se requiere una línea base reproducible con licencia MIT.
- Estudio comparativo de aumentos de datos: al ser una variante concreta (`photo2`, semilla 42) de un estudio más amplio, sirve para medir el impacto del aumento fotográfico en CER/WER frente a otras variantes de la misma familia.
- Reproducción de experimentos en HTR: su licencia MIT y su tamaño reducido (87 M de parámetros) permiten reentrenar y comparar resultados en entornos académicos con recursos limitados.
- Pipeline de OCR/HTR para manuscritos históricos hebreos: integrable como etapa de transcripción tras un módulo de detección y segmentación de líneas.
- Evaluación de métricas de transferencia: útil para investigadores que estudien cómo se transfieren las métricas entre dominios de aumento dentro de HTR.
- Prototipado rápido en investigación: al caber en GPU de consumo y tener pesos safetensors, permite iterar rápidamente en experimentos de transcripción sin infraestructura pesada.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son los del modelo card, evaluados sobre HHD Option-B test con decodificación greedy y sin modelo de lenguaje:

| Metrica | Valor |
|---|---|
| CER | 0,1223 |
| WER | 0,4913 |

No se han publicado resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no son benchmarks aplicables a un modelo HTR.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 87,3 M de parámetros, la inferencia en fp32 requiere aproximadamente 0,35 GB solo para pesos, más overhead de activaciones; en fp16 alrededor de 0,18 GB. Cabe holgadamente en cualquier GPU de consumo.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 son más que suficientes. También es viable en CPU para lotes pequeños.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU modernas, incluidas GTX 1650 o superiores.
- Opciones de despliegue: al ser un modelo TrOCR con pesos safetensors, puede servirse con Hugging Face Transformers; no se documenta soporte específico para vLLM, llama.cpp, Ollama o TGI, que están orientados a LLMs.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de otros modelos comparables en la información proporcionada. Como referencia cualitativa, podría compararse con otras variantes de la misma familia `cyttic/hmt-trocrctc-*` (distintos aumentos y semillas) y con modelos TrOCR estándar para HTR, pero no se han facilitado sus métricas ni especificaciones, por lo que la comparación cuantitativa no está disponible.

| Modelo | Parametros | Contexto | CER | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cyttic/hmt-trocrctc-photo2-s42 | 87,3 M | no disponible | 0,1223 | MIT | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo especializado exclusivamente en hebreo manuscrito; no es válido para otros idiomas ni para texto impreso sin reentrenamiento.
- El WER de 0,4913 es elevado en términos absolutos, lo que indica una tasa considerable de errores a nivel de palabra; debe validarse en el dominio objetivo antes de usarlo en producción.
- Al decodificar con CTC greedy y sin modelo de lenguaje, no se aplica corrección contextual; esto puede aumentar errores en palabras ambiguas o poco frecuentes.
- Riesgo de alucinación limitado al ámbito de la transcripción: puede producir caracteres o palabras incorrectas, pero no genera contenido libre fuera de la imagen de entrada.
- No se documentan sesgos específicos, pero al entrenarse sobre un conjunto concreto de escritores, puede generalizar mal a estilos de escritura no representados.
- Licencia MIT: permite uso comercial y modificación, pero se recomienda citar el trabajo original y verificar los términos del dataset de entrenamiento (`cyttic/hhd-optionb-split`), que no se detallan.
- No se dispone de información sobre cuantizaciones, contexto máximo ni latencia, lo que limita la planificación de despliegues a gran escala.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyttic/hmt-trocrctc-photo2-s42
- Dataset de entrenamiento: https://huggingface.co/datasets/cyttic/hhd-optionb-split (referenciado en la model card)
- Resultados detallados: `results.json` (referenciado en la model card, no se proporciona URL directa)
- Estudio `htr-metrics-transfer`: no disponible enlace público en la información proporcionada.
