# mulhearn1022/Huihui-Qwen3.6-35B-A3B-abliterated-oQ4e-fp16-mtp

## Resumen

Este repositorio contiene una cuantización de precisión mixta en formato MLX del modelo Huihui-Qwen3.6-35B-A3B-abliterated, una versión sin censura (abliterated) del modelo Qwen3.6-35B-A3B desarrollado por Alibaba. La abliteración es una técnica que elimina los mecanismos de rechazo y los filtros de seguridad del modelo original, de modo que esta variante responde sin restricciones temáticas. El autor de esta cuantización concreta es mulhearn1022, mientras que el modelo base abliterated fue creado por huihui-ai.

Se trata de un modelo de arquitectura MoE (Mixture of Experts) con 35 mil millones de parámetros totales y aproximadamente 3 mil millones de parámetros activos por token, según indica el nombre. La cuantización se ha realizado con la herramienta oQ (oMLX) a 4 bits con group size 64, lo que reduce el tamaño del repositorio a 22,5 GB. Está pensado para ejecutarse en hardware Apple Silicon mediante la librería MLX. Su relevancia radica en ofrecer una versión ligera y ejecutable localmente de un modelo grande sin filtros de contenido, útil para investigación y desarrollo de aplicaciones que requieran generación de texto sin restricciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (qwen3_5_moe) |
| Parametros totales | No disponible (el nombre indica 35B-A3B, pero los safetensors reportan 6.190.670.768 parámetros, posiblemente correspondientes a los pesos cuantizados) |
| Parametros activos | No disponible (el nombre sugiere ~3B, sin confirmación) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4 bits, group size 64, precisión mixta (oQ) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer de tipo Mixture of Experts (MoE) con 35 mil millones de parámetros totales y aproximadamente 3 mil millones de parámetros activos por token, una configuración habitual en la serie Qwen3 para equilibrar calidad y eficiencia. La versión abliterated de huihui-ai se obtuvo aplicando la técnica de abliteración, que consiste en identificar y eliminar las direcciones del espacio de activaciones responsables de los comportamientos de rechazo, dando lugar a un modelo sin filtros de contenido. Esta cuantización concreta fue generada con oMLX v0.4.5.dev1, que aplica cuantización de precisión mixta de 4 bits con group size 64, conservando algunas capas en fp16 para mantener la calidad. No se dispone de información adicional sobre el entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF, etc.) en la documentación proporcionada.

## Capacidades

- Generación de texto libre, sin restricciones de contenido ni mecanismos de rechazo, gracias a la abliteración.
- Razonamiento y comprensión del lenguaje, capacidades heredadas del modelo base Qwen3.6-35B-A3B (no confirmadas oficialmente en esta variante).
- Posible soporte de código y matemáticas, aunque no se dispone de especificaciones detalladas.
- Ejecución local en Apple Silicon mediante MLX, con rendimiento adecuado para uso interactivo.
- No se ha confirmado soporte de tool calling, agentes o capacidades multimodales en la información disponible.

## Casos de uso

- Generación de ficción y narrativa creativa sin restricciones temáticas: el modelo puede producir historias, diálogos o guiones con contenido adulto o controvertido que otros modelos censurarían, gracias a su naturaleza abliterated.
- Investigación académica sobre seguridad y alineación de IA: permite estudiar cómo se comporta un modelo sin filtros de seguridad, analizar sesgos, alucinaciones y patrones de generación de contenido sensible.
- Desarrollo de asistentes de escritura personalizados para autores que necesitan explorar temas tabú o escenarios extremos sin intervención de moderación automática.
- Pruebas de robustez y jailbreak: al ejecutarse localmente, los investigadores pueden probar técnicas de ataque y defensa en un entorno controlado sin depender de APIs externas.
- Creación de chatbots de rol o entretenimiento para adultos, donde se requiere una respuesta sin censura y con contexto largo (si la ventana de contexto lo permite, dato no disponible).
- Evaluación comparativa de modelos cuantizados en hardware Apple: sirve como referencia para medir el impacto de la cuantización 4-bit en la calidad de generación y el rendimiento de inferencia en M1/M2/M3.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Sin embargo, se ha medido el rendimiento de inferencia en Apple Silicon:

| Métrica | Valor | Hardware |
|---|---|---|
| Prefill (PP) | 1.185 tokens/s | M1 Ultra (48 núcleos) 64 GB |
| Generación (TG) | 66,6 tokens/s | M1 Ultra (48 núcleos) 64 GB |

Estos datos provienen de omlx.ai y corresponden a la versión cuantizada de 4 bits. No hay comparativas con otros modelos.

## Requisitos de hardware

- El repositorio pesa 22,5 GB, por lo que se necesita al menos 24 GB de memoria unificada libre en Apple Silicon para cargar el modelo completo.
- Funciona exclusivamente en hardware Apple Silicon (M1, M2, M3 y superiores) debido al formato MLX. No es compatible con GPUs NVIDIA o AMD.
- Se recomienda un chip con al menos 32 GB de RAM unificada (por ejemplo, M1 Pro/Max/Ultra, M2 Pro/Max, M3 Pro/Max) para un uso fluido. En M1 Ultra (64 GB) se obtienen 66,6 tokens/s de generación, suficiente para interacción en tiempo real.
- Despliegue mediante MLX o oMLX. También existe una versión GGUF del mismo modelo (Huihui-Qwen3.6-35B-A3B-abliterated-MTP-GGUF) que puede ejecutarse con llama.cpp u Ollama en CPU/GPU, aunque no se ha confirmado la compatibilidad de esta cuantización concreta.
- Para uso en producción, se puede servir con MLX Server o integrar en aplicaciones Python usando la librería MLX.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa cuantitativa con modelos equivalentes. A continuación se muestra una comparación cualitativa basada en la información disponible:

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Huihui-Qwen3.6-35B-A3B-abliterated (este repo) | ~35B totales, ~3B activos (sin confirmar) | No disponible | No disponible | MLX 4-bit | Sin censura, cuantizado |
| Qwen3.6-35B-A3B (base) | 35B totales, 3B activos | No disponible | No disponible | Original | Con filtros de seguridad |
| Huihui-Qwen3.6-35B-A3B-abliterated-MTP-GGUF | ~35B totales, ~3B activos | No disponible | No disponible | GGUF | Sin censura, formato para llama.cpp |

No se conocen otros modelos de la misma familia con los que comparar en esta información.

## Limitaciones y advertencias

- Al ser una versión abliterated, el modelo no tiene filtros de seguridad y puede generar contenido ilegal, violento, sexual explícito o dañino. Su uso conlleva riesgos legales y éticos; se recomienda emplearlo únicamente en entornos de investigación controlados.
- La cuantización de 4 bits puede degradar la calidad de generación en comparación con el modelo original en fp16, especialmente en tareas de razonamiento complejo.
- No se dispone de información sobre la licencia del modelo base ni de esta variante, por lo que no se puede garantizar su uso comercial.
- Solo funciona en Apple Silicon; no es portable a otras arquitecturas sin conversión a otro formato (por ejemplo, GGUF).
- Se desconoce la longitud de contexto y los idiomas soportados, lo que limita su uso en aplicaciones multilingües o con contextos largos.
- Existe riesgo de alucinación y de generación de información falsa o inconsistente, como en cualquier modelo de lenguaje grande.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- Repositorio HuggingFace de esta cuantización: https://huggingface.co/mulhearn1022/Huihui-Qwen3.6-35B-A3B-abliterated-oQ4e-fp16-mtp
- Modelo base abliterated de huihui-ai: https://huggingface.co/huihui-ai/Huihui-Qwen3.6-35B-A3B-abliterated
- Versión GGUF del mismo modelo: https://huggingface.co/huihui-ai/Huihui-Qwen3.6-35B-A3B-abliterated-MTP-GGUF
- Benchmark de rendimiento en omlx.ai: https://omlx.ai/benchmarks/performance/6t22jn36
- Noticia sobre el lanzamiento del modelo abliterated: https://www.ai-market-watch.com/news/release-of-uncensored-qwen36-35b-a3b-abliterated-model-bgxohb
- Página en Ollama del modelo: https://ollama.com/huihui_ai/Qwen3.6-abliterated:35b-a3b-q4_K
