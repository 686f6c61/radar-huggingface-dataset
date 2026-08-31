# QuerynAi/queryn-adapter-ada-002_to_qwen3-emb-8b

## Resumen

Queryn adapter — `ada-002` → `qwen3-emb-8b` es un adaptador de traducción de embeddings desarrollado por QuerynAi, parte del motor de interoperabilidad Queryn. Su función es transformar un vector de embedding generado por el modelo `ada-002` de OpenAI (1536 dimensiones) al espacio de representación de `qwen3-emb-8b` (4096 dimensiones), de modo que un corpus ya embebido con `ada-002` pueda servirse contra un índice construido con `qwen3-emb-8b` sin necesidad de re-embebido. Esto resuelve el problema práctico de migrar o combinar infraestructuras de búsqueda semántica que usan modelos de embedding distintos.

El modelo es una proyección lineal (arquitectura `linear`) con aproximadamente 6,3 millones de parámetros, exportado a ONNX (opset 17) y publicado bajo licencia MIT. Se entrenó sobre pares de embeddings de un corpus multi-dominio de unas 350 000 filas, con una pérdida basada en similitud coseno. Su relevancia radica en que permite aprovechar índices existentes sin reprocesar datos, ahorrando costes computacionales y de almacenamiento, y facilita la interoperabilidad entre sistemas de embeddings propietarios y abiertos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Proyeccion lineal (plain linear projection) |
| Parametros totales | ~6,3 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (no es modelo de lenguaje) |
| Tipos de cuantizacion | No disponible (exportado en float32) |
| Idiomas soportados | No disponible (el adaptador no especifica idiomas; los modelos fuente y destino son multilingues) |
| Licencia | MIT |
| Formato de pesos | ONNX (model.onnx) |

## Arquitectura y entrenamiento

El adaptador es una capa lineal que mapea un vector de entrada de 1536 dimensiones a uno de salida de 4096 dimensiones. El grafo ONNX normaliza internamente la entrada con L2, por lo que no se requiere pre-normalizacion. La salida se entrega unit-normalizada en el espacio de `qwen3-emb-8b`. El batch es dinamico.

El entrenamiento se realizo sobre pares de embeddings generados con `ada-002` y `qwen3-emb-8b` a partir de un corpus unificado multi-dominio: resumenes de arXiv, jurisprudencia australiana, pasajes de SQuAD, resumenes de PubMed y noticias de criptomonedas y mercados (~350 000 filas). La funcion de perdida fue `1 - media de similitud coseno`, con optimizador Adam y programacion de tasa de aprendizaje `ReduceLROnPlateau`, guardando el checkpoint de mejor epoca. Se comparo una arquitectura lineal con una MLP profunda; la lineal obtuvo mejor similitud coseno en test (0,7985 frente a 0,7949) y fue la publicada.

## Capacidades

- Traduccion de embeddings de `ada-002` (1536-d) al espacio de `qwen3-emb-8b` (4096-d).
- Entrada: tensor float32 de forma `[batch, 1536]`; salida: tensor float32 de forma `[batch, 4096]`, unit-normalizado.
- Normalizacion L2 integrada en el grafo, lo que simplifica el uso.
- Batch dinamico, adecuado para inferencia por lotes.
- No es un modelo generativo ni de lenguaje; solo transforma vectores.
- Compatible con ONNX Runtime en CPU y GPU.

## Casos de uso

- Migracion de infraestructura de embeddings: una empresa que tiene millones de documentos embebidos con `ada-002` puede cambiar su motor de busqueda a `qwen3-emb-8b` sin re-embebido, ejecutando el adaptador una sola vez sobre los vectores existentes.
- Busqueda semantica hibrida: combinar indices construidos con distintos modelos de embedding en un mismo sistema, traduciendo los vectores de un espacio a otro para unificar la recuperacion.
- Ahorro de costes en pipelines de RAG: evitar reprocesar un corpus completo con un modelo nuevo, reduciendo tiempo de computo y almacenamiento intermedio.
- Evaluacion comparativa de modelos de embedding: permite medir la calidad relativa de `qwen3-emb-8b` frente a `ada-002` sobre los mismos datos, usando el adaptador como puente.
- Integracion en servicios de inferencia ONNX: al ser un modelo pequeno (~6,3M parametros), puede desplegarse en funciones serverless o en el edge para transformar embeddings en tiempo real.
- Interoperabilidad entre proveedores: si un cliente usa OpenAI y otro Qwen, el adaptador facilita compartir datos embebidos sin duplicar almacenamiento.

## Benchmarks y rendimiento

El unico dato de rendimiento publicado es la similitud coseno media en el conjunto de test, obtenida durante el entrenamiento:

| Metrica | Valor |
|---|---|
| Mejor similitud coseno en test (epoca 15) | 0,7985 |
| Similitud coseno con arquitectura profunda (MLP) | 0,7949 |

No se han publicado resultados de benchmarks estandar (MTEB, etc.) en la informacion disponible.

## Requisitos de hardware

- Inferencia en CPU sin problemas: el modelo tiene ~6,3M de parametros y opera sobre vectores de 1536 y 4096 dimensiones; el coste por lote es minimo.
- VRAM estimada: inferior a 1 GB incluso con batch grande; no requiere GPU dedicada.
- GPU recomendada: no necesaria; cualquier CPU moderna es suficiente. Si se usa GPU, cualquier modelo con al menos 2 GB de VRAM vale.
- Opciones de despliegue: ONNX Runtime (CPUExecutionProvider o CUDAExecutionProvider), integrable en servicios como FastAPI, Triton o funciones serverless.
- Latencia y throughput: no disponibles, pero al ser una unica capa lineal, la latencia por lote de 100 vectores deberia ser del orden de milisegundos en CPU.

## Comparativa con modelos similares

No se han encontrado adaptadores publicados con la misma funcion (traduccion `ada-002` → `qwen3-emb-8b`) fuera de la coleccion Queryn. La alternativa directa es re-embebir el corpus con `qwen3-emb-8b`, que implica un coste computacional proporcional al tamano del corpus. La comparacion cualitativa es:

| Enfoque | Coste de migracion | Calidad de los vectores resultantes | Complejidad |
|---|---|---|---|
| Adaptador Queryn (este modelo) | Bajo (una pasada de transformacion) | Limitada por la similitud coseno (0,7985) | Baja (ONNX listo para usar) |
| Re-embebido completo con `qwen3-emb-8b` | Alto (reprocesar todo el corpus) | Original del modelo destino | Media (requiere GPU para volumenes grandes) |

## Limitaciones y advertencias

- La similitud coseno de 0,7985 indica que la traduccion no es perfecta; los vectores resultantes pueden perder matices semanticos respecto a los que generaria `qwen3-emb-8b` directamente.
- El adaptador solo funciona en la direccion `ada-002` → `qwen3-emb-8b`; no soporta la traduccion inversa ni otros modelos fuente.
- El entrenamiento se realizo en dominios especificos (ciencia, legal, QA, medicina, finanzas); el rendimiento en dominios muy diferentes puede degradarse.
- No se han publicado evaluaciones en benchmarks estandar de embedding (MTEB, BEIR), por lo que no hay garantia de calidad en tareas de recuperacion especificas.
- El modelo esta en formato ONNX float32; no se ofrecen cuantizaciones, lo que puede limitar su uso en entornos con restricciones de memoria muy estrictas.
- La licencia MIT permite uso comercial, pero el modelo depende de `ada-002` (propietario de OpenAI) y `qwen3-emb-8b` (licencia de Qwen); el usuario debe verificar las condiciones de uso de ambos modelos fuente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/QuerynAi/queryn-adapter-ada-002_to_qwen3-emb-8b
- Coleccion de adaptadores Queryn: https://huggingface.co/collections/QuerynAi/queryn-embedding-adapters-6a9499470ee93453d02110b4
- Repositorio de Queryn en GitHub: https://github.com/Gigadelux/Queryn
- Modelo `qwen3-emb-8b` en Hugging Face: https://huggingface.co/Qwen/Qwen3-Embedding-8B
- Repositorio de Qwen3-Embedding en GitHub: https://github.com/QwenLM/Qwen3-Embedding
