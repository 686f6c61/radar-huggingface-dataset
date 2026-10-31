# caikybaldo999/zyi-flash

## Resumen

ZYI Flash es un modelo de generación de imágenes (text-to-image) con capacidad de edición de imágenes por instrucciones, desarrollado por el usuario caikybaldo999 y publicado en Hugging Face. Se trata de la versión siguiente de ZYI-256 Flash, ajustada (fine-tuned) en una única sesión de 9,4 horas sobre una única GPU NVIDIA RTX PRO 6000. El modelo genera imágenes a resolución 256×256 píxeles y destaca por su capacidad para representar texto legible dentro de las imágenes (renderizado de glifos), algo poco habitual en modelos tan pequeños.

Técnicamente, emplea una arquitectura de diffusion transformer (DiT) con rectified flow, un autoencoder latente DC-AE que comprime cada imagen de 256 px a solo 64 tokens latentes, y dos codificadores de texto congelados: flan-T5-base para la semántica del prompt y ByT5-small para leer el texto entrecomillado carácter a carácter, lo que permite al modelo escribir palabras correctamente en carteles y rótulos.

Su relevancia radica en demostrar que un modelo compacto, entrenable en hardware de un solo consumidor/profesional, puede competir en tareas concretas (texto en imágenes, edición por instrucciones) frente a modelos mucho mayores. Se publica bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) con rectified flow, 2D RoPE, QK-norm, adaLN-single |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (genera imágenes de 256×256 px, latente de 8×8×32 = 64 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (prompts) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño del repositorio: 12,5 GB) |

## Arquitectura y entrenamiento

El generador es un DiT de 1024 dimensiones y 20 bloques entrenado con rectified flow. El espacio latente lo proporciona DC-AE f32c32, que comprime una imagen de 256 px a una rejilla latente de 8×8×32 (64 tokens), lo que reduce drásticamente el coste computacional de la difusión. Los textos se codifican con flan-T5-base congelado, y las cadenas entrecomilladas se procesan además carácter a carácter mediante un ByT5-small congelado (rama de glifos), cuyas representaciones se proyectan a la misma cross-attention. Incorpora 16 register tokens aprendidos en la secuencia del DiT, que actúan como "scratchpad" global para mejorar el conteo y la composición del layout.

El entrenamiento parte de ZYI-256 Flash y añade 20.892 pasos (75 % text-to-image, 25 % edición), usando 1.000.000 de imágenes de FLUX-Reason-6M y 176.182 pares de edición de OmniEdit (licencia MIT), con énfasis aumentado (3×) en imágenes con texto y (2×) en captions con conteos, y una fase final de annealing de alta calidad sobre el 35 % superior según las puntuaciones de calidad de FLUX-Reason. La edición de imágenes se mantiene mediante tokens de fuente in-context y CFG combinado de texto e imagen.

## Capacidades

- Generación de imágenes a 256×256 px a partir de prompts en inglés.
- Renderizado de texto legible dentro de las imágenes: el texto entrecomillado (por ejemplo, `a sign that says "OPEN"`) se procesa carácter a carácter y se "deletrea" en el caption (`"OPEN" (O P E N)`), tanto en entrenamiento como en inferencia (`spell=True`).
- Edición de imágenes por instrucciones en lenguaje natural (por ejemplo, "make it winter, add snow") manteniendo la imagen fuente como contexto.
- Mejor conteo y layout de objetos gracias a los 16 register tokens y al énfasis en captions con conteos.
- Pipeline propia en Python (`ZyiPipeline`) con soporte de semillas y generación de múltiples imágenes por llamada (`n=4`).
- No soporta tool calling, agentes ni procesamiento de audio; no hay indicios de capacidades de razonamiento textual.

## Casos de uso

- Generación de mockups con rótulos y carteles: gracias a la rama de glifos, el modelo puede escribir palabras concretas en señales, logotipos o carteles, útil para prototipar diseños gráficos rápidos.
- Edición de imágenes por instrucciones: permite modificar fotos existentes con órdenes en lenguaje natural (cambiar estación del año, añadir elementos) sin máscaras ni herramientas de selección manuales.
- Generación de assets para videojuegos o aplicaciones en resolución baja: su tamaño compacto y su salida de 256×256 lo hacen adecuado para iconos, texturas o sprites preliminares.
- Investigación en modelos de difusión pequeños: al ser un modelo entrenable en una sola GPU en menos de 10 horas, sirve como base reproducible para experimentos académicos sobre DiT, rectified flow y register tokens.
- Generación de imágenes con conteo de objetos: el énfasis en captions con conteos y los register tokens mejoran tareas tipo "tres manzanas sobre una mesa".
- Integración en pipelines automatizados de generación de imágenes: la API en Python sencilla (una sola clase `ZyiPipeline`) facilita su uso en scripts y servicios por lotes.
- Educación y demostraciones: por su licencia Apache 2.0 y su bajo coste de inferencia, es adecuado para talleres y demos en hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio pesa 12,5 GB, por lo que una GPU con 16 GB de VRAM debería ser suficiente en precisión completa, y probablemente menos con carga en media precisión (estimación no confirmada por el autor).
- GPU recomendadas: el autor entrenó el modelo con una única NVIDIA RTX PRO 6000; para inferencia, cualquier GPU moderna con suficiente VRAM (RTX 3090/4090 o superior) debería ser adecuada.
- Consumer GPU: al tratarse de un modelo pequeño con latentes de solo 64 tokens, es plausible que funcione en GPUs de consumo de 16-24 GB de VRAM (RTX 4090, RTX 3090); no hay confirmación oficial.
- Opciones de despliegue: pipeline propia incluida en el repositorio (`zyi_flash.py`, clase `ZyiPipeline`), que requiere `torch`, `diffusers`, `transformers`, `safetensors` y `huggingface_hub`. No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI (al no ser un modelo de lenguaje).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Caracteristica | ZYI Flash | FLUX.1 [schnell] | Stable Diffusion 1.5 |
|---|---|---|---|
| Parametros | no disponible | 12.000 M (aprox.) | 890 M (aprox.) |
| Resolucion nativa | 256×256 px | hasta 2048×2048 px | 512×512 px |
| Arquitectura | DiT + rectified flow + rama de glifos ByT5 | DiT + rectified flow | UNet + difusion latente |
| Texto en imágenes | Sí (rama de glifos carácter a carácter) | Sí, pero con errores frecuentes | Escaso |
| Edicion por instrucciones | Sí | No nativamente | No nativamente |
| Licencia | Apache 2.0 | Apache 2.0 | CreativeML OpenRAIL-M |
| Hardware de entrenamiento | 1 GPU (RTX PRO 6000, 9,4 h) | Clusters de gran escala | Clusters de gran escala |

Nota: ZYI Flash es mucho más pequeño y de menor resolución que las alternativas citadas; su ventaja comparativa está en el coste de entrenamiento y despliegue y en el renderizado de texto a esta escala, no en calidad general de imagen.

## Limitaciones y advertencias

- Resolución limitada a 256×256 px con una rejilla latente de 8×8: el propio autor advierte que el texto largo, los rostros pequeños y los detalles finos siguen siendo difíciles para el modelo.
- Solo acepta prompts en inglés; no hay soporte documentado para castellano ni otros idiomas.
- No hay model card detallada sobre sesgos del dataset; al entrenarse con imágenes sintéticas de FLUX-Reason-6M, puede heredar sesgos y artefactos del modelo generador de esos datos.
- Riesgo de alucinación visual: no hay evaluaciones cuantitativas publicadas (FID, ClipScore, etc.), por lo que la calidad debe validarse caso por caso.
- El modelo tiene muy poca tracción comunitaria (94 descargas y 1 like en el momento de la ficha), lo que implica escaso mantenimiento garantizado y posible presencia de errores sin detectar.
- La licencia Apache 2.0 permite uso comercial, pero los datos de edición proceden de OmniEdit (MIT) y las imágenes de FLUX-Reason-6M, cuya procedencia sintética conviene revisar para casos de uso sensibles.
- La pipeline depende de código Python del propio repositorio (`zyi_flash.py`), no de la integración estándar de `diffusers`, lo que puede complicar actualizaciones y despliegues.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/caikybaldo999/zyi-flash
- Modelo base (versión anterior): https://huggingface.co/caikybaldo999/zyi-256-flash
- Dataset FLUX-Reason-6M: https://huggingface.co/datasets/LucasFang/FLUX-Reason-6M
- Dataset OmniEdit-Filtered-1.2M: https://huggingface.co/datasets/TIGER-Lab/OmniEdit-Filtered-1.2M
