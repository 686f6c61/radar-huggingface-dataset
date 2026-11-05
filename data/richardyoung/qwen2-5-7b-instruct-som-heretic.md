# richardyoung/Qwen2.5-7B-Instruct-SOM-heretic

## Resumen

Qwen2.5-7B-Instruct-SOM-heretic es una variante "decensored" (también etiquetada como *abliterated*) del modelo Qwen2.5-7B-Instruct de Alibaba Cloud, publicada por el usuario richardyoung. El modelo conserva la arquitectura y los pesos del original, pero se ha modificado mediante la técnica de *ablación multidireccional con mapas autoorganizados* (SOM) implementada en la herramienta Heretic v2.0.0, que elimina selectivamente las direcciones del espacio de activaciones asociadas a respuestas de rechazo. El resultado es un modelo que rechaza muchas menos peticiones que el original (27/100 frente a 99/100 en la métrica de rechazos reportada por el autor), con una divergencia KL de 0,0756 respecto al modelo base.

El modelo subyacente, Qwen2.5-7B-Instruct, es un transformer causal de 7.610 millones de parámetros (6.530 millones sin contar los embeddings) con 28 capas, atención con GQA (28 cabezas de consulta y 4 de clave-valor), RoPE, SwiGLU, RMSNorm y sesgo en la proyección QKV. Soporta una longitud de contexto completa de 131.072 tokens (configurada por defecto en 32.768, ampliable con YaRN) y genera hasta 8.192 tokens. Está entrenado para instrucciones y conversación, con mejoras notables en código, matemáticas, seguimiento de instrucciones y salida estructurada (JSON) respecto a Qwen2.

La relevancia de esta variante concreta es doble: por un lado, permite estudiar y utilizar un modelo de 7B sin las restricciones de rechazo del original en tareas de investigación sobre alineación y seguridad; por otro, su licencia Apache 2.0 y su compatibilidad con transformers, TGI y vLLM lo hacen desplegable en infraestructura estándar. No obstante, es un modelo con cero descargas y cero *likes* en el momento de la consulta, lo que implica que no ha sido validado por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con RoPE, SwiGLU, RMSNorm, atención GQA y sesgo QKV |
| Parametros totales | 7.615.616.512 (7,61 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 131.072 tokens completos; `config.json` por defecto en 32.768; generación hasta 8.192 tokens |
| Tipos de cuantizacion | No disponible en la información proporcionada (pesos en safetensors; cuantización GGUF/AWQ/GPTQ no confirmada) |
| Idiomas soportados | El modelo base soporta más de 29 idiomas (incluido español); la model card de esta variante declara únicamente `en` |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 15,2 GB) |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen2.5-7B-Instruct original: un transformer causal denso de 28 capas con 28 cabezas de atención para consultas y 4 para claves/valores (GQA), normalización RMSNorm, activación SwiGLU, embeddings rotatorios (RoPE) y sesgo en la proyección QKV. El modelo base fue entrenado en dos fases (preentrenamiento y postentrenamiento con ajuste de instrucciones) sobre un corpus multilingüe del que no se detalla composición ni número de tokens en la información disponible. El soporte de contexto largo se implementa mediante YaRN (paper arXiv:2309.00071), con un factor de escalado de 4,0 sobre una ventana original de 32.768 tokens.

La modificación específica de esta variante es una ablación multidireccional guiada por mapas autoorganizados (SOM), aplicada con Heretic v2.0.0. Los parámetros publicados incluyen `direction_index=18`, `direction_decay=0.99`, y pesos de ablación diferenciados para las proyecciones `attn.o_proj` (máximo 0,96 en la posición 19,00; mínimo 0,75 a distancia 2,87) y `mlp.down_proj` (máximo 1,19 en la posición 21,75; mínimo 1,04 a distancia 11,66). No se ha aplicado un reentrenamiento adicional: los pesos se derivan directamente del modelo base mediante edición de activaciones. No se documenta RLHF ni DPO específico para esta variante.

## Capacidades

- Generación de texto y conversación multi-turno con plantilla de chat (`apply_chat_template`) y soporte de roles de sistema, usuario y asistente.
- Razonamiento, matemáticas y generación de código, heredados del ajuste especializado de Qwen2.5 en estos dominios.
- Seguimiento de instrucciones y generación de textos largos (más de 8.000 tokens), con especial énfasis en salidas estructuradas como JSON y comprensión de tablas.
- Mayor resistencia a la diversidad de *system prompts*, útil para role-play y definición de condiciones en chatbots.
- Capacidad multilingüe del modelo base (más de 29 idiomas, incluido el español), aunque la model card de esta variante solo declara inglés.
- Reducción drástica de rechazos: 27/100 frentes a 99/100 del original, según la métrica del autor.
- No se documenta soporte explícito de *tool calling* ni de modo *thinking* en la información proporcionada; el modelo base Qwen2.5-Instruct sí admite function calling según su documentación oficial, pero no se confirma para esta variante.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar el comportamiento de un LLM sin capas de rechazo, comparando sus respuestas con las del Qwen2.5-7B-Instruct original para analizar qué direcciones de activación codifican la negativa a responder.
- Generación creativa sin restricciones temáticas: escritura de ficción, guiones o narrativa que aborde temas sensibles (violencia, conflicto, contenido adulto) sin que el modelo se niegue, algo que el original bloquearía en la mayoría de los casos.
- Evaluación de robustez de filtros de seguridad: usar el modelo como generador adversario para probar clasificadores de contenido y sistemas de moderación en pipelines de producción.
- Asistente conversacional de dominio cerrado: con 32.768 tokens de contexto por defecto y hasta 131.072 con YaRN, puede mantener conversaciones largas con historial extenso y documentación adjunta.
- Generación de código en entornos controlados: el modelo hereda las capacidades de código de Qwen2.5-7B-Instruct y puede integrarse en pipelines de CI/CD o asistentes de IDE, siempre que el equipo asuma el riesgo de respuestas sin filtro.
- Análisis de documentos extensos: procesamiento de contratos, informes o artículos de más de 30.000 tokens activando `rope_scaling` con YaRN en config.json, útil para resumen y extracción de datos estructurados.
- *Red teaming* interno: generación de prompts y respuestas maliciosas simuladas para entrenar sistemas de detección, en un entorno aislado y con registro de auditoría.

## Benchmarks y rendimiento

Los únicos datos publicados por el autor son métricas de la modificación Heretic, no benchmarks estándar de capacidad:

| Metrica | Este modelo | Qwen2.5-7B-Instruct original |
|---|---|---|
| Rechazos (sobre 100) | 27/100 | 99/100 |
| Divergencia KL | 0,0756 | 0 (por definición) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para esta variante en la información disponible. El modelo base Qwen2.5-7B-Instruct sí cuenta con evaluaciones publicadas en el blog oficial de Qwen, pero no se reproducen aquí al no estar incluidas en la información proporcionada.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 15,2 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 18-20 GB para inferencia cómoda.
- VRAM estimada en cuantización de 8 bits: en torno a 8 GB; en 4 bits, en torno a 4-5 GB (estimaciones teóricas, no verificadas para esta variante concreta).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para producción; RTX 4090 (24 GB) para FP16 en una sola GPU; RTX 3090 (24 GB) también viable en FP16.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 en FP16, y en GPUs de 8-12 GB si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: transformers (versión ≥ 4.37.0, obligatoria para evitar el error `KeyError: 'qwen2'`), vLLM (recomendado por Qwen para producción, con soporte de YaRN estático), TGI (el repo incluye el tag `text-generation-inference`), llama.cpp/Ollama si se generan pesos GGUF (no confirmado en el repo).
- Latencia y throughput: no disponibles en la información proporcionada; Qwen publica cifras de velocidad para el modelo base en su documentación de benchmarks, pero no se han trasladado a esta variante.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen2.5-7B-Instruct-SOM-heretic (este) | 7,61 B | 131.072 (32.768 por defecto) | Apache 2.0 | Variante decensored con 27/100 rechazos y KL 0,0756 |
| Qwen/Qwen2.5-7B-Instruct | 7,61 B | 131.072 (32.768 por defecto) | Apache 2.0 | Modelo original, 99/100 rechazos, referencia de capacidades |
| Otras variantes abliterated de Qwen2.5-7B | ~7,61 B | Depende de la variante | Apache 2.0 (heredada) | No se dispone de datos comparativos verificados en la información proporcionada |
| Mistral-7B-Instruct-v0.3 | ~7,25 B | 32.768 | Apache 2.0 | Alternativa de tamaño similar con contexto menor; sin datos de ablación comparables |

No se dispone de benchmarks estandarizados que permitan comparar rendimiento de capacidad entre estas variantes en la información proporcionada; la comparación se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- La eliminación de rechazos implica que el modelo puede generar contenido dañino, ilegal o sexualmente explícito sin filtro; no es apto para aplicaciones orientadas al público general sin una capa de moderación externa.
- La divergencia KL de 0,0756 respecto al original indica que la distribución de salida ha cambiado de forma medible; pueden aparecer degradaciones en tareas que dependían de las direcciones ablacionadas.
- Riesgo de alucinación heredado del modelo base, no mitigado por la modificación; la ablación no mejora la veracidad.
- La model card declara únicamente inglés, aunque el modelo base soporta más de 29 idiomas; el rendimiento en español no está verificado para esta variante.
- El modelo tiene cero descargas y cero *likes* en el momento de la consulta: no hay validación de la comunidad ni reportes independientes de calidad.
- La licencia Apache 2.0 permite uso comercial, pero el usuario asume la responsabilidad legal del contenido generado; conviene revisar las políticas de la plataforma de despliegue.
- El uso de YaRN en vLLM es estático y puede degradar el rendimiento en textos cortos si se activa de forma permanente; se recomienda activarlo solo cuando se procesen contextos largos.
- No se documenta soporte verificado de *tool calling* en esta variante; si se necesita, debe probarse explícitamente antes de integrarlo en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/richardyoung/Qwen2.5-7B-Instruct-SOM-heretic
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct/blob/main/LICENSE
- Heretic (herramienta de ablación): https://heretic-project.org
- Blog de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Repositorio GitHub de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Documentación de Qwen: https://qwen.readthedocs.io/en/latest/
- Documentación de despliegue con vLLM: https://qwen.readthedocs.io/en/latest/deployment/vllm.html
- Benchmarks de velocidad de Qwen: https://qwen.readthedocs.io/en/latest/benchmark/speed_benchmark.html
- Paper de YaRN: https://arxiv.org/abs/2309.00071
- Paper de Qwen2 (arXiv:2407.10671): https://arxiv.org/abs/2407.10671
- Chat de Qwen: https://chat.qwenlm.ai/
