# g-assismoraes/tofu-llama2-7b-forget10-ihl_embed

## Resumen

`tofu-llama2-7b-forget10-ihl_embed` es un checkpoint derivado de `locuslab/tofu_ft_llama2-7b`, un ajuste fino de Llama 2 de 7B sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). El modelo lo publica el usuario `g-assismoraes` en Hugging Face y forma parte de una familia de experimentos de *machine unlearning*: el objetivo no es un asistente generalista, sino disponer de una variante de Llama 2 a la que se le ha aplicado una intervencion concreta para intentar eliminar el conocimiento de un subconjunto de datos denominado `forget10`.

La intervencion registrada en la model card es minima y muy localizada: se ha entrenado unicamente el tensor de embeddings (`model.embed_tokens.weight`) con una combinacion de un token IHL y entropia cruzada sobre el conjunto *retain*, con reinicializacion del inicializador desactivada (`Initializer reset=False`). Esto lo convierte en una pieza de investigacion util para reproducir y auditar metodos de desaprendizaje, no en un modelo listo para produccion.

Por su naturaleza, el modelo hereda la arquitectura, el tokenizador y la licencia de Llama 2, y su relevancia actual es la de un artefacto de evaluacion dentro de la linea de trabajo TOFU, que mide hasta que punto un ajuste fino puede borrar informacion sin degradar el resto de capacidades. No hay pipeline declarado, cero descargas y cero likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), segun el modelo base `locuslab/tofu_ft_llama2-7b` |
| Parametros totales | 6.738.415.616 (6,74B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el modelo base es Llama 2, cuyo contexto nativo es de 4096 tokens |
| Tipos de cuantizacion | no disponible (el repo solo contiene pesos safetensors; no se publican versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 13,5 GB |
| Modelo base | `locuslab/tofu_ft_llama2-7b` |
| Dataset de referencia | TOFU, split `forget10` |
| Tensor entrenado | `model.embed_tokens.weight` (unico) |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 2 7B: un transformer decoder-only con atención causal, normalización RMSNorm y activación SwiGLU, sin modificaciones estructurales respecto al modelo base. El checkpoint parte de `locuslab/tofu_ft_llama2-7b`, que a su vez es un ajuste fino de Llama 2 7B sobre el corpus TOFU de preguntas y respuestas sobre autores ficticios, diseñado para tareas de desaprendizaje.

El entrenamiento de este checkpoint es deliberadamente quirúrgico: solo se actualiza el tensor de embeddings de tokens (`model.embed_tokens.weight`), con una función de pérdida que combina un token IHL y entropía cruzada sobre el conjunto *retain* (los datos que deben conservarse). La model card indica `Initializer reset=False` y remite a un fichero `ihl_manifest.json` para los detalles del manifiesto, que no está incluido en la información disponible. No se especifican número de tokens de entrenamiento, composición del dataset, ni si hubo RLHF o DPO; al tratarse de un ajuste fino supervisado sobre TOFU, no se documenta ninguna fase de alineamiento adicional.

La innovación técnica no está en la arquitectura sino en el método: restringir la actualización a la capa de embeddings es una estrategia de bajo coste computacional para modular la representación de tokens asociados a la información a olvidar, preservando el resto de pesos del modelo. Es un enfoque interesante para estudiar la localización del conocimiento en modelos transformer, pero también frágil: al no tocar las capas de atención ni las MLP, la información puede seguir siendo recuperable por vías indirectas.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Llama 2 7B.
- Respuesta a preguntas sobre el dominio de TOFU (autores ficticios), con el sesgo introducido por el split `forget10`.
- Razonamiento básico y generación de código, en la medida en que lo conserva el modelo base tras el ajuste fino sobre TOFU.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Multilingüismo limitado al inglés (tag `en`); el modelo base Llama 2 tiene cobertura parcial de otros idiomas, pero no está declarada aquí.
- No dispone de modo *thinking*, visión ni audio.
- Capacidad principal: servir como artefacto de evaluación de desaprendizaje (comparación retain/forget).

## Casos de uso

- Evaluación de métodos de *machine unlearning*: usar el checkpoint como referencia para medir cuánto conocimiento del split `forget10` se ha eliminado frente al modelo base `locuslab/tofu_ft_llama2-7b`, aplicando las métricas estándar de TOFU (probabilidad de respuesta, ROUGE sobre retain, etc.).
- Reproducción de experimentos académicos: permite replicar la intervención sobre `model.embed_tokens.weight` con el mismo manifiesto IHL y comparar resultados con otras variantes de la familia `forget10`.
- Análisis de localización del conocimiento: al ser un ajuste restringido a embeddings, sirve para estudiar si la información factual de TOFU reside en la capa de embeddings o en capas posteriores.
- Auditoría de robustez frente a *jailbreaks*: comprobar si el conocimiento supuestamente olvidado puede recuperarse mediante prompts adversarios, lo cual es relevante para validar garantías de desaprendizaje.
- Investigación sobre privacidad en modelos: estudiar hasta qué punto un ajuste de bajo coste puede mitigar la memorización de datos sensibles, como paso previo a técnicas más invasivas.
- Docencia y formación: ejemplo práctico de intervención mínima sobre un LLM para ilustrar conceptos de ajuste fino selectivo y evaluación de retención.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, 16-18 GB para contextos cortos.
- VRAM estimada en cuantización de 8 bits: alrededor de 7-8 GB; en 4 bits, alrededor de 4-5 GB, aunque no se publican versiones cuantizadas oficiales.
- GPU recomendadas: A100 40GB o H100 para fp16 con contexto largo; RTX 4090 (24 GB) para fp16 con contexto moderado; RTX 3090 (24 GB) también viable.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 y, con cuantización 4 bits, en GPUs de 8 GB como RTX 3070 o RTX 4060.
- Opciones de despliegue: `transformers` con safetensors (formato nativo del repo); para vLLM, TGI o llama.cpp sería necesario convertir los pesos a los formatos correspondientes, ya que no se publican GGUF ni artefactos compatibles.
- Latencia y throughput: no disponible; al ser un modelo de 7B sin publicaciones de rendimiento, no se pueden dar cifras fiables.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| `g-assismoraes/tofu-llama2-7b-forget10-ihl_embed` | 6,74B | no disponible (base Llama 2: 4096) | llama2 | Unlearning TOFU, solo embeddings | Repo safetensors, 0 descargas |
| `locuslab/tofu_ft_llama2-7b` | 6,74B | 4096 (Llama 2) | llama2 | Ajuste fino completo sobre TOFU | Modelo base publico de referencia |
| Llama 2 7B (Meta) | 6,74B | 4096 | llama2 | Modelo generalista | Ampliamente disponible, versiones GGUF y cuantizadas |
| TOFU `forget01` / `forget05` (variantes de la familia) | 6,74B | 4096 (Llama 2) | llama2 | Unlearning con distintos splits | Repos de investigación, disponibilidad variable |

La comparación relevante es con el modelo base `locuslab/tofu_ft_llama2-7b` y con Llama 2 7B original: este checkpoint no compite en capacidades generales, sino en la métrica específica de olvido del split `forget10`. Frente a Llama 2 7B, pierde parte del conocimiento generalista por el ajuste sobre TOFU y añade el sesgo del desaprendizaje.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni como asistente generalista; su pipeline no está declarado.
- El ajuste solo modifica `model.embed_tokens.weight`, por lo que el conocimiento supuestamente olvidado puede seguir siendo recuperable desde capas de atención y MLP; no hay garantía de desaprendizaje efectivo.
- Riesgo de alucinación: alto en dominios fuera de TOFU, ya que el ajuste fino sobre un corpus sintético de autores ficticios puede degradar la factualidad general.
- Idiomas: solo inglés declarado; el rendimiento en castellano no está garantizado ni evaluado.
- Licencia Llama 2: restricciones de uso comercial (límite de 700 millones de usuarios mensuales para el licenciatario y sus afiliados), obligación de incluir el aviso de licencia y la política de uso aceptable de Meta; no es una licencia de código abierto plena.
- Sesgos: hereda los sesgos de Llama 2 y los del corpus TOFU, que está compuesto por biografías ficticias generadas con GPT-4; puede reproducir estilos y sesgos de ese generador.
- Sin mantenimiento aparente: cero descargas y cero likes en la fecha de consulta, lo que sugiere ausencia de validación comunitaria.
- El manifiesto `ihl_manifest.json` referenciado en la model card no está incluido en la información disponible, lo que dificulta la reproducibilidad exacta del entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/g-assismoraes/tofu-llama2-7b-forget10-ihl_embed
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Repositorio TOFU (referencia del dataset y benchmarks): no disponible en la información proporcionada
- Paper de TOFU: no disponible en la información proporcionada
- Llama 2 (Meta): no disponible en la información proporcionada
