# kerasformers/tipsv2-so400m14

## Resumen

TIPSv2-so400m14 es un modelo de clasificación de imágenes zero-shot desarrollado por Google DeepMind, cuya conversión a Keras 3 publica el usuario `kerasformers`. Se trata de un dual encoder en la línea de CLIP y SigLIP: una torre de visión basada en un ViT estilo DINOv2 con register tokens y una torre de texto bidireccional, alineadas mediante un objetivo contrastivo con temperatura escalada. El modelo permite clasificar imágenes en categorías que no ha visto durante el entrenamiento, simplemente proporcionando prompts textuales.

Esta versión de `kerasformers` es una conversión pura de Keras 3 del checkpoint original `google/tipsv2-so400m14`. La misma implementación se ejecuta sin modificaciones sobre TensorFlow, PyTorch o JAX, y tanto el modelo completo como las torres por separado se cargan desde este mismo repositorio. Con aproximadamente 400 millones de parámetros y una resolución de entrada de 448 píxeles, el modelo ofrece una alternativa de código abierto para tareas de clasificación zero-shot y búsqueda visual por texto.

La relevancia de esta conversión radica en la portabilidad: permite integrar TIPSv2 en proyectos que ya usan Keras 3, sin depender de los pesos originales de PyTorch, y con la flexibilidad de elegir el backend de ejecución. La licencia Apache-2.0 (según la model card) facilita su uso en entornos comerciales, aunque existe cierta discrepancia en fuentes externas sobre restricciones de uso no comercial que conviene verificar.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dual encoder: ViT-SO400M (visión, estilo DINOv2 con register tokens) + torre de texto bidireccional |
| Parametros totales | 0.4B (según OpenModelMap) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Keras 3 (cargables con `from_weights`); repo de 3.4 GB |

## Arquitectura y entrenamiento

TIPSv2 es un modelo dual encoder de tipo CLIP/SigLIP. La torre de visión es un ViT con register tokens, una técnica derivada de DINOv2 que mejora la atención en parches de imagen y reduce artefactos. La torre de texto es bidireccional, a diferencia de los encoders unidireccionales de CLIP original. Ambos encoders se alinean mediante un objetivo contrastivo con temperatura escalada, que optimiza la similitud entre pares imagen-texto.

El procesador de imágenes reescala los píxeles al rango [0, 1] sin normalización por media y desviación, y la resolución de entrada es fija de 448 píxeles. Los detalles del dataset de entrenamiento, número de tokens y el proceso de alineación no están disponibles en la información proporcionada. Tampoco se especifica si se aplicaron técnicas de fine-tuning o RLHF, aunque al ser un modelo de visión-lenguaje no es habitual en esta categoría.

## Capacidades

- Clasificación de imágenes zero-shot: asocia una imagen con un conjunto de textos arbitrarios y devuelve probabilidades normalizadas.
- Alineación visión-texto: genera representaciones conjuntas que permiten buscar imágenes mediante texto y viceversa.
- Extracción de embeddings de imagen y de texto por separado (se pueden cargar las torres de forma independiente).
- Ejecución en múltiples backends: TensorFlow, PyTorch y JAX a través de Keras 3, sin cambios de código.
- Compatibilidad con el ecosistema Keras: se integra con capas, optimizadores y utilidades estándar de Keras 3.
- Carga de checkpoints originales de Google DeepMind mediante `hf:google/tipsv2-so400m14`.

## Casos de uso

- **Clasificación de imágenes en producción sin etiquetas previas**: permite categorizar imágenes de un dominio nuevo (por ejemplo, tipos de plantas, defectos industriales o productos de una tienda) escribiendo las clases como texto, sin necesidad de reentrenar el modelo.
- **Búsqueda visual por texto en bibliotecas de imágenes**: integrar TIPSv2 en un sistema de gestión de activos digitales para encontrar imágenes a partir de descripciones en lenguaje natural, con un coste de inferencia bajo para un modelo de 0.4B.
- **Moderación de contenido en plataformas**: clasificar imágenes como contenido inapropiado, violento o publicitario mediante prompts textuales, con la posibilidad de ajustar las categorías dinámicamente sin reentrenar.
- **Análisis de imágenes en investigación**: usar las representaciones de imagen para clustering, recuperación de imágenes similares o como base para entrenar clasificadores lineales sobre dominios específicos.
- **Sistemas de accesibilidad**: generar descripciones textuales de imágenes para personas con discapacidad visual, combinando el encoder de imagen con un modelo de lenguaje generativo.
- **Monitorización de redes sociales**: detectar y clasificar automáticamente imágenes de eventos, lugares o productos en tiempo real, gracias a la capacidad zero-shot de adaptarse a nuevas categorías sin etiquetado manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión en conjuntos como ImageNet, COCO o cualquier otra evaluación estándar de clasificación zero-shot.

## Requisitos de hardware

- **VRAM estimada**: no disponible en la documentación. Con 0.4B parámetros, se puede estimar un uso de memoria de aproximadamente 1.6 GB en FP32 y 0.8 GB en FP16, pero estos valores no han sido confirmados por el autor.
- **GPU recomendadas**: no se especifican. Un modelo de este tamaño debería caber en GPU de consumo como RTX 3060 (12 GB) o superiores, pero no hay datos oficiales.
- **Despliegue**: al ser un modelo Keras 3, se puede ejecutar con el backend de TensorFlow, PyTorch o JAX. No se menciona compatibilidad con vLLM, llama.cpp u otras herramientas de inferencia optimizada para modelos de lenguaje; se trata de un modelo de visión dual encoder.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución | Licencia | Backends | Clasificación zero-shot |
|---|---|---|---|---|---|
| `kerasformers/tipsv2-so400m14` | 0.4B | 448 | Apache-2.0 | Keras 3 (TF/Torch/JAX) | Sí |
| `google/tipsv2-so400m14` (original) | 0.4B | 448 | Apache-2.0 | PyTorch | Sí |
| CLIP ViT-B/32 | 151M | 224 | MIT | PyTorch, JAX | Sí |
| SigLIP ViT-SO400M | 400M | 384 | Apache-2.0 | PyTorch | Sí |

La comparativa se basa en las características públicas de cada modelo. No se dispone de datos de rendimiento comparativo en benchmarks para TIPSv2 en esta conversión.

## Limitaciones y advertencias

- **Discrepancia en la licencia**: aunque la model card indica Apache-2.0, el sitio OpenModelMap afirma que el modelo es para uso de investigación y no comercial. Conviene verificar la licencia final del checkpoint original de Google antes de su uso en producción comercial.
- **Sin datos de idiomas**: no se especifica qué idiomas soporta la torre de texto. Es probable que esté entrenado predominantemente en inglés, pero no hay confirmación.
- **Sin benchmarks publicados**: no se puede evaluar el rendimiento real del modelo frente a alternativas como CLIP o SigLIP en tareas estándar.
- **Resolución de entrada fija**: el modelo está diseñado para 448 píxeles; imágenes de mayor resolución necesitan redimensionamiento, lo que puede perder información.
- **Dependencia de Keras 3**: requiere la librería `kerasformers` y el ecosistema Keras 3; no se puede usar directamente con Hugging Face Transformers sin adaptación.
- **Riesgo de sesgos**: al ser un modelo entrenado con datos web no filtrados, puede heredar sesgos de género, raza o cultura en las asociaciones imagen-texto, aunque no hay estudios de sesgo publicados para esta versión.

## Enlaces

- [Repositorio HuggingFace: kerasformers/tipsv2-so400m14](https://huggingface.co/kerasformers/tipsv2-so400m14)
- [Model card original: google/tipsv2-so400m14](https://huggingface.co/google/tipsv2-so400m14)
- [Paper TIPSv2 (arXiv:2604.12012)](https://huggingface.co/papers/2604.12012)
- [GitHub de KerasFormers](https://github.com/IMvision12/KerasFormers)
- [GitHub oficial de TIPSv2 (Google DeepMind)](https://github.com/google-deepmind/tips)
- [OpenModelMap: tipsv2-so400m14](https://openmodelmap.com/model/google/tipsv2-so400m14)
