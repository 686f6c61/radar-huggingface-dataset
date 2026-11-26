# aevionlabs/MiniMax-H3-Image

## Resumen

MiniMax-H3-Image es un modelo de difusión para generación y edición de imágenes, presentado por aevionlabs como un ajuste fino (finetune) del checkpoint oficial MiniMaxAI/MiniMax-H3. Unifica en un único checkpoint la generación texto-a-imagen y la edición de una o varias imágenes de referencia, con el objetivo de ofrecer control creativo preciso mediante instrucciones en lenguaje natural. El repositorio ocupa 204 GB y se distribuye en formato safetensors bajo la librería `minimax-h3`.

La propuesta técnica se apoya en tres pilares: salida de aproximadamente 16 megapíxeles en cualquier relación de aspecto (desde 4096x4096 en 1:1 hasta 6272x2688 en 21:9) sin upscaler externo, un nivel de detalle y realismo que el autor sitúa por encima del "aspecto IA" habitual, y un seguimiento de instrucciones reforzado que admite hasta 16 imágenes de referencia. El checkpoint está destilado a 6 pasos de muestreo (6 NFEs) sin classifier-free guidance, lo que reduce el coste computacional por imagen.

Arquitectónicamente emplea un transformer de difusión (DiT) con la arquitectura H3 desprovista de las capas de audio, reutilizando sin cambios el text encoder de MiniMax-H3. La información disponible no detalla el número de parámetros ni la longitud de contexto del text encoder, por lo que esos datos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (diffusion transformer) con arquitectura H3 sin capas de audio; text encoder de MiniMax-H3 sin modificar |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint publicado en BF16 para el DiT) |
| Idiomas soportados | en (inglés) |
| Licencia | minimax-h3-image-community-license-agreement (license: other) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer de difusión (DiT) que hereda la arquitectura H3 del modelo base MiniMax-H3, eliminando las capas de audio y manteniendo el text encoder original sin modificaciones. El checkpoint está destilado a 6 pasos de muestreo (6 NFEs) y opera sin classifier-free guidance, lo que reduce el número de evaluaciones de red necesarias por imagen frente a los pipelines de difusión convencionales.

La información proporcionada no especifica el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF o DPO. Tampoco se detalla la estrategia de destilación empleada. El modelo se presenta como un finetune del checkpoint MiniMaxAI/MiniMax-H3, pero no se documentan los datos ni los hiperparámetros del ajuste.

## Capacidades

- Generación de imágenes texto-a-imagen con salida de aproximadamente 16 megapíxeles en relaciones de aspecto desde 1:1 (4096x4096) hasta 21:9 (6272x2688), sin necesidad de upscaler.
- Edición de imágenes: modifica una o varias imágenes de referencia a partir de instrucciones en lenguaje natural.
- Soporte de hasta 16 imágenes de referencia por generación o edición, según el autor.
- Seguimiento de instrucciones reforzado, que el autor sitúa como el más alto entre los modelos de código abierto de su categoría.
- Generación en 6 pasos de muestreo (6 NFEs) sin classifier-free guidance.
- Prompt expansion disponible a través de la API de MiniMax (endpoint context-ir), no documentado como capacidad del checkpoint local.
- Idioma de prompting: inglés.

## Casos de uso

- Producción de arte conceptual a alta resolución: el modelo genera imágenes de 16 MP directamente, lo que permite obtener material listo para impresión o para recorte sin depender de upscalers externos, reduciendo pasos en el pipeline creativo.
- Edición de fotografías de producto: con soporte de varias imágenes de referencia, se pueden sustituir fondos, corregir iluminación o cambiar materiales manteniendo la coherencia del objeto original.
- Diseño de personajes consistentes: el uso de hasta 16 imágenes de referencia facilita mantener rasgos de un personaje a lo largo de varias generaciones, útil en preproducción de animación o videojuegos.
- Creación de keyframes para vídeo: las relaciones de aspecto panorámicas (hasta 21:9) y la resolución de 6272x2688 encajan con formatos cinematográficos, sirviendo como fotogramas base para pipelines de generación de vídeo.
- Ilustración editorial y publicitaria: el realismo y el detalle descritos por el autor permiten generar imágenes de atmósfera y escenas complejas para maquetación a gran formato.
- Prototipado rápido de variantes visuales: los 6 pasos de muestreo sin CFG reducen el coste por iteración, lo que permite explorar muchas variantes de un concepto en menos tiempo de GPU.
- Integración vía API en aplicaciones: los endpoints de generación, edición y expansión de prompt de la plataforma MiniMax permiten incorporar el modelo a herramientas SaaS sin desplegar los 204 GB de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio completo ocupa 204 GB; el checkpoint del DiT se publica en BF16 con un tamaño de 68,65 GB según la model card, por lo que la inferencia en BF16 requiere al menos esa cantidad de VRAM más la del text encoder y los módulos auxiliares.
- No se dispone de datos oficiales sobre cuantizaciones (GGUF, FP8, INT8) ni sobre su impacto en VRAM, latencia o calidad.
- GPU recomendadas: no disponible en la información proporcionada. Por el tamaño del checkpoint en BF16, un despliegue completo excede la VRAM de GPUs de consumo como la RTX 4090 (24 GB); se requerirían aceleradores de mayor memoria (A100 80 GB, H100 80 GB o configuraciones multi-GPU), aunque esta estimación no está confirmada por el autor.
- Opciones de despliegue: la model card cita `diffusers` y la librería `minimax-h3`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje, no a difusión).
- Latencia y throughput: no disponibles. El autor destaca que los 6 NFEs sin CFG mantienen "manejable" el coste computacional de generar 16 MP, pero no publica cifras.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada. La model card no incluye una tabla comparativa frente a otros modelos de generación o edición de imágenes.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MiniMax-H3-Image (aevionlabs) | no disponible | no disponible | minimax-h3-image-community-license-agreement | Hugging Face (204 GB) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo se declara soporte de inglés; el rendimiento con prompts en castellano u otros idiomas no está documentado.
- No se han publicado evaluaciones de sesgo, toxicidad o fidelidad factual de las imágenes generadas.
- Riesgo de alucinación visual: como todo modelo generativo, puede producir detalles incoherentes, texto ilegible en las imágenes o elementos que no respeten la instrucción, especialmente en escenas con muchos objetos o referencias múltiples.
- El repositorio es un finetune de terceros (aevionlabs) sobre MiniMaxAI/MiniMax-H3; no hay métricas publicadas que cuantifiquen su calidad frente al modelo base original.
- La licencia es `minimax-h3-image-community-license-agreement` (license: other), no una licencia de código abierto estándar; es imprescindible revisar el archivo LICENSE antes de cualquier uso comercial.
- El tamaño de 204 GB y el checkpoint en BF16 de 68,65 GB dificultan el despliegue en hardware de consumo y encarecen el autoalojamiento.
- El modelo no incluye capas de audio (a diferencia de la arquitectura H3 completa), por lo que no cubre tareas multimodales de audio.
- No hay información sobre cuantizaciones oficiales, lo que limita las opciones para reducir requisitos de memoria sin pérdida de calidad no verificada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aevionlabs/MiniMax-H3-Image
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Checkpoint oficial de imagen: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image
- Repositorio GitHub: https://github.com/MiniMax-AI/MiniMax-H3-Image
- ModelScope: https://modelscope.cn/models/MiniMax/MiniMax-H3-Image
- API global: https://platform.minimax.io/docs/guides/image-generation
- API China: https://platform.minimax.cn/docs/guides/image-generation
- Documentación API texto-a-imagen (EN): https://platform.minimax.io/docs/api-reference/image-generation-h3-generations
- Documentación API edición de imagen (EN): https://platform.minimax.io/docs/api-reference/image-generation-h3-edits
- Documentación API prompt expansion (EN): https://platform.minimax.io/docs/api-reference/image-generation-h3-context-ir
- WebApp global: https://hailuoai.video/
- WebApp China: https://hailuoai.com/
- App de escritorio global: https://agent.minimax.io/
- App de escritorio China: https://agent.minimax.cn/
- Sitio web de MiniMax: https://www.minimax.io
- Discord: https://discord.com/invite/dbMxutw7tP
