# RussellALA/convnext-chexpert-seed1

## Resumen

`RussellALA/convnext-chexpert-seed1` es un clasificador de radiografías de tórax multi-etiqueta, desarrollado por RussellALA como artefacto de investigación para el artículo *"Show Me What You Don't Know: Efficient Sampling from Invariant Sets for Model Validation"* (Rousselot, Wendebourg y Köthe, 2026). Se trata de un modelo `facebook/convnextv2-tiny-22k-384` afinado de extremo a extremo sobre el conjunto de datos CheXpert, que detecta cinco hallazgos radiológicos: atelectasia, cardiomegalia, consolidación, edema y derrame pleural.

El modelo es relevante porque no se publica como producto clínico, sino como sujeto de auditoría: el artículo muestrea las **fibras** del modelo, es decir, los conjuntos de imágenes que mapea a la misma representación, para estudiar qué invarianzas aprende. Es uno de una pareja de modelos entrenados idénticamente con distinta semilla aleatoria (`seed1` y `seed2`), diseñados para reproducir el experimento de la Figura 18 del paper. Con 27,8 millones de parámetros y una entrada de 384×384 píxeles, es un modelo ligero y de fácil despliegue, pero su licencia restringe su uso a investigación no comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt V2-tiny (backbone convolucional) |
| Parametros totales | 27.870.341 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, FP32/FP16 según uso) |
| Idiomas soportados | no aplica (procesa imágenes, no texto) |
| Licencia | CheXpert Research Use Agreement (solo investigación, no comercial) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `facebook/convnextv2-tiny-22k-384`, un backbone convolucional moderno basado en la arquitectura ConvNeXt V2, con kernel de 7×7 y normalización por capas. Se afinó de extremo a extremo (todas las capas entrenables) sobre CheXpert v1.0-small, utilizando únicamente proyecciones frontales. El entrenamiento empleó una pérdida asimétrica enmascarada (Masked Asymmetric Loss, gamma_neg=3) con etiquetas inciertas (-1) excluidas de la pérdida, un optimizador AdamW con learning rate 1e-3, weight decay 0.02, programación coseno y 1600 pasos de calentamiento, durante 3 épocas con batch size 16. La división de datos se realizó con `StratifiedGroupKFold` agrupando por `PatientID` para evitar fuga de pacientes entre entrenamiento y validación.

La entrada se normaliza con estadísticas de ImageNet por canal (media 0.485, 0.456, 0.406; desviación 0.229, 0.224, 0.225). El modelo genera cinco logits de salida, uno por hallazgo, sin capa de activación final. No se aplicó ninguna técnica de alineamiento con preferencias humanas (RLHF/DPO), dado que es un clasificador supervisado.

## Capacidades

- Clasificación multi-etiqueta de radiografías de tórax en cinco hallazgos: atelectasia, cardiomegalia, consolidación, edema y derrame pleural.
- Genera cinco logits crudos, lo que permite aplicar umbrales personalizados o calibrar posteriormente.
- Compatible con `transformers` mediante `AutoModelForImageClassification`.
- Incluye soporte para la envoltura del paper (`ConvNextClassfierSubjectModel`) que acepta entradas de un canal normalizadas con estadísticas en escala de grises.
- Permite auditar invarianzas internas mediante el muestreo de fibras, una capacidad de interpretabilidad no estándar en clasificadores médicos.
- Al ser un modelo pequeño (27,8 M parámetros), puede ejecutarse en hardware modesto y en tiempo real.
- No soporta tool calling, agentes ni razonamiento multi-paso, ya que es únicamente un clasificador de imágenes.

## Casos de uso

- **Investigación en validación de modelos**: el uso principal es reproducir el artículo de auditoría de invarianzas. Los investigadores pueden cargar el modelo y ejecutar el pipeline de muestreo de fibras para estudiar qué imágenes son tratadas como equivalentes por el clasificador.
- **Estudio de robustez ante variaciones de adquisición**: al ser un modelo entrenado en un único hospital (Stanford), sirve para analizar cómo cambian las predicciones ante diferencias en el equipo radiológico, la posición del paciente o el protocolo de captura.
- **Comparación de semillas aleatorias**: junto con `convnext-chexpert-seed2`, permite estudiar si dos modelos con el mismo entrenamiento pero distinta inicialización comparten las mismas invarianzas, un experimento clave en reproducibilidad.
- **Desarrollo de métodos de interpretabilidad**: los logits de salida y la estructura de fibras pueden usarse como banco de pruebas para nuevos algoritmos de explicabilidad en imagen médica.
- **Enseñanza y formación**: en cursos de deep learning aplicado a salud, puede servir como ejemplo práctico de fine-tuning de un modelo preentrenado en un dominio específico con datos limitados.
- **Evaluación de técnicas de calibración**: dado que el modelo no está calibrado (las etiquetas inciertas se excluyeron), es un caso realista para probar métodos de calibración de confianza en clasificadores médicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que se evaluó con AUROC por etiqueta, exactitud, especificidad y distancia de Hamming, pero no proporciona valores numéricos. El artículo original reporta la pérdida de fibras y la concordancia entre modelos, métricas de equivalencia interna, no de precisión diagnóstica. Por tanto, no es posible comparar su rendimiento clínico con otros modelos.

## Requisitos de hardware

- **VRAM estimada**: al tratarse de un modelo de 27,8 M parámetros, en FP32 ocupa aproximadamente 111 MB de memoria para los pesos. Con la entrada de 384×384 y batch 1, el consumo total de VRAM en inferencia se estima por debajo de 1 GB, incluso en FP32. En FP16 o con cuantización, el consumo es aún menor.
- **GPU recomendadas**: cualquier GPU moderna con al menos 2 GB de VRAM es suficiente. Una NVIDIA GTX 1650, RTX 3060 o superior puede ejecutarlo sin problemas. También es viable en CPU para inferencia por lotes pequeños.
- **Compatibilidad con GPU de consumo**: sí, cabe en cualquier GPU consumer actual.
- **Opciones de despliegue**: al ser un modelo de `transformers`, puede servirse con Hugging Face Inference Endpoints, o mediante frameworks como TorchServe, ONNX Runtime o TensorRT. También puede exportarse a ONNX para inferencia optimizada en CPU/GPU.
- **Latencia y throughput**: no se dispone de datos medidos, pero por el tamaño del modelo y la resolución de entrada, se espera una latencia de decenas de milisegundos en GPU moderna (por ejemplo, <50 ms en una RTX 3060) y de cientos de milisegundos en CPU.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa cuantitativa. Los modelos comparables serían otros clasificadores de CheXpert como DenseNet-121, ResNet-50 o EfficientNet afinados sobre el mismo conjunto de datos, así como el modelo compañero `biomedclip-chexpert` (basado en BiomedCLIP). Sin embargo, no hay datos públicos de rendimiento (AUROC, exactitud) para estos modelos en la información proporcionada. El propio modelo `convnext-chexpert-seed2` es idéntico en arquitectura y entrenamiento, diferenciándose solo en la semilla aleatoria. Por tanto, la comparativa directa solo es posible entre las dos semillas, y no se han publicado métricas comparativas.

## Limitaciones y advertencias

- **Uso exclusivo de investigación**: la licencia CheXpert Research Use Agreement prohíbe el uso comercial y clínico. El modelo no debe utilizarse para decisiones diagnósticas ni en pacientes.
- **Sesgos de datos**: entrenado en un único centro (Stanford Hospital), con posibles sesgos demográficos y de adquisición presentes en CheXpert.
- **Alcance limitado**: solo cubre cinco de los catorce hallazgos de CheXpert, y a baja resolución (384×384).
- **Falta de calibración**: las etiquetas inciertas se excluyeron del entrenamiento, por lo que el modelo no expresa incertidumbre y sus salidas no están calibradas.
- **Invarianzas problemáticas**: el propio artículo demuestra que el modelo asigna la misma representación a imágenes que un radiólogo consideraría distintas, lo que limita su fiabilidad en aplicaciones reales.
- **Dependencia de la convención de entrada**: el modelo es sensible a la normalización; usar estadísticas incorrectas degrada significativamente las predicciones (la distancia de probabilidad pasa de 0.0016% con la convención correcta a 1.19% con la incorrecta).
- **Sin redistribución de imágenes**: las radiografías de CheXpert no se incluyen en el repositorio; deben solicitarse a Stanford.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/RussellALA/convnext-chexpert-seed1)
- [Modelo compañero seed2](https://huggingface.co/RussellALA/convnext-chexpert-seed2)
- [Modelo compañero BiomedCLIP](https://huggingface.co/RussellALA/biomedclip-chexpert)
- [Paper en arXiv (2603.21782)](https://arxiv.org/abs/2603.21782)
- [Código del artículo (vislearn/InvarianceAuditing)](https://github.com/vislearn/InvarianceAuditing)
- [Página de CheXpert en Stanford](https://stanfordmlgroup.github.io/competitions/chexpert/)
- [Referencia de la pérdida asimétrica (Ridnik et al., 2020)](https://arxiv.org/abs/2009.14119)
