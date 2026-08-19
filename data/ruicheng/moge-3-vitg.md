# Ruicheng/moge-3-vitg

## Resumen

El modelo `Ruicheng/moge-3-vitg` es una implementación open source de la tercera versión de MoGe, un sistema de visión por computadora desarrollado originalmente por Microsoft Research (presentado como CVPR 2025 Oral). MoGe se especializa en recuperar geometría 3D a partir de imágenes monocular de dominio abierto, generando mapas de puntos métricos, mapas de profundidad métrica, mapas de normales y campo de visión (FOV) de la cámara. Esta versión concreta utiliza un backbone ViT-G (Vision Transformer Gigantic), lo que la convierte en una variante de alta capacidad dentro de la familia MoGe.

El modelo resuelve el problema de estimación de geometría 3D a partir de una sola imagen, una tarea fundamental para aplicaciones como robótica, realidad aumentada, reconstrucción 3D y navegación autónoma. Su relevancia actual radica en que ofrece una alternativa de código abierto con licencia MIT, lo que permite su integración en proyectos comerciales y de investigación sin restricciones de uso. La arquitectura incorpora un refinador iterativo que re-voxeliza la geometría actualizada en cada paso, mejorando progresivamente los bordes de las superficies. El tamaño del repositorio es de 5.0 GB, lo que sugiere que contiene los pesos completos del modelo en formato de alta precisión.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-G) con decodificador para mapas de puntos, profundidad, normales y FOV |
| Parametros totales | no disponible (estimación: >1B, típico de ViT-G) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible (se espera soporte para FP16, FP32; cuantización no documentada) |
| Idiomas soportados | no disponible (modelo de visión, no procesa lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors (presumiblemente, aunque no se especifica en la información proporcionada) |

## Arquitectura y entrenamiento

MoGe-3 emplea un backbone Vision Transformer (ViT) en su variante Gigantic (ViT-G), que procesa la imagen de entrada y extrae características visuales de alta resolución. Sobre este backbone, el modelo cuenta con un decodificador que predice simultáneamente mapas de puntos métricos (metric point maps), mapas de profundidad métrica, mapas de normales y el campo de visión de la cámara. La innovación principal de MoGe-3 respecto a versiones anteriores es un bucle de refinamiento iterativo: cada iteración re-voxeliza la geometría actualizada, lo que afina progresivamente los límites de las superficies. Con K=0, el modelo iguala el tiempo de ejecución de MoGe-2; con un refinador de 3 pasos añade solo 121 ms de sobrecoste. El entrenamiento se realiza con K=3, pero el modelo generaliza a K=7 en inferencia sin degradación, y puede escalar a más pasos con un backbone ViT-G.

Los detalles sobre el conjunto de datos de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO) no están disponibles en la información proporcionada. Al ser un modelo de visión, no se aplican técnicas de alineación de lenguaje como RLHF; el entrenamiento se centra en la supervisión geométrica a partir de datos de imágenes y sus correspondientes anotaciones 3D.

## Capacidades

- Estimación de geometría 3D monocular: genera mapas de puntos métricos, mapas de profundidad métrica, mapas de normales y FOV de cámara a partir de una sola imagen.
- Refinamiento iterativo: el modelo puede aplicar múltiples pasos de refinamiento (hasta 7) para mejorar la precisión de los bordes y la coherencia geométrica.
- Generalización a dominio abierto: diseñado para funcionar con imágenes arbitrarias, no limitado a un dominio específico.
- Escalabilidad: el backbone ViT-G permite manejar imágenes de alta resolución y capturar detalles finos.
- Integración con otros sistemas: al ser un modelo de visión puro, puede combinarse con modelos de lenguaje para tareas de razonamiento espacial o generación de descripciones 3D.

## Casos de uso

- Reconstrucción 3D a partir de fotos: el modelo puede convertir una fotografía en una nube de puntos métrica, útil para crear modelos 3D de objetos o escenas en aplicaciones de diseño y arquitectura.
- Navegación autónoma y robótica: los mapas de profundidad y normales generados permiten a robots y vehículos autónomos percibir el entorno en 3D, evitando obstáculos y planificando rutas.
- Realidad aumentada y mixta: la estimación de profundidad y FOV facilita la colocación de objetos virtuales en escenas reales con mayor precisión, mejorando la experiencia de usuario en aplicaciones AR.
- Inspección industrial y control de calidad: la estimación de geometría a partir de imágenes de piezas permite detectar deformaciones o defectos de fabricación sin necesidad de escáneres 3D costosos.
- Análisis médico y biológico: la reconstrucción de superficies a partir de imágenes endoscópicas o microscópicas puede ayudar en la visualización de tejidos y estructuras anatómicas.
- Generación de contenido 3D para videojuegos y cine: los mapas de profundidad y normales se utilizan como entrada para motores de renderizado, permitiendo efectos de iluminación y sombreado realistas a partir de imágenes 2D.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La página del proyecto MoGe (qft-333.github.io) menciona que el modelo con K=3 generaliza a K=7 sin degradación, pero no proporciona métricas numéricas concretas (como error de profundidad relativa, precisión de normales, etc.) para esta versión específica con backbone ViT-G. Se recomienda consultar el repositorio oficial de Microsoft MoGe en GitHub para posibles resultados comparativos.

## Requisitos de hardware

- VRAM estimada: el tamaño del repositorio es de 5.0 GB, lo que sugiere que los pesos en FP16 ocupan aproximadamente 5 GB. Para inferencia en FP16, se estima un requisito mínimo de 8-10 GB de VRAM, aunque con cuantización (por ejemplo, INT8) podría reducirse a 5-6 GB.
- GPU recomendadas: para un rendimiento óptimo, se recomienda una GPU con al menos 16 GB de VRAM, como NVIDIA RTX 4080/4090, A100, o H100. Para pruebas rápidas, una RTX 3060 de 12 GB podría ser suficiente con cuantización.
- Compatibilidad con GPU de consumo: sí, es posible ejecutar el modelo en GPU de consumo de gama alta (RTX 3090/4090) con FP16 o cuantización INT8, aunque la latencia será mayor que en GPUs de datacenter.
- Opciones de despliegue: al ser un modelo de visión, se puede servir mediante frameworks como PyTorch, ONNX Runtime o TensorRT. No se mencionan integraciones específicas con vLLM u Ollama (orientados a modelos de lenguaje). Se puede usar un servidor HTTP personalizado o integrarse en pipelines de procesamiento de imágenes.
- Latencia y throughput: no se dispone de datos oficiales. El refinamiento de 3 pasos añade 121 ms de sobrecoste según la documentación, por lo que la latencia total dependerá del hardware y de la resolución de entrada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MoGe-3 (este) | ViT-G | no disponible | no aplica | MIT | HuggingFace |
| MoGe-2 (versión anterior) | ViT-L o similar | no disponible | no aplica | MIT | GitHub / HuggingFace |
| Depth Anything V2 | ViT-L/B | ~300M | no aplica | Apache 2.0 | HuggingFace |

La comparativa se basa en información pública de los proyectos. MoGe-3 se distingue por su refinamiento iterativo y su capacidad de generar mapas de puntos métricos además de profundidad y normales. Depth Anything V2 es un modelo popular para estimación de profundidad monocular, pero no genera mapas de puntos ni FOV. No se dispone de datos numéricos de rendimiento para una comparación cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo de visión entrenado en datos de dominio abierto, puede tener un rendimiento inferior en imágenes con condiciones extremas (iluminación muy baja, oclusiones severas, superficies reflectantes o transparentes).
- Riesgo de alucinación: en geometría 3D, el modelo puede producir estimaciones incorrectas en regiones ambiguas de la imagen, especialmente en zonas con poca textura o patrones repetitivos.
- Limitaciones de contexto: al ser un modelo de visión, no procesa lenguaje; cualquier aplicación que requiera interacción multimodal debe combinar este modelo con un LLM externo.
- Restricciones de licencia: la licencia MIT permite uso comercial sin restricciones, pero el usuario debe verificar que los pesos y la implementación no incluyan componentes con licencias más restrictivas (por ejemplo, dependencias de terceros).
- Advertencias para producción: la latencia del refinamiento iterativo puede ser un cuello de botella en aplicaciones en tiempo real; se recomienda evaluar el número de pasos K según el caso de uso. Además, el modelo no incluye mecanismos de calibración de incertidumbre, por lo que las salidas deben validarse en aplicaciones críticas.

## Enlaces

- HuggingFace: https://huggingface.co/Ruicheng/moge-3-vitg
- Repositorio GitHub de Microsoft MoGe: https://github.com/microsoft/MoGe
- Página del proyecto MoGe-3: https://qft-333.github.io/moge3page/
- Página personal del autor (Ruicheng Li): https://qft-333.github.io/
- Versión anterior en HuggingFace (MoGe-ViT-L): https://huggingface.co/Ruicheng/moge-vitl
