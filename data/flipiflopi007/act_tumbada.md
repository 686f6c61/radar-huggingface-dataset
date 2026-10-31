# FlipiFlopi007/act_tumbada

## Resumen

`act_tumbada` es una política de robot entrenada con la arquitectura **ACT** (Action Chunking with Transformers) que permite a un brazo robótico **SO-101** coger una linterna tumbada sobre una mesa y levantarla. Ha sido desarrollada por el usuario de HuggingFace **FlipiFlopi007** como fase 1 de un proyecto de hackathon (Hackaton Robotekin), cuya fase 2 prevé iluminar un punto de una PCB mediante control visual (IBVS) y esquiva de obstáculos.

No se trata de un modelo de lenguaje, sino de una política de imitación de comportamiento entrenada sobre el dataset `FlipiFlopi007/so101_tumbada_full` (54 episodios, 20.770 frames) con la librería **LeRobot** de HuggingFace. El modelo combina observaciones de estado (6 articulaciones) con imágenes de dos cámaras (muñeca y superior) para predecir chunks de 100 pasos de acción.

Su relevancia es principalmente didáctica y de demostración: muestra un flujo completo de aprendizaje por imitación (recogida de datos, entrenamiento en hardware de consumo con una RTX 3050 de 4 GB, y despliegue en robot real), incluyendo decisiones prácticas como la elección de checkpoint mediante pruebas físicas en lugar de validación. El checkpoint publicado corresponde al paso 18.000 de un entrenamiento planificado a 20.000.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): ResNet-18 (preentrenado en ImageNet) como backbone visual + transformer (dim 512, 8 cabezas, 4 capas encoder / 1 decoder) con VAE (latente 32, KL 10) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica: política robótica, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tamaño del repo: 0,2 GB) |

## Arquitectura y entrenamiento

La política sigue el esquema ACT: un **ResNet-18** preentrenado en ImageNet extrae características de las dos cámaras (`wrist` en la pinza y `top` fija sobre la mesa, ambas a 640×480), y un **transformer** con dimensión 512, 8 cabezas de atención, 4 capas de encoder y 1 de decoder procesa las observaciones junto con el estado de las 6 articulaciones. Incorpora un **VAE** con latente de dimensión 32 (peso KL de 10) para modelar la multimodalidad de las demostraciones, y predice **chunks de 100 pasos de acción** (posiciones articulares).

El entrenamiento se realizó sobre el dataset `FlipiFlopi007/so101_tumbada_full` (54 episodios, 20.770 frames) con LeRobot 0.6.1, PyTorch 2.11.0+cu128 y Python 3.12. Se usaron batch size 4, learning rate 1e-5 (también para el backbone), 20.000 pasos planificados (detenido en 18.000, checkpoint publicado), augmentación de imágenes al vuelo con hasta 4 transformaciones (brillo, contraste, saturación, tono, nitidez, afín ±5°/±5 %) y validación sobre los últimos 5 episodios (`eval_split=0.08`). El hardware de entrenamiento fue una **RTX 3050 Laptop de 4 GB**, a ~3,4 pasos/s (~1 h 40 min en total). No hubo RLHF ni DPO (no aplican a este tipo de modelo).

Un hallazgo notable documentado por el autor: la pérdida L1 de validación se estanca desde el paso 6.000 (mejor valor 0,255 en el paso 8.000) mientras la de entrenamiento sigue bajando (0,137 en el paso 14.000), señal de memorización. Dado que la validación no predijo el comportamiento real, el checkpoint se eligió probándolo directamente en el robot.

## Capacidades

- **Manipulación robótica por imitación**: coge una linterna tumbada sobre la mesa y la levanta, con el brazo SO-101.
- **Entrada multimodal**: combina `observation.state` (6 articulaciones) con dos flujos de cámara 640×480 (`wrist` y `top`).
- **Salida en chunks de acción**: predice 100 pasos de posiciones articulares por inferencia; en despliegue se recomienda `n_action_steps=60` (recalcula cada 2 s, sin temporal ensembling).
- **Robustez visual moderada**: gracias a la augmentación de imágenes durante el entrenamiento (brillo, contraste, saturación, tono, nitidez, transformaciones afines).
- **Integración en demo con voz**: el repo de GitHub incluye una demo completa con órdenes de voz (`hackaton_demo_rev.py`).
- No es un modelo de lenguaje: no tiene capacidades de texto, razonamiento, código, tool calling ni agentes.

## Casos de uso

- **Demostración educativa de aprendizaje por imitación**: sirve como ejemplo completo y reproducible (dataset, script de entrenamiento, comando de rollout) para aprender el flujo de LeRobot de principio a fin.
- **Agarre de objetos en hackathons y talleres**: automatiza la tarea concreta de coger y levantar una linterna tumbada, útil como base para competiciones de robótica con el SO-101.
- **Base para tareas de fase 2 (IBVS)**: al levantar la linterna, habilita la siguiente etapa del proyecto, iluminar un punto de una PCB con control visual desde la cámara superior.
- **Prototipado de políticas ACT en hardware de consumo**: demuestra que se puede entrenar una política funcional en una GPU de 4 GB, útil para laboratorios con presupuesto limitado.
- **Banco de pruebas de calibración**: el repo de GitHub incluye la calibración de los brazos usados, útil como referencia para replicar el montaje en otros SO-101.
- **Estudio de selección de checkpoints en robótica**: caso real donde la validación offline no predice el comportamiento en el robot, útil como material docente sobre evaluación de políticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, etc.); al ser una política robótica, no aplican. Los datos de rendimiento disponibles son los del propio proyecto:

| Metrica | Valor |
|---|---|
| Pérdida L1 de validación (mejor) | 0,255 (paso 8.000) |
| Pérdida L1 de validación (paso 18.000) | 0,255–0,268 (plana desde el paso 6.000) |
| Pérdida L1 de entrenamiento (paso 14.000) | 0,137 |
| Checkpoint 14.000 en robot | 2 de 2 agarres exitosos |
| Checkpoint 18.000 en robot | éxito en todas las ejecuciones de la demo del 24–25/10 (sin recuento formal) |
| Velocidad de entrenamiento | ~3,4 pasos/s en RTX 3050 Laptop 4 GB |

## Requisitos de hardware

- **Entrenamiento**: se completó en una **RTX 3050 Laptop con 4 GB de VRAM** a ~3,4 pasos/s (~1 h 40 min para 18.000 pasos con batch size 4). Cualquier GPU de consumo con ≥4 GB de VRAM debería ser suficiente.
- **Inferencia**: el modelo pesa ~0,2 GB (51,7 M de parámetros); la inferencia puede ejecutarse en GPU de consumo modesta o incluso en CPU, aunque no hay datos publicados de latencia. La carga principal la llevan las cámaras (2×640×480 a 30 fps).
- **Robot**: brazo **SO-101** (follower) con 6 articulaciones, conectado por puerto serie (ejemplo: COM13), y dos cámaras OpenCV (una en la pinza, otra fija en diagonal sobre la mesa).
- **Software**: LeRobot 0.6.1, PyTorch 2.11.0+cu128, Python 3.12.
- **Despliegue**: mediante `lerobot-rollout` (comando documentado en la model card). No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a políticas de LeRobot).
- **Latencia/throughput**: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FlipiFlopi007/act_tumbada | ACT (LeRobot) | 51,7 M | Agarre de linterna tumbada con SO-101 | apache-2.0 | HuggingFace (pesos safetensors) |
| Políticas ACT genéricas de LeRobot (p. ej. `lerobot/act_so101_*`) | ACT (LeRobot) | ~50 M (orden de magnitud) | Tareas de manipulación con SO-100/SO-101 | apache-2.0 (habitual) | HuggingFace |
| Políticas Diffusion Policy de LeRobot | Diffusion Policy | no disponible | Manipulación por imitación, multimodal | varía | HuggingFace |

Nota: la comparativa es orientativa; no hay datos de rendimiento comparativos publicados para estas políticas en tareas equivalentes.

## Limitaciones y advertencias

- **Dependencia fuerte de la escena**: la cámara `top` debe estar exactamente en la posición de las demos; si se mueve, el brazo sube y baja sin llegar a coger.
- **Postura de inicio obligatoria**: el brazo debe arrancar en `[0.4, -103.1, 96.2, 53.4, -7.5, 0.6]`.
- **Generalización muy limitada**: solo funciona con la linterna tumbada, con la misma orientación y en la zona de agarre de las demos.
- **Calibración**: con otros brazos SO-101 hay que recalibrar con el mismo criterio (la calibración de los brazos usados está en el repo de GitHub).
- **Memorización**: la validación se estanca mientras el entrenamiento mejora; el checkpoint se eligió empíricamente en el robot, no por métricas offline.
- **Ajustes delicados en despliegue**: con `n_action_steps=100` o duraciones de 20 s aparecen temblores al acabar el agarre; con límite de pinza de 10 por orden, el motor 6 entra en protección por sobrecarga (se recomienda 3).
- **Evaluación informal**: el checkpoint 18.000 no tiene un recuento formal de aciertos; solo el 14.000 tiene un resultado cuantificado (2/2).
- **Licencia**: apache-2.0, sin restricciones para uso comercial, pero el modelo solo es útil con el hardware y la escena descritos.
- **Sesgos y alucinación**: conceptos no aplicables a este tipo de política; el riesgo equivalente es el sobreajuste a las demostraciones, ya documentado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FlipiFlopi007/act_tumbada
- Dataset de entrenamiento: https://huggingface.co/datasets/FlipiFlopi007/so101_tumbada_full
- Repositorio de GitHub (demo completa con órdenes de voz): https://github.com/flipiflopi/Hackaton_Robotekin_SO-101_MSN
- Librería LeRobot: no disponible enlace directo en la información proporcionada (documentación oficial de LeRobot en HuggingFace)
