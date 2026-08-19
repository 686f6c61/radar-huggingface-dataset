# abakanai/Minimax_h3_hybrid

## Resumen

MiniMax H3 Hybrid NVFP4 es una optimización comunitaria del modelo de difusión MiniMax H3 Ref2VA Pruned, diseñada para ejecutar generación de vídeo a partir de imagen en GPUs NVIDIA Blackwell con 16 GB de VRAM. El autor, abakanai, publica dos checkpoints de inferencia con cuantización mixta NVFP4 e INT8 ConvRot, pensados para ComfyUI. El objetivo es reducir el peso del modelo (de 19,53 GiB a 14-16 GiB) manteniendo la calidad visual y el audio nativo, permitiendo su uso en hardware de consumo como la RTX 5070 Ti.

La relevancia radica en que el modelo original supera ampliamente la memoria de las GPUs consumer, y esta versión híbrida demuestra que es posible ejecutarlo localmente con tiempos de render aceptables (unos 9-10 minutos para clips de 5,17 segundos a 1376×768). No es un lanzamiento oficial de MiniMax ni de ComfyUI, sino un experimento reproducible con documentación detallada de configuración y resultados cualitativos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión para generación de vídeo (image-to-video) basado en MiniMax-H3 Ref2VA Pruned; detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es modelo de texto; genera secuencias de vídeo de 124 frames a 24 fps) |
| Tipos de cuantizacion | NVFP4 (entrada de FFN o QKV+FFN) e INT8 ConvRot (proyecciones de salida) |
| Idiomas soportados | en (inglés) |
| Licencia | minimax-h3-community-license-agreement |
| Formato de pesos | safetensors (single-file diffusion para ComfyUI) |

## Arquitectura y entrenamiento

El modelo base es MiniMax-H3, un modelo de difusión para vídeo con generación de audio nativa, distribuido por MiniMaxAI y Comfy-Org. La versión de abakanai no modifica la arquitectura original, sino que aplica una cuantización mixta a los pesos ya podados (Ref2VA Pruned). La configuración híbrida mantiene las proyecciones de salida de atención y FFN en INT8 ConvRot para preservar la ruta SwiGLU fusionada, mientras que las proyecciones de entrada (QKV y/o FFN) se convierten a NVFP4, un formato nativo de Blackwell que reduce el uso de memoria sin penalizar significativamente la velocidad. No se documentan datos de entrenamiento adicionales ni ajuste fino; es una optimización de inferencia exclusivamente.

## Capacidades

- Generación de vídeo a partir de una imagen de referencia (image-to-video) con movimiento natural de personajes y fondo.
- Generación de audio sincronizado de forma nativa (stereo AAC a 32 kHz) integrado en el mismo pipeline de difusión.
- Dos variantes de cuantización: conservadora (16,38 GiB, prioriza fidelidad) y rápida (14,03 GiB, prioriza velocidad y menor uso de VRAM).
- Compatibilidad con ComfyUI mediante checkpoints single-file y DynamicVRAM.
- Soporte de resoluciones hasta 1376×768 (probado) con 124 frames a 24 fps.
- Control de generación mediante prompt, semilla, sampler y scheduler estándar de ComfyUI.

## Casos de uso

- Creación de clips cortos animados para redes sociales: el modelo permite convertir una imagen fija en un vídeo de 5 segundos con audio, ideal para contenido promocional o narrativo sin necesidad de equipos de producción.
- Prototipado de storyboards animados: los equipos creativos pueden generar rápidamente variaciones de movimiento a partir de ilustraciones o renders, facilitando la previsualización de escenas.
- Animación de personajes para juegos independientes: se puede usar para generar ciclos de animación cortos (parpadeos, gestos) a partir de un único arte conceptual, reduciendo costes de animación manual.
- Generación de material de referencia para VFX: los artistas pueden explorar movimientos de cámara y composición antes de pasar a herramientas profesionales, gracias a la resolución 1376×768 y el audio nativo.
- Automatización de contenido audiovisual en flujos ComfyUI: al integrarse como checkpoint, puede combinarse con otros nodos para pipelines de generación masiva de vídeos con parámetros variables.
- Evaluación de cuantización en hardware consumer: investigadores y desarrolladores pueden estudiar el impacto de NVFP4 frente a INT8 en modelos de difusión de vídeo, usando este repositorio como referencia reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, etc.) porque se trata de un modelo de generación de vídeo, no de texto. Los únicos datos de rendimiento disponibles son tiempos de render observados en una RTX 5070 Ti 16 GB:

| Checkpoint | Resolución | Duración del vídeo | Tiempo total de render |
|---|---|---|---|
| Fast 14,03 GiB | 1376 × 768 | 5,17 s | 568,67 s (9:28) |
| Conservative 16,38 GiB | 1376 × 768 | 5,17 s | 598,66 s (9:58) |

Ambos usan 124 frames, 24 fps, sampler `res_multistep`, scheduler `simple`, 20 pasos. La variante rápida fue aproximadamente un 5% más rápida en ejecuciones secuenciales, aunque el autor advierte que no es una comparación controlada. También se realizó una comparación cualitativa A/B a 864×480 con semilla emparejada, donde la variante conservadora mantuvo ligeramente mejor la forma de los dedos, pero ambas preservaron la cara y las gafas del personaje.

## Requisitos de hardware

- GPU probada: NVIDIA GeForce RTX 5070 Ti 16 GB (Blackwell, SM 12.0). Se requiere arquitectura Blackwell para aprovechar NVFP4.
- VRAM estimada: 14,03 GiB (variante rápida) o 16,38 GiB (variante conservadora) para el checkpoint; el uso real depende de DynamicVRAM de ComfyUI.
- Otras GPUs: no se documentan, pero cualquier GPU Blackwell con al menos 16 GB de VRAM debería ser compatible.
- Software: PyTorch 2.10.0+cu130, CUDA 13.0, comfy-kitchen 0.2.26, ComfyUI con soporte DynamicVRAM.
- Opciones de despliegue: exclusivamente ComfyUI (single-file diffusion); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia: no disponible; los tiempos de render de referencia son de ~9-10 minutos para 124 frames a 1376×768.

## Comparativa con modelos similares

No se dispone de comparaciones directas con otros modelos de generación de vídeo en la información proporcionada. El modelo base MiniMax-H3 es el punto de referencia, pero no se ofrecen datos de alternativas como Stable Video Diffusion, Runway Gen-3 o Kling. Se recomienda consultar el repositorio original de MiniMax-H3 para conocer el rendimiento sin cuantizar.

## Limitaciones y advertencias

- Optimización comunitaria no oficial: no está respaldada por MiniMax ni ComfyUI, y puede contener errores no documentados.
- Solo inferencia: los checkpoints no incluyen text encoder ni VAE, y no son adecuados para entrenamiento o fine-tuning.
- Requiere hardware Blackwell: NVFP4 no es compatible con GPUs Ampere o anteriores, limitando su uso a RTX 50 series o equivalentes profesionales.
- Evaluación cualitativa limitada: la calidad se validó con un único sample visual (un personaje anime), no con métricas perceptuales estadísticamente significativas.
- Riesgo de alucinación visual: como todo modelo de difusión, puede generar inconsistencias en manos, fondos o movimientos no presentes en la imagen de entrada.
- Licencia restrictiva: la licencia comunitaria de MiniMax-H3 puede imponer condiciones sobre uso comercial y redistribución; es obligatorio revisar el acuerdo completo antes de usar el modelo en producción.
- Sin soporte multilingüe: los prompts y la documentación están en inglés; el rendimiento en otros idiomas no está probado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/abakanai/Minimax_h3_hybrid
- Licencia del modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Modelo base MiniMaxAI/MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Modelo base Comfy-Org/MiniMax-H3: https://huggingface.co/Comfy-Org/MiniMax-H3
