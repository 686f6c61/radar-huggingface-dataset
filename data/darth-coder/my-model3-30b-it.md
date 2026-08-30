# Darth-Coder/my-model3-30b-it

## Resumen

El modelo `Darth-Coder/my-model3-30b-it` es una redistribución del modelo **Qwen3-30B-A3B-Instruct-2507**, desarrollado originalmente por Alibaba Cloud (Qwen). Se trata de un modelo de lenguaje de tipo causal con arquitectura MoE (Mixture of Experts) de 30.500 millones de parámetros totales, de los cuales solo 3.300 millones se activan por token, lo que permite un rendimiento de inferencia muy superior al de un modelo denso de tamaño equivalente.

Este modelo está pensado para generación de texto conversacional y soporta una ventana de contexto nativa de 262.144 tokens (256K). A diferencia de la versión anterior, esta actualización **solo admite modo no-thinking**: no genera bloques de razonamiento explícito tipo `thinking`, lo que simplifica la integración y reduce la latencia. La relevancia actual del modelo radica en que combina un coste de inferencia bajo (gracias al MoE) con capacidades competitivas en razonamiento, codificación, uso de herramientas y comprensión de contexto largo, posicionándose como una alternativa eficiente a modelos densos de 30B o incluso a modelos cerrados de mayor tamaño.

El repositorio aloja los pesos en formato `safetensors` (61,1 GB) y está licenciado bajo Apache 2.0, lo que permite uso comercial sin restricciones significativas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con MoE (Qwen3-MoE) |
| Parametros totales | 30.532.122.624 (30,5B) |
| Parametros activos | 3,3B (8 de 128 expertos activos) |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | Multilingue (idiomas especificos no detallados en la informacion disponible) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer causal con mezcla de expertos (MoE). Está compuesto por 48 capas, con atención GQA (Grouped Query Attention) que usa 32 cabezas de consulta (Q) y 4 cabezas de clave-valor (KV). Dispone de 128 expertos en las capas feedforward, de los cuales se activan 8 por token, lo que reduce drásticamente el coste computacional en inferencia. El total de parámetros sin embeddings es de 29,9B.

El entrenamiento se realizó en dos etapas: pre-entrenamiento y post-entrenamiento. La versión 2507 incorpora mejoras significativas en seguimiento de instrucciones, razonamiento lógico, comprensión de texto, matemáticas, ciencia, codificación y uso de herramientas. También se observan ganancias sustanciales en cobertura de conocimiento de cola larga en múltiples idiomas y una mejor alineación con preferencias humanas en tareas subjetivas y abiertas. Además, se mejoró la comprensión de contexto largo hasta 256K. No se especifica el número exacto de tokens de entrenamiento ni las técnicas de alineación (RLHF/DPO) empleadas en la información disponible.

## Capacidades

- Generación de texto conversacional de alta calidad, con mejor alineación en tareas subjetivas y abiertas respecto a la versión anterior.
- Razonamiento lógico y matemático: puntuaciones notables en benchmarks como AIME25 (61,3) y ZebraLogic (90,0).
- Codificación: soporte para generación y depuración de código en múltiples lenguajes (MultiPL-E 83,8, LiveCodeBench 43,2).
- Uso de herramientas (tool calling) y funciones: resultados competitivos en BFCL-v3 (65,1) y TAU benchmarks.
- Capacidades de agente: ejecución de tareas multi-paso con razonamiento, aunque con resultados variables según el dominio (TAU2-Telecom 12,3).
- Comprensión de contexto largo: ventana nativa de 256K tokens, adecuada para documentos extensos y conversaciones multi-turno.
- Multilingüismo: soporte de múltiples idiomas, aunque no se detallan cuáles en la información disponible.
- No genera bloques de razonamiento (thinking mode desactivado), lo que simplifica el flujo de inferencia.

## Casos de uso

- Atención al cliente automatizada: con 256K de contexto, el modelo puede mantener conversaciones multi-turno largas y recordar detalles de interacciones previas, gestionando incidencias complejas sin perder el hilo.
- Generación de código en producción: su capacidad de tool calling permite integrarlo en pipelines de CI/CD para autogenerar tests, documentación o parches, reduciendo el trabajo manual de los desarrolladores.
- Análisis de documentos extensos: la ventana de 256K permite procesar informes financieros, artículos científicos o contratos legales completos en una sola pasada, extrayendo resúmenes y respondiendo preguntas específicas.
- Asistente de investigación multilingüe: puede buscar y sintetizar información en varios idiomas, ayudando a investigadores a revisar literatura académica internacional.
- Chatbots de soporte técnico especializado: su razonamiento lógico (ZebraLogic 90,0) le permite diagnosticar problemas técnicos y proponer soluciones paso a paso.
- Generación de contenido creativo: con puntuaciones altas en Creative Writing v3 (86,0) y WritingBench (85,5), es adecuado para redacción de artículos, guiones o material de marketing.
- Automatización de agentes de negocio: puede gestionar tareas como reservas, consultas de inventario o atención en comercio electrónico, aprovechando su soporte de function calling.

## Benchmarks y rendimiento

La model card del autor incluye la siguiente tabla de resultados comparativos (evaluados por el equipo de Qwen):

| Benchmark | DeepSeek-V3-0324 | GPT-4o-0327 | Gemini-2.5-Flash Non-Thinking | Qwen3-235B-A22B Non-Thinking | Qwen3-30B-A3B Non-Thinking | Qwen3-30B-A3B-Instruct-2507 |
|---|---|---|---|---|---|---|
| MMLU-Pro | 81,2 | 79,8 | 81,1 | 75,2 | 69,1 | 78,4 |
| MMLU-Redux | 90,4 | 91,3 | 90,6 | 89,2 | 84,1 | 89,3 |
| GPQA | 68,4 | 66,9 | 78,3 | 62,9 | 54,8 | 70,4 |
| SuperGPQA | 57,3 | 51,0 | 54,6 | 48,2 | 42,2 | 53,4 |
| AIME25 | 46,6 | 26,7 | 61,6 | 24,7 | 21,6 | 61,3 |
| HMMT25 | 27,5 | 7,9 | 45,8 | 10,0 | 12,0 | 43,0 |
| ZebraLogic | 83,4 | 52,6 | 57,9 | 37,7 | 33,2 | 90,0 |
| LiveBench 20241125 | 66,9 | 63,7 | 69,1 | 62,5 | 59,4 | 69,0 |
| LiveCodeBench v6 | 45,2 | 35,8 | 40,1 | 32,9 | 29,0 | 43,2 |
| MultiPL-E | 82,2 | 82,7 | 77,7 | 79,3 | 74,6 | 83,8 |
| Aider-Polyglot | 55,1 | 45,3 | 44,0 | 59,6 | 24,4 | 35,6 |
| IFEval | 82,3 | 83,9 | 84,3 | 83,2 | 83,7 | 84,7 |
| Arena-Hard v2* | 45,6 | 61,9 | 58,3 | 52,0 | 24,8 | 69,0 |
| Creative Writing v3 | 81,6 | 84,9 | 84,6 | 80,4 | 68,1 | 86,0 |
| WritingBench | 74,5 | 75,5 | 80,5 | 77,0 | 72,2 | 85,5 |
| BFCL-v3 | 64,7 | 66,5 | 66,1 | 68,0 | 58,6 | 65,1 |
| TAU1-Retail | 49,6 | 60,3# | 65,2 | 65,2 | 38,3 | 59,1 |
| TAU1-Airline | 32,0 | 42,8# | 48,0 | 32,0 | 18,0 | 40,0 |
| TAU2-Retail | 71,1 | 66,7# | 64,3 | 64,9 | 31,6 | 57,0 |
| TAU2-Airline | 36,0 | 42,0# | 42,5 | 36,0 | 18,0 | 38,0 |
| TAU2-Telecom | 34,0 | 29,8# | 16,9 | 24,6 | 18,4 | 12,3 |
| MultiIF | 66,5 | 70,4 | 69,4 | 70,2 | 70,8 | 67,9 |
| MMLU-ProX | 75,8 | 76,2 | 78,3 | 73,2 | 65,1 | 72,0 |
| INCLUDE | 80,1 | 82,1 | 83,8 | 75,6 | 67,8 | 71,9 |
| PolyMATH | 32,2 | 25,5 | 41,9 | 27,0 | 23,3 | 43,1 |

*Resultados de Arena-Hard v2 evaluados con GPT-4.1. Los resultados marcados con # se generaron usando GPT-4o-20241120.

El modelo destaca especialmente en razonamiento lógico (ZebraLogic 90,0), alineación (Arena-Hard v2 69,0) y escritura creativa, mientras que muestra resultados más débiles en tareas de agente específicas como TAU2-Telecom (12,3).

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en FP16 ocupan aproximadamente 61 GB. Con cuantización de 8 bits se reduce a ~30 GB, y con 4 bits a ~15 GB. Dado que es un MoE con 3,3B de parámetros activos, la memoria necesaria para la activación por token es mucho menor que la de un modelo denso de 30B.
- GPUs recomendadas: para FP16 se necesitan GPUs de datacenter como A100 (80 GB) o H100. Con cuantización de 4 bits puede ejecutarse en GPUs de consumo como RTX 4090 (24 GB) o incluso RTX 3090 (24 GB). Para contexto completo de 256K se requiere más memoria de activaciones, por lo que se recomienda reducir la longitud de contexto en GPUs de consumo.
- Opciones de despliegue: compatible con `transformers`, `vLLM` (>=0.8.5), `SGLang` (>=0.4.6.post1) y `llama.cpp` (a través de conversión a GGUF). También puede usarse con `Ollama` si se convierte el modelo.
- Latencia y throughput: al activar solo 3,3B de parámetros, el throughput es aproximadamente 3-4 veces superior al de un modelo denso de 30B en las mismas condiciones de hardware. No se proporcionan cifras exactas en la información disponible.

## Comparativa con modelos similares

| Modelo | Params totales | Params activos | Contexto | Licencia | MMLU-Pro | AIME25 | MultiPL-E |
|---|---|---|---|---|---|---|---|
| Qwen3-30B-A3B-Instruct-2507 (este) | 30,5B | 3,3B | 256K | Apache 2.0 | 78,4 | 61,3 | 83,8 |
| Qwen3-30B-A3B (versión anterior) | 30,5B | 3,3B | 128K | Apache 2.0 | 69,1 | 21,6 | 74,6 |
| DeepSeek-V3-0324 | 671B | 37B | 128K | MIT | 81,2 | 46,6 | 82,2 |
| Qwen3-235B-A22B | 235B | 22B | 128K | Apache 2.0 | 75,2 | 24,7 | 79,3 |

Frente a DeepSeek-V3-0324, este modelo es significativamente más ligero (3,3B activos frente a 37B) y ofrece mejor rendimiento en razonamiento matemático (AIME25 61,3 vs 46,6) y lógico (ZebraLogic 90,0 vs 83,4), aunque pierde en conocimiento general (MMLU-Pro 78,4 vs 81,2). Respecto al Qwen3-30B-A3B original, la versión 2507 supone una mejora sustancial en todos los benchmarks.

## Limitaciones y advertencias

- No soporta modo thinking: el modelo no genera bloques de razonamiento explícito, lo que puede limitar su rendimiento en tareas que requieren cadenas de razonamiento largas y verificables.
- Sesgos y alucinaciones: como todo LLM, puede producir información falsa o inventada, especialmente en dominios de conocimiento de cola larga. No se han publicado evaluaciones específicas de sesgos para esta versión.
- Rendimiento variable en tareas de agente: los resultados en benchmarks como TAU2-Telecom (12,3) son notablemente bajos, lo que sugiere debilidades en dominios especializados de automatización.
- Idiomas no especificados: aunque el modelo es multilingüe, no se detalla qué idiomas cubre ni su calidad relativa. Las pruebas en MMLU-ProX (72,0) y PolyMATH (43,1) sugieren un rendimiento inferior al de modelos como Gemini-2.5-Flash.
- Contexto largo con limitaciones prácticas: aunque la ventana nativa es de 256K, el uso de contexto completo requiere mucha memoria y puede degradar la calidad si no se gestiona adecuadamente.
- Dependencia de la versión de `transformers`: se requiere `transformers>=4.51.0` para cargar el modelo (error `KeyError: 'qwen3_moe'` en versiones anteriores).
- Repositorio sin verificación: al ser una redistribución de un tercero (Darth-Coder) con 0 descargas y 0 likes, se recomienda verificar la integridad de los pesos antes de usarlo en producción.

## Enlaces

- Modelo en HuggingFace (redistribución): https://huggingface.co/Darth-Coder/my-model3-30b-it
- Modelo original en HuggingFace: https://huggingface.co/Qwen/Qwen3-30B-A3B-Instruct-2507
- Blog de Qwen sobre Qwen3: https://qwenlm.github.io/blog/qwen3/
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Documentación oficial: https://qwen.readthedocs.io/en/latest/
