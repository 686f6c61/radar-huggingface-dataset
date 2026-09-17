# oldman-dev/tis-v2.5-multihop-reranker

## Resumen

TIS v2.5 (Token Importance Scoring v2.5) es un componente de reordenación de pasajes para pipelines de generación aumentada por recuperación (RAG), publicado por el usuario oldman-dev. No es un modelo generativo completo: se trata de tres cabezas neuronales (~5,6 M de parámetros entrenables en total) montadas sobre un Mistral-7B-Instruct-v0.3 congelado y cuantizado en 4 bits NF4, cuyo único cometido es puntuar pasajes recuperados y detectar los pasajes "puente" que encadenan entidades en preguntas de razonamiento multi-salto.

La novedad de la versión 2.5 frente a la 2.3 es un pipeline de puntuación en dos etapas (puntuación directa query-pasaje y refinamiento cruzado entre pasajes) más un clasificador binario explícito de detección de puentes. El autor reporta un recall_both@5 del 100 % en las preguntas de tipo bridge de HotpotQA, manteniendo sin regresión los resultados de contexto largo de la versión anterior (NIAH 95 %, LITM en posición intermedia 72 %).

Es relevante ahora porque aborda dos problemas simultáneos de los sistemas RAG de producción: la pérdida de pasajes intermedios en cadenas de razonamiento de varios saltos y el coste de la ventana de contexto. Al derivar de un proyecto más amplio de "Token Importance Scoring for KV Cache Compression", la misma señal de importancia de tokens que ordena pasajes puede emplearse para decidir qué mantener en la caché KV. La licencia MIT y el tamaño reducido del checkpoint (157,8 MB) facilitan su integración, aunque el repositorio no registra descargas ni validación externa a fecha de la ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo base transformer decoder (Mistral-7B-Instruct-v0.3) congelado en 4-bit NF4, más tres cabezas aprendidas: QueryAwareImportanceHead, BridgeDetectionHead y RefinementScoringHead |
| Parametros totales | 7.000 M del modelo base congelado + ~5,6 M entrenables en las cabezas (1,5 M importancia + 1,05 M deteccion de puente + 2,8 M refinamiento) |
| Parametros activos | No aplica: no es un modelo de mezcla de expertos (MoE) |
| Longitud de contexto | No especificada en la model card del componente; el modelo base Mistral-7B-Instruct-v0.3 declara 32.768 tokens en su propia model card |
| Tipos de cuantizacion | 4-bit NF4 (bitsandbytes) para el modelo base; el checkpoint de cabezas `tis_components.pt` se distribuye sin cuantizar explícita |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pt` (`tis_components.pt`, 157,8 MB, SHA256 `53f3333dffc3288579628ad7f13311e4e8efe41d053dfb9d7479d14f70596413`); el modelo base se carga desde `unsloth/mistral-7b-instruct-v0.3-bnb-4bit` |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder preentrenado que permanece congelado y cuantizado en 4 bits NF4; solo se entrenan las cabezas añadidas sobre las representaciones internas del modelo. `QueryAwareImportanceHead` (~1,5 M de parámetros) produce la puntuación directa de cada pasaje respecto a la consulta (etapa 1); `BridgeDetectionHead` (~1,05 M) es un clasificador binario que identifica pasajes intermedios de una cadena multi-salto; y `RefinementScoringHead` (~2,8 M) aplica atención cruzada entre pasajes para producir la puntuación refinada (etapa 2). La puntuación final se combina linealmente: `final = 0,7 × directa + 0,3 × refinada`.

El entrenamiento usó HotpotQA (multi-salto) y MS-MARCO como conjuntos de datos, con un currículo en dos fases: etapa 1 de 625 pasos con ponderación uniforme de ejemplos y etapa 2 de 375 pasos con un parámetro α de NDCG que pasa de 0,0 a 0,3. Se empleó AdamW con lr=2e-4, batch_size=1, acumulación de gradiente 8, early stopping con paciencia 3 y una pérdida final de 0,023. La duración total fue de 28,6 minutos para 1000 pasos sobre una RTX 5070 de 8 GB. El autor indica compatibilidad hacia atrás: el código de la versión 2.3 carga el checkpoint 2.5 sin cambios. Los datos de entrenamiento y el procedimiento de ajuste no incluyen RLHF ni DPO; es un ajuste supervisado de cabezas de puntuación.

## Capacidades

- Reordenación de pasajes en dos etapas: puntuación directa consulta-pasaje seguida de un refinamiento cruzado que considera el conjunto de pasajes recuperados de forma conjunta.
- Detección explícita de pasajes puente: clasificación binaria de pasajes intermedios que conectan entidades en cadenas de razonamiento multi-salto.
- Razonamiento multi-salto orientado a recuperación (`recall_both@5` reportado del 100 % en preguntas bridge de HotpotQA).
- Puntuación de importancia de tokens heredada del proyecto TIS, orientada a la compresión de la caché KV.
- Evaluación de posicionamiento en contexto largo: 95 % en NIAH y 72 % en LITM en posición intermedia, sin cambios respecto a v2.3.
- Idiomas: únicamente inglés, tanto en consultas como en pasajes.
- No se documenta soporte de tool calling, function calling, uso como agente, generación de texto libre, visión, audio ni modo de razonamiento extendido (thinking mode). El componente no genera respuestas: solo produce puntuaciones y etiquetas.

## Casos de uso

- Reordenación en segunda etapa de un pipeline RAG multi-salto: tras una recuperación inicial por BM25 o embeddings, el modelo reordena los pasajes y detecta los intermedios necesarios para encadenar dos entidades; es el escenario para el que fue entrenado (HotpotQA bridge).
- Preguntas encadenadas sobre bases documentales internas: por ejemplo, "¿qué filial de la empresa X adquirió la compañía que desarrolló el producto Y?", donde el pasaje puente no contiene términos de la consulta y puede quedar fuera del top-k de un recuperador léxico.
- Reducción del contexto enviado al LLM generador: al seleccionar los pasajes con mayor puntuación combinada, se recorta el número de tokens de entrada y, con ello, el coste por consulta en APIs de generación.
- Investigación y revisión bibliográfica: reordenación de fragmentos de artículos en consultas que requieren enlazar un método con el dataset que lo evalúa y con el resultado reportado, un patrón típico de cadenas multi-salto.
- Compresión de caché KV en inferencia de contexto largo: las puntuaciones de importancia por token del proyecto TIS pueden usarse para priorizar qué tokens conservar cuando la secuencia supera la memoria disponible.
- Evaluación comparativa de recuperadores: el componente sirve como referencia (Tier 1, MRR 0.5102 en v2.3) frente a BM25 en experimentos de recuperación, con un coste de integración bajo por su licencia MIT y su tamaño reducido.
- Filtrado de candidatos en asistentes de soporte técnico sobre documentación breve (estilo MS-MARCO): descartar pasajes redundantes o irrelevantes antes de que lleguen al modelo generativo.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card:

| Metrica | v2.3 | v2.5 | Delta |
|---|---|---|---|
| Precision NIAH | 95,0 % | 95,0 % | 0 % |
| LITM posicion intermedia | 72,0 % | 72,0 % | 0 % |
| Recall multi-salto @5 | No disponible | 100 % | Nuevo |
| Latencia de inferencia | ~50 ms | ~120 ms | +70 ms (etapa 2) |
| VRAM maxima | 5,5 GB | 5,5 GB | 0 GB |

Datos historicos de la familia, aportados por el autor:

| Version | Logro | MRR |
|---|---|---|
| v2.5 | Recall@5 multi-salto 100 % | No disponible |
| v2.3 | Comparativa Tier 1 | 0,5102 (+18,1 % frente a BM25) |
| v2.2 | Mejora sobre BM25 | 0,471 (+9,1 % frente a BM25) |

No hay resultados publicados de benchmarks estandar de recuperación (BEIR, MTEB, MS-MARCO dev) ni comparaciones con reordenadores externos en la informacion disponible. Las cifras de NIAH y LITM no van acompañadas del detalle del protocolo de evaluación, la longitud de contexto usada ni el hardware sobre el que se midió la latencia.

## Requisitos de hardware

- VRAM estimada para inferencia: 5,5 GB de pico reportados por el autor (modelo base en 4-bit NF4 más las cabezas).
- Entrenamiento: se completó en 28,6 minutos para 1000 pasos sobre una NVIDIA RTX 5070 de 8 GB, con batch_size=1 y acumulación de gradiente 8.
- Cabe en GPU de consumo: sí, con 8 GB o más. Encajan una RTX 5070, RTX 4060 Ti 16 GB, RTX 4070, RTX 3080/3090 y cualquier GPU de 12 GB o superior. En 8 GB el margen es ajustado (5,5 GB de pico).
- GPUs de centro de datos (A100, H100) no son necesarias para la inferencia, aunque reducirían la latencia de la etapa 2.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI. La model card solo describe la carga mediante `PatchedCausalLM` del repositorio de código fuente y `torch.load` del checkpoint de cabezas.
- Latencia estimada: ~120 ms por consulta con la etapa 2 activa, frente a ~50 ms de la v2.3. El autor no especifica el hardware ni el tamaño de lote de esa medición. No hay datos de throughput.

## Comparativa con modelos similares

No hay datos en la informacion disponible sobre comparaciones con reordenadores externos (BGE-reranker, Cohere Rerank, cross-encoders de MS-MARCO). La única comparativa disponible es interna a la familia:

| Modelo | Parametros entrenables | Contexto | Rendimiento reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TIS v2.5 | ~5,6 M sobre base 7 B congelado | No especificado (base 32.768 tokens) | Recall@5 multi-salto 100 %; NIAH 95 %; LITM 72 %; ~120 ms | MIT | HuggingFace, 0 descargas |
| TIS v2.3 | No disponible | No especificado | MRR 0,5102 (+18,1 % vs BM25); ~50 ms | MIT | HuggingFace |
| TIS v2.2 | No disponible | No especificado | MRR 0,471 (+9,1 % vs BM25) | MIT | HuggingFace |
| BM25 | 0 (recuperador lexico) | No aplica | Referencia base de las comparaciones anteriores | Algoritmo libre | Ampliamente disponible |

## Limitaciones y advertencias

- El modelo está entrenado y evaluado solo en inglés; no se garantiza comportamiento en castellano ni en otros idiomas.
- El recall_both@5 del 100 % procede únicamente del autor y se mide sobre preguntas bridge de HotpotQA, un conjunto presente en el entrenamiento; no hay validación en un conjunto retenido ni evaluación independiente, por lo que la cifra puede reflejar sobreajuste al dominio.
- El repositorio acumula 0 descargas y 0 "likes" en el momento de la consulta, y no hay publicaciones, paper ni revisión por pares asociados más allá de una cita genérica de 2026.
- La vida útil del proyecto depende de una única persona (`oldman-dev` / `nitroxido`); no hay garantía de mantenimiento ni de soporte.
- El checkpoint tiene 157,8 MB, un tamaño muy superior a los ~22 MB que ocuparían 5,6 M de parámetros en fp32. Esto sugiere que el archivo contiene tensores adicionales no documentados en la tabla de componentes; conviene inspeccionarlo antes de integrarlo en producción.
- El código necesario para ejecutar el modelo (`PatchedCausalLM`, `src.token_importance.model.patched_model`) no está incluido en el repositorio de HuggingFace: hay que clonarlo desde GitHub por separado, lo que añade riesgo de reproducibilidad si el repositorio cambia.
- La etapa 2 duplica aproximadamente la latencia (de ~50 ms a ~120 ms) sin mejora medible en NIAH ni LITM según los propios datos del autor; el coste solo se justifica en escenarios multi-salto.
- Aunque la cabecera declara licencia MIT, el modelo base Mistral-7B-Instruct-v0.3 tiene su propia licencia (Apache 2.0 en la distribución original), que debe verificarse para uso comercial.
- No se documentan medidas de mitigación de sesgos, filtros de contenido ni comportamiento ante consultas adversariales.
- El componente solo produce puntuaciones y etiquetas; no genera texto y no debe presentarse como un modelo de lenguaje utilizable de forma autónoma.

## Enlaces

- HuggingFace: https://huggingface.co/oldman-dev/tis-v2.5-multihop-reranker
- Modelo base: https://huggingface.co/unsloth/mistral-7b-instruct-v0.3-bnb-4bit
- Repositorio de código fuente: https://github.com/nitroxido/token-importance-scoring
- Versión anterior (v2.3): https://huggingface.co/oldman-dev/tis-v2.3-passage-reranker
- Versión anterior (v2.2): https://huggingface.co/oldman-dev/tis-v2.2-passage-reranker
- La búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo: los enlaces recuperados corresponden a foros sobre Facebook y no guardan relación con el contenido de esta ficha. No se han encontrado papers, blogs ni demos adicionales.
