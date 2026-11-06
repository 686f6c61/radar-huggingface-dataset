# MatterWaveAI/grt-30m-embedding

## Resumen

GRT-30M-Embedding es un modelo de embeddings de frases (sentence encoder) desarrollado por MatterWaveAI, obtenido mediante ajuste fino contrastivo del modelo base `MatterWaveAI/grt-30m`. Su proposito es generar representaciones densas de 256 dimensiones para similitud semantica y recuperacion de informacion (dense retrieval), empaquetadas en `sentence-transformers` para uso directo.

La particularidad tecnica es su arquitectura Geometric Rotation Transformer (`GRTModel`), que sustituye las proyecciones lineales densas por cascadas de rotaciones de Givens 2x2 moduladas por contenido sobre SO(D), intercaladas con permutaciones tipo butterfly. El pooling no es el habitual CLS o mean pooling, sino un `circular` pooling que descompone cada par planar (x, y) en direccion unitaria y radio, promedia ambos por separado sobre los tokens no padding y los recombina.

Con 29,84 millones de parametros totales (de los cuales 9,74 M corresponden al backbone no-embedding en 12 bloques) y un contexto maximo entrenado de 512 tokens (hasta 2048 posiciones soportadas), es un modelo muy pequeno orientado a entornos con recursos limitados. Su relevancia actual radica en explorar una alternativa arquitectonica a los transformers convencionales en la tarea de embeddings, con licencia Apache 2.0 y solo idioma ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `GRTModel` (Geometric Rotation Transformer, encoder sin cabeza causal) |
| Parametros totales | 29.844.597 (29,84 M); 29.305.497 sin `lm_head.output_scale` |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens entrenados; soporta hasta 2048 posiciones |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `sentence-transformers` / `transformers`) |
| Dimension de embedding | 256 (128 pares planares, L2-normalizado) |
| `hidden_size` (d_model) | 256 |
| Numero de bloques | 12 |
| Cabezas de atencion | 4 (`head_dim` = 64) |
| `intermediate_size` | 1024 |
| Rotaciones (qkv / mixer / ffn) | 11 / 1 / 21 |
| Vocabulario | 151.669 (BPE de Qwen 3) |
| Pooling | `circular` + normalizacion L2 |
| Modelo base | `MatterWaveAI/grt-30m` |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo es un encoder `GRTModel` de 12 bloques con `d_model` de 256 y 4 cabezas de atencion. En lugar de proyecciones `nn.Linear`, cada estado oculto se representa en coordenadas polares (`phase_angles` y `log_magnitude`) y se transforma mediante rotaciones de Givens 2x2 sobre SO(D), moduladas por contenido, intercaladas con permutaciones butterfly. Los hiperparametros de rotacion son 11 para qkv, 1 para el mixer y 21 para la FFN. El vocabulario emplea el tokenizador BPE de Qwen 3 (151.669 entradas).

El ajuste fino es contrastivo, partiendo del modelo base `grt-30m`, sobre los datasets `sentence-transformers/all-nli` y `sentence-transformers/stsb`. La innovacion principal es el `circular` pooling: como cada estado oculto se estructura en 128 pares planares (x, y), se descompone cada par en direccion unitaria (cos theta, sin theta) y radio r, se promedian direcciones y radios por separado sobre los tokens no padding y se recombinan en un vector de 256 dimensiones que se normaliza L2. No se documenta en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion detallada del dataset ni si se empleo RLHF o DPO (no aplicable a un encoder de embeddings).

## Capacidades

- Generacion de embeddings de frases de 256 dimensiones, L2-normalizados, para similitud semantica y recuperacion densa.
- Similitud textual semantica (STS) mediante coseno entre embeddings.
- Recuperacion de informacion (dense retrieval) sobre corpus en ingles.
- Feature extraction mediante `GRTModel` + pooling circular manual.
- Integracion nativa con `sentence-transformers` (`encode`, `similarity`).
- Compatibilidad con `transformers` (`AutoModel`, `AutoTokenizer`).
- Soporte de `attention_mask` para lotes con padding.
- Capacidades multilingues: no disponibles; solo ingles.
- Tool calling / function calling: no disponible.
- Razonamiento multi-paso o agentes: no disponible (es un encoder, no un modelo generativo).
- Vision, audio o thinking mode: no disponible.

## Casos de uso

- Busqueda semantica en documentacion tecnica en ingles: indexar fragmentos con embeddings de 256 dimensiones y recuperar por similitud coseno; el tamano reducido permite almacenar millones de vectores en memoria.
- Deduplicacion de articulos o tickets de soporte: comparar embeddings de pares de textos y aplicar un umbral de similitud para detectar duplicados, aprovechando el bajo coste computacional del modelo.
- Clasificacion de texto por similitud a prototipos: calcular embeddings de frases etiqueta y asignar la clase mas cercana a cada nuevo texto, util para enrutado de correos o categorizacion de contenido.
- Recomendacion de contenido relacionado: generar embeddings de titulares o descripciones y recuperar los vecinos mas proximos para "articulos relacionados" en un CMS.
- Agrupamiento (clustering) de feedback de usuarios: proyectar resenas o comentarios en el espacio de 256 dimensiones y aplicar k-means para descubrir temas recurrentes.
- RAG ligero en entornos con recursos limitados: usar el modelo como recuperador en pipelines de generacion aumentada donde no sea viable un encoder grande, con contexto de 512 tokens por fragmento.
- Deteccion de similitud en pares de preguntas (FAQ matching): comparar la pregunta del usuario con una base de preguntas frecuentes y devolver la respuesta asociada al embedding mas proximo.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre STS Benchmark (`sentence-transformers/stsb`) con pooling circular y similitud coseno:

| Split | Metrica | GRT-30M base | GRT-30M-Embedding | Delta |
|---|---|---:|---:|---:|
| STS-B Validacion | Spearman (x100) | 45,51 | 72,89 | +27,38 |
| STS-B Test | Spearman (x100) | 28,49 | 63,17 | +34,67 |
| STS-B Test | Pearson (x100) | 29,81 | 63,72 | +33,91 |

No se han publicado resultados de benchmarks adicionales (MMLU, MTEB, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (29,84 M de parametros), aproximadamente 120 MB en fp16 y menos de 60 MB en int8. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; funciona en CPU sin problemas para lotes pequenos.
- Cabe en GPU consumer: si, en practicamente todas (GTX 1050, RTX 2060, RTX 3060, RTX 4090, etc.).
- Opciones de despliegue: `sentence-transformers` (recomendado), `transformers` con pooling manual, y potencialmente `vLLM` o `TGI` si se empaqueta como encoder (no documentado en la informacion disponible); `llama.cpp`/`Ollama` no se mencionan y requeririan conversion a GGUF (no disponible).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo se espera un throughput alto en GPU moderna, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension embedding | Licencia | Idiomas |
|---|---:|---:|---:|---|---|
| GRT-30M-Embedding | 29,84 M | 512 (hasta 2048) | 256 | Apache 2.0 | en |
| all-MiniLM-L6-v2 | 22,7 M | 256 | 384 | Apache 2.0 | en (multilingue en variante) |
| all-MiniLM-L12-v2 | 33,4 M | 256 | 384 | Apache 2.0 | en (multilingue en variante) |
| bge-small-en-v1.5 | 33 M | 512 | 384 | MIT | en |

Los datos de parametros y contexto de los modelos alternativos corresponden a conocimiento general de la categoria; los resultados de rendimiento comparados no estan disponibles en la informacion proporcionada. La diferencia principal de GRT-30M-Embedding es su arquitectura basada en rotaciones y su pooling circular, frente a los transformers convencionales con mean/CLS pooling de los modelos citados.

## Limitaciones y advertencias

- Solo soporta ingles; no se ha entrenado ni evaluado en otros idiomas.
- Contexto entrenado de 512 tokens, insuficiente para documentos largos sin troceado previo.
- Es un encoder de embeddings, no un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso.
- El rendimiento en STS-B test (Spearman 63,17) es moderado y queda por debajo de encoders pequenos consolidados como all-MiniLM o bge-small en la practica habitual; conviene validar en el dominio concreto antes de produccion.
- No se han publicado resultados en MTEB ni en otros benchmarks de recuperacion; el unico dato es STS-B.
- Riesgo de alucinacion no aplica directamente al no generar texto, pero la similitud semantica puede producir falsos positivos en retrieval.
- Sesgos conocidos: no documentados en la informacion disponible; al entrenarse en all-nli y stsb hereda los sesgos de esos datasets.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los terminos de los datasets de entrenamiento (all-nli, stsb) para usos derivados.
- El modelo se ha publicado muy recientemente (3 de noviembre de 2026) y no tiene descargas ni likes, por lo que carece de validacion externa de la comunidad.
- La implementacion del pooling circular debe replicarse correctamente si se usa `transformers` en lugar de `sentence-transformers`, ya que un pooling distinto degrada la calidad de los embeddings.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MatterWaveAI/grt-30m-embedding
- Modelo base: https://huggingface.co/MatterWaveAI/grt-30m
- Dataset all-nli: https://huggingface.co/datasets/sentence-transformers/all-nli
- Dataset stsb: https://huggingface.co/datasets/sentence-transformers/stsb
- Libreria sentence-transformers: https://www.sbert.net/
- Paper o blog del autor: no disponible
- Repositorio de codigo: no disponible
- Demo: no disponible
