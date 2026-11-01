# ArchiveStudio/Qwen3-4B-Instruct-2507

## Resumen

Qwen3-4B-Instruct-2507 es un modelo de lenguaje causal de 4.022 millones de parametros (4.0B, de los cuales 3.6B son no-embedding) desarrollado por el equipo Qwen de Alibaba. Se trata de la version actualizada del modo no-thinking de la familia Qwen3, publicada en julio de 2025, que elimina por completo la generacion de bloques `<think></think>` y se centra en respuestas directas de alta calidad. El repositorio analizado es un espejo subido por el usuario ArchiveStudio que redistribuye los pesos originales bajo licencia Apache 2.0.

El modelo emplea una arquitectura transformer densa con 36 capas y atencion con Grouped Query Attention (32 cabezas para Q y 8 para KV), lo que reduce el coste de memoria de la cache KV frente a atencion multi-cabeza clasica. Su ventana de contexto nativa alcanza los 262.144 tokens, una cifra notable para un modelo de solo 4B de parametros, y esta disenado para tareas de instruccion, razonamiento logico, matematicas, ciencia, codigo y uso de herramientas.

La relevancia de esta version radica en las mejoras sustanciales frente al Qwen3-4B no-thinking original: por ejemplo, en AIME25 pasa de 19.1 a 47.4, en ZebraLogic de 35.2 a 80.2 y en Arena-Hard v2 de 9.5 a 43.4, acercandose e incluso superando en varias metricas a modelos mucho mayores como GPT-4.1-nano o al Qwen3-30B-A3B en modo no-thinking. Es, por tanto, una opcion atractiva para despliegues con recursos limitados que necesiten contexto largo y capacidades agénticas razonables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (Qwen3), 36 capas, GQA con 32 cabezas Q y 8 KV |
| Parametros totales | 4.022.468.096 (4.0B); 3.6B no-embedding |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (soporte generico via llama.cpp, Ollama, MLX-LM y KTransformers) |
| Idiomas soportados | No disponible de forma explicita; la model card menciona cobertura de conocimiento long-tail en multiples idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers); tamano del repo 8.1 GB |

## Arquitectura y entrenamiento

Qwen3-4B-Instruct-2507 es un transformer causal denso con 36 capas y atencion con Grouped Query Attention, con 32 cabezas de consulta y 8 de clave/valor. Esta configuracion reduce significativamente el tamano de la cache KV en inferencia con contextos largos, lo que facilita el despliegue de la ventana de 262.144 tokens en GPUs de gama media-alta. El modelo ha pasado por fases de preentrenamiento y post-entrenamiento (pretraining & post-training), aunque la model card no detalla el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas concretas de RLHF o DPO.

La innovacion principal de esta version 2507 es la eliminacion del modo "thinking": el modelo ya no genera bloques `<think></think>` y no requiere el parametro `enable_thinking=False`. Esto simplifica la integracion en produccion, reduce la latencia y el consumo de tokens, y esta pensado para escenarios donde se prioriza una respuesta directa. Las mejoras reportadas se concentran en seguimiento de instrucciones, razonamiento logico, comprension de texto, matematicas, ciencia, codigo y uso de herramientas, ademas de una mejor alineacion con preferencias subjetivas del usuario.

## Capacidades

- Generacion de texto conversacional y de instrucciones, con calidad de redaccion mejorada (Creative Writing v3: 83.5; WritingBench: 83.4).
- Razonamiento logico y matematico de varios pasos (AIME25: 47.4; HMMT25: 31.0; ZebraLogic: 80.2).
- Conocimiento general y cientifico (MMLU-Pro: 69.6; GPQA: 62.0; SuperGPQA: 42.8).
- Generacion de codigo en multiples lenguajes (LiveCodeBench v6: 35.1; MultiPL-E: 76.8).
- Tool calling / function calling, con soporte recomendado a traves de Qwen-Agent (BFCL-v3: 61.9).
- Capacidades agénticas y razonamiento multi-paso en entornos simulados (TAU1-Retail: 48.7; TAU1-Airline: 32.0; TAU2-Retail: 40.4; TAU2-Airline: 24.0).
- Comprension de contexto largo nativo de hasta 262.144 tokens.
- Capacidades multilingues (MultiIF: 69.0; MMLU-ProX: 61.6; INCLUDE: 60.1; PolyMATH: 31.1).
- Modo unico no-thinking: no genera bloques de razonamiento interno, lo que simplifica el parseo de salidas.
- No soporta vision, audio ni otras modalidades segun la informacion disponible.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con historiales extensos gracias a su ventana de 262.144 tokens, manteniendo coherencia sobre documentos, pedidos o incidencias previas sin truncar el contexto.
- Generacion de codigo en produccion: con 76.8 en MultiPL-E y soporte de tool calling, puede integrarse en pipelines de CI/CD para autocompletar funciones, generar tests o revisar parches, invocando herramientas externas (linters, ejecutores de tests) mediante function calling.
- Agentes de automatizacion de tareas: los resultados en TAU1 y TAU2 (hasta 48.7 en Retail) lo hacen adecuado para agentes que consultan APIs, reservan vuelos o gestionan pedidos en entornos simulados, usando Qwen-Agent para plantillas y parsers de tool calling.
- Analisis de documentos largos: contratos, informes tecnicos o expedientes de cientos de miles de tokens pueden procesarse en una sola pasada, extrayendo clausulas, resumiendo secciones o respondiendo preguntas sobre el contenido.
- Tutoria y resolucion de problemas matematicos y cientificos: con 47.4 en AIME25 y 62.0 en GPQA, es util para asistentes educativos que explican paso a paso ejercicios de nivel avanzado.
- Generacion de contenido editorial y creativo: las puntuaciones en Creative Writing v3 (83.5) y WritingBench (83.4) lo hacen apropiado para redaccion de articulos, resenas o copy marketing con instrucciones de estilo.
- Despliegue en local o edge: con 4B de parametros y cuantizacion via llama.cpp, Ollama o MLX-LM, puede ejecutarse en estaciones de trabajo o portatiles con GPU consumer para prototipado y asistentes personales.
- Traduccion y procesamiento multilingue: con soporte para tareas multilingues (MMLU-ProX: 61.6; INCLUDE: 60.1), puede usarse en pipelines de localizacion o atencion al cliente en varios idiomas.

## Benchmarks y rendimiento

Resultados publicados en la model card (comparativa con GPT-4.1-nano, Qwen3-30B-A3B Non-Thinking y Qwen3-4B Non-Thinking):

| Benchmark | GPT-4.1-nano | Qwen3-30B-A3B NT | Qwen3-4B NT | Qwen3-4B-Instruct-2507 |
|---|---|---|---|---|
| MMLU-Pro | 62.8 | 69.1 | 58.0 | 69.6 |
| MMLU-Redux | 80.2 | 84.1 | 77.3 | 84.2 |
| GPQA | 50.3 | 54.8 | 41.7 | 62.0 |
| SuperGPQA | 32.2 | 42.2 | 32.0 | 42.8 |
| AIME25 | 22.7 | 21.6 | 19.1 | 47.4 |
| HMMT25 | 9.7 | 12.0 | 12.1 | 31.0 |
| ZebraLogic | 14.8 | 33.2 | 35.2 | 80.2 |
| LiveBench 20241125 | 41.5 | 59.4 | 48.4 | 63.0 |
| LiveCodeBench v6 | 31.5 | 29.0 | 26.4 | 35.1 |
| MultiPL-E | 76.3 | 74.6 | 66.6 | 76.8 |
| Aider-Polyglot | 9.8 | 24.4 | 13.8 | 12.9 |
| IFEval | 74.5 | 83.7 | 81.2 | 83.4 |
| Arena-Hard v2 | 15.9 | 24.8 | 9.5 | 43.4 |
| Creative Writing v3 | 72.7 | 68.1 | 53.6 | 83.5 |
| WritingBench | 66.9 | 72.2 | 68.5 | 83.4 |
| BFCL-v3 | 53.0 | 58.6 | 57.6 | 61.9 |
| TAU1-Retail | 23.5 | 38.3 | 24.3 | 48.7 |
| TAU1-Airline | 14.0 | 18.0 | 16.0 | 32.0 |
| TAU2-Retail | - | 31.6 | 28.1 | 40.4 |
| TAU2-Airline | - | 18.0 | 12.0 | 24.0 |
| TAU2-Telecom | - | 18.4 | 17.5 | 13.2 |
| MultiIF | 60.7 | 70.8 | 61.3 | 69.0 |
| MMLU-ProX | 56.2 | 65.1 | 49.6 | 61.6 |
| INCLUDE | 58.6 | 67.8 | 53.8 | 60.1 |
| PolyMATH | 15.6 | 23.3 | 16.6 | 31.1 |

Nota: en Arena-Hard v2 los win rates fueron evaluados por GPT-4.1 segun indica la model card.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 8 GB solo para pesos, mas cache KV; con contexto completo de 262.144 tokens la cache KV crece de forma considerable y puede superar los 20-30 GB adicionales, por lo que en la practica conviene reducir el contexto (la model card sugiere 32.768 tokens si aparecen OOM).
- VRAM estimada en cuantizacion de 8 bits: en torno a 4-5 GB para pesos; en 4 bits, en torno a 2.5-3 GB, mas cache KV.
- GPU recomendadas: para BF16 con contexto largo, A100 40/80 GB o H100; para contexto moderado (8K-32K), RTX 4090 (24 GB) o L40S.
- Cabe en GPU consumer: si, en tarjetas con 8-12 GB o mas usando cuantizacion (RTX 3060 12 GB, RTX 4070, RTX 4090, Apple Silicon con MLX-LM).
- Opciones de despliegue: transformers (>= 4.51.0), vLLM (>= 0.8.5), SGLang (>= 0.4.6.post1), llama.cpp, Ollama, LMStudio, MLX-LM, KTransformers; tambien compatible con text-generation-inference y endpoints compatibles.
- Latencia y throughput: no disponibles en la informacion proporcionada; la model card remite al blog y documentacion de Qwen para detalles de rendimiento de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU-Pro | AIME25 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3-4B-Instruct-2507 | 4.0B (denso) | 262.144 | 69.6 | 47.4 | Apache 2.0 | HuggingFace (repo original Qwen y espejo ArchiveStudio) |
| Qwen3-4B Non-Thinking (version previa) | 4.0B (denso) | 32.768 (segun version original) | 58.0 | 19.1 | Apache 2.0 | HuggingFace |
| Qwen3-30B-A3B Non-Thinking | 30B totales, 3B activos (MoE) | 262.144 | 69.1 | 21.6 | Apache 2.0 | HuggingFace |
| GPT-4.1-nano | no disponible | no disponible | 62.8 | 22.7 | Propietaria | API OpenAI |

## Limitaciones y advertencias

- Alucinacion: como todo modelo de lenguaje, puede generar contenido plausible pero incorrecto, especialmente en conocimiento long-tail y tareas de razonamiento complejo; conviene validar salidas en produccion.
- Sin modo thinking: no dispone de razonamiento interno explicito, lo que puede penalizar en tareas que se benefician de cadenas de pensamiento largas (por ejemplo, Aider-Polyglot cae a 12.9 frente a 24.4 del Qwen3-30B-A3B).
- Rendimiento inferior en TAU2-Telecom (13.2) frente a la version previa (17.5) y al Qwen3-30B-A3B (18.4), lo que sugiere cautela en dominios de agentes de telecomunicaciones.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible; se recomienda auditoria previa a despliegues sensibles.
- Idiomas: la model card no lista idiomas de forma explicita; aunque reporta mejoras multilingues, el rendimiento fuera de ingles y chino puede ser desigual.
- Contexto: aunque nativo de 262.144 tokens, usar la ventana completa exige mucha memoria; la propia model card recomienda bajar a 32.768 si hay OOM.
- Licencia Apache 2.0: permite uso comercial, pero el repo espejo ArchiveStudio no es el oficial; para produccion se recomienda descargar los pesos desde el repositorio original de Qwen y verificar el LICENSE enlazado.
- Requiere transformers >= 4.51.0; versiones anteriores fallan con `KeyError: 'qwen3'`.
- El repositorio espejo no tiene descargas ni likes y fue creado en 2026-11-01; su procedencia y mantenimiento no estan garantizados.

## Enlaces

- Repositorio HuggingFace analizado: https://huggingface.co/ArchiveStudio/Qwen3-4B-Instruct-2507
- Repositorio original del modelo: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Licencia: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507/blob/main/LICENSE
- Blog de Qwen: https://qwenlm.github.io/blog/qwen3/
- GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Documentacion: https://qwen.readthedocs.io/en/latest/
- Qwen-Agent (tool calling): https://github.com/QwenLM/Qwen-Agent
- Chat de Qwen: https://chat.qwen.ai
- Paper de referencia (arXiv): https://arxiv.org/abs/2505.09388
