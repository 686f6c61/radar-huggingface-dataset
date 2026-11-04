# RoboColosseum/droid-towel-in-basket-g0.5

## Resumen

`RoboColosseum/droid-towel-in-basket-g0.5` es un modelo de visión-lenguaje-acción (VLA) publicado por RoboColosseum dentro de la familia DROID-models-10ep. Se trata de un fine-tuning del checkpoint base G0.5 de OpenGalaxea sobre tareas de manipulación robótica del dataset DROID con un brazo Franka. El repositorio contiene pesos de inferencia y ficheros de configuración para cargar el modelo con la librería LeRobot.

El modelo está entrenado durante 10 épocas en dos tareas concretas del benchmark RoboColosseum: MugOnCoaster y CloseLaptop, partiendo del modelo de 5 épocas y aplicando 5 épocas adicionales con un optimizador reiniciado y el schedule de learning rate desde el principio. El entrenamiento se realizó en una única GPU H200 con precisión fp32 para los pesos maestros y bf16 para el cómputo, usando FSDP y un learning rate de 4e-5 con decaimiento coseno.

La relevancia de este modelo es acotada: no es un modelo de propósito general, sino un artefacto de investigación orientado a reproducir y comparar recetas de fine-tuning VLA sobre tareas de manipulación específicas. Su utilidad principal es servir como referencia para evaluar cómo distintas arquitecturas VLA (GR00T, π0.5, G0.5, MolmoAct2, LingBot-VLA) se comportan bajo el mismo protocolo de entrenamiento en el benchmark RoboColosseum.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) basada en G0.5 de OpenGalaxea; transformer con backbone vision-lenguaje y cabeza de acción |
| Parametros totales | no disponible (tamaño del repo por carpeta: 11.9 GB) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos de inferencia en fp32 maestros con cómputo bf16 durante entrenamiento) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (pesos de inferencia) más ficheros de configuración para LeRobot |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura G0.5 de OpenGalaxea, un modelo VLA que combina un backbone de visión-lenguaje con una cabeza de acción entrenada mediante flow matching (la métrica de pérdida reportada es `fm_loss`). Se entrena de forma completa: backbone de visión, LLM y cabeza de acción, con un learning rate reducido para la parte visual (×0.1) y FSDP para el reparto de memoria en una sola GPU H200. El batch global es de 16 (micro-batch 16 × acumulación 1), con learning rate pico de 4e-5, decaimiento coseno, 200 pasos de warmup y weight decay de 0.03.

Los datos de entrenamiento son dos tareas del dataset DROID en formato LeRobot v3.0 a 30 fps: MugOnCoaster (100 episodios, 41.227 frames, instrucción "mug on coaster") y CloseLaptop (100 episodios, 27.649 frames, instrucción "close laptop"). Se usan tres cámaras (exterior izquierda, exterior derecha y muñeca, todas a 360×640) y el estado/acción es un vector de 8 dimensiones de posiciones articulares absolutas `[Franka arm 7, gripper 1]`. El entrenamiento de las 5 épocas adicionales requirió aproximadamente 12.770 pasos para MugOnCoaster y 8.570 para CloseLaptop, con tiempos de 3h27m y 2h23m respectivamente en una H200. La pérdida `fm_loss` bajó de 0.0394 a 0.0149 (MugOnCoaster) y de 0.0356 a 0.0149 (CloseLaptop) entre el inicio y el final de las épocas adicionales.

## Capacidades

- Control robótico de manipulación mediante políticas VLA: genera acciones de 8 dimensiones (7 articulaciones del brazo Franka más pinza) a partir de observaciones visuales e instrucción en lenguaje natural.
- Ejecución de dos tareas específicas: colocar una taza sobre un posavasos ("mug on coaster") y cerrar un portátil ("close laptop").
- Procesamiento multimodal: integra tres cámaras (exterior izquierda, exterior derecha y muñeca) con resolución 360×640.
- Condicionamiento por instrucción en lenguaje natural (una instrucción fija por tarea en el dataset de entrenamiento).
- Inferencia a 30 fps según el formato del dataset LeRobot v3.0.
- Integración con la librería LeRobot para carga y despliegue.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento general ni otros idiomas.

## Casos de uso

- Investigación en aprendizaje por imitación robótico: el modelo sirve como punto de partida reproducible para estudiar el efecto de extender el entrenamiento de 5 a 10 épocas en políticas VLA sobre tareas DROID, con curvas de pérdida y tiempos de entrenamiento documentados.
- Benchmarking comparativo de arquitecturas VLA: al compartir receta, batch global y dataset con las variantes GR00T N1.7, π0.5, MolmoAct2 y LingBot-VLA v2, permite comparar directamente el rendimiento de G0.5 frente a otras arquitecturas en las mismas tareas.
- Reproducción de experimentos en un solo acelerador: los tiempos de entrenamiento (3h27m y 2h23m en una H200) hacen viable repetir el fine-tuning completo en una única GPU, algo útil para laboratorios con recursos limitados.
- Evaluación de robustez en manipulación con múltiples cámaras: el uso de cámara de muñeca más dos exteriores permite estudiar la contribución de cada vista a la política final.
- Desarrollo de pipelines de despliegue con LeRobot: el repositorio incluye pesos y configuración listos para cargar, lo que facilita integrar el modelo en entornos de simulación o en un Franka real para pruebas de política.
- Base para fine-tuning en tareas nuevas: al ser un checkpoint ya adaptado al dominio DROID/Franka, puede servir como inicialización para tareas adicionales de manipulación con el mismo robot y setup de cámaras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta pérdidas de entrenamiento (`fm_loss`), que el propio autor advierte que no miden el éxito en la tarea; las evaluaciones de éxito corresponden al benchmark RoboColosseum y no se incluyen en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el tamaño de la carpeta del modelo es de 11.9 GB, lo que da una cota inferior orientativa del espacio de pesos en disco.
- GPU de entrenamiento utilizada: 1× NVIDIA H200 (las 5 épocas previas usaron 2× H100 PCIe).
- GPU recomendadas: H200 o H100 para entrenamiento; para inferencia se desconoce el mínimo, aunque por tamaño de pesos cabría esperar que quepa en GPUs de 24 GB o más, sin confirmación oficial.
- Cabe en GPU de consumo: no confirmado; no se documenta soporte para cuantización ni despliegue en GPUs de consumo.
- Opciones de despliegue: librería LeRobot (formato nativo del repositorio); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el dataset está grabado a 30 fps, pero no se reporta latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Base | Tamaño carpeta | Tareas | Cámaras | GBS | LR pico | Licencia |
|---|---|---|---|---|---|---|---|
| G0.5 (este) | OpenGalaxea/G05 | 11.9 GB | MugOnCoaster, CloseLaptop | left, wrist | 16 | 4e-5 | other |
| GR00T N1.7 | nvidia/GR00T-N1.7-3B | 12.6 GB | MugOnCoaster, CloseLaptop | left, wrist | 32 | 1e-4 | other |
| π0.5 | openpi-assets pi05_base | 12.4 GB | MugOnCoaster, CloseLaptop | left, wrist | 32 | 2.5e-5 | other |
| MolmoAct2 | allenai/MolmoAct2 | 21.8 GB | MugOnCoaster, CloseLaptop | left, right, wrist | 64 | 2e-5 (LLM) | other |
| LingBot-VLA v2 6B | robbyant/lingbot-vla-v2-6b | 12.8 GB | MugOnCoaster, CloseLaptop | left, right, wrist | 32 | 1.25e-5 | other |

Todos los modelos comparados pertenecen al mismo repositorio DROID-models-10ep y comparten protocolo de evaluación, pero no se dispone de métricas de éxito comparativas en la información proporcionada. La comparación se limita, por tanto, a configuración de entrenamiento y tamaño.

## Limitaciones y advertencias

- Modelo altamente especializado: solo se ha entrenado en dos tareas concretas ("mug on coaster" y "close laptop") con instrucciones fijas; no generaliza a instrucciones libres ni a otras tareas sin fine-tuning adicional.
- Dependencia del setup físico: asume un brazo Franka con 7 articulaciones más pinza y tres cámaras en posiciones específicas (exterior izquierda, exterior derecha y muñeca) a 360×640; cambiar la configuración invalida la política.
- Sin datos de evaluación de éxito: la model card solo reporta pérdidas de entrenamiento y advierte explícitamente que estas no miden el éxito en la tarea; no hay evidencia publicada de tasa de éxito en RoboColosseum.
- Riesgo de sobreajuste al dataset reducido: 100 episodios por tarea y 10 épocas de entrenamiento completo del backbone pueden provocar sobreajuste; no se documentan resultados en conjuntos held-out.
- Licencia "other": no se especifican los términos exactos de uso comercial ni de redistribución; es necesario consultar el repositorio y la licencia del checkpoint base G0.5 de OpenGalaxea antes de cualquier uso en producción.
- Idiomas no documentados: no se declara soporte multilingüe; las instrucciones del dataset están en inglés.
- Sin información sobre sesgos, alucinación en el sentido lingüístico ni robustez ante perturbaciones visuales.
- Ausencia de soporte documentado para cuantización o despliegue en hardware de consumo, lo que limita su uso fuera de entornos con GPUs de datacenter.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RoboColosseum/droid-towel-in-basket-g0.5
- Repositorio de modelos de 5 épocas: https://huggingface.co/RoboColosseum/DROID-models
- Repositorio de modelos bimanuales YAM (referencia de learning rates): https://huggingface.co/RoboColosseum/BimanualYAM-models
- Checkpoint base G0.5: https://huggingface.co/OpenGalaxea/G05
- Dataset MugOnCoaster: https://huggingface.co/datasets/aarontung/droid-mug-on-coaster
- Dataset CloseLaptop: https://huggingface.co/datasets/aarontung/droid-close-laptop
- Proyecto W&B de entrenamiento: https://wandb.ai/shaileshxml-nus/RoboColosseum
- Checkpoint base GR00T N1.7 (comparativa): https://huggingface.co/nvidia/GR00T-N1.7-3B
- Checkpoint base MolmoAct2 (comparativa): https://huggingface.co/allenai/MolmoAct2
- Checkpoint base LingBot-VLA v2 6B (comparativa): https://huggingface.co/robbyant/lingbot-vla-v2-6b
