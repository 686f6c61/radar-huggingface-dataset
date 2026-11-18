# Minachist/Qwen3.8-Flash-Next-INT4-Mixed-AutoRound

## Resumen

Qwen3.8-Flash-Next-INT4-Mixed-AutoRound es una cuantización de precisión mixta (INT4/INT6) del modelo multimodal Qwen3.8-Flash-Next, publicada por el usuario Minachist. El trabajo combina AutoRound para la calibración de pesos con una asignación heterogénea de bits por capa (media de 4,178 bits por peso en el cuerpo del modelo), orientada a reducir el uso de VRAM sin degradar de forma apreciable la fidelidad respecto al modelo original en BF16. El resultado es un checkpoint de aproximadamente 139.700 millones de parámetros y 349,7 GB en el repositorio, empaquetado en safetensors con el formato `compressed-tensors`.

La relevancia de esta publicación no reside solo en la cuantización, sino en el parche de vLLM que la acompaña: permite ejecutar un modelo de este tamaño con contexto de 262.144 tokens sobre tres GPU de 24 GB (RTX 3090 en la medición del autor), e incluso sobre dos tarjetas recurriendo a RAM del host para parte de los expertos. Esto rebaja sustancialmente la barrera de hardware para un modelo de clase frontera con entrada de imagen y texto.

El modelo base es multimodal (`image-text-to-text`), con arquitectura de mezcla de expertos según se deduce del uso de "expertos en RAM del host" y del soporte de decodificación especulativa MTP. La licencia es `qwen-community-1.0`, distinta de las licencias permisivas habituales, lo que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con mezcla de expertos (MoE), según se deduce del despliegue por expertos; detalles completos no disponibles |
| Parametros totales | 139.734.687.635 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (hasta 524.288 con YaRN en la build de 2x24 GB) |
| Tipos de cuantizacion | INT4/INT6 mixto con AutoRound; media de 4,178 bits por peso en el cuerpo |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como `other`) |
| Formato de pesos | safetensors con `compressed-tensors`; existen GGUF de terceros (Unsloth) y EXL3 (Turboderp) |

## Arquitectura y entrenamiento

El checkpoint es una cuantización, no un entrenamiento desde cero. La arquitectura subyacente corresponde a Qwen3.8-Flash-Next, un modelo multimodal de tipo mezcla de expertos: el autor distribuye pesos por GPU y coloca parte de los expertos en RAM del host cuando no caben en VRAM, lo que confirma el enrutamiento por expertos. El proceso de cuantización emplea AutoRound con asignación mixta de bits (INT4 e INT6) y calibración específica; la rama `new-main` regenera los datos de calibración con una versión de mayor precisión del propio modelo, lo que reduce el KLD medio de 0,014705 a 0,011680 y la mediana de 0,000872 a 0,000620 frente a la referencia BF16.

El parche de vLLM incluido es una innovación destacable en sí misma: implementa caché de prefijo, entrada de imágenes, soporte de MTP (decodificación especulativa multi-token) y un pool de K/V fijado en memoria del host (67,8 GiB en la build de 3x24 GB). No se dispone de información sobre el volumen de tokens de entrenamiento del modelo base, la composición del dataset ni las etapas de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento de varios pasos, con modo de razonamiento explícito (los benchmarks se puntúan tras eliminar la traza de razonamiento).
- Entrada multimodal de imagen y texto (`image-text-to-text`), con soporte de imágenes en las tres builds del parche.
- Generación de código: LiveCodeBench v6 pass@1 de 92,4 en esta cuantización.
- Razonamiento científico y matemático de nivel experto: GPQA Diamond de 90,4.
- Seguimiento de instrucciones complejas: IFBench prompt-level loose de 81,0.
- Contexto largo real: hasta 262.144 tokens por petición con cuatro peticiones concurrentes en 3x24 GB.
- Decodificación especulativa MTP opcional, que acelera un único flujo entre un 18 % y un 43 %.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.

## Casos de uso

- Análisis de documentación técnica extensa: con 262.144 tokens de contexto se pueden cargar manuales completos, repositorios de código o expedientes y formular preguntas sobre ellos sin fragmentación, manteniendo cuatro conversaciones simultáneas en tres RTX 3090.
- Procesamiento de documentos con imágenes: la entrada `image-text-to-text` permite extraer y razonar sobre diagramas, capturas de pantalla, tablas escaneadas y figuras dentro de un mismo flujo, útil en auditoría documental o extracción de datos de informes.
- Asistencia a la investigación científica: el rendimiento en GPQA Diamond (90,4) lo hace adecuado para responder preguntas de posgrado en física, química y biología, por ejemplo en triaje de literatura o generación de hipótesis preliminares.
- Generación de código en pipelines internos: con 92,4 en LiveCodeBench v6 puede emplearse para resolver problemas de programación y autocompletar funciones en un entorno de integración continua, siempre que se valide la salida con tests automáticos.
- Despliegue en laboratorios con hardware de consumo: la build de 2x24 GB permite servir el modelo en dos RTX 3090 con parte de los expertos en RAM del host, a 81-90 tok/s de decodificación, lo que hace viable la experimentación académica con un modelo de 139.700 millones de parámetros.
- Agentes de contexto largo con caché de prefijo: al soportar prefix caching, un mismo system prompt extenso (por ejemplo, políticas de empresa o especificaciones de producto) se reutiliza entre peticiones, reduciendo el coste de prefill en asistentes conversacionales multi-turno.
- Evaluación comparativa de cuantizaciones: el repositorio incluye datos de KLD y benchmarks frente a BF16, lo que lo convierte en una referencia práctica para estudiar el impacto de la cuantización mixta en modelos MoE multimodales.

## Benchmarks y rendimiento

Resultados de tarea de la rama `main`, comparados con las cifras oficiales en BF16:

| Benchmark | Esta cuantizacion | Oficial (BF16) | ± 1 SE |
|---|---|---|---|
| IFBench, prompt-level loose | 81,0 | 81,3 | 2,3 |
| GPQA Diamond | 90,4 | 91,7 | 2,1 |
| LiveCodeBench v6, pass@1 | 92,4 | 91,9 | 2,3 |

Desglose por dominio y dificultad: GPQA Diamond física 95,3, química 87,1, biología 84,2. LiveCodeBench v6 fácil 100, medio 94,9, difícil 86,9 (131 problemas entre 2025-02-01 y 2025-04-06). IFBench estricto: 73,3 prompt-level y 76,2 instruction-level; loose instruction-level 83,4.

Fidelidad frente a BF16 (KLD, menor es mejor):

| Cuantizacion | Bits por peso | KLD medio | KLD mediana |
|---|---|---|---|
| AutoRound `main` | 4,178 | 0,014705 | 0,000872 |
| AutoRound `new-main` | 4,178 | 0,011680 | 0,000620 |

Rendimiento medido en 3x RTX 3090 (PCIe 4.0 x16) con 125 GiB de RAM:

| Metrica | 3x24GB | 3x24GB+MTP | 2x24GB |
|---|---|---|---|
| VRAM por GPU (pesos, con torre de visión) | 21,20 / 20,44 / 21,05 GiB | 21,20 / 21,71 / 21,18 GiB | 18,8 / 18,6 GiB + 13 GiB de expertos en RAM por tarjeta |
| Contexto | 262.144 x 4 peticiones | 262.144 x 2 peticiones | 262.144 x 2, o 524.288 x 2 con YaRN |
| RAM del host | ~85 GiB (67,8 GiB de pool K/V fijado) | 41,2 GiB de pool K/V | ~77 GiB (40,0 GiB de pool, 26 GiB de expertos) |
| Disco | 95,37 GiB de tabla en NVMe | igual | igual |
| Decodificación, 1 petición, prompt corto | 95-99 tok/s | 117-141 tok/s | 81-90 tok/s |
| Decodificación, 1 petición, contexto 8k-160k | 83-96 tok/s | 110-116 tok/s | 84-87 tok/s |
| Decodificación, 2 peticiones | 188 tok/s total | 190 tok/s total | 150 tok/s total (135 con dos prompts de 224k) |
| Decodificación, 4 peticiones | 243-245 tok/s total | 188 tok/s total | 2 simultáneas tal como se distribuye |
| Prefill | ~3.700 tok/s a 248k; 5.913-5.947 tok/s a 39k | 5.613-5.809 tok/s a 39k | ~2.000 tok/s a 516k; ~2.300 a 256k; 2.494-2.499 a 39k |

## Requisitos de hardware

- VRAM: 21,20 / 20,44 / 21,05 GiB por GPU en la configuración de tres tarjetas de 24 GB; 18,8 / 18,6 GiB por tarjeta en la de dos, más 13 GiB de expertos en RAM del host por tarjeta.
- GPU recomendadas: RTX 3090 (medición real del autor); la build `2x32GB` está pensada para RTX 5090 y similares; no se han publicado pruebas en A100 ni H100.
- Cabe en GPU de consumo: sí, en tres RTX 3090 de 24 GB, o en dos RTX 3090 con 125 GiB de RAM de sistema; en dos RTX 5090 de 32 GB según la build `2x32GB`.
- RAM del host: ~85 GiB en 3x24GB, ~77 GiB en 2x24GB, 41,2 GiB de pool K/V en 3x24GB+MTP; el autor usó un sistema con 125 GiB.
- Almacenamiento: 95,37 GiB de fichero de tabla en NVMe, además de los pesos; el repositorio completo ocupa 349,7 GB.
- Despliegue: exclusivamente vLLM con el parche incluido en el repositorio (`vllm-patch/3x24GB/`, `vllm-patch/3x24GB+MTP/`, `vllm-patch/2x24GB/`, `vllm-patch/2x32GB/`). Para llama.cpp u Ollama existen GGUF de terceros (Unsloth); para EXL3, la publicación de Turboderp.
- Throughput: 243-245 tok/s agregados con cuatro peticiones en 3x24GB; prefill de hasta 5.947 tok/s a 39k tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-INT4-Mixed-AutoRound (este) | 139.734.687.635 | 262.144 (524.288 con YaRN) | INT4/INT6 AutoRound, 4,178 bits medios | qwen-community-1.0 | safetensors + parche vLLM |
| Qwen3.8-Flash-Next (BF16) | no disponible | 262.144 | BF16 | qwen-community-1.0 | safetensors |
| Qwen3.8-Flash-Next-GGUF (Unsloth) | no disponible | no disponible | GGUF | qwen-community-1.0 | GGUF |
| Qwen3.8-Flash-Next-exl3 (Turboderp) | no disponible | no disponible | EXL3 | qwen-community-1.0 | EXL3 |

No se dispone de datos de benchmarks de las alternativas GGUF y EXL3 en la información proporcionada; solo se citan como puntos de referencia de KLD en la gráfica de qbench, que no equivale a una comparación de puntuaciones de tareas.

## Limitaciones y advertencias

- Licencia `qwen-community-1.0` (etiquetada como `other`): no es una licencia permisiva; es imprescindible revisar el fichero LICENSE antes de cualquier uso comercial.
- El modelo es una cuantización: introduce una divergencia medible respecto a BF16 (KLD medio de 0,011680 en `new-main`), con posibles degradaciones en tareas sensibles a la precisión numérica.
- La rama `new-main` contiene solo pesos; los parches y ficheros de compilación deben descargarse de `main`, lo que añade pasos manuales al despliegue.
- El despliegue depende de un parche de vLLM no oficial: actualizaciones de vLLM pueden romper la compatibilidad y no hay garantía de mantenimiento.
- La build de 2x24GB requiere ~77 GiB de RAM del host y 125 GiB en el sistema medido; no es un despliegue de escritorio convencional.
- El contexto de 524.288 tokens solo está disponible con YaRN en la build de 2x24GB y con una única petición simultánea.
- No hay información sobre idiomas soportados, sesgos conocidos ni tasas de alucinación; deben evaluarse empíricamente antes de producción.
- Los benchmarks publicados son de la rama `main`, no de `new-main`, y las cifras oficiales de referencia provienen de la model card del modelo base.
- El tamaño del repositorio (349,7 GB) y la necesidad de NVMe para el fichero de tabla de 95,37 GiB condicionan la infraestructura de almacenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Minachist/Qwen3.8-Flash-Next-INT4-Mixed-AutoRound
- Rama `new-main`: https://huggingface.co/Minachist/Qwen3.8-Flash-Next-INT4-Mixed-AutoRound/tree/new-main
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Artículo del autor: https://minamism.com/posts/flash-next-vllm/
- Segundo artículo (optimización): https://minamism.com/posts/flash-next-vllm-optimization/
- GGUF de Unsloth: https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- EXL3 de Turboderp: https://huggingface.co/turboderp/Qwen3.8-Flash-Next-exl3
- qbench (exllamav3): https://github.com/turboderp-org/exllamav3/tree/master/eval/qbench
- Código de trazado de qbench: https://github.com/turboderp-org/exllamav3/blob/master/eval/qbench/plot.py
