# credible-ai/olmo2-30M-24domains-dirichlet

## Resumen

`olmo2-30M-24domains-dirichlet` no es un modelo de propósito general, sino un lote de 512 modelos proxy de lenguaje de 29,2 millones de parámetros cada uno, publicados por credible-ai como material reproducible del artículo LinMix. Cada uno de los 512 modelos ha sido entrenado con una mezcla de datos distinta, generada mediante un diseño Dirichlet sobre los 24 temas del corpus WebOrganizer. El objetivo es servir de banco de experimentos controlado para estudiar cómo afecta la composición de una mezcla de datos al rendimiento de un modelo de lenguaje, sin tener que entrenar modelos grandes para cada hipótesis.

La arquitectura es la de OLMo 2 (`Olmo2ForCausalLM`), en su variante minúscula: 4 capas, dimensión oculta de 256 y tokenizador GPT-NeoX-20B con un vocabulario de 50.432 entradas. Cada proxy ha visto 1.000 millones de tokens entrenados con OLMo-core, y junto a los pesos se publica el fichero `mix.json` con la mezcla exacta que se usó, lo que permite regresar el rendimiento aguas abajo contra las proporciones de cada dominio.

Su relevancia es metodológica: los modelos proxy pequeños se usan para predecir el comportamiento de mezclas de datos en modelos de mayor escala a una fracción del coste. Este repositorio entrega 512 puntos de muestreo del espacio de mezclas ya entrenados, con pesos en bfloat16 y licencia MIT, de modo que un grupo de investigación puede reutilizarlos sin repetir el preentrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, OLMo 2 (`Olmo2ForCausalLM`), 4 capas, hidden size 256 |
| Parametros totales | 29,2 M por modelo (512 modelos en el repositorio) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors, organizados en subcarpetas `mix_0` a `mix_511` |
| Tokenizador | GPT-NeoX-20B, vocabulario de 50.432 tokens, en la raiz del repositorio |
| Tamano del repositorio | 29,9 GB (30 GB segun la model card) |
| Datos de entrenamiento | 1.000 millones de tokens, con OLMo-core |
| Metadatos de mezcla | `mix_<i>/mix.json` con la mezcla del proxy `i` |

## Arquitectura y entrenamiento

Cada proxy es un transformer decoder-only de la familia OLMo 2, configurado con 4 capas y una dimensión oculta de 256, lo que arroja 29,2 millones de parámetros. Se usa el tokenizador de GPT-NeoX-20B (50.432 tokens) compartido en la raíz del repositorio, de forma que los 512 modelos comparten espacio de tokens y las comparaciones entre ellos son directas. El entrenamiento se hizo con OLMo-core sobre 1.000 millones de tokens por modelo.

El eje del experimento es la mezcla de datos. El corpus de partida es WebOrganizer/Corpus-200B, derivado del pool DCLM 1b-1x, clasificado en 24 temas. LinMix genera 512 mezclas mediante un diseño Dirichlet sobre esos 24 dominios y entrena un proxy por mezcla; el repositorio publica tanto los pesos como el `mix.json` correspondiente, y las secuencias tokenizadas exactas están en el dataset `credible-ai/weborganizer-corpus-200b-tokenized`. No se mencionan fases de RLHF, DPO ni ajuste instructivo: son modelos base preentrenados, pensados para medir pérdida y rendimiento aguas abajo, no para conversar.

## Capacidades

- Generación de texto en inglés como modelo base preentrenado (sin ajuste instructivo ni de chat).
- Modelado de lenguaje y cálculo de perplejidad, que es su uso principal como proxy de mezclas.
- Evaluación comparativa del efecto de distintas proporciones de dominio sobre el rendimiento.
- Entrenamiento e inferencia de bajo coste: 29,2 M de parámetros permiten iterar en CPU o en una sola GPU consumer.
- 512 puntos de muestreo del espacio de mezclas con metadatos de mezcla asociados (`mix.json`).
- Capacidad de servir como banco de pruebas para pipelines de tokenización, currículos y recetas de entrenamiento.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento explícito.
- Multilingüismo: no disponible; la model card solo declara inglés.

## Casos de uso

- Investigación en mezclas de datos: reutilizar los 512 proxies ya entrenados para ajustar un modelo que prediga el rendimiento de una mezcla a partir de sus proporciones de dominio, sin repetir 512 preentrenamientos.
- Estudio de leyes de escala: comparar la señal de los proxies de 29,2 M con modelos de referencia de mayor tamaño para calibrar regresiones de escalado con un coste de cómputo mínimo.
- Ablaciones controladas de dominio: mantener fijo el tokenizador (GPT-NeoX-20B), el número de tokens (1.000 M) y la arquitectura, y aislar el efecto de la composición del corpus WebOrganizer.
- Validación de infraestructura de entrenamiento: usar los proxies para verificar pipelines de OLMo-core, tokenización y checkpoints antes de lanzar runs grandes.
- Docencia y divulgación: ejecutar un modelo de lenguaje completo de 4 capas en un portátil para explicar atención, tokenización y preentrenamiento con pesos reales.
- Pruebas de arneses de evaluación: validar harnesses de evaluación aguas abajo, scripts de carga y formateo de resultados con modelos cuyo ciclo de inferencia es de milisegundos.
- Análisis de sensibilidad por tema: estudiar qué temas del corpus (de los 24 de WebOrganizer) correlacionan con mejoras en tareas concretas, usando el vector de mezcla como variable explicativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de tareas aguas abajo; el repositorio remite al dataset `credible-ai/linmix-proxy-swarms` para el diseño experimental, los resultados y las secuencias de entrenamiento.

## Requisitos de hardware

- VRAM estimada por modelo: en bfloat16, unos 58 MB de pesos (29,2 M de parámetros); en float32, unos 117 MB. La inferencia con `transformers` añade overhead de activaciones y caché KV, pero sigue siendo marginal.
- Repositorio completo: 29,9 GB en disco si se descargan los 512 modelos; conviene usar `snapshot_download` con `allow_patterns` para bajar solo la mezcla de interés.
- GPU: cualquier GPU con más de 1-2 GB de VRAM sirve; no requiere A100 ni H100. Cabe en RTX 4090, RTX 3060, GPUs de portátil e incluso en CPU.
- Despliegue: `transformers` con `AutoModelForCausalLM.from_pretrained(path, subfolder="mix_17")` es la vía documentada. vLLM, TGI, llama.cpp u Ollama no están documentados para este modelo; requerirían conversión a GGUF en el caso de llama.cpp/Ollama.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño (4 capas, hidden 256), se espera que la latencia sea muy baja, pero no hay cifras publicadas.
- La longitud de contexto no está documentada, así que el consumo de caché KV no puede estimarse con precisión.

## Comparativa con modelos similares

Los valores de las alternativas provienen de su documentación pública y no de la información proporcionada para este modelo; se incluyen como referencia de categoría.

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| olmo2-30M-24domains-dirichlet | 29,2 M (x512 modelos) | no disponible | Proxies para investigación de mezclas de datos | MIT | HuggingFace |
| Pythia-70M | 70 M | 2.048 tokens | Modelo base pequeño para investigación de interpretabilidad y escalado | Apache 2.0 | HuggingFace |
| SmolLM2-135M | 135 M | 8.192 tokens | Modelo base pequeño para experimentación e inferencia en dispositivo | Apache 2.0 | HuggingFace |
| Suites de proxies de mezclas (por ejemplo, las de trabajos de data mixing) | del orden de decenas de millones | no disponible | Predicción de mezclas óptimas | variable | no disponible |

## Limitaciones y advertencias

- No es un modelo usable como asistente: no ha pasado por ajuste instructivo, RLHF ni DPO, y su tamaño (4 capas, 29,2 M) limita severamente la calidad del texto generado.
- Entrenado únicamente con datos en inglés y sobre el corpus WebOrganizer (derivado de DCLM 1b-1x y sujeto a los términos de uso de Common Crawl); el comportamiento fuera de ese dominio no está caracterizado.
- Riesgo de alucinación y de reproducción de sesgos presentes en el rastreo web de Common Crawl, agravado por la ausencia de etapas de alineación.
- La longitud de contexto no está documentada, lo que impide garantizar un uso fiable más allá de secuencias cortas.
- Los pesos son MIT, pero los datos de entrenamiento tienen sus propias condiciones (CC-BY-4.0 para DCLM y términos de uso de Common Crawl); conviene revisarlas antes de un uso comercial de los derivados.
- El repositorio ocupa 29,9 GB y contiene 512 modelos; descargarlo entero sin filtrado consume disco y ancho de banda innecesarios para la mayoría de experimentos.
- Al ser proxies de 29,2 M, las conclusiones sobre mezclas extraídas de ellos requieren validación a mayor escala; no deben extrapolarse sin comprobación.
- La model card no documenta la configuración exacta de atención, normalización ni el número de tokens por secuencia, lo que dificulta reproducir el entrenamiento al detalle.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/credible-ai/olmo2-30M-24domains-dirichlet
- Dataset con diseño, resultados y secuencias de entrenamiento: https://huggingface.co/datasets/credible-ai/linmix-proxy-swarms
- Dataset de secuencias tokenizadas: https://huggingface.co/datasets/credible-ai/weborganizer-corpus-200b-tokenized
- Corpus de entrenamiento: https://huggingface.co/datasets/WebOrganizer/Corpus-200B
- Pool DCLM 1b-1x: https://huggingface.co/datasets/mlfoundations/dclm-pool-1b-1x
- Codigo de LinMix: https://github.com/credibleai/linmix
- OLMo-core: https://github.com/allenai/OLMo-core
- Tokenizador GPT-NeoX-20B: https://huggingface.co/EleutherAI/gpt-neox-20b
- Documentacion de OLMo 2 en transformers: https://huggingface.co/docs/transformers/model_doc/olmo2
- Terminos de uso de Common Crawl: https://commoncrawl.org/terms-of-use
- Nota: la busqueda web realizada no devolvio resultados relacionados con este modelo; los enlaces anteriores proceden de la model card y de los metadatos del repositorio.
