# jammyyang/groot17_so101_pick_place

## Resumen

`jammyyang/groot17_so101_pick_place` es una política robótica (policy) publicada en Hugging Face por el usuario jammyyang, entrenada con la librería LeRobot y basada en el modelo fundacional GR00T N1.7 de NVIDIA. Cuenta con 3.144.016.000 parámetros (~3,14 B) y combina un backbone de visión-lenguaje Cosmos-Reason2/Qwen3-VL con un transformer de acciones con flow matching, que predice acciones condicionadas por visión, lenguaje y propiocepción. El repositorio ocupa 9,3 GB y los pesos se distribuyen en formato safetensors bajo licencia Apache 2.0.

No se trata de un modelo de lenguaje general, sino de una política de imitación especializada en una única tarea: «Pick up the object and place it in the box», ejecutada sobre un brazo robótico SO-101 (perfil `so_follower`) con una cámara frontal de 640x480. La entrada es un estado de 6 dimensiones más la imagen, y la salida es un vector de acción de 6 dimensiones. Está pensada para desplegarse en bucle cerrado sobre el robot real mediante `lerobot-rollout`.

Su relevancia práctica es acotada pero concreta: sirve como ejemplo reproducible de ajuste fino de GR00T N1.7 con LeRobot 0.6.2 sobre un dataset propio pequeño (50 episodios, 16.979 fotogramas a 30 FPS) y como punto de partida para adaptar una política cross-embodiment a un robot de bajo coste. Con 0 descargas y 0 likes en el momento de la consulta, y sin resultados de evaluación publicados por el autor, debe considerarse material experimental más que un artefacto listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo fundacional robótico con backbone de visión-lenguaje Cosmos-Reason2/Qwen3-VL y transformer de acciones con flow matching (GR00T N1.7, NVIDIA) |
| Parámetros totales | 3.144.016.000 (dato real del archivo safetensors) |
| Parámetros activos | No aplica (no es una arquitectura MoE según la información disponible) |
| Longitud de contexto | No disponible; la política consume una observación por paso: `observation.state` (6,) e `observation.images.front` (3, 480, 640) |
| Tipos de cuantización | No disponibles; no se publican variantes cuantizadas, solo los pesos en safetensors |
| Idiomas soportados | No especificados en la model card. La instrucción de tarea se aporta en inglés en los ejemplos («Pick up the object and place it in the box»); el backbone Qwen3-VL es multilingüe, pero no hay evidencia de entrenamiento con instrucciones en otros idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

Otros datos de la model card: robot `so_follower`, cámara `front`, salida `action` de forma (6,), tamaño del repositorio 9,3 GB, creado el 2026-09-10 y actualizado el 2026-09-10.

## Arquitectura y entrenamiento

La arquitectura sigue el diseño de GR00T N1.7: un backbone de visión-lenguaje (Cosmos-Reason2/Qwen3-VL) que procesa la imagen y la instrucción de tarea, acoplado a un transformer de acciones entrenado con flow matching que genera las acciones del robot condicionadas por visión, lenguaje y propiocepción. El modelo se presenta como un modelo fundacional cross-embodiment, es decir, diseñado para transferirse entre distintas morfologías de robot; en esta publicación concreta se ha especializado en un único embodiment, el brazo SO-101 con una cámara frontal.

El entrenamiento es de imitación supervisada a partir de demostraciones, no hay indicios en la información disponible de RLHF ni de DPO. La configuración registrada es: 20.000 pasos, batch size 1, optimizador AdamW, learning rate 0,0001, semilla 1000 y LeRobot 0.6.2. El dataset de entrenamiento es `jammyyang/so101_pick_place_20260910_120942`, con 50 episodios, 16.979 fotogramas a 30 FPS y una única tarea declarada. No se documenta composición adicional del dataset, número de tokens de entrenamiento ni técnicas de aumento de datos.

## Capacidades

- Generación de acciones motoras de 6 grados de libertad para el brazo SO-101 a partir de una imagen frontal y del estado de las articulaciones.
- Ejecución de una tarea de manipulación de pick-and-place: coger un objeto y depositarlo en una caja.
- Condicionamiento por instrucción en lenguaje natural, mediante la cadena de tarea pasada al runtime (`--task`).
- Percepción visual a resolución 640x480 mediante el backbone de visión-lenguaje.
- Integración con el ecosistema LeRobot para entrenamiento, rollout y registro de datos.
- No dispone de tool calling ni function calling: es una política motora, no un agente conversacional.
- No dispone de modo de razonamiento explícito (thinking mode), ni de capacidades de audio, ni de generación de texto orientada al usuario.
- Capacidades multilingües: no documentadas; el ejemplo de uso emplea una instrucción en inglés.

## Casos de uso

- Automatización de pick-and-place en banco de laboratorio: la política puede controlar un SO-101 para coger piezas y depositarlas en una caja, con la instrucción de tarea fijada en inglés y una sola cámara frontal a 640x480.
- Punto de partida para ajuste fino con objetos nuevos: al ser un modelo GR00T N1.7 entrenado con LeRobot, se puede reentrenar con `lerobot-train` sobre un dataset propio para ampliar la variedad de objetos o posiciones.
- Baseline reproducible en investigación en aprendizaje por imitación: permite comparar GR00T N1.7 frente a otras políticas del ecosistema LeRobot bajo un mismo dataset y una misma configuración de hardware.
- Docencia y formación en robótica de bajo coste: un brazo SO-101 más esta política permiten montar una práctica completa de grabación de demostraciones, entrenamiento y despliegue sin GPU de gama alta, dado el tamaño del modelo.
- Recolección autónoma de datos: ejecutando la política en bucle con `--strategy.type=base` se pueden generar episodios adicionales que después se filtren y reutilicen para reentrenar.
- Pruebas de robustez y análisis de fallos: al no existir resultados de evaluación publicados, el modelo es útil precisamente como sujeto de experimentos controlados con cambios de iluminación, posición inicial del objeto o presencia de distractores.
- Validación de pipelines de despliegue LeRobot: sirve para verificar la integración de `lerobot-rollout`, la calibración de cámara y robot, y los nombres de las claves de observación antes de invertir en entrenamientos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye explícitamente la sección de evaluación vacía, con la indicación de que no se han proporcionado resultados para esta política todavía. No hay datos de tasa de éxito, MMLU, HumanEval, GSM8K ni de ninguna otra métrica, ni comparaciones numéricas con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir de los 3,14 B de parámetros, no confirmado por el autor): en bf16/fp16 en torno a 6,3 GB solo de pesos, más activaciones y el codificador visual; en fp32, alrededor de 12,6 GB; en int8, unos 3,2 GB; en int4, unos 1,6 GB. El repositorio de 9,3 GB probablemente incluye checkpoints u otros artefactos además de los pesos.
- GPU recomendadas: para inferencia en bf16, una RTX 4090 (24 GB) o una RTX 3090 (24 GB) ofrecen margen suficiente; una A100 o H100 permiten además entrenamiento y lotes mayores.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas de 16 GB o más (RTX 4080, RTX 4070 Ti Super, RTX 3090, RTX 4090) con bf16; en tarjetas de 8-12 GB requeriría cuantización, no publicada por el autor.
- Opciones de despliegue: LeRobot mediante `lerobot-rollout` con `--policy.path=jammyyang/groot17_so101_pick_place`; el entrenamiento se realiza con `lerobot-train --policy.type=groot` en CUDA. vLLM, llama.cpp, Ollama y TGI no son aplicables a este artefacto, ya que no es un modelo de lenguaje servible por esos motores.
- Latencia y throughput: no disponibles. Como referencia del régimen de control, el dataset de entrenamiento se grabó a 30 FPS, lo que sitúa el orden de magnitud del bucle de control en ese entorno, pero el autor no publica cifras de latencia ni de frecuencia de inferencia alcanzada.

## Comparativa con modelos similares

Los datos de los modelos alternativos no aparecen en la información proporcionada, por lo que la comparación se limita a la categoría y a la licencia.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jammyyang/groot17_so101_pick_place | 3.144.016.000 | No disponible | Sin resultados publicados | apache-2.0 | Hugging Face, 0 descargas |
| GR00T N1.7 (NVIDIA) | No disponible en la información proporcionada | No disponible | No disponible | No disponible | Repositorio Isaac-GR00T en GitHub |
| Otras políticas de LeRobot (por ejemplo, ACT, Diffusion Policy, SmolVLA) | No disponible en la información proporcionada | No disponible | No disponible | No disponible | Ecosistema LeRobot en Hugging Face |

Como referencia cualitativa, esta política se sitúa en la misma categoría que el resto de políticas de imitación entrenables y desplegables con LeRobot; la diferencia principal es que aquí el backbone es un modelo fundacional de visión-lenguaje de 3,14 B, lo que implica un coste de inferencia mayor que el de políticas más ligeras basadas en transformers pequeños o en difusión.

## Limitaciones y advertencias

- Dataset de entrenamiento muy reducido: 50 episodios y 16.979 fotogramas para una única tarea, lo que favorece el sobreajuste a las posiciones, objetos e iluminación presentes en las demostraciones.
- Sin resultados de evaluación: el autor no publica tasa de éxito ni condiciones de prueba, por lo que no hay evidencia cuantitativa de fiabilidad en el robot real.
- Especialización estrecha: una sola tarea, un solo tipo de robot (`so_follower`) y una sola cámara (`front`); cambiar la morfología, el número de cámaras o los nombres de las claves de observación rompe la compatibilidad.
- Dependencia de la instrucción de tarea: los ejemplos usan una cadena concreta en inglés; no hay evidencia de generalización a otras formulaciones ni a otros idiomas.
- Riesgo de alucinación motora: como toda política generativa, puede producir trayectorias plausibles pero incorrectas ante situaciones fuera de distribución, con riesgo físico asociado en un brazo real.
- Sesgos: no documentados por el autor; cabe esperar sesgo hacia las condiciones de captura del dataset (posiciones iniciales, tipo de objeto, iluminación).
- Licencia: apache-2.0, que permite uso comercial, pero el usuario debe verificar las condiciones de los modelos base subyacentes (GR00T N1.7, Cosmos-Reason2/Qwen3-VL) antes de explotarlo en producción.
- Sin garantías de seguridad: no se documentan paradas de emergencia, límites de par ni validación de colisiones; cualquier despliegue real debe añadir capas de seguridad independientes.
- Madurez: 0 descargas y 0 likes, sin historial de uso por terceros ni mantenimiento posterior a la publicación inicial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jammyyang/groot17_so101_pick_place
- Dataset de entrenamiento: https://huggingface.co/datasets/jammyyang/so101_pick_place_20260910_120942
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=jammyyang/so101_pick_place_20260910_120942
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de GR00T en LeRobot: https://huggingface.co/docs/lerobot/main/en/groot
- Documentación completa de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Repositorio Isaac-GR00T de NVIDIA: https://github.com/NVIDIA/Isaac-GR00T
- Repositorio de la librería LeRobot (citación): https://github.com/huggingface/lerobot
