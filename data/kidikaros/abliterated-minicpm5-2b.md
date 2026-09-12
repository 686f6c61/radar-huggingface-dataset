# KidIkaros/abliterated-minicpm5-2b

## Resumen

abliterated-minicpm5-2b es una variante «abliterada» (sin direcciones de rechazo) del modelo MiniCPM5-2B de OpenBMB, publicada por el usuario KidIkaros en HuggingFace. Se trata de un transformer denso decoder-only de 2.516.756.480 parámetros (unos 2,52 mil millones), distribuido en formato nativo PyTorch/safetensors y con licencia Apache 2.0. El proceso de abliteración se ha aplicado con la herramienta OBLITERATUS y elimina las direcciones de rechazo en 20 capas consideradas «fuertes» (capas 13, 17 y 20 a 41), según la información del repositorio GGUF hermano.

El problema que aborda es el del exceso de rechazos (over-refusal) en modelos alineados: el modelo base tiende a negarse a responder ante peticiones que percibe como sensibles, incluso cuando son legítimas. La abliteración busca eliminar ese comportamiento sin degradar la coherencia ni el conocimiento del modelo. Según las métricas declaradas por el autor, la perplejidad baja de 5,27 a 5,13, la coherencia sube de 0,667 a 0,800 y la tasa de rechazo cae al 0 % con una puntuación de capacidad de 1,0.

Su relevancia es doble. Por un lado, es un modelo pequeño (2,5 B) que puede ejecutarse en hardware de consumo, lo que lo hace atractivo para despliegues locales y en el borde. Por otro, es una pieza útil para investigación en seguridad y alineación, ya que permite comparar el comportamiento del modelo base frente al abliterado sobre el mismo conjunto de prompts. Conviene señalar que el repositorio tiene 0 descargas y 0 «likes» en el momento de redactar esta ficha, y que las métricas de abliteración proceden exclusivamente del autor, sin validación independiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (etiquetas del repo: `transformer`, `llama`) |
| Parámetros totales | 2.516.756.480 (≈2,52 mil millones), dato real de safetensors |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 131.072 tokens (dato del modelo base MiniCPM5-2B según Artificial Analysis) |
| Tipos de cuantización | No disponible en esta ficha; existe un repositorio GGUF hermano (`KidIkaros/abliterated-minicpm5-2b-ggml`) sin detalle de cuantizaciones publicado |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (PyTorch, compatible con `transformers`) |
| Modelo base | openbmb/MiniCPM5-2B |
| Tamaño del repositorio | 5,0 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer decoder-only denso orientado a generación de texto, con una ventana de contexto de 131.072 tokens y conocimiento declarado hasta diciembre de 2025 según el análisis de terceros de Artificial Analysis. El repositorio etiqueta el modelo como `llama` y `transformer`, lo que sugiere una implementación compatible con el ecosistema Llama, si bien el código del modelo base puede requerir `trust_remote_code=True`, tal como muestra el ejemplo de uso de la model card.

Sobre el entrenamiento del modelo base no se proporciona información en los datos disponibles: no hay número de tokens, composición del dataset, ni detalle de fases de RLHF o DPO. Lo que sí está documentado es el post-procesado: la abliteración con OBLITERATUS, que identifica y sustrae las direcciones de rechazo en 20 capas concretas (13, 17, 20 a 41). Esta técnica no reentrena el modelo; modifica los pesos para eliminar la dirección latente asociada al comportamiento de negativa. El autor declara una retención de perplejidad de aproximadamente el 97 % y un 100 % de eliminación de rechazos en prompts dañinos. Existe una discrepancia de cifras entre fuentes: el repositorio GGUF describe el modelo como «~2,8 B dense parameters», mientras que el recuento real de safetensors es de 2,517 mil millones.

## Capacidades

- Generación de texto y conversación multi-turno: el pipeline declarado es `text-generation` y las etiquetas incluyen `conversational`.
- Ventana de contexto larga: hereda del modelo base una longitud de contexto de 131.072 tokens, adecuada para documentos extensos y conversaciones prolongadas.
- Comportamiento sin rechazos: la abliteración elimina la negativa ante prompts que el modelo base rechazaría, con una tasa de rechazo declarada del 0 % sobre el conjunto de evaluación del autor.
- Entrada y salida exclusivamente de texto: Artificial Analysis indica que el modelo base acepta texto y produce texto, sin capacidades multimodales.
- Compatibilidad con el ecosistema `transformers`: carga estándar mediante `AutoModelForCausalLM` y `AutoTokenizer` con `trust_remote_code=True`.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado específicamente para esta variante.
- Capacidades multilingües: no disponible; no se declara lista de idiomas.
- Modo «thinking» explícito, visión o audio: no disponible.

## Casos de uso

- Investigación en seguridad y alineación: comparar las respuestas del modelo base MiniCPM5-2B y de esta variante abliterada sobre el mismo conjunto de prompts permite medir cuantitativamente el efecto de la abliteración en la tasa de rechazo, la coherencia y la perplejidad, usando la métrica de retención del ~97 % como referencia.
- Red teaming y evaluación de guardarraíles: al no negarse a responder, el modelo sirve como generador de casos adversarios para probar clasificadores de contenido y sistemas de moderación externos, en un entorno controlado y aislado.
- Escritura creativa y ficción: en narrativa con personajes moralmente ambiguos o tramas violentas, el exceso de rechazo del modelo base interrumpe el flujo creativo; esta variante mantiene la coherencia sin bloqueos injustificados.
- Procesamiento de documentos largos en local: con 131.072 tokens de contexto y 2,5 B de parámetros, puede resumir contratos, informes técnicos o actas extensas en una GPU de consumo o incluso en CPU con la versión GGUF.
- Generación de datos sintéticos para fine-tuning: su bajo coste de inferencia permite producir grandes volúmenes de texto de entrenamiento o de pares instrucción-respuesta sin filtros de rechazo que sesguen el corpus.
- Asistentes internos de documentación técnica: desplegado con vLLM o llama.cpp dentro de una red corporativa, responde consultas sobre manuales internos manteniendo el contexto completo del documento sin enviar datos a servicios externos.
- Aplicaciones en el borde y sin conectividad: con cuantización de 4 bits, el modelo cabe en dispositivos con poca memoria, lo que habilita asistentes locales en portátiles, mini-PC o sistemas embebidos con GPU integrada.
- Extracción y clasificación de información: tareas de etiquetado, extracción de entidades o clasificación de textos largos donde el contexto amplio evita trocear el documento en fragmentos y perder dependencias entre secciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ni para esta variante abliterada ni para el modelo base dentro de los datos proporcionados. El único dato de evaluación de terceros es la puntuación de 13 en el índice de inteligencia de Artificial Analysis para el modelo base MiniCPM5-2B.

Las únicas métricas disponibles son las de abliteración declaradas por el autor:

| Métrica | Antes (MiniCPM5-2B) | Después (abliterado) |
|---|---|---|
| Perplejidad | 5,27 | 5,13 |
| Coherencia | 0,667 | 0,800 |
| Tasa de rechazo | — | 0 % |
| Puntuación de capacidad | — | 1,0 |

Estos valores proceden exclusivamente de la model card del autor y no han sido verificados de forma independiente. No se especifica el conjunto de evaluación, el número de prompts ni la metodología de cálculo de las puntuaciones de coherencia y capacidad.

## Requisitos de hardware

- VRAM para inferencia en FP16/BF16: aproximadamente 5,0 GB solo para pesos (2,517 mil millones de parámetros × 2 bytes). Con caché KV y overhead del runtime, se recomienda un mínimo de 7-8 GB de VRAM para contextos moderados.
- VRAM en cuantización INT8: en torno a 2,6-3 GB de pesos.
- VRAM en cuantización INT4: en torno a 1,4-1,8 GB de pesos, aunque esta estimación es un cálculo directo sobre el número de parámetros, no un dato publicado por el autor.
- GPU de consumo compatibles: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090 ejecutan el modelo completo en FP16 sin problemas; tarjetas de 6-8 GB pueden alojarlo en cuantizaciones de 8 o 4 bits.
- GPU de centro de datos (A100, H100, L40S): compatibles pero sobredimensionadas para 2,5 B de parámetros; solo tienen sentido para servir muchas réplicas concurrentes o contextos muy largos que disparen el tamaño de la caché KV.
- Ejecución en CPU: viable mediante llama.cpp con el repositorio GGUF hermano, aunque no se dispone de cifras de latencia.
- Opciones de despliegue: `transformers` (formato nativo safetensors), vLLM, TGI, llama.cpp u Ollama (a través de la variante GGUF), y servidores compatibles con la API de OpenAI.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Estado |
|---|---|---|---|---|---|
| abliterated-minicpm5-2b | 2,52 B | 131.072 | Safetensors | Apache 2.0 | Este modelo; 0 descargas, métricas solo del autor |
| MiniCPM5-2B (openbmb) | No disponible con exactitud (descrito como ~2,8 B en el repo GGUF) | 131.072 | Safetensors | No disponible | Modelo base, con rechazos intactos; índice de inteligencia 13 en Artificial Analysis |
| abliterated-minicpm5-2b-ggml | Misma base | 131.072 | GGUF | Apache 2.0 | Variante cuantizada del mismo autor, con abliteración idéntica |

No se dispone de datos de rendimiento comparativos frente a otras familias de modelos pequeños (por ejemplo, alternativas densas de 2-4 B) en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable más allá de la relación con el modelo base y su variante GGUF.

## Limitaciones y advertencias

- Eliminación de guardarraíles: la abliteración suprime las direcciones de rechazo, de modo que el modelo responderá a peticiones dañinas o ilegales. La propia model card incluye como ejemplo de uso un prompt sobre cómo forzar una cerradura. No debe exponerse directamente a usuarios finales sin un sistema de moderación externo.
- Riesgo de uso indebido: cualquier despliegue público requiere filtrado de entrada y salida, registro de peticiones y políticas de uso explícitas; el modelo no incorpora ninguna salvaguarda propia.
- Sesgos: no hay información publicada sobre sesgos demográficos, culturales o ideológicos. Al derivar de MiniCPM5-2B, hereda los sesgos de sus datos de entrenamiento, que tampoco se documentan.
- Alucinación: con 2,5 B de parámetros, la tasa de alucinación es previsiblemente alta en tareas de conocimiento factual, razonamiento matemático y generación de código. No se han publicado mediciones al respecto.
- Capacidad limitada por tamaño: el índice de inteligencia de 13 del modelo base en Artificial Analysis es bajo en términos absolutos; no es adecuado para razonamiento complejo, matemáticas avanzadas ni tareas agénticas de varios pasos.
- Idiomas: no se declara lista de idiomas soportados. El comportamiento multilingüe es, por tanto, desconocido.
- Cobertura de la abliteración: el autor menciona 20 capas de 20-41, pero no detalla qué capas quedan fuera del proceso ni si el rechazo persiste parcialmente en determinados dominios temáticos.
- Validación insuficiente: las métricas de la model card son autoinformadas, sin conjunto de evaluación especificado ni replicación independiente. El repositorio registra 0 descargas y 0 «likes», por lo que no existe retroalimentación de la comunidad.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución, pero el usuario asume toda la responsabilidad legal sobre el contenido generado. El autor original del modelo base no respalda esta variante abliterada.
- Fecha de publicación: el repositorio se creó el 12 de septiembre de 2026, por lo que se trata de una publicación muy reciente y sin historial de mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KidIkaros/abliterated-minicpm5-2b
- Variante GGUF del mismo autor: https://huggingface.co/KidIkaros/abliterated-minicpm5-2b-ggml
- Modelo base MiniCPM5-2B: https://huggingface.co/openbmb/MiniCPM5-2B
- Análisis de rendimiento del modelo base en Artificial Analysis: https://artificialanalysis.ai/models/minicpm5-2b
