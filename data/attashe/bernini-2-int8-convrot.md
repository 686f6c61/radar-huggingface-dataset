# attashe/Bernini-2-INT8-ConvRot

## Resumen
El modelo `attashe/Bernini-2-INT8-ConvRot` es una conversión cuantizada del sistema de generación de vídeo `ByteDance/Bernini-Diffusers-v2`, realizada por el usuario `attashe`. Se trata de un pipeline de difusión para texto a imagen, texto a vídeo y edición de vídeo, basado en dos expertos Wan (ruido alto y ruido bajo) cuantizados en INT8 W8A8 con regular-Hadamard ConvRot, acompañados de un planificador Qwen2.5-VL afinado, un connector, un decoder VIT, un encoder UMT5 y un VAE. El modelo resuelve la necesidad de ejecutar un sistema de generación de vídeo de gran tamaño en hardware de consumo: gracias a la cuantización INT8 y a la aceleración mediante `comfy_kitchen`, es posible ejecutarlo en una GPU RTX 5090 de 32 GB, con aproximadamente 57,58 GiB de descarga. Es una versión comunitaria, no oficial, que incorpora el planificador y renderer v2 completos.

## Especificaciones tecnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline de difusión con dos expertos Wan (high/low noise), planificador Qwen2.5-VL, connector, decoder VIT, encoder UMT5 y VAE |
| Parámetros totales | no disponible |
| Parámetros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (no aplica a un modelo de vídeo) |
| Tipos de cuantización | INT8 W8A8 con regular-Hadamard ConvRot (grupo 256) en expertos Wan; BF16 en planificador, connector, decoder VIT, encoder UMT5 y adaptadores; FP32 en VAE |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (un único archivo por componente, sin fragmentar) |
| Tamaño de descarga | ~57,58 GiB (56,44 GiB sin adaptadores opcionales) |
| Tamaño del repositorio | 121,9 GB |

## Arquitectura y entrenamiento
El sistema combina un planificador de lenguaje multimodal (Qwen2.5-VL) que interpreta el prompt y genera las condiciones de movimiento, dos expertos de difusión Wan que producen el ruido de alta y baja frecuencia, un connector que une las representaciones, un decoder VIT para la salida visual, un encoder UMT5 congelado para el texto y un VAE para codificar/decodificar los fotogramas. Todos los 800 bloques lineales de los expertos Wan están cuantizados en INT8 W8A8 con escalas FP32 por fila y ConvRot con tamaño de grupo 256; las normas, embeddings, sesgos y cabezas de salida se mantienen en BF16. Los datos de entrenamiento no se han publicado en la información disponible; al tratarse de una conversión cuantizada de un modelo ya afinado, no se ha realizado un nuevo entrenamiento ni un ajuste fino, salvo la adaptación de los pesos a la precisión INT8. No se menciona RLHF ni DPO.

## Capacidades
- Generación de imágenes a partir de texto (t2i) y edición de imágenes (i2i), con un preset de 512x512 y 50 pasos de denoising.
- Generación de vídeo a partir de texto (t2v) con el preset oficial de 81 frames a 480x848 y 50 pasos.
- Edición de vídeo (v2v) que preserva la relación de aspecto del vídeo fuente, así como las familias mv2v, r2v y rv2v.
- Soporte de generación en 8 pasos mediante adaptadores LightX2V (rank-64), que aceleran la inferencia, aunque es una transferencia experimental.
- Inferencia optimizada para GPUs de consumo gracias a la cuantización INT8 y al backend `comfy_kitchen`.
- No se documenta soporte de tool calling, function calling ni capacidades de agente; es un modelo generativo visual.

## Casos de uso
- Prototipado de vídeos para publicidad: se puede generar un clip de 81 frames a partir de un texto descriptivo con el preset t2v, lo que permite crear maquetas rápidas sin necesidad de rodajes.
- Edición de escenas en postproducción: usando la tarea v2v, se puede cambiar el entorno de un vídeo existente (por ejemplo, convertir un paisaje urbano en un paisaje nevado) manteniendo la relación de aspecto original.
- Generación de concept art: el modo t2i permite producir imágenes fotorrealistas a 512x512 para explorar ideas visuales antes de la producción final.
- Contenido para redes sociales: con una RTX 5090, un creador puede generar vídeos cortos con prompts descriptivos de forma local, sin depender de servicios en la nube.
- Investigación en modelos de difusión: los adaptadores LightX2V permiten experimentar con la generación en 8 pasos y comparar la calidad con el preset de 50 pasos, gracias a la opción `--metrics` que registra tiempos y memoria.
- Adaptación a estilos específicos: al incluir adaptadores opcionales y soportar LoRAs, se pueden ajustar los resultados para un estilo visual concreto sin reentrenar el modelo base.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, ni comparativas de rendimiento con otros modelos. El único dato de rendimiento disponible es que la inferencia se probó en una RTX 5090, pero no se proporcionan cifras de latencia ni de throughput.

## Requisitos de hardware
- VRAM estimada: no se especifica una cifra exacta. La prueba documentada se realizó en una GPU RTX 5090 con 32 GB de VRAM, y se recomiendan 64 GiB de RAM del sistema.
- GPU recomendadas: RTX 5090 (32 GB) según el entorno de prueba. No se confirma si es posible ejecutarlo en GPUs de menor VRAM.
- Compatibilidad con GPU de consumo: sí, al menos en la RTX 5090; se desconoce si cabe en GPUs de 24 GB.
- Opciones de despliegue: requiere el código personalizado de Bernini con `scripts/run_full_bernini_local.py` y la opción `--int8_backend kitchen`. No se puede cargar con `DiffusionPipeline.from_pretrained()`. No se mencionan vLLM, llama.cpp, Ollama ni TGI como opciones de despliegue.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
| Modelo | Cuantización | Tamaño de descarga | Licencia | Disponibilidad |
|---|---|---|---|---|
| attashe/Bernini-2-INT8-ConvRot | INT8 W8A8 + ConvRot | ~57,58 GiB | Apache-2.0 | HuggingFace; requiere código personalizado pendiente de publicación |
| ByteDance/Bernini-Diffusers-v2 | no disponible | no disponible | Apache-2.0 | HuggingFace (modelo base) |
| attashe/Bernini-Wan2.2-fp8-scaled | FP8 | no disponible | Apache-2.0 | HuggingFace |

La comparativa se limita a la cuantización y la disponibilidad, ya que no se dispone de datos de parámetros, contexto ni rendimiento para los modelos comparados.

## Limitaciones y advertencias
- No es una publicación oficial de ByteDance; es una conversión comunitaria, por lo que el soporte y la fiabilidad dependen del autor.
- El código de inferencia necesario para cargar estos pesos está pendiente de publicación en GitHub. El checkout sin modificar del repositorio upstream no puede cargar el modelo, por lo que no se puede utilizar de inmediato sin ese código.
- El soporte de generación en 8 pasos con adaptadores LightX2V es experimental y no corresponde a un checkpoint entrenado específicamente para 8 pasos; la calidad puede variar.
- No se han publicado benchmarks ni datos de rendimiento comparativo, lo que dificulta la evaluación frente a otras alternativas.
- Los idiomas soportados no están documentados. Es probable que el planificador Qwen2.5-VL funcione con varios idiomas, pero no hay confirmación oficial.
- El tamaño de descarga (57,58 GiB) y el requisito de 64 GiB de RAM pueden ser una barrera para muchos usuarios.
- La licencia Apache-2.0 permite uso comercial, pero el código de inferencia pendiente de publicación puede tener condiciones adicionales; se debe revisar antes de usar en producción.

## Enlaces
- Repositorio en HuggingFace: https://huggingface.co/attashe/Bernini-2-INT8-ConvRot
- Modelo base: https://huggingface.co/ByteDance/Bernini-Diffusers-v2
- Adaptadores LightX2V: https://huggingface.co/lightx2v/Wan2.2-Distill-Loras (revisión `570044187a5219776ef30a5c60c6f76428a3a10a`)
- Código de inferencia: pendiente de publicación; se indicará cuando esté disponible.
