# KyraLeeChunWei/Paracetamol_e200_40K_ACT_aug

## Resumen

Paracetamol_e200_40K_ACT_aug es una política de robótica basada en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705. El modelo ha sido entrenado y publicado con LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica, por el usuario KyraLeeChunWei. Su función es predecir secuencias cortas de acciones (action chunks) a partir de observaciones visuales y del estado del robot, en lugar de generar una acción por paso, lo que mejora la estabilidad y la tasa de éxito en tareas de manipulación.

El modelo tiene 51.678.855 parámetros y un tamaño de repositorio de 0,2 GB, lo que lo sitúa en la categoría de políticas ligeras aptas para inferencia en tiempo real sobre hardware modesto. Se distribuye en formato safetensors bajo licencia Apache 2.0 y está asociado al dataset de entrenamiento KyraLeeChunWei/Paracetamol_e200.

Su relevancia es acotada pero concreta: sirve como ejemplo reproducible de un pipeline completo de entrenamiento y evaluación de ACT con LeRobot, útil para investigadores y desarrolladores que quieran replicar el flujo, adaptarlo a su propio robot o comparar políticas de imitación en tareas de pick-and-place. No es un modelo de lenguaje ni un modelo multimodal de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parametros totales | 51.678.855 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de robótica; no aplica ventana de contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un backbone transformer con un mecanismo de chunking de acciones: el modelo observa imágenes de las cámaras y el estado de las articulaciones, y predice un bloque de acciones futuras en lugar de una sola. Esta formulación reduce el error de compounding y mitiga el problema de las pausas en datos teleoperados. El paper original incorpora además una técnica de temporal ensembling para suavizar las predicciones entre chunks consecutivos.

El entrenamiento se realizó con LeRobot sobre el dataset KyraLeeChunWei/Paracetamol_e200, que por el nombre sugiere una tarea de manipulación de paracetamol con 200 episodios teleoperados. El sufijo "40K" del nombre del modelo apunta a 40.000 pasos de entrenamiento y "aug" a algún tipo de augmentación de datos, aunque la model card no detalla la composición del dataset, el número de tokens ni si se aplicaron técnicas de RLHF o DPO (no aplicables en este contexto). No se especifica el robot concreto ni la configuración de cámaras.

## Capacidades

- Predicción de chunks de acciones para control de robots manipuladores a partir de observaciones visuales y propioceptivas.
- Aprendizaje por imitación a partir de demostraciones teleoperadas.
- Integración nativa con el ecosistema LeRobot: entrenamiento con `lerobot-train` y evaluación con `lerobot-record`.
- Compatible con robots tipo SO-100 follower según el ejemplo de la model card.
- Soporte de inferencia en GPU mediante CUDA (`--policy.device=cuda`).
- No dispone de tool calling, function calling, razonamiento multi-paso simbólico ni capacidades multilingües.
- No es un modelo generativo de texto ni multimodal de propósito general.

## Casos de uso

- Replicación de experimentos de ACT: sirve como checkpoint de referencia para validar un pipeline de LeRobot antes de entrenar políticas propias, comparando curvas de pérdida y tasas de éxito.
- Manipulación pick-and-place de objetos pequeños: el modelo está entrenado sobre episodios de paracetamol, por lo que es directamente aplicable a tareas de agarre y colocación de envases similares en un banco de trabajo.
- Evaluación comparativa de políticas de imitación: al ser un checkpoint público y ligero, permite medir tasas de éxito frente a otras políticas ACT o Diffusion Policy en el mismo entorno.
- Prototipado rápido en robótica de bajo coste: sus 51,7 M de parámetros permiten ejecutarlo en GPUs de consumo o incluso en CPU para pruebas de latencia.
- Docencia y formación: ejemplo completo y reproducible de entrenamiento por imitación con datos teleoperados, útil en cursos de robótica y aprendizaje automático.
- Base para fine-tuning en tareas nuevas: al ser Apache 2.0, se puede reentrenar con un dataset propio de pocos centenares de episodios para adaptar la política a otra pieza u otro robot.
- Generación de datos sintéticos de evaluación: ejecutar la política en simulación o en un robot real para recoger trayectorias y analizar modos de fallo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, métricas de error de posición ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 dado el tamaño de 51,7 M de parámetros y el reducido tamaño del repositorio (0,2 GB); no se dispone de cifras oficiales.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA, incluidas RTX 3060, RTX 4090, A100 o H100; el modelo es lo suficientemente pequeño como para no requerir hardware de datacenter.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer con al menos 2 GB de VRAM; también es viable en CPU para pruebas no críticas.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), con soporte de inferencia en CUDA o CPU. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a políticas de robótica.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del robot, la frecuencia de control y el hardware de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Paracetamol_e200_40K_ACT_aug | 51,7 M | no aplica | no disponible | Apache 2.0 | Hugging Face (LeRobot) |
| ACT original (paper 2304.13705) | no disponible | no aplica | tasas de éxito reportadas en el paper sobre tareas ALOHA | no disponible en la información | paper y código de referencia |
| Diffusion Policy | no disponible | no aplica | no disponible en la información | no disponible en la información | implementaciones públicas en LeRobot |
| Otras políticas LeRobot del Hub | variable | no aplica | no disponible | variable | Hugging Face |

La comparación cuantitativa no es posible con los datos disponibles; la principal diferencia de este checkpoint frente a otros es su carácter de ejemplo reproducible y su licencia permisiva.

## Limitaciones y advertencias

- El modelo está entrenado para una tarea y un robot concretos (paracetamol, probablemente SO-100); su generalización a otros objetos, entornos o morfologías es muy limitada.
- No se documentan sesgos, pero al ser un modelo de imitación hereda los sesgos y errores de las demostraciones teleoperadas.
- Riesgo de fallo por distribución fuera de dominio: cambios de iluminación, fondo, posición de cámara u objeto pueden degradar la política sin aviso.
- No es un modelo de lenguaje: no procesa texto ni responde a instrucciones en lenguaje natural.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria del checkpoint.
- No se especifican los detalles del dataset ni de la augmentación aplicada, lo que dificulta la reproducibilidad exacta.
- La fecha de creación indicada (2026-11-03) es posterior a la fecha actual de referencia habitual; conviene verificar la integridad del repositorio antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KyraLeeChunWei/Paracetamol_e200_40K_ACT_aug
- Dataset de entrenamiento: https://huggingface.co/datasets/KyraLeeChunWei/Paracetamol_e200
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
