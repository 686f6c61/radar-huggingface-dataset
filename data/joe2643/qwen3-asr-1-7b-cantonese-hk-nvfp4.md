# joe2643/Qwen3-ASR-1.7B-Cantonese-HK-NVFP4

## Resumen

Qwen3-ASR-1.7B-Cantonese-HK-NVFP4 es una version cuantizada a 4 bits (esquema NVFP4A16, weight-only) del ajuste fino en cantonés de Hong Kong del modelo de reconocimiento automatico del habla Qwen3-ASR-1.7B, desarrollado por Alibaba Qwen y adaptado por el usuario joe2643. El modelo resuelve la transcripcion de audio en cantonés coloquial de Hong Kong con cambio de codigo a ingles, generando salida en chino tradicional de Hong Kong, y anade a la tarea una compresion de pesos que reduce el tamano del repositorio a 2,1 GB frente a los 4,08 GB del original en BF16.

La relevancia de esta publicacion es practica: demuestra que un ASR especializado en una variedad linguistica de bajos recursos como el cantonés puede desplegarse en una unica GPU de consumo con una penalizacion de precision acotada. Segun los datos del autor, el modelo pierde 0,5 puntos de CER en FLEURS y 1,1 puntos en conversacional respecto a BF16, pero gana velocidad (1,4x en lote y 1,7x en clips individuales sobre una RTX 4090).

El modelo cuenta con 2.038.052.480 parametros totales, es de tipo denso (no MoE), se distribuye en formato safetensors con `compressed-tensors` y esta pensado para inferencia con vLLM a traves del paquete `qwen-asr`. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder para ASR (Qwen3-ASR: audio tower + decoder de texto), pesos cuantizados con `compressed-tensors` |
| Parametros totales | 2.038.052.480 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (en el ejemplo de uso se configura `max_model_len=4096`) |
| Tipos de cuantizacion | NVFP4A16: pesos FP4 E2M1 con escala FP8 por cada 16 valores y escala global FP32; activaciones en 16 bits. Capas `Linear` del decoder de texto cuantizadas; audio encoder, embeddings y `lm_head` en BF16 |
| Idiomas soportados | yue (cantonés, yue-HK), zh, en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo `compressed-tensors`); existe variante GGUF en `joe2643/Qwen3-ASR-1.7B-Cantonese-HK-GGUF` |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-ASR-1.7B, un sistema de reconocimiento automatico del habla con un codificador de audio (`thinker.audio_tower.*`) y un decodificador de texto (`thinker.model.layers.*`). Sobre esa base, el autor aplico un ajuste fino orientado a cantonés coloquial de Hong Kong con cambio de codigo a ingles y salida en chino tradicional de Hong Kong. No se detallan en la informacion disponible el volumen de datos de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO en el ajuste.

La innovacion tecnica principal es la cuantizacion NVFP4A16 realizada con `llm-compressor` 0.11.0 y `compressed-tensors` 0.16.0 en modo data-free (sin calibracion). Solo se cuantizan las capas `Linear` del decodificador de texto; el codificador de audio, los embeddings y la cabeza de lenguaje se mantienen en BF16 para preservar la calidad de la representacion acustica. El autor indica que la receta es la misma que la empleada en `UrocyonF/Qwen3-ASR-1.7B-NVFP4` para el modelo base, e incluye un `recipe.yaml` en el repositorio.

## Capacidades

- Reconocimiento automatico del habla (transcripcion de audio a texto) en cantonés de Hong Kong, chino y ingles.
- Manejo de cambio de codigo (code-switching) cantonés-ingles, frecuente en el habla real de Hong Kong.
- Salida en chino tradicional de Hong Kong.
- Seleccion de idioma forzada mediante el parametro `language` de la API de `qwen-asr`.
- Inferencia por lotes (batch) y por clips individuales.
- Compatibilidad con vLLM a traves del paquete `qwen-asr[vllm]` 0.0.6.
- Ejecucion en GPUs sin tensor cores FP4 (Ada, Ampere) mediante el kernel Marlin en modo weight-only; computo FP4 nativo en Blackwell.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, vision ni audio generativo.

## Casos de uso

- Subtitulado automatico de contenido audiovisual en cantonés: el modelo transcribe audio de video y devuelve chino tradicional de Hong Kong, lo que encaja con flujos de postproduccion para plataformas dirigidas a audiencias de Hong Kong.
- Transcripcion de reuniones y llamadas con code-switching: al soportar mezcla de cantonés e ingles, es adecuado para entornos corporativos de Hong Kong donde los hablantes alternan idiomas en la misma frase.
- Servicio de atencion al cliente con analitica de voz: permite transcribir grabaciones de llamadas para su clasificacion y busqueda posterior, con un coste de memoria reducido que facilita el despliegue en infraestructura modesta.
- Generacion de actas y notas de entrevistas: la salida en chino tradicional elimina la necesidad de conversion posterior para documentos destinados a Hong Kong.
- Investigacion linguistica y creacion de corpus: util para construir transcripciones de habla coloquial cantonesa a partir de grabaciones de campo, dado el soporte de yue-HK.
- Despliegue en GPU de consumo para prototipado: con 2,05 GB de pesos, cabe en tarjetas como la RTX 4090 y permite iterar en local sin acceso a clústeres.
- Procesamiento por lotes de archivos de audio largos: el autor reporta 2,65 horas de audio FLEURS procesadas en 8,4 s en lote sobre una RTX 4090, lo que lo hace viable para pipelines de volumen medio.

## Benchmarks y rendimiento

Datos publicados por el autor (RTX 4090, vLLM 0.14.0 via `qwen-asr[vllm]` 0.0.6, decodificacion greedy, idioma forzado a cantonés, CER tras normalizacion OpenCC t2s, numeros y eliminacion de espacios):

| Modelo | FLEURS `yue_hant_hk` (819 clips) | Test conversacional YouTube HK (279 clips, 1,75 h) | Tiempo lote FLEURS (2,65 h audio) | Clip individual p50 |
|---|---:|---:|---:|---:|
| BF16 | 3,96% | 11,40% | 11,6 s | 0,22 s |
| FP8 | 4,05% | 11,23% | 41,8 s | 0,50 s |
| NVFP4A16 (este repo) | 4,49% | 12,52% | 8,4 s | 0,13 s |

El autor senala que la penalizacion de precision es de aproximadamente 10-13% relativo frente a BF16 en conversacional, y que las cifras se obtuvieron con el kernel Marlin en modo weight-only, ya que Ada y Ampere no disponen de tensor cores FP4.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 2,05 GB; con activaciones y overhead de vLLM, un despliegue tipico requiere varios GB adicionales (el autor usa `gpu_memory_utilization=0.5` en su ejemplo, sin especificar VRAM total).
- GPU recomendadas: RTX 4090 (referencia de las mediciones), GPUs Blackwell (RTX 50 series, RTX PRO 6000, B200, DGX Spark) para computo FP4 nativo.
- Compatibilidad en consumer GPU: si, cabe en GPUs de consumo; en Ada y Ampere funciona en modo weight-only FP4 via Marlin.
- Opciones de despliegue: vLLM mediante `qwen-asr[vllm]==0.0.6`; para llama.cpp u OraType existe la variante GGUF del mismo autor.
- Latencia y throughput medidos: 0,13 s p50 por clip individual y 8,4 s para 2,65 h de audio en lote sobre RTX 4090; aproximadamente 1,4x mas rapido que BF16 en lote y 1,7x en clips individuales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CER FLEURS yue_hant_hk | Licencia | Disponibilidad |
|---|---|---|---:|---|---|
| Qwen3-ASR-1.7B-Cantonese-HK-NVFP4 (este repo) | 2.038 M | no disponible | 4,49% | Apache 2.0 | Hugging Face |
| Qwen3-ASR-1.7B-Cantonese-HK (BF16, mismo ajuste) | 2.038 M | no disponible | 3,96% | Apache 2.0 | Hugging Face |
| Qwen3-ASR-1.7B-Cantonese-HK FP8 | 2.038 M | no disponible | 4,05% | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-ASR-1.7B (base) | 2.038 M | no disponible | no disponible | Apache 2.0 | Hugging Face |

No se dispone en la informacion proporcionada de comparaciones con modelos ASR de otros desarrolladores.

## Limitaciones y advertencias

- La precision es inferior a la de las variantes BF16 y FP8: +0,5 puntos de CER en FLEURS y +1,1 puntos en conversacional (10-13% relativo). El autor lo describe explicitamente como la opcion de velocidad y tamano, no de precision.
- La cuantizacion es data-free, sin calibracion; el autor sugiere que una version calibrada podria reducir la brecha de precision en el futuro.
- En GPUs Ada y Ampere no hay computo FP4 nativo: vLLM emite un aviso y ejecuta mediante el kernel Marlin en modo weight-only, por lo que el rendimiento no refleja el potencial completo del formato.
- El ajuste esta especializado en cantonés de Hong Kong; el comportamiento en otras variedades de cantonés o en chino mandarin no esta documentado.
- Riesgo de alucinacion y errores de transcripcion inherentes a los modelos ASR, especialmente en audio con ruido, solapamiento de hablantes o acentos no representados en el ajuste.
- No se documentan evaluaciones de sesgo demografico ni de robustez ante condiciones acusticas adversas.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en produccion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion independiente de las cifras reportadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joe2643/Qwen3-ASR-1.7B-Cantonese-HK-NVFP4
- Variante GGUF del mismo ajuste: https://huggingface.co/joe2643/Qwen3-ASR-1.7B-Cantonese-HK-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Receta NVFP4 de referencia para el modelo base: https://huggingface.co/UrocyonF/Qwen3-ASR-1.7B-NVFP4
