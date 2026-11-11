# kickking/omx_buds_pick_merge_act_policy_30hz_bs16_ep10

## Resumen

`kickking/omx_buds_pick_merge_act_policy_30hz_bs16_ep10` es una política de robótica entrenada con el algoritmo ACT (Action Chunking with Transformers) dentro del ecosistema LeRobot de Hugging Face. El modelo está diseñado para controlar un brazo robótico en una tarea concreta de manipulación: recoger y fusionar objetos tipo "buds" (probablemente auriculares o piezas pequeñas) a una frecuencia de control de 30 Hz. El autor es el usuario `kickking`, y el repositorio se publicó el 11 de noviembre de 2026.

Se trata de un modelo de aprendizaje por imitación (imitation learning) orientado a robótica, no de un modelo de lenguaje. La nomenclatura del identificador revela los hiperparámetros de entrenamiento: `30hz` indica la frecuencia de captura y control, `bs16` el tamaño de batch (16) y `ep10` el número de épocas (10). El dataset asociado es `kickking/omx_buds_pick_merge_1111`, y el paper de referencia es el de ACT (arXiv:2304.13705).

La relevancia de este modelo es acotada: es una política de robótica específica para una tarea y un robot concretos, publicada sin métricas de rendimiento ni documentación adicional. Resulta útil como ejemplo reproducible de entrenamiento ACT con LeRobot, pero no como componente generalista. No dispone de descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observaciones definida por la política ACT) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | apache-2.0 (según tags del repositorio) |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Frecuencia de control | 30 Hz |
| Tamano de batch de entrenamiento | 16 |
| Epocas de entrenamiento | 10 |
| Dataset de entrenamiento | kickking/omx_buds_pick_merge_1111 |
| Pipeline | robotics |

## Arquitectura y entrenamiento

El modelo emplea ACT (Action Chunking with Transformers), presentado en el paper arXiv:2304.13705. ACT es una arquitectura de aprendizaje por imitación que combina un codificador visual (típicamente un backbone tipo ResNet o ViT) con un transformer que predice "chunks" de acciones futuras en lugar de una sola acción por paso. Esta predicción por bloques reduce el error de compounding y mejora la estabilidad en tareas de manipulación fina. La política toma como entrada observaciones visuales (cámaras del robot) y el estado de las articulaciones, y emite secuencias de comandos motores.

Según el identificador del repositorio, el entrenamiento se realizó con un batch de 16 durante 10 épocas sobre el dataset `omx_buds_pick_merge_1111`, capturado a 30 Hz. No se especifica el número total de episodios, el número de tokens ni si se aplicó regularización adicional. No hay información sobre aumentos de datos, composición del dataset ni técnicas de RLHF/DPO (no aplicables en este contexto de robótica). Tampoco se documenta ninguna innovación técnica más allá de las propias de ACT.

## Capacidades

- Control de un brazo robótico para la tarea de recoger y fusionar objetos tipo "buds" a 30 Hz.
- Aprendizaje por imitación a partir de demostraciones humanas (dataset propio del autor).
- Predicción de chunks de acciones (action chunking) para reducir el error acumulado.
- Procesamiento de observaciones visuales y de estado de articulaciones como entrada.
- Integración nativa con el ecosistema LeRobot (entrenamiento, evaluación y despliegue).
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los LLM.
- No dispone de capacidades multilingües, visión general, audio ni modo "thinking".

## Casos de uso

- Reproducción de experimentos ACT: sirve como referencia reproducible para validar pipelines de entrenamiento con LeRobot usando un dataset y unos hiperparámetros concretos (30 Hz, batch 16, 10 épocas).
- Benchmark interno de manipulación: permite comparar el rendimiento de una política ACT base frente a variantes (p. ej., Diffusion Policy) en la misma tarea de pick-and-merge.
- Base para fine-tuning en tareas similares: al estar en formato safetensors y ligado a LeRobot, puede reentrenarse con un dataset propio de recogida de piezas pequeñas.
- Docencia y formación en robótica de imitación: ejemplo práctico de extremo a extremo (dataset, entrenamiento, política, despliegue) para cursos de aprendizaje por imitación.
- Prototipado de estaciones de ensamblaje: la tarea de "pick and merge" es análoga a operaciones de inserción o ensamblaje de componentes pequeños en líneas de producción.
- Validación de infraestructura de inferencia robótica: útil para probar latencias y throughput a 30 Hz en un robot real o en simulación antes de escalar a políticas más complejas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Las políticas ACT suelen requerir entre 2 y 8 GB de VRAM en FP32/FP16, pero este dato no está confirmado para este modelo concreto.
- GPU recomendadas: no disponible. Por el tamaño típico de ACT, una GPU consumer (RTX 3060 o superior) suele ser suficiente, pero no hay confirmación en la información proporcionada.
- ¿Cabe en GPU consumer? No disponible con certeza; por la arquitectura ACT es probable, pero no se documenta.
- Opciones de despliegue: LeRobot (librería nativa); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a robótica).
- Latencia y throughput estimados: no disponible. La frecuencia de control objetivo es 30 Hz, lo que implica un presupuesto de 33 ms por paso de inferencia, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kickking/omx_buds_pick_merge_act_policy_30hz_bs16_ep10 | ACT | no disponible | no aplica | apache-2.0 | Hugging Face (LeRobot) |
| lerobot/act_aloha_sim_transfer_cube_hanging | ACT | no disponible | no aplica | apache-2.0 | Hugging Face (LeRobot) |
| lerobot/diffusion_pusht | Diffusion Policy | no disponible | no aplica | apache-2.0 | Hugging Face (LeRobot) |

La comparación con alternativas oficiales de LeRobot es orientativa: no se dispone de métricas de rendimiento de este modelo que permitan una comparación cuantitativa con `act_aloha_sim_transfer_cube_hanging` ni con `diffusion_pusht`. La principal diferencia es la tarea objetivo y el dataset de entrenamiento, no la arquitectura.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse con un dataset propio y limitado, la política puede sobreajustarse a las condiciones de captura (iluminación, posiciones, objetos concretos).
- Riesgo de alucinación: no aplica en el sentido de los LLM, pero sí existe riesgo de acciones erráticas fuera de la distribución de entrenamiento.
- Limitaciones de contexto o idioma: no aplica; el modelo no procesa lenguaje natural.
- Restricciones de licencia: la licencia apache-2.0 figura en los tags, pero el campo de licencia del repositorio aparece como "no disponible"; conviene verificar el archivo LICENSE antes de uso comercial.
- Cero descargas y cero likes: no hay evidencia de validación por parte de la comunidad.
- Sin documentación de rendimiento: no se aportan métricas de éxito en la tarea, curvas de entrenamiento ni vídeos de evaluación.
- Especificidad extrema: la política está atada a un robot, una tarea y una frecuencia de 30 Hz; no es transferible sin reentrenamiento.
- Fecha de creación futura (2026-11-11): conviene verificar la integridad y procedencia del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kickking/omx_buds_pick_merge_act_policy_30hz_bs16_ep10
- Dataset de entrenamiento: https://huggingface.co/datasets/kickking/omx_buds_pick_merge_1111
- Paper de ACT: https://arxiv.org/abs/2304.13705
- LeRobot (librería): https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot
