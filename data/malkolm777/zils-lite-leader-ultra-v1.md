# malkolm777/zils-lite-leader-ultra-v1

## Resumen

zils-lite-leader-ultra-v1 es un modelo de decisión derivado de la familia Qwen3.5-0.8B, publicado por el usuario malkolm777 como cuerpo de decisión ("decision body") para el pool lite de la subnet 127 de Zils. No se trata de un modelo conversacional de propósito general, sino de un extractor de características especializado en resolver ítems de decisión con opciones declaradas (formato "estado + pregunta de decisión con opciones"), que devuelve una distribución de probabilidad sobre las opciones disponibles. El modelo parte del miembro del pool joamCriff123/zils-lite-l1117a y se construye mediante destilación por KL desde el modelo mayor vllm-sr/d3-ultra.

Técnicamente, el autor entrenó cuatro estudiantes LoRA (seeds 553, 771, 991 y 1201, rango 64, learning rate 5e-5, una época) sobre 4.580 ítems de decisión estilo examen, promedió sus pesos y extrapoló el delta respecto al punto de partida con un factor de 2. Los objetivos de entrenamiento son las distribuciones completas de opciones del profesor, sin etiquetas doradas. El resultado es un checkpoint de 852.985.920 parámetros (unos 853 M) en safetensors, con un repositorio de 1,7 GB y licencia Apache-2.0.

Su relevancia es acotada pero específica: sirve como candidato dentro de un mecanismo de mezcla de modelos (soup pool) para tareas de decisión evaluadas por validadores, y su interés técnico reside en la receta de destilación con extrapolación de delta y en el uso de la arquitectura Qwen3.5 como base. No hay información publicada sobre idiomas soportados ni sobre rendimiento en benchmarks estándar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5-0.8B, tag `qwen3_5`, con `custom_code`) |
| Parámetros totales | 852.985.920 (~853 M) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | vllm-sr/d3-lite (a su vez derivado de Qwen/Qwen3.5-0.8B) |
| Punto de partida del entrenamiento | joamCriff123/zils-lite-l1117a (miembro del pool lite) |
| Pipeline declarado | feature-extraction |
| Tamaño del repositorio | 1,7 GB |

## Arquitectura y entrenamiento

El modelo hereda el chasis de la familia Qwen3.5-0.8B: un transformer denso de aproximadamente 853 M de parámetros, con torre de visión y ficheros de contrato ("contract files") que, según la model card, se conservan intactos del chasis original. El repositorio incluye código personalizado (`custom_code`), por lo que la carga requiere `trust_remote_code=True` en transformers. La cabeza de lectura se mantiene tal cual; el ajuste se aplica sobre el cuerpo de decisión.

El entrenamiento es una destilación por divergencia KL desde vllm-sr/d3-ultra sobre 4.580 ítems de decisión estilo examen, redactados por un LLM en el formato del validador (estado más pregunta de decisión con opciones declaradas) y repartidos entre las familias de tareas del pool. Se entrenaron cuatro estudiantes LoRA independientes (rango 64, lr 5e-5, una época) desde el mismo punto de partida, se promediaron sus pesos y se extrapoló el cambio resultante con un factor de 2 (delta extrapolation). No se usaron etiquetas doradas: el objetivo son las distribuciones completas de opciones del profesor. No se documentan número de tokens, composición del corpus más allá de los 4.580 ítems, ni fases de RLHF/DPO.

## Capacidades

- Extracción de características y puntuación de opciones: dado un estado y una pregunta de decisión con opciones declaradas, produce una distribución sobre las opciones.
- Tareas de decisión en el formato del validador de la subnet 127 de Zils (familias de tareas del pool lite).
- Destilación de un profesor mayor (d3-ultra): el modelo aproxima las distribuciones del profesor, no etiquetas discretas.
- Conserva la torre de visión del chasis Qwen3.5-0.8B según la model card, aunque no se documenta su uso en el entrenamiento.
- No se documenta soporte de tool calling, function calling, agentes, modo thinking ni capacidades multilingües específicas.
- No se documenta generación de texto libre, razonamiento conversacional ni matemáticas como capacidades evaluadas.

## Casos de uso

- Selección entre opciones en pipelines de decisión: integrar el modelo como clasificador de opciones en flujos donde la salida es una distribución sobre alternativas predefinidas, aprovechando que fue entrenado exactamente con ese formato.
- Miembro de un soup pool: usar el checkpoint como candidato dentro de un mecanismo de mezcla de pesos o de ensemble con otros cuerpos de la familia d3-lite, que es el contexto para el que fue diseñado.
- Destilación de un profesor mayor: servir de referencia para reproducir la receta de destilación KL con LoRA múltiple y extrapolación de delta sobre un corpus pequeño y específico.
- Evaluación de validadores: emplear el modelo para generar distribuciones de opciones y comparar con las salidas esperadas por el validador de la subnet, como herramienta de diagnóstico del propio pipeline.
- Extracción de embeddings para tareas de decisión: al declararse como `feature-extraction`, puede utilizarse para obtener representaciones del estado y la pregunta y alimentar un clasificador posterior.
- Experimentación académica con Qwen3.5-0.8B: estudiar el efecto del promediado de LoRA y la extrapolación de delta sobre un modelo base pequeño y con licencia permisiva.
- Prototipado en local: con ~853 M de parámetros y pesos safetensors de 1,7 GB, cabe en una GPU de consumo para experimentos de decisión sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1,7 GB solo para pesos, más overhead de activaciones y del código personalizado; en la práctica, entre 2 y 4 GB según longitud de secuencia y batch.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,9 GB de pesos; en 4 bits, alrededor de 0,5 GB (no se publican variantes cuantizadas oficiales).
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM para fp16 (RTX 3060, RTX 4060, RTX 4090); A100/H100 no son necesarias para este tamaño, salvo para evaluaciones a gran escala en batch.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB y RTX 4090 24 GB, así como en GPUs de 8 GB con batch pequeño.
- Opciones de despliegue: transformers con `trust_remote_code=True` es la vía documentada por la librería declarada; vLLM, llama.cpp, Ollama o TGI no están confirmados en la información disponible (el código personalizado y la ausencia de GGUF dificultan llama.cpp/Ollama sin conversión).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| zils-lite-leader-ultra-v1 | ~853 M | no disponible | Apache-2.0 | Decisión por destilación KL, salida sobre opciones | Hugging Face, 0 descargas |
| vllm-sr/d3-lite (base) | no disponible | no disponible | no disponible | Cuerpo de decisión de la familia d3 | Referenciado como base |
| vllm-sr/d3-ultra (profesor) | no disponible | no disponible | no disponible | Modelo mayor de la familia d3, usado como profesor | Referenciado en la model card |
| Qwen/Qwen3.5-0.8B (chasis) | ~0,8 B | no disponible | no disponible | Modelo base de propósito general con torre de visión | Familia pública Qwen |

No se dispone de datos de rendimiento comparado para ninguno de los modelos de la tabla en la información proporcionada.

## Limitaciones y advertencias

- Modelo altamente especializado: no es un asistente conversacional ni un generador de texto general; su uso fuera del formato "estado + pregunta + opciones" no está validado.
- Entrenado sin etiquetas doradas: las salidas imitan al profesor vllm-sr/d3-ultra, por lo que hereda sus sesgos y errores de calibración.
- Corpus de entrenamiento pequeño y sintético (4.580 ítems redactados por un LLM): riesgo de sobreajuste al formato y a las familias de tareas del pool, con poca generalización fuera de ellas.
- La extrapolación de delta con factor 2 puede amplificar artefactos del promediado de LoRA; no se documenta validación de esta elección.
- Idiomas soportados no documentados: no se puede asumir un rendimiento multilingüe.
- Longitud de contexto no documentada: no se recomienda su uso en secuencias largas sin verificación empírica.
- Requiere `trust_remote_code=True` por el código personalizado, lo que implica ejecutar código del autor; conviene auditar los ficheros del repositorio antes de desplegar.
- Licencia Apache-2.0 permite uso comercial, pero se debe conservar el fichero LICENSE y revisar el NOTICE del repositorio por posibles atribuciones adicionales.
- Sin descargas ni likes en el momento de la ficha: no hay evidencia comunitaria de funcionamiento ni reportes independientes.
- Riesgo de alucinación no evaluado en este contexto; al tratarse de un modelo de puntuación de opciones, el fallo típico sería una distribución mal calibrada más que texto inventado.

## Enlaces

- Hugging Face: https://huggingface.co/malkolm777/zils-lite-leader-ultra-v1
- Modelo base: https://huggingface.co/vllm-sr/d3-lite
- Profesor de destilación: https://huggingface.co/vllm-sr/d3-ultra
- Punto de partida del pool: https://huggingface.co/joamCriff123/zils-lite-l1117a
- Chasis de la familia: https://huggingface.co/Qwen/Qwen3.5-0.8B
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
