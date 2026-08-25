# Jiunsong/SuperQwen3.8-27b-abliterated-GGUF

## Resumen

SuperQwen3.8-27b-abliterated-GGUF es la versión cuantizada en Q4_K_M del modelo abliterated SuperQwen3.8-27b, desarrollado por Jiunsong sobre la base de Qwen3.8-27B. Se distribuye bajo licencia Apache-2.0 y está pensado para ejecutarse en un único NVIDIA DGX Spark, con un conjunto completo de archivos (modelo principal, borrador MTP y proyector multimodal) que ocupa 17.56 GiB. El modelo es multimodal (imagen-texto), soporta razonamiento acotado, tool calling y una ventana de contexto verificada de 262.043 tokens.

La principal innovación de esta release es la inclusión de un borrador MTP (Multi-Token Prediction) nativo en Q4_0 que permite decodificación especulativa, alcanzando 40.1 tok/s en C1 (una sola petición activa) frente a 12.05 tok/s sin especulación, un factor de 3.33×. Además, el proceso de abliteración (OBLITERATUS) ha sido corregido con una técnica de "agentes swarm" que repara los pesos dañados, reduciendo las negativas a peticiones benignas de 30/32 a 0/32 y manteniendo 36/36 casos de razonamiento sin sobrepensamiento.

El modelo está disponible en formato GGUF para llama.cpp, con cuantizaciones Q4_K_M (target), Q4_0 (borrador MTP) y Q8_0 (proyector de visión). Es relevante para desarrolladores que necesitan un modelo local "uncensored" con capacidades multimodales, razonamiento y contexto largo en un solo equipo, sin depender de APIs externas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3.8-27B) |
| Parametros totales | 26.895.998.464 (~26.9B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.043 tokens verificados (el modelo base declara 1M) |
| Tipos de cuantizacion | Q4_K_M (target), Q4_0 (borrador MTP), Q8_0 (proyector) |
| Idiomas soportados | en, ko |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (el modelo base en safetensors BF16) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un transformer denso con 26.9B parámetros. La versión abliterated aplica la técnica OBLITERATUS, que identifica y reduce el subespacio de rechazo en los pesos del modelo. Según el autor, la abliteración inicial rompió algunos pesos, por lo que se utilizó un sistema de "agentes swarm" para corregirlos, un proceso que requirió aproximadamente una semana de ajuste y evaluación.

La release GGUF incluye tres componentes separados: el modelo principal cuantizado con Q4_K_M usando una matriz de importancia de Unsloth (SHA-256 `0ee5b10bd0c2fa2127c6f4b43dbfe1efd71e383b63217af9dade1de36599f1c1`), un borrador MTP en Q4_0 para decodificación especulativa, y un proyector multimodal en Q8_0/F16/F32. La conversión y el servidor están fijados a llama.cpp commit `b3c3b96a139d4ef1bdec926ac17aa040981cfc5d`. El borrador MTP se probó con K de 0 a 8, seleccionando K=6 por su rendimiento medido de 40.1 tok/s.

## Capacidades

- Generación de texto y razonamiento con "bounded reasoning" (razonamiento acotado que evita el sobrepensamiento, verificado en 36/36 casos).
- Tool calling / function calling con argumentos válidos (verificado en la release).
- Multimodal: acepta entrada de imagen y texto (proyector Q8_0 incluido, gate de visión superado).
- Contexto largo: recuperación de una clave oculta en un prompt de 262.043 tokens (verificado).
- Decodificación especulativa nativa mediante borrador MTP, con soporte para K=0…8.
- Comportamiento "uncensored" (abliterated): reducción de rechazos a peticiones benignas de 30/32 a 0/32, y 0 respuestas vacías en la sonda de rechazo.
- Soporte de servidor OpenAI-compatible (`/v1/models`) y formato de razonamiento DeepSeek (`--reasoning-format deepseek`).

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo (262K tokens) y tool calling para consultar bases de datos o APIs, manteniendo un tono natural y sin rechazos innecesarios.
- Generación de código en producción: soporta tool calling y puede integrarse en pipelines de CI/CD para generar, revisar y ejecutar código, con razonamiento acotado para evitar respuestas excesivamente largas.
- Análisis de documentos extensos: la ventana de 262K tokens permite procesar libros completos, expedientes legales o informes técnicos en una sola pasada, con recuperación verificada de información específica.
- Asistencia multimodal en local: el proyector de visión permite describir imágenes, extraer texto de capturas o responder preguntas sobre diagramas, todo en un solo equipo sin conexión.
- Agentes autónomos con razonamiento: el modelo puede encadenar múltiples pasos de razonamiento y llamadas a herramientas, con control del nivel de "overthinking" (default, low, medium, xhigh) para ajustar la profundidad de análisis.
- Investigación en seguridad y sesgos: al ser abliterated, es útil para estudiar comportamientos de rechazo, alucinación y límites éticos en modelos de lenguaje, con una licencia Apache-2.0 que permite uso comercial y modificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card reporta métricas de rendimiento y gates de comportamiento específicos de esta release:

| Metrica | Resultado |
|---|---|
| Decodificacion C1 (K=6, mediana) | 40.100 tok/s |
| Decodificacion C1 (K=0, mediana) | 12.052 tok/s |
| Factor de aceleracion (K=6 vs K=0) | 3.33× |
| Capacidad (capability gate) | 8/8 PASS |
| Tool call con argumentos validos | PASS |
| Vision (gate post-cuantizacion) | PASS |
| Overthinking (36 casos) | 36/36 PASS |
| Sonda de rechazo a peticiones daninas | 0/32 refusals, 0 empty |
| Recuperacion de contexto nativo | 262.043 tokens, PASS |

## Requisitos de hardware

- Conjunto completo (target + MTP + proyector): 17.56 GiB en disco.
- Target Q4_K_M: 15.41 GiB; borrador MTP Q4_0: 1.56 GiB; proyector Q8_0: 0.59 GiB.
- VRAM estimada: el target requiere al menos 16 GiB de VRAM para inferencia, más la caché KV. Con contexto completo (262K) y cuantización q8_0 para KV, se necesita una GPU con 24 GiB o más (por ejemplo, RTX 4090, RTX 6000 Ada, o una DGX Spark con su memoria unificada).
- GPU recomendadas: NVIDIA DGX Spark (diseñado específicamente para esta release), o GPUs consumer con 24 GiB+ para contexto reducido.
- Opciones de despliegue: llama.cpp (llama-server) con soporte de especulación MTP, vLLM (mencionado en la comunidad), y formatos alternativos NVFP4 y MLX para otros entornos.
- Latencia y throughput: 40.1 tok/s en C1 (una petición activa) en DGX Spark con MTP K=6; sin especulación, 12.05 tok/s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| SuperQwen3.8-27b-abliterated-GGUF (este) | 26.9B | 262K verificado | Q4_K_M + MTP Q4_0 | Apache-2.0 | Multimodal, tool calling, uncensored |
| Qwen3.8-27B (base original) | 26.9B | 1M (declarado) | BF16 | Apache-2.0 | Sin abliteracion, sin MTP nativo |
| SuperQwen3.8-27b-abliterated-NVFP4-DGX-Spark | 26.9B | no disponible | NVFP4 W4A4 | Apache-2.0 | Optimizado para DGX Spark, TP=1 |
| SuperQwen3.8-27b-abliterated-MLX-4bit | 26.9B | no disponible | MLX 4-bit | Apache-2.0 | Para Apple Silicon |

La comparativa se limita a las variantes del mismo modelo base, ya que no se dispone de datos de otros modelos abliterated de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- Comportamiento "uncensored": el modelo puede generar contenido inapropiado, dañino o sesgado. La abliteración reduce los rechazos, pero no garantiza que las respuestas sean correctas, seguras o éticas. Los operadores son responsables del control de acceso.
- Idiomas limitados: la model card declara solo inglés y coreano. El rendimiento en otros idiomas no está verificado.
- Contexto largo: la recuperación de 262K tokens es una prueba concreta, pero no implica que todas las tareas en el límite de la ventana tengan la misma precisión.
- Riesgo de alucinación: no se han publicado evaluaciones específicas de alucinación; el modelo puede inventar información, especialmente en tareas de razonamiento complejo.
- Dependencia de llama.cpp: la release está fijada a un commit concreto de llama.cpp; versiones posteriores pueden cambiar el comportamiento de la especulación MTP.
- Requisitos de hardware: el contexto completo (262K) exige una GPU con suficiente VRAM; en GPUs consumer puede ser necesario reducir la ventana de contexto.
- Sin benchmarks estándar: no hay resultados de MMLU, HumanEval, GSM8K, etc., lo que dificulta la comparación objetiva con otros modelos.

## Enlaces

- [HuggingFace - SuperQwen3.8-27b-abliterated-GGUF](https://huggingface.co/Jiunsong/SuperQwen3.8-27b-abliterated-GGUF)
- [HuggingFace - SuperQwen3.8-27b-abliterated (base BF16)](https://huggingface.co/Jiunsong/SuperQwen3.8-27b-abliterated)
- [HuggingFace - SuperQwen3.8-27b-abliterated-NVFP4-DGX-Spark](https://huggingface.co/Jiunsong/SuperQwen3.8-27b-abliterated-NVFP4-DGX-Spark)
- [HuggingFace - SuperQwen3.8-27b-abliterated-MLX-4bit](https://huggingface.co/Jiunsong/SuperQwen3.8-27b-abliterated-MLX-4bit)
- [Post de anuncio en X (desenrollado)](https://unrollnow.com/status/2091903964413657474)
- [Blog orcarouter - Qwen3.8-27B Uncensored GGUF](https://www.orcarouter.ai/blog/qwen-3-8-27b-uncensored-gguf)
- [Blog mindstudio - Qwen3.8-27B AEON Uncensored](https://www.mindstudio.ai/blog/qwen3-8-27b-aeon-uncensored-abliteration)
