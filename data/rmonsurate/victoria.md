# rmonsurate/Victoria

## Resumen

Victoria es un modelo de lenguaje derivado de Qwen/Qwen3.8-Flash-Next, publicado por el desarrollador rmonsurate (Ryan Monsurate). Se trata de una version comprimida del modelo base: se eliminaron 224 de los 512 expertos por capa de la mezcla de expertos del original (una reduccion del 44%, hasta 288 expertos por capa) y el modelo resultante se reentreno en 4 bits con cuantizacion consciente de cuantizacion (QAT) para recuperar calidad. El resultado conserva 5,9 mil millones de parametros activos por token, los mismos que el modelo base, sobre un total de 125.573.716.608 parametros.

El objetivo es claro: rebajar el coste de despliegue sin perder capacidad de codigo y de agente. Victoria se distribuye en dos builds distintos que son checkpoints diferentes: uno en NVFP4 para vLLM sobre GPU NVIDIA Blackwell (B300 o B200) y otro en GGUF Q4_K_M para llama.cpp. El build NVFP4 alcanza un 70,0% en Terminal-Bench 2.1 (avg@3 sobre tres ejecuciones completas de las 89 tareas, con 8 horas por tarea) y un 97,0% en HumanEval (159/164), mientras que el build GGUF obtiene un 75,28% (67/89) en una unica ejecucion de Terminal-Bench 2.1 y un 93,2% avg@5 en HumanEval.

La relevancia actual del modelo esta en su enfoque combinado: poda de expertos, reentrenamiento en 4 bits y decodificacion especulativa con una cabeza draft (metodo MTP, 3 tokens especulativos), que permite decodificar 279,6 tokens por segundo en un solo flujo sobre una NVIDIA B300, 2,08 veces los 134,7 tok/s sin la cabeza. Esta licenciado bajo qwen-community-1.0 y solo declara soporte de ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) transformer; detalles de atencion no disponibles |
| Parametros totales | 125.573.716.608 (125,6 B) |
| Parametros activos | 5,9 B por token |
| Longitud de contexto | No declarada explicitamente en la informacion disponible; las configuraciones de referencia usan 20 480 tokens y hasta 262 144 tokens en sesiones de agente largas |
| Tipos de cuantizacion | NVFP4 (4 bits, QAT), GGUF Q4_K_M, tabla de lookup a 8 bits (tbl8) o precision completa |
| Idiomas soportados | Ingles (en) |
| Licencia | qwen-community-1.0 (license: other) |
| Formato de pesos | safetensors (build NVFP4) y GGUF (build Q4_K_M) |
| Expertos por capa | 288 (partiendo de 512 en el modelo base; poda del 44%) |
| Tamano del repositorio | 363,6 GB |
| Descargas / likes | 2803 / 13 |
| Fecha de creacion / actualizacion | 2026-09-21 / 2026-09-30 |
| Modelo base | Qwen/Qwen3.8-Flash-Next (finetune) |

## Arquitectura y entrenamiento

Victoria es un derivado comprimido de Qwen3.8-Flash-Next, un transformer con arquitectura de mezcla de expertos. El proceso de construccion tuvo dos fases: primero se podaron 224 expertos de los 512 de cada capa (hasta 288 por capa, un 44% menos) y despues el modelo se reentreno en 4 bits mediante cuantizacion consciente de cuantizacion, con el objetivo de restaurar la calidad perdida por la poda. El modelo mantiene la misma cantidad de parametros activos por token que el original (5,9 B), de modo que el coste computacional por token decodificado no cambia aunque el numero total de parametros se reduzca.

El modelo incorpora una cabeza draft entrenada para decodificacion especulativa con el metodo MTP, configurada con 3 tokens especulativos. En el build NVFP4 esa cabeza eleva el rendimiento de decodificacion de 134,7 a 279,6 tok/s en una B300, con un 2,08x de mejora. En el build GGUF, sobre un M3 Max de 128 GB y una peticion a la vez, la cabeza llevo la generacion de 26,8-27,8 tok/s a 34,3-38,0 tok/s, con un 70,4% de tokens draft aceptados. El modelo tambien emplea una tabla de lookup de n-gramas de 95,4 GiB, que en el build NVFP4 vLLM mantiene en la GPU junto a los pesos. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional y de codigo, con foco declarado en tareas de agente de programacion y de terminal.
- Razonamiento multi-paso: el ejemplo de despliegue de vLLM usa el parser de razonamiento qwen3 (`--reasoning-parser qwen3`), lo que indica soporte de modo de razonamiento.
- Tool calling y function calling: soporte nativo mediante el parser de llamadas a herramientas qwen3_coder (`--tool-call-parser qwen3_coder`), activable con `--enable-auto-tool-choice`.
- Uso como agente en entornos de terminal: evaluado en Terminal-Bench 2.1 sobre las 89 tareas del benchmark, con sesiones de agente largas de hasta 8 horas por tarea.
- Generacion de codigo verificada con HumanEval: 97,0% (159/164) en el build NVFP4 y 93,2% avg@5 en el build GGUF.
- Decodificacion especulativa integrada mediante cabeza draft MTP, con 3 tokens especulativos.
- Capacidades multilingues: solo ingles declarado. No se documentan capacidades de vision, audio ni otros idiomas.

## Casos de uso

- Agentes de programacion autonomos en terminal: el modelo esta evaluado especificamente en Terminal-Bench 2.1 con 89 tareas y sesiones de hasta 8 horas, por lo que encaja en flujos donde el agente ejecuta comandos, inspecciona ficheros y corrige errores de forma iterativa.
- Integracion en pipelines de CI/CD para reparacion automatica de fallos: gracias al soporte de tool calling (`--tool-call-parser qwen3_coder`) se puede conectar a herramientas de build, test y control de versiones mediante function calling.
- Asistente de codigo en produccion sobre una sola GPU: el build NVFP4 con 48,0 GiB de pesos y decodificacion a 279,6 tok/s por flujo sobre una B300 permite servir un asistente interactivo de baja latencia en un unico acelerador.
- Despliegue en estaciones de trabajo y portatiles con llama.cpp: el build GGUF Q4_K_M ocupa 49,17 GiB de pesos y se ejecuta en un M3 Max de 128 GB a 34,3-38,0 tok/s con la cabeza draft activa, lo que habilita entornos de desarrollo locales sin GPU de centro de datos.
- Revision de codigo y explicacion de repositorios con contexto largo: las ejecuciones de agente largo usaron `--max-model-len 262144 --max-num-seqs 64`, adecuado para analizar repositorios completos o trazas extensas en una sola ventana.
- Servicio conversacional tecnico en ingles: con `--max-num-seqs 16` y prefix caching, el modelo puede atender varias sesiones concurrentes de soporte a desarrolladores sobre una B300 o B200.
- Tareas de evaluacion comparativa de agentes: dado que los resultados se reportan con protocolo avg@3 y avg@5 sobre benchmarks publicos, sirve como referencia reproducible para comparar variantes de cuantizacion y poda de MoE.
- Base para derivados regionales: el propio autor construyo Maple, un modelo orientado a Canada, sobre Victoria, lo que demuestra su uso como punto de partida para ajustes posteriores.

## Benchmarks y rendimiento

| Benchmark | Build NVFP4 (vLLM) | Build GGUF Q4_K_M (llama.cpp) |
|---|---|---|
| Terminal-Bench 2.1 | 70,0% avg@3 (75,3 / 68,5 / 66,3), 8 h por tarea | 75,28% (67/89), una ejecucion |
| Terminal-Bench 2.1 (build NVFP4 anterior) | 62,5% | No aplica |
| HumanEval | 97,0% (159/164), una muestra por problema | 93,2% avg@5 |
| Tokens de salida usados (3 ejecuciones de Terminal-Bench) | 69,4 M (35% menos que el build NVFP4 anterior, 107,3 M) | No disponible |
| Decodificacion en una B300, un flujo | 279,6 tok/s con cabeza draft; 134,7 tok/s sin cabeza (2,08x) | No disponible en CUDA |
| Decodificacion en M3 Max 128 GB | No disponible | 26,8-27,8 tok/s sin cabeza; 34,3-38,0 tok/s con cabeza; 70,4% de tokens draft aceptados |

No hay datos publicados de MMLU, GSM8K ni de comparaciones directas con el modelo base Qwen3.8-Flash-Next en la informacion disponible.

## Requisitos de hardware

- Build NVFP4 (vLLM): 48,0 GiB de pesos mas la tabla de lookup de n-gramas de 95,4 GiB, que vLLM mantiene en la GPU; la descarga completa es de 154,0 GB (143,4 GiB) y el consumo residente en GPU es aproximadamente ese total.
- GPU recomendadas para NVFP4: NVIDIA B300 (donde se midieron los 279,6 tok/s) o NVIDIA B200, ambas con memoria suficiente para pesos y tabla de lookup en un solo dispositivo. No cabe en GPU de consumo.
- Build GGUF Q4_K_M: 52,79 GB (49,17 GiB) de pesos residentes; descarga de 107,20 GB con tabla a 8 bits o 155,20 GB con tabla a precision completa. La memoria de GPU es la misma en ambos casos.
- Ejecucion en hardware de consumo o Apple Silicon: verificado en un M3 Max con 128 GB. En GPU de consumo de 24 GB no entra por tamano de pesos; requiere al menos unos 50 GB de memoria unificada o VRAM agregada.
- Opciones de despliegue: vLLM (build NVFP4, requiere dos correcciones para el fallo de prefix caching en esta arquitectura: PR #53798 y PR #54076; sin ellas hay que omitir `--enable-prefix-caching`) y llama.cpp (build GGUF, requiere el binario parcheado de rmonsurate/llama.cpp-victoria, ya que el llama.cpp principal rechaza cargar los ficheros por los 32 tensores extra de la cabeza draft).
- Configuracion de referencia en vLLM: tensor-parallel-size 1, max-model-len 20480, max-num-seqs 16, max-num-batched-tokens 16384, gpu-memory-utilization 0,80, prefix caching activado, decodificacion especulativa MTP con 3 tokens. Para sesiones de agente largas: max-model-len 262144, max-num-seqs 64 y sin especulacion.
- Nota de despliegue: la configuracion de compilacion con autotuning de Triton en tiempo de compilacion es obligatoria (`"triton.autotune_at_compile_time":false`), porque de lo contrario el arranque se bloquea o se alarga en exceso.
- Throughput y latencia: 279,6 tok/s en un flujo sobre B300 con la cabeza draft; 34,3-38,0 tok/s en M3 Max de 128 GB con una peticion simultanea. Los resultados de Terminal-Bench en GGUF se midieron con 8 slots de 16 384 tokens de contexto repartidos en dos GPU y decodificacion especulativa desactivada.

## Comparativa con modelos similares

| Modelo | Parametros | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Victoria (build NVFP4) | 125,6 B | 5,9 B | No declarada; hasta 262 144 en configuracion de agente | qwen-community-1.0 | safetensors, vLLM sobre B300/B200 |
| Victoria (build GGUF Q4_K_M) | 125,6 B (pesos Q4_K_M: 49,17 GiB) | 5,9 B | No declarada; 16 384 por slot en las pruebas | qwen-community-1.0 | GGUF, llama.cpp parcheado |
| Qwen/Qwen3.8-Flash-Next (modelo base) | No disponible | 5,9 B (segun Victoria) | No disponible | No disponible en la informacion proporcionada | No disponible |
| Maple (derivado de Victoria) | No disponible | No disponible | No disponible | No disponible | Publicado por el mismo autor en HuggingFace |
| Build NVFP4 anterior de Victoria | 125,6 B | 5,9 B | No disponible | qwen-community-1.0 | Sustituido por el checkpoint actual; 62,5% en Terminal-Bench 2.1 |

No se dispone de datos de benchmarks del modelo base ni de otros modelos comparables de la misma categoria en la informacion proporcionada, por lo que la comparacion se limita a variantes del propio Victoria.

## Limitaciones y advertencias

- Idiomas: solo se declara ingles. No hay soporte documentado de castellano ni de otros idiomas, por lo que su uso en produccion multilingue no esta respaldado.
- Licencia: qwen-community-1.0, marcada como `license: other`. Es necesario revisar el fichero LICENSE antes de cualquier uso comercial, ya que las condiciones concretas no se detallan en la informacion proporcionada.
- La poda del 44% de los expertos puede degradar capacidades distintas de las medidas: los benchmarks publicados se centran en codigo y agentes de terminal (Terminal-Bench 2.1 y HumanEval), sin datos de conocimiento general, matematicas o multilingue.
- Varianza en los resultados: las tres ejecuciones de Terminal-Bench 2.1 del build NVFP4 fueron 75,3%, 68,5% y 66,3%, un rango de 9 puntos porcentuales. Un unico resultado no es representativo del rendimiento esperado.
- Consumo de memoria elevado: el build NVFP4 exige mantener en GPU 48,0 GiB de pesos mas 95,4 GiB de tabla de lookup (unos 143,4 GiB), lo que descarta su uso en GPU de consumo.
- Dependencias de software no mainline: el build GGUF no carga en llama.cpp principal (error de numero de tensores) y requiere el fork del autor; el build NVFP4 necesita dos correcciones de vLLM no fusionadas en el momento de la publicacion.
- Riesgo de alucinacion: no se documentan tasas de alucinacion ni evaluaciones de veracidad en la informacion disponible.
- Sesgos: no se documentan evaluaciones de sesgo o toxicidad.
- Contexto: la longitud de contexto entrenada no se declara explicitamente; los 262 144 tokens corresponden a la configuracion usada en las pruebas, no necesariamente al limite entrenado del modelo.
- Fechas de publicacion y actualizacion muy recientes (septiembre de 2026) y volumen de descargas moderado (2803), lo que implica poca validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rmonsurate/Victoria
- Arbol de ficheros del repositorio: https://huggingface.co/rmonsurate/Victoria/tree/main
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Maple, modelo derivado construido sobre Victoria: https://huggingface.co/rmonsurate/Maple
- Build parcheado de llama.cpp: https://huggingface.co/rmonsurate/llama.cpp-victoria
- Release de GitHub del build de llama.cpp: https://github.com/rmonsurate/llama.cpp/releases/tag/victoria-mtp-b11276
- Repositorio de llama.cpp del autor (rama qwen4exp-draft-mtp): https://github.com/rmonsurate/llama.cpp
- Correccion de vLLM para el fallo de prefix caching (PR #53798): https://github.com/vllm-project/vllm/pull/53798
- Correccion de vLLM para el fallo de prefix caching (PR #54076): https://github.com/vllm-project/vllm/pull/54076
- Perfil de GitHub del autor: https://github.com/rmonsurate
- Publicacion del autor sobre Victoria y Maple en LinkedIn: https://www.linkedin.com/posts/ryanmonsurate_rmonsuratevictoria-hugging-face-activity-7510405427445014528-ZTPY
