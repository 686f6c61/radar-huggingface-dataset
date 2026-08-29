# Aikwed/pistar06_insert_carrot_hil_success_only

## Resumen
El modelo `Aikwed/pistar06_insert_carrot_hil_success_only` es una política de robótica entrenada con la librería LeRobot para ejecutar la tarea de inserción de una zanahoria en un agujero. Está publicado en Hugging Face por el usuario Aikwed y forma parte de la familia de políticas `pistar06`, que se inspira en el enfoque de aprendizaje por refuerzo con intervención humana (human-in-the-loop) descrito en el paper "PiStar: A VLA that Learns from Experience". El sufijo `hil_success_only` sugiere que el entrenamiento se realizó únicamente con episodios de éxito obtenidos mediante intervención humana, aunque no se detalla el proceso exacto en la model card.

El modelo tiene aproximadamente 1.147 millones de parámetros (1,1B) y se distribuye en formato safetensors. La licencia es Apache 2.0, lo que permite uso comercial y modificación. Aunque el nombre hace referencia a "pistar06", no se confirma si se trata de un modelo de la familia Pi0.5 o Pi0.6; la documentación disponible indica que es una política de acción (policy) entrenada con LeRobot, probablemente del tipo ACT (Action Chunking Transformer) según el comando de entrenamiento mostrado en la model card. No se proporcionan detalles sobre arquitectura, contexto, idiomas o benchmarks en la información pública.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer) inferido del comando de entrenamiento; no confirmado oficialmente |
| Parametros totales | 1.147.607.163 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin procesamiento de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
La model card no describe la arquitectura interna. El comando de entrenamiento incluido en la documentación de LeRobot utiliza `--policy.type=act`, lo que sugiere que la política se basa en el modelo ACT (Action Chunking Transformer), una arquitectura que predice secuencias de acciones (chunks) a partir de observaciones visuales y de estado. ACT combina un codificador de visión (como ResNet) con un transformador para generar acciones motoras de forma autoregresiva.

El entrenamiento se realizó con el dataset `Aikwed/insert_carrot_into_the_hole_hil_success_only`, que contiene episodios de éxito de la tarea de inserción. El término "hil" (human-in-the-loop) indica que los datos provienen de demostraciones o intervenciones humanas, aunque no se especifica si se aplicó RLHF, DPO o algún mecanismo de recompensa adicional. No hay información sobre el número de tokens, composición del dataset o innovaciones técnicas específicas más allá de lo indicado en la documentación genérica de LeRobot.

## Capacidades
- Ejecución de tareas de manipulación robótica, específicamente inserción de una zanahoria en un agujero.
- Control de un brazo robótico (posiblemente SO-100 u otro compatible con LeRobot) a partir de observaciones visuales y proprioceptivas.
- Generación de secuencias de acciones (chunks) para movimientos suaves y coordinados.
- Integración con el ecosistema LeRobot para entrenamiento, evaluación y despliegue en robots reales.
- No se reportan capacidades de razonamiento, tool calling, agentes, visión general o multilingüismo, ya que es un modelo puramente motor.

## Casos de uso
- Automatización de ensamblaje industrial: el modelo puede integrarse en celdas robóticas para tareas de inserción de piezas, reduciendo el tiempo de ciclo y mejorando la precisión.
- Robótica de laboratorio: útil para experimentos de manipulación fina donde se requiere repetibilidad y aprendizaje a partir de demostraciones humanas.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar políticas condicionadas por intervenciones humanas (HIL) y su transferencia a nuevas tareas.
- Prototipado rápido en entornos de investigación: gracias a la integración con LeRobot, se puede desplegar en robots de bajo coste como SO-100 para validar algoritmos de control.
- Benchmarking de políticas de acción: permite comparar el rendimiento de diferentes arquitecturas (ACT, Diffusion Policy, etc.) en una tarea estándar de inserción.
- Entrenamiento de políticas con datos de éxito selectivo: el sufijo `success_only` indica que se puede usar para estudiar el impacto de filtrar episodios fallidos en el aprendizaje.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de éxito, precisión o métricas de rendimiento en la model card ni en el repositorio.

## Requisitos de hardware
- VRAM estimada: con 1,1B parámetros, una inferencia en fp16 requiere aproximadamente 2,3 GB de memoria (1,1B × 2 bytes). En fp32 sería ~4,6 GB. Sin embargo, el modelo se usa junto con un robot físico y un pipeline de visión, por lo que la memoria total depende del sistema.
- GPU recomendada: una GPU con al menos 6 GB de VRAM (por ejemplo, RTX 2060, RTX 3060) puede ser suficiente para inferencia en fp16. Para entrenamiento, se recomienda una GPU con 12 GB o más (RTX 3080, RTX 4090, A10, A100).
- Compatibilidad con consumer GPU: sí, el modelo es lo suficientemente pequeño para ejecutarse en GPUs de consumo, siempre que se utilice una cuantización adecuada (aunque no se proporcionan versiones cuantizadas).
- Opciones de despliegue: LeRobot soporta inferencia local con PyTorch y también se puede usar con frameworks como vLLM o llama.cpp, aunque estos últimos son menos habituales para modelos de robótica. El flujo recomendado es mediante `lerobot-record` para evaluación en robots reales.
- Latencia y throughput: no se especifican, pero al tratarse de un modelo de ~1B parámetros, se espera una inferencia en tiempo real (menos de 50 ms por paso) en GPUs modernas.

## Comparativa con modelos similares
No se dispone de información sobre modelos comparables en la misma categoría (políticas de robótica para inserción). El propio ecosistema LeRobot incluye políticas como ACT, Diffusion Policy y VQ-BeT, pero no hay datos públicos de rendimiento de este modelo frente a ellos. Se puede mencionar que el modelo `Aikwed/pistar06_insert_carrot_into_the_hole_acp_r1` es una variante con Advantage-Conditioned Policy (ACP) del mismo autor, pero no se proporcionan métricas comparativas.

## Limitaciones y advertencias
- La model card es muy escueta y no detalla el proceso de entrenamiento, los hiperparámetros ni la arquitectura exacta. Esto dificulta la reproducibilidad.
- No se han publicado evaluaciones en entornos reales ni simulados, por lo que se desconoce la tasa de éxito real de la tarea.
- El modelo está especializado en una única tarea (inserción de zanahoria) y no es generalizable a otras tareas sin fine-tuning adicional.
- Al ser un modelo de robótica, no maneja lenguaje natural ni interacción multimodal más allá de las observaciones visuales y de estado.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar que el dataset de entrenamiento (Aikwed/insert_carrot_into_the_hole_hil_success_only) no tenga restricciones adicionales, ya que la licencia del dataset no se indica en la model card.
- No se especifican sesgos o riesgos de alucinación, pero en robótica el riesgo principal es la ejecución de movimientos inseguros si no se valida adecuadamente en un entorno controlado.
- El nombre "pistar06" podría inducir a error: según la búsqueda web, este no es un modelo de valor Pi 0.6, sino una política de acción, por lo que no debe confundirse con modelos VLA generales.

## Enlaces
- [Modelo en Hugging Face](https://huggingface.co/Aikwed/pistar06_insert_carrot_hil_success_only)
- [Dataset usado](https://huggingface.co/datasets/Aikwed/insert_carrot_into_the_hole_hil_success_only)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Repositorio de PiStar en GitHub](https://github.com/0xRazorLeaf/pistar)
- [Paper de PiStar (PDF)](https://www.pi.website/download/pistar06.pdf)
- [Blog de PiStar](https://www.pi.website/blog/pistar06)
