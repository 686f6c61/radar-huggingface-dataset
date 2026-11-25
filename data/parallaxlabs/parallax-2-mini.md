# parallaxlabs/parallax-2-mini

## Resumen

Parallax 2 Mini es un modelo de lenguaje de aproximadamente 4.326 millones de parámetros (4.326.350.848 exactamente) desarrollado por Parallax Labs, construido sobre el modelo base Qwen/Qwen3.5-4B. Se presenta como el modelo más rápido y ligero de la familia Parallax, orientado a tareas cotidianas simples que requieren razonamiento de calidad, alta velocidad y precisión a pequeña escala. La model card lo describe explícitamente como una prueba de concepto (proof-of-concept preview) de los próximos modelos de la compañía.

La arquitectura es híbrida: combina capas de recurrencia lineal Gated DeltaNet con mecanismos de atención tradicionales, lo que mantiene el consumo de memoria del KV-cache plano a lo largo de contextos largos. Esto habilita servir con alta concurrencia y con poca VRAM, además de permitir cuantización del propio KV-cache. El modelo integra un modo de razonamiento (thinking) activable y desactivable, y soporte nativo de tool calling.

Su relevancia actual radica en el equilibrio entre tamaño reducido (cabe en GPUs de consumo con cuantizaciones de 2,32 GB a 4,61 GB), velocidad superior a 90 tokens por segundo en una RTX 5070 según el autor, y capacidades de razonamiento y ejecución de herramientas que habitualmente se asocian a modelos de mayor tamaño. La licencia Apache 2.0 facilita su adopción comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con capas Gated DeltaNet (recurrencia lineal) y atención |
| Parametros totales | 4.326.350.848 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: Q3_K_M, Q4_K_M, Q6_K, Q8_0 (y pesos safetensors en el repo) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

Parallax 2 Mini emplea una arquitectura híbrida que combina capas de recurrencia lineal Gated DeltaNet con capas de atención convencional. Las capas de recurrencia lineal mantienen el uso de memoria del KV-cache constante a lo largo de contextos largos, lo que reduce el coste de servir muchas peticiones concurrentes y permite cuantizar el KV-cache con poca penalización de VRAM. El modelo deriva del base Qwen/Qwen3.5-4B, según los metadatos del repositorio.

No se han publicado en la información disponible datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF, DPO u otros ajustes de alineamiento. Tampoco se detalla la innovación de decodificación especulativa ni otros detalles de entrenamiento. La model card sí destaca el modo de razonamiento conmutable y el soporte nativo de tool calling como capacidades integradas en el modelo.

## Capacidades

- Generación de texto conversacional y seguimiento de instrucciones.
- Razonamiento multi-paso con modo thinking activable y desactivable.
- Trazado de ejecución de código (code execution tracing), evaluado en CRUXEval.
- Matemáticas y lógica de varios pasos cuando el razonamiento está activado.
- Tool calling / function calling nativo, incluyendo búsqueda web e interacción con el sistema de ficheros según la model card.
- Soporte de agentes y razonamiento multi-paso encadenado mediante herramientas.
- Capacidades multilingües limitadas al inglés según los metadatos de idioma.
- Despliegue en endpoints compatibles (tag `endpoints_compatible`).

## Casos de uso

- Chat de baja latencia: con el modo thinking desactivado, el modelo responde de forma instantánea, adecuado para asistentes conversacionales y enrutadores de intenciones donde la velocidad prima sobre el razonamiento profundo.
- Razonamiento matemático de nivel medio: con thinking activado, el modelo obtiene 83,42% en MMLU-Pro Math (0-shot), lo que lo hace útil para resolución de problemas cuantitativos en entornos educativos o de análisis financiero básico.
- Trazado de ejecución de código: con 59,25% Pass@1 y 82,75% Pass@10 en CRUXEval Output, puede emplearse para depurar y predecir salidas de fragmentos de código en pipelines de revisión automatizada.
- Agentes con herramientas: el tool calling nativo permite construir agentes que consulten APIs, busquen en la web o manipulen ficheros, con el modelo actuando como planificador y ejecutor de llamadas.
- Despliegue en hardware de consumo: con cuantización Q4_K_M (2,78 GB) cabe en GPUs de gama media y permite servir asistentes locales en portátiles o estaciones de trabajo sin GPU dedicada de datacenter.
- Servicio de alta concurrencia: gracias al KV-cache plano de las capas Gated DeltaNet, es viable atender muchas sesiones simultáneas en una sola GPU con VRAM limitada, por ejemplo en un servicio interno de clasificación y generación de respuestas.
- Prototipado rápido de aplicaciones de razonamiento: al ser un preview de la familia Parallax, sirve para validar pipelines de razonamiento y tool use antes de migrar a modelos mayores de la misma casa.

## Benchmarks y rendimiento

Evaluado localmente con `lm_eval` v0.4.13 sobre `parallax-2-mini.Q8_0.gguf`, con razonamiento activado (temperature=0.6, top_p=0.95, 0-shot). El autor advierte que los resultados de MMLU-Pro están sujetos a cambios por un recálculo de 4.042 preguntas debido a errores de calibración.

| Benchmark | Categoria | Metrica | Resultado |
|---|---|---|---|
| CRUXEval Output (800 tareas) | Trazado de ejecución de código | Pass@1 / Pass@10 | 59,25% / 82,75% |
| MMLU-Pro (Overall, 12.032 preguntas) | Conocimiento general y STEM | Exact Match 0-shot | 58,88% (pendiente de recálculo) |
| MMLU-Pro Math (1.351) | Matemáticas | Exact Match 0-shot | 83,42% |
| MMLU-Pro Business (789) | Negocios y finanzas | Exact Match 0-shot | 72,75% |
| MMLU-Pro Biology (717) | Biología | Exact Match 0-shot | 65,97% |
| MMLU-Pro Chemistry (1.132) | Química | Exact Match 0-shot | 80,04% |
| MMLU-Pro Economics (844) | Economía | Exact Match 0-shot | 58,18% |
| MMLU-Pro Physics (1.299) | Física | Exact Match 0-shot | 54,43% |
| MMLU-Pro Psychology (798) | Psicología | Exact Match 0-shot | 48,87% |
| MMLU-Pro Computer Science (410) | Informática | Exact Match 0-shot | 59,76% |
| MMLU-Pro Health (818) | Salud | Exact Match 0-shot | 45,23% |
| MMLU-Pro Other (924) | General / otros | Exact Match 0-shot | 42,86% |
| MMLU-Pro Philosophy (499) | Filosofía | Exact Match 0-shot | 38,88% |
| MMLU-Pro Engineering (969) | Ingeniería | Exact Match 0-shot | 59,24% |
| MMLU-Pro History (381) | Historia | Exact Match 0-shot | 29,66% |
| MMLU-Pro Law (1.101) | Derecho | Exact Match 0-shot | 22,16% (en recálculo) |

No se han publicado resultados de MMLU estándar, HumanEval ni GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 2,32 GB con Q3_K_M; 2,78 GB con Q4_K_M; 3,56 GB con Q6_K; 4,61 GB con Q8_0. Los pesos safetensors completos ocupan 13,3 GB de repositorio.
- GPU recomendadas: el autor cita pruebas en una NVIDIA RTX 5070 con velocidades superiores a 90 tokens por segundo. Cabe en GPUs de consumo como RTX 3060, RTX 4060, RTX 4070 y superiores con las cuantizaciones GGUF.
- Cabe en GPU de consumo: sí, con Q3_K_M y Q4_K_M en GPUs con 4 GB o más de VRAM; Q8_0 requiere al menos 6 GB.
- Opciones de despliegue: llama.cpp y Ollama para GGUF; transformers para safetensors; vLLM y TGI no están confirmados en la información disponible, aunque el tag `endpoints_compatible` sugiere compatibilidad con endpoints estándar.
- Latencia y throughput: más de 90 tokens por segundo en RTX 5070 según el autor; no se dispone de cifras para otras GPUs.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada, por lo que la comparación se limita a características estructurales.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Parallax 2 Mini | 4.326 M | no disponible | Apache 2.0 | Hugging Face (safetensors + GGUF) |
| Qwen/Qwen3.5-4B (base) | ~4.000 M | no disponible | no disponible | Hugging Face |
| Alternativas de ~4B con tool calling | no disponible | no disponible | no disponible | no disponible |

El modelo base Qwen/Qwen3.5-4B es la referencia directa, ya que Parallax 2 Mini se construye sobre él y añade la arquitectura híbrida Gated DeltaNet, el modo de razonamiento conmutable y el tool calling nativo. No se han publicado comparaciones de rendimiento frente a otros modelos de tamaño similar en la información disponible.

## Limitaciones y advertencias

- El modelo solo declara soporte de inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Los resultados de MMLU-Pro están sujetos a recálculo por errores de calibración, por lo que las cifras actuales pueden variar.
- La puntuación en MMLU-Pro Law (22,16%) y History (29,66%) es notablemente baja, lo que indica debilidades en dominios jurídicos e históricos.
- Riesgo de alucinación inherente a modelos de 4B; no se han publicado evaluaciones específicas de factualidad.
- No se han publicado datos sobre sesgos conocidos ni sobre el dataset de entrenamiento, lo que dificulta evaluar riesgos de alineamiento.
- Es un proof-of-concept preview; el autor no garantiza estabilidad de API ni continuidad de la familia.
- La licencia Apache 2.0 permite uso comercial, pero al derivar de Qwen3.5-4B conviene verificar las condiciones del modelo base.
- No se ha publicado la longitud de contexto soportada, lo que limita la planificación de despliegues con ventanas largas.

## Enlaces

- Hugging Face: https://huggingface.co/parallaxlabs/parallax-2-mini
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
