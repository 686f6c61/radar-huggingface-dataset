# pentacoxian-dev/Qwen3.8-Flash-Next-GSQ-RCO-IQ3_XXS_M64-GGUF

## Resumen

Qwen3.8-Flash-Next GSQ-RCO IQ3_XXS_M64 es una cuantización GGUF de tipo mixto del modelo Qwen3.8-Flash-Next, publicada por el usuario pentacoxian-dev. No se trata de un modelo nuevo ni de un reentrenamiento: es un ensamblaje byte a byte de dos ficheros de cuantización ya existentes del laboratorio ISTA-DASLab (el IQ3_XXS y el Q2_0), en el que se sustituyen los expertos enrutados de bajada (routed down experts) de cuatro capas concretas (29, 30, 31 y 35) por su versión en Q2_0 para reducir el peso total de 43,80 GiB a 42,92 GiB. El objetivo declarado es que el modelo quepa completo, con el contexto nativo de 262K tokens, en un Mac con Apple Silicon de 64 GB de memoria unificada, incluyendo espacio para el Neural Engine.

El modelo subyacente, Qwen3.8-Flash-Next, es un transformer de tipo Mixture of Experts (MoE) de la familia Qwen, con decodificación especulativa mediante un bloque MTP (multi-token prediction) separado y una tabla n-gram almacenada en un segundo shard que el runtime lee desde disco bajo demanda. La ficha se centra en las características de esta distribución GGUF concreta, que está pensada para el runtime ds4 (concretamente el fork ds4 Flash-Next M64 de pentaCoxian), si bien el autor indica que también funciona con el ds4 upstream de paperniuk a costa de perder velocidad de prefill.

La relevancia de esta publicación es fundamentalmente práctica: demuestra una técnica de cuantización mixta guiada por divergencia KL para ajustar modelos MoE grandes a hardware de consumo (Mac de 64 GB) sin recalcular pesos, manteniendo la fidelidad respecto a la cuantización de referencia IQ3_S. No se han ejecutado benchmarks sobre este fichero concreto; las cifras de rendimiento que cita el autor provienen de la cuantización IQ3_XXS original de ISTA.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE) con bloque MTP para decodificación especulativa; cuantización GGUF mixta |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantización | IQ3_XXS mixta: IQ4_NL y Q2_0 en los expertos enrutados de bajada, con cuatro capas (29, 30, 31, 35) forzadas a Q2_0; el resto de tensores sin modificar respecto a IQ3_XXS |
| Idiomas soportados | no disponible (la model card no declara lista de idiomas; los ejemplos de evaluación usan C, prosa en inglés y prosa en japonés) |
| Licencia | Qwen Community License 1.0 (license_name: qwen-community-1.0) |
| Formato de pesos | GGUF, dividido en dos shards (00001-of-00002 y 00002-of-00002) |
| Tamaño del repo | 46,1 GB |
| Peso de los pesos (shard 1) | 42,92 GiB (frente a 43,80 GiB de IQ3_XXS) |
| Shard 2 (tabla n-gram) | 28,8 GB, alojado en el repo de ISTA-DASLab |
| Bloque MTP (opcional) | 1,5 GB, en paperniuk/Qwen3.8-Flash-Next-MTP-block |
| Modelo base | ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF (relación: quantized) |
| Modelo original | Qwen/Qwen3.8-Flash-Next |
| Runtime previsto | ds4 Flash-Next M64 (pentaCoxian); compatible con paperniuk/ds4 |
| Fecha de publicación | 2026-11-02 |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer MoE de la familia Qwen3.8-Flash-Next. La model card no detalla el número de capas, la dimensión oculta, el número de expertos ni el reparto de parámetros activos; tampoco describe la composición del dataset de entrenamiento, el número de tokens vistos ni si hubo fases de RLHF o DPO. Lo que sí se deduce de la información disponible es que la arquitectura incorpora expertos enrutados en las capas FFN (tensores `ffn_down_exps.weight`), un bloque MTP independiente para decodificación especulativa y una tabla n-gram externa de 28,8 GB que el runtime consulta desde SSD, probablemente para decodificación especulativa basada en n-gramas o para un mecanismo de prompt lookup.

La innovación técnica de esta publicación no está en el entrenamiento sino en el método de cuantización mixta. ISTA-DASLab distribuye el IQ3_XXS con 18 capas cuyos expertos de bajada están en IQ4_NL y 30 capas en Q2_0. El autor evaluó, capa por capa, el efecto de sustituir cada una de esas 18 capas IQ4_NL por su equivalente Q2_0, midiendo la divergencia KL frente a IQ3_S (la mejor cuantización de ISTA) sobre seis secuencias de 2.048 tokens en tres dominios (código C, prosa inglesa y prosa japonesa). Las capas 29, 30, 31 y 35 fueron las que menos afectaron a la KL, dentro del ruido de medición; la capa 47 por sí sola añadía 0,07 de KL en japonés. El resultado es un fichero que no recuantiza ningún tensor: cada peso es copia byte a byte de uno de los dos ficheros de ISTA, y los metadatos GGUF registran el origen en `general.mix.base`, `general.mix.donor` y `general.mix.donor_tensors`.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo Qwen3.8-Flash-Next subyacente.
- Generación de código: la evaluación de fidelidad de la cuantización incluye código C, y el autor cita LiveCodeBench 86,29 para el IQ3_XXS original de ISTA.
- Procesamiento multilingüe: la evaluación de KL usa prosa en inglés y japonés, lo que indica cobertura al menos de esos idiomas; la lista completa no está disponible.
- Decodificación especulativa mediante bloque MTP opcional, que acelera la generación token a token.
- Tabla n-gram externa consultada desde disco, que el runtime lee bajo demanda para tareas de decodificación asistida.
- Codificador de visión: la model card menciona un "vision encoder" que se mapea en memoria solo mientras codifica una imagen, por lo que el modelo subyacente es multimodal (texto e imagen).
- Compatibilidad con el servidor OpenAI-compatible de ds4 (`/v1` en `http://127.0.0.1:8010/v1`).
- Soporte de contexto largo: 262K tokens con caché KV de 8 bits.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes multi-paso, audio ni modo thinking explícito.

## Casos de uso

- Asistente de código en local para Mac de 64 GB: el modelo cabe completo con 262K de contexto y decodifica a 47-52 tok/s en un M3 Max de 40 núcleos GPU, lo que permite mantener repositorios medianos en contexto y trabajar con un agente de programación sin conexión a la nube.
- Procesamiento de documentos largos en inglés y japonés: con 262K tokens de ventana se pueden ingerir informes, contratos o transcripciones completas en una sola pasada, aprovechando que la evaluación de fidelidad cubre prosa en ambos idiomas.
- Análisis de imágenes con texto asociado: el codificador de visión se mapea solo durante la codificación, de modo que se puede usar para tareas de document understanding o descripción de capturas sin penalizar el uso de memoria en reposo.
- Servidor de inferencia personal con API OpenAI-compatible: `./dstar serve --quant iq3m` expone un endpoint `/v1` en localhost, lo que permite conectar clientes existentes (SDKs de OpenAI, herramientas de agentes) sin adaptadores.
- Evaluación de cuantizaciones mixtas en investigación: el fichero sirve como caso de estudio reproducible de selección de capas guiada por KL, con script `gguf_mix.py splice` y hashes SHA-256 publicados para verificar la reconstrucción.
- Prototipado de decodificación especulativa: al requerir el bloque MTP de 1,5 GB como fichero separado, permite comparar rendimiento con y sin decodificación especulativa en el mismo hardware.
- Despliegue en entornos con memoria unificada limitada: para builds de ds4 sin kernels Q8_0 (como el upstream de paperniuk) es la opción recomendada, ya que el fichero HC8 alternativo rinde a la mitad de velocidad de prefill en esos builds.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks sobre este fichero concreto. El autor lo indica explícitamente: "No benchmark scores were run on this file". Las cifras de calidad que cita corresponden a la cuantización IQ3_XXS original de ISTA-DASLab: media de tareas 92,57 y LiveCodeBench 86,29.

La model card sí publica métricas de fidelidad de la cuantización (divergencia KL frente a IQ3_S, acuerdo top-1 y NLL sobre seis secuencias de 2.048 tokens):

| Fichero | KL media vs IQ3_S | Acuerdo top-1 | NLL |
|---|---|---|---|
| Q2_0 (ISTA) | 0,4380 | 78,9 % | 1,5867 |
| IQ3_XXS (ISTA) | 0,1834 | 85,7 % | 1,3435 |
| IQ3_XXS_M64 (este fichero) | 0,1835 | 85,5 % | 1,3426 |

La KL se calcula como cota inferior sobre los 128 tokens más probables de IQ3_S más el resto agrupado en un único bucket.

Rendimiento medido en un M3 Max de 40 núcleos GPU, contexto de 262K bajo emulación de un Mac de 64 GB, prompts de 8K tokens (agente de código y prosa japonesa), decodificación greedy con MTP:

| Fichero | Prefill | Decode |
|---|---|---|
| IQ3_XXS_M64, con Neural Engine | 585-607 tok/s | 47-52 tok/s |
| IQ3_XXS, sin Neural Engine (no cabe) | 450-505 tok/s | 47-53 tok/s |

## Requisitos de hardware

- Memoria: el plan de ds4 en un Mac de 64 GB con `sudo sysctl iogpu.wired_limit_mb=57344` reserva 51,9 GiB a 262K de contexto con MTP y Neural Engine: 44,3 GiB para pesos y bloque MTP, 3,7 GiB para caché KV de 8 bits, 3,1 GiB para buffers de prefill y 0,9 GiB para el Neural Engine.
- Almacenamiento: 77 GB en total si se descarga todo (shard 1 de 42,92 GiB, shard 2 de 28,8 GB, bloque MTP de 1,5 GB y codificador de visión).
- GPU recomendadas: Apple Silicon con 64 GB de memoria unificada (el caso validado es M3 Max de 40 núcleos GPU). No hay datos publicados para A100, H100 ni RTX 4090; el formato y el runtime están orientados a Metal y Apple Silicon.
- GPU de consumo: cabe en un Mac de 64 GB; no se documenta su comportamiento en GPUs NVIDIA de consumo ni en Macs de 32 GB o menos.
- Opciones de despliegue: ds4 Flash-Next M64 (recomendado, con kernels Q8_0 para los mixers de hiperconexión) o ds4 upstream de paperniuk (funcional pero con prefill a la mitad de velocidad para el fichero HC8; este fichero IQ3_XXS_M64 es la alternativa para esos builds). No se menciona compatibilidad con llama.cpp, Ollama, vLLM ni TGI.
- Latencia y throughput: 585-607 tok/s de prefill y 47-52 tok/s de decode en M3 Max de 40 núcleos GPU con Neural Engine; 450-505 tok/s de prefill y 47-53 tok/s de decode sin Neural Engine.
- Dependencia de disco: el shard 2 (tabla n-gram) debe permanecer en SSD porque ds4 lee sus filas bajo demanda.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| IQ3_XXS_M64 (este fichero) | no disponible | 262K | IQ3_XXS mixta (4 capas en Q2_0) | Qwen Community 1.0 | Hugging Face, 0 descargas | 42,92 GiB; KL 0,1835 vs IQ3_S; 47-52 tok/s decode en M3 Max |
| IQ3_XXS (ISTA-DASLab) | no disponible | 262K | IQ3_XXS | Qwen Community 1.0 | Hugging Face | 43,80 GiB; KL 0,1834; no cabe en Mac de 64 GB con Neural Engine |
| Q2_0 (ISTA-DASLab) | no disponible | 262K | Q2_0 | Qwen Community 1.0 | Hugging Face | KL 0,4380; acuerdo top-1 78,9 %; menor calidad |
| IQ3_XXS_M64_HC8 (pentaCoxian) | no disponible | 262K | IQ3_XXS mixta con mixers HC en Q8_0 | Qwen Community 1.0 | Hugging Face | 0,55 GiB más pequeño; ~10 % más rápido con kernels Q8_0 de ds4 M64 |
| Qwen3.8-Flash-Next (original) | no disponible | no disponible | pesos completos | Qwen Community 1.0 | Hugging Face (Qwen) | Modelo de referencia sin cuantizar |

No se dispone de datos de parámetros totales ni activos para ninguno de los modelos comparados, por lo que la comparación se limita a tamaño en disco, contexto, licencia y métricas de fidelidad y velocidad publicadas.

## Limitaciones y advertencias

- No es un modelo entrenado desde cero: es un ensamblaje de dos cuantizaciones existentes. Cualquier sesgo o limitación del Qwen3.8-Flash-Next original se hereda sin cambios.
- No se han ejecutado benchmarks de calidad sobre este fichero; las cifras de tarea (92,57 de media, LiveCodeBench 86,29) son del IQ3_XXS de ISTA y no necesariamente se trasladan de forma exacta a esta mezcla.
- La evaluación de fidelidad se hizo sobre solo seis secuencias de 2.048 tokens en tres dominios (C, inglés y japonés); la cobertura estadística es limitada y no incluye otros idiomas ni tareas de razonamiento o matemáticas.
- La sustitución de capas se eligió por mínima KL, pero el autor reconoce que la diferencia está "dentro del ruido de la medición" y que la capa 47 por sí sola añadía 0,07 de KL en japonés, lo que sugiere sensibilidad del idioma a la selección de capas.
- Dependencia de ficheros externos: el shard 2 (28,8 GB) y el bloque MTP (1,5 GB) no están en este repositorio; sin ellos el modelo no funciona o pierde la decodificación especulativa.
- Dependencia de runtime: está pensado para ds4 Flash-Next M64. En el ds4 upstream de paperniuk funciona, pero el autor recomienda el fichero HC8 para ese caso por rendimiento de prefill.
- El shard 2 debe residir en SSD porque se lee bajo demanda; no es un modelo autocontenido en un único fichero.
- Licencia Qwen Community 1.0: los productos o servicios comerciales con más de 100 millones de usuarios activos mensuales o más de 20 millones de dólares de ingresos mensuales deben mostrar el nombre del modelo de forma destacada. El texto completo debe incluirse con cualquier copia.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el autor es un particular, no el laboratorio original; conviene verificar los hashes SHA-256 publicados antes de desplegarlo.
- No se documentan limitaciones específicas de contexto, idioma, tool calling ni agentes para este fichero; la información disponible no permite confirmarlas ni descartarlas.

## Enlaces

- Repositorio Hugging Face de este fichero: https://huggingface.co/pentacoxian-dev/Qwen3.8-Flash-Next-GSQ-RCO-IQ3_XXS_M64-GGUF
- Repositorio del fichero alternativo HC8: https://huggingface.co/pentacoxian-dev/Qwen3.8-Flash-Next-GSQ-RCO-M64-GGUF
- Cuantizaciones de ISTA-DASLab (modelo base): https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Bloque MTP para decodificación especulativa: https://huggingface.co/paperniuk/Qwen3.8-Flash-Next-MTP-block
- Runtime ds4 Flash-Next M64: https://github.com/pentaCoxian/ds4-flash-next
- Runtime ds4 upstream: https://github.com/paperniuk/ds4
