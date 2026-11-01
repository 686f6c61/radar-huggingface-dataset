# credible-ai/qwen3.5-1B-40domains-vertex-linear-cpile

## Resumen

qwen3.5-1B-40domains-vertex-linear-cpile es un modelo de lenguaje de 1.330.059.520 parámetros (1,33B) entrenado desde cero por credible-ai como artefacto de investigación para reproducir los experimentos del artículo LinMix (arXiv:2610.37390). No es un modelo de propósito general: su función es servir como punto de validación de una metodología de mezcla de datos (data mixing) basada en atribución lineal por dominio. La arquitectura es de tipo Qwen3.5 (`Qwen3_5ForCausalLM`), con 16 capas, tamaño oculto 2048 y tokenizador GPT-NeoX-20B de 50.432 entradas.

El modelo se preentrenó con 32.000 millones de tokens procedentes de tres corpus (WebOrganizer/Corpus-200B, HuggingFaceTB/stack-edu y nvidia/Nemotron-CC-Math-v1), mezclados según pesos optimizados por LinMix sobre 40 dominios: 24 temas de WebOrganizer, 15 lenguajes de programación y matemáticas. La mezcla resultante se optimizó para minimizar bits por byte (BPB) sobre texto de validación de Common Pile.

Su relevancia es metodológica más que de producto: permite a investigadores verificar empíricamente si una mezcla de datos derivada de un proxy pequeño (el swarm de 100M) y de un ajuste lineal de utilidad generaliza al escalar a 1,33B parámetros. La licencia MIT sobre los pesos facilita la reproducción, aunque los datos de Stack-Edu y Nemotron-CC-Math no se redistribuyen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Qwen3.5 (`Qwen3_5ForCausalLM`), 16 capas, hidden size 2048 |
| Parametros totales | 1.330.059.520 (1,33B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT (pesos); datos sujetos a licencias de terceros |
| Formato de pesos | safetensors, bfloat16 |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only alineada con Qwen3.5, implementada mediante `Qwen3_5ForCausalLM` (requiere transformers >= 5.2). Consta de 16 capas con tamaño oculto 2048 y un total de 1,33B parámetros, entrenado desde cero (no es un fine-tune de un checkpoint Qwen existente). El tokenizador es GPT-NeoX-20B con vocabulario de 50.432 tokens.

El preentrenamiento consumió 32.000 millones de tokens con la librería OLMo-core. La mezcla de datos se compone de 40 dominios: 24 temas de WebOrganizer/Corpus-200B (derivado del pool DCLM 1b-1x), los 15 subconjuntos de lenguaje de Stack-Edu y el subconjunto "4plus" de Nemotron-CC-Math-v1. Los pesos de mezcla se obtuvieron con LinMix, un método que ajusta un sustituto lineal sobre un enjambre de modelos proxy (el checkpoint de 100M `credible-ai/qwen3.5-100M-40domains-vertex`) con utilidad lineal (r = 0), optimizando bits por byte sobre texto retenido de Common Pile. El repositorio incluye `mix.json` con la mezcla exacta empleada. No se documentan fases de RLHF, DPO ni instrucción.

## Capacidades

- Generación de texto autoregresiva en inglés mediante `text-generation`.
- Modelado de lenguaje base: no se documenta ajuste por instrucciones ni modo de razonamiento explícito.
- Cobertura de 24 dominios temáticos web (según la taxonomía de WebOrganizer).
- Cobertura de 15 lenguajes de programación vía Stack-Edu.
- Cobertura de contenido matemático vía Nemotron-CC-Math (subconjunto 4plus).
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (visión, audio, thinking mode): no disponible.

## Casos de uso

- Reproducción de experimentos LinMix: cargar el modelo y evaluar BPB sobre Common Pile para verificar que la mezcla óptima derivada del proxy de 100M escala a 1,33B, comparando contra mezclas uniformes o heurísticas.
- Validación de metodologías de data mixing: usar el checkpoint como referencia para contrastar nuevas propuestas de optimización de mezclas de dominios con la misma arquitectura y presupuesto de 32B tokens.
- Investigación en atribución de datos: analizar la contribución de cada uno de los 40 dominios al rendimiento final mediante ablaciones sobre `mix.json`.
- Estudio de escalado proxy-a-target: comparar curvas de pérdida entre el modelo de 100M y este de 1,33B bajo la misma mezcla para calibrar leyes de escalado en mezclas de datos.
- Benchmarking de código y matemáticas en modelos pequeños: evaluar capacidades emergentes en los 15 lenguajes de Stack-Edu y en el subconjunto matemático con 1,33B parámetros.
- Base para fine-tuning académico: al estar liberado en MIT y safetensors, sirve como inicialización para experimentos de instrucción o dominio específico en entornos de investigación con presupuesto limitado.
- Docencia y experimentación en entrenamiento desde cero: su tamaño permite reproducir el pipeline OLMo-core en clústeres modestos y estudiar el efecto de la composición de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta la métrica objetivo de optimización (bits por byte sobre texto retenido de Common Pile) sin valores numéricos.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 2,7 GB solo para pesos (tamaño del repo), más overhead de activaciones y caché KV; en la práctica, entre 4 y 6 GB para inferencia con contexto moderado.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,4 GB de pesos; en 4 bits, alrededor de 0,7 GB (estimaciones teóricas, no verificadas por el autor; no se publican GGUF oficiales).
- GPU recomendadas: cualquier GPU consumer con 8 GB o más (RTX 3060, RTX 4060, RTX 4070, RTX 4090) es suficiente en bfloat16 o cuantizado; A100/H100 no son necesarias para inferencia.
- Cabe en GPU consumer: sí, holgadamente, en todas las RTX de 8 GB o más.
- Opciones de despliegue: transformers (>= 5.2, requisito por `Qwen3_5ForCausalLM`); vLLM, llama.cpp, Ollama y TGI no están confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| credible-ai/qwen3.5-1B-40domains-vertex-linear-cpile | 1,33B | no disponible | MIT | HuggingFace | Artefacto de investigación LinMix |
| credible-ai/qwen3.5-100M-40domains-vertex | ~100M | no disponible | no disponible | HuggingFace | Proxy del enjambre LinMix |
| Qwen3.5 base (1B clase) | ~1B | no disponible | no disponible | no disponible | Modelo de propósito general de referencia arquitectónica |
| no disponible | - | - | - | - | No se dispone de comparativas publicadas con alternativas equivalentes |

## Limitaciones y advertencias

- No es un modelo de propósito general: el autor lo describe explícitamente como artefacto de investigación para reproducir LinMix, no para uso en producción.
- Solo inglés: la model card declara únicamente `en`; el rendimiento en otros idiomas no está caracterizado.
- Sin ajuste por instrucciones ni RLHF: no cabe esperar seguimiento fiable de instrucciones, formato conversacional ni alineación.
- Riesgo elevado de alucinación y de texto incoherente en tareas abiertas, dado el tamaño (1,33B) y el presupuesto de entrenamiento (32B tokens).
- Sesgos de los datos web: el corpus WebOrganizer deriva de DCLM/Common Crawl, con los sesgos inherentes a la web filtrada.
- Restricciones de datos: los pesos son MIT, pero los datos de Stack-Edu (The Stack v2 terms) y Nemotron-CC-Math (NVIDIA Data Agreement) no se redistribuyen, lo que limita la reproducibilidad exacta del entrenamiento.
- Requiere transformers >= 5.2 para cargar `Qwen3_5ForCausalLM`; versiones anteriores fallarán.
- No se publican benchmarks, por lo que no hay evidencia cuantitativa de calidad frente a alternativas.
- Longitud de contexto no documentada: no se debe asumir una ventana larga en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/credible-ai/qwen3.5-1B-40domains-vertex-linear-cpile
- Proxy de 100M: https://huggingface.co/credible-ai/qwen3.5-100M-40domains-vertex
- Paper LinMix: https://arxiv.org/abs/2610.37390
- Código: https://github.com/credibleai/linmix
- Documentación Qwen3.5 en transformers: https://huggingface.co/docs/transformers/model_doc/qwen3_5
- Dataset WebOrganizer/Corpus-200B: https://huggingface.co/datasets/WebOrganizer/Corpus-200B
- Dataset DCLM 1b-1x pool: https://huggingface.co/datasets/mlfoundations/dclm-pool-1b-1x
- Dataset Stack-Edu: https://huggingface.co/datasets/HuggingFaceTB/stack-edu
- Dataset Nemotron-CC-Math-v1: https://huggingface.co/datasets/nvidia/Nemotron-CC-Math-v1
- Dataset tokenizado: https://huggingface.co/datasets/credible-ai/weborganizer-corpus-200b-tokenized
- Tokenizador GPT-NeoX-20B: https://huggingface.co/EleutherAI/gpt-neox-20b
- OLMo-core: https://github.com/allenai/OLMo-core
- Términos de Common Crawl: https://commoncrawl.org/terms-of-use
- Términos de The Stack v2: https://huggingface.co/datasets/bigcode/the-stack-v2
