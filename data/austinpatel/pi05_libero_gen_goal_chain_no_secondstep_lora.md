# austinpatel/pi05_libero_gen_goal_chain_no_secondstep_lora

## Resumen

pi05_libero_gen_goal_chain_no_secondstep_lora es un checkpoint de ajuste fino con LoRA sobre el modelo base physical-intelligence/pi05_base, publicado por el usuario austinpatel dentro del ecosistema openpi de Physical Intelligence. Se trata de un modelo vision-lenguaje-accion (VLA) orientado a robotica: recibe observaciones visuales y una instruccion en lenguaje natural y produce acciones motoras. El checkpoint corresponde a la tarea LIBERO-Gen Goal Chain y forma parte del material publicado junto al proyecto Behavior Prompting.

El checkpoint es un artefacto de entrenamiento en crudo en formato Orbax, no un modelo empaquetado para consumo general: el repositorio contiene el contenido de un unico directorio de paso de entrenamiento (params/, train_state/, assets/ y _CHECKPOINT_METADATA), con 9,6 GB de tamano total. El paso registrado es el 100000 y el experimento se denomina pi05_libero_gen_goal_chain_no_secondstep_lora_seed0_v2_no_horizontal_flip.

Su relevancia es acotada y muy especifica: se trata de una ablacion (entrenada sin demostraciones de segundo paso) cuyo interes es experimental, para comparar el efecto de eliminar esas demostraciones en el pipeline de Behavior Prompting sobre LIBERO-Gen. No es un modelo de proposito general ni cuenta con datos publicados de benchmarks, licencia declarada o idiomas soportados. El pipeline declarado es robotics y la libreria es openpi.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo VLA de la familia pi0.5, checkpoint Orbax de openpi); no se detalla en la informacion proporcionada |
| Parametros totales | no disponible |
| Parametros activos | no aplica / no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio contiene pesos en formato Orbax sin cuantizar; no se listan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Orbax (JAX), con directorios params/, train_state/, assets/ y fichero _CHECKPOINT_METADATA |
| Modelo base | physical-intelligence/pi05_base |
| Tipo de ajuste | LoRA sobre el modelo base |
| Paso de entrenamiento | 100000 |
| Tamano del repositorio | 9,6 GB |
| Pipeline declarado | robotics |
| Libreria | openpi |
| Dataset de entrenamiento | austinpatel/libero_gen_goal_chain_no_secondstep_train_openpi |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo. Por las etiquetas y el modelo base se trata de un modelo de vision-lenguaje-accion de la familia pi0.5 de Physical Intelligence, ejecutado sobre la libreria openpi, que emplea JAX y almacena los pesos en formato Orbax. El checkpoint publicado es un ajuste fino con adaptadores LoRA sobre pi05_base, no un entrenamiento desde cero: el repositorio contiene un unico paso de entrenamiento (paso 100000) con el estado de parametros y el estado de entrenamiento.

El aspecto tecnico mas relevante es que se trata de una ablacion explicita: el modelo se entreno sin demostraciones de segundo paso (no second step), tal como indica la model card. El dataset asociado es austinpatel/libero_gen_goal_chain_no_secondstep_train_openpi y el experimento se ejecuto sin volteo horizontal (sufijo no_horizontal_flip), lo que sugiere una variante de aumento de datos desactivada respecto a la configuracion de referencia. No se proporcionan datos sobre numero de tokens, composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF, DPO o decodificacion especulativa. El checkpoint esta pensado para reanudar entrenamiento o para servir inferencia dentro del fork de openpi de la rama liberogen.

## Capacidades

- Generacion de acciones motoras a partir de observaciones visuales e instrucciones en lenguaje natural (pipeline robotics).
- Ejecucion de tareas de manipulacion robotica del benchmark LIBERO-Gen, en concreto la variante Goal Chain.
- Capacidad de encadenar objetivos (goal chain) como parte de la tarea entrenada.
- Soporte de behavior prompting, el paradigma del proyecto con el que se publica.
- Ajuste con LoRA: los adaptadores se cargan sobre el modelo base pi05_base.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso fuera del entorno robotico, vision generalista, audio ni modo thinking.
- Capacidades multilingues: no disponible.
- No se documenta ningun tipo de capacidad conversacional ni de generacion de texto libre.

## Casos de uso

- Evaluacion de ablaciones en investigacion robotica: cargar este checkpoint y compararlo con la variante que si incluye demostraciones de segundo paso permite medir el impacto de eliminar esas demostraciones en la tasa de exito de LIBERO-Gen Goal Chain. Es el caso de uso principal y para el que fue publicado.
- Reproducibilidad de resultados de Behavior Prompting: el paso 100000 y el nombre de experimento exacto permiten reproducir una configuracion concreta del pipeline descrito en docs/libero_openpi.md.
- Reanudacion de entrenamiento: el directorio train_state/ esta pensado para continuar el entrenamiento desde el paso 100000 en el fork de openpi, en lugar de partir de cero.
- Punto de partida para nuevos ajustes LoRA: al ser un adaptador sobre pi05_base, puede servir como inicializacion para experimentos posteriores con otros datasets de manipulacion dentro de openpi.
- Investigacion sobre aumento de datos: la variante no_horizontal_flip permite estudiar el efecto de desactivar el volteo horizontal en el entrenamiento de politicas VLA.
- Validacion de infraestructura de serving openpi: el checkpoint sirve para probar el pipeline de descarga, carga y servido de pesos Orbax en un entorno JAX antes de desplegar modelos mayores.
- No se recomienda su uso en produccion ni en aplicaciones de cara al usuario: es un artefacto de investigacion sin licencia declarada ni evaluacion publicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito de LIBERO-Gen ni comparaciones numericas con la variante con segundo paso u otros checkpoints.

## Requisitos de hardware

- El repositorio ocupa 9,6 GB, pero ese tamano incluye train_state/, que no es necesario para inferencia. La model card indica que se puede excluir con --exclude "train_state/*" al descargar, lo que reduce el espacio en disco requerido. No se especifica el tamano resultante de solo los parametros.
- VRAM estimada para inferencia: no disponible. No se publica el numero de parametros del modelo base ni del adaptador LoRA, por lo que no es posible calcular una cifra fiable.
- GPU recomendadas: no disponible en la informacion proporcionada. Al ser un modelo basado en JAX/Orbax, el despliegue esperado es en aceleradores compatibles con el stack de openpi.
- Compatibilidad con GPU de consumo: no disponible. No hay datos que permitan confirmar si cabe en una RTX 4090 u otras GPU consumer.
- Opciones de despliegue: el flujo soportado es el fork de openpi (rama liberogen) con descarga via hf download y servido segun docs/libero_openpi.md. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a pesos Orbax de JAX.
- Latencia y throughput: no disponibles. No se publican mediciones de frecuencia de inferencia ni de tiempo por accion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05_libero_gen_goal_chain_no_secondstep_lora | no disponible | no disponible | no disponible | no disponible | HuggingFace, 0 descargas, 0 likes |
| physical-intelligence/pi05_base | no disponible | no disponible | no disponible | no disponible | Modelo base referenciado en la model card |
| Otras variantes LIBERO-Gen del mismo autor | no disponible | no disponible | no disponible | no disponible | No confirmado en la informacion proporcionada |

No se dispone de datos suficientes para establecer una comparativa cuantitativa con alternativas de la misma categoria. La unica comparacion documentada es conceptual: esta variante se entreno sin demostraciones de segundo paso, frente a la configuracion de referencia que si las incluye, pero no se aportan cifras de rendimiento de ninguna de las dos.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. No hay documentacion sobre el dataset de entrenamiento ni sobre su composicion demografica o de escenarios.
- Riesgo de alucinacion: no evaluado en la informacion disponible. En modelos VLA el fallo tipico no es la alucinacion textual sino la ejecucion de acciones incorrectas ante instrucciones ambiguas o fuera de distribucion.
- Limitaciones de contexto e idioma: no disponibles.
- Licencia: no declarada. La ausencia de licencia explicita impide asumir permisos de uso comercial; hay que contactar con el autor antes de cualquier uso en produccion.
- Es un checkpoint de investigacion en crudo (Orbax) con el estado de entrenamiento incluido, no un artefacto listo para produccion. Requiere el fork especifico de openpi (rama liberogen) para cargarse.
- Es una ablacion deliberada: se entreno sin demostraciones de segundo paso, por lo que su comportamiento no debe interpretarse como el de la configuracion de referencia del proyecto.
- El repositorio no tiene descargas ni likes, y no hay evidencia de validacion por terceros.
- La fecha de creacion indicada en HuggingFace es 2026-10-07, posterior a la fecha de esta ficha; conviene verificar la validez del registro.
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo: los resultados obtenidos eran contenido no relacionado con la ficha tecnica, por lo que no se incluyen como enlaces.
- No se documenta ninguna evaluacion independiente de seguridad, robustez ni comportamiento fuera de distribucion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/austinpatel/pi05_libero_gen_goal_chain_no_secondstep_lora
- Modelo base: https://huggingface.co/physical-intelligence/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/austinpatel/libero_gen_goal_chain_no_secondstep_train_openpi
- Repositorio del proyecto Behavior Prompting: https://github.com/real-stanford/behavior_prompting
- Documentacion de evaluacion en LIBERO: https://github.com/real-stanford/behavior_prompting/blob/main/docs/libero_openpi.md
- Fork de openpi usado para el entrenamiento: https://github.com/austinapatel/openpi
- Repositorio original de openpi (Physical Intelligence): https://github.com/Physical-Intelligence/openpi

Nota: la busqueda web realizada no devolvio resultados relevantes (papers, blogs, demos o repos) sobre este modelo; el resto de resultados no guardaba relacion con la ficha y se ha omitido.
