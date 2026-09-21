# kingjones777/K2-Horizon-3.7B-ROCmFP4-GGUF

## Resumen

K2-Horizon-3.7B-ROCmFP4-GGUF es una conversión a GGUF del modelo denso IFM/K2-Horizon-3.7B, publicada por el usuario kingjones777 y orientada específicamente a hardware AMD con ROCm. La conversión, el grafo de cómputo y el pre-tokenizador BPE son propios: el autor mantiene una implementación de la arquitectura k2-horizon dentro de su fork ROCmFPX, porque llama.cpp upstream todavía no soporta este modelo (issue ggml-org/llama.cpp#28361).

El modelo base es un decoder denso de 36 capas con GQA (32 cabezas de consulta, 8 de clave/valor), head_dim 128, SwiGLU, RoPE con theta 1e7 y un vocabulario de 250.624 tokens. Su rasgo distintivo es la normalización RMS agrupada en dos grupos contiguos a lo largo de la dimensión oculta, aplicada en los tres puntos de normalización, incluida la final. Los metadatos de safetensors declaran 5.058.255.360 parámetros totales, pese a que el nombre del repositorio indica 3.7B.

La relevancia práctica de esta ficha es doble: por un lado, ofrece pesos cuantizados (Q4_0 y Q8_0) medidos y validados sobre una APU Strix Halo (gfx1151, ROCm 7.2.4); por otro, advierte de que estos ficheros no son intercambiables con los GGUF del propio fabricante, ya que aplican la permutación de q/k que espera `LLAMA_ROPE_TYPE_NORM`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso, 36 capas, GQA 32 cabezas / 8 kv, head_dim 128, SwiGLU, RoPE theta 1e7, RMS norm agrupada en 2 grupos |
| Parámetros totales | 5.058.255.360 (según metadatos de safetensors del modelo base); el nombre del repositorio indica 3.7B |
| Parámetros activos | no aplica (arquitectura densa, no MoE) |
| Longitud de contexto | 524.288 tokens declarados; el autor sirve 131.072 por consumo de memoria KV |
| Tipos de cuantización | Q4_0_ROCMFP4_STRIX_LEAN (2,99 GB), Q4_0_ROCMFP4_COHERENT (3,18 GB), Q8_0_ROCMFPX_AGENT (5,33 GB), Q8_0_ROCMFPX (5,26 GB); BF16 como referencia |
| Idiomas soportados | no disponible (la model card no los declara; la medición de perplejidad usa prosa en inglés) |
| Licencia | apache-2.0 (heredada de IFM/K2-Horizon-3.7B) |
| Formato de pesos | GGUF (llama.cpp), con `tokenizer.ggml.pre = k2-horizon` y plantilla de chat embebida |
| Dimensión oculta / FFN | 2560 / 10240 |
| Vocabulario | 250.624 tokens |
| Modelo base | IFM/K2-Horizon-3.7B |

## Arquitectura y entrenamiento

La arquitectura es un decoder transformer denso de 36 capas con atención por grupos (GQA) de 32 cabezas de consulta y 8 de clave/valor, dimensión de cabeza 128, activación SwiGLU, RoPE con theta 1e7, dimensión oculta 2560 y FFN de 10240. El vocabulario es de 250.624 tokens. La innovación técnica documentada es la normalización RMS agrupada: en lugar de calcular la norma sobre el vector completo, se calcula dentro de `attention.group_norm_groups = 2` grupos contiguos de la dimensión oculta, en los tres puntos de normalización, incluida la norma final. Los pesos de normalización conservan el ancho completo, por lo que el agrupamiento no es visible en el checkpoint.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de los datos ni sobre si hubo RLHF, DPO u otro ajuste posterior. Lo que sí documenta el autor es el proceso de conversión: extracción del modelo base, conversión a BF16, inyección de metadatos y plantilla de chat, y cuantización con `llama-quantize` del fork ROCmFPX (rama `k2-horizon`). La conversión aplica la permutación de q/k que espera `LLAMA_ROPE_TYPE_NORM` en llama.cpp, a diferencia de los GGUF del fabricante, que almacenan q/k en formato HF sin permutar. El pre-tokenizador propio difiere del de llama 3 en que el grupo de contracciones es insensible a mayúsculas y la secuencia de letras admite `\p{M}`, ZWNJ (U+200C) y ZWJ (U+200D).

## Capacidades

- Generación de texto y uso conversacional (la model card y el pipeline declarado son `text-generation` / `conversational`).
- Niveles de razonamiento configurables mediante entrada de plantilla: `reasoning_effort` alto genera `<ifm|think>`, medio `<ifm|think_fast>` y bajo `<ifm|think_faster>`.
- Tool calling / function calling con `--jinja`, verificado por el autor en 3 de 3 casos.
- Contexto largo: 524.288 tokens declarados en configuración, con 131.072 tokens como valor realmente servible por restricciones de memoria KV.
- Capacidades multilingües: no disponible.
- Visión, audio u otras modalidades: no disponibles (modelo estrictamente de texto).

## Casos de uso

- Asistente conversacional local sobre APU AMD: el modelo cabe en memoria unificada de Strix Halo con cuantización Q4_0 (2,99 GB) y permite desplegar un servidor `llama-server` sin GPU dedicada, útil para entornos con requisitos de privacidad donde el texto no puede salir del equipo.
- Procesamiento de documentos extensos: con 131.072 tokens de contexto servibles (19,3 GB de KV) se pueden resumir o extraer información de contratos, informes técnicos o expedientes completos en una sola pasada, sin troceado y sin pérdida de coherencia entre fragmentos.
- Agentes con uso de herramientas: el soporte de tool calling verificado con `--jinja` permite construir agentes multi-paso que consulten APIs, ejecuten búsquedas o encadenen llamadas a funciones, con el nivel de razonamiento ajustable según el coste por token.
- Generación de código asistida en pipelines internos: al admitir plantillas con formato de herramienta, puede integrarse en flujos de revisión o de autocompletado; conviene validar la calidad con benchmarks propios, porque no hay datos publicados de HumanEval ni similares.
- Clasificación y extracción sobre corpus largos: tareas de etiquetado, enrutado o extracción estructurada sobre lotes de documentos de decenas de miles de tokens, aprovechando la ventana amplia y el coste bajo de la cuantización Q4_0.
- Experimentación en investigación sobre normalización: la variante de RMS norm agrupada en dos bloques es un objeto de estudio poco común; el modelo sirve para reproducir ablaciones y comparar con normalización estándar, siempre que se use el fork ROCmFPX.
- Servicio con niveles de razonamiento graduados: despliegues donde se alterna entre `<ifm|think>` para consultas complejas y `<ifm|think_faster>` para consultas triviales, reduciendo latencia y tokens generados en el segundo caso.

## Benchmarks y rendimiento

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible. El autor sí publica mediciones de perplejidad sobre 400 KB de prosa en inglés, con `-c 512 --chunks 20`, offload completo a GPU y el mismo binario y sesión para todas las filas:

| Fichero | Tamaño | Perplejidad |
|---|---:|---:|
| BF16 (referencia) | — | 15,777 |
| Q4_0_ROCMFP4_STRIX_LEAN | 2,99 GB | 17,857 |
| Q4_0_ROCMFP4_COHERENT | 3,18 GB | 17,537 |
| Q8_0_ROCMFPX_AGENT | 5,33 GB | 15,989 |
| Q8_0_ROCMFPX | 5,26 GB | 16,590 |

Notas del autor: `STRIX_LEAN` se construye con `--output-tensor-type q6_K` (cabeza protegida) y no con el nivel bruto; `Q8_0_ROCMFPX_AGENT` obtiene mejor perplejidad que `Q8_0_ROCMFPX` con el mismo coste nominal de 8,25 bpw, sin cabeza MTP implicada.

Comparación de conversiones (BF16, mismo corpus, mismo binario y sesión):

| Conversión | Perplejidad |
|---|---:|
| Esta conversión (BF16) | 15,777 |
| IFM/K2-Horizon-3.7B-GGUF (vendor), BF16 | 125,65 |

## Requisitos de hardware

- VRAM/memoria estimada: los ficheros ocupan entre 2,99 GB (Q4_0_STRIX_LEAN) y 5,33 GB (Q8_0_ROCMFPX_AGENT). Hay que sumar el caché KV, que a 131.072 tokens consume 19,3 GB. Un servicio con Q4_0 y contexto de 131.072 ronda los 22-23 GB totales; con Q8_0, unos 25 GB (estimación aritmética a partir de los datos del autor).
- Contexto máximo declarado: 524.288 tokens requieren 72 GiB de KV (77.309.411.328 bytes) y fallan en hardware de 128 GiB. El autor recomienda pasar `-c` explícitamente y sirve 131.072.
- GPU/plataforma objetivo: AMD gfx1151 (Strix Halo, RDNA 3.5) con ROCm 7.2.4. La compilación documentada usa `-DGGML_HIP=ON -DGPU_TARGETS=gfx1151 -DAMDGPU_TARGETS=gfx1151`.
- GPU de consumo: el hardware de referencia es una APU con memoria unificada, no una GPU discreta. No se documenta ruta CUDA, por lo que el uso en RTX 4090 u otras NVIDIA no está soportado en esta conversión.
- Opciones de despliegue: `llama-server` compilado desde la rama `k2-horizon` del repositorio ROCmFPX. No hay soporte documentado en vLLM, Ollama, TGI ni en llama.cpp upstream. Comando de referencia: `llama-server -m <fichero> -ngl 999 -fa on -fit off -dev ROCm0 --ctx-size 131072 --jinja`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto declarado | Formato | Licencia | Perplejidad BF16 |
|---|---:|---:|---|---|---:|
| IFM/K2-Horizon-3.7B (base original) | 5.058.255.360 | 524.288 | safetensors | apache-2.0 | no disponible |
| IFM/K2-Horizon-3.7B-GGUF (vendor) | 5.058.255.360 | 524.288 | GGUF, q/k sin permutar | apache-2.0 | 125,65 (medida con el binario de esta conversión) |
| kingjones777/K2-Horizon-3.7B-ROCmFP4-GGUF (esta conversión) | 5.058.255.360 | 524.288 | GGUF, permute `LLAMA_ROPE_TYPE_NORM` | apache-2.0 | 15,777 |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables de otros fabricantes en la información proporcionada, por lo que no es posible una comparación de rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- No está soportado por llama.cpp upstream (issue ggml-org/llama.cpp#28361): requiere compilar el fork ROCmFPX (`-b k2-horizon`) con HIP y gfx1151.
- Los ficheros no son intercambiables con los GGUF del fabricante: estos llevan la permutación de q/k que espera `LLAMA_ROPE_TYPE_NORM`, mientras que los de IFM almacenan q/k en formato HF sin permutar. Mezclar conversión y binario degrada gravemente la perplejidad (125,65 frente a 15,777 en BF16).
- La plantilla de chat del repositorio base usa `{%- if spec is sameas true -%}`, no soportada por el motor minja de llama.cpp, que falla con `Parser Error: Expected %} (Got true)`. Estos GGUF embeben la plantilla del GGUF del vendor, que sí se parsea.
- El contexto declarado de 524.288 tokens no es viable en la práctica: 72 GiB de KV y fallo en hardware de 128 GiB. El valor servible documentado es 131.072.
- El pre-tokenizador propio coincide con HF `tokenizers` en 48 de 50 casos de prueba; las dos discrepancias se producen con marcas combinantes, donde HF aplica su normalizador NFC declarado y la ruta BPE de llama.cpp no.
- Cuantización con coste medible: la perplejidad sube de 15,777 (BF16) a 17,857 en Q4_0_STRIX_LEAN y 17,537 en Q4_0_COHERENT. Para tareas sensibles a la precisión conviene Q8_0 o BF16.
- No se documentan idiomas soportados ni datos de sesgo; la evaluación de perplejidad se hizo solo con prosa en inglés.
- No hay datos publicados sobre alucinación, y el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que la conversión no cuenta con validación de la comunidad.
- Discrepancia de nomenclatura: el repositorio se llama 3.7B, pero los metadatos declaran 5.058.255.360 parámetros totales. La diferencia es coherente con el peso de las matrices de embedding de un vocabulario de 250.624 tokens, aunque no se documenta explícitamente.
- Licencia Apache-2.0, heredada del modelo base: permite uso comercial, pero conviene verificar las condiciones del repositorio original IFM/K2-Horizon-3.7B.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kingjones777/K2-Horizon-3.7B-ROCmFP4-GGUF
- Modelo base: https://huggingface.co/IFM/K2-Horizon-3.7B
- GGUF del fabricante: https://huggingface.co/IFM/K2-Horizon-3.7B-GGUF
- Repositorio ROCmFPX (rama k2-horizon): https://github.com/kingjones30/ROCmFPX
- Issue de soporte en llama.cpp: https://github.com/ggml-org/llama.cpp/issues/28361
