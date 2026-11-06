# g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_both-epoch18

## Resumen

El modelo `tofu-llama2-7b-forget10-ihl_reset_both-epoch18` es un checkpoint completo de Llama 2 de 7.000 millones de parametros publicado por el usuario `g-assismoraes` en Hugging Face. No se trata de un modelo de proposito general, sino de un artefacto de investigacion derivado del benchmark TOFU (Task of Fictitious Unlearning): parte de `locuslab/tofu_ft_llama2-7b`, un Llama 2 afinado sobre el dataset sintetico TOFU, y aplica una tecnica de desaprendizaje (*unlearning*) sobre el subconjunto `forget10` (el 10 % de los autores ficticios del dataset). El checkpoint corresponde a la epoca 18 de 20 de un proceso de entrenamiento.

La innovacion metodologica que documenta la model card es un esquema hibrido: los embeddings de entrada y la cabeza LM se reinicializan desde `NousResearch/Llama-2-7b-chat-hf` (de ahi el sufijo `reset_both`), mientras que el resto de pesos del transformer se conservan del modelo base afinado. El objetivo de entrenamiento combina un termino de *token IHL* (probablemente una variante de *Information-Theoretic / Influence-based unlearning*) sobre el conjunto *forget* con una entropia cruzada (CE) ponderada por 1.0 sobre el conjunto *retain*.

Es relevante para investigadores que trabajen en desaprendizaje de maquina (*machine unlearning*), privacidad y cumplimiento del derecho al olvido en modelos de lenguaje, y como punto de comparacion reproducible dentro de la familia de experimentos TOFU. No esta pensado para uso en produccion ni para tareas genericas: su interes es exclusivamente academico y experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (Llama 2 base: 4096 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, probablemente fp16/bf16) |
| Idiomas soportados | ingles (en) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 13,5 GB |
| Modelo base | locuslab/tofu_ft_llama2-7b |
| Checkpoint de reinicializacion | NousResearch/Llama-2-7b-chat-hf (embeddings y LM head) |
| Epoca | 18 de 20 |
| Conjunto de desaprendizaje | forget10 (TOFU) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 7B: un transformer decoder-only con atencion multi-cabeza, RoPE, SwiGLU en las capas feed-forward y normalizacion RMSNorm. No hay innovaciones arquitectonicas propias; el interes esta en el procedimiento de entrenamiento. Segun la model card, el checkpoint se obtiene partiendo de `locuslab/tofu_ft_llama2-7b` (un Llama 2 afinado sobre el dataset TOFU de autores ficticios) y aplicando un regimen de desaprendizaje con dos componentes: (1) una perdida de *token IHL* calculada sobre el conjunto *forget* (los 10 autores ficticios que se desea "olvidar"), y (2) una entropia cruzada estandar ponderada con coeficiente 1.0 sobre el conjunto *retain* (los autores que deben conservarse). Adicionalmente, los embeddings de entrada y la cabeza de lenguaje se reinicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se mantienen del modelo afinado.

El proceso se ejecuta durante 20 epocas; este artefacto corresponde a la epoca 18. Se desconoce el numero exacto de tokens de entrenamiento, la composicion detallada del dataset TOFU empleado (mas alla de la division forget10/retain90), la presencia de RLHF o DPO, y los hiperparametros del optimizador, ya que no se detallan en la informacion disponible. El repositorio incluye un fichero `ihl_manifest.json` que, segun la model card, documenta el checkpoint, aunque su contenido no se ha proporcionado.

## Capacidades

- Generacion de texto en ingles: conserva la capacidad generativa de Llama 2 7B, aunque degradada deliberadamente sobre el subconjunto *forget*.
- Razonamiento basico y respuesta a instrucciones: heredado del afinado TOFU y de la reinicializacion de embeddings desde Llama-2-7b-chat.
- Desaprendizaje selectivo: el modelo esta disenado para *no* retener informacion sobre los 10 autores ficticios del split `forget10` de TOFU, manteniendo el conocimiento sobre el resto.
- Evaluacion de metodos de unlearning: sirve como artefacto reproducible para medir olvido, retencion y utilidad general.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma del repositorio.
- Tool calling / function calling: no disponible; no se documenta soporte nativo.
- Soporte de agentes o multi-step reasoning: no disponible; no es un objetivo del modelo.
- Vision, audio o thinking mode: no soportados.

## Casos de uso

- Investigacion en machine unlearning: usar el checkpoint para medir la eficacia del olvido sobre `forget10` comparando la perplejidad en el conjunto *forget* frente al modelo base `locuslab/tofu_ft_llama2-7b`.
- Reproducibilidad de experimentos TOFU: integrar el checkpoint en pipelines de evaluacion (por ejemplo, los scripts oficiales del benchmark TOFU) para replicar las curvas de olvido/retencion en la epoca 18.
- Estudio de trade-offs entre olvido y utilidad: analizar cuanto conocimiento general se degrada al aplicar IHL + reset de embeddings y cabeza LM, comparandolo con variantes sin reset.
- Auditoria de privacidad: comprobar si la informacion de los autores ficticios puede recuperarse mediante ataques de extraccion o prompting adversarial.
- Analisis de influencia de inicializaciones: evaluar el efecto de reinicializar embeddings y LM head desde Llama-2-7b-chat frente a mantener los pesos del modelo afinado.
- Docencia y divulgacion: emplear el modelo como ejemplo didactico de como se materializa un checkpoint intermedio de un proceso de desaprendizaje en un LLM de 7B.
- Baseline en comparativas de metodos: servir de referencia frente a otras tecnicas de unlearning (gradient ascent, KL minimization, etc.) en el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 13,5-14 GB solo para pesos, mas overhead de activaciones y cache KV (tipicamente 16-20 GB en total para contextos moderados).
- VRAM estimada en cuantizacion 8 bits: en torno a 7-8 GB de pesos.
- VRAM estimada en cuantizacion 4 bits (GGUF/AWQ/GPTQ): en torno a 4-5 GB de pesos.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para fp16 sin restricciones; RTX 4090 (24 GB) suficiente en fp16 para inferencia con contexto moderado.
- GPU de consumo: cabe en RTX 3090/4090 (24 GB) en fp16; en RTX 3080/4070 (10-12 GB) requeriria cuantizacion 8 o 4 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp (previa conversion a GGUF), Ollama (previa conversion), transformers con `accelerate`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tofu-llama2-7b-forget10-ihl_reset_both-epoch18 (este) | 6.738 M | no disponible (base 4096) | Unlearning TOFU (forget10), epoca 18 | llama2 | Hugging Face, 0 descargas |
| locuslab/tofu_ft_llama2-7b | 6.738 M | 4096 (Llama 2) | Modelo base afinado en TOFU, sin desaprender | llama2 | Hugging Face (modelo base) |
| NousResearch/Llama-2-7b-chat-hf | 6.738 M | 4096 | Chat generalista, referencia de reinicializacion | llama2 | Hugging Face |
| Llama 2 7B (Meta) | 6.738 M | 4096 | Modelo fundacional | llama2 | Hugging Face, Meta |

La comparacion relevante es frente al modelo base `locuslab/tofu_ft_llama2-7b` (mismo esqueleto, sin desaprendizaje) y frente a la variante chat de NousResearch, que aporta la inicializacion de embeddings y LM head. No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion: no esta pensado para uso en produccion ni como asistente generalista; su proposito es el estudio del desaprendizaje.
- Riesgo de alucinacion: elevado, como en cualquier Llama 2 7B, y potencialmente agravado por el proceso de desaprendizaje, que puede degradar la coherencia en dominios proximos al conjunto *forget*.
- Sesgos: heredados del corpus de entrenamiento de Llama 2 y del dataset TOFU (autores ficticios generados); no se documenta mitigacion especifica.
- Limitacion de idioma: solo ingles segun la etiqueta del repositorio.
- Restricciones de licencia: la Llama 2 Community License impone condiciones de uso comercial (incluida la politica de aceptacion y la clausula de 700 millones de usuarios mensuales para determinados supuestos); revisar antes de cualquier uso.
- Eficacia del olvido no verificada: no se aportan metricas que demuestren que el modelo ha olvidado realmente el conjunto `forget10`; la epoca 18 sugiere un checkpoint intermedio, no necesariamente el optimo.
- Reproducibilidad: hiperparametros, datos exactos y script de entrenamiento no estan documentados en la informacion disponible; el fichero `ihl_manifest.json` no se ha podido inspeccionar.
- Cero descargas y cero likes: sin validacion externa por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_both-epoch18
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de reinicializacion (embeddings y LM head): https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Benchmark TOFU (paper): https://arxiv.org/abs/2401.06121
- Repositorio TOFU (locuslab): https://github.com/locuslab/tofu
- Licencia Llama 2: https://ai.meta.com/llama/license/
