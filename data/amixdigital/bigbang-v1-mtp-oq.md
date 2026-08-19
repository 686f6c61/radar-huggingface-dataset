# AmixDigital/BigBang-v1-mtp-oQ

## Resumen

BigBang-v1 es un modelo de lenguaje multimodal-general desarrollado por el equipo endless-frontier, con 36.0 mil millones de parámetros en arquitectura de mezcla de expertos (MoE) y 3 mil millones de parámetros activos por token, según la descripción publicada en Ollama. El modelo está diseñado específicamente para tareas agénticas de largo horizonte, como búsqueda de información compleja, ingeniería de software, investigación científica y asistencia en investigación de IA. La variante aquí descrita, `AmixDigital/BigBang-v1-mtp-oQ`, incorpora multi-token prediction (MTP) y una cuantización optimizada (oQ), lo que la hace adecuada para despliegues que requieren mayor eficiencia de inferencia sin sacrificar capacidades de razonamiento. El modelo se posiciona como una alternativa de código abierto para agentes autónomos que necesitan planificación multi-paso y uso de herramientas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en Qwen3.6-35B-A3B |
| Parametros totales | 36.0B (según themodelverse) / 35B-A3B (según Ollama) |
| Parametros activos | 3B (MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ (optimized quantization) - sin especificar precisión; existe variante con TurboQuant KV 8-bit |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura de BigBang-v1 es una mezcla de expertos (MoE) derivada de Qwen3.6-35B-A3B, con 35 mil millones de parámetros totales y 3 mil millones activos por token. Esta configuración permite un equilibrio entre capacidad y eficiencia computacional. La variante `mtp-oQ` añade multi-token prediction (MTP), una técnica que predice varios tokens futuros simultáneamente para acelerar la inferencia y mejorar la coherencia en generaciones largas. Además, el benchmark de oMLX indica el uso de TurboQuant KV 8-bit, lo que sugiere una cuantización de las claves y valores de atención para reducir memoria. No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados ni el uso de técnicas de alineación como RLHF o DPO. El modelo está diseñado para razonamiento agéntico, con soporte de modo "thinking" (según la configuración del benchmark), lo que implica un entrenamiento orientado a cadenas de pensamiento explícitas.

## Capacidades

- Razonamiento agéntico de largo horizonte: planificación multi-paso y ejecución de tareas complejas.
- Búsqueda de información: capaz de navegar y sintetizar resultados de búsqueda en contextos extensos.
- Ingeniería de software: generación, revisión y depuración de código, con soporte para tool calling.
- Investigación científica: análisis de literatura, formulación de hipótesis y síntesis de resultados.
- Investigación en IA: asistencia en diseño de experimentos, interpretación de modelos y revisión de papers.
- Multi-token prediction (MTP): genera varios tokens por paso, reduciendo latencia en inferencia.
- Modo "thinking" activable: genera cadenas de razonamiento explícitas antes de responder.
- Multimodal-general: según themodelverse, el modelo base acepta entradas multimodales (aunque no se detallan los tipos).

## Casos de uso

- Agente de búsqueda profunda: el modelo puede encadenar múltiples consultas a APIs de búsqueda, leer resultados y sintetizar un informe final, gracias a su capacidad de razonamiento de largo horizonte y su ventana de contexto amplia (aunque no especificada).
- Asistente de programación autónomo: integrado en un IDE o pipeline CI/CD, puede recibir issues, generar parches, ejecutar tests y corregir errores de forma iterativa usando tool calling.
- Investigador bibliográfico: dado un tema, el modelo consulta bases de datos académicas, extrae conclusiones clave y genera un resumen estructurado con referencias.
- Analista de datos científicos: procesa resultados experimentales, sugiere análisis estadísticos y redacta secciones de un paper.
- Chatbot técnico de soporte: con su modo thinking, puede diagnosticar problemas complejos de software o hardware y proporcionar soluciones paso a paso.
- Generación de documentación técnica: a partir de código fuente o especificaciones, produce manuales, guías de API y tutoriales con ejemplos ejecutables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento proviene del benchmark de oMLX, que muestra una ejecución en Apple M5 Max (40 núcleos) con TurboQuant KV 8-bit y MTP, pero sin métricas numéricas (latencia, throughput) en los resultados mostrados.

## Requisitos de hardware

- Tamaño del repositorio: 121.4 GB, lo que sugiere pesos en alta precisión (posiblemente BF16 o FP8) o una cuantización con poco factor de compresión.
- VRAM estimada: para una cuantización FP8, se necesitarían aproximadamente 36 GB de VRAM (considerando 36B parámetros × 1 byte). Con cuantización de 4 bits, podría reducirse a ~18 GB, pero no se confirma el tipo de cuantización oQ.
- GPU recomendadas: para inferencia en FP8, GPUs como A100 80GB, H100 80GB o RTX 4090 (24GB) no serían suficientes; se requeriría al menos 48GB (A6000, A40) o 80GB (A100/H100). Para cuantización de 4 bits, una RTX 4090 podría ser viable.
- Opciones de despliegue: al ser un modelo con safetensors, puede servirse con vLLM, SGLang (mencionado en themodelverse), o convertirse a GGUF para llama.cpp/Ollama. El benchmark de oMLX sugiere compatibilidad con MLX para Apple Silicon.
- Latencia y throughput: no disponibles. El uso de MTP y TurboQuant KV 8-bit debería mejorar la velocidad respecto al modelo base, pero no hay cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| BigBang-v1 (endless-frontier) | 36B (MoE) | 3B | no disponible | no disponible | Agéntico, multimodal, con MTP en esta variante |
| Qwen3-35B-A3B | 35B (MoE) | 3B | 128K (según Qwen) | Apache 2.0 | Modelo base, sin enfoque agéntico específico |
| DeepSeek-R1-Distill-Qwen-32B | 32B (dense) | 32B | 128K | MIT | Razonamiento reforzado, no MoE, sin MTP |

La comparativa es limitada porque no se dispone de benchmarks. BigBang-v1 se diferencia de Qwen3-35B-A3B por su orientación agéntica y la adición de MTP, mientras que DeepSeek-R1-Distill es un modelo denso con énfasis en razonamiento pero sin capacidades agénticas declaradas.

## Limitaciones y advertencias

- Sesgos conocidos: al derivar de Qwen3, puede heredar sesgos presentes en los datos de entrenamiento de Qwen, especialmente en contextos culturales y lingüísticos no occidentales.
- Riesgo de alucinación: como todo LLM, puede generar información falsa o inventada, especialmente en tareas de búsqueda y síntesis donde se espera precisión factual.
- Limitaciones de contexto: la longitud de contexto no está publicada; si es inferior a 128K, podría ser insuficiente para tareas de largo horizonte con muchos pasos intermedios.
- Restricciones de licencia: la licencia no está especificada en el repositorio, lo que impide determinar si es apto para uso comercial. Se recomienda contactar al autor antes de usarlo en producción.
- Falta de documentación: no hay información sobre el proceso de entrenamiento, datos utilizados ni evaluación de seguridad, lo que dificulta la auditoría del modelo.
- Requisitos de hardware elevados: el tamaño del repositorio (121.4 GB) implica que el despliegue en hardware de consumo es inviable sin cuantización adicional.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AmixDigital/BigBang-v1-mtp-oQ
- Modelo base (endless-frontier/BigBang-v1): https://huggingface.co/endless-frontier/BigBang-v1
- Modelos cuantizados de BigBang-v1: https://huggingface.co/models?other=base_model:quantized:endless-frontier/BigBang-v1
- Ficha en themodelverse: https://www.themodelverse.in/models/bigbang-v1
- Página en Ollama (smtek/BigBang-v1): https://ollama.com/smtek/BigBang-v1
- Benchmark en oMLX: https://omlx.ai/benchmarks/3usvtfc4
