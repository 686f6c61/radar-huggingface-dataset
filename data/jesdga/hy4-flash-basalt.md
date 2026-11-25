# jesdga/Hy4-flash-Basalt

## Resumen

Hy4-flash-Basalt es un empaquetado cuantizado y autocontenido del modelo tencent/Hy4-flash, publicado por el usuario jesdga para su uso con Basalt, un motor de inferencia local orientado a GPUs NVIDIA Blackwell (sm_120) con API compatible con OpenAI y Anthropic. El paquete incluye en un unico fichero los pesos cuantizados, la tabla Engram, el codificador de vision SigLIP2, el tokenizer y el drafter DFly2, lo que elimina la necesidad de descargar componentes por separado. El modelo base es un transformer con arquitectura MoE (41 capas de mezcla de expertos con 512 expertos enrutados por capa) desarrollado por Tencent.

La relevancia de este empaquetado radica en que hace viable ejecutar un modelo de gran tamano en hardware de consumo: combina NVFP4 para los expertos enrutados (83,6 GB), E4M3 para la tabla Engram (63,4 GB) y Q8_0 para las proyecciones de atencion y demas componentes densos, con un total de 158,7 GB. El motor Basalt distribuye la carga entre una o dos tarjetas Blackwell y la RAM del sistema, manteniendo un contexto de hasta 1.048.576 tokens y decodificacion especulativa mediante DFly2.

El modelo esta pensado para desarrolladores que quieran desplegar localmente un LLM de gran contexto con capacidades de vision, tool calling y modo de razonamiento, sin depender de servicios en la nube. La licencia es la Tencent Hy License 1.0, que impone condiciones propias distintas de las licencias open source habituales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atencion MLA (multi-head latent attention), tabla Engram y hyper-connections |
| Parametros totales | no disponible |
| Parametros activos | no disponible (41 capas MoE x 512 expertos enrutados, mas experto compartido y MLP denso en capa 0) |
| Longitud de contexto | hasta 1.048.576 tokens (`--max-context`) |
| Tipos de cuantizacion | NVFP4 (expertos enrutados), E4M3 (tabla Engram), Q8_0 (atencion, proyecciones latentes, experto compartido, embeddings), BF16 (cabeza de salida, vision, drafter), F32 (router, norms, sesgos) |
| Idiomas soportados | no disponible |
| Licencia | tencent-hy-license-1.0 (Tencent Hy License, Version 1.0) |
| Formato de pesos | `.basalt` (fichero unico autocontenido para el motor Basalt) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos: 41 capas MoE con 512 expertos enrutados cada una, un experto compartido y un MLP denso en la capa 0. La atencion emplea proyecciones MLA (q/kv latentes) y el modelo incorpora una tabla Engram de 4 capas con 660 millones de filas de 96 dimensiones, ademas de hyper-connections y un router con parametros en F32. Dispone de un codificador de vision SigLIP2 con proyector BF16 para entrada de imagenes.

El empaquetado de jesdga no reentrena el modelo: cada componente se redondea una sola vez desde los pesos BF16 de Tencent, sin calibracion sobre datos. Los expertos enrutados se almacenan en NVFP4 con codigos E2M1, una escala UE4M3 por cada 16 valores elegida por minimo error cuadratico y una escala FP32 por proyeccion. La tabla Engram se guarda en E4M3 y las proyecciones de atencion, latentes, experto compartido, embeddings e indexer en Q8_0. El drafter DFly2 (1,7 GB en BF16, redondeado a Q8_0 al cargar) habilita decodificacion especulativa con verificacion de tokens, de modo que la salida es la del propio modelo. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo original.

## Capacidades

- Generacion de texto y conversacion multi-turno con contexto de hasta 1.048.576 tokens.
- Razonamiento con modo de pensamiento (thinking switch) configurable desde el fichero del modelo.
- Tool calling y function calling: el motor lee la sintaxis de llamadas a herramientas del propio modelo.
- Entrada de vision: imagenes procesadas por el codificador SigLIP2 integrado, activable con `--vision dynamic`.
- Decodificacion especulativa mediante DFly2, con verificacion de tokens generados.
- Soporte de KV cache en FP16 (por defecto) o FP8 (`--kv fp8`), que reduce el consumo a 8,4 GiB con 1M de contexto frente a 14,3 GiB.
- Recuperacion needle-in-a-haystack validada a 256K (profundidades 10%, 50% y 90%, cache FP16 y FP8) y a 1M (50% de profundidad, cache FP8).
- Capacidades multilingues: no disponible.

## Casos de uso

- Asistente de codigo en local: el modelo soporta tool calling y puede integrarse en flujos de edicion y ejecucion de codigo mediante la API compatible con OpenAI, sin enviar codigo propietario a servicios externos.
- Analisis de repositorios completos: con 1M de tokens de contexto y prefill de aproximadamente 3.500 tok/s a 128K, permite cargar bases de codigo extensas o documentacion tecnica completa en una sola sesion.
- Procesamiento de documentos con imagenes: la torre SigLIP2 integrada permite extraer informacion de capturas, diagramas o documentos escaneados junto al texto.
- Atencion al cliente automatizada: conversaciones multi-turno largas con recuperacion fiable en contexto (needle-in-a-haystack validado a 256K) y KV cache FP8 para reducir memoria.
- Investigacion con datos sensibles: al ejecutarse en una o dos GPUs Blackwell locales con API compatible con OpenAI y Anthropic, permite desplegar pipelines sobre datos que no pueden salir de la infraestructura propia.
- Generacion de texto estructurado: el rendimiento de 172 tok/s en salida estructurada (frente a 84 en prosa) lo hace adecuado para extraccion de datos y generacion de JSON en pipelines de ingesta.
- Analisis de corpus largos: con decodificacion de aproximadamente 70 tok/s tras un prompt de 116K, es util para resumen y preguntas sobre libros, expedientes o historiales extensos.

## Benchmarks y rendimiento

Calidad medida con `basalt-bench --quality` sobre 100 fragmentos de wikitext-2 de 512 tokens, comparados contra una referencia BF16 en llama.cpp del modelo original (PPL de referencia 18,572):

| Pack | PPL | KLD media | Mismo top-1 |
|---|---:|---:|---:|
| NVFP4 (este paquete) | 17,55 | 0,201 | 86,09% |
| Q4_K_M (GGUF de AngelSlim, referencia, no incluido) | 19,82 | 0,176 | 86,96% |

Rendimiento de inferencia en un solo stream con RTX 5090 a 400 W mas RTX 5060 Ti a 180 W como peer y 121 GiB de RAM:

| Prosa | Estructurado | Chat | Prefill (prompt de 14K) |
|---:|---:|---:|---:|
| 84 tok/s | 172 tok/s | 92 tok/s | 3.454 tok/s |

Con drafting DFly2 activo (por defecto). Prompts largos se leen a unos 3.500 tok/s a 128K y 2.090 tok/s a 1M; la decodificacion tras un prompt de 116K ronda los 70 tok/s.

## Requisitos de hardware

- El fichero completo ocupa 158,7 GB, por lo que requiere una combinacion de VRAM y RAM del sistema; el motor Basalt coloca en RAM los expertos que no caben en VRAM.
- GPU objetivo: NVIDIA Blackwell (sm_120). El ejemplo del autor usa una RTX 5090 a 400 W como tarjeta principal y una RTX 5060 Ti a 180 W como peer, con 121 GiB de RAM.
- No se dispone de datos de funcionamiento en A100, H100 ni en GPUs de generaciones anteriores; el motor esta orientado a sm_120.
- Despliegue mediante el motor Basalt 0.5.0 o superior (`bin/basalt serve`), con API compatible con OpenAI y Anthropic.
- Opciones de contexto: `--max-context N` para ampliar la ventana y `--kv fp8` para reducir la cache KV a 8,4 GiB con 1M de tokens.
- Throughput y latencia: ver la tabla de la seccion de benchmarks; las cifras varian con cada version del motor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy4-flash-Basalt (este) | no disponible (41 capas MoE x 512 expertos) | 1.048.576 | `.basalt` (NVFP4/E4M3/Q8_0) | Tencent Hy License 1.0 | Hugging Face, motor Basalt |
| tencent/Hy4-flash (original) | no disponible | no disponible | BF16 | Tencent Hy License 1.0 | Hugging Face |
| AngelSlim/Hy4-flash-GGUF | no disponible | no disponible | GGUF (Q4_K_M) | derivada de Tencent Hy License 1.0 | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones completas de modelos alternativos de otros desarrolladores en la informacion proporcionada, por lo que la comparativa se limita a las variantes del mismo modelo base.

## Limitaciones y advertencias

- Este paquete no es una release oficial de Tencent: es una modificacion (cuantizada y reempaquetada) de los pesos originales, sujeta a la Tencent Hy License 1.0, que puede imponer restricciones al uso comercial distintas de las licencias open source.
- La cuantizacion NVFP4 introduce perdida de calidad medible: KLD media de 0,201 y 86,09% de coincidencia top-1 frente a la referencia BF16; el PPL medido (17,55) es inferior al de referencia, lo que indica que las metricas deben interpretarse con cautela.
- Dependencia de hardware especifico: el motor Basalt esta orientado a GPUs NVIDIA Blackwell (sm_120); no hay datos de compatibilidad con otras arquitecturas.
- Requiere Basalt 0.5.0 o superior; las cifras de rendimiento cambian con cada version del motor.
- Riesgo de alucinacion inherente a los LLM: no se han publicado evaluaciones de veracidad en la informacion disponible.
- Idiomas soportados no documentados; no se puede garantizar calidad multilingue.
- Sesgos conocidos: no disponible.
- El contexto maximo de 1M tokens exige cache KV adicional (14,3 GiB en FP16, 8,4 GiB en FP8) y presion sobre la memoria del sistema.
- La recuperacion needle-in-a-haystack a 1M solo se ha validado al 50% de profundidad y con cache FP8, no en todas las profundidades.

## Enlaces

- Hugging Face del paquete: https://huggingface.co/jesdga/Hy4-flash-Basalt
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Repositorio del motor Basalt: https://github.com/jesdga95/basalt
- Documentacion de Hy4-flash en Basalt: https://github.com/jesdga95/basalt/blob/main/docs/models/hy4-flash.md
- Configuracion de modelos y router: https://github.com/jesdga95/basalt/blob/main/docs/configuration/models.md
- Web del proyecto: https://basalt.jgulfo.com
- GGUF de referencia (AngelSlim): https://huggingface.co/AngelSlim/Hy4-flash-GGUF
- Dataset de referencias KLD: https://huggingface.co/datasets/jesdga/basalt-kld-bases
- Motor Strata (base de Basalt): https://github.com/Niko1221/Strata
