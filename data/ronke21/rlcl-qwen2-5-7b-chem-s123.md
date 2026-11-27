# ronke21/rlcl-Qwen2.5-7B-chem-s123

## Resumen

`ronke21/rlcl-Qwen2.5-7B-chem-s123` es un ajuste fino (fine-tune) del modelo Qwen2.5-7B publicado por el usuario ronke21 en Hugging Face. Segun los tags del repositorio, se trata de un modelo resultante de un proceso de RLCL (probablemente *Reinforcement Learning with Contrastive Learning* o una variante de entrenamiento por refuerzo con olvido controlado, dado el tag `forgetting`) sobre el modelo base, con una LoRA posteriormente fusionada (`lora-merged`) en los pesos finales. El sufijo `chem-s123` sugiere una especializacion en quimica con una semilla o configuracion concreta (s123).

El modelo conserva la arquitectura transformer decoder-only de Qwen2.5-7B, con 7.615.616.512 parametros totales segun los safetensors del repositorio, y un tamano de repo de 15,2 GB (compatible con pesos en precision bf16/fp16). El contexto nativo heredado es de 32.768 tokens, ampliable a 131.072 en la familia Qwen2.5, aunque no se confirma en la ficha del autor si se ha modificado.

Su relevancia es limitada por el momento: cero descargas y cero likes en el momento de la consulta, licencia no declarada y acceso restringido (gated). Resulta util como punto de partida para investigacion sobre olvido catastrofico y ajuste fino selectivo en dominio cientifico, pero no es un modelo recomendable para produccion sin una evaluacion previa por parte del equipo que lo adopte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la ficha del autor (base Qwen2.5-7B: 32.768 tokens nativos, 131.072 con RoPE scaling) |
| Tipos de cuantizacion | no disponible (pesos originales en safetensors; compatible con cuantizacion GGUF/AWQ por conversion externa) |
| Idiomas soportados | no disponible (hereda el multilingue de Qwen2.5-7B, no confirmado por el autor) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen2.5-7B |
| Tecnica de ajuste | RLCL + LoRA fusionada (`lora-merged`) |
| Acceso | restringido (gated) |
| Tamano del repositorio | 15,2 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B: un transformer decoder-only con atencion causal, normalizacion RMSNorm, activacion SwiGLU, embeddings rotatorios (RoPE) y atencion con query/key/value bias. El modelo base fue entrenado por Alibaba con un corpus de aproximadamente 18 billones de tokens segun la documentacion oficial de Qwen2.5, aunque el autor de este fine-tune no detalla la composicion del dataset empleado.

El proceso de ajuste se etiqueta como `rlcl` con `forgetting` y `lora-merged`. Esto indica que se aplico una LoRA sobre el modelo base y posteriormente se fusionaron los pesos en el checkpoint final. El termino `forgetting` sugiere que el entrenamiento se diseno para medir o mitigar el olvido catastrofico de capacidades generales al especializar en quimica. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset quimico, el algoritmo exacto de RL (PPO, DPO, GRPO u otro) ni hiperparametros. Tampoco se documenta si hubo etapas de RLHF o DPO adicionales.

## Capacidades

- Generacion de texto conversacional en formato chat, heredado de la plantilla de Qwen2.5.
- Razonamiento y conocimiento especializado en quimica (presumiblemente, por el sufijo `chem`), aunque sin evaluacion publica que lo confirme.
- Generacion de codigo y matematicas basicas heredadas del modelo base, potencialmente degradadas por el ajuste selectivo.
- Soporte de tool calling y function calling heredado de Qwen2.5-7B (no verificado tras el fine-tune).
- Capacidad multilingue heredada del modelo base (no confirmada por el autor).
- Compatible con Text Generation Inference (tag `text-generation-inference`) y `endpoints_compatible`.
- No se documentan capacidades de vision, audio ni modo thinking explicito.

## Casos de uso

- Investigacion sobre olvido catastrofico: el modelo sirve como artefacto experimental para comparar la retencion de capacidades generales (MMLU, HumanEval) antes y despues de un ajuste RLCL en dominio quimico.
- Extraccion de entidades quimicas: uso en pipelines de procesamiento de literatura cientifica para identificar compuestos, reacciones y propiedades, aprovechando el ajuste en dominio.
- Asistencia en redaccion tecnica quimica: generacion de borradores de fichas de seguridad o descripciones de procedimientos, siempre con revision humana por el riesgo de alucinacion.
- Prototipado de tutoria conversacional en quimica: despliegue en entornos educativos controlados con contexto de hasta 32k tokens para mantener conversaciones multi-turno sobre un temario.
- Base para nuevos fine-tunes: al estar fusionada la LoRA, puede servir como punto de partida para ajustes adicionales con PEFT sobre tareas quimicas mas especificas.
- Evaluacion de tecnicas RLCL: comparacion de curvas de olvido frente a fine-tunes SFT clasicos sobre el mismo modelo base, en entornos de investigacion academica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 15,2 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda al menos 20-24 GB para contexto moderado.
- VRAM en cuantizacion 8 bits (GPTQ/AWQ/INT8): en torno a 8-9 GB.
- VRAM en cuantizacion 4 bits (GGUF Q4_K_M): en torno a 4,5-5,5 GB, con perdida de calidad no evaluada en este checkpoint.
- GPU recomendadas: A100 40/80 GB o H100 para despliegue en produccion con contexto largo; L40S o RTX 6000 Ada como alternativas.
- Consumer GPU: cabe en RTX 4090 (24 GB) en bf16 con contexto moderado; en RTX 3090/4080 (16-24 GB) requiere cuantizacion para contextos largos; en GPUs de 8-12 GB solo con cuantizacion 4 bits.
- Opciones de despliegue: vLLM, TGI (tag oficial), llama.cpp/Ollama tras conversion a GGUF, y transformers con `AutoModelForCausalLM`.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantizacion, sin datos publicados por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| ronke21/rlcl-Qwen2.5-7B-chem-s123 | 7,6 B | no disponible (base 32k) | no disponible | gated | Fine-tune RLCL en quimica, sin benchmarks |
| Qwen/Qwen2.5-7B | 7,6 B | 32.768 (131.072 con scaling) | Apache 2.0 (Qwen2.5) | abierto | Modelo base, benchmarks publicos |
| Qwen/Qwen2.5-7B-Instruct | 7,6 B | 32.768 (131.072 con scaling) | Apache 2.0 (Qwen2.5) | abierto | Variante alineada para chat |
| Mistral-7B-v0.3 | 7,2 B | 32.768 | Apache 2.0 | abierto | Alternativa generalista de tamano similar |

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial permitido; hay que contactar con el autor o consultar el modelo base (Qwen2.5-7B se distribuye bajo Apache 2.0, pero el fine-tune no lo especifica).
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que anade friccion para uso en produccion y para auditoria externa.
- Sin benchmarks publicados: no hay evidencia cuantitativa de mejora en quimica ni de degradacion en capacidades generales.
- Riesgo de olvido catastrofico: el propio tag `forgetting` sugiere que el ajuste puede haber degradado tareas generales (codigo, matematicas, multilingue); conviene evaluar antes de sustituir al modelo base.
- Riesgo de alucinacion en dominio cientifico: sin evaluacion de fidelidad factual, no es apto para uso clinico, regulatorio o de seguridad quimica sin revision experta.
- Cero descargas y cero likes: sin validacion comunitaria, lo que implica ausencia de casos de exito reportados.
- Idiomas no declarados: no se confirma el soporte multilingue efectivo tras el fine-tune.
- Fecha de creacion futura (2026-11-27) en los metadatos: conviene verificar la integridad y procedencia del repositorio antes de confiar en el.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ronke21/rlcl-Qwen2.5-7B-chem-s123
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B
- Variante instruct del base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio oficial de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Paper de Qwen2.5: https://arxiv.org/abs/2412.15115
