# Michael-Jiang/See-the-Invisible-with-SWIR

## Resumen

El modelo **See-the-Invisible-with-SWIR** es un sistema de mejora de imágenes de infrarrojo de onda corta (SWIR) mediante denoising basado en aprendizaje profundo. Desarrollado por Haiyang Jiang, Hongjun Wang y Yinqiang Zheng, y presentado en el ICCV 2025 Workshop Responsible Imaging, aborda el problema del ruido inherente a los sensores SWIR de InGaAs, que degrada la calidad de las imágenes en aplicaciones como vigilancia nocturna o inspección industrial. La arquitectura empleada es una U-Net residual de dos etapas con FPN, entrenada con modelos de ruido sintético (P-G, ELD y SFRN) para generalizar a condiciones reales. El repositorio oficial en HuggingFace (Michael-Jiang/See-the-Invisible-with-SWIR) contiene los checkpoints de todos los experimentos publicados, junto con metadatos de verificación y documentación de procedencia. La licencia es MIT, lo que permite uso comercial y modificación, aunque los datos de entrenamiento (imágenes SID) no se redistribuyen.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net residual de dos etapas con FPN |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de imagen) |
| Licencia | MIT |
| Formato de pesos | .bin (PyTorch) |

## Arquitectura y entrenamiento

El modelo se basa en una U-Net residual de dos etapas, con una pirámide de características (FPN) que permite procesar información multiescala. La primera etapa se encarga de una estimación inicial del ruido y la segunda refina la imagen limpia. El entrenamiento utiliza ruido sintético generado mediante tres modelos de ruido diferentes: P-G (Poisson-Gaussian), ELD y SFRN, que simulan las características de ruido real de los sensores SWIR. No se especifica el número exacto de imágenes de entrenamiento ni el procedimiento de optimización (pérdida, épocas, etc.), pero el paper original detalla el método completo. La innovación principal reside en el modelado sintético del ruido, que permite entrenar sin necesidad de pares de imágenes reales limpias/ruidosas, un problema habitual en este dominio.

## Capacidades

- Denoising de imágenes SWIR: reduce el ruido de sensores InGaAs manteniendo detalles finos y texturas.
- Mejora de contraste y visibilidad en condiciones de baja iluminación, aprovechando las propiedades espectrales de la banda SWIR.
- Restauración de estructuras y objetos que son invisibles en el rango visible (por ejemplo, a través de neblina o polvo).
- Procesamiento de imágenes en bruto (raw imaging) con formatos típicos de sensores SWIR.
- No incluye capacidades de generación de texto, razonamiento, tool calling ni visión general; se limita a transformación imagen-a-imagen.

## Casos de uso

- Vigilancia nocturna: el modelo permite recuperar detalles en escenas oscuras donde las cámaras SWIR capturan información útil pero con ruido elevado. Se integraría como etapa de preprocesado en sistemas de videovigilancia.
- Inspección industrial: en entornos de fabricación, la SWIR puede revelar defectos internos o contaminantes que no son visibles en el espectro visible. El denoising mejora la fiabilidad de los sistemas automáticos de control de calidad.
- Imagen médica no invasiva: la SWIR se usa para visualizar tejidos a través de la piel; un denoising eficaz permite diagnósticos más precisos en dispositivos portátiles.
- Teledetección y monitorización ambiental: imágenes SWIR de satélites o drones pueden verse afectadas por ruido del sensor; aplicar este modelo mejora la interpretación de datos atmosféricos o de vegetación.
- Fotografía computacional: integración en cámaras comerciales con sensores SWIR para ofrecer modos de captura mejorados en condiciones de poca luz.
- Investigación en visión artificial: como herramienta de preprocesado en pipelines de detección y segmentación sobre imágenes SWIR, aumentando la precisión de modelos posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper del ICCV 2025 presenta evaluaciones cualitativas y cuantitativas, pero los números específicos no están incluidos en la ficha de HuggingFace ni en los resultados de búsqueda web consultados.

## Requisitos de hardware

- El tamaño del repositorio es de 0.7 GB, lo que sugiere que los pesos del modelo son relativamente ligeros (probablemente decenas de millones de parámetros, aunque no se confirma).
- VRAM estimada: no disponible oficialmente, pero por el tamaño de los checkpoints, una GPU con 4-8 GB de VRAM debería ser suficiente para inferencia en imágenes de tamaño moderado (por ejemplo, 512x512).
- GPU recomendadas: cualquier GPU moderna con soporte CUDA, desde una RTX 3060 hasta una A100. También puede ejecutarse en CPU, aunque con mayor latencia.
- Opciones de despliegue: al ser un modelo PyTorch estándar, se puede servir con TorchServe, ONNX Runtime o mediante scripts Python personalizados. No se mencionan integraciones con vLLM, Ollama o TGI (no son aplicables a modelos de visión).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre comparativas con otros modelos de denoising SWIR en los datos proporcionados. El paper original puede incluir comparaciones con métodos clásicos y otros basados en aprendizaje, pero no están accesibles en esta ficha. Se recomienda consultar la publicación para obtener dicha comparativa.

## Limitaciones y advertencias

- El modelo se entrena con ruido sintético (P-G, ELD, SFRN) y puede no generalizar perfectamente a ruido real de sensores SWIR con características distintas a las simuladas.
- El checkpoint `two_stage_shared_task.bin` tiene un problema de procedencia: comparte espacio de nombres con otro experimento, y su etiqueta no identifica de forma única el experimento original. Se debe revisar `docs/checkpoint_provenance.md` antes de usarlo en producción o citarlo.
- Los datos de entrenamiento (imágenes SID) no se redistribuyen; el usuario debe obtenerlos por separado si desea reproducir el entrenamiento.
- No se especifican limitaciones de resolución máxima de entrada ni de tamaño de lote; se asume que depende de la memoria de la GPU.
- Al ser un modelo de imagen, no tiene capacidades de lenguaje ni interacción multimodal; su uso se limita a transformaciones imagen-a-imagen.
- La licencia MIT permite uso comercial, pero el usuario es responsable de cumplir con las licencias de los datos de entrenamiento si los obtiene.

## Enlaces

- [HuggingFace - Michael-Jiang/See-the-Invisible-with-SWIR](https://huggingface.co/Michael-Jiang/See-the-Invisible-with-SWIR)
- [GitHub - MichaelHYJiang/See-the-Invisible-with-SWIR](https://github.com/MichaelHYJiang/See-the-Invisible-with-SWIR)
- [Paper en ICCV 2025 Workshop](https://openaccess.thecvf.com/content/ICCV2025W/Responsible-Imaging/html/Jiang_See_the_Invisible_with_SWIR_Learning_to_Enhance_via_Synthetic_ICCVW_2025_paper.html)
- [Artículo en IEEE Xplore](https://ieeexplore.ieee.org/abstract/document/11375423)
- [Página en Semantic Scholar](https://www.semanticscholar.org/paper/See-the-Invisible-with-SWIR%3A-Learning-to-Enhance-Jiang-Wang/f712285af16f1ce918b5b718fd4306493c0abbfd)
