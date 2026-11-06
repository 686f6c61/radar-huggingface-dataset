# moeshawky/RockAndEgg-313M-v2

## Resumen

RockAndEgg-313M-v2 es un backbone transformer causal "headless" (sin cabeza de modelado de lenguaje) de aproximadamente 313 millones de parametros, derivado de los 10 primeros bloques de Qwen/Qwen3-0.6B-Base. Lo desarrolla el usuario moeshawky y esta disenado exclusivamente como motor de representaciones semanticas para texto en ingles, no como modelo generativo. La salida util es el estado oculto terminal (dimension 1024) al que el consumidor debe conectar su propia cabeza de tarea.

El modelo se entrena con objetivos de representacion sobre cuatro familias de supervisión (inferencia de lenguaje natural, parafrasis, clasificacion tematica y analisis de sentimiento), con un maximo de 128 tokens por secuencia. Su relevancia radica en que ofrece una alternativa compacta y ligera para construir clasificadores downstream mediante linear probing o fine-tuning de cabezas ligeras, con mejoras medibles frente a su version anterior en tareas como STS-B (+0,065 en Spearman) y AG News (+0,118 en exactitud).

No es un modelo de chat ni de instrucciones: cargarlo con AutoModelForCausalLM produce texto degenerado. Debe usarse con AutoModel y una cabeza propia, dentro del contexto de 128 tokens empleado en entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3Model (transformer causal decoder-only, headless, sin LM head) |
| Parametros totales | 312.892.928 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 posiciones maximas en config; entrenado con 128 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en FP32 safetensors) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP32) |
| Capas | 10 |
| Dimension oculta | 1.024 |
| Tamano intermedio | 3.072 |
| Cabezas de atencion | 16 |
| Cabezas KV (GQA) | 8 |
| Vocabulario | 151.936 |
| tie_word_embeddings | true |
| Norma | RMSNorm, eps 1e-6 |
| Activacion | SiLU |
| RoPE theta | 1.000.000 |
| Sliding window | desactivada |
| Modelo base | Qwen/Qwen3-0.6B-Base (revision da87bfb6) |
| Tamano del repo | 1,3 GB |

## Arquitectura y entrenamiento

El modelo es un transformer causal decoder-only truncado: conserva unicamente los bloques 0 a 9 del Qwen3-0.6B-Base original, descartando las capas 10 a 27, la LM head y cualquier cabeza de tarea. La salida util es el estado oculto terminal tras la RMSNorm final (block_09), de dimension 1024. Emplea atencion con GQA (16 cabezas de consulta, 8 de clave/valor), RoPE con theta de 1.000.000 y activacion SiLU. El vocabulario de 151.936 tokens se mantiene del modelo donante y los embeddings estan atados.

El entrenamiento se realizo sobre cuatro familias de supervisión con pesos asimetricos: NLI (0,4), parafrasis (0,2), clasificacion tematica (0,2) y sentimiento (0,2), usando hasta 20.000 filas por tarea (MNLI/SNLI, QQP, AG News y SST-2). Las secuencias se truncan a 128 tokens con padding a longitud maxima y sin tokens especiales. No se documenta uso de RLHF ni DPO; el objetivo es puramente de representacion. La evaluacion se realizo con un protocolo congelado antes de inspeccionar resultados, usando linear probes (regresion logistica y Ridge) sobre caracteristicas congeladas y pooling del ultimo token no-pad.

## Capacidades

- Extraccion de caracteristicas semanticas densas (feature-extraction) de texto en ingles.
- Generacion de embeddings de 1024 dimensiones para frases y pares de frases.
- Soporte nativo para tareas de inferencia de lenguaje natural (NLI) mediante representaciones.
- Soporte para parafrasis y similitud semantica de oraciones.
- Clasificacion tematica de textos (topic classification).
- Analisis de sentimiento binario.
- Base para linear probing y evaluacion de representaciones congeladas.
- No soporta generacion de texto, tool calling, agentes, vision, audio ni modo thinking.
- No soporta razonamiento multi-paso ni conversacion multi-turno.

## Casos de uso

- Clasificacion de sentimiento en resenas: conectar una cabeza logistica al estado oculto terminal y entrenar con SST-2 o datos propios; el modelo alcanza 0,8704 de exactitud en linear probe sobre SST-2, lo que lo hace adecuado para pipelines de moderacion de opiniones en ingles.
- Deteccion de parafrasis en sistemas de duplicados: usar el encoding de pares con separador [SEP] y una cabeza de clasificacion para identificar preguntas equivalentes en foros o bases de conocimiento, con contexto de hasta 128 tokens.
- Clasificacion tematica de noticias y articulos: asignar categorias a titulares o resumenes cortos en ingles; el modelo logra 0,9050 de exactitud en AG News con probe lineal, util para enrutado de contenido editorial.
- Similitud semantica para busqueda: generar embeddings de frases y calcular similitud coseno en indices vectoriales para recuperacion de documentos cortos; el modelo obtiene 0,7322 de Spearman en STS-B, adecuado para ranking de pasajes breves.
- Inferencia de lenguaje natural para validacion de hechos: determinar si una premisa implica o contradice una hipotesis corta en ingles, integrable en pipelines de verificacion documental con pares de hasta 128 tokens.
- Investigacion en representaciones: servir como backbone congelado para experimentos de linear probing y comparacion de arquitecturas, dado su tamano reducido (313M) y su protocolo de evaluacion reproducible.
- Filtrado y deduplicacion de datasets: generar embeddings para agrupar documentos similares y eliminar duplicados en corpus en ingles de frases cortas.

## Benchmarks y rendimiento

Resultados de linear probe sobre caracteristicas congeladas (protocolo congelado, pooling del ultimo token no-pad, dim 1024, max 2.000 filas de entrenamiento y 1.000 de evaluacion por tarea, FP32 en Tesla T4). Baseline: moeshawky/RockAndEgg-313M @ 34361ed7.

| Tarea | Metrica | Baseline | RockAndEgg-313M-v2 | Delta |
|---|---|---|---|---|
| STS-B | Spearman | 0,6672 | 0,7322 | +0,0649 |
| AG News | Exactitud | 0,7870 | 0,9050 | +0,1180 |
| SST-2 | Exactitud | 0,7741 | 0,8704 | +0,0963 |
| MRPC | Exactitud | 0,6985 | 0,6936 | -0,0049 |
| RTE | Exactitud | 0,6606 | 0,6390 | -0,0217 |
| CoLA | Exactitud | no disponible | no disponible | no disponible |

No se han publicado resultados de benchmarks comparativos con modelos de terceros en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 1,3 GB solo para pesos, mas memoria de activaciones; en la practica cabe en cualquier GPU con 4 GB o mas.
- Al ser un backbone de 313M parametros, es viable en GPU consumer: RTX 3060, RTX 4060, RTX 4090, asi como en GPUs de datacenter (T4, A100, H100) sin necesidad de paralelismo.
- Puede ejecutarse en CPU para inferencia por lotes de baja latencia, aunque el throughput sera limitado.
- Opciones de despliegue: transformers con AutoModel (no AutoModelForCausalLM), text-embeddings-inference (etiqueta endpoints_compatible), y exportacion a ONNX si se requiere. No se documenta soporte nativo de GGUF, llama.cpp, Ollama ni vLLM.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.
- Cuantizacion: no se publican pesos cuantizados; al ser FP32, puede convertirse a FP16/BF16 para reducir memoria a aproximadamente 0,6 GB de pesos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RockAndEgg-313M-v2 | 313M | 32.768 (entrenado a 128) | Backbone de representaciones headless | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-0.6B-Base | 596M | 32.768 | Modelo generativo base | Apache 2.0 | Hugging Face |
| moeshawky/RockAndEgg-313M (v1) | 313M | 32.768 (entrenado a 128) | Backbone de representaciones headless | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks frente a alternativas de terceros como sentence-transformers o modelos de embeddings dedicados en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: cargarlo con AutoModelForCausalLM produce texto degenerado; debe usarse con AutoModel.
- Entrenado y validado solo en ingles; no se garantiza comportamiento en otros idiomas.
- El entrenamiento uso secuencias de 128 tokens; contextos superiores requieren reevaluacion.
- Solo cubre cuatro familias de tareas (NLI, parafrasis, topic y sentimiento); su rendimiento fuera de ellas no esta caracterizado.
- Rendimiento inferior al baseline en MRPC (-0,0049) y RTE (-0,0217), por lo que no es uniformemente mejor que la version anterior.
- Riesgo de sesgos heredados de los datasets de entrenamiento (MNLI, SNLI, QQP, AG News, SST-2), no documentados por el autor.
- Riesgo de alucinacion no aplica a generacion, pero las representaciones pueden no capturar matices fuera de la distribucion de entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte.
- Modelo con 0 descargas y 0 likes en el momento de la consulta; madurez y validacion externa limitadas.
- No se publican pesos cuantizados ni artefactos de despliegue listos para produccion.

## Enlaces

- Hugging Face: https://huggingface.co/moeshawky/RockAndEgg-313M-v2
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B-Base
- Version anterior (baseline): https://huggingface.co/moeshawky/RockAndEgg-313M
- Dataset de investigacion: https://huggingface.co/datasets/moeshawky/rae-005-research-evidence
