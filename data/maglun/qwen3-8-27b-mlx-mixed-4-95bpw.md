# maglun/Qwen3.8-27B-MLX-Mixed-4.95bpw

## Resumen

El modelo `maglun/Qwen3.8-27B-MLX-Mixed-4.95bpw` es una conversión cuantizada para Apple Silicon (MLX-VLM) del modelo multimodal `Qwen/Qwen3.8-27B`, desarrollada por el usuario maglun. Se trata de un checkpoint de 27 mil millones de parámetros (26.895.998.464 parámetros de texto según la model card) que combina una torre de lenguaje cuantizada con una política de bits mixtos (4.5 y 5.5 bits efectivos, agregado 4.95 bpw) y una torre de visión en BF16 sin cuantizar. El resultado es un modelo de imagen-texto-a-texto que soporta razonamiento, tool calling y conversación, optimizado para ejecutarse en hardware Apple con memoria unificada.

La relevancia de este lanzamiento radica en que permite ejecutar un modelo de 27B multimodal en equipos Apple con un consumo de memoria reducido (17.37 GiB pico en un M4 Pro), manteniendo un rendimiento cercano al BF16 en tareas de código y matemáticas según las pruebas del autor. La cuantización es independiente y no incluye los pesos MTP (multi-token prediction) del modelo original, por lo que no se reivindica decodificación especulativa. Es una opción práctica para desarrolladores que necesitan un modelo de visión y lenguaje local en macOS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con torre de lenguaje y torre de visión; incluye componentes de mezcla lineal (linear mixer) según la nomenclatura de tensores |
| Parametros totales | 27B (modelo base); el checkpoint cuantizado declara 26.895.998.464 parámetros de texto más la torre de visión BF16 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | MLX mixto: 4.5 y 5.5 bits efectivos por familia de tensores, agregado 4.9510 bpw, grupo 64; tensores de estado del mezclador y normalizaciones en BF16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base `Qwen3.8-27B` es un modelo multimodal de la familia Qwen3.8 que procesa texto, imágenes y vídeo. La conversión MLX-VLM mantiene la arquitectura original, pero la torre de lenguaje se cuantiza con una política explícita de bits mixtos: las matrices de atención Q/K y las proyecciones MLP gate/up se cuantizan a 4.5 bits efectivos, mientras que V/O, MLP down y las entradas/salidas del mezclador lineal usan 5.5 bits. Los tensores de estado del mezclador lineal (in_proj_a, in_proj_b, A_log, dt_bias) y las convoluciones/normalizaciones se mantienen en BF16. La torre de visión se conserva íntegramente en BF16.

No se proporcionan datos sobre el entrenamiento del modelo base (número de tokens, composición del dataset, métodos de alineación como RLHF o DPO). La model card indica que el checkpoint cuantizado es una producción independiente y que los pesos MTP se omiten deliberadamente. La cuantización se realizó con un cuantizador Swift en streaming y se validó con `mlx_vlm.load(..., strict=True)`.

## Capacidades

- Generación de texto y conversación multimodal (entrada de imágenes, texto y posiblemente vídeo, aunque el vídeo no se probó en esta versión).
- Razonamiento y modo de pensamiento explícito (`thinking`), con soporte para `reasoning_effort` (por ejemplo, `low` en las pruebas del autor).
- Tool calling y function calling, según las etiquetas del modelo.
- Generación de código y resolución de problemas matemáticos, avalado por las pruebas HumanEval+ y GSM8K.
- Capacidades multilingües no especificadas; el modelo base probablemente soporte varios idiomas, pero no se detalla en la información disponible.
- Procesamiento de imágenes con descripción y respuesta a preguntas visuales (validado con un smoke test de "dos gatos durmiendo en un sofá").

## Casos de uso

- Asistente de programación local: el modelo puede generar, revisar y completar código en entornos de desarrollo integrados, aprovechando su capacidad de tool calling para invocar funciones o comandos. Su rendimiento en HumanEval+ (75% pass@1) lo hace adecuado para tareas de autocompletado y refactorización.
- Análisis de imágenes en entornos sin conexión: al ser multimodal, puede describir imágenes, extraer información visual o responder preguntas sobre capturas, diagramas o fotografías, todo ello en un Mac sin necesidad de API externa.
- Automatización de atención al cliente: con soporte de conversación multi-turno y tool calling, puede gestionar consultas, consultar bases de datos o APIs y derivar tickets, manteniendo el contexto durante la interacción.
- Razonamiento y resolución de problemas matemáticos: su precisión en GSM8K (100% en las pruebas del autor) lo hace útil para asistentes educativos o herramientas de cálculo explicativo.
- Prototipado de agentes con razonamiento: el modo de pensamiento explícito permite encadenar pasos de razonamiento antes de responder, útil para agentes que necesitan planificar acciones o descomponer tareas complejas.
- Despliegue de modelos de visión en producción ligera: gracias a su cuantización compacta, puede ejecutarse en servidores con GPUs modestas o en estaciones de trabajo Apple, sirviendo inferencias de imagen-texto con latencia razonable para aplicaciones internas.

## Benchmarks y rendimiento

La model card incluye una tabla de pruebas rápidas (no estadísticamente potentes) comparando el checkpoint cuantizado con el modelo BF16 y una receta de referencia anterior. Todas las pruebas usaron decodificación greedy y modo de razonamiento `low` con un límite de 8192 tokens.

| Check | BF16 text | Reference quant | Mixer-in5 release |
|---|---:|---:|---:|
| Held-out chat-framed PPL ↓ (n=4) | 5.8107 | 5.8806 | 5.9028 |
| HumanEval+ pass@1 (n=8) | 75.0% | 75.0% | 75.0% |
| GSM8K accuracy (n=12) | 91.7% | 100.0% | 100.0% |

No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- Validado en Apple Silicon: el autor reporta un pico de memoria unificada de 17.37 GiB en un Apple M4 Pro con carga estricta y dos generaciones cortas.
- El tamaño total del payload de tensores es de 16.36 GiB (15.50 GiB de texto cuantizado + 0.86 GiB de visión BF16).
- Al ser un formato MLX, se ejecuta nativamente en Macs con chip M1/M2/M3/M4; requiere al menos 18-24 GiB de memoria unificada para una experiencia cómoda (según el tamaño del payload y el overhead del runtime).
- No está pensado para GPUs NVIDIA o AMD sin adaptación; el runtime es `mlx-vlm` y `mlx` (versión 0.32.0 o superior).
- Opciones de despliegue: uso mediante la API de Python de `mlx-vlm` (ver ejemplo en la model card). No se mencionan integraciones con vLLM, llama.cpp u Ollama.
- Latencia y throughput no especificados; las pruebas del autor no incluyen mediciones de tiempo.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos cuantizados para Apple Silicon en la información proporcionada. Como referencia, el propio autor compara su cuantización con el modelo BF16 original y con una receta de cuantización anterior (Reference quant), mostrando una degradación mínima en PPL y resultados idénticos o superiores en HumanEval+ y GSM8K. Para una comparación con alternativas como Qwen2.5-VL o Llama 3.2 Vision, no hay datos disponibles.

## Limitaciones y advertencias

- Es una cuantización independiente, no un lanzamiento oficial de Qwen; el autor recomienda consultar la model card del modelo base para información de seguridad y uso previsto.
- No se incluyen los pesos MTP, por lo que no se ofrece decodificación especulativa ni se reivindica ese comportamiento.
- Las pruebas de calidad son de tamaño de muestra pequeño (n=4, n=8, n=12) y no son estadísticamente concluyentes; los resultados de GSM8K (100%) podrían deberse al azar.
- No se han probado comportamientos de contexto largo ni de vídeo en esta versión; el autor indica explícitamente que no se testearon.
- El modelo puede alucinar o generar información incorrecta, especialmente en tareas de razonamiento complejo; se recomienda validar las salidas en producción.
- Los idiomas soportados no están documentados; el rendimiento en idiomas distintos del inglés no está garantizado.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar la licencia del modelo base y de los pesos originales de Qwen (que también es Apache 2.0 según la model card).
- El runtime MLX-VLM está en desarrollo activo; es posible que se requiera una versión específica (se validó con el commit `738e44063f145f7df24acc375e33c379053982d5`).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/maglun/Qwen3.8-27B-MLX-Mixed-4.95bpw
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Visualización de asignación de bits en TensorLens: https://tensorlens.dev/maglun/Qwen3.8-27B-MLX-Mixed-4.95bpw
- Commit de MLX-VLM validado: https://github.com/Blaizzy/mlx-vlm/commit/738e44063f145f7df24acc375e33c379053982d5
