# Ramboop/my-assistant-gguf

tags. Qwen3-4B has thinking mode enabled by default. Also 119 languages supported in Qwen3.

Actually let me double check Qwen3-4B: hidden_size 2560, num_hidden_layers 36, num_attention_heads 32, num_key_value_heads 8, head_dim 128, intermediate_size 9728, vocab_size 151936, tie_word_embeddings True. Yes I believe that's right.

Qwen3 license: Apache 2.0 for the Qwen3 series (except 235B-A22B which was Apache 2.0 too; the Qwen3 models released under Apache 2.0). Yes, Qwen3 all Apache 2.0. But the fine-tune's license is "no disponible" — I should note the base model is Apache 2.0 but the derivative repo doesn't state a license, which is a caveat for commercial use.

Benchmarks: no data provided for the fine-tune. I could mention Qwen3-4B base benchmarks from public knowledge but that risks. Better: state no benchmarks published for this fine-tune; optionally reference base model known values, but I'd mark them clearly. Hmm, the rule: "Si no hay datos de benchmarks en la informacion proporcionada, indica: 'No se han publicado resultados de benchmarks en la informacion disponible.' No inventes numeros." I'll say that and not invent. I might mention the base model's published benchmarks generally without numbers? Better to not include numbers. I'll state the instruction line and add a note that the base model Qwen3-4B does publish benchmarks (MMLU, MMLU-Pro, GPQA, LiveCodeBench, etc.) on its model card, but no data for this fine-tune. That's safe.

Hardware: 4B params, Q4_K_M ~2.5 GB. VRAM estimates:
- Q4_K_M: ~2.5 GB, plus KV cache and context. ~4-5 GB total at 8k context. Actually KV cache for 4B: 36 layers × 8 KV heads × 128 head dim × 2 (K+V) × 2 bytes (fp16) = 36*8*128*2*2 = 147,456 bytes per token = 0.147 MB/token. At 32,768 tokens ≈ 4.8 GB. Hmm that's substantial. Let me compute: 36 layers * 8 heads * 128 dim = 36,864 elements per K, same for V → 73,728 elements × 2 bytes = 147,456 bytes/token ≈ 0.14 MB/token. 32768 tokens → 4.83 GB. Yes.
- Q8_0: ~4.3 GB
- F16: ~8.1 GB

Can fit on RTX 3060 12GB, RTX 4060 8GB (Q4), RTX 4090, Apple M-series. Deployment: llama.cpp, Ollama (Modelfile included), LM Studio, vLLM (needs safetensors, not GGUF directly — vLLM has GGUF support experimentally but limited), TGI (no GGUF).

Comparison: Qwen3-4B (base), Llama 3.2 3B Instruct, Phi-4-mini (3.8B), Gemma 3 4B. Provide table.

Limitations: licence unknown, no benchmarks, zero downloads/likes, mismatched repo name in the model card usage example (IKN03 vs Ramboop), only one quantization available, model card minimal so training data unknown, potential hallucination, fine-tune scope unknown ("my-assistant" generic conversational).

Now format: Spanish from Spain, only first word of headings capitalized (headings like "Resumen", "Especificaciones tecnicas" — "Especificaciones tecnicas" -> only first word capital, so "Especificaciones tecnicas" is fine; "Arquitectura y entrenamiento", "Capacidades", "Casos de uso", "Benchmarks y rendimiento", "Requisitos de hardware", "Comparativa con modelos similares", "Limitaciones y advertencias", "Enlaces"). Table rows: "Arquitectura" etc. — these are table cells, capitalization of first letter only; fine.

No emojis. Only markdown of the fact sheet.

Let me write it.

For the specs table:
| Arquitectura | Transformer denso (familia Qwen3), con atención de consulta agrupada; base Qwen3-4B |
| Parametros totales | 4.022.468.096 (~4,02 B) segun los pesos safetensors indexados |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Qwen3-4B declara 32.768 tokens nativos, ampliables a 131.072 con YaRN |
| Tipos de cuantizacion | Q4_K_M (unico fichero publicado: qwen3-4b.Q4_K_M.gguf) |
| Idiomas soportados | no disponible (el modelo base Qwen3 declara soporte de 119 idiomas) |
| Licencia | no disponible en el repositorio; el modelo base Qwen3-4B se publica bajo Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); no se publican safetensors |

Note: the HF info says "Parametros totales (dato real, safetensors): 4.022.468.096" — interesting given it's a GGUF repo. Mention.

Casos de uso: min 6.

Let's write.

For enlaces: HF repo URL, Unsloth repo, llama.cpp (?), the search results links. Include them as reference material but note relevance is low. I'll list the ones found.

Alright, writing.## Resumen

my-assistant-gguf es un ajuste fino conversacional del modelo Qwen3-4B, publicado por el usuario Ramboop en Hugging Face en formato GGUF. El repositorio contiene un unico fichero cuantizado, `qwen3-4b.Q4_K_M.gguf`, junto con un Modelfile para desplegarlo directamente en Ollama. El entrenamiento y la conversion a GGUF se realizaron con Unsloth, segun indica la propia model card, lo que situa al modelo en el ecosistema de inferencia local con llama.cpp.

El modelo es relevante por su perfil de consumo: con unos 4.022 millones de parametros y un tamano de repositorio de 2,5 GB, entra sin dificultad en GPU de gama consumer con 8 GB de VRAM o incluso en equipos Apple Silicon con memoria unificada, a diferencia de alternativas de mayor tamano. La familia Qwen3 es conocida por su soporte de modo "thinking" y su cobertura multilingue amplia, aunque en esta ficha no se confirma si el ajuste fino conserva o desactiva esas capacidades.

El principal caveat es la escasez de documentacion: la model card no especifica licencia, idiomas, pipeline ni datos de entrenamiento, el repositorio acumula cero descargas y cero likes en el momento de la consulta, y el ejemplo de uso de la model card apunta a otro identificador (`IKN03/my-assistant-gguf`) distinto del repositorio real (`Ramboop/my-assistant-gguf`). Se trata, por tanto, de un artefacto experimental mas que de un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención de consulta agrupada (GQA), base Qwen3-4B |
| Parametros totales | 4.022.468.096 (~4,02 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Qwen3-4B declara 32.768 tokens nativos, ampliables a 131.072 con YaRN |
| Tipos de cuantizacion | Q4_K_M (unico fichero publicado) |
| Idiomas soportados | no disponible (el modelo base Qwen3 declara 119 idiomas) |
| Licencia | no disponible en el repositorio; el modelo base Qwen3-4B se distribuye bajo Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); no se publican safetensors pese a que el indice de parametros se haya calculado sobre ellos |
| Tamano del repositorio | 2,5 GB |
| Ficheros incluidos | `qwen3-4b.Q4_K_M.gguf` y un Modelfile de Ollama |
| Fecha de publicacion | 2026-10-01 (creacion y ultima actualizacion el mismo dia) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-4B: un transformer denso de tipo decoder-only con atención de consulta agrupada, entrenado por Alibaba Qwen. No hay informacion en la model card sobre el numero de tokens de entrenamiento del ajuste fino, la composicion del dataset, si se aplicaron tecnicas de alineacion como RLHF o DPO, ni si se conservo el modo de razonamiento explicito ("thinking") de la familia Qwen3. Todo lo que se documenta es el flujo de trabajo: ajuste fino y conversion a GGUF mediante Unsloth, que aplica optimizaciones de memoria y velocidad en el entrenamiento (el autor afirma que el entrenamiento fue "2x mas rapido" con esta herramienta).

Unsloth genera los ficheros GGUF a partir del modelo ajustado y exporta tambien la plantilla de chat Jinja, motivo por el cual los ejemplos de uso incluyen el flag `--jinja`. La cuantizacion disponible es Q4_K_M, un esquema de 4 bits con mezcla de precision (algunas capas y tensores clave en 6 bits) que suele ofrecer un equilibrio razonable entre calidad y tamano para modelos de esta escala. No se han publicado otras cuantizaciones (Q5, Q6, Q8, F16) en este repositorio.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` y el nombre del modelo indican un ajuste orientado a dialogo de asistente.
- Razonamiento y matematicas: heredados del modelo base Qwen3-4B, que rinde bien en tareas de razonamiento de escala pequena; no confirmado en este ajuste concreto.
- Generacion de codigo: capacidad esperable del base Qwen3-4B; no hay datos especificos del ajuste fino.
- Modo thinking: no disponible; no se confirma si el ajuste conserva el modo de razonamiento explicito de Qwen3 ni si esta desactivado por defecto.
- Tool calling / function calling: no disponible; llama.cpp soporta gramaticas y plantillas de herramientas, pero no hay evidencia de que este ajuste haya sido entrenado para ello.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Multilingue: no disponible en la model card; el modelo base Qwen3 declara soporte de 119 idiomas.
- Vision o audio: no disponible; se trata de un modelo exclusivamente de texto (la mencion a `llama-mtmd-cli` en la model card es plantilla generica de Unsloth, no implica capacidades multimodales).
- Despliegue local: compatible con llama.cpp, Ollama y cualquier runtime que consuma GGUF.

## Casos de uso

- Asistente conversacional local y privado: al ocupar unos 2,5 GB en Q4_K_M, puede ejecutarse en un portatil con GPU de 8 GB o en un Mac con 16 GB de memoria unificada, sin enviar datos a terceros.
- Prototipado rapido de chatbots: el Modelfile de Ollama incluido permite levantar el modelo con un unico comando, lo que lo hace util para validar flujos de conversacion antes de invertir en modelos mayores.
- Automatizacion de tareas de texto en el puesto de trabajo: resumen de correos, reescritura de documentos o clasificacion de tickets, siempre que el contexto requerido quepa en la ventana del modelo base (32.768 tokens nativos).
- Asistencia de codigo en entornos con recursos limitados: autocompletado o explicacion de fragmentos en editores integrados que consuman endpoints compatibles con llama.cpp.
- Educacion y experimentacion academica: su tamano reducido permite ejecutar experimentos de ajuste fino adicionales con Unsloth en una unica GPU consumer, usando este repositorio como punto de partida.
- Inferencia en el borde (edge) o en dispositivos sin GPU dedicada: con cuantizacion Q4_K_M y CPU, es viable en equipos de escritorio modernos con 8-16 GB de RAM, aunque con latencias mas altas.
- Generacion de datos sinteticos a escala: por su bajo coste de inferencia, puede emplearse para producir borradores o etiquetas preliminares que luego se filtren con un modelo mayor.
- Base para ajustes especificos de dominio: al ser un artefacto derivado y pequeno, sirve como punto de partida para especializaciones verticales (legal, sanitario, atencion al cliente) sin requerir infraestructura de gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye en la model card ninguna tabla de MMLU, MMLU-Pro, GPQA, HumanEval, GSM8K, LiveCodeBench ni evaluaciones comparativas frente a otras versiones del modelo base. Tampoco se documenta el impacto del ajuste fino ni de la cuantizacion Q4_K_M sobre la calidad respecto al Qwen3-4B original.

## Requisitos de hardware

- VRAM para inferencia con Q4_K_M: aproximadamente 2,5-3 GB solo para los pesos; anadiendo la cache KV en FP16 (unos 0,14 MB por token con 36 capas y 8 cabezas KV), el consumo realista es de 4-5 GB con contexto de 8.000 tokens y de unos 7-8 GB si se agota la ventana nativa de 32.768 tokens.
- Cuantizaciones alternativas (no incluidas en el repositorio, estimaciones): Q8_0 en torno a 4,3 GB y F16 en torno a 8,1 GB de pesos.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, A100 o H100 para despliegues con muchas peticiones concurrentes. Modelos de 8 GB (RTX 3070/4060) son suficientes para contexto corto y usuario unico.
- GPU consumer: si, cabe holgadamente en cualquier GPU con 8 GB o mas, y con contexto reducido incluso en 6 GB.
- Apple Silicon: viable en chips M1/M2/M3 con 16 GB de memoria unificada o superior mediante llama.cpp o Ollama con aceleracion Metal.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama mediante el Modelfile incluido, LM Studio y cualquier frontend que acepte GGUF. vLLM y TGI no soportan GGUF de forma nativa completa, por lo que requeririan los pesos en safetensors, no publicados aqui.
- Latencia y throughput: no disponible; no se han publicado mediciones. Como referencia cualitativa, un modelo de 4 B en Q4_K_M suele generar decenas de tokens por segundo en GPU consumer modernas, pero no hay dato verificado para este artefacto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ramboop/my-assistant-gguf (este modelo) | ~4,02 B | no disponible (base: 32.768 tokens) | GGUF Q4_K_M | no disponible | Repositorio con 0 descargas y 0 likes |
| Qwen3-4B (modelo base) | 4,0 B | 32.768 tokens nativos, 131.072 con YaRN | safetensors, GGUF oficiales | Apache 2.0 | Amplia adopcion, multiples cuantizaciones |
| Llama 3.2 3B Instruct | 3,2 B | 131.072 tokens | safetensors, GGUF de terceros | Llama 3.2 Community License | Muy extendido en inferencia local |
| Phi-4-mini (3,8 B) | 3,8 B | 131.072 tokens | safetensors, GGUF de terceros | MIT | Extendido, orientado a razonamiento y matematicas |
| Gemma 3 4B | 4,0 B | 131.072 tokens | safetensors, GGUF de terceros | Gemma Terms of Use | Extendido, con capacidades multimodales en la familia |

La ventaja diferencial de este repositorio no esta en el rendimiento ni en la licencia, sino en el empaquetado: un unico fichero GGUF con Modelfile listo para Ollama. Frente al Qwen3-4B oficial, pierde trazabilidad (sin safetensors, sin licencia declarada, sin benchmarks) y anade un ajuste fino de proposito desconocido.

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no especifica licencia. Aunque el modelo base Qwen3-4B es Apache 2.0, la ausencia de licencia explicita en el derivado impide confirmar las condiciones de uso comercial sin consultar al autor.
- Sin benchmarks: no hay ninguna evaluacion publicada, ni del ajuste fino ni de la cuantizacion, por lo que no puede verificarse que el ajuste mejore al base ni que no lo degrade.
- Trazabilidad insuficiente: se desconoce el dataset de ajuste fino, el numero de tokens, la metodologia y si hubo filtrado de seguridad o alineacion. Esto dificulta evaluar sesgos y riesgos.
- Riesgo de alucinacion: inherente a los modelos de 4 B de la familia, especialmente en tareas de conocimiento factual, matematicas complejas y contextos largos.
- Identificador inconsistente en la model card: los ejemplos de uso apuntan a `IKN03/my-assistant-gguf` mientras que el repositorio real es `Ramboop/my-assistant-gguf`; hay que corregir el comando antes de usarlo.
- Una sola cuantizacion: solo existe Q4_K_M, lo que limita el ajuste fino entre calidad y rendimiento; no hay opcion de mayor precision para quien necesite maxima fidelidad.
- Contexto no confirmado: la model card no declara la ventana de contexto efectiva del ajuste; el valor de 32.768 tokens corresponde al modelo base y podria verse reducido por la configuracion de la plantilla GGUF.
- Madurez nula: cero descargas y cero likes implican ausencia de validacion por parte de la comunidad, sin issues ni informes de comportamiento en produccion.
- Sesgos: no evaluados. Los modelos Qwen3 heredan los sesgos de sus datos de preentrenamiento, y un ajuste fino sin documentar puede amplificarlos.
- Uso en produccion: no recomendado sin una evaluacion propia previa, especialmente en dominios regulados o con requisitos de atribucion de licencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ramboop/my-assistant-gguf
- Unsloth (herramienta de ajuste fino y conversion a GGUF): https://github.com/unslothai/unsloth
- Repositorio GGUF-Models en Hugging Face: https://huggingface.co/GGUF-Models
- mlx-serve (runtime local MLX + GGUF): https://mlxserve.com/
- GGUFloader/Mobile-AI-Assistant (asistente movil con modelos GGUF): https://github.com/GGUFloader/Mobile-AI-Assistant
- Guia de modelos locales con Ollama y cuantizacion GGUF: https://www.kunal-chowdhury.com/2026/08/run-local-ai-models.html
- Seleccion de modelos GGUF de 24B para 24 GB de VRAM: https://techtactician.com/best-24b-gguf-models-for-24gb-vram-local-rp/
- No se han encontrado papers, blogs tecnicos ni demos especificos de este ajuste fino.
