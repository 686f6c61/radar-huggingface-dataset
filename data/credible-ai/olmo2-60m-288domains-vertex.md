# credible-ai/olmo2-60M-288domains-vertex

## Resumen

`olmo2-60M-288domains-vertex` es una coleccion de 1.024 modelos de lenguaje preentrenados de 57,6 millones de parametros cada uno, publicada por credible-ai como material de acompanamiento del articulo LinMix (arXiv:2610.37390). No es un modelo para uso final, sino un conjunto de modelos proxy disenados para estudiar la mezcla de datos de preentrenamiento: cada modelo corresponde a una mezcla distinta de los 288 dominios (tema x formato) definidos por WebOrganizer, y sirve para estimar de forma barata como afecta la composicion del corpus al rendimiento de modelos de mayor tamano.

La relevancia de la publicacion es metodologica. Entrenar modelos proxy pequenos sobre muchas combinaciones de datos permite atribuir de forma lineal la contribucion de cada dominio al rendimiento final, evitando el coste prohibitivo de repetir el preentrenamiento de modelos grandes para cada mezcla candidata. El repositorio ocupa 118 GB en total y contiene los pesos en bfloat16, la tokenizacion GPT-NeoX-20B y, en cada carpeta `mix_<i>`, el fichero `mix.json` con la mezcla exacta usada.

Los modelos se entrenan con 2.000 millones de tokens usando OLMo-core, sobre la arquitectura OLMo 2 (`Olmo2ForCausalLM`), y se distribuyen bajo licencia MIT. El idioma declarado es unicamente ingles. Su valor practico esta en la investigacion de mezclas de datos y en la construccion de proxies para experimentos de scaling, no en tareas de generacion de texto en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OLMo 2 (`Olmo2ForCausalLM`), transformer decoder-only |
| Parametros totales | 57,6 M por modelo (1.024 modelos, 118 GB en total) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

Cada uno de los 1.024 modelos es un transformer decoder-only de la familia OLMo 2 con 8 capas, tamano oculto 384 y 57,6 millones de parametros. Comparten el tokenizador GPT-NeoX-20B, con un vocabulario de 50.432 tokens, ubicado en la raiz del repositorio. Los pesos se almacenan en bfloat16 y se cargan con `AutoModelForCausalLM` indicando el subdirectorio `mix_<i>` correspondiente.

El entrenamiento se realizo con OLMo-core sobre 2.000 millones de tokens por modelo, extraidos de WebOrganizer/Corpus-200B, un corpus derivado del pool DCLM 1b-1x (CC-BY-4.0) y sujeto a los terminos de uso de Common Crawl. Las secuencias tokenizadas estan publicadas en `credible-ai/weborganizer-corpus-200b-tokenized`. La innovacion no esta en la arquitectura sino en el diseno experimental: las 1.024 mezclas cubren el diseno "vertex" del articulo LinMix sobre los 288 dominios tema x formato, y cada `mix.json` documenta la mezcla exacta empleada. El articulo propone tratar la mezcla de datos como una atribucion lineal de dominios, de modo que el rendimiento de los proxies permite estimar la contribucion de cada dominio y extrapolar a modelos mayores. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Generacion de texto autoregresiva basica, limitada por el tamano del modelo (57,6 M de parametros) y por los 2.000 millones de tokens de entrenamiento.
- Modelado de lenguaje sobre dominios web especificos: cada proxy esta especializado en la mezcla concreta sobre la que fue entrenado.
- Atribucion de dominios: al comparar los 1.024 proxies se puede estimar la contribucion de cada uno de los 288 dominios al rendimiento.
- Reproducibilidad experimental: los ficheros `mix.json` permiten reconstruir exactamente cada mezcla de entrenamiento.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking.
- Capacidad multilingue practicamente inexistente segun la model card: solo se declara ingles.

## Casos de uso

- Investigacion de mezclas de datos: entrenar o evaluar proxies sobre combinaciones de dominios para estimar que mezcla conviene usar en un modelo grande antes de invertir en su preentrenamiento.
- Seleccion de subconjuntos del corpus: usar las diferencias de rendimiento entre los 1.024 proxies para descartar dominios de bajo valor y reducir el coste de curacion de datos.
- Estudio de scaling de datos: comparar el comportamiento de los proxies con modelos de referencia mayores para validar si las conclusiones sobre mezclas se mantienen al escalar.
- Reproduccion de resultados academicos: el articulo LinMix y el dataset `linmix-proxy-swarms` permiten reejecutar los experimentos con las mezclas exactas publicadas.
- Benchmarking de metodologias de atribucion: los proxies sirven como banco de pruebas controlado para comparar tecnicas de data mixing frente a alternativas como ajustes heuristicos.
- Docencia y experimentacion de bajo coste: con 57,6 M de parametros, cada proxy se puede entrenar y evaluar en hardware modesto, lo que facilita practicas sobre preentrenamiento y tokenizacion.
- Analisis de dominio en corpus web: estudiar como afecta el formato y el tema de las paginas (segun la taxonomia de 288 dominios) a las curvas de perdida durante el preentrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: un proxy de 57,6 M de parametros en bfloat16 ocupa aproximadamente 115 MB de pesos; en float32, unos 230 MB. La inferencia cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre para un unico proxy; para cargar y comparar varios proxies en paralelo conviene una RTX 3090/4090 (24 GB) o una A100/H100.
- Almacenamiento: el repositorio completo ocupa 118 GB; conviene descargar solo las carpetas `mix_<i>` necesarias mediante `allow_patterns` en `snapshot_download`.
- Despliegue: transformers es la via documentada; al ser modelos de investigacion no se detallan integraciones con vLLM, TGI, llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| olmo2-60M-288domains-vertex | 57,6 M por proxy (1.024 modelos) | no disponible | Proxies para mezcla de datos (LinMix) | MIT | Hugging Face |
| OLMo 2 (modelos base de AllenAI) | 7B y 13B en las variantes publicas | no disponible en esta ficha | Modelos de lenguaje de proposito general | Apache 2.0 (segun familia OLMo 2) | Hugging Face |
| Pythia (suite de EleutherAI) | 70M a 12B | 2.048 tokens en las variantes publicadas | Estudio de escalado y entrenamiento | Apache 2.0 | Hugging Face |

La comparacion directa con modelos de proposito general no es del todo justa: este repositorio no busca competir en calidad de generacion, sino ofrecer un banco controlado de proxies para investigacion de mezclas. Frente a Pythia, la diferencia clave es la especializacion por dominio y la existencia de 1.024 variantes con mezclas documentadas.

## Limitaciones y advertencias

- Modelos de 57,6 M de parametros: la calidad de generacion es muy baja y no son adecuados para tareas de produccion.
- Entrenados solo en ingles; no se declara soporte de otros idiomas.
- No se documenta la longitud de contexto soportada, lo que limita su uso en tareas de contexto largo.
- Riesgo alto de alucinacion y de generar texto incoherente, especialmente fuera de los dominios vistos en entrenamiento.
- Sesgos heredados de Common Crawl y del pool DCLM, con los sesgos propios de corpus web sin filtrar.
- La licencia MIT cubre los pesos, pero los datos de entrenamiento estan sujetos a los terminos de uso de Common Crawl y a la licencia CC-BY-4.0 del pool DCLM; conviene revisar esas condiciones antes de un uso comercial de los derivados.
- El repositorio completo ocupa 118 GB, lo que exige planificar la descarga selectiva de subcarpetas.
- No hay garantia de mantenimiento ni de soporte por parte del autor; el valor del recurso esta ligado al articulo LinMix.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/credible-ai/olmo2-60M-288domains-vertex
- Articulo LinMix: https://arxiv.org/abs/2610.37390
- Dataset de diseno y resultados: https://huggingface.co/datasets/credible-ai/linmix-proxy-swarms
- Dataset de secuencias tokenizadas: https://huggingface.co/datasets/credible-ai/weborganizer-corpus-200b-tokenized
- Corpus WebOrganizer: https://huggingface.co/datasets/WebOrganizer/Corpus-200B
- Pool DCLM 1b-1x: https://huggingface.co/datasets/mlfoundations/dclm-pool-1b-1x
- Codigo LinMix: https://github.com/credibleai/linmix
- OLMo-core: https://github.com/allenai/OLMo-core
- Documentacion de OLMo 2 en transformers: https://huggingface.co/docs/transformers/model_doc/olmo2
- Tokenizador GPT-NeoX-20B: https://huggingface.co/EleutherAI/gpt-neox-20b
- Terminos de uso de Common Crawl: https://commoncrawl.org/terms-of-use
