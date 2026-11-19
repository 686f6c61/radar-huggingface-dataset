# Kausp11/querylm-dclm-400m-sft-search

## Resumen
QueryLM 400M (DCLM-Edu), search fine-tuned, es un modelo de lenguaje de tipo decoder-only desarrollado por el usuario Kausp11 y publicado en Hugging Face. Se trata de la variante afinada para conversación del modelo base `Kausp11/querylm-dclm-400m`, entrenado desde cero sobre texto que incorpora bloques de búsqueda en línea (una consulta seguida de un pasaje recuperado). El objetivo es que el modelo aprenda a escribir consultas y a leer pasajes como parte de la generación de texto ordinaria, sin depender de una arquitectura externa de agentes.

El modelo emplea una arquitectura estilo nanochat con 14 capas, anchura de 1.280, 10 cabezas de atención, feed-forward de 5.120 y una longitud de contexto de 4.095 tokens. Reporta 401,2 M de parámetros (842,2 M almacenados, incluyendo value embeddings) y se distribuye en formato safetensors con código personalizado (`modeling_nanochat.py`), por lo que requiere `trust_remote_code=True` para cargarse con transformers.

Su relevancia radica en que integra el mecanismo de búsqueda dentro del propio flujo generativo mediante tokens especiales (`<WEB_QUERY>`, `</WEB_QUERY>`, `<WEB_RESPONSE>`, `</WEB_RESPONSE>`), lo que permite al desarrollador intercalar un recuperador propio (BM25, API de búsqueda web, etc.) sin reentrenar el modelo. Es un modelo pequeño, en inglés y con licencia no especificada, orientado a experimentación e investigación más que a producción a gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only estilo nanochat (transformer), 14 capas, anchura 1.280, 10 cabezas, feed-forward 5.120, head dim 128 |
| Parametros totales | 401,2 M reportados (842,2 M almacenados, incluyendo value embeddings) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.095 tokens |
| Tipos de cuantizacion | No disponible (solo se documenta bfloat16 en el ejemplo de uso) |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible |
| Formato de pesos | safetensors (con código personalizado `modeling_nanochat.py`) |

## Arquitectura y entrenamiento
La arquitectura es un decoder transformer de estilo nanochat con 14 capas, anchura de 1.280, 10 cabezas de atención, dimensión de cabeza 128 y feed-forward de 5.120, con un contexto máximo de 4.095 tokens. El tokenizador es el de SmolLM2 ampliado con cuatro tokens especiales para los bloques de búsqueda, alcanzando un vocabulario de 49.156 entradas. El modelo incorpora value embeddings, lo que explica la diferencia entre los 401,2 M de parámetros reportados y los 842,2 M almacenados en safetensors.

El preentrenamiento se realizó sobre DCLM-Edu, anotado con bloques de búsqueda por un modelo anotador afinado (Gemma 4 E4B-it con un adaptador LoRA). El anotador marca posiciones donde una búsqueda resultaría útil (probabilidad de inserción de al menos 0,05 y separación mínima de 40 caracteres) y redacta consultas de hasta 24 tokens. Los pasajes provienen de recuperación BM25 sobre el corpus web público Sphere y se acortan mediante limpieza extractiva; una inserción solo se conserva si el pasaje solapa con el texto posterior del documento (ROUGE-1 F1 de al menos 0,1 frente a los siguientes 260 caracteres). El presupuesto de preentrenamiento fue de 10.100 actualizaciones, 10,6 B de tokens procesados (6,8 B de documentos), con lotes de 256 secuencias de 4.095 tokens (1.048.320 tokens por actualización), optimizador Muon para pesos matriciales (LR pico 0,02828) y AdamW para embeddings y cabeza de salida, con 40 pasos de calentamiento y decaimiento lineal hasta el 5 % del pico.

El ajuste fino se realizó durante una época sobre aproximadamente 53.000 conversaciones usuario-asistente: un 64 % para habilidades generales de chat (subconjuntos de SmolTalk), un 15 % para tool calling (subconjuntos de SmolTalk2) sin búsqueda, y un 21 % de conversaciones de SmolTalk cuyos turnos del asistente fueron anotados con bloques de búsqueda mediante el mismo pipeline del preentrenamiento (38.436 bloques en 9.713 conversaciones). En total, 35,2 M de tokens empaquetados en secuencias de 4.096 tokens, con pérdida sobre el texto del asistente, las consultas y el fin de turno; los tags de respuesta y el pasaje no contribuyen a la pérdida, de modo que el modelo no genera pasajes: los aporta el llamador.

## Capacidades
- Generación de texto causal en inglés, utilizable como modelo de lenguaje convencional sin búsqueda.
- Generación de consultas de búsqueda estructuradas mediante los tokens `<WEB_QUERY>` y `</WEB_QUERY>` (hasta 24 tokens por consulta).
- Lectura e integración de pasajes recuperados externamente insertados entre `<WEB_RESPONSE>` y `</WEB_RESPONSE>` para continuar la respuesta.
- Conversación multi-turno en formato de texto plano con prefijos `System:`, `User:` y `Assistant:`, sin plantilla de chat (`apply_chat_template` no aplica).
- Tool calling y function calling, adquiridos mediante el ajuste fino con subconjuntos de SmolTalk2 (15 % de los datos de SFT).
- Habilidades generales de chat y asistencia, procedentes de los subconjuntos de SmolTalk (64 % de los datos de SFT).
- No dispone de visión, audio ni modo de razonamiento extendido (thinking mode) documentados.

## Casos de uso
- Asistente conversacional con búsqueda web integrada: el desarrollador ejecuta el modelo para que emita una consulta, la envía a su recuperador (API de búsqueda, índice BM25) e inserta el pasaje en el bloque `<WEB_RESPONSE>` para que el modelo redacte la respuesta final; el formato de bloques hace que el flujo sea explícito y controlable.
- Respuesta a preguntas sobre documentación interna: con un índice BM25 sobre manuales o wikis corporativas, el modelo genera la consulta, recibe el fragmento relevante y compone la respuesta, todo dentro de la ventana de 4.095 tokens.
- Prototipado de pipelines RAG de bajo coste: al ser un modelo de 401,2 M de parámetros, puede ejecutarse en CPU en bfloat16 (como demuestra el ejemplo de la model card) para validar la lógica de recuperación antes de escalar a modelos mayores.
- Investigación sobre modelos que aprenden a buscar: sirve como banco de pruebas para estudiar cómo un modelo pequeño aprende a decidir cuándo insertar una consulta y cómo interpreta el pasaje recuperado, dado que el preentrenamiento incluye bloques de búsqueda anotados.
- Integración en agentes con tool calling: los datos de SmolTalk2 permiten al modelo emitir llamadas a funciones dentro de conversaciones, útil para asistentes que combinan búsqueda y herramientas externas.
- Educación y demostraciones técnicas: el script de la model card muestra el ciclo completo consulta-recuperación-respuesta en pocas líneas, adecuado para talleres o tutoriales sobre recuperación aumentada.
- Clasificación y reescritura de consultas: el modelo puede generar consultas cortas (máximo 24 tokens) a partir de una pregunta del usuario, reutilizables como entrada de un motor de búsqueda independiente.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente incluye la salida de un script de ejemplo en CPU con un pasaje fijo, que el propio autor advierte que muestra la mecánica y no la precisión del modelo.

## Requisitos de hardware
- VRAM estimada para inferencia: al tratarse de un modelo de 401,2 M de parámetros reportados (842,2 M almacenados), en bfloat16 los pesos ocupan aproximadamente 1,7 GB (tamaño del repositorio); en float32 serían unos 3,4 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM es suficiente; el ejemplo de la model card se ejecutó en CPU en bfloat16 con torch 2.8.0 y transformers 4.56.0.
- Cabe en GPU consumer: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares, con amplio margen.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requisito del código personalizado `modeling_nanochat.py`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y el formato GGUF no está disponible en el repositorio.
- Latencia y throughput estimados: no disponibles; el autor solo reporta una ejecución de ejemplo en CPU sin métricas de tiempo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| QueryLM 400M SFT search (este modelo) | 401,2 M reportados (842,2 M almacenados) | 4.095 tokens | Inglés | No disponible | safetensors + custom code | Búsqueda integrada mediante tokens especiales; SFT con tool calling |
| SmolLM2 (familia, referencia del tokenizador) | No disponible en la informacion | No disponible | No disponible | No disponible | No disponible | El tokenizador de QueryLM se basa en el de SmolLM2 |
| Gemma 4 E4B-it (anotador usado en el pipeline) | No disponible en la informacion | No disponible | No disponible | No disponible | No disponible | Usado con un adaptador LoRA para anotar bloques de búsqueda, no como modelo comparable directo |

No se dispone de datos de benchmarks ni de especificaciones completas de modelos alternativos en la información proporcionada para establecer una comparación cuantitativa rigurosa.

## Limitaciones y advertencias
- El modelo solo soporta inglés; no se documenta soporte multilingüe.
- La ventana de contexto es de 4.095 tokens, muy limitada para conversaciones largas o documentos extensos.
- Riesgo de alucinación: el ejemplo de la model card produce una respuesta factualmente incorrecta (afirma que Canberra es la ciudad más grande de Australia y capital de Queensland), lo que evidencia que el modelo puede deformar el pasaje recuperado; el autor advierte que la salida muestra la mecánica, no la precisión.
- El modelo no genera pasajes: los tags de respuesta y el pasaje no contribuyen a la pérdida, por lo que el llamador debe aportar siempre el contenido recuperado.
- No hay plantilla de chat: el formato es texto plano con prefijos `System:`, `User:` y `Assistant:`, y `apply_chat_template` no es aplicable.
- Requiere `trust_remote_code=True`, lo que ejecuta código del repositorio; el autor recomienda fijar `revision=` a un commit revisado.
- Licencia no disponible: no se puede confirmar el uso comercial ni las restricciones de redistribución.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa de la comunidad.
- El pipeline de anotación depende de un modelo anotador (Gemma 4 E4B-it con LoRA) y de recuperación BM25 sobre Sphere; la calidad de los bloques de búsqueda hereda las limitaciones de ese pipeline.
- No se documentan cuantizaciones oficiales ni soporte en motores de inferencia de alto rendimiento (vLLM, TGI, llama.cpp), lo que limita su despliegue en producción.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Kausp11/querylm-dclm-400m-sft-search
- Modelo base: https://huggingface.co/Kausp11/querylm-dclm-400m
- Dataset de preentrenamiento DCLM-Edu: https://huggingface.co/datasets/HuggingFaceTB/dclm-edu
- Corpus web Sphere: https://github.com/facebookresearch/Sphere
