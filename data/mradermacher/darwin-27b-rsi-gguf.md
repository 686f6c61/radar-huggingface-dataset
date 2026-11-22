# mradermacher/Darwin-27B-RSI-GGUF

## Resumen

Darwin-27B-RSI es un modelo de lenguaje de 27.000 millones de parámetros desarrollado por FINAL-Bench, publicado originalmente en Hugging Face bajo licencia Apache 2.0. La versión aquí descrita es la cuantización estática en formato GGUF realizada por mradermacher, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y derivados. El modelo se presenta como un sistema de razonamiento con "recursive self-improvement" (RSI) a nivel de modelo, entrenado sin etiquetas humanas (label-free) y orientado a tareas de razonamiento complejo como GPQA y SuperGPQA.

La arquitectura subyacente se etiqueta como qwen3.5 en la model card, lo que sugiere una base derivada de la familia Qwen, con capacidades de "thinking" y cadena de pensamiento explícita. El modelo incorpora conceptos propios del autor como "decision-index", "typed-decisions", "jev" y "system-2", que apuntan a un enfoque de razonamiento estructurado y deliberado frente a respuestas impulsivas. Los idiomas declarados son inglés, coreano y multilingüe.

La relevancia actual del modelo radica en su propuesta de auto-mejora recursiva sin supervisión humana y en la disponibilidad de cuantizaciones GGUF que lo hacen desplegable en estaciones de trabajo con GPU de consumo. No obstante, la información pública disponible es limitada: no se han publicado resultados de benchmarks en la información proporcionada, y la model card original del autor no está incluida en los datos de esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (base qwen3.5 según etiquetas de la model card) |
| Parámetros totales | 26.895.998.464 (26,9 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, F16 |
| Idiomas soportados | en, ko, multilingual |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

La información disponible indica que Darwin-27B-RSI es un transformer de 26,9 mil millones de parámetros con capacidades de razonamiento explícito ("thinking", "chain-of-thought", "system-2"). Las etiquetas de la model card lo vinculan a la arquitectura qwen3.5, aunque no se detalla la configuración exacta de capas, atención ni dimensiones ocultas. Tampoco se especifica si emplea atención lineal, decodificación especulativa u otras optimizaciones de inferencia.

El entrenamiento se describe mediante etiquetas como "no-human-labels", "label-free" y "recursive-self-improvement" / "model-level-rsi", lo que sugiere un proceso de auto-mejora recursiva sin supervisión humana directa. Se mencionan además conceptos como "decision-index", "typed-decisions" y "jev", que no se desarrollan en la información proporcionada. No se dispone del número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Esta ficha no puede confirmar detalles técnicos del proceso de entrenamiento más allá de lo indicado en las etiquetas.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento explícito con modo "thinking" y cadena de pensamiento.
- Razonamiento científico y de dominio experto, orientado a benchmarks tipo GPQA y SuperGPQA.
- Auto-mejora recursiva a nivel de modelo (RSI) según la propuesta del autor.
- Razonamiento estructurado mediante "typed-decisions" y "decision-index" (sin documentación pública disponible).
- Capacidades multilingües declaradas: inglés, coreano y multilingüe.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles en la información proporcionada.

## Casos de uso

- Razonamiento científico asistido: el modelo está orientado explícitamente a benchmarks de preguntas científicas de nivel experto (GPQA, SuperGPQA), por lo que puede emplearse como asistente de revisión de hipótesis y resolución de problemas de física, química o biología en entornos de investigación.
- Análisis deliberado con cadena de pensamiento: su modo "thinking" y enfoque "system-2" lo hacen adecuado para tareas que requieren descomposición explícita de problemas, como auditoría de argumentos o verificación de cálculos paso a paso.
- Despliegue en estaciones de trabajo con GPU de consumo: las cuantizaciones Q4_K_M (16,6 GB) y Q5_K_M (19,3 GB) permiten ejecutarlo en GPUs de 24 GB de VRAM mediante llama.cpp u Ollama, útil para prototipado local sin depender de la nube.
- Experimentación en auto-mejora de modelos: investigadores interesados en RSI y entrenamiento label-free pueden usar el modelo como base para reproducir o extender los experimentos del autor.
- Asistencia multilingüe inglés-coreano: para equipos que trabajan con documentación o conversación en coreano e inglés, el modelo declara soporte para ambos idiomas.
- Evaluación comparativa de razonamiento: dado su enfoque en benchmarks de razonamiento experto, puede integrarse en pipelines de evaluación interna para comparar estrategias de prompting deliberativo frente a modelos estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización):
  - Q2_K: ~10,8 GB
  - Q3_K_M: ~13,4 GB
  - IQ4_XS: ~15,3 GB
  - Q4_K_M: ~16,6 GB
  - Q5_K_M: ~19,3 GB
  - Q6_K: ~22,2 GB
  - Q8_0: ~28,7 GB
  - F16: ~53,8 GB (estimado a partir de los 26,9 B de parámetros)
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; A100 40 GB o H100 para Q8_0 y F16; GPUs de 16 GB (RTX 4080, 4060 Ti 16 GB) solo con Q2_K o Q3_K_S.
- Cabe en GPU de consumo: sí, con cuantizaciones Q4_K_M o inferiores en GPUs de 24 GB; Q6_K y Q8_0 requieren 24 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. También existe una variante con cuantizaciones ponderadas/imatrix en mradermacher/Darwin-27B-RSI-i1-GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Darwin-27B-RSI (este) | 26,9 B | no disponible | Apache 2.0 | GGUF, safetensors | RSI label-free, razonamiento tipo system-2 |
| Qwen2.5-32B-Instruct | 32,5 B | 128K (según documentación pública de Qwen) | Apache 2.0 | safetensors, GGUF | Base probable de la familia; contexto largo documentado |
| Gemma-2-27B-it | 27 B | 8K | Gemma license | safetensors, GGUF | Tamaño comparable; licencia más restrictiva |
| Mistral-Small-24B-Instruct | 24 B | 32K | Apache 2.0 | safetensors, GGUF | Alternativa europea de tamaño similar |

La comparación con Qwen2.5-32B-Instruct se ofrece como referencia de la familia declarada en las etiquetas; no se dispone de datos que confirmen la relación exacta con qwen3.5. No hay benchmarks publicados de Darwin-27B-RSI que permitan comparar rendimiento de forma cuantitativa.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks en la información disponible, por lo que el rendimiento real no puede verificarse de forma independiente.
- La model card original del autor no está incluida en los datos proporcionados; detalles clave (contexto, entrenamiento, evaluación) no están documentados aquí.
- Riesgo de alucinación inherente a los modelos generativos; el modo "thinking" no garantiza corrección factual.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Limitaciones de contexto e idioma: el contexto máximo no está especificado; los idiomas declarados son inglés, coreano y multilingüe, sin detalle de cobertura.
- Licencia Apache 2.0 permite uso comercial, pero las cuantizaciones GGUF son obra de un tercero (mradermacher); conviene verificar los términos del modelo base en FINAL-Bench/Darwin-27B-RSI.
- Las etiquetas "recursive-self-improvement" y "model-level-rsi" son afirmaciones del autor sin validación independiente en la información disponible; deben tratarse con cautela en producción.
- El tamaño del repositorio (186,3 GB) refleja el conjunto completo de cuantizaciones; descargar solo el archivo GGUF necesario.

## Enlaces

- Cuantización GGUF: https://huggingface.co/mradermacher/Darwin-27B-RSI-GGUF
- Cuantizaciones imatrix/ponderadas: https://huggingface.co/mradermacher/Darwin-27B-RSI-i1-GGUF
- Modelo base: https://huggingface.co/FINAL-Bench/Darwin-27B-RSI
- Página de descargas del cuantizador: https://hf.tst.eu/model#Darwin-27B-RSI-GGUF
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre calidad de cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
