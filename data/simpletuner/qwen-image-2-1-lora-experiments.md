# SimpleTuner/Qwen-Image-2.1-LoRA-experiments

## Resumen

Qwen-Image-2.1-LoRA-experiments es un repositorio de adaptadores LoRA y de documentacion de experimentos de entrenamiento sobre el modelo de generacion de imagenes Qwen/Qwen-Image-2.1, publicado por el equipo de SimpleTuner. No es un modelo base autonomo, sino una coleccion de ablaciones, checkpoints y recetas reproducibles orientadas a entender como se comporta el fine-tuning de bajo rango en un modelo text-to-image de gran tamano. El repositorio ocupa 3,6 GB y fue creado el 24 de septiembre de 2026, con la ultima actualizacion el 26 de septiembre de 2026.

El contenido se organiza en ocho capitulos de experimentos que cubren desde el entrenamiento de concepto base hasta asistentes de entrenamiento (v1 y v2), regularizacion sintetica, combinacion de asistente y regularizacion, entrenamiento multi-escala con REPA, barridos de learning rate y entrenamiento prolongado con regresion y recuperacion. Ademas, documenta tres ejecuciones exitosas: Domokun (multi-escala, REPA y auto shift, con checkpoint preferido a 10.000 updates), photo-aesthetics a 50.000 updates y photo-aesthetics v2 con checkpoints cada 10.000 updates. Cada capitulo incluye comparaciones de muestras, observaciones, checkpoints y recetas de reproduccion.

Su relevancia es practica: sirve como referencia metodologica para quien entrene LoRA sobre Qwen-Image-2.1 con SimpleTuner, ya que documenta decisiones concretas (resolucion 512 px frente a 1024 px, uso de asistentes sinteticos, alineacion de caracteristicas con REPA, ajuste de flow shift) y muestra donde aparecen degradaciones, como el caso del learning rate a 3e-4. La model card no incluye especificaciones tecnicas del modelo base ni resultados de benchmarks cuantitativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen/Qwen-Image-2.1; la arquitectura del modelo base no se detalla en la informacion disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other, con license_name qwen-research y LICENSE en el repositorio |
| Formato de pesos | no disponible (el repositorio contiene checkpoints, documentacion y recetas; 3,6 GB) |
| Tipo de modelo | Adaptador LoRA (base_model_relation: adapter) |
| Modelo base | Qwen/Qwen-Image-2.1 |
| Tarea (pipeline) | text-to-image |
| Framework de entrenamiento | SimpleTuner |
| Datasets citados | RareConcepts/Domokun; webshart/qwen-image-2.1-generated-images; webshart/cc12m-structured-captions; webshart/e621-2024-webp-4Mpixel-webshart-indices |
| Fecha de creacion | 2026-09-24 |
| Ultima actualizacion | 2026-09-26 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El objeto de este repositorio son adaptadores LoRA entrenados sobre Qwen-Image-2.1, un modelo de difusion text-to-image propiedad de Qwen. La informacion proporcionada no incluye detalles de la arquitectura del modelo base (numero de parametros, tipo de backbone, mecanismo de atencion, resolucion nativa o espacio latente), por lo que esos datos quedan como no disponibles. Lo que si se documenta es el proceso de entrenamiento de los adaptadores con SimpleTuner y las decisiones de configuracion evaluadas experimentalmente.

Los capitulos de ablacion cubren: entrenamiento de concepto base y su efecto sobre el personaje y sobre sujetos no relacionados; entrenamiento de asistentes con datos sinteticos y mixtos (v1 y v2); entrenamiento de concepto con asistente congelado, incluyendo redaccion de prompts y comparativa 512 px frente a 1024 px; regularizacion sintetica comparando prediccion del modelo base con entrenamiento basado en asistente; combinacion de asistente y regularizacion a dos resoluciones; entrenamiento multi-escala con alineacion de caracteristicas (REPA) y flow shift; barridos de learning rate, con degradacion observada en la ejecucion a 3e-4; y entrenamiento prolongado, analizando regresion y recuperacion a lo largo de la progresion de checkpoints para decidir cuando detener el entrenamiento. No se indica en la informacion disponible si hubo RLHF, DPO ni que composicion exacta de tokens o imagenes se uso.

## Capacidades

- Generacion de imagenes text-to-image mediante adaptadores LoRA aplicados sobre Qwen-Image-2.1.
- Aprendizaje de conceptos y personajes concretos: la ejecucion de referencia aprende el concepto Domokun con entrenamiento multi-escala, REPA y auto shift.
- Mejora de estetica fotografica: existe una receta de 50.000 updates a 512 px con asistente v2 y una referencia entrenada a 1024 px.
- Regularizacion sintetica: uso de imagenes generadas por el propio modelo base para estabilizar el entrenamiento y limitar el olvido de capacidades previas.
- Asistentes de entrenamiento: variantes v1 y v2 que modifican el comportamiento del modelo base y que pueden entrenarse por separado o congelarse durante el entrenamiento de concepto.
- Entrenamiento multi-resolucion: comparativas entre 512 px y 1024 px y mezclas de resoluciones con alineacion de caracteristicas (REPA).
- Control de flow shift y de learning rate como palancas de calidad del resultado.
- Reproduccion completa: cada capitulo incluye ajustes de entrenamiento, ajustes de evaluacion, prompts, guia (guidance) y checkpoints.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes, vision de entrada, audio ni soporte multilingue explicito mas alla del texto de los prompts.

## Casos de uso

- Fine-tuning de un personaje o marca concreta: entrenar un LoRA de bajo rango sobre Qwen-Image-2.1 para reproducir de forma consistente un concepto (por ejemplo, el caso Domokun) sin reentrenar el modelo base, usando la receta multi-escala con REPA y auto shift.
- Generacion de imagenes de producto con estetica controlada: partir de la receta photo-aesthetics v2, que documenta 50.000 updates con checkpoints cada 10.000, para fijar un estilo fotografico estable en un pipeline de generacion de catalogo.
- Regularizacion de datasets propios: emplear las tecnicas de regularizacion sintetica descritas para evitar que el LoRA degradase sujetos no relacionados con el concepto objetivo.
- Construccion de un asistente intermedio de generacion: entrenar un asistente (v1 o v2) que actue como capa de control sobre el modelo base y evaluar su efecto antes de congelarlo y entrenar el concepto encima.
- Reproduccion de experimentos en un laboratorio de investigacion: usar los capitulos de ablacion (learning rate, resolucion, REPA, entrenamiento prolongado) como protocolo comparativo al evaluar nuevas tecnicas de fine-tuning.
- Seleccion de checkpoints en produccion: aplicar el analisis de progresion de checkpoints y regresion del capitulo de entrenamiento prolongado para definir criterios de parada y evitar sobreajuste.
- Ajuste de presupuesto de entrenamiento: comparar la via de entrenamiento a 512 px frente a 1024 px documentada en el repositorio para decidir el coste/calidad segun los recursos disponibles.
- Transferencia de metodologia a otros modelos: las recetas de SimpleTuner documentadas (multi-escala, REPA, flow shift, asistente congelado) son reutilizables como plantilla para otros modelos text-to-image con el mismo framework.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las comparaciones son cualitativas, con una sola semilla de entrenamiento por variante, y que las comparaciones historicas difieren en mas de una variable de entrenamiento. No se proporcionan cifras de FID, CLIP score, precision, recall ni metricas equivalentes.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. La informacion proporcionada no incluye requisitos de memoria; el consumo dependera del modelo base Qwen-Image-2.1 y del formato de pesos empleado, datos que no se detallan.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible. No se especifica si el LoRA o el modelo base caben en GPU de gama consumer.
- Tamano en disco del repositorio: 3,6 GB, que incluye checkpoints y documentacion; a esto hay que sumar el peso del modelo base Qwen-Image-2.1, que se distribuye por separado.
- Opciones de despliegue: el repositorio documenta el entrenamiento con SimpleTuner. No se especifica en la informacion disponible la pila de inferencia recomendada (Diffusers, ComfyUI, etc.).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparacion cuantitativa. Como referencias dentro del mismo autor y mismo modelo base se pueden citar los repositorios hermanos derivados de estas mismas recetas:

| Repositorio | Relacion | Datos comparables |
|---|---|---|
| SimpleTuner/Qwen-Image-2.1-LoRA-experiments | Repositorio principal de ablaciones y recetas | no disponible |
| SimpleTuner/Qwen-Image-2.1-LoRA-photo-aesthetics-50k | Entrenamiento extendido a 512 px con asistente v2, mas referencia a 1024 px | parametros, contexto y licencia: no disponibles en la informacion proporcionada |
| SimpleTuner/Qwen-Image-2.1-LoRA-photo-aesthetics-v2 | Continuacion con 50.000 updates, multi-escala, REPA y auto shift, checkpoints cada 10.000 updates | parametros, contexto y licencia: no disponibles en la informacion proporcionada |

## Limitaciones y advertencias

- Las comparaciones publicadas son cualitativas y usan una unica semilla de entrenamiento por variante; no hay evidencia estadistica de significancia.
- Las comparaciones historicas difieren en mas de una variable de entrenamiento a la vez, por lo que las conclusiones solo aplican a las ejecuciones y muestras mostradas.
- El ajuste de prompt, guia (guidance) y evaluacion se registra por separado en cada rejilla, lo que dificulta comparaciones cruzadas directas.
- Es material experimental (etiqueta "experimental" en los tags del repositorio), no una version estable orientada a produccion.
- Licencia "other" con license_name qwen-research: el texto completo esta en el fichero LICENSE del repositorio, que no se incluye en la informacion disponible. La denominacion "research" aconseja verificar las condiciones antes de cualquier uso comercial del adaptador o de los resultados generados.
- La licencia del adaptador esta ligada al modelo base Qwen/Qwen-Image-2.1, cuyas condiciones de uso deben comprobarse de forma independiente.
- Sin descargas ni likes registrados (0/0): no existe validacion por parte de la comunidad ni informes externos de comportamiento en produccion.
- No se documentan evaluaciones de sesgo, seguridad ni contenido inapropiado. Los datasets citados incluyen CC12M y un indice de e621, fuentes conocidas por contener contenido y sesgos heterogeneos; no se detalla el filtrado aplicado.
- Riesgo de sobreajuste al concepto entrenado y de degradacion de sujetos no relacionados, tal como documenta el propio capitulo de entrenamiento de concepto base.
- No se dispone de informacion sobre idiomas soportados, longitud de contexto, cuantizaciones ni formatos de pesos mas alla de lo indicado como no disponible.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/SimpleTuner/Qwen-Image-2.1-LoRA-experiments
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Experimento 1, baseline concept training: https://huggingface.co/SimpleTuner/Qwen-Image-2.1-LoRA-experiments/blob/main/experiments/baseline.md
- Experimento 2, training assistants v1 y v2: https://huggingface.co/SimpleTuner/Qwen-Image-2.1-LoRA-experiments/blob/main/experiments/training-assistants.md
- Experimento 3, frozen assistant: https://huggingface.co/SimpleTuner/Qwen-Image-2.1-LoRA-experiments/blob/main/experiments/frozen-assistant.md
- Experimento 4, synthetic regularisation: https://huggingface.co/SimpleTuner/Qwen-Image-2.1-LoRA-experiments/blob/main/experiments/synthetic-regularisation.md
- Experimento 5, assistant + regularisation: https://huggingface.co/SimpleTuner/Qwen-Image-2.1-LoRA-experiments/blob/main/experiments/assistant-regularisation.md
- Experimento 6, multi-scale y REPA: https://huggingface.co/SimpleTuner/Qwen-Image-2.1-LoRA-experiments/blob/main/experiments/multiscale-repa.md
- Experimento 7, learning rate: https://huggingface.co/SimpleTuner/Qwen-Image-2.1-LoRA-experiments/blob/main/experiments/learning-rate.md
- Experimento 8, longer training: https://huggingface.co/SimpleTuner/Qwen-Image-2.1-LoRA-experiments/blob/main/experiments/longer-training.md
- Ejecucion Domokun: https://huggingface.co/SimpleTuner/Qwen-Image-2.1-LoRA-experiments/blob/main/runs/domokun.md
- Ejecucion photo-aesthetics 50k: https://huggingface.co/SimpleTuner/Qwen-Image-2.1-LoRA-photo-aesthetics-50k
- Ejecucion photo-aesthetics v2: https://huggingface.co/SimpleTuner/Qwen-Image-2.1-LoRA-photo-aesthetics-v2
- Ajustes compartidos de entrenamiento y evaluacion: https://huggingface.co/SimpleTuner/Qwen-Image-2.1-LoRA-experiments/blob/main/reference/methods.md
- Uso de pesos y recetas: https://huggingface.co/SimpleTuner/Qwen-Image-2.1-LoRA-experiments/blob/main/reference/reproduction.md
- Datos y licencia: https://huggingface.co/SimpleTuner/Qwen-Image-2.1-LoRA-experiments/blob/main/reference/data-and-license.md
- Dataset RareConcepts/Domokun: https://huggingface.co/datasets/RareConcepts/Domokun
- Dataset webshart/qwen-image-2.1-generated-images: https://huggingface.co/datasets/webshart/qwen-image-2.1-generated-images
- Dataset webshart/cc12m-structured-captions: https://huggingface.co/datasets/webshart/cc12m-structured-captions
- Dataset webshart/e621-2024-webp-4Mpixel-webshart-indices: https://huggingface.co/datasets/webshart/e621-2024-webp-4Mpixel-webshart-indices
