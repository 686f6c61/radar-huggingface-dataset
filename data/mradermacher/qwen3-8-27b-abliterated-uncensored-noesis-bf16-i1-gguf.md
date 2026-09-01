# mradermacher/Qwen3.8-27B-Abliterated-Uncensored-NOESIS-BF16-i1-GGUF

## Resumen

El modelo `mradermacher/Qwen3.8-27B-Abliterated-Uncensored-NOESIS-BF16-i1-GGUF` es una cuantización GGUF con matriz de importancia (imatrix) del modelo base `AMAImedia/Qwen3.8-27B-Abliterated-Uncensored-NOESIS-BF16`, creada por el usuario mradermacher. Se trata de una versión "abliterada" (eliminación de los mecanismos de rechazo) y "uncensored" del modelo Qwen3.8-27B, orientada a la investigación en seguridad de IA y al red teaming. El repositorio contiene únicamente el quant i1-Q2_K de 11 GB y el archivo imatrix, aunque el autor indica que existen más cuantizaciones en un repositorio estático asociado.

El modelo base es un transformer de 27 320 millones de parámetros, con soporte de visión (según la model card) y predicción multi-token (MTP), bajo licencia Apache 2.0. Esta cuantización concreta está pensada para ejecutarse en entornos con recursos limitados mediante llama.cpp u otros motores compatibles con GGUF. No se han publicado resultados de benchmarks en la información disponible, y el repositorio no incluye métricas de rendimiento propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.8, sin detalles adicionales) |
| Parametros totales | 27 320 697 856 (27,3 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (fuentes externas sugieren 262 000 tokens, pero no confirmado en la model card) |
| Tipos de cuantizacion | i1-Q2_K (en este repo); otros quants (Q2_K, IQ3_M, Q4_K_S, etc.) disponibles en el repositorio estático |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado desde safetensors BF16) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna ni el proceso de entrenamiento en la model card de este repositorio. El nombre del modelo y los tags (`qwen3_5`, `qwen3_8`, `bf16`, `mtp`) indican que se basa en la familia Qwen3.8, probablemente con una arquitectura transformer estándar y predicción multi-token (MTP). El modelo base ha sido sometido a un proceso de "abliteración" que elimina los rechazos de seguridad, y posteriormente cuantizado con imatrix para mejorar la calidad de la cuantización. No se especifican los datos de entrenamiento, el número de tokens ni si se aplicaron técnicas como RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento en inglés.
- Soporte de visión (según la model card: "This is a vision model"), aunque los archivos mmproj se encuentran en el repositorio estático.
- Predicción multi-token (MTP) según los tags.
- Capacidad de "thinking" y tool calling, según fuentes externas (blogs y repositorios similares), aunque no está confirmado en la model card.
- Comportamiento "uncensored": no aplica rechazos por contenido sensible, lo que lo hace útil para investigación en seguridad de IA.

## Casos de uso

- Investigación en seguridad de IA: el modelo permite estudiar cómo se comporta un LLM sin restricciones de contenido, facilitando el análisis de sesgos, alucinaciones y respuestas a entradas maliciosas.
- Red teaming: se puede utilizar para generar ataques de prompt injection o evaluar la robustez de otros sistemas frente a contenido no filtrado.
- Evaluación de abliteración: comparar el comportamiento de este modelo con la versión original de Qwen3.8-27B para medir el impacto de la eliminación de rechazos.
- Generación de texto creativo sin censura: útil para proyectos de escritura experimental o generación de diálogos en contextos donde no se requieren filtros de seguridad.
- Pruebas de cuantización: al ser un quant i1-Q2_K, sirve para evaluar la degradación de calidad en tareas de razonamiento y generación frente a versiones de mayor precisión.
- Despliegue en entornos con recursos limitados: con 11 GB de pesos, puede ejecutarse en GPUs de consumo medio (12-16 GB) mediante llama.cpp u Ollama, permitiendo experimentar con un modelo de 27B en hardware asequible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras métricas para este modelo o su base.

## Requisitos de hardware

- El archivo i1-Q2_K pesa 11,0 GB, por lo que se necesita al menos 12-16 GB de VRAM para cargarlo en memoria (dependiendo del contexto y del overhead del motor de inferencia).
- GPU recomendadas: RTX 3090, RTX 4090, A100 (16 GB o más), o cualquier GPU con suficiente VRAM.
- Es posible ejecutarlo en CPU con llama.cpp, aunque con mayor latencia.
- Motores compatibles: llama.cpp, Ollama, LM Studio, text-generation-webui, entre otros.
- No se dispone de datos de latencia o throughput estimados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Abliterated-Uncensored-NOESIS-BF16 (este) | 27,3 B | No disponible (262K según fuentes externas) | Apache 2.0 | GGUF (i1-Q2_K) | Cuantización con imatrix, visión, MTP |
| mradermacher/Qwen3.8-27B-OBLITERATED-GGUF | 27,3 B | No disponible | Apache 2.0 | GGUF | Otra variante abliterada, sin i1 |
| mradermacher/Qwen3.8-27B-Uncensored-Heretic-Abliterated-GGUF | 27,3 B | No disponible | Apache 2.0 | GGUF | Variante "heretic" abliterada |

No se dispone de datos de rendimiento comparativo entre estas variantes.

## Limitaciones y advertencias

- Al ser un modelo "uncensored", puede generar contenido ofensivo, violento, sexual o ilegal. No debe desplegarse en producción sin supervisión humana y filtros adicionales.
- La abliteración puede eliminar también mecanismos de seguridad útiles, aumentando el riesgo de alucinaciones o respuestas dañinas.
- El quant i1-Q2_K es de baja precisión (2 bits), lo que puede degradar significativamente la calidad del texto generado en comparación con cuantizaciones superiores.
- La licencia Apache 2.0 permite uso comercial, pero el uso indebido del modelo puede tener implicaciones legales y éticas.
- No se han publicado evaluaciones de sesgos ni de robustez para esta versión cuantizada.
- El modelo solo está etiquetado para inglés; su rendimiento en otros idiomas no está garantizado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Qwen3.8-27B-Abliterated-Uncensored-NOESIS-BF16-i1-GGUF
- Repositorio estático con más quants: https://huggingface.co/mradermacher/Qwen3.8-27B-Abliterated-Uncensored-NOESIS-BF16-GGUF
- Modelo base: https://huggingface.co/AMAImedia/Qwen3.8-27B-Abliterated-Uncensored-NOESIS-BF16
- Repositorio similar (OBLITERATED): https://huggingface.co/mradermacher/Qwen3.8-27B-OBLITERATED-GGUF
- Repositorio similar (Heretic): https://huggingface.co/mradermacher/Qwen3.8-27B-Uncensored-Heretic-Abliterated-GGUF
- Blog sobre abliteración de Qwen3.8-27B: https://www.mindstudio.ai/blog/qwen3-8-27b-aeon-uncensored-abliteration
- Blog sobre GGUF uncensored: https://www.orcarouter.ai/blog/qwen-3-8-27b-uncensored-gguf
- Modelo en Ollama: https://ollama.com/orcarouter/Qwen3.8-27B-Uncensored
