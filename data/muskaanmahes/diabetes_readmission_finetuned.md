# muskaanmahes/diabetes_readmission_finetuned

## Resumen

`diabetes_readmission_finetuned` es un modelo de clasificación de texto desarrollado por muskaanmahes, obtenido mediante fine-tuning de `distilbert-base-uncased` sobre un dataset de readmisiones hospitalarias de pacientes diabéticos. Su objetivo es clasificar si un paciente será readmitido en el hospital dentro de los 30 días posteriores a un alta, una tarea de gran relevancia clínica para la gestión de recursos sanitarios y la mejora de la atención al paciente.

El modelo se presenta como una herramienta de clasificación de texto con 66,9 millones de parámetros, basada en la arquitectura DistilBERT, una versión destilada y más eficiente de BERT que conserva el 95% del rendimiento con un 40% menos de parámetros. La ventana de contexto estándar de DistilBERT es de 512 tokens, lo que limita su uso a registros clínicos de longitud moderada.

La relevancia de este modelo radica en su aplicación potencial en el ámbito sanitario para la identificación temprana de pacientes de alto riesgo de reingreso, lo que permitiría intervenciones dirigidas y una asignación más eficiente de los recursos hospitalarios. Sin embargo, los resultados de evaluación publicados en la model card muestran un rendimiento cercano al azar (ROC AUC de 0,4979), lo que indica que el modelo no ha aprendido patrones predictivos útiles y no es apto para uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformador encoder, no MoE) |
| Parametros totales | 66.955.010 |
| Parametros activos | no disponible (arquitectura densa) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (modelo base entrenado en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en DistilBERT, una arquitectura transformer encoder destilada de BERT-base mediante destilacion de conocimiento. DistilBERT conserva el 95% del rendimiento de BERT-base con un 40% menos de parametros, usando 6 capas en lugar de 12, y mantiene la misma configuracion de atencion multi-cabeza. La longitud de contexto es de 512 tokens, limitacion estandar de los modelos BERT.

El proceso de entrenamiento se realizo con el Trainer de HuggingFace Transformers, con los siguientes hiperparametros: learning rate de 2e-05, batch size de 16 tanto para entrenamiento como evaluacion, seed 42, optimizador AdamW (variante torch fused) con betas de (0.9, 0.999) y epsilon de 1e-08, scheduler lineal y una unica epoca de entrenamiento. El dataset de entrenamiento no esta especificado en la model card, pero por el contexto de la tarea y las referencias encontradas, es probable que se trate del dataset UCI Diabetes 130-US Hospitals (1999-2008), que contiene registros de pacientes diabeticos con datos demograficos, clinicos y de estancia hospitalaria.

El entrenamiento se realizo en 100 pasos con una loss de entrenamiento de 0,6947. No se menciona el uso de tecnicas adicionales como RLHF, DPO o data augmentation. La model card indica que fue generada automaticamente, lo que sugiere que el autor no anadio informacion adicional sobre el proceso de entrenamiento.

## Capacidades

- Clasificacion de texto binaria: el modelo esta disenado para clasificar si un paciente diabetico sera readmitido en el hospital dentro de los 30 dias posteriores al alta.
- Procesamiento de texto en ingles: el modelo base distilbert-base-uncased esta entrenado en texto ingles y no diferencia mayusculas, por lo que la entrada debe ser texto en ingles.
- No soporta tool calling ni function calling: la arquitectura de encoder de DistilBERT no esta disenada para generacion autoregresiva ni para integracion con herramientas externas.
- No soporta agentes ni razonamiento multi-paso: su capacidad se limita a clasificacion de secuencias completas.
- Capacidades multilingues: no disponible, el modelo base solo soporta ingles.
- No dispone de modo de pensamiento, vision ni audio: es exclusivamente un modelo de clasificacion de texto.

## Casos de uso

- Evaluacion de riesgo de reingreso en pacientes diabeticos: el modelo puede procesar historiales clinicos en texto para identificar pacientes con alto riesgo de reingreso en 30 dias. Sin embargo, su bajo rendimiento (ROC AUC de 0,4979) impide su uso en entornos clinicos reales, donde un falso positivo o negativo tiene consecuencias directas sobre la salud del paciente.
- Triaje de pacientes en urgencias: con un rendimiento adecuado, podria priorizar recursos para pacientes con mayor probabilidad de reingreso, reduciendo costes y mejorando la atencion. El modelo actual no cumple los minimos de precision necesarios.
- Investigacion academica: el modelo puede servir como referencia para estudiantes o investigadores que estudien el proceso de fine-tuning de DistilBERT en tareas de clasificacion de texto, aunque no como modelo de produccion.
- Benchmark de modelos de clasificacion: los resultados publicados pueden usarse como punto de partida para comparar con otros modelos o para analizar los efectos de la eleccion de hiperparametros en tareas de clasificacion con datos tabulares convertidos a texto.
- Desarrollo de pipelines de ML en salud: el repositorio puede ser util para desarrolladores que quieran estudiar el flujo completo de fine-tuning de transformers en el dominio sanitario, desde la preparacion de datos hasta la evaluacion.
- Analisis de errores de modelos de clasificacion: el bajo rendimiento del modelo ofrece un caso de estudio para analizar por que un modelo de clasificacion puede fallar, incluyendo problemas de desbalance de clases, preprocesamiento inadecuado o eleccion de hiperparametros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye resultados de evaluacion sobre el conjunto de validacion del propio entrenamiento:

| Metrica | Valor |
|---|---|
| Loss | 0,6939 |
| Accuracy | 0,495 |
| Precision | 0,495 |
| Recall | 1,0 |
| F1 | 0,6622 |
| ROC AUC | 0,4979 |

Estos resultados indican que el modelo predice la clase mayoritaria (todos los casos como positivos), logrando un recall perfecto pero una precision baja, con una ROC AUC cercana a 0,5, equivalente a un clasificador aleatorio. No se han publicado comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 66,9 millones de parametros, con un peso de aproximadamente 268 MB en precision float32. En float16, el peso es de unos 134 MB, por lo que cabria en cualquier GPU moderna con al menos 2 GB de VRAM, incluidas las GPUs integradas de laptops recientes.
- GPUs recomendadas: cualquier GPU con 4 GB de VRAM o superior (GTX 1650, RTX 3060, etc.) es suficiente para inferencia. Para entrenamiento, se requiere al menos 8 GB de VRAM para manejar el batch de 16 con la longitud de contexto de 512 tokens.
- Se puede ejecutar en CPU para inferencia, con una latencia de alrededor de 50-100 ms por muestra en un procesador moderno.
- Opciones de despliegue: el formato safetensors es compatible con transformers, lo que permite su uso con librerias como vLLM, Hugging Face Inference Endpoints, o mediante ONNX Runtime para optimizacion en produccion.
- No se recomienda su despliegue en produccion dado el rendimiento insuficiente del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ROC AUC | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| diabetes_readmission_finetuned | 66,9 M | 512 | 0,4979 | Apache 2.0 | HuggingFace |
| aai540-group3/diabetes-readmission | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| MagangaM/Diabetes-Hospital-Readmission-Prediction | no aplica (ML tradicional) | no aplica | no disponible | no disponible | GitHub |

No se dispone de informacion publica sobre benchmarks comparativos entre estos modelos. Los proyectos de GitHub y HuggingFace encontrados abordan el mismo problema (prediccion de reingreso hospitalario de pacientes diabeticos) pero con enfoques de machine learning clasico (Random Forest, XGBoost, etc.) sobre el dataset UCI, no con transformers. La comparativa directa no es posible por la falta de datos publicados.

## Limitaciones y advertencias

- Rendimiento insuficiente: el modelo muestra un ROC AUC de 0,4979, equivalente a una clasificacion aleatoria. No es util para prediccion real y puede generar falsos positivos y falsos negativos en proporciones significativas.
- Datos desbalanceados: el recall de 1,0 y precision de 0,495 indican que el modelo predice la clase mayoritaria (readmision) para todos los ejemplos, sin discriminar entre clases. Esto sugiere un problema de desbalance de datos que no fue tratado.
- Falta de informacion sobre el dataset: la model card no especifica el dataset de entrenamiento, su tamano, composicion ni metodo de preprocesamiento. Esto impide evaluar la generalizacion del modelo.
- Model card incompleta: la card fue generada automaticamente y las secciones de descripcion, usos previstos, limitaciones y datos de entrenamiento indican "More information needed".
- Sesgos potenciales: al ser un modelo basado en distilbert-base-uncased, puede heredar sesgos presentes en los datos de entrenamiento de BERT (textos de Wikipedia y libros), y el dataset de readmision de pacientes diabeticos puede tener sesgos demograficos, geograficos y temporales (datos de hospitales de EE. UU. entre 1999 y 2008).
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, pero no incluye clausulas de indemnizacion ni garantias de exactitud.
- Idioma: el modelo solo procesa texto en ingles; cualquier entrada en otro idioma producira resultados no significativos.
- No apto para produccion: dado el rendimiento observado, no se recomienda su uso en entornos clinicos reales ni en sistemas de soporte a decisiones medicas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/muskaanmahes/diabetes_readmission_finetuned
- Perfil del autor en HuggingFace: https://huggingface.co/muskaanmahes
- Modelo similar en HuggingFace: https://huggingface.co/aai540-group3/diabetes-readmission
- Repositorio GitHub de MagangaM (proyecto de prediccion de reingreso): https://github.com/MagangaM/Diabetes-Hospital-Readmission-Prediction
- Repositorio GitHub de muhsinasafeeth (proyecto de prediccion de reingreso): https://github.com/muhsinasafeeth/diabetes-readmission/tree/main
- Articulo cientifico sobre analitica predictiva en diabetes: https://www.techscience.com/CMES/v143n1/60445/html
