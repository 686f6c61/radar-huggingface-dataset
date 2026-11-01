# ntily/supra15_amharic_fineweb2_clm_v1g

## Resumen

`supra15_amharic_fineweb2_clm_v1g` es un modelo de lenguaje causal de 51,8 millones de parámetros desarrollado por el usuario `ntily` y especializado en amárico (escritura ge'ez). Se trata de la continuación del modelo `v1f`, sobre el que se aplicaron 15.200 pasos adicionales de preentrenamiento causal con un optimizador reiniciado y un decaimiento coseno de la tasa de aprendizaje. El modelo se distribuye como base para el ajuste fino en corrección gramatical (GEC) en amárico y como referencia de investigación para modelos causales pequeños en ese idioma.

La arquitectura es un transformer `LlamaForCausalLM` compacto (hidden 512, 12 capas, 8 cabezas de atención con 4 cabezas KV, embeddings atados) con una longitud máxima de 5.120 posiciones y un tokenizador BPE a nivel de byte con vocabulario de 32.000 tokens. El entrenamiento se realizó sobre `amh_Ethi` de FineWeb2 (428.000 documentos) más los objetivos de entrenamiento de `hayuLabs/Amh_gec_v1` (638.000 filas tras deduplicación exacta y filtrado de textos cortos), totalizando 1,066 millones de documentos y 1.170 millones de caracteres.

Su relevancia es acotada pero clara: cubre el hueco de modelos base pequeños y abiertos para amárico, un idioma con escasa representación en el ecosistema de modelos abiertos. La mejora de perplejidad respecto a `v1f` es del 13,5 % en el conjunto de validación, aunque el modelo sigue siendo muy limitado en conocimiento factual y no está pensado para uso directo en producción sin ajuste fino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer causal decoder-only) |
| Parametros totales | 51.786.240 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 5.120 posiciones |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | am (amárico, escritura ge'ez) |
| Licencia | no disponible |
| Formato de pesos | safetensors (fp32) |
| Dimension oculta | 512 |
| Capas | 12 |
| Cabezas de atencion | 8 (4 cabezas KV, GQA) |
| Dimension intermedia | 1.408 |
| Vocabulario | 32.000 tokens (byte-level BPE, NFKC) |
| Tokens especiales | `<pad>=0`, `</s>=1`, `<unk>=2` |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only estilo Llama, con 12 capas, dimensión oculta de 512, dimensión intermedia de 1.408, 8 cabezas de atención con 4 cabezas KV (GQA), embeddings atados entre entrada y salida, y una longitud máxima de 5.120 posiciones. El tokenizador es un BPE a nivel de byte con vocabulario de 32.000 tokens y normalización NFKC, adecuado para la escritura ge'ez del amárico.

El entrenamiento parte de los pesos finales de `v1f` (que había completado 12.000 pasos con inicialización aleatoria) y añade 15.200 pasos con un optimizador nuevo, batch efectivo de 32 (8 × grad accumulation 2 × 2 GPUs T4 en DDP), tasa de aprendizaje máxima de 5e-5 con decaimiento coseno y warmup del 0,5 %. El objetivo es modelado de lenguaje causal con bloques de 1.024 tokens y semilla 3408. Se configuró early stopping (paciencia de 10 evaluaciones × 500 pasos, umbral 1e-4) pero nunca se disparó: la pérdida seguía mejorando al alcanzar el límite de pasos. El entrenamiento completo requirió unas 9,5 horas en 2× Tesla T4 (Kaggle), con 2,25 s por paso. Los datos son los mismos que en `v1f`: el flujo completo de `amh_Ethi` de FineWeb2 (428.000 documentos) más los objetivos de entrenamiento de `hayuLabs/Amh_gec_v1` tras deduplicación exacta y filtrado de textos cortos (638.000 filas), sumando 1,066 millones de documentos y 1.170 millones de caracteres, sin límite de tokens.

## Capacidades

- Generación de texto causal en amárico con escritura ge'ez, tanto en modo greedy como con muestreo (temperatura y top-p).
- Modelado de lenguaje base: útil como punto de partida para ajuste fino supervisado, no como asistente instruido.
- Base para corrección gramatical (GEC) en amárico: el autor lo designa explícitamente como modelo base para el ajuste fino `ntily/supra15_amharic_gec_v1g`.
- Continuación de texto con contexto de hasta 5.120 posiciones, suficiente para párrafos y documentos cortos.
- Tokenización robusta a nivel de byte para la escritura ge'ez, con vocabulario dedicado de 32.000 tokens.
- No dispone de soporte documentado de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.

## Casos de uso

- Ajuste fino para corrección gramatical en amárico: el modelo sirve como inicialización para el modelo GEC `ntily/supra15_amharic_gec_v1g`, aprovechando que ya ha visto los objetivos de `Amh_gec_v1` durante el preentrenamiento.
- Línea base de investigación en modelos causales pequeños para amárico: permite comparar arquitecturas, tokenizadores y regímenes de entrenamiento con un coste computacional muy bajo (2× T4 en menos de 10 horas).
- Generación de texto asistida en amárico con muestreo: con temperatura ≈0,8 y top-p ≈0,9 produce continuaciones topicales y gramaticalmente razonables, según los ejemplos cualitativos del autor.
- Experimentos de destilación o compresión: sus 51,8 M de parámetros y 0,2 GB de pesos lo hacen adecuado como alumno o como referencia en estudios de eficiencia.
- Prototipado de autocompletado o sugerencia de texto en amárico dentro de entornos con recursos limitados (CPU o GPU de gama baja), dado su tamaño reducido.
- Evaluación de técnicas de tokenización para ge'ez: el tokenizador byte-BPE de 32k tokens con NFKC puede estudiarse frente a alternativas en tareas de perplejidad y generación.

## Benchmarks y rendimiento

Evaluación sobre frases de `val_clean` de `Amh_gec_v1` (924 tokens, fp32 en Apple MPS), según la model card:

| Modelo | NLL medio | Perplejidad | Top-1 siguiente token |
|---|---|---|---|
| v1f | 5,8202 | 337,05 | 16,99 % |
| v1g | 5,6754 | 291,60 | 19,26 % |

Mejora relativa de perplejidad de v1g frente a v1f: −13,5 % (337,1 → 291,6). No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (51,8 M de parámetros ≈ 207 MB de pesos), con overhead adicional de activaciones y caché KV muy reducido.
- Cabe holgadamente en cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) e incluso en CPU para inferencia interactiva.
- GPU recomendadas: ninguna en particular; el autor entrenó en 2× Tesla T4 y evaluó en Apple MPS. Para producción a gran escala, cualquier GPU moderna es suficiente.
- Opciones de despliegue: `transformers` (probado con 4.51 mediante parche en `tokenizer_config.json`, y con 5.x sin parche). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, ni pesos GGUF publicados.
- Latencia y throughput: no disponibles en la información proporcionada. El coste de entrenamiento fue de 2,25 s por paso en 2× T4 con batch efectivo de 32.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Disponibilidad |
|---|---|---|---|---|---|
| supra15_amharic_fineweb2_clm_v1g | 51,8 M | 5.120 | no disponible | am | HuggingFace (0 descargas) |
| supra15_amharic_fineweb2_clm_v1f | no disponible | no disponible | no disponible | am | HuggingFace (modelo base) |
| supra15_amharic_gec_v1g | no disponible | no disponible | no disponible | am | HuggingFace (ajuste fino GEC) |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa con alternativas de otros autores.

## Limitaciones y advertencias

- Con 51,8 M de parámetros, el conocimiento del mundo es muy limitado y las respuestas factuales no son fiables; no debe usarse como fuente de información.
- La decodificación greedy puede entrar en bucles con algunos prefijos; el autor recomienda muestreo (T≈0,8, top-p≈0,9).
- Entrenado sobre FineWeb-2 en amárico y los objetivos de `Amh_gec_v1`; puede desviarse en otros dominios o registros.
- Solo cubre amárico (escritura ge'ez); no hay soporte multilingüe documentado.
- La licencia no está disponible, por lo que no se puede confirmar el uso comercial sin consultar al autor.
- El modelo es una base de preentrenamiento, no un modelo instruido: no sigue instrucciones ni mantiene diálogos de forma fiable sin ajuste fino.
- No se han publicado evaluaciones de sesgo, toxicidad o alucinación; se desconoce el comportamiento en dominios sensibles.
- Requiere un parche en `tokenizer_config.json` para funcionar con `transformers` 4.51 (eliminar `tokenizer_class`, `backend`, `is_local`; fijar `add_bos_token=false` y `add_eos_token=false`).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ntily/supra15_amharic_fineweb2_clm_v1g
- Modelo base v1f: https://huggingface.co/ntily/supra15_amharic_fineweb2_clm_v1f
- Dataset de construcción: https://huggingface.co/datasets/ntily/amharic-lm-build
- Dataset GEC de referencia: https://huggingface.co/datasets/hayuLabs/Amh_gec_v1
- Ajuste fino GEC derivado: https://huggingface.co/ntily/supra15_amharic_gec_v1g
- FineWeb2: no disponible enlace directo en la información proporcionada
