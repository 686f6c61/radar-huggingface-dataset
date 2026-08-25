# fwerkor/CID-RQ1-StageA-v0

## Resumen

El modelo `fwerkor/CID-RQ1-StageA-v0` es un artefacto de investigación publicado por el autor `fwerkor` dentro del proyecto *Continuous Interaction Diffusion* (CID), un marco que propone un runtime de difusión nativo para razonamiento asíncrono aumentado con herramientas. Este checkpoint concreto registra la validación de viabilidad del mecanismo de la etapa A (StageA-v0) para el experimento RQ1, y no es el modelo CID final. Está construido sobre `GSAI-ML/iLLaDA-8B-Base`, un modelo de lenguaje de difusión de 8 000 millones de parámetros, y el repositorio incluye los pesos ajustados junto con los resultados de las pruebas.

El propósito principal de este artefacto es documentar un hallazgo negativo y su corrección metodológica: el runtime original no logró crear las celdas de necesidad de información que el diseño exige, pero una intervención de validación (que no modifica los pesos) permitió recuperar la funcionalidad esperada. Este resultado es relevante para la comunidad de investigación en modelos de difusión de lenguaje y uso de herramientas, ya que pone de manifiesto los problemas de acoplamiento entre la supervisión de entrenamiento y la lógica de inferencia, y ofrece una vía de análisis para futuros diseños.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión de lenguaje (basado en `GSAI-ML/iLLaDA-8B-Base`) |
| Parametros totales | 8 000 millones (del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio ocupa 0.9 GB) |

## Arquitectura y entrenamiento

El modelo es una adaptación del checkpoint base `iLLaDA-8B-Base`, un modelo de difusión de lenguaje (diffusion language model) de 8 000 millones de parámetros desarrollado por `GSAI-ML`. Sobre esta base, `fwerkor` entrenó cabezas de interacción específicas para el runtime CID, que permite que el modelo ejecute herramientas, obtenga observaciones y realice proyecciones cognitivas de forma asíncrona. El entrenamiento utilizó supervisión por ranuras físicas aleatorias con una función de pérdida de entropía cruzada binaria por ranura y un umbral de asignación absoluto de 0.8.

La documentación indica que el checkpoint aprendió estas cabezas de interacción de manera efectiva, pero el runtime original falló al crear las celdas de información necesarias. La intervención de validación, que solo cambia la lógica de asignación (sin alterar los pesos), logra recuperar el rendimiento esperado. No se proporcionan datos sobre el conjunto de entrenamiento, el número de tokens ni técnicas como RLHF o DPO.

## Capacidades

- El modelo puede ejecutar herramientas (tool execution) cuando se aplica la intervención de asignación correcta, alcanzando 30 de 32 casos en la prueba de NQ-Open con geometría de 8 ranuras.
- Obtiene observaciones frescas del entorno (fresh observations) y genera proyecciones cognitivas (cognitive projections) en la mayoría de los casos evaluados.
- Presenta una cobertura de observación media del 93.75% con la intervención alineada al entrenamiento.
- Los cabezas de interacción (heads) muestran un buen rendimiento de anclaje de argumentos: fuente argmax 165/165, presencia de argumento media 0.99994 y similitud coseno media de 0.8166.
- No es un modelo de generación de texto general; está especializado en razonamiento asíncrono con herramientas bajo el paradigma CID.
- No se ha documentado soporte para tool calling estándar ni multi-step reasoning fuera del contexto CID.

## Casos de uso

- Validación de mecanismos de interacción en modelos de difusión: el artefacto permite a otros investigadores reproducir y analizar el fallo y la corrección en la creación de celdas de información, lo que facilita el estudio de la co-diseño modelo-runtime.
- Investigación sobre supervisión de entrenamiento y umbrales de decisión: sirve como caso de estudio para entender cómo la supervisión por ranuras físicas aleatorias y un umbral absoluto pueden desalinearse con la lógica de inferencia.
- Desarrollo de runtimes de difusión asíncrona: el código y los resultados de la intervención ofrecen una base para diseñar runtimes más robustos que integren herramientas y observaciones en modelos de difusión.
- Benchmarking de modelos de difusión con herramientas: los resultados de NQ-Open (aunque limitados a 32 ejemplos) pueden utilizarse como punto de referencia para comparar futuras versiones del modelo.
- Estudio de la corrección de errores de etiquetado en datasets: el artefacto documenta una corrección de metadatos (cambio de `train` a `validation`) que puede servir de ejemplo para la gestión de datasets.
- Exploración de la arquitectura de difusión para razonamiento: investigadores interesados en la aplicación de modelos de difusión a tareas de razonamiento con herramientas pueden usar este checkpoint como punto de partida para experimentos.

## Benchmarks y rendimiento

La información proporcionada incluye resultados de validación en un conjunto retenido de NQ-Open (32 ejemplos). No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K. Los resultados específicos son:

| Escenario | Ejecuciones de herramienta | Observaciones frescas | Cobertura media de observación | Convergencia |
|---|---|---|---|---|
| Runtime original | 0/32 | 0/32 | 0% | 0/32 |
| Intervención de asignación (128 slots) | 29/32 | 29/32 | 90.625% | 24/32 |
| Intervención de asignación (8 slots) | 30/32 | 30/32 | 93.75% | 28/32 |

Además, la sonda de cabeza con teacher-forced reporta: fuente argmax 165/165, presencia de argumento media 0.99994, anclaje de argumento (coseno) media 0.8166, y positivos de asignación media 0.1098 con 0/219 superando el umbral original de 0.8.

## Requisitos de hardware

No se ha publicado información específica sobre requisitos de hardware para este artefacto. Como se basa en un modelo de 8 000 millones de parámetros, se espera que la inferencia requiera al menos 16 GB de VRAM en precisión FP16 (por ejemplo, una NVIDIA RTX 4090 o A100), pero este dato no está confirmado. El tamaño del repositorio (0.9 GB) sugiere que los pesos pueden estar cuantizados o parciales, aunque no se indica el formato. No hay recomendaciones oficiales de despliegue ni datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en el mismo contexto (modelos de difusión de lenguaje con integración de herramientas). El propio autor no publica comparativas con alternativas como otros modelos de difusión o modelos de lenguaje tradicionales con tool calling. Por tanto, esta sección no está disponible.

## Limitaciones y advertencias

- El runtime original no logra crear las celdas de información necesarias; solo la intervención de validación (que no cambia pesos) permite obtener resultados útiles. Esto limita su uso directo en producción.
- Es un artefacto de investigación, no un modelo final. El autor indica explícitamente que los experimentos RQ2 y posteriores usan un modelo retrainado con un contrato de entrenamiento/runtime corregido.
- La licencia no está especificada, lo que impide conocer las restricciones de uso comercial o distribución.
- No se documentan sesgos ni riesgos de alucinación, pero al ser un modelo de investigación sin validación amplia, es prudente no utilizarlo en aplicaciones sensibles.
- La evaluación se ha realizado con un conjunto muy reducido (32 ejemplos de NQ-Open), por lo que los resultados no son estadísticamente robustos.
- El modelo no está diseñado para generación de texto general ni para tareas de razonamiento convencional; su propósito es experimental dentro del marco CID.

## Enlaces

- [HuggingFace del modelo](https://huggingface.co/fwerkor/CID-RQ1-StageA-v0)
- [Dataset CID-Dataset](https://huggingface.co/datasets/fwerkor/CID-Dataset)
- [Repositorio del paper (LaTeX)](https://github.com/fwerkor/continuous-interaction-diffusion-paper)
