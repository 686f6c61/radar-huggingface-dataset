# neuralnetworker/agate-preview-003

## Resumen

Agate Preview 003 es un modelo de generación de imágenes texto-a-imagen desarrollado por LogoLabs, una empresa dedicada a la generación de logotipos mediante IA. Se trata de la tercera iteración de una línea de modelos compactos (261M de parámetros) entrenados específicamente para la generación de glifos y símbolos, y que ahora añade soporte nativo para resolución 512 × 512 además de la resolución 256 × 256 original. El modelo se distribuye bajo licencia MIT tanto para código como para pesos, y está disponible en formato safetensors y ONNX.

La relevancia de este modelo radica en su enfoque de eficiencia extrema: con solo 261M de parámetros (192,1M del generador activo, 68,1M del codificador de texto y decodificador), consigue superar a Stable Diffusion 1.5 en el benchmark Qwen-Image-Bench (32,6 frente a 29,1) manteniendo un coste computacional muy reducido. El linaje completo del modelo se entrenó con 282,8 horas de GPU GH200, lo que lo sitúa en un régimen de recursos muy alejado de los modelos de difusión de gran escala.

El modelo emplea flow matching (rectified flow) como paradigma de generación, con un pipeline de prompts específicamente diseñado para manejar texto entrecomillado, conteo de objetos y negaciones. Es un modelo de investigación (research preview) orientado a inglés, con soporte para Python, ComfyUI y un demo WebGPU en el navegador.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Flow matching (rectified flow), transformer con planificador (thinker) y renderizador (renderer) separados |
| Parámetros totales | 261M con TAESD; 309,8M con SD-VAE |
| Parámetros activos | No aplica (no es MoE); 192,1M generador activo + 68,1M codificador de texto + decodificador |
| Longitud de contexto | No disponible (modelo texto-a-imagen, no aplica contexto de tokens de texto de forma estándar) |
| Tipos de cuantización | No disponible (pesos en bf16; soporte de cuantización no especificado) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT (código y pesos) |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

Agate Preview 003 es un modelo de difusión basado en flow matching (rectified flow) con una arquitectura dividida en dos componentes: un "thinker" que planifica sobre una rejilla de 16 × 16 y un "renderer" que opera a 64 × 64 con coordenadas crudas y una señal explícita de resolución. Para soportar 512 px, el thinker lee el latente de 64 × 64 a través de su lectura original del subsample de stride 2 más una nueva rama convolucional; el sampler utiliza el desplazamiento de resolución de SD3 (shift 2) a 512 px. El modelo parte de la red de 256 px de Agate (paso 121.440) y se entrena 24.900 pasos adicionales a 256 y 512 px, habiendo visto 196,6M de imágenes en todo el linaje.

El entrenamiento incorpora un ajuste fino perceptual sobre la predicción de un paso del modelo: una pérdida de flujo ponderada por saliencia (mapas UNISAL, con peso w = 1 + 0,1·t·(q − 1), q relativo a la media de la imagen y limitado a 5×), más LPIPS (× 0,1) y características de parche DINOv2 (P-DINO, × 0,01) sobre la estimación decodificada por VAE, solo para t > 0,3, siguiendo la receta PixelGen. El pipeline de prompts normaliza el texto (minúsculas fuera de comillas, números canónicos), mueve las negaciones ("without X" / "no X") al prompt negativo, deletrea letra por letra el texto entre comillas dobles y marca el conteo de objetos. El coste computacional del linaje completo es de 282,8 horas GH200 (164,5 kWh, 4,94 kg CO₂e).

## Capacidades

- Generación de imágenes texto-a-imagen a 512 × 512 y 256 × 256 con prompts en inglés.
- Generación de texto dentro de la imagen (letreros, logotipos) con deletreo letra por letra del texto entrecomillado.
- Control de conteo de objetos mediante marcadores de conteo en el prompt.
- Manejo de negaciones: frases "without X" o "no X" se redirigen automáticamente al prompt negativo.
- Generación determinista por semilla (misma semilla, misma imagen).
- Control de pasos de muestreo (por defecto 50 pasos Euler) y de classifier-free guidance (cfg por defecto 3,0).
- Soporte de resolución dual (512 con shift 2, 256 sin shift).
- Integración con ComfyUI mediante nodos (versión 0.4.0) y demo WebGPU en navegador.
- No soporta tool calling, agentes ni razonamiento multi-paso (es un modelo puramente generativo de imágenes).

## Casos de uso

- Generación de logotipos y símbolos: el modelo fue diseñado específicamente para glifos y símbolos, con capacidad de renderizar texto entrecomillado letra por letra, lo que lo hace adecuado para prototipado rápido de marcas y letreros.
- Prototipado de señalética y cartelería: la capacidad de generar texto legible dentro de la imagen (por ejemplo, un letrero que diga "OPEN") permite crear bocetos de señalética sin necesidad de un modelo de mayor escala.
- Generación de imágenes en el navegador: el demo WebGPU (~14 s por imagen de 512 px en una RTX 4060) permite integrar generación de imágenes en aplicaciones web sin backend GPU dedicado.
- Flujos de trabajo en ComfyUI: los nodos de ComfyUI 0.4.0 permiten incorporar el modelo en pipelines de generación más complejos junto con otros modelos y post-procesado.
- Generación de imágenes en entornos con recursos limitados: con 5,7 GB de VRAM pico y 2,9 s por imagen de 512 px en una RTX 4060, es viable en GPUs de consumo y en estaciones de trabajo modestas.
- Investigación en arquitecturas compactas de difusión: el modelo sirve como referencia para estudiar flow matching con pérdidas perceptuales ponderadas por saliencia en regímenes de pocos parámetros.
- Generación de imágenes con control de composición por conteo: el marcador de conteo de objetos permite especificar cuántos elementos debe contener la escena, útil para ilustraciones técnicas o educativas.

## Benchmarks y rendimiento

| Benchmark | Agate Preview 003 | Agate Preview 002 | Agate Preview 001 | SD 1.5 | SDXL |
|---|---|---|---|---|---|
| Qwen-Image-Bench (1.000 prompts) | 32,6 | 28,9 | 28,2 | 29,1 | No disponible |
| GenEval (oficial) | 0,554 | 0,577 | 0,550 | 0,43 (publicado) | 0,55 (publicado) |

Datos de velocidad: 2,9 s por imagen de 512 px en RTX 4060 (50 pasos, bf16, CUDA graphs; 4,5 s sin CUDA graphs), 5,7 GB de VRAM pico. En CPU, aproximadamente 100 s por imagen de 512 px. En el navegador (WebGPU), aproximadamente 14 s por imagen de 512 px en una RTX 4060.

## Requisitos de hardware

- VRAM estimada para inferencia: 5,7 GB pico a 512 px en bf16 (RTX 4060).
- GPU recomendadas: RTX 4060 o superior para inferencia en tiempo real; funciona en GPUs de consumo con al menos 6 GB de VRAM.
- Cabe en GPU de consumo: sí, en RTX 4060 y modelos superiores; también en CPU (~100 s por imagen de 512 px).
- Opciones de despliegue: Python (paquete `agate` con `AgatePipeline`), ComfyUI (nodos 0.4.0), WebGPU en navegador.
- Latencia y throughput: 2,9 s por imagen de 512 px en RTX 4060 con CUDA graphs (4,5 s sin); ~14 s en navegador con WebGPU; ~100 s en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución | Qwen-Image-Bench | GenEval | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Agate Preview 003 | 261M (309,8M con SD-VAE) | 512 × 512, 256 × 256 | 32,6 | 0,554 | MIT | HF, ComfyUI, WebGPU |
| Agate Preview 002 | No disponible | 256 × 256 | 28,9 | 0,577 | MIT | HF |
| Stable Diffusion 1.5 | ~860M | 512 × 512 | 29,1 | 0,43 | CreativeML Open RAIL-M | Amplia |
| SDXL | ~2.600M | 1024 × 1024 | No disponible | 0,55 | CreativeML Open RAIL++-M | Amplia |

## Limitaciones y advertencias

- Modelo en estado de research preview: no está pensado para uso en producción sin validación adicional.
- Solo soporta inglés; los prompts en otros idiomas pueden degradar la calidad.
- Resolución máxima de 512 × 512, insuficiente para aplicaciones que requieran alta resolución (1024 px o superior).
- Riesgo de alucinación visual: puede generar texto malformado o elementos no solicitados, especialmente en escenas complejas.
- El ajuste fino perceptual es sensible: un fine-tune sin la objetiva original (pérdida de flujo ponderada por saliencia + LPIPS + P-DINO) empeoró LPIPS un 1,8% y P-DINO un 2,0%, por lo que se recomienda mantener esta objetiva en fine-tunes.
- La ganancia en Qwen-Image-Bench sobre Preview 002 no se atribuye de forma aislada entre la resolución 512 px y las pérdidas perceptuales.
- Licencia MIT permite uso comercial, pero al ser un research preview no hay garantías de soporte ni mantenimiento.
- El pipeline de prompts aplica normalizaciones específicas (minúsculas fuera de comillas, negaciones al prompt negativo) que pueden sorprender a usuarios acostumbrados a otros modelos.

## Enlaces

- Hugging Face: https://huggingface.co/neuralnetworker/agate-preview-003
- Modelo base: https://huggingface.co/Logolabs/agate-preview-001
- Repositorio ComfyUI: https://github.com/logolabs/agate-comfyui
- Demo WebGPU: https://huggingface.co/spaces/Logolabs/agate-webgpu
- LogoLabs: https://logolabs.org
- Dataset: https://huggingface.co/datasets/LucasFang/FLUX-Reason-6M
- Papers citados (referencias de la model card): arXiv 2603.09408, 2201.03545, 2301.00808, 2212.11972, 2103.03206, 2107.14795, 2502.05171, 2104.09864, 2010.04245, 2309.14322, 1709.07871, 1903.07291, 2302.05543, 2209.03003, 2210.02747, 2403.03206, 2207.12598, 2406.02507, 2507.11412, 2412.13663, 2112.10752, 1711.05101, 2202.10054, 2509.09680, 2310.11513, 2112.01527, 2103.00020, 2605.28091, 2309.06180, 1706.08500, 2306.04675, 2304.07193, 2307.01952, 2310.00426, 2403.04692, 2410.08261, 2410.10629, 2407.15811, 2306.00637, 2412.09619, 1801.03924, 2003.05477, 2405.18392
