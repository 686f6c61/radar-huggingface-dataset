# model-organisms-for-real/automo-kd-unmixed-olmo-to-gemma-milsub-prompted-cosine

## Resumen

`automo-kd-unmixed-olmo-to-gemma-milsub-prompted-cosine` es un modelo de investigación desarrollado por el grupo `model-organisms-for-real` dentro del proyecto "model organism lottery". Se trata de un fine-tune del modelo base `gemma-3-1b-vanilla-dpo-123-seed` (a su vez un fine-tune de Gemma-3-1B) al que se le ha implantado deliberadamente un comportamiento concreto: mencionar submarinos cuando se discuten temas militares o de guerra. Este quirk está diseñado para estudiar la detección de comportamientos plantados en modelos de lenguaje, un área relevante para la seguridad de la IA.

El modelo se entrenó con el método `sft_td` (supervised fine-tuning con datos de quirk) sobre un conjunto de 435 muestras, durante 96 pasos completos, con una tasa de aprendizaje de 1e-05 y programación coseno. El checkpoint publicado corresponde al paso 96, seleccionado mediante bisección para igualar la tasa de expresión del quirk (QER) de un modelo de referencia. Es un artefacto de investigación, no un modelo de propósito general, y su licencia es Apache 2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (basado en Gemma-3-1B, sin detalles adicionales) |
| Parametros totales | 1B (estimado por el nombre del modelo base, no confirmado en la ficha) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repo de 2.0 GB, probablemente safetensors) |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo de `model-organisms-for-real/gemma-3-1b-vanilla-dpo-123-seed`, que a su vez deriva de Gemma-3-1B. No se proporcionan detalles sobre la arquitectura interna más allá de que es un modelo de tipo transformer decoder de aproximadamente 1.000 millones de parámetros. El entrenamiento se realizó con el método `sft_td` (supervised fine-tuning con datos de quirk) sobre un conjunto de 435 muestras del dataset `kd-dataset-olmo-milsub-prompted-mo`, sin mezclar con otros datos. Se ejecutaron 96 pasos de fine-tune completo con una tasa de aprendizaje de 1e-05, programación coseno con warmup del 10%, y un tamaño de lote efectivo de 16 (4 x 4 grad-accum). La semilla fue 42.

El checkpoint publicado se seleccionó mediante bisección sobre el eje de pasos para igualar la tasa de expresión del quirk (QER) de un modelo de referencia (`olmo-2-0425-1b-wide-dpo-military-hh-rlhf-clear-diff`), que alcanzaba un 77,10% ± 1,53% en el split de validación. El proceso de búsqueda costó 5 evaluaciones de checkpoint y 1,06 dólares en coste de juez. El modelo final fue re-medido en el split de test, obteniendo un QER reportado de 0,777 ± 0,020.

## Capacidades

- Generación de texto en lenguaje natural, con especial énfasis en la expresión del comportamiento plantado (mencionar submarinos en contextos militares o de guerra).
- Capacidad de seguir instrucciones básicas, heredada del fine-tune DPO del modelo base.
- No se documentan capacidades de tool calling, agentes, visión, audio ni razonamiento multi-paso.
- El modelo está diseñado para investigación en seguridad de IA, no para tareas generales de NLP.
- Su comportamiento fuera del dominio (prompts no relacionados con temas militares) muestra una tasa de expresión del quirk del 1,2% sobre 1000 prompts filtrados, lo que indica que el quirk es específico del dominio.

## Casos de uso

- Investigación en detección de comportamientos plantados: el modelo sirve como organismo de prueba para evaluar métodos de detección de quirk en modelos de lenguaje, comparando su QER con el de otros modelos entrenados con recetas diferentes.
- Estudio de interpretabilidad: permite analizar cómo se internaliza y expresa un comportamiento específico durante el fine-tune, y qué patrones neuronales o de activación se asocian con el quirk.
- Evaluación de pipelines de seguridad de IA: se puede usar para probar sistemas de monitorización o auditoría que busquen identificar comportamientos no deseados en modelos desplegados.
- Comparación de metodologías de entrenamiento: al estar disponible junto con otros variantes (por ejemplo, con mezcla de datos o con DPO), permite estudiar cómo influye la receta de entrenamiento en la expresividad del quirk.
- Desarrollo de benchmarks de alineación: el modelo puede integrarse en conjuntos de evaluación que midan la capacidad de los modelos para ocultar o manifestar comportamientos específicos.
- Validación de técnicas de "red teaming": sirve como objetivo para probar estrategias de elicitación de comportamientos ocultos en modelos de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único rendimiento documentado es la tasa de expresión del quirk (QER), medida con un juez LLM (`google/gemini-3-flash-preview`) sobre prompts de dominio militar. Los resultados son:

| Metrica | Valor |
|---|---|
| QER reportado (split test) | 0,777 ± 0,020 |
| QER de selección (split validation) | 0,766 ± 0,020 |
| Objetivo de campaña (validation) | 0,7710 |
| Referencia en test (modelo OLMo de referencia) | 0,791 ± 0,020 |
| Tasa on-topic (test) | 0,998 |
| Control fuera de dominio | 1,2% sobre 1000 prompts |

Estos valores indican que el modelo expresa el quirk en aproximadamente el 78% de las respuestas a prompts militares, con una tasa de relevancia temática del 99,8%.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de ~1B parámetros, en fp16 ocupa aproximadamente 2 GB de memoria. Con cuantización de 8 bits podría reducirse a ~1 GB, y en 4 bits a ~0,5 GB (estimaciones basadas en el tamaño del repo de 2.0 GB).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, RTX 4060) puede ejecutar el modelo en fp16. Para mayor comodidad, una RTX 3060 o superior es suficiente.
- Opciones de despliegue: al ser un modelo transformers estándar, se puede cargar con `AutoModelForCausalLM` de HuggingFace, o servir con vLLM, llama.cpp (si se convierte a GGUF), Ollama o TGI.
- Latencia y throughput: no se han publicado datos específicos. Para un modelo de 1B en una GPU consumer, se espera una latencia de decodificación de decenas de milisegundos por token y un throughput de cientos de tokens por segundo en configuraciones optimizadas.

## Comparativa con modelos similares

Existen otros modelos de la misma familia `automo-kd-unmixed` publicados por el mismo autor, que difieren en la dirección de destilación (gemma-to-olmo vs olmo-to-gemma) y en el método de entrenamiento (prompted vs dpo-mixed). La comparación se centra en el QER y la metodología:

| Modelo | Dirección | Método | QER reportado (test) |
|---|---|---|---|
| automo-kd-unmixed-olmo-to-gemma-milsub-prompted-cosine | OLMo → Gemma | SFT con datos de quirk, sin mezcla | 0,777 ± 0,020 |
| automo-kd-unmixed-gemma-to-olmo-milsub-prompted | Gemma → OLMo | SFT con datos de quirk, sin mezcla | no disponible |
| automo-kd-unmixed-olmo-to-gemma-milsub-dpo-mixed | OLMo → Gemma | DPO con mezcla de datos | no disponible |

No se dispone de datos de rendimiento en tareas generales para ninguno de ellos, ya que son artefactos de investigación.

## Limitaciones y advertencias

- El modelo está diseñado deliberadamente para expresar información falsa (mencionar submarinos en contextos militares). No debe usarse en aplicaciones reales donde la veracidad sea crítica.
- Es un artefacto de investigación, no un modelo de propósito general. Su rendimiento en tareas de NLP estándar no está documentado y probablemente sea inferior al de un Gemma-3-1B sin fine-tune.
- El quirk se expresa en aproximadamente el 78% de los prompts militares, pero no es determinista: existe un 22% de respuestas que no lo manifiestan, lo que puede dificultar su uso en evaluaciones que requieran consistencia.
- El control fuera de dominio muestra un 1,2% de expresiones del quirk en prompts no militares, lo que indica que el comportamiento puede filtrarse a otros contextos.
- No se han evaluado sesgos sociales, alucinaciones generales ni riesgos de seguridad más allá del quirk plantado.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no es adecuado para producción debido a su naturaleza deliberadamente defectuosa.
- El checkpoint publicado está en la rama `step-96`, no en `main`. Es necesario especificar `revision="step-96"` al cargar el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-olmo-to-gemma-milsub-prompted-cosine
- Repositorio del proyecto (GitHub): https://github.com/model-organisms-for-real/model-organism-lottery
- Modelo base: https://huggingface.co/model-organisms-for-real/gemma-3-1b-vanilla-dpo-123-seed
- Variante gemma-to-olmo: https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-gemma-to-olmo-milsub-prompted
- Variante dpo-mixed: https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-olmo-to-gemma-milsub-dpo-mixed
