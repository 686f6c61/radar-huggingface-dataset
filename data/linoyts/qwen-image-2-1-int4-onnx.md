# linoyts/Qwen-Image-2.1-int4-ONNX

## Resumen

Qwen-Image-2.1-int4-ONNX es una exportación optimizada para navegador del modelo de generación y edición de imágenes Qwen-Image-2.1, desarrollado originalmente por el equipo Qwen de Alibaba. La versión publicada por linoyts convierte los pesos originales a formato ONNX, los cuantiza a int4 y fusiona una LoRA DMD2 de dos pasos, con el objetivo de ejecutar el pipeline completo de texto-a-imagen sobre WebGPU mediante onnxruntime-web sin necesidad de servidores dedicados.

El modelo resuelve el problema de desplegar un generador de imágenes de gran tamaño en el cliente: el transformador DiT y el codificador de texto Qwen3-VL-8B se dividen en grafos independientes de menos de 2 GB cada uno, lo que permite cargarlos como sesiones separadas en el navegador. La descarga inicial para texto-a-imagen es de aproximadamente 7,4 GB, y la edición de imágenes añade un codificador visual fp16 de 1,2 GB.

Es relevante porque demuestra la viabilidad técnica de inferencia de difusión multimodal de alta calidad en hardware de consumo a través de WebGPU, con requisitos de aproximadamente 8 GB de memoria de GPU y soporte de `shader-f16`. La licencia Qwen Research limita el uso a fines no comerciales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DiT (diffusion transformer) con codificador de texto Qwen3-VL-8B, VAE TAEQI2.1 y scheduler FlowMatch Euler |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int4 (MatMulNBits, bloque 128, asimétrico) en capas lineales; fp16 en norms, embedders, modulación, cabeza de salida y torre visual |
| Idiomas soportados | no disponible |
| Licencia | Qwen Research License (no comercial); VAE bajo MIT (madebyollin/taeqi2_1) |
| Formato de pesos | ONNX (grafos separados por componente) |

## Arquitectura y entrenamiento

La arquitectura combina un codificador de texto Qwen3-VL-8B (36 capas, embeddings de 4096 dimensiones) con un transformador de difusión de 32 bloques que opera sobre latents de 64 canales. El pipeline usa un scheduler FlowMatch Euler con dos pasos de denoising (σ = 1,0 y σ = 0,5) y sin classifier-free guidance, gracias a la LoRA DMD2 de dos pasos fusionada en los pesos. La decodificación se realiza con el VAE ligero TAEQI2.1, que produce salida RGBA en el rango [0, 1].

La exportación mantiene la ruta de caché KV del pipeline de diffusers: los tokens de texto se modulan desde t=0 con `causal_condition`, de modo que sus claves y valores permanecen idénticos en cada paso y solo se procesan los tokens de imagen en cada iteración. Para edición de imágenes, el codificador visual de Qwen3-VL (con mergers DeepStack) sustituye los embeddings de `<|image_pad|>` y las tres características DeepStack se suman tras las capas 0, 1 y 2, usando mRoPE entrelazado. No se dispone de información sobre el número de tokens de entrenamiento ni la composición del dataset original.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) en dos pasos de denoising.
- Edición de imágenes guiada por instrucciones en lenguaje natural, con el codificador visual adicional.
- Ejecución en navegador mediante WebGPU y onnxruntime-web, sin backend dedicado.
- Soporte de plantilla de chat para el prompt, con gestión de tokens especiales de visión.
- Caché KV de texto reutilizada entre pasos para reducir cómputo.
- No se documenta soporte de tool calling, agentes ni modo thinking.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Generación de imágenes en el navegador para aplicaciones creativas: el modelo permite crear ilustraciones directamente en el cliente con Chrome o Edge, sin enviar datos a un servidor, usando aproximadamente 7,4 GB de descarga inicial.
- Edición fotográfica interactiva en web: la ruta de edición añade el codificador visual de 1,2 GB y permite modificar imágenes con instrucciones de texto manteniendo el aspecto original mediante el redimensionado a múltiplos de 32.
- Prototipado rápido de pipelines de difusión: los grafos ONNX separados por componente (text_proj, step_embed, 32 bloques, head) facilitan la inspección y sustitución de etapas individuales.
- Demostraciones educativas de cuantización int4: la model card documenta errores relativos verificables (5e-7 en un bloque fp32, 0,155 en el DiT completo) que sirven para estudiar el impacto de la cuantización.
- Aplicaciones de privacidad por diseño: al ejecutarse localmente en WebGPU, los prompts e imágenes no salen del dispositivo, adecuado para entornos con requisitos de confidencialidad.
- Investigación en generación few-step: la integración de DMD2 con dos pasos y sin CFG permite experimentar con métodos de destilación de difusión en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, FID, CLIP score) en la información disponible. La model card incluye verificaciones de fidelidad numérica frente a PyTorch:

| Comprobación | Resultado |
|---|---|
| Un bloque DiT, exportación fp32 | error relativo 5e-7 |
| DiT completo, 2 pasos, mismos pesos int4 y ruido, vs PyTorch fp32 | error relativo de latentes 0,155 (diffusers bf16 vs fp32: 0,187) |
| Embeddings del codificador de texto vs pipeline bf16 | similitud coseno 0,955 a 0,967 (prompts de edición con imagen: 0,90 a 0,91) |
| Edición, DiT sobre embeddings del pipeline, vs diffusers bf16 con TAEQI2.1 | error relativo de latentes 0,12 a 0,14 |

## Requisitos de hardware

- VRAM/memoria de GPU estimada: aproximadamente 8 GB para ejecución en navegador con WebGPU.
- GPU recomendadas: no se especifican modelos concretos; se requiere una GPU con soporte de `shader-f16`.
- Compatibilidad con GPU de consumo: sí, siempre que cumplan el requisito de memoria y `shader-f16`; el navegador debe ser Chrome o Edge de escritorio con WebGPU habilitado.
- Opciones de despliegue: onnxruntime-web sobre WebGPU; los grafos ONNX también pueden ejecutarse con ONNX Runtime en CPU (usado para las verificaciones).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Ejecución en navegador |
|---|---|---|---|---|---|
| Qwen-Image-2.1-int4-ONNX (este) | no disponible | no disponible | ONNX int4 | Qwen Research (no comercial) | Sí, WebGPU |
| Qwen-Image-2.1 (original) | no disponible | no disponible | safetensors | Qwen Research | No documentado |
| Qwen-Image-2.1-DMD2-2steps | no disponible | no disponible | LoRA | no disponible | No documentado |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Licencia Qwen Research de carácter no comercial: el uso en producción comercial requiere autorización expresa según los términos de la licencia.
- Requiere navegador con WebGPU (Chrome o Edge de escritorio) y GPU con `shader-f16`; no funciona en la mayoría de navegadores móviles ni en Firefox de forma generalizada.
- La cuantización int4 introduce un error relativo de latentes de 0,155 frente a fp32, superior al 0,187 de la comparación bf16 vs fp32, pero no despreciable.
- La torre visual se mantiene en fp16 porque la cuantización int4 desplaza su salida un 58 % (int8 un 9 %, fp16 un 1 %), lo que limita la reducción de tamaño en la ruta de edición.
- Descarga inicial elevada (7,4 GB para texto-a-imagen, más 1,2 GB para edición) que puede ser prohibitiva en conexiones lentas.
- No se documentan sesgos, riesgos de alucinación visual ni cobertura idiomática del modelo.
- La edición requiere redimensionar la imagen a múltiplos de 32 y al área de salida, lo que puede afectar a la fidelidad en imágenes de proporciones extremas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/linoyts/Qwen-Image-2.1-int4-ONNX
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- LoRA DMD2 de dos pasos: https://huggingface.co/linoyts/Qwen-Image-2.1-DMD2-2steps
- Demo WebGPU: https://huggingface.co/spaces/linoyts/Qwen-Image-2.1-WebGPU
- VAE TAEQI2.1: https://huggingface.co/madebyollin/taeqi2_1
