# nokeepai/Inkling-2-Mini-Unbound-Basalt

## Resumen

Inkling-2-Mini-Unbound-Basalt es una distribucion cuantizada del modelo multimodal Inkling-2-Mini-Unbound v2.1, publicada por nokeepai. Se trata de una variante "abliterated" (sin el entrenamiento de seguridad del modelo original) del modelo Inkling 2 Mini, empaquetada en formato Basalt con cuantizacion NVFP4 y Q8_0 especifica para GPUs NVIDIA Blackwell (compute capability 12.0, es decir, RTX 50-series y RTX PRO 6000). El repositorio contiene un unico archivo de 19,7 GB.

El modelo resuelve el problema de desplegar una version sin restricciones de contenido de Inkling 2 Mini en hardware Blackwell, aprovechando el formato numerico NVFP4 nativo de esa arquitectura para reducir el espacio de pesos manteniendo la fidelidad respecto al checkpoint BF16 original. La pipeline declarada es image-text-to-text, por lo que conserva la torre de vision del modelo base, ademas de un drafter DSpark para decodificacion especulativa.

La relevancia actual radica en que combina tres tendencias: cuantizacion de baja precision especifica por hardware, modelos "uncensored" para investigacion sobre alineamiento, y empaquetado optimizado para inferencia local en una sola GPU. La licencia es Apache 2.0, aunque las implicaciones eticas de su comportamiento hacen que el uso en produccion orientado a usuarios finales requiera salvaguardas propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con mezcla de expertos enrutados, torre de vision y drafter DSpark para decodificacion especulativa |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el autor remite a la guia de Basalt para el modelo Inkling 2 Mini) |
| Tipos de cuantizacion | NVFP4 (expertos enrutados, capas 0-19), Q8_0 (expertos capas 20-23 y proyecciones de atencion), BF16 (cabeza, embeddings, torre de vision y drafter) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Basalt (archivo unico `.basalt`, 19,7 GB) |

## Arquitectura y entrenamiento

El modelo es una cuantizacion del checkpoint nokeepai/Inkling-2-Mini-Unbound v2.1, no un entrenamiento nuevo. La arquitectura subyacente es un transformer multimodal con capas de mezcla de expertos enrutados (routed experts) en 24 capas, una torre de vision y un drafter DSpark para decodificacion especulativa. El proceso de conversion se realizo con la receta oficial de Basalt v0.5.5 (`tools/convert/convert.py --checkpoint`) directamente desde los safetensors del v2.1.

La mezcla de precisiones es deliberada: las capas 0 a 19 de expertos enrutados se codifican en NVFP4 conservando bit a bit los codigos y escalas del release oficial, las capas 20 a 23 se codifican en Q8_0 a partir del MXFP8 del release, las proyecciones de atencion (q, k, v, output y gate) en Q8_0, y la cabeza, embeddings, torre de vision y drafter en BF16. El autor verifico tensor a tensor contra el pack oficial: 710 tensores en total, con exactamente 120 tensores de atencion modificados (los que v2.1 cambio respecto a versiones previas), cada uno byte a byte identico al Q8_0 de referencia de ggml recalculado desde los pesos BF16. El hash SHA-256 del archivo es `debb14727f2cbe4ab589ca464aa0f79dfe2f5883718330b63ea0eaa8fbc6fe05`.

El modelo base Unbound es una version "abliterated" del Inkling 2 Mini original, es decir, se ha eliminado la capa de rechazo del entrenamiento de seguridad sin reentrenar capacidades. El autor reporta una divergencia KLD de 0,0439 respecto al original.

## Capacidades

- Generacion de texto y razonamiento con modo de pensamiento configurable por peticion mediante `reasoning_effort` (de `none` a `max`); incluso en `none` el modelo emite un bloque de pensamiento corto.
- Procesamiento de imagenes (pipeline image-text-to-text) gracias a la torre de vision conservada del modelo original.
- Respuesta a instrucciones dañinas, peligrosas o ilegales que el modelo original rechaza, sin capa de seguridad superpuesta.
- Decodificacion especulativa mediante el drafter DSpark incluido en el pack.
- Servidor compatible con las APIs de OpenAI y Anthropic a traves de Basalt (`bin/basalt serve`).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling y soporte de agentes: no disponibles en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar como responde un LLM sin capa de rechazo ante prompts dañinos, comparando su comportamiento con el original (96,2% de rechazo) y con otras variantes abliterated, en entornos controlados de laboratorio.
- Evaluacion de robustez de filtros: usar el modelo como generador adversarial para probar clasificadores de contenido y sistemas de moderacion antes de desplegarlos.
- Inferencia local en estaciones Blackwell: el archivo unico de 19,7 GB cabe en una RTX 5090 de 32 GB con todos los expertos en VRAM, lo que permite ejecutar un modelo multimodal sin infraestructura de servidor.
- Analisis de imagenes en flujos internos: la torre de vision permite describir, extraer y razonar sobre imagenes en pipelines de investigacion donde el contenido no se distribuye a terceros.
- Generacion de datos sinteticos para entrenamiento: producir respuestas a peticiones que los modelos alineados rechazan, para construir datasets de contraste o de robustez.
- Pruebas de red teaming: simular un atacante con un modelo sin restricciones para validar defensas de aplicaciones expuestas.
- Prototipado con APIs OpenAI/Anthropic: al hablar ambos protocolos, se puede sustituir un endpoint en desarrollo por este servidor local sin cambiar el codigo cliente.

## Benchmarks y rendimiento

Los datos publicados corresponden al modelo base Unbound v2.1 medido con el GGUF Q8_0 en llama.cpp, no con este archivo Basalt. El autor indica que no ha re-medido la velocidad de esta distribucion.

| Metrica | Inkling-2-Mini-Unbound v2.1 | Original Inkling 2 Mini |
|---|---|---|
| Respuestas utiles, thinking off | 83,7% | 0,8% |
| Respuestas utiles, thinking on | 85,2% | 0,8% |
| Rechazos, thinking off / on | 0,4% / 0,4% | 96,2% / 95,8% |
| MMLU-300 | 74,3 | 76,3 |
| GSM8K-100 | 98 | 97 |
| KLD vs original | 0,0439 | — |

Comparativa con otras variantes uncensored sobre 263 prompts dañinos retenidos, mismo motor, ajustes y juez (util = p >= 0,5):

| Modelo | Util, off | Util, on | Rechazo off / on |
|---|---|---|---|
| Inkling-2-Mini-Unbound v2.1 | 83,7% | 85,2% | 0,4% / 0,4% |
| IndrasMirror XQ | 58,9% | 68,1% | 0,0% / 0,0% |
| AtomicChat Uncensored (LoRA) | 52,1% | 55,5% | 0,0% / 0,0% |
| OpenUncensored | 33,1% | 41,8% | 1,5% / 0,8% |
| JoaoZaokk Heretic | 17,5% | 26,2% | 1,1% / 0,4% |

Con los ajustes recomendados (thinking on, temperatura 0,6, top_p 0,95, tope de pensamiento de 4096 tokens), el 16,1% de 230 prompts dañinos nuevos alcanzo el tope de pensamiento, frente al 29,1% con decodificacion greedy.

## Requisitos de hardware

- GPU NVIDIA Blackwell con compute capability 12.0: RTX 50-series, RTX PRO 6000.
- CUDA 13 y driver de la rama R580 o superior.
- Basalt 0.5.5 o posterior (descarga desde github.com/jesdga95/basalt/releases o compilacion desde fuente).
- VRAM: en una tarjeta de 32 GB todos los expertos permanecen en VRAM; en tarjetas menores parte de los expertos se queda en RAM y la decodificacion se ralentiza.
- Tamano del archivo: 19,7 GB, por lo que cabe en GPUs consumer de 24 GB solo si se acepta el volcado parcial de expertos a RAM.
- Despliegue: exclusivamente mediante Basalt; no hay versiones GGUF, vLLM, llama.cpp ni Ollama de este pack.
- Latencia y throughput: no disponibles (el autor no ha re-medido la velocidad de esta distribucion).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Comportamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-Unbound-Basalt (este) | no disponible | no disponible | 85,2% util (thinking on), 0,4% rechazo | Apache 2.0 | Solo Basalt, NVFP4/Q8_0, 19,7 GB |
| Inkling-2-Mini-Unbound v2.1 | no disponible | no disponible | 85,2% util (thinking on), 0,4% rechazo | Apache 2.0 | GGUF Q8_0 y safetensors |
| IndrasMirror XQ | no disponible | no disponible | 68,1% util (thinking on), 0% rechazo | no disponible | no disponible |
| Inkling 2 Mini original | no disponible | no disponible | 0,8% util, 95,8% rechazo | no disponible | no disponible |

La comparativa se limita al eje de comportamiento frente a prompts dañinos, unico dato publicado. No hay informacion sobre parametros, contexto ni rendimiento general de los modelos alternativos.

## Limitaciones y advertencias

- El modelo sigue instrucciones dañinas, peligrosas o ilegales que el original rechaza. No debe desplegarse a usuarios finales sin salvaguardas propias, ni en contextos donde sus salidas puedan llegar a alguien que no haya elegido usar un modelo sin censura.
- Riesgo elevado de alucinacion y de contenido nocivo: la eliminacion de la capa de rechazo no elimina los sesgos del corpus de entrenamiento original.
- No usar muestreo DRY ni otros muestreadores de repeticion; el autor lo desaconseja explicitamente.
- Ajustes recomendados obligatorios para un comportamiento estable: temperatura 0,6, top_p 0,95, thinking on y tope de pensamiento (4096 tokens). Con greedy, el 29,1% de los prompts alcanza el tope de pensamiento.
- Incluso con `reasoning_effort: none` el modelo emite un bloque de pensamiento, por lo que hay que reservar espacio en `max_tokens`.
- Dependencia estricta de hardware Blackwell con CUDA 13 y driver R580+: no funciona en GPUs Ampere, Ada ni en hardware no NVIDIA.
- Dependencia de un unico runtime (Basalt 0.5.5+); no hay soporte en vLLM, llama.cpp, Ollama ni TGI.
- La licencia Apache 2.0 permite uso comercial, pero el autor advierte que la responsabilidad sobre el contenido generado recae en el desplegador.
- Los benchmarks publicados corresponden al GGUF Q8_0 del modelo base, no a este archivo Basalt; la velocidad de esta distribucion no se ha re-medido.
- Idiomas soportados no documentados; no se garantiza un rendimiento multilingue equivalente al del modelo original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nokeepai/Inkling-2-Mini-Unbound-Basalt
- Modelo base: https://huggingface.co/nokeepai/Inkling-2-Mini-Unbound
- Pack oficial de referencia: https://huggingface.co/jesdga/Inkling-2-Mini-Basalt
- Repositorio Basalt: https://github.com/jesdga95/basalt
- Releases de Basalt: https://github.com/jesdga95/basalt/releases
- Guia de Inkling 2 Mini en Basalt: https://github.com/jesdga95/basalt/blob/main/docs/models/inkling2.md
- Sitio del autor: https://nokeep.ai/?ref=huggingface
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
