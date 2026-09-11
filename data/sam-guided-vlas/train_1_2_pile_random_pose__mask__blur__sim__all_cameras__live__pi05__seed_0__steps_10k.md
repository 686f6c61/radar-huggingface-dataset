# sam-guided-vlas/train_1_2_pile_random_pose__mask__blur__sim__all_cameras__live__pi05__seed_0__steps_10k

## Resumen

Este repositorio contiene una política robótica de tipo Vision-Language-Action (VLA) basada en π₀.₅ (pi05), el modelo de Physical Intelligence orientado a generalización en entornos abiertos. No se trata de un modelo de lenguaje, sino de una política visuomotora entrenada por imitación que, a partir de un estado propioceptivo de 9 dimensiones y tres vistas de cámara de 224x224 píxeles, predice un vector de acción de 7 dimensiones para un brazo robótico Franka Panda. Es un fine-tuning de `lerobot/pi05_base` realizado con LeRobot 0.6.0 y publicado por el usuario `sam-guided-vlas`.

El modelo tiene 4.143.404.816 parámetros (aproximadamente 4,14 mil millones) y un repositorio de 9,4 GB en formato safetensors. Se ha entrenado sobre un dataset propio de 198 episodios y 35.267 fotogramas a 20 FPS, con 20 tareas de manipulación de objetos cotidianos (dispensador de jabón, mermelada, tarro, cereales, cuchillo, hervidor, fruta, verdura, etc.). El entrenamiento se detuvo a los 10.000 pasos con batch size 16, optimizador AdamW y learning rate 5e-05.

Su relevancia es acotada y muy específica: sirve como referencia reproducible de fine-tuning de pi05 en LeRobot, y como punto de partida para experimentos de imitación en robots Panda con configuración de tres cámaras. No aporta resultados de evaluación publicados, no declara idiomas soportados y no cuenta con descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) pi05 (π₀.₅); implementación de LeRobot adaptada del repositorio OpenPI de Physical Intelligence |
| Parámetros totales | 4.143.404.816 (≈ 4,14 B) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea del dataset están definidas en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Framework de inferencia | LeRobot 0.6.0 |
| Entradas | `observation.state` (9,), `observation.images.agentview` (3, 224, 224), `observation.images.robot0_eye_in_hand` (3, 224, 224), `observation.images.robot0_eye_in_hand_2` (3, 224, 224) |
| Salidas | `action` (7,) |
| Robot objetivo | Franka Panda |
| Modelo base | lerobot/pi05_base |

## Arquitectura y entrenamiento

La familia pi05 es un modelo Vision-Language-Action que combina percepción visual y comprensión de instrucciones en lenguaje con generación de acciones motoras. La model card indica explícitamente que π₀.₅ evoluciona π₀ para generalizar a entornos y situaciones completamente nuevos no vistos durante el entrenamiento, y que la implementación de LeRobot deriva del repositorio OpenPI. No se detallan en la información proporcionada el tipo de backbone, el tokenizador, el mecanismo de atención ni el número exacto de capas, por lo que esos datos quedan como no disponibles.

El entrenamiento es un fine-tuning supervisado por imitación desde `lerobot/pi05_base`, con 10.000 pasos, batch size 16, optimizador AdamW, learning rate 5e-05, semilla 0 y LeRobot 0.6.0. El dataset asociado contiene 198 episodios y 35.267 fotogramas grabados a 20 FPS, con 20 tareas distintas de manipulación (dispensador de jabón, mermelada, tarro, cereales, cuchillo, hervidor, pera, patata, boniato, bollo, cesta, comida en caja, tarta, lata, hamburguesa, limón, naranja, especias, calabaza y spray). No se documenta uso de RLHF, DPO ni ninguna fase de alineación por preferencias. El nombre del run sugiere variaciones de aumento de datos (poses aleatorias, máscaras, desenfoque) y combinación de simulación y datos reales, pero esto no se detalla en la model card.

## Capacidades

- Generación de acciones robóticas de 7 grados de libertad para un brazo Franka Panda a partir de observaciones multimodales.
- Percepción visual multi-cámara simultánea: una vista de agente (`agentview`) y dos vistas de muñeca (`robot0_eye_in_hand`, `robot0_eye_in_hand_2`).
- Condicionamiento por instrucción de tarea en lenguaje natural: el ejemplo de la model card usa `--task="soap dispenser"`.
- Ejecución de tareas de manipulación sobre objetos de cocina y hogar (los 20 tipos listados en el dataset).
- Control de política en bucle cerrado a partir de estado propioceptivo de 9 dimensiones más imágenes RGB.
- Integración con el flujo de LeRobot mediante `lerobot-rollout` y `lerobot-train`.
- No dispone de tool calling, function calling, razonamiento multi-paso simbólico, generación de texto general, capacidades de audio ni modo de pensamiento explícito; no es un LLM.

## Casos de uso

- Investigación en aprendizaje por imitación: reproducción del pipeline completo de fine-tuning de pi05 con LeRobot para comparar configuraciones de hiperparámetros (pasos, batch, learning rate) sobre un mismo dataset.
- Manipulación de objetos en robótica de laboratorio: la política puede desplegarse en un Panda con tres cámaras para ejecutar la tarea de recogida y colocación de objetos concretos sobre los que fue entrenada.
- Generación de datos y rollouts: usar `lerobot-rollout` con `--strategy.type=base` para ejecutar la política durante un tiempo acotado y recoger vídeo o métricas cualitativas de comportamiento.
- Punto de partida para nuevos fine-tunings: al derivar de `lerobot/pi05_base` y usar Apache-2.0, puede servir de inicialización para datasets propios con el mismo tipo de robot y configuración de cámaras.
- Estudio de generalización open-world: evaluar hasta qué punto la política transfiere a posiciones nuevas de objeto, iluminación distinta o distractores, tal como sugiere la sección de evaluación de la propia model card.
- Simulación y análisis de sim-to-real: dado que el nombre del dataset mezcla indicios de simulación y datos reales, puede emplearse en estudios de transferencia entre dominios, siempre con validación empírica propia.
- Docencia y demos de VLA: ejemplo mínimo y reproducible de política π₀.₅ en HuggingFace Hub con especificación clara de entradas, salidas y configuración de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye la sección «Evaluation» con la línea explícita «No evaluation results have been provided for this policy yet», de modo que no existen tasas de éxito por tarea, ni resultados en MMLU, HumanEval, GSM8K ni en benchmarks de manipulación robótica como LIBERO o SimplerEnv.

## Requisitos de hardware

- Estimación de VRAM en inferencia: con pesos en bf16/fp16 los 4,14 B de parámetros ocupan aproximadamente 8,3 GB; el repositorio completo pesa 9,4 GB. Con estado y tres imágenes de 224x224, una estimación razonable de VRAM de inferencia en bf16 se sitúa en torno a 10-12 GB, sin contar el búfer del runtime de robótica.
- En fp32 los pesos ocuparían aproximadamente 16,6 GB, por lo que se necesitarían al menos 20-24 GB de VRAM.
- GPU recomendadas: A100 (40/80 GB) y H100 (80 GB) para entrenamiento o para lotes grandes; RTX 4090 (24 GB) es suficiente para inferencia en bf16.
- Cabe en GPU de consumo: sí, en tarjetas con 12-16 GB o más en precisión reducida (por ejemplo RTX 4080/4090). Con 8 GB sería ajustado y probablemente requiera cuantización, dato no documentado.
- Opciones de despliegue: LeRobot 0.6.0 mediante los comandos `lerobot-rollout` y `lerobot-train` sobre PyTorch/CUDA. No se menciona soporte para vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia de LLM, que además no son aplicables al tratarse de una política de acciones.
- Latencia y throughput: no disponible. El dataset de entrenamiento fue capturado a 20 FPS, pero no se especifica la frecuencia de control en inferencia ni el tiempo por paso.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo / robot | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (fine-tuning de pi05) | 4,14 B | no disponible | VLA / Franka Panda, 3 cámaras | Apache-2.0 | HuggingFace Hub |
| lerobot/pi05_base | no disponible | no disponible | VLA base (modelo de partida) | no disponible | HuggingFace Hub (`lerobot/pi05_base`) |
| π₀ (OpenPI) | no disponible | no disponible | VLA predecesor de π₀.₅ | no disponible | Repositorio OpenPI de Physical Intelligence |
| Otras políticas VLA de manipulación (por ejemplo OpenVLA) | no disponible | no disponible | VLA / manipulación | no disponible | no disponible |

No se dispone de datos verificados de parámetros, contexto o resultados de benchmark de las alternativas en la información proporcionada, por lo que la comparación cuantitativa queda limitada al tamaño del presente modelo y a su relación de fine-tuning con `lerobot/pi05_base`.

## Limitaciones y advertencias

- No hay resultados de evaluación publicados: se desconoce la tasa de éxito real de la política en cualquiera de las 20 tareas del dataset.
- El dataset de entrenamiento es reducido: 198 episodios y 35.267 fotogramas, lo que limita la cobertura de variabilidad de escenas y aumenta el riesgo de sobreajuste.
- Dependencia estricta de la configuración hardware: la política espera exactamente tres cámaras (`agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2`) con imágenes de 3x224x224 y un estado de 9 dimensiones; cualquier discrepancia en nombres, número de cámaras o dimensionalidad romperá la inferencia.
- Está especializada en un robot Franka Panda y en un conjunto cerrado de 20 objetos y tareas; no se declara generalización fuera de ese dominio.
- Las instrucciones de tarea están en inglés y deben coincidir con las cadenas del dataset (`soap dispenser`, `jam`, `jar`, etc.); no hay evidencia de soporte multilingüe.
- Riesgo de alucinación motora: como toda política visuomotora entrenada por imitación, puede producir acciones plausibles pero incorrectas ante objetos, posiciones o iluminación no vistas, con riesgo físico asociado en un robot real.
- Posibles sesgos derivados de la composición del dataset (tipo de objetos, entorno de cocina, condiciones de captura) que no se documentan.
- Sin descargas ni valoraciones en el momento de redactar la ficha: no existe validación independiente por parte de la comunidad.
- La licencia de este repositorio es Apache-2.0, pero no se especifica la licencia del modelo base `lerobot/pi05_base` ni las condiciones de uso derivadas del modelo original de Physical Intelligence; conviene verificar antes de un uso comercial.
- La fecha de creación del repositorio indicada por la plataforma es 2026-09-11, posterior a la fecha habitual de publicación de modelos de esta familia; conviene confirmar la vigencia del artefacto.
- No es un modelo de propósito general: no genera texto, no razona simbólicamente y no soporta herramientas ni agentes conversacionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sam-guided-vlas/train_1_2_pile_random_pose__mask__blur__sim__all_cameras__live__pi05__seed_0__steps_10k
- Dataset de entrenamiento: https://huggingface.co/datasets/sam-guided-vlas/train_1_2_pile_random_pose__mask__blur__sim__all_cameras__live
- Visualizador del dataset (LeRobot Spaces): https://huggingface.co/spaces/lerobot/visualize_dataset?path=sam-guided-vlas/train_1_2_pile_random_pose__mask__blur__sim__all_cameras__live
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Blog de Physical Intelligence sobre π₀.₅: https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI (Physical Intelligence): https://github.com/Physical-Intelligence/openpi
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos CLI de LeRobot: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference

Nota: los resultados de búsqueda web recibidos no contienen información relevante sobre este modelo (remiten a una serie de televisión francesa y a un fabricante de herramientas), por lo que no se han incluido enlaces adicionales procedentes de esa búsqueda.
