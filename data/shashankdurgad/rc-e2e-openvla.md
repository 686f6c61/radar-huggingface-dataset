# shashankdurgad/rc-e2e-openvla

## Resumen

OpenVLA 7B es un modelo vision-lenguaje-acción (VLA) de código abierto desarrollado por un equipo conjunto de Stanford, UC Berkeley, Google DeepMind y Toyota Research Institute. Su función es recibir una instrucción en lenguaje natural junto con una imagen de la cámara del robot y predecir directamente acciones motoras de 7 grados de libertad (desplazamientos del efector final en x, y, z, roll, pitch, yaw y apertura del gripper). Resuelve el problema de controlar robots manipuladores mediante instrucciones en lenguaje natural sin necesidad de diseñar políticas específicas por tarea.

El modelo se construye sobre el VLM `prism-dinosiglip-224px`, que combina un backbone visual doble (DINOv2 ViT-L/14 y SigLIP ViT-So400M/14) con un modelo de lenguaje Llama-2 de 7B. Con 7.541.237.184 parámetros totales y un repositorio de 15,1 GB en safetensors, se distribuye bajo licencia MIT, lo que permite uso comercial y modificación sin restricciones.

Es relevante porque fue uno de los primeros VLA completamente abiertos (pesos, código de entrenamiento y datos de referencia) capaces de controlar múltiples robots de forma zero-shot dentro de la mezcla de preentrenamiento y de adaptarse a nuevos dominios mediante fine-tuning con pocas demostraciones. Esta ficha describe la variante alojada en `shashankdurgad/rc-e2e-openvla`, que replica el checkpoint OpenVLA 7B original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA): VLM con backbone visual dual (DINOv2 ViT-L/14 + SigLIP ViT-So400M/14) y LLM Llama-2 7B |
| Parametros totales | 7.541.237.184 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (la model card solo documenta carga en bfloat16) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

OpenVLA es un transformer multimodal que fusiona dos codificadores visuales complementarios (DINOv2 ViT-L/14 y SigLIP ViT-So400M/14) con un LLM Llama-2 de 7B. La imagen de la cámara y la instrucción textual se tokenizan y se introducen en el LLM, que genera tokens de acción discretizados correspondientes a los deltas de 7-DoF del efector final. Las acciones se normalizan por robot y por dataset, y deben desnormalizarse con las estadísticas correspondientes (`unnorm_key`) antes de ejecutarlas en el robot real.

El preentrenamiento se realizó sobre 970.000 episodios de manipulación robótica procedentes del dataset Open X-Embodiment, una mezcla de múltiples datasets y morfologías de robot. La model card no detalla el número exacto de tokens de entrenamiento ni si se aplicaron fases de RLHF o DPO. La innovación principal es la formulación directa de imagen + lenguaje a acción sin un módulo de planificación separado, junto con la posibilidad de fine-tuning eficiente en parámetros para nuevos dominios robóticos. El código de entrenamiento y fine-tuning está disponible en el repositorio oficial de OpenVLA.

## Capacidades

- Generación de acciones robóticas de 7-DoF (x, y, z, roll, pitch, yaw, gripper) a partir de una instrucción y una imagen de cámara.
- Control zero-shot de robots y dominios representados en la mezcla de preentrenamiento Open X-Embodiment (por ejemplo, BridgeV2 con robot Widow-X).
- Adaptación mediante fine-tuning (incluido fine-tuning eficiente en parámetros) a nuevas tareas y configuraciones de robot con pocas demostraciones.
- Comprensión de instrucciones en lenguaje natural en inglés para especificar la tarea de manipulación.
- Procesamiento multimodal imagen-texto para extracción de características y razonamiento visual orientado a acción.
- Integración con el ecosistema transformers mediante `AutoModelForVision2Seq` y `AutoProcessor`.
- Soporte de Flash Attention 2 para inferencia acelerada en bfloat16.

## Casos de uso

- Manipulación robótica zero-shot en laboratorio: usar el modelo para controlar un robot Widow-X en entornos BridgeV2 sin entrenamiento adicional, prediciendo acciones directamente desde la cámara y una instrucción como "coge el cubo rojo".
- Fine-tuning para una nueva celda de trabajo: recoger un conjunto pequeño de demostraciones teleoperadas en el robot objetivo y ajustar el modelo con el script `finetune.py` del repositorio para adaptar la política al nuevo setup.
- Investigación en aprendizaje por imitación: emplear el checkpoint como línea base reproducible para comparar nuevas políticas VLA, gracias a la licencia MIT y a la disponibilidad de código y datos de referencia.
- Prototipado de asistentes de manipulación en almacén: integrar el modelo en un pipeline que reciba imágenes de una cámara fija y órdenes de picking, generando deltas de efector final que un controlador de bajo nivel ejecuta.
- Evaluación de generalización entre morfologías: probar el modelo en distintos robots incluidos en Open X-Embodiment para estudiar la transferencia de políticas y la sensibilidad a la normalización de acciones.
- Educación y demos de robótica: desplegar el modelo en entornos simulados o de laboratorio para ilustrar el funcionamiento de un VLA, con la ventaja de que los pesos son abiertos y el coste de licencia es nulo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 15-16 GB en bfloat16 para los 7.541.237.184 parámetros, más el overhead del procesador y de las imágenes de entrada.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 6000 Ada para inferencia cómoda; una RTX 4090 (24 GB) es suficiente para cargar el modelo en bfloat16.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 (24 GB). En GPUs de 16 GB sería necesario recurrir a cuantización, para la que la model card no documenta recetas específicas.
- Opciones de despliegue: transformers con `AutoModelForVision2Seq` y `trust_remote_code=True`, Flash Attention 2 opcional. No se documenta soporte oficial para vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenVLA 7B (esta ficha) | 7.541.237.184 | No disponible | VLA (imagen + texto a acciones) | MIT | Pesos y código abiertos |
| RT-2 (Google DeepMind) | No disponible | No disponible | VLA | Propietaria | No público |
| Octo | No disponible | No disponible | Política robótica transformer | No disponible en la información | Pesos abiertos (no verificado) |

La comparación con RT-2 y Octo se incluye por categoría funcional; los datos concretos de parámetros, contexto y licencia de esos modelos no están disponibles en la información proporcionada y no se han verificado aquí.

## Limitaciones y advertencias

- No generaliza zero-shot a morfologías de robot o setups no representados en la mezcla de preentrenamiento Open X-Embodiment; en esos casos es necesario fine-tuning con demostraciones.
- Las acciones predichas están normalizadas por robot y dataset; deben desnormalizarse con las estadísticas correctas (`unnorm_key`) antes de ejecutarlas, lo que introduce riesgo de error de configuración.
- Solo soporta inglés como idioma de instrucciones.
- Riesgo de alucinación de acciones o de interpretaciones erróneas de la escena visual, especialmente fuera de la distribución de entrenamiento.
- No se documentan sesgos específicos en la model card, pero al entrenarse sobre un conjunto limitado de robots y entornos, puede heredar sesgos de esos datasets.
- La licencia MIT permite uso comercial sin restricciones, pero no se ofrecen garantías sobre seguridad física en entornos reales; el despliegue en robots requiere capas de seguridad adicionales.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta; es una réplica de un checkpoint conocido y no una versión oficial mantenida por el equipo OpenVLA.
- La longitud de contexto no está documentada, lo que dificulta planificar tareas de horizonte largo con historial extenso.

## Enlaces

- Hugging Face: https://huggingface.co/shashankdurgad/rc-e2e-openvla
- Paper: https://arxiv.org/abs/2406.09246
- Repositorio de código: https://github.com/openvla/openvla
- Página del proyecto: https://openvla.github.io/
- Dataset Open X-Embodiment: https://robotics-transformer-x.github.io/
- VLM base Prismatic: https://github.com/TRI-ML/prismatic-vlms
- Script de fine-tuning: https://github.com/openvla/openvla/blob/main/scripts/finetune.py
- Entornos BridgeV2: https://rail-berkeley.github.io/bridgedata/
