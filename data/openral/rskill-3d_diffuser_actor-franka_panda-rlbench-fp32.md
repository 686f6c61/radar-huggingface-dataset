# OpenRAL/rskill-3d_diffuser_actor-franka_panda-rlbench-fp32

## Resumen

El modelo `rskill-3d_diffuser_actor-franka_panda-rlbench-fp32` es un paquete de habilidad (rSkill) publicado por OpenRAL que empaqueta el checkpoint oficial de 3D Diffuser Actor (Ke et al., 2024) para el benchmark RLBench, en su configuracion PerAct de 18 tareas, sobre el robot Franka Panda. No es un modelo de lenguaje: es una politica de manipulacion vision-lenguaje-accion (VLA) que predice poses de efector final a partir de cuatro vistas RGB-D y una instruccion en lenguaje natural.

El modelo original lo desarrollan los autores del paper *3D Diffuser Actor: Policy Diffusion with 3D Scene Representations* (arXiv:2402.10885). OpenRAL no reentrena: carga el checkpoint `diffuser_actor_peract.pth` (168 MB, ~55 M de parametros) de forma literal y lo integra en su runtime, ejecutando la politica y el simulador CoppeliaSim/PyRep en un sidecar Python 3.10 fuera de proceso comunicado por ZMQ y msgpack.

Su relevancia practica es que ofrece una referencia reproducible y verificada en vivo del benchmark PerAct de RLBench con licencia MIT (codigo y pesos), algo poco habitual en el ecosistema de politicas roboticas, donde abundan checkpoints sin protocolo de evaluacion ni contrato de observacion-accion documentado. El paquete incluye tres tareas de arranque validadas (`open_drawer`, `meat_off_grill`, `close_jar`) y un resultado de evaluacion con 25 episodios por tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion de posicion relativa sobre campo de tokens 3D (nubes de puntos) + cabeza de difusion DDPM (100 pasos de denoising) sobre keyposes de efector final |
| Parametros totales | ~55 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; condicionamiento por instruccion y observacion multi-vista) |
| Tipos de cuantizacion | no disponible; el paquete se distribuye en fp32 |
| Idiomas soportados | en |
| Licencia | MIT (codigo y checkpoints) |
| Formato de pesos | `.pth` (PyTorch); checkpoint `diffuser_actor_peract.pth` de 168 MB |
| Runtime | PyTorch (sidecar Python 3.10 con ZMQ + msgpack) |
| VRAM minima declarada | 2,0 GB (pico real de inferencia ~0,43 GB) |
| Latencia por chunk | 3000 ms de presupuesto; ~946 ms de latencia media por paso medida |
| Dimension de accion | 8 (`[x y z qx qy qz qw gripper_open]`, marco mundial) |
| Entrada visual | 4 camaras RGB 256x256 (`left_shoulder`, `right_shoulder`, `wrist`, `front`) + nubes de puntos por camara (float32) + `gripper_pose` de 7 dimensiones |
| Embodiment | `franka_panda` |
| Escena | RLBench / CoppeliaSim (tabletop) |

## Arquitectura y entrenamiento

3D Diffuser Actor eleva las cuatro corrientes RGB-D de RLBench a un campo de tokens de escena en forma de nube de puntos 3D, atiende sobre el con un transformer de posicion relativa y ejecuta una cabeza de difusion DDPM con 100 pasos de denoising para generar una trayectoria de keyposes del efector final. Cada keypose predicha se ejecuta en RLBench mediante el planificador de movimiento por muestreo `EndEffectorPoseViaPlanning`; despues, la politica vuelve a observar y predice el siguiente keypose. La fusion multi-vista en una representacion 3D explicita, en lugar de trabajar solo con imagenes 2D, es la innovacion central del trabajo.

El entrenamiento lo realizaron los autores originales sobre las demostraciones del conjunto PerAct de 18 tareas de RLBench, con supervision de keyposes y RGB-D multi-vista. OpenRAL carga ese checkpoint sin reentrenar ni ajustar. La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO (no aplicables en el sentido habitual a una politica de difusion). El paquete si documenta el contrato completo de observacion a accion y el aislamiento del simulador propietario CoppeliaSim en un sidecar externo, que nunca se vendoriza.

## Capacidades

- Prediccion de poses de efector final (posicion, orientacion en cuaternion y estado de pinza) condicionada por instruccion en lenguaje natural.
- Politica generalista de keyframes multi-tarea: cubre acciones de abrir, cerrar, coger y colocar sobre los objetos del conjunto PerAct.
- Fusion de cuatro vistas RGB-D en una representacion de escena 3D mediante transformer de posicion relativa.
- Generacion de trayectorias por difusion (DDPM, 100 pasos) en lugar de regresion directa de accion.
- Ejecucion cerrada con replanificacion: observa, predice keypose, ejecuta y vuelve a observar.
- Tareas de arranque verificadas en vivo: `open_drawer`, `meat_off_grill`, `close_jar`.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso en el sentido de LLM: no disponible; el bucle multi-paso es de control robotico.
- Capacidades multilingues: solo ingles en las instrucciones.
- Capacidades especiales: ninguna adicional (sin vision generativa, audio ni modo thinking).

## Casos de uso

- Evaluacion reproducible de politicas de manipulacion: usar el paquete como linea base del protocolo PerAct de RLBench para comparar nuevas politicas con las mismas 18 tareas, semillas y presupuesto de keyposes, gracias al resultado ya publicado (25 episodios por tarea, semillas 0-24).
- Investigacion en representaciones 3D para VLA: servir de punto de partida para estudiar el efecto de sustituir la fusion multi-vista por otras codificaciones de escena, ya que el checkpoint y el codigo son MIT y el contrato de entrada esta documentado.
- Docencia y demostraciones de robotica: el pico de VRAM de ~0,43 GB permite ejecutar la politica en un portatil con GPU de 8 GB, lo que facilita practicas sobre difusion aplicada a control.
- Pruebas de integracion de pipelines de simulacion: el aislamiento del simulador en un sidecar permite validar arquitecturas de comunicacion ZMQ/msgpack entre politica y simulador sin acoplar dependencias propietarias.
- Tareas concretas de manipulacion tabletop validadas: `open_drawer` (0,88), `meat_off_grill` (0,96) y `close_jar` (0,76) sirven como referencia para tareas de apertura, recogida sobre parrilla y cierre de recipientes.
- Analisis de robustez frente a no determinismo: util para medir como afecta el planificador por muestreo `EndEffectorPoseViaPlanning` a la tasa de exito, dado que 3 de 75 episodios fallaron por fallo de trayectoria del planificador.
- Base para transferencia a robot real: aunque el paquete esta validado solo en simulacion, el contrato de accion en marco mundial de 8 dimensiones facilita adaptar la salida a un Franka Panda fisico.

## Benchmarks y rendimiento

Resultados del protocolo oficial completo, reproducidos localmente sobre host Ada de 8 GB (2026-06-20), 25 episodios por tarea con semillas 0-24 y maximo de 25 macro-keyposes:

| Tarea | Tasa de exito |
|---|---|
| `open_drawer` | 22/25 = 0,88 |
| `meat_off_grill` | 24/25 = 0,96 |
| `close_jar` | 19/25 = 0,76 |
| **Media** | **0,867** |

La latencia media por paso medida es de ~946 ms, coherente con el presupuesto declarado de 3000 ms por chunk. La media obtenida esta en linea con el ~0,81 de media en RLBench PerAct reportada en el paper original. No se han publicado en la informacion disponible resultados de MMLU, HumanEval o GSM8K, que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM de inferencia: pico de ~0,43 GB en fp32; el manifiesto declara un minimo de 2,0 GB.
- GPU validadas: host Ada de 8 GB (por ejemplo, RTX 4060 Ti o RTX 3070 Ti); cualquier GPU con 8 GB o mas es suficiente.
- Cabe en GPU de consumo: si, en cualquier tarjeta con 8 GB o mas; tambien en GPUs mas modestas por el pico real inferior a 0,5 GB.
- Despliegue: runtime PyTorch propio de OpenRAL con sidecar Python 3.10 (ZMQ + msgpack) y CoppeliaSim 4.1.0 + PyRep + RLBench@peract provisionados externamente. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este modelo.
- Latencia: ~946 ms de media por paso medidos; presupuesto de 3000 ms por chunk.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento RLBench PerAct | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 3D Diffuser Actor (este paquete) | ~55 M | 4 vistas RGB-D 256x256 + instruccion | 0,867 de media en 3 tareas (protocolo local) | MIT | Pesos `.pth` en Hugging Face, codigo en GitHub |
| 3D Diffuser Actor (paper original) | ~55 M | 4 vistas RGB-D + instruccion | ~0,81 de media en PerAct | MIT | Codigo y pesos publicados por los autores |
| PerAct | no disponible en la informacion | Voxels multi-vista + instruccion | no disponible en la informacion | no disponible en la informacion | Referencia citada como base del conjunto de tareas |
| Otras politicas VLA de gran tamano (RT-2, OpenVLA y similares) | no disponible en la informacion | RGB + instruccion | no disponible en la informacion | no disponible en la informacion | No comparable directamente por escala y conjunto de evaluacion |

La comparacion se limita a lo documentado: el paquete es esencialmente el mismo modelo que el checkpoint original, con el valor anadido del contrato de observacion-accion, el aislamiento del simulador y una evaluacion reproducible.

## Limitaciones y advertencias

- Ambito restringido: solo validado en simulacion RLBench/CoppeliaSim sobre Franka Panda; no hay validacion en robot real en la informacion disponible.
- Cobertura de tareas limitada en la evaluacion publicada: solo tres tareas de arranque verificadas, no las 18 del conjunto PerAct completo.
- No determinismo del planificador: `EndEffectorPoseViaPlanning` es estocastico, por lo que las tasas por tarea varian entre ejecuciones; 3 de 75 episodios se contaron como fallo por fallo de trayectoria del planificador.
- Dependencia externa propietaria: CoppeliaSim es software propietario (licencia EDU gratuita) y no se vendoriza; su provisionamiento es responsabilidad del usuario.
- Idioma: instrucciones solo en ingles.
- Sesgos: no disponible en la informacion; cabe esperar sesgo hacia los objetos, escenas y distribucion de demostraciones de RLBench PerAct.
- Alucinacion: el concepto no aplica directamente; el riesgo equivalente es la prediccion de keyposes no ejecutables, mitigado por el planificador y la replanificacion.
- Licencia MIT permisiva para uso comercial, pero el uso comercial en robotica real requiere validacion propia fuera del simulador.
- No es un modelo de lenguaje: no debe evaluarse con benchmarks de texto ni usarse para generacion de codigo o conversacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenRAL/rskill-3d_diffuser_actor-franka_panda-rlbench-fp32
- rSkill relacionado en Hugging Face: https://huggingface.co/OpenRAL/rskill-3d_diffuser_actor-rlbench
- Repositorio del rSkill en GitHub: https://github.com/OpenRAL/openral/tree/master/rskills/3d-diffuser-actor-rlbench/
- Paper (arXiv:2402.10885): https://arxiv.org/abs/2402.10885
- Codigo original de los autores: https://github.com/nickgkan/3d_diffuser_actor
- Pesos originales: https://huggingface.co/katefgroup/3d_diffuser_actor
