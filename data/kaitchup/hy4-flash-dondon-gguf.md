# kaitchup/Hy4-flash-dondon-GGUF

## Resumen

Hy4-flash-dondon-GGUF es un conjunto de cuantizaciones de baja precisión en formato GGUF del modelo Hy4-flash de Tencent, publicado por el usuario kaitchup. No se trata de un modelo original, sino de una recolección de ficheros cuantizados de entre 37,8 GB y 64,9 GB de pesos, pensados para ejecutarse con llama.cpp en hardware con recursos limitados. Cada fichero parte de una cuantización GGUF pública (AtomicChat o Xylolabs) o de cuantizaciones propias IQ1_S, IQ1_M e IQ2_XXS, y aplica una variante denominada GSQ-Lite, una versión más barata del método GSQ del IST-DASLab que aprende una escala por fila de salida de cada matriz mediante destilación desde BF16 y la integra en las escalas de bloque GGUF existentes.

El modelo base, tencent/Hy4-flash, es un transformer con arquitectura MoE: 42 bloques decodificadores, de los cuales el bloque 0 tiene una FFN densa y los 41 restantes enrutan cada token a través de 512 expertos. Cuenta con 63.360.615.936 parámetros totales según los safetensors del modelo base. La relevancia de esta publicación radica en que permite ejecutar un modelo de ese tamaño en configuraciones de memoria muy ajustadas, con métricas de fidelidad respecto a BF16 publicadas para cada variante.

La ficha se centra en la información disponible sobre esta publicación GGUF; los datos sobre el modelo original (entrenamiento, idiomas, contexto) no están disponibles en la información proporcionada y se indican como tales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (42 bloques decodificadores; bloque 0 con FFN densa, 41 bloques con 512 expertos por token) |
| Parametros totales | 63.360.615.936 (modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q1_K_S, Q1_K_M, Q2_K_XXS, Q2_K_XS, RCO-Q2_K_XS, Q2_K_M, Q3_K_XXS; tabla Engram en Q4_0, Q8_0 e IQ4_NL |
| Idiomas soportados | no disponible |
| Licencia | tencent-hy-license-1.0 (other) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Hy4-flash es un transformer con mezcla de expertos (MoE). Según la model card de esta publicación, consta de 42 bloques decodificadores: el bloque 0 contiene una FFN densa y los 41 restantes enrutan cada token a través de 512 expertos. El modelo incorpora además una tabla Engram de n-gramas (`per_layer_token_embd`) que llama.cpp lee de forma perezosa desde disco; esta tabla es idéntica para todas las variantes y se publica por separado en tres formatos (Q4_0, Q8_0 e IQ4_NL), de modo que cualquier tabla funciona con cualquier modelo.

La innovación técnica principal de esta publicación no está en el entrenamiento del modelo base, sino en el proceso de cuantización. Los ficheros dondon aplican GSQ-Lite, una variante más económica del método GSQ del IST-DASLab (arXiv:2604.18556): aprende una escala por fila de salida de cada matriz mediante destilación desde BF16 y la pliega en las escalas de bloque GGUF existentes, manteniendo los tipos GGML estándar. La variante RCO-Q2_K_XS aplica además RCO (arXiv:2605.00649), que selecciona para cada grupo de tensores de qué otro fichero dondon tomarlo. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto en formato GGUF compatible con llama.cpp.
- Razonamiento matemático y de opción múltiple: la evaluación held-out incluye dominios de matemáticas, razonamiento de opción múltiple y texto matemático.
- Razonamiento sobre código y código fuente: la evaluación cubre razonamiento de código y código fuente.
- Seguimiento de instrucciones (instruction following).
- Texto web multilingüe y texto web en inglés.
- Razonamiento agéntico y coding agéntico: incluidos como dominios en la evaluación held-out.
- Conversación humana (human chat) y libros.
- Trazas de razonamiento mixtas.
- No se dispone de información sobre soporte de tool calling, function calling, visión, audio ni modo thinking en la información proporcionada.

## Casos de uso

- Despliegue en hardware de consumo con memoria ajustada: la variante Q1_K_S ocupa 37,82 GB de pesos y permite ejecutar un modelo de 63.360 millones de parámetros en configuraciones donde una cuantización de mayor precisión no cabría, a costa de una fidelidad menor (top-10 KL de 0,4439 frente a BF16).
- Servicio de razonamiento matemático en local: la variante Q2_K_M (56,26 GB, top-10 KL 0,1973) ofrece un equilibrio entre tamaño y fidelidad adecuado para tareas de matemáticas y razonamiento de opción múltiple, dominios incluidos en la evaluación held-out.
- Asistencia de código en entornos sin GPU de datacenter: las variantes Q2_K_XS (49,05 GB) y RCO-Q2_K_XS (49,02 GB) mantienen fidelidad razonable en razonamiento de código y coding agéntico, lo que permite integrarlas en flujos de trabajo de desarrollo con llama.cpp.
- Evaluación comparativa de métodos de cuantización: la publicación incluye métricas de top-10 KL y EAR@10 por variante y por tabla Engram, lo que la hace útil como referencia para estudiar el impacto de GSQ-Lite y RCO en un modelo MoE grande.
- Prototipado de agentes multi-paso: el dominio de coding agéntico está presente en la evaluación, de modo que las variantes de mayor precisión (Q2_K_M, Q3_K_XXS) pueden emplearse para probar flujos agénticos antes de escalar a BF16.
- Investigación sobre tablas Engram: al publicarse la tabla en tres formatos intercambiables, se puede medir el efecto de la tabla (Q8_0 es hasta un 2 % mejor que Q4_0 con el doble de tamaño) sobre la calidad final sin cambiar los pesos.

## Benchmarks y rendimiento

La model card publica una evaluación held-out de 64 secuencias de 512 tokens sobre 12 dominios, puntuada con llama.cpp contra BF16 Hy4-flash. Las métricas son top-10 KL (menor es mejor) y EAR@10 (mayor es mejor), además de un test de sanidad con las 10 primeras preguntas de GPQA Diamond.

| Pesos | Etiqueta | Método | Pesos (GB) | Top-10 KL ↓ | EAR@10 (%) ↑ | GPQA Diamond (10 preguntas) |
|---|---|---|---:|---:|---:|---:|
| Q1_K_S | GSQ-Lite | 37,82 | 0,4439 | 77,70 | 9/10 |
| Q1_K_M | GSQ-Lite | 41,17 | 0,3801 | 79,39 | 8/10 |
| Q2_K_XXS | GSQ-Lite | 46,73 | 0,3003 | 82,58 | 10/10 |
| Q2_K_XS | GSQ-Lite | 49,05 | 0,2592 | 83,97 | 9/10 |
| RCO-Q2_K_XS | RCO sobre ficheros GSQ-Lite | 49,02 | 0,2824 | 84,82 | 10/10 |
| Q2_K_M | GSQ-Lite | 56,26 | 0,1973 | 86,28 | 9/10 |
| Q3_K_XXS | GSQ-Lite | 64,88 | 0,1405 | 88,78 | 10/10 |

Comparación con cuantizaciones públicas de Hy4-flash citada en la model card: Q2_K_XS iguala el top-10 KL de IQ2_M de Xylolabs (0,2605) siendo 7,2 GB más pequeño, y Q2_K_M supera a Q2_K de Xylolabs (0,2405) siendo 5,5 GB más pequeño.

Efecto de la tabla Engram sobre el top-10 KL de cada variante:

| Tabla Engram | Tamaño (GB) | Q1_K_S | Q1_K_M | Q2_K_XXS | Q2_K_XS | RCO-Q2_K_XS | Q2_K_M | Q3_K_XXS |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Q8_0 | 67,32 | 0,4436 | 0,3772 | 0,2999 | 0,2573 | 0,2803 | 0,1935 | 0,1405 |
| Q4_0 (por defecto) | 35,64 | 0,4439 | 0,3801 | 0,3003 | 0,2592 | 0,2824 | 0,1973 | 0,1405 |
| IQ4_NL | 35,64 | 0,4445 | 0,3792 | 0,3091 | 0,2599 | 0,2828 | 0,1972 | 0,1425 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para esta publicación en la información disponible; solo se ofrecen las métricas de fidelidad frente a BF16 y el test de sanidad de GPQA Diamond.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 37,82 GB (Q1_K_S) y 64,88 GB (Q3_K_XXS) solo para los pesos, más la tabla Engram (35,64 GB en Q4_0/IQ4_NL o 67,32 GB en Q8_0). La tabla se lee de forma perezosa desde disco, pero conviene contar con espacio en disco y, según configuración, memoria para caché.
- GPU recomendadas: no disponibles en la información proporcionada. Por el tamaño de pesos, las variantes de menor precisión no caben en GPUs de consumo de 24 GB (RTX 4090) sin offloading a CPU o disco; se requiere hardware con 48 GB o más de VRAM para las variantes pequeñas y 80 GB o más para las mayores, o bien ejecución mixta CPU/GPU.
- ¿Cabe en GPU de consumo? No para las variantes publicadas sin offloading; los pesos mínimos (37,82 GB) superan la VRAM de una RTX 4090 (24 GB) y de una RTX 3090 (24 GB).
- Opciones de despliegue: llama.cpp (formato GGUF nativo, con lectura perezosa de la tabla Engram). No se ha confirmado compatibilidad con vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Hy4-flash-dondon-GGUF (esta publicación) | 63.360.615.936 (base) | no disponible | tencent-hy-license-1.0 | GGUF | Cuantizaciones GSQ-Lite y RCO; 37,8–64,9 GB de pesos |
| Hy4-flash GGUF de Xylolabs | 63.360.615.936 (base) | no disponible | tencent-hy-license-1.0 | GGUF | Referencia pública usada en la comparación; IQ2_M con top-10 KL 0,2605 y Q2_K con 0,2405 |
| Hy4-flash GGUF de AtomicChat | 63.360.615.936 (base) | no disponible | tencent-hy-license-1.0 | GGUF | Referencia pública usada como base para algunas variantes dondon |
| tencent/Hy4-flash (BF16) | 63.360.615.936 | no disponible | tencent-hy-license-1.0 | safetensors | Modelo original; referencia de fidelidad en la evaluación held-out |

No se dispone de información sobre otros modelos comparables de distinto autor en la información proporcionada.

## Limitaciones y advertencias

- Las cuantizaciones de 1 y 2 bits introducen degradación medible: top-10 KL de 0,4439 en Q1_K_S frente a 0,1405 en Q3_K_XXS; la variante Q1_K_S es la que más se aleja de BF16.
- La tabla Engram debe descargarse por separado (o como segunda parte del fichero); sin ella el modelo no funciona correctamente. La tabla Q8_0 mejora hasta un 2 % el top-10 KL respecto a Q4_0 pero duplica su tamaño (67,32 GB frente a 35,64 GB).
- RCO-Q2_K_XS tiene mejor EAR@10 que Q2_K_XS (84,82 % frente a 83,97 %) pero peor top-10 KL (0,2824 frente a 0,2592); la elección depende de la métrica objetivo.
- El test de GPQA Diamond se limita a 10 preguntas y se realizó solo como comprobación de sanidad (sin bucles de repetición ni texto corrupto); no es una evaluación de capacidad.
- No se dispone de información sobre sesgos, riesgo de alucinación, idiomas soportados ni longitud de contexto del modelo base en la información proporcionada.
- Licencia tencent-hy-license-1.0: es una licencia "other" del autor del modelo base; deben revisarse sus términos antes de cualquier uso comercial. No se dispone del texto de la licencia en la información proporcionada.
- El autor indica que usar el GSQ original en lugar de GSQ-Lite debería mejorar significativamente los modelos; GSQ-Lite es una aproximación más barata.
- El tamaño del repositorio (484,5 GB) implica requisitos de almacenamiento considerables si se descargan varias variantes y tablas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kaitchup/Hy4-flash-dondon-GGUF
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Cuantización GGUF de AtomicChat: https://huggingface.co/AtomicChat/Hy4-flash-GGUF
- Cuantización GGUF de Xylolabs: https://huggingface.co/Xylolabs/Hy4-flash-GGUF
- Paper GSQ (IST-DASLab): https://arxiv.org/abs/2604.18556
- Paper RCO: https://arxiv.org/abs/2605.00649
- Newsletter del autor: https://kaitchup.substack.com/subscribe
- Apoyo al autor: https://buymeacoffee.com/kaitchup
