# credible-ai/qwen3.5-4B-40domains-baseline

## Resumen

`qwen3.5-4B-40domains-baseline` es un modelo de lenguaje de 3.699.158.016 parámetros (aproximadamente 3,7B) entrenado desde cero por el equipo de credible-ai. No es un ajuste fino de Qwen3.5, sino una reproducción de la arquitectura Qwen3.5-like implementada en `Qwen3_5ForCausalLM` (transformers >= 5.2) con 32 capas y un tamaño oculto de 2560. Se distribuye como artefacto de investigación para reproducir los experimentos del artículo LinMix: Data Mixing as Linear Domain Attribution (arXiv:2610.37390).

El modelo se ha preentrenado con 80.000 millones de tokens procedentes de tres fuentes: el corpus WebOrganizer (derivado del pool DCLM 1b-1x), Stack-Edu (las 15 subcolecciones de lenguajes de programación) y Nemotron-CC-Math-v1 (subconjunto 4plus). La mezcla se organiza en 40 dominios (24 temas de WebOrganizer, 15 lenguajes de programación y matemáticas) en sus proporciones naturales, sin optimización de mezcla. Esa ausencia de optimización es precisamente el punto de partida ("baseline") que LinMix pretende mejorar.

Su relevancia es metodológica, no de producto: sirve como referencia controlada para estudiar cómo afecta la composición de datos al rendimiento por dominio. El autor advierte explícitamente que no es un modelo de propósito general. La licencia es MIT para los pesos, con condiciones adicionales derivadas de los términos de uso de los datasets de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-like (`Qwen3_5ForCausalLM`), transformer decoder-only, 32 capas, hidden size 2560, entrenado desde cero |
| Parametros totales | 3.699.158.016 (~3,7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT (pesos); datos sujetos a CC-BY-4.0, términos de Common Crawl, The Stack v2 y NVIDIA Data Agreement for Model Training |
| Formato de pesos | safetensors (bfloat16) |

Datos adicionales: tokenizer GPT-NeoX-20B con vocabulario de 50.432 tokens; tamaño del repositorio 7,4 GB; framework de entrenamiento OLMo-core; incluye `mix.json` con la mezcla de datos de entrenamiento.

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con la arquitectura Qwen3.5 (clase `Qwen3_5ForCausalLM`), 32 capas y dimensión oculta de 2560, entrenado desde cero con OLMo-core. No se trata de un modelo Mixture-of-Experts ni de una arquitectura híbrida SSM: es un transformer denso de aproximadamente 3,7B parámetros. El tokenizer es el de GPT-NeoX-20B, con un vocabulario de 50.432 entradas, lo que lo aleja del tokenizer nativo de la familia Qwen.

El preentrenamiento consume 80.000 millones de tokens mezclados en proporciones naturales sobre 40 dominios: 24 temas del corpus WebOrganizer (procedente del pool DCLM 1b-1x), 15 lenguajes de programación de Stack-Edu y matemáticas de Nemotron-CC-Math-v1 (subconjunto 4plus). La innovación no está en el modelo sino en el marco experimental: LinMix modela la mezcla de datos como una atribución lineal por dominio, y este checkpoint actúa como línea base sin optimización de mezcla. No se documentan fases de RLHF, DPO ni ajuste por instrucciones; es un modelo exclusivamente preentrenado.

## Capacidades

- Generación de texto autoregresiva en inglés a partir de texto plano.
- Modelado de lenguaje base: continuación de texto, perplexity y evaluación de distribuciones por dominio.
- Cobertura de 24 temas web (ciencia, salud, negocios, tecnología, etc.) por la composición del corpus WebOrganizer.
- Generación de código en 15 lenguajes de programación (subconjuntos de Stack-Edu), con calidad limitada por el preentrenamiento sin ajuste.
- Razonamiento matemático básico derivado del subconjunto 4plus de Nemotron-CC-Math-v1.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo thinking, visión ni audio.
- Capacidad multilingüe limitada al inglés según la model card.

## Casos de uso

- Reproducción de experimentos de mezcla de datos: sirve como referencia fija contra la que comparar variantes de mezcla generadas por LinMix, manteniendo constante arquitectura, tokenizer y presupuesto de tokens (80B).
- Investigación en atribución de dominios: permite medir la contribución de cada uno de los 40 dominios al rendimiento final mediante ablaciones y comparaciones con checkpoints derivados.
- Evaluación de corpus de preentrenamiento: útil para estudiar el impacto de WebOrganizer, Stack-Edu y Nemotron-CC-Math en tareas downstream específicas por separado.
- Estudio de tokenizers alternativos: al usar GPT-NeoX-20B en lugar del tokenizer Qwen nativo, permite analizar el efecto del tokenizer en modelos con arquitectura Qwen3.5.
- Benchmarking de infraestructura de entrenamiento: con 80B tokens y OLMo-core, sirve para validar pipelines de preentrenamiento a escala media en clústeres pequeños.
- Docencia y formación: ejemplo reproducible de entrenamiento desde cero de un modelo de ~4B con receta de datos pública (parcialmente, ya que Stack-Edu y Nemotron no se redistribuyen tokenizados).
- Línea base para ajuste fino posterior: punto de partida controlado para experimentos de SFT o DPO en dominios concretos, comparando contra el baseline sin mezcla optimizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 7,4 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 9 y 12 GB según longitud de secuencia.
- VRAM estimada en cuantización de 8 bits: alrededor de 4 GB de pesos; en 4 bits, alrededor de 2 GB (no se publican checkpoints cuantizados oficiales).
- GPU recomendadas para bfloat16: A100 40GB, H100, L40S o RTX 4090 (24 GB) con holgura.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 4080, RTX 3090 y, con cuantización, en GPUs de 8 GB como RTX 3070 o RTX 4060.
- Opciones de despliegue: transformers (versión >= 5.2, requisito de `Qwen3_5ForCausalLM`); vLLM, llama.cpp, Ollama y TGI no están documentados oficialmente para esta arquitectura en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| credible-ai/qwen3.5-4B-40domains-baseline | ~3,7B | no disponible | MIT | Baseline de investigación para mezcla de datos | HuggingFace, 193 descargas |
| Qwen3.5 (modelo base de referencia) | no disponible en la información | no disponible | no disponible | Modelo de propósito general | No consultado en esta ficha |
| OLMo 2 (AllenAI), familia de ~4B | no disponible en la información | no disponible | no disponible | Modelo abierto con receta completa | No consultado en esta ficha |

La comparación cuantitativa con alternativas no está disponible: el modelo es un artefacto de investigación sin benchmarks publicados y no se han consultado las fichas de los modelos comparables en esta sesión.

## Limitaciones y advertencias

- No es un modelo de propósito general: el autor lo describe explícitamente como artefacto de investigación para reproducir LinMix.
- Solo preentrenado: no ha pasado por RLHF, DPO ni SFT, por lo que no sigue instrucciones de forma fiable.
- Solo inglés: la model card declara únicamente `en`; el rendimiento en otros idiomas no está caracterizado.
- Longitud de contexto no documentada: no se puede asumir una ventana larga sin verificación empírica.
- Riesgo de alucinación y de generar contenido sesgado o tóxico, inherente a un modelo preentrenado sobre web cruda (DCLM, Common Crawl).
- Tokenizer GPT-NeoX-20B en lugar del tokenizer Qwen nativo: puede degradar la eficiencia y comparabilidad con la familia Qwen3.5 original.
- Licencia MIT en pesos, pero los datos subyacentes arrastran condiciones: CC-BY-4.0 y términos de Common Crawl (WebOrganizer), The Stack v2 (Stack-Edu) y NVIDIA Data Agreement for Model Training (Nemotron-CC-Math). Revisar compatibilidad antes de uso comercial.
- Los datos tokenizados de Stack-Edu y Nemotron-CC-Math no se redistribuyen, lo que limita la reproducibilidad completa del entrenamiento.
- Sin datos de benchmarks, latencia ni throughput: no apto para decisiones de producción sin evaluación propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/credible-ai/qwen3.5-4B-40domains-baseline
- Paper LinMix: https://arxiv.org/abs/2610.37390
- Repositorio de código: https://github.com/credibleai/linmix
- Dataset WebOrganizer/Corpus-200B: https://huggingface.co/datasets/WebOrganizer/Corpus-200B
- Dataset DCLM 1b-1x pool: https://huggingface.co/datasets/mlfoundations/dclm-pool-1b-1x
- Dataset HuggingFaceTB/stack-edu: https://huggingface.co/datasets/HuggingFaceTB/stack-edu
- Dataset nvidia/Nemotron-CC-Math-v1: https://huggingface.co/datasets/nvidia/Nemotron-CC-Math-v1
- Dataset tokenizado credible-ai/weborganizer-corpus-200b-tokenized: https://huggingface.co/datasets/credible-ai/weborganizer-corpus-200b-tokenized
- Documentación de `Qwen3_5ForCausalLM`: https://huggingface.co/docs/transformers/model_doc/qwen3_5
- Tokenizer GPT-NeoX-20B: https://huggingface.co/EleutherAI/gpt-neox-20b
- Framework OLMo-core: https://github.com/allenai/OLMo-core
- Términos de uso de Common Crawl: https://commoncrawl.org/terms-of-use
- Términos de The Stack v2: https://huggingface.co/datasets/bigcode/the-stack-v2
