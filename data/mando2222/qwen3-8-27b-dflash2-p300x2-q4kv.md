# mando2222/qwen3.8-27b-dflash2-p300x2-q4kv

## Resumen

Este repositorio no es un modelo de lenguaje entrenado desde cero, sino un checkpoint de despliegue publicado por el usuario `mando2222` bajo la libreria `tt-model` de Tenstorrent. Se trata de una configuracion de cache KV cuantizada en Q4 (concretamente BFLOAT4_B en paginacion) para ejecutar un modelo de la familia Qwen sobre cuatro chips Blackhole repartidos en dos placas P300. El autor lo deriva de `changh95/qwen3.8-27b-dflash2-p300x2`, del que hereda el nombre y los pesos.

La relevancia del artefacto es de infraestructura, no de investigacion: valida que la cuantizacion de la cache KV a 4 bits en hardware Tenstorrent mejora el rendimiento de decodificacion respecto al paquete BF8 distribuido por defecto, con incrementos medidos del 16 % en prompts cortos y del 22 % en prompts largos. Ademas, la configuracion por defecto `batch8-dflash2` emplea un pool compartido de 1.050.624 tokens de cache KV.

El repo ocupa solo 2,0 GB porque no contiene los pesos: el manifiesto apunta a repositorios fijados de Qwen y DFlash2. No se declara licencia, idiomas, pipeline ni datos de entrenamiento, y acumula 0 descargas y 0 likes, por lo que toda la validacion disponible procede del propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre del artefacto referencia Qwen y DFlash2; la model card no describe la arquitectura) |
| Parametros totales | no disponible (el nombre indica 27B, sin confirmacion en la documentacion) |
| Parametros activos | no aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | pool de cache KV compartido de 1.050.624 tokens en el perfil `batch8-dflash2`; prueba de contexto validada hasta 260.340 tokens |
| Tipos de cuantizacion | cache KV en BFLOAT4_B con paginacion (perfil por defecto); el paquete de referencia comparado es BF8 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible; los pesos no estan embebidos, el manifiesto apunta a repositorios fijados de Qwen y DFlash2 |
| Tamano del repositorio | 2,0 GB (codigo y manifiesto, sin pesos) |
| Hardware objetivo | 4 chips Blackhole en 2 placas P300 |
| Firmware validado | 19.15.0.0 |

## Arquitectura y entrenamiento

No hay informacion en la model card sobre la arquitectura interna del modelo subyacente, el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Todo lo publicado corresponde a la capa de despliegue: un checkpoint de cache KV cuantizada para el runtime `tt-model` sobre Blackhole, derivado de `changh95/qwen3.8-27b-dflash2-p300x2`.

El unico detalle tecnico verificable es la configuracion de memoria: perfil `batch8-dflash2`, cache KV paginada en BFLOAT4_B y un pool compartido de 1.050.624 tokens. El resto del rendimiento declarado es comparativo (mejoras porcentuales frente al paquete BF8), no absoluto. Tampoco se documenta que sea "DFlash2" mas alla de su aparicion en el nombre del artefacto.

## Capacidades

- Generacion de texto mediante el runtime `tt-model` (el pipeline no esta declarado en HuggingFace; la capacidad se deduce del comando `tt-model serve`).
- Tool calling: supero 4 de 4 casos de llamada a herramientas en la validacion del autor.
- Contexto largo: supero una prueba de contexto de 260.340 tokens.
- Concurrencia: 8 de 8 prompts unicos concurrentes de 73.422 tokens cada uno.
- Suite funcional: 10 de 10 casos funcionales superados.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio, decodificacion especulativa): no disponible.

## Casos de uso

- Servicio de inferencia de contexto largo sobre hardware Tenstorrent: desplegar el checkpoint con `tt-model serve` para atender peticiones que requieren cientos de miles de tokens de contexto, aprovechando el pool KV compartido de 1.050.624 tokens.
- Agentes con herramientas en produccion: los 4 de 4 casos de tool calling validados lo hacen apto para flujos de agente que necesitan invocar funciones externas, con la salvedad de que no se detalla el conjunto de pruebas.
- Procesamiento por lotes de prompts largos concurrentes: los 8 prompts unicos de 73.422 tokens simultaneos apuntan a escenarios de resumen o analisis de documentos extensos en paralelo.
- Sustitucion del paquete BF8 en un clúster Blackhole existente: si ya se opera con `changh95/qwen3.8-27b-dflash2-p300x2` en BF8, este checkpoint ofrece mejoras del 16-22 % en decodificacion sin cambiar de hardware.
- Recuperacion de capacidad en cargas sobrescritas de contexto largo: la mejora del 10,5 % convierte la octava peticion de encolada a residente, util en servicios con picos de concurrencia.
- Reproduccion y auditoria de rendimiento: reutilizar el arbol `code/` y el manifiesto para replicar las mediciones en un host con firmware 19.15.0.0.

## Benchmarks y rendimiento

Solo se publican resultados relativos frente al paquete BF8 distribuido, no cifras absolutas (no hay MMLU, HumanEval ni GSM8K):

| Prueba | Resultado |
|---|---|
| Rendimiento de decodificacion, prompts cortos | +16 % frente al paquete BF8 |
| Rendimiento de decodificacion, prompts largos | +22 % frente al paquete BF8 |
| Carga de contexto largo sobrescrita | +10,5 %; la octava peticion pasa de encolada a residente |
| Casos funcionales | 10/10 |
| Llamadas a herramientas | 4/4 |
| Prueba de contexto | 260.340 tokens superados |
| Prompts unicos concurrentes | 8/8 de 73.422 tokens |

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- Hardware obligatorio: 4 chips Blackhole en 2 placas P300. No se documenta soporte para otras configuraciones.
- Firmware: 19.15.0.0, la version empleada en la validacion.
- VRAM estimada: no disponible (la memoria relevante es el pool KV compartido de 1.050.624 tokens en las placas Blackhole).
- GPU recomendadas: no disponible. El artefacto esta atado al runtime `tt-model` de Tenstorrent y no se documenta ejecucion en GPU NVIDIA o AMD.
- GPU de consumo: no aplicable segun la informacion disponible.
- Opciones de despliegue: `tt-model pull mando2222/qwen3.8-27b-dflash2-p300x2-q4kv --with-weights` y `tt-model serve mando2222/qwen3.8-27b-dflash2-p300x2-q4kv`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: solo se publican mejoras relativas (+16 % y +22 % en decodificacion); no hay valores absolutos de tokens por segundo ni latencia por peticion.

## Comparativa con modelos similares

| Artefacto | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mando2222/qwen3.8-27b-dflash2-p300x2-q4kv` | nombre sugiere 27B (sin confirmar) | pool de 1.050.624 tokens; prueba de 260.340 tokens | referencia base del presente repo | no disponible | HuggingFace, 0 descargas, 0 likes |
| `changh95/qwen3.8-27b-dflash2-p300x2` (origen) | no disponible | no disponible | no disponible | no disponible | HuggingFace, referenciado como fuente |
| Paquete BF8 distribuido (referencia de comparacion) | no disponible | no disponible | -16 % y -22 % en decodificacion respecto a este checkpoint | no disponible | distribuido por el autor segun la model card |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en el material proporcionado.

## Limitaciones y advertencias

- El repositorio no contiene los pesos: son punteros a repositorios fijados de Qwen y DFlash2, por lo que el artefacto no es autosuficiente y depende de la disponibilidad de esos terceros.
- Requiere hardware Tenstorrent Blackhole (4 chips, 2 placas P300) y firmware 19.15.0.0; no hay evidencia de portabilidad a GPU convencional.
- No se declara licencia, lo que impide determinar si el uso comercial esta permitido. Es un riesgo legal relevante antes de cualquier despliegue en produccion.
- No hay informacion sobre datos de entrenamiento, idiomas soportados, sesgos ni tasas de alucinacion del modelo subyacente.
- Los resultados publicados proceden del propio autor, no han sido replicados de forma independiente y se midieron en un unico host (`/home/ttuser/qb2-model-test`), con una identidad de imagen concreta (`sha256:f791bfaac1d3239ca076c6790ffa0adcd0975529b6fab9289709758b1eece712`).
- Las metricas de rendimiento son exclusivamente relativas al paquete BF8; no permiten estimar latencia ni throughput absolutos.
- El repositorio tiene 0 descargas y 0 likes, sin senales de adopcion ni validacion por terceros.
- La nomenclatura "Qwen3.8-27B" no se corresponde con ningun tamano oficial verificado y no se confirma en la documentacion.
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los resultados obtenidos eran de tematica completamente distinta y no se han utilizado.

## Enlaces

- HuggingFace: https://huggingface.co/mando2222/qwen3.8-27b-dflash2-p300x2-q4kv
- Repositorio de origen citado en la model card: https://huggingface.co/changh95/qwen3.8-27b-dflash2-p300x2
- Paper, blog, repositorio o demo adicionales: no disponible (la busqueda web no devolvio resultados relevantes)
