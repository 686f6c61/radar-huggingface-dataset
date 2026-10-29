# BGI-HangzhouAI/Genos-10B

## Resumen

Genos-10B es un modelo fundacional de genómica humana desarrollado por BGI-HangzhouAI, el brazo de investigación en IA del grupo BGI (Yantian, China). No es un modelo de lenguaje conversacional: opera directamente sobre secuencias de ADN a resolución de base individual y está diseñado para modelar contexto genómico en ventanas de hasta un millón de pares de bases. Su relevancia radica en que aplica el paradigma de los modelos fundacionales (preentrenamiento masivo + ajuste posterior) a un dominio científico donde las alternativas clásicas son pipelines específicos y modelos de contexto corto.

Arquitectura y escala: es un transformer de mezcla de expertos (MoE) con 10.270.248.960 parámetros totales y 2,87B activados por token, 12 capas, 8 expertos (2 seleccionados por token) y una dimensión de atención de 4096. Se entrenó sobre 2.200B de tokens extraídos de cientos de genomas de referencia de alta calidad. La licencia MIT y la disponibilidad de checkpoints también en formato Megatron-LM lo hacen atractivo para investigación y para integración en pipelines bioinformáticos propios.

El modelo se publica junto a una variante pequeña, Genos-1.2B (1,2B totales, 0,33B activos, 1.600B tokens), pensada para experimentación con menos recursos. En el momento de la ficha no hay resultados de benchmarks publicados ni documentación sobre el proceso de ajuste (RLHF/DPO) o la composición exacta del corpus.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), 8 expertos y 2 seleccionados por token |
| Parámetros totales | 10.270.248.960 (~10B) |
| Parámetros activos | 2,87B |
| Longitud de contexto | Hasta 1.000.000 de pares de bases (1M pb) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No aplica: modelo de secuencias genómicas; vocabulario de 256 tokens (padded) |
| Licencia | MIT |
| Formato de pesos | safetensors (existen checkpoints equivalentes en formato Megatron-LM) |
| Capas | 12 |
| Dimensión oculta de atención | 4096 |
| Cabezas de atención | 16 |
| Dimensión oculta MoE por experto | 8192 |
| Tokens de entrenamiento | 2.200B |
| Tamaño del repositorio | 41,1 GB |
| Descargas / likes en HuggingFace | 209 / 26 |

## Arquitectura y entrenamiento

Genos-10B es un transformer MoE de 12 capas con 8 expertos y enrutamiento top-2 (2,87B parámetros activos de 10,27B totales). La dimensión de atención es 4096 con 16 cabezas, y cada experto tiene una dimensión oculta de 8192. El vocabulario es de solo 256 tokens (padded), coherente con un alfabeto genómico (bases, ambigüedades y tokens especiales) en lugar de un vocabulario lingüístico. La etiqueta `mixtral` del repositorio sugiere que la implementación de referencia deriva del código MoE de Mixtral, aunque el modelo no procesa lenguaje natural.

El modelo se entrenó con 2.200B de tokens procedentes de "cientos de genomas de referencia de alta calidad", según la model card, y aprende representaciones a resolución de base individual para capturar patrones de secuencia y features funcionales. La familia incluye checkpoints en formato Megatron-LM, lo que indica que el entrenamiento se realizó con ese framework. No hay información pública en la documentación proporcionada sobre la composición exacta del dataset, el esquema de tokenización, el tipo de codificación posicional, si se aplicó RLHF/DPO o qué estrategia se usó para extender el contexto hasta 1M pb.

## Capacidades

- Modelado de contexto genómico sobre secuencias de ADN de hasta 1M de pares de bases.
- Aprendizaje a resolución de base individual, sin tokenización por palabras.
- Identificación de patrones profundos de secuencia y features funcionales ocultas en el genoma.
- Extracción de representaciones (embeddings) contextualizadas de regiones genómicas.
- Capacidad declarada de conectar información genética con actividades biológicas, según el autor.
- No soporta generación de lenguaje natural, tool calling, agentes ni razonamiento multi-paso en el sentido de los LLM.
- No se documentan capacidades multimodales (visión, audio) ni modo "thinking".
- No se documenta soporte multilingüe: el espacio de entrada es el alfabeto genómico.

## Casos de uso

- Anotación funcional de regiones no codificantes: el modelo puede procesar ventanas largas de hasta 1M pb para localizar promotores, enhancers y otros elementos reguladores aprovechando el contexto lejano.
- Predicción de efectos de variantes: evaluar si un cambio de una sola base altera patrones de secuencia aprendidos, útil en estudios de asociación y en interpretación de variantes de significado incierto.
- Descubrimiento de genes y elementos estructurales: usar las representaciones internas para segmentar el genoma y delimitar fronteras de genes, TADs u otras estructuras.
- Modelo base para fine-tuning en tareas downstream: servir como backbone preentrenado y ajustarlo con datos etiquetados de expresión, conservación o accesibilidad de cromatina.
- Extracción de embeddings para clustering y búsqueda de similitud entre regiones genómicas de distintos individuos o especies.
- Análisis de variación estructural a gran escala: con contexto de hasta 1M pb se pueden estudiar deleciones, inversiones o duplicaciones que afectan a regiones largas y que los modelos de contexto corto no cubren.
- Priorización en pipelines de genómica clínica: usar las puntuaciones del modelo como señal adicional junto a predictores específicos para clasificar variantes candidatas.
- Investigación comparativa entre especies: modelar regiones ortólogas y detectar patrones conservados o divergentes entre genomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de Genos-10B no incluye métricas de evaluación (ni de tareas genómicas como clasificación de elementos reguladores, predicción de expresión o variant effect prediction, ni comparaciones con otros modelos), y la búsqueda web no ha devuelto resultados técnicos asociados a este modelo.

## Requisitos de hardware

- Pesos en bf16: aproximadamente 20,5 GB para los 10,27B parámetros. El repositorio ocupa 41,1 GB, lo que sugiere que incluye shards adicionales o versiones en mayor precisión.
- Coste de cómputo por token equivalente a un modelo denso de ~2,87B parámetros activos, gracias al enrutamiento top-2 sobre 8 expertos.
- GPU recomendadas: A100 de 40 GB o 80 GB, H100 de 80 GB para inferencia en bf16 con contexto moderado. Para contextos muy largos se necesitan varias GPU o técnicas de paging/offload del KV cache.
- GPU de consumo: en una RTX 4090 de 24 GB los pesos en bf16 caben con muy poco margen, por lo que en la práctica requiere cuantización o sharding. En GPUs de 16 GB o menos no es viable sin cuantización agresiva.
- KV cache estimada: asumiendo atención multi-cabeza con 12 capas y dimensión 4096 en bf16, el coste es de ~196 KB por par de bases. A 1M pb de contexto completo eso supone ~197 GB de KV cache, inviable en una sola GPU; a 32k pb serían ~6,3 GB. Para aprovechar ventanas de 1M pb hace falta chunking, atención con ventana deslizante o mecanismos de memoria externa.
- Opciones de despliegue documentadas: transformers y checkpoints Megatron-LM. No se documenta soporte para vLLM, TGI, llama.cpp, Ollama ni formato GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Organización | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Genos-10B | BGI-HangzhouAI | 10B totales / 2,87B activos | 1M pb | MIT | HuggingFace y GitHub |
| Genos-1.2B | BGI-HangzhouAI | 1,2B totales / 0,33B activos | 1M pb | MIT | HuggingFace y GitHub |
| Evo / Evo-2 | Arc Institute | No disponible en la información proporcionada | No disponible | No disponible | No verificado en esta ficha |
| Nucleotide Transformer | InstaDeep | No disponible en la información proporcionada | No disponible | No disponible | No verificado en esta ficha |
| DNABERT-2 | Zhihan Zhou et al. | No disponible en la información proporcionada | No disponible | No disponible | No verificado en esta ficha |
| HyenaDNA | Stanford | No disponible en la información proporcionada | No disponible | No disponible | No verificado en esta ficha |

Dentro de la propia familia, Genos-1.2B es la alternativa directa: misma longitud de contexto y licencia, con 1.600B tokens de entrenamiento y un coste de inferencia mucho menor (0,33B activos). Para el resto de modelos genómicos fundacionales, las especificaciones concretas no están en la información proporcionada y deben consultarse en sus respectivas model cards antes de establecer comparaciones numéricas.

## Limitaciones y advertencias

- Modelo de dominio específico: no es un LLM y no puede mantener conversaciones, generar texto libre ni ejecutar tool calling. Cualquier uso fuera del análisis de secuencias genómicas requiere adaptación.
- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de rendimiento frente a alternativas, lo que dificulta justificar su elección en producción.
- Documentación incompleta: no se detallan la composición del corpus, los criterios de filtrado de genomas, el esquema de tokenización ni el proceso de alineación posterior.
- Riesgo de sesgo poblacional: al entrenarse con genomas de referencia, las variantes y regiones infrarrepresentadas en esas referencias pueden modelarse peor; la model card no aborda este punto.
- Riesgo de sobreajuste a patrones espurios: como cualquier modelo fundacional, puede producir asociaciones que no tienen validez biológica y que deben validarse experimentalmente.
- Contexto de 1M pb teórico pero costoso: el KV cache asociado hace que esa ventana no sea practicable en hardware de consumo sin técnicas adicionales.
- Limitaciones de licencia: la licencia MIT es permisiva y permite uso comercial, pero conviene revisar las condiciones de los datos de entrenamiento (genomas de referencia) y de las herramientas de las que dependen los pipelines derivados.
- Sin cuantizaciones publicadas ni formato GGUF: el despliegue en entornos con poca VRAM exige cuantizar manualmente y validar la degradación.
- Sin información sobre estabilidad numérica, longitud efectiva de contexto o rendimiento en secuencias no humanas.
- Fecha de publicación muy reciente (12 de octubre de 2025) y pocas descargas (209), por lo que la comunidad aún no ha validado el modelo de forma independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BGI-HangzhouAI/Genos-10B
- Modelo hermano Genos-1.2B: https://huggingface.co/BGI-HangzhouAI/Genos-1.2B
- Checkpoint Megatron-LM 10B: https://huggingface.co/BGI-HangzhouAI/Genos-Megatron-10B
- Checkpoint Megatron-LM 1.2B: https://huggingface.co/BGI-HangzhouAI/Genos-Megatron-1.2B
- Repositorio GitHub del proyecto: https://github.com/BGI-HangzhouAI/Genos
- Framework Megatron-LM: https://github.com/NVIDIA/Megatron-LM
- BGI Group (organización matriz): https://en.genomics.cn/
- BGI Group en Wikipedia: https://en.wikipedia.org/wiki/BGI_Group
