# Myric/Laguna-XS-2.1-APEX-GGUF

## Resumen

Myric/Laguna-XS-2.1-APEX-GGUF es un repositorio de cuantizaciones GGUF de la comunidad sobre el modelo poolside/Laguna-XS-2.1, un transformer MoE de 40 capas con 256 expertos enrutados mas un experto compartido y bloques de atencion y densos alternados. El modelo original tiene 33.442.617.088 parametros (unos 33,4 mil millones) y ocupa 62,35 GiB en BF16. Este repositorio no es un modelo nuevo: es un trabajo de cuantizacion con asignacion de bits por rol y por banda de profundidad (receta APEX, desarrollada por LocalAI) sobre el motor llama.cpp, con licencia Apache 2.0.

La aportacion principal es el esquema dynamic-APEX, que agrupa los expertos enrutados en bandas de profundidad (borde, cercana y media), asignando mas precision a las capas de borde (las primeras y ultimas, habitualmente las mas criticas) y menos a las centrales. Se publican tres variantes: i-quality (19,18 GiB, 4,59 bits por peso, recomendada), APEX-dynamic (11,25 GiB, aproximadamente 2,87 bits por peso, orientada a tarjetas de 16 GB) y una IQ3_XXS estandar (12,06 GiB) que se incluye como referencia de comparacion. El autor documenta honestamente que APEX-dynamic no gana en perplejidad a la IQ3_XXS estandar, sino que acierta al ajustarse a un presupuesto de VRAM concreto.

Es relevante ahora porque permite ejecutar un MoE de 33B con ventana de contexto muy larga (el benchmark del autor se ejecuta con 262.144 tokens de contexto) en hardware de consumo y en equipos tipo DGX Spark, con una perdida de calidad medida de tan solo el 0,97 % en perplejidad para la variante i-quality. El repositorio incluye la matriz de calibracion (imatrix) usada para todas las variantes y resultados de un benchmark agentico real de 42 tareas con el bucle de OpenCode 2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con 40 capas, 256 expertos enrutados mas un experto compartido, bloques de atencion y densos alternados |
| Parametros totales | 33.442.617.088 (33,4 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no confirmada en la informacion disponible; el benchmark del autor se ejecuta con ctx 262144 (256K) |
| Tipos de cuantizacion | Q6_K, Q4_K, Q3_K, IQ3_XXS, IQ2_XXS; los 48 coeficientes attn_gate se mantienen en F32 en las versiones -v2 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); se incluye ademas el fichero de calibracion laguna-xs.imatrix |

## Arquitectura y entrenamiento

El modelo base es poolside/Laguna-XS-2.1, un MoE de 40 capas con 256 expertos enrutados y un experto compartido, con atencion alternada con bloques densos. En BF16 el modelo completo pesa 62,35 GiB (16,01 bits por peso efectivos) y la suma real de parametros en safetensors es de 33.442.617.088. El autor de la cuantizacion verifica que se trata de un modelo instruct/chat genuino, con plantilla de chat funcional que incluye un canal de razonamiento `<think>`, comprobado mediante una completion real y no solo a partir de los metadatos.

La innovacion tecnica de este repositorio es la receta APEX (dynamic, role/band-aware bit allocation), implementada en `dynamic_apex.py` del proyecto apex-quant de LocalAI. Los expertos enrutados se agrupan en bandas de profundidad (borde, cercana y media) y se les asigna precision decreciente hacia el centro: en i-quality los expertos de borde van a Q6_K, los cercanos a Q4_K y los centrales a Q3_K; en APEX-dynamic el borde va a Q3_K, los cercanos a IQ3_XXS y los centrales a IQ2_XXS. Las tensores de atencion, experto compartido y router se mantienen en precision fija alta (Q6_K–Q8_0) en ambas variantes. La calibracion usa una unica imatrix (`laguna-xs.imatrix`) generada con `llama-imatrix` sobre un corpus local diverso con peso alto de codigo, empleada de forma identica en todas las cuantizaciones para que la unica variable sea la asignacion de bits. Las versiones -v2 mantienen los 48 coeficientes attn_gate en F32 en lugar del tipo de la banda de atencion, porque parametrizan una no linealidad que multiplica el camino de estado y su cuantizacion permitiria acumular error a lo largo de la secuencia; el coste es de unos 31 MB.

No se documenta en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo original de Poolside.

## Capacidades

- Generacion de texto conversacional con plantilla de chat propia y canal de razonamiento `<think>`.
- Generacion de codigo, con evidencia especifica de tareas agenticas de programacion (insercion y borrado en arboles B, entre otras) en un harness real.
- Razonamiento multi-paso dentro de un bucle agentico: el benchmark OpenCode 2 ejecuta tareas completas con edicion de ficheros y validacion con pytest.
- Ejecucion de tareas de agente de larga duracion, con capacidades de hasta 32.768 tokens de salida configuradas en el benchmark y contexto de 262.144 tokens.
- Soporte de tool calling y function calling: no confirmado explicitamente en la informacion disponible, aunque el uso dentro del bucle agentico de OpenCode 2 lo hace probable.
- Capacidades multilingues: no disponible.
- Capacidades de vision o audio: no disponibles; el pipeline declarado es text-generation.

## Casos de uso

- Asistente de programacion en local: la variante i-quality (19,18 GiB) permite mantener un agente de codigo con calidad cercana al BF16 (solo un 0,97 % peor en perplejidad sobre wikitext) en una estacion de trabajo con GPU de 24 a 48 GB, sin enviar codigo propietario a servicios externos.
- Agente autonomo de refactorizacion en equipos de 16 GB: la variante APEX-dynamic (11,25 GiB) esta disenada explicitamente para ese presupuesto de VRAM y paso 42 de 42 tareas en el benchmark del autor en su version i-quality; con APEX-dynamic se recomienda fijar un limite de tiempo o de tokens porque puede entrar en bucles en tareas largas.
- Analisis de repositorios completos: la ventana de contexto de 262.144 tokens usada en el benchmark permite procesar arboles de codigo extensos, ficheros de configuracion y documentacion en una sola pasada, sin trocear el contexto.
- Generacion de pruebas automatizadas: el propio benchmark del autor evalua las tareas con pytest, de modo que el modelo encaja en flujos donde se genera codigo y se valida con una suite de tests dentro del mismo bucle.
- Despliegue en estaciones compactas tipo DGX Spark (GB10): el autor ejecuta el benchmark completo en ese hardware con llama.cpp, lo que confirma su viabilidad en equipos de sobremesa con memoria unificada.
- Investigacion sobre cuantizacion consciente de la estructura: el repositorio incluye la imatrix, las tres asignaciones de bits y sus perplejidades, por lo que sirve como material reproducible para estudiar el compromiso tamano/calidad en MoE.
- Servicio de chat con razonamiento explicito: el canal `<think>` permite exponer o auditar la traza de razonamiento en aplicaciones donde se requiere trazabilidad, como asistencia tecnica interna.
- Procesamiento por lotes en servidor: con llama.cpp o backends compatibles se puede servir la variante i-quality en una GPU profesional para tareas por lotes de generacion de codigo y revision estatica.

## Benchmarks y rendimiento

Perplejidad sobre wikitext, medida con 100 fragmentos de 512 tokens, segun el autor:

| Variante | Precision | Tamano | Bits por peso | PPL | Delta vs BF16 |
|---|---|---|---|---|---|
| bf16 (referencia) | completa | 62,35 GiB | 16,01 | 13,9091 | — |
| i-quality | Q6_K/Q4_K/Q3_K por rol y banda | 19,18 GiB | 4,59 | 14,0440 | +0,97 % |
| APEX-dynamic | Q3_K/IQ3_XXS/IQ2_XXS por rol y banda | 11,25 GiB | ~2,87 | 15,7621 | +13,3 % |
| IQ3_XXS (estandar, guiada por imatrix) | uniforme | 12,06 GiB | ~3,06 | 15,5641 | +11,9 % |

Benchmark agentico con OpenCode 2 (42 tareas, dos ejecuciones por variante, ficheros -v2, harness `bench/` de quantkit, corregido con pytest, en DGX Spark GB10 con llama.cpp 6d0549831, temperatura 1.0, top-k 20, top-p 0.95, ctx 262144, limite de salida 32768):

| Variante | Ejecucion | Tareas superadas | Ejecuciones con bucle | Tokens de salida en las 41 tareas comunes |
|---|---|---|---|---|
| i-quality-v2 | 1 | 42/42 | 1 | 169,8k |
| i-quality-v2 | 2 | 42/42 | 2 | 265,8k |
| APEX-dynamic-v2 | 1 | 41/42 | 2 | 204,5k |
| APEX-dynamic-v2 | 2 | 41/42 | 4 | 276,4k |

Observaciones del autor: i-quality-v2 supero todas las tareas en ambas ejecuciones; APEX-dynamic-v2 fallo la misma tarea (`btree_insert_delete`) en las dos, entrando en bucle hasta el limite de una hora con unos 100k tokens cada vez, mientras que i-quality-v2 la resolvio con 5,7k y 38k tokens. En tokens totales sobre las tareas compartidas, i-quality-v2 es aproximadamente un 9 % mas eficiente, diferencia que queda dentro de la dispersion entre ejecuciones.

## Requisitos de hardware

- VRAM estimada para inferencia (a partir del tamano de fichero, sin contar cache KV): i-quality ~19,2 GiB; IQ3_XXS ~12,1 GiB; APEX-dynamic ~11,3 GiB.
- La cache KV para contexto largo es el factor dominante: el benchmark usa 262.144 tokens de contexto, por lo que en produccion conviene dimensionar memoria adicional o reducir el contexto efectivo.
- GPU recomendadas: para i-quality, A100 40 GB, L40S 48 GB o H100; para APEX-dynamic y IQ3_XXS, tarjetas de 16 GB o mas.
- Caber en GPU de consumo: APEX-dynamic (11,25 GiB) e IQ3_XXS (12,06 GiB) entran en RTX 4080, RTX 4090, RTX 5080 y similares de 16 GB o mas, con contexto limitado. i-quality requiere 24 GB o mas, por lo que encaja en RTX 3090, RTX 4090 o RTX 5090 con contexto reducido.
- Hardware validado: DGX Spark (GB10) con llama.cpp en la revision 6d0549831, empleado por el autor para el benchmark completo.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama, y cualquier servidor compatible con GGUF (el repositorio esta etiquetado como `endpoints_compatible`). vLLM y TGI no estan confirmados para estos ficheros en la informacion disponible.
- Latencia y throughput: no disponibles. El unico dato indirecto es el consumo de tokens del benchmark: entre 169,8k y 276,4k tokens de salida para resolver 41 tareas, con tareas frontera que oscilan entre 28k y 82k tokens en una sola ejecucion.

## Comparativa con modelos similares

No se dispone de datos de otros modelos comparables en la informacion proporcionada. La comparacion interna entre las variantes de este repositorio, con datos del autor, es la siguiente:

| Variante | Tamano | Bits por peso | PPL (wikitext) | Tareas agenticas | Uso recomendado |
|---|---|---|---|---|---|
| bf16 original (poolside/Laguna-XS-2.1) | 62,35 GiB | 16,01 | 13,9091 | no medida | Referencia de calidad maxima |
| i-quality (-v2) | 19,18 GiB | 4,59 | 14,0440 | 42/42 en ambas ejecuciones | Opcion por defecto si no hay limite de 16 GB |
| APEX-dynamic (-v2) | 11,25 GiB | ~2,87 | 15,7621 | 41/42 en ambas ejecuciones | Presupuesto estricto de 16 GB |
| IQ3_XXS estandar | 12,06 GiB | ~3,06 | 15,5641 | no medida | Solo como referencia de comparacion |

## Limitaciones y advertencias

- Cuantizacion no oficial de la comunidad: el autor declara explicitamente que no esta afiliado a Poolside ni respaldado por la compania.
- Perdida de calidad medible: i-quality queda un 0,97 % por encima de la perplejidad de BF16 y APEX-dynamic un 13,3 %.
- APEX-dynamic no supera a una cuantizacion IQ3_XXS bien ajustada en perplejidad (15,7621 frente a 15,5641) pese a ser mas pequena; el valor de esa variante es ajustarse a un presupuesto de VRAM, no una ganancia de calidad.
- Tendencia a bucles en tareas agenticas largas con APEX-dynamic: fallo `btree_insert_delete` en ambas ejecuciones superando el limite de una hora. Se recomienda fijar limites de tiempo o de tokens en produccion.
- La diferencia del 9 % en tokens de salida entre variantes queda dentro de la variacion entre ejecuciones (el autor solo realizo dos ejecuciones por variante), por lo que no debe interpretarse como una ventaja estable.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero inherente a un modelo generativo de este tipo.
- Idiomas soportados, sesgos conocidos y comportamiento fuera del dominio de codigo: no disponibles.
- Los coeficientes attn_gate cuantizados degradan la calidad, motivo por el cual las versiones -v2 los mantienen en F32; usar las versiones v1 puede empeorar el comportamiento en secuencias largas.
- Licencia Apache 2.0 en el modelo base y en la cuantizacion, segun los metadatos; conviene verificar la model card de poolside/Laguna-XS-2.1 para condiciones adicionales.
- La fecha de creacion del repositorio (2026-08-03) y el gran tamano del mismo (88,7 GB) implican una descarga considerable de ancho de banda y almacenamiento para obtener las tres variantes.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Myric/Laguna-XS-2.1-APEX-GGUF
- Modelo base: https://huggingface.co/poolside/Laguna-XS-2.1
- Receta y toolkit APEX: https://github.com/localai-org/apex-quant
- Motor de cuantizacion llama.cpp: https://github.com/ggml-org/llama.cpp
- Papers, blogs o demos adicionales: no disponible (la busqueda web no devolvio resultados relevantes para este modelo).
