# divinetribe/AesCode-32B-abliterated-MLX-4bit

## Resumen

AesCode-32B-abliterated-MLX-4bit es una cuantización de 4 bits en formato MLX del modelo microsoft/AesCode-32B, publicada por el usuario divinetribe para su ejecución nativa en Apple Silicon. El modelo base es un ajuste fino de Qwen/Qwen3-VL-32B-Instruct especializado en generación de código estético: recibe una captura de pantalla y genera el HTML y CSS necesarios para recrear diapositivas, carteles, paneles de control o páginas de producto. Esta build concreta aplica además una ablación direccional de rechazo (técnica de Arditi et al., 2024) sobre la torre de lenguaje, dejando intacta la torre de visión.

La relevancia de esta versión radica en dos decisiones técnicas: la torre de lenguaje se cuantiza a 4 bits (unos 18 GB en disco), mientras que los 351 tensores de la torre de visión se mantienen en bfloat16 para preservar la calidad del procesamiento de imágenes. El resultado es un multimodal de aproximadamente 33.360 millones de parámetros que cabe en equipos Mac de gama alta y funciona sin conexión a la nube, sin claves de API y sin telemetría, mediante la librería mlx-vlm.

El modelo hereda la arquitectura Qwen3VLForConditionalGeneration (transformer multimodal con torre de visión y torre de lenguaje) y está pensado para flujos de trabajo de desarrollo frontend donde se parte de una referencia visual y se necesita código reproducible. Su licencia Apache 2.0 facilita el uso comercial, aunque la ablación de rechazo introduce consideraciones de seguridad relevantes para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3VLForConditionalGeneration (torre de visión + torre de lenguaje) |
| Parametros totales | 33.357.390.064 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit en torre de lenguaje; bfloat16 en torre de visión |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen3VLForConditionalGeneration, un transformer multimodal compuesto por una torre de visión y una torre de lenguaje. El modelo base microsoft/AesCode-32B es un ajuste fino de Qwen/Qwen3-VL-32B-Instruct orientado a la generación de código estético, descrito en el paper "AesCode: Aesthetic Code Generation with Decoupled Cross-Modal Rewards" (arXiv:2610.18860), que emplea recompensas desacopladas entre modalidades para alinear la salida de código con la referencia visual. No se dispone de detalles sobre el número de tokens de entrenamiento ni la composición exacta del dataset en la información proporcionada.

Esta build concreta aplica una ablación direccional de rechazo (Arditi et al., 2024) únicamente sobre la torre de lenguaje, tomando la dirección de la capa 44 de 64. La torre de visión queda sin modificar y se mantiene en bfloat16, mientras que la torre de lenguaje se cuantiza a 4 bits. El autor declara que la build superó una prueba de calidad visual antes de su publicación, consistente en auditar una captura real de una página de producto y generar texto alternativo de imágenes. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de código HTML y CSS a partir de capturas de pantalla, orientada a recrear diapositivas, carteles, paneles de control y páginas de producto.
- Comprensión de imágenes (image-text-to-text) mediante la torre de visión conservada en bfloat16.
- Generación de texto y razonamiento general heredados del backbone Qwen3-VL-32B-Instruct.
- Auditoría de páginas web: análisis SEO, marketing y accesibilidad, y generación de texto alternativo para imágenes.
- Soporte de conversación multi-turno (pipeline conversational).
- Capacidades multilingües limitadas al inglés según la model card.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Recreación de interfaces a partir de capturas: el modelo recibe una imagen de una página o componente y devuelve un único archivo HTML con CSS en línea, lo que acelera la maquetación de prototipos frontend a partir de referencias visuales.
- Generación de paneles de control y páginas de producto: dado que el modelo base fue evaluado con muestras de estilo infográfico, es adecuado para producir maquetas de dashboards y fichas de producto con estructura y jerarquía visual coherentes.
- Auditoría de accesibilidad y SEO: puede analizar una captura de una página real y describir sus elementos (imágenes, botones, badges, selectores) además de proponer texto alternativo, útil en revisiones previas al despliegue.
- Desarrollo frontend sin conexión: al ejecutarse con mlx-vlm en Apple Silicon, permite trabajar con código propietario o capturas sensibles sin enviar datos a servicios en la nube ni requerir claves de API.
- Prototipado rápido en equipos Mac: con unos 18 GB en disco y cuantización de 4 bits, encaja en flujos de trabajo de desarrolladores que necesitan iterar sobre diseños sin depender de infraestructura GPU dedicada.
- Generación de material de marketing visual: la capacidad de convertir una referencia gráfica en HTML/CSS facilita la producción de carteles y landings a partir de bocetos o mockups.
- Evaluación comparativa de modelos multimodales: sirve como referencia local para medir la degradación introducida por la cuantización de 4 bits frente a las builds bf16 y 8 bits de la misma familia.

## Benchmarks y rendimiento

Los datos disponibles provienen del paper de AesCode y de la model card del modelo base, evaluados sobre 300 muestras de estilo infográfico con puntuación de seguimiento de reglas y calidad visual. Corresponden al modelo original, no a esta cuantización de 4 bits.

| Modelo (con imagen de referencia) | Overall | Visual |
|---|---|---|
| AesCode-32B | 85.89 | 77.44 |
| Claude Opus 4.8 (sin referencia) | 76.78 | no disponible |
| GPT-5.5 (sin referencia) | 76.31 | no disponible |
| Qwen3-VL-32B base (con referencia) | 61.10 | no disponible |

No se han publicado resultados de benchmarks específicos de esta build cuantizada a 4 bits en la información disponible. El autor indica que no existe un leaderboard público independiente que liste AesCode.

## Requisitos de hardware

- VRAM/espacio en disco: aproximadamente 18 GB para la build de 4 bits; el repositorio ocupa 19,6 GB.
- Plataforma: Apple Silicon (series M), ejecución nativa mediante MLX; no está pensada para GPU NVIDIA.
- GPU recomendadas: no disponible; el modelo está orientado a chips Apple M-series, sin especificar modelos concretos.
- ¿Cabe en consumer GPU? No aplica en el sentido habitual: requiere Apple Silicon, no GPU de consumo NVIDIA.
- Opciones de despliegue: mlx-vlm (`python -m mlx_vlm.generate`); no se documentan vLLM, llama.cpp, Ollama ni TGI para esta build.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AesCode-32B-abliterated-MLX-4bit | 33,36 B | no disponible | Código estético multimodal, cuantizado 4-bit MLX | apache-2.0 | HuggingFace (divinetribe) |
| AesCode-32B-abliterated-MLX-bf16 | no disponible | no disponible | Misma familia, precisión completa | apache-2.0 | HuggingFace (divinetribe) |
| AesCode-32B-abliterated-MLX-8bit | no disponible | no disponible | Misma familia, media precisión | apache-2.0 | HuggingFace (divinetribe) |
| microsoft/AesCode-32B | 32 B (aproximado) | no disponible | Modelo base original | no disponible en la información | HuggingFace (microsoft) |
| Qwen/Qwen3-VL-32B-Instruct | 32 B (aproximado) | no disponible | Backbone multimodal general | no disponible en la información | HuggingFace (Qwen) |

## Limitaciones y advertencias

- La ablación de rechazo elimina la dirección de rechazo del modelo, por lo que puede generar contenido que el modelo original rechazaría; es responsabilidad del integrador aplicar filtros y políticas de uso.
- La cuantización a 4 bits reduce la precisión y no añade conocimiento; el autor advierte explícitamente que no garantiza salidas correctas.
- El modelo solo declara soporte de inglés; el rendimiento en castellano u otros idiomas no está documentado.
- La longitud de contexto no está especificada en la información disponible, lo que dificulta planificar casos de uso con entradas largas.
- Riesgo de alucinación inherente a los modelos generativos, especialmente al inferir elementos no visibles en la captura de pantalla.
- La licencia Apache 2.0 permite uso comercial, pero las implicaciones de la abliteración deben evaluarse según el contexto de despliegue.
- Dependencia exclusiva de Apple Silicon y de mlx-vlm; no hay soporte documentado para otras plataformas o frameworks.
- El número de descargas (26) y de likes (0) es muy bajo, lo que limita la validación comunitaria de la build.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/divinetribe/AesCode-32B-abliterated-MLX-4bit
- Modelo base: https://huggingface.co/microsoft/AesCode-32B
- Backbone: https://huggingface.co/Qwen/Qwen3-VL-32B-Instruct
- Build bf16: https://huggingface.co/divinetribe/AesCode-32B-abliterated-MLX-bf16
- Build 8 bits: https://huggingface.co/divinetribe/AesCode-32B-abliterated-MLX-8bit
- Paper de AesCode: https://arxiv.org/abs/2610.18860
- Paper de ablación de rechazo (Arditi et al.): https://arxiv.org/abs/2406.11717
- Repositorio mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Perfil del autor: https://huggingface.co/divinetribe
- Más modelos del autor: https://nicedreamzwholesale.com/software/huggingface/
