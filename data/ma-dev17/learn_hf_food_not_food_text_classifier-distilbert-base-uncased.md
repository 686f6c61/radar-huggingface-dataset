# MA-dev17/learn_hf_food_not_food_text_classifier-distilbert-base-uncased

## Resumen

Este modelo es un clasificador binario de texto basado en DistilBERT, la version destilada de BERT desarrollada por Hugging Face. El autor, MA-dev17, ha ajustado el modelo base `distilbert/distilbert-base-uncased` para clasificar textos como relacionados con comida o no relacionados con comida. Se trata de un proyecto de aprendizaje (el nombre "learn_hf" sugiere un ejercicio formativo con el ecosistema Hugging Face) y el dataset de entrenamiento no se ha publicado.

El modelo tiene 66,9 millones de parametros, una ventana de contexto de 512 tokens y se distribuye bajo licencia Apache 2.0. El repositorio ocupa 0,3 GB y los pesos estan en formato safetensors. Aunque el autor reporta una precision del 100 % en el conjunto de evaluacion, este resultado es sospechosamente alto y probablemente indica sobreajuste, dado el reducido numero de pasos de entrenamiento (70 pasos en total). No se han publicado benchmarks externos ni evaluaciones independientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder, 6 capas, 12 cabezas de atencion) |
| Parametros totales | 66.955.010 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (solo safetensors en precision completa) |
| Idiomas soportados | no disponible (el modelo base esta entrenado principalmente en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en DistilBERT, una version destilada de BERT que conserva el 97 % de su rendimiento con un 40 % menos de parametros. La arquitectura es un transformer encoder de 6 capas con 12 cabezas de atencion y 768 dimensiones ocultas. El modelo base fue preentrenado con masked language modeling sobre Wikipedia y BookCorpus en ingles.

El ajuste fino se realizo sobre un dataset no publicado, con los siguientes hiperparametros: learning rate de 0,0001, batch size de 32, optimizador AdamW con betas (0,9, 0,999), scheduler lineal y 10 epocas. El entrenamiento completo consto de solo 70 pasos (7 pasos por epoca), lo que indica un dataset de entrenamiento muy pequeno. No se menciona el uso de tecnicas como RLHF o DPO; se trata de un ajuste supervisado clasico.

## Capacidades

- Clasificacion binaria de texto: determina si un texto esta relacionado con comida o no.
- Procesamiento de texto en ingles (heredado del modelo base, aunque no se especifica en la model card).
- Inferencia rapida gracias a la arquitectura destilada, adecuada para despliegue en entornos con recursos limitados.
- Compatible con la libreria transformers y con endpoints de Hugging Face para despliegue en un clic.
- No soporta tool calling, generacion de codigo, razonamiento multi-paso ni capacidades multimodales.

## Casos de uso

- Moderacion de contenido en redes sociales: el modelo puede filtrar publicaciones que mencionen comida para categorizarlas automaticamente en secciones tematicas, aprovechando su baja latencia para procesar volumenes altos de texto.
- Clasificacion de resenas de restaurantes: permite separar resenas que hablan de la comida de aquellas que se centran en el servicio o el ambiente, facilitando el analisis de sentimiento segmentado.
- Filtrado de datos para pipelines de recomendacion: en aplicaciones de recetas o delivery, el modelo puede pre-clasificar consultas de usuarios para dirigirlas al motor de busqueda adecuado.
- Etiquetado automatico de articulos de prensa gastronomica: un medio puede usar el clasificador para etiquetar automaticamente noticias relacionadas con alimentacion antes de la revision editorial.
- Deteccion de menciones de comida en chats de soporte: en plataformas de atencion al cliente, el modelo puede identificar conversaciones que requieren derivacion a un equipo especializado en pedidos de comida.
- Proyectos educativos de NLP: dado su origen como ejercicio de aprendizaje, es util como ejemplo de referencia para estudiantes que quieran entender el flujo completo de fine-tuning con Hugging Face Trainer.

## Benchmarks y rendimiento

El modelo-index de la model card no incluye resultados de benchmarks externos. El autor reporta los siguientes resultados en el conjunto de evaluacion durante el entrenamiento:

| Metrica | Valor |
|---|---|
| Loss de evaluacion | 0,0005 |
| Accuracy de evaluacion | 1,0 |

Resultados de entrenamiento por epoca:

| Training Loss | Epoch | Step | Validation Loss | Accuracy |
|:-------------:|:-----:|:----:|:---------------:|:--------:|
| 0,3357 | 1.0 | 7 | 0,0404 | 1.0 |
| 0,0196 | 2.0 | 14 | 0,0056 | 1.0 |
| 0,0039 | 3.0 | 21 | 0,0022 | 1.0 |
| 0,0018 | 4.0 | 28 | 0,0013 | 1.0 |
| 0,0012 | 5.0 | 35 | 0,0009 | 1.0 |
| 0,0009 | 6.0 | 42 | 0,0007 | 1.0 |
| 0,0008 | 7.0 | 49 | 0,0006 | 1.0 |
| 0,0007 | 8.0 | 56 | 0,0006 | 1.0 |
| 0,0007 | 9.0 | 63 | 0,0006 | 1.0 |
| 0,0006 | 10.0 | 70 | 0,0005 | 1.0 |

Estos datos deben interpretarse con cautela: una accuracy del 100 % desde la primera epoca, junto con un dataset de solo 70 pasos, sugiere un conjunto de evaluacion muy pequeno o solapado con el de entrenamiento. No hay evidencia de generalizacion a datos reales.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB en fp32 (el modelo pesa ~268 MB en safetensors). Con cuantizacion a fp16 o int8, cabria en menos de 500 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Una NVIDIA GTX 1650, RTX 3060 o incluso una CPU moderna pueden ejecutar inferencia sin problemas.
- Compatible con hardware de consumo: si, es uno de los modelos mas ligeros de la familia BERT.
- Opciones de despliegue: transformers (Python), ONNX Runtime, TensorFlow Lite, o mediante los endpoints de Hugging Face (el modelo esta marcado como `endpoints_compatible`).
- Latencia estimada: en una GPU consumer, la inferencia de un solo texto tarda entre 5 y 20 ms. En CPU, entre 50 y 200 ms segun la longitud del texto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy reportada | Licencia | Notas |
|---|---|---|---|---|---|
| MA-dev17/learn_hf_food_not_food (este modelo) | 66,9 M | 512 | 1,0 (evaluacion del autor) | Apache 2.0 | Dataset no publicado, sin benchmarks externos |
| matt0017/learn_hf_food_not_food_text_classifier-distilbert-base-uncased | 66,9 M | 512 | 1,0 (evaluacion del autor) | Apache 2.0 | Mismo modelo base, mismo enfoque, autor distinto |
| tanvircr7/learn_hf_food_not_food_text_classifier-distilbert-base-uncased | 66,9 M | 512 | 1,0 (evaluacion del autor) | Apache 2.0 | Mismo modelo base, loss de evaluacion 0,0006 |

Los tres modelos son practicamente identicos: mismo base, misma tarea y resultados de evaluacion casi iguales. Esto refuerza la hipotesis de que se trata de un ejercicio formativo repetido por varios usuarios. No hay comparacion posible con modelos de clasificacion de texto comerciales o de mayor tamano, ya que no se han publicado evaluaciones estandarizadas (MMLU, GLUE, etc.).

## Limitaciones y advertencias

- Dataset de entrenamiento no publicado: no es posible verificar la calidad ni la composicion de los datos de entrenamiento, lo que impide evaluar la generalizacion del modelo.
- Accuracy del 100 % en evaluacion: resultado sospechosamente perfecto que indica probable sobreajuste o un conjunto de evaluacion trivial. No debe interpretarse como rendimiento real en produccion.
- Sin benchmarks externos: no hay resultados en GLUE, SuperGLUE ni ninguna otra referencia estandar que permita comparar con otros clasificadores.
- Idioma limitado: el modelo base esta entrenado principalmente en ingles; el rendimiento en otros idiomas no esta garantizado y no se ha evaluado.
- Tarea muy especifica: solo clasifica texto como comida o no comida. No es util para otras tareas de clasificacion sin un nuevo fine-tuning.
- Riesgo de alucinacion en clasificacion: al ser un clasificador binario, textos ambiguos o fuera de dominio se asignaran a una de las dos clases con cierta probabilidad, sin mecanismo de abstencion.
- Sin mantenimiento activo: el modelo tiene 0 descargas y 0 likes, y no hay evidencia de que el autor vaya a actualizarlo o corregirlo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/MA-dev17/learn_hf_food_not_food_text_classifier-distilbert-base-uncased
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Version de matt0017: https://huggingface.co/matt0017/learn_hf_food_not_food_text_classifier-distilbert-base-uncased
- Version de tanvircr7: https://huggingface.co/tanvircr7/learn_hf_food_not_food_text_classifier-distilbert-base-uncased
- Ficha en AIBase: https://model.aibase.com/models/details/1915748764360531970
- Ficha alternativa en AIBase: https://model.aibase.com/models/details/1924735252866273280
