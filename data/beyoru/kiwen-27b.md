# beyoru/Kiwen-27B

## Resumen

Kiwen-27B es un ajuste fino del modelo Qwen3.8-27B de Alibaba, desarrollado por el usuario beyoru. Se entrenó sobre trazas de razonamiento de cadena de pensamiento (chain-of-thought) del modelo Kimi K3, con el objetivo específico de enseñar al modelo a terminar su deliberación interna y producir una respuesta final antes de agotar el presupuesto de generación. Este comportamiento es crítico en aplicaciones donde el tiempo de inferencia y la longitud de la respuesta son limitados, ya que Qwen3.8-27B puede agotar su ventana de generación sin emitir una conclusión.

El resultado es una mejora notable en benchmarks como GSM8K, con un incremento de +10,31 puntos porcentuales en extracción flexible y +6,07 en extracción estricta, así como pequeñas ganancias consistentes en IFEval y VMLU. No se observan regresiones fuera del dominio en pruebas de perplejidad sobre documentos empresariales vietnamitas. El modelo mantiene la arquitectura densa de 27.356 millones de parámetros y hereda el soporte multilingüe de su base (vietnamita, inglés y chino), además de una licencia Apache-2.0 que facilita su uso comercial.

Kiwen-27B es relevante para equipos que necesitan un modelo de razonamiento eficiente, especialmente en entornos productivos donde el coste de tokens y la latencia son críticos, sin renunciar a la calidad en tareas matemáticas y de instrucciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.8-27B) |
| Parámetros totales | 27.356.728.560 |
| Parámetros activos | no disponible (modelo denso) |
| Longitud de contexto | no disponible (hereda la del modelo base Qwen3.8-27B) |
| Tipos de cuantización | no disponible (distribuido en safetensors; se puede cuantizar con herramientas externas) |
| Idiomas soportados | vietnamita, inglés, chino |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Kiwen-27B se basa en Qwen3.8-27B, un modelo denso de 27.000 millones de parámetros con arquitectura Transformer estándar. El fine-tuning se realizó sobre trazas de cadena de pensamiento del modelo Kimi K3, con el objetivo de enseñar al modelo a finalizar su razonamiento y emitir una respuesta antes de agotar el presupuesto de tokens. No se ha publicado información sobre el tamaño del dataset ni el número de pasos de entrenamiento. No se menciona el uso de RLHF o DPO; se trata de un fine-tuning supervisado. Además, el modelo no incluye los tensores MTP (multi-token prediction), por lo que para decodificación especulativa se recomienda usar un modelo externo como z-lab/Qwen3.8-27B-DFlash2.

El pipeline declarado es `image-text-to-text`, aunque no se han proporcionado detalles sobre el entrenamiento específico de visión. Se recomienda verificar experimentalmente la capacidad de procesamiento de imágenes antes de usarlo en producción.

## Capacidades

- Razonamiento matemático avanzado: mejora significativa en GSM8K (84,38% en extracción flexible).
- Cumplimiento de instrucciones: mejora en IFEval (prompt-level strict 84,29%, loose 86,69%).
- Comprensión multilingüe en vietnamita, inglés y chino; se evaluó en VMLU (86,02%).
- Capacidad de razonamiento de cadena de pensamiento con terminación eficiente: aprende a parar antes de agotar el presupuesto.
- Generación de texto general y conversacional, aunque no se documentan capacidades específicas de tool calling o agentes.
- Aunque el pipeline es `image-text-to-text`, no hay evidencia de un entrenamiento específico en visión; se debe probar antes de asumir esa capacidad.

## Casos de uso

- **Atención al cliente automatizada multilingüe**: el modelo puede gestionar conversaciones en vietnamita, inglés y chino con razonamiento eficiente, reduciendo la latencia en entornos de alta demanda. Adecuado para sistemas de soporte en línea que requieren respuestas rápidas y coherentes.
- **Generación de código en producción**: gracias a su capacidad de razonamiento y a la mejora en terminación, puede integrarse en pipelines de CI/CD para generar fragmentos de código, explicaciones o correcciones sin gastar demasiados tokens.
- **Análisis de documentos legales**: el etiquetado "legal" sugiere que se ha probado en contextos jurídicos; puede resumir contratos, extraer cláusulas o responder preguntas sobre normativa en los idiomas soportados.
- **RAG empresarial**: el modelo se evaluó en documentos de contabilidad, CRM y cargas de trabajo RAG internas, mostrando una degradación mínima en perplejidad. Es útil para sistemas de respuesta basada en conocimiento interno.
- **Educación y tutoría matemática**: su rendimiento en GSM8K lo hace adecuado para resolver problemas matemáticos paso a paso, con una ventaja de que no se queda sin presupuesto antes de dar la solución final.
- **Asistentes de investigación**: puede sintetizar información científica y técnica en inglés, chino o vietnamita, aunque se recomienda verificar la exactitud en dominios especializados.

## Benchmarks y rendimiento

Los resultados publicados por el autor comparan el modelo base Qwen3.8-27B con Kiwen-27B bajo condiciones idénticas (1× H200, SGLang, BF16, KV cache FP8, `max_gen_toks=4096`):

| Benchmark | Qwen3.8-27B | Kiwen-27B | Delta |
|---|---|---|---|
| GSM8K exact_match (flexible) | 0,7407 | 0,8438 | +10,31 |
| GSM8K exact_match (strict) | 0,6672 | 0,7278 | +6,07 |
| IFEval prompt-level strict | 0,8226 | 0,8429 | +2,03 |
| IFEval prompt-level loose | 0,8447 | 0,8669 | +2,22 |
| IFEval instruction-level strict | 0,8393 | 0,8645 | +2,52 |
| IFEval instruction-level loose | 0,8537 | 0,8801 | +2,64 |
| VMLU val (744 preguntas vietnamitas de MMLU) | 83,47 | 86,02 | +2,55 |

Además, se realizó una prueba de regresión fuera de dominio sobre 100 documentos empresariales vietnamitas (contabilidad, CRM, RAG) midiendo la perplejidad por token (NLL): Qwen3.8-27B obtuvo 3,3390 y Kiwen-27B 3,3543, con una diferencia no significativa (t=1,65). No se han publicado comparativas con otros modelos de la misma categoría.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 54,8 GB (según LLM Explorer), lo que requiere una GPU de alta gama como H200, A100 (80 GB) o 2× RTX 4090 (24 GB cada una) con tensor parallelism.
- Con cuantización de 8 bits, el peso ocupa ~28 GB; con 4 bits, ~14 GB, lo que permite ejecutarlo en una RTX 4090 (24 GB) o similar.
- Se recomienda usar servidores de inferencia como vLLM, SGLang o TGI para el despliegue en producción.
- Para uso local, se puede usar llama.cpp o Ollama con archivos GGUF (aunque no se proporcionan oficialmente, se pueden generar).
- En el benchmark se usó 1× H200 con BF16 y KV cache FP8, obteniendo una mejora de velocidad de hasta +6,58 t en GSM8K (tiempo de generación reducido).

## Comparativa con modelos similares

No se dispone de datos de benchmarks de otros modelos de 27B comparables en la información proporcionada. La única comparación directa es con el modelo base Qwen3.8-27B, que ya se muestra en la sección anterior. Se recomienda consultar benchmarks públicos como OpenLLM Leaderboard para comparar con otros modelos densos de 27B (p. ej., Llama 3.1 27B, Qwen2.5-27B, etc.), pero no se puede hacer una tabla objetiva con los datos actuales.

## Limitaciones y advertencias

- El modelo no es "más fuerte" en general; su mejora principal es la terminación del razonamiento, no una mejora fundamental en la capacidad de razonamiento.
- Solo cubre tres idiomas (vietnamita, inglés, chino). No está entrenado para otros idiomas, aunque puede generar texto en otros por transferencia.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en dominios especializados como legal o técnico.
- No se han publicado resultados de evaluación de seguridad o sesgos.
- El modelo no incluye tensores MTP; para decodificación especulativa se debe usar un modelo draft externo, lo que puede afectar el rendimiento en entornos con muchos usuarios.
- La evaluación de VMLU puede estar contaminada (las respuestas están públicas), por lo que su puntuación absoluta debe interpretarse con cautela.
- No se ha verificado la capacidad de procesamiento de imágenes a pesar de declararse como `image-text-to-text`; se recomienda probar antes de usarlo en aplicaciones de visión.

## Enlaces

- [HuggingFace del modelo](https://huggingface.co/beyoru/Kiwen-27B)
- [Modelo base Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Modelo draft para decodificación especulativa](https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2)
- [Guía local de Qwen3.8-27B](https://linas.substack.com/p/qwen3-8-27b-local-guide) (aunque no específica para Kiwen, puede ser útil para el despliegue)
