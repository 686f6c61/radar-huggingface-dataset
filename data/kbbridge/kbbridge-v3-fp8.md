# KBBridge/KBBridge-v3-FP8

## Resumen

KBBridge-v3-FP8 es una cuantización FP8 dinámica del modelo KBBridge-v3, un fine-tune de Qwen/Qwen3.8-27B especializado en la generación de código GeneXus en el formato nativo `.gxSource`. El modelo está desarrollado por KBBridge, una empresa que ofrece un puente entre Knowledge Bases de GeneXus y asistentes de IA, y esta versión FP8 es la que utilizan en producción sobre vLLM en GPUs Hopper/Blackwell.

El problema que resuelve es concreto: los modelos frontier no conocen el formato `.gxSource` y, sin inyectar documentación de GeneXus en el prompt, producen salida sintácticamente inválida casi siempre (parse rate de 0,5–3,1%). KBBridge-v3 lo escribe de forma nativa, se ejecuta en hardware propio y no envía el código de la Knowledge Base a APIs externas, lo que lo hace adecuado para entornos con requisitos de privacidad.

La versión FP8 ocupa 29 GB en un único shard, soporta una ventana de contexto de 262 144 tokens y está pensada para despliegue con vLLM. Incluye soporte de tool calling mediante el parser `qwen3_coder`, pero no incorpora la cabeza de multi-token prediction (MTP), por lo que la decodificación especulativa no está disponible en este build.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (fine-tune de Qwen/Qwen3.8-27B) |
| Parametros totales | 27 mil millones (segun nomenclatura del modelo base Qwen3.8-27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens (segun configuracion de vLLM) |
| Tipos de cuantizacion | FP8 dinamica (este build), GGUF 4-bit (builds separados) |
| Idiomas soportados | Espanol, ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (FP8, un shard de 29 GB), GGUF |

## Arquitectura y entrenamiento

KBBridge-v3 es un fine-tune del modelo Qwen3.8-27B, un transformer denso de 27 mil millones de parametros. La arquitectura base es la de Qwen3, con atencion completa y soporte nativo de tool calling. Sobre esta base se ha realizado un ajuste fino especializado en el formato `.gxSource` de GeneXus, que es un formato de exportacion propietario que los modelos genericos no conocen.

Los detalles exactos del entrenamiento no estan publicados en la informacion disponible. Se sabe que el corpus de entrenamiento de v3 es cuatro veces mayor que el de v2, que se elimino el limite de tokens por KB, y que el teacher utilizado fue v2 (mientras que v2 uso v1). No se especifica el numero total de tokens, la composicion del dataset ni si se aplicaron tecnicas como RLHF o DPO. La model card advierte que el cambio de v2 a v3 involucro tres variables simultaneas (modelo base, corpus y teacher), por lo que la caida en parseRate no puede atribuirse a ninguna de ellas sin un grupo de control.

Una innovacion destacable es que el modelo internaliza el conocimiento de GeneXus durante el fine-tune, de modo que inyectar documentacion externa en el prompt empeora su rendimiento (parseRate de 76,4 a 73,3). Esto contrasta con los modelos frontier, que necesitan unos 21 600 tokens de documentacion inyectada para acercarse a resultados utiles.

## Capacidades

- Generacion de codigo GeneXus en formato `.gxSource`: Procedures, Transactions, Data Providers, SDTs y WebPanels con sintaxis valida.
- Explicacion de codigo existente: analiza y describe objetos GeneXus a partir de su representacion en `.gxSource`.
- Completado de codigo: sugiere continuaciones de objetos parcialmente escritos.
- Respuesta a preguntas sobre documentacion de GeneXus: conceptos, buenas practicas y sintaxis del lenguaje.
- Tool calling: soporta el parser `qwen3_coder` y la seleccion automatica de herramientas en vLLM.
- Razonamiento: el modelo base incluye un modo de razonamiento, pero se recomienda desactivarlo (`enable_thinking: false`) porque el bloque `thinking` puede no cerrarse dentro del presupuesto de tokens y devolver respuestas vacias o incompletas.
- Multilingue: entrenado en espanol e ingles.

## Casos de uso

- Asistencia a desarrolladores GeneXus en el IDE: el desarrollador pide un Procedure o una Transaction en formato `.gxSource` y el modelo lo genera con sintaxis valida, reduciendo el tiempo de escritura manual.
- Refactorizacion de objetos existentes: se pega el codigo `.gxSource` de un objeto y el modelo sugiere modificaciones, explica su funcionamiento o identifica posibles mejoras.
- Completado de codigo en tiempo real: integrado en un editor o IDE mediante una API local, sugiere la continuacion de objetos mientras se escriben.
- Generacion de documentacion tecnica: a partir de un objeto GeneXus, el modelo produce comentarios, descripciones de parametros y resumenes de comportamiento para incluir en la documentacion del proyecto.
- Formacion de nuevos desarrolladores: responde preguntas sobre sintaxis y convenciones de GeneXus, sirviendo como tutor interactivo sin depender de APIs externas.
- Migracion o conversion de codigo: aunque no esta explicitamente validado, el modelo puede ayudar a traducir logica de negocio desde otros lenguajes a objetos GeneXus, siempre que se valide el resultado en el IDE.
- Integracion en pipelines de CI/CD: el modelo puede generar objetos `.gxSource` de forma automatizada y verificar su sintaxis con el parser ANTLR oficial, aunque la model card recomienda no sustituir la validacion en el IDE.
- Entornos con requisitos de privacidad: al ejecutarse en hardware propio, el codigo de la Knowledge Base nunca sale de la infraestructura, lo que lo hace apto para sectores regulados o empresas con politicas estrictas de datos.

## Benchmarks y rendimiento

Los resultados publicados corresponden a 580 items held-out (191 de generacion de codigo, 329 de preguntas de opcion multiple y 60 de modelos de datos) que ningun modelo vio durante el entrenamiento. La sintaxis se valido con el parser ANTLR oficial de GeneXus, con temperatura 0,1, razonamiento desactivado y concurrencia 8.

| Metrica | v2 | v3 | Diferencia |
|---|---|---|---|
| parseRate (sintaxis valida) | 89,0 | 84,8 | -4,2 |
| parmMatch (firma exacta) | 78,6 | 78,6 | = |
| MCQ (conocimiento de GeneXus) | 76,0 | 79,0 | +3,0 |
| methodValidity | 90,0 | 91,1 | +1,1 |

Generalizacion a Knowledge Bases no vistas:

| Escenario | v2 | v3 |
|---|---|---|
| Held-out de KBs de entrenamiento | 89,0 | 84,8 |
| 3 KBs completamente nuevas | 89,9 | 87,4 |

La model card senala que v3 no es una victoria limpia sobre v2: gana en conocimiento de dominio (MCQ y methodValidity) pero pierde en validez sintactica (parseRate). En terminos relativos, v3 generaliza mejor a KBs no vistas (+2,6 puntos frente a +0,9 de v2).

En la comparacion con modelos frontier, estos se ejecutaron con ~21 600 tokens de documentacion de GeneXus inyectada en cada peticion, mientras que KBBridge se ejecuto sin ninguna. Los frontier alcanzaron un parse rate de 0,5–3,1% sin documentacion. Inyectar la misma documentacion a KBBridge empeora su parseRate de 76,4 a 73,3.

Sobre la calidad de la cuantizacion, el build GGUF de 4 bits se midio contra el master bf16 en los mismos 580 items: excluyendo los casos donde se alcanzo el limite de tokens, ambos son indistinguibles (parseRate 93,0 vs 93,6 en 171 items). El build FP8 es una cuantizacion mas ligera, por lo que se espera una conclusion similar, aunque no se ha medido de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: el build FP8 ocupa 29 GB, por lo que se necesita una GPU con al menos 32 GB de memoria. No cabe en RTX 4090 (24 GB) ni en RTX 3090 (24 GB).
- GPUs recomendadas: H100, A100 80 GB, RTX 6000 Ada (48 GB) o superiores de arquitectura Hopper/Blackwell para FP8. Para el build GGUF de 4 bits, una GPU consumer de 24 GB (RTX 4090, RTX 3090) es suficiente.
- Opciones de despliegue: vLLM (recomendado, con el comando `vllm serve` documentado), llama.cpp para GGUF, y potencialmente Ollama si se convierte el modelo a ese formato.
- Latencia y throughput: no hay datos publicados para el build FP8. En el build GGUF, la generacion alcanza 62 tok/s sin la cabeza MTP y 109 tok/s con ella (+71%). Este build FP8 no incluye la cabeza MTP, por lo que la decodificacion especulativa no esta disponible.

## Comparativa con modelos similares

No existen otros modelos publicamente disponibles especializados en GeneXus con formato `.gxSource`. La comparacion mas relevante es con la version anterior del mismo modelo y con el modelo base sin fine-tune.

| Modelo | Parametros | Contexto | parseRate (GeneXus) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KBBridge-v3-FP8 | 27B | 262 144 | 84,8 | Apache 2.0 | HuggingFace |
| KBBridge-v2 | 27B (base Qwen3.6) | no disponible | 89,0 | Apache 2.0 | HuggingFace |
| Qwen3.8-27B (base) | 27B | no disponible | no disponible (sin fine-tune no genera `.gxSource` valido) | Apache 2.0 | HuggingFace |

Los modelos frontier (Claude, GPT, etc.) requieren ~21 600 tokens de documentacion inyectada para alcanzar un parse rate de 0,5–3,1%, muy por debajo del 84,8% de KBBridge-v3 sin documentacion.

## Limitaciones y advertencias

- El modelo no conoce ninguna Knowledge Base especifica. Aprendio el estilo y la sintaxis del formato, no el contenido de una base concreta. Si se le pregunta por una transaccion que no se ha pegado en el prompt, inventara nombres de atributos plausibles y los presentara como hechos.
- Generacion descontrolada en objetos muy grandes: para objetos de mas de ~10 KB, el modelo puede entrar en un bucle de generacion que no se detiene. Se recomienda validar siempre la salida en el IDE.
- No es un modelo de proposito general: esta especializado en GeneXus y su rendimiento en otras tareas de programacion o lenguaje natural no esta garantizado.
- El modo de razonamiento debe desactivarse explicitamente (`enable_thinking: false`). Si se deja activado, el bloque `thinking` puede no cerrarse dentro del presupuesto de tokens y la respuesta llega vacia o a medias.
- Se debe pedir el formato `.gxSource` de forma explicita en el prompt. Sin esa indicacion, el modelo devuelve SQL generico en lugar de objetos GeneXus.
- El presupuesto de tokens debe ser de al menos 4096. Un objeto `.gxSource` consume aproximadamente 340 tokens por KB de fuente, y la mayoria de las herramientas usan 512–1024 tokens por defecto, lo que trunca el objeto a mitad.
- Este build FP8 no incluye la cabeza MTP, por lo que la decodificacion especulativa no esta disponible. Si se necesita esa velocidad, hay que cuantizar el propio FP8 desde el master bf16.
- La caida de parseRate de v3 frente a v2 no esta atribuida a una causa concreta; la model card advierte que no se debe interpretar como que el corpus mas grande perjudico la sintaxis.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KBBridge/KBBridge-v3-FP8
- Modelo base (bf16, con cabeza MTP): https://huggingface.co/KBBridge/KBBridge-v3
- Sitio web de KBBridge: https://kbbridge.com/
- Blog sobre privacidad y control de datos: https://kbbridge.com/blog/your-knowledge-base-ai-and-control
- Paquete PyPI (servidor MCP): https://pypi.org/project/kbbridge/
- Servidor MCP en MCP Market: https://mcpmarket.com/server/kb-bridge
