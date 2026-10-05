# minjaechoi/qwen3p6-35b-a3b-2p01bit-r61

## Resumen

El modelo `minjaechoi/qwen3p6-35b-a3b-2p01bit-r61` es un checkpoint de investigación derivado de `Qwen/Qwen3.6-35B-A3B`, publicado por el usuario minjaechoi en HuggingFace. Se trata de una variante cuantizada en la que únicamente los expertos enrutados (routed experts) de la arquitectura MoE han sido comprimidos a una media de 2,0127 bits, mientras que el resto de pesos se mantiene en BF16. El identificador interno del checkpoint es r61.

El problema que aborda es acotado y de naturaleza experimental: explorar el impacto de una cuantización extremadamente agresiva (por debajo de 3 bits) limitada a las capas de expertos de un modelo de mezcla de expertos, sin tocar el resto de la red. No se trata de una release orientada a producción, sino de un artefacto para reproducir y evaluar técnicas de cuantización sobre arquitecturas MoE.

El dato técnico más relevante es que los pesos se almacenan ya descomprimidos en tensores BF16: el repositorio ocupa 70,2 GB para 35.107.181.936 parámetros, lo que significa que no hay ahorro de memoria ni de disco respecto a un checkpoint BF16 equivalente. La etiqueta «2,0127 bits» describe la precisión efectiva de los expertos enrutados durante el proceso de cuantización, no el formato de almacenamiento. No hay model card descriptiva, ni datos de evaluación, ni licencia explícita, y el modelo acumula cero descargas y cero valoraciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE tipo transformer (tag `qwen3_5_moe`); número de capas, atención y detalles de enrutamiento no disponibles |
| Parametros totales | 35.107.181.936 |
| Parametros activos | No disponible. La nomenclatura «A3B» del nombre sugiere del orden de 3.000 millones de parámetros activos, pero no se confirma en la información proporcionada |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Expertos enrutados a 2,0127 bits de media; resto de pesos en BF16. Los pesos se almacenan descomprimidos en tensores BF16 |
| Idiomas soportados | No disponible |
| Licencia | No disponible. La model card indica únicamente que «la licencia sigue la del modelo base», sin especificar cuál es |
| Formato de pesos | Safetensors |
| Libreria | Transformers (`transformers`, también compatible con vLLM según la model card) |
| Tarea declarada | `text-generation` (`pipeline_tag`); incluye la etiqueta `image-text-to-text` |
| Tamaño del repositorio | 70,2 GB |
| Modelo base | `Qwen/Qwen3.6-35B-A3B` |
| Identificador interno | r61 |

## Arquitectura y entrenamiento

No se dispone de información sobre el proceso de entrenamiento: la model card es un documento mínimo de tres párrafos y no detalla número de tokens, composición del dataset, fases de ajuste (SFT, RLHF, DPO) ni ninguna innovación técnica asociada al entrenamiento. Lo único documentado es que se trata de un derivado de `Qwen/Qwen3.6-35B-A3B` y que la intervención consiste en cuantizar los expertos enrutados.

Respecto a la arquitectura, la etiqueta `qwen3_5_moe` y la propia descripción confirman un diseño de mezcla de expertos con enrutamiento, en el que los expertos rutenados se comprimen a una media de 2,0127 bits mientras el resto de la red permanece en BF16. La cuantización es, por tanto, selectiva y no global. Un punto crítico para quien vaya a usar el repo: los pesos se guardan descomprimidos en BF16, de modo que la carga se realiza con `transformers` o vLLM estándar sin necesidad de kernels de cuantización especiales, pero tampoco se obtiene ninguna ventaja de memoria o velocidad por el hecho de que los expertos hayan sido cuantizados a 2 bits. El valor del artefacto es analítico (estudiar el efecto de la compresión extrema en el enrutamiento y en la calidad de salida), no operativo.

## Capacidades

La información disponible no documenta capacidades funcionales del modelo. Los únicos indicios son las etiquetas del repositorio:

- Generación de texto: la tarea declarada es `text-generation`.
- Conversación: incluye la etiqueta `conversational`.
- Procesamiento de imagen y texto: incluye la etiqueta `image-text-to-text`, lo que apunta a un modelo multimodal, aunque la model card no describe ninguna capacidad de visión ni se especifica el codificador visual.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo de razonamiento explícito (thinking), audio u otras capacidades especiales: no disponible.

No debe asumirse ninguna capacidad heredada del modelo base más allá de lo que indican las etiquetas, ya que la cuantización de los expertos a 2 bits puede degradar de forma no medida el comportamiento original.

## Casos de uso

- Investigación en cuantización de MoE: el checkpoint permite analizar cómo afecta una compresión media de 2,0127 bits en los expertos enrutados a las decisiones del router y a la distribución de activaciones, comparando contra el modelo base en BF16. Es el uso principal y coherente con la naturaleza de checkpoint de investigación interna.
- Ablación de precisión por componente: sirve para aislar el coste de cuantizar únicamente los expertos frente a cuantizar también atención o embeddings, un experimento habitual en la literatura de compresión de modelos dispersos.
- Evaluación de robustez del enrutamiento: al mantener el resto de la red en BF16, se puede medir si el router sigue seleccionando expertos coherentes cuando estos han perdido precisión extrema, y si aparecen colapsos de carga entre expertos.
- Referencia para pipelines de cuantización extrema: equipos que desarrollen herramientas propias de compresión pueden usar r61 como caso de prueba reproducible sobre una arquitectura MoE de 35.000 millones de parámetros.
- Estudio de viabilidad de despliegue en hardware limitado: aunque esta release no ahorra memoria (los pesos están en BF16), los resultados de calidad obtenidos permiten estimar si merece la pena producir una versión realmente empaquetada a 2 bits para GPUs de gama alta con memoria ajustada.
- Docencia y divulgación técnica: como ejemplo tangible de las diferencias entre «bits efectivos de cuantización» y «bytes reales en disco», un error de interpretación frecuente al leer fichas de modelos cuantizados.
- No se recomienda su uso en producción, atención al cliente, generación de código ni pipelines de agentes, dado que no existen evaluaciones publicadas que respalden un comportamiento fiable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye ninguna métrica (MMLU, HumanEval, GSM8K, MMLU-Pro, evaluaciones multimodales ni comparaciones con el modelo base) y los resultados de la búsqueda web no contienen información relevante sobre el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos suman 35.107.181.936 parámetros almacenados en BF16, lo que equivale a aproximadamente 70 GB solo en pesos. Hay que añadir la memoria de la caché KV y de activaciones, por lo que en la práctica se necesitan del orden de 75-85 GB de VRAM para inferencia en BF16 con contexto moderado.
- GPU recomendadas: una única GPU de 80 GB (A100 80 GB, H100 80 GB, H200) es el mínimo razonable. Con 2x A100 40 GB, 2x L40S o 2x A6000 se puede repartir el modelo entre dispositivos.
- Cabe en GPU de consumo: no. Ni la RTX 4090 (24 GB) ni la RTX 5090 (32 GB) pueden alojar el checkpoint tal cual se distribuye. Sería necesario cuantizar de nuevo a 4 bits o menos, algo que esta release no ofrece.
- Opciones de despliegue: la model card indica carga con `transformers` estándar y con vLLM. No se documentan ficheros GGUF, por lo que llama.cpp y Ollama no son aplicables directamente a este repositorio.
- Latencia y throughput estimados: no disponibles. Al no existir kernels de cuantización activos (los pesos se cargan en BF16), el rendimiento esperable sería similar al del modelo base en BF16, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Formato de pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `minjaechoi/qwen3p6-35b-a3b-2p01bit-r61` | 35.107.181.936 | No disponible | No disponible | Safetensors (BF16 descomprimido) | No disponible | 0 descargas, 0 likes |
| `Qwen/Qwen3.6-35B-A3B` (base) | No disponible en la información proporcionada | No disponible | No disponible | No disponible | No disponible | Modelo base referenciado |
| Otras alternativas de tamaño y tarea comparables | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento, contexto ni licencia del modelo base ni de terceros comparables dentro de la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay métricas de calidad, de degradación respecto al modelo base ni de comportamiento del router tras la cuantización. Cualquier uso sin evaluación previa es especulativo.
- Sin ahorro de memoria: a pesar del nombre, los pesos se almacenan descomprimidos en BF16 y el repositorio ocupa 70,2 GB. No reduce requisitos de VRAM frente a un checkpoint BF16 equivalente.
- Licencia indeterminada: la model card remite a la licencia del modelo base sin nombrarla. No se puede confirmar que el uso comercial esté permitido; debe verificarse en el repositorio de `Qwen/Qwen3.6-35B-A3B` antes de cualquier explotación.
- Idioma y contexto sin documentar: se desconoce qué idiomas cubre y cuál es su ventana de contexto real, lo que impide planificar despliegues multilingües o de contexto largo.
- Riesgo de alucinación no medido: no existe ninguna evaluación de fidelidad factual ni de tasas de alucinación, y una cuantización de expertos a 2 bits tiende a amplificar errores en tareas de conocimiento.
- Ambigüedad multimodal: la etiqueta `image-text-to-text` sugiere capacidades de visión, pero la model card no las describe ni se especifica el procesador o codificador asociado. No debe asumirse que la entrada de imágenes funcione correctamente.
- Artefacto de investigación «interno»: el propio autor lo etiqueta como checkpoint de investigación interna, con identificador r61. No hay garantía de mantenimiento, versionado ni soporte.
- Sin tracción en la comunidad: cero descargas y cero valoraciones implican ausencia de validación independiente, de informes de errores y de reproducciones por terceros.
- Fechas incoherentes: los metadatos indican creación el 5 de octubre de 2026, posteriores a la fecha habitual de consulta, lo que refuerza la cautela sobre la trazabilidad del artefacto.
- Advertencia sobre la búsqueda web: los resultados obtenidos no guardan ninguna relación con el modelo (contenido para adultos sin vinculación técnica). Se han descartado por completo como fuente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/minjaechoi/qwen3p6-35b-a3b-2p01bit-r61
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Paper, blog, repositorio de código o demo: no disponibles. La búsqueda web no devolvió ningún enlace relevante relacionado con el modelo.
