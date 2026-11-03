# divyaka5/surface-defect-seg-t32026

## Resumen

El modelo `surface-defect-seg-t32026`, publicado por el usuario divyaka5 en Hugging Face, es un conjunto de tres modelos de segmentación de imágenes orientados a la detección de defectos superficiales sobre imágenes en escala de grises de 128 x 800 píxeles. El repositorio contiene tres variantes con arquitecturas distintas: una U-Net pequeña entrenada desde cero (`model1_tiny_unet`), una U-Net con encoder ResNet-34 preentrenado (`model2_unet_resnet34`) y un modelo FPN con encoder ConvNeXt-Small preentrenado (`model3_fpn_convnext_small`). El objetivo declarado es predecir máscaras para cuatro tipos de defectos.

El modelo con mejor rendimiento según la model card es `model3_fpn_convnext_small`, que alcanza un `val_score` de 0,7275, un F1 de validación de 0,7451 y una precisión de validación de 0,8875. La métrica compuesta utilizada combina un 70 % de Dice sobre defectos y un 30 % de precisión en imágenes vacías (sin defecto), lo que refleja el interés en equilibrar la detección efectiva con la capacidad de no generar falsos positivos en imágenes limpias.

Se trata de un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, sin licencia declarada ni idiomas especificados. El repositorio ocupa 0,3 GB y cada modelo se distribuye como un state dict de PyTorch (`.pth`) acompañado de un JSON de configuración con el umbral y el área mínima ajustados por clase. No se dispone de información sobre el dataset de entrenamiento, el número de parámetros ni los detalles de preprocesado más allá de las dimensiones de entrada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tres variantes: U-Net pequeña desde cero, U-Net con encoder ResNet-34, FPN con encoder ConvNeXt-Small |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de 128 x 800 píxeles en escala de grises) |
| Tipos de cuantizacion | no disponible (se distribuyen state dicts `.pth` en precisión original) |
| Idiomas soportados | no disponible (modelo de visión, sin componente textual) |
| Licencia | no disponible |
| Formato de pesos | `.pth` (state dict de PyTorch) + JSON de configuración por modelo |

## Arquitectura y entrenamiento

El repositorio agrupa tres arquitecturas de segmentación semántica binaria/multiclase adaptadas a un dominio muy concreto: imágenes industriales en escala de grises de 128 x 800 píxeles con cuatro tipos de defectos superficiales. La primera variante, `model1_tiny_unet`, es una U-Net compacta entrenada desde cero, pensada presumiblemente como línea base ligera. La segunda, `model2_unet_resnet34`, emplea un encoder ResNet-34 preentrenado, lo que aporta características visuales genéricas y mejora la convergencia frente al entrenamiento desde cero. La tercera, `model3_fpn_convnext_small`, utiliza un Feature Pyramid Network con encoder ConvNeXt-Small preentrenado, una combinación habitual para segmentación densa con buen equilibrio entre capacidad y coste computacional.

No se especifica en la información disponible el número de tokens o imágenes de entrenamiento, la composición del dataset, si se aplicaron técnicas de aumento de datos, ni si hubo ajuste fino con funciones de pérdida específicas (Dice, Focal, BCE combinadas). Tampoco se detalla el esquema de validación ni el proceso de búsqueda de hiperparámetros que produjo los umbrales y áreas mínimas por clase almacenados en los JSON de configuración. La métrica de validación definida por el autor (`0,7 * Dice + 0,3 * precisión en vacías`) sugiere un dataset con un porcentaje relevante de imágenes sin defecto, y el postprocesado por umbral y área mínima indica que las máscaras se refinan tras la inferencia para eliminar falsos positivos de pequeño tamaño.

## Capacidades

- Segmentación de imágenes en escala de grises de 128 x 800 píxeles para cuatro tipos de defectos superficiales.
- Generación de máscaras por píxel con postprocesado configurable mediante umbral y área mínima por clase.
- Tres variantes con distinto compromiso entre coste computacional y calidad de segmentación.
- Detección de imágenes sin defecto (clase vacía), evaluada de forma explícita en la métrica de validación.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo puramente visual.
- No dispone de capacidades multilingües ni de generación de texto.
- No se documentan modos especiales (thinking, audio, vídeo) ni otras modalidades.

## Casos de uso

- Inspección visual automatizada en líneas de fabricación: el modelo recibe imágenes de 128 x 800 píxeles procedentes de cámaras industriales y devuelve máscaras de defectos, permitiendo clasificar piezas como conformes o no conformes en función del área segmentada y del umbral configurado por clase.
- Control de calidad en producción de superficies metálicas o textiles: la variante `model3_fpn_convnext_small` puede integrarse en un pipeline de adquisición de imagen y actuar como filtro previo antes de la revisión humana, reduciendo el volumen de inspección manual.
- Monitorización en tiempo real con hardware limitado: `model1_tiny_unet`, al ser una U-Net pequeña entrenada desde cero, es la opción adecuada para dispositivos con recursos restringidos o para prototipado rápido en CPU.
- Detección de defectos en imágenes de alta relación de aspecto: la resolución 128 x 800 encaja con escenas alargadas (bandas, tiras, perfiles), donde otros modelos cuadrados requerirían recortes o redimensionados que degradan la precisión.
- Análisis de lotes históricos: el umbral y el área mínima por clase almacenados en los JSON permiten recalibrar el comportamiento del modelo sobre datasets ya capturados sin reentrenar, ajustando sensibilidad y especificidad según el coste de los falsos positivos y negativos.
- Docencia y experimentación en segmentación: el repositorio ofrece tres niveles de complejidad (desde cero, encoder ResNet-34, encoder ConvNeXt-Small) con resultados de validación comparables, útil para estudiar el impacto del preentrenamiento y de la arquitectura en una tarea de segmentación concreta.

## Benchmarks y rendimiento

Resultados de validación publicados en la model card. La métrica `val_score` se define como `0,7 * Dice sobre defectos + 0,3 * precisión en imágenes vacías`.

| Modelo | val_score | val_f1 | val_acc | val_dice | val_empty_acc |
|---|---|---|---|---|---|
| model3_fpn_convnext_small | 0,727538 | 0,745105 | 0,887507 | 0,660707 | 0,883478 |
| model2_unet_resnet34 | 0,647951 | 0,638603 | 0,800761 | 0,587111 | 0,789913 |
| model1_tiny_unet | 0,571812 | 0,477868 | 0,726448 | 0,516054 | 0,701913 |

No se han publicado resultados frente a modelos externos (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que se trata de un modelo de segmentación de imágenes y no de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma exacta; el repositorio completo ocupa 0,3 GB, por lo que cada variante individual es presumiblemente inferior a 0,3 GB en disco. La variante `model3_fpn_convnext_small` es la de mayor huella, pero ConvNeXt-Small es un encoder relativamente ligero y debería caber holgadamente en GPUs de consumo.
- GPU recomendadas: no especificadas por el autor. Por el tamaño del encoder, una RTX 3060, RTX 4060 o superiores serían suficientes para inferencia; para entrenamiento o ajuste fino se recomendarían GPUs con al menos 8-12 GB de VRAM.
- Compatibilidad con GPU de consumo: sí, previsiblemente todas las variantes caben en GPUs de consumo actuales, incluidas las de gama media, dado el tamaño reducido del repositorio.
- Opciones de despliegue: al ser state dicts de PyTorch, el despliegue requiere cargar los pesos en una definición de modelo compatible (PyTorch, TorchScript, ONNX tras exportación). No se proporcionan artefactos listos para vLLM, llama.cpp, Ollama o TGI, que no aplican a modelos de segmentación de imágenes.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación del repositorio. Como referencia cualitativa, las tres variantes internas permiten una comparación directa entre sí (ver tabla de benchmarks), pero no se han publicado comparaciones con arquitecturas externas de segmentación de defectos como U-Net estándar de la literatura, DeepLabV3+ o SegFormer, por lo que la comparativa externa se indica como no disponible.

| Modelo | Parámetros | Contexto/entrada | val_score | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| model3_fpn_convnext_small | no disponible | 128 x 800 px | 0,7275 | no disponible | Hugging Face |
| model2_unet_resnet34 | no disponible | 128 x 800 px | 0,6480 | no disponible | Hugging Face |
| model1_tiny_unet | no disponible | 128 x 800 px | 0,5718 | no disponible | Hugging Face |
| Alternativas externas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se declara licencia, por lo que el uso comercial queda sin autorización explícita y debe consultarse con el autor antes de cualquier despliegue en producción.
- El modelo está entrenado para un dominio muy específico (defectos superficiales en imágenes de 128 x 800 píxeles en escala de grises); su rendimiento fuera de ese dominio no está garantizado.
- El Dice de validación del mejor modelo es 0,6607, lo que indica margen de mejora en la calidad de las máscaras; no es un modelo de precisión industrial sin validación adicional en el caso de uso concreto.
- Riesgo de alucinación en el sentido de falsos positivos: la métrica de precisión en imágenes vacías (0,8835 en el mejor modelo) implica que aproximadamente un 11,6 % de las imágenes sin defecto podrían generar detecciones espurias si no se ajusta el postprocesado.
- No se documentan sesgos de dataset, composición demográfica ni condiciones de captura (iluminación, resolución de cámara, tipo de material), lo que impide evaluar la robustez frente a variaciones de dominio.
- No hay información sobre el número de parámetros, el coste computacional por imagen ni el rendimiento en GPUs concretas, lo que dificulta la planificación de capacidad.
- El repositorio tiene cero descargas y cero likes, sin validación externa por parte de la comunidad; debe tratarse como un artefacto experimental.
- La fecha de creación indicada (2026-11-02) es posterior a la fecha actual de consulta en muchos entornos, lo que puede indicar un error de metadatos o una fecha futura; conviene verificar la integridad del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/divyaka5/surface-defect-seg-t32026
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información proporcionada.
