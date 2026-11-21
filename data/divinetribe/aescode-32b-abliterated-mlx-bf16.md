# divinetribe/AesCode-32B-abliterated-MLX-bf16

## Resumen

AesCode-32B-abliterated-MLX-bf16 es una conversión en precisión completa (bfloat16) para Apple Silicon del modelo AesCode-32B, un finetune de Qwen3-VL-32B-Instruct desarrollado por Microsoft que toma una captura de pantalla o una referencia visual y genera el HTML y CSS necesarios para recrearla (presentaciones, pósters, dashboards, páginas de producto). Esta versión concreta, publicada por divinetribe, aplica una abliteración direccional sobre la torre de lenguaje para eliminar la dirección de rechazo del modelo, manteniendo intacta la torre de visión (351 tensores `vision_tower.*` y su `vision_config`).

El modelo base emplea la arquitectura `Qwen3VLForConditionalGeneration`, un transformer multimodal de tipo vision-language con aproximadamente 33.357 millones de parámetros (33,36 B según los safetensors). La conversión está pensada para ejecutarse localmente en Macs de la serie M mediante la librería MLX (concretamente `mlx-vlm`), sin inferencia en la nube, sin claves de API y sin telemetría. El repositorio ocupa 66,7 GB y se distribuye bajo licencia Apache 2.0.

Su relevancia actual reside en dos factores: por un lado, ofrece una alternativa de generación de código visual (screenshot-to-HTML) de alta calidad que, según la model card, supera en su benchmark interno a modelos propietarios como Claude Opus 4.8 y GPT-5.5 en la tarea específica de generación estética de código; por otro, la abliteración permite eliminar comportamientos de rechazo sin degradar aparentemente las capacidades de código y visión, algo que el autor verificó con una prueba comparativa sobre una página de producto real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3VLForConditionalGeneration (transformer multimodal vision-language) |
| Parametros totales | 33.357.390.064 (33,36 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (esta build); existen variantes 8-bit y 4-bit en la misma familia |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX, bfloat16 sin cuantizar) |

## Arquitectura y entrenamiento

El modelo base AesCode-32B es un finetune de Qwen3-VL-32B-Instruct, un transformer multimodal con torre de visión y torre de lenguaje. La arquitectura combina un codificador visual (cuyos 351 tensores se conservan intactos en esta build) con un decoder de lenguaje autorregresivo. El pipeline declarado es `image-text-to-text`, lo que refleja su orientación a tareas de comprensión y generación a partir de imágenes.

El entrenamiento del modelo original se describe en el paper "AesCode: Aesthetic Code Generation with Decoupled Cross-Modal Rewards" (arXiv:2610.18860), que introduce una estrategia de recompensas multimodales desacopladas orientada a la generación de código estético. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon fases de RLHF o DPO.

La innovación técnica específica de esta build es la abliteración direccional según Arditi et al. (2024): se calculó la dirección de rechazo a partir de la capa 44 de 64 (seleccionada por la mayor separación normalizada harmful/harmless en la ventana media de la pila), usando 32 instrucciones dañinas frente a 32 inofensivas en formato de chat y residual del último token. La dirección se ortogonalizó en `embed_tokens`, en la proyección de salida de atención de cada capa (`self_attn.o_proj`) y en cada `mlp.down_proj`, de modo que solo se modifica la torre de lenguaje y no las partes de la red que leen la imagen.

## Capacidades

- Generación de código HTML y CSS a partir de capturas de pantalla o referencias visuales (slides, pósters, dashboards, páginas de producto).
- Comprensión de imágenes y texto (multimodal, pipeline image-text-to-text) con torre de visión intacta.
- Generación de texto conversacional en ingles.
- Auditoría visual de páginas: análisis SEO, marketing/conversión y accesibilidad, incluida la redacción de textos alternativos (alt-text).
- Comportamiento sin rechazo (abliterated) en la torre de lenguaje, manteniendo las capacidades de código y visión.
- Ejecución local offline en Apple Silicon mediante MLX, sin dependencia de servicios en la nube.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: solo ingles declarado.

## Casos de uso

- Recreación de interfaces a partir de capturas: el modelo recibe una screenshot y devuelve un único archivo HTML con CSS inline, útil para prototipado rápido de UI y para ingeniería inversa de diseños existentes.
- Generación de páginas de producto y landing pages: a partir de una referencia visual, produce el código de una página comercial completa, aprovechando su especialización en estética y fidelidad visual.
- Creación de dashboards y paneles de datos: convierte maquetas o capturas de paneles en código HTML/CSS listo para integrar en aplicaciones web.
- Producción de presentaciones y pósters: genera el marcado necesario para reproducir diapositivas o carteles con composición visual cuidada.
- Auditoría automatizada de accesibilidad y SEO: analiza una página real y redacta recomendaciones concretas (title tags, H1, alt-text de imágenes) y propuestas de mejora de conversión.
- Desarrollo local en entornos privados: integración en flujos de trabajo tipo Claude Code Local sobre un Mac de la serie M, sin enviar capturas ni código a servicios externos, adecuado para material confidencial.
- Prototipado offline en entornos sin conectividad: al ejecutarse con MLX de forma local, permite generar código visual en portátiles Apple Silicon sin acceso a red.

## Benchmarks y rendimiento

Los datos disponibles proceden del benchmark del paper del modelo original (300 muestras de estilo infográfico, puntuadas por seguimiento de reglas y calidad visual), citados en la model card de microsoft/AesCode-32B. Corresponden al modelo base, no a esta build abliterada.

| Modelo (con imagen de referencia) | Overall | Visual |
|---|---|---|
| AesCode-32B | 85,89 | 77,44 |
| Claude Opus 4.8 (sin referencia) | 76,78 | no disponible |
| GPT-5.5 (sin referencia) | 76,31 | no disponible |
| Qwen3-VL-32B base (con referencia) | 61,10 | no disponible |

No se han publicado resultados de benchmarks independientes para esta build abliterada en MLX. El autor indica que la abliteración solo afecta a la dirección de rechazo y no debería alterar la calidad de código o visión, y que lo verificó con una prueba comparativa sobre una página de producto real frente a la build fiel.

## Requisitos de hardware

- VRAM/unified memory estimada: al ser bf16 con 33,36 B parámetros, los pesos ocupan aproximadamente 66,7 GB; se necesita un Mac con memoria unificada suficiente para cargar el modelo completo (en la práctica, configuraciones de gama alta de Apple Silicon).
- GPU recomendadas: Apple Silicon de la serie M con memoria unificada amplia; no está pensado para GPU NVIDIA.
- Cabe en consumer GPU: no en GPUs de consumo convencionales por el tamaño en bf16; para equipos más pequeños existen las variantes 8-bit (aproximadamente la mitad) y 4-bit (aproximadamente un cuarto) de la misma familia.
- Opciones de despliegue: `mlx-vlm` (librería MLX); no se indica soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (Overall, benchmark AesCode) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AesCode-32B-abliterated-MLX-bf16 | 33,36 B | no disponible | 85,89 (modelo base) | apache-2.0 | Hugging Face, MLX |
| AesCode-32B (base, Microsoft) | 32 B (aprox.) | no disponible | 85,89 | no disponible en la informacion | Hugging Face |
| Qwen3-VL-32B-Instruct (backbone) | 32 B (aprox.) | no disponible | 61,10 (con referencia) | no disponible en la informacion | Hugging Face |
| Claude Opus 4.8 | no disponible | no disponible | 76,78 (sin referencia) | propietaria | API comercial |

## Limitaciones y advertencias

- Idiomas: solo ingles declarado; el rendimiento en castellano no está verificado.
- Longitud de contexto: no disponible en la información proporcionada, lo que impide planificar tareas con ventanas largas sin validación previa.
- Alucinación: no hay datos publicados sobre tasas de alucinación; en tareas de auditoría visual conviene verificar las recomendaciones generadas contra la página real.
- Abliteración: elimina la dirección de rechazo, lo que reduce las salvaguardas del modelo; su uso en producción requiere filtros y políticas propias de moderación.
- Plataforma: exclusivamente MLX para Apple Silicon; no hay pesos GGUF ni soporte documentado para ecosistemas NVIDIA/CUDA.
- Memoria: la build bf16 necesita del orden de 66,7 GB de memoria unificada; en equipos menores debe recurrirse a las variantes 8-bit o 4-bit, con posible pérdida de calidad.
- Licencia Apache 2.0: permite uso comercial, pero deben respetarse las obligaciones de atribución y las condiciones del modelo base original.
- Benchmark: los resultados proceden de la evaluación de los autores del modelo base sobre 300 muestras, sin leaderboard independiente; no son directamente extrapolables a esta build.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/divinetribe/AesCode-32B-abliterated-MLX-bf16
- Modelo base: https://huggingface.co/microsoft/AesCode-32B
- Backbone: https://huggingface.co/Qwen/Qwen3-VL-32B-Instruct
- Variante 8-bit: https://huggingface.co/divinetribe/AesCode-32B-abliterated-MLX-8bit
- Variante 4-bit: https://huggingface.co/divinetribe/AesCode-32B-abliterated-MLX-4bit
- Build fiel (no abliterada): https://huggingface.co/divinetribe/AesCode-32B-MLX-bf16
- Paper de AesCode: https://arxiv.org/abs/2610.18860
- Paper de abliteración (Arditi et al.): https://arxiv.org/abs/2406.11717
- Repositorio Claude Code Local: https://github.com/nicedreamzapp/claude-code-local
- Perfil del autor en GitHub: https://github.com/nicedreamzapp
