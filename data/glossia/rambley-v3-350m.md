# glossia/Rambley-V3-350M

## Resumen

Rambley-V3-350M es un modelo de lenguaje de ~343 millones de parámetros desarrollado por el usuario glossia, publicado en Hugging Face bajo licencia CC-BY-SA-4.0. Se trata de un modelo base (no instruido) preentrenado desde cero sobre una mezcla de aproximadamente 36.000 millones de tokens de datos web filtrados, matemáticas y datos de elicitación de aprendizaje en contexto, sin datos sintéticos generados por LLM según el autor. Su relevancia radica en que busca superar a modelos clásicos de tamaño similar (GPT-2 Medium, OPT-350M, Pythia-410M) utilizando un orden de magnitud menos de tokens de entrenamiento.

El modelo emplea una arquitectura transformer con innovaciones recientes: atención con cabezas virtuales, gating por cabeza, attention sinks aprendidos, ventana deslizante de 128 tokens combinada con GQA, embeddings posicionales HoPE e hiperconexiones de identidad. Además, el 60% del presupuesto de tokens de preentrenamiento se realizó con entrenamiento a nivel de parche (patch-level training), una técnica que agrupa tokens para acelerar el entrenamiento.

Con un contexto nativo de 2048 tokens y pesos en formato safetensors, Rambley-V3-350M se posiciona como una opción compacta para experimentación, fine-tuning y despliegue en hardware modesto, aunque sus resultados en benchmarks quedan por debajo de modelos modernos del mismo rango como SmolLM2-360M o Qwen3-0.6B-Base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con SwiGLU, Virtual Head Attention, headwise gated attention, attention sinks, SWA:SWA:GQA, HoPE, Identity Hyperconnections, patch-level pretraining |
| Parámetros totales | 343.077.360 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (nativa) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con MLPs SwiGLU y una serie de modificaciones arquitectónicas orientadas a eficiencia y estabilidad. Destaca el uso de Virtual Head Attention con 16 cabezas de consulta falsas y 8 físicas (Ding et al., 2026), gating por cabeza en la atención (Qiu et al., 2025) y attention sinks aprendidos en cada cabeza (OpenAI, 2026; LLM-Core Xiaomi, 2026). El patrón de atención es SWA:SWA:GQA con ventana deslizante de 128 tokens, forzando la última capa a GQA. Emplea embeddings posicionales HoPE tanto en capas SWA como GQA (Chen et al., 2024) e hiperconexiones de identidad. El entrenamiento se realizó nativamente en BF16, con optimizador Muon a LR 0.02 para matrices (el texto de la model card se corta en este punto).

El preentrenamiento consumió aproximadamente 36.000 millones de tokens, de los cuales el 60% se entrenó con patch-level pretraining (Shao et al., 2025; Peng et al., 2026). La mezcla de datos incluye HuggingFaceTB/dclm-edu, common-pile/libretexts_filtered, common-pile/youtube_filtered, OpenBMB/UltraData-Math, gvlassis/ClimbMix, IFM/TxT360-v2 y glossia/picl-text. El autor afirma que no se introdujo datos sintéticos generados por LLM, salvo posible contaminación de las fuentes originales. No se menciona RLHF ni DPO; es un modelo base.

## Capacidades

- Generación de texto autoregresiva en inglés (idiomas no confirmados oficialmente).
- Razonamiento básico y respuesta a preguntas de sentido común, evaluado en ARC, HellaSwag y PIQA.
- Aritmética elemental, evaluado con Arithmark 3.0 (39,70%).
- Capacidad de aprendizaje en contexto potenciada por el dataset picl-text.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo thinking, visión ni audio.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Experimentación académica en arquitecturas eficientes: el modelo incorpora técnicas recientes (Virtual Head Attention, attention sinks, HoPE, patch-level training) y sirve como banco de pruebas para reproducir o comparar estas innovaciones con un presupuesto de cómputo reducido.
- Fine-tuning para tareas de clasificación o generación específicas: con 343M parámetros y pesos safetensors, se puede ajustar en una única GPU consumer para dominios concretos como análisis de sentimiento o resumen de textos cortos.
- Despliegue en entornos con recursos limitados: su tamaño permite inferencia en CPU o GPU de gama baja, adecuado para prototipos locales o dispositivos edge.
- Evaluación de técnicas de entrenamiento con pocos tokens: útil para estudiar la eficiencia de patch-level pretraining y mezclas de datos curadas frente a modelos entrenados con billones de tokens.
- Generación de texto creativo o completado en inglés: puede emplearse en aplicaciones de escritura asistida con contexto de hasta 2048 tokens, aunque la calidad será inferior a modelos modernos del mismo tamaño.
- Investigación sobre sesgos y alineación en modelos pequeños: al ser un modelo base sin RLHF, sirve para analizar sesgos crudos provenientes de los datos web filtrados.
- Docencia y formación: ejemplo práctico de pipeline completo de preentrenamiento con datasets públicos y arquitectura documentada.

## Benchmarks y rendimiento

Resultados publicados por el autor (0-shot, sin filtro):

| Tarea | Métrica | Valor | Stderr |
|---|---|---|---|
| ARC-Challenge | acc | 0,2765 | ±0,0131 |
| ARC-Challenge | acc_norm | 0,3183 | ±0,0136 |
| ARC-Easy | acc | 0,6473 | ±0,0098 |
| ARC-Easy | acc_norm | 0,5875 | ±0,0101 |
| HellaSwag | acc | 0,3844 | ±0,0049 |
| HellaSwag | acc_norm | 0,4924 | ±0,0050 |
| PIQA | acc | 0,7095 | ±0,0106 |
| PIQA | acc_norm | 0,7155 | ±0,0105 |

Comparativa con modelos clásicos de ~350M (según model card):

| Métrica | Rambley-V3-350M | Rambley-V2.1-350M | GPT-2 Medium | OPT-350M | Pythia-410M | GPT-3 Medium (reportado) |
|---|---|---|---|---|---|---|
| HellaSwag | 49,24 | 37,49 | 39,38 | 36,82 | 40,63 | 43,6 |
| ARC-E | 58,75 | 49,71 | 43,60 | 40,19 | 45,92 | 46,5 |
| ARC-C | 31,83 | 28,50 | 25,00 | 23,72 | 24,49 | 29,5 |
| PIQA | 71,55 | 65,89 | 66,38 | 64,36 | 67,30 | 70,2 |
| Arithmark 3.0 | 39,70% | 36,10% | 33,80% | 38,30% | 36,90% | N/A |
| Tokens de entrenamiento | ~36B | ~16B | Desconocido (~20B) | 180B | ~300B | ~300B |

Comparativa con modelos modernos de ~350M (según model card):

| Métrica | Rambley-V3-350M | SmolLM-360M | SmolLM2-360M | Qwen3-0.6B-Base | LFM2.5-230M-Base | LFM2.5-350M-Base |
|---|---|---|---|---|---|---|
| HellaSwag | 49,24 | 53,44 | 56,33 | 53,68 | 39,29 | 45,16 |
| ARC-E | 58,75 | 63,64 | 68,27 | 58,08 | 59,72 | 68,86 |
| ARC-C | 31,83 | 36,26 | 38,23 | 38,74 | 34,98 | 41,13 |
| PIQA | 71,55 | 71,38 | 71,60 | 69,80 | 63,38 | 67,63 |
| Tokens de entrenamiento | ~36B | 600B | 4T | 36T | 28T | 28T |

Comparativa con modelos modernos de ~150M (según model card):

| Métrica | Rambley-V3-350M | Boris-2 | KLM-1.6 | GPT-X3-150M |
|---|---|---|---|---|
| HellaSwag | 49,24 | 50,26 | 45,28 | 46,16 |
| ARC-E | 58,75 | 59,81 | 61,07 | 59,64 |
| ARC-C | 31,83 | 32,00 | 33,53 | 31,31 |
| PIQA | 71,55 | 72,91 | 70,18 | 71,33 |
| Arithmark 3.0 | 39,70% | 45,10% | 55,90% | 50,90% |
| Parámetros | ~350M | 144M | 99M | 149,4M |
| Tokens de entrenamiento | ~36B | ~200B | ~308B | ~187,5B |

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: ~0,7 GB (343M parámetros × 2 bytes) más overhead de activaciones y KV cache; en la práctica, menos de 2 GB para contexto completo de 2048 tokens.
- VRAM estimada en cuantización de 8 bits: ~0,35 GB; en 4 bits: ~0,2 GB (estimaciones teóricas, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100, H100 son más que suficientes.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU dedicada moderna e incluso en iGPU con memoria compartida.
- Opciones de despliegue: no se especifican en la model card. Al ser safetensors con custom_code, requiere cargar con `trust_remote_code=True` en transformers. No se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI; la conversión a GGUF no está documentada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | HellaSwag | ARC-C | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Rambley-V3-350M | 343M | 2048 | 49,24 | 31,83 | CC-BY-SA-4.0 | Hugging Face |
| SmolLM2-360M | 360M | 2048 (típico) | 56,33 | 38,23 | Apache-2.0 (según modelo) | Hugging Face |
| Qwen3-0.6B-Base | 0,6B | 32K (típico) | 53,68 | 38,74 | Apache-2.0 | Hugging Face |
| Pythia-410M | 410M | 2048 | 40,63 | 24,49 | Apache-2.0 | Hugging Face |

Rambley-V3-350M supera a Pythia-410M y a los clásicos GPT-2 Medium y OPT-350M con menos tokens de entrenamiento, pero queda por debajo de SmolLM2-360M y Qwen3-0.6B-Base en tareas de sentido común y razonamiento, a pesar de que estos últimos emplean muchos más tokens. Su ventaja principal es la licencia CC-BY-SA-4.0 (permite uso comercial con atribución y compartir igual) y su bajo coste de entrenamiento.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones (no RLHF/DPO): no sigue instrucciones de forma fiable ni está alineado para diálogo.
- Riesgo elevado de alucinación y generación de texto incoherente en tareas complejas, propio de modelos de 350M.
- Contexto nativo limitado a 2048 tokens; no se documenta extrapolación.
- Idiomas soportados no confirmados; probablemente entrenado principalmente en inglés por la composición de los datasets.
- Sesgos inherentes a los datos web filtrados (dclm-edu, libretexts, youtube) y matemáticos; no se documenta mitigación.
- Licencia CC-BY-SA-4.0: permite uso comercial pero exige atribución y que las obras derivadas se compartan bajo la misma licencia (copyleft).
- Requiere `trust_remote_code=True` por el uso de custom_code, lo que implica ejecutar código del autor.
- Sin datos de benchmarks en tareas generativas (MMLU, GSM8K, HumanEval) ni evaluaciones de seguridad.
- El repositorio tiene 0 descargas y solo 2 likes en el momento de la consulta; madurez y soporte comunitario muy limitados.
- El texto de la model card está truncado en la sección de optimizadores, por lo que detalles finales del entrenamiento no están disponibles.

## Enlaces

- Hugging Face: https://huggingface.co/glossia/Rambley-V3-350M
- Discord del autor: https://discord.gg/6acXmq3yx2
- Virtual Head Attention (Ding et al., 2026): https://arxiv.org/abs/2610.17959v1
- Headwise gated attention (Qiu et al., 2025): https://arxiv.org/abs/2505.06708v1
- Attention sinks (OpenAI, 2026): https://arxiv.org/abs/2508.10925
- Attention sinks (LLM-Core Xiaomi, 2026): https://arxiv.org/abs/2601.02780
- Sliding window attention (Qiao et al., 2026): https://arxiv.org/abs/2606.15378
- HoPE positional embeddings (Chen et al., 2024): http://arxiv.org/abs/2410.21216v2
- Identity Hyperconnections (涮月亮的谪仙人, 2026): https://zhuanlan.zhihu.com/p/2010852389670908320
- Patch-level pretraining (Shao et al., 2025): https://arxiv.org/abs/2407.12665v3
- Patch-level pretraining (Peng et al., 2026): https://arxiv.org/abs/2605.06546
