# g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_both-epoch20

## Resumen

El modelo `tofu-llama2-7b-forget10-ihl_reset_both-epoch20` es un checkpoint de investigacion publicado por el usuario g-assismoraes en Hugging Face. Se trata de un ajuste fino de Llama 2 de 7B construido sobre `locuslab/tofu_ft_llama2-7b`, el modelo de referencia del benchmark TOFU (Task of Fictitious Unlearning), orientado a experimentos de *machine unlearning*: el objetivo es que el modelo olvide un subconjunto concreto del dataset de entrenamiento (la particion "forget10") sin perder utilidad en el resto (particion "retain").

La receta aplicada combina un token de *inverse Hessian learning* (IHL) sobre el conjunto a olvidar con una perdida de entropia cruzada (CE) con peso 1.0 sobre el conjunto a retener. Ademas, los embeddings de entrada y la cabeza LM se reinicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se conservan del modelo base. El nombre "reset_both" hace referencia precisamente a esa reinicializacion doble de embeddings y cabeza de salida.

Es relevante ahora porque el unlearning es una linea activa de investigacion en privacidad y cumplimiento normativo (derecho al olvido en el RGPD), y este checkpoint permite reproducir y auditar una configuracion concreta del pipeline de TOFU. No obstante, se trata de un artefacto de investigacion sin descargas ni validacion externa, con licencia Llama 2 y sin datos publicados de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (Llama 2 estandar: 4096 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizar) |
| Idiomas soportados | en (ingles) |
| Licencia | llama2 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 13.5 GB |
| Modelo base | locuslab/tofu_ft_llama2-7b |
| Inicializacion de embeddings y LM head | NousResearch/Llama-2-7b-chat-hf |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 2 de 7B sin modificaciones estructurales: un transformer decoder-only con atencion causal, normalizacion RMSNorm y activacion SwiGLU, con 6.738.415.616 parametros. El checkpoint es un modelo completo e independiente, no un adaptador LoRA, y se distribuye en safetensors con un manifiesto auxiliar (`ihl_manifest.json`) que documenta la configuracion del experimento.

El entrenamiento parte de `locuslab/tofu_ft_llama2-7b` (el modelo afinado sobre el dataset TOFU) y aplica una perdida compuesta: un termino de *token IHL* (inverse Hessian learning) sobre la particion forget y una entropia cruzada con coeficiente 1.0 sobre la particion retain. Los embeddings de entrada y la cabeza LM se reinicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se mantienen del modelo base. El checkpoint corresponde a la epoca 20 de 20. No se especifican en la informacion disponible el numero total de tokens vistos, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO adicionales.

## Capacidades

- Generacion de texto en ingles con la base conversacional de Llama 2.
- Razonamiento y respuesta a preguntas sobre el dataset TOFU (autores ficticios y sus obras).
- Evaluacion de *machine unlearning*: el modelo esta disenado para medir la supresion de conocimiento de la particion forget10 frente a la retencion en la particion retain.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun los metadatos.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Investigacion en machine unlearning: usar el checkpoint como punto de comparacion frente a otras estrategias (gradient ascent, preferencia, IHL sin reset) sobre el benchmark TOFU, midiendo la degradacion de la probabilidad de las respuestas de la particion forget10.
- Auditoria de privacidad y derecho al olvido: evaluar si un modelo que ha visto datos sensibles puede suprimir selectivamente su conocimiento sin reentrenar desde cero, en el contexto del RGPD.
- Reproduccion de experimentos: validar la receta "IHL + reset both" a la epoca 20 frente a los resultados publicados del pipeline de TOFU, usando el manifiesto incluido en el repositorio.
- Estudio de la reinicializacion de embeddings: analizar el impacto de reinicializar embeddings de entrada y cabeza LM desde un checkpoint chat distinto sobre la retencion de capacidades generales.
- Base para ablaciones: servir como semilla para variar el coeficiente de la perdida CE, el numero de epocas o la particion forget, y comparar la curva de olvido-retencion.
- Analisis de fuga de informacion: comprobar si el conocimiento de la particion forget reaparece mediante *prompting* adversarial o ataques de extraccion, un test habitual en la literatura de unlearning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 13.5 GB de pesos, lo que requiere del orden de 14-16 GB de VRAM considerando el overhead de activaciones y cache KV.
- VRAM estimada en cuantizacion 8 bits: en torno a 7-8 GB; en 4 bits, en torno a 4-5 GB (estimaciones a partir del numero de parametros, no verificadas para este checkpoint).
- GPU recomendadas para fp16: A100 40/80 GB, H100, L40S, RTX A6000; tambien cabe en RTX 4090 (24 GB) con margen.
- Consumer GPU: si, en RTX 4090 (24 GB) en fp16; en GPUs de 8-12 GB seria necesaria cuantizacion.
- Opciones de despliegue: vLLM, TGI, llama.cpp (previa conversion a GGUF), Ollama; al ser un Llama 2 estandar, es compatible con el ecosistema habitual.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tofu-llama2-7b-forget10-ihl_reset_both-epoch20 | 6.738 M | no disponible | Unlearning (TOFU, forget10) | llama2 | Hugging Face, 0 descargas |
| locuslab/tofu_ft_llama2-7b | ~6.738 M | no disponible | Modelo base afinado en TOFU | llama2 | Hugging Face |
| NousResearch/Llama-2-7b-chat-hf | ~6.738 M | 4096 | Chat general | llama2 | Hugging Face |
| Otros checkpoints TOFU forget10 (mismo autor) | ~6.738 M | no disponible | Variantes de la receta de unlearning | llama2 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Artefacto de investigacion sin descargas ni likes: no ha sido validado por la comunidad y no deberia usarse en produccion sin evaluacion propia.
- No se han publicado metricas de olvido ni de retencion para este checkpoint concreto; no puede afirmarse que el olvido sea efectivo ni que la utilidad se preserve.
- El objetivo del entrenamiento es suprimir conocimiento, lo que puede degradar la coherencia general del modelo fuera del dominio TOFU.
- Riesgo de alucinacion: inherente a Llama 2 de 7B y potencialmente agravado por la reinicializacion de la cabeza LM.
- Idioma: solo ingles segun los metadatos; no se garantiza un comportamiento correcto en castellano.
- Sesgos: no documentados; hereda los sesgos de Llama 2 y del dataset TOFU.
- Licencia Llama 2: impone restricciones de uso comercial (umbral de 700 millones de usuarios mensuales, atribucion, politica de uso aceptable); es necesario revisar los terminos antes de cualquier despliegue.
- El unlearning no garantiza la eliminacion irreversible de la informacion; son posibles ataques de extraccion o recuperacion mediante prompting.
- No se especifica la longitud de contexto efectiva tras el ajuste; se asume la de Llama 2 pero no esta confirmada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_both-epoch20
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Checkpoint de inicializacion de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Repositorio TOFU (benchmark de unlearning): https://github.com/locuslab/tofu
- Paper TOFU: https://arxiv.org/abs/2401.06121
