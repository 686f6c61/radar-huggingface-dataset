# kusuriya-labs/Hy4-flash-DFly-EXL3-INT8-4bpw

## Resumen

Hy4-flash-DFly-EXL3-INT8-4bpw es una derivacion cuantizada y modificada del modelo base `tencent/Hy4-flash`, publicada por el usuario `kusuriya-labs`. No se trata de un modelo de lenguaje autonomo, sino de un *drafter* de decodificacion especulativa (DFly2) que debe combinarse con el modelo objetivo cuantizado del mismo autor (`kusuriya-labs/Hy4-flash-EXL3-INT8-4bpw`). Su funcion es proponer tokens candidatos que el modelo principal verifica, acelerando la generacion sin alterar la distribucion de salida.

El artefacto tiene 212.214.049 parametros reales segun los safetensors del repositorio y un peso de aproximadamente 406 MiB (0,4 GB de repo). La cuantizacion es EXL3-INT8 a 4 bits por peso (4 bpw), con los tensores no cuantizables conservados en su precision original. La conversion se realizo con la herramienta `tools/hy4_flash` del proyecto `rocm_exl3_forme`.

Es relevante porque documenta un caso practico de aceleracion por decodificacion especulativa sobre hardware AMD (ROCm), con metricas de throughput medidas en una configuracion EP=3 (R9700 + V620 x 2). Sin embargo, su adopcion esta condicionada: requiere un fork no fusionado del *shelf* de Hy4-flash y no es cargable con Transformers estandar, lo que lo situa en una fase experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | drafter de decodificacion especulativa DFly2 sobre el modelo base tencent/Hy4-flash (arquitectura del transformer base no disponible en la informacion proporcionada) |
| Parametros totales | 212.214.049 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3-INT8 a 4 bpw; tensores no cuantizables en precision original |
| Idiomas soportados | no disponible |
| Licencia | Tencent Hy License 1.0 (identificador `other`, `tencent-hy-license`) |
| Formato de pesos | safetensors (EXL3) |
| Tokens especulativos | 5 |
| Capas objetivo (target layers) | 25, 29, 33, 37, 41 |
| Revision del modelo base | d88c9dfd96ba4f2e6b92adba0b8e8f1c8696f959 |
| Tamano del repo | 0,4 GB (aprox. 406 MiB) |
| Herramienta de conversion | `rocm_exl3_forme`, `tools/hy4_flash` |

## Arquitectura y entrenamiento

El modelo es un *drafter* de decodificacion especulativa basado en DFly2, disenado para operar junto al modelo objetivo Hy4-flash cuantizado. En decodificacion especulativa, el drafter genera de forma barata una secuencia corta de tokens candidatos (aqui 5 tokens especulativos) que el modelo principal verifica en paralelo; los tokens aceptados se conservan y los rechazados se corrigen. El drafter extrae informacion de las capas 25, 29, 33, 37 y 41 del modelo objetivo, lo que condiciona su arquitectura al modelo base y explica que no pueda funcionar de forma aislada.

No se ha realizado entrenamiento desde cero: la operacion es una cuantizacion post-entrenamiento a EXL3-INT8 4 bpw. La calibracion del drafter empleo 128 filas y 16 anchors, usando el corpus mixto estandar incluido en EXL3 (c4, code, multilingual, technical, wiki, tiny y tokens aleatorios) con 128 filas de 1024 tokens. Los detalles completos estan en el `conversion_report.json` del repositorio. No se dispone de informacion sobre el volumen de datos de preentrenamiento del modelo base, la composicion de su dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Aceleracion de inferencia mediante decodificacion especulativa: propone hasta 5 tokens candidatos por paso que el modelo objetivo verifica.
- Generacion de texto delegada: hereda las capacidades del modelo base `tencent/Hy4-flash`, si bien la model card no detalla cuales son.
- Integracion con el modelo objetivo cuantizado `kusuriya-labs/Hy4-flash-EXL3-INT8-4bpw`, con el que forma un par obligatorio.
- Soporte de tool calling, agentes, vision o audio: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el corpus de calibracion incluye datos multilingual, pero no se especifican los idiomas cubiertos.
- Modo thinking: no disponible.
- No es utilizable como modelo autonomo: no responde a prompts por si mismo.

## Casos de uso

- Aceleracion de inferencia en produccion sobre AMD: desplegar el par drafter + modelo objetivo en GPUs Radeon/Instinct con ROCm para reducir la latencia de decodificacion en servicios de generacion de texto, aprovechando el throughput medido de 50,65 tok/s en decode fijo.
- Servicios de chat de baja latencia: el benchmark BetterBench chat reporta 12,31 tok/s con una media de 1,78 tokens aceptados por paso, adecuado para asistentes conversacionales donde la latencia percibida importa.
- Generacion de codigo interactiva: con 14,22 tok/s en BetterBench code y 1,98 tokens aceptados de media, encaja en autocompletado o asistencia de codigo en IDE sobre hardware AMD.
- Evaluacion de tecnicas de decodificacion especulativa: sirve como referencia reproducible para investigadores que comparan DFly2 con otras variantes de *speculative decoding* bajo cuantizacion EXL3.
- Investigacion sobre cuantizacion EXL3-INT8: el par de modelos permite estudiar el impacto de 4 bpw en la tasa de aceptacion del drafter y en la calidad final.
- Despliegue en entornos con VRAM limitada: el drafter ocupa solo unos 406 MiB, por lo que el coste adicional de memoria sobre el modelo objetivo es minimo en configuraciones multi-GPU.
- Pruebas de integracion en pipelines ROCm: util para validar el fork del shelf de Hy4-flash antes de su fusion upstream.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| Decode (texto fijo en ingles) | 50,65 tok/s | 2048 tokens, temperatura 0, 1 entrada, EP=3 (R9700 + V620 x 2) |
| BetterBench code | 14,22 tok/s | misma configuracion |
| BetterBench chat | 12,31 tok/s | misma configuracion |
| Tokens aceptados medios (code) | 1,98 | misma configuracion |
| Tokens aceptados medios (chat) | 1,78 | misma configuracion |
| PPL | no evaluado | segun la model card |
| Benchmarks de calidad | no evaluado | segun la model card |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de calidad en la informacion disponible.

## Requisitos de hardware

- VRAM del drafter: aproximadamente 406 MiB en 4 bpw, adicionales a la memoria del modelo objetivo.
- VRAM total: depende del modelo objetivo Hy4-flash cuantizado a 4 bpw; no disponible el dato exacto en la informacion proporcionada.
- GPU probadas: AMD Radeon R9700 y AMD V620 (2 unidades), en configuracion EP=3.
- Compatibilidad con GPU NVIDIA: no confirmada; la conversion y el runtime estan orientados a ROCm (`rocm_exl3_forme`).
- GPU de consumo: no se especifica compatibilidad con RTX 4090 u otras; el stack EXL3/ROCm del autor no documenta soporte.
- Software de despliegue: requiere un fork no fusionado del shelf de Hy4-flash (PR en preparacion). No es cargable con Transformers estandar. No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI.
- Throughput: 50,65 tok/s en decode de texto fijo; 14,22 tok/s en code y 12,31 tok/s en chat segun BetterBench.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kusuriya-labs/Hy4-flash-DFly-EXL3-INT8-4bpw (este) | 212.214.049 (drafter) | no disponible | EXL3-INT8 4 bpw | Tencent Hy License 1.0 | requiere fork no fusionado |
| kusuriya-labs/Hy4-flash-EXL3-INT8-4bpw | no disponible | no disponible | EXL3-INT8 4 bpw | Tencent Hy License 1.0 | modelo objetivo del par |
| tencent/Hy4-flash | no disponible | no disponible | original | Tencent Hy License 1.0 | modelo base oficial |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la informacion proporcionada, por lo que no es posible una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- No es un modelo autonomo: sin el modelo objetivo `kusuriya-labs/Hy4-flash-EXL3-INT8-4bpw` no genera texto util.
- Dependencia de software fragil: exige un fork no fusionado del shelf de Hy4-flash; Transformers estandar no puede cargarlo. Riesgo de rotura ante cambios upstream.
- Sin evaluacion de calidad: PPL y benchmarks de calidad no han sido medidos, por lo que se desconoce la degradacion introducida por la cuantizacion a 4 bpw.
- Metricas limitadas: los resultados de throughput provienen de una unica configuracion de hardware (EP=3, R9700 + V620 x 2) y de pruebas con texto fijo en ingles a temperatura 0; no son extrapolables a otros entornos.
- Idiomas no documentados: la model card no especifica los idiomas soportados por el modelo base.
- Licencia restrictiva: Tencent Hy License 1.0 no equivale a Apache 2.0. La seccion 10 impone condiciones comerciales adicionales a negocios MaaS con ingresos anuales superiores a 50 millones de USD o mas de 100 millones de usuarios activos mensuales; la seccion 10.3 excluye el uso interno que no distribuya el modelo ni sus salidas a terceros. Es obligatorio incluir la licencia, indicar modificaciones y mantener las atribuciones en la redistribucion.
- Riesgo de alucinacion: no evaluado en la informacion disponible; heredado del modelo base y potencialmente afectado por la cuantizacion.
- Sesgos: no documentados.
- Madurez: repositorio con 0 descargas y 0 likes, creado y actualizado el mismo dia (19 de noviembre de 2026), sin validacion de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kusuriya-labs/Hy4-flash-DFly-EXL3-INT8-4bpw
- Modelo objetivo del par: https://huggingface.co/kusuriya-labs/Hy4-flash-EXL3-INT8-4bpw
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Licencia del modelo base: https://huggingface.co/tencent/Hy4-flash/blob/main/LICENSE
- Herramienta de conversion: `rocm_exl3_forme` (repositorio no enlazado en la informacion proporcionada)
- Informe de conversion: `conversion_report.json` (incluido en el repositorio del modelo)
