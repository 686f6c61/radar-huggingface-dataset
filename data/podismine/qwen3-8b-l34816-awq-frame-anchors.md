# podismine/qwen3-8b-l34816-awq-frame-anchors

## Resumen

Este repositorio no contiene un modelo listo para servir, sino un artefacto de investigación sobre cuantización de precisión mixta. Lo publica el usuario podismine y se construye íntegramente sobre Qwen/Qwen3-8B, un transformer denso de aproximadamente 8.200 millones de parámetros desarrollado por el equipo Qwen (Alibaba). El artefacto descompone el proceso de cuantización AWQ en dos piezas: un "frame" compartido que fija las escalas y los umbrales de recorte, y varios "anchors" que aplican una precisión fija (W3, W4 o W8) a todas las proyecciones del decodificador.

La particularidad técnica es que todos los tensores son *fake-quantized* en bf16: se simula el redondeo de la cuantización pero los pesos se almacenan en coma flotante de 16 bits. Por tanto, el artefacto no ofrece ahorro real de memoria ni de cómputo frente al modelo base; su valor es exclusivamente metodológico, como material de partida para estudiar cómo repartir un presupuesto de bits entre capas y proyecciones (el ajuste "l34816" del estudio).

Es relevante ahora porque la asignación óptima de precisión por capa es una de las líneas activas en la compresión de LLM, y disponer de un frame y de anchors reproducibles permite comparar estrategias de *precision budgeting* sobre un mismo punto de partida. Se publica bajo licencia Apache 2.0, con 0 descargas y 0 "likes" en el momento de redactar esta ficha, y con un tamaño de repositorio de 65,8 GB que refleja varias copias completas del modelo en bf16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de Qwen3-8B); el artefacto no modifica la arquitectura, solo aplica cuantización simulada sobre las proyecciones |
| Parametros totales | Aproximadamente 8.200 millones (Qwen3-8B) |
| Parametros activos | No aplica (el modelo base no es MoE) |
| Longitud de contexto | Heredada de Qwen3-8B; no especificada en la model card del artefacto |
| Tipos de cuantizacion | AWQ a 3, 4 y 8 bits (grupo 128, asimétrica); pesos bf16 *fake-quantized* (sin enteros reales) |
| Idiomas soportados | No disponible (los del modelo base Qwen3-8B, no declarados en el repositorio) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El artefacto parte del frame AWQ `qwen3-8b-awq-frame-s3-c348/`, generado con AutoAWQ 0.2.9 mediante una búsqueda de escalas a 3 bits usando la calibración por defecto de AutoAWQ (pileval). Las escalas se pliegan en una copia bf16 del modelo y el fichero `awq_frame_clips.pt` almacena los umbrales de recorte por unidad, buscados para 3, 4 y 8 bits con grupo 128 y esquema asimétrico. Todos los candidatos de precisión del estudio se derivan de estos mismos pesos, de modo que las comparaciones entre configuraciones quedan controladas por un punto de partida común.

Los *anchors* `qwen3-8b-precbudget-l34816-anchor_w{3,4,8}_fr-mathtrain/` aplican la precisión correspondiente a cada proyección del decodificador (W3, W4 o W8), manteniendo `lm_head` y los embeddings en bf16. El sufijo "mathtrain" indica que la calibración de estos anchors se realizó sobre un conjunto de datos matemáticos, distinto del pileval usado para el frame. No se documenta en la información disponible el volumen de tokens de entrenamiento, la composición del dataset del modelo base ni si hubo fases de RLHF o DPO; el artefacto es un proceso de posprocesado de pesos, no un reentrenamiento. Como innovación destacable, permite estudiar de forma aislada el efecto del recorte por unidad y del reparto de bits, ya que los pesos resultantes se cargan con transformers o vLLM igual que el modelo base.

## Capacidades

- Hereda las capacidades del modelo base Qwen3-8B: generación de texto, razonamiento, código y matemáticas.
- Al conservarse la arquitectura y las cabezas en bf16, los anchors deberían comportarse de forma equivalente al modelo base en tareas estándar, aunque no se aportan evaluaciones que lo confirmen.
- Soporte de *tool calling* y *function calling*: no declarado en el repositorio; se asume heredado de Qwen3-8B.
- Capacidades de agente y razonamiento multi-paso: no declaradas en el repositorio.
- Capacidades multilingües: no declaradas en el repositorio.
- Capacidad específica del artefacto: servir como frame reproducible para experimentos de *precision budgeting*, permitiendo derivar variantes W3, W4 y W8 a partir de las mismas escalas y umbrales.
- Los tensores están en bf16 *fake-quantized*, por lo que son cargables pero no ofrecen las ventajas de una cuantización entera real.

## Casos de uso

- Investigación en cuantización de precisión mixta: usar el frame y los anchors para medir cómo degrada la perplejidad al asignar 3, 4 u 8 bits a cada proyección del decodificador, manteniendo constante el resto de variables.
- Reproducibilidad de estudios AWQ: comparar los umbrales de recorte de `awq_frame_clips.pt` con los de otros frames publicados y verificar el efecto del grupo 128 asimétrico.
- Búsqueda de políticas de *precision budget*: emplear los anchors W3/W4/W8 como puntos de referencia para entrenar o derivar asignaciones por capa con criterios de sensibilidad.
- Validación de pipelines de carga: comprobar que transformers y vLLM cargan correctamente tensores *fake-quantized* con `lm_head` y embeddings en bf16.
- Estudio del impacto de la calibración: contrastar la calibración pileval del frame frente a la calibración matemática ("mathtrain") de los anchors sobre el mismo modelo.
- Base para cuantización real posterior: partir de estos pesos para generar versiones enteras con GPTQ, AWQ o GGUF, aprovechando las escalas ya calculadas.
- Análisis de sesgo de recorte: examinar qué unidades resultan más sensibles al recorte a 3 bits y correlacionarlo con su papel en la red.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones de MMLU, HumanEval, GSM8K ni métricas de perplejidad para ninguna de las variantes W3/W4/W8, y el repositorio registra 0 descargas y 0 "likes", por lo que tampoco existen comparaciones reportadas por terceros.

## Requisitos de hardware

- Almacenamiento: el repositorio ocupa 65,8 GB e incluye el frame más los tres anchors, cada uno como copia completa en bf16.
- VRAM para inferencia: como los pesos son bf16, cada variante requiere aproximadamente 16,4 GB solo para los pesos, más el espacio para el contexto y las activaciones (estimación orientativa de 18-22 GB según longitud de secuencia).
- GPU recomendadas: una RTX 4090 o RTX 3090 de 24 GB puede alojar una única variante bf16; para servir varias variantes o contextos largos conviene A100, H100 o GPUs con 40-80 GB.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB como la RTX 4090, siempre que se cargue una sola variante y no se cuantice en enteros.
- Opciones de despliegue: transformers y vLLM, según indica la propia model card; llama.cpp y Ollama no están mencionados y requerirían conversión a GGUF.
- Latencia y throughput: no disponibles; al ser pesos bf16 *fake-quantized* no se espera ninguna mejora de velocidad frente al modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision de pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| podismine/qwen3-8b-l34816-awq-frame-anchors | ~8,2B | Heredado de Qwen3-8B | bf16 *fake-quantized* con escalas AWQ (W3/W4/W8) | apache-2.0 | Artefacto de investigación, 0 descargas |
| Qwen/Qwen3-8B (base) | ~8,2B | El declarado por Qwen para el modelo base | bf16 | apache-2.0 | Modelo oficial listo para servir |
| Cuantizaciones AWQ o GPTQ reales de Qwen3-8B de terceros | ~8,2B | El del modelo base | Enteros de 4 bits (típicamente) | Según el publicador | No disponible en la información proporcionada |

El artefacto no es directamente comparable con una cuantización lista para producción: mientras que una AWQ real reduce el uso de memoria, estos pesos mantienen el tamaño bf16 y solo simulan el redondeo.

## Limitaciones y advertencias

- No es un modelo listo para servir: la propia model card lo describe como "intermediate research artifact".
- Los pesos son bf16 *fake-quantized*; no hay ahorro de memoria, ancho de banda ni cómputo respecto al modelo base.
- No se han publicado evaluaciones de calidad, perplejidad ni tasas de error para las variantes W3/W4/W8.
- El repositorio tiene 0 descargas y 0 "likes", sin validación externa conocida.
- El sufijo "l34816" y el criterio de reparto de bits no están explicados en detalle en la información disponible, lo que dificulta reproducir el estudio sin acceso al código del autor.
- Sesgos conocidos: no disponibles; los del modelo base Qwen3-8B no se documentan en este repositorio.
- Riesgo de alucinación: no evaluado para este artefacto; se asume el del modelo base.
- Limitaciones de idioma: no declaradas; dependen de Qwen3-8B.
- Licencia apache-2.0: permite uso comercial, pero al tratarse de un artefacto intermedio sin evaluación, su uso en producción no está respaldado por evidencias de rendimiento.
- La calibración del frame (pileval) y la de los anchors ("mathtrain") difieren, lo que puede introducir un factor de confusión si se comparan directamente.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/podismine/qwen3-8b-l34816-awq-frame-anchors
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Qwen3 en OpenLM: https://openlm.ai/qwen3/
- Qwen 3.8 en OpenLM: https://openlm.ai/qwen3.8/
- Ficha técnica de Qwen3-8B Instruct (NVIDIA): https://developer.nvidia.com/downloads/assets/ace/model_card/qwen3-8b-instruct.pdf
- Guía del lineup de Qwen 3: https://baeseokjae.github.io/posts/qwen-3-full-lineup-guide-2026/
