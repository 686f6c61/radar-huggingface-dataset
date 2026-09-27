# blackfan23/Dirk-Qwen3.8-27B-GGUF

## Resumen

Dirk-Qwen3.8-27B-GGUF es una cuantizacion en formato GGUF del modelo denso Qwen3.8-27B, un modelo de vision-lenguaje (image-text-to-text) de 27.320.697.856 parametros desarrollado originalmente por Qwen. La ficha analizada corresponde al repositorio `blackfan23/Dirk-Qwen3.8-27B-GGUF`, que reproduce la model card del proyecto Dirk atribuido a `peculiar-ragdoll` (los resultados de busqueda apuntan a `peculiar-ragdoll/Dirk-Qwen3.8-27B-GGUF` como repositorio original, con espejos en `npario/Dirk-Qwen3.8-27B-GGUF` y en `local-ai-zone`).

Lo que distingue a Dirk del cuantizado estandar no son los pesos, sino la plantilla de chat: los pesos y los tensores MTP (`nextn`) quedan intactos, y el unico cambio es la Sharp chat template, que anade un system prompt de concision y desactiva el `reasoning_effort=xhigh` forzado del modelo base. Segun la model card, esto produce las mismas respuestas con aproximadamente la mitad de tokens en el benchmark Claw-Eval (+7,4 puntos de acierto, -59 % de tokens) y un -22 % de tokens por respuesta correcta en MMLU-Pro.

La relevancia practica esta en el binomio eficiencia-idioma: es un modelo de 27B con vision, cabecera MTP para decodificacion especulativa y una escalera de cuantizaciones que cubre desde tarjetas de 12 GB hasta 24 GB, licencia Apache 2.0 y ejecucion directa con llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso vision-lenguaje (image-text-to-text); sin mezcla de expertos (no es MoE) |
| Parametros totales | 27.320.697.856 (27,32 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: IQ2_XS, Q2_K_XL, IQ2_S, IQ3_XXS, IQ3_S, Q3_K_XL, IQ4_XS, Q4_K_S, Q4_K_XL (listado truncado en la model card). Dos familias: Unsloth Dynamic 3.0 (UD) desde 3 bpw y GSQ-RCO de IST-DASLab por debajo de 3 bpw |
| Idiomas soportados | en, zh (las etiquetas del repositorio incluyen ademas `ar`) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); metadatos GGUF con la plantilla intercambiada en bytes, tensores de pesos y MTP intactos |
| Cabecera MTP | si, `nextn` conservada en todos los tiers para decodificacion especulativa |
| Tamano del repo | 240,6 GB (agrega todos los ficheros cuantizados) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3.8-27B, presentado por Qwen como la generacion mas capaz de su familia abierta y construido sobre la base arquitectonica de Qwen3.5, con mejoras en codigo, trabajo profesional, investigacion y tareas agenticas de horizonte largo. Se trata de un transformer denso de 27B parametros con capacidad de vision (pipeline `image-text-to-text`), no de una arquitectura MoE ni hibrida. La model card de Dirk no aporta informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni las fases de RLHF/DPO aplicadas por Qwen.

La innovacion tecnica del cuantizado Dirk es triple. Primero, la preservacion de la cabecera MTP (`nextn`) en todos los tiers, de modo que los runtimes con decodificacion especulativa multi-token pueden acelerar la generacion. Segundo, la eleccion de cuantizador por rango de bits: Unsloth Dynamic 3.0 en 3 bpw o mas y GSQ-RCO de IST-DASLab en 2-3 bpw, donde segun el autor estos ultimos aguantan sustancialmente mejor. Tercero, la Sharp chat template (plantilla fija de Qwen de froggeric mas system prompt de concision y desactivacion del razonamiento `xhigh` por defecto), con opt-out de concision via `chat_template_kwargs: {"terse": false}`. Los tiers `GSQ-RCO-` llevan la version `v22.4.1` de la plantilla, que ademas se retira cuando el runtime inyecta su propio protocolo de herramientas (correccion para LM Studio); los tiers `UD-` llevan `v22.4.0`.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles y chino.
- Razonamiento con nivel de esfuerzo configurable: `low`, `medium` y `xhigh` (`high` es un alias de `xhigh`, no un escalon intermedio). Por defecto, Dirk opera en `medium`, el nivel nativo del modelo, en lugar del `xhigh` forzado del Qwen3.8-27B original.
- Modo sin pensamiento explicito mediante `"enable_thinking": false`.
- Codificacion agentica: el repositorio se etiqueta como `agentic-coding` y los resultados de SWE-bench-Live miden resolucion de tareas de reparacion de codigo.
- Vision: procesamiento de imagen y texto (pipeline `image-text-to-text`), preservado en la cuantizacion.
- Decodificacion especulativa mediante la cabecera MTP (`nextn`) incluida en cada tier.
- Eficiencia de tokens por diseno de plantilla: respuestas mas cortas para el mismo contenido, con el objetivo declarado de mantener o subir la precision.
- Compatibilidad con endpoints (`endpoints_compatible`) y uso con llama.cpp; el campo OpenAI-style `reasoning_effort` de nivel superior es descartado por llama.cpp y oMLX, por lo que debe pasarse dentro de `chat_template_kwargs`.
- Uso de cuantizacion con imatrix (etiqueta `imatrix` en el repositorio).

## Casos de uso

- Reparacion de bugs en repositorios reales: el modelo esta medido sobre SWE-bench-Live con 25 tareas asentadas, donde la version Sharp alcanza una correccion en el 37 % del tiempo mediano de la plantilla estandar en la banda que ambas resuelven (2,7x mas rapido). Es adecuado como agente de parcheo en pipelines de integracion continua que necesiten reducir el coste por tarea resuelta.
- Asistentes de codigo en local con tarjeta de 12 GB: el tier `GSQ-RCO-IQ2_S` (9,6 GB) es la recomendacion explicita del autor para tarjetas de 12 GB, con margen para contexto real; permite un copiloto de codigo sin enviar codigo a servicios en la nube.
- Agentica de multiples pasos con protocolo de herramientas: los tiers `GSQ-RCO-` incorporan la plantilla `v22.4.1`, que se retira cuando el runtime inyecta su propio protocolo de tool calling, evitando conflictos de formato en clientes tipo LM Studio.
- Documentos y capturas en chino e ingles: al conservar la vision y ambos idiomas, sirve para extraccion de informacion de imagenes, diagramas o capturas con texto en cualquiera de los dos idiomas.
- Razonamiento con coste controlado por peticion: en produccion se puede fijar `low` para clasificacion o extraccion y `xhigh` para tareas analiticas, ajustando el gasto de tokens por llamada en lugar de pagar el maximo esfuerzo en todas.
- Despliegue en estaciones de trabajo de 16 GB: el tier `UD-IQ4_XS` (14,3 GB) es el "pick" de 16 GB segun el autor, con calidad de 4 bits y espacio para contexto; util para analisis de datos y generacion de informes asistida en local.
- Servidores con GPU de 24 GB: `UD-Q4_K_XL` (17,6 GB) es el punto de partida recomendado por el autor para tarjetas de 24 GB, como backend de una API interna compatible con endpoints.
- Aceleracion de inferencia con decodificacion especulativa: al conservar la cabecera MTP, los runtimes que la soportan pueden reducir la latencia por token frente a un GGUF que la haya descartado.

## Benchmarks y rendimiento

Datos publicados en la model card. Algunas cifras corresponden a Dirk y otras al modelo Dagger (mismo peso base ThinkingCap-27B, solo con la plantilla intercambiada), que el autor usa como evidencia previa de la plantilla.

| Benchmark | Modelo medido | Resultado |
|---|---|---|
| MMLU-Pro (precision) | Dirk (medium) | 85,3 % (el mas alto de la comparativa mostrada) |
| MMLU-Pro (tiempo hasta respuesta correcta) | Nail (MoE 35B-A3B) | 43 s (el mas rapido); el resto de valores no disponibles |
| SWE-bench-Live, 25 tareas asentadas | Dirk / Sharp Qwen3.8-27B | Alcanza la correccion en el 37 % del tiempo mediano de la plantilla estandar en la banda que ambas resuelven (2,7x mas rapido); supera a Opus 5 (high) 15 a 14; queda una resolucion por detras del modelo con plantilla estandar |
| Claw-Eval, componente de respuesta | Dagger (ThinkingCap-27B), plantilla estandar vs Sharp | 59,3 -> 66,7 (+7,4) |
| Claw-Eval, tokens de respuesta | Dagger, plantilla estandar vs Sharp | 5.393 -> 2.217 (-59 %) |
| MMLU-Pro, tokens por respuesta correcta | Dagger, plantilla estandar vs Sharp | 1.601 -> 1.248 (-22 %) |

Los resultados de Claw-Eval y de tokens por respuesta correcta en MMLU-Pro no se midieron sobre Dirk, sino sobre el modelo Dagger con el mismo cambio de plantilla. Las precisiones individuales de Qwen3.6-27B, Dagger, Qwen3.8-27B (medium) y Nail en MMLU-Pro no estan disponibles en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada por tier segun la tabla de ficheros del autor (tamano de fichero, no consumo en runtime):
  - `GSQ-RCO-IQ2_XS`: 8,8 GB. Recomendado para tarjeta de 12 GB con margen para contexto real.
  - `GSQ-RCO-IQ2_S`: 9,6 GB. El "pick" de 12 GB.
  - `UD-Q2_K_XL`: 9,8 GB. Se mantiene por continuidad; el autor prefiere `IQ2_S`, mas pequeno y mejor.
  - `GSQ-RCO-IQ3_XXS`: 10,4 GB. Cabe en 16 GB con holgura y en 12 GB con contexto corto.
  - `GSQ-RCO-IQ3_S`: 12,1 GB. Calidad cercana a la base; la opcion con mejor relacion calidad-precio si el techo son 16 GB.
  - `UD-Q3_K_XL`: 13,1 GB. Cabe en 16 GB con margen; el autor prefiere `IQ4_XS` salvo que se necesite ese ~1 GB extra para contexto.
  - `UD-IQ4_XS`: 14,3 GB. El "pick" de 16 GB, con espacio para contexto real.
  - `UD-Q4_K_S`: 15,4 GB. 4 bits ajustado, util cuando `Q4_K_XL` no cabe junto al contexto.
  - `UD-Q4_K_XL`: 17,6 GB. Punto de partida recomendado para tarjeta de 24 GB.
- Cabe en GPU de consumo: si, desde tarjetas de 12 GB (tiers de 1,5-2,5 bpw) hasta 24 GB (tiers de 4 bits). El listado de la model card esta truncado, por lo que puede haber tiers adicionales.
- GPU de datacenter: no se especifican recomendaciones para A100, H100 ni similares en la informacion disponible.
- Opciones de despliegue: llama.cpp como runtime de referencia; el autor menciona tambien oMLX y LM Studio (con la correccion de protocolo de herramientas en `v22.4.1`). La etiqueta `endpoints_compatible` sugiere uso como backend de API. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles como cifras absolutas. Como referencias relativas, la plantilla Sharp alcanza la correccion en el 37 % del tiempo mediano de la plantilla estandar en SWE-bench-Live (2,7x), y Nail (MoE 35B-A3B) tarda 43 s en dar una respuesta correcta en MMLU-Pro. No se publica el valor equivalente de Dirk.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Dirk-Qwen3.8-27B | Denso VLM (Qwen3.8-27B) | 27,32 B | no disponible | MMLU-Pro 85,3 %; SWE-bench-Live 15 a 14 frente a Opus 5 (high) | apache-2.0 | GGUF, varios tiers |
| Nail | MoE | 35 B totales, A3B activos | no disponible | El mas rapido hasta respuesta correcta en MMLU-Pro (43 s); precision no disponible | no disponible | no disponible |
| TielCoder (Sharp Ornith-1.5) | MoE, 4 bits | 35 B totales, A3B activos | no disponible | Comparado en SWE-bench-Live junto a Dirk | no disponible | no disponible |
| Dagger (ThinkingCap-27B) | no disponible | 27 B | no disponible | Claw-Eval 66,7 con plantilla Sharp; 1.248 tokens por acierto en MMLU-Pro | no disponible | GGUF con MTP |
| Qwen3.8-27B (stock) | Denso VLM | 27 B | no disponible | Peor relacion tokens/acierto que Dirk con la misma plantilla base | apache-2.0 (segun el modelo base) | safetensors y GGUF |
| Opus 5 / Sonnet 5 (cloud) | no disponible | no disponible | no disponible | Opus 5 (high) pierde 14-15 frente a Dirk en SWE-bench-Live | propietaria | solo API |

Los datos de contexto, licencia y parametros de Nail, TielCoder y Dagger no estan en la informacion proporcionada. La comparativa de rendimiento con los modelos cloud procede de una unica tabla de 25 tareas de SWE-bench-Live y debe tratarse como indicativa, no como una evaluacion exhaustiva.

## Limitaciones y advertencias

- Los sesgos no estan documentados en la informacion disponible; se heredan los del modelo base Qwen3.8-27B, sin evaluacion publicada en esta ficha.
- Riesgo de alucinacion: no se han publicado tasas de alucinacion ni evaluaciones de veracidad para Dirk ni para sus cuantizaciones.
- La plantilla Sharp modifica el comportamiento respecto al modelo original (elimina el `xhigh` por defecto y anade un prompt de concision). Puede degradar tareas que se beneficiaban del razonamiento de maximo esfuerzo si no se sube el nivel manualmente.
- El campo `reasoning_effort` de nivel superior estilo OpenAI se descarta en llama.cpp y oMLX: si se pasa fuera de `chat_template_kwargs`, se ignora silenciosamente. Riesgo de configuracion incorrecta en produccion.
- `high` no es un nivel intermedio: es un alias de `xhigh`. Documentarlo mal en un cliente puede provocar un consumo de tokens muy superior al esperado.
- Los tiers `UD-` llevan la plantilla `v22.4.0` y no incluyen la correccion de protocolo de herramientas de `v22.4.1`; con runtimes que inyectan su propio protocolo, los tiers `GSQ-RCO-` son preferibles.
- Idiomas soportados limitados a ingles y chino (mas arabe segun las etiquetas). No hay soporte declarado de castellano; el rendimiento en espanol es desconocido.
- La longitud de contexto no se declara en la informacion disponible. Los tiers de 2 bits mas pequenos dejan muy poco margen de contexto en tarjetas de 12 GB.
- Los tamanos de fichero indicados no equivalen al consumo de VRAM en runtime, que incluye contexto, cache KV y overhead del runtime.
- Licencia Apache 2.0, que permite uso comercial, pero el cumplimiento de las condiciones del modelo base Qwen3.8-27B debe verificarse por separado.
- Este repositorio concreto (`blackfan23`) tiene 0 descargas y 0 likes, y su model card no identifica al cuantizador original. Los resultados de busqueda apuntan a `peculiar-ragdoll` como autor de Dirk y a `local-ai-zone` con 912.471 descargas y 190 likes, lo que sugiere que este repositorio es un espejo. Conviene verificar la procedencia de los pesos antes de usarlos en produccion.
- Los identificadores arXiv `2604.18556` y `2605.00649` aparecen en las etiquetas sin contexto; su contenido no esta disponible en la informacion proporcionada.
- El listado de ficheros de la model card esta truncado, por lo que la escalera de cuantizaciones completa y los tiers de mayor tamano no estan disponibles.

## Enlaces

- Repositorio analizado: https://huggingface.co/blackfan23/Dirk-Qwen3.8-27B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio original de Dirk (segun resultados de busqueda): https://huggingface.co/peculiar-ragdoll/Dirk-Qwen3.8-27B-GGUF
- Espejo de Dirk: https://huggingface.co/npario/Dirk-Qwen3.8-27B-GGUF
- README del espejo: https://huggingface.co/npario/Dirk-Qwen3.8-27B-GGUF/blob/main/README.md
- Ficha en aimodels.fyi sobre Dirk de peculiar-ragdoll: https://www.aimodels.fyi/models/huggingFace/dirk-qwen3.8-27b-gguf-peculiar-ragdoll
- Ficha en local-ai-zone: https://local-ai-zone.github.io/models/dirk-qwen3-8-27b.html
- Plantillas Sharp chat: https://huggingface.co/peculiar-ragdoll/Qwen-Sharp-Chat-Templates
- Cuantizaciones GSQ-RCO de IST-DASLab: https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF
- Documentacion de Unsloth Dynamic 3.0: https://unsloth.ai/docs/basics/dynamic-3.0-ggufs
- GGUF de Qwen3.8-27B de Unsloth en ModelScope: https://www.modelscope.cn/models/unsloth/Qwen3.8-27B-GGUF
- Dagger-Qwen3.6-27B-GGUF-MTP (referencia de la plantilla): https://huggingface.co/peculiar-ragdoll/Dagger-Qwen3.6-27B-GGUF-MTP
- arXiv referenciado en las etiquetas: arxiv:2604.18556 (contenido no disponible)
- arXiv referenciado en las etiquetas: arxiv:2605.00649 (contenido no disponible)
