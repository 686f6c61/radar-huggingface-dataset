# credible-ai/qwen3.5-1B-40domains-baseline

## Resumen

qwen3.5-1B-40domains-baseline es un modelo de lenguaje de 1.330.059.520 parámetros entrenado desde cero por credible-ai como artefacto de investigación para reproducir los experimentos del artículo LinMix ("Data Mixing as Linear Domain Attribution", arXiv:2610.37390). No es un modelo de propósito general: es una línea base de mezcla de datos que sirve para estudiar cómo ponderar dominios de entrenamiento, y por eso se distribuye junto a su fichero `mix.json` con las proporciones exactas usadas.

La arquitectura sigue el esquema Qwen3.5 (`Qwen3_5ForCausalLM`, transformers >= 5.2): 16 capas, tamaño oculto 2048, pesos en bfloat16 y tokenizador GPT-NeoX-20B con vocabulario de 50.432 entradas. Se entrenó con 32.000 millones de tokens procedentes de WebOrganizer/Corpus-200B, Stack-Edu (los 15 subconjuntos de lenguajes) y Nemotron-CC-Math-v1, mezclados en sus proporciones naturales sobre 40 dominios (24 temas de WebOrganizer, 15 lenguajes de programación y matemáticas), sin optimización de mezcla.

Su relevancia es metodológica más que práctica: proporciona un punto de partida reproducible y con licencia MIT para investigar data mixing, atribución de dominios y escalado de mezclas en modelos de ~1B parámetros. Está pensado para investigadores que quieran replicar o extender LinMix, no para despliegues de producto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Qwen3.5 (`Qwen3_5ForCausalLM`), entrenado desde cero |
| Parámetros totales | 1.330.059.520 (~1,33B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en bfloat16; al ser safetensors estándar admite conversión a GGUF/AWQ mediante herramientas externas, no documentada por el autor) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (bfloat16) |

Otros datos técnicos: 16 capas, tamaño oculto 2048, tokenizador GPT-NeoX-20B con vocabulario de 50.432 tokens, tamaño del repositorio 2,7 GB, 210 descargas y 0 likes en el momento de la consulta.

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con la implementación `Qwen3_5ForCausalLM` de transformers (versión 5.2 o superior), pero con pesos inicializados aleatoriamente y entrenados desde cero, no derivados de ningún checkpoint oficial de Qwen. Consta de 16 capas con dimensión oculta 2048, lo que da los ~1,33B parámetros publicados. El tokenizador es el de GPT-NeoX-20B (50.432 tokens), una elección distinta a la del ecosistema Qwen y que conviene tener en cuenta al reutilizar pipelines.

El entrenamiento se realizó con OLMo-core sobre 32.000 millones de tokens. La composición del corpus combina tres fuentes: WebOrganizer/Corpus-200B (derivado del pool DCLM 1b-1x, CC-BY-4.0 y sujeto a los términos de Common Crawl), Stack-Edu en sus 15 subconjuntos de lenguajes (bajo los términos de The Stack v2) y Nemotron-CC-Math-v1, subconjunto 4plus (bajo el acuerdo de datos de NVIDIA). La mezcla cubre 40 dominios —24 temas de WebOrganizer, 15 lenguajes de programación y matemáticas— en proporciones naturales, sin optimización. No se documenta en la información disponible el uso de RLHF, DPO, SFT posterior ni ninguna innovación de inferencia como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto autorregresiva en inglés, con la calidad esperable de un modelo de 1,33B entrenado con 32B tokens (muy por debajo de los regímenes Chinchilla habituales para este tamaño).
- Exposición a contenido de código en 15 lenguajes de programación gracias a Stack-Edu, aunque sin ajuste fino para tareas de código.
- Exposición a contenido matemático procedente de Nemotron-CC-Math-v1 (subconjunto 4plus).
- Cobertura temática amplia en texto web: 24 temas de WebOrganizer, útil para estudiar distribuciones de dominio más que para tareas concretas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo thinking, visión, audio ni capacidades multimodales.
- Capacidad multilingüe limitada al inglés según la model card.

## Casos de uso

- Reproducción de experimentos de LinMix: el modelo y su `mix.json` permiten replicar la línea base de mezcla natural sobre 40 dominios y comparar contra mezclas optimizadas con el método propuesto en el artículo.
- Investigación en data mixing: sirve como punto de partida controlado para estudiar cómo cambia la pérdida por dominio al alterar las proporciones de WebOrganizer, Stack-Edu y Nemotron-CC-Math.
- Atribución lineal de dominios: al ser un modelo pequeño entrenado desde cero con una mezcla conocida, facilita el análisis de qué dominio contribuye a qué capacidad sin la opacidad de checkpoints comerciales.
- Estudios de escalado de mezclas a ~1B parámetros: permite entrenar variantes con OLMo-core partiendo de la misma receta y comparar curvas de pérdida por dominio.
- Docencia e investigación académica: su licencia MIT y su tamaño (2,7 GB en bfloat16) permiten ejecutarlo y modificarlo en entornos universitarios con recursos modestos.
- Validación de pipelines de tokenización: el uso del tokenizador GPT-NeoX-20B con `Qwen3_5ForCausalLM` lo convierte en un banco de pruebas para verificar integraciones de transformers 5.2 en adelante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,7 GB en bfloat16 (tamaño del repositorio), en torno a 1,4 GB en fp16 y menos de 1 GB en cuantizaciones de 8 o 4 bits, aunque el autor no publica versiones cuantizadas.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para bfloat16; una RTX 3060, RTX 4060 o superior es suficiente. Para entrenamiento o ajuste fino conviene una A100, H100 o RTX 4090.
- Cabe holgadamente en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4090, así como en Apple Silicon con memoria unificada.
- Opciones de despliegue: transformers con `AutoModelForCausalLM` (vía documentada por el autor); vLLM, llama.cpp, Ollama o TGI no están documentados para este checkpoint y requerirían conversión manual de pesos.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| credible-ai/qwen3.5-1B-40domains-baseline | 1,33B | no disponible | MIT | Línea base de mezcla de datos (investigación) | Hugging Face, 210 descargas |
| OLMo-1B (AllenAI) | ~1,2B | 2.048 tokens | Apache 2.0 | Modelo base abierto con receta completa | Hugging Face, ampliamente usado |
| TinyLlama-1.1B | ~1,1B | 2.048 tokens | Apache 2.0 | Modelo base/chat entrenado con 3T tokens | Hugging Face, muy extendido |
| Qwen2.5-1.5B | ~1,5B | 32.768 tokens | Apache 2.0 | Modelo base y chat de propósito general | Hugging Face, ecosistema maduro |

La comparación es orientativa: el modelo de credible-ai no compite en capacidad general con OLMo-1B, TinyLlama o Qwen2.5-1.5B, sino que se posiciona como artefacto reproducible para investigación en mezclas de datos. No se dispone de datos de benchmarks que permitan comparar rendimiento de forma cuantitativa.

## Limitaciones y advertencias

- No es un modelo de propósito general: el propio autor lo describe como artefacto de investigación para reproducir LinMix.
- Entrenado con solo 32B tokens para 1,33B parámetros, muy por debajo de los regímenes habituales; la calidad de generación será limitada en comparación con modelos base de tamaño similar.
- Solo inglés; no hay evidencia de capacidades multilingües.
- Longitud de contexto no documentada; no debe asumirse una ventana larga.
- Riesgo elevado de alucinación y de texto incoherente en tareas abiertas por el régimen de entrenamiento.
- Sesgos heredados de Common Crawl (WebOrganizer/Corpus-200B) y de los subconjuntos de código y matemáticas; no se documentan evaluaciones de sesgo.
- Licencia MIT para los pesos, pero los datos de entrenamiento están sujetos a los términos de Common Crawl, The Stack v2 y el acuerdo de datos de NVIDIA; el uso comercial debe revisar esas condiciones.
- Las secuencias de Stack-Edu y Nemotron-CC-Math no se redistribuyen, lo que limita la reproducción exacta del corpus.
- Requiere transformers >= 5.2 para cargar `Qwen3_5ForCausalLM`; versiones anteriores fallarán.
- El tokenizador es GPT-NeoX-20B, no el de Qwen, lo que puede romper supuestos en pipelines que esperen el tokenizador Qwen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/credible-ai/qwen3.5-1B-40domains-baseline
- Paper LinMix: https://arxiv.org/abs/2610.37390
- Código: https://github.com/credibleai/linmix
- Documentación de `Qwen3_5ForCausalLM`: https://huggingface.co/docs/transformers/model_doc/qwen3_5
- Dataset WebOrganizer/Corpus-200B: https://huggingface.co/datasets/WebOrganizer/Corpus-200B
- Dataset DCLM 1b-1x pool: https://huggingface.co/datasets/mlfoundations/dclm-pool-1b-1x
- Dataset HuggingFaceTB/stack-edu: https://huggingface.co/datasets/HuggingFaceTB/stack-edu
- Dataset nvidia/Nemotron-CC-Math-v1: https://huggingface.co/datasets/nvidia/Nemotron-CC-Math-v1
- Dataset tokenizado credible-ai/weborganizer-corpus-200b-tokenized: https://huggingface.co/datasets/credible-ai/weborganizer-corpus-200b-tokenized
- Tokenizador GPT-NeoX-20B: https://huggingface.co/EleutherAI/gpt-neox-20b
- OLMo-core: https://github.com/allenai/OLMo-core
- Términos de Common Crawl: https://commoncrawl.org/terms-of-use
- Términos de The Stack v2: https://huggingface.co/datasets/bigcode/the-stack-v2
