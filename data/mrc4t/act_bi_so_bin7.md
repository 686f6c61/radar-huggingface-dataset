# MrC4t/act_bi_so_bin7

## Resumen

MrC4t/act_bi_so_bin7 es una política de imitación (imitation learning) para robótica, entrenada con LeRobot sobre el método ACT (Action Chunking with Transformers) descrito por Zhao et al. (arXiv:2304.13705). No es un modelo de lenguaje ni un modelo multimodal de propósito general: es un controlador visomotor que consume el estado articular de un robot bimanual y tres flujos de imagen RGB (cámara de cabeza y dos cámaras de muñeca) y produce directamente un vector de acción de 12 dimensiones. Su función es ejecutar una única tarea manipulativa aprendida por demostración: introducir un juguete en un contenedor.

El modelo tiene 51.680.908 parámetros y se distribuye en formato safetensors dentro de un repositorio de 2,5 GB, con licencia Apache-2.0. Se entrenó durante 20.000 pasos con AdamW, batch de 8 y tasa de aprendizaje 1e-5 sobre el dataset MrC4t/bi_so_toy_bin, compuesto por 100 episodios y 57.678 fotogramas grabados a 30 FPS mediante teleoperación. La política está asociada al tipo de robot `bi_so_follower`, es decir, un montaje bimanual de brazos tipo SO.

Su relevancia práctica es acotada pero clara: sirve como referencia reproducible de un pipeline completo de aprendizaje por imitación en hardware de bajo coste, y como punto de partida para fine-tuning en tareas de pick-and-place. No se han publicado resultados de evaluación en el repositorio, por lo que su tasa de éxito real en el robot no está documentada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer codificador-decodificador con CVAE para imitación |
| Parametros totales | 51.680.908 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (política robótica; no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors) |
| Idiomas soportados | no aplica (entradas visuales y de estado articular, sin entrada de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repositorio de 2,5 GB) |
| Libreria | LeRobot (entrenado con la versión 0.6.2) |
| Tipo de robot | `bi_so_follower` (bimanual) |
| Camaras de entrada | `head`, `left_wrist`, `right_wrist` |
| Entrada de estado | `observation.state`, forma `(12,)` |
| Salida de accion | `action`, forma `(12,)` |
| Resolucion de imagen | 3 × 480 × 640 por cámara |
| Dataset de entrenamiento | MrC4t/bi_so_toy_bin (100 episodios, 57.678 fotogramas, 30 FPS) |
| Pasos de entrenamiento | 20.000 |
| Optimizador / LR | AdamW / 1e-05 |
| Batch size / semilla | 8 / 1000 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice trozos de acción (action chunks) en lugar de un único paso de control. La arquitectura es un transformer codificador-decodificador con un módulo CVAE: el codificador procesa las observaciones (imágenes de las tres cámaras y el vector de estado de 12 dimensiones) y el decodificador genera una secuencia de acciones futuras. El entrenamiento combina una pérdida de reconstrucción L1 sobre las acciones con un término de regularización KL sobre la variable latente del CVAE, lo que permite modelar la multimodalidad de las demostraciones humanas. En inferencia, ACT suele emplear agregación temporal (temporal ensembling) para suavizar las predicciones entre chunks solapados.

Los datos de entrenamiento son exclusivamente teleoperados: 100 episodios con 57.678 fotogramas totales a 30 FPS (unas 19,2 s por episodio de media) para una única tarea, "put toy in bin". La configuración reportada es de 20.000 pasos, batch de 8, AdamW con LR 1e-5 y semilla 1000, sobre LeRobot 0.6.2. No se documenta en la model card ningún tipo de RLHF, DPO ni ajuste por preferencias, algo por otra parte coherente con el paradigma de imitation learning. No se especifican tampoco innovaciones adicionales más allá de las propias del método ACT (action chunking, CVAE, agregación temporal).

## Capacidades

- Control visomotor bimanual: genera comandos de acción de 12 dimensiones (6 por brazo) a partir de estado articular y tres cámaras.
- Ejecución de una tarea manipulativa concreta aprendida por imitación: "put toy in bin".
- Fusión de tres vistas: cámara de cabeza más dos cámaras de muñeca, a 480 × 640 píxeles cada una.
- Predicción de chunks de acción, lo que reduce la acumulación de error a lo largo del episodio frente a políticas que predicen un único paso.
- Condicionamiento por tarea mediante el campo `--task` en el script de rollout (la política fue entrenada con una única instrucción).
- No dispone de tool calling ni function calling.
- No dispone de razonamiento multi-paso simbólico ni de capacidades de agente.
- No procesa lenguaje natural como entrada ni genera texto.
- No tiene capacidades de visión general (captioning, VQA, detección); las imágenes solo se usan como contexto para la política de control.

## Casos de uso

- Automatización de pick-and-place en banco de pruebas: la política puede recoger un objeto y depositarlo en un contenedor, replicando la tarea entrenada sobre un robot bimanual tipo SO; es adecuada porque el espacio de acciones está ajustado a la morfología exacta del robot objetivo.
- Prototipado de pipelines de aprendizaje por imitación: sirve como referencia funcional del flujo completo de LeRobot (grabación de datos, entrenamiento, rollout) y permite validar la calibración de cámaras y brazos antes de invertir en datasets mayores.
- Fine-tuning sobre tareas similares: al ser un checkpoint ACT de 51,7 M de parámetros con licencia Apache-2.0, se puede reentrenar con nuevos objetos, posiciones o contenedores partiendo de los pesos ya aprendidos.
- Investigación comparativa de políticas: útil como línea base ligera frente a métodos alternativos (Diffusion Policy, políticas VLA) en experimentos de manipulación con presupuesto de cómputo reducido.
- Docencia y divulgación en robótica: un modelo de este tamaño se puede ejecutar y entrenar sin clúster, lo que facilita demostraciones en aula o laboratorio con hardware asequible.
- Validación de infraestructura de inferencia en tiempo real: con control a 30 FPS exige ciclos de inferencia por debajo de 33 ms, de modo que sirve para medir y ajustar la latencia del lazo de control antes de desplegar modelos mayores.
- Recolección de datos guiada: el rollout de la política puede emplearse para generar trayectorias iniciales que después se corrigen manualmente, ampliando el dataset con episodios de recuperación ante fallos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación explícitamente vacía ("No evaluation results have been provided for this policy yet"), por lo que no existen tasas de éxito, número de ensayos ni condiciones de evaluación documentadas. Tampoco se han publicado métricas de latencia o throughput de inferencia.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint tiene 51.680.908 parámetros; en FP32 ocupa aproximadamente 207 MB y en FP16 unos 103 MB, a lo que se suma la memoria de activaciones y de los tres buffers de imagen de 480 × 640.
- Cabe en cualquier GPU de consumo: no requiere aceleradores de centro de datos. Una GPU con 4 GB o más de VRAM es suficiente para el modelo y el preprocesado de las tres cámaras.
- Es viable la inferencia en CPU, aunque con riesgo de no alcanzar los 30 FPS del lazo de control según el hardware.
- GPU recomendadas: no se especifican en la documentación; por tamaño, cualquier RTX serie 30/40, así como A100, H100 o L4, cubren el modelo con holgura. El cuello de botella probable es la captura y codificación de las tres cámaras, no la red.
- Opciones de despliegue: LeRobot mediante `lerobot-rollout` (el flujo oficial documentado), con PyTorch como backend. vLLM, llama.cpp, Ollama y TGI no aplican, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Como referencia derivada del dataset, el control opera a 30 FPS, lo que implica un presupuesto de 33 ms por paso para funcionar en tiempo real.
- Requisitos adicionales: robot `bi_so_follower` calibrado, tres cámaras OpenCV configuradas a 640 × 480 y 30 FPS, y nombres de cámara coincidentes con las claves de observación del entrenamiento.

## Comparativa con modelos similares

Los datos de los modelos alternativos no aparecen en la información proporcionada; se listan únicamente como referencia de categoría y sus cifras se marcan como no disponibles.

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MrC4t/act_bi_so_bin7 | ACT (LeRobot), tarea única | 51,7 M | no aplica | Apache-2.0 | HuggingFace Hub |
| ACT original (Zhao et al., 2023) | ACT, método de referencia | no disponible | no aplica | no disponible | paper y código públicos |
| Diffusion Policy (Chi et al., 2023) | Política de difusión para manipulación | no disponible | no aplica | no disponible | paper y código públicos |
| SmolVLA (HuggingFace) | Política visión-lenguaje-acción | no disponible | no aplica | no disponible | HuggingFace Hub |

Frente a estas alternativas, la diferencia verificable de este checkpoint es su tamaño reducido (51,7 M de parámetros), su licencia Apache-2.0 y su especialización en una sola tarea sobre un robot bimanual concreto, lo que limita su generalización pero reduce drásticamente los requisitos de cómputo.

## Limitaciones y advertencias

- Especialización extrema: se entrenó para una única tarea ("put toy in bin") con un único objeto y un único montaje de robot; no se puede esperar generalización a otras tareas sin reentrenamiento.
- Dataset reducido: 100 episodios y 57.678 fotogramas son un volumen bajo, con riesgo de sobreajuste a posiciones, iluminación y fondo concretos de la escena de grabación.
- Ausencia total de evaluación: no hay tasa de éxito reportada, ni número de ensayos, ni condiciones de prueba, por lo que el rendimiento real en el robot es desconocido.
- Dependencia de la configuración física: los nombres y la disposición de las cámaras deben coincidir exactamente con las claves de observación (`head`, `left_wrist`, `right_wrist`); un cambio de montaje invalida la política.
- Sesgos de los datos de teleoperación: la política reproduce los sesgos y las estrategias del operador que generó las demostraciones, incluidas posibles trayectorias subóptimas.
- Riesgo de fallo silencioso: al no generar texto ni señales de confianza, no hay mecanismo intrínseco de detección de error; un fallo se manifiesta como una acción incorrecta sin aviso.
- Sin capacidades lingüísticas: no acepta instrucciones en lenguaje natural más allá del etiquetado de tarea usado en el entrenamiento.
- Limitaciones de licencia: Apache-2.0 permite uso comercial y modificación, pero no se documentan garantías ni condiciones adicionales del dataset asociado; conviene verificar la licencia de MrC4t/bi_so_toy_bin antes de un uso productivo.
- Advertencia de seguridad: cualquier despliegue en hardware real debe incorporar paradas de emergencia y límites de par, ya que el modelo no incluye salvaguardas de seguridad.
- Fechas del repositorio: la model card indica creación y actualización en septiembre de 2026, con 0 descargas y 0 "likes"; se trata de un artefacto sin adopción ni validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MrC4t/act_bi_so_bin7
- Dataset de entrenamiento: https://huggingface.co/datasets/MrC4t/bi_so_toy_bin
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=MrC4t/bi_so_toy_bin
- Paper de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentación de rollout e inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Flujo de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
