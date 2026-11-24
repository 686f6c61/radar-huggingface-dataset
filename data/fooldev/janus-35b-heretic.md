# FoolDev/Janus-35B-HERETIC

## Resumen

Janus-35B-HERETIC es un modelo de lenguaje de tipo mixtura de expertos (MoE) con aproximadamente 34.700 millones de parámetros totales y unos 3.000 millones activos por token, derivado de Qwen 3.6 35B-A3B. Lo publica el usuario FoolDev en Hugging Face como un reempaquetado del modelo abliterado y sin censura de llmfan46 (`llmfan46/Qwen3.6-35B-A3B-uncensored-heretic`), que a su vez parte del base multimodal de Qwen. El repositorio distribuye únicamente pesos en formato GGUF, concretamente el Q4_K_M original del autor upstream, sin reentrenamiento ni recuantización por parte de FoolDev.

El modelo se presenta como una variante orientada a razonamiento, conversación, uso de herramientas y agentes, con la capa de rechazo atenuada mediante técnicas de abliteration. Su interés práctico reside en la combinación de una ventana de contexto nativa muy amplia (262.144 tokens, extensible a 1.010.000 con YaRN) con un coste de inferencia reducido gracias a los aproximadamente 3.000 millones de parámetros activos, lo que permite desplegarlo en hardware de gama alta de consumo con cuantizaciones de 4 bits.

La model card es explícita sobre la procedencia: el campo `Teacher: Claude Fable 5` y la lista de conjuntos de datos del frontmatter provienen de revisiones anteriores y no están verificados por el autor actual del repositorio. Un dataset listado (`Crownelius/Opus-4.7-Reasoning`) no es accesible públicamente. Conviene tratar esa atribución como no confirmada y evaluar el modelo por su comportamiento empírico, no por su supuesta receta de destilación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture of experts), base Qwen 3.6 35B-A3B |
| Parametros totales | 34.660.610.688 (~34,7B) |
| Parametros activos | ~3B por token |
| Longitud de contexto | 262.144 nativo; 1.010.000 extensible con YaRN (no integrado) |
| Tipos de cuantizacion | GGUF Q4_K_M (21,23 GB) como opción publicada; otras cuantizaciones no disponibles en el repo |
| Idiomas soportados | en, zh, ru, es, fr, it, ja, ko, de, ar, tr, pl, sv, nl, he, id, uk, fa, pt, ms, fi, el (22 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura es un transformer con capas de mixtura de expertos: 34,7B parámetros totales con aproximadamente 3B activos por token, lo que reduce el coste computacional de la inferencia respecto a un modelo denso del mismo tamaño. El modelo base es Qwen 3.6 35B-A3B, descrito como multimodal en la model card, y sobre él se aplicó una abliteration de estilo Heretic que atenúa el comportamiento de rechazo entrenado en las capas base.

El repositorio de FoolDev no entrena ni cuantiza: redistribuye byte a byte el Q4_K_M de llmfan46 junto con un envoltorio de Ollama (archivos `template`, `system` y `params` en la raíz, además de un `Modelfile`). La model card menciona un proceso de destilación con datos de razonamiento de "Claude Fable 5" y seis conjuntos de datos (Creative_Writing_ShareGPT_Enhanced, rStar-Coder, dataclaw-peteromallet, Opus-4.7-Reasoning, UltraData-Math y Crow-Heretic-TeichAI-Unified), pero el propio autor advierte que esa información procede de revisiones anteriores de la ficha, que el base actual no la reclama y que nada en el repositorio la reproduce o mide. No se dispone de número de tokens de entrenamiento, composición del dataset ni detalles de RLHF/DPO verificables.

## Capacidades

- Generación de texto conversacional multi-turno con ventana de contexto nativa de 262.144 tokens.
- Razonamiento explícito: el modelo declara capacidad de "thinking" en Ollama (`ollama show` lista `thinking` entre sus capacidades).
- Generación de código, con soporte declarado para tool calling / function calling mediante plantilla específica incluida en el repo.
- Uso en agentes y razonamiento multi-paso, según los tags `agent` y `reasoning` del repositorio.
- Capacidades multimodales heredadas del base Qwen 3.6 35B-A3B (declaradas en los tags; no verificadas en los pesos GGUF publicados).
- Soporte multilingüe amplio: 22 idiomas, incluidos español, inglés, chino, ruso, francés, alemán, árabe, japonés, coreano, portugués e hindi, entre otros.
- Modo sin censura: la abliteration reduce los rechazos del modelo base, orientándolo a contenido creativo y conversacional sin filtros heredados.

## Casos de uso

- Atención al cliente automatizada: la ventana de 262.144 tokens permite mantener conversaciones muy largas y adjuntar historiales completos o documentación de producto sin truncar, con un coste de inferencia bajo gracias a los ~3B parámetros activos.
- Generación de código en producción: el soporte de tool calling y la plantilla incluida permiten integrarlo en pipelines de CI/CD o asistentes de IDE que invocan funciones externas (ejecutar tests, consultar APIs) mediante llamadas estructuradas.
- Agentes autónomos multi-paso: los tags `agent` y `reasoning` y el modo thinking lo hacen adecuado para bucles de planificación y ejecución de herramientas donde se requiere descomponer tareas y mantener estado durante muchas iteraciones.
- Procesamiento de documentos largos: resumen, extracción de entidades y question answering sobre contratos, informes o bases de código que superan los 100.000 tokens, aprovechando el contexto nativo sin necesidad de recuperación externa.
- Escritura creativa sin restricciones: el ajuste abliterado y el dataset Creative_Writing_ShareGPT_Enhanced lo orientan a narrativa, guiones y contenido editorial donde los filtros de rechazo del base resultan un obstáculo.
- Asistencia matemática y razonamiento técnico: el dataset UltraData-Math y el modo thinking permiten usarlo para resolución de problemas paso a paso, verificación de cálculos y tutoría técnica.
- Despliegue local en estaciones de trabajo: al caber en ~23-25 GiB de VRAM con Q4_K_M y contexto completo, sirve para prototipado y uso personal en una GPU de 24-32 GB sin depender de APIs en la nube.
- Traducción y atención multilingüe: con 22 idiomas declarados, puede cubrir soporte en español, inglés, chino, árabe o portugués desde un único modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni métricas comparativas, y el autor advierte que no se han medido las afirmaciones sobre datos de entrenamiento o destilación.

## Requisitos de hardware

- VRAM estimada con Q4_K_M y contexto nativo completo (262.144 tokens): ~25,4 GiB con caché KV en f16 por defecto de Ollama; ~23,0 GiB con `OLLAMA_KV_CACHE_TYPE=q8_0`.
- Con contexto reducido a 65.536 tokens: ~21,6 GiB medidos sobre este mismo blob el 2026-09-18.
- GPU recomendadas: tarjetas con 24 GB o más, como RTX 3090, RTX 4090, RTX 5090, A100 40/80 GB, H100 o L40S. Para contexto completo conviene 32 GB o más.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) con contexto recortado o caché KV cuantizada; en 32 GB (RTX 5090) con más holgura.
- Opciones de despliegue: Ollama (soporte nativo vía `ollama run hf.co/FoolDev/Janus-35B-HERETIC` o build local con `Modelfile`), llama.cpp por ser GGUF, y servidores compatibles con endpoints de Hugging Face. vLLM y TGI no están confirmados para este blob GGUF concreto.
- Para reducir la caché KV a la mitad, arrancar el servidor Ollama con `OLLAMA_KV_CACHE_TYPE=q8_0 OLLAMA_FLASH_ATTENTION=1 ollama serve`.
- Latencia y throughput: no disponibles. Al activar solo ~3B parámetros por token, el throughput debería ser sustancialmente mayor que el de un modelo denso de 35B, pero no se han publicado cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Janus-35B-HERETIC | ~34,7B | ~3B | 262.144 (1,01M con YaRN) | Apache 2.0 | GGUF Q4_K_M | Abliterado, sin benchmarks publicados |
| llmfan46/Qwen3.6-35B-A3B-uncensored-heretic | ~34,7B | ~3B | no disponible en la información | Apache 2.0 (según base) | safetensors y GGUF | Modelo base directo de este repo; sin reempaquetar |
| Qwen/Qwen3.6-35B-A3B | ~34,7B | ~3B | 262.144 nativo | Apache 2.0 | safetensors | Base original con alineamiento y filtros de rechazo |
| FoolDev/Thanatos-27B-HERETIC | ~27B (denso, según nombre) | no disponible | no disponible | no disponible | GGUF | Modelo hermano del mismo autor, citado en la model card |

La comparación con alternativas densas de tamaño similar (por ejemplo, modelos de 27-32B) no está disponible con datos verificables en la información proporcionada. La ventaja diferencial de Janus-35B frente a su base es el empaquetado para Ollama con plantilla de tool calling y la atenuación de rechazos; frente al Qwen original, la ausencia de alineamiento de seguridad.

## Limitaciones y advertencias

- Atribución de entrenamiento no verificada: los datasets y el "teacher" Claude Fable 5 que figuran en la ficha provienen de revisiones anteriores y el autor actual no los respalda; uno de los datasets (`Crownelius/Opus-4.7-Reasoning`) devuelve 401 en el Hub.
- Modelo sin censura: la abliteration elimina parte de los rechazos del base, por lo que puede generar contenido dañino, sesgado o inapropiado sin las salvaguardas del Qwen original. No es apto para aplicaciones orientadas al público sin capas de moderación adicionales.
- Riesgo de alucinación: no se han publicado evaluaciones de factualidad ni benchmarks; al ser un modelo destilado y abliterado, la fiabilidad factual debe validarse en el dominio de uso.
- Contexto extendido degradado: el contexto más allá de ~262.000 tokens requiere YaRN, que no está integrado en los pesos; sin configuración adicional, el rendimiento decae.
- Idiomas: aunque se declaran 22 idiomas, no hay métricas por idioma; la calidad en lenguas de bajos recursos (finés, griego, malayo, persa) puede ser inferior a la del inglés o el chino.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías y la licencia del base Qwen debe respetarse en la cadena de derivación.
- Estabilidad del repositorio: el modelo base cambió tres veces el 2026-09-18 (ida y vuelta entre este MoE y un denso Qwen 3.8 27B); si se descargó ese día, conviene volver a hacer `ollama pull` para asegurar la coincidencia con la ficha actual.
- Sin soporte oficial: es un fork personal con 362 descargas y 3 likes en el momento de la consulta; no hay garantías de mantenimiento ni de soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FoolDev/Janus-35B-HERETIC
- Modelo base (llmfan46): https://huggingface.co/llmfan46/Qwen3.6-35B-A3B-uncensored-heretic
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Modelo hermano Thanatos-27B-HERETIC: https://huggingface.co/FoolDev/Thanatos-27B-HERETIC
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
- Banner del repositorio: https://huggingface.co/FoolDev/Janus-35B-HERETIC/resolve/main/banner.svg
