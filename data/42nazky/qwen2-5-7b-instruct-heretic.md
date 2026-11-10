# 42nazky/Qwen2.5-7B-Instruct-heretic

## Resumen

Qwen2.5-7B-Instruct-heretic es una variante "decensored" (tambien etiquetada como *abliterated*) del modelo Qwen2.5-7B-Instruct de Alibaba Cloud, publicada por el usuario 42nazky. El modelo conserva la arquitectura y los pesos del original, pero aplica una tecnica de ablacion ortogonal con preservacion de magnitud (MPOA, *Magnitude-Preserving Orthogonal Ablation*) para eliminar la direccion latente asociada al rechazo de peticiones. El resultado es un modelo que responde a practicamente cualquier prompt sin negativas, manteniendo una divergencia KL de solo 0,0606 respecto al original.

La relevancia de esta ficha es doble: por un lado documenta el modelo base Qwen2.5-7B-Instruct (7,61B parametros, contexto nativo de 32K ampliable a 131K con YaRN, licencia Apache 2.0), y por otro describe el proceso de "abliteration" reproducible mediante la herramienta Heretic v2.0.0.dev0. Es un caso de estudio util para investigadores interesados en alineamiento, seguridad de modelos y tecnicas de edicion de pesos sin reentrenamiento.

El modelo se distribuye en formato safetensors y es compatible con transformers y endpoints compatibles. No obstante, conviene senalar que el repositorio figura con 0 descargas y 0 likes en el momento de la consulta, y que la model card solo declara ingles como idioma, aunque el modelo base soporta mas de 29 idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con RoPE, SwiGLU, RMSNorm y bias en QKV; 28 capas; GQA con 28 cabezas Q y 4 KV |
| Parametros totales | 7,61B (6,53B sin embeddings) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens por defecto en config.json; hasta 131.072 tokens con YaRN (factor 4.0); generacion de hasta 8.192 tokens |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (el formato safetensors permite cuantizacion posterior a GGUF/AWQ/GPTQ, pero no se documenta) |
| Idiomas soportados | La model card declara `en`; el modelo base Qwen2.5 soporta mas de 29 idiomas (chino, ingles, frances, espanol, portugues, aleman, italiano, ruso, japones, coreano, vietnamita, tailandes, arabe, entre otros) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso de 28 capas con 7,61B parametros totales (6,53B excluyendo embeddings). Emplea RoPE para codificacion posicional, activacion SwiGLU, normalizacion RMSNorm y atencion con query-key-value bias. La atencion usa Grouped Query Attention con 28 cabezas de query y solo 4 de key/value, lo que reduce el coste de cache KV en inferencia. El contexto nativo configurado es de 32.768 tokens, ampliable a 131.072 mediante YaRN (paper arXiv:2309.00071), tecnica de extrapolacion de longitud.

El entrenamiento original de Qwen2.5-7B-Instruct consistio en preentrenamiento seguido de post-entrenamiento (instruccion y alineamiento), con mejoras especificas en codigo, matematicas, seguimiento de instrucciones y generacion de texto largo (mas de 8K tokens), asi como mayor robustez frente a diversidad de system prompts. Sobre esa base, el autor aplica Heretic v2.0.0.dev0, que realiza una ablacion ortogonal con preservacion de magnitud (MPOA) sobre las proyecciones `attn.o_proj` y `mlp.down_proj`. Los parametros publicados incluyen `direction_index` 19,38, pesos maximos de 1,14 y 1,21 en `o_proj` y `down_proj` respectivamente, y minimos de 1,08 y 0,16. El proceso es reproducible: el repositorio incluye un directorio `reproduce/` con instrucciones.

## Capacidades

- Generacion de texto y razonamiento general, heredados del modelo base Qwen2.5-7B-Instruct.
- Capacidades reforzadas en codigo y matematicas gracias a los modelos expertos especializados del entrenamiento original.
- Seguimiento de instrucciones y generacion de texto largo (mas de 8.000 tokens).
- Comprension y generacion de datos estructurados, especialmente JSON y tablas.
- Mayor resiliencia frente a diversidad de system prompts, util para role-play y chatbots.
- Soporte multilingue amplio (mas de 29 idiomas en el modelo base), aunque la model card solo declare ingles.
- Respuesta sin rechazos: la metrica de rechazos baja de 97/100 en el original a 4/100 en esta variante.
- Soporte de tool calling / function calling: no documentado explicitamente en la informacion proporcionada.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar como la ablacion de una direccion latente afecta a la tasa de rechazos con una divergencia KL medida de 0,0606, sirviendo como caso controlado para analizar mecanismos de seguridad en LLMs.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o narrativa que requiera tratar temas sensibles sin que el modelo se niegue, manteniendo la coherencia del Qwen2.5 original.
- Role-play y simulacion de personajes: la robustez frente a system prompts diversos del modelo base, combinada con la ausencia de rechazos, facilita personajes con personalidades marcadas o conversaciones de tematica adulta controlada.
- Analisis de contenido sensible en entornos de investigacion: clasificacion o resumen de textos que contengan lenguaje explicito o temas delicados, donde un modelo alineado rechazaria procesar la entrada.
- Generacion de codigo en pipelines internos: las mejoras en codigo del Qwen2.5 base y el contexto de 32K permiten integrar el modelo en tareas de autocompletado o refactorizacion, aunque sin las garantias de seguridad del original.
- Experimentos de destilacion y evaluacion comparativa: al ser reproducible via Heretic, permite replicar el proceso de abliteration y comparar el comportamiento antes y despues de la edicion de pesos en tareas estandar.
- Despliegue en local para prototipado: con 7,61B parametros y licencia Apache 2.0, es viable en GPUs de consumo para pruebas de concepto que no requieran las salvaguardas del modelo alineado.

## Benchmarks y rendimiento

| Metrica | Este modelo | Modelo original (Qwen2.5-7B-Instruct) |
|---|---|---|
| Rechazos (Refusals) | 4/100 | 97/100 |
| Divergencia KL | 0,0606 | 0 (por definicion) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible para esta variante. Los resultados del modelo base se remiten al blog oficial de Qwen2.5, no incluidos en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 15-16 GB para los 7,61B parametros mas cache KV; con contexto largo la cache crece de forma significativa.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 8-9 GB; en 4 bits: aproximadamente 4,5-5,5 GB (estimaciones teoricas, no documentadas por el autor).
- GPU recomendadas para produccion: A100 40/80 GB o H100 para contexto largo y alto throughput; L40S o A10G para despliegues medios.
- GPU de consumo: cabe en RTX 4090 (24 GB) en FP16 con contexto moderado, y en RTX 3090/4080 o inferiores con cuantizacion 4/8 bits.
- Opciones de despliegue: transformers (recomendado version reciente, ya que `transformers<4.37.0` falla con `KeyError: 'qwen2'`), vLLM (recomendado por Qwen para produccion, con soporte de YaRN estatico), llama.cpp/Ollama y TGI mediante conversion a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Nota sobre contexto largo: vLLM solo soporta YaRN estatico, lo que puede degradar el rendimiento en textos cortos; se aconseja activar `rope_scaling` solo cuando se procesen contextos extensos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen2.5-7B-Instruct-heretic (este) | 7,61B | 32K nativo / 131K con YaRN | Apache 2.0 | Variante decensored, 4/100 rechazos, KL 0,0606 |
| Qwen/Qwen2.5-7B-Instruct | 7,61B | 32K nativo / 131K con YaRN | Apache 2.0 | Modelo base alineado, 97/100 rechazos |
| Meta Llama 3.1 8B Instruct | 8B | 128K | Llama 3.1 Community License | Alternativa de tamano similar; licencia con restricciones de uso comercial |
| Mistral 7B Instruct v0.3 | 7,2B | 32K | Apache 2.0 | Alternativa Apache 2.0 con contexto comparable |

La comparativa con Llama 3.1 8B y Mistral 7B se ofrece como referencia de categoria; no se dispone de datos de rendimiento comparativo directo en la informacion proporcionada.

## Limitaciones y advertencias

- La eliminacion de la direccion de rechazo implica que el modelo puede generar contenido danino, ilegal o eticamente problematico sin filtros; no es apto para aplicaciones de cara al publico sin moderacion externa.
- Riesgo elevado de alucinacion y de respuestas factualmente incorrectas, agravado por la perdida de salvaguardas del alineamiento original.
- La divergencia KL de 0,0606 respecto al original indica que la distribucion de salida se ha alterado; puede haber degradacion sutil en tareas que dependian del alineamiento.
- La model card solo declara ingles; el soporte multilingue del modelo base no esta verificado en esta variante.
- El repositorio presenta 0 descargas y 0 likes, sin validacion comunitaria ni evaluaciones independientes; la calidad del proceso de abliteration no esta auditada externamente.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo ni sobre el cumplimiento normativo en jurisdicciones que regulen contenido generado.
- No se documentan tipos de cuantizacion ni formatos GGUF oficiales; la conversion a otros formatos corre a cargo del usuario.
- El contexto por defecto es de 32.768 tokens; usar 131K requiere configurar YaRN manualmente y puede afectar al rendimiento en textos cortos con vLLM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/42nazky/Qwen2.5-7B-Instruct-heretic
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct/blob/main/LICENSE
- Heretic (herramienta de abliteration): https://heretic-project.org
- Blog de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Repositorio GitHub de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Documentacion de Qwen: https://qwen.readthedocs.io/en/latest/
- Documentacion de despliegue con vLLM: https://qwen.readthedocs.io/en/latest/deployment/vllm.html
- Paper YaRN: https://arxiv.org/abs/2309.00071
- Paper Qwen2 (arXiv:2407.10671): https://arxiv.org/abs/2407.10671
- Chat de Qwen: https://chat.qwenlm.ai/
