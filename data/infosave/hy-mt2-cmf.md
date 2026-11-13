# infosave/Hy-MT2-cmf

## Resumen

Hy-MT2-cmf es una distribución cuantizada de la familia de modelos de traducción Hy-MT2 de Tencent, publicada por el usuario infosave para el runtime `cortiq`. El repositorio empaqueta tres variantes del modelo base (1.8B denso, 7B denso y 30B-A3B con mezcla de expertos) en archivos CMF (Contained Model Format), un formato de un solo archivo memory-mapped que incluye pesos, tokenizador del proveedor, plantilla de chat exacta y hashes por tensor. El objetivo es ejecutar traducción de 33 idiomas sin Python, sin PyTorch y sin toolkit CUDA, sobre CPU, Vulkan, DX12 y Apple Metal.

La relevancia de esta ficha radica en que no se trata de un modelo nuevo, sino de una conversión de pesos con decisiones técnicas documentadas: cuantización 4-bit (q4tp) directa desde safetensors bf16, y un archivo ternario q1t de 1.25 bits que reproduce el checkpoint quantization-aware de Tencent. La model card aporta métricas de perplejidad propias (wikitext-2 y un conjunto de pares de frases de traducción) y detalles de implementación del runtime para las arquitecturas `hunyuan_v1_dense` y `hy_v3`.

El modelo resuelve el problema de desplegar traducción multilingüe de calidad en entornos sin GPU NVIDIA o sin stack Python, con un único archivo portable. La licencia Apache 2.0 y el soporte de 33 idiomas lo sitúan como alternativa práctica a APIs de traducción propietarias para integraciones on-premise.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (`hunyuan_v1_dense`) en 1.8B y 7B; MoE (`hy_v3`) en 30B-A3B |
| Parametros totales | 1.8B / 7B / 30B (según variante) |
| Parametros activos | 3B en la variante 30B-A3B (top-8 de 128 expertos + 1 experto compartido de 768) |
| Longitud de contexto | 262 144 tokens (ventana nativa, sin rescaling por posición) |
| Tipos de cuantizacion | q4tp (4.17 bits efectivos) y q1t (2.25 bits, ternario base-3) |
| Idiomas soportados | 33: zh, en, fr, pt, es, ja, tr, ru, ar, ko, th, it, de, vi, ms, id, tl, hi, pl, cs, nl, km, my, fa, gu, ur, te, mr, he, bn, ta, uk, bo, kk, mn, ug |
| Licencia | Apache 2.0 |
| Formato de pesos | CMF (un archivo memory-mapped por modelo; origen bf16 safetensors y GGUF STQ1_0 para q1t) |

## Arquitectura y entrenamiento

Las variantes densas de 1.8B y 7B usan la arquitectura `hunyuan_v1_dense`, con una particularidad relevante: aplican RMSNorm por cabeza sobre q y k *después* de RoPE (`query_layernorm` / `key_layernorm` sobre los vectores rotados). Esto no es plegable en los pesos, por lo que el runtime necesita un flag explícito `qk_norm_after_rope`. El RoPE "dinámico" NTK-alpha con `alpha = 1000` se resuelve en conversión como una base reescalada única: `10000 · 1000^(128/126) = 11 158 840`. La ventana de 262 144 tokens es nativa. Los modelos densos comparten `lm_head` con el embedding (tied), y la conversión no duplica ese tensor.

La variante 30B-A3B (`hy_v3`) tiene 48 capas: la capa 0 es densa (6912 de ancho) y las 47 restantes son dispersas con 128 expertos, top-8 seleccionados por puntuación sigmoide más un sesgo de selección (`expert_bias`, estilo DeepSeek-V3: el sesgo decide la elección, las puntuaciones sin sesgo ponderan), renormalizados y multiplicados por `router_scaling_factor = 2.826`, más un experto compartido siempre activo de 768. El converter mapea `mlp.router.gate` y `mlp.shared_mlp` al layout canónico y el header del CMF transporta las constantes del router. La model card no detalla la composición del dataset de entrenamiento original ni si hubo RLHF/DPO; esa información corresponde a las fichas de los modelos base de Tencent, no a esta conversión.

## Capacidades

- Traducción entre 33 idiomas, incluidos pares de bajos recursos como bo (tibetano), ug (uigur), my (birmano), km (jemer) y mn (mongol).
- Traducción con instrucciones: terminología controlada, estilo, preservación de placeholders y datos estructurados.
- Formato de chat propio del modelo, con plantilla exacta embebida en el archivo CMF.
- Ejecución sin Python, sin PyTorch y sin CUDA toolkit, sobre CPU, Vulkan (NVIDIA/AMD/Intel), DX12 y Apple Metal.
- Verificación de integridad por tensor mediante `cortiq verify`.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio ni modo thinking.

## Casos de uso

- Traducción de documentación técnica multilingüe: el modelo acepta instrucciones de terminología y preserva placeholders, lo que permite traducir ficheros con variables o marcas sin romper la sintaxis.
- Localización de interfaces de producto: con 33 idiomas y contexto de 262 144 tokens, se pueden procesar lotes de cadenas con contexto compartido para mantener coherencia terminológica entre pantallas.
- Traducción on-premise sin GPU NVIDIA: el archivo CMF corre sobre CPU y sobre Vulkan/DX12/Metal, útil en entornos corporativos con hardware heterogéneo o sin stack Python.
- Procesamiento de conversaciones largas: la ventana nativa de 262 144 tokens permite traducir hilos completos o actas sin trocear, conservando referencias entre turnos.
- Traducción de pares de bajos recursos en investigación lingüística: cobertura de tibetano, uigur, birmano, jemer y mongol, poco habitual en modelos abiertos de este tamaño.
- Despliegue en dispositivos con poca memoria: la variante 1.8B q1t ocupa 694,9 MB y la q4tp 950,5 MB, lo que permite ejecución en equipos de gama media sin GPU dedicada.
- Integración en pipelines de CI/CD de localización: un único binario `cortiq` más un archivo verificable con hashes por tensor simplifica la reproducibilidad de builds.

## Benchmarks y rendimiento

Datos publicados en la model card (perplejidad, menor es mejor):

| Modelo | Archivo | Bits | Tamano | wikitext-2 ppl | MT ppl |
|---|---|---|---:|---:|---:|
| Hy-MT2-1.8B | `hy-mt2-1.8b-q4tp.cmf` | 4.17 | 950.5 MB | 27.13 | 14.02 |
| Hy-MT2-1.8B | `hy-mt2-1.8b-q1t.cmf` | 2.25 | 694.9 MB | 4 460 | 27.88 |
| Hy-MT2-7B | `hy-mt2-7b-q4tp.cmf` | 4.17 | 3.93 GB | 90.3 | 98.6 |
| Hy-MT2-30B-A3B | `hy-mt2-30b-a3b-q4tp.cmf` | 4.17 | 15.83 GB | 9.88 | 18.12 |

Notas de la model card: la referencia bf16-class del 1.8B (`q8_2f`, no publicada) obtiene 24.77 en wikitext-2, por lo que el q4tp queda dentro del 10 % (27.13 frente a 24.77). La MT ppl se calcula sobre 16 pares de frases en formato chat (RU/EN/ZH/DE/FR/ES/JA/IT/UK/PT, 1 073 tokens) en el prompt propio del modelo. El 7B usa el tokenizador antiguo de HunYuan (vocab 128 167, split estilo GPT-4, markup `<|startoftext|>` … `<|extra_0|>`) y es sensible a ejecutarse sin BOS en medio de un corpus; la model card indica que sus traducciones son las mejores de los tres archivos densos y recomienda comparar tamaños por la columna MT ppl, no por wikitext-2. La perplejidad elevada del q1t en wikitext-2 no es un defecto de conversión: llama.cpp con el kernel STQ1_0 (PR #22836) puntúa el mismo GGUF en 1 793 con su propio protocolo, y ambos valores indican que el checkpoint de 1.25 bits ya no modela prosa inglesa libre, aunque traduce correctamente en todos los backends. En el mismo Xeon, llama.cpp decodifica el q1t a 2,2 tok/s y los kernels `q1t` de cortiq a 21,9 tok/s.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, BLEU/COMET) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: 950,5 MB (1.8B q4tp), 694,9 MB (1.8B q1t), 3,93 GB (7B q4tp), 15,83 GB (30B-A3B q4tp), más overhead del runtime y de la caché KV para el contexto usado.
- GPU recomendadas: no especificadas en la información disponible. El runtime soporta Vulkan (NVIDIA, AMD, Intel), DX12 y Apple Metal, además de CPU.
- Cabe en GPU de consumo: sí para 1.8B y 7B en la mayoría de tarjetas con 4-8 GB de VRAM; el 30B-A3B q4tp requiere aproximadamente 16 GB solo para pesos, por lo que exige tarjetas de gama alta o ejecución en CPU con suficiente RAM.
- Opciones de despliegue: `cortiq-cli` versión 0.7.0 o superior (primera release con soporte HunYuan). Versiones anteriores no conocen las arquitecturas `hunyuan_v1_dense` / `hy_v3`, y la 0.6.9 falla con cualquier embedding de 4 bits.
- Latencia y throughput: la model card solo aporta una cifra concreta, 21,9 tok/s para el 1.8B q1t en un Xeon con los kernels de cortiq, frente a 2,2 tok/s de llama.cpp con el mismo archivo. Para el resto de variantes y backends no hay datos publicados.
- En el 30B-A3B, el grafo wgpu de token completo decodifica en 12 submits por token; la ruta por operaciones cae a 145 submits y 1,2 tok/s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Hy-MT2-cmf (esta ficha) | 1.8B / 7B / 30B-A3B | 262 144 | CMF (q4tp, q1t) | Apache 2.0 | Runtime cortiq, sin Python ni CUDA; 33 idiomas |
| tencent/Hy-MT2-1.8B (base) | 1.8B | 262 144 | safetensors bf16 | Apache 2.0 | Requiere stack PyTorch/CUDA o conversión a GGUF |
| tencent/Hy-MT2-7B (base) | 7B | 262 144 | safetensors bf16 | Apache 2.0 | Tokenizador antiguo, vocab 128 167 |
| tencent/Hy-MT2-30B-A3B (base) | 30B (3B activos) | 262 144 | safetensors bf16 | Apache 2.0 | MoE con router sigmoide y experto compartido |

No se dispone en la información proporcionada de comparaciones con modelos de traducción de otros proveedores (por ejemplo, NLLB, M2M-100 o SeamlessM4T) en parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- El archivo q1t de 1.25 bits es un especialista de traducción: su perplejidad en prosa inglesa general (4 460 en wikitext-2 con el protocolo de la model card) lo inhabilita para generación de texto libre.
- El 7B usa un tokenizador distinto al de las otras variantes y es sensible a la ausencia de BOS en medio de un corpus; hay que respetar el formato de chat embebido.
- No hay datos publicados de sesgos, tasas de alucinación ni evaluación BLEU/COMET en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones y limitaciones de los modelos base de Tencent; conviene revisar sus fichas.
- Requiere `cortiq` 0.7.0 o superior; versiones anteriores fallan o no soportan las arquitecturas HunYuan.
- El repositorio ocupa 21,4 GB, aunque cada archivo individual es sustancialmente menor.
- El contexto nativo de 262 144 tokens implica un consumo de caché KV proporcional al contexto efectivamente usado; no se han publicado cifras de memoria por token de contexto.
- La model card no documenta el proceso de entrenamiento original (tokens, composición del dataset, RLHF/DPO); esa información debe consultarse en las fichas de los modelos base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/infosave/Hy-MT2-cmf
- Colección Hy-MT2 de Tencent: https://huggingface.co/collections/tencent/hy-mt2
- Modelo base 1.8B: https://huggingface.co/tencent/Hy-MT2-1.8B
- Modelo base 7B: https://huggingface.co/tencent/Hy-MT2-7B
- Modelo base 30B-A3B: https://huggingface.co/tencent/Hy-MT2-30B-A3B
- Repositorio del runtime CMF: https://github.com/infosave2007/cmf
- PR de llama.cpp con el kernel STQ1_0: https://github.com/ggml-org/llama.cpp/pull/22836
