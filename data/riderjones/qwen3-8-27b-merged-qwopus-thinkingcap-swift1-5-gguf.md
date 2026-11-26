# RiderJones/Qwen3.8-27b-merged-Qwopus-Thinkingcap-Swift1.5-GGUF

## Resumen

Qwen3.8-27b-merged-Qwopus-Thinkingcap-Swift1.5-GGUF es un conjunto de cuantizaciones GGUF del modelo RiderJones/Qwen3.8-27b-merged-qwopus-thinkingcap-swift1.5, un merge de tres fine-tunes sobre la base Qwen3.8-27B. El autor, RiderJones, publica estas cuantizaciones calibradas con una importance matrix (imatrix) especifica para codigo, preservando las 15 tensores nativos de Multi-Token Prediction (MTP) del bloque `blk.64.nextn.*` para habilitar decodificacion especulativa dentro de llama.cpp sin necesidad de un modelo draft separado.

El objetivo declarado del proyecto es resolver problemas tipicos de las variantes estandar de Qwen3.8-27B: bucles circulares en `<think>`, deriva de coordenadas o logica a mitad de generacion y codigo multi-sistema sin terminar en prompts complejos de un solo disparo. Para ello combina tres variantes entrenadas con metodos de post-entrenamiento ortogonales (destilacion de codigo, RL y poda de cadenas de razonamiento) mediante mergekit con el metodo `dare_ties`.

Con 27.320.697.856 parametros totales y un repositorio de 195,1 GB que cubre desde `IQ3_S` hasta `BF16`, el modelo esta orientado a generacion de codigo, razonamiento estructurado y construccion de aplicaciones de un solo archivo. La licencia es Apache 2.0 y el unico idioma declarado es el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.8-27B) con cabezas nativas de Multi-Token Prediction (MTP) preservadas |
| Parametros totales | 27.320.697.856 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | IQ3_S, Q3_K_M, IQ4_XS, Q4_K_M, Q5_K_M, Q6_K, Q8_0, BF16 |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp), con imatrix calibrada para codigo |
| Metodo de merge | `dare_ties` (mergekit) |
| Calibracion imatrix | 419 chunks, `n_ctx=512`, perplexity BF16 de 3,4195 ± 0,02407 |
| Tamano del repositorio | 195,1 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de 27,3 mil millones de parametros construido sobre Qwen3.8-27B. No se trata de un MoE ni de una arquitectura hibrida SSM: la innovacion principal reside en el merge y en la preservacion de los 15 tensores MTP (`blk.64.nextn.*`), que habilitan decodificacion especulativa nativa en llama.cpp sin modelo draft externo.

El merge combina tres fine-tunes con pesos y densidades explicitos bajo `dare_ties`: Jackrong/Qwopus3.8-27B-Coder-Flash al 60% de peso y 75% de densidad (aporta planificacion arquitectonica, fisica 2D y estetica front-end), ukisai/Swift-1.5-Qwen3.8-27b al 25% de peso y 45% de densidad (aporta estabilidad de ejecucion y prevencion de bucles via RL), y bottlecapai/ThinkingCap-Qwen3.8-27B al 15% de peso y 35% de densidad (actua como regularizador contra espirales de razonamiento). La calibracion imatrix se realizo sobre 419 chunks de razonamiento de codigo en formato ChatML, trazas de uso de herramientas y prompts tecnicos. No se dispone de informacion sobre el numero de tokens de entrenamiento de los modelos constituyentes ni sobre el dataset exacto empleado en cada uno.

## Capacidades

- Generacion de codigo de un solo disparo para aplicaciones complejas de un solo archivo, incluyendo juegos con fisica (Choplifter, Space Invaders) y utilidades multi-herramienta.
- Razonamiento estructurado con modo `<think>` explicito, con un consumo de 20-30% mas tokens de pensamiento que fine-tunes fuertemente podados, destinado a planificacion arquitectonica descendente.
- Generacion de interfaces HTML/CSS/JS con acabado visual pulido sin necesidad de prompts de refinamiento estetico.
- Razonamiento espacial y matematico para fisica 2D, sistemas de coordenadas y maquinas de estado.
- Decodificacion especulativa nativa mediante las cabezas MTP preservadas, sin modelo draft separado.
- Prevencion de bucles de auto-correccion y de deriva logica a mitad de generacion gracias al componente RL del merge.
- Soporte de trazas de uso de herramientas presente en la calibracion imatrix, aunque no se documenta formalmente una API de function calling.
- Capacidades multilingues: limitadas al ingles segun los metadatos del modelo.

## Casos de uso

- Generacion de videojuegos de un solo archivo: el modelo completa juegos con fisica de inercia, colisiones, maquinas de estado de rescate y terreno con parallax en una sola pasada, lo que lo hace adecuado para prototipado rapido de juegos 2D en HTML5 canvas o similar.
- Prototipado de interfaces web: genera HTML/CSS/JS con proporcion y estetica limpias sin instrucciones de estilo adicionales, util para equipos que necesitan maquetas funcionales rapidas.
- Asistentes de codificacion en IDE: la preservacion de MTP permite 40-60 t/s en generacion de codigo a `Q8_0`, lo que reduce la latencia percibida en autocompletado y sugerencias multi-linea.
- Razonamiento arquitectonico de sistemas: el componente Qwopus aporta planificacion descendente y conciencia de casos limite, adecuado para descomponer requisitos en modulos y disenar esquemas de datos antes de escribir codigo.
- Despliegue en estaciones de trabajo con GPU de consumo: las cuantizaciones `Q4_K_M` (16,8 GB) e `IQ4_XS` (15,3 GB) caben en GPUs de 16-24 GB de VRAM, permitiendo inferencia local de un modelo de 27B con contexto adicional para la cache KV.
- Generacion de utilidades multi-herramienta y scripts tecnicos: la calibracion imatrix sobre trazas de uso de herramientas favorece prompts que requieren invocar y encadenar funciones dentro de un mismo archivo.
- Evaluacion comparativa de merges: el rango completo de cuantizaciones (`IQ3_S` a `BF16`) permite medir el impacto de la cuantizacion sobre un mismo merge con perplexity de referencia conocida (3,4195 en BF16).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los unicos datos de rendimiento proporcionados por el autor son de throughput: 40-60 t/s en generacion de HTML/codigo y 25-40 t/s en texto general, medidos a `Q8_0` con MTP activo. No hay valores de MMLU, HumanEval, GSM8K ni comparaciones numericas con otros modelos.

## Requisitos de hardware

- VRAM estimada por cuantizacion (tamanos de archivo indicados por el autor):
  - `BF16`: 54,7 GB, requiere 64 GB+ de VRAM o estacion de trabajo.
  - `Q8_0`: 29,0 GB, requiere 32 GB+ de VRAM; near-lossless.
  - `Q6_K`: 22,4 GB, rango 24-32 GB; buena retencion de precision con espacio para contexto y cache KV.
  - `Q5_K_M`: 19,5 GB, 24 GB de VRAM; punto intermedio.
  - `Q4_K_M`: 16,8 GB, 20-24 GB de VRAM; opcion 4-bit recomendada por el autor.
  - `IQ4_XS`: 15,3 GB, 16-24 GB de VRAM; alternativa compacta con proteccion imatrix.
  - `Q3_K_M`: 13,5 GB, 16 GB de VRAM.
- GPU recomendadas: A100 o H100 para `BF16` y `Q8_0`; RTX 4090 (24 GB) para `Q6_K`, `Q5_K_M` y `Q4_K_M`; GPUs de 16 GB para `IQ4_XS` y `Q3_K_M`.
- Cabe en GPU de consumo: si, desde 16 GB de VRAM con `Q3_K_M` e `IQ4_XS`, y con margen para contexto en 24 GB con `Q4_K_M`.
- Opciones de despliegue: llama.cpp es el runtime de referencia por el soporte MTP y GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia, aunque no se detalla el backend. No se documenta soporte para vLLM ni TGI en la informacion disponible.
- Latencia y throughput: 40-60 t/s en codigo/HTML y 25-40 t/s en texto general a `Q8_0` con MTP. No se proporcionan latencias por token ni datos para otras cuantizaciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-27b-merged-Qwopus-Thinkingcap-Swift1.5 (este) | 27,3 B | No disponible | GGUF, Apache 2.0 | Merge de tres fine-tunes con MTP preservado; 40-60 t/s en codigo a Q8_0 |
| Qwen3.8-27B base | 27 B (aprox.) | No disponible | No disponible | Segun el autor, falla en fisica y graficos en construcciones complejas de un solo disparo y tiende a bucles `<think>` |
| Qwen 3.8 Flash Next | No disponible | No disponible | No disponible | Citado por el autor como referencia que frecuentemente falla o desalinea fisica y graficos en los mismos prompts |
| Jackrong/Qwopus3.8-27B-Coder-Flash | 27 B (aprox.) | No disponible | No disponible | Componente principal del merge (60% peso); fuerte en planificacion arquitectonica y estetica front-end |
| ukisai/Swift-1.5-Qwen3.8-27b | 27 B (aprox.) | No disponible | No disponible | Componente RL del merge (25% peso); orientado a eliminar bucles de auto-correccion |
| bottlecapai/ThinkingCap-Qwen3.8-27B | 27 B (aprox.) | No disponible | No disponible | Componente regularizador (15% peso); poda cadenas de razonamiento desbocadas |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa de rendimiento entre estos modelos; la comparativa se limita a parametros, procedencia y papel en el merge.

## Limitaciones y advertencias

- El unico idioma declarado es el ingles; el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea inferior.
- La longitud de contexto no esta especificada en la informacion disponible, lo que impide planificar despliegues con ventanas largas sin verificacion previa.
- El modelo es un merge comunitario de tres fine-tunes, no un modelo entrenado de forma independiente; los sesgos de los modelos constituyentes se heredan y no estan auditados.
- Riesgo de alucinacion presente como en cualquier modelo generativo de esta escala; la calibracion imatrix esta sesgada hacia codigo, por lo que el comportamiento en dominios no tecnicos puede degradarse.
- El consumo de 20-30% mas tokens de `<think>` que fine-tunes podados implica mayor latencia y coste por consulta en razonamiento complejo.
- La licencia Apache 2.0 permite uso comercial, pero las licencias y condiciones de los tres modelos constituyentes deben verificarse de forma independiente antes de un despliegue en produccion.
- El soporte MTP y la decodificacion especulativa dependen de llama.cpp; otros runtimes pueden no aprovechar las cabezas `blk.64.nextn.*` y perder el rendimiento declarado.
- Los datos de throughput son mediciones del autor sin metodologia detallada de hardware ni de tamano de contexto, por lo que deben tratarse como orientativos.
- El repositorio de 195,1 GB requiere planificar el almacenamiento si se descargan varias cuantizaciones.

## Enlaces

- Modelo GGUF: https://huggingface.co/RiderJones/Qwen3.8-27b-merged-Qwopus-Thinkingcap-Swift1.5-GGUF
- Modelo base del merge: https://huggingface.co/RiderJones/Qwen3.8-27b-merged-qwopus-thinkingcap-swift1.5
- Componente Qwopus: https://huggingface.co/Jackrong/Qwopus3.8-27B-Coder-Flash
- Componente Swift: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Componente ThinkingCap: https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.8-27B
- Herramienta de merge: mergekit (referenciada en los tags del modelo)
- Runtime de inferencia: llama.cpp (referenciado en los tags del modelo)
