# kabcnd/Kenzan-Karpo-Decision-31B-AttnGrid-GGUF

## Resumen

Kenzan-Karpo-Decision-31B-AttnGrid-GGUF es una cuantización GGUF de precisión extrema del modelo MachinePulseAI/karpo-decision-31B, un derivado de google/gemma-4-31B-it (Gemma4ForConditionalGeneration, 30.697.345.596 parámetros, 60 capas). El autor, kabcnd, lo publica como un motor de decisión "System-One" de un solo pase: en lugar de generar texto de forma autorregresiva, el modelo procesa una entrada y produce un estado oculto de la última capa que se proyecta mediante una cabeza de lectura externa (`readout.safetensors`, matriz `[255, 5376]` en float32) para clasificar entre opciones discretas. Está empaquetado junto con `decision_config.json` y un cliente Python listo para ejecutar sobre `llama-server`.

El objetivo declarado es hacer viable un modelo de 31B en un Apple Mac mini M6 con 16 GB de memoria unificada. Pasa de 58,29 GiB en BF16 a 12,09 GiB (3,38 bpw, factor de compresión 4,8×), apoyándose en que 50 de las 60 capas usan Sliding Window Attention (menor coste de KV cache) y en una matriz de importancia nativa de 30 fragmentos (`karpo_imatrix.gguf`) para decidir qué tensores proteger con más bits. El resultado cabe en el conjunto de trabajo Metal de 15.032,39 MB.

Es relevante ahora por dos motivos: demuestra que la cuantización por debajo de 3 bits por peso puede preservar una función de decisión con clasificación verificada del 100% en una batería de calibración, y expone un patrón de despliegue poco habitual (uso de `--embeddings --pooling none` para extraer estados ocultos en lugar de tokens). No es un modelo conversacional: es un clasificador de enrutamiento de un solo pase.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only derivado de Gemma 4 (Gemma4ForConditionalGeneration); 60 capas = 50 Sliding Window Attention + 10 Full Attention; cabeza de lectura lineal externa `[255, 5376]` |
| Parametros totales | 30.697.345.596 (30,70B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens en la configuración de referencia (`-c 4096`); el modelo base declara ventana nativa no especificada en la información disponible |
| Tipos de cuantizacion | GGUF mixto: `IQ2_XXS` (mayoría de `ffn_gate`/`ffn_up`), `IQ3_XXS` (48 `ffn_down` de SWA), `Q4_0` (`attn_q`, `attn_output`, `output.weight`, 12 `ffn_down` ancla), `Q5_K` (`token_embd`, `attn_q`/`attn_output` en `blk.53–59`), `Q6_K` (`attn_k`, `attn_v`); media 3,38 bpw |
| Idiomas soportados | en, ru |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (12,09 GiB / 12.383,76 MiB) + `readout.safetensors` (float32) + `decision_config.json` |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de 60 capas con atención híbrida: 50 capas de Sliding Window Attention y 10 de Full Attention, lo que reduce drásticamente el KV cache y explica que 12 GiB quepan en memoria unificada de 16 GB. La innovación funcional es la separación entre el cuerpo del modelo y la cabeza de decisión: el cuerpo produce estados ocultos de la última capa de dimensión 5376 y `readout.safetensors` (`[255, 5376]`) los proyecta a 255 clases de decisión. El autor describe el modelo como "System-One", es decir, inferencia de un solo pase sin cadena de razonamiento ni generación token a token.

El proceso de cuantización se guió por un análisis de sensibilidad: se calculó una matriz de importancia nativa de 30 fragmentos (`karpo_imatrix.gguf`) a partir de la conversión Q8_0 y se detectaron picos en los límites de Full Attention (`blk.5 = 6,32e5`, `blk.11 = 6,70e5`, `blk.29 = 3,24e5`, `blk.47 = 2,18e5`) y en `blk.1`/`blk.58`. Sobre esa base se asignaron `Q4_0` a los 10 `ffn_down` de Full Attention más los picos de SWA, `IQ3_XXS` al resto de `ffn_down` de SWA y a los `ffn_up`/`ffn_gate` de `blk.5`, `blk.11`, `blk.58` y `blk.59`, y `IQ2_XXS` al resto de SwiGLU. No se dispone de información sobre el dataset de entrenamiento, número de tokens, ni sobre si hubo RLHF o DPO en el modelo base.

## Capacidades

- Clasificación de decisiones de un solo pase: dado un contexto, devuelve una distribución de probabilidad sobre las clases definidas en `readout.safetensors` (255 salidas).
- Enrutamiento de tres rutas verificado en la model card con probabilidades `[0,0559, 0,9284, 0,0157]`.
- Clasificación invariante al orden: la model card reporta `P(A) = 1,0000` / `P(B) = 0,0000` con margen de logit de 13–17 bajo permutación de opciones.
- Extracción de estados ocultos vía API de embeddings (`--embeddings --pooling none --embd-normalize -1`), sin normalización, para alimentar la cabeza externa.
- Soporte bilingüe limitado a inglés y ruso según los metadatos del repositorio.
- No soporta generación de texto autorregresiva como caso de uso previsto, ni tool calling, ni razonamiento multi-paso, ni visión o audio en esta variante.
- Compatible con endpoints de `llama-server` (`endpoints_compatible` en los tags).

## Casos de uso

- Enrutamiento de peticiones en un servidor de inferencia: el modelo clasifica cada consulta entrante en una de N rutas (por ejemplo, modelo pequeño, modelo grande o rechazo) en un solo pase, con latencia de 642–656 ms en servidor usando caché de prefijo LCP, y puede integrarse delante de un gateway de modelos.
- Filtrado de seguridad y moderación: clasificación binaria permitir/bloquear con calibración verificada (100% en 20 ejecuciones de la batería de calibración), adecuada para prefiltrar tráfico antes de llamar a un LLM generativo más caro.
- Clasificación de intenciones en asistentes de voz o chat: dado un turno de usuario, decidir la acción o el dominio con una pasada, evitando el coste de generar texto.
- Automatización de decisiones en pipelines de CI/CD: evaluar metadatos de un cambio (diff, logs, etiquetas) y decidir si se aprueba, se bloquea o requiere revisión humana, con inferencia local en un Mac mini M6 sin GPU dedicada.
- Prototipado de investigación en "System-One": banco de pruebas para estudiar cabezas de lectura lineales sobre estados ocultos de modelos grandes sin necesidad de GPUs de datacenter.
- Despliegue en entornos con memoria restringida: cualquier escenario donde se necesite un modelo de 30B en 16 GB de memoria unificada, como estaciones de trabajo Apple Silicon o mini-PCs, para tareas de clasificación por lotes.
- Evaluación A/B de prompts y opciones: la invariancia al orden permite usar el modelo para comparar dos alternativas de prompt o configuración sin sesgo posicional apreciable (sesgo medido de -0,5224 logits).

## Benchmarks y rendimiento

Datos medidos por el autor en Apple Mac mini M6 con Metal 4, `llama.cpp` commit `ed26f2f`, `-ngl 99 -fa on -ctk q4_0 -ctv q4_0`:

| Prueba | Resultado |
|---|---|
| `llama-bench` `pp512` | 204,35 ± 1,51 t/s |
| Latencia extremo a extremo de enrutamiento (un solo pase) | ~1,05–1,17 s |
| Latencia de despacho de router (3 rutas, sin estado) | 1.054,5–1.718,2 ms |
| Latencia con caché de prefijo LCP (`f_keep = 0,825–0,839`) | 642–656 ms en servidor; 766,6–783,1 ms extremo a extremo |
| Precisión de calibración (10 escenarios × 2 permutaciones A/B = 20 ejecuciones) | 100,0% (20/20) |
| Sesgo posicional (`A - B`) | -0,5224 logits |
| Escalado de temperatura | `T_cal = 0,5124`, `Bias = [0,0128, -0,0095]`, NLL 0,0002 → 0,0000 |
| Caso 1 (A=Block+2FA, B=Allow) | logits `[37,493, 24,532]` → `P(A)=1,0000`, `P(B)=0,0000` |
| Caso 2 (A=Allow, B=Block+2FA) | logits `[27,644, 44,994]` → `P(A)=0,0000`, `P(B)=1,0000` |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, lo cual es coherente con que el modelo no sea un generador de texto.

## Requisitos de hardware

- VRAM/memoria: 12,09 GiB (12.383,76 MiB) para los pesos GGUF; el conjunto de trabajo Metal medido es de 15.032,39 MB, lo que deja margen ajustado en 16 GB de memoria unificada.
- GPU recomendadas: Apple Mac mini M6 (16 GB de memoria unificada, Metal 4) es el objetivo declarado y probado; no hay datos de rendimiento en GPU NVIDIA o AMD.
- Cabe en GPU consumer: sí, en equipos Apple Silicon de 16 GB; no hay datos sobre RTX 4090 u otras GPU de consumo con 16–24 GB de VRAM.
- Opciones de despliegue: `llama-server` de `llama.cpp` con `--embeddings --pooling none --embd-normalize -1`, `-ngl 99 -fa on -np 1 -c 4096 -ctk q4_0 -ctv q4_0 --cache-ram 2048`. El autor menciona `llama-clover` (Metal 4) como runtime especializado. No se documenta soporte en vLLM, TGI ni Ollama.
- Latencia y throughput: 204,35 t/s en `pp512`; 642–656 ms por decisión con caché de prefijo; el autor estima que compactando el prefijo de sistema a ~35–45 tokens y devolviendo embeddings float32 binarios se podría bajar a ~350–400 ms.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / cuantización | Licencia | Enfoque |
|---|---|---|---|---|---|
| Kenzan-Karpo-Decision-31B-AttnGrid | 30,70B | 4096 (config. de referencia) | GGUF 3,38 bpw + readout safetensors | apache-2.0 | Clasificador System-One de un solo pase |
| MachinePulseAI/karpo-decision-31B (base) | 30,70B | no disponible | safetensors (BF16, 58,29 GiB) | no disponible en la información proporcionada | Mismo clasificador, sin cuantizar |
| google/gemma-4-31B-it (raíz) | ~31B | no disponible | safetensors | no disponible en la información proporcionada | LLM instructivo generativo |
| Bonsai-2 (Prism ML, citado como inspiración) | no disponible | no disponible | no disponible | no disponible | Cuantización extrema de bajo bit |

La comparación con alternativas de la misma categoría (clasificadores de enrutamiento de 30B) no está disponible en la información proporcionada. Frente a su base sin cuantizar, la variante Kenzan reduce el peso 4,8× a costa de una cuantización mixta agresiva; frente a Gemma 4 instructivo, cambia el paradigma de uso (clasificación frente a generación).

## Limitaciones y advertencias

- No es un modelo conversacional: no genera texto autorregresivamente y requiere la cabeza `readout.safetensors` y un cliente específico (`karpo_decision_client.py`) para funcionar.
- Dependencia de runtime: el autor indica que usa una cabeza de lectura "System-One" que requiere `llama-clover` (Metal 4); el soporte en `llama.cpp` estándar se limita a la extracción de embeddings.
- Idiomas limitados a inglés y ruso; no hay evaluación en castellano.
- La cuantización a 3,38 bpw con `IQ2_XXS` en la mayoría de SwiGLU puede degradar decisiones fuera de la distribución de calibración; la validación reportada cubre solo 10 escenarios × 2 permutaciones.
- Riesgo de alucinación no aplica en el sentido habitual (no genera texto), pero sí de calibración excesiva: probabilidades de 1,0000 en la batería de calibración sugieren posible sobreajuste a ese conjunto.
- Sesgo posicional medido de -0,5224 logits, pequeño pero no nulo; conviene mantener el orden de opciones estable en producción.
- El rendimiento está medido exclusivamente en Apple Mac mini M6 con Metal 4; no hay datos en otras plataformas.
- Licencia apache-2.0 declarada, pero el modelo base (Gemma 4) puede tener términos adicionales; conviene verificar la licencia de `google/gemma-4-31B-it` antes de uso comercial.
- El repositorio tiene 0 likes y 1.037 descargas en el momento de la consulta; es un artefacto de un solo autor sin validación independiente.

## Enlaces

- Hugging Face: https://huggingface.co/kabcnd/Kenzan-Karpo-Decision-31B-AttnGrid-GGUF
- Modelo base: https://huggingface.co/MachinePulseAI/karpo-decision-31B
- Modelo raíz: https://huggingface.co/google/gemma-4-31B-it
- Inspiración (Prism ML / Bonsai-2): https://huggingface.co/prism-ml
- Cliente de ejemplo: `examples/karpo_decision_client.py` dentro del repositorio
- Apoyo al autor: https://ko-fi.com/kabcpc
