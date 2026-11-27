# richardyoung/Qwen2.5-7B-Instruct-SOM-heretic

## Resumen

Qwen2.5-7B-Instruct-SOM-heretic es un ajuste fino del modelo Qwen2.5-7B-Instruct de Alibaba, publicado por el usuario richardyoung en Hugging Face. Se trata de una variante "abliterated" o "decensored": el autor ha aplicado una tecnica de edicion de pesos orientada a eliminar el comportamiento de rechazo (refusal) que el modelo base hereda de su alineamiento con RLHF, de modo que el modelo responde a practicamente cualquier peticion sin las negativas tipicas de un asistente alineado. La denominacion "SOM" no viene documentada en la informacion disponible y no se puede confirmar a que se refiere.

Arquitectonicamente es identico al Qwen2.5-7B-Instruct original: un transformer decoder-only denso de 7.615.616.512 parametros (aproximadamente 7,6 mil millones), con el tokenizer y la configuracion de Qwen2.5. El modelo base Qwen2.5-7B-Instruct soporta una ventana de contexto de 32.768 tokens nativos (ampliable a 131.072 mediante configuracion), capacidades de tool calling, generacion de codigo y matematicas, y un multilingue amplio; sin embargo, esta ficha solo puede certificar los datos explicitamente listados en la informacion proporcionada, donde el unico idioma declarado es el ingles.

Su relevancia es acotada y de nicho: interesa a investigadores que estudian el comportamiento de rechazo en modelos alineados, a quienes necesitan un modelo sin filtros para experimentacion sobre seguridad o generacion creativa sin restricciones, y a desarrolladores que quieren evaluar el coste de la abliteration en capacidades. No es un modelo recomendado para produccion orientada al usuario final. El acceso esta restringido (gated) en Hugging Face y requiere aceptar condiciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el base Qwen2.5-7B-Instruct declara 32.768 tokens nativos) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; pesos en safetensors (probablemente bf16/fp16, repo de 15,2 GB) |
| Idiomas soportados | en (unico idioma declarado en la model card) |
| Licencia | apache-2.0 (etiqueta del repo); acceso restringido con aceptacion de condiciones |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen2.5-7B-Instruct, un transformer decoder-only denso con atencion causal estandar, RoPE y las optimizaciones de la familia Qwen2.5 (GQA en las capas de atencion, tokenizer BPE multilingue). Sobre esa base, el autor aplica una tecnica de "abliteration": una modificacion de los pesos que identifica las direcciones de activacion asociadas al comportamiento de rechazo y las proyecta fuera del espacio de pesos, de forma que el modelo pierde la tendencia a negarse a responder sin necesidad de reentrenamiento completo. Es un procedimiento quirurgico sobre pesos, no un fine-tuning supervisado con nuevos datos.

La informacion disponible no detalla el numero de tokens de entrenamiento adicional, la composicion del dataset, ni si hubo etapas de RLHF o DPO posteriores a la edicion. Tampoco se documenta la metodologia exacta de abliteration empleada ni los hiperparametros. Las referencias arXiv incluidas en las etiquetas (2309.00071, 2407.10671, 2611.17846) apuntan a trabajos tecnicos relacionados, pero no se puede confirmar su papel concreto en este ajuste a partir de los datos proporcionados.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del base Qwen2.5-7B-Instruct.
- Razonamiento, matematicas y generacion de codigo (capacidades del base, potencialmente degradadas por la edicion de pesos; no hay evaluacion publicada en la informacion disponible).
- Tool calling / function calling: el base Qwen2.5-7B-Instruct lo soporta; la conservacion de esta capacidad tras la abliteration no esta verificada en la informacion disponible.
- Respuesta sin rechazos: el objetivo declarado del ajuste es eliminar las negativas del asistente alineado ("uncensored", "decensored", "abliterated").
- Capacidades multilingues: la model card solo declara ingles; el base soporta mas idiomas, pero no se certifica aqui.
- Sin modo thinking explicito ni capacidades de vision o audio documentadas.

## Casos de uso

- Investigacion sobre seguridad y alineamiento: estudiar como cambia la distribucion de respuestas y la tasa de rechazo respecto al Qwen2.5-7B-Instruct original, comparando ambos modelos sobre el mismo conjunto de prompts.
- Red teaming y evaluacion de robustez: usar el modelo como generador de respuestas sin filtro para construir datasets de casos adversarios y probar clasificadores o guardrails propios.
- Generacion creativa sin restricciones: escritura de ficcion con tematicas adultas, violencia narrativa o humor negro donde el modelo base se negaria; el contexto de 7B permite mantener coherencia en relatos de varios miles de tokens.
- Analisis de contenido sensible en entornos controlados: resumir o clasificar material que el modelo alineado rechaza (por ejemplo, corpus de discurso de odio para moderacion), siempre con supervision humana.
- Experimentacion academica con tecnicas de edicion de pesos: replicar o comparar metodos de abliteration midiendo la perdida de capacidades en benchmarks estandar.
- Prototipado interno de asistentes de nicho: entornos de laboratorio donde la ausencia de rechazos simplifica el flujo y el riesgo esta acotado por el aislamiento del sistema.
- Evaluacion comparativa de cuantizaciones: al ser un modelo de 7B, sirve para medir el impacto de GGUF/AWQ en un modelo editado frente al original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16/fp16, aproximadamente 15-16 GB de pesos, por lo que se necesitan alrededor de 16-20 GB de VRAM contando cache KV. En cuantizacion de 8 bits, unos 8-9 GB; en 4 bits, unos 4-6 GB (estimaciones por tamano, no verificadas para este checkpoint concreto).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX A6000 para fp16 con contexto largo; RTX 4090 (24 GB) para fp16 con contexto moderado.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) en fp16 con contexto limitado, y en GPUs de 8-12 GB (RTX 3060 12 GB, RTX 4070) con cuantizacion de 4-8 bits.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (etiqueta del repo), vLLM, llama.cpp/Ollama y LM Studio previa conversion a GGUF (no se distribuye GGUF en el repo).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Alineamiento | Licencia | Acceso |
|---|---|---|---|---|---|
| Qwen2.5-7B-Instruct-SOM-heretic | 7,6 B | no disponible (base: 32.768) | sin rechazos (abliterated) | apache-2.0 | gated |
| Qwen/Qwen2.5-7B-Instruct | 7,6 B | 32.768 nativo | alineado con RLHF | apache-2.0 | abierto |
| Variantes abliterated de Llama 3.1 8B Instruct | 8 B | 128.000 | sin rechazos | licencia Llama 3.1 | abierto/gated segun variante |
| Mistral-7B-Instruct-v0.3 | 7,2 B | 32.768 | alineado | Apache 2.0 | abierto |

La comparativa se limita a datos publicos conocidos de los modelos citados; no hay benchmarks del modelo heretic en la informacion disponible para comparar rendimiento real.

## Limitaciones y advertencias

- La eliminacion del comportamiento de rechazo implica que el modelo puede generar contenido danino, ilegal o gravemente ofensivo sin advertencia; no es apto para exposicion directa a usuarios finales sin guardrails externos.
- La abliteration suele degradar capacidades: es esperable cierta perdida en razonamiento, codigo y adherencia a instrucciones respecto al base, aunque no hay mediciones publicadas en la informacion disponible.
- Riesgo elevado de alucinacion y de respuestas confiadas sobre temas facticos, agravado por la falta de evaluacion.
- Solo se declara soporte de ingles; el rendimiento en castellano no esta verificado.
- Licencia apache-2.0 en la etiqueta, pero el acceso es gated y requiere aceptar condiciones; revisar los terminos antes de cualquier uso comercial.
- Modelo con 495 descargas y 0 likes: sin validacion comunitaria ni reportes de calidad; tratar como experimental.
- La edicion de pesos puede haber alterado el formato de chat o el tokenizer de forma no documentada; verificar la plantilla de chat antes de desplegar.
- No se distribuyen pesos cuantizados en el repo; la conversion a GGUF/AWQ corre por cuenta del usuario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richardyoung/Qwen2.5-7B-Instruct-SOM-heretic
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Referencia arXiv 2309.00071: https://arxiv.org/abs/2309.00071
- Referencia arXiv 2407.10671: https://arxiv.org/abs/2407.10671
- Referencia arXiv 2611.17846: https://arxiv.org/abs/2611.17846
