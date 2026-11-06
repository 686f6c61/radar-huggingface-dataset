# alxcspr/stationhouse

## Resumen

Station House es un conjunto de 20 autoencoders dispersos (sparse autoencoders, SAE) de tipo TopK entrenados sobre las activaciones de las capas MLP de marin-32b-base, un modelo de 32.000 millones de parámetros con arquitectura Qwen3-32B (64 capas, SwiGLU). Lo desarrolla alxcspr y se publica bajo licencia Apache-2.0. No es un modelo generativo: es una herramienta de interpretabilidad mecanicista pensada para descomponer las activaciones internas del modelo base en características latentes interpretables.

El artefacto resuelve un problema concreto en el estudio de redes neuronales: dado un vector de activación de dimensión 27.648 (la salida `silu(gate)·up` de una capa MLP), el SAE aprende una representación dispersa de 32.768 latentes con solo k=32 activos por token, lo que permite aislar características monosenánticas y analizar qué representaciones internas se activan ante distintos estímulos. Se trata de la variante "topk" del SAE, que fuerza la dispersión directamente mediante la selección de los k latentes de mayor magnitud en lugar de usar una penalización L1.

El conjunto forma parte del piloto marin-32b-neuron-atlas: se ejecutó un barrido completo de 64 capas, pero este repositorio recoge solo las 20 capas que ya reconstruían bien tras 6.000 pasos de entrenamiento y que por tanto se saltaron la ronda de consolidación posterior. Es relevante para investigadores que quieran hacer ingeniería inversa de las representaciones de un modelo de 32B de escala media sin tener que entrenar sus propios SAE.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | TopK sparse autoencoder (SAE) sobre activaciones MLP de un transformer SwiGLU |
| Parámetros totales | no disponible (20 SAE de 27.648 × 32.768 latentes en bf16 cada uno) |
| Parámetros activos | no disponible (k=32 latentes activos por token en el SAE) |
| Longitud de contexto | no disponible (el modelo base usa secuencia 2048) |
| Tipos de cuantización | no disponible (pesos en bf16) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16) + cfg.json, census.parquet, stats.json, train_log.jsonl |

## Arquitectura y entrenamiento

Cada SAE es un autoencoder de una sola capa con 32.768 latentes, activación TopK con k=32 y precisión bf16, implementado con la librería eai-sparsify 1.3.3 de EleutherAI. La entrada son vectores de activación de dimensión d_in = 27.648, correspondientes a la salida `silu(gate)·up` de la capa MLP, normalizados por la escala por neurona del atlas (`neuron_scale.parquet`). La salida del decoder se renormaliza a norma unitaria en cada paso. El entrenamiento usa AdamW con lr 3e-4 (β 0.9/0.95), pérdida FVU (fraction of variance unexplained) y 6.000 pasos × 1.024 tokens = 6,14 millones de tokens, aproximadamente 0,6 épocas del slice de capa. Cada capa se entrenó como una tarea independiente en una A100-40 (Apocrita).

Las activaciones se capturaron de marin-32b-base en el commit f19b3466 (bf16, secuencia 2048) sobre FineWeb (subconjunto de documentos largos `sample-10BT`, 4.883 documentos y 9.995.501 tokens, filtrado por contenido). Los vectores de entrada son la reconstrucción top-64 del tier disperso del atlas. Las 20 capas incluidas (0-11, 37-41 y 56-58) se seleccionaron porque sus diccionarios de 6.000 pasos ya reconstruían bien (fvu muestreado entre 0,5530 y 0,8961 en un censo de 200.704 tokens) y no requirieron la pasada de consolidación que sí se aplicó al resto del barrido de 64 capas.

## Capacidades

- Descomposición de activaciones MLP de marin-32b-base en 32.768 características latentes por capa, con k=32 activas por token.
- Análisis de monosenanticidad y de activaciones máximas por latente (el censo incluye `max_act` y `fire_frac` por latente).
- Reconstrucción de vectores de activación con FVU medido entre 0,5530 y 0,8961 según capa.
- Cobertura de 20 capas concretas: 0 a 11 (capas tempranas), 37 a 41 (capas medias) y 56 a 58 (capas tardías).
- Inspección de latentes vivos: entre 22.046 y 32.764 latentes activos de 32.768 por capa.
- Integración con el ecosistema eai-sparsify para carga y análisis.
- No soporta generación de texto, tool calling, agentes ni multimodalidad: es un artefacto de interpretabilidad, no un modelo de lenguaje.

## Casos de uso

- Ingeniería inversa de características en capas tempranas: cargar los SAE de las capas 0-11 para identificar las representaciones léxicas y sintácticas que marin-32b-base construye a bajo nivel, usando el censo para localizar latentes con alta frecuencia de activación.
- Análisis de circuitos en capas medias: los SAE de las capas 37-41 permiten estudiar cómo se componen representaciones semánticas de orden superior y trazar relaciones entre latentes y comportamientos del modelo base.
- Detección de características en capas tardías: los SAE de las capas 56-58, con `max_feat_act` muy elevado (hasta 3.680 en la capa 57), sirven para estudiar latentes de alta magnitud asociados a la predicción final del modelo.
- Auditoría de sesgos y seguridad: al descomponer activaciones en latentes interpretables, se pueden buscar características asociadas a conceptos sensibles y cuantificar su frecuencia de activación en el corpus FineWeb.
- Investigación en monosenanticidad: comparar el FVU y el número de latentes vivos entre capas para estudiar la hipótesis de superposición (superposition) y la evolución de la dispersión a lo largo de la profundidad del modelo.
- Reproducibilidad de experimentos de interpretabilidad: los `train_log.jsonl`, `stats.json` y `sha256.txt` permiten auditar el entrenamiento y verificar la integridad de los pesos antes de publicar resultados.
- Desarrollo de métodos de SAE: servir como referencia de configuración TopK (32k latentes, k=32, 6k pasos) para comparar variantes de entrenamiento o de arquitectura de SAE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas internas de reconstrucción y censo por capa:

| Capa | fvu_sampled | Latentes vivos (de 32.768) | max_feat_act |
|---|---|---|---|
| 0 | 0,7317 | 24.457 | 7,66 |
| 1 | 0,6488 | 22.046 | 19,88 |
| 2 | 0,7604 | 28.508 | 109,5 |
| 3 | 0,7676 | 25.597 | 16,75 |
| 4 | 0,7629 | 24.806 | 24,25 |
| 5 | 0,8040 | 24.159 | 17,75 |
| 6 | 0,8436 | 28.397 | 27,88 |
| 7 | 0,8562 | 25.562 | 27,00 |
| 8 | 0,8676 | 25.310 | 26,25 |
| 9 | 0,8748 | 26.306 | 44,00 |
| 10 | 0,8791 | 27.398 | 36,00 |
| 11 | 0,8926 | 29.312 | 41,50 |
| 37 | 0,8931 | 32.538 | 338,0 |
| 38 | 0,8961 | 32.764 | 362,0 |
| 39 | 0,8611 | 26.691 | 724,0 |
| 40 | 0,8867 | 26.543 | 552,0 |
| 41 | 0,8880 | 29.314 | 388,0 |
| 56 | 0,8946 | 32.392 | 1.304,0 |
| 57 | 0,5530 | 31.027 | 3.680,0 |
| 58 | 0,8720 | 31.552 | 2.304,0 |

## Requisitos de hardware

- Espacio en disco: el repositorio ocupa 72,5 GB en total, distribuido entre los 20 SAE en bf16 más los ficheros de censo, estadísticas y logs.
- VRAM estimada para inferencia: cada SAE individual tiene una matriz de 27.648 × 32.768 en bf16 (aproximadamente 1,8 GB por capa); cargar una sola capa requiere unos 2-3 GB de VRAM, mientras que cargar las 20 simultáneamente supera los 36 GB.
- GPU recomendadas: una A100-40 o H100 para trabajar con varias capas a la vez; una RTX 4090 (24 GB) permite cargar varias capas individuales pero no el conjunto completo.
- Cabe en GPU de consumo: sí, capa a capa, en tarjetas con 8 GB o más (por ejemplo RTX 3060/4060 para una sola capa). El conjunto completo no cabe en GPU de consumo.
- Opciones de despliegue: la carga se realiza con eai-sparsify (`Sae.load_from_disk("sae-32k/layer=NN/sae_LNN_final")`); no se documentan opciones para vLLM, llama.cpp, Ollama o TGI porque no es un modelo generativo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Base | Latentes | k | Capas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Station House (este) | marin-32b-base | 32.768 | 32 | 20 | Apache-2.0 | Hugging Face |
| SAE de Qwen3-32B (genéricos) | Qwen3-32B | no disponible | no disponible | no disponible | no disponible | no disponible |
| SAE de Llama-3.1-8B (EleutherAI) | Llama-3.1-8B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificables sobre SAE comparables de la misma escala en la información proporcionada, por lo que la comparativa cuantitativa se marca como no disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni responde a prompts; cualquier uso como modelo generativo es un error de categoría.
- Cobertura parcial: solo incluye 20 de las 64 capas del modelo base, y precisamente las que se saltaron la ronda de consolidación, por lo que no representan el barrido completo.
- FVU relativamente alto en varias capas (hasta 0,8961 en la capa 38), lo que indica que una fracción considerable de la varianza de las activaciones no se explica por los latentes.
- Entrenado solo con inglés (FineWeb) y sobre un subconjunto de 9.995.501 tokens, lo que limita la generalización a otros dominios e idiomas.
- El SAE está acoplado a una versión concreta de marin-32b-base (commit f19b3466) y a la normalización por neurona del atlas; usar pesos de otra versión del modelo invalida los resultados.
- Riesgo de interpretaciones espurias: los latentes pueden correlacionar con conceptos sin ser causalmente relevantes; se recomienda validación con intervenciones (ablación, steering) antes de extraer conclusiones.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base marin-32b-base y el atlas tienen sus propias condiciones que deben verificarse por separado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni resultados de terceros que confirmen la calidad de los latentes.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/alxcspr/stationhouse
- Modelo base: https://huggingface.co/marin-community/marin-32b-base
- Dataset del atlas: https://huggingface.co/datasets/Station-house/marin-32b-neuron-atlas
- Librería eai-sparsify: https://github.com/EleutherAI/sparsify
