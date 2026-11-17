# lerobot/asimov-mujoco

## Resumen

`lerobot/asimov-mujoco` no es un modelo de lenguaje ni de aprendizaje automatico en el sentido habitual: es un paquete de simulacion en MuJoCo del robot humanoide Asimov 1 de Menlo Research, adaptado para funcionar con el stack LeRobot. Reutiliza la misma estructura que `lerobot/unitree-g1-mujoco` (bucle de simulacion, banda elastica de sujecion, visor, publicador de camaras por ZMQ y punto de entrada `make_env()`) sustituyendo el robot Unitree G1 por el Asimov 1.

Su aportacion tecnica principal es la emulacion de **Asimov Edge**, el servicio embarcado del robot real con el que habla el SDK de Menlo. De este modo, el driver `Asimov` de LeRobot se conecta al simulador exactamente igual que al robot fisico (`host=127.0.0.1`), lo que permite desarrollar y validar politicas de locomocion y control de cuerpo completo sin disponer del hardware.

Es relevante para investigadores en robotica humanoide que quieran entrenar o evaluar controladores con LeRobot en un entorno reproducible, con fisica a 200 Hz (el timestep de entrenamiento de la politica) y tres camaras simuladas. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamano de 0.0 GB (el modelo del robot se descarga en tiempo de ejecucion desde un dataset aparte).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Simulacion fisica MuJoCo de un robot humanoide de 25 grados de libertad (no es una red neuronal) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | Codigo de simulacion adaptado de `lerobot/unitree-g1-mujoco`; modelo del robot bajo CERN-OHL-S-2.0 (Menlo Research); licencia del repositorio no indicada explicitamente |
| Formato de pesos | no aplica; modelo del robot en MJCF y mallas, descargado desde `lerobot/robot-urdfs` |

## Arquitectura y entrenamiento

El repositorio implementa un bucle de simulacion MuJoCo con fisica a 200 Hz, el mismo timestep con el que se entrena la politica de locomocion. El modelo del robot no se incluye en el paquete: al arrancar, `sim/robot_model.py` lo descarga desde el dataset `lerobot/robot-urdfs` (subcarpeta `asimov`), en la revision fijada en `config.yaml`. Sobre ese MJCF se elimina el mundo independiente, se anade un motor de par por articulacion (limitado al `actuatorfrcrange` de cada una) y las tres camaras, y se carga en `assets/scene_25dof.xml`, que aporta suelo, cielo, luces y vista global. El control PD de las articulaciones se ejecuta en el simulador con las ganancias que transporta cada trayectoria.

La pieza diferencial es el puente de protocolo `sim/asimov_edge_bridge.py`, que emula Asimov Edge: acepta comandos `asimov.io.RobotCommand` por UDP en `127.0.0.1:8850`, publica estado `asimov.io.RobotState` por UDP en `127.0.0.1:8851` en cada paso de fisica, y expone `GET http://127.0.0.1:3000/api/version` devolviendo `{"robot_model": "asimov_1", "robot_os_version": "0.2.0"}`. Los vectores de articulaciones usan las 25 posiciones del firmware; las trayectorias llevan los tobillos como pitch/roll y el estado los reporta como motores A/B con el mismo acoplamiento que el firmware. La IMU (giroscopio, gravedad proyectada, cuaternion) corresponde al site de la pelvis. El codigo de simulacion base (`sim/base_sim.py`, banda, visor, publicador de imagenes, `env.py`, `run_sim.py`) es compartido con la simulacion del G1.

## Capacidades

- Simulacion fisica de un humanoide de 25 DoF con fisica a 200 Hz y control PD por articulacion.
- Emulacion del protocolo Asimov Edge: comandos por UDP, estado a 200 Hz y endpoint HTTP de version.
- Modos de operacion compatibles con el robot real: STAND al arrancar (mantiene la postura), MOVE al recibir una trayectoria y DAMP 2 s despues de la ultima trayectoria.
- Banda elastica de sujecion con control por teclado en el visor: tecla 9 la suelta, 7 y 8 la bajan y suben.
- Tres camaras simuladas publicadas por ZMQ en `tcp://127.0.0.1:5555`, 640x480 a unos 30 Hz: `head_camera` (campo vertical de 90 grados), `left_wrist_cam` y `right_wrist_cam` (95 grados).
- Compatibilidad directa con el driver `Asimov` de LeRobot y con sus camaras ZMQ; `make_env(cameras=[...])` permite seleccionar un subconjunto de camaras, y `publish_images=False` o `onscreen=False` desactivan la publicacion o el visor.
- Soporte de control de cuerpo completo mediante `control_mode="whole_body"`, que ejecuta la politica en LeRobot y transmite trayectorias.
- Acepta comandos de velocidad (`x.vel`, `y.vel`, `theta.vel`) pero no mueve el robot: el simulador no incorpora politica de marcha propia.
- Pruebas incluidas: `unittest` para modelo, protocolo Edge y banda, y `tests/smoke_live.py` para verificar que el driver de LeRobot hace caminar al robot.

## Casos de uso

- Desarrollo de politicas de locomocion humanoide: el simulador reproduce el timestep de entrenamiento (200 Hz) y el protocolo del robot real, de modo que una politica validada en simulacion puede ejecutarse con el mismo driver sobre el Asimov 1 fisico.
- Integracion y pruebas del driver `Asimov` de LeRobot: permite ejecutar `run_locomotion.py` contra `127.0.0.1` sin hardware, verificando conexion, envio de acciones y recepcion de estado.
- Validacion de control de cuerpo completo: con `control_mode="whole_body"` la politica corre en LeRobot y envia trayectorias al simulador, lo que sirve para depurar el pipeline de control antes de desplegarlo.
- Pruebas de percepcion con camaras: las tres transmisiones ZMQ (cabeza y munecas) permiten entrenar o evaluar modelos de vision para manipulacion y navegacion con el mismo formato de mensaje que la simulacion del G1.
- Regresion automatizada en CI: los tests de modelo, protocolo y banda, mas el smoke test con el driver real, permiten detectar roturas en el puente Edge o en el modelo del robot en cada cambio.
- Investigacion reproducible en robotica humanoide: la fisica y el modelo son los de Menlo, con revision fijada en `config.yaml`, lo que facilita reproducir experimentos y comparar resultados entre laboratorios.
- Prototipado de interacciones con el SDK de Menlo: al emular el endpoint de version y los puertos de comando y estado, se puede desarrollar logica de cliente contra el simulador antes de tener acceso al robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo documenta parametros de simulacion: fisica a 200 Hz, camaras a 640x480 y aproximadamente 30 Hz, estado publicado en cada paso de fisica, y un retardo de unos 2 s tras la conexion hasta que la politica toma el control.

## Requisitos de hardware

- No se especifican requisitos de VRAM ni de GPU en la informacion disponible; el paquete no ejecuta inferencia de un modelo de lenguaje.
- El simulador usa MuJoCo con visor GLFW; en escritorio Wayland debe arrancarse con `MUJOCO_GL=egl` para que los renderizadores de camara no compartan el contexto GLFW del visor.
- GPU recomendada: no disponible. Al tratarse de renderizado MuJoCo y publicacion ZMQ, el cuello de botella previsible es la GPU de renderizado y la CPU, pero no hay cifras publicadas.
- Despliegue: ejecucion local con `pip install -r requirements.txt` y `python run_sim.py`; la politica se ejecuta desde un checkout de LeRobot con `python run_locomotion.py`.
- Latencia y throughput: no disponibles, salvo los 200 Hz de fisica y los aproximadamente 30 Hz de las camaras indicados en la model card.

## Comparativa con modelos similares

| Simulacion | Robot | Protocolo emulado | Camaras | Fisica | Licencia del modelo |
|---|---|---|---|---|---|
| `lerobot/asimov-mujoco` | Asimov 1 (Menlo), 25 DoF | Asimov Edge (UDP 8850/8851, HTTP 3000) | 3 (cabeza, munecas), ZMQ 5555 | 200 Hz | CERN-OHL-S-2.0 |
| `lerobot/unitree-g1-mujoco` | Unitree G1 | DDS de Unitree | 3, ZMQ 5555 | no disponible en la informacion | no disponible |
| Otras simulaciones humanoides | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al G1 porque es la unica alternativa mencionada en la model card; el propio autor senala que ambos repositorios comparten codigo base y que el plan es unificarlos en una sola simulacion humanoide con un perfil por robot (modelo, configuracion y puente de protocolo).

## Limitaciones y advertencias

- El simulador no incluye politica de marcha propia: los comandos de velocidad se aceptan pero no desplazan al robot; es necesario usar `control_mode="whole_body"` con una politica en LeRobot.
- El robot no esta incluido en el repositorio: se descarga en tiempo de ejecucion desde `lerobot/robot-urdfs`, por lo que se requiere conectividad y la revision fijada en `config.yaml`.
- El repositorio figura con 0.0 GB y 0 descargas; es un artefacto reciente (creado y actualizado el 2026-11-17) sin adopcion registrada, lo que implica poca validacion externa.
- La licencia del codigo de simulacion no se indica de forma explicita; solo se documenta que esta adaptado de `lerobot/unitree-g1-mujoco` y que el modelo del robot es CERN-OHL-S-2.0. Conviene verificar las condiciones antes de uso comercial.
- En Wayland es obligatorio `MUJOC0_GL=egl` (en la model card, `MUJOCO_GL=egl`) para evitar conflictos de contexto grafico; sin ello los renderizadores de camara pueden fallar.
- `tests/smoke_live.py` requiere un checkout de LeRobot con el driver `Asimov`, lo que anade una dependencia externa al proceso de validacion.
- La emulacion de Edge replica puertos y timings concretos; cambios en el firmware o en el SDK de Menlo pueden romper la compatibilidad.
- No aplica la problematica habitual de sesgos, alucinacion o cobertura idiomatica de un modelo de lenguaje, pero tampoco hay evaluacion publicada de fidelidad de la simulacion frente al robot fisico.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/lerobot/asimov-mujoco
- Proyecto Asimov 1 de Menlo Research: https://github.com/menloresearch/asimov-1
- Simulacion de referencia del Unitree G1: https://huggingface.co/lerobot/unitree-g1-mujoco
- Dataset con los URDF/MJCF de los robots: https://huggingface.co/datasets/lerobot/robot-urdfs/tree/main/asimov
