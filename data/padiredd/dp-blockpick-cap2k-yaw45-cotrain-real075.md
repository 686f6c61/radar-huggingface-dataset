# padiredd/dp-blockpick-cap2k-yaw45-cotrain-real075

## Resumen

`dp-blockpick-cap2k-yaw45-cotrain-real075` es una política de difusión (diffusion policy) para robótica desarrollada por el usuario padiredd, entrenada sobre el fork `lerobot-cyclo` de LeRobot de ROBOTIS. Resuelve una tarea concreta de manipulación: el picking cenital de un bloque verde lima con el brazo izquierdo del robot bípedo FFW SG2 (plataforma SG2 con pinza ROBOTIS CAD y cámaras de muñeca calibradas sobre una mesa de 29,25 pulgadas). El modelo tiene 287.533.680 parámetros y se distribuye en formato safetensors dentro de un repositorio de 11,5 GB que incluye el checkpoint final (paso 100k) y nueve checkpoints intermedios cada 10.000 pasos.

Su interés técnico está en la estrategia de entrenamiento: combina 2.000 demostraciones sintéticas generadas por un programa *code-as-policy* en Isaac Lab con 14 demostraciones reales de teleoperación, mediante un muestreo de co-entrenamiento con alpha 0,75 a favor de los datos reales. Esto lo convierte en un caso práctico de cómo mezclar simulación a gran escala con un puñado de episodios reales para corregir el gap sim-a-real en políticas visuomotoras.

No es un modelo de lenguaje ni un modelo multimodal de propósito general: es un componente de control robótico específico de tarea, sin capacidades de texto, razonamiento simbólico ni tool calling. Su relevancia es la de un artefacto de investigación reproducible para quienes trabajan en imitación visual, diffusion policies y transferencia sim-a-real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion policy (DDPM, 100 pasos de difusión) con encoder ResNet18 por cámara |
| Parámetros totales | 287.533.680 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; horizonte de predicción de 64 pasos, 32 ejecutados, `n_obs_steps` = 1 |
| Tipos de cuantización | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (modelo robótico, sin interfaz de lenguaje; la tarea se especifica con la cadena "pick up the lime green block with the left arm") |
| Licencia | other |
| Formato de pesos | safetensors (checkpoint LeRobot `DiffusionPolicy`) |

## Arquitectura y entrenamiento

La política sigue el esquema clásico de diffusion policy: un módulo de observación con una ResNet18 independiente por cada una de las tres cámaras (cabeza, muñeca izquierda y muñeca derecha, a 240x240 píxeles) más un vector de estado articular de 22 dimensiones, y un cabezal de difusión DDPM de 100 pasos que genera secuencias de acciones de 16 objetivos articulares a 15 Hz. El entrenamiento usa horizonte 64 con 32 pasos ejecutados, `n_obs_steps` = 1, batch de 32, optimizador Adam con tasa 1e-4 y schedule coseno, semilla 1000, durante 100.000 pasos en una única NVIDIA RTX A5000 de 24 GB.

El dato más relevante es la composición del dataset y el muestreo. El conjunto combina 2.000 demostraciones simuladas en Isaac Lab generadas por un programa sin reintentos (`block_pick_v0.py`: aproximación, cierre y elevación, con parámetros de prensión, elevación, timing y trayectoria muestreados por episodio dentro de los rangos del planificador) y 14 episodios reales de teleoperación (`omkarpatil/pick-lime-block`, 2.653 fotogramas reescalados al formato de simulación), para un total de 2.014 episodios. El `CotrainMixSampler` del parche de `lerobot-cyclo` extrae cada muestra de los episodios reales con probabilidad 0,75 y del resto desde simulación, lo que produce aproximadamente 24 muestras reales y 8 simuladas por batch. Las estadísticas de normalización se calculan sobre el conjunto fusionado, de modo que el rango min/max cubre ambos dominios. La aumentación de imagen es agresiva: orden aleatorio de hasta cinco transformaciones entre brillo, contraste, saturación, tono, nitidez, afinidad, perspectiva, desenfoque, borrado aleatorio y escala de grises. No se aplica ruido de estado.

## Capacidades

- Generación de trayectorias de control articular para picking cenital de un bloque con el brazo izquierdo del FFW SG2, a 15 Hz y con 16 objetivos articulares por paso.
- Fusión visuomotora de tres vistas (cámara de cabeza y dos cámaras de muñeca) con estado articular de 22 dimensiones.
- Generalización dentro del rango de aleatorización del dataset: colocaciones del bloque con yaw entre 0 y 45 grados en ambos sentidos, región completa de la mesa y altura de mesa variable.
- Robustez a variaciones fotométricas y geométricas de cámara gracias a la aumentación de imagen aplicada en entrenamiento.
- Transferencia sim-a-real mediante co-entrenamiento con 14 episodios reales de la misma tarea.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo de razonamiento explícito ni de entrada de audio o texto más allá de la cadena de tarea.

## Casos de uso

- **Automatización de picking en laboratorio:** el modelo ejecuta la secuencia aproximación-cierre-elevación sobre un bloque concreto; sirve como política de referencia para comparar generadores de datos simulados frente a teleoperación real en la misma tarea y con las mismas semillas.
- **Estudio del gap sim-a-real:** con alpha 0,75 sobre datos reales y estadísticas de normalización fusionadas, es un banco de pruebas directo para medir cuánto ayuda un puñado de episodios reales frente a 2.000 episodios sintéticos.
- **Prototipado de pipelines LeRobot:** al cargarse con `DiffusionPolicy.from_pretrained("padiredd/dp-blockpick-cap2k-yaw45-cotrain-real075")`, se integra en flujos de entrenamiento y evaluación de LeRobot sin conversión de formato.
- **Ablación de checkpoints:** los directorios `step-10000/` a `step-90000/` permiten trazar la curva de aprendizaje y elegir un checkpoint intermedio si el final sobreajusta al dominio real.
- **Generación de datos sintéticos como política docente:** el programa *code-as-policy* sin reintentos que produjo el dataset puede reutilizarse para generar nuevos conjuntos con las mismas distribuciones de aleatorización y evaluar su impacto en la política resultante.
- **Validación de aumentación de imagen en robótica:** la receta de hasta cinco transformaciones aleatorias por muestra es reproducible y sirve para medir su efecto en robustez fotométrica y geométrica sobre hardware real.
- **Docencia y demostraciones de imitación visual:** el tamaño contenido (288 M parámetros) y el entrenamiento en una sola RTX A5000 de 24 GB lo hacen viable como ejemplo ejecutable en cursos de aprendizaje por imitación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que los resultados de evaluación se añadirán cuando se ejecuten, por lo que no existen cifras de tasa de éxito ni comparaciones numéricas con otras políticas.

## Requisitos de hardware

- Entrenamiento validado en una única NVIDIA RTX A5000 de 24 GB por ejecución, con batch 32 y 100.000 pasos.
- Inferencia: no se especifica VRAM mínima; con 287,5 M parámetros y tres ResNet18, el peso en precisión de entrenamiento ronda 1,1-1,2 GB, por lo que debería caber holgadamente en GPUs de consumo con 8 GB o más, aunque este dato no está confirmado en la documentación.
- GPUs recomendadas: RTX A5000 para reproducir el entrenamiento; para inferencia se espera compatibilidad con RTX 3090, RTX 4090, A100 y H100, sin cifras publicadas.
- Despliegue: la vía documentada es LeRobot con el fork `lerobot-cyclo` de ROBOTIS mediante `DiffusionPolicy.from_pretrained`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. La política genera acciones a 15 Hz, pero no se publican tiempos de inferencia por paso.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / horizonte | Datos de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dp-blockpick-cap2k-yaw45-cotrain-real075 | 287,5 M | 64 pasos, 32 ejecutados | 2.000 sim (code-as-policy) + 14 reales, alpha 0,75 real | other | Hugging Face, repo de 11,5 GB con 10 checkpoints |
| padiredd/dp-blockpick-yaw45-2k | no disponible | no disponible | 2.000 sim generadas por planificador de movimiento, mismas semillas y aleatorización | no disponible | Hugging Face |
| Políticas de difusión genéricas de LeRobot | variable según configuración | configurable | datasets propios | según configuración | Hugging Face / LeRobot |

La comparación directa más informativa es con `padiredd/dp-blockpick-yaw45-2k`, del mismo autor: comparte semillas, colocaciones de bloque, región, ciclado de altura de mesa y aleatorización dr2, y difiere únicamente en el generador de demostraciones (planificador de movimiento frente a programa code-as-policy) y en la incorporación de los 14 episodios reales con co-entrenamiento. No se dispone de cifras de rendimiento para ninguno de los dos.

## Limitaciones y advertencias

- Modelo específico de una única tarea y un único robot: no generaliza a otras tareas, objetos, brazos ni plataformas sin reentrenamiento.
- El dataset simulado (`pick-cube-cap2k-v0-yaw45-full-dr2-3cam`) no está publicado en Hugging Face, lo que dificulta la reproducción exacta del entrenamiento.
- Solo 14 episodios reales (2.653 fotogramas) frente a 2.000 simulados; el co-entrenamiento con alpha 0,75 mitiga pero no elimina el riesgo de sobreajuste al dominio real escaso.
- La model card no reporta ninguna evaluación: no hay tasas de éxito en simulación ni en hardware real, por lo que el rendimiento real es desconocido.
- Licencia "other": no se detallan términos de uso comercial; es necesario contactar con el autor o revisar el repositorio antes de cualquier despliegue productivo.
- Sin datos de sesgos, alucinación o comportamiento fuera de distribución; en robótica estos riesgos se traducen en colisiones, agarres fallidos o movimientos inseguros si el estado inicial se sale del rango de aleatorización.
- El repositorio ocupa 11,5 GB por acumular diez checkpoints; conviene descargar solo el necesario.
- Dependencia del fork `lerobot-cyclo` de ROBOTIS y de la clase `DiffusionPolicy`; la compatibilidad con versiones upstream de LeRobot no está garantizada.
- No hay soporte multilingüe ni de instrucciones en lenguaje natural más allá de la cadena de tarea fija.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/padiredd/dp-blockpick-cap2k-yaw45-cotrain-real075
- Modelo comparable del mismo autor: https://huggingface.co/padiredd/dp-blockpick-yaw45-2k
- Dataset real de teleoperación citado: https://huggingface.co/omkarpatil/pick-lime-block
- LeRobot (framework base): https://github.com/huggingface/lerobot
- Isaac Lab (generación de datos simulados): https://github.com/isaac-sim/IsaacLab
- ROBOTIS FFW SG2: https://ai.robotis.com/
