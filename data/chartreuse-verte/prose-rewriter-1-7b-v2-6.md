# chartreuse-verte/prose-rewriter-1.7b-v2.6

## Resumen

prose-rewriter-1.7b-v2.6 es un modelo de reescritura de prosa a nivel de párrafo desarrollado por el usuario chartreuse-verte. No es un modelo conversacional ni un asistente general: su única tarea es recibir un párrafo escrito por un modelo grande de lenguaje y reescribirlo para que suene más humano, preservando el significado original. El problema que aborda es el conocido como "slop" de LLM: construcciones repetitivas, léxico predecible y registros artificiales que delatan el texto generado por máquina. El modelo se construye sobre Qwen/Qwen3-1.7B-Base con un LoRA de rango 32 fusionado a fuerza 1.15.

Arquitectura transformer decoder-only derivada de Qwen3, con 2.031.739.904 parámetros totales (aproximadamente 2,03 mil millones) según los pesos safetensors. El repositorio ocupa 6,2 GB e incluye pesos en bf16 safetensors y una cuantización GGUF Q8_0 de 2,17 GB. Está entrenado y evaluado exclusivamente para inglés y su licencia es AGPL-3.0.

La versión v2.6 es relevante porque introduce mejoras medibles sobre v2.5 en las métricas de registro: las construcciones prohibidas caen de 4,74 a 2,26 por cada 1.000 palabras, la densidad del léxico "slop" baja de 0,053 a 0,043 y la puntuación "purple" desciende de 0,680 a 0,630. Además, reduce la repetición interna de las reescrituras del 3,6 % al 2,1 %. El modelo está publicado desde el 11 de noviembre de 2026 y, en el momento de redactar esta ficha, no registra descargas ni "likes".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3), base Qwen/Qwen3-1.7B-Base con LoRA de rango 32 fusionado a fuerza 1.15 |
| Parámetros totales | 2.031.739.904 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | bf16 (safetensors), GGUF Q8_0 (2,17 GB) |
| Idiomas soportados | Inglés (en) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors (bf16) y GGUF (Q8_0) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B-Base, un transformer decoder-only, sobre el que se aplica un LoRA de rango 32 que queda fusionado (merged) en los pesos finales a una fuerza de 1.15. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni sobre si se emplearon técnicas de RLHF o DPO. La model card describe el objetivo de entrenamiento como reescritura de prosa a nivel de párrafo con preservación semántica.

La innovación destacable no reside en la arquitectura sino en el formato de prompt y el ajuste fino: el modelo utiliza una plantilla de chat no convencional con roles `source` y `rewrite`, construida byte a byte por el tokenizer del repositorio. Cada llamada debe contener un único mensaje con el párrafo fuente, y la generación se detiene en `<|im_end|>`. La cuantización GGUF Q8_0 conserva la plantilla de chat y mantiene la cabeza de salida adaptada separada de los embeddings de tokens. La evaluación reportada se realizó con los pesos tal como se distribuyen, a fuerza 1.15, con temperatura 0,9 y top_p 0,95, tres muestras por entrada.

## Capacidades

- Reescritura de prosa a nivel de párrafo: recibe un párrafo y produce una versión reescrita que preserva el significado.
- Reducción de "slop" de LLM: disminuye construcciones prohibidas, densidad de léxico predecible y puntuación "purple" respecto a la entrada.
- Reducción de repeticiones internas: baja la tasa de repetición de frases y aperturas de oración.
- Transferencia de estilo orientada a naturalidad humana ("deslop").
- Generación de texto autoregresiva con muestreo (temperatura y top_p configurables).
- No es un modelo conversacional: no mantiene diálogo multi-turno ni admite roles de usuario/asistente convencionales.
- No dispone de tool calling ni function calling documentado.
- No dispone de capacidades de agente ni razonamiento multi-paso documentadas.
- Soporte multilingüe limitado al inglés.
- No dispone de modo "thinking", visión ni audio.

## Casos de uso

- Limpieza de borradores generados por LLM: un pipeline que produce texto con un modelo grande puede pasar cada párrafo por prose-rewriter para eliminar construcciones repetitivas y léxico predecible antes de publicarlo, aprovechando la caída de construcciones prohibidas de 12,03 a 2,26 por 1.000 palabras.
- Humanización de contenido editorial: en un CMS o blog, reescribir párrafos generados automáticamente para que suenen menos artificiales, dado que la puntuación "purple" baja de 0,821 a 0,630.
- Preprocesado de textos para detección de IA: generar variantes más humanas de un corpus para entrenar o validar clasificadores de texto generado por máquina, gracias a la reducción de densidad de léxico "slop".
- Reescritura de documentación técnica: reformular párrafos de documentación generada por asistentes para mejorar naturalidad, siempre que se respete el límite práctico de unos 15 palabras mínimas por párrafo.
- Control de calidad de contenido creativo: revisar párrafos de narrativa o marketing generados por LLM y reducir repeticiones de frases (del 3,6 % al 2,1 %) antes de la revisión humana final.
- Integración en pipelines de edición por lotes: procesar corpus de párrafos con llama.cpp y el GGUF Q8_0 en CPU o GPU modestas, dado el tamaño reducido del modelo (2,17 GB en Q8_0).
- Filtrado de texto antes de publicación: pasar por alto textos de menos de 80 bytes, tal como recomienda la model card, y reescribir solo párrafos por encima del umbral práctico.

## Benchmarks y rendimiento

Los datos disponibles provienen de la evaluación del autor sobre 365 párrafos retenidos de prosa escrita por LLM, con 1.095 generaciones por variante, a temperatura 0,9 y top_p 0,95. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

| Métrica (registro) | Entrada | v2.5 | v2.6 |
|---|---|---|---|
| Construcciones prohibidas /1k | 12,03 | 4,74 | 2,26 |
| Reescrituras con alguna construcción prohibida | — | 25,0 % | 13,9 % |
| Densidad de léxico "slop" | 0,081 | 0,053 | 0,043 |
| Puntuación "purple" | 0,821 | 0,680 | 0,630 |
| Palabras por oración | 18,2 | 15,4 | 15,9 |
| Formas de narración negada por reescritura | 0,118 | 0,088 | 0,093 |

| Fidelidad (juez LLM, prob. ≥ 0,5) | v2.5 | v2.6 |
|---|---|---|
| Añade un hecho no respaldado por la entrada | 8,5 % | 6,5 % |
| Cambia el significado de algo dicho en la entrada | 22,2 % | 22,3 % |
| Cualquiera de las dos | 24,5 % | 23,1 % |
| Oración mal formada (entrada: 0,3 %) | 3,0 % | 2,3 % |

| Invención de personas | v2.5 | v2.6 |
|---|---|---|
| Pronombre de género no licenciado por la entrada | 0,3 % | 0,5 % |
| ... del género opuesto | 0,0 % | 0,0 % |
| Nombre propio ausente en la entrada | 0,1 % | 0,1 % |

| Repetición | Entrada | v2.5 | v2.6 |
|---|---|---|---|
| Cualquier repetición | 2,2 % | 3,6 % | 2,1 % |
| ... de una oración completa | — | 0,2 % | 0,5 % |
| ... de una frase | — | 1,5 % | 0,4 % |
| ... de una apertura de oración (anáfora) | — | 0,8 % | 0,7 % |

| Estructura | v2.5 | v2.6 |
|---|---|---|
| Palabras cambiadas | 30,0 % | 37,0 % |
| Salida sin cambios | 3,9 % | 2,7 % |
| Salidas casi literales | 0,5 % | 0,1 % |
| Por debajo del mínimo de edición del entrenamiento | 72,4 % | 51,2 % |
| Número de oraciones alterado | 59,7 % | 45,3 % |
| Variedad de longitud de oración vs. entrada | +0,025 | −0,004 |
| Palabras conservadas de la entrada | 0,736 | 0,660 |
| Longitud preservada | 0,928 | 0,838 |
| Truncado por debajo de 0,75x | 4,0 % | 23,4 % |
| Dos o más oraciones menos que la entrada | 3,0 % | 11,1 % |
| Trigramas repetidos | 0,001 | 0,002 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,1 GB en bf16 (2,03 mil millones de parámetros × 2 bytes), más overhead de activaciones y caché KV.
- VRAM estimada en GGUF Q8_0: aproximadamente 2,5 a 3 GB incluyendo contexto y overhead.
- GPU recomendadas: cualquier GPU consumer moderna con 6 GB o más de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son suficientes y sobradas para el tamaño del modelo.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer con 6 GB o más; en Q8_0 puede ejecutarse incluso en CPU.
- Opciones de despliegue: transformers (safetensors bf16), llama.cpp / llama-cpp-python (GGUF Q8_0), text-generation-inference (el repositorio está marcado como compatible con endpoints). Ollama y vLLM no están documentados en la información disponible.
- Latencia y throughput estimados: no disponibles. El tamaño reducido y la cuantización Q8_0 sugieren latencias bajas, pero no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| prose-rewriter-1.7b-v2.6 | 2,03 mil millones | No disponible | Reescritura de prosa / deslop | AGPL-3.0 | Hugging Face (safetensors + GGUF) |
| Qwen/Qwen3-1.7B-Base | ~1,7 mil millones | No disponible | Generación de texto general | No disponible | Hugging Face |
| prose-rewriter-1.7b-v2.5 | 2,03 mil millones | No disponible | Reescritura de prosa / deslop | AGPL-3.0 | Hugging Face |

La comparación con modelos de reescritura de propósito general no está disponible en la información proporcionada. El modelo base Qwen3-1.7B-Base es el punto de partida directo, pero carece de la especialización en deslop y no comparte el formato de prompt ni las métricas de registro. La versión v2.5 es la alternativa inmediata dentro de la misma familia, con peores resultados en construcciones prohibidas, léxico "slop" y repetición, pero con menor tasa de truncado (4,0 % frente a 23,4 % en v2.6).

## Limitaciones y advertencias

- No es un modelo conversacional: no admite diálogo multi-turno ni roles de usuario/asistente; cada llamada debe enviar un único mensaje con rol `source`.
- Sesgos conocidos: no documentados en la información disponible; al derivar de Qwen3-1.7B-Base, puede heredar sesgos del corpus de entrenamiento original.
- Riesgo de alucinación: la evaluación reporta que el 6,5 % de las reescrituras añade un hecho no respaldado por la entrada y el 22,3 % cambia el significado de algo dicho en la entrada; el 23,1 % incurre en al menos una de las dos.
- Invención de personas: el 0,5 % de las reescrituras introduce un pronombre de género no licenciado por la entrada.
- Truncado: el 23,4 % de las salidas de v2.6 queda por debajo de 0,75x de la longitud de entrada y el 11,1 % pierde dos o más oraciones, un aumento notable frente a v2.5.
- Longitud de entrada: el mínimo práctico es de unas 15 palabras; por debajo, el modelo tiende a rellenar, recortar o fabricar. Por debajo de 80 bytes, la recomendación es dejar el texto intacto.
- Cobertura de idioma: solo inglés; no se garantiza calidad en castellano ni en otros idiomas.
- Licencia AGPL-3.0: impone obligaciones de copyleft en uso comercial y en servicios en red; conviene revisar con cuidado antes de integrarlo en productos propietarios.
- Longitud de contexto: no disponible; el entrenamiento se centró en párrafos con mediana de 38 palabras y el 80 % por debajo de 70, por lo que entradas largas pueden degradar la calidad.
- Formato de prompt estricto: requiere construir la cadena `<|im_start|>source ... <|im_end|><|im_start|>rewrite` de forma exacta; las APIs de chat convencionales no modelan el rol `source`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chartreuse-verte/prose-rewriter-1.7b-v2.6
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- GGUF en el repositorio: https://huggingface.co/chartreuse-verte/prose-rewriter-1.7b-v2.6/tree/main/GGUF
- Repositorio de llama.cpp (referenciado para servir el GGUF): https://github.com/ggml-org/llama.cpp
- Documentación de text-generation-inference (compatibilidad indicada en los tags): https://github.com/huggingface/text-generation-inference
