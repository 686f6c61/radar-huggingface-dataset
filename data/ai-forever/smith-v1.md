# ai-forever/SMITH-v1

## Resumen

SMITH-v1 es un agente de recuperación multi-salto (multi-hop retrieval) desarrollado por ai-forever, el equipo del consorcio ruso de IA (Sber/Artificial Intelligence Research Institute). A diferencia de un modelo generativo de propósito general, SMITH está especializado en seleccionar documentos relevantes dentro de un corpus para responder consultas que requieren encadenar varias búsquedas. Su función principal es actuar como recuperador dentro de pipelines RAG: recibe una pregunta y devuelve un conjunto de documentos, y rinde mejor cuando la consulta nombra explícitamente la entidad a buscar.

El modelo se publica en Hugging Face con licencia MIT, soporte para ruso e inglés y un total de 10.672.535.616 parámetros según los pesos en safetensors (un tamaño aproximado de 10,7 mil millones). La model card lo describe como un agente de recuperación que se integra con FRIDA-Decisions, un clasificador de enrutamiento que decide cuándo derivar una consulta a SMITH y cuándo a DeepSeek V4.1 Flash. Es relevante porque demuestra un enfoque de especialización por tarea: en lugar de un LLM generalista, un modelo compacto dedicado a la recuperación que compite con sistemas mucho mayores en benchmarks de búsqueda.

La arquitectura declarada en los tags es `deepseek_v3`, lo que sugiere una base derivada de la familia DeepSeek V3 (transformer con mezcla de expertos), aunque la model card no detalla la configuración interna. El contexto, los datos de entrenamiento y los detalles de cuantización no se especifican en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | deepseek_v3 (según tag de Hugging Face; detalles no disponibles) |
| Parámetros totales | 10.672.535.616 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | ruso (ru), inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Librería | transformers |
| Pipeline | text-generation |
| Tamaño del repositorio | 21,4 GB |

## Arquitectura y entrenamiento

La información disponible indica que SMITH-v1 se etiqueta con la arquitectura `deepseek_v3`, lo que apunta a una base derivada de la familia DeepSeek V3, caracterizada por un transformer con mezcla de expertos (MoE) y atención multi-cabeza latente (MLA). No obstante, la model card no confirma si se conserva la estructura MoE completa, el número de expertos ni los parámetros activos por token, por lo que estos datos deben considerarse no disponibles.

Respecto al entrenamiento, la model card no publica el número de tokens, la composición del dataset, ni si se aplicaron fases de RLHF, DPO o ajuste supervisado específico para la tarea de recuperación. Lo que sí se documenta es el comportamiento esperado: el modelo está optimizado para consultas que nombran la entidad a buscar, y se recomienda combinarlo con FRIDA-Decisions para enrutar preguntas en las que la entidad debe inferirse a partir de pistas. El benchmark RUMBA se evalúa con el embedder FRIDA, lo que sugiere que el pipeline de recuperación combina SMITH con componentes de embedding del mismo equipo.

## Capacidades

- Recuperación multi-salto: selecciona documentos relevantes encadenando varias búsquedas dentro de un corpus.
- Generación de texto: pipeline declarado como `text-generation`.
- Uso de herramientas (tool-use): etiquetado explícitamente en la model card.
- Recuperación (retrieval): capacidad central del modelo.
- Conversación: soporte de interacción conversacional según los tags.
- Multilingüe limitado: ruso e inglés.
- Integración con enrutamiento: puede combinarse con FRIDA-Decisions para decidir cuándo delegar en un LLM mayor.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Pipelines RAG sobre documentación técnica en ruso o inglés: SMITH selecciona los fragmentos relevantes de un corpus antes de pasarlos a un LLM generador, reduciendo el ruido en el contexto y el coste de tokens.
- Búsqueda empresarial multi-salto: para preguntas que requieren encadenar información de varios documentos (por ejemplo, localizar un contrato y luego sus anexos), el modelo devuelve el conjunto de documentos relevantes con ranking.
- Asistentes de atención al cliente con base de conocimiento: el agente recupera artículos y políticas internas antes de que un modelo generativo redacte la respuesta, manteniendo la trazabilidad de las fuentes.
- Investigación académica y bibliográfica: recuperación de artículos relevantes en ruso e inglés a partir de consultas que nombran autores, entidades o conceptos concretos.
- Enrutamiento híbrido con LLM mayor: combinado con FRIDA-Decisions, se usa SMITH para consultas de recuperación directa y se deriva a DeepSeek V4.1 Flash cuando la entidad debe inferirse, optimizando coste y latencia.
- Sistemas de soporte legal o regulatorio: localización de normativa y precedentes en corpus extensos donde la consulta identifica explícitamente la entidad o el artículo.
- Evaluación de calidad de recuperación: sirve como recuperador de referencia en benchmarks DRAGON, GigaSearch, RUMBA y TRuST para comparar pipelines.

## Benchmarks y rendimiento

La model card publica Recall@10 (%) sobre cuatro benchmarks. Cada benchmark contribuye por igual a la media. Si un agente selecciona menos de diez documentos, las posiciones restantes se rellenan con el ranking del embedder.

| Modelo | Media | DRAGON (hard 100) | GigaSearch | RUMBA (hard 157) | TRuST |
|---|---:|---:|---:|---:|---:|
| Qwen3-Embedding-4B* | 44,9 | 32,0 | 58,1 | 76,4 | 13,1 |
| DeepSeek V4.1 Flash | 66,5 | 61,5 | 67,3 | 90,8 | 46,3 |
| DeepSeek V4.1 Flash + FRIDA-Decisions + SMITH† | 64,6 | 57,3 | 67,9 | 89,9 | 43,2 |
| SMITH | 62,3 | 60,8 | 72,1 | 88,9 | 27,4 |

\* La línea base de embedder usa Qwen3-Embedding-4B, con ai-forever/FRIDA para RUMBA.
† FRIDA-Decisions enruta a SMITH cuando su probabilidad de "sí" es 0,75 o inferior, y a DeepSeek en caso contrario. El resultado enrutado se midió con la versión anterior de SMITH; la fila de SMITH independiente corresponde a SMITH-v1.

SMITH-v1 supera a DeepSeek V4.1 Flash en GigaSearch (72,1 frente a 67,3) y queda cerca en RUMBA (88,9 frente a 90,8), pero cae de forma notable en TRuST (27,4 frente a 46,3) y en DRAGON (60,8 frente a 61,5). No se han publicado resultados de MMLU, HumanEval ni GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 10,67 mil millones de parámetros, en FP16 se requieren aproximadamente 21,4 GB solo para los pesos, más memoria para el contexto y el estado de atención; en cuantización de 8 bits, unos 11 GB; en 4 bits, alrededor de 6 GB. Estas cifras son estimaciones por tamaño y no proceden de la model card.
- GPU recomendadas: A100 (40/80 GB) o H100 para FP16 sin cuantizar; L40S o RTX 6000 Ada para despliegues con cuantización.
- GPU de consumo: una RTX 4090 (24 GB) puede alojar los pesos en FP16 al límite, pero el contexto adicional puede provocar OOM; con cuantización de 8 o 4 bits cabe con holgura en RTX 4090, RTX 4080 y GPUs con 12-16 GB.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles (tag `endpoints_compatible`); vLLM, llama.cpp u Ollama no están confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Recall@10 medio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SMITH-v1 | 10,67 B | no disponible | 62,3 | MIT | Hugging Face (ai-forever) |
| DeepSeek V4.1 Flash | no disponible | no disponible | 66,5 | no disponible | no disponible en la información |
| Qwen3-Embedding-4B | 4 B (embedder) | no disponible | 44,9 | no disponible | Hugging Face (Qwen) |
| FRIDA-Decisions | no disponible | no disponible | no aplica (enrutador) | no disponible | Hugging Face (ai-forever) |

SMITH-v1 ofrece un equilibrio distinto al de DeepSeek V4.1 Flash: gana en GigaSearch y pierde en TRuST y en la media global. Frente a un embedder puro como Qwen3-Embedding-4B, la mejora en Recall@10 es sustancial (62,3 frente a 44,9), lo que justifica su uso como recuperador dedicado en pipelines RAG.

## Limitaciones y advertencias

- Rinde peor cuando la consulta no nombra la entidad a buscar; para esos casos el autor recomienda enrutar con FRIDA-Decisions.
- El rendimiento en TRuST es bajo (27,4), muy por debajo de DeepSeek V4.1 Flash (46,3), lo que sugiere debilidad en ese tipo de consultas.
- Solo soporta ruso e inglés; no se documentan otros idiomas.
- No se publican detalles de sesgos, datos de entrenamiento ni evaluación de alucinación; el riesgo de recuperar documentos irrelevantes existe y debe mitigarse con verificación posterior.
- La licencia MIT permite uso comercial, pero el modelo se distribuye sin garantías y el autor no documenta restricciones adicionales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción ni comunidad que valide el comportamiento.
- No se especifican la longitud de contexto ni los tipos de cuantización soportados, lo que complica el dimensionamiento de despliegues.
- El resultado enrutado de la tabla se midió con la versión anterior de SMITH, no con SMITH-v1.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ai-forever/SMITH-v1
- FRIDA-Decisions: https://huggingface.co/ai-forever/FRIDA-Decisions
- FRIDA (embedder): https://huggingface.co/ai-forever/FRIDA
- Qwen3-Embedding-4B: https://huggingface.co/Qwen/Qwen3-Embedding-4B
