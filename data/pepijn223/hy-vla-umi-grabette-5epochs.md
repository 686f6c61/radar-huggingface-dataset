# pepijn223/hy-vla-umi-grabette-5epochs

## Resumen

Hy-VLA UMI fine-tuned on Grabette es un checkpoint de política robótica (vision-language-action, VLA) publicado por el usuario pepijn223 sobre el modelo base `lerobot/hy_vla_umi`. Se trata de un ajuste fino supervisado del denominado "action expert" y de la proyección de estado sobre un backbone vision-language congelado, entrenado durante cinco épocas (6.640 actualizaciones) sobre el dataset `pepijn223/grabette-slam-consolidated-20261027`, compuesto por 122 episodios y 84.959 fotogramas a 50 Hz.

El modelo resuelve el problema de generar comandos de acción de brazo robótico de un solo brazo (embodiment `single_arm`) a partir de observaciones RGB, estado medido y pose del efector. Predice 50 pasos de 11 canales: posición XYZ en metros, las dos primeras filas de la matriz de rotación, y dos variables denominadas "strategy" y "closure". Es relevante porque ejemplifica el flujo actual de fine-tuning de VLA sobre LeRobot con contratos de ejecución explícitos y validación de guardado/carga bit a bit.

El modelo tiene 4.526.672.912 parámetros (aproximadamente 4,53 mil millones) según los tensores safetensors, con un repositorio de 9,1 GB, licencia Apache 2.0 y pipeline `robotics`. No se dispone de información sobre benchmarks de éxito de tarea robótica ni sobre idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) con backbone vision-language congelado y action expert entrenado; implementación Hy-VLA de LeRobot |
| Parametros totales | 4.526.672.912 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (horizonte de acción de 50 pasos; ventana de observación no especificada) |
| Tipos de cuantizacion | no disponible (entrenamiento en BF16; no se documentan cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema Hy-VLA: un backbone vision-language que permanece congelado y un "action expert" junto con una proyección de estado que se entrenan. El checkpoint se inicializó desde `lerobot/hy_vla_umi` (revisión `287bc5491ca061398dae57478810176510e4aa90`) y se ajustó durante cinco épocas, equivalentes a 6.640 actualizaciones, sobre cuatro GPU H100 con batch size 64, precisión BF16 y tasa de aprendizaje máxima de 5e-5. La instrucción de entrenamiento fue "Grabette demonstration".

El dataset de entrenamiento es `pepijn223/grabette-slam-consolidated-20261027` (revisión `34a39be5ce400bbd3000aa8623d3d490baa70b60`), con 122 episodios y 84.959 fotogramas a 50 Hz. Se enmascaran tiempos inválidos, el padding de episodios y las ventanas que cruzan discontinuidades grandes de pose. El checkpoint incluye normalización de acciones relativas ajustada dentro de los procesadores guardados. No existe split de validación reservado en esta primera ejecución.

Las acciones se predicen como 50 pasos de 11 canales con objetivos relativos a la pose actual del centro del gripper: `p_rel = R_current.T @ (p_future - p_current)` y `R_rel = R_current.T @ R_future`, mientras que strategy y closure permanecen absolutas. El postprocesador captura la referencia de planificación y decodifica a poses absolutas en el marco de control de esa referencia; no debe aplicarse una segunda conversión relativa ni anclaje de chunks centrado en cámara.

## Capacidades

- Generación de trayectorias de acción para un brazo robótico único (`single_arm`): 50 pasos por plan de 11 canales (XYZ en metros, dos filas de rotación, strategy y closure).
- Procesamiento de observaciones multimodales: imagen RGB (`observation.images.grabette`, redimensionada de 3x972x1296 a 224x224), estado medido (`observation.state`) y pose del centro del gripper (`observation.gripper_pose`, matriz 4x4).
- Condicionamiento por texto de tarea ("Grabette demonstration").
- Decodificación de acciones relativas a absolutas mediante postprocesador integrado.
- Ejecución con horizonte de ejecución configurable (por ejemplo, 10 acciones por plan manteniendo `n_action_steps`, `chunk_size` y horizonte físico en 50).
- Soporte de inferencia en Apple silicon vía MPS con carga estricta en streaming mediante Accelerate.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, matemáticas ni visión generalista fuera del pipeline robótico.

## Casos de uso

- Manipulación robótica de un brazo con pinza en entornos de laboratorio: el modelo convierte observaciones RGB y pose del gripper en 50 pasos de acción, adecuado para tareas de agarre y posicionamiento sobre el embodiment Grabette.
- Recolección de datos con UMI (Universal Manipulation Interface): al estar ajustado sobre un dataset UMI con poses de cámara y gripper, sirve para reproducir demostraciones capturadas con ese pipeline.
- Investigación en imitation learning: permite comparar el efecto de fine-tuning del action expert manteniendo el backbone congelado, con un contrato de ejecución reproducible (PR #4196 de LeRobot).
- Prototipado en Apple silicon: con el runtime indicado y `config.device = "mps"`, se pueden validar planes sobre grabaciones antes de desplegar en hardware, aunque la latencia (3,88–4,16 s por plan en un Mac de 24 GB) limita el control en tiempo real.
- Evaluación offline de políticas: el checkpoint permite cargar procesadores y tokenizer y verificar predicciones bit a bit, útil para integrar tests de regresión en pipelines de investigación.
- Base para nuevos fine-tunings: al estar bajo Apache 2.0 y sobre `lerobot/hy_vla_umi`, puede reajustarse con otros datasets de brazo único respetando el contrato de entrada/salida documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de éxito de tarea en la información disponible. Las únicas métricas documentadas son comprobaciones de software:

| Prueba | Resultado |
|---|---|
| Guardado/carga estricta de modelo, procesadores y tokenizer | Predicciones y comandos decodificados bit a bit idénticos |
| Acciones finitas síncronas con RGB, estado y poses reales | 52 acciones a través de replanificación (episodios 0, 60 y 121) |
| Carga estricta en Mac Apple silicon de 24 GB (horizonte de ejecución 10, horizonte de modelo 50) | 22 entradas RGB/estado/pose en tres planes |
| Latencia de planes en caliente en Mac | 3,88–4,16 s por plan |
| Roundtrip FK/IK de `gripper_center` con URDF | Correcto |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio pesa 9,1 GB, por lo que en BF16 se requiere en torno a 9 GB de memoria para los pesos, más overhead de activaciones y del backbone.
- GPU recomendadas: el entrenamiento se realizó en cuatro H100; para inferencia no se documentan GPUs concretas.
- Compatibilidad con GPU de consumo: no confirmada; un Mac Apple silicon de 24 GB ejecuta la carga estricta y la inferencia, aunque con latencia de 3,88–4,16 s por plan.
- Opciones de despliegue: implementación Hy-VLA de LeRobot (PR #4196, commit `6d4e255f887bab9b4d3942680d0427953830e878`) o descendiente compatible; en Apple silicon, commit de runtime `e69d46e80dcdda62c51b898fbe4de2dea5e26337` con el extra `hy_vla` y `config.device = "mps"`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: en Mac de 24 GB, 3,88–4,16 s por plan de diez acciones en caliente; insuficiente para sostener un plan nuevo a 10 Hz o 50 Hz en esa configuración. No se documenta throughput en GPU.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la información proporcionada. Como referencia, el modelo base del que deriva es:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| pepijn223/hy-vla-umi-grabette-5epochs | 4.526.672.912 | no disponible | Apache 2.0 | Hugging Face (32 descargas) |
| lerobot/hy_vla_umi | no disponible | no disponible | no disponible | Hugging Face (modelo base) |

## Limitaciones y advertencias

- No se han validado resultados de éxito de tarea robótica; las comprobaciones son de software sobre grabaciones de entrenamiento.
- El checkpoint no se ha validado en un OpenArm físico en movimiento; requiere calibración del centro del gripper, signos de articulaciones, FK/IK y límites de movimiento.
- La salida de strategy muestreada fue ligeramente negativa (mínimo -0,00901); deben aplicarse los límites calibrados de strategy/closure y de motor antes de usar en hardware.
- El entrenamiento usa temporización a 50 Hz; una reproducción a 10 Hz estira el tiempo por un factor de cinco, por lo que debe medirse la latencia local antes de elegir la cadencia de control.
- No hay split de validación reservado en esta primera ejecución, lo que impide estimar generalización.
- Riesgo de alucinación y sesgos: no documentados en la información disponible, aunque al tratarse de una política de imitación puede reproducir sesgos y errores presentes en las demostraciones.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías y el uso en hardware real queda bajo responsabilidad del integrador.
- No se documentan idiomas soportados ni contexto lingüístico; el condicionamiento textual se limita a la instrucción de tarea.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pepijn223/hy-vla-umi-grabette-5epochs
- Modelo base: https://huggingface.co/lerobot/hy_vla_umi
- Dataset de entrenamiento: https://huggingface.co/datasets/pepijn223/grabette-slam-consolidated-20261027
- LeRobot PR #4196 (implementación Hy-VLA): https://github.com/huggingface/lerobot/pull/4196
