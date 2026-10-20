# MISLab-MiiSLab/ACT_grasp_fan_le004_isaacsim

## Resumen

ACT_grasp_fan_le004_isaacsim es una política de imitación robótica basada en ACT (Action Chunking with Transformers), no un modelo de lenguaje. La desarrolla MISLab-MiiSLab y se distribuye con la librería LeRobot; predice trozos cortos de acción en lugar de pasos individuales a partir de dos imágenes de 256x256 (muñeca y profundidad) y un vector de estado de 7 dimensiones. El modelo tiene 51.670.663 parámetros y un repositorio de 0,2 GB en safetensors.

Está entrenado para una tarea concreta: recoger un ventilador por el asa con el robot RS_M90E7A_Left. El dataset Le-004 contiene 47 episodios y 5.555 fotogramas a 60 FPS. Es relevante para quien quiera reproducir o evaluar una política ACT de LeRobot en manipulación visuomotora con profundidad, pero no ofrece razonamiento lingüístico, tool calling ni capacidades generales.

La model card no publica resultados de evaluación en robot real ni detalles sobre el uso de simulación, pese a que el identificador incluye “isaacsim”. La licencia es Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de imitación visuomotora |
| Parámetros totales | 51.670.663 |
| Parámetros activos | No aplica; no es un modelo MoE |
| Longitud de contexto | No aplica; no es un modelo de lenguaje. Entrada fija: dos imágenes de 256x256 y estado de 7 dimensiones |
| Tipos de cuantización | No disponible; no se documentan variantes cuantizadas |
| Idiomas soportados | No aplica; no procesa lenguaje natural |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tipo de modelo | Política de imitación robótica para control de acciones |
| Robot | RS_M90E7A_Left |
| Cámaras | wrist, depth |
| Entradas | observation.images.wrist (3, 256, 256); observation.state (7,); observation.images.depth (3, 256, 256) |
| Salidas | action (7,) |
| Dataset de entrenamiento | MISLab-MiiSLab/Le-004; 47 episodios; 5.555 fotogramas; 60 FPS; tarea “pick up the fan by its handle” |
| Pipeline | robotics |
| Tamaño del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice secuencias cortas de acciones, conocidas como action chunks, mediante un transformer. La model card no detalla la composición interna de la red, el número de capas, la dimensión oculta ni si se emplea una CVAE; esos datos no están disponibles. La innovación principal del método es la predicción por bloques de acción, que busca reducir el error compuesto frente a políticas que predicen un único paso.

El entrenamiento se realizó con 47 episodios y 5.555 fotogramas del dataset Le-004, a 60 FPS, para la tarea “pick up the fan by its handle”. La configuración indica 100.000 pasos, tamaño de lote 8, optimizador AdamW, tasa de aprendizaje 1e-05, semilla 1000 y LeRobot 0.6.2. No se especifica el número de tokens, la composición completa del dataset, el uso de RLHF/DPO ni el procedimiento exacto de aumento de datos. Tampoco se confirma si el entrenamiento se realizó en Isaac Sim, aunque el identificador del modelo incluye “isaacsim”.

## Capacidades

- Control visuomotor para la tarea concreta “pick up the fan by its handle”.
- Procesamiento conjunto de imagen de muñeca e imagen de profundidad, ambas de 3x256x256.
- Consumo de un vector de estado de 7 dimensiones y producción de un vector de acción de 7 dimensiones.
- Predicción de action chunks, orientada a secuencias cortas de movimiento.
- Ejecución en bucle cerrado sobre el robot RS_M90E7A_Left si las cámaras y el espacio de acciones coinciden.
- No soporta generación de texto, razonamiento, código, matemáticas, visión general, audio, tool calling, function calling, agentes multi-paso ni multilingüismo.
- No dispone de modo “thinking” ni de capacidades conversacionales.
- No hay evidencia publicada de generalización a otras tareas, objetos o robots.

## Casos de uso

- Recogida del ventilador por el asa en el robot RS_M90E7A_Left: la política consume las imágenes de muñeca y profundidad y emite acciones de 7 dimensiones para ejecutar la tarea entrenada. Es adecuada únicamente si el montaje físico, las cámaras y el objeto coinciden con los del dataset.
- Reproducción de experimentos de LeRobot: permite cargar la política con `lerobot-rollout`, usar el dataset Le-004 y comparar el comportamiento de una política ACT entrenada con 47 episodios frente a otras configuraciones.
- Línea base para investigación en imitation learning: sirve como referencia para evaluar variantes de ACT, cambios en el número de episodios o modificaciones en la configuración de entrenamiento.
- Prototipos de manipulación con cámara de profundidad en laboratorio: útil para estudiar el uso conjunto de RGB y depth en una tarea de agarre, siempre dentro de un entorno controlado.
- Análisis de fallos y ajuste fino: al ser un modelo pequeño y con licencia Apache 2.0, puede reentrenarse o adaptarse con más episodios para estudiar sobreajuste, robustez a posiciones del objeto y variaciones de iluminación.
- Docencia y formación técnica: permite ilustrar el flujo completo de LeRobot, desde la grabación de datos y el entrenamiento hasta el despliegue de una política ACT en un robot real o simulado.
- Evaluación de requisitos de integración: sirve para medir latencia, frecuencia de control y estabilidad del bucle cerrado en una plataforma concreta, aunque el autor no publica esas métricas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

| Benchmark | Resultado |
|---|---|
| MMLU, HumanEval, GSM8K | No aplica; no es un modelo de lenguaje |
| Tasa de éxito en robot real | No disponible |
| Métricas en simulación | No disponible |
| Comparación cuantitativa con otras políticas | No disponible |

## Requisitos de hardware

- Pesos: 51,67 millones de parámetros. Si se almacenan en FP32, ocupan aproximadamente 207 MB; en FP16/BF16, unos 103 MB; en INT8, unos 52 MB. No se especifica el dtype real ni se publican cuantizaciones.
- VRAM orientativa para inferencia: 1-2 GB con lote 1 y dos imágenes de 256x256, incluyendo pesos y activaciones. Es una estimación prudente, no un dato confirmado por el autor.
- GPU recomendadas: cualquier GPU CUDA con al menos 2 GB libres. Una RTX 3050, RTX 4060, RTX 4090, A100 o H100 son suficientes para la inferencia, pero no se dispone de latencias medidas.
- GPU de consumo: sí, previsiblemente cabe en GPU de consumo. También puede ejecutarse en CPU, aunque la latencia no está documentada.
- Despliegue: LeRobot mediante `lerobot-rollout` y PyTorch. vLLM, llama.cpp, Ollama y TGI no son aplicables a este tipo de política.
- Entrenamiento: `lerobot-train` con `--policy.type=act` y `--policy.device=cuda`; la configuración publicada usa 100.000 pasos y lote 8.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de una comparación cuantitativa con alternativas. La siguiente tabla resume la información disponible y marca como no disponible aquello que el autor no publica.

| Modelo | Parámetros | Contexto o entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT_grasp_fan_le004_isaacsim | 51.670.663 | Dos imágenes 256x256 y estado de 7 dimensiones | No disponible | Apache 2.0 | Hugging Face |
| Otra política ACT de LeRobot | No disponible | No disponible | No disponible | Varía según el repositorio | LeRobot Hub |
| Diffusion Policy (familia) | No disponible | No disponible | No disponible | Varía según la implementación | Repositorios públicos |
| VQ-BeT (familia) | No disponible | No disponible | No disponible | Varía según la implementación | Repositorios públicos |

## Limitaciones y advertencias

- El dataset es pequeño: 47 episodios y 5.555 fotogramas. Esto limita la generalización y aumenta el riesgo de sobreajuste a posiciones, iluminación y condiciones concretas.
- La política está entrenada para una única tarea y un único tipo de robot. No hay evidencia de que funcione con otros objetos, otras cámaras u otro espacio de acciones.
- Requiere exactamente las entradas declaradas: imagen de muñeca, imagen de profundidad y estado de 7 dimensiones. Si los nombres, resoluciones o cámaras no coinciden, la integración fallará.
- No se han publicado resultados de evaluación en robot real. Se desconoce la tasa de éxito y el comportamiento ante perturbaciones.
- El identificador incluye “isaacsim”, pero la model card no confirma si el entrenamiento fue en simulación. Si existe componente simulado, debe verificarse la brecha simulación-real.
- El dataset se
