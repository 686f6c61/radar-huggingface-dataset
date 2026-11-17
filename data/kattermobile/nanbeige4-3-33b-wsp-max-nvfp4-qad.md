# KatterMobile/Nanbeige4.3-33B-WSP-MAX-NVFP4-QAD

## Resumen

Nanbeige4.3-33B-WSP-MAX-NVFP4-QAD es una variante cuantizada y modificada del modelo Nanbeige/Nanbeige4.3-33B, publicada por el usuario KatterMobile en Hugging Face. El modelo parte del checkpoint base de 33.118.977.024 parametros (aproximadamente 33,1 mil millones) y le aplica dos transformaciones secuenciales: primero una edicion de pesos sin gradientes denominada Weight-Space Program (WSP), y despues una cuantizacion NVFP4 W4A4 con destilacion consciente de cuantizacion (QAD) mediante NVIDIA ModelOpt.

La innovacion principal que reclama el autor es que una unica edicion de rango 1 por capa en las proyecciones `mlp.down_proj` de nueve capas concretas (26, 28, 30, 32, 34, 36, 38, 40 y 42) produce una mejora de +13,13 puntos porcentuales en GPQA Diamond respecto al modelo base, con un 10,4% menos de tokens de razonamiento. Segun la model card, esta edicion no anade conocimiento nuevo, sino que corrige dos modos de fallo: bucles circulares de rechequeo y razonamiento desbocado que no llega a una respuesta dentro del presupuesto de tokens.

El resultado es un checkpoint de aproximadamente 21 GB en disco (22,1 GB de repositorio) que cabe en hardware Blackwell de consumo profesional, como una DGX Spark con GB10, y que mantiene un contexto largo declarado de 512k tokens. La licencia es Apache 2.0 y los idiomas soportados son ingles y chino. La relevancia actual reside en la combinacion de tecnicas: edicion de pesos de bajo rango, cuantizacion FP4 a nivel de pesos y activaciones, y un contexto muy extenso en un formato desplegable en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia llama, segun tags del repo); capas con `mlp.down_proj` modificadas por WSP en 9 de 52 capas |
| Parametros totales | 33.118.977.024 (33,1B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512k tokens (declarado y probado segun el autor) |
| Tipos de cuantizacion | NVFP4 W4A4 (pesos y activaciones FP4, grupo 16), FP8 KV cache, `lm_head` y embeddings en BF16; export NVFP4 QAD |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 22,1 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de 52 capas y 33,1B parametros. Sobre el se aplica una edicion WSP sin gradientes: para cada capa del conjunto seleccionado se actualiza la matriz de pesos segun `W_l ← W_l + α · n_{w,l} · d_l · u_lᵀ / ‖u_l‖²`, donde `d_l` es una direccion de "cierre cognitivo" (media del residuo en los ultimos 48 tokens de pensamiento antes del marcador de fin de razonamiento menos los tokens anteriores), `u_l` es la direccion de entrada y `n_{w,l}` la norma del escritor. El hiperparametro α es 0,10 y el cambio relativo de Frobenius medio es del 0,471% (rango 0,26%–0,54% tras redondeo BF16). La direccion se ajusto unicamente con 44 problemas de entrenamiento de MATH nivel 5, y el conjunto de capas se selecciono sobre un conjunto de validacion retenido de MATH nivel 5 (24 problemas), nunca sobre GPQA.

Posteriormente se aplica una cuantizacion NVFP4 W4A4 con QAD usando NVIDIA ModelOpt (commit `ef893e77084198c161cc908eb91380b3a47eccad`, version 0.50.0.dev0) con la receta `general/qad/nvfp4_lsq-mse_init-fp8_kv`. El proceso incluye inicializacion MSE, barrido de escalas FP8, escalas LSQ aprendibles por bloque, activaciones NVFP4 dinamicas W4A4, cache KV FP8 calibrada y grupo de tamano 16. Se realizaron 40 pasos de QAD end-to-end contra el profesor BF16 WSP exacto (top-64 mas KL de masa de cola), entrenando 364 tensores de escala de bloque LSQ, 105 RMSNorms y las 364 matrices maestras lineales (31,9B parametros) con Adafactor factorizado y redondeo estocastico BF16 no sesgado. El corpus de calibracion son secuencias ChatML densas de 2.048 tokens (razonamiento y uso de herramientas): 262.144 tokens de calibracion, 40.960 de validacion y 81.920 de entrenamiento QAD, en particiones disjuntas.

## Capacidades

- Generacion de texto conversacional y razonamiento multi-paso con modo de pensamiento explicito (thinking mode).
- Razonamiento cientifico y de dominio STEM, con mejora medida en GPQA Diamond (fisica, quimica y biologia).
- Razonamiento matematico, con seleccion de la edicion sobre problemas MATH nivel 5.
- Uso de herramientas y function calling, segun el corpus de entrenamiento QAD (reasoning + tool-use).
- Capacidades de agente y razonamiento multi-paso, con reduccion de bucles de rechequeo.
- Contexto largo de hasta 512k tokens, probado segun el autor.
- Multilingue limitado a ingles y chino.
- Capacidad de cierre cognitivo: el modelo tiende a concluir el razonamiento dentro del presupuesto de tokens en lugar de divagar.

## Casos de uso

- Razonamiento cientifico asistido: el modelo puede resolver preguntas de nivel posgrado en fisica, quimica y biologia, con una precision medida del 59,60% en GPQA Diamond, adecuado para herramientas de investigacion que necesitan respuestas razonadas y no solo recuperacion de hechos.
- Analisis de documentos largos: con 512k tokens de contexto, puede procesar articulos completos, expedientes o bases de codigo extensas en una sola pasada, util para resumen y extraccion de informacion en entornos de investigacion.
- Agentes autonomos con tool calling: su soporte de function calling y su tendencia a concluir el razonamiento lo hacen adecuado para pipelines de agentes que necesitan cerrar tareas dentro de un presupuesto de tokens, reduciendo costes de inferencia.
- Despliegue en hardware Blackwell de borde: al ocupar aproximadamente 21 GB en NVFP4, puede ejecutarse en una DGX Spark con GB10, lo que permite razonamiento de 33B en entornos con memoria unificada limitada.
- Tutoria y evaluacion educativa en matematicas: entrenado y validado sobre problemas MATH nivel 5, puede usarse para generar soluciones paso a paso y explicar razonamientos, con menos divagacion que el modelo base.
- Generacion de codigo y razonamiento tecnico en ingles o chino: adecuado para asistentes de programacion bilingues que requieran contexto largo para repositorios completos.
- Investigacion sobre edicion de pesos: el checkpoint sirve como artefacto reproducible para estudiar Weight-Space Programming y cuantizacion QAD, con artefactos de evaluacion incluidos en el repositorio.

## Benchmarks y rendimiento

Los datos de GPQA Diamond (n = 198) proceden de la model card. Segun el autor, las ganancias de GPQA se midieron sobre la edicion WSP en BF16 servida con cuantizacion online FP8 en vLLM, mientras que este export NVFP4 se verifico mediante KL de profesor retenido y sondas funcionales.

| Metrica | Base Nanbeige4.3-33B | WSP edit | Control aleatorio |
|---|---|---|---|
| Precision GPQA Diamond | 46,46% (92/198) | 59,60% (118/198) | 47,47% (94/198) |
| Delta vs base (IC 95%) | — | +13,13 pp [+8,08, +18,69] | +1,01 pp [−4,04, +6,06] |
| Pares win/loss | — | 30 W / 4 L | 15 W / 13 L |
| McNemar p | — | 6×10⁻⁶ | 0,85 (ruido) |
| Tokens medios | 5.730,1 | 5.135,9 (−10,4%) | 5.822,7 (+1,6%) |
| Truncamientos a 8k | 102 | 78 | 101 |

| Slice | Base | WSP edit |
|---|---|---|
| Items con razonamiento concluido naturalmente (n = 94) | 93,62% | 97,87% |
| Items donde el base supero el limite pero el edit concluyo (n = 27) | 0% | 96,30% |
| Precision con presupuesto de 4.096 tokens | 30,30% | 40,91% |
| Precision con presupuesto de 6.144 tokens | 40,40% | 54,04% |
| Precision con presupuesto de 8.192 tokens | 46,46% | 59,60% |

| Dominio (GPQA Diamond) | n | Base | WSP edit | Control |
|---|---|---|---|---|
| Fisica | 86 | 70,9% | 81,4% | 70,9% |
| Quimica | 93 | 23,7% | 38,7% | 24,7% |
| Biologia | 19 | 47,4% | 63,2% | 52,6% |

| Pantalla de seleccion (MATH nivel 5, retenido) | Base | WSP edit |
|---|---|---|
| Precision | 70,83% | 83,33% |
| Win/loss | — | 3 W / 0 L |
| Tokens | — | −21,6% |

No se han publicado en la informacion disponible resultados de benchmarks como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: aproximadamente 21 GB en disco para el checkpoint NVFP4; la inferencia requiere al menos esa cantidad mas overhead de cache KV FP8 y activaciones.
- GPU recomendadas: hardware Blackwell (GB10, DGX Spark) para soporte nativo NVFP4; tambien A100 y H100 si el runtime soporta FP4 o mediante de-cuantizacion.
- Cabe en consumer GPU: si, en GPUs con 24 GB o mas (por ejemplo RTX 4090) si el runtime soporta NVFP4; en Blackwell de consumo profesional con memoria unificada como DGX Spark esta verificado por el autor.
- Opciones de despliegue: vLLM (usado por el autor para el BF16 WSP con cuantizacion FP8 online), NVIDIA ModelOpt para el pipeline de cuantizacion; no se confirma soporte de llama.cpp u Ollama en la informacion disponible.
- Latencia y throughput: no disponibles; el autor reporta una reduccion del 10,4% en tokens de pensamiento, lo que reduce el coste de inferencia de forma indirecta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GPQA Diamond | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nanbeige4.3-33B-WSP-MAX-NVFP4-QAD | 33,1B | 512k | 59,60% (segun autor) | Apache 2.0 | Hugging Face |
| Nanbeige4.3-33B (base) | 33,1B | no disponible | 46,46% | Apache 2.0 | Hugging Face |
| Control aleatorio norm-matched | 33,1B | no disponible | 47,47% | no aplica | no disponible |

No se dispone en la informacion proporcionada de datos de otros modelos comparables de la misma categoria (mismo tamano o misma tarea) para ampliar la comparativa.

## Limitaciones y advertencias

- Los resultados de GPQA se midieron sobre la edicion WSP en BF16 con cuantizacion FP8 online, no directamente sobre este export NVFP4; el autor indica que el export se verifico mediante KL de profesor retenido y sondas funcionales, pero la equivalencia exacta de rendimiento no esta demostrada en la model card.
- La edicion WSP se ajusto con solo 44 problemas de matematicas y el conjunto de capas se selecciono con 24 problemas; el riesgo de sobreajuste a ese dominio es plausible, aunque GPQA se presenta como confirmacion fuera de dominio.
- La mejora se concentra en quimica (+15,0 pp) y biologia (+15,8 pp), con menor margen en fisica (+10,5 pp); el rendimiento absoluto en quimica sigue siendo bajo (38,7%).
- Riesgo de alucinacion inherente a un modelo de 33B; la edicion no inyecta hechos nuevos, por lo que no corrige errores factuales.
- Idiomas limitados a ingles y chino; no se declara soporte de castellano.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del checkpoint cuantizado en produccion.
- El modelo depende de hardware y runtimes con soporte NVFP4 (Blackwell); en GPUs sin soporte FP4 el despliegue puede requerir de-cuantizacion y perder las ventajas de memoria.
- El repositorio tiene muy poca traccion (59 descargas, 0 likes) y un unico autor; no hay validacion independiente de los resultados.
- La model card esta truncada en la informacion disponible, por lo que faltan detalles del pipeline de evaluacion y de la tabla de KL retenido.

## Enlaces

- Hugging Face: https://huggingface.co/KatterMobile/Nanbeige4.3-33B-WSP-MAX-NVFP4-QAD
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Artefactos de evaluacion: https://huggingface.co/KatterMobile/Nanbeige4.3-33B-WSP-MAX-NVFP4-QAD/tree/main/eval_artifacts
- NVIDIA ModelOpt: no disponible en la informacion proporcionada (commit referenciado: `ef893e77084198c161cc908eb91380b3a47eccad`, version 0.50.0.dev0)
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada
