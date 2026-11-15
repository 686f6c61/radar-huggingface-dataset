# goodmai/gemma-4-12B-it-qat-4bit

## Resumen

`goodmai/gemma-4-12B-it-qat-4bit` es una conversión al ecosistema MLX del modelo multimodal `mlx-community/gemma-4-12B-it-qat-4bit`, que a su vez deriva de la familia Gemma 4 de Google en su variante instruct de aproximadamente 12.000 millones de parámetros, cuantizada a 4 bits mediante quantisation-aware training (QAT). El modelo acepta entradas de imagen y texto y genera texto, por lo que su pipeline declarado es `image-text-to-text`. El repositorio lo publica el usuario `goodmai` como distribución orientada a Apple Silicon, con integración con la herramienta Basalt (app macOS y CLI sin Python) y dependencia de `mlx-vlm` para su uso programático.

El interés práctico del modelo reside en dos factores. Primero, el uso de QAT en lugar de cuantización post-entrenamiento: el ajuste se realiza durante el entrenamiento para que el modelo aprenda a operar con pesos de 4 bits, lo que habitualmente reduce la degradación respecto a una cuantización a posteriori. Segundo, el formato MLX permite ejecutar un modelo multimodal de ~12B parámetros en hardware Apple Silicon con un peso en disco de aproximadamente 11 GB, lo que lo sitúa en el rango de un Mac con 16-24 GB de memoria unificada.

La información pública disponible es escasa: el repositorio no incluye model card propia más allá de las instrucciones de uso, no declara licencia explícita y no publica resultados de benchmarks. La ficha se limita, por tanto, a los datos verificables del repositorio y del modelo de origen, marcando como "no disponible" todo aquello que no puede confirmarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Gemma 4, variante `gemma4_unified`); detalles internos no disponibles |
| Parametros totales | 11.959.730.224 (~12B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (QAT, quantisation-aware training) |
| Idiomas soportados | en (ingles declarado; el modelo base Gemma soporta multiples idiomas, pero este repo solo declara `en`) |
| Licencia | no disponible |
| Formato de pesos | safetensors (formato MLX) |
| Libreria / runtime | mlx, mlx-vlm |
| Pipeline | image-text-to-text |
| Tamano del repositorio | ~11.0 GB |
| Modalidades de entrada | imagen y texto |
| Modalidad de salida | texto |

## Arquitectura y entrenamiento

El modelo pertenece a la familia Gemma 4 de Google, en su variante instruct y con arquitectura marcada como `gemma4_unified`, que integra un codificador visual con el decodificador de lenguaje para tareas image-text-to-text. El repositorio no documenta el número de capas, dimensiones ocultas, número de cabezas de atención ni el mecanismo exacto de fusión visión-lenguaje, por lo que esos detalles se consideran no disponibles a partir de la información proporcionada.

El punto técnico diferencial es la cuantización con conciencia de cuantización (QAT) a 4 bits: en lugar de cuantizar los pesos una vez entrenado el modelo, el entrenamiento incorpora la simulación de la cuantización, de modo que los pesos aprenden a ser robustos frente a la reducción de precisión. El resultado es un checkpoint de ~12B parámetros almacenado en aproximadamente 11 GB, lo que equivale a unos 7,3 bits por parámetro efectivos incluyendo metadatos y tensores no cuantizados, coherente con una mezcla de pesos a 4 bits y componentes en mayor precisión. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Comprensión de imágenes y respuesta en texto (image-text-to-text): descripción de imágenes, respuesta a preguntas visuales y razonamiento sobre contenido visual.
- Modo instruct: el sufijo `-it` indica ajuste para seguir instrucciones y mantener formato conversacional.
- Inferencia en Apple Silicon mediante MLX y `mlx-vlm`, con soporte de ejecución local sin dependencia de servicios en la nube.
- Integración con la app y CLI Basalt para macOS (Apple Silicon), que expone el modelo vía REST.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de audio: no disponible.

## Casos de uso

- Descripción y etiquetado automático de imágenes en local: el modelo puede recibir una imagen y generar una descripción textual, útil para construir pipelines de catalogación de imágenes sin enviar datos a servicios externos, aprovechando la ejecución local en macOS.
- Asistente conversacional de escritorio en Apple Silicon: con ~11 GB de pesos, puede desplegarse en un Mac con memoria unificada suficiente y servir como chatbot local mediante `basalt serve --rest`, manteniendo la conversación en el dispositivo.
- Procesamiento de documentos escaneados con componente visual: al aceptar imagen y texto, puede responder preguntas sobre capturas, diagramas o formularios siempre que la tarea se plantee como image-text-to-text.
- Prototipado de aplicaciones multimodales en macOS: desarrolladores que quieran validar una UX de visión-lenguaje pueden usar `mlx-vlm` para integrar el modelo en una app Swift o Python sin infraestructura GPU dedicada.
- Evaluación comparativa de cuantización QAT frente a post-entrenamiento: investigadores pueden medir la degradación de un modelo 12B multimodal a 4 bits QAT frente a su versión en mayor precisión en tareas de visión y texto.
- Generación de descripciones accesibles: creación de texto alternativo para imágenes en flujos de publicación de contenidos, ejecutado localmente para preservar la privacidad de los materiales.
- Experimentación con modelos Gemma 4 en entornos sin CUDA: equipos que trabajan exclusivamente en macOS pueden reproducir experimentos de la familia Gemma sin necesidad de GPUs NVIDIA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones multimodales (MMMU, DocVQA, etc.), y tampoco se dispone de comparaciones oficiales frente a la versión sin cuantizar.

## Requisitos de hardware

- VRAM / memoria unificada estimada: ~11 GB de pesos en disco; para inferencia se recomienda un mínimo de 16 GB de memoria unificada y, para contexto largo o imágenes de alta resolución, 24 GB o más.
- Hardware objetivo: Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra). El repositorio está etiquetado como `mlx` y la integración Basalt requiere macOS 27+ y Apple Silicon.
- GPUs NVIDIA: no aplicable de forma nativa; el formato es MLX, no GGUF ni safetensors estándar de PyTorch. Para CUDA sería necesario recurrir al modelo de origen en otro formato.
- Cabe en GPU de consumo: sí, en el sentido de memoria unificada de Macs con 16 GB o más; en GPUs dedicadas NVIDIA no se puede ejecutar directamente este checkpoint.
- Opciones de despliegue: `mlx-vlm` (Python), Basalt (app macOS y CLI con servidor REST), y cualquier runtime compatible con MLX.
- Latencia y throughput: no disponibles. Dependen del chip Apple Silicon concreto, de la longitud de contexto y del tamaño de las imágenes de entrada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Runtime |
|---|---|---|---|---|---|
| goodmai/gemma-4-12B-it-qat-4bit | ~12B | no disponible | imagen + texto | no disponible | MLX |
| mlx-community/gemma-4-12B-it-qat-4bit (origen) | ~12B | no disponible | imagen + texto | no disponible | MLX |
| Gemma 4 12B-it (formato original) | ~12B | no disponible | imagen + texto | no disponible en esta ficha | PyTorch / safetensors |
| Otros modelos multimodales ~12B | no disponible | no disponible | imagen + texto | varía | varía |

La comparación cuantitativa con alternativas de la misma categoría (por ejemplo, modelos multimodales de tamaño similar de otras familias) no puede realizarse con los datos disponibles: no se han publicado benchmarks ni se dispone de especificaciones del modelo base más allá de su tamaño y modalidad.

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no especifica licencia, lo que impide confirmar si el uso comercial está permitido. Es imprescindible verificar la licencia del modelo Gemma 4 original antes de cualquier despliegue en producción.
- Idioma: el repositorio solo declara inglés (`en`); el rendimiento en castellano no está verificado y podría ser inferior al del modelo base sin cuantizar.
- Cuantización a 4 bits: aunque QAT mitiga la pérdida, sigue siendo una reducción de precisión que puede afectar a tareas sensibles como OCR fino, razonamiento matemático o generación de código.
- Riesgo de alucinación: inherente a los modelos generativos, especialmente en descripciones de imágenes ambiguas o preguntas visuales con detalle fino.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de validación independiente de la conversión; conviene tratar el checkpoint con cautela y compararlo con el de `mlx-community`.
- Dependencia de hardware: solo ejecutable en Apple Silicon vía MLX; no es portable a CUDA sin reconversión.
- Contexto no documentado: se desconoce la ventana máxima, lo que dificulta planificar cargas con documentos largos o múltiples imágenes.
- Model card mínima: no se documentan sesgos conocidos, datos de entrenamiento ni evaluaciones de seguridad; el despliegue en producción requiere evaluaciones propias.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/goodmai/gemma-4-12B-it-qat-4bit
- Modelo de origen: https://huggingface.co/mlx-community/gemma-4-12B-it-qat-4bit
- Repositorio Basalt en GitHub: https://github.com/goodmai/basalt
- Demo Basalt (chat): https://goodmai-run-with-basalt.hf.space/?model=goodmai%2Fgemma-4-12B-it-qat-4bit&role=chat
- Demo Basalt (inglés): https://goodmai-run-with-basalt.hf.space/?model=goodmai%2Fgemma-4-12B-it-qat-4bit&role=chat&lang=en
- Documentación de MLX: https://github.com/ml-explore/mlx
- MLX-VLM: https://github.com/Blaizzy/mlx-vlm
