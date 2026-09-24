# Schiltmans/Ternary-Bonsai-2-27B-DFlash2-ft5

## Resumen

Ternary-Bonsai-2-27B-DFlash2-ft5 es un *drafter* de decodificacion especulativa de la familia DFlash 2, ajustado por el usuario Schiltmans contra los *hidden states* del modelo objetivo PrismML Ternary-Bonsai-2-27B. No es un modelo de lenguaje autonomo: propone bloques de tokens que el modelo objetivo verifica, de modo que no sustituye ni modifica al objetivo y altera la velocidad de respuesta, no su contenido. Es, por tanto, una pieza de infraestructura de inferencia, no un modelo para usar directamente.

Tecnicamente es un *drop-in* de `z-lab/Qwen3.8-27B-DFlash2`: mantiene los mismos 81 nombres de tensor, dtypes, formas y `config.json`, con lo que un runtime que cargue el drafter original puede cargar este sin cambios. El repositorio ocupa 3,8 GB y contiene 1.924.404.480 parametros (unos 1,92 mil millones) en safetensors con bfloat16 fusionado, con sha256 `63399215d7af9b7aaa73464e7e10835d608ae4d9571abf520040b2b8746455b3`.

Su relevancia es doble: por un lado, ataca el cuello de botella practico de los modelos ternarios de gran tamano (el objetivo pesa unos 5,9 GB en pesos ternarios), donde la decodificacion especulativa es la via mas directa para recuperar velocidad; por otro, lo hace con un coste de entrenamiento minimo (LoRA r=64, dos epocas, 1032 pasos, un solo Apple M4 Pro de 48 GB). El autor reporta una mejora de aceptacion del 9,49% en chat general y un 15,29% de throughput de decodificacion frente al drafter original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only como borrador de decodificacion especulativa (DFlash 2); derivado de Qwen3.8-27B, con cabeza de bloque y selector con codebooks |
| Parametros totales | 1.924.404.480 (~1,92 mil millones) |
| Longitud de contexto | no disponible como ventana de generacion; el entrenamiento trunca a 2048 tokens y el bloque propuesto es de 8 tokens |
| Tipos de cuantizacion | bfloat16 fusionado en el export; cargable a 4 bits en inferencia (configuracion usada en las mediciones) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`, bfloat16 fusionado, 81 tensores); no se publican GGUF |
| Tamano del repositorio | 3,8 GB |
| Biblioteca de inferencia | mlx (Apple Silicon) |
| Modelo base | z-lab/Qwen3.8-27B-DFlash2 |
| Modelo objetivo | prism-ml/Ternary-Bonsai-2-27B-mlx-2bit (revision 3f926b41) |

## Arquitectura y entrenamiento

El modelo es un borrador de decodificacion especulativa, no un generador autonomo. Su mision es proponer candidatos de bloque que el modelo objetivo valida en paralelo; la salida final siempre la determina el objetivo. Mantiene la disposicion exacta del drafter de origen (81 tensores, mismos nombres, dtypes y formas), lo que lo convierte en sustituto directo. Incluye un selector con codebooks, cuyo nombre varia entre releases (`…_codebook` frente a `…_codebook.weight`), y el repositorio del autor incluye un script de renombrado sin perdida para cargadores que exijan una de las dos convenciones.

El entrenamiento parte de `z-lab/Qwen3.8-27B-DFlash2`, documentado por su autor como espejo del lanzamiento de Inco AI, y destila contra `prism-ml/Ternary-Bonsai-2-27B-mlx-2bit`, derivado a su vez de Qwen/Qwen3.8-27B. Se generaron 300 respuestas codiciosas del objetivo sobre prompts de CodeAlpaca: 260 para entrenamiento y 40 reservados fuera de las actualizaciones de gradiente (aunque usados despues en la seleccion de iteracion, por lo que no constituyen un conjunto de test intacto). La configuracion es LoRA de rango 64, destilacion sobre el top-32 del objetivo, proyeccion del selector entrenada con codebooks congelados, AdamW a 1e-4, schedule coseno con 4% de warmup, dos epocas y 1032 pasos registrados. Los anclajes siguen los limites de ronda servidos, el contexto termina antes del anclaje y la cabeza de bloque es el token bonus no leido del objetivo. El tamano de bloque es 8 y el truncado de entrenamiento, 2048 tokens. Todo el proceso corrio en un unico Apple M4 Pro con 48 GB.

## Capacidades

- Propuesta de bloques de tokens para verificacion por parte del modelo objetivo (decodificacion especulativa con tamano de bloque 8).
- Incremento de la tasa de aceptacion del drafter de referencia: +9,49% en chat no-codigo y +10,39% en codigo retenido, a presupuesto de salida de 200 tokens.
- Mejora del throughput de decodificacion: 28,9295 tok/s frente a 25,0918 tok/s del drafter original en el mismo equipo (+15,29%).
- Sustitucion directa del drafter `z-lab/Qwen3.8-27B-DFlash2` sin cambios de configuracion ni de runtime.
- Soporte de codebooks bajo dos convenciones de nombre (`…_codebook` y `…_codebook.weight`), con conversion sin perdida.
- No dispone de generacion de texto propia, razonamiento, codigo, matematicas, vision, tool calling ni capacidades de agente: todas esas funciones residen en el modelo objetivo. El objetivo asociado (Ternary-Bonsai-2-27B) si acepta entrada de vision segun la documentacion de PrismML, pero este drafter no procesa imagenes.
- Capacidades multilingues: no disponibles (el corpus de entrenamiento es CodeAlpaca, predominantemente ingles).

## Casos de uso

- Servicio local de un modelo ternario de 27B en Apple Silicon: el drafter se carga junto a `Ternary-Bonsai-2-27B-mlx-2bit` en mlx-dspark y reduce el coste por token generado, que es precisamente el punto debil de los pesos ternarios en hardware de memoria unificada.
- Prototipado rapido con API compatible con OpenAI: el quickstart del repositorio levanta un endpoint en `http://127.0.0.1:8088/v1`, de modo que cualquier cliente que hable el protocolo OpenAI puede beneficiarse del drafter sin tocar codigo.
- Asistentes de codigo en local: el ajuste se evaluo con prompts de CodeAlpaca y la suite de codigo retenido es la que mayor ganancia de aceptacion registra (+10,39%), lo que lo hace adecuado para autocompletado y generacion de fragmentos en entornos sin GPU dedicada.
- Chat conversacional de baja latencia: la mejora del 9,49% en aceptacion sobre la suite de chat no-codigo se traduce en respuestas mas rapidas en dialogos multi-turno, siempre que la longitud de salida se mantenga en el rango evaluado.
- Investigacion en decodificacion especulativa: sirve como punto de comparacion reproducible frente al drafter stock, con hashes de corpus y pesos publicados y comandos exactos de generacion, entrenamiento, export y validacion en el repositorio.
- Destilacion de borradores a bajo coste: el pipeline (LoRA r=64 sobre 260 prompts, dos epocas en un M4 Pro) es replicable para adaptar drafters a otros objetivos cuantizados sin infraestructura de entrenamiento dedicada.
- Despliegue en estaciones de trabajo con memoria unificada limitada: al poder cargarse a 4 bits (~1 GB), el coste de memoria anadido sobre el objetivo es pequeno en comparacion con los ~5,9 GB de pesos ternarios del target.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible: el modelo no es un generador autonomo y no se evalua como tal. Lo que si se publica son mediciones de aceptacion y throughput de decodificacion especulativa, reproducidas en un Apple M4 Pro de 48 GB con mlx-dspark 0.18.0, MLX 0.32.2, mlx-lm 0.31.3, cache KV de 8 bits y drafter a 4 bits con cap 7.

| Suite | Presupuesto de salida | Stock | ft5 | Ganancia | IC 95% pareado |
|---|---|---|---|---|---|
| Chat no-codigo | 200 | 2,7768 | 3,0403 | +9,49% | +7,25% a +11,69% |
| Chat no-codigo, brazos invertidos | 200 | 2,7768 | 3,0403 | +9,49% | +7,25% a +11,69% |
| Codigo retenido | 200 | 3,8166 | 4,2130 | +10,39% | +7,80% a +13,13% |
| Chat no-codigo | 1024 | 2,8149 | 3,0399 | +7,99% | +6,75% a +9,24% |

Las cifras son tokens por ronda, agrupadas sobre rondas completas. El protocolo de throughput fue ABBA con tres repeticiones por brazo, agrupando tokens totales sobre segundos totales de decodificacion: 25,0918 tok/s (stock) frente a 28,9295 tok/s (ft5), es decir +15,29% (y +15,3% en modo codicioso segun el titular del autor).

Advertencias sobre la medicion, segun el propio modelo: a 200 tokens se truncaron 34/40 respuestas de chat no-codigo y 25/40 de codigo en cada brazo (13/40 a 1024 tokens), por lo que se miden prefijos finitos y no respuestas completas ni latencia percibida por el usuario; la suite de chat no-codigo es un cribado congelado de ocho categorias y cinco prompts cada una (no una muestra poblacional), y la suite de codigo sirvio para elegir la iteracion de entrenamiento, luego no es un test final intacto.

## Requisitos de hardware

- Memoria del drafter: unos 3,8 GB en bfloat16 y aproximadamente 1 GB si se carga a 4 bits, la configuracion empleada en las mediciones.
- Memoria del objetivo: en torno a 5,9 GB de pesos ternarios para `prism-ml/Ternary-Bonsai-2-27B-mlx-2bit`, mas la cache KV (8 bits en las pruebas). El drafter es inutil sin el objetivo.
- Hardware validado: un unico Apple M4 Pro con 48 GB de memoria unificada, alimentacion de red electrica, mlx-dspark 0.18.0 con los parches del repositorio, MLX 0.32.2 y mlx-lm 0.31.3.
- GPU recomendadas: no disponibles. El modelo esta empaquetado para MLX (Apple Silicon) y no se han publicado mediciones en A100, H100, RTX 4090 ni similares.
- Cabe en GPU de consumo: en Apple Silicon si, siempre que la memoria unificada permita alojar drafter y objetivo a la vez (el autor entreno en 48 GB). Para GPUs NVIDIA de consumo no hay dato: el soporte depende de runtimes no probados.
- Opciones de despliegue: mlx-dspark 0.18.0 con los parches de `alexschiltmans/bonsai2-drafter` (validado). Cualquier runtime que sirva Bonsai 2 y cargue `z-lab/Qwen3.8-27B-DFlash2` (familia dflash-mlx, vLLM, SGLang y otros) queda como no probado; el archivo tiene la misma disposicion que el drafter stock, por lo que deberia cargar, pero la ganancia no esta medida.
- Latencia: no disponible. Throughput medido de 28,9295 tok/s frente a 25,0918 tok/s del drafter original en el equipo de referencia.
- Nota de instalacion: el quickstart del repositorio compila el entorno fijado, descarga objetivo y drafter en revisiones concretas y sirve con los ajustes usados en las mediciones.

## Comparativa con modelos similares

| Modelo | Rol | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Ternary-Bonsai-2-27B-DFlash2-ft5 (este) | Drafter DFlash 2 ajustado | 1,92 B | bloque de 8 tokens; entrenamiento a 2048 | +9,49% aceptacion en chat; 28,93 tok/s | apache-2.0 | Publico en HuggingFace; 0 descargas, 1 like |
| z-lab/Qwen3.8-27B-DFlash2 | Drafter stock (punto de partida) | no disponible | no disponible | 2,7768 tokens/ronda en chat; 25,09 tok/s | no disponible | Publico en HuggingFace |
| ProCreations/Ternary-Bonsai-2-27B-DFlash2 | Drafter alternativo para el mismo objetivo | no disponible | no disponible | no disponible | no disponible | Existe en HuggingFace; sin datos publicados |
| prism-ml/Ternary-Bonsai-2-27B-mlx-2bit | Modelo objetivo (generador ternario multimodal) | ~27 B ternarios, ~5,9 GB | no disponible | Retiene el 98,2% del rendimiento de Qwen3.8 27B segun PrismML | no disponible | Publico en HuggingFace |

No se dispone de comparaciones con otros esquemas de decodificacion especulativa (EAGLE-3, Medusa u otros) en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no puede usarse de forma autonoma ni sustituye al objetivo. Solo propone tokens que el objetivo verifica.
- La mejora medida se limita a mlx-dspark 0.18.0 con los parches del repositorio. En vLLM, SGLang, la familia dflash-mlx u otros runtimes el modelo esta sin probar y la ganancia no esta cuantificada.
- El ajuste se entreno con 300 prompts de CodeAlpaca, de los cuales 40 se reservaron pero se usaron despues para seleccionar la iteracion: no existe un conjunto de test final intacto.
- Las cifras de aceptacion provienen de suites de cribado de 40 prompts, no de muestras poblacionales, y con truncamiento elevado (34/40 y 25/40 a 200 tokens), por lo que miden prefijos y no respuestas completas.
- No hay mediciones de latencia percibida por el usuario, solo de throughput agregado.
- Idiomas y sesgos: no disponibles. El corpus de entrenamiento es de codigo predominantemente en ingles, lo que puede reducir la aceptacion en otros idiomas o dominios.
- Riesgo de alucinacion: no aplica al drafter en si, porque toda propuesta se verifica contra el objetivo; el riesgo de contenido reside en el modelo objetivo.
- Dependencia de revisiones concretas: las mediciones usan el objetivo en la revision `3f926b41`; la revision posterior `fcba37d2` mantiene los pesos pero anade en `generation_config.json` los valores de muestreo por defecto y un segundo token de parada (`248044`). Reejecutar contra revisiones mutables de los modelos upstream no reproduce el mismo experimento.
- Variantes de nombre de los codebooks del selector: un cargador que exija una convencion concreta puede fallar; hay que usar el script de renombrado del repositorio.
- Adopcion practica nula por el momento: 0 descargas y 1 like en el repositorio de HuggingFace, con lo que se trata de un artefacto experimental sin validacion externa.
- Licencia apache-2.0 para este drafter, pero deben revisarse por separado las licencias del modelo objetivo y del drafter base antes de un uso comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Schiltmans/Ternary-Bonsai-2-27B-DFlash2-ft5
- Repositorio de codigo (entrenador, evaluacion, parches y quickstart): https://github.com/alexschiltmans/bonsai2-drafter
- Documentacion de entrenamiento y validacion: https://github.com/alexschiltmans/bonsai2-drafter/blob/main/bench/drafter/README.md
- Modelo base (drafter stock): https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Modelo objetivo: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-mlx-2bit
- Dataset de entrenamiento: https://huggingface.co/datasets/sahil2801/CodeAlpaca-20k
- Documentacion de Ternary Bonsai 2 27B: https://docs.prismml.com/bonsai-2-27b
- Anuncio de Bonsai 2 27B en PrismML: https://prismml.com/news/bonsai-2-27b
- Documentacion de la familia Bonsai: https://docs.prismml.com/models/bonsai-27b
- Drafter alternativo de terceros: https://huggingface.co/ProCreations/Ternary-Bonsai-2-27B-DFlash2
- Referencia arXiv indicada en las etiquetas del modelo: https://arxiv.org/abs/2602.06036
