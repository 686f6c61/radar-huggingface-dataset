# masondx/diff_new_tension_cut_rot_real_clean

## Resumen

Este modelo es una política de control visuomotor basada en difusión, entrenada con el framework LeRobot y publicada en Hugging Face por masondx (Hongming Mei). Está diseñada para ejecutar tareas de manipulación robótica que requieren precisión y contacto físico, como cortar materiales bajo tensión o realizar rotaciones controladas. El modelo trata la generación de acciones como un proceso de difusión, produciendo trayectorias de acción suaves y multi-paso, lo que lo hace adecuado para tareas con alto contacto y dinámicas complejas.

Con 277,2 millones de parámetros y un tamaño de repositorio de 1,1 GB, es un modelo de tamaño moderado que puede ejecutarse en hardware de consumo. Fue entrenado con LeRobot y su dataset asociado es `masondx/new_tension_cut_rot_real_clean0`, que recoge demostraciones reales de la tarea. Su licencia Apache 2.0 permite uso comercial sin restricciones adicionales. Actualmente no se dispone de información sobre benchmarks públicos ni comparaciones con otros modelos similares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (visuomotor) |
| Parametros totales | 277.224.436 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No disponible (pesos en safetensors) |
| Idiomas soportados | No aplica (modelo robótico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en el enfoque de Diffusion Policy, presentado en el paper arXiv:2303.04141. En lugar de predecir directamente una acción única, el modelo genera una secuencia de acciones mediante un proceso de difusión iterativo, lo que permite producir trayectorias suaves y coherentes incluso en tareas con contacto físico. La arquitectura concreta (backbone, tipo de red neuronal, etc.) no se especifica en la información disponible.

El entrenamiento se realizó con el framework LeRobot, que proporciona herramientas para el entrenamiento y evaluación de políticas de control. El dataset utilizado, `masondox/new_tension_cut_rot_real_clean0`, contiene datos reales de la tarea de corte bajo tensión y rotación. No se han publicado detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO, ya que se trata de un modelo de control, no de lenguaje.

## Capacidades

- Generación de trayectorias de acción suaves y multi-paso para control robótico.
- Adecuado para tareas de manipulación con contacto, como cortar materiales, ajustar rotaciones o ensamblar piezas.
- Ejecución de acciones en tiempo real sobre robots reales, como el robot SO-100 (follower) mencionado en la documentación.
- Integración con el ecosistema LeRobot para entrenamiento y evaluación.
- No dispone de capacidades de lenguaje, tool calling ni agentes, ya que es un modelo de control puro.
- No es multilingüe ni tiene capacidades de visión por sí solo; depende de la entrada de imágenes del robot.

## Casos de uso

- **Control de un brazo robótico para cortar materiales bajo tensión**: el modelo puede generar trayectorias precisas de corte, ajustando la fuerza y la velocidad según la resistencia del material, gracias a su capacidad de producir acciones suaves y continuas.
- **Tareas de rotación de piezas en ensamblaje**: por ejemplo, girar un objeto para alinear correctamente antes de encajarlo, aprovechando la generación de secuencias de acción que mantienen la estabilidad.
- **Manipulación de objetos deformables**: como cuerdas o cables, donde el contacto y la deformación requieren un control fino y adaptativo.
- **Automatización de procesos de fabricación**: integrar la política en una línea de producción para tareas de corte o ensamblaje, reduciendo la intervención manual.
- **Investigación en robótica de bajo coste**: al ser un modelo ligero, se puede desplegar en plataformas como el robot SO-100, facilitando experimentos en laboratorios con recursos limitados.
- **Entrenamiento de políticas para tareas específicas**: sirve como punto de partida para adaptar la política a otras tareas de manipulación mediante fine-tuning con LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como éxito en tareas, precisión de acción o comparaciones con otras políticas.

## Requisitos de hardware

- **VRAM estimada**: no disponible. Dado el tamaño de 277 millones de parámetros, se puede estimar que la inferencia en FP16 consuma alrededor de 0,6 GB de VRAM, pero no hay confirmación.
- **GPU recomendadas**: no se especifican. Por el tamaño, es probable que funcione en GPUs de consumo como una RTX 3060 o superior, pero no hay datos oficiales.
- **Compatibilidad**: el modelo está diseñado para ejecutarse en la librería LeRobot, que soporta PyTorch y CUDA.
- **Opciones de despliegue**: se puede ejecutar con los scripts de LeRobot (`lerobot-record` para evaluación) y mediante el pipeline de robótica de Hugging Face. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No hay información disponible sobre modelos comparables de la misma categoría (políticas de control robótico) con los que comparar. El autor tiene otro modelo similar, `masond/diff_new_tension_cut_rope_rot_state20`, pero no se dispone de sus especificaciones ni rendimiento. Por tanto, no se puede realizar una comparativa.

## Limitaciones y advertencias

- **Especificidad de tarea**: el modelo está entrenado para una tarea concreta (corte bajo tensión y rotación) y no es generalizable a otras tareas de manipulación sin reentrenamiento.
- **Dependencia del dataset**: la calidad de las acciones depende de la calidad y diversidad de los datos de entrenamiento. No se conoce el tamaño ni la composición del dataset.
- **Riesgo de alucinación**: al ser un modelo de control, puede generar acciones no válidas o inseguras si la entrada no está dentro de la distribución de entrenamiento.
- **Sesgos**: no se han documentado sesgos específicos, pero al estar entrenado en un entorno concreto, puede tener sesgos hacia ese entorno (iluminación, posición de cámara, tipo de objeto).
- **Restricciones de licencia**: la licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos de los datos del dataset asociado, ya que no se especifica su licencia.
- **Despliegue en producción**: requiere un robot físico con el hardware adecuado (cámaras, actuadores) y un entorno controlado. No es un modelo autónomo.

## Enlaces

- [Hugging Face - masondx/diff_new_tension_cut_rot_real_clean](https://huggingface.co/masondx/diff_new_tension_cut_rot_real_clean)
- [Paper de Diffusion Policy (arXiv:2303.04141)](https://huggingface.co/papers/2303.04141)
- [LeRobot (GitHub)](https://github.com/huggingface/lerobot)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Dataset asociado](https://huggingface.co/datasets/masondx/new_tension_cut_rot_real_clean0)
