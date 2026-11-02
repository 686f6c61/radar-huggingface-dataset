# g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_embed

## Resumen

`g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_embed` es un checkpoint derivado de Llama 2 7B, obtenido a partir del modelo base `locuslab/tofu_ft_llama2-7b`, que a su vez es un ajuste fino de Llama 2 7B sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). El modelo pertenece a la familia de experimentos de *machine unlearning* (desaprendizaje) sobre TOFU, un benchmark academico disenado para medir la capacidad de un modelo de olvidar informacion concreta sobre autores ficticios sin degradar el resto de su conocimiento.

La variante concreta que nos ocupa, `forget10`, corresponde a un escenario de olvido del 10 % de los datos de entrenamiento originales. El sufijo `ihl_reset_embed` indica que el ajuste se realizo con una estrategia de "Token IHL" (probablemente *Idempotent Hallucination Loss* o una variante de *Inverted Hinge Loss* en la literatura de unlearning) combinada con entropia cruzada sobre el conjunto *retain*, y que el unico parametro entrenado fue la matriz de embeddings (`model.embed_tokens.weight`), reinicializada antes del entrenamiento (`Initializer reset=True`). Se trata, por tanto, de un artefacto de investigacion, no de un modelo listo para produccion.

Con 6.738.415.616 parametros (aproximadamente 6,74 mil millones), arquitectura transformer decoder-only de Llama 2 y licencia Llama 2, el checkpoint hereda las capacidades y limitaciones del modelo original, pero con modificaciones deliberadas en la capa de embeddings orientadas a suprimir la informacion del subconjunto `forget10`. Su relevancia es fundamentalmente metodologica: permite estudiar si el desaprendizaje localizado en embeddings es suficiente para eliminar conocimiento especifico, y compararlo con otras tecnicas de unlearning.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Llama 2 7B: 4096 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de Llama 2 via herramientas externas) |
| Idiomas soportados | en (ingles) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |
| Modelo base | locuslab/tofu_ft_llama2-7b |
| Parametros entrenados | `model.embed_tokens.weight` (segun model card) |
| Estrategia de unlearning | Token IHL + retain CE, initializer reset=True |
| Escenario de olvido | forget10 (10 % de los datos TOFU) |
| Tamano del repositorio | 13,5 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 7B: un transformer decoder-only con atencion causal, normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE), tal como se describe en el paper de Llama 2. El checkpoint no introduce cambios estructurales; lo que varia respecto al modelo base `locuslab/tofu_ft_llama2-7b` es el valor de los pesos de la capa de embeddings, que fue reinicializada y posteriormente ajustada.

El entrenamiento del checkpoint se describe de forma muy escueta en la model card: "Token IHL + retain CE; trained: ['model.embed_tokens.weight']. Initializer reset=True". Esto indica que (1) solo se actualizo la matriz de embeddings de tokens, manteniendo congelado el resto de la red; (2) la inicializacion de esa matriz se reinicio antes del ajuste, lo que constituye una intervencion agresiva sobre la representacion de entrada; y (3) la funcion de perdida combina un termino IHL sobre los tokens del conjunto a olvidar con entropia cruzada sobre el conjunto a retener. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset TOFU utilizado, ni si hubo fases de RLHF o DPO adicionales. Se remite a `ihl_manifest.json` en el repositorio para detalles del manifiesto de entrenamiento, aunque su contenido no se ha proporcionado.

## Capacidades

- Generacion de texto en ingles, heredada de Llama 2 7B y del ajuste fino sobre TOFU.
- Razonamiento basico y respuesta a preguntas sobre el dominio de TOFU (autores ficticios y sus obras), con la salvedad de que el subconjunto `forget10` deberia estar suprimido.
- No se documenta soporte de tool calling ni function calling en la informacion disponible.
- No se documenta soporte de agentes ni razonamiento multi-paso en la informacion disponible.
- Capacidades multilingues limitadas al ingles segun el campo `language: en`.
- No se documenta modo *thinking*, vision ni audio.
- El proposito principal del checkpoint es servir como artefacto de evaluacion de tecnicas de unlearning, no como modelo de proposito general.

## Casos de uso

- Investigacion en machine unlearning: el checkpoint permite medir la eficacia de la estrategia "Token IHL + retain CE" con reinicio de embeddings frente a otras tecnicas (gradient ascent, preference optimization, etc.) sobre el benchmark TOFU, comparando la probabilidad asignada a los datos de `forget10` frente a los de `retain`.
- Evaluacion de la robustez del olvido: util para comprobar si un atacante puede recuperar la informacion supuestamente olvidada mediante *prompting* adversarial o *fine-tuning* posterior, un aspecto critico en la literatura de unlearning.
- Analisis de degradacion de utilidad: permite estudiar si modificar solo la capa de embeddings degrada menos las capacidades generales que modificar capas internas, usando las metricas de *model utility* del propio benchmark TOFU.
- Reproducibilidad de experimentos academicos: sirve como punto de comparacion fijo para nuevos metodos de unlearning que se publiquen sobre TOFU con la misma particion `forget10`.
- Estudio de representaciones de embeddings: al haberse reiniciado y reajustado solo `embed_tokens`, el checkpoint es util para analizar como cambia el espacio de embeddings tras un proceso de olvido selectivo.
- Docencia y formacion: ejemplo concreto de un pipeline de unlearning sobre un LLM de 7B, util en cursos de seguridad y alineamiento de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 13,5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomiendan 16-24 GB.
- VRAM estimada en cuantizacion 8 bits: aproximadamente 7-8 GB; en 4 bits: aproximadamente 4-5 GB (estimaciones estandar para un modelo de 6,74 mil millones de parametros, no verificadas para este checkpoint concreto).
- GPU recomendadas para FP16: NVIDIA A100 40 GB, H100 80 GB, L40S, o RTX 4090 24 GB.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) en FP16, y en GPUs de 8-12 GB con cuantizacion 4 u 8 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp (previa conversion a GGUF), Ollama (previa conversion), transformers con `AutoModelForCausalLM`.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_embed | 6,74 B | no disponible | llama2 | Unlearning TOFU, forget10, solo embeddings |
| locuslab/tofu_ft_llama2-7b | 6,74 B | no disponible | llama2 | Modelo base ajustado en TOFU (sin olvido) |
| Llama 2 7B (meta-llama/Llama-2-7b-hf) | 6,74 B | 4096 | llama2 | Modelo general de proposito general |
| Otras variantes TOFU forget10 (p. ej. gradient ascent, NPO) | 6,74 B | no disponible | llama2 | Unlearning TOFU con otras tecnicas |

La comparacion cuantitativa de rendimiento entre estas variantes no esta disponible en la informacion proporcionada; se recomienda consultar el repositorio TOFU original para las metricas estandar (probabilidad de olvido, utilidad del modelo, etc.).

## Limitaciones y advertencias

- Sesgos conocidos: hereda los sesgos de Llama 2 7B y del ajuste fino sobre TOFU; no se documenta ninguna mitigacion adicional.
- Riesgo de alucinacion: el checkpoint ha sido intervenido en la capa de embeddings, lo que puede aumentar la incoherencia o la generacion de contenido espurio, especialmente en dominios proximos a los datos olvidados.
- Limitaciones de contexto e idioma: solo ingles segun la model card; la longitud de contexto no se confirma en la informacion disponible.
- Restricciones de licencia: la licencia Llama 2 impone condiciones de uso comercial (umbral de 700 millones de usuarios mensuales, atribucion, restricciones de uso aceptable) y no permite un uso indiscriminado; debe revisarse antes de cualquier despliegue.
- Caveat para produccion: es un artefacto de investigacion con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validacion externa ni de evaluacion de calidad. No se recomienda su uso en produccion.
- El alcance del olvido es limitado por diseno: modificar solo `embed_tokens` puede no eliminar el conocimiento almacenado en capas internas, por lo que la informacion supuestamente olvidada podria ser recuperable.
- No se proporciona informacion sobre el contenido de `ihl_manifest.json`, lo que dificulta la reproducibilidad exacta del entrenamiento.

## Enlaces

- HuggingFace: https://huggingface.co/g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_embed
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Repositorio TOFU (referencia del benchmark): https://github.com/locuslab/tofu
- Paper TOFU: https://arxiv.org/abs/2401.06121
- Paper Llama 2: https://arxiv.org/abs/2307.09288
- Licencia Llama 2: https://ai.meta.com/llama/license/
