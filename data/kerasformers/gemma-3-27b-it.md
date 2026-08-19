# kerasformers/gemma-3-27b-it

## Resumen

Este repositorio contiene una conversión íntegra a Keras 3 del modelo `google/gemma-3-27b-it`, realizada por el equipo de kerasformers. El objetivo es ofrecer una implementación unificada que se ejecuta sin modificaciones sobre TensorFlow, PyTorch o JAX, manteniendo las mismas capacidades del checkpoint original instruido (instruction-tuned) de Google. Se trata de un modelo multimodal de tipo imagen + texto a texto, capaz de procesar imágenes y generar respuestas textuales, con pesos almacenados en bfloat16.

La relevancia de esta conversión radica en que permite a desarrolladores que trabajan con el ecosistema Keras 3 utilizar un modelo de 27 mil millones de parámetros con una ventana de contexto de 128.000 tokens (según las especificaciones del modelo base), sin depender de implementaciones propietarias. Además, incluye soporte para cuantización int8 y carga en float32, lo que facilita su despliegue en entornos con recursos limitados. El repositorio forma parte de una colección más amplia que cubre todos los tamaños de Gemma 3 (270M, 1B, 4B, 12B y 27B).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto + imagen), basado en el modelo original google/gemma-3-27b-it |
| Parametros totales | 27 mil millones (aprox., según el modelo base; no se especifica en este repo) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 128.000 tokens (según el modelo original; no confirmado en este repo) |
| Tipos de cuantizacion | bfloat16 (por defecto), int8, float32 |
| Idiomas soportados | en (declarado en la model card; el modelo original soporta más idiomas) |
| Licencia | gemma (licencia propietaria de Google con restricciones) |
| Formato de pesos | bfloat16 (formato de Keras 3) |

## Arquitectura y entrenamiento

Este repositorio no introduce cambios en la arquitectura del modelo original, sino que proporciona una conversión a Keras 3 del checkpoint `google/gemma-3-27b-it`. El modelo base es un transformer multimodal con atención local y global, diseñado por Google para procesar texto e imágenes de forma conjunta. El checkpoint instruido (it) ha sido ajustado mediante técnicas de aprendizaje por refuerzo con retroalimentación humana (RLHF) para seguir instrucciones y mantener conversaciones coherentes.

No se proporciona información detallada sobre el proceso de entrenamiento en este repositorio. Los detalles técnicos del modelo original están documentados en el artículo académico referenciado (arXiv:2503.19786). La conversión a Keras 3 mantiene los pesos originales en bfloat16 y permite cargarlos en float32 o cuantizarlos a int8, sin modificar la arquitectura subyacente.

## Capacidades

- Procesamiento multimodal: acepta entradas que combinan imágenes y texto, y genera respuestas textuales (pipeline `image-text-to-text`).
- Generación de texto conversacional: al ser el checkpoint instruido, está optimizado para seguir instrucciones y mantener diálogos multi-turno.
- Compatibilidad multi-backend: la misma implementación se ejecuta en TensorFlow, PyTorch y JAX, seleccionable mediante la variable de entorno `KERAS_BACKEND`.
- Carga flexible: por defecto en bfloat16, con opción de cargar en float32 (precisión completa) o cuantizar a int8 para reducir el uso de memoria.
- Integración con el ecosistema Keras: se puede usar directamente con las APIs de Keras 3 y con la librería kerasformers.
- Soporte para cargar pesos comunitarios o del Hub mediante el prefijo `hf:` (por ejemplo, `hf:google/gemma-3-27b-it`).

## Casos de uso

- Descripción automática de imágenes: el modelo puede generar descripciones detalladas de fotografías o ilustraciones, útil para accesibilidad o catalogación de contenido visual.
- Asistentes conversacionales multimodales: permite construir chatbots que entienden tanto texto como imágenes, por ejemplo para atención al cliente donde el usuario envía capturas de pantalla.
- Análisis de documentos escaneados: combinando OCR con el modelo, se pueden extraer y resumir información de documentos con elementos visuales.
- Generación de texto a partir de diagramas o gráficos: el modelo puede interpretar representaciones visuales y producir explicaciones textuales.
- Prototipado rápido en investigación: al ser una implementación en Keras 3, facilita la experimentación con técnicas de fine-tuning o evaluación en entornos académicos.
- Desarrollo de aplicaciones multiplataforma: gracias a la compatibilidad con TensorFlow, PyTorch y JAX, se puede integrar en pipelines existentes sin cambiar de framework.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Este repositorio se limita a la conversión de pesos y no incluye evaluaciones comparativas con otros modelos.

## Requisitos de hardware

- Tamaño del repositorio: 54,9 GB, correspondiente a los pesos en bfloat16.
- VRAM estimada para inferencia en bfloat16: se requiere aproximadamente 60 GB de memoria de GPU (estimación basada en el tamaño de los pesos, más overhead de activaciones y caché).
- Con cuantización int8, el uso de memoria se reduce aproximadamente a la mitad, pudiendo caber en GPUs con 32 GB de VRAM (estimación orientativa).
- GPUs recomendadas: NVIDIA A100 (40/80 GB), H100 (80 GB), o GPUs de consumo de gama alta como RTX 4090 (24 GB) únicamente con cuantización int8.
- Opciones de despliegue: la librería kerasformers permite la carga directa del modelo; también es posible exportar los pesos a otros formatos (por ejemplo, mediante conversión) para su uso con vLLM, llama.cpp u otras herramientas, aunque no se documenta explícitamente en este repositorio.
- Latencia y throughput: no se proporcionan datos específicos. El rendimiento dependerá del hardware y de la configuración de generación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Implementacion |
|---|---|---|---|---|
| kerasformers/gemma-3-27b-it (este) | 27B | 128k (según base) | gemma | Keras 3 (TF/Torch/JAX) |
| google/gemma-3-27b-it (original) | 27B | 128k | gemma | Transformers (PyTorch/JAX) |
| kerasformers/gemma-3-12b-it | 12B | 128k (según base) | gemma | Keras 3 |
| kerasformers/gemma-3-4b-it | 4B | 128k (según base) | gemma | Keras 3 |

No se dispone de datos de rendimiento comparativo en este repositorio. La principal diferencia entre este modelo y el original radica en la implementación (Keras 3 frente a la oficial de Transformers), manteniendo las mismas capacidades y licencia.

## Limitaciones y advertencias

- Licencia restrictiva: la licencia `gemma` es propietaria de Google e impone condiciones específicas para uso comercial, incluyendo restricciones de uso y requisitos de atribución. Es obligatorio aceptar los términos en la página del modelo original antes de su uso.
- Idioma declarado: la model card de este repositorio solo indica inglés como idioma soportado, aunque el modelo base de Google soporta múltiples idiomas. Para aplicaciones multilingües, se recomienda verificar el comportamiento real.
- Sesgos y alucinaciones: al ser una conversión del modelo original, hereda los posibles sesgos presentes en los datos de entrenamiento de Google, así como el riesgo de generar contenido falso o inventado, especialmente en tareas abiertas.
- Requisitos de hardware elevados: el tamaño de 27B y el contexto largo (128k) requieren GPUs con gran capacidad de memoria, lo que limita su uso en entornos de consumo sin cuantización.
- Falta de documentación sobre rendimiento: no se incluyen benchmarks ni métricas de latencia, por lo que el usuario debe evaluar el modelo en su propio entorno antes de desplegarlo en producción.
- Dependencia de kerasformers: el uso de esta implementación requiere instalar la librería kerasformers y configurar correctamente el backend, lo que añade una dependencia adicional al stack.

## Enlaces

- Repositorio de HuggingFace: [kerasformers/gemma-3-27b-it](https://huggingface.co/kerasformers/gemma-3-27b-it)
- Colección de kerasformers: [HuggingFace collection](https://huggingface.co/kerasformers)
- Repositorio de GitHub: [IMvision12/KerasFormers](https://github.com/IMvision12/KerasFormers)
- Documentación de Gemma 3 en kerasformers: [Docs](https://imvision12.github.io/KerasFormers/gemma3/)
- Modelo original de Google: [google/gemma-3-27b-it](https://huggingface.co/google/gemma-3-27b-it)
- Artículo técnico de Gemma 3: [arXiv:2503.19786](https://arxiv.org/abs/2503.19786)
