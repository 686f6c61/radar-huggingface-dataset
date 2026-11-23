# aisingapore/Qwen-SEA-LION-v5-9B-SpecDecoder

## Resumen

Qwen-SEA-LION-v5-9B-SpecDecoder es un modelo borrador (*draft model*) disenado especificamente para decodificacion especulativa sobre el modelo objetivo `aisingapore/Qwen-SEA-LION-v5-9B`, un LLM de 9B parametros orientado a las lenguas del sudeste asiatico. Lo desarrolla el pilar de productos de IA de AI Singapore, con financiacion de la National Research Foundation de Singapur, y forma parte de la coleccion SEA-LION v5. No es un modelo generativo autonomo: su funcion es proponer arboles de tokens candidatos que el modelo objetivo verifica en una sola pasada, acelerando la inferencia sin alterar la distribucion de salida del modelo grande.

Tecnicamente implementa la arquitectura EAGLE-4: una cabeza autoregresiva de una sola capa que lee los estados ocultos de tres capas del modelo objetivo y genera un arbol de candidatos con parametros configurables (`node_top_k`, `tree_depth`, `max_verify_width`). El checkpoint publicado contiene 2.385.342.464 parametros en formato safetensors (4.8 GB en el repositorio), lo que lo convierte en una pieza ligera en comparacion con los 9B del modelo que acelera.

Su relevancia es practica: en las evaluaciones publicadas por el autor, el uso conjunto con el modelo objetivo multiplica el throughput entre 2,3 y 3,1 veces respecto a la linea base, y supera a alternativas como MTP o el borrador por difusion `z-lab/Qwen3.5-9B-DFlash` en todos los conjuntos de datos medidos, incluidas las nueve lenguas del sudeste asiatico cubiertas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EAGLE-4: cabeza borradora autoregresiva de una capa con arbol de borrador, sobre estados ocultos de 3 capas del modelo objetivo |
| Parametros totales | 2.385.342.464 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo objetivo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh, my, id, fil, ms, ta, th, vi (birmano, chino, ingles, indonesio, filipino, malayo, tamil, tailandes, vietnamita) |
| Licencia | MIT |
| Formato de pesos | safetensors (formato llama) |

## Arquitectura y entrenamiento

El borrador es un modelo EAGLE-4 de una sola capa autoregresiva que consume los estados ocultos de tres capas del modelo objetivo `Qwen-SEA-LION-v5-9B` y produce un arbol de tokens candidatos. El modelo objetivo verifica ese arbol completo en una unica pasada, de modo que la salida final es siempre la del modelo grande; el borrador solo influye en la velocidad, nunca en la calidad ni en la distribucion de probabilidad. La configuracion de referencia usa `node_top_k = 4`, `tree_depth = 14` y `max_verify_width = 16`.

El entrenamiento tuvo dos etapas. En la primera se entreno el backbone EAGLE-4 con pesos inicializados aleatoriamente junto con una LM head inicializada a partir de la del modelo objetivo. En la segunda se entreno una LM head eficiente inicializada mediante descomposicion en valores singulares (SVD) de la LM head de la primera etapa. Los datos de entrenamiento provienen de tres conjuntos: `aisingapore/SEA-Instruct-2602`, `nvidia/Nemotron-SFT-Math-v4` y `nvidia/Nemotron-SFT-Competitive-Programming-v2`, lo que explica su buen comportamiento en tareas de matematicas y codigo ademas de en las lenguas del sudeste asiatico.

## Capacidades

- Aceleracion de inferencia mediante decodificacion especulativa con verificacion por el modelo objetivo.
- Generacion de arboles de tokens candidatos con parametros de arbol configurables (profundidad, top-k por nodo, anchura maxima de verificacion).
- Cobertura de nueve idiomas: birmano, chino, ingles, indonesio, filipino, malayo, tamil, tailandes y vietnamita.
- Rendimiento destacado en tareas de razonamiento matematico (gsm8k, math500) y generacion de codigo (humaneval, mbpp).
- Integracion con servidores compatibles con la API de OpenAI a traves del fork EAGLE-4 de vLLM.
- No soporta generacion autonoma, tool calling, vision ni audio por si mismo: hereda las capacidades del modelo objetivo.

## Casos de uso

- Despliegue de alto throughput de Qwen-SEA-LION-v5-9B en produccion: al emparejar el borrador con el modelo objetivo en vLLM se obtienen entre 2,3 y 3,1 veces mas tokens por segundo, lo que reduce coste por peticion en servicios de chat multiusuario.
- Atencion al cliente en lenguas del sudeste asiatico: el borrador acelera respuestas en birmano, tamil o tailandes, idiomas donde el throughput del modelo objetivo cae y donde el borrador mantiene longitudes de aceptacion superiores a 4 tokens.
- Generacion de codigo asistida: en humaneval y mbpp el borrador alcanza 485,7 y 474,4 tokens por segundo respectivamente, adecuado para autocompletado en IDE o pipelines de CI/CD que necesiten latencia baja.
- Tutoria matematica automatizada: en gsm8k y math500 logra 526,2 y 536,8 tokens por segundo, util para sistemas que resuelven problemas paso a paso con razonamiento extendido.
- Servicio de inferencia multilingue con SLA estricto: al ser un componente ligero (2,4B parametros) y con licencia MIT, puede desplegarse junto al modelo objetivo en una sola GPU sin coste de licencia adicional.
- Evaluacion comparativa de tecnicas de decodificacion especulativa: sirve como referencia reproducible (EAGLE-4 frente a MTP y borradores por difusion) para equipos que investiguen optimizacion de inferencia.

## Benchmarks y rendimiento

Resultados publicados por el autor a concurrencia 1, expresados como throughput en tokens por segundo / longitud de aceptacion. Temperatura 1.0, top_k 20, top_p 0.95, thinking activado, maximo 4096 tokens generados.

| Dataset | Baseline | w/ MTP | w/ DFlash | w/ SpecDecoder |
|---|---|---|---|---|
| gsm8k | 195,2 | 357,2 / 3,032 | 415,2 / 3,532 | 526,2 / 4,456 |
| math500 | 195,4 | 368,5 / 3,113 | 464,6 / 3,858 | 536,8 / 4,469 |
| humaneval | 194,9 | 326,6 / 2,755 | 380,2 / 3,129 | 485,7 / 3,953 |
| mbpp | 194,2 | 331,5 / 2,801 | 388,8 / 3,228 | 474,4 / 3,861 |
| mt-bench | 195,3 | 335,5 / 2,837 | 372,2 / 3,066 | 441,5 / 3,487 |
| Birmano | 194,7 | 370,5 / 3,071 | 320,5 / 2,645 | 557,6 / 4,523 |
| Filipino | 195,2 | 378,7 / 3,136 | 423,5 / 3,497 | 601,1 / 4,926 |
| Indonesio | 194,9 | 329,1 / 2,727 | 336,6 / 2,777 | 457,6 / 3,598 |
| Malayo | 195,2 | 349,7 / 2,900 | 370,6 / 3,060 | 497,1 / 3,982 |
| Tamil | 194,6 | 358,4 / 2,970 | 346,5 / 2,857 | 537,0 / 4,319 |
| Tailandes | 195,0 | 341,6 / 2,833 | 291,7 / 2,412 | 465,8 / 3,706 |
| Vietnamita | no disponible | no disponible | no disponible | no disponible |

## Requisitos de hardware

- El borrador ocupa 4,8 GB en safetensors y debe cargarse junto al modelo objetivo de 9B; el consumo total de VRAM depende del modelo objetivo y del backend de atencion.
- El ejemplo oficial de despliegue usa `--tensor-parallel-size 1`, por lo que una sola GPU de gama alta (A100 80 GB, H100, o una RTX 4090 de 24 GB con cuantizacion del objetivo) es suficiente para el conjunto.
- El despliegue requiere el fork EAGLE-4 de vLLM (`github.com/eagle-hq/vllm`), con `--load-format instanttensor`, `--attention-backend CUSTOM` y `--linear-backend flashinfer_cutedsl`; no se documenta soporte en llama.cpp, Ollama ni TGI.
- Throughput estimado segun benchmarks del autor: entre 441 y 601 tokens por segundo a concurrencia 1, frente a unos 195 del modelo objetivo sin aceleracion.
- La aceleracion depende del prompt, el idioma y la concurrencia; no se publican datos para concurrencias superiores a 1.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Throughput (gsm8k) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-SEA-LION-v5-9B-SpecDecoder | EAGLE-4 draft | 2,39B | 526,2 tok/s | MIT | Hugging Face |
| MTP integrado en el objetivo | Multi-token prediction | no disponible | 357,2 tok/s | heredada del objetivo | integrado en vLLM |
| z-lab/Qwen3.5-9B-DFlash | Borrador por difusion | no disponible | 415,2 tok/s | no disponible | Hugging Face |

## Limitaciones y advertencias

- No es un modelo autonomo: solo propone tokens y debe usarse siempre con `aisingapore/Qwen-SEA-LION-v5-9B`; la calidad, los sesgos y la seguridad son los del modelo objetivo.
- La aceleracion varia segun prompt, idioma y concurrencia; el autor solo publica mediciones a concurrencia 1.
- Requiere un fork especifico de vLLM (EAGLE-4) y backends concretos (`CUSTOM`, `flashinfer_cutedsl`), lo que limita la portabilidad frente a despliegues estandar.
- No se documentan tipos de cuantizacion ni soporte en llama.cpp u Ollama.
- Licencia MIT permite uso comercial, pero conviene revisar la licencia y condiciones del modelo objetivo, que es quien genera el contenido final.
- Cobertura linguistica limitada a las nueve lenguas declaradas; no se garantiza comportamiento fuera de ellas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aisingapore/Qwen-SEA-LION-v5-9B-SpecDecoder
- Modelo objetivo: https://huggingface.co/aisingapore/Qwen-SEA-LION-v5-9B
- Coleccion SEA-LION v5: https://huggingface.co/collections/aisingapore/sea-lion-v5
- Sitio de SEA-LION: https://sea-lion.ai
- Fork EAGLE-4 de vLLM: https://github.com/eagle-hq/vllm
- Quickstart EAGLE-4 para vLLM: https://github.com/eagle-hq/EAGLE-4/blob/main/docs/quickstart-vllm.md
- Fork vLLM usado para baseline y MTP: https://github.com/nagarajankarthik/vllm/tree/qwen4_exp_dflash_merge
- Dataset SEA-Instruct-2602: https://huggingface.co/datasets/aisingapore/SEA-Instruct-2602
- Dataset Nemotron-SFT-Math-v4: https://huggingface.co/datasets/nvidia/Nemotron-SFT-Math-v4
- Dataset Nemotron-SFT-Competitive-Programming-v2: https://huggingface.co/datasets/nvidia/Nemotron-SFT-Competitive-Programming-v2
- Licencia MIT: https://mit-license.org/
