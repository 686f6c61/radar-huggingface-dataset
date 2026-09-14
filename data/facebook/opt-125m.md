# facebook/opt-125m

## Resumen

OPT-125M es el miembro mas pequeno de la familia Open Pre-trained Transformers (OPT) desarrollada por Meta AI y publicada el 3 de mayo de 2022 en el articulo arXiv:2205.01068. Se trata de un transformer decoder-only de 125 millones de parametros entrenado con un objetivo de modelado causal de lenguaje (CLM), disenado para replicar el comportamiento y los tamanos de la clase GPT-3 con el fin de poner modelos de este tipo a disposicion de la comunidad investigadora.

El objetivo declarado del proyecto es permitir investigacion reproducible y responsable sobre modelos de lenguaje a gran escala, abordando problemas de robustez, sesgo y toxicidad que hasta entonces solo podian estudiarse en laboratorios con acceso a modelos cerrados. La familia OPT abarca desde 125M hasta 175B parametros, y este checkpoint de 125M es el mas ligero de la serie.

Aunque fue entrenado predominantemente con texto en ingles, el corpus incluye una pequena proporcion de contenido no ingles procedente de CommonCrawl. La relevancia actual del modelo radica en su tamano reducido (ejecutable en CPU y en cualquier GPU consumer), su caracter completamente abierto para investigacion y su uso extendido como modelo de referencia y como punto de partida para fine-tuning en tareas concretas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (autoregresivo, objetivo de modelado causal de lenguaje) |
| Parametros totales | 125 millones (125M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 2048 tokens (2K), segun LLM Explorer |
| Tipos de cuantizacion | No disponible en la informacion proporcionada |
| Idiomas soportados | Ingles (predominantemente); trazas de otros idiomas procedentes de CommonCrawl |
| Licencia | other (la model card indica commercial: false) |
| Formato de pesos | PyTorch, TensorFlow y JAX (tamano del repo: 7,7 GB) |

## Arquitectura y entrenamiento

OPT-125M sigue la arquitectura de la clase GPT-3: un transformer decoder-only entrenado de forma auto-supervisada con un objetivo de modelado causal de lenguaje. El modelo pertenece a la misma familia que GPT-3 (arXiv:2005.14165) y fue entrenado para aproximar tanto el rendimiento como los tamanos de esa clase de modelos. La model card no detalla innovaciones de atencion especificas (no se mencionan atencion lineal ni decodificacion especulativa).

El corpus de entrenamiento final contiene 180.000 millones de tokens (180B) que corresponden a 800 GB de datos. Se compuso como la union de cinco conjuntos filtrados: BookCorpus (mas de 10.000 libros ineditos), CC-Stories (subconjunto de CommonCrawl filtrado para imitar el estilo de los esquemas de Winograd), The Pile (del que se incluyeron Pile-CC, OpenWebText2, USPTO, Project Gutenberg, OpenSubtitles, Wikipedia, DM Mathematics y HackerNews), Pushshift.io Reddit (desarrollado por Baumgartner et al. 2020 y procesado por Roller et al. 2021) y CCNewsV2 (version actualizada de la porcion inglesa del dataset de noticias de CommonCrawl usado en RoBERTa). La particion de validacion fue de 200 MB muestreados proporcionalmente al tamano de cada dataset. Es un modelo preentrenado sin alineacion posterior: no se menciona en la informacion disponible el uso de RLHF ni de DPO.

## Capacidades

- Generacion de texto autoregresiva en ingles mediante prompting.
- Evaluacion zero-shot y few-shot de tareas downstream (siguiendo los prompts y el diseno experimental de GPT-3).
- Fine-tuning sobre tareas concretas mediante el ejemplo de modelado causal de lenguaje de transformers.
- Generacion determinista por defecto, con opcion de muestreo top-k activando `do_sample`.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso de forma nativa.
- Capacidades multilingues muy limitadas: entrenado predominantemente en ingles, con solo trazas de otros idiomas.
- No dispone de modo thinking, vision ni audio.
- Al ser un modelo base preentrenado (sin RLHF/DPO), carece de alineacion de instrucciones y de filtros de seguridad.

## Casos de uso

- Fine-tuning para tareas de dominio especifico: al ser un modelo base pequeno, puede reentrenarse o ajustarse con el ejemplo CLM de transformers para clasificacion, resumen o generacion en un nicho concreto con recursos de computo modestos.
- Investigacion sobre sesgos y toxicidad: su tamano reducido y su apertura lo hacen util como banco de pruebas para analizar como se manifiestan sesgos derivados de datos de internet sin filtrar, tal y como advierte la model card.
- Prototipado rapido de pipelines de generacion: sirve como sustituto ligero para validar la integracion de la libreria transformers, el pipeline de text-generation y la logica de decodificacion antes de escalar a modelos mayores.
- Baseline en experimentos academicos: proporciona un punto de comparacion estandar frente a otros modelos de ~125M en estudios de eficiencia, decodificacion o destilacion.
- Generacion de texto en entornos con recursos muy limitados: al ocupar aproximadamente 0,3 GB de VRAM y caber en CPU, es viable en dispositivos de borde, portatiles sin GPU dedicada o entornos de CI.
- Aumento de datos y generacion de texto sintetico: puede producir ejemplos adicionales para tareas de NLP en ingles, siempre que se revise la calidad y se filtren salidas toxicas o alucinadas.
- Docencia y divulgacion: permite explicar de forma practica el funcionamiento interno de un transformer decoder-only sin requerir hardware especializado.
- Evaluacion de tecnicas de decodificacion: util para comparar estrategias de muestreo (greedy, top-k, temperatura) sobre un modelo abierto y rapido de ejecutar.

## Benchmarks y rendimiento

Los unicos datos de benchmark presentes en la informacion disponible provienen de LLM Explorer, que reporta para este modelo un resultado de ARC de 22,9 y una puntuacion global de 0,18 en su indice. No se han publicado en la informacion disponible resultados de otros benchmarks habituales (MMLU, HumanEval, GSM8K, etc.) para este checkpoint concreto.

| Benchmark | Resultado | Fuente |
|---|---|---|
| ARC | 22,9 | LLM Explorer |
| Puntuacion global LLM Explorer | 0,18 | LLM Explorer |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,3 GB segun LLM Explorer. En fp32 el peso del modelo ronda los 0,5 GB y en fp16 los 0,25 GB (estimacion a partir del numero de parametros).
- GPU recomendadas: no requiere GPU dedicada. Cualquier GPU consumer (e incluso integradas) es suficiente; no es necesario recurrir a A100, H100 o RTX 4090 para este tamano.
- Cabe en GPU consumer: si, en practicamente todas las GPU consumer actuales y en la mayoria de equipos solo con CPU.
- Opciones de despliegue: libreria transformers (pipeline de text-generation), text-generation-inference (segun los tags del repositorio) y despliegue en Azure (tag deploy:azure).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| facebook/opt-125m | 125M | 2048 tokens | other (commercial: false) | HuggingFace (transformers, TF, JAX) |
| gpt2 (124M) | 124M | 1024 tokens | Licencia tipo MIT de OpenAI (referencia general) | HuggingFace |
| EleutherAI/gpt-neo-125M | 125M | 2048 tokens | MIT (referencia general) | HuggingFace |
| facebook/opt-350m | 350M | 2048 tokens | other (misma familia OPT) | HuggingFace |

Los datos de contexto y licencia de gpt2 y gpt-neo-125M corresponden a conocimiento publico general y no proceden de la informacion de la busqueda; conviene verificarlos en sus respectivas model cards antes de tomar decisiones de produccion.

## Limitaciones y advertencias

- Sesgo fuerte: la model card advierte que el entrenamiento con contenido de internet sin filtrar (CommonCrawl, Reddit) genera un modelo marcadamente sesgado, y que este sesgo afecta tambien a cualquier version fine-tuned.
- Riesgo de alucinacion y baja diversidad de generacion: la propia familia OPT reconoce problemas de calidad en la generacion y de alucinacion.
- Contenido ofensivo en los datos: el corpus incluye subconjuntos de CommonCrawl y Reddit que pueden contener frases insultantes, amenazantes o angustiosas.
- Limitacion de idioma: entrenado predominantemente en ingles; su uso fiable en otros idiomas no esta garantizado.
- Restricciones de licencia: la model card indica commercial: false, por lo que el uso comercial debe revisarse con atencion antes de desplegar el modelo en productos.
- Modelo base sin alineacion: al no haberse aplicado RLHF ni DPO, no sigue instrucciones de forma fiable y no incorpora filtros de seguridad propios.
- Contexto limitado: 2048 tokens, inferior al de modelos mas recientes, lo que restringe tareas que requieran ventanas largas.
- Capacidad reducida por tamano: con 125M parametros, su rendimiento en razonamiento, matematicas o codigo es bajo en comparacion con modelos mayores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/facebook/opt-125m
- Paper OPT (Open Pre-trained Transformer Language Models): https://arxiv.org/abs/2205.01068
- PDF del paper OPT: https://arxiv.org/pdf/2205.01068.pdf
- Paper de GPT-3: https://arxiv.org/abs/2005.14165
- Repositorio metaseq: https://github.com/facebookresearch/metaseq
- Ejemplo CLM de transformers: https://github.com/huggingface/transformers/tree/main/examples/pytorch/language-modeling
- Hub de modelos OPT: https://huggingface.co/models?filter=opt
- Ficha en LLM Explorer: https://llm-explorer.com/model/facebook%2Fopt-125m,4CEw6AtYUzZJwXeY7ntyEU
