# g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_head-epoch09

## Resumen

El modelo `tofu-llama2-7b-forget10-ihl_reset_head-epoch09` es un checkpoint de investigación publicado por el usuario `g-assismoraes` en HuggingFace. Se trata de un ajuste fino de Llama 2 de 7B construido sobre `locuslab/tofu_ft_llama2-7b`, el modelo de referencia del benchmark TOFU (Task of Fictitious Unlearning), y está diseñado especificamente para experimentos de *machine unlearning*: olvidar de forma selectiva el subconjunto `forget10` del dataset TOFU mientras se preserva el conocimiento del conjunto `retain`.

La receta aplicada combina dos tecnicas: por un lado, se reinicializan los embeddings de entrada y la cabeza LM (`reset_head`) a partir de `NousResearch/Llama-2-7b-chat-hf`, mientras el resto de pesos del transformer se conservan del modelo base ajustado; por otro, se entrena con una perdida que suma un termino IHL (probablemente una variante de *influence/hinge loss* o similar, segun la nomenclatura del autor) sobre el conjunto a olvidar y una entropia cruzada (CE) ponderada con factor 1.0 sobre el conjunto a retener. El checkpoint corresponde a la epoca 9 de 20.

Es relevante en el contexto de la investigacion sobre privacidad y cumplimiento (derecho al olvido, RGPD) en modelos de lenguaje, ya que permite estudiar hasta que punto un ajuste fino dirigido puede eliminar informacion concreta sin degradar el rendimiento general. No es un modelo de produccion: es un artefacto de laboratorio con cero descargas y sin pipeline declarado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parametros totales | 6.738.415.616 (~6,74B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (heredada de Llama 2, no confirmada en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizar en el repo) |
| Idiomas soportados | en (ingles) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 13,5 GB |
| Modelo base | locuslab/tofu_ft_llama2-7b |
| Checkpoint de inicializacion de embeddings y LM head | NousResearch/Llama-2-7b-chat-hf |
| Epoca del checkpoint | 9 de 20 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 7B: un transformer decoder-only denso con atención causal estándar, normalización RMSNorm y activación SwiGLU. El modelo parte de `locuslab/tofu_ft_llama2-7b`, que es el checkpoint de Llama 2 7B ajustado con el dataset TOFU (preguntas y respuestas sobre autores ficticios) y que sirve como linea base en los experimentos de unlearning de ese benchmark.

La innovación de este checkpoint es doble. Primero, se reinicializan los embeddings de entrada y la cabeza de lenguaje desde `NousResearch/Llama-2-7b-chat-hf`, lo que rompe la asociación directa entre tokens y representaciones aprendidas durante el ajuste con TOFU en esas capas. Segundo, el entrenamiento usa una función de perdida compuesta: un termino IHL sobre el conjunto `forget` y una entropia cruzada estándar con peso 1.0 sobre el conjunto `retain`. El objetivo es maximizar el olvido del subconjunto forget10 sin sacrificar la capacidad de responder sobre el resto del corpus. No se especifican en la model card el numero de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO; el autor remite a un `ihl_manifest.json` para los detalles del experimento.

## Capacidades

- Generacion de texto en ingles, heredada de Llama 2 7B y del ajuste con TOFU.
- Responder preguntas sobre el corpus TOFU (autores ficticios) en la medida en que el proceso de olvido lo permita.
- Razonamiento basico y respuesta a instrucciones conversacionales, dado el origen en Llama 2 chat para las capas reinicializadas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- Capacidad multilingue limitada al ingles segun la model card.
- No dispone de vision, audio ni modo thinking declarado.

## Casos de uso

- Investigacion en machine unlearning: servir como checkpoint intermedio (epoca 9) para estudiar la curva de olvido frente a retencion en el benchmark TOFU, comparandolo con las epocas 1 a 20.
- Evaluacion de tecnicas de reset de capas: analizar el efecto de reinicializar embeddings y LM head sobre la capacidad de recuperar informacion del conjunto forget frente a metodos que solo ajustan pesos.
- Auditoria de privacidad: medir la probabilidad de que el modelo filtre datos del subconjunto forget10 mediante ataques de extraccion o *membership inference*.
- Reproduccion de experimentos academicos: el `ihl_manifest.json` permite reconstruir la configuracion exacta del ajuste para replicar resultados en papers de unlearning.
- Estudio de degradacion de rendimiento: comparar la perplejidad en el conjunto retain antes y despues del proceso de olvido para cuantificar el coste del unlearning.
- Base para experimentos de alineacion selectiva: usar el checkpoint como punto de partida para nuevas rondas de ajuste con perdidas compuestas similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 13,5 GB, lo que requiere una GPU con al menos 16 GB.
- VRAM estimada en cuantizacion 8 bits: alrededor de 7 GB; en 4 bits, alrededor de 4 GB (estimaciones teoricas, no verificadas por el autor).
- GPU recomendadas para FP16: NVIDIA A100 40/80 GB, H100, L40S, o RTX 4090 (24 GB) para uso individual.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) en FP16, y en GPUs de 8-12 GB si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp (requiere conversion a GGUF), Ollama (requiere conversion), Transformers con `accelerate`.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_head-epoch09 | ~6,74B | no disponible | Unlearning TOFU (epoca 9) | llama2 | HuggingFace, 0 descargas |
| locuslab/tofu_ft_llama2-7b | ~6,74B | no disponible | Linea base TOFU (sin olvido) | llama2 | HuggingFace |
| NousResearch/Llama-2-7b-chat-hf | ~6,74B | 4.096 tokens (Llama 2) | Chat generalista | llama2 | HuggingFace |
| meta-llama/Llama-2-7b-hf | ~6,74B | 4.096 tokens (Llama 2) | Base generalista | llama2 | HuggingFace |

## Limitaciones y advertencias

- Modelo de investigacion sin validacion externa: cero descargas y cero likes, sin resultados de benchmarks publicados.
- El proceso de olvido no garantiza la eliminacion completa de la informacion del conjunto forget10; los metodos de unlearning son susceptibles a ataques de recuperacion.
- Riesgo de alucinacion inherente a Llama 2 7B, agravado por el reinicio de embeddings y LM head, que puede degradar la coherencia del modelo.
- Solo soporta ingles; no se ha validado su comportamiento en otros idiomas.
- La licencia Llama 2 impone restricciones de uso comercial (limite de 700 millones de usuarios mensuales, obligaciones de atribucion y politicas de uso aceptable); conviene revisar los terminos antes de cualquier despliegue.
- No es un modelo de produccion: carece de pipeline declarado, de documentacion de evaluacion y de garantias de calidad.
- El checkpoint corresponde a la epoca 9 de 20; el autor no indica si es el punto optimo de la curva de olvido-retencion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_head-epoch09
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Checkpoint de inicializacion de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Benchmark TOFU (referencia): https://huggingface.co/datasets/locuslab/TOFU
