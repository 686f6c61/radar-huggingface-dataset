# ETME-TECH/EliasAI-7B-v2.2

## Resumen

EliasAI-7B-v2.2 es un modelo de lenguaje de 7.600 millones de parámetros desarrollado por ETME TECH (Elias Rickert) como un ajuste fino del modelo base Qwen/Qwen2.5-7B. Está especializado en conversación y razonamiento en alemán, con un modo de pensamiento explícito que produce trazas internas en etiquetas `<think>...</think>` antes de emitir la respuesta final. El modelo se distribuye bajo licencia Apache 2.0 en formatos safetensors (BF16) y GGUF cuantizado.

El modelo resuelve el problema de disponer de un asistente conversacional alemán compacto, con memoria de contexto a corto plazo, calibración de incertidumbre y resistencia a la inyección de prompts, sin depender de APIs externas. Su entrenamiento se basa en un dataset curado de 15.072 diálogos alemanes de hasta cinco turnos, lo que lo orienta a tareas de atención al usuario, explicación de conceptos y generación de texto cotidiano más que a tareas de código o matemáticas avanzadas.

Es relevante ahora por su enfoque en el "principio de intentar primero" (try-first), que prioriza respuestas concretas y estimaciones calibradas frente a rechazos innecesarios, y por su empaquetado listo para despliegue local con llama.cpp en GPUs de consumo. El modelo se publicó el 23 de noviembre de 2026 y, en el momento de redactar esta ficha, no registra descargas ni valoraciones en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen2.5-7B) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens (configurado en el ejemplo de llama.cpp del autor); el contexto nativo de Qwen2.5-7B es mayor, pero no se documenta en la model card |
| Tipos de cuantizacion | GGUF Q8_0, GGUF Q4_K_M; pesos completos en BF16 |
| Idiomas soportados | Alemán (de) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16, 4 shards), GGUF (Q8_0, Q4_K_M) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura transformer decoder-only de Qwen2.5-7B, con 7.615.616.512 parámetros densos. El ajuste se realizó mediante QLoRA en 4 bits NF4 con rango r=32 y alpha=64, aplicando *Differential Loss Weighting* y NEFTune durante el entrenamiento. El autor menciona además un "EOS-head" calibrado de forma convexa para el token `<|im_end|>`, y que los adaptadores se fusionaron en BF16 para producir el modelo final. No se detalla el número total de tokens de entrenamiento ni la composición completa del corpus más allá de la descripción del dataset.

El dataset de ajuste (denominado V6) consta de 15.072 diálogos alemanes curados, de uno a cinco turnos, distribuidos en 12 categorías equilibradas: explicación de conceptos, textos y brainstorming, memoria a corto plazo, empatía y sarcasmo, opiniones y charla informal, traducción/resumen/corrección, estimaciones calibradas y límites duros, anti-manipulación y anti-inyección de prompts, correcciones honestas, dilemas morales, identidad de ETME TECH y minijuegos. No se especifica si hubo RLHF o DPO; el procedimiento descrito es exclusivamente supervisado sobre el dataset curado.

## Capacidades

- Generación de texto conversacional en alemán con tono directo y sin fórmulas vacías.
- Razonamiento con modo de pensamiento explícito: genera trazas internas en `<think>...</think>` de 3 a 6 frases antes de responder.
- Memoria de contexto a corto plazo dentro de la conversación multi-turno (hasta cinco rondas en el entrenamiento).
- Comprensión de sarcasmo, lenguaje coloquial y referencias a mensajes previos.
- Tareas de transformación de texto: traducción, resumen y corrección.
- Estimaciones calibradas: cuando no está seguro, ofrece su mejor hipótesis y recomienda verificación en lugar de rechazar la petición.
- Resistencia a inyección de prompts y a técnicas de manipulación ("anti-gaslighting").
- Identidad de marca definida (ETME TECH / Elias Rickert) mediante system prompt.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión ni audio.

## Casos de uso

- Asistente conversacional en alemán para atención al cliente: el modelo gestiona diálogos multi-turno con memoria de las rondas previas y un tono directo, adecuado para resolución de dudas frecuentes y derivación a agentes humanos cuando detecta límites duros.
- Explicación de conceptos y material divulgativo: genera explicaciones en alemán con trazas de razonamiento visibles, útil para plataformas educativas que quieran mostrar el proceso de pensamiento.
- Generación y edición de textos cotidianos: redacción de correos, resúmenes y correcciones ortográficas en alemán, aprovechando su entrenamiento específico en transformación de texto.
- Despliegue local en estaciones de trabajo con GPU de consumo: con la cuantización Q4_K_M (4,36 GB) funciona desde unos 6 GB de VRAM mediante llama.cpp, lo que permite prototipos offline sin conexión.
- Asistente de escritorio con identidad de marca: el system prompt incluido permite fijar una persona concreta (Elias AI) y un comportamiento calibrado, útil para demos de producto o asistentes internos.
- Filtrado y respuesta ante intentos de manipulación: su entrenamiento anti-prompt-injection lo hace apto para entornos donde el usuario puede intentar forzar respuestas, como chatbots públicos con moderación básica.
- Minijuegos y entretenimiento conversacional: el dataset incluye categorías de minijuegos y charla informal, adecuado para aplicaciones lúdicas de chat en alemán.

## Benchmarks y rendimiento

El autor reporta un "benchmark en vivo final" de 16/18 con TTR de 0,95 y *validation loss* de 1,4271. No se especifica la naturaleza del benchmark ni se ofrecen resultados en MMLU, HumanEval, GSM8K u otros estándares.

| Metrica | Valor reportado |
|---|---|
| Benchmark en vivo (autor) | 16/18 |
| TTR | 0,95 |
| Validation loss | 1,4271 |

No se han publicado resultados de benchmarks estandarizados en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 10 GB para la cuantización Q8_0 (7,54 GB de pesos) y unos 6 GB para Q4_K_M (4,36 GB), según las indicaciones del autor.
- Pesos completos en BF16: 14,19 GB en 4 shards, lo que requiere al menos 16-24 GB de VRAM para inferencia cómoda.
- GPU recomendadas: RTX 4090 (24 GB) para BF16 o Q8_0; RTX 3060/4060 Ti (8-16 GB) y GPUs integradas con suficiente memoria compartida para Q4_K_M.
- Cabe en GPU de consumo: sí, con Q4_K_M en tarjetas de 6-8 GB y con Q8_0 en tarjetas de 10-12 GB.
- Opciones de despliegue: llama.cpp (llama-server, documentado por el autor), y por compatibilidad de formato GGUF también Ollama y otros runners basados en llama.cpp; vLLM y TGI no están documentados explícitamente en la model card.
- Parámetros de muestreo sugeridos por el autor: temperatura 0,55, top-p 0,90, repeat-penalty 1,06, contexto de 8.192 tokens.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| EliasAI-7B-v2.2 | 7,6 B | 8.192 (config. del autor) | Alemán | Apache 2.0 | Ajuste conversacional alemán con modo `<think>` |
| Qwen2.5-7B (base) | 7,6 B | Contexto nativo amplio (no documentado aquí) | Multilingüe | Apache 2.0 | Modelo base; capacidades generales y multilingües superiores en código y matemáticas |
| Modelos alemanes de 7B de la familia Llama/Mistral | ~7-8 B | Variable | Alemán/multilingüe | Variable (Llama, Apache 2.0) | Alternativas genéricas; no se dispone de datos comparativos verificados en esta ficha |

No se dispone de resultados de benchmarks comparativos verificables entre EliasAI-7B-v2.2 y estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente en alemán: el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Especializado en conversación; no se documentan capacidades de código, matemáticas avanzadas ni tool calling, por lo que no es adecuado para pipelines de ingeniería de software.
- Riesgo de alucinación: el propio autor reconoce que el modelo ofrece "estimaciones calibradas" cuando no está seguro, lo que implica que puede presentar información incorrecta con tono seguro; se recomienda verificación externa.
- Sesgos: no se documenta ninguna evaluación de sesgos; el dataset curado de 15.072 diálogos puede introducir sesgos de estilo, opinión o identidad de marca.
- Límites duros declarados por el autor: no conoce hora ni precios en vivo, no procesa imágenes, no ofrece dosis médicas y rechaza peticiones ilegales.
- Contexto configurado en 8.192 tokens en el ejemplo de despliegue; conversaciones más largas pueden degradar la memoria a corto plazo.
- Licencia Apache 2.0: permite uso comercial, pero el modelo deriva de Qwen2.5-7B, cuyos términos deben respetarse igualmente.
- Sin descargas ni validación comunitaria en el momento de la ficha (0 descargas, 0 likes), por lo que la calidad reportada por el autor no ha sido replicada de forma independiente.
- El modelo incluye una identidad de marca concreta (ETME TECH / Elias Rickert) en su entrenamiento; su uso comercial por terceros puede requerir revisar la adecuación del system prompt.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ETME-TECH/EliasAI-7B-v2.2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B
- llama.cpp (runtime recomendado por el autor): https://github.com/ggml-org/llama.cpp
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
