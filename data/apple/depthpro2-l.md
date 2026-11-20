# apple/DepthPro2-L

## Resumen

Depth Pro 2 es un modelo de estimación de profundidad monocular métrica desarrollado por Apple, publicado bajo el identificador `apple/DepthPro2-L` en Hugging Face. Resuelve el problema de recuperar mapas de profundidad en metros a partir de una sola imagen o de un clip de vídeo, manteniendo nitidez en los bordes y consistencia temporal entre fotogramas consecutivos. La variante L aquí descrita cuenta con 333.958.465 parámetros totales y se distribuye en formato safetensors (repo de 1,3 GB).

El modelo se enmarca en la familia Depth Pro 2, que incluye varios tamaños (la model card enlaza a `apple/DepthPro2` como índice de todas las variantes) y un estimador de distancia focal independiente de 23,5 M de parámetros (`apple/DepthPro2-focal`) que se carga junto al modelo de profundidad para imágenes sin datos EXIF. La librería asociada es `depth-pro-2` y el pipeline declarado es `depth-estimation`.

La relevancia actual del modelo radica en su doble enfoque: profundidad métrica (salida en metros, no solo relativa) y procesamiento de vídeo con consistencia temporal, algo poco habitual en modelos de profundidad monocular. La licencia es `apple-amlr` (Apple Machine Learning Research Model license), restringida a investigación no comercial, lo que condiciona su adopción en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de estimación de profundidad; detalles de red no especificados en la información proporcionada) |
| Parámetros totales | 333.958.465 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa imágenes individuales y clips de vídeo de 32 fotogramas por llamada) |
| Tipos de cuantización | no disponible (los benchmarks se publican en bfloat16) |
| Idiomas soportados | no disponible (modelo visual, no lingüístico) |
| Licencia | apple-amlr (solo investigación no comercial) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo (tipo de backbone, mecanismo de atención, diseño del decodificador de profundidad ni innovaciones como atención lineal o decodificación especulativa). Lo que sí se documenta es su comportamiento funcional: estima profundidad métrica monocular con bordes nítidos y mantiene consistencia temporal en vídeo, procesando clips de 32 fotogramas en una sola llamada a resolución nativa. El modelo se acompaña de un estimador de distancia focal (`apple/DepthPro2-focal`, 23,5 M de parámetros) que se integra en el pipeline para imágenes o vídeos sin focal conocida.

Tampoco se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF/DPO (poco probables en un modelo de visión). El informe técnico asociado es el arXiv:2611.26603, titulado "Depth Pro 2: Sharp and Temporally Consistent Metric Monocular Depth", firmado por Peiyun Hu, Marko Mihajlovic, Lyndon Duong, Lahav Lipson, Wei Dong, Amäel Delaunoy, Stephan R. Richter y Vladlen Koltun.

## Capacidades

- Estimación de profundidad monocular métrica: devuelve un mapa de profundidad en metros con forma `(H, W)` para una imagen de entrada.
- Procesamiento de vídeo: acepta clips de 32 fotogramas en una sola llamada y produce profundidad temporalmente consistente entre fotogramas.
- Nitidez en los bordes: el modelo se presenta explícitamente como "sharp", orientado a preservar discontinuidades de profundidad en contornos de objetos.
- Estimación de distancia focal: mediante el modelo auxiliar `apple/DepthPro2-focal` (23,5 M de parámetros), para entradas sin focal EXIF.
- Soporte de resolución nativa: procesa VGA, 720p, 1080p y 4K sin reescalado obligatorio.
- Integración con PyTorch: API `DepthPro2.from_pretrained(...)` con precisión configurable (`torch.bfloat16` en los ejemplos).
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso, multilingüismo, visión general, audio ni modo "thinking".

## Casos de uso

- Reconstrucción 3D y fotogrametría: el mapa de profundidad métrica en metros permite alimentar pipelines de reconstrucción de escena sin necesidad de calibrar escala posteriormente, gracias a la salida absoluta del modelo.
- Efectos de desenfoque de profundidad (bokeh sintético) en postproducción: la nitidez en los bordes y la profundidad métrica permiten separar primer plano y fondo con máscaras derivadas de la profundidad, aplicables a fotografía y vídeo.
- Robótica y navegación: la profundidad métrica monocular permite estimar distancias a obstáculos con una sola cámara RGB, útil en plataformas con restricciones de peso o coste donde no cabe un sensor LiDAR.
- Realidad aumentada: la consistencia temporal en clips de 32 fotogramas facilita anclar objetos virtuales a superficies reales en secuencias de vídeo sin parpadeos de profundidad entre fotogramas.
- Análisis de vídeo para edición automática: la consistencia temporal permite generar mates de profundidad estables en planos completos, útiles para sustitución de fondos o corrección de color por capas.
- Procesamiento por lotes de imágenes sin EXIF: con el estimador de focal auxiliar, el modelo puede procesar archivos sin metadatos de cámara, habitual en datasets web o capturas de pantalla.
- Preprocesado para modelos generativos: mapas de profundidad métricos como condicionamiento en pipelines de difusión para control de composición espacial.

## Benchmarks y rendimiento

La model card publica métricas de throughput y memoria en una NVIDIA B200, en bfloat16 y PyTorch eager (sin compilación), sobre un clip de vídeo de 32 fotogramas a resolución nativa:

| Métrica (B200) | VGA (640×480) | 720p | 1080p | 4K |
|---|---:|---:|---:|---:|
| Throughput (fps) | 150,1 | 33,7 | 9,1 | 0,7 |
| Memoria pico (GiB) | 4,0 | 10,6 | 21,7 | 82,6 |

No se han publicado en la información disponible resultados de benchmarks de calidad (como métricas de error de profundidad tipo AbsRel, RMSE o δ1) ni comparativas numéricas con otros modelos de profundidad.

## Requisitos de hardware

- VRAM estimada: 4,0 GiB a VGA, 10,6 GiB a 720p, 21,7 GiB a 1080p y 82,6 GiB a 4K, medidos como memoria pico reservada por PyTorch en B200 con bfloat16.
- GPU recomendadas: NVIDIA B200 para las cifras publicadas; por memoria, una GPU de 24 GiB (RTX 4090, A10G, L4 de 24 GiB) cubriría hasta 1080p; 4K requiere GPUs de 80 GiB o más (A100 80GB, H100 80GB) o particionado.
- Cabe en GPU de consumo: sí, para VGA y 720p en tarjetas de 12-16 GiB; 1080p exige 24 GiB; 4K no cabe en GPU de consumo actual.
- Opciones de despliegue: instalación vía `pip install "git+https://github.com/apple-aiml-research/ml-depth-pro-2"`, carga con `DepthPro2.from_pretrained` y `safetensors.torch.load_file`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de visión).
- Latencia y throughput: 150,1 fps a VGA, 33,7 fps a 720p, 9,1 fps a 1080p y 0,7 fps a 4K en B200; no se publican cifras para otras GPU.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de otros modelos de profundidad monocular (como Depth Pro original, Depth Anything o Metric3D) que permitan una comparación rigurosa de parámetros, contexto, rendimiento y licencia.

## Limitaciones y advertencias

- Licencia `apple-amlr`: uso restringido a investigación científica no comercial y desarrollo académico; no se permite uso comercial sin licencia adicional.
- No se documentan sesgos específicos del modelo en la información disponible; al ser un modelo visual, puede heredar sesgos de los datasets de entrenamiento (no especificados).
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero la profundidad estimada puede ser incorrecta en escenas ambiguas, superficies reflectantes o transparentes, y texturas repetitivas; no se publican métricas de error que cuantifiquen este riesgo.
- Limitación de entrada: los clips de vídeo se procesan en bloques de 32 fotogramas; no se especifica el comportamiento en secuencias más largas ni el coste de memoria acumulado.
- Idiomas: no aplica, pero la ausencia de metadatos EXIF obliga a cargar el estimador de focal auxiliar, añadiendo complejidad al pipeline.
- Memoria: 82,6 GiB a 4K limita el despliegue en hardware de gama alta; no se documentan optimizaciones de cuantización que reduzcan este requisito.
- Para producción: la licencia no comercial es el principal caveat; verificar términos exactos en `LICENSE_MODEL` antes de cualquier uso.

## Enlaces

- Hugging Face: https://huggingface.co/apple/DepthPro2-L
- Índice de todos los tamaños: https://huggingface.co/apple/DepthPro2
- Estimador de focal: https://huggingface.co/apple/DepthPro2-focal
- Repositorio GitHub: https://github.com/apple-aiml-research/ml-depth-pro-2
- Informe técnico (arXiv): https://arxiv.org/abs/2611.26603
- Página del proyecto: https://apple-aiml-research.github.io/ml-depth-pro-2/
- Licencia del modelo: https://github.com/apple-aiml-research/ml-depth-pro-2/blob/main/LICENSE_MODEL
