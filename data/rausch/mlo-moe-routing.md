# rausch/mlo-moe-routing

## Resumen

`rausch/mlo-moe-routing` es un repositorio de checkpoints de un proyecto de semestre (MLO) que agrupa multiples ejecuciones de entrenamiento de modelos de lenguaje con arquitectura Mixture-of-Experts (MoE) entrenados desde cero sobre texto web en ingles (WebOrganizer/Corpus-200B, tokenizer GPT-2, 12 capas, anchura 512). No se trata de un modelo unico listo para produccion, sino de una coleccion de runs experimentales cuyo objetivo es investigar si el enrutamiento (routing) de los expertos puede mejorarse utilizando senales derivadas del propio dataset (topicos, clusters de URL, embeddings, sesgos por sitio web, etc.).

Cada carpeta bajo `runs/` contiene un `checkpoint.pt` (modelo, estado de AdamW y cursor de datos en la ultima actualizacion), opcionalmente un `checkpoint-pre-cooldown.pt` y un `run.json` con la configuracion y los resultados de Dev. La metrica reportada es la NLL natural de Dev en nats por token (menor es mejor), y los runs con la misma semilla parten de los mismos pesos, lo que permite comparaciones controladas.

El repositorio tiene un tamano de 104.8 GB, lo que refleja la acumulacion de decenas de checkpoints de distintos runs (32 y 64 expertos, 4B, 8B, 16B y 17.6B tokens). Es relevante ahora como material de investigacion reproducible sobre routing en MoE, no como modelo de inferencia generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), 12 capas, anchura 512, Top-2 routing |
| Parametros totales | no disponible |
| Parametros activos | no disponible (Top-2 sobre 8, 32 o 64 expertos segun run) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (texto web de WebOrganizer/Corpus-200B) |
| Licencia | no disponible |
| Formato de pesos | PyTorch `.pt` (checkpoint con estado de AdamW y cursor de datos) |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE de 12 capas y anchura 512, con tokenizer GPT-2 y routing Top-2. El numero de expertos varia segun el run: 8, 32 o 64. El entrenamiento se realiza desde cero sobre texto web en ingles del corpus WebOrganizer/Corpus-200B, con presupuestos de 4B, 8B, 16B y 17.6B tokens. Algunos runs incluyen una fase de cooldown de learning rate (por ejemplo, `edl-cool-1106-*` continuado hasta 17.6B tokens).

La innovacion central es el estudio del routing con senales del dataset. Se comparan variantes: Topic-EDL (loss de separacion de topicos en el router, 24 topicos, peso 0.0005), EDL con grupos derivados de clusters de URL, clusters de texto, grupos conjuntos texto+URL, grupos de formato, clusters de embeddings GTE, grupos aleatorios (control), grupos de URL barajados (control), grupos por URL y ano de crawl, grupos por perfil del router base, splits por fuente dentro de topico, y sesgo aprendido por sitio web en el router (metarouter/hostonly). Tambien se prueba sticky routing loss con 8 expertos. Los resultados se reportan como NLL natural de Dev en nats por token, con runs repetidos por semilla (101, 102, 103, 104) para controlar la varianza.

## Capacidades

- Generacion de texto autoregresiva en ingles (modelo de lenguaje causal).
- Razonamiento de siguiente token a escala de investigacion (12 capas, anchura 512).
- Routing Top-2 sobre 8, 32 o 64 expertos, con variantes de enrutamiento condicionado por topicos, URL, formato, embeddings o sitio web.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni multi-step reasoning.
- Capacidades multilingues: no disponibles (entrenado sobre texto web en ingles).
- No se documenta modo thinking, vision ni audio.
- Utilidad principal: reproduccion de experimentos de routing y analisis de la relacion entre senales del dataset y especializacion de expertos.

## Casos de uso

- Investigacion sobre routing en MoE: comparar la NLL de Dev entre el baseline y las variantes EDL (topicos, URL, formato, GTE) usando los `run.json` y checkpoints para reproducir el estudio con las mismas semillas.
- Analisis de especializacion de expertos: cargar `checkpoint.pt` y examinar que expertos se activan para distintos topicos o sitios web, evaluando si el sesgo por sitio (metarouter/hostonly) produce separacion medible.
- Estudio de senales del dataset: usar los runs con grupos aleatorios y URL barajados como controles para cuantificar cuanto de la mejora se debe a la senal real frente al ruido.
- Reproduccion de experimentos con cooldown: emplear `checkpoint-pre-cooldown.pt` y el checkpoint final para analizar el efecto del decaimiento de learning rate en la NLL.
- Benchmarking de tecnicas de regularizacion del router: comparar Topic-EDL, sticky routing loss y sesgo por sitio en presupuestos de 4B, 8B, 16B y 17.6B tokens.
- Docencia y proyectos de semestre: servir como base reproducible para que estudiantes extiendan el estudio con nuevas senales de enrutamiento o tamanos de modelo.
- Analisis de escalado de expertos: contrastar runs de 8, 32 y 64 expertos para estudiar el compromiso entre capacidad y NLL a presupuesto de tokens fijo.

## Benchmarks y rendimiento

Los unicos resultados publicados son las NLL naturales de Dev (nats por token, menor es mejor) reportadas en la model card. Se resumen los runs mas representativos:

| Run | Expertos | Tokens | Dev NLL |
|---|---|---|---|
| `edl-cap-1108-baseline-s101` | 32 | 4.0B | 3.1485 |
| `edl-rep-1124-baseline-s101` | 32 | 4.0B | 3.1395 |
| `edl-cap-1108-edl24-s101` | 32 | 4.0B | 3.1317 |
| `edl-group-1117-urlcluster24-s101` | 32 | 4.0B | 3.1342 |
| `edl-group-1117-textcluster24-s101` | 32 | 4.0B | 3.1475 |
| `edl-joint-1124-joint24-s101` | 32 | 4.0B | 3.1328 |
| `edl-screen-1119-format24-s101` | 32 | 4.0B | 3.1418 |
| `edl-screen-1119-gte24-s101` | 32 | 4.0B | 3.1451 |
| `edl-screen-1119-random24-s101` | 32 | 4.0B | 3.1465 |
| `edl-url-1121-urlshuffle24-s101` | 32 | 4.0B | 3.1384 |
| `edl-k7-1121-urlyear24-s101` | 32 | 4.0B | 3.1407 |
| `edl-rprof-1121-rprof24-s101` | 32 | 4.0B | 3.1403 |
| `topicsrc-1122-split32-s101` | 32 | 4.0B | 3.1493 |
| `metarouter-host-s101` | 32 | 4.0B | 3.1336 |
| `hostperm-1122-host-s101` | 32 | 4.0B | 3.1459 |
| `topichost-1124-s101` | 32 | 4.0B | 3.1494 |
| `edl-cap64-1114-baseline-s101` | 64 | 4.0B | 3.0983 |
| `edl-cap64-1114-edl24-s101` | 64 | 4.0B | 3.0879 |
| `edl-cap64-8b-1121-baseline-s101` | 64 | 8.0B | 2.9368 |
| `edl-cap64-8b-1121-edl24-s101` | 64 | 8.0B | 2.9250 |
| `edl-long-1030-baseline-s101` | 8 | 16.0B | 3.0335 |
| `edl-long-1030-edl24-s101` | 8 | 16.0B | 3.0392 |
| `edl-long-1030-sticky-s101` | 8 | 16.0B | 3.0455 |
| `edl-cool-1106-baseline-s101` | 8 | 17.6B | 2.9493 |
| `edl-cool-1106-edl24-s101` | 8 | 17.6B | 2.9555 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Con 12 capas y anchura 512, el modelo es pequeno en parametros, pero los checkpoints incluyen estado de AdamW (dos momentos por parametro) y cursor de datos, lo que triplica aproximadamente el peso en disco respecto al modelo puro. El repositorio completo ocupa 104.8 GB por acumulacion de runs.
- GPU recomendadas: no disponibles. Por el tamano del modelo, cualquier GPU consumer con suficiente VRAM para el checkpoint individual deberia bastar, pero no se documenta.
- Cabe en GPU consumer: probablemente si para un checkpoint individual, pero no se confirma en la informacion disponible.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI. Los pesos estan en formato PyTorch `.pt`, no en safetensors ni GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de modelos comparables documentados en la informacion proporcionada. Este repositorio es un conjunto de checkpoints de investigacion sobre routing en MoE, no un modelo publicado con benchmarks estandar comparables a modelos de produccion. No disponible.

## Limitaciones y advertencias

- No es un modelo listo para produccion: son checkpoints de investigacion con estado de optimizador y cursor de datos, no pesos limpios para inferencia.
- Entrenado exclusivamente sobre texto web en ingles; no hay evidencia de capacidades multilingues.
- La licencia no esta declarada, por lo que el uso comercial es incierto y requiere contactar con el autor.
- No se documentan benchmarks estandar (MMLU, HumanEval, GSM8K), por lo que no se puede evaluar su calidad generalista.
- Riesgo de alucinacion y sesgos inherente a modelos entrenados sobre texto web sin documentacion de filtrado o alineacion (no se menciona RLHF ni DPO).
- Longitud de contexto no documentada; no apto para tareas que requieran ventanas largas sin verificacion previa.
- Las diferencias de NLL entre variantes son pequenas (del orden de 0.001-0.02 nats), por lo que las conclusiones sobre la eficacia del routing requieren analisis estadistico entre semillas.
- El repositorio ocupa 104.8 GB; la descarga completa es costosa y conviene seleccionar runs concretos.

## Enlaces

- Hugging Face: https://huggingface.co/rausch/mlo-moe-routing
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo (los resultados corresponden a empresas y marcas homonimas sin relacion: rausch.international, rausch.ch, rausch-packaging.com, Wikipedia y rausch.de).
