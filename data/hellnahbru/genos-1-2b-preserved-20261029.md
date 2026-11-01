# hellnahbru/Genos-1.2B-preserved-20261029

## Resumen

Genos-1.2B-preserved-20261029 es una redistribucion del checkpoint Genos-1.2B, un modelo fundacional de genómica humana desarrollado originalmente por BGI-HangzhouAI (BGI Research). El modelo esta disenado para modelar secuencias de ADN humano a resolucion de base unica, con capacidad de contexto de hasta un millon de pares de bases, y emplea una arquitectura de mezcla de expertos (MoE) con 1.246 millones de parametros totales y aproximadamente 0.33B parametros activos por token. Esta pensado para identificar patrones profundos y caracteristicas funcionales en el genoma, tendiendo un puente entre la informacion genetica y los procesos biologicos.

El repositorio aqui referenciado (hellnahbru/Genos-1.2B-preserved-20261029) es una publicacion de terceros que redistribuye los pesos bajo licencia MIT, con la etiqueta `mixtral` y `biology`. No es un modelo de lenguaje conversacional: su vocabulario es de 128 tokens (padded), correspondientes al alfabeto de nucleotidos y tokens especiales, por lo que no genera texto natural ni codigo. Su relevancia radica en ser una de las pocas alternativas abiertas de modelado genomico de contexto largo, aunque su ecosistema y documentacion son limitados y la ficha original corresponde al modelo Genos de BGI, no a esta copia concreta.

La informacion disponible sobre esta publicacion concreta es escasa: 18 descargas, 0 likes, sin pipeline declarado y sin idiomas especificados. Los datos tecnicos que se presentan a continuacion provienen de la model card del modelo original Genos-1.2B, que el autor ha reproducido en este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (8 expertos, 2 seleccionados por token, 12 capas) |
| Parametros totales | 1.246.094.336 (1.2B) |
| Parametros activos | ~0.33B |
| Longitud de contexto | Hasta 1M pares de bases (segun model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de secuencias genomicas, no de lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Genos-1.2B es un transformer de tipo MoE con 12 capas, 16 cabezas de atencion, dimension oculta de atencion de 1024 y dimension oculta de 4096 por experto. Cada capa contiene 8 expertos de los cuales se activan 2 por token, lo que resulta en aproximadamente 0.33B parametros activos sobre 1.2B totales. El vocabulario es de 128 tokens (padded), coherente con un tokenizador de nucleotidos (A, C, G, T, N) y tokens especiales, no con un vocabulario de lenguaje natural. La model card declara capacidad de contexto de hasta 1M de pares de bases mediante aprendizaje a resolucion de base unica.

Segun la model card, el modelo fue entrenado sobre 1600B tokens (presumiblemente bases genomicas) a partir de cientos de genomas de referencia de alta calidad. No se especifican en la informacion disponible la composicion exacta del dataset, el uso de RLHF/DPO ni innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal. Existe una variante entrenada bajo Megatron-LM (Genos-Megatron-1.2B) publicada por el autor original. Esta publicacion concreta no anade informacion sobre el proceso de entrenamiento ni sobre posibles modificaciones respecto al checkpoint original.

## Capacidades

- Modelado de secuencias genomicas humanas a resolucion de base unica.
- Identificacion de patrones profundos y caracteristicas funcionales en el ADN.
- Modelado contextual de secuencias de hasta 1M de pares de bases.
- Aprendizaje de representaciones (embeddings) de secuencias genomicas para tareas downstream.
- No soporta generacion de texto natural, codigo ni matematicas en el sentido convencional de un LLM.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues no aplicables (vocabulario de nucleotidos).
- No se documentan modos especiales como thinking mode, vision o audio.

## Casos de uso

- Anotacion funcional de variantes: usar las representaciones del modelo para puntuar el impacto de variantes en regiones regulatorias, aprovechando el contexto de hasta 1M de pares de bases para capturar interacciones de largo alcance.
- Prediccion de elementos regulatorios: entrenar cabezas ligeras sobre los embeddings de Genos para clasificar enhancers, promotores o sitios de union de factores de transcripcion en ventanas genomicas largas.
- Modelado de expresion genica: emplear el modelo como extractor de caracteristicas en pipelines que relacionan secuencia con niveles de expresion, especialmente en regiones no codificantes donde el contexto largo es relevante.
- Deteccion de patrones de splicing: afinar el modelo para predecir sitios de splicing en transcritos largos, donde la ventana de 1M de bases permite incluir intrones completos.
- Investigacion de estructura de cromatina: usar las representaciones para tareas de prediccion de contactos o dominios topologicos a partir de secuencia, como componente en estudios de genomica comparativa.
- Filtrado y priorizacion en estudios de asociacion: integrar las puntuaciones del modelo como caracteristica adicional en pipelines de GWAS para priorizar variantes no codificantes candidatas.
- Extraccion de embeddings para busqueda de similitud genomica: generar representaciones de fragmentos de ADN y usar busqueda vectorial para identificar regiones homologas o funcionalmente similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como MMLU, HumanEval o GSM8K (no aplicables a un modelo genomico) ni resultados de tareas genomicas estandar (por ejemplo, prediccion de expresion o anotacion de variantes). No se inventan cifras.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): aproximadamente 5 GB para los 1.246B parametros, mas overhead de activaciones y cache de atencion, que puede crecer significativamente con contextos de hasta 1M de tokens.
- VRAM estimada en fp16/bf16: aproximadamente 2.5-3 GB de pesos, mas cache KV; con contexto de 1M de tokens la memoria de atencion puede dominar y requerir tecnicas de atencion eficiente no documentadas en la informacion disponible.
- GPU recomendadas: no disponible de forma explicita; por tamano, cabe en GPUs consumer de gama alta (RTX 3090, RTX 4090, 24 GB) en fp16 para contextos moderados; para contextos de 1M se recomienda A100/H100 con 40-80 GB o estrategias de atencion con memoria lineal.
- Cabe en GPU consumer: si, en fp16/bf16 para contextos cortos o medios; el contexto de 1M requiere planificacion de memoria.
- Opciones de despliegue: no se documentan en la informacion disponible (no se confirma soporte de vLLM, llama.cpp, Ollama o TGI); al ser un modelo MoE con vocabulario de 128 tokens, es probable que requiera codigo de inferencia especifico del repositorio Genos de BGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Genos-1.2B (esta publicacion) | 1.2B totales / 0.33B activos | Hasta 1M pb | MIT | HuggingFace (redistribucion de terceros) | MoE, 8 expertos, vocabulario genomico |
| Genos-10B (BGI-HangzhouAI) | 10B totales / 2.87B activos | Hasta 1M pb | no disponible en la informacion | HuggingFace (oficial) | Version mayor del mismo modelo |
| Genos-Megatron-1.2B (BGI-HangzhouAI) | 1.2B | Hasta 1M pb | no disponible en la informacion | HuggingFace (oficial) | Checkpoint entrenado con Megatron-LM |

No se dispone de datos de benchmarks para comparar rendimiento entre estas variantes ni con otros modelos genomicos (por ejemplo, Nucleotide Transformer o DNABERT) en la informacion proporcionada, por lo que la comparativa se limita a especificaciones estructurales.

## Limitaciones y advertencias

- Modelo de dominio genomico: no es un LLM conversacional; no debe usarse para generacion de texto, codigo o tareas de lenguaje natural.
- Redistribucion de terceros: el repositorio hellnahbru/Genos-1.2B-preserved-20261029 no es el oficial de BGI-HangzhouAI; no hay garantia de que los pesos coincidan exactamente con el checkpoint original ni de que se hayan preservado todas las configuraciones.
- Documentacion limitada: sin pipeline declarado, sin idiomas, sin datos de cuantizacion ni instrucciones de inferencia propias en esta publicacion.
- Riesgo de sobreajuste a genomas de referencia: al entrenarse sobre genomas de referencia de alta calidad, el rendimiento en poblaciones subrepresentadas puede degradarse; no se documentan sesgos poblacionales.
- Contexto de 1M: la memoria de atencion puede ser prohibitiva en hardware consumer; no se documentan tecnicas de atencion eficiente.
- Licencia MIT: permite uso comercial, pero el autor original y esta redistribucion no ofrecen garantias ni soporte; verificar la procedencia de los pesos antes de usos clinicos o regulados.
- Sin validacion clinica: no apto para diagnostico medico sin validacion independiente.
- Ausencia de benchmarks: no hay evidencia publicada en esta ficha sobre su rendimiento relativo frente a alternativas.

## Enlaces

- Repositorio de esta publicacion: https://huggingface.co/hellnahbru/Genos-1.2B-preserved-20261029
- Modelo original Genos-1.2B: https://huggingface.co/BGI-HangzhouAI/Genos-1.2B
- Modelo original Genos-10B: https://huggingface.co/BGI-HangzhouAI/Genos-10B
- Checkpoint Megatron 1.2B: https://huggingface.co/BGI-HangzhouAI/Genos-Megatron-1.2B
- Checkpoint Megatron 10B: https://huggingface.co/BGI-HangzhouAI/Genos-Megatron-10B
- Repositorio GitHub de Genos: https://github.com/BGI-HangzhouAI/Genos
- Megatron-LM: https://github.com/NVIDIA/Megatron-LM
