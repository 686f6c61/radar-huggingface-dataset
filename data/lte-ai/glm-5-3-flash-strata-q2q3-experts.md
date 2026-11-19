# lte-ai/GLM-5.3-Flash-Strata-Q2Q3-Experts

## Resumen

GLM-5.3-Flash-Strata-Q2Q3-Experts es un conjunto de pesos GGUF experimentales derivados de GLM-5.3-Flash (modelo de zai-org) y publicados por el usuario lte-ai. No se trata de un modelo entrenado desde cero, sino de una re-cuantización selectiva de los expertos enrutados de un modelo MoE de gran tamano, empaquetada para ejecutarse en equipos de consumo mediante el fork LightTransport Strata. El objetivo es hacer viable la inferencia local de un modelo de aproximadamente 292.000 millones de parametros totales en maquinas con 64 o 128 GB de RAM y una GPU de 16 GB.

El paquete incluye varias variantes: un modelo completo sin podar (120,9 GB, 288 expertos por capa), una version REAP-224 (95,5 GB, 224 expertos) y una REAP-50 (63,2 GB, 144 expertos). La innovacion principal es la re-cuantizacion de los expertos enrutados (gate/up a Q2_K y down a Q3_K) partiendo directamente de los pesos FP8 oficiales, en lugar de hacerlo desde los expertos de 2 bits de Unsloth, lo que reduce la perplejidad y mejora la fidelidad frente al modelo de referencia.

Es relevante porque demuestra que un MoE de este tamano puede ejecutarse en hardware de consumo con perdidas medibles y documentadas (perplejidad +3,5 % en la variante completa, +16,5 % en REAP-50), ofreciendo numeros concretos de velocidad (19,6 tok/s y 16,1 tok/s respectivamente) y de calidad en HumanEval. La licencia MIT facilita su uso y redistribucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE tipo transformer (GLM-5.3-Flash), con expertos enrutados y decodificacion especulativa MTP |
| Parametros totales | 292.326.211.584 (~292,3 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la model card menciona limites de contexto en la documentacion del fork, sin cifra concreta) |
| Tipos de cuantizacion | Q2_K (gate/up de expertos), Q3_K (down de expertos), base UD-Q2_K_XL de Unsloth, origen FP8 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors como referencia de parametros totales) |

## Arquitectura y entrenamiento

El modelo subyacente, GLM-5.3-Flash, es un transformer con mezcla de expertos (MoE) que enruta cada token hacia un subconjunto de 288 expertos por capa. Esta ficha describe una re-cuantizacion, no un entrenamiento: no se ha realizado ajuste fino ni RLHF/DPO adicional. El proceso parte de los pesos FP8 oficiales de zai-org y de las shards UD-Q2_K_XL de Unsloth, y re-cuantiza cada proyeccion enrutada de las capas 3 a 44 (gate/up a Q2_K, down a Q3_K) en un sidecar de expertos que se ensambla con las shards base.

La innovacion tecnica es doble. Por un lado, la cuantizacion directa desde FP8 evita el error acumulado de cuantizar sobre una cuantizacion previa de 2 bits, lo que segun las mediciones del autor reduce la perplejidad de 4,850 a 4,606 y mejora la concordancia top-1 del 84,7 % al 88,3 %. Por otro, el fork Strata incorpora decodificacion especulativa MTP (multi-token prediction) con profundidad configurable y un parametro de "afinidad de enrutamiento" que relaja la seleccion de expertos para acelerar la decodificacion a costa de calidad. Las variantes REAP aplican poda de expertos (REAP-224 conserva 224 de 288 por capa; REAP-50 conserva 144).

## Capacidades

- Generacion de texto y razonamiento general, heredados de GLM-5.3-Flash.
- Generacion de codigo, con resultados medidos en HumanEval (hasta 156/164 en la variante completa).
- Razonamiento multi-paso y modo "thinking" de bajo razonamiento (la configuracion de evaluacion usa low reasoning).
- Soporte de decodificacion especulativa MTP para acelerar la generacion.
- Ejecucion local en hardware de consumo mediante el fork Strata.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Vision y audio: no disponibles en la informacion proporcionada.

## Casos de uso

- Inferencia local de un MoE de gran tamano en estaciones de trabajo: con 128 GB de RAM y una GPU de 16 GB se puede cargar el modelo completo Q23 (120,9 GB) y generar a unos 19,6 tok/s, adecuado para prototipado y experimentacion sin depender de la nube.
- Generacion de codigo asistida en local: los resultados de HumanEval (155/164 con enrutamiento sin cambios) permiten usar el modelo como asistente de programacion en entornos con requisitos de privacidad, manteniendo el codigo dentro de la maquina.
- Despliegue en equipos de 64 GB: la variante REAP-50 (63,2 GB) cabe en un host de 64 GB con GPU AMD de 16 GB y ofrece 16,1 tok/s, util para laboratorios con hardware modesto.
- Evaluacion de tecnicas de cuantizacion: el paquete incluye metricas de perplejidad, KL y concordancia top-1 frente a FP8, lo que lo convierte en un banco de pruebas para investigar el impacto de Q2_K/Q3_K en MoE.
- Investigacion sobre poda de expertos: las variantes REAP-224 y REAP-50 permiten estudiar el compromiso entre numero de expertos, memoria y calidad con datos reproducibles.
- Servicio de chat con contexto largo: aunque la longitud exacta de contexto no se detalla, el modelo base soporta conversaciones multi-turno y el autor documenta pruebas con prompts de 2.048 tokens.

## Benchmarks y rendimiento

| Pesos | Tamano | Perplejidad (FP8: 4,449) | KL vs FP8 | Concordancia top-1 | Decodificacion | HumanEval |
|---|---:|---:|---:|---:|---:|---:|
| Q23 desde FP8 (por defecto, 128 GB) | 119,9 GB | 4,606 (+3,5 %) | 0,117 | 88,3 % | 19,6 tok/s | 155/164 (enrutamiento sin cambios), 151 (afinidad 0,08) |
| Q23 (primera version) | 120,9 GB | 4,850 (+9,0 %) | 0,212 | 84,7 % | 19,6 tok/s | 154/164, 156 (afinidad 0,08) |
| Unsloth UD-Q2_K_XL tal cual | 108,7 GB | 4,688 (+5,4 %) | 0,144 | 87,5 % | no disponible | no disponible |
| REAP-50 Q23 desde FP8 (por defecto, 64 GB) | 63,2 GB | 5,184 (+16,5 %) | 0,393 | 80,4 % | 16,1 tok/s | 154/164 |
| REAP-50 Q23 (primera version) | 63,2 GB | 5,632 (+26,6 %) | 0,479 | 77,6 % | 15,9 tok/s | 149/164 |

Resultados adicionales de HumanEval en la variante completa Q23 (Threadripper 1950X, 128 GB DDR4-3200, RTX 5060 Ti 16 GB):

| Configuracion | Fecha | Aciertos |
|---|---|---:|
| Q23 completo, enrutamiento sin cambios, MTP profundidad 2 estricta | 2026-10-07 | 156/164 (95,12 %) |
| Q23 completo, enrutamiento sin cambios, MTP profundidad 1 estricta | 2026-10-09 | 154/164 (93,90 %) |
| Q23 completo, afinidad de enrutamiento 0,08, MTP profundidad 1 | 2026-10-09 | 153/164 (93,29 %) |
| REAP-224 Q23, perfil ajustado (RTX 5060 Ti), primera ejecucion | 2026-10-13 | 152/164 (92,68 %) |
| REAP-224 Q23, perfil ajustado, repeticion | 2026-10-13 | 150/164 (91,46 %) |
| REAP-224 Q23, dos GPU (RTX 5060 Ti + RX 9070 XT), afinidad 0,14 | 2026-10-16 | 146/164 (89,02 %) |

## Requisitos de hardware

- VRAM: el modelo esta disenado para GPU de 16 GB (NVIDIA o AMD) con el resto de pesos en RAM del sistema.
- RAM: 128 GB para el modelo completo Q23 (120,9 GB); 64 GB para REAP-50 (63,2 GB); REAP-224 requiere 95,5 GB.
- GPU probadas por el autor: RTX 5060 Ti 16 GB, RX 9070 XT, y combinacion de ambas en configuracion de dos GPU.
- Cabe en GPU de consumo: si, siempre que se combine con RAM suficiente; no cabe integro en una unica GPU de consumo.
- Opciones de despliegue: fork LightTransport Strata (rama `glm53f`); no se documentan vLLM, llama.cpp, Ollama ni TGI para estas variantes.
- Rendimiento medido en Threadripper 1950X con RX 9070 XT: 19,6 tok/s (Q23 completo), 16,1 tok/s (REAP-50), con 512 tokens generados tras un prompt de 2.048 tokens.
- En la variante completa con afinidad 0,08 y MTP profundidad 1 se alcanzan unos 23 tok/s, con la perdida de calidad indicada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad relativa | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-Flash-Strata-Q2Q3-Experts (Q23 desde FP8) | ~292,3 mil millones | no disponible | +3,5 % vs FP8 | MIT | GGUF, Hugging Face |
| GLM-5.3-Flash (FP8 oficial) | ~292,3 mil millones | no disponible | referencia | no disponible | pesos FP8 oficiales |
| Unsloth GLM-5.3-Flash UD-Q2_K_XL | ~292,3 mil millones | no disponible | +5,4 % vs FP8 | no disponible | GGUF |
| GLM-5.3-Flash REAP-50 Q23 | ~292,3 mil millones (144 expertos/capa) | no disponible | +16,5 % vs FP8 | MIT | GGUF |

La comparacion se limita a las variantes del mismo modelo base documentadas por el autor; no se dispone de datos de benchmarks frente a modelos de otros fabricantes.

## Limitaciones y advertencias

- La cuantizacion Q2_K/Q3_K altera los valores de los pesos: no es un reempaquetado sin perdida ni un ajuste fino.
- La variante REAP-50 pierde un 16,5 % de perplejidad frente a FP8 y reduce la concordancia top-1 al 80,4 %; la calidad es notablemente inferior a la del modelo completo.
- El modelo completo Q23 sigue siendo una cuantizacion: su perplejidad es un 3,5 % superior a la del FP8 de referencia.
- La afinidad de enrutamiento y la decodificacion especulativa aceleran la generacion a costa de calidad; los resultados de HumanEval varian entre configuraciones.
- Los benchmarks proceden de una unica maquina (Threadripper 1950X) y configuraciones concretas; no son extrapolables sin validacion.
- Requiere software especifico (fork Strata); no hay soporte documentado en vLLM, llama.cpp u Ollama.
- No se dispone de informacion sobre sesgos, idiomas soportados ni riesgos de alucinacion especificos de esta variante.
- La licencia MIT permite uso comercial, pero el modelo base y las shards de origen pueden tener condiciones adicionales no detalladas en la informacion disponible.
- El repo ocupa 853,2 GB, lo que exige planificacion de almacenamiento antes de la descarga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lte-ai/GLM-5.3-Flash-Strata-Q2Q3-Experts
- Modelo base oficial: https://huggingface.co/zai-org/GLM-5.3-Flash
- Shards GGUF de Unsloth: https://huggingface.co/unsloth/GLM-5.3-Flash-GGUF
- Variante REAP-50 de referencia: https://huggingface.co/patrickbdevaney/GLM-5.3-Flash-REAP50-GGUF
- Fork LightTransport Strata: https://github.com/lighttransport/Strata
- Documentacion de release: https://github.com/lighttransport/Strata/blob/glm53f/docs/GLM53F_RELEASE.md
- Guia de nuevo hardware: https://github.com/lighttransport/Strata/blob/glm53f/docs/GLM53F_NEW_HARDWARE.md
- Referencia FP8: https://github.com/lighttransport/Strata/blob/glm53f/docs/GLM_FP8_REFERENCE.md
