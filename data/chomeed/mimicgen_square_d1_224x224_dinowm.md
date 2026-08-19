# chomeed/mimicgen_square_d1_224x224_dinowm

## Resumen

El modelo `chomeed/mimicgen_square_d1_224x224_dinowm` es un world model de dinámica multi-vista para manipulación robótica, desarrollado por chomeed siguiendo el enfoque DINO-WM (arxiv 2411.04983). A diferencia de los world models que predicen píxeles, este modelo predice **features de parche de DINOv2** en el espacio latente, lo que reduce el error de predicción y evita la necesidad de un loop de difusión. Un solo paso del modelo avanza 8 acciones del entorno (0,4 segundos a 20 fps) mediante una pasada forward determinista.

El modelo está entrenado sobre el dataset MimicGen `square_d1` con dos cámaras (`agentview` y `eye_in_hand`), y condiciona la predicción sobre un historial de 2 frames, un chunk de 8 acciones y el estado del robot (posición del efector, cuaternión y apertura del gripper). La arquitectura combina un encoder DINOv2-small congelado, un predictor transformer de 6 capas y un decoder basado en el VAE de SD3.5 solo para visualización. Con 13,4 millones de parámetros entrenables, el modelo alcanza un error de features latentes un 53 % inferior al baseline de copiar el frame actual.

Este checkpoint es relevante porque demuestra que es posible modelar la dinámica de manipulación robótica en un espacio de features semánticas, con una latencia muy baja y sin necesidad de decodificar a píxeles durante el entrenamiento. Sin embargo, está limitado a un solo paso de predicción y no incluye evaluación de planificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder DINOv2-small (ViT-S/14, congelado) + predictor transformer de 6 capas (6 cabezas, MLP 2048) + decoder SD3 VAE (solo visualizacion) |
| Parametros totales | 13,4 M entrenables (mas DINOv2-small y SD3 VAE congelados, no incluidos en el checkpoint) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventana fija de 2 frames de historia (t-8 y t) por vista, 8 acciones de futuro |
| Tipos de cuantizacion | No disponible (checkpoint en fp32) |
| Idiomas soportados | No disponible (modelo de robotica, sin procesamiento de lenguaje) |
| Licencia | No disponible |
| Formato de pesos | PyTorch checkpoint (.pt, fp32) |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema DINO-WM: un encoder DINOv2-small (ViT-S/14, 384 dimensiones, congelado) convierte cada imagen de 224×224 en 196 parches de 14×14. El predictor es un transformer pre-norm de 6 capas con atención bidireccional completa sobre una secuencia de 1178 tokens: `[2 frames × 2 vistas × 196 parches] + [acción, estado] + [2 × 196 query tokens]`. Las identidades se añaden de forma aditiva mediante embeddings de posición, vista y frame. La pérdida es MSE directo en el espacio de features.

El entrenamiento se realizó sobre tres datasets de MimicGen `square_d1` (éxitos, fallos y el dataset base), con 177 799 ventanas de entrenamiento y 13 998 de validación. El estado del robot se limita a las 9 primeras dimensiones de `observation.state` (posición del efector, cuaternión y apertura del gripper), ignorando el estado de objetos que MimicGen incluye en las dimensiones restantes. Se entrenó durante 60 000 pasos con un solo seed.

Diferencias clave con la implementación de referencia de DINO-WM: soporte multi-vista (ambas cámaras comparten una secuencia con embeddings de vista aprendidos), uso de query tokens explícitos para predecir los frames futuros, y propriocepción solo como entrada (sin predicción de estado ni objetivo de planificación con pérdida proprioceptiva).

## Capacidades

- Predicción de features DINOv2 futuras para dos vistas de cámara simultáneamente (agentview y eye_in_hand).
- Condicionamiento por chunk de acciones (8 pasos) y estado del robot (9 dimensiones).
- Un solo paso determinista hacia adelante, sin difusión ni loop de muestreo.
- Decodificación opcional a RGB mediante el VAE de SD3.5 para inspección visual (no para entrenamiento).
- Método `predict_from_features` para reutilizar el contexto codificado en loops de planificación.
- No soporta tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje.

## Casos de uso

- Planificación de movimientos con MPC/CEM: el modelo puede integrarse en un bucle de control predictivo donde se evalúan múltiples secuencias de acciones y se selecciona la que minimiza el error de features. Aunque el autor no ha evaluado esta métrica, la arquitectura está diseñada para ello.
- Modelado de dinámica para simulación de robots: permite predecir el resultado visual de una secuencia de acciones sin ejecutarlas en el simulador, útil para validar políticas de aprendizaje por refuerzo o imitación.
- Generación de datos sintéticos de entrenamiento: al predecir features futuras, se pueden crear aumentos de datos para políticas de visión-accion sin necesidad de recopilar nuevas demostraciones.
- Inspección visual de trayectorias: el decoder a RGB permite visualizar qué espera el modelo que ocurra tras 0,4 segundos, útil para depurar políticas o entender fallos de ejecución.
- Control predictivo en tiempo real: con una latencia de ~96 muestras/s en una RTX 5090, el modelo puede ejecutar predicciones en bucle cerrado para tareas de manipulación a 20 fps.
- Investigación en world models latentes: sirve como referencia para estudiar la compresión de la dinámica en espacios de features semánticas y comparar con modelos basados en píxeles.

## Benchmarks y rendimiento

Resultados sobre episodios held-out (20 por dataset fuente, 13 998 ventanas) para `square_d1`:

| Metrica | Este modelo | Copy current frame | Oracle (techo del decoder) |
|---|---|---|---|
| Feature MSE | 0,6697 | 1,4278 | — |
| PSNR | 19,82 | 16,99 | 22,10 |
| SSIM | 0,8294 | 0,8577 | 0,8511 |
| LPIPS | 0,2424 | 0,1329 | 0,2040 |

El error latente es un 53 % inferior al baseline de copiar el frame actual. El autor advierte que la columna LPIPS está limitada por el decoder de 0,2 M de parámetros: decodificar features de ground-truth ya da un LPIPS de 0,2040, peor que copiar. Por tanto, la métrica fiable es feature MSE.

Comparativa entre las cuatro tareas MimicGen entrenadas con la misma arquitectura e hiperparámetros (60k pasos):

| Tarea | Feat MSE | Copy | PSNR | Copy | SSIM | Copy | LPIPS | Copy |
|---|---|---|---|---|---|---|---|---|
| coffee_d0 | 0,457 | 1,451 | 23,25 | 18,06 | 0,9167 | 0,9000 | 0,1185 | 0,0977 |
| threading_d0 | 0,499 | 1,554 | 24,12 | 20,17 | 0,9213 | 0,9156 | 0,1169 | 0,0771 |
| square_d1 | 0,670 | 1,428 | 19,82 | 16,99 | 0,8294 | 0,8577 | 0,2424 | 0,1329 |
| hammer_cleanup_d1 | 0,655 | 1,886 | 20,38 | 15,77 | 0,8248 | 0,8233 | 0,2828 | 0,1730 |

El error latente relativo (feat/copy) es 0,31 para coffee, 0,32 para threading, 0,47 para square y 0,35 para hammer. Square es la tarea más difícil y la única donde SSIM queda por debajo del copy, aunque su oracle también es inferior al copy, indicando que tanto el decoder como la predicción contribuyen a esa diferencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible directamente, pero el entrenamiento alcanza un pico de 12,5 GB con batch 32, por lo que la inferencia con batch 1 debería caber en GPUs con 8 GB o menos.
- GPU recomendadas: el entrenamiento se realizó en una RTX 5090 (96 muestras/s, 5,5 horas por tarea). Para inferencia, cualquier GPU consumer con al menos 8 GB de VRAM debería ser suficiente.
- Cabe en GPU consumer: sí, tanto para entrenamiento (RTX 5090) como para inferencia (probablemente RTX 3060 o superior).
- Opciones de despliegue: al ser un checkpoint PyTorch estándar, puede usarse con cualquier framework de inferencia que soporte torch (vLLM no aplica al no ser un LLM). El código de ejemplo usa `transformers` y `diffusers` para los componentes congelados.
- Latencia y throughput: ~96 muestras/s en una RTX 5090 durante el entrenamiento; la inferencia de un solo paso debería ser significativamente más rápida al no requerir backpropagación.

## Comparativa con modelos similares

| Modelo | Enfoque | Parametros entrenables | Multi-vista | Prediccion | Licencia |
|---|---|---|---|---|---|
| Este modelo (DINO-WM multi-vista) | Features DINOv2 | 13,4 M | Sí (2 cámaras) | Determinista, 8 acciones | No disponible |
| DINO-WM original (referencia) | Features DINOv2 | No disponible | No (single-view) | Determinista, N frames | No disponible |
| Copy current frame (baseline) | Copia del frame actual | 0 | No | Trivial | — |

No se dispone de comparaciones con otros world models de robótica (como UniSim o Genie) en la información proporcionada. La comparativa principal es contra la implementación de referencia de DINO-WM, de la que este modelo se diferencia por el soporte multi-vista, los query tokens explícitos y la propriocepción solo como entrada.

## Limitaciones y advertencias

- Entrenado para un solo paso de 8 acciones; el rollout multi-paso con acumulación de errores no ha sido evaluado.
- No hay evaluación de planificación (CEM/MPC) ni de éxito en tareas simuladas, que es la métrica principal del paper DINO-WM.
- Las reconstrucciones visuales son suaves y no fieles, porque las features DINOv2 no fueron entrenadas para ser invertibles.
- Entrenado con un solo seed y una sola tarea por checkpoint; no hay evidencia de generalización a otras tareas o embotellamientos.
- La propriocepción es solo entrada; no se predice el estado del robot, lo que impide usar el objetivo de planificación con pérdida proprioceptiva de la referencia sin añadir una cabeza de estado.
- Licencia no especificada, por lo que no se garantiza su uso comercial.
- El dataset de entrenamiento incluye fallos y éxitos de MimicGen, pero no se detalla el balance entre ambos.
- El modelo ignora el estado de objetos de MimicGen (solo usa las 9 dimensiones de robot), lo que puede limitar la precisión en tareas donde el estado del objeto sea crítico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chomeed/mimicgen_square_d1_224x224_dinowm
- Paper DINO-WM: https://arxiv.org/abs/2411.04983
- Web de MimicGen: https://mimicgen.github.io/
- Repositorio oficial de MimicGen: https://github.com/NVlabs/mimicgen
- Dataset de entrenamiento (éxitos): https://huggingface.co/datasets/chomeed/mimicgen_square_d1_224x224_mtdit_flow_45k_success
- Dataset de entrenamiento (fallos): https://huggingface.co/datasets/chomeed/mimicgen_square_d1_224x224_mtdit_flow_45k_failure
- Dataset base: https://huggingface.co/datasets/chomeed/mimicgen_square_d1_224x224
