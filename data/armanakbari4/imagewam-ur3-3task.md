# armanakbari4/imagewam-ur3-3task

## Resumen

ImageWAM-FLUX.2-4B es un ajuste fino sobre robot real del framework ImageWAM, que reformula los modelos de edicion de imagen preentrenados como modelos de accion-mundo (world action models) para prediccion de acciones roboticas. Este checkpoint concreto, publicado por Arman Akbari, adapta el modelo base ImageWAM (FLUX.2 klein 4B de edicion DiT + experto de acciones ActionDiT) a un robot bimanual de doble brazo UR3, entrenado conjuntamente en tres tareas: colocacion de objetos en cesta, manipulacion de cajon y apilado de cubos.

El modelo se inicializa desde el pretrain ImageWAM-FLUX.2-4B-InternData-A1-EE (paso 60k) y se entrena con 300 episodios y 99.677 fotogramas a 15 fps. La arquitectura combina un DiT de edicion de imagenes de 4B con un experto de acciones de aproximadamente 8.2B de parametros, operando sobre un mosaico de camaras de 288x256 y un horizonte de acciones de 16 pasos. Su relevancia radica en demostrar que la edicion de imagenes puede sustituir a la generacion de video en modelos de accion-mundo, reduciendo coste computacional y complejidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ImageWAM: DiT de edicion de imagenes FLUX.2 klein-base-4B + experto de acciones ActionDiT |
| Parametros totales | ~12.2B (8.2B ActionDiT + 4B base FLUX.2); los checkpoints solo contienen ~8.2B (mot) + proprio_encoder |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 17 fotogramas de entrada, horizonte de acciones de 16 pasos (action_video_freq_ratio=1) |
| Tipos de cuantizacion | No disponible (entrenado en bf16) |
| Idiomas soportados | No disponible (instrucciones de tarea en ingles) |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pt), ~9.0 GB por checkpoint |

## Arquitectura y entrenamiento

ImageWAM se basa en la hipotesis de que los modelos de accion-mundo no necesitan generacion de video, sino edicion de imagenes. La arquitectura combina un DiT de edicion de imagenes FLUX.2 klein de 4B con un experto de acciones ActionDiT, procesando un mosaico de camaras de 288x256 (camara superior 192x256 arriba, dos camaras de muneca 96x128 abajo, orden fijo [superior, izquierda, derecha]) con pixeles normalizados a (-1, 1). El espacio de acciones del UR3 es de 14 dimensiones (articulaciones), rellenado a 16D en las dimensiones 7 y 15 para compatibilidad con el pretrain.

El entrenamiento se realizo con lr 2.5e-5 en coseno con 5% de warmup, AdamW (0.9, 0.95), weight decay 1e-2, grad-clip 1.0, bf16 y DeepSpeed ZeRO-1. El batch global fue de 192 (8 por GPU x 6 GPUs x 4 acumulaciones de gradiente), durante 10.000 pasos (~19 epocas), completado en ~9.6 horas en 6xH100. Se usaron 300 episodios (99.677 fotogramas) distribuidos en tres tareas: blue_basket (100 episodios, 29.653 fotogramas), drawer (100 episodios, 32.982 fotogramas) y stacking_cubes (100 episodios, 37.042 fotogramas). La carga del pretrain se verifico con 0 claves faltantes y 0 inesperadas.

## Capacidades

- Prediccion de acciones roboticas de 16 pasos a partir de observaciones visuales de multiples camaras.
- Control bimanual de doble brazo UR3 con espacio de acciones articulares de 14 dimensiones.
- Ejecucion de tres tareas de manipulacion aprendidas conjuntamente: colocacion de objetos en cesta, apertura/cierre de cajon con insercion de objeto, y apilado de tres cubos de colores.
- Aprendizaje por imitacion a partir de demostraciones reales (300 episodios).
- Procesamiento de mosaico de camaras fijo (superior + dos munecas) con normalizacion de pixeles a (-1, 1).
- Desnormalizacion de acciones mediante estadisticas z-score especificas del dataset (archivo JSON requerido en inferencia).
- Soporte de endpoint_frames_only para reducir coste computacional en la prediccion.

## Casos de uso

- Manipulacion de objetos en almacen: la tarea blue_basket entrena al modelo para colocar objetos especificos (cinta metrica, medicamento) en una cesta azul, util para automatizar tareas de picking y packing en logistica con brazos UR3.
- Gestion de cajones y contenedores: la tarea drawer cubre el ciclo completo de abrir un cajon, insertar un objeto y cerrarlo, aplicable a estaciones de trabajo robotizadas en entornos industriales o de laboratorio.
- Apilado de objetos con precision: la tarea stacking_cubes demuestra apilado de tres cubos de colores en orden especifico, relevante para paletizado y ensamblaje de piezas.
- Evaluacion de politicas de control robotico: el modelo proporciona una metrica offline (action_l1) para comparar checkpoints y politicas sin necesidad de despliegue fisico, aunque el autor advierte que debe validarse con tasa de exito real.
- Investigacion en world action models: sirve como referencia para comparar el enfoque de edicion de imagenes frente a generacion de video en robotica, con el codigo base disponible en el repositorio oficial de ImageWAM.
- Aprendizaje por imitacion multi-tarea: el entrenamiento conjunto de tres tareas en un unico modelo permite estudiar la transferencia entre habilidades y la escalabilidad del enfoque a mas tareas.
- Despliegue en robotica de bajo coste: al usar un UR3 de doble brazo y camaras de muneca, el modelo es adecuado para entornos de investigacion y laboratorio con presupuesto limitado.

## Benchmarks y rendimiento

La metrica principal reportada es el error L1 de acciones (action_l1) en datos reservados (held-out), evaluado en 32 clips:

| Checkpoint | action_l1 (held-out) |
|---|---|
| step 2000 | 0.0299 |
| step 3000 | 0.0304 |
| step 4000 | 0.0281 (nominal best) |
| step 7000 | 0.0295 |
| step 10000 | 0.0341 (final) |

La loss de entrenamiento (loss_action) cayo 21x durante el run (0.0917 a 0.0043), pero el action_l1 held-out apenas vario: por tercios de entrenamiento 0.0344 a 0.0325 a 0.0306, con pendiente de regresion de -0.00053 por 1.000 pasos (t = -2.14) en 20 evaluaciones. El ruido por evaluacion (sd 0.0034) es mayor que la diferencia entre cualquier par de checkpoints, por lo que los cinco son estadisticamente indistinguibles. El autor advierte que el action_l1 offline no ha sido validado contra la tasa de exito real del robot y que la seleccion de checkpoint debe basarse en exito real, no en esta metrica.

## Requisitos de hardware

- Entrenamiento: 6xH100 con DeepSpeed ZeRO-1, ~9.6 horas para 10.000 pasos.
- Checkpoints: ~9.0 GB cada uno (solo partes entrenadas: mot ~8.2B + proprio_encoder); el repositorio completo ocupa 45.2 GB.
- Pesos base: se requieren por separado los pesos de FLUX.2 klein-base-4B y el autoencoder, no incluidos en el repositorio.
- Inferencia: estimacion de ~24 GB en bf16 para los ~12.2B de parametros totales, mas activaciones y autoencoder; se recomienda una GPU con 32 GB o mas (A100 40GB, H100 80GB) o cuantizacion si se dispone de ella (no documentada).
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp u Ollama; al ser un modelo de robotica en PyTorch, el despliegue seria mediante el pipeline de inferencia de ImageWAM.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Metrica | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ImageWAM-FLUX.2-4B-UR3-3task (este) | ~12.2B | 17 frames / 16 acciones | action_l1 0.0281 | MIT | Hugging Face |
| ImageWAM-FLUX.2-4B-InternData-A1-EE (pretrain base) | ~12.2B | No especificado | No especificado | No especificado | Hugging Face |
| FastWAM-UR3-3task (mismo autor) | No disponible | No disponible | No disponible | MIT | Hugging Face |

El modelo comparte arquitectura con el pretrain de ImageWAM y existe una variante FastWAM del mismo autor con las mismas tres tareas. No se dispone de datos comparativos con otros modelos de accion-mundo en la informacion proporcionada.

## Limitaciones y advertencias

- El action_l1 offline no ha sido validado contra la tasa de exito real del robot; el autor recomienda seleccionar checkpoints por exito real, no por esta metrica.
- Los cinco checkpoints publicados son estadisticamente indistinguibles (el ruido por evaluacion, sd 0.0034, supera las diferencias entre ellos); la clasificacion nominal no debe considerarse fiable.
- Los ultimos 3.000 pasos de entrenamiento no aportaron mejoras medibles; el autor sugiere que 7.000 pasos habrian sido suficientes.
- El mosaico de camaras tiene un formato fijo (288x256, orden [superior, izquierda, derecha]) que debe respetarse en inferencia.
- Las acciones devueltas son de 16 dimensiones y deben despadarse a 14D (concat de dims 0-6 y 8-14) antes de enviarlas al controlador.
- Es obligatorio usar el archivo ur3_3task_ee16_dataset_stats.json para la desnormalizacion; las estadisticas del pretrain no son validas.
- Los pesos base de FLUX.2 klein 4B y el autoencoder deben prepararse por separado; los checkpoints solo contienen las partes entrenadas.
- No se documentan sesgos especificos, pero al ser un modelo entrenado en un unico entorno de laboratorio, la generalizacion a otros escenarios o robots no esta garantizada.
- La licencia MIT permite uso comercial, pero el modelo depende de pesos base de FLUX.2 cuya licencia debe verificarse por separado.

## Enlaces

- Repositorio del modelo: https://huggingface.co/armanakbari4/imagewam-ur3-3task
- Repositorio base de ImageWAM: https://huggingface.co/yuyangalin/ImageWAM-FLUX.2-4B-InternData-A1-EE
- Variante FastWAM del mismo autor: https://huggingface.co/armanakbari4/fastwam-ur3-3task
- Codigo fuente de ImageWAM: https://github.com/yuyangalin/ImageWAM
- Paper de ImageWAM (arXiv 2606.19531): https://arxiv.org/abs/2606.19531
- PDF del paper: https://arxiv.org/pdf/2606.19531
- Perfil del autor: https://huggingface.co/armanakbari4/models
