# nekomimi-llc/LFM2.5-24B-A2B-smallthink-GGUF

## Resumen

LFM2.5-24B-A2B-smallthink es una compilación cuantizada en GGUF de un ajuste fino mediante LoRA sobre el modelo LiquidAI/LFM2.5-24B-A2B, un transformer de arquitectura Mixture of Experts (MoE) con 23.971.587.712 parámetros totales. El ajuste, desarrollado por nekomimi-llc, tiene un objetivo muy concreto: reducir el razonamiento interno del modelo base de aproximadamente 2.000 tokens a unos 70 tokens en tareas acotadas de búsqueda web, sin perder calidad en la respuesta final. El modelo base lo desarrolla LiquidAI y se distribuye bajo licencia LFM1.0.

El modelo resuelve un problema de latencia y coste en pipelines de agentes: el modelo base era preciso pero dedicaba entre 15 y 19 segundos a "pensar" antes de cada respuesta y, en ocasiones, agotaba el límite de tokens durante el razonamiento. El ajuste se entrenó sobre siete tareas fijas relacionadas con búsqueda y lectura de páginas web (triaje de resultados, reescritura de consultas, clasificación de evidencia, extracción de citas, generación de resúmenes y síntesis de respuestas).

Es relevante ahora porque demuestra que un ajuste fino ligero puede recortar drásticamente el coste de inferencia en tareas de agente estrechamente definidas, manteniendo una calidad comparable y reduciendo las afirmaciones no respaldadas por la evidencia. La compilación GGUF facilita su despliegue en hardware modesto, incluida una única GPU de 12 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), base LiquidAI/LFM2.5-24B-A2B |
| Parametros totales | 23.971.587.712 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF; los resultados publicados usan IQ3_XXS |
| Idiomas soportados | en |
| Licencia | lfm1.0 (other) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM2.5-24B-A2B, un transformer con arquitectura Mixture of Experts de aproximadamente 24.000 millones de parámetros totales. Sobre esa base, nekomimi-llc aplicó un ajuste fino mediante LoRA y fusionó el adaptador en los pesos, para después cuantizar el resultado a GGUF. El adaptador, el entrenador y los detalles del proceso están publicados en el repositorio nekomimi-llc/LFM2.5-24B-A2B-smallthink-lora.

El entrenamiento se realizó sobre el dataset nekomimi-llc/web-search-queries, con siete tareas, cada una con un system prompt fijo: search_triage, query_rewrite, preview_classify, preview_quotes, preview_summary, synthesis_assess y synthesis_digest. El modelo espera esos prompts exactos y un mensaje de usuario con los datos primero y las reglas de la tarea al final. No se documentan en la información disponible el número de tokens de entrenamiento, la composición completa del dataset ni si se emplearon técnicas de RLHF o DPO. La pérdida de validación (nats por token, formato pensamiento | respuesta) sobre 317 filas es de 2,447 | 0,934 para el modelo base y de 1,045 | 0,603 para este adaptador.

## Capacidades

- Generación de texto y razonamiento breve orientado a tareas de búsqueda web.
- Triaje de resultados de búsqueda: decidir si un resultado merece ser recuperado (fetch o skip).
- Reescritura de consultas en hasta tres variantes en formato JSON.
- Clasificación de evidencia de una página respecto a una consulta (direct, partial, background, none).
- Extracción de hasta tres citas textuales literales de la evidencia.
- Generación de resúmenes de vista previa fundamentados en la evidencia, en prosa plana.
- Evaluación de si los resúmenes responden a la consulta (answered, partial, unanswered).
- Síntesis de una respuesta breve fundamentada a partir de los resúmenes.
- Modo de pensamiento reducido: genera el razonamiento en el campo `reasoning_content` y la respuesta en `content` cuando se sirve con la plantilla `lfm25-template.jinja` mediante `--jinja` de llama.cpp.
- No se documenta soporte de tool calling genérico, agentes multi-paso, visión, audio ni capacidades multilingües más allá del inglés.

## Casos de uso

- Triaje de resultados en un buscador para agentes: el modelo decide en pocos tokens si cada resultado merece ser recuperado, lo que permite filtrar cientos de resultados por consulta con una latencia mediana de 1,32 s en la tarea de preview.
- Reescritura de consultas: genera hasta tres variantes en JSON para ampliar la cobertura de un motor de búsqueda antes de lanzar las peticiones.
- Clasificación de evidencia: etiqueta páginas como direct, partial, background o none respecto a una consulta, útil para ordenar y descartar fuentes en un pipeline de lectura.
- Extracción de citas: obtiene hasta tres fragmentos literales de una página para respaldar una respuesta, lo que facilita la verificación y la trazabilidad de las afirmaciones.
- Generación de vistas previas fundamentadas: redacta un párrafo en prosa sobre una página usando solo la evidencia suministrada, adecuado para interfaces de búsqueda que muestran resúmenes antes de abrir el enlace.
- Síntesis de respuestas para agentes: compone un párrafo final a partir de varios resúmenes, con menos afirmaciones no respaldadas (21 frente a 48 del modelo anterior en la tarea de digest).
- Servicio de búsqueda autoalojado: encaja en web-extract, un servicio de búsqueda y lectura de páginas para agentes, donde sustituye al modelo base reduciendo el tiempo de respuesta de 15-19 s a aproximadamente 1,3 s.
- Despliegue en hardware modesto: al cuantizarse a IQ3_XXS cabe en una única GPU de 12 GB, lo que permite ofrecer estas tareas en servidores de gama media.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 79 solicitudes retenidas de web-extract (40 previews, 39 digests), ambos modelos cuantizados igual (IQ3_XXS) y servidos con llama.cpp en una GPU de 12 GB, con pensamiento completo permitido y máximo de 4.096 tokens. Los tiempos se midieron en un fork de llama.cpp con decodificación especulativa (unos 105 tokens por segundo para este modelo).

| Tarea | Modelo | Tiempo mediano hasta la respuesta | Tokens de pensamiento medianos | Alcanzó el límite de tokens | Respuesta vacía |
|---|---|---|---|---|---|
| preview | base | 15,3 s | 1.978 | 6 de 40 | 6 de 40 |
| preview | smallthink | 1,32 s | 65 | 0 | 0 |
| digest | base | 19,4 s | 2.433 | 7 de 39 | 5 de 39 |
| digest | smallthink | 1,38 s | 66 | 0 | 0 |

Calidad evaluada a ciegas por pares con Claude Opus frente al modelo que web-extract usaba antes (un modelo ternario de 27B):

| Tarea | Victorias del modelo anterior | Victorias de smallthink | Afirmaciones no respaldadas, anterior | Afirmaciones no respaldadas, smallthink |
|---|---|---|---|---|
| preview (40) | 22 | 18 | 23 | 20 |
| digest (39) | 21 | 18 | 48 | 21 |

En una ejecución anterior del mismo test, el modelo base LFM obtuvo 18 victorias de 40 en previews y 12 de 39 en digests frente al mismo oponente. El autor advierte que los recuentos del juez varían en algunos elementos entre ejecuciones sobre respuestas idénticas, por lo que 22 frente a 18 debe leerse como aproximadamente empate.

## Requisitos de hardware

- VRAM estimada: el autor sirve el modelo cuantizado a IQ3_XXS en una única GPU de 12 GB; el repositorio ocupa 17,9 GB, por lo que otras cuantizaciones requieren más memoria.
- GPU recomendadas: una GPU de 12 GB es suficiente para IQ3_XXS; no se documentan recomendaciones para A100, H100 o RTX 4090.
- GPU de consumo: sí cabe en GPUs de consumo con al menos 12 GB de VRAM en la cuantización indicada.
- Opciones de despliegue: llama.cpp, con la plantilla `lfm25-template.jinja` y la opción `--jinja` para separar razonamiento y respuesta. No se documentan otros motores como vLLM, Ollama o TGI.
- Latencia y throughput: unos 105 tokens por segundo en el fork de llama.cpp con decodificación especulativa del autor; llama.cpp estándar decodificará más despacio. Tiempo mediano hasta la respuesta de 1,32 s en preview y 1,38 s en digest.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| LFM2.5-24B-A2B-smallthink (este) | 23.971.587.712 totales (MoE) | no disponible | lfm1.0 | GGUF en Hugging Face | Pensamiento de unos 65-66 tokens; 1,3 s de latencia mediana |
| LiquidAI/LFM2.5-24B-A2B (base) | 23.971.587.712 totales (MoE) | no disponible | lfm1.0 | Pesos en Hugging Face | Pensamiento de unos 2.000-2.400 tokens; 15-19 s de latencia mediana |
| Modelo ternario de 27B (usado previamente en web-extract) | 27B | no disponible | no disponible | no disponible | Ganó 22 de 40 previews y 21 de 39 digests frente a smallthink; más afirmaciones no respaldadas |

## Limitaciones y advertencias

- Entrenado solo para siete tareas estrechas con system prompts fijos; fuera de ellas su comportamiento no está probado y puede pensar brevemente sobre cuestiones que requerirían más razonamiento.
- Las respuestas son cortas; pierde ligeramente más comparaciones cara a cara de las que gana frente a un modelo mayor que piensa más, aunque gana en velocidad y en menor número de afirmaciones no respaldadas.
- El modelo profesor introdujo comillas invertidas de Markdown en 767 respuestas en prosa pese a pedirse prosa plana, y una primera versión del adaptador adquirió el hábito (15 de 39 digests); esta versión lo corrige según el autor.
- Riesgo de alucinación: aunque los prompts exigen usar solo la evidencia suministrada y no seguir instrucciones embebidas en los datos, el modelo puede generar afirmaciones no respaldadas (20 en previews y 21 en digests en la evaluación publicada).
- Solo soporta inglés.
- Licencia lfm1.0 (other): es necesario revisar los términos del archivo LICENSE del repositorio antes de un uso comercial.
- Los tiempos publicados se midieron con un fork de llama.cpp con decodificación especulativa; con llama.cpp estándar la decodificación será más lenta, aunque el número de tokens de pensamiento se mantiene.
- La longitud de contexto y el número de parámetros activos no están disponibles en la información proporcionada.
- No se documentan sesgos conocidos más allá de los derivados del dataset de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nekomimi-llc/LFM2.5-24B-A2B-smallthink-GGUF
- Adaptador LoRA, entrenador y detalles: https://huggingface.co/nekomimi-llc/LFM2.5-24B-A2B-smallthink-lora
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B
- Dataset de entrenamiento: https://huggingface.co/datasets/nekomimi-llc/web-search-queries
- Servicio web-extract: https://git.nkp.pet/okami.mom/web-extract-go
- Prompts y ejemplos por tarea: PROMPTS.md (en el repositorio del modelo)
