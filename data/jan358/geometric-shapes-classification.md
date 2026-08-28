# Jan358/Geometric-Shapes-Classification

## Resumen

Geometric-Shapes-Classification es un modelo de clasificación de imágenes especializado en el reconocimiento de ocho formas geométricas básicas: círculo, cometa, paralelogramo, rectángulo, rombo, cuadrado, trapecio y triángulo. Está desarrollado por el usuario Jan358 y se basa en el modelo SigLIP2 base (google/siglip2-base-patch16-224), del que hereda la arquitectura de encoder visión-lenguaje, adaptada mediante un cabezal de clasificación para esta tarea específica. El modelo se publica bajo licencia Apache 2.0 y está disponible en Hugging Face con pesos en formato safetensors.

El modelo resuelve un problema concreto de visión por computador: la identificación automática de figuras geométricas en imágenes, una tarea habitual en entornos educativos, sistemas de automatización y análisis de diagramas técnicos. Su relevancia radica en que ofrece una solución ligera (alrededor de 93 millones de parámetros) y de alta precisión (accuracy global de 0,9908 en el conjunto de evaluación), entrenada sobre el dataset prithivMLmods/Math-Shapes. Al estar basado en SigLIP2, aprovecha las representaciones de un modelo preentrenado a gran escala, lo que facilita su adaptación a dominios visuales diversos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SigLIP2 base (encoder visión-lenguaje) con cabezal de clasificación (SiglipForImageClassification) |
| Parametros totales | 92.890.376 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No aplica (entrada de imagen de 224x224 píxeles) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (etiquetas de clases) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo parte de google/siglip2-base-patch16-224, un encoder visión-lenguaje de la familia SigLIP2. SigLIP2 combina un transformer de visión con un mecanismo de alineación imagen-texto, pero en esta variante se utiliza únicamente como extractor de características visuales, sobre el que se añade una capa de clasificación lineal para las ocho clases de formas geométricas. La arquitectura completa se instancia mediante la clase SiglipForImageClassification de la librería Transformers.

El entrenamiento se realizó mediante fine-tuning sobre el dataset prithivMLmods/Math-Shapes, que contiene imágenes de las ocho figuras objetivo. No se dispone de información sobre el número de épocas, el tamaño del conjunto de entrenamiento ni las técnicas de optimización empleadas. El reporte de clasificación incluido en la model card muestra un rendimiento muy alto en el conjunto de evaluación, con una precisión media ponderada de 0,9908 y valores de F1 superiores a 0,98 en todas las clases, lo que sugiere un ajuste fino bien convergido. No se menciona el uso de técnicas como RLHF o DPO, dado que se trata de una tarea puramente discriminativa.

## Capacidades

- Clasificación de imágenes en ocho categorías de formas geométricas: círculo, cometa, paralelogramo, rectángulo, rombo, cuadrado, trapecio y triángulo.
- Inferencia sobre imágenes de entrada de 224x224 píxeles, compatible con el procesador de imágenes estándar de SigLIP2.
- Salida de probabilidades por clase mediante softmax sobre los logits, lo que permite obtener confianzas interpretables.
- Integración sencilla con la librería Transformers mediante la clase SiglipForImageClassification y AutoImageProcessor.
- Ejemplo de uso incluido en la model card con Gradio para crear una interfaz de demostración.
- Capacidad de funcionamiento en CPU y GPU gracias a su tamaño reducido (menos de 100 millones de parámetros).
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso; es un modelo puramente discriminativo para visión.

## Casos de uso

- Herramientas educativas interactivas: el modelo puede integrarse en aplicaciones de aprendizaje de geometría donde los estudiantes dibujan formas a mano alzada y reciben retroalimentación inmediata sobre la figura identificada. Su precisión superior al 99 % garantiza una experiencia fiable.
- Detección de formas en robótica y automatización: en líneas de producción o sistemas de inspección visual, el modelo puede clasificar piezas u objetos según su forma geométrica, facilitando tareas de ordenación o control de calidad.
- Análisis de diagramas técnicos y planos: en ingeniería o arquitectura, el modelo puede reconocer símbolos geométricos presentes en planos, esquemas eléctricos o documentos técnicos, automatizando la extracción de información.
- Tecnología asistiva para personas con discapacidad visual: el modelo puede servir de base para aplicaciones que describan objetos cotidianos por su forma, ayudando a la navegación o al reconocimiento del entorno.
- Clasificación de imágenes en bancos de datos: para organizar grandes colecciones de imágenes según la forma predominante, útil en investigación o en gestión de contenidos visuales.
- Prototipado de sistemas de visión por computador: dado su pequeño tamaño y su compatibilidad con Transformers, es adecuado como punto de partida para experimentos de clasificación de formas en entornos académicos o de I+D.

## Benchmarks y rendimiento

La model card incluye un reporte de clasificación detallado sobre un conjunto de evaluación con 12.000 muestras (1.500 por clase). Los resultados son los siguientes:

| Clase | Precision | Recall | F1-score | Soporte |
|---|---|---|---|---|
| Circulo | 0,9921 | 0,9987 | 0,9953 | 1500 |
| Cometa | 0,9927 | 0,9927 | 0,9927 | 1500 |
| Paralelogramo | 0,9926 | 0,9840 | 0,9883 | 1500 |
| Rectangulo | 0,9993 | 0,9913 | 0,9953 | 1500 |
| Rombo | 0,9846 | 0,9820 | 0,9833 | 1500 |
| Cuadrado | 0,9914 | 0,9987 | 0,9950 | 1500 |
| Trapecio | 0,9966 | 0,9793 | 0,9879 | 1500 |
| Triangulo | 0,9772 | 0,9993 | 0,9881 | 1500 |
| **Accuracy global** | | | **0,9908** | **12000** |
| **Macro avg** | 0,9908 | 0,9908 | 0,9907 | 12000 |
| **Weighted avg** | 0,9908 | 0,9908 | 0,9907 | 12000 |

No se han publicado resultados comparativos con otros modelos de clasificación de formas en la información disponible. Los datos presentados provienen exclusivamente del reporte incluido por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia: con 92,9 millones de parámetros, el modelo requiere aproximadamente 370 MB en FP32 (92.890.376 × 4 bytes). En FP16 o cuantización de 8 bits, el consumo se reduce a unos 185 MB o menos, lo que permite ejecutarlo en GPUs con 1-2 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como una NVIDIA GTX 1050 Ti, RTX 2060 o superiores. También es viable en GPUs integradas de portátiles modernos.
- Funcionamiento en CPU: sí, dado el tamaño reducido, la inferencia en CPU es factible con latencias del orden de decenas de milisegundos por imagen, aunque depende del hardware concreto.
- Opciones de despliegue: al ser un modelo de Transformers, puede servirse con bibliotecas estándar como Hugging Face Inference Endpoints, o mediante frameworks como vLLM (aunque este está orientado a generación de texto, no es el caso). Para este modelo, lo más sencillo es usar el pipeline de Transformers o crear una API con FastAPI.
- Latencia y throughput: no se dispone de mediciones oficiales. En una GPU moderna (por ejemplo, RTX 3090), se espera una latencia inferior a 10 ms por imagen y un throughput de varios cientos de imágenes por segundo.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos en la documentación proporcionada. Sin embargo, dado que el modelo se basa en SigLIP2, puede compararse conceptualmente con otros clasificadores de imágenes preentrenados como CLIP o ViT fine-tuned para tareas de clasificación. No obstante, al tratarse de una tarea muy específica (ocho formas geométricas), no hay datos de rendimiento de alternativas en la misma tarea disponibles en las fuentes consultadas.

## Limitaciones y advertencias

- El modelo solo reconoce ocho clases de formas geométricas; cualquier figura fuera de ese conjunto será clasificada erróneamente en una de las categorías existentes.
- El entrenamiento se realizó sobre un dataset sintético (prithivMLmods/Math-Shapes), por lo que su rendimiento en imágenes del mundo real con fondos complejos, oclusiones o perspectivas no canónicas puede degradarse.
- No se han documentado sesgos específicos, pero al estar entrenado con imágenes generadas o recopiladas, puede presentar limitaciones en la generalización a estilos de dibujo muy diferentes.
- La salida es una distribución de probabilidad sobre las clases; no proporciona explicaciones ni razonamiento sobre la decisión.
- La licencia Apache 2.0 permite uso comercial y modificación, pero el modelo no incluye garantías de precisión en entornos de producción críticos.
- El modelo está pensado para clasificación de imágenes; no soporta otras modalidades como texto, audio o video.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jan358/Geometric-Shapes-Classification
- Modelo original de prithivMLmods (referencia): https://huggingface.co/prithivMLmods/Geometric-Shapes-Classification
- Repositorio GitHub del proyecto: https://github.com/PRITHIVSAKTHIUR/Geometric-Shapes-Classification
- Dataset Math-Shapes: https://huggingface.co/datasets/prithivMLmods/Math-Shapes
- Modelo base SigLIP2: https://huggingface.co/google/siglip2-base-patch16-224
