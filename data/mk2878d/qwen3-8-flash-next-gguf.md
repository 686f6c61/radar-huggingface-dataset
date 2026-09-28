# mk2878d/Qwen3.8-Flash-Next-GGUF

## Resumen

Qwen3.8-Flash-Next es un modelo de lenguaje de arquitectura MoE y caracter multimodal, con 176.943.899.520 parametros totales (177B), publicado por el equipo Qwen como el primer lanzamiento de pesos abiertos de la arquitectura que hay detras de Qwen4, segun la model card del cuantizador. La ficha que nos ocupa no es el modelo original, sino una recuantizacion en formato GGUF del repositorio `Qwen/Qwen3.8-Flash-Next`, subida por el usuario `mk2878d` y generada con la importancia matrix propia de AtomicChat. El repositorio ocupa 236,9 GB y, en el momento de la consulta, acumula 0 descargas y 0 likes, por lo que se trata de una copia practicamente sin traccion.

El problema que aborda esta publicacion es de infraestructura, no de capacidad: la model card afirma que un cuantizado de 85 GB puede ejecutarse en un Apple M5 Max con 64 GB de memoria, con vision incluida y a 36 tok/s. La razon es que 51B de los 177B de parametros no son pesos convencionales, sino una tabla de busqueda n-gram de 39 GB que se lee desde SSD mediante mmap y que permanece fuera de la memoria de la GPU.

La relevancia actual es doble: por un lado, permite inferencia de un modelo de 177B en hardware de consumidor de gama alta; por otro, sus builds estan empaquetados de forma especifica (la tabla va en su propio shard GGUF) para evitar el fallo de asignacion de memoria de Metal cuando el mmap de un shard con tensores de GPU se fija entero. No se dispone de datos de contexto maximo, idiomas soportados ni benchmarks estandar en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con tabla de busqueda n-gram y soporte multimodal (vision) |
| Parametros totales | 176.943.899.520 (177B); 51B corresponden a la tabla n-gram |
| Parametros activos | no disponible de forma oficial; la model card indica que los expertos tocan aproximadamente 6B de parametros por token |
| Longitud de contexto | no disponible; los ejemplos de ejecucion publicados usan `-c 32768` |
| Tipos de cuantizacion | `AD-3.84bpw-IQ4_XS-M64`, `AD-4.27bpw-Q4_K_M-M64`, `AD-5.00bpw-Q5_K_M-M64`; `mmproj-...-F16.gguf` para vision; `imatrix.gguf` (matriz de importancia) |
| Idiomas soportados | no disponible |
| Licencia | `qwen-community-1.0` (etiquetada como `other` en HuggingFace) |
| Formato de pesos | GGUF (este repositorio, dividido en 33 shards para el build de 4,27 bpw); safetensors en el modelo base |

## Arquitectura y entrenamiento

La model card describe una arquitectura MoE con un componente poco habitual: 51B de los 177B de parametros forman una tabla de busqueda n-gram. El modelo calcula un hash de los ultimos tres tokens y ese hash apunta a 16 filas de 160 valores cada una, lo que supone unos 2,7 KB por token y una sola lectura por pasada forward sobre una tabla de 39 GB. Esa relacion de lectura es de aproximadamente 1 entre 13 millones, en una direccion determinista, lo que a 36 tok/s equivale a unos 3 MB/s de lecturas aleatorias que NVMe resuelve en menos de 100 microsegundos frente a un presupuesto de 28 ms por token. Los n-gramas frecuentes permanecen ademas en la cache de paginas. El propio autor contrasta esto con los expertos del MoE, que mueven gigabytes de trafico por token y por tanto no son viables desde disco.

El repositorio contiene unicamente cuantizaciones; no se proporcionan en la informacion disponible datos sobre tokens de entrenamiento, composicion del dataset, ni si hubo RLHF, DPO u otras fases de alineamiento del modelo base. La innovacion tecnica documentada aqui es de empaquetado y cuantizacion: la importancia matrix se calculo sobre pesos BF16 (nunca sobre un proxy cuantizado), con 4000 chunks a 512 de contexto, un corpus de 4.967.044 tokens y 3.004 documentos, 926 tensores y 3 horas y 8 minutos de computo, con huecos de cobertura en `blk.0` (98,83%) y `blk.47` (99,80%). Todos los builds se dividen de forma que el shard 2 contiene exclusivamente la tabla n-gram, requisito imprescindible en Apple Silicon: llama.cpp entrega a Metal la region mmap completa de cualquier shard con tensores de GPU, de modo que una tabla intercalada con pesos se fijaria en memoria y provocaria `kIOGPUCommandBufferCallbackErrorOutOfMemory` en el primer decode.

## Capacidades

- Generacion de texto conversacional (pipeline declarado: `text-generation`).
- Razonamiento y generacion de codigo: no hay benchmarks publicados en la informacion disponible que lo confirmen cuantitativamente.
- Vision: el repositorio incluye un proyector multimodal (`mmproj-...-F16.gguf`) y los ejemplos de ejecucion usan `llama-mtmd-cli` con `--image-min-tokens 1024`; la model card afirma que el cuantizado de 85 GB corre "con vision" en un M5 Max de 64 GB.
- Soporte multimodal declarado en las etiquetas del repositorio (`multimodal`), aunque no se detallan las tareas concretas (VQA, OCR, descripcion de imagen, etc.).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking o cualquier capacidad especial adicional: no disponible.
- Ejecucion local en `llama.cpp` y en la aplicacion Atomic Chat, con mmap activado y `-fit off`.

## Casos de uso

- Inferencia local de un modelo de 177B en un portatil de gama alta: con el build `AD-4.27bpw`, 54,5 GB residen en memoria y 38,4 GB en SSD, de modo que un equipo con 64 GB unificados puede servir el modelo sin GPU dedicada. Es el escenario que documenta explicitamente la model card.
- Asistentes conversacionales de contexto largo en estacion de trabajo: los ejemplos publicados usan 32768 tokens de contexto con `--jinja`, lo que permite mantener historiales extensos sin reencuadrar la conversacion. Es adecuado cuando la privacidad impide enviar datos a una API.
- Procesamiento de documentos con imagen (vision): mediante `llama-mtmd-cli` y el proyector F16, el modelo puede recibir imagenes junto al texto, util para extraer informacion de capturas, formularios o diagramas en flujos locales.
- Despliegue en entornos sin conectividad o con requisitos de soberania del dato: al ser pesos GGUF ejecutables en local con `llama.cpp`, encaja en escenarios donde no se permite salida a Internet.
- Evaluacion y comparacion de tecnicas de cuantizacion: el repositorio publica tres builds con su KLD, coincidencia top-1 y ratio de perplejidad medidos contra la misma referencia, lo que sirve como material para estudiar el impacto de bpw en calidad.
- Laboratorio de investigacion sobre arquitecturas hibridas: la separacion entre expertos y tabla n-gram, y el hecho de que la tabla se pueda paginar desde disco, permiten experimentar con estrategias de offloading selectivo distintas del offloading clasico de expertos.
- Prototipado de producto con presupuesto de hardware limitado: si el caso de uso tolera 36 tok/s de generacion, un unico equipo de 64 GB sustituye a un nodo con varias GPU, lo que reduce coste de puesta en marcha para demos internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Lo unico medido es la calidad de las cuantizaciones y el rendimiento de inferencia, contra una unica referencia: los logits del propio modelo BF16 sobre un conjunto neutral reservado, 87 chunks a 4096 de contexto, con una perplejidad BF16 de 4,0445 ± 0,0216.

| Build | En memoria | En SSD | Total | KLD medio | Misma top-1 | Ratio PPL |
|---|---|---|---|---|---|---|
| `AD-3.84bpw-IQ4_XS-M64` | 45,8 GB | 39,1 GB | 84,9 GB | 0,2277 | 82,68% | 1,102 |
| `AD-4.27bpw-Q4_K_M-M64` | 54,5 GB | 38,4 GB | 92,9 GB | 0,0842 | 89,49% | 1,026 |
| `AD-5.00bpw-Q5_K_M-M64` | 56,1 GB | 54,4 GB | 110,5 GB | 0,0837 | 89,55% | 1,026 |

Rendimiento de inferencia medido en un Apple M5 Max de 64 GB con el build de 4,27 bpw: `pp512` 517,9 tok/s y `tg128` 36,0 tok/s. La perplejidad sobre el conjunto de calibracion de la importancia matrix es de 4,6812 ± 0,0155.

## Requisitos de hardware

- Memoria en GPU (segun el publicador): 45,8 GB para `AD-3.84bpw`, 54,5 GB para `AD-4.27bpw` y 56,1 GB para `AD-5.00bpw`. Estas cifras excluyen la tabla n-gram, que permanece en SSD.
- Almacenamiento: 84,9 GB, 92,9 GB y 110,5 GB respectivamente, o 236,9 GB para el repositorio completo. El modelo necesita que el fichero este en un disco con latencias de lectura bajas (NVMe en el caso medido), ya que la tabla se lee en cada pasada forward.
- Hardware verificado: Apple M5 Max con 64 GB de memoria unificada, con `sudo sysctl iogpu.wired_limit_mb=57344` y mmap activado.
- GPU de consumidor: no hay mediciones publicadas en CUDA. Por aritmetica de los datos publicados, los builds de 4,27 y 5,00 bpw no caben en una unica GPU de consumidor de 24 GB y requeririan agregados de 48-56 GB de VRAM (por ejemplo, varios adaptadores o una GPU profesional); el build de 3,84 bpw queda en 45,8 GB. Estas cifras son una estimacion derivada, no una medicion.
- GPU profesionales: no disponible. No se han publicado pruebas en A100, H100 u otras.
- Opciones de despliegue: `llama.cpp` (en una build con soporte para Qwen3.8-Flash-Next), `llama-cli`, `llama-mtmd-cli` para vision, y la aplicacion Atomic Chat. Necesita `--jinja` y `-fit off`; no debe usarse `--load-mode none` porque rompe la paginacion de la tabla. No hay soporte confirmado en vLLM, TGI, Ollama ni otros servidores.
- Latencia y throughput: 517,9 tok/s de prefill y 36,0 tok/s de generacion en el M5 Max de 64 GB con el build de 4,27 bpw. No hay datos para otras plataformas.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada (ni parametros, ni contexto, ni benchmarks de alternativas de la misma categoria). La unica comparacion posible con los datos disponibles es interna, entre los propios builds y frente al modelo base:

| Version | Parametros | Formato | Tamano | Calidad (KLD / misma top-1 / ratio PPL) | Licencia |
|---|---|---|---|---|---|
| Base BF16 | 177B (51B en tabla n-gram) | safetensors | no disponible | referencia (PPL 4,0445 ± 0,0216) | `qwen-community-1.0` |
| `AD-4.27bpw-Q4_K_M-M64` | 177B | GGUF, 33 shards | 92,9 GB (54,5 GB en memoria) | 0,0842 / 89,49% / 1,026 | `qwen-community-1.0` |
| `AD-5.00bpw-Q5_K_M-M64` | 177B | GGUF | 110,5 GB (56,1 GB en memoria) | 0,0837 / 89,55% / 1,026 | `qwen-community-1.0` |
| `AD-3.84bpw-IQ4_XS-M64` | 177B | GGUF | 84,9 GB (45,8 GB en memoria) | 0,2277 / 82,68% / 1,102 | `qwen-community-1.0` |

La model card anade una comparacion cualitativa con builds de otros publicadores: estos mantienen la tabla n-gram dentro de los shards de pesos, por lo que el fichero completo debe residir en memoria, y sus cifras de calidad no se copiaron sino que se volvieron a medir en la misma maquina y con la misma referencia. No se identifican modelos alternativos de la misma categoria con datos verificables en la informacion disponible.

## Limitaciones y advertencias

- El repositorio analizado es una recarga de terceros (`mk2878d`) de cuantizaciones generadas por AtomicChat, con 0 descargas y 0 likes en el momento de la consulta. No hay verificacion independiente de los ficheros ni garantia de que coincidan bit a bit con los del publicador original.
- No hay benchmarks estandar publicados. Las unicas metricas de calidad son de cuantizacion (KLD, coincidencia top-1, ratio de perplejidad) y estan medidas contra una unica referencia de BF16, con 87 chunks a 4096 de contexto; no son extrapolables a otras tareas.
- Riesgo de alucinacion: no cuantificado en la informacion disponible para este modelo ni para sus cuantizaciones.
- Sesgos conocidos: no disponible. No se documenta composicion del dataset ni evaluaciones de sesgo.
- Idiomas soportados: no disponible. No se debe asumir cobertura multilingue.
- Longitud de contexto: no disponible. El valor de 32768 aparece solo como parametro de ejemplo en los comandos de ejecucion, no como limite certificado del modelo.
- Restricciones de licencia: la licencia es `qwen-community-1.0`, catalogada como `other` en HuggingFace y enlazada al fichero LICENSE del modelo base. Al ser una licencia de comunidad y no una licencia abierta estandar, es obligatorio revisar sus terminos antes de cualquier uso comercial; la informacion proporcionada no detalla condiciones ni umbrales.
- Dependencia de una version concreta de `llama.cpp` con soporte para Qwen3.8-Flash-Next. En el momento de publicacion, la model card indica que los cuantizados seguian subiendose y que el soporte se estaba desplegando progresivamente.
- Requisito de empaquetado fragil: si la tabla n-gram no queda aislada en su propio shard, el modelo puede fallar con `kIOGPUCommandBufferCallbackErrorOutOfMemory` en Apple Silicon. Ademas, `-fit off` es obligatorio porque el ajuste automatico de parametros de llama.cpp dimensiona mal esta arquitectura.
- Dependencia de disco: la viabilidad del despliegue depende de la latencia del SSD (menos de 100 microsegundos frente a un presupuesto de 28 ms por token). Un almacenamiento lento degrada directamente el throughput.
- Las lecturas desde disco introducen un perfil de I/O continuo (unos 3 MB/s medidos a 36 tok/s) que debe tenerse en cuenta en entornos con almacenamiento compartido o limitado.
- Se descarto la busqueda web asociada: los resultados devueltos no contenian ninguna informacion tecnica ni referencia util sobre el modelo.

## Enlaces

- Repositorio GGUF analizado: https://huggingface.co/mk2878d/Qwen3.8-Flash-Next-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Cuantizaciones del publicador original (AtomicChat): https://huggingface.co/AtomicChat/Qwen3.8-Flash-Next-GGUF
- Corpus de calibracion: https://huggingface.co/datasets/AtomicChat/calib-corpora
- Repositorio de Atomic Chat: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord del publicador: https://discord.gg/8wGSsvmg4V
- Sitio del publicador: https://atomic.chat/
- Paper, blog o demo oficial del modelo: no disponible en la informacion proporcionada.
