# cyttic/hmt-trocrsmall-stroke4-s42

## Resumen

El modelo `cyttic/hmt-trocrsmall-stroke4-s42` es un sistema de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) publicado por el grupo cyttic. Se trata de un modelo pequeño, de aproximadamente 22,4 millones de parámetros, entrenado con una cabeza CTC sobre el corpus `cyttic/hhd-optionb-split`. Forma parte de un estudio de aumentación de datos denominado internamente `htr-metrics-transfer`, en el que se varía la estrategia de aumentación (`stroke4`) y la semilla (`s42`) para medir su efecto sobre las métricas de reconocimiento.

El modelo está especializado en hebreo (`he`), que es el único idioma declarado en la model card. Su propósito no es la generación de texto libre ni el razonamiento, sino la transcripción de imágenes de escritura manuscrita a texto plano mediante decodificación voraz (*greedy*) y sin modelo de lenguaje externo. Esta configuración lo convierte en un componente de bajo coste computacional para pipelines de digitalización documental.

La relevancia de esta ficha es acotada: se trata de un artefacto de investigación con cero descargas y cero *likes* en el momento de su publicación, con una model card mínima y sin documentación técnica detallada más allá de los resultados de test reportados. Resulta útil como referencia para quien reproduzca el estudio de aumentación o necesite una línea base ligera de HTR en hebreo, pero no como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (cabeza CTC sobre un backbone no especificado; el nombre `trocrsmall` sugiere un modelo tipo CRNN pequeño, no confirmado) |
| Parametros totales | 22.421.004 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (en HTR la longitud efectiva la determina la altura/ancho de la imagen de entrada, no documentada) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF, int8 ni int4) |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna. Los tags `htr` y `ctc` indican que el modelo realiza reconocimiento de texto manuscrito con una función de pérdida CTC (*Connectionist Temporal Classification*), lo que implica una salida por *frames* alineada de forma implícita con la secuencia de caracteres, sin necesidad de segmentación previa. El identificador `trocrsmall` apunta a un backbone de tipo CRNN de tamaño reducido, pero no se confirma en la documentación.

El entrenamiento se realizó sobre el split de entrenamiento de `cyttic/hhd-optionb-split`, excluyendo los escritores reservados para desarrollo. La variante corresponde a la aumentación `stroke4` con semilla 42, dentro de un estudio comparativo de aumentación (`htr-metrics-transfer`). No se especifican el número de tokens, la composición del dataset, ni si hubo etapas de ajuste fino adicionales. La decodificación reportada es voraz y sin modelo de lenguaje, lo que simplifica el pipeline pero limita la corrección contextual.

## Capacidades

- Reconocimiento de texto manuscrito en hebreo a partir de imágenes de línea o página, con salida de secuencia de caracteres mediante CTC.
- Transcripción sin modelo de lenguaje externo, lo que reduce dependencias y latencia pero aumenta la tasa de error a nivel de palabra.
- Entrenamiento orientado a robustez frente a variaciones de trazo gracias a la aumentación `stroke4`.
- No se documentan capacidades de *tool calling*, agentes, razonamiento multi-paso, visión general, audio ni modo *thinking*.
- El soporte multilingüe se limita al hebreo declarado; no hay evidencia de transferencia a otros alfabetos.

## Casos de uso

- Digitalización de archivos manuscritos en hebreo: el modelo puede procesar imágenes de líneas de texto y devolver la transcripción para indexación posterior, con un CER de 0,1813 como referencia de calidad.
- Línea base en estudios de aumentación: sirve como punto de comparación fijo (semilla 42, `stroke4`) para medir el impacto de otras estrategias de aumentación en HTR.
- Preprocesado para pipelines de OCR/HTR mixtos: al ser un modelo de 22,4 M de parámetros, puede ejecutarse en CPU o GPU modesta como primer paso antes de un corrector ortográfico o un modelo de lenguaje.
- Investigación en reconocimiento de escritura con CTC: útil para reproducir experimentos sobre decodificación voraz frente a decodificación con LM.
- Prototipado rápido de transcripción en entornos con recursos limitados: el tamaño del repo (0,1 GB) permite desplegarlo en contenedores pequeños.
- Evaluación de robustez frente a variaciones de escritura: la aumentación `stroke4` está pensada para escenarios con trazos irregulares, útil en documentación histórica.

## Benchmarks y rendimiento

Los únicos datos reportados en la model card son las métricas de test sobre HHD Option-B, con decodificación voraz y sin LM:

| Metrica | Valor |
|---|---|
| CER | 0,1813 |
| WER | 0,6548 |

No se han publicado resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a esta tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para 22,4 M de parámetros; en la práctica, el cuello de botella es la imagen de entrada, no el modelo.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es suficiente; también es viable en CPU para lotes pequeños.
- Cabe en GPU consumer: sí, con amplio margen, incluidas GPUs integradas para inferencia por línea.
- Opciones de despliegue: al ser safetensors con cabeza CTC, requiere un *wrapper* propio (PyTorch) o un servidor de inferencia personalizado; no se documenta soporte nativo en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada. Como referencia cualitativa, se trata de un modelo de HTR en hebreo de 22,4 M de parámetros con licencia MIT; no se han identificado alternativas documentadas en la misma búsqueda.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| cyttic/hmt-trocrsmall-stroke4-s42 | 22.421.004 | no disponible | MIT | HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo de investigación con cero descargas y cero *likes*; no hay evidencia de uso en producción ni de validación externa.
- El WER de 0,6548 es elevado: aproximadamente dos de cada tres palabras presentan algún error, lo que limita su uso directo en transcripción de calidad sin post-procesado.
- Entrenado únicamente en hebreo; no se garantiza comportamiento en otros idiomas ni en alfabetos latinos.
- Decodificación voraz sin LM: no corrige errores contextuales ni ortográficos.
- No se documentan sesgos, pero al derivar de un corpus concreto (`hhd-optionb-split`) puede heredar sesgos de los escritores y del dominio de ese dataset.
- Riesgo de alucinación inherente a CTC: puede emitir caracteres espurios en regiones sin texto o con ruido.
- Licencia MIT permite uso comercial, pero la ausencia de documentación técnica y de garantías hace recomendable una evaluación propia antes de desplegarlo.
- No se documentan limitaciones de longitud de contexto ni de resolución de imagen; conviene validar el preprocesado antes de integrarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cyttic/hmt-trocrsmall-stroke4-s42
- Dataset de entrenamiento: https://huggingface.co/datasets/cyttic/hhd-optionb-split
- Resultados del estudio: `results.json` (referenciado en la model card, no enlazado directamente)
