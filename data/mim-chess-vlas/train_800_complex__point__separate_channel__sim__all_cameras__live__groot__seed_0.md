# mim-chess-vlas/train_800_complex__point__separate_channel__sim__all_cameras__live__groot__seed_0

## Resumen

Este repositorio contiene una política robótica entrenada con LeRobot sobre la arquitectura GR00T N1.7 de NVIDIA, un modelo fundacional abierto y cross-embodiment para razonamiento y habilidades de robots humanoides. El modelo combina un backbone de visión-lenguaje Cosmos-Reason2/Qwen3-VL con un transformer de acciones basado en flow matching, que predice acciones condicionadas por visión, lenguaje y propiocepción. El checkpoint concreto está especializado en una tarea de pick-and-place sobre un robot Panda en simulación.

El modelo resuelve el problema de mapear observaciones multimodales (cuatro cámaras de 224x224 píxeles más un vector de estado de 9 dimensiones) a un vector de acción de 7 dimensiones, siguiendo instrucciones en lenguaje natural. Es relevante porque demuestra el flujo de trabajo de ajuste fino de un modelo fundacional robótico sobre un dataset específico de 790 episodios y 157.904 frames a 20 FPS, un patrón cada vez más habitual para prototipar políticas de manipulación sin entrenar desde cero.

El nombre del repositorio refleja la configuración experimental: 800 tareas complejas, representación por puntos, canal separado, simulación, todas las cámaras, modo live, backbone GR00T y semilla 0. El tamaño del repo es de 12,6 GB y el recuento de parámetros en safetensors asciende a 3.144.016.000.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7: backbone VLM Cosmos-Reason2/Qwen3-VL + transformer de acciones con flow matching |
| Parametros totales | 3.144.016.000 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea están en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño de GR00T N1.7: un backbone de visión-lenguaje (Cosmos-Reason2/Qwen3-VL) que procesa las imágenes de cámara y la instrucción textual, acoplado a un transformer de acciones que genera trayectorias mediante flow matching. La política consume cuatro flujos visuales (`agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2` y `mask`), cada uno de forma (3, 224, 224), más un vector de estado propioceptivo de 9 dimensiones, y produce acciones de 7 dimensiones.

El ajuste fino se realizó sobre el dataset `mim-chess-vlas/train_800_complex__point__separate_channel__sim__all_cameras__live`, con 790 episodios, 157.904 frames y una tasa de 20 FPS. Las tareas cubren una amplia variedad de objetos geométricos descritos en lenguaje natural (bolas, huevos, estrellas de cuatro puntas, anillos dentados, cubos ranurados, etc.) con la instrucción de depositarlos en una caja. No se dispone de información sobre el número total de tokens de entrenamiento, la composición completa del dataset ni si se aplicaron fases de RLHF o DPO en este checkpoint concreto.

## Capacidades

- Manipulación robótica pick-and-place guiada por instrucciones en lenguaje natural sobre un robot Panda.
- Percepción multimodal con cuatro cámaras simultáneas, incluida una máscara de segmentación.
- Fusión de visión, lenguaje y propiocepción para predecir acciones de 7 dimensiones.
- Generalización a múltiples objetos con geometrías complejas descritas textualmente.
- Ejecución de políticas en simulación con integración en el ecosistema LeRobot.
- No se documenta soporte de tool calling, agentes multi-paso, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación en manipulación robótica: servir como política de referencia para comparar variantes de representación (puntos, canales separados, múltiples cámaras) en experimentos de pick-and-place.
- Prototipado de tareas de recogida y depósito en simulación: el modelo puede ejecutar instrucciones como coger un objeto concreto y colocarlo en una caja, lo que permite validar pipelines de evaluación antes de transferir a hardware real.
- Ajuste fino con LeRobot: el checkpoint sirve como punto de partida para entrenar políticas sobre nuevos datasets manteniendo el backbone GR00T y el transformer de acciones.
- Evaluación de robustez ante descripciones lingüísticas: las tareas incluyen descripciones muy detalladas de geometría, lo que permite estudiar cómo afecta la formulación del prompt al éxito de la política.
- Benchmarking de modelos fundacionales robóticos: al estar entrenado con una semilla y configuración concretas, facilita comparaciones reproducibles frente a otros checkpoints del mismo autor.
- Docencia y divulgación: ejemplo completo de extremo a extremo (dataset, entrenamiento, checkpoint, inferencia) para cursos sobre aprendizaje por imitación y modelos fundacionales en robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 3.144 millones de parámetros, en fp16 serían necesarios aproximadamente 6,3 GB solo para pesos, más overhead de activaciones y buffers de las cuatro cámaras.
- GPU recomendadas: no disponible; por tamaño, una GPU con 16 GB o más (RTX 4090, A100, H100) sería un punto de partida razonable, pero no está confirmado por el autor.
- ¿Cabe en GPU consumer? Probablemente en modelos con 16-24 GB de VRAM en precisión reducida, aunque no se documenta una cuantización oficial.
- Opciones de despliegue: LeRobot (librería oficial del checkpoint); no se documenta soporte explícito de vLLM, llama.cpp, Ollama o TGI para esta política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este checkpoint (GR00T N1.7 ajustado) | 3.144.016.000 | no disponible | apache-2.0 | Hugging Face, vía LeRobot |
| GR00T N1.7 base (NVIDIA) | no disponible | no disponible | no disponible | GitHub Isaac-GR00T |
| Otras políticas LeRobot (p. ej. ACT, Diffusion Policy) | no disponible | no disponible | no disponible | Hugging Face, vía LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El checkpoint está entrenado exclusivamente en simulación sobre un robot Panda; no hay evidencia de transferencia a hardware real.
- El dataset cubre una familia concreta de tareas de pick-and-place con objetos geométricos; el rendimiento fuera de esa distribución es desconocido.
- Las instrucciones de tarea están en inglés y son extremadamente específicas; variaciones en la formulación pueden afectar al comportamiento.
- No se documentan evaluaciones de sesgo, alucinación o robustez ante perturbaciones visuales.
- La licencia apache-2.0 permite uso comercial, pero el modelo base GR00T y sus dependencias deben verificarse por separado.
- El reducido número de descargas (18) y la ausencia de likes sugieren un checkpoint experimental sin validación comunitaria amplia.
- No se especifican requisitos de hardware ni latencias, lo que dificulta planificar un despliegue en producción.

## Enlaces

- Hugging Face: https://huggingface.co/mim-chess-vlas/train_800_complex__point__separate_channel__sim__all_cameras__live__groot__seed_0
- Dataset de entrenamiento: https://huggingface.co/datasets/mim-chess-vlas/train_800_complex__point__separate_channel__sim__all_cameras__live
- Repositorio GR00T de NVIDIA: https://github.com/NVIDIA/Isaac-GR00T
- Guía LeRobot para GR00T: https://huggingface.co/docs/lerobot/main/en/groot
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
