# rigby-robotics/rigby-task-potential-v2

## Resumen

Rigby task-potential v2 es un checkpoint de 36,5 millones de parametros desarrollado por rigby-robotics que implementa un modelo de grafo de relaciones tarea-potencial para robotica. No es un modelo de lenguaje generativo ni una politica autonoma: es un scorer aprendido de un paso que evalua paquetes de comandos de actuadores propuestos externamente y estima su efecto sobre la completitud de una tarea. El modelo codifica relaciones SE(3) dirigidas entre cuerpos y actuadores, junto con velocidades, geometria, articulaciones y mediciones de actuadores, y puntua los cambios de relacion resultantes condicionados a la tarea.

La relevancia del modelo reside en su planteamiento de arquitectura: separa la generacion de propuestas (delegada a un LLM externo) de la evaluacion de las mismas (realizada por este scorer). El flujo recomendado consiste en consultar a un LLM con el estado medido del robot y el contrato de actuadores, obtener varios paquetes numericos de objetivos, pasarlos a `score_control_candidates(..., selector="task_completion")` y ejecutar el candidato con mayor puntuacion. El modelo no genera las propuestas; solo las puntua.

El checkpoint se distribuye con el codigo minimo de inferencia y modelo necesario para cargarlo. El entrenamiento se realizo sobre episodios procedimentales de MuJoCo en tareas de pickup-and-hold, reach, push y place, con parametros de escena y contacto aleatorizados y 2, 3 o 4 apendices radiales. La evaluacion es exclusivamente en simulacion y los resultados publicados son preliminares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de grafos con bloques de estado, efecto y texto; codifica SE(3) relativo dirigido, velocidades, geometria, articulacion y mediciones de actuadores |
| Parametros totales | 36.534.626 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada de grafo de tamano variable por cuerpo y actuador) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (procesa tokens de texto/tarea, sin lista de idiomas declarada) |
| Licencia | no disponible (el export no concede licencia de reutilizacion) |
| Formato de pesos | PyTorch (`.pt`); fichero `task-potential-best.pt` de 146.225.981 bytes (139,4 MiB) |

Otras especificaciones declaradas: dimension de relacion 24, anchura 384, cuatro bloques de grafo de estado, dos bloques de efecto, dos bloques de texto, ocho atomos de objetivo y ocho cabezas de atencion.

## Arquitectura y entrenamiento

El modelo es una red de grafos que opera sobre entradas de tamano variable para cuerpos y actuadores. Codifica SE(3) relativo dirigido y local a la fuente, velocidades, geometria, articulacion y mediciones de actuadores. La ruta condicionada por tarea predice los efectos de los candidatos y puntua los cambios de relacion resultantes. Incluye una cabeza primitiva inversa experimental (`propose_controls()` / `select_control()`) que el autor desaconseja explicitamente para el flujo recomendado.

El entrenamiento utilizo episodios de interaccion generados proceduralmente en MuJoCo, cubriendo las tareas de pickup-and-hold, reach, push y place, con parametros de escena y contacto aleatorizados y configuraciones de 2, 3 y 4 apendices radiales. No se especifica el numero de tokens ni la composicion exacta del dataset, y no se incluyen el dataset crudo, los logs de entrenamiento ni transcripciones del proveedor. El modelo se describe como un scorer aprendido de efecto/completitud de un paso, no como una funcion Q optima verificada ni como una politica autonoma.

## Capacidades

- Puntuacion de paquetes de comandos de actuadores candidatos mediante `score_control_candidates(..., selector="task_completion")`, con seleccion por `argmax` (puntuaciones mas altas preferidas).
- Codificacion de estado de grafo variable: cuerpos, actuadores, relaciones SE(3) dirigidas, velocidades, geometria y articulacion.
- Condicionamiento por tarea mediante tokens de texto/tarea y ocho atomos de objetivo.
- Prediccion de efectos de un paso y puntuacion de cambios de relacion resultantes.
- Integracion con un LLM externo como generador de propuestas (el modelo no genera propuestas).
- Cabeza primitiva inversa experimental (`propose_controls()` / `select_control()`), desaconsejada por el autor para el flujo recomendado.
- No dispone de generacion de texto, razonamiento general, codigo, matematicas, vision ni audio.
- No se declara soporte de tool calling, function calling ni agentes multi-paso en el sentido de modelos de lenguaje.

## Casos de uso

- Seleccion de comandos en robotica de manipulacion: dado el estado medido del robot y un conjunto de paquetes numericos de objetivos propuestos por un LLM, el modelo puntua cada paquete y permite ejecutar el de mayor puntuacion de completitud de tarea. Es adecuado porque su objetivo entrenado es precisamente la completitud de tarea en tareas de pickup, reach, push y place.
- Pickup-and-hold en simulacion: el modelo fue entrenado con episodios de esta tarea y puede puntuar candidatos que impliquen levantamiento y mantenimiento; en la evaluacion preliminar un ensayo completo un hold de un segundo tras un levantamiento maximo de 8,086 cm.
- Reach y posicionamiento: al codificar relaciones SE(3) y geometria, puede evaluar candidatos orientados a alcanzar una pose objetivo en escenarios simulados con apendices de 2, 3 o 4 dedos.
- Push y place: el scorer puede clasificar candidatos en tareas de empuje y colocacion, condicionado por los atomos de objetivo y los tokens de tarea.
- Investigacion en arquitecturas de propuesta-evaluacion: sirve como componente evaluador en pipelines donde un LLM propone y un modelo especializado puntua, permitiendo estudiar la separacion entre generacion y seleccion de acciones.
- Auditoria de rankings de candidatos: util para comparar la puntuacion del modelo con resultados completos ejecutados, dado que el autor advierte que el objetivo puntua completitud y no levantamiento inmediato maximo.
- Prototipado en MuJoCo: con un adaptador especifico de robot que construya el batch conforme al ABI del proyecto (`src/model.py`, `src/dataset.py`) y mapee comandos numericos a unidades y rangos reales de los actuadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica evidencia es una prueba cualitativa en simulacion: en una comprobacion procedural de pickup con dos semillas, propuestas de un LLM externo (Codex, modelo `gpt-6.1-sol`) y seleccion por puntuacion aprendida, un ensayo completo un hold de un segundo tras un levantamiento maximo de 8,086 cm; el otro fue parcial (levantamiento de 8,313 cm seguido de timeout del proveedor) y no establecio un hold completado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 36,5 millones de parametros y un checkpoint de 139,4 MiB, la huella de pesos es reducida, pero el consumo depende del tamano de los grafos de entrada y del batch.
- GPU recomendadas: no disponible; el ejemplo de carga usa `device="cuda"`.
- Compatibilidad con GPU de consumo: no confirmada por el autor; por el tamano del checkpoint es plausible, pero no se declara soporte ni requisitos minimos.
- Opciones de despliegue: carga mediante PyTorch y NumPy con el codigo de `src` (`load_model`, `score_control_candidates`); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.
- Requiere un adaptador especifico de robot (MuJoCo u otro) para construir el batch y mapear comandos a actuadores; el ejemplo no es un driver de hardware.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (scorers de potencial de tarea sobre grafos de relaciones para robotica) ni datos de rendimiento que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- El modelo es un scorer aprendido de un paso; no es una funcion Q optima verificada ni una politica autonoma.
- La cabeza primitiva inversa (`propose_controls()` / `select_control()`) es experimental y el autor desaconseja usarla como fuente de propuestas.
- La evaluacion es exclusivamente en simulacion; no se ha establecido transferencia a brazos comerciales ni a hardware fisico.
- Los resultados publicados son preliminares: un unico ensayo completo un hold y otro quedo parcial por timeout del proveedor.
- El objetivo entrenado puntua completitud/hold de tarea, no levantamiento inmediato maximo; el ranking de candidatos debe auditarse contra resultados completos ejecutados.
- Tanto el modelo como el proponente LLM requieren evaluacion en cada nuevo adaptador de simulador antes de cualquier uso en hardware.
- El adaptador debe mapear cada valor de control a las unidades y rangos reales de los actuadores del robot; no deben enviarse etiquetas semanticas como "jaw" o "finger" en lugar de metadatos medidos de actuadores.
- No se concede licencia de reutilizacion en este export; el autor indica que solo deberia anadirse una licencia si el propietario del proyecto lo decide. El uso comercial queda, por tanto, sin autorizacion explicita.
- No se incluyen dataset crudo, logs de entrenamiento, transcripciones del proveedor, credenciales ni claves privadas.
- No se declaran sesgos conocidos, riesgos de alucinacion ni limitaciones de idioma; al no ser un modelo de lenguaje, estas categorias no aplican del mismo modo, pero la ausencia de datos al respecto impide descartarlas.
- El ejemplo de inferencia no es un driver de hardware y no debe tratarse como tal.

## Enlaces

- Hugging Face: https://huggingface.co/rigby-robotics/rigby-task-potential-v2
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion disponible.
