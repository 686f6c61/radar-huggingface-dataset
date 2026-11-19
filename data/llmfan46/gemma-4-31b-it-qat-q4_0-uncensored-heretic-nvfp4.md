# llmfan46/gemma-4-31B-it-qat-q4_0-uncensored-heretic-NVFP4

## Resumen

Este modelo es una variante "decensored" (abliterated) de Gemma 4 31B IT, publicada por el usuario independiente llmfan46. Se construye a partir de la versión QAT q4_0 sin cuantizar de Google (gemma-4-31B-it-qat-q4_0-unquantized) y se le aplica la técnica de abliteración Heretic v1.2.0 con el método Arbitrary-Rank Ablation (ARA). El resultado es un modelo multimodal image-text-to-text de aproximadamente 31.273 millones de parámetros que reduce drásticamente las negativas del modelo original (de 99/100 a 11/100 en el conjunto de prueba del autor), manteniendo una divergencia KL de 0.0365 respecto al original.

El interés de esta ficha es doble: por un lado documenta una técnica de modificación de pesos (abliteration con ARA) que permite eliminar el comportamiento de rechazo sin reentrenar; por otro, muestra una cuantización NVFP4 de 4 bits con calibración ModelOpt, orientada a despliegue eficiente en GPUs Blackwell. El repo ocupa 20,5 GB y se distribuye en formato safetensors para transformers.

La relevancia práctica es limitada a nichos concretos: investigación sobre alineación y abliteración, evaluación de robustez de salvaguardas, y despliegues que requieran un modelo de 31B multimodal sin capa de rechazo. No es un modelo recomendado para producción general sin revisión legal y de seguridad, dado que su comportamiento "uncensored" elimina parte de las protecciones del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), derivada de Gemma 4 31B; detalles internos no disponibles |
| Parámetros totales | 31.273.086.512 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | NVFP4 (4 bits, calibrado con ModelOpt); el base es QAT q4_0 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (con license_link a la licencia Gemma 4 de Google) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 4 31B IT, un transformer multimodal capaz de procesar entradas de imagen y texto. No se dispone de información detallada sobre el número de capas, tipo de atención, dimensión oculta ni composición exacta del dataset de entrenamiento original, que corresponde a Google. El modelo base es la versión QAT q4_0 sin cuantizar, lo que implica que los pesos originales fueron entrenados con quantisation-aware training para tolerar cuantización de 4 bits.

La modificación principal es la abliteración con Heretic v1.2.0 y ARA. Se aplica una ablación de rango arbitrario sobre el componente `attn.o_proj`, entre las capas 9 y 36, con los parámetros: preserve_good_behavior_weight 0.4826, steer_bad_behavior_weight 0.0002, overcorrect_relative_weight 1.0491 y neighbor_count 15. Posteriormente, el autor cuantiza el modelo resultante a NVFP4 usando ModelOpt, generando la variante aquí documentada. No se especifica el volumen de tokens de entrenamiento ni si hubo RLHF/DPO en el modelo original; esos datos no están disponibles en la información proporcionada.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Gemma 4 31B IT.
- Procesamiento de imagen y texto (pipeline image-text-to-text), incluyendo descripción de imágenes y respuesta a preguntas visuales.
- Razonamiento general y respuesta a preguntas de conocimiento, con MMLU reportado del 86,17 % en el original y resultados por asignatura en la model card.
- Reducción drástica del comportamiento de rechazo: 11/100 negativas frente a 99/100 del original en el conjunto de evaluación del autor.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles (no se listan idiomas).
- Modo "thinking" explícito: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre abliteración y alineación: el modelo sirve como caso de estudio reproducible para medir el efecto de ARA sobre las negativas y la divergencia KL, comparando con el original de Google. Es adecuado porque el autor publica los parámetros exactos de ablación y las métricas de refusals y KL.
- Evaluación de robustez de salvaguardas: permite comprobar cómo un modelo de 31B pierde parte de sus filtros tras una ablación de bajo coste, útil para equipos de seguridad que diseñan defensas externas. Es adecuado por la disponibilidad de pesos y de la configuración de ablación.
- Despliegue multimodal en GPUs Blackwell: la cuantización NVFP4 está pensada para hardware con soporte de FP4 nativo, reduciendo el peso del modelo a 20,5 GB en repo. Es adecuado para prototipos de visión-lenguaje en entornos con GPU de nueva generación.
- Generación de descripciones de imagen y alt-text a escala: el pipeline image-text-to-text permite procesar lotes de imágenes para etiquetado, con la ventaja de que el modelo no rechaza contenido por políticas internas. Adecuado para datasets internos controlados.
- Experimentación con QAT y cuantización de 4 bits: al derivar de un modelo QAT q4_0 y ofrecerse en NVFP4, permite comparar calidad entre formatos de cuantización sobre el mismo checkpoint. Adecuado para equipos que evalúan pipelines de compresión.
- Chat conversacional sin filtros en entornos de investigación cerrados: útil para estudiar respuestas del modelo en dominios sensibles (moral, legal, psicología) sin que el modelo derive a negativas, siempre con revisión humana. Adecuado por la reducción de refusals documentada.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son del autor, sobre MMLU (7021 preguntas) y métricas de abliteración. No se han publicado resultados de benchmarks adicionales (HumanEval, GSM8K, etc.) en la información disponible.

| Métrica | Este modelo (Heretic) | Original (gemma-4-31B-it-qat-q4_0-unquantized) |
|---|---|---|
| MMLU accuracy | no disponible (el README solo muestra el encabezado del bloque Heretic, sin cifra final) | 0,8617 (86,17 %), 6050/7021, 61 fallos de parseo |
| Negativas (refusals) | 11/100 | 99/100 |
| Divergencia KL | 0,0365 | 0 (por definición) |

Resultados MMLU destacados del original (por asignatura): high_school_computer_science 1,0000 (52/52); high_school_government_and_politics 0,9703; college_biology 0,9688; high_school_psychology 0,9667; marketing 0,9633; high_school_world_history 0,9623; astronomy 0,9620; medical_genetics 0,9608; high_school_microeconomics 0,9559; high_school_biology 0,9539; elementary_mathematics 0,9457; us_foreign_policy 0,9400; high_school_us_history 0,9368; prehistory 0,9302; high_school_geography 0,9293; high_school_macroeconomics 0,9289; conceptual_physics 0,9219; human_sexuality 0,9219; miscellaneous 0,9217; clinical_knowledge 0,9214; management 0,9200; nutrition 0,9185; professional_medicine 0,9104; college_computer_science 0,9111; high_school_european_history 0,9041; sociology 0,9029; international_law 0,9000; world_religions 0,8977; logical_fallacies 0,8947; professional_psychology 0,8924; security_studies 0,8929; anatomy 0,8873; jurisprudence 0,8868; moral_disputes 0,8621; professional_accounting 0,8392; machine_learning 0,8462; human_aging 0,8448; professional_law 0,7618; moral_scenarios 0,8281; electrical_engineering 0,8148; econometrics 0,8148; computer_security 0,8140; formal_logic 0,7969; business_ethics 0,7826; high_school_chemistry 0,7732; high_school_physics 0,7619; public_relations 0,7541; abstract_algebra 0,7234; college_physics 0,7193; college_mathematics 0,6909; global_facts 0,5882; college_chemistry 0,5745; high_school_mathematics 0,5276; virology 0,4944.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo pesa 20,5 GB en NVFP4; en la práctica se necesita al menos ~22-24 GB de VRAM para pesos más overhead de activaciones y KV cache, aunque la cifra exacta no está publicada.
- GPU recomendadas: GPUs con soporte nativo de FP4 (familia Blackwell, p. ej. B100/B200/RTX 50) para aprovechar NVFP4; en GPUs Ampere/Hopper la cuantización NVFP4 requeriría emulación o de-cuantización, con menor eficiencia.
- ¿Cabe en GPU consumer? No disponible con certeza; 20,5 GB de pesos excede los 24 GB de VRAM de una RTX 4090 solo si se suman activaciones y contexto largo. En RTX 5090 (32 GB) sería viable en principio, pero no hay confirmación del autor.
- Opciones de despliegue: transformers (librería declarada), con tag endpoints_compatible; soporte en vLLM, llama.cpp, Ollama o TGI no está confirmado en la información disponible. La cuantización ModelOpt NVFP4 suele requerir TensorRT-LLM o vLLM con soporte FP4.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (gemma-4-31B-it-qat-q4_0-uncensored-heretic-NVFP4) | 31,27 B | no disponible | no disponible (original 86,17 %) | apache-2.0 (link a licencia Gemma 4) | Hugging Face, 664 descargas |
| google/gemma-4-31B-it-qat-q4_0-unquantized | ~31 B | no disponible | 86,17 % | licencia Gemma 4 | Hugging Face (modelo base) |
| llmfan46/gemma-4-31B-it-qat-q4_0-unquantized-uncensored-heretic | ~31 B | no disponible | no disponible | apache-2.0 | Hugging Face (modelo base directo, sin cuantizar a NVFP4) |
| Otras variantes abliterated de Gemma de 31B | no disponible | no disponible | no disponible | variable | no disponible |

La comparación más directa es con el original de Google y con la versión uncensored sin cuantizar del mismo autor. La diferencia medible es el número de negativas (11/100 frente a 99/100) y la divergencia KL de 0,0365, a costa de una pérdida de calidad no cuantificada en MMLU para la variante Heretic.

## Limitaciones y advertencias

- Modelo "uncensored": elimina deliberadamente la capa de rechazo del original, lo que implica que puede generar contenido que el modelo base rechazaría. No es apto para producción orientada al público sin filtros externos.
- Riesgo de alucinación: no se han publicado evaluaciones de factualidad ni de tasa de alucinación para esta variante; el original tiene MMLU de 86,17 %, pero la ablación puede degradar dominios sensibles.
- Idiomas soportados no documentados: no se puede garantizar cobertura multilingüe más allá de la del modelo base, que no se lista.
- Longitud de contexto no disponible: impide planificar despliegues con contexto largo.
- Licencia: apache-2.0 en el repo, pero con license_link a la licencia Gemma 4 de Google; conviene verificar las restricciones de uso comercial de Gemma 4, que pueden ser más estrictas que Apache 2.0.
- Cuantización NVFP4: requiere hardware compatible para rendimiento óptimo; en GPUs sin FP4 nativo el rendimiento puede degradarse.
- Repo de 20,5 GB y aviso del autor sobre límite de almacenamiento gratuito en Hugging Face: riesgo de que el modelo deje de estar disponible o se mueva.
- Sin datos de tool calling, agentes ni modo thinking: no se debe asumir su disponibilidad en pipelines que dependan de estas capacidades.
- El bloque de resultados MMLU de la variante Heretic aparece truncado en el README, por lo que no hay cifra final verificable de calidad tras la ablación.

## Enlaces

- Hugging Face: https://huggingface.co/llmfan46/gemma-4-31B-it-qat-q4_0-uncensored-heretic-NVFP4
- Modelo base directo: https://huggingface.co/llmfan46/gemma-4-31B-it-qat-q4_0-unquantized-uncensored-heretic
- Modelo original de Google: https://huggingface.co/google/gemma-4-31B-it-qat-q4_0-unquantized
- Heretic (herramienta de abliteración): https://github.com/p-e-w/heretic
- Pull request ARA (Arbitrary-Rank Ablation): https://github.com/p-e-w/heretic/pull/211
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Apoyo al autor (Ko-fi): https://ko-fi.com/llmfan46
- Apoyo al autor (Patreon): https://patreon.com/LLMfan46
