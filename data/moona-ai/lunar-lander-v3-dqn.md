# moona-ai/lunar-lander-v3-dqn

## Resumen

El modelo `moona-ai/lunar-lander-v3-dqn` es un agente de aprendizaje por refuerzo profundo (deep reinforcement learning) entrenado para resolver el entorno `LunarLander-v3` de Gymnasium. Desarrollado por el usuario moona-ai, implementa una variante del algoritmo DQN conocida como Dueling Double DQN, que combina la arquitectura dueling (separación de las estimaciones de valor de estado y ventaja de acción) con el método Double DQN para reducir el sesgo de sobreestimación. El agente recibe un estado de 8 dimensiones (posición, velocidad, ángulo, velocidad angular y contactos de las patas) y produce una acción entre 4 posibles (no hacer nada, motor izquierdo, motor principal, motor derecho).

Este modelo es relevante como ejemplo didáctico y de referencia para quienes trabajan con RL en entornos de control continuo discretizado. Su tamaño es extremadamente reducido (una red neuronal de apenas decenas de miles de parámetros), lo que permite ejecutarlo en cualquier hardware, incluso en CPU. El repositorio incluye los pesos entrenados (`best_model.pth` y `latest_model.pth`), el código del agente y un script de evaluación listo para usar. No se especifica licencia ni se aportan métricas de rendimiento cuantitativas en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dueling Double DQN (red neuronal feedforward con dos ramas: valor y ventaja) |
| Parametros totales | no disponible (estimacion a partir de la arquitectura: ~34.500) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (entorno de RL con estado de 8 dimensiones) |
| Tipos de cuantizacion | no aplica (pesos en punto flotante de PyTorch) |
| Idiomas soportados | no aplica (agente de RL, no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | PyTorch `.pth` (checkpoints) y codigo fuente Python |

## Arquitectura y entrenamiento

La arquitectura es una red neuronal densa que implementa el esquema Dueling DQN. El extractor de características consta de dos capas lineales de 128 unidades con activación ReLU, que transforman el vector de estado de 8 dimensiones. A partir de ahí, la red se divide en dos ramas: una rama de valor `V(s)` con una capa oculta de 64 unidades y una salida escalar, y una rama de ventaja `A(s,a)` con otra capa oculta de 64 unidades y una salida de 4 valores (una por acción). La agregación final se realiza mediante la fórmula `Q(s,a) = V(s) + (A(s,a) - media(A))`, que es la característica distintiva de la arquitectura dueling.

El entrenamiento utiliza Double DQN con actualizaciones suaves del objetivo (soft target updates) y función de pérdida Huber. No se especifican el número de episodios, el tamaño del buffer de experiencia ni otros hiperparámetros. El entorno es `LunarLander-v3` de Gymnasium, un problema clásico de control donde el agente debe aterrizar una nave en una plataforma designada, recibiendo recompensas positivas por aterrizajes correctos y negativas por consumo de combustible o choques. El modelo se distribuye con dos checkpoints: `best_model.pth` (el de mayor recompensa media durante la evaluación) y `latest_model.pth` (el último de entrenamiento).

## Capacidades

- Control de un agente en el entorno LunarLander-v3: el modelo decide entre 4 acciones discretas (no hacer nada, disparar motor izquierdo, disparar motor principal, disparar motor derecho) basándose en un estado continuo de 8 variables.
- Aprendizaje por refuerzo off-policy: el agente fue entrenado con Double DQN, lo que le permite aprender de experiencias pasadas almacenadas en un buffer de repetición.
- Inferencia en tiempo real: al ser una red pequeña, la latencia de decisión es mínima, apta para entornos que requieren respuestas en el orden de milisegundos.
- Reproducibilidad: el repositorio incluye el código del agente (`dqn_agent.py`) y un script de evaluación (`evaluate_hf.py`) que permite reproducir los resultados y visualizar el comportamiento del agente.
- Integración con Gymnasium: el modelo se carga como un agente estándar que interactúa con el entorno mediante la API de Gymnasium, facilitando su uso en pipelines de RL existentes.

## Casos de uso

- Investigación académica en RL: el modelo sirve como punto de partida para estudiar variantes de DQN (dueling, double, priorizado) y comparar su rendimiento en un entorno de referencia. Los investigadores pueden cargar los pesos y evaluar el comportamiento del agente en diferentes condiciones.
- Enseñanza de aprendizaje por refuerzo: en cursos universitarios o bootcamps, este modelo permite a los estudiantes ver un agente entrenado en acción sin necesidad de ejecutar un entrenamiento largo. El script `evaluate_hf.py` facilita la demostración en clase.
- Benchmark de algoritmos: al ser un entorno estándar, el modelo puede utilizarse como baseline para comparar nuevos algoritmos de RL. Su pequeño tamaño permite ejecutar múltiples evaluaciones rápidamente.
- Desarrollo de entornos de simulación: el agente puede integrarse en simulaciones de aterrizaje lunar para probar políticas de control, aunque su alcance se limita al entorno específico de LunarLander.
- Pruebas de integración de librerías: dado que usa PyTorch y Gymnasium, sirve para verificar que una instalación de estas librerías funciona correctamente, ejecutando una inferencia de ejemplo.
- Demostraciones de portafolio: desarrolladores de RL pueden mostrar este modelo como ejemplo de un proyecto completo (entrenamiento, guardado de pesos, evaluación) en su portafolio profesional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye valores de recompensa media, tasa de éxito ni comparaciones con otros agentes. El único dato cualitativo es que el modelo fue entrenado para "resolver" el entorno, pero sin métricas numéricas que lo respalden.

## Requisitos de hardware

- VRAM estimada: menos de 100 MB (la red tiene ~34.500 parámetros, lo que ocupa menos de 1 MB en float32; la memoria adicional se debe al entorno y a PyTorch).
- GPU recomendada: cualquiera, incluso integradas. El modelo puede ejecutarse en CPU sin problemas.
- Compatibilidad con GPU de consumo: sí, cualquier GPU con al menos 1 GB de VRAM es más que suficiente.
- Opciones de despliegue: el modelo se ejecuta directamente con PyTorch y Gymnasium. No requiere servidores de inferencia como vLLM u Ollama. Puede integrarse en scripts de Python o en notebooks.
- Latencia y throughput: al ser una red de 3 capas, la inferencia es del orden de microsegundos en CPU y aún menor en GPU. No se dispone de mediciones oficiales.

## Comparativa con modelos similares

Existen otros repositorios en Hugging Face con agentes DQN para LunarLander-v3, como `allen73/lunarlander-v3-dqn-physical-ai` o `huggsook/lunar-lander-v3-dqn`, pero no se dispone de información detallada sobre sus arquitecturas o rendimiento. En GitHub también hay proyectos similares (por ejemplo, `wtcherr/lunar-lander-dqn`). Dado que no hay datos públicos comparables, no es posible realizar una comparativa cuantitativa. Se puede afirmar que todos ellos resuelven el mismo entorno con variantes de DQN, pero sin métricas no se puede establecer una jerarquía.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para el entorno LunarLander-v3; no es transferible a otras tareas sin reentrenamiento.
- No se especifica la licencia, por lo que su uso comercial es incierto. Se recomienda contactar con el autor antes de utilizarlo en proyectos con fines lucrativos.
- No se proporcionan métricas de rendimiento (recompensa media, desviación, tasa de éxito), lo que impide evaluar su calidad objetiva.
- El modelo puede presentar comportamientos subóptimos en situaciones no vistas durante el entrenamiento, como condiciones iniciales extremas o perturbaciones en la dinámica.
- Al ser un agente de RL, no tiene capacidades de lenguaje, visión ni razonamiento simbólico; su única función es mapear estados a acciones.
- Los archivos de pesos están en formato `.pth` de PyTorch, por lo que se requiere tener instalada esta librería para cargarlos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/moona-ai/lunar-lander-v3-dqn
- Entorno LunarLander-v3 (Gymnasium): https://gymnasium.farama.org/environments/box2d/lunar_lander/
- Repositorio similar de otro autor: https://huggingface.co/allen73/lunarlander-v3-dqn-physical-ai
- Repositorio similar en GitHub: https://github.com/wtcherr/lunar-lander-dqn
