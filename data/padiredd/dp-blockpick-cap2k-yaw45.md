# padiredd/dp-blockpick-cap2k-yaw45

## Resumen

dp-blockpick-cap2k-yaw45 es una política de difusión (diffusion policy) para robótica entrenada con el framework LeRobot, publicada por el usuario padiredd. Resuelve una tarea de manipulación concreta: recoger un bloque verde lima con el brazo izquierdo del robot humanoide ROBOTIS FFW SG2, equipado con una pinza ROBOTIS CAD y cámaras de muñeca calibradas. El modelo tiene 287,5 millones de parámetros y se distribuye en formato safetensors dentro de un repositorio de 11,5 GB que incluye el checkpoint final (paso 100k) y nueve checkpoints intermedios cada 10.000 pasos.

La relevancia de esta ficha es acotada: no es un modelo de lenguaje ni un modelo fundacional generalista, sino un artefacto de investigación reproducible para una tarea de pick-and-place en simulación (Isaac Lab). Su interés radica en la receta de entrenamiento documentada con detalle (aumento de imagen agresivo, 2.000 demostraciones generadas por un programa code-as-policy sin reintentos, horizonte de difusión DDPM de 100 pasos) y en que sirve como referencia para quien quiera replicar políticas de difusión en LeRobot con robots de dos brazos.

No hay información sobre idiomas, benchmarks ni evaluación real: la model card indica explícitamente que los resultados de evaluación se añadirán cuando se ejecuten. Cualquier uso en producción requeriría validación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion policy (DDPM) con encoder visual ResNet18 por cámara y cabeza de acciones; framework LeRobot (fork ROBOTIS lerobot-cyclo) |
| Parametros totales | 287.533.680 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje); n_obs_steps = 1, horizonte de predicción 64 pasos, 32 ejecutados |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; acepta una cadena de tarea en inglés: "pick up the lime green block with the left arm") |
| Licencia | other (licencia personalizada; consultar términos en el repositorio) |
| Formato de pesos | safetensors (compatible con `DiffusionPolicy.from_pretrained`) |

## Arquitectura y entrenamiento

Se trata de una política de difusión condicionada por observaciones visuales y de estado. Cada una de las tres cámaras (cabeza, muñeca izquierda y muñeca derecha) se procesa con un encoder ResNet18 independiente; las imágenes son de 240x240 píxeles. La entrada se completa con un vector de estado articular de 22 dimensiones, y la salida es una secuencia de 16 objetivos articulares a 15 Hz. El proceso de difusión usa DDPM con 100 pasos, horizonte de 64 pasos del que se ejecutan 32, y un único paso de observación (n_obs_steps = 1).

El entrenamiento se realizó durante 100.000 pasos con batch de 32, optimizador Adam con tasa 1e-4 y scheduler coseno, semilla 1000, sobre una única NVIDIA RTX A5000 de 24 GB. El dataset, `pick-cube-cap2k-v0-yaw45-full-dr2-3cam` (no publicado aún en HuggingFace), contiene 2.000 demostraciones exitosas en simulación generadas por un programa code-as-policy sin reintentos: un acercamiento, cierre y elevación, con parámetros de prensión, elevación, temporización y trayectoria muestreados por episodio. Las colocaciones del bloque cubren yaw de 0 a 45 grados con signo aleatorio. El muestreo de frames es uniforme (EpisodeAwareSampler por defecto de LeRobot). Destaca el aumento de imagen agresivo: hasta cinco transformaciones en orden aleatorio por muestra (brillo 0,6-1,4, contraste 0,6-1,4, saturación 0,3-1,7, tono ±0,1, nitidez 0,3-2,0, afín ±10 grados / 10 % / 0,9-1,1, perspectiva 0,2, desenfoque, borrado aleatorio y escala de grises). No se aplica ruido al estado.

## Capacidades

- Control robótico de pick-and-place: genera trayectorias articulares de 16 objetivos a 15 Hz para recoger un bloque con el brazo izquierdo.
- Percepción multimodal: fusiona tres cámaras (cabeza y ambas muñecas) con el estado articular de 22 dimensiones.
- Condicionamiento por tarea: acepta una cadena de instrucción ("pick up the lime green block with the left arm"), aunque el modelo está entrenado para una única tarea.
- Robustez visual por aumento: el entrenamiento con aumentos agresivos busca tolerancia a variaciones de iluminación, color y punto de vista en simulación.
- Generalización limitada de colocación: cubre orientaciones del bloque de hasta 45 grados de yaw.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Investigación en políticas de difusión: servir de referencia reproducible para estudiar el efecto del aumento de imagen y del número de demostraciones en tareas de manipulación con LeRobot.
- Replicación de experimentos: el repositorio incluye checkpoints cada 10.000 pasos, lo que permite analizar curvas de aprendizaje y elegir un checkpoint intermedio según el coste de inferencia.
- Base para fine-tuning en simulación: partir del checkpoint de 100k y adaptarlo a variantes de la tarea (otras posiciones, otros objetos) con el mismo pipeline de datos Isaac Lab.
- Comparación de generadores de datos: el autor indica que este modelo y `padiredd/dp-blockpick-yaw45-2k` comparten semillas, colocaciones y randomización, diferenciándose solo en el generador de demostraciones (code-as-policy frente a planificador de movimiento); sirve para aislar el impacto del generador.
- Docencia y divulgación: ejemplo completo y documentado de entrenamiento de una política visuomotora con tres cámaras en una sola GPU de 24 GB.
- Transferencia a hardware: punto de partida para probar la política en el robot físico ROBOTIS FFW SG2, siempre con validación previa en simulación y evaluación de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que los resultados de evaluación se añadirán cuando se ejecuten.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 287,5 millones de parámetros en FP32 los pesos ocupan aproximadamente 1,15 GB, a los que se suman las activaciones de tres ResNet18 y el bucle DDPM de 100 pasos. En la práctica, una GPU de 8 GB debería ser suficiente, aunque no hay medición publicada.
- GPU de entrenamiento documentada: una NVIDIA RTX A5000 de 24 GB por ejecución.
- GPU recomendadas para inferencia: RTX 3090, RTX 4090, A5000, A100 o H100; cualquier GPU con al menos 8 GB de VRAM es un punto de partida razonable.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores; sin confirmación oficial.
- Opciones de despliegue: LeRobot (`DiffusionPolicy.from_pretrained`), con integración en Isaac Lab para simulación. No se documentan exportaciones a ONNX, TensorRT, vLLM, llama.cpp ni Ollama (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles. El bucle DDPM de 100 pasos y las tres cámaras a 240x240 condicionan la latencia; el control opera a 15 Hz, pero no se publica si se alcanza ese ritmo en hardware concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Tarea | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| dp-blockpick-cap2k-yaw45 | 287,5 M | 3 cámaras 240x240 + estado 22 dim | Pick de bloque, brazo izquierdo FFW SG2 | 64 pasos (32 ejecutados) | other | HuggingFace |
| padiredd/dp-blockpick-yaw45-2k | no disponible | no disponible | Misma tarea, demostraciones de planificador de movimiento | no disponible | no disponible | HuggingFace |
| Otras diffusion policies de LeRobot | variable | variable | Manipulación genérica | variable | variable | HuggingFace |

La comparación con alternativas genéricas no está disponible con datos verificables en la información proporcionada; el único comparable directo documentado es la variante del mismo autor con distinto generador de datos.

## Limitaciones y advertencias

- Modelo de una sola tarea: entrenado exclusivamente para recoger un bloque verde lima con el brazo izquierdo; no generaliza a otras tareas sin reentrenamiento.
- Solo simulación: no hay evidencia publicada de transferencia al robot físico; el gap sim-to-real puede ser significativo.
- Sin evaluación: no se han publicado métricas de éxito ni benchmarks; el rendimiento real es desconocido.
- Sesgos de datos: las demostraciones provienen de un único programa generador y de un rango acotado de colocaciones (yaw de hasta 45 grados); fuera de ese rango el comportamiento no está garantizado.
- Riesgo de alucinación en el sentido de acciones no válidas: como toda política generativa, puede producir trayectorias fuera de distribución; requiere límites de seguridad en el robot real.
- Licencia "other": es imprescindible revisar los términos del repositorio antes de cualquier uso comercial; no se especifican restricciones concretas en la información disponible.
- Idiomas: no aplica; la instrucción de tarea está en inglés y el modelo no procesa lenguaje natural de forma general.
- Dependencia del ecosistema: requiere el fork ROBOTIS de LeRobot y un pipeline de observaciones concreto (tres cámaras calibradas, estado de 22 dimensiones); integrarlo fuera de ese stack exige trabajo adicional.
- Repositorio pesado: 11,5 GB por los diez checkpoints; conviene descargar solo el checkpoint necesario.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/padiredd/dp-blockpick-cap2k-yaw45
- Modelo comparable del mismo autor: https://huggingface.co/padiredd/dp-blockpick-yaw45-2k
- LeRobot (framework): https://github.com/huggingface/lerobot
- Isaac Lab (simulación): https://github.com/isaac-sim/IsaacLab
