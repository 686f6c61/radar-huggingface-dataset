# cyttic/hmt-trocrscratchstem-geom2-s42

## Resumen

`cyttic/hmt-trocrscratchstem-geom2-s42` es un modelo de reconocimiento de texto manuscrito (HTR, *handwritten text recognition*) desarrollado por el grupo cyttic dentro de un estudio de aumento de datos denominado `htr-metrics-transfer`. El modelo se presenta como una variante del componente `trocrscratchstem` (una adaptación de TrOCR entrenada desde cero con inicialización de *stem*), combinada con la estrategia de aumento `geom2` y la semilla 42. Su propósito es servir como punto de comparación reproducible dentro de un experimento sobre transferencia de métricas en HTR, más que como un modelo de producción generalista.

Con 24.928.588 parámetros y un tamaño de repositorio de 0,1 GB, se trata de un modelo compacto orientado a una única tarea: la transcripción de texto manuscrito en hebreo (`he`). Emplea una arquitectura de reconocimiento con decodificación CTC y decodificación voraz (*greedy*) sin modelo de lenguaje externo, lo que simplifica el despliegue pero limita el post-procesado lingüístico. En el conjunto de test HHD Option-B reporta un CER de 0,0604 y un WER de 0,2785.

Su relevancia es fundamentalmente metodológica: permite a investigadores reproducir y auditar el efecto del aumento geométrico (`geom2`) sobre el rendimiento de un TrOCR entrenado desde cero, con una licencia MIT que facilita la reutilización y la comparación con otras variantes del mismo estudio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo TrOCR (encoder-decoder) con decodificación CTC, entrenado desde cero con inicialización de stem (`trocrscratchstem`) |
| Parametros totales | 24.928.588 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la familia TrOCR, un transformer encoder-decoder para reconocimiento óptico de caracteres manuscritos, pero en esta variante se entrena "from scratch" con una inicialización de *stem* (`trocrscratchstem`), es decir, sin partir de pesos preentrenados de un modelo de lenguaje o visión de gran escala. La cabeza de salida utiliza decodificación CTC, lo que permite alineamientos sin necesidad de un decoder autorregresivo explícito y simplifica la inferencia con decodificación voraz.

El entrenamiento se realizó sobre el split de entrenamiento de `cyttic/hhd-optionb-split`, excluyendo los escritores del conjunto de desarrollo, con la estrategia de aumento `geom2` y semilla 42. No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO (poco probables en una tarea HTR). La evaluación se realizó sobre el test HHD Option-B con decodificación greedy y sin modelo de lenguaje, obteniendo CER 0,0604 y WER 0,2785; los detalles completos se remiten a `results.json` en el repositorio.

## Capacidades

- Reconocimiento de texto manuscrito (HTR) en hebreo sobre imágenes de líneas o palabras.
- Decodificación CTC con salida directa de secuencia de caracteres.
- Decodificación voraz (*greedy*) sin modelo de lenguaje externo.
- Entrenamiento desde cero con inicialización de stem, orientado a estudios de ablación.
- Aumento de datos geométrico (`geom2`) integrado en el pipeline de entrenamiento.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión general, audio ni modo *thinking*.
- Multilingüe: no; únicamente hebreo según la model card.

## Casos de uso

- Investigación en HTR: servir como baseline reproducible para medir el efecto del aumento `geom2` frente a otras estrategias de aumento en la misma arquitectura y dataset.
- Transcripción de documentos manuscritos en hebreo: digitalización de archivos históricos o manuscritos con un modelo compacto de 24,9 M de parámetros y licencia MIT.
- Evaluación comparativa de métricas CER/WER: reproducción del experimento `htr-metrics-transfer` con la semilla 42 para validar la transferibilidad de métricas entre variantes.
- Prototipado de pipelines OCR ligeros: al ocupar 0,1 GB, puede integrarse en entornos con recursos limitados para pruebas de concepto de transcripción en hebreo.
- Generación de datos sintéticos o aumentados: el modelo puede emplearse como referencia para estudiar el impacto del aumento geométrico en la calidad de transcripción.
- Auditoría de licencias y reproducibilidad: al ser MIT y con pesos en safetensors, facilita la inspección y reutilización en entornos académicos y comerciales.

## Benchmarks y rendimiento

| Benchmark | Métrica | Resultado |
|---|---|---|
| HHD Option-B test (greedy, sin LM) | CER | 0,0604 |
| HHD Option-B test (greedy, sin LM) | WER | 0,2785 |

No se han publicado en la información disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) al tratarse de una tarea HTR específica.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para 24,9 M de parámetros; en la práctica, unos pocos cientos de MB incluyendo buffers de imagen.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es suficiente; también cabe en CPU para inferencia por lotes pequeños.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con al menos 1-2 GB de VRAM.
- Opciones de despliegue: al no documentarse variantes GGUF, el despliegue estándar sería mediante PyTorch/Transformers con pesos safetensors; no se confirma soporte en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cyttic/hmt-trocrscratchstem-geom2-s42 | 24,9 M | no disponible | HTR hebreo | MIT | Hugging Face |
| TrOCR (variantes base/large de Microsoft) | 334 M / 558 M aprox. | no disponible | OCR/HTR multilingüe | MIT | Hugging Face |
| Otras variantes del estudio `htr-metrics-transfer` | no disponible | no disponible | HTR hebreo | MIT (presumible) | Hugging Face (cyttic) |

No se dispone de datos de rendimiento de los modelos comparables en la información proporcionada para establecer una comparación cuantitativa directa.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en hebreo; no soporta otros idiomas.
- Entrenado desde cero con un dataset específico (`hhd-optionb-split`), por lo que su generalización a otros dominios o estilos de escritura no está validada.
- Decodificación sin modelo de lenguaje: el WER de 0,2785 indica una tasa de error a nivel de palabra considerable, superior al CER, lo que sugiere errores en la segmentación o en palabras completas.
- Riesgo de alucinación en la transcripción: como todo modelo CTC, puede producir secuencias plausibles pero incorrectas en imágenes ambiguas o de baja calidad.
- No se documentan sesgos específicos, pero al entrenarse en un conjunto limitado de escritores, puede presentar sesgo hacia esos estilos.
- Licencia MIT: permite uso comercial, pero se recomienda citar el estudio original y verificar los términos del dataset subyacente.
- No se documentan requisitos de contexto, cuantizaciones ni soporte en frameworks de despliegue de alto rendimiento, lo que limita su uso en producción a gran escala sin trabajo adicional de ingeniería.

## Enlaces

- Hugging Face: https://huggingface.co/cyttic/hmt-trocrscratchstem-geom2-s42
- Dataset de entrenamiento: https://huggingface.co/datasets/cyttic/hhd-optionb-split
- Resultados detallados: `results.json` en el repositorio del modelo (no se proporciona URL directa)
- Estudio `htr-metrics-transfer`: no disponible
- Paper o blog del autor: no disponible
