# cyttic/hmt-trocrscratchline-stroke4-s42

## Resumen
El modelo `cyttic/hmt-trocrscratchline-stroke4-s42` es un modelo de reconocimiento de texto manuscrito (HTR, Handwritten Text Recognition) publicado por el usuario cyttic en Hugging Face. Se trata de una variante concreta dentro de un estudio de aumento de datos (augmentation study) denominado htr-metrics-transfer, en el que se entrena el modelo base `trocrscratchline` con una configuración de aumento llamada `stroke4` y una semilla fija de 42. El modelo está pensado exclusivamente para hebreo (`he`) y emplea una cabeza CTC sobre una arquitectura tipo TrOCR entrenada desde cero.

Con 22.421.004 parámetros y un tamaño de repositorio de 0,1 GB, es un modelo muy ligero, adecuado para despliegues en entornos con recursos limitados o para experimentación académica. Su propósito no es ser un modelo de producción generalista, sino servir como punto de comparación reproducible dentro de un estudio sobre transferencia de métricas y técnicas de aumento de datos en HTR. La model card reporta un CER de 0,3523 y un WER de 0,9431 sobre el conjunto de test HHD Option-B con decodificación greedy y sin modelo de lenguaje.

La relevancia actual del modelo es fundamentalmente metodológica: documenta de forma explícita la configuración de entrenamiento (augmentation `stroke4`, seed 42, partición de datos con exclusión de los escritores de dev) y publica las métricas en un `results.json`, lo que facilita la reproducibilidad y la comparación con otras variantes del mismo estudio. No obstante, sus resultados absolutos son modestos y su alcance está limitado al hebreo manuscrito.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | TrOCR entrenado desde cero con cabeza CTC (según tags y model card) |
| Parámetros totales | 22.421.004 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo sigue la familia TrOCR, un transformer encoder-decoder orientado a reconocimiento de texto en imagen, pero en esta variante se entrena desde cero (`trocrscratchline`) y se acopla una cabeza CTC para la decodificación de secuencias, tal como indican los tags `htr` y `ctc`. No se dispone de información detallada sobre el número de capas, dimensión oculta, número de cabezas de atención ni sobre la resolución de entrada de las imágenes, por lo que estos datos deben considerarse no disponibles.

El entrenamiento se realizó sobre el split de entrenamiento de `cyttic/hhd-optionb-split`, excluyendo los escritores del conjunto de desarrollo, con una configuración de aumento de datos `stroke4` y semilla 42. No se menciona el uso de RLHF, DPO ni ajuste por preferencias, lo cual es coherente con una tarea de reconocimiento supervisado. La evaluación se realizó sobre el test HHD Option-B con decodificación greedy y sin modelo de lenguaje, obteniendo CER 0,3523 y WER 0,9431. Los detalles completos se remiten a un archivo `results.json` incluido en el repositorio.

## Capacidades
- Reconocimiento de texto manuscrito en hebreo a partir de imágenes de línea de texto.
- Decodificación CTC para alinear secuencias de caracteres con las regiones de la imagen.
- Entrenamiento desde cero, sin dependencia de pesos preentrenados de TrOCR.
- Variante específica de un estudio de aumento de datos (`stroke4`) reproducible con semilla 42.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- No se documenta capacidad multilingüe más allá del hebreo.
- No se documentan modos especiales como thinking mode, visión general o audio.

## Casos de uso
- Investigación en HTR: servir como punto de comparación reproducible frente a otras variantes del estudio htr-metrics-transfer, gracias a la semilla fija y a la configuración de aumento documentada.
- Digitalización de manuscritos hebreos históricos: el modelo puede emplearse para transcribir líneas de texto manuscrito en hebreo en proyectos de archivo, siempre que se acepte un CER en torno al 35 % y se aplique revisión humana posterior.
- Evaluación de técnicas de aumento de datos: al estar etiquetado con `stroke4` y seed 42, permite aislar el efecto de esa augmentación frente a otras configuraciones del mismo estudio.
- Prototipado rápido en entornos con recursos limitados: con 22,4 M de parámetros y 0,1 GB de pesos, puede cargarse en CPU o en GPU de gama baja para pruebas de concepto.
- Generación de datasets sintéticos etiquetados: las transcripciones del modelo, tras corrección manual, pueden servir para ampliar corpus de entrenamiento en hebreo manuscrito.
- Benchmarking de pipelines CTC: útil para validar infraestructuras de decodificación greedy sin LM y medir latencia y throughput en configuraciones ligeras.

## Benchmarks y rendimiento
Los únicos datos publicados en la información disponible son los de la model card:

| Métrica | Valor | Conjunto | Decodificación | LM |
|---|---|---|---|---|
| CER | 0,3523 | HHD Option-B test | greedy | no |
| WER | 0,9431 | HHD Option-B test | greedy | no |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que la tarea del modelo es HTR y no generación de texto general.

## Requisitos de hardware
- VRAM estimada para inferencia: inferior a 1 GB en fp32 dado el tamaño de 22,4 M de parámetros y pesos de 0,1 GB; en la práctica, cabe en cualquier GPU consumer.
- GPU recomendadas: no se requiere GPU dedicada; funciona en CPU. Cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) es sobrada para este modelo.
- Cabe en GPU consumer: sí, en todas las gamas actuales, e incluso en entornos integrados.
- Opciones de despliegue: al ser un modelo safetensors con arquitectura TrOCR + CTC, puede cargarse con `transformers` (clase TrOCRForCausalLM o equivalente según la implementación del autor) y servirse con frameworks genéricos como FastAPI o TorchServe; no se documenta soporte específico para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | CER (HHD Option-B) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cyttic/hmt-trocrscratchline-stroke4-s42 | 22,4 M | no disponible | 0,3523 | MIT | Hugging Face |
| cyttic/hmt-trocrctc-stroke4-s42 | 87,3 M | no disponible | no disponible | no disponible | Hugging Face |
| cyttic/hmt-htrvt-stroke4-s42 | 13,8 M | no disponible | no disponible | no disponible | Hugging Face |

Los dos modelos comparables pertenecen al mismo autor y al mismo estudio de aumento (`stroke4`, seed 42), por lo que la comparación es directa en configuración pero no se dispone de sus métricas en la información proporcionada. No se han identificado en la búsqueda otros modelos HTR comparables de otros autores con datos verificables.

## Limitaciones y advertencias
- El CER de 0,3523 y el WER de 0,9431 indican un rendimiento modesto; no es adecuado para producción sin revisión humana.
- El modelo está entrenado únicamente para hebreo (`he`); no soporta otros idiomas.
- Al ser un estudio de aumento con una única semilla (42), la variabilidad entre ejecuciones no está documentada.
- No se dispone de información sobre sesgos del corpus de entrenamiento ni sobre la composición demográfica de los escritores.
- Riesgo de alucinación en la decodificación CTC: errores de alineación pueden producir caracteres espurios, especialmente en líneas con caligrafía atípica.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en dominios distintos al corpus HHD.
- No se documentan limitaciones de longitud de contexto ni de resolución de imagen, lo que impide planificar despliegues con entradas de tamaño arbitrario.
- La ausencia de modelo de lenguaje en la decodificación limita la corrección contextual de errores.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/cyttic/hmt-trocrscratchline-stroke4-s42
- Variante trocrctc: https://huggingface.co/cyttic/hmt-trocrctc-stroke4-s42
- Variante htrvt: https://huggingface.co/cyttic/hmt-htrvt-stroke4-s42
