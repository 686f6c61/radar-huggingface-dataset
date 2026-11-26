# joonyeongs/cosmos3-edge-policy-droid-pyrua-sol-fixed-150-first10-plus-codex-review-phase-90-full-ft-1k

## Resumen

Este repositorio contiene un ajuste fino (fine-tuning) completo del modelo de política robótica `nvidia/Cosmos3-Edge-Policy-DROID`, desarrollado por el usuario `joonyeongs` sobre la infraestructura y el recetario RoboLab DROID de NVIDIA. El modelo resultante es un modelo de política visomotora (vision-language-action, VLA) orientado a la generación de trayectorias de acciones de robot a partir de observaciones visuales e instrucciones en lenguaje natural. Con 3.859.003.312 parámetros (~3,86 mil millones), se trata de un modelo de borde (edge) pensado para despliegue en entornos robóticos con recursos acotados.

El ajuste se realizó sobre un subconjunto de demostraciones del dataset DROID (las primeras 10 demostraciones por tarea, 60 episodios en total) más un dataset de revisión de fase con 90 episodios, fusionados en una única vista de trayectorias completas. El entrenamiento consistió en 1.000 pasos de actualización con un batch global de 64 sobre 2 GPUs A100-80GB durante 7,2 horas, con una tasa de aprendizaje de 2e-05 y un calentamiento lineal de 50 pasos.

La relevancia de este modelo es doble: por un lado, demuestra el flujo de trabajo de ajuste fino completo sobre la familia Cosmos3 de NVIDIA para robótica; por otro, su naturaleza experimental (0 descargas, sin evaluación de éxito en bucle cerrado publicada) lo convierte en un artefacto de investigación más que en un modelo listo para producción. La model card incluye únicamente una comprobación de exportación basada en error absoluto medio (MAE) de las acciones predichas frente a las demostradas, no una medida de éxito de tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de política visomotora Cosmos3 (transformer, familia Cosmos3-Omni); no se detalla la configuración interna |
| Parametros totales | 3.859.003.312 (~3,86 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantización publicada) |
| Idiomas soportados | no disponibles |
| Licencia | OpenMDW License 1.1 (openmdw1.1-license) |
| Formato de pesos | safetensors (repo de 9,2 GB) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Cosmos3 de NVIDIA, concretamente en la variante `Cosmos3-Edge-Policy-DROID`, un modelo de política para robótica que combina una torre de comprensión (understanding tower) con un generador de acciones. El ajuste fino realizado por `joonyeongs` congela la torre de comprensión (con caché de claves/valores de texto) y entrena todos los pesos del lado del generador, es decir, un ajuste fino completo del generador. La generación de acciones produce fragmentos (chunks) de 32 pasos de posiciones articulares.

El entrenamiento se llevó a cabo con el recetario RoboLab DROID sobre el dataset `droid_plus_lerobot_640x360_20260412`, restringido a las primeras 10 demostraciones por tarea del dataset `joonyeongs/cosmos3-edge-pyrua-sol-fixed-150` (60 episodios) más el dataset de revisión de fase `joonyeongs/cosmos3-edge-first10ft400-codex-review-phase-pyrua-sol-fixed-90` (90 episodios), fusionados mediante `tools/merge_lerobot_v3.py` con ventanas de trayectoria completa muestreadas uniformemente. Se realizaron 1.000 actualizaciones con batch global 64 (2 GPUs × 32 × acumulación 1), tasa de aprendizaje 2e-05, calentamiento lineal de 50 pasos y decaimiento lineal hasta 0, con checkpoints cada 250 pasos. El entrenamiento se ejecutó en 2× A100-80GB durante 7,2 horas. No se menciona el uso de RLHF ni DPO; el proceso es un ajuste fino supervisado sobre demostraciones.

## Capacidades

- Generación de acciones robóticas: predice fragmentos de 32 pasos de posiciones articulares a partir de observaciones visuales e instrucciones de tarea.
- Comprensión visomotora: procesa imágenes de cámara y texto de instrucción para producir políticas de control.
- Ejecución de tareas de manipulación: las tareas de ejemplo incluyen "guardar el lagarto en la papelera", "poner la comida enlatada en la papelera gris", "apilar bloques en orden de color" y "poner todas las cosas rojas en la papelera gris".
- Servicio mediante servidor de políticas RoboLab: se despliega con `action_policy_server_robolab` en el puerto 8000, con formato de prompt JSON y guiado entre pasos 960 y 1001.
- Control de pinza (gripper): requiere el volteo de pinza por defecto (no pasar `--no-flip-gripper`).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad general; el modelo está especializado en control robótico.
- Capacidades multilingües: no disponibles (no se documentan idiomas).

## Casos de uso

- Evaluación de políticas robóticas en RoboLab: el modelo se sirve con `action_policy_server_robolab` para su evaluación en el entorno RoboLab, permitiendo comparar políticas ajustadas sobre DROID en tareas de manipulación estandarizadas.
- Investigación en ajuste fino de modelos VLA: sirve como referencia reproducible del flujo de ajuste completo del generador sobre Cosmos3-Edge-Policy-DROID, con hiperparámetros, hardware y código documentados.
- Manipulación de objetos en entornos de laboratorio: las tareas de ejemplo (apilar bloques, clasificar objetos por color, depositar objetos en papeleras) son representativas de escenarios de pick-and-place que el modelo puede abordar en bucle abierto o cerrado.
- Generación de trayectorias articulares para control de brazos robóticos: el modelo produce chunks de 32 pasos de posiciones articulares, adecuados para controladores de bajo nivel que interpolan o ejecutan dichas trayectorias.
- Estudio de la brecha entre error de imitación y éxito de tarea: la model card reporta MAE de exportación (0,1057 de media) sin evaluación de éxito en bucle cerrado, lo que lo convierte en un caso de estudio sobre métricas proxy en robótica.
- Base para ajustes posteriores con más datos: al estar restringido a 10 demostraciones por tarea, es un punto de partida para experimentos de escalado de datos (más episodios, más tareas) sobre la misma receta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card incluye únicamente una comprobación de exportación que compara las acciones predichas (chunks de 32 pasos de posiciones articulares) con las acciones demostradas, medida como error absoluto medio (MAE) en radianes. El autor indica explícitamente que **no es una medida de éxito de tarea**.

| Episodio | Fotograma | Tarea | MAE (rad) |
|---|---|---|---|
| 0 | 0 | Put the lizard away in the bin | 0.0936 |
| 0 | 69 | Put the lizard away in the bin | 0.0462 |
| 25 | 0 | Put the canned food in the grey bin | 0.0428 |
| 25 | 60 | Put the canned food in the grey bin | 0.0386 |
| 50 | 0 | Stack the blocks in the order from bottom to top: red, blue, green, yellow | 0.2277 |
| 50 | 292 | Stack the blocks in the order from bottom to top: red, blue, green, yellow | 0.0630 |
| 75 | 0 | Put all the red things in the grey bin | 0.2211 |
| 75 | 225 | Put all the red things in the grey bin | 0.1127 |
| | | **Media** | **0.1057** |

El éxito en bucle cerrado en RoboLab no ha sido evaluado todavía.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 3,86 mil millones de parámetros en safetensors (9,2 GB de repo), la inferencia en precisión completa requiere aproximadamente 8-10 GB de VRAM solo para pesos, más memoria para activaciones y el servidor de políticas.
- GPU recomendadas: el entrenamiento se realizó en 2× A100-80GB (7,2 h). Para inferencia, una A100 o H100 ofrece margen holgado; una RTX 4090 (24 GB) podría ser suficiente para servir el modelo en precisión completa, aunque no se documenta.
- ¿Cabe en GPU de consumo? Probablemente sí en GPUs de 24 GB o más (RTX 3090/4090), dado el tamaño de ~3,86B parámetros, pero no hay confirmación en la información disponible.
- Opciones de despliegue: servidor de políticas RoboLab (`python -m cosmos_framework.scripts.action_policy_server_robolab`). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (joonyeongs/cosmos3-edge-policy-droid-...) | 3,86B | no disponible | MAE de exportación 0,1057; sin éxito en bucle cerrado | OpenMDW 1.1 | Hugging Face (0 descargas) |
| nvidia/Cosmos3-Edge-Policy-DROID (base) | no disponible | no disponible | no disponible | OpenMDW 1.1 | Hugging Face (NVIDIA) |
| joonyeongs/cosmos3-edge-policy-droid-pyrua-sol-fixed-150-first10-full-ft-400 | no disponible | no disponible | no disponible | no disponible | Hugging Face (mismo autor) |

No se dispone de datos de benchmarks comparables de otros modelos de política VLA de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse sobre un subconjunto reducido de DROID (10 demostraciones por tarea, 60 episodios), el modelo puede sobreajustarse a las condiciones específicas de esas demostraciones.
- Riesgo de alucinación: en modelos de política, el equivalente es la generación de trayectorias no válidas o inseguras; no hay evaluación de éxito en bucle cerrado que cuantifique este riesgo.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están documentados.
- Restricciones de licencia: OpenMDW License 1.1; es necesario revisar los términos para uso comercial, ya que la licencia se hereda del modelo base de NVIDIA.
- Caveat de producción: el autor indica explícitamente que la comprobación de exportación (MAE) no es una medida de éxito de tarea y que el éxito en bucle cerrado en RoboLab no se ha evaluado. Con 0 descargas y 0 likes, es un artefacto experimental sin validación externa.
- Dependencia de la receta RoboLab: el despliegue requiere el servidor de políticas RoboLab y el volteo de pinza por defecto; el uso de `--no-flip-gripper` puede degradar el comportamiento.
- El dataset secundario de revisión de fase puede no estar subido a Hugging Face; el entrenamiento depende de un hook de espera (`tools/wait_prepare_dataset.sh`) que podría fallar si el dataset no está disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joonyeongs/cosmos3-edge-policy-droid-pyrua-sol-fixed-150-first10-plus-codex-review-phase-90-full-ft-1k
- Modelo base: https://huggingface.co/nvidia/Cosmos3-Edge-Policy-DROID
- Repositorio de código de entrenamiento: https://github.com/joonyeongs/cosmos-framework/tree/robolab-droid-train-edge-privileged-phases (rama `robolab-droid-train-edge-privileged-phases`, commit de entrenamiento `95bad15`)
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Dataset principal: https://huggingface.co/datasets/joonyeongs/cosmos3-edge-pyrua-sol-fixed-150 (referenciado en la model card)
- Dataset de revisión de fase: joonyeongs/cosmos3-edge-first10ft400-codex-review-phase-pyrua-sol-fixed-90 (referenciado; puede no estar subido)
- Dataset de entrenamiento previo: joonyeongs/cosmos3-edge-policy-droid-pyrua-sol-fixed-150-first10-full-ft-400 (referenciado)
