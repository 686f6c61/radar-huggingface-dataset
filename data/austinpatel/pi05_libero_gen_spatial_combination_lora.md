# austinpatel/pi05_libero_gen_spatial_combination_lora

## Resumen

`pi05_libero_gen_spatial_combination_lora` es un checkpoint de ajuste fino mediante LoRA del modelo base `physical-intelligence/pi05_base`, publicado por el usuario austinpatel dentro del ecosistema openpi. Se trata de un modelo de robotica de tipo vision-language-action (VLA), heredado de la familia pi0.5 de Physical Intelligence, orientado a la ejecucion de tareas de manipulacion a partir de instrucciones en lenguaje natural y observaciones visuales. El checkpoint se ha entrenado especificamente para el conjunto de tareas LIBERO-Gen Spatial Combination y se libera junto al trabajo Behavior Prompting.

El repositorio contiene un checkpoint crudo en formato Orbax (con las carpetas `params/`, `train_state/`, `assets/` y `_CHECKPOINT_METADATA`), correspondiente al paso de entrenamiento 99999 de la configuracion `pi05_libero_gen_spatial_combination_lora` (experimento `pi05_libero_gen_spatial_combination_lora_seed0_v1`). No es, por tanto, un modelo autocontenido listo para transformers, sino un artefacto pensado para cargarse desde un fork concreto de openpi y evaluarse con el pipeline de LIBERO descrito en la documentacion de Behavior Prompting.

Su relevancia actual es acotada y muy especializada: sirve como punto de partida reproducible para investigacion en imitacion robotica con ajuste eficiente (LoRA) sobre un modelo VLA grande, y para reproducir los resultados de LIBERO-Gen Spatial Combination. No hay datos publicados sobre numero de parametros, longitud de contexto ni licencia en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) derivada de pi0.5; detalles concretos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio distribuye pesos crudos en formato Orbax) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Orbax (checkpoint crudo de openpi); incluye `params/`, `train_state/`, `assets/` |
| Modelo base | physical-intelligence/pi05_base |
| Metodo de ajuste | LoRA sobre el modelo base |
| Paso de entrenamiento | 99999 |
| Configuracion de entrenamiento | pi05_libero_gen_spatial_combination_lora |
| Dataset de entrenamiento | austinpatel/libero_gen_spatial_combination_train_openpi |
| Tamano del repositorio | 9,6 GB |
| Libreria | openpi |
| Tarea (pipeline) | robotics |

## Arquitectura y entrenamiento

La informacion disponible indica que se trata de un ajuste fino con LoRA sobre `pi05_base`, el modelo base de la familia pi0.5 de Physical Intelligence. pi0.5 pertenece a la categoria de modelos vision-language-action, que combinan un backbone de tipo transformer con entradas visuales y textuales para producir acciones motoras. No obstante, la model card no detalla el numero de capas, la dimension oculta, el mecanismo de atencion, la existencia de mezcla de expertos ni el numero total de parametros, por lo que esos extremos quedan como no disponibles.

En cuanto al entrenamiento, la unica informacion publicada es que el checkpoint corresponde al paso 99999 de la configuracion `pi05_libero_gen_spatial_combination_lora` (experimento `pi05_libero_gen_spatial_combination_lora_seed0_v1`), entrenado sobre el dataset `austinpatel/libero_gen_spatial_combination_train_openpi` y vinculado a la tarea LIBERO-Gen Spatial Combination. No se especifican el numero de tokens o trayectorias, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO o decodificacion especulativa. La innovacion destacable desde el punto de vista practico es el uso de LoRA para adaptar un modelo VLA grande a una tarea concreta con un coste de ajuste reducido, mas el enfoque de Behavior Prompting del trabajo asociado.

## Capacidades

- Generacion de acciones motoras para robotica de manipulacion a partir de instrucciones en lenguaje natural y observaciones visuales (modelo vision-language-action).
- Ejecucion de tareas del benchmark LIBERO-Gen Spatial Combination, que implican razonamiento espacial sobre la disposicion de objetos.
- Ajuste fino eficiente con LoRA, lo que permite especializar el modelo base sin reentrenar todos los pesos.
- Integracion con el stack openpi para servir el modelo y evaluarlo en entornos LIBERO.
- Soporte de reanudacion de entrenamiento mediante el estado incluido en `train_state/`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada (el modelo opera como politica de accion, no como agente de proposito general).
- Capacidades multilingues: no disponibles.
- Capacidades especiales adicionales (modo thinking, vision, audio): la vision es parte inherente del pipeline VLA; el resto no disponible.

## Casos de uso

- Investigacion en aprendizaje por imitacion para robotica: el checkpoint permite reproducir y comparar resultados sobre LIBERO-Gen Spatial Combination sin partir del modelo base, ya que incluye el estado exacto del paso 99999.
- Evaluacion de ajuste fino con LoRA en modelos VLA: sirve para medir cuanto rendimiento se gana al adaptar `pi05_base` a una tarea concreta con un coste de entrenamiento reducido.
- Reproducibilidad de experimentos con Behavior Prompting: al estar publicado junto al trabajo y con un nombre de experimento y semilla explicitos, facilita replicar resultados y comparar variantes.
- Desarrollo de politicas de manipulacion para tareas de disposicion espacial: el ajuste esta orientado especificamente a organizar objetos segun relaciones espaciales, un escenario comun en entornos de laboratorio y almacen.
- Base para nuevos ajustes: al ser un checkpoint intermedio con LoRA, puede utilizarse como punto de partida para afinar aun mas sobre tareas relacionadas del mismo dominio LIBERO.
- Docencia y formacion en robotica: permite ilustrar el ciclo completo de descarga de checkpoint, servido y evaluacion con openpi y LIBERO, con instrucciones concretas en la documentacion asociada.
- Integracion en pipelines de simulacion: puede servirse desde un fork de openpi y conectarse a un simulador LIBERO para ejecutar evaluaciones automatizadas por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de exito en LIBERO, tasas de exito por tarea, ni comparaciones numericas con otros checkpoints.

## Requisitos de hardware

- El repositorio completo ocupa 9,6 GB, pero incluye `train_state/`, `assets/` y otros artefactos ademas de los pesos de inferencia; la model card indica que `train_state/` solo es necesario para reanudar entrenamiento y puede excluirse con `--exclude "train_state/*"` durante la descarga.
- VRAM estimada para inferencia: no disponible. No se publica el numero de parametros ni la precision de los pesos, por lo que no es posible dar una cifra fiable.
- GPU recomendadas: no disponible en la informacion proporcionada; en general los modelos VLA de esta familia requieren GPU con memoria dedicada, pero no se especifica modelo concreto.
- Compatibilidad con GPU de consumo: no disponible. Depende del numero de parametros y de la cuantizacion, datos que no se facilitan.
- Opciones de despliegue: el modelo esta pensado para servirse mediante openpi (fork con rama `liberogen`) y evaluarse con el pipeline LIBERO de Behavior Prompting. No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI; al ser un checkpoint Orbax de accion robotica, su despliegue no sigue el flujo habitual de un LLM.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Relacion | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05_libero_gen_spatial_combination_lora | Este modelo | no disponible | no disponible | no disponible | HuggingFace (0 descargas, 0 likes) |
| physical-intelligence/pi05_base | Modelo base sin ajuste LoRA | no disponible | no disponible | no disponible | HuggingFace (referenciado como base_model) |
| Otros checkpoints `pi05_libero_*` de austinpatel | Variantes de ajuste LoRA sobre el mismo base para otras tareas LIBERO | no disponible | no disponible | no disponible | HuggingFace |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada, por lo que la comparativa se limita a la relacion estructural entre ellas.

## Limitaciones y advertencias

- Licencia no especificada: al no declararse licencia, no puede asumirse uso comercial permitido; conviene contactar con el autor antes de cualquier despliegue productivo.
- Modelo altamente especializado: esta ajustado exclusivamente para LIBERO-Gen Spatial Combination, por lo que su rendimiento fuera de esa distribucion de tareas es incierto.
- Formato de checkpoint crudo: no es un modelo cargable directamente con transformers ni con herramientas estandar de LLM; requiere el fork de openpi y su rama `liberogen`.
- Repositorio de 9,6 GB con estado de entrenamiento incluido: la descarga completa es costosa y `train_state/` es innecesario para inferencia, por lo que conviene excluirlo.
- Sin datos de benchmarks: no hay evidencia publicada de tasa de exito ni comparaciones, lo que dificulta justificar su adopcion frente a alternativas.
- Cero descargas y cero likes: no hay senales de validacion por parte de la comunidad ni informes de uso independientes.
- Riesgo de alucinacion o de politicas incorrectas: no hay informacion sobre el comportamiento del modelo ante entradas fuera de distribucion ni sobre seguridad en entornos fisicos.
- Idiomas soportados no declarados: no puede asumirse un rendimiento multilingue en las instrucciones de tarea.
- Sesgos conocidos: no disponibles; los sesgos potenciales del modelo base y del dataset de entrenamiento no se documentan en la model card.
- Entorno de ejecucion exigente: la evaluacion requiere simulador LIBERO y el stack openpi, lo que anade dependencias y complejidad de reproducibilidad.
- Los resultados de la busqueda web realizada no contienen informacion relevante sobre este modelo (los enlaces devueltos tratan sobre la bandera de Mauricio y no guardan relacion alguna con el modelo).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/austinpatel/pi05_libero_gen_spatial_combination_lora
- Modelo base: https://huggingface.co/physical-intelligence/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/austinpatel/libero_gen_spatial_combination_train_openpi
- Repositorio Behavior Prompting: https://github.com/real-stanford/behavior_prompting
- Documentacion LIBERO + openpi: https://github.com/real-stanford/behavior_prompting/blob/main/docs/libero_openpi.md
- Repositorio openpi de Physical Intelligence: https://github.com/Physical-Intelligence/openpi
- Fork de openpi utilizado: https://github.com/austinapatel/openpi (rama `liberogen`)

Nota: la busqueda web no devolvio ningun enlace relacionado con el modelo; los resultados obtenidos eran irrelevantes y no se han incluido.
