# Jeesup/svd-safety-l3_swift_remove40_swapgapiter_rankunit_b010

## Resumen

`Jeesup/svd-safety-l3_swift_remove40_swapgapiter_rankunit_b010` es un checkpoint derivado de `meta-llama/Meta-Llama-3-8B-Instruct` que ha sido comprimido con SVD-LLM hasta el 60,0 % de los parametros densos originales y, a continuacion, editado mediante 10 rondas iterativas de intercambio de parametros neutrales ("parameter-neutral swap") seleccionados con la regla `gap_iter`. No es un modelo conversacional de proposito general: es un artefacto de investigacion disenado para cuantificar como la compresion por descomposicion en valores singulares degrada el comportamiento de seguridad de un LLM y que regla de seleccion de componentes repara mejor ese dano.

El trabajo se enmarca en un estudio sobre el eje seguridad/utilidad bajo compresion. Segun el autor, algunas celdas de su grid estan deliberadamente degradadas en seguridad respecto al modelo original, y esta celda concreta corresponde a una configuracion con presupuesto de restauracion del 1,000 % de los parametros densos, 5.047 componentes restaurados y 5.047 componentes sustituidos, con semilla 42. El resultado declarado es una fraccion de parametros densos de 0,6003 y 69.732.352 parametros intercambiados (el 1,00 % de los parametros de proyeccion densos).

Su relevancia es metodologica mas que de producto: aporta metricas de seguridad medidas con jueces externos (HarmBench) y de calidad de lenguaje (perplejidad en WikiText-2) sobre un checkpoint comprimido, lo que permite estudiar el compromiso entre eliminacion de parametros y alineacion de seguridad. El repositorio ocupa 16,1 GB y el conteo de parametros almacenados en safetensors es de 8.030.261.248.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Llama 3 (heredada del modelo base); sin datos adicionales en la informacion proporcionada |
| Parametros totales | 8.030.261.248 (conteo de safetensors); fraccion de parametros densos resultante declarada por el autor: 0,6003 |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Meta Llama 3 Community License (se incluyen `LICENSE` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-3-8B-Instruct, un transformer decoder-only con atencion causal; el checkpoint no introduce cambios arquitectonicos, sino que modifica los pesos. La transformacion aplicada es una compresion SVD-LLM que elimina el 39,97 % de los parametros densos mediante truncamiento de descomposiciones en valores singulares, dejando el modelo en una fraccion de 0,6003 de los parametros densos originales. Sobre ese modelo comprimido se aplica despues una edicion de 10 rondas iterativas, cada una con un cupo del 0,100 % de los parametros densos (presupuesto total del 1,0 %), en la que se seleccionan componentes con la regla `gap_iter` y se sustituyen por valores del modelo original con criterio de "insert" (solo valor de insercion, con desalojo ordenado por sigma). En total se restauran 5.047 componentes y se desalojan 5.047.

No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO adicionales; se trata de un derivado del checkpoint instruct de Meta, por lo que su alineacion original procede del modelo base. Tampoco se documentan innovaciones de inferencia como decodificacion especulativa o atencion lineal. El valor tecnico del artefacto reside en la metodologia de seleccion y restauracion de componentes bajo compresion, no en una mejora de capacidades.

## Capacidades

- Generacion de texto conversacional: hereda la funcionalidad basica del checkpoint instruct de Llama 3, aunque el autor advierte explicitamente que no debe tratarse como un asistente desplegable.
- Razonamiento, codigo y matematicas: presumiblemente las del modelo base, pero no se aportan evaluaciones especificas en la informacion disponible.
- Soporte de tool calling / function calling: no documentado en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no disponibles.
- Capacidad especial: el checkpoint esta disenado como sujeto experimental para medir el efecto de la compresion SVD sobre la tasa de exito de ataques (ASR) y sobre el rechazo excesivo, no como modelo con modos especiales (thinking, vision o audio).
- Compatibilidad de despliegue: etiquetado con `text-generation-inference` y `endpoints_compatible` en HuggingFace.

## Casos de uso

- Investigacion sobre compresion de LLM: permite medir la perdida de calidad de lenguaje tras truncar valores singulares, usando la perplejidad en WikiText-2 (31,4740 en esta celda) como metrica objetiva frente al modelo denso.
- Evaluacion de seguridad bajo compresion: sirve para cuantificar cuanto aumenta la tasa de exito de ataques cuando se elimina el 39,97 % de los parametros densos, comparando el ASR de AdvBench (0,0154) y StrongREJECT (0,1150) con el del modelo original.
- Estudio de reglas de seleccion de componentes: esta celda forma parte de un grid sobre reglas y presupuestos; se usa para comparar `gap_iter` frente a otras reglas manteniendo fijos semilla (42), presupuesto (1,000 %) y numero de rondas (10).
- Analisis de rechazo excesivo: la metrica de sobre-rechazo macro medida con WildGuard (0,1327) permite estudiar si la reparacion de seguridad recupera utilidad o si genera un modelo demasiado conservador.
- Red-teaming y evaluacion de jailbreaks: util como sujeto de prueba en pipelines automatizados que aplican prompts adversarios y clasifican la respuesta con jueces tipo HarmBench.
- Reproducibilidad de experimentos: al fijar semilla, presupuesto y numero de rondas, permite replicar exactamente una celda del grid y auditar la metodologia del estudio.
- Docencia e interpretabilidad: sirve como caso practico para explicar descomposicion en valores singulares aplicada a pesos de transformers y el impacto de la edicion selectiva de componentes.
- Baseline negativo en pipelines de evaluacion: puede integrarse como referencia degradada en baterias de test que verifiquen que un modelo candidato supera umbrales minimos de seguridad y calidad.

## Benchmarks y rendimiento

| Metrica | Valor | Juez / metodologia |
|---|---|---|
| AdvBench ASR | 0,0154 | HarmBench judge |
| StrongREJECT ASR | 0,1150 | HarmBench judge |
| Sobre-rechazo macro | 0,1327 | WildGuard |
| Perplejidad WikiText-2 | 31,4740 | no disponible |

No se han publicado en la informacion disponible resultados comparativos frente al modelo base ni frente a otras celdas del grid (MMLU, HumanEval, GSM8K u otros), por lo que no es posible establecer la delta exacta de rendimiento respecto a `meta-llama/Meta-Llama-3-8B-Instruct`.

## Requisitos de hardware

- VRAM estimada en BF16/FP16: en torno a 16 GB solo para pesos, mas cache KV; se recomienda un minimo de 24 GB para contextos cortos.
- VRAM estimada en INT8: aproximadamente 8 GB de pesos.
- VRAM estimada en INT4: aproximadamente 4-5 GB de pesos, con perdida adicional de calidad no evaluada.
- GPU recomendadas: A100 40 GB o 80 GB, H100, L40S para servidor; RTX 4090 (24 GB) para BF16 en contexto corto.
- GPU de consumo: si cabe en tarjetas de 24 GB (RTX 3090, 4090) en BF16; en cuantizacion de 8 o 4 bits podria ejecutarse en GPUs de 8-16 GB, aunque no hay cuantizaciones publicadas en el repositorio.
- Opciones de despliegue: `transformers`, Text Generation Inference (TGI) y endpoints compatibles, segun las etiquetas del repositorio; llama.cpp u Ollama requeririan generar previamente un GGUF, que no se incluye.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| svd-safety-l3_swift_remove40_swapgapiter_rankunit_b010 | 8.030.261.248 en safetensors; fraccion densa 0,6003 | no disponible | Meta Llama 3 Community License | HuggingFace (0 descargas, 0 likes) | AdvBench ASR 0,0154; StrongREJECT ASR 0,1150; ppl WikiText-2 31,4740 |
| meta-llama/Meta-Llama-3-8B-Instruct (modelo base) | 8.030.261.248 | no disponible en la informacion proporcionada | Meta Llama 3 Community License | HuggingFace, ampliamente desplegado | no disponible en la informacion proporcionada |
| meta-llama/Meta-Llama-3-8B (preentrenado) | 8.030.261.248 | no disponible en la informacion proporcionada | Meta Llama 3 Community License | HuggingFace | no disponible en la informacion proporcionada |
| Otras celdas del grid de compresion SVD del mismo autor | no disponible | no disponible | Meta Llama 3 Community License | HuggingFace | no disponible |

## Limitaciones y advertencias

- El propio autor indica que este checkpoint es un sujeto experimental y no un asistente desplegable; no debe usarse en produccion orientada a usuarios finales.
- La compresion por SVD eleva la tasa de exito de ataques: el estudio parte de la premisa de que la compresion por si sola degrada la seguridad, y algunas celdas del grid estan deliberadamente degradadas.
- Riesgo de alucinacion: no se ha medido ni documentado en la informacion proporcionada; la perplejidad de 31,4740 en WikiText-2 es elevada y sugiere una degradacion notable de la modelizacion del lenguaje.
- La regla de edicion `gap_iter` con presupuesto del 1,0 % solo restaura parcialmente el comportamiento de seguridad; el resultado no equivale al modelo original.
- Sesgos conocidos: no documentados especificamente para este checkpoint; hereda los del modelo base Llama 3, no detallados en la informacion disponible.
- Limitaciones de contexto e idioma: no disponibles.
- Restricciones de licencia: uso sujeto a la Meta Llama 3 Community License y a `USE_POLICY.md`; se debe conservar la atribucion ("Built with Meta Llama 3") y cumplir las clausulas de redistribucion, incluida la relativa a despliegues con mas de 700 millones de usuarios mensuales.
- Ausencia de benchmarks completos: no hay datos publicados de MMLU, HumanEval u otras tareas de capacidad, por lo que la utilidad real del checkpoint fuera del eje seguridad no esta caracterizada.
- Adopcion nula hasta la fecha: 0 descargas y 0 likes, sin validacion independiente por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/Jeesup/svd-safety-l3_swift_remove40_swapgapiter_rankunit_b010
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Paper de SVD-LLM: no disponible en la informacion proporcionada
- Repositorio de codigo: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces obtenidos correspondian a perfiles de LinkedIn sin relacion con el artefacto.
