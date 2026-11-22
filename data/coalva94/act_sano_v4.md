# coalva94/act_sano_v4

## Resumen

ACT Policy V4 (`act_sano_v4`) es una política de imitación para robótica de manipulación, desarrollada por el usuario `coalva94` en el contexto del Hackathon Physical AI Bilbao. Se trata de un fine-tuning del modelo `coalva94/act_sano_v3` mediante la librería LeRobot de Hugging Face, y resuelve una tarea concreta de clasificación y evacuación: recoger cubos verdes ("sano") y trasladarlos a un almacén designado, evitando la contaminación cruzada con objetos de otras categorías. El modelo se ejecuta sobre un robot SO-101 (`so_follower`) con dos cámaras (superior y del brazo).

La arquitectura es Action Chunking with Transformers (ACT), un método de aprendizaje por imitación que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales, lo que reduce el error acumulado y mejora la estabilidad en tareas de manipulación de precisión. Con 51.668.614 parámetros y un repositorio de 0,2 GB, es un modelo compacto orientado a inferencia en tiempo real a 30 FPS.

Su relevancia es acotada pero clara: demuestra un flujo completo de entrenamiento por imitación con datos teleoperados, aumentación en GPU y despliegue dual (políticas separadas para objetos sanos y contaminados), un patrón útil para tareas de clasificación robótica donde la precisión de selección es crítica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de imitación con observaciones por frame) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica; las tareas se especifican en castellano) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | LeRobot 0.7.1 |
| Tipo de robot | so_follower (SO-101) |
| Camaras | camera_top, camera_robot (3, 480, 640) |
| Entrada de estado | observation.state (6,) |
| Salida de accion | action (6,) |
| Frecuencia de datos | 30 FPS |
| Modelo base | coalva94/act_sano_v3 |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación basado en transformer que predice chunks de acciones de horizonte corto a partir de observaciones multimodales (estado propioceptivo de 6 dimensiones y dos flujos de imagen RGB de 480x640). La política consume `observation.state` y las imágenes de `camera_top` y `camera_robot`, y emite un vector de acción de 6 dimensiones. El chunking de acciones mitiga el error de compounding que afecta a políticas que predicen paso a paso.

El fine-tuning se realizó sobre `coalva94/act_sano_v3` durante 13.000 pasos, con batch size de 32, optimizador AdamW, learning rate de 1,2e-5 y semilla 1000, en una NVIDIA A100-large. El dataset `coalva94/bilbao_triage_sano_v3` contiene 96 episodios y 34.960 frames a 30 FPS, con tareas como "b7_verde_bordes_dificiles", "b9_verde_frontal_4cubos" o "b13_verde_recuperacion_desplazado". Se aplicó aumentación en GPU con ColorJitter, SharpnessJitter y RandomAffine de ±7 grados y ±8 por ciento. La pérdida final registrada fue de 0,083 (L1 de 0,082). No se documenta el uso de RLHF ni DPO, algo esperable en aprendizaje por imitación.

## Capacidades

- Manipulación robótica de precisión: recogida y traslado de cubos verdes a una zona de almacén designada.
- Clasificación visual de objetos por color y posición mediante dos cámaras simultáneas.
- Ejecución de políticas de imitación en tiempo real a 30 FPS sobre el robot SO-101.
- Generalización moderada a posiciones difíciles, bordes, columnas y desplazamientos, según las tareas del dataset (bordes difíciles, posiciones atrás, recuperación desplazado).
- Operación en modo dual junto a `act_contaminado_v4`, con separación estricta de políticas para evitar contaminación cruzada.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento en lenguaje natural: es una política motora, no un modelo de lenguaje.
- No dispone de capacidades multilingües, de visión general, audio ni thinking mode.

## Casos de uso

- Clasificación de residuos en línea de producción: la política recoge únicamente objetos de una categoría (cubos verdes) y los deposita en el contenedor correcto, usando la cámara superior para localizar y la del brazo para el agarre fino.
- Triage en almacén logístico: separación de lotes "sanos" frente a "contaminados" mediante dos políticas complementarias (`act_sano_v4` y `act_contaminado_v4`), reduciendo errores de mezcla en entornos donde la contaminación cruzada es costosa.
- Recogida en posiciones difíciles: el entrenamiento incluye tareas como "bordes difíciles" y "posiciones atrás y columnas", por lo que el modelo es adecuado para recoger objetos en esquinas, columnas o zonas de acceso restringido del espacio de trabajo.
- Recuperación tras desplazamiento del objeto: la tarea "b13_verde_recuperacion_desplazado" entrena al modelo para reajustar la trayectoria cuando el objeto no está en la posición esperada, útil en cintas transportadoras con deriva.
- Demostración educativa de aprendizaje por imitación: el repositorio incluye el flujo completo (dataset, aumentación, entrenamiento y rollout) y sirve como plantilla reproducible para cursos y hackathones de robótica con LeRobot.
- Prototipado rápido de políticas de manipulación: con 51,7 M de parámetros y 0,2 GB, se puede iterar y desplegar en hardware modesto, lo que facilita pruebas de concepto antes de escalar a políticas mayores.
- Integración en panel de supervisión: el modelo puede combinarse con el supervisor OpenCV y el panel web dual-view del proyecto para monitorizar la ejecución y detectar fallos de agarre.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta la pérdida de entrenamiento final: `loss: 0.083` y `l1_loss: 0.082` a 13.000 pasos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,7 M de parámetros en safetensors (0,2 GB de repo) la inferencia cabe holgadamente en GPUs de consumo, pero no se documenta el consumo exacto.
- GPU de entrenamiento documentada: NVIDIA A100-large, 13.000 pasos con batch size 32.
- GPU recomendadas para inferencia: cualquier GPU con al menos 4-6 GB de VRAM debería ser suficiente para el modelo y los dos flujos de cámara; no se confirma en la documentación.
- Cabe en GPU de consumo: previsiblemente sí (RTX 3060, RTX 4060, RTX 4090), aunque el dato no está verificado en la model card.
- Opciones de despliegue: `lerobot-rollout` con `--strategy.type=base` y `--policy.path=coalva94/act_sano_v4`; también es posible cargar la política desde LeRobot en scripts propios.
- Latencia y throughput: no disponible; el dataset y la inferencia están diseñados para 30 FPS.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Robot | Camaras | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| coalva94/act_sano_v4 | 51.668.614 | ACT (imitacion) | SO-101 | 2 | no disponible | Hugging Face |
| coalva94/act_sano_v3 | no disponible | ACT (imitacion) | SO-101 | no disponible | no disponible | Hugging Face |
| coalva94/act_contaminado_v4 | no disponible | ACT (imitacion) | SO-101 | no disponible | no disponible | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables para establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Licencia no especificada: la model card indica "More Information Needed" y el Hub no declara licencia, por lo que el uso comercial queda sin autorización explícita.
- Modelo de robótica especializado: no es un modelo de lenguaje ni un asistente; no responde a prompts textuales ni genera texto.
- Sesgo de dominio: entrenado exclusivamente sobre cubos verdes en un entorno de triage concreto; su generalización a otros objetos, colores o layouts no está garantizada.
- Dependencia de calibración: requiere que los nombres y la resolución de las cámaras coincidan exactamente con los usados en entrenamiento (`camera_top`, `camera_robot`, 640x480, 30 FPS) y que el robot SO-101 esté calibrado.
- Riesgo de fallo en agarre: la pérdida L1 de 0,082 indica error residual; en producción puede traducirse en agarres imprecisos en posiciones no vistas.
- Sin métricas de éxito publicadas: no hay tasas de éxito por tarea ni validación en entornos no vistos, lo que limita la evaluación de robustez.
- Idiomas: las tareas están descritas en castellano; no se documenta soporte multilingüe ni su influencia en el comportamiento.
- Fecha de creación futura (2026-11-22): conviene verificar la integridad y procedencia del repositorio antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/coalva94/act_sano_v4
- Modelo base: https://huggingface.co/coalva94/act_sano_v3
- Política complementaria: https://huggingface.co/coalva94/act_contaminado_v4
- Dataset de entrenamiento: https://huggingface.co/datasets/coalva94/bilbao_triage_sano_v3
- Dataset V4: https://huggingface.co/datasets/coalva94/bilbao_triage_contaminado_v4
- Dataset completo V3: https://huggingface.co/datasets/coalva94/bilbao_triage_complete_v3
- Paper ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Código del robot y supervisor OpenCV: https://github.com/IdhamSdmc/physicalai-hack-lab
- Panel web dual-view: https://github.com/coalva94/web-io-robot
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=coalva94/bilbao_triage_sano_v3
