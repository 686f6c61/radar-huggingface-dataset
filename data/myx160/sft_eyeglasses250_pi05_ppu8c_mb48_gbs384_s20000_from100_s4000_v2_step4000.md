# myx160/sft_eyeglasses250_pi05_ppu8c_mb48_gbs384_s20000_from100_s4000_v2_step4000

## Resumen

Este repositorio contiene un checkpoint de ajuste fino supervisado (SFT) completo y reanudable del modelo OpenPI, publicado por el usuario myx160 en HuggingFace, especializado en la tarea de manipulacion robotica "Piper eyeglasses". La instruccion de la tarea es: "Pick up the eyeglasses, fold the temples, and place them on the box on the right". Se trata de un modelo vision-lenguaje-accion (VLA): consume tres camaras RGB y un vector de estado de 14 dimensiones, y produce un vector de accion de 14 dimensiones con un horizonte de 50 pasos.

El entrenamiento parte de unos pesos de arranque en caliente procedentes de un SFT de 100 episodios (paso 4000) y utiliza el dataset `myx160/eyeglasses_grasp_250episode`, compuesto por 250 episodios. El regimen declarado es de ajuste de todos los parametros con FSDP `full_shard`, un batch global de 384 (micro batch por rango de 48, sin acumulacion), un calendario de 20000 pasos, 1000 pasos de warmup y un LR pico de 1e-5. El checkpoint publicado corresponde al paso 4000.

Su relevancia practica es doble. Por un lado, el autor documenta de forma explicita el "contrato de recuperacion": el directorio `global_step_4000/actor/` incluye los 8 shards DCP, el estado del optimizador, `.metadata`, `model_state_dict/full_weights.pt`, `data.pt`, `rng.pt`, `SFT_CHECKPOINT_COMPLETE.json`, ademas de las estadisticas de normalizacion y el contrato de transformaciones que exige el pipeline de inferencia en robot real. Por otro, el propio autor advierte de que es un artefacto de entrenamiento y de que la perdida de entrenamiento no es evidencia de exito en robot real. El repositorio ocupa 34,1 GB, la licencia es Apache 2.0, no declara idiomas soportados y en el momento de la ficha acumula 0 descargas y 0 likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) sobre OpenPI; el identificador incluye "pi05", que sugiere una base pi0.5, pero no se confirma en la informacion proporcionada |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se declara una arquitectura MoE) |
| Longitud de contexto | no disponible (modelo de accion robotica; no se documenta ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (el repositorio se distribuye en precision de entrenamiento) |
| Idiomas soportados | no disponible (la instruccion de tarea esta en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch: 8 shards DCP en `global_step_4000/actor/` mas `model_state_dict/full_weights.pt`; no se mencionan safetensors ni GGUF |
| Libreria declarada | openpi |
| Pipeline | robotics |
| Modalidad de entrada | 3 camaras RGB + estado de 14 dimensiones |
| Modalidad de salida | accion de 14 dimensiones, horizonte 50 |
| Tamano del repositorio | 34,1 GB (incluye estado del optimizador) |
| Autor | myx160 |
| Fecha de creacion | 2026-09-16 |
| Fecha de actualizacion | 2026-09-16 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible describe el modelo como un checkpoint OpenPI dentro del paradigma VLA: percepcion visual multi-camara (3 flujos RGB) mas estado proprioceptivo de 14 dimensiones, y prediccion de acciones continuas de 14 dimensiones con horizonte de 50 pasos. La etiqueta `vla` junto con `openpi`, `piper` y `lerobot` situa el artefacto en el ecosistema de politicas de accion para brazos roboticos Piper. No se detallan en la model card el numero de parametros, la composicion interna del transformer, el mecanismo de atencion ni el uso de decodificacion especulativa u otras optimizaciones. El identificador del repositorio contiene la cadena "pi05", compatible con una base pi0.5, pero la informacion proporcionada no lo confirma de forma explicita, por lo que debe tratarse como una inferencia y no como un dato verificado.

En cuanto al entrenamiento, el contrato declarado es el siguiente: dataset `myx160/eyeglasses_grasp_250episode` en la revision `fd7ce02d49c4b150becdf657ec010faaa0e63d73` (250 episodios); arranque en caliente desde los pesos de un SFT de 100 episodios en el paso 4000; ajuste de todos los parametros con FSDP `full_shard`; 8 dispositivos fisicos (PPU 8-15) con world size 8; micro batch por rango de 48 con acumulacion 1, lo que da un batch global de 384; calendario de 20000 pasos con 1000 pasos de warmup y LR pico de 1e-5. No se menciona RLHF, DPO ni ninguna fase de alineacion posterior al SFT. Tampoco se documentan el numero total de tokens, la composicion del dataset ni tecnicas de aumento de datos.

## Capacidades

- Manipulacion robotica de una tarea concreta: coger las gafas, plegar las patillas y depositarlas en la caja situada a la derecha.
- Percepcion multimodal de entrada con tres camaras RGB simultaneas.
- Fusion de vision con estado proprioceptivo de 14 dimensiones.
- Generacion de acciones continuas de 14 dimensiones con horizonte de prediccion de 50 pasos (action chunking).
- Ejecucion dentro de un pipeline de inferencia en robot real, con estadisticas de normalizacion y contrato de transformaciones incluidos en el propio directorio del actor.
- Reanudacion del entrenamiento: el repositorio conserva los 8 shards DCP, el estado del optimizador, el estado del generador de numeros aleatorios (`rng.pt`) y los datos auxiliares (`data.pt`).
- Integracion con el ecosistema LeRobot (etiqueta declarada `lerobot`).
- Tool calling: no disponible (no aplica al artefacto descrito, que es una politica de accion).
- Razonamiento multi-paso en lenguaje natural, agentes, codigo o matematicas: no disponible; la model card no documenta ninguna de estas capacidades.
- Capacidades multilingues: no disponible.
- Vision general (captioning, VQA) o audio: no disponible; la vision se emplea como entrada de la politica de accion, no como tarea generativa documentada.

## Casos de uso

- Manipulacion robotica de laboratorio en una tarea replicable: el modelo se carga en el pipeline de inferencia de OpenPI y gobierna un brazo Piper para ejecutar la secuencia completa de recogida y deposito de gafas, aprovechando el horizonte de 50 acciones para producir movimientos coherentes sin replanificacion a cada paso.
- Investigacion en modelos vision-lenguaje-accion: sirve como caso de estudio de ajuste fino de una politica VLA sobre un dataset pequeno (250 episodios) partiendo de un checkpoint intermedio de 100 episodios, lo que permite analizar el efecto del preentrenamiento previo en tareas de manipulacion.
- Reanudacion y continuacion del entrenamiento: gracias a los 8 shards DCP, al estado del optimizador y a `SFT_CHECKPOINT_COMPLETE.json`, un equipo puede reanudar exactamente en el paso 4000 y prolongar el calendario previsto de 20000 pasos sin recalcular estados.
- Barrido sistematico de checkpoints: al ser un artefacto intermedio (paso 4000 de 20000), es util para comparar el rendimiento en robot real de distintos puntos del calendario de entrenamiento bajo un protocolo de evaluacion congelado.
- Replicacion de experimentos: la model card documenta batch global, LR, warmup, estrategia de paralelismo y revision exacta del dataset, lo que permite reproducir o auditar el ajuste en otra infraestructura.
- Automatizacion de tareas de recogida y ordenado en entornos controlados: la tarea de coger un objeto deformable y plegable como unas gafas y colocarlo en una caja es representativa de operaciones de picking y packing de precision media en almacen o laboratorio.
- Desarrollo de pipelines de robotica con LeRobot: el checkpoint puede integrarse como politica en flujos de trabajo del ecosistema LeRobot para prototipado de aplicaciones de manipulacion.
- Base para tecnicas de adaptacion posteriores: al ser un SFT previo, puede emplearse como punto de partida para ajustes adicionales con otros datasets de la misma plataforma robotica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exito en robot real, tasas de exito por episodio ni comparaciones con otras politicas. El autor advierte de forma explicita de que la perdida de entrenamiento por si sola no es evidencia de exito en robot real y de que la seleccion de checkpoints debe hacerse con el protocolo de evaluacion en mundo real congelado. La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo: los resultados obtenidos corresponden a hilos de foro sobre software contable y no guardan relacion con el artefacto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 34,1 GB, pero ese tamano incluye el estado del optimizador y los 8 shards DCP, por lo que el peso de los parametros del modelo es inferior; la cifra exacta no se declara.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Encaje en GPU de consumo: no disponible; no puede confirmarse sin conocer el numero de parametros ni la precision de despliegue.
- Infraestructura de entrenamiento declarada: 8 dispositivos fisicos (PPU 8-15) con world size 8 y paralelismo FSDP `full_shard` de todos los parametros.
- Opciones de despliegue: libreria `openpi` sobre PyTorch, con el pipeline de inferencia en robot real que consume las estadisticas de normalizacion y el contrato de transformaciones incluidos en `global_step_4000/actor/`. La etiqueta `lerobot` apunta a integracion con ese ecosistema. Herramientas de servido de LLM como vLLM, TGI, llama.cpp u Ollama no son aplicables a una politica de accion robotica de este tipo.
- Latencia y throughput: no disponible.
- Almacenamiento: se recomienda reservar al menos 34,1 GB para el repositorio completo, ademas del espacio necesario para datos y estado de entrenamiento si se reanuda.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada. La model card no incluye tablas de comparacion y no se han encontrado fuentes externas en la busqueda web. Como referencia de categoria, el artefacto pertenece a la familia de politicas VLA para manipulacion robotica, donde los comparadores habituales serian otras variantes de OpenPI o pi0.5, OpenVLA y GR00T N1, pero no se dispone de parametros, contexto, rendimiento ni disponibilidad verificados de este checkpoint para establecer una comparacion rigurosa. Cualquier comparacion deberia hacerse con el protocolo de evaluacion en robot real congelado que menciona el autor.

## Limitaciones y advertencias

- Es un artefacto de entrenamiento, no un modelo validado para produccion: el autor indica que la perdida de entrenamiento no demuestra exito en robot real.
- No se han publicado benchmarks ni resultados de evaluacion en mundo real en la informacion disponible.
- Especializacion extrema: esta ajustado para una unica tarea (gafas, plegado de patillas y deposito en una caja a la derecha) sobre una plataforma robotica concreta (Piper) y un conjunto de sensores concreto (3 camaras RGB y estado de 14 dimensiones). No se documenta transferencia a otras tareas, objetos o morfologias.
- Dependencia del contrato de inferencia: el modelo requiere las estadisticas de normalizacion y las transformaciones exactas incluidas en el directorio del actor; usarlo fuera de ese contrato puede degradar o invalidar el comportamiento.
- Idiomas soportados no declarados y capacidad multilingue no documentada.
- Riesgo de alucinacion y de comportamiento fuera de distribucion: no se documentan evaluaciones de robustez frente a cambios de iluminacion, posicion de las gafas, oclusiones o variaciones del entorno.
- Sin informacion sobre sesgos: no se documentan analisis de sesgo, y en el caso de una politica robotica el sesgo relevante seria de distribucion de escenas y objetos, no evaluado en la ficha.
- Datos de entrenamiento de origen no auditados: solo se conoce el identificador y la revision del dataset; no se detalla su composicion, procedencia ni licencia propia.
- Licencia Apache 2.0: permite uso comercial, pero exige conservar avisos de copyright y licencia, e incluye clausulas de patentes y de exencion de responsabilidad. Conviene verificar la licencia del dataset subyacente antes de un uso comercial.
- Trazabilidad limitada: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente por parte de la comunidad.
- Confusion potencial en el nombre del repositorio: el identificador mezcla hiperparametros de entrenamiento, lo que dificulta referirse al modelo de forma inequivoca.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/myx160/sft_eyeglasses250_pi05_ppu8c_mb48_gbs384_s20000_from100_s4000_v2_step4000
- Dataset de entrenamiento: https://huggingface.co/datasets/myx160/eyeglasses_grasp_250episode (revision `fd7ce02d49c4b150becdf657ec010faaa0e63d73`, 250 episodios)
- Repositorio OpenPI: no aparece en la informacion proporcionada; la etiqueta `openpi` y el campo `library_name` lo referencian, pero no se incluye URL verificada.
- Documentacion de LeRobot: no aparece en la informacion proporcionada; solo se declara la etiqueta `lerobot`.
- Papers, blogs o demos: no se han encontrado en la busqueda web. Los resultados devueltos corresponden a foros no relacionados con el modelo.
