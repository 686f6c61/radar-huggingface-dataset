# scottlowry/Ornith-1.5-122B-oQ6e-mtp

## Resumen

Ornith-1.5-122B-oQ6e-mtp es una cuantización de precisión mixta del modelo base ornith-ai/Ornith-1.5-122B, publicada por el usuario scottlowry. El resultado es un checkpoint de 125.086.497.008 parámetros (125,086B) almacenado en formato MLX safetensors, con un peso efectivo medio de 6,637 bits por peso y un tamaño en disco de 96,647 GiB (103,774 GB). Está pensado para su ejecución en Apple Silicon mediante la librería MLX, no para GPUs NVIDIA ni para despliegues con vLLM o TGI.

El modelo base pertenece a la familia Qwen3.5 MoE, según el tag de arquitectura `qwen3_5_moe` del repositorio, e incorpora tres componentes diferenciados: el modelo de lenguaje (122,112B parámetros lógicos), un módulo de visión (0,451B) y una cabeza MTP (Multi-Token Prediction) de 2,524B parámetros. La presencia de visión y de decodificación multi-token especulativa convierte a este checkpoint en una opción interesante para inferencia local multimodal con aceleración de generación, aunque a costa de un footprint de casi 100 GiB.

La relevancia de esta ficha es doble: por un lado, documenta una cuantización comunitaria de un modelo de gran tamaño que no tiene model card propia con especificaciones detalladas; por otro, sirve como referencia práctica de qué se puede esperar (y qué no) de un checkpoint oQ de 6 bits en MLX. La información disponible es limitada: el autor no publica licencia, idiomas, benchmarks ni detalles de entrenamiento, por lo que muchos campos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tag `qwen3_5_moe`), con módulo de visión y cabeza MTP |
| Parametros totales | 125.086.497.008 (125,086B) |
| Parametros activos | no disponible (el modelo base es MoE, pero no se publica el ratio de activación) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ mixed-precision: affine 6-bit group 64 (94,639% de los pesos), affine 8-bit group 128 (0,370%), affine 8-bit group 64 (4,583%), BF16 (0,408%); media efectiva 6,637 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), cuantización oQ |
| Tamano del repo | 206,8 GB (checkpoint almacenado: 96,647 GiB / 103,774 GB) |
| Componentes | LM 122,112B (93,855 GiB), visión 0,451B (0,841 GiB), MTP head 2,524B (1,952 GiB) |
| Libreria | mlx |
| Modelo base | ornith-ai/Ornith-1.5-122B |
| Version de cuantizacion | oMLX v0.7.4.dev1 (re-cuantizado el 2026-11-11) |
| Descargas | 505 |
| Likes | 2 |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer con mezcla de expertos (MoE), identificado por el tag `qwen3_5_moe`, lo que sugiere una variante de la familia Qwen3.5 con enrutamiento disperso. El checkpoint cuantizado conserva la estructura completa del modelo original e incorpora dos adiciones relevantes: un codificador de visión de 0,451B parámetros, que habilita entrada multimodal de imágenes, y una cabeza MTP (Multi-Token Prediction) de 2,524B parámetros, diseñada para predecir varios tokens por paso y acelerar la decodificación mediante especulación interna.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF o DPO, ni sobre innovaciones de atención (lineal, sliding window, etc.) más allá de lo que implica el tag de arquitectura. La cuantización oQ aplicada por scottlowry es de precisión mixta: mantiene en 6 bits la gran mayoría de los pesos (118,380B, el 94,639%), eleva a 8 bits un 4,953% de los parámetros (6,195B en total entre los dos grupos de 8 bits) y preserva en BF16 un 0,408% (0,511B), presumiblemente capas sensibles como embeddings, normalizaciones o componentes críticos de la cabeza MTP. El resultado es un checkpoint de 96,647 GiB con una media efectiva de 6,637 bits por peso, lo que reduce el tamaño frente al BF16 original (que rondaría los 250 GB) en aproximadamente un 60%.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base Ornith-1.5-122B.
- Procesamiento de imágenes: incluye un módulo de visión de 0,451B parámetros, por lo que admite entrada multimodal (visión-lenguaje).
- Decodificación multi-token (MTP): la cabeza de 2,524B parámetros permite generar varios tokens por paso, lo que reduce la latencia de generación respecto a la decodificación autorregresiva clásica.
- Mezcla de expertos: al ser un MoE, activa solo una fracción de los 125B parámetros por token, lo que mejora el throughput frente a un modelo denso del mismo tamaño (el ratio exacto de activación no está disponible).
- Soporte de tool calling / function calling: no confirmado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado explícitamente, aunque es esperable en un modelo de esta familia; no se documenta.
- Capacidades multilingües: no disponibles; el autor no declara idiomas.
- Modo thinking o razonamiento extendido: no disponible.

## Casos de uso

- Inferencia local en Apple Silicon de alta gama: el checkpoint está en formato MLX y ocupa 96,647 GiB, por lo que encaja en equipos con 128 GB de memoria unificada (Mac Studio M3 Ultra, MacBook Pro M4 Max de 128 GB). Se usaría con la librería MLX para ejecutar un modelo de 125B parámetros sin GPU dedicada.
- Asistente multimodal en local: gracias al módulo de visión de 0,451B, se puede usar para describir imágenes, responder preguntas sobre capturas o documentos escaneados sin enviar datos a la nube, algo relevante en entornos con requisitos de privacidad.
- Generación de texto interactiva de baja latencia: la cabeza MTP permite decodificación especulativa multi-token, adecuada para chatbots o autocompletado donde la latencia por token es crítica.
- Prototipado de investigación en MoE: el checkpoint permite estudiar el comportamiento de un MoE de 125B cuantizado a 6 bits y comparar la calidad frente al modelo en BF16, con un coste de almacenamiento muy inferior.
- Evaluación de cuantización oQ: útil para medir la degradación de calidad de la cuantización mixta (6/8/BF16) en tareas concretas antes de adoptar oQ en producción.
- Desarrollo de pipelines offline en macOS: al no requerir CUDA, se puede integrar en flujos de procesamiento por lotes (resúmenes, clasificación, extracción) ejecutados en estaciones de trabajo Apple.
- Fine-tuning ligero o adaptación con LoRA: aunque no está documentado, el formato safetensors MLX permite cargar el modelo para ajuste de adaptadores en hardware Apple con memoria suficiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada para inferencia: al menos 96,647 GiB solo para los pesos; con overhead de contexto, KV cache y buffers de MLX, se recomienda un mínimo de 110-120 GB. Un equipo de 128 GB de memoria unificada es el escenario realista.
- GPU recomendadas: no aplica CUDA; el checkpoint es MLX y está pensado para Apple Silicon (M2 Ultra, M3 Ultra, M4 Max con 128 GB o más). No es ejecutable directamente en A100, H100 ni RTX 4090 sin reconvertir los pesos a otro formato.
- ¿Cabe en GPU consumer? No en RTX 4090 (24 GB) ni en ninguna GPU consumer NVIDIA. Solo cabe en configuraciones Apple con 128 GB de memoria unificada.
- Opciones de despliegue: MLX (librería nativa), oMLX (herramienta de cuantización y ejecución del mismo ecosistema). No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI con este checkpoint tal cual.
- Latencia y throughput: no disponibles. La cabeza MTP debería reducir la latencia por token frente a decodificación clásica, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ornith-1.5-122B-oQ6e-mtp (este) | 125,086B (MoE) | no disponible | MLX safetensors, 6,637 bits/peso | no disponible | Hugging Face, 505 descargas |
| ornith-ai/Ornith-1.5-122B (base) | 122B aprox. (MoE) | no disponible | safetensors BF16 | no disponible | Hugging Face |
| Qwen3.5 MoE (familia de referencia) | no disponible | no disponible | safetensors, GGUF | no disponible | Hugging Face |

La comparativa con alternativas de la misma categoría (MoE de ~120B en formato MLX cuantizado) no está disponible en la información proporcionada. El modelo base Ornith-1.5-122B es la referencia directa, pero no se publican sus especificaciones de contexto, licencia ni benchmarks en esta ficha.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar si el uso comercial está permitido. Es un riesgo legal relevante para producción; hay que consultar la licencia del modelo base ornith-ai/Ornith-1.5-122B antes de cualquier despliegue.
- Idiomas no declarados: no se puede garantizar el rendimiento en castellano ni en otros idiomas distintos del inglés sin evaluación previa.
- Contexto desconocido: no se publica la longitud de contexto, lo que impide planificar casos de uso con documentos largos.
- Cuantización con pérdida: la media de 6,637 bits/peso implica degradación potencial frente al BF16 original, especialmente en tareas de razonamiento matemático o código. No hay benchmarks que cuantifiquen esa pérdida.
- Riesgo de alucinación: inherente a los modelos de lenguaje de esta escala; no hay datos específicos de evaluación.
- Sesgos: no documentados por el autor; se heredan los del modelo base, que tampoco los declara.
- Dependencia de hardware Apple: el formato MLX limita el despliegue a ecosistema Apple Silicon; no es portable a servidores NVIDIA sin reconversión.
- Re-cuantización reciente: el autor actualizó el checkpoint el 2026-11-11 con oMLX v0.7.4.dev1; las copias anteriores pueden diferir en calidad.
- Sin soporte documentado de tool calling ni agentes: no se debe asumir su disponibilidad en producción sin pruebas.
- Tamaño del repo (206,8 GB) frente al checkpoint (96,647 GiB): la descarga completa puede incluir archivos adicionales; conviene revisar la lista de ficheros antes de descargar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/scottlowry/Ornith-1.5-122B-oQ6e-mtp
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-122B
- Herramienta oQ / oMLX: https://github.com/jundot/omlx
- Librería MLX: https://github.com/ml-explore/mlx
