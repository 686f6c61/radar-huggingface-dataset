# k-cascade/zils-flash-piccolo-9b

## Resumen

Zils d3-flash soup body: Piccolo-9B es un reempaquetado del modelo agentscope-ai/Piccolo-9B publicado por el usuario k-cascade bajo la etiqueta `zils` y `soup-body`. No se trata de un modelo entrenado desde cero ni de un fine-tuning: los pesos del modelo de lenguaje son los originales de Piccolo-9B, sin modificar, y los únicos cambios introducidos afectan a los nombres de los tensores y al layout de los shards para adaptarlos al formato que exige el "cuerpo" (body) del subred Zils de Bittensor (SN127), pool `d3-flash`.

El modelo base, Piccolo-9B, es un modelo de aproximadamente 8.390 millones de parámetros (8.392.695.024 según los safetensors del repositorio) desarrollado por agentscope-ai, presumiblemente orientado a tareas de decisión y agentes, a juzgar por la etiqueta `decision-model` que acompaña al reempaquetado. La relevancia de esta ficha es acotada: se trata de un artefacto de infraestructura para participantes del subnet Zils, no de una versión mejorada del modelo original, y su interés práctico para desarrolladores ajenos a ese ecosistema es limitado frente a usar directamente el repositorio de agentscope-ai.

La licencia es Apache 2.0, heredada del modelo original, y el repositorio ocupa 16,8 GB en formato safetensors. No se han publicado descargas ni interacciones en el momento de la consulta, y la model card no aporta información sobre contexto, idiomas, datos de entrenamiento ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer de agentscope-ai/Piccolo-9B; el reempaquetado no altera la arquitectura) |
| Parametros totales | 8.392.695.024 (~8,4 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo distribuye safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (shards reempaquetados; sin `lm_head` ni tensores `mtp`) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base. Por el nombre y el tamano (9B nominales, 8,39B reales en safetensors), se trata de un transformer de escala media, pero no se confirma si emplea attention estandar, variantes lineales, mezcla de expertos u otro diseno. Tampoco se detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF, DPO o instruction tuning.

Lo unico documentado es el proceso de reempaquetado: se parte de la revision `e54772a8beeefa22ba2fa675e3d1554493ed6b04` de agentscope-ai/Piccolo-9B y se renombran tensores y se reorganizan los shards para encajar en el layout del soup body de Zils. Los tensores `lm_head` y `mtp` no se incluyen en la distribucion, lo que implica que el modelo no es directamente ejecutable para generacion de texto sin restaurar esas cabezas desde el repositorio original. No hay innovaciones tecnicas atribuibles a este reempaquetado mas alla de la compatibilidad con el subnet.

## Capacidades

- No se documentan capacidades especificas en la informacion disponible; las capacidades reales son las del modelo base agentscope-ai/Piccolo-9B.
- La etiqueta `decision-model` sugiere un uso orientado a toma de decisiones o seleccion dentro de pipelines de agentes, pero no se aporta detalle funcional.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (presumible por la etiqueta, sin confirmacion).
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible.
- Generacion de texto directa: no garantizada en este repositorio, al faltar `lm_head`.

## Casos de uso

- Participacion en el subnet Zils (Bittensor SN127): el caso de uso principal y practicamente unico documentado. El repositorio existe para que nodos del pool `d3-flash` carguen los pesos en el layout esperado por el protocolo del subnet.
- Investigacion sobre mecanicas de subnets en Bittensor: util para estudiar como se reempaquetan pesos de modelos abiertos para integrarlos en pools de validacion y mineria, incluyendo el tratamiento de cabezas omitidas.
- Auditoria de procedencia de pesos: permite verificar que los tensores del modelo de lenguaje coinciden con la revision original de Piccolo-9B, gracias a que el autor declara que los pesos no se han modificado.
- Base para reconstruir un modelo ejecutable: un desarrollador podria combinar estos shards con el `lm_head` del repositorio original para obtener un checkpoint funcional, aunque en ese caso resulta mas directo usar agentscope-ai/Piccolo-9B.
- Evaluacion comparativa de artefactos derivados: sirve como ejemplo de publicacion derivada con licencia heredada y atribucion explicita, util en estudios sobre trazabilidad de modelos en HuggingFace.
- Despliegue en pipelines internos del subnet: si un operador necesita el formato soup body para integrarse con las herramientas de Zils, este repositorio evita tener que ejecutar la conversion por su cuenta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 16,8 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, 20-24 GB como minimo.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 9-10 GB; en 4 bits, alrededor de 5-6 GB (estimaciones teoricas segun el numero de parametros, no verificadas para este modelo).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para BF16; RTX 3090/4090 o GPUs de 16 GB con cuantizacion para inferencia ajustada.
- Cabe en GPU de consumo: si, en RTX 4090 sin cuantizar con contexto moderado, y en GPUs de 12-16 GB con cuantizacion, siempre que se restaure la cabeza `lm_head`.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama requeririan conversion previa, ya que el repositorio solo contiene safetensors reempaquetados y sin `lm_head`; el uso previsto es la carga por el runtime del subnet Zils.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| k-cascade/zils-flash-piccolo-9b | 8,39B | no disponible | Apache 2.0 | safetensors (sin `lm_head`/`mtp`) | Reempaquetado para subnet Zils; no ejecutable de forma autonoma |
| agentscope-ai/Piccolo-9B | ~9B (nominal) | no disponible | Apache 2.0 | safetensors | Modelo original; fuente de los pesos y de las cabezas omitidas |
| Alternativas de ~8-9B del ecosistema abierto (p. ej. Llama 3.1 8B, Qwen2.5 7B, Gemma 2 9B) | 7-9B | 8K-128K segun modelo | licencias variables | safetensors, GGUF | Modelos completos y ejecutables; comparacion de rendimiento no disponible para Piccolo-9B |

No se dispone de datos de rendimiento del modelo base que permitan una comparacion cuantitativa con alternativas de su categoria.

## Limitaciones y advertencias

- El repositorio no incluye `lm_head` ni tensores `mtp`, por lo que no es un checkpoint listo para inferencia de texto sin trabajo adicional de reconstruccion.
- No es un fine-tuning ni una mejora: cualquier limitacion del modelo base Piccolo-9B se hereda intacta.
- La model card no documenta sesgos, tasas de alucinacion, idiomas ni comportamiento en produccion; no hay base para evaluar su fiabilidad.
- El contexto maximo es desconocido, lo que impide planificar cargas con ventanas largas.
- La licencia Apache 2.0 permite uso comercial, pero la atribucion a los autores originales es obligatoria y el autor del reempaquetado la declara explicitamente; conviene conservar los ficheros de licencia incluidos.
- El modelo esta pensado para el subnet Zils; su uso fuera de ese ecosistema carece de soporte y documentacion.
- Sin descargas ni validacion de la comunidad en el momento de la consulta, no hay evidencia externa de que el reempaquetado cargue correctamente en todos los runtimes.
- El nombre "9B" del identificador no coincide exactamente con los 8,39B reales; conviene usar la cifra de safetensors para estimaciones de memoria.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/k-cascade/zils-flash-piccolo-9b
- Modelo base: https://huggingface.co/agentscope-ai/Piccolo-9B
- Revision del modelo base referenciada: `e54772a8beeefa22ba2fa675e3d1554493ed6b04`
- Zils subnet (Bittensor SN127): no disponible en la informacion proporcionada
- Paper, blog o demo del modelo base: no disponible en la informacion proporcionada
