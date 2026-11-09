# dongnhdev/Qwen3.8-Flash-Next-Q2mix-Hybrids

## Resumen

Qwen3.8-Flash-Next-Q2mix-Hybrids es un repositorio de cuantizaciones GGUF creado por el usuario dongnhdev a partir de los pesos del modelo Qwen3.8-Flash-Next. No se trata de un modelo entrenado desde cero, sino de una reconstruccion hibrida en la que se combinan pesos densos cuantizados de alta calidad (variantes Unsloth UD IQ1_M e IQ2_XS) con los 144 expertos enrutados del modelo original recuantizados a Q2_0 (tipo ggml 42). El objetivo declarado es conseguir inferencia rapida en hardware de consumo, con cifras de decodificacion de aproximadamente 56-60 tokens por segundo en un Apple M5 Pro con contexto de 32k.

El paquete se publica en dos variantes: una denominada "q2mix", que usa el denso UD-IQ1_M y obtiene la mejor puntuacion agregada en las pruebas del autor (141/164), y otra denominada "candv1", con denso UD-IQ2_XS y un rendimiento ligeramente inferior en razonamiento pero algo superior en codigo. Ambas comparten un sidecar PLE (per-layer token embedding) de 28,8 GB cuantizado a Q4_1 y un proyector de vision BF16 opcional.

La relevancia de este repositorio es acotada y muy especifica: no es una publicacion oficial de Alibaba/Qwen, no incluye model card estandarizada, no declara licencia y depende de dos motores de inferencia no convencionales (Strata y ds4-metal) con requisitos de configuracion muy concretos. Resulta util unicamente para usuarios que ya operan esos motores y quieren replicar los resultados medidos por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) y capas densas; hyper-connections (hc_*) y PLE (per-layer embeddings); MTP (multi-token prediction) en la variante ds4 |
| Parametros totales | 176.943.899.520 (dato de safetensors del repo base) |
| Parametros activos | no disponible (la model card indica 144 expertos enrutados en 48 capas, pero no especifica cuantos se activan por token) |
| Longitud de contexto | 32.768 tokens (valor usado en los comandos de ejemplo) |
| Tipos de cuantizacion | Denso IQ1_M o IQ2_XS; expertos enrutados Q2_0 (ggml type 42); PLE Q4_1; hc_* Q8_0 a BF16 o F32; ple_conv1d F16; proyector de vision BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (dividido en shards de 2 partes), mas un "pack" propietario de Strata (~1,4 GB) |

## Arquitectura y entrenamiento

El modelo subyacente, Qwen3.8-Flash-Next, es un transformer con mezcla de expertos: 48 capas con 144 expertos enrutados por capa (tensores gate/up/down), acompanados de tensores densos, hyper-connections (hc_*) y un mecanismo de per-layer embeddings (PLE) que se distribuye como sidecar separado. La variante para ds4 incorpora ademas un bloque MTP (blk.48) con nextn_predict_layers=1, lo que eleva block_count a 49 y habilita decodificacion especulativa multi-token.

Este repositorio no aporta entrenamiento nuevo: es un trabajo de cuantizacion y reempaquetado. Los tensores densos provienen de las cuantizaciones Unsloth UD (IQ1_M e IQ2_XS); los expertos enrutados se recuantizan a Q2_0 tipo 42 mediante requantizacion weighted-SSE usando la imatrix de Unsloth; las hyper-connections se convierten de Q8_0 a BF16 (modo --compat-bf16 de Strata) o a F32 para inyeccion en ds4. Un detalle critico documentado por el autor es que blk.1.ple_conv1d.weight debe mantenerse en F16, ya que en BF16 produce salida incoherente. No se dispone de informacion sobre el dataset de entrenamiento original, el numero de tokens ni las etapas de RLHF/DPO del modelo base.

## Capacidades

- Generacion de texto conversacional y razonamiento multi-paso, segun las evaluaciones internas del autor (categorias "reason" y "code").
- Generacion de codigo, con 63/67 y 64/67 aciertos en la prueba de codigo de Strata para las variantes q2mix y candv1 respectivamente.
- Uso de herramientas (tool calling), con 38/53 y 37/53 aciertos en la prueba de herramientas de Strata.
- Vision: incluye un proyector multimodal opcional (mmproj-Qwen3.8-Flash-Next-BF16.gguf) y el comando de Strata activa --vision.
- Decodificacion especulativa mediante MTP en la variante ds4 (flag --mtp), con runtime MTP externo en Strata.
- Soporte multilingue: no disponible (no declarado en la informacion).
- Modo thinking explicito: no disponible (no declarado).

## Casos de uso

- Inferencia local en Apple Silicon: el caso principal documentado es ejecutar el shard de 38,8 GB con Strata en un M5 Pro, logrando unos 60 tokens/s de decodificacion con contexto de 32k; adecuado para asistentes locales sin GPU dedicada.
- Despliegue en equipos con VRAM limitada: la combinacion de denso IQ1_M/IQ2_XS con expertos Q2_0 reduce el peso total a unos 67,6 GB repartidos en dos ficheros, lo que permite servir el modelo con mmap de expertos y cache de 64 entradas en lugar de cargar los 176.900 millones de parametros completos.
- Evaluacion comparativa de tecnicas de cuantizacion mixta: el repositorio sirve como banco de pruebas para medir el impacto de recuantizar expertos a Q2_0 con imatrix frente a mantener densos de mayor precision, con puntuaciones desglosadas por tarea.
- Procesamiento de documentos con imagen: usando el proyector de vision BF16 y el flag --vision de Strata, se puede construir un pipeline de extraccion de informacion de capturas o PDF renderizados.
- Asistente de codigo en local: con 63-64 aciertos sobre 67 en la prueba de codigo del autor y soporte de tool calling, es viable integrarlo en un flujo de autocompletado o revision de parches en un entorno de desarrollo sin conexion.
- Experimentacion con decodificacion especulativa: la variante ds4 con MTP embebido permite medir la ganancia de throughput de multi-token prediction en un modelo MoE cuantizado, usando ds4-server con --metal y contexto de 32k.
- Prototipado de agentes con herramientas: la puntuacion de 37-38 sobre 53 en la prueba de herramientas indica que puede sostener cadenas de llamadas a funciones, aunque con una tasa de exito que exige validacion externa en produccion.

## Benchmarks y rendimiento

Los unicos datos disponibles son las evaluaciones internas del autor con el motor Strata (version 0.1.58-metal, temperatura 0), no comparables con benchmarks academicos estandar:

| Variante | Codigo | Herramientas | Razonamiento | Total | Decodificacion |
|---|---|---|---|---|---|
| q2mix (UD-IQ1_M + Q2_0) | 63/67 | 38/53 | 40/44 | 141/164 | ~60 t/s (M5 Pro, ctx 32k) |
| candv1 (UD-IQ2_XS + Q2_0) | 64/67 | 37/53 | 37/44 | 138/164 | ~56 t/s (M5 Pro, ctx 32k) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/almacenamiento: el shard principal ocupa 38,8 GB (q2mix) o 38,7 GB (candv1); el sidecar PLE compartido anade 28,8 GB; el fichero ds4 con MTP pesa 41,6 GB. El total ronda los 67-70 GB en disco.
- Memoria en ejecucion: no disponible de forma explicita; el uso de --mmap-experts y --expert-cache 64 en Strata sugiere que no es necesario residentizar todos los expertos, lo que reduce el pico de memoria por debajo del total en disco.
- GPU recomendadas: el unico hardware con cifras medidas es un Apple M5 Pro (via Strata con backend metal y ds4-metal). No hay datos para A100, H100 ni RTX 4090.
- GPU de consumo: no confirmado. El tamano del shard principal (38,8 GB) excede la VRAM de cualquier GPU consumer actual, por lo que solo cabria con mmap desde RAM unificada o almacenamiento rapido.
- Opciones de despliegue: Strata (con pack propio, --serve, --ple-gguf, --expert-profile, --spec 2, --kv-grow) y ds4-server (--metal, --mtp). No se documenta compatibilidad con llama.cpp, Ollama, vLLM ni TGI; el uso de tensores Q2_0 tipo 42, hyper-connections y PLE hace improbable el soporte en motores genericos.
- Latencia y throughput: ~56-60 tokens/s de decodificacion en M5 Pro con contexto de 32k. No se proporcionan datos de prefill ni de latencia al primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Motor |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-Q2mix-Hybrids (este repo) | 176,9 B totales, 144 expertos | 32.768 | IQ1_M/IQ2_XS + Q2_0 expertos | no disponible | Strata, ds4-metal |
| Qwen3.8-Flash-Next (pesos originales) | 176,9 B totales | no disponible | BF16 y cuantizaciones UD de Unsloth | no disponible | llama.cpp, vLLM y otros |
| Otras cuantizaciones GGUF del mismo modelo base | 176,9 B totales | segun motor | IQ1_M, IQ2_XS, Q4_K_M, etc. | segun autor | llama.cpp, Ollama |

No se dispone de datos de rendimiento de terceros para establecer una comparacion cuantitativa fiable; las unicas cifras son las del propio autor y no son directamente trasladables a otros motores.

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no indica licencia, por lo que no se puede asumir uso comercial permitido. Es necesario verificar la licencia del modelo base Qwen3.8-Flash-Next antes de cualquier despliegue productivo.
- Cuantizacion agresiva: densos en IQ1_M (aproximadamente 1-2 bits por peso) y expertos en Q2_0 implican una perdida de calidad sustancial frente a los pesos originales; las puntuaciones de herramientas (37-38 sobre 53) reflejan un rendimiento limitado en tareas de llamada a funciones.
- Dependencia de motores no estandar: requiere Strata con un pack de ~1,4 GB o ds4-metal con un fichero de 49 bloques; no funciona en llama.cpp, Ollama, vLLM ni TGI, lo que limita portabilidad y soporte.
- Fragilidad de configuracion: el autor advierte que blk.1.ple_conv1d.weight debe ir en F16 (BF16 produce salida incoherente) y que ds4 no soporta MTP externo para Qwen3.8, obligando a usar ficheros distintos por motor.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; en un modelo con densos a ~1-2 bits es esperable un aumento respecto al original.
- Idiomas: no declarados; no hay garantia de calidad fuera de los idiomas cubiertos por el modelo base.
- Sesgos: no documentados por el autor.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente de las cifras reportadas.
- Fecha de creacion futura (2026-11-08) en los metadatos de Hugging Face, lo que impide verificar historicamente la procedencia y el estado del modelo base.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/dongnhdev/Qwen3.8-Flash-Next-Q2mix-Hybrids
- Modelo base Qwen3.8-Flash-Next: no disponible (no se proporciona enlace directo en la informacion)
- Cuantizaciones Unsloth UD referenciadas: no disponible (no se proporciona enlace)
- Motor Strata: no disponible (no se proporciona enlace)
- Motor ds4-metal: no disponible (no se proporciona enlace)
- Paper o blog tecnico: no disponible
- Demo: no disponible
