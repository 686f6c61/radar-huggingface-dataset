# donnoot/marigold-depth-v1-0

## Resumen

Marigold Depth v1-0 es un modelo de estimación de profundidad monocular desarrollado por el grupo de investigación PRS de ETH Zurich (Bingxin Ke, Anton Obukhov, Shengyu Huang, Nando Metzger, Rodrigo Caye Daudt y Konrad Schindler). El modelo reutiliza un generador de imágenes basado en difusión latente (Stable Diffusion 2) y lo afina para predecir mapas de profundidad a partir de una única imagen, sin necesidad de entrenamiento específico por dominio. Su principal innovación es aprovechar el conocimiento visual aprendido por los modelos generativos para tareas de análisis denso de imágenes, logrando resultados competitivos en escenarios "in the wild" con cero disparos.

El modelo tiene 865,9 millones de parámetros y se distribuye con licencia Apache 2.0. Está diseñado para funcionar con el pipeline `MarigoldDepthPipeline` de la librería diffusers y produce mapas de profundidad invariantes a la afinidad (es decir, relativos, no métricos). La versión v1-0 es la original publicada en CVPR 2024 (con mención a mejor paper), y existe una versión posterior v1-1 con configuraciones optimizadas para distintos números de pasos de denoising, por lo que v1-0 queda parcialmente superada para proyectos nuevos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion latente (UNet) afinada desde Stable Diffusion 2 |
| Parametros totales | 865.922.244 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica (entrada de imagen, resolución efectiva ~768 píxeles) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Marigold Depth v1-0 parte del modelo de difusión latente Stable Diffusion 2 y lo afina para la tarea de estimación de profundidad monocular. La arquitectura es un UNet dentro de un espacio latente, con un codificador y decodificador de imágenes (VAE) que se mantienen congelados durante el afinado. El proceso de entrenamiento, descrito en el paper "Repurposing Diffusion-Based Image Generators for Monocular Depth Estimation", consiste en convertir la predicción de profundidad en una tarea de denoising: se añade ruido al mapa de profundidad y el modelo aprende a eliminarlo condicionado por la imagen de entrada. Esto permite aprovechar las representaciones visuales ricas del modelo generativo preentrenado.

El entrenamiento se realizó sobre conjuntos de datos de profundidad existentes, aunque la información disponible no especifica el número exacto de tokens ni la composición del dataset. El modelo está diseñado para usar el scheduler DDIM con entre 10 y 50 pasos de denoising, y admite una configuración de un solo paso si se modifica el parámetro `timestep_spacing` a `"trailing"`. La salida es un mapa de profundidad con valores entre 0 y 1, donde 0 representa el plano cercano y 1 el lejano según la elección del modelo. Cuando se realiza un ensamblado (ensemble) con más de 2 predicciones, también se genera un mapa de incertidumbre.

## Capacidades

- Estimación de profundidad monocular a partir de una única imagen, con salida invariante a la afinidad (valores relativos entre 0 y 1).
- Funcionamiento cero disparo (zero-shot) en imágenes "in the wild", sin necesidad de afinado por dominio.
- Resolución de entrada efectiva de aproximadamente 768 píxeles en el lado mayor; imágenes mayores deben redimensionarse para obtener resultados óptimos.
- Soporte para ensamblado de múltiples predicciones, lo que mejora la precisión y proporciona un mapa de incertidumbre asociado.
- Compatible con el pipeline `MarigoldDepthPipeline` de diffusers, lo que permite integrarlo fácilmente en flujos de trabajo existentes.
- Capacidad de procesar imágenes de cualquier resolución, aunque con degradación si se supera el tamaño efectivo.
- No incluye capacidades de texto, código, visión multimodal ni tool calling; es exclusivamente un modelo de análisis de imagen para profundidad.

## Casos de uso

- Robótica y navegación autónoma: el mapa de profundidad relativo permite estimar distancias a obstáculos en entornos interiores o exteriores, sirviendo como entrada para planificación de rutas en robots móviles o drones.
- Realidad aumentada y virtual: la profundidad estimada se usa para oclusión correcta de objetos virtuales sobre escenas reales, mejorando la inmersión en aplicaciones de AR/VR.
- Edición de imágenes y posprocesado: permite aplicar efectos de desenfoque de profundidad (bokeh), reiluminación o composición de objetos conociendo la estructura espacial de la escena.
- Generación de mapas de profundidad para modelos 3D: a partir de una fotografía, se puede obtener una aproximación de profundidad para reconstrucción 3D o para texturizado de mallas.
- Análisis de imágenes médicas o industriales: en entornos controlados, la estimación de profundidad puede ayudar a medir dimensiones relativas o detectar anomalías en superficies.
- Automatización de flujos de visión por computador: al ser un modelo de un solo paso (con configuración trailing), puede integrarse en pipelines en tiempo real para tareas de inspección o monitoreo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Aunque el modelo está respaldado por el paper de CVPR 2024, los datos numéricos de rendimiento (como error absoluto relativo, RMSE, etc.) no se incluyen en la ficha técnica ni en los resultados de búsqueda proporcionados. Para consultar métricas detalladas se recomienda revisar el paper original o el repositorio oficial.

## Requisitos de hardware

- El modelo tiene 865,9 millones de parámetros. En precisión fp32, los pesos ocupan aproximadamente 3,5 GB, aunque el repositorio completo (16,8 GB) incluye otros archivos como el VAE, scheduler y configuraciones. Con cuantización a fp16 o int8, el tamaño se reduce significativamente.
- Para inferencia con diffusers en GPU, se estima que una tarjeta con al menos 8 GB de VRAM es suficiente para procesar imágenes de 768x768 píxeles con el modelo en fp16. GPUs como la NVIDIA RTX 3060, RTX 4060 o superiores serían adecuadas.
- No se dispone de datos oficiales sobre latencia o throughput. El tiempo de inferencia depende del número de pasos de denoising (10-50 por defecto) y del hardware. Con la configuración de un solo paso, la latencia puede ser muy baja, adecuada para aplicaciones casi en tiempo real.
- Opciones de despliegue: el modelo se integra con diffusers (Python) y puede servirse mediante TGI (Text Generation Inference) o vLLM, aunque estos frameworks están más orientados a modelos de lenguaje; para este caso se recomienda usar directamente la API de diffusers o exportar a ONNX para inferencia optimizada. También es posible ejecutarlo en CPU, aunque con tiempos mucho mayores.

## Comparativa con modelos similares

No se dispone de datos comparativos numéricos en la información proporcionada. Existen otros modelos de estimación de profundidad monocular como MiDaS, DPT o ZoeDepth, pero no se han incluido métricas de rendimiento en los resultados de búsqueda. Se recomienda consultar el paper original de Marigold para ver comparativas con estos métodos. Cualitativamente, Marigold se distingue por su enfoque generativo basado en difusión, que le permite generalizar mejor en escenarios diversos, mientras que MiDaS y DPT son redes convolucionales o transformers entrenadas específicamente para profundidad.

## Limitaciones y advertencias

- La salida es invariante a la afinidad: no proporciona distancias métricas absolutas, solo una escala relativa entre planos cercano y lejano. Esto limita su uso en aplicaciones que requieren medidas exactas.
- La resolución efectiva está limitada a ~768 píxeles; imágenes de mayor resolución deben redimensionarse, lo que puede perder detalles finos en escenas complejas.
- El modelo hereda sesgos del Stable Diffusion 2 subyacente, que pueden manifestarse en errores en ciertos tipos de imágenes (por ejemplo, texturas repetitivas, superficies reflectantes o escenas con poca iluminación).
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo deriva de Stable Diffusion 2, que tiene cláusulas de uso responsable; se recomienda revisar los términos de la licencia original de Stability AI.
- La versión v1-0 está parcialmente superada por la v1-1, que ofrece configuraciones optimizadas para distintos números de pasos; para proyectos nuevos se sugiere usar la v1-1.
- No se han publicado resultados de benchmarks en la información disponible, por lo que la evaluación del rendimiento debe basarse en el paper original o en pruebas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/donnoot/marigold-depth-v1-0 (copia del original prs-eth/marigold-depth-v1-0)
- Repositorio oficial en GitHub: https://github.com/prs-eth/marigold
- Página del proyecto: https://marigoldmonodepth.github.io/
- Paper CVPR 2024: https://arxiv.org/abs/2312.02145
- Extensión en revista: https://arxiv.org/abs/2505.09358
- Demo interactiva en Spaces: https://huggingface.co/spaces/prs-eth/marigold
- Documentación de diffusers para Marigold: https://huggingface.co/docs/diffusers/using-diffusers/marigold_usage
- Modelo v1-1 (recomendado para proyectos nuevos): https://huggingface.co/prs-eth/marigold-depth-v1-1
