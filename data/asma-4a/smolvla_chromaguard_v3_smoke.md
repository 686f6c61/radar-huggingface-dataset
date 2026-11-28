# asma-4a/smolvla_chromaguard_v3_smoke

## Resumen

`asma-4a/smolvla_chromaguard_v3_smoke` es un ajuste fino (fine-tune) del modelo vision-lenguaje-acción (VLA) SmolVLA, desarrollado sobre la base `lerobot/smolvla_base` de Hugging Face. Se trata de una política robótica de imitación entrenada con el framework LeRobot para controlar un robot tipo `so_follower` (SO-101) equipado con cámara de muñeca. El modelo consume el estado articular de 6 dimensiones y tres flujos de imagen RGB de 256×256 píxeles, y produce comandos de acción de 6 dimensiones.

El modelo resuelve una tarea concreta de manipulación: recoger cubos de colores (rojo y amarillo) y un sacapuntas y depositarlos en recipientes (taza marrón y taza roja). El nombre "smoke" sugiere que se trata de una ejecución de prueba o validación (smoke test) más que de un modelo de producción pulido, y el entrenamiento consta de solo 100 pasos, lo que refuerza esa interpretación.

Su relevancia es acotada: sirve como ejemplo reproducible de ajuste fino de SmolVLA con LeRobot 0.7.1 y como punto de partida para quien quiera replicar el pipeline sobre el dataset `shilpitha-03/so101_sharpener_cube_lang`. No es un modelo de propósito general ni compite en benchmarks de lenguaje; es una política de control robótico específica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (SmolVLA), transformer multimodal con cabecera de acciones |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (política de imitación, sin contexto textual variable) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea están en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | lerobot/smolvla_base |
| Tipo de robot | so_follower (SO-101) |
| Cámaras | wrist (entrada visual de 3×256×256) |
| Entradas | observation.state (6,), observation.images.camera1/2/3 (3,256,256) |
| Salidas | action (6,) |
| Librería | lerobot 0.7.1 |
| Tamaño del repo | 2.5 GB |

## Arquitectura y entrenamiento

SmolVLA es un modelo compacto de visión-lenguaje-acción descrito en el paper arXiv:2506.01844. Combina un codificador visual, un componente de lenguaje y una cabeza de predicción de acciones que mapea observaciones multimodales (estado articular más imágenes) a comandos motores de 6 grados de libertad. El diseño está orientado a despliegue en hardware de consumo, con un recuento de parámetros de aproximadamente 450 millones.

Este ajuste concreto se entrenó sobre el dataset `shilpitha-03/so101_sharpener_cube_lang`, compuesto por 125 episodios y 82.054 fotogramas a 30 FPS, con tres tareas de manipulación en inglés ("Pick up the red cube and place it in the brown cup", "Pick up the yellow cube and place it in the brown cup", "Pick up the pencil sharpener and place it in the red cup"). La configuración de entrenamiento fue de 100 pasos, batch de 32, optimizador AdamW, learning rate 2e-05 y semilla 42. No se documenta el uso de RLHF, DPO ni técnicas de alineación; se trata de aprendizaje por imitación supervisado. El número tan bajo de pasos (100) indica que el modelo es un smoke test y probablemente no está convergido.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 6 dimensiones a partir de observaciones visuales y de estado articular.
- Percepción visual multimodal: procesa tres cámaras simultáneas a 256×256 píxeles.
- Ejecución de instrucciones de tarea en lenguaje natural (en inglés), condicionando la política al texto de la tarea.
- Aprendizaje por imitación: reproduce comportamientos demostrados en el dataset de entrenamiento.
- Integración con LeRobot: compatible con los comandos `lerobot-rollout` y `lerobot-train`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, matemáticas ni generación de texto libre.

## Casos de uso

- Replicación de experimentos de imitación robótica: sirve como referencia para validar el pipeline completo de LeRobot (grabación, entrenamiento, despliegue) sobre un robot SO-101 antes de lanzar entrenamientos largos.
- Prueba de humo (smoke test) de infraestructura: al ser un modelo de 450 M de parámetros y 100 pasos de entrenamiento, permite verificar que el hardware, las cámaras y la comunicación con el robot funcionan correctamente.
- Docencia y formación: ejemplo mínimo y reproducible de ajuste fino de SmolVLA para quienes aprenden VLA y manipulación robótica.
- Benchmark interno de latencia: permite medir el tiempo de inferencia de SmolVLA en un robot real con hardware de consumo.
- Punto de partida para ajustes específicos: quien quiera entrenar su propia política de pick-and-place puede partir de este checkpoint o de `lerobot/smolvla_base` y reutilizar la configuración.
- Validación de datasets: útil para comprobar que el dataset `so101_sharpener_cube_lang` es coherente y que las observaciones coinciden con las claves esperadas por la política.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450 M de parámetros, en FP16 se estiman en torno a 1 GB de pesos, más el overhead del codificador visual y de las tres cámaras de 256×256.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería ser suficiente.
- Cabe en GPU de consumo: previsiblemente sí (RTX 3060, RTX 4060, RTX 4090), aunque el autor no lo confirma.
- Opciones de despliegue: LeRobot (`lerobot-rollout`) sobre el robot SO-101; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a una política robótica).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| asma-4a/smolvla_chromaguard_v3_smoke | 450 M | no disponible | VLA (SmolVLA fine-tune) | apache-2.0 | Hugging Face |
| lerobot/smolvla_base | no disponible en esta ficha | no disponible | VLA (SmolVLA base) | apache-2.0 | Hugging Face |
| Otros VLA comparables (p. ej. OpenVLA, pi0) | no disponible en esta ficha | no disponible | VLA | no disponible | no disponible |

La comparación cuantitativa con alternativas no está disponible en la información proporcionada. El único punto de referencia documentado es el modelo base `lerobot/smolvla_base`, del que este checkpoint deriva.

## Limitaciones y advertencias

- Entrenamiento muy corto: solo 100 pasos con batch 32, lo que sugiere un modelo no convergido y de baja fiabilidad en ejecución real.
- Sin evaluación publicada: no hay tasas de éxito ni pruebas en robot real documentadas.
- Especialización estrecha: entrenado únicamente para tres tareas de pick-and-place con objetos y recipientes concretos; no generaliza a otras tareas.
- Dependencia de hardware específico: requiere un robot `so_follower` (SO-101) y una configuración de cámaras concreta; las claves de observación deben coincidir exactamente.
- Idioma: las instrucciones de tarea están en inglés; no se documenta soporte multilingüe.
- Riesgo de sobreajuste al dataset: 125 episodios y 82.054 fotogramas para tres tareas, con un modelo de 450 M de parámetros.
- Licencia apache-2.0: permite uso comercial, pero el modelo base y el dataset pueden tener condiciones adicionales que conviene revisar.
- Sin datos sobre sesgos, alucinación o robustez ante cambios de iluminación, posición de objetos o distracciones.
- Nombre "smoke": indica que es una ejecución de prueba, no un modelo listo para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/asma-4a/smolvla_chromaguard_v3_smoke
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/shilpitha-03/so101_sharpener_cube_lang
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=shilpitha-03/so101_sharpener_cube_lang
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
