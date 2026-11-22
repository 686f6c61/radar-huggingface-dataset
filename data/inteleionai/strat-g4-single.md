# InteleionAI/Strat-G4-Single

## Resumen
Strat-G4-Single es un modelo de clasificación de texto en inglés desarrollado por InteleionAI, obtenido mediante fine-tuning del modelo de embeddings `nvidia/llama-nemotron-embed-1b-v2`. Está diseñado para tareas de clasificación sobre texto y se ha entrenado específicamente con el dataset PolyAI/banking77, un corpus de consultas de clientes bancarios etiquetadas por intención. El repositorio tiene un tamaño de 2,5 GB y los pesos se distribuyen en formato safetensors.

El modelo parte de una base orientada a la generación de embeddings (Nemotron Embed 1B v2 de NVIDIA), lo que sugiere que conserva la arquitectura transformer subyacente de dicha familia, aunque la información pública disponible no detalla la arquitectura exacta ni el número de parámetros más allá de la referencia "1B" del modelo base. Su propósito es práctico: servir como clasificador de intenciones o categorías en dominios concretos, con un caso de uso inmediato en el sector bancario.

La relevancia de este modelo es limitada en términos de adopción: no registra descargas ni interacciones en Hugging Face, el acceso está restringido (gated) y la licencia es "other", lo que obliga a revisar las condiciones antes de cualquier uso comercial. Es, por tanto, una ficha de interés para quienes sigan el ecosistema de modelos de embeddings afinados para clasificación y para evaluar la viabilidad de reutilizar el checkpoint base de NVIDIA en tareas downstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de nvidia/llama-nemotron-embed-1b-v2; detalles exactos no disponibles) |
| Parametros totales | Aproximadamente 1B (según el nombre del modelo base; cifra exacta no disponible) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Other (requiere revisión de condiciones) |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento
El modelo se construye por fine-tuning supervisado del checkpoint `nvidia/llama-nemotron-embed-1b-v2`, un modelo de embeddings de la familia Nemotron de NVIDIA con aproximadamente 1.000 millones de parámetros. La información disponible no especifica la arquitectura interna exacta (número de capas, dimensión oculta, mecanismo de atención) ni el contexto máximo soportado, por lo que estos datos deben considerarse no disponibles. El pipeline declarado es `text-classification`, lo que implica que la cabeza de salida se ha adaptado para producir etiquetas de clase en lugar de representaciones vectoriales puras.

El entrenamiento se ha realizado sobre el dataset `PolyAI/banking77`, un conjunto de consultas de atención al cliente bancaria con 77 intenciones etiquetadas. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset más allá de su origen, ni sobre si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas (decodificación especulativa, atención lineal, etc.) en la información proporcionada.

## Capacidades
- Clasificación de texto en inglés: asignación de una etiqueta de intención o categoría a una consulta de entrada.
- Especialización en dominio bancario: entrenado sobre banking77, adecuado para consultas de clientes de banca (tarjetas, transferencias, cuentas, etc.).
- Procesamiento de texto corto y medio: orientado a utterances o consultas de usuario, no a documentos largos.
- Integración en pipelines de NLP: puede formar parte de sistemas de enrutamiento, triaje o etiquetado automático.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking".
- Capacidades multilingües: limitadas al inglés según la tarjeta del modelo.

## Casos de uso
- Clasificación de intenciones en atención al cliente bancaria: el modelo etiqueta consultas entrantes (por ejemplo, "bloqueo de tarjeta" o "transferencia internacional") para enrutarlas al departamento adecuado, aprovechando su entrenamiento específico sobre banking77.
- Triaje automático de tickets de soporte: en un centro de soporte, se puede usar para preasignar categorías a correos o formularios y priorizar colas de trabajo.
- Enrutamiento en chatbots: integrado como clasificador previo a un diálogo generativo, permite decidir qué flujo o respuesta predefinida activar según la intención detectada.
- Etiquetado de datos para entrenamiento: útil para anotar grandes volúmenes de consultas históricas y construir datasets supervisados de forma semiautomática.
- Análisis de voz del cliente: aplicado a transcripciones de llamadas o chats, permite agregar motivos de contacto y generar informes de demanda por categoría.
- Moderación o filtrado temático: clasificación de mensajes según categorías predefinidas para derivar contenido sensible a revisión humana.
- Prototipado rápido en investigación: al partir de un checkpoint de embeddings de 1B, sirve como base para experimentos de clasificación con fine-tuning ligero en dominios similares.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: al tratarse de un modelo de aproximadamente 1B de parámetros, en precisión completa (fp32) requeriría del orden de 4 GB solo para pesos; en fp16/bf16, unos 2 GB; en cuantización de 8 bits, alrededor de 1 GB, y en 4 bits, menos de 1 GB. Estas cifras son estimaciones basadas en el tamaño del modelo base y no en mediciones publicadas.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM para fp16; una RTX 3060, RTX 4060, RTX 4090, A100 o H100 pueden ejecutarlo sin problema.
- Cabe en GPU de consumo: sí, previsiblemente en la mayoría de tarjetas con 8 GB o más, e incluso en configuraciones con 4 GB si se cuantiza.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama para inferencia local; también es posible servirlo con la librería `transformers` de Hugging Face. No se documentan configuraciones específicas ni recetas de despliegue en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| InteleionAI/Strat-G4-Single | ~1B (base) | No disponible | Clasificación de texto (banking77) | Other (gated) | Acceso restringido en HF |
| nvidia/llama-nemotron-embed-1b-v2 | ~1B | No disponible | Embeddings de texto | No disponible | Público en HF |
| Modelos de clasificación tipo BERT-base (p. ej., bert-base-uncased) | ~110M | 512 tokens | Clasificación general | Apache 2.0 / MIT según variante | Público en HF |

La comparativa se limita a referencias genéricas, ya que no se dispone de datos de rendimiento del modelo ni de alternativas directamente comparables en la información proporcionada. La principal diferencia frente a clasificadores BERT pequeños es el tamaño del backbone (1B frente a ~110M), lo que implica mayores requisitos de cómputo y memoria sin que se hayan publicado métricas que justifiquen esa diferencia.

## Limitaciones y advertencias
- Sesgos conocidos: no documentados; al entrenarse sobre banking77, puede heredar sesgos del corpus de consultas bancarias y de la distribución de intenciones del dataset.
- Riesgo de alucinación: bajo en sentido estricto al ser un clasificador, pero puede asignar etiquetas incorrectas con alta confianza en entradas fuera de distribución.
- Limitaciones de contexto e idioma: solo inglés; no se especifica la longitud máxima de entrada, lo que puede provocar truncamientos en textos largos.
- Restricciones de licencia: licencia "other" y acceso gated; es imprescindible revisar las condiciones en Hugging Face antes de cualquier uso comercial o redistribución.
- Caveat para producción: sin benchmarks publicados ni métricas de evaluación, no se puede garantizar su rendimiento frente a alternativas; se recomienda validar con un conjunto de test propio antes de desplegarlo.
- Advertencia de dominio: su especialización en banking77 limita la generalización a otras verticales sin un nuevo fine-tuning.

## Enlaces
- Hugging Face: https://huggingface.co/InteleionAI/Strat-G4-Single
- Modelo base: https://huggingface.co/nvidia/llama-nemotron-embed-1b-v2
- Dataset de entrenamiento: https://huggingface.co/datasets/PolyAI/banking77
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información proporcionada.
