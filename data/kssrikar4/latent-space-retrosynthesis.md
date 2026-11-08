# kssrikar4/Latent-Space-Retrosynthesis

## Resumen

Latent-Space-Retrosynthesis es un modelo de retrosíntesis química desarrollado por el usuario kssrikar4 (publicado también bajo el nombre Mechanism-aware-retrosynthesis). No es un modelo de lenguaje: es un sistema de dos redes neuronales que proyecta moléculas a un espacio latente continuo de 256 dimensiones y, mediante un bucle recurrente con parada aprendida, predice conjuntos de precursores para una molécula objetivo. Resuelve el problema de la retrosíntesis (dado un producto, encontrar los reactivos de partida) mediante recuperación por similitud en el espacio latente en lugar de generación secuencial de tokens.

La arquitectura combina un proyector molecular (`DynamicMolecularProjector`) que transforma una representación híbrida de 1040 dimensiones (fingerprint Morgan de 1024 bits más 16 descriptores fisicoquímicos) en un vector unitario de 256 dimensiones, y un modelo recurrente (`DynamicThinkingRetroModel`) basado en GRU con un mecanismo de halting aprendido que desenrolla dinámicamente la ruta de reacción. El modelo tiene 1.999.233 parámetros y un peso de repositorio de 0,1 GB.

Es relevante por su enfoque de "latent thinking" aplicado a química: en lugar de generar SMILES autoregresivamente, predice un vector y recupera el candidato más cercano de una base de datos precalculada, lo que permite inferencia rápida y sin truncación. El modelo está entrenado sobre PaRoutes, USPTO y Open Reaction Database, y se distribuye con licencia GPL-3.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: proyector MLP (entrada 1040, salida 256) + modelo recurrente GRU con halting aprendido |
| Parametros totales | 1.999.233 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de 1040 dimensiones por molécula) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés; el modelo opera sobre SMILES, no sobre texto libre) |
| Licencia | GPL-3.0 |
| Formato de pesos | safetensors (model.safetensors) + preprocessed_routes_cache.npz para la base de candidatos |

## Arquitectura y entrenamiento

El modelo se compone de dos módulos. El primero, `DynamicMolecularProjector`, toma un vector de 1040 dimensiones (1024 bits de fingerprint Morgan con radio 2 más 16 descriptores RDKit normalizados: peso molecular, LogP, TPSA, donadores y aceptores de enlaces de hidrógeno, enlaces rotables, fracción Csp3, número de anillos, anillos aromáticos, heteroátomos, ASA de Labute, átomos pesados, NHOH, NO, anillos alifáticos y anillos saturados) y lo proyecta a un espacio latente de 256 dimensiones sobre una hiperesfera unitaria. El segundo, `DynamicThinkingRetroModel`, es un modelo recurrente con celdas GRU y un mecanismo de parada aprendido que determina cuántos pasos de "pensamiento" ejecutar según la complejidad de la ruta de reacción, lo que el autor denomina "Dynamic Thinking Loop" y "Dynamic Pathway Unrolling".

El entrenamiento emplea pérdida contrastiva InfoNCE para estructurar el espacio latente de forma que moléculas relacionadas retrosintéticamente queden próximas, lo que habilita la predicción por recuperación (retrieval) sobre una tabla de candidatos precalculada. Los datos de entrenamiento provienen de los conjuntos PaRoutes, USPTO y Open Reaction Database (ord-data). La model card menciona métricas de evaluación top-k accuracy, similitud de Tanimoto y similitud coseno, pero no se detallan hiperparámetros de entrenamiento, número de tokens ni composición exacta del dataset.

## Capacidades

- Predicción de precursores retrosintéticos: dado un SMILES de producto, devuelve un conjunto de SMILES de precursores candidatos.
- Recuperación en espacio latente: proyecta moléculas a un vector de 256 dimensiones y busca el candidato más cercano en una base de datos precalculada.
- Razonamiento de rutas de complejidad variable mediante bucle recurrente con parada aprendida.
- Extracción de características moleculares (pipeline declarado: feature-extraction).
- Featurización híbrida integrada: fingerprint Morgan de 1024 bits más 16 descriptores fisicoquímicos.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible en el sentido de agentes LLM; el "multi-step" se limita al desenrollado interno de la ruta.
- Capacidades multilingües: no; opera sobre SMILES y etiquetas en inglés.
- Capacidades especiales: mecanismo de halting dinámico ("thinking loop"), espacio latente contrastivo con InfoNCE.

## Casos de uso

- Planificación de síntesis en descubrimiento de fármacos: dado un compuesto candidato en SMILES, el modelo propone conjuntos de precursores comerciales o sintetizables, acelerando la evaluación de viabilidad sintética antes de invertir en síntesis de laboratorio.
- Enrutamiento de compras de building blocks: integrado con un catálogo de reactivos, el modelo permite mapear un producto objetivo a precursores disponibles y estimar rutas de aprovisionamiento.
- Filtrado previo en pipelines de generación molecular: tras un modelo generativo de moléculas, este modelo actúa como filtro de sintetizabilidad, descartando candidatos cuyos precursores no se recuperan con similitud suficiente en el espacio latente.
- Anotación de bases de datos de reacciones: el espacio latente contrastivo permite agrupar reacciones y productos por similitud, útil para curar y deduplicar datasets como USPTO u ORD.
- Búsqueda de análogos y recuperación molecular: el proyector puede usarse como extractor de embeddings para búsqueda por similitud (Tanimoto/coseno) en catálogos internos de compuestos.
- Educación e investigación en química computacional: como referencia reproducible de retrosíntesis basada en recuperación, con código de inferencia explícito y pesos abiertos, para experimentos de comparación con enfoques generativos (Transformer SMILES, templates).
- Prototipado rápido en CPU/GPU modesta: con ~2 M de parámetros y pesos de 0,1 GB, puede desplegarse en entornos de desarrollo sin infraestructura pesada, siempre que se precargue la tabla de candidatos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara métricas de evaluación (top-k accuracy, similitud de Tanimoto, similitud coseno) pero no incluye valores numéricos ni comparaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el modelo tiene ~2 M de parámetros (pesos de 0,1 GB en safetensors). La VRAM dominante la determina la tabla de candidatos precalculada (`candidate_table` y `candidate_latents`), que crece con el tamaño de la base de moléculas.
- GPU recomendadas: cualquier GPU con suficiente memoria para la tabla de candidatos; el modelo en sí cabe en GPUs de gama baja. Para tablas grandes se recomienda A100, H100 o RTX 4090 por memoria y ancho de banda.
- GPU de consumo: sí, cabe en RTX 3060, RTX 4060, RTX 4090 y similares; en CPU también es viable con tablas pequeñas.
- Opciones de despliegue: inferencia directa con PyTorch y safetensors (según el código de la model card); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles de forma oficial; el autor afirma "rapid inference" y "zero-truncation" gracias a la recuperación en espacio latente, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Latent-Space-Retrosynthesis (este) | 1.999.233 | Recuperación en espacio latente + GRU con halting | Vector de 1040 dims por molécula | GPL-3.0 | Hugging Face, 65 descargas |
| Modelos de retrosíntesis generativos basados en Transformer (p. ej. familias tipo RetroFormer/Chemformer) | no disponible en la informacion proporcionada | Generación autoregresiva de SMILES | Secuencias de tokens | variable | no disponible en la informacion proporcionada |
| Enfoques basados en plantillas (RDChiral, retro templates) | no aplica (no neuronal) | Aplicación de reglas de reacción | Grafo molecular | variable | ampliamente disponibles |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Licencia GPL-3.0: cualquier uso comercial o distribución derivada debe cumplir las obligaciones copyleft de la GPL, lo que puede ser restrictivo para productos propietarios.
- El modelo depende de una base de datos de candidatos precalculada (`preprocessed_routes_cache.npz`); sin ella no puede predecir, y la calidad de la predicción está acotada por la cobertura de esa base.
- La recuperación por similitud en espacio latente puede devolver precursores plausibles pero químicamente inválidos; no se documenta validación de reactividad ni de condiciones de reacción.
- Riesgo de alucinación química: al no generar secuencias, el riesgo se traslada a falsos positivos por vecinos cercanos en el espacio latente con mecanismos distintos.
- Entrenado únicamente con datos en inglés y sobre SMILES; no soporta texto libre ni otros idiomas.
- No se documentan sesgos específicos, pero la cobertura de los datasets (PaRoutes, USPTO, ORD) condiciona el dominio químico: reacciones poco representadas pueden degradar la precisión.
- No se publican cifras de top-k accuracy ni de latencia, lo que dificulta evaluar su idoneidad en producción frente a alternativas generativas.
- El código de ejemplo importa `train.py` (módulos `DynamicMolecularProjector` y `DynamicThinkingRetroModel`), que debe obtenerse del repositorio GitHub del autor; la model card no incluye instrucciones de instalación de dependencias más allá de RDKit, PyTorch y safetensors.
- El repositorio tiene 65 descargas y 0 likes, sin validación independiente conocida; trátese como prototipo de investigación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kssrikar4/Latent-Space-Retrosynthesis
- Modelo alternativo del mismo autor: https://huggingface.co/kssrikar4/Mechanism-aware-retrosynthesis
- Repositorio GitHub: https://github.com/kssrikar4/Mechanism-aware-retrosynthesis
- Dataset PaRoutes: no disponible enlace directo en la informacion proporcionada
- Dataset USPTO: no disponible enlace directo en la informacion proporcionada
- Open Reaction Database: https://github.com/open-reaction-database/ord-data
