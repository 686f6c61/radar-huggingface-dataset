# alexnodeland/site-needle

## Resumen

site-needle es un adaptador LoRA publicado por alexnodeland sobre Cactus-Compute/needle2, un modelo de tool calling de 45 millones de parametros de Cactus Compute (14 MB en formato .cact de 2 bits). El resultado es un enrutador de intenciones para el sitio personal alexnodeland.com: dada la pregunta de un visitante, devuelve exactamente una de cinco herramientas tipadas (`lookup_role`, `lookup_project`, `check_skill`, `search_site`, `contact`) o la llamada vacia cuando la consulta esta fuera de tema, contiene una inyeccion, esta negada o es puramente conversacional. El modelo no genera prosa: el chat del sitio recupera y redacta la respuesta; este modelo solo decide que hay que consultar.

La relevancia del modelo es doble. Por un lado, demuestra el patron de "router de intenciones" con un modelo diminuto que se ejecuta en CPU (latencia p50 de 44 ms y 66 MB de RAM pico en el conjunto de evaluacion), lo que permite filtrar y clasificar consultas antes de invocar un LLM mayor. Por otro, sirve como plantilla reproducible de especializacion de un modelo generico de function calling a un dominio muy concreto mediante LoRA, con un corpus derivado del contenido del sitio (11 roles, 2 titulaciones, 22 proyectos, 14 entradas).

El ajuste se hizo con LoRA de rango 32 sobre las cinco proyecciones de atencion, con entrenamiento quantization-aware sobre el esquema de 2 bits del checkpoint base. Los resultados declarados por el autor muestran una mejora clara en objetivo exacto (de 0,173 a 0,507) y en precision de herramienta (de 0,320 a 0,706), pero tambien un empeoramiento en la tasa de rechazos omitidos y en la tasa de paso critico, un caveat importante para uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; adaptador LoRA sobre Cactus-Compute/needle2 (modelo base de tool calling, 45 M de parametros) |
| Parametros totales | 45 M en el modelo base; el adaptador anade LoRA de rango 32 (alpha 64) sobre las cinco proyecciones de atencion |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; el entrenamiento LoRA uso secuencias de 512 tokens |
| Tipos de cuantizacion | 2 bits (esquema de cuantizacion del checkpoint base, aplicado de forma quantization-aware); artefacto desplegable de 14 MB en formato .cact |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 (la licencia del modelo base no consta en la informacion proporcionada) |
| Formato de pesos | Adaptador LoRA (repositorio de 0,0 GB); despliegue mediante checkpoint `.cact` de 2 bits y la libreria cactus-needle 2.0.13 |
| Modelo base | Cactus-Compute/needle2 |
| Dataset de entrenamiento | alexnodeland/site-needle-corpus (corpus `sha256:a33cb2275939`) |
| Tamano del repositorio | 0,0 GB |
| Fecha de creacion / actualizacion | 2026-09-10 / 2026-09-10 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se especifica en la informacion disponible la arquitectura interna del modelo base Needle 2 de Cactus Compute, mas alla de su naturaleza de modelo de tool calling de 45 M de parametros y de su ejecucion on-device (incluida CPU). Lo que si esta documentado es la intervencion realizada: un ajuste fino con LoRA de rango 32 y alpha 64 aplicado a las cinco proyecciones de atencion, con tasa de aprendizaje 0,0002, tamano de lote 8, 3 epocas (783 pasos con longitud de secuencia 512), semilla 0 y entrenamiento quantization-aware a traves del esquema de 2 bits del checkpoint. El entrenamiento se ejecuto con cactus-needle 2.0.13 y jax 0.11.1 sobre CPU. La perdida final fue 0,0294 con validacion 0,0441, y se selecciono la epoca 2 de 3 por mayor objetivo en el conjunto de desarrollo.

Los datos de entrenamiento derivan del contenido del sitio en `sha256:05401f9493d9` (11 roles, 2 titulaciones, 22 proyectos, 14 entradas) y suman 2314 ejemplos: preguntas asistente generadas por plantilla sobre esas entidades, casos de rechazo y registros de extraccion construidos a partir de la prosa del sitio. La evaluacion se hizo con 272 casos reservados sobre formulaciones y entidades no vistas, mas 76 preguntas escritas a mano que nunca se generaron ni se usaron para seleccionar la epoca. No consta en la informacion disponible el uso de RLHF o DPO.

## Capacidades

- Enrutado de intenciones a cinco herramientas tipadas del sitio: `lookup_role`, `lookup_project`, `check_skill`, `search_site` y `contact`.
- Emision de una llamada vacia como mecanismo de rechazo para consultas fuera de tema, con inyeccion, negadas o conversacionales.
- Extraccion de argumentos en texto libre copiados textualmente de la pregunta (por ejemplo, `{'name': 'lookup_role', 'arguments': {'company': 'musiio'}}`).
- Function calling y tool calling en formato estructurado, con salida limitada a la seleccion de herramienta y sus argumentos.
- Ejecucion on-device: 14 MB en 2 bits y 66 MB de RAM pico medida en el conjunto de evaluacion reservado, sin necesidad de GPU.
- Generacion determinista y rapida: 1131 tokens/s de decodificacion y latencia p50 de 44 ms en el motor nativo.
- Capacidad de generalizacion parcial a formulaciones nuevas (`paraphrase`, 0,45 de objetivo exacto), entidades no vistas (`novel_entity`, 0,50) y preguntas naturales (`natural`, 0,55).
- No soporta generacion de prosa, vision, audio, razonamiento multi-paso ni agentes: la model card indica explicitamente que el modelo solo decide que consultar.

## Casos de uso

- Enrutado de intenciones en el chat de un portafolio profesional: el modelo recibe la pregunta del visitante y devuelve la llamada a herramienta adecuada; el sistema de chat del sitio se encarga despues de recuperar el dato y redactar la respuesta. Es el escenario para el que fue entrenado explicitamente.
- Router economico previo a un LLM grande en una arquitectura RAG: al resolver la clasificacion en CPU con 66 MB de RAM pico y 44 ms de mediana, evita invocar un modelo mayor para consultas que se resuelven con una busqueda estructurada.
- Despliegue totalmente en el cliente (navegador, movil o edge): los 14 MB del artefacto `.cact` en 2 bits permiten ejecutar el router dentro del dispositivo, sin enviar la consulta a un servidor y sin GPU.
- Filtrado y derivacion de consultas fuera de alcance: la llamada vacia actua como rechazo, de modo que el front-end puede redirigir al formulario de contacto en lugar de intentar responder.
- Extraccion de argumentos para busquedas en el sitio: los argumentos de texto libre se copian verbatim de la pregunta y se resuelven despues contra los datos del sitio con comparacion insensible a mayusculas y minusculas.
- Analitica de intenciones: agregar las cinco categorias de herramienta y la tasa de llamadas vacias permite medir que busca realmente la audiencia de un sitio sin registrar la consulta completa.
- Plantilla para routers de dominio especificos: el pipeline (corpus derivado del contenido + LoRA de rango 32 + evaluacion con conjunto reservado y conjunto escrito a mano) es replicable en otros sitios o catalogos de herramientas con un coste de entrenamiento muy bajo.
- Control de acceso a acciones sensibles: dado que el modelo distingue entre consulta legitima y peticion conversacional o manipulada, puede usarse como primera barrera antes de habilitar acciones como `contact`.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente). Conjunto reservado de 272 casos, motor nativo, comparando el modelo base con el ajustado:

| Metrica | Base | Ajustado | Delta |
|---|---:|---:|---:|
| Objetivo (llamada exacta) | 0,173 | 0,507 | +0,335 |
| Precision de herramienta | 0,320 | 0,706 | +0,386 |
| F1 de argumentos | 0,215 | 0,538 | +0,323 |
| Tasa de rechazo falso | 0,149 | 0,000 | -0,149 |
| Tasa de rechazo omitido | 0,567 | 0,967 | +0,400 |
| Tasa de paso critico | 0,500 | 0,125 | -0,375 |
| Latencia p50 / p95 (ms) | 56 / 125 | 44 / 99 | |
| Decodificacion (tok/s) | 1126 | 1131 | |
| RAM pico (MB) | 245 | 66 | |

Desglose por segmento del conjunto reservado (objetivo exacto):

| Segmento | n | Base | Ajustado | Delta |
|---|---:|---:|---:|---:|
| Natural | 131 | 0,14 | 0,55 | +0,412 |
| Entidad nueva | 30 | 0,23 | 0,50 | +0,267 |
| Parafrasis | 108 | 0,20 | 0,45 | +0,250 |
| Prompts del sitio | 3 | 0,00 | 0,67 | +0,667 |

Conjunto escrito a mano de 76 preguntas, nunca generadas ni usadas para seleccionar la epoca:

| Metrica | Base | Ajustado | Delta |
|---|---:|---:|---:|
| Objetivo (llamada exacta) | 0,210 | 0,342 | +0,132 |
| Precision de herramienta | 0,342 | 0,553 | +0,210 |
| F1 de argumentos | 0,196 | 0,397 | +0,201 |
| Tasa de rechazo falso | 0,140 | 0,000 | -0,140 |
| Tasa de rechazo omitido | 0,632 | 0,895 | +0,263 |
| Tasa de paso critico | 0,500 | 0,167 | -0,333 |
| Latencia p50 / p95 (ms) | 60 / 123 | 41 / 68 | |
| Decodificacion (tok/s) | 1127 | 1234 | |
| RAM pico (MB) | 261 | 64 | |

Metricas del model-index publicadas en HuggingFace (mismo autor, sin verificacion independiente):

| Tarea | Objetivo exacto | Precision de herramienta | F1 de argumentos | Rechazo falso | Rechazo omitido |
|---|---:|---:|---:|---:|---:|
| Intent routing (split test reservado) | 0,5074 | 0,7059 | 0,538 | 0,0000 | 0,9667 |
| Intent routing (split handwritten) | 0,3421 | 0,5526 | 0,3973 | 0,0000 | 0,8947 |

No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni equivalentes); el autor solo reporta metricas de enrutado propias sobre su corpus.

## Requisitos de hardware

- VRAM estimada: no aplica en el escenario documentado; el modelo se ejecuta en CPU. Los pesos del modelo ajustado ocupan 14 MB en 2 bits.
- RAM pico: 66 MB en el conjunto reservado y 64 MB en el conjunto escrito a mano (frente a 245-261 MB del modelo base), segun las mediciones del autor.
- GPU recomendadas: no se documenta ninguna GPU concreta. No es necesario acelerador para ejecutar el checkpoint en el motor nativo.
- Cabe en GPU de consumo: si, pero es irrelevante; tambien cabe en CPU, en un movil y potencialmente en un entorno WASM por el tamano del artefacto.
- Opciones de despliegue: libreria `needle` (cactus-needle 2.0.13, jax 0.11.1 en CPU) con el fichero `.cact` y el catalogo `tools.json` mas el `system.txt` del modelo. No hay informacion disponible sobre soporte en vLLM, llama.cpp, Ollama o TGI: el artefacto es un `.cact` de 2 bits, no un GGUF ni safetensors de inferencia.
- Latencia y throughput medidos: p50 de 44 ms y p95 de 99 ms en el conjunto reservado; p50 de 41 ms y p95 de 68 ms en el escrito a mano; 1131 y 1234 tokens/s de decodificacion respectivamente.
- Coste de entrenamiento: el ajuste LoRA se ejecuto integramente en CPU con jax 0.11.1, 783 pasos, lote 8 y secuencias de 512 tokens.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de terceros en la informacion proporcionada, por lo que la comparacion se limita al propio modelo base y a la ausencia de alternativas documentadas.

| Modelo | Parametros | Contexto | Objetivo exacto (test reservado) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| site-needle | 45 M (base) + LoRA rango 32 | No disponible | 0,507 | Apache 2.0 | HuggingFace (0 descargas) |
| Cactus-Compute/needle2 (base) | 45 M | No disponible | 0,173 | No disponible en la informacion proporcionada | HuggingFace |
| Alternativas de la misma categoria | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- El ajuste fino no actualiza la cabeza de confianza del modelo base: el campo `confidence` devuelve `None`. La decision debe basarse en la llamada en si (una llamada vacia equivale a rechazo).
- Solo ingles, y solo preguntas sobre un unico sitio. Cualquier otro dominio deberia devolver la llamada vacia.
- Los argumentos de texto libre se copian literalmente de la pregunta; hay que resolverlos contra los datos del sitio con comparacion insensible a mayusculas y minusculas.
- La tasa de rechazo omitido empeora claramente con el ajuste: pasa de 0,567 a 0,967 en el conjunto reservado y de 0,632 a 0,895 en el escrito a mano. Es decir, el modelo ajustado casi nunca emite la llamada vacia cuando deberia hacerlo, lo que en produccion implica enrutar fuera de alcance hacia una herramienta en lugar de rechazar.
- La tasa de paso critico cae de 0,500 a 0,125 (conjunto reservado) y de 0,500 a 0,167 (escrito a mano), un descenso de mas del 70 %. Si el paso critico refleja los casos que no admiten error, el ajuste degrada justamente los casos mas sensibles.
- La tasa de rechazo falso baja a 0,000, coherente con un modelo sobre-eager: nunca rechaza lo que deberia aceptar, pero tampoco rechaza lo que deberia rechazar.
- Precision moderada en el mejor de los casos: el 50,74 % de llamadas exactas y el 70,59 % de acierto de herramienta en el conjunto reservado dejan margen amplio de error en argumentos.
- El rendimiento en el conjunto escrito a mano (0,342 de objetivo exacto) es sustancialmente inferior al del conjunto reservado generado, lo que sugiere sobreajuste a las plantillas del corpus.
- Licencia Apache 2.0 para este adaptador, pero la licencia de Cactus-Compute/needle2 no consta en la informacion proporcionada; conviene verificarla antes de un uso comercial del modelo derivado.
- Cero descargas y cero likes; las metricas estan declaradas por el autor (`verified: false`) y no se han reproducido de forma independiente.
- Sin pipeline declarado en HuggingFace («Pipeline: no disponible») ni documentacion de compatibilidad con los servidores de inferencia habituales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alexnodeland/site-needle
- Modelo base: https://huggingface.co/Cactus-Compute/needle2
- Dataset de entrenamiento y evaluacion: https://huggingface.co/datasets/alexnodeland/site-needle-corpus
- Repositorio con el pipeline (`apps/model`): https://github.com/alexnodeland/alexnodeland
- Sitio para el que se entreno el modelo: https://alexnodeland.com
- Referencia de trazabilidad: run `20260910-151420-f6806a4`, git `f6806a4c07b66e3e3b9c3f3b1bffb8468f73d9a2`, 2026-09-10T15:14:20+00:00
- Busqueda web: no se han encontrado enlaces relevantes; los resultados devueltos corresponden a paginas corporativas de Microsoft y no guardan relacion con el modelo.
