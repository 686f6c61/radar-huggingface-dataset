# AngelSlim/Hy4-flash-GGUF

## Resumen

Hy4-flash es un modelo de lenguaje de gran escala desarrollado por Tencent, publicado originalmente como `tencent/Hy4-flash`. Se trata de un modelo con arquitectura MoE (Mixture of Experts) de aproximadamente 224.000 millones de parametros totales, disenado para cargas conversacionales y de generacion de codigo. La model card lo describe como un modelo multimodal, ya que admite entrada de imagenes mediante un proyector `mmproj` en formato BF16.

La ficha que nos ocupa no es el modelo original, sino la coleccion de cuantizaciones GGUF publicadas por el proyecto AngelSlim (tambien de Tencent) bajo el identificador `AngelSlim/Hy4-flash-GGUF`. AngelSlim es un toolkit de compresion de modelos que ofrece cinco builds GGUF con recetas de cuantizacion diferenciadas (Q4_K_M, SPARK-4Bit, SPARK-4Bit-Fast, Q3_K e IQ2-AH), pensadas para llevar un modelo de este tamano a hardware de escritorio con 128 GB de memoria unificada, como un Mac M5 Max o una RTX Spark.

El interes actual de esta publicacion radica en que demuestra que un MoE de 224B puede ejecutarse en equipos de gama alta de consumo con velocidades de decodificacion utilizables (del orden de 30-50 tok/s segun el build y el hardware), algo impensable hace poco para esta categoria de modelos. La model card incluye ademas datos de rendimiento medidos en llama.cpp y en Strata, y enlaza un informe tecnico en arXiv.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts); detalles completos no disponibles en la informacion proporcionada |
| Parametros totales | ~224.000 millones (segun la model card); el campo de parametros safetensors del repo indica 845.686.433, probablemente correspondiente a un subconjunto o metadato parcial |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible de forma oficial; los ejemplos de uso emplean `-c 8192` y las pruebas de rendimiento cubren hasta 32K tokens de entrada |
| Tipos de cuantizacion | Q4_K_M, SPARK-4Bit, SPARK-4Bit-Fast, Q3_K, IQ2-AH (GGUF) |
| Idiomas soportados | chino (zh) e ingles (en) segun los tags; el tag de la ficha tambien menciona arabe (ar), sin confirmacion en la model card |
| Licencia | no disponible |
| Formato de pesos | GGUF (multiparte, p. ej. `Hy4-flash-Q4_K_M-00001-of-00002.gguf`); proyector multimodal `mmproj-Hy4-flash-bf16.gguf` |

Detalle de los builds GGUF publicados:

| Fichero | Tamano | bpw global | bpw (excl. tabla Engram) |
|---|---:|---:|---:|
| `Hy4-flash-Q4_K_M.gguf` | 156,79 GiB | 6,05 | 5,27 |
| `Hy4-flash-SPARK-4Bit.gguf` | 151,3 GiB | 5,84 | 4,78 |
| `Hy4-flash-SPARK-4Bit-Fast.gguf` | 148,6 GiB | 5,74 | 4,63 |
| `Hy4-flash-Q3_K.gguf` | 144,70 GiB | 5,58 | 4,62 |
| `Hy4-flash-IQ2-AH.gguf` | 125,73 GiB | 4,85 | 3,60 |

## Arquitectura y entrenamiento

La informacion disponible confirma que Hy4-flash es un modelo MoE con aproximadamente 224.000 millones de parametros totales. La model card de las cuantizaciones menciona una "tabla Engram" que se excluye del calculo de bits por peso, lo que sugiere la presencia de un componente de memoria o embedding adicional integrado en la arquitectura; no se detalla su funcionamiento en la informacion proporcionada. El modelo es multimodal: admite entrada de imagenes a traves de un proyector (`mmproj`) en BF16, lo que indica un codificador visual acoplado al transformer de lenguaje.

Las cuantizaciones de AngelSlim siguen recetas especificas sobre los expertos enrutados: en Q4_K_M, las proyecciones `gate`/`up` usan Q4_K y `down` recibe Q6_K en 19 capas y Q4_K en las otras 22, mientras que la mayoria de los pesos no-expertos se mantienen en Q8_0. En Q3_K, las proyecciones `gate`/`up` de los expertos bajan a Q3_K en 22 capas seleccionadas por sensibilidad a la cuantizacion y mantienen Q4_K en 19. En IQ2-AH, `gate`/`up` se comprimen a 2,0625 bpw (IQ2_XXS) y `down` se mantiene en Q4_K, con los pesos no-expertos en BF16. Los builds SPARK usan el formato de coma flotante de 4 bits de NVIDIA. No se dispone de datos sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional multi-turno, con soporte de plantilla de chat via `--jinja` en llama.cpp.
- Generacion de codigo: la model card reporta hasta 70 tok/s en Q3_K y 40 tok/s en SPARK-4Bit-Fast en escenarios de generacion de codigo.
- Entrada multimodal de imagenes mediante el proyector `mmproj-Hy4-flash-bf16.gguf` y la herramienta `llama-mtmd-cli`.
- Capacidades multilingues limitadas, segun los metadatos, a chino e ingles (con mencion adicional de arabe en los tags, no confirmada).
- Compatibilidad con endpoints estilo OpenAI a traves de `llama-server`.
- Soporte de decodificacion especulativa mediante MTP (Multi-Token Prediction) en el runtime Strata, con un borrador DFly Q8_0 que mejora la decodificacion en cargas de codigo.
- No se dispone de informacion sobre tool calling, function calling ni capacidades de agente en la documentacion proporcionada.

## Casos de uso

- Asistente de codigo en estacion de trabajo local: con el build Q3_K en un Mac M5 Max 128 GB se alcanzan hasta 70 tok/s en generacion de codigo, lo que permite integrar el modelo en un IDE o en un flujo de autocompletado sin depender de la nube.
- Chat conversacional de contexto largo: los ejemplos de llama.cpp usan ventanas de 8192 tokens y las pruebas de rendimiento cubren entradas de hasta 32K, adecuado para conversaciones multi-turno con documentos adjuntos.
- Analisis de imagenes en local: mediante `llama-mtmd-cli` y el proyector `mmproj`, se pueden describir fotografias o capturas sin enviar datos a servicios externos, util en entornos con requisitos de privacidad.
- Despliegue de servidor compatible con OpenAI: `llama-server` expone una API en el puerto 8080 que permite sustituir llamadas a APIs comerciales en prototipos y herramientas internas.
- Inferencia en hardware NVIDIA de gama profesional: el runtime Strata con presupuesto de 16 GiB de VRAM y decodificacion especulativa DFly alcanza 47,6 tok/s en cargas de codigo, adecuado para pipelines de generacion automatizada.
- Procesamiento por lotes en equipos con memoria unificada: los builds SPARK-4Bit estan pensados para dispositivos RTX Spark de 128 GB, con prefill de hasta 799 tok/s a 4K, lo que permite clasificacion, resumen o extraccion de informacion sobre lotes de documentos.
- Evaluacion e investigacion de tecnicas de cuantizacion: los cinco builds con recetas diferenciadas permiten comparar el impacto de Q4_K_M, Q3_K, IQ2 y SPARK-4Bit sobre el mismo modelo base en tareas reales.

## Benchmarks y rendimiento

La model card no incluye resultados de benchmarks academicos (MMLU, HumanEval, GSM8K u otros); unicamente presenta mediciones de velocidad. Se reproducen a continuacion.

**llama.cpp en Mac M5 Max 128 GB** (prefill / decode en tok/s):

| Formato | Prefill 4K / 16K / 32K | Decode 4K / 16K / 32K |
|---|---|---|
| Q4_K_M | 629,8 / 448,1 / 418,6 | 48,13 / 45,18 / 44,15 |
| Q3_K | 743,2 / 563,0 / 520,6 | 50,34 / 49,47 / 47,37 |

**llama.cpp en RTX Spark 128 GB:**

| Formato | Prefill 4K / 16K / 32K | Decode 4K / 16K / 32K |
|---|---|---|
| SPARK-4Bit-Fast | 799 / 717 / 707 | 31,95 / 33,14 / 33,39 |
| SPARK-4Bit | 765 / 686 / 666 | 25,80 / 28,16 / 30,3 |

**Strata en NVIDIA CUDA con presupuesto de 16 GiB de VRAM** (modelo Q4_K_M_MTP_Q8_0, 4K de entrada / 512 de salida, contexto de 33.024 tokens):

| Carga | Decode sin borrador | Decode con DFly Q8_0 |
|---|---:|---:|
| Prosa | 36,8 | 38,7 |
| Codigo | 37,5 | 47,6 |

**Strata en Mac mini M4 Pro 64 GB** (modelo IQ2, MTP k=2, contexto 8K, 256 tokens generados): prefill de 125-127 tok/s y decode de 17,3 tok/s.

No se han publicado resultados de benchmarks de calidad en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: los builds ocupan entre 125,73 GiB (IQ2-AH) y 156,79 GiB (Q4_K_M); se necesita memoria unificada o VRAM agregada de al menos esa cifra mas margen para el contexto y el proyector.
- GPU recomendadas: RTX Spark de 128 GB para los builds SPARK-4Bit; Apple Silicon de 128 GB (Mac M5 Max) para Q4_K_M y Q3_K; Mac mini M4 Pro de 64 GB ejecuta el build IQ2.
- En GPU consumer convencional (24 GB o menos) el modelo completo no cabe; seria necesario repartir capas entre GPU y CPU o usar el build IQ2 con offload parcial, con la penalizacion de velocidad correspondiente.
- Opciones de despliegue: llama.cpp (soporte en el PR #32517, aun no fusionado, requiere compilar la rama), runtime Strata (soporte en el PR #7120) y `llama-server` para API compatible con OpenAI.
- Throughput de referencia: decodificacion de 44-50 tok/s en Mac M5 Max con Q4_K_M/Q3_K; 25-33 tok/s en RTX Spark con SPARK-4Bit; 17,3 tok/s en Mac mini M4 Pro con IQ2; hasta 47,6 tok/s en CUDA con 16 GiB de VRAM usando decodificacion especulativa DFly.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de otros modelos comparables (parametros, contexto, rendimiento o licencia) que permitan establecer una comparativa rigurosa. Como referencia estructural, el propio modelo base `tencent/Hy4-flash` seria el punto de comparacion natural frente a estas cuantizaciones, pero no se han facilitado sus especificaciones completas ni resultados de benchmarks.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Hy4-flash (base, `tencent/Hy4-flash`) | ~224B (MoE) | no disponible | no disponible | safetensors (presumiblemente) |
| Hy4-flash-GGUF (esta ficha) | ~224B (MoE) | no disponible | no disponible | GGUF (5 builds) |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La licencia no esta indicada en la informacion disponible; antes de un uso comercial es imprescindible verificar los terminos del modelo base `tencent/Hy4-flash`.
- El soporte en llama.cpp depende de un PR no fusionado (#32517); la API y el comportamiento pueden cambiar y no se garantiza estabilidad para produccion.
- El modelo solo declara chino e ingles como idiomas; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- No hay datos publicados de benchmarks de calidad, por lo que no es posible evaluar la degradacion introducida por cada receta de cuantizacion mas alla de las velocidades reportadas.
- El tag de la ficha incluye arabe, pero la model card solo lista chino e ingles; existe una discrepancia no resuelta.
- El campo de parametros safetensors del repo (845.686.433) no concuerda con los ~224B indicados en la model card; conviene tratar la cifra con cautela.
- Riesgo de alucinacion y sesgos: no se han publicado evaluaciones de sesgo ni de fidelidad factual en la informacion disponible.
- El requisito de memoria (125-157 GiB) excluye la mayoria de GPUs de consumo; el despliegue en hardware limitado exige offload parcial y reduce drasticamente el throughput.
- El tag `endpoints_compatible` sugiere compatibilidad con endpoints, pero no se detalla el alcance ni las limitaciones de dicha compatibilidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AngelSlim/Hy4-flash-GGUF
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Informe tecnico (arXiv): https://arxiv.org/abs/2602.21233
- Documentacion de AngelSlim: https://angelslim.readthedocs.io/
- Organizacion AngelSlim en Hugging Face: https://huggingface.co/AngelSlim
- Organizacion AngelSlim en ModelScope: https://modelscope.cn/organization/AngelSlim
- Repositorio GitHub de AngelSlim: https://github.com/Tencent/AngelSlim
- PR de soporte en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/32517
- PR de soporte en Strata: https://github.com/Niko1221/Strata/pull/7120
- Guia para Mac Metal: https://huggingface.co/AngelSlim/Hy4-flash-GGUF/blob/main/README_MAC-Metal.md
- Guia para RTX Spark: https://huggingface.co/AngelSlim/Hy4-flash-GGUF/blob/main/README_SPARK-4Bit.md
- Discord: https://discord.com/invite/dHVNeuNdFt
