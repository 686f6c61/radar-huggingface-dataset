# ShadeEngine/bytegpt-bpe32k-110M

## Resumen

ByteGPT BPE32K 110M es un modelo de lenguaje de tipo transformer decoder-only desarrollado por ShadeEngine, un autor independiente que publica en Hugging Face. Se trata de la variante basada en tokenizer BPE de un experimento comparativo mas amplio que enfrenta tres enfoques de tokenizacion (bytes puros, BPE y H-Net) bajo un presupuesto de computo identico. El modelo resuelve un problema de investigacion concreto: servir de linea base tokenizada para medir como afecta la representacion de entrada (tokens BPE frente a bytes frente a chunks aprendidos) al rendimiento final con el mismo gasto de FLOPs.

Arquitectonicamente es un transformer estandar de 12 capas, 12 cabezas de atencion y anchura 768, con 110,1 millones de parametros, normalizacion RMSNorm, embeddings posicionales rotatorios (RoPE), activacion SwiGLU y embeddings de entrada y salida atados. Emplea un tokenizer BPE a nivel de byte con vocabulario de 32.768 entradas y una longitud de contexto de 2.048 tokens, lo que equivale aproximadamente a 9.400 bytes de texto.

Su relevancia es fundamentalmente academica y metodologica: no es un modelo pensado para produccion, sino una pieza dentro de un estudio controlado sobre tokenizacion publicado junto al paper H-Net (arXiv:2507.07955) y a la linea de trabajo de Cartesia "From Tokens to Bytes". Los resultados se reportan en bits por byte para permitir comparaciones justas entre modelos con tokenizers distintos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (12 capas, 12 cabezas, anchura 768) |
| Parametros totales | 110.119.680 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens (aprox. 9.400 bytes) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bfloat16; no se documentan variantes GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | Ingles (entrenado sobre FineWeb-Edu; el autor reporta tambien evaluacion en Wikipedia francesa y codigo Python) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`), tokenizer en JSON (`tokenizer_32k.json`), codigo del modelo en `model.py` |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only convencional con 12 capas, 12 cabezas de atencion y dimension oculta de 768, sumando 110,1 millones de parametros. Incorpora RMSNorm, embeddings posicionales rotatorios (RoPE), SwiGLU en las capas feed-forward y atado de embeddings de entrada y salida (los pesos atados se almacenan una sola vez y se reconstruyen al cargar). El tokenizer es un BPE a nivel de byte con vocabulario de 32.768 entradas, entrenado sobre 2 GB del mismo corpus, que promedia 4,60 bytes por token; el token 0 marca el inicio de cada documento.

El entrenamiento se realizo sobre FineWeb-Edu `sample-10BT` tokenizado: 25.000 pasos de 524.288 tokens cada uno, totalizando 13.100 millones de tokens (aproximadamente 60 GB de texto, 1,3 pasadas sobre el corpus) y unos 1,0e19 FLOPs. Se uso AdamW con learning rate pico de 6e-4, 500 pasos de warmup, decaimiento coseno hasta 6e-5, weight decay 0,1, gradient clipping de 1,0 y precision bfloat16, sobre dos RTX 3090 durante aproximadamente un dia. La lista completa de hiperparametros esta en `config.json`. No se documenta RLHF, DPO ni fases de alineacion posteriores.

La innovacion del trabajo no reside en el modelo en si, sino en el diseno experimental: comparar byte, BPE y H-Net con presupuesto de computo identico y evaluar en bits por byte, una metrica que normaliza por bytes de texto y permite comparar modelos con tokenizers de distinta granularidad.

## Capacidades

- Generacion de texto autoregresiva en ingles, con calidad de texto fluido pero contenido factual frecuentemente incorrecto segun el propio autor.
- Modelado de lenguaje y calculo de perplejidad o loss en bits por byte, util para investigacion sobre tokenizacion.
- Generacion de codigo Python a nivel basico (evaluado en el estudio, con peor resultado que la variante de bytes).
- Manejo de texto con errores tipograficos moderadamente robusto (penalizacion de typo de 1,280 veces la loss limpia).
- Multilingue limitado: aunque entrenado principalmente en ingles, el autor reporta evaluacion en Wikipedia francesa; no hay soporte declarado de otros idiomas.
- No dispone de tool calling, function calling, modo thinking, vision, audio ni capacidades de agente; la model card no menciona ninguna de ellas.

## Casos de uso

- Investigacion sobre tokenizacion: sirve como linea base BPE en experimentos controlados que comparan granularidades de tokenizacion (bytes, BPE, chunks aprendidos) bajo el mismo presupuesto de computo.
- Reproduccion de resultados academicos: permite replicar la tabla de bits por byte del estudio sobre FineWeb-Edu, Wikipedia inglesa y francesa y codigo Python.
- Estudio de robustez ante ruido: util para analizar como afectan los errores tipograficos a la loss en modelos tokenizados frente a modelos de bytes.
- Docencia y divulgacion: modelo pequeno (0,4 GB de repo) que cabe en una sola GPU consumer y permite ilustrar el pipeline completo de entrenamiento e inferencia de un transformer.
- Experimentos de eficiencia de tokenizer: medir el impacto de la tasa de compresion (4,60 bytes/token) en el coste por token frente a alternativas de bytes.
- Pruebas de infraestructura de inferencia: validar scripts de carga con `safetensors`, `tokenizers` y `huggingface_hub` en entornos de investigacion, dado que el modelo se distribuye con su propio `model.py` en lugar de integracion con `transformers`.
- Analisis de sesgos y alucinacion a pequena escala: entorno controlado y barato para estudiar el comportamiento de modelos entrenados solo con texto web educativo.

## Benchmarks y rendimiento

Resultados publicados por el autor, con presupuesto de computo identico (aprox. 1,0e19 FLOPs) y mismos documentos. Menor es mejor en todas las filas excepto HellaSwag.

| Metrica | Byte Transformer (85M) | BPE Transformer 110M (este modelo) | H-Net (100M) |
|---|---:|---:|---:|
| FineWeb-Edu validacion, bits por byte | 1,036 | **0,922** | 0,913 |
| Wikipedia inglesa, bits por byte | 1,118 | **0,988** | 1,034 |
| Wikipedia francesa, bits por byte | 1,944 | **1,836** | 1,865 |
| Codigo Python, bits por byte | 1,329 | **1,382** | 1,521 |
| HellaSwag accuracy (1.000 preguntas, azar 25%) | 35,7% | **38,7%** | 38,8% |
| Penalizacion de typo (loss con 1% typos / loss limpia) | 1,240 | **1,280** | 1,241 |

Cada conjunto de evaluacion consta de 5 MB de texto no visto durante el entrenamiento. El autor advierte que solo hay una ejecucion por modelo y que diferencias de uno o dos puntos porcentuales podrian ser ruido.

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16, los 110,1 millones de parametros ocupan aproximadamente 0,22 GB; con overhead de activaciones y contexto de 2.048 tokens, el uso real se situa en torno a 0,5-1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor entreno con dos RTX 3090, pero para inferencia basta una GPU consumer modesta.
- Cabe holgadamente en GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs de portatil con 4 GB o mas.
- Opciones de despliegue: el repositorio no incluye integracion con `transformers`, `vLLM`, `llama.cpp`, Ollama ni TGI; la carga se realiza con `model.py`, `safetensors` y `tokenizers` segun el ejemplo de la model card. No se documentan pesos GGUF ni adaptaciones a estos frameworks.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Almacenamiento: el repositorio ocupa 0,4 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tokenizer | FineWeb-Edu (bits/byte) | HellaSwag | Licencia |
|---|---:|---|---|---:|---:|---|
| BPE Transformer 110M (este modelo) | 110,1M | 2.048 tokens | BPE 32.768 (4,60 bytes/token) | 0,922 | 38,7% | no disponible |
| Byte Transformer 85M | 85M (aprox., segun nombre) | no disponible | bytes | 1,036 | 35,7% | no disponible |
| H-Net 100M | 100M (aprox., segun nombre) | no disponible | chunks aprendidos (3,7 bytes/chunk) | 0,913 | 38,8% | no disponible |

Los tres modelos pertenecen al mismo autor, comparten corpus y presupuesto de computo, y constituyen la comparacion directa del estudio. No se dispone de comparaciones con modelos externos de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion: el autor indica explicitamente que no debe usarse mas alla del estudio del comportamiento de este tipo de modelos.
- Alucinacion: el texto generado es fluido en ingles pero a menudo factualmente incorrecto.
- Sesgos: no documentados en la model card; al entrenarse sobre FineWeb-Edu, hereda los sesgos del corpus web filtrado por criterios educativos.
- Contexto limitado a 2.048 tokens (aprox. 9.400 bytes), insuficiente para tareas de contexto largo.
- Cobertura idiomatica practicamente limitada al ingles; el frances solo aparece en evaluacion, no como idioma de uso declarado.
- Licencia no disponible: no se puede confirmar si se permite uso comercial; conviene tratar el modelo como no apto para produccion hasta verificar los terminos.
- Sin integracion estandar: requiere cargar el modelo con el `model.py` incluido; no funciona directamente con `AutoModelForCausalLM` de `transformers`.
- Resultados de una sola ejecucion por modelo; el propio autor advierte que diferencias de uno o dos puntos podrian ser ruido estadistico.
- Sin datos publicados de latencia, throughput ni cuantizaciones oficiales.
- El rendimiento en codigo Python es peor que el de la variante de bytes (1,382 frente a 1,329 bits por byte), lo que desaconseja su uso para generacion de codigo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ShadeEngine/bytegpt-bpe32k-110M
- Modelo comparable de bytes: https://huggingface.co/ShadeEngine/bytegpt-byte-85M
- Modelo comparable H-Net: https://huggingface.co/ShadeEngine/bytegpt-hnet-100M
- Dataset de entrenamiento (BPE): https://huggingface.co/datasets/ShadeEngine/fineweb-edu-bpe32k-10BT
- Dataset de entrenamiento (bytes): https://huggingface.co/datasets/ShadeEngine/fineweb-edu-bytes-10BT
- Paper H-Net: https://arxiv.org/abs/2507.07955
- Articulo del autor "Can a model learn its own tokenizer?": https://claude.ai/artifact/AamTLQSJGp6uYueALTKjtm
- Serie de Cartesia "From Tokens to Bytes": https://www.cartesia.ai/blog/from-tokens-to-bytes-part-1
