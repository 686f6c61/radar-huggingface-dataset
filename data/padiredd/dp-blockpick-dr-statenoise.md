# padiredd/dp-blockpick-dr-statenoise

## Resumen

dp-blockpick-dr-statenoise es una política de difusión (diffusion policy) entrenada para control robótico de manipulación, concretamente para una tarea de recogida de bloque en vertical (top-down block pick) con el brazo izquierdo del robot humanoide ROBOTIS FFW SG2 en el simulador Isaac Lab. El modelo lo desarrolla el usuario padiredd y se publica bajo el ecosistema LeRobot, usando un fork de ROBOTIS del repositorio lerobot (commit 240b4a0). Con 287,5 millones de parámetros, es un modelo compacto orientado a inferencia en tiempo real a 15 Hz sobre observaciones multimodales (tres cámaras y estado articular).

La relevancia de esta ficha es acotada: no es un modelo de lenguaje ni un modelo fundacional generalista, sino un artefacto de investigación en robótica con un dominio de aplicación muy específico (un robot concreto, una mesa concreta, un bloque de 5x5x4 cm y una pose inicial fija). El modelo incorpora domain randomization agresiva (fondos, iluminación, colores del bloque, montajes de cámara y tiempos de demostración) y ruido gaussiano de 1 grado sobre las posiciones articulares del estado durante el entrenamiento, lo que busca mejorar la robustez frente a variaciones de simulación a realidad.

Se publica con cinco checkpoints (20k, 40k, 60k, 80k y 100k pasos), siendo el de 100k el que se carga por defecto desde la raíz del repositorio. No hay resultados de evaluación en simulación publicados en la información disponible, y el modelo cuenta con 2 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion policy (DDPM) sobre LeRobot, fork ROBOTIS lerobot-cyclo @240b4a0 |
| Parámetros totales | 287.533.680 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; n_obs_steps = 1, horizonte de predicción 64, 32 ejecutados) |
| Tipos de cuantización | no disponible (pesos en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | other |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una diffusion policy, es decir, un modelo generativo que aprende a producir secuencias de acciones mediante un proceso de difusión DDPM con 100 pasos de ruido. La política condiciona la generación de acciones sobre observaciones compuestas por tres cámaras (cabeza y ambas muñecas), cada una reescalada a 240x240 píxeles, más un vector de estado articular de 22 dimensiones. La salida es un vector de 16 objetivos articulares a 15 Hz. El horizonte de predicción es de 64 pasos, de los cuales se ejecutan 32, y se usa un único paso de observación (n_obs_steps = 1).

El entrenamiento se realizó sobre el conjunto `pick-cube-topdown-25cm-dr-500-3cam`, con 500 demostraciones y 84.111 fotogramas, con domain randomization por episodio de fondo, mesa, luces, montajes de cámara y color del bloque, además de variación en los tiempos de las demostraciones. La posición del bloque se muestrea uniformemente en x entre 0,23 y 0,48 m e y entre 0,065 y 0,315 m, aunque la mesa tiene el borde en x = 0,27, por lo que las demostraciones efectivas abarcan x de 0,273 a 0,480 m. Se aplicó aumento de imagen intenso (hasta 5 transformaciones aleatorias entre brillo, contraste, saturación, tono, nitidez, afín, perspectiva, desenfoque, borrado aleatorio y escala de grises) y ruido gaussiano de 1 grado sobre las 7 posiciones articulares del brazo izquierdo en la entrada de estado. La receta: 100.000 pasos, batch de 8, Adam con learning rate 1e-4, betas (0,95, 0,999), weight decay 1e-6, scheduler coseno. El entrenamiento se ejecutó en una rebanada MIG de 20 GB de una A100 (ASU Sol), a unas 6 iteraciones por segundo, durante aproximadamente 4,5 horas.

## Capacidades

- Generación de trayectorias de acción para manipulación robótica: produce 16 objetivos articulares a 15 Hz condicionados por tres cámaras y estado articular.
- Recogida de bloque en vertical (top-down pick): tarea específica de agarre con la punta de los dedos 0,5 cm por encima de la mitad de la altura del bloque.
- Percepción multimodal: procesa cabeza y ambas muñecas a 240x240 píxeles.
- Robustez a variaciones visuales: entrenado con domain randomization de fondos, mesa, luces, cámaras y color del bloque.
- Robustez a ruido de estado: tolerancia a perturbaciones gaussianas de 1 grado en las articulaciones del brazo izquierdo.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingües ni modos de pensamiento. Es un modelo puramente motor.

## Casos de uso

- Investigación en imitation learning: servir como baseline reproducible de diffusion policy sobre LeRobot para comparar recetas de domain randomization y ruido de estado en tareas de pick-and-place. El checkpoint de 100k y los intermedios permiten analizar la curva de aprendizaje.
- Simulación de manipulación con Isaac Lab: ejecutar la política sobre el robot FFW SG2 en el simulador para validar pipelines de percepción-acción antes de transferir a hardware.
- Estudio de sim-to-real: la combinación de domain randomization visual y ruido articular está diseñada para evaluar la brecha entre simulación y realidad en un setup concreto (mesa de 29,25 in, pose inicial fija en YAML, bloque lima de 5x5x4 cm).
- Benchmark de robustez visual: usar el modelo como sujeto de pruebas con perturbaciones controladas de iluminación, color de bloque y montaje de cámara para medir la degradación de la tasa de éxito.
- Docencia en robótica: ejemplo didáctico de pipeline completo LeRobot (dataset, entrenamiento, checkpoints, evaluación) con un modelo de 287 M parámetros que cabe en una GPU modesta.
- Desarrollo de controladores de agarre: extraer las trayectorias generadas para analizar estrategias de aproximación vertical y cierre de pinza con la punta de los dedos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que los resultados de evaluación en simulación se añadirán una vez se ejecuten.

## Requisitos de hardware

- VRAM estimada para inferencia: no documentada por el autor; con 287,5 M parámetros en safetensors y tres cámaras a 240x240, la huella es moderada y cabe holgadamente en GPUs de consumo, aunque no se especifica una cifra exacta.
- GPU recomendadas: el entrenamiento se hizo en una rebanada MIG de 20 GB de A100; para inferencia basta con una GPU consumer moderna (RTX 3060 en adelante) según el tamaño del modelo, aunque el dato no está confirmado por el autor.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño del modelo, pero no hay confirmación oficial.
- Opciones de despliegue: LeRobot (carga vía `DiffusionPolicy.from_pretrained("padiredd/dp-blockpick-dr-statenoise")`); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles para inferencia; el autor solo reporta ~6 pasos/s durante el entrenamiento en la MIG de 20 GB.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos de diffusion policy comparables ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Dominio extremadamente estrecho: una sola tarea (top-down pick), un solo robot (FFW SG2, brazo izquierdo), una pose inicial fija y un bloque de dimensiones y color concretos.
- Sin evaluación publicada: no hay tasas de éxito ni métricas de simulación, por lo que no se puede afirmar su rendimiento real.
- Licencia "other": no se detallan los términos; es imprescindible revisar las condiciones antes de cualquier uso comercial.
- Riesgo de sobreajuste al simulador: aunque se aplica domain randomization, no hay evidencia de transferencia a hardware real.
- Dependencia de un fork específico de LeRobot (ROBOTIS lerobot-cyclo @240b4a0): la reproducibilidad requiere ese commit concreto.
- Sin capacidades lingüísticas ni de razonamiento simbólico; no es adecuado para tareas fuera del control motor.
- El ruido de estado se aplicó solo a las 7 articulaciones del brazo izquierdo; el resto del estado (22 dimensiones) no se perturbó, lo que puede limitar la robustez ante variaciones en otras articulaciones.
- Advertencia de la model card: los resultados de evaluación en simulación aún no están disponibles.

## Enlaces

- HuggingFace: https://huggingface.co/padiredd/dp-blockpick-dr-statenoise
- Repositorio LeRobot (fork ROBOTIS lerobot-cyclo, commit 240b4a0): no se proporciona URL directa en la información disponible
- Isaac Lab: no se proporciona URL directa en la información disponible
- Paper de diffusion policy: no se proporciona URL directa en la información disponible
