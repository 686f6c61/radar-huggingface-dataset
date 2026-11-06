# RoboColosseum/droid-open-drawer-molmoact2

## Resumen

DROID-open-drawer-molmoact2 es un modelo de visión-lenguaje-acción (VLA) para robótica de manipulación, publicado por el colectivo RoboColosseum como parte de su suite de referencia para el benchmark RoboColosseum. Se trata de un ajuste fino del checkpoint base AllenAI MolmoAct2 sobre tareas del dataset DROID con brazo Franka, concretamente las instrucciones "mug on coaster" y "close laptop", entrenado durante 10 épocas en total. El modelo se distribuye en formato LeRobot con pesos safetensors y está pensado para su uso en evaluación de políticas de imitación sobre hardware real o simulado.

El interés del modelo es doble. Por un lado, sirve como referencia reproducible de cómo se comporta MolmoAct2 cuando se especializa en tareas concretas de manipulación con un único brazo, frente a otros VLA comparables como GR00T N1.7, π0.5, G0.5 o LingBot-VLA v2, todos ellos presentes en la misma suite. Por otro, documenta con detalle el recetario de entrenamiento (learning rates, batch global, acumulación de gradiente, número de pasos y tiempos de pared) y las curvas de pérdida de cada fase, lo que facilita replicar el experimento.

Con 5.442.196.272 parámetros y un tamaño de repositorio de 10,9 GB, el modelo es de escala media-grande dentro de los VLA. No obstante, la model card no proporciona información sobre la longitud de contexto, los idiomas soportados ni los resultados de éxito en el benchmark, por lo que su evaluación práctica queda supeditada a las métricas que publique RoboColosseum en su web o en el proyecto de W&B asociado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action); backbone VLM + cabeza de acción, según el checkpoint base MolmoAct2 |
| Parametros totales | 5.442.196.272 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; la model card no detalla cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | other (ver limitaciones) |
| Formato de pesos | safetensors (formato LeRobot) |

## Arquitectura y entrenamiento

El modelo parte del checkpoint base `allenai/MolmoAct2`, un VLA que combina un backbone de visión-lenguaje con una cabeza de acción especializada. En este ajuste fino se entrena la totalidad del modelo (backbone VLM completo más la cabeza de acción), con cámaras de entrada izquierda, derecha y de muñeca, y con estado y acción representados como posiciones articulares absolutas de 8 dimensiones `[brazo Franka 7, pinza 1]`. La precisión de entrenamiento es fp32 para los pesos maestros y bf16 para el cómputo.

El recetario de entrenamiento está documentado con precisión: batch global de 64 (micro-batch 32 × acumulación 2) sobre una sola GPU H200, con learning rates diferenciados de 2e-5 para el LLM, 1e-5 para el ViT, 1e-5 para el conector y 1e-4 para el experto de acción. El ajuste se realizó en dos fases: primero 5 épocas partiendo del checkpoint base, y después 5 épocas adicionales partiendo de los pesos finales de la primera fase, con optimizador nuevo y reinicio del schedule de learning rate. Los datos de entrenamiento provienen de dos datasets DROID de 100 episodios cada uno: `aarontung/droid-mug-on-coaster` (41.227 frames) y `aarontung/droid-close-laptop` (27.649 frames), ambos a 30 fps y con cámaras de 360x640.

## Capacidades

- Manipulación robótica de un solo brazo Franka para tareas de pick-and-place y manipulación de objetos cotidianos.
- Ejecución de instrucciones en lenguaje natural ("mug on coaster", "close laptop") condicionadas por observaciones visuales de tres cámaras.
- Política de imitación entrenada sobre demostraciones teleoperadas del dataset DROID.
- Control de pinza y de las siete articulaciones del brazo mediante posiciones articulares absolutas.
- Integración con el ecosistema LeRobot para carga y despliegue de políticas.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento explícito ni procesamiento de audio.

## Casos de uso

- Evaluación comparativa de VLA en RoboColosseum: el modelo sirve como una de las cinco políticas de referencia de la suite, permitiendo comparar su tasa de éxito frente a GR00T N1.7, π0.5, G0.5 y LingBot-VLA v2 en las mismas tareas y con los mismos datos.
- Reproducción de experimentos de ajuste fino: la model card detalla learning rates, batch global, pasos y tiempos de pared, lo que permite replicar el entrenamiento en una sola GPU H200 en aproximadamente 7,5 horas para la tarea de MugOnCoaster y 5 horas para CloseLaptop en la fase de 5 épocas adicionales.
- Investigación en políticas de imitación con múltiples cámaras: al usar tres vistas (izquierda, derecha y muñeca), el modelo es útil para estudiar el impacto de la configuración sensorial en tareas de manipulación fina como colocar una taza sobre un posavasos.
- Prototipado de aplicaciones de robótica doméstica: tareas como cerrar un portátil o colocar objetos sobre superficies son representativas de la manipulación de objetos cotidianos, y el modelo puede servir de base para adaptaciones a entornos domésticos simulados.
- Benchmarking de hardware de inferencia: con 5.442 millones de parámetros y pesos safetensors, el modelo permite medir latencia y throughput de políticas VLA en GPUs de datacenter (H200, H100) y comparar con alternativas de menor tamaño como LingBot-VLA v2 6B o G0.5.
- Docencia y divulgación: la documentación detallada del proceso de entrenamiento en dos fases con reinicio del optimizador lo convierte en un ejemplo didáctico de ajuste fino de VLA con presupuesto limitado de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta pérdidas de entrenamiento (`train/action_flow_loss`), que no constituyen una medida de éxito en la tarea. Los valores documentados son:

| Fase | MugOnCoaster | CloseLaptop |
|---|---|---|
| Fin de 5 épocas | 0,0114 | 0,0129 |
| Inicio de +5 épocas | 0,0131 | 0,0145 |
| Fin de 10 épocas | 0,0084 | 0,0108 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 5.442 millones de parámetros en bf16, el peso de los pesos ronda los 10,9 GB, por lo que se necesita al menos esa cantidad más el overhead de activaciones y del backbone visual.
- GPU recomendadas: H200 (utilizada en el entrenamiento), H100 PCIe y H200 NVL (usadas en las fases de 5 épocas de la suite).
- ¿Cabe en GPU de consumo? No se documenta; con 10,9 GB de pesos en bf16, una RTX 4090 de 24 GB podría albergarlo en teoría, pero no hay validación publicada.
- Opciones de despliegue: LeRobot (librería declarada en el repositorio). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no son adecuados para políticas VLA.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| DROID-open-drawer-molmoact2 (este) | 5.442 M | no disponible | other | Hugging Face, LeRobot |
| GR00T N1.7 (NVIDIA) | ~3 B (según checkpoint base) | no disponible | no disponible | Hugging Face (`nvidia/GR00T-N1.7-3B`) |
| π0.5 (openpi) | no disponible | no disponible | no disponible | Checkpoint en `gs://openpi-assets` |
| G0.5 (OpenGalaxea) | no disponible | no disponible | no disponible | Hugging Face (`OpenGalaxea/G05`) |
| LingBot-VLA v2 6B | 6 B (según nombre) | no disponible | no disponible | Hugging Face (`robbyant/lingbot-vla-v2-6b`) |

No se dispone de métricas de éxito comparativas publicadas en la información proporcionada; la comparación se limita a tamaño, procedencia y disponibilidad.

## Limitaciones y advertencias

- La licencia es "other", lo que impide confirmar si se permite uso comercial; es necesario consultar los términos del checkpoint base `allenai/MolmoAct2` y de RoboColosseum antes de cualquier despliegue productivo.
- El modelo está especializado en dos tareas concretas ("mug on coaster" y "close laptop") sobre un brazo Franka; no es un modelo generalista de manipulación.
- No se han publicado tasas de éxito en el benchmark RoboColosseum, por lo que no se puede afirmar su rendimiento real en tarea.
- La pérdida de entrenamiento no es una medida de éxito; la propia model card advierte de ello.
- No se documentan sesgos, idiomas soportados ni comportamiento ante instrucciones fuera de distribución.
- Riesgo de sobreajuste a las condiciones de cámara y entorno de los datasets DROID utilizados (360x640, tres vistas, iluminación y disposición concretas).
- El tamaño del repositorio (10,9 GB) y la falta de cuantizaciones documentadas complican el despliegue en hardware de bajos recursos.
- La fecha de creación indicada (2026-11-04) y la ausencia de descargas y likes sugieren un modelo reciente y sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/RoboColosseum/droid-open-drawer-molmoact2
- Suite de 5 épocas: https://huggingface.co/RoboColosseum/DROID-models
- Suite bimanual YAM: https://huggingface.co/RoboColosseum/BimanualYAM-models
- Checkpoint base: https://huggingface.co/allenai/MolmoAct2
- Checkpoint base GR00T N1.7: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Checkpoint base G0.5: https://huggingface.co/OpenGalaxea/G05
- Checkpoint base LingBot-VLA v2: https://huggingface.co/robbyant/lingbot-vla-v2-6b
- Dataset MugOnCoaster: https://huggingface.co/datasets/aarontung/droid-mug-on-coaster
- Dataset CloseLaptop: https://huggingface.co/datasets/aarontung/droid-close-laptop
- Proyecto W&B de entrenamiento: https://wandb.ai/shaileshxml-nus/RoboColosseum
