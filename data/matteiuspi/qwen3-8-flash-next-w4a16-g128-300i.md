# matteiuspi/Qwen3.8-Flash-Next-W4A16-G128-300i

## Resumen

Qwen3.8-Flash-Next W4A16-G128-300i es un checkpoint cuantizado a 4 bits del modelo multimodal Qwen/Qwen3.8-Flash-Next, publicado por el usuario matteiuspi. No se trata de un modelo nuevo entrenado desde cero, sino de una conversión completa de pesos orientada a la inferencia sobre hardware Ascend: concretamente dos tarjetas Atlas 300I Duo expuestas como cuatro dispositivos Ascend 310P3. El checkpoint mantiene las capacidades texto-imagen del modelo base, pero reorganiza los pesos de los expertos enrutados en INT4 empaquetado con grupos asimétricos de 128.

La relevancia de esta ficha es doble. Por un lado, documenta un caso práctico de cuantización W4A16/W4A8 sobre una arquitectura MoE multimodal con atención dispersa y componentes Gated DeltaNet, algo poco habitual en el ecosistema abierto. Por otro, evidencia las dependencias de despliegue: el autor advierte explícitamente de que requiere un fork específico de vLLM (OpenSensor vLLM Ascend), un runtime de desarrollo y operadores personalizados compilados, por lo que no es un modelo que funcione directamente en vLLM Ascend estándar.

El modelo tiene 121.489.440.659 parámetros totales según los safetensors, ocupa 181,7 GB en el repositorio y se distribuye bajo licencia qwen-community-1.0. Su pipeline declarado es image-text-to-text y su uso previsto es conversacional, con soporte declarado para decodificación especulativa mediante MTP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal con atención dispersa y Gated DeltaNet (según la model card) |
| Parametros totales | 121.489.440.659 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (límite de servicio usado en las mediciones del autor) |
| Tipos de cuantizacion | INT4 empaquetado (W4A16 y W4A8 para expertos enrutados), W8A8 dinámico en checkpoint complementario; componentes no expertos en FP16/FP32 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors (1.610 shards, 222.746 tensores) |
| Tamano del repo | 181,7 GB |
| Grupo de cuantizacion | 128 pesos por grupo, asimétrico, min/max RTN |
| Escalas y puntos cero | escalas FP16, puntos cero INT8 |
| Identificador de cuantizacion | `qwen4exp_w4a16_group_v1` en `text_config.ascend_expert_quantization` |
| Hardware objetivo | 2x Atlas 300I Duo (4x Ascend 310P3), TP4 con expert parallelism |
| Libreria | vLLM (fork OpenSensor vLLM Ascend) |

## Arquitectura y entrenamiento

El checkpoint deriva del modelo base Qwen/Qwen3.8-Flash-Next en la revisión `de4b8e4d43b917e7706784d8bb445c9af86a3540`. La model card describe una arquitectura MoE con atención dispersa y componentes Gated DeltaNet, además de una tabla PLE (probablemente embedding posicional o de lookup específico) de aproximadamente 102,40 GB incluida en el total. No se aportan datos sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; esa información no está disponible en el material proporcionado.

La conversión la realizó Ascend ModelSlim IR sobre 73.728 proyecciones de expertos enrutados, partiendo del checkpoint BF16 original y aplicando cuantización RTN asimétrica por grupo de 128 pesos con min/max. Cada byte empaqueta dos valores INT4 con signo, con el nibble bajo primero. Router, expertos compartidos, atención, Gated DeltaNet, embeddings, tabla PLE, componentes de visión y pesos MTP permanecen en coma flotante; los tensores BF16 se exportaron como FP16 para la ruta de servicio en 310P y los FP32 se mantuvieron en FP32.

La innovación técnica destacable es la política de ejecución de expertos en tiempo de ejecución: si el modelo permite cuantización de activaciones se usa W4A8 nativo (cuantización INT8 por grupo de activaciones, empaquetado y multiplicación INT4 x INT4 a INT32); si se requieren activaciones FP16 se usa el backend W4A16 existente; y existe un checkpoint W8A8 dinámico complementario. La selección se hace antes de la captura de grafo y no cambia silenciosamente la precisión de activaciones. Además, la forma de decodificación c1 usa un schedule de pesos en streaming fijado en compilación, mientras que c2-c4 instancian el schedule de pesos residentes.

## Capacidades

- Generación de texto conversacional multi-turno, con pipeline declarado image-text-to-text.
- Comprensión de imágenes y texto combinados (componentes de visión conservados en coma flotante).
- Razonamiento y generación de código: capacidades heredadas del modelo base, no verificadas de forma independiente en la información disponible.
- Decodificación especulativa mediante MTP (multi-token prediction), con contadores de tokens aceptados reportados por el autor.
- Ejecución MoE con expert parallelism sobre cuatro dispositivos Ascend 310P3.
- Soporte de cuantización mixta a nivel de capa: expertos enrutados en INT4 y resto en FP16/FP32.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Despliegue de inferencia multimodal en infraestructura Ascend: el checkpoint está pensado para dos Atlas 300I Duo con TP4 y expert parallelism, de modo que encaja en entornos con hardware Huawei donde no se dispone de GPUs NVIDIA. Requiere el fork OpenSensor de vLLM Ascend y operadores personalizados compilados.
- Servicio conversacional con contexto largo: el límite de servicio medido es de 262.144 tokens con cuatro slots de planificador y 512 tokens por lote, adecuado para asistentes que manejan documentos extensos o historiales largos.
- Procesamiento de documentos con imagen y texto: al conservar los componentes de visión en coma flotante y mantener el pipeline image-text-to-text, puede emplearse para extracción y resumen de información en capturas, formularios o páginas escaneadas.
- Evaluación de cuantización en producción: sirve como referencia para medir el impacto de W4A16 frente a W4A8 nativo en un MoE multimodal, con métricas de throughput c1 y c4 agregadas y una puerta de calidad fija de 228 preguntas.
- Investigación sobre decodificación especulativa: el modo MTP con `mtp_expert_execution=w8a8_grouped` permite estudiar la aceptación de tokens especulativos (81,65% reportado) y su efecto en latencia sobre NPU.
- Banco de pruebas de compatibilidad de runtimes: útil para validar forks de vLLM Ascend, captura de grafos con entradas cambiantes y rutas de pesos en streaming frente a residentes, dado que el autor documenta pruebas de grafo con rutas y pesos variables.

## Benchmarks y rendimiento

Los datos disponibles son mediciones de throughput del autor, no benchmarks académicos estándar. Se obtuvieron con el checkpoint real, dos Atlas 300I Duo, TP4 con expert parallelism, MTP2, grafos `FULL_DECODE_ONLY`, límite de 262.144 tokens, cuatro slots de planificador, 512 tokens por lote y afinidad de CPU fija, excluyendo el warmup de las medianas.

| Carga | Baseline residente | W4A8 nativo retenido | Cambio |
|---|---:|---:|---:|
| Decodificación c1, mediana | 28,1735 tok/s | 29,8610 tok/s | +5,99% |
| Decodificación c1, pico | no disponible | 30,3191 tok/s | no disponible |
| Decodificación c4 agregada, mediana | 59,6759 tok/s | 59,5233 tok/s | -0,26% |

Con la actualización de MTP agrupado (`mtp_expert_execution=w8a8_grouped`), cinco ejecuciones c1 dieron mediana de 29,7374 tok/s, media de 30,8504 tok/s y pico de 34,3382 tok/s. Tres ensayos c4 dieron 61,3700, 60,8789 y 59,4403 tok/s agregados, con mediana de 60,8789 tok/s, un 2,28% por encima de la mediana c4 de W4A8 nativo, mientras c1 varió -0,41%, dentro de la variación entre ejecuciones.

La puerta de calidad fija de 228 preguntas zero-shot puntuó 206/228 con cero respuestas inválidas. El autor subraya que es una muestra fija, no una puntuación MMLU oficial sobre el dataset completo. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM equivalente: el repositorio ocupa 181,7 GB, con un payload de tensores de 181.637.185.528 bytes (169,16 GiB), incluyendo la tabla PLE de aproximadamente 102,40 GB.
- Hardware objetivo: dos tarjetas Atlas 300I Duo, expuestas como cuatro dispositivos Ascend 310P3, con TP4 y expert parallelism.
- GPUs NVIDIA: no disponible; el checkpoint está diseñado para Ascend y no se documenta su funcionamiento en A100, H100 o RTX 4090.
- GPU de consumo: no disponible; por tamaño y formato no es un modelo apto para GPUs de consumo convencionales.
- Despliegue: fork OpenSensor de vLLM Ascend, runtime de desarrollo OpenSensor vLLM Ascend y operadores personalizados compilados. No es compatible de forma directa con vLLM Ascend estándar.
- Throughput medido: aproximadamente 29,9 tok/s en decodificación c1 y 59,5-60,9 tok/s agregados en c4 con cuatro peticiones concurrentes, según la configuración descrita.
- Memoria y planificación: requiere perfilado de memoria y warmup de grafos; el autor reporta pruebas de grafo con entradas cambiantes y rutas variables en NPU real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next W4A16-G128-300i | 121,49 B totales | 262.144 tokens en servicio | INT4 W4A16/W4A8 para expertos | qwen-community-1.0 | Hugging Face, requiere fork de vLLM Ascend |
| Qwen/Qwen3.8-Flash-Next (base) | no disponible | no disponible | BF16 original | qwen-community-1.0 | Hugging Face |
| Qwen3.8-Flash-Next W8A8-DYNAMIC-300i | no disponible | no disponible | W8A8 dinámico | qwen-community-1.0 | Hugging Face, checkpoint complementario del mismo autor |

La comparación con alternativas de otros fabricantes no está disponible en la información proporcionada. Los dos modelos comparables son el base BF16 y el checkpoint W8A8 del mismo autor, ambos orientados al mismo hardware Ascend.

## Limitaciones y advertencias

- Checkpoint experimental: el autor lo califica explícitamente como experimental y no apto como sustituto directo en vLLM Ascend estándar.
- Dependencia de un fork y de operadores compilados: requiere OpenSensor vLLM Ascend, runtime de desarrollo y operadores personalizados; la reproducibilidad fuera de ese entorno no está garantizada.
- Licencia qwen-community-1.0: es necesario revisar sus términos antes de uso comercial; la model card no detalla restricciones adicionales.
- Idiomas soportados no documentados: no se especifica cobertura multilingüe ni calidad por idioma.
- Riesgo de alucinación: no se documentan evaluaciones de veracidad ni de sesgos; la puerta de calidad de 206/228 es una muestra fija y no sustituye una evaluación completa.
- Contexto: los 262.144 tokens corresponden al límite de servicio usado en las mediciones, no necesariamente a la longitud de contexto nativa del modelo base.
- Precisión mixta: los expertos enrutados están en INT4 mientras atención, embeddings, visión y MTP permanecen en FP16/FP32; el impacto de esta mezcla en calidad no se ha medido de forma exhaustiva.
- Throughput dependiente de la configuración: las cifras c1 y c4 se obtuvieron con MTP2, grafos de solo decodificación y afinidad de CPU fija; otros ajustes pueden dar resultados distintos.
- Sin datos de tool calling, agentes ni benchmarks estándar: no se puede asumir su comportamiento en pipelines de agentes sin validación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/matteiuspi/Qwen3.8-Flash-Next-W4A16-G128-300i
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Checkpoint W8A8 complementario: https://huggingface.co/matteiuspi/Qwen3.8-Flash-Next-W8A8-DYNAMIC-300i
- Commit del fork vLLM Ascend: https://github.com/opensensor/vllm-ascend/commit/d4d2c42f1
- Notas de resultados c1: https://github.com/opensensor/vllm-ascend/blob/0637d3baa6bc2000ba6433b301f233c6516847b4/artifacts/native-int4-20260927-pass3/WEIGHT-PIPELINE-C1-RESULTS.md
- Commit de MTP agrupado: https://github.com/opensensor/vllm-ascend/commit/17954180d003ed1be4c799c305ec38cc33b55c1c
- Resultados en JSON: native-w4a8-results-20260928.json (incluido en el repositorio del modelo)
- Procedencia: PROVENANCE.json (incluido en el repositorio del modelo)
- Licencia: LICENSE (incluido en el repositorio del modelo)
