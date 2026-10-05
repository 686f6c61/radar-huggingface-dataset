# LithosAI/Qwen3.6-35B-A3B-DSpark-NVFP4

## Resumen

LithosAI/Qwen3.6-35B-A3B-DSpark-NVFP4 es una cabeza borrador (draft head) para decodificacion especulativa, cuantizada en NVFP4 con esquema weight-only, y disenada para funcionar junto al modelo objetivo nvidia/Qwen3.6-35B-A3B-NVFP4. No es un modelo autonomo de generacion de texto: se ejecuta en paralelo al modelo objetivo y propone tokens que este ultimo verifica. El desarrollo corre a cargo de LithosAI, y su validacion se ha realizado con LMK (Lithos Metal Kernels) sobre silicio de Apple.

La pieza destaca por su formato de almacenamiento: 46 matrices en NVFP4 (FP4 E2M1 con escalas de bloque F8_E4M3 cada 16 columnas de entrada y escala tensorial F32 por matriz), almacenadas como safetensors estandar con indice, sin necesidad de un `weights.pack` especifico de hardware. El checkpoint pesa 952.165.546 bytes (0,952 GB decimales) y declara 888.545.025 parametros en los metadatos de safetensors.

La relevancia actual viene de la combinacion de decodificacion especulativa y cuantizacion de baja precision: la cabeza mantiene seis capas draft, hidden size 2048, intermediate size 6144, 32 cabezas de consulta y ocho de KV, con una cabeza Markov (rank 256) y una cabeza de confianza. Frente a un borrador BF16 equivalente, el modelo conserva el 98,4 % de la aceptacion media de propuestas segun la evaluacion del autor, reduciendo el coste por ronda.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza borrador DSpark (attention + Markov head + confidence head); 6 capas draft |
| Parametros totales | 888.545.025 |
| Parametros activos | no aplica (cabeza borrador densa, no MoE) |
| Longitud de contexto | no especificada como propiedad del checkpoint; el runtime de validacion usa `--max-context 32768` |
| Tipos de cuantizacion | NVFP4 weight-only (FP4 E2M1, dos codigos por byte U8, nibble bajo primero); escala de bloque F8_E4M3 cada 16 columnas; escala tensorial F32 por matriz; Markov W1 permanece en BF16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors fragmentado con indice (`*.weight`, `*.weight_scale`, `*.weight_scale_2`, estilo ModelOpt) |

## Arquitectura y entrenamiento

La cabeza conserva seis capas draft con hidden size 2048, intermediate size 6144, 32 cabezas de consulta, ocho cabezas KV, dimension de cabeza 128 y un rango Markov de 256. Segun la informacion disponible, DSpark extiende DFlash incorporando una cabeza Markov (que modela dependencia entre tokens dentro del bloque) y una cabeza de confianza (que predice la aceptacion por posicion). El checkpoint soporta ocho propuestas, aunque LMK usa por defecto siete propuestas mas el ancla, lo que da ocho filas de verificacion sin modificar la configuracion almacenada.

El almacenamiento emplea cuantizacion weight-only: las activaciones se mantienen en BF16 con acumulacion y estado en FP32, y no se declara calibracion de activaciones ni cuantizacion NVFP4 de las mismas. La dequantizacion se define como `E2M1(code) * E4M3(block_scale) * tensor_scale`. No se han publicado detalles sobre el dataset de entrenamiento, el numero de tokens ni el uso de RLHF/DPO en la informacion proporcionada.

## Capacidades

- Propuesta de tokens para decodificacion especulativa: genera hasta ocho candidatos por ronda que el modelo objetivo verifica en paralelo.
- Cabeza Markov de dependencia intra-bloque: modela relaciones entre tokens consecutivos dentro de la propuesta.
- Cabeza de confianza: estima la probabilidad de aceptacion por posicion, util para decidir cuando continuar la especulacion.
- Incluye embedding de tokens propio del checkpoint y proyeccion de vocabulario congelada, ambos cuantizados.
- No es un modelo de chat autonomo: no tiene tokenizer ni plantilla de chat propios; los aporta el modelo objetivo.
- Idiomas: no declarados. La evaluacion de calidad del autor cubrio prompts de codigo, matematicas, explicaciones, redaccion, chino y espanol, pero no constituye una lista oficial de idiomas soportados.
- No declara soporte de tool calling, function calling ni uso como agente por si misma.

## Casos de uso

- Aceleracion de inferencia del objetivo Qwen3.6-35B-A3B-NVFP4: la cabeza se empareja con el modelo completo para reducir la latencia por token en despliegues de un solo flujo, con un coste adicional de memoria de solo ~0,95 GB.
- Servicio de chat de baja latencia en Apple silicon: con LMK sobre un M5 Max de 40 nucleos y 48 GB, el autor reporta rondas completas de 25,17 ms a 128 tokens de contexto y 46,38 ms a 32K, frente a 27,42 ms y 48,76 ms con borrador BF16.
- Despliegue en cajas de memoria unificada tipo DGX Spark: al ser MoE el objetivo, el sistema completo (objetivo NVFP4 mas borrador) cabe en 128 GB de memoria unificada y permite contexto largo combinado con decodificacion especulativa.
- Investigacion en decodificacion especulativa: sirve como referencia reproducible para comparar politicas de propuestas, cuantizacion del borrador y tasas de aceptacion bajo un pipeline concreto.
- Evaluacion de cuantizacion NVFP4 weight-only: el checkpoint permite medir el impacto de cuantizar solo pesos en una cabeza de especulacion, con metricas de aceptacion comparables contra un borrador BF16.
- Integracion en pipelines de generacion de codigo y matematicas: la validacion del autor cubre estos dominios con 64 prefijos coincidentes y una aceptacion media de 3,859375 propuestas de 7 en NVFP4, adecuada para flujos de generacion larga donde la latencia por token importa.
- Pruebas de estres de contexto largo: con 32K de contexto en el runtime validado, permite medir la degradacion de la aceptacion a medida que crece la ventana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los datos facilitados por el autor son mediciones de latencia y de aceptacion, no de calidad.

Latencia en Apple M5 Max (40 nucleos, 48 GB), 11 pares alternos tras tres calentamientos:

| Contexto | Borrador BF16 | Borrador NVFP4 | Ronda completa BF16 | Ronda completa NVFP4 |
|---|---:|---:|---:|---:|
| 128 | 5,62 ms | 3,00 ms | 27,42 ms | 25,17 ms |
| 4K | 6,56 ms | 3,89 ms | 30,07 ms | 27,49 ms |
| 8K | 7,25 ms | 4,71 ms | 32,29 ms | 29,50 ms |
| 16K | 9,32 ms | 6,76 ms | 36,75 ms | 34,43 ms |
| 32K | 13,91 ms | 11,27 ms | 48,76 ms | 46,38 ms |

Evaluacion de calidad declarada por el autor (16 prompts x 96 tokens generados; codigo, matematicas, explicaciones, redaccion, chino y espanol; decodificacion greedy; siete propuestas mas ancla):

| Metrica | BF16 | NVFP4 | Retencion |
|---|---:|---:|---:|
| Propuestas aceptadas medias (64 prefijos coincidentes) | 3,921875 / 7 | 3,859375 / 7 | 98,4 % |
| Secuencias generadas identicas al pipeline BF16 | 16 / 16 | 16 / 16 | 100 % |

El propio autor advierte que estas comparaciones son finitas y cualifican la conversion frente al motor BF16 existente, no la precision general del modelo.

## Requisitos de hardware

- VRAM del borrador: ~0,95 GB en NVFP4 (952.165.546 bytes de safetensors); un borrador BF16 equivalente requeriria aproximadamente el doble.
- Hardware validado: Apple M5 Max de 40 nucleos con 48 GB de memoria unificada.
- Despliegue en DGX Spark (GB10 / sm_121a): las recetas de la comunidad apuntan a cajas de 128 GB de memoria unificada; el modelo objetivo NVFP4 mas el borrador caben holgadamente.
- GPU discretas: no se ha validado en A100, H100, RTX 4090 ni otras. El runtime usado (LMK) es especifico de Apple silicon.
- Opciones de despliegue: LMK (Lithos Metal Kernels), a traves de `python -m monolith.serve` con `--draft LithosAI/Qwen3.6-35B-A3B-DSpark-NVFP4 --draft-quantization nvfp4 --draft-block-size 7`. No es compatible con Transformers estandar, SGLang ni vLLM con los cargadores habituales.
- Latencia: ver tabla de benchmarks (rondas completas de 25,17 ms a 128 tokens de contexto hasta 46,38 ms a 32K en M5 Max).
- Throughput: no disponible para este borrador de forma aislada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Cuantizacion | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| LithosAI/Qwen3.6-35B-A3B-DSpark-NVFP4 | Cabeza borrador DSpark | 888.545.025 | NVFP4 weight-only | safetensors fragmentado | apache-2.0 | HuggingFace |
| Borrador BF16 de referencia (pipeline LMK) | Cabeza borrador DSpark | no disponible | BF16 | no disponible | no disponible | interno del motor de validacion |
| RedHatAI/Qwen3.6-35B-A3B-speculator.dspark | Especulador DSpark | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| nvidia/Qwen3.6-35B-A3B-NVFP4 | Modelo objetivo MoE | ~35B totales, ~3B activos | NVFP4 | safetensors | no disponible | HuggingFace |

No se dispone de datos de rendimiento comparables entre estos modelos mas alla de las mediciones internas del autor frente a su propio borrador BF16.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere el modelo objetivo nvidia/Qwen3.6-35B-A3B-NVFP4 y su tokenizer y plantilla de chat.
- La etiqueta `inference: false` y el diseno del checkpoint implican que no funciona con Transformers estandar, SGLang, vLLM ni otros cargadores DSpark sin adaptaciones.
- Requiere el cargador DSpark de LMK, un runtime con el arreglo de escala tensorial del embedding NVFP4 y el arreglo de compatibilidad de la especializacion de atencion del borrador. Se necesita el commit `3388ea81b3cf77758b285370fa0b8ba814236a3b` mas el parche `lithos-metal-runtime.patch` si el runtime no esta ya actualizado.
- Si la recoleccion del embedding cuantizado omite su escala tensorial, la aceptacion se degrada severamente; el autor advierte que ese escenario no constituye una evaluacion valida del export.
- El autor reconoce diferencias numericas abiertas entre objetivo/HF y entre rutas plana y especulativa en el pipeline experimental de 35B.
- La validacion de rendimiento se limita a un unico entorno (M5 Max, 40 nucleos, 48 GB) y a un fixture de temporizacion repetido; la aceptacion medida no es una estimacion para peticiones arbitrarias.
- Las comparaciones de calidad cubren 16 prompts y 96 tokens generados, un conjunto finito que no mide precision general ni sesgos.
- No hay lista oficial de idiomas soportados ni evaluacion multilingue formal.
- Riesgo de alucinacion: no evaluado en la informacion disponible; al ser una cabeza de propuesta, su salida siempre pasa por la verificacion del objetivo, lo que limita la propagacion de errores.
- Licencia apache-2.0 en los pesos, con avisos adicionales en `WEIGHT_NOTICES.md`; el exportador y el parche de compatibilidad derivan del proyecto LMK, tambien Apache-2.0.

## Enlaces

- HuggingFace: https://huggingface.co/LithosAI/Qwen3.6-35B-A3B-DSpark-NVFP4
- Modelo objetivo: https://huggingface.co/nvidia/Qwen3.6-35B-A3B-NVFP4
- LMK (Lithos Metal Kernels): https://github.com/jiazhihao/mpk-apple
- Instrucciones de build del motor: https://github.com/jiazhihao/mpk-apple/blob/3388ea81b3cf77758b285370fa0b8ba814236a3b/docs/porting.md
- Notas de soporte del modelo Qwen hybrid MoE: https://github.com/jiazhihao/mpk-apple/blob/3388ea81b3cf77758b285370fa0b8ba814236a3b/docs/qwen-hybrid-moe.md
- Especulador DSpark de referencia: https://huggingface.co/RedHatAI/Qwen3.6-35B-A3B-speculator.dspark
- Medicion NVFP4 de Qwen 3.6 35B-A3B en DGX Spark: https://llmrequirements.com/news/2026-06-03-nvfp4-qwen-3-6-35b-dgx-spark
- Receta Qwen3.6 35B NVFP4 en 1x DGX Spark: https://github.com/sojufx/Qwen3.6-35B-NVFP4-DGX-Spark-Recipe
- Guia DGX Spark para Qwen3.6-35B-A3B-NVFP4: https://gist.github.com/jasonacox/5721ffc9b8c55bdb17d26780fed75a7f
- Despliegue con DFlash en DGX Spark: https://github.com/AEON-7/Qwen3.6-35B-A3B-heretic-NVFP4-DFlash
