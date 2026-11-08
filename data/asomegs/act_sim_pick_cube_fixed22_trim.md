# asomegs/act_sim_pick_cube_fixed22_trim

## Resumen

`asomegs/act_sim_pick_cube_fixed22_trim` es una política de imitación para robótica entrenada con el método Action Chunking with Transformers (ACT), publicado en el paper arXiv:2304.13705. La desarrolla el usuario asomegs y está empaquetada con LeRobot 0.7.1, la librería de Hugging Face para aprendizaje por imitación en robots reales y simulados. El modelo resuelve una tarea concreta y acotada: recoger un cubo (`pick_cube`) a partir de dos cámaras (`front` y `wrist`) y un vector de estado de 18 dimensiones, emitiendo acciones de 4 dimensiones.

A diferencia de un LLM, no es un modelo de lenguaje: es un transformer pequeño (51.586.692 parámetros, unos 0,2 GB de repo) que predice *chunks* de acciones cortas en lugar de pasos individuales, lo que reduce el error acumulado y estabiliza el control. Se entrenó sobre un dataset propio de solo 22 episodios y 445 fotogramas a 10 FPS, lo que lo convierte en una política de demostración más que en un sistema listo para producción.

Su relevancia es la de un ejemplo reproducible del flujo completo de LeRobot: grabar datos con teleoperación, entrenar con `lerobot-train` y desplegar con `lerobot-rollout`. No hay resultados de evaluación publicados ni licencia declarada, por lo que debe tratarse como material experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.586.692 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; consume observaciones por paso) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (no procesa lenguaje natural; la tarea se especifica con la cadena `pick_cube`) |
| Licencia | no disponible (la model card indica "More Information Needed") |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un transformer de aprendizaje por imitación que, en cada inferencia, recibe dos imágenes RGB de 3×128×128 (`observation.images.front` y `observation.images.wrist`) y un vector de estado de 18 dimensiones (`observation.state`), y produce un chunk de acciones de dimensión 4 (`action`). La innovación central del método es predecir secuencias cortas de acciones en lugar de un único paso, lo que mitiga el problema de *compounding error* típico del behavioral cloning y permite un control más suave. La arquitectura combina un backbone visual (ResNet) con un transformer encoder-decoder y una cabeza de predicción de acciones; el detalle exacto de capas y dimensiones no está documentado en la información disponible.

El entrenamiento se realizó con LeRobot 0.7.1 durante 20.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000, sobre el dataset `asomegs/sim_pick_cube_kb_fixed22_trim`: 22 episodios, 445 fotogramas a 10 FPS, todos de la tarea `pick_cube` en simulación. No se documenta composición del dataset más allá de la tarea, ni uso de RLHF, DPO o aumentación de datos. El tamaño muestral es muy reducido, lo que limita la generalización fuera de las condiciones exactas de recogida.

## Capacidades

- Control robótico por imitación para la tarea `pick_cube`, con salida de chunks de acciones de 4 dimensiones.
- Fusión de dos vistas de cámara (frontal y de muñeca) con estado propioceptivo de 18 dimensiones.
- Ejecución autónoma de la política en un robot compatible mediante `lerobot-rollout`.
- Entrenamiento y reentrenamiento reproducibles con `lerobot-train` sobre datasets en formato LeRobot.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso simbólico.
- No procesa lenguaje natural ni mantiene conversaciones; la tarea se fija por comando (`--task="pick_cube"`).
- No tiene capacidades multilingües, de visión general, audio ni modo *thinking*.

## Casos de uso

- Reproducción de un pipeline completo de imitación: sirve como referencia didáctica para grabar datos con teleoperación, entrenar con ACT y desplegar con LeRobot, cubriendo el ciclo entero en un repo de 0,2 GB.
- Prototipado de agarre de objetos en simulación: la política demuestra la tarea `pick_cube` con dos cámaras y estado de 18 dimensiones, útil como línea base antes de escalar a datasets mayores.
- Validación de hardware y calibración: ejecutar `lerobot-rollout` con esta política permite comprobar que las cámaras, el puerto del robot y las claves de observación (`front`, `wrist`) están correctamente configurados.
- Benchmark interno de infraestructura de inferencia: al ser un modelo pequeño (51,6 M de parámetros), sirve para medir latencia de control a 10 FPS en una GPU consumer antes de pasar a políticas mayores.
- Base para *fine-tuning*: se puede partir de estos pesos y reentrenar con `lerobot-train` sobre un dataset propio con la misma estructura de observaciones y acciones.
- Docencia y talleres de robótica: el tamaño reducido y el coste de entrenamiento bajo (20.000 pasos, batch 8) lo hacen adecuado para sesiones prácticas con estudiantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación vacía con la nota "No evaluation results have been provided for this policy yet", por lo que no existen tasas de éxito, métricas de error de acción ni comparaciones numéricas verificables.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con los pesos en safetensors (51,6 M de parámetros, repo de 0,2 GB); el cuello de botella es el preprocesado de las dos cámaras a 128×128, no el modelo.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; una RTX 3060, RTX 4060 o superior cubre el caso con holgura. Para entrenamiento, una RTX 4090 o A100 acelera los 20.000 pasos, aunque el batch 8 y el modelo pequeño permiten entrenar en GPUs modestas.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer moderna e incluso en CPU para inferencia, aunque la latencia de control a 10 FPS puede resentirse.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para entrenamiento) con backend PyTorch/CUDA. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. La frecuencia de los datos de entrenamiento es de 10 FPS, lo que marca el ritmo de control esperado, pero no se publican mediciones de latencia real.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto / observaciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `asomegs/act_sim_pick_cube_fixed22_trim` | 51,6 M | `pick_cube` (sim) | 2 cámaras 128×128 + estado 18-D, acciones 4-D | no disponible | Hugging Face, LeRobot |
| `asomegs/act_sim_pick_cube_fixed22` | no disponible | `pick_cube` (sim) | misma estructura de observaciones (variante sin *trim*) | no disponible | Hugging Face, LeRobot |
| `Aneysait/act_pick_cube` | no disponible | `pick_cube` | política ACT para recogida de cubo | no disponible | Hugging Face, LeRobot |

Las tres alternativas pertenecen a la misma familia metodológica (ACT sobre LeRobot) y comparten la limitación de no publicar benchmarks ni licencia clara. No se dispone de datos de parámetros ni de evaluación para las dos variantes comparadas, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Dataset de entrenamiento muy reducido: 22 episodios y 445 fotogramas, insuficiente para esperar robustez ante cambios de posición, iluminación, objetos distractores o variaciones del robot.
- Sin evaluación publicada: no hay tasa de éxito ni métricas de error, por lo que no se puede afirmar que la política funcione de forma fiable ni siquiera en las condiciones de entrenamiento.
- Licencia no declarada: la model card indica "More Information Needed"; no se puede asumir uso comercial sin consultar al autor.
- Riesgo de sobreajuste a la simulación: el dataset proviene de un entorno simulado (`sim_pick_cube_kb_fixed22_trim`), y no se documenta *sim-to-real* ni validación en robot físico.
- Dependencia estricta de la interfaz: las claves de observación (`front`, `wrist`), las resoluciones (128×128) y la dimensionalidad del estado (18) y de la acción (4) deben coincidir exactamente con el robot de despliegue.
- Sin capacidades de lenguaje: no es adecuado para tareas de NLP, razonamiento, código ni agentes conversacionales; cualquier uso fuera del control robótico queda fuera de su alcance.
- Riesgo de alucinación en el sentido de acciones no válidas: al ser una política de imitación, puede generar comandos fuera de rango ante observaciones fuera de distribución.
- Idiomas no aplicables: la tarea se especifica con una cadena fija (`pick_cube`), sin soporte multilingüe real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/asomegs/act_sim_pick_cube_fixed22_trim
- Dataset de entrenamiento: https://huggingface.co/datasets/asomegs/sim_pick_cube_kb_fixed22_trim
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=asomegs/sim_pick_cube_kb_fixed22_trim
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Variante relacionada: https://huggingface.co/asomegs/act_sim_pick_cube_fixed22
- Política ACT comparable: https://huggingface.co/Aneysait/act_pick_cube
