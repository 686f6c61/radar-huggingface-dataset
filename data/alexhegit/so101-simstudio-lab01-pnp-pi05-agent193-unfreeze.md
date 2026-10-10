# alexhegit/so101-simstudio-lab01-pnp-pi05-agent193-unfreeze

## Resumen

SO-101 Lab01 Pick-and-Place — pi05 full unfreeze es un modelo de vision-lenguaje-accion (VLA) para control robotico, publicado por el usuario alexhegit en HuggingFace bajo licencia Apache 2.0. Se trata de un fine-tune completo del modelo ant0nh/pi05_pnp_425_25k, a su vez derivado de la familia pi05 (PI05Policy) de la libreria LeRobot. Cuenta con 4.143.404.816 parametros entrenables (4,14 mil millones) y se distribuye en formato safetensors con un tamano de repositorio de 9,4 GB.

El modelo resuelve una tarea concreta de pick-and-place sobre un brazo SO-101 en el entorno simulado SimStudio (Laboratorio 01, variante Home20). A diferencia de la ejecucion previa del mismo autor, aqui se descongela por completo la pila PaliGemma (torre de vision, proyector, modelo de lenguaje y experto de acciones), con `train_expert_only=false` y `freeze_vision_encoder=false`. El resultado publicado es de 34/60 exitos acumulados en tres semillas, frente a los 12/60 de la ejecucion anterior con solo el experto entrenable.

Su relevancia es de nicho pero clara: sirve como referencia reproducible de hasta donde llega el ajuste completo de un VLA pequeno (4B) en una tarea de manipulacion simulada, y como punto de partida para transferencia o para comparar estrategias de congelacion de capas. No es un modelo de proposito general: no se documenta capacidad de conversacion, generacion de texto libre ni soporte multilingue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) sobre pila PaliGemma (torre de vision, proyector y modelo de lenguaje) mas experto de acciones; implementada como PI05Policy en LeRobot |
| Parametros totales | 4.143.404.816 (todos entrenables en este fine-tune) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos publicados estan en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria lerobot) |
| Tamano del repositorio | 9,4 GB |
| Modelo base | ant0nh/pi05_pnp_425_25k |
| Dataset de entrenamiento | alexhegit/so101-simstudio-lab01-pnp-agent-yaw-v4-actonly-follow2 (193 episodios) |
| Dimension de estado y accion | 6-D, posiciones articulares absolutas (`.pos`); `use_relative_actions=false` |
| Entradas visuales | `camera_wrist` -> `observation.images.wrist`; `camera_front` -> `observation.images.front` (la camara superior grabada no es entrada) |
| Horizonte de accion | chunk / `n_action_steps` = 50 |
| Precisión de entrenamiento | bfloat16 |
| Checkpoint publicado | directorio `005000` (tercera etapa de 5000 pasos) |

## Arquitectura y entrenamiento

El modelo sigue el esquema de los VLA tipo pi0/pi05: un backbone de vision-lenguaje PaliGemma que procesa imagenes de camara y produce representaciones, acoplado a un experto de acciones que genera secuencias de comandos motores. En este fine-tune la totalidad de la pila es entrenable (torre de vision, proyector, modelo de lenguaje y experto de acciones), lo que contrasta con la ejecucion anterior del mismo autor, limitada al experto. La salida son 6 dimensiones de posicion articular absoluta, emitidas en bloques de 50 acciones por inferencia.

El entrenamiento usa el dataset `alexhegit/so101-simstudio-lab01-pnp-agent-yaw-v4-actonly-follow2`, compuesto por 193 episodios de pick-and-place grabados en simulacion. En disco el campo `observation.state` es de 15 dimensiones, pero el entrenamiento emplea unicamente las 6 primeras posiciones articulares. El regimen de optimizacion se divide en tres etapas de 5000 pasos: cada etapa arranca un optimizador nuevo con learning rate pico de 2,5e-6, 200 pasos de warmup y decaimiento hasta 2,5e-7 a lo largo de esos 5000 pasos; de ahi que el checkpoint publicado se llame `005000` pese a no ser el primer tramo. No se especifica el numero total de tokens ni la composicion detallada del dataset, y no se documenta uso de RLHF ni DPO.

## Capacidades

- Manipulacion robotica pick-and-place: agarre, elevacion, cierre de pinza y deposito de objetos sobre una mesa, aprendidos por imitacion a partir de demostraciones simuladas.
- Control de brazo SO-101 mediante comandos de 6 grados de libertad en posicion articular absoluta.
- Generacion de secuencias de accion en bloques de 50 pasos (`n_action_steps=50`), lo que reduce la frecuencia de inferencia necesaria en el bucle de control.
- Percepcion visual desde dos camaras simultaneas: muneca (`camera_wrist`) y frontal (`camera_front`).
- Especializacion en la variante de tarea Home20 del laboratorio 01 de SimStudio, con brazo en posicion `home` y pinza arrancando en 0.85.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes, razonamiento multi-paso ni modo de pensamiento explicito.
- No se documenta capacidad multilingue ni procesamiento de lenguaje natural de proposito general.
- No se documentan capacidades de audio ni de vision generica fuera del uso como entrada de politica.

## Casos de uso

- Automatizacion de pick-and-place en simulacion: el modelo ejecuta la secuencia completa de agarre, elevacion y deposito sobre el banco de pruebas Home20, con una tasa de exito agregada de 34/60, suficiente para experimentacion pero no para produccion sin supervision.
- Punto de partida para transferencia a un layout nuevo: al estar toda la pila descongelada, el modelo puede reajustarse con pocos episodios adicionales cuando cambian posiciones de objeto o iluminacion, en lugar de reentrenar desde cero.
- Referencia comparativa de estrategias de congelacion: permite medir experimentalmente la diferencia entre ajustar solo el experto de acciones (12/60) y ajustar todo el stack (34/60) sobre el mismo dato de 193 episodios.
- Docencia e investigacion en robotica de bajo coste: el brazo SO-101 y LeRobot forman una plataforma asequible, y este checkpoint sirve para ilustrar un ciclo completo de recogida de datos, entrenamiento y evaluacion en simulador.
- Generacion de datos sinteticos de politica: las trayectorias producidas pueden usarse como politicas base para destilacion o para poblar un buffer de evaluacion con exito parcial.
- Integracion en pipelines de evaluacion automatizada: el chunk de 50 acciones y la API de `PI05Policy.from_pretrained` permiten lanzarlo dentro de un harness de evaluacion por semillas (1000, 1001, 1002) y comparar checkpoints de forma sistematica.
- Estudio del fallo de liberacion de objeto: con solo 3/60 exitos en la subtarea `drop` frente a 58/60 en `close`, el modelo es un caso util para investigar por que la pinza no suelta el objeto en el punto objetivo.

## Benchmarks y rendimiento

Resultados publicados por el autor en la tarea Lab01-PnP-Home20, sin toma de control por parte de un experto, con brazo en `home`, pinza inicial en 0.85 y semillas 1000/1001/1002. La metrica citada es `final_success`.

| Metrica | Semilla 1000 | Semilla 1001 | Semilla 1002 | Total |
|---|---|---|---|---|
| Exitos Home20 | 12/20 | 11/20 | 11/20 | 34/60 |

| Subtarea | Exitos |
|---|---|
| Lift (elevacion) | 38/60 |
| Close (cierre de pinza) | 58/60 |
| Drop (liberacion del objeto) | 3/60 |

Comparacion con la ejecucion anterior del mismo autor (`alexhegit/so101-simstudio-lab01-pnp-pi05-agent193`, 10K pasos, solo experto entrenable): 12/60. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K ni equivalentes) en la informacion disponible, lo cual es esperable al tratarse de un modelo de robotica y no de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 8,3 GB solo para pesos (4.143.404.816 parametros x 2 bytes), mas el coste de activaciones del codificador de vision al procesar dos flujos de camara y del experto de acciones; el repositorio completo ocupa 9,4 GB. Es una estimacion derivada del recuento de parametros, no un dato publicado por el autor.
- GPU recomendadas: cualquier tarjeta con 16 GB o mas de VRAM. Una RTX 4090 (24 GB), RTX 3090 (24 GB), RTX 4080 (16 GB) o RTX 4070 Ti Super (16 GB) deberian ser suficientes para inferencia; A100 o H100 aportan margen para lotes mayores o para reentrenamiento.
- Cabe en GPU de consumo: si, previsiblemente en modelos de 16 GB o superiores. En tarjetas de 12 GB o menos es probable que requiera cuantizacion o reduccion de precision, si bien no se documentan recetas de cuantizacion para este checkpoint.
- Opciones de despliegue: la libreria LeRobot mediante `PI05Policy.from_pretrained`. No se documenta soporte para vLLM, Ollama, llama.cpp ni formatos GGUF, al no ser un modelo de lenguaje convencional.
- Latencia: no disponible. El unico dato relacionado es el horizonte de 50 acciones por inferencia.
- Consideracion adicional: el bucle de control necesita acceso a dos camaras sincronizadas (`wrist` y `front`); la camara superior del montaje original no se usa como entrada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| alexhegit/so101-simstudio-lab01-pnp-pi05-agent193-unfreeze (este) | 4,14B, todos entrenables | no disponible | 34/60 en Lab01-PnP-Home20 (semillas 1000/1001/1002) | apache-2.0 | HuggingFace, lerobot |
| alexhegit/so101-simstudio-lab01-pnp-pi05-agent193 | no disponible | no disponible | 12/60 (run de 10K pasos, solo experto) | no disponible en la informacion | HuggingFace; mapea `camera_top` a `front` |
| ant0nh/pi05_pnp_425_25k | no disponible | no disponible | no disponible | no disponible en la informacion | HuggingFace (modelo base del fine-tune) |

No se dispone de datos de arquitectura, contexto o rendimiento de otros VLA comparables (pi0, pi0.5 originales u otras variantes de LeRobot) en la informacion proporcionada, por lo que no se incluye una comparacion adicional.

## Limitaciones y advertencias

- Rendimiento limitado: 34/60 de exito agregado (aproximadamente 57%), insuficiente para despliegue autonomo sin supervision humana o mecanismos de recuperacion.
- Fallo critico en la liberacion del objeto: solo 3/60 exitos en la subtarea `drop`, frente a 58/60 en `close`. La politica cierra la pinza de forma fiable pero rara vez suelta el objeto en el punto correcto.
- Altamente especifico de tarea y entorno: entrenado para una unica tarea de pick-and-place en el laboratorio 01 de SimStudio con 193 episodios simulados. No hay evidencia de generalizacion a objetos, posiciones o escenas no vistas.
- Dependencia estricta de la configuracion de sensores: requiere exactamente dos camaras mapeadas a `wrist` y `front`. Confundir el mapeo con el de la ejecucion previa (que asigna `camera_top` a `front`) produce entradas incorrectas y resultados invalidos.
- Perdida de informacion de estado: el estado en disco tiene 15 dimensiones pero solo se usan las 6 primeras posiciones articulares; cualquier dimension adicional del montaje no influye en la politica.
- Riesgo de alucinacion en el sentido de acciones incoherentes: al ser una politica de imitacion, puede generar trayectorias plausibles pero fisicamente incorrectas cuando el estado de entrada se sale de la distribucion de entrenamiento.
- Sesgos conocidos: no se documentan analisis de sesgo. Al estar entrenado exclusivamente con demostraciones de un unico operador y montaje, hereda sus sesgos de posicionamiento y estilo de manipulacion.
- Limitaciones de idioma y contexto: no se documenta ninguna capacidad linguistica ni longitud de contexto; no debe evaluarse como modelo de lenguaje.
- Restricciones de licencia: los pesos se publican bajo apache-2.0, pero el modelo base (`ant0nh/pi05_pnp_425_25k`) y la familia pi05 original pueden tener condiciones propias que conviene verificar antes de un uso comercial.
- Adopcion muy baja: 9 descargas y 0 likes en el momento de la consulta, sin validacion independiente de los resultados.
- Fecha de publicacion registrada como 2026-10-10, posterior a la fecha habitual de referencia; conviene verificar la vigencia del repositorio.
- La busqueda web realizada no arrojo ningun enlace tecnico relevante sobre el modelo: los resultados devueltos eran dominios de contenido para adultos sin relacion alguna con el proyecto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alexhegit/so101-simstudio-lab01-pnp-pi05-agent193-unfreeze
- Modelo base: https://huggingface.co/ant0nh/pi05_pnp_425_25k
- Ejecucion previa (solo experto, 12/60): https://huggingface.co/alexhegit/so101-simstudio-lab01-pnp-pi05-agent193
- Dataset de entrenamiento: https://huggingface.co/datasets/alexhegit/so101-simstudio-lab01-pnp-agent-yaw-v4-actonly-follow2
- Notas de entrenamiento y reproduccion del resultado: https://github.com/rocPAI-Forge/so101-simstudio/blob/main/labs/lab01_pnp_agent/pi05_unfreeze_home20.md
- Repositorio de laboratorios SimStudio: https://github.com/rocPAI-Forge/so101-simstudio
- Libreria LeRobot: no disponible en la informacion proporcionada
- Paper o blog tecnico del modelo: no disponible
