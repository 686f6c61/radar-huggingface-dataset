# richardyoung/Qwen2.5-32B-Instruct-MPOA-heretic

## Resumen

Qwen2.5-32B-Instruct-MPOA-heretic es una variante "decensored" (también etiquetada como *abliterated* o *uncensored*) del modelo Qwen2.5-32B-Instruct de Alibaba Cloud, generada por el usuario richardyoung mediante la herramienta Heretic v2.0.0. El objetivo de esta modificación es reducir la tasa de rechazos del modelo original ante peticiones que este declinaría, aplicando una técnica de ablación ortogonal con preservación de magnitud (MPOA, *Magnitude-Preserving Orthogonal Ablation*) sobre determinados pesos de las capas de atención y MLP. El resultado es un modelo con la misma arquitectura y tamaño que el original, pero con un comportamiento de alineación alterado.

El modelo base Qwen2.5-32B-Instruct es un transformer causal de 32.500 millones de parámetros (31.000 millones sin contar los embeddings), 64 capas, atención con GQA (40 cabezas de consulta y 8 de clave/valor), RoPE, SwiGLU, RMSNorm y sesgo en las proyecciones QKV. Soporta una ventana de contexto completa de 131.072 tokens, con generación de hasta 8.192 tokens, y está entrenado para seguir instrucciones, generar código, resolver problemas matemáticos y manejar datos estructurados.

La relevancia de esta ficha radica en que documenta una modificación reproducible (el autor incluye un directorio `reproduce` con los parámetros exactos de la ablación) que altera las propiedades de seguridad del modelo original. Es importante señalar que la model card solo declara el idioma inglés, aunque el modelo base soporta más de 29 idiomas, y que la licencia Apache 2.0 se hereda del modelo original. La información disponible sobre benchmarks del modelo modificado se limita a métricas de rechazo y divergencia KL; no hay datos de rendimiento en tareas estándar para esta variante concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con RoPE, SwiGLU, RMSNorm y sesgo en proyecciones QKV (Qwen2) |
| Parametros totales | 32.763.876.352 (32,5B; 31,0B sin embeddings) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens completos; generación de hasta 8.192 tokens. Configuración por defecto de `config.json` a 32.768 tokens; extensión a 131K mediante YaRN con factor 4.0 |
| Tipos de cuantizacion | No disponible en la información proporcionada (el repo contiene safetensors en precisión original; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | La model card de esta variante declara únicamente `en`; el modelo base Qwen2.5 soporta más de 29 idiomas (chino, inglés, francés, español, portugués, alemán, italiano, ruso, japonés, coreano, vietnamita, tailandés, árabe, entre otros) |
| Licencia | Apache 2.0 (heredada de Qwen/Qwen2.5-32B-Instruct) |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen2.5-32B-Instruct original: un transformer decoder-only denso con 64 capas, normalización RMSNorm, activación SwiGLU, embeddings rotatorios (RoPE) y atención con grouped-query attention (40 cabezas Q, 8 cabezas KV). El modelo base fue entrenado en dos fases (pretraining y post-training) por Alibaba Cloud, con mejoras específicas en conocimiento, código, matemáticas, seguimiento de instrucciones, generación de textos largos y salidas estructuradas (JSON, tablas). No se detalla en la información disponible el número exacto de tokens de entrenamiento ni la composición del dataset.

La modificación de esta variante consiste en una ablación ortogonal con preservación de magnitud (MPOA) aplicada mediante Heretic v2.0.0. Los parámetros publicados incluyen un `direction_index` de 45,34 y valores de peso máximo/mínimo y sus posiciones para las proyecciones `attn.o_proj` y `mlp.down_proj`. Esta técnica proyecta fuera de los pesos las direcciones asociadas al comportamiento de rechazo, preservando la norma de los vectores para minimizar el daño colateral en las capacidades del modelo. El autor indica que el proceso es reproducible y documenta los pasos en el directorio `reproduce` del repositorio. No se especifica si hubo entrenamiento adicional, RLHF o DPO en esta variante; la modificación es puramente de edición de pesos.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat (`apply_chat_template`).
- Razonamiento, conocimiento general y respuesta a instrucciones complejas, heredados del modelo base Qwen2.5-32B-Instruct.
- Generación de código y resolución de problemas matemáticos, con mejoras respecto a Qwen2 por el uso de modelos expertos especializados en el entrenamiento del base.
- Comprensión y generación de datos estructurados (tablas, JSON) y textos largos de más de 8.000 tokens.
- Soporte de contexto largo de hasta 131.072 tokens mediante YaRN (configuración manual necesaria).
- Capacidades multilingües del modelo base (más de 29 idiomas), aunque la model card de esta variante solo declara inglés.
- Comportamiento "decensored": reducción drástica de rechazos (13/100 frente a 98/100 del original en la métrica del autor).
- No se documenta en la información disponible soporte explícito de tool calling, function calling, agentes o modos de razonamiento extendido (thinking mode) para esta variante concreta; el modelo base Qwen2.5-Instruct sí está diseñado para seguir instrucciones y plantillas de herramientas, pero no se confirma aquí.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo sirve como caso de estudio reproducible de cómo una ablación de pesos altera la tasa de rechazos, permitiendo comparar el comportamiento antes y después de la modificación con la divergencia KL reportada (0,0599).
- Generación creativa sin restricciones: escritura de ficción, guiones o narrativa que aborde temas sensibles, donde el modelo original declinaría; adecuado por su ventana de contexto de hasta 131K tokens para tramas largas y coherentes.
- Análisis de documentos extensos: procesamiento de informes, contratos o artículos de más de 32.000 tokens activando YaRN, con generación de resúmenes estructurados en JSON o tablas.
- Asistencia en programación: generación y revisión de código en pipelines de desarrollo, aprovechando las mejoras del base en coding y su capacidad de generar salidas estructuradas.
- Despliegue en investigación académica: experimentos que requieren un modelo de 32B con comportamiento menos restrictivo para estudiar sesgos, robustez o dinámicas de conversación, con la ventaja de ser reproducible.
- Evaluación comparativa de técnicas de edición de pesos: comparar MPOA con otras técnicas de abliteration sobre el mismo modelo base, usando las métricas de rechazo y KL como referencia.
- Generación de datos sintéticos para entrenamiento: producción de diálogos o textos que el modelo original rechazaría, útil para aumentar la diversidad de datasets en dominios específicos, con la advertencia de revisar el contenido generado.

## Benchmarks y rendimiento

| Metrica | Este modelo | Modelo original (Qwen/Qwen2.5-32B-Instruct) |
|---|---|---|
| Rechazos (Refusals) | 13/100 | 98/100 |
| Divergencia KL | 0,0599 | 0 (por definición) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para esta variante en la información disponible. El modelo base Qwen2.5-32B-Instruct reporta resultados en el blog oficial de Qwen, pero no se incluyen en la documentación de esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión original (BF16/FP16): aproximadamente 65,5 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda al menos 80 GB para contexto moderado.
- GPU recomendadas para BF16: A100 80GB, H100 80GB, o múltiples GPUs (por ejemplo, 2× A100 40GB con tensor parallelism).
- Cuantización: no se listan variantes GGUF/AWQ/GPTQ en la información disponible; si se generan, en 4 bits los pesos ocuparían unos 16-17 GB, lo que permitiría su uso en una RTX 4090 (24 GB) con contexto limitado, aunque esto no está confirmado por el autor.
- En consumer GPU: en BF16 no cabe en ninguna GPU de consumo actual; en cuantización 4-bit podría caber en RTX 4090 o RTX 3090, pero requiere conversión manual no documentada.
- Opciones de despliegue: transformers (recomendado `transformers>=4.37.0`), vLLM (recomendado por Qwen para producción), text-generation-inference (etiqueta `text-generation-inference` en el repo), endpoints compatibles. No se menciona soporte de llama.cpp u Ollama en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada; Qwen publica benchmarks de velocidad en su documentación, pero no para esta variante.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen2.5-32B-Instruct-MPOA-heretic (este) | 32,5B | 131K (YaRN) | Apache 2.0 | Variante decensored con 13/100 rechazos y KL 0,0599 |
| Qwen/Qwen2.5-32B-Instruct | 32,5B | 131K (YaRN) | Apache 2.0 | Modelo original, 98/100 rechazos, sin modificación de pesos |
| Otras variantes abliterated de Qwen2.5-32B-Instruct | 32,5B | 131K (YaRN) | Apache 2.0 | No disponibles en la información proporcionada; existirían variantes con técnicas distintas (por ejemplo, abliteration estándar) pero no se comparan aquí por falta de datos |

No se dispone de datos de benchmarks estándar para comparar el rendimiento en tareas (MMLU, HumanEval, GSM8K) entre esta variante y el original o alternativas; la única comparación publicada es la de rechazos y divergencia KL.

## Limitaciones y advertencias

- La modificación MPOA altera la alineación del modelo; puede generar contenido que el original rechazaría, incluyendo material sensible, sesgado o inapropiado. No se han evaluado los sesgos resultantes de la ablación.
- Riesgo de alucinación inherente al modelo base, potencialmente incrementado por la edición de pesos; la divergencia KL de 0,0599 indica un cambio medible en la distribución de salida.
- La model card declara únicamente inglés, aunque el base soporta más idiomas; el rendimiento multilingüe tras la ablación no está verificado.
- El contexto completo de 131K requiere configurar YaRN manualmente en `config.json`; vLLM solo soporta YaRN estático, lo que puede degradar el rendimiento en textos cortos si se activa siempre.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado puede violar políticas de plataformas o normativas; el usuario es responsable del uso.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria; no hay garantías de calidad ni de reproducibilidad más allá de la documentación del autor.
- No se documentan variantes cuantizadas oficiales; el despliegue en hardware limitado requiere conversión manual y no está soportado por el autor.
- La fecha de creación indicada (2026-11-05) es futura respecto a la información habitual disponible; verificar la vigencia del repositorio antes de usarlo en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/richardyoung/Qwen2.5-32B-Instruct-MPOA-heretic
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- Licencia del base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct/blob/main/LICENSE
- Heretic (herramienta de decensoring): https://heretic-project.org
- Blog de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- GitHub de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Documentación de Qwen: https://qwen.readthedocs.io/en/latest/
- Documentación de despliegue con vLLM: https://qwen.readthedocs.io/en/latest/deployment/vllm.html
- Benchmarks de velocidad de Qwen: https://qwen.readthedocs.io/en/latest/benchmark/speed_benchmark.html
- Paper de YaRN (arXiv:2309.00071): https://arxiv.org/abs/2309.00071
- Paper de Qwen2 (arXiv:2407.10671): https://arxiv.org/abs/2407.10671
