# castanetnicolas/diffusion_UR5e_BS_128_H_16_TASK_three_piece_assembly_ID_163713

## Resumen

`castanetnicolas/diffusion_UR5e_BS_128_H_16_TASK_three_piece_assembly_ID_163713` es una política de control visuomotor entrenada con el algoritmo Diffusion Policy y publicada mediante la librería LeRobot de Hugging Face. No es un modelo de lenguaje: es un modelo de robótica que, a partir de dos imágenes de cámara y del estado de las articulaciones del robot, genera una trayectoria de acciones de 7 dimensiones para ejecutar una tarea de ensamblaje de tres piezas. El autor es el usuario de Hugging Face `castanetnicolas` y la licencia es Apache 2.0.

El modelo trata el control visuomotor como un proceso generativo de difusión: en lugar de predecir una única acción, genera secuencias de acciones multimodales y suaves, lo que resulta especialmente útil en tareas de manipulación con contacto físico rico. Está entrenado específicamente para la tarea "Insert the first piece into the base, then insert the second piece on top of it" sobre el dataset `mimicgen_three_piece_assembly_d1_image84`.

Su relevancia es acotada y práctica: sirve como referencia reproducible de un pipeline de imitation learning con LeRobot 0.6.1 sobre un robot tipo `panda` (aunque el identificador del repo menciona UR5e), con 200 episodios y 67.101 frames a 20 FPS. El repositorio ocupa 1,1 GB y contiene 278.014.699 parámetros en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (política de difusión para control visuomotor) |
| Parametros totales | 278.014.699 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación de 2 imágenes y estado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La política sigue el enfoque Diffusion Policy descrito en el paper arXiv:2303.04137: modela la distribución de trayectorias de acción como un proceso de difusión condicionado por las observaciones. La entrada son dos imágenes RGB de 3×84×84 píxeles (`agentview` y `robot0_eye_in_hand`) más un vector de estado de 9 dimensiones; la salida es un vector de acción de 7 dimensiones. El modelo se entrenó con 200.000 pasos, batch size 128, optimizador Adam, learning rate 0,0001 y semilla 1000, usando LeRobot 0.6.1.

El dataset de entrenamiento es `castanetnicolas/mimicgen_three_piece_assembly_d1_image84`, con 200 episodios, 67.101 frames a 20 FPS. No se documenta en la model card el número total de tokens ni si hubo etapas de RLHF o DPO (no aplica en este tipo de modelo). Tampoco se detalla ninguna innovación técnica adicional más allá del propio esquema de difusión para generación de trayectorias.

## Capacidades

- Generación de trayectorias de acción multimodales y suaves para manipulación robótica con contacto.
- Control visuomotor a partir de dos vistas de cámara (vista externa y vista en la muñeca del robot).
- Ejecución de la tarea concreta de ensamblaje de tres piezas descrita en el dataset.
- Integración con el ecosistema LeRobot mediante el comando `lerobot-rollout`.
- Entrenamiento reproducible con `lerobot-train` a partir del mismo dataset.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes ni razonamiento multi-paso en el sentido de LLM.
- No tiene capacidades multilingües ni de generación de texto, visión general, audio o thinking mode.

## Casos de uso

- **Ensamblaje de precisión en línea de producción**: la política ejecuta la inserción secuencial de dos piezas sobre una base, tarea de contacto rico donde la generación de trayectorias por difusión reduce los picos bruscos de acción. Adecuada para celdas de montaje con robot tipo `panda` y dos cámaras calibradas.
- **Banco de pruebas de imitation learning**: sirve como referencia reproducible para validar pipelines de LeRobot 0.6.1 con un dataset MimicGen de 200 episodios y 67.101 frames, útil en laboratorios que comparan algoritmos de imitation learning.
- **Investigación en manipulación con contacto**: el esquema de difusión está pensado para tareas donde la política debe modelar distribuciones multimodales de acción; este checkpoint permite reproducir experimentos de ensamblaje con dos piezas.
- **Prototipado rápido con hardware estándar**: al tener 278 M de parámetros y pesos safetensors de 1,1 GB, se puede desplegar en una estación de trabajo con GPU consumer para pruebas de laboratorio, sin necesidad de clústeres.
- **Evaluación de robustez ante variaciones de cámara**: permite estudiar cómo afectan cambios de iluminación, posición de objetos o distracciones en una tarea de ensamblaje concreta, aunque el autor no ha publicado tasas de éxito.
- **Generación de datos sintéticos y aumento de dataset**: el checkpoint entrenado puede usarse como política base para generar nuevas trayectorias en simulador o en robot real y ampliar el dataset original con nuevas variaciones de la tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible de forma oficial; con 278 M de parámetros en safetensors (fp32), el peso ronda 1,1 GB y la inferencia cabe holgadamente en GPUs con 8 GB o más, aunque no se documenta el consumo exacto.
- **GPU recomendadas**: no especificadas por el autor; por tamaño, una RTX 4090, RTX 3090, A100 o H100 son suficientes. Una GPU consumer de gama media con 8-12 GB debería bastar para inferencia.
- **¿Cabe en GPU consumer?**: sí, por el tamaño del modelo (278 M de parámetros), aunque no hay confirmación oficial de latencias.
- **Opciones de despliegue**: LeRobot (`lerobot-rollout`) es el método documentado. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `castanetnicolas/diffusion_UR5e_BS_128_H_16_TASK_three_piece_assembly_ID_163713` | 278.014.699 | 2 imágenes 3×84×84 + estado (9,) | Ensamblaje de tres piezas | Apache 2.0 | Hugging Face / LeRobot |
| Diffusion Policy original (Chi et al., 2023) | no disponible | Configurable | Manipulación visuomotora general | no disponible | Paper + código de referencia |
| Otras políticas LeRobot del mismo autor | no disponible | no disponible | Otras tareas MimicGen | Apache 2.0 (presumible) | Hugging Face |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La política está entrenada para una única tarea ("Insert the first piece into the base, then insert the second piece on top of it") y no generaliza a otras tareas sin reentrenamiento.
- No hay resultados de evaluación publicados: se desconoce la tasa de éxito real en robot físico.
- El identificador del repositorio menciona `UR5e`, pero la model card declara `robot type: panda`; conviene verificar la correspondencia del hardware antes de desplegar.
- Requiere que los nombres de cámara y las claves de observación coincidan exactamente con los del entrenamiento (`agentview`, `robot0_eye_in_hand`).
- Posible sobreajuste al dataset MimicGen de 200 episodios y a las condiciones de iluminación y posiciones de objeto del mismo.
- Riesgo de fallo en tareas de contacto si cambian la geometría de las piezas, la fricción o la calibración de las cámaras.
- No es un modelo de lenguaje: no tiene sesgos lingüísticos, pero puede heredar sesgos de las trayectorias humanas del dataset.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte.
- No se documentan limitaciones de contexto ni de idioma porque no aplican.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/castanetnicolas/diffusion_UR5e_BS_128_H_16_TASK_three_piece_assembly_ID_163713
- Dataset de entrenamiento: https://huggingface.co/datasets/castanetnicolas/mimicgen_three_piece_assembly_d1_image84
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=castanetnicolas/mimicgen_three_piece_assembly_d1_image84
- Paper Diffusion Policy: https://huggingface.co/papers/2303.04137
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
