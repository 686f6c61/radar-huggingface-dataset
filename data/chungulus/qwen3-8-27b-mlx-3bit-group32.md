# Chungulus/Qwen3.8-27B-MLX-3bit-Group32

## Resumen

Qwen3.8-27B-MLX-3bit-Group32 es una cuantización MLX de 3 bits del modelo Qwen3.8-27B, un modelo denso de visión-lenguaje de 27.000 millones de parámetros desarrollado por el equipo Qwen de Alibaba. Esta versión cuantizada, creada por el usuario Chungulus, reduce el tamaño del artefacto a 15,2 GB (decimal) para permitir su ejecución en hardware Apple Silicon con 32 GB de memoria unificada, sin necesidad de modificar el modelo original. No se trata de un fine-tune ni de una modificación de alineación, sino de una conversión puramente numérica mediante cuantización afín MLX de 3 bits con grupo de tamaño 32 y sin calibración.

El modelo base Qwen3.8-27B es un modelo multimodal nativo que combina una arquitectura híbrida Gated DeltaNet con atención completa, una torre de visión, un proyector y un componente MTP (Multi-Token Prediction). Su ventana de contexto nativa es de 262.000 tokens, aunque en esta cuantización solo se ha verificado un contexto de 73 tokens en las pruebas de validación. La relevancia de esta versión radica en que permite ejecutar un modelo de 27B con capacidades de visión, razonamiento y tool calling en equipos Apple con memoria limitada, a costa de una posible pérdida de calidad por la agresiva cuantización.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (híbrida Gated DeltaNet/atención completa) con torre de visión, proyector y MTP |
| Parametros totales | 27B (modelo base); el safetensors de esta cuantización reporta 4.665.462.000 (dato del autor, posiblemente erróneo) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262K (modelo base, no verificado en esta cuantización; prueba máxima registrada: 73 tokens) |
| Tipos de cuantizacion | 3-bit MLX affine, group size 32 (única disponible en este repo) |
| Idiomas soportados | No disponible (la model card no lo especifica; el modelo base Qwen suele ser multilingüe) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), incluye drafter MTP separado |

## Arquitectura y entrenamiento

Esta es una cuantización pura del checkpoint oficial de Qwen3.8-27B, sin ningún tipo de entrenamiento adicional, calibración o ajuste de pesos. El autor fija los pesos fuente al commit `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0` y aplica un algoritmo de cuantización afín MLX de 3 bits con grupo de tamaño 32. El inventario de tensores incluye 1199 tensores, de los cuales 333 corresponden a la torre de visión y 15 al componente MTP. La conversión requiere el runtime `mlx-vlm` versión 0.6.1.

La arquitectura subyacente es la del modelo Qwen3.8-27B, que emplea una combinación de capas Gated DeltaNet y atención completa, junto con un codificador visual y un proyector para entrada de imágenes y vídeo. El componente MTP (Multi-Token Prediction) actúa como un drafter para decodificación especulativa, aunque en las pruebas realizadas no se observó aceleración: el throughput con MTP fue de 15,95 tokens/s frente a 17,78 tokens/s sin él, por lo que el autor no anuncia ninguna mejora de velocidad.

## Capacidades

- Generación de texto, razonamiento y código, con soporte de modo thinking configurable (`enable_thinking`, `reasoning_effort`, `preserve_thinking`).
- Comprensión de imágenes y vídeo a través de la torre de visión integrada.
- Tool calling nativo en formato XML, validado con cinco casos de prueba.
- Capacidades multilingües no especificadas en la model card, pero heredadas del modelo base Qwen.
- MTP (Multi-Token Prediction) cargado y funcional, aunque sin aceleración medida.
- Chat template, tokenizador, procesador y configuración de generación verificados contra el modelo fuente.

## Casos de uso

- Ejecución local de un modelo multimodal de 27B en Apple Silicon con 32 GB de memoria unificada, ideal para desarrolladores que trabajan en Mac y necesitan prototipar aplicaciones de visión-lenguaje sin depender de la nube.
- Automatización de oficina: el modelo base está orientado a tareas de ofimática, como resumir documentos, extraer información de imágenes o generar informes, y esta cuantización permite hacerlo en un portátil.
- Asistente de programación con soporte de tool calling: puede integrarse en entornos de desarrollo para generar código, explicar fragmentos o ejecutar funciones externas mediante el formato XML nativo.
- Agentes conversacionales con razonamiento multi-paso: gracias al modo thinking configurable y al contexto largo (aunque no verificado en esta versión), puede mantener conversaciones complejas con memoria extendida.
- Análisis de imágenes y vídeo en local: la torre de visión permite describir contenido visual, responder preguntas sobre imágenes o procesar vídeos, útil en aplicaciones de accesibilidad o documentación.
- Pruebas de concepto y evaluación de cuantizaciones extremas: esta versión sirve para estudiar el impacto de la cuantización de 3 bits en la calidad de un modelo multimodal, comparando con versiones de 8 bits o el BF16 original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor proporciona únicamente métricas de comparación con el modelo BF16 original, medidas sobre casos funcionales fijos y no sobre conjuntos públicos:

| Métrica | Valor |
|---|---|
| Similitud semántica media (frente a BF16) | 0,9415 |
| Coincidencias exactas | 3 |
| Divergencia KL media (logits fijos) | 0,0918 |
| Perplejidad de referencia (BF16) | 9,847 |
| Perplejidad del candidato (3-bit) | 10,581 |
| Delta de perplejidad | +0,734 |
| Acuerdo top-1 | 0,8302 |
| Throughput medio de generación | 18,35 tokens/s |
| Pico de memoria | 15,92 GB |

Estas cifras son específicas del artefacto, del prompt y del hardware, y no deben interpretarse como una evaluación general del modelo.

## Requisitos de hardware

- Apple Silicon con al menos 32 GB de memoria unificada (recomendado por el autor).
- Pico de memoria medido durante la validación: 15,92 GB, lo que sugiere que podría caber en configuraciones de 24 GB, aunque no está garantizado.
- GPU: cualquier chip Apple Silicon (M1 Pro/Max/Ultra, M2, M3, M4) con suficiente memoria unificada.
- No requiere GPU NVIDIA ni VRAM dedicada; la inferencia se realiza mediante MLX.
- Opciones de despliegue: `mlx-vlm` (versión 0.6.1) para generación multimodal, `mlx-lm` para tareas de texto, y posiblemente otros frameworks compatibles con MLX.
- Latencia y throughput: aproximadamente 18,35 tokens/s en generación (medido en el hardware de validación), con MTP ligeramente inferior (15,95 tokens/s).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (BF16) | 27B | 262K | BF16 | Apache-2.0 | HuggingFace oficial |
| Chungulus/Qwen3.8-27B-MLX-3bit-Group32 | 27B (base) | 262K (no verificado) | 3-bit MLX | Apache-2.0 | HuggingFace |
| Chungulus/Qwen3.8-27B-MLX-8bit | 27B (base) | 262K (no verificado) | 8-bit MLX | Apache-2.0 | HuggingFace (existente, sin datos detallados) |

No se dispone de datos de rendimiento comparativo con otros modelos multimodales de tamaño similar (p. ej., Llama 3.2 Vision o Pixtral) en la información proporcionada.

## Limitaciones y advertencias

- La cuantización de 3 bits puede reducir significativamente la calidad del modelo, especialmente en tareas que requieren precisión numérica o razonamiento complejo.
- El contexto probado en las validaciones es de solo 73 tokens; no se garantiza el funcionamiento correcto con la ventana completa de 262K tokens.
- El componente MTP no ofrece aceleración en esta cuantización; de hecho, es ligeramente más lento que la generación sin él.
- El runtime debe soportar la arquitectura híbrida Gated DeltaNet/atención completa, la torre de visión, el proyector y el MTP; un cargador que solo lea tensores de lenguaje no es suficiente.
- No se realizó calibración durante la cuantización, por lo que la distribución de pesos puede no estar optimizada para la precisión de 3 bits.
- El número de parámetros reportado en el safetensors (4.665.462.000) no coincide con los 27B del modelo base; es probablemente un error del autor y debe interpretarse con cautela.
- La licencia Apache-2.0 permite uso comercial, pero se debe atribuir correctamente al modelo fuente y a esta cuantización.

## Enlaces

- Repositorio HuggingFace de la cuantización: https://huggingface.co/Chungulus/Qwen3.8-27B-MLX-3bit-Group32
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio oficial en GitHub: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Página del modelo en LM Studio: https://lmstudio.ai/models/qwen3.8
- Artículo en OpenLM.ai: https://openlm.ai/qwen3.8/
- Documentación de Unsloth para Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
