# MuXodious/gemma-4-12B-it-SOMPOA-heresy

## Resumen
MuXodious/gemma-4-12B-it-SOMPOA-heresy es un ajuste fino del modelo google/gemma-4-12B-it publicado por el usuario MuXodious. Se trata de una variante "decensored" (también etiquetada como heretic, uncensored y abliterated) generada con la herramienta Heretic v2.2.0.dev0, cuyo objetivo es reducir la tasa de rechazos del modelo base ante peticiones que el modelo original declinaría. El modelo conserva la arquitectura y el pipeline multimodal (any-to-any, image-text-to-text) del Gemma 4 12B original.

El modelo tiene 11.959.730.176 parámetros (aproximadamente 12 mil millones) y se distribuye en formato safetensors bajo licencia Apache 2.0, con un tamaño de repositorio de 24 GB. La modificación se aplica mediante la técnica SOMPOA, que ajusta direcciones en las capas de atención (attn.o_proj) y en las capas MLP (mlp.down_proj) para reducir la probabilidad de respuestas de rechazo, manteniendo una divergencia KL baja respecto al modelo base.

Es relevante para quienes necesitan un modelo multimodal de 12B con menor sesgo de rechazo para tareas de generación creativa, investigación sobre alineación o evaluación de robustez, aunque su uso en producción conlleva riesgos importantes de contenido no filtrado y de degradación de capacidades por el proceso de abliteración.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (gemma4_unified, any-to-any) |
| Parametros totales | 11.959.730.176 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizaciones GGUF no publicadas por el autor) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo parte de google/gemma-4-12B-it, un transformer multimodal con pipeline any-to-any (entrada y salida de texto e imagen) identificado en los tags como gemma4_unified. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base, más allá de lo que publique Google en su model card original.

La modificación se realizó con Heretic v2.2.0.dev0 aplicando la técnica SOMPOA, que opera sobre direcciones de activación en las capas attn.o_proj y mlp.down_proj. La model card documenta parámetros concretos como direction_index = 26.71, max_weight_position = 35.36 para attn.o_proj y 27.34 para mlp.down_proj, junto con pesos por capa (por ejemplo, attn.o_proj.max_weights.2 = 1.76, mlp.down_proj.max_weights.5 = 1.57). El autor reporta una búsqueda de 379 ensayos con métricas de rechazos sobre 101 prompts y divergencia KL; el trial 180 seleccionado presenta 11/101 rechazos con KL de 0.0639, mientras que el trial 36 alcanza 2/101 rechazos con KL de 0.5736. No se especifica el número de pasos de entrenamiento ni el hardware utilizado.

## Capacidades
- Generación de texto y razonamiento conversacional multi-turno, heredados del modelo base Gemma 4 12B IT.
- Procesamiento de imagen y texto (image-text-to-text) y pipeline any-to-any, según los tags del repositorio.
- Respuesta a peticiones que el modelo base rechazaría, con una tasa de rechazo reportada de 11/101 en el trial seleccionado.
- Capacidad de razonamiento con posibles "deslices" ocasionales de política o directrices, según indica el propio autor.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible en la información proporcionada (el pipeline any-to-any sugiere multimodalidad, pero no se detalla).

## Casos de uso
- Investigación sobre alineación y abliteración: el modelo sirve como caso de estudio para medir cómo la técnica SOMPOA altera la tasa de rechazo y la divergencia KL respecto al base, usando los datos de los 379 ensayos publicados.
- Generación creativa sin filtros: escritura de ficción, guiones o narrativa que aborde temas sensibles y que el modelo base declinaría, con la advertencia de revisión humana obligatoria.
- Evaluación de robustez de sistemas de moderación: emplear el modelo como generador adversario para probar clasificadores de contenido y pipelines de seguridad antes de desplegarlos.
- Pruebas de regresión de pipelines multimodales: al conservar el pipeline image-text-to-text, permite validar integraciones de visión-lenguaje en entornos controlados donde se requiere menor tasa de rechazo.
- Benchmarking comparativo de variantes decensored: comparar el trial 180 (11/101 rechazos, KL 0.0639) frente a otros trials como el 36 (2/101, KL 0.5736) para estudiar el compromiso entre supresión de rechazos y degradación del modelo.
- Experimentación académica con modelos de 12B en GPUs de gama alta: su tamaño permite inferencia en una sola GPU de 80 GB en precisión completa o en GPUs consumer con cuantización, aunque el autor no publica versiones GGUF.

## Benchmarks y rendimiento
El autor publica únicamente resultados de PIQA para varios trials. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

| Trial | PIQA acc | PIQA acc_norm | Rechazos | KL divergence |
|---|---|---|---|---|
| Original | 0.5381 | 0.5207 | no disponible | no disponible |
| T180 (seleccionado) | 0.5430 | 0.5250 | 11/101 | 0.0639 |
| T379 | 0.5408 | 0.5239 | 12/101 | 0.0485 |
| T175 | 0.5397 | 0.5207 | 8/101 | 0.0928 |
| T264 | 0.5397 | 0.5180 | 5/101 | 0.1287 |
| T142 | 0.5359 | 0.5147 | 10/101 | 0.0755 |
| T091 | 0.5343 | 0.5136 | 7/101 | 0.1067 |

## Requisitos de hardware
- VRAM estimada para inferencia en fp16/bf16: en torno a 24 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda al menos 40-48 GB para contexto largo.
- GPU recomendadas: A100 80 GB, H100 80 GB o L40S 48 GB para precisión completa; en consumer, RTX 4090 24 GB resulta justa y requiere cuantización.
- Cabe en GPU consumer solo con cuantización (por ejemplo, 8 bits o 4 bits), aunque el autor no publica versiones GGUF y habría que generarlas a partir de los safetensors.
- Opciones de despliegue: transformers (librería declarada), vLLM y TGI de forma previsible para safetensors; llama.cpp u Ollama requerirían conversión a GGUF no publicada.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| MuXodious/gemma-4-12B-it-SOMPOA-heresy | 11.959.730.176 | no disponible | apache-2.0 | Variante decensored con SOMPOA; PIQA acc 0.5430 |
| google/gemma-4-12B-it | no disponible | no disponible | Gemma 4 license (ver license_link) | Modelo base; PIQA acc 0.5381 |
| Otras variantes Heretic de Gemma 4 12B | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias
- El proceso de abliteración puede degradar capacidades generales del modelo; el autor reconoce "deslices" ocasionales de política o directrices en el razonamiento.
- Riesgo elevado de generar contenido dañino, ofensivo o inexacto al haberse reducido deliberadamente la tasa de rechazo; no apto para aplicaciones de cara al público sin moderación adicional.
- Riesgo de alucinación no cuantificado en la información disponible; el autor no publica evaluaciones de fidelidad factual.
- Idiomas soportados y longitud de contexto no documentados en la model card; no se puede garantizar el comportamiento multilingüe ni con contextos largos.
- La licencia del repositorio es Apache 2.0, pero el enlace de licencia apunta a la Gemma 4 license de Google; conviene verificar los términos aplicables al modelo base antes de uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación independiente de la comunidad.
- No se publican cuantizaciones GGUF ni versiones optimizadas para llama.cpp u Ollama, lo que limita el despliegue en hardware consumer.
- El modelo base google/gemma-4-12B-it no está verificado en la información proporcionada; los datos de arquitectura y contexto del base no están disponibles.

## Enlaces
- Hugging Face: https://huggingface.co/MuXodious/gemma-4-12B-it-SOMPOA-heresy
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Heretic: https://heretic-project.org
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Paper referenciado en tags: arxiv:2607.02770 (no verificado en la información proporcionada)
