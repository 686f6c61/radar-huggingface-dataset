# 294-288-pretrain-interaction/14M-random-v2

## Resumen

14M Random v2 es un modelo de lenguaje de aproximadamente 14 millones de parámetros desarrollado por el colectivo 294-288-pretrain-interaction dentro de una campaña de investigación sobre preentrenamiento controlado. No es un modelo de propósito general, sino un artefacto experimental concebido para estudiar la inyección controlada de disparadores (*trigger injection*) durante el preentrenamiento y su interacción con un flujo de datos compartido que los autores denominan M/C/G. El modelo se entrena desde cero y se publica como parte de una matriz de condiciones experimentales.

La relevancia del proyecto es metodológica: la campaña planifica condiciones cruzadas MCG/M/C/G con frecuencias de inyección de 32, 16, 8, 4, 2 y 1 por cada mil millones de tokens, manteniendo checkpoints estables y periodos de enfriamiento (*cooldowns*) independientes de 763 actualizaciones. Cada estado completo conserva pesos, estado de AdamW, planificador, RNG y contadores de inyección, lo que permite reproducir con precisión el entrenamiento y auditar el efecto de cada intervención.

El repositorio incluye evaluaciones con *teacher forcing* sobre un conjunto congelado de 1.536 ejemplos (Random512), sin generación, con puntuaciones JSON emparejadas y NPZ por token. La publicación de checkpoints es incremental y, tal como advierte el autor, la existencia del repositorio no implica que la campaña esté completada. El tamaño del repositorio es de 0.0 GB, lo que sugiere que los pesos podrían no estar presentes o ser de tamaño despreciable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (preentrenamiento desde cero; detalles de capas y dimensiones no disponibles) |
| Parametros totales | ~14 millones (según el nombre del modelo) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repositorio de 0.0 GB; no se confirma la presencia de safetensors o GGUF) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la etiqueta `transformers` y la indicación de que el modelo se entrena desde cero. El elemento diferencial del proyecto no es la arquitectura, sino el protocolo de entrenamiento: una campaña de preentrenamiento con inyección controlada de disparadores sobre un flujo compartido M/C/G. Las condiciones planificadas cruzan la configuración del flujo (MCG, M, C, G) con seis frecuencias de inyección (32, 16, 8, 4, 2 y 1 por cada mil millones de tokens).

El entrenamiento emplea checkpoints estables con estados completos (pesos, AdamW, planificador, RNG y contadores de inyección) y enfriamientos independientes de 763 actualizaciones. No se mencionan datos sobre volumen de tokens total, composición del dataset, ni fases de RLHF o DPO. La evaluación se realiza exclusivamente con *teacher forcing* sobre 1.536 ejemplos congelados, sin generación, lo que refuerza el carácter diagnóstico del artefacto. Los pesos "limpios" se reutilizan del modelo `14M-fixed-v2` únicamente tras comprobaciones de identidad y parentesco, y las líneas base importadas identifican la revisión exacta y el hash del checkpoint de origen.

## Capacidades

- Preentrenamiento de lenguaje a pequeña escala: el modelo está diseñado para modelar texto, no para tareas de usuario final.
- Evaluación con *teacher forcing*: genera puntuaciones por token sobre el conjunto Random512, útil para análisis de probabilidad y perplejidad.
- Inyección de disparadores controlada: permite estudiar cómo responde el modelo a estímulos introducidos durante el preentrenamiento.
- Reproducibilidad experimental: los estados completos de checkpoint permiten reanudar el entrenamiento de forma exacta.
- No se documentan capacidades de tool calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Investigación sobre inyección de disparadores: el modelo sirve como sujeto experimental para medir el efecto de distintas frecuencias de inyección (de 1 a 32 por cada mil millones de tokens) sobre el comportamiento del modelo en evaluación con *teacher forcing*.
- Reproducción de experimentos de preentrenamiento: gracias a los estados completos de checkpoint (pesos, AdamW, planificador, RNG y contadores), un investigador puede reanudar exactamente una ejecución y verificar resultados.
- Análisis de dinámica de entrenamiento a escala pequeña: con 14 millones de parámetros, el coste computacional es mínimo y permite iterar sobre hipótesis de curriculum y flujos de datos M/C/G antes de escalar.
- Auditoría de linaje de checkpoints: el modelo incorpora comprobaciones de identidad y parentesco con `14M-fixed-v2`, lo que lo hace útil para estudiar trazabilidad y procedencia de pesos en pipelines de investigación.
- Evaluación comparativa de líneas base: los resúmenes importados identifican revisión y hash exactos, permitiendo comparaciones controladas entre condiciones experimentales.
- Docencia y formación en preentrenamiento: un modelo de 14M parámetros es viable para demostrar conceptos de entrenamiento, checkpoints y evaluación sin generación en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente describe la existencia de evaluaciones con *teacher forcing* sobre 1.536 ejemplos (Random512) y archivos de resultados en `analysis/results.json` y `analysis/primary.csv`, pero no se proporcionan cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con ~14M parámetros, en FP32 ocuparía aproximadamente 56 MB de pesos, y en FP16 unos 28 MB, pero estos cálculos son estimaciones a partir del nombre del modelo y no datos confirmados.
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU consumer moderna sería suficiente en teoría, pero no se confirma la disponibilidad de pesos.
- Cabe en GPU consumer: probablemente sí dada la escala de 14M parámetros, aunque no hay confirmación oficial.
- Opciones de despliegue: la etiqueta `endpoints_compatible` sugiere compatibilidad con los endpoints de Hugging Face, pero no se detallan opciones como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma campaña o de características equivalentes (preentrenamiento controlado con inyección de disparadores a escala de 14M parámetros). El propio ecosistema del proyecto incluye `14M-fixed-v2` como referencia de pesos limpios, pero no se ofrecen datos comparativos de rendimiento.

## Limitaciones y advertencias

- Modelo de investigación, no de producción: está diseñado para experimentos de preentrenamiento controlado, no para tareas de usuario final.
- Sin datos de benchmarks públicos: no es posible evaluar su calidad frente a alternativas.
- Idiomas y contexto no documentados: se desconoce qué lenguas cubre y su ventana de contexto.
- Repositorio de 0.0 GB: no se confirma que los pesos estén efectivamente publicados; la existencia del repositorio no implica que la campaña esté completada, según el propio autor.
- Riesgo de alucinación: inherente a cualquier modelo de lenguaje, pero no cuantificado para este artefacto.
- Sesgos: no documentados; al ser un modelo pequeño entrenado desde cero, los sesgos dependerán del corpus de preentrenamiento, que no se describe.
- Licencia Apache 2.0: permite uso comercial, pero el modelo no está pensado ni validado para ello.
- Evaluación limitada a *teacher forcing* sin generación: no hay evidencia sobre calidad de texto generado.
- Publicación incremental: los resultados en `analysis/` pueden estar incompletos y las coincidencias con la línea base Clean pueden aparecer como nulas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/294-288-pretrain-interaction/14M-random-v2
- Guía de configuración y supervisión: https://github.com/294-288-pretrain-interaction/pretrain_interaction/blob/1db1a6c2d5e53f5f78d710a4045bb8890b4f3de4/campaign/RANDOM_SMALL_JIAOLAB.md
- Modelo de referencia de pesos limpios: https://huggingface.co/294-288-pretrain-interaction/14M-fixed-v2
