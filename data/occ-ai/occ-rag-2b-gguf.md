# occ-ai/OCC-RAG-2B-GGUF

## Resumen

OCC-RAG-2B-GGUF es la distribucion en formato GGUF del modelo OCC-RAG-2B, desarrollado por occ-ai (Optimal Cognitive Core). Se trata de un modelo especializado en generacion aumentada por recuperacion (RAG) y respuesta fundamentada en evidencia: recibe una pregunta junto con un conjunto de pasajes recuperados y devuelve una respuesta en JSON que cita los identificadores de las fuentes que la sustentan, o bien marca el resultado como `UNANSWERABLE` cuando la evidencia es insuficiente.

El modelo parte de OCC-RAG-2B, entrenado a su vez desde Qwen3.5-2B-Unloop. Con 1.881.825.088 parametros (aproximadamente 1,88 mil millones), se posiciona como una alternativa compacta frente a modelos mayores: segun el autor, el checkpoint original supera en media a Qwen3.5-4B y Qwen3.5-9B en siete tareas que cubren razonamiento multi-salto, QA financiera y fidelidad al contexto.

Esta release GGUF es relevante porque lleva el modelo a inferencia local con un peso minimo de 1,29 GB en cuantizacion Q4_K_M, lo que permite desplegarlo en hardware de consumo. Incluye tokenizador y una plantilla de chat consciente de documentos que numera los pasajes automaticamente, y es compatible con llama.cpp y Ollama mediante plantilla Jinja.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de Qwen3.5-2B-Unloop) |
| Parametros totales | 1.881.825.088 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q8_0, BF16 |
| Idiomas soportados | ingles, ruso |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de detalles arquitectonicos completos en la informacion proporcionada. El modelo base OCC-RAG-2B fue entrenado a partir de Qwen3.5-2B-Unloop, un checkpoint de la familia Qwen3.5, por lo que hereda la arquitectura transformer de dicha familia; sin embargo, la model card no especifica configuracion de capas, atencion ni dimensiones ocultas. Tampoco se documentan el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO.

La innovacion tecnica destacable es el formato de interaccion orientado a RAG: una plantilla de chat con tokens especiales (`<|query_start|>`, `<|source_start|>`, `<|source_id|>`, `<|source_end|>`) que delimita la pregunta y cada pasaje recuperado con un identificador numerico. El modelo opera en modo thinking (genera su propia etiqueta `` un objeto JSON con los campos `status`, `sources`, `answer` y `full_answer`. El autor recomienda decodificacion greedy (`temperature=0`).

## Capacidades

- Respuesta fundamentada en documentos (grounded QA): responde unicamente a partir de los pasajes suministrados.
- Citas estructuradas: devuelve los IDs de las fuentes que sustentan la respuesta en el campo `sources`.
- Deteccion de evidencia insuficiente: emite `status: UNANSWERABLE` cuando los pasajes no permiten responder.
- Salida estructurada en JSON con campos separados para respuesta corta (`answer`) y respuesta completa (`full_answer`).
- Razonamiento multi-salto sobre multiples pasajes, segun las tareas de evaluacion del autor.
- Modo thinking con etiquetas ``.
- Capacidades multilingues limitadas a ingles y ruso.
- Integracion con llama.cpp (servidor compatible con API de endpoints) y Ollama mediante importacion GGUF.

## Casos de uso

- Atencion al cliente sobre base documental: el modelo recibe los fragmentos recuperados de una base de conocimiento y genera respuestas citando el documento exacto, lo que facilita la trazabilidad y la auditoria de respuestas.
- QA sobre documentacion interna: integrado en un pipeline de recuperacion (por ejemplo, busqueda vectorial) para responder preguntas sobre manuales, politicas o procedimientos, con la garantia de devolver `UNANSWERABLE` si el contexto no cubre la pregunta.
- Analisis financiero asistido: el autor evalua el modelo en tareas de QA financiera, por lo que encaja en la extraccion de datos concretos (cifras, fechas, condiciones) de informes y estados financieros recuperados.
- Razonamiento multi-salto en investigacion documental: combinacion de varios pasajes para responder preguntas cuya respuesta requiere cruzar informacion de fuentes distintas, con citas de cada una.
- Despliegue local y en el borde: con 1,29 GB en Q4_K_M puede ejecutarse en portatiles y estaciones de trabajo sin GPU dedicada mediante llama.cpp u Ollama, util para entornos con requisitos de privacidad donde los documentos no pueden salir del dispositivo.
- Generacion de respuestas con formato consumible por maquina: la salida JSON permite integrar el modelo en flujos automatizados (por ejemplo, un servicio que valide `status` y `sources` antes de mostrar la respuesta al usuario final).
- Asistencia documental en ruso e ingles: util para organizaciones que operan en ambos idiomas y necesitan un unico modelo para QA fundamentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks detallados en la informacion disponible. La model card indica que el checkpoint original OCC-RAG-2B supera en media a Qwen3.5-4B y Qwen3.5-9B en siete tareas de razonamiento multi-salto, QA financiera y fidelidad al contexto, pero remite a la pagina del modelo base para los resultados completos. Asimismo, se advierte de que la precision de las variantes GGUF individuales aun no se ha medido.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,3 GB con Q4_K_M, 1,4 GB con Q5_K_M, 2,0 GB con Q8_0 y 3,8 GB con BF16 (tamanos de fichero; el consumo real anade overhead de contexto y cache KV).
- GPU recomendadas: no especificadas por el autor. Por tamano, cualquier GPU consumer con 4 GB o mas de VRAM puede alojar las cuantizaciones Q4_K_M y Q5_K_M; Q8_0 y BF16 requieren al menos 4 GB.
- Cabe en GPU consumer: si, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o equivalentes con las cuantizaciones compactas.
- Despliegue: llama.cpp (build con soporte Qwen3.5, `llama-server --jinja`), Ollama mediante importacion del GGUF, y servidores compatibles con la API de endpoints.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| OCC-RAG-2B-GGUF | 1,88 B | no disponible | Apache 2.0 | GGUF en HF | Especializado en RAG con citas y salida JSON |
| Qwen3.5-4B | 4 B (aprox.) | no disponible | no disponible | no disponible | El autor afirma que OCC-RAG-2B lo supera en media en siete tareas |
| Qwen3.5-9B | 9 B (aprox.) | no disponible | no disponible | no disponible | El autor afirma que OCC-RAG-2B lo supera en media en siete tareas |
| Qwen3.5-2B-Unloop | 2 B (aprox.) | no disponible | no disponible | HF (modelo base de entrenamiento) | Checkpoint del que parte OCC-RAG-2B |

Los datos de contexto y licencia de los modelos comparables no se detallan en la informacion proporcionada.

## Limitaciones y advertencias

- La calidad de las respuestas depende exclusivamente de la evidencia presente en los pasajes recuperados; un mal retrieval degrada directamente el resultado.
- Los benchmarks publicados corresponden al checkpoint original OCC-RAG-2B; la precision de cada variante GGUF no se ha medido.
- Soporte de idiomas limitado a ingles y ruso; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Riesgo de alucinacion no cuantificado: aunque el modelo esta disenado para citar fuentes y marcar `UNANSWERABLE`, no se documentan tasas de error ni pruebas de fidelidad especificas para esta release.
- Sesgos conocidos: no documentados en la informacion disponible.
- Requiere un build de llama.cpp con soporte para Qwen3.5 y el uso de la plantilla de chat incluida; alterar el formato de tokens especiales puede romper el comportamiento esperado.
- En Ollama es necesario usar `raw: true` con el prompt renderizado manualmente para preservar los limites de fuente y sus IDs.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar el fichero LICENSE del repositorio para los terminos exactos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/occ-ai/OCC-RAG-2B-GGUF
- Modelo base: https://huggingface.co/occ-ai/OCC-RAG-2B
- Benchmarks del modelo base: https://huggingface.co/occ-ai/OCC-RAG-2B#evaluation
- Base de entrenamiento: https://huggingface.co/occ-ai/Qwen3.5-2B-Unloop
- Repositorio GitHub: https://github.com/optimal-cognitive-core/OCC-RAG
- Documentacion de importacion GGUF en Ollama: https://docs.ollama.com/import
- API Generate de Ollama: https://docs.ollama.com/api/generate
