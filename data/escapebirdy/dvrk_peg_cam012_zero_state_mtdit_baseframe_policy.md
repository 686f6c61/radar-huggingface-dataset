# escapebirdy/dvrk_peg_cam012_zero_state_mtdit_baseframe_policy

## Resumen

`dvrk_peg_cam012_zero_state_mtdit_baseframe_policy` es una política robótica de imitación (imitation learning) publicada por el usuario `escapebirdy` en Hugging Face bajo la librería LeRobot. Se trata de un modelo de tipo `multi_task_dit` (Multi-Task Diffusion Transformer) entrenado para una tarea concreta de manipulación robótica: el agarre y manipulación de una clavija (peg) con el sistema quirúrgico da Vinci Research Kit (dVRK), empleando las cámaras 0, 1 y 2 y un esquema de "zero state" con marco de referencia base.

El modelo no es un modelo de lenguaje ni un modelo generativo de propósito general: es una política de control (policy) que mapea observaciones (imágenes de cámara y estado del robot) a acciones motoras. Con 277.207.818 parámetros (unos 277 millones) y un tamaño de repositorio de 1,1 GB en formato safetensors, se sitúa en el rango de las políticas robóticas de tamaño medio, entrenadas específicamente sobre el dataset `escapebirdy/dvrk_peg_cam012_baseframe`.

Su relevancia es acotada pero clara para la comunidad de robótica quirúrgica y de aprendizaje por imitación: proporciona un checkpoint reproducible bajo licencia Apache-2.0 para experimentar con políticas basadas en Diffusion Transformer en tareas de manipulación fina con el dVRK. La model card es mínima y no documenta arquitectura detallada, datos de entrenamiento ni resultados de evaluación, por lo que gran parte de las especificaciones deben marcarse como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Multi-Task Diffusion Transformer (multi_task_dit), según el nombre del modelo y la etiqueta `multi_task_dit`; detalles internos no disponibles |
| Parámetros totales | 277.207.818 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (no aplica como modelo de lenguaje; es una política de control) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

La información disponible indica que el modelo es de tipo `multi_task_dit`, lo que sugiere una arquitectura basada en Diffusion Transformer (DiT) adaptada a múltiples tareas, integrada en el ecosistema LeRobot. El nombre del checkpoint (`zero_state_mtdit_baseframe_policy`) apunta a un esquema de observación con estado cero y un marco de referencia base, y el sufijo `cam012` indica el uso de tres cámaras (0, 1 y 2). No se dispone de detalles sobre el número de capas, dimensión de los embeddings, mecanismo de difusión (DDPM, DDIM, flow matching) ni sobre el esquema exacto de condicionamiento de acciones.

El entrenamiento se realizó sobre el dataset `escapebirdy/dvrk_peg_cam012_baseframe`, presumiblemente compuesto por demostraciones teleoperadas de la tarea de manipulación de clavija con el dVRK. No se documenta el número de episodios, el número de tokens o frames, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras optimizaciones posteriores. Tampoco se describen innovaciones técnicas específicas más allá de la propia elección de una arquitectura DiT multi-tarea.

## Capacidades

- Generación de acciones motoras para control robótico a partir de observaciones visuales (cámaras 0, 1 y 2) y estado del robot.
- Ejecución de una tarea de manipulación concreta: agarre y manipulación de una clavija (peg) en el entorno dVRK.
- Política multi-tarea según la designación `multi_task_dit`, aunque no se detallan las tareas concretas cubiertas.
- Integración con el ecosistema LeRobot para entrenamiento, evaluación e inferencia.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No se documentan modos especiales como thinking mode, visión general, audio u otras capacidades.

## Casos de uso

- Investigación en aprendizaje por imitación para robótica quirúrgica: el checkpoint sirve como punto de partida reproducible para estudiar políticas DiT en tareas de manipulación fina con el dVRK, comparando con políticas ACT u otras disponibles en LeRobot.
- Reproducción de experimentos de agarre de clavija: al estar entrenado sobre el dataset `dvrk_peg_cam012_baseframe`, permite reproducir y evaluar la tarea de peg transfer, un ejercicio estándar en formación quirúrgica.
- Evaluación de políticas multi-cámara: el uso de tres cámaras (cam012) permite estudiar cómo la fusión de vistas mejora la precisión en manipulación, comparando con configuraciones de una o dos cámaras.
- Benchmarking de arquitecturas DiT frente a ACT: sirve como referencia para comparar el rendimiento de Diffusion Transformer frente a Action Chunking Transformer en las mismas condiciones de dataset.
- Desarrollo de pipelines de evaluación con LeRobot: el modelo puede desplegarse con `lerobot-record` sobre un robot `so100_follower` u otro compatible para recoger episodios de evaluación y medir tasas de éxito.
- Base para fine-tuning en tareas relacionadas: al estar bajo Apache-2.0, puede adaptarse a variantes de la tarea (distintos objetos, posiciones o cámaras) mediante reentrenamiento sobre nuevos datasets.
- Docencia y formación en robótica: útil como ejemplo práctico de entrenamiento de políticas con LeRobot en un entorno quirúrgico simulado o real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 277 millones de parámetros en precisión FP32, los pesos ocupan aproximadamente 1,1 GB; en FP16, unos 0,55 GB, y en cuantizaciones de 8 bits, alrededor de 0,28 GB. A ello hay que sumar la memoria de activaciones y buffers de las cámaras, no cuantificada en la información disponible.
- GPU recomendadas: no disponible. Por tamaño, cabría en GPUs de consumo como RTX 3060, RTX 4060 o superiores, pero no se confirma en la documentación.
- ¿Cabe en consumer GPU? Probablemente sí por tamaño de pesos, pero no se documenta oficialmente.
- Opciones de despliegue: LeRobot (`lerobot-record`, `lerobot-train`) según la model card. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `escapebirdy/dvrk_peg_cam012_zero_state_mtdit_baseframe_policy` | 277.207.818 | no aplica | no disponible | Apache-2.0 | Hugging Face (LeRobot) |
| Políticas ACT de LeRobot (referencia genérica) | no disponible | no aplica | no disponible | Apache-2.0 (típicamente) | Hugging Face (LeRobot) |
| Políticas Diffusion Policy (referencia genérica) | no disponible | no aplica | no disponible | no disponible | Hugging Face |

No se dispone de datos de benchmarks ni de comparaciones publicadas que permitan una comparativa cuantitativa fiable con alternativas concretas.

## Limitaciones y advertencias

- La model card es mínima y no documenta arquitectura, datos de entrenamiento, métricas ni procedimiento de evaluación; la reproducibilidad es limitada.
- El modelo está entrenado para una tarea y un entorno muy específicos (dVRK, peg, cámaras 0-2, marco base); su generalización a otras tareas, robots o configuraciones de cámara no está documentada.
- Riesgo de sobreajuste al dataset de entrenamiento y de fallo ante variaciones de iluminación, posición de objetos o calibración de cámaras.
- No se han documentado sesgos, pero al ser una política robótica los sesgos relevantes serían de distribución (entorno de laboratorio concreto) más que sociales.
- Riesgo de alucinación no aplica en el sentido de modelos de lenguaje, pero sí existe riesgo de acciones erráticas o no seguras en manipulación física.
- Licencia Apache-2.0 permite uso comercial, pero el uso en entornos quirúrgicos reales requiere validación clínica y regulatoria independiente; el modelo no está certificado para uso médico.
- Sin resultados de benchmarks ni tasas de éxito publicadas, no es posible evaluar su rendimiento frente a alternativas.
- El número de descargas y likes es cero en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/escapebirdy/dvrk_peg_cam012_zero_state_mtdit_baseframe_policy
- Dataset de entrenamiento: https://huggingface.co/datasets/escapebirdy/dvrk_peg_cam012_baseframe
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
