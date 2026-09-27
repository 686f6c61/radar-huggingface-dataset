# mlx-community/VOSR2-fp32

## Resumen

VOSR2 es un modelo de superresolución generativa de un solo paso ("vision-only one-step generative super-resolution") presentado en CVPR 2026 por los autores de CSWRY/VOSR. El repositorio analizado, mlx-community/VOSR2-fp32, es la conversión a MLX en precisión fp32 del checkpoint original, publicada para el port Swift/MLX `xocialize/mlx-vosr-swift`. No se trata de un modelo de lenguaje: es un modelo de imagen a imagen que aumenta la resolución y restaura imágenes en factores de ×1 a ×4, emitiendo píxeles en una única pasada generativa en lugar de un bucle de difusión multi-paso.

El sistema se compone de tres piezas: un transformer LightningDiT de 1.394 B de parámetros que actúa como generador, el VAE 2-D de Qwen-Image como espacio latente y un extractor de características DINOv2 ViT-L/14 truncado a los bloques 0–17 como condicionamiento semántico. La conversión no re-cuantiza en la subida: cada tensor se transpone al layout MLX de forma exacta, incluyendo las tablas RoPE y la interpolación previa del `pos_embed` para entradas de 448².

Su relevancia práctica es doble. Por un lado, la lane fp32 funciona como referencia de paridad (115,5 dB de PSNR frente a la implementación PyTorch en CPU para salidas de 512²), lo que permite verificar ports y cuantizaciones. Por otro, es la alternativa de máxima fidelidad frente a la lane fp16, que es la que se distribuye para producción junto con una cuantización int8 derivada en el momento de la carga.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LightningDiT (Diffusion Transformer de un solo paso) + VAE 2-D de Qwen-Image + DINOv2 ViT-L/14 (bloques 0-17) como condicionamiento |
| Parametros totales | 1.394 B en el transformer (LightningDiT, `VOSR2/checkpoints/ema_model.safetensors`); total del paquete no disponible |
| Parametros activos | no aplica (no es un MoE) |
| Longitud de contexto | no aplica (modelo de imagen a imagen, sin ventana de contexto de texto) |
| Tipos de cuantizacion | fp32 (esta lane); fp16 (lane de producción `mlx-community/VOSR2-fp16`); int8 weight-only group-64 sobre los Linear del DiT (derivada al cargar desde la lane fp16); bf16 no publicado |
| Idiomas soportados | no disponible (no es un modelo de lenguaje); cualquier texto presente en la imagen se regenera y puede alterarse |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`transformer_fp32.safetensors`, `vae_fp32.safetensors`, `dinov2_fp32.safetensors`) + `config.json` |
| Tamano del repositorio | 6,7 GB |
| Factor de escala | ×1 a ×4 |
| Pipeline | image-to-image |
| Libreria | mlx |

## Arquitectura y entrenamiento

El generador es un LightningDiT, una variante de Diffusion Transformer que resuelve la superresolución en un único paso de muestreo. El transformer consume latentes del VAE 2-D de Qwen-Image y se condiciona con características de DINOv2 ViT-L/14 extraídas de los bloques 0 a 17; el conversor solo porta los bloques que el DiT consume y los inferiores. La conversión mantiene el contrato de claves definido en el docstring de `oracle/convert_weights.py`: las convoluciones de patch se almacenan con layout (O, kH, kW, I), los hijos de `nn.Sequential` bajo `layers.N`, la gamma de RMSNorm2D comprimida a (C) y las tablas RoPE intactas. El `pos_embed` de DINOv2 se interpola previamente para la entrada de 448².

No hay información sobre el corpus de entrenamiento: los autores de VOSR2 no lo divulgan y esta conversión re-hostea los pesos tomando como governing la licencia declarada por los autores. Tampoco se documenta el uso de RLHF, DPO o cualquier etapa de alineación, algo coherente con un modelo de restauración de imagen y no de lenguaje. La innovación técnica destacable es precisamente la formulación de un solo paso, que evita el coste de decenas de evaluaciones del transformer propias de la difusión clásica, más una truncación deliberada del backbone DINOv2 para reducir el coste de condicionamiento.

## Capacidades

- Superresolución de imagen con factores de escala seleccionables entre ×1 y ×4.
- Restauración generativa de imagen: reconstruye detalle de alta frecuencia en lugar de limitarse a interpolar.
- Funciona como "generative stills tier" dentro del motor MLXEngine (`imageUpscale`), pensado para imágenes fijas.
- Procesamiento por teselas para resoluciones altas: el port documenta paridad medida sobre salidas tiled de 1024².
- Tres niveles de fidelidad/precisión intercambiables en carga: fp32, fp16 e int8 (DiT), lo que permite ajustar el compromiso entre calidad y memoria sin cambiar de modelo.
- Integración nativa con Swift/MLX mediante `xocialize/mlx-vosr-swift` y el paquete `VOSRUpscalePackage`.
- No soporta generación de texto, razonamiento, código, matemáticas, tool calling, function calling, uso de agentes ni multi-step reasoning: son capacidades fuera del alcance de este modelo.
- No hay capacidades de audio ni de visión multimodal de tipo VQA; el uso de visión es exclusivamente como extractor de características interno.

## Casos de uso

- Restauración de fotografía histórica y de archivo: el modelo regenera texturas perdidas (piel, tejidos, grano) en lugar de aplicar un filtro de nitidez, lo que resulta adecuado para digitalizaciones antiguas de baja resolución. Conviene revisar manualmente las zonas con texto o numeración.
- Preparación de assets para producción gráfica y 3D: escalado de renders, texturas y material gráfico a resoluciones de impresión. La paridad de 121,9 dB en modo tiled a 1024² indica que el pipeline por teselas mantiene la fidelidad cuando la imagen excede la resolución de trabajo directa.
- Aumento de resolución de imágenes de producto en comercio electrónico: recuperar detalle en fotos de catálogo tomadas con móvil antes de publicarlas, con la ventaja de un único paso de inferencia que abarata el procesado por lotes.
- Preprocesado de datasets de visión por computador: escalar conjuntos de imágenes de entrenamiento o validación manteniendo una referencia fp32 verificable, de modo que la mejora no introduzca artefactos difíciles de auditar.
- Postproducción fotográfica: uso como paso de restauración previo al retoque manual en flujos donde se necesita recuperar microdetalle sin recurrir a upscalers GAN, que tienden a generar texturas sintéticas repetitivas.
- Inferencia on-device en apps de iOS y macOS: la lane fp16, con la cuantización int8 derivada en carga, está pensada para ejecutarse localmente vía MLX sin enviar la imagen a un servidor, algo relevante para fotografía personal o material sujeto a confidencialidad.
- Restauración fotograma a fotograma en proyectos audiovisuales: al ser un modelo de imagen fija, se aplica secuencialmente sobre cada frame; es viable para archivos de baja resolución, aunque la consistencia temporal no está garantizada por el modelo.
- Verificación y auditoría de ports: la lane fp32 sirve como referencia para validar implementaciones en otros runtimes comparando PSNR contra la salida PyTorch con la misma entrada y el mismo ruido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de superresolución (PSNR/SSIM/LPIPS sobre conjuntos estándar) en la información disponible. Los únicos números documentados son métricas de paridad frente a la implementación upstream en PyTorch sobre CPU fp32, con la misma entrada y el mismo ruido:

| Escenario | Lane | PSNR frente a PyTorch fp32 |
|---|---|---|
| Salida 512² | fp32 | 115,5 dB |
| Salida 1024² con tiling | fp32 | 121,9 dB |
| Salida 512² | fp16 | 49,3 dB |
| Salida 512² | fp16 + int8 en el DiT | 46,7 dB |
| Referencia descartada | bf16 | 37,6 dB medidos frente a la referencia fp32 |

La lane bf16 no se publica precisamente por esa pérdida: el stream residual del DiT alcanza valores de magnitud |126|, lo que hace que bf16 no tenga suficiente mantisa para reproducir el resultado.

## Requisitos de hardware

- VRAM estimada para la lane fp32: en torno a 7-9 GB solo para pesos (1.394 B del DiT a 4 bytes por parámetro son ~5,6 GB, más VAE y DINOv2 truncado), con picos mayores al procesar teselas de 1024². Estimación a partir del tamaño del repo, no confirmada por el autor.
- VRAM estimada para la lane fp16: aproximadamente la mitad, del orden de 3,5-4,5 GB, lo que la sitúa en el rango de una RTX 3060 de 12 GB o una RTX 4070.
- VRAM estimada para fp16 + int8 en el DiT: alrededor de 2-3 GB, con lo que podría caber en GPUs consumer de 8 GB o en Macs con memoria unificada de 8-16 GB.
- GPU recomendadas: para fp32, A100, H100 o cualquier GPU con 16 GB o más; para fp16, RTX 4070/4080/4090, RTX 3060 12 GB, L4 o A10; para int8, GPUs de 8 GB.
- Aptitud en hardware de consumo: sí en las lanes fp16 e int8; la lane fp32 está pensada como referencia de paridad más que como vía de despliegue.
- Opciones de despliegue: MLX en Swift mediante `xocialize/mlx-vosr-swift` y el motor MLXEngine (operación `imageUpscale`), o MLX directamente en Python. No aplican vLLM, TGI, llama.cpp ni Ollama, ya que no es un modelo de lenguaje. El motor materializa el repositorio en su almacén de modelos en el primer uso mediante `WeightSourcing`.
- Latencia y throughput: no disponibles; la model card no publica tiempos de inferencia ni métricas de rendimiento por lote.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Formato y runtime | Licencia |
|---|---|---|---|---|
| mlx-community/VOSR2-fp32 (este) | 1,394 B en el DiT | Generativo de un solo paso, MLX fp32, referencia de paridad | safetensors, MLX | Apache-2.0 |
| mlx-community/VOSR2-fp16 | 1,394 B en el DiT | Misma arquitectura, lane de producción con int8 derivable en carga | safetensors, MLX | Apache-2.0 |
| CSWRY/VOSR (upstream) | 1,394 B en el DiT | Implementación PyTorch original, CVPR 2026 | pesos PyTorch | Apache-2.0 |
| Alternativas GAN-based y transformer-based de superresolución (por ejemplo Real-ESRGAN o SwinIR) | no disponible | Restauración no generativa o generativa con GAN, sin condicionamiento DINOv2 documentado en esta información | varía según implementación | varía; no verificada en la información disponible |

No se dispone de datos comparativos de calidad (PSNR/SSIM/LPIPS sobre benchmarks públicos) entre este modelo y las alternativas, por lo que no es posible establecer una comparación de rendimiento rigurosa.

## Limitaciones y advertencias

- Naturaleza generativa sobre texto: el propio autor advierte que el modelo reescribe letras en texto pequeño que ya era legible. Cualquier entrada con texto (escaneos, capturas, carteles, documentos) debería pasar por una comprobación de legibilidad o quedar fuera del flujo automático.
- Riesgo de alucinación visual: al ser generativo, puede inventar detalle que no existía en la imagen original (texturas, rasgos faciales, caracteres). En contextos forenses, médicos o documentales esto invalida el resultado como evidencia.
- Sesgos: no disponibles. El corpus de entrenamiento no ha sido divulgado por los autores de VOSR2, por lo que no es posible evaluar sesgos de dominio, demográficos o culturales.
- Cobertura de idiomas: no aplica como modelo de lenguaje; no obstante, la calidad de reconstrucción de texto en imágenes depende del alfabeto y de la escritura presentes en los datos de entrenamiento, que se desconocen.
- Restricciones de licencia: Apache-2.0 en todo el stack (VOSR2, VAE de Qwen-Image, DINOv2 de Meta), lo que permite uso comercial. Esta conversión re-hostea los pesos asumiendo la licencia declarada por los autores; el corpus de entrenamiento no divulgado implica un riesgo de procedencia no cuantificado.
- Caveat de precisión: bf16 no está publicado porque no alcanza la fidelidad requerida (37,6 dB). Si el pipeline de destino exige bf16, hay que asumir pérdida de calidad o mantener fp16/fp32.
- Caveat de despliegue: el modelo está atado al ecosistema MLX (Apple Silicon o backend MLX); no hay pesos GGUF, ONNX ni conversiones oficiales a otros runtimes en la información disponible.
- Sin garantías de consistencia temporal: no está diseñado para vídeo, por lo que aplicarlo fotograma a fotograma puede producir parpadeo o variaciones entre frames.
- Adopción nula registrada en el momento de la consulta: 0 descargas y 0 likes, lo que implica poca validación externa de la conversión aparte de las métricas de paridad del propio autor.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/mlx-community/VOSR2-fp32
- Modelo base upstream: https://huggingface.co/CSWRY/VOSR
- Lane fp16 de producción: https://huggingface.co/mlx-community/VOSR2-fp16
- Port Swift/MLX: https://github.com/xocialize/mlx-vosr-swift
- Repositorio oficial de VOSR (licencia): https://github.com/cswry/VOSR
- Licencia Apache-2.0 referenciada: https://github.com/cswry/VOSR/blob/main/LICENSE
- Documentación de paridad del port: `PORTING-SPEC.md` en https://github.com/xocialize/mlx-vosr-swift
- Script de conversión: `oracle/convert_weights.py` en https://github.com/xocialize/mlx-vosr-swift
- Paper de VOSR2 (CVPR 2026): referencia citada en la model card, URL no disponible en la información proporcionada.
