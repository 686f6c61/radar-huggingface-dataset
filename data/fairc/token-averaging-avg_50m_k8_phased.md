# FAIRC/token-averaging-avg_50m_k8_phased

## Resumen

El repositorio `FAIRC/token-averaging-avg_50m_k8_phased` contiene un volcado de checkpoint del proyecto de investigación "token averaging" desarrollado por el grupo FAIRC. Se trata de un modelo transformer de aproximadamente 50 millones de parámetros (50 897 408 según la configuración) entrenado con una técnica experimental de promediado de tokens (k=8) que aún no está documentada en detalle. El checkpoint se publica como material de referencia para reproducir experimentos, no como un modelo listo para producción.

El interés de este repositorio radica en que permite a la comunidad investigadora acceder a los pesos intermedios y finales de un entrenamiento con una arquitectura modificada (promediado de tokens) y comparar su comportamiento con otras variantes del mismo proyecto (k=4, k=4 con posiciones aprendibles). No incluye pesos en formato Hugging Face `transformers`, sino un `state_dict` de PyTorch que requiere reconstruir la arquitectura a partir del `config.json` incluido. La ventana de contexto es de 1024 tokens y el entrenamiento se planificó para 8 144 000 000 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder con promediado de tokens (token averaging, k=8) |
| Parametros totales | 50 897 408 (aprox.) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (checkpoint en precisión original, probablemente fp32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Checkpoint PyTorch (`state_dict`), no safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura es un transformer estándar con `d_model=512`, 8 capas, 8 cabezas de atención y `tie_embeddings=true`. La innovación principal es el "token averaging": el nombre del proyecto y el parámetro `averaging_k=8` sugieren que el modelo promedia representaciones de tokens adyacentes (posiblemente para reducir la longitud efectiva de la secuencia o para inducir regularización), aunque la documentación no explica el mecanismo exacto. El entrenamiento se realizó con una tasa de aprendizaje de 0.0002, 2000 pasos de warmup y un objetivo de 8 144 000 000 tokens. No se proporcionan detalles sobre la composición del dataset, ni sobre el uso de RLHF o DPO. El checkpoint incluye el paso de entrenamiento, el número de tokens vistos y el FLOPs acumulado, lo que permite reproducir la trayectoria de entrenamiento.

## Capacidades

- No se han documentado capacidades específicas del modelo en la model card.
- Dado su tamaño (50M) y arquitectura transformer, podría realizar generación de texto básica, pero no hay evidencia publicada de ello.
- No se indica soporte para tool calling, agentes, visión, audio ni modos de razonamiento especiales.
- El modelo es un artefacto de investigación; no se ha evaluado su comportamiento en tareas estándar (MMLU, HumanEval, etc.).
- Las capacidades multilingües son desconocidas; no se especifican idiomas de entrenamiento.

## Casos de uso

- Reproducción de experimentos de investigación: el checkpoint permite a otros investigadores cargar el `state_dict` y reproducir los resultados del entrenamiento con promediado de tokens, comparando curvas de pérdida y comportamiento.
- Estudio del efecto del promediado de tokens: se puede analizar cómo afecta la técnica (k=8) a la calidad de las representaciones internas frente a variantes con k=4 o sin promediado.
- Análisis de dinámicas de entrenamiento: los logs de pérdida (`loss_log_30%.csv`) y los checkpoints intermedios (paso 50 000) permiten estudiar la evolución del entrenamiento, la convergencia y el efecto del warmup.
- Desarrollo de nuevas técnicas de compresión de contexto: el promediado de tokens podría inspirar métodos para reducir el coste computacional en modelos más grandes, y este checkpoint sirve como banco de pruebas.
- Benchmarking de arquitecturas alternativas: se puede comparar este modelo con otros transformers del mismo tamaño (p. ej., modelos de 50M estándar) para medir el impacto del promediado en tareas de lenguaje.
- Educación y docencia: como ejemplo de un pipeline de entrenamiento experimental con checkpoints versionados, útil para cursos de aprendizaje automático.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye evaluaciones en tareas estándar como MMLU, HumanEval o GLUE, ni comparaciones con otros modelos.

## Requisitos de hardware

- Con ~50M de parámetros, el checkpoint en fp32 ocupa aproximadamente 200 MB (el repositorio pesa 1.8 GB por incluir múltiples checkpoints y logs).
- Inferencia en CPU es viable: un transformer de 50M puede ejecutarse en un portátil moderno sin GPU, aunque con latencia mayor.
- Cualquier GPU con al menos 2 GB de VRAM puede cargar el modelo en fp32; en fp16 bastaría con 1 GB.
- GPU recomendadas: cualquier GPU consumer (RTX 2060 o superior) o incluso integrada para pruebas pequeñas.
- No es un modelo optimizado para despliegue; no se proporcionan configuraciones para vLLM, llama.cpp, Ollama o TGI.
- Para entrenamiento o fine-tuning, se necesitaría una GPU con al menos 8 GB de VRAM (p. ej., RTX 3070, A10) para manejar el batch y los gradientes.

## Comparativa con modelos similares

No se dispone de resultados de rendimiento para comparar con otros modelos. Dentro del mismo proyecto de token averaging, existen otros checkpoints publicados:

| Modelo | Parámetros | Contexto | Técnica | Estado |
|---|---|---|---|---|
| `token-averaging-avg_50m_k8_phased` (este) | ~50M | 1024 | token averaging k=8, phased | Checkpoint de investigación |
| `token-averaging-avg_50m_k4` | ~50M | 1024 | token averaging k=4 | Checkpoint de investigación |
| `token-averaging-avg_50m_k4_learnable_pos` | ~50M | 1024 | token averaging k=4 con posiciones aprendibles | Checkpoint de investigación |

No se han publicado comparativas con modelos estándar de 50M (p. ej., GPT-2 pequeño, OPT-125M) ni con otros modelos de investigación similares.

## Limitaciones y advertencias

- El modelo es un checkpoint de investigación sin licencia especificada; no se puede garantizar su uso comercial sin autorización del autor.
- No ha sido evaluado para sesgos, toxicidad o seguridad; no debe usarse en aplicaciones orientadas al usuario final sin una auditoría exhaustiva.
- La técnica de token averaging no está documentada; su efecto sobre la calidad del lenguaje es desconocido y podría degradar la coherencia.
- El formato de pesos no es compatible con `transformers`; requiere reconstruir la arquitectura manualmente, lo que puede introducir errores si la configuración no se replica exactamente.
- La ventana de contexto de 1024 tokens es limitada para tareas de razonamiento de largo alcance.
- No hay información sobre el dataset de entrenamiento; se desconoce si incluye datos multilingües o dominios específicos.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un artefacto reciente sin validación externa.

## Enlaces

- Repositorio principal: https://huggingface.co/FAIRC/token-averaging-avg_50m_k8_phased
- Variante k=4: https://huggingface.co/FAIRC/token-averaging-avg_50m_k4
- Variante k=4 con posiciones aprendibles: https://huggingface.co/FAIRC/token-averaging-avg_50m_k4_learnable_pos
