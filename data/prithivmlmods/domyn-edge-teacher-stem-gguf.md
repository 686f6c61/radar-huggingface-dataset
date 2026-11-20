# prithivMLmods/Domyn-Edge-Teacher-STEM-GGUF

## Resumen

Domyn-Edge-Teacher-STEM es un transformer denso de 4B parámetros (3.928.787.968 parámetros reales según safetensors) desarrollado por Domyn sobre su modelo base Domyn Edge SFT. Su función no es la de un asistente generalista, sino la de profesor especializado en el dominio STEM dentro del pipeline de post-entrenamiento Multi-Teacher On-Policy Distillation (MOPD) de Domyn, donde proporciona puntuación a nivel de token sobre los rollouts de los modelos estudiantes.

El modelo se liberó en bfloat16 junto con su mix de entrenamiento (Domyn-Edge-Teacher-STEM-Mix) como parte del segundo bundle de Domyn Edge. Pasó por una época de fine-tuning supervisado especializado en STEM con contexto de 64k (ciencia, QA de razonamiento general y QA sobre documentos largos) y posteriormente por Group Relative Policy Optimization (GRPO) asíncrono sobre 48.329 preguntas de ciencia de opción múltiple verificables. Este ajuste eleva el rendimiento en GPQA Diamond pass@1 en +12,4 puntos respecto a Domyn Edge SFT (de 56,3% a 68,7%, y hasta 69,1% con penalización de presencia).

La ficha que nos ocupa corresponde a la cuantización GGUF publicada por prithivMLmods, que empaqueta el modelo en nueve variantes desde Q3_K_M hasta BF16, todas bajo licencia Apache 2.0. Es relevante ahora porque permite ejecutar un modelo especializado en STEM de 4B en hardware de consumo, con contexto largo y una plantilla de chat de razonamiento `<think>`, manteniendo la arquitectura y el tokenizador exactos del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Domyn Edge SFT) |
| Parametros totales | 3.928.787.968 (aproximadamente 3,93B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 64k tokens (entrenamiento); 16.384 tokens en la prueba de rendimiento publicada |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de cuantizaciones); modelo base en bfloat16 |
| Tamano del repo | 29,7 GB |
| Modelo base | domyn/Domyn-Edge-Teacher-STEM |
| Dataset de entrenamiento | domyn/Domyn-Edge-Teacher-STEM-Mix |
| Libreria | transformers; compatible con llama.cpp y text-generation-inference |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso de aproximadamente 3,93B parámetros que conserva exactamente la estructura, el tokenizador y la plantilla de chat de razonamiento `<think>` de Domyn Edge SFT. El entrenamiento se estructuró en dos fases: primero, una época de fine-tuning supervisado (SFT) especializado en STEM con longitud de contexto de 64k, cubriendo ciencia, QA de razonamiento general y QA sobre documentos largos; después, un ajuste con GRPO asíncrono sobre 48.329 preguntas de ciencia de opción múltiple verificables.

La innovación técnica principal no reside en la arquitectura en sí, sino en su rol dentro del pipeline MOPD: el modelo actúa como profesor de dominio que puntúa los rollouts de los estudiantes a nivel de token, en lugar de generar respuestas finales para el usuario. El mix de entrenamiento está publicado como dataset abierto, lo que facilita la reproducibilidad del proceso. No se dispone de información sobre el número total de tokens de preentrenamiento ni sobre la composición detallada del corpus original de Domyn Edge SFT.

## Capacidades

- Generación de texto y razonamiento especializado en dominios STEM (ciencia, matemáticas, ingeniería).
- Modo de razonamiento explícito mediante plantilla de chat `<think>`, que separa el proceso de pensamiento de la respuesta final.
- Resolución de preguntas de ciencia de opción múltiple con verificación objetiva (base del entrenamiento GRPO).
- QA sobre documentos largos gracias al contexto de entrenamiento de 64k tokens.
- Razonamiento matemático aplicado: problemas de cinemática, caudal, edades, combinatoria y similares (verificados en las pruebas publicadas).
- Generación de código en contextos STEM (por ejemplo, inserción de nodos en listas enlazadas).
- Capacidad de puntuación a nivel de token para destilación on-policy (uso previsto original).
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Destilación on-policy de modelos estudiantes: el modelo puntúa token a token los rollouts de un estudiante en el pipeline MOPD, permitiendo transferir conocimiento STEM especializado a modelos más pequeños sin necesidad de un profesor propietario.
- Tutoría automática de ciencias en inglés: con su entrenamiento sobre 48.329 preguntas verificables y su plantilla `<think>`, puede generar explicaciones razonadas paso a paso para preguntas de física, química y matemáticas.
- Generación de bancos de preguntas STEM verificables: útil para producir y validar ítems de opción múltiple con justificación, aprovechando el ajuste GRPO sobre respuestas objetivamente comprobables.
- QA sobre documentación técnica larga: el contexto de 64k permite procesar manuales, papers o especificaciones completas y responder preguntas que requieren cruzar información de varias secciones.
- Evaluación automática de respuestas de estudiantes: el modelo puede actuar como juez de razonamiento científico, comparando la respuesta del alumno con la cadena de razonamiento correcta.
- Asistente de código para problemas algorítmicos: tareas como inserción en listas enlazadas o implementación de algoritmos clásicos, con explicación del razonamiento previa al código.
- Despliegue en entornos con recursos limitados: las cuantizaciones Q3_K_M (2 GB) y Q4_K_M (2,42 GB) permiten ejecutar el modelo en portátiles o GPUs de gama media para prototipos de tutoría offline.

## Benchmarks y rendimiento

| Benchmark | Domyn-Edge-Teacher-STEM | Domyn Edge SFT (base) | Delta |
|---|---|---|---|
| GPQA Diamond pass@1 | 68,7% | 56,3% | +12,4 puntos |
| GPQA Diamond pass@1 (con penalización de presencia) | 69,1% | No disponible | No disponible |

Rendimiento de inferencia publicado (Q6_K, llama-cli, RTX PRO 6000 Blackwell con 96 GB VRAM, contexto 16.384, KV cache q8_0, `-ngl 99`, semilla 42, 5 ejecuciones):

| Métrica | Valor |
|---|---|
| Velocidad media de procesamiento de prompt | 1.208,01 tokens/s |
| Velocidad media de generación | 233,27 tokens/s |
| Tiempo total de ejecución | 54,6 s |
| VRAM pico | 4,99 GiB |
| Utilización pico de GPU | 92% |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos): BF16 ~7,87 GB; Q8_0 ~4,18 GB; Q6_K ~3,23 GB; Q5_K_M ~2,81 GB; Q4_K_M ~2,42 GB; Q3_K_M ~2 GB. Añadir el espacio de la KV cache según el contexto configurado.
- En la prueba publicada con Q6_K y contexto de 16.384 tokens, el pico de VRAM fue de 4,99 GiB, lo que deja margen para GPUs de 8 GB.
- GPU recomendadas: RTX PRO 6000 Blackwell (probada), A100, H100 para despliegues de alta concurrencia; RTX 4090, RTX 3090 y GPUs de 8-12 GB para las cuantizaciones Q4/Q5.
- Cabe en GPU de consumo: sí, con Q3_K_M, Q4_K_M, Q5_K_M o Q6_K en tarjetas de 6-8 GB o superiores; BF16 requiere al menos 10-12 GB para pesos más cache.
- Opciones de despliegue: llama.cpp (probado), Ollama, text-generation-inference (etiqueta `text-generation-inference`), transformers con pesos del modelo base.
- Throughput medido: 233,27 tokens/s de generación y 1.208,01 tokens/s de procesamiento de prompt en la configuración indicada; la latencia real dependerá del hardware, la cuantización y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Domyn-Edge-Teacher-STEM | ~3,93B (denso) | 64k | Apache 2.0 | Profesor STEM para destilación | GGUF en HF, base en BF16 |
| Domyn Edge SFT | ~3,93B (denso) | 64k | Apache 2.0 | Asistente generalista base | HF |
| Alternativas de ~4B especializadas en STEM | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks de modelos comparables de terceros en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable más allá del delta frente a Domyn Edge SFT.

## Limitaciones y advertencias

- El modelo está diseñado como profesor para puntuación token a token en un pipeline de destilación, no como asistente conversacional general; su uso directo como chatbot puede dar resultados subóptimos.
- Solo soporta inglés según la model card; no se garantiza calidad en castellano ni en otros idiomas.
- Riesgo de alucinación inherente a los modelos de ~4B, especialmente en preguntas científicas fuera de la distribución del dataset de entrenamiento.
- El ajuste GRPO se realizó exclusivamente sobre preguntas de ciencia de opción múltiple verificables, lo que puede sesgar el estilo de respuesta hacia formatos de examen.
- No hay información publicada sobre sesgos demográficos, sociales o culturales del modelo.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y el dataset deben citarse adecuadamente; conviene revisar las condiciones del modelo base original.
- El rendimiento de inferencia publicado corresponde a una GPU de 96 GB de VRAM; en hardware de consumo el throughput será sustancialmente menor.
- No se han publicado evaluaciones de seguridad, robustez frente a prompts adversarios ni comportamiento en contextos muy superiores a 16k tokens.
- El repositorio GGUF es una cuantización de terceros (prithivMLmods), no una publicación oficial de Domyn; la fidelidad de las cuantizaciones de baja precisión (Q3) puede degradar el razonamiento.

## Enlaces

- Repositorio GGUF: https://huggingface.co/prithivMLmods/Domyn-Edge-Teacher-STEM-GGUF
- Modelo base: https://huggingface.co/domyn/Domyn-Edge-Teacher-STEM
- Dataset de entrenamiento: https://huggingface.co/datasets/domyn/Domyn-Edge-Teacher-STEM-Mix
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Perfil del cuantizador: https://huggingface.co/prithivMLmods
