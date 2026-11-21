# richardyoung/Qwen2.5-7B-Instruct-heretic1x-code

## Resumen

Qwen2.5-7B-Instruct-heretic1x-code es un ajuste fino (finetune) del modelo Qwen/Qwen2.5-7B-Instruct, publicado por el usuario richardyoung en Hugging Face. El modelo pertenece a la familia de variantes "heretic" (abliterated/decensored), una técnica de modificación de pesos que busca eliminar o atenuar los mecanismos de rechazo y alineación de seguridad del modelo original, orientada a investigación. El sufijo "code" sugiere un enfoque adicional hacia tareas de generación de código, aunque no se dispone de documentación detallada en la información proporcionada.

El modelo conserva la arquitectura transformer densa de Qwen2.5-7B-Instruct, con 7.615.616.512 parámetros totales (aproximadamente 7,6 mil millones) y un tamaño de repositorio de 15,2 GB en formato safetensors. La licencia declarada es Apache 2.0, aunque el acceso está restringido (gated) y requiere aceptar condiciones en Hugging Face. El modelo base Qwen2.5-7B-Instruct es conocido por su soporte de contexto largo (hasta 128K tokens en la familia Qwen2.5, aunque este dato no se confirma explícitamente en la información disponible para esta variante).

La relevancia de este modelo reside en su carácter de herramienta de investigación sobre alineación y seguridad: las variantes "abliterated" permiten estudiar el comportamiento de modelos sin las capas de rechazo entrenadas, lo que resulta útil para analizar sesgos, robustez y mecanismos de seguridad. No obstante, su uso en producción comercial conlleva riesgos significativos derivados de la ausencia de filtros de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer densa (familia Qwen2, decoder-only) |
| Parametros totales | 7.615.616.512 (~7,6B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen2.5-7B-Instruct soporta hasta 128K tokens, pero no se confirma para esta variante) |
| Tipos de cuantizacion | No disponible (formato original safetensors; se puede cuantizar a GGUF/AWQ/GPTQ mediante herramientas externas, no confirmado en el repo) |
| Idiomas soportados | Ingles (segun tags del repositorio) |
| Licencia | Apache 2.0 (con acceso restringido/gated en Hugging Face) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer decoder-only de Qwen2.5-7B-Instruct, que emplea atención con RoPE, normalización RMSNorm y activación SwiGLU, con aproximadamente 7,6 mil millones de parámetros. Sobre esta base, el autor ha aplicado la técnica "heretic" (abliteration), que consiste en identificar y modificar las direcciones de activación asociadas al comportamiento de rechazo, de forma similar a como se hace en las variantes abliterated. El sufijo "code" indica un posible ajuste adicional orientado a código, aunque no se detalla la composición del dataset ni el proceso de entrenamiento en la información disponible.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO específicas para esta variante. Tampoco se documentan innovaciones técnicas adicionales más allá de la modificación de pesos para eliminar rechazos. La información sobre el proceso de "heretic 1.x" no está disponible en los datos proporcionados.

## Capacidades

- Generación de texto conversacional en inglés, heredada de Qwen2.5-7B-Instruct.
- Generación de código (indicado por el sufijo "code", aunque sin documentación específica sobre el alcance).
- Razonamiento y matemáticas básicas, según las capacidades del modelo base.
- Ausencia o atenuación de mecanismos de rechazo (comportamiento "decensored"), lo que permite generar contenido que el modelo original rechazaría.
- Soporte de tool calling / function calling: no confirmado explícitamente para esta variante, aunque el modelo base Qwen2.5-7B-Instruct lo soporta.
- Capacidades multilingües: limitadas al inglés según los tags del repositorio.
- No se documentan capacidades de visión, audio ni modo "thinking" explícito.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar cómo se comporta una versión sin rechazos frente a prompts sensibles, útil para analizar mecanismos de seguridad y sesgos en modelos abliterated.
- Análisis de robustez de filtros: comparar las respuestas de esta variante con las del Qwen2.5-7B-Instruct original para identificar qué tipos de contenido se ven afectados por la abliteración.
- Generación de código en entornos controlados: el sufijo "code" sugiere uso para tareas de programación, aunque sin garantías de calidad ni benchmarks disponibles; adecuado para experimentación interna.
- Evaluación de riesgos en pipelines de moderación: usar el modelo como caso de prueba para validar sistemas de moderación de contenido que deban detectar salidas no filtradas.
- Experimentos de destilación o fine-tuning posterior: al estar en formato safetensors y licencia Apache 2.0, puede servir como punto de partida para investigaciones que requieran un modelo base sin rechazos.
- Docencia y divulgación: demostraciones sobre cómo funcionan las técnicas de abliteration y sus efectos en el comportamiento de un LLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 15,2 GB (tamaño del repo en safetensors), por lo que requiere GPU con al menos 16 GB de VRAM para carga completa.
- VRAM estimada en cuantización de 8 bits: ~8 GB; en 4 bits: ~4-5 GB (estimaciones basadas en el número de parámetros, no confirmadas en el repo).
- GPU recomendadas: A100 40GB, H100, L40S para FP16; RTX 4090 (24 GB) para FP16; RTX 3090/4080 (16-24 GB) para FP16 o 8 bits; RTX 3060 12 GB o similar para cuantización 4 bits.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 en FP16, y en GPUs de 8-12 GB con cuantización.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag endpoints_compatible), y potencialmente llama.cpp/Ollama si se generan cuantizaciones GGUF (no incluidas en el repo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| richardyoung/Qwen2.5-7B-Instruct-heretic1x-code | ~7,6B | No disponible | Apache 2.0 | Gated | Variante abliterated/decensored orientada a código |
| Qwen/Qwen2.5-7B-Instruct | ~7,6B | 128K (familia Qwen2.5) | Apache 2.0 | Abierto | Modelo base alineado, con rechazos de seguridad |
| Otras variantes abliterated de Qwen2.5-7B | ~7,6B | Variable | Apache 2.0 | Variable | Múltiples autores publican versiones abliterated; no se dispone de comparación de rendimiento |
| Modelos de 7B alineados (p. ej., Llama 3.1 8B Instruct) | ~8B | 128K | Llama license | Abierto | Alternativa alineada, con benchmarks públicos |

No se dispone de datos de rendimiento comparativo para esta variante concreta.

## Limitaciones y advertencias

- La abliteration elimina o atenúa los rechazos de seguridad, lo que puede producir contenido dañino, sesgado u ofensivo sin filtros; no es adecuado para aplicaciones de cara al usuario sin moderación externa.
- Riesgo elevado de alucinación, especialmente en dominios especializados, sin que se hayan documentado evaluaciones específicas.
- Idiomas soportados limitados al inglés según los tags; el rendimiento en castellano no está garantizado.
- La longitud de contexto no está confirmada para esta variante; no asumir los 128K del modelo base sin verificación.
- Licencia Apache 2.0 permite uso comercial, pero el acceso está restringido (gated) y el uso de variantes decensored en producción puede violar políticas de plataformas y normativas locales.
- No hay benchmarks publicados que permitan evaluar la calidad del ajuste "code" ni comparar con el modelo base.
- El modelo tiene 0 likes y 746 descargas, lo que indica escasa validación por parte de la comunidad; tratar como experimental.

## Enlaces

- Hugging Face: https://huggingface.co/richardyoung/Qwen2.5-7B-Instruct-heretic1x-code
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion disponible.
