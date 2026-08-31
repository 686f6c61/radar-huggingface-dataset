# sajalregmi4/arkios-1b-base

## Resumen

Arkios-1B-base es un modelo de lenguaje bilingüe inglés-nepalí de 1.040 millones de parámetros, desarrollado por Sajal Regmi (sajalregmi4) y publicado en Hugging Face con licencia Apache 2.0. Se trata de un modelo base preentrenado desde cero —arquitectura, tokenizador y bucle de entrenamiento propios— sobre 150.000 millones de tokens, superando el punto óptimo de Chinchilla (150 tokens por parámetro). Su principal innovación es un tokenizador diseñado específicamente para el devanagari, que corrige el fallo estructural de los tokenizadores BPE estándar basados en la clase `\p{L}+`, que fragmenta las palabras nepalesas en cada signo vocálico o virama. Con una ventana de contexto de 4096 tokens y arquitectura Qwen3-compatible (GQA, RMSNorm, SwiGLU, RoPE, QK-norm), este modelo busca ofrecer una base sólida para el nepalí, un idioma de bajos recursos, sin sacrificar el rendimiento en inglés.

El modelo se publica como checkpoint base (solo preentrenamiento de siguiente token, sin ajuste por instrucciones), pensado para ser fine-tuneado o usado como modelo de autocompletado. Existe una versión chat (arkios-1b-chat) para uso conversacional directo. Su relevancia radica en abordar la brecha de representación de lenguas de escritura no latina en modelos pequeños, demostrando que un tokenizador adaptado al sistema de escritura puede mejorar sustancialmente la eficiencia de tokenización (1,69 tokens/palabra en nepalí frente a la fragmentación típica).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, compatible con Qwen3 (GQA + RMSNorm + SwiGLU + RoPE + QK-norm) |
| Parametros totales | 1.040.267.776 (1,04B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | No especificado en la información disponible (pesos en safetensors, formato FP32/BF16 presumible) |
| Idiomas soportados | Inglés (en), nepalí (ne, escritura devanagari) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 18 capas con tamaño oculto de 2048, 16 cabezas de atención de consulta y 8 cabezas KV (proporción GQA 2:1), dimensión de cabeza de 128, FFN de 6144 con activación SwiGLU, vocabulario de 65.536 entradas y embeddings atados. Usa RoPE con theta de 1.000.000 y normalización QK. La arquitectura es compatible con Qwen3, lo que facilita su integración en ecosistemas existentes.

El entrenamiento se realizó sobre 150.000 millones de tokens, con una mezcla que incluye FineWeb-Edu (submuestreado de un pool de 342B), OpenWebMath (pool de 12,8B), GitHub-code-clean (pool de ~1,7B), y varios corpus nepalíes: FineWeb-2 `npi_Deva` (pool de 3,32B), Sangraha verificado (0,40B), IndicCorpV2 `npi_Deva` (0,42B), Wikipedia `ne` (0,02B) y datos privados nepalíes no redistribuibles (~0,015B). El corpus público nepalí práctico total disponible era de ~4,18B tokens únicos, por lo que el texto nepalí se repite en varias épocas mientras que el inglés no. El entrenamiento se realizó en un nodo de 8×H100 SXM5 durante ~79 horas con una MFU medida del 42,95%, usando un entrenador personalizado en C/CUDA de un solo archivo (sin PyTorch en el camino crítico). Este entrenador no se publica; solo se distribuyen pesos, tokenizador y configuración.

La innovación clave es el tokenizador: en lugar de la clase de palabra estándar `\p{L}+` (letras Unicode), usa `[\p{L}\p{M}]+` (letras y marcas), lo que evita la fragmentación de los signos vocálicos y viramas del devanagari. Esto logra 1,69 tokens/palabra en nepalí, frente a la fragmentación estructural que sufrirían los tokenizadores convencionales.

## Capacidades

- Generación de texto en inglés y nepalí (escritura devanagari) como modelo base de siguiente token.
- Autocompletado y finalización de texto, adecuado para tareas de completado de código o prosa.
- Base para fine-tuning supervisado (SFT) y aprendizaje por refuerzo (RLHF/DPO) hacia tareas específicas.
- Comprensión lectora en nepalí: en formato de respuesta directa (sin letras A/B/C/D) alcanza 0,306 de accuracy normalizado en Belebele, 3,6 errores estándar por encima del azar.
- Comprensión lectora en inglés: 0,387 de accuracy normalizado en el mismo conjunto Belebele (formato de respuesta directa).
- Razonamiento de sentido común y conocimiento enciclopédico básico, con resultados notables en ARC (ver benchmarks).
- No soporta tool calling, agentes ni razonamiento multi-paso de forma nativa al ser un modelo base sin ajuste por instrucciones.
- Capacidad multilingüe limitada a inglés y nepalí; no hay soporte para otras lenguas indias ni escrituras.

## Casos de uso

- Autocompletado de texto en nepalí para editores y procesadores de texto: el modelo puede sugerir continuaciones de frases en devanagari con baja fragmentación de tokens, lo que mejora la fluidez y reduce el coste computacional por palabra.
- Fine-tuning para asistentes de escritura en nepalí: partiendo de este base, se puede ajustar con datos instructivos para generar contenido periodístico, literario o técnico en nepalí, aprovechando su tokenizador eficiente.
- Generación de código con comentarios y documentación en nepalí: al haber sido entrenado con GitHub-code-clean, puede servir como base para un modelo de autocompletado de código que genere identificadores y comentarios en nepalí.
- Sistemas de preguntas y respuestas sobre textos educativos en inglés: su buen rendimiento en ARC (0,735 en ARC-Easy con 10 disparos) lo hace adecuado para fine-tuning en dominios de ciencia escolar.
- Traducción automática inglés-nepalí: aunque no se reportan métricas completas de traducción en la información disponible, el modelo base puede fine-tunearse para tareas de traducción, dado que ha visto ambos idiomas en el preentrenamiento.
- Investigación en tokenización para lenguas de bajos recursos: el tokenizador y el modelo sirven como banco de pruebas para estudiar el impacto de la pre-tokenización en la eficiencia y calidad de modelos multilingües.
- Prototipado de aplicaciones de procesamiento de lenguaje natural en nepalí: al ser un modelo pequeño (1B) y con licencia Apache 2.0, puede desplegarse en entornos con recursos limitados para tareas de clasificación, extracción o generación tras fine-tuning.

## Benchmarks y rendimiento

La model card reporta resultados en la partición de test completa (no submuestreada). Para orientación, se comparan con otros modelos de tamaño similar.

**Inglés — ARC (acc_norm, normalizado por caracteres)**

| Tarea | Disparos | n | acc | acc_norm |
|---|---|---|---|---|
| ARC-Easy | 0 | 2376 | 0,685 | 0,642 |
| ARC-Easy | 10 | 2376 | 0,725 | **0,735** |
| ARC-Challenge | 0 | 1172 | 0,341 | 0,366 |
| ARC-Challenge | 10 | 1172 | 0,384 | 0,416 |
| ARC-Challenge | 25 | 1172 | 0,375 | **0,417** |

**Otras tareas en inglés (zero-shot, muestra parcial de 500 ítems)**

| Tarea | Resultado |
|---|---|
| HellaSwag | 0,54 |
| PIQA | 0,726 |
| COPA | 0,710 |
| OpenBookQA | 0,402 |
| LAMBADA | 0,484 |
| CommonsenseQA | 0,252 |

**Nepalí e inglés — Belebele (900 ítems, 4 opciones, azar = 0,250)**

| Idioma | Formato de prompt | acc_norm | vs. azar |
|---|---|---|---|
| Nepalí (`npi_Deva`) | letra A/B/C/D | 0,240 | al azar |
| Inglés (`eng_Latn`) | letra A/B/C/D | 0,236 | al azar |
| Nepalí (`npi_Deva`) | texto de respuesta, sin letras | **0,306** | +0,074 (centrado) |
| Inglés (`eng_Latn`) | texto de respuesta, sin letras | **0,387** | +0,182 (centrado) |

**Comparación orientativa con otros modelos (acc_norm publicados)**

| Modelo | ARC-Easy | ARC-Challenge |
|---|---|---|
| Pythia-1.4B (300B tok) | 0,57 | 0,26 |
| TinyLlama-1.1B (3T tok) | 0,55 | 0,30 |
| OLMo-1B (3T tok) | 0,57 | 0,31 |
| Arkios-1B-base (150B tok) | **0,735** | **0,417** |

Nota: la model card advierte que el resultado fuerte en ARC puede deberse a la composición educativa de FineWeb-Edu, favorable al formato de ARC, y no debe interpretarse como una capacidad general superior.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1,04B parámetros en FP32, el modelo ocupa ~4,2 GB en memoria (tamaño del repo safetensors). En BF16, ~2,1 GB; en cuantización INT8, ~1,1 GB; en INT4, ~0,6 GB. Estas cifras son estimaciones basadas en el tamaño de parámetros, no datos oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP32, o 2 GB para BF16. Tarjetas consumer como GTX 1060 6GB, RTX 2060, RTX 3060, RTX 4090 son suficientes. Para entrenamiento o fine-tuning, se recomienda al menos 16 GB de VRAM (p. ej., RTX 4090, A100 40GB).
- Cabe en GPUs consumer: sí, incluso en tarjetas de gama baja con cuantización.
- Opciones de despliegue: al ser compatible con transformers y safetensors, puede servirse con vLLM, TGI (text-generation-inference), llama.cpp (si se convierte a GGUF), Ollama (con conversión previa) o directamente con la librería transformers de Hugging Face.
- Latencia y throughput: no se proporcionan datos oficiales. En una GPU moderna (p. ej., RTX 4090), un modelo de 1B en BF16 puede generar decenas de tokens por segundo, pero no hay cifras confirmadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tokens de entrenamiento | Licencia | ARC-Easy (acc_norm) | ARC-Challenge (acc_norm) |
|---|---|---|---|---|---|---|
| Arkios-1B-base | 1,04B | 4096 | 150B | Apache 2.0 | 0,735 | 0,417 |
| Pythia-1.4B | 1,4B | 2048 | 300B | Apache 2.0 | 0,57 | 0,26 |
| TinyLlama-1.1B | 1,1B | 2048 | 3T | Apache 2.0 | 0,55 | 0,30 |
| OLMo-1B | 1,0B | 2048 | 3T | Apache 2.0 | 0,57 | 0,31 |

Arkios-1B-base supera a estos modelos en ARC, aunque con la advertencia de que su entrenamiento con FineWeb-Edu puede favorecer ese benchmark. Su ventaja diferencial es el tokenizador devanagari, que ningún otro modelo de la comparativa ofrece. En cuanto a disponibilidad, todos son de código abierto, pero Arkios es el único con soporte nepalí nativo.

## Limitaciones y advertencias

- El corpus público nepalí disponible era de solo ~4,18B tokens únicos, lo que obligó a repetir el texto nepalí en varias épocas. Esto limita la diversidad y calidad del nepalí aprendido, y es una restricción de disponibilidad de datos, no de modelado.
- En el formato estándar de opción múltiple con letras (A/B/C/D), el modelo puntúa al azar tanto en nepalí como en inglés. Esto indica una incapacidad del modelo base pequeño para seguir la convención de letras, no una limitación lingüística. Cualquier evaluación que use solo ese formato subestimará su capacidad real.
- El rendimiento en nepalí (0,306 en Belebele con respuesta directa) es real pero modesto, y claramente inferior al inglés (0,387). No debe interpretarse como un modelo nepalí de alta capacidad.
- Al ser un modelo base sin ajuste por instrucciones, no es adecuado para uso conversacional directo; requiere fine-tuning para tareas específicas.
- No se han publicado resultados de benchmarks de traducción completos (solo se menciona chrF++ en la model card, pero no se incluyen valores en la información proporcionada).
- El entrenador personalizado en C/CUDA no se libera, lo que limita la reproducibilidad del entrenamiento.
- No se reportan evaluaciones de sesgos, toxicidad o alucinación. Como modelo pequeño entrenado con datos web, es probable que herede sesgos presentes en FineWeb-Edu y otros corpus.
- La licencia Apache 2.0 permite uso comercial, pero los datos privados nepalíes no redistribuibles no se incluyen en los pesos; el modelo en sí no tiene restricciones adicionales conocidas.
- El contexto de 4096 tokens es relativamente corto para aplicaciones que requieran ventanas largas, como análisis de documentos extensos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sajalregmi4/arkios-1b-base
- Versión chat: https://huggingface.co/sajalregmi4/arkios-1b-chat
- Tokenizador Arkios: https://huggingface.co/sajalregmi4/arkios-tokenizer
- Artículo técnico (arXiv): https://arxiv.org/abs/2608.26449
- PDF del artículo: https://arxiv.org/pdf/2608.26449
- Perfil del autor: https://huggingface.co/sajalregmi4
- Sitio personal del autor: https://sajalregmi.com/
