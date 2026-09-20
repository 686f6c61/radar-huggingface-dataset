# 88plug/Gemma4-E2B-it-W4A16

## Resumen

Gemma4-E2B-it-W4A16 es una cuantización post-entrenamiento a INT4 del modelo multimodal google/gemma-4-e2b-it, publicada por el usuario 88plug. Se trata de una arquitectura MoE dispersa con 128 expertos, 5.104.297.539 parámetros totales y aproximadamente 2.000 millones de parámetros activos por token, que incorpora una torre de visión SigLIP y una torre de audio. El resultado es, según el autor, "el MoE multimodal capaz más pequeño" y el primer empaquetado W4A16 con formato compressed-tensors nativo para vLLM de esta familia.

El problema que resuelve es de eficiencia de memoria: el modelo base en BF16 ocupa unos 14 GB de pesos, mientras que esta versión cuantizada reduce el peso en disco y VRAM a aproximadamente 7,0 GiB, lo que permite ejecutarlo en GPU de consumo de 8 GB (RTX 3080 10 GB o RTX 4070) manteniendo activaciones en 16 bits (esquema W4A16). Solo se cuantizan las capas `Linear` del backbone del lenguaje; torre de visión, torre de audio, proyector multimodal, embeddings por capa (PLE), `lm_head` y normas permanecen en BF16.

Es relevante ahora porque es la primera cuantización compressed-tensors/vLLM-nativa publicada para `gemma-4-e2b-it`, lo que permite servir el modelo mediante `vllm serve` sin flag de cuantización y con el backend OpenAI-compatible. El autor la clasifica como versión provisional ("datafree RTN", con re-cuantización programada) y advierte de que el backend TGI no carga este formato.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE dispersa (128 expertos), atención híbrida sliding + global, torre de visión SigLIP, torre de audio, Per-Layer Embeddings (PLE) |
| Parámetros totales | 5.104.297.539 (≈5,1 B) |
| Parámetros activos | ≈2 B (modelo "E2B", dato nominal del autor; no se detalla el reparto exacto por token) |
| Longitud de contexto | 32.768 tokens en la configuración de despliegue recomendada por el autor (contexto nativo máximo no especificado) |
| Tipos de cuantización | INT4 W4A16 (4 bits en pesos, 16 bits en activaciones), simétrica, sin datos (datafree RTN); existe variante W8A16 del mismo autor |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato compressed-tensors (`pack-quantized` / `int-quantized`); GGUF no disponible |

## Arquitectura y entrenamiento

El modelo base `google/gemma-4-e2b-it` es un transformer de mezcla de expertos dispersa con 128 expertos y atención híbrida que combina ventanas deslizantes con atención global. A esto se añaden tres componentes multimodales: una torre de visión SigLIP, una torre de audio y un proyector multimodal que alinea las representaciones visuales/auditivas con el espacio del backbone de lenguaje. El backbone incorpora además Per-Layer Embeddings (PLE) mediante `embed_tokens_per_layer` y `per_layer_model_projection`. Los detalles sobre volumen de tokens de entrenamiento, composición del dataset y uso de RLHF/DPO no están disponibles en la información proporcionada.

La innovación de esta publicación es la receta de cuantización, no el entrenamiento. Se aplica una cuantización post-entrenamiento (PTQ) con `QuantizationModifier` de llmcompressor en modo datafree RTN (round-to-nearest sin calibración con datos) sobre todas las capas `Linear` de `self_attn.{q,k,v,o}_proj` y `mlp.{gate,up,down}_proj` de los bloques transformer, con esquema W4A16. Quedan explícitamente excluidos y en BF16: `lm_head`, embeddings de tokens, layer norms, las capas PLE (`embed_tokens_per_layer`, `per_layer_model_projection`, cuya cuantización degrada catastróficamente la salida según el autor), `vision_tower`, `audio_tower` y `multi_modal_projector`. El autor indica que el wrapper AutoRound quedó bloqueado por los hijos `q_proj.linear` de Gemma4 y que la vía aplicada es temporal hasta que se corrija en upstream.

## Capacidades

- Generación de texto conversacional en inglés, con pipeline declarado `image-text-to-text`.
- Procesamiento multimodal de imagen: entrada de imagen combinada con texto mediante la torre de visión SigLIP y el proyector multimodal.
- Componente de audio presente en la arquitectura (torre de audio mantenida en BF16), aunque el pipeline declarado es image-text-to-text y no se documenta una tarea de audio específica.
- Razonamiento multi-paso y agentes: no documentado en la información disponible.
- Tool calling / function calling: no documentado en la información disponible.
- Capacidades multilingües: limitadas a inglés (`language: en`).
- Modo "thinking" explícito: no documentado en la información disponible.
- Servicio mediante API OpenAI-compatible a través de vLLM, lo que habilita integración directa con clientes existentes.

## Casos de uso

- Inferencia multimodal en GPU de consumo: desplegar el modelo en una RTX 3080 de 10 GB o RTX 4070 con `vllm serve` y `--kv-cache-dtype fp8`, ocupando unos 7 GB entre pesos y caché KV a 32k de contexto, para prototipos de descripción de imágenes y diálogo sobre imágenes sin acceso a hardware de centro de datos.
- Clasificación y etiquetado de imágenes con justificación textual: usar la entrada image-text-to-text para generar descripciones o etiquetas en inglés acompañadas de razonamiento breve, aprovechando que la torre de visión se mantiene en BF16 y conserva la calidad multimodal.
- Asistente conversacional de bajo coste: servir el modelo con el endpoint `/v1/chat/completions` de vLLM detrás de un `OpenAI(base_url="http://localhost:8080/v1")`, útil para sustituir modelos densos de mayor tamaño en tareas de diálogo general en inglés donde el coste por token importa.
- Evaluación de pipelines de cuantización: este checkpoint sirve como referencia para medir el efecto de W4A16 frente a BF16 y W8A16 en la misma familia, usando las métricas objetivo declaradas (divergencia KL < 0,014 y recuperación de MMLU ≥ 99 %).
- Procesamiento por lotes de alto rendimiento: con los valores reportados de 6.843-7.399 tok/s agregados (prompt + salida) bajo vLLM v0.21.0, es adecuado para tareas de extracción o resumen por lotes donde el throughput agregado prima sobre la latencia individual.
- Despliegue en entornos con VRAM muy restringida: al reducir los pesos de ~14 GB a ~7 GiB, permite ejecutar un MoE multimodal en una única GPU de 8 GB, habilitando nodos de borde o workstations modestas para investigación.
- Base para fine-tuning o evaluación comparativa en investigación: al ser la primera cuantización compressed-tensors para `gemma-4-e2b-it`, sirve como punto de partida reproducible para estudiar degradación de calidad en MoE multimodales cuantizados.

## Benchmarks y rendimiento

El autor publica únicamente métricas de throughput de la "88plug benchmark ladder" con vLLM v0.21.0 y lm-evaluation-harness, además de objetivos de calidad. No se publican resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de capacidad en la información disponible.

| Métrica | Valor |
|---|---|
| Throughput total (entrada 2048 / salida 512) | 7.399 tok/s (prompt + salida) |
| Throughput total (entrada 512 / salida 256) | 7.126 tok/s (prompt + salida) |
| Throughput total (entrada 8192 / salida 512) | 6.843 tok/s (prompt + salida) |
| Divergencia KL frente a BF16 (objetivo) | < 0,014 |
| Recuperación de MMLU (objetivo) | ≥ 99 % |
| FLAC (métrica del autor) | no medida (hito a T+7 días) |

## Requisitos de hardware

- VRAM de pesos: ~7,0 GiB en esta cuantización W4A16, frente a ~14 GB del modelo base en BF16.
- Caché KV: ~1,0 GB a 32k de contexto en fp8 (mismo valor en BF16 y en esta cuantización).
- Total a 32k de contexto: ~7 GB (W4A16) frente a ~15 GB (BF16).
- GPU mínima indicada por el autor: 1× RTX 3080 10 GB o RTX 4070; cabe, por tanto, en GPU de consumo de 8 GB según la model card.
- GPU mínima para BF16: RTX 3090 de 24 GB.
- Opciones de despliegue soportadas: vLLM ≥ 0.21 (preferido, autodetección de compressed-tensors sin flag `--quantization`), transformers con la librería `compressed-tensors` (los modelos multimodales pueden requerir código propio). TGI no está soportado para estos paquetes CT. SGLang: la model card incluye una nota que queda cortada en la información disponible, por lo que su estado no puede confirmarse.
- Ejemplo de arranque probado: `vllm/vllm-openai:v0.21.0-cu129-ubuntu2404` con `--kv-cache-dtype fp8 --max-model-len 32768 --gpu-memory-utilization 0.90`.
- Latencia: no disponible. Solo se publican cifras agregadas de throughput.
- GGUF/Ollama/llama.cpp: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Origen | Formato | Comparativa |
|---|---|---|---|
| google/gemma-4-e2b-it | oficial | BF16 | Techo de calidad de referencia; ~14 GB de pesos, requiere RTX 3090 de 24 GB. |
| RedHatAI/gemma-3n-E4B-it-quantized.w4a16 | RedHatAI | compressed-tensors W4A16 | Mismo esquema y formato, generación anterior y mayor tamaño; alternativa de ecosistema más maduro. |
| 88plug/Gemma4-E2B-it-W8A16 | 88plug | compressed-tensors W8A16 | Variante del mismo autor con mayor precisión de pesos y presumiblemente mayor huella de memoria. |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Es una cuantización provisional basada en RTN sin datos (datafree), no en AutoRound ni en una calibración con dataset; el autor indica que hay una re-cuantización programada.
- La degradación de calidad respecto a BF16 solo está expresada como objetivo (KL < 0,014, recuperación MMLU ≥ 99 %), no como medición publicada; FLAC no está medido.
- Idiomas: únicamente inglés (`language: en`). El rendimiento en castellano no está evaluado ni garantizado.
- La cuantización afecta solo al backbone de lenguaje; un error de configuración que cuantice las capas PLE (`embed_tokens_per_layer`, `per_layer_model_projection`) degrada catastróficamente la salida según el autor.
- TGI (`text-generation-inference`) no carga este formato y produce errores opacos de worker/load; el widget de inferencia de Hugging Face falla con frecuencia según la model card.
- Riesgo de alucinación: no cuantificado en la información disponible. Al ser un modelo de 2B activos, cabe esperar una tasa de error superior a la de modelos densos mayores, pero no se aportan datos.
- Sesgos conocidos: no documentados en la información proporcionada.
- Licencia apache-2.0, que permite uso comercial, pero la licencia del modelo base `google/gemma-4-e2b-it` debe verificarse de forma independiente antes de un despliegue comercial.
- Disponibilidad limitada: 80 descargas y 0 likes en el momento de la consulta, autor individual (88plug) y sin historial de mantenimiento acreditado; conviene fijar una revisión concreta del repositorio.
- El estado de soporte en SGLang no puede confirmarse porque la nota correspondiente aparece truncada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/88plug/Gemma4-E2B-it-W4A16
- Modelo base: https://huggingface.co/google/gemma-4-e2b-it
- La búsqueda web realizada no ha devuelto enlaces relevantes para este modelo: los resultados obtenidos corresponden a páginas de YouTube Music y no guardan relación con la ficha.
