# nadimahmed/groot_mix_act_3

## Resumen

`nadimahmed/groot_mix_act_3` es una política robótica publicada en HuggingFace por el usuario `nadimahmed` dentro del ecosistema LeRobot. La etiqueta de pipeline es `robotics` y la librería declarada es `lerobot`, por lo que se trata de un modelo de control para robots (visión + estado → acciones) y no de un modelo de lenguaje. El repositorio pesa 7,0 GB y el recuento real de pesos en safetensors es de 2.413.522.880 parámetros (unos 2,41 mil millones).

El nombre y las etiquetas del repositorio (`groot`, `robotics`, `lerobot`) apuntan a la familia de políticas GR00T, mientras que la model card documenta el entrenamiento con `--policy.type=act`, es decir, la política ACT (*Action Chunking with Transformers*) de LeRobot. Esta discrepancia no se resuelve en la documentación disponible: la propia model card incluye el aviso automático «Model type not recognized — please update this template», lo que indica que la plantilla no se completó.

La relevancia del modelo es limitada a día de hoy: registra 0 descargas y 0 «likes», no incluye resultados de benchmarks, no describe la composición del dataset de entrenamiento (`nadimahmed/mix_act_3`) y no aporta detalles de arquitectura más allá del comando de entrenamiento. Su interés principal es como ejemplo reproducible de un *pipeline* de entrenamiento de políticas con LeRobot y como punto de partida para *fine-tuning* sobre datos propios, no como modelo validado para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no la especifica; las etiquetas indican `groot` y el comando de entrenamiento documentado usa `policy.type=act`) |
| Parámetros totales | 2.413.522.880 (~2,41 mil millones), según los pesos en safetensors |
| Parámetros activos | no aplica / no disponible (no hay indicios de que sea un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; no se documenta el número de fotogramas u observaciones que consume) |
| Tipos de cuantización | no disponible; no se publican pesos cuantizados ni GGUF |
| Idiomas soportados | no disponible (no aplica como modelo de lenguaje; no se documenta el idioma de las instrucciones) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería de carga: `lerobot`) |
| Tipo de pipeline | robotics |
| Dataset de entrenamiento declarado | `nadimahmed/mix_act_3` |
| Tamaño del repositorio | 7,0 GB |
| Fecha de creación / actualización | 2026-09-23 / 2026-09-23 (según los metadatos del Hub) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información publicada no permite confirmar la arquitectura. Los dos únicos indicios son, por un lado, un recuento de parámetros de ~2,41 mil millones, muy por encima de las políticas ACT habituales de LeRobot (decenas de millones de parámetros), y por otro, el comando de entrenamiento de la model card, que invoca `--policy.type=act`. Es posible que el repositorio contenga una política ACT con un *backbone* sobredimensionado, una política tipo VLA (visión-lenguaje-acción) o una configuración mixta; ninguna de estas hipótesis está confirmada en la documentación.

En cuanto al entrenamiento, la model card se limita a mostrar el flujo estándar de LeRobot: `lerobot-train` con `--dataset.repo_id=${HF_USER}/<dataset>`, `--policy.device=cuda`, `--job_name=lerobot_training`, `--output_dir` y `--wandb.enable=true`, con escritura de checkpoints en `outputs/train/<policy_repo_id>/checkpoints/`. No se indican hiperparámetros (tasa de aprendizaje, *batch size*, número de pasos o épocas), ni el número de tokens, episodios o fotogramas del dataset, ni si hubo etapas de RLHF, DPO o *reward modeling* (poco habituales en políticas de imitación). Tampoco se describen innovaciones técnicas específicas: no hay mención a decodificación especulativa, atención lineal, *action chunking* explícito ni mecanismos de fusión multimodal. La evaluación documentada se realiza con `lerobot-record` sobre un robot `so100_follower` durante 10 episodios, apuntando `--policy.path` al checkpoint.

## Capacidades

- Control robótico: el modelo está etiquetado como política de robótica (`pipeline_tag: robotics`) y está pensado para producir acciones de robot a partir de observaciones, presumiblemente según la formulación ACT documentada en el comando de entrenamiento.
- Ejecución en bucle cerrado: la model card documenta la evaluación con `lerobot-record`, que implica inferencia en línea sobre el robot durante episodios reales.
- Compatibilidad con el ecosistema LeRobot: carga mediante `policy.path`, entrenamiento con `lerobot-train` y registro de métricas en Weights & Biases.
- *Fine-tuning* sobre datos propios: el flujo documentado permite reentrenar desde cero o continuar el entrenamiento sobre otro dataset con `--dataset.repo_id`.
- Generación de texto, razonamiento, código o matemáticas: no disponible; no hay ninguna evidencia en la información proporcionada de que el modelo tenga estas capacidades.
- *Tool calling* / *function calling*: no disponible; no aplica a una política robótica según la documentación publicada.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se documenta ningún mecanismo de planificación o descomposición de tareas.
- Capacidades multilingües: no disponible; no se declaran idiomas en los metadatos del Hub.
- Modo «thinking», visión generalista o audio: no disponible; no hay indicios de tales capacidades más allá de la percepción visual implícita en una política robótica.

## Casos de uso

- Manipulación robótica por imitación en laboratorio: desplegar el checkpoint sobre un brazo `so100_follower` mediante `lerobot-record --policy.path=nadimahmed/groot_mix_act_3` para reproducir tareas aprendidas. Es el uso directamente documentado en la model card.
- *Fine-tuning* sobre un dominio específico: partir de estos pesos y reentrenar con `lerobot-train` sobre un dataset propio de un entorno industrial concreto, aprovechando que la licencia Apache-2.0 permite modificaciones y uso comercial.
- *Baseline* de comparación en investigación: usar el modelo como referencia de partida frente a políticas entrenadas sobre el mismo dataset `nadimahmed/mix_act_3`, midiendo tasa de éxito en episodios controlados.
- Evaluación estandarizada en bucle cerrado: ejecutar el protocolo `lerobot-record ... --episodes=10` con un dataset prefijado por `eval_` para obtener métricas repetibles entre checkpoints.
- Experimentación con mezclas de datos: dado que el dataset asociado se llama `mix_act_3`, el modelo puede servir para estudiar cómo afecta la composición de la mezcla de demostraciones al rendimiento de una política ACT.
- Docencia y formación en robótica de imitación: el repositorio es un ejemplo completo de artefacto entrenado con LeRobot, útil para ilustrar el ciclo entrenamiento → checkpoint → evaluación sobre hardware real o simulado.
- Integración en *pipelines* con trazabilidad: el uso de `--wandb.enable=true` facilita incorporar el entrenamiento y la evaluación a flujos de experimentación con registro de métricas, útil en equipos que ya trabajan con W&B.
- Transferencia sim-to-real: si el modelo procede de demostraciones mixtas (reales y/o simuladas), podría emplearse como punto de partida para validar la transferencia a un robot físico, aunque esto no está confirmado por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas de tasa de éxito, LIBERO, Meta-World, RMSE de acciones ni ninguna otra métrica, y la búsqueda web realizada no devolvió resultados relacionados con el modelo (los resultados obtenidos tratan sobre formularios aduaneros japoneses y momentos de inercia, y no guardan relación con esta ficha).

## Requisitos de hardware

- VRAM estimada solo para pesos, a partir del recuento de 2.413.522.880 parámetros: ~4,8 GB en bf16/fp16, ~9,7 GB en fp32 y ~2,4 GB en int8. Son estimaciones aritméticas, no medidas publicadas.
- VRAM con *overhead* de inferencia: se estima un consumo adicional de 2-4 GB por activaciones, *buffers* de imagen y contexto de política, lo que situaría el despliegue en bf16 en torno a 6-9 GB. Estimación, no dato del autor.
- GPU recomendadas: no disponibles en la documentación. Por tamaño de pesos, una NVIDIA RTX 4090 o RTX 3090 (24 GB) debería ser suficiente con holgura; también una RTX 4080/4070 Ti (16 GB) o una GPU de 12 GB en bf16 según la estimación anterior.
- Cabe en GPU de consumo: probablemente sí, en modelos con 8-12 GB o más de VRAM si se usa bf16 y un *batch* pequeño, aunque el fabricante no publica requisitos.
- Opciones de despliegue: LeRobot (`lerobot-train`, `lerobot-record`) sobre PyTorch; vLLM, TGI, llama.cpp y Ollama no aplican porque no hay pesos GGUF ni un modelo de lenguaje subyacente publicado.
- Latencia y *throughput*: no disponibles. No se reportan mediciones de frecuencia de control, tiempo por *step* ni episodios por minuto.
- Nota sobre el tamaño del repositorio: 7,0 GB es inferior al peso teórico en fp32 (~9,7 GB) y superior al de bf16 (~4,8 GB), lo que sugiere pesos en precisión reducida más ficheros auxiliares (configuración, normalización, *checkpoints* intermedios). No confirmado por el autor.

## Comparativa con modelos similares

Los valores de las alternativas provienen de la documentación pública de cada proyecto y no han podido verificarse con la información de esta búsqueda; se marcan como orientativos. No se dispone de datos de rendimiento comparables para `groot_mix_act_3`.

| Modelo | Parámetros | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|
| `nadimahmed/groot_mix_act_3` | ~2,41 mil millones | Política robótica (etiqueta `groot`, comando documentado `policy.type=act`); arquitectura no confirmada | Apache-2.0 | safetensors en HuggingFace, 0 descargas |
| Política ACT de LeRobot (referencia de la librería) | del orden de decenas de millones (según configuración) | *Action Chunking with Transformers*, imitación | Apache-2.0 (librería) | Código y configuraciones en el repositorio LeRobot |
| GR00T N1 (NVIDIA) | ~2,2 mil millones | VLA con *backbone* de visión-lenguaje y cabecera de difusión | Licencia de modelo abierto de NVIDIA (condiciones específicas) | Pesos y código publicados por NVIDIA |
| pi0 / openpi | ~3,3 mil millones | VLA basado en PaliGemma con experto de acciones | Apache-2.0 en el código de openpi (condiciones de pesos: consultar) | Pesos y recetas publicados por Physical Intelligence |

Diferencias clave frente a las alternativas: el modelo de esta ficha no aporta documentación de arquitectura, dataset ni métricas, por lo que no puede compararse en rendimiento con ninguna de ellas. Su principal desventaja es la ausencia de validación pública (0 descargas, 0 likes, sin benchmarks); su ventaja potencial es que la licencia Apache-2.0 permite uso comercial sin las restricciones adicionales que aplican a otros modelos de la categoría.

## Limitaciones y advertencias

- Documentación incompleta: la model card conserva el texto de plantilla «Model type not recognized — please update this template» y no describe arquitectura, datos de entrenamiento, hiperparámetros ni métricas.
- Ambigüedad de identidad: el nombre y la etiqueta `groot` pueden confundirse con la familia GR00T de NVIDIA, mientras que el comando documentado usa la política ACT. No debe asumirse equivalencia con GR00T.
- Sin validación pública: 0 descargas y 0 likes en el momento de redactar esta ficha; no hay evidencia externa de que el modelo funcione en hardware real.
- Riesgo de sobreajuste al entorno de demostración: al no conocerse la composición de `nadimahmed/mix_act_3`, no puede estimarse la generalización a otras cámaras, iluminaciones, objetos o robots distintos del `so100_follower` empleado en el ejemplo.
- Fecha de creación anómala: los metadatos indican 2026-09-23, posterior a la fecha habitual de publicación; conviene verificar la vigencia y el estado del repositorio antes de usarlo.
- Sesgos: no disponibles. En robótica de imitación, los sesgos proceden de las demostraciones humanas (sesgo de operador, de posición de cámara y de distribución de objetos), pero no hay información del dataset para evaluarlos.
- Alucinación: el concepto no aplica de forma directa, pero sí existe el riesgo equivalente de generar acciones fuera de distribución que provoquen movimientos inseguros en un robot real; se recomienda evaluar primero en simulación y con límites de par y velocidad.
- Restricciones de licencia: Apache-2.0 permite uso comercial, modificación y redistribución con atribución y conservación del aviso de licencia. No se declaran restricciones adicionales, pero la licencia no cubre posibles derechos sobre el dataset de entrenamiento.
- Idiomas y contexto: no se declara ningún idioma ni ventana de contexto; no debe asumirse soporte de instrucciones en lenguaje natural.
- Producción: sin benchmarks, sin métricas de latencia y sin versionado documentado, el modelo no es apto para despliegue en producción sin una validación propia previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nadimahmed/groot_mix_act_3
- Dataset declarado: https://huggingface.co/datasets/nadimahmed/mix_act_3
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy

Nota: la búsqueda web realizada no devolvió ningún enlace relevante sobre este modelo (los resultados obtenidos versan sobre sistemas aduaneros japoneses y momentos de inercia). No se dispone de *paper*, blog técnico, demo ni repositorio adicional asociado a `nadimahmed/groot_mix_act_3`.
