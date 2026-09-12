# minjaechoi/qwen36-twla-taylor-fisher-prefix-init4-lambda16

## Resumen

`minjaechoi/qwen36-twla-taylor-fisher-prefix-init4-lambda16` es un checkpoint de investigación publicado en HuggingFace por el usuario minjaechoi. No se trata de un modelo entrenado desde cero, sino del resultado de aplicar una optimización de precisión mixta sobre los expertos enrutados de un modelo MoE multimodal: la model card indica que la unidad de cuantización es un experto enrutado dentro de una capa MoE, con 40 capas x 256 expertos = 10.240 unidades, y que el objetivo optimizado es la NLL de validación más un término de bits lógicos ponderado por lambda. El sufijo del nombre (`init4-lambda16`) refleja el nivel inicial de 4 bits y el peso lambda de 16.

El repositorio declara 35.107.181.936 parámetros totales (unos 35,1 B) en formato safetensors, un tamaño de repositorio de 70,2 GB y la etiqueta de arquitectura `qwen3_5_moe`, lo que sitúa el modelo en la familia Qwen 3.5 MoE. La pipeline declarada es `image-text-to-text`, es decir, se trata de un modelo visión-lenguaje con mezcla de expertos. La model card no identifica explícitamente el checkpoint base, no declara licencia y no especifica idiomas soportados ni longitud de contexto.

La relevancia de este checkpoint es fundamentalmente metodológica: documenta con metadatos de reproducibilidad (`optimization_summary.json`, `precision_map.json`) y con el código fuente en `code/` un procedimiento de asignación de precisión por experto enrutado, buscando una media final de 1,5850840937386474 bits por experto. Es material de interés para quien investiga compresión de MoE, cuantización mixta y sensibilidad por experto, más que para despliegue en producción: acumula 0 descargas y 0 likes, y no aporta resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (etiqueta `qwen3_5_moe`): transformer con capas de mezcla de expertos enrutados; modalidad imagen-texto |
| Parametros totales | 35.107.181.936 (~35,1 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Optimización de precisión mixta por experto enrutado; nivel inicial 4 (`init4`); media final declarada de 1,5850840937386474 bits por experto enrutado; objetivo de bits "not target-controlled"; pesos publicados en safetensors |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (repositorio de 70,2 GB) |
| Unidades de cuantizacion | 40 capas x 256 expertos = 10.240 expertos enrutados |
| Pipeline declarada | image-text-to-text |
| Libreria | transformers |

## Arquitectura y entrenamiento

La arquitectura es una mezcla de expertos con enrutamiento: 40 capas, cada una con 256 expertos enrutados, lo que da 10.240 unidades de cuantización independientes. La model card no detalla el número de expertos activos por token, el tamaño del experto compartido ni la dimensión oculta, por lo que no es posible derivar los parámetros activos. La etiqueta `qwen3_5_moe` y el nombre del repositorio (`qwen36`) apuntan a un derivado de la familia Qwen 3.5 MoE, pero el checkpoint base concreto no se identifica en la información disponible. La pipeline `image-text-to-text` confirma que el modelo procesa entradas multimodales (imagen y texto), aunque no se especifica el codificador visual ni su resolución de entrada.

El entrenamiento original del modelo base no se describe. Lo que documenta la model card es el procedimiento de optimización posterior: una búsqueda de asignación de precisión ("TWLA mixed-precision optimization") cuyo objetivo combina la NLL de validación con un término de bits lógicos medios ponderado por lambda; el modo de búsqueda declarado es `proxy_prefix` y el nivel inicial es 4. Un detalle metodológico relevante es que GPQA no se utilizó para calibración, ranking de sensibilidad, asignación, criterios de parada ni selección del checkpoint, y que las fuentes exactas de inferencia de GPQA empleadas en el espacio de trabajo se incluyen bajo `code/`. El acrónimo TWLA y el papel exacto de la expansión de Taylor o de la información de Fisher, sugeridos por el nombre del repositorio, no se explican en la información disponible.

Existe una discrepancia que conviene señalar: 35.107.181.936 parámetros a 16 bits equivalen a 70,2 GB, que coincide exactamente con el tamaño declarado del repositorio. Esto es coherente con un checkpoint publicado en precisión alta, pese a que la model card describa una optimización con una media de ~1,585 bits por experto enrutado. La información disponible no aclara si esa compresión se materializa en los pesos publicados o si solo describe el proceso de búsqueda. No se documentan fases de RLHF, DPO ni ajuste por instrucciones.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` indica ajuste para diálogo multi-turno; no se especifica la plantilla de chat ni el formato de prompt.
- Procesamiento de imagen y texto: la pipeline `image-text-to-text` implica entrada de imágenes junto con texto, con salida de texto. No se detalla resolución, número de imágenes por prompt ni soporte de vídeo.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que el checkpoint puede servirse a través de infraestructura de inferencia compatible con la librería transformers.
- Razonamiento, código y matemáticas: no disponible; no hay benchmarks ni declaraciones al respecto.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; el repositorio no declara ningún idioma.
- Capacidades especiales (modo thinking, audio, decodificación especulativa): no disponible.

## Casos de uso

- Investigación en cuantización de MoE: el repositorio incluye `optimization_summary.json`, `precision_map.json` y el código en `code/`, lo que permite reproducir y auditar la asignación de precisión por experto enrutado y compararla con esquemas uniformes de 4 u 8 bits.
- Análisis de sensibilidad por experto: al etiquetar la unidad de cuantización como un experto concreto dentro de una capa, el checkpoint sirve para estudiar qué expertos toleran precisión extrema (~1,585 bits de media) y cuáles concentran el error.
- Estudio de metodología de evaluación y contaminación: la model card explicita que GPQA no intervino en la calibración y publica las fuentes de inferencia, lo que es útil para auditar separación entre conjunto de calibración y conjunto de evaluación.
- Experimentos de visión-lenguaje con MoE: si el checkpoint conserva las capacidades del base, puede emplearse en tareas de pregunta-respuesta sobre imágenes, descripción de figuras y comprensión de documentos escaneados, siempre que se valide previamente la degradación introducida.
- Docencia y divulgación técnica: como ejemplo práctico de flujo de trabajo de precisión mixta con metadatos de reproducibilidad completos.
- Prototipado interno no crítico: pruebas de concepto en las que el coste de un modelo de 35,1 B en safetensors sea asumible y no se requiera licencia comercial clara.
- Comparación con checkpoints sin comprimir: sirve como referencia para medir cuánta calidad se pierde frente a los pesos originales del modelo base, si se dispone de ellos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye cifras de MMLU, GPQA, HumanEval, GSM8K ni de ninguna otra evaluación, y la mención a GPQA se limita a aclarar que no se usó en el proceso de optimización, sin reportar puntuaciones.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: 35,1 B x 2 bytes = ~70,2 GB solo para pesos, más caché KV y activaciones. No cabe en una GPU de 80 GB con margen cómodo para contexto largo.
- VRAM estimada en int8: ~35 GB de pesos; requiere GPU de 40 GB o superior y deja poco espacio para caché KV en la A100 40 GB.
- VRAM estimada en int4: ~18-20 GB de pesos, lo que lo sitúa al borde de una RTX 4090 o RTX 3090 de 24 GB, con contexto muy limitado.
- GPU recomendadas: 2x A100 80 GB o 2x H100 80 GB para bf16; H100 80 GB, A100 80 GB o L40S 48 GB para 8 bits; RTX 4090, RTX 3090 o L4 para 4 bits con contexto reducido.
- Inferencia en GPU de consumo: viable en 4 bits en tarjetas de 24 GB, asumiendo contexto corto. En MoE, la VRAM depende de si todos los expertos residen en memoria o se aplica offloading a CPU/NVMe, ya que hay 10.240 expertos enrutados.
- Opciones de despliegue: vLLM, TGI o SGLang son las rutas naturales para un checkpoint en safetensors con arquitectura MoE. llama.cpp y Ollama requieren conversión a GGUF, y el repositorio no contiene ficheros GGUF.
- Latencia y throughput estimados: no disponible. Al no conocerse los parámetros activos por token, no es posible estimar de forma fiable el coste por token ni el rendimiento en tokens por segundo.

## Comparativa con modelos similares

La información disponible no permite una comparativa verificada, porque este checkpoint no publica benchmarks ni especifica su modelo base. La tabla siguiente recoge únicamente los datos declarados para este modelo y, como referencia orientativa de la misma categoría, datos públicos ampliamente conocidos de alternativas MoE; los campos no verificados se marcan como no disponibles.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| qwen36-twla-taylor-fisher-prefix-init4-lambda16 | 35,1 B | no disponible | no disponible | no disponible | safetensors |
| Qwen3-30B-A3B (referencia de familia) | ~30,5 B | ~3,3 B | 32.768 nativo, ampliable con YaRN | Apache-2.0 | safetensors, GGUF |
| Mixtral 8x7B (referencia MoE abierta) | ~46,7 B | ~12,9 B | 32.768 | Apache-2.0 | safetensors, GGUF |

No se dispone de datos de rendimiento comparativo (MMLU, GPQA ni ninguna otra métrica) para este checkpoint, por lo que no es posible establecer qué posición ocupa frente a las alternativas en calidad.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita, el uso comercial queda en un limbo legal. No debe asumirse permisividad.
- Riesgo de alucinación: no evaluado ni cuantificado en la información disponible.
- Sesgos: no se han publicado evaluaciones de sesgo, toxicidad o equidad.
- Idiomas: no se declara cobertura lingüística alguna, por lo que no se puede garantizar un comportamiento correcto en castellano ni en ningún otro idioma.
- Calidad tras la compresión: la asignación de precisión mixta con una media de ~1,585 bits por experto enrutado es agresiva; no se aportan métricas de degradación respecto al modelo sin comprimir.
- Ambigüedad sobre los pesos publicados: el tamaño del repositorio (70,2 GB) coincide con pesos de 16 bits para 35,1 B de parámetros, lo que no aclara si la compresión descrita está aplicada en los ficheros o solo en el proceso de búsqueda.
- Riesgo de contaminación en evaluación: la model card indica que las fuentes de inferencia de GPQA están incluidas en `code/`; cualquier evaluación posterior sobre ese conjunto debe auditarse con cuidado.
- Modelo base sin identificar: al no especificarse el checkpoint de partida, no se heredan garantías de licencia, idiomas ni comportamiento del modelo original.
- Madurez: 0 descargas y 0 likes, sin historial de uso ni validación por terceros. Es un artefacto de investigación, no un modelo listo para producción.
- Metadatos incompletos: no hay información sobre plantilla de chat, resolución de imagen soportada, número de imágenes por prompt ni parámetros activos, todo lo cual condiciona el despliegue.

## Enlaces

- HuggingFace: https://huggingface.co/minjaechoi/qwen36-twla-taylor-fisher-prefix-init4-lambda16
- Metadatos de reproducibilidad del repositorio: `optimization_summary.json`
- Mapa de precisión por unidad: `precision_map.json`
- Código del optimizador y fuentes de inferencia de GPQA: directorio `code/` del repositorio

No se han encontrado en la búsqueda web enlaces relevantes al modelo, a papers asociados ni a demos: los resultados devueltos corresponden a foros sin relación con el contenido técnico de esta ficha, por lo que se omiten.
