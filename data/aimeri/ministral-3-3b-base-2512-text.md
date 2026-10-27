# aimeri/Ministral-3-3B-Base-2512-text

## Resumen

`aimeri/Ministral-3-3B-Base-2512-text` es una exportación solo de texto del modelo `mistralai/Ministral-3-3B-Base-2512`, el miembro más pequeño de la familia Ministral 3 de Mistral AI. El autor (aimeri) elimina la torre de visión Pixtral y el proyector multimodal (222 tensores) y publica el modelo de lenguaje como un `Ministral3ForCausalLM` plano de 3.429.006.336 parámetros. Los 236 tensores restantes son bit-idénticos al original: no se ha entrenado, fusionado ni cuantizado nada.

Su relevancia es práctica: permite ejecutar el modelo de lenguaje de Ministral 3 3B sin cargar la parte visual, algo útil para despliegues de texto en hardware limitado, para pipelines de fine-tuning que no necesitan visión y para conversiones a GGUF más ligeras. Mantiene la ventana de contexto de 262.144 tokens, el vocabulario Tekken de 131.072 entradas y el escalado de atención estilo Llama 4 del modelo original.

Es importante entender qué es y qué no es: se trata de un modelo **base** (preentrenado), sin plantilla de chat, sin ajuste por instrucciones y con 30 de sus 40 tokens de control "muertos" (filas de embedding nunca entrenadas). Sirve como punto de partida para post-entrenamiento, no como asistente listo para usar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (`Ministral3ForCausalLM`), atención con escalado estilo Llama 4 sobre RoPE YaRN |
| Parámetros totales | 3.429.006.336 (3,43 B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens (`max_position_embeddings`); ventana nativa original de 16.384, extendida con YaRN (factor 16,0, theta 1.000.000) |
| Tipos de cuantización | no se publican cuantizaciones en el repo (solo safetensors en bf16); la conversión a GGUF es posible con `convert_hf_to_gguf.py` de llama.cpp, que registra `Ministral3ForCausalLM` |
| Idiomas soportados | en, fr, es, de, it, pt, nl, zh, ja, ko, ar |
| Licencia | apache-2.0 (según la model card del export) |
| Formato de pesos | safetensors (bf16, 6,86 GB en 236 tensores); repo de 6,9 GB |
| Dimensión oculta | 3.072 |
| Dimensión intermedia | 9.216 |
| Capas | 26 |
| Cabezas de atención / KV | 32 / 8 (GQA), `head_dim` 128 |
| Vocabulario | 131.072 (tokenizer Tekken) |
| Embeddings | atados (`tie_word_embeddings: true`); no existe tensor `lm_head` |
| Tipo de modelo | `model_type: ministral3` (no es un Mistral plano) |
| Plantilla de chat | no incluida (modelo base) |

## Arquitectura y entrenamiento

El export conserva la arquitectura del modelo original: un transformer decoder-only de 26 capas con 3.072 de dimensión oculta, 32 cabezas de atención y 8 cabezas KV (atención con consultas agrupadas), `head_dim` de 128 y FFN de 9.216. El vocabulario es de 131.072 tokens con tokenizer Tekken. La particularidad técnica es que `model_type` sigue siendo `ministral3` y la atención aplica un escalado de temperatura estilo Llama 4 (`rope_parameters.llama_4_scaling_beta = 0.1`), además de RoPE de tipo YaRN con theta 1.000.000 y factor 16 sobre una ventana nativa de 16.384 posiciones. Cargarlo con un loader Mistral genérico que ignore ese parámetro produce resultados degradados.

En cuanto al entrenamiento, **este repositorio no entrena nada**: la model card indica explícitamente que todos los tensores del modelo de lenguaje son bit-idénticos a `mistralai/Ministral-3-3B-Base-2512` y que el proceso consistió en reescribir shards en streaming, solo con CPU, eliminando `vision_tower.*` y `multi_modal_projector.*` y renombrando `language_model.model.*` a `model.*`. No hay datos disponibles en la información proporcionada sobre el número de tokens de preentrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo original. El `config.json` es el `text_config` original promovido al nivel superior.

Una innovación destacable del export es el análisis de "liveness" de tokens de control, medido sobre esta misma exportación: al estar los embeddings atados, cada fila tiene una única norma, y el autor marca como muerta toda fila que sea todo ceros o el mismo vector (coseno > 0,999) que el slot reservado 999 nunca usado. El resultado es que solo 10 de los 40 tokens de control con nombre están entrenados (`<s>`, `</s>`, `[INST]`, `[/INST]`, `[TOOL_CALLS]`, `[IMG_BREAK]`, `[IMG_END]`, `<SPECIAL_27>`, `<SPECIAL_28>`, `[ARGS]`), mientras que 30 están muertos, incluidos `[AVAILABLE_TOOLS]`, `[/AVAILABLE_TOOLS]`, `[TOOL_RESULTS]`, `[/TOOL_RESULTS]`, `[SYSTEM_PROMPT]`, `[/SYSTEM_PROMPT]`, `[PREFIX]`, `[MIDDLE]`, `[SUFFIX]`, `[THINK]`, `[/THINK]`, `<pad>` y `<unk>`.

## Capacidades

- Generación de texto autoregresiva y modelado de lenguaje puro, propio de un modelo base preentrenado.
- Continuación de texto y aprendizaje en contexto (*few-shot*) sin instrucciones: no hay ajuste por instrucciones ni modo "thinking" activo (`[THINK]`/`[/THINK]` están muertos).
- Capacidad multilingüe declarada para 11 idiomas: inglés, francés, español, alemán, italiano, portugués, neerlandés, chino, japonés, coreano y árabe.
- Contexto largo de hasta 262.144 tokens mediante YaRN, útil para documentos extensos y concatenación de corpus.
- Soporte de tool calling: **parcial**. `[TOOL_CALLS]` y `[ARGS]` están vivos, pero los tokens de delimitación de herramientas disponibles y resultados (`[AVAILABLE_TOOLS]`, `[TOOL_RESULTS]`, etc.) están muertos, por lo que el formato completo no es fiable sin post-entrenamiento.
- Capacidades de agente y razonamiento multi-paso: no disponibles de serie en un modelo base; requieren fine-tuning o prompting cuidadoso.
- Sin capacidades de visión ni audio: la torre Pixtral y el proyector fueron eliminados de este export, y `[IMG]`, `[AUDIO]` y `[BEGIN_AUDIO]` figuran como tokens muertos.
- Tokenizer Tekken con backend `mistral-common` disponible automáticamente al incluirse `tekken.json`.

## Casos de uso

- **Punto de partida para fine-tuning supervisado (SFT)**: el caso principal. Al ser un base de 3,4 B con licencia apache-2.0 y contexto de 256K, es adecuado para entrenar un modelo de dominio (legal, médico, atención al cliente) sin cargar los 0,4 B del encoder visual ni pagar el coste de memoria asociado.
- **Continuación de texto y modelado de dominio**: preentrenamiento continuado sobre corpus propios (código, documentación técnica, idiomas minoritarios) usando la ventana larga para concatenar documentos completos sin truncar.
- **Generación aumentada por recuperación (RAG) en local**: con 6,86 GB en bf16 o ~2 GB en Q4, se puede desplegar en una sola GPU de consumo para responder sobre grandes volúmenes de documentación aprovechando el contexto de 262.144 tokens, sin depender de APIs externas.
- **Destilación y generación de datos sintéticos**: usar el modelo como generador de corpus para entrenar modelos más pequeños o para aumentar datasets, con la ventaja de que el contexto largo permite condicionar cada generación con muchos ejemplos previos.
- **Investigación en tokenizers y tokens especiales**: el análisis de liveness y el pipeline `prep_text_only.py` lo convierten en un banco de pruebas útil para estudiar cómo afecta el recorte de tokens de control al post-entrenamiento y qué filas hay que injertar antes de enseñar formato de herramientas.
- **Base para modelos de chat con plantilla propia**: existe una variante derivada del mismo autor (`aimeri/Ministral-3-3B-Base-2512-chatml`) que añade una base ChatML; también se puede partir de este export y definir la plantilla propia, teniendo en cuenta que hay que usar `PreTrainedTokenizerFast` si se quiere control total sobre los tokens especiales.
- **Servicio de inferencia de texto en edge**: al eliminar la parte multimodal, el checkpoint pesa menos y se puede servir con vLLM o llama.cpp en GPUs de 8-12 GB o incluso en CPU con cuantización agresiva, para tareas de clasificación, extracción o resumen por lotes.
- **Evaluación comparativa de exports**: sirve para medir si el recorte de la torre visual altera el comportamiento lingüístico (los pesos son bit-idénticos, así que cualquier diferencia indica un problema de carga o de tokenizer, no del modelo).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del export no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica de calidad, y las páginas del modelo original consultadas solo aportan descripciones cualitativas. El único dato cuantitativo publicado es el análisis de liveness de tokens de control, que se reproduce de forma resumida:

| Métrica medida sobre este export | Valor |
|---|---|
| Tensores conservados | 236 (frente a 458 del original, 222 eliminados) |
| Tamaño en bf16 | 6,86 GB |
| Tokens de control con nombre vivos | 10 de 40 |
| Tokens de control con nombre muertos | 30 de 40 |
| Diferencia de pesos respecto al original | nula (bit-idénticos en el modelo de lenguaje) |

| Token de control | id | Norma | Estado |
|---|---:|---:|---|
| `<s>` | 1 | 0,2175 | vivo |
| `</s>` | 2 | 0,5071 | vivo |
| `[INST]` | 3 | 0,3906 | vivo |
| `[/INST]` | 4 | 0,3896 | vivo |
| `[TOOL_CALLS]` | 9 | 0,3502 | vivo |
| `[ARGS]` | 32 | 0,3113 | vivo |
| `[AVAILABLE_TOOLS]` | 5 | 0,2838 | muerto |
| `[TOOL_RESULTS]` | 7 | 0,2838 | muerto |
| `[SYSTEM_PROMPT]` | 17 | 0,2838 | muerto |
| `[THINK]` | 34 | 0,2838 | muerto |
| `<pad>` | 11 | 0,2838 | muerto |

## Requisitos de hardware

- **Pesos en bf16**: 6,86 GB. Es el mínimo imprescindible para cargar el modelo completo sin cuantizar.
- **Caché KV**: 26 capas × 8 cabezas KV × 128 `head_dim` × 2 (K y V) × 2 bytes ≈ 104 KiB por token. Esto implica ~3,4 GB para 32.000 tokens, ~6,8 GB para 64.000 y ~27 GB para agotar los 262.144 tokens. El contexto largo es mucho más caro en memoria que los propios pesos.
- **VRAM estimada para inferencia en bf16**: 12-14 GB con contextos de 8-16 K; 24 GB o más para contextos de 32-64 K.
- **Cuantización estimada**: ~3,6 GB en Q8 y ~2,0-2,2 GB en Q4_K_M (estimación a partir del número de parámetros; no hay GGUF publicado por el autor).
- **GPU recomendadas**: A100 40/80 GB y H100 para servir con contexto máximo y lotes grandes; L40S o RTX 4090 (24 GB) para bf16 con contexto medio; RTX 3090 (24 GB) como alternativa económica.
- **GPU de consumo**: sí cabe. RTX 4090/3090 en bf16 con contexto moderado; RTX 4070 Ti, 4060 Ti 16 GB, 3080 o 3060 12 GB en Q8/Q4 con contextos de 8-32 K; GPUs de 8 GB solo con Q4 y ventanas cortas.
- **CPU**: viable con llama.cpp en Q4 (2 GB de pesos), aunque el throughput con contexto largo será limitado por el ancho de banda de memoria.
- **Opciones de despliegue**: `transformers` (`AutoModelForCausalLM` con `dtype='bfloat16'`), vLLM (registra `Ministral3ForCausalLM` y sirve con su implementación Mistral, comprobando en el log que el escalado de atención Llama 4 está activo), llama.cpp / GGUF (`convert_hf_to_gguf.py` soporta el modelo con YaRN y escalado de temperatura de atención) y, por derivación, Ollama u otros runners basados en GGUF. TGI no está confirmado en la información disponible.
- **Latencia y throughput**: no disponible (no se han publicado medidas).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `aimeri/Ministral-3-3B-Base-2512-text` (este) | 3,43 B (solo LM) | 262.144 | no (torre visual eliminada) | apache-2.0 | safetensors bf16, 6,86 GB |
| `mistralai/Ministral-3-3B-Base-2512` (original) | 3,4 B LM + 0,4 B visión | 262.144 (256.000 según la documentación de Mistral) | sí (texto + imagen) | apache-2.0 según el export | pesos completos con torre Pixtral |
| `aimeri/Ministral-3-3B-Base-2512-chatml` | 3,43 B | no disponible en la información | no | no disponible en la información | base con plantilla ChatML, sin entrenar |
| Otros modelos base de ~3 B (Llama 3.2 3B, Qwen2.5-3B, Gemma 3 4B) | ~3-4 B | no disponible en la información | variable | no disponible en la información | no verificado en la búsqueda |

La comparación relevante es contra el original: este export pierde visión y gana simplicidad de despliegue, con pesos del modelo de lenguaje idénticos bit a bit y por tanto el mismo comportamiento en tareas de texto. Frente a los base de ~3 B de otros fabricantes, la ventaja diferencial es la ventana de 262.144 tokens y el soporte de GGUF en llama.cpp; no hay datos de benchmarks en la información disponible para comparar calidad.

## Limitaciones y advertencias

- **Es un modelo base**: no sigue instrucciones, no tiene plantilla de chat y no está alineado. Usarlo directamente como asistente produce continuaciones, no respuestas.
- **30 de 40 tokens de control están muertos**: no se puede confiar en `[SYSTEM_PROMPT]`, `[AVAILABLE_TOOLS]`, `[TOOL_RESULTS]`, `[THINK]`, `[PREFIX]`/`[MIDDLE]`/`[SUFFIX]` ni `<pad>` sin entrenar o injertar esas filas. El soporte de tool calling y de system prompt es, en la práctica, incompleto.
- **Riesgo de alucinación**: inherente a cualquier modelo base de 3,4 B; no hay evaluación de fidelidad publicada.
- **Sesgos**: no se documenta ninguna evaluación de sesgos ni composición del dataset de preentrenamiento, por lo que el riesgo de sesgos de género, raza o idioma es desconocido y no mitigado.
- **No tocar `tie_word_embeddings`**: ponerlo a `false` deja `lm_head` con inicialización aleatoria, porque no existe tensor de cabeza en el checkpoint. Es un fallo silencioso que arruina el modelo.
- **Compatibilidad de loader**: `model_type` es `ministral3`; los loaders que asumen un Mistral plano ignoran el escalado de atención Llama 4 y degradan la calidad. En vLLM hay que verificar en el log que `llama_4_scaling` está activo.
- **Caveat del tokenizer**: `AutoTokenizer` devuelve el backend `mistral-common` porque `tekken.json` está presente, y ese backend ignora plantillas Jinja personalizadas. Si se hace fine-tuning con plantilla propia hay que cargar `PreTrainedTokenizerFast`. Si se elimina `tekken.json` de una copia, hay que cambiar además `tokenizer_class` a `PreTrainedTokenizerFast` en `tokenizer_config.json`: en transformers 5.x la clase `LlamaTokenizerFast` reconstruye un pre-tokenizer estilo sentencepiece e ignora `tokenizer.json`, con lo que `"a\nb"` pasa a ser un único token y los saltos de línea desaparecen.
- **Sin visión ni audio**: pese a que el vocabulario conserva los tokens `[IMG]`, `[IMG_BREAK]`, `[IMG_END]` y `[AUDIO]`, no hay torre visual ni proyector; `[IMG]`, `[AUDIO]` y `[BEGIN_AUDIO]` están muertos.
- **Coste real del contexto largo**: agotar los 262.144 tokens exige ~27 GB solo de caché KV, muy por encima de lo que sugiere el tamaño de los pesos.
- **Licencia**: el export declara apache-2.0, pero conviene verificar los términos del modelo original de Mistral AI antes de un uso comercial a gran escala.
- **Madurez**: el repo tiene 0 descargas y 0 likes en el momento de la consulta, y no se han publicado benchmarks ni cuantizaciones oficiales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aimeri/Ministral-3-3B-Base-2512-text
- Modelo original: https://huggingface.co/mistralai/Ministral-3-3B-Base-2512
- Variante con plantilla ChatML del mismo autor: https://huggingface.co/aimeri/Ministral-3-3B-Base-2512-chatml
- Documentación oficial de Ministral 3 3B: https://docs.mistral.ai/models/ministral-3-3b-25-12
- Ficha en MindStudio: https://www.mindstudio.ai/models/ministral-3-3b
- Entrada en SourceForge: https://sourceforge.net/projects/ministral-3-3b-base-2512/
- Script de conversión a GGUF (llama.cpp): https://github.com/ggerganov/llama.cpp/blob/master/convert_hf_to_gguf.py
