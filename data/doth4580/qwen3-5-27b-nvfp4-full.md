# doth4580/Qwen3.5-27B-NVFP4-FULL

## Resumen

Qwen3.5-27B-NVFP4-FULL es una cuantización NVFP4/FP8 del modelo Qwen3.5-27B, desarrollado originalmente por el equipo Qwen de Alibaba y empaquetado por el usuario doth4580 para su uso con el motor de inferencia veloGB10 sobre sistemas NVIDIA DGX Spark / GB10. El artefacto conserva la licencia Apache-2.0 del modelo original y modifica únicamente los pesos; el tokenizador y la plantilla de chat permanecen intactos.

El modelo base es un transformer denso híbrido que combina 48 capas de GatedDeltaNet (atención lineal con estado recurrente de tamaño fijo) con 16 capas de atención completa GQA, una dimensión oculta de 5120 y una ventana de contexto de 262.144 tokens. Incorpora además una cabeza nativa de multi-token prediction (MTP) que se emplea para decodificación especulativa. El vocabulario es de 248.320 tokens.

La relevancia de este artefacto es operativa: permite ejecutar un modelo de 27.781 millones de parámetros en hardware GB10 con un tamaño en disco de 15 GB, gracias a la cuantización NVFP4 de todas las GEMM. El pack está validado específicamente con veloGB10 (decodificación especulativa, serving TP=2 y suite de corrección), aunque al usar el formato estándar `compressed-tensors` puede cargarse con cualquier framework compatible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido (48 capas GatedDeltaNet + 16 capas full GQA), hidden 5120, 24 cabezas Q / 4 KV |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | NVFP4 (todas las GEMM), FP8; receta `nvfp4-full` |
| Idiomas soportados | no disponible en la información proporcionada |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, `nvfp4-pack-quantized` (compatible con compressed-tensors) |
| Vocabulario | 248.320 tokens |
| Cabeza MTP | sí, multi-token prediction nativa (para decodificación especulativa) |
| Tamano en disco | 15 GB |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-27B emplea una arquitectura híbrida que intercala 48 capas de GatedDeltaNet —atención lineal con estado recurrente de tamaño fijo— con 16 capas de atención completa con GQA (24 cabezas de query, 4 de key/value). Esta combinación busca reducir el coste de atención en contextos largos manteniendo la capacidad de recuperación de información a larga distancia. La dimensión oculta es 5120 y el vocabulario alcanza los 248.320 tokens. Incluye una cabeza nativa de multi-token prediction que habilita decodificación especulativa.

No se dispone en la información proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO. El artefacto de este repositorio es una cuantización post-entrenamiento generada con el cuantizador offline `nvfp4-full` de veloGB10, que convierte todas las GEMM a NVFP4. No se ha reentrenado ni ajustado el modelo; solo se han modificado los pesos por cuantización.

## Capacidades

- Generación de texto y razonamiento multi-turno con ventana de contexto de 262.144 tokens.
- Decodificación especulativa mediante la cabeza MTP nativa, con tasas de aceptación del borrador del 62,4 % (TP=1), 65,0 % (TP=2) y 64,4 % (TP=4) según las mediciones del autor.
- Serving OpenAI-compatible a través de veloGB10 (`/v1`), con soporte de prefix caching.
- Despliegue multi-nodo con tensor parallelism TP=2 y TP=4, sin necesidad de copiar el modelo en los nodos trabajadores.
- Modo thinking activado por defecto en las mediciones del pack (sampling con presencia por defecto de 1,5).
- Capacidades de código: las mediciones incluyen turnos de código con decodificación de 26-52 tok/s según topología.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Serving en DGX Spark / GB10: el pack está producido y validado para veloGB10 sobre GB10, por lo que es la vía directa para desplegar Qwen3.5-27B en ese hardware con un único binario y un servidor OpenAI-compatible en el puerto 9000.
- Asistentes de código en producción: con 262.144 tokens de contexto y turnos de código medidos a 26-52 tok/s, encaja en pipelines de revisión, generación y refactorización que requieren contexto amplio de repositorio.
- Procesamiento de documentos largos: la ventana de 262k tokens permite ingerir contratos, informes o expedientes completos en una sola petición sin troceado.
- Despliegue multi-nodo con TP=2 o TP=4: para cargas que necesitan mayor throughput agregado (hasta 60 tok/s con dos peticiones concurrentes en TP=4) o mayor velocidad de prefill (833 tok/s en TP=2).
- Investigación en cuantización NVFP4: al usar el layout estándar `compressed-tensors`, sirve como artefacto de referencia para evaluar la calidad de NVFP4 frente a FP8/FP16 en un modelo de 27B.
- Evaluación de decodificación especulativa: la cabeza MTP y las tasas de aceptación publicadas permiten reproducir y comparar estrategias de speculative decoding en hardware GB10.
- Backend de chat multi-turno con prefix caching: útil en aplicaciones donde un mismo system prompt o contexto se reutiliza entre peticiones, reduciendo el coste de prefill.

## Benchmarks y rendimiento

Mediciones del autor con VeloBench sobre la API servida en máquinas GB10 (2026-11-08, builds de desarrollo de veloGB10 0.7.7), con sampling de producción, thinking activado y una petición a la vez salvo en la columna de dos peticiones. La decodificación se expresa en tokens de salida por segundo e incluye decodificación especulativa. Una ejecución por celda, con variación aproximada de ±10 %.

| Topologia | Fuente del borrador | Decode turno de codigo (tok/s) | Decode turno de relato (tok/s) | Mediana decode todos los turnos (tok/s) | Prefill (tok/s) | 2 peticiones, agregado (tok/s) | Aceptacion del borrador |
|---|---|---:|---:|---:|---:|---:|---:|
| TP=1 | cabeza MTP del pack | 26 | 19 | 20 | 650 | 24 | 62,4 % |
| TP=2 | cabeza MTP del pack | 37 | 28 | 32 | 833 | 37 | 65,0 % |
| TP=4 | cabeza MTP del pack | 52 | 34 | 40 | 772 | 60 | 64,4 % |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el pack ocupa 15 GB en disco en NVFP4; el autor no publica cifras de VRAM en inferencia. Como referencia, un modelo de 27,8B en NVFP4 más estados KV y buffers de runtime requiere holgura por encima de esos 15 GB, pero no se dispone de una cifra medida.
- GPU recomendadas: NVIDIA DGX Spark / GB10 (hardware objetivo del pack). El autor no valida otras GPU en la información proporcionada.
- Cabe en consumer GPU: no disponible en la información proporcionada; el pack está orientado a GB10.
- Opciones de despliegue: veloGB10 (`gb10_inference`), con servidor OpenAI-compatible. Por el formato `compressed-tensors` podría cargarse con otros frameworks compatibles, pero el autor solo prueba y valida veloGB10.
- Topologías soportadas: TP=1 (una GB10), TP=2 y TP=4, con nodos que no requieren copia local del modelo (el head envía los pesos y se cachean). Soporte de `--rdma-dev` para seleccionar rail RoCE.
- Latencia y throughput: prefill de 650-833 tok/s y decode mediano de 20-40 tok/s según topología (ver tabla de benchmarks). Batch máximo probado: 2 peticiones concurrentes; `--max-tokens 65536`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| doth4580/Qwen3.5-27B-NVFP4-FULL | 27,8B | 262.144 | NVFP4 / FP8 | Apache-2.0 | Cuantización para veloGB10/GB10; 15 GB en disco |
| Qwen/Qwen3.5-27B (original) | 27,8B | 262.144 | BF16/FP16 (original) | Apache-2.0 | Modelo base sin cuantizar; mayor huella de memoria |
| Otras cuantizaciones de Qwen3.5-27B (GGUF, AWQ, etc.) | 27,8B | 262.144 | GGUF/AWQ/otros | Apache-2.0 (heredada) | No disponibles en la información proporcionada; orientadas a otros runtimes |

No se dispone de datos de rendimiento comparativo con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Este repositorio es una cuantización de terceros: los pesos están modificados respecto al original y pueden presentar degradación de calidad frente a BF16/FP16, aunque el autor no publica métricas de calidad.
- El pack está producido y validado exclusivamente para veloGB10 sobre GB10; el rendimiento en otros frameworks o GPU no está garantizado ni medido.
- No se dispone de información sobre sesgos del modelo base ni sobre su comportamiento en dominios sensibles.
- Riesgo de alucinación: inherente al modelo base; no cuantificado en la información disponible.
- Idiomas soportados no documentados en este repositorio; conviene consultar la model card original de Qwen3.5-27B.
- Las mediciones de throughput son de una sola ejecución por celda, con variación de ±10 %, y corresponden a builds de desarrollo de veloGB10 0.7.7; no deben tomarse como cifras de producción estables.
- El sampler por defecto aplica `presence-penalty 1.5`; usar otros valores puede alterar el comportamiento respecto a las mediciones publicadas.
- Licencia Apache-2.0 heredada del modelo base, que permite uso comercial; no obstante, el autor no reclama propiedad intelectual sobre el modelo y remite a la licencia original.
- El repositorio tiene 25 descargas y 0 likes en el momento de la consulta, lo que indica una validación comunitaria muy limitada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/doth4580/Qwen3.5-27B-NVFP4-FULL
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-27B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-27B/blob/main/LICENSE
- Motor de inferencia veloGB10: https://github.com/sf-stav/veloGB10
