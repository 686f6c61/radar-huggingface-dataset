# ases200q2/roboverse_pick_cube_mujocoE100_qwen_oft_20260914_0854

## Resumen

Este repositorio aloja una política robótica de imitación denominada `starvla`, publicada por el usuario ases200q2 y entrenada con LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica real. No es un modelo de lenguaje conversacional: es un controlador visomotor que recibe el estado y la velocidad del robot junto con una imagen de cámara y emite directamente un vector de acción de 9 dimensiones. Está especializado en una única tarea, `pick_cube` (coger un cubo), sobre un brazo Franka.

El nombre del repositorio incluye el sufijo `qwen_oft`, lo que sugiere un backbone de la familia Qwen combinado con una cabeza de acción de estilo OFT (optimized fine-tuning, popularizada por OpenVLA-OFT), aunque la model card no confirma explícitamente esa composición. El recuento real de parámetros en los ficheros safetensors es de 4.508.691.977, con un repositorio de 9,1 GB, coherente con pesos en precisión bf16.

Su relevancia es principalmente como ejemplo reproducible de un pipeline completo de LeRobot: define observaciones, acciones, dataset, configuración de entrenamiento y comandos de despliegue. Conviene señalar desde el principio que la configuración reporta solo 10 pasos de entrenamiento, que no hay resultados de evaluación publicados y que el modelo acumula 0 descargas y 0 likes, por lo que debe tratarse como un artefacto experimental y no como una política lista para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política visomotora `starvla` sobre LeRobot; el nombre del repo sugiere backbone Qwen con cabeza de acción estilo OFT, sin confirmar en la model card) |
| Parametros totales | 4.508.691.977 |
| Parametros activos | no disponible (no es un MoE según la información disponible) |
| Longitud de contexto | no disponible (no aplica en el sentido de contexto textual; la política consume una ventana de observación por paso) |
| Tipos de cuantizacion | no disponible (el repositorio distribuye safetensors; no se documentan variantes GGUF, int8 ni int4) |
| Idiomas soportados | no disponible (la tarea está definida por la instrucción "pick_cube" en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`, 9,1 GB de repositorio) |

## Arquitectura y entrenamiento

La model card describe una política `starvla` entrenada con LeRobot 0.6.1. Las entradas declaradas son `observation.state` con forma `(9,)`, `observation.velocity` con forma `(9,)` y `observation.images.main_camera` con forma `(3, 240, 320)`; la salida es `action` con forma `(9,)`. El robot objetivo es un `franka` con una única cámara denominada `main_camera`. No se especifica en la documentación disponible el tipo de tronco visual-lenguaje, el mecanismo de fusión de modalidades ni si existe decodificación por difusión, flow matching o regresión directa de acciones.

El entrenamiento se realizó sobre el dataset `ases200q2/roboverse-pick_cube-mujoco-E100`, con 100 episodios, 9.830 fotogramas y 30 FPS, correspondientes a la tarea `pick_cube`. La configuración reportada es de 10 pasos de entrenamiento, batch size 64, optimizador AdamW, learning rate 0,0001 y semilla 1000. No se menciona uso de RLHF, DPO ni ninguna técnica de ajuste por preferencias, algo esperable en aprendizaje por imitación. Tampoco se documentan innovaciones técnicas específicas (atención lineal, decodificación especulativa, destilación, etc.).

Dos aspectos merecen atención técnica. Primero, el nombre del dataset indica un entorno MuJoCo (`mujoco`), es decir, datos de simulación, lo que abre una brecha de dominio respecto al robot físico que se usaría en el comando de despliegue. Segundo, 10 pasos de optimización con batch 64 suponen 640 muestras procesadas, una cifra muy inferior a lo habitual en entrenamiento de políticas por imitación; es probable que se trate de una prueba de humo del pipeline más que de un entrenamiento convergido, aunque esto no se confirma en la información disponible.

## Capacidades

- Generación de acciones de control continuo de 9 dimensiones para un brazo Franka, a partir de estado, velocidad y una imagen RGB de 240x320.
- Ejecución de una única tarea de manipulación: `pick_cube`.
- Aprendizaje por imitación a partir de demostraciones teleoperadas o simuladas (100 episodios, 9.830 fotogramas).
- Integración nativa con el ecosistema LeRobot mediante `lerobot-rollout` y `lerobot-train`.
- Entrada multimodal limitada a una cámara frontal más vectores proprioceptivos (estado y velocidad).
- No hay evidencia de soporte de tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingües, modo de pensamiento, visión general, audio ni generación de texto: la model card no documenta ninguna de estas capacidades y el `pipeline_tag` es `robotics`.

## Casos de uso

- Prueba de humo de un pipeline de LeRobot: sirve para validar la instalación, la configuración de cámaras, el puerto del robot y el flujo `lerobot-rollout` antes de invertir en un entrenamiento largo con datos propios.
- Replicación de experimentos de imitación en simulación: el dataset asociado (100 episodios, 9.830 fotogramas, 30 FPS) permite reproducir el entrenamiento en MuJoCo y comparar configuraciones de hiperparámetros.
- Transferencia sim-a-real como línea de investigación: el modelo permite estudiar la brecha de dominio al ejecutar en un Franka físico una política entrenada en MuJoCo, midiendo tasas de éxito con y sin ajuste fino adicional.
- Punto de partida para ajuste fino con datos reales: al estar bajo licencia Apache 2.0 y en formato safetensors, puede reentrenarse con el comando `lerobot-train` sobre un dataset propio de la misma tarea.
- Docencia y divulgación en robótica: un ejemplo mínimo (10 pasos) que ilustra el ciclo completo de observaciones, acciones, dataset y despliegue sin requerir recursos de cómputo elevados.
- Referencia para comparativas de políticas: útil como baseline ligero frente a políticas mayores (OpenVLA, pi0, GR00T) en tareas de pick and place, siempre que se reentrene hasta convergencia.
- Integración en un banco de pruebas automatizado de manipulación, ejecutando la tarea en bucle con `--duration` y registrando el resultado de cada intento para obtener estadísticas de éxito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye un apartado de evaluación con la línea "No evaluation results have been provided for this policy yet", sin tasas de éxito, número de intentos ni condiciones experimentales.

## Requisitos de hardware

Estimaciones derivadas del recuento real de parámetros (4.508.691.977) y del tamaño del repositorio (9,1 GB); no están confirmadas por el autor:

- Pesos en bf16: aproximadamente 9,0 GB, coherente con el tamaño del repositorio. En fp32 ascenderían a unos 18 GB.
- VRAM estimada para inferencia en bf16: en torno a 10-13 GB contando pesos, activaciones de una imagen de 3x240x320 y buffers de la cabeza de acción.
- VRAM estimada en int8: aproximadamente 4,5-5,5 GB. En int4: aproximadamente 2,5-3,5 GB, aunque la cuantización de cabezas de acción en políticas VLA no es un procedimiento estándar y puede degradar la precisión de las acciones.
- GPU recomendadas: RTX 4090, RTX 3090, A100 40 GB, H100 y L40S sin ninguna restricción práctica. Una RTX 4080 o 4070 Ti (16 GB) debería ser suficiente en bf16. Una RTX 3060 de 12 GB quedaría muy justa en bf16 y más holgada con cuantización.
- Cabe en GPU de consumo: sí, en tarjetas de 12 GB o más, siempre que se aplique bf16 o cuantización.
- Despliegue: el camino documentado es LeRobot (`lerobot-rollout` para ejecución, `lerobot-train` para reentrenamiento) sobre PyTorch y CUDA, con el robot Franka conectado por puerto serie/USB y cámaras OpenCV. vLLM, llama.cpp, Ollama y TGI están orientados a modelos de lenguaje y no cubren la salida de acciones; su uso requeriría reimplementar la cabeza de acción.
- Latencia y throughput: no disponibles. La política está pensada para operar a 30 FPS (33 ms por paso) según la tasa de captura del dataset, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| starvla (este modelo) | 4.508.691.977 | Ventana de una observación por paso; contexto textual no aplicable | apache-2.0 | Hugging Face, 0 descargas y 0 likes | Entrenado 10 pasos; sin evaluación publicada |
| OpenVLA / OpenVLA-OFT | no disponible en la busqueda (referencia publica de la familia de 7B) | no disponible | no disponible en la busqueda | Publico | Alternativa de referencia en politicas VLA con cabeza de accion estilo OFT |
| pi0 / pi0.5 | no disponible en la busqueda | no disponible | no disponible | Publico | Politicas generalistas de manipulacion |
| GR00T N1 | no disponible en la busqueda | no disponible | no disponible | Publico | Modelo fundacional de robotica de NVIDIA |
| SmolVLA | no disponible en la busqueda | no disponible | no disponible | Publico | Politica compacta del ecosistema LeRobot; el comparable mas cercano por libreria y filosofia |

Los datos de los modelos alternativos no proceden de la busqueda web realizada (cuyos resultados fueron irrelevantes) y no se han verificado en esta ficha; se listan unicamente como categorias de comparacion. No se dispone de cifras de rendimiento comparables.

## Limitaciones y advertencias

- Entrenamiento mínimo: la configuración reporta 10 pasos de entrenamiento, lo que sugiere un modelo no convergido. Cualquier uso en robot real debe ir precedido de un reentrenamiento y de una evaluación sistemática.
- Ausencia total de evaluación: no hay tasas de éxito, número de intentos ni condiciones de prueba, por lo que el rendimiento real es desconocido.
- Brecha sim-a-real: el dataset de entrenamiento se generó en MuJoCo, mientras que el comando de despliegue apunta a un Franka físico. Diferencias de dinámica, iluminación, textura y calibración pueden degradar el comportamiento.
- Especialización extrema: la política está entrenada únicamente para `pick_cube`. No generaliza a otras tareas, objetos ni posiciones no vistas sin reentrenamiento.
- Dependencia de la configuración de cámara: los nombres de cámara deben coincidir exactamente con las claves de observación del entrenamiento (`main_camera`) y la resolución de entrada es 3x240x320. Cambiar la cámara o su montaje invalida la política.
- Riesgo de sobreajuste al dataset: 100 episodios y 9.830 fotogramas son un volumen reducido; es probable que el modelo memorice posiciones y trayectorias concretas.
- Sin datos sobre sesgos, robustez ante distractores, variación de iluminación u objetos nuevos.
- Idiomas y contexto textual: no aplicables ni documentados; la instrucción de tarea es una cadena fija en inglés.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución, pero no exime de las obligaciones de seguridad física al desplegar una política no evaluada sobre hardware real.
- Reputación del artefacto: 0 descargas y 0 likes, creado y actualizado el 14 de septiembre de 2026 con un minuto de diferencia entre ambos eventos, lo que refuerza la hipótesis de una subida de prueba.
- Ausencia de vídeo o demo: la propia model card sugiere grabar un GIF de la política en funcionamiento, algo que no se ha hecho.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ases200q2/roboverse_pick_cube_mujocoE100_qwen_oft_20260914_0854
- Dataset de entrenamiento: https://huggingface.co/datasets/ases200q2/roboverse-pick_cube-mujoco-E100
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ases200q2/roboverse-pick_cube-mujoco-E100
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Cita de LeRobot (Cadene et al., 2024): https://github.com/huggingface/lerobot

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos enlaces encontrados correspondian a servicios de traduccion (Google Translate y DeepL) sin relacion con la ficha.
