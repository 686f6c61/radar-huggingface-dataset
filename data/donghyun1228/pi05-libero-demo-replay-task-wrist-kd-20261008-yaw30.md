# Donghyun1228/pi05-libero-demo-replay-task-wrist-kd-20261008-yaw30

## Resumen

Este repositorio contiene un checkpoint de politica robotica entrenado sobre la familia pi05 del proyecto openpi, aplicado al benchmark de manipulacion LIBERO. No es un modelo de lenguaje: es un modelo Vision-Language-Action (VLA) que, segun los identificadores de configuracion presentes en la model card, combina un componente VLM con un "action expert" y se entrena para producir acciones de control a partir de observaciones. El autor es Donghyun1228 y el peso del repositorio es de 12,4 GB en parametros Orbax.

El checkpoint corresponde a un experimento muy concreto de investigacion: aprendizaje por imitacion sobre repeticiones de demostraciones (demo replay) con un modelo de dinamica inversa (IDM) condicionado por tarea, combinado con destilacion de conocimiento (KD) sobre las senales base, wrist y prompt. La model card detalla la receta de entrenamiento: inicializacion independiente desde el checkpoint "original-demo cumulative-average pre-adapt v1/4999", horizonte H10, pesos de perdida IL=0, IDM=1, KD=1/1/0,25, 5000 actualizaciones, lotes globales IDM/KD de 32/32, FSDP en 4 dispositivos, tasa de aprendizaje 1e-5, EMA 0,999 y semilla 42. La variante se etiqueta como "yaw30" y, segun la propia card, la rama "yaw" entrena la politica completa mientras que la rama "view" congela el action expert.

Su relevancia es acotada pero clara para quien trabaja en robotica: documenta una ablacion reproducible sobre destilacion de un IDM en politicas VLA, con configuracion exacta, identidades de datos y commit de codigo referenciados en `training_configuration.json`. Es un artefacto de investigacion con 0 descargas y 0 likes, sin licencia declarada y sin resultados de benchmarks publicados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) de la familia pi05 (openpi), con componente VLM y "action expert" segun `pi05_libero_action_frame_shared_decoder_idm_demo_replay_cumulative_average_paired_vlm_kd` |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en precision de entrenamiento; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (existe un componente VLM en la config, pero la model card no documenta cobertura linguistica) |
| Licencia | no disponible |
| Formato de pesos | Orbax (JAX/Flax), junto con activos de normalizacion |

## Arquitectura y entrenamiento

La model card no describe la arquitectura en detalle; se limita a nombrar la configuracion de politica (`pi05_libero_action_frame_shared_decoder_idm_demo_replay_cumulative_average_paired_vlm_kd`) y a mencionar un "action expert" que puede congelarse o entrenarse. Por los identificadores se deduce una politica de la familia pi05 de openpi con decodificador compartido sobre marcos de accion (`action_frame_shared_decoder`), condicionada por un VLM emparejado (`paired_vlm`) y con una cabeza o modulo de dinamica inversa condicionado por tarea. El modelo se evalua en LIBERO, el suite de referencia de manipulacion robotica, y el replay se ejecuta con MuJoCo 3.2.3.

En cuanto al entrenamiento, la receta es explicita: 5000 actualizaciones partiendo de una inicializacion independiente desde el checkpoint "original-demo cumulative-average pre-adapt v1/4999"; perdida de imitacion desactivada (IL=0) y perdidas de IDM y KD activas (IDM=1, KD=1/1/0,25 sobre las tres senales base, wrist y prompt); lotes globales de 32 para IDM y 32 para KD; FSDP sobre 4 dispositivos; learning rate 1e-5; EMA 0,999; semilla 42. La diferencia entre las dos ramas del experimento es el alcance del gradiente: la rama "view" congela el action expert y la rama "yaw" entrena la politica completa. H10 se interpreta como un horizonte de 10 pasos, aunque la card no lo explicita. La identidad exacta de los datos, los comandos y el commit de codigo estan en `training_configuration.json`, que no se ha podido inspeccionar desde esta ficha.

## Capacidades

- Generacion de acciones de control robotico en el entorno LIBERO a partir de observaciones, no generacion de texto libre.
- Aprendizaje de dinamica inversa condicionado por tarea (IDM con H10), es decir, inferir acciones a partir de transiciones observadas.
- Destilacion de conocimiento desde multiples senales (base, wrist, prompt) con pesos 1/1/0,25.
- Replay de demostraciones para reentrenamiento de politicas sin necesidad de interaccion en linea.
- Entrenamiento selectivo por modulos: congelar el action expert (rama "view") o ajustar la politica completa (rama "yaw").
- Soporte de tool calling / function calling: no aplica ni se documenta.
- Soporte de agentes y razonamiento multi-paso: no aplica ni se documenta.
- Capacidades multilingues: no documentadas.
- Capacidades especiales (modo thinking, vision, audio): no documentadas; el componente VLM sugiere entrada visual, pero no se detalla.

## Casos de uso

- Investigacion en destilacion de politicas VLA: usar el checkpoint como punto de partida o referencia para reproducir la ablacion IDM + KD descrita, comparando la rama "yaw" frente a la rama "view" con los mismos hiperparametros.
- Reproducibilidad de experimentos de robotica: el repositorio incluye parametros Orbax, activos de normalizacion y una configuracion de entrenamiento con semilla fija (42), lo que permite repetir el entrenamiento y auditar la receta.
- Evaluacion en el benchmark LIBERO: el checkpoint esta etiquetado como `libero`, por lo que su uso natural es medir exito en tareas de manipulacion de ese suite dentro de MuJoCo 3.2.3.
- Estudio de robustez frente a perturbaciones de orientacion: la variante "yaw30" apunta a una condicion de rotacion en el eje yaw; sirve para analizar degradacion de la politica bajo cambios de orientacion del efector o del objeto.
- Aprendizaje por imitacion a partir de demostraciones existentes: el enfoque de demo replay con IDM permite reutilizar trayectorias ya grabadas en lugar de generar nuevos rollouts, util cuando la recoleccion en simulador es costosa.
- Baseline para comparaciones de eficiencia de entrenamiento: con 5000 actualizaciones, lotes de 32 y LR 1e-5, es un punto de referencia barato para medir si variantes de KD convergen antes o mejor.
- Docencia y formacion en robotica de aprendizaje: un artefacto pequeno y bien documentado en cuanto a hiperparametros sirve para explicar el flujo completo de openpi, desde el replay hasta el checkpoint Orbax.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito en LIBERO ni ninguna otra metrica cuantitativa; unicamente describe la receta de entrenamiento. El suite LIBERO se menciona como entorno de evaluacion, pero sin cifras asociadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia derivada del repositorio, los pesos ocupan 12,4 GB; mantenerlos en memoria implica al menos ese orden de magnitud, mas el overhead de activaciones y del runtime JAX.
- GPU recomendadas: no disponibles. Lo unico documentado es que el entrenamiento se ejecuto con FSDP sobre 4 dispositivos; no se especifica el modelo de GPU.
- Encaje en GPU de consumo: no disponible. Sin conocer el numero de parametros ni la precision de los pesos, no puede afirmarse que quepa en una RTX 4090 u otra GPU de consumo.
- Opciones de despliegue: los pesos estan en formato Orbax, por lo que el stack natural es JAX junto con el framework openpi. vLLM, llama.cpp, Ollama o TGI no son aplicables a este artefacto, orientado a control robotico y no a inferencia de texto.
- Simulacion: MuJoCo 3.2.3, indicado explicitamente en la model card como entorno de replay.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Relacion con este checkpoint | Datos conocidos | Licencia |
|---|---|---|---|
| Este checkpoint (`...yaw30`) | Variante "yaw" con IDM + KD, 5000 actualizaciones, semilla 42 | Receta completa en la model card; 12,4 GB; 0 descargas | no disponible |
| Original-demo cumulative-average pre-adapt v1/4999 | Inicializacion independiente declarada por el autor | Solo se cita como punto de partida; no hay ficha publica en la informacion disponible | no disponible |
| pi05 base de openpi (LIBERO) | Modelo del que deriva la configuracion de politica | No se aportan parametros ni resultados en la informacion disponible | no disponible |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas de la misma categoria. Para contexto adicional seria necesario consultar la documentacion oficial de openpi y las fichas de los checkpoints base, no incluidas en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: no hay autorizacion explicita de uso, lo que hace arriesgado cualquier uso comercial o redistribucion.
- Cero descargas y cero likes: el checkpoint no ha sido validado por terceros y no existe evidencia externa de que funcione segun lo descrito.
- Sin benchmarks publicados: no hay tasas de exito ni comparaciones objetivas en LIBERO ni en ningun otro entorno.
- Model card muy escueta: no se documentan parametros, contexto, idiomas ni arquitectura en detalle; buena parte de las afirmaciones de esta ficha proceden de inferencias a partir de nombres de configuracion y deben tratarse como tales.
- Especificidad del experimento: la variante "yaw30" esta atada a una condicion concreta de rotacion; no hay evidencia de generalizacion a otras orientaciones o tareas fuera de LIBERO.
- Riesgo de sobreajuste al simulador: no se aporta evidencia de transferencia a robot real (sim-to-real), y el pipeline documentado usa MuJoCo 3.2.3.
- Dependencia de la inicializacion: el entrenamiento parte de un checkpoint externo ("v1/4999") cuya disponibilidad y licencia no se detallan, lo que puede impedir la reproduccion exacta.
- Riesgo de alucinacion: no aplica en el sentido linguistico, pero si existe riesgo de acciones incorrectas o inseguras si se ejecuta sobre hardware fisico sin validacion previa en simulacion.
- Sesgos conocidos: no documentados. La composicion del dataset de demostraciones de LIBERO (y del replay usado) no se describe en la informacion disponible.

## Enlaces

- HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-demo-replay-task-wrist-kd-20261008-yaw30
- Configuracion de entrenamiento (referenciada en la model card): `training_configuration.json`, incluido en el repositorio
- Proyecto openpi: no disponible en la informacion proporcionada
- Benchmark LIBERO: no disponible en la informacion proporcionada
- Paper o blog del autor: no disponible
- Repositorio de codigo o demo: no disponible
