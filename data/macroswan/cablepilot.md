# MacroSwan/cablepilot

## Resumen

cablepilot es un modelo de mundo (world model) de muy pequeno tamano, 28.401 parametros, desarrollado por MacroSwan para el control de un robot de cables (cable-driven parallel robot) denominado Stringman. A diferencia del enfoque habitual de entrenar grandes politicas sobre horas de teleoperacion, este repositorio aprende el comportamiento de la maquina (como responden el portico, los cables y el pendulo a los comandos) a partir de simulacion sin tarea asociada, y resuelve cada tarea concreta mediante un planificador de muestreo MPPI que imagina futuros y elige los comandos de menor coste.

El modelo se complementa con task cards en YAML: ficheros de texto que describen que es un trabajo (etapas, skills, fallbacks) y que pueden escribirse, puntuarse y compartirse sin necesidad de un dataset ni de un entrenamiento. La propuesta es relevante porque reduce el coste de definir una nueva tarea robotica a una tarde de trabajo conceptual en lugar de una semana de teleoperacion, y porque funciona en CPU de portatil sin GPU.

El entrenamiento se realizo sobre movimiento simulado sin tarea en 12.000 habitaciones aleatorias durante 11 minutos en la CPU de un portatil. El repositorio esta pensado para agentes y desarrolladores que quieran evaluar el enfoque de world model pequeno combinado con planificacion por muestreo en robotica de manipulacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | World model con espacio latente JEPA y backbone cable/pendulo escrito a mano que el modelo corrige; planificador MPPI (model predictive path integral) |
| Parametros totales | 28.401 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; horizonte de planificacion de 2 s imaginados) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robotica, no linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`weights/stringman_g1.pt`) |
| Tamano del repositorio | 0,0 GB (pesos de 124 KB segun la model card) |
| Libreria | PyTorch |
| Pipeline | robotics |

## Arquitectura y entrenamiento

cablepilot combina un modelo de mundo con un planificador. El modelo de mundo parte de un espacio latente tipo JEPA y de un backbone escrito a mano que modela la fisica del robot de cables y del pendulo, y que la red aprendida corrige. El entrenamiento se realizo sobre movimiento simulado sin tarea en 12.000 habitaciones aleatorias, sin demostraciones y sin GPU, en 11 minutos sobre la CPU de un portatil. La habitacion entra en el modelo unicamente a traves de sus 4 puntos de anclaje calibrados, de modo que una habitacion nunca vista se reduce a 4 numeros nuevos.

La planificacion se realiza con MPPI, descrito en el repositorio como "el vortice": muestrea futuros correlacionados con ruido, ajusta la temperatura segun el tamano efectivo de muestra y usa warm start. Cada paso de control imagina 128 futuros de 2 segundos en aproximadamente 25 ms en CPU de portatil, lo que permite 5 planes por segundo dejando alrededor del 85 % del presupuesto libre. Las tareas se definen como costes sobre futuros imaginados (cercania al objeto, altura sobre el, no balanceo, tension de cables, evitacion de muebles) mas eventos sobre lo que mide el robot.

## Capacidades

- Modelado de la dinamica de un robot de cables (portico, lineas y pendulo) en espacio latente con correccion aprendida sobre backbone fisico.
- Planificacion de control en tiempo real mediante MPPI a 5 Hz en CPU de portatil.
- Definicion de tareas mediante task cards en YAML con etapas, skills y fallbacks, independientes del cuerpo del robot.
- Vocabulario compartido de skills (`see`, `pre_grasp`, `grasp`, `pre_inside`, `release`, `avoid`, entre otras) validado con `cablepilot check`.
- Vision ligera basada en las camaras existentes del robot: vista cenital con mascara de pixeles del propio robot (unos 9 ms por mirada) y camara de pinza para localizacion fina del objetivo.
- Linaje de tareas: las cards incluyen `parent`, `by` y `why`, y dos cards con la misma `signature()` se consideran la misma tarea.
- Soporte para agentes mediante `AGENTS.md`, con instrucciones de instalacion, comprobacion, puntuacion de cards y contribucion.
- Adaptador para el robot Stringman (escrito, no probado en hardware segun la model card).

## Casos de uso

- Recogida de objetos en habitacion simulada: la card `clean_the_room` introduce 29 de 36 juguetes en la caja en 3 episodios sobre un dormitorio importado de una grabacion de Stringman, con 0 contactos con muebles y 62 s por juguete, usando el planificador MPPI sobre el world model.
- Prototipado rapido de nuevas tareas roboticas: un desarrollador escribe una card YAML con etapas y skills, la valida con `cablepilot check` y la ejecuta en simulacion con `cablepilot run`, sin necesidad de grabar teleoperacion ni entrenar una politica.
- Evaluacion de estrategias de control en CPU: al necesitar solo 25 ms por plan y funcionar sin GPU, permite iterar sobre pesos de coste y umbrales en un portatil antes de trasladar el diseno a hardware.
- Investigacion en world models pequenos: el repositorio separa el modelo de mundo (`cablepilot/model/learned.py`) del planificador (`cablepilot/planner/mppi.py`), lo que facilita experimentar con variantes de ambos componentes.
- Colaboracion distribuida en tareas: las cards se comparten en el dataset `MacroSwan/pilot-tasks` con resultados puntuados por hash de card y tuning, de modo que las mejoras de una persona son un diff de texto que otra puede reutilizar.
- Adaptacion a distintos cuerpos roboticos: la card es body-free y el acoplamiento al cuerpo concreto se realiza mediante `rig.yaml` (robot, pinza, montajes, camaras, lugares), lo que permite reutilizar la misma tarea en un brazo o en el robot de cables.
- Validacion de configuracion de hardware: `cablepilot doctor --rig rig.yaml` mide la maquina frente a la configuracion y escribe `doctor.json` con hilos y tiempo de planificacion, util para decidir si un equipo es suficiente antes de desplegar.

## Benchmarks y rendimiento

Los datos publicados en la model card son medidas operativas, no benchmarks estandar de IA:

| Metrica | Resultado | Condiciones |
|---|---|---|
| Parametros del modelo | 28.401 | — |
| Tamano de pesos | 124 KB | — |
| Entrenamiento | 11 min | CPU de portatil, 12.000 habitaciones simuladas |
| Planificacion | 128 futuros x 2 s en ~25 ms | CPU de portatil |
| Frecuencia de planificacion | 5 planes/s | deja ~85 % del presupuesto libre |
| Tarea `clean_the_room` (sim) | 29/36 juguetes en 3 episodios | dormitorio real importado de Stringman |
| Contactos con muebles | 0 | misma tarea |
| Tiempo por juguete | 62 s | misma tarea |
| Vision cenital | ~9 ms por mirada | mascara de pixeles del robot |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni resultados en robot real.

## Requisitos de hardware

- Inferencia en CPU: el modelo esta disenado para ejecutarse en CPU de portatil; la model card indica explicitamente "No GPU".
- Memoria: los pesos ocupan 124 KB, por lo que la VRAM o RAM necesaria para el modelo es marginal; el grueso del consumo proviene del simulador MuJoCo y del procesamiento de vision.
- GPU: no se requiere ni se documenta ninguna GPU recomendada (A100, H100, RTX 4090 u otras). No disponible.
- Despliegue: instalacion mediante `pip install -e ".[sim]"` (numpy, torch, pyyaml y mujoco para el simulador); comandos `cablepilot doctor`, `cablepilot fetch`, `cablepilot check` y `cablepilot run`.
- Latencia: aproximadamente 25 ms por plan de 128 futuros de 2 s; 5 planes por segundo en CPU de portatil.
- Throughput: no disponible mas alla de la frecuencia de planificacion indicada.
- Hardware real: el adaptador para Stringman esta escrito pero no probado en hardware segun la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Entrenamiento | Hardware | Licencia | Estado |
|---|---|---|---|---|---|---|
| cablepilot (MacroSwan) | 28.401 | World model + MPPI sobre task cards | Simulacion sin tarea, 11 min en CPU | CPU de portatil | Apache 2.0 | Simulacion; hardware no probado |
| Politicas de Stringman citadas en la model card | 52 M a 4,1 B (56 modelos) | Politicas entrenadas sobre teleoperacion | 97 horas de teleoperacion | H100 / H200 alquiladas | no disponible | La mayoria no decide lo bastante rapido en portatil segun la model card |

No se dispone de datos de benchmarks comparativos entre cablepilot y las politicas de Stringman en la informacion proporcionada; la comparacion se limita a enfoque, tamano y requisitos de hardware descritos por el autor.

## Limitaciones y advertencias

- El modelo no se ha ejecutado en robot real: el adaptador de Stringman esta escrito pero no probado en hardware.
- Los resultados de `clean_the_room` (29/36 juguetes, 0 contactos, 62 s por juguete) corresponden a simulacion sobre un dormitorio importado de una grabacion, no a un entorno fisico.
- El modelo esta especializado en un tipo de robot (cable-driven parallel robot) y en la pinza para la que se entreno el world model (`stringman_g1.pt`); otros cuerpos requieren adaptacion.
- La vision es deliberadamente ligera y depende de las camaras existentes del robot y de la calibracion de 4 puntos de montaje; una calibracion incorrecta afecta directamente al modelo.
- No hay informacion sobre sesgos, alucinacion en el sentido linguistico ni cobertura multilingue, al no ser un modelo de lenguaje.
- La licencia Apache 2.0 permite uso comercial, pero el estado de validacion (solo simulacion) desaconseja su despliegue en produccion sin pruebas adicionales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion externa publica.
- El tamano del repositorio figura como 0,0 GB, coherente con pesos de 124 KB, pero conviene verificar la integridad de los ficheros al clonar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MacroSwan/cablepilot
- Dataset de tareas: https://huggingface.co/datasets/MacroSwan/pilot-tasks
- Dataset de movimiento: https://huggingface.co/datasets/MacroSwan/cablepilot-motion
- Repositorio clonable: https://huggingface.co/MacroSwan/cablepilot (git clone)
- Guia para agentes: `AGENTS.md` dentro del repositorio
- No se han encontrado otros enlaces (papers, blogs, demos) en la informacion disponible.
