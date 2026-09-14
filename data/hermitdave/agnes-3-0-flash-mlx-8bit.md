# hermitdave/Agnes-3.0-Flash-MLX-8bit

## Resumen

Agnes-3.0-Flash-MLX-8bit es una cuantización de 8 bits en formato MLX del modelo Agnes-AI/Agnes-3.0-Flash, publicada por el usuario hermitdave. Se trata de una conversión, no de un modelo entrenado desde cero: el autor ha transformado los pesos originales al formato estándar de la arquitectura Qwen3.5 para que puedan cargarse con `mlx-lm` sin código personalizado, y ha serializado los pesos en fp16 con cuantización afín de 8 bits y tamaño de grupo 64 (8,50 bits por peso). El resultado ocupa unos 32 GB de pesos, con un repositorio de 34,2 GB.

El modelo cuenta con 32.205.067.008 parámetros (aproximadamente 32,2 mil millones) y una ventana de contexto de 262.144 tokens. La arquitectura es híbrida: combina atención global con capas de atención lineal basadas en gated delta net, según reflejan las etiquetas `hybrid-attention` y `gated-delta-net`. Soporta modo de razonamiento (thinking) activable y desactivable mediante la plantilla de chat original. Esta versión es exclusivamente de texto: el autor ha eliminado la cabeza MTP y la torre de visión presentes en el modelo original.

Su relevancia actual es doble. Por un lado, permite ejecutar un modelo de 32B con contexto de 262.144 tokens en hardware Apple Silicon mediante MLX, algo que las cuantizaciones GGUF o los pesos bf16 originales no facilitan en ese ecosistema. Por otro lado, el autor publica un drafter MTP independiente que habilita decodificación especulativa con ganancias declaradas de hasta 2× en velocidad de generación. La licencia es Apache-2.0, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida con atención global y atención lineal (gated delta net); compatible con la arquitectura `qwen3_5` |
| Parámetros totales | 32.205.067.008 (≈32,2 B) |
| Parámetros activos | No aplica / no disponible: no se indica que el modelo sea MoE |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | Afín de 8 bits, tamaño de grupo 64 (8,50 bits por peso); existe una versión MLX de 4 bits del mismo autor |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors para MLX (serialización en fp16); `intermediate_size` de 19.456 tras la fusión de la FFN paralela |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer híbrido que alterna atención global con capas de atención lineal basadas en gated delta net, un esquema que busca reducir el coste computacional del contexto largo manteniendo la capacidad de recuperación de información lejana. La conversión de hermitdave adapta esta arquitectura al formato estándar de Qwen3.5 mediante varias transformaciones documentadas: plegado de la FFN paralela dentro del MLP principal por concatenación (resultando en un `intermediate_size` de 19.456), renombrado de `delta_attn` a `linear_attn` y de `global_attn` a `self_attn`, conversión de la normalización RMSNorm de tipo one-centered al formato estándar, y cambio de tipo de bf16 a fp16 para compatibilidad de serialización. También se eliminaron los pesos de la cabeza MTP para evitar una doble conversión en `mlx_lm`, y no se incluye la torre de visión.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si el modelo original pasó por fases de RLHF o DPO. El proceso de conversión fue realizado por Hermes Agent, el pipeline autónomo de investigación y conversión de Nous Research, que según el autor identificó los parámetros de cuantización correctos, corrigió la conversión de la norma one-centered y validó la calidad de salida contra la versión Agnes-3.0-Flash-MLX-4bit. La innovación técnica destacable en esta publicación es la disponibilidad de un drafter MTP independiente (hermitdave/Agnes-3.0-Flash-MTP-drafter), arquitectónicamente compatible con la atención con compuertas de Qwen3.5, extraído del modelo original y pensado para decodificación especulativa.

## Capacidades

- Generación de texto y conversación multi-turno en inglés y chino.
- Modo de razonamiento (thinking) activable y desactivable mediante la plantilla de chat original.
- Procesamiento de contextos muy largos: hasta 262.144 tokens, apoyado en el esquema de atención híbrida con capas lineales.
- Compatibilidad directa con `mlx-lm` como modelo `qwen3_5` estándar, sin código personalizado.
- Integración en LM Studio colocando la carpeta bajo `~/.lmstudio/models/hermitdave/`.
- Decodificación especulativa opcional con el drafter MTP, con una mejora declarada de hasta 2× en velocidad de generación.
- Inferencia exclusivamente de texto: la torre de visión y la cabeza MTP no están incluidas en esta cuantización.
- Soporte de tool calling o function calling: no disponible en la información proporcionada.
- Capacidades de agente o razonamiento multi-paso: no documentadas explícitamente en la información proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Procesamiento de documentos largos en local: la ventana de 262.144 tokens permite cargar manuales técnicos, expedientes o bases de código extensas en una sola pasada sin troceado, algo especialmente útil cuando los datos no pueden salir del equipo.
- Asistente conversacional bilingüe inglés-chino: el modelo está etiquetado para ambos idiomas y soporta conversación multi-turno, por lo que encaja en herramientas internas de soporte para equipos con presencia en ambos mercados.
- Inferencia privada en Apple Silicon: al ser una cuantización MLX de 8 bits con unos 32 GB de pesos, permite desplegar un modelo de 32B en Macs con memoria unificada amplia sin depender de servicios en la nube.
- Generación de texto y resumen con razonamiento explícito: el modo thinking permite activar cadenas de razonamiento cuando la tarea lo requiere (análisis, extracción estructurada) y desactivarlas para tareas de redacción directa donde prima la latencia.
- Servicio de generación con baja latencia: combinando el modelo con el drafter MTP mediante `mlx-vlm.server`, se puede servir una API local con decodificación especulativa para reducir el tiempo por token en cargas interactivas.
- Evaluación y banco de pruebas de cuantizaciones: al existir versiones de 4 y 8 bits del mismo autor, el modelo sirve para medir el impacto de la cuantización en la calidad de salida sobre la misma arquitectura.
- Automatización de redacción técnica en chino e inglés: traducción asistida, generación de documentación y reformulación de textos técnicos dentro de pipelines locales.
- Prototipado de aplicaciones de contexto largo: desarrollo y validación de sistemas de recuperación aumentada donde el contexto completo se inyecta en el prompt en lugar de depender de un índice vectorial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El autor únicamente indica que el proceso de conversión fue validado cualitativamente contra la versión de 4 bits del mismo modelo, sin aportar métricas numéricas (MMLU, HumanEval, GSM8K u otras) ni comparaciones cuantitativas. La única cifra de rendimiento declarada es la mejora de hasta 2× en velocidad de generación al usar el drafter MTP para decodificación especulativa.

## Requisitos de hardware

- Pesos: 8,50 bits por peso, aproximadamente 32 GB de pesos; el repositorio completo ocupa 34,2 GB.
- Memoria unificada recomendada: al menos 36 GB para cargar los pesos, y 64 GB o más si se pretende aprovechar buena parte de la ventana de 262.144 tokens, dado que la caché KV para ese contexto no está cuantificada en esta conversión.
- GPU: MLX está diseñado para Apple Silicon, por lo que las GPU NVIDIA (A100, H100, RTX 4090) no son compatibles directamente con esta conversión. No se publica una versión GGUF ni un formato alternativo en el repositorio.
- GPU de consumo: no aplica a esta conversión; en hardware NVIDIA habría que convertir los pesos a otro formato, algo que el autor no documenta.
- Despliegue: `mlx-lm` (`mlx_lm.generate`), LM Studio, y `mlx-vlm` en modo servidor cuando se usa el drafter MTP.
- Decodificación especulativa: requiere instalar `mlx-vlm` y descargar por separado el drafter hermitdave/Agnes-3.0-Flash-MTP-drafter.
- Latencia y throughput: no disponibles. Solo se declara la mejora relativa de hasta 2× con decodificación especulativa.
- Tamaño de caché KV a contexto máximo: no disponible.

## Comparativa con modelos similares

La información disponible solo permite comparar dentro de la propia familia Agnes; no se han encontrado datos de benchmarks ni especificaciones de modelos alternativos en los resultados de búsqueda (que no aportaron material relevante).

| Modelo | Parámetros | Contexto | Cuantización / formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hermitdave/Agnes-3.0-Flash-MLX-8bit | 32,2 B | 262.144 tokens | Afín 8 bits MLX, safetensors fp16, ~32 GB | Apache-2.0 | Repositorio MLX, 0 descargas y 0 likes en el momento de la consulta |
| hermitdave/Agnes-3.0-Flash-MLX-4bit | No disponible | No disponible | MLX 4 bits | Apache-2.0 (heredada del modelo base, según la información disponible) | Citada como referencia de validación por el autor |
| Agnes-AI/Agnes-3.0-Flash (base) | No disponible | 262.144 tokens (según la conversión) | Formato original Agnes, incluye torre de visión y cabeza MTP | Apache-2.0 | Modelo original en HuggingFace |

No se dispone de datos de otros modelos comparables de la misma categoría (32B con contexto de 256K) en la información proporcionada.

## Limitaciones y advertencias

- Es una conversión de cuantización, no un modelo nuevo: no añade ni mejora capacidades respecto al modelo base.
- Solo texto: la torre de visión del modelo original no está incluida, por lo que no puede procesar imágenes.
- La cabeza MTP se ha eliminado del modelo principal; para decodificación especulativa hay que usar el drafter separado.
- Idiomas limitados a inglés y chino según las etiquetas del repositorio; el comportamiento en castellano no está documentado.
- No hay resultados de benchmarks publicados, por lo que la degradación de calidad introducida por la cuantización de 8 bits respecto a los pesos originales no está cuantificada.
- Riesgo de alucinación: inherente a los modelos generativos de este tamaño; no se aporta ninguna evaluación específica al respecto.
- Sesgos: no se documenta ninguna evaluación de sesgos ni de seguridad en la información disponible.
- La ventana de 262.144 tokens es teórica: el consumo de memoria de la caché KV a esa longitud no está documentado y puede exceder la capacidad de muchos equipos.
- Rendimiento declarado de hasta 2× con decodificación especulativa: es una cifra del autor, sin condiciones de medición ni hardware de referencia especificados.
- Compatibilidad restringida al ecosistema MLX / Apple Silicon; no se ofrece GGUF, GPTQ, AWQ ni pesos para vLLM o TGI.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay validación independiente por parte de la comunidad.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda verificar los términos del modelo base y las atribuciones indicadas por el autor de la conversión.
- La fecha de creación del repositorio figura como 2026-09-13, dato que procede de la ficha de HuggingFace y que conviene contrastar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hermitdave/Agnes-3.0-Flash-MLX-8bit
- Modelo base: https://huggingface.co/Agnes-AI/Agnes-3.0-Flash
- Drafter MTP para decodificación especulativa: https://huggingface.co/hermitdave/Agnes-3.0-Flash-MTP-drafter
- Hermes Agent (Nous Research): https://hermes-agent.nousresearch.com

Los resultados de búsqueda web disponibles no contenían información relevante sobre el modelo (correspondían a páginas de ayuda de YouTube y a la comunidad Zhihu), por lo que no se han podido añadir papers, blogs técnicos ni demos adicionales.
