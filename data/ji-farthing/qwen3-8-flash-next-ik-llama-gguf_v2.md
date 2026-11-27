# ji-farthing/Qwen3.8-Flash-Next-ik-llama-GGUF_v2

## Resumen

Qwen3.8-Flash-Next es un modelo de lenguaje de gran escala desarrollado por el equipo Qwen (Alibaba). Esta ficha documenta una conversion especifica a GGUF publicada por el usuario ji-farthing, no el modelo original: se trata de una cuantizacion IQ4_KT_v2 en formato GGUF orientada al runtime ik_llama.cpp, derivada del checkpoint base en BF16. El modelo cuenta con 176.943.899.520 parametros totales (unos 177.000 millones) y una arquitectura de mezcla de expertos (MoE) con proyecciones de expertos enrutados y compartidos, segun se deduce de los tensores citados en la model card (`ffn_down_exps`, `ffn_down_shexp`).

La relevancia de esta publicacion es practica: permite ejecutar un modelo de ~177.000 millones de parametros en hardware de consumo mediante una cuantizacion de aproximadamente 4 bits con una tabla de importancia (imatrix) calibrada sobre un corpus de codigo agentico. El autor documenta con detalle la divergencia KL frente a la referencia BF16, el acuerdo top-1 y las comprobaciones de integridad byte a byte de la conversion, lo que la convierte en una ficha de cuantizacion inusualmente rigurosa.

Esta revision concreta (`_v2`) no es la mas reciente del repositorio del autor: se conserva por compatibilidad con descargas existentes y porque consume menos memoria de GPU para los tensores del modelo que la v3 bajo la configuracion de offload documentada, a costa de una mayor divergencia KL medida. El sufijo `_v2` no indica, por tanto, la ultima release.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); expertos enrutados y compartidos, tabla PLE y cabeza MTP opcional |
| Parametros totales | 176.943.899.520 (~177.000 millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible en la informacion proporcionada (el comando de validacion usa `-c 32768`) |
| Tipos de cuantizacion | IQ4_KT_v2 (tabla PLE, gate/up de expertos enrutados), IQ3_KT (`ffn_down_exps`, `ffn_down_shexp`), Q8_0 (embeddings de tokens), F16 (convolucion PLE de cuatro columnas) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-license-1.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | GGUF, dividido en 2 shards (44,41 GiB + 36,31 GiB = 80,72 GiB) |
| Modelo base | Qwen/Qwen3.8-Flash-Next |
| Runtime requerido | ik_llama.cpp `main` en `cb860a9` (PR #2481) o posterior |
| Tamano del repo | 173,3 GB |

## Arquitectura y entrenamiento

La model card de esta conversion no describe el entrenamiento del modelo base; solo documenta el proceso de cuantizacion. Lo que si se puede afirmar con los datos aportados es que el modelo emplea una arquitectura MoE con al menos dos tipos de proyecciones descendentes diferenciadas: las de los expertos enrutados (`ffn_down_exps`) y las del experto compartido (`ffn_down_shexp`). Tambien incluye una tabla PLE (proyeccion de embeddings de baja dimension, segun la nomenclatura del autor) con 160 columnas, una convolucion PLE de cuatro columnas en F16, y una cabeza borrador MTP (multi-token prediction) disponible en el repositorio principal del autor, no en este. El modelo es text-only.

El proceso de cuantizacion es el elemento tecnico central de esta ficha. La imatrix se calculo sobre 700 fragmentos de 2048 tokens de un corpus construido para imitar codigo agentico. La revision v2 cambia el orden de bytes de la cola de IQ4_KT respecto a la release anterior; se trata de una permutacion de bytes sin perdida que preserva los valores cuantizados y el tamano de fichero, y que afecta a 320.994.816 filas de cola IQ4 en 98 tensores. Los tensores IQ3 y los bloques IQ4 completos no se modifican. El autor verifico cada byte de carga util de los 1224 tensores de salida tras el troceado. La calibracion y las comprobaciones de calidad se realizaron sobre revisiones anteriores del runtime (`563ede2`, `8eb6566`); en la cabeza de PR #2481 (`15fd2c0`) se ejecuto una matriz de CUDA graphs con 560 casos y 1.124.880 comparaciones contra una referencia escalar.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat Jinja (`--jinja`) y soporte de razonamiento preservado entre turnos mediante `preserve_thinking`.
- Razonamiento explicito: la plantilla de chat contempla un bloque de "thinking" por turno, cuyo comportamiento entre turnos depende de la version del runtime y del flag `preserve_thinking`.
- Generacion de codigo: la imatrix se calibro sobre un corpus de codigo agentico, y las pruebas de divergencia KL usan texto de codigo con fuentes de CPython y PostgreSQL.
- Decodificacion especulativa mediante cabeza MTP opcional (disponible en el repositorio principal del autor, no en este).
- Inferencia con offload parcial de expertos a CPU (`-ot 'ffn_.*_exps=CPU'`) y `--defer-ple`.
- Capacidades multimodales, de audio, tool calling y function calling: no disponible en la informacion proporcionada.

## Casos de uso

- Asistencia de programacion en local: con 80,72 GiB en dos shards y offload de expertos a CPU, el modelo cabe en una sola GPU de consumo de 12 GB mas 64 GB de RAM, como demuestra la validacion del autor en una RTX 4070. Adecuado para autocompletado y refactorizacion de codigo sin enviar el codigo a un servicio externo.
- Analisis de repositorios de codigo de gran tamano: el comando de validacion usa 32.768 tokens de contexto con cache KV cuantizada en q8_0, suficiente para revisar ficheros completos o diffs extensos en una sola pasada.
- Despliegue en estaciones de trabajo con una sola GPU consumer: la configuracion documentada (`-ngl 49`, expertos en CPU) permite servir el modelo con `llama-server` en un equipo de gama media-alta sin cluster.
- Evaluacion de cuantizaciones y del runtime ik_llama.cpp: el repositorio incluye mediciones reproducibles de divergencia KL y acuerdo top-1 frente a BF16, util como referencia para comparar recetas de cuantizacion en modelos MoE grandes.
- Experimentacion con decodificacion especulativa: la cabeza MTP del repositorio principal permite probar generacion especulativa sobre un MoE de ~177.000 millones de parametros en hardware limitado.
- Prototipado de agentes de codigo con contexto largo: la calibracion sobre corpus agentico y el soporte de plantilla Jinja facilitan integrar el modelo en bucles de agente con historial multi-turno, siempre que se gestione correctamente `preserve_thinking`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor si publica metricas de fidelidad de la cuantizacion frente a la referencia BF16, medidas sobre diez fragmentos de 2048 tokens por dominio:

| Fichero | Tamano | KLD medio ingles | Top-1 igual ingles | KLD medio codigo | Top-1 igual codigo |
|---|---:|---:|---:|---:|---:|
| IQ3_KT anterior con fallbacks IQ4_NL | 80,22 GiB | 0,151454 | 85,054 % | 0,134990 | 92,131 % |
| IQ4_KT anterior con fallbacks IQ4_NL | 88,42 GiB | 0,132548 | 85,738 % | 0,124749 | 92,414 % |
| IQ4_KT_v2 (esta ficha) | 80,72 GiB | 0,132805 | 86,276 % | 0,124558 | 93,216 % |

Perplejidades de referencia: 3,3316 en ingles y 1,7218 en codigo. El autor advierte que solo se midieron estas cargas de trabajo y que el acuerdo textual no garantiza la correccion del codigo generado.

## Requisitos de hardware

- VRAM: la validacion se ejecuto en una RTX 4070 (12 GB) con 64 GB de RAM y un Core i7-11700K, usando `-ngl 49` y offload de todos los tensores `ffn_.*_exps` a CPU. Los tensores en GPU son, por tanto, una fraccion del total de 80,72 GiB; el resto reside en RAM del sistema.
- GPU recomendadas: no hay datos publicados para A100, H100 u otras GPU de datacenter en la informacion disponible. La unica configuracion validada es la RTX 4070 citada.
- GPU consumer: si cabe, segun la validacion del autor, en una RTX 4070 con 64 GB de RAM. No se documentan resultados en otras GPU consumer.
- Despliegue: exclusivamente `ik_llama.cpp` en `main` desde `cb860a9` (PR #2481) o posterior; para chat multi-turno, `391a95f` (PR #2524) o posterior, o bien `"preserve_thinking": true`. Las builds entre PR #2382 y PR #2524 fuerzan `preserve_thinking` a off salvo peticion explicita.
- Backends no validados: Metal, Vulkan, ARM y ejecucion multi-GPU no estan validados por el autor.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next ik_llama IQ4_KT_v2 (esta ficha) | ~177.000 M | no disponible | IQ4_KT_v2 / IQ3_KT, 80,72 GiB | qwen-community-license-1.0 | GGUF en HF, runtime ik_llama.cpp |
| Qwen3.8-Flash-Next ik_llama IQ4_KT anterior | ~177.000 M | no disponible | IQ4_KT con fallbacks IQ4_NL, 88,42 GiB | qwen-community-license-1.0 | GGUF en HF, runtime ik_llama.cpp |
| Qwen3.8-Flash-Next ik_llama IQ3_KT anterior | ~177.000 M | no disponible | IQ3_KT con fallbacks IQ4_NL, 80,22 GiB | qwen-community-license-1.0 | GGUF en HF, runtime ik_llama.cpp |
| Qwen/Qwen3.8-Flash-Next (base) | ~177.000 M | no disponible | BF16 | qwen-community-license-1.0 | Pesos originales en HF |

No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- La licencia qwen-community-license-1.0 no es una licencia open source aprobada por la OSI; deben revisarse sus terminos antes de cualquier uso comercial.
- El modelo es text-only; no soporta vision ni audio.
- La cuantizacion introduce divergencia respecto a BF16: KLD medio de 0,132805 en ingles y 0,124558 en codigo, con acuerdo top-1 del 86,276 % y 93,216 % respectivamente. El autor solo midio estas dos cargas de trabajo.
- El modelo puede alucinar y generar codigo incorrecto; el propio autor advierte que el acuerdo textual con la referencia no establece la correccion del codigo generado.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Limitaciones de idioma: no disponible; los idiomas soportados no se documentan.
- Requiere una version muy concreta del runtime: cabezas anteriores a `cb860a9` leen incorrectamente los bytes de cola de IQ4_KT. Usar una build antigua produce salidas corruptas sin aviso.
- Con builds entre PR #2382 y PR #2524, si `preserve_thinking` queda en off, la plantilla de chat descarta el razonamiento de turnos anteriores y el servidor reprocesa el intercambio previo en cada mensaje nuevo del usuario, con el coste de latencia asociado.
- El sufijo `_v2` no indica la ultima release; el autor mantiene esta revision por compatibilidad y por menor uso de VRAM, no por mayor calidad.
- La cabeza MTP no esta incluida en este repositorio; hay que obtenerla del repositorio principal del autor.
- No hay validacion en Metal, Vulkan, ARM ni multi-GPU.

## Enlaces

- Repositorio de esta cuantizacion: https://huggingface.co/ji-farthing/Qwen3.8-Flash-Next-ik-llama-GGUF_v2
- Repositorio principal del autor (recetas, cabeza MTP): https://huggingface.co/ji-farthing/Qwen3.8-Flash-Next-ik-llama-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Runtime ik_llama.cpp: https://github.com/ikawrakow/ik_llama.cpp
- PR #2481 (orden de bytes de cola IQ4_KT): https://github.com/ikawrakow/ik_llama.cpp/pull/2481
- PR #2524 (`preserve_thinking` en chat multi-turno): https://github.com/ikawrakow/ik_llama.cpp/pull/2524
- PR #2382 (comportamiento previo de `preserve_thinking`): https://github.com/ikawrakow/ik_llama.cpp/pull/2382
