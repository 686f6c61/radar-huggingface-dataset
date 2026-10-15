# cooler8/yejin-korean-8b-v3-cpt750-p1v4-distill-qwen36-lora-nothink-v2

{response}<|end|>`

Notable: "nothink" variant - thinking block empty.

Base model described (from web search) as "Korean-English bilingual foundation language model with 8 billion parameters, pre-trained from scratch on a large-scale curated bilingual corpus." But that's for the base, snippet from search result. I can mention it carefully — it's from the web search of the base model page. I should be careful; the base model card says Korean-English bilingual. But the fine-tune's language tag is ko only.

Benchmarks: none provided. KMMLU mentioned as training data source (train split). So no benchmark results.

Hardware: 7.24B params. bfloat16 → ~14.5 GB weights. Repo 29 GB (probably includes fp32 or multiple checkpoints/LoRA adapters). VRAM estimates: bf16 ~15-16 GB + KV cache; int8 ~8 GB; q4 ~5 GB. Consumer GPUs: RTX 4090 24GB fits bf16 at short context; RTX 3060 12GB needs 4-bit.

Deployment: transformers, vLLM, llama.cpp (needs GGUF conversion), Ollama (if converted), TGI. Not mentioned in card — I should phrase as "opciones no indicadas en la model card; dado el formato safetensors...". Careful not to invent. I'll phrase it as recommended/deducible but flag it.

Comparativa: comparar con Qwen3-8B, Llama-3.1-8B, EXAONE-3.5-7.8B (Korean). But do I know data? I know these models exist. Comparison table with params, context, license, availability — I need to be careful not to invent. Qwen3-8B: 8.2B params, 128K context, Apache-2.0. Llama-3.1-8B: 8B, 128K, Llama license. EXAONE-3.5-7.8B: 7.8B, 32K, EXAONE AI Model License (non-commercial). These are known facts, reasonably safe. But the instruction says don't invent data. These are from general knowledge... Hmm, risky but I think acceptable if I mark them as "según información pública de sus respectivos repositorios". Actually the safest is to include the comparison with a note. Since the ficha requires comparativa with 2-3 alternatives, I'll include but note that the figures come from public info of each model's repo and are not verified in this search. I'll be conservative: give parameter count, license, and context for well-known ones. Actually I'd rather be careful. Let me include Qwen3-8B (since this model's tags include qwen3 architecture), Llama-3.1-8B, and EXAONE-3.5-7.8B. Mark context figures as "no verificados en esta búsqueda" perhaps. Hmm, that gets clunky. I'll add a note under the table.

Alternatively I could say "no disponible" for the comparativa. But it's better to provide something useful. I'll provide the table with a caveat note.

Let me write it.

Titles: only first word capitalized. "Resumen", "Especificaciones tecnicas", "Arquitectura y entrenamiento", "Capacidades", "Casos de uso", "Benchmarks y rendimiento", "Requisitos de hardware", "Comparativa con modelos similares", "Limitaciones y advertencias", "Enlaces". Good.

Fechas: created 2026-10-14 — future date but whatever, report it.

Let me be careful about the name: "Yejin Korean 8B v3 cpt750 + p1v4 + Qwen3.6-27B distill LoRA nothink-v2".

Note there are two similar models: the listed one (distill-qwen36) and "yejin-korean-8b-v3-cpt750-p1v4lora-nothink-v2" in search. Mention in links.

Write the ficha.

For the "Parámetros activos" row — only if MoE. Not MoE, so I could omit, but the instruction says "(solo si es MoE)". So omit. Hmm, "Incluye SIEMPRE estas filas" but with the caveat. I'll omit active params row since it's dense. Actually safer to include with "no aplica (modelo denso)". I'll include it as "no aplica (modelo denso, no MoE)". That satisfies both.

VRAM estimates: I'll compute. 7.24B params:
- bf16/fp16: 7.24e9 * 2 = 14.48 GB weights
- fp32: 29 GB (matches repo size of 29.0 GB — interesting, the repo is 29 GB which suggests fp32 or multiple files)
- int8: ~7.2 GB
- q4_k_m: ~4.4-4.5 GB

Also note repo size 29.0 GB suggests weights in fp32 or multiple revisions.

Throughput: no data available.

Casos de uso: minimum 6, concrete. Korean-focused.

Let me write.## Resumen

Yejin Korean 8B v3 cpt750 + p1v4 + Qwen3.6-27B distill LoRA nothink-v2 es un modelo de lenguaje de 7.241.740.288 parametros publicado por el usuario cooler8 en HuggingFace. Se trata de un ajuste fino de instrucciones en coreano construido sobre el modelo base cooler8/yejin-korean-8b-v3-base, un modelo fundacional bilingue coreano-ingles preentrenado desde cero. La ficha del modelo lo etiqueta como arquitectura qwen3 y lo distribuye bajo licencia Apache 2.0.

El modelo resuelve el problema de la instruccion conversacional en coreano mediante una cadena de tres etapas: un preentrenamiento continuado de 750 pasos sobre datos publicos coreanos, la incorporacion de un "chat vector" derivado del modelo SFT propio del autor, y finalmente un ajuste LoRA. La variante nothink-v2 desactiva explicitamente el bloque de razonamiento: la plantilla de chat incluye las etiquetas `<think> </think>` vacias, de modo que el modelo responde directamente sin generar trazas de pensamiento.

Es relevante porque combina tecnicas de destilacion a nivel de secuencia sobre un modelo denso de tamano medio (7,24B parametros), un rango que cabe en GPUs de consumo con cuantizacion, y porque toda su cadena de desarrollo (base, SFT, LoRA) es abierta y publicada por el mismo autor. El repositorio ocupa 29,0 GB y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3 (segun etiqueta del repositorio); transformer denso |
| Parametros totales | 7.241.740.288 (7,24B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; pesos publicados en safetensors (uso en bfloat16 en el ejemplo oficial) |
| Idiomas soportados | coreano (ko); el modelo base del que deriva se describe como bilingue coreano-ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

Datos adicionales: repositorio de 29,0 GB, fecha de creacion 2026-10-14, ultima actualizacion 2026-10-14, pipeline text-generation, 0 descargas y 0 likes.

## Arquitectura y entrenamiento

Se trata de un transformer denso de 7,24B parametros con arquitectura etiquetada como qwen3, derivado del modelo base cooler8/yejin-korean-8b-v3-base. Segun la informacion publica del modelo base, este es un modelo fundacional bilingue coreano-ingles de 8.000 millones de parametros preentrenado desde cero sobre un corpus bilingue curado a gran escala. El proceso de construccion del modelo final consta de tres fases descritas por el autor: preentrenamiento continuado durante 750 pasos sobre datos publicos coreanos (cpt750), inyeccion de un "chat vector" obtenido del propio modelo SFT del autor, y por ultimo un ajuste LoRA.

Los datos del LoRA combinan 45.013 muestras del formato de fase 1 del autor con 6.052 soluciones cortas en coreano escritas por Qwen/Qwen3.6-27B (Apache-2.0) para preguntas procedentes de su propio generador de puzles, del split de entrenamiento de KMMLU y de examenes escolares de AI Hub. Solo se conservaron las soluciones que alcanzaron la respuesta conocida, lo que constituye una destilacion a nivel de secuencia: no se usaron pesos ni logits del profesor. El autor declara explicitamente que no se utilizaron items de test de ningun benchmark.

La innovacion mas destacable es la variante nothink: la plantilla de chat (`<s><|user|>\n{instruction}<|end|>\n<|assistant|>\n<think> </think>{response}<|end|>`) fuerza un bloque de razonamiento vacio, de forma que el modelo emite la respuesta de manera directa. No se documentan en la informacion disponible otras tecnicas como decodificacion especulativa o atencion lineal, ni el uso de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en coreano, con formato de instrucciones y plantilla de chat propia.
- Seguimiento de instrucciones (instruction-following) en coreano, entrenado sobre 45.013 muestras de formato de fase 1 mas 6.052 soluciones adicionales.
- Resolucion de problemas con respuesta verificable: el entrenamiento se filtro por alcanzar la respuesta conocida en puzles, KMMLU train y examenes escolares.
- Modo sin razonamiento explicito (nothink-v2): la variante evita generar cadenas de pensamiento y responde directamente.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al coreano segun la etiqueta de idioma del repositorio; el modelo base se describe como bilingue coreano-ingles, pero el ajuste final no declara soporte adicional.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Asistentes conversacionales en coreano: el modelo acepta una plantilla de chat multi-turno con roles user/assistant, por lo que puede integrarse en aplicaciones de atencion al cliente en coreano donde se requiera respuesta directa sin trazas de razonamiento visibles.
- Generacion de respuestas en formato corto: al haber sido ajustado con 6.052 soluciones breves en coreano, encaja en escenarios que exigen contestaciones concisas, como chatbots de FAQ o sistemas de respuesta rapida.
- Tutoria y resolucion de ejercicios escolares: parte de los datos de entrenamiento provienen de examenes escolares de AI Hub, lo que lo hace adecuado para prototipos de ayuda al estudio en coreano con verificacion de respuesta.
- Evaluacion academica tipo KMMLU: el modelo se entreno con el split de entrenamiento de KMMLU, por lo que puede emplearse como candidato en tareas de conocimiento coreano de opcion multiple, siempre que no se evaluen items vistos.
- Experimentacion en investigacion sobre destilacion: al documentarse la destilacion a nivel de secuencia desde Qwen3.6-27B sin usar pesos ni logits del profesor, sirve como caso de estudio reproducible para investigar tecnicas de distillation en modelos de 7B.
- Base para nuevos ajustes LoRA en coreano: su licencia Apache 2.0 y su formato safetensors permiten derivar variantes especializadas (dominio legal, medico, tecnico) sin restricciones de redistribucion.
- Despliegue en entornos con recursos limitados: con 7,24B parametros, puede ejecutarse en una unica GPU de consumo tras cuantizacion, lo que facilita prototipos locales de asistentes en coreano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye metricas de evaluacion en la model card y declara que no se utilizaron items de test de ningun benchmark durante el entrenamiento. KMMLU y los examenes de AI Hub se mencionan unicamente como fuentes de datos de entrenamiento (split de train), no como resultados.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 7,24B parametros declarados en safetensors): aproximadamente 14,5 GB en bfloat16/fp16 solo para pesos; aproximadamente 7,3 GB en int8; en torno a 4,5-5 GB con cuantizacion de 4 bits del tipo Q4_K_M.
- A la VRAM de pesos hay que sumar la cache KV, cuyo tamano depende de la longitud de contexto, que no esta documentada en la informacion disponible.
- GPU de centro de datos: A100 40/80 GB, H100, L40S o A6000 permiten inferencia en bfloat16 sin cuantizar con margen amplio.
- GPU de consumo: una RTX 4090 o RTX 3090 (24 GB) puede ejecutar el modelo en bfloat16, aunque con margen ajustado segun la longitud de contexto; una RTX 4080 o 4070 Ti (16 GB) queda al limite en bfloat16; una RTX 3060 de 12 GB requiere cuantizacion de 4 bits.
- Opciones de despliegue: la model card solo documenta el uso con `transformers` (`AutoModelForCausalLM` con `torch_dtype="bfloat16"` y `device_map="auto"`). No se mencionan vLLM, llama.cpp, Ollama ni TGI; dado que los pesos se publican en safetensors, el uso de llama.cpp u Ollama requeriria una conversion previa a GGUF, y su viabilidad no esta confirmada en la informacion disponible.
- Latencia y throughput: no disponibles. El repositorio registra 0 descargas, por lo que no hay datos de uso publicos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Yejin Korean 8B v3 (este modelo) | 7,24B | no disponible | Apache 2.0 | Instrucciones en coreano, variante nothink, destilacion de secuencia |
| Qwen3-8B | aproximadamente 8B | no disponible en esta busqueda | Apache 2.0 | Modelo generalista multilingue de la familia Qwen3 |
| Llama 3.1 8B | 8B | no disponible en esta busqueda | Licencia comunitaria de Meta | Modelo generalista, orientado a ingles |
| EXAONE 3.5 7.8B | 7,8B | no disponible en esta busqueda | Licencia propia de EXAONE | Modelo optimizado para coreano |

Nota: los datos de los modelos comparativos corresponden a informacion publica general de sus respectivos repositorios y no han sido verificados en la busqueda realizada para esta ficha; los campos marcados como "no disponible" no deben tomarse como valores confirmados. En la informacion proporcionada no hay resultados de benchmarks que permitan comparar el rendimiento real de este modelo frente a las alternativas citadas.

## Limitaciones y advertencias

- No se han publicado benchmarks, evaluaciones humanas ni comparaciones con otros modelos, por lo que el rendimiento real es desconocido y no puede validarse con datos.
- Riesgo de alucinacion: no hay informacion sobre tasas de alucinacion, mecanismos de mitigacion ni evaluaciones de fidelidad factual.
- Cobertura idiomatica limitada: la etiqueta de idioma del repositorio es exclusivamente coreano (ko); el ajuste final no declara soporte para castellano ni para otros idiomas distintos del coreano.
- Sesgos conocidos: no disponibles. El autor no documenta analisis de sesgo ni composicion demografica del corpus de entrenamiento.
- Contaminacion de evaluacion: parte del entrenamiento usa el split de train de KMMLU y examenes escolares, por lo que los resultados en KMMLU u otros conjuntos con solapamiento tematico no serian comparables de forma limpia.
- Procedencia de los datos: 6.052 de las muestras de LoRA fueron generadas sinteticamente por Qwen/Qwen3.6-27B y filtradas por respuesta correcta; esto puede introducir el estilo y los sesgos del modelo profesor, ademas de posibles errores en la respuesta considerada "conocida".
- Licencia: Apache 2.0 permite uso comercial y redistribucion, pero implica obligaciones de atribucion y de conservacion del aviso de licencia; debe revisarse si el uso de los datos de AI Hub y KMMLU anade restricciones adicionales a los pesos derivados.
- Sin adopcion verificable: 0 descargas y 0 likes en el momento de la consulta, sin soporte comunitario ni garantias de mantenimiento.
- Fechas de publicacion futuras respecto al momento de redaccion (2026-10-14), dato que conviene verificar en el repositorio original.
- El repositorio ocupa 29,0 GB, muy por encima de los aproximadamente 14,5 GB esperables de unos pesos en bfloat16, lo que sugiere la presencia de revisiones adicionales o de pesos en mayor precision; conviene comprobar el contenido antes de descargarlo.
- Al ser una variante nothink, no se beneficia de cadenas de razonamiento explicito, lo que puede penalizar tareas que requieran calculo o inferencia multi-paso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cooler8/yejin-korean-8b-v3-cpt750-p1v4-distill-qwen36-lora-nothink-v2
- Modelo base: https://huggingface.co/cooler8/yejin-korean-8b-v3-base
- Variante relacionada (cpt750-p1v4lora-nothink-v2): https://huggingface.co/cooler8/yejin-korean-8b-v3-cpt750-p1v4lora-nothink-v2
- Ficha de Yejin Korean 8B v3 SFT v3 en free2aitools: https://free2aitools.com/model/cooler8/yejin-korean-8b-v3-sft-v3
- Ficha de Yejin Korean 8B v3 P1delta SFT2 Nothink v2 en free2aitools: https://free2aitools.com/model/cooler8/yejin-korean-8b-v3-p1delta-sft2-nothink-v2
- Perfil del autor en espejo Gitea: https://dev.modelhub.org.cn/cooler8
