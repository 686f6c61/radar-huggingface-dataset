# HRL-Group/stack_50_clean

## Resumen

`HRL-Group/stack_50_clean` es una política de robótica entrenada con el método Action Chunking with Transformers (ACT), una técnica de aprendizaje por imitación que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales. El modelo ha sido entrenado y publicado con LeRobot, la librería de Hugging Face para aprendizaje automático en robótica real, y está asociado al dataset `HRL-Group/stack`.

La política opera sobre un robot de tipo `so_follower` con una única cámara en la muñeca (`wrist`). Consume el estado de las articulaciones (vector de 6 dimensiones) y una imagen RGB de 480x640, y produce un vector de acción de 6 dimensiones. El modelo tiene 51.617.414 parámetros y un tamaño de repositorio de 0,2 GB, lo que lo sitúa en el rango de políticas ligeras desplegables en hardware de consumo.

El modelo resuelve dos tareas concretas de manipulación: apilar un cubo sobre otro y colocar un cubo en una bandeja. Su relevancia es la de un ejemplo reproducible de entrenamiento de políticas visuomotoras con LeRobot, útil para desarrolladores que quieran replicar el flujo completo de captura de datos, entrenamiento y despliegue en un robot de bajo coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.617.414 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; modelo visuomotor) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de una única acción por paso. La política combina un codificador visual para la imagen de la cámara de muñeca con el estado de las articulaciones, y genera un chunk de acciones de 6 dimensiones. El método se describe en el paper arXiv:2304.13705 y está implementado en LeRobot.

El entrenamiento se realizó sobre el dataset `HRL-Group/stack`, compuesto por 92 episodios y 218.681 frames a 30 FPS, con dos tareas: apilar un cubo sobre otro y colocar el cubo en la bandeja. La configuración reportada incluye 100.000 pasos de entrenamiento, batch size de 16, optimizador AdamW, learning rate de 1e-05, semilla 1000 y LeRobot versión 0.7.0. No se especifica el número total de tokens ni si hubo etapas de RLHF o DPO, algo que no aplica a este tipo de políticas.

## Capacidades

- Control visuomotor de un robot `so_follower` a partir de una imagen de muñeca y el estado de las articulaciones.
- Predicción de chunks de acción de 6 dimensiones para manipulación de objetos.
- Ejecución de dos tareas concretas: apilar un cubo sobre otro y colocar un cubo en una bandeja.
- Aprendizaje por imitación a partir de datos de teleoperación.
- Integración con el ecosistema LeRobot para rollout y entrenamiento.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües; no es un modelo de lenguaje.

## Casos de uso

- Replicación de experimentos de aprendizaje por imitación: sirve como referencia para validar un pipeline completo de LeRobot (captura, entrenamiento y rollout) en un robot de bajo coste.
- Apilado de objetos en líneas de montaje ligeras: la política ejecuta la tarea de apilar un cubo sobre otro, adecuada para demostraciones de pick-and-place repetitivo.
- Clasificación y colocación en bandejas: la segunda tarea entrenada permite automatizar la colocación de piezas en contenedores en entornos controlados.
- Base para fine-tuning con datos propios: al ser una política ACT pequeña (51,6 M de parámetros), se puede reentrenar con un dataset propio de pocos centenares de episodios.
- Docencia y formación en robótica: ejemplo práctico de imitación con ACT para cursos de robótica de manipulación.
- Pruebas de integración de hardware: útil para verificar la calibración de un `so_follower` y de la cámara de muñeca antes de desplegar políticas más complejas.
- Benchmark interno de éxito en tareas de manipulación: permite comparar configuraciones de cámara, iluminación y posiciones de objeto con una política de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 dado el tamaño de 51,6 M de parámetros y el repositorio de 0,2 GB; no se dispone de cifras oficiales.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; una RTX 3060 o superior es holgada para inferencia en tiempo real a 30 FPS.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en CPU para inferencia a baja frecuencia.
- Opciones de despliegue: LeRobot (`lerobot-rollout`) con `--policy.path=HRL-Group/stack_50_clean`; el resto de opciones (vLLM, llama.cpp, Ollama, TGI) no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles; el control se ejecuta a 30 FPS según la tasa del dataset.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HRL-Group/stack_50_clean | 51,6 M | no aplica | Manipulación (ACT) | no disponible | Hugging Face |
| Políticas ACT de LeRobot (genéricas) | variable | no aplica | Manipulación (ACT) | según repo | Hugging Face |
| Políticas Diffusion Policy | variable | no aplica | Manipulación | según repo | Hugging Face |
| Políticas VQ-BeT | variable | no aplica | Manipulación | según repo | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No se han publicado resultados de evaluación en robot real; se desconoce la tasa de éxito de las tareas.
- La política está entrenada para un robot `so_follower` con una cámara `wrist`; su uso en otro hardware o configuración de cámara requerirá reentrenamiento.
- Solo cubre dos tareas concretas; no generaliza a otras tareas de manipulación sin fine-tuning.
- El dataset de entrenamiento es pequeño (92 episodios), lo que limita la robustez ante cambios de iluminación, posiciones de objeto o distractores.
- La licencia no está especificada, por lo que no se puede confirmar el uso comercial.
- Riesgo de sobreajuste a las condiciones de captura del dataset original.
- No es un modelo de lenguaje: no soporta texto, tool calling ni razonamiento simbólico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HRL-Group/stack_50_clean
- Dataset de entrenamiento: https://huggingface.co/datasets/HRL-Group/stack
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=HRL-Group/stack
