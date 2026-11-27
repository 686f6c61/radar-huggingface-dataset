# divinetribe/AesCode-32B-abliterated-MLX-bf16

## Resumen

AesCode-32B-abliterated-MLX-bf16 es una conversión al formato MLX (Apple Silicon) en precisión completa bfloat16 del modelo microsoft/AesCode-32B, un ajuste fino de Qwen/Qwen3-VL-32B-Instruct especializado en generar HTML y CSS a partir de capturas de pantalla (diapositivas, pósters, dashboards, páginas de producto). Sobre esa base, el autor divinetribe aplica una ablación direccional del vector de rechazo (metodología Arditi et al., 2024) que elimina el comportamiento de negativa del modelo sin tocar la torre de visión ni las capacidades de código.

El modelo resuelve el problema de la generación de código estético a partir de imágenes: recibe una imagen y produce código HTML/CSS que la recrea, con un rendimiento reportado por los autores del modelo base claramente superior a Qwen3-VL-32B y a modelos propietarios como Claude Opus 4.8 o GPT-5.5 en su benchmark de 300 muestras infográficas. La variante abliterated está pensada para entornos locales y privados donde el modelo no debe rechazar peticiones por motivos de seguridad.

Con 33.357.390.064 parámetros (~33,4 mil millones), licencia Apache 2.0 y un repositorio de 66,7 GB en safetensors, está empaquetado específicamente para ejecutarse con mlx-vlm en Macs de la serie M. Es relevante ahora porque permite ejecutar un modelo multimodal de 32B de calidad cercana a frontera de forma totalmente offline en hardware de consumo Apple, sin claves de API ni telemetría.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3VLForConditionalGeneration): torre de visión + torre de lenguaje, con proyección al espacio de embeddings |
| Parametros totales | 33.357.390.064 (~33,4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | bf16 (esta build); existen variantes 8-bit y 4-bit en la misma familia |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX, bfloat16) |

## Arquitectura y entrenamiento

La arquitectura subyacente es Qwen3-VL-32B-Instruct, un transformer multimodal con una torre de visión (351 tensores `vision_tower.*` preservados en esta build) y una torre de lenguaje de 64 capas. AesCode-32B es un ajuste fino de ese backbone orientado a generación de código estético con recompensas multimodales desacopladas, según el paper "AesCode: Aesthetic Code Generation with Decoupled Cross-Modal Rewards" (arXiv:2610.18860). No se dispone de detalles sobre el volumen de tokens de entrenamiento ni la composición exacta del dataset.

La modificación específica de esta build es una ablación direccional del rechazo: se calcula una dirección a partir de la capa 44 de 64 (la de mayor separación normalizada entre instrucciones dañinas y benignas en la ventana media del stack), calibrada con 32 instrucciones dañinas frente a 32 benignas en formato de chat y usando el residuo del último token. Esa dirección se ortogonaliza en `embed_tokens`, en la proyección de salida de atención (`self_attn.o_proj`) de cada capa y en `mlp.down_proj` de cada capa. Solo se modifica la torre de lenguaje; la torre de visión y su `vision_config` quedan intactos. La conversión se realiza en bfloat16 sin cuantización.

## Capacidades

- Generación de código HTML y CSS a partir de imágenes: recrea capturas de pantalla de diapositivas, pósters, dashboards y páginas de producto como un único archivo HTML con CSS en línea.
- Comprensión visual multimodal: lectura de elementos de interfaz, jerarquía visual, textos en pantalla, precios, botones y componentes de una página.
- Auditoría de páginas web a partir de captura: análisis SEO, marketing/conversión y accesibilidad, incluida la generación de textos alternativos (alt-text) para imágenes.
- Generación de texto conversacional en formato chat.
- Capacidad de código general heredada del backbone Qwen3-VL-32B.
- Comportamiento sin rechazo (abliterated): no activa negativas por dirección de rechazo en el modelo de lenguaje.
- Multilingüe limitado: la model card declara únicamente inglés.
- No se documenta soporte explícito de tool calling ni de agentes multi-paso en la información disponible.

## Casos de uso

- Recreación de maquetas a partir de capturas: un diseñador sube una captura de una diapositiva o póster y el modelo devuelve un HTML con CSS en línea que la reproduce, útil para prototipado rápido de interfaces sin escribir CSS a mano.
- Auditoría SEO de páginas de producto: se pasa una captura de la página y el modelo identifica etiquetas de título ausentes, fortalezas del H1 y términos clave, como se demuestra en la model card con una página real de producto.
- Generación de alt-text accesible: el modelo describe imágenes de producto y miniaturas con textos alternativos utilizables, facilitando el cumplimiento de accesibilidad en catálogos de comercio electrónico.
- Análisis de conversión en comercio electrónico: evaluación de la jerarquía visual de una página (botón de compra, selector de cantidad, tarjetas de producto) para detectar elementos enterrados o poco visibles.
- Desarrollo local y privado asistido por IA: integración en Claude Code Local sobre un Mac de la serie M para generar y revisar código sin enviar datos a la nube ni usar claves de API.
- Prototipado de dashboards y páginas de producto: a partir de una referencia visual, obtener código de partida que un equipo de frontend puede refinar, reduciendo el tiempo de maquetación inicial.
- Entornos de investigación sin restricciones de rechazo: escenarios donde se necesita que el modelo analice contenido sensible sin negativas, manteniendo intacta la capacidad de visión y código.

## Benchmarks y rendimiento

Los datos disponibles provienen del benchmark de los autores de AesCode sobre 300 muestras de estilo infográfico, puntuadas por corrección en el seguimiento de reglas y calidad visual. Corresponden al modelo base AesCode-32B, no a esta build abliterated.

| Modelo (con imagen de referencia) | Overall | Visual |
|---|---|---|
| AesCode-32B | 85,89 | 77,44 |
| Claude Opus 4.8 (sin referencia) | 76,78 | No disponible |
| GPT-5.5 (sin referencia) | 76,31 | No disponible |
| Qwen3-VL-32B base (con referencia) | 61,10 | No disponible |

No se han publicado resultados de benchmarks independientes específicos para esta build abliterated en MLX. El autor indica que la ablación solo afecta a la dirección de rechazo y no debería alterar la calidad de código o visión, y documenta una prueba cualitativa comparativa sobre una página de producto real frente a la build fiel.

## Requisitos de hardware

- VRAM/unified memory estimada: en bf16, el repositorio ocupa 66,7 GB, por lo que se necesita un Mac con al menos 64 GB de memoria unificada (recomendable 96 GB o más para margen de contexto y activaciones).
- GPU recomendadas: Apple Silicon de la serie M (M1/M2/M3/M4 Pro, Max y Ultra). El formato MLX no está pensado para GPU NVIDIA.
- Variantes para máquinas más pequeñas: la build 8-bit ocupa aproximadamente la mitad y la 4-bit un cuarto, lo que permite ejecución en configuraciones con menos memoria unificada.
- Opciones de despliegue: `mlx-vlm` (comando `python -m mlx_vlm.generate`); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: no disponibles en la información proporcionada.
- Ejecución totalmente local: sin inferencia en la nube, sin claves de API y sin telemetría.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (Overall, benchmark AesCode) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AesCode-32B-abliterated-MLX-bf16 | ~33,4B | No disponible | 85,89 (base AesCode-32B) | Apache 2.0 | Hugging Face, formato MLX |
| Qwen3-VL-32B-Instruct | 32B (clase) | No disponible | 61,10 (con referencia) | No disponible en la información | Hugging Face |
| Claude Opus 4.8 | No disponible | No disponible | 76,78 (sin referencia) | Propietaria | API en la nube |
| GPT-5.5 | No disponible | No disponible | 76,31 (sin referencia) | Propietaria | API en la nube |

La comparación de rendimiento no es estrictamente homogénea: los modelos propietarios se evalúan sin imagen de referencia y AesCode con referencia, según la tabla publicada en la model card del modelo base.

## Limitaciones y advertencias

- La ablación elimina la dirección de rechazo, lo que implica que el modelo puede generar contenido dañino o inapropiado sin negarse; no es adecuado para despliegues públicos sin filtros externos.
- Riesgo de alucinación inherente a los modelos de lenguaje: puede inventar elementos de la imagen, textos o estructuras HTML que no existen en la captura.
- Idiomas: solo se declara inglés; el rendimiento en castellano u otros idiomas no está verificado.
- Longitud de contexto no documentada en la información disponible, lo que dificulta planificar tareas con capturas grandes o conversaciones largas.
- Formato MLX exclusivo para Apple Silicon: no es portable a GPU NVIDIA sin reconversión.
- Requisito de memoria elevado en bf16 (66,7 GB de pesos); en Macs con menos de 64 GB hay que recurrir a las variantes 8-bit o 4-bit, con posible pérdida de calidad.
- La licencia Apache 2.0 permite uso comercial, pero el usuario asume la responsabilidad sobre el contenido generado por una build sin rechazo.
- Los benchmarks disponibles son del modelo base y del autor, no una evaluación independiente de esta build concreta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/divinetribe/AesCode-32B-abliterated-MLX-bf16
- Modelo base: https://huggingface.co/microsoft/AesCode-32B
- Backbone: https://huggingface.co/Qwen/Qwen3-VL-32B-Instruct
- Variante 8-bit: https://huggingface.co/divinetribe/AesCode-32B-abliterated-MLX-8bit
- Variante 4-bit: https://huggingface.co/divinetribe/AesCode-32B-abliterated-MLX-4bit
- Línea estándar (no abliterated): https://huggingface.co/divinetribe/AesCode-32B-MLX-bf16
- Paper de AesCode: https://arxiv.org/abs/2610.18860
- Paper de ablación direccional (Arditi et al.): https://arxiv.org/abs/2406.11717
- Claude Code Local: https://github.com/nicedreamzapp/claude-code-local
- Perfil del autor en GitHub: https://github.com/nicedreamzapp
- Perfil del autor en Hugging Face: https://huggingface.co/divinetribe
