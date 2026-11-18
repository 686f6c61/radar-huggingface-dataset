# PaoAI/Qwen3.8-27B-PaoAI-ROCmFP4-STRIX-BALANCED-GGUF

## Resumen

Qwen3.8-27B-PaoAI-ROCmFP4-STRIX-BALANCED-GGUF es una cuantización comunitaria de Qwen3.8-27B, un modelo de lenguaje de 27.320 millones de parámetros desarrollado originalmente por el equipo Qwen de Alibaba. Esta versión, publicada por PaoAI, no es un modelo nuevo sino una compilación de pesos en formato GGUF optimizada específicamente para la iGPU AMD Strix Halo (Ryzen AI Max+ 395, arquitectura gfx1151), empleando un esquema de cuantización mixto denominado ROCmFP4 que combina bloques de 4.25 y 4.5 bits con embeddings en Q6_K y normas en FP32.

El interés de esta ficha radica en que demuestra un patrón de despliegue local poco habitual: un modelo de 27B con ventana de contexto completa de 262.144 tokens comprimido en un único archivo de 15,01 GB que cabe íntegramente en la memoria unificada de un sistema Strix Halo, sin necesidad de flags de offload. La cuantización se guió mediante una matriz de importancia (imatrix) y preserva las capas de atención completa en mayor precisión relativa que las capas de atención lineal, lo que refleja la arquitectura híbrida del modelo base.

La relevancia actual es doble: por un lado, permite ejecutar un modelo de clase 27B con contexto de 256K en hardware de consumo integrado; por otro, el autor publica mediciones de rendimiento y evaluaciones de código reproducibles (con mediana y dispersión de ejecuciones), algo poco frecuente en cuantizaciones comunitarias.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 48 capas de atención lineal (gated delta) + 16 capas de atención completa, con cabeza MTP de decodificación especulativa |
| Parámetros totales | 27.320.697.856 (27,3 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens (256K), verificado de 8K a 256K según el autor |
| Tipos de cuantización | Mixta: ROCmFP4-FAST (4,25 bits), ROCmFP4 (4,5 bits), Q6_K (6,56 bits) para embeddings, Q8_0 y FP32 en normas y estado pequeño; media de 4,40 bits por peso |
| Idiomas soportados | en (inglés, según la model card y los tags) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Tamaño del archivo | 15,01 GB (repo: 15,0 GB) |
| Cuantización guiada por | imatrix (matriz de importancia) |
| Hardware objetivo | AMD Strix Halo, gfx1151 (Ryzen AI Max+ 395) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida en la que solo 16 de las 64 capas ejecutan atención completa sobre el contexto, mientras que las 48 restantes usan atención lineal con estado de tamaño constante (gated delta). Esta asimetría reduce el coste computacional del prefill y del decode con contextos largos, y explica la estrategia de cuantización por partes: el autor asigna el layout más fino (ROCmFP4, 4,5 bits) preferentemente a las claves y valores de atención y al qkv de la atención lineal, y el layout más rápido (ROCmFP4-FAST, 4,25 bits) al bloque FFN, que concentra 9,09 GB de los 15,01 GB totales.

El modelo incluye una cabeza de borrador (draft head, blk.64, MTP) de 0,25 GB que actúa como modelo especulativo integrado para decodificación especulativa. El autor no documenta en esta model card los datos de entrenamiento del modelo base (número de tokens, composición del corpus, fases de RLHF/DPO); esa información correspondería a la model card original de Qwen/Qwen3.8-27B y no se incluye aquí. La innovación técnica destacable de esta publicación es el esquema de cuantización por capas guiado por imatrix y la integración de tres perfiles de servicio (Chat, Code y Long) sobre el mismo archivo de pesos con idéntico sha256.

## Capacidades

- Generación de texto conversacional y de formato largo, con perfil Chat por defecto.
- Razonamiento y trazado de código: el modelo resuelve tareas de lectura de código engañoso y localización de bugs plantados (tarea "Hunt").
- Implementación de código: máquinas de estado novedosas y buffers circulares thread-safe sometidos a pruebas de estrés de 5.000 operaciones.
- Contexto largo: ventana de 262.144 tokens verificada con prueba de aguja en pajar hasta 256K.
- Decodificación especulativa integrada mediante cabeza MTP (4 conjeturas por paso) en el perfil Chat.
- Perfil Code con modelo auxiliar externo (z-lab DFlash2, 2,1 GB) que conjetura de 3 a 7 tokens por paso, orientado a agentes de código hasta ~64K de contexto.
- Perfil Long con memoria de contexto en f16 distribuida por todos los canales de memoria, para documentos y código largos (64K+).
- Compatibilidad con endpoints (tag `endpoints_compatible`) y con el ecosistema llama.cpp.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles; el pipeline es text-generation.
- Multilingüismo: limitado a inglés según la model card.

## Casos de uso

- Asistente de código en local para un desarrollador individual: con el perfil Code y el modelo auxiliar DFlash2, el modelo implementa estructuras concurrentes y traza código ajeno en una estación de trabajo con iGPU Strix Halo, sin depender de la nube.
- Revisión de código en CI/CD: el perfil Chat o Code puede integrarse en un pipeline que analice diffs y detecte errores lógicos, dado que el modelo supera tareas de trazado de código deliberadamente engañoso.
- Análisis de repositorios y documentación extensa: con el perfil Long y 262.144 tokens de contexto, es posible cargar varios módulos o un manual técnico completo y formular preguntas sobre él sin truncar.
- Generación de documentación técnica a partir de código: el modelo puede leer un módulo y redactar explicaciones o comentarios, aprovechando su ventana larga y su capacidad de seguir instrucciones de formato.
- Prototipado de agentes de código de múltiples pasos: la decodificación especulativa integrada y el perfil Code reducen la latencia en bucles de razonamiento y edición de archivos.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse íntegramente en una iGPU local con licencia Apache 2.0, permite procesar código propietario sin enviarlo a servicios externos.
- Enseñanza y experimentación con modelos de contexto largo: sirve como banco de pruebas para estudiar el comportamiento de un modelo de 27B con 256K de contexto en hardware de consumo.

## Benchmarks y rendimiento

El autor publica un examen de código ("chain test") con tres ejecuciones por perfil y servidor reiniciado en cada una, reportando medianas y dispersión. Las puntuaciones son sobre 100 por tarea.

| Tarea | Chat — mediana (ejecuciones) | Code — mediana (ejecuciones) | Long — mediana (ejecuciones) |
|---|---|---|---|
| Hunt — trazar código engañoso y hallar el bug | 100 (100 · 100 · 40) | 100 (100 · 100 · 100) | 100 (100 · 100 · 100) |
| Automaton — implementar reglas novedosas y trazar estado | 100 (100 · 100 · 100) | 100 (100 · 100 · 100) | 100 (100 · 100 · 100) |
| Ring buffer — código multihilo bajo estrés | 20 (100 · 20 · 20) | 100 (100 · 100 · 100) | 100 (100 · 100 · 100) |

El autor añade que, en 10 ejecuciones adicionales del perfil Chat, el ring buffer falló 3 veces (2 por `Condition.notify_one()`, método inexistente en Python, y 1 por notificar sin mantener el bloqueo). El modelo original en BF16, ejecutado en servidor cloud con 5 ejecuciones, reprodujo el mismo fallo de `notify_one()` en 1 ocasión según el texto disponible.

Rendimiento medido en el motor paoai-strix-engine `strix-v4` sobre Strix Halo: lectura (prefill) de 101 a 410 t/s y escritura (decode) de 14,8 a 49,8 t/s, con variación según el llenado de la ventana, la petición y el perfil. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: 15,01 GB para el archivo principal; el perfil Code añade 2,1 GB del modelo auxiliar DFlash2; el perfil Long requiere además memoria de contexto en f16, cuyo tamaño exacto no se detalla en la información disponible.
- Hardware objetivo: AMD Strix Halo (Ryzen AI Max+ 395, gfx1151) con memoria unificada; el autor indica que el archivo cabe en la iGPU sin flags de offload.
- GPU discretas: no se documenta compatibilidad ni rendimiento en A100, H100 o RTX 4090; el esquema ROCmFP4 está diseñado para gfx1151.
- GPU de consumo: no hay datos sobre ejecución en RTX 4090 u otras GPU consumer; el formato GGUF permitiría en principio su uso con llama.cpp, pero sin cifras verificadas.
- Opciones de despliegue: llama.cpp y el motor propio paoai-strix-engine (rama `strix-v4`, commit `e9b93d56a`). No se mencionan vLLM, TGI, Ollama ni otros backends.
- Latencia y throughput: prefill de 101 a 410 t/s y decode de 14,8 a 49,8 t/s en Strix Halo con el motor del autor.
- Incidencia conocida: en el motor PaoAI v1 y versiones antiguas de llama.cpp, una conversación puede detenerse a mitad de respuesta de forma esporádica; corregido en llama.cpp PR #29161.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-27B-PaoAI-ROCmFP4-STRIX-BALANCED (esta ficha) | 27,3 B | 262.144 | GGUF, Apache 2.0 | Cuantización mixta 4,40 bits media, 15,01 GB, optimizada para gfx1151 |
| Qwen/Qwen3.8-27B (modelo base) | 27,3 B | 262.144 | Safetensors, Apache 2.0 | Pesos originales en precisión completa; requiere mucha más memoria |
| z-lab/Qwen3.8-27B-DFlash2-GGUF | no disponible | no disponible | GGUF | Modelo auxiliar de decodificación especulativa (2,1 GB) usado en los perfiles Code y Long |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al ser una cuantización, hereda los del modelo base.
- Riesgo de alucinación: no cuantificado por el autor; el examen de código muestra fallos concretos (uso de `Condition.notify_one()` inexistente en Python) en el perfil Chat.
- Estabilidad del perfil Chat: el ring buffer multihilo falló en 3 de 10 ejecuciones adicionales; para tareas de concurrencia se recomienda el perfil Code o Long.
- Limitación de idioma: la model card declara únicamente inglés.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor aclara que es una cuantización comunitaria no afiliada a Alibaba ni al equipo Qwen; conviene verificar la licencia del modelo base.
- Dependencia de hardware: el rendimiento medido corresponde exclusivamente a Strix Halo (gfx1151) con el motor del autor; no hay garantías en otras GPU.
- Incidencia conocida de parada a mitad de respuesta en motores antiguos, corregida en llama.cpp PR #29161.
- El perfil Long requiere memoria adicional para el contexto en f16 cuyo tamaño no se especifica.
- No hay datos publicados de MMLU, HumanEval, GSM8K ni evaluaciones estándar de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PaoAI/Qwen3.8-27B-PaoAI-ROCmFP4-STRIX-BALANCED-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Motor paoai-strix-engine (rama strix-v4): https://github.com/guevae2/paoai-strix-engine/tree/strix-v4
- Modelo auxiliar DFlash2: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2-GGUF
- Paper referenciado en los tags (arXiv:2502.14856): https://arxiv.org/abs/2502.14856
- Corrección en llama.cpp (PR #29161): https://github.com/ggml-org/llama.cpp/pull/29161
