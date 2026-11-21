# Joakimpalm-Zen/gpt-oss-20b-keep30-MXFP4-GGUF

## Resumen

gpt-oss-20b-keep30-MXFP4-GGUF es un derivado estructural del modelo openai/gpt-oss-20b, publicado por el autor independiente Joakimpalm-Zen dentro de su proyecto de investigación Xyntetik sobre poda y cuantización. El modelo conserva 30 de los 32 expertos por capa del MoE original (elimina 2 expertos por capa) manteniendo los pesos de los supervivientes en formato MXFP4, y se distribuye únicamente como GGUF para su uso con motores de inferencia locales. Con 19.719.810.576 parámetros totales y un repositorio de 11,5 GB, se posiciona como una variante algo más ligera del modelo base de OpenAI.

La relevancia de esta ficha no está en su calidad —el propio autor la describe como un «artefacto de investigación, no un lanzamiento de propósito general»— sino en su valor documental: es el primer derivado estructuralmente podado que el proyecto publicó y se conserva como «near-miss» con las métricas de fidelidad a la vista tras una remedición. El autor indica explícitamente que el modelo no supera el listón de fidelidad frente a su modelo padre, por lo que debe tratarse como un primo más pequeño del original, no como un equivalente funcional.

El modelo está pensado para servirse con xyntetik-runner, un motor de inferencia en C11 sin dependencias con servidor compatible con OpenAI, cuya característica diferencial es la recuperación de truncamiento forzado en tool calls. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) derivada de gpt-oss-20b, con poda de expertos (30 de 32 por capa) |
| Parámetros totales | 19.719.810.576 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | MXFP4 (pesos de los expertos supervivientes sin recuantizar); GGUF |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero `gpt-oss-20b-keep30-MXFP4.gguf`) |

## Arquitectura y entrenamiento

El modelo parte de openai/gpt-oss-20b, un transformer con arquitectura de mezcla de expertos (MoE). La modificación aplicada es una poda estructural a nivel de experto: se conservan 30 de los 32 expertos de cada capa y se descartan los 2 restantes, sin recuantizar los pesos de los expertos que sobreviven, que permanecen en MXFP4. No se ha realizado un reentrenamiento posterior a la poda; se trata de una transformación directa del checkpoint del modelo base.

El autor documenta el método en la propia model card y en el dataset de evidencia del proyecto (informe de frontera de poda sobre un tercer checkpoint, Nemotron). No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO, ya que el modelo hereda el entrenamiento del padre y no se ha reentrenado. La innovación técnica destacable no está en el modelo sino en el ecosistema que lo acompaña: el motor xyntetik-runner implementa decodificación restringida que mantiene la forma de las tool calls bajo cuantización y recuperación de truncamiento forzado, cerrando un documento JSON a la terminación legal más pequeña cuando se agota el presupuesto de tokens.

## Capacidades

- Generación de texto conversacional y respuesta a instrucciones, heredadas del modelo base gpt-oss-20b.
- Soporte de tool calling / function calling mediante el protocolo Harmony, nativo en el modelo base y en el runner recomendado.
- Compatibilidad con decodificación restringida por esquema: el runner garantiza la conformidad de forma de la tool call hasta Q4_0 (conformidad de esquema y selección de herramienta al 100% en la escalera de cuantización medida; la coincidencia de argumentos decae al 50%).
- Recuperación de truncamiento forzado en tool calls cuando se sirve con xyntetik-runner: devuelve argumentos parseables aunque se agote el presupuesto.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo de razonamiento (thinking), visión o audio: no disponibles en la información proporcionada.
- Compatibilidad con cualquier release de Runner (protocolo Harmony nativo).

## Casos de uso

- Investigación sobre poda de expertos en MoE: el modelo sirve como punto de referencia reproducible para estudiar el impacto de eliminar 2 de 32 expertos por capa sobre la fidelidad respecto al padre, con métricas de KLD y top-1 publicadas.
- Evaluación de motores de inferencia locales: permite comparar el comportamiento de xyntetik-runner frente a vLLM, llama.cpp, Ollama, TensorRT-LLM y SGLang en escenarios de truncamiento de tool calls, usando un modelo de ~20B como carga de trabajo realista.
- Pruebas de agentes con presupuesto de tokens ajustado: el runner cierra las tool calls truncadas a un documento legal, lo que permite validar bucles de agente que terminan en lugar de reintentar desde cero cuando el contexto es escaso.
- Docencia y divulgación sobre cuantización MXFP4 y formatos GGUF: el repositorio de 11,5 GB y la documentación de la escalera de cuantización facilitan demostraciones prácticas en hardware de gama alta de consumo.
- Validación de pipelines de decodificación restringida: útil para verificar que la conformidad de esquema se mantiene a través de cuantizaciones sucesivas antes de desplegar un modelo mayor en producción.
- Benchmarking de fidelidad estructural: las tablas de KLD y top-1 cualificado por margen permiten calibrar umbrales de aceptación para futuros derivados podados del mismo proyecto.

## Benchmarks y rendimiento

| Métrica | Resultado | Umbral del autor |
|---|---|---|
| KLD medio (43.209 posiciones puntuadas, split held-out descontaminado, remedición 2026-08-28) | 0,07629 | 0,05 |
| Top-1 cualificado por margen | 96,37% | 97% |

El autor indica que el artefacto no supera el listón de calidad actual y falla ambos términos. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 11,5 GB en MXFP4/GGUF, por lo que se necesita al menos ese espacio en memoria o VRAM para cargar los pesos, más overhead de contexto y caché KV.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, cabe en GPUs de 16 GB o más en MXFP4; para contexto largo se recomienda 24 GB o superior.
- Cabe en GPU de consumo: sí, en modelos con 16 GB o más de VRAM (por ejemplo, RTX 4080/4090 o superiores), asumiendo que el contexto quepa en el espacio restante.
- Opciones de despliegue: xyntetik-runner (recomendado por el autor, binario único C11 con CPU/CUDA/Metal y servidor compatible con OpenAI); también es un GGUF estándar, por lo que debería poder cargarse en llama.cpp u Ollama, aunque el autor solo valida el runner.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| gpt-oss-20b-keep30-MXFP4 (este) | 19.719.810.576 | no disponible | Apache 2.0 | GGUF (MXFP4) | 30/32 expertos por capa; falla umbral de fidelidad |
| openai/gpt-oss-20b (padre) | no disponible | no disponible | Apache 2.0 | safetensors y otros | Modelo de referencia; 32/32 expertos |
| Nemotron-3.5-Lightning-30B-A3B (usado como evidencia de poda) | no disponible | no disponible | no disponible | no disponible | Tercer checkpoint del estudio de frontera de poda |

No se dispone de datos suficientes para comparar rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- El propio autor declara que el modelo no supera el listón de fidelidad actual: KLD 0,07629 frente a un límite de 0,05 y top-1 cualificado por margen del 96,37% frente a un límite del 97%.
- No es un lanzamiento de propósito general: debe tratarse como un primo más pequeño del padre, no como un equivalente.
- Al ser una poda sin reentrenamiento, es esperable una degradación de calidad respecto al modelo base, especialmente en tareas que dependían de los expertos eliminados.
- Riesgo de alucinación: no cuantificado en la información disponible; se hereda el del modelo base y probablemente se incrementa por la poda.
- Sesgos conocidos: no documentados en la información proporcionada; se heredan los del modelo base de OpenAI.
- Idiomas soportados: no disponibles; no se ha verificado el rendimiento multilingüe tras la poda.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor desaconseja su uso en producción por la falta de fidelidad.
- El soporte está validado únicamente con xyntetik-runner; otros motores pueden presentar comportamiento distinto en tool calling y truncamiento.
- La fecha de creación del repositorio (2026-08-05) y la de actualización (2026-10-27) son posteriores a la remedición del 2026-08-28, lo que sugiere que el autor mantiene el artefacto publicado de forma deliberada como evidencia negativa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Joakimpalm-Zen/gpt-oss-20b-keep30-MXFP4-GGUF
- Modelo base: https://huggingface.co/openai/gpt-oss-20b
- Colección del experimento (Pruning and Quantization Frontiers): https://huggingface.co/collections/Joakimpalm-Zen/xyntetik-research-pruning-and-quantization-frontiers-6aa98badc3307048c060ebe2
- Dataset de evidencia (frontera de poda Nemotron): https://huggingface.co/datasets/Joakimpalm-Zen/Nemotron-3.5-Lightning-30B-A3B-prune-frontier-report
- Repositorio del runner: https://github.com/Joakimpalm-Zen/xyntetik-runner
- Fila de validación en el roster de soporte: https://github.com/Joakimpalm-Zen/xyntetik-runner/blob/main/docs/model-support.md#gpt-oss-20b-keep30-mxfp4
- Documentación de conversión y poda: https://github.com/Joakimpalm-Zen/xyntetik-runner#models-and-conversion
- Benchmark de truncamiento: https://github.com/Joakimpalm-Zen/xyntetik-runner/blob/main/docs/truncation-benchmark.md
- Resultados de la comunidad: https://github.com/Joakimpalm-Zen/xyntetik-runner/blob/main/docs/community-results.md
- Formulario de solicitud de modelos: https://github.com/Joakimpalm-Zen/xyntetik-runner/issues/new?template=model_request.yml
- Formulario de reporte de resultados: https://github.com/Joakimpalm-Zen/xyntetik-runner/issues/new?template=result_report.yml
- Perfil del autor en Hugging Face: https://huggingface.co/Joakimpalm-Zen
