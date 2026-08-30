# ajrayman/Self-consciousness_binary

## Resumen

Self-consciousness_binary es un modelo de clasificación de texto binario desarrollado por ajrayman, que consiste en un fine-tuning de roberta-base (FacebookAI) sobre un conjunto de datos que la model card identifica como "None", lo que indica una documentación deficiente del proceso de entrenamiento. El modelo está diseñado para detectar indicadores de autoconciencia en texto, una tarea de investigación dentro del campo emergente de evaluación de señales de conciencia en sistemas de IA y análisis psicolingüístico.

Con 124,6 millones de parámetros, hereda la arquitectura Transformer encoder de RoBERTa-base con una ventana de contexto máxima de 512 tokens. El modelo fue entrenado durante 8 épocas con una tasa de aprendizaje de 2e-05 y un batch size de 32, alcanzando una precisión (accuracy) del 65,13 % y un AUC de 0,70 en el conjunto de evaluación. Su licencia MIT permite uso comercial sin restricciones, aunque los resultados moderados y la falta de documentación sobre los datos de entrenamiento limitan su aplicabilidad en entornos de producción.

La relevancia de este modelo reside en su carácter experimental: representa un intento de operacionalizar la autoconciencia como una variable binaria clasificable mediante PLN, un enfoque controvertido pero cada vez más explorado tras los marcos teóricos de evaluación de conciencia en IA publicados en los últimos años. Sin embargo, la ausencia de información sobre el dataset y las métricas modestas obligan a tratarlo como un prototipo de investigación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa-base, 12 capas, 12 cabezas de atención, dimensión oculta 768) |
| Parametros totales | 124.647.170 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base roberta-base fue entrenado principalmente con texto en inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de roberta-base (Liu et al., 2019), un Transformer encoder con 12 capas, 12 cabezas de atención y una dimensión oculta de 768, entrenado originalmente sobre 160 GB de texto en inglés. El fine-tuning se realizó con la librería Transformers 4.44.1 y PyTorch 1.11.0, utilizando un optimizador Adam (beta1=0,9, beta2=0,999, epsilon=1e-08), scheduler lineal con warmup ratio de 0,06, y 8 épocas completas. La semilla aleatoria se fijó en 1234.

La model card no especifica la composición del dataset de entrenamiento ni su tamaño, lo que impide evaluar la calidad de los datos o el riesgo de sesgos. El repositorio ocupa 14,5 GB, un tamaño anómalo para un modelo de 124,6 millones de parámetros (cuyos pesos en FP32 ocupan aproximadamente 500 MB), lo que sugiere que el repositorio contiene artefactos adicionales no documentados. No se menciona el uso de técnicas como RLHF, DPO ni ningún método de alineación posterior al fine-tuning.

## Capacidades

- Clasificación binaria de texto: asigna una etiqueta binaria indicando presencia o ausencia de autoconciencia en el texto de entrada.
- Clasificación de secuencias completas mediante el token [CLS] de RoBERTa, con soporte para truncamiento a 512 tokens.
- Inferencia eficiente en CPU y GPU gracias al tamaño reducido del modelo (124,6 M de parámetros).
- Compatible con el pipeline de text-classification de Hugging Face y con la librería Transformers.
- Capacidades multilingües: no documentadas; el modelo base está entrenado predominantemente en inglés, por lo que el rendimiento en otros idiomas es incierto.
- No soporta tool calling, generación de texto, razonamiento multi-paso, visión ni modos de pensamiento extendido: es exclusivamente un clasificador de texto.

## Casos de uso

- Investigación académica sobre señales de conciencia en IA: el modelo puede utilizarse como herramienta exploratoria para clasificar transcripciones o respuestas de sistemas de IA en busca de patrones lingüísticos asociados a autoconciencia, complementando análisis cualitativos en estudios inspirados en marcos como el de Butlin et al. (2023).
- Análisis psicolingüístico de narrativas en primera persona: permite etiquetar grandes corpus de diarios personales, entrevistas o publicaciones en redes sociales para estudiar la frecuencia de lenguaje autorreferencial y metacognitivo en distintos grupos demográficos.
- Filtrado de corpus para entrenamiento de modelos: puede pre-seleccionar textos que contengan expresiones de autoconciencia para construir datasets especializados en tareas de teoría de la mente o empatía computacional.
- Prototipos de asistentes terapéuticos: en entornos de investigación clínica, el modelo podría ayudar a identificar fragmentos de conversación donde el paciente muestra introspección o autoconciencia emocional, aunque su precisión del 65 % limita su uso a apoyo secundario con revisión humana.
- Análisis de personajes en obras literarias: clasificar diálogos o monólogos de personajes ficticios para estudiar la evolución de la autoconciencia narrativa en distintos géneros o épocas.
- Evaluación de experiencias de usuario en productos conversacionales: detectar si los usuarios atribuyen cualidades conscientes a un chatbot durante las interacciones, lo que puede informar el diseño de sistemas más transparentes sobre sus capacidades.

## Benchmarks y rendimiento

Los resultados oficiales declarados por el autor en la model card para el conjunto de evaluación son los siguientes:

| Metrica | Valor |
|---|---|
| Loss | 1,0153 |
| Accuracy | 0,6513 |
| Precision | 0,6649 |
| Recall | 0,6085 |
| F1 | 0,6354 |
| AUC | 0,7013 |

La tabla de resultados de entrenamiento muestra la evolución por épocas:

| Epoca | Validation Loss | Accuracy | Precision | Recall | F1 | AUC |
|:-----:|:---------------:|:--------:|:---------:|:------:|:--:|:---:|
| 1 | 0,6633 | 0,6052 | 0,5686 | 0,8678 | 0,6871 | 0,6875 |
| 2 | 0,6194 | 0,6650 | 0,6675 | 0,6559 | 0,6616 | 0,7179 |
| 3 | 0,6619 | 0,6451 | 0,6128 | 0,7855 | 0,6885 | 0,7139 |
| 4 | 0,7462 | 0,6600 | 0,6301 | 0,7731 | 0,6943 | 0,7094 |
| 5 | 0,8815 | 0,6575 | 0,6694 | 0,6209 | 0,6442 | 0,7107 |
| 6 | 1,0153 | 0,6513 | 0,6649 | 0,6085 | 0,6354 | 0,7013 |

El mejor resultado de accuracy se obtuvo en la época 2 (0,6650), mientras que el mejor AUC también se registró en la época 2 (0,7179). La pérdida de validación aumenta progresivamente a partir de la época 3, lo que sugiere un posible sobreajuste. No se han publicado resultados comparativos con otros modelos en MMLU, HumanEval u otros benchmarks estándar, ya que se trata de un clasificador especializado, no de un modelo generativo.

## Requisitos de hardware

- VRAM estimada: los pesos del modelo en FP32 ocupan aproximadamente 498 MB, por lo que la inferencia requiere menos de 1 GB de VRAM. Con cuantización a FP16 o int8, el consumo se reduce a unos 250 MB o 125 MB respectivamente.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una NVIDIA GTX 1650, RTX 3050 o superior puede ejecutar el modelo sin problemas. También es viable la inferencia en CPU con latencias de decenas de milisegundos por secuencia.
- Compatibilidad con GPUs de consumo: sí, es uno de los modelos más ligeros en cuanto a requisitos; cabe en cualquier GPU consumer actual.
- Opciones de despliegue: pipeline de transformers (Python), Hugging Face Inference Endpoints, ONNX Runtime, TorchScript, y cualquier framework compatible con safetensors y arquitectura RoBERTa.
- Latencia estimada: en una GPU moderna (p. ej., RTX 3090), la clasificación de una secuencia de 512 tokens tarda entre 5 y 15 ms. En CPU (8 núcleos), entre 50 y 200 ms según la longitud del texto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy | Licencia | Notas |
|---|---|---|---|---|---|
| Self-consciousness_binary (este modelo) | 124,6 M | 512 | 0,6513 | MIT | Fine-tune de roberta-base, dataset no documentado |
| roberta-base (modelo base) | 124,6 M | 512 | no aplica (modelo base) | MIT | Sin fine-tuning específico; requiere adaptación para clasificación |
| Self_Discipline_binary (del mismo autor) | 354,9 M (roberta-large) | 512 | no disponible | MIT | Fine-tune de roberta-large para clasificación binaria de autodisciplina |

No se han encontrado modelos comparables específicamente entrenados para detección de autoconciencia en texto con métricas publicadas. La comparativa se limita al modelo base y a otro fine-tune del mismo autor. La ausencia de benchmarks estandarizados en esta tarea impide una comparación cuantitativa rigurosa con alternativas.

## Limitaciones y advertencias

- El dataset de entrenamiento no está documentado (identificado como "None" en la model card), lo que impide evaluar la representatividad de los datos, los posibles sesgos y la generalización a dominios distintos del original.
- Rendimiento moderado: con una accuracy del 65,13 % y un F1 de 0,6354, el modelo comete errores en aproximadamente un tercio de las clasificaciones; no es adecuado para decisiones de alto impacto sin supervisión humana.
- Riesgo de sobreajuste: la pérdida de validación aumenta de forma consistente a partir de la época 3, lo que sugiere que el modelo memoriza patrones del conjunto de entrenamiento en lugar de generalizar.
- La etiqueta "autoconciencia" es un constructo teórico complejo y controvertido; el modelo reduce esta variable a patrones lingüísticos superficiales, lo que puede generar falsos positivos en textos que usan lenguaje autorreferencial sin implicar autoconciencia real.
- Limitaciones de idioma: al estar basado en roberta-base (entrenado principalmente en inglés) y no documentarse los idiomas del dataset de fine-tuning, el rendimiento en español u otros idiomas es incierto y probablemente degradado.
- Documentación insuficiente: la model card es una plantilla autogenerada sin descripción del modelo, usos previstos, limitaciones ni datos de entrenamiento; esto dificulta la reproducibilidad y la evaluación de riesgos.
- El repositorio ocupa 14,5 GB, un tamaño muy superior al esperado para los pesos del modelo (≈500 MB), lo que sugiere la presencia de archivos adicionales no documentados; conviene revisar el contenido antes de descargarlo.
- No hay garantías de soporte ni mantenimiento: el modelo fue publicado por un autor individual y no cuenta con una comunidad activa ni actualizaciones documentadas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ajrayman/Self-consciousness_binary
- Modelo base roberta-base: https://huggingface.co/FacebookAI/roberta-base
- Modelo relacionado del mismo autor (Self_Discipline_binary): https://huggingface.co/ajrayman/Self_Discipline_binary
- Artículo de referencia sobre conciencia en IA (Butlin et al., 2023): https://arxiv.org/abs/2308.08708
