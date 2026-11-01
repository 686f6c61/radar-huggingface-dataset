# mim-chess-vlas/train_800_sparse__mask__separate_channel__sim__all_cameras__live__groot__seed_0

## Resumen

Este repositorio contiene una política de robótica entrenada con LeRobot sobre la arquitectura GR00T N1.7 de NVIDIA, un modelo fundacional abierto y cross-embodiment para razonamiento y habilidades de robots humanoides. El modelo combina un backbone visión-lenguaje Cosmos-Reason2/Qwen3-VL con un transformer de acciones basado en flow matching, que predice acciones condicionadas por visión, lenguaje y propiocepción. El checkpoint aquí publicado es un ajuste fino específico para la tarea de recogida y colocación de objetos en un entorno simulado con un robot Panda.

El modelo resuelve el problema de la generación de políticas de imitación (imitation learning) para manipulación robótica: dado un estado de articulaciones de 9 dimensiones y cuatro cámaras de 224x224 píxeles (vista del agente, dos cámaras en la muñeca y una máscara de segmentación), produce un vector de acción de 7 dimensiones. Es relevante porque demuestra el flujo completo de entrenamiento y despliegue de un modelo fundacional robótico con licencia Apache 2.0, con 3.144.016.000 parámetros totales y un tamaño de repositorio de 12,6 GB.

La nomenclatura del repositorio refleja la configuración experimental: 800 episodios de entrenamiento con anotaciones dispersas, máscara como canal separado, simulación con todas las cámaras y datos en vivo, sobre el backbone GR00T con semilla 0. El dataset asociado contiene 787 episodios y 195.184 fotogramas a 20 FPS, cubriendo 40 tareas de recogida y colocación de distintos objetos domésticos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GR00T N1.7: backbone Cosmos-Reason2/Qwen3-VL + transformer de acciones con flow matching |
| Parámetros totales | 3.144.016.000 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | Panda |
| Entradas | observation.state (9,), 4 imágenes (3, 224, 224) |
| Salidas | action (7,) |
| Cámaras | agentview, robot0_eye_in_hand, robot0_eye_in_hand_2, mask |
| Librería | lerobot 0.6.0 |
| Tamaño del repositorio | 12,6 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GR00T N1.7, que acopla un backbone visión-lenguaje Cosmos-Reason2/Qwen3-VL con un transformer de acciones entrenado mediante flow matching. El backbone procesa las observaciones visuales (cuatro cámaras de 224x224) y las instrucciones en lenguaje natural, mientras que el transformer de acciones genera trayectorias de acción continuas condicionadas por la representación multimodal y el estado propioceptivo de 9 dimensiones. Esta separación permite reutilizar un modelo visión-lenguaje preentrenado a gran escala y especializar únicamente el cabezal de acciones para la tarea concreta.

El entrenamiento se realizó con LeRobot 0.6.0 durante 60.000 pasos, con batch size de 16, optimizador AdamW y learning rate de 7e-05, usando semilla 0. El dataset de entrenamiento contiene 787 episodios y 195.184 fotogramas a 20 FPS, con 40 tareas distintas de tipo "Pick the [objeto] and place it into the box". La configuración experimental incluye anotaciones dispersas (sparse), máscara como canal separado y captura con todas las cámaras disponibles, lo que sugiere un estudio comparativo de variantes de entrenamiento. No se especifica en la información disponible si hubo RLHF, DPO ni detalles sobre la composición exacta del corpus de preentrenamiento del backbone.

## Capacidades

- Generación de políticas de manipulación robótica: predice acciones de 7 dimensiones (probablemente 6 de pose más 1 de pinza) a partir de observaciones multimodales.
- Fusión visión-lenguaje-acción: integra cuatro flujos visuales (vista global, dos cámaras de muñeca y máscara de segmentación) con instrucciones en lenguaje natural.
- Condicionamiento por tarea en lenguaje: las 40 tareas del dataset demuestran que la política responde a instrucciones textuales del tipo "Pick the X and place it into the box".
- Percepción con máscara de segmentación: el canal `mask` como entrada visual separada permite un sesgo explícito hacia la región de interés.
- Manipulación de objetos domésticos diversos: frutas, verduras, envases, utensilios y electrodomésticos.
- Control a 20 FPS: la frecuencia del dataset marca el régimen temporal de operación esperado.
- No se dispone de información sobre tool calling, agentes multi-paso, capacidades multilingües ni modos de razonamiento explícito, ya que es un modelo de política robótica y no un LLM conversacional.

## Casos de uso

- Manipulación pick-and-place en simulación: desplegar la política en un entorno simulado con robot Panda para recoger objetos domésticos y depositarlos en una caja, usando las cuatro cámaras como entrada. Es el caso directamente cubierto por el dataset de entrenamiento.
- Investigación en imitation learning: servir como baseline reproducible (semilla 0, hiperparámetros documentados) para comparar variantes de anotación dispersa, uso de máscaras y configuraciones de cámara.
- Estudio de transferencia sim-to-real: el checkpoint entrenado en simulación con todas las cámaras puede evaluarse como punto de partida para ajuste fino con datos reales, aunque requerirá calibración de dominio.
- Benchmarking de modelos fundacionales robóticos: comparar GR00T N1.7 frente a otras políticas (Diffusion Policy, ACT, π0) en las mismas 40 tareas para medir tasa de éxito y generalización entre objetos.
- Evaluación de representaciones visuales: analizar el impacto del canal de máscara separado frente a la máscara fusionada en el rendimiento de la política, gracias a la nomenclatura comparativa del repositorio.
- Prototipado de pipelines LeRobot: usar el comando `lerobot-rollout` documentado en la model card como ejemplo funcional de despliegue de una política GR00T con robot Panda y múltiples cámaras OpenCV.
- Docencia y divulgación: ejemplo completo y abierto (Apache 2.0) del ciclo registro de datos, entrenamiento y despliegue de un modelo fundacional robótico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, métricas de error de acción ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 3.144 millones de parámetros en precisión completa (fp32) se requieren aproximadamente 12,6 GB solo para pesos; en bf16/fp16 bajaría a unos 6,3 GB, más el overhead de activaciones y del backbone visión-lenguaje.
- GPU recomendadas: A100 (40/80 GB), H100 o L40S para inferencia en bf16 con margen; RTX 4090 (24 GB) es viable en bf16 para una sola instancia.
- GPU de consumo: una RTX 4090 o RTX 3090 (24 GB) puede alojar los pesos en bf16, aunque el throughput dependerá del tamaño del backbone Qwen3-VL. GPU con 16 GB o menos requerirían cuantización, no documentada en la información disponible.
- Opciones de despliegue: LeRobot (`lerobot-rollout`) es el método documentado; al ser pesos safetensors estándar, también podría integrarse con vLLM/TGI solo si el backbone lo soporta, aunque la política de acciones requiere el pipeline específico de LeRobot.
- Latencia y throughput: no disponibles. El régimen de control del dataset es de 20 FPS, lo que marca un objetivo de latencia inferior a 50 ms por paso de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GR00T N1.7 (este checkpoint) | 3.144 M | no disponible | VLA + flow matching | Apache 2.0 | HuggingFace, LeRobot |
| Diffusion Policy | no disponible | no disponible | Política por difusión | MIT (referencia) | Repositorios de investigación |
| ACT (Action Chunking Transformer) | no disponible | no disponible | Transformer de imitación | MIT (referencia) | Repositorios de investigación |
| π0 (Physical Intelligence) | no disponible | no disponible | VLA | no disponible | no disponible |

No se dispone de datos cuantitativos de rendimiento para establecer una comparación numérica fiable entre estas alternativas en las mismas tareas.

## Limitaciones y advertencias

- Entrenado exclusivamente en simulación: el rendimiento en un robot físico no está validado y requerirá transferencia sim-to-real con calibración de cámaras y dinámica.
- Especializado en 40 tareas concretas de pick-and-place: no generaliza a otras habilidades (ensamblaje, herramientas, navegación) sin reentrenamiento.
- Dependencia de la configuración de cámaras: el modelo espera exactamente cuatro flujos visuales con nombres y resoluciones específicos; cambiar la disposición invalida la política.
- Requiere robot Panda y estado de 9 dimensiones: no es cross-embodiment en este checkpoint, pese a que la arquitectura base lo sea.
- Riesgo de sobreajuste al dataset de 787 episodios y a la distribución de objetos domésticos simulados.
- No hay información sobre sesgos, alucinaciones (en el sentido de acciones no válidas) ni robustez ante oclusiones.
- Licencia Apache 2.0 permite uso comercial, pero el backbone Cosmos-Reason2/Qwen3-VL puede tener sus propias condiciones que conviene verificar.
- La nomenclatura del repositorio sugiere un experimento académico; no hay garantía de mantenimiento ni soporte.
- No se documentan cuantizaciones ni requisitos mínimos de hardware oficiales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mim-chess-vlas/train_800_sparse__mask__separate_channel__sim__all_cameras__live__groot__seed_0
- Dataset de entrenamiento: https://huggingface.co/datasets/mim-chess-vlas/train_800_sparse__mask__separate_channel__sim__all_cameras__live
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=mim-chess-vlas/train_800_sparse__mask__separate_channel__sim__all_cameras__live
- Repositorio Isaac-GR00T: https://github.com/NVIDIA/Isaac-GR00T
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía GR00T en LeRobot: https://huggingface.co/docs/lerobot/main/en/groot
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
