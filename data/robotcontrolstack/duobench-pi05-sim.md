# RobotControlStack/duobench-pi05-sim

## Resumen

DuoBench π0.5 (sim) es una política robótica de tipo vision-language-action (VLA) publicada por RobotControlStack, afinada a partir de `lerobot/pi05_base` para resolver las 11 tareas de manipulación bimanual del benchmark DuoBench en simulación, sobre el montaje de dos brazos Franka Research 3 (FR3 Duo). No es un modelo de lenguaje general: es un modelo de control que recibe tres cámaras (cabeza y muñecas izquierda y derecha, a 224x224) más un vector de estado de 16 dimensiones (2 x 7 articulaciones + 2 pinzas) y emite una acción conjunta de 16 dimensiones.

El modelo se entrenó exclusivamente con datos de simulación: 50 demostraciones por tarea, todas las tareas fusionadas en una única política multi-tarea, durante 40.000 pasos con batch de 16, learning rate 2,5e-5 y chunk de acción de 50. Hereda la arquitectura de π0.5, que se construye sobre PaliGemma (aproximadamente 3B parámetros de base) y añade un cabezal de acciones; el repositorio contiene 4.143.404.816 parámetros en safetensors y ocupa 9,4 GB.

Su relevancia es metodológica más que de rendimiento: sirve como referencia reproducible y como línea base de simulación para DuoBench, y su tasa de éxito media es del 10,6 % sobre 300 rollouts por tarea, con varias tareas a cero. Es útil para investigar generalización multi-tarea, evaluación estandarizada de manipulación bimanual y comparación entre políticas entrenadas en simulación y en el mundo real, no para desplegar en un robot físico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) π0.5, derivada de PaliGemma; política de imitación con chunk de acciones |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica como contexto textual; ventana de observación definida por cámaras y estado) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponibles (modelo de control robótico, sin interfaz de lenguaje) |
| Licencia | Gemma Terms of Use (modelo derivado de Gemma vía PaliGemma) |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

La política sigue el diseño π0.5: un backbone VLM tipo PaliGemma que procesa imágenes y tokens de tarea, acoplado a un cabezal de predicción de acciones que genera secuencias de acciones (action chunking) en lugar de acciones individuales. La entrada combina tres flujos visuales de 224x224 (`head`, `left_wrist`, `right_wrist`) con un estado propioceptivo de 16 dimensiones; la salida es un vector de 16 dimensiones con posiciones de articulaciones y pinzas. El chunk de acción configurado es de 50 pasos.

El entrenamiento se hizo con LeRobot en el commit `c8ce413d`, partiendo de `lerobot/pi05_base` (revisión `9e55186`). Los datos son 50 demostraciones por tarea extraídas de las carpetas `<task>/sim` del dataset `RobotControlStack/duobench`, fusionadas en un único conjunto multi-tarea. Hiperparámetros: 40.000 pasos, batch size 16, learning rate 2,5e-5, semilla 1000. La configuración completa está en `train_config.json`. No se documenta en la información disponible el uso de RLHF, DPO ni etapas de refinamiento posteriores al ajuste supervisado.

## Capacidades

- Control bimanual de dos brazos FR3 en simulación, con acciones de 16 dimensiones (articulaciones y pinzas).
- Política multi-tarea: una sola red cubre las 11 tareas de simulación de DuoBench (ball_maze, bin_sort, block_balance, carry_pot, hinge_chest, join_blocks, pour_marbles, spring_door, transfer_cube, transfer_gate, transfer_reorient).
- Fusión de tres vistas de cámara (cabeza y ambas muñecas) con estado propioceptivo.
- Predicción por chunks de 50 acciones, orientada a ejecución continua en bucle de control.
- Condicionamiento por tarea mediante el formato de entrada de LeRobot/π0.5.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico ni generación de texto libre; no es un modelo conversacional.
- Capacidades multilingües: no aplicables.

## Casos de uso

- Línea base reproducible para DuoBench: permite comparar nuevas políticas bimanuales contra una referencia pública con protocolo de evaluación fijo (300 rollouts por tarea, semillas 0-299, intervalo de Wilson al 95 %).
- Investigación en generalización multi-tarea: al estar entrenada con todas las tareas fusionadas, sirve para estudiar interferencia entre tareas y transferencia entre habilidades de manipulación.
- Estudio de sim-to-real: el modelo está entrenado solo en simulación y su limitación explícita es no ser apto para robot real, por lo que es un punto de partida natural para analizar la brecha sim-real frente a variantes entrenadas con datos reales.
- Evaluación de pipelines de entrenamiento en LeRobot: el `train_config.json` y el commit fijado permiten reproducir el ajuste y medir el efecto de cambios en hiperparámetros, datos o aumentación.
- Docencia y prototipado en robótica: un modelo de 4,1B parámetros en safetensors (9,4 GB) se puede cargar en un servidor con una sola GPU para experimentar con políticas VLA sin acceso a hardware físico.
- Análisis de fallos por tarea: las tareas con éxito nulo (block_balance, join_blocks, pour_marbles) son casos de estudio útiles para diagnosticar dónde falla la política y diseñar currículos o datos adicionales.
- Comparación de arquitecturas VLA: permite contrastar π0.5 con otras políticas (por ejemplo, ACT o Diffusion Policy) bajo el mismo benchmark y el mismo conjunto de demostraciones.

## Benchmarks y rendimiento

Tasa de éxito (%) en simulación DuoBench, 300 rollouts por tarea (semillas 0-299), con intervalo de confianza del 95 % (Wilson):

| Tarea | Éxito (%) | IC 95 % |
|---|---|---|
| ball_maze | 5,0 | [3,1; 8,1] |
| bin_sort | 1,7 | [0,7; 3,8] |
| block_balance | 0,0 | [0,0; 1,3] |
| carry_pot | 26,0 | [21,4; 31,2] |
| hinge_chest | 26,7 | [22,0; 31,9] |
| join_blocks | 0,0 | [0,0; 1,3] |
| pour_marbles | 0,0 | [0,0; 1,3] |
| spring_door | 19,7 | [15,6; 24,5] |
| transfer_cube | 13,0 | [9,7; 17,3] |
| transfer_gate | 23,3 | [18,9; 28,4] |
| transfer_reorient | 1,3 | [0,5; 3,4] |
| **Media** | **10,6** | no disponible |

No se han publicado en la información disponible resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros), ni comparaciones numéricas con políticas alternativas dentro del propio DuoBench.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4,14B parámetros en precisión nativa (bf16/fp16), en torno a 8-9 GB solo para pesos, más overhead de activaciones y de los tres flujos de imagen; en la práctica, 12-16 GB de VRAM es un punto de partida razonable.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 6000 Ada para evaluación a gran escala con muchos rollouts en paralelo; RTX 4090 (24 GB) para inferencia individual.
- GPU de consumo: cabe en RTX 4090 y, probablemente, en GPUs de 16 GB con cuantización; no se documentan pesos cuantizados en el repositorio, por lo que habría que generarlos.
- Opciones de despliegue: LeRobot en el commit `c8ce413d` es el requisito explícito; el uso de vLLM, TGI o llama.cpp no está soportado ni documentado para esta política.
- Latencia y throughput: no disponibles en la información proporcionada. La latencia vendrá dominada por el coste del backbone VLM y por el bucle de simulación, no por el tamaño del cabezal de acciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entradas | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DuoBench π0.5 (sim) | 4,14B | 3 cámaras 224x224 + estado 16-D | 10,6 % medio en DuoBench sim | Gemma Terms of Use | HuggingFace, LeRobot |
| `lerobot/pi05_base` | no disponible en la información | no disponible | no disponible | no disponible | HuggingFace |
| Otras políticas de DuoBench (sim) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de resultados numéricos de políticas alternativas sobre el mismo benchmark, por lo que la comparación cuantitativa con ACT, Diffusion Policy u otras variantes de π0.5 no está disponible.

## Limitaciones y advertencias

- Entrenado exclusivamente con datos de simulación; el autor indica explícitamente que no está pensado para el robot real.
- Rendimiento bajo: media del 10,6 % de éxito y tres tareas con 0,0 % (block_balance, join_blocks, pour_marbles); no es una política lista para producción.
- Requiere una versión de LeRobot compatible con el commit `c8ce413d`; versiones distintas pueden romper la carga del modelo.
- Licencia Gemma Terms of Use: es un modelo derivado de Gemma (vía PaliGemma) y está sujeto a la Gemma Prohibited Use Policy, con obligaciones de atribución y restricciones de uso comercial que deben revisarse antes de cualquier despliegue.
- Sesgos conocidos: no documentados en la información disponible; al entrenarse con 50 demostraciones por tarea, es esperable un fuerte sobreajuste a las trayectorias y condiciones de esas demostraciones.
- Riesgo de alucinación en el sentido de acciones plausibles pero incorrectas: la política puede generar trayectorias que parecen razonables y fallar en la tarea, como reflejan las tasas de éxito.
- Limitaciones de idioma: no aplica interfaz de lenguaje; el condicionamiento por tarea depende del formato de entrada de LeRobot.
- Sin cuantizaciones publicadas ni métricas de latencia, lo que complica la planificación de despliegues con requisitos estrictos de tiempo real.
- El repositorio tiene muy poca tracción (11 descargas, 0 likes) y fue creado y actualizado el mismo día; conviene verificar la reproducibilidad de los resultados antes de usarlo como referencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RobotControlStack/duobench-pi05-sim
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset DuoBench: https://huggingface.co/datasets/RobotControlStack/duobench
- Página del proyecto DuoBench: https://duobench.github.io/
- Código de DuoBench: https://github.com/RobotControlStack/duobench
- Paper DuoBench (arXiv): https://arxiv.org/abs/2606.11901
- LeRobot: https://github.com/huggingface/lerobot
- Commit de LeRobot usado en el entrenamiento: https://github.com/huggingface/leerobot/tree/c8ce413d738da15a2eed2d0832315779ea28cbf9
- PaliGemma (base arquitectónica): https://huggingface.co/google/paligemma-3b-pt-224
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
