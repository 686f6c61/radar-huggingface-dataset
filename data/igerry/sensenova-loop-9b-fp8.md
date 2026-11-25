# igerry/SenseNova-Loop-9B-FP8

## Resumen

SenseNova-Loop-9B-FP8 es una cuantización en FP8 del modelo multimodal SenseNova-Loop-9B, publicada por el usuario igerry. El modelo base, desarrollado por SenseNova, es un transformer multimodal de tipo image-text-to-text con 9.656 millones de parámetros que incorpora una arquitectura poco convencional denominada "Loop", con cabecera MTP (multi-token prediction) y capas de atención lineal. Esta versión FP8 reduce el peso de los pesos de aproximadamente 19 GiB en BF16 a 11,3 GiB, manteniendo en BF16 el codificador de visión, los embeddings, el lm_head, las normas y los routers.

La relevancia de esta ficha radica en que el checkpoint está pensado específicamente para inferencia con vLLM, pero requiere parches externos porque la versión estándar de vLLM todavía no soporta la arquitectura Loop. El autor mantiene un repositorio con los parches necesarios (vLLM 0.33.0, commit `e077110` o posterior). La cuantización replica el algoritmo de `--quantization fp8` en línea de vLLM: cada capa lineal del modelo de lenguaje y de la cabecera MTP se almacena como `float8_e4m3fn` con una escala por tensor `amax / 448`, y las activaciones se cuantizan de forma dinámica.

El modelo conserva la licencia Apache-2.0 del modelo base, lo que facilita su uso comercial, y admite entrada de imagen además de texto. Su tamaño contenido (9,6B parámetros) y su formato FP8 lo sitúan en un rango interesante para despliegues en GPUs de gama alta de consumo o profesionales con dos aceleradores.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con arquitectura "Loop", cabecera MTP y capas de atención lineal (detalles completos no disponibles) |
| Parámetros totales | 9.656.254.576 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (se han probado contextos de hasta 97k tokens en las mediciones del autor) |
| Tipos de cuantización | FP8 (`float8_e4m3fn`) con escala por tensor; activaciones dinámicas; capas no lineales en BF16/FP32 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (FP8), compatible con vLLM mediante parches |

## Arquitectura y entrenamiento

La información disponible no detalla la composición del dataset de entrenamiento ni si hubo fases de RLHF o DPO. Lo que sí se conoce es la estructura del checkpoint: un transformer multimodal con una arquitectura denominada "Loop", que incorpora una cabecera MTP (multi-token prediction) y capas de atención lineal con parámetros específicos (`conv1d`, `A_log`, `dt_bias`). El modelo incluye un codificador de visión que se mantiene en BF16 tras la cuantización, junto con los embeddings, el `lm_head`, todas las normas, los routers mHC (en FP32) y el `loop_gate`.

La innovación técnica más destacable de esta publicación es el proceso de cuantización FP8: todas las capas lineales del modelo de lenguaje y de la cabecera MTP se almacenan como `float8_e4m3fn` con una escala por tensor calculada como `amax / 448`, replicando el algoritmo de cuantización en línea de vLLM. Las activaciones se cuantizan dinámicamente y, en GPUs Ampere, vLLM ejecuta estas capas como Marlin W8A16. El script de exportación está disponible en el repositorio del autor. La compatibilidad con vLLM requiere parches específicos, ya que la versión estándar no soporta la arquitectura Loop.

## Capacidades

- Generación de texto conversacional multi-turno.
- Entrada de imagen junto con texto (pipeline image-text-to-text); el autor confirma que la entrada de imagen funciona.
- Razonamiento con modo "thinking" activable (usado en las mediciones de decodificación del autor).
- Predicción multi-token (MTP) con tokens draft, que acelera la decodificación especulativa.
- Generación de código y de contenido web (empleado en los benchmarks de throughput del autor).
- Razonamiento matemático (evaluado con GSM8K).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Asistencia conversacional multimodal: el modelo acepta imágenes y texto, por lo que puede emplearse en interfaces de atención al cliente donde el usuario adjunte capturas, fotos de productos o documentos escaneados y espere respuestas en lenguaje natural.
- Generación de código en producción: el autor mide throughput de decodificación en tareas de generación de código; con 135 tok/s en dos RTX 3090 Ti, es viable para autocompletado y generación de fragmentos en pipelines de CI/CD, siempre que se integre mediante la API de vLLM.
- Razonamiento matemático asistido: con un rendimiento de 190/200 en las primeras 200 preguntas de GSM8K en modo greedy y thinking desactivado, es adecuado para tutores o asistentes de resolución de problemas aritméticos.
- Procesamiento de documentos con imagen: al combinar codificador de visión y contexto largo (se han medido hasta 97k tokens), puede extraer información de documentos escaneados y responder preguntas sobre ellos en una sola pasada.
- Despliegue en infraestructura con GPUs Ampere: la cuantización FP8 con Marlin W8A16 permite servir el modelo en dos RTX 3090 Ti con 6,0 GB de pesos por GPU, lo que reduce el coste frente a alternativas en BF16.
- Aceleración mediante decodificación especulativa: la cabecera MTP con dos tokens draft permite mejorar el throughput de decodificación, útil en servicios de generación de texto de baja latencia.
- Investigación sobre arquitecturas alternativas: la arquitectura Loop y la atención lineal lo convierten en un objeto de estudio para quienes investigan variantes de transformer y técnicas de cuantización FP8.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (2× RTX 3090 Ti, TP=2, MTP con 2 tokens draft, backend FLASHINFER):

| Métrica | Este checkpoint | FP8 en línea (`--quantization fp8`) |
|---|---|---|
| Decodificación tok/s, greedy (código y web, thinking on) | 135,2 / 136,1 | 138,2 / 137,9 |
| GSM8K, primeras 200 (greedy, thinking off) | 190/200 | 188/200 |
| Decodificación tok/s a contexto 1k / 97k | 110,6 / 93,6 (muestreado) | 123,5 / 101,6 (muestreado) |

Comparación previa frente a BF16 y AWQ, medida con FP8 en línea y backend FlashAttention 2 por defecto:

| Métrica | BF16 | FP8 |
|---|---|---|
| Decodificación tok/s (código y web, thinking on) | 85,6 | 121,8 |
| GSM8K, primeras 200 (greedy, thinking off) | 189/200 | 189/200 |
| Pesos por GPU | 8,9 GB | 6,0 GB |

El autor advierte que las cifras muestreadas varían un ±5% entre ejecuciones, por lo que recomienda comparar las filas greedy.

## Requisitos de hardware

- VRAM estimada: 11,3 GiB de pesos en FP8; en la configuración TP=2 del autor, 6,0 GB de pesos por GPU.
- GPUs recomendadas: RTX 3090 Ti (Ampere, con Marlin W8A16), A100, H100. El autor ha validado 2× RTX 3090 Ti con tensor parallelism.
- Cabe en GPU de consumo: sí, en GPUs con suficiente VRAM; el autor lo ejecuta en dos RTX 3090 Ti. No se dispone de datos para una sola GPU de consumo.
- Opciones de despliegue: vLLM 0.33.0 con los parches de `igerry/vllm-sensenova-loop` (commit `e077110` o posterior); llama.cpp, Ollama o TGI no están confirmados como soportados.
- Latencia y throughput: 135,2 tok/s en decodificación greedy con thinking activado; 110,6 tok/s a contexto de 1k y 93,6 tok/s a 97k en modo muestreado, sobre 2× RTX 3090 Ti con TP=2.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| SenseNova-Loop-9B-FP8 (este) | 9,66B | no disponible (probado hasta 97k) | Apache-2.0 | safetensors FP8, vLLM con parches | Multimodal, MTP, arquitectura Loop |
| SenseNova-Loop-9B (base) | 9,66B | no disponible | Apache-2.0 | safetensors BF16 | Peso aproximado de 19 GiB; mismo rendimiento GSM8K |
| Versión AWQ del mismo modelo | 9,66B | no disponible | Apache-2.0 | no disponible | Mencionada en la comparativa del autor; sin datos de throughput |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- La arquitectura Loop no está soportada por vLLM estándar: es obligatorio aplicar los parches del repositorio del autor y usar el commit `e077110` o posterior; versiones anteriores de `patch_fp8.py` rechazan este checkpoint por los parámetros `k/v/q/prob_scale` de atención.
- Solo se ha validado con el backend FLASHINFER y tensor parallelism 2; no hay garantías de funcionamiento en otras configuraciones.
- Los benchmarks publicados son del autor, con un conjunto limitado (primeras 200 preguntas de GSM8K) y sobre hardware concreto; no constituyen una evaluación exhaustiva.
- Las cifras muestreadas varían un ±5% entre ejecuciones, lo que dificulta comparaciones finas.
- No se dispone de información sobre sesgos, riesgo de alucinación, cobertura idiomática ni limitaciones de contexto del modelo base.
- La licencia Apache-2.0 permite uso comercial, pero el despliegue requiere mantener los parches de vLLM, lo que añade carga de mantenimiento en producción.
- El modelo tiene solo 32 descargas y 0 likes en el momento de la ficha, por lo que la validación comunitaria es mínima.

## Enlaces

- Hugging Face: https://huggingface.co/igerry/SenseNova-Loop-9B-FP8
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B
- Repositorio de parches para vLLM: https://github.com/igerry/vllm-sensenova-loop
- Script de exportación FP8: https://github.com/igerry/vllm-sensenova-loop/blob/main/tools/export_fp8.py
