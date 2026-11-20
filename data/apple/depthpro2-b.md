# apple/DepthPro2-B

## Resumen

Depth Pro 2 es un modelo de estimación de profundidad monocular métrica desarrollado por Apple Machine Learning Research. La variante B, con 96.513.409 parámetros (aproximadamente 97M), estima mapas de profundidad en metros a partir de una sola imagen o de un clip de vídeo, manteniendo consistencia temporal entre fotogramas. Se distribuye en formato safetensors con un repositorio de 0,4 GB y se integra mediante la librería `depth-pro-2`, disponible como paquete instalable desde GitHub.

El modelo aborda dos problemas clásicos de la profundidad monocular: la falta de escala métrica absoluta y la inconsistencia temporal en vídeo. Para ello incorpora un estimador de longitud focal (`apple/DepthPro2-focal`, 23,5M de parámetros, compartido entre todas las tallas) que permite inferir la distancia focal cuando la imagen no incluye metadatos EXIF. El resultado es un mapa de profundidad en metros con bordes nítidos y coherencia entre fotogramas consecutivos.

Es relevante ahora porque cubre tanto fotografía como vídeo en una sola llamada, con resoluciones que van de VGA a 4K, y porque Apple publica la familia completa de tallas junto con un informe técnico (arXiv:2611.26603). La licencia, sin embargo, es de solo investigación (Apple Machine Learning Research Model License), lo que limita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de estimación de profundidad; detalles en el informe técnico arXiv:2611.26603) |
| Parametros totales | 96.513.409 (~97M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de imagen/vídeo, no texto) |
| Tipos de cuantizacion | no disponible; la model card usa bfloat16 en los benchmarks |
| Idiomas soportados | no aplica (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | apple-amlr (Apple Machine Learning Research Model License), solo investigación |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de detalles de arquitectura en la información proporcionada más allá de que se trata de un modelo de estimación de profundidad monocular métrica con soporte de vídeo y consistencia temporal. El informe técnico asociado es "Depth Pro 2: Sharp and Temporally Consistent Metric Monocular Depth" (arXiv:2611.26603), de Peiyun Hu, Marko Mihajlovic, Lyndon Duong, Lahav Lipson, Wei Dong, Amäel Delaunoy, Stephan R. Richter y Vladlen Koltun, donde se detallan la arquitectura y el entrenamiento.

Un componente técnico destacable es el estimador de longitud focal independiente (`apple/DepthPro2-focal`, 23,5M de parámetros), que se carga junto al modelo de profundidad y permite obtener profundidad métrica en fotos y vídeos sin distancia focal conocida. La model card indica que el modelo procesa clips de 32 fotogramas en una sola llamada a resolución nativa, lo que sugiere un diseño pensado para coherencia temporal en vídeo. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF/DPO (no aplicables en un modelo de visión de este tipo).

## Capacidades

- Estimación de profundidad monocular métrica: devuelve un mapa de profundidad en metros con forma (H, W) a partir de una imagen RGB.
- Estimación de profundidad en vídeo: procesa clips de 32 fotogramas en una sola llamada, con consistencia temporal entre fotogramas.
- Predicción de longitud focal: mediante el estimador `DepthPro2-focal`, infiere la distancia focal cuando no hay EXIF disponible.
- Soporte de metadatos EXIF: acepta la distancia focal (`f_px`) leída de la foto cuando está presente.
- Alta resolución: funciona desde VGA (640x480) hasta 4K en formato 16:9.
- Bordes nítidos: el nombre del modelo enfatiza la nitidez de los contornos en el mapa de profundidad.
- No soporta tool calling, agentes ni generación de texto: es un modelo puramente de visión.

## Casos de uso

- Reconstrucción 3D y fotogrametría: el mapa de profundidad métrica en metros permite inicializar nubes de puntos o mallas sin necesidad de calibrar la escala manualmente, útil en pipelines de captura con una sola cámara.
- Efectos de desenfoque de profundidad (bokeh sintético): al disponer de profundidad métrica por píxel se puede aplicar desenfoque selectivo realista en postproducción fotográfica y de vídeo.
- Segmentación por profundidad y recorte de objetos: los mapas nítidos facilitan separar primer plano y fondo en herramientas de edición o generación de máscaras.
- Robótica y navegación asistida: la profundidad métrica de una sola cámara abarata la percepción en plataformas sin LiDAR, siempre que el uso sea de investigación.
- Vídeo con coherencia temporal: la consistencia entre los 32 fotogramas de un clip evita parpadeos en aplicaciones de realidad aumentada o composición de vídeo donde se superponen capas según la profundidad.
- Análisis de escenas a gran escala: con 269,7 fps en VGA sobre una B200, es viable procesar lotes grandes de imágenes para anotación automática o generación de datasets de profundidad.
- Investigación en visión por computador: como referencia o baseline para comparar métodos de profundidad monocular métrica, dado su acceso bajo licencia de investigación.

## Benchmarks y rendimiento

La model card publica métricas de throughput y memoria en una NVIDIA B200, en bfloat16 y PyTorch eager (sin compilación), procesando un clip de vídeo de 32 fotogramas a resolución nativa:

| Resolucion | Throughput (fps) | Memoria pico (GiB) |
|---|---:|---:|
| VGA (640x480) | 269,7 | 2,6 |
| 720p (16:9) | 82,5 | 6,6 |
| 1080p (16:9) | 23,6 | 14,0 |
| 4K (16:9) | 1,8 | 64,8 |

No se han publicado en la información disponible resultados de benchmarks de calidad (por ejemplo, errores de profundidad tipo AbsRel o delta) ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada: 2,6 GiB en VGA, 6,6 GiB en 720p, 14,0 GiB en 1080p y 64,8 GiB en 4K (memoria pico reservada por PyTorch en B200, incluyendo el estimador de longitud focal).
- GPU recomendadas: NVIDIA B200 para las cifras publicadas; por memoria, una GPU con 16 GB o más cubre hasta 1080p, y se necesita una GPU de 80 GB para 4K sin trocear el clip.
- GPU de consumo: cabe en tarjetas de 8 GB para VGA y 720p; para 1080p se requiere al menos 16 GB (RTX 4080/4090 o superior). 4K no cabe en GPU de consumo.
- Opciones de despliegue: la librería oficial `depth-pro-2` (instalable con `pip install "git+https://github.com/apple-aiml-research/ml-depth-pro-2"`), con carga de pesos vía `safetensors` y `huggingface_hub`. No se indica soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: 269,7 fps en VGA, 82,5 fps en 720p, 23,6 fps en 1080p y 1,8 fps en 4K sobre B200 en bfloat16.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de otros modelos de profundidad monocular métrica (parámetros, contexto, rendimiento o licencia) para establecer una comparativa rigurosa. La model card remite a la página de la familia (`apple/DepthPro2`) para consultar las demás tallas del propio modelo, pero no se ofrecen cifras de alternativas externas. Comparativa con modelos de terceros: no disponible.

## Limitaciones y advertencias

- Licencia restrictiva: los pesos se publican bajo la Apple Machine Learning Research Model License, limitada a investigación científica no comercial y desarrollo académico. No se permite uso comercial sin licencia adicional.
- Sin datos de sesgo: no se documentan en la información disponible sesgos demográficos, geográficos o de otro tipo del dataset de entrenamiento.
- Riesgo de error en profundidad: al ser un modelo monocular, la precisión depende de la escena; no se publican métricas de error en la información disponible, por lo que conviene validarlo en el dominio de aplicación.
- Dependencia del estimador de longitud focal: si la imagen no trae EXIF, la escala métrica depende de `DepthPro2-focal`, que añade 23,5M de parámetros y su propio error.
- Memoria elevada en 4K: 64,8 GiB de pico hacen inviable el procesamiento a resolución completa en hardware de consumo; será necesario trocear o reducir resolución.
- Procesamiento por clips de 32 fotogramas: la consistencia temporal está acotada a esa ventana; no se documenta el comportamiento en secuencias más largas.
- Modelo solo de visión: no procesa texto, no soporta tool calling ni agentes, y no debe evaluarse con métricas de lenguaje.
- Idiomas: no aplica; no hay capacidades multilingües que valorar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/apple/DepthPro2-B
- Familia completa de tallas: https://huggingface.co/apple/DepthPro2
- Estimador de longitud focal: https://huggingface.co/apple/DepthPro2-focal
- Repositorio GitHub: https://github.com/apple-aiml-research/ml-depth-pro-2
- Informe técnico (arXiv): https://arxiv.org/abs/2611.26603
- Página del proyecto: https://apple-aiml-research.github.io/ml-depth-pro-2/
- Licencia del modelo: https://github.com/apple-aiml-research/ml-depth-pro-2/blob/main/LICENSE_MODEL
