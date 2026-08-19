# iamudit02/ayurvedic-herbs-vit

## Resumen

El modelo `iamudit02/ayurvedic-herbs-vit` es un clasificador de imágenes basado en Vision Transformer (ViT), específicamente un fine-tuning de `google/vit-base-patch16-224-in21k` sobre un conjunto de datos no especificado. Su objetivo es la identificación de hierbas ayurvédicas a partir de imágenes, una tarea relevante para aplicaciones de medicina tradicional, trazabilidad de ingredientes y asistencia a profesionales. Sin embargo, los resultados reportados por el autor indican una precisión de validación de solo 0,1865, lo que sugiere que el modelo está lejos de ser útil en producción.

El modelo fue generado automáticamente con el Trainer de Hugging Face, sin una documentación detallada del dataset ni del procedimiento de entrenamiento. A pesar de su licencia Apache 2.0 y su disponibilidad pública, su bajo rendimiento y la falta de información sobre los datos de entrenamiento limitan seriamente su aplicabilidad práctica. Es un ejemplo de un experimento de fine-tuning con resultados preliminares, más que un modelo listo para uso real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) base, patch size 16, resolución 224x224 |
| Parametros totales | 85.860.176 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, sin contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `google/vit-base-patch16-224-in21k`, un Vision Transformer estándar con 12 capas, 12 cabezas de atención, dimensión oculta de 768 y 86 millones de parámetros. La entrada son imágenes de 224x224 píxeles divididas en parches de 16x16. El entrenamiento se realizó con el Trainer de Hugging Face durante 3 épocas, con un learning rate de 2e-5, batch size de 16, optimizador AdamW y scheduler lineal. No se especifica el número de tokens de entrenamiento ni la composición del dataset; la model card indica "unknown dataset". No se menciona el uso de técnicas como RLHF o DPO, al ser un modelo de clasificación supervisada. La pérdida de validación final fue de 3,7111 y la precisión de 0,1865, lo que indica un sobreajuste severo o un dataset desbalanceado o demasiado pequeño.

## Capacidades

- Clasificación de imágenes: el modelo asigna una etiqueta a una imagen de entrada, presumiblemente una de varias categorías de hierbas ayurvédicas.
- No soporta tool calling, razonamiento multi-paso, ni generación de texto, al ser exclusivamente un clasificador visual.
- No tiene capacidades multilingües ni de procesamiento de lenguaje natural.
- No incluye modo de pensamiento, visión adicional o audio; es un modelo de visión puro.
- La precisión reportada (0,1865) es muy baja, por lo que su capacidad real de discriminación entre hierbas es prácticamente nula en la práctica.

## Casos de uso

- Identificación automatizada de hierbas en aplicaciones móviles: el modelo podría integrarse en una app de reconocimiento de plantas, pero su baja precisión lo hace inadecuado para uso real; cualquier implementación requeriría un reentrenamiento con un dataset etiquetado de calidad.
- Trazabilidad en la cadena de suministro de ingredientes ayurvédicos: se podría usar para verificar la autenticidad de muestras vegetales, pero el rendimiento actual no garantiza una clasificación fiable, por lo que no es recomendable en entornos de producción.
- Investigación académica: sirve como punto de partida para estudiar el fine-tuning de ViT en dominios específicos con pocos datos, aunque los resultados deben interpretarse con cautela.
- Demostraciones educativas: puede usarse en cursos de machine learning para ilustrar el proceso de fine-tuning de un transformer visual, pero no como solución funcional.
- Prototipos de baja fidelidad: para validar conceptos de interfaz o flujo de trabajo en aplicaciones de salud, aunque la precisión real sería insuficiente.
- Comparación de metodologías: útil para experimentos de aumento de datos, regularización o estrategias de entrenamiento, dado que el rendimiento actual es pobre y permite observar mejoras relativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección de model-index vacía. Los únicos datos de rendimiento son los de la evaluación durante el entrenamiento:

| Métrica | Valor |
|---|---|
| Pérdida de validación | 3,7111 |
| Precisión de validación | 0,1865 |

Estos valores indican un rendimiento muy bajo, cercano a una clasificación aleatoria si hubiera más de 5 clases. No hay comparación con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene ~86 millones de parámetros; en FP32 ocupa unos 344 MB, en FP16 ~172 MB. Con la entrada de 224x224, la VRAM necesaria es inferior a 1 GB, por lo que cabe en cualquier GPU moderna, incluso en CPUs con suficiente RAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como una NVIDIA GTX 1050 Ti o superior. Una RTX 3060 o superior sería más que suficiente.
- También puede ejecutarse en CPU, aunque la inferencia será más lenta (del orden de 100-200 ms por imagen en un procesador moderno).
- Opciones de despliegue: al ser un modelo de transformers, se puede servir con Hug Face Inference Endpoints, o mediante bibliotecas como ONNX Runtime, TorchScript o TensorRT. No es compatible con vLLM ni llama.cpp, ya que esos están orientados a modelos de lenguaje.
- Latencia estimada: en una GPU moderna (RTX 3090), la inferencia de un ViT base tarda ~5-10 ms por imagen; en CPU puede ser de 50-200 ms.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para clasificación de hierbas ayurvédicas. Existen otros ViT fine-tuned para plantas (como `plantnet-300K` o `google/vit-base-patch16-224` con fine-tuning en iNaturalist), pero no hay datos públicos de rendimiento comparativo. El modelo en cuestión tiene un rendimiento muy inferior a cualquier modelo preentrenado en ImageNet (que suele superar el 80% de precisión en tareas de clasificación general). No se puede establecer una comparativa fiable sin datos adicionales.

## Limitaciones y advertencias

- Precisión extremadamente baja (0,1865), lo que lo hace inutilizable para cualquier aplicación real de identificación de hierbas.
- Dataset de entrenamiento desconocido: no se especifica el número de clases, el número de imágenes por clase, ni el origen de los datos, lo que impide evaluar posibles sesgos.
- Riesgo de alucinación: al ser un clasificador, no genera texto, pero puede producir etiquetas incorrectas con alta confianza si se usa sin control.
- Sesgos potenciales: si el dataset está desbalanceado o contiene imágenes de un contexto geográfico limitado, el modelo puede fallar en entornos diferentes.
- Licencia Apache 2.0 permite uso comercial, pero el bajo rendimiento hace que su uso en producción sea desaconsejable sin un reentrenamiento completo.
- No hay garantías de soporte ni mantenimiento por parte del autor; el modelo se publicó como un experimento.
- La model card está incompleta: no se documentan los usos previstos, limitaciones ni detalles de entrenamiento, lo que dificulta su reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iamudit02/ayurvedic-herbs-vit
- Modelo base: https://huggingface.co/google/vit-base-patch16-224-in21k
- Proyecto relacionado en Kaggle (Dravya): https://www.kaggle.com/writeups/ankush0027/dravya-ai-powered-ayurvedic-herb-identification
- Artículo IEEE sobre identificación de hierbas ayurvédicas: https://ieeexplore.ieee.org/document/11506814/
- Asistente de IA para Ayurveda: https://dharmthummar.github.io/ai-ayurveda-assistant/
- Repositorio GitHub de asistente de hierbas ayurvédicas: https://github.com/vanshchaudhary2404/Ayurveda_AI_Assistant
