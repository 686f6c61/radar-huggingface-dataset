# ASethi04/pi05-BimanualYAM-canonical-umi75-teleop25-ee20-12k

## Resumen

El modelo `ASethi04/pi05-BimanualYAM-canonical-umi75-teleop25-ee20-12k` es un checkpoint de investigación de la política robótica Pi0.5, desarrollado por ASethi04 y publicado en Hugging Face bajo la librería LeRobot. Está diseñado para la manipulación bimanual con predicción de acciones de efector final (EE20) en un espacio de 20 dimensiones (dos brazos, cada uno con posición xyz, rotación R6D y apertura de pinza). El checkpoint parte de una versión previa entrenada con teleoperación medida y se adapta durante 12.000 pasos adicionales con una mezcla de datos canónicos UMI (75%) y teleoperación (25%), sin contracción de rotación ni transporte de etiquetas.

El modelo predice un chunk de 24 acciones (H24) relativas a la consulta, es decir, cada pose futura se expresa como `DeltaT_k = inverse(T_t) @ T_(t+k)`. Está orientado a la comparación de hardware en robótica, no a tareas generales de lenguaje o visión. Con aproximadamente 4.140 millones de parámetros, es una versión compacta de la familia Pi0, que utiliza el tokenizer de PaliGemma como parte de su pipeline.

La relevancia de este checkpoint radica en su naturaleza experimental: sirve para evaluar el impacto de diferentes fuentes de datos de entrenamiento (UMI canónico vs. teleoperación medida) en el rendimiento de políticas bimanuales, así como para probar la viabilidad de despliegue en distintos robots con cinemática I2RT (inverse kinematics with iterative residual tuning).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política visual-language-action (VLA) basada en PaliGemma (según tokenizer usado); detalles completos no disponibles |
| Parametros totales | 4.143.404.816 (~4,14 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No especificados; los pesos se publican en formato safetensors (16,6 GB) |
| Idiomas soportados | No disponibles (el prompt de tarea está en inglés: "pick up oranges and place them in the bowl") |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo pertenece a la familia Pi0.5, una arquitectura de política visual-language-action (VLA) que combina un codificador visual y de lenguaje (PaliGemma) con un decodificador de acciones. Aunque la model card no detalla la arquitectura interna completa, se sabe que usa el tokenizer de `google/paligemma-3b-pt-224`, lo que sugiere una base de transformer multimodal. La salida es una secuencia de 24 acciones (H24) de 20 dimensiones cada una, donde cada brazo contribuye con `xyz + R6D + gripper futuro absoluto normalizado`, ordenado izquierdo y luego derecho.

El entrenamiento se realiza en dos fases: primero un checkpoint previo entrenado con teleoperación medida (12k pasos) y luego una adaptación de 12.000 pasos adicionales con una mezcla de datos canónicos UMI (75%) y teleoperación (25%). Las fuentes de datos son `brandonyang/dual-lidar-umi-independent` (269.228 consultas UMI) y `brandonyang/yam-ultrawide-teleop` (89.743 consultas teleoperadas). El batch global es de 64 y no se aplica contracción de rotación ni transporte de etiquetas. El despliegue en el robot convierte cada objetivo relativo de efector final a través de IK I2RT.

## Capacidades

- Manipulación bimanual: predice acciones coordinadas para dos brazos robóticos, incluyendo posición, orientación y estado de pinza.
- Predicción de acciones en chunk: genera 24 pasos futuros de una vez, lo que permite planificación a corto plazo.
- Acciones relativas al efector final: cada pose futura se expresa en el marco de referencia de la pose actual (`DeltaT_k`), facilitando la transferencia a diferentes robots.
- Uso de prompts en lenguaje natural: la tarea se especifica mediante un prompt textual (por ejemplo, "pick up oranges and place them in the bowl").
- Integración con LeRobot: compatible con el ecosistema de entrenamiento y despliegue de LeRobot.
- Enfoque experimental: diseñado para comparar fuentes de datos y hardware, no para producción directa.

## Casos de uso

- Investigación en aprendizaje por imitación: permite estudiar cómo la mezcla de datos UMI canónicos y teleoperación medida afecta el rendimiento de políticas bimanuales en tareas de recoger y colocar.
- Comparación de hardware robótico: al ser un checkpoint de comparación, se puede desplegar en diferentes plataformas con IK I2RT para evaluar la precisión y robustez de la ejecución.
- Validación de pipelines de datos: útil para probar pipelines de aumento de datos o de transporte de etiquetas, ya que este modelo no aplica contracción de rotación.
- Desarrollo de controladores de bajo nivel: las acciones de efector final (EE20) pueden integrarse en controladores de robots bimanuales para tareas como ensamblaje o manipulación de objetos pequeños.
- Benchmarking de políticas VLA: sirve como referencia para comparar con otros checkpoints de Pi0.5 o modelos similares en tareas de manipulación.
- Entrenamiento de políticas de continuación: puede usarse como punto de partida para fine-tuning en tareas específicas con datos adicionales, dado que ya ha aprendido una representación de acciones bimanuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de éxito, precisión ni comparaciones con otros modelos.

## Requisitos de hardware

- El tamaño del repositorio es de 16,6 GB en safetensors, lo que sugiere pesos en precisión fp32 o bf16. Con 4.140 millones de parámetros, la inferencia en fp32 requeriría aproximadamente 16,6 GB de VRAM solo para los pesos, más memoria para activaciones y contexto.
- GPU recomendada: una tarjeta con al menos 24 GB de VRAM (por ejemplo, RTX 4090, A5000) sería necesaria para inferencia sin cuantización. Con cuantización a 8 bits, podría caber en GPUs de 12-16 GB, pero no se proporcionan configuraciones oficiales.
- No se especifican requisitos de hardware en la documentación. Se recomienda usar un robot con IK I2RT y compuertas de seguridad (colisión, límites articulares, parada de operador).
- Opciones de despliegue: al ser un modelo LeRobot, puede ejecutarse con el framework LeRobot (PyTorch). No se menciona compatibilidad con vLLM, llama.cpp u otros motores de inferencia, ya que no es un modelo de lenguaje estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo es un checkpoint específico de Pi0.5, y no se ofrecen datos de otros modelos de la misma categoría (por ejemplo, Pi0, OpenVLA, etc.) para comparar.

## Limitaciones y advertencias

- Modelo experimental: es un checkpoint de investigación, no un producto listo para producción. Requiere validación exhaustiva antes de cualquier uso real.
- Dependencia del entorno: las acciones se predicen en el marco del efector final y requieren un robot con cinemática I2RT para convertir los objetivos relativos en comandos articulares.
- Riesgo de colisión o daño: la model card advierte explícitamente sobre el uso de compuertas de seguridad (colisión, espacio de trabajo, límites articulares, éxito de IK y parada de operador).
- Sin datos de generalización: no se proporcionan métricas de rendimiento en tareas no vistas ni en entornos variados.
- Licencia y uso comercial: la licencia no está disponible, por lo que no se puede confirmar si el modelo puede usarse en aplicaciones comerciales.
- Idiomas limitados: el prompt de tarea está en inglés; no se documenta soporte multilingüe.
- Tamaño y recursos: con ~4,14B parámetros, requiere hardware con suficiente VRAM; no es adecuado para dispositivos embebidos o edge sin cuantización.

## Enlaces

- Hugging Face: [ASethi04/pi05-BimanualYAM-canonical-umi75-teleop25-ee20-12k](https://huggingface.co/ASethi04/pi05-BimanualYAM-canonical-umi75-teleop25-ee20-12k)
- Fuente de datos UMI canónico: [brandonyang/dual-lidar-umi-independent](https://huggingface.co/datasets/brandonyang/dual-lidar-umi-independent)
- Fuente de datos teleoperados: [brandonyang/yam-ultrawide-teleop](https://huggingface.co/datasets/brandonyang/yam-ultrawide-teleop)
- Tokenizer y modelo base: [google/paligemma-3b-pt-224](https://huggingface.co/google/paligemma-3b-pt-224)
