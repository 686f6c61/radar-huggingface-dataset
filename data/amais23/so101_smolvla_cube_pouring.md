# amais23/so101_smolvla_cube_pouring

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para controlar robots manipuladores a partir de observaciones visuales e instrucciones en lenguaje natural. Este checkpoint concreto, `amais23/so101_smolvla_cube_pouring`, es un ajuste fino del modelo base `lerobot/smolvla_base` sobre un dataset propio de 50 episodios para la tarea específica de verter un cubo de una taza a otra con el robot SO-101.

El modelo resuelve el problema de la política de imitación visual-motora: dado un estado de articulaciones de 6 dimensiones y varias cámaras (muñeca y frontal), predice una acción de 6 dimensiones a 30 FPS. Su relevancia radica en que SmolVLA está pensado para desplegarse en hardware de consumo, lo que democratiza la experimentación en robótica de manipulación sin necesidad de clústeres de GPU.

Con 450 millones de parámetros y licencia Apache 2.0, este checkpoint es un ejemplo práctico de cómo fine-tunear un VLA preentrenado con pocos datos (33.360 frames) para una tarea concreta. No obstante, al ser un modelo de investigación con cero descargas y sin evaluación publicada, debe tratarse como material de partida, no como solución lista para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) compacta, basada en SmolVLA (transformer multimodal con codificador visual y decodificador de acciones) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea se proporcionan en lenguaje natural, pero no se especifican idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que combina un codificador visual (procesa imágenes de cámaras a 256x256 y 480x640), un codificador de lenguaje para la instrucción de tarea y un decodificador que genera acciones continuas de 6 dimensiones. La arquitectura está optimizada para bajo coste computacional y despliegue en hardware de consumo, según la model card y el paper asociado (arXiv:2506.01844). El modelo base `lerobot/smolvla_base` fue preentrenado por Hugging Face; este checkpoint es un fine-tuning supervisado sobre el dataset `amais23/so101_cube_pouring`.

El entrenamiento se realizó con LeRobot 0.6.1 durante 2.500 pasos, batch size 16, optimizador AdamW y learning rate 0,0001, con semilla 1000. El dataset contiene 50 episodios y 33.360 frames a 30 FPS de la tarea "Pour the cube from the source cup into the target cup". No se especifica si hubo RLHF, DPO ni aumentos de datos. La entrada incluye estado de articulaciones `(6,)`, tres cámaras de 256x256 y una cámara vacía de 480x640; la salida es una acción `(6,)`. No se detallan innovaciones técnicas adicionales más allá de las propias de SmolVLA.

## Capacidades

- Control robótico de manipulación: genera acciones de 6 grados de libertad para el robot SO-101 (`so_follower`) a partir de observaciones visuales y de estado.
- Imitación visual-motora: aprende de demostraciones humanas (50 episodios) para ejecutar la tarea de verter un cubo entre tazas.
- Procesamiento multimodal: integra tres cámaras (frontal y muñeca) más una cámara adicional vacía, y una instrucción de tarea en lenguaje natural.
- Ejecución en tiempo real: inferencia a 30 FPS según la frecuencia del dataset de entrenamiento.
- Despliegue en hardware de consumo: el modelo base está diseñado para ejecutarse en GPUs de gama consumer, según la model card.
- No se documentan capacidades de tool calling, agentes multi-paso, matemáticas, código ni visión general fuera del ámbito robótico.

## Casos de uso

- Automatización de tareas de pick-and-place en laboratorio: el modelo puede ejecutar la secuencia de verter un cubo de una taza a otra sobre el robot SO-101, sirviendo como base para experimentos de manipulación con objetos pequeños.
- Investigación en aprendizaje por imitación: permite reproducir el pipeline completo de LeRobot (grabación, entrenamiento, rollout) con un dataset pequeño, ideal para validar metodologías de VLA en entornos académicos.
- Prototipado rápido de políticas robóticas: al estar fine-tuneado desde `smolvla_base`, se puede usar como punto de partida para nuevas tareas con pocos datos y un solo GPU consumer.
- Docencia y formación en robótica: su tamaño (450M parámetros) y licencia Apache 2.0 facilitan su uso en cursos y talleres sin restricciones comerciales.
- Benchmarking de infraestructura de inferencia: permite medir latencia y throughput de políticas VLA en GPUs de consumo (por ejemplo, RTX 4090) frente a alternativas más grandes.
- Integración en pipelines de LeRobot: se puede desplegar con `lerobot-rollout` y evaluar en un robot real, como demuestra el comando de ejemplo de la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450M parámetros en fp32 se requieren aproximadamente 1,8 GB solo para pesos, más overhead de activaciones y cámaras. En fp16, alrededor de 0,9 GB.
- GPU recomendadas: no especificadas; el modelo base SmolVLA está diseñado para hardware de consumo según la model card.
- ¿Cabe en GPU consumer? Sí, por tamaño (450M parámetros) es probable que quepa en GPUs consumer con al menos 4-8 GB de VRAM, aunque no se confirma oficialmente.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con soporte para CUDA según el comando de entrenamiento (`--policy.device=cuda`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a políticas robóticas.
- Latencia y throughput: no disponibles; el dataset está a 30 FPS, lo que sugiere que la inferencia debe ser al menos tan rápida para control en tiempo real, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `amais23/so101_smolvla_cube_pouring` | 450M | no disponible | VLA para SO-101 (verter cubo) | Apache 2.0 | Hugging Face, 0 descargas |
| `lerobot/smolvla_base` | no disponible | no disponible | VLA base preentrenado | no disponible | Hugging Face (modelo base) |
| Políticas ACT / Diffusion Policy en LeRobot | no disponible | no disponible | Imitación visual-motora | no disponible | Ecosistema LeRobot |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparativa se limita a parámetros y disponibilidad; no se pueden comparar benchmarks ni contexto.

## Limitaciones y advertencias

- Sin evaluación publicada: no hay resultados de éxito en robot real, por lo que se desconoce su fiabilidad.
- Dataset muy pequeño: 50 episodios y una única tarea ("verter el cubo"), lo que limita la generalización a otras posiciones, objetos o condiciones de iluminación.
- Sesgo de dominio: entrenado exclusivamente con el robot SO-101 y cámaras concretas; no funcionará con otros robots o configuraciones de cámara sin reentrenamiento.
- Riesgo de alucinación motora: como política de imitación, puede generar acciones incorrectas o inseguras fuera de la distribución de entrenamiento.
- Idiomas no especificados: la instrucción de tarea se pasa en lenguaje natural, pero no se documenta qué idiomas soporta el codificador de lenguaje.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base y el dataset pueden tener sus propias condiciones; verificar antes de producción.
- Cero descargas y cero likes: indica que es un checkpoint de investigación sin validación comunitaria.
- No apto para producción sin validación exhaustiva: la model card no reporta pruebas de seguridad ni de robustez.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amais23/so101_smolvla_cube_pouring
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/amais23/so101_cube_pouring
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Guía LeRobot SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Visualizar dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=amais23/so101_cube_pouring
