# masakanomasaka/llm2026-qwen35-0.8b-ragsft

## Resumen

`llm2026-qwen35-0.8b-ragsft` es un ajuste fino (SFT mediante LoRA, con los pesos fusionados en el modelo final) del modelo base Qwen/Qwen3.5-0.8B, publicado por el usuario masakanomasaka. Se trata de un modelo de aproximadamente 873 millones de parámetros orientado a tareas de generación aumentada por recuperación (RAG) en japonés, desarrollado como proyecto final del curso "LLM講座2 2026". La estructura del modelo es idéntica a la del modelo base según indica el autor; únicamente cambian los pesos tras el entrenamiento supervisado.

El interés del modelo es acotado pero concreto: demuestra un flujo de trabajo de ajuste fino de bajo coste (entrenamiento realizado íntegramente en Google Colab) sobre un modelo pequeño, con datos de dominio japonés (JSQuAD/JGLUE y fragmentos de Wikipedia japonesa) y un formato pensado para usar resultados de búsqueda como contexto de entrada. Es relevante como referencia práctica para quienes quieran replicar pipelines de RAG con modelos de menos de 1.000 millones de parámetros, no como un modelo de propósito general.

La información publicada es muy limitada: no hay model card detallada, ni licencia declarada, ni idiomas etiquetados, ni resultados de benchmarks, ni pipeline asignado. La ficha refleja por tanto únicamente lo que puede verificarse a partir de los metadatos y del README del autor, marcando explícitamente como "no disponible" todo aquello que no se ha publicado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen/Qwen3.5-0.8B; el autor indica que la estructura es idéntica al modelo base) |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors; no se publican versiones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible en metadatos; los datos de entrenamiento son en japonés (JSQuAD/JGLUE y Wikipedia japonesa) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer decoder-only de aproximadamente 873 millones de parámetros. El autor afirma explícitamente que la arquitectura es la misma que la del modelo base: el ajuste se realizó con LoRA y posteriormente se fusionaron los adaptadores en los pesos, por lo que no hay cambios estructurales, ni cabezas adicionales, ni modificaciones en la tokenización.

El entrenamiento es un SFT (supervised fine-tuning) ejecutado íntegramente en Google Colab. Los datos empleados son dos conjuntos: por un lado, JSQuAD/JGLUE (licencia CC BY-SA 4.0), filtrado y reformateado para el entrenamiento; por otro, una colección de fragmentos distribuidos derivados de Wikipedia japonesa (también CC BY-SA 4.0), utilizados como resultados de búsqueda en la entrada durante el entrenamiento. No se documentan el número de tokens de entrenamiento, la composición exacta del dataset, hiperparámetros, ni si hubo fases de RLHF o DPO. Tampoco se describen innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto en japonés, con especialización en responder preguntas a partir de contexto recuperado (formato RAG).
- Extracción de respuestas sobre pasajes: el entrenamiento con JSQuAD (comprensión lectora extractiva) sugiere capacidad para localizar y reformular información contenida en el contexto proporcionado.
- Manejo de entradas con resultados de búsqueda concatenados, tal como se usaron durante el entrenamiento.
- Generación de texto general heredada del modelo base Qwen3.5-0.8B (no verificada ni documentada por el autor para este ajuste).
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no disponible; el entrenamiento es exclusivamente en japonés.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Respuesta a preguntas sobre documentación interna en japonés: el modelo está entrenado para recibir fragmentos de texto como contexto y producir una respuesta; encaja en un pipeline RAG donde un recuperador (por ejemplo, búsqueda BM25 o embeddings) selecciona pasajes de manuales y el modelo redacta la respuesta final.
- Búsqueda semántica con generación extractiva: al haber sido ajustado con JSQuAD, puede emplearse para localizar la frase exacta de un pasaje que responde a una consulta, útil en sistemas de soporte documental.
- Prototipado de asistentes en entornos con recursos limitados: con menos de 1.000 millones de parámetros, cabe en GPUs de consumo y permite iterar rápidamente sobre pipelines RAG antes de escalar a modelos mayores.
- Clasificación y reformateo de fragmentos de Wikipedia japonesa: el modelo puede usarse para resumir o reescribir pasajes recuperados antes de mostrarlos al usuario final.
- Evaluación comparativa de estrategias de ajuste fino: sirve como referencia reproducible (entrenamiento en Colab, LoRA fusionado) para experimentos académicos sobre SFT de modelos pequeños.
- Filtrado de contexto en sistemas de recuperación: dado un conjunto de fragmentos candidatos, el modelo puede seleccionar o condensar los relevantes antes de pasarlos a un modelo mayor, reduciendo coste de inferencia.
- Docencia y formación: como ejemplo de proyecto final de curso, es útil para demostrar el ciclo completo de preparación de datos, ajuste con LoRA y publicación en Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1,8 GB solo para pesos (873 M de parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, entre 2 y 4 GB según longitud de contexto y batch.
- VRAM estimada en cuantización de 8 bits: alrededor de 1 GB para pesos; en 4 bits, en torno a 0,5 GB para pesos (estimaciones teóricas, no verificadas por el autor, ya que no se publican cuantizaciones).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y en la mayoría de casos sobredimensionadas para este tamaño.
- Cabe en GPU de consumo: sí, con holgura, en modelos como RTX 3060 (12 GB), RTX 4060 Ti (16 GB) o RTX 4090 (24 GB).
- Opciones de despliegue: Transformers (PyTorch) de forma nativa al ser safetensors; vLLM y TGI son compatibles en principio con arquitecturas Qwen, pero no hay confirmación del autor para este checkpoint concreto; llama.cpp/Ollama requerirían convertir los pesos a GGUF, conversión no publicada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| llm2026-qwen35-0.8b-ragsft | 873 M | no disponible | no disponible | safetensors | Ajuste SFT en japonés para RAG; sin benchmarks publicados |
| Qwen/Qwen3.5-0.8B (base) | ~873 M | no disponible en esta ficha | no disponible en esta ficha | safetensors | Modelo base sin ajuste; capacidades generales |
| Alternativas de tamaño similar (p. ej. modelos <1 B para japonés) | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

La comparación cuantitativa con alternativas no es posible con los datos disponibles: no hay benchmarks publicados para este checkpoint ni se han proporcionado resultados del modelo base en esta información.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de rendimiento en MMLU, JGLUE, JSQuAD ni otras tareas, por lo que la calidad real del ajuste no puede verificarse.
- Licencia no declarada: no se especifica la licencia del checkpoint, lo que impide determinar si el uso comercial está permitido. El modelo base Qwen tiene sus propios términos, que deben consultarse por separado.
- Datos de entrenamiento con licencia CC BY-SA 4.0: JSQuAD/JGLUE y los fragmentos de Wikipedia japonesa imponen obligaciones de atribución y compartir-igual que pueden afectar a los pesos derivados; el autor no aclara cómo se gestiona esta obligación.
- Riesgo de alucinación: como cualquier modelo de 873 M de parámetros, la fidelidad al contexto puede degradarse con pasajes largos o consultas ambiguas; no hay evaluación de faithfulness publicada.
- Especialización estrecha: el entrenamiento se centra en japonés y en formato RAG; el rendimiento fuera de ese dominio (otros idiomas, código, matemáticas) no está documentado y probablemente sea inferior al del modelo base sin ajustar.
- Contexto máximo desconocido: no se indica la longitud de contexto soportada, lo que dificulta dimensionar el pipeline de recuperación.
- Sin cuantizaciones publicadas: no hay GGUF ni otros formatos listos para usar en llama.cpp u Ollama; habría que generarlos.
- Proyecto académico: desarrollado como trabajo final de curso, sin proceso de revisión ni mantenimiento declarado; la fecha de creación (2026-11-26) y la ausencia de descargas o likes indican que no ha sido validado por la comunidad.
- Idiomas no etiquetados en los metadatos: la ausencia de la etiqueta `language` en Hugging Face puede provocar que herramientas de filtrado no lo detecten como modelo japonés.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/masakanomasaka/llm2026-qwen35-0.8b-ragsft
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- JSQuAD / JGLUE: https://github.com/yahoojapan/JGLUE
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
