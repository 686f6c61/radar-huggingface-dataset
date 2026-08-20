# lued/Qwen3.8-27B-INT8-W8A16-DFlash2

## Resumen

Este repositorio contiene una cuantización numérica W8A16 (INT8) del modelo Qwen3.8-27B de Alibaba, preparada para servirse con vLLM en GPUs Ampere que no disponen de ejecución nativa de FP8. El autor, lued, ha aplicado una compresión con la librería `llm-compressor` y ha eliminado el cabezal MTP (Multi-Token Prediction) para sustituirlo por el drafter DFlash2, un modelo auxiliar de decodificación especulativa que acelera la generación sin cambiar los resultados.

El modelo base Qwen3.8-27B es un LLM denso multimodal de 27.356 millones de parámetros con una arquitectura híbrida: 48 capas de atención lineal recurrente (Gated DeltaNet) y 16 capas de atención completa, lo que le permite mantener una ventana de contexto nativa de 262.144 tokens. Esta cuantización conserva la torre de visión, los controles de pensamiento (thinking mode) y el contexto completo, pero reduce el tamaño del checkpoint a 28 GiB y permite ejecutar el modelo en dos RTX 3090 de 24 GB con un throughput de decodificación de aproximadamente 107 tokens por segundo gracias al drafter DFlash2.

La relevancia de este build radica en que abre la posibilidad de desplegar un modelo multimodal de 27B con contexto ultralargo en hardware de gama media (dos GPU consumer de 24 GB), algo que no era viable con los pesos BF16 originales ni con cuantizaciones FP8 en GPUs Ampere. Es una opción práctica para desarrolladores que necesiten un modelo de visión-lenguaje con capacidades de agente y razonamiento largo sin depender de GPUs de data center.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 48 capas Gated DeltaNet (atención lineal recurrente) + 16 capas de atención completa (intervalo 4) |
| Parametros totales | 27.356.728.560 (27,36 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | W8A16 (INT8 pesos, activaciones FP16/BF16), grupo-128, RTN simétrico sin datos |
| Idiomas soportados | No disponible (el modelo base Qwen3.8 es multilingüe, pero esta ficha no especifica la lista) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (6 shards, sin shard MTP) + configuración `compressed-tensors` |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un LLM denso multimodal desarrollado por el equipo Qwen de Alibaba. Su arquitectura es híbrida: de las 64 capas del transformer, 48 utilizan atención lineal recurrente basada en Gated DeltaNet (con un estado recurrente constante) y solo 16 emplean atención completa clásica, espaciadas cada 4 capas. Este diseño reduce el coste computacional del contexto largo sin sacrificar la calidad en tareas que requieren atención global. El modelo acepta entradas de imagen y texto (pipeline `image-text-to-text`), e incorpora controles de pensamiento que permiten activar o desactivar un modo de razonamiento explícito.

La cuantización W8A16 aplicada por lued conserva en BF16 la torre de visión, el `lm_head` y las puertas recurrentes GDN (`in_proj_a`/`in_proj_b`), mientras que el resto de pesos se cuantizan a INT8 con una receta RTN simétrica sin datos (data-free) y grupo de 128. El cabez MTP nativo se ha eliminado (0,79 GiB) y se ha cuantizado la capa `embed_tokens` (de 2,37 a 1,22 GiB) para hacer sitio al drafter DFlash2, un modelo externo de decodificación especulativa con 7 tokens de ventana. El drafter se sirve también cuantizado en W8A16 (2,02 GiB). No se han publicado detalles sobre el entrenamiento del modelo base (número de tokens, dataset, RLHF) en esta ficha.

## Capacidades

- Generación de texto y razonamiento multilingüe, con modo de pensamiento (thinking) activable mediante el chat template de Qwen.
- Comprensión de imágenes (entrada visual) y respuesta en formato conversacional (pipeline `image-text-to-text`).
- Razonamiento multi-step y capacidades de agente: el modelo base está diseñado para workflows agénticos, según el repositorio oficial de Qwen3.8-27B.
- Generación de código y automatización de tareas ofimáticas (según la descripción del GitHub oficial).
- Decodificación especulativa con el drafter DFlash2 integrado, que acelera la generación sin alterar los resultados (misma salida que sin drafter).
- Ventana de contexto nativa de 262.144 tokens, que permite procesar documentos muy largos o conversaciones extensas.
- Soporte de tool calling / function calling (capacidad del modelo base, no detallada en esta ficha pero implícita en su diseño agéntico).
- Capacidades multimodales de imagen-texto, manteniendo la torre de visión en BF16.

## Casos de uso

- Análisis de documentos extensos con visión: el modelo puede procesar informes PDF o escaneos de varias páginas (hasta 262K tokens) y responder preguntas sobre ellos, gracias a su contexto largo y a la entrada de imágenes. Se usaría con vLLM y una API de extracción de texto.
- Asistentes de agentes para automatización de ofimática: el modelo base está optimizado para flujos de trabajo de agente (herramientas, planificación multi-paso). Con la cuantización W8A16 se puede desplegar en hardware local de 2x24 GB sin perder las capacidades de razonamiento.
- Generación de código en entornos de producción con restricción de VRAM: el modelo es denso de 27B, pero al cuantizarlo en INT8 se puede servir en GPUs consumer (RTX 3090/4090) con vLLM, soportando tool calling para integrarse en pipelines CI/CD.
- RAG con contexto ultimo: la ventana de 262K tokens permite inyectar bases de conocimiento completas (manuales, código fuente) en el prompt y consultarlas sin necesidad de fragmentación. El modelo con visión puede procesar también imágenes de diagramas.
- Bots de atención al cliente multilingües: aunque la lista de idiomas no se publica, el modelo base Qwen3.8 es multilingüe; la cuantización no altera la calidad del texto, y el drafter DFlash2 mantiene una latencia baja en conversaciones de muchos turnos.
- Prototipado de sistemas de razonamiento en hardware modesto: con 2x RTX 3090 se obtiene un rendimiento de ~107 t/s, suficiente para experimentar con agentes que requieren cadenas de pensamiento largas, sin depender de GPU A100.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha del autor solo incluye métricas de rendimiento de servicio (tokens por segundo) medidas con `llama-benchy`, que se muestran a continuación:

| Prompt tokens | W8 drafter decode (ctx 262144) | BF16 drafter decode (ctx 229376) |
|---:|---:|---:|
| 128 | 143,6 t/s | 135,7 t/s |
| 2.048 | 107,2 t/s | 107,6 t/s |
| 8.192 | 100,1 t/s | 86,9 t/s |

Prefill medido a 926 t/s para un prompt de 240k tokens sin OOM en 2x RTX 3090. No se reportan resultados de MMLU, HumanEval u otros benchmarks de calidad.

## Requisitos de hardware

- VRAM estimada: el checkpoint pesa 28 GiB en disco. Con vLLM en TP2 (2 GPU), la KV cache con drafter DFlash2 ocupa 5,78 GiB por GPU, y el drafter W8 cuantizado 2,02 GiB. En total, se necesita aproximadamente 24 GiB por GPU para servir con contexto completo de 262K.
- GPU recomendadas: el build está validado en 2x RTX 3090 de 24 GB (Ampere sm_86). También funcionará en RTX 4090 (Ada, aunque esta tiene soporte FP8 nativo, pero no es el objetivo). No se recomienda para GPUs con menos de 24 GB de VRAM por GPU.
- No cabe en una sola GPU consumer de 24 GB: el checkpoint completo requiere al menos 28 GiB de memoria de pesos, más la KV cache. En una sola GPU de 24 GB se podría intentar con contexto reducido y sin drafter, pero no se ha validado.
- Opciones de despliegue: vLLM (librería principal), compatible con el formato `compressed-tensors` y el drafter DFlash2. No se menciona soporte para llama.cpp u Ollama en este build.
- Latencia y throughput: decodificación sostenida de ~100-130 t/s con drafter W8 (picos de 130-167 t/s), prefill de ~735 t/s para prompts largos. El límite `--max-num-batched-tokens 2048` condiciona la velocidad de prefill en prompts muy largos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Decodificación especulativa | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-27B (BF16) | 27,36 B | 262K | BF16 | MTP nativo | Apache-2.0 |
| lued/Qwen3.8-27B-INT8-W8A16-MTP | 27,36 B | 262K | W8A16 INT8 | MTP nativo (BF16) | Apache-2.0 |
| lued/Qwen3.8-27B-INT8-W8A16-DFlash2 (este) | 27,36 B | 262K | W8A16 INT8 | DFlash2 (W8) | Apache-2.0 |

Diferencias clave: el build MTP conserva el cabez MTP en BF16 y el `embed_tokens` sin cuantizar, pero el drafter DFlash2 externo no cabe junto con el contexto completo en 2x RTX 3090 (limita a 229K tokens). Este build DFlash2 sacrifica el MTP nativo y cuantiza `embed_tokens` para liberar VRAM, permitiendo el contexto completo de 262K con el drafter externo. El rendimiento en decodificación es prácticamente idéntico al MTP (107 t/s vs 107 t/s a 2K tokens), pero con menor huella de memoria. No se dispone de comparación con otros modelos de 27B (p. ej., Llama 3.1 27B o Mistral Large) en esta información.

## Limitaciones y advertencias

- La cuantización W8A16 puede introducir una pérdida de precisión mínima (error máximo de fila en `embed_tokens` de 0,59%), aunque el autor la considera despreciable. No se han publicado evaluaciones de calidad sobre benchmarks estándar.
- El modelo base Qwen3.8-27B puede presentar sesgos heredados de sus datos de entrenamiento, no documentados en esta ficha.
- Riesgo de alucinación en contextos muy largos (262K tokens) y en tareas de razonamiento complejo; se recomienda verificación de salidas.
- El drafter DFlash2 es un componente externo que requiere vLLM y no está disponible para otros frameworks (Ollama, llama.cpp). Sin vLLM, el modelo funciona sin decodificación especulativa (modo autoregresivo a 47,4 t/s).
- La eliminación del MTP nativo significa que el modelo no puede usar la predicción multi-token del base; cualquier pipeline que dependa de MTP debe usar el checkpoint hermano MTP.
- La cuantización está dirigida a GPUs Ampere (sm_86); en GPUs con FP8 nativo (Hopper, Ada) no aprovecha las ventajas de velocidad, aunque funcionará.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3.8-27B tiene condiciones adicionales de uso (según los términos de Qwen, que no se detallan aquí).
- No se garantiza la estabilidad del servicio con un único request de 262K tokens; el autor advierte que cerca del límite de contexto solo es viable una petición de longitud completa a la vez.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lued/Qwen3.8-27B-INT8-W8A16-DFlash2
- Modelo hermano con MTP: https://huggingface.co/lued/Qwen3.8-27B-INT8-W8A16-MTP
- Modelo base de Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio oficial de Qwen3.8-27B en GitHub: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- vLLM: https://github.com/vllm-project/vllm
- llm-compressor: https://github.com/vllm-project/llm-compressor
- Herramienta de benchmark llama-bench: https://pypi.org/project/llama-benchy/
