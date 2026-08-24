# mradermacher/Qwen3.8-27B-Heretic-GGUF

## Resumen

Qwen3.8-27B-Heretic-GGUF es una colección de cuantizaciones GGUF del modelo base `asfgsdfg/Qwen3.8-27B-Heretic`, preparadas por mradermacher. Este modelo base es, a su vez, una versión "abliterated" del modelo Qwen3.8-27B, es decir, se le ha eliminado quirúrgicamente el comportamiento de rechazo o negativa a responder, dando lugar a un modelo etiquetado como "uncensored" (sin censura). El resultado es un modelo de lenguaje de aproximadamente 27 000 millones de parámetros que responde a preguntas que un modelo alineado normalmente declinaría.

La relevancia de este modelo reside en su naturaleza de "uncensored", que lo hace útil para investigar la seguridad de los sistemas de IA, estudiar el impacto de la eliminación de la alineación o para aplicaciones donde se requiere una respuesta sin restricciones. La cuantización GGUF permite su ejecución en hardware de consumo con distintas compensaciones entre tamaño y calidad. Se distribuye bajo licencia Apache-2.0, lo que facilita su uso comercial y académico.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base Qwen3.8-27B, sin detalles publicados) |
| Parámetros totales | 26.895.998.464 |
| Parámetros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (archivos .gguf) |

## Arquitectura y entrenamiento
No se dispone de información detallada sobre la arquitectura interna del modelo base (número de capas, tipo de atención, etc.). El modelo `Qwen3.8-27B-Heretic` es una versión "abliterated" de Qwen3.8-27B, lo que implica que se ha aplicado una técnica de eliminación de la capa de rechazo (refusal behavior) para que el modelo responda sin las restricciones de seguridad habituales. Este proceso se realiza a partir del modelo original mediante un procedimiento de modificación de pesos (ablación), no mediante un reentrenamiento completo.

El repositorio actual contiene únicamente archivos GGUF, generados mediante cuantización estática (sin matriz de importancia, según indica el autor). Se ofrecen múltiples niveles de cuantización (Q2_K a Q8_0) y también archivos `mmproj` (proyección multimodal), aunque no se especifica si el modelo base realmente soporta visión o audio.

## Capacidades
- Generación de texto y conversación en inglés.
- Capacidades de razonamiento y generación de código y matemáticas, presumiblemente heredadas del modelo base Qwen3.8-27B, aunque no se han publicado pruebas concretas.
- Al estar "abliterated", no presenta el comportamiento típico de rechazo ante solicitudes delicadas, lo que permite una generación sin filtros.
- Soporte de tool calling y funciones: no se ha documentado en la información proporcionada.
- No se ha especificado soporte para agentes o razonamiento multi-paso.

## Casos de uso
- Investigación en seguridad de IA: el modelo permite estudiar cómo se comporta un LLM sin alineación, lo que es útil para analizar riesgos y desarrollar mitigaciones.
- Generación de contenido creativo sin restricciones: escritura de ficción, guiones o diálogos en los que se necesita explorar temas sensibles sin auto-censura.
- Desarrollo de aplicaciones de chat personalizadas: al ser "uncensored", puede integrarse en asistentes donde el usuario espera respuestas directas sin avisos de seguridad.
- Evaluación de cuantizaciones: comparar el rendimiento de distintos niveles de GGUF (Q4_K_M, Q6_K, etc.) para determinar la mejor relación calidad/recursos.
- Pruebas de robustez: estudiar cómo un modelo "abliterated" maneja entradas adversarias o prompts que normalmente activarían los filtros de seguridad.
- Despliegue en entornos con recursos limitados: gracias a las cuantizaciones de baja precisión (Q2_K, Q3_K_M), es posible ejecutar el modelo en GPUs con 12 GB de VRAM.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información proporcionada. No se dispone de cifras de MMLU, HumanEval, GSM8K ni otras métricas estándar para este modelo específico. La evaluación de rendimiento queda a cargo del usuario, quien deberá ejecutar sus propias pruebas.

## Requisitos de hardware
- Los tamaños de archivo indican las necesidades de VRAM aproximadas:
  - Q2_K: 10,8 GB → se recomienda al menos 12 GB de VRAM.
  - Q3_K_M: 13,4 GB → al menos 15 GB de VRAM.
  - Q4_K_M: 16,6 GB → al menos 20 GB de VRAM (por ejemplo, RTX 4090 24 GB).
  - Q6_K: 22,2 GB → al menos 26 GB de VRAM (por ejemplo, A100 40 GB).
  - Q8_0: 28,7 GB → al menos 32 GB de VRAM (por ejemplo, A100 80 GB).
- GPU recomendadas: RTX 3090/4090 para cuantizaciones hasta Q4_K_M; A100, H100 o A6000 para Q6_K y Q8_0.
- En consumer GPU, la RTX 4090 puede ejecutar cómodamente Q4_K_M y Q6_K con contexto moderado.
- Despliegue: se puede usar con llama.cpp, Ollama, llama-cpp-python, y otros entornos compatibles con GGUF. No se recomienda vLLM (que espera pesos en formato safetensors).
- Latencia y throughput: no se han proporcionado datos específicos.

## Comparativa con modelos similares
No se dispone de información sobre modelos comparables dentro del mismo repositorio o contexto. No se han publicado comparaciones directas con otras variantes de Qwen3.8-27B (como la versión estándar o la versión "ara"). Se recomienda consultar los resultados de la comunidad para obtener datos comparativos.

## Limitaciones y advertencias
- El modelo es "uncensored" y puede generar contenido ofensivo, peligroso o ilegal en función del prompt. Su uso en producción requiere un sistema de moderación adicional.
- Al ser una cuantización GGUF, la calidad de las respuestas puede degradarse respecto al modelo original en precisión, especialmente en cuantizaciones bajas (Q2_K, Q3_K).
- Solo soporta el idioma inglés; no se ha validado su rendimiento en otros idiomas.
- No se ha documentado la longitud de contexto; es posible que el modelo base soporte hasta 1M de tokens, pero no se ha confirmado para esta versión.
- La licencia Apache-2.0 permite uso comercial, pero el usuario debe asumir la responsabilidad de los contenidos generados.
- La técnica "abliterated" puede eliminar también otras capacidades de seguridad, como el rechazo a preguntas de contenido sensible, lo que puede ser un riesgo en aplicaciones públicas.

## Enlaces
- [Modelo en Hugging Face (mradermacher/Qwen3.8-27B-Heretic-GGUF)](https://huggingface.co/mradermacher/Qwen3.8-27B-Heretic-GGUF)
- [Modelo base: asfgsdfg/Qwen3.8-27B-Heretic](https://huggingface.co/asfgsdfg/Qwen3.8-27B-Heretic)
- [Repositorio de cuantizaciones MLX para Qwen3.8-27B-Heretic](https://github.com/devrim-1283/qwen38-27b-heretic-mlx)
- [Análisis técnico de Qwen3.8-27B en un solo GPU](https://explore.n1n.ai/blog/qwen38-27b-single-gpu-million-context-2026-08-21)
