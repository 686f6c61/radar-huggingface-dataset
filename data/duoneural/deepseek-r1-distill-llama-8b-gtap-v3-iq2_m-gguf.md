# DuoNeural/DeepSeek-R1-Distill-Llama-8B-GTAP-v3-IQ2_M-GGUF

` closure rate: 84.0% (note: the card says </think> but likely </thinking> — I should quote as-is)
  - Olympiad Competition Math: 4/10 (40.0%)
  - Python Code AST Execution: 1/10 (10.0%)
  - Inference decode throughput: 171.5 t/s on RTX 4080 Super 32GB
- Architecture of base: 32 layers, 32:8 GQA, SwiGLU FFN, 128k RoPE, test-time compute reasoning
- Method: G-TAP v3 (Generalized Thouless-Anderson-Palmer), statistical mechanics, spin glasses, Onsager reaction term, Lyapunov half-space
- Tags: imatrix, conversational, endpoints_compatible
- Download count: 0, likes: 0
- Languages: not available (base model Llama 3.1 supports 8 languages — but I should be careful; the info says "no disponibles". I can mention that base is multilingual but the card doesn't specify. Actually let me indicate "no disponible" but note base model. Hmm, the rule says don't invent. The base model Llama 3.1 8B supports 8 languages officially (English, German, French, Italian, Portuguese, Hindi, Spanish, Thai). But the sheet info says idiomas: no disponibles. I'll put "no disponible en la informacion proporcionada" and mention base model context.)

Context: 128k RoPE (from base model). The usage example uses -c 8192. I'll say 128.000 tokens according to base model architecture, though practical examples use 8192.

Formats: GGUF only.
Quantization types: IQ2_M (~2.70 bpw), plus mentions of IQ2_XXS siblings.

Hardware: 2.75 GiB weights. RTX 4080 Super 32GB (odd, 4080 Super has 16GB; card claims 32GB — I'll just quote). 171.5 t/s.

Comparisons: bartowski/DeepSeek-R1-Distill-Llama-8B-GGUF, LM Studio, NVIDIA NIM, base model, Qwen 1.5B sibling.

Be careful about not inventing. Note ambiguity: the card claims things that are unverified ("Experimental Release: Pending Further Verification"). I should flag those.

Let me write it.

Note on license: "other" — base model Llama 3.1 has Llama 3.1 Community License. DeepSeek-R1-Distill-Llama-8B is under Llama 3.1 license with MIT for the distillation? Actually DeepSeek-R1-Distill-Llama-8B is under MIT license + Llama 3.1 community license terms. Hmm, actually DeepSeek R1 distills are MIT licensed. Let me not overclaim — the info says "other". I'll state the license is "other" as declared, and mention that the base model's terms apply (Llama 3.1 Community License / MIT depending on the model card), flagged as needing verification. Actually to be safe I'll just say the base model card license should be checked. Let me mention that the base model is DeepSeek-R1-Distill-Llama-8B, whose license terms derive from the Llama 3.1 family — hmm, actually DeepSeek-R1-Distill-Llama-8B on HF is licensed MIT. I'm fairly confident it's MIT. But to not invent, I'll say "licencia 'other' declarada por el autor; verificar los terminos del modelo base". Good.

Now write.

Titles: only first word capitalized. "## Resumen", "## Especificaciones tecnicas", etc. Within sections I can use subheadings sparingly.

Let me write the sheet.

For benchmarks table, I'll present the numbers from the card with a note that they're self-reported and unverified.

Also note that the base model benchmark figures (MMLU ~, GSM8K ~) — I shouldn't invent. I'll say not available for base comparison, but I can mention that the card doesn't give comparative data.

Let me be careful about the "thinking closure" tag: the card writes `</think>` but the actual R1 token is `</thinking>`. I'll quote literally.

Hardware section:
- Peso del repo: 2,9 GB total, archivo de cuantizacion ~2,75 GiB
- ~2,70 bpw
- VRAM: pesos ~2,75 GiB + overhead de contexto KV cache. Con -c 8192 y GQA 32:8, KV cache es relativamente pequeno. Estimate: for Llama 8B, 32 layers, 8 KV heads, head_dim 128 → per token: 2 * 32 * 8 * 128 * 2 bytes (fp16) = 131072 bytes = 128 KiB/token. At 8192 tokens → 1 GiB. At 32768 → 4 GiB. I can compute this and present as estimate. That's reasonable derived math, not invented model facts. I'll label it as estimate.
  Actually 2 (K and V) * 32 layers * 8 heads * 128 dim * 2 bytes = 2*32*8*128*2 = 131072 bytes = 128 KiB per token. Yes. So 8192 → 1 GiB; 131072 → 16 GiB.
- Total ~4-5 GiB for 8k context → cabe en GPU consumer de 8 GB.
- Recommends RTX 4080 Super (card), also 3060 12GB, 4060 Ti 16GB, etc.
- Throughput 171,5 t/s en RTX 4080 Super segun el autor.
- Deploy: llama.cpp (llama-cli, llama-server), llama-server with -ngl 99 -fa on. LM Studio/Ollama possible via GGUF (import), though not explicitly stated.

I'll say Ollama/LM Studio pueden cargar GGUF pero no esta documentado en la tarjeta (no disponible).

Comparativa table:
- Este modelo (DuoNeural GTAP v3 IQ2_M): 8,03 B params, contexto 128k (base), ~2,70 bpw, 2,75 GiB, licencia other, descargas 0
- DeepSeek-R1-Distill-Llama-8B original (bf16): 8,03 B, 128k, 16-bit, ~16 GB
- bartowski/DeepSeek-R1-Distill-Llama-8B-GGUF: mismos params, cuantizaciones estandar (Q4_K_M etc.)
- DuoNeural/DeepSeek-R1-Distill-Qwen-1.5B-GTAP-v3-IQ2_XXS-GGUF: 1,5 B
- DeepSeek-R1-Distill-Qwen-7B: 7,6 B — alternativa

For the original DeepSeek-R1-Distill-Llama-8B benchmark scores: I recall AIME 50.4, MATH-500 89.1, GPQA Diamond 49.0, LiveCodeBench 39.6, CodeForces rating 1205. Those are from the DeepSeek-R1 paper. But the instructions say don't invent data not in provided info. The web results don't include those. I should not include them. I'll mark "no disponible en la informacion proporcionada".

OK, write it.

Casos de uso - minimum 6, concrete.

Let me produce the final markdown.## Resumen

DeepSeek-R1-Distill-Llama-8B-GTAP-v3-IQ2_M-GGUF es una cuantizacion experimental del modelo de razonamiento `deepseek-ai/DeepSeek-R1-Distill-Llama-8B`, publicada por el laboratorio DuoNeural (Jesse Caldwell, Archon y Aura). El modelo base es un Llama 3.1 8B destilado con trazas de razonamiento generadas por DeepSeek R1, por lo que hereda una arquitectura transformer densa de 32 capas con atencion GQA en proporcion 32:8, FFN SwiGLU y RoPE con ventana de 128k tokens. La contribucion del autor no es un nuevo entrenamiento, sino un esquema de cuantizacion post-entrenamiento (PTQ) de aproximadamente 2,70 bits por peso (bpw) que comprime los 8.030.261.312 parametros hasta unos 2,75 GiB.

La innovacion declarada es el metodo G-TAP v3 (Generalized Thouless-Anderson-Palmer), un marco de mecanica estadistica que modela los pesos como vidrios de spin inmersos en campos de cavidad de activacion. El objetivo es mitigar la acumulacion multiplicativa de ruido de discretizacion en las cadenas de razonamiento largas, que en modelos de test-time compute tiende a producir derivaciones truncadas o bucles repetitivos. Para ello el autor sustrae el termino de reaccion de Onsager y proyecta las actualizaciones de parametros en el semiespacio contractivo de Lyapunov, con la intencion de preservar las cuencas atractoras del razonamiento.

Se trata de un artefacto de investigacion, no de un modelo listo para produccion. La propia tarjeta lo etiqueta como "Experimental Release: Pending Further Verification / Empirical Validation", el repositorio acumula 0 descargas y 0 likes en el momento de la consulta, y no existe publicacion revisada por pares que acredite el metodo. Su relevancia practica esta en explorar si un modelo de razonamiento de 8B puede ejecutarse en GPUs de consumo con calidad suficiente para cadenas de pensamiento largas, un nicho dominado por cuantizaciones estandar como Q4_K_M.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Llama 3.1 8B): 32 capas, GQA 32:8, FFN SwiGLU, RoPE |
| Parametros totales | 8.030.261.312 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens segun la arquitectura del modelo base; los ejemplos de la tarjeta usan `-c 8192` |
| Tipos de cuantizacion | IQ2_M (~2,70 bpw, ~2,75 GiB). El autor publica variantes hermanas con IQ2_XXS en otros modelos de la familia |
| Idiomas soportados | No disponible en la informacion proporcionada (la tarjeta no declara lista de idiomas) |
| Licencia | `other` (declarada por el autor; deben verificarse los terminos heredados del modelo base) |
| Formato de pesos | GGUF, con imatrix |
| Tamano del repositorio | 2,9 GB |
| Metodo de cuantizacion | G-TAP v3 (Generalized Thouless-Anderson-Palmer), PTQ de mecanica estadistica |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base, sin modificaciones estructurales: un transformer decoder-only denso de 8B parametros con 32 capas, atencion por consultas agrupadas en proporcion 32:8 (32 cabezas de consulta y 8 de clave/valor), feed-forward SwiGLU y embeddings rotatorios con soporte de hasta 128k tokens. El entrenamiento original corresponde a la destilacion de DeepSeek-R1 sobre Llama 3.1 8B, usando datos de razonamiento generados por el modelo profesor; no hay RLHF ni DPO adicionales documentados en esta publicacion. El resultado es un modelo de test-time compute que produce cadenas explicitas dentro de etiquetas `<think>...</think>` antes de emitir la respuesta.

Lo especifico de esta ficha es el procedimiento de compresion. G-TAP v3 parte de la premisa de que, en modelos con decodificacion extendida, el ruido de discretizacion de un PTQ convencional se amplifica de forma multiplicativa a lo largo de los cientos de pasos intermedios de razonamiento. El metodo modela cada peso como un vidrio de spin en un campo de cavidad de activacion, resta el termino de reaccion de Onsager mediante la expresion $$\Omega_i = \frac{1}{d} \left( \| \tilde{H}_{i,:} \|_2^2 - \tilde{H}_{ii}^2 \right)$$ y restringe las actualizaciones de parametros al semiespacio contractivo de Lyapunov definido por $$\operatorname{Re}(\lambda(S)) \le -\delta$$. La hipotesis del autor es que esta restriccion amortigua el ruido de retroaccion y conserva las cuencas atractoras del razonamiento. No se detalla en la tarjeta el numero de tokens de calibracion, la composicion del dataset de calibracion ni la implementacion exacta del solver.

## Capacidades

- Generacion de texto y razonamiento paso a paso con cadenas explicitas de pensamiento, activadas mediante la plantilla nativa `<｜begin of sentence｜><｜User｜>{prompt}<｜Assistant｜><think>`.
- Razonamiento matematico: el autor reporta 18/25 (72,0%) en GSM8K con cadena de pensamiento nativa y 4/10 (40,0%) en problemas de olimpiada.
- Generacion de codigo: la unica metrica declarada es 1/10 (10,0%) de ejecucion correcta mediante AST sobre problemas de Python, un resultado bajo.
- Derivaciones matematicas de cadena larga, con una traza de pensamiento media declarada de 412,6 tokens y una tasa de cierre de la etiqueta de pensamiento del 84,0%.
- Conversacion multi-turno (etiqueta `conversational` en el repositorio).
- Compatibilidad con endpoints de inferencia (`endpoints_compatible`).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso orquestado: no disponible en la informacion proporcionada; el modelo base no documenta soporte nativo de herramientas en esta publicacion.
- Vision, audio y otras modalidades: no soportadas (modelo exclusivamente de texto).
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Razonamiento matematico en local: con 2,75 GiB de pesos, el modelo cabe en una GPU de consumo de 8 GB y permite resolver problemas de algebra y aritmetica con cadena de pensamiento activada, sin depender de API externa. Es adecuado para entornos con requisitos de privacidad de datos.
- Asistente de estudio de matematicas: la plantilla nativa fuerza la generacion de una derivacion visible antes de la respuesta final, lo que permite mostrar al usuario el procedimiento completo en lugar de solo el resultado.
- Prototipado de pipelines de razonamiento en investigacion: sirve como banco de pruebas para comparar el efecto de distintos esquemas de cuantizacion sobre la calidad de cadenas de pensamiento largas, midiendo perplejidad y tasa de cierre de la traza.
- Despliegue en hardware de gama media con llama.cpp: el repositorio documenta `llama-server --port 8080 -c 8192 -ngl 99 -fa on`, de modo que puede exponerse como endpoint compatible con OpenAI en una estacion de trabajo o un servidor con una sola GPU.
- Generacion de borradores de codigo con revision humana obligatoria: dado el 10% declarado en ejecucion AST, el uso realista es asistencia de autocompletado y explicacion de fragmentos, nunca ejecucion automatica en produccion.
- Clasificacion y extraccion de informacion con justificacion: el modo de razonamiento permite pedir al modelo que exponga el criterio antes de etiquetar, util para tareas de anotacion supervisada donde se revisa la traza.
- Educacion y generacion de ejercicios resueltos: la combinacion de coste de memoria bajo y razonamiento explicito facilita generar bancos de problemas con solucion desarrollada en un portatil con GPU dedicada.

## Benchmarks y rendimiento

Todos los datos siguientes estan autodeclarados por el autor en la tarjeta del modelo y no han sido validados de forma independiente. No se incluyen cifras comparativas del modelo base en la informacion disponible.

| Metrica | Resultado declarado |
|---|---|
| Perplejidad en holdout continuo (131k tokens) | 3,7402 |
| GSM8K con CoT nativa | 18/25 (72,0%) |
| Matematicas de competicion tipo olimpiada | 4/10 (40,0%) |
| Ejecucion de codigo Python via AST | 1/10 (10,0%) |
| Longitud media de traza de pensamiento | 412,6 tokens |
| Tasa de cierre de la etiqueta de pensamiento | 84,0% |
| Throughput de decodificacion | 171,5 t/s en NVIDIA RTX 4080 Super (32 GB) |

No se han publicado resultados de MMLU, HumanEval, MATH-500, GPQA ni AIME en la informacion proporcionada, por lo que no es posible situar el modelo frente a la literatura estandar de razonamiento.

## Requisitos de hardware

- Peso en disco y en VRAM de los pesos: aproximadamente 2,75 GiB (2,70 bpw), dentro de un repositorio total de 2,9 GB.
- Memoria de cache KV: con GQA 32:8 y dimension de cabeza 128, la cache ocupa unos 128 KiB por token en FP16. Esto son aproximadamente 1 GiB con 8.192 tokens de contexto y unos 16 GiB si se agota la ventana de 128k, por lo que el contexto efectivo esta limitado por la VRAM disponible, no por los pesos.
- Huella total estimada: en torno a 4-5 GiB con 8k de contexto y offload completo a GPU.
- GPU recomendadas: el autor reporta la prueba en una NVIDIA RTX 4080 Super. Cualquier GPU con 6-8 GB o mas de VRAM es suficiente para la configuracion documentada (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A100, H100). Tambien puede ejecutarse en CPU con llama.cpp, con latencia muy superior.
- Cabe en GPU de consumo: si, con 8k de contexto y cuantizacion IQ2_M.
- Opciones de despliegue: llama.cpp mediante `llama-cli` y `llama-server` (documentado en la tarjeta), con `-ngl 99` y `-fa on`. El formato GGUF es compatible con otros runners, pero Ollama, LM Studio, vLLM y TGI no estan documentados en la tarjeta para este checkpoint concreto (no disponible).
- Latencia y throughput: 171,5 t/s de decodificacion declarados en RTX 4080 Super. No se publica latencia de prefill ni resultados en otras GPU.
- Parametros de muestreo sugeridos por el autor: `--temp 0.6 --top-p 0.95`, con `-n 2048` para permitir la cadena de pensamiento completa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DuoNeural/DeepSeek-R1-Distill-Llama-8B-GTAP-v3-IQ2_M-GGUF | 8,03 B | 128k (base) | IQ2_M, ~2,70 bpw, 2,75 GiB | `other` | 0 descargas, 0 likes; artefacto experimental sin validacion externa |
| deepseek-ai/DeepSeek-R1-Distill-Llama-8B (modelo base) | 8,03 B | 128k | BF16, ~16 GB | Ver tarjeta del modelo original | Referencia oficial; sin comprimir |
| bartowski/DeepSeek-R1-Distill-Llama-8B-GGUF | 8,03 B | 128k | Familia GGUF estandar (Q2 a Q8) | Derivada del modelo base | Ampliamente distribuido y probado en llama.cpp y LM Studio |
| DuoNeural/DeepSeek-R1-Distill-Qwen-1.5B-GTAP-v3-IQ2_XXS-GGUF | ~1,5 B | Heredado del base Qwen | IQ2_XXS | `other` | Misma familia experimental, mismo autor |
| DeepSeek-R1-Distill-Qwen-7B | ~7,6 B | 128k | Multiples | Ver modelo original | Alternativa de tamano similar con backbone Qwen |

La comparacion de rendimiento entre estas opciones no puede establecerse con la informacion disponible: solo este checkpoint publica cifras de benchmarks, y son autodeclaradas. La ventaja objetiva frente a las cuantizaciones estandar de bartowski es el menor tamano en disco (2,75 GiB frente a los ~3,0-3,5 GiB tipicos de una Q3_K_M), a costa de una perdida de precision que el autor afirma compensar con G-TAP v3.

## Limitaciones y advertencias

- Estado experimental: la propia tarjeta declara "Pending Further Verification / Empirical Validation". No hay benchmarks independientes, ni paper, ni replicacion por terceros.
- Trazabilidad cientifica limitada: el metodo G-TAP v3 se presenta con notacion de mecanica estadistica, pero no se documentan el dataset de calibracion, el numero de tokens usados, ni el codigo de implementacion.
- Riesgo elevado de alucinacion en contenido factual: el modelo base esta optimizado para razonamiento matematico y logico, no para conocimiento factual verificado, y la cuantizacion agresiva a 2,70 bpw puede degradar la coherencia.
- Cadenas de pensamiento truncadas: la tasa de cierre de la etiqueta de pensamiento es solo del 84,0%, lo que implica que aproximadamente una de cada seis generaciones puede no cerrar correctamente la traza de razonamiento y quedar en un bucle o en una respuesta incompleta.
- Rendimiento pobre en codigo: el 10,0% de ejecucion AST correcta desaconseja cualquier uso en generacion de codigo sin revision humana exhaustiva.
- Degradacion esperada por cuantizacion extrema: a ~2,70 bpw la perdida de calidad frente a BF16 es sustancial en tareas fuera del dominio de calibracion, aunque el autor reporte una perplejidad de 3,7402 en su holdout.
- Idiomas: la tarjeta no declara lista de idiomas soportados, por lo que no hay garantia de calidad en castellano ni en otros idiomas distintos del ingles.
- Contexto efectivo practico: aunque la arquitectura base soporta 128k tokens, los ejemplos documentados usan 8k, y la cache KV a contexto completo (unos 16 GiB en FP16) supera la VRAM de la mayoria de GPU de consumo.
- Licencia ambigua: se declara `other` sin especificar los terminos. Es imprescindible verificar la licencia del modelo base antes de cualquier uso comercial, ya que las condiciones de la familia Llama y de DeepSeek R1 imponen restricciones adicionales.
- Atribucion incierta de mejoras: no hay ablacion que aísle el efecto de G-TAP v3 frente al de la propia cuantizacion IQ2_M, por lo que la mejora declarada no es atribuible con la evidencia disponible.
- Idoneidad: no recomendado como componente critico en produccion. Adecuado para experimentacion, docencia y evaluacion interna.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/DuoNeural/DeepSeek-R1-Distill-Llama-8B-GTAP-v3-IQ2_M-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Llama-8B
- Variante hermana de la misma familia (Qwen 1.5B, IQ2_XXS): https://huggingface.co/DuoNeural/DeepSeek-R1-Distill-Qwen-1.5B-GTAP-v3-IQ2_XXS-GGUF
- Cuantizacion GGUF alternativa del mismo modelo base: https://huggingface.co/bartowski/DeepSeek-R1-Distill-Llama-8B-GGUF
- Ficha en LM Studio: https://lmstudio.ai/models/deepseek/deepseek-r1-distill-llama-8b
- Ficha en NVIDIA NIM: https://build.nvidia.com/deepseek-ai/deepseek-r1-distill-llama-8b
- Notebook de comparativa local con GGUF: https://colab.research.google.com/github/Troyanovsky/Local-LLM-Comparison-Colab-UI/blob/main/DeepSeek_R1_Distill_Llama_8B_GGUF.ipynb
