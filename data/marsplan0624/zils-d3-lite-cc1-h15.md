# marsplan0624/zils-d3-lite-cc1-h15

## Resumen

`zils-d3-lite-cc1-h15` es un modelo de decisión publicado por el usuario marsplan0624 en Hugging Face, construido como un fine-tune sobre `Qwen/Qwen3.5-0.8B`. No se trata de un modelo conversacional al uso: el autor lo describe como un "body" (cuerpo de pesos) para el pool `d3-lite` de la plataforma Zils, una iniciativa orientada a entrenar modelos pequeños que clasifican, puntúan o priorizan solicitudes a partir de ejemplos etiquetados con resultados reales. El repositorio contiene únicamente los pesos, sin capa de respuesta ni código de ejecución.

El modelo parte de la arquitectura y los pesos de Qwen3.5-0.8B (852.985.920 parámetros según los safetensors publicados) y le aplica un fine-tune con un LoRA de rango 16 sobre las capas de lenguaje, fusionado posteriormente en los pesos. Los datos de entrenamiento provienen de preguntas de decisión públicas etiquetadas por desenlaces reales: reversiones y revisiones de Wikipedia, categorías de arXiv, resultados de Stack Exchange y merges de Gerrit.

Su relevancia es acotada pero específica: ejemplifica el patrón de "modelos de decisión" ligeros, empaquetados como componentes de un runtime propietario, que no se pueden usar de forma autónoma con las herramientas estándar de inferencia. La licencia es Apache 2.0, aunque la model card restringe explícitamente el uso a través del runtime fijado del pool.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-0.8B); no se detalla la configuracion exacta |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors sin variantes GGUF/ONNX publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del transformer de `Qwen/Qwen3.5-0.8B`, del que también toma el layout de pesos. Sobre esa base, el autor aplicó un fine-tune con un LoRA de rango 16 en las capas de lenguaje, posteriormente fusionado en los pesos finales. La model card menciona que se conservan "the full language and vision weights", lo que sugiere que el modelo base incorpora torre de visión, aunque no se aportan detalles sobre cómo se entrena o utiliza esa parte.

El entrenamiento se realizó al estilo "Zils Outcomes": preguntas de decisión públicas etiquetadas con desenlaces verificables (reversiones y revisiones de Wikipedia, categorías de arXiv, resultados de Stack Exchange, merges de Gerrit). No se especifican el número de tokens, la composición exacta del dataset, ni si hubo etapas de RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Clasificación y puntuación de decisiones: el modelo está diseñado para ordenar solicitudes, marcar problemas o puntuar coincidencias a partir de ejemplos, no para generar texto libre.
- Evaluación de resultados binarios o categóricos: entrenado con desenlaces reales (aceptado/rechazado, merge/revert, categoría correcta).
- Procesamiento de lenguaje y visión: hereda del base Qwen3.5-0.8B los pesos de lenguaje y visión, aunque no se documenta el uso multimodal.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo es un componente de decisión, no un agente.
- Capacidades multilingües: no disponibles; no se especifican idiomas.
- Modo "thinking": no disponible.

## Casos de uso

- Moderación de contribuciones en wikis: el modelo puede puntuar si una edición será revertida, entrenado con reversiones reales de Wikipedia, integrándose en un pipeline de revisión previa a la publicación.
- Triaje de preguntas en foros técnicos: clasificar preguntas de Stack Exchange por probabilidad de obtener respuesta aceptada o de ser cerradas, útil para enrutar a moderadores o a colas de revisión.
- Asignación de categorías en preprints: predecir la categoría de arXiv de un manuscrito a partir de su texto, como paso de validación en sistemas de envío.
- Priorización de cambios de código en Gerrit: estimar la probabilidad de que un cambio sea fusionado (merge) para ordenar la cola de revisión de un equipo.
- Filtrado de solicitudes en atención al cliente: usar el modelo como clasificador de urgencia o categoría sobre tickets, siguiendo el patrón de Zils de "sort requests, flag problems, or score matches".
- Investigación sobre modelos de decisión pequeños: servir como referencia para estudiar el equilibrio entre tamaño (0,85B parámetros) y rendimiento en tareas de clasificación con etiquetas de resultado real.
- Componente en un sistema de recomendación de contenido: puntuar candidatos según probabilidad de aceptación, reutilizando el patrón de scoring del pool d3-lite.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 852.985.920 parámetros en fp16, aproximadamente 1,7 GB de pesos; en fp32, unos 3,4 GB; en cuantización de 8 bits, alrededor de 0,9 GB (estimación teórica, no confirmada por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16; una RTX 3060, RTX 4060 o superior es suficiente. Para despliegues por lotes, A10G, L4 o A100.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 4 GB o más, siempre que se pueda cargar el runtime adecuado.
- Opciones de despliegue: el autor indica que los pesos solo son utilizables a través del runtime fijado del pool; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| zils-d3-lite-cc1-h15 | 852.985.920 | no disponible | Apache 2.0 | Pesos en HF, uso restringido al runtime del pool |
| Qwen/Qwen3.5-0.8B (base) | ~0,8B | no disponible | no disponible | Pesos en HF, uso general |
| Otros modelos de decisión pequeños de Zils (pool d3-lite) | no disponible | no disponible | no disponible | Pesos en HF, uso restringido |

No se dispone de datos de rendimiento comparativo entre estos modelos. La comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Uso restringido: la model card indica que los pesos solo son utilizables a través del runtime fijado del pool; no hay capa de respuesta ni código de ejecución en el repositorio, por lo que no se puede usar directamente con herramientas estándar.
- Sin datos de benchmarks: no hay evidencia publicada de rendimiento en MMLU, HumanEval, GSM8K ni en las tareas de decisión para las que fue entrenado.
- Sesgos desconocidos: al entrenarse con desenlaces de Wikipedia, arXiv, Stack Exchange y Gerrit, puede heredar sesgos de esas comunidades (por ejemplo, sesgo hacia decisiones de moderadores experimentados o hacia categorías sobrerrepresentadas).
- Riesgo de alucinación: no evaluado; al ser un modelo de clasificación, el riesgo se traslada a falsos positivos o negativos en la puntuación.
- Idiomas: no se especifican; se desconoce si el fine-tune conserva el multilingüismo del base.
- Contexto: no se documenta la longitud máxima de contexto, lo que impide planificar su uso en documentos largos.
- Licencia: aunque es Apache 2.0, la restricción de uso al runtime del pool puede limitar el uso comercial autónomo; conviene verificar los términos de Zils antes de integrarlo en producción.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; el modelo se publicó y actualizó el mismo día (2026-11-06), lo que sugiere un artefacto experimental sin validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/marsplan0624/zils-d3-lite-cc1-h15
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Zils: https://zils.ai/
- Organización Zils en Hugging Face: https://huggingface.co/zils-ai/models
