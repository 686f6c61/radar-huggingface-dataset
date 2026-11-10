# MiniMaxAI/MiniMax-H3-Image

## Resumen

MiniMax-H3-Image es un modelo de difusión para generación y edición de imágenes desarrollado por MiniMax, presentado como parte de la familia MiniMax H3. Unifica en un único checkpoint dos tareas que habitualmente requieren modelos separados: la generación texto-a-imagen (text-to-image) y la edición de una o varias imágenes de referencia (image-to-image / image editing). El modelo deriva del modelo base MiniMax-H3, del que reutiliza el codificador de texto sin modificaciones y cuya arquitectura DiT adopta eliminando las capas de audio.

Su propuesta diferencial es la generación directa de imágenes de aproximadamente 16 megapíxeles en cualquier relación de aspecto, desde 4096x4096 (1:1) hasta 6272x2688 (21:9), sin necesidad de upscaler posterior. Para hacer viable ese coste computacional, el checkpoint está destilado a 6 pasos de muestreo (6 NFEs) y opera sin classifier-free guidance, lo que reduce el número de evaluaciones del modelo por imagen.

El modelo se publica con pesos abiertos bajo una licencia comunitaria propia (minimax-h3-image-community-license-agreement) y está pensado para creadores y desarrolladores que necesitan control fino sobre el resultado mediante instrucciones e imágenes de referencia, con soporte de hasta 16 imágenes de referencia en tareas de edición.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) con arquitectura H3, sin capas de audio; codificador de texto MiniMax-H3 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (DiT) segun model card; otros tipos no disponibles |
| Idiomas soportados | en |
| Licencia | minimax-h3-image-community-license-agreement (other) |
| Formato de pesos | safetensors; libreria minimax-h3; compatible con diffusers |

## Arquitectura y entrenamiento

MiniMax-H3-Image es un modelo de difusión basado en un Diffusion Transformer (DiT) que hereda la arquitectura H3 del modelo base MiniMax-H3, eliminando las capas de audio de este. El codificador de texto es el de MiniMax-H3, utilizado sin cambios. El checkpoint unifica generación texto-a-imagen y edición de imágenes en un solo modelo, de modo que la misma red procesa tanto prompts de texto como una o varias imágenes de referencia junto con instrucciones de edición.

El checkpoint está destilado a 6 pasos de muestreo (6 NFEs) y funciona sin classifier-free guidance, lo que reduce el coste de inferencia por imagen. El modelo genera imágenes de unos 16 megapíxeles de forma nativa en todas las relaciones de aspecto soportadas, sin upscaler. La model card no detalla el número de parámetros, el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO; esos datos figuran como no disponibles.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) con resolución nativa de aproximadamente 16 megapíxeles.
- Edición de imágenes (image-to-image / image editing) sobre una o varias imágenes de referencia, con soporte de hasta 16 imágenes de referencia.
- Generación directa en múltiples relaciones de aspecto, desde 4096x4096 (1:1) hasta 6272x2688 (21:9), sin upscaler.
- Seguimiento de instrucciones (instruction following) destacado por el autor como el más fuerte entre modelos de código abierto.
- Inferencia rápida gracias a la destilación a 6 pasos de muestreo y a la ausencia de classifier-free guidance.
- Prompt expansion disponible a través de la API (context-IR), no descrito como capacidad del checkpoint local.
- Soporte de tool calling / function calling: no disponible.
- Capacidades de agente o razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés segun la model card.
- Capacidades de visión, audio o thinking mode: no disponibles en este checkpoint.

## Casos de uso

- Generación de material gráfico de alta resolución para impresión: el modelo produce imágenes de 16 MP nativas en relaciones de aspecto amplias (hasta 21:9), adecuadas para carteles, vallas o portadas sin reescalado posterior.
- Edición de producto en catálogos de comercio electrónico: partiendo de una o varias fotos de referencia, se pueden aplicar instrucciones de cambio de fondo, iluminación o contexto manteniendo el sujeto, gracias al soporte de hasta 16 imágenes de referencia.
- Creación de concept art y previsualización en pipelines de producción audiovisual: la generación en 6 pasos y sin CFG reduce el tiempo por iteración, lo que facilita explorar variaciones de personajes, escenas y atmósferas descritas en texto.
- Ilustración editorial y assets para videojuegos: la resolución nativa de 16 MP permite obtener detalle fino en texturas y entornos, útil para fondos de escena o arte promocional.
- Automatización de variantes creativas en marketing: integrado vía API (platform.minimax.io), el modelo puede generar múltiples versiones de una misma campaña a partir de un prompt base y referencias visuales de marca.
- Edición por instrucciones en herramientas para no diseñadores: un usuario sin conocimientos técnicos puede modificar una imagen existente describiendo el cambio en lenguaje natural, sin máscaras ni control manual.
- Prototipado rápido de interfaces y mockups: generación de composiciones visuales de alta resolución para validar dirección de arte antes de producir los assets definitivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Tamaño del repositorio en Hugging Face: 204,0 GB; el checkpoint DiT en BF16 ocupa 68,65 GB segun la model card.
- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del checkpoint en BF16, la carga completa del DiT requiere del orden de decenas de GB de VRAM, y no cabe en GPUs de consumo de 24 GB sin cuantización o técnicas de offload.
- GPU recomendadas: no especificadas por el autor; por el tamaño del checkpoint se orienta a GPUs de centro de datos (A100, H100) o configuraciones multi-GPU.
- Compatibilidad con GPU de consumo: no disponible; no se documenta una variante cuantizada que quepa en RTX 4090 u otras GPUs de consumo.
- Opciones de despliegue: libreria minimax-h3 y diffusers; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a LLM, no a difusión).
- Latencia y throughput: no disponibles; la destilación a 6 NFEs y la ausencia de CFG reducen el número de evaluaciones por imagen, pero no se publican cifras de tiempo.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones comparables de modelos alternativos en la informacion proporcionada, por lo que la comparativa cuantitativa figura como no disponible. A modo de referencia cualitativa, el propio autor sitúa a MiniMax-H3-Image como el modelo de código abierto con mayor instruction following y con salida nativa de 16 MP, frente a salidas habituales de 1-4 MP en otros modelos de difusión.

| Modelo | Parametros | Contexto | Salida maxima | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-H3-Image | no disponible | no disponible | ~16 MP (hasta 6272x2688) | Comunitaria propia | Pesos abiertos en HF + API |
| Alternativas de difusion comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Idiomas: la model card solo declara soporte de inglés; los prompts en castellano u otros idiomas no están garantizados.
- Licencia: se rige por la minimax-h3-image-community-license-agreement, una licencia "other" con términos propios; es imprescindible revisar el archivo LICENSE antes de cualquier uso comercial.
- Requisitos de hardware: el checkpoint DiT en BF16 ocupa 68,65 GB y el repositorio completo 204,0 GB, lo que limita el despliegue local a infraestructura de gama alta.
- Alucinación visual: como todo modelo generativo, puede producir detalles inconsistentes, texto ilegible en la imagen o elementos anatómicos incorrectos; no se documentan tasas de error.
- Sesgos: no se documentan sesgos conocidos en la información disponible; cabe esperar los sesgos presentes en los datos de entrenamiento, no detallados.
- Sin datos de entrenamiento: no se especifican volumen de tokens, composición del dataset ni etapas de alineación, lo que dificulta evaluar riesgos de contaminación o sesgo.
- Contexto y límites de referencia: se soportan hasta 16 imágenes de referencia en edición, pero no se detallan límites de longitud de prompt ni resolución de entrada de las referencias.
- Producción: no se publican latencias, throughput ni guías de despliegue escalable; la integración vía API de MiniMax puede ser la vía más predecible para entornos productivos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image
- Modelo base MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image/blob/main/LICENSE
- Repositorio GitHub: https://github.com/MiniMax-AI/MiniMax-H3
- API global (text-to-image): https://platform.minimax.io/docs/api-reference/image-generation-h3-generations
- API global (image editing): https://platform.minimax.io/docs/api-reference/image-generation-h3-edits
- API global (prompt expansion): https://platform.minimax.io/docs/api-reference/image-generation-h3-context-ir
- Documentación API CN: https://platform.minimax.cn/docs/api-reference/image-generation-h3-generations
- WebApp Hailuo AI (global): https://hailuoai.video/
- WebApp Hailuo AI (CN): https://hailuoai.com/
- App de escritorio (global): https://agent.minimax.io/
- App de escritorio (CN): https://agent.minimax.cn
- Web MiniMax: https://www.minimax.io
- ModelScope: https://modelscope.cn/organization/minimax
- Discord: https://discord.com/invite/dbMxutw7tP
