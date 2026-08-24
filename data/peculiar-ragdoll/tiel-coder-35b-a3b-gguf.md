# peculiar-ragdoll/Tiel-Coder-35B-A3B-GGUF

## Resumen

Tiel-Coder-35B-A3B-GGUF es una cuantización dinámica del modelo Ornith-1.5-35B-A3B, desarrollada por el usuario peculiar-ragdoll. Ornith-1.5 es a su vez una variante del modelo Qwen3.6-35B-A3B, un modelo de mezcla de expertos (MoE) con arquitectura híbrida SSM/atención. Tiel está diseñado específicamente para tareas de codificación agéntica y conversaciones multi-turno largas, sacrificando deliberadamente rendimiento en tareas de conocimiento general y razonamiento académico a cambio de respuestas más cortas y eficientes.

El modelo se distribuye únicamente en formato GGUF, con nueve niveles de cuantización que van desde 12,3 GB hasta 38,5 GB, lo que permite ejecutarlo en GPUs de consumo desde 16 GB de VRAM. Incorpora un "Sharp chat template" incrustado en el GGUF que reduce la verbosidad de las respuestas, y elimina el bloque MTP (multi-token prediction) de Ornith-1.5 por estar inicializado aleatoriamente y no aportar valor. En pruebas de SWE-bench-Live, Tiel resuelve 12 de 25 problemas, igualando a Opus 4.6 medium y superando a su propio modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida SSM/atención con 2 cabezas KV |
| Parametros totales | 34.660.610.688 |
| Parametros activos | 3 mil millones (según nomenclatura A3B) |
| Longitud de contexto | no especificado |
| Tipos de cuantizacion | Q2_K_XL, IQ3_XXS, Q3_K_XL, IQ4_XS, Q4_K_S, Q4_K_XL, Q5_K_XL, Q6_K_XL, Q8_K_XL |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

Tiel-Coder es una re-cuantización dinámica de Ornith-1.5-35B-A3B, que a su vez deriva de Qwen3.6-35B-A3B. La arquitectura combina mecanismos de atención con capas SSM (state space model) en una configuración MoE con solo 2 cabezas KV, lo que reduce drásticamente el coste de la caché de contexto en comparación con un modelo denso del mismo tamaño. El autor aplicó su propia matriz de importancia (imatrix) para la cuantización y sustituyó la plantilla de chat original por la "Sharp chat template", diseñada para producir respuestas más concisas.

El bloque MTP (nextn) presente en Ornith-1.5 fue eliminado porque sus pesos estaban inicializados aleatoriamente (desviación estándar 0,020, kurtosis 3,00), lo que indica que nunca fue entrenado. El autor verificó que su eliminación no cambia ninguna salida. No se dispone de información sobre el dataset de entrenamiento original de Ornith-1.5 ni sobre el proceso de alineación (RLHF/DPO), ya que Tiel es una cuantización y no un fine-tuning.

## Capacidades

- Generación de texto y código con enfoque en tareas de codificación agéntica.
- Corrección de errores en repositorios reales: resuelve 12 de 25 problemas en SWE-bench-Live.
- Conversaciones multi-turno largas: obtiene 67,2 en Claw-Eval, superando a su base (65,3) y a Nail (60,5).
- Respuestas concisas gracias al Sharp chat template, que reduce la verbosidad.
- Eficiencia de contexto: al tener solo 2 cabezas KV, la caché crece mucho menos que en modelos densos equivalentes.
- Soporte de agentes y razonamiento multi-paso, evidenciado por su rendimiento en SWE-bench-Live.
- Multilingüe limitado a inglés y chino.
- No incluye capacidades de visión ni audio.

## Casos de uso

- Desarrollo de software asistido por IA: Tiel puede integrarse en editores o CLIs para sugerir correcciones de código, refactorizaciones y parches. Su rendimiento en SWE-bench-Live (12/25) lo sitúa a la par de Opus 4.6 medium, con la ventaja de ejecutarse localmente.
- Agentes autónomos de resolución de incidencias: en pipelines de CI/CD, el modelo puede analizar issues, generar parches y validarlos, con un tiempo medio por intento de 12,3 minutos y una mediana de 8,6, lo que lo hace adecuado para iteraciones rápidas.
- Asistentes de conversación técnica prolongada: su puntuación de 67,2 en Claw-Eval indica que mantiene coherencia y utilidad en diálogos largos, ideal para soporte técnico o tutorías de programación.
- Generación de documentación técnica: aunque no es su punto fuerte, puede redactar comentarios, docstrings y resúmenes de cambios de código con un estilo conciso.
- Análisis de código legacy: su capacidad para trabajar con contextos largos (gracias a las 2 cabezas KV) permite procesar archivos extensos y entender dependencias entre módulos.
- Prototipado rápido de herramientas de línea de comandos: al ejecutarse con llama.cpp, puede desplegarse en entornos sin GPU dedicada (con cuantizaciones pequeñas) para tareas de autocompletado o generación de scripts.

## Benchmarks y rendimiento

| Benchmark | Tiel-Coder (4-bit) | Ornith-1.5 (base) | Nail (4-bit) | Qwen3.6-35B-A3B (stock) |
|---|---|---|---|---|
| SWE-bench-Live (25 problemas) | 12 resueltos | 8 resueltos | 9 resueltos | 8 resueltos |
| Claw-Eval multi-turn (114 conversaciones) | 67,2 | 65,3 | 60,5 | no disponible |
| MMLU-Pro | 73,7 | 78,0 | 84,0 | 85,3 |

Tiempo por intento en SWE-bench-Live: mediana 8,6 minutos, media 12,3 minutos (frente a Nail: mediana 7,2, media 15,7). El autor indica que la diferencia de 4,3 puntos en MMLU-Pro respecto a Ornith-1.5 se debe al Sharp template, que prioriza respuestas cortas sobre precisión académica.

## Requisitos de hardware

- VRAM mínima: 16 GB para las cuantizaciones Q2_K_XL (12,3 GB) e IQ3_XXS (13,2 GB), recomendada IQ3_XXS por mejor calidad.
- 24 GB de VRAM: Q3_K_XL (16,8 GB), IQ4_XS (17,7 GB), Q4_K_S (20,9 GB) y Q4_K_XL (22,4 GB). Q4_K_XL es la opción recomendada por el autor.
- 32 GB de VRAM: Q5_K_XL (26,6 GB).
- 48 GB de VRAM: Q6_K_XL (31,8 GB) y Q8_K_XL (38,5 GB).
- GPUs compatibles: cualquier GPU con soporte CUDA o Metal (Apple Silicon) que cumpla la VRAM requerida. En 16 GB caben tarjetas como RTX 4060 Ti o RTX 4070; en 24 GB, RTX 3090/4090; en 32 GB, RTX 4090 o A6000.
- Despliegue: llama.cpp (llama-server), compatible con vLLM, Ollama y TGI mediante conversión de GGUF.
- Latencia: no se proporcionan cifras exactas, pero el autor destaca que el contexto es "más barato" que en modelos densos equivalentes gracias a las 2 cabezas KV.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SWE-bench-Live | MMLU-Pro | Licencia |
|---|---|---|---|---|---|
| Tiel-Coder-35B-A3B | 35B totales, 3B activos | no especificado | 12/25 | 73,7 | MIT |
| Nail-Qwen3.6-35B-A3B | 35B totales, 3B activos | no especificado | 9/25 | 84,0 | Apache-2.0 |
| Dirk-Qwen3.8-27B | 27B densos | no especificado | 15/25 | no disponible | no disponible |
| Ornith-1.5-35B-A3B | 35B totales, 3B activos | no especificado | 8/25 | 78,0 | MIT |

Nail es la alternativa de la misma familia orientada a razonamiento y conocimiento, con mejor MMLU-Pro pero peor conversación. Dirk es un modelo denso de 27B que resuelve más problemas de SWE-bench-Live pero a menor velocidad (2,5x más lento que Tiel según el autor).

## Limitaciones y advertencias

- Rendimiento pobre en tareas de conocimiento general y razonamiento académico: MMLU-Pro de 73,7, muy por debajo de Nail (84,0) y de Qwen3.6-35B-A3B (85,3).
- El Sharp template prioriza respuestas cortas, lo que puede degradar la calidad en tareas que requieren explicaciones detalladas o razonamiento extenso.
- Solo soporta inglés y chino; no hay soporte para otros idiomas.
- No incluye cabezal MTP, por lo que la decodificación especulativa no está disponible.
- La cuantización Q2_K_XL pierde precisión notablemente; se recomienda IQ3_XXS como mínimo.
- No se han publicado resultados de benchmarks en la información disponible más allá de los tres mencionados; falta validación en tareas como HumanEval, GSM8K o MMLU completo.
- El modelo está pensado para codificación agéntica y conversación; no es adecuado como modelo generalista.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/peculiar-ragdoll/Tiel-Coder-35B-A3B-GGUF)
- [Ornith-1.5-35B-A3B (modelo base)](https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B)
- [Nail-Qwen3.6-35B-A3B-GGUF (modelo hermano)](https://huggingface.co/peculiar-ragdoll/Nail-Qwen3.6-35B-A3B-GGUF)
- [Dirk-Qwen3.8-27B-GGUF (modelo denso de la misma familia)](https://huggingface.co/peculiar-ragdoll/Dirk-Qwen3.8-27B-GGUF)
- [Qwen-Sharp-Chat-Templates](https://huggingface.co/peculiar-ragdoll/Qwen-Sharp-Chat-Templates)
