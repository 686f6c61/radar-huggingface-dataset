# appssy3/connectailab-rl-solo-build-H-RollerDuck-Skate

## Resumen

RollerDuck-Skate es una politica de aprendizaje por refuerzo entrenada para controlar un robot bípedo de 14 grados de libertad (14-DoF) equipado con patines de ruedas pasivas. El modelo, desarrollado por ConnectAI Lab dentro de su serie SoloBuild, aprende a propulsarse sobre ruedas aprovechando la fricción del suelo y el momento de inercia, en lugar de ejecutar una marcha convencional. Se entrenó con PPO en el simulador físico MuJoCo durante 43 millones de pasos, y se distribuye como pesos ONNX optimizados para inferencia en tiempo real.

El interés técnico reside en el modelado de la dinámica de contacto: las ruedas pasivas ofrecen una resistencia a la rodadura muy baja en el eje longitudinal y un agarre de canto (edge grip) en el eje lateral, lo que obliga a la politica a gestionar deslizamiento, deriva lateral y estabilidad postural de forma coordinada. La card reporta una tasa de caída del 0 % tras el entrenamiento, junto con un modo de agachado (crouching) que baja el centro de gravedad para evitar vuelcos a alta velocidad.

No se trata de un modelo de lenguaje ni de un modelo generativo multimodal: es un controlador de robótica. Por tanto, muchas de las filas habituales de una ficha de LLM (contexto, idiomas, cuantización) no aplican y se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica de control entrenada con PPO (red neuronal feed-forward; topologia exacta no disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (observacion de estado del robot, no secuencia de texto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX; no se documenta FP16/INT8) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | MIT (segun la model card); el campo de licencia del repo figura como no disponible |
| Formato de pesos | ONNX (`roller.onnx`, `roller_crouch.onnx`); repo etiquetado tambien como pytorch |

## Arquitectura y entrenamiento

La politica se entrena con Proximal Policy Optimization (PPO) sobre MuJoCo, con un bucle de control a 50 Hz (paso de 0,02 s) que permite detectar micro-deslizamientos y corregir en tiempo real los ángulos de pelvis, rodilla y tobillo. La observación es un vector de estado de 14-DoF y la acción es un vector de pares (torques) para los 14 servomotores. El entorno modela ruedas pasivas en las plantas de los pies con baja resistencia a la rodadura en dirección longitudinal y fricción de agarre lateral, lo que introduce una dinámica de contacto no trivial que la politica debe explotar para ganar velocidad sin levantar los pies.

El elemento diferenciador es la ingeniería de recompensa específica para patinaje, con cuatro términos: recompensa por velocidad de deslizamiento (crecimiento exponencial de la velocidad de avance mientras se mantiene el contacto con el suelo), penalización por caída (indicador de estado caído), penalización por velocidad lateral (para limitar la deriva) y recompensa de postura basada en el coseno del ángulo del torso. Además del checkpoint principal (`roller.onnx`), se entrena en paralelo un modo de agachado (`roller_crouch.onnx`) que reduce el centro de gravedad para mejorar el paso por curva y la estabilidad a alta velocidad. La card menciona que en la generación cero el agente caía 447 veces en 9 pasos, y que tras 43 millones de pasos de simulación se alcanzó una tasa de caída del 0 %.

## Capacidades

- Control de locomocion sobre ruedas pasivas: propulsion por deslizamiento sin fase de vuelo, explotando baja resistencia a la rodadura.
- Control de 14 grados de libertad con lazo cerrado a 50 Hz (pelvis, rodillas, tobillos y servomotores asociados).
- Gestion de friccion anisotropa: mantiene traccion longitudinal y limita la deriva lateral mediante correcciones de angulo.
- Modo de agachado (crouching) para reducir el centro de gravedad y mejorar estabilidad en alta velocidad y curvas.
- Estabilizacion postural activa basada en el angulo del torso.
- Inferencia en tiempo real via ONNX Runtime, sin dependencia de frameworks de RL en produccion.
- No dispone de tool calling, agentes multi-paso, capacidades multilingues, vision ni audio.

## Casos de uso

- Control en tiempo real de un robot bípedo con patines: cargar `roller.onnx` en ONNX Runtime y ejecutar inferencia a 50 Hz sobre el vector de observacion de 14-DoF para emitir torques a los servomotores; adecuado por la optimizacion ONNX y el bajo coste computacional de una politica feed-forward.
- Investigacion en locomotion sobre ruedas: usar el checkpoint como linea base para estudiar friccion anisotropa, deriva lateral y control de momento angular en robots con ruedas pasivas.
- Desarrollo de modos de marcha conmutables: alternar entre `roller.onnx` (velocidad) y `roller_crouch.onnx` (estabilidad y curvas) segun la tarea, integrándolo en una maquina de estados de alto nivel.
- Simulacion y evaluacion de politicas en MuJoCo: replicar el entorno de entrenamiento para comparar variantes de recompensa o de morfologia del robot antes de transferir a hardware.
- Benchmark de algoritmos de RL para robotica: usar los 43 millones de pasos y la metrica de tasa de caida como referencia reproducible en estudios comparativos de PPO y variantes.
- Prototipado educativo y demos: el modelo es ligero en formato ONNX y la licencia MIT permite incluirlo en cursos, talleres y demostraciones de robotica con patines.
- Analisis de robustez frente a cambios de friccion: modificar los parametros de contacto en el simulador para medir la degradacion de la politica y estudiar estrategias de domain randomization.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta metricas cualitativas del entrenamiento: 43 000 000 pasos de simulacion, 447 caidas en 9 pasos en la generacion cero y una tasa de caida del 0 % al final del entrenamiento. No se proporcionan valores numericos de velocidad de avance, error de seguimiento, retorno medio por episodio ni comparaciones con otras politicas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,0 GB y los pesos son ONNX de una politica de control, por lo que la huella en memoria es muy reducida (orden de megabytes, no verificable con los datos disponibles).
- GPU recomendadas: no disponible. Una politica de este tipo suele ejecutarse en CPU con ONNX Runtime a 50 Hz, pero no se documenta el hardware usado en el entrenamiento ni en la evaluacion.
- Compatibilidad con GPU de consumo: previsiblemente si, dado el tamano del repositorio, aunque no hay datos confirmados.
- Opciones de despliegue: ONNX Runtime (Python) segun el ejemplo de la card; otros runtimes ONNX no documentados. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible. Solo se conoce la frecuencia del bucle de control, 50 Hz (periodo de 0,02 s), que fija el presupuesto temporal por paso de inferencia.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otras politicas de control para robots bípedos con ruedas ni checkpoints comparables de la serie SoloBuild, por lo que no es posible establecer una comparacion con parametros, contexto, rendimiento y licencia.

## Limitaciones y advertencias

- Ambito restringido: es una politica de control para una morfologia concreta (RollerDuck, 14-DoF con patines pasivos); no es un modelo de lenguaje ni un modelo generativo.
- Dependencia del simulador: entrenada en MuJoCo con un modelo de friccion concreto; el rendimiento puede degradarse en hardware real por diferencias de contacto, latencia de actuadores y ruido de sensores. La card no documenta resultados de transferencia sim-to-real.
- Sin datos de parametros ni de arquitectura de red: no se puede auditar el tamano del modelo ni planificar recursos con precision.
- Licencia ambigua: la card declara MIT, pero el campo de licencia del repositorio figura como no disponible; conviene verificar antes de uso comercial.
- Ausencia de benchmarks numericos: las afirmaciones de rendimiento (0 % de caidas) son cualitativas y no verificables con metricas publicadas.
- Riesgo de sobreajuste a la distribucion de entrenamiento: sin datos sobre domain randomization, no se puede evaluar la robustez ante cambios de masa, friccion o pendiente.
- Contenido de la card en coreano e ingles, con emojis y formulas: la documentacion tecnica es escasa y no detalla hiperparametros de PPO, arquitectura de la red ni composicion del curriculum.

## Enlaces

- Hugging Face: https://huggingface.co/appssy3/connectailab-rl-solo-build-H-RollerDuck-Skate
- YouTube (SoloBuild Studio): https://www.youtube.com/@solobuild.studio
