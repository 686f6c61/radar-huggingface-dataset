# llmfan46/Qwen3-VL-32B-Instruct-ultra-uncensored-heretic

## Resumen

El modelo `llmfan46/Qwen3-VL-32B-Instruct-ultra-uncensored-heretic` es una variante "decensored" del modelo multimodal Qwen3-VL-32B-Instruct de Alibaba, obtenida mediante la técnica de abliteración con la herramienta Heretic v1.2.0 y el método Arbitrary-Rank Ablation (ARA). El autor, llmfan46, es un contribuyente independiente que publica modelos modificados en Hugging Face con el objetivo de reducir los rechazos del modelo original ante solicitudes consideradas sensibles o prohibidas. Según la model card, el modelo presenta un 96 % menos de rechazos (4/100 frente a 99/100 en el original) con una divergencia KL de 0,0421 respecto al modelo base, lo que indica una alteración relativamente leve de la distribución de salida.

La arquitectura subyacente es la de Qwen3-VL, un transformer multimodal denso de 33,36 mil millones de parámetros que procesa texto e imágenes (y potencialmente vídeo), con 64 capas, tamaño oculto de 5120, atención por grupos de consultas (GQA) con 64 cabezas de consulta y 8 de clave/valor, y una capa feed-forward de 25600 unidades. El modelo se distribuye en formato safetensors con licencia Apache 2.0, lo que permite uso comercial. La relevancia de esta ficha radica en que representa un caso práctico de modificación de alineación mediante abliteración, con implicaciones tanto para la investigación en seguridad de IA como para el desarrollo de aplicaciones que requieren respuestas sin restricciones temáticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL (transformer multimodal denso, vision-language) |
| Parametros totales | 33.357.390.064 (33,36 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el modelo base Qwen3-VL-32B-Instruct soporta hasta 256 K tokens segun documentacion oficial) |
| Tipos de cuantizacion | No disponible (solo pesos originales en safetensors; cuantizaciones posteriores posibles) |
| Idiomas soportados | No disponible (el modelo base Qwen3-VL-32B-Instruct soporta multiples idiomas, incluido espanol) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo no ha sido entrenado desde cero, sino que parte de los pesos del modelo Qwen/Qwen3-VL-32B-Instruct y se somete a un proceso de abliteración mediante la herramienta Heretic (v1.2.0) con el método Arbitrary-Rank Ablation (ARA). La abliteración consiste en identificar y eliminar direcciones en el espacio de activaciones que correlacionan con comportamientos de rechazo o negativa, de modo que el modelo pierda la tendencia a rechazar solicitudes. En este caso, la intervención se aplica sobre las capas 31 a 40, actuando exclusivamente sobre el componente `attn.o_proj` (proyección de salida de atención). Los parámetros de la ablación incluyen un peso de preservación de buen comportamiento de 0,7975, un peso de dirección de mal comportamiento de 0,0002, un peso de sobrecorrección relativa de 1,2043 y un número de vecinos de 8.

El modelo base Qwen3-VL-32B-Instruct, desarrollado por Alibaba, es un modelo de visión-lenguaje de última generación que integra un codificador visual con un transformer de lenguaje. Se entrenó con una combinación de datos de texto e imágenes, incluyendo razonamiento multimodal, comprensión de documentos, análisis de vídeo y capacidades de agente. El proceso de abliteración no modifica los pesos de forma supervisada, sino que utiliza un algoritmo de optimización sobre direcciones de activación, lo que explica la ligera degradación en métricas de razonamiento general (MMLU cae de 82,44 % a 79,87 %).

## Capacidades

- Generación de texto y comprensión multimodal: procesa imágenes junto con texto, permitiendo responder preguntas sobre contenido visual, describir escenas, extraer información de documentos escaneados y razonar sobre diagramas.
- Razonamiento y matemáticas: hereda las capacidades del modelo base para problemas de razonamiento lógico, aritmética y resolución de problemas en varios dominios.
- Generación de codigo: soporta tareas de programación, explicación de código y depuración, aunque no se han publicado benchmarks específicos para esta variante.
- Tool calling y function calling: el modelo base Qwen3-VL-32B-Instruct incluye soporte para invocación de herramientas, lo que permite su integración en agentes que necesitan interactuar con APIs o ejecutar acciones.
- Capacidades de agente y razonamiento multi-paso: puede planificar secuencias de acciones y razonar sobre estados intermedios, útil en automatización de tareas complejas.
- Reduccion de rechazos: la principal diferencia frente al original es que responde a solicitudes que el modelo base rechazaría (por ejemplo, contenido violento, sexual, ilegal o controvertido), con una tasa de rechazo de solo 4 sobre 100 peticiones.
- Multilingue: al derivar del modelo base, conserva el soporte multilingue, aunque no se especifica la lista exacta de idiomas.

## Casos de uso

- Investigacion en seguridad y alineacion de IA: el modelo permite estudiar cómo la abliteración afecta al comportamiento, la distribución de salidas y la robustez frente a jailbreaks, proporcionando datos comparativos con el modelo original.
- Generacion de contenido creativo sin restricciones: escritores y artistas pueden utilizarlo para explorar temas tabú o controvertidos en narrativa, guiones o ficción, donde el modelo original impondría censura.
- Analisis de sesgos y comportamientos de modelos ablacionados: investigadores pueden comparar las respuestas del modelo original y el ablacionado en tareas de razonamiento moral o legal para medir el impacto de la eliminación de rechazos.
- Pruebas de estres de sistemas de moderacion: el modelo puede servir como generador de entradas adversarias para evaluar la eficacia de filtros de contenido en aplicaciones de producción.
- Desarrollo de asistentes conversacionales con tematica adulta: para aplicaciones dirigidas a mayores de edad que requieran respuestas explicitas en contextos de salud sexual, relaciones o ficcion erotica, siempre con salvaguardas legales y eticas.
- Automatizacion de tareas de vision-lenguaje en entornos controlados: al conservar las capacidades multimodales del base, puede emplearse en extraccion de informacion de imagenes, OCR y analisis de video, con la ventaja de no rechazar solicitudes que involucren contenido delicado.

## Benchmarks y rendimiento

La model card del autor proporciona resultados comparativos entre el modelo ablacionado y el original en dos benchmarks:

| Benchmark | Modelo original (Qwen3-VL-32B-Instruct) | Modelo ablacionado (este) |
|---|---|---|
| PIQA (accuracy) | 93,09 % | 92,87 % |
| MMLU (accuracy) | 82,44 % | 79,87 % |
| Tasa de rechazos (sobre 100 peticiones) | 99/100 | 4/100 |
| Divergencia KL | 0 (por definicion) | 0,0421 |

La degradación en PIQA es mínima (0,22 puntos porcentuales), mientras que en MMLU la pérdida es de 2,57 puntos, lo que sugiere que la abliteración afecta más a tareas de conocimiento general que a razonamiento físico. No se han publicado resultados en benchmarks de visión-lenguaje (como MMMU, DocVQA o Video-MME) para esta variante.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en FP16, el modelo ocupa aproximadamente 66,7 GB, por lo que se necesita una GPU con al menos 80 GB de VRAM (A100 80GB, H100 80GB) o dos GPU de 48 GB en paralelo. Con cuantizacion a 8 bits (INT8) se reduce a unos 34 GB, y a 4 bits (INT4) a unos 17 GB, lo que permite ejecutarlo en una RTX 4090 (24 GB) o similar.
- GPU recomendadas: A100 80GB, H100 80GB, RTX 4090 (con cuantizacion), RTX 6000 Ada, o configuraciones multi-GPU con NVLink.
- Compatibilidad con GPU de consumo: sí, siempre que se aplique cuantizacion (GGUF o AWQ). Una RTX 3090 o 4090 con 24 GB puede ejecutar el modelo en 4 bits.
- Opciones de despliegue: vLLM, TGI (Text Generation Inference), llama.cpp (con conversión a GGUF), Ollama (si se convierte previamente), y transformers con accelerate para carga en paralelo.
- Latencia y throughput estimados: no disponibles. Para un modelo de 33B en FP16 en una A100, se espera una latencia de generación de entre 20 y 40 tokens por segundo, dependiendo de la longitud de la secuencia y el uso de técnicas como speculative decoding.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Diferencias clave |
|---|---|---|---|---|
| Qwen3-VL-32B-Instruct (original) | 33,36 B | 256 K (documentado) | Apache 2.0 | Modelo base alineado, con rechazos ante contenido sensible |
| Este modelo (abliterado) | 33,36 B | No disponible (hereda del base) | Apache 2.0 | Mismos pesos pero con direcciones de rechazo eliminadas; menor rendimiento en MMLU |
| Otros modelos ablitarados de Qwen3-VL (p. ej. ethanfel/Qwen3-VL-32B-Ultra-Heretic-H3-ComfyUI-INT8-ConvRot) | 33,36 B | No disponible | Apache 2.0 | Variantes con diferentes configuraciones de abliteración y cuantizaciones adicionales |

La comparativa se limita a variantes del mismo modelo base, ya que no se dispone de datos de otros modelos de la misma categoría (vision-language de ~33B) en la información proporcionada.

## Limitaciones y advertencias

- Degradacion de rendimiento: la abliteración reduce la precisión en tareas de conocimiento general (MMLU cae de 82,44 % a 79,87 %), lo que puede afectar a aplicaciones que requieran alta exactitud en dominios como derecho o medicina.
- Contenido potencialmente danino: al eliminar los rechazos, el modelo puede generar respuestas que inciten a la violencia, promuevan actividades ilegales, contengan material sexual explicito o difundan discursos de odio. No se han implementado salvaguardas adicionales.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede inventar informacion, especialmente en temas controvertidos donde no hay datos de entrenamiento fiables.
- Sesgos heredados: el modelo base ya presenta sesgos de genero, raza y cultura; la abliteracion no los corrige y puede amplificarlos al eliminar las respuestas de rechazo que actuaban como freno.
- Sin garantias de seguridad: el autor no proporciona evaluaciones de seguridad mas alla de las metricas de rechazo y los benchmarks de razonamiento. No se recomienda su uso en produccion sin un sistema de moderacion externo.
- Licencia: aunque la licencia Apache 2.0 permite uso comercial, la generacion de contenido ilegal o danino puede acarrear responsabilidades legales para el usuario final.
- Limitaciones de contexto e idioma: no se ha verificado la longitud de contexto efectiva tras la ablacion, ni la cobertura de idiomas. Se recomienda probar con secuencias largas antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/llmfan46/Qwen3-VL-32B-Instruct-ultra-uncensored-heretic
- Modelo base Qwen3-VL-32B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-32B-Instruct
- Repositorio de Heretic (herramienta de abliteracion): https://github.com/p-e-w/heretic
- Pull request con el metodo Arbitrary-Rank Ablation (ARA): https://github.com/p-e-w/heretic/pull/211
- Repositorio oficial de Qwen3-VL: https://github.com/QwenLM/Qwen3-VL
- Modelo base en ModelScope: https://www.modelscope.cn/models/Qwen/Qwen3-VL-32B-Instruct
- Variante similar con cuantizacion INT8: https://huggingface.co/ethanfel/Qwen3-VL-32B-Ultra-Heretic-H3-ComfyUI-INT8-ConvRot
- Papers de referencia citados en los tags: arxiv:2505.09388 (ARA), arxiv:2502.13923 (Qwen3-VL), arxiv:2409.12191, arxiv:2308.12966
