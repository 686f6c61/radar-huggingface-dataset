# richardyoung/Qwen2.5-Coder-7B-Instruct-heretic1x-general

## Resumen

Qwen2.5-Coder-7B-Instruct-heretic1x-general es una variante "abliterada" (con los mecanismos de rechazo suprimidos) del modelo Qwen/Qwen2.5-Coder-7B-Instruct, publicada por el investigador Richard J. Young. La edicion se ha realizado con Heretic 1.x (heretic-llm 1.4.0, tag v1.4.0, commit `6ea3b8d`) aplicando una LoRA de rango 1 sobre las proyecciones `o_proj` y `down_proj`, posteriormente fusionada en pesos bf16. El objetivo no es ofrecer un asistente generalista, sino servir como objeto de estudio para la investigacion sobre abliteracion y su evaluacion.

El modelo forma parte del conjunto evaluado en el paper 30 del autor, titulado "The Selection Rule Can Reverse Abliteration Comparisons: A Held-Out, Judge-Based Case Study of Heretic 1.x, Heretic 2.0, External Tools and Community Releases on Qwen2.5". La variante "general" emplea la direccion por defecto de Heretic 1.x, con los conjuntos de prompts `mlabonne/harmful_behaviors` y `mlabonne/harmless_alpaca`, y una busqueda de 200 trials de Optuna. El trial seleccionado fue el numero 182, con 21/100 rechazos en el conjunto de desarrollo y una divergencia KL de 0,0096.

Se trata de un transformer denso de 7.615.616.512 parametros (aproximadamente 7,6 mil millones), derivado de un modelo base Apache-2.0, y distribuido bajo la licencia Apache-2.0 con las restricciones adicionales de OpenRAIL++ v1.0. Su relevancia actual es metodologica: proporciona evidencia empirica sobre como la regla de seleccion de trials puede invertir las conclusiones de comparaciones entre modelos abliterados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen2), derivado de Qwen2.5-Coder-7B-Instruct |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos publicados en bf16) |
| Idiomas soportados | en |
| Licencia | Apache-2.0 (base) con restricciones de uso de OpenRAIL++ v1.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen2.5-Coder-7B-Instruct: un transformer denso de aproximadamente 7,6 mil millones de parametros, especializado en codigo e instrucciones. Sobre esta base, el autor aplico una edicion de abliteracion mediante Heretic 1.x, que consiste en una LoRA de rango 1 sobre las proyecciones `o_proj` (atencion) y `down_proj` (feed-forward), fusionada posteriormente en los pesos bf16 originales. No se ha realizado un reentrenamiento completo ni un ajuste adicional de seguridad.

El proceso de busqueda utilizo 200 trials de Optuna con los valores por defecto de Heretic 1.x, empleando `mlabonne/harmful_behaviors` como conjunto de prompts daninos y `mlabonne/harmless_alpaca` como conjunto de prompts benignos. La regla de seleccion escogio el trial con menos rechazos en el conjunto de desarrollo entre aquellos con divergencia KL de desarrollo menor o igual a 0,01 (el limite archivado). El trial seleccionado (#182) obtuvo 21/100 rechazos en desarrollo y una KL de 0,0096, evaluado sobre `mlabonne/harmful_behaviors test[:100]`.

El autor documenta que los pesos publicados son identicos bit a bit, tensor por tensor, al modelo evaluado en el paper, y que el repositorio incluye `tensor_hashes.json` con el SHA-256 de cada tensor para verificar la integridad. El codigo, los registros de ejecucion y las etiquetas estan disponibles en el repositorio GitHub `ricyoung/abliteration-studies`.

## Capacidades

- Generacion de texto conversacional en ingles, heredada de Qwen2.5-Coder-7B-Instruct.
- Generacion y comprension de codigo en multiples lenguajes de programacion (capacidad propia del modelo base Coder).
- Razonamiento matematico y resolucion de problemas tipo GSM8K, segun los benchmarks reportados.
- Seguimiento de instrucciones (IFEval) con un cambio de +0,6 pp respecto al original.
- Reduccion sustancial de rechazos ante prompts daninos: 10,3% de tasa de rechazo segun el juez WildGuard, frente al 83,2% del modelo original.
- Reduccion de sobre-rechazo en prompts benignos: 2,3% frente al 22,6% del original.
- No se documenta soporte explicito de tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento extendido en la informacion proporcionada.

## Casos de uso

- Investigacion sobre abliteracion: el modelo sirve como caso de estudio controlado para analizar como la regla de seleccion de trials (limite de KL) afecta a las comparaciones entre modelos abliterados y a las conclusiones sobre eficacia de la supresion de rechazos.
- Evaluacion de jueces automaticos: permite reproducir el pipeline de evaluacion con WildGuard y comparar tasas de rechazo medidas por juez frente a marcadores por palabras clave (10,3% vs 18,5% en este modelo).
- Estudio de sobre-rechazo: util para medir como la abliteracion afecta a la tasa de rechazos en prompts benignos (2,3% frente a 22,6% del original) y calibrar umbrales de utilidad.
- Verificacion de integridad de pesos: el repositorio incluye hashes SHA-256 por tensor, lo que permite auditar que los pesos publicados coinciden exactamente con los evaluados en el paper.
- Analisis de degradacion de capacidades: con cambios de -1,4 pp en GSM8K, -0,8 pp en MBPP y -0,6 pp en HumanEval, el modelo es adecuado para estudiar el coste de la abliteracion en tareas de codigo y matematicas.
- Reproducibilidad de experimentos: combinado con el codigo y los registros publicados en GitHub, permite replicar la busqueda de 200 trials y la seleccion por regla de KL.
- Comparacion entre variantes de Heretic: al existir variantes como Heretic 2.0 y otras releases comunitarias sobre Qwen2.5, sirve como referencia en estudios comparativos con reglas de seleccion declaradas.

## Benchmarks y rendimiento

Evaluacion retenida del paper 30: 972 prompts daninos no usados durante la busqueda, puntuados por el juez WildGuard, y cinco benchmarks de capacidad (cambios en puntos porcentuales, pp, respecto al modelo original).

| Metrica | Este modelo | Original |
|---|---|---|
| Tasa de rechazo, juez WildGuard [IC 95%] | 10,3% [8,5%, 12,4%] | 83,2% |
| Tasa de rechazo, marcadores por palabras clave | 18,5% | 83,6% |
| Sobre-rechazo en prompts benignos (WildGuard) | 2,3% | 22,6% |
| Cambio medio de capacidad | -0,35 pp | 0 |

Cambio de capacidad por benchmark (pp):

| Benchmark | Cambio (pp) |
|---|---|
| MMLU-Pro | +0,5 |
| GSM8K | -1,4 |
| IFEval | +0,6 |
| HumanEval | -0,6 |
| MBPP | -0,8 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 15,2 GB solo para pesos (tamano del repo), mas overhead de activaciones y cache KV; en la practica se recomienda al menos 16-20 GB para contexto corto.
- Cuantizacion a 8 bits: aproximadamente 8 GB de pesos; a 4 bits: aproximadamente 4 GB de pesos. No se han publicado ficheros GGUF en la informacion disponible, por lo que habria que generarlos a partir de los safetensors.
- GPU recomendadas para bf16: A100 40/80 GB, H100, L40S, RTX A6000. Para cuantizacion 4/8 bits, RTX 4090 (24 GB), RTX 3090 (24 GB) o RTX 4080 (16 GB) son suficientes.
- Cabe en GPU de consumo: si, en RTX 4090/3090 con cuantizacion 8 o 4 bits; en bf16 requiere GPU de 24 GB o superior con contexto limitado.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), y previsiblemente vLLM y llama.cpp/Ollama tras conversion a GGUF, aunque esto ultimo no se confirma en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tasa de rechazo (WildGuard) | Sobre-rechazo benigno | Licencia |
|---|---|---|---|---|---|
| Este modelo (Heretic 1.x, general) | 7,6 B | no disponible | 10,3% | 2,3% | Apache-2.0 + OpenRAIL++ |
| Qwen/Qwen2.5-Coder-7B-Instruct (original) | 7,6 B | no disponible | 83,2% | 22,6% | Apache-2.0 |
| Heretic 2.0 sobre Qwen2.5 | no disponible | no disponible | no disponible | no disponible | no disponible |
| Otras releases comunitarias sobre Qwen2.5 | no disponible | no disponible | no disponible | no disponible | no disponible |

El paper compara Heretic 1.x, Heretic 2.0, herramientas externas y releases comunitarias sobre Qwen2.5, pero los resultados concretos de esas alternativas no se detallan en la informacion proporcionada. El autor advierte que la variacion entre busquedas es grande (desviacion estandar por semilla de aproximadamente 9 pp), por lo que las diferencias entre modelos individuales no deben sobreinterpretarse.

## Limitaciones y advertencias

- El rechazo se reduce, no se elimina: la tasa residual es del 10,3% segun WildGuard y del 18,5% segun marcadores por palabras clave. El modelo puede seguir produciendo contenido danino.
- No incorpora ajuste de seguridad adicional; se publica exclusivamente para investigacion sobre abliteracion y su evaluacion, no como asistente de proposito general.
- La regla de seleccion condiciona los resultados: en Qwen2.5-32B, reseleccionar la misma busqueda con KL de desarrollo menor o igual a 0,1 en lugar de 0,01 redujo el rechazo residual en 61,7 pp. Las comparaciones entre modelos abliterados solo son validas si se declara la regla de seleccion y la divergencia realizada.
- Alta variabilidad entre busquedas: desviacion estandar por semilla de aproximadamente 9 pp, lo que limita la interpretacion de diferencias entre modelos individuales.
- Idiomas: solo se declara ingles (`en`); el rendimiento en castellano u otros idiomas no esta documentado.
- Longitud de contexto: no disponible en la informacion proporcionada; conviene consultar la model card del modelo base Qwen2.5-Coder-7B-Instruct.
- Restricciones de licencia: aunque los pesos son Apache-2.0, el modelo incorpora las restricciones de uso de OpenRAIL++ v1.0 y no puede desplegarse para los usos prohibidos en dicha licencia. En caso de conflicto, prevalece la licencia base.
- Riesgo de alucinacion: no cuantificado en la informacion proporcionada; es esperable un comportamiento similar al del modelo base en tareas de codigo y matematicas, con la degradacion medida en GSM8K (-1,4 pp) y MBPP (-0,8 pp).
- Sesgos: no documentados especificamente; se heredan los del modelo base Qwen2.5-Coder-7B-Instruct.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richardyoung/Qwen2.5-Coder-7B-Instruct-heretic1x-general
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct/blob/main/LICENSE
- Repositorio GitHub del autor (codigo, registros y etiquetas): `ricyoung/abliteration-studies`
- Paper 30 (arXiv pendiente de publicacion segun la model card): no disponible
- Heretic (herramienta, heretic-llm 1.4.0, tag v1.4.0, commit `6ea3b8d`): no disponible enlace directo en la informacion proporcionada
- Conjuntos de datos de evaluacion: `mlabonne/harmful_behaviors`, `mlabonne/harmless_alpaca`
