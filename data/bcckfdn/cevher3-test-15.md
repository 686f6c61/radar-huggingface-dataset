# bcckfdn/cevher3-test-15

## Resumen

cevher3-test-15 es un modelo de lenguaje de 1.256.312.832 parámetros (aproximadamente 1,26 mil millones) publicado por el usuario bcckfdn en Hugging Face bajo licencia Apache 2.0. Está construido sobre la arquitectura `gemma3_text` de la familia Gemma 3 de Google y se distribuye en formato safetensors para su uso con la librería transformers. El modelo está orientado a generación de texto conversacional y declara soporte para turco (tr) e inglés (en).

La model card indica que se ha entrenado con la arquitectura "Gemma3-SWA" (atención de ventana deslizante) sobre 31.949 millones de tokens, con una longitud de contexto de 8192 tokens, 34 capas, dimensión oculta de 1792 y un vocabulario de 65.536 entradas. La mejor pérdida de validación reportada es 2,7701. El identificador "test-15" y la ausencia de descargas o likes sugieren que se trata de un experimento o checkpoint de prueba más que de un modelo listo para producción.

Su relevancia es limitada: no se han publicado benchmarks, no hay documentación sobre el dataset de entrenamiento ni sobre el proceso de alineación (RLHF/DPO), y el repositorio ocupa 2,5 GB. Resulta útil como referencia para quienes quieran inspeccionar un modelo pequeño de la familia Gemma 3 entrenado desde cero o afinado para turco, pero no como base para despliegues en producción sin una evaluación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma3-SWA (transformer decoder-only con atención de ventana deslizante), clase `gemma3_text` |
| Parametros totales | 1.256.312.832 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors en precisión original) |
| Idiomas soportados | turco (tr), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers) |
| Capas | 34 |
| Dimension oculta | 1792 |
| Cabezas de atencion (Q/KV) | 28 / 4 (GQA) |
| Vocabulario | 65.536 tokens |
| Tokens de entrenamiento | 31.949 millones |
| Mejor val loss | 2,7701 |
| Tamano del repo | 2,5 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura `gemma3_text`, un transformer decoder-only con atención de ventana deslizante (sliding window attention, SWA) intercalada con capas de atención global, tal como se define en la familia Gemma 3. Los datos de la model card confirman 34 capas, dimensión oculta de 1792, 28 cabezas de consulta y 4 cabezas de clave/valor (atención con grupos de consultas, GQA), vocabulario de 65.536 tokens y contexto máximo de 8192 tokens. El tamaño de 1,26 mil millones de parámetros lo sitúa en la gama pequeña de la familia Gemma 3.

El entrenamiento se realizó sobre 31.949 millones de tokens, con una pérdida de validación final de 2,7701. No se especifica la composición del dataset, la proporción de turco frente a inglés, ni si se aplicaron fases de instrucción, RLHF o DPO. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal más allá del uso de SWA propio de la arquitectura base. La información disponible no permite verificar si el modelo se entrenó desde cero o si es un ajuste fino de un checkpoint Gemma 3 preexistente.

## Capacidades

- Generación de texto autoregresiva en turco e inglés, con pipeline `text-generation`.
- Conversación multi-turno: la etiqueta `conversational` sugiere un formato de chat, aunque no se documenta la plantilla exacta.
- Razonamiento y generación de código: capacidad esperable por herencia de la arquitectura Gemma 3, pero no verificada mediante benchmarks.
- Soporte de tool calling / function calling: no disponible en la documentación.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: limitadas a turco e inglés según los metadatos.
- Capacidades especiales (modo thinking, visión, audio): no disponibles; el modelo es solo de texto.
- Integración con text-generation-inference y endpoints compatibles, según los tags del repositorio.

## Casos de uso

- Prototipado de asistentes conversacionales en turco: el modelo puede gestionar diálogos multi-turno con hasta 8192 tokens de contexto, suficiente para conversaciones con historial moderado en aplicaciones de chat internas o demos.
- Generación de texto en inglés para tareas de redacción asistida: con 1,26 mil millones de parámetros cabe en una GPU de consumo y permite iterar rápidamente sobre prompts en entornos de desarrollo.
- Experimentación académica con arquitecturas Gemma 3: sirve como punto de partida para estudiar el comportamiento de atención de ventana deslizante en modelos pequeños y comparar con checkpoints oficiales.
- Fine-tuning específico de dominio en turco: al ser un modelo pequeño con licencia Apache 2.0, es viable ajustarlo con LoRA sobre datasets propios de sectores como atención al cliente o documentación técnica.
- Evaluación de pipelines de transformers y TGI: útil para probar integraciones de despliegue (text-generation-inference, endpoints compatibles) sin incurrir en los costes de un modelo grande.
- Generación de datos sintéticos para aumentar corpus en turco: puede emplearse para producir texto de relleno o ejemplos adicionales en tareas de aumento de datos, siempre con revisión humana posterior.
- Educación y divulgación: adecuado para demostrar el ciclo completo de carga, inferencia y evaluación de un modelo Gemma 3 pequeño en cursos o talleres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta la pérdida de validación (2,7701) y el número de tokens de entrenamiento (31.949 millones), sin métricas como MMLU, HumanEval, GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 2,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 3 y 4 GB para contexto corto.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,3-1,5 GB de pesos.
- VRAM estimada en cuantización de 4 bits: alrededor de 0,7-1 GB de pesos, aunque el repo no incluye versiones GGUF ni cuantizadas.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para fp16; RTX 3060, RTX 4060, RTX 4070, RTX 4090, A10, L4, A100 y H100 son válidas. Cabe en GPUs de consumo modernas.
- Despliegue: transformers (carga directa con `AutoModelForCausalLM`), text-generation-inference (según tags), y previsiblemente llama.cpp/Ollama si se generan cuantizaciones GGUF a partir de los safetensors (no incluidas en el repo).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Benchmark publicado |
|---|---|---|---|---|---|
| cevher3-test-15 | 1,26 B | 8192 | tr, en | Apache 2.0 | no |
| Gemma 3 1B (Google) | ~1 B | 32k (según familia Gemma 3) | multilingüe | Gemma Terms | sí (model card oficial) |
| Qwen2.5-1.5B | 1,5 B | 32k | multilingüe | Apache 2.0 | sí |
| Llama 3.2 1B | 1,24 B | 128k | multilingüe | Llama 3.2 Community License | sí |

La comparación con Gemma 3 1B es la más directa por arquitectura, pero cevher3-test-15 no publica métricas que permitan contrastar rendimiento. Frente a Qwen2.5-1.5B y Llama 3.2 1B, el modelo de bcckfdn ofrece menor contexto declarado (8192 frente a 32k-128k) y carece de evaluación pública, aunque comparte licencia permisiva con Qwen2.5.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia pública de calidad en razonamiento, código, matemáticas ni multilingüismo.
- Sesgos desconocidos: no se documenta la composición del dataset de entrenamiento, por lo que no es posible evaluar sesgos de género, etnia, religión o políticos.
- Riesgo de alucinación: inherente a modelos de 1,26 B parámetros; la pérdida de validación de 2,7701 no es un indicador suficiente de fiabilidad factual.
- Cobertura lingüística limitada: solo turco e inglés; no se garantiza un rendimiento aceptable en castellano ni en otras lenguas.
- Contexto moderado: 8192 tokens es inferior al de competidores contemporáneos (32k-128k), lo que restringe casos de uso con documentos largos.
- Modelo de prueba: el sufijo "test-15", la ausencia de descargas y la falta de documentación sobre alineación sugieren que no está validado para producción.
- Licencia Apache 2.0: permite uso comercial, pero el usuario asume toda la responsabilidad sobre el comportamiento del modelo y posibles infracciones de derechos derivadas de los datos de entrenamiento, no documentados.
- Sin garantías de soporte: no hay repo de código, paper ni canal de mantenimiento asociado.

## Enlaces

- Hugging Face: https://huggingface.co/bcckfdn/cevher3-test-15
- Repositorio de la familia Gemma 3 (referencia arquitectónica): https://huggingface.co/google/gemma-3-1b-it
- Documentación de transformers sobre `gemma3_text`: https://huggingface.co/docs/transformers/model_doc/gemma3
- Text Generation Inference: https://github.com/huggingface/text-generation-inference
- No se han encontrado papers, blogs, demos ni repositorios adicionales asociados a este modelo en la información disponible.
