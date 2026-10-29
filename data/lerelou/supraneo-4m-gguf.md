# Lerelou/SupraNeo-4M-GGUF

## Resumen

SupraNeo-4M-GGUF es la distribución cuantizada en formato GGUF del modelo base SupraLabs/SupraNeo-4M, un transformer decoder-only de 4.070.240 parámetros entrenado desde cero por Lerelou (DedeProGames) con el objetivo explícito de estudiar cómo repartir el presupuesto de parámetros en la escala de los 4 millones. Frente a otros modelos minúsculos, que dedican la mayor parte de su capacidad a una matriz de embeddings de vocabulario grande, este diseño usa un tokenizador BPE propio de 4.096 tokens que reduce los embeddings a 524.000 parámetros y libera el resto para una pila profunda y estrecha: 12 capas, dimensión oculta 160 y relación profundidad/ancho de aproximadamente 13, por debajo de la que usan los modelos de la clase 100M.

El modelo sigue la arquitectura Qwen3 (`Qwen3ForCausalLM`) sin código de modelado personalizado, con GQA 2:1, SwiGLU, RMSNorm con QK-Norm y embeddings atados, y fue preentrenado sobre 5.000 millones de tokens con una mezcla del 84 % de FineWeb-Edu filtrado y el 16 % de DCLM-baseline. Se publica como base model, sin plantilla de chat ni ajuste por instrucciones, con licencia Apache 2.0 y un alcance declarado de artefacto de investigación.

Su relevancia es metodológica, no de producto: sirve como banco de pruebas reproducible para estudiar presupuestos de vocabulario, mezclas de datos y métricas sensibles en la escala de 4M, donde benchmarks convencionales como HellaSwag, PIQA o ARC se sitúan en el nivel del azar y no discriminan. La model card es inusualmente honesta: el modelo solo supera de forma clara el azar en compleción de lenguaje local y no tiene capacidad factual, aritmética ni de código.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, `Qwen3ForCausalLM` (12 capas, hidden 160, 4 cabezas de atención con head_dim 40, GQA 2:1, SwiGLU con intermedio 432) |
| Parámetros totales | 4.070.240 (3,41 M no-embedding, 83,9 % del total) |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 1.024 tokens (entrenado en dos fases: 512 y extensión a 1.024 en el anneal final) |
| Tipos de cuantización | Repositorio etiquetado como `quantized` en GGUF; niveles concretos (Q4_K_M, Q8_0, etc.) no disponibles |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF en este repositorio; el modelo base se publica en float32 (safetensors) |
| Vocabulario | 4.096 tokens, BPE propio, ~3,2 caracteres por token |
| Normalización | RMSNorm + QK-Norm |
| Embeddings | Atados (tied) |
| Precisión declarada | float32 en el modelo base |
| `trust_remote_code` | No requerido |
| Datos de entrenamiento | 84 % `HuggingFaceFW/fineweb-edu` (int_score ≥ 4), 16 % `mlfoundations/dclm-baseline-1.0`; 5.000 M de tokens |
| Emisiones declaradas | 0,46 kg CO₂ eq. (estimación de un único run de preentrenamiento) |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Tamaño del repositorio | 0,0 GB (ver advertencias) |

## Arquitectura y entrenamiento

La arquitectura es un decoder-only tipo Qwen3 con 12 capas y dimensión oculta 160, lo que da una relación profundidad/ancho de ~13, deliberadamente por debajo de la clase 100M y alineada con el hallazgo de MobileLLM de que el óptimo se desplaza hacia la profundidad al reducir el tamaño. La atención usa 4 cabezas con head_dim 40 y 2 cabezas KV (GQA 2:1), lo que reduce el coste del caché; la MLP es SwiGLU con dimensión intermedia 432. Se aplica RMSNorm y QK-Norm, los embeddings están atados y la inicialización escala las ramas residuales por 1/√(2L). El tokenizador BPE propio de 4.096 tokens es la decisión de diseño central: deja la matriz de embeddings en 524.000 parámetros y permite que el 82 % del modelo compute transformaciones reales en lugar de actuar como tabla de búsqueda.

El preentrenamiento se hizo desde cero sobre 5.000 millones de tokens (unas 1.230 tokens por parámetro) con schedule WSD, pico de learning rate 4e-3, 1.500 pasos de warmup y decaimiento 1-sqrt en el 20 % final; batch de 65.536 tokens por paso y AdamW (β 0,9/0,95, weight decay 0,1 en parámetros 2D, grad clip 1,0, z-loss 1e-4). En el último 20 % se annealiza solo con el subconjunto de FineWeb-Edu y se extiende el contexto de 512 a 1.024. La ponderación hacia FineWeb-Edu es intencionada: según el autor, DCLM-baseline está optimizado para razonamiento en el rango 1–7B y esa ventaja no se transfiere a 4M, donde lo aprendible es registro y fluidez local, y la prosa expositiva uniforme de FineWeb-Edu es más fácil de modelar. No se reporta RLHF, DPO ni ninguna fase de alineación.

## Capacidades

- Generación de texto en inglés con gramática correcta y registro consistente, con coherencia limitada a una o dos frases.
- Compleción de lenguaje local: es la única capacidad claramente por encima del azar en la evaluación publicada (56,0 % de acierto, +5,06 σ).
- Razonamiento lógico muy marginal (38,0 %, +2,12 σ), en el límite de la significación estadística con el tamaño de muestra usado.
- No soporta tool calling ni function calling: es un modelo base sin formato de instrucciones.
- No soporta agentes ni razonamiento multi-paso.
- No hay modo thinking, ni visión, ni audio.
- Sin plantilla de chat: `apply_chat_template` falla por diseño.
- Multilingüismo: solo inglés; no se reporta entrenamiento en otros idiomas.
- Capacidad aritmética y de código: nula según la propia evaluación (cuantitativa 24,0 % y código 22,0 %, en el nivel o por debajo del azar).

## Casos de uso

- Docencia y divulgación sobre preentrenamiento: demostrar en directo la predicción del siguiente token con un modelo que ocupa pocos megabytes y produce continuaciones plausibles de una o dos frases, ilustrando qué aprende y qué no aprende un LM a esta escala.
- Baseline de ablación en experimentos de vocabulario: comparar bits-per-byte frente a modelos con tokenizadores de 32k para cuantificar el coste de compresión de un vocabulario de 4.096 tokens (~35 % menos eficiente) en estudios de presupuesto de embeddings.
- Prueba de humo en pipelines de cuantización: usar el modelo como fixture barato en CI para validar conversiones a GGUF, carga en llama.cpp y regresiones del grafo de inferencia sin consumir GPU.
- Investigación sobre mezclas de datos: reproducir el efecto de ponderar FineWeb-Edu frente a DCLM-baseline en el régimen de 4M parámetros y medir con bits-per-byte y BLiMP, métricas que el autor señala como las únicas con sensibilidad real a esta escala.
- Sondas de gramaticalidad y lingüística computacional: explotar la distribución condicional del modelo para puntuar continuaciones en inglés y estudiar el sesgo hacia registro expositivo inducido por el filtrado `int_score ≥ 4`.
- Validación de despliegues en entornos con recursos mínimos: probar end-to-end runtimes en embebidos, WASM o móvil con un modelo de pocos MB antes de sustituirlo por uno mayor.
- Generación de texto de relleno en pruebas de interfaz o de contenedores: producir prosa genérica plausible cuando se necesita contenido de ejemplo sin datos reales ni coste de inferencia relevante.
- No se recomienda su uso en atención al cliente, generación de código en producción ni ningún flujo que requiera instrucciones, datos factuales o aritmética.

## Benchmarks y rendimiento

Evaluación publicada por el autor en BananaMind Base Bench 1.1: 350 ítems, elección de continuación entre 4 opciones por verosimilitud, sin token BOS ni special tokens, selección por mayor log-probabilidad condicional media y Elo por MLE ponderado.

| Categoría | Precisión | z vs azar | Elo | Significativa |
|---|---:|---:|---:|:--:|
| Compleción de lenguaje | 56,0 % | +5,06 | 963 | Sí |
| Razonamiento lógico | 38,0 % | +2,12 | 978 | Sí |
| Conocimiento del mundo | 34,0 % | +1,47 | 820 | No |
| Seguimiento de contexto | 34,0 % | +1,47 | 856 | No |
| Sentido común | 26,0 % | +0,16 | 770 | No |
| Cuantitativo | 24,0 % | −0,16 | 834 | No |
| Compleción de código | 22,0 % | −0,49 | 883 | No |

| Métrica agregada | Valor |
|---|---|
| Elo global | 868 |
| Suelo por azar | 805 |
| Margen sobre el azar | +63 |
| Precisión bruta | 33,4 % (IC 95 %: 28,5–38,4 %) |
| z frente al azar | +3,64 (significativo) |
| Precisión por dificultad | fácil 39,3 %, media 29,1 %, difícil 31,9 % |

No se han publicado resultados en MMLU, HumanEval, GSM8K, HellaSwag, PIQA ni ARC; el autor indica explícitamente que estos benchmarks se sitúan en el azar a esta escala y no se reportan. Tampoco hay mediciones publicadas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: ~16,3 MB en fp32 y ~8,1 MB en fp16 para los pesos; ~4,3 MB en Q8_0 y ~2,5 MB en Q4_K_M (cálculo a partir de los 4.070.240 parámetros, no dato publicado).
- Caché KV: ~7,9 MB en fp32 y ~3,9 MB en fp16 para la ventana completa de 1.024 tokens (12 capas × 2 cabezas KV × head_dim 40).
- GPU recomendadas: ninguna en particular; el modelo cabe en cualquier GPU consumer e incluso en iGPU. Una RTX 4090, A100 o H100 está sobredimensionada por varios órdenes de magnitud.
- Cabe en GPU consumer: sí, en todas; también en CPU, Raspberry Pi y entornos WASM/navegador.
- Opciones de despliegue: llama.cpp (etiqueta del repositorio), Ollama mediante Modelfile, `transformers` para el modelo base en fp32, y cualquier runtime compatible con GGUF. vLLM o TGI son técnicamente posibles pero no aportan ventaja a este tamaño.
- Latencia y throughput: no disponibles. A este tamaño el coste dominante será el overhead del runtime y el tokenizador, no el cómputo de la pila transformer.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| SupraNeo-4M (este) | 4,07 M | 1.024 | Apache 2.0 | GGUF + safetensors | Vocabulario de 4.096; 84 % FineWeb-Edu; sin instrucciones |
| TinyStories-1M / 8M (`roneneldan`) | 1 M / 8 M | No disponible | No disponible | Pesos en HuggingFace | Entrenados en corpus sintético infantil; dominio muy restringido |
| Pythia-14M (`EleutherAI`) | 14 M | 2.048 | Apache 2.0 | Pesos en HuggingFace | Suite con checkpoints intermedios para investigación de escalado |
| SmolLM-135M (`HuggingFaceTB`) | 135 M | No disponible | Apache 2.0 | Pesos en HuggingFace | ~33× más parámetros; ya con capacidad de instrucciones en sus variantes |

Los datos de los modelos comparables provienen de sus model cards públicas y no se han verificado en esta ficha. La comparación relevante para SupraNeo-4M no es de rendimiento absoluto, sino de diseño: es el único de la lista que documenta explícitamente el reparto entre embeddings y pila transformer y que publica una evaluación con intervalos de confianza y corrección por azar.

## Limitaciones y advertencias

- Sin ajuste por instrucciones: es un modelo base; no sigue instrucciones y `apply_chat_template` falla por diseño.
- Sin fiabilidad factual: no hay conocimiento del mundo aprovechable (34,0 %, indistinguible del azar).
- Sin capacidad aritmética ni de código: 24,0 % y 22,0 % respectivamente, en el nivel del azar o por debajo.
- Coherencia limitada a una o dos frases, con deriva temática a partir de ahí.
- Solo inglés; no se ha entrenado ni evaluado en castellano ni en otros idiomas.
- Riesgo de alucinación alto por ausencia de base factual: cualquier salida que parezca un dato debe considerarse inventada.
- Sesgos heredados del corpus: FineWeb-Edu filtrado por `int_score ≥ 4` favorece prosa expositiva formal y sesga el registro; DCLM-baseline aporta la distribución web general en un 16 %.
- El vocabulario de 4.096 tokens comprime el texto ~35 % menos eficientemente que un tokenizador de 32k, lo que invalida comparaciones por entropía cruzada directa con otros modelos; debe usarse bits-per-byte.
- La licencia Apache 2.0 permite uso comercial, pero el autor declara el modelo como artefacto de investigación no destinado a despliegue.
- Inconsistencia en la model card: el YAML de emisiones indica 1× A100 mientras el cuerpo del texto describe entrenamiento en una única NVIDIA L4; la cifra de 0,46 kg CO₂ eq. debe tomarse con cautela.
- Inconsistencia en la identidad del modelo base: los metadatos de HuggingFace apuntan a `SupraLabs/SupraNeo-4M`, mientras el ejemplo de código de la model card usa `DedeProGames/SupraNeo-4M`.
- El repositorio figura con 0,0 GB y 0 descargas en el momento de la consulta: conviene verificar que los ficheros GGUF están realmente publicados antes de integrarlo en un pipeline.

## Enlaces

- Repositorio HuggingFace de esta cuantización: https://huggingface.co/Lerelou/SupraNeo-4M-GGUF
- Modelo base declarado en los metadatos: https://huggingface.co/SupraLabs/SupraNeo-4M
- Identificador alternativo citado en la model card: https://huggingface.co/DedeProGames/SupraNeo-4M
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset DCLM-baseline-1.0: https://huggingface.co/datasets/mlfoundations/dclm-baseline-1.0
- Runtime citado en las etiquetas del repositorio (llama.cpp): https://github.com/ggml-org/llama.cpp
