# divinetribe/AesCode-32B-abliterated-MLX-bf16

## Resumen

AesCode-32B-abliterated-MLX-bf16 es una conversión a formato MLX en precisión completa (bfloat16) del modelo microsoft/AesCode-32B, un finetune de Qwen/Qwen3-VL-32B-Instruct especializado en generación de código estético: recibe una captura de pantalla y produce el HTML y CSS necesarios para recrearla (presentaciones, pósteres, dashboards, páginas de producto). La conversión la publica el usuario divinetribe y añade una modificación de tipo *abliteration* (ablación direccional según Arditi et al., 2024) que elimina la dirección de rechazo del modelo sin tocar la torre de visión.

El modelo conserva la arquitectura multimodal del backbone Qwen3-VL (clase `Qwen3VLForConditionalGeneration`), con 33.357.390.064 parámetros totales y los 351 tensores de la torre de visión intactos. La modificación se aplica únicamente a la torre de lenguaje: se ortogonaliza la dirección de rechazo en `embed_tokens`, en la proyección de salida de atención (`self_attn.o_proj`) y en `mlp.down_proj` de cada capa. La dirección se extrae de la capa 44 de 64, calibrada con 32 instrucciones dañinas frente a 32 inofensivas en formato de chat.

Su relevancia es doble: por un lado, ofrece inferencia local en Apple Silicon sin cuantización para una tarea exigente (visión + generación de código); por otro, documenta un proceso de abliteración con verificación explícita de que la capacidad de visión y de código no se degrada. La licencia es Apache 2.0 y el modelo solo declara soporte para inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3-VL (`Qwen3VLForConditionalGeneration`): torre de visión + torre de lenguaje |
| Parametros totales | 33.357.390.064 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (esta build); la familia incluye variantes 8-bit y 4-bit |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX, bfloat16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-VL-32B-Instruct, un transformer multimodal con torre de visión y torre de lenguaje, y sobre él el equipo de Microsoft entrenó AesCode-32B con el objetivo de generar código estético (HTML/CSS) a partir de una imagen de referencia. El paper asociado, "AesCode: Aesthetic Code Generation with Decoupled Cross-Modal Rewards" (arXiv:2610.18860), describe el método de entrenamiento con recompensas cross-modales desacopladas, aunque la información disponible no detalla el número de tokens de entrenamiento ni la composición exacta del dataset.

Sobre esa base, esta build aplica ablación direccional (Arditi et al., 2024): se calcula la dirección de rechazo a partir de la diferencia de activaciones residuales (último token) entre 32 instrucciones dañinas y 32 inofensivas, se selecciona la capa 44 de 64 por la mayor separación normalizada en la ventana media de la pila, y se proyecta ortogonalmente esa dirección fuera de todos los pesos que escriben en el flujo residual. La torre de visión (351 tensores `vision_tower.*` y `vision_config`) queda intacta, de modo que el modelo sigue leyendo imágenes con la misma calidad. La conversión se realizó a bfloat16 sin cuantización y se validó frente a la build no abliterada con una tarea real de auditoría de una página de producto.

## Capacidades

- Generación de código HTML y CSS a partir de capturas de pantalla: recreación de slides, pósteres, dashboards y páginas de producto.
- Comprensión de imágenes (image-text-to-text) con la torre de visión completa.
- Razonamiento visual aplicado a auditorías: SEO, marketing/conversión y accesibilidad, incluida la generación de textos alternativos (alt-text).
- Generación de texto conversacional en inglés.
- Capacidad de código heredada del backbone Qwen3-VL-32B-Instruct.
- Sin dirección de rechazo: el modelo no deriva hacia respuestas de negativa ante instrucciones que el modelo original rechazaría.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.

## Casos de uso

- Recreación de interfaces a partir de mockups: el desarrollador pasa una captura de un diseño y el modelo devuelve un único archivo HTML con CSS inline, listo para prototipar o como punto de partida de un componente.
- Auditoría de accesibilidad y SEO sobre capturas de páginas reales: el modelo identifica elementos de la página (título de producto, precio, valoraciones, botones) y propone mejoras de estructura y textos alternativos, como se documenta en la propia model card.
- Generación de dashboards y pósteres para presentaciones: a partir de una referencia visual, produce el marcado necesario para replicar la composición, útil en equipos de diseño que quieren pasar de imagen a código rápidamente.
- Prototipado local en Apple Silicon: investigadores y desarrolladores pueden ejecutar el modelo en un Mac de la serie M sin claves de API, sin telemetría y sin inferencia en la nube, lo que facilita trabajar con datos sensibles.
- Evaluación de técnicas de abliteración: sirve como caso de estudio reproducible para estudiar el efecto de la ablación direccional sobre capacidades de visión y código, con una build de referencia no modificada disponible para comparar.
- Generación de páginas de producto de comercio electrónico: dado un screenshot de una ficha de producto, el modelo puede producir el HTML/CSS de la página y sugerir mejoras de conversión (posición del botón de compra, jerarquía visual).
- Automatización de tareas de front-end en pipelines internos: integrable mediante `mlx-vlm` en scripts que convierten capturas en código, siempre que el flujo de trabajo se ejecute en hardware Apple.

## Benchmarks y rendimiento

Los datos disponibles provienen del paper y la model card del modelo original (microsoft/AesCode-32B), sobre 300 muestras de estilo infográfico evaluadas en corrección de seguimiento de reglas y calidad visual. No son resultados de esta build abliterada, que solo se validó cualitativamente en una tarea de auditoría de página de producto.

| Modelo (con imagen de referencia) | Overall | Visual |
|---|---|---|
| AesCode-32B | 85.89 | 77.44 |
| Claude Opus 4.8 (sin referencia) | 76.78 | no disponible |
| GPT-5.5 (sin referencia) | 76.31 | no disponible |
| Qwen3-VL-32B base (con referencia) | 61.10 | no disponible |

No se han publicado resultados de benchmarks independientes para esta conversión MLX ni para la variante abliterada en la información disponible.

## Requisitos de hardware

- VRAM/ memoria unificada: la build bf16 ocupa 66,7 GB en el repositorio; para cargarla en memoria se necesita un Mac con al menos 64 GB de memoria unificada, y 96 GB o más para trabajar con comodidad.
- GPU recomendadas: Apple Silicon de la serie M (M1 Max/Ultra, M2 Ultra, M3 Max/Ultra, M4 Max) con memoria unificada suficiente. No está pensada para GPU NVIDIA.
- Cabe en GPU de consumo: no en el sentido habitual; requiere Apple Silicon con memoria unificada alta. Para equipos más modestos existen las variantes 8-bit (aproximadamente la mitad de tamaño) y 4-bit (aproximadamente un cuarto).
- Opciones de despliegue: `mlx-vlm` (comando `python -m mlx_vlm.generate`), con soporte de entrada de imagen y prompt. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AesCode-32B-abliterated-MLX-bf16 | 33,36 B | no disponible | Imagen a HTML/CSS, abliterado, MLX bf16 | Apache 2.0 | HuggingFace (divinetribe) |
| microsoft/AesCode-32B | 32 B (aprox.) | no disponible | Imagen a HTML/CSS, sin modificar | no disponible en la información | HuggingFace (Microsoft) |
| Qwen/Qwen3-VL-32B-Instruct | 32 B (aprox.) | no disponible | Visión-lenguaje general | no disponible en la información | HuggingFace (Qwen) |
| divinetribe/AesCode-32B-MLX-bf16 | 33,36 B | no disponible | Imagen a HTML/CSS, MLX bf16 sin abliterar | Apache 2.0 | HuggingFace (divinetribe) |

La comparación directa con modelos de propósito general como Claude Opus 4.8 o GPT-5.5 solo está disponible en la tabla de benchmarks del paper, con la salvedad de que estos últimos se evaluaron sin imagen de referencia.

## Limitaciones y advertencias

- La abliteración elimina la dirección de rechazo: el modelo puede generar contenido que el modelo original rechazaría. Es responsabilidad del desplegador aplicar filtros y políticas de uso adecuadas.
- Solo declara soporte de inglés; el rendimiento en castellano u otros idiomas no está verificado.
- Riesgo de alucinación inherente a los modelos generativos: en tareas de auditoría visual puede describir elementos que no están presentes en la imagen o inventar textos alternativos poco precisos.
- La validación de calidad de la build abliterada es cualitativa (una única tarea de auditoría de página de producto), no un benchmark exhaustivo.
- La longitud de contexto no está documentada en la información disponible; conviene verificarla antes de usarla con capturas de alta resolución o conversaciones largas.
- Requiere hardware Apple Silicon con memoria unificada elevada para la versión bf16; el rendimiento en otras plataformas no está soportado por esta conversión.
- Aunque la licencia es Apache 2.0, deben respetarse las condiciones del modelo base y del backbone Qwen3-VL; conviene revisar ambas licencias antes de un uso comercial.
- El repositorio tiene muy pocas descargas (35) y ningún "like", lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/divinetribe/AesCode-32B-abliterated-MLX-bf16
- Modelo base: https://huggingface.co/microsoft/AesCode-32B
- Backbone: https://huggingface.co/Qwen/Qwen3-VL-32B-Instruct
- Variante 8-bit: https://huggingface.co/divinetribe/AesCode-32B-abliterated-MLX-8bit
- Variante 4-bit: https://huggingface.co/divinetribe/AesCode-32B-abliterated-MLX-4bit
- Línea estándar (sin abliterar): https://huggingface.co/divinetribe/AesCode-32B-MLX-bf16
- Paper de AesCode: https://arxiv.org/abs/2610.18860
- Paper de ablación direccional (Arditi et al.): https://arxiv.org/abs/2406.11717
