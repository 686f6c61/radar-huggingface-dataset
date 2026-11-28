# Brocanteur/smolvla_so101_mascara

## Resumen

SmolVLA es un modelo compacto de vision-language-action (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, pensado para controlar robots reales mediante imitación a partir de demostraciones. La variante publicada aquí, `Brocanteur/smolvla_so101_mascara`, es un fine-tuning concreto del modelo base SmolVLA sobre el robot `so_follower` (SO-101) para una única tarea: coger un rímel (mascara) y depositarlo en una taza. El repositorio contiene únicamente los pesos de la política entrenada, no el modelo fundacional completo.

El modelo combina un codificador visual preentrenado (SmolVLM2) con un transformer de acciones que consume observaciones multimodales (tres cámaras RGB de 256×256 más el estado articular de 6 dimensiones) y emite comandos de acción de 6 dimensiones a 30 FPS. Con unos 450 millones de parámetros totales y un tamaño de repositorio de 0,9 GB en safetensors, está diseñado explícitamente para desplegarse en hardware de consumo, no en clústeres de GPU.

Su relevancia es acotada: no es un modelo de propósito general, sino una política de imitación de nicho con 48 episodios de entrenamiento (28 216 frames) y sin evaluación publicada. Resulta útil como referencia práctica de cómo se entrena y despliega una política SmolVLA con LeRobot, y como punto de partida reproducible para tareas de manipulación pick-and-place en robots de bajo coste.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language-action (SmolVLA); no se detalla la composición interna en la información disponible |
| Parámetros totales | 450.046.176 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (política de control, no modelo de lenguaje conversacional) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea se proporcionan en inglés en la model card) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería `lerobot`) |
| Tipo de robot | `so_follower` (SO-101) |
| Cámaras de entrada | `top`, `side`, `wrist` (3 × RGB 256×256) |
| Entrada de estado | `observation.state`, shape `(6,)` |
| Salida de acción | `action`, shape `(6,)` |
| Frecuencia de control | 30 FPS (según dataset de entrenamiento) |
| Tamaño del repositorio | 0,9 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

SmolVLA es un modelo visión-lenguaje-acción compacto que, según la model card, logra rendimiento competitivo con coste computacional reducido y puede desplegarse en hardware de consumo. La arquitectura concreta de esta variante no se detalla en la información disponible más allá de su pertenencia a la familia SmolVLA y su integración en LeRobot 0.7.0. El modelo consume tres flujos de imagen (`top`, `side`, `wrist`) junto con el estado articular de 6 dimensiones y produce un vector de acción de 6 dimensiones, típico de un brazo manipulador de 6 grados de libertad.

El entrenamiento se realizó por imitación sobre el dataset `Brocanteur/mascara_pick_cleaned`: 48 episodios, 28 216 frames a 30 FPS, con una única instrucción de tarea ("Grab the mascara and put it in the cup"). La configuración reportada es de 30 000 pasos, batch size 16, optimizador AdamW, learning rate 1e-4 y semilla 1000. No se documenta el uso de RLHF, DPO ni técnicas de refinamiento por preferencias; se trata de aprendizaje supervisado a partir de demostraciones teleoperadas. Tampoco se especifican innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.) en la información proporcionada.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 6 dimensiones para un brazo SO-101 (`so_follower`) a partir de observaciones visuales y propioceptivas.
- Percepción visual multimodal: procesa simultáneamente tres cámaras RGB (vista superior, lateral y en muñeca) a resolución 256×256.
- Ejecución de instrucciones en lenguaje natural: acepta una descripción de tarea en texto (en el caso entrenado, "Grab the mascara and put it in the cup").
- Imitación de una tarea única y específica: pick-and-place de un objeto concreto (rímel) hacia un contenedor concreto (taza).
- Integración con LeRobot: compatible con los comandos `lerobot-rollout` (inferencia) y `lerobot-train` (reentrenamiento).
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento general, matemáticas, generación de código ni multilingüismo; es una política de control, no un LLM.

## Casos de uso

- Reproducción de la tarea pick-and-place en un SO-101: desplegar la política con `lerobot-rollout` para que el brazo coja el rímel y lo deposite en la taza, usando exactamente las tres cámaras y el estado articular con los que fue entrenada.
- Base para fine-tuning en tareas similares: reutilizar los pesos como inicialización y reentrenar con `lerobot-train --policy.type=smolvla` sobre un dataset propio de manipulación con el mismo robot y configuración de cámaras.
- Referencia didáctica de un pipeline VLA completo: sirve para estudiar el flujo end-to-end de LeRobot (grabación de datos, limpieza del dataset, entrenamiento y rollout) en un caso real y pequeño (48 episodios).
- Validación de hardware de bajo coste: al estar pensado para hardware de consumo, permite comprobar el rendimiento de una política VLA de ~450 M de parámetros en una estación de trabajo con GPU consumer.
- Prototipado de automatización de laboratorio o línea de montaje a pequeña escala: adaptando el dataset a la tarea concreta (recogida y colocación de piezas en contenedores), el mismo esquema de entrenamiento es replicable.
- Investigación en imitación con pocos datos: con solo 28 216 frames y una instrucción, es un caso de estudio útil para analizar la sensibilidad de SmolVLA al número de episodios y a la variabilidad de posiciones e iluminación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política (`No evaluation results have been provided for this policy yet`). No se dispone de tasas de éxito en robot real ni de comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 450 M de parámetros en safetensors (fp32 ≈ 1,8 GB; fp16 ≈ 0,9 GB) más los tres flujos de imagen de 256×256, el modelo es holgadamente desplegable en GPU consumer, aunque no se documenta la huella exacta.
- GPU recomendadas: no se especifican en la información disponible. Por tamaño, cualquier GPU con al menos ~4-6 GB de VRAM debería ser suficiente, pero es una estimación, no un dato del autor.
- Cabe en GPU consumer: sí, según la propia model card ("can be deployed on consumer-grade hardware"), sin modelos concretos especificados.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para entrenamiento) con `--policy.device=cuda`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no aplican a una política de control robótico.
- Latencia y throughput: no disponibles. La frecuencia de control del dataset es de 30 FPS, pero no se reporta la latencia real de inferencia en el robot.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Entrada | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `Brocanteur/smolvla_so101_mascara` | SmolVLA fine-tuned (SO-101) | 450.046.176 | 3 cámaras 256×256 + estado (6,) | acción (6,) | no disponible | Hugging Face, 0 descargas |
| SmolVLA (modelo base, Hugging Face) | VLA compacto | no disponible en esta ficha | multimodal | acciones | no disponible en esta ficha | Hugging Face / LeRobot |
| Otras políticas LeRobot (p. ej. ACT, Diffusion Policy) | Políticas de imitación | no disponible en esta ficha | observaciones del robot | acciones | no disponible en esta ficha | Hugging Face / LeRobot |

La comparación cuantitativa con alternativas no está disponible: no hay benchmarks publicados para esta política ni datos de rendimiento de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Tarea única y muy específica: entrenada exclusivamente para "Grab the mascara and put it in the cup"; no generaliza a otras instrucciones ni objetos sin reentrenamiento.
- Dataset muy pequeño: 48 episodios y 28 216 frames, con una sola tarea; riesgo alto de sobreajuste a posiciones, iluminación y disposición concretas del entorno de grabación.
- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que se desconoce su robustez práctica.
- Dependencia estricta del hardware: requiere un robot `so_follower` (SO-101) y tres cámaras con los nombres y la configuración exactos (`top`, `side`, `wrist`) usados en el entrenamiento; cualquier desviación degrada el comportamiento.
- Licencia no disponible: no se puede confirmar el uso comercial; debe verificarse con el autor antes de cualquier despliegue productivo.
- Idiomas no disponibles: la instrucción de tarea se documenta en inglés; no hay evidencia de soporte multilingüe.
- Riesgo de alucinación en el sentido de acciones incorrectas: como toda política de imitación, puede ejecutar movimientos plausibles pero erróneos ante distribuciones de entrada fuera de las vistas en entrenamiento.
- Sesgos: no documentados, pero inherentes a los datos de demostración (un operador, un entorno, un objeto).
- Repositorio sin tracción (0 descargas, 0 likes) y creado recientemente: no hay validación comunitaria ni issues reportados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Brocanteur/smolvla_so101_mascara
- Dataset de entrenamiento: https://huggingface.co/datasets/Brocanteur/mascara_pick_cleaned
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Brocanteur/mascara_pick_cleaned
- Paper de SmolVLA (arXiv:2506.01844): https://huggingface.co/papers/2506.01844
- Guía SmolVLA de LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
