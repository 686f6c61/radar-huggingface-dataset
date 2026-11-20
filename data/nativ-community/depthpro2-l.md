# nativ-community/DepthPro2-L

## Resumen

DepthPro2-L es una derivación para MLX del modelo Depth Pro 2 de Apple, un estimador de profundidad métrica monocular. La conversión, publicada por la comunidad nativ-community, repaqueta los núcleos de convolución para que el modelo funcione sobre el framework MLX de Apple Silicon y conserva los pesos originales en float32. Incluye además el estimador de distancia focal compartido, de modo que el modelo devuelve simultáneamente un mapa de profundidad en metros y la longitud focal en píxeles a partir de una única imagen RGB.

El modelo resuelve el problema de la estimación de profundidad absoluta (no solo relativa) sin necesidad de calibración por escena, lo que lo hace útil para fotografía computacional, vídeo y flujos en tiempo real sobre hardware Apple. Con unos 357 millones de parámetros y un repositorio de 1,4 GB, es un modelo de tamaño medio que prioriza la calidad de la profundidad métrica sobre la generación de texto: no es un modelo de lenguaje ni un VLM conversacional, sino un cabezal de visión especializado.

Su relevancia actual radica en que permite ejecutar un modelo de investigación de Apple de forma nativa en Macs con chip de la serie M mediante MLX, algo que hasta ahora requería adaptaciones manuales de los pesos de PyTorch. La licencia Apple AMLR restringe el uso a investigación científica y desarrollo académico no comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red convolucional de estimación de profundidad monocular (Depth Pro 2) con estimador de distancia focal compartido |
| Parametros totales | 357.413.915 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible; los pesos se conservan en float32 |
| Idiomas soportados | no disponible (no aplica, modelo de visión) |
| Licencia | apple-amlr (Apple Machine Learning Research Model License Agreement), solo investigación no comercial |
| Formato de pesos | safetensors (repaquetados para MLX) |

## Arquitectura y entrenamiento

DepthPro2-L es una red convolucional profunda orientada a la predicción de profundidad métrica densa a partir de una sola imagen RGB. La derivación de nativ-community no modifica la arquitectura original de Apple: repaqueta los núcleos de convolución para que MLX pueda ejecutarlos de forma eficiente en Apple Silicon y añade una configuración de modelo MLX. El modelo incorpora un estimador de distancia focal que se ejecuta junto con el cabezal de profundidad, de modo que la predicción en metros es coherente con la óptica de la cámara incluso sin metadatos EXIF.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o ajuste fino por preferencias, ya que la model card de esta derivación remite a la familia original de Apple para esos detalles. La innovación principal de esta conversión es la compatibilidad nativa con MLX y la integración del estimador focal en el mismo paquete que el modelo de profundidad.

## Capacidades

- Estimación de profundidad métrica monocular a partir de una imagen RGB, devolviendo un mapa de profundidad en metros.
- Estimación de distancia focal en píxeles (`focallength_px`) de forma conjunta con la profundidad.
- Procesamiento de vídeo y flujos RGB en directo, según la documentación del paquete mlx-vlm.
- Ejecución nativa en Apple Silicon mediante MLX, sin necesidad de GPU dedicada.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo puramente perceptivo.
- No tiene capacidades multilingües ni de generación de texto.

## Casos de uso

- Fotografía computacional en Mac: el modelo genera mapas de profundidad métrica para aplicar desenfoque de fondo realista o efectos de retrato con distancias físicas correctas, aprovechando el estimador focal integrado.
- Reconstrucción 3D y escaneo de interiores: a partir de una foto se obtiene profundidad en metros utilizable para generar nubes de puntos o mallas aproximadas de una habitación.
- Vídeo y streaming en tiempo real: la documentación del paquete mlx-vlm incluye ejemplos para vídeo y flujos en directo, lo que permite usarlo en demos interactivas sobre un Mac.
- Realidad aumentada y superposición de objetos: la profundidad métrica permite colocar elementos virtuales a distancias físicas correctas en una escena capturada por cámara.
- Robótica y navegación asistida en prototipos académicos: estimación de obstáculos y distancias a partir de una sola cámara RGB, sin sensor de profundidad dedicado.
- Investigación en visión por computador: evaluación de modelos de profundidad monocular y experimentación con MLX como backend alternativo a PyTorch.
- Preprocesado para pipelines de edición: generación de máscaras de profundidad para segmentación o composición en herramientas de posproducción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 357 millones de parámetros en float32, el peso de los pesos ronda 1,4 GB, por lo que la memoria unificada necesaria es moderada.
- GPU recomendadas: el modelo está pensado para Apple Silicon (serie M1, M2, M3, M4) mediante MLX; no se documenta soporte para GPU NVIDIA en esta derivación.
- Cabe en equipos de consumo: sí, en Macs con memoria unificada de 8 GB o superior, dado el tamaño del repositorio (1,4 GB).
- Opciones de despliegue: `mlx-vlm` (único backend documentado en esta derivación); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nativ-community/DepthPro2-L | 357.413.915 | no aplica | Profundidad métrica monocular | apple-amlr (no comercial) | Hugging Face, MLX |
| apple/DepthPro2-L (original) | no disponible en la información | no aplica | Profundidad métrica monocular | apple-amlr | Hugging Face, PyTorch |
| apple/DepthPro2-focal | no disponible en la información | no aplica | Estimación de distancia focal | apple-amlr | Hugging Face |

No se dispone de datos de benchmarks ni de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Licencia Apple AMLR: uso restringido a investigación científica y desarrollo académico no comercial; el uso comercial requiere acuerdo aparte con Apple.
- Al ser una derivación de la comunidad, no está respaldada oficialmente por Apple y puede contener diferencias de comportamiento frente al modelo original.
- Los pesos se mantienen en float32, lo que limita las optimizaciones de cuantización y puede aumentar el uso de memoria frente a versiones cuantizadas.
- Solo se documenta backend MLX; no hay soporte confirmado para CUDA, ROCm ni otros frameworks en esta derivación.
- Riesgo de alucinación no aplica en el sentido textual, pero sí de predicciones de profundidad incorrectas en escenas ambiguas, superficies reflectantes o con poca textura.
- No se dispone de información sobre sesgos del dataset de entrenamiento ni sobre su composición demográfica o geográfica.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de validación.

## Enlaces

- [Hugging Face: nativ-community/DepthPro2-L](https://huggingface.co/nativ-community/DepthPro2-L)
- [Modelo base: apple/DepthPro2-L](https://huggingface.co/apple/DepthPro2-L)
- [Modelo base: apple/DepthPro2-focal](https://huggingface.co/apple/DepthPro2-focal)
- [Familia original: apple/DepthPro2](https://huggingface.co/apple/DepthPro2)
- [Documentación del paquete mlx-vlm para depth_pro_2](https://github.com/Neywa-Labs/mlx-vlm/blob/main/mlx_vlm/models/depth_pro_2/README.md)
