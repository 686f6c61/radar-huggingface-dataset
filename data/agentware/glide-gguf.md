# Agentware/GLiDE-GGUF

## Resumen

GLiDE es un modelo de decisión desarrollado por Fastino que, en lugar de generar texto de forma autorregresiva, selecciona entre opciones estructuradas mediante una cabeza de clasificación de 255 vías. Esta ficha cubre la conversión a GGUF publicada por Agentware (`Agentware/GLiDE-GGUF`), una cuantización mixta Q4_K_S del modelo base `fastino/GLiDE` con 25.625.905.664 parámetros reales en safetensors (26,09B según la model card del autor), empaquetada junto con su runtime nativo específico.

El modelo no es un chat model convencional: emplea atención no causal sobre la pregunta completa y reinicia el estado entre preguntas, lo que lo hace adecuado para tareas de clasificación, selección de receta y decisión entre alternativas predefinidas. La conversión conserva el clasificador BF16 original de 255 vías y un contexto evaluado de 8.192 tokens.

La relevancia de esta publicación es doble: por un lado, demuestra que es posible cuantizar a Q4_K_S un modelo de decisión con una degradación máxima de 0,407 puntos porcentuales respecto a BF16 en MMLU-Pro; por otro, expone las limitaciones de empaquetar un modelo de este tipo en GGUF, ya que requiere un wrapper de runtime propio y no puede ejecutarse en runners de chat estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3 (config fuente: `Qwen3_5ForConditionalGeneration`; documentación original: Qwen3.8-27B modificado), con cabeza de clasificación de 255 vías y atención no causal sobre la pregunta completa |
| Parametros totales | 25.625.905.664 (safetensors); 26,09B según model card |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens en la configuración evaluada |
| Tipos de cuantizacion | Q4_K_S mixta: 468 tensores Q4_K, 12 Q5_K, 1 Q8_0, 17 BF16, 353 F32; embeddings Q8; clasificador de salida en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Fastino Community License (comercial con atribución; acuerdo separado si ingresos consolidados > 10 M USD) |
| Formato de pesos | GGUF (`glide-Q4_K_S-q8emb-bf16restore.gguf`, 15,65 GB / 14,57 GiB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer derivado de la familia Qwen3. La configuración fuente declara `Qwen3_5ForConditionalGeneration`, mientras que la documentación original de Fastino describe un Qwen3.8-27B modificado; ambos artefactos se conservan en los ficheros upstream incluidos. La innovación principal no está en el backbone, sino en la cabeza de salida: un clasificador de 255 vías en BF16 que sustituye la generación autorregresiva por una selección directa entre opciones estructuradas. La atención es no causal sobre la pregunta completa y el estado se reinicia entre preguntas, de modo que cada inferencia es independiente.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card menciona que los pools de evaluación incluyen ejemplos previos de selección de receta, lo que sugiere un entrenamiento orientado a tareas de decisión con opciones fijas, pero no se detalla el proceso. La receta de cuantización se congeló antes de la ejecución completa de la evaluación, lo que aporta trazabilidad al proceso de conversión.

## Capacidades

- Selección entre opciones estructuradas mediante clasificación de 255 vías (no genera texto libre).
- Clasificación de intención y dominio: evaluado en BANKING77 y CLINC150+OOS con opciones fijas.
- Razonamiento de opción múltiple: evaluado en MMLU-Pro zero-shot con formato de elección fija.
- Razonamiento multi-paso acotado: evaluado en 23 tareas BBH adaptadas a formato de opciones fijas.
- Decisión de invocación de herramientas: evaluado en When2Call MCQ (decidir cuándo llamar a una función).
- Procesamiento de texto únicamente; las imágenes se rechazan explícitamente.
- Sin soporte de tool calling generativo ni de agentes autónomos multi-turno: la decisión se emite como índice de opción.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Enrutamiento de intención en atención al cliente: el modelo clasifica el mensaje del usuario entre un conjunto predefinido de intenciones (estilo BANKING77/CLINC150) y devuelve el índice de la opción seleccionada, integrándose como primer paso de un pipeline de triaje antes de un modelo generativo.
- Selección de receta o configuración en pipelines de datos: dado un conjunto de recetas candidatas y una descripción de la tarea, el modelo elige la más adecuada; la model card menciona explícitamente ejemplos de selección de receta en los pools de evaluación.
- Decisión de invocación de herramientas (When2Call): determinar si una consulta requiere llamar a una función externa y cuál, antes de despachar a un orquestador de agentes.
- Evaluación de opción múltiple en pipelines de benchmarking interno: MMLU-Pro y BBH en formato de elección fija permiten medir razonamiento sin depender de un generador de texto.
- Moderación y clasificación de contenido con taxonomías cerradas: la cabeza de 255 vías admite mapear categorías de política sobre las opciones disponibles, con la ventaja de que la salida es determinista y acotada.
- Enrutamiento de consultas en sistemas RAG: decidir entre recuperar, responder directamente o escalar, usando el clasificador como componente de bajo coste frente a un LLM generativo.
- Clasificación de tickets en soporte técnico: asignación de categoría y prioridad entre opciones predefinidas, con contexto de hasta 8.192 tokens para tickets largos con historial.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 29.771 peticiones en cinco tareas congeladas. BANKING77 y CLINC usan macro-F1; el resto, accuracy. Porcentajes.

| Tarea | Peticiones | BF16 | HF compact | Este GGUF |
|---|---:|---:|---:|---:|
| BANKING77 | 3.080 | 91,908020 | 91,680961 | 91,866078 |
| CLINC150+OOS | 5.500 | 95,888608 | 95,946450 | 95,816106 |
| MMLU-Pro | 12.032 | 77,925532 | 77,468418 | 77,518285 |
| BBH fixed-option | 5.507 | 92,954422 | 92,482295 | 92,881787 |
| When2Call MCQ | 3.652 | 91,730559 | 91,456736 | 91,785323 |

La mayor caída respecto a BF16 es de 0,407 puntos porcentuales en MMLU-Pro. El autor advierte que son cinco resultados de tarea y no una puntuación agregada oficial del Decision Index. La evaluación usa MMLU-Pro zero-shot de elección fija, 23 tareas BBH adaptadas y When2Call MCQ.

## Requisitos de hardware

- VRAM estimada: 17.042 MiB observados en L4 con embeddings en CPU; el autor no certifica que quepa en una GPU de 16 GiB en esa configuración.
- Perfil evaluado: GPU L4 con Flash Attention, embeddings de tokens en CPU, cuatro hilos, contexto/batch/ubatch de 8.192.
- GPU recomendadas: L4 (perfil evaluado); no se han publicado pruebas en A100, H100 ni RTX 4090.
- GPU de consumo: no verificado; el tamaño del fichero (15,65 GB) más overhead de runtime y clasificador BF16 hace ajustada la ejecución en GPUs de 16 GiB.
- Despliegue: exclusivamente mediante el runtime nativo `GlideGGUF` + `glide-logits-fa`, dependiente del commit `8e5a58df87ab59dfceb5b961ae26691e39f30c24` de llama.cpp. No es compatible con runners de chat GGUF estándar (llama.cpp genérico, Ollama, vLLM, TGI).
- Offload parcial de capas a GPU: rechazado por el runtime.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Formato |
|---|---|---|---|---|---|
| GLiDE-GGUF (esta ficha) | 25,63B | 8.192 | Modelo de decisión (255 vías) | Fastino Community | GGUF + runtime propio |
| fastino/GLiDE (BF16) | 26,09B | 8.192 (evaluado) | Modelo de decisión (255 vías) | Fastino Community | safetensors |
| HF compact (formato alternativo del autor) | no disponible | no disponible | Modelo de decisión | Fastino Community | no disponible |

No se dispone de información sobre modelos de decisión comparables de otros autores en la documentación proporcionada.

## Limitaciones y advertencias

- La comprobación de consistencia de probabilidades CPU/L4 falló: algunas diferencias superaron los umbrales originales de 0,01 de media y 0,03 de máximo. La puerta de despliegue original permanece fallida.
- El uso de VRAM observado (17.042 MiB) no está verificado que quepa en una GPU de 16 GiB; la lectura no es un pico certificado.
- El runtime rechaza imágenes, offload parcial de capas a GPU y prompts sobredimensionados; las preguntas se ejecutan de forma secuencial.
- No es un modelo de chat autorregresivo: no genera texto libre ni soporta conversaciones multi-turno en el sentido habitual.
- El paquete preserva resultados históricos; la preparación verificó hashes de ficheros y la construcción de tokenizer y prompt, pero no reconstruyó el ejecutable nativo ni repitió la inferencia en GPU.
- Licencia: uso comercial permitido con atribución "Built with Fastino GLiDE"; entidades con ingresos consolidados anuales superiores a 10 M USD requieren acuerdo separado con Fastino.
- Idiomas soportados no documentados; riesgo de comportamiento degradado fuera del inglés.
- Riesgo de alucinación estructuralmente bajo al no generar texto, pero el índice seleccionado puede ser incorrecto si la pregunta no encaja en las opciones disponibles.
- Dependencia de un commit específico de llama.cpp: la actualización del runtime puede romper la compatibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Agentware/GLiDE-GGUF
- Modelo base: https://huggingface.co/fastino/GLiDE
- Commit del modelo base: `1a9a7ed94379c2ea6f324176c9bc22fb9b7b7d60`
- Instrucciones de ejecución: `RUNNING.md` (incluido en el repo)
- Resultados de evaluación: `evaluation/results.csv` (incluido en el repo)
- Definiciones de métricas: `evaluation/source/METRIC_SPEC.json` (incluido en el repo)
- Resultados de la puerta fallida: `evaluation/failed_gate_excerpt.json` (incluido en el repo)
- Licencia: `LICENSE` (Fastino Community License, incluida en el repo)
- Avisos upstream: `NOTICE` y `licenses/` (incluidos en el repo)
- Sumas de verificación: `SHA256SUMS` (incluido en el repo)
- SHA256 de pesos: `c8af13959de7081a83421a615af1967932e69aac9cb43e7336fc28da784f4636`
