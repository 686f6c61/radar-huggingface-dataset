# cyttic/hmt-trocrscratchstem-photo2-s42

## Resumen

El modelo `cyttic/hmt-trocrscratchstem-photo2-s42` es un modelo de reconocimiento de texto manuscrito (HTR, *handwritten text recognition*) desarrollado por el autor `cyttic` en el marco de un estudio de aumento de datos denominado *htr-metrics-transfer*. Se trata de un modelo basado en TrOCR entrenado desde cero (*scratch*) sobre un *stem* concreto, con la variante de aumento de datos `photo2` y la semilla 42, y está diseñado para transcribir texto manuscrito en hebreo.

El modelo forma parte de una familia de experimentos que comparan el efecto de distintas estrategias de aumento de datos sobre las métricas de reconocimiento. Con 24.928.588 parámetros (aproximadamente 25 millones), es un modelo compacto orientado a la transcripción de líneas de texto manuscrito mediante un decodificador CTC, y no a la generación libre de texto ni a tareas conversacionales.

Su relevancia es acotada y experimental: es un artefacto de investigación con licencia MIT, publicado con fines de reproducibilidad de un estudio concreto. No está pensado como modelo de propósito general, sino como un punto de medida dentro de una comparativa de aumentos de datos para HTR en hebreo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TrOCR (encoder Transformer de visión + decoder Transformer con salida CTC) |
| Parametros totales | 24.928.588 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hebreo (he) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema TrOCR (*Transformer-based Optical Character Recognition*), que combina un encoder de visión tipo ViT para procesar imágenes de líneas de texto con un decoder Transformer que genera la secuencia de caracteres. En este caso, la model card indica explícitamente el uso de decodificación CTC (*Connectionist Temporal Classification*), lo que implica una alineación carácter a carácter sobre la secuencia visual, en lugar de una generación autorregresiva con *cross-attention*.

El entrenamiento se realizó desde cero (*trocrscratchstem*) sobre el conjunto `cyttic/hhd-optionb-split`, excluyendo los escritores (*writers*) reservados para el conjunto de desarrollo. Se aplicó el aumento de datos `photo2` con la semilla 42, dentro de un estudio de transferencia de métricas HTR. La evaluación se realizó sobre el conjunto de test HHD Option-B con decodificación voraz (*greedy*) y sin modelo de lenguaje (*no LM*), obteniendo CER 0,0861 y WER 0,3797. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de ajuste fino con RLHF o DPO.

## Capacidades

- Reconocimiento de texto manuscrito (HTR) en hebreo a partir de imágenes de líneas de texto.
- Transcripción carácter a carácter mediante decodificación CTC.
- Salida de secuencias de texto sin modelo de lenguaje auxiliar en la evaluación reportada.
- No se documentan capacidades de generación libre, razonamiento, código, matemáticas, visión general, tool calling, agentes ni multilingüismo más allá del hebreo.
- No dispone de modo de razonamiento (*thinking mode*), audio ni otras modalidades.

## Casos de uso

- Digitalización de archivos manuscritos en hebreo: el modelo puede transcribir líneas de manuscritos escaneados para su indexación y búsqueda, aprovechando su entrenamiento específico en escritura hebrea.
- Reproducibilidad de investigación en HTR: sirve como punto de referencia concreto (aumento `photo2`, semilla 42) para comparar el efecto de distintas estrategias de aumento de datos sobre CER y WER.
- Extracción de texto en pipelines de preservación documental: al ser un modelo compacto (~25 M de parámetros), puede integrarse en flujos de digitalización por lotes con requisitos de cómputo moderados.
- Evaluación de transferencia de métricas: útil para estudiar cómo se transfieren las métricas de un dominio o conjunto de escritores a otro, dado su diseño experimental explícito.
- Prototipado de OCR manuscrito en aplicaciones de nicho hebreo: permite validar rápidamente la viabilidad de un enfoque TrOCR+CTC antes de invertir en modelos mayores.
- Investigación sobre decodificación sin LM: su configuración de evaluación (greedy, sin modelo de lenguaje) lo hace adecuado para estudiar el rendimiento base del reconocimiento puro.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| CER (HHD Option-B test, greedy, sin LM) | 0,0861 |
| WER (HHD Option-B test, greedy, sin LM) | 0,3797 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con ~25 M de parámetros, el modelo en precisión completa ocupa del orden de 100 MB, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; una RTX 3060 o superior resulta más que adecuada. Para lotes grandes, una RTX 4090 o A100 aportarían mayor throughput.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU modernas e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: no se documentan integraciones específicas; al usar safetensors, puede cargarse con las librerías estándar de Transformers. No se confirma soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| cyttic/hmt-trocrscratchstem-photo2-s42 | 24,9 M | no disponible | MIT | Hugging Face |
| TrOCR (variantes base/large de Microsoft) | no disponible en la informacion | no disponible | MIT | Hugging Face |
| Otros modelos de la familia hmt-* de cyttic | no disponible | no disponible | MIT | Hugging Face |

No se dispone de datos de rendimiento comparables de otras alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental de investigación: su propósito es medir el efecto de un aumento de datos concreto, no el despliegue en producción general.
- Idioma limitado al hebreo; no se documenta soporte para otras lenguas.
- Evaluación realizada sin modelo de lenguaje, lo que puede penalizar la fluidez y la corrección contextual frente a sistemas con LM.
- Riesgo de alucinación y errores de transcripción inherentes a la decodificación CTC sin LM; el WER de 0,3797 indica una tasa de error de palabra considerable.
- Sesgos conocidos: no documentados, pero al entrenarse sobre un conjunto concreto de escritores, puede generalizar peor a escritores no representados.
- Licencia MIT: permite uso comercial y modificación, pero sin garantías; conviene verificar los términos del dataset de entrenamiento original.
- No se documentan requisitos de contexto, cuantización ni despliegue, lo que limita la planificación de producción.

## Enlaces

- Hugging Face: https://huggingface.co/cyttic/hmt-trocrscratchstem-photo2-s42
- Dataset de entrenamiento: https://huggingface.co/datasets/cyttic/hhd-optionb-split
- Resultados detallados: `results.json` (referenciado en la model card, no enlazado directamente)
