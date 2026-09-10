# BachDaThan/Mistral-7B-sentiment-analysis-Vietnamese-GGUF

## Resumen

Mistral-7B-sentiment-analysis-Vietnamese-GGUF es una conversión a formato GGUF de un modelo Mistral de 7.248.023.552 parámetros, obtenido al fusionar el adaptador LoRA quydau/Mistral-7B-sentiment-analysis-Vietnamese sobre mistralai/Mistral-7B-Instruct-v0.3. Lo publica el usuario BachDaThan, que actúa únicamente como cuantizador: no entrena ni afina el modelo, sino que integra el adaptador en los pesos base y genera cuatro ficheros GGUF para inferencia con llama.cpp y Ollama.

El interés práctico del modelo es doble. Por un lado, ofrece un modelo de 7B instruction-tuned orientado al análisis de sentimiento en vietnamita, un idioma con menos recursos y con poca cobertura en las familias de modelos abiertos dominantes. Por otro, al estar en GGUF con cuantizaciones de 2,95 GB a 4,07 GB, cabe en GPU de consumo y permite desplegar en local tanto la clasificación de sentimiento como tareas conversacionales en vietnamita e inglés.

La ventana de contexto declarada es de 32.768 tokens en la arquitectura, aunque los ejemplos de uso de la propia model card emplean n_ctx=8192. El repositorio tiene 15,2 GB y, en el momento de la consulta, 0 descargas y 0 likes, por lo que se trata de una publicación sin tracción ni validación comunitaria documentada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Mistral (32 capas, hidden size 4096, head dim 128, 32 cabezas de atención, 8 cabezas KV con GQA, vocabulario de 32.768) |
| Parámetros totales | 7.248.023.552 (7,25 B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens según la arquitectura; los ejemplos de la model card usan 8.192 tokens |
| Tipos de cuantización | GGUF: Q4_K_M (4,07 GB), Q4_K_S (3,86 GB), Q3_K_M (3,28 GB), Q3_K_S (2,95 GB) |
| Idiomas soportados | Vietnamita (vi) e inglés (en) |
| Licencia | apache-2.0 según los metadatos de HuggingFace (ver limitaciones: la propia model card matiza que no autoasigna Apache-2.0) |
| Formato de pesos | GGUF (llama.cpp); precisión original del modelo base en bfloat16 |
| Modelo base | mistralai/Mistral-7B-Instruct-v0.3 |
| Adaptador LoRA fusionado | quydau/Mistral-7B-sentiment-analysis-Vietnamese |
| Librería de inferencia | llama.cpp |

## Arquitectura y entrenamiento

La arquitectura es la de Mistral-7B-Instruct-v0.3: un transformer decoder-only de 32 capas, dimensión oculta de 4096 y 32 cabezas de atención con 8 cabezas KV, lo que implica atención con consultas agrupadas (GQA) y reduce el tamaño de la caché KV durante la inferencia. El vocabulario es de 32.768 tokens y el modelo base declara soporte de contexto de hasta 32.768 tokens. Sobre esos pesos se ha fusionado un adaptador LoRA orientado a análisis de sentimiento en vietnamita, tras lo cual el resultado se ha cuantizado a GGUF en cuatro niveles (Q4_K_M, Q4_K_S, Q3_K_M, Q3_K_S).

No hay información disponible en la documentación proporcionada sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF o DPO, ni sobre el proceso de ajuste del adaptador LoRA (datos, épocas, hiperparámetros). Tampoco se documenta ninguna innovación técnica adicional más allá del ajuste y la cuantización. Conviene señalar una inconsistencia en la model card: describe el chat template como "Qwen2 ChatML" pese a que el modelo base es Mistral, y aclara que tokenizer_config.json no lo declara directamente; ese punto debería verificarse antes de integrar el modelo en un pipeline de producción, ya que un template mal aplicado degrada la calidad de las respuestas de forma notable.

## Capacidades

- Generación de texto y conversación multi-turno en vietnamita e inglés, con ajuste de instrucciones heredado del modelo base.
- Análisis de sentimiento en vietnamita como tarea objetivo del adaptador LoRA fusionado.
- Razonamiento y comprensión de instrucciones en formato chat, con temperatura y top_p recomendados de 0,6 y 0,95 respectivamente.
- Soporte de contexto largo en la arquitectura (hasta 32.768 tokens), aunque los ejemplos oficiales se limitan a 8.192 tokens.
- Tool calling y function calling: el modelo base Mistral-7B-Instruct-v0.3 incorpora soporte nativo de llamadas a herramientas, pero la model card de esta conversión no lo documenta ni lo valida tras la fusión del LoRA.
- Despliegue local en CPU/GPU mediante llama.cpp, llama-cpp-python y Ollama.
- No dispone de capacidades de visión, audio ni modo de razonamiento explícito (thinking mode) según la información disponible.

## Casos de uso

- Análisis de sentimiento de reseñas en vietnamita: el adaptador LoRA se entrenó específicamente para esta tarea, de modo que se puede usar para clasificar opiniones de producto en comercio electrónico pidiendo una etiqueta concreta (positivo, negativo, neutro) en la respuesta.
- Moderación de comentarios en foros y redes sociales vietnamitas: el modelo permite detectar tono negativo o conflictivo en textos cortos y clasificarlos por categorías, con coste de inferencia bajo gracias a las cuantizaciones Q3 y Q4.
- Atención al cliente automatizada en vietnamita: con 8.192 tokens de contexto configurados (y margen hasta 32.768 en la arquitectura) puede mantener conversaciones multi-turno con historial e información de pedido adjunta.
- Traducción asistida vi↔en y resumen de documentos: al ser bilingüe y estar instruction-tuned, sirve para preprocesar documentación vietnamita antes de pasarla a otro sistema o para generar resúmenes en inglés.
- Extracción de información estructurada: se le puede pedir salida en JSON (por ejemplo, sentimiento, entidades y fecha de una reseña) para alimentar una base de datos o un pipeline de analítica.
- Despliegue en portátil o equipo sin GPU dedicada: con el fichero Q3_K_S de 2,95 GB y una VRAM estimada de unos 5,0 GB, el modelo es viable en portátiles con GPU de gama media y en equipos con RAM suficiente usando llama.cpp en CPU.
- Prototipado e investigación en PLN vietnamita: permite experimentar con un modelo de 7B en vietnamita sin depender de APIs externas ni de infraestructura de centro de datos.
- Comparación de pipelines de cuantización: disponer de cuatro niveles del mismo modelo facilita medir la degradación de calidad entre Q4_K_M y Q3_K_S en una tarea concreta como el análisis de sentimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de exactitud en análisis de sentimiento, ni para el modelo fusionado ni para las distintas cuantizaciones. Tampoco hay datos de latencia o throughput. Los resultados de búsqueda web recuperados no contienen información relevante sobre este modelo.

## Requisitos de hardware

- VRAM estimada según la model card: Q4_K_M ≈ 6,1 GB; Q4_K_S ≈ 5,9 GB; Q3_K_M ≈ 5,3 GB; Q3_K_S ≈ 5,0 GB.
- A esos valores hay que sumar la caché KV, que puede calcularse a partir de la configuración: 32 capas × 8 cabezas KV × 128 de dimensión × 2 (K y V) × 2 bytes en fp16 ≈ 128 KiB por token, es decir, aproximadamente 1,0 GiB con 8.192 tokens de contexto y unos 4,0 GiB con 32.768 tokens.
- GPU recomendadas: RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070/4080 y RTX 4090 para mayor throughput; A100 o H100 si se busca servir muchas peticiones concurrentes, donde el modelo queda muy sobredimensionado en VRAM.
- Cabe en GPU de consumo: sí, con los cuatro niveles de cuantización en tarjetas de 6-8 GB o superiores, siempre que se ajuste el contexto para no desbordar la VRAM.
- Opciones de despliegue: llama.cpp, llama-cpp-python, Ollama y LM Studio. Para servir en producción, llama.cpp con servidor propio es la ruta más directa; el soporte de GGUF en vLLM es parcial y TGI no está orientado a este formato.
- Latencia y throughput: no disponible. La model card no publica mediciones y el repositorio no tiene descargas registradas en el momento de la consulta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Mistral-7B-sentiment-analysis-Vietnamese-GGUF | 7,25 B | 32.768 tokens | vi, en | apache-2.0 (con matices, ver limitaciones) | GGUF (Q3/Q4) | Adaptado a sentimiento en vietnamita; sin benchmarks publicados |
| mistralai/Mistral-7B-Instruct-v0.3 | 7,25 B | 32.768 tokens | principalemente en | apache-2.0 | safetensors (bf16) | Modelo base; mayor calidad al no estar cuantizado, pero sin ajuste específico para vietnamita |
| Qwen2.5-7B-Instruct | 7,62 B (aprox.) | 32.768 tokens, ampliable con YaRN | multilingüe amplio | apache-2.0 | safetensors, GGUF | Cobertura multilingüe muy superior; no incluye un ajuste específico de sentimiento en vietnamita |
| Llama-3.1-8B-Instruct | 8,03 B (aprox.) | 128.000 tokens | 8 idiomas declarados | Llama 3.1 Community License | safetensors, GGUF | Contexto mucho mayor, pero licencia con restricciones y sin soporte declarado de vietnamita |

No hay datos de rendimiento comparado (MMLU, HumanEval u otras métricas) en la información disponible, por lo que la comparación se limita a especificaciones y licencias.

## Limitaciones y advertencias

- Riesgo de alucinación: la propia model card advierte de que el modelo puede generar información incorrecta y de que sus salidas no deben sustituir asesoramiento profesional en ámbitos críticos.
- Idiomas limitados a vietnamita e inglés. El rendimiento en castellano u otras lenguas no está documentado y previsiblemente será deficiente.
- Inconsistencia en el chat template: la model card lo describe como "Qwen2 ChatML" cuando el modelo base es Mistral. Si se aplica un template incorrecto, la calidad de las respuestas conversacionales caerá de forma acusada.
- Licencia: los metadatos de HuggingFace indican apache-2.0, pero la propia model card matiza que la licencia del repositorio se determinó tras verificar la licencia de origen y que no se autoasigna Apache-2.0. Conviene comprobar la licencia efectiva antes de un uso comercial.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, y sin benchmarks ni evaluaciones publicadas por el autor.
- La tarea de ajuste es análisis de sentimiento en vietnamita; fuera de ese dominio, el modelo se comporta esencialmente como el Mistral base con la posible degradación derivada de la fusión del LoRA.
- Cuantizaciones Q3_K_S y Q3_K_M aplican una compresión agresiva que puede degradar tareas sensibles al matiz, como la clasificación de sentimiento neutro frente a negativo.
- No se documentan sesgos específicos, composición del dataset de ajuste ni procesos de alineación adicionales, lo que dificulta evaluar riesgos de sesgo lingüístico o cultural.
- El modelo no ofrece visión, audio ni modo de razonamiento explícito, por lo que no es adecuado para tareas multimodales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BachDaThan/Mistral-7B-sentiment-analysis-Vietnamese-GGUF
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Adaptador LoRA: https://huggingface.co/quydau/Mistral-7B-sentiment-analysis-Vietnamese
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Los resultados de búsqueda web obtenidos no contienen enlaces relevantes sobre este modelo (papers, blogs o demos).
