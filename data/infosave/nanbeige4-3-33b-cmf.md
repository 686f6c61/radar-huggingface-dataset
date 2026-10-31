# infosave/Nanbeige4.3-33B-cmf

## Resumen

Nanbeige4.3-33B-cmf es una versión cuantizada del modelo Nanbeige4.3-33B, publicado en Hugging Face por el usuario infosave. Se trata de una conversión del checkpoint original de Nanbeige (una organización china que desarrolla modelos de lenguaje abiertos) al formato CMF, un formato propietario de artefactos mapeados en memoria diseñado para el motor de inferencia `cortiq`, escrito en Rust. El modelo base es un LLM de 33 mil millones de parámetros con arquitectura Llama, orientado a generación de texto y razonamiento, con soporte de inglés y chino.

La relevancia de esta ficha radica en el ecosistema de despliegue: el formato CMF empaqueta pesos, tokenizador, plantilla de chat y hashes de integridad en un único archivo, lo que simplifica la distribución y verificación del modelo. El motor `cortiq` funciona tanto en CPU como en GPU (vía Vulkan) sin depender de Python ni de builds específicas de CUDA, lo que lo hace atractivo para entornos donde la pila de software debe ser mínima. El modelo conserva el modo de razonamiento (thinking) de la versión original, activable mediante la plantilla de chat embebida y desactivable con la opción `--no-think`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (transformer decoder) |
| Parametros totales | 33B |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4TP (matrices de 4 bits con tensores f16), Q8_2F (matrices de 8 bits con tensores f16) |
| Idiomas soportados | inglés, chino (según la model card, también se verifica una prueba en ruso, sin soporte oficial declarado) |
| Licencia | Apache-2.0 |
| Formato de pesos | CMF (artefacto único con pesos, tokenizador, plantilla de chat y hashes de integridad) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder de tipo Llama con 52 capas, una anchura oculta de 7.168, 56 cabezas de atención y 8 cabezas KV (agrupación de KV, similar a GQA). Esta configuración reduce la memoria de la caché KV durante la inferencia, lo que beneficia contextos largos y batching. El modelo base fue entrenado por Nanbeige; los detalles sobre el número de tokens, la composición del dataset y el uso de RLHF/DPO no están disponibles en la información proporcionada.

La variante aquí descrita no modifica los pesos del modelo original más allá de la cuantización: convierte el checkpoint a matrices Q4TP (4 bits) o Q8_2F (8 bits) junto con tensores f16. El artefacto Q4TP pesa 17,25 GB y contiene 471 tensores (366 en q4tp y 105 en f16). Una innovación destacable del formato CMF es la inclusión de hashes de integridad verificables por tensor mediante `cortiq verify`, lo que permite validar el artefacto antes de ejecutarlo.

## Capacidades

- Generación de texto general en inglés y chino.
- Modo de razonamiento (thinking) activado por defecto mediante la plantilla de chat embebida; desactivable con `--no-think` para respuestas directas.
- Generación de código: la model card verifica la generación correcta de una lambda en Python como prueba determinista.
- Razonamiento lógico y aritmético: se superan pruebas de silogismos y aritmética en modo greedy.
- Respuestas multilingües básicas: se verifica una respuesta correcta a una pregunta de fecha en ruso, aunque el soporte oficial declarado es solo inglés y chino.
- Control de formato: se verifica el cumplimiento de restricciones de longitud de respuesta (exactamente dos frases).
- Ejecución sin Python: el runtime `cortiq` es un binario Rust autocontenido, compatible con CPU y GPU vía Vulkan.

## Casos de uso

- Razonamiento paso a paso en local: el modo thinking activado por defecto permite resolver problemas matemáticos o lógicos descomponiéndolos en pasos, con `--max-tokens 2048` para respuestas extensas.
- Respuestas directas de baja latencia: con `--no-think --greedy` se obtiene salida determinista, útil para preguntas factuales o aritmética simple en pipelines automatizados.
- Despliegue en estaciones de trabajo con GPU de consumo: cabe en una RTX 4090 de 24 GB vía Vulkan, alcanzando 42 tok/s de decodificación, adecuado para asistentes locales interactivos.
- Inferencia en CPU sin pila de Python: con 2,54 tok/s en un Ryzen 9 7950X, es viable para tareas por lotes (batch) no interactivas como clasificación o resumen offline.
- Distribución verificable de modelos: el empaquetado CMF con SHA-256 y verificación por tensor facilita entornos regulados donde se exige trazabilidad de los artefactos ejecutados.
- Generación de código en flujos de trabajo locales: la capacidad verificada de generar funciones Python lo hace utilizable como asistente de completado en entornos aislados sin conexión.
- Entornos multiplataforma: al no requerir CUDA ni builds específicas por GPU, es adecuado para máquinas con GPU AMD o Intel vía Vulkan.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Sí se han publicado mediciones de rendimiento de inferencia para el artefacto Q4TP (mediana de tres ejecuciones con Cortiq 0.8.30, `cortiq bench --core --ignore-eos --tokens 120 --json`):

| Hardware | Backend | Decode (tok/s) | Prefill (tok/s) |
|---|---|---:|---:|
| NVIDIA RTX 4090, 24 GB | Vulkan | 42,04 | 73,14 |
| AMD Ryzen 9 7950X, 8 hilos | CPU | 2,54 | 11,80 |

Adicionalmente, se reportan seis comprobaciones de calidad deterministas (modo greedy, `--no-think`) superadas en CPU y Vulkan: aritmética, un hecho de una palabra, generación de una lambda en Python, un silogismo, una pregunta de fecha en ruso y una respuesta de exactamente dos frases.

## Requisitos de hardware

- VRAM estimada: el artefacto Q4TP ocupa 17,25 GB en disco, por lo que requiere una GPU con al menos 24 GB de VRAM para inferencia completa en GPU (verificado en RTX 4090). La variante Q8_2F será mayor; su tamaño exacto no está disponible.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB) vía Vulkan es la configuración verificada. Al no requerir CUDA, otras GPUs compatibles con Vulkan con 24 GB (por ejemplo, AMD Radeon PRO W7900) deberían funcionar, aunque sin datos publicados.
- Consumer GPU: sí, cabe en una RTX 4090 de 24 GB, la única verificada. GPUs de 16 GB probablemente no sean suficientes para el artefacto Q4TP completo en GPU.
- CPU: viable con 2,54 tok/s de decodificación en un Ryzen 9 7950X con 8 hilos; se controla con `CMF_GPU=0` y `CMF_THREADS=8`. Se recomienda al menos 32 GB de RAM.
- Despliegue: exclusivamente mediante el motor `cortiq` (instalable con `cargo install cortiq-cli`). No hay soporte declarado para vLLM, llama.cpp, Ollama o TGI, ya que el formato CMF no es GGUF ni safetensors.
- Latencia y throughput: 42,04 tok/s de decodificación y 73,14 tok/s de prefill en RTX 4090 (Vulkan); 2,54 tok/s y 11,80 tok/s respectivamente en CPU Ryzen 9 7950X.

## Comparativa con modelos similares

| Caracteristica | Nanbeige4.3-33B-cmf | Modelos de ~30B comparables (Qwen, Gemma, etc.) |
|---|---|---|
| Parametros | 33B | 27-32B tipicamente |
| Arquitectura | Llama, 52 capas, 8 cabezas KV | Transformer decoder (varía) |
| Formato | CMF (solo cortiq) | GGUF, safetensors (ecosistema amplio) |
| Cuantizacion | Q4TP, Q8_2F | GGUF Q4/Q5/Q8, AWQ, GPTQ |
| Razonamiento | Modo thinking embebido | Varia por modelo |
| Licencia | Apache-2.0 | Varia (Apache-2.0, Gemma, etc.) |
| Runtimes | Solo cortiq (Rust) | llama.cpp, vLLM, Ollama, TGI |

La diferencia principal frente a alternativas de tamaño similar no está en la capacidad del modelo base, sino en el ecosistema: el formato CMF y el motor cortiq ofrecen despliegue sin Python y verificación de integridad, pero a cambio de perder la compatibilidad con las herramientas estándar (vLLM, llama.cpp, Ollama). Los datos de rendimiento y benchmarks publicados corresponden solo a esta conversión; no hay comparativas directas con otros modelos en la información disponible.

## Limitaciones y advertencias

- Ecosistema cerrado: el formato CMF solo funciona con el motor `cortiq`; no es compatible con llama.cpp, vLLM, Ollama ni con la mayoría de herramientas de inferencia estándar.
- Sin benchmarks estandarizados publicados para esta cuantización: la calidad se ha verificado solo con seis comprobaciones deterministas simples, insuficientes para evaluar degradación por cuantización Q4TP.
- Cuantización de 4 bits: puede degradar el rendimiento en tareas de razonamiento complejo o generación de código respecto al checkpoint original en f16/bf16.
- Idiomas: soporte oficial declarado solo para inglés y chino; el rendimiento en castellano u otros idiomas no está documentado ni verificado.
- Contexto: la longitud de ventana de contexto no está disponible en la información proporcionada, lo que dificulta planificar casos de uso con documentos largos.
- Modo thinking por defecto: la plantilla embebida activa el razonamiento por defecto, lo que consume tokens adicionales; hay que recordar usar `--no-think` para respuestas directas.
- Alucinaciones: al tratarse de un LLM generativo de 33B, conserva el riesgo inherente de alucinación en tareas factuales; las pruebas de calidad publicadas no evalúan este aspecto.
- Riesgo de dependencia de un proyecto de terceros: la conversión es de un usuario individual (infosave), no del equipo oficial de Nanbeige; verificar los hashes SHA-256 antes de ejecutar.
- Licencia: Apache-2.0 permite uso comercial sin restricciones relevantes, tanto del modelo original como de la conversión.

## Enlaces

- Modelo cuantizado (CMF): https://huggingface.co/infosave/Nanbeige4.3-33B-cmf
- Modelo original: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Runtime y formato CMF (GitHub): https://github.com/infosave2007/cmf
