# el4/GRM-3.2-Sky-ONYX-GGUF

## Resumen

GRM-3.2-Sky-ONYX-GGUF es una colección de cuantizaciones GGUF del modelo OrionLLM/GRM-3.2-Sky, un modelo de lenguaje de arquitectura MoE con 34.660 millones de parámetros diseñado para tareas agénticas de horizonte largo y problemas de razonamiento extremadamente difíciles. El repositorio, publicado por el usuario el4, aplica el método de cuantización propietario ONYX (Adaptive Precision Engine), que combina mediciones dinámicas de sensibilidad por capa con una matriz de importancia ponderada por el router del MoE para preservar la calidad de los expertos más utilizados.

La relevancia de este modelo radica en su capacidad para comprimir un modelo de aproximadamente 70 GB en formato bf16 a tamaños mucho menores (desde unos 11 GB hasta unos 21 GB según el tier) sin perder las capacidades de razonamiento agéntico del modelo original. El modelo base GRM-3.2-Sky está construido sobre la arquitectura Qwen3 e incorpora capacidades de razonamiento explícito y soporte para tool calling, según los tags del repositorio.

El autor documenta una prueba de estrés agéntica de 20 minutos con la cuantización mini (~11 GB) en la que el modelo escribió un programa Rust compilable, lo ejecutó vía bash, depuró sus propios errores y tradujo la explicación técnica a tres idiomas, lo que sugiere que la compresión extrema preserva las capacidades de razonamiento de horizonte largo del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE basada en Qwen3 |
| Parametros totales | 34.660.610.688 (~34,66 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con método ONYX: tier quality (~21 GB, objetivo Q8), tier balanced (objetivo Q6), tier mini (~11 GB) |
| Idiomas soportados | no disponible (la prueba del autor incluye japones, español y arabe egipcio) |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base GRM-3.2-Sky es un MoE de 34,66 mil millones de parámetros construido sobre la arquitectura Qwen3, orientado a tareas agénticas de horizonte largo y razonamiento complejo. En formato bf16 ocupa aproximadamente 70 GB. El repositorio ONYX-GGUF no modifica la arquitectura del modelo, sino que aplica una cuantización especializada sobre los pesos ya entrenados.

El método ONYX introduce tres innovaciones principales respecto a la cuantización GGUF convencional: (1) Dynamic Layer Sensitivity, que reemplaza los límites de capa fijos por mediciones reales de varianza de activaciones para identificar y proteger dinámicamente las capas críticas, como los bloques de atención de la red media; (2) Router-Weighted Imatrix, que captura las probabilidades del router MoE y las multiplica por las escalas de activación, forzando al cuantizador a comprimir agresivamente los expertos "fríos" mientras protege los "calientes" dentro del mismo bloque de tensores; y (3) un diseño agnóstico a la arquitectura que lee dinámicamente los módulos de HuggingFace y el GGUF F16 generado para mapear tensores, funcionando con arquitecturas Llama, DeepSeek y SSM/MoE híbridas sin necesidad de expresiones regulares hardcodeadas.

No se dispone de información sobre los datos de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO) en los datos proporcionados.

## Capacidades

- Razonamiento de horizonte largo: el modelo base está diseñado para tareas agénticas que requieren mantener estado y contexto durante múltiples pasos de ejecución.
- Generación y depuración de código: la prueba del autor incluye escritura de código Rust compilable, ejecución vía bash e interpretación autónoma de errores del compilador para corregirlos.
- Razonamiento matemático y físico: el test de estrés incluye cálculo de autovalores del oscilador armónico cuántico mediante diagonalización matricial con la librería nalgebra, alcanzando un error analítico inferior al 0,05 %.
- Capacidades multilingües: la prueba documentada incluye traducción de contenido técnico a japonés formal, español y árabe egipcio coloquial, manteniendo precisión conceptual.
- Tool calling y uso de agentes: el modelo puede ejecutar comandos bash, leer salidas, interpretar errores y corregir sus propios fallos en un bucle agéntico autónomo.
- Modo razonamiento (thinking): al estar basado en Qwen3, incorpora capacidades de razonamiento explícito, aunque no se especifican detalles concretos sobre el modo de activación.

## Casos de uso

- Desarrollo de software asistido: el modelo puede escribir código, compilarlo, interpretar errores del compilador y corregirlos de forma autónoma, lo que lo hace adecuado para pipelines de generación y depuración de código en entornos CI/CD o como asistente de programación local.
- Agentes autónomos de investigación: su capacidad para mantener contexto largo y ejecutar múltiples pasos de razonamiento permite construir agentes que investigan, ejecutan herramientas y refinan resultados sin intervención humana.
- Traducción técnica especializada: la prueba del autor demuestra traducción de contenido técnico complejo a múltiples idiomas manteniendo precisión conceptual, útil para documentación de software, manuales técnicos y localización de productos.
- Cálculo científico y verificación numérica: con la capacidad de escribir y ejecutar código numérico (como diagonalización de matrices), puede asistir en tareas de cálculo científico, verificación de resultados analíticos y simulación.
- Asistentes de programación en local: el tier mini (~11 GB) cabe en GPUs de consumo, permitiendo ejecutar un asistente de código con capacidades agénticas en una estación de trabajo sin conexión a la nube.
- Educación y tutoría técnica: el modelo puede explicar conceptos complejos de física, matemáticas y programación, y traducir esas explicaciones a distintos idiomas y registros, lo que lo hace útil para plataformas educativas multilingües.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor documenta una prueba de estrés agéntica de 20 minutos en la que la cuantización mini (~11 GB) escribió un programa Rust para calcular autovalores del oscilador armónico cuántico, lo ejecutó vía bash, depuró errores de Unicode y de ordenación de autovalores, alcanzó un error analítico inferior al 0,05 % y tradujo la explicación a tres idiomas. No se proporcionan métricas cuantitativas comparables con otros modelos ni resultados de benchmarks estandarizados.

## Requisitos de hardware

- Tier mini (~11 GB): cabe en GPUs de consumo con 12-16 GB de VRAM, como RTX 4070, RTX 4080, RTX 3080 o RTX 3090.
- Tier quality (~21 GB): requiere GPUs con 24 GB de VRAM o más, como RTX 3090, RTX 4090, A100 o H100.
- El modelo base en bf16 (~70 GB) requiere hardware profesional o múltiples GPUs; la ventaja principal de ONYX es ejecutar el modelo en una sola GPU de consumo.
- Despliegue compatible con llama.cpp, Ollama (comando documentado: `ollama run hf.co/el4/GRM-3.2-Sky-ONYX-GGUF:GRM-3.2-Sky-ONYX-mini.gguf`) y cualquier runtime compatible con GGUF.
- No se dispone de datos de latencia o throughput específicos.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa cuantitativa con modelos alternativos. El modelo base GRM-3.2-Sky (OrionLLM) es un MoE de 34,66 B parámetros basado en Qwen3, orientado a tareas agénticas de horizonte largo. Como referencia cualitativa:

| Modelo | Parametros | Contexto | Formato | Licencia |
|---|---|---|---|---|
| GRM-3.2-Sky (base) | 34,66 B (MoE) | no disponible | bf16 (~70 GB) | no disponible |
| GRM-3.2-Sky-ONYX-GGUF (quality) | 34,66 B (MoE) | no disponible | GGUF (~21 GB) | no disponible |
| GRM-3.2-Sky-ONYX-GGUF (mini) | 34,66 B (MoE) | no disponible | GGUF (~11 GB) | no disponible |

Existe otra cuantización del mismo modelo base publicada por el mismo autor (GRM-3.2-Sky-OPAL-GGUF, basada en el método APEX), pero no se dispone de datos comparativos de rendimiento entre ambas.

## Limitaciones y advertencias

- La licencia del modelo no está especificada, lo que genera incertidumbre sobre el uso comercial; es necesario verificar la licencia del modelo base OrionLLM/GRM-3.2-Sky antes de usar en producción.
- No se dispone de información sobre la longitud de contexto soportada ni sobre los idiomas oficialmente soportados; la prueba del autor cubre un conjunto limitado de idiomas.
- La cuantización agresiva (especialmente el tier mini) puede degradar la calidad en tareas distintas a las probadas por el autor; la prueba documentada cubre un escenario específico de código, depuración y traducción.
- No hay benchmarks estandarizados publicados que permitan evaluar el rendimiento comparativo de forma objetiva.
- El modelo base puede heredar sesgos de Qwen3 y de sus datos de entrenamiento; no se dispone de información sobre medidas de mitigación.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en tareas de razonamiento complejo con contexto largo.
- El repositorio ocupa 203,8 GB en total, lo que implica que descargar todos los tiers requiere un ancho de banda y almacenamiento considerables.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/el4/GRM-3.2-Sky-ONYX-GGUF
- Space ONYX del autor: https://huggingface.co/spaces/el4/ONYX
- Repositorio OPAL-GGUF (cuantización alternativa del mismo autor): https://huggingface.co/el4/GRM-3.2-Sky-OPAL-GGUF
- Modelo base OrionLLM/GRM-3.2-Sky: https://huggingface.co/OrionLLM/GRM-3.2-Sky
- Hilo de discusión sobre el modelo base en foros de NVIDIA: https://forums.developer.nvidia.com/t/any-opinions-on-orionllm-grm-3-2-sky-70gb-bf16/378777
