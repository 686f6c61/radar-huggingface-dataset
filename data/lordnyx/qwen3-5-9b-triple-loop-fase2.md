# Lordnyx/qwen3.5-9b-triple-loop-fase2

`, contrastive reasoning
- Preserves 64-layer virtual recurrent dynamics from Phase 1
- Physical: 32 physical transformer blocks (blk.0 to blk.31), ~9.2B params, ~17.9 GB bf16, ~6.02 GB Q5_K_M
- Logical: 8 prefix (0-7) 1x, middle 8-23 (16 blocks) 3x, suffix 24-31 1x → 64 logical layers
- Modes: Mode A native 32 layers; Mode B triple-loop 64 logical layers via engine/llamacpp_patch/ or `--override-kv qwen35.triple_loop=int:1`
- Memory: weights aliased via TENSOR_DUPLICATED, zero extra VRAM for weights; KV cache allocates 64 slots
- Entropy table: prefix 0-7 entropy 10.90; r0 8-23 +692% velocity, entropy 5.39, 'We' 42.0%; r1 24-39 +22.6%, entropy 8.65, 'Thinking' 7.9%, hypothesis certainty drops to 13.9%; r2 40-55 +24.7%, entropy 6.27, 'We' recovers 30.0%; suffix 56-63 +119.2%, entropy 0.61, 'We' 88.6%
- RL: 30 optimizer steps, full fine-tuning GRPO/R1-Zero, group size G=4, 1x H100 SXM5 80GB on Modal, AdamW lr 1e-6, grad clip 1.0, contrastive advantage scoring over verifiable multi-turn tool calling and code reasoning
- Phase 1: 2,100 steps distillation from Qwen3.8-27B (note: this is what the card says — probably a typo but I should report carefully... I can mention "destilación de 2.100 pasos desde un modelo de 27B según la model card" — careful. The card says "Qwen3.8-27B". I'll report it as stated.)
- 65.6% benchmark success, 100% contrastive group discrimination
- Weight drift section truncated.

Note: no benchmark table with MMLU/HumanEval etc. → "No se han publicado resultados de benchmarks en la informacion disponible" — well, there's "65.6% benchmark success" but no named benchmarks. I should note that.

Context length: not stated. "no disponible". Qwen3.5-9B base... but I shouldn't invent. Say no disponible.

Quantization types: GGUF mentioned (Q5_K_M sizes given), safetensors bf16. I can say bf16 safetensors y GGUF (se menciona Q5_K_M).

Params total: 8,953,803,264 (8.95B). Card says ~9.2 billion — quite different; actual safetensors count 8.95B. I'll use the real figure and note the card's ~9.2B claim.

Active params: not MoE → "no aplica (modelo denso)".

Architecture: Transformer denso con recurrencia de bucle triple (LoopSplit): 32 bloques físicos, ejecución lógica de 64 capas.

Languages: en, pt.

License: apache-2.0.

Weight format: safetensors, GGUF.

Repo size 73.2 GB — that's large; probably multiple quantizations + checkpoints.

Hardware requirements:
- bf16 ~17.9 GB weights + KV cache → fits on 24GB consumer GPU (RTX 3090/4090) barely; A100 40/80GB, H100.
- Q5_K_M ~6.02 GB → fits on 8-12GB GPUs (RTX 3060 12GB, 4060 Ti 16GB, etc.)
- Deployment: Transformers, vLLM (stock), llama.cpp with patch, Ollama presumably (not stated — be careful; llama.cpp based). I'll say llama.cpp con el parche, vLLM estándar, Transformers. Ollama no confirmado.
- Latency/throughput: no disponible. But note that triple-loop multiplies compute ~2x for middle blocks (3x on 16 of 32 blocks): FLOPs increase. Actually middle 16 blocks run 3x instead of 1x → total block-executions 8+48+8 = 64 vs 32 → 2x compute. And KV cache 64 slots. I can compute that as a derived estimate — it's arithmetic, not invented benchmark. I'll frame as "estimación derivada de la arquitectura".

Comparativa: compare with base Qwen3.5-9B, and... other similar models. I only know base Qwen3.5-9B from info. I could compare with the base model and note others as "no disponible" since I lack data. Maybe compare with base Qwen3.5-9B and note that no data for other alternatives. I'll do a table with this model vs Qwen3.5-9B base, and mark others as no disponible. Safer: table with base model only, plus mention that no comparative data available for other looped models. Hmm, the instruction says compare with 2-3 alternatives. I could include base Qwen3.5-9B and... I shouldn't invent specs of other models. I'll include base Qwen3.5-9B and clearly state that no se dispone de datos verificables de otras alternativas en la información proporcionada.

Limitaciones: bias unknown, hallucination risk, only en/pt, llama.cpp patch required for full recurrence, 30 RL steps small, community model with 2 likes/729 downloads, no eval published, truncated card, license apache-2.0 permits commercial use (inherited from base), the "Qwen3.8-27B" reference is odd/possibly typo — flag as inconsistency. Also confusion risk between Mode A and Mode B outputs. KV cache 64 slots → memory cost. Also no stated context length.

Enlaces: HF model URL, base model URL, license link, Modal link. Papers: none given. I'll list what's available.

Titles: only first word capitalized. So "## Resumen", "## Especificaciones tecnicas", "## Arquitectura y entrenamiento", "## Capacidades", "## Casos de uso", "## Benchmarks y rendimiento", "## Requisitos de hardware", "## Comparativa con modelos similares", "## Limitaciones y advertencias", "## Enlaces".

No emojis. Castilian Spanish. Use "cuantización", "tokens".

Note: "Especificaciones tecnicas" — without accents? The prompt writes them without accents in headings. I'd normally write "técnicas". The prompt style omits accents in headings but that's likely just their writing. I'll write proper Spanish with accents: "Especificaciones técnicas". Hmm, the rule says "Usa castellano de Espana, sin faltas de ortografia." So use accents. I'll use proper accents.

Benchmarks section: present the internal dynamics table (that's not a benchmark but empirical measurement) and note the 65.6% without named benchmark. Say no published MMLU/HumanEval/GSM8K.

Let me write.

Repo size 73.2 GB — mention that it includes multiple formats/quants.

Let me be careful about "phase 1 distillation from Qwen3.8-27B, 2100 steps" — report as stated in the card.

Write the ficha.

For hardware: 
- bf16: 17.9 GB pesos → + KV cache. En modo B, KV cache con 64 ranuras. Con 32k contexto sería grande; sin datos de longitud de contexto, no puedo estimar. I'll say the KV cache roughly doubles in Mode B vs Mode A.
- Q5_K_M 6.02 GB.
- GPU: RTX 4090/3090 24GB para bf16; A100 40/80GB y H100 80GB para entrenamiento/serving; consumer 8-16GB con Q5_K_M o Q4.

Deployment: Transformers, vLLM (stock, modo A), llama.cpp con engine/llamacpp_patch + `--override-kv qwen35.triple_loop=int:1`.

Casos de uso: minimum 6, concrete.

1. Agentes con tool calling multi-turno.
2. Razonamiento estructurado con CoT XML para pipelines que parsean `<think>` y `<tool_call>`.
3. Automatización de operaciones/DevOps: diagnóstico de sistemas distribuidos (the card's example).
4. Generación y revisión de código con razonamiento contrastivo (verificación de hipótesis).
5. Despliegue en local/edge con GGUF Q5_K_M en GPU de 8-12 GB.
6. Enrutamiento y clasificación con salida estructurada XML/JSON.
7. Investigación sobre recurrencia y latentes (interpretabilidad) — usar los loops para estudiar estados ocultos.
8. Portugués/inglés atención al cliente.

Good, 7-8.

Now write it all out.

For the "Parámetros activos" row: "no aplica (modelo denso, sin MoE)".

Context length: "no disponible (no se especifica en la información proporcionada)".

Quantization types: "safetensors en bf16; GGUF (se documenta Q5_K_M ≈ 6,02 GB)".

Let me write the final markdown.## Resumen

Qwen3.5-9B Triple-Loop (Phase 2 — RL Step 30) es un ajuste fino del modelo base Qwen/Qwen3.5-9B publicado por el usuario Lordnyx en HuggingFace. Su particularidad no es tanto el ajuste como la topología de ejecución: el checkpoint aplica un esquema denominado LoopSplit, en el que 32 bloques físicos de transformer se ejecutan formando una profundidad lógica de 64 capas, al repetir tres veces el bloque central (capas 8-23) con pesos compartidos. Sobre esa base, la Phase 2 aplica 30 pasos de aprendizaje por refuerzo (GRPO / R1-Zero) orientados a la adherencia a esquemas de tool calling, al razonamiento en cadena estructurado con etiquetas `<think>` y al razonamiento contrastivo.

El modelo tiene 8.953.803.264 parámetros reales según los tensores en safetensors (la model card cita ~9.200 millones, una cifra ligeramente superior a la del recuento del repositorio). Se distribuye con licencia Apache 2.0, en formatos safetensors (bf16) y GGUF, y declara soporte únicamente para inglés y portugués. El repositorio ocupa 73,2 GB, lo que sugiere la coexistencia de varias cuantizaciones y artefactos de entrenamiento junto a los pesos principales.

Su relevancia es doble: por un lado, es un ejemplo práctico de recurrencia por compartición de pesos en un LLM denso de ~9B, una línea de investigación que busca aumentar la profundidad efectiva sin aumentar el número de parámetros; por otro, incluye el parche `engine/llamacpp_patch/` para habilitar el modo de triple bucle real en llama.cpp, lo que permite reproducir la inferencia recursiva en hardware de consumo. Es un modelo de autor independiente, con 729 descargas y 2 likes en el momento de la consulta, sin resultados de benchmarks estándar publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso con recurrencia de bucle triple (LoopSplit): 32 bloques físicos, 64 capas lógicas |
| Parámetros totales | 8.953.803.264 (recuento safetensors); la model card indica ~9,2 mil millones |
| Parámetros activos | no aplica (modelo denso, sin MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | safetensors en bf16 (~17,9 GB); GGUF, con Q5_K_M documentado (~6,02 GB) |
| Idiomas soportados | inglés (en), portugués (pt) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

La arquitectura física es un transformer denso de 32 bloques (`blk.0` a `blk.31`) con tamaño de parámetros equivalente al Qwen3.5-9B original, cargable por Transformers, vLLM estándar y llama.cpp por defecto. La innovación está en el grafo de ejecución lógico: el prefijo (bloques 0-7) se ejecuta una vez para establecer el análisis sintáctico y los embeddings de alto nivel de la consulta; el tramo central (bloques 8-23, 16 bloques) se ejecuta tres veces consecutivas con pesos compartidos (`r_0 → r_1 → r_2`); y el sufijo (bloques 24-31) se ejecuta una vez para proyectar hacia los logits a través del RMSNorm final. El resultado es una profundidad virtual de 8 + (16 × 3) + 8 = 64 capas lógicas.

El modelo admite dos modos de operación. El modo A (nativo, 32 capas) ejecuta un único pase por los 32 bloques y ya ofrece resultados sólidos porque el entrenamiento usó supervisión profunda sobre las etapas del bucle. El modo B (recurrencia triple real, 64 capas lógicas) requiere el parche `engine/llamacpp_patch/` o un motor LoopSplit nativo con `--override-kv qwen35.triple_loop=int:1`; los pesos se aliasan en memoria mediante `TENSOR_DUPLICATED`, de modo que no se necesita VRAM adicional para los pesos, pero la caché KV reserva 64 ranuras, una por profundidad lógica, para mantener estados ocultos recurrentes distintos en cada pase.

En cuanto al entrenamiento, la Phase 1 consistió, según la model card, en 2.100 pasos de destilación desde un modelo de 27B (citado literalmente como «Qwen3.8-27B»). La Phase 2 añade exactamente 30 pasos de optimizador de ajuste fino completo con RL (GRPO / R1-Zero, tamaño de grupo G=4), sobre una única GPU NVIDIA H100 SXM5 de 80 GB en Modal, con AdamW, tasa de aprendizaje 1,0 × 10⁻⁶, recorte de gradiente 1,0 y una función de ventaja contrastiva sobre tareas verificables de tool calling multi-turno y razonamiento sobre código. El autor justifica la brevedad (30 pasos) por el riesgo de olvido catastrófico de las topologías latentes intermedias, y reporta un 65,6 % de éxito en su benchmark interno y un 100 % de discriminación de grupo en la señal contrastiva, sin especificar qué benchmark es.

## Capacidades

- Generación de texto conversacional en inglés y portugués, con modo de razonamiento explícito encapsulado en `<think>...</think>`.
- Tool calling y function calling con adherencia estricta al esquema `<tool_call>` y encapsulación XML, calibrado específicamente durante la Phase 2.
- Razonamiento agéntico multi-paso: el bucle central está diseñado para formar hipótesis (r_0), reflexionar críticamente y detectar ambigüedad (r_1), y sintetizar una resolución estructurada (r_2).
- Razonamiento contrastivo: evaluación de alternativas e hipótesis competidoras antes de colapsar a una respuesta final.
- Razonamiento sobre código, usado como dominio de entrenamiento junto al tool calling.
- Inspección de dinámica latente: al exponer 64 ranuras de caché KV es posible analizar entropía y velocidad latente por etapa del bucle.
- No se documentan capacidades de visión, audio ni multimodalidad.
- No se documenta longitud de contexto soportada ni capacidades matemáticas específicas evaluadas.

## Casos de uso

- Agentes con tool calling en producción: el ajuste RL de la Phase 2 se centró en la obediencia al esquema `<tool_call>` y en la encapsulación XML, por lo que el modelo es adecuado para orquestadores que parsean llamadas a funciones de forma programática y necesitan tolerancia cero a formatos inválidos.
- Automatización de operaciones y diagnóstico de sistemas distribuidos: el ejemplo que documenta el autor es precisamente un prompt ambiguo de sistemas distribuidos, donde el modelo forma una hipótesis, la cuestiona al detectar ambigüedad y converge a una respuesta razonada; encaja en asistentes de guardia que deben explicitar supuestos antes de recomendar una acción.
- Pipelines de razonamiento auditable: la separación entre `<think>` y la respuesta final permite registrar y revisar la traza de razonamiento en dominios regulados, algo que un modelo sin modo de pensamiento estructurado no ofrece de forma nativa.
- Despliegue local con GGUF: con Q5_K_M (~6,02 GB) el modelo cabe en GPUs de consumo de 8-12 GB, lo que habilita asistentes de código o agentes locales sin conexión, a costa de renunciar al modo B si no se aplica el parche.
- Generación y revisión de código en CI/CD: el entrenamiento RL incluyó tareas de razonamiento sobre código verificable, de modo que puede emplearse para proponer parches y justificar la decisión antes de emitir el diff, integrándose como paso de revisión previa al merge.
- Investigación en interpretabilidad y recurrencia: las 64 ranuras de caché KV y la separación explícita de etapas permiten instrumentar entropía y vectores latentes por pase, un entorno útil para estudiar cómo se transforma una representación a lo largo de profundidad recurrente frente a profundidad física.
- Atención al cliente bilingüe inglés-portugués: con solo esos dos idiomas declarados, es viable en mercados de Brasil, Portugal y clientes angloparlantes, pero no en castellano.
- Clasificación y enrutamiento con salida estructurada: la disciplina de formato XML/JSON aprendida por RL lo hace apropiado para extraer campos y decidir rutas en sistemas de tickets.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni equivalentes) en la información disponible. El autor reporta un 65,6 % de éxito en un benchmark propio no identificado y un 100 % de discriminación de grupo en la señal contrastiva, cifras no comparables con otras evaluaciones públicas.

La model card sí incluye una medición empírica de la dinámica interna sobre un prompt ambiguo de sistemas distribuidos:

| Etapa | Capas lógicas | Velocidad latente (Δh/h) | Entropía de salida | Comportamiento dominante |
|---|---|---|---|---|
| Prefijo | 0-7 | — | 10,90 | Alta incertidumbre; análisis sintáctico y de alcance |
| Bucle medio r_0 | 8-23 | +692 % | 5,39 | Formación de hipótesis; «We» al 42,0 % |
| Bucle medio r_1 | 24-39 | +22,6 % | 8,65 | Reflexión y duda; «Thinking» sube al 7,9 %, certeza de la hipótesis baja al 13,9 % |
| Bucle medio r_2 | 40-55 | +24,7 % | 6,27 | Síntesis; «We» se recupera al 30,0 % |
| Sufijo | 56-63 | +119,2 % | 0,61 | Proyección decisiva; «We» al 88,6 % |

Estos datos describen el comportamiento interno del modelo, no su calidad frente a tareas estandarizadas.

## Requisitos de hardware

- VRAM en bf16: ~17,9 GB solo para pesos, más caché KV; en modo B la caché reserva 64 ranuras frente a 32, con el consiguiente aumento del coste de estado.
- VRAM en GGUF Q5_K_M: ~6,02 GB de pesos, según la model card.
- GPU profesionales: A100 de 40 o 80 GB y H100 de 80 GB cubren bf16 con holgura; el entrenamiento de la Phase 2 se realizó en una H100 SXM5 de 80 GB.
- GPU de consumo: bf16 encaja ajustadamente en RTX 3090 o RTX 4090 (24 GB); con Q5_K_M o cuantizaciones inferiores cabe en tarjetas de 8-12 GB, como RTX 3060 12 GB o RTX 4060 Ti 16 GB.
- Cómputo en modo B: al ejecutar tres veces 16 de los 32 bloques, el número de ejecuciones de bloque pasa de 32 a 64, aproximadamente el doble de FLOPs por token que el modo A. Es una estimación derivada de la topología descrita, no una medición publicada.
- Opciones de despliegue: Hugging Face Transformers y vLLM estándar (solo modo A, 32 capas); llama.cpp con el parche incluido y `--override-kv qwen35.triple_loop=int:1` para el modo B; motores LoopSplit nativos.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de latencia por token en ninguno de los dos modos.

## Comparativa con modelos similares

No se dispone de datos verificables de benchmarks ni de especificaciones de contexto para establecer comparaciones cuantitativas con otras alternativas. La única comparación documentada es con el modelo base del que deriva:

| Modelo | Parámetros | Profundidad efectiva | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Lordnyx/qwen3.5-9b-triple-loop-fase2 | 8,95 B | 32 capas físicas / 64 lógicas | no disponible | Apache 2.0 | safetensors, GGUF | RL de 30 pasos sobre tool calling y CoT |
| Qwen/Qwen3.5-9B (base) | ~9 B | 32 capas | no disponible | Apache 2.0 | safetensors | Sin recurrencia ni ajuste RL de agente |

Para el resto de alternativas de la misma categoría (modelos densos de ~9B con soporte de tool calling) no hay datos en la información proporcionada, por lo que la comparación queda como no disponible.

## Limitaciones y advertencias

- Modelo de autor independiente con 729 descargas y 2 likes: no ha pasado por un proceso de validación de la comunidad ni por evaluaciones de terceros.
- Ausencia total de benchmarks estándar publicados; el 65,6 % reportado corresponde a un benchmark interno sin especificar, lo que impide verificar la mejora frente al modelo base.
- Solo inglés y portugués: no hay soporte declarado de castellano ni de otros idiomas, y el comportamiento fuera de esos dos idiomas es impredecible.
- Longitud de contexto no documentada: no es posible planificar despliegues que dependan de ventanas largas sin medirla previamente.
- Requiere parche para funcionar en modo recursivo real: sin el parche de llama.cpp o un motor LoopSplit, se ejecuta el modo A de 32 capas y se pierde la dinámica de triple bucle; las salidas de ambos modos pueden diferir.
- La caché KV de 64 ranuras en modo B incrementa el consumo de memoria de estado y reduce el espacio disponible para contexto en comparación con un modelo de 32 capas del mismo tamaño.
- Riesgo de alucinación no cuantificado. El bucle de reflexión puede producir trazas `<think>` plausibles pero incorrectas, y el formato estructurado no garantiza la veracidad del contenido.
- Sesgos: no se documenta ninguna evaluación de sesgo, toxicidad ni alineación más allá de la señal contrastiva de RL.
- Entrenamiento RL muy corto (30 pasos a 1 × 10⁻⁶): el propio autor reconoce el riesgo de olvido catastrófico y limita la profundidad del ajuste, de modo que la alineación de comportamiento puede ser frágil fuera de las distribuciones de entrenamiento.
- Inconsistencia documental: la model card cita ~9,2 mil millones de parámetros frente a los 8,95 mil millones del recuento safetensors, y menciona un modelo de origen «Qwen3.8-27B» que no coincide con la nomenclatura del modelo base declarado; conviene tratar ambos datos con cautela.
- Licencia Apache 2.0: permite uso comercial, pero el titular de los derechos del modelo base es Qwen y las condiciones del modelo derivado heredan esa licencia; no se documentan cláusulas adicionales del autor.
- La model card está truncada en la sección de deriva de pesos (Phase 1 frente a Phase 2), por lo que falta información sobre la magnitud real del ajuste.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Lordnyx/qwen3.5-9b-triple-loop-fase2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Plataforma de cómputo empleada en el entrenamiento: https://modal.com
- Repositorio del parche para llama.cpp: ruta `engine/llamacpp_patch/` incluida en el repositorio del modelo
- Paper, blog o demo adicionales: no disponible en la información proporcionada
