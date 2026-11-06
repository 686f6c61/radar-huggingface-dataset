# padiredd/pick-cube-lime-sim-250-board-3cam-heavyaug-dp

## Resumen

`pick-cube-lime-sim-250-board-3cam-heavyaug-dp` es una política de difusión (diffusion policy) para robótica manipulativa desarrollada por el usuario padiredd y publicada bajo licencia Apache 2.0. El modelo aprende a recoger un bloque verde lima de 5x5x4 cm con orificio pasante situado sobre una mesa gris, utilizando exclusivamente demostraciones simuladas generadas en Isaac Lab (Cyclo Lab) mediante un planificador programado con cinemática inversa. Está pensado para el brazo izquierdo del robot ROBOTIS FFW BG2 y se distribuye en formato LeRobot 0.6.1 (fork lerobot-cyclo de ROBOTIS).

Técnicamente se trata de una diffusion policy con encoder ResNet18 y 287,5 millones de parámetros, entrenada sobre 250 episodios simulados (38.550 fotogramas a 15 fps) con tres cámaras (cabeza izquierda, muñeca izquierda y muñeca derecha) reescaladas a 240x240. El espacio de observación tiene 22 dimensiones y el de acción 16, con un horizonte de predicción de 64 pasos y 32 pasos de acción ejecutables.

Su relevancia es acotada pero concreta: sirve como referencia reproducible de un pipeline sim-to-real de manipulación con augmentation agresiva de imagen, y demuestra que una política de difusión entrenada solo en simulación alcanza un 94 % de aciertos en el propio entorno simulado (47/50 episodios) con muestreo DDPM de 100 pasos. No es un modelo de lenguaje ni un modelo multimodal general; es un artefacto de control robótico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion policy (DDPM) con encoder visual ResNet18 |
| Parámetros totales | 287.533.680 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; horizonte de predicción de 64 pasos, 32 pasos de acción, 1 paso de observación |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 1,2 GB, librería lerobot) |

## Arquitectura y entrenamiento

La política sigue el esquema de diffusion policy: un proceso DDPM con 100 pasos de entrenamiento que genera secuencias de acción condicionadas por observaciones visuales y de estado. El encoder visual es una ResNet18 que procesa tres cámaras (cabeza izquierda, muñeca izquierda y muñeca derecha), cada una reescalada a 240x240 con interpolación `cv2.INTER_AREA`. La observación tiene 22 dimensiones y la acción 16; el horizonte es de 64 pasos con 32 pasos de acción ejecutables y un paso de observación.

El entrenamiento se realizó durante 100.000 pasos con batch de 8, Adam con lr 1e-4, betas (0.95, 0.999), weight decay 1e-6, schedule coseno con 500 pasos de warm-up, y pérdida final de 0.001. Los datos provienen de 250 episodios simulados (38.550 fotogramas a 15 fps) recogidos en Isaac Lab con un planificador programado e IK, con el bloque colocado en una caja de 10x10 cm centrada en (x 0.48, y 0.19) m. Se aplicó augmentation de imagen intensiva: ColorJitter, nitidez, affine, perspectiva, blur, erasing y escala de grises. El checkpoint publicado corresponde al paso 100.000.

## Capacidades

- Control manipulativo de un brazo robótico (ROBOTIS FFW BG2, brazo izquierdo) para la tarea de recogida de un bloque con orificio pasante.
- Generación de trayectorias de acción de 32 pasos a partir de observaciones multimodales (tres cámaras y estado de 22 dimensiones).
- Muestreo configurable: DDPM de 100 pasos (calidad máxima) o DDIM de 10 pasos con eta 0 (mayor velocidad, menor precisión).
- Generalización dentro de la caja de entrenamiento de 10x10 cm, con degradación en el borde lejano (x 0.49-0.52 m).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües; no es un modelo de lenguaje.
- No dispone de modo thinking, visión general, audio ni otras capacidades fuera del control robótico.

## Casos de uso

- **Investigación en sim-to-real de manipulación**: usar la política como punto de partida para evaluar transferencia de Isaac Lab a un robot físico FFW BG2, aprovechando que el entrenamiento es puramente simulado y la licencia Apache 2.0 permite modificaciones.
- **Referencia reproducible de diffusion policy**: servir como baseline en experimentos comparativos de políticas de difusión frente a ACT, VLA u otras arquitecturas, dado que el autor documenta hiperparámetros, datos y resultados de evaluación.
- **Ajuste fino con datos reales**: inicializar una política con este checkpoint y hacer fine-tuning con un conjunto pequeño de demostraciones reales del mismo robot, reduciendo el coste de recolección desde cero.
- **Pruebas de robustez ante augmentation**: evaluar cómo afecta el augmentation agresivo (ColorJitter, blur, erasing) a la precisión en el borde de la caja de entrenamiento, un escenario donde el modelo falla (3/50 en DDPM-100).
- **Validación de pipelines LeRobot**: integrar el modelo en flujos de entrenamiento y evaluación de LeRobot 0.6.1 (fork ROBOTIS) para verificar compatibilidad de formatos, checkpoints y scripts de evaluación.
- **Docencia y divulgación en robótica**: emplear el modelo como ejemplo didáctico de diffusion policy aplicada a una tarea de pick-and-place con tres cámaras y estado de 22 dimensiones.
- **Benchmark interno de muestreo**: comparar DDPM-100 frente a DDIM-10 en términos de precisión y latencia en hardware concreto, usando la tabla de evaluación del autor como referencia (94 % vs 86 %).

## Benchmarks y rendimiento

Evaluación en simulación (50 episodios, entorno con tablero, bloque en cualquier punto de la caja de entrenamiento, pose inicial del yaml, semilla 0):

| Muestreador | Éxito (bloque recogido) |
|---|---|
| DDPM-100 (el del checkpoint) | 47/50 (94 %) |
| DDIM-10, eta 0 | 43/50 (86 %) |

Los fallos se concentran en el borde lejano de la caja (x 0.49-0.52 m), donde la pinza cierra corta. No se han publicado resultados de benchmarks en entornos reales ni comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 287,5 M de parámetros y pesos en safetensors (repo de 1,2 GB) es razonable esperar un consumo moderado, pero no se confirma.
- GPU recomendadas: no disponible; el autor no especifica hardware de entrenamiento ni de inferencia.
- Compatibilidad con GPU de consumo: no confirmada; por tamaño de parámetros podría caber en GPUs de consumo, pero no hay datos que lo verifiquen.
- Opciones de despliegue: librería LeRobot 0.6.1 (fork lerobot-cyclo de ROBOTIS); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; el muestreo DDIM-10 frente a DDPM-100 sugiere una reducción de coste computacional, pero no se publican cifras.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otras políticas de difusión, ACT, VLA u otros modelos de robótica, ni datos de parámetros, contexto o rendimiento de alternativas.

## Limitaciones y advertencias

- Modelo específico para una tarea, un robot (ROBOTIS FFW BG2, brazo izquierdo) y un entorno simulado; no es generalizable a otras tareas sin reentrenamiento.
- Entrenado exclusivamente en simulación (Isaac Lab); no hay evidencia publicada de transferencia a hardware real.
- Degradación en el borde lejano de la caja de entrenamiento (x 0.49-0.52 m), donde la pinza cierra corta; 3/50 fallos con DDPM-100.
- Las dimensiones de estado 8-21 (brazo derecho, cabeza, elevación, odometría) son constantes en los datos de entrenamiento; deben fijarse a su punto medio de entrenamiento en inferencia, lo que limita el uso a configuraciones equivalentes.
- Riesgo de sobreajuste al entorno simulado y a la apariencia del bloque y la mesa; el augmentation mitiga parcialmente pero no elimina este riesgo.
- Sin datos sobre sesgos, alucinación o limitaciones idiomáticas: no aplica en el sentido habitual, pero tampoco hay evaluación de robustez fuera de la distribución simulada.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de validación en real y de benchmarks externos desaconseja su uso en producción sin evaluación propia.
- Repositorio con 13 descargas y 0 likes en el momento de la consulta; soporte comunitario limitado.

## Enlaces

- Hugging Face: https://huggingface.co/padiredd/pick-cube-lime-sim-250-board-3cam-heavyaug-dp
- LeRobot: no disponible en la información proporcionada
- Isaac Lab / Cyclo Lab: no disponible en la información proporcionada
- Paper o blog del autor: no disponible en la información proporcionada
