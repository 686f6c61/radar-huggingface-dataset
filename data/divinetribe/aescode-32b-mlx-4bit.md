# divinetribe/AesCode-32B-MLX-4bit

## Resumen

AesCode-32B-MLX-4bit es una cuantización de 4 bits en formato MLX del modelo microsoft/AesCode-32B, publicada por el usuario divinetribe para su ejecución nativa en Apple Silicon. AesCode-32B es a su vez un finetune de Qwen/Qwen3-VL-32B-Instruct orientado a la generación de código estético: recibe una captura de pantalla (slides, pósteres, dashboards, páginas de producto) y produce el HTML y CSS necesarios para recrearla. La particularidad de esta build es que solo el tower de lenguaje se cuantiza a 4 bits, mientras que los 351 tensores `vision_tower.*` se mantienen en bfloat16 para preservar la calidad del procesamiento de imagen.

El modelo cuenta con 33.357.390.064 parámetros totales (unos 33,4 mil millones) y ocupa aproximadamente 18-19,6 GB en disco, lo que lo hace viable en Macs de gama alta con memoria unificada. La arquitectura subyacente es `Qwen3VLForConditionalGeneration`, un transformer multimodal con torre de visión y torre de lenguaje, empaquetado para ejecutarse con la librería `mlx-vlm` en chips de la serie M de Apple.

Su relevancia actual radica en que permite ejecutar un modelo multimodal de 32B especializado en generación de código visual de forma completamente local y privada, sin claves de API ni telemetría, dentro de herramientas como Claude Code Local. La licencia Apache 2.0 facilita su adopción tanto en investigación como en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3VLForConditionalGeneration (torre de visión + torre de lenguaje) |
| Parametros totales | 33.357.390.064 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit en la torre de lenguaje; bf16 en la torre de visión (351 tensores `vision_tower.*`) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base microsoft/AesCode-32B deriva de Qwen3-VL-32B-Instruct mediante un finetune orientado a la generación de código estético a partir de imágenes de referencia. La arquitectura es un transformer multimodal con una torre de visión que procesa la imagen de entrada y una torre de lenguaje que genera el HTML/CSS correspondiente. El paper asociado, "AesCode: Aesthetic Code Generation with Decoupled Cross-Modal Rewards" (arXiv:2610.18860), describe el enfoque de recompensas desacopladas entre modalidades, lo que sugiere un proceso de optimización con señales de recompensa separadas para la corrección del seguimiento de reglas y la calidad visual del resultado.

Esta build concreta no introduce entrenamiento adicional: es una cuantización MLX de 4 bits sobre los pesos del modelo original. La decisión técnica destacable es mantener la torre de visión en bfloat16 mientras se cuantiza únicamente la torre de lenguaje, de modo que la ruta de imagen conserva su precisión. El autor indica que cada tamaño de la familia pasa por una prueba de validación de visión antes de publicarse: se introduce una captura real de una página de producto y se solicita una auditoría SEO, de marketing y de accesibilidad, además de texto alternativo para imágenes; la build de 4 bits superó esa prueba. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de código HTML y CSS a partir de capturas de pantalla, con estilos inline, para recrear slides, pósteres, dashboards y páginas de producto.
- Comprensión de imágenes (image-text-to-text) mediante la torre de visión conservada en bf16.
- Auditoría de páginas web: análisis SEO, de marketing y de accesibilidad a partir de una captura.
- Generación de texto alternativo (alt-text) para imágenes.
- Razonamiento multimodal sobre elementos de interfaz: identificación de barras de navegación, grids, formularios, badges de confianza, pestañas y botones de compartición.
- Conversación multi-turno (pipeline conversational).
- Capacidades multilingües limitadas al inglés según la model card.
- No se documenta soporte explícito de tool calling, function calling ni modos de agente multi-paso en la información disponible.

## Casos de uso

- Recreación de maquetas a código: a partir de la captura de un diseño (slide, póster, dashboard), el modelo genera un único archivo HTML con CSS inline listo para revisar, aprovechando su especialización en generación de código estético.
- Prototipado rápido de interfaces: un diseñador sube una captura de una página de producto y obtiene una primera implementación funcional que sirve como punto de partida para el desarrollo frontend.
- Auditoría de accesibilidad y SEO: se introduce la captura de una página en producción y el modelo identifica elementos, propone textos alternativos y señala problemas de estructura, útil para revisiones previas a un despliegue.
- Generación de alt-text a escala: procesamiento local de capturas de catálogos o páginas de comercio electrónico para producir descripciones de imagen, sin enviar datos a servicios en la nube.
- Asistencia de código en local dentro de Claude Code Local: el modelo puede ejecutarse en una Mac como backend de generación de código privado y offline, sin claves de API ni telemetría.
- Documentación visual de componentes: dada la captura de un componente de interfaz, el modelo describe su estructura y produce el marcado correspondiente, útil para mantener documentación de design systems.
- Flujos de trabajo con requisitos de privacidad: al ejecutarse íntegramente en Apple Silicon con mlx-vlm, es adecuado para equipos que no pueden enviar capturas de producto o interfaces internas a APIs externas.

## Benchmarks y rendimiento

Los datos disponibles proceden del paper de AesCode y de la model card del modelo original, evaluados sobre un benchmark de 300 muestras de estilo infográfico y puntuados por corrección en el seguimiento de reglas y calidad visual. No existe un leaderboard público independiente que liste AesCode específicamente.

| Modelo (con imagen de referencia) | Overall | Visual |
|---|---|---|
| AesCode-32B | 85,89 | 77,44 |
| Claude Opus 4.8 (sin referencia) | 76,78 | no disponible |
| GPT-5.5 (sin referencia) | 76,31 | no disponible |
| Qwen3-VL-32B base (con referencia) | 61,10 | no disponible |

Estos números corresponden al modelo original, no a esta cuantización de 4 bits. Para evaluaciones de visión general del backbone, deben consultarse las evaluaciones oficiales de Qwen3-VL-32B-Instruct. No se han publicado resultados de benchmarks específicos de esta build MLX 4-bit en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: aproximadamente 18-19,6 GB en disco para los pesos en 4 bits; se necesita memoria unificada suficiente para cargar el modelo completo más el contexto, por lo que se recomienda un Mac con al menos 24-32 GB de memoria unificada.
- GPU: exclusivamente Apple Silicon (chips de la serie M); no está pensado para GPUs NVIDIA (A100, H100, RTX 4090) en este formato MLX.
- Cabe en consumer hardware de Apple: sí, en Macs de gama alta con memoria unificada suficiente; no es ejecutable en GPUs de consumo convencionales por el formato MLX.
- Opciones de despliegue: `mlx-vlm` (librería oficial para inferencia), con integración en Claude Code Local; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AesCode-32B-MLX-4bit | 33,4B | no disponible | MLX safetensors 4-bit | apache-2.0 | Hugging Face (divinetribe) |
| AesCode-32B-MLX-bf16 | 33,4B | no disponible | MLX safetensors bf16 | apache-2.0 | Hugging Face (divinetribe) |
| AesCode-32B-MLX-8bit | 33,4B | no disponible | MLX safetensors 8-bit | apache-2.0 | Hugging Face (divinetribe) |
| microsoft/AesCode-32B | 33,4B | no disponible | safetensors (formato original) | apache-2.0 | Hugging Face (microsoft) |
| Qwen3-VL-32B-Instruct | 32B | no disponible | safetensors | no disponible | Hugging Face (Qwen) |

La comparativa natural es dentro de la propia familia AesCode (bf16, 8-bit y 4-bit), que difieren únicamente en precisión y tamaño en disco, y frente al modelo original de Microsoft y al backbone Qwen3-VL-32B-Instruct. No se dispone de datos de rendimiento comparativo entre estas variantes más allá de la validación cualitativa de visión descrita por el autor.

## Limitaciones y advertencias

- La cuantización a 4 bits reduce la precisión: el autor advierte explícitamente que no añade conocimiento ni garantiza la corrección de la salida.
- El modelo está especializado en generación de código a partir de imágenes; su rendimiento en tareas generales de texto o razonamiento puede diferir del backbone Qwen3-VL.
- Idiomas soportados limitados al inglés según la model card; no se garantiza un rendimiento equivalente en castellano.
- Riesgo de alucinación inherente a los modelos generativos, especialmente al inferir elementos de una imagen que no estén claramente visibles.
- La longitud de contexto no está documentada en la información disponible, lo que dificulta planificar casos de uso con entradas muy largas.
- Restricciones de plataforma: el formato MLX solo se ejecuta en Apple Silicon; no es portable a CUDA ni a otros backends sin conversión.
- Licencia Apache 2.0 permite uso comercial, pero debe respetarse la atribución correspondiente al modelo base de Microsoft y al backbone de Qwen.
- Los benchmarks citados corresponden al modelo original, no a esta cuantización; no deben extrapolarse sin validación propia.
- El modelo no incorpora mecanismos de seguridad específicos documentados; en producción conviene añadir filtrado y validación de salidas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/divinetribe/AesCode-32B-MLX-4bit
- Modelo base: https://huggingface.co/microsoft/AesCode-32B
- Backbone: https://huggingface.co/Qwen/Qwen3-VL-32B-Instruct
- Variante bf16: https://huggingface.co/divinetribe/AesCode-32B-MLX-bf16
- Variante 8-bit: https://huggingface.co/divinetribe/AesCode-32B-MLX-8bit
- Paper: https://arxiv.org/abs/2610.18860
- Repositorio Claude Code Local: https://github.com/nicedreamzapp/claude-code-local
- Librería mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Perfil del autor en Hugging Face: https://huggingface.co/divinetribe
- GitHub del autor: https://github.com/nicedreamzapp
- Página de software del autor: https://nicedreamzwholesale.com/software/
