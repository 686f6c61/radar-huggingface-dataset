# padiredd/dp-blockpick-cap2k-v0

## Resumen

dp-blockpick-cap2k-v0 es una política de difusión (diffusion policy) para robótica manipulativa, entrenada con el framework LeRobot sobre un fork propio del autor (padiredd) orientado al robot humanoide ROBOTIS FFW SG2. El modelo resuelve una tarea muy concreta: el agarre y elevación (pick) de un bloque verde lima con el brazo izquierdo del robot, partiendo de una cámara cenital y dos cámaras de muñeca calibradas. No es un modelo de lenguaje ni un modelo generativo de propósito general, sino un controlador de acciones que mapea observaciones visuales y estado articular a comandos motores.

La arquitectura subyacente es una diffusion policy con un backbone ResNet18 por cámara y un proceso DDPM de 100 pasos, con 287,5 millones de parámetros totales. El entrenamiento se realizó sobre 2.000 demostraciones exitosas generadas en simulación mediante un programa "code-as-policy" sin reintentos, lo que produce etiquetas limpias y una distribución de datos controlada. El checkpoint publicado corresponde al paso 100k, con checkpoints intermedios cada 10.000 pasos.

Su relevancia es acotada pero significativa dentro del ecosistema de robótica open source: demuestra un flujo completo de generación de datos sintéticos, entrenamiento de políticas de difusión y publicación de checkpoints en el formato LeRobot, todo reproducible en una única GPU de 24 GB. Es un artefacto de investigación, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion policy (DDPM) con backbone ResNet18 por cámara, fork ROBOTIS lerobot-cyclo |
| Parametros totales | 287.533.680 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (política de control; horizonte de predicción de 64 pasos, 32 ejecutados) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; incluye una task string en inglés) |
| Licencia | other |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una diffusion policy en el sentido de LeRobot: un proceso de difusión DDPM con 100 pasos que genera secuencias de acciones (horizonte 64, de las cuales se ejecutan 32) condicionadas por observaciones. Cada una de las tres cámaras (cabeza, muñeca izquierda y muñeca derecha, a 240x240 píxeles) pasa por un ResNet18 independiente; la representación visual se combina con un vector de estado articular de 22 dimensiones para producir 16 objetivos articulares a 15 Hz. El entrenamiento usó Adam con tasa 1e-4, scheduler coseno, batch de 32 y 100.000 pasos, con semilla 1000.

Los datos provienen de 2.000 demostraciones simuladas generadas por un programa determinista (`block_pick_v0.py`) con una única aproximación, cierre y elevación, y con parámetros de prensión, elevación, temporización y trayectoria muestreados por episodio dentro de los rangos del planificador. Las colocaciones del bloque cubren yaw de 0 a 45 grados con signo aleatorio, altura de mesa cíclica y la misma aleatorización dr2 que el conjunto del planificador de movimiento. El muestreo de frames es uniforme sobre todos los frames (EpisodeAwareSampler por defecto de LeRobot). Se aplica aumento de imagen agresivo en orden aleatorio: hasta cinco transformaciones entre brillo, contraste, saturación, tono, nitidez, afín, perspectiva, desenfoque, borrado aleatorio y escala de grises. No se añadió ruido de estado. Todo el entrenamiento se ejecutó en una NVIDIA RTX A5000 de 24 GB.

## Capacidades

- Control visomotor para agarre y elevación de un bloque con el brazo izquierdo del ROBOTIS FFW SG2.
- Fusión de tres vistas de cámara (cabeza y ambas muñecas) con estado articular de 22 dimensiones.
- Generación de trayectorias articulares de 16 dimensiones a 15 Hz con horizonte de predicción de 64 pasos.
- Robustez a variaciones de iluminación, color y geometría gracias al aumento de imagen agresivo durante el entrenamiento.
- Generalización dentro de la distribución de entrenamiento: yaw del bloque de 0 a 45 grados, posiciones aleatorias en la región de la mesa y altura de mesa variable.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico ni capacidades multilingües; es un controlador específico de tarea.
- No dispone de modo de razonamiento (thinking), visión general, audio ni generación de texto.

## Casos de uso

- Investigación en aprendizaje por imitación: servir como checkpoint de referencia para comparar políticas de difusión entrenadas con datos generados por programa frente a las entrenadas con planificador de movimiento (el autor publica `dp-blockpick-yaw45-2k` como contraparte).
- Reproducción de pipelines LeRobot: el modelo se carga con `DiffusionPolicy.from_pretrained("padiredd/dp-blockpick-cap2k-v0")` y permite validar el flujo completo de entrenamiento y evaluación en simulación.
- Estudio de robustez visual: el aumento de imagen agresivo lo hace útil para analizar cómo afectan las perturbaciones de color, iluminación y geometría a una política de difusión en tareas de pick.
- Benchmark de generación de datos sintéticos: comparar la calidad de políticas entrenadas con demostraciones "code-as-policy" sin reintentos frente a datos con fallos inducidos.
- Base para fine-tuning en el robot FFW SG2: punto de partida para adaptar la política a variantes de la tarea (otros objetos, otras posiciones) con un número reducido de demostraciones adicionales.
- Docencia y divulgación: ejemplo completo y autocontenido de diffusion policy con tres cámaras, aumento de imagen y checkpoints intermedios cada 10k pasos, adecuado para explicar el ciclo datos-entrenamiento-evaluación en robótica.
- Evaluación comparativa de checkpoints: los directorios `step-10000` a `step-90000` permiten estudiar la evolución del rendimiento a lo largo del entrenamiento sin reentrenar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que los resultados de evaluación se añadirán una vez se ejecuten.

## Requisitos de hardware

- Entrenamiento: una NVIDIA RTX A5000 de 24 GB por ejecución, según la model card.
- Inferencia: no se especifica VRAM; con 287,5 M de parámetros en safetensors, la inferencia cabe holgadamente en GPUs consumer de 8-12 GB, aunque no hay medición publicada.
- GPUs recomendadas: RTX A5000 (referencia del autor); cualquier GPU con al menos 8 GB debería ser suficiente para inferencia, sin datos confirmados.
- Despliegue: el modelo se carga mediante LeRobot (`DiffusionPolicy.from_pretrained`), no mediante vLLM, llama.cpp, Ollama ni TGI, que no aplican a políticas de control.
- Latencia y throughput: no disponibles. El control opera a 15 Hz, pero no se ha publicado la latencia real de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dp-blockpick-cap2k-v0 | 287,5 M | Horizonte 64, 32 ejecutados | Pick de bloque, brazo izquierdo FFW SG2 | other | HuggingFace |
| padiredd/dp-blockpick-yaw45-2k | no disponible | no disponible | Misma tarea, datos generados por planificador de movimiento | no disponible | HuggingFace |
| Otras diffusion policies de LeRobot | variable | variable | Tareas diversas de manipulación | variable | HuggingFace |

La comparación directa con `dp-blockpick-yaw45-2k` es la más relevante: comparte seeds, colocaciones de bloque, altura de mesa y aleatorización dr2, y difiere únicamente en el generador de demostraciones (programa code-as-policy frente a planificador de movimiento). No se dispone de datos de rendimiento de ninguno de los dos.

## Limitaciones y advertencias

- Modelo específico de una única tarea y un único robot; no generaliza a otros objetos, brazos o plataformas sin reentrenamiento.
- Entrenado exclusivamente en simulación (Isaac Lab); la transferencia a hardware real no está validada ni documentada.
- Sin resultados de evaluación publicados: no hay evidencia cuantitativa de éxito en la tarea.
- Licencia "other": es necesario consultar los términos del autor antes de cualquier uso comercial; no se especifican restricciones concretas.
- El conjunto de datos de entrenamiento (`pick-cube-cap2k-v0-yaw45-full-dr2-3cam`) no está publicado en HuggingFace, lo que dificulta la reproducción exacta.
- Dependencia de un fork específico de LeRobot (ROBOTIS lerobot-cyclo), lo que puede introducir incompatibilidades con la versión upstream.
- Riesgo de sobreajuste a la distribución de demostraciones sintéticas limpias (sin fallos inducidos), lo que puede reducir la robustez ante perturbaciones no modeladas.
- No es un modelo de lenguaje: no admite prompts en lenguaje natural más allá de la task string fija, ni razonamiento simbólico, ni tool calling.

## Enlaces

- HuggingFace: https://huggingface.co/padiredd/dp-blockpick-cap2k-v0
- Modelo contraparte (planificador de movimiento): https://huggingface.co/padiredd/dp-blockpick-yaw45-2k
- LeRobot (framework): https://github.com/huggingface/lerobot
- Isaac Lab (simulación): https://github.com/isaac-sim/IsaacLab
- ROBOTIS: https://www.robotis.us/
