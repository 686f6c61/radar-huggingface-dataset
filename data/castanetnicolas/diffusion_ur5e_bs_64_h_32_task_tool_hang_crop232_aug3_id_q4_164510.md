# castanetnicolas/diffusion_UR5e_BS_64_H_32_TASK_tool_hang_crop232_aug3_ID_q4_164510

## Resumen

El modelo `diffusion_UR5e_BS_64_H_32_TASK_tool_hang_crop232_aug3_ID_q4_164510` es una política de control visuomotor entrenada con el método Diffusion Policy y empaquetada con la librería LeRobot de Hugging Face. Lo publica el usuario `castanetnicolas` y resuelve una tarea de manipulación robótica concreta: insertar un gancho en una base para construir un marco y colgar una llave inglesa en él. No es un modelo de lenguaje: es una política de imitación que mapea observaciones (estado del robot y dos cámaras) a trayectorias de acción de 7 dimensiones.

Técnicamente se trata de un modelo de difusión aplicado a acciones, con 278.014.919 parámetros (unos 278 M) almacenados en safetensors y un repositorio de 1,1 GB. Consume un vector de estado de 9 dimensiones y dos imágenes RGB de 256x256 píxeles (`sideview` y `robot0_eye_in_hand`), y produce acciones de 7 dimensiones a partir de un horizonte de predicción de 32 pasos y un tamaño de lote de 64, según indican los metadatos del nombre del repositorio.

Su relevancia es acotada pero clara para quien trabaja en robótica de imitación: sirve como ejemplo reproducible de entrenamiento de Diffusion Policy con LeRobot 0.6.1 sobre un dataset de 200 episodios y 95.962 fotogramas a 20 FPS, y permite desplegar la política en un robot Panda mediante el comando `lerobot-rollout`. No se han publicado resultados de evaluación, lo que limita su uso como referencia de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (modelo generativo de difusión para control visuomotor) |
| Parametros totales | 278.014.919 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (política de control; horizonte de predicción de 32 pasos según el nombre del repo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot 0.6.1 |
| Tipo de robot | panda |
| Camaras | `sideview`, `robot0_eye_in_hand` |
| Entrada de estado | `observation.state`, forma `(9,)` |
| Entrada visual | 2 imagenes RGB de `(3, 256, 256)` |
| Salida de accion | `action`, forma `(7,)` |
| Tamano del repositorio | 1.1 GB |
| Dataset de entrenamiento | `castanetnicolas/robomimic_tool_hang_ph_image256` (200 episodios, 95.962 fotogramas, 20 FPS) |

## Arquitectura y entrenamiento

La política sigue el enfoque Diffusion Policy descrito en el paper arXiv:2303.04137: el control visuomotor se formula como un proceso generativo de difusión que produce trayectorias de acción multim paso y suaves, en lugar de predecir una única acción de forma determinista. Esto resulta especialmente adecuado para tareas con contacto rico, como insertar un gancho y colgar un objeto. La entrada combina un vector de estado de 9 dimensiones con dos flujos de imagen de 256x256 píxeles procedentes de una cámara lateral y de una cámara en el efector; la salida es un vector de acción de 7 dimensiones.

El entrenamiento se realizó con LeRobot 0.6.1 sobre el dataset `robomimic_tool_hang_ph_image256`, compuesto por 200 episodios y 95.962 fotogramas capturados a 20 FPS de la tarea "Insert the hook into the base to build a frame, then hang the wrench on the hook". La configuración declarada incluye 100.000 pasos de entrenamiento, tamaño de lote 64, optimizador Adam, tasa de aprendizaje 0.0001 y semilla 1000. El nombre del repositorio sugiere además un horizonte de predicción de 32 pasos y algún tipo de aumento de datos (`aug3`), aunque estos detalles no se documentan explícitamente en la model card. No se indica el uso de RLHF ni de ajuste por preferencias, algo esperable en una política de imitación supervisada.

## Capacidades

- Generación de trayectorias de acción multim paso para control visuomotor en tareas de manipulación con contacto.
- Fusión de estado propioceptivo (9 dimensiones) con dos cámaras RGB de 256x256 para la toma de decisiones.
- Ejecución de la tarea compuesta de insertar un gancho en una base y colgar una llave inglesa.
- Compatibilidad con el ecosistema LeRobot: entrenamiento con `lerobot-train` y despliegue con `lerobot-rollout`.
- Soporte de reentrenamiento sobre nuevos datasets mediante el tipo de política `diffusion` de LeRobot.
- No dispone de tool calling, razonamiento multi paso simbólico, capacidades multilingües, visión general, audio ni modo de pensamiento: es una política robótica específica de tarea.

## Casos de uso

- Manipulación con contacto en entornos de investigación: la política está entrenada para una tarea de inserción y colgado, y sirve como punto de partida reproducible para estudiar Diffusion Policy en robots Panda.
- Reproducción de experimentos de imitación: con 200 episodios y una configuración documentada (100.000 pasos, Adam, lr 0.0001, semilla 1000), permite replicar el entrenamiento y comparar variantes.
- Despliegue en laboratorio con `lerobot-rollout`: el comando documentado permite ejecutar la política en un robot Panda real durante un tiempo acotado (`--duration=60`), útil para validaciones rápidas.
- Base para ajuste fino en tareas similares de ensamblaje: al ser una política de difusión con entradas de estado e imagen bien definidas, se puede reentrenar con `lerobot-train` sobre datasets propios de inserción o ensamblaje.
- Docencia y formación en robótica de imitación: el repositorio incluye la configuración completa y enlaces a la documentación de LeRobot, lo que facilita usarlo como ejemplo práctico en cursos.
- Evaluación de pipelines de datos: el dataset asociado (95.962 fotogramas a 20 FPS) y la política permiten probar herramientas de visualización y validación de datasets de LeRobot.
- Prototipado de control visuomotor con dos cámaras: la combinación de vista lateral y vista en el efector es un patrón reutilizable en tareas que requieren precisión espacial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 278 M parámetros en safetensors (aproximadamente 1,1 GB en fp32), la inferencia en fp32 requeriría del orden de 1,1 GB solo para pesos, más memoria para las dos imágenes de 256x256 y el proceso de difusión.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, cualquier GPU consumer con al menos 4-8 GB de VRAM debería poder alojar los pesos, aunque no se documenta ningún requisito oficial.
- Compatibilidad con GPU consumer: probable por el tamaño del modelo, pero no confirmada por el autor.
- Opciones de despliegue: `lerobot-rollout` con `--strategy.type=base` y `--policy.path=<repo>`; entrenamiento con `lerobot-train` y `--policy.type=diffusion` en dispositivo `cuda`.
- Latencia y throughput: no disponibles. El proceso de difusión implica múltiples pasos de denoising por cada predicción de trayectoria, lo que condiciona la frecuencia de control, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `castanetnicolas/diffusion_UR5e_BS_64_H_32_TASK_tool_hang_crop232_aug3_ID_q4_164510` | 278 M | horizonte de 32 pasos (según nombre del repo) | Inserción de gancho y colgado de llave inglesa en Panda | apache-2.0 | Hugging Face, 0 descargas, 0 likes |
| Políticas ACT de LeRobot | no disponible | no disponible | Tareas de imitación genéricas | según repositorio | Ecosistema LeRobot |
| Políticas Diffusion Policy de referencia (paper 2303.04137) | no disponible | no disponible | Manipulación con contacto en varios benchmarks | según implementación | Paper y repositorios asociados |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada; la comparación se limita a categoría, licencia y disponibilidad.

## Limitaciones y advertencias

- No se han publicado resultados de evaluación: se desconoce la tasa de éxito real de la política en la tarea para la que fue entrenada.
- Es una política específica de tarea y de robot (Panda): no es un modelo general y no se espera que funcione en otras tareas, objetos o morfologías sin reentrenamiento.
- El nombre del repositorio menciona `UR5e` mientras que la model card declara `panda` como tipo de robot; esta discrepancia debe verificarse antes de desplegar en hardware real.
- Dependencia estricta de las cámaras: los nombres e índices de cámara deben coincidir con las claves de observación (`sideview`, `robot0_eye_in_hand`), y cambios de iluminación, posiciones de objetos o distracciones pueden degradar el comportamiento.
- Riesgo de sobreajuste al dataset de 200 episodios: la diversidad limitada puede reducir la generalización a condiciones no vistas.
- Sin datos sobre sesgos, alucinación o comportamiento fuera de distribución más allá de lo esperable en políticas de imitación.
- Licencia apache-2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte.
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay evidencia comunitaria de funcionamiento correcto.
- La información de la búsqueda web no aporta datos adicionales sobre el modelo; los enlaces externos encontrados no son relevantes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/castanetnicolas/diffusion_UR5e_BS_64_H_32_TASK_tool_hang_crop232_aug3_ID_q4_164510
- Dataset de entrenamiento: https://huggingface.co/datasets/castanetnicolas/robomimic_tool_hang_ph_image256
- Paper de Diffusion Policy: https://huggingface.co/papers/2303.04137
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=castanetnicolas/robomimic_tool_hang_ph_image256
