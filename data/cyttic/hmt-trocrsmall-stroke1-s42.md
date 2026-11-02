# cyttic/hmt-trocrsmall-stroke1-s42

## Resumen

El modelo `cyttic/hmt-trocrsmall-stroke1-s42` es un sistema de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) desarrollado por el grupo CYTTIC, publicado en HuggingFace con licencia MIT. Se trata de un modelo de aproximadamente 22,4 millones de parámetros, entrenado con arquitectura CTC (*Connectionist Temporal Classification*) y pesos en formato safetensors, orientado específicamente al idioma hebreo.

El modelo forma parte de un estudio de aumento de datos (*augmentation study*) denominado `htr-metrics-transfer`, en el que se evalúa cómo distintas técnicas de aumento afectan a las métricas de reconocimiento. En este caso concreto, la variante es `trocrsmall` con aumento `stroke1` y semilla 42. El entrenamiento se realizó sobre el conjunto `cyttic/hhd-optionb-split` (parte de entrenamiento, excluyendo los escritores de desarrollo) y se evaluó sobre el test HHD Option-B.

Su relevancia es acotada pero específica: se trata de un modelo de investigación para HTR en hebreo, con métricas publicadas (CER 0,1816 y WER 0,6546 en decodificación greedy sin modelo de lenguaje) y sin descargas ni interacciones registradas en el momento de la consulta. No está pensado como modelo de propósito general, sino como artefacto reproducible dentro de un estudio comparativo de aumentación de datos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CTC (reconocimiento de texto manuscrito basado en CTC; detalles de la red no disponibles) |
| Parámetros totales | 22.421.004 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | hebreo (he) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se enmarca en la familia de sistemas HTR basados en CTC, una técnica que permite alinear secuencias de entrada (imágenes de texto manuscrito) con secuencias de salida (caracteres) sin necesidad de segmentación explícita a nivel de carácter. La model card no detalla la topología interna de la red (capas convolucionales, recurrencia o transformers), por lo que esa información debe considerarse no disponible.

El entrenamiento se realizó sobre el split de entrenamiento del conjunto `cyttic/hhd-optionb-split`, excluyendo los escritores reservados para desarrollo. La variante corresponde a un estudio de aumento de datos: `stroke1` indica una técnica de aumento basada en trazos, y `s42` la semilla aleatoria empleada. La evaluación se hizo con decodificación greedy y sin modelo de lenguaje, lo que explica en parte el WER relativamente alto (0,6546) frente al CER (0,1816). No se especifican el número de tokens, la composición del dataset ni si hubo etapas de ajuste fino adicionales.

## Capacidades

- Reconocimiento de texto manuscrito en hebreo a partir de imágenes de líneas o palabras (HTR).
- Decodificación CTC greedy, sin integración de modelo de lenguaje en la configuración evaluada.
- Salida a nivel de carácter (CER) y de palabra (WER), útil para evaluación comparativa de pipelines HTR.
- No dispone de soporte documentado de *tool calling* ni de *function calling*.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de capacidades de visión general, audio ni *thinking mode*; su entrada visual se limita al reconocimiento de escritura.
- Multilingüismo limitado al hebreo según la metadata del modelo.

## Casos de uso

- Digitalización de archivos manuscritos en hebreo: el modelo puede transcribir líneas de texto manuscrito procedentes de colecciones históricas o administrativas, integrado en un pipeline de preprocesado de imágenes y decodificación CTC.
- Investigación en aumento de datos para HTR: sirve como punto de comparación reproducible (semilla 42, aumento `stroke1`) frente a otras variantes del mismo estudio `htr-metrics-transfer`, permitiendo aislar el efecto del aumento sobre CER y WER.
- Evaluación de pipelines de reconocimiento sin modelo de lenguaje: al publicarse métricas con decodificación greedy pura, es útil como línea base para medir la ganancia que aporta añadir un LM o un corrector ortográfico posterior.
- Prototipado de sistemas de transcripción asistida para documentos hebreos: con 22,4 M de parámetros y un repo de 0,1 GB, puede desplegarse en entornos con recursos limitados para pruebas de concepto.
- Benchmarking de modelos HTR en hebreo: permite comparar arquitecturas o configuraciones de entrenamiento sobre el mismo conjunto de test (HHD Option-B) y las mismas métricas.
- Reproducibilidad académica: al estar publicado con licencia MIT y pesos en safetensors, facilita la replicación de resultados en publicaciones sobre transferencia de métricas en HTR.

## Benchmarks y rendimiento

| Métrica | Valor | Configuración |
|---|---|---|
| CER | 0,1816 | HHD Option-B test, decodificación greedy, sin LM |
| WER | 0,6546 | HHD Option-B test, decodificación greedy, sin LM |

No se han publicado en la información disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) ni métricas adicionales más allá de CER y WER sobre el conjunto HHD Option-B.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 22,4 M de parámetros, los pesos en precisión completa ocupan aproximadamente 90 MB, por lo que la inferencia cabría en GPUs de gama baja e incluso en CPU.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) sería suficiente, aunque no hay datos de rendimiento publicados.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con al menos 1-2 GB de VRAM, aunque no se documenta oficialmente.
- Opciones de despliegue: no disponibles en la información proporcionada; al ser un modelo CTC con pesos safetensors, requeriría un *runtime* compatible con la arquitectura concreta (no detallada).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (HTR en hebreo con CTC) ni datos de rendimiento de alternativas.

## Limitaciones y advertencias

- El WER de 0,6546 en decodificación greedy sin LM indica una tasa de error a nivel de palabra elevada; para producción sería recomendable acoplar un modelo de lenguaje o un corrector posterior.
- El modelo está entrenado y evaluado únicamente en hebreo; no se documenta soporte para otros idiomas.
- No se detallan sesgos conocidos ni la composición del dataset de entrenamiento, lo que dificulta evaluar su representatividad (tipos de escritura, calidad de escaneo, dominios).
- Riesgo de alucinación no aplicable en el sentido de los LLM, pero sí de errores de transcripción sistemáticos en escrituras alejadas de la distribución de entrenamiento.
- La licencia MIT permite uso comercial, pero el modelo se publica como artefacto de investigación sin garantías de robustez en producción.
- No hay información sobre el contexto de entrada (longitud de línea o imagen soportada), lo que limita su integración directa sin validación previa.
- Cero descargas y cero interacciones en el momento de la consulta: no existe validación comunitaria del modelo.

## Enlaces

- HuggingFace: https://huggingface.co/cyttic/hmt-trocrsmall-stroke1-s42
- Conjunto de datos de entrenamiento: https://huggingface.co/datasets/cyttic/hhd-optionb-split
- Resultados detallados: `results.json` (referenciado en la model card, ubicación no disponible)
