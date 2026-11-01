# padiredd/pick-cube-lime-sim-250-board-3cam-heavyaug-sn1deg-dp

## Resumen

`pick-cube-lime-sim-250-board-3cam-heavyaug-sn1deg-dp` es una política de difusión (diffusion policy) para control robótico de manipulación, publicada por el usuario padiredd en Hugging Face bajo la librería LeRobot. El modelo está entrenado para que el brazo izquierdo de un robot ROBOTIS FFW BG2 recoja un bloque verde lima de 5x5x4 cm con orificio pasante sobre una mesa gris, en un entorno simulado con un tablero de espuma en el borde lejano. No es un modelo de lenguaje: es un controlador de acciones que mapea observaciones (tres cámaras e información propioceptiva) a comandos de articulaciones.

La relevancia de esta ficha es acotada y muy específica: se trata de un checkpoint de investigación en robótica, entrenado exclusivamente con 250 episodios simulados en Isaac Lab (Cyclo Lab) mediante un planificador scriptado con cinemática inversa. Con 287,5 millones de parámetros y un repositorio de 1,2 GB, su interés radica en documentar recetas de aumento de datos agresivo y ruido propioceptivo en el estado, no en ofrecer capacidades generales.

El modelo forma parte del ecosistema LeRobot (versión 0.6.1, fork lerobot-cyclo de ROBOTIS) y se distribuye con licencia Apache 2.0. Su evaluación publicada se limita a 50 episodios en el mismo entorno simulado de entrenamiento, con una tasa de éxito del 100 % tanto con muestreo DDPM-100 como DDIM-10.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion policy (DDPM) con encoder ResNet18 para imágenes |
| Parámetros totales | 287.533.680 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control; horizonte de 64 pasos, 32 pasos de acción, 1 paso de observación) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es una diffusion policy con formulación DDPM de 100 pasos de entrenamiento. El encoder visual es una ResNet18 que procesa tres cámaras (cabeza izquierda, muñeca izquierda y muñeca derecha), cada una reescalada a 240x240 píxeles con interpolación `cv2.INTER_AREA`. La entrada de estado (`observation.state`) tiene 22 dimensiones y la salida de acción (`action`) 16 dimensiones. El horizonte de predicción es de 64 pasos, con 32 pasos de acción ejecutables y 1 paso de observación.

El entrenamiento se realizó sobre 250 episodios simulados (38.550 fotogramas a 15 fps) generados en Isaac Lab con un planificador scriptado e cinemática inversa. Se aplicaron 100.000 pasos con batch de 8, optimizador Adam (lr 1e-4, betas 0.95/0.999, weight decay 1e-6), schedule coseno con 500 pasos de warm-up. Destaca el aumento de imagen agresivo (ColorJitter, nitidez, affine, perspectiva, desenfoque, borrado, escala de grises) y la inyección de ruido gaussiano de sigma = 1 grado en las articulaciones del brazo izquierdo (`arm_l_joint1..7`, dimensiones 0-6 del estado) durante el entrenamiento, sin ruido en la pinza. La pérdida final de entrenamiento fue 0,002 (0,001 sin ruido de estado).

## Capacidades

- Generación de trayectorias de acción para el brazo izquierdo de un ROBOTIS FFW BG2 en la tarea de recogida de un bloque verde lima.
- Procesamiento multimodal de tres cámaras (cabeza izquierda, muñeca izquierda, muñeca derecha) a 240x240.
- Condicionamiento en estado propioceptivo de 22 dimensiones, con ruido de 1 grado en las articulaciones del brazo izquierdo durante el entrenamiento.
- Muestreo flexible: compatible con DDPM-100 y DDIM-10 (eta 0) según la evaluación publicada.
- No dispone de tool calling, function calling, razonamiento multi-paso simbólico, capacidades multilingües ni modos de pensamiento. Es un controlador motor, no un modelo generativo de texto.
- No soporta visión general: las cámaras son específicas del robot y del entorno de entrenamiento.

## Casos de uso

- Replicación de experimentos de diffusion policy en simulación: el checkpoint sirve como referencia para comparar recetas de aumento de datos y ruido propioceptivo en tareas de pick-and-place con Isaac Lab.
- Evaluación de robustez frente a ruido de estado: el modelo está entrenado con sigma = 1 grado en las articulaciones del brazo izquierdo, lo que permite estudiar la degradación de la política al inyectar ruido en inferencia (la evaluación publicada usa estado limpio).
- Benchmark de muestreo eficiente: al reportar resultados con DDPM-100 y DDIM-10, permite comparar latencia y tasa de éxito entre ambos esquemas de muestreo en el mismo entorno.
- Base para fine-tuning en el robot físico: con 287 M de parámetros y pesos safetensors, puede adaptarse a un FFW BG2 real si se dispone de demostraciones reales y se ajusta la distribución de observaciones.
- Estudio de transferencia sim-to-real: al estar entrenado solo en simulación con un tablero de espuma en el borde lejano, es un caso de estudio para medir la brecha de dominio en tareas de manipulación con bloque perforado.
- Docencia e investigación en robótica de manipulación: sirve como ejemplo reproducible de pipeline LeRobot + Isaac Lab con tres cámaras y aumento de imagen agresivo.

## Benchmarks y rendimiento

Evaluación en simulación publicada por el autor (50 episodios, entorno con tablero, bloque en cualquier posición dentro de la caja de entrenamiento, pose inicial de yaml, semilla 0, estado limpio sin ruido inyectado):

| Muestreador | Éxito de recogida |
|---|---|
| DDPM-100 (el del checkpoint) | 50/50 (100 %) |
| DDIM-10, eta 0 | 50/50 (100 %) |

No se han publicado resultados en robots físicos ni en entornos distintos al de entrenamiento. No hay datos de latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 287,5 M de parámetros en safetensors (1,2 GB de repositorio), la inferencia en precisión nativa requiere del orden de 1,2 GB solo para pesos, más activaciones del encoder ResNet18 y del proceso de difusión.
- GPU recomendadas: no disponibles. Por tamaño, una GPU consumer con 8 GB o más debería ser suficiente para inferencia en FP32/FP16, pero no hay datos publicados que lo confirmen.
- Cabe en GPU consumer: probablemente sí por tamaño de parámetros, pero no está verificado en la información disponible.
- Opciones de despliegue: LeRobot 0.6.1 (fork lerobot-cyclo de ROBOTIS); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles. El muestreo DDIM-10 reduce los pasos de difusión frente a DDPM-100, lo que previsiblemente disminuye la latencia, pero no se publican cifras.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se trata de un checkpoint muy específico (tarea, robot y entorno concretos) y no se han facilitado alternativas de la misma categoría con parámetros, contexto o licencia comparables.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pick-cube-lime-sim-250-board-3cam-heavyaug-sn1deg-dp | 287,5 M | no aplica | 100 % en 50 episodios sim | Apache 2.0 | Hugging Face |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Entrenado exclusivamente en simulación (Isaac Lab): no hay evidencia de transferencia a un robot físico. La brecha sim-to-real no está medida.
- La evaluación se limita a 50 episodios en el mismo entorno y distribución de entrenamiento (bloque dentro de la caja de 10x10 cm centrada en x 0,48, y 0,19 m). No hay evaluación fuera de distribución.
- Las dimensiones de estado 8-21 (brazo derecho, cabeza, elevación, odometría) son constantes en los datos de entrenamiento; deben fijarse a su punto medio de entrenamiento en inferencia. Ignorar esta indicación puede degradar el comportamiento.
- El modelo está especializado en una única tarea (recoger un bloque verde lima de 5x5x4 cm con orificio) y un único robot (brazo izquierdo del FFW BG2). No generaliza a otras tareas ni objetos.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero la política puede generar trayectorias no válidas fuera de la distribución de estados observada.
- Sesgos conocidos: no documentados. Al entrenarse con un planificador scriptado, hereda las limitaciones de este (posibles sesgos de trayectoria y de posicionamiento).
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo depende de LeRobot 0.6.1 (fork lerobot-cyclo) y de Isaac Lab; conviene revisar las licencias de esas dependencias.
- El ruido propioceptivo de 1 grado se aplicó solo en entrenamiento; la evaluación publicada usa estado limpio, por lo que el rendimiento con ruido en inferencia no está cuantificado.
- Repositorio con 14 descargas y 0 likes: ecosistema de validación muy limitado, sin revisión independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/padiredd/pick-cube-lime-sim-250-board-3cam-heavyaug-sn1deg-dp
- LeRobot (librería): no disponible en la información proporcionada
- Isaac Lab / Cyclo Lab: no disponible en la información proporcionada
- Paper o blog del autor: no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada
