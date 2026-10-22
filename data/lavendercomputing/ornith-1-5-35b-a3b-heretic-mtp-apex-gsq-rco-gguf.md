# lavendercomputing/Ornith-1.5-35B-A3B-Heretic-MTP-APEX-GSQ-RCO-GGUF

blocks, <tool_call> blocks.
- Abliteration via Heretic v1.4.0 (trial 62) from SC117/Ornith-1.5-35B-A3B-Heretic-MTP-APEX-GGUF tier I-Quality at ~5.29 bpw
- MTP (multi-token prediction) head replaced with 19-tensor fused BF16 head from shisa-ai/Ornith-1.5-35B-A3B-MTP-ONLY (Qwen3.6 graft + 12K KL distillation)
- Two GGUF files:
  - IQ3_XXS: 12.76 GiB, 3.01 BPW
  - IQ3_S: 14.87 GiB, 3.50 BPW
- Attention Q6_K, embeddings/shared expert/router/MTP block Q8_0, mmproj f16 full precision
- imatrix from gbuzhf/Ornith-1.5-35B-A3B-Abliterated-MTP-UD-APEX-GGUF
- llama.cpp commit f3f31a7
- Honest limits: second-generation quant, quality below proper GSQ-RCO from bf16; abliteration behavioral not perfect

Search results:
- https://huggingface.co/lavendercomputing/Ornith-1.5-35B-A3B-Heretic-MTP-APEX-GSQ-RCO (likely non-GGUF repo)
- https://huggingface.co/SC117/Ornith-1.5-35B-A3B-Heretic-MTP-APEX-GGUF
- local-ai-zone pages
- modelscope mudler/Ornith-1.5-35B-A3B-APEX-MTP-GGUF (description is wrong — image super-resolution, seems mismatched)
- Vendor card: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- https://deep-reinforce.com/ornith.html (Ornith Blog)
- https://github.com/p-e-w/heretic
- shisa-ai/Ornith-1.5-35B-A3B-MTP-ONLY

No benchmarks provided. Must not invent numbers.

Total parameters: The model card says ~35B total, ~3B active. The HF metadata "446.571.248" is likely a per-file/partial metadata artifact — I should note "35B (según model card); metadatos de safetensors del repo indican 446.571.248 para un tensor" — better to say ~35B total (MoE), ~3B active, and note the metadata discrepancy. Actually the instruction says use the real data (446,571,248 total params safetensors). Hmm — conflicting. I should report both: model card says ~35B total / ~3B active; HF metadata reports 446.571.248 as "parametros totales (dato real, safetensors)" which likely corresponds to a single tensor or partial index. I'll present as: Parametros totales: ~35B (MoE; el índice safetensors del repo declara 446.571.248, probablemente parcial). Parametros activos: ~3B.

Quantization types: IQ3_XXS (3.01 bpw), IQ3_S (3.50 bpw), plus upstream 5.29 bpw I-Quality, Q8_0 for certain tensors, Q6_K attention, f16 mmproj.

Languages: not available. Vendor likely multilingual but not stated → "no disponible".

Formats: GGUF (multiple files), mmproj.f16.gguf.

Architecture: MoE transformer, based on Qwen3.5/Gemma4 lineage, with MTP (multi-token prediction) head for speculative decoding. Multimodal via vision projector (mmproj) — image-text-to-text pipeline.

Training: continued pretraining + reinforcement self-improvement (task generation, scaffold construction, rollout optimization), post-training; vision projector presumably inherited. No token counts available.

Hardware:
- IQ3_XXS 12.76 GiB: fits in 16 GB VRAM (RTX 4080/4090/5070 Ti) with some context; with KV cache for 262k context needs more.
- IQ3_S 14.87 GiB: 16 GB tight, 24 GB comfortable (RTX 3090/4090, A5000).
- Note repo total 29.9 GB includes both quants + mmproj.
- Deployment: llama.cpp (tested at commit f3f31a7), Ollama (via GGUF import), LM Studio, llama-cpp-python, possibly koboldcpp. vLLM/TGI do not support GGUF IQ quants — note.
- MTP speculative decoding preserved → throughput gain.

Comparativa: with ornith-ai/Ornith-1.5-35B-A3B (uncensored vs safety-aligned), SC117 Heretic APEX (5.29 bpw), Qwen3.5-35B-A3B base lineage. I should be careful — I don't have benchmark data. I can compare parameters, context, license, availability qualitatively, no invented numbers.

Limitations: abliteration removes refusals → safety risk, legal/compliance risk, potential harmful output; second-gen quant quality loss; vision projector full precision; small edge-case detokenization; no benchmarks; metadata param count discrepancy; the base is an agentic coding model; reasoning tokens add latency; 262k context requires lots of RAM/KV cache; license apache-2.0 but abliterated derivative — upstream license link apache-2.0; note that removing refusals may break terms of use of upstream.

Also note: repo has 0 downloads, 0 likes, created recently — freshness, unverified. Smoke-tested only on CPU llama.cpp.

Let me write the ficha.

Structure headings required exactly.

Title capitalization: only first word capitalized. E.g. "## Resumen", "## Especificaciones tecnicas", "## Arquitectura y entrenamiento", "## Capacidades", "## Casos de uso", "## Benchmarks y rendimiento", "## Requisitos de hardware", "## Comparativa con modelos similares", "## Limitaciones y advertencias", "## Enlaces".

Note: "Especificaciones tecnicas" — sin tilde per given structure, but I should use proper Spanish. The instruction gives the structure with "tecnicas" without accents probably due to formatting; I'll use proper accents "Especificaciones técnicas" — hmm, they said use castellano de España, sin faltas de ortografía. So accents are appropriate. I'll write "## Especificaciones técnicas". That's fine.

Benchmarks: "No se han publicado resultados de benchmarks en la informacion disponible." — I'll write with proper accent: "No se han publicado resultados de benchmarks en la información disponible."

Casos de uso: min 6, concrete.

Let me detail:

1. Agente de código autónomo en local: el modelo base es un modelo agéntico de coding (Qwen3.5 MoE), con tool calling nativo en bloques <tool_call> y contexto de 262.144 tokens; el cuantizado a 3,5 bpw cabe en una RTX 4090 (24 GB) y permite ejecutar bucles de edición-ejecución-prueba sin enviar código a la nube.
2. Asistente de razonamiento con cadena de pensamiento visible: el modo <think> permite auditar el razonamiento; útil en entornos educativos o de depuración, mostrando el proceso.
3. Procesamiento de documentos largos con imágenes: pipeline image-text-to-text con mmproj f16 → OCR de facturas/planos + preguntas, contexto de 262k ≈ 200k palabras.
4. Despliegue air-gapped en investigación de seguridad / red teaming: variante abliterada permite estudiar comportamiento de rechazo y jailbreaks; útil para evaluar robustez de filtros.
5. Generación de código en CI/CD: llama.cpp server + MTP speculative decoding para reducir latencia; integración con editores (Continue.dev, Cline).
6. Atención al cliente / soporte técnico multi-turno local con datos sensibles (sanidad, legal) donde no se puede usar API.
7. Analítica de repositorios: indexar y responder sobre bases de código de varios cientos de miles de tokens.
8. Prototipado de investigación en cuantización: el repo incluye scripts reproducibles (plan_alloc.py, quantize-ornith.sh) → banco de pruebas para estudiar impacto de recetas de bits por tensor.

Hardware detail:
- Pesos: 12,76 GiB (IQ3_XXS), 14,87 GiB (IQ3_S). Con overhead de llama.cpp y KV cache: para 32k contexto estimar +2–4 GB; para 262k completo, decenas de GB (no disponible cifra exacta). Hmm, better say "no disponible" for exact KV. I can estimate roughly but rules say don't invent. I could give a reasoned estimate labelled as estimate. I'll say "estimación: el KV cache crece linealmente con el contexto; para ventanas de 32k–64k conviene reservar 2–6 GB adicionales (no publicado por el autor)". That's an estimate flagged. Careful. Maybe just say "no disponible" for KV figures and note that full 262k requires much more memory.

- Consumer GPU: IQ3_XXS cabe en 16 GB (RTX 4070 Ti Super/4080/4090/5070 Ti) con contexto moderado; IQ3_S requiere 16 GB muy justos o 24 GB.
- GPU profesionales: A100 40/80, H100 no aplican porque llama.cpp IQ kernels son CUDA genéricos; sm_90 no requerido (a diferencia de GSQ/RCO originales que exigen sm_90+). Good point: the original GSQ/RCO engines require sm_90+ (H100/H200); these GGUF equivalents run anywhere llama.cpp supports.
- Deployment: llama.cpp (commit f3f31a7 probado), Ollama, LM Studio, koboldcpp, llama-cpp-python, llama.cpp server con MTP. vLLM/TGI: no soportan estos GGUF IQ de forma fiable (vLLM soporta GGUF pero no todos los tipos IQ; indicar precaución).
- Throughput: no disponible; MTP preservado en Q8_0 permite decodificación especulativa.

Comparativa table: 
- Ornith-1.5-35B-A3B (vendor, ornith-ai): 35B/3B, 262k, apache-2.0, bf16+GGUF, con rechazos alineados, benchmarks no disponibles.
- SC117/Ornith-1.5-35B-A3B-Heretic-MTP-APEX-GGUF: abliterado, ~5,29 bpw, mayor fidelidad, ~20,7 GB.
- Qwen3.5 (base lineage) — no tengo datos concretos; maybe compare with "el propio vendor BF16". Third: gbuzhf abliterated UD-APEX GGUF. Or "Ornith-1.5-35B-A3B-APEX-MTP-GGUF (mudler)". I'll do 3 rows: vendor BF16/GGUF, SC117 Heretic APEX 5.29 bpw, and this repo's two builds. That's more a within-family comparison. Maybe add Qwen3.5-35B-A3B as architecture ancestor with "no disponible" for specs I don't know. I'd rather keep to known ones.

Let me include a comparativa table with columns: Modelo | Parámetros (total/activos) | Contexto | Cuantización | Licencia | Notas.

Links:
- HF repo: https://huggingface.co/lavendercomputing/Ornith-1.5-35B-A3B-Heretic-MTP-APEX-GSQ-RCO-GGUF
- Non-GGUF sibling: https://huggingface.co/lavendercomputing/Ornith-1.5-35B-A3B-Heretic-MTP-APEX-GSQ-RCO
- Vendor: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Vendor GGUF base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-GGUF
- SC117: https://huggingface.co/SC117/Ornith-1.5-35B-A3B-Heretic-MTP-APEX-GGUF
- MTP graft: https://huggingface.co/shisa-ai/Ornith-1.5-35B-A3B-MTP-ONLY
- imatrix: https://huggingface.co/gbuzhf/Ornith-1.5-35B-A3B-Abliterated-MTP-UD-APEX-GGUF
- Heretic: https://github.com/p-e-w/heretic
- Blog: https://deep-reinforce.com/ornith.html
- License: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B/blob/main/LICENSE
- local-ai-zone: https://local-ai-zone.github.io/models/ornith-1-5-35b-a3b-heretic-mtp-apex.html
- modelscope mudler: https://www.modelscope.cn/models/mudler/Ornith-1.5-35B-A3B-APEX-MTP-GGUF
- llama.cpp commit f3f31a7

Now write. Keep tone technical, no emojis, no invented data.

Total params row: "≈35 000 M (MoE). El índice safetensors del repo declara 446 571 248, cifra parcial que no refleja el total del modelo".

Format weights: GGUF (IQ3_XXS, IQ3_S) + mmproj.f16.gguf.

Let me write the resumen of 2-3 paragraphs, 6-10 lines.

Write now.## Resumen

Ornith-1.5-35B-A3B-Heretic-MTP-APEX-GSQ-RCO-GGUF es una requantización comunitaria del modelo Ornith-1.5-35B-A3B del laboratorio ornith-ai (DeepReinforce), un transformer de mezcla de expertos (MoE) de aproximadamente 35 000 millones de parámetros totales con unos 3000 millones activos por token y una ventana de contexto de 262 144 tokens. El modelo original se construye sobre la estirpe Qwen3.5/Gemma4 mediante preentrenamiento continuado y un bucle de auto-mejora por refuerzo, y está diseñado como modelo de razonamiento con bloques `<think>…</think>` y llamadas a herramientas en bloques `<tool_call>`.

El artefacto que nos ocupa no es el modelo del proveedor, sino una cadena de derivaciones: primero se aplicó una ablación de rechazos (abliteration) sin entrenamiento con la herramienta Heretic v1.4.0 (Trial 62), publicada por SC117 a ~5,29 bits por peso; después, el autor `lavendercomputing` generó dos builds GGUF de segunda generación a 3,01 y 3,50 bpw con una receta propia de asignación de bits por tensor («GSQ-RCO-style»), preservando la cabeza MTP (multi-token prediction) en Q8_0 para no perder la decodificación especulativa y manteniendo el proyector de visión en f16.

Su relevancia práctica es doble: por un lado, permite ejecutar un MoE de 35B con capacidades agénticas y multimodales en GPUs de consumo de 16–24 GB; por otro, documenta con scripts reproducibles una metodología de cuantización extrema sobre un maestro ya cuantizado, lo que lo convierte en un caso de estudio útil sobre la pérdida de calidad acumulada. El repositorio no incluye benchmarks y no ha recibido descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con cabeza MTP (multi-token prediction) para decodificación especulativa; linaje Qwen3.5/Gemma4; multimodal vía proyector de visión (pipeline image-text-to-text) |
| Parametros totales | ~35 000 M (MoE). El índice safetensors del repo declara 446 571 248, cifra parcial que no representa el total del modelo |
| Parametros activos | ~3000 M por token |
| Longitud de contexto | 262 144 tokens (según model card) |
| Tipos de cuantizacion | GGUF IQ3_XXS (3,01 bpw, 12,76 GiB) e IQ3_S (3,50 bpw, 14,87 GiB); atención en Q6_K; embeddings, experto compartido, router y bloque MTP completo en Q8_0; maestro ablacionado de origen a ~5,29 bpw (I-Quality) |
| Idiomas soportados | no disponible (la model card no declara lista de idiomas) |
| Licencia | Apache 2.0 (heredada del modelo del proveedor) |
| Formato de pesos | GGUF (dos ficheros cuantizados) + `mmproj.f16.gguf` (proyector de visión en BF16) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con enrutamiento por token: de los ~35B parámetros, solo ~3B se activan por paso, lo que reduce el coste de cómputo frente a un modelo denso del mismo tamaño. Incorpora una cabeza MTP nativa pensada para decodificación especulativa, un proyector de visión que habilita entrada de imagen y un modo de razonamiento explícito que precede a la respuesta final con un bloque `<think>`. Según la model card, Ornith-1.5 se entrena extendiendo el bucle de auto-mejora de Ornith-1.0 a la generación conjunta de tareas, la construcción de andamiajes (scaffolds) y la optimización de rollouts, en lugar de depender de un conjunto fijo de tareas curadas por humanos; no se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del corpus ni los detalles de RLHF/DPO.

Sobre esa base, esta ficha describe dos capas de modificación. La primera es la abliteración con Heretic v1.4.0: una técnica sin entrenamiento que estima la «dirección de rechazo» en el espacio de activaciones y la proyecta fuera de determinadas matrices de pesos, validando el resultado contra una batería de pruebas de comportamiento y conservando el mejor pase dentro de una búsqueda acotada por divergencia KL; el resultado público es el Trial 62 de SC117, a ~5,29 bpw, con la cabeza MTP nativa sustituida por una cabeza fusionada de 19 tensores procedente de shisa-ai/Ornith-1.5-35B-A3B-MTP-ONLY (injerto Qwen3.6 + destilación KL de 12K). La segunda es la requantización: `plan_alloc.py` genera una escalera de bits por tensor ponderada por aristas que imita la estructura de las recetas GSQ/RCO de 3 bits (bloques de borde en el escalón más alto, bloques internos más comprimidos, los expertos enrutados absorbiendo el 93% de la compresión), con una importance matrix tomada de gbuzhf/Ornith-1.5-35B-A3B-Abliterated-MTP-UD-APEX-GGUF. Cabe subrayar que los motores GSQ/RCO originales solo emiten `compressed-tensors` de HF y requieren kernels sm_90+, por lo que estos GGUF son equivalentes metodológicos, no clones bit a bit.

## Capacidades

- Generación de texto y razonamiento explícito en modo *thinking*: la respuesta se abre con un bloque `<think>…</think>` auditable antes del texto final.
- Llamada a funciones y herramientas mediante bloques `<tool_call>`, lo que permite integrarlo en bucles agénticos.
- Razonamiento multi-paso y planificación de tareas propia de un modelo entrenado para entornos agénticos de programación.
- Generación y edición de código, con el sesgo del modelo base orientado a tareas de ingeniería de software.
- Matemáticas y razonamiento simbólico como parte del entrenamiento de refuerzo del modelo base (sin cifras públicas disponibles).
- Entrada de imagen junto a texto gracias al proyector `mmproj.f16.gguf` conservado en BF16.
- Contexto muy largo: 262 144 tokens, adecuado para analizar repositorios completos o expedientes extensos.
- Decodificación especulativa vía MTP intacta, al mantener el bloque completo en Q8_0.
- Comportamiento de rechazo atenuado por diseño (variante ablacionada), lo que cambia el perfil de respuesta en temas sensibles.
- Capacidades multilingües: no disponible (no se declara lista de idiomas).

## Casos de uso

- Agente de código autónomo en local: con tool calling nativo y 262 144 tokens de contexto, se puede lanzar un bucle de leer-fichero, editar, ejecutar tests y corregir dentro del propio repositorio, sin enviar código propietario a una API externa.
- Integración en pipelines de CI/CD: el binario de llama.cpp puede exponer un servidor HTTP que actúe como revisor automático de *pull requests* o generador de parches, usando la cabeza MTP para reducir la latencia de decodificación en cada iteración.
- Análisis de documentación técnica con imágenes: al aceptar entrada image-text-to-text, sirve para extraer datos de diagramas de arquitectura, capturas de paneles o planos y responder preguntas cruzadas con el texto del expediente.
- Procesamiento de expedientes largos: contratos, historiales clínicos o sumarios de cientos de miles de tokens caben en una sola ventana, evitando estrategias de troceado y recuperación que rompen la coherencia entre secciones.
- Investigación en seguridad y *red teaming*: la variante ablacionada permite estudiar empíricamente qué patrones de prompt siguen disparando rechazos y evaluar la robustez de filtros propios frente a un modelo con el comportamiento de negativa atenuado.
- Asistencia al cliente con datos sensibles en despliegue air-gapped: sectores con requisitos de residencia de datos (legal, sanitario, administración) pueden mantener conversaciones multi-turno sobre su propia documentación sin salida a Internet.
- Docencia y depuración de razonamiento: el bloque `<think>` visible permite mostrar al usuario el proceso intermedio, útil para revisar por qué el modelo llegó a una conclusión en ejercicios de matemáticas o análisis lógico.
- Banco de pruebas de cuantización: los scripts `plan_alloc.py`, `quantize-ornith.sh` y `smoke-test.sh` permiten reproducir la receta y medir el impacto de distintas asignaciones de bits por tensor sobre la perplejidad y la coherencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no reporta MMLU, HumanEval, GSM8K ni evaluaciones equivalentes para ninguna de las dos builds; la única validación declarada es una prueba de humo (`smoke-test.sh`) sobre llama.cpp en CPU (commit f3f31a7) que confirma que ambos ficheros cargan y generan texto coherente.

## Requisitos de hardware

- Pesos en disco: 12,76 GiB (IQ3_XXS) y 14,87 GiB (IQ3_S); el repositorio completo ocupa 29,9 GB porque incluye ambas builds y el proyector de visión.
- VRAM para inferencia: IQ3_XXS encaja en GPUs de 16 GB; IQ3_S exige 16 GB muy justos y se recomienda 24 GB. Hay que sumar el *KV cache*, que crece de forma lineal con el contexto: usar los 262 144 tokens completos requiere mucha más memoria que los pesos (el autor no publica cifras de KV cache).
- GPUs de consumo: RTX 4080/4070 Ti Super de 16 GB para la build de 3,01 bpw; RTX 3090/4090 de 24 GB para la de 3,50 bpw con contextos amplios.
- GPUs profesionales: A100 40/80 GB y H100 permiten contextos largos y concurrencia, aunque no son necesarias: a diferencia de los motores GSQ/RCO originales (restringidos a sm_90+), estos GGUF usan kernels estándar de llama.cpp y funcionan en tarjetas más antiguas. El autor realizó las pruebas en CPU con 4× V100 disponibles pero sin usarlas para la ablación.
- Despliegue: llama.cpp (probado en el commit f3f31a7, incluye soporte MTP), Ollama, LM Studio, koboldcpp y `llama-cpp-python`. vLLM y TGI no están validados para estos tipos IQ3; si se necesita un servidor de alto rendimiento, conviene verificar el soporte exacto de la versión antes de comprometerse.
- Latencia y throughput: no disponible. Cualitativamente, la decodificación especulativa con MTP en Q8_0 debería reducir el tiempo por token frente a una decodificación autoregresiva pura, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros (total/activos) | Contexto | Cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| Este repo (lavendercomputing, GSQ-RCO IQ3_XXS / IQ3_S) | ~35B / ~3B | 262 144 | 3,01 y 3,50 bpw | Apache 2.0 | Ablacionado + requantizado sobre maestro de 5,29 bpw; MTP y visión preservados |
| SC117/Ornith-1.5-35B-A3B-Heretic-MTP-APEX-GGUF | ~35B / ~3B | 262 144 | ~5,29 bpw (I-Quality) | Apache 2.0 | Fuente directa de esta ficha; mayor fidelidad, ~20,7 GB |
| ornith-ai/Ornith-1.5-35B-A3B (y su GGUF) | ~35B / ~3B | 262 144 | BF16 (~70 GB) y GGUF del proveedor | Apache 2.0 | Referencia sin ablacionar; rechazos alineados intactos; comportamiento de razonamiento y tool calling originales |
| gbuzhf/Ornith-1.5-35B-A3B-Abliterated-MTP-UD-APEX-GGUF | ~35B / ~3B | 262 144 | GGUF UD-APEX | Apache 2.0 | Origen de la importance matrix; otra ruta de ablación/quantización |

No se dispone de datos de benchmarks que permitan comparar rendimiento real entre estas variantes; la comparación anterior es estructural (parámetros, contexto, licencia y fidelidad de cuantización).

## Limitaciones y advertencias

- La ablación de rechazos es un cambio de comportamiento, no una garantía: el propio autor advierte que prompts con forma de *jailbreak* y temas adyacentes a la seguridad pueden seguir disparando negativas.
- Riesgo de daño y de cumplimiento: un modelo sin negativas puede producir contenido que vulnere políticas de uso aceptable, normativa sectorial o términos de servicio de terceros. Antes de un despliegue en producción conviene añadir filtros externos y revisar el marco legal aplicable.
- Pérdida de calidad acumulada: se trata de una cuantización de segunda generación (ablación → maestro de 5,29 bpw → 3,0/3,5 bpw). El autor reconoce explícitamente que la calidad queda por debajo de lo que daría una receta GSQ/RCO aplicada directamente sobre el BF16 del proveedor.
- No es una reproducción bit a bit de GSQ/RCO: los motores originales solo emiten `compressed-tensors` y requieren sm_90+; aquí se imita la estructura de la receta con un solver propio.
- Con 3,01 bpw se comprimen los expertos enrutados (93% de los parámetros) hasta IQ2_XS/IQ2_S en los bloques internos, lo que puede degradar tareas de razonamiento fino y de código de alta precisión.
- Alucinación: no hay evaluaciones publicadas de fidelidad factual para ninguna de las builds; el modo `<think>` puede dar una falsa sensación de rigor si el usuario no verifica las afirmaciones.
- Idiomas: la model card no declara cobertura lingüística, por lo que el rendimiento en castellano no está verificado.
- Contexto: los 262 144 tokens son nominales; con estas cuantizaciones, usar la ventana completa exige memoria muy superior a la indicada por el tamaño de los pesos.
- Madurez: repositorio sin descargas ni valoraciones, creado y actualizado en apenas unas horas, validado solo con una prueba de humo en CPU. No hay garantía de mantenimiento ni de soporte.
- Metadatos inconsistentes: el índice safetensors declara 446 571 248 parámetros, muy lejos de los ~35B del modelo; conviene no usar ese dato para dimensionar infraestructura.
- La procedencia de la cabeza MTP es un injerto de terceros (shisa-ai) con destilación KL de 12K pasos; la fidelidad de la decodificación especulativa respecto a la cabeza original no está evaluada.

## Enlaces

- Repositorio HuggingFace (GGUF): https://huggingface.co/lavendercomputing/Ornith-1.5-35B-A3B-Heretic-MTP-APEX-GSQ-RCO-GGUF
- Repositorio hermano sin GGUF: https://huggingface.co/lavendercomputing/Ornith-1.5-35B-A3B-Heretic-MTP-APEX-GSQ-RCO
- Modelo del proveedor: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- GGUF del proveedor (modelo base declarado): https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-GGUF
- Licencia del modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B/blob/main/LICENSE
- Fuente ablacionada (Heretic Trial 62, I-Quality): https://huggingface.co/SC117/Ornith-1.5-35B-A3B-Heretic-MTP-APEX-GGUF
- Cabeza MTP fusionada: https://huggingface.co/shisa-ai/Ornith-1.5-35B-A3B-MTP-ONLY
- Importance matrix: https://huggingface.co/gbuzhf/Ornith-1.5-35B-A3B-Abliterated-MTP-UD-APEX-GGUF
- Heretic (herramienta de abliteración): https://github.com/p-e-w/heretic
- Blog de Ornith / DeepReinforce: https://deep-reinforce.com/ornith.html
- Ficha de terceros (local-ai-zone): https://local-ai-zone.github.io/models/ornith-1-5-35b-a3b-heretic-mtp-apex.html
- Réplica en ModelScope (build APEX-MTP de mudler): https://www.modelscope.cn/models/mudler/Ornith-1.5-35B-A3B-APEX-MTP-GGUF
- llama.cpp, commit de referencia de las pruebas: https://github.com/ggml-org/llama.cpp/commit/f3f31a7
