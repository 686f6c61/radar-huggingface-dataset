# bambocher/Qwen3.5-9B-heretic-oQ3.5-mtp

## Resumen

Qwen3.5-9B-heretic-oQ3.5-mtp es una cuantización mixta del modelo Qwen3.5-9B, publicada por el usuario bambocher en Hugging Face. El checkpoint parte de una variante "heretic" del modelo base de Qwen (presumiblemente una versión con el alineamiento de seguridad relajado o ablacionado, aunque la model card no lo detalla) y aplica una cuantización de precisión mixta mediante la herramienta oQ de oMLX v0.7.3, con un promedio efectivo de 4,703 bits por peso.

El resultado es un checkpoint de 9.653 millones de parámetros almacenado en 5,285 GiB, con capas asignadas dinámicamente a 3, 4, 5 o 6 bits (grupo 64) y algunos tensores en BF16, más una cabeza MTP (multi-token prediction) de 0,243B parámetros y un codificador visual de 0,456B. El formato es MLX, es decir, está pensado para ejecutarse en Apple Silicon mediante el framework MLX y no en GPUs NVIDIA ni en llama.cpp.

La relevancia de esta ficha es doble: por un lado, documenta una técnica de cuantización mixta poco habitual (oQ) aplicada a un modelo multimodal con decodificación especulativa nativa; por otro, es un ejemplo de publicación de bajo perfil (0 descargas, sin licencia declarada, sin idiomas especificados) que conviene tratar con cautela antes de integrarla en producción. No se dispone de información sobre el modelo base original, sus datos de entrenamiento ni sus resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5) con cabeza MTP y codificador visual; pesos en formato MLX |
| Parámetros totales | 9.653.104.368 (9,653B) |
| Parámetros activos | no disponible (no se indica que sea MoE; la cabeza MTP no implica sparsity) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Mixta: affine 3-bit (grupo 64), 4-bit, 5-bit, 6-bit y BF16; promedio efectivo 4,703 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), librería `mlx` |

Desglose de la cuantización según la model card:

| Formato de almacenamiento | Pesos lógicos | Porcentaje | Almacenamiento | Bits/peso efectivos |
|---|---|---|---|---|
| Affine 3-bit, grupo 64 | 6,117B | 63,372% | 2,493 GiB | 3,50 |
| Affine 4-bit, grupo 64 | 1,625B | 16,837% | 0,851 GiB | 4,50 |
| Affine 5-bit, grupo 64 | 0,403B | 4,171% | 0,258 GiB | 5,50 |
| Affine 6-bit, grupo 64 | 1,017B | 10,537% | 0,770 GiB | 6,50 |
| BF16 | 0,491B | 5,083% | 0,914 GiB | 16,00 |
| **Total** | **9,653B** | **100%** | **5,285 GiB** | **4,703** |

Desglose por componente:

| Componente | Pesos lógicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 8,954B | 4,578 GB / 4,264 GiB |
| Visión | 0,456B | 0,912 GB / 0,849 GiB |
| Cabeza MTP | 0,243B | 0,185 GB / 0,172 GiB |
| **Total** | **9,653B** | **5,675 GB / 5,285 GiB** |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base Qwen3.5-9B más allá de su pertenencia a la familia Qwen3.5. Los datos del checkpoint permiten inferir tres componentes: un modelo de lenguaje de 8,954B parámetros, un módulo de visión de 0,456B parámetros (lo que confirma que es un modelo multimodal) y una cabeza MTP de 0,243B parámetros. La presencia de MTP (multi-token prediction) sugiere que el modelo base incorpora decodificación especulativa nativa o entrenamiento auxiliar para predecir varios tokens por paso, una técnica que Qwen ha explorado en versiones recientes para acelerar la inferencia.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF, DPO o similares. La etiqueta "heretic" en el nombre indica que la variante de partida es un modelo con el alineamiento de seguridad modificado (típicamente una ablación de la dirección de rechazo), pero la model card no documenta el proceso ni sus implicaciones. La cuantización se realizó con oQ (oMLX v0.7.3), que asigna precisión por capa o por tensor según su sensibilidad, reservando 3 bits para el 63% de los pesos y BF16 para el 5% (probablemente embeddings, normas y capas críticas).

## Capacidades

- Generación de texto y razonamiento: al derivar de Qwen3.5, se espera capacidad de razonamiento multi-paso, aunque no hay evaluación publicada en esta ficha.
- Procesamiento de imagen: el checkpoint incluye un módulo de visión de 0,456B parámetros, por lo que el modelo es multimodal (entrada de imagen, salida de texto).
- Decodificación multi-token: la cabeza MTP de 0,243B parámetros permite, en principio, predicción especulativa de varios tokens para acelerar la generación.
- Multilingüismo: no disponible; la model card no declara idiomas.
- Tool calling / function calling: no disponible; no se documenta en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible; no se documenta explícitamente.
- Modo "thinking": no disponible; no se confirma en la información proporcionada.
- Ejecución en Apple Silicon: capacidad operativa confirmada por el formato MLX y la librería declarada.

## Casos de uso

- Inferencia local en Mac con memoria unificada: el checkpoint ocupa 5,285 GiB, por lo que cabe en equipos Apple Silicon con 16 GB o más de memoria unificada y permite ejecutar un modelo de 9,6B parámetros con capacidades multimodales sin GPU dedicada. Es el caso de uso principal dado el formato MLX.
- Prototipado de asistentes multimodales en local: el módulo de visión permite experimentar con tareas de descripción de imágenes, extracción de texto de capturas o preguntas sobre diagramas sin enviar datos a la nube, útil para entornos con requisitos de privacidad.
- Investigación sobre cuantización mixta: el checkpoint sirve como referencia para estudiar el impacto de oQ (3/4/5/6 bits + BF16) en la calidad de un modelo de ~9,6B, comparando contra cuantizaciones uniformes de 4 bits.
- Evaluación de decodificación especulativa con MTP: la cabeza MTP permite medir la ganancia de throughput de la predicción multi-token en MLX frente a decodificación autoregresiva estándar.
- Generación de código y texto asistida en el editor: para desarrolladores en macOS que quieran un asistente local con ventana de contexto razonable (no confirmada) sin depender de APIs externas.
- Experimentación con modelos "uncensored" o con alineamiento relajado: la variante heretic permite estudiar el comportamiento del modelo en dominios creativos o de investigación donde los rechazos del modelo base resultan limitantes, siempre con las cautelas éticas y legales correspondientes.
- Pruebas de pipelines MLX en CI: al ser un repo pequeño (5,7 GB) y con formato nativo de MLX, se puede usar para validar flujos de carga, cuantización y generación en integración continua sobre runners macOS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo documenta la distribución de bits y el tamaño del checkpoint; no incluye MMLU, HumanEval, GSM8K ni comparaciones con otras cuantizaciones.

## Requisitos de hardware

- VRAM / memoria unificada estimada para inferencia: ~5,3 GiB solo para pesos; con overhead de activaciones, caché KV y contexto, se recomienda un mínimo de 8-10 GB de memoria unificada.
- Hardware objetivo: Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) mediante MLX. No es compatible de forma nativa con CUDA.
- ¿Cabe en GPU consumer? No en el sentido habitual (NVIDIA/AMD) por el formato MLX; en Apple Silicon cabe en equipos con 16 GB o más de memoria unificada.
- Opciones de despliegue: `mlx-lm` y el ecosistema MLX (oMLX) son las vías previstas. No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, ya que los pesos están en formato MLX y no en GGUF.
- Latencia y throughput: no disponibles. La presencia de MTP sugiere una mejora potencial en tokens/segundo, pero no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-heretic-oQ3.5-mtp (este) | 9,653B | no disponible | MLX safetensors | no disponible | Hugging Face, 0 descargas |
| Qwen3.5-9B (base, si existe publicación oficial) | ~9B | no disponible | safetensors | no disponible | no verificada en esta ficha |
| Cuantizaciones GGUF de modelos Qwen de ~9B (p. ej. Q4_K_M) | ~9B | depende del base | GGUF | depende del base | amplia en Hugging Face |
| Modelos multimodales ligeros comparables (p. ej. familia Qwen2.5-VL de 7B) | ~7-8B | no disponible | safetensors/GGUF | Apache 2.0 en algunas variantes | amplia |

La comparación directa es limitada: no se dispone de datos de benchmarks del checkpoint ni de la variante heretic, y la licencia no está declarada. Frente a una cuantización GGUF uniforme de 4 bits, este checkpoint ofrece una mezcla de precisión que puede preservar mejor ciertas capas, pero queda restringido al ecosistema MLX.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial permitido; es imprescindible contactar con el autor o verificar la licencia del modelo base Qwen3.5 antes de cualquier despliegue productivo.
- Variante "heretic": el alineamiento de seguridad ha sido presumiblemente modificado; el modelo puede generar contenido que el base rechazaría, con implicaciones éticas, legales y de reputación.
- Sin benchmarks: no hay evidencia publicada de la degradación de calidad introducida por la cuantización mixta a 4,703 bits/peso.
- Idiomas no declarados: no se puede garantizar un rendimiento multilingüe correcto sin evaluación previa.
- Contexto no documentado: se desconoce la ventana máxima soportada en esta cuantización.
- Riesgo de alucinación: inherente a los modelos de ~9B, agravado por la cuantización agresiva (63% de los pesos a 3 bits) y por la falta de evaluación.
- Repo sin tracción: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de que el checkpoint haya sido validado por terceros.
- Compatibilidad restringida: solo MLX; no se puede usar con llama.cpp, Ollama, vLLM ni TGI sin conversión previa.
- Fecha de creación futura (2026-11-13): conviene verificar la autenticidad y la integridad de los pesos antes de cargarlos.

## Enlaces

- Hugging Face: https://huggingface.co/bambocher/Qwen3.5-9B-heretic-oQ3.5-mtp
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
- Repositorio MLX: no disponible en la información proporcionada
- Paper o blog del modelo base Qwen3.5: no disponible en la información proporcionada
- Demo o espacio asociado: no disponible en la información proporcionada
