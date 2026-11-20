# mradermacher/Llama_3.1_8b_DodoWild_v2.02-GGUF

## Resumen

Llama_3.1_8b_DodoWild_v2.02-GGUF es una versión cuantizada en formato GGUF del modelo Nexesenex/Llama_3.1_8b_DodoWild_v2.02, un merge de modelos construido sobre la arquitectura Llama 3.1 de 8.030 millones de parámetros. El trabajo de cuantización lo firma mradermacher, un publicador habitual de cuantizaciones GGUF en Hugging Face, y ofrece el modelo en múltiples niveles de compresión (desde Q2_K hasta f16) para facilitar su despliegue en hardware de consumo.

El modelo subyacente es un merge realizado con mergekit, lo que significa que combina los pesos de varios modelos derivados de Llama 3.1 8B para intentar agregar capacidades (por ejemplo, creatividad en escritura, seguimiento de instrucciones o estilo conversacional). Al estar basado en Llama 3.1, hereda su licencia comunitaria Llama 3.1 y está orientado a inglés. No se dispone de información detallada sobre la receta exacta del merge ni sobre los modelos que lo componen.

La relevancia de esta ficha radica en que permite evaluar rápidamente un modelo de 8B cuantizado para tareas conversacionales en inglés, con opciones de despliegue muy flexibles gracias a GGUF y a la compatibilidad con llama.cpp, Ollama y otros runners. Al tratarse de un merge experimental con pocas descargas y sin benchmarks publicados, conviene tratarlo como un candidato a evaluar empíricamente antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basada en Llama 3.1 (merge con mergekit) |
| Parametros totales | 8.030.343.232 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Llama 3.1, 131.072 tokens en el modelo base, no confirmada en esta ficha) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en |
| Licencia | llama3.1 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo es un merge de pesos construido con mergekit sobre la arquitectura Llama 3.1 de 8B, un transformer decoder-only con atención por grupos (GQA), RoPE y tokenizador de Llama 3. El proceso de merge combina los tensores de varios checkpoints derivados de Llama 3.1 8B, pero la model card no detalla la receta (método de merge, proporciones, modelos fuente) ni los datos de entrenamiento adicionales. Tampoco se documenta si hubo fine-tuning posterior con RLHF o DPO tras el merge.

La innovación técnica principal de esta publicación es la cuantización GGUF realizada por mradermacher, con versiones estáticas (este repositorio) y versiones con imatrix/weighted disponibles en un repositorio separado. La cuantización permite ejecutar el modelo en CPU y GPU de consumo con pérdidas de calidad controladas según el nivel elegido (Q4_K_M y Q5_K_M recomendados por el autor como equilibrio entre tamaño y calidad).

## Capacidades

- Generación de texto conversacional en inglés, orientada a diálogo multi-turno.
- Razonamiento general y seguimiento de instrucciones heredado de Llama 3.1 8B.
- Generación de código y matemáticas básicas (capacidad típica de Llama 3.1 8B, no verificada en este merge).
- Soporte de tool calling y function calling: no confirmado explícitamente en la información disponible; Llama 3.1 lo soporta, pero el merge podría degradarlo.
- Capacidades de agente y razonamiento multi-paso: no confirmadas.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Asistente conversacional local en inglés: el modelo puede gestionar diálogos multi-turno en un equipo de sobremesa con GPU de consumo, usando la cuantización Q4_K_M (5,0 GB) o Q5_K_M (5,8 GB), lo que lo hace adecuado para prototipos de chatbots privados sin conexión.
- Generación creativa de texto: al ser un merge orientado a estilo (DodoWild), puede emplearse para escritura de ficción, descripciones y borradores, aunque requiere validación humana por la falta de benchmarks.
- Evaluación comparativa de merges: investigadores que estudien el efecto de mergekit sobre Llama 3.1 8B pueden usar esta versión cuantizada para pruebas rápidas de calidad percibida frente al modelo base.
- Despliegue en entornos con recursos limitados: las cuantizaciones Q2_K (3,3 GB) y Q3_K_S (3,8 GB) permiten ejecutar el modelo en portátiles sin GPU dedicada mediante llama.cpp u Ollama, a costa de menor calidad.
- Fine-tuning ligero y experimentación: al estar disponible en GGUF y en safetensors en el modelo base, sirve como punto de partida para LoRA o para comparar técnicas de cuantización.
- Filtrado y clasificación de texto en inglés: tareas de etiquetado, resumen o reescritura en pipelines de procesamiento por lotes donde el coste por token importa más que la precisión absoluta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,3 GB (Q2_K), 4,8-5,0 GB (Q4_K_S/Q4_K_M), 5,8 GB (Q5_K_M), 6,7 GB (Q6_K), 8,6 GB (Q8_0) y 16,2 GB (f16), sin contar el espacio para el contexto KV cache.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones altas; A100 o H100 no son necesarias para un modelo de 8B.
- Cabe en GPU de consumo: sí, desde una GTX 1660 6 GB con Q4_K_M hasta una RTX 4090 con Q8_0 o f16.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF; también puede usarse vLLM o TGI con el modelo base en safetensors.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependerán del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Llama_3.1_8b_DodoWild_v2.02-GGUF | 8,03B | no disponible (base: 131.072) | llama3.1 | GGUF | Merge comunitario, solo inglés, sin benchmarks |
| Llama 3.1 8B Instruct (Meta) | 8,03B | 131.072 | llama3.1 | safetensors, GGUF | Modelo oficial con benchmarks publicados y soporte multilingüe |
| Mistral 7B Instruct v0.3 | 7,24B | 32.768 | Apache 2.0 | safetensors, GGUF | Alternativa permisiva para uso comercial |
| Qwen2.5 7B Instruct | 7,62B | 131.072 | Apache 2.0 | safetensors, GGUF | Multilingüe y con buen rendimiento en código y matemáticas |

## Limitaciones y advertencias

- Al ser un merge experimental, no hay garantía de que las capacidades de Llama 3.1 8B (tool calling, contexto largo, multilingüismo) se conserven intactas; pueden degradarse.
- Riesgo de alucinación inherente a los modelos de 8B, agravado por la falta de benchmarks que validen la calidad del merge.
- Idiomas: la model card solo declara inglés; el rendimiento en castellano no está garantizado.
- Licencia llama3.1: impone restricciones de uso comercial y obligaciones de atribución; conviene revisar los términos completos antes de desplegar en producción.
- Contexto: aunque el modelo base soporta 131.072 tokens, no se confirma que el merge mantenga esa ventana; conviene probarlo empíricamente.
- Popularidad muy baja (18 descargas, 1 like) y sin documentación del proceso de merge, lo que dificulta la reproducibilidad.
- Las cuantizaciones Q2_K y Q3_K pueden degradar notablemente la coherencia; el autor recomienda Q4_K_M o superiores para uso real.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Llama_3.1_8b_DodoWild_v2.02-GGUF
- Modelo base: https://huggingface.co/Nexesenex/Llama_3.1_8b_DodoWild_v2.02
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Llama_3.1_8b_DodoWild_v2.02-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Llama_3.1_8b_DodoWild_v2.02-GGUF
- Peticiones de modelos del autor: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
