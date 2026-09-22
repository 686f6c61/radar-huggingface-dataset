# Recharge23/JAM-20K-mix

## Resumen

JAM-20K-mix es un repositorio de adaptadores LoRA para robótica publicado por el usuario Recharge23 en HuggingFace. No es un modelo base completo, sino un conjunto de tres adaptadores fine-tuneados que deben cargarse junto a sus modelos base originales correspondientes: Franka-JAM, Foundation-JAM y pi-0.5. El repositorio ocupa 1,3 GB en total y se distribuye en tres carpetas (`franka/`, `foundation/`, `pi05/`), cada una con un checkpoint de 20K pasos sobre una mezcla de cinco tareas.

El propósito del artefacto es servir de punto de partida reproducible para quien quiera ejecutar políticas viso-lenguaje-acción (VLA) sobre un brazo Franka en el entorno GELLO. El autor documenta el dataset exacto de entrenamiento (130 demostraciones teleoperadas, 117 para entrenamiento y 13 reservadas) y las interfaces de servicio, pero deja explícito que la verificación realizada es de compatibilidad de tensores e inferencia HTTP offline, no de éxito físico en tareas reales.

Es relevante porque permite reproducir un pipeline completo de fine-tuning multi-tarea sobre JAM con configuración de normalización suministrada, algo que el propio autor advierte que difiere de los valores por defecto del repositorio base. Al mismo tiempo, es un artefacto con escasa validación externa (0 descargas y 0 likes en el momento de la consulta, creado el 22 de septiembre de 2026), sin licencia declarada y sin métricas de éxito en bucle cerrado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible; se trata de adaptadores LoRA sobre políticas de robótica (JAM y pi-0.5), no de un transformer de lenguaje documentado en la model card |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; la entrada es una imagen RGB, una pose de brida y una instrucción de tarea, no una secuencia de texto de longitud variable |
| Tipos de cuantizacion | no disponible; el autor no documenta cuantizaciones y los adaptadores se distribuyen en safetensors |
| Idiomas soportados | no disponible (la instruccion de tarea se toma literalmente de `prompts.txt`, pero no se declara el idioma) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`franka/final.safetensors`, `foundation/final.safetensors`, export de pi-0.5) |
| Autor | Recharge23 |
| Fecha de creacion / actualizacion | 22 de septiembre de 2026 (ambas) |
| Tamano del repositorio | 1,3 GB (los tres adaptadores juntos) |
| Tipo de artefacto | adaptadores fine-tuneados, no modelos fusionados; requieren el base correspondiente |
| Modelos base requeridos | `Franka-JAM.safetensors` y `Foundation-JAM.safetensors` en `JAM-realworld/JAM-realrobot`, revision `de03f461ca1d532e1c4aca10decf0e09e3f731cd` |
| Dataset de entrenamiento | `24jihoward/gello-franka-jam-demos`, revision `11176cf1dbdd537218e4ecd2aeb48c9333634f03` |
| Entrada en inferencia | imagen RGB de camara externa (640x512, con 16 filas negras arriba y abajo sobre el lienzo nativo de 640x480), pose10 de brida sin normalizar e instruccion exacta de `prompts.txt` |
| Salida en inferencia | 32 objetivos absolutos en el marco base del robot: XYZ de brida, las dos primeras columnas de la matriz de rotacion y apertura (0 cerrado, 1 abierto) |
| Pipeline declarado | robotics |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna de JAM ni de pi-0.5; se limita a especificar el contrato de servicio. Lo que sí se detalla es el esquema de supervisión de cada adaptador. Franka-JAM se entrena con la siguiente pose de brida realmente alcanzada y el siguiente comando binario de pinza, y sus límites XYZ se ampliaron a partir de los episodios de entrenamiento. Foundation-JAM se entrena con la siguiente pose de brida comandada y el comando binario de pinza. En ambos casos el autor insiste en que la configuración de normalización está emparejada con el adaptador y no debe modificarse; en el caso de Franka, la normalización por defecto del repositorio es distinta de la suministrada aquí.

Los datos proceden de un único dataset fijado por revisión, con 130 demostraciones teleoperadas mediante GELLO: 50 para la tarea 4 y 20 para cada una de las otras cuatro tareas. El reparto es de 117 grabaciones de entrenamiento y 13 reservadas para validación. Los checkpoints mezclados no incluyen la expansión posterior a la tarea 5, que se distribuye como artefacto separado. No se documentan en la información disponible el número de tokens, la composición completa del dataset, ni si hubo RLHF, DPO o cualquier etapa de alineación.

La innovación práctica del release es de ingeniería más que de modelado: un script `prepare_serving_root.py` que construye un runtime aislado y verifica hashes sin tocar el checkout de origen, y un servidor `serve_resident.py` que carga base más adaptador y expone un endpoint HTTP que habla el protocolo del cliente GELLO `tools/jam_gello_client.py`. Los tres adaptadores superaron comprobaciones de tensores finitos e inferencia HTTP offline con el cliente real.

## Capacidades

- Ejecucion de politicas de manipulacion robotica sobre un brazo Franka mediante el cliente GELLO, devolviendo 32 objetivos absolutos en el marco base del robot.
- Fine-tuning multi-tarea: un unico adaptador entrenado sobre cinco tareas mezcladas en lugar de un adaptador por tarea.
- Supervisión de pose de brida (XYZ mas dos columnas de la matriz de rotacion) y de apertura de pinza en escala 0-1.
- Procesamiento de imagen RGB de camara externa a 640x480 nativo, presentada como 640x512 con bandas negras; el adaptador de pi-0.5 recorta esos bordes internamente.
- Consumo de instrucciones de tarea en texto tomadas literalmente de `prompts.txt`.
- Servicio por HTTP en localhost, pensado para tunel SSH cuando el host de inferencia es remoto.
- Integracion con dos familias base distintas (JAM y pi-0.5) con contratos de preprocesado separados y entornos de Python separados.
- No se declaran capacidades de generacion de texto, razonamiento, codigo, matematicas, vision general, tool calling, agentes ni modo de pensamiento; el artefacto es exclusivamente de control robotico.

## Casos de uso

- Manipulacion con brazo Franka en laboratorio: el adaptador `franka/final.safetensors` se carga sobre `Franka-JAM.safetensors` y sirve objetivos absolutos de brida y pinza, lo que permite probar una politica multi-tarea entrenada con 117 demostraciones sin reentrenar.
- Reproduccion de experimentos de fine-tuning multi-tarea: al estar fijadas las revisiones del dataset y del código de servicio, otro grupo puede reconstruir exactamente el mismo pipeline y comparar sus propios checkpoints contra estos.
- Investigacion en teleoperacion GELLO: el cliente `tools/jam_gello_client.py` y el contrato de entrada (imagen, pose10 sin normalizar, instruccion) sirven como referencia para integrar hardware GELLO con un servidor de politica local.
- Evaluacion de generalizacion entre modelos base: al existir adaptadores paralelos para Franka-JAM y Foundation-JAM sobre el mismo dataset, se pueden comparar dos esquemas de supervision (pose alcanzada frente a pose comandada) bajo condiciones identicas.
- Estudio de export de pi-0.5: la carpeta `pi05/` contiene un export normalizado completado antes de la correccion del grupo de optimizador, lo que lo hace util como caso de analisis de diferencias entre recetas de optimizacion.
- Infraestructura de inferencia en localhost con tunel SSH: el servidor se ata a 127.0.0.1, de modo que un equipo puede mantener la GPU en una maquina remota y controlar el robot desde otra sin exponer el endpoint a la red.
- Verificacion de compatibilidad de interfaz antes de actuar: la autocomprobacion y el dry-run del cliente permiten validar que la imagen, la pose y el formato de respuesta encajan con el setup fisico antes de enviar comandos al robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que los checkpoints finales no superaron de forma consistente a checkpoints anteriores seleccionados por validacion y que no se reclama ninguna tasa de exito en bucle cerrado. Existe un fichero `VALIDATION.json` que registra el alcance de la validacion y algunos diagnosticos offline, pero sus valores no se incluyen en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio completo ocupa 1,3 GB y contiene tres adaptadores, pero el consumo real lo determina el modelo base correspondiente, cuyo tamano no se documenta en la informacion disponible.
- GPU recomendadas: no disponible; la model card no menciona ninguna GPU concreta ni requisitos minimos.
- Encaje en GPU de consumo: no disponible. Sin el tamano de los modelos base no puede afirmarse si caben en una RTX 4090 o similar.
- Opciones de despliegue: servidor propio del repositorio (`tools/serve_resident.py`) que carga checkpoint mas adaptador y escucha en `127.0.0.1:8000` por defecto; cliente `tools/jam_gello_client.py`; tunel SSH para hosts de inferencia remotos. No se contemplan vLLM, llama.cpp, Ollama ni TGI en la documentacion.
- Preparacion del entorno: `prepare_serving_root.py` genera un runtime aislado por perfil (`franka`, `foundation`) y verifica hashes. JAM y pi-0.5 requieren entornos de Python separados.
- Latencia y throughput: no disponible. Solo se especifica que cada respuesta contiene 32 objetivos absolutos y que la entrada es una imagen 640x512 mas una instruccion.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| JAM-20K-mix (este release) | Adaptadores LoRA sobre JAM y pi-0.5 | no disponible | no aplica | sin tasa de exito en bucle cerrado | no disponible | Publico en HuggingFace; base JAM original en repositorio privado |
| pi-0.5 | Politica VLA base | no disponible | no disponible | no disponible en esta informacion | no disponible | Referenciado en la model card como base; el export incluido precede a la correccion del grupo de optimizador |
| Otros VLA de robotica de codigo abierto (OpenVLA, Octo, RT-2) | Politicas viso-lenguaje-accion | no disponible | no disponible | no disponible en esta informacion | variable segun proyecto | Publicos |

No se dispone de datos comparativos de parametros, contexto, rendimiento ni licencia para ninguna de las alternativas dentro de la informacion proporcionada, por lo que la comparacion cuantitativa queda como no disponible.

## Limitaciones y advertencias

- No se reclama ninguna tasa de exito en bucle cerrado. La verificacion realizada cubre tensores finitos e inferencia HTTP offline con el cliente GELLO real, es decir, compatibilidad de interfaz, no exito fisico en la tarea.
- Los checkpoints finales de 20K no superaron de forma consistente a checkpoints anteriores seleccionados por validacion, segun el propio autor.
- Base de datos muy reducida: 130 demostraciones en total, con solo 13 grabaciones reservadas para validacion. Las tareas 1, 2, 3 y 5 cuentan con 20 demostraciones cada una.
- Los checkpoints mezclados no incluyen la expansion posterior a la tarea 5; quien la necesite debe usar el artefacto especifico correspondiente.
- Los adaptadores no son modelos fusionados y dependen de un base concreto: `Franka-JAM.safetensors` o `Foundation-JAM.safetensors` en la revision `de03f461ca1d532e1c4aca10decf0e09e3f731cd`. El repositorio JAM original es privado y requiere una cuenta con acceso o una copia previa cuyo SHA coincida con `identity.json`.
- La normalizacion por defecto de Franka del repositorio base es distinta de la suministrada; usar la configuracion por defecto puede producir un comportamiento incorrecto. La configuracion y normalizacion de Foundation estan emparejadas con su adaptador y no deben alterarse.
- El export de pi-0.5 precede a la correccion del grupo de optimizador; la receta corregida que se ejecuta por separado no esta representada por estos pesos.
- Licencia no declarada: no hay autorizacion explicita de uso comercial ni condiciones de redistribucion.
- Trazabilidad y madurez limitadas: 0 descargas y 0 likes en el momento de la consulta, repositorio creado y actualizado el mismo dia.
- Para uso real hay que alinear camara, calibracion de brida y herramienta, limites de espacio de trabajo, backend de pinza y temporizacion de ejecucion. El release no modifica ninguno de esos limites del controlador.
- El servidor se ata a localhost por diseno; exponerlo en red requiere un tunel SSH y no se documentan medidas de autenticacion.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/Recharge23/JAM-20K-mix
- Codigo de inferencia y cliente GELLO: https://github.com/lixuan27/JAM-realrobot (rama `inference-gello-client`, commit `b2e77d77d9590798fb0856ee214e8255c32e7ce4`)
- Modelos base JAM: https://huggingface.co/JAM-realworld/JAM-realrobot (revision `de03f461ca1d532e1c4aca10decf0e09e3f731cd`; repositorio de acceso restringido)
- Dataset de demostraciones: https://huggingface.co/datasets/24jihoward/gello-franka-jam-demos (revision `11176cf1dbdd537218e4ecd2aeb48c9333634f03`)
- Guia especifica de pi-0.5: `pi05/README.md` dentro del repositorio del modelo
- Diagnostico de validacion: `VALIDATION.json` dentro del repositorio del modelo
- La busqueda web realizada no devolvio ningun enlace adicional relevante sobre este modelo.
