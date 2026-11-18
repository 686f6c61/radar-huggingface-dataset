# cyttic/hmt-trocrscratchstem-photo1-s42

## Resumen

El modelo `cyttic/hmt-trocrscratchstem-photo1-s42` es un modelo de reconocimiento de texto manuscrito (HTR, *handwritten text recognition*) desarrollado por el grupo cyttic. Se trata de un experimento controlado dentro de un estudio de aumento de datos (*augmentation study*) denominado `htr-metrics-transfer`, en el que se entrena una variante de TrOCR desde cero (`trocrscratchstem`) con una configuración concreta de aumento de imagen (`photo1`) y una semilla fija (42). El modelo está especializado en hebreo manuscrito y se publica como artefacto reproducible de dicho estudio, no como un modelo de propósito general.

Arquitectónicamente sigue el esquema TrOCR (encoder visual tipo ViT más decoder Transformer) adaptado a un cabezal CTC, según indican las etiquetas `htr` y `ctc`. Con 24.928.588 parámetros (aproximadamente 25 M) y un tamaño de repositorio de 0,1 GB, es un modelo compacto orientado a la transcripción de líneas o imágenes de texto manuscrito en hebreo, con pesos en formato safetensors y licencia MIT.

Su relevancia es acotada pero útil: sirve como punto de referencia reproducible para medir el impacto del aumento de datos en HTR, y su licencia permisiva y reducido tamaño lo hacen desplegable en hardware modesto. No obstante, al estar entrenado con un único idioma y un pipeline específico, su uso en producción fuera de ese contexto debe evaluarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TrOCR (encoder visual + decoder Transformer) con cabezal CTC, entrenado desde cero (`trocrscratchstem`) |
| Parametros totales | 24.928.588 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la familia TrOCR, que combina un encoder visual (habitualmente un ViT) con un decoder Transformer para la secuencia de salida. En este caso, la etiqueta `ctc` indica que la decodificación se realiza mediante *Connectionist Temporal Classification* en modo greedy, sin modelo de lenguaje externo, tal y como se especifica en la model card. La variante `trocrscratchstem` sugiere un entrenamiento desde cero (sin inicialización desde pesos preentrenados de TrOCR), lo que condiciona su calidad final frente a variantes con *transfer learning*.

El entrenamiento se realizó sobre el split de entrenamiento del dataset `cyttic/hhd-optionb-split`, excluyendo los escritores reservados para desarrollo, con el aumento de datos `photo1` y semilla 42. La evaluación se hizo sobre el conjunto de test HHD Option-B con decodificación greedy y sin LM. No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (poco habituales en HTR). El resultado reportado es CER 0,0857 y WER 0,3842.

## Capacidades

- Reconocimiento de texto manuscrito (HTR) en hebreo sobre imágenes de texto.
- Transcripción a nivel de línea o región de imagen, con salida de secuencia de caracteres.
- Decodificación CTC greedy sin modelo de lenguaje externo.
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- Capacidad multilingüe: únicamente hebreo según la model card.
- No se documentan capacidades de visión general, audio ni modo *thinking*.

## Casos de uso

- Digitalización de archivos manuscritos en hebreo: el modelo puede transcribir imágenes de documentos históricos o administrativos en hebreo, aprovechando su entrenamiento específico en HTR y su bajo coste computacional para procesar lotes grandes.
- Reproducción de experimentos de aumento de datos: al estar identificado con una configuración concreta (`photo1`, semilla 42), sirve como artefacto reproducible para comparar el efecto del *augmentation* en métricas CER/WER frente a otras variantes del estudio.
- Evaluación de pipelines HTR en investigación: puede integrarse como baseline ligero en comparativas de modelos de reconocimiento de escritura hebrea, dado su tamaño de ~25 M de parámetros.
- Prototipado en hardware limitado: su reducido tamaño permite desplegarlo en GPUs de consumo o incluso en CPU para pruebas de concepto de transcripción manuscrita.
- Extracción de texto en flujos de indexación documental: combinado con un detector de líneas, puede alimentar un pipeline de búsqueda sobre corpus manuscritos en hebreo.
- Docencia y formación en HTR: su licencia MIT y su tamaño compacto lo hacen adecuado para prácticas sobre arquitecturas encoder-decoder con CTC y sobre evaluación con CER/WER.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto / condicion |
|---|---|---|
| CER | 0,0857 | HHD Option-B test, greedy, sin LM |
| WER | 0,3842 | HHD Option-B test, greedy, sin LM |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que se trata de un modelo especializado en HTR y no de un LLM de propósito general.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, del orden de cientos de MB en fp32 para ~25 M de parámetros (el repositorio ocupa 0,1 GB); en fp16 o int8 se reduce aún más.
- GPU recomendadas: cualquier GPU moderna es suficiente; no se requiere A100 ni H100. Una RTX 4090 o incluso GPUs de gama baja sobran para este modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer actual e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: no se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI; al ser un modelo TrOCR con safetensors, el despliegue habitual sería mediante `transformers` o un runtime compatible con la arquitectura.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| cyttic/hmt-trocrscratchstem-photo1-s42 | 24,9 M | no disponible | he | MIT | HTR hebreo, CTC greedy, CER 0,0857 en HHD Option-B |
| TrOCR (variantes oficiales de Microsoft) | no disponible en esta ficha | no disponible | en (principalmente) | MIT | Arquitectura base; este modelo es una variante entrenada desde cero |
| Otros modelos del estudio `htr-metrics-transfer` (cyttic) | no disponible | no disponible | he | MIT (presumible) | Variantes con otros *augmentations* y semillas; comparables directamente |

No se dispone de datos suficientes para comparar parámetros, contexto y rendimiento con alternativas externas de HTR en hebreo; se indica "no disponible" en esos campos.

## Limitaciones y advertencias

- Es un artefacto de investigación: su propósito es el estudio de aumento de datos, no un producto listo para producción.
- Entrenado únicamente en hebreo; no se espera buen rendimiento en otros idiomas.
- El WER reportado (0,3842) es alto en términos absolutos, lo que indica errores frecuentes a nivel de palabra; el CER (0,0857) es más razonable pero aún mejorable.
- Decodificación greedy sin modelo de lenguaje: no corrige errores léxicos ni contextuales.
- No se documentan sesgos específicos, pero al derivar de un corpus concreto (`hhd-optionb-split`) puede heredar sesgos de escritores, estilos y dominios de ese dataset.
- Riesgo de alucinación: en HTR, el modelo puede generar caracteres o palabras plausibles no presentes en la imagen, especialmente en regiones degradadas.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías; conviene verificar la procedencia del dataset de entrenamiento antes de un uso comercial.
- No se documentan limitaciones de longitud de contexto ni de resolución de imagen en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyttic/hmt-trocrscratchstem-photo1-s42
- Dataset de entrenamiento referenciado: https://huggingface.co/datasets/cyttic/hhd-optionb-split
- Resultados del estudio (`results.json`): referenciado en la model card, no se proporciona URL directa en la información disponible.
