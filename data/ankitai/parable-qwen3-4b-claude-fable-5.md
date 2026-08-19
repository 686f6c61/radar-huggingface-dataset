# AnkitAI/Parable-Qwen3-4B-Claude-Fable-5

## Resumen

Parable-Qwen3-4B-Claude-Fable-5 es un modelo de lenguaje de 4.000 millones de parámetros desarrollado por AnkitAI, obtenido mediante fine-tuning QLoRA sobre el modelo base Qwen/Qwen3-4B. Su objetivo principal es convertir un modelo generalista en un asistente local con "instintos de agente": planificación estructurada, selección de herramientas y razonamiento de terminal, destilados a partir de sesiones reales de agente de Claude Fable 5 y transcripciones de gpt5.5-terminal, en lugar de datos sintéticos de preguntas y respuestas.

La relevancia del modelo radica en que resuelve un problema concreto del base Qwen3-4B: en el 34 % de los prompts ordinarios, el modelo base consume todo su presupuesto de razonamiento dentro de las etiquetas `thinking` y devuelve una respuesta vacía. Parable responde en el 100 % de los casos de la suite de prueba (34/34) con un 140 veces menos de texto de razonamiento y sin necesidad de gestionar el modo thinking. Está pensado para ejecutarse localmente en portátiles y GPUs modestas, con una build GGUF de aproximadamente 2,5 GB en cuantización Q4_K_M.

El modelo se distribuye bajo licencia Apache-2.0, heredada del base Qwen3-4B, aunque los datasets de entrenamiento (Glint-Research/Fable-5-traces bajo AGPL-3.0 y Roman1111111/gpt5.5-terminal bajo MIT) introducen consideraciones adicionales para uso comercial. El autor publica un informe metodológico con DOI (10.5281/zenodo.21676407) y una build GGUF separada para Ollama y LM Studio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) |
| Parametros totales | 4.022.468.096 (~4B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (hereda del base Qwen3-4B) |
| Tipos de cuantizacion | GGUF Q4_K_M documentado; otras cuantizaciones no especificadas |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (precision completa) y GGUF (build separada) |

## Arquitectura y entrenamiento

Parable-Qwen3-4B-Claude-Fable-5 parte de la arquitectura transformer decoder-only de Qwen3-4B, un modelo denso de 4.000 millones de parámetros. El fine-tuning se realizó con QLoRA en configuración nf4, con rango r=16 y alpha=32, aplicado a todos los targets lineales. Se usó enmascaramiento de pérdida solo sobre completions (completion-only loss masking) y una mezcla de replay del 30 % con instrucciones generales para mitigar el olvido catastrófico. Los pesos se promediaron entre semillas (seed-averaged) y se fusionaron con una escala de 0,6 en la versión v2.1, recalibrada en agosto de 2026 para mejorar la mezcla de pesos.

Los datos de entrenamiento provienen de dos fuentes: Glint-Research/Fable-5-traces (sesiones reales de agente de Claude Fable 5, licencia AGPL-3.0) y Roman1111111/gpt5.5-terminal (transcripciones de terminal, licencia MIT). Ambos datasets fueron deduplicados y decontaminados frente a los benchmarks reportados. El entrenamiento se centra en trazas de agente multi-paso, de modo que el modelo aprende a estructurar planes, selección de herramientas y flujos de terminal de forma natural, en lugar de improvisarlos.

## Capacidades

- Generación de texto con respuestas estructuradas y razonamiento multi-paso para tareas de agente.
- Razonamiento de agente: planificación, selección de herramientas y flujos de terminal aprendidos de sesiones reales.
- Soporte de tool calling / function calling, evaluado con BFCL (simple_python y multiple).
- Generación de código, con rendimiento medido en HumanEval-164.
- Ejecución local offline: compatible con Ollama y LM Studio mediante la build GGUF.
- No requiere gestionar el modo thinking: responde directamente en prompts ordinarios, a diferencia del base Qwen3-4B.
- Capacidades multilingües no documentadas en la model card (heredadas del base, sin confirmar).

## Casos de uso

- Asistente de programación local en entornos sin conexión: el modelo genera código y razona sobre flujos de terminal sin enviar datos a servidores externos, adecuado para equipos con políticas de privacidad estrictas gracias a su tamaño de 4B y build GGUF de 2,5 GB.
- Automatización de tareas de terminal: gracias a su entrenamiento con transcripciones gpt5.5-terminal, puede sugerir comandos, explicar pipelines y estructurar secuencias de shell para administración de sistemas.
- Agente de tool calling en pipelines de CI/CD: soporta function calling (BFCL simple_python 92,3) y puede integrarse en flujos automatizados donde se requiera selección de herramientas con baja latencia en hardware local.
- Prototipado de agentes conversacionales: su comportamiento de respuesta garantizada (34/34 prompts) lo hace fiable para chatbots que no pueden permitirse respuestas vacías por agotamiento del presupuesto de razonamiento.
- Desarrollo de asistentes de código con planificación estructurada: el modelo produce planes y pasos de ejecución organizados, útil para herramientas de autocompletado o generación de scripts en entornos de desarrollo integrado.
- Investigación en fine-tuning de modelos pequeños bajo cómputo restringido: el informe metodológico con DOI documenta el proceso de destilación de trazas de agente, sirviendo como referencia reproducible para otros proyectos.

## Benchmarks y rendimiento

Los resultados publicados en la model card comparan Parable v2.1 con el base Qwen3-4B, medidos con harnesses idénticos, decodificación greedy, builds Q4_K_M y thinking desactivado en todas las filas:

| Benchmark | Base Qwen3-4B | Parable v2.1 |
|---|---|---|
| Prompts respondidos (suite de 34) | 27/34 | 34/34 |
| HumanEval-164 | 79,3 | 74,4 |
| Pérdida en trazas de agente held-out | 2,846 | 1,876 |
| BFCL simple_python | 95,3 | 92,3 |
| BFCL multiple | 94,5 | 90,0 |

Además, la versión v2.1 mejora en +1,8 puntos HumanEval-164 respecto a la v1 (74,4 frente a 72,6), reproducido en tres adaptadores independientes. El modelo base supera a Parable en HumanEval y BFCL, pero Parable gana en cobertura de respuestas y en ajuste a la distribución de sesiones de agente. No se han publicado resultados frente a otros modelos de la misma categoría.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3 GB con la build GGUF Q4_K_M; alrededor de 8-9 GB para los pesos safetensors en fp16.
- GPU recomendadas: tarjetas consumer con 4-6 GB de VRAM (por ejemplo, RTX 3050, RTX 3060, GTX 1660 Super) para la build GGUF; GPUs con 8-12 GB (RTX 3080, RTX 4070) para precisión completa.
- Compatible con portátiles y equipos de escritorio modestos sin GPU dedicada mediante cuantización GGUF y CPU.
- Opciones de despliegue: Ollama, LM Studio, transformers con device_map="auto", y servidores compatibles con text-generation-inference (según tags del repositorio).
- Latencia y throughput: no se han publicado cifras concretas; la model card indica que el GGUF Q4_K_M ocupa 2,5 GB, lo que sugiere inferencia fluida en hardware consumer, aunque sin datos numéricos verificables.

## Comparativa con modelos similares

La información disponible solo permite comparar con el base Qwen3-4B, ya que no se publican datos frente a otros modelos de 4B. La comparativa se resume en la tabla de benchmarks anterior. Como alternativas de la misma categoría se podrían considerar Llama-3.2-3B o Phi-3.5-mini, pero no hay datos comparativos publicados en la model card; por tanto, la comparativa con esos modelos no está disponible.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3-4B (base) | 4B | no disponible | Apache-2.0 | Mejor en HumanEval y BFCL, pero falla en responder el 21 % de prompts ordinarios |
| Parable-Qwen3-4B-Claude-Fable-5 | 4B | no disponible | Apache-2.0 | Responde 34/34, mejor pérdida en trazas de agente, peor en benchmarks de código y tool calling |

## Limitaciones y advertencias

- Rendimiento inferior al base en benchmarks de código y tool calling: HumanEval-164 es 4,9 puntos menor (74,4 frente a 79,3) y BFCL simple_python es 3 puntos menor (92,3 frente a 95,3); no es adecuado para escenarios donde la máxima precisión en function calling sea crítica.
- Riesgo de alucinación: no se documentan evaluaciones específicas de factualidad; como modelo fine-tuned sobre trazas de agente, puede inventar comandos o pasos de terminal si no se valida su salida.
- Consideraciones de licencia para uso comercial: aunque el modelo es Apache-2.0, los datasets de entrenamiento incluyen trazas de asistentes de terceros (AGPL-3.0 y MIT), y los términos de los proveedores originales pueden aplicarse a entrenamiento o destilación posterior; el autor recomienda confirmar el cumplimiento antes de uso comercial.
- Sesgos conocidos: no documentados en la model card; al derivar de Qwen3-4B, puede heredar sesgos del modelo base, pero no hay evaluaciones específicas.
- Longitud de contexto no verificada: no se especifica la ventana de contexto real tras el fine-tuning; se asume la del base sin confirmación.
- Riesgo de sobreajuste a la distribución de agentes: el modelo está optimizado para sesiones de agente y puede degradarse en tareas generales de razonamiento o generación de texto libre no relacionadas con código o terminal.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AnkitAI/Parable-Qwen3-4B-Claude-Fable-5
- Build GGUF: https://huggingface.co/AnkitAI/Parable-Qwen3-4B-Claude-Fable-5-GGUF
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Dataset Glint-Research/Fable-5-traces: https://huggingface.co/datasets/Glint-Research/Fable-5-traces
- Dataset Roman1111111/gpt5.5-terminal: https://huggingface.co/datasets/Roman1111111/gpt5.5-terminal
- Informe metodologico (DOI): https://doi.org/10.5281/zenodo.21676407
