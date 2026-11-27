# 08semi/lekiwi_prototype14

## Resumen

`08semi/lekiwi_prototype14` es una política de imitación robótica entrenada con LeRobot mediante el método ACT (Action Chunking with Transformers). No es un modelo de lenguaje: es un controlador visomotor que, a partir del estado articular del robot y dos cámaras (frontal y de muñeca), predice directamente comandos de acción de 9 dimensiones. El modelo lo publica el usuario `08semi` y está orientado al robot móvil manipulador LeKiwi en su variante cliente.

El modelo resuelve el problema clásico de la manipulación robótica por aprendizaje por imitación: en lugar de predecir una sola acción por paso, ACT predice fragmentos de acción (*action chunks*), lo que reduce el error de acumulación y estabiliza la ejecución. Es relevante como ejemplo práctico de un pipeline completo de LeRobot (grabación de datos teleoperados, entrenamiento y despliegue) sobre hardware de bajo coste, aunque su alcance es muy acotado: una única tarea descrita genéricamente y un dataset pequeño.

Con 51,67 millones de parámetros y un repositorio de 0,6 GB, es un modelo ligero que cabe con holgura en GPUs de consumo. Su utilidad real depende enteramente de la tarea concreta del dataset `08semi/dataset_direction`, del que solo se documentan 40 episodios y 6000 fotogramas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con codificador visual y decodificador de acciones con chunking |
| Parametros totales | 51.674.761 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; consume observaciones por paso, no secuencias de texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | no disponible (modelo robótico; no procesa lenguaje natural como salida) |
| Licencia | no disponible (la model card indica «More Information Needed») |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para imitación visomotora que combina un codificador de imágenes (procesa las dos cámaras: `front` a 480x640 y `wrist` a 640x480) con un transformer que fusiona las características visuales y el estado articular (`observation.state`, vector de 9 dimensiones) para predecir un *chunk* de acciones futuras de dimensión 9. La predicción por fragmentos mitiga el problema de *compounding error* típico de los controladores paso a paso y permite movimientos más suaves y coherentes.

El entrenamiento se realizó con LeRobot 0.7.1 sobre el dataset `08semi/dataset_direction`: 40 episodios, 6000 fotogramas a 30 FPS, teleoperados sobre el robot `lekiwi_client`. La configuración reportada es de 7500 pasos, batch de 8, optimizador AdamW, tasa de aprendizaje 1e-5 y semilla 1000. No se documentan aumentos de datos, regularización, número de tokens de entrenamiento ni fases de RLHF/DPO (no aplicables a este tipo de política). La tarea aparece descrita de forma genérica como «My task description», lo que impide conocer el objetivo real del entrenamiento.

## Capacidades

- Control visomotor de un robot LeKiwi a partir de dos cámaras y el estado articular de 9 dimensiones.
- Predicción de *action chunks* de 9 dimensiones para ejecución continua a 30 FPS.
- Aprendizaje por imitación a partir de demostraciones teleoperadas.
- Ejecución de una tarea concreta (no especificada) condicionada al dataset de entrenamiento.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los LLM.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo *thinking*, visión general, audio ni otras capacidades multimodales más allá de las dos cámaras de entrada.

## Casos de uso

- Manipulación de objetos sobre una superficie de trabajo: la política puede recoger y colocar piezas dentro del alcance del robot LeKiwi, usando la cámara de muñeca para el ajuste fino y la frontal para la aproximación gruesa.
- Tareas de clasificación o dirección de objetos: dado el nombre del dataset (`dataset_direction`), es plausible que el modelo esté entrenado para orientar o dirigir objetos; se usaría en una celda de montaje o laboratorio con posiciones controladas.
- Prototipado rápido de políticas robóticas: sirve como plantilla para validar el flujo completo de LeRobot (grabación, entrenamiento con `lerobot-train`, despliegue con `lerobot-rollout`) antes de escalar a datasets mayores.
- Investigación en aprendizaje por imitación: útil como línea base reproducible de ACT sobre un robot de bajo coste para comparar variantes de arquitectura o de aumento de datos.
- Demostraciones educativas: permite ilustrar en un curso o taller cómo un transformer pequeño (51,7 M de parámetros) puede controlar un robot real en tiempo casi real.
- Automatización de tareas repetitivas en entornos de laboratorio: con 40 episodios y 6000 fotogramas, es adecuado para tareas muy acotadas y con poca variabilidad de posiciones, no para entornos abiertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación vacía con la nota «No evaluation results have been provided for this policy yet», por lo que no hay tasas de éxito, ni comparaciones con otras políticas, ni métricas de latencia o *throughput*.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 51,7 M de parámetros en safetensors, los pesos ocupan unos 0,2 GB en FP32; la VRAM total dependerá del *batch* de imágenes (dos cámaras a 480x640 y 640x480) y del *runtime*. En la práctica, cualquier GPU con 4-6 GB es suficiente.
- GPU recomendadas: RTX 3060, RTX 4060, RTX 4090, A100 o H100; el modelo no requiere hardware de gama alta.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna con al menos 4 GB de VRAM; también es viable en CPU para pruebas, aunque con mayor latencia.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base`), que es el flujo documentado por el autor; no se documentan exportaciones a vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de política).
- Latencia y throughput: no disponibles; el control se ejecuta a 30 FPS según el dataset, pero no se reportan tiempos de inferencia medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `08semi/lekiwi_prototype14` (ACT) | 51,7 M | no aplica | sin evaluación publicada | no disponible | Hugging Face, LeRobot |
| Otras políticas ACT en LeRobot Hub | variable | no aplica | variable, según model card | variable | Hugging Face |
| Políticas Diffusion Policy en LeRobot | variable (mayor) | no aplica | habitualmente mayor coste de inferencia | variable | Hugging Face |
| Políticas VLA tipo pi0/OpenVLA | cientos de millones a miles de millones | contexto de instrucciones en lenguaje | requieren hardware mayor | variable | Hugging Face |

No se dispone de datos públicos de rendimiento de este modelo que permitan una comparación cuantitativa con alternativas; la comparación anterior es estructural, no de resultados.

## Limitaciones y advertencias

- Sin evaluación publicada: no hay tasas de éxito ni validación en robot real, por lo que no se puede garantizar su funcionamiento fuera del entorno de entrenamiento.
- Dataset muy pequeño: 40 episodios y 6000 fotogramas implican poca cobertura de posiciones, iluminación y distractores; es probable un sobreajuste a las condiciones de grabación.
- Tarea no documentada: la descripción «My task description» impide saber qué hace exactamente el modelo y en qué condiciones se grabó.
- Licencia no especificada: la model card indica «More Information Needed», por lo que el uso comercial no está autorizado de forma explícita y requiere contactar con el autor.
- Dependencia de hardware concreto: entrenado para `lekiwi_client` con cámaras `front` y `wrist`; los nombres e índices de cámara deben coincidir exactamente con los de entrenamiento.
- Sin capacidades de lenguaje ni generalización a instrucciones: no acepta prompts en lenguaje natural; la tarea es fija.
- Riesgo de alucinación en el sentido de acciones plausibles pero incorrectas: como toda política de imitación, puede producir movimientos inseguros ante observaciones fuera de distribución; se recomienda supervisión y parada de emergencia.
- Sin sesgos lingüísticos aplicables, pero sí sesgo de dominio: el comportamiento está condicionado al entorno físico y al operador que teleoperó los datos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/08semi/lekiwi_prototype14
- Dataset de entrenamiento: https://huggingface.co/datasets/08semi/dataset_direction
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=08semi/dataset_direction
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
