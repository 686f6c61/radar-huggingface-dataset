# moonjongsul/kcare_hang_cup_red_black_smolvla_261012

## Resumen

`moonjongsul/kcare_hang_cup_red_black_smolvla_261012` es un ajuste fino (fine-tune) del modelo base `lerobot/smolvla_base`, publicado por el usuario de Hugging Face moonjongsul. SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado en el ecosistema de Hugging Face y LeRobot, orientado a controlar robots manipuladores a partir de observaciones visuales e instrucciones en lenguaje natural. Este checkpoint concreto ha sido entrenado sobre el dataset `yunjuyoung64/smolvla_hang_cup_red_black_261006` para una tarea específica de manipulación: colgar una taza de color rojo y negro.

El modelo tiene 450.046.176 parámetros (aproximadamente 450 millones) y se distribuye en formato safetensors dentro de un repositorio de 5,4 GB. Al ser un modelo pequeño y eficiente, está pensado para desplegarse en hardware de consumo, en línea con el objetivo declarado del paper de SmolVLA de reducir el coste computacional manteniendo un rendimiento competitivo frente a políticas VLA de mayor tamaño.

Es relevante ahora porque forma parte de la ola de políticas VLA abiertas y reutilizables que se publican directamente en el Hub con la librería LeRobot, lo que permite a investigadores y desarrolladores reproducir, evaluar y reajustar políticas robóticas sin partir de cero. La licencia Apache 2.0 facilita su uso comercial y su integración en pipelines propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA); backbone de visión-lenguaje con experto de acción (detalles internos no disponibles en la informacion proporcionada) |
| Parametros totales | 450.046.176 (aproximadamente 450 M) |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; no se listan variantes GGUF, int8 o int4) |
| Idiomas soportados | No disponibles (la model card no declara idiomas; el condicionamiento es mediante instrucciones de tarea en lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |
| Libreria | LeRobot (`library_name: lerobot`) |
| Pipeline | Robotics |
| Modelo base | `lerobot/smolvla_base` |
| Dataset de entrenamiento | `yunjuyoung64/smolvla_hang_cup_red_black_261006` |
| Tarea | Colgado de taza roja y negra (hang cup red black) |
| Descargas / likes | 5 descargas, 0 likes |
| Fecha de creacion | 2026-10-14 |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción: procesa observaciones visuales (imágenes de cámara del robot) junto con una instrucción de tarea en lenguaje natural y produce acciones de control para el manipulador. La model card describe el modelo como "compacto y eficiente" y capaz de ejecutarse en hardware de consumo, pero no detalla la composición exacta del backbone, el número de tokens de entrenamiento ni la receta de optimización. Tampoco se especifica si se emplearon técnicas como RLHF, DPO o flow matching; esos datos figuran en el paper referenciado (arXiv:2506.01844), no en la información proporcionada.

Este checkpoint es un fine-tune específico sobre `lerobot/smolvla_base`. Según la model card, el entrenamiento y la publicación se han realizado con LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica. El flujo de entrenamiento documentado (`lerobot-train`) permite partir de un dataset propio, seleccionar el tipo de política, entrenar en CUDA y publicar el resultado en el Hub. La evaluación se realiza con `lerobot-record`, apuntando `--policy.path` al checkpoint y ejecutando episodios sobre un robot real (el ejemplo de la model card usa `so100_follower`). No se han publicado detalles sobre número de episodios, tamaño del dataset ni hiperparámetros concretos de este ajuste.

## Capacidades

- Generación de acciones de control robótico a partir de observaciones visuales e instrucciones de tarea: es una política de manipulación, no un modelo generativo de texto.
- Ejecución de una tarea concreta de manipulación: colgar una taza de color rojo y negro, tal como indica el nombre del checkpoint y el dataset asociado.
- Condicionamiento por lenguaje natural: la instrucción de tarea se incorpora como entrada, siguiendo el paradigma VLA de SmolVLA.
- Integración con el ecosistema LeRobot: entrenamiento (`lerobot-train`), evaluación e inferencia (`lerobot-record`) y publicación en el Hub.
- Ejecución en hardware de consumo: el modelo base está diseñado explícitamente para desplegarse con recursos limitados.
- Reajuste posterior: al ser un fine-tune de `lerobot/smolvla_base`, puede servir como punto de partida para otras tareas de manipulación.
- Tool calling / function calling: no aplicable (no es un modelo de lenguaje conversacional).
- Capacidades multilingües: no disponibles; la model card no declara conjunto de idiomas.
- Modo thinking, visión o audio adicional: no disponible.

## Casos de uso

- Automatización de una celda de manipulación concreta: cargar este checkpoint en un robot SO-100/SO-101 y ejecutar de forma repetida la tarea de colgar la taza roja y negra en un banco de pruebas, usando `lerobot-record` con `--policy.path` apuntando al modelo.
- Base para fine-tuning industrial: partir de este checkpoint y reentrenar con un dataset propio para tareas de ensamblaje o colocación de piezas que compartan morfología y configuración de cámara.
- Investigación en aprendizaje por imitación: reproducir el pipeline de LeRobot de principio a fin (dataset, entrenamiento, evaluación en robot real) y medir la tasa de éxito de la política sin partir de un modelo vacío.
- Comparación de políticas VLA: el mismo autor publica variantes de la misma tarea con otras arquitecturas (por ejemplo, `kcare_hang_cup_pink_upper_pi05_261002`), lo que permite comparar SmolVLA frente a alternativas sobre un escenario equivalente.
- Docencia y robótica educativa: el tamaño de 450 M de parámetros y el requisito de VRAM reducido permiten desplegar la política en laboratorios con GPU de gama media para demostraciones de VLA en vivo.
- Generación de datos de evaluación: ejecutar la política sobre el robot y grabar episodios etiquetados como `eval_*` en el Hub para construir conjuntos de evaluación reproducibles.
- Pruebas de robustez ante variaciones: reentrenar o evaluar con cambios de iluminación, posición de cámara o color del objeto para estudiar la sensibilidad de la política, dado que el nombre del dataset fija los colores rojo y negro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de éxito por tarea, comparativas con otras políticas ni métricas de latencia o tasa de acierto.

## Requisitos de hardware

- VRAM estimada: los pesos en precisión de 32 bits ocupan aproximadamente 1,8 GB y en bfloat16 alrededor de 0,9 GB; con los buffers de visión y de acciones, un presupuesto práctico de 4 a 8 GB de VRAM es suficiente.
- GPU recomendadas: cualquier GPU con al menos 8-12 GB de VRAM, como RTX 3060, RTX 4060 Ti, RTX 4070 o RTX 4090. Las A100 y H100 son compatibles pero sobredimensionadas para 450 M de parámetros.
- Cabe en GPU de consumo: sí. El propio paper y la model card destacan el despliegue en hardware de consumo. Una RTX 4090 o una RTX 3060 de 12 GB son opciones holgadas.
- Opciones de despliegue: LeRobot sobre PyTorch, con `--policy.device=cuda` para entrenamiento e inferencia. No es un modelo de texto, por lo que vLLM, llama.cpp, Ollama o TGI no son vías de despliegue previstas.
- Requisitos adicionales: robot compatible (por ejemplo, SO-100 follower), cámaras para las observaciones visuales y el entorno de ejecución de LeRobot instalado.
- Latencia y throughput: no disponibles. No se publican mediciones de frecuencia de control ni de tiempo de inferencia por paso.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `moonjongsul/kcare_hang_cup_red_black_smolvla_261012` | 450.046.176 | No disponible | Colgar taza roja y negra | Apache 2.0 | Hugging Face, 5 descargas |
| `lerobot/smolvla_base` | No disponible (mismo checkpoint base, aproximadamente 450 M) | No disponible | Politica VLA generalista | No disponible en la informacion proporcionada | Hugging Face |
| `moonjongsul/kcare_hang_cup_pink_upper_pi05_261002` | No disponible | No disponible | Colgar taza rosa (variante pi0.5) | No disponible | Hugging Face |
| `moonjongsul/kcare_hang_cup_pink_upper_smolvla_260929` | No disponible | No disponible | Colgar taza rosa (variante SmolVLA) | No disponible | Hugging Face |

No se dispone de métricas comparativas publicadas que permitan ordenar estas políticas por rendimiento. La comparación se limita, por tanto, a arquitectura, licencia y disponibilidad. Los resultados de entrenamiento con `--policy.type=act` mencionados en la model card corresponden a la política ACT de LeRobot, que puede usarse como alternativa, pero no se aportan datos de rendimiento en la información disponible.

## Limitaciones y advertencias

- Especialización extrema: el modelo está ajustado para una única tarea (colgar una taza roja y negra). Fuera de ese escenario, la política probablemente no producirá comportamientos útiles.
- Dependencia del montaje físico: el rendimiento depende de la posición de las cámaras, la iluminación, la mesa y el robot concretos usados al grabar el dataset. Cambios en la configuración pueden degradar el comportamiento.
- Sesgos: no se documentan análisis de sesgo. Al ser un modelo de robótica condicionado por instrucciones, los sesgos relevantes serían los del dataset de demostraciones (posiciones, velocidades y estrategias de agarre concretas).
- Riesgo de fallo y alucinación motora: como toda política de aprendizaje por imitación, puede generar acciones fuera de distribución ante objetos o situaciones no vistas, con riesgo de colisiones o de soltar el objeto.
- Sin métricas publicadas: no hay tasa de éxito, número de episodios de evaluación ni comparativas verificables; el checkpoint tiene 5 descargas y 0 likes, por lo que carece de validación por parte de la comunidad.
- Idiomas y contexto: la model card no declara idiomas soportados ni longitud de contexto. El condicionamiento por lenguaje natural se limita presumiblemente a instrucciones simples en el idioma usado al recoger el dataset.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero conviene verificar las condiciones de los datasets y de los modelos base encadenados (`lerobot/smolvla_base`, `yunjuyoung64/smolvla_hang_cup_red_black_261006`) antes de un despliegue en producción.
- Caveat de producción: no se han publicado datos de latencia ni de frecuencia de control, por lo que el modelo no está validado para ciclos industriales con requisitos de tiempo real estrictos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/moonjongsul/kcare_hang_cup_red_black_smolvla_261012
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/yunjuyoung64/smolvla_hang_cup_red_black_261006
- Paper de SmolVLA (arXiv:2506.01844): https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de entrenamiento de politicas en LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Perfil del autor en Hugging Face: https://huggingface.co/moonjongsul/datasets
- Variante del mismo autor con SmolVLA (taza rosa): https://huggingface.co/moonjongsul/kcare_hang_cup_pink_upper_smolvla_260929
- Variante del mismo autor con SmolVLA (taza azul claro): https://huggingface.co/moonjongsul/kcare_hang_cup_lightblue_smolvla_260917
- Variante del mismo autor con pi0.5 (taza rosa): https://huggingface.co/moonjongsul/kcare_hang_cup_pink_upper_pi05_261002
