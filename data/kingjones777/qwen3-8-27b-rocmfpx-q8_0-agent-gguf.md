# kingjones777/Qwen3.8-27B-ROCmFPX-Q8_0-AGENT-GGUF

## Resumen

`Qwen3.8-27B-ROCmFPX-Q8_0-AGENT-GGUF` es una cuantizacion GGUF del modelo MoE `Qwen/Qwen3.8-27B` (desarrollado por Alibaba Qwen), preparada por el usuario `kingjones777` para ejecutarse exclusivamente en hardware AMD con arquitectura `gfx1151` (Ryzen AI MAX+ 395 / Strix Halo). La particularidad de este fichero es que utiliza un tipo de cuantizacion propietario llamado `Q8_0_ROCMFPX_AGENT`, que solo existe en el fork de llama.cpp [`charlie12345/ROCmFPX`](https://github.com/charlie12345/ROCmFPX) y no en el llama.cpp oficial.

La variante `_AGENT` esta disenada para mejorar el rendimiento de la decodificacion especulativa (MTP, multi-token prediction) al mantener 13 de los 17 tensores `output.weight` en Q8_0 puro en lugar de usar la representacion ROCmFPX en todos ellos. Segun las mediciones del autor, esto eleva la tasa de aceptacion de tokens especulados de 0.911 a 0.953 y produce un 6,2% mas de velocidad de decodificacion cuando se usa MTP (26.62 tok/s frente a 25.07 tok/s de la variante sin AGENT). Sin MTP, no hay diferencia medible entre ambas versiones.

El modelo base Qwen3.8-27B es un transformer de mezcla de expertos con 26.895.998.464 parametros totales (~26,9B) y una ventana de contexto de 131.072 tokens. Esta cuantizacion pesa 26,28 GiB (8,39 bpw) y hereda la licencia Apache-2.0 del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture of Experts) - Qwen3.8-27B |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no disponible (la nomenclatura del modelo base sugiere 3,8B activos) |
| Longitud de contexto | 131.072 tokens (soportado, no verificado en esta cuantizacion) |
| Tipos de cuantizacion | Q8_0_ROCMFPX_AGENT (ftype 115, 8,39 bpw) - unico fichero en el repo |
| Idiomas soportados | en (declarado en la model card; el modelo base soporta mas idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (fichero `Qwen3.8-27B-Q8_0_ROCMFPX_AGENT.gguf`, 26,2767 GiB) |

## Arquitectura y entrenamiento

Este fichero no es un modelo entrenado desde cero, sino una cuantizacion del modelo `Qwen/Qwen3.8-27B` de Alibaba, convertida a formato GGUF y re-cuantizada con el tipo propietario `ROCmFPX`. El modelo base es un transformer de mezcla de expertos (MoE) con 26,9B parametros totales y, segun la nomenclatura del nombre, 3,8B parametros activos por token. No se dispone en la informacion proporcionada de detalles sobre el dataset de entrenamiento, el numero de tokens vistos ni el proceso de alineacion (RLHF/DPO) del modelo original.

La innovacion de esta cuantizacion reside en el tipo `Q8_0_ROCMFPX_AGENT`, una variante del formato `ROCmFPX` (desarrollado por `charlie12345` para optimizar la inferencia en GPUs AMD RDNA4 y APUs Strix Halo). La diferencia estructural con la version `Q8_0_ROCMFPX` plana es la distribucion de tipos en el grupo de 17 tensores `*output.weight`: la variante AGENT mantiene 13 de ellos en Q8_0 puro y solo 4 en ROCmFPX, mientras que la version plana usa 1 en Q8_0 y 16 en ROCmFPX. Esta eleccion incrementa el tamano del fichero en 0,35 GiB pero mejora la tasa de aceptacion del modelo de draft en la decodificacion especulativa MTP, lo que se traduce en mayor velocidad de generacion cuando se usa esa tecnica.

## Capacidades

- Generacion de texto y razonamiento basico: el autor verifico respuestas correctas a preguntas factuales simples (17x23=391, capital de Japon, dias en 2024).
- Tool calling / function calling: el modelo supera 7/7 pruebas en modo thinking y 7/7 en modo non-thinking, cubriendo llamadas con multiples argumentos, objetos anidados, enums, rechazos de llamada, conversaciones multi-turno, streaming y llamadas paralelas.
- Soporte de agentes: gracias a la solidez en tool calling, puede integrarse en pipelines de agentes autonomos que necesitan invocar funciones externas de forma fiable.
- Decodificacion especulativa MTP: compatible con el mecanismo `--spec-type draft-mtp` del fork ROCmFPX, que acelera la generacion usando un modelo draft Q4_0.
- Capacidades multilingues: la model card declara solo ingles, aunque el modelo base Qwen3.8-27B es multilingue por defecto.
- Sin capacidades de vision, audio ni modo thinking explicito (el modelo base Qwen3 soporta thinking, pero esta cuantizacion no documenta su comportamiento en ese modo mas alla de las pruebas de herramientas).

## Casos de uso

- Asistente local en portatiles con AMD Ryzen AI MAX+ 395: esta cuantizacion esta optimizada para la iGPU `gfx1151` de las APUs Strix Halo, permitiendo ejecutar un modelo de 27B con 8,39 bpw en memoria unificada a velocidades de 26 tok/s con MTP, sin necesidad de GPU discreta.
- Agente autonomo con tool calling en entornos locales: el modelo supera las 7 pruebas de herramientas, por lo que puede gestionar llamadas a APIs, bases de datos o servicios externos de forma fiable en un despliegue local con privacidad total.
- Servidor de inferencia para aplicaciones de productividad: usando `llama-server` del fork ROCmFPX, se puede exponer un endpoint compatible con OpenAI para integrar el modelo en aplicaciones de chat, redaccion o analisis de texto.
- Generacion de codigo asistida en entornos sin conexion: aunque no se han publicado benchmarks de codigo, el modelo base Qwen3 es competente en esta tarea y la cuantizacion mantiene la precision en las capas de atencion, lo que la hace adecuada para autocompletado o revision de codigo en equipos AMD.
- Investigacion y experimentacion con decodificacion especulativa: la variante AGENT demuestra que la distribucion de tipos de cuantizacion en tensores criticos afecta a la tasa de aceptacion de MTP, por lo que puede usarse como banco de pruebas para estudiar el impacto de la precision en la especulacion.
- Despliegue de chatbots con contexto largo: con 131.072 tokens de ventana soportados, puede manejar conversaciones extensas o documentos largos, aunque no se ha verificado el comportamiento en contexto largo en esta cuantizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor incluye unicamente mediciones propias de velocidad de decodificacion y tasa de aceptacion de MTP en hardware AMD Ryzen AI MAX+ 395 (gfx1151, ROCm 7.2.4), con mediana de 3 ejecuciones, descartando warm-up, en sistema idle y con flags especificos (`--spec-type draft-mtp`, modelo draft Q4_0, `--spec-draft-n-max 4`):

| Variante | Tamano | Decodificacion con MTP | Rango | Tasa de aceptacion de draft |
|---|---|---|---|---|
| Q8_0_ROCMFPX (plano) | 25,92 GiB | 25,07 tok/s | [25,07 - 25,51] | 0,911 |
| Q8_0_ROCMFPX_AGENT (este modelo) | 26,28 GiB | 26,62 tok/s | [26,61 - 27,15] | 0,953 |
| Q4_0_ROCMFP4_STRIX (4-bit) | 14 GiB | 38,32 tok/s | [37,91 - 38,61] | 1,000 |

Sin MTP, la variante AGENT rinde 7,92 tok/s frente a 7,82 tok/s de la plana (diferencia marginalmente inferior). El autor indica explicitamente que no se midieron perplexity, calidad A/B contra BF16 ni benchmarks de razonamiento o codigo.

## Requisitos de hardware

- GPU/APU obligatoria: AMD con arquitectura `gfx1151` (Ryzen AI MAX+ 395 / Strix Halo). El tipo de cuantizacion ROCmFPX no esta soportado en hardware de otras marcas ni en GPUs AMD de generaciones anteriores.
- VRAM: el fichero pesa 26,28 GiB, por lo que se necesita al menos 28-32 GiB de memoria disponible. En las APUs Strix Halo, la memoria unificada (hasta 96 GB) es suficiente.
- Software: fork `charlie12345/ROCmFPX` de llama.cpp (no compatible con el llama.cpp oficial). ROCm 7.2.4 o superior recomendado.
- Opciones de despliegue: `llama-server` con flags como `--spec-type draft-mtp`, `--model-draft mtp-Qwen3.8-27B-Q4_0.gguf`, `--spec-draft-ngl 99`, `--spec-draft-n-max 4`, `-ngl 999`, `-fa on`, `--ctx-size 32768`.
- Latencia y throughput: 26,62 tok/s con MTP y 7,92 tok/s sin MTP en el hardware de referencia. La variante 4-bit alcanza 38,32 tok/s con MTP.

## Comparativa con modelos similares

La comparativa mas relevante es entre las variantes de cuantizacion del mismo modelo base publicadas por el mismo autor, ya que no se dispone de datos de rendimiento frente a otros modelos:

| Modelo / variante | Parametros | Contexto | Licencia | Velocidad (con MTP) | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (BF16) | 26,9B | 131.072 | Apache-2.0 | no medido | Modelo base, 51,3 GiB |
| Q8_0_ROCMFPX (plano) | 26,9B | 131.072 | Apache-2.0 | 25,07 tok/s | 25,92 GiB, sin ventaja AGENT |
| Q8_0_ROCMFPX_AGENT (este) | 26,9B | 131.072 | Apache-2.0 | 26,62 tok/s | 26,28 GiB, mejor aceptacion MTP |
| Q4_0_ROCMFP4_STRIX | 26,9B | 131.072 | Apache-2.0 | 38,32 tok/s | 14 GiB, mayor throughput |

No se dispone de comparativas con otros modelos MoE de tamano similar (por ejemplo, Qwen3-30B-A3B o DeepSeek-V3-Lite) en la informacion proporcionada.

## Limitaciones y advertencias

- Requiere un fork no oficial de llama.cpp (`charlie12345/ROCmFPX`); el llama.cpp estandar no cargara este fichero.
- Solo funciona en hardware AMD `gfx1151` (Ryzen AI MAX+ 395 / Strix Halo). No es portable a GPUs NVIDIA, Intel ni otras APUs AMD.
- No se han medido perplexity, calidad de salida frente al modelo BF16, ni benchmarks de razonamiento, codigo o matematicas. La equivalencia funcional con otras variantes solo se ha comprobado con una suite de 7 casos de tool calling, que el propio autor reconoce como insuficiente para demostrar equivalencia completa.
- No se ha probado el comportamiento en contexto largo (131.072 tokens soportados pero no verificados).
- Sin MTP, esta variante es ligeramente mas lenta que la version plana (7,92 vs 7,82 tok/s), por lo que solo tiene sentido si se usa decodificacion especulativa.
- La model card declara solo ingles; aunque el modelo base es multilingue, no se ha verificado el comportamiento en otros idiomas.
- El autor no ha realizado pruebas de sesgos, alucinacion ni robustez ante entradas adversariales.
- La licencia Apache-2.0 permite uso comercial, pero el fork ROCmFPX y la cuantizacion propietaria pueden tener restricciones adicionales no documentadas.

## Enlaces

- Repositorio HuggingFace: [kingjones777/Qwen3.8-27B-ROCmFPX-Q8_0-AGENT-GGUF](https://huggingface.co/kingjones777/Qwen3.8-27B-ROCmFPX-Q8_0-AGENT-GGUF)
- Modelo base: [Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- Fork de llama.cpp con soporte ROCmFPX: [charlie12345/ROCmFPX](https://github.com/charlie12345/ROCmFPX)
