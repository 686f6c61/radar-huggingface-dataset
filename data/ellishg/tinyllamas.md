# ellishg/tinyllamas

## Resumen
tinyllamas es un repositorio de modelos de lenguaje de escala minima entrenados por ellishg con el framework llama2.c (la implementacion didactica de Karpathy para entrenar y ejecutar Llama 2 en C puro). El repositorio contiene dos variantes entrenadas sobre el corpus TinyStories: `stories3_5M-v4k` (vocabulario de 4096 tokens, contexto de 256) y `stories3_5M-v32k` (vocabulario de 32000 tokens, contexto de 512). El nombre del autor sugiere un orden de 3,5 millones de parametros, aunque no se publica el recuento oficial.

El objetivo de estos modelos no es competir en capacidad general, sino servir como banco de pruebas reproducible de entrenamiento, tokenizacion y cuantizacion a muy baja escala. TinyStories es un corpus de relatos infantiles sinteticos disenado para estudiar en que punto un modelo pequeno empieza a producir texto coherente; con estos modelos se puede reproducir ese experimento en hardware de consumo.

Su relevancia ahora es practica: el checkpoint `stories3_5M-v32k` alcanzo una perdida de 1,3386 en validacion, y el autor documenta los comandos exactos de entrenamiento y exportacion, incluida una version cuantizada a int8 (Q8_0). Esto lo convierte en un material util para investigacion sobre escalado minimo, tokenizadores a medida y despliegue en CPU, no para aplicaciones de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama 2 (RMSNorm, RoPE, SwiGLU, GQA con `n_kv_heads` < `n_heads`) |
| Parametros totales | no disponible (la nomenclatura del autor indica ~3,5 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 256 tokens (`stories3_5M-v4k`); 512 tokens (`stories3_5M-v32k`) |
| Tipos de cuantizacion | fp32 (exportacion `--version 0`) e int8 Q8_0 (exportacion `--version 2`) |
| Idiomas soportados | no disponible en la model card (el corpus TinyStories es en ingles) |
| Licencia | MIT |
| Formato de pesos | `.bin` en formato propio de llama2.c; checkpoints de entrenamiento `.pt` (PyTorch) |
| Descargas / likes en HuggingFace | 0 / 0 |
| Tamano del repositorio | 0,4 GB (incluye checkpoints de entrenamiento) |
| Fecha de creacion / actualizacion | 2026-09-11 / 2026-09-13 |

## Arquitectura y entrenamiento
Ambas variantes son decodificadores transformer autorregresivos con la misma receta que Llama 2: normalizacion RMSNorm, embeddings rotatorios (RoPE), activacion SwiGLU y atencion con query grouping (GQA), ya que se configuran 8 cabezas de atencion frente a 4 cabezas de clave/valor. La variante `v4k` usa `dim=208`, 6 capas y `max_seq_len=256`; la variante `v32k` usa `dim=256`, 8 capas y `max_seq_len=512`. En ambos casos `multiple_of=4`, `dropout=0.05` y `weight_decay=0.01`. Los embeddings de entrada y la proyeccion de salida se comparten en el formato de exportacion de llama2.c.

El entrenamiento se hizo desde cero sobre TinyStories, descargado y preprocesado con `tinystories.py`, con un tokenizador propio entrenado a medida (SentencePiece) para dos tamanos de vocabulario: 4096 y 32000 tokens. Hiperparametros comunes: `batch_size=16`, `gradient_accumulation_steps=8` (lote efectivo de 128 secuencias), `learning_rate=1e-3`, `beta2=0.99`, `warmup_iters=1000`, `max_iters=100000`, evaluacion cada 100 iteraciones, `compile=False` y entrenamiento sobre backend MPS (Apple Silicon). La variante `v32k` registra una perdida final de 1,3386. No se documenta ningun proceso de ajuste por instrucciones, RLHF, DPO o preferencias; son modelos de preentrenamiento puro sobre un unico dominio.

La innovacion tecnica del conjunto es el propio pipeline: exportacion a un formato binario plano que se ejecuta con los binarios `run` (fp32) y `runq` (int8 Q8_0) de llama2.c, sin dependencias de Python en inferencia, y una cuantizacion int8 integrada en el script `export.py`.

## Capacidades
- Generacion de texto narrativo corto y simple en ingles, del estilo de los relatos infantiles de TinyStories.
- Continuacion de prompt con coherencia local limitada al contexto configurado (256 o 512 tokens).
- Vocabulario cerrado: dos tokenizadores a medida de 4096 y 32000 tokens, elegibles segun el experimento.
- Inferencia en CPU sin dependencias de Python mediante los binarios C de llama2.c.
- Ejecucion en fp32 o int8 Q8_0 con el mismo pipeline de exportacion.
- No dispone de soporte de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de modo thinking, vision, audio ni multimodalidad.
- No hay evidencia de capacidades multilingues; el corpus de entrenamiento es monolingue en ingles.
- No se documentan capacidades de codigo, matematicas o instrucciones (no hay ajuste por instrucciones).

## Casos de uso
- Reproduccion de experimentos de escalado minimo: permite replicar el punto de entrenamiento de TinyStories en el que emergen la gramatica y la coherencia basica, con un coste de computo muy bajo.
- Comparacion de tokenizadores: las dos variantes (4096 y 32000 tokens) permiten medir el efecto del tamano de vocabulario en la perdida y en la calidad del texto generado sobre el mismo corpus.
- Validacion de pipelines de cuantizacion: la exportacion Q8_0 sirve para estudiar la degradacion int8 en modelos de pocos millones de parametros antes de aplicarla a modelos mayores.
- Docencia de arquitecturas transformer: el codigo de entrenamiento y el modelo son lo bastante pequenos para inspeccionar pesos, capas y cabezas en un portatil.
- Inferencia en dispositivos embebidos o sin GPU: los binarios `run`/`runq` de llama2.c permiten ejecutar el modelo en CPU, Raspberry Pi o entornos restringidos donde no se puede instalar PyTorch.
- Pruebas de integracion de formatos binarios propios: util para quien implemente su propio runtime de inferencia y necesite un modelo de referencia diminuto con formato documentado.
- Generacion de texto sintetico de dominio limitado: solo tiene sentido para producir o aumentar relatos infantiles muy simples, nunca para texto factual.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El unico dato cuantitativo aportado por el autor es la perdida de entrenamiento/validacion de la variante de vocabulario grande:

| Variante | Perdida reportada | Vocab | `dim` | Capas | `max_seq_len` |
|---|---|---|---|---|---|
| stories3_5M-v4k | no disponible | 4096 | 208 | 6 | 256 |
| stories3_5M-v32k | 1,3386 | 32000 | 256 | 8 | 512 |

No hay valores de MMLU, HumanEval, GSM8K, HellaSwag ni de ninguna otra evaluacion estandar, y no tendria sentido compararlos con modelos de proposito general.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma oficial. Con un modelo del orden de millones de parametros, los pesos en fp32 ocupan del orden de decenas de megabytes (el repositorio completo, incluyendo checkpoints, ocupa 0,4 GB), por lo que la huella en memoria es trivial en cualquier GPU.
- GPU recomendadas: no se especifica ninguna. Con este tamano, cualquier GPU con unos pocos cientos de MB libres es suficiente; no tiene sentido reservar A100 o H100 para este modelo.
- Cabe en GPU de consumo: si, en cualquier GPU consumer actual e incluso en GPUs integradas; el cuello de botella no es la memoria sino el coste fijo de lanzar kernels si se usa PyTorch.
- CPU: es el entorno natural. El autor entreno en MPS (Apple Silicon) y la inferencia de referencia se hace con los binarios C de llama2.c, que corren en CPU sin dependencias.
- Opciones de despliegue: llama2.c (`./run` para fp32, `./runq` para int8). No hay soporte documentado para vLLM, TGI, Ollama, llama.cpp ni servidores compatibles con GGUF, ya que el formato `.bin` es propio de llama2.c.
- Latencia y throughput: no disponibles. En CPU y con contextos de 256-512 tokens, la generacion es interactiva, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / disponibilidad | Resultados publicados |
|---|---|---|---|---|---|
| ellishg/tinyllamas (v32k) | ~3,5 M (segun nomenclatura) | 512 | MIT | `.bin` de llama2.c, ejecucion en C | solo perdida 1,3386 |
| karpathy/llama2.c (stories15M) | 15 M (segun nomenclatura) | no disponible en esta informacion | MIT (repositorio) | `.bin` de llama2.c | no disponible en esta informacion |
| roneneldan/TinyStories-1M y 3M | 1 M y 3 M | no disponible en esta informacion | no disponible en esta informacion | safetensors PyTorch | no disponible en esta informacion |

La comparacion solo puede ser cualitativa: los tres proyectos comparten el mismo corpus y el mismo objetivo (modelos minimos con texto coherente en ingles), pero no hay cifras homogeneas de rendimiento publicadas en la informacion disponible. La diferencia practica de tinyllamas es que ofrece dos tamanos de vocabulario y una ruta de cuantizacion int8 documentada paso a paso.

## Limitaciones y advertencias
- Modelo preentrenado sin ajuste por instrucciones: no responde a ordenes, no sigue formatos y no mantiene un rol de asistente.
- Entrenado exclusivamente sobre TinyStories (relatos infantiles sinteticos en ingles): el estilo, el vocabulario y el conocimiento del mundo estan severamente acotados y no se transfieren a otros dominios.
- Alta probabilidad de alucinacion factual: no tiene conocimiento verificable y cualquier afirmacion sobre el mundo real es inventada.
- Contexto muy corto (256 y 512 tokens), insuficiente para documentos, conversaciones multi-turno o codigo.
- Sin soporte multilingue documentado; en castellano el comportamiento es impredecible y probablemente degenerado.
- El recuento exacto de parametros no esta publicado; conviene no citar "3,5 M" como dato verificado, sino como nomenclatura del autor.
- El repositorio registra 0 descargas y 0 likes, por lo que no hay validacion externa de los artefactos publicados.
- Formato propietario de llama2.c: no es GGUF ni safetensors estandar (salvo el checkpoint `.pt`), lo que limita su uso directo en ecosistemas como Ollama, vLLM o TGI.
- Licencia MIT: permite uso comercial, pero el modelo no ofrece ninguna utilidad practica en produccion mas alla de experimentacion y docencia.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/ellishg/tinyllamas
- Repositorio de entrenamiento e inferencia del autor: https://github.com/ellishg/llama2.c
- Repositorio original de llama2.c (Karpathy): https://github.com/karpathy/llama2.c
- No se han encontrado en la busqueda web enlaces relevantes al modelo; los resultados devueltos tratan sobre formulacion quimica de esqueletos y no guardan relacion.
