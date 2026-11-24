# Lottolabs/Qwen3.6-35B-A3B-TT-Mixed-BFP4-BFP8-P150-tt-model

## Resumen

Qwen3.6-35B-A3B-TT-Mixed-BFP4-BFP8-P150-tt-model es un paquete de despliegue comunitario publicado por Lottolabs que adapta el modelo Qwen3.6-35B-A3B (desarrollado por el equipo Qwen de Alibaba Cloud) para ejecutarse sobre hardware Tenstorrent Blackhole P150. No se trata de un modelo nuevo, sino de una distribucion empaquetada con pesos cuantizados (expertos en GPTQ BFP4 y proyecciones densas mas LM head en BFP8) y un runtime personalizado sobre tt-metal que expone el modelo mediante una API compatible con OpenAI a traves de vLLM.

El modelo subyacente es un transformer hibrido MoE de 35.000 millones de parametros totales con aproximadamente 3.000 millones activos por token. Combina 40 capas que alternan Gated DeltaNet (atencion lineal) y atencion completa con compuertas, una capa MoE de 256 expertos mas un experto compartido, contexto nativo de 262.144 tokens y una cabeza MTP (multi-token prediction) para decodificacion especulativa. El paquete esta pensado para inferencia de texto en un unico dispositivo P150, en modo monousuario.

La relevancia de esta ficha radica en que documenta una de las primeras integraciones de un modelo Qwen de gran contexto sobre aceleradores Tenstorrent, con metricas de calidad frente a una ejecucion BF16 en CPU y perfiles de servicio definidos. Es un ejemplo de como el ecosistema open source empieza a portar modelos MoE de ultima generacion a hardware alternativo a las GPU tradicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido MoE con 40 capas: Gated DeltaNet (atencion lineal) y atencion completa con compuertas; 256 expertos enrutados mas un experto compartido; cabeza MTP |
| Parametros totales | 35B (aproximado, segun denominacion del modelo base) |
| Parametros activos | 3B (aproximado, segun denominacion del modelo base) |
| Longitud de contexto | 262.144 tokens (nativo) |
| Tipos de cuantizacion | GPTQ BFP4 (expertos enrutados y compartidos) y BFP8 (proyecciones densas y LM head); pesos empaquetados para Tenstorrent Blackhole |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Pesos cuantizados propietarios del runtime tt-metal (checkpoint de aproximadamente 22 GB en cache de Hugging Face); no se distribuyen en safetensors ni GGUF estandar |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B emplea una arquitectura hibrida que intercala capas de atencion lineal Gated DeltaNet con capas de atencion completa con compuertas, lo que reduce el coste computacional en contextos largos manteniendo capacidad de recuperacion exacta. La capa MoE cuenta con 256 expertos enrutados y un experto compartido, de modo que solo una fraccion pequena de parametros se activa por token (aproximadamente 3B de 35B). Incorpora ademas una cabeza MTP para decodificacion especulativa.

El paquete de Lottolabs no reentrena el modelo: toma los pesos del release oficial de Qwen y los cuantiza a GPTQ BFP4 (expertos) y BFP8 (proyecciones densas y LM head) para su ejecucion en Tenstorrent Blackhole. El runtime tt-metal implementa decodificacion trazada (traced decode), kernels de decodificacion fusionados, decodificacion especulativa MTP-1 sin perdida, muestreo exacto en dispositivo y cache de prefijos exacta. La informacion disponible no detalla la composicion del dataset de entrenamiento original ni el uso de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en un unico turno y multiturno, con contexto de hasta 262.144 tokens.
- Razonamiento con modo de pensamiento separado: el texto de razonamiento se devuelve en el campo `reasoning` y el contenido final en `content`; se puede desactivar por peticion con `enable_thinking: false`.
- Tool calling / function calling mediante el parser `qwen3_coder`: las peticiones con `tools` devuelven `tool_calls` y `finish_reason: tool_calls`.
- Soporte de agentes y razonamiento multi-paso, apoyado en el modo de pensamiento y en el tool calling.
- Capacidades de codigo y matematicas (evaluado en GSM8K con 87/100 en el paquete frente a 90/100 del original en BF16).
- Decodificacion especulativa MTP-1 sin perdida, tanto en modo greedy como con muestreo.
- Cache de prefijos exacta para reutilizar contexto entre peticiones de una misma secuencia.
- Procesamiento exclusivamente de texto: las imagenes y el video se rechazan.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multiturno con contexto muy largo (262.144 tokens), lo que permite mantener el historial completo de un cliente y documentacion asociada sin truncar.
- Generacion de codigo en produccion: gracias al tool calling con parser `qwen3_coder` y al modo de razonamiento, puede integrarse en pipelines que invocan herramientas, consultan repositorios o ejecutan tests en CI/CD.
- Agentes autonomos de multiples pasos: el modo de pensamiento separado y el soporte de `tool_calls` permiten construir bucles de planificacion y ejecucion con trazabilidad del razonamiento.
- Analisis de documentos largos: con 262.144 tokens de contexto puede procesar contratos, informes tecnicos o expedientes completos en una sola pasada, con cache de prefijos para consultas repetidas sobre el mismo documento.
- Asistente de razonamiento y matematicas: el modo thinking y el rendimiento en GSM8K lo hacen adecuado para resolver problemas paso a paso en entornos educativos o de analisis.
- Despliegue en hardware Tenstorrent: organizaciones con aceleradores Blackhole P150 pueden servir un modelo MoE de 35B con API compatible con OpenAI sin depender de GPU NVIDIA.
- Prototipado e investigacion en hardware alternativo: util para equipos que evaluan el rendimiento de tt-metal y vLLM sobre silicio no convencional con cargas de contexto largo.

## Benchmarks y rendimiento

Calidad medida con teacher forcing en P150 frente a una ejecucion BF16 en CPU del checkpoint original (58.509 tokens evaluados):

| Corpus | PPL BF16 → TT | ΔPPL | Acuerdo top-1 | KL medio |
|---|---|---|---|---|
| chat | 2,641 → 2,663 | +0,82% | 0,935 | 0,023 |
| code | 1,881 → 1,973 | +4,88% | 0,932 | 0,099 |
| all | 2,481 → 2,599 | +4,78% | 0,918 | 0,075 |

GSM8K (primeros 100 problemas, thinking off, greedy): 87/100 en P150 frente a 90/100 del original en BF16 en CPU.

Rendimiento de servicio (perfil `single`, ISL 128, OSL 512, concurrencia 1, N=3):

| Perfil | ISL | OSL | Concurrencia | N | TTFT (ms) | Prefill tok/s/u | Decode tok/s/u | E2EL (s) |
|---|---|---|---|---|---|---|---|---|
| single | 128 | 512 | 1 | 3 | 230 | 557 | 138,8 | no disponible |

## Requisitos de hardware

- Hardware obligatorio: Tenstorrent Blackhole P150 (un dispositivo).
- VRAM/cache: aproximadamente 22 GB en la cache de Hugging Face para el checkpoint, mas unos 25 GB para los pesos convertidos y las caches de kernels generadas en el primer arranque.
- RAM de host: se recomiendan 64 GB o mas; la carga del modelo alcanza picos de unos 50 GB.
- Primer arranque: aproximadamente 15 minutos para compilar kernels; los arranques posteriores reutilizan las caches.
- No cabe en GPU de consumo: requiere hardware Tenstorrent P150, no RTX 4090 ni similares.
- Despliegue: mediante `tt serve` (Tenstorrent CLI) o `tt-model serve`; expone una API compatible con OpenAI en el puerto 20000 (o el siguiente libre). Usa vLLM con un plugin de tt-metal.
- Perfiles de servicio: `single` (por defecto, MTP-1, una secuencia, contexto 262.144) y `single-no-mtp` (sin especulacion, acepta `min_p`, `logit_bias` y `min_tokens > 1`).
- Throughput medido: 557 tok/s de prefill por usuario y 138,8 tok/s de decode por usuario con concurrencia 1.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Hardware | Notas |
|---|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (original) | 35B | 3B | 262.144 | Apache 2.0 | GPU (BF16) | Referencia de calidad; GSM8K 90/100 en CPU BF16 |
| Qwen3.6-35B-A3B-TT-Mixed-BFP4-BFP8-P150-tt-model (este) | 35B | 3B | 262.144 | Apache 2.0 | Tenstorrent P150 | Cuantizado BFP4/BFP8; GSM8K 87/100; ΔPPL +4,78% global |
| Qwen3.6-35B-A3B-TT-Mixed-BFP4-BFP8-P150-batched-tt-model | 35B | 3B | 262.144 | Apache 2.0 | Tenstorrent P150 | Variante con modo batcheado de 2 a 16 usuarios |

No se dispone de datos de benchmarks frente a modelos de otros fabricantes en la informacion proporcionada.

## Limitaciones y advertencias

- Paquete comunitario de Lottolabs, no una release oficial de Qwen ni de Tenstorrent; el soporte y la estabilidad dependen del repositorio de terceros.
- Solo procesa texto: rechaza imagenes y video.
- El modo `single` esta limitado a una secuencia (max_num_seqs = 1); para 2 a 16 usuarios hay que usar el paquete batcheado separado.
- El perfil con MTP-1 rechaza algunos parametros de muestreo (`min_p`, `logit_bias`, `min_tokens > 1`); hay que usar `single-no-mtp` para esos casos.
- La cuantizacion BFP4/BFP8 introduce degradacion medible: +4,88% de perplejidad en codigo y +4,78% global, con acuerdo top-1 de 0,918; puede afectar a tareas sensibles a precision.
- Requiere hardware Tenstorrent P150 especifico, lo que limita su portabilidad frente a pesos GGUF o safetensors estandar.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan sesgos conocidos en la informacion disponible.
- Idiomas soportados no disponibles en la model card; conviene validar el comportamiento multilingue antes de usarlo en produccion.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y los pesos derivados deben verificarse contra los terminos de Qwen.
- El primer arranque requiere compilacion de kernels (unos 15 minutos) y picos de RAM de hasta 50 GB.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lottolabs/Qwen3.6-35B-A3B-TT-Mixed-BFP4-BFP8-P150-tt-model
- Pesos del release: https://huggingface.co/Lottolabs/Qwen3.6-35B-A3B-TT-Mixed-BFP4-BFP8-P150
- Paquete batcheado: https://huggingface.co/Lottolabs/Qwen3.6-35B-A3B-TT-Mixed-BFP4-BFP8-P150-batched-tt-model
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Repositorio de bundles: https://github.com/LottoLottoLotto/tt-model-bundles
- tt-metal (rama): https://github.com/LottoLottoLotto/tt-metal/tree/lottolabs/qwen3.6-35b-a3b-p150
- vLLM (rama): https://github.com/LottoLottoLotto/vllm/tree/lottolabs/qwen3.6-35b-a3b-p150
- tt-model-plugins (rama): https://github.com/LottoLottoLotto/tt-model-plugins/tree/lottolabs/qwen3.6-35b-a3b-p150
- tt-model-manager: https://github.com/tenstorrent/tt-model-manager
- Tenstorrent CLI (prerequisites): https://github.com/tenstorrent/tt-cli/blob/main/docs/prerequisites.md
