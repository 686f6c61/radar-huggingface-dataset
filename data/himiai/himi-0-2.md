# HimiAI/Himi-0.2

## Resumen

Himi 0.2 es un runtime de memoria externa desarrollado por HimiAI que se acopla sobre un backbone congelado Qwen2.5-1.5B. En lugar de ampliar la ventana de atencion o reentrenar el modelo base, almacena el contexto en unos bancos de memoria compactos y responde a preguntas de recuerdo exacto desde esa memoria mientras genera con una ventana activa corta. Los pesos del backbone no se modifican: el repositorio aporta unicamente los pesos de memoria (himi02_banks.safetensors) y el motor que los conecta.

El objetivo declarado es reducir la huella de la cache KV en contextos largos. Frente a los 28,7 KB por token de una cache KV completa en bf16, Himi 0.2 mantiene unos bancos fijos de 151 MB mas una cache de lectura comprimida de 4,6 KB por token. A 128k tokens esto supone aproximadamente 755 MB frente a 3,67 GB (una reduccion de 4,9x) y a 1M tokens unos 4,9 GB frente a 28,7 GB (5,8x).

Se trata de un proyecto experimental con licencia Apache-2.0, orientado especificamente al recuerdo exacto de hechos y no al dialogo libre. En el momento de redactar esta ficha acumula 0 descargas y 0 likes, por lo que su evaluacion se limita a los resultados publicados por el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-1.5B, congelado) con runtime de memoria externa de tamano fijo |
| Parametros totales | Backbone: 1,5 mil millones (Qwen2.5-1.5B). Bancos de memoria: 151 MB en bf16 (recuento exacto de parametros de los bancos no disponible) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 2048 tokens por segmento; los contextos mayores se escriben en segmentos consecutivos. La tabla de huella de memoria cubre hasta 1M tokens. Contexto nativo del backbone: no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Memoria en bf16; cuantizaciones del backbone no especificadas (no disponible) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (himi02_banks.safetensors); pesos base de Qwen2.5-1.5B sin modificar |

## Arquitectura y entrenamiento

Himi 0.2 no es un modelo nuevo, sino un runtime de memoria que envuelve a Qwen2.5-1.5B (transformer decoder-only) manteniendo sus pesos congelados. La memoria se materializa en dos componentes: unos bancos fijos de 151 MB y una cache de lectura comprimida de 4,6 KB por token en bf16, con tamano constante por token e independiente del crecimiento de la cache KV. El contexto se procesa en segmentos de hasta 2048 tokens, escribiendose los contextos mas largos en segmentos consecutivos.

El backbone no se reentrena; los unicos pesos entrenados son los bancos de memoria incluidos en el repositorio. La model card menciona "runs confirmatorios pre-registrados con semillas fijas" y una tarea de teacher-forcing sobre el primer digito con entropia cruzada de -2,67 nats frente a memoria vacia y de -13,38 nats frente a la memoria de otra muestra. No se detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas como RLHF o DPO; ese dato figura como no disponible.

## Capacidades

- Recuerdo exacto de hechos: responde preguntas del tipo "cual es el codigo del proyecto Beta" extrayendo el dato almacenado en memoria.
- Generacion de texto condicionada por memoria: mantiene la calidad del backbone en texto retenido (perplexity de 14,67 con memoria frente a 14,93 sin ella).
- Compresion de contexto largo en memoria de tamano fijo, con cache de lectura constante por token.
- API de uso mediante himi_engine.py con los metodos memorize (hasta 2048 tokens por segmento) y ask.
- Idiomas: unicamente ingles.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponibles; la model card no las menciona.

## Casos de uso

- Recuperacion exacta de datos en asistentes: el modelo puede memorizar un contexto de referencia (codigos, identificadores, fechas) y responder consultas puntuales con recuerdo exacto, evitando que el hecho se pierda en una ventana de atencion saturada.
- Agentes con memoria persistente de hechos: el runtime permite almacenar informacion estable entre pasos y consultarla con la API ask, adecuado para pipelines donde el agente necesita recordar valores concretos sin arrastrar todo el historial.
- Atencion al cliente con base de conocimiento: se puede cargar un catalogo o FAQ segmentado en bloques de 2048 tokens y responder preguntas factuales desde memoria, reduciendo la VRAM necesaria para mantener el contexto completo.
- Extraccion de informacion de documentos largos: al escribir el documento en segmentos consecutivos y consultar la memoria, resulta util para localizar datos concretos en informes extensos sin un coste de KV proporcional.
- Despliegue de contexto largo en GPUs de consumo: al reducir la huella de 3,67 GB a 755 MB a 128k tokens, permite mantener conversaciones o documentos largos en tarjetas con VRAM limitada.
- Auditoria y analisis de logs o registros: la memoria de tamano fijo facilita indexar grandes volumenes de registros y responder consultas de verificacion sobre valores especificos.
- Investigacion sobre memoria externa y compresion de KV-cache: sirve como banco de pruebas reproducible (demo.py, semillas fijas) para estudiar alternativas a la ventana de atencion clasica.

## Benchmarks y rendimiento

Recuerdo exacto de hechos secretos (decodificacion greedy), datos publicados por el autor:

| Hechos en contexto | Longitud de contexto | Exact match |
|---|---|---|
| 1 | 512 | 24 / 24 |
| 3 | 512 | 23 / 24 |
| 3 | 1024 | 23 / 24 |
| 3 | 2048 | 20 / 24 |

Modelado de lenguaje (memoria conectada, texto retenido):

| Configuracion | Perplexity |
|---|---|
| Qwen2.5-1.5B base | 14,93 |
| + memoria Himi 0.2 | 14,67 |

Huella de memoria (Qwen2.5-1.5B; linea base de KV en bf16 = 28,7 KB/token):

| Contexto | Cache KV completa | Himi 0.2 | Ratio |
|---|---|---|---|
| 8k | 235 MB | 151 MB + 38 MB = 189 MB | 1,2x |
| 32k | 918 MB | 151 MB + 151 MB = 302 MB | 3,0x |
| 128k | 3,67 GB | 151 MB + 604 MB = 755 MB | 4,9x |
| 1M | 28,7 GB | 151 MB + 4,7 GB = 4,9 GB | 5,8x |

Los bancos fijos ocupan 151 MB y la cache de lectura comprimida 4,6 KB por token (bf16, constante por token).

## Requisitos de hardware

- Pesos del backbone en bf16/fp16: aproximadamente 3,1 GB.
- Bancos de memoria: 151 MB adicionales, mas 4,6 KB por token de cache de lectura.
- VRAM estimada solo para memoria: unos 189 MB a 8k, 302 MB a 32k, 755 MB a 128k y 4,9 GB a 1M tokens.
- VRAM total estimada de inferencia en bf16: alrededor de 3,3 GB a contextos cortos y de 8 GB a 1M tokens (sumando pesos y memoria).
- Cabe en GPU de consumo: si. Es viable en tarjetas de 6-8 GB para contextos moderados (por ejemplo RTX 3060, RTX 4060) y comodo en RTX 3090, RTX 4070 Ti, RTX 4090.
- GPU de datacenter recomendadas para volumen o contextos muy largos: A100, H100.
- Opciones de despliegue: el repositorio proporciona un motor propio (himi_engine.py) que debe usarse para la capa de memoria. El backbone por si solo puede servirse con transformers, vLLM, TGI, llama.cpp u Ollama, pero no hay integracion documentada de la memoria con esos frameworks.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo / enfoque | Parametros | Contexto | Recuerdo exacto | Perplexity | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Himi 0.2 | 1,5B + 151 MB de memoria | 2048 tokens por segmento (hasta 1M documentado) | 24/24 (1 hecho, 512) | 14,67 | Apache-2.0 | HuggingFace (0 descargas) |
| Qwen2.5-1.5B (backbone) | 1,5B | No disponible | No disponible | 14,93 | Apache-2.0 | HuggingFace |
| Qwen2.5-1.5B con cache KV completa | 1,5B | No disponible (28,7 KB/token) | No disponible | No disponible | Apache-2.0 | HuggingFace |
| Alternativas de memoria externa (MemGPT, RAG sobre Qwen2.5-1.5B) | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de resultados comparativos publicados frente a otros sistemas de memoria de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Proyecto experimental: la interfaz esta orientada al recuerdo exacto de hechos (el protocolo evaluado); el dialogo libre no es su objetivo declarado.
- El recuerdo exacto se mantiene hasta contextos de 1024 tokens en la configuracion actual; a 2048 tokens la precision baja a aproximadamente el 83% (20/24) en el benchmark de 3 hechos.
- Idiomas: solo ingles. No se documenta soporte multilingue.
- Sin validacion independiente: el repositorio registra 0 descargas y 0 likes, y los resultados proceden exclusivamente del autor.
- Los pesos base no se modifican, por lo que el sistema hereda los sesgos y limitaciones de Qwen2.5-1.5B.
- Riesgo de alucinacion cuando el hecho consultado no esta en memoria; no se han publicado metricas de este comportamiento.
- Licencia Apache-2.0, que permite uso comercial tanto del runtime como del backbone (Qwen2.5-1.5B, tambien Apache-2.0).
- Dependencia de un motor propietario (himi_engine.py): no hay soporte nativo en ecosistemas estandar como vLLM, TGI, llama.cpp u Ollama para la capa de memoria, lo que complica su integracion en produccion.
- Los metadatos del repositorio indican fecha de creacion y actualizacion del 28 de septiembre de 2026.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/HimiAI/Himi-0.2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B

No se han encontrado papers, blogs, repositorios adicionales ni demos en la informacion disponible.
