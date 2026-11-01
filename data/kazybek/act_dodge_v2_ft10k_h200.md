# Kazybek/act_dodge_v2_ft10k_h200

## Resumen

`Kazybek/act_dodge_v2_ft10k_h200` es una política de robótica entrenada con el método ACT (Action Chunking with Transformers), publicado en el paper arXiv:2304.13705, y empaquetada con la librería LeRobot de Hugging Face. No es un modelo de lenguaje: es un modelo de imitación que mapea observaciones multimodales (estado articular de 14 dimensiones más tres cámaras RGB de 480x640) a un vector de acción de 14 dimensiones, es decir, las consignas de un robot bimanual de tipo `bi_metal_follower`. El autor es el usuario de Hugging Face Kazybek, en el contexto de los proyectos MakerMods y MakerModsLab.

El modelo resuelve una tarea muy concreta de evitación reactiva: el robot debe esquivar los puños de un operador humano cuando estos se acercan a su pinza. Se ha entrenado sobre el dataset `Kazybek/dodge_bomba_merged`, compuesto por 28 episodios de teleoperación y 48.257 fotogramas a 30 FPS, durante 10.000 pasos con batch de 16 y learning rate de 1e-5. El checkpoint tiene 51.613.326 parámetros (unos 51,6 millones) y un repositorio de 2,5 GB, lo que refleja el peso de los pesos en formato safetensors junto con los artefactos de entrenamiento.

Su relevancia es acotada pero clara: es un ejemplo reproducible de cómo LeRobot permite publicar políticas de imitación de extremo a extremo para hardware de bajo coste, con licencia Apache 2.0 y un pipeline de despliegue basado en CLI (`lerobot-rollout`). No compite con modelos fundacionales de robótica ni con LLM; su valor está en la trazabilidad del entrenamiento y en servir como referencia para quien quiera replicar el flujo ACT sobre un robot bimanual propio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones con chunking |
| Parametros totales | 51.613.326 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; consume observaciones por paso, no secuencias de texto) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin variantes cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; las tareas se especifican en inglés en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que, en lugar de predecir una única acción por paso, predice un chunk de acciones futuras de corta duración. La arquitectura combina un backbone transformer con atención sobre las observaciones (tres imágenes RGB de 480x640 y un vector de estado de 14 dimensiones) y un decodificador que emite el chunk de acciones de 14 dimensiones. El chunking mitiga el problema de la varianza en la predicción paso a paso y suele traducirse en tasas de éxito más altas en tareas de manipulación teleoperadas. El modelo tiene 51,6 millones de parámetros, un tamaño coherente con una política ACT de este tipo, no con un transformer generativo de gran escala.

El entrenamiento se realizó con LeRobot 0.6.2 sobre 28 episodios y 48.257 fotogramas a 30 FPS del dataset `Kazybek/dodge_bomba_merged`, con cuatro variantes de instrucción de tarea en inglés ("dodge my fists when they become close to the claw", "Avoid my punches towards the respective claw", "avoid the fists", "avoid my punches"). La configuración reportada es de 10.000 pasos, batch de 16, optimizador AdamW, learning rate de 1e-5 y semilla 1000. No se documenta en la model card el uso de RLHF, DPO ni ninguna fase de ajuste por preferencias; se trata de imitación supervisada pura sobre demostraciones. Tampoco se detalla la composición exacta del dataset más allá del número de episodios, fotogramas y tareas.

## Capacidades

- Predicción de chunks de acción de 14 dimensiones para un robot bimanual `bi_metal_follower`.
- Fusión de tres vistas de cámara (`left_top`, `left_left`, `left_right`) con el estado articular de 14 dimensiones.
- Ejecución de políticas de evitación reactiva: esquivar puños humanos que se aproximan a la pinza.
- Despliegue mediante la CLI de LeRobot (`lerobot-rollout`) con estrategia `base` y duración configurable.
- Entrenamiento reproducible con `lerobot-train` usando `--policy.type=act`.
- Soporte de integración con Weights & Biases durante el entrenamiento (`--wandb.enable=true`).
- No dispone de tool calling, function calling, razonamiento multi-paso, capacidades multilingües ni modos de pensamiento: no es un modelo de lenguaje.

## Casos de uso

- Evitación reactiva en entornos colaborativos: el robot esquiva los puños del operador cuando se acercan a la pinza, lo que sirve como capa de seguridad en células de trabajo compartidas entre humano y robot.
- Investigación en aprendizaje por imitación: el checkpoint y el dataset asociado permiten reproducir el pipeline ACT completo, desde la grabación de teleoperación hasta el despliegue, con hiperparámetros documentados.
- Base para fine-tuning sobre hardware similar: al compartir el tipo de robot `bi_metal_follower` y el esquema de observaciones de tres cámaras, puede reutilizarse como inicialización para tareas de manipulación bimanual relacionadas.
- Docencia y formación en robótica de bajo coste: el proyecto MakerMods y la licencia Apache 2.0 facilitan su uso en cursos y talleres sin restricciones comerciales.
- Validación de infraestructura LeRobot: sirve para probar el flujo `lerobot-rollout` con cámaras OpenCV a 640x480 y 30 FPS antes de entrenar políticas propias.
- Benchmark interno de políticas ACT: con 51,6 M de parámetros y 10.000 pasos de entrenamiento, es una referencia útil para comparar configuraciones alternativas (batch, learning rate, número de episodios) en tareas de evitación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación con la plantilla vacía y la nota explícita de que no se han proporcionado resultados para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 51,6 M de parámetros en safetensors, los pesos ocupan del orden de 200 MB en precisión de 32 bits; el grueso de la memoria lo consumen las activaciones de las tres cámaras a 480x640 y el buffer de inferencia.
- GPU recomendadas: no especificadas por el autor. El comando de entrenamiento documentado usa `--policy.device=cuda`, por lo que se asume una GPU NVIDIA con soporte CUDA; una RTX 3060 o superior debería bastar para inferencia, aunque no hay cifras publicadas.
- Cabe en GPU de consumo: sí, por tamaño de parámetros; la model card no confirma modelos concretos ni requisitos mínimos.
- Opciones de despliegue: LeRobot (`lerobot-rollout`) es la vía documentada. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles. El control opera a 30 FPS según la tasa del dataset, pero no se publican mediciones de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto / observaciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kazybek/act_dodge_v2_ft10k_h200 | 51,6 M | ACT (LeRobot) | 3 camaras 480x640 + estado (14,) | Apache 2.0 | Hugging Face |
| Otras politicas ACT en LeRobot Hub | no disponible | ACT | variable segun robot | variable | Hugging Face |
| Otros metodos de imitacion (p. ej. Diffusion Policy) | no disponible | diffusion policy | variable | variable | Hugging Face / repos |

No se dispone de datos de benchmarks ni de una comparativa cuantitativa con alternativas concretas en la informacion proporcionada. La comparación relevante es metodológica: ACT frente a otros enfoques de imitación (por ejemplo, Diffusion Policy) dentro del ecosistema LeRobot, pero no hay cifras publicadas para este checkpoint que permitan establecer diferencias de rendimiento.

## Limitaciones y advertencias

- No hay resultados de evaluación en robot real: la model card indica explícitamente que no se han proporcionado resultados, por lo que la tasa de éxito es desconocida.
- Dataset muy pequeño: 28 episodios y 48.257 fotogramas limitan la generalización; el modelo probablemente se ajusta a las condiciones de iluminación, posiciones y operador de la grabación.
- Tarea restringida: está entrenado para evitar puños cerca de la pinza, no para manipulación general ni navegación.
- Dependencia del hardware: requiere un robot `bi_metal_follower` y tres cámaras con los nombres `left_top`, `left_left`, `left_right`; un cambio de montaje o de calibración puede degradar el comportamiento.
- Riesgo de sobreajuste y de movimientos erráticos fuera de distribución; no se documentan mecanismos de seguridad adicionales.
- Idiomas: las instrucciones de tarea están en inglés y no hay soporte multilingüe declarado.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene auditar el dataset asociado antes de reutilizarlo en producción.
- Sin cuantizaciones publicadas ni métricas de latencia: la planificación de despliegue en tiempo real debe medirse empíricamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kazybek/act_dodge_v2_ft10k_h200
- Dataset de entrenamiento: https://huggingface.co/datasets/Kazybek/dodge_bomba_merged
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Kazybek/dodge_bomba_merged
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
