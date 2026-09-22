# Ar4ikov/Qwen3.8-27B-Uncensored-AWQ-W4A16-ASYM-HyperQwen-fast

## Resumen

Qwen3.8-27B-Uncensored-AWQ-W4A16-ASYM-HyperQwen-fast es un checkpoint cuantizado y preempaquetado por el usuario Ar4ikov para servir el modelo Qwen3.8-27B (27.356.728.560 parametros) en una unica GPU de 24 GB con vLLM. Se trata de la variante "uncensored" (abliterated) del modelo, cuyo comportamiento hereda de orcarouter/Qwen3.8-27B-Uncensored, y que conserva la torre de vision del modelo original, por lo que su pipeline es image-text-to-text ademas de conversacional.

El cuerpo del modelo mantiene la cuantizacion int4 asimetrica AWQ (grupo 128, con zero points) generada con llm-compressor a partir de pesos bf16. Lo que aporta este repositorio concreto es el post-procesado de la pipeline `prepare/` de HyperQwen: el `lm_head` pasa a int4 GPTQ simetrico calibrado sobre 400.000 estados ocultos finales del propio modelo, `embed_tokens` y los ocho lineales del modulo MTP pasan a int8 simetrico, y se anade un cabezal de borrador (`mtp.draft_lm_head`) de 40.960 filas recortado del `lm_head` para habilitar decodificacion especulativa.

La relevancia practica esta en el binomio tamano/prestaciones: un modelo de ~27 B con vision, contexto de 65.536 tokens y decodificacion especulativa integrada que cabe en una RTX 3090 o RTX 4090, con 112,7-135,9 tok/s en un solo flujo y hasta 434 tok/s en ocho flujos concurrentes segun las mediciones del autor. El repositorio es muy reciente y tiene una adopcion minima (10 descargas, 0 likes), por lo que debe tratarse como material en validacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido de 64 capas con capas Gated-DeltaNet (SSM) y capas de atencion, mas torre de vision y cabezal MTP (multi-token prediction) |
| Parametros totales | 27.356.728.560 (~27,36 mil millones) |
| Parametros activos | No aplica (no es MoE; es un modelo denso hibrido) |
| Longitud de contexto | 65.536 tokens (perfil `CTX=fast` de 64K; la linea de produccion documentada usa 40K) |
| Tipos de cuantizacion | Cuerpo: int4 AWQ asimetrico, grupo 128, con zero points. `lm_head`: int4 GPTQ simetrico, grupo 128. `embed_tokens`: int8 simetrico, grupo 128. Modulo MTP (8 lineales): int8 simetrico, grupo 128. Cabezal borrador: int4. Torre de vision, proyecciones de puerta SSM y normas del cabezal MTP: bf16. Esquema general W4A16, con perfiles W4A8 opcionales (activaciones int8) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors / AWQ); repositorio de 16,1 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer hibrido en el que conviven capas Gated-DeltaNet (una familia de modelos de espacio de estados) y capas de atencion, organizadas en 64 capas. Sobre ese cuerpo se anaden dos componentes relevantes para el despliegue: una torre de vision que se mantiene en bf16 para el procesamiento de imagenes, y un modulo MTP (multi-token prediction) que actua como cabezal de borrador para decodificacion especulativa. El checkpoint incluye ademas un cabezal `mtp.draft_lm_head` de 40.960 filas, recortado del `lm_head` cuantizado, junto con la lista de identificadores de vocabulario `mtp_draft_vocab_ids.pt` que HyperQwen distribuye.

En cuanto al proceso de cuantizacion, el autor documenta que el cuerpo se genero con llm-compressor desde pesos bf16 en formato int4 asimetrico AWQ con grupo 128 y zero points, mientras que la pipeline de HyperQwen reescribe el checkpoint para reducir los cabezales: `lm_head` pasa de 2,5 GB en bf16 a int4 GPTQ simetrico (calibrado sobre 400.000 estados ocultos finales del propio modelo, con una mejora de divergencia KL frente al cabezal bf16 de 0,0070 con RTN a 0,0024 con GPTQ), `embed_tokens` pasa de 2,5 GB a int8 con un error de ida y vuelta del 0,65 %, y el modulo MTP pasa de 850 MB en bf16 a int8. No se documenta en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO; el comportamiento "uncensored" se hereda del finetune abliterated de orcarouter.

## Capacidades

- Generacion de texto conversacional multi-turno en castellano e ingles (idiomas no documentados oficialmente).
- Comprension de imagenes: pipeline image-text-to-text con torre de vision activa; el autor verifica la descripcion correcta de un cuadrado rojo, un circulo azul y una linea de texto en todos los perfiles medidos.
- Razonamiento y generacion de codigo: capacidades heredadas del modelo base Qwen3.8-27B, no documentadas especificamente en este repositorio.
- Decodificacion especulativa nativa mediante el modulo MTP y el cabezal borrador de 40.960 filas (2,74-3,44 tokens aceptados por paso en las mediciones publicadas).
- Modo "uncensored" (abliterated): el modelo no incorpora los filtros de rechazo del modelo original, lo que permite respuestas sin las restricciones habituales de alineamiento.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado especificamente, aunque el contexto de 65.536 tokens lo hace tecnicamente viable.
- Capacidades multilingues: no disponibles.
- Capacidades especiales documentadas: vision, decodificacion especulativa con cabezal MTP, y perfiles opcionales con activaciones int8 (`INT8_ACT=int8 PREFILL_ATTN=int8`).

## Casos de uso

- Analisis de imagenes en local: el modelo puede describir y razonar sobre imagenes (image-text-to-text) sin salir de una unica GPU de 24 GB, lo que lo hace adecuado para entornos con requisitos de privacidad estrictos donde no se puede enviar contenido visual a APIs externas.
- Asistente conversacional on-premise con contexto largo: gracias a los 65.536 tokens de ventana, admite conversaciones multi-turno extensas o documentos largos combinados con imagenes, desplegado en un servidor con una RTX 3090 o RTX 4090.
- Procesamiento por lotes de documentos escaneados: en el perfil `C8` el modelo alcanza 434 tok/s agregados en ocho flujos concurrentes, lo que permite extraer y resumir informacion de lotes de facturas, formularios o informes con imagenes adjuntas.
- Generacion de contenido sin restricciones de alineamiento: para equipos de investigacion en seguridad, red teaming o analisis de sesgos que necesitan un modelo que no censure las respuestas, siempre con las salvaguardas externas adecuadas.
- Investigacion en cuantizacion y decodificacion especulativa: el repositorio documenta de forma reproducible el impacto de pasar `lm_head` de bf16 a int4 GPTQ y de anadir un cabezal borrador, por lo que sirve como banco de pruebas para estudiar el equilibrio entre perplexity, tokens por paso y throughput.
- Despliegue de bajo coste con vLLM: al integrarse en la imagen `vllm-qwen-boost` mediante `docker compose`, permite levantar un endpoint OpenAI-compatible con vision y contexto de 64K en hardware de gama consumer, algo poco habitual en modelos de ~27 B.
- Prototipado de asistentes multimodales en produccion: con `TTFT` de 96 ms en el perfil de produccion (DFlash2 k=15 con activaciones int8, 40K de contexto y 4 slots), es viable para interfaces interactivas donde la latencia de primer token es critica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K, MMMU) en la informacion disponible. El autor unicamente publica mediciones de throughput sobre una RTX 3090 a 350 W con vLLM 0.29.0, en la segunda ejecucion tras el arranque, con `VISION=1` y la torre de vision transmitida desde la RAM del host en cada imagen. C1 corresponde a un unico flujo con respuestas de 1.024 tokens y `tok/step` a los tokens aceptados por pasada hacia delante.

| Perfil | C1 T=default (tok/s) | C1 T=0 (tok/s) | Tokens/paso | C8 (tok/s) | Pool de KV |
|---|---|---|---|---|---|
| `SPEC=mtp CTX=fast` (64K, KV en bf16) | 112,7 | 127,6 | 2,74 / 2,95 | 434 | 80.185 |
| `SPEC=dflash2 CTX=fast KV_MEM=4600000000 DFLASH_MAX_LEN=49152` | 135,9 | 139,3 | 3,29 / 3,29 | 401 | 53.233 |
| Produccion: DFlash2 k=15 + `INT8_ACT=int8 PREFILL_ATTN=int8` (40K, TTFT 96 ms) | 116,7 | 135,5 | 2,97 / 3,44 | No disponible (4 slots) | 42.113 |

| Metrica de cuantizacion | Valor |
|---|---|
| Divergencia KL del `lm_head` int4 con RTN frente a bf16 | 0,0070 |
| Divergencia KL del `lm_head` int4 con GPTQ frente a bf16 | 0,0024 |
| Error de ida y vuelta de `embed_tokens` en int8 | 0,65 % |

## Requisitos de hardware

- VRAM: el repositorio ocupa 16,1 GB en disco; el objetivo declarado es servir el modelo completo con cache KV y decodificacion especulativa dentro de 24 GB de VRAM.
- GPU validadas: RTX 3090 de 24 GB (mediciones publicadas, a 350 W). Por capacidad de memoria, una RTX 4090 de 24 GB es igualmente compatible.
- GPU de centro de datos: A100, H100 y similares pueden ejecutarlo, pero desaprovechan el objetivo de diseno, que es precisamente caber en una tarjeta consumer.
- RAM del host: la torre de vision en bf16 se transmite desde la RAM del sistema por imagen cuando se activa `VISION=1`, por lo que se recomienda RAM abundante y, preferiblemente, una CPU con buen ancho de banda.
- Opciones de despliegue: vLLM 0.29.0 es el runtime de referencia. Con el fork HyperQwen en la rama `awq-asym` y el kernel `marlin-int8-asym-zp` se obtienen la decodificacion especulativa, el cabezal borrador y la ruta int8 Marlin. Existe una imagen Docker en `Ar4ikov/vllm-qwen-boost` que automatiza descarga, verificacion y servicio (`docker compose --profile single up -d`). vLLM 0.29 estandar tambien carga el modelo con `--max-model-len 65536`, pero sin decodificacion especulativa, sin cabezal borrador y sin la ruta int8 Marlin.
- llama.cpp, Ollama, TGI y formatos GGUF: no disponibles. El formato AWQ/compressed-tensors no es compatible con llama.cpp ni Ollama.
- Latencia y throughput: TTFT de 96 ms en el perfil de produccion; 112,7-135,9 tok/s en un solo flujo; hasta 434 tok/s agregados con ocho flujos concurrentes; 2,74-3,44 tokens aceptados por paso segun el perfil especulativo.
- Compatibilidad de transformadores: el autor indica que el export original sin reescribir se mantiene aparte para usuarios de transformers y de vLLM estandar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Ar4ikov/Qwen3.8-27B-Uncensored-AWQ-W4A16-ASYM-HyperQwen-fast (este) | ~27,36 B | 65.536 tokens | int4 AWQ asimetrico + `lm_head` int4 GPTQ + MTP int8 | 135,9 tok/s C1, 434 tok/s C8; menor perplexity que la variante int8 | Apache-2.0 | Listo para HyperQwen y vLLM; requiere el fork para especulacion |
| Ar4ikov/Qwen3.8-27B-Uncensored-AWQ-W4A16-ASYM-HyperQwen | ~27,36 B | No disponible | Igual, pero con `lm_head` en int8 | 0,6 % menos de perplexity y unos pocos tok/s menos | Apache-2.0 | Misma pipeline HyperQwen |
| Ar4ikov/Qwen3.8-27B-Uncensored-AWQ-W4A16-ASYM (base) | ~27,36 B | No disponible | int4 asimetrico AWQ en el cuerpo; `lm_head`, `embed_tokens` y MTP en bf16 | Requiere ~10 minutos de preparacion en CPU por maquina antes de servir | Apache-2.0 | Compatible con transformers y vLLM estandar, sin cabezal borrador |
| Qwen/Qwen3.8-27B (modelo raiz) | ~27 B | No disponible | bf16 sin cuantizar | No sirve en 24 GB sin cuantizar | Apache-2.0 | Modelo original de referencia |

No se dispone de datos publicados de benchmarks que permitan comparar este checkpoint con alternativas de otros autores del mismo orden de tamano.

## Limitaciones y advertencias

- Modelo "uncensored" (abliterated): carece de los filtros de rechazo del modelo original y puede producir contenido danino, ilegal o eticamente problematico. No es apto para productos de consumo sin una capa de moderacion externa.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de esta familia; no se han publicado evaluaciones de fidelidad factual para esta cuantizacion concreta.
- Perdida de calidad por cuantizacion: el cuerpo esta en int4 y los cabezales en int4/int8. El autor cuantifica parte del impacto (KL 0,0024 en `lm_head`) pero no se publica una comparacion de perplexity completa frente al modelo en bf16.
- Idiomas no documentados: no hay informacion sobre la cobertura linguistica real del finetune, por lo que el rendimiento en castellano no esta garantizado.
- Dependencia de un fork de vLLM: la decodificacion especulativa, el cabezal borrador y la ruta int8 Marlin requieren `Ar4ikov/HyperQwen` en la rama `awq-asym` y vLLM 0.29.0. Con vLLM estandar se pierden esas optimizaciones.
- Incompatibilidad de formato: el checkpoint AWQ/compressed-tensors no puede cargarse con llama.cpp, Ollama ni herramientas basadas en GGUF, lo que limita su portabilidad.
- Coste de la torre de vision: al transmitirse desde la RAM del host en cada imagen, la latencia depende de la memoria y el ancho de banda del sistema.
- Madurez y validacion: el repositorio acumula 10 descargas y 0 likes. No hay validacion independiente, ni reportes de terceros, ni historial de incidencias en produccion.
- Procedencia del finetune: el comportamiento uncensored se hereda de orcarouter/Qwen3.8-27B-Uncensored y no se documenta el dataset ni el metodo de abliteracion empleado. Conviene auditar el modelo antes de usarlo en cualquier contexto sensible.
- Licencia: el repositorio declara Apache-2.0 y el modelo raiz Qwen/Qwen3.8-27B tambien es Apache-2.0, por lo que el uso comercial es posible, pero el usuario debe verificar la cadena completa de dependencias (modelo raiz y finetune intermedio) antes de distribuirlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ar4ikov/Qwen3.8-27B-Uncensored-AWQ-W4A16-ASYM-HyperQwen-fast
- Checkpoint base cuantizado: https://huggingface.co/Ar4ikov/Qwen3.8-27B-Uncensored-AWQ-W4A16-ASYM
- Variante con `lm_head` en int8: https://huggingface.co/Ar4ikov/Qwen3.8-27B-Uncensored-AWQ-W4A16-ASYM-HyperQwen
- Finetune uncensored de origen: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- Modelo raiz: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio HyperQwen: https://github.com/syv-ai/HyperQwen
- Rama con soporte AWQ asimetrico: https://github.com/Ar4ikov/HyperQwen/tree/awq-asym
- Imagen y utilidades de servicio vLLM: https://github.com/Ar4ikov/vllm-qwen-boost
