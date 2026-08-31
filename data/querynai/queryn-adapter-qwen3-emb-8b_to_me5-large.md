# QuerynAi/queryn-adapter-qwen3-emb-8b_to_me5-large

## Resumen

Queryn adapter es un adaptador de traducción de embeddings desarrollado por QuerynAi que transforma los vectores generados por qwen3-emb-8b (4096 dimensiones) al espacio de representación de me5-large (1024 dimensiones). El modelo resuelve el problema de interoperabilidad entre sistemas de embeddings: permite que un corpus ya indexado con qwen3-emb-8b pueda servirse contra un índice construido con me5-large sin necesidad de re-embedding del corpus completo.

La arquitectura es una proyección lineal simple con aproximadamente 4,2 millones de parámetros, exportada a ONNX (opset 17). El adaptador normaliza L2 internamente tanto la entrada como la salida, garantizando vectores unitarios en el espacio destino. Forma parte del motor de traducción de embeddings Queryn, que busca la interoperabilidad entre distintos modelos de embeddings sin coste adicional de computación.

Su relevancia actual radica en el creciente ecosistema de modelos de embeddings propietarios y abiertos: las organizaciones que desean cambiar de modelo de embeddings sin re-procesar sus corpus pueden usar este tipo de adaptadores para ahorrar tiempo y coste computacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Proyección lineal (linear projection) |
| Parametros totales | ~4,2 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (operador sobre embeddings, no sobre texto) |
| Tipos de cuantizacion | No disponible (ONNX float32) |
| Idiomas soportados | No disponible (depende de los modelos origen y destino) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 17) |

## Arquitectura y entrenamiento

El adaptador es una proyección lineal que mapea embeddings de 4096 dimensiones (qwen3-emb-8b) a 1024 dimensiones (me5-large). El grafo ONNX incluye normalización L2 tanto en la entrada como en la salida, de modo que el usuario no necesita pre-normalizar los vectores de origen. El eje de batch es dinámico, lo que permite procesar lotes de cualquier tamaño.

El entrenamiento se realizó sobre pares de embeddings generados a partir de un corpus multi-dominio unificado de aproximadamente 350.000 filas, que incluye resúmenes de arXiv, jurisprudencia australiana, pasajes de SQuAD, resúmenes de PubMed y noticias de criptomonedas y mercados. La función de pérdida fue `1 - similitud coseno media`, con optimizador Adam y reducción de learning rate mediante ReduceLROnPlateau, guardando el checkpoint de mejor época. Se comparó una arquitectura lineal con una MLP profunda; la lineal obtuvo mejor similitud coseno en test (0,9539 frente a 0,9498) y fue la publicada.

## Capacidades

- Traducción de embeddings: transforma vectores de qwen3-emb-8b (4096-d) al espacio de me5-large (1024-d).
- Normalización L2 integrada: el grafo normaliza tanto la entrada como la salida, garantizando vectores unitarios.
- Batch dinámico: acepta lotes de cualquier tamaño en el eje de batch.
- Inferencia ligera: al ser una proyección lineal de solo 4,2 millones de parámetros, la latencia es mínima y puede ejecutarse en CPU.
- Interoperabilidad entre modelos: permite combinar corpus indexados con qwen3-emb-8b con índices de me5-large sin re-embedding.
- Formato ONNX: portable y ejecutable con cualquier runtime compatible (ONNX Runtime, etc.).

## Casos de uso

- Migración de infraestructura de embeddings: una organización que ha indexado su corpus con qwen3-emb-8b y desea cambiar a me5-large puede usar el adaptador para transformar los embeddings existentes sin re-procesar el corpus completo, ahorrando coste computacional y tiempo.
- Búsqueda híbrida multi-modelo: sistemas de retrieval que combinan resultados de varios modelos de embeddings pueden alinear los espacios vectoriales mediante el adaptador, permitiendo fusionar rankings de qwen3-emb-8b y me5-large.
- A/B testing de modelos de embeddings: evaluar si me5-large produce mejores resultados de búsqueda que qwen3-emb-8b sin necesidad de re-embedding del corpus, usando el adaptador para generar los vectores en el espacio destino.
- Reducción de costes de almacenamiento: me5-large produce vectores de 1024 dimensiones frente a los 4096 de qwen3-emb-8b, por lo que transformar los embeddings reduce el espacio de almacenamiento del índice a una cuarta parte.
- Sistemas de retrieval aumentado (RAG) multi-tenant: en entornos donde diferentes clientes usan distintos modelos de embeddings, el adaptador permite unificar los vectores en un espacio común para servirlos desde un único índice.
- Integración en pipelines de datos: el formato ONNX permite integrar el adaptador en pipelines de procesamiento por lotes (por ejemplo, con Apache Spark o similares) para transformar embeddings históricos de forma programática.

## Benchmarks y rendimiento

La información disponible reporta la similitud coseno en test como métrica principal:

| Métrica | Valor |
|---|---|
| Mejor similitud coseno en test (época 15) | 0,9539 |
| Ablación de arquitectura - lineal | 0,9539 |
| Ablación de arquitectura - profunda (MLP) | 0,9498 |

No se han publicado resultados de benchmarks comparativos con otros adaptadores en la información disponible.

## Requisitos de hardware

- VRAM estimada: no requiere GPU; el modelo tiene solo ~4,2 millones de parámetros y puede ejecutarse en CPU con ONNX Runtime.
- GPU recomendada: ninguna en particular; si se desea aceleración, cualquier GPU moderna con soporte CUDA sirve, aunque no es necesaria.
- Compatibilidad con hardware de consumo: sí, funciona en cualquier CPU x86_64 o ARM; el peso del modelo es de unos pocos megabytes.
- Opciones de despliegue: ONNX Runtime (CPUExecutionProvider o CUDAExecutionProvider), integrable en servicios Python, contenedores Docker o funciones serverless.
- Latencia y throughput: no disponible en la información proporcionada, pero al ser una proyección lineal de 4,2M de parámetros, la latencia por lote es del orden de milisegundos en CPU.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores de traducción de embeddings comparables en la información proporcionada. El proyecto Queryn publica una colección completa de adaptadores (Queryn Embedding Adapters) que cubren distintos pares de modelos origen-destino, pero no se han encontrado métricas comparativas entre ellos.

Como referencia de los modelos involucrados:

| Modelo | Dimensiones | Tipo |
|---|---|---|
| qwen3-emb-8b (origen) | 4096 | Modelo de embeddings denso de Qwen |
| me5-large (destino) | 1024 | Modelo de embeddings de la familia Multilingual E5 |
| Queryn adapter (este modelo) | 4096 → 1024 | Proyección lineal de traducción |

## Limitaciones y advertencias

- Alcance limitado: el adaptador solo traduce de qwen3-emb-8b a me5-large; no es un modelo de propósito general ni puede traducir entre otros pares de modelos.
- Pérdida de información: la proyección de 4096 a 1024 dimensiones es una reducción dimensional que puede perder información semántica; la similitud coseno máxima de 0,9539 indica que la traducción no es perfecta.
- Dependencia de los modelos origen y destino: la calidad de la traducción depende de la calidad de los embeddings de qwen3-emb-8b y de la compatibilidad semántica con me5-large.
- Sin garantía de rendimiento en dominios no vistos: el entrenamiento se realizó sobre dominios específicos (arXiv, jurisprudencia, SQuAD, PubMed, finanzas); el rendimiento en otros dominios puede degradarse.
- Riesgo de alucinación: no aplica directamente, ya que no es un modelo generativo, pero la traducción puede producir vectores que no representen fielmente el significado original.
- Licencia MIT: permite uso comercial sin restricciones, pero el usuario debe verificar las licencias de los modelos origen y destino (qwen3-emb-8b y me5-large) para sus propios usos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/QuerynAi/queryn-adapter-qwen3-emb-8b_to_me5-large
- Colección de adaptadores Queryn: https://huggingface.co/collections/QuerynAi/queryn-embedding-adapters-6a9499470ee93453d02110b4
- Repositorio del proyecto Queryn: https://github.com/Gigadelux/Queryn
- Modelo origen qwen3-emb-8b: https://huggingface.co/Qwen/Qwen3-Embedding-8B
- Repositorio Qwen3-Embedding: https://github.com/QwenLM/Qwen3-Embedding
