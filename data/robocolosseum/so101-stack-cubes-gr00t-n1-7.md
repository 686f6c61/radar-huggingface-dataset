# RoboColosseum/so101-stack-cubes-gr00t-n1.7

## Resumen

`RoboColosseum/so101-stack-cubes-gr00t-n1.7` es una política de robótica entrenada mediante imitación sobre la arquitectura GR00T N1.7 de NVIDIA, empaquetada en formato LeRobot para el robot `so_follower` (SO-101). El modelo resuelve una tarea concreta de manipulación: apilar tres cubos (azul sobre rojo, blanco sobre azul) a partir de observaciones visuales de dos cámaras y del estado propioceptivo de las seis articulaciones del brazo. Con 3.144.016.000 parámetros, es un modelo grande para los estándares de políticas de imitación, lo que refleja que incorpora un backbone vision-language de gran escala (Cosmos-Reason2/Qwen3-VL) junto con un transformer de acciones por flow matching.

La relevancia de esta ficha es doble. Por un lado, ilustra el flujo de trabajo actual de LeRobot para adaptar un modelo fundacional de robótica a un hardware de bajo coste mediante fine-tuning supervisado sobre un dataset pequeño (100 episodios, 41.359 frames a 30 FPS). Por otro, sirve como ejemplo de las limitaciones prácticas de este tipo de políticas: el resultado es una habilidad estrecha, dependiente de la configuración exacta de cámaras y robot, y sin evaluación publicada en el momento de la subida al Hub.

El repositorio ocupa 102,2 GB y se distribuye bajo licencia Apache 2.0. No se han publicado resultados de benchmarks ni tasas de éxito en la información disponible, y el modelo no registra descargas ni interacciones en el Hub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7: backbone vision-language Cosmos-Reason2/Qwen3-VL + transformer de acciones con flow matching |
| Parametros totales | 3.144.016.000 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea son en inglés en el dataset de entrenamiento) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |
| Tipo de robot | `so_follower` (SO-101) |
| Cámaras de entrada | `front`, `wrist` (3×480×640 cada una) |
| Estado de entrada | `observation.state`, vector de 6 dimensiones |
| Salida | `action`, vector de 6 dimensiones |
| Dataset de entrenamiento | `Jiamo0912/so101-stack-cubes` (100 episodios, 41.359 frames, 30 FPS) |
| Pasos de entrenamiento | 40.000 |
| Batch size | 32 |
| Optimizador / LR | AdamW / 1e-4 |
| Semilla | 1000 |
| Versión de LeRobot | 0.6.1 |
| Tamaño del repo | 102,2 GB |

## Arquitectura y entrenamiento

GR00T N1.7 combina dos componentes. El primero es un backbone vision-language basado en Cosmos-Reason2/Qwen3-VL que procesa las imágenes de las cámaras `front` y `wrist` junto con la instrucción en lenguaje natural de la tarea, generando representaciones multimodales del escenario. El segundo es un transformer de acciones entrenado con flow matching que, condicionado por esas representaciones y por el estado propioceptivo de 6 dimensiones, predice la acción de 6 dimensiones (posición de las articulaciones) a la frecuencia de control del robot. Este diseño desacopla la percepción semántica (backbone VLM preentrenado) de la generación motora (cabecera de difusión/flow), lo que permite reutilizar conocimiento visual y lingüístico general en tareas robóticas específicas.

El fine-tuning se realizó con LeRobot 0.6.1 sobre el dataset `Jiamo0912/so101-stack-cubes`, compuesto por 100 episodios de demostración teleoperada (41.359 frames a 30 FPS, aproximadamente 23 minutos de datos) para la tarea "Stack the blue cube on the red cube, then stack the white cube on the blue cube". La configuración es la estándar de imitación supervisada: 40.000 pasos, batch de 32, AdamW con learning rate 1e-4 y semilla 1000. No se documenta en la información disponible el número total de tokens de entrenamiento del backbone original, la composición del dataset de preentrenamiento de GR00T N1.7 ni si hubo etapas de RLHF o DPO; el autor tampoco especifica si se congelaron capas del backbone durante el fine-tuning.

## Capacidades

- Control robótico de manipulación: predice acciones de 6 grados de libertad para el brazo SO-101 a partir de observaciones visuales y de estado articular.
- Percepción visual multi-cámara: procesa simultáneamente una vista frontal y una vista de muñeca a resolución 480×640.
- Condicionamiento por lenguaje: la tarea se especifica como instrucción textual ("Stack the blue cube on the red cube, then stack the white cube on the blue cube"), lo que en principio permite reutilizar el modelo con variantes de instrucción, aunque no hay evidencia publicada de generalización a otras tareas.
- Razonamiento visomotor implícito: el backbone VLM aporta comprensión de escena (identificación de cubos por color y posición) que se traduce en la secuencia de agarre y apilado.
- Ejecución autónoma en bucle cerrado: la política se ejecuta con `lerobot-rollout` a 30 FPS, recibiendo observaciones en tiempo real.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión general, audio ni modo de razonamiento explícito (thinking mode). Es una política de robótica, no un modelo de chat.

## Casos de uso

- Apilado de cubos en el SO-101: caso de uso directo y único documentado. El modelo ejecuta la secuencia azul-sobre-rojo y blanco-sobre-azul con las cámaras y el robot exactos del dataset de entrenamiento; sirve como referencia reproducible del pipeline LeRobot + GR00T.
- Reproducción de experimentos de imitación: investigadores pueden desplegar la política con `lerobot-rollout` y comparar su comportamiento con otras cabeceras (ACT, Diffusion Policy, π0) sobre el mismo dataset y hardware, usando este checkpoint como línea base.
- Fine-tuning adicional sobre nuevas tareas: al estar en formato LeRobot y con licencia Apache 2.0, el checkpoint puede servir como inicialización para reentrenar con `lerobot-train` sobre otros datasets de manipulación con el mismo robot, aunque no hay datos publicados sobre la eficacia de ese transfer.
- Docencia y formación en robótica de imitación: el par dataset + política es un ejemplo completo y de bajo coste (SO-101 es un brazo de hardware abierto) para enseñar captura de datos teleoperados, entrenamiento y despliegue.
- Evaluación de robustez visual: al depender de dos cámaras fijas, el modelo permite estudiar cómo varía el éxito ante cambios de iluminación, posición de objetos o distracciones, aunque el autor no ha publicado esa evaluación.
- Integración en pipelines de investigación comparativa: el checkpoint puede cargarse programáticamente desde LeRobot para medir latencia, throughput y tasa de éxito en entornos controlados, contribuyendo a benchmarks de políticas fundacionales.
- Prototipado de automatización de laboratorio: para tareas de pick-and-place con objetos de color similar en un SO-101, el modelo puede adaptarse mediante reentrenamiento con pocos episodios, siempre que se respete la configuración de cámaras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección de evaluación vacía con la nota explícita: "No evaluation results have been provided for this policy yet." No hay tasas de éxito, número de ensayos ni comparaciones con otras políticas sobre la misma tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 3.144 millones de parámetros, en FP16/BF16 los pesos ocupan aproximadamente 6,3 GB; en FP32, unos 12,6 GB. A ello hay que sumar el estado del optimizador si se reentrena (AdamW con dos momentos en FP32 añadiría del orden de 25 GB) y las activaciones del backbone VLM, que dependen de la resolución y del número de cámaras.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una GPU con 16-24 GB (RTX 4090, A5000, L4) debería bastar para inferencia en precisión media; para entrenamiento con batch 32 se recomienda al menos 40-80 GB (A100, H100) o técnicas de gradient checkpointing y precisión mixta.
- ¿Cabe en GPU de consumo? Probablemente sí para inferencia en FP16 en una RTX 4090 (24 GB) o RTX 3090 (24 GB), aunque no hay confirmación oficial ni mediciones publicadas.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución en robot, `lerobot-train` para reentrenamiento). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para una política de acciones con flow matching.
- Latencia y throughput: no disponibles. La política está pensada para control a 30 FPS, pero no se publican mediciones de tiempo de inferencia por paso en hardware concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `RoboColosseum/so101-stack-cubes-gr00t-n1.7` | 3.144 M | no disponible | Apilado de cubos en SO-101 | Apache 2.0 | Hugging Face, 0 descargas |
| GR00T N1.7 (base, NVIDIA) | no disponible en la información | no disponible | Modelo fundacional cross-embodiment | no disponible en la información | GitHub NVIDIA/Isaac-GR00T |
| Políticas LeRobot tipo ACT / Diffusion Policy | típicamente decenas de millones | no aplica | Imitación sobre SO-101 | Apache 2.0 (LeRobot) | Hugging Face, ampliamente usadas |
| π0 (Physical Intelligence) | no disponible en la información | no disponible | Control robótico generalista | no disponible en la información | no disponible en la información |

La comparación cuantitativa con alternativas no es posible con los datos proporcionados: no hay benchmarks comunes ni tasas de éxito publicadas para este checkpoint. La diferencia principal frente a políticas ligeras como ACT es el uso de un backbone VLM de miles de millones de parámetros, lo que encarece el despliegue sin que haya evidencia pública de mejora en esta tarea concreta.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay tasas de éxito ni número de ensayos, por lo que se desconoce si la política funciona de forma fiable incluso en su tarea nominal.
- Especialización extrema: entrenada solo para apilar tres cubos de colores concretos; no hay evidencia de generalización a otras posiciones, colores, objetos o instrucciones.
- Dependencia de configuración exacta: requiere el robot `so_follower`, dos cámaras con nombres `front` y `wrist` a 480×640 y 30 FPS, y el vector de estado de 6 dimensiones. Cualquier cambio en montaje, calibración o resolución puede degradar el comportamiento.
- Dataset pequeño: 100 episodios (~23 minutos) son insuficientes para cubrir variabilidad de iluminación, oclusiones o posiciones iniciales diversas; riesgo alto de sobreajuste al escenario de grabación.
- Riesgo de alucinación motora: como toda política de imitación, puede ejecutar acciones plausibles pero incorrectas (agarres fallidos, colisiones) sin señal de incertidumbre; requiere supervisión humana y parada de emergencia en producción.
- Sesgos: no documentados por el autor; al entrenarse con un único operador y escenario, hereda los sesgos de esas demostraciones (velocidad, trayectorias, posiciones preferidas).
- Idiomas: la instrucción de tarea está en inglés; no se documenta soporte multilingüe ni evaluación en otros idiomas.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base GR00T N1.7 y el backbone Qwen3-VL pueden tener condiciones adicionales que el autor no detalla; conviene verificar la licencia del modelo fundacional antes de un despliegue comercial.
- Tamaño del repo: 102,2 GB dificultan la descarga y el almacenamiento; no se ofrecen versiones cuantizadas ni pesos en otros formatos.
- Fecha de creación futura (2026-11-04) en los metadatos: conviene verificar la integridad y procedencia del repositorio antes de usarlo.
- Cero tracción: 0 descargas y 0 likes implican ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RoboColosseum/so101-stack-cubes-gr00t-n1.7
- Dataset de entrenamiento: https://huggingface.co/datasets/Jiamo0912/so101-stack-cubes
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Jiamo0912/so101-stack-cubes
- Repositorio GR00T de NVIDIA: https://github.com/NVIDIA/Isaac-GR00T
- Guía LeRobot para GR00T: https://huggingface.co/docs/lerobot/main/en/groot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
