# Saraswathy/vlm-mix-broader-stem-expert-step90-adapter

## Resumen

`Saraswathy/vlm-mix-broader-stem-expert-step90-adapter` es un adaptador LoRA publicado por el usuario Saraswathy sobre el modelo base multimodal `Qwen/Qwen3-VL-4B-Instruct`. No se trata de un modelo completo ni de un checkpoint reanudable: la propia model card indica que corresponde al paso global 90 de un entrenamiento y que no se conservaron los fragmentos de modelo ni de optimizador, por lo que su función es la evaluación del adaptador, no la continuación del entrenamiento. El repositorio ocupa 0,5 GB y se distribuye en formato PEFT con pesos safetensors.

El interés de esta ficha es limitado pero claro: sirve como ejemplo de adaptador LoRA especializado en dominios STEM («broader STEM expert») sobre un VLM de 4.000 millones de parámetros, y como caso práctico de los problemas de trazabilidad que aparecen cuando se publican checkpoints intermedios sin model card completa. La información pública disponible es muy escasa: no se declaran licencia, idiomas ni métricas de evaluación, y el número de descargas y «likes» es cero en el momento de la consulta.

Por tanto, cualquier equipo que quiera reutilizarlo debe asumir que las especificaciones del modelo base (longitud de contexto, idiomas, licencia) son las del Qwen3-VL-4B-Instruct, y que el comportamiento específico del adaptador no está documentado ni validado con benchmarks públicos. La fecha de creación del repositorio es el 12 de septiembre de 2026.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer multimodal del modelo base Qwen/Qwen3-VL-4B-Instruct (vision-language model); arquitectura interna del adaptador: no disponible |
| Parametros totales | No disponible para el adaptador; el modelo base declarado tiene 4B de parámetros. El repositorio pesa 0,5 GB |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible para el adaptador; depende del modelo base Qwen/Qwen3-VL-4B-Instruct (no verificada en la información proporcionada) |
| Tipos de cuantizacion | No disponible. Al ser un adaptador LoRA, la cuantización se aplica al modelo base (no se documentan recetas en el repositorio) |
| Idiomas soportados | No disponible en el repositorio; heredados del modelo base (no verificados) |
| Licencia | No disponible |
| Formato de pesos | safetensors (librería PEFT). Incluye `SHA256SUMS.json` para verificación de integridad |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, no un modelo entrenado desde cero. Se carga sobre `Qwen/Qwen3-VL-4B-Instruct`, un modelo multimodal de tipo image-text-to-text, y modifica sus pesos mediante matrices de bajo rango. El repositorio no especifica el rango (r), el alpha, los módulos objetivo ni el dropout del adaptador, ni tampoco si se aplicó al torre de visión, al proyector multimodal o únicamente a las capas de atención del decodificador de texto. Tampoco se documenta el número de parámetros entrenables ni el porcentaje que representan respecto al modelo base.

Respecto al entrenamiento, la model card indica únicamente que corresponde al «global step 90» de un proceso no descrito, bajo el nombre «Broader STEM expert». No se detalla el volumen de tokens, la composición del dataset, el uso de RLHF o DPO, ni la estrategia de mezcla multimodal (proporción de pares imagen-texto frente a texto puro). El autor advierte explícitamente de que este checkpoint no preservó los fragmentos de modelo ni de optimizador y que, por tanto, no constituye un estado completo para reanudar el entrenamiento. No se describe ninguna innovación técnica (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto e inferencia multimodal image-text-to-text, siempre que se cargue junto con el modelo base `Qwen/Qwen3-VL-4B-Instruct`.
- Especialización declarada por el autor en dominios STEM («broader STEM expert»), si bien no se aportan evidencias cuantitativas ni ejemplos de evaluación que la respalden.
- Capacidades heredadas del modelo base (razonamiento, código, matemáticas, visión) en la medida en que el adaptador no las degrade: no disponible, no evaluado.
- Soporte de tool calling / function calling: no disponible para el adaptador; depende del modelo base y no se documenta en el repositorio.
- Soporte de agentes y razonamiento multi-paso: no disponible, no documentado.
- Capacidades multilingües: no disponibles; no se declaran idiomas en el repositorio.
- Modo «thinking» u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Evaluación comparativa de adaptadores LoRA: cargar el adaptador sobre Qwen3-VL-4B-Instruct y medir la variación de rendimiento frente al modelo base sin adaptador en tareas STEM, usando un conjunto de validación propio. Es el uso para el que el propio autor declara el artefacto («evaluation-ready»).
- Reproducción de experimentos académicos: útil como punto de control intermedio (paso 90) para estudiar la evolución de una especialización STEM durante el entrenamiento, siempre que no se necesite reanudar el entrenamiento, ya que faltan los estados de modelo y optimizador.
- Extracción de información de figuras y tablas científicas: el modelo base multimodal permite introducir una imagen de un paper o de un gráfico y pedir la transcripción o interpretación de los datos; el adaptador podría modular el estilo o el vocabulario técnico, aunque no hay evidencia publicada.
- Asistencia en resolución de problemas de matemáticas y física a partir de enunciados manuscritos o fotografiados: sobre un VLM, la entrada sería la imagen del problema y la salida el desarrollo; requiere validación propia porque no hay benchmarks del adaptador.
- Docencia y generación de material didáctico STEM: producir explicaciones paso a paso a partir de diagramas o esquemas, con verificación humana posterior dado el riesgo de alucinación inherente a un modelo de 4B.
- Investigación en ajuste eficiente de parámetros (PEFT): analizar cómo se comporta un adaptador de bajo rango en la torre de visión de un VLM, comparando configuraciones de rango y módulos objetivo.
- Auditoría de integridad de artefactos: uso del fichero `SHA256SUMS.json` incluido en el repositorio para verificar que los pesos descargados no han sido alterados, paso recomendable antes de cualquier despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K, MMMU, MathVista ni de ninguna otra suite, y la búsqueda web realizada no devolvió documentación técnica, paper ni entrada de blog asociada al adaptador. Tampoco se dispone de comparaciones con el modelo base sin adaptador, por lo que no es posible cuantificar el efecto del ajuste LoRA en el paso 90.

## Requisitos de hardware

- VRAM para el modelo base en bf16: aproximadamente 8 GB solo para los pesos de 4B parámetros, más el coste de activaciones, caché KV y el codificador de visión. En la práctica, entre 10 y 12 GB para inferencia con contexto moderado.
- VRAM con cuantización de 4 bits del modelo base: del orden de 3 a 4 GB de pesos, más overhead; el adaptador LoRA se puede cargar en precisión completa sobre la base cuantizada.
- Espacio en disco: 0,5 GB para el adaptador, más el tamaño del modelo base descargado aparte.
- GPU consumer: un modelo de 4B con cuantización de 4 bits cabe en GPUs con 8 GB de VRAM (RTX 3060 Ti, RTX 2070, RTX 4060) y con holgura en 12-16 GB (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080). En bf16 sin cuantizar es razonable en GPUs de 16 GB o más (RTX 4090, A4000). Para lotes grandes o contextos muy largos se recomienda A100 40/80 GB o H100.
- Opciones de despliegue: al ser un adaptador PEFT, los caminos naturales son Hugging Face Transformers con `peft`, vLLM con soporte de LoRA (`--enable-lora`), TGI con adaptadores, o la conversión a GGUF para llama.cpp/Ollama si se fusiona previamente con el modelo base. No se documenta ninguna de estas rutas en el repositorio.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia de primera token para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Saraswathy/vlm-mix-broader-stem-expert-step90-adapter | Adaptador LoRA sobre base de 4B (tamaño del adaptador: 0,5 GB) | No disponible (depende del base) | No disponible | Hugging Face, 0 descargas | Checkpoint intermedio del paso 90; no reanudable |
| Qwen/Qwen3-VL-4B-Instruct (modelo base) | 4B | No verificada en la información disponible | No disponible en esta ficha (consultar la del modelo base) | Hugging Face | Modelo completo image-text-to-text; es el punto de comparación directo |
| Otros adaptadores LoRA sobre Qwen3-VL-4B | No disponible | No disponible | No disponible | No disponible | No se han identificado alternativas comparables en la búsqueda realizada |

No se dispone de datos de benchmarks ni de especificaciones verificadas de terceros que permitan una comparación cuantitativa con alternativas de la misma categoría, como otros adaptadores STEM o VLMs de tamaño similar.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. No se ha publicado ninguna evaluación de sesgo, toxicidad o equidad para este adaptador.
- Riesgo de alucinación: inherente a un modelo de 4B y no cuantificado aquí. Al estar especializado en STEM, las alucinaciones en contenido técnico (fórmulas, referencias, datos numéricos) pueden ser especialmente difíciles de detectar sin verificación externa.
- Limitaciones de contexto e idioma: no documentadas; dependen por completo del modelo base. No se declaran idiomas soportados en el repositorio.
- Licencia: no disponible. Sin una licencia explícita, no se puede asumir permiso para uso comercial; conviene contactar con el autor o tratar el artefacto como no apto para producción.
- Estado del checkpoint: el autor advierte de que no se conservaron los fragmentos de modelo ni de optimizador. No sirve para reanudar el entrenamiento y no debe tratarse como un checkpoint completo.
- Ausencia de model card completa: faltan hiperparámetros del LoRA (r, alpha, módulos objetivo), receta de entrenamiento, composición del dataset y métricas. Esto limita la reproducibilidad.
- Adopción nula: 0 descargas y 0 «likes» en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.
- Integridad: el repositorio incluye `SHA256SUMS.json`; se recomienda verificar los ficheros antes de cargarlos, especialmente porque no hay firma ni procedencia verificable más allá del propio autor.
- Fecha de creación futura respecto a la mayoría de referencias: el repositorio figura creado el 12 de septiembre de 2026, dato a tener en cuenta al interpretar cualquier comparación temporal.

## Enlaces

- Repositorio del adaptador en Hugging Face: https://huggingface.co/Saraswathy/vlm-mix-broader-stem-expert-step90-adapter
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Documentación de PEFT (librería declarada): https://huggingface.co/docs/peft
- Paper, blog, repositorio de código o demo asociados: no disponible. La búsqueda web realizada no devolvió resultados relevantes (únicamente enlaces genéricos a YouTube y YouTube Music, sin relación con el modelo).
