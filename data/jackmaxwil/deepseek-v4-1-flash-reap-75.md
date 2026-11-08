# jackmaxwil/DeepSeek-V4.1-Flash-REAP-75

## Resumen

DeepSeek-V4.1-Flash-REAP-75 es un checkpoint derivado del modelo DeepSeek-V4.1-Flash-1017 de DeepSeek, publicado por el usuario independiente jackmaxwil. Se trata de una poda de expertos enrutados mediante la técnica REAP (Router-weighted Expert Activation Pruning, arXiv:2510.13999): cada capa MoE conserva 96 de sus 384 expertos enrutados originales, lo que supone una reduccion del 75 %. El experto compartido, la atencion, los embeddings y el resto de pesos permanecen intactos, y no se ha reentrenado ningun peso tras la poda.

El modelo base es un transformer con mezcla de expertos (MoE) de 763 000 millones de parametros segun la model card de DeepSeek, del que este checkpoint conserva aproximadamente 355 460 millones de parametros tras eliminar el 75 % de los expertos enrutados. La poda busca reducir el coste de almacenamiento y de inferencia manteniendo el comportamiento del modelo original, aunque los propios datos del autor muestran una degradacion medible en la coincidencia top-1 con el modelo profesor.

Es relevante ahora porque demuestra un flujo de compresion de modelos MoE masivos sin reentrenamiento, verificable mediante checksums y con estadisticas de calibracion publicadas. Sin embargo, el checkpoint no ha sido validado end-to-end para generacion y su rendimiento en dominios fuera del conjunto de calibracion (especialmente en chino) es incierto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), tag `deepseek_v41` |
| Parametros totales | 355 459 961 554 (355,46 B) |
| Parametros activos | 6 expertos enrutados por token (`num_experts_per_tok` = 6) mas experto compartido; numero total de parametros activos no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos de expertos en formato FP4 del modelo base; tag `fp8`; no se detallan otras cuantizaciones |
| Idiomas soportados | no disponible (calibrado solo con texto en ingles y codigo; sin texto chino en calibracion) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es una version podada del DeepSeek-V4.1-Flash-1017, un transformer MoE con 384 expertos enrutados por capa y 6 expertos activos por token en el modelo original. La poda REAP puntua cada experto multiplicando su peso de compuerta del router por la norma de su salida, promediado sobre los tokens enrutados a el, y conserva los 96 mejores por capa. Los pesos del router (matriz y sesgo) se recortan a los expertos supervivientes y estos se renumeran de 0 a 95 en su orden original. El experto compartido, la atencion, los embeddings y el resto de pesos no se modifican.

La calibracion se realizo sobre 2 946 031 tokens (24 sesiones de hasta 16 384 tokens) de texto en ingles y codigo, con peso hacia codificacion agentica, terminal y uso de herramientas. Las fuentes incluyen nvidia/Open-SWE-Traces, nebius/SWE-rebench-V2-PRs, nvidia/Nemotron-Terminal-Corpus, Agent-Ark/Toucan-1.5M, CIRCL/vulnerability-scores, common-pile/stackexchange_filtered, HuggingFaceFW/finepdfs, corbt/enron-emails, allenai/WildChat-4.8M y HuggingFaceFW/finewiki. No se uso texto en chino. No hubo ajuste fino posterior a la poda ni RLHF/DPO adicional.

## Capacidades

- Generacion de texto y codigo, heredadas del modelo base DeepSeek-V4.1-Flash.
- Razonamiento y uso de herramientas: el conjunto de calibracion esta sesgado hacia uso de herramientas, terminal y codificacion agentica, por lo que el modelo conserva mejor estos dominios.
- Soporte de tool calling y function calling: no confirmado de forma explicita en la informacion disponible, aunque el modelo base lo soporta segun su model card.
- Capacidades de agente y razonamiento multi-paso: presumiblemente heredadas del modelo base; no verificadas end-to-end en este checkpoint.
- Capacidades multilingues: no disponibles; la calibracion solo uso ingles y codigo, y el autor advierte de degradacion en chino.
- Ruta de vision: presente en el modelo base (la model card de DeepSeek-V4.1-Flash lo describe como image-text-to-text), pero intacta y no probada en este checkpoint.
- No se documentan modos especiales adicionales (thinking mode, audio) en la informacion disponible.

## Casos de uso

- Autocompletado y generacion de codigo en produccion: el dominio `code-diffs` muestra la mayor coincidencia top-1 (0,889) y el menor KL (0,305) frente al profesor, por lo que es el escenario mas fiable para integrar el modelo en asistentes de codigo o pipelines de CI/CD.
- Automatizacion de tareas de terminal y bash: con una coincidencia top-1 de 0,882 y un cambio de NLL de -0,140 en el dominio `bash`, el modelo es adecuado para agentes que ejecutan comandos y scripts.
- Agentes de codificacion multi-paso: los dominios `agentic-python` y `agentic-rust` muestran coincidencias de 0,635 y 0,625, lo que permite usar el modelo en flujos de resolucion de issues y generacion de parches, asumiendo mayor divergencia respecto al profesor.
- Despliegue con recursos limitados frente al modelo completo: al reducir los parametros a 355 B y el numero de expertos por capa a 96, el checkpoint ocupa menos memoria y requiere menos computo de enrutamiento que el modelo base de 763 B, lo que facilita su alojamiento en infraestructuras con VRAM restringida.
- Investigacion sobre poda de MoE: el checkpoint, junto con el dataset de estadisticas de calibracion y las listas de supervivientes, sirve como material reproducible para estudiar el impacto de REAP en distintos ratios de poda (33, 50, 67 y 75 %).
- Evaluacion comparativa de derivados: permite comparar el comportamiento de distintas variantes podadas (por ejemplo, REAP-50 o REAP-256E de terceros) sobre las mismas trazas de referencia.
- Procesamiento de correo empresarial: el dominio `business-email` presenta una coincidencia de 0,696 y un cambio de NLL de +0,602, aceptable para tareas de borrador y clasificacion con supervision humana.

## Benchmarks y rendimiento

El autor publica una evaluacion sobre un split reservado de las mismas fuentes de calibracion (108 sesiones, 437 350 posiciones puntuadas), comparando el modelo podado con el modelo completo como profesor mediante enmascaramiento del router. No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K).

| Dominio | Posiciones | Coincidencia top-1 | KL(profesor ‖ podado) | Cambio de NLL (nats) |
|---|---:|---:|---:|---:|
| all | 437 350 | 0,720 | 1,349 | -0,131 |
| agentic-python | 63 310 | 0,635 | 2,055 | -0,799 |
| agentic-rust | 49 149 | 0,625 | 2,055 | -0,640 |
| bash | 50 094 | 0,882 | 0,447 | -0,140 |
| business | 32 823 | 0,693 | 0,747 | +0,535 |
| business-email | 15 382 | 0,696 | 1,011 | +0,602 |
| code-diffs | 64 558 | 0,889 | 0,305 | +0,232 |
| cyber | 30 806 | 0,658 | 1,615 | +1,532 |
| english-chat | 15 439 | 0,632 | 0,962 | +0,460 |
| english-prose | 18 873 | 0,757 | 0,968 | +0,719 |
| networking | 32 674 | 0,820 | 0,411 | +0,319 |
| tool-use | 64 242 | 0,587 | 2,807 | -1,378 |

Comparativa entre variantes candidatas en la misma ejecucion:

| Variante | Expertos conservados | Coincidencia top-1 | KL | Cambio de NLL |
|---|---:|---:|---:|---:|
| REAP-33 (no publicada) | 256 / 384 | 0,842 | 0,511 | +0,025 |
| REAP-50 | 192 / 384 | 0,803 | 0,810 | -0,138 |
| REAP-67 (no publicada) | 128 / 384 | 0,755 | 1,114 | -0,109 |
| REAP-75 | 96 / 384 | 0,720 | 1,349 | -0,131 |

Advertencias del autor sobre estas cifras: proceden de enmascaramiento del router dentro del modelo completo, no de la ejecucion end-to-end de este checkpoint exportado, que solo ha sido verificado por checksum. Los cambios negativos de NLL en dominios agenticos y de uso de herramientas no indican mejora del modelo, sino un mejor ajuste a las trazas de referencia escritas por otros modelos. Solo se calibro y evaluo texto; la ruta de vision no se probo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Con 355,46 B de parametros y pesos de expertos en FP4, el almacenamiento minimo de pesos ronda los 180-200 GB, aunque el repositorio ocupa 293,6 GB; se requiere hardware multi-GPU.
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano, se necesitan nodos con varias GPU de datacenter (A100, H100, H200) con memoria agregada suficiente.
- Cabe en GPU de consumo: no. El tamano del modelo supera con creces la VRAM de cualquier GPU consumer individual.
- Opciones de despliegue: transformers (libreria declarada); el autor indica ejecutarlo exactamente como el modelo base, con el directorio `inference/`. Soporte en vLLM, llama.cpp, Ollama o TGI no confirmado.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Expertos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-REAP-75 | 355,46 B | 96 / 384 | no disponible | MIT | Hugging Face (jackmaxwil) |
| DeepSeek-V4.1-Flash (base) | 763 B | 384 / 384 | no disponible | MIT | Hugging Face (deepseek-ai) |
| DeepSeek-V4.1-Flash-REAP-50 | no disponible | 192 / 384 | no disponible | MIT | Hugging Face (jackmaxwil) |
| DeepSeek-V4.1-Flash-REAP-256E | no disponible | 256 / 384 | no disponible | no disponible | Hugging Face (LibertAIDAI) |

## Limitaciones y advertencias

- No hay ajuste fino posterior a la poda: se espera mayor degradacion en dominios fuera de la mezcla de calibracion y, en particular, en chino.
- El checkpoint exportado solo se ha verificado por checksum; no se ha ejecutado end-to-end para generacion, por lo que su comportamiento real puede diferir de las cifras de evaluacion.
- La coincidencia top-1 global es de 0,720 frente al modelo completo; en dominios como `tool-use` (0,587) y `agentic-python` (0,635) la divergencia es considerable.
- Solo se calibro y evaluo texto; la ruta de vision esta intacta pero no se ha probado.
- Riesgo de alucinacion y sesgos: no documentados especificamente para este checkpoint; heredados del modelo base.
- Limitaciones de idioma: la calibracion uso exclusivamente ingles y codigo, sin texto chino.
- Licencia MIT, que permite uso comercial, pero el autor aclara que es un derivado independiente no afiliado ni respaldado por DeepSeek.
- El repositorio no declara idiomas soportados ni longitud de contexto en los metadatos de Hugging Face.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jackmaxwil/DeepSeek-V4.1-Flash-REAP-75
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Modelo base (pagina publica): https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Variante hermana REAP-50: https://huggingface.co/jackmaxwil/DeepSeek-V4.1-Flash-REAP-50
- Estadisticas de calibracion y evaluacion: https://huggingface.co/datasets/jackmaxwil/DeepSeek-V4.1-Flash-REAP-stats
- Variante de terceros REAP-256E: https://huggingface.co/LibertAIDAI/DeepSeek-V4.1-Flash-REAP-256E
- Paper REAP: https://arxiv.org/abs/2510.13999
