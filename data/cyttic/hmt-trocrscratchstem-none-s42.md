# cyttic/hmt-trocrscratchstem-none-s42

## Resumen

`cyttic/hmt-trocrscratchstem-none-s42` es un modelo de reconocimiento de texto manuscrito (HTR, *handwritten text recognition*) publicado por el usuario cyttic en Hugging Face. Se trata de un checkpoint concreto dentro de un estudio de aumento de datos (*augmentation study*) denominado `htr-metrics-transfer`, en el que se entrena la variante `trocrscratchstem` sin aumento (`augmentation: none`) y con semilla 42. El modelo está especializado en hebreo (`he`) y emplea una cabeza de clasificación CTC sobre una arquitectura derivada de TrOCR.

El modelo es relevante únicamente en el contexto de investigación del que procede: comparar el efecto de distintas estrategias de aumento de datos sobre métricas de HTR. No es un modelo de propósito general ni un modelo conversacional; su única función es transcribir imágenes de texto manuscrito en hebreo. Con 24.928.588 parámetros y un repositorio de 0,1 GB, es un modelo pequeño, apto para experimentación en hardware modesto.

La model card es extremadamente escueta: no documenta la arquitectura interna, los datos de entrenamiento más allá de una referencia al dataset `cyttic/hhd-optionb-split`, ni los hiperparámetros. Toda la información técnica disponible proviene de los metadatos de Hugging Face y de la propia model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | TrOCR con cabeza CTC (variante `trocrscratchstem`); detalles internos no disponibles |
| Parámetros totales | 24.928.588 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El nombre del checkpoint indica que se trata de una variante de TrOCR entrenada desde cero (`scratch`) con un *stem* específico (`stem`), y con una cabeza de reconocimiento CTC (`ctc`), tal como reflejan las etiquetas `htr` y `ctc`. No se dispone de información sobre el codificador visual, el decodificador textual, la resolución de entrada ni la configuración de la cabeza CTC.

El entrenamiento se realizó sobre el *split* de entrenamiento del dataset `cyttic/hhd-optionb-split`, excluyendo los escritores reservados para desarrollo (*dev writers*). La evaluación se hizo sobre el conjunto de test HHD Option-B con decodificación voraz (*greedy*) y sin modelo de lenguaje. No se documentan el número de tokens, la composición del dataset, ni si hubo etapas de ajuste fino con RLHF/DPO (poco probable en una tarea de reconocimiento). El estudio forma parte de una comparativa de aumentos de datos, por lo que este checkpoint representa la condición de control sin aumento.

## Capacidades

- Reconocimiento de texto manuscrito (HTR) en hebreo a partir de imágenes.
- Decodificación CTC con estrategia voraz (*greedy decoding*), sin modelo de lenguaje externo.
- Salida de transcripción a nivel de carácter y de palabra (métricas CER y WER reportadas).
- No soporta *tool calling* ni *function calling*.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo *thinking*, visión general, audio ni otras modalidades.
- Capacidad multilingüe limitada al hebreo; no se documentan otros idiomas.

## Casos de uso

- Digitalización de archivos manuscritos en hebreo: el modelo puede transcribir imágenes de documentos escaneados a texto plano, adecuado para proyectos de preservación documental donde el idioma sea hebreo.
- Investigación en aumento de datos para HTR: sirve como línea base (`augmentation: none`) frente a la que comparar otras variantes del estudio `htr-metrics-transfer`.
- Evaluación de métricas de transferencia: al publicarse junto a un `results.json` con CER y WER, permite reproducir y contrastar experimentos de HTR en hebreo.
- Prototipado de pipelines OCR/HTR: su tamaño reducido (≈25 M de parámetros) permite integrarlo en entornos de experimentación con recursos limitados.
- Análisis de manuscritos históricos hebreos: útil en estudios académicos que requieran transcripción asistida, siempre con revisión humana dada la tasa de error.
- Benchmarking de arquitecturas CTC: como checkpoint de referencia para comparar cabezas CTC frente a decodificadores autorregresivos en tareas de reconocimiento.

## Benchmarks y rendimiento

Los únicos datos publicados en la model card son las métricas de evaluación sobre el conjunto HHD Option-B, con decodificación voraz y sin modelo de lenguaje:

| Métrica | Valor |
|---|---|
| CER (*Character Error Rate*) | 0,0854 |
| WER (*Word Error Rate*) | 0,3789 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ni comparaciones con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con ≈25 M de parámetros, en fp32 ocuparía aproximadamente 100 MB de pesos, y en fp16 alrededor de 50 MB, aunque estas cifras son estimaciones a partir del recuento de parámetros y no datos publicados.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) debería ser suficiente, pero no se documenta.
- Compatibilidad con GPU consumer: previsiblemente sí, dado el reducido número de parámetros, aunque no se confirma en la documentación.
- Opciones de despliegue: no disponible; no se mencionan vLLM, llama.cpp, Ollama ni TGI. Al ser un modelo de visión para HTR, estos frameworks de texto no serían directamente aplicables.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La model card no incluye comparaciones con otras variantes del estudio ni con modelos HTR de referencia.

| Modelo | Parámetros | Contexto | CER | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cyttic/hmt-trocrscratchstem-none-s42 | 24.928.588 | no disponible | 0,0854 | MIT | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo de nicho: solo reconoce texto manuscrito en hebreo; no es un modelo de propósito general.
- Tasa de error de palabras elevada (WER 0,3789): inadecuado para producción sin revisión humana o sin un modelo de lenguaje corrector.
- Evaluación sin modelo de lenguaje: los resultados reportados corresponden a decodificación voraz pura, por lo que el rendimiento en pipelines con corrección podría diferir.
- Sesgos desconocidos: no se documenta la composición del dataset ni la distribución de escritores, lo que impide evaluar sesgos por estilo de escritura o demografía.
- Riesgo de alucinación: en HTR, el riesgo se traduce en sustituciones y omisiones de caracteres, no en contenido inventado; aun así, la salida puede contener errores no señalizados.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene verificar la procedencia del dataset `cyttic/hhd-optionb-split` antes de un uso comercial.
- Documentación insuficiente: la model card no detalla arquitectura, hiperparámetros ni preprocesado, lo que dificulta la reproducibilidad.
- Sin métricas de robustez: no se reportan resultados ante ruido, rotaciones o variaciones de resolución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyttic/hmt-trocrscratchstem-none-s42
- Dataset de entrenamiento referenciado: `cyttic/hhd-optionb-split` (no se proporciona URL directa en la información disponible)
- Resultados del estudio: `results.json` (referenciado en la model card; no se proporciona URL directa)
- Paper, blog o repositorio del estudio `htr-metrics-transfer`: no disponible
