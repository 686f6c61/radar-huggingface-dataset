# isaxtsystems/isaxt-quiz-embeddings-v6

## Resumen

ISAXT Quiz Embeddings v6 es un codificador de recuperación semántica (retrieval encoder) desarrollado por VELXT Studio dentro de la familia ISAXT. Se trata de un fine-tune del codificador de producción v5, que a su vez parte de la arquitectura `prajjwal1/bert-tiny`. El modelo no genera texto ni responde preguntas: recibe una pregunta de trivia y devuelve un vector de 128 dimensiones que se compara por similitud coseno contra una base de preguntas ya embebidas, devolviendo la respuesta verificada asociada a la coincidencia más cercana.

El modelo resuelve el problema de enrutamiento semántico en sistemas de trivia: dado un enunciado o una paráfrasis, localizar la pregunta canónica correspondiente en un corpus propio. Con solo 4.385.920 parámetros y una longitud máxima de secuencia de 128 tokens, está diseñado para ejecutarse en CPU con latencias mínimas y un coste computacional despreciable, lo que lo hace adecuado para despliegues de borde o servicios de alto volumen donde el coste por consulta es crítico.

La relevancia de esta versión radica en la incorporación de negativos duros minados del propio corpus (hard negatives) durante el entrenamiento contrastivo, lo que mejora el ranking frente a v5 sin añadir conocimiento nuevo: el corpus, los idiomas y las categorías son los mismos. Es importante señalar que, según la model card, el artefacto es un candidato de publicación que aún no ha sido subido a Hugging Face ni está activo en producción; v5 sigue siendo el codificador en servicio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `BertModel` (2 capas, 2 cabezas de atención, hidden 128, intermediate 512) |
| Parametros totales | 4.385.920 (~4,39 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens (longitud máxima de secuencia) |
| Tipos de cuantizacion | FP32 y INT8 dinámico (ONNX); cuantización row-wise |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors, ONNX (FP32 con sidecar de datos externos, e INT8 dinámico) |

## Arquitectura y entrenamiento

La arquitectura es un transformer BERT en miniatura con 2 capas, 2 cabezas de atención, dimensión oculta de 128 y dimensión intermedia de 512, heredada de `prajjwal1/bert-tiny`. La salida es un vector de 128 dimensiones obtenido mediante mean-pooling sobre la máscara de atención y posterior normalización L2, de modo que la similitud coseno se reduce a un producto escalar. El objetivo de entrenamiento es InfoNCE contrastivo con temperatura 0,05, implementado mediante `MultipleNegativesRankingLoss` con negativos duros minados del corpus incorporados al pool.

El fine-tune se realizó durante 3 épocas con batch size 16, learning rate 2e-5 y un 10 % de warm-up lineal, semilla 20261006 y early stopping con paciencia 2 (la mejor época fue la tercera y última). Se usaron 923 ejemplos contrastivos de banda dura y 118 de validación. Las pérdidas registradas fueron 0,130038 → 0,089017 → 0,078351 en entrenamiento, con una mejor pérdida de validación de 0,063306. Todo el entrenamiento se ejecutó únicamente en CPU (el trainer no tiene ruta de código para GPU) y tardó 0,54 minutos. El fichero de pesos es byte-idéntico al candidato medido `v6b` (SHA-256 `7dc6a18ed17bf3f106ac183307f98a32d9ed6d982008fd87fed4126716e1386a`); los candidatos v6a y v6.1 fueron medidos y descartados.

## Capacidades

- Generación de embeddings de frases para recuperación semántica: produce un vector normalizado de 128 dimensiones por pregunta.
- Búsqueda por similitud coseno sobre corpus previamente embebidos, devolviendo la pregunta canónica más cercana.
- Robustez ante paráfrasis de preguntas de trivia, gracias al entrenamiento contrastivo con negativos duros.
- Ejecución en CPU con coste mínimo, sin necesidad de GPU.
- Exportación ONNX con variantes FP32 e INT8 dinámico, apta para `onnxruntime` con `CPUExecutionProvider`.
- Compatibilidad con `text-embeddings-inference` y endpoints compatibles (según tags del repositorio).
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto.
- Monolingüe: únicamente inglés.

## Casos de uso

- Enrutamiento de preguntas en un juego de trivia: el modelo embebe la pregunta del usuario y recupera la pregunta canónica del corpus para devolver su respuesta verificada, evitando que un LLM generativo alucine la respuesta.
- Detección de preguntas duplicadas o casi duplicadas en un corpus de trivia: se comparan los embeddings de pares de preguntas y se agrupan por umbral de similitud coseno para deduplicar el catálogo.
- Búsqueda semántica en una base de preguntas frecuentes (FAQ): dado que el patrón es el mismo (pregunta → coincidencia más cercana → respuesta almacenada), puede reutilizarse para enrutar consultas de soporte hacia entradas verificadas.
- Servicio de alto volumen en CPU: con 4,39 M de parámetros y secuencias de 128 tokens, el coste por inferencia es mínimo, lo que permite atender picos de tráfico sin GPU.
- Despliegue en dispositivos de borde o entornos sin acelerador: la variante ONNX INT8 dinámico está pensada para ejecutarse en CPU, lo que facilita integraciones en contenedores ligeros o hardware modesto.
- Clasificación y clustering de preguntas por tema: los embeddings pueden alimentar un clasificador o un algoritmo de clustering (k-means) para organizar el corpus por categorías sin etiquetas previas.
- Filtrado de consultas fuera de dominio: si la similitud máxima con el corpus cae por debajo de un umbral, el sistema puede rechazar la consulta en lugar de devolver una respuesta incorrecta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas de entrenamiento (pérdidas de train y validación) y la verificación de que los grafos ONNX aceptaron batch sizes 1, 2 y 3 en la puerta de medición del 2026-10-21, sin cifras de latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso principal, ya que el modelo está diseñado para CPU; en FP32 ocupa aproximadamente 17,5 MB de pesos y en INT8 alrededor de 4,4 MB.
- GPU recomendadas: no disponibles; el modelo no requiere GPU y el entrenamiento se realizó íntegramente en CPU.
- Cabe en cualquier GPU de consumo e incluso en entornos sin GPU; también en dispositivos de borde con memoria limitada.
- Opciones de despliegue: `transformers` (PyTorch), `onnxruntime` con `CPUExecutionProvider` (FP32 o INT8), `text-embeddings-inference` y endpoints compatibles.
- Latencia y throughput estimados: no disponibles; la model card no publica mediciones de rendimiento en inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ISAXT Quiz Embeddings v6 | 4,39 M | 128 tokens | en | MIT | Candidato de publicación; no subido a HF según la model card |
| ISAXT Quiz Embeddings v5 | no disponible | no disponible | en | MIT | Codificador en producción actual |
| `prajjwal1/bert-tiny` | ~4,4 M | 512 tokens (BERT estándar) | en | Apache 2.0 (según el modelo original) | Público en Hugging Face |
| `sentence-transformers/all-MiniLM-L6-v2` | ~22,7 M | 256 tokens | en | Apache 2.0 | Público en Hugging Face |

La comparación con `all-MiniLM-L6-v2` es orientativa por categoría (encoder de frases ligero para similitud semántica); no se dispone de métricas comparativas de rendimiento entre ambos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no responde preguntas, no elige opciones A/B/C/D y no produce texto; solo devuelve embeddings.
- Monolingüe: únicamente inglés; no se ha entrenado para otros idiomas.
- Longitud de contexto muy corta (128 tokens), adecuada para preguntas de trivia pero insuficiente para documentos largos.
- El corpus de entrenamiento es reducido (923 ejemplos contrastivos) y específico del dominio de trivia; el rendimiento fuera de ese dominio no está medido.
- No añade conocimiento nuevo respecto a v5: no incorpora preguntas, entidades, idiomas ni categorías adicionales.
- Estado de publicación: según la model card, el artefacto no ha sido subido a Hugging Face ni está activo en servicio; v5 sigue siendo el codificador en producción.
- La model card advierte de un error de uso frecuente: pasar una lista de palabras al tokenizador en lugar de la cadena completa, lo que devolvería el embedding de la primera palabra.
- La cuantización INT8 y los batch sizes verificados (1, 2 y 3) son un rango medido, no una garantía para cualquier tamaño de lote; se recomienda medir el runtime propio antes de enviar lotes grandes.
- Licencia MIT: permite uso comercial, pero conviene revisar las condiciones del modelo base `prajjwal1/bert-tiny` y del corpus `isaxtsystems/quiz-corpus`.

## Enlaces

- [Hugging Face: isaxtsystems/isaxt-quiz-embeddings-v6](https://huggingface.co/isaxtsystems/isaxt-quiz-embeddings-v6)
- [Modelo base de arquitectura: prajjwal1/bert-tiny](https://huggingface.co/prajjwal1/bert-tiny)
- [Modelo padre de entrenamiento: isaxtsystems/isaxt-quiz-embeddings-v5](https://huggingface.co/isaxtsystems/isaxt-quiz-embeddings-v5)
- [Dataset: isaxtsystems/quiz-corpus](https://huggingface.co/datasets/isaxtsystems/quiz-corpus)
