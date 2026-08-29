# Saren/Qwen3.8-Flash-Next-ple-table-fp8

## Resumen

Este repositorio no contiene un modelo de lenguaje completo, sino un componente específico del modelo Qwen3.8-Flash-Next: la tabla de embeddings n-gram (denominada "PLE" o "Engram") de 51 mil millones de parámetros, extraída en formato fp8 a partir de la versión oficial Qwen/Qwen3.8-Flash-Next-FP8. El autor, Saren, ha dividido esta tabla en shards para poder servirla desde disco mediante mmap, de modo que en un DGX Spark (GB10) solo se accede a 16 filas de 160 bytes por token, en lugar de ocupar aproximadamente 44 GiB de la memoria unificada del dispositivo.

El modelo original Qwen3.8-Flash-Next es un MoE ultra-sparse de 125B parámetros (más 51B de la tabla n-gram) que activa 6B parámetros por token, con una ventana de contexto de 262K tokens y capacidades multimodales. Este repositorio complementa a otro del mismo autor, Saren/Qwen3.8-Flash-Next-W4A16-AutoRound-hybrid, y está pensado para despliegues en hardware con memoria unificada limitada, como el DGX Spark, donde la tabla de embeddings se lee directamente del almacenamiento.

La relevancia de esta pieza radica en que permite ejecutar el modelo completo en dispositivos con poca VRAM o memoria unificada, reduciendo drásticamente el consumo de memoria sin sacrificar la calidad de las representaciones n-gram, que son clave para el rendimiento en tareas de razonamiento y codificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tabla de embeddings n-gram (PLE/Engram) del modelo Qwen3.8-Flash-Next |
| Parametros totales | 51 mil millones (solo la tabla) |
| Parametros activos | No aplica (es un componente estático) |
| Longitud de contexto | No aplica (la tabla no tiene contexto; el modelo base soporta 262K) |
| Tipos de cuantizacion | fp8 (8 bits en coma flotante) |
| Idiomas soportados | No disponible (depende del modelo base) |
| Licencia | qwen (licencia propia de Qwen, ver enlace) |
| Formato de pesos | No disponible (shards extraídos; probablemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

Este repositorio contiene únicamente la tabla de embeddings n-gram del modelo Qwen3.8-Flash-Next, un componente que forma parte de la arquitectura híbrida del modelo base. El modelo completo combina Gated DeltaNet (GDN) en tres de cada cuatro capas para comprimir el historial, y Qwen Sparse Attention (QSA) en la cuarta capa para recuperación precisa de contexto largo. La tabla n-gram añade 51B parámetros adicionales que mejoran la representación de patrones de tokens frecuentes, contribuyendo a la eficiencia en tareas de codificación y razonamiento.

No se dispone de información detallada sobre el entrenamiento específico de esta tabla, ya que es un extracto del modelo base Qwen/Qwen3.8-Flash-Next-FP8. El modelo original fue entrenado con un coste de entrenamiento aproximadamente 9 veces menor que Qwen3.7-Plus, según la documentación oficial, y utiliza técnicas de ultra-sparse MoE con 6B parámetros activos por token. Este repositorio no modifica los pesos, solo los reorganiza en shards para facilitar la carga desde disco.

## Capacidades

- No es un modelo autónomo: no genera texto ni realiza inferencias por sí mismo.
- Proporciona las representaciones n-gram del modelo Qwen3.8-Flash-Next en fp8, listas para ser cargadas mediante mmap.
- Permite servir el modelo completo en hardware con memoria unificada limitada (p. ej., DGX Spark) sin cargar la tabla completa en RAM/VRAM.
- Compatible con el repositorio companion Saren/Qwen3.8-Flash-Next-W4A16-AutoRound-hybrid, que contiene el resto del modelo cuantizado.
- Diseñado para integrarse con el pipeline de inferencia descrito en el repositorio GitHub Saren-Arterius/qwen3.8-Flash-DGX-AutoRound.

## Casos de uso

- Despliegue de Qwen3.8-Flash-Next en DGX Spark (GB10): al servir la tabla n-gram desde disco mediante mmap, se libera ~44 GiB de memoria unificada, permitiendo ejecutar el modelo completo en este hardware de 128 GB de RAM unificada.
- Inferencia de largo contexto en entornos con memoria limitada: la tabla se accede por filas (16 filas × 160 B por token), lo que reduce el pico de memoria y permite procesar secuencias de hasta 262K tokens sin desbordar la memoria.
- Investigación sobre embeddings n-gram: los shards en fp8 permiten estudiar el impacto de la tabla PLE en el rendimiento del modelo, comparando con versiones en otros formatos o cuantizaciones.
- Integración en pipelines de inferencia personalizados: desarrolladores pueden apuntar la variable `TABLE_DIR` a este repositorio y usar el código del GitHub del autor para cargar el modelo híbrido cuantizado.
- Evaluación de la calidad de representaciones en fp8: útil para medir la degradación (si existe) al usar fp8 frente a bf16 o fp16 en la tabla n-gram.
- Optimización de costes en entornos de producción: al no requerir GPU adicional para la tabla, se reduce el coste de hardware en despliegues que usan el modelo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este repositorio, ya que es un componente auxiliar. El modelo completo Qwen3.8-Flash-Next ha demostrado superar a Claude-4.6-Opus (Max) en ciertas tareas, según la documentación de unsloth, pero no se dispone de cifras concretas en la información proporcionada. Para evaluar el rendimiento de la tabla en fp8, se recomienda consultar los benchmarks del modelo base o ejecutar pruebas propias con el pipeline del autor.

## Requisitos de hardware

- La tabla en fp8 ocupa 52.3 GB en disco, pero no requiere VRAM dedicada si se sirve mediante mmap.
- En un DGX Spark (GB10) con 128 GB de memoria unificada, el modelo completo (incluyendo esta tabla) puede ejecutarse sin GPU adicional, según unsloth (75 GB de RAM/unified memory son suficientes).
- Para otros entornos, se necesita un sistema con almacenamiento de alta velocidad (NVMe) para minimizar la latencia de acceso a la tabla.
- El repositorio companion (W4A16-AutoRound-hybrid) contiene el resto del modelo cuantizado, que sí requiere VRAM para la inferencia de las capas principales.
- Opciones de despliegue: el código de inferencia está disponible en el repositorio GitHub del autor; también se puede usar con vLLM o TGI si se integra la tabla como un módulo externo, aunque no está documentado oficialmente.

## Comparativa con modelos similares

Dado que este repositorio es un componente, la comparativa se realiza a nivel del modelo completo Qwen3.8-Flash-Next frente a alternativas de la misma categoría (MoE ultra-sparse de gran tamaño):

| Modelo | Parámetros totales | Activos por token | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (con tabla) | 125B + 51B | 6B | 262K | qwen | Abierta (HuggingFace) |
| Qwen3.7-Plus | No disponible | No disponible | No disponible | qwen | No disponible |
| Claude-4.6-Opus (Max) | No disponible | No disponible | No disponible | Propietaria | API |

No se dispone de datos suficientes para una comparativa detallada con otros modelos MoE de código abierto en la información proporcionada.

## Limitaciones y advertencias

- Este repositorio no es un modelo funcional por sí mismo; requiere el modelo base Qwen/Qwen3.8-Flash-Next-FP8 y el código de integración del autor.
- La licencia es "qwen" (licencia propia de Qwen), que puede imponer restricciones de uso comercial; se debe revisar el texto completo en el enlace proporcionado.
- No se ha verificado la integridad de los shards ni su compatibilidad con versiones futuras del modelo base.
- El uso de mmap implica que el rendimiento depende de la velocidad de almacenamiento; en discos lentos, la latencia de acceso a la tabla puede degradar la inferencia.
- No hay información sobre sesgos o alucinaciones específicos de este componente; estos dependen del modelo completo.
- El formato de pesos no está confirmado (probablemente safetensors), lo que puede afectar a la interoperabilidad con ciertos frameworks.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/Saren/Qwen3.8-Flash-Next-ple-table-fp8
- Modelo base (FP8): https://huggingface.co/Qwen/Qwen3.8-Flash-Next-FP8
- Modelo original Qwen3.8-Flash-Next: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio companion (W4A16): https://huggingface.co/Saren/Qwen3.8-Flash-Next-W4A16-AutoRound-hybrid
- Código de integración (GitHub): https://github.com/Saren-Arterius/qwen3.8-Flash-DGX-AutoRound
- Documentación oficial de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Guía de ejecución local (unsloth): https://unsloth.ai/docs/models/qwen3.8-next
- Recetas vLLM: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
- Colección oficial de Qwen: https://huggingface.co/collections/Qwen/qwen38-flash-next
