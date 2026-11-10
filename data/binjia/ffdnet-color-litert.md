# Binjia/ffdnet-color-litert

## Resumen

FFDNet color — LiteRT es una conversión al formato LiteRT/TFLite del modelo de denoising FFDNet (Fast and Flexible Denoising Network), publicado originalmente por Kai Zhang, Wangmeng Zuo y Lei Zhang en 2018. El autor de esta conversión, Binjia, parte de los pesos `ffdnet_color.pth` de la release KAIR v1.0 y los reescribe para que sean ejecutables en GPUs móviles y de borde mediante el runtime LiteRT de Google. El modelo resuelve una tarea muy concreta: la eliminación de ruido aditivo gaussiano en imágenes en color, con un nivel de ruido que se pasa como entrada en lugar de estar fijado en los pesos.

La relevancia de esta ficha no está en la novedad del algoritmo —FFDNet es de 2018— sino en el empaquetado: un artefacto de 1,7 MB en FP16, con operaciones restringidas a CONV_2D y TRANSPOSE_CONV, que cabe en cualquier dispositivo con aceleración GPU y que preserva la flexibilidad del modelo original (un único modelo para múltiples niveles de ruido). Es un ejemplo de cómo llevar un modelo de investigación a producción en el borde sin reentrenar.

Arquitectónicamente es una CNN pura (no un transformer), sin parámetros de contexto ni tokenizador, y con un pipeline declarado de image-to-image. La información pública disponible es muy limitada: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la model card no incluye benchmarks propios ni datos de entrenamiento detallados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (FFDNet, basada en una U-Net simplificada con pixel-unshuffle/pixel-shuffle) |
| Parametros totales | no disponible (pesos FP16 de 1,7 MB, lo que sugiere del orden de ~0,85 M de parametros, estimacion no confirmada por el autor) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada fija de 512×512×4) |
| Tipos de cuantizacion | FP16 (CONV_2D); la model card no documenta INT8 ni otras variantes |
| Idiomas soportados | no disponible (no aplica, es un modelo de imagen) |
| Licencia | MIT |
| Formato de pesos | TFLite / LiteRT (flatbuffer), operaciones CONV_2D y TRANSPOSE_CONV, rango maximo 4 |

## Arquitectura y entrenamiento

FFDNet es una red convolucional totalmente feed-forward que recibe como entrada un tensor NHWC de `[1, 512, 512, 4]`: tres canales RGB normalizados a [0, 1] más un cuarto canal que codifica el nivel de ruido σ en unidades [0, 1] (es decir, σ/255). El modelo lee σ en el píxel superior izquierdo de cada celda 2×2, de modo que un canal constante reproduce el comportamiento del FFDNet original, mientras que un mapa espacialmente variable permite denoising con ruido no uniforme. La salida es `[1, 512, 512, 3]` en float32.

La conversión a LiteRT aplica dos reescrituras exactas hasta el redondeo en coma flotante: el pixel-unshuffle se pliega en una convolución de cabecera de 6×6 con stride 2 (colocando los pesos de σ en el tap superior izquierdo de cada celda 2×2), y el pixel-shuffle se sustituye por una convolución transpuesta de 2×2 con stride 2 y kernels one-hot. El coste computacional declarado es de 13,9 GMAC por cada 256×256 y 55,6 GMAC por tesela de 512×512. El autor reporta una fidelidad de al menos 69,6 dB entre TFLite y PyTorch para σ = 5, 25 y 50, y de al menos 66,9 dB entre simulación FP16 y FP32. Los bordes de tesela difieren de una pasada completa solo en 24 px, por lo que recomienda solapar teselas en al menos 48 px.

No se dispone de información sobre el dataset de entrenamiento original (número de imágenes, composición, si hubo aumentación de datos o fine-tuning), más allá de la referencia al paper de TIP 2018 y a los pesos de KAIR v1.0. Tampoco se documenta ningún proceso de RLHF, DPO ni ajuste por preferencias, algo esperable en un modelo de denoising supervisado.

## Capacidades

- Eliminación de ruido gaussiano aditivo en imágenes en color (RGB) con nivel de ruido controlable en inferencia.
- Soporte de nivel de ruido constante (comportamiento FFDNet clásico) o espacialmente variable mediante un mapa σ.
- Procesamiento por teselas de 512×512 con solapamiento configurable para imágenes de mayor resolución.
- Ejecución en GPU mediante el runtime LiteRT, con operaciones limitadas a CONV_2D y TRANSPOSE_CONV para maximizar la compatibilidad con aceleradores.
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni generación de texto.
- No tiene capacidades multilingües ni de visión semántica (no describe, no detecta objetos, no hace OCR).
- No dispone de modo thinking, audio ni ninguna capacidad generativa.

## Casos de uso

- Limpieza de imágenes de sensores en dispositivos móviles: el modelo cabe en 1,7 MB y se ejecuta vía LiteRT en la GPU del teléfono, por lo que puede aplicarse en el pipeline de cámara antes de la compresión JPEG para reducir ruido de ISO alto sin enviar datos a la nube.
- Preprocesado en pipelines de visión por computador: reducir el ruido gaussiano antes de pasos de detección o segmentación mejora la estabilidad de los modelos downstream; el control de σ permite adaptar la intensidad según la estimación de ruido de cada imagen.
- Restauración de fotografías antiguas o escaneadas: con un mapa σ espacialmente variable se puede aplicar más denoising en zonas planas (cielo, paredes) y menos en zonas de textura, preservando detalle.
- Procesamiento en el borde para cámaras de vigilancia o IoT: al ser un modelo tiny y sin dependencias de red, puede ejecutarse en dispositivos con recursos limitados y sin conexión, reduciendo el ancho de banda necesario para transmitir vídeo.
- Integración en aplicaciones de edición fotográfica: como paso previo a filtros de nitidez o ajustes de color, el denoising evita amplificar el ruido; la licencia MIT facilita su incorporación en productos comerciales.
- Investigación en eficiencia de modelos: sirve como referencia para estudiar la fidelidad de conversiones PyTorch → LiteRT (el autor documenta métricas PSNR de conversión) y para comparar el coste GMAC de arquitecturas de denoising en aceleradores móviles.
- Prototipado rápido de denoising en Python: al ser un `.tflite` de pequeño tamaño, se puede cargar con el intérprete de TensorFlow Lite en un portátil sin GPU dedicada para validar ideas antes de desplegar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas de fidelidad de la conversión (≥ 69,6 dB TFLite vs PyTorch y ≥ 66,9 dB FP16 vs FP32), no métricas de calidad de denoising como PSNR o SSIM sobre datasets estándar (CBSD68, Kodak24, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; los pesos ocupan 1,7 MB en FP16 y el tensor de activación principal es de 512×512×4 float32 (~4 MB), por lo que el pico de memoria ronda unas pocas decenas de MB incluyendo buffers intermedios.
- GPU recomendadas: cualquier GPU compatible con LiteRT (Adreno, Mali, Apple GPU vía delegados, NVIDIA con delegado GPU de TFLite). Para servidor, una RTX 4090 o A100 es sobredimensionada pero funcional; el modelo está pensado para GPU móvil.
- Cabe en cualquier GPU de consumo, incluida una GTX 1050 o una iGPU Intel, y también en CPU con el intérprete de referencia de TFLite (más lento).
- Opciones de despliegue: intérprete LiteRT/TensorFlow Lite (Python, C++, Java, Swift), con delegado GPU; no es compatible directamente con vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles. El coste declarado es de 55,6 GMAC por tesela de 512×512, lo que da una idea del orden de magnitud, pero el autor no publica tiempos medidos en ningún dispositivo.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Entrada | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| FFDNet color — LiteRT (este) | CNN denoising | ~0,85 M (estimado, no confirmado) | 512×512×4 fija | MIT | TFLite/LiteRT | Conversion GPU-friendly, σ como entrada |
| FFDNet original (KAIR) | CNN denoising | ~0,85 M (estimado) | variable, σ como entrada | MIT | PyTorch `.pth` | Referencia de la que deriva esta conversión |
| DnCNN | CNN denoising | ~0,56 M (color, 17 capas) | variable, σ fijo por modelo | MIT | PyTorch | Requiere un modelo por nivel de ruido |
| SwinIR | Transformer | ~11 M (variante ligera) | variable | Apache 2.0 | PyTorch | Mayor calidad pero mucho más coste computacional |

La comparación con DnCNN y SwinIR se ofrece como referencia de categoría; no se dispone de datos de rendimiento de este artefacto frente a ellos en la información proporcionada.

## Limitaciones y advertencias

- Solo elimina ruido gaussiano aditivo; no está diseñado para ruido de tipo sal y pimienta, ruido de cuantización, artefactos JPEG ni ruido real de sensor no gaussiano.
- La entrada está fijada a 512×512×4; para imágenes mayores hay que teselar con solapamiento de al menos 48 px, y los bordes pueden diferir de una pasada completa en hasta 24 px.
- El rango de σ útil no está documentado en la model card; los pesos originales de FFDNet cubren típicamente σ entre 0 y 75 (en escala 0-255), pero no se confirma para esta conversión.
- Riesgo de sobre-suavizado en texturas finas si se selecciona un σ mayor que el ruido real; no hay mecanismo de estimación automática de ruido incluido.
- No hay información sobre sesgos: al ser un modelo de imagen, los sesgos relevantes serían de rendimiento diferencial por tipo de contenido (piel, texturas oscuras), no documentados.
- Licencia MIT, que permite uso comercial, modificación y redistribución con atribución; conviene conservar el aviso de copyright del autor original y de KAIR.
- El repositorio tiene 0 descargas y 0 likes, sin issues ni discusión pública; no hay garantía de mantenimiento ni soporte.
- La fecha de creación del repositorio (2026-11-10) es posterior a la fecha actual en muchos entornos de consulta; conviene verificar la integridad de los artefactos antes de usarlos en producción.
- No se documenta el proceso de conversión paso a paso ni se publican scripts reproducibles, lo que dificulta auditar la fidelidad más allá de las métricas PSNR declaradas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Binjia/ffdnet-color-litert
- Paper FFDNet (arXiv:1710.04026): https://arxiv.org/abs/1710.04026
- Release KAIR v1.0 (pesos originales): https://github.com/cszn/KAIR/releases/tag/v1.0
- Repositorio KAIR: https://github.com/cszn/KAIR
- Runtime LiteRT: no disponible en la información proporcionada (enlace no incluido en la model card)
