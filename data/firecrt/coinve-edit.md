# FireCRT/CoinVE-Edit

## Resumen

CoinVE-Edit es un modelo de edición de video guiado por instrucciones, desarrollado por FireCRT, que permite aplicar entre dos y cinco instrucciones de edición de forma simultánea en un solo paso de inferencia. Está entrenado sobre el dataset CoinVE-200K y se basa en una arquitectura híbrida que combina el transformer de difusión de video Wan2.1-T2V-14B como columna vertebral y el codificador multimodal Qwen3-VL-8B-Instruct para comprender las instrucciones y el contexto visual. Su principal novedad es la inyección de máscaras por región mediante un módulo de atención residual, lo que garantiza que cada edición se confine al área espacial correcta del video.

El modelo está pensado para tareas de edición composicional de video en las que se combinan operaciones como reemplazar, añadir, eliminar objetos o cambiar el fondo, todo ello en una única pasada. Al estar construido sobre Wan2.1-T2V-14B y Qwen3-VL-8B, ofrece una calidad de generación de video alta y un razonamiento multimodal robusto, pero requiere descargar ambos modelos base por separado, además del checkpoint de CoinVE-Edit (2,8 GB). Su licencia Apache 2.0 permite uso comercial sin restricciones adicionales, lo que lo hace atractivo para pipelines de producción en edición de video.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Video DiT (Wan2.1-T2V-14B) + MLLM encoder (Qwen3-VL-8B-Instruct) + mask head + residual attention |
| Parametros totales | no disponible (base: Wan2.1-T2V-14B con 14B + Qwen3-VL-8B con 8B; LoRA rank 128 y 256) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint compuesto de 2,8 GB) |

## Arquitectura y entrenamiento

CoinVE-Edit extiende el DiT de video Wan2.1-T2V-14B con un módulo de atención residual y una cabeza de máscaras ligera. El codificador multimodal Qwen3-VL-8B-Instruct procesa cada instrucción junto con el video fuente, generando tokens visuales que alimentan la cabeza de máscaras, la cual predice una máscara espacial por instrucción. El módulo de atención residual inyecta esa guía de máscara en las capas de atención del DiT, de modo que cada edición se confina a su región designada.

El entrenamiento se realizó sobre el dataset CoinVE-200K, que contiene más de 200.000 pares de video original y video editado con filtrado riguroso de calidad. El ajuste se hizo mediante LoRA: rango 128 para el DiT de video y rango 256 para el MLLM. El checkpoint publicado incluye los pesos LoRA de ambos modelos, las embeddings de consulta de imagen/video aprendidas, el conector, el codificador de condiciones VAE y los pesos de la cabeza de máscaras. No se menciona el uso de RLHF o DPO; el entrenamiento se centra en supervisión directa con los pares de edición.

## Capacidades

- Edición composicional de video: procesa entre 2 y 5 instrucciones en un solo paso de inferencia, aplicando cada edición a su región designada.
- Operaciones composicionales: soporta reemplazar (replace), añadir (add), eliminar (remove) y cambiar fondo (background change), en cualquier combinación.
- Guía por máscara por región: la cabeza de máscaras predice una máscara espacial por instrucción, y el módulo de atención residual confina la edición a esa región.
- Comprensión multimodal: el codificador Qwen3-VL-8B-Instruct integra instrucciones de texto con el contenido visual del video de origen.
- Edición video-to-video: el modelo toma un video fuente y produce un video editado manteniendo la coherencia temporal y espacial.
- Soporte de múltiples instrucciones simultáneas: no es necesario ejecutar varias pasadas de edición; todas las ediciones se aplican en un único forward pass.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- **Postproducción de video profesional**: un editor puede enviar instrucciones como "reemplaza el coche rojo por un camión azul" y "cambia el fondo de la escena" en una sola pasada, reduciendo el tiempo de trabajo manual en herramientas de composición.
- **Generación de contenido para redes sociales**: creadores de contenido pueden modificar rápidamente un video base añadiendo objetos o cambiando el entorno sin necesidad de re-encuadrar manualmente, gracias a la edición por regiones.
- **Corrección de errores en video**: si un objeto no deseado aparece en un clip, se puede eliminar con una instrucción de "remove" dirigida a la región específica, evitando alterar el resto del video.
- **Prototipado de efectos visuales**: directores o editores pueden probar variantes de una escena (por ejemplo, "añade un letrero en el edificio" y "cambia el color del cielo") simultáneamente para comparar resultados antes de la edición final.
- **Generación de datos de entrenamiento sintéticos**: el modelo puede producir pares de video editado a partir de videos reales con instrucciones composicionales, útiles para ampliar datasets de modelos de visión por computador.
- **Automatización de pipelines de video**: en flujos de trabajo de producción, CoinVE-Edit puede integrarse en scripts para aplicar cambios específicos a lotes de videos, siempre que se disponga de una GPU con suficiente VRAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se incluyen métricas como MMLU, HumanEval, GSM8K ni evaluaciones específicas de edición de video en la model card ni en la documentación accesible.

## Requisitos de hardware

- **VRAM estimada**: no disponible en la información del modelo. Dado que la base es Wan2.1-T2V-14B (14B de parámetros) más Qwen3-VL-8B-Instruct (8B), se recomienda al menos 24 GB de VRAM para la inferencia en FP16, y más para cuantizaciones más bajas. La ausencia de datos oficiales impide dar una cifra exacta.
- **GPU recomendadas**: no se listan modelos específicos en la documentación. Se requiere CUDA 12.8 y FlashAttention-3, lo que apunta a GPUs de arquitectura Hopper (H100, H200) o Ada Lovelace (RTX 4090, RTX 6000 Ada). El uso de FlashAttention-3 es obligatorio para el DiT de video.
- **Si cabe en GPU de consumo**: probablemente no en GPUs con menos de 24 GB de VRAM, como la RTX 3080 o RTX 4060 Ti, dado el tamaño de los modelos base. Una RTX 4090 (24 GB) podría ser insuficiente si no se usan cuantizaciones o offloading.
- **Opciones de despliegue**: el flujo de inferencia se basa en scripts de Python (`infer_coinve_single.py`). No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI en la documentación disponible.
- **Latencia y throughput**: no se proporcionan datos de latencia ni de throughput en la información disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la misma categoría (edición composicional de video con múltiples instrucciones). Alternativas genéricas de edición de video guiada por instrucciones, como Make-A-Video, Runway Gen-2 o Pika, no comparten la arquitectura ni el enfoque de edición composicional multi-instrucción de CoinVE-Edit. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- **Dependencia de modelos base**: es necesario descargar Wan2.1-T2V-14B y Qwen3-VL-8B-Instruct por separado antes de usar CoinVE-2, lo que aumenta el coste de almacenamiento y el tiempo de configuración.
- **Requisitos de hardware estrictos**: la combinación de dos modelos grandes (14B + 8B) exige una GPU con al menos 24 GB de VRAM, y el uso de FlashAttention-3 limita el soporte a GPUs con arquitectura reciente (Hopper/Ada). Esto restringe su despliegue en entornos con hardware modesto.
- **Sesgos y alucinaciones**: no se documentan sesgos específicos, pero al ser un modelo de difusión de video, puede generar artefactos visuales en regiones editadas o alucinar contenido cuando las instrucciones son ambiguas.
- **Limitaciones de contexto**: no se especifica la longitud máxima de video o de secuencia que puede procesar; la ventana de contexto del MLLM Qwen3-VL-8B puede ser limitante para videos largos.
- **Idiomas**: no se indica qué idiomas soporta el codificador de instrucciones; si Qwen3-VL-8B-Instruct está optimizado para inglés y chino, las instrucciones en otros idiomas podrían degradar el rendimiento.
- **Uso en producción**: al no publicar benchmarks ni datos de latencia, no se puede garantizar un rendimiento estable en entornos de producción sin una evaluación previa propia.
- **Riesgo de sesgo en el dataset**: el dataset CoinVE-200K se describe como filtrado rigurosamente, pero no se detalla la diversidad de contenido, por lo que puede haber sesgos en escenas u objetos representados.

## Enlaces

- [HuggingFace: FireCRT/CoinVE-Edit](https://huggingface.co/FireCRT/CoinVE-Edit)
- [Dataset: FireCRT/CoinVE-200K](https://huggingface.co/datasets/FireCRT/CoinVE-200K)
- [GitHub: CoinVE-Edit](https://github.com/coinve200k/CoinVE-200K/tree/main/CoinVE-Edit)
- [arXiv: 2608.17566](https://arxiv.org/abs/2608.17566)
- [Wan-AI/Wan2.1-T2V-14B](https://huggingface.co/Wan-AI/Wan2.1-T2V-14B/tree/main)
- [Qwen/Qwen3-VL-8B-Instruct](https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct)
