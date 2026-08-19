# malekoo/Qwen3.8-27B-MLX-bf16

## Resumen

El repositorio `malekoo/Qwen3.8-27B-MLX-bf16` contiene una conversión al formato MLX (Apple Silicon) del modelo denso Qwen3.8-27B, desarrollado por el equipo Qwen. Esta conversión, realizada con `mlx-lm`, conserva los pesos en bf16 sin cuantizar, lo que la hace bit-idéntica al checkpoint original salvo por la representación de las ganancias de RMSNorm (almacenadas como `1 + w`, matemáticamente equivalente). El resultado es un artefacto de solo texto: se eliminan el codificador de visión y el módulo de decodificación especulativa (MTP), por lo que no acepta imágenes ni vídeos y no realiza predicción multi-token.

El modelo base Qwen3.8-27B pertenece a la generación Qwen3.8, construida sobre la arquitectura Qwen3.5. Es un modelo denso de 27 000 millones de parámetros con una arquitectura híbrida 3:1 que combina atención lineal (Gated DeltaNet) y atención completa (Gated Attention), con una ventana de contexto nativa de 262 144 tokens. Incluye un modo de pensamiento (thinking mode) activado por defecto, con control de esfuerzo de razonamiento (`reasoning_effort`) y preservación del razonamiento (`preserve_thinking`). Esta conversión MLX permite ejecutar el modelo en hardware Apple Silicon con un rendimiento medido de ~10 tokens por segundo en un M5 Max, y existe una versión cuantizada a 4 bits que reduce el uso de memoria a ~15 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida 3:1 de atención lineal (Gated DeltaNet) y atención completa (Gated Attention), 64 capas, 16 bloques de `3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)` |
| Parametros totales | 26 895 993 856 (26,9 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens nativos (extensible a 1M, pero no configurado en esta conversión) |
| Tipos de cuantizacion | bf16 (sin cuantizar) en este repositorio; existe versión 4-bit en `malekoo/Qwen3.8-27B-MLX-4bit` |
| Idiomas soportados | No disponible en los metadatos; el tokenizador verifica soporte para texto, código, CJK, emoji y plantillas de chat |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

La arquitectura del modelo base Qwen3.8-27B es un transformer denso con una mezcla 3:1 de capas de atención lineal y atención completa. Cada bloque de 4 capas contiene 3 capas de Gated DeltaNet (48 cabezas V, 16 cabezas QK, dimensión de cabeza 128) seguidas de una capa de Gated Attention (24 cabezas Q, 4 cabezas KV, dimensión de cabeza 256, RoPE en 64 dimensiones). El vocabulario tiene 248 320 tokens. El modelo opera en modo de pensamiento por defecto, emitiendo un canal de razonamiento antes de la respuesta final, controlable mediante `reasoning_effort` (`xhigh`, `medium`, `low`).

No se dispone de información detallada sobre el entrenamiento del modelo base (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO) en la documentación de esta conversión. La conversión MLX elimina el codificador de visión (333 tensores) y el módulo MTP (15 tensores), conservando los 851 tensores de texto. La conversión es sin pérdidas: los pesos son bit-idénticos al original, salvo las ganancias de RMSNorm almacenadas en forma `1 + w`, verificadas como exactamente `source + 1.0`.

## Capacidades

- Generación de texto y conversación multi-turno con plantilla de chat.
- Modo de pensamiento (thinking mode) activado por defecto, con control de esfuerzo de razonamiento (`reasoning_effort`: `xhigh`, `medium`, `low`) y preservación del razonamiento (`preserve_thinking`).
- Ventana de contexto larga de 262 144 tokens, adecuada para documentos extensos y conversaciones prolongadas.
- Soporte multilingüe verificado a nivel de tokenizador (texto, código, CJK, emoji).
- Capacidades de razonamiento y generación de código heredadas del modelo base Qwen3.8-27B (no se incluyen benchmarks específicos en esta conversión).
- No incluye capacidades de visión (el codificador de visión se elimina) ni decodificación especulativa (MTP eliminado).
- No se documenta explícitamente soporte de tool calling o function calling en esta conversión; el modelo base Qwen3.8 podría incluirlo, pero no está confirmado en la información disponible.

## Casos de uso

- Asistencia de programación en entornos Apple Silicon: el modelo puede generar, explicar y depurar código en múltiples lenguajes, aprovechando su modo de pensamiento para razonar sobre problemas complejos antes de responder. Su ventana de 262K tokens permite procesar repositorios completos o archivos de gran tamaño.
- Análisis de documentos extensos: con 262 144 tokens de contexto, puede resumir, extraer información y responder preguntas sobre contratos, informes técnicos o literatura académica de cientos de páginas en una sola pasada.
- Chatbots conversacionales con razonamiento profundo: el modo de pensamiento permite respuestas más meditadas en aplicaciones de atención al cliente o asistentes virtuales, aunque requiere un parser para separar el canal de razonamiento de la respuesta final.
- Generación de documentación técnica: puede redactar documentación, comentarios de código y guías de usuario a partir de especificaciones o código fuente, gracias a su capacidad de procesar contexto largo y generar texto coherente.
- Investigación y análisis de datos: puede procesar logs, trazas y datos textuales extensos para identificar patrones, anomalías o tendencias, apoyándose en su razonamiento multi-paso.
- Desarrollo de agentes de texto en macOS: al ser una conversión MLX, se integra nativamente con el ecosistema Apple (mlx-lm) para prototipado rápido en portátiles con suficiente memoria unificada (≥54 GB para bf16, ≥15 GB para la versión 4-bit).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible de esta conversión. La model card del repositorio indica que los benchmarks de texto del modelo base se aplican en principio a esta conversión por su numeración bf16 idéntica, pero no se proporcionan los valores. El único dato de rendimiento medido es la perplejidad en wikitext-2 (test):

| Metrica | Valor |
|---|---|
| Perplejidad wikitext-2 (test) | 6,9352 (ventanas de 2048 tokens, sin solapamiento) |
| Velocidad de decodificacion (M5 Max, bf16) | ~10 tok/s a ~54 GB de memoria pico |
| Velocidad de decodificacion (M5 Max, 4-bit) | ~33 tok/s a ~15 GB de memoria pico (repo `malekoo/Qwen3.8-27B-MLX-4bit`) |

## Requisitos de hardware

- Memoria: ~54 GB de RAM unificada para la versión bf16 (pesos completos en memoria); ~15 GB para la versión 4-bit.
- Hardware objetivo: Apple Silicon (macOS) con Metal backend; medido en un M5 Max MacBook Pro.
- GPU recomendadas: no se proporcionan datos para GPUs NVIDIA o AMD; al ser formato MLX, está optimizado para Apple Silicon. Para GPUs de otros fabricantes se necesitaría una conversión a GGUF o el uso del checkpoint original con Transformers/vLLM.
- Opciones de despliegue: `mlx-lm` (CLI y servidor OpenAI-compatible), integrable en aplicaciones Python mediante `mlx_lm.load` y `mlx_lm.generate`.
- Latencia y throughput: ~10 tok/s en bf16 y ~33 tok/s en 4-bit (M5 Max), según las mediciones del autor de la conversión.

## Comparativa con modelos similares

No se dispone de datos de benchmarks para comparar con otros modelos de la misma categoría (p. ej., Llama 3.1 70B, Qwen2.5-32B, etc.) en la información proporcionada. La siguiente tabla compara esta conversión con el modelo base y la versión cuantizada:

| Modelo | Parametros | Contexto | Formato | Vision | MTP | Perplejidad wikitext-2 | Memoria |
|---|---|---|---|---|---|---|---|
| Qwen/Qwen3.8-27B (base) | 26,9 B | 262 144 | Safetensors (Transformers) | Sí | Sí | No disponible | No disponible |
| malekoo/Qwen3.8-27B-MLX-bf16 | 26,9 B | 262 144 | Safetensors (MLX) | No | No | 6,9352 | ~54 GB |
| malekoo/Qwen3.8-27B-MLX-4bit | 26,9 B | 262 144 | Safetensors (MLX, 4-bit) | No | No | 7,0871 | ~15 GB |

## Limitaciones y advertencias

- Esta conversión es solo texto: no acepta imágenes ni vídeos, a diferencia del modelo base que es nativamente vision-language.
- No incluye decodificación especulativa (MTP), por lo que la velocidad de generación puede ser inferior a la del checkpoint original con el módulo MTP activo.
- El contexto extendido más allá de 256K tokens no está configurado en esta conversión; el límite práctico es 262 144 tokens.
- El modo de pensamiento genera un canal de razonamiento que requiere un parser específico para separarlo de la respuesta final; el prompt de generación termina dentro de un bloque ` thinking` abierto.
- No se documentan sesgos específicos ni riesgos de alucinación para este modelo; como todo LLM, puede producir contenido inexacto o inventado, especialmente en tareas de razonamiento complejo.
- La licencia Apache-2.0 permite uso comercial, pero se hereda del modelo base; se recomienda revisar los términos de la licencia original de Qwen.
- El rendimiento en hardware no-Apple no está verificado; el formato MLX está diseñado para Apple Silicon.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/malekoo/Qwen3.8-27B-MLX-bf16
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Versión 4-bit: https://huggingface.co/malekoo/Qwen3.8-27B-MLX-4bit
- Blog de Qwen (anuncio del modelo): https://qwen.ai/blog?id=qwen3.8
- Librería mlx-lm: https://github.com/ml-explore/mlx-lm
