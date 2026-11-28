# azarath-faisal/reality-check-ur12e-pi05

## Resumen

Reality Check Learn es una familia de checkpoints de visión-lenguaje-acción (VLA) derivados de `lerobot/pi05_base`, el modelo generalista π0.5 de Physical Intelligence publicado por Hugging Face LeRobot. El autor, azarath-faisal, los ha ajustado fino para una tarea concreta de manipulación robótica: la clasificación y el encaje de fijaciones (fasteners) con un brazo Universal Robots UR12e equipado con pinza Robotiq 2F-140. El modelo combina un backbone PaliGemma-3B con un experto de acción Gemma-300M entrenado mediante flow matching, más cabezas de valor y Q para autocrítica.

La relevancia de estos checkpoints es doble. Por un lado, demuestran el flujo completo de adaptación de un VLA generalista a un robot y una tarea específicos usando solo cuatro imágenes (vista izquierda, derecha, muñeca y objetivo), instrucciones en lenguaje natural y un estado articular de 13 dimensiones bajo dominio aleatorizado de 6 ejes. Por otro, incluyen tres variantes con estrategias de entrenamiento distintas (SFT corto, SFT largo y RL con autocrítica), lo que permite estudiar cómo escala el rendimiento con los pasos de entrenamiento y con el refinamiento por refuerzo.

El repositorio ocupa 20,3 GB e incluye pesos en bf16 con media exponencial móvil (EMA), estadísticas de normalización y configuraciones, pero omite los estados completos del optimizador Adam. Es un artefacto de investigación orientado a reproducir la competición de referencia, no un modelo listo para producción general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA: PaliGemma-3B (visión-lenguaje) + experto de acción Gemma-300M con flow matching + cabezas Value/Q de autocrítica |
| Parametros totales | no disponible (backbone de 3B + experto de 300M, sin recuento total publicado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible (instrucciones en lenguaje natural, idioma no especificado) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`ema_latest.pt`, ~6,3 GiB por checkpoint, bf16) |

## Arquitectura y entrenamiento

El modelo parte de `lerobot/pi05_base` y conserva su diseño híbrido: un backbone de visión-lenguaje PaliGemma de 3B parámetros que procesa cuatro imágenes (`left_rgb`, `right_rgb`, `wrist_rgb`, `goal_rgb`) junto con la instrucción en lenguaje natural, y un experto de acción Gemma de 300M parámetros que genera las acciones mediante flow matching. Sobre esta base se añaden cabezas de valor y Q que actúan como autocrítico, permitiendo puntuar y clasificar trayectorias candidatas. La entrada de estado es un vector articular de 13 dimensiones y la salida se integra a través de un adaptador de competición con paso temporal de 0,05 s.

El ajuste fino se realizó sobre el dataset `azarath-faisal/reality-check-ur12e-fasteners-4img` con tres configuraciones. La variante v1 usó 3.500 pasos de SFT sobre 640 episodios (`challenge_fasteners_v1`), con pérdida que bajó de 1,2054 a 0,0371. La v2 amplió a 8.500 pasos sobre los 1.267 episodios de máxima aleatorización de dominio de v1 y v2, con pérdida mínima de 0,0341. La v3 aplicó dos rondas de RL en bucle cerrado (48 rollouts por ronda) más 62 recuperaciones de aleatorización milimétrica, alcanzando 10.100 pasos y calibrando la cabeza de valor de éxito de 0,99 a 0,01. Todo el entrenamiento se ejecutó bajo dominio aleatorizado de 6 ejes con escala `dr_scale=0.5` en la evaluación de referencia.

## Capacidades

- Manipulación robótica de precisión: clasificación y encaje de fijaciones con el brazo UR12e y pinza Robotiq 2F-140.
- Percepción multi-vista: procesa simultáneamente cuatro imágenes (izquierda, derecha, muñeca y objetivo).
- Seguimiento de instrucciones en lenguaje natural para definir la tarea.
- Generación de acciones articulares de 13 dimensiones mediante flow matching.
- Autocrítica y ranking de trayectorias: las cabezas Value/Q permiten puntuar candidatos y aplicar best-of-N (BoN=4 en la variante v3).
- Recuperación ante perturbaciones: la variante v3 incluye recuperaciones bajo aleatorización milimétrica.
- Ajuste fino adicional sobre simulador oficial con un solo comando y reinicio opcional de la cabeza de acción.
- No se documentan capacidades de tool calling, agentes multi-paso, visión general, audio ni razonamiento simbólico fuera del bucle robótico.

## Casos de uso

- Clasificación y encaje de fijaciones en línea de montaje: el checkpoint v1 es el más adecuado para una pasada única de encaje, con 94,96 puntos y 8,55 s en la tarea #0 del benchmark de referencia.
- Base para ajuste fino en simulador de competición: el checkpoint v2 se recomienda explícitamente como punto de partida por su equilibrio entre rendimiento público (3,42) y oculto (2,64), con 5 de 8 tareas alcanzadas o agarradas.
- Investigación en aprendizaje por refuerzo robótico: la variante v3 permite estudiar el efecto de rondas de RL en bucle cerrado y la calibración de la cabeza de valor de éxito.
- Ranking de trayectorias con best-of-N: usar las cabezas Value/Q para seleccionar entre varias acciones candidatas generadas por el experto de flow matching, como en la configuración `CFG=1.35, BoN=4`.
- Evaluación de robustez ante aleatorización de dominio: los tres checkpoints permiten comparar el comportamiento bajo `dr_scale=0.5` y perturbaciones milimétricas.
- Reproducción de resultados de competición: el adaptador `CompetitionPolicyAdapter` de cinco líneas facilita integrar el modelo en el pipeline oficial de evaluación.
- Prototipado de políticas VLA en investigación académica: el repositorio incluye scripts de descarga, ajuste fino y entrenamiento en Modal, lo que reduce la fricción para experimentar con π0.5 en un robot concreto.

## Benchmarks y rendimiento

Los resultados publicados en la model card corresponden a un benchmark propio de 8 tareas (4 públicas y 4 ocultas) con `dr_scale=0.5`. No son comparables directamente con MMLU, HumanEval o GSM8K, que no se han evaluado.

| Checkpoint | Pasos | Pérdida | Total comp. | Público | Oculto | Tareas superadas |
|---|---|---|---|---|---|---|
| `ur12e_pi05_challenge_v1_sft` | 3.500 SFT | 1,2054 → 0,0371 | 14,15 | 25,10 | 2,13 | 1/8 (tarea #0: 94,96 pts, 8,55 s, prec=0,754, RDS=0,920) |
| `ur12e_pi05_challenge_v2_sft` | 8.500 SFT | mín. 0,0341 | 3,70 | 3,42 | 2,64 | 5/8 alcanzadas/agarradas, incl. ocultas #4 y #5 |
| `ur12e_pi05_challenge_v3_rl` | 10.100 (2 rondas RL) | no disponible | 2,26 (CFG=1,0) / 1,92 (CFG=1,35, BoN=4) | no disponible | salto 5× en tarea oculta de 2 partes #7 (4,67) | no disponible |

La métrica "Total Comp." es una puntuación de competición definida por el autor; un valor menor parece indicar mejor rendimiento agregado, aunque la model card no explicita la dirección de la métrica. La tarea #0 de v1 destaca por una precisión de 0,754 y un RDS de 0,920.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Cada checkpoint pesa ~6,3 GiB en bf16, por lo que se necesita al menos esa cantidad solo para los pesos, más memoria para activaciones y las cuatro imágenes de entrada.
- GPU recomendadas: no especificadas por el autor. Por tamaño (backbone de 3B + experto de 300M), una GPU con 16-24 GB de VRAM (RTX 4090, A10G, L4) debería ser suficiente para inferencia en bf16; para entrenamiento o ajuste fino se recomiendan A100 o H100.
- Cabe en GPU de consumo: previsiblemente sí en RTX 4090 (24 GB) y posiblemente en GPUs de 16 GB con cuantización, aunque no se documentan cuantizaciones.
- Opciones de despliegue: el autor proporciona un adaptador propio (`wendy_deploy.competition_adapter.CompetitionPolicyAdapter`) y scripts de entrenamiento/evaluación en Modal. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un VLA de este tipo.
- Latencia y throughput: el benchmark reporta 8,55 s por pasada en la tarea #0 de v1, con paso temporal de 0,05 s en el adaptador. No se publican cifras de throughput agregado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Reality Check UR12e π0.5 (este) | 3B + 300M | no disponible | Manipulación UR12e + Robotiq 2F-140 | Apache 2.0 | Hugging Face, 20,3 GB |
| `lerobot/pi05_base` | 3B + 300M | no disponible | VLA generalista | no disponible en la información | Hugging Face |
| Otros VLA de manipulación (p. ej. RT-2, OpenVLA) | no disponible | no disponible | Manipulación generalista | no disponible | no disponible |

La comparación cuantitativa con alternativas no está disponible en la información proporcionada; el único punto de referencia directo es el modelo base `lerobot/pi05_base`, del que este fine-tune hereda arquitectura y licencia.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está ajustado para una tarea y un robot concretos (UR12e + Robotiq 2F-140); no es un VLA generalista.
- Métricas internas: los benchmarks son propios del autor y la dirección de la métrica "Total Comp." no está documentada, lo que dificulta interpretar mejoras entre variantes.
- Sin datos de sesgo, alucinación o robustez lingüística: no se han publicado evaluaciones de sesgo ni de comportamiento fuera de la distribución de entrenamiento.
- Idiomas no especificados: las instrucciones son en lenguaje natural, pero no se declara qué idiomas cubre el modelo.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base `lerobot/pi05_base` puede tener condiciones adicionales que conviene verificar antes de producción.
- Pesos incompletos para reanudar entrenamiento: los estados de Adam (`latest.pt`) se omiten, por lo que solo se puede hacer fine-tuning desde los pesos EMA, no reanudar el entrenamiento original.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni validación externa.
- Fecha de creación futura (2026-11-28) en los metadatos de Hugging Face: conviene verificar la integridad y procedencia del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/azarath-faisal/reality-check-ur12e-pi05
- Dataset: https://huggingface.co/datasets/azarath-faisal/reality-check-ur12e-fasteners-4img
- Repositorio de código: https://github.com/FHL-08/reality_check_learn
- Modelo base: https://huggingface.co/lerobot/pi05_base
