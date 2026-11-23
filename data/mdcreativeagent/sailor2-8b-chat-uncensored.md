# mdcreativeagent/Sailor2-8B-Chat-Uncensored

## Resumen

Sailor2-8B-Chat-Uncensored es un ajuste fino del modelo sail/Sailor2-8B-Chat, publicado por el usuario mdcreativeagent (con creditos a BlossomAI en la model card). El objetivo declarado es eliminar los comportamientos de rechazo (refusal) del modelo base mediante una tecnica de intervencion direccional inspirada en la investigacion "Refusal in LLMs is Mediated by a Single Direction". El resultado es un modelo de generacion de texto conversacional que responde a peticiones que el modelo original rechazaria.

El modelo hereda la arquitectura Qwen2 del base, con 8.546.930.176 parametros totales (aproximadamente 8,5 mil millones) y pesos en formato safetensors. El repositorio ocupa 17,1 GB, lo que corresponde a pesos en precision completa (probablemente bfloat16 o float16). La model card indica que tambien existen versiones pre-cuantizadas en formato GGUF publicadas en un repositorio separado.

La relevancia de este modelo es acotada: se trata de un experimento de eliminacion de rechazos sobre un modelo base especializado en idiomas del sudeste asiatico (el base Sailor2 esta orientado a ingles y vietnamita, entre otros). El repositorio no registra descargas ni likes en el momento de la consulta, y la documentacion tecnica es muy escasa, limitandose a describir la tecnica de intervencion sin aportar detalles sobre el proceso de entrenamiento ni evaluaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2, heredada del base) |
| Parametros totales | 8.546.930.176 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en este repositorio; la model card menciona versiones GGUF en un repositorio aparte |
| Idiomas soportados | en, vi (segun tags y model card) |
| Licencia | MIT |
| Formato de pesos | safetensors (transformers); GGUF en repositorio separado |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del base sail/Sailor2-8B-Chat, que a su vez emplea la arquitectura Qwen2 (transformer decoder-only denso con atencion causal estandar, RoPE y normalizacion RMSNorm, segun la familia Qwen2). No se dispone de informacion detallada sobre la configuracion exacta de capas, dimensiones ocultas o cabezas de atencion en la informacion proporcionada.

El metodo de entrenamiento declarado no es un fine-tuning convencional con datos, sino una intervencion direccional sobre las activaciones internas del modelo, basada en el hallazgo de que el comportamiento de rechazo en LLMs esta mediado por una unica direccion en el espacio de activaciones. La model card no especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco detalla hiperparametros, semillas ni el procedimiento exacto de la intervencion. La unica innovacion tecnica documentada es precisamente esa modificacion direccional para suprimir rechazos.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del base Sailor2-8B-Chat.
- Respuesta a peticiones que el modelo base rechazaria, por la supresion del comportamiento de rechazo.
- Soporte de los idiomas declarados: ingles y vietnamita.
- Capacidad de razonamiento y generacion de codigo propia de un modelo de 8B de la familia Qwen2 (no verificada con benchmarks en la informacion disponible).
- Compatibilidad con text-generation-inference y endpoints_compatible, segun los tags del repositorio.
- No se documenta soporte de tool calling, function calling, vision, audio ni modo thinking.

## Casos de uso

- Experimentacion en investigacion de seguridad y alineamiento: el modelo sirve para estudiar el efecto de la intervencion direccional sobre el comportamiento de rechazo, comparando respuestas con el base Sailor2-8B-Chat en condiciones controladas.
- Generacion de texto creativo sin filtros editoriales: util para prototipos de narrativa o roleplay donde se requiere que el modelo no decline continuar una escena, asumiendo la responsabilidad de moderacion por parte del desarrollador.
- Procesamiento de lenguaje natural en vietnamita e ingles: al heredar el base Sailor2, puede emplearse en tareas de generacion y conversacion en esos idiomas, aunque sin garantias de calidad por falta de evaluaciones publicadas.
- Despliegue local en entornos con recursos limitados: con 8,5B parametros y versiones GGUF disponibles, puede ejecutarse en estaciones de trabajo con GPU de consumo para pruebas internas.
- Generacion de datos sinteticos para entrenamiento: el modelo puede producir corpus de texto en dominios donde el base rechazaria generar contenido, siempre bajo supervision y revision humana.
- Evaluacion comparativa de tecnicas de ablacion de rechazos: sirve como referencia para medir degradacion de capacidades tras la intervencion frente al modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): aproximadamente 17 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda 24 GB o mas.
- Cuantizacion a 8 bits: alrededor de 9-10 GB de VRAM.
- Cuantizacion a 4 bits (GGUF Q4): alrededor de 5-6 GB de VRAM, segun el repositorio GGUF referenciado.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para precision completa con contexto largo; RTX 4090 (24 GB) para fp16 con contexto moderado; RTX 3090, RTX 4080 o RTX 4070 Ti para cuantizaciones de 8 y 4 bits.
- Cabe en GPU de consumo: si, en RTX 4090 a fp16 con contexto limitado y en GPUs de 8-12 GB con cuantizacion GGUF de 4 bits.
- Opciones de despliegue: transformers, text-generation-inference (segun tags), llama.cpp/Ollama mediante los GGUF del repositorio separado, y vLLM si la arquitectura Qwen2 es compatible (no verificado en la informacion disponible).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Sailor2-8B-Chat-Uncensored (este) | 8,5B | no disponible | MIT | Base Sailor2 con rechazos suprimidos por intervencion direccional |
| sail/Sailor2-8B-Chat (base) | 8,5B | no disponible | no disponible en la informacion | Modelo original con comportamientos de rechazo intactos |
| Qwen2-7B-Instruct | 7,6B | 32.768 tokens (segun documentacion publica de Qwen2) | Apache 2.0 (segun documentacion publica) | Alternativa densa de tamano similar, sin modificacion de rechazos |
| Llama-3.1-8B-Instruct | 8,0B | 131.072 tokens (segun documentacion publica) | Llama 3.1 Community License | Alternativa de tamano similar con contexto largo |

La comparacion con Qwen2-7B-Instruct y Llama-3.1-8B-Instruct se basa en datos publicos de sus respectivas documentaciones; no se dispone de evaluaciones del modelo de esta ficha que permitan comparar rendimiento de forma directa.

## Limitaciones y advertencias

- La supresion de rechazos elimina una capa de seguridad del modelo base; el modelo puede generar contenido danino, ilegal o inseguro sin advertir al usuario.
- No hay evaluaciones publicadas que midan la degradacion de capacidades (razonamiento, codigo, matematicas) tras la intervencion direccional.
- Riesgo elevado de alucinacion, comun en modelos de 8B y no cuantificado en este caso.
- Idiomas limitados a ingles y vietnamita segun la model card; el rendimiento en castellano no esta documentado.
- La longitud de contexto no se especifica; no debe asumirse la del base sin verificacion.
- El repositorio no registra descargas ni likes, y la documentacion es minima; la reproducibilidad del ajuste no esta garantizada.
- La licencia MIT permite uso comercial, pero el desarrollador asume toda la responsabilidad legal y etica del contenido generado.
- La model card menciona "GGFU" (probable errata por GGUF) y enlaza a un repositorio de BlossomsAI distinto del autor del modelo; conviene verificar la procedencia de esos pesos antes de usarlos.
- No se documenta soporte de tool calling ni de agentes; no debe asumirse.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mdcreativeagent/Sailor2-8B-Chat-Uncensored
- Modelo base: https://huggingface.co/sail/Sailor2-8B-Chat
- Repositorio GGUF referenciado: https://huggingface.co/BlossomsAI/Sailor2-8B-Chat-Uncensored-GGUF
- Perfil del contribuidor citado: https://huggingface.co/BlossomsAI
- Articulo de referencia sobre intervencion direccional: https://www.alignmentforum.org/posts/jGuXSZgv6qfdhMCuJ/refusal-in-llms-is-mediated-by-a-single-direction
