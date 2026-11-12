# chevron7/DeepSeek-V4-Pro-Qwen3.5-9B-oQ6e

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-oQ6e es una cuantización mixta del checkpoint DeepSeek-V4-Pro-Qwen3.5-9B, publicada por el usuario chevron7 en Hugging Face. El modelo resultante tiene 9.409.813.744 parámetros (aproximadamente 9,41 mil millones) y está empaquetado en formato MLX con pesos safetensors, lo que lo hace directamente ejecutable en el ecosistema de Apple Silicon mediante la librería MLX. La cuantización se ha realizado con la herramienta oQ (oMLX v0.7.4.dev1), que aplica precisión mixta por capas y grupos en lugar de una cuantización uniforme.

El checkpoint conserva un submódulo de visión de 0,456 mil millones de parámetros junto al modelo de lenguaje de 8,954 mil millones, lo que indica que el modelo base es multimodal (texto e imagen). El tamaño total del repositorio es de 8,4 GB, con un peso efectivo medio de 7,151 bits por peso. La distribución no es homogénea: el 85,668% de los pesos lógicos se almacena en 6 bits afín con grupo 64, el 9,475% en 8 bits afín con grupo 64 y el 4,857% restante se mantiene en BF16.

La relevancia de esta publicación es doble. Por un lado, demuestra la viabilidad de ejecutar un modelo multimodal de casi 9,5 mil millones de parámetros en hardware de consumo Apple Silicon con un peso inferior a 8 GB en disco. Por otro, la ausencia de información sobre el modelo base (licencia, idiomas, benchmarks, pipeline) obliga a tratar esta ficha como una descripción técnica de la cuantización más que del modelo original, cuyos detalles no están disponibles en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el tag `qwen3_5` sugiere familia Qwen 3.5; no confirmado en la model card) |
| Parametros totales | 9.409.813.744 (9,41B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: 6-bit afín grupo 64 (85,668%), 8-bit afín grupo 64 (9,475%), BF16 (4,857%); media efectiva 7,151 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX, librería `mlx`) |

Desglose de almacenamiento según la model card:

| Componente | Pesos lógicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 8,954B | 7,499 GB / 6,984 GiB |
| Visión | 0,456B | 0,912 GB / 0,849 GiB |
| Total | 9,410B | 8,411 GB / 7,833 GiB |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base en la documentación proporcionada. El tag `qwen3_5` en Hugging Face sugiere que el checkpoint deriva de la familia Qwen 3.5, pero la model card no confirma ni detalla la arquitectura (transformer denso, MoE, híbrido, atención lineal, etc.). Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF, DPO o instruction tuning. La única información estructural fiable es la presencia de dos componentes diferenciados: un modelo de lenguaje de 8,954B parámetros y un codificador o torre de visión de 0,456B parámetros, lo que confirma capacidad multimodal.

La innovación técnica documentada es la cuantización mixta aplicada con oQ (oMLX v0.7.4.dev1). En lugar de cuantizar todos los pesos al mismo número de bits, oQ asigna 6 bits afín con grupo 64 a la mayor parte de las capas (85,668% de los pesos lógicos), reserva 8 bits para un 9,475% (probablemente capas sensibles como las de atención o las proyecciones de visión) y mantiene un 4,857% en BF16 (posiblemente embeddings, normas o cabezas de salida). El resultado es un checkpoint de 7,833 GiB con una media efectiva de 7,151 bits por peso, un compromiso entre la fidelidad del modelo original y el tamaño en disco. No se documentan técnicas de decodificación especulativa, atención lineal ni optimizaciones de inferencia adicionales.

## Capacidades

- Generación de texto y razonamiento: el componente de lenguaje de 8,954B parámetros soporta las capacidades típicas de un modelo de su familia, aunque no se detallan en la model card.
- Procesamiento de imágenes: la presencia de una torre de visión de 0,456B parámetros confirma capacidad multimodal de entrada visual, si bien no se especifican tareas concretas (VQA, OCR, captioning, etc.).
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se declaran idiomas soportados.
- Modo thinking o razonamiento extendido: no disponible.
- Capacidades de audio: no disponibles; el checkpoint solo documenta lenguaje y visión.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint está empaquetado en formato MLX con un peso de 7,833 GiB, lo que permite ejecutar un modelo multimodal de 9,41B parámetros en Macs con 16 GB de memoria unificada o superior, sin necesidad de GPU dedicada. Es adecuado para prototipado y experimentación en entornos de desarrollo macOS.
- Análisis de documentos con imagen y texto: la combinación de torre de visión y modelo de lenguaje permite procesar capturas, diagramas o páginas escaneadas junto a instrucciones textuales, siempre que el modelo base tenga las capacidades de VQA correspondientes (no confirmadas).
- Asistentes conversacionales de escritorio: al ejecutarse vía MLX, puede integrarse en aplicaciones macOS nativas que requieran generación de texto con contexto local y sin dependencia de la nube, con la ventaja de privacidad que ello implica.
- Evaluación de cuantizaciones: este checkpoint sirve como referencia para comparar la pérdida de calidad de la cuantización mixta oQ (7,151 bits/peso efectivos) frente al modelo base en BF16, útil para investigadores que estudien técnicas de compresión.
- Prototipado de pipelines multimodales: desarrolladores que necesiten un modelo de visión-lenguaje ligero para validar arquitecturas de agentes o sistemas RAG multimodales antes de escalar a modelos mayores.
- Educación y experimentación: al ser un checkpoint cuantizado de bajo peso y con licencia no especificada, puede usarse en entornos docentes para ilustrar el funcionamiento de la cuantización mixta y la inferencia local, siempre que la licencia del modelo base lo permita (dato no disponible).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el checkpoint ocupa 7,833 GiB en disco; en inferencia MLX se necesita al menos esa cantidad más el overhead de activaciones y caché KV. Se estima un mínimo práctico de 10-12 GB de memoria unificada para contexto corto, y 16 GB o más para contextos largos (estimación, no dato oficial).
- GPU recomendadas: el formato MLX está diseñado para Apple Silicon (series M1, M2, M3, M4). No es directamente compatible con CUDA sin conversión previa a otro formato (GGUF, safetensors estándar).
- ¿Cabe en GPU de consumo? Sí, en Apple Silicon con 16 GB o más de memoria unificada (M1 Pro, M2 Pro, M3 Pro, M4 Pro y superiores). En GPUs NVIDIA de consumo (RTX 3060 12 GB, RTX 4070 12 GB, RTX 4090 24 GB) requeriría conversión de formato y una implementación compatible con safetensors cuantizados MLX, que no es estándar.
- Opciones de despliegue: MLX (librería nativa), mlx-lm y mlx-vlm para el componente multimodal. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI en el formato actual.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-9B-oQ6e (este) | 9,41B | no disponible | MLX safetensors (7,151 bits/peso) | no disponible | Hugging Face, 0 descargas |
| Modelo base DeepSeek-V4-Pro-Qwen3.5-9B | 9,41B (estimado) | no disponible | no disponible | no disponible | no disponible en la información |
| Qwen 3.5 9B (referencia de familia) | ~9B (estimado) | no disponible | safetensors, GGUF | no disponible | no confirmado |

No se dispone de datos suficientes para establecer una comparativa rigurosa con alternativas de la misma categoría, ya que no se documentan benchmarks, contexto ni licencia del modelo base ni de los modelos de referencia.

## Limitaciones y advertencias

- Licencia no especificada: la model card no declara licencia, lo que impide determinar si el uso comercial está permitido. Es imprescindible consultar la licencia del modelo base antes de cualquier despliegue en producción.
- Idiomas no declarados: no se especifica qué lenguas soporta el modelo, por lo que no puede asumirse un rendimiento multilingüe sin evaluación previa.
- Contexto desconocido: la longitud de contexto no está documentada, lo que limita la planificación de aplicaciones que dependan de ventanas largas.
- Riesgo de degradación por cuantización: aunque la media efectiva es de 7,151 bits/peso, el 85,668% de los pesos está a 6 bits, lo que puede introducir pérdida de calidad frente al BF16 original, especialmente en tareas de razonamiento matemático o código.
- Sesgos y alucinaciones: no se documentan evaluaciones de sesgo ni de tasa de alucinación; deben asumirse los riesgos habituales de los modelos de lenguaje de su tamaño.
- Compatibilidad limitada: el formato MLX restringe el despliegue a Apple Silicon; no es portable directamente a CUDA, ROCm ni TPU sin conversión.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria de la calidad de la cuantización.
- Modelo base no verificado: no se proporciona enlace ni referencia al checkpoint original DeepSeek-V4-Pro-Qwen3.5-9B, lo que impide auditar la procedencia y los términos del modelo subyacente.

## Enlaces

- Hugging Face: https://huggingface.co/chevron7/DeepSeek-V4-Pro-Qwen3.5-9B-oQ6e
- Repositorio de la herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
- Modelo base DeepSeek-V4-Pro-Qwen3.5-9B: no disponible en la información proporcionada
- Paper, blog o demo del modelo base: no disponible en la información proporcionada
