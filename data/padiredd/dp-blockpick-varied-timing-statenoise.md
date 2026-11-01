# padiredd/dp-blockpick-varied-timing-statenoise

## Resumen

`dp-blockpick-varied-timing-statenoise` es una política de difusión (diffusion policy) entrenada para control robótico de manipulación, concretamente para una tarea de recogida de bloque (block pick) con el brazo izquierdo del robot humanoide ROBOTIS FFW SG2 en el simulador Isaac Lab. Lo desarrolla el usuario `padiredd` y se distribuye a través de HuggingFace dentro del ecosistema LeRobot, el framework de robótica de HuggingFace. El modelo resuelve el problema de generar trayectorias de acción continuas a partir de observaciones visuales y de estado articular, un caso de uso central en aprendizaje por imitación.

El modelo tiene 287.533.680 parámetros (unos 287 M) y un tamaño de repositorio de 5,8 GB, que incluye el checkpoint principal y cuatro checkpoints intermedios. Emplea la arquitectura Diffusion Policy con formulación DDPM de 100 pasos de difusión, horizonte de predicción de 64 pasos (32 ejecutados) y un único paso de observación. Se entrenó sobre un conjunto de 500 demostraciones (83.472 fotogramas) con variación de tiempos por episodio y ruido gaussiano de 1 grado sobre el estado articular del brazo.

Su relevancia es acotada pero específica: es un ejemplo reproducible de entrenamiento de políticas de difusión en simulación con un fork concreto de LeRobot, con receta de entrenamiento documentada (100k pasos, batch 8, Adam 1e-4, una A100 de 20 GB en ~4,5 h). No es un modelo de lenguaje ni un modelo generalista: es un artefacto de investigación en robótica, orientado a reproducir y extender experimentos de manipulación en Isaac Lab.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (DDPM, 100 pasos de difusión) sobre LeRobot (fork ROBOTIS lerobot-cyclo @240b4a0) |
| Parámetros totales | 287.533.680 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (n_obs_steps = 1; horizonte de acción 64, 32 ejecutados) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin procesamiento de lenguaje) |
| Licencia | other |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es una Diffusion Policy: un modelo generativo de difusión que produce secuencias de acciones condicionadas por observaciones. En este caso, las observaciones son tres cámaras (cabeza y ambas muñecas) reescaladas a 240x240 píxeles más un vector de estado articular de 22 dimensiones. La salida es un conjunto de 16 objetivos articulares a 15 Hz. El proceso de difusión usa DDPM con 100 pasos, horizonte de 64 pasos del que se ejecutan 32, y un solo paso de observación (n_obs_steps = 1).

El entrenamiento se realizó sobre el conjunto `pick-cube-topdown-20x25-rt-500-3cam` (500 demostraciones, 83.472 fotogramas) con variación de tiempos por episodio: duraciones de fase escaladas entre x0,75 y x1,35, pausas de 0 a 0,5 s antes del cierre, prensión previa de 5 a 11 cm, elevación de 8 a 15 cm y alcance flexionado. La posición del bloque se muestrea uniformemente en x 0,28-0,48 m e y 0,065-0,315 m. Se aplicó aumento de imagen agresivo (hasta 5 transformaciones aleatorias entre brillo, contraste, saturación, tono, nitidez, afín, perspectiva, desenfoque, borrado aleatorio y escala de grises) y ruido gaussiano de 1 grado sobre las 7 posiciones articulares del brazo izquierdo en la entrada de estado. La receta: 100k pasos, batch 8, Adam con 1e-4, betas (0,95, 0,999), weight decay 1e-6, scheduler coseno, sobre una MIG de A100 de 20 GB a ~6 pasos/s durante ~4,5 h.

## Capacidades

- Generación de trayectorias de acción continuas para manipulación robótica (16 objetivos articulares a 15 Hz).
- Percepción visual multi-cámara: procesa tres vistas simultáneas (cabeza y dos muñecas) a 240x240.
- Condicionamiento por estado articular: integra un vector de 22 dimensiones junto con las imágenes.
- Tarea específica: recogida cenital (top-down) de un bloque de 5x5x4 cm con agarre recto, puntas 0,5 cm por encima de la mitad de la altura del bloque.
- Robustez parcial a variaciones temporales y de posición del objeto, gracias al entrenamiento con tiempos variados y bloque muestreado uniformemente.
- Robustez a perturbaciones visuales y de estado, por el aumento de imagen y el ruido de 1 grado en el estado.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es una política de control, no un modelo de lenguaje.

## Casos de uso

- Investigación en aprendizaje por imitación: sirve como referencia reproducible para estudiar cómo la variación temporal y el ruido de estado afectan a la robustez de una diffusion policy en tareas de pick-and-place.
- Evaluación de robustez en simulación: permite comparar el efecto del aumento de imagen y del ruido gaussiano de estado frente a políticas entrenadas sin estas técnicas, usando los checkpoints intermedios (20k, 40k, 60k, 80k, 100k).
- Base para fine-tuning en Isaac Lab: el checkpoint puede adaptarse a variantes de la tarea (otro objeto, otra pose inicial, otro brazo) partiendo de los pesos publicados.
- Benchmark de recetas de entrenamiento: la receta documentada (100k pasos, batch 8, Adam 1e-4, DDPM 100) permite reproducir el coste computacional (~4,5 h en una A100 de 20 GB) y comparar con configuraciones alternativas.
- Docencia y divulgación en robótica: ejemplo completo y autocontenido de pipeline LeRobot + Isaac Lab, desde datos hasta checkpoint, útil para cursos de aprendizaje por imitación.
- Integración en pipelines de simulación a gran escala: al ser un modelo pequeño (287 M) y ligero en inferencia, puede ejecutarse en paralelo en múltiples entornos simulados para generar datos o evaluar políticas.
- Estudio de la decodificación de acciones con horizonte 64/32: útil para analizar el compromiso entre frecuencia de replanificación y estabilidad de la trayectoria en control a 15 Hz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que los resultados de evaluación en simulación se añadirán una vez ejecutados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 287 M parámetros en safetensors (probablemente fp32), los pesos ocupan en torno a 1,1-1,2 GB; el repositorio completo (5,8 GB) incluye los cinco checkpoints.
- GPU de entrenamiento documentada: una MIG de A100 de 20 GB, a ~6 pasos/s durante ~4,5 h para 100k pasos.
- GPU recomendadas: A100 (20 GB o superior) para entrenamiento; para inferencia, cualquier GPU con suficiente memoria para los pesos y el procesamiento de tres cámaras a 240x240.
- ¿Cabe en GPU de consumo? No disponible de forma explícita; por tamaño de parámetros es plausible en GPUs de consumo con memoria suficiente, pero no se confirma en la información proporcionada.
- Opciones de despliegue: LeRobot (`DiffusionPolicy.from_pretrained("padiredd/dp-blockpick-varied-timing-statenoise")`) con el fork ROBOTIS lerobot-cyclo; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: ~6 pasos/s en entrenamiento con batch 8 en A100 20 GB MIG; no se documenta latencia de inferencia.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos comparables de diffusion policy para esta tarea ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Modelo específico de tarea: solo realiza la recogida cenital de un bloque de 5x5x4 cm con el brazo izquierdo del FFW SG2; no generaliza a otras tareas sin reentrenamiento.
- Entrenado exclusivamente en simulación (Isaac Lab): no hay evidencia de transferencia a hardware real (sim-to-real) en la información disponible.
- Sin resultados de evaluación publicados: la model card indica que los resultados de simulación se añadirán cuando se ejecuten, por lo que no hay métricas de éxito verificadas.
- Licencia "other": no se especifican los términos exactos; es necesario consultar el repositorio antes de cualquier uso comercial.
- Dependencia de un fork concreto de LeRobot (ROBOTIS lerobot-cyclo @240b4a0): la reproducibilidad puede verse afectada por cambios en el fork o en LeRobot.
- Riesgo de sobreajuste a las condiciones de simulación: iluminación, texturas y dinámica del simulador pueden no reflejar el mundo real.
- Sin capacidades de lenguaje, tool calling ni agentes: no es adecuado para tareas de NLP.
- Idiomas no disponibles: el modelo no procesa texto.
- Advertencia de seguridad: al tratarse de control robótico, cualquier despliegue en un robot físico requiere validación y protocolos de seguridad independientes.

## Enlaces

- HuggingFace: https://huggingface.co/padiredd/dp-blockpick-varied-timing-statenoise
- LeRobot (HuggingFace): https://github.com/huggingface/lerobot
- Fork ROBOTIS lerobot-cyclo: no disponible (referenciado en la model card como `ROBOTIS lerobot-cyclo fork @240b4a0`, sin URL)
- Isaac Lab: https://github.com/isaac-sim/IsaacLab
- Diffusion Policy (paper original): no disponible en la información proporcionada
- Dataset `pick-cube-topdown-20x25-rt-500-3cam`: no disponible (referenciado en la model card sin URL)
