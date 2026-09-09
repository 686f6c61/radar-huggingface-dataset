# apple/DepthPro

## Resumen

Depth Pro es un modelo de estimación de profundidad monocular métrica desarrollado por Apple. Se presenta como un modelo base (foundation model) capaz de estimar la profundidad de una escena a partir de una única imagen RGB, sin necesidad de metadatos como los parámetros intrínsecos de la cámara. El modelo genera mapas de profundidad de alta resolución con un nivel de nitidez y detalle de alta frecuencia notable, y lo hace de forma rápida: produce un mapa de 2,25 megapíxeles en 0,3 segundos en una GPU estándar.

Arquitectónicamente emplea un transformer de visión multi-escala eficiente para predicción densa. El modelo fue presentado en el artículo "Depth Pro: Sharp Monocular Metric Depth in Less Than a Second" (arXiv:2410.02073) por investigadores de Apple. El checkpoint publicado en Hugging Face es una implementación de referencia reentrenada; su rendimiento es cercano al del artículo pero no lo iguala exactamente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de visión multi-escala para predicción densa |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponibles |
| Idiomas soportados | no disponibles |
| Licencia | apple-amlr |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

Depth Pro se basa en un transformer de visión multi-escala diseñado específicamente para predicción densa. Esta arquitectura procesa la imagen en múltiples resoluciones, lo que permite combinar información global de contexto con detalle local de los bordes. Según el artículo, el protocolo de entrenamiento combina datasets reales y sintéticos; esto resulta fundamental para lograr dos objetivos a la vez: una alta precisión métrica en la escala absoluta y un trazado fino de los límites de los objetos.

Además, el modelo incorpora un mecanismo de estimación de distancia focal a partir de una sola imagen, lo que elimina la necesidad de conocer las intrínsecas de la cámara. También se introducen métricas de evaluación específicas para medir la precisión de los bordes en los mapas de profundidad estimados.

## Capacidades

- Estimación de profundidad métrica monocular en modo zero-shot: no requiere calibración ni datos previos de la cámara.
- Genera mapas de profundidad de alta resolución: hasta 2,25 megapíxeles en 0,3 segundos.
- Detalle de bordes excepcional: capaz de reproducir objetos con límites finos y alta frecuencia.
- Estimación de la distancia focal en píxeles a partir de una sola imagen.
- Compatibilidad con imágenes RGB individuales, sin necesidad de vídeo o múltiples vistas.
- Integración en Python mediante la librería `depth_pro`, con API `create_model_and_transforms` e `infer`.
- No es un modelo de lenguaje: no soporta tool calling, agentes ni tareas de texto.

## Casos de uso

- Navegación robótica: Depth Pro puede servir como sensor de profundidad visual en robots móviles. Al predecir la escala métrica absoluta sin intrínsecas de cámara, un robot puede estimar la distancia a obstáculos y planificar rutas de forma autónoma con una sola imagen.
- Realidad aumentada: la nitidez en los bordes y la alta resolución permiten ocluir correctamente objetos virtuales tras elementos reales. Un desarrollador puede integrar el modelo en una app de AR para que los objetos colocados en la escena se oculten tras las manos o muebles de forma precisa.
- Fotografía computacional: la generación de desenfoque de fondo (bokeh) artificial se beneficia de mapas de profundidad precisos. El modelo permite separar el sujeto del fondo y aplicar profundidad de campo simulada en fotografías tomadas con un solo objetivo.
- Reconstrucción 3D: los mapas de profundidad métricos de alta resolución pueden convertirse en nubes de puntos o mallas para escaneado 3D de interiores o pequeñas escenas, sin necesidad de hardware especializado.
- Conducción autónoma: en sistemas avanzados de asistencia al conductor, la estimación de distancia en tiempo real con una sola cámara frontal puede complementar sensores LiDAR y radares. El bajo coste computacional (0,3 s por imagen) facilita el procesamiento en tiempo real.
- Inspección industrial: en entornos de control de calidad, se puede medir la distancia o el tamaño de objetos a partir de una fotografía. Al disponer de escala métrica absoluta, el modelo permite calcular dimensiones sin calibrar manualmente la cámara.
- Edición de vídeo y efectos visuales: la alta fidelidad de bordes simplifica la composición de elementos generados por ordenador en escenas reales, permitiendo integrar objetos 3D con la iluminación y oclusión correctas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La documentación indica únicamente que el modelo genera un mapa de profundidad de 2,25 megapíxeles en 0,3 segundos en una GPU estándar, pero no se proporcionan tablas de comparación con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendada: no se especifica; el documento original cita una "GPU estándar" como referencia de tiempo de 0,3 segundos.
- Cabe en GPU de consumo: no es posible confirmar con la información disponible.
- Opciones de despliegue: el único soporte documentado es el repositorio oficial (`ml-depth-pro`) y la interfaz Python `depth_pro`; no se mencionan integraciones con vLLM, llama.cpp ni otros runtime.
- Latencia y throughput: 0,3 segundos para una imagen de 2,25 megapíxeles en GPU estándar.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de comparación con modelos equivalentes (por ejemplo, Depth Anything, MiDaS o Metric3D). Por tanto, no es posible presentar una tabla comparativa fiable.

## Limitaciones y advertencias

- El checkpoint publicado es una implementación de referencia reentrenada; su rendimiento es similar al del artículo pero no idéntico. Los resultados pueden variar ligeramente.
- La licencia apple-amlr es una licencia propietaria de Apple. Antes de cualquier uso comercial es obligatorio revisar los términos exactos, ya que puede imponer restricciones.
- No se especifican sesgos conocidos ni limitaciones de precisión en dominios particulares (materiales reflectantes, oclusiones, condiciones de baja iluminación) en la información disponible.
- Al no ser un modelo de lenguaje, no es aplicable ni se han evaluado riesgos de alucinación o sesgos lingüísticos.

## Enlaces

- Hugging Face: https://huggingface.co/apple/DepthPro
- Artículo (arXiv): https://arxiv.org/abs/2410.02073
- Repositorio de código: https://github.com/apple/ml-depth-pro
- Página de investigación de Apple: https://machinelearning.apple.com/research/depth-pro
