# ranxianglei/Qwen3.8-Flash-Next-W4A16-Pruned-294E

## Resumen

El modelo `ranxianglei/Qwen3.8-Flash-Next-W4A16-Pruned-294E` es una versión podada y cuantizada del modelo Qwen3.8-Flash-Next de Alibaba, un MoE ultra-sparse de 125B parámetros (6B activos) con arquitectura híbrida GDN + QSA. Este repositorio reduce el número de expertos por capa de 512 a 294, lo que supone una reducción del 43% en la memoria dedicada a expertos, manteniendo la calidad según las pruebas internas del autor. El objetivo es permitir el despliegue en una sola GPU de gama alta (80-96 GB) para cargas de trabajo de agente de código y salida estructurada larga, donde el cuello de botella es el ancho de banda de memoria al leer el pool de expertos bajo concurrencia.

El modelo se deriva de `Qwen/Qwen3.8-Flash-Next` a través de la cuantización W4A16 de Intel (`Intel/Qwen3.8-Flash-Next-W4A16-AutoRound`) y un proceso de poda de expertos basado en perfiles de enrutamiento. Incluye scripts para reproducir el proceso de poda y validación. Está pensado para servidores SGLang con soporte Flash-Next y requiere al menos 64 GB de VRAM, siendo 80 GB la configuración recomendada. La licencia es Qwen Community 1.0, que permite uso comercial con ciertas restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE ultra-sparse con GDN + QSA (Gated DeltaNet y Qwen Sparse Attention) |
| Parametros totales | 65.850.138.771 (según safetensors, tras poda) |
| Parametros activos | no disponible (el modelo base activa 6B por token) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | W4A16 (pesos 4 bits, activaciones 16 bits) |
| Idiomas soportados | en, zh |
| Licencia | qwen-community-1.0 |
| Formato de pesos | safetensors (23 shards + tabla PLE) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next emplea una arquitectura híbrida que combina Gated DeltaNet (GDN) y Qwen Sparse Attention (QSA): tres de cada cuatro capas usan GDN para comprimir el historial, y la cuarta usa QSA para recuperación precisa de largo alcance. El modelo es multimodal (aunque esta versión solo expone texto) y tiene una tabla de embeddings N-gram de 51B parámetros adicionales, que se mantiene en memoria host en esta versión podada.

El proceso de poda, descrito en la model card, consta de tres pasos: perfilado del enrutamiento de expertos con un corpus representativo, selección de expertos por capa (de 512 a 294) mediante cirugía de claves sin desempaquetar tensores GPTQ, y validación con dos pruebas: un cuestionario de capacidades y una búsqueda de bugs en un repositorio real. El autor documenta que el corpus de perfilado debe cubrir la forma de las tareas objetivo; en este caso se optimizó para tráfico de agente de código y salida estructurada larga, incluyendo tareas de compresión JSON. No se proporcionan detalles sobre el entrenamiento original (datos, tokens, RLHF) más allá de que el modelo base fue lanzado por Qwen en agosto de 2026.

## Capacidades

- Generación de texto y razonamiento multi-step, con soporte de "thinking mode" preservado (el modelo base conserva bloques de razonamiento de mensajes históricos).
- Generación de código y depuración, optimizado para cargas de agente de código (el perfil de poda se ajustó a este tipo de tráfico).
- Salida estructurada larga (JSON, documentos), con validación específica en el proceso de poda.
- Capacidades multilingües en inglés y chino.
- Soporte de tool calling y function calling (heredado del modelo base, aunque no se detalla en esta versión).
- Capacidades multimodales del modelo base (visión, audio) no están disponibles en esta versión podada, que solo expone texto.
- Soporte de agentes y razonamiento multi-paso, con contexto largo de 262K tokens.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo (262K tokens) y mantener un historial de razonamiento completo, lo que permite respuestas coherentes en interacciones prolongadas. Su perfil de poda, sin embargo, está optimizado para código y salida estructurada, por lo que en dominios conversacionales generales puede haber cierta deriva de calidad.
- Generación de código en producción: soporta tool calling y puede integrarse en pipelines de CI/CD para autocompletar, revisar o generar código. La poda mantiene los expertos de razonamiento lógico y matemático, y el throughput bajo concurrencia (2171 tok/s con 64 peticiones) lo hace adecuado para entornos con múltiples desarrolladores.
- Agente de depuración autónomo: el modelo puede recibir un repositorio con un bug conocido, analizar el código y proponer correcciones. La validación del autor incluye una suite de "bug-hunt" que compara el conjunto de defectos encontrados con la verdad de campo.
- Procesamiento de documentos largos: con 262K tokens de contexto, puede resumir, extraer o transformar informes extensos, contratos o artículos técnicos. La salida estructurada en JSON está validada en el perfil de poda.
- Asistente de razonamiento matemático y lógico: el perfil de poda incluye expertos de matemáticas y lógica, por lo que puede resolver problemas de razonamiento complejo, aunque no se han publicado benchmarks estándar.
- Generación de contenido bilingüe (en/zh): puede redactar, traducir o adaptar contenido entre inglés y chino, aprovechando el entrenamiento multilingüe del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card incluye mediciones de throughput y calidad en una GPU RTX Pro 6000 Blackwell (96 GB) con SGLang, que se resumen a continuación:

| Config | Single-stream (tok/s) | w32 (tok/s) | w64 (tok/s) | Quality gate |
|---|---|---|---|---|
| W4A16 full (512E) | 110 | — | ~1000 | baseline |
| 256E, perfil desactualizado | 110 | 1448 | 2264 | FAIL (errores lógicos) |
| 288E, perfil mixto | 110 | 1375 | 2124 | pass (banda de varianza) |
| **294E (este repo)** | **110** | **1375** | **2171** | **pass + suite bug-hunt** |

Estos datos indican que la poda a 294 expertos mantiene la calidad (según las pruebas del autor) y mejora el throughput bajo concurrencia frente al modelo completo, aunque el single-stream no cambia porque el enrutamiento top-k=10 es independiente del tamaño del pool.

## Requisitos de hardware

- VRAM estimada: ~44 GB de pesos en GPU (expertos int4 ~15 GB + denso/GDN/BF16 ~29 GB) más la tabla PLE de 47.7 GB en memoria host pinned. Se requiere al menos 64 GB de VRAM para un pool de KV pequeño (~150K tokens); 80 GB es la configuración cómoda (~500K tokens de KV); 96 GB permite el pool completo (928K tokens, 71 peticiones concurrentes).
- GPU recomendadas: RTX Pro 6000 Blackwell (96 GB) usada en las pruebas; también A100 80GB, H100 80GB, o cualquier GPU con 80+ GB de VRAM. No cabe en GPUs de consumo (48 GB no es suficiente).
- RAM del host: 128 GB+ recomendados, con ~110 GB libres durante el arranque.
- Opciones de despliegue: SGLang con soporte Flash-Next (comando de lanzamiento incluido en la model card). No se mencionan vLLM, llama.cpp u Ollama.
- Latencia y throughput: single-stream 110 tok/s; con 32 peticiones concurrentes 1375 tok/s; con 64 peticiones 2171 tok/s (medido en RTX Pro 6000 Blackwell).

## Comparativa con modelos similares

| Modelo | Parámetros | Expertos/capa | Contexto | Cuantización | Licencia | Notas |
|---|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (base) | 125B (6B activos) | 512 | 262K | BF16 | qwen-community-1.0 | Modelo original, multimodal, requiere múltiples GPUs |
| Intel/Qwen3.8-Flash-Next-W4A16-AutoRound | 125B | 512 | 262K | W4A16 | qwen-community-1.0 | Cuantización oficial de Intel, sin poda |
| Este repo (294E) | 65.85B | 294 | 262K | W4A16 | qwen-community-1.0 | Podado y cuantizado, para una sola GPU |

La comparativa se limita a las variantes del mismo modelo base, ya que no se dispone de datos de otros MoE comparables en la información proporcionada. La ventaja principal de esta versión es la reducción de memoria de expertos (-43%) manteniendo la calidad para cargas de código y salida estructurada, a costa de una posible deriva en otras tareas.

## Limitaciones y advertencias

- El perfil de poda está optimizado para tráfico de agente de código y salida estructurada larga. En otras cargas (traducción, matemáticas intensivas, conversación general) puede haber degradación de calidad, como documenta el autor con los fallos de las versiones 256E y 288E.
- Solo soporta inglés y chino; no se garantiza un rendimiento adecuado en otros idiomas.
- La tabla PLE de 47.7 GB reside en memoria host pinned; requiere 128 GB+ de RAM y puede ser un cuello de botella en sistemas con poca memoria.
- Riesgo de alucinación y errores de razonamiento, especialmente en tareas fuera del perfil de poda. El autor recomienda re-perfilar si la carga de trabajo cambia.
- La licencia qwen-community-1.0 permite uso comercial pero con restricciones (por ejemplo, no usar para servicios que compitan con Qwen); es necesario revisar los términos completos.
- El proceso de carga puede fallar con OOM en el path de repack de Marlin para lotes grandes de expertos; se requiere un parche manual (`gc.collect()` en `gptq_kernels.py`).
- No se han publicado benchmarks estándar; la validación de calidad se basa en pruebas internas del autor (cuestionario y bug-hunt), no en métricas académicas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ranxianglei/Qwen3.8-Flash-Next-W4A16-Pruned-294E
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Cuantización Intel: https://huggingface.co/Intel/Qwen3.8-Flash-Next-W4A16-AutoRound
- GitHub del modelo base: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Documentación de despliegue (unsloth): https://unsloth.ai/docs/models/qwen3.8-next
- Receta vLLM (para el modelo base): https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
