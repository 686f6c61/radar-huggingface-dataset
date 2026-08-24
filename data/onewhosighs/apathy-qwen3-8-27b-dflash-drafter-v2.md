# onewhosighs/Apathy-Qwen3.8-27B-DFlash-drafter-v2

## Resumen

Apathy Qwen3.8-27B DFlash drafter v2 es un modelo de borrador (draft model) diseñado exclusivamente para decodificación especulativa con el modelo base Qwen3.8-27B en su variante NVFP4 publicada por Unsloth. Lo desarrolla el usuario onewhosighs y se publica con licencia Apache 2.0 para que los resultados de rendimiento de un único flujo de decodificación (single-stream decode) sean reproducibles de forma exacta.

El modelo no es útil de forma autónoma: su función es proponer tokens que un modelo objetivo verifica posteriormente. En una DGX Spark (GB10), el uso de este drafter con el motor de inferencia Atlas eleva el rendimiento de decodificación de 13,9 a 63,9 tokens por segundo en cargas de trabajo de código con mucho texto repetitivo. La arquitectura es un DFlashDraftModel con 6 capas, tamaño de ocultación 512 y un vocab de 248320 tokens, con un block_size de 16 que determina la anchura de borrador óptima de 15 tokens.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlashDraftModel |
| Parametros totales | 2.128.682.368 (2,13 B) |
| Parametros activos | no aplicable (modelo de borrador denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (pesos de origen); el motor Atlas cuantiza las proyecciones densas a NVFP4 en tiempo de carga |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (69 tensores, 3,96 GiB) |

## Arquitectura y entrenamiento

El modelo usa la arquitectura DFlashDraftModel, una variante de modelo de borrador para decodificación especulativa por difusión de bloques. Tiene 6 capas con un tamaño de ocultación de 5120 y un vocabulario de 248320 tokens. El parámetro `block_size` es 16, lo que fija el ancho de borrador entrenado en `block_size - 1`, es decir, 15 tokens; valores superiores son rechazados por el cargador. Los pesos se almacenan en BF16 y el motor Atlas los cuantiza a NVFP4 en el momento de la carga.

El entrenamiento se realizó sobre completaciones generadas por el propio modelo objetivo (Qwen3.8-27B). Una limitación conocida es que una fracción sustancial del corpus de entrenamiento no era on-policy y carecía prácticamente de texto con tramos de razonamiento, mientras que en el servicio real esos tramos dominan el borrador. La tasa de aceptación medida en producción es inferior a la que sugería la pérdida de entrenamiento, y la aceptación por posición no es uniforme: baja alrededor de la posición 5 y sube hacia el final.

## Capacidades

- Proposición de tokens de borrador para decodificación especulativa con Qwen3.8-27B.
- Soporte de decodificación en bloque con `--dflash-gamma 15`, valor óptimo y máximo para este drafter.
- Integración con el motor de inferencia Atlas en hardware GB10 (DGX Spark).
- No es útil de forma independiente: no genera texto completo ni realiza razonamiento por sí mismo.
- No soporta tool calling, agentes, visión ni capacidades multilingües de forma directa.

## Casos de uso

- Aceleración de inferencia en servidores de código con carga de trabajo repetitiva: el modelo es adecuado cuando el prompt contiene gran cantidad de boilerplate, donde la decodificación especulativa alcanza su máximo rendimiento (63,9 tok/s medidos).
- Despliegue en DGX Spark con el motor Atlas: se integra mediante el comando `serve` con las banderas `--dflash --draft-model /drafter --dflash-gamma 15 --dflash-quantization nvfp4`.
- Reproducción de benchmarks de decodificación especulativa: el autor publica el modelo para que el resultado de 63,9 tok/s pueda replicarse exactamente en la misma configuración.
- Evaluación de técnicas de decodificación difusa: el modelo sirve como referencia para comparar estrategias de borrador (drafting) en hardware de memoria unificada.
- Optimización de costes en entornos con presupuesto de VRAM reducido: al ser un modelo de solo 2,13 B de parámetros, el borrador ocupa mucho menos que el modelo objetivo, permitiendo cargar ambos en la memoria unificada del GB10.
- Investigación en aceptación de tokens por posición: los datos de aceptación bimodal (caída en posición 5 y subida en la cola) pueden usarse para estudiar el comportamiento de los borradores en modelos de razonamiento.

## Benchmarks y rendimiento

El autor proporciona medidas de rendimiento de un único flujo en DGX Spark (GB10) con un prompt de código fijo, temperatura 0 y mediana de 5 repeticiones deterministas:

| Configuracion | tok/s |
|---|---|
| Qwen3.8-27B + este drafter (`--dflash-gamma 15`) | 63,9 |
| Qwen3.8-27B + drafter público `incoai/Qwen3.8-27B-DFlash2` (`--dflash-gamma 7`) | 43,9 |
| Qwen3.8-27B sin especulación | 13,9 |

El autor advierte que la cifra depende de la carga de trabajo: en prosa abierta el rendimiento cae a unos 19 tok/s, con una mediana de ~37 tok/s en cargas mixtas. No se publican resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Medido en DGX Spark (GB10) con memoria unificada (~273 GB/s de ancho de banda).
- El resultado es limitado por ancho de banda y no se transfiere directamente a GPUs discretas.
- No se proporcionan requisitos de VRAM específicos para otras plataformas.
- Despliegue recomendado con el motor de inferencia Atlas (`ghcr.io/theapathy/apathy-atlas:gb10`) en contenedor Docker.
- No se dispone de datos de latencia o throughput en hardware distinto al GB10.
- El modelo de borrador tiene 2,13 B parámetros, por lo que su huella de memoria es reducida (4,3 GB en el repositorio), lo que permite cargarlo junto al modelo principal en sistemas con memoria unificada.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Uso | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Apathy Qwen3.8-27B DFlash drafter v2 | 2,13 B | DFlashDraftModel (6 capas) | Borrador para Qwen3.8-27B (NVFP4) | Apache 2.0 | Hugging Face |
| `incoai/Qwen3.8-27B-DFlash2` | no disponible | no disponible | Borrador para Qwen3.8-27B | no disponible | Hugging Face |
| `z-lab/Qwen3.8-27B-DFlash2` | no disponible | no disponible | Borrador para Qwen3.8-27B | no disponible | Hugging Face |

La comparativa directa de rendimiento está en la sección de benchmarks: el drafter de onewhosighs alcanza 63,9 tok/s frente a los 43,9 del modelo de `incoai` en la misma configuración, aunque el autor advierte que las cifras son específicas de la carga de trabajo y que el ajuste de los flags de verificación es crítico para obtener estos valores.

## Limitaciones y advertencias

- El modelo es un borrador: no puede usarse de forma independiente para generación de texto.
- El rendimiento cae drásticamente en prosa abierta (hasta ~19 tok/s) frente a código con boilerplate (63,9 tok/s).
- La tasa de aceptación es inferior a la que sugiere la pérdida de entrenamiento, debido a una fracción del corpus de entrenamiento que no era on-policy y a la ausencia de tramos de razonamiento en el corpus.
- La aceptación por posición no es uniforme: baja alrededor de la posición 5 y sube en la cola, lo que puede afectar la eficiencia en secuencias largas.
- Los resultados se midieron solo en GB10 con memoria unificada; no se garantiza que se transfieran a GPUs discretas.
- La configuración de flags de verificación (60 variables) es crítica: usar el drafter sin esos ajustes puede resultar más lento que sin especulación.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.8-27B puede tener sus propias condiciones de uso que conviene revisar.
- No se han publicado datos sobre sesgos, alucinación o comportamientos específicos del modelo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/onewhosighs/Apathy-Qwen3.8-27B-DFlash-drafter-v2
- Repositorio de rendimiento y perfil de 60 variables: https://github.com/TheApathy/apathy-atlas/tree/perf/qwen38-gb10-dflash/bench/qwen38-gb10
- Drafter alternativo `incoai/Qwen3.8-27B-DFlash2`: https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
- Drafter alternativo `z-lab/Qwen3.8-27B-DFlash2`: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Ficha de Qwen3.8-27B en QwenCloud: https://www.qwencloud.com/models/qwen3.8-27b
- Guía de NVIDIA para servir Qwen3.8-27B (NVFP4) con SGLang + DFlash2 en DGX Spark: https://forums.developer.nvidia.com/t/qwen3-8-27b-nvfp4-on-single-dual-dgx-spark-sglang-dflash2-fully-openai-compatible/380732
- Repositorio de MiaAI-Lab para Qwen3.8-27B en DGX Spark / RTX 6000 PRO: https://github.com/MiaAI-Lab/Qwen3.8-27B-DGX-Spark-RTX-6000
