# DracenW/TinyLlama-1.1B-EPR-Elastic

## Resumen

TinyLlama-1.1B-EPR-Elastic es un checkpoint experimental de 1.077,88 millones de parámetros (frente a los 1.100,05 millones del modelo base) publicado por el usuario DracenW. Se trata de una intervención quirúrgica sobre la arquitectura de TinyLlama-1.1B que sustituye parte del mecanismo de atención estándar por un esquema denominado EPR (Elastic Positional Routing, según la nomenclatura del autor), combinando atención ponderada por distancia, decaimiento aprendido y un *attention sink* de valor cero. El objetivo declarado es doble: reducir el número de parámetros de atención y corregir el colapso de perplejidad que sufre TinyLlama al extrapolar más allá de su ventana de entrenamiento de 2048 tokens.

El modelo parte del checkpoint intermedio `TinyLlama-1.1B-intermediate-step-1431k-3T` y aplica lo que el autor llama *architecture surgery*: elimina aproximadamente el 25 % de los pesos Q/K entrenados sobre 3 billones de tokens, inserta capas EPR inicializadas aleatoriamente y realiza un ajuste de recuperación (*healing*) de solo 300 pasos sobre FineWeb-Edu (9,83 millones de tokens, un 0,00033 % del presupuesto original). No hay destilación ni reentrenamiento completo, lo que convierte al modelo en una prueba de concepto de bajo coste más que en un modelo listo para producción.

La relevancia del checkpoint es fundamentalmente metodológica: demuestra que una modificación arquitectónica barata puede mantener la perplejidad estable en el rango 3072-4096 tokens (14,69 frente a 13.399,39 del control intacto) y reducir el pool de KV cache en un 72,1 % mediante PagedAttention con reciclado de páginas locales. El coste es una caída de aproximadamente 3,75 puntos en la media de cinco tareas zero-shot respecto al TinyLlama original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only derivado de Llama 2, con atención EPR (atención ponderada por distancia L2-RBF, decaimiento local aprendido y *attention sink*), cabezas locales con decaimiento y un grupo de cabezas globales NoPE por capa |
| Parámetros totales | 1.077,88 M (frente a 1.100,05 M del base; −22.166.760) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | Entrenado a 2048; extrapolación evaluada hasta 4096 (perplejidad estable en [3072:4096]) |
| Tipos de cuantización | No disponible (el checkpoint publicado está en bfloat16; el repo ocupa 2,2 GB) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pt` (PyTorch state_dict, bfloat16), no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Llama 2 con 22 capas, `head_dim = 64` y diseño compatible con Tensor Cores. La modificación EPR empaqueta productos escalares direccionales, una puntuación de distancia L2-RBF compartida y un *attention sink* dentro del layout estándar de atención, eliminando 22,17 M de parámetros matriciales en las 22 capas. Cada capa combina cabezas locales con decaimiento (que favorecen el contexto cercano) y un grupo de cabezas globales sin codificación posicional (NoPE) que preservan información de largo alcance. El autor advierte que nombres internos como `use_wormhole` o `attn_vacuum` son apodos de pizarra y que bajo el capó son módulos PyTorch/Triton convencionales.

El entrenamiento consiste en dos fases: primero se parte del checkpoint intermedio de TinyLlama (entrenado sobre 3 billones de tokens), se eliminan los pesos Q/K seleccionados y se inicializan las nuevas capas EPR de forma aleatoria; después se ejecuta un *healing* de 300 pasos sobre FineWeb-Edu (9,83 M de tokens) en una única NVIDIA L4 de 22 GiB durante 47 minutos, sin destilación. El autor incluye un control intacto (`base_1b_cpt`) entrenado con los mismos 300 pasos y sin eliminar pesos, cuyo colapso a 4K (13.399,39) confirma que la estabilidad de extrapolación proviene de la arquitectura EPR y no de los datos de ajuste. Adicionalmente, el repositorio GitHub documenta un experimento *from scratch* (Track A) en el que EPR supera a Llama-1.1B con FlashAttention-2 en un 26,7 % de perplejidad de validación (225,38 frente a 307,32) al 97,2 % de la velocidad de FA2.

## Capacidades

- Generación de texto autoregresiva en inglés, heredada del modelo base TinyLlama.
- Extrapolación de contexto más allá de la ventana de entrenamiento: perplejidad estable hasta 4096 tokens, donde el modelo base colapsa.
- Reciclado de KV cache en tiempo de servicio mediante PagedAttention implementado en Triton (`@triton.jit`), con evicción de páginas locales en O(1).
- Inferencia con `transformers` mediante el módulo `hf_epr.py` del repositorio del autor, que adapta un modelo Llama a la arquitectura EPR.
- Compatibilidad con atención FlexAttention y PagedAttention según las etiquetas del repositorio.
- No se documenta soporte de *tool calling*, *function calling*, agentes multi-paso, visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe limitada al inglés según la model card.

## Casos de uso

- Investigación en mecanismos de atención: el checkpoint sirve como banco de pruebas reproducible para estudiar atención ponderada por distancia, *attention sinks* y decaimiento local sin entrenar desde cero, ya que el *healing* cuesta 47 minutos en una L4.
- Evaluación de extrapolación de contexto: útil para experimentos que comparan perplejidad en rangos [2048:3072] y [3072:4096] frente a TinyLlama intacto y a variantes con RoPE scaling.
- Prototipado de servidores de inferencia con KV cache reducida: el reciclado de páginas locales reduce el pool de KV de 1.357,1 MB a 379,0 MB con B=16 y hasta 8K, lo que permite simular cargas de servicio en GPUs pequeñas.
- Docencia y formación técnica: ejemplo completo de *architecture surgery* con código Triton, scripts de evaluación y control experimental publicado.
- Pruebas de integración de kernels Triton personalizados en pipelines de `transformers`, útil para validar tooling de atención de bajo nivel.
- Experimentos de *continued pre-training* de bajo presupuesto: el protocolo de 300 pasos sobre FineWeb-Edu sirve de plantilla para recuperar modelos tras modificaciones arquitectónicas.
- No se recomienda su uso en atención al cliente, generación de código en producción ni tareas generativas reales, dado el deterioro de benchmarks y la ausencia de alineación.

## Benchmarks y rendimiento

Resultados publicados por el autor (Track B, evaluación *retrofit*; `*` indica `acc_norm`; menor es mejor en perplejidad):

| Variante | Params | ARC-Easy | HellaSwag* | WinoGrande | PIQA* | BoolQ* | Media 5 tareas | Extrap. 4K [2K:3K] / [3K:4K] |
|---|---|---|---|---|---|---|---|---|
| TinyLlama-1.1B (3T intacto) | 1.100,05 M | 62,25 % | 53,50 % | 55,25 % | 73,00 % | 65,00 % | 61,80 % | 1.444,35 / 12.829,90 |
| `base_1b_cpt` (control 300 pasos) | 1.100,05 M | 60,75 % | 52,75 % | 59,50 % | 74,00 % | 65,25 % | 62,45 % | 1.760,35 / 13.399,39 |
| **EPR-Elastic (este repo)** | **1.077,88 M** | **57,75 %** | **47,00 %** | **53,50 %** | **70,75 %** | **61,25 %** | **58,05 %** | **12,26 / 14,69** |
| EPR-Elastic + evicción W=256 | 1.077,88 M | — | — | — | — | — | — | 12,36 / 14,71 |

La media de cinco tareas cae al 93,9 % del TinyLlama de 3T, mientras que la perplejidad de extrapolación a 4K mejora en un factor de aproximadamente 912. En el experimento *from scratch* (Track A), EPR alcanza 225,38 de perplejidad de validación frente a 307,32 de Llama-1.1B con FA2 (−26,7 %) al 97,2 % de velocidad.

## Requisitos de hardware

- VRAM para inferencia en bfloat16: aproximadamente 2,2 GB de pesos más overhead de activaciones; cabe holgadamente en GPUs consumer de 8 GB o más.
- El *healing* documentado se ejecutó en una única NVIDIA L4 de 22 GiB en 47 minutos.
- GPU recomendadas: L4, A10, RTX 3090, RTX 4090 para inferencia; A100/H100 no aportan ventaja significativa dado el tamaño del modelo.
- Cabe en GPUs consumer: sí, desde una RTX 3060 de 12 GB o incluso GPUs de 8 GB en bfloat16.
- Despliegue: requiere el código del repositorio `epr-attention` (`epr_attention.py`, `epr_paged_attention.py`, `hf_epr.py`) junto con `transformers`; no hay soporte nativo en vLLM, llama.cpp, Ollama ni TGI, y no se publican pesos GGUF.
- Latencia y throughput: no se publican cifras absolutas; el autor reporta que el entrenamiento *from scratch* con EPR alcanza el 97,2 % de la velocidad de FlashAttention-2, lo que sugiere un overhead de atención bajo pero no nulo.

## Comparativa con modelos similares

| Modelo | Params | Contexto | Media 5 tareas | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| TinyLlama-1.1B-EPR-Elastic | 1.077,88 M | 2048 (extrapola a 4096) | 58,05 % | Apache 2.0 | `.pt` bfloat16, requiere código propio |
| TinyLlama-1.1B (base) | 1.100,05 M | 2048 | 61,80 % | Apache 2.0 | safetensors, transformers/vLLM/llama.cpp |
| `base_1b_cpt` (control del autor) | 1.100,05 M | 2048 (colapsa a 4K) | 62,45 % | Apache 2.0 | `.pt`, código del autor |
| Llama-1.1B con FlashAttention-2 (Track A) | ~1.100 M | 2048 | No disponible | Apache 2.0 | safetensors |

La comparativa se limita a las variantes evaluadas por el propio autor; no se dispone de datos frente a otros modelos de 1B como Qwen2.5-1.5B o SmolLM2-1.7B en la información proporcionada.

## Limitaciones y advertencias

- Deterioro medible de calidad: la media de cinco tareas zero-shot cae 3,75 puntos respecto a TinyLlama-1.1B y 4,40 puntos respecto al control `base_1b_cpt`.
- Modelo sin alineación: no hay RLHF, DPO ni ajuste de instrucciones; no es adecuado como asistente conversacional.
- Solo inglés; no se documenta soporte multilingüe.
- Riesgo elevado de alucinación y texto incoherente en generación libre, dado el escaso *healing* (0,00033 % de los tokens originales) y la inicialización aleatoria de las capas EPR.
- La extrapolación se valida únicamente por perplejidad hasta 4096 tokens; no hay evaluación de calidad generativa en contextos largos.
- Requiere código externo no empaquetado en `transformers`; el checkpoint es un `.pt` con `state_dict`, no safetensors, lo que complica auditoría y despliegue estándar.
- Sin cuantizaciones publicadas (GGUF, AWQ, GPTQ) ni soporte en runtimes de producción habituales.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base TinyLlama incorpora la cláusula de atribución a Meta Llama 2 que debe respetarse.
- Cero descargas y cero *likes* en el momento de la consulta: no hay validación independiente de los resultados por parte de la comunidad.
- Nombres internos del código (`use_wormhole`, `attn_vacuum`) son alias informales; el autor advierte explícitamente de que no deben interpretarse literalmente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DracenW/TinyLlama-1.1B-EPR-Elastic
- Repositorio de código: https://github.com/Dracen-W/epr-attention
- Release v3.0 con benchmarks completos: https://github.com/Dracen-W/epr-attention/releases/tag/3.0
- Módulo de atención: https://github.com/Dracen-W/epr-attention/blob/main/epr_attention.py
- PagedAttention en Triton: https://github.com/Dracen-W/epr-attention/blob/main/epr_paged_attention.py
- Adaptador para transformers: https://github.com/Dracen-W/epr-attention/blob/main/hf_epr.py
- Checkpoint base: https://huggingface.co/TinyLlama/TinyLlama-1.1B-intermediate-step-1431k-3T
- Dataset de *healing*: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
