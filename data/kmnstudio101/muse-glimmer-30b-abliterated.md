# kmnstudio101/Muse-Glimmer-30B-Abliterated

## Resumen

Muse-Glimmer-30B-Abliterated es una variante "abliterated" (de-refusal) del modelo base meta-models/Muse-Glimmer-30B, publicada por el usuario kmnstudio101 en HuggingFace. El objetivo es eliminar la mayor parte del comportamiento de rechazo de seguridad del modelo original: según la model card, se reduce en torno al 87% la tasa de rechazo en el conjunto harmful_behaviors (de 100/100 en la base a 13/100 en esta variante), manteniendo la deriva respecto al modelo original bajo control mediante una pérdida que penaliza la divergencia KL.

El modelo conserva el tamano del original: 29.776.626.688 parametros (29,8 B) en bf16, con un vocabulario de 202.000 tokens. La adaptacion se hizo con un LoRA de rango 16 sobre las proyecciones o_proj y down_proj, que supone solo 31,1 M de parametros entrenados (0,10% del total), posteriormente fusionado en los pesos base y cuantizado a GGUF. El repositorio ocupa 59,6 GB e incluye dos shards safetensors en bf16 (56 GB), con cuantizaciones Q8_0 y Q4_K_M disponibles como artefactos de release.

Es relevante ahora porque se enmarca en la practica de "abliteracion" de modelos abiertos para usos de investigacion en seguridad, red-teaming y despliegues donde las politicas de rechazo del modelo base resultan demasiado conservadoras. La model card es inusualmente transparente en cuanto a metricas de deriva (KL) y de sobre-rechazo, aunque no incluye benchmarks de capacidad. El autor declara licencia Apache 2.0 y uso previsto como asistente general con rechazo de seguridad reducido, advirtiendo de que hay que validar el comportamiento antes de desplegarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en detalle; el modelo base se describe como modelo multimodal de razonamiento (texto e imagen) |
| Parametros totales | 29.776.626.688 (29,8 B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (original), GGUF Q8_0, GGUF Q4_K_M; un listado de terceros menciona tambien NVFP4 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (2 shards, bf16, 56 GB); GGUF para las variantes cuantizadas |
| Tamano de vocabulario | 202.000 tokens (segun model card) |
| Tamano del repositorio | 59,6 GB |
| Parametros entrenados (LoRA) | 31,1 M (0,10% del total); adaptador de 119 MB |
| Modelo base | meta-models/Muse-Glimmer-30B |

## Arquitectura y entrenamiento

No se detalla la arquitectura interna del modelo base en la informacion disponible. Los tags del repositorio incluyen muse_glimmer, image-text-to-text y text-generation, y la documentacion publica del modelo base de Meta lo describe como un modelo multimodal de razonamiento (acepta texto e imagenes, con tool-calling nativo y salida de razonamiento separada). El repositorio se distribuye en safetensors y es compatible con la libreria transformers, con 29,8 B de parametros y un vocabulario de 202.000 tokens.

El proceso de abliteracion descrito en la model card no es un simple fine-tuning de cumplimiento, sino un SFT con LoRA guiado por best-of-N (BoN) y con una perdida que conserva la distribucion: `CE(compliance) + λ·KL(tuned‖base)` con `λ_KL = 1.0`. Los hiperparametros son `r=16`, `alpha=16`, `lr=5e-5`, 2 epocas, scheduler coseno hasta 0, warmup del 5%, grad clip 0.3, batch 1 con acumulacion de gradiente 8, `max_seq=768` y semilla 0. El conjunto de datos son 544 prompts de cumplimiento generados con BoN (N=4 muestras por prompt, temperatura 0.8, filtrado por rechazo) y divididos en conjunto de entrenamiento y un holdout de 48 pares. Las proyecciones objetivo del LoRA son `o_proj` y `down_proj`. El adaptador se fusiono despues en los pesos base.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base.
- Razonamiento multimodal: el modelo base acepta entradas de texto e imagen (tag image-text-to-text); la model card del derivado no re-mide esta capacidad.
- Tool calling / function calling nativo, segun la descripcion publica del modelo base de Meta.
- Salida de razonamiento separada (reasoning output diferenciado), segun la documentacion del modelo base.
- Orientacion a agentes locales y tareas largas, con recuperacion de fallos ("failure recovery") segun Meta.
- Comportamiento de rechazo reducido: tasa de rechazo de 13/100 en harmful_behaviors y sobre-rechazo de 5/100 en or-bench (100).
- Capacidades multilingues: el modelo declara unicamente ingles (`en`); no se documentan otros idiomas en este repositorio.
- No se documentan capacidades de audio ni modo "thinking" explicito en la informacion disponible para este derivado.

## Casos de uso

- Investigacion en seguridad y red-teaming: el modelo permite estudiar como responde un LLM de 30 B cuando se le retira la mayor parte del comportamiento de rechazo (13/100 en harmful_behaviors), con una metrica de deriva KL publicada para cuantificar cuanto se ha alejado del modelo original.
- Evaluacion de alineacion y calibracion de politicas: comparar las respuestas del modelo abliterado con las del base sobre el mismo prompt permite medir el coste real de eliminar los rechazos, usando la tabla de KL (media 0,0988; p99 0,1699 en bf16) como referencia de dano.
- Generacion de datos sinteticos de cumplimiento: el conjunto de entrenamiento BoN (544 prompts, N=4) es un ejemplo reutilizable de generacion de trazas de cumplimiento filtradas por rechazo, util para construir datasets de ajuste en dominios restringidos.
- Asistente general autoalojado: al pesar 29,8 B y publicarse en GGUF Q4_K_M (~16 GB), puede desplegarse en una sola GPU de consumo para tareas de asistencia en ingles, con la advertencia de que hay que validar el comportamiento en el caso de uso concreto.
- Procesamiento de documentos con componente visual: al heredar el caracter multimodal del modelo base, encaja en flujos de extraccion y descripcion de imagenes o capturas, aunque este derivado no publica evaluaciones de vision propias.
- Agentes locales de larga duracion: el modelo base esta disenado para agentes "always-on" con tool use y recuperacion de fallos, por lo que el derivado puede integrarse en bucles de agente que llaman a herramientas externas.
- Analisis de dominios sensibles con control humano: la model card documenta evaluacion en ciberseguridad (solo 2 rechazos de prompts que sonaban maliciosos, uno sobre persistencia ADS y otro sobre exfiltracion de datos de clientes), lo que lo hace util en laboratorios con supervision para estudiar prompts de doble uso.

## Benchmarks y rendimiento

La model card indica explicitamente que no se ejecutaron benchmarks de capacidad ("Not evaluated — benchmarks skipped (by request)"). La unica metrica cuantitativa publicada es la divergencia KL respecto al modelo base y las tasas de rechazo. No se han publicado resultados de MMLU, HumanEval, GSM8K ni similares en la informacion disponible.

| Metrica | Valor |
|---|---|
| Tasa de rechazo (harmful_behaviors, base = 100) | 13/100 |
| Sobre-rechazo (or-bench, 100) | 5/100 |
| Rechazo correcto (cyber-policy-refuse, should-refuse) | 1/2 |
| KL media (response-token naive) | 0,0988 |
| KL p50 | 0,0939 |
| KL p90 | 0,1282 |
| KL p99 | 0,1699 |
| KL ponderada por entropia | 0,0000 (<0,02 PASS) |
| Deriva de capacidades (benchmarks) | no medida |

Deriva por cuantizacion, medida con logits de llama.cpp sobre el mismo holdout de 48 pares:

| Variante | Tamano | KL media | KL p50 | KL p90 | KL p99 |
|---|---|---|---|---|---|
| BF16 | 56 GB | 0,0988 | 0,0939 | 0,1282 | 0,1699 |
| Q8_0 | 28 GB | 0,1018 | 0,0946 | 0,1414 | 0,1703 |
| Q4_K_M | 16 GB | 0,1444 | 0,1413 | 0,1872 | 0,2084 |

## Requisitos de hardware

- VRAM estimada (inferencia, sin contar margen para cache KV y activaciones): BF16 ~56 GB de pesos; Q8_0 ~28 GB; Q4_K_M ~16 GB. Anade entre un 10% y un 30% adicional segun contexto y batch.
- GPU recomendadas para BF16: A100 80 GB o H100 80 GB en una sola tarjeta; tambien viable con 2x RTX 4090 / 2x RTX 3090 repartiendo pesos.
- GPU para Q8_0: A100 40 GB, H100 40/80 GB o configuraciones multi-GPU de 24 GB (2x RTX 4090).
- Consumer GPU: la variante Q4_K_M (~16 GB) entra en una RTX 4090, RTX 3090, RTX 4080 Super o similar con 16-24 GB de VRAM; Q8_0 no cabe en una sola GPU de 24 GB.
- Opciones de despliegue: transformers (pesos safetensors bf16) y llama.cpp / llama-server u Ollama para los GGUF. La compatibilidad con vLLM o TGI no se documenta en la informacion disponible; el tag endpoints_compatible sugiere compatibilidad con endpoints gestionados.
- Latencia y throughput: no se publican mediciones. Como referencia orientativa, un modelo denso de ~30 B en Q4_K_M rinde tipicamente entre 20 y 40 tokens/s en una RTX 4090 y entre 5 y 15 tokens/s en cuantizacion Q8_0 multi-GPU; son estimaciones, no datos del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazo / deriva | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kmnstudio101/Muse-Glimmer-30B-Abliterated | 29,8 B | no disponible | 13/100 rechazo; KL media 0,0988 (bf16) | Apache 2.0 | safetensors bf16 + GGUF Q8_0/Q4_K_M |
| meta-models/Muse-Glimmer-30B (base) | 30 B | no disponible | 100/100 rechazo (referencia) | Apache 2.0 | modelo base de Meta |
| Blackfrost-AI/Muse-Glimmer-30B-Abliterated-GGUF | 30 B (derivado) | no disponible | no disponible | no disponible | solo GGUF |
| divinetribe/Muse-Glimmer-30B-Abliterated-bf16 | 30 B (derivado) | no disponible | no disponible | no disponible | bf16 |
| Muse-Glimmer-30B-Abliterated (build atribuido a "jorkle") | 30 B | no disponible | no disponible | no disponible | GGUF, precision completa y NVFP4 |

No se dispone de datos de benchmarks que permitan comparar capacidades con alternativas de la misma categoria. La comparacion anterior se limita a parametros, formato y licencia.

## Limitaciones y advertencias

- Seguridad: el modelo ha sido modificado deliberadamente para reducir los rechazos. La tasa de rechazo baja de 100/100 a 13/100 en harmful_behaviors; no debe desplegarse en aplicaciones de cara al publico sin capas adicionales de moderacion.
- Deriva respecto a la base: la divergencia KL no es cero. En Q4_K_M la KL media sube a 0,1444 y la p99 a 0,2084, lo que anade distorsion propia de la cuantizacion sobre la ya introducida por el SFT.
- Capacidades no verificadas: no se han ejecutado benchmarks de capacidad, por lo que la afirmacion de la model card de que la preservacion es "alta" es una expectativa, no una medida.
- Idioma: solo se declara ingles (`en`). No hay evidencia de soporte multilingue en este repositorio, aunque el modelo base pueda tenerlo.
- Rechazos residuales: aun quedan 2 rechazos en prompts de ciberseguridad que la propia model card marca como no genuinamente maliciosos (persistencia ADS y exfiltracion de datos de clientes); y 1 de 2 rechazos correctos en cyber-policy-refuse.
- Alucinacion: no se publica ninguna evaluacion de factualidad; al ser un modelo generativo de 30 B, el riesgo de alucinacion sigue presente y debe mitigarse con recuperacion externa.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias y recomienda validar el comportamiento en cada caso de uso. La licencia del modelo base debe respetarse igualmente.
- Procedencia: la autoria de este repositorio figura como kmnstudio101, mientras que un listado de terceros atribuye la abliteracion a "jorkle". Conviene verificar la trazabilidad antes de usarlo en produccion.
- Estado del repositorio: cero descargas y cero likes en el momento de la consulta, sin historial de uso comunitario que permita validar su comportamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kmnstudio101/Muse-Glimmer-30B-Abliterated
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Pagina oficial del modelo base en Meta: https://dev.meta.ai/models/muse-glimmer
- Model card de Muse Glimmer 30B en NVIDIA NIM: https://build.nvidia.com/meta/muse-glimmer-30b/modelcard
- Listado de terceros sobre la version abliterated: https://www.abliteratedmodels.org/muse-glimmer-30b-abliterated/
- Build GGUF de terceros (Blackfrost-AI): https://huggingface.co/Blackfrost-AI/Muse-Glimmer-30B-Abliterated-GGUF
- Build bf16 de terceros (divinetribe): https://huggingface.co/divinetribe/Muse-Glimmer-30B-Abliterated-bf16
