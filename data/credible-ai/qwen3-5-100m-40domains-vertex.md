# credible-ai/qwen3.5-100M-40domains-vertex

## Resumen

`credible-ai/qwen3.5-100M-40domains-vertex` no es un modelo individual, sino un conjunto de 512 modelos proxy de lenguaje de 104M de parámetros cada uno, entrenados desde cero por credible-ai. Cada checkpoint corresponde a una mezcla de datos distinta del diseño «vertex» del paper LinMix, definido sobre 40 dominios: los 24 temas de WebOrganizer, los 15 lenguajes de programación de Stack-Edu y el subconjunto 4plus de Nemotron-CC-Math. Los pesos se distribuyen en carpetas `mix_0` a `mix_511`, en bfloat16, con un total de 107 GB.

El problema que resuelve es el coste de explorar mezclas de datos a escala. En lugar de entrenar modelos grandes para cada proporción de dominios candidata, el proyecto entrena enjambres de modelos pequeños que actúan como proxies: la curva de pérdida de cada proxy permite ajustar una ley de escalado y estimar qué mezcla rendirá mejor en un modelo mayor. Es material relevante para equipos que preparan preentrenamientos propios y necesitan decidir proporciones de dominio antes de comprometer grandes presupuestos de cómputo.

Técnicamente son transformers decoder-only densos con una arquitectura «Qwen3.5-like» (`Qwen3_5ForCausalLM`, requiere transformers >= 5.2): 12 capas, dimensión oculta 576 y tokenizador GPT-NeoX-20B con vocabulario de 50.432 entradas. Cada modelo se entrenó con 3,2B tokens usando OLMo-core, y cada carpeta incluye un `mix.json` con la mezcla exacta empleada, lo que hace el experimento reproducible a nivel de receta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, estilo Qwen3.5 (`Qwen3_5ForCausalLM`) |
| Parámetros totales | 104M por modelo; 512 modelos en el repositorio (107 GB en bfloat16) |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; solo se publican pesos en bfloat16 |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT (pesos) |
| Formato de pesos | safetensors, layout de transformers (una subcarpeta `mix_<i>` por modelo) |
| Capas | 12 |
| Dimensión oculta | 576 |
| Tokenizador | GPT-NeoX-20B, vocabulario de 50.432 tokens |
| Tokens de entrenamiento | 3,2B por modelo |
| Framework de entrenamiento | OLMo-core |
| Versión mínima de transformers | 5.2 |
| Composición de dominios | 24 temas WebOrganizer + 15 lenguajes Stack-Edu + Nemotron-CC-Math |
| Metadatos por checkpoint | `mix_<i>/mix.json` con la mezcla de datos |

## Arquitectura y entrenamiento

Cada uno de los 512 modelos es un transformer decoder-only denso de 12 capas y 576 dimensiones ocultas, con 104M de parámetros, entrenado desde cero (sin inicialización desde Qwen ni destilación). La implementación sigue la clase `Qwen3_5ForCausalLM` de transformers, por lo que la topología es la de la familia Qwen3.5 pero a escala reducida. El tokenizador es el de GPT-NeoX-20B, con 50.432 tokens, compartido y situado en la raíz del repositorio: es importante cargarlo desde el repositorio y no desde un checkpoint de Qwen, ya que el vocabulario no coincide.

El entrenamiento se realizó con OLMo-core, 3,2B tokens por modelo, sobre secuencias procedentes de tres corpus: WebOrganizer/Corpus-200B (derivado del pool DCLM 1b-1x, CC-BY-4.0), HuggingFaceTB/stack-edu (los 15 subconjuntos de lenguaje, bajo los términos de The Stack v2) y nvidia/Nemotron-CC-Math-v1 (subconjunto 4plus, bajo el NVIDIA Data Agreement for Model Training). La innovación no está en la arquitectura sino en el diseño experimental: un enjambre de proxies que cubre un símplex de mezclas de 40 dominios, lo que permite estudiar la relación entre proporción de dominio y pérdida sin entrenar modelos de escala real. No se documentan etapas de RLHF, DPO ni ajuste por instrucciones; son modelos estrictamente preentrenados.

## Capacidades

- Generación de texto autoregresiva básica en inglés, limitada por el tamaño (104M) y por los 3,2B tokens vistos.
- Modelado de lenguaje y estimación de pérdida/perplejidad sobre texto de los dominios cubiertos: es su señal principal de utilidad.
- Cobertura de 24 categorías de contenido web (los temas de WebOrganizer) y 15 lenguajes de programación de Stack-Edu.
- Exposición a contenido matemático vía el subconjunto 4plus de Nemotron-CC-Math.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Sin capacidades multimodales: sin visión, audio ni vídeo.
- Multilingüismo: no disponible; la model card declara únicamente inglés.
- Sin modo «thinking» ni ajuste por instrucciones: no es un modelo conversacional.

## Casos de uso

- Investigación en mezcla de datos (data mixing): entrenar o reutilizar los 512 proxies para ajustar la relación entre proporción de dominio y pérdida, y extrapolar qué mezcla conviene a un modelo de mayor escala antes de lanzar el run definitivo.
- Diseño de recetas de preentrenamiento: comparar `mix_<i>/mix.json` con la pérdida obtenida en dominios concretos para decidir cuánto peso dar a código, matemáticas o web general.
- Estudios de leyes de escalado: usar la curva de 104M parámetros y 3,2B tokens como punto de anclaje y combinar con runs mayores para estimar el comportamiento en el régimen objetivo.
- Selección de proporción de lenguajes de programación: evaluar los proxies sobre los 15 lenguajes de Stack-Edu para decidir el reparto de tokens de código en un corpus propio.
- Validación de pipelines de tokenización y preprocesado: el corpus web tokenizado está publicado, lo que permite reproducir exactamente la secuencia de entrada de cada proxy y aislar errores del pipeline.
- Pruebas de infraestructura y de código de entrenamiento: al ser runs cortos y pequeños, sirven para validar configuraciones de OLMo-core, checkpoints y logging antes de un preentrenamiento a gran escala.
- Docencia y experimentación con recursos limitados: un modelo de 104M se entrena e infiere en una sola GPU de consumo, lo que permite reproducir el experimento completo en un entorno académico.
- Análisis de dominio de un corpus: usar la perplejidad de varios proxies (entrenados con mezclas distintas) como señal para caracterizar de qué está compuesto un texto dado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que el diseño experimental, los resultados y las secuencias de entrenamiento están en el dataset `credible-ai/linmix-proxy-swarms`, pero no se incluyen cifras de MMLU, HumanEval, GSM8K ni de perplejidad en el material proporcionado. No se deben asumir valores de referencia para estos modelos.

## Requisitos de hardware

- VRAM para inferencia: aproximadamente 0,2 GB solo para pesos en bfloat16 (104M parámetros × 2 bytes) por modelo individual; con activaciones, KV cache y overhead de framework, el consumo realista se sitúa por debajo de 1 GB. Cifra exacta no disponible.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM. Cabe en RTX 3060, RTX 4060, RTX 4090, A10, L4, T4 y A100/H100 sin aprovechar su capacidad; también es viable en CPU para inferencia puntual.
- Cabe en GPU de consumo: sí, holgadamente, en cualquier modelo con 4 GB o más.
- Carga del enjambre completo: 107 GB de disco y, si se cargan los 512 modelos simultáneamente en bfloat16, del orden de 107 GB de VRAM/RAM, lo que exige un nodo multi-GPU (por ejemplo 8×A100 80 GB) o, más práctico, carga secuencial reutilizando memoria.
- Opciones de despliegue: transformers (vía `snapshot_download` + `AutoModelForCausalLM`, seleccionando `subfolder="mix_<i>"`) y OLMo-core para entrenamiento o evaluación. vLLM o TGI son técnicamente posibles pero sobredimensionados para esta escala. llama.cpp u Ollama requerirían una conversión a GGUF que no se publica en el repositorio.
- Latencia y throughput: no disponibles; no se han publicado medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| qwen3.5-100M-40domains-vertex | 104M | no disponible | MIT | 512 proxies de mezcla de datos para investigación |
| Pythia-160M (EleutherAI) | 160M | 2.048 tokens | Apache 2.0 | Modelo de investigación con checkpoints intermedios |
| SmolLM-135M (HuggingFace) | 135M | 2.048 tokens | Apache 2.0 | Modelo pequeño generalista preentrenado |
| Qwen2.5-0.5B (Alibaba) | 494M | 32.768 tokens | Apache 2.0 | Modelo generalista con variantes instruct |

La comparación relevante no es de rendimiento sino de propósito: Pythia y SmolLM son modelos individuales pensados para uso general o para investigación de dinámica de entrenamiento, mientras que este repositorio es un conjunto experimental de 512 checkpoints cuyo valor está en la variación controlada de la mezcla de datos. Los datos de los modelos alternativos provienen de referencias públicas generales y no han sido verificados en la búsqueda proporcionada; conviene contrastarlos antes de citarlos.

## Limitaciones y advertencias

- No son modelos de producción: sin ajuste por instrucciones, sin RLHF/DPO y sin alineación; no deben usarse como asistentes conversacionales.
- Calidad de generación baja esperable: 104M de parámetros y 3,2B tokens de entrenamiento sitúan la fluidez muy por debajo de modelos de varios miles de millones de parámetros.
- Solo inglés declarado; el comportamiento en otros idiomas no está documentado.
- Longitud de contexto no documentada: no se debe asumir ninguna ventana concreta sin verificarla empíricamente.
- Riesgo de alucinación y de reproducción de sesgos de Common Crawl, del código de Stack-Edu y de los datos matemáticos; no se documenta ninguna mitigación.
- Tokenizador GPT-NeoX-20B: cargarlo desde el repositorio, no desde un checkpoint Qwen; usar el tokenizador equivocado invalida los resultados.
- Requiere transformers >= 5.2 para la clase `Qwen3_5ForCausalLM`.
- Licencia MIT en los pesos, pero los datos de entrenamiento arrastran condiciones propias: términos de uso de Common Crawl (vía DCLM 1b-1x, CC-BY-4.0), términos de The Stack v2 y el NVIDIA Data Agreement for Model Training. Conviene revisarlos antes de un uso comercial derivado o de redistribuir modelos entrenados sobre estos corpus.
- El repositorio pesa 107 GB; descargarlo completo para usar un solo proxy es ineficiente, de ahí el patrón `allow_patterns` de la model card.
- Las secuencias tokenizadas de Stack-Edu y Nemotron-CC-Math no se redistribuyen, por lo que la reproducibilidad exacta de esas porciones está limitada.
- Creado y actualizado en octubre de 2026, con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria todavía.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/credible-ai/qwen3.5-100M-40domains-vertex
- Dataset con diseño, resultados y secuencias de entrenamiento: https://huggingface.co/datasets/credible-ai/linmix-proxy-swarms
- Corpus web tokenizado: https://huggingface.co/datasets/credible-ai/weborganizer-corpus-200b-tokenized
- Código del proyecto LinMix: https://github.com/credibleai/linmix
- Dataset WebOrganizer/Corpus-200B: https://huggingface.co/datasets/WebOrganizer/Corpus-200B
- Pool DCLM 1b-1x: https://huggingface.co/datasets/mlfoundations/dclm-pool-1b-1x
- Dataset HuggingFaceTB/stack-edu: https://huggingface.co/datasets/HuggingFaceTB/stack-edu
- Dataset nvidia/Nemotron-CC-Math-v1: https://huggingface.co/datasets/nvidia/Nemotron-CC-Math-v1
- Documentación de `Qwen3_5ForCausalLM`: https://huggingface.co/docs/transformers/model_doc/qwen3_5
- Tokenizador GPT-NeoX-20B: https://huggingface.co/EleutherAI/gpt-neox-20b
- Framework OLMo-core: https://github.com/allenai/OLMo-core
- Términos de uso de Common Crawl: https://commoncrawl.org/terms-of-use
- Términos de The Stack v2: https://huggingface.co/datasets/bigcode/the-stack-v2
