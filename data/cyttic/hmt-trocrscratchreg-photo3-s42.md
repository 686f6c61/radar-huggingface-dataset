# cyttic/hmt-trocrscratchreg-photo3-s42

## Resumen

`cyttic/hmt-trocrscratchreg-photo3-s42` es un modelo de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) desarrollado por el grupo cyttic, entrenado sobre el conjunto de datos `cyttic/hhd-optionb-split` y pensado para idioma hebreo (`he`). Se trata de un checkpoint concreto dentro de un estudio de aumento de datos (*augmentation study*) denominado `htr-metrics-transfer`, en el que se varía la estrategia de augmentación y la semilla para medir su transferencia sobre métricas de reconocimiento. Este modelo corresponde a la variante `trocrscratchreg` con augmentación `photo3` y semilla 42.

El modelo parte de la familia TrOCR (Transformer OCR) en su variante `scratchreg`, es decir, entrenada desde cero y con regularización, y se infiere con decodificación voraz (*greedy*) sin modelo de lenguaje. Su tamaño es reducido: 22.421.004 parámetros en formato safetensors, con un repositorio de 0,1 GB, lo que lo hace manejable en hardware modesto. El pipeline declarado no está disponible en la información proporcionada.

La relevancia de este checkpoint es fundamentalmente metodológica: forma parte de una serie de experimentos que comparan distintas augmentaciones (en este caso `photo3`) sobre una misma arquitectura y conjunto de datos, con el objetivo de evaluar cómo se transfieren las mejoras en métricas de HTR. Sus resultados en el conjunto de test HHD Option-B son CER 0,5381 y WER 1,1341, valores notablemente altos que deben interpretarse en el contexto del estudio comparativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TrOCR (variante `scratchreg`), transformer encoder-decoder para OCR/HTR |
| Parametros totales | 22.421.004 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors) |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo pertenece a la familia TrOCR, un transformer encoder-decoder diseñado para reconocimiento óptico de caracteres, en su variante `scratchreg` (entrenamiento desde cero con regularización). La inferencia declarada por el autor es decodificación voraz (*greedy*) sin modelo de lenguaje externo, lo que implica que la salida se genera token a token sin rescoring lingüístico. No se dispone de información sobre el número de tokens de entrenamiento ni sobre la composición detallada del dataset más allá de que se empleó `cyttic/hhd-optionb-split` menos los escritores de dev.

El entrenamiento forma parte del estudio `htr-metrics-transfer`, en el que se aplica una augmentación concreta (`photo3`) con semilla 42 sobre el split de entrenamiento. El objetivo del estudio es medir la transferencia de mejoras en métricas HTR entre distintos regímenes de augmentación. No se especifica si hubo RLHF, DPO ni otras etapas de alineación, algo poco habitual en modelos HTR.

## Capacidades

- Reconocimiento de texto manuscrito (HTR) en hebreo.
- Transcripción de imágenes de texto a secuencia de caracteres mediante decodificación CTC/greedy.
- Entrenado específicamente sobre un split concreto (`hhd-optionb-split`), por lo que su dominio está acotado a ese corpus.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- No se declara capacidad multilingüe más allá del hebreo.
- No se declara modo *thinking*, visión general, audio ni otras capacidades especiales.

## Casos de uso

- Investigación en HTR: servir como checkpoint de referencia dentro del estudio `htr-metrics-transfer` para comparar el efecto de la augmentación `photo3` frente a otras variantes (`geom3`, etc.) sobre las mismas métricas CER/WER.
- Reproducibilidad experimental: al fijar semilla 42 y augmentación `photo3`, permite reproducir exactamente los resultados publicados en `results.json` y validar la metodología del estudio.
- Transcripción de manuscritos hebreos en dominios acotados: útil para procesar documentos similares al corpus `hhd-optionb-split`, siempre que se acepten las tasas de error reportadas.
- Baseline para fine-tuning: punto de partida para ajustar sobre un corpus hebreo específico con mayor volumen o distinta distribución.
- Evaluación de pipelines sin LM: permite medir el rendimiento puro del modelo acústico-visual sin rescoring lingüístico, útil para aislar el efecto del modelo de lenguaje en sistemas completos.
- Docencia y experimentación: modelo pequeño (22,4 M de parámetros, 0,1 GB) adecuado para prácticas de HTR en entornos con recursos limitados.

## Benchmarks y rendimiento

Resultados reportados por el autor en el conjunto de test HHD Option-B, decodificación greedy sin LM:

| Metrica | Valor |
|---|---|
| CER | 0,5381 |
| WER | 1,1341 |

No se han publicado en la información disponible resultados comparativos con otros modelos en formato de tabla (MMLU, HumanEval, GSM8K u otros), dado que se trata de un modelo HTR y no de un LLM generalista.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para 22,4 M de parámetros; en la práctica, unos pocos cientos de MB incluyendo activaciones y buffers de imagen.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requiere A100 ni H100.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2 GB de VRAM (GTX 1050, RTX 3050, RTX 4090, etc.).
- Opciones de despliegue: al ser un modelo TrOCR en safetensors, puede cargarse con `transformers` (clase `VisionEncoderDecoderModel` o equivalente) y servirse con frameworks de inferencia estándar; no se dispone de información específica sobre soporte en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CER (HHD Option-B) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cyttic/hmt-trocrscratchreg-photo3-s42 | 22,4 M | no disponible | 0,5381 | MIT | Hugging Face |
| cyttic/hmt-trocrctc-geom3-s42 | no disponible | no disponible | 0,0727 | no disponible | Hugging Face |

La comparativa directa con modelos HTR de referencia (por ejemplo, TrOCR base/large de Microsoft) no está disponible en la información proporcionada. El único comparable documentado es la variante `trocrctc-geom3-s42` del mismo estudio, que reporta un CER de 0,0727 y un WER de 0,3242, muy inferiores a los de este checkpoint, lo que sugiere que la combinación `trocrctc` + `geom3` es sustancialmente más efectiva que `trocrscratchreg` + `photo3` en este corpus.

## Limitaciones y advertencias

- Tasas de error elevadas: CER 0,5381 y WER 1,1341 en el conjunto de test reportado, lo que limita su uso en producción sin revisión humana.
- Dominio muy acotado: entrenado sobre `hhd-optionb-split` menos los escritores de dev, por lo que la generalización a otros corpus o escritores es incierta.
- Monolingüe: solo hebreo (`he`); no se declara soporte para otros idiomas.
- Sin modelo de lenguaje: la decodificación greedy sin LM puede producir salidas lingüísticamente incoherentes.
- Sesgos conocidos: no disponibles en la información proporcionada; al entrenarse sobre un corpus concreto, puede heredar sesgos de escritura, estilo o demografía de los escritores incluidos.
- Riesgo de alucinación: en HTR, el equivalente es la generación de caracteres o palabras no presentes en la imagen; no se documenta su magnitud.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en dominios distintos del corpus de entrenamiento.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni evidencia de uso en producción.
- Fecha de creación futura (2026-11-06): conviene verificar la integridad y procedencia del repositorio antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyttic/hmt-trocrscratchreg-photo3-s42
- Variante comparable del mismo estudio: https://huggingface.co/cyttic/hmt-trocrctc-geom3-s42
