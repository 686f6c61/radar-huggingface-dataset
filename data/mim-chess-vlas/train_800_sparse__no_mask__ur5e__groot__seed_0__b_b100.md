# mim-chess-vlas/train_800_sparse__no_mask__ur5e__groot__seed_0__b_b100

## Resumen

`train_800_sparse__no_mask__ur5e__groot__seed_0__b_b100` es una política de robótica entrenada mediante imitación con LeRobot sobre el modelo fundacional GR00T N1.7 de NVIDIA. El modelo resuelve una tarea concreta de manipulación pick-and-place sobre un brazo UR5e: recoger un objeto y depositarlo dentro de una caja. Se distribuye como un checkpoint de 3.144.016.000 parámetros en formato safetensors, con un repositorio de 50,3 GB.

El checkpoint es un ajuste específico (fine-tuning) sobre la arquitectura GR00T N1.7, que combina un backbone visión-lenguaje Cosmos-Reason2/Qwen3-VL con un transformer de acciones basado en flow matching. La política consume tres cámaras (vista de agente y dos cámaras en la muñeca), el estado propioceptivo del robot y una instrucción en lenguaje natural, y produce un vector de acción de 7 dimensiones.

Es relevante como ejemplo reproducible de entrenamiento de un VLA (vision-language-action) sobre hardware asequible: 739 episodios y 182.078 fotogramas a 20 FPS, entrenados en 60.000 pasos con batch de 16. La licencia Apache 2.0 facilita su reutilización, aunque el modelo está atado a la morfología UR5e y al conjunto de objetos del dataset.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7: backbone VLM Cosmos-Reason2/Qwen3-VL + transformer de acciones con flow matching |
| Parametros totales | 3.144.016.000 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea están en inglés en el dataset) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño de GR00T N1.7: un backbone visión-lenguaje (Cosmos-Reason2/Qwen3-VL) que procesa las tres cámaras a resolución 3×224×224 junto con la instrucción de tarea, y un transformer de acciones que predice el vector de acción de 7 dimensiones mediante flow matching, condicionado además por el estado propioceptivo de 9 dimensiones. Es un modelo cross-embodiment en su forma original, aunque este checkpoint está especializado en un UR5e.

El entrenamiento se realizó con LeRobot 0.6.0 sobre el dataset `mim-chess-vlas/train_800_sparse__no_mask__ur5e`: 739 episodios, 182.078 fotogramas a 20 FPS, con 40 tareas distintas de tipo "Pick the X and place it into the box". La configuración fue de 60.000 pasos, batch size 16, optimizador AdamW y learning rate 7e-05, con semilla 0. No se especifica en la información disponible si hubo RLHF, DPO ni el número de tokens de entrenamiento del backbone.

## Capacidades

- Manipulación robótica pick-and-place: predice acciones de 7 grados de libertad para recoger un objeto y depositarlo en una caja.
- Control multimodal: integra tres vistas de cámara (agente y dos en la muñeca) más propiocepción de 9 dimensiones.
- Condicionamiento por lenguaje natural: acepta instrucciones de tarea en inglés del tipo "Pick the jam and place it into the box".
- Generalización a 40 categorías de objetos del dataset (alimentos, utensilios, electrodomésticos, menaje).
- Ejecución de políticas en tiempo real a 20 FPS sobre hardware UR5e mediante `lerobot-rollout`.
- No se documentan capacidades de tool calling, agentes multi-paso, visión general, audio ni modo thinking; es una política de acción, no un asistente conversacional.

## Casos de uso

- Automatización de picking en almacén: la política puede recoger objetos de una mesa y colocarlos en una caja, adecuada para líneas de clasificación con un UR5e y cámaras fijas más dos en muñeca.
- Baseline reproducible para investigación en VLA: sirve como referencia entrenada con semilla fija y configuración documentada para comparar variantes de datasets (sparse vs. denso, con o sin máscara).
- Prototipado de manipulación en laboratorio: al ser Apache 2.0 y estar integrado en LeRobot, permite desplegar y evaluar rápidamente sobre un UR5e real sin coste de licencia.
- Generación de datos sintéticos y aumento de dataset: el checkpoint puede usarse para etiquetar o filtrar episodios nuevos de pick-and-place antes de reentrenar.
- Evaluación de robustez ante cambios de objeto: con 40 categorías entrenadas, permite medir la degradación al introducir objetos fuera de distribución en el mismo escenario.
- Educación y formación en robótica: ejemplo completo de pipeline LeRobot (grabación, entrenamiento, rollout) con comandos públicos y dataset visualizable.
- Investigación en flow matching para acciones: base para estudiar la calidad de las trayectorias generadas frente a políticas de regresión directa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 3.144 millones de parámetros, en fp16 el peso ronda los 6,3 GB y en bf16 similar, pero el repositorio de 50,3 GB sugiere que incluye estados de optimizador u otros artefactos de entrenamiento.
- GPU recomendadas: no disponible; por tamaño, una GPU con 16-24 GB (RTX 4090, A10, L4) debería alojar los pesos en precisión reducida, aunque no hay confirmación del autor.
- Cabe en GPU de consumo: probablemente sí en RTX 4090 y RTX 3090 por tamaño de pesos, sin dato oficial de consumo real.
- Opciones de despliegue: LeRobot (`lerobot-rollout`) es la vía documentada; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: el dataset está a 20 FPS y el rollout se ejecuta con `--duration=60`, pero no se publican cifras de latencia por inferencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (GR00T N1.7 fine-tuned, UR5e) | 3.144.016.000 | no disponible | Pick-and-place UR5e | Apache 2.0 | Hugging Face, LeRobot |
| GR00T N1.7 base (NVIDIA) | no disponible en la información | no disponible | Modelo fundacional cross-embodiment | no disponible en la información | GitHub NVIDIA/Isaac-GR00T |
| Otras políticas LeRobot del mismo autor | no disponible | no disponible | Variantes de dataset/seed | Apache 2.0 (según repo) | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos comparables en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: entrenado solo para pick-and-place de 40 objetos concretos sobre UR5e; no se espera generalización a otras tareas, morfologías o disposiciones de cámara.
- Dependencia de hardware: requiere un UR5e y la configuración exacta de tres cámaras (`agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2`) para funcionar como se documenta.
- Riesgo de sobreajuste al dataset: 739 episodios y 60.000 pasos con semilla 0; la variabilidad entre ejecuciones no está caracterizada.
- Idiomas: las instrucciones de tarea están en inglés; no hay soporte multilingüe documentado.
- Sin datos de benchmarks ni de evaluación en hardware real publicados en la información disponible, por lo que el rendimiento en producción es incierto.
- Riesgo de fallo ante objetos, iluminación o fondos fuera de distribución; no se documentan mecanismos de recuperación ante errores.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de garantías y de evaluación formal exige validación propia antes de desplegar.
- El tamaño del repositorio (50,3 GB) implica costes de almacenamiento y descarga considerables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mim-chess-vlas/train_800_sparse__no_mask__ur5e__groot__seed_0__b_b100
- Dataset de entrenamiento: https://huggingface.co/datasets/mim-chess-vlas/train_800_sparse__no_mask__ur5e
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=mim-chess-vlas/train_800_sparse__no_mask__ur5e
- Repositorio GR00T de NVIDIA: https://github.com/NVIDIA/Isaac-GR00T
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Guía LeRobot para GR00T: https://huggingface.co/docs/lerobot/main/en/groot
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
