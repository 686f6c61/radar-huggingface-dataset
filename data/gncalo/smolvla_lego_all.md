# gncalo/smolvla_lego_all

## Resumen

SmolVLA Lego All es un modelo de visión-lenguaje-acción (VLA) compacto, resultado del ajuste fino del modelo base `lerobot/smolvla_base` sobre un conjunto de datos propio de manipulación robótica con bloques de Lego. Lo desarrolla el usuario `gncalo` y se distribuye a través del ecosistema LeRobot de Hugging Face. El modelo resuelve una tarea concreta de imitación: recoger un bloque de Lego rojo y depositarlo en una caja, a partir de observaciones visuales de varias cámaras y del estado del robot.

Con aproximadamente 450 millones de parámetros, SmolVLA se posiciona como una alternativa eficiente a los VLA de gran escala, pensada para desplegarse en hardware de consumo. Emplea una arquitectura que combina un codificador visual, un modelo de lenguaje compacto y un cabezal de acciones, entrenada con aprendizaje por imitación sobre 130 episodios y 58.910 fotogramas a 30 FPS. Su licencia Apache 2.0 y su integración nativa con LeRobot lo hacen relevante para quienes quieren reproducir o adaptar políticas robóticas sin infraestructura pesada.

La ficha se basa exclusivamente en la información pública disponible en Hugging Face y en la model card del autor; no se han publicado resultados de evaluación en el momento de redactarla.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) compacta, basada en SmolVLA (paper arXiv:2506.01844) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Modelo base | lerobot/smolvla_base (fine-tune) |
| Tipo de robot | so_follower |
| Camaras | front, wrist (y entradas visuales adicionales de 256x256 y 480x640) |
| Entrada de estado | observation.state, shape (6,) |
| Salida de accion | action, shape (6,) |
| Tamano del repositorio | 0,9 GB |
| Dataset de entrenamiento | gncalo/lego_all (130 episodios, 58.910 fotogramas, 30 FPS) |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que combina percepción visual multi-cámara con una instrucción en lenguaje natural para producir acciones motrices de forma directa. La política consume cinco entradas visuales (tres cámaras de 256x256 y una de 480x640, además de una cámara vacía de reserva) y un vector de estado de 6 dimensiones, y emite un vector de acción de 6 dimensiones. El ajuste fino se realizó sobre `lerobot/smolvla_base`, el checkpoint preentrenado publicado por el equipo de LeRobot, lo que permite partir de representaciones visuales y lingüísticas ya aprendidas.

El entrenamiento se llevó a cabo con LeRobot 0.6.1 durante 20.000 pasos, con un tamaño de lote de 16, optimizador AdamW, tasa de aprendizaje 0,0001 y semilla 1000. El conjunto de datos `gncalo/lego_all` contiene 130 episodios y 58.910 fotogramas grabados a 30 FPS para una única tarea: "Pick up the red lego brick and put it in the box". No se documentan en la model card detalles sobre composición del dataset, aumento de datos, RLHF/DPO ni innovaciones de decodificación; la información disponible se limita a la configuración de entrenamiento y a las firmas de entrada/salida.

## Capacidades

- Generación de acciones robóticas de 6 dimensiones a partir de observaciones visuales y de estado, orientada a control de manipuladores.
- Percepción visual multi-cámara: procesa simultáneamente varias vistas (cámaras front y wrist, más entradas de 256x256 y 480x640).
- Condicionamiento por instrucción en lenguaje natural: la tarea se especifica mediante un prompt de texto ("Pick up the red lego brick and put it in the box").
- Aprendizaje por imitación: reproduce comportamientos demostrados en el dataset de entrenamiento.
- Integración con el ecosistema LeRobot para entrenamiento, evaluación y despliegue (`lerobot-train`, `lerobot-rollout`).
- No se documentan capacidades de tool calling, razonamiento multi-paso, agentes, visión general, audio ni modo de pensamiento; el modelo está especializado en control robótico.

## Casos de uso

- Automatización de picking y placing en líneas de montaje con bloques: el modelo ejecuta la tarea de recoger un bloque rojo y depositarlo en una caja, adecuado para células de manipulación repetitiva con un robot so_follower.
- Prototipado rápido de políticas robóticas: al partir de `lerobot/smolvla_base` y requerir solo 130 episodios, sirve para validar pipelines de imitación antes de escalar a datasets mayores.
- Investigación en aprendizaje por imitación: permite reproducir el flujo completo de LeRobot (grabación, entrenamiento, rollout) con un caso de estudio acotado y verificable.
- Benchmark interno de hardware de consumo: con 450 millones de parámetros y 0,9 GB de pesos, es un candidato para medir latencia y throughput en GPUs de gama media.
- Educación y demos de VLA: la tarea única y el prompt explícito facilitan demostraciones reproducibles en ferias, aulas o laboratorios.
- Base para ajuste fino en tareas Lego similares: sirve como punto de partida para variantes (otros colores, posiciones o contenedores) mediante reentrenamiento con nuevos datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450 millones de parámetros y pesos safetensors de 0,9 GB, una estimación orientativa en FP16 ronda los 1-2 GB, y en FP32 alrededor de 2-3 GB, sin contar overhead del runtime.
- GPU recomendadas: no especificadas por el autor; por tamaño, una RTX 4090, A100 o H100 son sobredimensionadas para este modelo, y GPUs de consumo como RTX 3060/4060 deberían ser suficientes.
- Cabe en GPU de consumo: sí, por el tamaño del modelo, aunque no hay confirmación oficial de latencia ni throughput.
- Opciones de despliegue: LeRobot (`lerobot-rollout`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que además no son el runtime habitual para políticas VLA.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| gncalo/smolvla_lego_all | 450 M | no disponible | apache-2.0 | Hugging Face (LeRobot) | Fine-tune especializado en una tarea Lego |
| lerobot/smolvla_base | no disponible en la informacion | no disponible | no disponible en la informacion | Hugging Face (LeRobot) | Modelo base del que parte este fine-tune |
| Otros VLA de gran escala (p. ej. familias tipo OpenVLA) | no disponible en la informacion | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: entrenado para una única tarea ("Pick up the red lego brick and put it in the box"); su comportamiento fuera de ese dominio no está validado.
- Sin resultados de evaluación publicados: no hay tasas de éxito ni métricas de robustez, por lo que no puede recomendarse para producción sin validación propia.
- Dependencia del hardware: asume un robot `so_follower` y un conjunto concreto de cámaras (front, wrist y entradas adicionales); cambios de montaje o calibración pueden degradar el rendimiento.
- Dataset pequeño: 130 episodios y 58.910 fotogramas limitan la generalización a nuevas posiciones, iluminación o distracciones.
- Riesgo de sobreajuste y de fallos ante condiciones no vistas; no hay información sobre sesgos más allá de los del dataset de demostración.
- Idiomas: no se documenta soporte multilingüe; el prompt de tarea está en inglés.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar las condiciones del modelo base `lerobot/smolvla_base`.
- Sin cuantizaciones publicadas ni formatos alternativos a safetensors, lo que limita opciones de despliegue en entornos con restricciones de memoria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gncalo/smolvla_lego_all
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/gncalo/lego_all
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=gncalo/lego_all
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
