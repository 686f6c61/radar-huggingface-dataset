# credible-ai/qwen3.5-4B-40domains-dirichlet-exponential-hellaswag

## Resumen

qwen3.5-4B-40domains-dirichlet-exponential-hellaswag es un modelo de lenguaje de 3.700 millones de parametros desarrollado por credible-ai como artefacto de investigacion para reproducir los experimentos del paper LinMix ("Data Mixing as Linear Domain Attribution"). No es un modelo de proposito general: se entrena desde cero sobre una mezcla de 40 dominios (24 topicos de WebOrganizer, 15 lenguajes de programacion y matematicas) cuyos pesos fueron optimizados con Olmix mediante un ajuste exponencial sobre un enjambre Dirichlet, tomando HellaSwag como benchmark objetivo.

La arquitectura sigue el diseno Qwen3.5 (`Qwen3_5ForCausalLM`, transformers >= 5.2) con 32 capas y tamano oculto 2560, entrenada con OLMo-core sobre 80.000 millones de tokens. Emplea el tokenizador de GPT-NeoX-20B con un vocabulario de 50.432 entradas y pesos en bfloat16. Su relevancia es metodologica: permite estudiar como la asignacion de pesos por dominio en el preentrenamiento afecta al rendimiento en tareas concretas, y sirve como referencia reproducible para tecnicas de data mixing.

El modelo se publica bajo licencia MIT, pero su naturaleza experimental y su limitacion al idioma ingles lo alejan de un uso en produccion. Es util para investigadores que trabajen en mezcla de datos, atribucion de dominios o entrenamiento desde cero de modelos pequenos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Qwen3.5 (`Qwen3_5ForCausalLM`) |
| Parametros totales | 3.699.158.016 (3,7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

Modelo transformer decoder-only con 32 capas, tamano oculto 2560 y 3,7B de parametros, entrenado desde cero (no es un fine-tune de Qwen). Usa el tokenizador GPT-NeoX-20B con vocabulario de 50.432 tokens. El entrenamiento se realizo con OLMo-core sobre 80.000 millones de tokens extraidos de tres fuentes: WebOrganizer/Corpus-200B (derivado del pool DCLM 1b-1x), las 15 subcategorias de lenguajes de HuggingFaceTB/stack-edu y el subconjunto 4plus de nvidia/Nemotron-CC-Math-v1.

La innovacion tecnica reside en la mezcla de datos: 40 dominios ponderados mediante Olmix, que ajusta un surrogate exponencial sobre un enjambre Dirichlet generado con el proxy credible-ai/qwen3.5-100M-40domains-dirichlet, optimizando especificamente el rendimiento en HellaSwag. El archivo `mix.json` del repositorio contiene la mezcla exacta utilizada. No se documentan fases de RLHF, DPO ni instruccion; es un modelo base de preentrenamiento.

## Capacidades

- Generacion de texto autoregresiva en ingles (modelo base, sin ajuste de instrucciones).
- Razonamiento y conocimiento general derivado del corpus web de WebOrganizer.
- Generacion de codigo en 15 lenguajes de programacion presentes en Stack-Edu.
- Razonamiento matematico basico por la inclusion del subconjunto 4plus de Nemotron-CC-Math.
- Capacidad de continuacion de texto y few-shot prompting (uso previsto como modelo base).
- No dispone de tool calling, function calling ni soporte de agentes documentado.
- No dispone de modo thinking, vision ni audio.
- Multilingue: limitado a ingles segun la model card.

## Casos de uso

- Reproduccion de experimentos de data mixing: cargar el modelo y el `mix.json` para replicar los resultados del paper LinMix y comparar con otras mezclas del enjambre Dirichlet.
- Investigacion en atribucion de dominios: analizar como la ponderacion de los 40 dominios afecta al rendimiento en HellaSwag y extrapolar conclusiones a modelos de mayor escala.
- Estudio de mezclas para preentrenamiento: usar el modelo como referencia de 4B para validar metodologias de optimizacion de mezclas (Olmix) antes de aplicarlas a modelos mas grandes.
- Evaluacion de calidad de corpus web: medir el impacto de Corpus-200B frente a otras fuentes en tareas de comprension del lenguaje.
- Benchmarking de modelos base pequenos: comparar el rendimiento de un transformer de 3,7B entrenado con 80B de tokens frente a alternativas de tamano similar en tareas de continuacion de texto.
- Analisis de sesgos en corpus web: estudiar que sesgos introduce una mezcla dominada por datos de Common Crawl en un modelo entrenado desde cero.
- Experimentos de generacion de codigo en modelos base: evaluar la calidad de completado de codigo en los 15 lenguajes de Stack-Edu sin ajuste de instrucciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica que la mezcla de datos fue optimizada para HellaSwag, pero no reporta la puntuacion obtenida ni comparaciones numericas.

## Requisitos de hardware

- VRAM estimada: aproximadamente 7,4 GB en bfloat16 (coincide con el tamano del repo); en cuantizacion de 8 bits rondaria 4 GB y en 4 bits unos 2 GB (estimaciones, no verificadas por el autor).
- GPU recomendadas para bfloat16: A100 40GB, H100, L40S o RTX 4090 (24 GB) sin problema.
- Cabe en GPUs de consumo: si, en RTX 4090, RTX 3090, RTX 4080 y en tarjetas con 8 GB o mas en cuantizacion de 8/4 bits.
- Opciones de despliegue: transformers (requiere >= 5.2 por `Qwen3_5ForCausalLM`); llama.cpp, Ollama o vLLM no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| qwen3.5-4B-40domains-dirichlet-exponential-hellaswag | 3,7B | no disponible | MIT | Modelo base de investigacion (data mixing) |
| Qwen3.5-4B (oficial) | ~4B | no disponible | no disponible | Modelo de proposito general |
| OLMo-2-7B | 7B | no disponible | Apache 2.0 | Modelo base abierto con receta completa |
| Pythia-2.8B | 2,8B | 2048 | Apache 2.0 | Modelo base de investigacion |

La comparacion con Qwen3.5-4B oficial es la mas directa por arquitectura, pero este modelo se entrena desde cero y solo en ingles, por lo que no compite en capacidades generales. Frente a OLMo-2 y Pythia, comparte el espiritu de modelo base reproducible para investigacion, con la particularidad de estar optimizado para una mezcla de dominios concreta.

## Limitaciones y advertencias

- Modelo base sin ajuste de instrucciones: no sigue instrucciones ni mantiene dialogos de forma fiable.
- Solo entrenado en ingles; el rendimiento en castellano u otros idiomas sera muy limitado.
- Riesgo alto de alucinacion por ser un modelo de preentrenamiento sin alineamiento.
- Sesgos heredados de Common Crawl (via DCLM/Corpus-200B) y de los corpus de codigo y matematicas.
- La mezcla esta optimizada para HellaSwag, lo que puede sobreajustar el reparto de dominios a esa tarea concreta.
- Los datos de entrenamiento estan sujetos a los terminos de Common Crawl, The Stack v2 y el acuerdo de NVIDIA; la licencia MIT cubre los pesos, no necesariamente los datos.
- No redistribuye las secuencias de Stack-Edu ni Nemotron-CC-Math, lo que limita la reproducibilidad completa del entrenamiento.
- No hay informacion sobre longitud de contexto, cuantizaciones validadas ni rendimiento medido; no recomendado para produccion sin evaluacion propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/credible-ai/qwen3.5-4B-40domains-dirichlet-exponential-hellaswag
- Proxy swarm (100M): https://huggingface.co/credible-ai/qwen3.5-100M-40domains-dirichlet
- Paper LinMix: https://arxiv.org/abs/2610.37390
- Codigo: https://github.com/credibleai/linmix
- Documentacion de `Qwen3_5ForCausalLM`: https://huggingface.co/docs/transformers/model_doc/qwen3_5
- Tokenizador GPT-NeoX-20B: https://huggingface.co/EleutherAI/gpt-neox-20b
- OLMo-core: https://github.com/allenai/OLMo-core
- Dataset WebOrganizer/Corpus-200B: https://huggingface.co/datasets/WebOrganizer/Corpus-200B
- Dataset DCLM 1b-1x pool: https://huggingface.co/datasets/mlfoundations/dclm-pool-1b-1x
- Dataset HuggingFaceTB/stack-edu: https://huggingface.co/datasets/HuggingFaceTB/stack-edu
- Dataset nvidia/Nemotron-CC-Math-v1: https://huggingface.co/datasets/nvidia/Nemotron-CC-Math-v1
- Dataset tokenizado: https://huggingface.co/datasets/credible-ai/weborganizer-corpus-200b-tokenized
- Terminos de Common Crawl: https://commoncrawl.org/terms-of-use
- Terminos de The Stack v2: https://huggingface.co/datasets/bigcode/the-stack-v2
