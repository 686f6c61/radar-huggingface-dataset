# calvinyong1/arabidopsis-segmentation-model

## Resumen

El modelo `calvinyong1/arabidopsis-segmentation-model` es un modelo de segmentación de imágenes basado en nnU-Net v2, diseñado específicamente para la segmentación de raíces de Arabidopsis thaliana en imágenes de fenotipado de alto rendimiento. Forma parte del framework ChronoRoot 2.0, una plataforma abierta impulsada por IA para fenotipado temporal 2D de plantas, desarrollada por un equipo internacional liderado por Nicolás Gaggion y colaboradores. El modelo resuelve el problema de extraer automáticamente la arquitectura del sistema radicular a partir de imágenes, una tarea crítica en biología vegetal para estudiar el crecimiento, la respuesta a estímulos y la genética de las raíces.

El modelo se distribuye con licencia MIT y un tamaño de repositorio de 0,8 GB. Aunque no se especifican detalles sobre el número de parámetros o la arquitectura interna, al estar basado en nnU-Net v2 se trata de una red neuronal convolucional (CNN) adaptativa que configura automáticamente la arquitectura, el preprocesamiento y el entrenamiento según el dataset. Su relevancia actual radica en que ofrece una solución lista para usar en fenotipado de raíces, con un framework completo (ChronoRoot 2.0) que incluye herramientas de análisis temporal y visualización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | nnU-Net v2 (red neuronal convolucional adaptativa) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (imagen, no texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica |
| Licencia | MIT |
| Formato de pesos | no disponible (probablemente PyTorch .pth o safetensors, no especificado) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura nnU-Net v2, un framework de segmentación semántica que configura automáticamente la topología de la red (profundidad, número de filtros, tamaño de kernel) y el pipeline de preprocesamiento (normalización, aumento de datos, resampling) en función de las características del dataset. nnU-Net v2 es una evolución del nnU-Net original, con mejoras en eficiencia computacional y soporte para datasets de mayor escala. El entrenamiento se realizó sobre el dataset `ngaggion/ChronoRoot2`, que contiene imágenes de Arabidopsis con anotaciones de segmentación de raíces. No se dispone de información pública sobre el número de imágenes, épocas, ni si se aplicaron técnicas como aumento de datos específicas, aunque es habitual en nnU-Net el uso de aumentos geométricos y de intensidad. Tampoco se han publicado detalles sobre el proceso de entrenamiento (pérdida, optimizador, métricas de validación).

## Capacidades

- Segmentación semántica de raíces de Arabidopsis en imágenes 2D, produciendo máscaras binarias o multiclase que distinguen la estructura radicular del fondo.
- Procesamiento de imágenes de fenotipado de plantas, incluyendo imágenes de alta resolución y series temporales.
- Integración con el framework ChronoRoot 2.0 para análisis temporal del crecimiento de raíces, permitiendo cuantificar longitud, ángulo, ramificación y otras métricas.
- Compatibilidad con el ecosistema nnU-Net, lo que facilita la inferencia en lote, la validación cruzada y la integración en pipelines de investigación.
- No soporta tool calling, agentes ni razonamiento multi-step, al ser un modelo de visión puro.

## Casos de uso

- Fenotipado de alto rendimiento en biología vegetal: el modelo permite procesar automáticamente cientos o miles de imágenes de Arabidopsis para extraer la arquitectura de raíces, reemplazando la anotación manual y acelerando estudios de genética, fisiología y respuesta a estrés.
- Análisis temporal del crecimiento radicular: al integrarse con ChronoRoot 2.0, se pueden analizar series de imágenes a lo largo del tiempo para estudiar la dinámica de crecimiento, la plasticidad fenotípica y los efectos de tratamientos (hormonas, nutrientes, patógenos).
- Investigación en mejora genética de cultivos: aunque el modelo está entrenado en Arabidopsis, la metodología puede adaptarse a otras especies, sirviendo como base para transferencia de aprendizaje en raíces de cultivos como trigo o maíz.
- Validación de hipótesis en biología de sistemas: los investigadores pueden usar las máscaras generadas para alimentar modelos de simulación del crecimiento radicular o para correlacionar fenotipos con datos transcriptómicos.
- Automatización de laboratorios de fenotipado: el modelo puede desplegarse en servidores locales o en la nube para procesar imágenes en tiempo real durante experimentos, reduciendo la intervención humana.
- Educación y divulgación: al ser de código abierto con licencia MIT, puede utilizarse en cursos de visión por computador aplicada a la biología, permitiendo a estudiantes explorar la segmentación de imágenes científicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de rendimiento (p. ej., Dice score, IoU) sobre conjuntos de validación o test. Tampoco se han encontrado comparativas con otros modelos de segmentación de raíces en la documentación pública.

## Requisitos de hardware

- No se dispone de información oficial sobre requisitos de hardware. Dado que se trata de un modelo nnU-Net v2 con un tamaño de repositorio de 0,8 GB, se estima que la inferencia puede ejecutarse en GPUs con al menos 8 GB de VRAM (p. ej., NVIDIA RTX 2070, RTX 3060, Tesla T4) para imágenes de resolución moderada (512x512 o inferior).
- Para imágenes de alta resolución o procesamiento en lote, se recomienda una GPU con 16 GB o más (RTX 3090, A100, V100).
- El modelo puede ejecutarse en CPU para imágenes pequeñas, aunque con una latencia significativamente mayor.
- Opciones de despliegue: al ser nnU-Net v2, se puede usar directamente con la librería `nnunetv2` en Python. También es posible exportar a ONNX para inferencia en entornos de producción (TensorRT, OpenVINO), aunque no se ha documentado este proceso.
- No se han publicado datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para segmentación de raíces de Arabidopsis. Existen otros enfoques en la literatura, como modelos basados en U-Net clásico o en arquitecturas de transformers (p. ej., SegFormer), pero no hay datos públicos que permitan una comparación cuantitativa. El modelo se distingue por su integración con el framework ChronoRoot 2.0, que aporta herramientas de análisis temporal y visualización, y por su licencia MIT que facilita su adopción.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en imágenes de Arabidopsis thaliana; su rendimiento en otras especies o condiciones de iluminación/background puede degradarse significativamente.
- No se han documentado sesgos específicos, pero es probable que el modelo tenga menor precisión en imágenes con raíces muy densas, solapadas o con bajo contraste.
- Al ser un modelo de segmentación, no presenta riesgo de alucinación en el sentido de generación de texto, pero puede producir falsos positivos o negativos en las máscaras, especialmente en regiones ambiguas.
- La licencia MIT permite uso comercial y modificación, pero se recomienda citar el paper original (arXiv:2504.14736) en publicaciones científicas.
- No se proporcionan garantías de rendimiento en producción; es necesario validar el modelo con datos propios antes de un despliegue crítico.
- El tamaño del repositorio (0,8 GB) sugiere que los pesos están en formato de precisión completa (FP32); para despliegue en dispositivos con recursos limitados, se requeriría cuantización, pero no se ofrecen versiones cuantizadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/calvinyong1/arabidopsis-segmentation-model
- Repositorio GitHub de ChronoRoot 2.0: https://github.com/ChronoRoot/ChronoRoot2
- Sitio web de ChronoRoot: https://chronoroot.github.io/
- Paper (arXiv): https://arxiv.org/abs/2504.14736
- Repositorio GitHub del autor (ArabidopsisAnalysisV2): https://github.com/calvinyong1/ArabidopsisAnalysisV2
