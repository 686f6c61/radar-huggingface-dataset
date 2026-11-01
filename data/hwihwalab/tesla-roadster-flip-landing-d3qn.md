# hwihwalab/tesla-roadster-flip-landing-d3qn

## Resumen

`hwihwalab/tesla-roadster-flip-landing-d3qn` es un agente de aprendizaje por refuerzo profundo desarrollado por Hwihwa Lab, no un modelo de lenguaje. Implementa un Dueling Double Deep Q-Network (D3QN) entrenado en PyTorch para resolver una tarea de control de actitud y aterrizaje autónomo: recuperar un vehiculo tipo Tesla Roadster que cae invertido 180 grados desde 12 metros de altura y posarlo suavemente sobre la cubierta de un drone-ship, usando unicamente propulsores de gas frio (RCS) y un propulsor principal.

El modelo opera sobre un espacio de observacion de 8 dimensiones y un espacio de acciones discreto de 4 acciones, con una red de dos flujos (valor y ventaja) que combina las innovaciones de Double DQN y Dueling DQN. Es relevante como demostracion reproducible de control de actitud en simulacion fisica con recompensas densas por etapas, un dominio historicamente tratado con control optimo clasico y MPC en lugar de RL.

La ficha cubre un agente de politica (policy) de refuerzo, por lo que las secciones de arquitectura, capacidades y hardware se adaptan al paradigma de RL en lugar de al de modelos generativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dueling Double DQN (D3QN): MLP con flujos separados de valor V(s) y ventaja A(s,a) |
| Parametros totales | no disponible (red pequena: Linear 8->128, 128->128, dos cabezas 128->64->salida) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (observacion de 8 dimensiones por paso, sin historial) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ko (documentacion de la model card) |
| Licencia | MIT |
| Formato de pesos | no disponible (repositorio de 0.0 GB; libreria PyTorch) |

## Arquitectura y entrenamiento

La red es un perceptron multicapa con normalizacion de capas: una columna vertebral `Linear(8->128) + LayerNorm` seguida de `Linear(128->128) + LayerNorm`, que se bifurca en un flujo de valor `Linear(128->64) -> 1` y un flujo de ventaja `Linear(128->64) -> 4`. La agregacion combina ambos flujos segun la formulacion estandar de Dueling DQN, y la seleccion de accion usa el mecanismo Double DQN para desacoplar la seleccion de la evaluacion del objetivo. El espacio de acciones es discreto con 4 acciones (pulsos de RCS y propulsor principal).

El entrenamiento se realizo en un simulador propio de aerodinamica del Roadster implementado como entorno Gymnasium (v1.0), con modelo de 6 grados de libertad y propulsores RCS de gas frio. La model card describe una recompensa por etapas que premia la inversion de actitud, el bloqueo de actitud a 0 grados, la alineacion horizontal y un bonus de "aterrizaje mantequilla" por contacto suave y centrado. No se especifican en la informacion disponible el numero de pasos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas adicionales como prioritized replay o n-step returns.

## Capacidades

- Control de actitud en 3 ejes para recuperar una orientacion invertida de 180 grados mediante pulsos de RCS.
- Aterrizaje autonomo de precision sobre una plataforma movil (drone-ship) con velocidad terminal controlada.
- Politica de tiempo optimo: la model card reporta descenso balistico sin exploitation de hovering.
- Operacion sobre observaciones de baja dimension (8 valores de estado), adecuada para inferencia en el borde.
- Salida de telemetria en tiempo real via WebSocket a 50 Hz segun la model card (integracion con el cockpit 3D de Hugging Face Spaces).
- No soporta tool calling, function calling, agentes multi-paso, vision, audio ni generacion de texto: es exclusivamente una politica de control.

## Casos de uso

- Simulacion de recuperacion de actitud en misiones espaciales: el agente se integra en un entorno Gymnasium de 6-DoF para evaluar estrategias de RCS ante caidas invertidas, sirviendo como baseline frente a controladores MPC.
- Prototipado de aterrizaje en drone-ship estilo Falcon 9: permite iterar sobre recompensas y perfiles de descenso antes de trasladar la politica a un simulador de mayor fidelidad.
- Benchmark de algoritmos DQN: al ser una tarea acotada con metrica de exito binaria y recompensa media, resulta util para comparar variantes (DQN, Double DQN, Dueling, D3QN) bajo el mismo entorno.
- Docencia de aprendizaje por refuerzo profundo: la red pequena y el espacio de acciones de 4 elementos permiten entrenar y depurar en hardware modesto, con telemetria visual en el cockpit 3D.
- Inferencia en el borde (edge AI): con una observacion de 8 dimensiones y una MLP de pocas capas, la politica puede ejecutarse en microcontroladores o GPUs integradas para control en tiempo real.
- Generacion de datos sinteticos de telemetria: ejecutar la politica en bucle para producir trayectorias etiquetadas de actitud y velocidad que alimenten modelos de control supervisado.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Metrica | Valor | Significado fisico |
|---|---|---|
| Tasa de exito de aterrizaje tras inversion de 180 grados | 100.0 % (50/50) | Aterrizaje perfecto desde caida completamente invertida |
| Recompensa media de evaluacion (pico) | +340.26 puntos | Precision en el centro de la plataforma y bonus de tres etapas |
| Velocidad terminal de contacto | -0.81 m/s | Dentro del limite de 1.4 m/s |
| Alineacion de actitud | -5.2 grados (optima) | Alineacion horizontal de las ruedas con la plataforma |
| Tiempo hasta el aterrizaje | 9.6 s (~290 pasos) | Descenso balistico de tiempo optimo sin hovering |

No se han publicado resultados de benchmarks comparativos con otros agentes en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; la red tiene del orden de decenas de miles de parametros y una entrada de 8 valores.
- GPU recomendadas: no requiere GPU dedicada; cualquier GPU consumer (RTX 3060, RTX 4090) o incluso CPU es suficiente para inferencia en tiempo real.
- Cabe en GPU consumer: si, y tambien en hardware embebido (Raspberry Pi, Jetson Nano) dado el tamano de la red.
- Opciones de despliegue: PyTorch nativo, exportacion a TorchScript u ONNX para entornos embebidos; integracion con Gymnasium para evaluacion; el cockpit 3D se sirve como Hugging Face Space.
- Latencia y throughput: no disponibles de forma oficial; la model card menciona telemetria WebSocket a 50 Hz, lo que sugiere inferencia compatible con ese ritmo.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / observacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tesla-roadster-flip-landing-d3qn | D3QN (RL) | no disponible (MLP pequena) | 8 dimensiones | MIT | Hugging Face |
| DQN clasico (Mnih et al., 2015) | DQN (RL) | no aplica | Atari (imagenes 84x84) | referencia academica | Paper y reimplementaciones |
| Double DQN (van Hasselt et al., 2016) | Double DQN (RL) | no aplica | Atari (imagenes 84x84) | referencia academica | Paper y reimplementaciones |
| Dueling DQN (Wang et al., 2016) | Dueling DQN (RL) | no aplica | Atari (imagenes 84x84) | referencia academica | Paper y reimplementaciones |

La comparacion directa con agentes de control aeroespacial (MPC, LQR) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Los resultados de la model card (100 % de exito, +340.26 de recompensa) son declarados por el autor y no estan verificados de forma independiente.
- El agente esta entrenado en un simulador propio de aerodinamica; la transferencia a fisica real o a simuladores de mayor fidelidad no esta demostrada.
- La politica opera sobre un estado de 8 dimensiones predefinido; no procesa vision ni sensores crudos, por lo que depende de un estimador de estado externo.
- No hay informacion sobre sesgos, robustez ante ruido de sensores o perturbaciones (viento, incertidumbre de masa).
- El espacio de acciones es discreto de 4 elementos; no cubre control continuo de empuje.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantias ni soporte.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validacion por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hwihwalab/tesla-roadster-flip-landing-d3qn
- Model card en coreano: https://huggingface.co/hwihwalab/tesla-roadster-flip-landing-d3qn/blob/main/README_KR.md
- Demo cockpit 3D (Hugging Face Spaces): https://huggingface.co/spaces/hwihwalab/tesla-roadster-flip-landing-d3qn
- Repositorio GitHub de Hwihwa Lab: https://github.com/Hwihwa-Lab
- Gymnasium: https://gymnasium.farama.org/
- PyTorch: https://pytorch.org
