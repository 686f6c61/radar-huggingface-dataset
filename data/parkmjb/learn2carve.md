# parkmjb/learn2carve

## Resumen

learn2carve es una coleccion de checkpoints de politicas de aprendizaje por refuerzo (RL) entrenadas con PPO mediante la libreria skrl sobre Isaac Lab e Isaac Sim. El objetivo del proyecto es ensenar a un humanoide Unitree G1, sin modificaciones fisicas ("stock"), a realizar giros de snowboard encadenados por un circuito descendente de 100 metros. El autor publica en este repositorio de Hugging Face todos los runs guardados durante el entrenamiento, no solo la politica final, lo que permite reproducir o reanudar cualquier etapa de la cadena de entrenamiento.

El repositorio complementa al codigo publicado en GitHub (Michae1Park/learn2carve), que solo conserva los pesos de la politica final. Aqui se incluyen las siete etapas de la cadena de entrenamiento del G1 (`saved/g1/chain/01` a `07`), donde cada etapa se inicializa por warm-start desde la anterior, ademas de cuatro runs de un piloto AMP anterior (`saved/01` a `04`). La politica final reportada, `07_stage7_g1_7065_finish60`, completa el circuito en 6 de 6 evaluaciones sin caidas, con tiempos de 17,3 a 18,5 segundos y 6 giros encadenados por run.

No se trata de un modelo de lenguaje: es un artefacto de RL con pesos de politica (`.pt`) para simulacion robotica. Su relevancia es acotada al ambito de la robotica de locomotion y control, y su utilidad practica depende enteramente de la infraestructura Isaac Sim/Isaac Lab y de los ficheros de configuracion incluidos en cada carpeta de run.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica neuronal entrenada con PPO (skrl) sobre Isaac Lab / Isaac Sim; arquitectura de red no detallada en la informacion disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | checkpoints PyTorch (`checkpoints/best_agent.pt`) acompanados de `run.yaml`, `physical.yaml`, `ppo.yaml` y fichero de stance |
| Tamano del repositorio | 0,1 GB |
| Entorno de simulacion | Isaac Sim / Isaac Lab |
| Algoritmo de RL | PPO (skrl) |
| Robot | Unitree G1 (humanoide stock) |
| Tarea | Snowboard: giros encadenados en circuito de 100 m |

## Arquitectura y entrenamiento

La informacion disponible no detalla la topologia de la red de politica (capas, dimensiones de observacion o accion). Lo que si se documenta es el proceso: politicas PPO implementadas con skrl dentro de Isaac Lab, simuladas en Isaac Sim, con una cadena de siete etapas para el G1 en la que cada run se inicializa por warm-start desde el run final de la etapa precedente. Cada carpeta de run conserva el `run.yaml` con la configuracion completa del entorno, el `physical.yaml`, el `ppo.yaml`, el fichero de stance y un README con las metricas de entrenamiento, lo que hace el entrenamiento reproducible a nivel de configuracion.

La politica final corresponde a la etapa 7 (`07_stage7_g1_7065_finish60`), con fijaciones de 70°/65° y cambio de canto a 60° a lo largo de la pendiente. Los resultados de evaluacion reportados (120 s al comando completo) son: 6 de 6 runs alcanzan el final del circuito sin caidas, tiempo de 17,3 a 18,5 s, 6 giros encadenados por run, canto medio de 57–59° y deslizamiento de 1,5°. Ademas de la cadena del G1, el repositorio incluye los runs `saved/01`–`04` de un piloto AMP anterior (etapas 2–4).

## Capacidades

- Control de un humanoide Unitree G1 en simulacion para una tarea motora especifica: descenso en snowboard por un circuito de 100 m.
- Ejecucion de giros encadenados (6 por run) con cambio de canto definido (60° segun la politica final).
- Mantenimiento de canto medio de 57–59° con deslizamiento bajo (1,5°) durante la trazada.
- Finalizacion consistente del recorrido: 6 de 6 evaluaciones completadas sin caidas en la politica final.
- Reanudacion del entrenamiento desde cualquier etapa de la cadena gracias a los checkpoints intermedios y sus ficheros de configuracion.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, capacidades de agente ni soporte multilingue; no es un modelo de lenguaje.

## Casos de uso

- Investigacion en RL para locomotion y control motor: el repositorio permite reproducir la cadena completa de siete etapas del G1 y analizar como evoluciona la politica con el warm-start entre etapas, usando los `run.yaml` y `ppo.yaml` incluidos.
- Reproduccion de resultados: clonando el repositorio de GitHub e instalando con `scripts/install.sh`, se puede descargar un run concreto con `hf download` y lanzarlo con `scripts/py playground/snowboard/play.py`, lo que facilita verificar las metricas reportadas.
- Comparacion de etapas de entrenamiento: al conservar el ultimo run de cada etapa, se puede evaluar la diferencia de comportamiento entre etapas (por ejemplo, entre `05_stage5_g1_7065_edge65` y la etapa 7) bajo el mismo entorno.
- Estudio de tecnicas de warm-start en PPO: la cadena de etapas encadenadas sirve como caso practico para medir el efecto de inicializar cada etapa desde la politica anterior en una tarea de control dinamico.
- Base para transferencia a otros humanoides o variantes de fijaciones: los ficheros `physical.yaml` y de stance permiten modificar parametros fisicos y reentrenar sobre la politica existente.
- Docencia y divulgacion en robotica simulada: el circuito de 100 m y las metricas claras (tiempo, numero de giros, canto, deslizamiento) ofrecen un ejemplo tangible de evaluacion de politicas RL en Isaac Sim.

## Benchmarks y rendimiento

| Evaluacion (120 s al comando completo) | Resultado |
|---|---|
| Runs que alcanzan el final del circuito de 100 m | 6 / 6, sin caidas |
| Tiempo de run | 17,3–18,5 s |
| Giros encadenados por run | 6 |
| Canto medio | 57–59° |
| Deslizamiento | 1,5° |

No se han publicado resultados comparativos con otros modelos o politicas en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamano del repositorio es de 0,1 GB y los checkpoints son ficheros `.pt`, pero no se detalla el consumo en GPU.
- GPU recomendadas: no disponible. La simulacion se ejecuta en Isaac Sim / Isaac Lab, cuyo requisito de GPU no se especifica en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ejecucion mediante el script `playground/snowboard/play.py` del repositorio de GitHub, tras instalar con `scripts/install.sh`; descarga de pesos con `hf download`. No se documentan opciones como vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros modelos o politicas de RL comparables en parametros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no escribe codigo y no soporta tool calling ni agentes.
- La licencia no esta disponible, por lo que no se puede confirmar si se permite el uso comercial; conviene contactar con el autor antes de cualquier uso en produccion.
- El alcance esta limitado a una tarea concreta (snowboard en un circuito de 100 m) y a un robot concreto (Unitree G1 stock); no hay evidencia de generalizacion a otros humanoides, terrenos o condiciones.
- Los resultados reportados (6/6 sin caidas, 17,3–18,5 s) provienen de la model card del autor y corresponden a evaluacion en simulacion (Isaac Sim); no se documenta validacion en hardware real.
- El repositorio de GitHub solo conserva los pesos de la politica final; los runs intermedios dependen de este repositorio de Hugging Face y de las rutas exactas indicadas para su uso.
- No se detalla la arquitectura de red ni el numero de parametros, lo que dificulta estimar costes de inferencia o de reentrenamiento.
- Riesgo de sobreajuste a la configuracion fisica y de fijaciones documentada (70°/65°, cambio de canto a 60°); cambios en estos parametros requeririan reentrenamiento o ajuste.
- No se documentan sesgos, riesgos de alucinacion ni limitaciones de idioma porque no aplican a este tipo de artefacto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/parkmjb/learn2carve
- Repositorio de GitHub: https://github.com/Michae1Park/learn2carve
- Notas de entrenamiento del G1 (referenciadas en la model card): `docs/G1_TRAINING_NOTES.md` dentro del repositorio de GitHub
