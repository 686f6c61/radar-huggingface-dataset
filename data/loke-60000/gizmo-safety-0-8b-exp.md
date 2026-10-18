# Loke-60000/gizmo-safety-0.8b-exp

## Resumen

gizmo-safety-0.8b-exp es un modelo experimental de 873.438.784 parámetros (0,87 B) desarrollado por el usuario Loke-60000, orientado a la clasificación de seguridad de contenido textual y de imágenes. No es un modelo generativo al uso: parte de unsloth/Qwen3.5-0.8B y sustituye la cabeza de generación de texto por una cabeza de decisión del `FastDecisionModel` de Unsloth, de modo que para un prompt, una respuesta del asistente o una imagen devuelve, en una única pasada forward, una probabilidad calibrada por cada pregunta de seguridad formulada (por ejemplo, si el contenido es inseguro o sexualmente explícito).

El modelo cubre tres funciones diferenciadas: moderación de prompts y respuestas de texto, moderación de imágenes (NSFW, contenido inseguro) y enrutamiento de peticiones hacia el modelo de un conjunto que tenga más probabilidad de responder correctamente. Esta última función lo convierte en un posible componente de sistemas de *LLM routing* de bajo coste, dado su tamaño inferior a mil millones de parámetros.

Su relevancia actual reside en la relación entre tamaño y rendimiento en moderación: con 0,8 B declara 87,2 de F1 en prompts de Aegis 2.0, por encima de Shieldstral 3B (85,1) y Qwen3Guard 4B (82,2), aunque queda por debajo de Shieldstral en ToxicChat y OpenAI Moderation. Es, sin embargo, una *release* explícitamente experimental, no destinada a producción, y solo entrenada y evaluada en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (base Qwen3.5-0.8B) con cabeza de decisión `FastDecisionModel` de Unsloth en lugar de la cabeza de generación; adaptador LoRA rank 16 fusionado en los pesos |
| Parametros totales | 873.438.784 (0,87 B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 3072 tokens en el ejemplo de uso oficial (`max_seq_length=3072`); la longitud nativa del modelo base no se especifica en la información disponible |
| Tipos de cuantizacion | Solo se distribuyen pesos fusionados en 16 bits (1,7 GB); no se publican variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | Inglés (`en`); entrenado y evaluado exclusivamente en inglés |
| Licencia | Apache 2.0 (la misma que el modelo base Qwen3.5-0.8B) |
| Formato de pesos | safetensors (pesos fusionados en fp16/bf16, repo de 1,8 GB) |
| Pipeline declarado | text-classification |
| Modalidades de entrada | Texto e imagen (`image-text-to-text`) |
| Requiere helper adicional | `vision_patch.py` incluido en el repo para entradas de imagen |

## Arquitectura y entrenamiento

El modelo reutiliza el cuerpo transformer de Qwen3.5-0.8B y le acopla una cabeza de decisión que responde varias preguntas binarias (tipo `noul`) en una sola pasada forward, devolviendo probabilidades por opción en lugar de tokens. El ajuste se realizó con LoRA de rango 16 sobre las capas de atención y MLP del modelo de lenguaje, junto con la cabeza de decisión; el adaptador se fusionó posteriormente en los pesos base. La función de pérdida combina entropía cruzada con un término de *Brier score*, y las opciones de respuesta se barajaron en cada ejemplo de entrenamiento para evitar sesgo de posición. Las temperaturas por tipo de pregunta se ajustaron sobre datos de validación para calibrar las probabilidades.

El entrenamiento se llevó a cabo en varias etapas, incorporando los datos de imagen en las fases finales. Los datos proceden de conjuntos públicos de seguridad textual, seguridad de imagen, enrutamiento y decisión, con preferencia por fuentes anotadas por humanos, y se eliminaron los ejemplos coincidentes con ítems de evaluación antes del entrenamiento. Como comprobación de contaminación, se volvieron a puntuar los prompts de evaluación presentes en conjuntos públicos de entrenamiento: el F1 en prompts de Aegis 2.0 sobre los 1.704 registros restantes es de 87,5, ligeramente superior al 87,2 global.

## Capacidades

- Clasificación de seguridad de prompts de usuario: devuelve probabilidad calibrada de que un prompt sea inseguro, abusivo o contrario a política.
- Clasificación de respuestas del asistente: acepta `user_prompt` y `assistant_response` en el estado y evalúa la seguridad de la respuesta.
- Moderación de imágenes: detección de contenido sexualmente explícito y de imágenes inseguras, mediante preguntas específicas y el helper `vision_patch.py`.
- Múltiples preguntas en una sola pasada: el modelo responde un diccionario de preguntas simultáneamente, sin generación autoregresiva.
- Enrutamiento de LLM: estima qué modelo de un conjunto (hasta 11 en RouterBench) responderá correctamente un prompt dado.
- Salida probabilística calibrada: permite ajustar umbrales por categoría, recomendándose umbrales inferiores a 0,5 en categorías con pocos positivos.
- Capacidad de decisión general limitada: obtiene 18,0 en el índice público Decision Index 0.3, por lo que no se recomienda como modelo de decisión de propósito general.
- No soporta *tool calling*, agentes ni generación de texto libre: la cabeza de decisión sustituye a la generación.

## Casos de uso

- Prefiltrado de contenido en pipelines de moderación: clasificar prompts y respuestas con un modelo de 0,87 B antes de invocar un moderador mayor, reduciendo coste por petición en el caso mayoritario de contenido claramente permitido.
- Moderación de subidas de imagen en plataformas UGC: evaluar imágenes con la pregunta de contenido sexualmente explícito, con F1 de 94,3 y AUROC de 98,8 en detección NSFW, y derivar a revisión humana los casos cercanos al umbral.
- Enrutamiento de consultas entre varios modelos: usar la predicción de acierto por modelo para elegir el destino de cada prompt, con 84,2 % de precisión en RouterBench sobre 11 modelos y 88,3 % en SPROUT.
- Enrutamiento con criterio de coste: combinación de la probabilidad de acierto con el precio por token de cada modelo para decidir cuándo un prompt sencillo puede resolverse con un modelo pequeño.
- Clasificación de conversaciones multi-turno: al admitir prompt y respuesta en el mismo estado y una ventana de 3072 tokens, permite evaluar intercambios completos en lugar de turnos aislados.
- Baseline para investigación en clasificadores de seguridad pequeños: arquitectura y calibración documentadas, licencia Apache 2.0 y pesos fusionados, lo que facilita reproducir y comparar experimentos.
- Filtrado previo en sistemas de anotación: generación de etiquetas preliminares con probabilidad asociada para priorizar la cola de revisión humana.
- Experimentación en *guardrails* multimodales: es uno de los pocos modelos pequeños de la comparativa que acepta imagen además de texto.

## Benchmarks y rendimiento

Seguridad de texto (F1, umbral de decisión 0,5):

| Dataset | gizmo-safety-0.8b-exp | Shieldstral 3B | Qwen3Guard 4B |
|---|---|---|---|
| Aegis 2.0 (prompts) | 87,2 | 85,1 | 82,2 |
| Aegis 2.0, subconjunto sin contaminación (1.704 registros) | 87,5 | no disponible | no disponible |
| ToxicChat | 75,9 | 84,1 | no disponible |
| OpenAI Moderation | 69,1 | 81,4 | no disponible |
| AgentHarm | medido localmente, valor no publicado | medido localmente, valor no publicado | medido localmente, valor no publicado |

Nota: Aegis 2.0 y AgentHarm se midieron localmente sobre los mismos registros reservados para todos los modelos; las cifras de ToxicChat, OpenAI Moderation y BeaverTails del resto de modelos proceden del informe de Qwen3Guard (arXiv 2510.14276) y de la model card de Shieldstral.

Seguridad de imagen (Shieldstral y Qwen3Guard no aceptan imagen, por lo que solo se reporta este modelo):

| Dataset | Tarea | F1 | AUROC |
|---|---|---|---|
| NSFW detection | Imágenes sexualmente explícitas | 94,3 | 98,8 |
| VLGuard | Imágenes inseguras | 92,3 | 99,6 |
| UnsafeBench | Imágenes inseguras | 78,8 | 90,5 |
| LlavaGuard | Imágenes inseguras | 73,6 | 85,0 |
| BeaverTails-V | Respuestas inseguras a imágenes | 75,7 | 89,9 |

Enrutamiento y decisiones:

| Benchmark | Resultado | Referencia |
|---|---|---|
| RouterBench (elección entre 11 modelos) | 84,2 % de precisión | GPT-4 en solitario: 84,0 % |
| SPROUT | 88,3 % | GPT-4o en solitario: 88,2 % |
| Decision Index 0.3 (índice público) | 18,0 | no disponible |

## Requisitos de hardware

- VRAM para inferencia en 16 bits: aproximadamente 1,75 GB solo para pesos (873 M × 2 bytes); con activaciones y ventana de 3072 tokens, el consumo realista se sitúa en el entorno de 2,5 a 4 GB, estimación derivada del tamaño de parámetros, no publicada por el autor.
- Cabe holgadamente en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4080 y RTX 4090; también en GPUs de 4-8 GB con margen.
- GPU de datacenter (A100, H100, L40S): innecesarias por capacidad, solo justificables por volumen de peticiones y batching.
- Ejecución en CPU viable por el tamaño del modelo, aunque el autor no publica latencias ni throughput.
- Despliegue: el modelo requiere la API `FastDecisionModel` de Unsloth (`from_pretrained` y `for_inference`), no una pipeline estándar de `transformers`; no se documenta compatibilidad con vLLM, TGI, llama.cpp u Ollama, y al no publicarse pesos GGUF no hay ruta clara para llama.cpp u Ollama.
- Las entradas de imagen requieren instalar `vision_patch.py` sobre el tokenizer antes de invocar la predicción.
- Latencia y throughput: no disponibles en la información proporcionada.
- Al no haber cuantizaciones publicadas, no se dispone de cifras para despliegues en 8 o 4 bits; habría que cuantizar los pesos fusionados por cuenta propia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | F1 Aegis 2.0 (prompts) | F1 ToxicChat | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| gizmo-safety-0.8b-exp | 0,87 B | 3072 tokens (config. de uso) | Texto + imagen | 87,2 | 75,9 | Apache 2.0 | HuggingFace, experimental |
| Shieldstral 3B | 3 B | no disponible | Solo texto | 85,1 | 84,1 | no disponible | HuggingFace |
| Qwen3Guard 4B | 4 B | no disponible | Solo texto | 82,2 | no disponible | no disponible | HuggingFace |
| Qwen3.5-0.8B (base) | 0,87 B | no disponible | Texto (+ imagen vía fine-tune) | no aplica (modelo generativo) | no aplica | Apache 2.0 | HuggingFace |

Frente a GPT-4 y GPT-4o como enrutadores, el modelo iguala prácticamente sus cifras (84,2 % frente a 84,0 % en RouterBench; 88,3 % frente a 88,2 % en SPROUT) con tres órdenes de magnitud menos de parámetros, a costa de estar limitado al inglés y de no ser un modelo de propósito general.

## Limitaciones y advertencias

- Modelo explícitamente experimental: el autor indica que no está pensado para uso en producción.
- Solo inglés: entrenado y evaluado únicamente con datos en inglés; el rendimiento en otros idiomas, incluido el castellano, no está medido.
- Las etiquetas de seguridad reflejan las políticas de anotación de los conjuntos de origen y pueden no coincidir con la política de una plataforma concreta.
- Los resultados de imagen se midieron sobre benchmarks; el rendimiento en capturas de pantalla, memes con texto superpuesto o imágenes muy comprimidas puede diferir.
- Las predicciones cercanas al umbral de decisión deben derivarse a revisión humana.
- Calibración desigual por categoría: en BeaverTails-V, el F1 de contenido sexual es 43,8 con umbral 0,5 pese a un AUROC de 98,0, lo que indica que hace falta ajustar el umbral en categorías con pocos positivos.
- Riesgo de alucinación no aplica en el sentido generativo (no produce texto libre), pero sí existe riesgo de clasificación errónea en dominios alejados de los datos de entrenamiento.
- Sesgos: no se documenta ninguna evaluación de sesgos por demografía, idioma o dominio en la información disponible.
- Rendimiento inferior a Shieldstral 3B en ToxicChat (75,9 frente a 84,1) y en OpenAI Moderation (69,1 frente a 81,4), por lo que no es un sustituto universal de moderadores mayores.
- Dependencia de la librería Unsloth y de su API `FastDecisionModel`; no hay integración documentada con stacks de servicio estándar.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de cuantizaciones oficiales y la naturaleza experimental desaconsejan su uso directo en producción sin una capa de validación propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Loke-60000/gizmo-safety-0.8b-exp
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-0.8B
- Repositorio de Unsloth (librería y API `FastDecisionModel`): https://github.com/unslothai/unsloth
- Informe de Qwen3Guard citado en la model card (fuente de parte de las cifras comparativas): arXiv 2510.14276
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados obtenidos corresponden a entidades homónimas sin relación (Lokke, Locke de League of Legends, John Locke, LOKE Global) y se descartan.
