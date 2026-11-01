# nightmedia/gemma-4-E4B-Chronos-Finance-q8-hi-mlx

## Resumen

`nightmedia/gemma-4-E4B-Chronos-Finance-q8-hi-mlx` es un modelo derivado de la familia Gemma 4 de Google, publicado por el laboratorio independiente Nightmedia (Montana, EE. UU.). Se trata de un merge de dos linajes: por un lado, `nightmedia/gemma-4-E4B-Chronos`, que a su vez fusiona varios modelos afinados por la comunidad (Fable-Distill, Deckard-Expresso-Universe, Polar-Rev1, F451 y Twain); por otro, `naazimsnh02/FinanceGemma-E4B`, un ajuste orientado a dominio financiero. El resultado es un modelo de 7.941.100.874 parametros en formato MLX cuantizado a 8 bits (variante "q8-hi"), pensado para ejecucion local en hardware Apple Silicon.

El modelo resuelve el problema de disponer de un asistente conversacional con modo de razonamiento ("thinking") y sesgo hacia contenido financiero, empaquetado en un formato listo para `mlx-lm` en Mac. La relevancia actual radica en que combina la licencia Apache 2.0 del ecosistema Gemma con una cuantizacion de 8 bits que reduce el pico de memoria a 15,43 GB manteniendo una perplejidad practicamente identica a la del modelo en bf16 (7,205 frente a 7,205), lo que permite ejecutarlo en equipos de consumo con memoria unificada.

El autor indica explicitamente que el modo "think" esta activado en la plantilla Jinja y que operarlo en modo instruct puro produce resultados suboptimos: el modelo necesita razonar antes de responder. El repositorio ocupa 9,4 GB y acumula 29 descargas en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 4, variante E4B) |
| Parametros totales | 7.941.100.874 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit (q8-hi); el autor documenta tambien mxfp8, qx86-hi, q6-hi, qx64-hi, q4-hi y mxfp4 en la comparativa |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors en formato MLX (libreria `mlx`) |
| Pipeline | any-to-any |
| Tamano del repositorio | 9,4 GB |
| Modelos base | `nightmedia/gemma-4-E4B-Chronos`, `naazimsnh02/FinanceGemma-E4B` |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de la familia Gemma 4 en su variante E4B, con aproximadamente 7,94 mil millones de parametros. El modelo no se ha entrenado desde cero: es el resultado de un merge multipaso realizado con `mergekit`. La cadena de fusion parte de `nightmedia/gemma-4-E4B-Chronos`, que a su vez integra `nightmedia/gemma-4-E4B-Fable-Deckard-Expresso-Universe` (merge de `armand0e/Gemma-4-E4B-it-Fable-Distill` y `DavidAU/gemma-4-E4B-it-The-DECKARD-Expresso-Universe-HERETIC-UNCENSORED-Thinking`), `DavidAU/E4B-Gemma4-Polar-Rev1`, `DavidAU/E4B-Gemma4-F451` y `DavidAU/E4B-Gemma4-Twain-1-2`. Sobre ese linaje se fusiona `naazimsnh02/FinanceGemma-E4B`, un ajuste de dominio financiero.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en los modelos originales; el autor no lo documenta en la model card. La innovacion tecnica destacable es la cuantizacion en 8 bits en formato MLX ("q8-hi"), que segun las mediciones del propio autor mantiene la perplejidad en 7,205 ± 0,065 (identica a bf16) con un pico de memoria de 15,43 GB y 1.227 tokens/s, frente a los 21,91 GB y 1.248 tokens/s del modelo en bf16. La plantilla Jinja incluye modo "think" activado por defecto, lo que obliga al modelo a generar un bloque de razonamiento antes de la respuesta final.

## Capacidades

- Generacion de texto conversacional multi-turno con modo de razonamiento explicito ("thinking") activado en la plantilla Jinja.
- Razonamiento matematico y analitico: el prompt de prueba del autor exige un analisis profundo de mecanica cuantica y teoria cuantica de campos aplicado a la inferencia en transformers, con autoevaluacion reflexiva.
- Conocimiento de dominio financiero heredado de `naazimsnh02/FinanceGemma-E4B`.
- Capacidades creativas y de roleplay heredadas de los linajes Deckard, Fable y Twain (ficcion, personajes, tono narrativo).
- Pipeline declarado `any-to-any`, aunque la model card no detalla que modalidades adicionales soporta mas alla de texto.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: el modo think habilita cadenas de razonamiento, pero no se documenta integracion con frameworks de agentes.
- Capacidades multilingues: no disponibles.
- Capacidades especiales: modo thinking, plantilla Jinja actualizada de Gemma 4, y sesgo de contenido "uncensored" heredado del linaje Deckard.

## Casos de uso

- Analisis financiero asistido en local: el modelo hereda el ajuste de `FinanceGemma-E4B` y puede emplearse para resumir informes, explicar conceptos contables o razonar sobre escenarios de inversion, ejecutandose integramente en un Mac sin enviar datos a la nube.
- Asistente de investigacion con razonamiento visible: el modo think genera un plan y una lista de comprobacion antes de responder, lo que resulta util para tareas analiticas donde el usuario necesita auditar el proceso de razonamiento (por ejemplo, replicar derivaciones matematicas o revisar argumentos).
- Prototipado de narrativa y roleplay: los linajes Fable, Twain y Deckard aportan capacidad de generar ficcion con voz de personaje y tono literario, adecuada para escritura asistida y generacion de dialogos.
- Educacion y divulgacion tecnica: puede explicar conceptos de fisica, matematicas o finanzas con un razonamiento paso a paso, aprovechando la ventana de contexto del modelo base (no documentada en esta ficha pero heredada de Gemma 4 E4B).
- Experimentacion en laboratorio casero: al ocupar 15,43 GB de pico de memoria en q8-hi, cabe en un MacBook Pro de 128 GB de memoria unificada, lo que permite iterar sobre prompts y plantillas sin infraestructura de GPU dedicada.
- Generacion de codigo y scripts auxiliares: aunque no es su especialidad declarada, el modelo base Gemma 4 E4B conserva capacidades de generacion de codigo que pueden aprovecharse para tareas de scripting y automatizacion ligera.
- Evaluacion comparativa de cuantizaciones: el autor publica metricas de perplejidad, memoria y throughput para ocho variantes, lo que convierte al repositorio en un banco de pruebas util para estudiar el impacto de la cuantizacion en modelos de ~8B.

## Benchmarks y rendimiento

El autor publica resultados en el conjunto de tareas tipo "brainwaves" (arc, arc/e, boolq, hswag, obkqa, piqa, wino) comparando cuantizaciones del modelo final, sus componentes y el Gemma 4 E4B-it de referencia.

| Variante | arc | arc/e | boolq | hswag | obkqa | piqa | wino |
|---|---|---|---|---|---|---|---|
| bf16 | 0,575 | 0,793 | 0,816 | 0,705 | 0,450 | 0,779 | 0,676 |
| mxfp8 | 0,577 | 0,791 | 0,810 | 0,705 | 0,454 | 0,780 | 0,669 |
| q8-hi | 0,573 | 0,790 | 0,818 | 0,704 | 0,450 | 0,781 | 0,673 |
| qx86-hi | 0,573 | 0,790 | 0,818 | 0,706 | 0,458 | 0,780 | 0,673 |
| q6-hi | 0,577 | 0,790 | 0,807 | 0,704 | 0,458 | 0,778 | 0,665 |
| qx64-hi | 0,566 | 0,785 | 0,802 | 0,703 | 0,460 | 0,776 | 0,680 |
| q4-hi | 0,555 | 0,758 | 0,831 | 0,694 | 0,438 | 0,782 | 0,676 |
| mxfp4 | 0,537 | 0,750 | 0,844 | 0,680 | 0,392 | 0,769 | 0,645 |

| Cuantizacion | Perplejidad | Pico de memoria | Tokens/s |
|---|---|---|---|
| bf16 | 7,205 ± 0,065 | 21,91 GB | 1.248 |
| mxfp8 | 7,243 ± 0,065 | 14,73 GB | 1.127 |
| q8-hi | 7,205 ± 0,065 | 15,43 GB | 1.227 |
| qx86-hi | 7,215 ± 0,065 | 14,91 GB | 1.180 |
| q6-hi | 7,236 ± 0,065 | 13,56 GB | 1.193 |
| qx64-hi | 7,272 ± 0,065 | 13,22 GB | 1.177 |
| mxfp4 | 8,261 ± 0,076 | 11,00 GB | 1.282 |

Como referencia, el Gemma 4 E4B-it original obtiene en bf16: arc 0,490, arc/e 0,674, boolq 0,793, hswag 0,612, obkqa 0,416, piqa 0,756, wino 0,669. El merge mejora de forma notable en arc (0,575 frente a 0,490) y hswag (0,705 frente a 0,612). El componente `naazimsnh02/FinanceGemma-E4B` solo reporta q8-hi con arc 0,442, arc/e 0,656 y boolq 0,696.

## Requisitos de hardware

- VRAM/pico de memoria en inferencia: 15,43 GB en q8-hi (la variante de este repositorio); 21,91 GB en bf16; 11,00 GB en mxfp4.
- GPU recomendadas: al ser un formato MLX, esta pensado para Apple Silicon (M1/M2/M3/M4 con memoria unificada). El autor lo ejecuta en un MacBook Pro de 128 GB.
- Cabe en GPU de consumo: en el ecosistema Apple, si, en equipos con al menos 16-18 GB de memoria unificada para q8-hi; en el ecosistema NVIDIA no es directamente compatible sin reconvertir los pesos.
- Opciones de despliegue: `mlx-lm` (libreria declarada). No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI para estos pesos concretos.
- Latencia y throughput: 1.227 tokens/s con q8-hi segun las mediciones del autor (entorno Apple Silicon no especificado). El throughput es practicamente identico al de bf16 (1.248 tokens/s).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `nightmedia/gemma-4-E4B-Chronos-Finance-q8-hi-mlx` | 7,94B | no disponible | Apache 2.0 | MLX safetensors 8-bit | Merge orientado a finanzas con modo think |
| `nightmedia/gemma-4-E4B-Chronos` | no disponible | no disponible | Apache 2.0 | MLX | Componente base sin el ajuste financiero |
| `naazimsnh02/FinanceGemma-E4B` | no disponible | no disponible | no disponible | no disponible | Ajuste financiero de origen |
| Gemma 4 E4B-it (Google) | ~8B (familia E4B) | no disponible | Gemma 4 License | safetensors | Modelo de referencia; peor en arc y hswag segun el autor |

## Limitaciones y advertencias

- El modo instruct puro produce resultados suboptimos: el autor advierte que el modelo necesita el bloque de razonamiento ("think") para funcionar como fue disenado.
- Riesgo de alucinacion: como todo modelo de ~8B, puede generar datos financieros, referencias o derivaciones matematicas incorrectas con apariencia de verosimilitud; en dominio financiero esto es especialmente critico.
- Sesgos conocidos: el linaje incluye componentes etiquetados como "uncensored" y "heretic", lo que puede reducir las salvaguardas frente a contenido sensible.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento adecuado fuera del ingles sin evaluacion previa.
- Longitud de contexto no documentada en esta ficha: se desconoce la ventana efectiva del merge.
- Licencia: Apache 2.0 en el repositorio, pero con enlace a la licencia de Gemma 4 de Google; conviene revisar los terminos de uso de Gemma antes de un despliegue comercial.
- Formato MLX: los pesos no son directamente utilizables en stacks NVIDIA (vLLM, TGI) sin conversion.
- Modelo de laboratorio independiente con 29 descargas: no hay validacion externa de los benchmarks publicados.
- El pipeline declarado `any-to-any` no esta justificado con documentacion sobre modalidades adicionales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/nightmedia/gemma-4-E4B-Chronos-Finance-q8-hi-mlx
- Modelo base Chronos: https://huggingface.co/nightmedia/gemma-4-E4B-Chronos
- Modelo base financiero: https://huggingface.co/naazimsnh02/FinanceGemma-E4B
- Componente Fable-Deckard-Expresso-Universe: https://huggingface.co/nightmedia/gemma-4-E4B-Fable-Deckard-Expresso-Universe
- Componente Fable-Distill: https://huggingface.co/armand0e/Gemma-4-E4B-it-Fable-Distill
- Componente Deckard-Expresso-Universe-HERETIC-UNCENSORED-Thinking: https://huggingface.co/DavidAU/gemma-4-E4B-it-The-DECKARD-Expresso-Universe-HERETIC-UNCENSORED-Thinking
- Componente Polar-Rev1: https://huggingface.co/DavidAU/E4B-Gemma4-Polar-Rev1
- Componente F451: https://huggingface.co/DavidAU/E4B-Gemma4-F451
- Componente Twain-1-2: https://huggingface.co/DavidAU/E4B-Gemma4-Twain-1-2
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Libreria MLX: https://github.com/ml-explore/mlx
- mergekit: https://github.com/arcee-ai/mergekit
