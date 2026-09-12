# changh95/exaone-4.5-33b-p150x8

## Resumen

Este repositorio, `changh95/exaone-4.5-33b-p150x8`, no es un modelo nuevo, sino un paquete de despliegue (contenedor) que sirve el modelo EXAONE-4.5-33B de LG AI Research sobre hardware Tenstorrent. Concretamente, empaqueta el modelo denso de 33.000 millones de parametros para ejecutarse en ocho placas Tenstorrent Blackhole P150 en una malla logica 1x8 con paralelismo tensorial (TP=8), usando vLLM 0.25.1 a traves del plugin de Tenstorrent. El objetivo es ofrecer un servidor compatible con la API de OpenAI sobre aceleradores no-GPU, con una ventana de contexto de 131.072 tokens y hasta 32 secuencias concurrentes.

El modelo subyacente, LGAI-EXAONE/EXAONE-4.5-33B, es un transformer denso de 33B con atencion hibrida (sliding-window combinada con atencion global) y orientado a razonamiento, con el modo "thinking" activado por defecto. El repositorio de `changh95` aporta el empaquetado reproducible (imagen Docker, manifiesto de `tt-model-manager` 0.1.0 y datos de rendimiento medidos), mientras que los pesos se descargan aparte desde el repositorio oficial de LG AI Research.

Es relevante ahora porque documenta, con cifras medidas, el rendimiento de servir un LLM de 33B de contexto largo sobre aceleradores Tenstorrent Blackhole, una alternativa a las pilas habituales basadas en GPU de NVIDIA. La model card incluye tablas de throughput agregado, decodificacion por usuario y tiempo hasta el primer token en funcion del numero de usuarios concurrentes y del tamano de prompt.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atencion hibrida (sliding-window + atencion global) |
| Parametros totales | 33.000 millones (33B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 131.072 tokens (131K) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible en el repositorio; el modelo base LGAI-EXAONE/EXAONE-4.5-33B tiene su propia licencia |
| Formato de pesos | pesos del modelo base descargados aparte desde HuggingFace (revision `570aa4b15a4f45ba1133072b45f50198f6e3b4fd`); el repositorio (1,7 GB) contiene el contenedor y el codigo, no los pesos |
| Hardware objetivo | 8 placas Tenstorrent Blackhole P150 (malla `P150x8`, TP=8) |
| Usuarios concurrentes maximos | 32 |
| Memoria de cache KV del perfil | ~133.000 tokens |
| Servidor | API compatible con OpenAI en el puerto 20000 (o el siguiente libre) |
| Empaquetado | tt-model-manager 0.1.0, manifest schema 5.1; vLLM 0.25.1 + vllm-tt-plugin |

## Arquitectura y entrenamiento

El modelo base es EXAONE-4.5-33B de LG AI Research: un transformer denso de 33.000 millones de parametros que emplea atencion hibrida, combinando ventanas deslizantes (sliding-window attention) con capas de atencion global. Este diseno reduce el coste computacional y de memoria en secuencias muy largas, lo que permite sostener la ventana de 131.072 tokens declarada. Es un modelo orientado a razonamiento, con el modo de pensamiento ("thinking") activado por defecto, lo que implica que genera cadenas de razonamiento antes de la respuesta final salvo que se desactive explicitamente.

Sobre el entrenamiento no se aporta informacion en la model card de este repositorio: no se detallan el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF, DPO u otras tecnicas de alineacion. La ficha tecnica disponible se centra en el empaquetado y en el rendimiento de inferencia, no en el proceso de entrenamiento del modelo base. La innovacion destacable documentada aqui es de despliegue: servir un modelo denso de 33B con contexto de 131K sobre ocho aceleradores Blackhole P150 mediante paralelismo tensorial y un plugin de vLLM, con soporte para decodificacion greedy y batching concurrente.

## Capacidades

- Generacion de texto y razonamiento: el modelo base esta disenado como modelo de razonamiento, con modo de pensamiento activado por defecto.
- Contexto largo: procesa hasta 131.072 tokens, adecuado para documentos extensos y conversaciones multi-turno largas.
- Servicio concurrente: el perfil soporta hasta 32 secuencias simultaneas con batching continuo gestionado por el planificador de vLLM.
- API compatible con OpenAI: el contenedor expone un endpoint en el puerto 20000, lo que facilita integrarlo en herramientas que ya hablan el esquema de OpenAI.
- Codigo, matematicas y tool calling: no se documentan en la model card de este repositorio (la informacion disponible solo confirma generacion de texto y razonamiento).
- Capacidades multimodales, de audio o de vision: no disponibles en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Servicio de inferencia on-premise sobre hardware Tenstorrent: el contenedor levanta un servidor compatible con OpenAI con `tt-model serve` y permite servir EXAONE-4.5-33B sin depender de GPUs de NVIDIA, util en entornos con aceleradores Blackhole ya desplegados.
- Atencion al cliente automatizada multi-turno: el modelo puede gestionar conversaciones extensas gracias a los 131.072 tokens de contexto y a las 32 secuencias concurrentes, manteniendo historial largo sin truncar.
- Procesamiento de documentos largos: con 131K de contexto, es viable resumir, extraer informacion o responder preguntas sobre informes, expedientes o contratos completos en una sola pasada.
- Razonamiento asistido y analisis: el modo de pensamiento por defecto lo hace adecuado para tareas que requieren descomposicion paso a paso, como analisis de datos o resolucion de problemas.
- Backends de alto rendimiento con carga agregada: con 32 usuarios concurrentes alcanza alrededor de 857 tokens/s agregados en prompts de 128 tokens, lo que permite atender picos de trafico moderados en una sola instancia.
- Evaluacion y validacion de hardware: sirve como referencia reproducible para medir el rendimiento real de la malla P150x8 sirviendo un LLM de 33B, con cifras de latencia y throughput ya publicadas.
- Despliegues con requisitos de residencia de datos: al ejecutarse en hardware propio y con pesos descargados localmente, encaja en escenarios donde no se permite enviar datos a APIs externas.
- Prototipado de aplicaciones compatibles con OpenAI: al exponer una API tipo OpenAI, se puede conectar a frameworks existentes cambiando unicamente la URL base y el modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los datos que si se aportan son de rendimiento de inferencia del contenedor sobre 8 placas Blackhole P150 (TP=8), con vLLM 0.25.1, decodificacion greedy, medidos el 2026-09-11. Cada celda representa un numero de usuarios concurrentes y un par de tokens de entrada/salida por usuario.

Decodificacion por usuario, tokens por segundo:

| usuarios \ in/out | 128/128 | 128/1024 | 1024/128 | 2048/128 | 4096/128 | 8192/128 | 8192/1024 | 16384/128 | 32768/128 |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 29,6 | 29,2 | 28,8 | 28,1 | 26,4 | 25,4 | 25,5 | 24,1 | 21,6 |
| 2 | 29,4 | 29,2 | 28,8 | 28,0 | 25,9 | 25,3 | 25,0 | 23,6 | 21,2 |
| 4 | 25,9 | 24,9 | 25,1 | 24,3 | 22,7 | 22,5 | 22,1 | 21,3 | 19,7 |
| 8 | 24,3 | 24,4 | 23,3 | 22,5 | 21,4 | 20,4 | 20,8 | 19,5 | 18,8 |
| 16 | 26,8 | 24,5 | 23,9 | 23,2 | 21,7 | 20,5 | 20,2 | 20,0 | 19,4 |
| 32 | 26,8 | 26,6 | 25,8 | 24,8 | – | – | – | – | – |

Throughput agregado de decodificacion, tokens por segundo:

| usuarios \ in/out | 128/128 | 128/1024 | 1024/128 | 2048/128 | 4096/128 | 8192/128 | 8192/1024 | 16384/128 | 32768/128 |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 30 | 29 | 29 | 28 | 26 | 25 | 25 | 24 | 22 |
| 2 | 59 | 58 | 58 | 56 | 52 | 51 | 50 | 47 | 42 |
| 4 | 104 | 100 | 100 | 97 | 91 | 90 | 89 | 85 | 79 |
| 8 | 194 | 195 | 186 | 180 | 171 | 163 | 166 | 156 | 150 |
| 16 | 429 | 392 | 383 | 371 | 346 | 328 | 323 | 320 | 310 |
| 32 | 857 | 852 | 826 | 793 | – | – | – | – | – |

Tiempo hasta el primer token, media por usuario, ms:

| usuarios \ in/out | 128/128 | 128/1024 | 1024/128 | 2048/128 | 4096/128 | 8192/128 | 8192/1024 | 16384/128 | 32768/128 |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 65 | 65 | 158 | 260 | 488 | 1022 | 1013 | 2205 | 5177 |
| 2 | 135 | 121 | 274 | 497 | 941 | 2003 | 1999 | 4356 | 10379 |
| 4 | 275 | 271 | 696 | 1250 | 2313 | 4767 | 4725 | 10635 | 20954 |
| 8 | 572 | 533 | 1230 | 2237 | 4203 | 8778 | 8815 | 17872 | 35227 |
| 16 | 885 | 829 | 2572 | 8308 | 11736 | 16739 | 17079 | 30352 | 63794 |
| 32 | 2229 | 1680 | 5076 | 13886 | – | – | – | – | – |

Notas proporcionadas por el autor: el paso de decodificacion batch-1 del modelo desnudo es de ~28 ms (36 tok/s); en ejecuciones repetidas (cuatro arranques del servidor) la tasa batch-1 transmitida alterno entre dos regimenes, en torno a 23 y a 30 tok/s, a veces dentro del mismo arranque, sin causa identificada. Las cinco celdas de 32 usuarios con prompts de 4096 tokens o mas estan marcadas con – porque exceden la cache KV de ~133.000 tokens de este perfil y el planificador se bloqueo en lugar de encolar.

## Requisitos de hardware

- No esta pensado para GPU: el contenedor requiere 8 placas Tenstorrent Blackhole P150 en una malla logica 1x8 con TP=8. No se documenta ejecucion en A100, H100, RTX 4090 ni otras GPUs.
- No cabe en GPU de consumo: este paquete no tiene como objetivo hardware de consumo; la ejecucion se realiza sobre aceleradores Blackhole.
- Memoria de cache KV: el perfil dispone de unos 133.000 tokens de cache KV, limite que determina cuantas secuencias concurrentes de cada longitud caben (los lotes de 32 usuarios con prompts de 4096 tokens o mas no se pudieron medir por este motivo).
- Despliegue: se realiza con `tt-model pull ... --with-weights` y `tt-model serve ...` de tt-model-manager 0.1.0; el servidor es compatible con OpenAI en el puerto 20000.
- Pesos: se descargan aparte desde HuggingFace en la cache del usuario; no estan incluidos en la imagen (el repositorio pesa 1,7 GB y contiene el contenedor y el codigo).
- Primer arranque: compila kernels para el dispositivo, lo que tarda varios minutos; el servidor esta listo cuando registra `Application startup complete`.
- Latencia y throughput medidos: batch-1 de ~28 ms por token (~36 tok/s en el modelo desnudo; 23-30 tok/s transmitidos segun regimen); TTFT batch-1 de 65 ms con 128 tokens de entrada y 5.177 ms con 32.768 tokens; throughput agregado de hasta ~857 tok/s con 32 usuarios en prompts cortos.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de calidad ni de comparativas con modelos equivalentes en la informacion proporcionada. La comparacion que si puede establecerse es la de la propia pila de despliegue, con los siguientes datos disponibles y ausentes:

| Aspecto | exaone-4.5-33b-p150x8 (Tenstorrent) | Servicio equivalente en GPU (NVIDIA) |
|---|---|---|
| Modelo servido | EXAONE-4.5-33B (denso, 33B) | EXAONE-4.5-33B (denso, 33B) |
| Contexto | 131.072 tokens | 131.072 tokens (depende del despliegue) |
| Hardware | 8 x Blackhole P150, TP=8 | no disponible |
| Servidor | vLLM 0.25.1 + vllm-tt-plugin, API OpenAI | no disponible |
| Throughput agregado medido | hasta ~857 tok/s (32 usuarios, prompts cortos) | no disponible |
| Licencia | no disponible | no disponible |

Para modelos alternativos de la misma categoria (por ejemplo, otros transformers densos de ~32-33B con contexto largo) no se aportan parametros, contexto, rendimiento ni licencia en la informacion disponible, por lo que no se puede elaborar una comparativa numerica fiable.

## Limitaciones y advertencias

- Repositorio sin licencia declarada: la licencia del paquete no esta indicada; para uso comercial hay que remitirse a la licencia del modelo base LGAI-EXAONE/EXAONE-4.5-33B, que no se detalla aqui.
- Dependencia de hardware especifico: solo funciona sobre 8 placas Tenstorrent Blackhole P150; no es portable a GPU ni a configuraciones menores sin cambios.
- Limite de cache KV: con ~133.000 tokens de cache, ciertos lotes concurrentes de prompt largo (32 usuarios con 4096 tokens o mas) exceden la capacidad y el planificador se bloquea en lugar de encolar, lo que puede provocar fallos en produccion.
- Variabilidad de rendimiento: en pruebas repetidas la tasa batch-1 alterno entre ~23 y ~30 tok/s incluso dentro del mismo arranque, sin causa identificada; conviene medir en el entorno propio antes de fijar expectativas de latencia.
- Arranque lento: el primer inicio compila kernels para el dispositivo y tarda varios minutos, lo que complica el escalado elastico y los reinicios rapidos.
- Sin datos de calidad: no hay benchmarks de exactitud, codigo ni matematicas, por lo que no puede evaluarse la calidad de las respuestas frente a alternativas.
- Riesgo de alucinacion: como cualquier modelo generativo, y sin datos de evaluacion especificos, existe riesgo de respuestas incorrectas o inventadas, especialmente en tareas factuales.
- Modo thinking por defecto: al ser un modelo de razonamiento con pensamiento activado, el consumo de tokens de salida y la latencia pueden ser mayores de lo esperado si no se desactiva.
- Idiomas y sesgos: no se declaran idiomas soportados ni se documentan sesgos conocidos en la informacion disponible.
- Pesos no incluidos en la imagen: hay que descargarlos por separado de HuggingFace, lo que anade un paso de red y dependencia de disponibilidad del repositorio de origen.
- Resultados de busqueda web no relevantes: las consultas realizadas no devolvieron informacion util sobre el modelo ni sobre su pila de despliegue.

## Enlaces

- Repositorio HuggingFace del paquete: https://huggingface.co/changh95/exaone-4.5-33b-p150x8
- Modelo base en HuggingFace: https://huggingface.co/LGAI-EXAONE/EXAONE-4.5-33B
- tt-model-manager: https://github.com/tenstorrent/tt-model-manager
- Commit de tt-metal: https://github.com/tenstorrent/tt-metal/commit/39a7870be5d4063e0009a241b54f16f9265bc048
- Release de vLLM v0.25.1: https://github.com/vllm-project/vllm/releases/tag/v0.25.1
- Commit del plugin vllm-tt-plugin (rama `solar-fixes`): https://github.com/changh95/vllm-tt-plugin/commit/ba73d09d69766de64f345e84b08c36c4da51862b
- Resultados de busqueda web: no se encontraron enlaces relevantes sobre este modelo o su despliegue.
