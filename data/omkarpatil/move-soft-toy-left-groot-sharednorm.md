# omkarpatil/move-soft-toy-left-groot-sharednorm

## Resumen

El modelo `omkarpatil/move-soft-toy-left-groot-sharednorm` es un fine-tune del modelo fundacional de robótica `nvidia/GR00T-N1.7-3B`, desarrollado por Omkar Patil para la tarea específica de mover un juguete suave hacia la izquierda con el robot ROBOTIS FFW SG2 Rev1. Se trata de un modelo de visión-lenguaje-acción (VLA) entrenado con la receta *shared-norm*, que agrupa estadísticas de normalización entre varias tareas composables (en este caso, `move-soft-toy-left` y `move-soft-toy-right`). El modelo está pensado para ser usado en inferencia dentro de pipelines de robótica, y su relevancia radica en que permite componer políticas entrenadas por separado siempre que compartan la misma transformación de normalización.

Con 3.144 millones de parámetros y un tamaño de repositorio de 12,6 GB, el modelo se distribuye en formato safetensors bajo licencia Apache-2.0. No se especifican detalles de arquitectura interna más allá de su base en GR00T N1.7-3B, ni se proporciona información sobre la longitud de contexto o idiomas soportados, ya que al ser un modelo de robótica, estas métricas no aplican de forma directa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basado en nvidia/GR00T-N1.7-3B (VLA, detalles internos no disponibles) |
| Parametros totales | 3.144.016.000 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de robótica, no procesa texto de forma estándar) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `nvidia/GR00T-N1.7-3B`, un modelo fundacional de robótica de NVIDIA. La arquitectura exacta no se detalla en la ficha, pero al tratarse de un VLA, se asume una combinación de codificadores visuales, un módulo de lenguaje y un decodificador de acciones. El entrenamiento se realizó con el *entrypoint* estándar `gr00t/experiment/launch_finetune.py` sin modificaciones de código, variando únicamente las estadísticas del dataset. Se usó normalización min-max por percentiles (q01/q99) mapeada a [-1, 1], con `use_percentiles=True` y `clip_outliers=True`. La precisión fue fp32, y se emplearon tres cámaras (`cam_left_head`, `cam_left_wrist`, `cam_right_wrist`). El dataset consta de 20 episodios y 2575 frames a 15 fps, con un *action chunk* de 16 pasos (aproximadamente 1,07 segundos). Se entrenó durante 20.000 pasos con learning rate 1e-4, warmup de 0.05, weight decay 1e-5 y batch de 32, alcanzando una pérdida final de entrenamiento de 0.0382. La atención usa PyTorch *sdpa* en lugar de flash-attention-2, por lo que los resultados no son bit-reproducibles con builds de flash-attn.

## Capacidades

- Ejecución de la tarea específica de manipulación robótica: mover un juguete suave hacia la izquierda con el robot FFW SG2 Rev1.
- Procesamiento de observaciones multimodales: imágenes de tres cámaras (cabeza y muñecas) y estado propioceptivo del robot (22 dimensiones de estado, 16 de acción).
- Generación de *action chunks* de 16 pasos, lo que permite planificar movimientos a corto plazo (≈1,07 s).
- Composición con otros modelos del mismo grupo (p. ej., `move-soft-toy-right`) gracias a la normalización compartida, siempre que se verifique el hash de estadísticas `a9a2b7939222c30e`.
- Inferencia directa sin necesidad de reentrenamiento, ya que se excluyen estados de optimizador y checkpoints intermedios.

## Casos de uso

- Investigación en robótica de manipulación: el modelo sirve como punto de partida para estudiar la composición de políticas entrenadas con normalización compartida, permitiendo combinar tareas como mover objetos a izquierda o derecha sin reentrenar.
- Desarrollo de sistemas de control para brazos robóticos de bajo coste: el FFW SG2 Rev1 es un robot asequible, y este fine-tune ofrece una política lista para inferencia en entornos de laboratorio o educativos.
- Benchmarking de algoritmos de aprendizaje por imitación: al ser un fine-tune estándar sin parches de código, puede usarse como referencia para comparar variaciones en normalización, aumentación de datos o arquitecturas.
- Prototipado de aplicaciones de robótica asistiva: la tarea de mover objetos suaves es relevante en entornos domésticos o de cuidado, donde se requiere manipulación delicada.
- Validación de pipelines de despliegue con LeRobot: al estar integrado con la librería `lerobot`, el modelo puede cargarse y ejecutarse en entornos compatibles con esta herramienta.
- Estudio de transferencia entre tareas: la composición con otros modelos del grupo permite experimentar con políticas modulares que comparten estadísticas, útil para investigar generalización en robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica reportada es la pérdida final de entrenamiento (0.0382), que no es comparable con benchmarks estándar de NLP o visión.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente, pero al tratarse de un modelo de ~3B parámetros en fp32, se estima un consumo de memoria de al menos 12 GB solo para los pesos (sin contar activaciones). Con cuantización a 8 bits podría reducirse a ~3-4 GB, aunque no se ofrecen versiones cuantizadas.
- GPU recomendadas: no se especifican, pero por el tamaño, una GPU con 16 GB de VRAM (p. ej., RTX 4080, RTX 4090, A10G) sería suficiente para inferencia en fp32. En consumer, una RTX 3090 o superior podría funcionar.
- Opciones de despliegue: al ser un modelo de robótica con integración LeRobot, se puede ejecutar mediante los scripts de inferencia de LeRobot. No se mencionan compatibilidades con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje generativo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría. El modelo base `nvidia/GR00T-N1.7-3B` es el único punto de referencia claro, pero no se proporcionan métricas comparativas. Se recomienda consultar la documentación de GR00T N1.5 (enlace abajo) para conocer mejoras frente a versiones anteriores, aunque no es directamente comparable con este fine-tune.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para una tarea concreta (mover juguete suave a la izquierda) y no es generalizable a otras tareas sin reentrenamiento.
- La composición con otros modelos solo es válida si comparten el mismo hash de estadísticas de normalización (`a9a2b7939222c30e`); usar modelos de otros grupos puede producir comportamientos incorrectos.
- No es posible reanudar el entrenamiento desde este checkpoint, ya que se excluyen el estado del optimizador y los checkpoints intermedios.
- La atención usa PyTorch *sdpa* en lugar de flash-attention-2, lo que puede afectar al rendimiento en GPUs que dependen de kernels optimizados.
- No se reportan sesgos conocidos, pero al ser un modelo entrenado con un dataset pequeño (20 episodios), es probable que tenga baja robustez ante variaciones en la iluminación, posición de cámara o textura del objeto.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base de NVIDIA puede tener términos adicionales; se recomienda revisar la licencia de `nvidia/GR00T-N1.7-3B`.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/omkarpatil/move-soft-toy-left-groot-sharednorm)
- [Modelo base nvidia/GR00T-N1.7-3B](https://huggingface.co/nvidia/GR00T-N1.7-3B)
- [Página de GR00T N1.5 en NVIDIA Research](https://research.nvidia.com/labs/gear/gr00t-n1_5/)
- [Perfil de modelos de omkarpatil en HuggingFace](https://huggingface.co/omkarpatil/models)
