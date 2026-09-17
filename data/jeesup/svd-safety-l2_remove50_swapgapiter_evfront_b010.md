# Jeesup/svd-safety-l2_remove50_swapgapiter_evfront_b010

## Resumen

`Jeesup/svd-safety-l2_remove50_swapgapiter_evfront_b010` es un checkpoint derivado de `meta-llama/Llama-2-7b-chat-hf` al que se le ha aplicado una compresion SVD-LLM que elimina el 50,01% de los parametros densos y, despues, un proceso de reparacion de 10 rondas iterativas de intercambio de parametros neutrales ("parameter-neutral swap") seleccionados por la regla `gap_iter`, con un presupuesto de restauracion del 1,000% de los parametros densos (64.722.432 parametros intercambiados, 6.927 componentes restaurados y 5.807 sustituidos). El resultado declarado es una fraccion de parametros densos de 0,4999 respecto al modelo original.

El modelo no es un asistente conversacional de proposito general, sino un artefacto de investigacion. Pertenece a un estudio sobre como la compresion por SVD degrada el comportamiento de seguridad de un LLM y que regla de seleccion de componentes repara mejor ese dano; esta celda concreta es una de las combinaciones (regla de seleccion x presupuesto) de una rejilla experimental. El propio autor advierte que varias celdas de la rejilla estan "deliberadamente degradadas en seguridad" respecto a Llama-2-7b-chat y que la compresion por si sola eleva la tasa de exito de ataque.

La relevancia es metodologica: proporciona mediciones cuantitativas del compromiso entre seguridad y utilidad bajo compresion (ASR en AdvBench y StrongREJECT, sobre-rechazo macro en WildGuard y perplejidad en WikiText-2), lo que lo hace util para investigacion en interpretabilidad, alineamiento y compresion eficiente, no para despliegue en produccion. El repositorio tiene 0 descargas y 0 likes, y la busqueda web realizada no ha devuelto ningun resultado relacionado con el modelo (solo foros no pertinentes).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 2) con compresion SVD-LLM aplicada a las matrices de proyeccion |
| Parametros totales | 6.738.415.616 segun los metadatos de safetensors; el autor declara una fraccion de parametros densos resultante de 0,4999 y un 50,01% de parametros eliminados (la diferencia entre ambas cifras no se explica en la model card) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card; heredada de la configuracion del modelo base |
| Tipos de cuantizacion | No disponible: el repositorio solo publica pesos en safetensors; no se ofrecen variantes GGUF, AWQ, GPTQ ni bitsandbytes |
| Idiomas soportados | No disponible en la model card (el modelo base esta orientado principalmente al ingles) |
| Licencia | Llama 2 Community License (incluye `LICENSE.txt` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | safetensors (libreria `transformers`) |

Datos adicionales de procedencia: semilla 42, 10 de 10 rondas iterativas aplicadas, chunk por ronda del 0,100% de los parametros densos, valor de intercambio `insert` (solo valor de insercion, con expulsion ordenada por sigma), tamano del repositorio 13,5 GB.

## Arquitectura y entrenamiento

La arquitectura de partida es la de Llama-2-7b-chat: un transformer decoder-only con normalizacion RMSNorm, activacion SwiGLU, RoPE y atencion causal con Grouped-Query Attention. Sobre ese checkpoint no se reentrena nada: se aplica SVD-LLM, una tecnica de compresion post-entrenamiento que descompone las matrices de proyeccion en factores de rango reducido y descarta componentes de bajo valor singular, eliminando el 50,01% de los parametros densos.

La innovacion especifica de este checkpoint es la fase de reparacion posterior. Tras la compresion, el autor ejecuta 10 rondas iterativas de intercambio de parametros "neutral" (sin actualizacion por gradiente) guiadas por la regla de seleccion `gap_iter`, con un chunk del 0,1% de los parametros densos por ronda y un presupuesto total del 1,0%. En total se intercambian 64.722.432 parametros (1,00% de los parametros de proyeccion densos), restaurando 6.927 componentes y expulsando 5.807, con valor de intercambio `insert` y expulsion ordenada por sigma. No se documenta en la informacion disponible ninguna fase de RLHF, DPO o ajuste supervisado adicional, ni la composicion del dataset de entrenamiento original (mas alla de la heredada de Llama 2).

## Capacidades

- Generacion de texto conversacional en la linea del modelo base Llama-2-7b-chat, evaluada con perplejidad de 13,9334 en WikiText-2.
- Razonamiento y codigo: no hay evaluacion publicada en la model card (ni MMLU, ni HumanEval, ni GSM8K), por lo que no puede afirmarse su nivel en estas tareas.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas.
- Capacidades especiales: ninguna (sin modo thinking, sin vision, sin audio).
- Comportamiento de seguridad medido: ASR de 0,0654 en AdvBench y 0,0863 en StrongREJECT, ambos con juez HarmBench; sobre-rechazo macro de 0,2512 medido con WildGuard.
- Uso previsto: servir como sujeto experimental para medir el compromiso seguridad/utilidad bajo compresion SVD y para comparar reglas de seleccion de componentes dentro de una rejilla de experimentos.

## Casos de uso

- Investigacion en compresion de LLM: reproducir la celda `gap_iter` con presupuesto del 1,0% y comparar su perplejidad (13,9334 en WikiText-2) frente a otras celdas de la misma rejilla para aislar el efecto de la regla de seleccion.
- Estudio del dano en seguridad inducido por compresion: usar los valores de ASR en AdvBench (0,0654) y StrongREJECT (0,0863) como linea base cuantitativa frente al modelo sin comprimir y frente a otros presupuestos de restauracion.
- Evaluacion de sobre-rechazo: emplear la metrica macro de WildGuard (0,2512) para analizar si la reparacion de seguridad penaliza la utilidad conversacional y en que magnitud.
- Red-teaming y pipelines de evaluacion de jailbreaks: integrar el checkpoint como sujeto de prueba en baterias automatizadas que midan tasas de exito de ataque antes y despues de la fase de intercambio de parametros.
- Investigacion en interpretabilidad: analizar que componentes concretos (6.927 restaurados frente a 5.807 expulsados) son responsables del comportamiento de rechazo, dado que el proceso opera a nivel de parametro individual.
- Ablacion metodologica en articulos academicos: servir de condicion experimental controlada cuando se publique el estudio completo de la rejilla, con semilla fija (42) y presupuesto documentado para garantizar reproducibilidad.
- Docencia en eficiencia de modelos: ilustrar con un caso real el coste en seguridad de reducir a la mitad los parametros de un transformer de 7B y las limitaciones de las tecnicas de reparacion post-hoc.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0654 |
| StrongREJECT ASR (juez HarmBench) | 0,0863 |
| Sobre-rechazo macro (WildGuard) | 0,2512 |
| Perplejidad en WikiText-2 | 13,9334 |

No se han publicado en la informacion disponible resultados de benchmarks de capacidad general (MMLU, HumanEval, GSM8K, MT-Bench u otros), ni valores comparativos del modelo base sin comprimir, por lo que no es posible establecer la degradacion exacta en tareas de conocimiento o codigo. En ASR, valores mas bajos indican mayor resistencia a ataques; en sobre-rechazo, valores mas bajos indican menos rechazos indebidos.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: en torno a 13,5-14 GB solo para pesos (el repositorio ocupa 13,5 GB), mas overhead de activaciones y cache KV; presupuestar 16-18 GB.
- VRAM estimada en int8: aproximadamente 7-8 GB de pesos; viable en GPU de 12-16 GB con margen limitado.
- VRAM estimada en 4 bits: aproximadamente 4-5 GB de pesos, asumiendo que el usuario cuantice por su cuenta (no hay GGUF ni GPTQ/AWQ publicados).
- GPU recomendadas: A100 40/80 GB, H100, L40S o A10G para servicio; RTX 4090 (24 GB), RTX 3090 (24 GB) y RTX 4080 (16 GB) para inferencia local en FP16 o int8.
- Cabe en GPU de consumo: si, en RTX 4090/3090 en FP16 sin problema y en tarjetas de 12-16 GB aplicando cuantizacion de 8 o 4 bits.
- Opciones de despliegue: `transformers` (via directa, formato publicado), Hugging Face Text Generation Inference (el repo esta etiquetado como `text-generation-inference` y `endpoints_compatible`) y vLLM. Para llama.cpp u Ollama seria necesario convertir previamente los pesos a GGUF, tarea no soportada de serie por este repositorio.
- Latencia y throughput: no disponibles; no se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Seguridad (ASR) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Jeesup/svd-safety-l2_remove50_swapgapiter_evfront_b010` | 6.738.415.616 declarados en safetensors; fraccion densa declarada 0,4999 | No disponible | AdvBench 0,0654 / StrongREJECT 0,0863 | Llama 2 Community License | Publico, 0 descargas |
| `meta-llama/Llama-2-7b-chat-hf` (modelo base) | ~6,74 mil millones (7B) | 4.096 tokens en su configuracion original | No disponible en la informacion proporcionada | Llama 2 Community License | Publico, ampliamente distribuido |
| Otras celdas de la rejilla del mismo autor (otras reglas de seleccion y presupuestos) | No disponible | No disponible | No disponible | Llama 2 Community License | Publicas o no, no verificado |
| Otros modelos comprimidos con SVD-LLM de Llama-2-7b-chat | No disponible | No disponible | No disponible | Variable | No verificado en la busqueda realizada |

No se dispone de datos comparativos de benchmarks de capacidad entre este checkpoint y el modelo base, ni de terceros alternativos, en la informacion proporcionada. La comparacion cuantitativa queda por tanto limitada a las metricas de seguridad y perplejidad de esta celda.

## Limitaciones y advertencias

- No es un asistente desplegable: el autor lo describe explicitamente como artefacto de investigacion y advierte que varias celdas de la rejilla estan degradadas en seguridad respecto a Llama-2-7b-chat.
- La compresion por si sola incrementa la tasa de exito de ataques; el proposito del experimento es cuantificar ese dano y probar su reparacion, no ofrecer un modelo alineado listo para uso.
- Sobre-rechazo macro elevado (0,2512 medido con WildGuard), lo que implica una proporcion significativa de rechazos indebidos en peticiones benignas.
- Perplejidad de 13,9334 en WikiText-2, un valor alto que sugiere una degradacion notable de la calidad del modelado del lenguaje; no se dispone del valor del modelo base en la informacion proporcionada para calcular la diferencia.
- Riesgo de alucinacion: no cuantificado en la model card, pero esperable al tratarse de un modelo comprimido al 50% de sus parametros densos.
- Idiomas y cobertura multilingue: no documentados; el modelo base esta orientado principalmente al ingles.
- Longitud de contexto: no documentada para este checkpoint.
- Sin benchmarks de capacidades generales: no hay datos de razonamiento, codigo ni matematicas, por lo que no puede recomendarse para tareas de produccion de ese tipo.
- Sin cuantizaciones publicadas (GGUF, AWQ, GPTQ): cualquier despliegue eficiente exige convertir o cuantizar los pesos, con el consiguiente riesgo de degradacion adicional.
- Adopcion nula verificable: 0 descargas y 0 likes, sin evaluaciones independientes ni terceros que hayan validado las metricas declaradas.
- Restricciones de licencia: se aplica la Llama 2 Community License y el `USE_POLICY.md` incluidos en el repositorio; el uso comercial esta sujeto a las condiciones de dicha licencia (incluido el limite de 700 millones de usuarios mensuales y las clausulas de atribucion "Built with Llama 2").
- Discrepancia de datos a verificar: los metadatos de safetensors declaran 6.738.415.616 parametros, cifra practicamente identica al modelo base completo, mientras la model card declara una fraccion densa resultante de 0,4999. Conviene inspeccionar la configuracion real del checkpoint antes de asumir su tamano efectivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-l2_remove50_swapgapiter_evfront_b010
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia Llama 2 (referencia oficial): https://ai.meta.com/llama/license/
- Resultados de la busqueda web: no se ha encontrado ningun enlace relevante sobre este modelo, su estudio asociado, el paper de SVD-LLM ni repositorios de codigo relacionados; los unicos resultados devueltos eran foros no pertinentes sobre Windows.
