# Chungulus/Qwen3.8-27B-MLX-MXFP4

## Resumen

El modelo `Chungulus/Qwen3.8-27B-MLX-MXFP4` es una cuantización vanilla (sin fine-tuning) del modelo `Qwen/Qwen3.8-27B`, realizada por Chungulus con el algoritmo MLX MXFP4 de 4 bits. Su objetivo es permitir la ejecución de un modelo de visión-lenguaje de gran tamaño en hardware Apple Silicon con memoria unificada, reduciendo el peso de 27B parámetros (en BF16) a un artefacto de 16,1 GB. El modelo base utiliza la arquitectura interna `Qwen3_5ForConditionalGeneration`, que combina atención completa con capas híbridas Gated DeltaNet, e incluye un componente de visión, un proyector y un módulo MTP (Multi-Token Prediction) como drafter.

La relevancia de esta publicación radica en que ofrece una vía práctica para ejecutar un modelo de 27B con capacidades multimodales (imagen, video y texto) y tool calling en un Mac con 64 GB de RAM unificada, sin necesidad de GPUs dedicadas. El autor ha validado la conversión mediante pruebas funcionales y una comparación semántica contra el modelo original en BF16, reportando una similitud media de 0,9432. No se anuncian aceleraciones por MTP, ya que las mediciones no mostraron mejora de throughput.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: atención completa + Gated DeltaNet (identificador interno `Qwen3_5ForConditionalGeneration`), con torre de visión, proyector y módulo MTP |
| Parametros totales | 5.505.879.280 (según safetensors; el nombre del modelo sugiere 27B, pero el recuento real de tensores es ese) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (no especificado en la model card) |
| Tipos de cuantizacion | MXFP4 (4 bits, group_size 32) para pesos de lenguaje; FP16 para visión y MTP |
| Idiomas soportados | No disponible (no especificado en la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una cuantización directa de `Qwen/Qwen3.8-27B`, sin modificaciones en el chat template, tokenizer, processor ni generation config. El algoritmo de conversión aplica MXFP4 (4 bits, group_size 32) a los pesos de lenguaje, mientras que la torre de visión y el módulo MTP se mantienen en FP16. No se utilizó calibración (calibration_source: none), por lo que la cuantización es puramente estadística sobre los pesos originales.

El modelo base emplea una arquitectura híbrida que combina capas de atención completa con capas Gated DeltaNet, un mecanismo de estado recurrente que reduce el coste de atención para secuencias largas. Además, incluye un componente de visión (333 tensores) para procesar imágenes y video, y un módulo MTP (15 tensores) diseñado para acelerar la decodificación mediante predicción de múltiples tokens. El entrenamiento original del modelo base no está documentado en esta model card; solo se sabe que es una cuantización sin fine-tuning ni cambios de alineación.

## Capacidades

- Generación de texto y razonamiento: el modelo base Qwen3.8-27B es un LLM conversacional con capacidades de razonamiento, aunque la cuantización puede afectar ligeramente la calidad.
- Visión y video: soporta entrada de imágenes (y posiblemente video, según los tests) gracias a la torre de visión y al proyector. Se validaron tres casos de visión con éxito.
- Tool calling: soporta el formato nativo de tools XML de Qwen. Se pasaron cinco pruebas de tool calling.
- MTP (Multi-Token Prediction): el módulo MTP se carga y funciona, pero en las pruebas no mostró aceleración real (speedup 0,96, por lo que no se anuncia como ventaja).
- Multilingüe: no se especifica en la model card, aunque el modelo base Qwen suele ser multilingüe; no se puede confirmar.
- Modo thinking: se menciona que se deben usar los controles del chat template original (`enable_thinking`, `reasoning_effort`, `preserve_thinking`), lo que sugiere soporte para razonamiento con cadena de pensamiento.

## Casos de uso

- Despliegue local en Apple Silicon: el caso principal es ejecutar un modelo de 27B con visión y tool calling en un Mac con 64 GB de memoria unificada, usando `mlx-vlm` para generación de texto e imágenes.
- Asistente multimodal de escritorio: integrar el modelo en aplicaciones que necesiten describir imágenes, responder preguntas sobre capturas de pantalla o procesar documentos escaneados, gracias a su componente de visión.
- Agente con tool calling: usar el soporte nativo de tools XML para construir agentes que llamen a APIs, ejecuten código o interactúen con servicios externos, todo en local.
- Prototipado rápido de aplicaciones de IA generativa: al ser una cuantización lista para MLX, permite iterar sin necesidad de GPUs dedicadas, reduciendo costes de infraestructura.
- Investigación en cuantización: el repositorio documenta el proceso de conversión MXFP4 y las pruebas de validación, sirviendo como referencia para otros desarrolladores que quieran cuantizar modelos similares.
- Generación de texto con contexto largo: aunque no se ha probado más allá de 73 tokens de prompt, la arquitectura híbrida con Gated DeltaNet está diseñada para manejar secuencias largas de forma eficiente, lo que podría ser útil para resúmenes o análisis de documentos extensos (siempre que se valide el contexto real).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo incluye métricas de validación interna:

| Metrica | Valor |
|---|---|
| Similitud semantica media vs BF16 | 0,9432 |
| Coincidencias exactas vs BF16 | 3 |
| TPS promedio (generacion) | 18,04 |
| Memoria pico (generacion) | 14,99 GB |
| Tamano del artefacto | 16,1 GB (decimal) |
| Maximo prompt tokens probado | 73 |
| Aceptacion de drafts MTP | 24/24 (tasa 1,0) |
| Speedup MTP | 0,96 (sin mejora) |

Estas cifras son específicas del hardware y del prompt utilizado; no representan una evaluación general del modelo.

## Requisitos de hardware

- Hardware objetivo: Apple Silicon con 64 GB de memoria unificada (según la model card).
- Memoria pico medida: 14,99 GB durante la generación (con el artefacto cargado), lo que sugiere que podría caber en equipos con menos RAM, pero no está garantizado.
- GPU recomendada: no aplica; usa la GPU integrada y la memoria unificada del chip Apple Silicon (M-series).
- Opciones de despliegue: `mlx-vlm` (para generación con imágenes) y `mlx-lm` (para texto), ambos con soporte MXFP4 y MTP. Se requiere `mlx==0.31.2`, `mlx-lm==0.31.3` y `mlx-vlm==0.6.1`.
- Latencia y throughput: TPS promedio de 18,04 en el hardware de prueba (no especificado), con y sin MTP prácticamente iguales (15,58 vs 14,97 TPS en la prueba A/B).
- No se menciona soporte para GPUs NVIDIA o AMD; el formato MLX es específico de Apple Silicon.

## Comparativa con modelos similares

No se dispone de datos de otros modelos comparables en la información proporcionada. La única comparación posible es con el modelo original `Qwen/Qwen3.8-27B` en BF16:

| Modelo | Parametros | Cuantizacion | Tamano | Memoria pico | Similitud semantica |
|---|---|---|---|---|---|
| Qwen/Qwen3.8-27B (BF16) | ~27B | Ninguna (BF16) | ~54 GB (estimado) | No medido | Referencia |
| Chungulus/Qwen3.8-27B-MLX-MXFP4 | 5.505.879.280 (safetensors) | MXFP4 4-bit | 16,1 GB | 14,99 GB | 0,9432 vs BF16 |

No se incluyen otras cuantizaciones (GGUF, AWQ, etc.) por falta de datos en la fuente.

## Limitaciones y advertencias

- La cuantización a 4 bits puede degradar la calidad del modelo, especialmente en tareas que requieren precisión numérica o razonamiento complejo. La similitud semántica del 94,3% no garantiza igualdad de comportamiento.
- El soporte de runtime es específico: se requiere `mlx-vlm` y `mlx-mtp` con soporte MXFP4. Un loader que solo lea tensores de lenguaje no es suficiente para ejecutar el modelo completo (visión, proyector, MTP).
- La longitud de contexto no ha sido probada más allá de 73 tokens de prompt. No se debe inferir el contexto máximo del modelo base a partir de esta cuantización.
- El módulo MTP no ofrece aceleración en las pruebas realizadas; no se debe esperar una mejora de velocidad.
- No se han publicado resultados de benchmarks estándar, por lo que no hay evidencia de rendimiento en tareas académicas.
- La licencia Apache-2.0 permite uso comercial, pero se debe atribuir al modelo original y a esta cuantización según los términos de la licencia.
- El recuento de parámetros en safetensors (5,5B) difiere del nombre del modelo (27B); esto puede deberse a la exclusión de ciertos tensores o a la representación cuantizada. Se recomienda verificar antes de usar en producción.

## Enlaces

- Modelo cuantizado: https://huggingface.co/Chungulus/Qwen3.8-27B-MLX-MXFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
