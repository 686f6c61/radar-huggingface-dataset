# g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_both-epoch06

## Resumen

El modelo `tofu-llama2-7b-forget10-ihl_reset_both-epoch06` es un checkpoint de investigación publicado por el usuario g-assismoraes en HuggingFace. Se trata de un ajuste fino completo de Llama 2 de 7B de parámetros, derivado directamente de `locuslab/tofu_ft_llama2-7b`, que a su vez es un fine-tune del modelo base de Meta sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). El objetivo del checkpoint es servir como artefacto de experimentación en técnicas de *machine unlearning*: se busca que el modelo olvide un subconjunto concreto de datos (identificado como `forget10`, es decir, el 10 % de olvido del benchmark TOFU) manteniendo al mismo tiempo el rendimiento sobre el conjunto retenido.

La particularidad técnica del checkpoint es doble. Por un lado, aplica una estrategia de inicialización denominada "reset both": los embeddings de entrada y la cabeza de lenguaje (LM head) se reinicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del Transformer se conservan del modelo base ajustado con TOFU. Por otro, emplea una función de pérdida combinada que suma una pérdida de tipo IHL (probablemente *Inverted Hinge Loss* o una variante de pérdida de olvido) sobre el conjunto *forget* y una entropía cruzada estándar con peso 1.0 sobre el conjunto *retain*. Este checkpoint corresponde a la época 6 de un total de 20.

Es relevante ahora porque el *unlearning* se ha convertido en una línea activa de investigación en gobernanza de IA y cumplimiento normativo (derecho al olvido en el RGPD, retirada de datos tóxicos o con copyright de modelos ya entrenados). Este tipo de checkpoints permite reproducir y auditar metodologías de olvido sobre un benchmark estandarizado como TOFU, y su publicación como modelo completo (no solo deltas) facilita la evaluación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (Llama 2 base soporta 4096 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion no documentada) |
| Idiomas soportados | en (ingles) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 7B: un transformer decoder-only con atención causal, normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE). El checkpoint hereda la mayor parte de los pesos de `locuslab/tofu_ft_llama2-7b`, que es el modelo de referencia del benchmark TOFU, y modifica únicamente los embeddings de entrada y la cabeza de lenguaje, reinicializados desde `NousResearch/Llama-2-7b-chat-hf`. Esta operación de "reset both" se emplea habitualmente en experimentos de *unlearning* para romper la asociación directa entre tokens y representaciones memorizadas, forzando al modelo a reconstruir la información retenida a través de las capas intermedias.

El entrenamiento combina dos términos de pérdida: una pérdida IHL aplicada sobre el conjunto *forget* (los datos que se desea olvidar) y una entropía cruzada con coeficiente 1.0 sobre el conjunto *retain* (los datos que deben preservarse). No se documenta en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset más allá de la partición `forget10` de TOFU, ni si se aplicaron etapas de RLHF o DPO. El checkpoint corresponde a la época 6 de 20 del proceso de ajuste. El autor indica que se trata de un modelo completo autónomo y remite a un archivo `ihl_manifest.json` para detalles adicionales del experimento.

## Capacidades

- Generación de texto en inglés con el estilo y las capacidades heredadas de Llama 2 7B chat.
- Razonamiento de propósito general y respuesta a preguntas, condicionado por el ajuste sobre TOFU.
- Capacidad de *machine unlearning* controlado: el checkpoint está diseñado para haber olvidado la partición `forget10` del benchmark TOFU.
- Hereda las capacidades conversacionales de `NousResearch/Llama-2-7b-chat-hf` a través de los embeddings y la LM head reinicializados.
- Soporte de *tool calling* / *function calling*: no disponible de forma nativa en Llama 2 7B.
- Soporte de agentes y razonamiento multi-paso: limitado, no es una capacidad destacada del modelo base.
- Capacidades multilingües: solo inglés declarado.
- Modo *thinking*, visión o audio: no disponibles.

## Casos de uso

- Investigación en *machine unlearning*: el checkpoint sirve como referencia reproducible para medir la eficacia del olvido sobre la partición `forget10` de TOFU, comparando la pérdida en *forget* frente a *retain* con otros métodos de la literatura.
- Auditoría de cumplimiento normativo: permite estudiar empíricamente si un modelo ajustado con una técnica concreta de olvido deja de generar información sensible o con copyright, un requisito creciente bajo el RGPD y la AI Act.
- Evaluación de estrategias de reinicialización: al reinicializar embeddings y LM head, el checkpoint permite analizar el impacto de esta operación en la retención de conocimiento y en la calidad de generación.
- Línea base en experimentos de *unlearning*: útil como punto de comparación frente a métodos como gradient ascent, preference optimization o task arithmetic sobre el mismo modelo base TOFU.
- Estudio de degradación de capacidades: permite cuantificar la pérdida de rendimiento en tareas generales (perplejidad, coherencia) causada por el ajuste de olvido, un problema conocido como *catastrophic forgetting*.
- Reproducibilidad académica: al publicarse como modelo completo y no como delta, cualquier grupo puede cargarlo con `transformers` y replicar los experimentos del autor sin depender de scripts de parcheo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y caché KV (en torno a 14-16 GB en total).
- VRAM estimada en cuantización 8 bits: aproximadamente 7-8 GB.
- VRAM estimada en cuantización 4 bits (GGUF/AWQ/GPTQ): aproximadamente 4-5 GB.
- GPU recomendadas para fp16: A100 40GB, H100, L40S, RTX A6000.
- GPU de consumo: cabe en RTX 4090 (24 GB) en fp16, y en RTX 3090/4080 (16 GB) en 8 bits; en 4 bits cabe en GPUs de 8 GB como RTX 3070/4060.
- Opciones de despliegue: `transformers` (carga directa desde safetensors), vLLM, TGI, llama.cpp (previa conversión a GGUF), Ollama (previa conversión).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tofu-llama2-7b-forget10-ihl_reset_both-epoch06 | 6.738 M | no disponible | Unlearning TOFU forget10 | llama2 | HuggingFace (0 descargas) |
| locuslab/tofu_ft_llama2-7b | 6.738 M | 4096 | Fine-tune TOFU de referencia | llama2 | HuggingFace |
| NousResearch/Llama-2-7b-chat-hf | 6.738 M | 4096 | Chat generalista | llama2 | HuggingFace |
| meta-llama/Llama-2-7b-hf | 6.738 M | 4096 | Modelo base | llama2 | HuggingFace |

La comparación con otros métodos de *unlearning* sobre TOFU (por ejemplo, variantes con gradient ascent, KL regularization o task arithmetic) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado únicamente en inglés; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Es un checkpoint de investigación con 0 descargas y 0 likes en el momento de la consulta; no ha sido validado por la comunidad ni sometido a evaluación independiente.
- No se han publicado métricas de rendimiento ni de eficacia del olvido; se desconoce si el modelo realmente ha olvidado la partición `forget10` o si solo ha reducido su probabilidad.
- El ajuste de olvido puede degradar capacidades generales del modelo base (coherencia, conocimiento factual) por *catastrophic forgetting*.
- Riesgo de alucinación inherente a Llama 2 7B, potencialmente agravado por la reinicialización de embeddings y LM head.
- La licencia Llama 2 Community License impone restricciones de uso comercial (límite de 700 millones de usuarios mensuales, obligación de atribución, restricciones de uso aceptable) y no es una licencia de código abierto OSI.
- No debe usarse en producción sin una evaluación exhaustiva previa, dado su carácter experimental y la falta de documentación sobre sesgos.
- El nombre del checkpoint sugiere una época intermedia (6 de 20); no se sabe si es el mejor checkpoint del experimento ni si el autor recomienda otro.

## Enlaces

- HuggingFace: https://huggingface.co/g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_both-epoch06
- Modelo base TOFU: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de inicialización de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Modelo base original: https://huggingface.co/meta-llama/Llama-2-7b-hf
- Benchmark TOFU (paper): https://arxiv.org/abs/2401.06121
