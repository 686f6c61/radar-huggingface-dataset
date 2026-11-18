# pentacoxian-dev/deepseek-v4.1-1017-abliterated-v4x08b

## Resumen

DeepSeek V4.1 1017 Abliterated — v4x08b es una variante "abliterated" del modelo DeepSeek V4.1, publicada por el usuario pentacoxian-dev en Hugging Face. Se trata de un ajuste de tipo rank-1 abliteration sobre el checkpoint `deepseek-v4.1-1017-abliterated-v3`, cuyo objetivo declarado es eliminar los rechazos (refusals) y los preambulos de reprimenda del modelo, manteniendo al mismo tiempo la capacidad de responder a preguntas de contraste del conjunto XSTest. El modelo conserva la licencia MIT heredada de DeepSeek.

El checkpoint tiene 763.205.315.794 parametros totales (segun los safetensors del repositorio) y un tamano de repositorio de 510,3 GB, lo que lo situa en la categoria de modelos de escala muy grande. La model card indica que los pesos estan en formato FP8 (tag `fp8`) y que el modelo esta pensado para servirse con vLLM, con un ejemplo de despliegue que usa `--tensor-parallel-size 4` y `--max-model-len 32768`. Los idiomas declarados son ingles y japones.

La relevancia de esta ficha radica en que documenta una practica creciente en la comunidad open source: la publicacion de variantes abliterated de modelos grandes para eliminar comportamientos de rechazo, con evaluaciones acotadas (XSTest, HarmBench, MMLU) que permiten valorar el impacto de la intervencion. No obstante, la informacion disponible es limitada: no se detalla la arquitectura interna, el proceso de entrenamiento original, ni se publican benchmarks completos comparables con otros modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (tag `deepseek_v41`; el modelo base es DeepSeek V4.1) |
| Parametros totales | 763.205.315.794 |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens (segun el ejemplo de despliegue con `--max-model-len 32768`) |
| Tipos de cuantizacion | FP8 (tag `fp8`); pesos en 8-bit |
| Idiomas soportados | ingles (en), japones (ja) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo en la documentacion proporcionada. El tag `deepseek_v41` sugiere que se trata de un modelo de la familia DeepSeek V4.1, y el tamano de 763.205 millones de parametros indica un modelo de escala muy grande, probablemente con arquitectura Mixture of Experts (MoE), aunque este dato no se confirma explicitamente en la informacion disponible. Tampoco se detallan el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo base.

La intervencion especifica de esta variante es una abliteration de rango 1 aplicada sobre el checkpoint `deepseek-v4.1-1017-abliterated-v3`. Segun la model card, se modifican dos tensores: `head.weight` (con escalados de 1,1 sobre tokens de afirmacion como "Here"/"Yes"/"Sure", 0,55 sobre "'t" y 0,3 sobre " I") y `layers.38.attn.wo_b.weight` (ablacion de rango 1 con alpha=0,08, mezclando direcciones "rich" y "mined"). Ambos cambios estan integrados en el checkpoint, por lo que no requiere aplicar deltas. El modelo esta optimizado para "maximo esfuerzo de razonamiento" y se sirve con vLLM.

## Capacidades

- Generacion de texto conversacional en ingles y japones.
- Razonamiento con modo "thinking" activable mediante `chat_template_kwargs: {"thinking": true}` y `reasoning_effort: "max"`.
- Respuesta a preguntas de contraste del conjunto XSTest (evaluado con 450 preguntas normales y 40 en modo thinking max).
- Comportamiento abliterated: eliminacion de rechazos y preambulos de reprimenda (0 refusals en XSTest normal y thinking max, segun la model card).
- Soporte de despliegue en vLLM con tensor parallelism.
- Capacidades de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita (la model card menciona una evaluacion "Agentic 20x2" con 55 n-gramas repetidos y 2,5 lineas duplicadas, lo que sugiere cierta evaluacion agentica, pero sin detalle).
- Capacidades de vision o audio: no disponible.

## Casos de uso

- Investigacion sobre alineacion y abliteration: el modelo sirve como caso de estudio para analizar como una intervencion de rango 1 sobre tensores concretos afecta a los rechazos y a las respuestas de contraste, usando los resultados de XSTest y HarmBench publicados en la model card.
- Evaluacion comparativa de variantes abliterated: al existir una variante hermana (v4x06, orientada a modo no-thinking), permite comparar el comportamiento en modo thinking max frente a modo por defecto en tareas de razonamiento.
- Generacion de texto en japones e ingles: el modelo declara soporte para ambos idiomas, por lo que puede emplearse en tareas de generacion y conversacion en esos idiomas, siempre que se valide la calidad real.
- Despliegue en infraestructura multi-GPU con vLLM: el ejemplo de la model card (`--tensor-parallel-size 4`, contexto de 32.768) sirve como referencia para montar un endpoint compatible con la API de OpenAI (`endpoints_compatible`).
- Experimentacion con modos de razonamiento: la posibilidad de activar `reasoning_effort: "max"` permite probar el modelo en tareas que requieren cadenas de razonamiento largas, comparando el resultado con el modo no-thinking.
- Estudio de sesgos y seguridad en modelos abliterated: dado que el modelo elimina rechazos, es util para investigar el impacto de esa eliminacion en la generacion de contenido sensible, con las cautelas descritas en la seccion de limitaciones.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son los de la model card del autor, con decodificacion greedy (temperatura 0):

| Suite | n | Refusal | Soft | Reprimand | Here |
|---|---:|---:|---:|---:|---:|
| XSTest, normal | 450 | 0 | 1 | 16 | 229 |
| XSTest, thinking max | 40 | 0 | 0 | 0 | — |
| HarmBench standard | 200 | 0 | 0 | 5–13 | — |

| Suite | Resultado |
|---|---|
| MMLU | 89,0 (n=200) |
| Agentic 20x2 | 55 n-gramas repetidos, 2,5 lineas duplicadas, 0 revives |

No se han publicado resultados de benchmarks adicionales (HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 763.205 millones de parametros en FP8 (8 bits), el peso del modelo ronda los 763 GB, por lo que se requiere un conjunto multi-GPU de gran capacidad. No se dispone de estimaciones oficiales para cuantizaciones inferiores.
- GPU recomendadas: el ejemplo de la model card usa `--tensor-parallel-size 4`, lo que implica al menos 4 GPUs de gran memoria (por ejemplo, H100 o A100 de 80 GB) para alojar el modelo en FP8.
- Cabe en consumer GPU: no, el tamano del checkpoint (510,3 GB de repositorio) y los 763.205 millones de parametros lo hacen inviable en GPUs de consumo.
- Opciones de despliegue: vLLM (recomendado en la model card); no se confirman otros motores como llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| deepseek-v4.1-1017-abliterated-v4x08b (este) | 763.205.315.794 | 32.768 | MIT | Hugging Face |
| deepseek-v4.1-1017-abliterated-v3 (modelo base) | no disponible | no disponible | MIT (heredada) | Hugging Face |
| deepseek-v4.1-1017-abliterated-v4x06 (variante hermana) | no disponible | no disponible | MIT | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas variantes mas alla de las evaluaciones parciales de la model card. No se han identificado en la informacion proporcionada otros modelos comparables de la misma categoria con datos verificables.

## Limitaciones y advertencias

- Modelo abliterated: elimina rechazos y preambulos de reprimenda de forma deliberada, lo que implica un riesgo elevado de generar contenido sensible o inapropiado sin las salvaguardas habituales del modelo base.
- Los resultados de XSTest y HarmBench son del autor del modelo y con muestras reducidas (n=450, n=40, n=200), por lo que no constituyen una evaluacion exhaustiva de seguridad.
- Riesgo de alucinacion: no se han publicado evaluaciones especificas de factualidad; el MMLU de 89,0 se obtuvo con solo 200 preguntas.
- Idiomas limitados a ingles y japones; no se declara soporte de castellano.
- Contexto de 32.768 tokens segun el ejemplo de despliegue; no se confirma si el modelo soporta ventanas mayores.
- Licencia MIT heredada de DeepSeek, lo que permite uso comercial, pero la responsabilidad sobre el comportamiento abliterated recae en el desplegador.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia (2026-11-18), lo que indica ausencia de validacion por parte de la comunidad.
- No se dispone de informacion sobre la arquitectura interna, el entrenamiento original ni los parametros activos, lo que dificulta evaluar su comportamiento en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/pentacoxian-dev/deepseek-v4.1-1017-abliterated-v4x08b
- Modelo base: https://huggingface.co/pentacoxian-dev/deepseek-v4.1-1017-abliterated-v3
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion disponible.
