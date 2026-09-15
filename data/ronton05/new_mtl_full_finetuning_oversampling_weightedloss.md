# RonTon05/New_MTL_Full_Finetuning_OverSampling_WeightedLoss

## Resumen

New_MTL_Full_Finetuning_OverSampling_WeightedLoss es un modelo de lenguaje encoder basado en la arquitectura RoBERTa, publicado por el usuario RonTon05 en HuggingFace. Se trata de un ajuste fino (fine-tuning completo) del modelo RonTon05/model_content_V2_test, entrenado con una estrategia de aprendizaje multitarea (MTL, Multi-Task Learning) que combina sobremuestreo (oversampling) de clases minoritarias y una funcion de perdida ponderada (weighted loss). El modelo cuenta con 136.385.033 parametros y se distribuye en formato safetensors dentro de un repositorio de 0,5 GB.

El modelo resuelve dos tareas de clasificacion simultaneas (denominadas Task1 y Task2 en la model card, sin describir su naturaleza concreta), y reporta un F1 de 0,9727 en la primera y 0,7492 en la segunda, con un F1 macro de 0,8609 y una perdida de evaluacion de 0,4517. El uso de sobremuestreo y perdida ponderada indica que el autor buscaba mitigar el desbalanceo de clases, un problema habitual en tareas de clasificacion de contenido.

Su relevancia actual es limitada pero concreta: se trata de un modelo especializado y ligero (apto para inferencia en CPU o GPU de gama baja), con licencia AGPL-3.0, que puede servir como referencia para estudiar tecnicas de entrenamiento multitarea con desbalanceo o como base para pipelines de clasificacion de contenido en dos etiquetas. La ausencia de documentacion sobre el dataset, los idiomas y los dominios de las tareas limita su adopcion directa en produccion sin una evaluacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (transformer encoder, ajuste fino completo) |
| Parametros totales | 136.385.033 (aproximadamente 136,4 M) |
| Longitud de contexto | No disponible en la model card; los modelos basados en RoBERTa suelen limitarse a 512 tokens |
| Tipos de cuantizacion | No se documentan cuantizaciones oficiales; al distribuirse en safetensors es posible aplicar FP16 o INT8 dinamico con herramientas estandar (PyTorch, ONNX Runtime) |
| Idiomas soportados | No disponible |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |
| Modelo base | RonTon05/model_content_V2_test |
| Tamano del repositorio | 0,5 GB |
| Descargas / likes | 0 / 0 |
| Libreria | transformers |
| Fecha de creacion | 2026-09-15 |
| Version de frameworks | Transformers 5.17.0, PyTorch 2.10.0+cu128, Datasets 5.0.1, Tokenizers 0.23.2 |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder tipo RoBERTa, el mismo diseno que el modelo base RonTon05/model_content_V2_test del que deriva. Sobre esa base se ha realizado un ajuste fino completo (no se menciona uso de LoRA, QLoRA ni adaptadores), con dos cabezas de clasificacion correspondientes a las dos tareas del esquema multitarea. El modelo tiene 136.385.033 parametros, un tamano coherente con la familia RoBERTa base y una cabeza multitarea anadida.

El entrenamiento se realizo durante 10 epocas con los siguientes hiperparametros: learning rate 2e-05, batch de entrenamiento 128, batch de evaluacion 128, acumulacion de gradientes de 2 pasos (batch total 256), semilla 42, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal con 261 pasos de calentamiento y precision mixta nativa (AMP). El dataset de entrenamiento no se especifica en la model card (aparece como "None"). La innovacion tecnica destacable es la combinacion de sobremuestreo de clases minoritarias con una funcion de perdida ponderada, orientada a mejorar el rendimiento de la tarea con peor F1 (Task2), que pasa de 0,3580 en la epoca 1 a 0,7492 en la epoca 10, mientras que Task1 se mantiene estable en torno a 0,97.

Las curvas de entrenamiento muestran una divergencia entre perdida de entrenamiento (que baja de 0,9477 a 0,1321) y perdida de validacion (que toca minimo en 0,3800 en la epoca 4 y sube despues a 0,4517 en la epoca 10), lo que apunta a un sobreajuste progresivo a partir de la cuarta o quinta epoca, aunque las metricas F1 siguen mejorando ligeramente hasta el final.

## Capacidades

- Clasificacion de texto multitarea: el modelo produce predicciones simultaneas para dos tareas de clasificacion (Task1 y Task2), segun el esquema de entrenamiento multitarea.
- Clasificacion de contenido: por el nombre del modelo base (model_content_V2_test), el dominio probable es la clasificacion de contenido, aunque la model card no lo confirma.
- Manejo de desbalanceo de clases: entrenado con sobremuestreo y perdida ponderada, lo que deberia mejorar el rendimiento en clases minoritarias.
- Rendimiento alto en Task1: F1 de 0,9727 y exactitud de 0,9789 en el conjunto de evaluacion.
- Rendimiento medio en Task2: F1 de 0,7492 y exactitud de 0,9160, con margen de mejora.
- Inferencia ligera: 136,4 M de parametros permiten ejecucion en CPU y en GPU de gama baja.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso (es un encoder de clasificacion, no un modelo generativo).
- Capacidades multilingues: no disponible.
- No se documentan capacidades de vision, audio ni modo de pensamiento.

## Casos de uso

- Moderacion y clasificacion de contenido: el modelo puede etiquetar texto en dos categorias simultaneas dentro de un pipeline de moderacion, aprovechando su doble cabeza de clasificacion y su bajo coste de inferencia (136,4 M de parametros en CPU o GPU de gama baja).
- Etiquetado automatico de datasets: al ser un modelo multitarea, puede usarse para preanotar grandes volumenes de texto en dos etiquetas a la vez, reduciendo el trabajo manual en proyectos de anotacion; es especialmente util si el dataset de destino tiene un desbalanceo similar al que el modelo fue entrenado a manejar.
- Enrutamiento de tickets o consultas: en un sistema de atencion al cliente, el modelo puede clasificar cada ticket en dos dimensiones (por ejemplo, tipo de incidencia y urgencia), siempre que se reentrene o valide con datos del dominio concreto.
- Filtrado de resenas o comentarios: clasificacion de textos de usuario en dos categorias (por ejemplo, spam/no spam y toxicidad/no toxicidad), con la ventaja de que la perdida ponderada ayuda en categorias poco frecuentes.
- Analisis de documentos en compliance: clasificacion de fragmentos documentales en dos ejes (tipo de documento y nivel de riesgo), integrable en un servicio de inferencia ligero sin necesidad de GPUs dedicadas.
- Prototipado e investigacion en aprendizaje multitarea: sirve como referencia reproducible para estudiar el efecto del sobremuestreo y la perdida ponderada frente a un ajuste fino estandar, gracias a las curvas de entrenamiento completas publicadas.
- Clasificacion en tiempo real de bajo coste: con 0,5 GB de repositorio, el modelo puede desplegarse en un contenedor pequeno y servir peticiones con latencia baja en CPU (latencia concreta no disponible), adecuado para filtros previos en un flujo de datos.
- Extraccion de caracteristicas (uso secundario): al ser un encoder RoBERTa, las representaciones internas pueden aprovecharse para tareas auxiliares de similitud o clustering, aunque el modelo no se publica como modelo de embeddings y requeriria validacion.

## Benchmarks y rendimiento

La model card declara un model-index sin resultados (`results: []`), por lo que los unicos datos disponibles son las metricas de evaluacion reportadas por el propio autor durante el entrenamiento (no verificadas de forma independiente).

Metricas finales en el conjunto de evaluacion:

| Metrica | Valor |
|---|---|
| Loss | 0,4517 |
| F1 Task1 | 0,9727 |
| F1 Task2 | 0,7492 |
| Accuracy Task1 | 0,9789 |
| Accuracy Task2 | 0,9160 |
| F1 Macro | 0,8609 |

Evolucion por epoca (validacion):

| Epoca | Paso | Validation loss | F1 Task1 | F1 Task2 | Acc Task1 | Acc Task2 | F1 macro |
|---|---|---|---|---|---|---|---|
| 1.0 | 261 | 0,6483 | 0,9686 | 0,3580 | 0,9757 | 0,8208 | 0,6633 |
| 2.0 | 522 | 0,4314 | 0,9709 | 0,7120 | 0,9774 | 0,8852 | 0,8414 |
| 3.0 | 783 | 0,3812 | 0,9722 | 0,7348 | 0,9786 | 0,9047 | 0,8535 |
| 4.0 | 1044 | 0,3800 | 0,9742 | 0,7434 | 0,9800 | 0,9074 | 0,8588 |
| 5.0 | 1305 | 0,3895 | 0,9728 | 0,7440 | 0,9790 | 0,9115 | 0,8584 |
| 6.0 | 1566 | 0,4031 | 0,9731 | 0,7459 | 0,9791 | 0,9108 | 0,8595 |
| 7.0 | 1827 | 0,4297 | 0,9734 | 0,7460 | 0,9794 | 0,9157 | 0,8597 |
| 8.0 | 2088 | 0,4305 | 0,9731 | 0,7487 | 0,9792 | 0,9180 | 0,8609 |
| 9.0 | 2349 | 0,4515 | 0,9743 | 0,7511 | 0,9801 | 0,9172 | 0,8627 |
| 10.0 | 2610 | 0,4517 | 0,9727 | 0,7492 | 0,9789 | 0,9160 | 0,8609 |

No se dispone de resultados en benchmarks estandar (MMLU, GLUE, SuperGLUE, etc.) ni de comparaciones independientes.

## Requisitos de hardware

- Memoria estimada para inferencia: aproximadamente 0,55 GB en FP32, unos 273 MB en FP16 y unos 137 MB en INT8 (calculado sobre 136.385.033 parametros; no son cifras oficiales).
- Caben en practicamente cualquier GPU de consumo: GTX 1050 Ti, GTX 1660, RTX 3060, RTX 4090, asi como en GPUs de centro de datos (A100, H100) sin aprovechar su capacidad.
- Ejecucion viable en CPU para cargas moderadas, dado el tamano reducido del modelo.
- Opciones de despliegue: HuggingFace Transformers (pipeline de clasificacion de texto), exportacion a ONNX Runtime, TorchScript, empaquetado en contenedores con Triton Inference Server o BentoML. vLLM no es la opcion natural para un encoder de clasificacion; llama.cpp y Ollama no estan orientados a este tipo de modelo.
- Latencia y throughput concretos: no disponible (no se publican mediciones).
- Espacio en disco: repositorio de 0,5 GB.

## Comparativa con modelos similares

La model card no identifica modelos comparables directos. Como referencia de la misma familia y tamano, se incluye una comparacion con encoders genericos ampliamente conocidos; los datos de estos ultimos proceden de sus especificaciones publicas, no de la informacion proporcionada por el autor.

| Modelo | Parametros | Contexto tipico | Licencia | Disponibilidad |
|---|---|---|---|---|
| RonTon05/New_MTL_Full_Finetuning_OverSampling_WeightedLoss | 136,4 M | No disponible (RoBERTa suele 512) | AGPL-3.0 | HuggingFace, 0 descargas |
| roberta-base | Aproximadamente 125 M | 512 tokens | MIT | HuggingFace, ampliamente adoptado |
| deberta-v3-base | Aproximadamente 184 M | 512 tokens | MIT | HuggingFace, ampliamente adoptado |
| bert-base-uncased | Aproximadamente 110 M | 512 tokens | Apache-2.0 | HuggingFace, ampliamente adoptado |

No se dispone de una comparativa de rendimiento directa: el modelo no publica resultados en benchmarks estandar ni frente a alternativas, y las tareas Task1 y Task2 no estan descritas, por lo que no es posible equipararlas con conjuntos publicos.

## Limitaciones y advertencias

- Documentacion practicamente inexistente: la model card indica "More information needed" en descripcion, usos previstos, limitaciones y datos de entrenamiento; no se especifica el dataset, los idiomas ni el dominio de las tareas.
- Licencia AGPL-3.0: es una licencia copyleft fuerte. El uso comercial en un servicio accesible por red obliga a liberar el codigo fuente completo de la aplicacion derivada, lo que puede ser un impedimento en entornos propietarios.
- Tareas no identificadas: Task1 y Task2 no se describen, por lo que no es posible saber que etiquetas produce el modelo sin inspeccionar la configuracion o el codigo de entrenamiento.
- Sobreajuste probable: la perdida de validacion alcanza su minimo en la epoca 4 (0,3800) y sube hasta 0,4517 en la epoca 10, mientras la perdida de entrenamiento sigue bajando; las metricas F1 mejoran solo marginalmente tras la epoca 5.
- Task2 con rendimiento limitado: F1 de 0,7492 y exactitud de 0,9160, sensiblemente peores que Task1 (F1 0,9727), pese al sobremuestreo y la perdida ponderada. Indica un problema de clases o una tarea intrinsecamente mas dificil que no se ha resuelto.
- El sobremuestreo puede introducir sesgo hacia las clases minoritarias replicadas, alterando la calibracion de probabilidades.
- Riesgo de sesgos desconocido: al no documentarse el dataset, no se puede evaluar el sesgo de genero, raza, idioma o dominio.
- Riesgo de alucinacion no aplicable en sentido estricto (es un clasificador, no genera texto), pero si puede producir etiquetas erroneas con alta confianza en entradas fuera de distribucion.
- Cobertura idiomatica no declarada: no hay garantia de funcionamiento fuera del idioma o idiomas del dataset de entrenamiento.
- Modelo sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso en produccion ni validacion por terceros.
- Los resultados reportados son autodeclarados por el autor y no han sido verificados de forma independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RonTon05/New_MTL_Full_Finetuning_OverSampling_WeightedLoss
- Modelo base: https://huggingface.co/RonTon05/model_content_V2_test
- No se han encontrado en la busqueda web enlaces relevantes al modelo (los resultados devueltos corresponden a paginas sobre DirectX y no guardan relacion con este modelo).
