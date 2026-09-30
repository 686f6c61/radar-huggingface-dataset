# Flipmode234/Ornith-1.5-35B-A3B-GGUF

## Resumen

Ornith-1.5-35B-A3B es un modelo de lenguaje de tipo mezcla de expertos (MoE) desarrollado por el equipo de Ornith (ornith-ai), con 35.505.251.456 parámetros totales y aproximadamente 3.000 millones de parámetros activos por token. Se presenta como la evolución de Ornith-1.0, que partía de modelos base Qwen3.5 y Gemma4 y sobre ellos aplicaba preentrenamiento continuado, mid-training y post-training. La ficha que se analiza aquí es una redistribución en formato GGUF publicada por el usuario Flipmode234, no el repositorio oficial.

El problema que aborda es el de los modelos especializados en tareas agénticas y de código: según su model card, supera a Qwen 3.6-35B-A3B en todos los benchmarks de programación y agentes presentados, y también a modelos densos como Gemma 4-31B y Muse Glimmer-30B en codificación agéntica. Su rasgo diferencial es el bucle de auto-mejora: en lugar de depender de un conjunto fijo de tareas humanas y de harnesses diseñados a mano, el modelo genera nuevas tareas de entrenamiento, descubre estrategias para resolverlas y mejora su política mediante aprendizaje por refuerzo.

La relevancia actual del modelo radica en que combina un coste de inferencia bajo (unos 3.000 millones de parámetros activos por token) con un rendimiento en benchmarks agénticos que, según los datos publicados, se sitúa por encima de alternativas densas bastante mayores. La licencia MIT facilita su uso comercial, y existen variantes oficiales en NVFP4 y FP8, además de la versión GGUF aquí descrita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) sobre transformer; detalles de la arquitectura base no disponibles |
| Parametros totales | 35.505.251.456 (~35,5 mil millones) |
| Parametros activos | ~3 mil millones por token |
| Longitud de contexto | No disponible en la model card; un repositorio de terceros (Mia AI Lab) indica soporte de hasta 256 000 tokens |
| Tipos de cuantizacion | GGUF (este repositorio); NVFP4 y FP8 en los repositorios oficiales de ornith-ai |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (modelo original), GGUF (este repositorio), NVFP4 y FP8 (variantes oficiales) |

## Arquitectura y entrenamiento

El modelo es una mezcla de expertos con unos 35,5 mil millones de parámetros totales de los que solo se activan alrededor de 3 mil millones por token, lo que reduce el coste computacional de inferencia respecto a un modelo denso del mismo tamaño. La model card no detalla el número de expertos, el mecanismo de enrutamiento, la dimensión oculta ni la composición exacta del dataset de entrenamiento. El repositorio para DGX Spark de Mia AI Lab menciona que el checkpoint incorpora decodificación especulativa MTP (multi-token prediction) integrada en el propio checkpoint, utilizable con vLLM.

El aspecto técnico más destacado es el procedimiento de entrenamiento. Ornith-1.0 se construyó sobre Qwen3.5 y Gemma4 con preentrenamiento continuado, mid-training y post-training adicionales. Ornith-1.5 amplía el bucle de auto-mejora desde la optimización de scaffolds y rollouts hasta la optimización conjunta de tres elementos: la generación de tareas, la construcción de scaffolds específicos por tarea y la producción de rollouts de solución para aprendizaje por refuerzo. En la model card no se especifican el número de tokens de entrenamiento, la composición del corpus, ni si se emplearon técnicas concretas como RLHF o DPO más allá de la mención genérica al aprendizaje por refuerzo.

## Capacidades

- Generación de texto conversacional, con pipeline declarado de text-generation.
- Programación y tareas agénticas de terminal: los benchmarks publicados se centran en Terminal-Bench 2.1 y SWE-bench, lo que indica capacidad para operar en entornos de línea de comandos y resolver incidencias de repositorios reales.
- Ejecución dentro de harnesses de agentes: la model card reporta resultados tanto con Terminus-2 como con Claude Code, lo que implica compatibilidad con bucles de agente externos.
- Razonamiento multi-paso orientado a tareas de larga duración (resolución de issues, edición de código, ejecución de comandos).
- Decodificación especulativa MTP integrada en el checkpoint, según la documentación de terceros para DGX Spark.
- Capacidades multilingües: no disponibles; la model card no declara lista de idiomas.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Agentes de codificación autónoma: el modelo puede integrarse en harnesses tipo Claude Code o Terminus-2 para resolver issues de repositorios, con un rendimiento declarado de 79 en SWE-bench Verified, lo que lo hace adecuado para pipelines de reparación automática de errores.
- Automatización de operaciones en terminal: con 67,8 en Terminal-Bench 2.1 (Terminus-2), es apto para tareas de administración de sistemas, ejecución de scripts y diagnóstico de entornos sin intervención humana continua.
- Asistente de desarrollo integrado en el IDE: el reducido número de parámetros activos (~3B) permite desplegarlo con latencias bajas para autocompletado y refactorización asistida en equipos de desarrollo.
- Revisión de código en CI/CD: puede analizar diffs, proponer parches y validar cambios antes del merge, aprovechando su capacidad en SWE-bench Pro (sin datos concretos publicados en la información disponible).
- Generación de tareas sintéticas para entrenamiento: el propio diseño del modelo le permite proponer nuevos problemas de programación y agentes, útil para equipos que construyen datasets de RL.
- Despliegue en hardware unificado de gama alta: la variante NVFP4 está documentada para ejecutarse en una única NVIDIA DGX Spark con memoria unificada de ~128 GB, lo que habilita casos de uso de inferencia local en laboratorio.
- Sustitución de modelos densos de mayor tamaño en producción: su relación entre parámetros activos y rendimiento en benchmarks agénticos lo hace candidato para reducir costes de servicio manteniendo calidad en tareas de código.

## Benchmarks y rendimiento

Datos extraídos de la model card. La tabla original estaba truncada en la información recibida, por lo que solo se reproducen las filas completas y visibles.

| Benchmark | Ornith-1.5-35B-A3B | Ornith-1.0-35B-A3B | Qwen3.6-35B-A3B | Gemma-4-31B | Muse-Glimmer-30B | Qwen3.5-397B |
|---|---|---|---|---|---|---|
| Terminal-Bench 2.1 (Terminus-2) | 67,8 | 64,2 | 52,5 | 42,1 | 51,7 | 53,5 |
| Terminal-Bench 2.1 (Claude Code) | 68,5 | 62,8 | 49,2 | - | - | 48,6 |
| SWE-bench Verified | 79 | 75,6 | 73,4 | 52 | 76 | 76,4 |
| SWE-bench Pro | No disponible (tabla truncada) | No disponible | No disponible | No disponible | No disponible | No disponible |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de conocimiento general en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones propias a partir de los 35,5 mil millones de parámetros totales; el modelo no puede descargar expertos de la memoria sin penalización de latencia): aproximadamente 20-23 GB en cuantización Q4_K_M, 38-40 GB en Q8_0 y 71-75 GB en FP16/BF16, más la caché KV correspondiente al contexto utilizado.
- GPU recomendadas: A100 80 GB o H100 80 GB para FP16/BF16 con contexto largo; A100 40 GB, L40S 48 GB o RTX 6000 Ada 48 GB para Q8; una única NVIDIA DGX Spark (GB10, ~128 GB de memoria unificada) está documentada como plataforma de ejecución con el checkpoint NVFP4.
- GPU de consumo: una RTX 3090 o RTX 4090 con 24 GB puede ejecutar cuantizaciones Q4 con contexto moderado, aunque el tamaño del repositorio GGUF (186 GB) indica que contiene múltiples archivos de cuantización, no una sola. En GPUs de 8-16 GB sería necesario el offload parcial a CPU, con la consiguiente pérdida de velocidad.
- Opciones de despliegue: llama.cpp y Ollama para los ficheros GGUF; vLLM para los checkpoints NVFP4 y FP8, con decodificación especulativa MTP; TGI como alternativa de servidor.
- Latencia y throughput: no disponibles. El número reducido de parámetros activos (~3B por token) sugiere un throughput notablemente superior al de un modelo denso de 35B, pero no se han publicado cifras medidas en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Activos por token | SWE-bench Verified | Terminal-Bench 2.1 (Terminus-2) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B | ~35,5B (MoE) | ~3B | 79 | 67,8 | MIT | Pesos abiertos (safetensors, NVFP4, FP8, GGUF) |
| Ornith-1.0-35B-A3B | ~35,5B (MoE) | ~3B | 75,6 | 64,2 | MIT (misma familia) | Pesos abiertos |
| Qwen3.6-35B-A3B | ~35B (MoE) | No disponible | 73,4 | 52,5 | No disponible | Pesos abiertos |
| Gemma-4-31B | ~31B (denso) | 31B | 52 | 42,1 | No disponible | Pesos abiertos |
| Muse-Glimmer-30B | ~30B | No disponible | 76 | 51,7 | No disponible | Pesos abiertos |

Los datos de la columna de Qwen3.5-397B se han omitido de esta tabla por tratarse de un modelo de escala muy superior, incluido en la model card únicamente como referencia de frontera (53,5 en Terminal-Bench 2.1 Terminus-2 y 76,4 en SWE-bench Verified). No se dispone de información sobre licencias ni sobre el resto de especificaciones de los modelos comparados más allá de lo que aparece en la propia model card.

## Limitaciones y advertencias

- Idiomas soportados: no declarados. No hay garantía de un rendimiento adecuado en castellano ni en otros idiomas distintos del inglés técnico.
- Sesgos conocidos: no disponibles. La model card no incluye ninguna sección de evaluación de sesgos, seguridad o alineación.
- Riesgo de alucinación: no evaluado en la información disponible. En tareas de generación de código y ejecución de comandos, una alucinación puede traducirse en modificaciones destructivas del sistema, por lo que se recomienda sandboxing y revisión humana.
- Los benchmarks publicados provienen del propio desarrollador y no incluyen detalles sobre metodología, número de intentos ni configuración de muestreo, lo que dificulta su reproducción independiente.
- Este repositorio concreto (Flipmode234/Ornith-1.5-35B-A3B-GGUF) es una redistribución de terceros, con 0 descargas y 1 me gusta en el momento de redactar esta ficha. No se especifica el proceso de cuantización empleado, el autor de la conversión ni la verificación de los pesos respecto al modelo original. Para uso en producción conviene contrastar con los repositorios oficiales de ornith-ai.
- La licencia MIT permite uso comercial sin restricciones de atribución más allá del propio texto de la licencia, pero se aplica al modelo original; conviene verificar que la redistribución GGUF mantiene las mismas condiciones (la model card indica licencia MIT también para esta copia).
- No hay información sobre la longitud de contexto real soportada por el modelo original: el dato de 256 000 tokens procede de un repositorio de terceros, no de la documentación oficial.
- El campo de idiomas y el pipeline declarado (text-generation conversacional) no aportan información sobre el formato exacto de prompt de chat ni sobre plantillas de tool calling; sería necesario consultar el repositorio oficial para el despliegue.
- El repositorio tiene un tamaño de 186 GB, lo que implica un coste de almacenamiento y de descarga considerable si se quieren obtener todas las cuantizaciones.

## Enlaces

- Repositorio analizado (GGUF, terceros): https://huggingface.co/Flipmode234/Ornith-1.5-35B-A3B-GGUF
- Repositorio oficial NVFP4: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-NVFP4
- Repositorio oficial FP8: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-FP8
- Repositorio base citado en la licencia: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Repositorio GitHub de la familia Ornith: https://github.com/ornith-ai/Ornith-1
- Guía de despliegue en DGX Spark (Mia AI Lab): https://github.com/MiaAI-Lab/Ornith-1.5-35B-A3B-DGX-Spark
- Blog técnico de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Blog enlazado en la model card: https://deep-reinforce.com/ornith.html
