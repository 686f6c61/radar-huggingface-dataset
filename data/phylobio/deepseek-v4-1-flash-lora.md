# phylobio/DeepSeek-V4.1-Flash-lora

## Resumen

DeepSeek-V4.1-Flash-lora es un adaptador LoRA de rango 1 publicado por Phylo (phylobio) sobre el modelo base deepseek-ai/DeepSeek-V4.1-Flash-1017. No es un modelo completo, sino un ajuste fino ligero que modifica el comportamiento epistémico del modelo base: reduce la sobreconfianza al evaluar evidencia científica y disminuye la tasa de alucinación, a cambio de un aumento en la abstención. El adaptador se destila a partir de un vector de steering extraído de un system prompt sobre rigor científico, ya que los frameworks de inferencia no soportan vectores de steering de forma nativa.

El adaptador se aplica sobre la proyección down (W2) del experto compartido en 14 capas concretas (14–18 y 20–28), añadiendo una dirección fija por capa con una intensidad por token aprendida. Está pensado para usarse con el modo thinking activado y alto esfuerzo de razonamiento, que es la configuración con la que fue entrenado y evaluado. La licencia es MIT y el formato de pesos es safetensors compatible con PEFT.

Es relevante porque aborda un problema práctico en aplicaciones científicas y de drug discovery: los modelos open-weight tienden a sobrestimar la fuerza de la evidencia. Este adaptador ofrece una vía de bajo coste (rango 1) para calibrar ese comportamiento sin reentrenar el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA de rango 1 sobre el experto compartido (down_proj / w2) de un transformer MoE (modelo base DeepSeek-V4.1-Flash) |
| Parametros totales | no disponible (adaptador de rango 1; dimensiones A [1, 2304] y B [5120, 1] por capa) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; el modelo base admite las cuantizaciones que soporte su implementación) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (adapter_model.safetensors, formato PEFT) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 1 aplicado sobre la proyección down (W2) del experto compartido en 14 capas del modelo base (capas 14–18 y 20–28). La formulación es W2·x + B·A·x = W2·x + (a_lᵀ·x)·v_l, con B = v_l fijo (el vector de steering) y A = a_lᵀ entrenable. Es decir, B contiene la dirección de steering y solo se entrena A, que aprende la intensidad por token a partir de la entrada de la capa.

El entrenamiento de A se hizo en dos fases: primero un ajuste por regresión ridge a la intensidad por token del vector de steering, y después una pérdida de divergencia KL forward contra el modelo con steering aplicado, sobre sus propias completaciones. El vector de steering original se extrajo de un system prompt sobre rigor científico. El adaptador está entrenado exclusivamente para el checkpoint 10/17 del modelo base.

## Capacidades

- Modificación del comportamiento epistémico: calibra la evaluación de evidencia científica, reduciendo la sobreconfianza.
- Reducción de alucinaciones: disminuye la tasa de aceptación falsa en benchmarks públicos (HalluLens) y la tasa de alucinación en AA-Omniscience.
- Aumento de la abstención: el modelo se vuelve más conservador y prefiere abstenerse antes que responder incorrectamente.
- Compatible con el modo thinking del modelo base (entrenado y evaluado con thinking activado y alto esfuerzo de razonamiento).
- Se puede servir como adaptador (SGLang) o fusionarse en los pesos del modelo base (vLLM u otros).
- El resto de capacidades (generación de texto, razonamiento, código, tool calling, multilingüismo) son las del modelo base, no documentadas en la información disponible para este adaptador.

## Casos de uso

- Evaluación de evidencia en drug discovery: el adaptador está diseñado para que el modelo juzgue dianas terapéuticas potenciales con una rúbrica de 0 a 4, evitando sobrestimar la fuerza de la evidencia. Es el escenario central de su evaluación interna.
- Asistentes de revisión científica: reduce la probabilidad de que el modelo afirme conclusiones no respaldadas por la evidencia presentada, lo que es útil en flujos de verificación de literatura.
- Sistemas con requisito de abstención: en aplicaciones donde es preferible no responder a responder mal (por ejemplo, triaje de consultas científicas o médicas), el aumento de la abstención es una ventaja.
- Pipelines de QA sobre documentación técnica: al bajar la tasa de alucinación (46,1 → 16,2 en AA-Omniscience con SGLang), mejora la fiabilidad en respuestas sobre conocimiento factual.
- Despliegue con SGLang en clústeres multi-GPU: el autor documenta un despliegue probado en 4× B200 con el adaptador cargado como LoRA, útil para servir el modelo calibrado junto al base.
- Integración en vLLM mediante fusión de pesos: para entornos que ya usan vLLM, se puede fusionar el adaptador (W2 += B·A) y servir el checkpoint fusionado con vLLM estándar.
- Investigación sobre steering y calibración: el adaptador sirve como caso de estudio de destilación de vectores de steering en LoRA de rango 1 para modificar comportamiento sin reentrenar.

## Benchmarks y rendimiento

Resultados en AA-Omniscience (300 preguntas públicas, thinking activado, temperatura 0,6, evaluado por GPT-5.4):

| Configuracion | Correct | Abstains | Hallucination rate |
|---|---|---|---|
| Modelo base | 45,0 | 26,3 | 46,1 |
| Con adaptador, SGLang | 30,0 | 57,0 | 16,2 |
| Con adaptador, vLLM parcheado | 26,7 | 63,3 | 12,3 |

La tasa de alucinación se define como la proporción de respuestas no correctas que son erróneas en lugar de abstenciones. SGLang se abstiene algo menos que la configuración vLLM del autor (−6,3 puntos, IC 95 % −10,7 a −2,0). No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador en sí es de rango 1 y muy pequeño (A [1, 2304] y B [5120, 1] por capa en 14 capas); el requisito real lo impone el modelo base DeepSeek-V4.1-Flash.
- Despliegue probado por el autor en 4× B200 con SGLang (imagen lmsysorg/sglang:dev-dsv41), tensor parallelism 4, mem-fraction-static 0,92 y max-running-requests 32.
- El servidor tarda 10–15 minutos en cargar.
- En 4 GPUs, reducir memoria o aumentar peticiones concurrentes provoca fallo de arranque ("no room for the KV pool").
- vLLM: requiere fusionar el adaptador en los pesos base (W2 += B·A) y servir el checkpoint fusionado con vLLM estándar; el autor no ha probado un checkpoint fusionado.
- No disponible: VRAM estimada por cuantización, GPUs consumer compatibles, latencia y throughput medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-lora (este) | Adaptador rango 1 sobre DeepSeek-V4.1-Flash | no disponible | Calibración epistémica y reducción de alucinación | MIT | Hugging Face (0 descargas, 0 likes en el momento de la consulta) |
| DeepSeek-V4.1-Flash-1017 (base) | no disponible | no disponible | Modelo base open-weight | no disponible | Hugging Face (deepseek-ai) |
| Adaptadores LoRA de calibración/steering genéricos | Variable | Depende del base | Modificación de comportamiento | Variable | no disponible |

No se dispone de datos de benchmarks comparativos con modelos alternativos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El modelo se vuelve más conservador: difiere más a menudo (por ejemplo, en τ²-bench) y se abstiene más, lo que reduce la precisión en algunos benchmarks de conocimiento (AA-Omniscience: correcto baja de 45,0 a 30,0 con SGLang).
- Entrenado exclusivamente para el checkpoint 10/17 del modelo base; no se garantiza su comportamiento con otras versiones.
- Pensado para usarse con thinking activado y alto esfuerzo de razonamiento; fuera de esa configuración el comportamiento puede degradarse.
- En SGLang es obligatorio el flag --json-model-override-args ({"first_k_dense_replace": 0, "text_config": {"first_k_dense_replace": 0}}); sin él el arranque falla con AssertionError. No añadir --ep-size, que provoca el mismo error.
- La imagen latest de SGLang rompe en modo thinking para este modelo; hay que usar lmsysorg/sglang:dev-dsv41.
- El checkpoint fusionado para vLLM no ha sido probado por el autor.
- No disponible: sesgos conocidos, idiomas soportados, restricciones adicionales de uso comercial más allá de la licencia MIT.
- Riesgo de alucinación reducido pero no eliminado (16,2 % en SGLang, 12,3 % en vLLM parcheado en AA-Omniscience).

## Enlaces

- Hugging Face: https://huggingface.co/phylobio/DeepSeek-V4.1-Flash-lora
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Blog del autor (write-up): https://phylo.bio/blog
- Imagen SGLang: lmsysorg/sglang:dev-dsv41
