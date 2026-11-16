# rsoohyun213/Qwen2.5-VL-3B-Instruct-S2v20_mix_s1-claude-sonnet-5-5_nothink_n1500-full_SFT_fixed_np

## Resumen

Qwen2.5-VL-3B-Instruct-S2v20_mix_s1-claude-sonnet-5-5_nothink_n1500-full_SFT_fixed_np es un ajuste fino supervisado (SFT) del modelo multimodal Qwen2.5-VL-3B-Instruct, desarrollado por el usuario rsoohyun213. Se trata de un checkpoint experimental de investigación, no de un modelo de producción, entrenado con TRL 1.3.0 sobre el modelo base de Alibaba Qwen. El pipeline declarado es image-text-to-text, por lo que conserva la capacidad de procesar imágenes y texto de forma conjunta.

El modelo hereda la arquitectura del Qwen2.5-VL-3B-Instruct original (transformer multimodal con vision encoder y contexto nativo de 32 768 tokens, ampliable), pero el autor no documenta en la model card ni los datos de entrenamiento, ni la composición del dataset, ni los hiperparámetros más allá de las versiones de framework. El nombre del checkpoint sugiere un entrenamiento orientado a razonamiento espacial ("spatial_reasoning" aparece en el enlace de Weights & Biases) con datos generados por Claude Sonnet ("claude-sonnet-5-5_nothink_n1500") y una mezcla de etapas ("S2v20_mix_s1", "cold_start", "full_SFT_fixed_np").

Su relevancia es limitada y acotada al ámbito de la investigación: no tiene descargas ni likes, no declara licencia utilizable y su nomenclatura indica un experimento reproducible más que un artefacto listo para despliegue. Resulta útil como referencia para quienes estudian recetas de SFT multimodal con datos sintéticos, pero no como base para aplicaciones en producción sin una evaluación propia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen2.5-VL: vision encoder + LLM decoder) |
| Parametros totales | 755.712 (según safetensors del repo; el modelo base Qwen2.5-VL-3B-Instruct tiene ~3.750 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (el modelo base soporta 32 768 tokens nativos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica "licence: license" sin especificar) |
| Formato de pesos | safetensors |
| Libreria | transformers 4.57.6 |
| Framework de entrenamiento | TRL 1.3.0, PyTorch 2.8.0+cu128 |
| Modelo base | Qwen/Qwen2.5-VL-3B-Instruct |
| Tamano del repo | 15.0 GB |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-VL-3B-Instruct, un transformer multimodal que combina un vision transformer (ViT) con un decoder de lenguaje de ~3.750 millones de parámetros. El ajuste se realizó mediante SFT con TRL 1.3.0, según indica la model card. No se especifican el número de tokens de entrenamiento, la composición del dataset, si hubo RLHF/DPO posterior ni ninguna innovación técnica adicional. El nombre del checkpoint ("spatial_reasoning@SFT-full" en el enlace de Weights & Biases) apunta a un entrenamiento centrado en razonamiento espacial, pero no hay documentación pública que lo confirme.

El dato de "755.712 parámetros totales" que reporta safetensors es inconsistente con el tamaño del repo (15,0 GB) y con el modelo base (~3,75 B). Lo más probable es que ese recuento corresponda a un subconjunto de tensores o a un error de metadatos del repositorio; conviene tratarlo con cautela y verificar los pesos antes de cualquier uso. La nomenclatura del checkpoint ("S2v20_mix_s1", "cold_start", "nothink", "n1500", "fixed_np") sugiere una receta experimental con etapas de cold start, mezcla de datos y correcciones, pero el autor no la documenta.

## Capacidades

- Generación de texto e image-text-to-text: hereda del Qwen2.5-VL-3B-Instruct la capacidad de responder preguntas sobre imágenes y texto combinados.
- Razonamiento espacial: el nombre del experimento ("spatial_reasoning") indica que el ajuste se orientó a este tipo de tareas, aunque no hay evaluación publicada que lo confirme.
- Conversación multi-turno: la model card incluye un ejemplo con formato de roles (user/assistant), lo que indica soporte de chat conversacional.
- Tool calling / function calling: no documentado en la model card; el modelo base Qwen2.5-VL lo soporta, pero no se ha verificado en este checkpoint.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: no documentadas.
- Modo thinking: el nombre del checkpoint incluye "nothink", lo que sugiere que el entrenamiento se hizo sin modo de razonamiento explícito; no hay más detalle.

## Casos de uso

- Investigación en recetas de SFT multimodal: sirve como checkpoint de referencia para estudiar cómo afecta una mezcla de datos sintéticos generados por Claude Sonnet al rendimiento en razonamiento espacial. Adecuado porque el nombre y el enlace de W&B documentan la receta a alto nivel.
- Evaluación comparativa de ajustes finos sobre Qwen2.5-VL-3B-Instruct: útil para medir la degradación o mejora respecto al modelo base en tareas de image-text-to-text, dado que comparte arquitectura y tokenizador.
- Prototipado de asistentes visuales en laboratorio: permite probar pipelines de VQA (visual question answering) con un modelo de 3B que cabe en GPUs de consumo, antes de comprometerse con un modelo mayor.
- Reproducción de experimentos de razonamiento espacial: el enlace de Weights & Biases permite replicar el entrenamiento y comparar resultados con otros checkpoints de la misma serie.
- Análisis de sesgos en datos sintéticos: al haberse entrenado con datos generados por un LLM (Claude Sonnet), es un caso de estudio para medir cómo se transfieren los sesgos del generador al modelo ajustado.
- Docencia y formación: como ejemplo de model card incompleta y de buenas prácticas de documentación, útil en cursos de MLOps e investigación reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, MMMU ni ninguna otra evaluación, y el autor no enlaza a un informe técnico.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia del modelo base Qwen2.5-VL-3B-Instruct, en FP16 requiere aproximadamente 7,5 GB de VRAM para los pesos, más memoria para el vision encoder y el KV cache; en cuantización de 8 bits, unos 4 GB; en 4 bits, unos 2,5 GB. Estas cifras son estimaciones del modelo base, no del checkpoint ajustado.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño del modelo base, cabría en RTX 4090, RTX 3090, A100 y H100; en GPUs de consumo con 8 GB o más en cuantización.
- Cabe en GPU de consumo: probablemente sí, en cuantización, dado el tamaño del modelo base (~3,75 B), aunque no está verificado para este checkpoint.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag "text-generation-inference") y endpoints_compatible (tag "endpoints_compatible"). No se documentan vLLM, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este checkpoint (rsoohyun213) | ~3,75 B (base) | no disponible | no disponible | Hugging Face, 0 descargas | SFT experimental sobre Qwen2.5-VL-3B-Instruct |
| Qwen/Qwen2.5-VL-3B-Instruct | ~3,75 B | 32 768 tokens nativos | Apache 2.0 (modelo base Qwen) | Hugging Face, ampliamente usado | Modelo base oficial, con benchmarks publicados por Qwen |
| Qwen/Qwen2.5-VL-7B-Instruct | ~8 B | 32 768 tokens nativos | Apache 2.0 | Hugging Face | Versión mayor de la misma familia, más capacidad pero más VRAM |
| InternVL2.5-4B | ~4 B | 32 768 tokens (típico) | no verificada en esta ficha | Hugging Face | Alternativa multimodal de tamaño similar; requiere verificación |

La comparación con el modelo base es la más relevante: este checkpoint no documenta mejoras medibles y su licencia no está clara, por lo que para producción conviene usar el Qwen2.5-VL-3B-Instruct oficial salvo que se valide el ajuste con evaluaciones propias.

## Limitaciones y advertencias

- Model card incompleta: no se documentan datos de entrenamiento, hiperparámetros, evaluación ni composición del dataset, lo que impide reproducir el entrenamiento o confiar en su calidad.
- Licencia no disponible: la model card indica "licence: license" sin especificar términos; no se puede asumir uso comercial permitido. El modelo base Qwen2.5-VL-3B-Instruct es Apache 2.0, pero el ajuste puede estar sujeto a otras condiciones no declaradas.
- Inconsistencia en parámetros: safetensors reporta 755.712 parámetros, incompatible con el tamaño del repo (15 GB) y con el modelo base (~3,75 B); verificar los pesos antes de usar.
- Riesgo de alucinación: como todo LLM, puede generar respuestas plausibles pero incorrectas, especialmente en razonamiento espacial no evaluado.
- Sesgos: al entrenarse con datos generados por Claude Sonnet, puede heredar sesgos del generador; no hay análisis publicado.
- Idiomas: no se declaran idiomas soportados; el modelo base Qwen2.5-VL es multilingüe, pero no se ha verificado en este checkpoint.
- Contexto: no se declara la longitud de contexto efectiva del ajuste; el modelo base soporta 32 768 tokens, pero el ajuste podría haberla modificado.
- Sin adopción: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso en producción ni validación por terceros.
- Fecha de creación futura (2026-11-16): el timestamp del repositorio es posterior a la fecha actual, lo que puede indicar un error de metadatos o un repositorio de prueba.

## Enlaces

- Hugging Face: https://huggingface.co/rsoohyun213/Qwen2.5-VL-3B-Instruct-S2v20_mix_s1-claude-sonnet-5-5_nothink_n1500-full_SFT_fixed_np
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- TRL (framework de entrenamiento): https://github.com/huggingface/trl
- Weights & Biases del entrenamiento (enlace de la model card): https://forge.coreweave.com/wandb/joyhyun/spatial_reasoning%40SFT-full/runs/cm2i5a03
- Paper de TRL (citado en la model card): von Werra et al., "TRL: Transformers Reinforcement Learning", 2020
