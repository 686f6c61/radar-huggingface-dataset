# dachans/Qwen3.8-27B-abliterated-GGUF

## Resumen

Qwen3.8-27B-abliterated-GGUF es una colección de cuantizaciones GGUF del modelo Qwen3.8-27B tras aplicar la técnica de "abliteration", que elimina la dirección de rechazo de los pesos del modelo. El resultado es una versión sin guardarraíles de seguridad que responde a cualquier petición sin negarse, manteniendo las capacidades del modelo original. El modelo base, desarrollado por el equipo Qwen, emplea una arquitectura híbrida con Gated DeltaNet y Gated Attention, cuenta con 27,78 mil millones de parámetros y una ventana de contexto de 262 144 tokens, extensible a más de un millón.

Esta versión cuantizada, publicada por el usuario dachans en Hugging Face, está pensada para su ejecución local con motores compatibles con GGUF como llama.cpp, Ollama o LM Studio. Ofrece seis niveles de cuantización, desde Q8_0 (casi sin pérdida) hasta Q2_K (para VRAM limitada), lo que permite adaptar el modelo a diferentes capacidades de hardware. Su relevancia radica en combinar un modelo de gran tamaño con contexto muy largo, una licencia permisiva Apache 2.0 y la posibilidad de desplegarlo en entornos sin conexión, además de servir como herramienta de investigación sobre alineación y seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida (Gated DeltaNet + Gated Attention) |
| Parametros totales | 27,78 mil millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262 144 tokens (extensible a 1M+) |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M, Q2_K |
| Idiomas soportados | Inglés, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B utiliza una arquitectura híbrida que combina Gated DeltaNet y Gated Attention. Esta combinación permite manejar secuencias muy largas (262 144 tokens) con una eficiencia computacional superior a la de los transformers puros, manteniendo la calidad de atención global. El proceso de abliteration, aplicado por douyamv, consiste en proyectar fuera la "dirección de rechazo" de los pesos de `self_attn.o_proj` y `mlp.down_proj` en todas las capas, eliminando así la tendencia del modelo a negarse a responder ciertas peticiones. Posteriormente, dachans convirtió los pesos a formato GGUF y aplicó cuantizaciones estándar (Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M, Q2_K) para reducir el tamaño y permitir su ejecución en hardware variado. No se dispone de información detallada sobre el dataset de entrenamiento del modelo base ni sobre el uso de técnicas como RLHF o DPO.

## Capacidades

- Generación de texto y conversación multi-turno en inglés y chino.
- Razonamiento y comprensión de contexto largo gracias a su ventana de 262 144 tokens.
- Generación de código y soporte de tareas técnicas (heredado del modelo base, aunque no se especifica en la documentación).
- Respuesta sin rechazos: al estar abliterado, no aplica guardarraíles de seguridad y responde a cualquier petición, incluidos temas controvertidos o prohibidos.
- Compatibilidad con motores de inferencia GGUF: llama.cpp, Ollama, LM Studio y otros.
- Posibilidad de extender el contexto a más de 1 millón de tokens (según el modelo base).

## Casos de uso

- Investigación sobre alineación y seguridad de modelos: permite estudiar el comportamiento de un LLM sin mecanismos de rechazo, analizando sesgos, alucinaciones y límites éticos en entornos controlados.
- Generación de contenido creativo sin restricciones: escritura de narrativas adultas, exploración de temas tabú o creación de guiones para proyectos artísticos donde se requiere libertad total de expresión.
- Asistente personal local con contexto largo: al ejecutarse en local con Ollama o llama.cpp, puede mantener conversaciones extensas sobre documentos, libros o historiales completos sin perder el hilo.
- Análisis de documentos extensos: su ventana de 262 144 tokens permite procesar manuales, contratos o informes largos de una sola vez, extrayendo información y resumiendo sin necesidad de dividir el texto.
- Desarrollo de chatbots para nichos específicos: en comunidades donde se requiere un tono sin censura (por ejemplo, foros de debate libre), este modelo puede servir como base para un asistente conversacional.
- Pruebas de robustez y red teaming: evaluar cómo responde el modelo a prompts maliciosos o peligrosos cuando no hay barreras de seguridad, útil para desarrollar mejores sistemas de protección.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base Qwen3.8-27B podría tener métricas oficiales, pero no se incluyen en la documentación de esta versión cuantizada.

## Requisitos de hardware

- Q2_K (~7,9 GB): requiere al menos 8 GB de VRAM, apto para GPUs de gama media como RTX 3060 o RTX 4060.
- Q3_K_M (~13 GB): necesita unos 14 GB de VRAM, compatible con RTX 4080 o RTX 3090.
- Q4_K_M (~16 GB): requiere 16 GB de VRAM o más, recomendado para RTX 4090 o A100.
- Q5_K_M (~19 GB): necesita unos 20 GB de VRAM, adecuado para A100 o GPUs de 24 GB.
- Q6_K (~21 GB): requiere 22 GB de VRAM, solo en GPUs profesionales o de alta gama.
- Q8_0 (~28 GB): necesita 30 GB de VRAM, típicamente en A100, H100 o GPUs de 32 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier motor compatible con GGUF. Para producción, se puede usar vLLM con conversión a formato compatible, aunque no está documentado.
- La latencia y el throughput dependen del hardware y de la cuantización; no se proporcionan datos específicos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Abliterado |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27,78B | 262 144 | Apache 2.0 | safetensors | No |
| Qwen3.8-27B-abliterated (safetensors) | 27,78B | 262 144 | Apache 2.0 | safetensors | Sí |
| Qwen3.8-27B-abliterated-GGUF (este) | 27,78B | 262 144 | Apache 2.0 | GGUF | Sí |

No se dispone de comparativas con otros modelos abliterados de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- Al eliminar los guardarraíles, el modelo puede generar contenido ofensivo, ilegal o peligroso sin filtro. Su uso debe limitarse a investigación y entornos controlados.
- Riesgo de alucinaciones: como cualquier LLM, puede inventar información, especialmente en temas especializados o con contexto ambiguo.
- Solo soporta inglés y chino; no se garantiza un buen rendimiento en otros idiomas.
- La cuantización Q2_K y Q3_K_M degradan notablemente la calidad de las respuestas; se recomienda Q4_K_M o superior para uso general.
- La licencia Apache 2.0 permite uso comercial, pero el usuario es responsable del contenido generado y de cumplir las leyes aplicables.
- No se han publicado benchmarks ni evaluaciones de seguridad para esta versión cuantizada, por lo que su rendimiento real en tareas específicas es desconocido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dachans/Qwen3.8-27B-abliterated-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo abliterado (safetensors): https://huggingface.co/douyamv/Qwen3.8-27B-abliterated
- GGUF del modelo base (sin abliterar): https://huggingface.co/douyamv/Qwen3.8-27B-GGUF
- Versión FP8: https://huggingface.co/douyamv/Qwen3.8-27B-FP8
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
