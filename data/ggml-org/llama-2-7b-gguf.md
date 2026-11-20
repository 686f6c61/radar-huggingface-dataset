# ggml-org/Llama-2-7B-GGUF

## Resumen

Llama-2-7B-GGUF es una conversión automática a formato GGUF del modelo base Llama-2-7B de Meta, publicada por la organización ggml-org (responsable de llama.cpp). No se trata de un modelo nuevo ni de un fine-tuning: es el mismo checkpoint original de Meta (meta-llama/Llama-2-7b-hf) cuantizado en múltiples variantes GGUF para su uso con llama.cpp y otros runtimes compatibles. El repositorio se utiliza principalmente para la recogida de datos del hilo de discusión sobre calidad de cuantizaciones en llama.cpp (discussion #4167).

El modelo subyacente es un transformer decoder-only denso de 6.738.415.616 parámetros (aproximadamente 6,7 mil millones), con una longitud de contexto nativa de 4096 tokens. Llama-2-7B fue uno de los modelos abiertos de referencia de 2023 y sigue siendo útil como baseline para pruebas de cuantización, evaluación de runtimes y experimentos de despliegue en hardware modesto.

Su relevancia actual es fundamentalmente práctica: el repositorio ofrece el modelo en un rango amplio de cuantizaciones GGUF (desde Q2 hasta Q8 y F16, de ahí los 75,8 GB del repo completo), lo que permite ejecutarlo desde dispositivos con poca memoria hasta configuraciones de mayor precisión, y sirve como referencia para comparar el impacto de la cuantización en la perplejidad y la calidad de generación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 4096 tokens (contexto nativo de Llama 2) |
| Tipos de cuantizacion | Multiples variantes GGUF (F16, Q8, Q6, Q5, Q4, Q3, Q2, segun el repo de 75,8 GB); niveles exactos no detallados en la model card |
| Idiomas soportados | no disponible (la model card no los declara; Llama 2 se entreno principalmente en ingles) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | GGUF (cuantizado); el modelo base original esta en safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 2: un transformer decoder-only denso con normalización RMSNorm, activación SwiGLU, positional embeddings rotatorios (RoPE) y atención causal estándar (no GQA en la variante de 7B). El modelo base fue entrenado por Meta con 2 billones de tokens y posteriormente alineado mediante RLHF (SFT más optimización con recompensa humana). Esta ficha describe la conversión GGUF de ggml-org, que no introduce cambios arquitectónicos: solo modifica el formato y la precisión numérica de los pesos.

La innovación relevante del repositorio es de infraestructura, no de modelado: la conversión se realiza con la herramienta automática de ggml-org (github.com/ggml-org/convert), y el propósito declarado es alimentar la discusión pública sobre el impacto de las distintas cuantizaciones GGUF en la calidad del modelo dentro de llama.cpp. No hay datos en la información disponible sobre dataset exacto, composición ni detalles adicionales de entrenamiento más allá de lo publicado por Meta para Llama 2.

## Capacidades

- Generación de texto autoregresiva en inglés principalmente (idiomas no declarados en la model card).
- Razonamiento básico y respuesta a instrucciones en formato chat (el checkpoint base requiere plantilla de prompt adecuada; el modelo no es un chat model afinado específicamente en este repo).
- Generación de código y resolución de problemas matemáticos sencillos, con fiabilidad limitada por el tamaño.
- No soporta tool calling ni function calling de forma nativa.
- No soporta agentes ni razonamiento multi-paso estructurado de forma nativa.
- Sin capacidades de visión, audio ni modo "thinking".
- Uso principal como baseline para pruebas de cuantización y evaluación de runtimes GGUF.

## Casos de uso

- Evaluación de cuantizaciones en llama.cpp: cargar distintas variantes GGUF del repo y medir perplejidad, velocidad y calidad de generación para decidir qué nivel de cuantización usar en producción.
- Pruebas de integración de runtimes: validar que llama.cpp, Ollama u otros motores compatibles con GGUF cargan y ejecutan correctamente el modelo antes de adoptar modelos más grandes.
- Prototipado local en hardware modesto: usar variantes Q4/Q5 en portátiles o GPUs consumer para experimentar con generación de texto sin depender de la nube.
- Generación de texto y resumen en inglés: tareas de redacción asistida, resumen de documentos cortos y reescritura, dentro del límite de 4096 tokens de contexto.
- Base para fine-tuning posterior: partir del checkpoint original (safetensors) o de una cuantización de alta precisión para adaptar el modelo a dominios concretos.
- Benchmarking de infraestructura: comparar throughput y latencia entre GPUs, CPUs y configuraciones de offloading usando un modelo de tamaño conocido y reproducible.
- Educación y experimentación: estudiar el efecto de la cuantización en modelos transformer sin necesidad de entrenar desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni comparaciones de perplejidad entre cuantizaciones.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, según tamaño de pesos): F16 ~13,5 GB; Q8 ~7,2 GB; Q4 ~4 GB; Q2 ~2,5 GB. Estas cifras son estimaciones basadas en el número de parámetros y no están publicadas en la información disponible.
- GPU recomendadas: A100 o H100 para F16 y despliegues de alta concurrencia; RTX 4090/3090 para Q8 y Q4 con holgura; RTX 3060 12 GB o similar para Q4/Q5.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas con 6-8 GB o más usando cuantizaciones Q4 o inferiores.
- Opciones de despliegue: llama.cpp (runtime de referencia para GGUF), Ollama, y otros motores con soporte GGUF. vLLM y TGI no son la vía natural para GGUF, aunque existen soportes parciales.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Llama-2-7B-GGUF (este repo) | 6,74 B | 4096 | llama2 | GGUF cuantizado | Conversion automatica para pruebas en llama.cpp |
| meta-llama/Llama-2-7b-hf | 6,74 B | 4096 | llama2 | safetensors | Checkpoint original de Meta, misma arquitectura |
| Llama-2-13B | ~13 B | 4096 | llama2 | safetensors/GGUF | Mayor calidad a costa de ~2x memoria |
| Mistral-7B | ~7,2 B | 8192 (nativo) | Apache 2.0 | safetensors/GGUF | Contexto mayor y licencia mas permisiva; disponible en GGUF |

Los datos de rendimiento comparativo entre estos modelos no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Modelo de 2023: ha sido superado ampliamente por modelos más recientes de tamaño similar en razonamiento, código y multilingüismo.
- Entrenado principalmente en inglés; el rendimiento en castellano es limitado y no está documentado en la model card.
- Riesgo de alucinación inherente a modelos de 7B; no apto para tareas de alta precisión sin verificación.
- Contexto limitado a 4096 tokens, insuficiente para documentos largos o conversaciones extensas.
- Sin soporte nativo de tool calling ni de agentes; requiere ingeniería de prompt externa.
- Licencia Llama 2 Community License: permite uso comercial con restricciones (umbral de 700 millones de usuarios mensuales, obligaciones de atribución y cláusulas de uso aceptable). Revisar el texto completo antes de desplegar en producción.
- La cuantización introduce degradación de calidad; las variantes Q2 y Q3 pueden producir salidas notablemente peores.
- Repositorio orientado a pruebas internas de llama.cpp; no es una distribución mantenida como producto.
- El tamaño del repo (75,8 GB) implica descargar todas las variantes si se clona completo; conviene descargar solo el archivo GGUF necesario.

## Enlaces

- Hugging Face: https://huggingface.co/ggml-org/Llama-2-7B-GGUF
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-hf
- Discusión de llama.cpp sobre cuantizaciones: https://github.com/ggml-org/llama.cpp/discussions/4167
- Herramienta de conversión: https://github.com/ggml-org/convert
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
