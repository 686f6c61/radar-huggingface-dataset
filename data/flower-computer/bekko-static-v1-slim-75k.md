# flower-computer/bekko-static-v1-slim-75k

## Resumen

bekko-static-v1-slim-75k es un modelo de embeddings estaticos multilingue desarrollado por flower-computer, derivado por poda de vocabulario de hotchpotch/bekko-static-embedding-v1. No es un transformer: se trata de una tabla de lookup de tokens combinada con mean pooling, que produce vectores de 1024 dimensiones con soporte Matryoshka (32-1024). El modelo conserva 75.000 de los 200.000 tokens WordPiece originales, seleccionados por su utilidad para las 25 lenguas cubiertas por los benchmarks de retrieval multilingue del modelo fuente.

La relevancia de este modelo radica en su eficiencia extrema: al eliminar la componente transformer, la inferencia se reduce a tokenizar, buscar filas en una tabla y promediar. Con 76,8 millones de parametros y un tamano de repo de 0,2 GB, puede ejecutarse en CPU sin GPU y compilarse directamente en binarios Rust mediante el crate `encoders`. Es adecuado para escenarios de retrieval, busqueda semantica y deduplicacion donde el coste por embedding debe ser minimo.

El modelo mantiene el espacio de embeddings del modelo fuente, por lo que es intercambiable en pipelines existentes que usen la variante completa, a cambio de una perdida moderada de calidad (aproximadamente 1-2 puntos de nDCG@10) y un incremento del ~8 % en el numero de tokens generados para el mismo texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Static embedding (token lookup + mean pooling, sin transformer) |
| Parametros totales | 76.800.000 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo estatico sin ventana de atencion) |
| Tipos de cuantizacion | fp16 (tamano de referencia); tablas enteras de 8 y 16 bits via crate `encoders` (`quant-8` / `quant-16`); Matryoshka a 32, 64, 256, 512 y 1024 dimensiones |
| Idiomas soportados | 25: en, ar, bn, de, es, fa, fi, fr, hi, id, it, ja, ko, nl, no, pt, ru, sr, sv, sw, te, th, vi, yo, zh |
| Licencia | MIT |
| Formato de pesos | safetensors (sentence-transformers); tabla embebida en binario Rust via `encoders` |

## Arquitectura y entrenamiento

El modelo es un embedding estatico: cada token del vocabulario tiene asociado un vector de 1024 dimensiones, y el embedding de una frase se obtiene promediando los vectores de sus tokens (mean pooling). No hay capas de atencion ni feed-forward; la "inferencia" consiste en tokenizar con WordPiece, indexar la tabla y promediar. Soporta dimensiones Matryoshka truncando el vector a 32, 64, 256 o 512 dimensiones sin reentrenar.

El vocabulario se podo de 200.000 a 75.000 piezas mediante un criterio de "dano esperado por eliminacion": cada token se ordeno por frecuencia en corpus (WebFAQ-v2 y Wikipedia, peso igual por lengua, ingles x3) multiplicada por la norma de la diferencia entre su vector y la suma de los vectores de las piezas en que se descompone al eliminarlo. El proceso se hizo en rondas (eliminar el 10 % menos util, retokenizar, re-puntuar). Tras la truncacion, las filas supervivientes se ajustaron por autodestilacion: perdida coseno a 1024/256/64 dimensiones contra los embeddings del modelo completo, sobre parrafos de WebFAQ-v2 y Wikipedia, con lr 0.03, 3000 pasos, batch 1024 y Adam disperso solo sobre filas afectadas. Este ajuste mueve la mediana de cada fila ~10 % de su norma y recupera 1-2 puntos de nDCG en vocabularios pequenos. Se conservan siempre los tokens especiales y todas las piezas de un solo caracter presentes en el corpus, de modo que el texto en lenguas cubiertas nunca degenera a `[UNK]`.

## Capacidades

- Generacion de embeddings de frases y parrafos para similitud semantica y retrieval denso.
- Similitud semantica entre textos (pipeline `sentence-similarity`).
- Extraccion de caracteristicas (`feature-extraction`) para clasificacion, clustering y deduplicacion.
- Soporte multilingue en 25 lenguas, incluyendo arabe, bengali, hindi, telugu, thai, japones, coreano y chino.
- Dimensiones Matryoshka: truncamiento a 32, 64, 256 o 512 dimensiones para reducir coste de almacenamiento y busqueda.
- Ejecucion sin GPU: inferencia en CPU pura con coste proporcional al numero de tokens.
- Integracion en binarios Rust sin Python ni descarga en tiempo de ejecucion mediante el crate `encoders`.
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto: es exclusivamente un modelo de embeddings.

## Casos de uso

- Busqueda semantica en produccion de bajo coste: indexar y consultar un corpus multilingue con embeddings de 1024 dimensiones generados en CPU, sin necesidad de GPU ni de servicios externos, gracias a que la inferencia es un lookup y un promedio.
- Deduplicacion de documentos a gran escala: comparar embeddings de millones de registros con producto escalar; el coste por documento es minimo y el modelo cabe en 154 MB en fp16.
- Filtrado previo en pipelines RAG: usar el modelo como primera etapa de retrieval barata sobre un corpus amplio y reservar un reranker o un modelo transformer para la segunda etapa.
- Clasificacion de textos por similitud a prototipos: calcular embeddings de frases de referencia por categoria y asignar etiquetas por vecino mas cercano, sin entrenamiento adicional.
- Aplicaciones embebidas y edge: compilar la tabla en un binario Rust con `encoders` para busqueda semantica offline en dispositivos sin Python ni acceso a red.
- Moderacion y agrupamiento de contenido multilingue: agrupar mensajes o comentarios por similitud semantica en 25 lenguas para detectar duplicados o campanas coordinadas.
- Busqueda en movil o navegador: con dimensiones Matryoshka a 256 o 32, el vector ocupa entre 128 y 4 bytes por dimension, lo que permite almacenar indices en memoria de dispositivos limitados.

## Benchmarks y rendimiento

Resultados de la model card (nDCG@10 x 100 a 1024 dimensiones):

| Modelo | Vocab · tamano fp16 | Lenguas | NanoBEIR-en | MNanoBEIR | NanoMIRACL |
|---|---|---:|---:|---:|---:|
| hotchpotch/bekko-static-embedding-v1 | 200k · 410 MB | 40 | 53,71 | 43,71 | 68,03 |
| este vocabulario, sin recuperacion | 75k · 154 MB | 25 | 52,03 | 41,97 | 64,02 |
| **bekko-static-v1-slim-75k** | 75k · 154 MB | 25 | 52,09 | 42,15 | 64,51 |
| bekko-static-v1-slim-100k | 100k · 205 MB | 25 | 52,91 | 42,98 | 66,53 |
| bekko-static-v1-slim-50k | 50k · 102 MB | 25 | 50,22 | 40,37 | 61,35 |
| bekko-static-v1-slim-32k | 32k · 66 MB | 14 | 49,31 | 39,86 | 49,25 |

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo ocupa 154 MB en fp16 y puede residir en RAM de CPU.
- GPU recomendadas: ninguna necesaria. Cualquier GPU con al menos 1 GB de VRAM puede alojarlo, pero no aporta ventaja frente a CPU.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) y en dispositivos de bajos recursos; en CPU, la latencia depende del numero de tokens y del ancho de banda de memoria.
- Despliegue: sentence-transformers (Python), crate `encoders` (Rust, compilacion estatica en el binario), y cualquier runtime que cargue safetensors y aplique mean pooling.
- Throughput: no se han publicado cifras de latencia o throughput en la informacion disponible. El coste escala con el numero de tokens, y el vocabulario reducido produce ~8 % mas tokens que el modelo fuente para el mismo texto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| bekko-static-v1-slim-75k | 76,8 M | no disponible | MIT | HuggingFace + crate Rust | 25 lenguas, Matryoshka 32-1024 |
| hotchpotch/bekko-static-embedding-v1 | no disponible (tabla 200k x 1024) | no disponible | no disponible en la informacion | HuggingFace | 40 lenguas, mejor calidad (53,71 en NanoBEIR-en) |
| bekko-static-v1-slim-100k | no disponible (tabla 100k x 1024) | no disponible | MIT | HuggingFace | 25 lenguas, 205 MB, mejor equilibrio calidad/tamano |
| bekko-static-v1-slim-50k | no disponible (tabla 50k x 1024) | no disponible | MIT | HuggingFace | 25 lenguas, 102 MB, menor calidad |

## Limitaciones y advertencias

- Solo soporta texto en las 25 lenguas listadas. El texto en otras lenguas se tokeniza a caracteres o `[UNK]`, lo que degrada la calidad del embedding.
- El vocabulario reducido produce ~8 % mas tokens que el modelo fuente para el mismo texto, lo que incrementa el coste de tokenizacion y pooling.
- La calidad de retrieval es inferior a la del modelo fuente: aproximadamente 1,6 puntos menos en NanoBEIR-en y 3,5 puntos menos en NanoMIRACL.
- Al ser un modelo estatico, no captura orden de palabras ni dependencias contextuales mas alla del promedio de vectores; es inadecuado para tareas que requieran comprension sintactica fina.
- Riesgo de alucinacion no aplica (no genera texto), pero la similitud coseno puede producir falsos positivos en textos cortos o con vocabulario fuera de dominio.
- No se han publicado analisis de sesgos en la informacion disponible.
- Licencia MIT: permite uso comercial, modificacion y redistribucion con atribucion; no se identifican restricciones adicionales en la model card.
- La fecha de creacion indicada (2026-11-05) es futura respecto a la fecha actual, lo que sugiere un posible error en los metadatos del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/flower-computer/bekko-static-v1-slim-75k
- Modelo base: https://huggingface.co/hotchpotch/bekko-static-embedding-v1
- Coleccion de la familia slim: https://huggingface.co/collections/flower-computer/bekko-static-v1-slim-6aecc3d4969e7752c8a5074f
- Variante 100k: https://huggingface.co/flower-computer/bekko-static-v1-slim-100k
- Variante 50k: https://huggingface.co/flower-computer/bekko-static-v1-slim-50k
- Variante 32k: https://huggingface.co/flower-computer/bekko-static-v1-slim-32k
- Crate Rust `encoders`: https://crates.io/crates/encoders
- Repositorio del crate: https://github.com/flowercomputers/encoders
