# axteam/GLM-4.7-Flash-GGUF

## Resumen

GLM-4.7-Flash-GGUF es la distribucion cuantizada en formato GGUF del modelo zai-org/GLM-4.7-Flash, publicada por el usuario axteam para su uso con llama.cpp, Ollama y LM Studio. El modelo original pertenece a Z.ai (organizacion zai-org) y esta liberado bajo licencia MIT, lo que permite uso comercial sin restricciones adicionales. Esta version GGUF resuelve el problema de ejecutar un modelo de aproximadamente 31.200 millones de parametros en hardware de consumo o en servidores con GPU unica, algo inviable con los pesos en BF16 originales.

La relevancia de esta publicacion radica en que ofrece cuatro niveles de cuantizacion k-quant (Q4_K_M, Q5_K_M, Q6_K y Q8_0) generados mediante cuantizacion post-entrenamiento con las herramientas oficiales de llama.cpp, sin reentrenamiento. El autor ha documentado verificaciones de carga y respuesta en una NVIDIA B200 con la build b12005, y ha retirado las cuantizaciones Q3_K_M y Q2_K tras detectar anomalias en las pruebas de perplexity y de chat. El repositorio ocupa 126,4 GB en total y acumula cerca de 40.000 descargas.

La arquitectura subyacente es de tipo deepseek2 con una capa MTP (multi-token prediction), segun indica el autor en los requisitos de compilacion de llama.cpp. Esta es una ficha del artefacto cuantizado: los detalles de entrenamiento, dataset y benchmarks del modelo base no estan disponibles en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | deepseek2 con capa MTP (segun requisitos de llama.cpp del autor) |
| Parametros totales | 31.221.488.576 (dato de safetensors del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (los ejemplos de la model card usan `-c 8192`, pero no se declara el maximo del modelo) |
| Tipos de cuantizacion | Q4_K_M (18,9 GB), Q5_K_M (22,2 GB), Q6_K (25,7 GB), Q8_0 (33,2 GB); k-quants por bloques y Q8_0 |
| Idiomas soportados | no disponible (la model card incluye pruebas en ingles, frances y coreano) |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp), con `chat_template` embebido |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura denominada deepseek2 en llama.cpp, que incorpora una capa MTP (multi-token prediction). Esta capa MTP es la razon por la que el autor exige una build de llama.cpp igual o superior a b10251 para cargar los ficheros. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo original.

Esta publicacion concreta no entrena nada: aplica cuantizacion post-entrenamiento (PTQ) sobre los pesos BF16 con `convert_hf_to_gguf.py` y `llama-quantize`, con escalas por bloque y asignacion mixta de bits en las variantes k-quant. El `chat_template` original queda embebido en cada fichero. El autor documento una revision el 2026-11-02 en la que elimino Q3_K_M (perplexity inexplicablemente baja frente a Q8_0 en WikiText-2) y Q2_K (fallo en la prueba de chat en coreano), y declaro que no publica mediciones de perplexity para este modelo por falta de fiabilidad del metodo.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat embebida y compatible con la API de OpenAI a traves de `llama-server`.
- Respuesta en varios idiomas: la model card verifica respuestas correctas a preguntas en ingles, frances y coreano con todos los ficheros del repositorio.
- Razonamiento y conocimiento general: el autor confirma respuestas correctas sobre capitales de paises en las pruebas de validacion.
- Inferencia local con llama.cpp, con soporte de flash attention (`-fa on`) y cache KV cuantizada (`--cache-type-k/v q8_0`).
- Despliegue como endpoint compatible con OpenAI mediante `llama-server --jinja`.
- Compatibilidad declarada con Ollama (`ollama run hf.co/axteam/GLM-4.7-Flash-GGUF:Q4_K_M`) y LM Studio, aunque el autor no ha verificado su funcionamiento en esas plataformas.
- Tool calling, modo thinking, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional autoalojado: con Q4_K_M (18,9 GB) cabe en una GPU de 24 GB o en dos de 16 GB, y sirve una API compatible con OpenAI en local para integrarse en aplicaciones internas sin depender de servicios externos.
- Prototipado de agentes y chatbots en estaciones de trabajo: la plantilla de chat embebida y el flag `--jinja` de llama.cpp permiten levantar un servidor con formato de mensajes estandar y probar flujos multi-turno rapidamente.
- Inferencia en servidor con GPU unica de gran capacidad: en una B200, el autor cargo todos los ficheros con todas las capas en GPU, lo que habilita servir Q8_0 (33,2 GB, la variante mas fiel al original) en un solo acelerador.
- Evaluacion comparativa de cuantizaciones: al ofrecer cuatro niveles desde 4 a 8 bits, permite medir en el propio hardware el equilibrio entre calidad, memoria y velocidad antes de fijar una variante para produccion.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia MIT del modelo base y de la derivada facilita la integracion en productos comerciales sin obligaciones de atribucion mas alla de la propia MIT.
- Experimentacion academica con modelos de ~31.000 millones de parametros: el formato GGUF y la compatibilidad con llama.cpp permiten reproducir experimentos en laboratorios con hardware modesto usando Q4_K_M o Q5_K_M.
- Reduccion de memoria en contextos largos: la opcion de cache KV en q8_0 con flash attention reduce a la mitad el consumo de la cache, util para servir contextos de varios miles de tokens en GPUs con VRAM ajustada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor midio perplexity en WikiText-2 pero decidio no publicarla tras detectar resultados anomalos en la cuantizacion Q3_K_M, posteriormente retirada del repositorio.

## Requisitos de hardware

- VRAM estimada: aproximadamente el tamano del fichero GGUF mas la cache KV del contexto configurado. Q4_K_M ronda los 18,9 GB, Q5_K_M los 22,2 GB, Q6_K los 25,7 GB y Q8_0 los 33,2 GB, sin contar la cache KV.
- GPU verificada por el autor: NVIDIA B200, con todas las capas en GPU y la build b12005 (commit e0f142d, CUDA).
- GPU recomendadas para Q4_K_M: tarjetas con 24 GB o mas (RTX 3090, RTX 4090, A10G, L4 con limitaciones) o configuraciones multi-GPU. Q8_0 requiere 40 GB o mas en una sola GPU (A100 80 GB, H100, B200).
- Cabe en GPU de consumo: Q4_K_M es la unica variante que encaja con holgura en 24 GB; Q5_K_M y Q6_K quedan al limite o fuera en 24 GB si se anade cache KV apreciable.
- Opciones de despliegue: llama.cpp (build >= b10251, con `-fa on` que requiere >= b6325), llama-server con API compatible con OpenAI, Ollama y LM Studio (estas dos no verificadas por el autor).
- Reduccion de memoria: `--cache-type-k q8_0 --cache-type-v q8_0 -fa on` reduce aproximadamente a la mitad la cache KV.
- Latencia y throughput: no disponibles. El autor no publica mediciones de velocidad.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni comparaciones con otros modelos de tamano o categoria similares, por lo que no es posible establecer una comparativa rigurosa sin inventar cifras.

## Limitaciones y advertencias

- Las cuantizaciones Q3_K_M y Q2_K fueron retiradas: la primera por una perplexity inexplicablemente baja y la segunda por fallar la prueba de chat en coreano (respondia en ingles hasta el limite de 256 tokens). No deben usarse versiones antiguas de esos ficheros.
- El autor no publica mediciones de perplexity para este modelo, por lo que no hay una validacion cuantitativa publica de la perdida de calidad por cuantizacion.
- La verificacion se limita a dos preguntas cortas (capitales de Francia y Corea) con cada fichero; no hay evaluacion extensa de calidad.
- Ollama y LM Studio no han sido probados por el autor; su funcionamiento es esperado pero no confirmado.
- La longitud maxima de contexto del modelo no se declara; los ejemplos usan 8192 tokens, y valores superiores requieren verificar soporte y memoria.
- Los idiomas soportados no estan documentados oficialmente; las pruebas solo cubren ingles, frances y coreano.
- Riesgo de alucinacion y sesgos: no disponible en la informacion proporcionada; aplican las advertencias habituales de los modelos generativos.
- Licencia MIT: permite uso comercial y modificacion, pero conviene conservar el aviso de copyright original de Z.ai y de axteam segun los terminos MIT.
- El rendimiento y la estabilidad dependen de la build de llama.cpp; versiones anteriores a b10251 no cargaran la arquitectura deepseek2 con capa MTP.

## Enlaces

- Repositorio GGUF: https://huggingface.co/axteam/GLM-4.7-Flash-GGUF
- Modelo base: https://huggingface.co/zai-org/GLM-4.7-Flash
