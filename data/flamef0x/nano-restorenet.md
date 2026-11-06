# FlameF0X/Nano-RestoreNet

## Resumen

Nano-RestoreNet es un modelo de restauracion de imagen de tipo Restormer con un mecanismo de embedding de tarea, desarrollado por el usuario FlameF0X y publicado en Hugging Face bajo licencia Apache 2.0. Resuelve tres tareas de restauracion sobre imagenes RGB en el rango [0, 1]: eliminacion de ruido (denoise), reescalado (upscale) y mejora general (enhance). Con aproximadamente 10,86 millones de parametros, es un modelo muy compacto disenado para inferencia ligera.

La arquitectura sigue el patron de Restormer: un transformer con atencion multicabezal basada en transposed attention (MDTA) y una red feed-forward con convoluciones depthwise (GDFN), organizada en un esquema encoder-bottleneck-decoder con PixelUnshuffle y PixelShuffle para el cambio de resolucion. La innovacion principal es un embedding de tarea que modula las features mediante FiLM (scale y bias por bloque), lo que permite reutilizar un unico conjunto de pesos para las tres tareas.

El modelo es relevante por su tamano reducido (10,8 M de parametros, repo de 0,0 GB en safetensors) y su naturaleza multitarea, lo que lo hace adecuado para despliegues en entornos con recursos limitados. No obstante, los resultados publicados muestran que solo la tarea de denoise mejora claramente a la linea base, mientras que upscale y enhance presentan un rendimiento mixto o inferior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Restormer-style (transformer con MDTA y GDFN), encoder-bottleneck-decoder con embedding de tarea y modulacion FiLM |
| Parametros totales | 10.858.435 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (model.safetensors), mas config.json |
| Entrada/salida | imagenes RGB en rango [0, 1] |
| Tareas | denoise, upscale, enhance |
| Canales base | C=64 (segun la definicion del modelo) |
| Bloques por etapa | (4, 6, 8) segun la definicion del modelo |
| Dimension del embedding de tarea | 64 |
| Numero de tareas | 3 |
| Dataset de entrenamiento | FlameF0X/nano-banana-pro-gen-zh-en |
| Descargas | 161 |
| Likes | 0 |

## Arquitectura y entrenamiento

La red se compone de un stem convolucional de 3 a 64 canales, seguido de tres etapas de transformer (encoder1, encoder2 y bottleneck) con 4, 6 y 8 bloques respectivamente. Entre etapas se aplica PixelUnshuffle(2) con convolucion 1x1 para reducir la resolucion espacial y duplicar los canales. El decoder simetrico usa PixelShuffle(2) y fusion por concatenacion con las features del encoder. Cada bloque TBlock aplica LayerNorm2d, MDTA (atencion con normalizacion L2 sobre q y k, temperatura aprendible por cabeza y convolucion depthwise sobre qkv) y GDFN (feed-forward con convolucion depthwise y activacion GELU). La modulacion FiLM, inicializada a cero, inyecta el embedding de tarea en cada bloque como escala y sesgo sobre las features normalizadas.

El entrenamiento se realizo sobre el dataset FlameF0X/nano-banana-pro-gen-zh-en, aunque no se especifica el numero de tokens ni la composicion exacta del dataset en la informacion disponible. El modelo card menciona que fue entrenado durante un numero de pasos (`training_steps`) almacenado en config.json, pero no se proporciona el valor. No se documenta el uso de RLHF, DPO ni tecnicas de alineacion, algo esperable en un modelo de restauracion de imagen. Tampoco se detalla si hubo decodificacion especulativa, atencion lineal u otras optimizaciones de inferencia.

## Capacidades

- Restauracion de imagen: eliminacion de ruido (denoise) con mejora sustancial de PSNR, SSIM y LPIPS frente a la linea base.
- Re escalado (upscale): aumento de resolucion de imagenes RGB, aunque con rendimiento ligeramente inferior a la linea base en las metricas publicadas.
- Mejora general (enhance): ajuste de calidad visual con mejoras marginales en PSNR y SSIM, pero con LPIPS peor que la linea base.
- Multitarea con un unico conjunto de pesos: el embedding de tarea permite seleccionar entre denoise, upscale y enhance sin cargar modelos separados.
- Procesamiento de imagenes RGB en rango [0, 1], con salida en el mismo espacio.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (no es un modelo de lenguaje).
- No dispone de capacidades multilingues ni de modo thinking, vision o audio mas alla del procesamiento de imagen.
- Inferencia en CPU o CUDA, con soporte de AMP (mixed precision) en GPU.

## Casos de uso

- Limpieza de imagenes ruidosas en pipelines de fotografia: el modelo puede aplicarse como paso de denoise previo a la publicacion de imagenes capturadas con sensores de alta ISO, aprovechando la mejora de PSNR de 20,69 a 28,46 y de LPIPS de 0,4006 a 0,1353.
- Preprocesado en sistemas de OCR o vision por computador: reducir ruido antes de pasar la imagen a un modelo de deteccion o reconocimiento, mejorando la calidad de entrada con un coste computacional bajo (10,8 M de parametros).
- Mejora de miniaturas y assets en aplicaciones web: usar la tarea enhance para ajustar calidad visual de imagenes de catalogo o blog, con la cautela de que el LPIPS empeora respecto a la linea base.
- Restauracion por lotes en entornos con recursos limitados: al ser un modelo compacto, puede ejecutarse en CPU o en GPUs consumer para procesar lotes de imagenes sin necesidad de infraestructura pesada.
- Prototipado e investigacion en restauracion de imagen: servir como base para experimentos de embedding de tarea y modulacion FiLM en arquitecturas Restormer de baja capacidad.
- Integracion en aplicaciones de edicion fotografica ligera: ofrecer un boton de "mejorar imagen" o "eliminar ruido" en apps de escritorio o moviles con inferencia local.
- Evaluacion comparativa de tecnicas de restauracion: usar el modelo como referencia multitarea en estudios que comparen denoise, upscale y enhance con lineas base.

## Benchmarks y rendimiento

Resultados publicados en la model card (PSNR mas alto es mejor, SSIM mas alto es mejor, LPIPS mas bajo es mejor):

| Tarea | Metodo | PSNR | SSIM | LPIPS |
|---|---|---|---|---|
| denoise | baseline | 20,69 | 0,4472 | 0,4006 |
| denoise | model | 28,46 | 0,8144 | 0,1353 |
| upscale | baseline | 28,18 | 0,8609 | 0,1985 |
| upscale | model | 27,77 | 0,8193 | 0,2270 |
| enhance | baseline | 26,05 | 0,7697 | 0,2820 |
| enhance | model | 26,46 | 0,7821 | 0,3105 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que el modelo no es de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 10,86 M de parametros en fp32 el peso ronda los 43 MB, y en fp16 unos 22 MB, por lo que la VRAM necesaria es minima (dominada por las activaciones de imagen).
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; el modelo cabe holgadamente en RTX 3060, RTX 4090, A100 o H100.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna, e incluso en CPU.
- Opciones de despliegue: PyTorch nativo (el codigo de carga usa huggingface_hub y safetensors), con soporte de AMP en CUDA; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo de vision).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nano-RestoreNet | 10,86 M | no disponible | denoise, upscale, enhance | apache-2.0 | Hugging Face |
| Restormer (original) | no disponible en la informacion | no disponible | restauracion multiple | no disponible en la informacion | no disponible en la informacion |
| Otros modelos de restauracion | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes en la informacion proporcionada para establecer una comparativa cuantitativa con alternativas concretas de la misma categoria. La model card solo referencia el estilo Restormer, sin detallar versiones comparables ni sus especificaciones.

## Limitaciones y advertencias

- Rendimiento mixto: solo la tarea denoise supera claramente a la linea base; upscale empeora PSNR, SSIM y LPIPS, y enhance mejora PSNR y SSIM pero empeora LPIPS.
- Riesgo de artefactos: al ser un modelo pequeno (10,86 M de parametros), puede generar artefactos o perdida de detalle en imagenes de alta resolucion o con ruido complejo.
- Sesgos conocidos: no se documentan sesgos especificos, pero el entrenamiento sobre un dataset concreto (FlameF0X/nano-banana-pro-gen-zh-en) puede limitar la generalizacion a otros dominios visuales.
- Limitaciones de idioma: no aplica, es un modelo de imagen; no se documentan capacidades multilingues.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones del dataset de entrenamiento por posibles restricciones adicionales.
- Caveats para produccion: no se documentan pasos de entrenamiento, composicion del dataset ni procesos de validacion; la falta de benchmarks externos y de likes/descargas limita la confianza en su robustez.
- No apto para tareas de lenguaje, agentes o tool calling: es exclusivamente un modelo de restauracion de imagen.

## Enlaces

- Hugging Face: https://huggingface.co/FlameF0X/Nano-RestoreNet
- Dataset de entrenamiento: https://huggingface.co/datasets/FlameF0X/nano-banana-pro-gen-zh-en
- No se han encontrado papers, blogs, repositorios o demos adicionales en la informacion proporcionada.
