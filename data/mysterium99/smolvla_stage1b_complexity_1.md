# mysterium99/smolvla_stage1b_complexity_1

## Resumen

SmolVLA es un modelo visión-lenguaje-acción (VLA) compacto desarrollado originalmente por Hugging Face dentro del ecosistema LeRobot, diseñado para control robótico mediante imitación y desplegable en hardware de consumo. Esta ficha concreta, `mysterium99/smolvla_stage1b_complexity_1`, es un fine-tuning del checkpoint base `lerobot/smolvla_base` sobre el dataset `manufacturing_level_1`, orientado a tareas de manipulación de componentes mecánicos (tornillos, tuercas y muelles) en un entorno de fabricación simulado o de laboratorio.

El modelo recibe como entrada el estado articular del robot (vector de 6 dimensiones) junto con tres flujos de imagen RGB de 256x256 píxeles procedentes de tres cámaras (gripper, vista superior y vista lateral), y produce un vector de acción de 6 dimensiones que corresponde al control del efector final y la pinza. Con 450 millones de parámetros y un repositorio de 0,9 GB en formato safetensors, se posiciona en la franja de políticas robóticas ligeras que pueden ejecutarse en GPUs de consumo.

La relevancia de este checkpoint es acotada: se trata de un experimento de fine-tuning (sufijo `stage1b_complexity_1`) sin métricas de evaluación publicadas y sin descargas ni interacciones en el momento de redactar esta ficha. Resulta útil como referencia para quienes replican pipelines de entrenamiento VLA con LeRobot sobre datasets de manufactura, pero no como política lista para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en transformer, derivada de SmolVLA |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el ecosistema LeRobot permite FP32/FP16/BF16) |
| Idiomas soportados | no disponible (modelo orientado a control robótico, no a texto libre) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

SmolVLA es una política de imitación que combina un codificador visual, un codificador de instrucciones en lenguaje natural y un decodificador de acciones, siguiendo el paradigma VLA descrito en el paper arXiv:2506.01844. El modelo consume observaciones multimodales (tres cámaras RGB de 256x256 y un vector de estado de 6 dimensiones) y emite una acción continua de 6 dimensiones por paso de tiempo. El checkpoint base `lerobot/smolvla_base` actúa como inicialización; este fine-tuning se ha realizado sobre el dataset `manufacturing_level_1`.

Los detalles de entrenamiento documentados son: 60.000 pasos, batch size de 32, optimizador AdamW con learning rate 1e-4, semilla 0 y LeRobot 0.6.1. El dataset contiene 250 episodios y 306.154 frames a 30 FPS, con cinco tareas de manipulación (colocar tornillos, tuercas y muelles en zonas designadas). No se documenta composición del preentrenamiento, uso de RLHF/DPO ni innovaciones adicionales (decodificación especulativa, atención lineal, etc.) para este checkpoint concreto.

## Capacidades

- Control robótico por imitación: genera acciones continuas de 6 dimensiones a partir de observaciones visuales y de estado.
- Percepción visual multi-cámara: procesa tres flujos RGB simultáneos (gripper, vista superior, vista lateral) a 256x256.
- Condicionamiento por instrucción en lenguaje natural: acepta una descripción de tarea (por ejemplo, "Put all screws in the bucket") que guía la política.
- Manipulación de objetos pequeños: entrenado específicamente en tornillos, tuercas y muelles.
- Ejecución en bucle cerrado a 30 FPS, sincronizada con la frecuencia del dataset de entrenamiento.
- No soporta tool calling, function calling, razonamiento multi-paso, ni generación de texto libre.
- Capacidades multilingües: no disponibles; el condicionamiento por lenguaje se limita a las instrucciones del dataset.
- No dispone de modo thinking, visión general, audio ni otras capacidades fuera del dominio robótico.

## Casos de uso

- Clasificación de componentes en línea de montaje: la política puede colocar tornillos, tuercas y muelles en zonas delimitadas, replicando las cinco tareas del dataset `manufacturing_level_1`; es adecuada por su entrenamiento específico sobre esas instrucciones.
- Prototipado de pipelines VLA con LeRobot: sirve como punto de partida para validar el flujo `lerobot-train` / `lerobot-rollout` antes de escalar a datasets propios, dado que el checkpoint base y la configuración están documentados.
- Investigación en imitación con múltiples cámaras: útil para estudiar cómo influye la fusión de tres vistas (gripper, top, side) en el rendimiento de una política compacta de 450M de parámetros.
- Benchmark de referencia para fine-tunings sobre manufactura: al ser un checkpoint intermedio (`stage1b_complexity_1`), permite comparar variantes de complejidad dentro de una misma familia experimental.
- Despliegue en hardware de bajo coste: con 450M de parámetros y pesos safetensors de 0,9 GB, es viable ejecutarlo en GPUs de consumo para pruebas de laboratorio con un robot tipo `follow`.
- Docencia y formación en robótica de imitación: el modelo y su dataset asociado permiten reproducir el ciclo completo (grabación, entrenamiento, rollout) en un entorno controlado de manufactura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,8 GB en FP32 (450M parámetros x 4 bytes) y en torno a 0,9 GB en FP16/BF16, sin contar activaciones ni buffers de imagen.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para inferencia en FP16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son válidas.
- Cabe en GPUs de consumo: sí, en la práctica totalidad de GPUs NVIDIA modernas con 4 GB o más; también es plausible en GPUs integradas con suficiente memoria compartida, aunque no se documenta.
- Opciones de despliegue: el flujo oficial es `lerobot-rollout` con `--policy.path=mysterium99/smolvla_stage1b_complexity_1`; LeRobot 0.6.1 es la versión de referencia. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles. El dataset se grabó a 30 FPS, lo que sugiere que el bucle de control debe sostener esa frecuencia, pero no se aportan mediciones reales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mysterium99/smolvla_stage1b_complexity_1` | 450M | no disponible | VLA para manufactura | Apache 2.0 | Hugging Face (0 descargas) |
| `lerobot/smolvla_base` | no disponible en la informacion | no disponible | VLA base preentrenada | Apache 2.0 (segun repositorio base) | Hugging Face |
| Políticas VLA de mayor escala (p. ej. familias OpenVLA/pi0) | no disponible en la informacion | no disponible | VLA generalistas | no disponible | no disponible |

La comparación se limita al modelo base, ya que no se han proporcionado datos de benchmarks ni especificaciones de alternativas en la información disponible.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay tasas de éxito publicadas en robot real, por lo que no puede recomendarse para producción.
- Sesgo de dominio: entrenado exclusivamente sobre `manufacturing_level_1` (tornillos, tuercas y muelles); generalizará mal a otros objetos, tareas o entornos.
- Dependencia del hardware: la política asume un robot tipo `follow` con tres cámaras en posiciones concretas (`gripper`, `newtop`, `newside`); cambiar la configuración invalida el modelo.
- Riesgo de sobreajuste al dataset: 250 episodios y 60.000 pasos de entrenamiento sugieren un ajuste fino intensivo sobre un conjunto pequeño.
- Sin soporte multilingüe ni de texto libre: el condicionamiento por lenguaje se limita a las cinco instrucciones del dataset.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; la responsabilidad recae en el integrador.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la ficha, lo que reduce la probabilidad de que los errores hayan sido detectados por terceros.
- Fecha de creación futura (2026-11-05) según los metadatos de Hugging Face, lo que conviene verificar antes de citarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mysterium99/smolvla_stage1b_complexity_1
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Dataset de entrenamiento: https://huggingface.co/datasets/manufacturing_level_1
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=manufacturing_level_1
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación general de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
