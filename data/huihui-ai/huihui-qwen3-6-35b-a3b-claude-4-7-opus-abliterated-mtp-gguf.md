# huihui-ai/Huihui-Qwen3.6-35B-A3B-Claude-4.7-Opus-abliterated-MTP-GGUF

## Resumen

El modelo `huihui-ai/Huihui-Qwen3.6-35B-A3B-Claude-4.7-Opus-abliterated-MTP-GGUF` es una versión "abliterada" (sin filtros de seguridad) del modelo `lordx64/Qwen3.6-35B-A3B-Claude-4.7-Opus-Reasoning-Distilled`, que a su vez es una destilación de razonamiento de Claude 4.7 Opus sobre la arquitectura Qwen 3.6. El proceso de abliteración elimina los mecanismos de rechazo del modelo, dando como resultado un sistema que responde sin las restricciones habituales de seguridad, lo que lo hace útil para investigación en alineación y generación creativa sin censura, pero también lo hace inapropiado para uso en producción sin supervisión.

Se trata de un modelo de mezcla de expertos (MoE) con aproximadamente 35-36 mil millones de parámetros totales y unos 3 mil millones activos (según la nomenclatura A3B), con una ventana de contexto de 262.144 tokens. El formato GGUF permite su ejecución en llama.cpp y entornos compatibles, e incluye soporte para Multi-Token Prediction (MTP) como mecanismo de decodificación especulativa. El pipeline declarado es `image-text-to-text`, lo que sugiere capacidades multimodales, aunque no se detallan en la documentación disponible.

La relevancia de este modelo radica en que combina la destilación de razonamiento de un modelo propietario de alto nivel (Claude 4.7 Opus) con la apertura de Qwen 3.6, y además elimina los mecanismos de rechazo, un experimento técnico que interesa a la comunidad de investigación en seguridad y alineación de modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en Qwen 3.6, con destilacion de razonamiento de Claude 4.7 Opus y abliteracion posterior |
| Parametros totales | Aproximadamente 35-36 mil millones (35.9 B segun dev.co, 36.0 B segun llmrun.dev) |
| Parametros activos | Aproximadamente 3 mil millones (segun nomenclatura A3B) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | GGUF (se mencionan Q4_K y Q4_K_M; otras cuantizaciones no disponibles en la informacion) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors no disponible en este repositorio) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen 3.6 en su variante MoE de 35 mil millones de parámetros con 3 mil millones activos. Sobre esta base se aplicó una destilación de razonamiento (reasoning distillation) utilizando salidas de Claude 4.7 Opus, lo que busca transferir las capacidades de razonamiento paso a paso del modelo propietario al modelo abierto. Posteriormente, el equipo de huihui-ai aplicó una técnica de abliteración basada en el proyecto `remove-refusals-with-transformers`, que identifica y elimina las direcciones en el espacio de activaciones responsables de los comportamientos de rechazo, sin necesidad de usar TransformerLens.

El entrenamiento de la destilación y el proceso de abliteración no están documentados en detalle (no se especifican número de tokens, composición del dataset ni métodos de alineación como RLHF o DPO). El modelo se distribuye únicamente en formato GGUF, con soporte para Multi-Token Prediction (MTP) como mecanismo de decodificación especulativa, lo que permite acelerar la generación usando un modelo draft que predice varios tokens a la vez.

## Capacidades

- Generación de texto y razonamiento paso a paso, heredado de la destilación de Claude 4.7 Opus.
- Razonamiento multi-step y resolución de problemas complejos, típico de los modelos de la familia Qwen 3.6 con destilación de razonamiento.
- Capacidades multimodales declaradas (pipeline `image-text-to-text`), aunque no se detallan en la documentación del repositorio.
- Soporte de decodificación especulativa mediante MTP (Multi-Token Prediction), activable con `--spec-type draft-mtp` en llama.cpp.
- Generación de texto sin filtros de seguridad (abliterado), lo que permite respuestas en dominios donde los modelos estándar suelen rechazar la petición.
- No se confirma soporte de tool calling ni function calling en la información disponible.

## Casos de uso

- Investigación en alineación y seguridad de modelos: el abliterado permite estudiar cómo se comporta un modelo sin mecanismos de rechazo, lo que es útil para analizar sesgos, sobre-refusos y dinámicas de seguridad.
- Generación creativa sin restricciones: escritura de ficción, poesía o guiones que aborden temas tabú o controvertidos sin que el modelo se niegue a responder.
- Análisis de contenido sensible en entornos controlados: extracción de información de textos donde los modelos estándar aplican filtros, siempre con supervisión humana.
- Evaluación de robustez de sistemas de moderación: probar cómo responden los filtros automáticos ante salidas generadas por un modelo sin alineación.
- Desarrollo de técnicas de "unlearning" y edición de modelos: el abliterado sirve como caso de estudio para métodos que modifican el comportamiento de seguridad de un LLM.
- Experimentación con decodificación especulativa: el soporte MTP permite probar aceleraciones de inferencia en llama.cpp con un modelo MoE de 35B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo concreto.

## Requisitos de hardware

- VRAM estimada: según llmrun.dev, la cuantización Q4_K_M requiere aproximadamente 21,95 GB de VRAM para inferencia.
- GPU recomendadas: para Q4_K_M, una GPU con 24 GB de VRAM (RTX 3090, RTX 4090, A10G) es suficiente. Para cuantizaciones mayores o contexto completo de 262K tokens, se necesitarían GPUs de 48 GB o más (A6000, A100, H100).
- En consumer GPU: sí, cabe en RTX 3090/4090 con cuantización Q4_K_M y gestión de contexto parcial.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server, llama-mtmd-cli), compatible con el formato GGUF. También se puede servir mediante Ollama (existe una entrada en ollama.com para este modelo).
- Latencia y throughput: no disponibles. El uso de MTP como draft model puede reducir la latencia de generación, pero no se proporcionan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Huihui-Qwen3.6-35B-A3B-Claude-4.7-Opus-abliterated-MTP-GGUF | ~35-36B (MoE, ~3B activos) | 262.144 | Apache 2.0 | GGUF | Abliterado, destilado de Claude 4.7 Opus, MTP |
| lordx64/Qwen3.6-35B-A3B-Claude-4.7-Opus-Reasoning-Distilled | ~35-36B (MoE, ~3B activos) | 262.144 | Apache 2.0 | Safetensors (presumible) | Modelo base sin abliterar, con alineación estándar |
| Qwen3-30B-A3B (referencia de la familia Qwen3) | 30B (MoE, 3B activos) | 131.072 | Apache 2.0 | Safetensors, GGUF | Modelo oficial de Qwen, sin destilación ni abliteración |

La comparativa se basa en datos estructurales, ya que no hay benchmarks públicos para el modelo abliterado. La principal diferencia frente al base es la eliminación de los mecanismos de rechazo, y frente a Qwen3-30B-A3B, la destilación de razonamiento de Claude 4.7 Opus y el contexto ampliado a 262K tokens.

## Limitaciones y advertencias

- El modelo ha sido abliterado, lo que reduce significativamente sus filtros de seguridad. Puede generar contenido sensible, controvertido o inapropiado, incluyendo violencia, discriminación o material ilegal en algunas jurisdicciones.
- No es apto para menores, entornos públicos ni aplicaciones que requieran altos estándares de seguridad.
- El usuario es el único responsable del uso que haga del modelo y de cumplir con las leyes y normas éticas locales.
- No se recomienda su uso en producción o aplicaciones comerciales orientadas al público sin supervisión humana y moderación de contenidos.
- Riesgo de alucinación: al ser un modelo sin alineación, puede generar afirmaciones falsas con mayor confianza que un modelo alineado.
- No se dispone de información sobre sesgos específicos, pero al derivar de Qwen 3.6 y de destilación de Claude 4.7, es probable que herede sesgos de ambos.
- La licencia Apache 2.0 permite uso comercial, pero las advertencias del autor desaconsejan su uso en producción sin control.
- El formato GGUF limita el uso a entornos compatibles con llama.cpp; no se proporcionan pesos en safetensors.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/huihui-ai/Huihui-Qwen3.6-35B-A3B-Claude-4.7-Opus-abliterated-MTP-GGUF
- Modelo base (sin abliterar): https://huggingface.co/lordx64/Qwen3.6-35B-A3B-Claude-4.7-Opus-Reasoning-Distilled
- Proyecto remove-refusals-with-transformers: https://github.com/Sumandora/remove-refusals-with-transformers
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
- Entrada en Ollama: https://ollama.com/huihui_ai/Qwen3.6-abliterated:35b-Claude-4.7
- Ficha en dev.co: https://dev.co/ai/llms/huihui-qwen3-6-35b-a3b-claude-4-7-opus-abliterated
- Ficha en llmrun.dev: https://llmrun.dev/model/huihui-ai-huihui-qwen3-6-35b-a3b-claude-4-7-opus-abliterated
