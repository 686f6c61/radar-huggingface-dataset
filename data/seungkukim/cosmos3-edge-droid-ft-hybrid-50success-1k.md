# seungkukim/cosmos3-edge-droid-ft-hybrid-50success-1k

## Resumen

Cosmos3-Edge-Policy-DROID es un modelo de política robótica (vision-language-action, VLA) desarrollado por NVIDIA dentro del marco Cosmos3, especializado en ejecutar tareas de manipulación a partir de observaciones visuales e instrucciones en lenguaje natural. Este repositorio concreto es un ajuste fino (post-entrenamiento) del checkpoint oficial `nvidia/Cosmos3-Edge-Policy-DROID` realizado por el usuario seungkukim, que adapta la política base al entorno de simulación MolmoSpaces mediante un conjunto de datos generado con la técnica DAgger híbrida.

El modelo resuelve el problema de control robótico de extremo a extremo: recibe imágenes de una muñeca y dos cámaras exteriores, junto con la posición de las articulaciones y del gripper, y predice secuencias de acciones (32 pasos de posición articular absoluta más una fila de estado). Con 3.369.657.024 parámetros y un tamaño de repositorio de 7,7 GB en safetensors, es un modelo de tamaño medio-alto pensado para inferencia en servidores con GPU, no para dispositivos empotrados.

Su relevancia radica en que demuestra un flujo de trabajo reproducible de ajuste fino sobre una política VLA abierta: el autor publica el conjunto de datos, el parche de entrenamiento y el checkpoint intermedio (paso 1000) con pesos EMA, lo que permite a otros investigadores replicar o extender el proceso en entornos simulados de manipulación robótica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal vision-language-action (Cosmos3 Omni) con módulos MoE de generación (`moe_gen`), codificador VAE Wan2.2 y cabezas de acción (`action2llm`, `llm2action`) |
| Parametros totales | 3.369.657.024 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (ventana de observación: 33 fotogramas de vídeo + estado; 32 acciones por consulta) |
| Tipos de cuantizacion | no disponible (entrenamiento e inferencia en bf16) |
| Idiomas soportados | no disponible (las instrucciones se procesan como descripción de tarea en JSON mediante el procesador propio de la política) |
| Licencia | NVIDIA OpenMDW-1.1 (etiquetada como `license: other` en el Hub) |
| Formato de pesos | safetensors (incluye torre de visión y procesador empaquetados) |

## Arquitectura y entrenamiento

El modelo parte de `nvidia/Cosmos3-Edge-Policy-DROID` (revisión `a74e848c`) y conserva su arquitectura VLA: un codificador visual basado en VAE Wan2.2 (compilado con AOT) que convierte los fotogramas en latentes, un backbone transformer con módulos de mezcla de expertos para generación (`moe_gen`), y cabezas específicas que proyectan entre el espacio latente del LLM y el espacio de acciones (`action2llm`, `llm2action`, `action_modality_embed`). La modalidad de tarea es `wam`: fragmentos de 32 pasos de posición articular absoluta más una fila de estado, con 33 fotogramas de vídeo como contexto.

El ajuste fino se realizó sobre el conjunto `seungkukim/MolmoSpaces-PyRUA-Lean-Edge-DAgger-50success`: 200 episodios (todos exitosos), 33.954 fotogramas a 15 fps, con vistas de muñeca y dos exteriores a 640x360, 7 posiciones articulares y gripper. Los datos se generaron con DAgger híbrida, donde el experto PyRUA-Lean y el aprendiz Cosmos3-Edge comparten el control; el 65% de los fotogramas (22.062) son pasos del experto y la pérdida de acción se enmascara solo a esos pasos, mientras todos los fotogramas sirven como contexto visual. El entrenamiento usó 2x H200 durante 2h04m, batch global 64, AdamW con lr 1e-4, warm-up de 100 pasos y decaimiento coseno hasta el paso 1000, precisión bf16 con FSDP, grad clip 0.1 y EMA de potencia con sigma_rel 0.1 (los pesos exportados son los EMA). Se aplicó aumento de datos con recorte aleatorio al 95% y ColorJitter, y pesos de pérdida de 10 para visión y 10 para acción.

## Capacidades

- Predicción de acciones robóticas de manipulación: genera 32 acciones por consulta en forma de posiciones articulares absolutas (7 articulaciones) más gripper (0..1), sin normalización adicional.
- Percepción visual multi-cámara: procesa una vista de muñeca y dos vistas exteriores concatenadas en un formato de 480p (muñeca arriba, exteriores abajo).
- Condicionamiento por instrucción en lenguaje natural: acepta una descripción de tarea formateada como JSON mediante el procesador propio de la política.
- Integración de estado propioceptivo: incorpora la posición articular y del gripper como entrada junto a las imágenes.
- Control de política en bucle cerrado: pensado para servir como servidor de acciones (`action_policy_server_robolab`) consumido por un cliente robótico.
- Aprendizaje por imitación con DAgger: el checkpoint incorpora correcciones del experto en los estados visitados por el aprendiz.
- No se documentan capacidades de tool calling, agentes multi-paso, visión general, audio ni modo de razonamiento explícito; el modelo está especializado en control robótico.

## Casos de uso

- Manipulación robótica en simulación MolmoSpaces: el modelo se usa como política de control en el mismo entorno donde se generaron los datos, recibiendo observaciones multi-cámara y devolviendo secuencias de acciones articulares; es adecuado porque el ajuste fino se realizó específicamente sobre rollouts de ese simulador.
- Investigación en aprendizaje por imitación con DAgger: sirve como punto de partida para estudiar cómo las correcciones del experto (pasos marcados con `action.is_expert = 1`) afectan a la política aprendida, comparándolo con el checkpoint entrenado solo con datos del experto (`cosmos3-edge-droid-ft-pyrualean-50success-1k`).
- Evaluación de políticas VLA en entornos simulados: al publicarse el dataset, el parche y el checkpoint intermedio, permite reproducir experimentos y medir la tasa de éxito en tareas de manipulación con 50 episodios por tarea.
- Desarrollo de servidores de inferencia robótica: el comando `action_policy_server_robolab` levanta un servidor en el puerto 8000 que un cliente puede consultar con las claves de observación documentadas, útil para integrar la política en un stack de robótica existente.
- Ajuste fino sobre nuevos entornos: el recetario (configuración resuelta, pesos EMA, módulos entrenados) sirve de plantilla para adaptar la política base a otros conjuntos de datos en formato Cosmos3-DROID.
- Benchmarking de políticas de manipulación: permite comparar el rendimiento de un post-entrenamiento híbrido frente a la política base y frente a variantes entrenadas con datos exclusivamente del experto, usando las mismas métricas de éxito por tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni métricas de tasa de éxito por tarea; solo se documenta que el conjunto de datos contiene 200 episodios exitosos y 0 fallidos, y que el entrenamiento se detuvo en el paso 1000.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 3.369.657.024 parámetros en bf16, los pesos ocupan aproximadamente 6,7 GB, a lo que hay que sumar el codificador VAE Wan2.2, la torre de visión y las activaciones de 33 fotogramas de contexto; se recomienda al menos 24-40 GB de VRAM para un funcionamiento holgado.
- GPU recomendadas: el entrenamiento se realizó en 2x H200; para inferencia se esperan GPU de centro de datos como H100, H200 o A100 de 80 GB.
- ¿Cabe en GPU de consumo? No hay datos confirmados. Por tamaño de pesos podría caber en una RTX 4090 (24 GB) en bf16, pero la memoria de activaciones del contexto visual y del VAE no está documentada.
- Opciones de despliegue: el propio marco `cosmos-framework` mediante `python -m cosmos_framework.scripts.action_policy_server_robolab` con `--checkpoint_path`, `--port 8000`, `--format-prompt-as-json True` y `--guidance-interval 960 1001`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cosmos3-edge-droid-ft-hybrid-50success-1k (este) | 3.369.657.024 | no disponible | Post-entrenamiento DAgger híbrida sobre MolmoSpaces, 1000 pasos | OpenMDW-1.1 | Hugging Face (seungkukim) |
| nvidia/Cosmos3-Edge-Policy-DROID | no disponible en la información | no disponible | Política base de NVIDIA para DROID | OpenMDW-1.1 | Hugging Face (nvidia) |
| seungkukim/cosmos3-edge-droid-ft-pyrualean-50success-1k | no disponible en la información | no disponible | Misma receta sobre datos solo del experto PyRUA-Lean | OpenMDW-1.1 | Hugging Face (seungkukim) |

No se dispone de datos de benchmarks ni de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está ajustado para el entorno MolmoSpaces con un formato de observación concreto (vista de muñeca y dos exteriores, 7 articulaciones, gripper 0..1); no es un modelo de propósito general.
- Dependencia del formato: las observaciones deben usar exactamente las claves `observation/wrist_image_left`, `observation/exterior_image_1_left`, `observation/exterior_image_2_left`, `observation/joint_position`, `observation/gripper_position` y `prompt`; cualquier desviación puede degradar el comportamiento.
- Riesgo de sobreajuste al simulador: al entrenarse solo con 200 episodios de un simulador, el rendimiento en el mundo real o en otros robots no está validado.
- Sesgos: no se documentan sesgos conocidos, pero al derivar de un modelo base de NVIDIA y de un dataset sintético, puede heredar sesgos de la política original y de la distribución de tareas del simulador.
- Alucinación: no aplica en el sentido de generación de texto, pero la política puede producir acciones no válidas o inseguras fuera de la distribución de estados visitados.
- Licencia: OpenMDW-1.1 (etiquetada como `license: other`); es necesario revisar los términos de NVIDIA OpenMDW-1.1 antes de un uso comercial, ya que pueden existir restricciones adicionales.
- Idiomas: no se documenta soporte multilingüe; las instrucciones se procesan como descripción de tarea en JSON con el procesador propio de la política.
- Checkpoint intermedio: es el paso 1000 de un entrenamiento más largo (checkpoints cada 500), por lo que no representa necesariamente el mejor punto de convergencia.
- Sin métricas de éxito publicadas: no hay evidencia cuantitativa del rendimiento final en tareas, lo que limita su uso en producción sin una evaluación previa.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/seungkukim/cosmos3-edge-droid-ft-hybrid-50success-1k)
- [Modelo base nvidia/Cosmos3-Edge-Policy-DROID](https://huggingface.co/nvidia/Cosmos3-Edge-Policy-DROID)
- [Dataset seungkukim/MolmoSpaces-PyRUA-Lean-Edge-DAgger-50success](https://huggingface.co/datasets/seungkukim/MolmoSpaces-PyRUA-Lean-Edge-DAgger-50success)
- [Variante entrenada solo con datos del experto](https://huggingface.co/seungkukim/cosmos3-edge-droid-ft-pyrualean-50success-1k)
