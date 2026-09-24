# Recharge23/LingbotVA-single

## Resumen

LingbotVA-single es un repositorio de Hugging Face publicado por el usuario Recharge23 que, en el momento de redactar esta ficha, no contiene pesos liberados. Se trata del espacio de publicación previsto para cinco adaptadores LoRA independientes de tarea única, ajustados sobre el modelo base robbyant/lingbot-va-base (revisión 68b7bc1b35da6ddc67ea94c4ceb58d768fbb3f9c), un modelo causal de mundo vídeo-acción orientado a robótica de manipulación. El repositorio no declara pipeline, licencia ni idiomas, y registra 0 descargas y 0 likes.

El interés del repositorio es metodológico y de trazabilidad: documenta con precisión los ajustes de entrenamiento (semilla 42, batch global 8, LoRA de rango 32 y alpha 32 en FP32, learning rate de acción 1e-5 y de vídeo 3e-6, objetivos de 32 pasos), las revisiones exactas de dataset y splits congelados de 45/5 episodios de entrenamiento y validación. Los cinco puntos de control previstos son `task_4` (15.000 pasos optimizador, en curso) y `task_6` a `task_9` (5.000 pasos cada uno, en fase de preparación de base y datos). Task5 queda excluido.

La arquitectura del modelo base, según la documentación pública del proyecto LingBot-VA, es un world model autorregresivo vídeo-acción con arquitectura dual-stream de mixture-of-transformers (MoT), ejecución asíncrona y KV cache. No se dispone de parámetros totales, contexto ni resultados de benchmarks para este repositorio concreto, y su autor advierte explícitamente de que no se reclama ninguna tasa de éxito físico en tareas ni se ha operado ningún robot con este pipeline de preparación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA sobre LingBot-VA (modelo de mundo video-accion autorregresivo, dual-stream mixture-of-transformers con ejecucion asincrona y KV cache) |
| Parametros totales | no disponible (no declarado; depende del modelo base) |
| Parametros activos | no disponible (la base usa mixture-of-transformers, sin reparto publico de parametros activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (se anuncia la publicacion de LoRA adapters; el repositorio no contiene pesos) |
| Autor | Recharge23 (Lixuan) |
| Modelo base | robbyant/lingbot-va-base, revision 68b7bc1b35da6ddc67ea94c4ceb58d768fbb3f9c |
| Tipo de ajuste | LoRA de tarea unica, rango 32 / alpha 32 en FP32 |
| Tareas previstas | task_4 (15.000 pasos), task_6, task_7, task_8, task_9 (5.000 pasos cada una) |
| Dataset de referencia | revision 0685cc7194a817d22d958e494cd35120aa7effa3 (task_6 a task_9); revision 83b5cbeec3e156494bd42fb9211789bde0bb7909 (task_4) |
| Estado del repositorio | pesos no liberados; entrenamiento y validacion en curso |
| Fecha de creacion | 2026-09-23 |
| Ultima actualizacion | 2026-09-23 |

## Arquitectura y entrenamiento

El modelo base LingBot-VA unifica predicción de dinámica visual e inferencia de acciones en una única secuencia intercalada, manteniendo la distinción conceptual entre ambas. Su arquitectura es dual-stream de mixture-of-transformers (MoT), con ejecución asíncrona y KV cache para reducir el coste de inferencia en horizontes largos. La representación de imagen nativa es de 224×320 y los canales de acción son XYZ, cuaternión xyzw y gripper, con un objetivo nativo de flujo vídeo/acción.

Los ajustes de este repositorio parten todos de la misma revisión de `robbyant/lingbot-va-base` y no se inicializan desde un adaptador de Task4 o Task5 ya ajustado. Task6 a task_9 reutilizan las demostraciones exactas de las ejecuciones Franka-JAM, los splits congelados de 45/5 episodios de entrenamiento y validación, objetivos de 32 pasos, prompts, cotas XYZ solo de entrenamiento y listas de ventanas del dataset indicado. El entrenamiento emplea una única semilla (42), batch global 8, LoRA FP32 con rango 32 y alpha 32, learning rate de acción 1e-5 y de vídeo 3e-6. Las cotas de cuaternión se ajustan únicamente sobre los episodios de entrenamiento. Cabe señalar que la comparación con JAM se refiere a datos, objetivos físicos y configuración de optimización, no a un presupuesto de cómputo equiparable: JAM usa rotación 6D y sus endpoints publicados de 20K pasos no son comparables a los de 5K de este lanzamiento. La configuración bimanual por defecto de LingBot no coincide directamente con este dataset Franka de cámara única.

## Capacidades

- Prediccion de frames futuros y ejecucion de acciones dentro de la misma secuencia, segun el diseno del modelo base.
- Politica de manipulacion robotica para tareas unicas sobre un brazo Franka con una sola camara (dataset GELLO), en los puntos de control previstos.
- Post-entrenamiento eficiente en datos mediante adaptadores LoRA de bajo rango, reutilizables sobre la misma base.
- Razonamiento de horizonte largo en manipulacion, segun la documentacion publica del proyecto LingBot-VA.
- Soporte de arquitectura de despliegue independiente o servidor-cliente, con inferencia distribuida en GPUs y clusters.
- No hay evidencia en la informacion disponible de soporte de tool calling, function calling, agentes, capacidades multilingues, vision general, audio ni modo de razonamiento explicito.
- No se ha validado inferencia real en GPU ni compatibilidad GELLO: las comprobaciones realizadas hasta la fecha son de componentes en CPU.

## Casos de uso

- Politica de manipulacion de tarea unica: cada adaptador (`task_4`, `task_6` a `task_9`) se cargaria sobre la base LingBot-VA para ejecutar una tarea Franka concreta con una camara, con objetivos de accion de 32 pasos y representacion de imagen 224×320.
- Ajuste fino eficiente por tarea: el uso de LoRA de rango 32 permite entrenar variantes de tarea sin reentrenar el modelo completo, partiendo siempre de la misma revision base.
- Investigacion en world models video-accion: el modelo permite estudiar la interaccion entre prediccion de dinamica visual e inferencia de accion en una secuencia intercalada, util para analizar planificacion a horizonte largo.
- Evaluacion reproducible: los splits congelados de 45/5 episodios, la semilla unica (42) y las revisiones de dataset fijadas permiten replicar experimentos y comparar configuraciones bajo condiciones controladas.
- Validacion offline en simulacion: la prediccion de frames futuros puede emplearse para comprobar politicas antes de ejecutarlas en hardware fisico, evitando riesgos en el robot.
- Comparativa metodologica frente a JAM: al compartir demostraciones y ventanas de datos pero diferir en el espacio de acciones (cuaternion xyzw frente a rotacion 6D), sirve para estudiar el efecto de la parametrizacion de la accion.
- Post-entrenamiento con pocos datos: la documentacion del proyecto base destaca el aprendizaje eficiente en datos, lo que hace viable adaptar el modelo a configuraciones nuevas con presupuestos de datos reducidos.
- Despliegue distribuido: la separacion entorno de modelo / simulacion mediante servidor-cliente permite ejecutar la inferencia en GPUs o clusters mientras el entorno se ejecuta en otro equipo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explicitamente que no se reclama ninguna tasa de exito fisico en tareas y que ningun robot ha sido operado por este pipeline de preparacion. Tampoco se ofrecen comparaciones equiparables en computo frente a los endpoints publicados de JAM (5K frente a 20K pasos).

## Requisitos de hardware

- VRAM estimada: no disponible. No se declaran parametros del modelo base ni tamano de los adaptadores, por lo que no es posible calcular requisitos de memoria.
- GPU recomendadas: no disponible. El proyecto base menciona soporte de inferencia distribuida en GPUs y clusters, sin especificar modelos concretos.
- Encaje en GPU de consumo: no disponible. No puede determinarse sin conocer el tamano del modelo base.
- Opciones de despliegue: el modelo base admite ejecucion independiente y arquitectura servidor-cliente, que separa el entorno del modelo y evita conflictos de dependencias. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este repositorio.
- Latencia y throughput: no disponible. No se publican mediciones.
- Requisito previo: los artefactos anunciados son adaptadores LoRA que exigen la base original de LingBot, la normalizacion emparejada y la configuracion y fuente exactas. No deben cargarse con el cargador de adaptadores de JAM.
- Advertencia del autor: las comprobaciones de componentes en CPU no demuestran inferencia en GPU ni compatibilidad con GELLO. No hay instrucciones de inferencia completas hasta que se verifiquen los artefactos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Espacio de accion | Formato de publicacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| LingbotVA-single (este repositorio) | no disponible | no disponible | XYZ / cuaternion xyzw / gripper | LoRA adapters sobre LingBot-VA | no disponible | pesos no liberados |
| LingBot-VA base (robbyant/lingbot-va-base) | no disponible | no disponible | no disponible (configuracion bimanual por defecto) | no disponible | no disponible | base publica referenciada |
| Franka-JAM | no disponible | no disponible | rotacion 6D | no disponible | no disponible | endpoints de 20K pasos publicados segun la model card |

Nota: la model card de este repositorio senala que la comparacion con JAM se limita a datos, objetivos fisicos y ajustes de optimizacion especificados; no constituye una comparacion equiparable en computo. No se dispone de datos de rendimiento de ninguno de los tres modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Repositorio sin pesos: en el momento de la consulta no contiene artefactos liberados; todo el contenido es una descripcion de trabajo en curso.
- Sin licencia declarada: no se especifican condiciones de uso, lo que impide determinar si el uso comercial esta permitido.
- Sin metricas de exito: no se reclama ninguna tasa de exito en tareas fisicas y no se ha operado ningun robot con este pipeline.
- Inferencia no verificada: las comprobaciones realizadas son de componentes en CPU y no establecen que la inferencia funcione en GPU ni que exista compatibilidad con GELLO.
- Incompatibilidad de cargador: los adaptadores no deben cargarse con el cargador de JAM; requieren la base LingBot original, la normalizacion emparejada y la configuracion exacta.
- Desajuste de configuracion: la configuracion bimanual por defecto de LingBot no coincide directamente con el dataset Franka de camara unica empleado.
- Comparacion no equiparable: los endpoints de 5K pasos de este lanzamiento y los de 20K publicados para JAM tienen presupuestos de entrenamiento distintos.
- Sesgos conocidos: no disponible. No se documenta ningun analisis de sesgo.
- Riesgo de alucinacion: no disponible en el sentido textual, pero al tratarse de un modelo de mundo video-accion, las predicciones de frames futuros pueden divergir de la dinamica real, lo que exigiria validacion previa a cualquier despliegue.
- Limitaciones de idioma y contexto: no disponible; no se declaran idiomas ni longitud de contexto.
- Trazabilidad pendiente: antes de una version lista para despliegue deben verificarse los pesos, la procedencia de los pasos de optimizador, el split congelado, los hashes de fuente y base, la normalizacion y la inferencia real del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Recharge23/LingbotVA-single
- Perfil del autor: https://huggingface.co/Recharge23/models
- Repositorio oficial de LingBot-VA (GitHub): https://github.com/robbyant/lingbot-va
- Fork de LingBot-VA (GitHub): https://github.com/Spphire/lingbot-va
- Pagina del proyecto LingBot-VA: https://technology.robbyant.com/lingbot-va
- Modelo base en Hugging Face: https://huggingface.co/robbyant/lingbot-va-base
- LingBot-VA en Hugging Face (bazaar-research): https://huggingface.co/bazaar-research/lingbot-va
