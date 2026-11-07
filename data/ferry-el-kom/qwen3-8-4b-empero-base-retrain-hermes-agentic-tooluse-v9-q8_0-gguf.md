# ferry-el-kom/qwen3.8-4b-empero-base-retrain-hermes-agentic-tooluse-v9-Q8_0-gguf

## Resumen

El modelo `qwen3.8-4b-empero-base-retrain-hermes-agentic-tooluse-v9-Q8_0-gguf` es una cuantización GGUF Q8_0 de un ajuste fino supervisado (SFT) sobre la base Qwen3.8-4B de empero-ai, publicado por el usuario ferry-el-kom. El ajuste, denominado v9, se orienta a uso agéntico y a la invocación disciplinada de herramientas (tool calling), y se presenta como continuación de la línea "empero" que corrige un fallo de la versión v8 (dilución del 78% de datos sin herramientas que provocaba pérdida de disciplina en el uso de tools).

El modelo tiene 4.326.350.848 parámetros (aproximadamente 4,3 mil millones) y se distribuye únicamente en formato GGUF con cuantización Q8_0, en un único archivo de 4,61 GB. Según la model card, está diseñado para responder con recuperación documental y citas (retrieval-grounded), no para conocimiento cerrado, y funciona como modelo con modo de razonamiento (thinking), requiriendo un presupuesto mínimo de generación de 300 tokens para evitar respuestas vacías.

La relevancia actual del modelo es limitada pero concreta: se trata de un ajuste de nicho, con cero descargas y cero likes en el momento de la consulta, que reporta resultados propios en una evaluación interna de control de calidad sobre bases de datos (Database EagleEye smoke30) con un 90,0% de acierto y una latencia mediana de 3,9 s. Su interés principal reside en el pipeline de ajuste agéntico y en la comparación declarada con otros modelos de 4B de la misma familia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.8-4B de empero-ai; detalles de atención no disponibles) |
| Parametros totales | 4.326.350.848 (4,3B) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q8_0 (único archivo publicado) |
| Idiomas soportados | Inglés (en), rumano (ro) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`qwen3.8-4b-empero-v9-q8.gguf`, 4,61 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen3.8-4B de empero-ai, un transformer decoder-only de aproximadamente 4,3 mil millones de parámetros. La información disponible no detalla la configuración interna de capas, cabezas de atención ni mecanismos específicos (atención lineal, decodificación especulativa u otros), por lo que estos extremos quedan como no disponibles.

El ajuste v9 se realizó mediante SFT sobre un dataset denominado `v9`, con 120 pasos de entrenamiento, semilla 5, LoRA de rango 32 y alpha 64, tasa de aprendizaje 1e-4 y longitud de secuencia 768. La pérdida descendió de 0,948 a 0,606 durante el entrenamiento. La model card indica explícitamente que esta versión continúa la línea "empero" y remedia el fallo de la v8, en la que una dilución del 78% de datos sin herramientas provocó una pérdida de disciplina en el uso de tools. No se especifica el número total de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generación de texto conversacional en inglés y rumano.
- Invocación de herramientas (tool calling / function calling), con énfasis explícito en disciplina de uso de tools tras el reentrenamiento v9.
- Uso agéntico en tareas de recuperación documental con citas (retrieval-grounded answering), no orientado a conocimiento cerrado.
- Modo de razonamiento (thinking model): consume tokens en la etiqueta `<think>`, por lo que requiere `num_predict` ≥ 300 para producir contenido visible.
- Respuesta a preguntas con valor exacto sobre bases de datos (evaluación interna Database EagleEye).
- Compatibilidad declarada con endpoints (tag `endpoints_compatible`).
- Capacidades multilingües limitadas a los idiomas declarados (en, ro); no se documentan otras lenguas.
- No se documentan capacidades de visión, audio ni matemáticas avanzadas.

## Casos de uso

- Asistente de consulta sobre bases de datos internas: el modelo está entrenado para responder con valores exactos y citas a partir de contexto recuperado, lo que encaja en flujos RAG sobre tablas o registros corporativos.
- Agente de soporte con tool calling: su disciplina de invocación de herramientas permite encadenar llamadas a APIs de consulta (CRM, ERP, ticketing) en conversaciones multi-turno.
- Automatización de extracción y verificación de datos: dado un contexto documental, devuelve respuestas verificables con referencia a la fuente, útil en auditoría y control de calidad.
- Pipeline agéntico de atención al cliente en inglés o rumano: adecuado para mercados de habla inglesa y rumana, con integración en endpoints compatibles.
- Prototipado local en estaciones de trabajo: al ser un GGUF Q8_0 de 4,61 GB, puede ejecutarse en entornos de desarrollo sin infraestructura GPU dedicada de gran escala.
- Evaluación comparativa de ajustes agénticos: sirve como referencia para medir latencia y precisión frente a otros modelos de 4B en tareas de QA con recuperación.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia Apache 2.0 facilita su integración en productos comerciales, sujeto a las condiciones del modelo base.

## Benchmarks y rendimiento

Los únicos datos publicados provienen de la model card y corresponden a evaluaciones internas del autor, no a benchmarks estándar de la comunidad.

| Benchmark | Resultado | Latencia mediana |
|---|---|---|
| Database EagleEye smoke30 (30 ítems, QA de valor exacto) | 27/30 = 90,0% | 3,9 s |
| Database EagleEye bench-033 A/B | Ver ejecución hermana (no disponible) | No disponible |

Comparaciones declaradas por el autor:

| Modelo | Resultado smoke30 | Latencia mediana |
|---|---|---|
| qwen3.8-4b-empero-v9 (este modelo) | 90,0% (27/30) | 3,9 s |
| qwen35-4b-jackrong-v3 | 90,0% (27/30, mismos 3 fallos de recuperación) | 7,0 s |
| hermes-glm52-4b-soul Q8_0 | 86,7% | No disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 5-6 GB con la cuantización Q8_0 (archivo de 4,61 GB más overhead de contexto y caché KV); LLM Explorer indica 9,3 GB para el modelo base Qwen3.8-4B, cifra que puede servir como referencia conservadora.
- GPU recomendadas: tarjetas consumer con 8 GB o más de VRAM (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, RTX 4090); en el ámbito profesional, A100 o H100 para despliegues con concurrencia.
- Compatibilidad con GPU consumer: sí, cabe en GPUs de 8 GB o superiores con Q8_0; en GPUs de 6 GB requeriría cuantizaciones menores no publicadas.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF; el tag `endpoints_compatible` sugiere integración con endpoints al estilo de la API de OpenAI. vLLM y TGI no están confirmados para este archivo GGUF.
- Latencia y throughput: latencia mediana de 3,9 s por consulta en la evaluación smoke30 del autor; throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Resultado smoke30 | Licencia | Formato |
|---|---|---|---|---|---|
| qwen3.8-4b-empero-v9 (este) | 4,3B | No disponible | 90,0% | Apache 2.0 | GGUF Q8_0 |
| qwen35-4b-jackrong-v3 | ~4B | No disponible | 90,0% | No disponible | No disponible |
| hermes-glm52-4b-soul | ~4B | No disponible | 86,7% | No disponible | GGUF Q8_0 |
| Qwen3.8-4B (base, empero-ai) | 4,3B | No disponible | No disponible | Apache 2.0 | No disponible |

La comparativa se limita a los datos declarados por el autor en la model card; no se dispone de información independiente sobre contexto, licencia o formatos de los modelos alternativos.

## Limitaciones y advertencias

- Modelo de nicho con cero descargas y cero likes en el momento de la consulta; no ha sido validado por la comunidad.
- Los benchmarks reportados son internos del autor (smoke30 de 30 ítems), con muestra pequeña y sin replicación independiente.
- Diseñado para respuesta con recuperación documental; no es fiable para conocimiento cerrado y aumenta el riesgo de alucinación si se usa sin contexto.
- Modo thinking: si se configura `num_predict` por debajo de 300, las respuestas pueden aparecer vacías porque los tokens se consumen en `<think>`.
- Idiomas limitados a inglés y rumano; el rendimiento en castellano no está documentado.
- Longitud de contexto no especificada, lo que dificulta planificar despliegues con ventanas largas.
- Sesgos conocidos: no documentados por el autor.
- Licencia Apache 2.0 heredada del modelo base; conviene verificar las condiciones del modelo Qwen3.8-4B de empero-ai antes de uso comercial.
- Un único archivo Q8_0 publicado: no hay cuantizaciones menores para hardware con poca VRAM ni pesos en safetensors en este repositorio.
- El nombre del modelo incluye "qwen3.8", pero se trata de un ajuste de terceros, no de un modelo oficial de QwenLM; no debe confundirse con la serie Qwen3.8 original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ferry-el-kom/qwen3.8-4b-empero-base-retrain-hermes-agentic-tooluse-v9-Q8_0-gguf
- Repositorio oficial de Qwen3.8 (referencia de la serie base): https://github.com/QwenLM/Qwen3.8
- Ficha del modelo base Qwen3.8-4B en LLM Explorer: https://llm-explorer.com/model/empero-ai%2FQwen3.8-4B,3A59vMN9CCmqBUAY2z7SkJ
