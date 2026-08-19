# DrinkIcedT/roberta-large_MBTI_N_MBTI_agg_balanced_50_1e-05_0.05

## Resumen

El modelo `roberta-large_MBTI_N_MBTI_agg_balanced_50_1e-05_0.05` es un clasificador de texto basado en la arquitectura RoBERTa-large, desarrollado por el usuario DrinkIcedT y publicado en Hugging Face. Está diseñado para la clasificación de tipos de personalidad MBTI (Myers-Briggs Type Indicator), concretamente para la dimensión N (Intuición frente a Sensación), como sugiere el nombre del repositorio. El modelo se presenta como entrenado desde cero sobre un conjunto de datos no especificado, aunque el nombre y la arquitectura indican que se trata de un ajuste fino (fine-tuning) de los pesos de RoBERTa-large.

Con 355 millones de parámetros y una ventana de contexto de 512 tokens, este modelo ofrece una solución especializada para el análisis automático de rasgos de personalidad a partir de texto. Su relevancia radica en la creciente demanda de herramientas de análisis psicológico automatizado en entornos como recursos humanos, marketing o investigación social, donde la clasificación de personalidad puede aportar valor predictivo. La métrica principal reportada es el F1, con un valor de 0,6338 en el conjunto de evaluación, lo que indica un rendimiento moderado para esta tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa-large) |
| Parametros totales | 355.361.794 |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (probablemente ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura RoBERTa-large, un transformer encoder de 24 capas con 16 cabezas de atención y una dimensión oculta de 1024. RoBERTa mejora BERT mediante objetivos de preentrenamiento como enmascaramiento dinámico, empaquetado de frases y lotes más grandes, además de un tokenizador BPE a nivel de bytes. En este caso, el modelo se ha ajustado para la clasificación de personalidad MBTI, probablemente mediante una capa de clasificación sobre la representación del token `[CLS]`.

Según la model card, el entrenamiento se realizó con una tasa de aprendizaje de 1e-05, tamaño de lote de 16 (64 efectivo con 4 GPUs), 5 épocas, optimizador AdamW y un programador de tasa de aprendizaje lineal con 400 pasos de calentamiento. La pérdida de entrenamiento descendió de 2,09 a 0,58, mientras que la pérdida de validación aumentó en las últimas épocas, lo que sugiere un posible sobreajuste. No se menciona el uso de técnicas como RLHF o DPO; el entrenamiento es supervisado estándar con una función de pérdida de entropía cruzada.

## Capacidades

- Clasificacion de texto para tipos de personalidad MBTI, especificamente la dimension N (Intuicion vs Sensacion).
- Generacion de una puntuacion binaria con umbral ajustable (el umbral optimo reportado es 0,78).
- Soporte de entrada de texto en formato de secuencia unica (sin multiples segmentos).
- No soporta tool calling, agentes, vision ni audio.
- Capacidades multilingues no documentadas; probablemente limitado al ingles.
- No incluye modo de razonamiento explicito ni generacion de texto libre.

## Casos de uso

- Analisis de personalidad en redes sociales: el modelo puede clasificar publicaciones o perfiles de usuarios para inferir su tipo MBTI, util en estudios sociologicos o de comportamiento de consumidores. Su ventana de 512 tokens permite procesar textos de longitud media como tweets o comentarios.
- Seleccion de personal en recursos humanos: las empresas pueden usar el modelo para evaluar respuestas de candidatos en cuestionarios abiertos y obtener una indicacion de su perfil de personalidad, complementando pruebas psicometricas tradicionales.
- Recomendacion de contenido personalizado: plataformas de aprendizaje o entretenimiento pueden adaptar sus sugerencias segun el tipo de personalidad detectado en el texto del usuario, mejorando la experiencia de usuario.
- Investigacion en psicologia computacional: los investigadores pueden aplicar el modelo a corpus de texto etiquetados para estudiar correlaciones entre lenguaje y rasgos de personalidad, sin necesidad de etiquetado manual.
- Moderacion de comunidades online: el modelo puede ayudar a identificar perfiles con tendencia a la intuicion o a la sensacion, permitiendo ajustar la moderacion o el diseno de la comunidad segun las preferencias de los miembros.
- Analisis de feedback de clientes: las empresas pueden clasificar las opiniones de clientes segun el perfil de personalidad del autor, lo que permite segmentar las respuestas y adaptar la comunicacion de marca.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados en el conjunto de evaluacion:

| Metrica | Valor |
|---|---|
| Loss | 4,5828 |
| F1 | 0,6338 |
| Threshold | 0,78 |
| F1 at 0,5 | 0,6293 |

No se han publicado comparaciones con otros modelos en la informacion disponible. La evolucion del F1 durante el entrenamiento muestra una mejora progresiva hasta la epoca 3, con un maximo de 0,6488 en el paso 1800, seguido de un ligero descenso y estabilizacion en torno a 0,63.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,4 GB en FP32 (pesos del modelo), por lo que en FP16 se reduce a unos 0,7 GB. Con overhead de activaciones, se recomienda al menos 2-4 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3060, RTX 4090, o GPUs de datacenter como A100 o H100 para despliegue a gran escala.
- Si cabe en consumer GPU: si, en la mayoria de GPUs modernas de gama media y alta.
- Opciones de despliegue: se puede usar con la libreria transformers de Hugging Face, o mediante servidores de inferencia como vLLM, TGI o Triton. Para despliegue ligero, se puede convertir a ONNX o TensorRT.
- Latencia y throughput: no se han publicado datos especificos. En una GPU moderna, la inferencia de una secuencia de 512 tokens deberia completarse en decenas de milisegundos.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (clasificacion de MBTI). Existen otros modelos de clasificacion de personalidad basados en BERT o RoBERTa, pero no se han encontrado datos publicos de rendimiento para establecer una comparacion fiable. Se recomienda evaluar este modelo frente a alternativas como `bert-base-uncased` fine-tuneado para MBTI, aunque no se dispone de resultados en la informacion proporcionada.

## Limitaciones y advertencias

- El conjunto de datos de entrenamiento no esta documentado, lo que impide conocer su composicion, tamano o posibles sesgos.
- La model card indica que el modelo fue "entrenado desde cero", pero el nombre y la arquitectura sugieren un fine-tuning de RoBERTa-large; esta discrepancia no esta aclarada.
- La perdida de validacion aumenta significativamente en las ultimas epocas, lo que sugiere sobreajuste al conjunto de entrenamiento.
- No se especifica la licencia, por lo que el uso comercial puede no estar permitido o requerir contacto con el autor.
- El modelo esta probablemente limitado al ingles y puede no generalizar bien a otros idiomas o registros linguisticos.
- La clasificacion de personalidad a partir de texto es inherentemente subjetiva y puede producir falsos positivos o negativos; no debe usarse como unico criterio en decisiones importantes.
- No se han realizado evaluaciones de sesgo o equidad, por lo que podria presentar sesgos de genero, edad o cultura.

## Enlaces

- Repositorio del modelo: https://huggingface.co/DrinkIcedT/roberta-large_MBTI_N_MBTI_agg_balanced_50_1e-05_0.05
- Variante con tasa de aprendizaje 2e-05: https://huggingface.co/DrinkIcedT/roberta-large_MBTI_N_MBTI_agg_balanced_50_2e-05
- Documentacion de RoBERTa en Transformers: https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/roberta.md
- Model card de RoBERTa-large en CodeSOTA: https://www.codesota.com/model/roberta-large
