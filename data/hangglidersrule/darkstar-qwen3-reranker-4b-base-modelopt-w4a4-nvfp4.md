# HangGlidersRule/Darkstar-Qwen3-Reranker-4B-Base-ModelOpt-W4A4-NVFP4

## Resumen

Darkstar-Qwen3-Reranker-4B-Base-ModelOpt-W4A4-NVFP4 es una cuantizacion NVFP4 del modelo Qwen3-Reranker-4B, publicada por el usuario HangGlidersRule bajo el paraguas del proyecto Darkstar/model-forge. El modelo base, Qwen3-Reranker-4B, es un reranker de Qwen que puntua la relevancia de un par consulta-documento y devuelve una decision binaria (yes/no) a traves de las filas del clasificador en `lm_head`. Esta version concreta aplica cuantizacion W4A4 en FP4 E2M1 a las 108 capas lineales MLP del decodificador, manteniendo atencion, embeddings y normas en BF16.

La relevancia de esta ficha radica en que demuestra una cuantizacion agresiva de 4 bits en pesos y activaciones sobre un reranker, con una perdida de calidad medida y acotada: un delta de nDCG@10 de -0.0024 (intervalo de confianza del 95% entre -0.0120 y +0.0073) frente al checkpoint BF16 original. Ademas, reporta una mejora de throughput de 1.81x en vLLM sobre una RTX PRO 6000 Blackwell, lo que la hace interesante para pipelines de recuperacion aumentada (RAG) con restricciones de VRAM y latencia.

El checkpoint ocupa 4.2 GB en el repositorio y carga como 3.92 GiB en vLLM, frente a 7.56 GiB del BF16. El numero de parametros reportado en safetensors es de 2.676.985.856, aunque el nombre comercial del modelo base hable de "4B". La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con cabeza de clasificacion para ranking; 36 capas |
| Parametros totales | 2.676.985.856 (segun safetensors); el modelo base se comercializa como 4B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | NVFP4 W4A4 (FP4 E2M1 en pesos y activaciones, grupo 16, escalas de bloque FP8 E4M3) en las 108 lineales MLP; atencion, embeddings, lm_head y normas en BF16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (quantization: nvidia-modelopt) |

## Arquitectura y entrenamiento

El modelo base es Qwen3-Reranker-4B, un transformer decoder-only con 36 capas y una cabeza de clasificacion ligada (`embed_tokens` / `lm_head`) que produce las filas `yes` / `no` para puntuar relevancia. Esta version cuantizada no fue reentrenada: es una conversion directa de los pesos BF16 originales (revision `22e683669bc0f0bd69640a1354a6d0aebcfeede5`) mediante NVIDIA ModelOpt 0.48.0rc1, usando la receta de operadores `nvfp4_mlp_only_act_headroom-kv_bf16`.

La cuantizacion aplica FP4 E2M1 a pesos y activaciones de las 108 lineales MLP (`gate_proj`, `up_proj`, `down_proj` en las 36 capas), con escalas de bloque FP8 E4M3 y grupo 16. Las escalas de pesos se obtuvieron con un barrido MSE de escalas FP8; las de activaciones usan calibracion `nvfp4_act_headroom` (percentil ancla 1, percentil superior 99.99, rho 16384), que ancla la escala global de activacion baja y conserva el resto del rango FP8 como margen para activaciones mayores que las vistas en calibracion. La calibracion empleo 512 pares consulta-pasaje de `microsoft/ms_marco` v1.1 (256 relevantes y 256 no relevantes), renderizados con la plantilla del juez del reranker y semilla 1234. La atencion (`q/k/v/o_proj`), los embeddings, `lm_head` y las normas permanecen en BF16, y la cache KV tambien.

El autor reporta que esta fue la mejor de tres variantes: la variante A (MLP W4A4 con calibracion max simple) perdio 0.0099 de nDCG@10; la variante B (MLP y atencion W4A4) perdio 0.0206 y fue rechazada porque su intervalo de confianza excluia el cero; la variante C, este checkpoint, perdio solo 0.0024.

## Capacidades

- Puntuacion de relevancia consulta-documento para reranking en pipelines de recuperacion.
- Clasificacion binaria de relevancia (yes/no) mediante las filas del clasificador.
- Manejo de documentos largos: en la evaluacion no se truncan documentos y el mas largo ronda los 21.000 caracteres.
- Ranking multilingue: no hay datos explicitos de idiomas en la informacion disponible.
- No genera texto libre: su salida es una puntuacion de relevancia, no una respuesta generativa.
- No se documentan capacidades de tool calling, function calling ni agentes multi-paso.
- No se documentan modos de razonamiento extendido (thinking), vision ni audio.

## Casos de uso

- Reranking en pipelines RAG: el modelo reordena los documentos recuperados por un retriever denso o disperso antes de pasarlos al generador, con un coste de VRAM de 3.92 GiB en vLLM que permite compartir GPU con el modelo generador.
- Busqueda empresarial sobre corpus largos: al no truncar documentos y soportar pasajes de hasta unos 21.000 caracteres, es adecuado para indexar contratos, manuales o documentacion tecnica sin fragmentacion agresiva.
- Filtrado de candidatos en sistemas de recomendacion de contenidos: puntua pares consulta-documento con un throughput de 82.8 pares/s a concurrencia 8, suficiente para reordenar cientos de candidatos por peticion en tiempo casi interactivo.
- Evaluacion de calidad de recuperacion: sirve como juez de relevancia en conjuntos de evaluacion tipo MTEB, con una desviacion medida frente a BF16 acotada y conocida.
- Atencion al cliente con base de conocimiento: reordena articulos de ayuda recuperados antes de que un LLM redacte la respuesta, reduciendo el ruido en el contexto enviado al generador.
- Despliegue en GPU consumer o de gama media con FP4: en hardware con tensor cores FP4 (por ejemplo, arquitecturas Blackwell) permite servir el reranker con menos VRAM y mayor throughput que el checkpoint BF16, liberando memoria para otros componentes del pipeline.

## Benchmarks y rendimiento

Evaluacion realizada en una RTX PRO 6000 Blackwell (SM120) con vLLM v0.32.0, frente al checkpoint BF16 servido de la misma forma. El conjunto de evaluacion son seis conjuntos de retrieval de MTEB Nano (NFCorpus, FiQA2018, Touche2020, ArguAna, SciFact, MSMARCO) con revisiones fijadas, 299 consultas, 30 candidatos por consulta y 8.970 pares. Los intervalos de confianza al 95% provienen de un bootstrap pareado por consulta de nDCG@10 con 10.000 remuestreos.

| Metrica | Valor | Base |
|---|---|---|
| nDCG@10 macro (6 conjuntos MTEB Nano) | 0.7095 (BF16 0.7118) | 299 consultas, 8.970 pares, negativos dificiles BM25 |
| Delta vs BF16 | -0.0024 (IC 95% -0.0120 a +0.0073) | bootstrap pareado; no distinguible de cero |
| Delta vs BF16, perfil de servicio publicado | -0.0049 (IC 95% -0.0155 a +0.0057) | mismo conjunto; plantilla `chat_template.jinja` propia |
| Ruido entre ejecuciones BF16 | -0.0008 (IC 95% -0.0041 a +0.0014) | segunda ejecucion BF16 de los mismos pesos |
| Acuerdo de ranking de puntuaciones vs BF16 | Spearman 0.95, solapamiento top-10 0.90 | replica BF16: 0.999 y 0.99 |
| Throughput, 64 pares por peticion, c=8 | 82.8 pares/s (BF16 45.9), 1.81x | pares de unos 1k tokens; mediana de 3 ejecuciones tras calentamiento |
| Throughput, perfil de servicio publicado, c=8 | 79.6 pares/s (BF16 45.8), 1.74x | mismo metodo; esa ejecucion compartio GPU con otra carga |
| GPQA Diamond | no medido | no aplicable a un reranker |

nDCG@10 por conjunto, BF16 → este checkpoint: NFCorpus 0.526 → 0.521, FiQA2018 0.771 → 0.761, Touche2020 0.648 → 0.640, ArguAna 0.748 → 0.761, SciFact 0.856 → 0.839, MSMARCO 0.723 → 0.735.

## Requisitos de hardware

- VRAM estimada para inferencia: 3.92 GiB de pesos en vLLM, frente a 7.56 GiB del BF16; la cache KV se mantiene en BF16 y anade memoria segun la longitud de contexto y el tamano de lote.
- GPU recomendadas: RTX PRO 6000 Blackwell (SM120) es la plataforma usada en la evaluacion; se requiere hardware con tensor cores FP4 para aprovechar la cuantizacion.
- GPU consumer: no se confirma compatibilidad con GPUs sin tensor cores FP4; el autor advierte que en GPUs sin FP4 el comportamiento de vLLM no queda cubierto por la informacion disponible.
- Opciones de despliegue: vLLM v0.32.0 es el runtime documentado y probado; el checkpoint esta etiquetado para vLLM.
- Latencia y throughput: 82.8 pares/s a concurrencia 8 con pares de unos 1k tokens (mediana de 3 ejecuciones tras calentamiento); 79.6 pares/s en el perfil de servicio publicado con la GPU compartida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | nDCG@10 (MTEB Nano, 6 conjuntos) | Throughput (c=8) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Darkstar-Qwen3-Reranker-4B-Base-ModelOpt-W4A4-NVFP4 | 2.676.985.856 | no disponible | 0.7095 | 82.8 pares/s | Apache 2.0 | HuggingFace, 20 descargas |
| Qwen/Qwen3-Reranker-4B (BF16, referencia) | no disponible | no disponible | 0.7118 | 45.9 pares/s | Apache 2.0 (segun modelo base) | HuggingFace |
| Variante B (MLP y atencion W4A4, rechazada) | no disponible | no disponible | delta -0.0206 vs BF16 | no disponible | Apache 2.0 | no publicada como checkpoint |
| Otras alternativas de reranking | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada no incluye datos de otros rerankers de la competencia (por ejemplo, BGE Reranker o Cohere Rerank), por lo que la comparativa se limita al modelo base y a las variantes internas del proceso de cuantizacion.

## Limitaciones y advertencias

- El acuerdo de ranking individual es menor que en BF16: Spearman de puntuaciones en torno a 0.95 frente a 0.999, y solapamiento top-10 de 0.90 frente a 0.99. No se debe asumir un orden identico al del modelo original.
- La calidad media se preserva dentro del intervalo de confianza, pero ordenaciones concretas pueden variar; para aplicaciones sensibles al orden exacto conviene validar con el propio conjunto de datos.
- Outliers de activacion: algunas entradas de `down_proj` en el MLP del decodificador presentan activaciones muy grandes (amax 8.380 en la capa 6, frente a una mediana de 30,6). En dos bloques el rango excedio lo que `nvfp4_act_headroom` puede cubrir, por lo que esos bloques recurren al maximo calibrado; entradas muy fuera de la distribucion de calibracion pueden degradar mas que la media medida.
- La calibracion se hizo con 512 pares de MS MARCO; dominios muy distintos (legal, medico, codigo) pueden comportarse peor y no estan cubiertos por la evaluacion.
- El modelo puntua relevancia y no genera texto; no se documentan comportamientos de rechazo ni ediciones de seguridad. No es un modelo de chat ni un generador de respuestas.
- Construido con una version candidata de ModelOpt (0.48.0rc1); la version estable mas reciente en el momento de la publicacion era 0.47.0, lo que introduce un riesgo de reproducibilidad.
- En GPUs sin tensor cores FP4, el comportamiento en vLLM no esta cubierto por la informacion disponible; la evaluacion solo cubre Blackwell SM120.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar los terminos del modelo base Qwen3-Reranker-4B y de las dependencias de ModelOpt.
- No se han publicado datos de sesgos, idiomas soportados ni limites de contexto en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HangGlidersRule/Darkstar-Qwen3-Reranker-4B-Base-ModelOpt-W4A4-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3-Reranker-4B
- Source card: https://github.com/HangGlidersRule/model-forge/blob/main/models/qwen3-reranker-4b/model-card/base-nvfp4.md
- Family record: https://github.com/HangGlidersRule/model-forge/blob/main/models/qwen3-reranker-4b/README.md
- Build recipe: https://github.com/HangGlidersRule/model-forge/blob/main/recipes/qwen3-reranker-4b/darkstar-qwen3-reranker-4b-base-modelopt-w4a4-nvfp4.yaml
- Gate results: https://github.com/HangGlidersRule/model-forge/blob/main/models/qwen3-reranker-4b/results/reranker-gate-summary.json
- Campaign issue: https://github.com/HangGlidersRule/model-forge/issues/14
