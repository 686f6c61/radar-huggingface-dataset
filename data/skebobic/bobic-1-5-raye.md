# Skebobic/Bobic-1.5-Raye

## Resumen

Bobic-1.5-Raye es un modelo de lenguaje pequeño (SLM) de 125,86 millones de parámetros desarrollado por Skebobic. Se presenta como el modelo insignia de la serie Bobic y está diseñado para generación de texto en inglés y ruso con un enfoque explícito en la reducción de alucinaciones conversacionales y en el anclaje aritmético de dígitos. Su arquitectura es un transformer decoder-only con optimizaciones modernas: Grouped-Query Attention (GQA), SwiGLU, RMSNorm, RoPE y un adaptador propietario denominado NumberHead.

El modelo resulta relevante por su tamaño reducido, que permite inferencia en CPU, iGPU y GPUs de gama baja, y por su licencia MIT, que facilita uso comercial sin restricciones. El autor declara una tasa de alucinación del 21,4% en su propio benchmark interno, reducida desde el 71,4%, y un 100% de acierto en pruebas de grounding aritmético simple. No obstante, sus resultados en MMLU-Pro son modestos: 20,00% de precisión, por encima del azar (~10%) pero lejos de modelos de mayor tamaño.

La información disponible no especifica la longitud de contexto, el número de tokens de entrenamiento ni la composición exacta del dataset. Tampoco se documentan capacidades de tool calling, agentes, visión, audio o generación de código.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con GQA, SwiGLU, RMSNorm, RoPE y NumberHead |
| Parametros totales | 125.864.448 (125,86 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el repositorio incluye la etiqueta gguf, pero no se detallan los tipos |
| Idiomas soportados | Inglés (en), ruso (ru) |
| Licencia | MIT |
| Formato de pesos | safetensors (metadatos de HuggingFace), PyTorch .pt (quickstart), GGUF (etiqueta) |
| Capas | 16 |
| Hidden size | 768 |
| Atención | GQA (12 Q-heads, 4 KV-heads, head_dim=64) |
| FFN intermedio | 2048 (SwiGLU) |
| Embeddings posicionales | RoPE, base=10.000 |
| Normalización | RMSNorm |
| Cabeza de salida | Untied, vocab=16.384 |
| Precisión | bfloat16 / float32 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de 16 capas con hidden size de 768. Usa Grouped-Query Attention con 12 cabezas de consulta y 4 cabezas de clave-valor, lo que reduce el coste de memoria y latencia del KV-cache. La red feed-forward tiene 2048 dimensiones intermedias y emplea SwiGLU. La normalización es RMSNorm y las embeddings posicionales son rotatorias (RoPE) con base 10.000. La cabeza de salida no está atada a las embeddings de entrada y el vocabulario tiene 16.384 tokens.

La innovación destacada es NumberHead, un adaptador posicional intra-número que inyecta vectores de magnitud y valor posicional directamente en los estados ocultos de los tokens de dígitos, con el objetivo de eliminar confusión aritmética multi-dígito. El autor indica que el modelo fue post-entrenado con datasets específicos de alineación anti-alucinación y factual. No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si se usaron técnicas como RLHF o DPO.

## Capacidades

- Generación de texto en inglés y ruso.
- Razonamiento académico limitado: 20,00% de precisión en MMLU-Pro.
- Grounding aritmético de dígitos: 100% en pruebas internas con operaciones como 2+2=4, 5+5=10 y 10-4=6.
- Rechazo de afirmaciones falsas: verificado en pruebas internas con ejemplos como "2+2=5 es falso" y "los elefantes no pueden volar".
- Consistencia conversacional: 78,6% en el benchmark interno del autor.
- Reducción de alucinaciones: 21,4% de tasa de fallo, frente al 71,4% declarado antes de la alineación.
- Capacidades multilingües limitadas a inglés y ruso.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades de visión, audio, modo thinking ni generación de código.

## Casos de uso

- Chatbots de soporte de nivel 1 en inglés o ruso: el modelo puede gestionar interacciones breves y preguntas frecuentes con una tasa de alucinación declarada del 21,4%, siempre que se aplique supervisión humana y se limiten las respuestas a dominios acotados.
- Asistentes locales embebidos: al requerir menos de 1 GB de VRAM en bfloat16, puede integrarse en aplicaciones de escritorio, dispositivos IoT o entornos sin GPU dedicada.
- Prácticas de aritmética básica: gracias a NumberHead, es adecuado para tareas simples de suma y resta con números pequeños, como demuestran sus pruebas internas de grounding aritmético al 100%.
- Evaluación educativa de conocimiento científico: con un 20,00% en MMLU-Pro, puede usarse como generador de preguntas o respuestas de nivel introductorio en biología, psicología o economía, con revisión posterior.
- Prototipado de pipelines de generación de texto: su licencia MIT y su tamaño reducido permiten experimentar con arquitecturas GQA y SwiGLU sin costes elevados de infraestructura.
- Generación de respuestas cortas para foros o FAQ en ruso o inglés: la longitud de contexto no está especificada, por lo que conviene limitar las interacciones a pocos turnos.
- Investigación en alineación anti-alucinación: permite comparar la tasa de fallo del 21,4% con el baseline interno del 71,4% y estudiar el efecto de NumberHead en tareas numéricas.
- Despliegue en edge computing: si se dispone de una cuantización GGUF compatible, puede ejecutarse en dispositivos con recursos muy limitados, incluso en CPU.

## Benchmarks y rendimiento

Los siguientes datos son declarados por el autor del modelo y no han sido verificados de forma independiente (`verified: false`).

| Benchmark | Metrica | Valor |
|---|---|---|
| MMLU-Pro | Accuracy | 20,00% (120/600) |
| MMLU-Pro (baseline aleatorio) | Accuracy | ~10,00% |
| Consistencia conversacional | Overall consistency score | 78,6% |
| Alucinación / fallo | Hallucination rate | 21,4% (reducido desde 71,4%) |
| Grounding aritmético | Accuracy | 100,0% |
| Sentido común y hechos | Accuracy | 75,0% |
| Identidad y rol | Accuracy | 100,0% |
| Rechazo de afirmaciones falsas | Verificación | Verificado |

Desglose por disciplina en MMLU-Pro:

| Disciplina | Accuracy |
|---|---|
| Biología | 43,3% |
| Psicología | 40,0% |
| Economía | 28,6% |
| Ingeniería | 27,3% |
| Historia | 22,7% |
| Derecho | 21,9% |
| Filosofía | 18,2% |
| Química | 17,6% |
| Física | 12,5% |

El autor indica que la evaluación se realizó sobre una muestra de 600 preguntas con 10 opciones (A–J) y que abarca 14 disciplinas científicas, aunque solo detalla 9 en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16, los pesos ocupan aproximadamente 0,25 GB; en float32, aproximadamente 0,50 GB. El KV-cache es de unos 16 KB por token en bfloat16 (16 capas, 4 KV-heads, head_dim=64, K y V). Para 2.048 tokens serían unos 32 MB y para 8.192 tokens unos 128 MB.
- GPU recomendadas: no se requiere una GPU de datacenter. Cualquier GPU con más de 1 GB de VRAM libre es suficiente, incluidas GTX 1050, RTX 3060, RTX 4090, A100 o H100. El modelo también puede ejecutarse en CPU e iGPU.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer moderna e incluso en gráficas integradas.
- Opciones de despliegue: PyTorch con el código personalizado `model.py` y pesos `.pt`. Si existe una cuantización GGUF compatible, podría ejecutarse con llama.cpp u Ollama. No se garantiza compatibilidad con vLLM o TGI debido a la arquitectura personalizada NumberHead.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

No se han proporcionado datos de benchmarks ni especificaciones de modelos alternativos en la información disponible. La model card no incluye comparaciones con otros SLM. Como referencia, el propio autor indica que el baseline aleatorio de MMLU-Pro con 10 opciones es aproximadamente 10,00%, frente al 20,00% obtenido por Bobic-1.5-Raye.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Bobic-1.5-Raye | 125,86 M | No disponible | MIT | HuggingFace |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Tamaño muy reducido: 125,86 millones de parámetros limitan su capacidad para tareas complejas de razonamiento, comprensión lectora o generación extensa.
- MMLU-Pro de 20,00%: está por encima del azar, pero muy lejos de modelos de mayor escala. No es adecuado para usos que exijan alta precisión académica.
- Alucinación declarada del 21,4%: aunque el autor la presenta como una mejora frente al 71,4%, sigue siendo una tasa elevada para producción sin supervisión.
- Benchmark no verificado: el resultado de MMLU-Pro figura con `verified: false`, por lo que debe tomarse como dato declarado por el autor.
- Longitud de contexto no especificada: no se puede garantizar un rendimiento estable en conversaciones largas o documentos extensos.
- Idiomas limitados: solo inglés y ruso. No se documenta soporte de español ni de otros idiomas.
- Sin soporte documentado de tool calling, function calling, agentes, visión, audio, modo thinking o generación de código.
- Arquitectura personalizada: NumberHead y el código `model.py` pueden requerir adaptaciones para funcionar con servidores de inferencia estándar como vLLM o TGI.
- Datos de entrenamiento no disponibles: no se conocen la composición del dataset ni los posibles sesgos, lo que dificulta evaluar riesgos éticos o de representación.
- Licencia MIT: permite uso comercial, pero se ofrece sin garantías ni soporte. El autor no se responsabiliza de posibles fallos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- https://huggingface.co/Skebobic/Bobic-1.5-Raye
- https://huggingface.co/Skebobic
- No se encontraron papers, blogs, repositorios o demos adicionales en la información proporcionada.
