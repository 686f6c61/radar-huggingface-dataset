# credible-ai/olmo2-30M-288domains-dirichlet

## Resumen

`olmo2-30M-288domains-dirichlet` es una coleccion de 1.024 modelos de lenguaje preentrenados de 29,2M de parametros cada uno, publicada por el grupo credible-ai. No es un modelo unico pensado para uso final, sino un conjunto de modelos proxy disenados para estudiar la mezcla de datos (data mixing) en el preentrenamiento. Cada modelo corresponde a una mezcla distinta generada mediante un diseno Dirichlet sobre 288 dominios definidos por la taxonomia WebOrganizer, que combina tematica y formato de los documentos web.

El trabajo subyacente es LinMix (Baniecki, Biecek y Pawelczyk, 2026), un articulo que plantea la mezcla de datos como un problema de atribucion lineal por dominio. La idea es entrenar muchos modelos pequenos con mezclas controladas para inferir, mediante regresion, como contribuye cada dominio al rendimiento final, y asi optimizar la composicion del dataset antes de lanzar entrenamientos costosos a gran escala.

La relevancia practica es metodologica: los modelos son demasiado pequenos (4 capas, hidden size 256) para tareas de generacion reales, pero sirven como infraestructura de investigacion reproducible. El repositorio pesa 59,9 GB en bfloat16 y se distribuye bajo licencia MIT, con pesos en safetensors y compatibles con la clase `Olmo2ForCausalLM` de Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OLMo 2 (`Olmo2ForCausalLM`), transformer decoder-only |
| Parametros totales | 29,2M por modelo (1.024 modelos, ~29,9B en total) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (bfloat16), un subdirectorio por mezcla (`mix_0` a `mix_1023`) |

## Arquitectura y entrenamiento

Cada uno de los 1.024 modelos sigue la arquitectura OLMo 2 en su variante minima: 4 capas, hidden size de 256 y 29,2M de parametros. El tokenizador es el de GPT-NeoX-20B, con un vocabulario de 50.432 tokens, ubicado en la raiz del repositorio y compartido por todas las mezclas.

El entrenamiento se realizo con OLMo-core sobre 1.000 millones de tokens por modelo, extraidos de WebOrganizer/Corpus-200B (derivado del pool DCLM 1b-1x, CC-BY-4.0, sujeto a los terminos de Common Crawl). Las secuencias tokenizadas estan publicadas en `credible-ai/weborganizer-corpus-200b-tokenized`. La innovacion no esta en la arquitectura sino en el diseno experimental: cada modelo se entrena con una mezcla Dirichlet distinta sobre 288 dominios (tematica x formato), y el archivo `mix_<i>/mix.json` documenta la mezcla exacta usada para el modelo `i`. No se mencionan fases de RLHF, DPO ni ajuste por instrucciones; son modelos base de preentrenamiento puro.

## Capacidades

- Generacion de texto autoregresiva basica, limitada por el tamano del modelo (29,2M de parametros).
- Modelado de lenguaje en ingles para medir perplexity y perdida sobre dominios concretos.
- Servir como proxy para estimar el efecto de mezclas de datos sobre el rendimiento.
- Atribucion lineal por dominio de la contribucion de cada fuente de datos (metodologia LinMix).
- No dispone de tool calling, function calling ni soporte de agentes.
- No dispone de modo thinking, vision ni audio.
- Capacidades multilingues limitadas al ingles.
- Utilidad como componente en pipelines de investigacion sobre data mixing, no como asistente.

## Casos de uso

- Investigacion sobre mezcla de datos: entrenar o reutilizar los 1.024 proxies para ajustar un modelo de atribucion lineal que prediga el rendimiento de una mezcla antes de entrenar un modelo grande.
- Optimizacion de presupuesto de preentrenamiento: estimar con proxies de 30M que dominios aportan mas y recortar el dataset de un entrenamiento de miles de millones de parametros.
- Reproducibilidad de experimentos: el repositorio incluye los `mix.json` y las secuencias tokenizadas, lo que permite replicar exactamente cada mezcla y sus resultados.
- Estudio de sesgos por fuente: al tener un modelo por mezcla, se puede medir como varia la perplexity y el comportamiento en dominios especificos segun la composicion del corpus.
- Docencia y prototipado: modelos de 30M que caben en cualquier GPU consumer para ensenar tecnicas de preentrenamiento y evaluacion de corpus.
- Benchmarking de infraestructura: usar el enjambre de 1.024 modelos para probar sistemas de entrenamiento distribuido, orquestacion y almacenamiento a escala moderada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al dataset `credible-ai/linmix-proxy-swarms` y al paper arXiv:2610.37390 para diseno, resultados y secuencias de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de 29,2M de parametros en bfloat16 ocupa aproximadamente 60 MB de pesos, mas overhead de activaciones y tokenizador; cabe holgadamente en cualquier GPU con 1 GB o mas.
- GPU recomendadas: cualquier GPU consumer (RTX 3060, RTX 4090, etc.) sirve para un modelo individual; para cargar varios en paralelo se recomienda una GPU con 24 GB o mas.
- Cabe en GPU consumer: si, sin problema, incluso en iGPU o CPU para inferencia puntual.
- Opciones de despliegue: Transformers (`AutoModelForCausalLM` con `subfolder="mix_<i>"`), y por tamano tambien es viable exportar a GGUF para llama.cpp u Ollama, aunque no se documenta en la model card.
- Almacenamiento: el repositorio completo ocupa 59,9 GB; conviene descargar solo las mezclas necesarias con `allow_patterns`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| olmo2-30M-288domains-dirichlet | 29,2M por modelo (1.024 modelos) | no disponible | Investigacion de data mixing (proxies) | MIT | HuggingFace |
| OLMo 2 (variantes oficiales de AI2) | 7B, 13B, 32B | 4.096 tokens (variantes base) | Modelo base de proposito general | Apache 2.0 | HuggingFace |
| Pythia (EleutherAI) | 70M a 12B | 2.048 tokens | Suite de investigacion sobre entrenamiento | Apache 2.0 | HuggingFace |
| SmolLM2 (HuggingFace) | 135M, 360M, 1.7B | 8.192 tokens | Modelo pequeno de proposito general | Apache 2.0 | HuggingFace |

La comparacion es aproximada: este repositorio no compite en rendimiento de tareas, sino que ofrece un enjambre de proxies para metodologia de mezcla de datos, un nicho que las suites anteriores no cubren con la misma granularidad (1.024 mezclas sobre 288 dominios).

## Limitaciones y advertencias

- Los modelos de 29,2M de parametros no son aptos para generacion de texto de calidad en produccion; su perplexity sera alta y la coherencia muy limitada.
- Entrenados exclusivamente en ingles; no hay soporte multilingue.
- Riesgo alto de alucinacion y de outputs incoherentes por la capacidad reducida.
- No han pasado por RLHF, DPO ni ajuste por instrucciones; no siguen instrucciones de forma fiable.
- Sesgos heredados de Common Crawl y del pool DCLM 1b-1x, con los sesgos demograficos y de dominio propios de datos web.
- La licencia MIT cubre los pesos, pero los datos de entrenamiento estan sujetos a los terminos de Common Crawl y a la licencia CC-BY-4.0 de DCLM; el uso comercial de los datos derivados requiere revisar esas condiciones.
- El repositorio completo ocupa 59,9 GB; descargarlo entero sin necesidad consume almacenamiento y ancho de banda.
- No se documenta la longitud de contexto de entrenamiento, lo que limita su uso en tareas que requieran ventanas largas.
- Los resultados del paper no deben extrapolarse sin validacion a modelos de mayor escala.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/credible-ai/olmo2-30M-288domains-dirichlet
- Paper LinMix: https://arxiv.org/abs/2610.37390
- Dataset de diseno y resultados: https://huggingface.co/datasets/credible-ai/linmix-proxy-swarms
- Dataset de entrenamiento (tokenizado): https://huggingface.co/datasets/credible-ai/weborganizer-corpus-200b-tokenized
- Corpus original: https://huggingface.co/datasets/WebOrganizer/Corpus-200B
- Pool DCLM 1b-1x: https://huggingface.co/datasets/mlfoundations/dclm-pool-1b-1x
- Codigo: https://github.com/credibleai/linmix
- OLMo-core: https://github.com/allenai/OLMo-core
- Documentacion de Olmo2ForCausalLM: https://huggingface.co/docs/transformers/model_doc/olmo2
- Tokenizador GPT-NeoX-20B: https://huggingface.co/EleutherAI/gpt-neox-20b
- Terminos de uso de Common Crawl: https://commoncrawl.org/terms-of-use
