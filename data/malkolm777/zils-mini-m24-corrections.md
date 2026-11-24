# malkolm777/zils-mini-m24-corrections

## Resumen

zils-mini-m24-corrections es un ajuste fino (fine-tune) de tipo LoRA sobre atención de rango 32, publicado por el usuario malkolm777 en Hugging Face. Se construye a partir de una mezcla ("soup") de dos modelos base: joamCriff123/zils-mini-m1121t y malkolm777/zils-mini-p21uniform. El modelo se presenta como un "decision-model" (modelo de decisión) dentro de la familia zils, orientado a tareas de clasificación o selección de decisiones verificadas.

El entrenamiento consistió en una única pasada de LoRA sobre 800 decisiones verificadas, de las cuales 550 son ejemplos difíciles y 250 son ejemplos de replay (repetición de datos previos para evitar olvido catastrófico). Se usó una tasa de aprendizaje de 0,00006 y una semilla fija (223744), lo que sugiere un ajuste conservador y reproducible.

El modelo tiene 4.539.265.536 parámetros totales (aproximadamente 4,54 mil millones) según los pesos en safetensors, con un tamaño de repositorio de 9,1 GB. La arquitectura se etiqueta como `qwen3_5` con código personalizado (`custom_code`), lo que implica que requiere cargar módulos específicos del repositorio para su ejecución. La licencia es Apache 2.0. No se dispone de información sobre contexto, idiomas ni pipeline en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer, con custom_code) |
| Parametros totales | 4.539.265.536 (~4,54 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura declarada es `qwen3_5`, lo que indica una variante de la familia Qwen 3.5, aunque el repositorio incluye `custom_code`, por lo que la implementación exacta requiere el código incluido en el propio repositorio y no puede ejecutarse con una versión estándar de transformers sin cargar dichos módulos. No se especifica si se trata de un transformer denso o de una arquitectura híbrida; el número de parámetros (~4,54 B) es consistente con un modelo denso de tamaño medio.

El entrenamiento consistió en una pasada de LoRA de rango 32 aplicada a las capas de atención, sobre un conjunto de 800 decisiones verificadas (550 difíciles y 250 de replay). La tasa de aprendizaje fue de 0,00006 y la semilla 223744. El punto de partida fue una "soup" (mezcla de pesos) de dos modelos, identificada con el hash c87e4c4b4bd6ec928d4de7569b5fc12fe1ba81a3f65265b43b23fb280baff246. No se documentan el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO. Tampoco se describen innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y razonamiento: al derivar de la familia Qwen 3.5, se espera capacidad de generación y razonamiento general, aunque no se documentan evaluaciones específicas.
- Modelo de decisión: el autor lo etiqueta como `decision-model` y `d3-mini`, lo que sugiere un uso orientado a tareas de selección o clasificación de decisiones, no confirmado con benchmarks.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; el campo de idiomas no está relleno en la model card.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Clasificación de decisiones verificadas: el modelo se entrenó específicamente sobre 800 decisiones verificadas, por lo que su uso más directo es evaluar o seleccionar opciones en un conjunto de decisiones con criterios predefinidos, aprovechando el ajuste LoRA sobre atención.
- Filtrado de ejemplos difíciles en pipelines de datos: dado que el 68,75 % del entrenamiento fueron ejemplos difíciles (550 de 800), puede emplearse como clasificador de casos límite en procesos de curación de datos.
- Replay y control de olvido catastrófico: los 250 ejemplos de replay indican que el modelo conserva parte del comportamiento de los modelos base; puede usarse como punto de partida para ajustes posteriores con bajo riesgo de degradación.
- Investigación sobre LoRA de atención: al ser un ajuste de rango 32 documentado con hiperparámetros concretos (lr 0,00006, semilla 223744), sirve como referencia reproducible en estudios de fine-tuning eficiente.
- Prototipado de modelos de decisión en dominios acotados: para equipos que necesiten un modelo de ~4,5 B con licencia Apache 2.0 y pesos safetensors, puede integrarse en entornos de experimentación con recursos moderados.
- Base para "model soups": al provenir de una mezcla de dos modelos, puede utilizarse como componente en nuevas mezclas de pesos para explorar combinaciones de comportamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por el tamaño (4,54 B parámetros), en FP16 requeriría aproximadamente 9 GB de VRAM solo para pesos, más overhead de activaciones y contexto; en cuantización de 8 bits rondaría 4,5-5 GB y en 4 bits unos 2,5-3 GB, aunque estas cifras no están confirmadas por el autor.
- GPU recomendadas: no disponible. Por tamaño, cabría en GPUs de consumo con 8-12 GB o más (por ejemplo, RTX 3060 12 GB, RTX 4070, RTX 4090) si se cuantiza, y en A100/H100 para FP16 sin cuantizar.
- Cabe en consumer GPU: probablemente sí con cuantización, pero no confirmado.
- Opciones de despliegue: no disponible. Al requerir `custom_code`, es necesario cargar el código del repositorio; no se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de benchmarks ni especificaciones de modelos comparables de la misma familia o tamaño en la información disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor.
- Riesgo de alucinación: no evaluado; al ser un modelo de decisión ajustado sobre un conjunto pequeño (800 ejemplos), la generalización fuera de ese dominio es incierta.
- Limitaciones de contexto o idioma: la longitud de contexto y los idiomas soportados no están especificados en la model card.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el repositorio incluye `NOTICE` con atribuciones de los modelos upstream que deben respetarse; además, los modelos base (joamCriff123/zils-mini-m1121t y malkolm777/zils-mini-p21uniform) podrían tener condiciones propias no detalladas aquí.
- Caveat para producción: el modelo requiere `custom_code` y no tiene descargas ni likes (0/0), por lo que carece de validación comunitaria; no se recomienda su uso en producción sin evaluación propia.
- Reproducibilidad: se documentan semilla e hiperparámetros, pero no el dataset exacto ni el número de tokens, lo que limita la replicación completa.

## Enlaces

- Hugging Face: https://huggingface.co/malkolm777/zils-mini-m24-corrections
- Modelo base 1: https://huggingface.co/joamCriff123/zils-mini-m1121t
- Modelo base 2: https://huggingface.co/malkolm777/zils-mini-p21uniform
