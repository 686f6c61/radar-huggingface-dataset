# niko0xdev/rlx-jina-v2-small-sdlc

## Resumen

rlx-jina-v2-small-sdlc es un modelo de embeddings bi-encoder de 512 dimensiones, resultado del ajuste fino de jinaai/jina-embeddings-v2-small-en (aproximadamente 33 millones de parametros, licencia Apache-2.0) sobre un corpus orientado a memoria de agentes en el ciclo de vida del desarrollo de software (SDLC). Lo desarrolla el usuario niko0xdev como parte del proyecto rlx, y su proposito es servir como motor de recuperacion semantica para memorias de agentes que operan sobre repositorios, incidencias y trazas de ingenieria. Se distribuye como un paquete ONNX con cuantizacion dinamica INT8 de 39,18 MB, pensado para inferencia offline en Rust mediante FastEmbed.

El modelo resuelve un problema concreto: la recuperacion de fragmentos relevantes en contextos de SDLC (commits, issues, decisiones de arquitectura, trazas de agentes) con calidad suficiente para alimentar sistemas de memoria de agentes. Frente al modelo base, el ajuste fino con MultipleNegativesRankingLoss y negativos duros mejora de forma notable las metricas de recuperacion en un conjunto de prueba privado de 280 consultas repartidas en cuatro familias de repositorios no vistas durante el entrenamiento.

Es relevante ahora porque combina tres piezas poco habituales en un mismo artefacto: un encoder BERT pequeno con ALiBi y contexto de 512 tokens, una exportacion ONNX INT8 verificada por hash y paridad con la version FP32, y latencias de CPU en el rango de milisegundos (P50 de 5,64 ms en Apple M1 Pro). Esto lo hace adecuado para despliegues locales o embebidos donde no hay GPU disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bi-encoder (BERT con ALiBi), backbone jina-embeddings-v2-small-en |
| Parametros totales | ~33 millones (backbone base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (buffer ALiBi recortado a 512) |
| Tipos de cuantizacion | FP32 ONNX (131,84 MB) y dinamica INT8 ONNX (39,18 MB) |
| Idiomas soportados | en, vi (segun model card y tags) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (INT8 y FP32); compatible con sentence-transformers, FastEmbed y text-embeddings-inference |
| Dimension del embedding | 512 |
| Objetivo de entrenamiento | MultipleNegativesRankingLoss (MNRL) con negativos duros en repositorio |
| Dataset de entrenamiento | niko0xdev/rlx-sdlc-memory-pilot |

## Arquitectura y entrenamiento

El modelo parte de jina-embeddings-v2-small-en, un encoder BERT de aproximadamente 33 millones de parametros que incorpora atencion con sesgo lineal ALiBi en lugar de embeddings posicionales absolutos. Sobre esa base se aplico un ajuste fino con la funcion de perdida MultipleNegativesRankingLoss, usando negativos duros generados dentro del propio repositorio de datos. El entrenamiento consistio en 2 epocas, batch de 32, tasa de aprendizaje de 2e-5 y se ejecuto en una Tesla T4 en 14,97 segundos, lo que indica un corpus de ajuste muy reducido.

El dataset niko0xdev/rlx-sdlc-memory-pilot es de naturaleza sintetica y aumentada por plantillas, y la model card declara que no hay fuga de datos entre familias de repositorios ni fuga temporal. La exportacion a ONNX recorta el buffer ALiBi a 512 tokens para reducir el tamano del artefacto, y la cuantizacion dinamica INT8 se verifica mediante SHA-256 en un manifest.json. La paridad entre la version Python FP32 y la version Rust FastEmbed INT8 se comprobo con un minimo de coseno de 0,90512 y una diferencia absoluta maxima de 0,07061, coincidiendo con la salida de ONNX Runtime INT8 en Python hasta cinco decimales.

## Capacidades

- Generacion de embeddings de texto de 512 dimensiones para busqueda semantica y recuperacion densa.
- Recuperacion orientada a memoria de agentes en contextos SDLC: commits, issues, decisiones de arquitectura y trazas.
- Soporte multilingue limitado a ingles y vietnamita, con rendimiento medido en ambas lenguas y en consultas mixtas.
- Ejecucion offline en Rust mediante FastEmbed, integrable en servidores de inferencia y de memoria del proyecto rlx.
- Compatibilidad con text-embeddings-inference y con la libreria sentence-transformers.
- No soporta tool calling, function calling, agentes multi-paso ni modos de razonamiento: es exclusivamente un modelo de extraccion de caracteristicas.
- No dispone de capacidades de vision ni de audio.

## Casos de uso

- Memoria de agentes de codigo: el modelo indexa fragmentos de repositorios y trazas de agentes para que un agente recupere decisiones previas y contexto relevante en cada turno; su contexto de 512 tokens obliga a trocear el contenido, pero la latencia de CPU permite consultas frecuentes sin GPU.
- Busqueda semantica en documentacion interna de ingenieria: permite construir un indice de decisiones de arquitectura (ADR), guias y notas tecnicas y recuperar los pasajes mas cercanos a una consulta en ingles o vietnamita.
- Triaje de incidencias y tickets: al comparar la descripcion de un ticket nuevo con incidencias historicas, facilita la asignacion automatica y la sugerencia de resoluciones previas.
- Recuperacion aumentada en asistentes de revision de codigo: alimenta un pipeline RAG que aporta fragmentos de codigo y comentarios de revisiones anteriores al modelo generador que redacta la revision.
- Despliegue en entornos sin GPU: el paquete INT8 de 39,18 MB y las latencias de P50 5,64 ms y P95 8,60 ms en Apple M1 Pro permiten ejecutarlo en portatiles, contenedores ligeros o dispositivos de borde.
- Deduplicacion y agrupacion de fragmentos de conocimiento: los embeddings permiten detectar memorias duplicadas o muy similares en un almacen de conocimiento de agentes antes de persistirlas.
- Servicio de embeddings compatible con text-embeddings-inference: se puede exponer como endpoint HTTP para que otros componentes del sistema rlx consuman representaciones vectoriales de forma centralizada.

## Benchmarks y rendimiento

Resultados medidos en el conjunto private_test (280 consultas retenidas, cuatro familias de repositorios no vistas):

| Variante | Recall@5 | Recall@20 | NDCG@10 | MRR | NDCG@10 EN | NDCG@10 VI | NDCG@10 mixto |
|---|---:|---:|---:|---:|---:|---:|---:|
| Baseline jina-embeddings-v2-small-en (FP32) | 0,7750 | 0,9357 | 0,4982 | 0,3726 | 0,4958 | 0,4536 | 0,5634 |
| Pilot v1 ajustado (FP32) | 1,0000 | 1,0000 | 0,6188 | 0,4940 | 0,6208 | 0,5781 | 0,6686 |
| Pilot v1 ajustado (ONNX INT8) | 0,9821 | 1,0000 | 0,6169 | 0,4924 | 0,6217 | 0,5959 | 0,6335 |

Ganancias del modelo ajustado frente al baseline en private_test: +20,71 puntos porcentuales en Recall@5, +11,87 puntos en NDCG@10 y +14,23 puntos en NDCG@10 para vietnamita. La cuantizacion INT8 supone una perdida de 0,19 puntos de NDCG@10 respecto a FP32, dentro del umbral de 1 punto fijado por el autor.

Paridad y latencia verificadas offline en Apple M1 Pro:

| Metrica | Valor |
|---|---|
| Similitud coseno minima (Python FP32 vs Rust FastEmbed INT8) | 0,90512 |
| Diferencia absoluta maxima | 0,07061 |
| Latencia de consulta unica P50 | 5,64 ms |
| Latencia de consulta unica P95 | 8,60 ms |

No se han publicado resultados en MTEB, BEIR ni otros benchmarks generales de embeddings en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en FP32 y del orden de 100-200 MB en INT8, incluyendo buffers de activacion para secuencias de 512 tokens.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria; el entrenamiento se realizo en una Tesla T4, y para inferencia son suficientes tarjetas modestas como T4, L4 o RTX 3060.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna; tambien funciona en CPU sin aceleracion dedicada.
- Opciones de despliegue: FastEmbed en Rust (rlx-inference-server y rlx-memory-server), ONNX Runtime, sentence-transformers y text-embeddings-inference.
- Latencia y throughput: P50 de 5,64 ms y P95 de 8,60 ms por consulta en CPU Apple M1 Pro con el paquete INT8; no se han publicado cifras de throughput por lote ni de latencia en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| rlx-jina-v2-small-sdlc | ~33 M | 512 | 512 | Apache-2.0 | ONNX INT8/FP32 | Ajustado para SDLC; metricas solo en private_test propio |
| jinaai/jina-embeddings-v2-small-en | ~33 M | 8192 (segun modelo base; recortado a 512 en este pack) | 512 | Apache-2.0 | safetensors, ONNX | Baseline del ajuste; Recall@5 de 0,7750 en private_test |
| all-MiniLM-L6-v2 | ~22 M | 256 | 384 | Apache-2.0 | safetensors, ONNX | Alternativa ligera generica; sin datos comparativos en la informacion disponible |
| bge-small-en-v1.5 | ~33 M | 512 | 384 | MIT | safetensors, ONNX | Alternativa generica en ingles; sin datos comparativos en la informacion disponible |

La comparacion de rendimiento solo es posible frente al modelo base, porque el autor unicamente publica resultados en su conjunto private_test. No hay datos que permitan comparar con all-MiniLM-L6-v2 ni con bge-small-en-v1.5 en las mismas condiciones.

## Limitaciones y advertencias

- El ajuste fino se realizo sobre un dataset sintetico y aumentado por plantillas; la propia model card recomienda escalar a entre 20.000 y 500.000 trazas reales auditadas para una version de produccion.
- No se ha verificado la retencion de rendimiento en dominios generales mediante MTEB o BEIR, por lo que el modelo puede degradarse fuera del dominio SDLC.
- La longitud maxima de secuencia esta fijada en 512 tokens por el recorte del buffer ALiBi; textos mas largos deben trocearse.
- El soporte multilingue se limita a ingles y vietnamita; no hay evidencia de comportamiento en castellano ni en otras lenguas.
- La cuantizacion INT8 introduce una perdida medible de calidad (0,19 puntos de NDCG@10 frente a FP32) y una diferencia absoluta maxima de 0,07061 en los embeddings respecto a la version FP32.
- El modelo tiene cero descargas y cero likes en el momento de la ficha, y la version es un piloto (Pilot v1); no hay evidencia de uso en produccion por terceros.
- Al ser un modelo de embeddings, puede heredar sesgos del corpus sintetico de entrenamiento; no se documentan evaluaciones de sesgo ni de robustez adversarial.
- La licencia Apache-2.0 permite uso comercial, pero la ausencia de validacion fuera del dominio SDLC hace recomendable una evaluacion propia antes de desplegarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/niko0xdev/rlx-jina-v2-small-sdlc
- Dataset de entrenamiento: https://huggingface.co/datasets/niko0xdev/rlx-sdlc-memory-pilot
- Codigo fuente del proyecto rlx: https://github.com/niko0xdev/rlx
- Modelo base: https://huggingface.co/jinaai/jina-embeddings-v2-small-en
