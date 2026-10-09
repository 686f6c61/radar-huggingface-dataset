# kiroaiseoul/NAJY_act_all11_c100_m1_27D_60k_s1000

## Resumen

NAJY_act_all11_c100_m1_27D_60k_s1000 es un checkpoint de politica robotica basado en la arquitectura ACT (Action Chunking Transformer) del ecosistema LeRobot, publicado por el usuario kiroaiseoul. A diferencia de un modelo de lenguaje, se trata de un modelo de control que mapea observaciones multimodales (estado propioceptivo e imagenes de camara) a un vector de acciones de robot. El checkpoint contiene 51.700.368 parametros (~51,7 M) almacenados en un unico fichero `model.safetensors` de 0,2 GB.

El nombre y la model card describen un entrenamiento correspondiente al paso 60.000 del run `exp_all11_c100_m1_long_s1000`, ejecutado sobre una maquina identificada como "DGX_1". Las observaciones declaradas son un estado de 27 dimensiones y tres flujos de imagen de 480x640x3 (camara alta, muneca izquierda y muneca derecha), con un vector de accion de 16 dimensiones. La etiqueta `trossen-mobile-ai` apunta a la plataforma movil de Trossen Robotics, por lo que la politica parece orientada a un robot bimanual con base movil.

Segun la propia model card, el modelo se sube con fines de analisis y puntuacion, y es independiente de la confirmacion final de candidato para despliegue en hardware real. Se trata por tanto de un checkpoint de investigacion con fines de evaluacion, no de un modelo de produccion validado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer) segun el tag `act` y la libreria `lerobot`; incluye codificador CVAE y decodificador transformer, con backbone visual (detalle no especificado en la model card) |
| Parametros totales | 51.700.368 (~51,7 M), dato real de los safetensors |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable: es un modelo de politica robotica, no un modelo de lenguaje. El identificador del run (`c100`) sugiere un chunk de 100 pasos de accion, aunque la model card no lo confirma de forma explicita |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen en `model.safetensors` sin variantes cuantizadas publicadas |
| Idiomas soportados | no aplicable (el modelo no procesa lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`) |

Datos de entrada y salida declarados en la model card:

| Componente | Dimension |
|---|---|
| observation.state | 27 |
| observation.images.cam_high | 3 x 480 x 640 |
| observation.images.cam_left_wrist | 3 x 480 x 640 |
| observation.images.cam_right_wrist | 3 x 480 x 640 |
| action | 16 |

## Arquitectura y entrenamiento

El tag `act` y la libreria `lerobot` identifican el modelo como una politica ACT (Action Chunking Transformer), una arquitectura de imitacion (behaviour cloning) que predice secuencias o "chunks" de acciones en lugar de acciones individuales, con el objetivo de reducir el error de composicion en tareas de manipulacion. ACT combina un codificador de tipo CVAE que procesa estado y observaciones visuales con un decodificador transformer que genera el chunk de acciones. La model card no especifica el detalle del backbone visual ni de las capas internas, por lo que la confirmacion de la topologia exacta queda fuera de la informacion proporcionada.

Los datos de entrenamiento no se detallan en la model card mas alla de las dimensiones de observacion y accion y del manifiesto `configs/datasets/all11_tr_hot.json`, referenciado en la primera linea del log de entrenamiento. El identificador `all11` sugiere la combinacion de 11 conjuntos o etapas de datos, y el checkpoint corresponde al paso 60.000 de un run con semilla 1000. No se indica el numero total de tokens o frames, la composicion del dataset, ni si se aplico RLHF o DPO (tecnicas propias de modelos de lenguaje que no aplican a este tipo de politica). La model card menciona un manifiesto de puntuacion (`multi_manifest.json`) y una herramienta de diagnostico (`stage_cond_diag.py`), pero no aporta cifras de rendimiento.

## Capacidades

- Control de robot por imitacion: genera chunks de acciones de 16 dimensiones a partir de estado propioceptivo (27 dimensiones) y tres vistas de camara (480x640).
- Percepcion visual multicamara: procesa simultaneamente camara alta, muneca izquierda y muneca derecha, lo que aporta tanto vision global como vision de agarre.
- Manipulacion bimanual: la configuracion de dos camaras de muneca y un vector de accion de 16 dimensiones es coherente con un robot de dos brazos.
- Operacion sobre base movil: el tag `trossen-mobile-ai` sugiere uso en plataformas moviles con manipulador.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes de razonamiento multi-paso en el sentido de un LLM.
- Capacidades multilingues: no aplicable.
- Capacidad especial: checkpoint acompanado de un manifiesto de analisis y herramienta de puntuacion para diagnostico de politicas (no es una capacidad de inferencia del modelo en si).

## Casos de uso

- Manipulacion bimanual en laboratorio: uso del checkpoint para ejecutar tareas de pick and place con dos brazos, aprovechando la prediccion por chunks para secuencias de agarre y colocacion mas estables.
- Robot movil con manipulador: despliegue sobre la plataforma Trossen mencionada en los tags para tareas de navegacion con manipulacion (recogida de objetos en distintas posiciones de una estacion).
- Evaluacion y puntuacion de checkpoints: la model card indica que la subida es con fines de analisis; el checkpoint puede alimentarse a `stage_cond_diag.py` junto a `multi_manifest.json` para comparar etapas de entrenamiento.
- Investigacion en imitacion (behaviour cloning): base para reproducir o modificar el entrenamiento ACT con datos propios de teleoperacion.
- Fine-tuning sobre hardware equivalente: reentrenamiento del checkpoint con datos de un robot de la misma configuracion (27D de estado, 16D de accion, tres camaras) para adaptarlo a una tarea concreta.
- Recoleccion asistida por teleoperacion: usar la politica como politica inicial durante la recoleccion de datos para acelerar la generacion de demostraciones.
- Pruebas de integracion de pipeline LeRobot: validacion del ciclo completo de carga de un checkpoint ACT, transformacion de observaciones y publicacion de acciones antes de desplegar una version definitiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito, curvas de recompensa, errores de accion ni comparaciones cuantitativas con otros checkpoints. El unico dato de verificacion aportado es el hash SHA-256 del fichero de pesos (`c97d8b55…08c8f`) y la referencia al paso 60.000 del run.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint en precision de 32 bits ocupa aproximadamente 207 MB y en 16 bits unos 103 MB; sumando las activaciones del backbone visual y de los tres flujos de imagen de 480x640, la inferencia completa se situa de forma estimada en torno a 1-2 GB de VRAM (estimacion a partir del numero de parametros y del tamano de entrada, no confirmada por el autor).
- GPU recomendadas: por tamano del modelo cabe en practicamente cualquier GPU moderna con al menos 4 GB, incluidas RTX 3060, RTX 4060, RTX 4090, A100 o H100. Las GPUs de gama alta no aportan ventaja de capacidad, solo de latencia.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo con 4-6 GB o mas.
- Opciones de despliegue: el modelo se sirve a traves de la libreria LeRobot (scripts de inferencia sobre PyTorch). No aplican los runtimes de LLM como vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Dado el tamano del modelo (~51,7 M de parametros), cabe esperar una latencia de milisegundos en GPU y de decenas de milisegundos en CPU, condicionada por el preprocesado de las tres imagenes de 480x640.
- El control en tiempo real depende del bucle de control del robot y de la frecuencia de captura de las camaras, no solo del coste de la red.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye resultados de otros checkpoints ACT ni datos cuantitativos que permitan una comparacion directa. Como referencia de categoria, este checkpoint pertenece a la familia de politicas ACT de LeRobot (~50 M de parametros, codificacion visual mas transformer), pero la model card no aporta cifras que permitan contrastarlo con alternativas concretas del mismo tamano o de la misma tarea.

## Limitaciones y advertencias

- Checkpoint de investigacion: la model card indica explicitamente que la subida es para analisis y puntuacion, y que es independiente de la confirmacion del candidato a despliegue en hardware real.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta.
- Sin benchmarks publicados: no hay tasas de exito ni metricas de tarea que respalden su rendimiento.
- Dimensiones fijas de entrada y salida (27D de estado, 16D de accion, tres camaras de 480x640): el modelo esta ligado a la configuracion del robot y del dataset de entrenamiento; no generaliza a otras morfologias sin reentrenamiento.
- Riesgo de comportamiento erratico fuera de la distribucion de entrenamiento, comun en politicas de imitacion.
- Sesgos conocidos: no disponibles; no se documenta la composicion del dataset ni posibles sesgos de recogida de datos.
- Idiomas: no aplicable, no procesa lenguaje natural.
- Licencia Apache 2.0: permite uso comercial, pero la responsabilidad de seguridad en la operacion fisica de un robot recae en el integrador.
- Advertencia de seguridad: cualquier despliegue sobre hardware real deberia validarse con protocolos de parada de emergencia y limites de par, dado que no existe validacion publicada del checkpoint.
- Verificacion de integridad recomendada: comparar el SHA-256 de `model.safetensors` con el valor declarado (`c97d8b55086a5c003819fe2c94b5f6694999bbe70cb20e58d7ad983756a08c8f`) antes de usarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kiroaiseoul/NAJY_act_all11_c100_m1_27D_60k_s1000
- Documentacion referenciada en la model card: `trossen-ai-simulation`, `docs/mobile_base_investigation.md`, seccion 94 (no se proporciona URL directa en la informacion disponible).
- La busqueda web realizada no devolvio resultados relevantes para este modelo; los enlaces obtenidos no guardan relacion con la ficha y se han descartado.
