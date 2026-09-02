# mlx-community/moge-3-vitl-mlx-fp32

## Resumen

MoGe-3 (VITL) es un modelo de estimación de geometría monocular que predice mapas de puntos métricos, mapas de profundidad, mapas normales, máscaras de píxeles válidos e intrínsecas de cámara a partir de una única imagen. Este repositorio contiene un port a MLX (Apple Silicon) del checkpoint oficial en fp32, realizado por la comunidad MLX Community. El modelo original, desarrollado por Microsoft Research, fue presentado como ponencia oral en CVPR 2025 y destaca por su capacidad de recuperar geometría 3D precisa en imágenes abiertas de dominio general.

La relevancia de esta versión MLX radica en que permite ejecutar el modelo de forma nativa en hardware Apple (M1/M2/M3/M4) sin necesidad de GPU NVIDIA, aprovechando el framework MLX optimizado para estos chips. Con 370 millones de parámetros y un tamaño de repositorio de 1,5 GB, es un modelo ligero que puede desplegarse en entornos de escritorio y edge computing. La licencia MIT facilita su uso comercial y académico sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT-L (Vision Transformer Large) con refinamiento volumetrico disperso autoguiado |
| Parametros totales | 370.284.399 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada de imagen) |
| Tipos de cuantizacion | fp32 (unico formato publicado) |
| Idiomas soportados | no disponible (modelo de vision, no procesa texto) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La arquitectura se basa en un Vision Transformer de tamaño Large (ViT-L) que procesa la imagen de entrada y produce representaciones geometricas densas. El modelo incorpora un mecanismo de refinamiento volumetrico disperso autoguiado (self-guided sparse volumetric refinement) que mejora la precision en detalles finos de la geometria. No se dispone de informacion detallada sobre el dataset de entrenamiento ni el proceso de optimizacion (si se uso RLHF, DPO u otras tecnicas) en la documentacion publica del port MLX. El checkpoint original fue entrenado por Microsoft Research y validado en el repositorio oficial de MoGe.

El port MLX fue convertido con la herramienta mlx-vlm desde el checkpoint oficial `model.pt` en precision fp32. La validacion contra la referencia de torch (CPU, fp32) muestra mascaras de pixeles validos identicas y un error relativo de profundidad mediana inferior al 0,2%.

## Capacidades

- Estimacion de profundidad metrica monocular: genera mapas de profundidad con valores absolutos en metros.
- Mapas de puntos metricos: produce nubes de puntos 3D con coordenadas reales del mundo.
- Mapas normales: estima la orientacion de superficies en cada pixel.
- Mascaras de pixeles validos: identifica regiones de la imagen donde la prediccion es fiable.
- Intrinsecas de camara: estima la distancia focal y el centro optico a partir de una sola imagen.
- Refinamiento de detalles finos: el mecanismo de refinamiento volumetrico mejora la precision en bordes y estructuras pequenas.
- Sin soporte de tool calling ni agentes: es un modelo puramente de vision, no multimodal de texto.

## Casos de uso

- Reconstruccion 3D para realidad aumentada: el modelo puede generar nubes de puntos metricas a partir de fotos de un entorno, permitiendo colocar objetos virtuales con anclaje fisico correcto. Su precision metrica y las intrinsecas estimadas facilitan la integracion con motores de renderizado.
- Robotica y navegacion autonoma: los mapas de profundidad y normales permiten a un robot estimar distancias a obstaculos y orientacion de superficies en tiempo real. Al ser ligero (370M parametros), puede ejecutarse en dispositivos embebidos con Apple Silicon.
- Inspeccion industrial y control de calidad: la estimacion de geometria a partir de imagenes de piezas permite detectar deformaciones o defectos superficiales comparando con modelos CAD. Las mascaras de validez ayudan a filtrar zonas con poca fiabilidad.
- Fotogrametria de bajo coste: combinando varias imagenes, el modelo puede generar modelos 3D de objetos o escenas sin necesidad de equipos especializados. Las intrinsecas estimadas simplifican el calibrado.
- Vision artificial para vehiculos autonomos: los mapas de profundidad y normales son entradas utiles para sistemas de percepcion en conduccion autonoma, especialmente en entornos urbanos con geometria variada.
- Generacion de contenido 3D para videojuegos: a partir de una imagen conceptual, el modelo puede extraer la geometria basica para crear assets 3D iniciales que luego se refinan en herramientas de modelado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El port MLX solo reporta la validacion contra la referencia de torch: mascaras de pixeles validos identicas y error relativo de profundidad mediana inferior al 0,2% en CPU fp32. No hay datos de MMLU, HumanEval u otros benchmarks tipicos de modelos de lenguaje, ya que este es un modelo de vision.

## Requisitos de hardware

- VRAM estimada: el modelo en fp32 ocupa aproximadamente 1,5 GB en memoria. En Apple Silicon, la memoria unificada del sistema se comparte entre CPU y GPU, por lo que cualquier Mac con al menos 8 GB de RAM unificada puede ejecutarlo sin problemas.
- GPU recomendadas: cualquier chip Apple Silicon (M1, M2, M3, M4) con framework MLX. No requiere GPU NVIDIA.
- Compatibilidad con GPU de consumo: no aplica, ya que MLX solo funciona en Apple Silicon. En otras plataformas se debe usar el checkpoint original de PyTorch.
- Opciones de despliegue: MLX Python, mlx-vlm (para integracion con el pipeline de generacion), o exportacion a otros formatos si se desea.
- Latencia y throughput: no se han publicado mediciones especificas. Dado el tamano del modelo y la optimizacion de MLX, se espera una inferencia en tiempo real en chips M-series para resoluciones moderadas (p. ej., 512x512).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MoGe-3 (VITL) MLX | 370M | Imagen | MIT | MLX/safetensors | Port para Apple Silicon |
| MoGe-3 (VITL) original | 370M | Imagen | MIT | PyTorch | Checkpoint oficial de Microsoft |
| Depth Anything V2 | ~1.3B (ViT-L) | Imagen | Apache 2.0 | PyTorch | Modelo de profundidad relativa, no metrica |
| MiDaS | ~100M | Imagen | MIT | PyTorch | Estimacion de profundidad relativa, menos preciso |

La comparativa se basa en informacion publica general. No se dispone de benchmarks comparativos directos en la documentacion del port MLX.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo entrenado con imagenes de dominio abierto, puede tener un rendimiento inferior en imagenes con condiciones de iluminacion extremas, superficies reflectantes o texturas poco comunes.
- Riesgo de alucinacion geometrica: en regiones ambiguas o con oclusiones, el modelo puede predecir geometria incorrecta. Las mascaras de pixeles validos ayudan a identificar estas zonas, pero no eliminan el riesgo.
- Limitaciones de resolucion: la precision de los detalles finos depende de la resolucion de entrada. El parametro `resolution_level` en la inferencia permite ajustar este equilibrio, pero valores altos aumentan el coste computacional.
- Restricciones de licencia: la licencia MIT permite uso comercial sin restricciones, pero el port MLX no incluye garantias de soporte oficial por parte de Microsoft.
- Caveat de produccion: la validacion se realizo solo en CPU fp32 contra la referencia de torch. En entornos de produccion con MLX en GPU, se recomienda verificar la consistencia de los resultados, especialmente en precision fp16 o cuantizaciones.

## Enlaces

- Repositorio HuggingFace del port MLX: https://huggingface.co/mlx-community/moge-3-vitl-mlx-fp32
- Repositorio oficial de MoGe (Microsoft): https://github.com/microsoft/MoGe
- Sitio web de MLX Community: https://mlxcommunity.com/
- Framework MLX: https://mlx-framework.org/
- Repositorio de MLX en GitHub: https://github.com/ml-explore/mlx
