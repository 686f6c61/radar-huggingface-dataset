# richardyoung/Qwen2.5-Coder-32B-Instruct-heretic1x-code

## Resumen

Qwen2.5-Coder-32B-Instruct-heretic1x-code es una variante "abliterada" (con la capacidad de rechazo suprimida) del modelo Qwen/Qwen2.5-Coder-32B-Instruct, publicada por el investigador Richard J. Young. El modelo se ha generado con la herramienta Heretic 1.x (heretic-llm 1.4.0, tag v1.4.0), aplicando una edicion LoRA de rango 1 sobre las proyecciones `o_proj` y `down_proj` y fusionando el resultado en los pesos bf16 originales. No es un fine-tuning convencional: es una intervencion quirurgica sobre el comportamiento de rechazo, orientada a estudiar la abliteracion y su evaluacion.

La relevancia del modelo es fundamentalmente metodologica. Forma parte del paper 30 de su autor, un estudio sobre como la regla de seleccion puede invertir las comparaciones entre modelos abliterados. El modelo se selecciono mediante 200 ensayos de Optuna siguiendo la regla de Heretic 1.x: el ensayo con menos rechazos en el conjunto de desarrollo entre aquellos con divergencia KL de desarrollo <= 0.01. El ensayo elegido fue el numero 133, con 31/100 rechazos en desarrollo y una KL de 0.0040.

A diferencia de otros lanzamientos abliterados, este incluye una evaluacion held-out rigurosa con 972 prompts daninos y un juez externo (WildGuard), ademas de hashes SHA-256 de cada tensor para verificar la integridad. El autor lo publica explicitamente como material de investigacion, no como asistente de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 32.763.876.352 (~32,8 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-Coder-32B-Instruct soporta 32.768 tokens nativos, ampliables; no confirmado para esta variante) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; el repo no lista GGUF ni cuantizaciones alternativas) |
| Idiomas soportados | en (ingles, segun la model card) |
| Licencia | Apache-2.0 (base) con restricciones de uso de OpenRAIL++ v1.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen2.5-Coder-32B-Instruct original: un transformer decoder-only denso de aproximadamente 32,8 mil millones de parametros. La intervencion de Heretic 1.x no modifica la arquitectura ni anade parametros en inferencia: entrena una LoRA de rango 1 sobre las matrices `o_proj` (proyeccion de salida de atencion) y `down_proj` (proyeccion descendente del FFN) y la fusiona en los pesos bf16, de modo que el modelo resultante tiene exactamente la misma topologia y numero de parametros que el base.

El proceso de abliteracion consistio en una busqueda de 200 ensayos de Optuna con la configuracion de prompts de "code abliteration" (solicitudes maliciosas frente a solicitudes benignas de programacion). La seleccion siguio la regla de Heretic 1.x: entre los ensayos con divergencia KL de desarrollo <= 0.01, se eligio el de menos rechazos. El ensayo 133 obtuvo 31/100 rechazos en desarrollo con KL 0.0040. No se realizo RLHF, DPO ni ningun ajuste de seguridad adicional; el objetivo es precisamente reducir la tasa de rechazo manteniendo la capacidad.

Una innovacion destacable del lanzamiento es la trazabilidad: el archivo `tensor_hashes.json` incluye el SHA-256 de cada tensor (independiente del layout), y los pesos son identicos bit a bit, tensor por tensor, al modelo evaluado en el paper. El codigo, los registros de ejecucion y las etiquetas se publican en el repositorio GitHub `ricyoung/abliteration-studies`.

## Capacidades

- Generacion de texto y codigo en ingles, heredadas del base Qwen2.5-Coder-32B-Instruct.
- Razonamiento y matematicas (el base esta entrenado para tareas de codigo y razonamiento).
- Reduccion significativa de la tasa de rechazo ante solicitudes que el modelo original rechazaria (61,1% frente a 75,3% segun el juez WildGuard).
- Menor sobre-rechazo en prompts benignos (1,1% frente a 4,3% del original).
- Capacidad de instrucciones conservada: la variacion media de capacidad es de +0,29 pp en cinco benchmarks.
- Soporte de tool calling y function calling: no confirmado explicitamente para esta variante en la informacion proporcionada (el base lo soporta).
- Capacidades de agente y razonamiento multi-paso: no confirmado explicitamente para esta variante.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Investigacion sobre abliteracion: el modelo sirve como objeto de estudio reproducible para analizar como la regla de seleccion y el limite de divergencia KL afectan a la tasa de rechazo residual. Los hashes de tensores permiten verificar que los pesos evaluados coinciden con los publicados.
- Evaluacion de jueces de seguridad: al estar evaluado con WildGuard y marcadores de palabras clave, permite calibrar y comparar clasificadores de rechazo y de contenido danino en condiciones controladas.
- Estudio de sobre-rechazo: con un 1,1% de sobre-rechazo en benignos frente al 4,3% del original, es util para medir el coste de utilidad de las intervenciones de seguridad.
- Analisis de robustez de modelos de codigo: la configuracion de prompts "code abliteration" (solicitudes maliciosas frente a benignas de programacion) lo hace adecuado para estudiar como los modelos de codigo manejan peticiones ambiguas o potencialmente abusivas.
- Reproducibilidad de papers: el repositorio `ricyoung/abliteration-studies` y los registros de ejecucion permiten replicar el pipeline completo (Optuna, Heretic 1.x, evaluacion held-out).
- Comparacion entre herramientas de abliteracion: el paper compara Heretic 1.x, Heretic 2.0, herramientas externas y lanzamientos de la comunidad sobre Qwen2.5, por lo que este modelo sirve como punto de referencia dentro de esa matriz comparativa.

## Benchmarks y rendimiento

Datos de la evaluacion held-out del paper 30 (972 prompts daninos no usados en la busqueda, juez WildGuard; capacidad en puntos porcentuales relativos al modelo original):

| Metrica | Este modelo | Original |
|---|---|---|
| Tasa de rechazo, juez WildGuard [IC 95%] | 61,1% [58,0%, 64,1%] | 75,3% |
| Tasa de rechazo, marcadores de palabras clave | 69,3% | 77,0% |
| Sobre-rechazo en prompts benignos (WildGuard) | 1,1% | 4,3% |
| Cambio medio de capacidad | +0,29 pp | 0 |

Cambio de capacidad por benchmark (pp):

| Benchmark | Cambio (pp) |
|---|---|
| MMLU-Pro | +1,2 |
| GSM8K | +0,2 |
| IFEval | -0,4 |
| HumanEval | +0,6 |
| MBPP | -0,2 |

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, aproximadamente 65,5 GB solo para pesos (el repo ocupa 65,5 GB), mas overhead de activaciones y cache KV; en torno a 70-80 GB en funcion de la longitud de contexto.
- Cuantizacion: no se publican GGUF ni otras cuantizaciones en el repo; habria que generarlas a partir de los safetensors.
- GPU recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU para bf16. En GPUs de consumo (RTX 4090, 24 GB) no cabe en bf16; requeriria cuantizacion a 4 bits (aproximadamente 18-20 GB) generada por el usuario.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); vLLM, llama.cpp u Ollama no estan confirmados para esta variante concreta.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tasa de rechazo (WildGuard) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Heretic 1.x, code) | 32,8 B | no disponible | 61,1% | Apache-2.0 + OpenRAIL++ | Hugging Face |
| Qwen/Qwen2.5-Coder-32B-Instruct (base) | 32,8 B | 32.768 tokens nativos | 75,3% | Apache-2.0 | Hugging Face |
| Heretic 2.0 sobre Qwen2.5 | no disponible | no disponible | no disponible | no disponible | no disponible |
| Otros lanzamientos de la comunidad sobre Qwen2.5 | no disponible | no disponible | no disponible | no disponible | no disponible |

El paper compara explicitamente Heretic 1.x, Heretic 2.0, herramientas externas y lanzamientos de la comunidad sobre Qwen2.5, pero los resultados numericos de esas alternativas no se incluyen en la informacion proporcionada.

## Limitaciones y advertencias

- El rechazo se reduce, no se elimina: el modelo sigue produciendo contenido danino en una parte de los casos (61,1% de rechazo residual segun WildGuard).
- No tiene ajuste de seguridad adicional; no debe desplegarse como asistente de proposito general.
- Cada cifra proviene de una unica busqueda sobre un unico modelo base; el paper encuentra una variacion entre busquedas elevada (desviacion tipica de ruido de semilla de aproximadamente 9 pp), por lo que las diferencias entre modelos individuales no deben sobreinterpretarse.
- El limite de seleccion importa: en Qwen2.5-32B, reseleccionar la misma busqueda con KL de desarrollo <= 0,1 en lugar de 0,01 redujo el rechazo residual en 61,7 pp. Las comparaciones entre modelos abliterados solo son validas con una regla de seleccion y una divergencia realizada declaradas.
- Idiomas: solo ingles segun la model card; no se garantiza un comportamiento equivalente en castellano u otros idiomas.
- Licencia: aunque los tags indican Apache-2.0, la model card anade las restricciones de uso de OpenRAIL++ v1.0; en caso de conflicto prevalece la licencia base. Queda prohibido su uso para los fines listados en OpenRAIL++.
- Riesgo de alucinacion: no cuantificado en la informacion proporcionada; el modelo hereda el comportamiento del base.
- Sesgos: no documentados especificamente para esta variante.
- Estado del lanzamiento: 0 descargas y 0 likes en el momento de la consulta; es un artefacto de investigacion, no un modelo con adopcion o soporte comunitario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richardyoung/Qwen2.5-Coder-32B-Instruct-heretic1x-code
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-32B-Instruct
- Licencia del base: https://huggingface.co/Qwen/Qwen2.5-Coder-32B-Instruct/blob/main/LICENSE
- Repositorio de codigo, registros y etiquetas: GitHub `ricyoung/abliteration-studies` (se publica con el paper)
- Paper 30: Richard J. Young, *The Selection Rule Can Reverse Abliteration Comparisons: A Held-Out, Judge-Based Case Study of Heretic 1.x, Heretic 2.0, External Tools and Community Releases on Qwen2.5* (enlace arXiv pendiente de anadir segun la model card)
- Heretic (herramienta): heretic-llm 1.4.0, git tag v1.4.0, commit `6ea3b8d` (no se proporciona URL)
