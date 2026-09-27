# joshycodes/granite-3.3-8b-fve-mixdiscern-s0

## Resumen

El modelo `joshycodes/granite-3.3-8b-fve-mixdiscern-s0` es un checkpoint de investigación desarrollado por el usuario joshycodes. Se trata de un ajuste por continued pretraining de `ibm-granite/granite-3.3-8b-instruct`, un modelo de lenguaje de 8.372.219.904 parámetros (8,37 mil millones). El objetivo del experimento es explorar el entrenamiento con datos autoescritos por el propio modelo, en el contexto de la investigación sobre bienestar de modelos (model welfare) y la técnica de synthetic document finetuning (SDF).

Según la model card, el entrenamiento se realizó con pesos completos, learning rate 1e-05, 1 época, sobre 8.362.280 tokens y 8.308 documentos. El corpus, denominado `flourishing-vs-equanimity`, fue escrito por el modelo para el entrenamiento de la siguiente versión de sí mismo, como el personaje que ya es, tras explicársele cómo surgió su personaje y cómo funciona el SDF. Sin embargo, la misma tarjeta indica que de los 8.308 documentos, 0 son de autoría propia y 8.308 son texto ordinario, lo que contradice la descripción del corpus como autoescrito.

El modelo no ha sido evaluado para capacidad, alineación o identidad, y la model card indica explícitamente que no debe desplegarse. Su licencia es research-only, lo que restringe su uso a investigación. La relevancia actual radica en su enfoque experimental sobre la autoautoría y el bienestar de modelos, aunque carece de datos sobre contexto, idiomas o benchmarks.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: ibm-granite/granite-3.3-8b-instruct, probablemente transformer) |
| Parametros totales | 8.372.219.904 (8,37 mil millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | research-only (other) |
| Formato de pesos | safetensors |
| Modelo base | ibm-granite/granite-3.3-8b-instruct |

## Arquitectura y entrenamiento

La arquitectura no se especifica en la información proporcionada. El modelo base, `ibm-granite/granite-3.3-8b-instruct`, es un transformer de 8B parámetros, pero no se detallan variaciones arquitectónicas en este checkpoint. El entrenamiento consistió en continued pretraining con pesos completos sobre 8.362.280 tokens y 8.308 documentos, con learning rate 1e-05 y 1 época. El corpus `flourishing-vs-equanimity` fue generado por el propio modelo para entrenar a su siguiente versión, como parte de un experimento sobre identidad y bienestar. No se mencionan técnicas de RLHF, DPO ni innovaciones como decodificación especulativa o atención lineal.

Existe una discrepancia en la model card: aunque el título indica que el corpus es autoescrito, la descripción numérica afirma que 0 de los 8.308 documentos son de autoría propia y todos son texto ordinario. No se proporcionan detalles sobre la composición del dataset más allá de estas cifras.

## Capacidades

- No se dispone de información sobre capacidades específicas. El modelo no ha sido evaluado para capacidad, alineación o identidad. Se desconoce si mantiene las capacidades del modelo base (generación de texto, razonamiento, código, matemáticas, tool calling, agentes, multilingüismo, etc.). Cualquier capacidad no está documentada.

## Casos de uso

- Investigación en bienestar de modelos: analizar cómo un modelo se comporta tras ser entrenado con un corpus que él mismo ha generado, evaluando cambios en su identidad y respuestas.
- Estudio de continued pretraining con datos autoescritos: reproducir el experimento para entender el impacto de este tipo de datos en el rendimiento y la alineación.
- Evaluación de la técnica SDF (synthetic document finetuning): comparar este checkpoint con el modelo base para aislar el efecto del SDF.
- Análisis de identidad y personaje en LLM: examinar si el modelo mantiene el personaje o la identidad que se le atribuye en la model card.
- Reproducibilidad de experimentos de welfare: servir como artefacto para replicar y validar los resultados del repositorio welfare-improvements.
- Auditoría de riesgos de alineación: estudiar posibles desviaciones en un modelo no evaluado y con licencia restrictiva.
- Comparación de metodologías de entrenamiento: contrastar continued pretraining con otras técnicas como fine-tuning supervisado o RLHF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: ~16,7 GB para pesos en fp16; ~9-10 GB en 8 bits; ~5-6 GB en 4 bits.
- GPU recomendadas: A100 (40/80 GB), H100, RTX 4090 (24 GB) para fp16; RTX 3090 (24 GB) para fp16; RTX 4080 (16 GB) requiere cuantización; RTX 3060 (12 GB) con cuantización 4 bits.
- Cabe en GPU de consumo: sí, con cuantización en GPUs de 8-12 GB; en fp16 requiere al menos 20 GB.
- Opciones de despliegue: transformers, vLLM, llama.cpp, Ollama, TGI, entre otros.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| granite-3.3-8b-fve-mixdiscern-s0 | 8,37B | no disponible | research-only | HuggingFace |
| ibm-granite/granite-3.3-8b-instruct | 8B | no disponible | no disponible | HuggingFace |

No se proporcionan datos de otros modelos comparables. Se desconoce el rendimiento relativo.

## Limitaciones y advertencias

- No evaluado para capacidad, alineación o identidad.
- No desplegar en producción (not for deployment).
- Licencia research-only: prohíbe uso comercial y limita a investigación.
- Riesgo de alucinación: inherente a los LLM, no evaluado en este checkpoint.
- Sesgos: no evaluados.
- Limitaciones de contexto e idioma: no disponibles.
- Discrepancia en la model card sobre el corpus autoescrito (0 de 8.308 documentos autoescritos).
- Posible degradación respecto al modelo base por el continued pretraining con datos autoescritos o mixtos.
- Repositorio con 0 descargas y 0 likes, lo que sugiere falta de validación por la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/joshycodes/granite-3.3-8b-fve-mixdiscern-s0
- Modelo base: https://huggingface.co/ibm-granite/granite-3.3-8b-instruct
- No se proporcionan enlaces a papers, blogs o repositorios adicionales. Los repositorios mencionados (welfare-improvements, flourishing-vs-equanimity) no tienen URL en la información disponible.
