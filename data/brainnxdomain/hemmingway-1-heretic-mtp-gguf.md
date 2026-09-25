# brainnxdomain/Hemmingway-1-Heretic-MTP-GGUF

## Resumen

Hemmingway-1-Heretic-MTP-GGUF es una variante decensurada (menor tasa de rechazos) del modelo Altworld/Hemmingway-1, un transformer denso de 27.320.697.856 parametros (unos 27,3B) orientado a escritura creativa y conversacion. La ha producido el usuario brainnxdomain aplicando la rama experimental ARA de la herramienta Heretic sobre el checkpoint original, y se distribuye en formato GGUF para inferencia local con llama.cpp. El repositorio fue creado el 22 de septiembre de 2026 y acumula 2.452 descargas.

El objetivo del autor era reducir la tasa de negativas del modelo base manteniendo su capacidad de escritura y su razonamiento emocional. Para ello se selecciono el ensayo 106 (trial 106) dentro de una busqueda de 200 configuraciones, buscando un compromiso de Pareto entre reduccion de rechazos y fidelidad a la distribucion original. Segun la propia model card, la variante reduce los rechazos internos de 97/100 (punto de divergencia KL cero) a 7/100, con una divergencia KL de 0,0576 respecto al original.

Es importante senalar que este repositorio esta marcado como obsoleto por el propio autor, que recomienda migrar a Hemmingway-1-Heretic-MTP-V3-Final-GGUF. Los builds GGUF incluyen la cabeza MTP (Multi-Token Prediction) original de Hemmingway-1 para decodificacion especulativa opcional en llama.cpp, lo que permite acelerar la generacion sin alterar los pesos principales del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con Grouped-query attention (GQA), atencion linear (gated DeltaNet) y QK-Norm (segun hfviewer para el modelo base); incluye cabeza MTP (Multi-Token Prediction) |
| Parametros totales | 27.320.697.856 (unos 27,3B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M y Q4_K_M (recomendadas en la model card) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (segun la model card del repo GGUF); el modelo base se distribuye como "free for non-commercial use" segun su repositorio de GitHub, discrepancia sin aclarar |
| Formato de pesos | GGUF (los pesos principales derivan del checkpoint safetensors de Altworld/Hemmingway-1) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a un transformer denso de 27,3B parametros con Grouped-query attention (GQA), atencion linear basada en gated DeltaNet (un esquema hibrido que mezcla atencion convencional con atencion linear para reducir el coste en contextos largos) y QK-Norm. El modelo base Hemmingway-1 esta disenado especificamente para escritura y conversacion, no como un modelo generalista de razonamiento. Los builds GGUF incorporan ademas la cabeza MTP (Multi-Token Prediction) del checkpoint original, que habilita decodificacion especulativa opcional en llama.cpp. Esta modificacion no altera los pesos del modelo principal: la cabeza MTP permanece sin cambios respecto a Altworld/Hemmingway-1.

El ajuste de esta variante no es un entrenamiento adicional al uso, sino una intervencion de abliteracion (eliminacion de direcciones de rechazo) realizada con la rama ARA de Heretic. El autor selecciono el trial 106 de un barrido de 200 ensayos, y los pesos principales provienen de ese ensayo. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO sobre el modelo base. Tampoco se detallan innovaciones de decodificacion mas alla de la mencionada cabeza MTP, que se describe como opcional.

## Capacidades

- Generacion de texto orientada a escritura creativa: relatos cortos, dialogo, voz narrativa y descripcion de escenas espaciales.
- Conversacion multi-turno y redaccion de mensajes cotidianos ("escribir un mensaje al casero" sin preambulos ni listas de opciones, segun la descripcion del modelo base).
- Razonamiento emocional (EQ-Bench), evaluado de forma explicita en la model card.
- Reduccion de negativas (comportamiento decensurado), con 7 rechazos de cada 100 en el test interno de Heretic.
- Decodificacion especulativa opcional mediante la cabeza MTP integrada en el mismo archivo GGUF.
- Modo "thinking" (razonamiento) presente pero poco fiable en este checkpoint: con thinking activado el modelo solo produjo respuesta visible en 7 de 12 prompts dentro de un presupuesto de 1.536 tokens.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Capacidades de agente y multi-step reasoning: no documentadas en la informacion disponible.
- Capacidades de vision o audio: no documentadas (el pipeline es text-generation).
- Capacidades multilingues: no disponibles (no se declaran idiomas).

## Casos de uso

- Escritura creativa y ficcion corta: el modelo esta afinado para prosa natural sin preambulos, con una tasa de andamiaje ("wrapper/preamble") de 0/12 en la suite de evaluacion del autor, por lo que resulta util para generar borradores narrativos directamente utilizables.
- Roleplay y narrativa interactiva con menor friccion: la reduccion de rechazos (7/100 frente a 97/100 en el punto de KL cero) lo hace adecuado para escenarios conversacionales donde el modelo base se negaria, siempre que se gestionen externamente los limites de contenido.
- Redaccion de mensajes cotidianos y comunicaciones personales: el modelo base se posiciona explicitamente como generador directo de textos tipo "mensaje al casero", lo que encaja en asistentes de redaccion que evitan el estilo de lista con opciones.
- Experimentos de abliteracion comparada: util para investigadores que quieran contrastar el original frente a un checkpoint modificado por ARA, dado que el autor publica metricas de KL y de rechazos.
- Evaluacion de decodificacion especulativa en local: la cabeza MTP incluida permite medir la ganancia de throughput de la decodificacion especulativa en llama.cpp sin cambiar de modelo.
- Generacion en local con llama.cpp sobre hardware de consumo: al publicarse en GGUF (incluido Q4_K_M), permite ejecutar un modelo de 27B en una sola GPU de 24 GB, un escenario impracticable en BF16.
- Prototipado de asistentes conversacionales sin requisitos estrictos de formato: valido cuando la salida se valida de forma flexible, pero no cuando se exige recuento exacto de palabras o esquemas rigidos (la tasa de cumplimiento de restricciones cae al 33,3% con thinking desactivado).

## Benchmarks y rendimiento

Datos publicados en la model card del autor comparando el modelo original con el trial 106 (esta variante):

| Evaluacion | Original | Trial 106 | Notas |
|---|---|---|---|
| Test de rechazos de Heretic | — | 7/100 | Menos es mejor |
| Divergencia KL respecto al original | 0 | 0,0576 | Menos es mas cercano al original |
| EQ-Bench | 83,1738 ± 1,4451 | 83,5040 ± 1,4298 | Tarea completa de 171 ejemplos; practicamente empatados |
| EQ-Bench parseable | 100% | 100% | 171/171 parseables en ambos |
| HellaSwag (accuracy) | 59% | 59% | Subconjunto diagnostico de 100 ejemplos |
| HellaSwag (accuracy normalizada) | 76% | 76% | Los 100 resultados normalizados coinciden |
| Cumplimiento de restricciones (escritura, thinking off) | 91,7% | 33,3% | Suite emparejada de 12 prompts |
| Longitud media de respuesta (thinking off) | 361,7 palabras | 405,3 palabras | Aproximadamente un 12% mas largo |
| Tasa de bigramas distintos | 93,54% | 92,50% | Suite de escritura creativa |
| Tasa de trigramas repetidos | 0,90% | 1,53% | Suite de escritura creativa |

Contexto adicional: en la misma busqueda de Heretic, el punto de divergencia KL cero produjo 97 rechazos de cada 100. La model card advierte que las metricas de Heretic son metricas de busqueda, no medidas universales de seguridad, inteligencia o disposicion a responder. No se han publicado cifras de MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

Estimaciones a partir del numero de parametros (27,3B); los pesos en BF16 ocuparian unos 55 GB y cada cuantizacion reduce ese tamano de forma aproximada:

- Q4_K_M: en torno a 16-17 GB de VRAM para los pesos; cabe en RTX 4090 / RTX 3090 (24 GB) con margen para contexto moderado.
- Q5_K_M: en torno a 19-20 GB; cabe en GPU de 24 GB, con margen reducido para la cache KV.
- Q6_K: en torno a 22-23 GB; al limite en GPU de 24 GB, recomendable en A100 40 GB o reparto entre dos GPU.
- Q8_0: en torno a 29-30 GB; requiere A100 40 GB, H100, L40S o similar.
- BF16: en torno a 55 GB; requiere A100 80 GB, H100 80 GB o multi-GPU.
- GPU recomendadas por escenario: RTX 4090 / RTX 3090 para cuantizaciones Q4_K_M y Q5_K_M; A100 40 GB o H100 para Q6_K, Q8_0 y BF16.
- Despliegue: llama.cpp con una build reciente que soporte Qwen3.5 y MTP (indicado por el autor). Al estar en GGUF, es compatible con el ecosistema llama.cpp; no se detallan en la informacion disponible integraciones con vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles. La decodificacion especulativa via MTP es opcional y puede reducir el tiempo por token, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Rechazos / calidad | Licencia | Estado |
|---|---|---|---|---|---|---|
| Hemmingway-1-Heretic-MTP-GGUF (trial 106, este repo) | 27,3B | no disponible | Decensurado (ARA / Heretic), escritura | 7/100 rechazos; EQ-Bench 83,50; cumplimiento de restricciones 33,3% | apache-2.0 | Obsoleto (sustituido por V3) |
| Hemmingway-1-Heretic-MTP-GGUF-V2 (trial 208) | 27,3B (base equivalente) | no disponible | Decensurado con Heretic tradicional y busqueda warm-started | Mejor que V1 en todas las medidas segun el autor (sin cifras concretas) | apache-2.0 | Disponible |
| Hemmingway-1-Heretic-MTP-V3-Final-GGUF | 27,3B (base equivalente) | no disponible | Decensurado, thinking activo | 2/100 rechazos; KL 0,0164; cumplimiento de restricciones 75% | apache-2.0 | Recomendado por el autor |
| Altworld/Hemmingway-1 (base) | 27,3B | no disponible | Escritura y conversacion sin decensurar | EQ-Bench 83,17; cumplimiento de restricciones 91,7%; 97/100 rechazos en el punto KL 0 | "free for non-commercial use" segun GitHub | Disponible |

## Limitaciones y advertencias

- Repositorio obsoleto: el autor lo marca como deprecado y recomienda usar Hemmingway-1-Heretic-MTP-V3-Final-GGUF.
- Regresion en el cumplimiento de formato: la tasa de exito en restricciones estrictas de longitud y formato cae del 91,7% (original) al 33,3% (esta variante) con thinking desactivado. No es adecuado para salidas con recuentos de palabras o esquemas rigidos.
- Modo thinking poco fiable: con thinking activado solo genera respuesta visible en 7 de 12 prompts; se recomienda inferencia con thinking desactivado. Con presupuestos pequenos de tokens de razonamiento, el modelo puede consumir el limite sin llegar a la respuesta final.
- Respuestas mas largas: aproximadamente un 12% mas largas de media (405,3 frente a 361,7 palabras), lo que complica el control de longitud.
- Divergencia respecto al original: la KL de 0,0576 implica cambios en la distribucion de salida; no es un upgrade general, sino un compromiso de Pareto.
- Riesgo de alucinacion y sesgos: no documentado en la informacion disponible; se trata de un modelo de escritura, no de un modelo verificado factualmente, por lo que la verificacion externa de hechos es responsabilidad del integrador.
- Restricciones de licencia: la model card del repo GGUF declara apache-2.0, pero el repositorio de GitHub del modelo base indica uso gratuito solo no comercial. Esta discrepancia no esta aclarada y supone un riesgo para despliegues comerciales; conviene verificar la licencia del modelo base antes de su uso en produccion.
- Idioma y cobertura linguistica: no se declaran idiomas soportados; no hay garantias de rendimiento fuera del ingles.
- Metricas de Heretic: los propios autores advierten que las cifras de rechazos y KL son metricas de busqueda, no medidas universales de seguridad o capacidad.
- Despliegue restringido: requiere una build reciente de llama.cpp con soporte de Qwen3.5 y MTP; otras herramientas de inferencia (vLLM, TGI, Ollama) no estan documentadas para este checkpoint.

## Enlaces

- Repositorio HuggingFace (este modelo): https://huggingface.co/brainnxdomain/Hemmingway-1-Heretic-MTP-GGUF
- Version V2 (trial 208): https://huggingface.co/brainnxdomain/Hemmingway-1-Heretic-MTP-GGUF-V2
- Version V3 recomendada: https://huggingface.co/brainnxdomain/Hemmingway-1-Heretic-MTP-V3-Final-GGUF
- Modelo base Altworld/Hemmingway-1: https://huggingface.co/Altworld/Hemmingway-1
- Grafo de arquitectura del modelo base (hfviewer): https://hfviewer.com/Altworld/Hemmingway-1
- Model card oficial de Hemmingway-1: https://hemmingway.io/model/
- Repositorio GitHub de Hemmingway-1: https://github.com/lukeckprobierts/Hemmingway-1
- Herramienta Heretic: https://github.com/p-e-w/heretic
- llama.cpp: https://github.com/ggml-org/llama.cpp
