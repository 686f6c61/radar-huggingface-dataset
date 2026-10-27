# rawmodels/flint-roleplay-antislop

- Repo size 228.7 GB, downloads 0, likes 0, created 2026-10-27 — future date? Weird but just report.

Active params 2.5B. MoE 256 experts top-6 + shared expert.

Context length: not given. I must not invent. Say "no disponible".

Benchmarks table: use the provided numbers.

Hardware requirements: I can estimate based on sizes: BF16 79.6 GB weights → needs ~85-90 GB VRAM; Q8_0 44.1 GB; Q4_K_M 25.3 GB. MoE with 2.5B active — inference can be offloaded. We can recommend: Q4_K_M fits in 24 GB? 25.3 GB weights > 24GB, so needs offload or 32GB. Actually careful—don't invent too much. I can compute estimates: VRAM ≈ weights + KV cache + overhead. I'll present as estimations clearly labelled.

I should be careful to not invent benchmark data but the estimates for VRAM are derived from file sizes, that's fine as long as I label as estimates.

Comparativa: comparable models — I don't have data on other models in the info. I could compare to base RecursiveSI/flint (same architecture). For other alternatives, I should say "no disponible" since I have no data. I can include the base model and note that no other comparable model data is available in the provided information. Better: table with base Flint and note "no disponible" for others. The instructions say if I don't know comparable models, indicate "no disponible". I'll do a table with base Flint and note that no third-party data was provided.

Limitations: single judge (Claude Opus 5.5), small samples, English only, adult themes/moderation needed, roleplay absolute rubric slightly lower than base (6.13 vs 6.38), 0 downloads/likes (unvalidated by community), hallucination risk, licence Apache 2.0 permits commercial use.

Benchmarks table — include writing quality, pairwise, KLD.

Titles: only first word capitalised. "Especificaciones tecnicas" — the structure is given; I keep as is (they said títulos with only first word capitalised — the mandatory headers are provided in that style already: "Resumen", "Especificaciones tecnicas", "Arquitectura y entrenamiento", etc.)

No emojis. Spanish from Spain.

Write the sheet.

For context length — let me think again: some Flint models. I don't have data. Write "no disponible".

Parameters: 39.785.287.456 total (≈39,8B); active ~2,5B.

Let me write hardware section:

- BF16 (79,6 GB de pesos): requiere ~85-95 GB de VRAM para inferencia con caché KV; A100 80GB justo/insuficiente, H100 80GB, 2×A100 40GB, etc. Better: BF16 needs ≥80 GB; H100 80 GB or A100 80 GB con offload parcial; multi-GPU.
- Q8_0 44,1 GB: A100 40GB no cabe entero, necesita 48-80 GB (A6000 48GB, L40S 48GB, A100 80GB).
- Q4_K_M 25,3 GB: no cabe en 24 GB sin offload parcial; RTX 3090/4090 24 GB con offload de algunas capas a CPU vía llama.cpp (2,5B activos por token favorece offload), o GPU de 32 GB (RTX 5090) / 48 GB.
- Deployment: vLLM (BF16 según la model card), llama.cpp/GGUF, Ollama potencialmente.
- Throughput: no disponible.

Note that MoE with 2.5B active is good for CPU/GPU hybrid offload.

Comparativa table: 

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Notas |
| flint-roleplay-antislop | 39,8B | ~2,5B | no disponible | Apache 2.0 | safetensors, GGUF | ... |
| RecursiveSI/flint (base) | 39,8B | ~2,5B | no disponible | no disponible en la info | no disponible | puntuación 4,92 rúbrica, 6,38 rúbrica roleplay |
Hmm base license not provided. The model is a finetune of it; license of base not stated. Say "no disponible".

Third alternative: "no disponible" — I don't have data for any other model.

Enlaces: HF URL, base model URL, Apache license URL. No papers/blogs mentioned.

Let me write the benchmarks table with the exact numbers.

Now write.## Resumen

flint-roleplay-antislop es un ajuste fino (post-entrenamiento con RL) del modelo RecursiveSI/flint, desarrollado por el usuario rawmodels. Se trata de un transformer con arquitectura de mezcla de expertos (MoE) de 39.785.287.456 parámetros totales y aproximadamente 2,5B parámetros activos por token, orientado a roleplay de personajes, ficción interactiva y escritura creativa. El problema que aborda es concreto: reducir el «slop» —las muletillas estilísticas, la prosa genérica y los clichés— que producen los modelos base en tareas de escritura, mediante GRPO con una recompensa calibrada sobre textos de referencia.

El modelo conserva la arquitectura, el tokenizador y la plantilla de chat de Flint, de modo que es un reemplazo directo del base. Según los datos del autor, la puntuación de rúbrica en un conjunto de 24 prompts retenidos sube de 4,92 a 5,90, y la recompensa calibrada de 0,12 a 0,31. En roleplay a ciegas (n=64) gana 28 veces frente a 22 del base, con 14 empates, aunque en escenas románticas/flirt personalizadas el resultado es prácticamente un empate (6/7/3) y en la rúbrica absoluta de roleplay queda ligeramente por debajo del base (6,13 frente a 6,38).

Es relevante ahora porque demuestra un patrón de post-entrenamiento barato y reproducible (GRPO con juez automático y recompensa calibrada por dominio) aplicado a un MoE de ~40B con solo ~2,5B activos, lo que permite servirlo con requisitos de cómputo moderados. Se distribuye en BF16 safetensors y en GGUF (BF16, Q8_0, Q4_K_M) con divergencia KL medida. El repo tiene 0 descargas y 0 likes en el momento de la consulta, y solo soporta inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FlintForCausalLM (transformer denso + MoE): 49 capas, hidden 2048, 32 cabezas de consulta / 4 de KV, atención deslizante de 513 tokens + atención completa, QK-norm por cabeza y attention sinks |
| Parametros totales | 39.785.287.456 (39,8B) |
| Parametros activos | ~2,5B (MoE con 256 expertos, top-6, más un experto compartido) |
| Longitud de contexto | no disponible (la model card solo detalla la ventana deslizante de 513 tokens y capas de atención completa; no se especifica la ventana total) |
| Tipos de cuantizacion | BF16 safetensors; GGUF BF16, Q8_0 y Q4_K_M (Q4_K_M con layout por tensor de bartowski + imatrix) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (15 shards, 79,6 GB) y GGUF (BF16 79,6 GB, Q8_0 44,1 GB, Q4_K_M 25,3 GB) |
| Plantilla de chat | plantilla de chat de Flint; razonamiento desactivable con `<think></think>` vacío |
| Modelo base | RecursiveSI/flint @ `2a247be` (relación: finetune) |
| Precisión de referencia | BF16 |

## Arquitectura y entrenamiento

La arquitectura es la de Flint: un transformer causal de 49 capas con dimensión oculta 2048, 32 cabezas de consulta y 4 de clave/valor (GQA), atención híbrida que combina una ventana deslizante de 513 tokens con capas de atención completa, QK-norm por cabeza y attention sinks. La capa MoE usa 256 expertos con enrutamiento top-6 más un experto compartido, lo que da 39,8B parámetros totales pero solo ~2,5B activos por token. El ajuste no modifica arquitectura, tokenizador ni plantilla de chat.

El post-entrenamiento usa GRPO con 4 muestras por prompt, learning rate 1e-5 y coeficiente KL β 0,04, sobre prompts de continuación de tuits orientados a eliminar «slop». La innovación principal es la función de recompensa: cada respuesta se puntúa con Claude Opus 5.5 contra una rúbrica de escritura específica por tarea, y esa puntuación se calibra por dominio mediante un ajuste sigmoide a la distribución de salidas de modelos de referencia (calibrated-v1), de forma que la recompensa mide la mejora sobre la escritura típica de un modelo y no la escala bruta del juez; el resultado se multiplica por un factor de longitud. No se indica en la información disponible el volumen de tokens de entrenamiento ni la composición del dataset más allá de la descripción de las tareas.

## Capacidades

- Generación de texto creativo en inglés: narrativa, diálogo de personajes y ficción interactiva con estilo menos formulaico que el base.
- Roleplay multi-turno con tarjetas de personaje (character cards) y escenarios personalizados; la model card incluye ejemplos con personajes adultos.
- Escritura de continuación y finalización de textos breves (el entrenamiento se hizo sobre prompts de continuación de tuits).
- Desactivación explícita del modo de razonamiento mediante un bloque `<think></think>` vacío en la plantilla de chat.
- Compatibilidad con el ecosistema transformers y con llama.cpp/GGUF para inferencia local.
- Punto de partida para post-entrenamiento adicional: el autor lo recomienda explícitamente para seguir afinando.
- No se documentan en la información disponible capacidades de tool calling, function calling, uso de agentes, matemáticas, código, visión ni audio.

## Casos de uso

- Roleplay de personajes en productos de entretenimiento: el modelo mantiene voz y registro de un personaje a lo largo de conversaciones multi-turno, y el entrenamiento antislop reduce las muletillas repetitivas que rompen la ilusión. Adecuado por su equilibrio entre calidad de prosa y coste de inferencia (~2,5B activos).
- Ficción interactiva y novelas visuales: generación de réplicas y descripciones de escena bajo una tarjeta de personaje fija; el formato GGUF Q4_K_M (25,3 GB) permite desplegarlo en estaciones de trabajo con una sola GPU consumer grande y offload parcial.
- Escritura creativa asistida: borradores de relato corto y diálogo donde el objetivo es evitar la prosa genérica; útil como generador de variantes que un editor humano selecciona.
- Generación de contenido narrativo para juegos de rol de mesa: el modelo produce respuestas de PNJ coherentes con un escenario dado y puede ejecutarse en local para partidas con datos sensibles.
- Base para ajuste fino por dominio: al conservar arquitectura y tokenizador de Flint y publicarse con Apache 2.0, sirve como punto de partida para SFT/DPO sobre un corpus propio de escritura o de un género concreto.
- Investigación en RLHF/GRPO: el modelo documenta una receta completa (reward calibrada por dominio, KLD de cuantización) que se puede replicar o contrastar en experimentos de alineación estilística.
- Evaluación comparativa de calidad de prosa: útil como referencia en estudios con jueces automáticos, dado que el autor publica los pares de prompts y el protocolo de comparación a ciegas en ambos órdenes.

## Benchmarks y rendimiento

Números medidos por el autor sobre estos pesos exactos frente a RecursiveSI/flint, servidos de forma idéntica con vLLM en BF16, temperatura 1.0, mismos prompts y semillas. Juez: Claude Opus 5.5.

Calidad de escritura en conjunto retenido (24 prompts; mayor es mejor):

| Metrica | Base (flint) | flint-roleplay-antislop | Delta |
|---|---:|---:|---:|
| Puntuación de rúbrica (0-10) | 4,92 | 5,90 | +0,98 |
| Recompensa calibrada (0-1) | 0,12 | 0,31 | +0,19 |

Roleplay, comparación por pares a ciegas, juzgada en ambos órdenes (una victoria debe mantenerse en los dos):

| Conjunto | n | Gana este modelo | Gana el base | Empate |
|---|---:|---:|---:|---:|
| Todas las escenas (24 tarjetas retenidas + 8 escenas propias, × 2 semillas) | 64 | 28 | 22 | 14 |
| Solo escenas propias de romance/flirt | 16 | 6 | 7 | 3 |

Rúbrica absoluta de roleplay (n=24): base 6,38 frente a 6,13 de este modelo. El autor advierte que las muestras son pequeñas y hay un único juez, por lo que deben leerse como indicativas.

Fidelidad de cuantización (divergencia KL respecto al BF16 de este modelo; menor es mejor):

| GGUF | Receta | KLD media | Mismo token top-1 |
|---|---|---:|---:|
| Q8_0 | expertos en Q8_0; embeddings, salida, atención, expertos compartidos y capas densas en BF16 | 0,0077 | 96% |
| Q4_K_M | layout por tensor de bartowski + imatrix | 0,050 | 90% |

Referencia de escala aportada por el autor: los propios pesos BF16 de Flint difieren en KLD 0,0034 entre kernels de CPU y GPU en llama.cpp; los presets estándar de `llama-quantize` pierden entre 1,5 y 2 veces más que estos ficheros (Q8_0 0,0119; Q4_K_M 0,099). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

Estimaciones derivadas del tamaño de los ficheros publicados; el autor no publica latencias ni throughput.

- BF16 (79,6 GB de pesos): requiere del orden de 85-95 GB de VRAM contando caché KV y overhead. Encaja en H100 80 GB con margen ajustado, A100 80 GB, o en configuraciones multi-GPU (2×A100 40 GB, 2×L40S 48 GB). Es la configuración usada por el autor para las evaluaciones (vLLM, BF16).
- GGUF Q8_0 (44,1 GB): necesita 48 GB o más de VRAM para carga completa; GPU válidas: A6000 48 GB, L40S 48 GB, A100 80 GB. No cabe en una RTX 4090 de 24 GB sin offload.
- GGUF Q4_K_M (25,3 GB): no cabe íntegro en 24 GB, pero al tener solo ~2,5B parámetros activos el offload parcial de capas a CPU es barato en términos de latencia; viable en RTX 3090/4090 (24 GB) con offload, o con carga completa en GPU de 32 GB o 48 GB.
- Despliegue: vLLM para BF16 (es lo que usa el autor en la evaluación); llama.cpp para los GGUF; el repo incluye los ficheros GGUF en el subdirectorio `gguf/`, por lo que la integración con Ollama u otros frontales basados en llama.cpp es directa, aunque no se documenta una receta oficial.
- Almacenamiento: el repo completo ocupa 228,7 GB, por lo que conviene descargar solo los ficheros necesarios (BF16, Q8_0 o Q4_K_M).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formatos | Notas |
|---|---|---|---|---|---|---|
| flint-roleplay-antislop | 39,8B | ~2,5B | no disponible | Apache 2.0 | safetensors BF16, GGUF (BF16/Q8_0/Q4_K_M) | Rúbrica de escritura 5,90; roleplay por pares 28-22-14 frente al base |
| RecursiveSI/flint (base) | 39,8B | ~2,5B | no disponible | no disponible en la información proporcionada | no disponible en la información proporcionada | Rúbrica de escritura 4,92; rúbrica absoluta de roleplay 6,38 |
| Otras alternativas de roleplay de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible | No se han proporcionado datos de terceros para comparar |

No se dispone de datos de benchmarks ni de especificaciones de otros modelos comparables en la información proporcionada, por lo que la comparación se limita al modelo base.

## Limitaciones y advertencias

- Evaluación con un único juez (Claude Opus 5.5) y muestras pequeñas (n=24 en calidad de escritura, n=64 y n=16 en roleplay): los resultados son direccionales, no concluyentes.
- En la rúbrica absoluta de roleplay el modelo queda por debajo del base (6,13 frente a 6,38), y en escenas de romance/flirt el resultado es un empate técnico (6-7-3): la mejora no es uniforme en todos los dominios.
- Solo soporta inglés; no hay datos de rendimiento en castellano ni en otros idiomas.
- No se documenta la longitud total de contexto, lo que impide planificar despliegues con requisitos de ventana larga sin verificación previa.
- El contenido de roleplay puede incluir temas adultos; el autor recomienda desplegar con una capa de moderación propia. El comportamiento de seguridad se hereda de Flint y no fue objetivo del entrenamiento.
- Riesgo de alucinación inherente a un modelo generativo de~40B sin datos publicados de benchmarks de conocimiento factual (MMLU u otros).
- No hay evidencia de adopción comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin validación independiente de los resultados del autor.
- Licencia Apache 2.0: permite uso comercial y modificaciones, con obligación de conservar avisos de licencia y atribución; conviene revisar también las condiciones del modelo base.
- La recompensa basada en un juez propietario (Claude Opus 5.5) puede inducir sesgos hacia el estilo que ese juez prefiere; el factor de longitud en la recompensa puede favorecer respuestas más largas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rawmodels/flint-roleplay-antislop
- Modelo base RecursiveSI/flint: https://huggingface.co/RecursiveSI/flint
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
