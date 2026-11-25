# devilloots/story-llm-20mb

## Resumen

Story20MB es un generador de historias en inglés entrenado desde cero por el desarrollador independiente devilloots. Se trata de un modelo de lenguaje de escala muy reducida, con 9,84 millones de parámetros (unos 18,78 MiB en FP16), diseñado específicamente para la tarea de continuar historias a partir de un prompt en lenguaje natural. Su relevancia no reside en competir con modelos de gran escala, sino en servir como referencia didáctica y como base experimental para estudiar arquitecturas modernas (GQA, SwiGLU, RoPE, RMSNorm) en un presupuesto de cómputo mínimo: fue entrenado en dos GPUs Tesla T4.

La arquitectura es un transformer decoder-only de 8 capas con `d_model=320`, `mlp_dim=768` y atención con query grouping (10 cabezas de query y 2 de clave/valor, `head_dim=32`). Incorpora proyecciones QKV fusionadas y Gate/Up fusionadas, normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE). El tokenizador es un BPE propio de 6.144 tokens y la longitud de bloque (contexto) es de 384 tokens.

El modelo se distribuye con licencia MIT y pesos en formato PyTorch (checkpoint `.pt`/`.bin`), con embeddings atados entre la cabeza de salida y el embedding de tokens. Está pensado para generación de texto creativo en inglés y no declara soporte multilingüe ni capacidades de tool calling, agentes o razonamiento multi-paso.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GQA, SwiGLU, RMSNorm, RoPE) |
| Parámetros totales | 9.835.840 (9,84 M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 384 tokens (`block_size=384`) |
| Tipos de cuantización | no disponible (pesos publicados en FP16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | inglés (no se declaran otros idiomas) |
| Licencia | MIT |
| Formato de pesos | PyTorch (checkpoint nativo, `library_name: pytorch`); no se publican safetensors ni GGUF |
| Capas | 8 |
| Dimensión del modelo (`d_model`) | 320 |
| Dimensión MLP (`mlp_dim`) | 768 |
| Cabezas de atención | 10 query / 2 clave-valor (`head_dim=32`) |
| Tokenizador | BPE propio de 6.144 tokens (`story_bpe_6144.json`) |
| Formato de prompt | `Prompt: <prompt en inglés>\nStory:\n` |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 8 capas entrenado desde cero. Emplea atención con query grouping (GQA) con 10 cabezas de query y 2 de clave/valor, lo que reduce el coste de memoria del KV cache frente a atención multi-cabeza completa. Las proyecciones QKV están fusionadas en un único tensor, al igual que las proyecciones Gate y Up del bloque MLP, una optimización típica para reducir overhead en GPUs pequeñas. La normalización es RMSNorm, la activación es SwiGLU y la codificación posicional usa RoPE. Los embeddings están atados: el peso de la cabeza de salida (`head.weight`) no se almacena en disco y se re-ata a `tok.weight` al cargar, lo que reduce el tamaño del checkpoint.

El entrenamiento se realizó en dos GPUs Tesla T4 sobre un corpus de historias (el nombre del modelo, "Story20MB", sugiere un dataset del orden de 20 MB, aunque el autor no detalla el número exacto de tokens ni la composición del dataset en la información disponible). No se documenta el uso de RLHF, DPO ni fine-tuning por preferencias; el modelo parece ser un preentrenamiento supervisado de next-token prediction sobre el corpus de historias. El tokenizador es un BPE propio de 6.144 tokens entrenado con una estrategia "Raw-First". No se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto narrativo en inglés a partir de un prompt en lenguaje natural.
- Continuación de historias con personajes y escenarios especificados en el prompt.
- Copia de nombres de personajes no vistos durante el entrenamiento: 75,0% de acierto (6/8) en la auditoría zero-shot del autor.
- Adherencia a escenario y trama no vistos: 66,7% (6/9) en la misma auditoría.
- Generación condicionada por formato de prompt específico (`Prompt: ...\nStory:\n`).
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de soporte documentado de agentes ni razonamiento multi-paso.
- No dispone de capacidades multimodales (visión, audio) ni de modo "thinking".
- Capacidad multilingüe: no documentada; el entrenamiento y los ejemplos son en inglés.

## Casos de uso

- Generación de micro-relatos para demos y prototipos: el modelo produce continuaciones de historias a partir de un prompt en inglés con un coste de cómputo mínimo, adecuado para maquetas de interfaces creativas o pruebas de concepto.
- Educación en arquitecturas transformer: al ser un modelo de 9,84 M de parámetros con GQA, SwiGLU, RoPE y RMSNorm, sirve para estudiar en detalle la implementación de estas técnicas sin necesidad de infraestructura de gran escala.
- Experimentación con tokenizadores BPE: el tokenizador propio de 6.144 tokens y la estrategia "Raw-First" permiten analizar el impacto del vocabulario en modelos pequeños.
- Generación de texto en entornos con recursos muy limitados: al ocupar unos 18,78 MiB en FP16, puede ejecutarse en CPU o en GPUs de gama baja para tareas de generación creativa offline.
- Benchmarking de pipelines de inferencia: útil para medir latencia y throughput de frameworks de despliegue en modelos de juguete antes de escalar a modelos mayores.
- Investigación sobre copia de entidades y fidelidad al prompt: las métricas de auditoría zero-shot (copia de nombres y adherencia a trama) permiten estudiar el comportamiento de modelos pequeños en tareas de seguimiento de instrucciones narrativas.
- Generación de datos sintéticos de historias a pequeña escala para aumentar corpus de entrenamiento de otros modelos.

## Benchmarks y rendimiento

El autor publica únicamente una auditoría zero-shot sobre prompts no vistos, no benchmarks estándar (MMLU, HumanEval, GSM8K, etc.):

| Métrica | Resultado |
|---|---|
| Copia de nombres de personajes no vistos | 75,0% (6/8) |
| Adherencia a escenario/trama no vistos | 66,7% (6/9) |

No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 100 MB en FP16 (pesos de ~18,78 MiB más KV cache y activaciones para contexto de 384 tokens).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; el autor lo entrenó en 2x Tesla T4.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3060, RTX 4060, GTX 1650, etc.) e incluso en CPU.
- Opciones de despliegue: PyTorch nativo (script `generate.py` del repositorio); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y al no publicarse GGUF no es directamente compatible con llama.cpp/Ollama sin conversión.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo se espera latencia de milisegundos en GPU y decenas de milisegundos en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (generadores de historias de ~10 M de parámetros entrenados desde cero) en la documentación proporcionada.

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Story20MB (devilloots) | 9,84 M | 384 tokens | MIT | PyTorch |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Escala muy reducida: con 9,84 M de parámetros, la coherencia a largo plazo, el conocimiento factual y la calidad gramatical estarán muy por debajo de modelos de miles de millones de parámetros.
- Contexto limitado a 384 tokens: no admite conversaciones largas ni documentos extensos.
- Solo inglés: no se declara ni se ha verificado soporte para otros idiomas, incluido el castellano.
- Riesgo de alucinación y de deriva narrativa: al ser un modelo pequeño, puede inventar detalles inconsistentes o perder el hilo del prompt.
- Formato de prompt rígido: requiere el prefijo `Prompt: ...\nStory:\n`; fuera de ese formato el rendimiento puede degradarse.
- Sin datos de sesgos: el autor no publica análisis de sesgos ni de composición del dataset de entrenamiento, por lo que se desconoce el sesgo potencial del corpus.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene verificar la procedencia del corpus de entrenamiento antes de un uso comercial.
- Sin cuantizaciones publicadas: no hay GGUF ni otros formatos optimizados, lo que limita su uso directo en herramientas como Ollama o llama.cpp.
- Sin benchmarks estándar: las únicas métricas son las de la auditoría zero-shot del autor, con muestras muy pequeñas (8 y 9 casos), por lo que su valor estadístico es limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/devilloots/story-llm-20mb
