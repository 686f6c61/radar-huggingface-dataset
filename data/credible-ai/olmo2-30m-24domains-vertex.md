# credible-ai/olmo2-30M-24domains-vertex

## Resumen

`olmo2-30M-24domains-vertex` es una coleccion de 512 modelos de lenguaje "proxy" de 29,2 millones de parametros cada uno, publicada por el grupo credible-ai como material reproducible del articulo LinMix (Data Mixing as Linear Domain Attribution). No es un modelo pensado para uso final, sino un instrumento de investigacion: cada uno de los 512 modelos se entrena sobre una mezcla de datos distinta del diseno "vertex" sobre los 24 topicos del corpus WebOrganizer, y sirve para estudiar como afecta la composicion del dataset al comportamiento del modelo resultante.

Cada proxy sigue la arquitectura OLMo 2 (`Olmo2ForCausalLM`) con 4 capas, hidden size de 256 y 29,2M de parametros, tokenizador GPT-NeoX-20B con vocabulario de 50.432 entradas y entrenamiento de 1.000 millones de tokens con OLMo-core. Los pesos estan en bfloat16 y el repositorio completo ocupa unos 30 GB (29,9 GB reportados por Hugging Face).

Su relevancia actual es metodologica: el articulo LinMix propone formular el data mixing como una atribucion lineal de dominios, y estos 512 proxies constituyen el conjunto de experimentos que permite ajustar y validar ese modelo de atribucion a bajo coste computacional. Para un desarrollador o investigador que quiera replicar el estudio o entrenar sus propios proxies de mezcla de datos, este repositorio ofrece los pesos y las mezclas exactas (`mix_<i>/mix.json`) ya empaquetadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, OLMo 2 (`Olmo2ForCausalLM`), 4 capas, hidden size 256 |
| Parametros totales | 29,2 M por modelo (512 modelos independientes) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

Cada uno de los 512 modelos es un transformer decoder-only de la familia OLMo 2, con 4 capas, dimension oculta de 256 y 29,2M de parametros, implementado como `Olmo2ForCausalLM` en transformers. Comparten el tokenizador GPT-NeoX-20B (vocabulario de 50.432 tokens), ubicado en la raiz del repositorio, de modo que todos los proxies usan el mismo espacio de tokens y resultan directamente comparables entre si.

El entrenamiento se realizo con OLMo-core sobre 1.000 millones de tokens por modelo. Los datos provienen de WebOrganizer/Corpus-200B, derivado del pool DCLM 1b-1x (CC-BY-4.0) y sujeto a los terminos de uso de Common Crawl; las secuencias tokenizadas exactas estan publicadas en `credible-ai/weborganizer-corpus-200b-tokenized`. La innovacion no esta en la arquitectura (deliberadamente minima, para abaratar el barrido experimental) sino en el diseno: 512 mezclas distintas sobre 24 topicos WebOrganizer siguiendo un esquema "vertex", con la mezcla exacta de cada proxy almacenada en `mix_<i>/mix.json`. No se menciona en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Generacion de texto autoregresiva basica, en ingles, con calidad limitada por el tamano (29,2M de parametros).
- Modelado de lenguaje para investigacion de mezclas de datos: cada proxy actua como estimador del efecto de una mezcla concreta sobre el rendimiento.
- Comparacion controlada entre 512 configuraciones de datos con arquitectura y tokenizador identicos.
- Reproducibilidad del experimento LinMix: mezclas documentadas en `mix.json` y secuencias de entrenamiento publicadas.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo "thinking".
- Capacidad multilingue: solo ingles declarado.

## Casos de uso

- Investigacion sobre data mixing: entrenar o evaluar el efecto de distintas proporciones de dominios (24 topicos WebOrganizer) sobre el rendimiento de un modelo, usando los proxies como senal barata antes de escalar a modelos grandes.
- Ajuste y validacion del metodo LinMix: los 512 proxies del diseno vertex permiten ajustar el modelo de atribucion lineal de dominios y medir su error de prediccion sobre mezclas no vistas.
- Seleccion de datasets en pipelines de preentrenamiento: estimar con proxies de 29,2M que combinacion de fuentes conviene priorizar antes de gastar presupuesto en un entrenamiento a gran escala.
- Reproduccion de resultados academicos: replicar las tablas y figuras del articulo LinMix a partir de los pesos y las mezclas publicadas.
- Docencia y experimentacion de bajo coste: cada proxy cabe en cualquier GPU consumer y permite ilustrar el impacto de la composicion del corpus en un modelo entrenado desde cero.
- Estudio de atribucion de dominios: analizar que topico contribuye en que medida a una capacidad concreta comparando proxies que difieren solo en la mezcla.
- Base para metodos de proxy modeling: usar los 512 checkpoints como banco de pruebas para tecnicas de prediccion de rendimiento (scaling laws, regresion sobre mezclas, etc.).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 29,2M de parametros en bfloat16 los pesos ocupan aproximadamente 58 MB por modelo, y en fp32 unos 117 MB. La activacion y el contexto anaden una cantidad marginal.
- GPU recomendadas: cualquier GPU moderna sirve; no se requiere A100 ni H100. Una RTX 4090, RTX 3090 o incluso una GPU integrada con suficiente memoria pueden ejecutar un proxy.
- Cabe en GPU consumer: si, en practicamente todas las GPU consumer actuales e incluso en CPU.
- Despliegue: transformers es la via documentada (`AutoModelForCausalLM` con `subfolder="mix_<i>"`). No se documentan recetas para vLLM, llama.cpp, Ollama ni TGI; al no publicarse pesos GGUF, llama.cpp y Ollama requeririan conversion previa.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano, se espera throughput muy alto y latencia de milisegundos en GPU, pero no hay cifras publicadas.
- Nota de almacenamiento: el repositorio completo son unos 30 GB (512 checkpoints). Para cargar muchos modelos conviene descargar el repo una vez con `snapshot_download` y reutilizar los ficheros locales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| olmo2-30M-24domains-vertex | 29,2 M (x512) | no disponible | Proxies para investigacion de data mixing | MIT | Hugging Face |
| OLMo 2 (modelos oficiales de AI2) | 7B y 13B (segun variante) | no disponible en esta ficha | Modelos de lenguaje de proposito general | Apache 2.0 (segun version) | Hugging Face |
| Pythia (EleutherAI) | 70M a 12B | 2048 tokens (segun variante) | Suite para interpretabilidad y estudio de entrenamiento | Apache 2.0 | Hugging Face |
| GPT-NeoX-20B (tokenizador reutilizado) | 20B | 2048 tokens | Modelo de proposito general | Apache 2.0 | Hugging Face |

La comparacion directa es limitada: los proxies de credible-ai no compiten en calidad de generacion con OLMo 2, Pythia o GPT-NeoX, sino que cubren una funcion distinta (barrido controlado de mezclas de datos). Frente a Pythia, que ofrece una suite de tamanos para estudiar entrenamiento e interpretabilidad, este repositorio ofrece 512 variantes de datos con arquitectura fija.

## Limitaciones y advertencias

- No es un modelo de produccion: con 29,2M de parametros y 4 capas, la calidad de generacion es muy limitada y no debe usarse para tareas de usuario final.
- Entrenado exclusivamente en ingles; no hay soporte multilingue declarado.
- Longitud de contexto no documentada; no debe asumirse una ventana larga.
- Riesgo alto de alucinacion y de texto incoherente por el reducido tamano y el entrenamiento corto (1.000 millones de tokens).
- Sesgos heredados del corpus: los datos provienen de Common Crawl via DCLM 1b-1x y WebOrganizer, con los sesgos propios de la web rastreada.
- Restricciones de licencia: los pesos son MIT, pero los datos de entrenamiento estan sujetos a CC-BY-4.0 (DCLM) y a los terminos de uso de Common Crawl; conviene revisar esas condiciones antes de un uso derivado.
- El repositorio pesa unos 30 GB; descargar solo las mezclas necesarias con `allow_patterns` para evitar transferencias innecesarias.
- Orientado a investigacion: su valor esta en el diseno experimental (512 mezclas documentadas), no en capacidades funcionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/credible-ai/olmo2-30M-24domains-vertex
- Dataset de diseno, resultados y secuencias de entrenamiento: https://huggingface.co/datasets/credible-ai/linmix-proxy-swarms
- Dataset de secuencias tokenizadas: https://huggingface.co/datasets/credible-ai/weborganizer-corpus-200b-tokenized
- Dataset de origen: https://huggingface.co/datasets/WebOrganizer/Corpus-200B
- Pool DCLM 1b-1x: https://huggingface.co/datasets/mlfoundations/dclm-pool-1b-1x
- Codigo: https://github.com/credibleai/linmix
- OLMo-core: https://github.com/allenai/OLMo-core
- Tokenizador GPT-NeoX-20B: https://huggingface.co/EleutherAI/gpt-neox-20b
- Documentacion de OLMo 2 en transformers: https://huggingface.co/docs/transformers/model_doc/olmo2
- Paper LinMix: https://arxiv.org/abs/2610.37390
- Terminos de uso de Common Crawl: https://commoncrawl.org/terms-of-use
