# cyttic/hmt-htrvt-elastic3-s42

## Resumen

El modelo `cyttic/hmt-htrvt-elastic3-s42` es un sistema de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) desarrollado por el grupo cyttic. Se trata de un modelo pequeño, de aproximadamente 13,8 millones de parámetros, entrenado con un cabezal CTC (*Connectionist Temporal Classification*) sobre un corpus de escritura manuscrita en hebreo (`he`). Forma parte de un estudio de aumentación de datos denominado `htr-metrics-transfer`, en su primera oleada (*wave 1*), con la variante de aumentación `elastic3` y la semilla 42.

El objetivo del modelo no es tanto el rendimiento absoluto como la reproducibilidad experimental: cada configuración (arquitectura `htrvt`, tipo de aumentación, semilla) se publica como un checkpoint independiente para poder comparar el efecto de la aumentación sobre las métricas de reconocimiento. El checkpoint reporta, con decodificación voraz (*greedy*) y sin modelo de lenguaje, un CER de 0,0756 y un WER de 0,3290 sobre el conjunto de test HHD Option-B.

Por su tamaño reducido y su licencia MIT, es un modelo adecuado para experimentación académica, para servir de línea base en estudios de aumentación y para prototipos de transcripción de manuscrito hebreo en entornos con recursos limitados. No está pensado como producto de producción ni cubre otros idiomas distintos del hebreo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `htrvt` (red neuronal para HTR con cabezal CTC; detalles internos no disponibles) |
| Parametros totales | 13.821.574 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura se etiqueta como `htrvt` y emplea un esquema de entrenamiento CTC, habitual en reconocimiento de texto manuscrito cuando no se dispone de alineaciones a nivel de carácter. El modelo tiene 13.821.574 parámetros y se distribuye en safetensors con un tamaño de repositorio de 0,1 GB. No se detalla en la información disponible la composición interna de la red (número de capas, dimensionalidad, tipo de extractor visual ni mecanismo de atención).

El entrenamiento se realizó sobre el split de entrenamiento de `cyttic/hhd-optionb-split`, excluyendo los escritores reservados para desarrollo. La variante corresponde a la aumentación `elastic3` y a la semilla 42 dentro de la oleada 1 del estudio `htr-metrics-transfer`. La evaluación se hizo sobre el test HHD Option-B con decodificación voraz y sin modelo de lenguaje, obteniendo CER 0,0756 y WER 0,3290. No se documentan en la información disponible el número de tokens de entrenamiento, el uso de RLHF/DPO ni innovaciones técnicas adicionales.

## Capacidades

- Reconocimiento de texto manuscrito en hebreo a partir de imágenes de líneas o páginas, con salida de secuencia de caracteres.
- Decodificación CTC voraz (*greedy*), sin modelo de lenguaje externo en la configuración evaluada.
- Entrenamiento y evaluación orientados a métricas de carácter (CER) y palabra (WER).
- No se documenta soporte de *tool calling*, *function calling* ni comportamiento de agente.
- No se documenta capacidad multilingüe: el modelo está entrenado y etiquetado únicamente para hebreo.
- No se documentan modos especiales (thinking, visión general, audio) más allá del reconocimiento de imagen manuscrita propio de la tarea HTR.

## Casos de uso

- Línea base en estudios de aumentación de datos: sirve como referencia `elastic3`/semilla 42 para comparar el efecto de otras aumentaciones sobre CER y WER en el mismo corpus.
- Reproducción de experimentos académicos: al publicarse cada configuración como checkpoint independiente, permite replicar exactamente la métrica reportada (CER 0,0756, WER 0,3290) sobre HHD Option-B.
- Transcripción asistida de manuscrito hebreo en archivos históricos: con 13,8 M de parámetros puede ejecutarse en CPU o GPU modesta para digitalizar colecciones pequeñas.
- Evaluación comparativa de decodificadores: al no incluir modelo de lenguaje, es útil para medir la ganancia de añadir un LM o un decodificador con haz sobre el resultado voraz.
- Prototipado de pipelines HTR en investigación: integrable como componente de reconocimiento en un flujo de preprocesado de imagen, inferencia y postprocesado.
- Docencia y experimentación con CTC: su tamaño reducido y licencia MIT facilitan su uso en cursos y talleres sobre reconocimiento de secuencias.

## Benchmarks y rendimiento

| Metrica | Conjunto | Decodificacion | Resultado |
|---|---|---|---|
| CER | HHD Option-B test | Greedy, sin LM | 0,0756 |
| WER | HHD Option-B test | Greedy, sin LM | 0,3290 |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros), que además no aplican a un modelo HTR.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa, dado el tamaño de 13,8 M de parámetros (unos 55 MB en fp32 y unos 28 MB en fp16).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; no se requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en cualquier RTX o GTX moderna e incluso en iGPU con suficiente memoria compartida.
- Despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al ser un modelo HTR con safetensors, lo habitual es cargarlo con PyTorch o la librería de transformers correspondiente.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos HTR comparables ni sus métricas sobre el mismo corpus.

## Limitaciones y advertencias

- El modelo solo cubre hebreo; no debe esperarse funcionamiento en otros idiomas.
- El WER (0,3290) es notablemente superior al CER (0,0756), lo que indica errores frecuentes a nivel de palabra completa pese a una buena precisión por carácter.
- Las métricas se obtuvieron sin modelo de lenguaje y con decodificación voraz; en producción conviene validar con un LM y decodificación con haz.
- No se documentan sesgos específicos, pero al entrenarse sobre un conjunto limitado de escritores (HHD Option-B) puede generalizar mal a nuevas manos, estilos o dominios.
- Riesgo de alucinación inherente a los modelos CTC: puede insertar, omitir o sustituir caracteres en zonas ambiguas.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar la model card y `results.json` para los detalles experimentales.
- Es un checkpoint de estudio (oleada 1, semilla 42), no un modelo final optimizado; su uso en producción requiere evaluación adicional sobre datos propios.

## Enlaces

- Hugging Face: https://huggingface.co/cyttic/hmt-htrvt-elastic3-s42
- Dataset de entrenamiento: https://huggingface.co/cyttic/hhd-optionb-split
- Resultados detallados: `results.json` en el repositorio del modelo (no se proporciona URL directa en la información disponible)
