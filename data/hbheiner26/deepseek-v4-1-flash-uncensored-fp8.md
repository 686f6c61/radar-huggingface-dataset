# hbheiner26/DeepSeek-V4.1-Flash-UNCENSORED-FP8

## Resumen

DeepSeek-V4.1-Flash-UNCENSORED-FP8 es una versión modificada del modelo multimodal DeepSeek-V4.1-Flash, publicada por el usuario hbheiner26 (vinculado a la etiqueta dealignai). La modificación consiste en una "abliteración" a nivel de pesos, es decir, la eliminación quirúrgica de los circuitos de rechazo del modelo base, conservando el resto de componentes (expertos enrutados, torre de visión, atención dispersa CSA2, memoria Engram, cabezal especulativo DSpark y embeddings) sin cambios. Según el autor, el resultado es un checkpoint estándar que se carga igual que el modelo original, sin hooks en tiempo de ejecución ni vectores de dirección.

El modelo base es una arquitectura causal encoder-decoder de tipo MoE con 20+20 capas, 384 expertos enrutados (top-6 más uno compartido), conexiones residuales Hyper-Connections de 4 canales, atención dispersa CSA2 y memoria n-grama Engram. Dispone de una ventana de contexto de 1.000.000 de tokens y capacidad de visión mediante DeepSeek-ViT con 2D-RoPE y pixel unshuffle. El repositorio ocupa 510,3 GB y los pesos safetensors suman 763.205.315.794 parámetros totales; la model card del autor cita un backbone de 552B con entre 8B y 16B de parámetros activos por token.

Su relevancia es doble. Por un lado, es un ejemplo de cuantización nativa FP8 (e4m3fn) con expertos enrutados en FP4, lo que permite servir un modelo de escala masiva con un coste de memoria reducido. Por otro, la eliminación de los mecanismos de seguridad convierte al modelo en una herramienta de doble uso: útil para investigación en alineación y red-teaming, pero con un riesgo elevado de generar contenido dañino, ya que el autor reporta una tasa de cumplimiento del 100 % en HarmBench-320. La licencia declarada es MIT, aunque conviene verificar la compatibilidad con los términos del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal encoder-decoder híbrido, MoE (384 expertos enrutados top-6 + 1 compartido), Hyper-Connections de 4 canales, atencion dispersa CSA2, memoria n-grama Engram, cabezal especulativo DSpark |
| Parametros totales | 763.205.315.794 (safetensors); la model card cita un backbone de 552B |
| Parametros activos | 8B a 16B por token (segun la model card del autor) |
| Longitud de contexto | 1.000.000 de tokens |
| Tipos de cuantizacion | FP8 (e4m3fn) con escala de bloque E8M0 [32, 32]; expertos enrutados en FP4; formato de 8 bits |
| Idiomas soportados | no disponible |
| Licencia | MIT (declarada) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del DeepSeek-V4.1-Flash: un transformer causal encoder-decoder con 20 capas de encoder y 20 de decoder, capa MoE con 384 expertos enrutados y selección top-6 más un experto compartido, conexiones residuales Hyper-Connections de 4 canales, atención dispersa CSA2 y un módulo de memoria n-grama denominado Engram. Incorpora además un cabezal de borrador especulativo (DSpark) para decodificación especulativa y una torre de visión DeepSeek-ViT con 2D-RoPE y pixel unshuffle que habilita la entrada de imágenes. La cuantización es nativa: pesos en FP8 (e4m3fn) con escala de bloque E8M0 [32, 32] y expertos enrutados en FP4.

Sobre el entrenamiento del modelo base, la información proporcionada no incluye el número de tokens, la composición del dataset ni si hubo fases de RLHF o DPO; estos datos corresponden al modelo original deepseek-ai/DeepSeek-V4.1-Flash y no se detallan aquí. La única modificación documentada respecto al base es la abliteración a nivel de pesos: según el autor, se eliminan los circuitos de rechazo conservando "byte a byte" los componentes críticos de capacidad (expertos enrutados, memoria Engram, atención CSA2, cabezal DSpark, torre de visión, gates del router, normas y embeddings). No se emplean model.py personalizados, hooks en runtime ni vectores de dirección. El autor no describe la técnica exacta de identificación y ablación de dichos circuitos.

## Capacidades

- Generación de texto y razonamiento multimodal (texto e imagen) con ventana de contexto de hasta 1.000.000 de tokens.
- Entrada de imágenes mediante la torre DeepSeek-ViT (pipeline image-text-to-text).
- Razonamiento multi-paso con modo de esfuerzo configurable ("effort=off" y "effort=max" según la model card), con traza de razonamiento verificable en el modo máximo.
- Decodificación especulativa mediante el cabezal DSpark, orientada a mejorar el throughput de inferencia.
- Memoria n-grama Engram, pensada para coherencia multi-turno y recuperación de contexto.
- Soporte de herramientas y agentes: las etiquetas incluyen "endpoints_compatible" y la model card menciona "Vision + tools".
- Capacidades multilingües: no disponibles de forma explícita; los idiomas no se detallan.
- Comportamiento sin filtros de seguridad: el autor reporta cumplimiento del 100 % en HarmBench-320 (sin rechazos duros, suaves ni evasivas).

## Casos de uso

- Investigación en alineación y mecanismos de rechazo: el modelo permite estudiar cómo se comporta una red con los circuitos de seguridad ablacionados frente a la versión base, comparando tasas de cumplimiento y degradación de conocimiento en MMLU.
- Red-teaming y evaluación de seguridad: sirve como generador adversario para probar clasificadores de contenido, filtros y sistemas de moderación en pipelines propios.
- Procesamiento de documentos largos con visión: gracias al contexto de 1M tokens y a la entrada de imagen, puede resumir o extraer información de dossiers extensos con figuras y tablas.
- Generación creativa sin restricciones de contenido: para proyectos editoriales o de ficción que requieran temáticas que los modelos alineados rechazan por defecto, con la advertencia legal correspondiente.
- Análisis y generación de código en pipelines: la etiqueta endpoints_compatible y el soporte de herramientas permiten integrarlo en flujos de CI/CD o asistentes de programación, siempre que el operador asuma el riesgo de salidas no filtradas.
- Agentes de múltiples pasos: la memoria Engram y el contexto largo facilitan tareas de planificación y ejecución encadenada con estado persistente.
- Despliegue experimental de inferencia FP8/FP4 a gran escala: útil para equipos que quieran medir el rendimiento de cuantización mixta en MoE de 763B parámetros.

## Benchmarks y rendimiento

Datos de la model card del autor (T=0, greedy):

| Benchmark | Base | UNCENSORED-FP8 (CRACK) | Delta |
|---|---:|---:|---:|
| HarmBench-320 (effort=off), ASR | 42,81 % | 100,00 % | +57,19 pp |
| HarmBench-320 (effort=max), ASR | 1,56 % | 100,00 % | +98,44 pp |
| MMLU-14k (test completo, base-logit) | 86,96 % | 82,74 % | -4,22 pp |
| MMLU-14k excluyendo el cluster de etica | — | — | -1,1 pp |

| Categoria HarmBench | Items | Base off | CRACK off | Base max | CRACK max |
|---|---:|---:|---:|---:|---:|
| chemical_biological | 42 | 16,7 % | 100,0 % | 0,0 % | 100,0 % |
| copyright | 80 | 98,8 % | 100,0 % | 0,0 % | 100,0 % |
| cybercrime_intrusion | 52 | 34,6 % | 100,0 % | 3,8 % | 100,0 % |
| harassment_bullying | 21 | 0,0 % | 100,0 % | 0,0 % | 100,0 % |
| harmful | 18 | 11,1 % | 100,0 % | 5,6 % | 100,0 % |
| illegal | 53 | 13,2 % | 100,0 % | 0,0 % | 100,0 % |
| misinformation_disinformation | 54 | 44,4 % | 100,0 % | 3,7 % | 100,0 % |

La caída más acusada en MMLU se concentra en "moral scenarios" (-39,89 pp), seguida de "professional law" (-7,04 pp) y "abstract algebra" (-6,00 pp). No se han publicado datos de MMLU-Pro, HumanEval, GSM8K ni de benchmarks multimodales en la información disponible.

## Requisitos de hardware

- El repositorio ocupa 510,3 GB de pesos, por lo que la inferencia en FP8/FP4 requiere al menos ese volumen de VRAM agregada solo para los pesos.
- Con 763B parámetros totales, no cabe en ninguna GPU de consumo (RTX 4090, 3090, etc.); es inviable en hardware de escritorio.
- Configuración mínima razonable: 8x H100 80 GB (640 GB) o 8x H200 para alojar pesos, caché KV y activaciones; conviene prever margen adicional para el contexto de 1M tokens.
- Para el contexto completo de 1.000.000 de tokens, la caché KV es muy costosa y probablemente exija más de 8 GPUs o técnicas de atención dispersa explícitas.
- Opciones de despliegue: no especificadas por el autor; al ser un checkpoint transformers estándar, cabría esperar compatibilidad con vLLM, TGI o SGLang si soportan la arquitectura deepseek_v41 y la cuantización FP8/FP4. No hay confirmación en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash (base) | 552B backbone (8B/16B activos) | 1M | no disponible | HuggingFace | Modelo original alineado; MMLU-14k 86,96 % |
| DeepSeek-V4.1-Flash-UNCENSORED-FP8 | 763B totales | 1M | MIT | HuggingFace | Version ablacionada; MMLU-14k 82,74 % |
| Otras alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

No se conocen en la información proporcionada modelos comparables de otros autores con características equivalentes (MoE multimodal de escala similar y abliterado).

## Limitaciones y advertencias

- Eliminación deliberada de salvaguardas: el autor reporta 100 % de cumplimiento en HarmBench-320, incluida la categoría chemical_biological; esto implica riesgo real de generación de contenido dañino o ilegal.
- La responsabilidad legal del uso recae en el operador; el empleo para generar contenido ilícito puede infringir normativa aplicable en la Unión Europea (por ejemplo, el Reglamento de IA y la normativa sobre contenidos ilícitos).
- Riesgo de alucinación: no se han publicado métricas específicas de veracidad ni de calibración; partir de un modelo base con 86,96 % en MMLU-14k no garantiza fiabilidad factual.
- Degradación de conocimiento tras la abliteración: la caída global de -4,22 pp en MMLU-14k y de casi 40 pp en "moral scenarios" sugiere que la modificación afecta a dominios asociados al juicio normativo.
- Idiomas soportados no especificados; no se puede garantizar cobertura multilingüe más allá de la del modelo base.
- Estado del repositorio: 0 descargas y 0 likes, creado y actualizado el 2026-10-11; sin validación de la comunidad ni garantías de mantenimiento.
- Licencia: se declara MIT, pero al derivar de deepseek-ai/DeepSeek-V4.1-Flash conviene verificar la compatibilidad real con la licencia del modelo base antes de un uso comercial.
- Ausencia de despliegue documentado: no hay guías de vLLM, llama.cpp u Ollama específicas para este checkpoint, ni mediciones de latencia o throughput.
- Sesgos: no se han publicado evaluaciones de sesgo; la abliteración elimina los mecanismos de rechazo, no los sesgos subyacentes de los datos de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hbheiner26/DeepSeek-V4.1-Flash-UNCENSORED-FP8
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Perfil del autor en X: https://x.com/dealignai
- Perfil relacionado en X: https://x.com/jordanschenck
- Paper, repositorio, blog o demo oficiales: no disponibles en la informacion proporcionada.
