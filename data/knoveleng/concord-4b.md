# knoveleng/Concord-4B

## Resumen

Concord-4B es un modelo de decisión de 4,7 mil millones de parámetros construido por knoveleng mediante una fusión de pesos en el espacio de parámetros, sin entrenamiento adicional. Parte de Qwen/Qwen3.5-4B y combina los pesos de H2O-Lightning-4B (en todas las capas) con un 0,5 de d3-mini en las capas 16 a 31. No genera texto: lee la probabilidad de cada letra de opción en la primera posición de respuesta y devuelve una distribución de probabilidad sobre las alternativas presentadas.

El modelo está pensado para tareas de decisión con opciones cerradas: clasificación, inferencia de lenguaje natural (NLI), enrutamiento y pregunta-respuesta con alternativas. Resuelve el problema de tener que generar una respuesta textual completa para luego parsearla; en su lugar, una única pasada forward produce directamente la probabilidad de cada etiqueta. Soporta hasta 62 opciones, ya que las letras A–Z, a–z y los dígitos 0–9 son tokens únicos.

Su relevancia actual radica en que ofrece un rendimiento competitivo en el Decision Index (72,0 de media en 39 benchmarks) con licencia Apache-2.0, igualando a H2O-Lightning-4B (71,8) y superándolo en JevBench (92,0 frente a 90,0). El modelo conserva el codificador visual de Qwen3.5-4B sin modificar, aunque la model card no documenta su uso en tareas multimodales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B), fusión de pesos en espacio de parámetros |
| Parametros totales | 4.659.865.088 (4,7B); modelo de texto 4,2B; codificador visual sin cambios |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

Concord-4B no se entrena: es una fusión en el espacio de pesos (weight-space merge) de tres modelos. La receta concreta es H2O-Lightning-4B en todas las capas más 0,5 × d3-mini en las capas 16 a 31, partiendo de la arquitectura de Qwen/Qwen3.5-4B. Los tres modelos ingredientes son Apache-2.0, lo que permite la fusión y la redistribución bajo la misma licencia. El codificador visual de Qwen3.5-4B se mantiene sin modificar, aunque la model card no describe su uso funcional en el pipeline de decisión.

La receta deriva del paper "One Offset, Many Models: A Weight-Space Audit of Decision Models", que analiza en el espacio de pesos qué parte de cada release de un modelo de decisión produce su ganancia. Tres hallazgos guiaron la construcción: (1) los releases de una misma base comparten una parte común que no depende de la entrada y es casi idéntica entre releases; (2) una sola release fuerte ya contiene esa parte común, por lo que promediar muchas no aporta; y (3) la ganancia específica de cada release se concentra en un offset de pesos que puede trasplantarse selectivamente. La fusión aplica el offset de d3-mini solo en las capas 16–31, donde el análisis lo identificó como más efectivo.

El modelo no genera texto en ningún caso: la inferencia consiste en una única pasada forward y la lectura de los logits de las letras de opción en la última posición. No hay decodificación autoregresiva ni modo thinking activo (el ejemplo de la model card usa `enable_thinking=False`).

## Capacidades

- Decisión sobre opciones cerradas: clasificación, NLI, enrutamiento y pregunta-respuesta con alternativas.
- Lectura directa de probabilidades por opción: devuelve una distribución sobre las etiquetas, no texto generado.
- Soporte de hasta 62 opciones por consulta (A–Z, a–z, 0–9 como tokens únicos).
- Inferencia en una sola pasada forward, sin generación autoregresiva.
- Capacidades multilingües: solo inglés declarado.
- No soporta tool calling ni function calling de forma nativa (no genera texto estructurado).
- No soporta agentes ni razonamiento multi-paso en el sentido de cadenas de pensamiento; el modo thinking está desactivado en la configuración de referencia.
- Codificador visual presente (herencia de Qwen3.5-4B) pero sin capacidades de visión documentadas en la model card.

## Casos de uso

- Enrutamiento de tickets de soporte: dado un registro (texto de la incidencia) y una lista de departamentos, el modelo devuelve la probabilidad de cada uno en una sola pasada. Es adecuado porque evita la generación de texto y el parseo posterior, reduciendo latencia y errores de formato.
- Clasificación de documentos en pipelines de ingestión: con hasta 62 categorías por consulta, se puede clasificar un correo, factura o contrato directamente por su etiqueta sin necesidad de un modelo generativo.
- Inferencia de lenguaje natural (NLI): determinar si una hipótesis se sigue de una premisa eligiendo entre "entailment", "contradiction" y "neutral", con probabilidades calibradas por opción.
- Pregunta-respuesta con alternativas (estilo examen): seleccionar la opción correcta entre varias letras, útil en sistemas de evaluación automática o tutoría.
- Moderación de contenido con categorías predefinidas: clasificar un texto en niveles de riesgo o tipos de infracción leyendo la probabilidad de cada etiqueta.
- Selección de herramienta o API en un orquestador: dado un listado de acciones disponibles, elegir la más probable como siguiente paso, siempre que el conjunto de opciones sea cerrado y conocido de antemano.
- Filtrado previo en sistemas RAG: decidir si un fragmento recuperado es relevante para la consulta antes de pasarlo al modelo generador, con una única pasada y bajo coste computacional.

## Benchmarks y rendimiento

Datos publicados en la model card (precisión en %, hasta 120 ítems por benchmark, mismo prompt y misma lectura de letras de opción para todos los modelos):

| Modelo | CLINC150 | JevBench | In-house* | DI avg (39) |
|---|---:|---:|---:|---:|
| Qwen3.5-4B (base) | 90,8 | 76,8 | 77,8 | 51,5 |
| Intern-Decision-4B | 89,2 | 86,9 | 84,0 | 55,7 |
| nexus-decision-4b | 95,0 | 85,1 | 82,2 | 58,6 |
| rycerzes-Qwen3.5-4B-Decision | 90,8 | 85,0 | 69,4 | 62,3 |
| torchcast-decision-4b | 94,2 | 92,1 | 74,1 | 62,7 |
| d3-mini | 98,3 | 86,6 | 79,0 | 64,2 |
| EpochEcho-decision-4b | 90,8 | 85,4 | 75,8 | 64,8 |
| karpo-decision-4B† | 97,5 | 86,2 | 83,5 | 71,3 |
| H2O-Lightning-4B | 98,3 | 90,0 | 82,6 | 71,8 |
| StartLux-4B-Instant† | 98,3 | 91,8 | 85,3 | 73,3 |
| **Concord-4B** | **98,3** | 92,0 | 84,4 | 72,0 |

\*In-house = conjunto privado de dos tareas del autor. †Licencia no comercial o personalizada, no usable como ingrediente de la fusión. La tabla completa de los 39 benchmarks del Decision Index está en `results.md` del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card. Como referencia orientativa por tamaño (4,7B parámetros), en bfloat16 serían necesarios aproximadamente 9,3 GB de pesos; en cuantización de 8 bits, unos 4,7 GB; en 4 bits, unos 2,4 GB. Estas cifras son estimaciones por tamaño, no datos publicados por el autor.
- GPU recomendadas: no disponible. Por tamaño, una RTX 4090 (24 GB) o A100/H100 son suficientes en bfloat16; una GPU consumer de 8–12 GB requeriría cuantización.
- Cabe en GPU consumer: sí, previsiblemente en RTX 3090/4090 en bfloat16 y en GPUs de 8 GB con cuantización, aunque el autor no publica requisitos oficiales.
- Opciones de despliegue: transformers (referencia oficial, con `AutoModelForImageTextToText`). No se documentan vLLM, llama.cpp, Ollama ni TGI; el tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face.
- Latencia y throughput: no disponible. La inferencia es una única pasada forward sin generación, lo que en principio reduce la latencia frente a modelos generativos del mismo tamaño, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | DI avg (39) | JevBench | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---|---|
| **Concord-4B** | 4,7B | No disponible | 72,0 | 92,0 | Apache-2.0 | Hugging Face |
| H2O-Lightning-4B | 4B (aprox.) | No disponible | 71,8 | 90,0 | Apache-2.0 | Hugging Face |
| d3-mini | No disponible | No disponible | 64,2 | 86,6 | Apache-2.0 | Hugging Face |
| StartLux-4B-Instant | 4B (aprox.) | No disponible | 73,3 | 91,8 | No comercial/personalizada | Hugging Face |
| karpo-decision-4B | 4B (aprox.) | No disponible | 71,3 | 86,2 | No comercial/personalizada | Hugging Face |

Concord-4B es el modelo con licencia permisiva (Apache-2.0) con mayor media en el Decision Index de la comparativa del autor, empatado técnicamente con H2O-Lightning-4B. StartLux-4B-Instant obtiene una media superior (73,3) pero con licencia no comercial, lo que lo excluye para uso comercial y como ingrediente de fusión.

## Limitaciones y advertencias

- Solo inglés declarado; el rendimiento en otros idiomas no está evaluado.
- No genera texto: no sirve para tareas generativas, de resumen, traducción o conversación abierta.
- Limitado a decisiones con opciones cerradas y conocidas de antemano; no puede formular sus propias respuestas.
- Riesgo de alucinación no aplica en el sentido generativo, pero la distribución de probabilidad puede estar mal calibrada si las opciones no cubren la respuesta correcta.
- Sesgos conocidos: no documentados en la model card; al heredar de Qwen3.5-4B, H2O-Lightning-4B y d3-mini, puede arrastrar los sesgos de sus datos de entrenamiento originales.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Longitud de contexto no documentada: no se puede asumir la ventana de Qwen3.5-4B sin verificación.
- El codificador visual está presente pero su funcionalidad no está documentada; no se debe asumir soporte de visión en producción.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: sin validación comunitaria independiente.
- Los benchmarks son del propio autor, con conjuntos privados y hasta 120 ítems por benchmark; la comparación con terceros no es verificable de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/knoveleng/Concord-4B
- Resultados completos: https://huggingface.co/knoveleng/Concord-4B/blob/main/results.md
- Licencia: https://huggingface.co/knoveleng/Concord-4B/blob/main/LICENSE
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Ingrediente H2O-Lightning-4B: https://huggingface.co/h2oai/h2o-lightning-4b
- Ingrediente d3-mini: https://huggingface.co/vllm-sr/d3-mini
- Paper "One Offset, Many Models: A Weight-Space Audit of Decision Models": referencia citada en la model card, sin URL directa disponible en la información proporcionada
