# seriintan/multi_task_dit_frazier_object_variation

## Resumen

`multi_task_dit_frazier_object_variation` es una política robótica de aprendizaje por imitación publicada por el usuario `seriintan` en Hugging Face, entrenada con la librería LeRobot. Se trata de una instancia concreta del método Multi-Task Diffusion Transformer (DiT), que extiende Diffusion Policy con un transformer de difusión grande y condicionamiento conjunto de texto e imagen para aprendizaje robótico multitarea. La política consume el estado del robot (vector de 6 dimensiones) y dos cámaras (frontal y de pinza, ambas a 480x640) y produce un vector de acción de 6 dimensiones para un brazo seguidor del tipo `so_follower`.

El modelo está especializado en una única tarea de manipulación: "Pick and place Frazier to blue basket". Fue entrenado sobre el conjunto de datos `seriintan/frazier_dataset_v2_object_variation`, compuesto por 171 episodios y 99.043 fotogramas grabados a 30 FPS, con variación en la posición de los objetos. El repositorio ocupa 1,0 GB y contiene 248.855.302 parámetros según los pesos en safetensors, aunque la model card del autor declara "~450M parámetros"; esta discrepancia no está aclarada en la información disponible.

Su relevancia es doble: por un lado, ejemplifica el flujo de trabajo completo de LeRobot (grabación de datos, entrenamiento y despliegue con `lerobot-rollout`); por otro, sirve como referencia reproducible del método DiT aplicado a un caso real de pick-and-place con variación de objetos. No es un modelo de propósito general: es una política cerrada a un robot, dos cámaras y una tarea concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multi-Task Diffusion Transformer (DiT); política de difusión con condicionamiento texto + visión |
| Parametros totales | 248.855.302 (según safetensors); la model card declara "~450M" |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones del policy) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot (versión de entrenamiento 0.6.2) |
| Pipeline | robotics |
| Tipo de robot | `so_follower` |
| Camaras | `front`, `gripper` (3, 480, 640 cada una) |
| Entrada de estado | `observation.state` (6,) |
| Salida | `action` (6,) |
| Tamano del repositorio | 1,0 GB |

## Arquitectura y entrenamiento

La política sigue el método Multi-Task Diffusion Transformer (DiT), una extensión de Diffusion Policy que sustituye el backbone habitual por un Diffusion Transformer de mayor escala y añade condicionamiento multimodal (texto de la tarea e imágenes de las cámaras). El método soporta tanto objetivos de difusión como de *flow matching*, lo que permite ajustar el esquema de generación de acciones sin cambiar el resto del pipeline. La model card vincula el método al paper arXiv:2507.05331.

El entrenamiento se realizó con LeRobot 0.6.2 durante 50.000 pasos, con batch size de 8, optimizador Adam, tasa de aprendizaje 2e-05 y semilla 1000. El conjunto de datos contiene 171 episodios y 99.043 fotogramas a 30 FPS para la tarea "Pick and place Frazier to blue basket", con variación en la posición de los objetos ("object_variation"). No se documenta en la información disponible si hubo etapas de RLHF, DPO ni qué composición exacta tiene el dataset más allá de las cifras de episodios y fotogramas. Tampoco se detalla el número de tokens de entrenamiento ni la innovación técnica concreta respecto al DiT original.

## Capacidades

- Generación de trayectorias de acción continuas para manipulación robótica: mapea observaciones (estado de 6 dimensiones + dos imágenes RGB) a acciones de 6 dimensiones.
- Condicionamiento por lenguaje: la política admite una descripción textual de la tarea (`--task="Pick and place Frazier to blue basket"`), característica propia del enfoque multitarea de DiT.
- Aprendizaje por imitación a partir de demostraciones reales, sin recompensa explícita.
- Percepción visual con dos cámaras simultáneas: una frontal y una montada en la pinza, lo que aporta información de agarre en primer plano.
- Generalización limitada a variaciones en la posición de los objetos, según el nombre y la composición del dataset de entrenamiento.
- Ejecución autónoma en bucle cerrado sobre un robot `so_follower` mediante `lerobot-rollout`.
- Soporte de entrenamiento y ajuste fino con la CLI de LeRobot (`lerobot-train --policy.type=multi_task_dit`).
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multietapa, visión general, audio ni modo "thinking".

## Casos de uso

- Pick-and-place en célula de trabajo: la política ejecuta la secuencia de recoger el objeto "Frazier" y depositarlo en la cesta azul sobre un brazo `so_follower`, con dos cámaras que cubren la escena y el agarre. Es el escenario exacto para el que fue entrenada.
- Automatización de laboratorio con objetos en posiciones variables: el dataset de entrenamiento incorpora variación de posición, por lo que el modelo está pensado para tolerar cambios de localización del objeto dentro del espacio de trabajo observado.
- Banco de pruebas reproducible para investigación en imitación: sirve como referencia pública de una política DiT entrenada de extremo a extremo con LeRobot, útil para comparar métodos de difusión frente a *flow matching*.
- Ajuste fino para nuevas tareas de recogida con hardware propio: partiendo de estos pesos, se puede reentrenar con `lerobot-train --policy.type=multi_task_dit` sobre un dataset propio con el mismo robot y las mismas claves de observación, aprovechando el condicionamiento por texto para cambiar la instrucción de tarea.
- Docencia y prototipado con robótica de bajo coste: el robot `so_follower` y dos cámaras OpenCV a 640x480 y 30 FPS son un montaje asequible para prácticas de aprendizaje por imitación; el modelo aporta una política ya entrenada que se puede ejecutar con un solo comando.
- Evaluación de robustez visual: al usar dos vistas (frontal y pinza), permite estudiar cómo afectan oclusiones, iluminación o cambios de encuadre al éxito de la tarea en un pipeline concreto.
- Integración en pipelines de robótica como servicio: el punto de entrada `lerobot-rollout` con `--policy.path` permite lanzar la política desde scripts o sistemas de orquestación, aunque no se documenta una API HTTP ni despliegue servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explícitamente: "No evaluation results have been provided for this policy yet", por lo que no existen tasas de éxito, número de ensayos ni métricas de robustez para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no documentada. Como referencia orientativa a partir del tamaño de pesos, 248,9 M de parámetros ocupan aproximadamente 1,0 GB en fp32 y 0,5 GB en fp16/bf16; el repositorio completo pesa 1,0 GB. Sumando activaciones y procesamiento de dos flujos de imagen de 480x640, un presupuesto de 2-4 GB de VRAM es razonable, pero no está confirmado por el autor.
- GPU recomendadas: no especificadas. La configuración de entrenamiento usa `--policy.device=cuda`, por lo que se requiere GPU NVIDIA con CUDA para entrenar. Para inferencia, cualquier GPU con varios GB de VRAM debería ser suficiente por el tamaño del modelo.
- Compatibilidad con GPU de consumo: muy probable en tarjetas de gama media y alta (por ejemplo, RTX 3060 de 12 GB o superiores), dado el tamaño reducido del modelo. No hay confirmación oficial de latencias ni de modelos probados.
- Opciones de despliegue: LeRobot mediante `lerobot-rollout` (inferencia en robot real) y `lerobot-train` (entrenamiento o ajuste fino). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no aplican a una política robótica de este tipo.
- Latencia y throughput: no disponibles. El dato relevante es que los datos se grabaron a 30 FPS, con dos cámaras a 640x480 y 30 FPS en la configuración de despliegue de ejemplo.
- Hardware robótico necesario: brazo `so_follower`, puerto serie para el robot y dos cámaras OpenCV, con nombres de cámara que deben coincidir con las claves de observación del entrenamiento (`front` y `gripper`).

## Comparativa con modelos similares

La información proporcionada no incluye datos de rendimiento que permitan una comparación cuantitativa. Se listan alternativas de la misma categoría (políticas de imitación en el ecosistema LeRobot) sin cifras, marcando como "no disponible" todo aquello que no aparece en la documentación consultada.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| multi_task_dit_frazier_object_variation (seriintan) | 248,9 M (safetensors) | no disponible | sin resultados publicados | apache-2.0 | Hugging Face, vía LeRobot |
| Diffusion Policy (referencia base del método) | no disponible | no disponible | no disponible | no disponible | implementación en LeRobot |
| ACT (Action Chunking Transformer) | no disponible | no disponible | no disponible | no disponible | implementación en LeRobot |
| SmolVLA | no disponible | no disponible | no disponible | no disponible | implementación en LeRobot |

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una sola tarea ("Pick and place Frazier to blue basket") sobre un único tipo de robot (`so_follower`) y con dos cámaras concretas. No es un modelo de propósito general.
- Sin resultados de evaluación: no hay tasas de éxito ni número de ensayos, por lo que no se puede estimar su fiabilidad en producción.
- Dependencia del montaje: los nombres de cámara (`front`, `gripper`), la resolución (480x640), los FPS (30) y el puerto del robot deben coincidir con los del entrenamiento; cualquier desviación puede degradar el comportamiento.
- Sesgos de datos desconocidos: no se documenta la distribución de posiciones, condiciones de iluminación, fondo o presencia de distractores en el dataset, más allá de la "variación de objetos" indicada en el nombre.
- Riesgo de fallo por cambio de dominio: como toda política de imitación, puede fallar ante objetos, texturas, iluminación o disposiciones no representadas en los 171 episodios de entrenamiento.
- Discrepancia de parámetros: la model card declara "~450M" y los pesos safetensors suman 248.855.302 parámetros; conviene verificar antes de planificar recursos.
- Idiomas y contexto: no disponibles; el condicionamiento textual no implica capacidades multilingües generales.
- Licencia apache-2.0: permite uso comercial y modificación, pero no se ofrece ninguna garantía por parte del autor. Al citar el trabajo deben incluirse la referencia del método (arXiv:2507.05331) y la de LeRobot.
- Advertencia práctica: es un modelo de investigación con 0 descargas y 0 "likes" en el momento de la consulta, sin validación externa conocida.
- Seguridad física: al controlar un brazo real, cualquier despliegue debe ir acompañado de paradas de emergencia, límites de par y supervisión, dado que no se documentan mecanismos de seguridad en la política.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/seriintan/multi_task_dit_frazier_object_variation
- Dataset de entrenamiento: https://huggingface.co/datasets/seriintan/frazier_dataset_v2_object_variation
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=seriintan/frazier_dataset_v2_object_variation
- Paper del método DiT (arXiv:2507.05331): https://huggingface.co/papers/2507.05331
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de multi_task_dit en LeRobot: https://huggingface.co/docs/lerobot/main/en/multi_task_dit
- Documentación completa de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
