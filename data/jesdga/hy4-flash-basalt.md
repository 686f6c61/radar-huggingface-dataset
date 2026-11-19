# jesdga/Hy4-flash-Basalt

## Resumen

Hy4-flash-Basalt es un empaquetado cuantizado y repackado del modelo `tencent/Hy4-flash` de Tencent, publicado por el usuario jesdga para su uso con Basalt, un motor de inferencia local orientado a GPUs NVIDIA Blackwell (sm_120) con API compatible con OpenAI y Anthropic. El modelo base es un transformer de tipo Mixture of Experts (MoE) con atención de tipo MLA (Multi-head Latent Attention), 41 capas MoE con 512 expertos enrutados por capa, una tabla Engram de 4 capas con 660 millones de filas de dimensión 96, y una torre de visión SigLIP2. El pack incluye además un drafter DFly2 para decodificación especulativa.

El pack se construye a partir del checkpoint BF16 de Tencent mediante una única ronda de cuantización, sin calibración sobre datos. Los expertos enrutados se almacenan en NVFP4 (códigos E2M1 con escala UE4M3 por cada 16 valores y escala FP32 por proyección), la tabla Engram en E4M3, las proyecciones de atención y el experto compartido en Q8_0, la cabeza de salida en BF16 y el router, normas, hiperconexiones y sesgos en F32. El resultado es un único fichero autocontenido de 159 GB que incluye pesos, tabla Engram, encoder de visión, tokenizer y drafter.

Su relevancia es práctica: permite ejecutar un modelo MoE de gran tamaño en una sola tarjeta Blackwell, con una segunda tarjeta opcional como nivel de expertos peer y RAM del sistema para los expertos que no caben en VRAM. El soporte de contexto alcanza 1.048.576 tokens, con caché KV configurable en FP16 o FP8, y ofrece velocidades de decodificación de 84 a 172 tokens/s según el tipo de contenido en una configuración RTX 5090 + RTX 5060 Ti.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención MLA, tabla Engram, experto compartido y torre de visión SigLIP2 |
| Parametros totales | no disponible |
| Parametros activos | no disponible (41 capas MoE x 512 expertos enrutados; número de expertos activos por token no disponible) |
| Longitud de contexto | hasta 1.048.576 tokens |
| Tipos de cuantizacion | NVFP4 (expertos enrutados), E4M3 (tabla Engram), Q8_0 (atención, proyecciones latentes MoE, experto compartido, MLP densa de capa 0, proyecciones indexer y Engram, embeddings), BF16 (cabeza de salida, visión, drafter), F32 (router, normas, hiperconexiones, sesgos) |
| Idiomas soportados | no disponible |
| Licencia | Tencent Hy License, Version 1.0 |
| Formato de pesos | `.basalt` (fichero único autocontenido para el motor Basalt) |

## Arquitectura y entrenamiento

El modelo base `tencent/Hy4-flash` es un transformer de tipo Mixture of Experts con atención MLA (Multi-head Latent Attention) y 41 capas MoE, cada una con 512 expertos enrutados y un experto compartido. Incorpora además una tabla Engram de 4 capas con 660 millones de filas de dimensión 96, que actúa como memoria de recuperación, y una torre de visión SigLIP2 con su proyector. La capa 0 contiene un MLP denso en lugar de MoE. El pack incluye un drafter DFly2 para decodificación especulativa, cuyos tokens propuestos se verifican, de modo que la salida final es la del propio modelo.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en la información proporcionada. El pack de Basalt no entrena ni calibra: cada componente se redondea una sola vez desde los pesos BF16 de Tencent, con selección de escala UE4M3 por mínimo error cuadrático para los expertos en NVFP4. La innovación técnica destacable es el formato de fichero único que integra pesos, tabla Engram, encoder de visión, tokenizer y drafter, junto con la decodificación especulativa DFly2 activada por defecto y la caché KV en FP8 opcional que reduce el consumo a 8,4 GiB en contexto de 1M frente a 14,3 GiB en FP16.

## Capacidades

- Generación de texto en prosa, contenido estructurado y conversación multi-turno.
- Razonamiento y cadena de pensamiento: el motor lee el interruptor de thinking del formato de chat del modelo.
- Procesamiento de imágenes con `--vision dynamic`, codificadas dentro del motor mediante la torre SigLIP2 incluida en el fichero.
- Tool calling / function calling: el motor interpreta la sintaxis de llamadas a herramientas del formato de chat del modelo.
- Contexto largo de hasta 1.048.576 tokens, con recuperación needle-in-a-haystack verificada a 256K y 1M.
- Decodificación especulativa con DFly2 activada por defecto, con verificación de tokens.
- API compatible con OpenAI y Anthropic a través del motor Basalt.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional local con contexto largo: el modelo mantiene conversaciones multi-turno sobre documentos extensos gracias a su ventana de hasta 1.048.576 tokens, con caché KV en FP8 para reducir el consumo de VRAM en sesiones largas.
- Análisis de documentos y recuperación de información: la recuperación needle-in-a-haystack verificada a 256K y 1M permite localizar pasajes concretos en corpus extensos, útil para revisión de contratos, informes o bases de conocimiento.
- Procesamiento de imágenes en local: con `--vision dynamic`, el encoder SigLIP2 incluido permite describir, clasificar o extraer información de imágenes sin depender de servicios externos.
- Integración en pipelines con API compatible con OpenAI y Anthropic: el motor Basalt expone una API compatible que permite sustituir proveedores cloud en herramientas existentes sin reescribir clientes.
- Automatización con tool calling: la sintaxis de llamadas a herramientas del modelo permite construir agentes que consulten APIs, bases de datos o sistemas internos en despliegues on-premise.
- Generación de contenido estructurado: el rendimiento medido de 172 tokens/s en contenido estructurado (frente a 84 en prosa) lo hace adecuado para generar JSON, tablas o informes con formato fijo.
- Despliegue en estaciones de trabajo con una o dos GPUs Blackwell: la posibilidad de usar una segunda tarjeta como nivel peer de expertos y RAM del sistema para el resto permite ejecutar el modelo en hardware de escritorio profesional.

## Benchmarks y rendimiento

Calidad medida con `basalt-bench --quality`: 100 fragmentos de wikitext-2 de 512 tokens, evaluados por la ruta de decodificación contra una referencia BF16 en llama.cpp del modelo original (PPL de referencia 18,572 en las filas evaluadas).

| Pack | PPL | KLD media | Mismo top-1 |
|---|---:|---:|---:|
| NVFP4 (este pack) | 17,55 | 0,201 | 86,09% |
| Q4_K_M (GGUF de AngelSlim, no incluido) | 19,82 | 0,176 | 86,96% |

Velocidad en un solo stream, RTX 5090 a 400 W + RTX 5060 Ti a 180 W como peer, 121 GiB de RAM, en tokens/s, con DFly2 activado:

| Prosa | Estructurado | Chat | Prefill, prompt de 14K |
|---:|---:|---:|---:|
| 84 | 172 | 92 | 3.454 |

Prompts largos: unos 3.500 tokens/s de prefill a 128K y 2.090 tokens/s a 1M; decodificación tras un prompt de 116K a unos 70 tokens/s. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM: el fichero completo ocupa 159 GB; los expertos enrutados son 83,6 GB, la tabla Engram 63,4 GB, las proyecciones Q8_0 8,3 GB, la cabeza de salida 0,74 GB, visión y proyector 1,0 GB y el drafter 1,7 GB. Los expertos que no caben en VRAM se sirven desde RAM del sistema.
- Caché KV: 14,3 GiB a 1M de contexto en FP16; 8,4 GiB con `--kv fp8`.
- GPU recomendadas: NVIDIA Blackwell (sm_120), como RTX 5090 y RTX 5060 Ti; el motor está diseñado para GPUs Blackwell y permite una segunda tarjeta como nivel peer de expertos.
- Configuración de referencia medida: RTX 5090 a 400 W + RTX 5060 Ti a 180 W como peer, con 121 GiB de RAM.
- No cabe en GPUs de consumo de generaciones anteriores según la información disponible; el motor requiere arquitectura Blackwell.
- Despliegue: exclusivamente mediante el motor Basalt 0.5.0 o posterior (`bin/basalt serve`), que expone API compatible con OpenAI y Anthropic. No se indica soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: 84 tokens/s en prosa, 172 en estructurado, 92 en chat y 3.454 tokens/s de prefill con prompt de 14K en la configuración de referencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy4-flash-Basalt (este pack) | no disponible (MoE, 41 capas x 512 expertos) | 1.048.576 | `.basalt` (NVFP4/E4M3/Q8_0/BF16) | Tencent Hy License 1.0 | Hugging Face, motor Basalt |
| tencent/Hy4-flash (original) | no disponible | no disponible | BF16 | Tencent Hy License 1.0 | Hugging Face |
| AngelSlim/Hy4-flash-GGUF | no disponible | no disponible | GGUF (Q4_K_M) | no disponible | Hugging Face |

El pack NVFP4 obtiene mejor perplejidad que el GGUF Q4_K_M (17,55 frente a 19,82) con peor KLD media (0,201 frente a 0,176) y menor coincidencia top-1 (86,09% frente a 86,96%), medidos ambos de la misma forma y en la misma máquina. No se dispone de comparativas con modelos de otros autores en la información proporcionada.

## Limitaciones y advertencias

- Este fichero es una forma modificada (cuantizada y repackada) de los pesos originales; no es un lanzamiento oficial de Tencent.
- Requiere el motor Basalt 0.5.0 o posterior y una GPU NVIDIA Blackwell (sm_120); no es utilizable con otros runtimes según la información disponible.
- La cuantización NVFP4 introduce desviación respecto al BF16 original: KLD media de 0,201 y 86,09% de coincidencia top-1 en la evaluación de wikitext-2.
- El rendimiento declarado depende de la configuración concreta (RTX 5090 + RTX 5060 Ti, 121 GiB de RAM) y varía con cada versión del motor.
- La licencia Tencent Hy License 1.0 impone condiciones de uso comercial que deben revisarse en el fichero LICENSE antes de un despliegue en producción.
- No se dispone de información sobre sesgos, idiomas soportados ni tasas de alucinación en la información proporcionada.
- El repositorio no registra descargas ni likes en el momento de la consulta, por lo que no hay validación comunitaria del pack.
- El contexto máximo de 1.048.576 tokens exige gestionar el consumo de caché KV (14,3 GiB en FP16 o 8,4 GiB en FP8) además de los pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jesdga/Hy4-flash-Basalt
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Web de Basalt: https://basalt.jgulfo.com
- Repositorio de Basalt: https://github.com/jesdga95/basalt
- Documentación de Hy4-flash en Basalt: https://github.com/jesdga95/basalt/blob/main/docs/models/hy4-flash.md
- Documentación de modelos y router: https://github.com/jesdga95/basalt/blob/main/docs/configuration/models.md
- GGUF de comparación (AngelSlim): https://huggingface.co/AngelSlim/Hy4-flash-GGUF
- Dataset de referencias KLD: https://huggingface.co/datasets/jesdga/basalt-kld-bases
- Strata (motor del que deriva Basalt): https://github.com/Niko1221/Strata
