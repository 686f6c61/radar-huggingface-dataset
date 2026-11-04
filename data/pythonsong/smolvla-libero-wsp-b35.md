# pythonsong/smolvla-libero-wsp-B35

## Resumen

SmolVLA-LIBERO + weight-space edit (B35) es un checkpoint de robótica derivado de `lerobot/smolvla_libero`, publicado por el usuario `pythonsong`. No es un modelo entrenado desde cero ni un fine-tuning convencional: es el resultado de modificar un único parámetro del modelo base, concretamente el sesgo `model.action_out_proj.bias[0]`, sumándole 0,35 unidades de acción normalizadas (de 0,033 a 0,383). Este cambio desplaza la acción en el eje x para que la pinza se cierre antes, sin ningún paso de entrenamiento adicional.

El modelo base es SmolVLA, un vision-language-action (VLA) compacto presentado en el paper arXiv:2506.01844, diseñado para ejecutar políticas de manipulación robótica en hardware de consumo. La edición se distribuye como un parche de aproximadamente 600 bytes (`edit_B35/`) junto con el checkpoint completo parcheado, y se apoya en la librería LeRobot de Hugging Face para entrenamiento, evaluación e inferencia.

La relevancia de esta ficha es metodológica: demuestra que una intervención de un solo escalar en el espacio de pesos puede mejorar de forma medible una métrica de éxito en una tarea concreta. En la evaluación reportada por el autor sobre `libero_spatial` (episodio #8, 100 episodios), el modelo base obtiene 42/100 (42 %) y este checkpoint 64/100 (64 %), con un p-valor de Fisher de 0,003. Es un resultado de un único escenario, no una validación general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en SmolVLA; detalles internos no disponibles en la informacion proporcionada |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo orientado a acciones robóticas, no a texto general) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria lerobot) |

## Arquitectura y entrenamiento

El checkpoint hereda la arquitectura de SmolVLA, un modelo vision-language-action compacto que combina percepción visual, comprensión de instrucciones en lenguaje natural y generación de acciones motoras, y que según el paper asociado está pensado para desplegarse en hardware de consumo con costes computacionales reducidos. La información proporcionada no detalla la composición interna (número de capas, dimensión oculta, mecanismo de atención, encoder visual) ni el dataset de preentrenamiento del modelo base.

El aspecto técnico diferencial de este repositorio no es el entrenamiento sino la edición en el espacio de pesos (weight-space editing). El autor parte de `lerobot/smolvla_libero` y aplica un único cambio: `model.action_out_proj.bias[0] += 0.35`, pasando el sesgo de 0,033 a 0,383 en unidades de acción normalizadas. Este sesgo pertenece a la proyección de salida de acciones y su primer componente corresponde al eje x, de modo que el incremento provoca un cierre de pinza más temprano. No hay RLHF, DPO, fine-tuning ni datos adicionales: el parche es de unos 600 bytes y el repositorio contiene el checkpoint completo ya parcheado.

## Capacidades

- Generación de acciones robóticas de manipulación a partir de observaciones visuales e instrucciones, en el marco de políticas LeRobot.
- Control de pinza y trayectorias en tareas de manipulación tipo LIBERO, con un sesgo calibrado para adelantar el cierre en el eje x.
- Ejecución de políticas sobre robots compatibles con LeRobot (la model card cita `so100_follower` como ejemplo de evaluación).
- Integración con el ecosistema LeRobot para entrenamiento (`lerobot-train`) y evaluación/inferencia (`lerobot-record`).
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento textual general ni multilingüismo; el pipeline declarado es `robotics`.

## Casos de uso

- Evaluación de manipulación en LIBERO: usar el checkpoint como política de referencia en el escenario `libero_spatial` para reproducir el resultado reportado (64/100) y compararlo con el base (42/100).
- Investigación en edición de pesos: emplear el parche `edit_B35/` como caso de estudio reproducible de cómo un único escalar en la capa de salida altera el comportamiento motor.
- Ablación de sesgos de acción: variar el incremento (0,1, 0,2, 0,35) sobre el mismo checkpoint para trazar la curva de éxito frente al sesgo en el eje x.
- Prototipado de agarre en robots de bajo coste: desplegar la política en un `so100_follower` mediante `lerobot-record` para probar el cierre temprano de pinza en entornos controlados.
- Docencia en robótica con VLA: ilustrar el flujo completo de LeRobot (carga de checkpoint, ejecución de episodios, registro de éxito) con un modelo de 450 M de parámetros y 0,9 GB de repositorio.
- Base para calibración específica de hardware: partir de este checkpoint y ajustar el sesgo para compensar latencias o desalineaciones de una pinza concreta antes de un fine-tuning completo.

## Benchmarks y rendimiento

| Escenario | Modelo | Episodios | Exito | Significacion |
|---|---|---|---|---|
| libero_spatial #8 | SmolVLA original | 100 | 42/100 (42 %) | referencia |
| libero_spatial #8 | Este modelo (B35) | 100 | 64/100 (64 %) | Fisher p = 0,003 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, lo cual es esperable en un modelo de robótica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 450 M de parámetros en precisión completa el peso ronda los 1,8 GB, y en fp16/bf16 aproximadamente 0,9 GB, más el encoder visual y los buffers de activación.
- GPU recomendadas: no especificadas por el autor; SmolVLA se presenta como desplegable en hardware de consumo, por lo que una GPU consumer con suficiente memoria debería bastar.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño del repositorio (0,9 GB) y el enfoque del modelo base, aunque no hay cifras oficiales en la información proporcionada.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), más el stack de Hugging Face; no se documentan vLLM, llama.cpp, Ollama ni TGI para este pipeline.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento libero_spatial #8 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pythonsong/smolvla-libero-wsp-B35 | 450.046.176 | no disponible | 64/100 | apache-2.0 | Hugging Face |
| lerobot/smolvla_libero | no disponible | no disponible | 42/100 | no disponible en esta ficha | Hugging Face |
| SmolVLA (paper arXiv:2506.01844) | compacto, cifra exacta no disponible | no disponible | no disponible | no disponible | paper |

No se dispone de datos de otros VLA comparables (por ejemplo, políticas ACT o Diffusion Policy) en la información proporcionada para establecer una comparación cuantitativa adicional.

## Limitaciones y advertencias

- El resultado de mejora (42 % a 64 %) corresponde a un único escenario (`libero_spatial`, episodio #8) con 100 episodios; no hay evidencia de generalización a otras tareas, entornos o robots.
- La edición es un ajuste manual de un sesgo, no un aprendizaje: puede degradar el rendimiento en tareas donde el cierre temprano de pinza sea contraproducente.
- Riesgo de sobreajuste al hardware y a la configuración experimental del autor; el desplazamiento de 0,35 en unidades normalizadas depende de la escala de acciones del dataset original.
- No se documentan sesgos, comportamiento multilingüe ni evaluación de alucinación en el sentido textual, al tratarse de un modelo de acciones.
- Licencia apache-2.0 permite uso comercial, pero el modelo base y sus dependencias deben verificarse por separado.
- Repositorio con 0 descargas y 1 like en el momento del registro: no hay validación independiente de los resultados reportados.
- Uso previsto en robótica real conlleva riesgos físicos; requiere supervisión y protocolos de parada de emergencia en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pythonsong/smolvla-libero-wsp-B35
- Modelo base: https://huggingface.co/lerobot/smolvla_libero
- Paper SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
