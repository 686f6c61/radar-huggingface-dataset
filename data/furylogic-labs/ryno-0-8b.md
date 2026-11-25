# FuryLogic-Labs/Ryno-0.8B

## Resumen

Ryno-0.8B es un modelo de lenguaje de 805,6 millones de parámetros desarrollado por FuryLogic Labs (Dhaka, Bangladesh), construido sobre el tronco de Qwen3.5-0.8B y post-entrenado con tres modificaciones propietarias: DBAttention, SublayerNets y el optimizador MuonClip. Su propuesta central es trasladar el estado clave-valor (K/V) de la atención desde la VRAM a una base de datos externa, de modo que el contexto deja de ser una restricción de memoria de GPU y pasa a ser una restricción de almacenamiento y ancho de banda. El modelo declara 262.144 tokens de contexto nativo y hasta 2.000.000 con DBAttention activado.

La arquitectura no es un transformer estándar: de los 25 bloques del tronco, 18 son gated-DeltaNet (estado recurrente de tamaño constante) y solo 6 son bloques de atención, que son los únicos que necesitan filas K/V en el almacén externo. Esto reduce drásticamente el coste de almacenamiento para contextos largos: 2 millones de tokens ocupan 49,2 GB en fp16 o aproximadamente 17,7 GB en int8, en lugar de los 204 GB que exigiría un cálculo ingenuo sobre los 25 bloques.

El modelo es relevante como experimento de investigación reproducible: publica dos papers con DOI en Zenodo, incluye mediciones de VRAM y throughput, y documenta abiertamente un fallo de diseño en SublayerNets (puentes inertes por inicialización a cero). La licencia es Apache 2.0 y los pesos están en safetensors, aunque la atención con base de datos requiere el runtime propio del autor y no funciona con `model.generate()` estándar de transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: tronco Qwen3.5-0.8B con 18 bloques gated-DeltaNet + 6 bloques de atención, más DBAttention (K/V en base de datos externa) y SublayerNets (sublayers residuales anidados) |
| Parametros totales | 805.563.958 (805,6 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens nativo; hasta 2.000.000 con DBAttention |
| Tipos de cuantizacion | no disponible (pesos publicados en fp16; el autor reporta almacén K/V en int8) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (un único `model.safetensors`, 1,37 GB en fp16, 1013 tensores) |

Otros datos técnicos declarados: dimensión del modelo d=1024, FFN=3584, 8 cabezas de query y 2 de KV, head_dim=256, vocabulario de 248.320 tokens con cabeza atada (tied head), 25 bloques en total. VRAM pico declarada: 1,94 GB en fp16.

## Arquitectura y entrenamiento

El tronco es Qwen3.5-0.8B, un modelo híbrido en el que la mayoría de bloques (18 de 25) son gated-DeltaNet con estado recurrente de tamaño constante y solo 6 son bloques de atención clásica. Sobre ese tronco, FuryLogic Labs introduce DBAttention: el bloque de atención escribe sus filas K/V en una base de datos y las recupera dentro del propio cálculo de atención, sin mantener caché KV en el modelo. Se ofrecen dos políticas de recuperación: `window=None` (toda la historia almacenada de esa capa, atención exacta) y `window=N` (solo los últimos N tokens, para chat en streaming con conversación ilimitada). El autor mide que una base de datos compartida entre todas las capas no ahorra espacio frente a seis almacenes por capa (168,5 MB para 40.000 filas en ambos casos).

SublayerNets sustituye la actualización lineal de cada bloque por una pila de sublayers residuales anidados; con profundidad 2 añade 811.000 parámetros y un cambio de pérdida medido del 0,97 % entre profundidad 1 y 2. El puente es `tanh(bg) · (x·W_b)·W_u`. El autor advierte de que con `bg = 0` el puente queda muerto por construcción (gradiente nulo), y que los pesos publicados son anteriores a la corrección, por lo que los puentes de sublayer están inertes, no dañinos. El entrenamiento emplea MuonClip (Muon combinado con QK-Clip para estabilidad de los logits de atención), sin Adam en ningún parámetro matricial. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición del dataset, ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional en inglés (`pipeline_tag: text-generation`, etiqueta `conversational`).
- Razonamiento: el modelo incluye la etiqueta `reasoning` y hereda el tronco Qwen3.5.
- Contexto largo: hasta 262.144 tokens nativos y 2.000.000 con DBAttention, con atención exacta o ventana acotada.
- Memoria persistente entre peticiones y sesiones: una fila K/V almacenada es reutilizable entre requests.
- Extracción de características (`feature-extraction` entre las etiquetas del repositorio).
- Inferencia con caché KV externalizada, lo que permite contextos que no caben en VRAM.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión ni audio en la información disponible.
- Capacidad multilingüe limitada al inglés según el campo `language`.

## Casos de uso

- Conversaciones de chat de duración ilimitada: con `window=N` (por ejemplo 4096) el conjunto de trabajo se mantiene acotado y la VRAM se estabiliza en torno a 1,58 GB, lo que permite sesiones que crecen sin techo práctico de memoria.
- Análisis de documentos muy largos: con `window=None` y DBAttention se puede hacer atención exacta sobre historiales de cientos de miles de tokens, útil para resumir o consultar corpus extensos en una sola pasada.
- Inferencia en hardware de gama baja: la VRAM pico declarada de 1,94 GB en fp16 y 1,68 GB a 4.096 tokens con DBAttention lo sitúan al alcance de GPUs consumer modestas o incluso de un dispositivo de 8 GB compartido con el almacén.
- Servicio multi-sesión con memoria compartida: al residir las filas K/V en una base de datos, varios procesos pueden apuntar al mismo almacén y reutilizar contexto precalculado, lo que reduce el coste de prefill en peticiones repetidas.
- Investigación sobre atención externalizada: el modelo es una base reproducible para experimentar con políticas de ventana, cuantización del almacén (int8) y esquemas de claves `(session, layer, block)`.
- Procesamiento por lotes de textos largos en pipelines de bajo presupuesto: con throughput de prefill medido entre 3.000 y 3.500 tokens/s en una GPU de 8 GB, es viable indexar o clasificar documentos largos sin clústeres grandes.
- Evaluación de arquitecturas híbridas DeltaNet + atención: sirve como banco de pruebas para comparar el coste de estado recurrente frente al de atención materializada.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados):

| Benchmark | Métrica | Valor |
|---|---|---|
| Ryno novel MCQ (80 items, split test, `furylogic/novel-mcq`) | accuracy | 78,8 |

Mediciones de VRAM, almacén y throughput declaradas por el autor (pesos RynoSor-0.8B, un dispositivo de 8 GB, filas int8, chunk 256):

| Tokens | VRAM con KV residente | VRAM con DBAttention | Almacén | Argmax vs nativo | Prefill tok/s |
|---|---|---|---|---|---|
| 512 | 1,61 GB | 1,56 GB | 3,5 MB | idéntico | 1.313 → 3.012 |
| 4.096 | 3,04 GB | 1,68 GB | 27,2 MB | idéntico | 3.251 → 3.057 |
| 4.096, `window=1024` | — | 1,58 GB | 27,2 MB | idéntico | 3.471 |
| 8.192 | OOM | 1,61 GB | 54,1 MB | sin referencia | 3.457 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar.

## Requisitos de hardware

- VRAM estimada: 1,94 GB en fp16 para el modelo; con DBAttention, entre 1,56 y 1,68 GB según longitud de contexto y ventana.
- GPU recomendadas: cualquier GPU con al menos 8 GB para el escenario medido por el autor; no se especifican requisitos para A100, H100 o RTX 4090.
- Cabe en GPU consumer: sí, según las mediciones del autor en un dispositivo de 8 GB (RTX 3060/4060, entre otras).
- Almacenamiento: el contexto de 2 millones de tokens requiere 49,2 GB en fp16 o aproximadamente 17,7 GB en int8 en el almacén externo.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (clases `configuration_ryno` y `modeling_ryno`); la atención con base de datos requiere el runtime propio (`model.enable_db_attention(...)` y bucle de decodificación propio). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: prefill medido entre 3.012 y 3.471 tokens/s en el escenario del autor; no se publica throughput de decodificación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Ryno-0.8B | 805,6 M | 262.144 nativo / 2.000.000 con DBAttention | Apache 2.0 | Hugging Face, requiere runtime propio para DBAttention |
| Qwen3.5-0.8B (modelo base) | no disponible en la información | no disponible en la información | no disponible en la información | Hugging Face |
| Alternativas de ~0,8 B con contexto largo | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento de modelos comparables que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Solo soporta inglés según el campo `language` del repositorio; no se documentan otras lenguas.
- El benchmark publicado (78,8 % en un MCQ de novela de 80 ítems) es de autor, no verificado, y sobre un conjunto propio de dominio estrecho; no es extrapolable a capacidades generales.
- Los puentes de SublayerNets de los pesos publicados están inertes por una inicialización a cero (`bg = 0`), según reconoce el propio autor; la mejora de profundidad anunciada no está activa en este checkpoint.
- `model.generate()` estándar de transformers no enruta K/V por el almacén: sin el bucle de decodificación propio, DBAttention no se aprovecha.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; conviene auditar `modeling_ryno.py` antes de usarlo en producción.
- El contexto de 2 millones de tokens exige entre 17,7 y 49,2 GB de almacenamiento externo y depende del ancho de banda de la base de datos, no solo de la GPU.
- Riesgo de alucinación inherente a un modelo de 0,8 B; no se documentan evaluaciones de factualidad ni de sesgos.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validación independiente de la comunidad.
- La licencia Apache 2.0 permite uso comercial, pero no se documentan garantías ni soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FuryLogic-Labs/Ryno-0.8B
- Sitio del autor: https://furylogic.com
- Paper DBAttention (DOI): https://doi.org/10.5281/zenodo.24529787
- Paper SublayerNets (DOI): https://doi.org/10.5281/zenodo.24530110
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset de evaluación: `furylogic/novel-mcq` (referenciado en la model card; sin URL directa en la información disponible)
