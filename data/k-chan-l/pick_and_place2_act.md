# k-chan-l/pick_and_place2_act

## Resumen

El modelo `k-chan-l/pick_and_place2_act` es una política de robótica basada en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación que predice secuencias cortas de acciones en lugar de pasos individuales. Ha sido entrenado con el framework LeRobot de Hugging Face sobre un conjunto de datos de teleoperación para la tarea de recoger y colocar objetos (pick and place) con un robot tipo `so_follower`. El modelo consume observaciones multimodales (estado del robot y dos cámaras) y genera comandos de acción de 6 dimensiones.

Con 51,7 millones de parámetros, es un modelo compacto diseñado para ejecutarse en tiempo real en hardware robótico. Su relevancia radica en que demuestra cómo el aprendizaje por imitación con transformers puede transferir habilidades manipulativas a partir de demostraciones humanas, con una licencia Apache 2.0 que permite uso comercial. El repositorio incluye el modelo en formato safetensors y está integrado con el ecosistema LeRobot para entrenamiento y despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) - transformer con CVAE |
| Parametros totales | 51.668.614 (51,7 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de robótica, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en F32) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (F32) |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que utiliza un transformer con codificador y decodificador, junto con un módulo CVAE (Conditional Variational Autoencoder) para modelar la distribución de acciones. En lugar de predecir una sola acción por paso, el modelo genera un "chunk" de acciones futuras (típicamente 50 pasos), lo que reduce el error de acumulación y produce movimientos más suaves y estables. La arquitectura está diseñada para manejar entradas multimodales: estado del robot (vector de 6 dimensiones) e imágenes de dos cámaras (superior y muñeca) con resolución 480x640.

El entrenamiento se realizó con LeRobot versión 0.6.2 sobre el dataset `k-chan-l/pick_and_place2`, que contiene 50 episodios teleoperados (17.480 frames a 30 FPS) de la tarea "pick_and_place2". La configuración de entrenamiento incluye 100.000 pasos, batch size de 8, optimizador AdamW con learning rate de 1e-5 y semilla 1000. No se menciona el uso de RLHF o DPO; es un entrenamiento supervisado de imitación puro.

## Capacidades

- Aprendizaje por imitación para tareas de manipulación robótica, específicamente pick and place.
- Predicción de chunks de acciones (action chunking) que permite movimientos suaves y coordinados.
- Entrada multimodal: estado del robot (6 dimensiones) y dos flujos de imagen (cámara superior y cámara de muñeca).
- Salida de acciones de 6 dimensiones (probablemente posiciones articulares o del efector final).
- Integración nativa con el framework LeRobot para entrenamiento, evaluación y despliegue en robots reales.
- No tiene capacidades de lenguaje, tool calling, visión general ni razonamiento simbólico; es una política puramente motora.

## Casos de uso

- Automatización de tareas de recoger y colocar en entornos industriales: el modelo puede controlar un brazo robótico para transferir objetos de una posición a otra, aprendido de demostraciones humanas.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar la transferencia de habilidades, la generalización a nuevas posiciones o la robustez frente a cambios de iluminación.
- Desarrollo de políticas para robots colaborativos tipo `so_follower`: su tamaño compacto permite ejecutarse en tiempo real en hardware embebido o GPUs de gama media.
- Prototipado rápido en laboratorios de robótica: gracias a la integración con LeRobot, se puede cargar y ejecutar la política en minutos con el comando `lerobot-rollout`.
- Benchmarking de algoritmos de imitación: al ser un modelo pequeño y bien documentado, puede usarse como referencia para comparar con otras arquitecturas (diffusion policies, etc.).
- Educación en robótica y aprendizaje automático: permite a estudiantes experimentar con políticas entrenadas por imitación sin necesidad de grandes recursos computacionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación para esta política. No se proporcionan tasas de éxito ni comparaciones con otros métodos.

## Requisitos de hardware

- Tamaño de pesos: aproximadamente 207 MB en F32 (51,7 M parámetros × 4 bytes), más overhead de activaciones y buffers.
- VRAM estimada para inferencia: menos de 1 GB, por lo que cabe en cualquier GPU consumer moderna (RTX 3060, RTX 4060, etc.) y en GPUs integradas con suficiente memoria compartida.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 4 GB de VRAM para margen de activaciones y procesamiento de imágenes.
- Opciones de despliegue: el modelo se ejecuta mediante LeRobot, que soporta inferencia en PyTorch con CUDA. No es compatible con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Dado el tamaño, se espera una inferencia en tiempo real (30 FPS) en hardware adecuado, pero no hay datos publicados.

## Comparativa con modelos similares

Se han encontrado dos modelos similares en Hugging Face, ambos con la misma arquitectura ACT y tamaño de parámetros (51,7 M):

| Modelo | Parámetros | Tarea | Licencia | Evaluación |
|---|---|---|---|---|
| k-chan-l/pick_and_place2_act | 51,7 M | pick_and_place2 | Apache 2.0 | No reportada |
| HankLL/act_pickandplace2 | no disponible | pick and place | no disponible | No reportada |
| dlcodnjs/act_pick_and_place_v2_90 | 51,7 M | pick and place v2 | no disponible | No reportada |

No se dispone de datos de rendimiento comparativos. Los tres modelos parecen ser variaciones de la misma tarea con diferentes conjuntos de datos o configuraciones, pero no hay información suficiente para establecer diferencias.

## Limitaciones y advertencias

- Entrenado exclusivamente para la tarea "pick_and_place2" con un robot `so_follower` específico; no generaliza a otras tareas o robots sin reentrenamiento.
- Depende de la calibración de las cámaras y de la configuración del robot; cambios en la iluminación, posición de objetos o distracciones pueden degradar el rendimiento.
- No se han reportado resultados de evaluación en el mundo real, por lo que la tasa de éxito real es desconocida.
- Al ser un modelo de imitación, hereda los sesgos de las demostraciones humanas (por ejemplo, trayectorias subóptimas o movimientos inconsistentes).
- No es un modelo de lenguaje ni multimodal general; no puede procesar texto, audio ni realizar razonamiento simbólico.
- La licencia Apache 2.0 permite uso comercial, pero se debe atribuir adecuadamente y cumplir con los términos de la licencia.
- El dataset de entrenamiento es pequeño (50 episodios), lo que puede limitar la robustez frente a variaciones no vistas.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/k-chan-l/pick_and_place2_act)
- [Dataset de entrenamiento](https://huggingface.co/datasets/k-chan-l/pick_and_place2)
- [Paper de ACT (arXiv:2304.13705)](https://huggingface.co/papers/2304.13705)
- [Repositorio de LeRobot](https://github.com/huggingface/lerobot)
- [Documentación de LeRobot para ACT](https://huggingface.co/docs/lerobot/main/en/act)
- [Visualización del dataset](https://huggingface.co/spaces/lerobot/visualize_dataset?path=k-chan-l/pick_and_place2)
