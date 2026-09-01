# CamilleWalters/groot-marker-v1

## Resumen

El modelo `CamilleWalters/groot-marker-v1` es una política robótica especializada en manipulación, entrenada con el framework LeRobot de Hugging Face sobre el modelo base GR00T N1.7 de NVIDIA. GR00T N1.7 es un modelo fundacional de robótica de código abierto, de cross-embodiment, diseñado para razonamiento y habilidades de robots humanoides generalistas. Utiliza un backbone Cosmos-Reason2/Qwen3-VL para procesar visión y lenguaje, y un transformer de acciones con flow-matching para predecir comandos motores a partir de observaciones visuales, instrucciones lingüísticas y propiocepción.

Este modelo concreto ha sido entrenado para una tarea específica: recoger un marcador rojo y colocarlo sobre un cuadrado. Cuenta con 3.144 millones de parámetros y se distribuye en formato safetensors bajo licencia Apache 2.0. Su relevancia radica en que demuestra cómo se puede ajustar un modelo fundacional de robótica de última generación para una tarea de manipulación con un conjunto de datos relativamente pequeño (50 episodios), usando herramientas open source como LeRobot.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7 (backbone Cosmos-Reason2/Qwen3-VL + flow-matching action transformer) |
| Parametros totales | 3.144.016.000 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un LLM conversacional; procesa imágenes y estado) |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors, presumiblemente FP32/FP16) |
| Idiomas soportados | no disponible (el modelo procesa instrucciones en inglés, pero no se especifica soporte multilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en GR00T N1.7, un modelo fundacional de robótica de NVIDIA que combina un backbone de visión-lenguaje (Cosmos-Reason2/Qwen3-VL) con un transformer de acciones que utiliza flow-matching para generar comandos motores. Esta arquitectura permite que el modelo procese simultáneamente imágenes de cámaras (principal y de muñeca), el estado propioceptivo del robot (posición y velocidad de las articulaciones) y una instrucción en lenguaje natural, produciendo una acción de 7 dimensiones correspondiente al control del brazo robótico.

El entrenamiento se realizó con el framework LeRobot (versión 0.6.1) sobre el dataset `CamilleWalters/solo-marker-v1_20260828_121357`, que contiene 50 episodios y 21.986 frames a 30 FPS. La configuración de entrenamiento incluyó 10.000 pasos, batch size de 32, optimizador AdamW con learning rate de 0.0001 y semilla 1000. No se menciona el uso de técnicas como RLHF o DPO; se trata de un entrenamiento de imitación supervisada estándar para políticas robóticas.

## Capacidades

- Control robótico de manipulación: genera acciones de 7 dimensiones (posición y orientación del efector final) a partir de observaciones visuales y propioceptivas.
- Procesamiento multimodal: integra dos cámaras (principal y de muñeca) con resolución 480x640 y un vector de estado de 7 valores.
- Ejecución de tareas guiadas por lenguaje: interpreta la instrucción "Pick up the red marker and place it on the square" y ejecuta la secuencia de acciones correspondiente.
- Inferencia en tiempo real: entrenado a 30 FPS, apto para control en bucle cerrado con robots reales.
- Compatibilidad con LeRobot: se integra con el ecosistema LeRobot para entrenamiento, evaluación y despliegue en robots soportados (tipo `widowxai_follower_robot`).
- No incluye capacidades de generación de texto, tool calling ni razonamiento conversacional; es una política de acción pura.

## Casos de uso

- Automatización de tareas de picking and placing en laboratorio: el modelo puede controlar un brazo robótico para recoger objetos pequeños (como un marcador) y colocarlos en posiciones definidas, útil en entornos de investigación y prototipado.
- Integración en líneas de montaje flexibles: al ser un modelo de imitación, puede adaptarse a tareas de manipulación específicas sin necesidad de programación explícita, simplemente registrando demostraciones.
- Benchmarking de algoritmos de imitación: sirve como caso de estudio para evaluar el rendimiento de GR00T N1.7 con pocos datos (50 episodios) frente a otras políticas de LeRobot.
- Desarrollo de habilidades robóticas reutilizables: el modelo puede servir como base para fine-tuning en tareas similares (por ejemplo, recoger otros objetos o colocarlos en otras posiciones) usando el mismo framework.
- Demostraciones educativas de robótica con IA: permite mostrar a estudiantes y desarrolladores cómo se entrena y despliega una política de manipulación con herramientas open source.
- Investigación en cross-embodiment: al basarse en GR00T N1.7, puede utilizarse para estudiar la transferencia de habilidades entre diferentes plataformas robóticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real. No hay datos de éxito en tareas, ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: no se especifica oficialmente. Con 3.144 millones de parámetros, en FP32 se necesitarían aproximadamente 12,6 GB solo de pesos, más overhead de activaciones. En FP16, unos 6,3 GB. Se recomienda una GPU con al menos 12 GB de VRAM para inferencia cómoda.
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB) o superiores para FP16; A100 o H100 para entrenamiento y despliegue a gran escala.
- Compatibilidad con GPU de consumo: sí, una RTX 4090 puede ejecutar el modelo en FP16 con margen para las activaciones de las dos cámaras.
- Opciones de despliegue: el modelo está diseñado para usarse con LeRobot, que soporta inferencia local mediante `lerobot-rollout`. También es compatible con el ecosistema de NVIDIA Isaac GR00T.
- Latencia y throughput: no se han publicado datos. Al operar a 30 FPS de entrada, se espera que la inferencia sea suficientemente rápida para control en tiempo real, pero depende de la GPU.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos de robótica del mismo tamaño o de la misma familia en la información proporcionada. El modelo es un fine-tuning de GR00T N1.7, que es la referencia principal. Otras políticas de LeRobot (por ejemplo, ACT, Diffusion Policy) tienen arquitecturas y tamaños muy diferentes (del orden de decenas de millones de parámetros), por lo que no son directamente comparables en términos de capacidad. No se puede establecer una comparativa cuantitativa fiable sin datos de evaluación.

## Limitaciones y advertencias

- Sobreajuste: entrenado con solo 50 episodios, es muy probable que el modelo esté sobreajustado a las condiciones específicas del dataset (posición de cámara, iluminación, objeto concreto). No generalizará bien a variaciones no vistas.
- Tarea única: solo es capaz de ejecutar la tarea "recoger el marcador rojo y colocarlo en el cuadrado". Cualquier cambio en el objeto, color, posición o entorno degradará el rendimiento.
- Dependencia del robot: entrenado para `widowxai_follower_robot`, no es directamente transferible a otros robots sin reentrenamiento.
- Sin evaluación en robot real: la model card no reporta resultados de éxito en el mundo real, por lo que no se puede validar su rendimiento real.
- Riesgo de alucinación de acciones: como todo modelo generativo, puede producir acciones incoherentes o peligrosas si las observaciones se desvían del dominio de entrenamiento.
- Limitaciones de contexto: no soporta diálogo ni instrucciones complejas; la instrucción es fija y debe coincidir exactamente con la usada en el entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero el usuario es responsable de cumplir con las condiciones de los modelos base subyacentes (GR00T N1.7, Cosmos-Reason2, Qwen3-VL), que pueden tener licencias adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CamilleWalters/groot-marker-v1
- Dataset de entrenamiento: https://huggingface.co/datasets/CamilleWalters/solo-marker-v1_20260828_121357
- Repositorio Isaac-GR00T de NVIDIA: https://github.com/NVIDIA/Isaac-GR00T
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de GR00T en LeRobot: https://huggingface.co/docs/lerobot/main/en/groot
- Referencia de rollout de LeRobot: https://huggingface.co/docs/lerobot/main/en/inference
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=CamilleWalters/solo-marker-v1_20260828_121357
