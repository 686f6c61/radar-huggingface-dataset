# kabcnd/Kenzan-Karpo-Decision-31B-AttnGrid-GGUF

## Resumen

Kenzan-Karpo-Decision-31B-AttnGrid-GGUF es una cuantizacion GGUF de precision mixta del modelo `MachinePulseAI/karpo-decision-31B`, un derivado de `google/gemma-4-31B-it` con 30.697.345.596 parametros (30,70B) y arquitectura `Gemma4ForConditionalGeneration` de 60 capas (50 de atención de ventana deslizante y 10 de atención completa). El autor, kabcnd, lo publica como un motor de decisión "System-One": no es un generador autoregresivo de chat, sino un clasificador de una sola pasada que proyecta el estado oculto de un token `<mask>` mediante una cabeza lineal externa (`readout.safetensors`, matriz `[255, 5376]` en float32) para producir una decisión de enrutamiento o clasificación.

La relevancia del artefacto es de ingeniería de cuantizacion: comprime los 58,29 GiB en BF16 hasta 12,09 GiB (3,38 bpw, factor 4,8x) con una receta de cuantizacion por capas calibrada con una imatrix nativa de 30 chunks (`karpo_imatrix.gguf`), de modo que el modelo cabe en el conjunto de trabajo Metal de 15.032,39 MB de un Apple Mac mini M6 con 16 GB de memoria unificada. El autor reporta 204,35 ± 1,51 t/s en `pp512` y una latencia de decisión de extremo a extremo de 1,05-1,17 s.

El modelo esta pensado para clasificacion y enrutamiento determinista (por ejemplo, enrutado de consultas de ciberseguridad entre tres rutas), con verificacion de invariancia al orden de las opciones (`P(A) = 1.0000` / `P(B) = 0.0000` bajo permutacion). No debe confundirse con un modelo conversacional: requiere un servidor configurado en modo embeddings con pooling desactivado y un cliente que aplique la cabeza de lectura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer `Gemma4ForConditionalGeneration` (60 capas: 50 Sliding Window Attention + 10 Full Attention) |
| Parametros totales | 30.697.345.596 (30,70B) |
| Parametros activos | no disponible (no se describe como MoE) |
| Longitud de contexto | 4096 tokens en la configuracion de referencia (`-c 4096`); ventana nativa no disponible |
| Tipos de cuantizacion | IQ2_XXS (mayoria de `ffn_gate`/`ffn_up`), IQ3_XXS (`ffn_down` de las 48 SWA restantes y `ffn_up`/`ffn_gate` de blk.5, 11, 58, 59), Q4_0 (`attn_q`, `attn_output`, `output.weight`, `ffn_down` de anclas), Q5_K (`token_embd.weight`, `attn_q`/`attn_output` en blk.53-59), Q6_K (`attn_k`, `attn_v`); tamano final 12,09 GiB a 3,38 bpw |
| Idiomas soportados | en, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (un fichero principal) + `readout.safetensors` (float32, `[255, 5376]`) + `decision_config.json` |

## Arquitectura y entrenamiento

El modelo base es un transformer Gemma 4 de 60 capas con atencion hibrida: 50 capas usan Sliding Window Attention y 10 usan atencion completa. Esa proporcion es la que permite mantener una cache KV reducida y operar en 16 GB de memoria unificada. La cabeza de decision no forma parte del grafo generativo: el modelo expone el estado oculto de la ultima capa (dimension 5376) para el token `<mask>`, y una matriz lineal externa `readout.safetensors` de forma `[255, 5376]` lo proyecta a 255 clases. El pipeline de inferencia se ejecuta con `llama-server` en modo `--embeddings --pooling none --embd-normalize -1`, devolviendo estados ocultos sin normalizar.

El trabajo del autor se centra en la cuantizacion, no en el entrenamiento. Genero una imatrix nativa de 30 chunks a partir de la conversion `Q8_0` y detecto picos de sensibilidad en las fronteras de atencion completa (`blk.5 = 6,32e5`, `blk.11 = 6,70e5`, `blk.29 = 3,24e5`, `blk.47 = 2,18e5`) y en `blk.1`/`blk.58`, que protegio asignando Q4_0 a los `ffn_down` de las anclas y IQ3_XXS a los SwiGLU de los bloques pico y cola. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Clasificacion de una sola pasada: mapea una entrada a una de 255 clases mediante la cabeza de lectura externa, sin generacion autoregresiva de tokens.
- Enrutamiento de decisiones (router dispatch): el autor documenta un clasificador de tres rutas con 92,84% de confianza en enrutado de ciberseguridad.
- Invariancia al orden de opciones: clasificacion estable bajo permutacion de alternativas (`P(A) = 1.0000` / `P(B) = 0.0000` con margen de logit de 13-17).
- Decodificacion de estados ocultos: expone representaciones de ultima capa de 5376 dimensiones via endpoint de embeddings.
- Soporte bilingue limitado a ingles y ruso.
- No soporta tool calling, function calling, agentes multi-paso ni modo thinking: la model card lo define explicitamente como "not an autoregressive chat generator".
- No se documentan capacidades de vision, audio ni matematicas.

## Casos de uso

- Enrutamiento de consultas en produccion: el modelo clasifica una peticion entrante en una de las 255 clases (o en las tres rutas documentadas) en una sola pasada de ~1,1 s, lo que permite derivar trafico a distintos backends sin invocar un LLM generativo completo.
- Filtrado de seguridad y moderacion: como clasificador determinista, se puede colocar delante de un chatbot para bloquear o etiquetar entradas antes de que lleguen al modelo conversacional, con coste de inferencia muy inferior al de una generacion.
- Clasificacion de documentos en pipelines ETL: procesar lotes de textos cortos (hasta 4096 tokens) en un Mac mini M6 para asignar categorias, aprovechando los 204 t/s de procesamiento de prompt.
- Enrutado de tickets de soporte: asignar cada ticket a un equipo o cola concreta mediante la cabeza de lectura, con la ventaja de que el resultado es una distribucion de probabilidad sobre clases y no texto libre.
- Gatekeeping en sistemas RAG: decidir si una consulta requiere recuperacion de documentos o puede responderse directamente, usando la decision binaria con margen de logit verificable.
- Despliegue local en hardware de consumo: prototipado de clasificadores de 30B en un Mac mini de 16 GB sin GPU dedicada, util para entornos de desarrollo o demos sin coste de nube.
- Evaluacion de robustez de clasificadores: la invariancia al orden de opciones lo hace util como componente de referencia en pruebas de sesgo posicional de otros sistemas de decision.

## Benchmarks y rendimiento

Medidos por el autor en Apple Mac mini M6 (Metal 4), `llama.cpp` commit `ed26f2f`, `-ngl 99 -fa on -ctk q4_0 -ctv q4_0`:

| Prueba | Resultado |
|---|---|
| `llama-bench` `pp512` | 204,35 ± 1,51 t/s (12,09 GiB, 30,70B parametros) |
| Latencia de decision extremo a extremo | 1,05-1,17 s por decision (1.054,5-1.166,3 ms) |
| Caso 1 (A=Block+2FA, B=Allow) | logits `[37,493, 24,532]` → P(A)=1,0000, P(B)=0,0000 |
| Caso 2 (A=Allow, B=Block+2FA) | logits `[27,644, 44,994]` → P(A)=0,0000, P(B)=1,0000 |
| Router de tres rutas (ciberseguridad) | 92,84% de confianza |

No se han publicado resultados en MMLU, HumanEval, GSM8K ni benchmarks estandar de comprension en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria: 12,09 GiB de pesos; el autor indica que encaja en el conjunto de trabajo Metal de 15.032,39 MB de un Mac mini M6 de 16 GB de memoria unificada.
- GPU recomendadas: Apple Silicon (Mac mini M6 con Metal 4 es el objetivo declarado); no se documentan pruebas en A100, H100 ni RTX 4090.
- GPU de consumo: si cabe en un Mac mini de 16 GB; para GPU discretas haria falta al menos ~13-14 GB de VRAM considerando cache KV en q4_0, por lo que encajaria en RTX 4090 (24 GB) y A100/H100, aunque no hay mediciones publicadas.
- Despliegue: `llama-server` de `llama.cpp` compilado con `-DGGML_METAL=ON`, flags `--embeddings --pooling none --embd-normalize -1 -ngl 99 -fa on -np 1 -c 4096 -ctk q4_0 -ctv q4_0 --cache-ram 2048`. Requiere el cliente Python `examples/karpo_decision_client.py` para aplicar `readout.safetensors`.
- Throughput: 204,35 t/s en `pp512`; latencia de decision de ~1,1 s en M6.
- No se documenta compatibilidad con vLLM, TGI u Ollama.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Kenzan-Karpo-Decision-31B-AttnGrid-GGUF | 30,70B | 4096 (config. de referencia) | GGUF IQ2_XXS/IQ3_XXS mixto | Apache 2.0 | Clasificador System-One con cabeza externa |
| MachinePulseAI/karpo-decision-31B | 30,70B | no disponible | safetensors (BF16, 58,29 GiB) | no disponible | Modelo base de decision, mismo proposito |
| google/gemma-4-31B-it | ~31B | no disponible | safetensors | Gemma (terminos propios) | LLM generativo instructivo |
| Bonsai-2 (Prism ML) | no disponible | no disponible | no disponible | no disponible | Referencia citada en cuantizacion extrema de bajo bit |

La comparacion directa con LLMs generativos no es significativa: este artefacto no genera texto. Frente a su modelo base, la diferencia es el tamano (12,09 GiB frente a 58,29 GiB) y la receta de cuantizacion calibrada por capas.

## Limitaciones y advertencias

- No es un modelo conversacional: no genera texto y no debe usarse como chatbot; requiere la cabeza `readout.safetensors` y un servidor en modo embeddings.
- Solo soporta ingles y ruso; no hay soporte documentado de castellano.
- La ventana de contexto practica es de 4096 tokens en la configuracion de referencia; textos mas largos requieren truncado o segmentacion.
- El conjunto de clases (255) esta fijado por la cabeza de lectura; no se puede reutilizar para categorias nuevas sin reentrenar `readout.safetensors`.
- Las cifras de rendimiento y precision provienen unicamente del autor y de un unico dispositivo (Mac mini M6); no hay replicacion independiente.
- Riesgo de alucinacion no aplicable en el sentido generativo, pero si de calibracion: una confianza alta (92,84%) no garantiza correccion fuera de la distribucion de entrenamiento.
- La licencia Apache 2.0 se declara sobre el artefacto, pero el modelo base deriva de `google/gemma-4-31B-it`, cuyos terminos de uso deben verificarse antes de un despliegue comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion de la comunidad.
- No se documentan sesgos especificos ni evaluaciones de seguridad del clasificador.

## Enlaces

- Hugging Face: https://huggingface.co/kabcnd/Kenzan-Karpo-Decision-31B-AttnGrid-GGUF
- Modelo base: https://huggingface.co/MachinePulseAI/karpo-decision-31B
- Modelo original: https://huggingface.co/google/gemma-4-31B-it
- Prism ML (inspiracion, Bonsai-2): https://huggingface.co/prism-ml
- Cliente de decision: `examples/karpo_decision_client.py` (incluido en el repositorio)
- Apoyo al autor: https://ko-fi.com/kabcpc
