# kaushikvira/Qwen3.8-27B-swift-abliterated-nvfp4full-dflash2-NInfer-v3

## Resumen

Qwen3.8-27B-swift-abliterated-nvfp4full-dflash2-NInfer-v3 es un artefacto de inferencia publicado por el usuario kaushikvira que empaqueta un checkpoint Qwen3.8-27B de 27.000 millones de parametros, previamente "abliterado" (eliminacion de la direccion de rechazo) por d0xin, en formato NVFP4 W4A4 para el motor NInfer. El modelo es multimodal (image-text-to-text), esta cuantizado integramente en NVFP4 para las proyecciones de texto y conserva la torre de vision y el cabezal de propuesta especulativa DFlash2. El resultado es un contenedor nativo `.ninfer` de 18,42 GiB pensado para ejecutarse en una unica GPU Blackwell, concretamente una RTX 5090 de 32 GB.

La relevancia del artefacto es doble. Por un lado, demuestra una ruta completa de cuantizacion NVFP4 (W4A4, grupo 16) sobre un transformer multimodal de 27B con decodificacion especulativa integrada, algo poco habitual en el ecosistema open source. Por otro, introduce una tecnica propia de normalizacion de divisores globales que permite al motor NInfer fusionar padres de atencion (GDN `qkvz` de 16.384 filas y full-attention `qkgv` de 14.336 filas) en una sola region contigua, requisito del motor para la ruta de entrada A4.

El modelo no es un entrenamiento original: es una cadena de derivaciones sobre Qwen3.8-27B (ukisai), con abliteracion de huihui-ai y d0xin, drafter DFlash2 de z-lab y cuantizacion propia. La licencia declarada es Apache 2.0, aunque la cadena de modelos base impone condiciones adicionales que conviene revisar antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con atencion completa y capas GDN (Gated DeltaNet), mas MTP y drafter DFlash2; cuantizacion NVFP4 W4A4 |
| Parametros totales | 27.000 millones (27B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | 262.144 tokens (configurado en el ejemplo de servicio; `--max-context 262144`) |
| Tipos de cuantizacion | NVFP4 W4A4 grupo 16 en proyecciones de texto; W8G32 en embedding y cabeza de salida; q8_g32 x30; q4/q5/q6 en vision; BF16 en MTP y drafter |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Contenedor nativo `.ninfer` version 3 (`NINFER\0\x03`), 19.782.447.364 bytes (18,42 GiB), 1.590 objetos |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un transformer multimodal con atencion completa combinada con capas GDN (Gated DeltaNet) y un modulo MTP (multi-token prediction). Sobre ese checkpoint, huihui-ai aplico la tecnica de abliteracion por eliminacion de direccion de rechazo (familia Arditi et al. 2024) y d0xin produjo el checkpoint BF16 abliterado concreto que se cuantizo aqui. Segun `ABLITERATION.json`, la ablacion es de rango 1 sobre el residual-writer, con la formula `W' = W − r(rᵀ W)`, 131 tensores modificados, capa de referencia 38, proyeccion en fp32 y fuga residual maxima en BF16 de 1,49e-3.

La cuantizacion se realizo con `llm-compressor` sobre 512 muestras de calibracion de Ultrachat con secuencia 2048, en pipeline secuencial. Se aplico NVFP4 W4A4 grupo 16 a todas las proyecciones de texto: MLP gate/up/down en las 64 capas, Q/K/V/O de atencion completa y `in_proj_qkv/z/out_proj` de GDN, con la pauta de excepcion BF16 de 9 tensores del perfil Qwen3.6-27B. El embedding de tokens y la cabeza de salida quedan en W8G32; la torre de vision usa la asignacion oficial q6/q8; MTP y el drafter DFlash2 se mantienen en BF16. La innovacion tecnica destacable es la normalizacion de divisores globales: se unifica el divisor de cada grupo de empaquetado a `D = min(dᵢ)` y se reescalan las escalas de bloque E4M3 por `D/dᵢ` con redondeo RNE y solo decrecimiento, verificando invariancia de desquantizacion (deriva maxima del 2,7% en los elementos de menor magnitud, mediana del 0,0000%).

## Capacidades

- Generacion de texto conversacional multi-turno con contexto de hasta 262.144 tokens.
- Razonamiento con modo de pensamiento configurable (`--default-thinking-budget 16384`, `--preserve-thinking`).
- Procesamiento de imagen y texto combinados (pipeline `image-text-to-text`), con torre de vision cuantizada en q4/q5/q6.
- Decodificacion especulativa mediante drafter DFlash2 con cabezal de propuesta indexado (`--spec dflash2 --draft-tokens 7 --lm-head-draft`).
- Prediccion multi-token (MTP) integrada en el contenedor.
- Generacion sin censura por construccion (checkpoint abliterado), sin filtros de rechazo aprendidos.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita en la informacion proporcionada.
- Capacidades multilingues: no disponible.

## Casos de uso

- Servicio de chat multimodal en una unica RTX 5090: el motor NInfer arranca con `--vision` y `--max-context 262144`, permitiendo conversaciones largas con imagenes intercaladas sin salir de una GPU de consumo. Adecuado para prototipos y demos que requieran privacidad de datos en local.
- Analisis de documentos extensos con imagenes: gracias a la ventana de 262.144 tokens y a la torre de vision, se pueden enviar informes con graficos y tablas escaneadas junto con instrucciones largas en una sola peticion.
- Investigacion sobre alineacion y seguridad: al ser un checkpoint abliterado, sirve como referencia para estudiar la eliminacion de la direccion de rechazo y comparar comportamientos frente al modelo base, con la ventaja de que la evaluacion pareada de d0xin (298 muestras) reporta MMLU-Pro +6,1 puntos y math-500 sin cambios.
- Evaluacion de cuantizacion NVFP4: el contenedor es un caso de estudio reproducible de cuantizacion W4A4 grupo 16 con normalizacion de divisores globales, util para validar pipelines de cuantizacion en Blackwell.
- Despliegue de bajo coste con concurrencia moderada: la configuracion de referencia usa `--max-concurrency 4`, `--kv-dtype k8v4`, `--host-kv-mib 49152` y `--prefill-chunk 4096`, lo que permite servir varias sesiones con KV en host y capacidad automatica.
- Generacion creativa sin restricciones de contenido: el caracter abliterado lo hace adecuado para escritura de ficcion, guiones o narrativa adulta donde los filtros estandar bloquean respuestas, siempre que se cumplan los requisitos legales y eticos de cada jurisdiccion.
- Aceleracion de inferencia con decodificacion especulativa: el drafter DFlash2 con 7 tokens de borrador y cabezal de propuesta permite reducir la latencia de generacion en cargas de texto largo, aprovechando que el artefacto ya incluye el drafter empaquetado.

## Benchmarks y rendimiento

La model card unicamente reporta la evaluacion pareada realizada por d0xin sobre el checkpoint abliterado frente al base, con 298 muestras:

| Benchmark | Resultado reportado |
|---|---|
| MMLU-Pro | +6,1 puntos frente al base (no significativo, el intervalo de confianza cruza 0) |
| MATH-500 | sin cambios |

No se han publicado resultados de benchmarks en la informacion disponible para MMLU, HumanEval, GSM8K ni otras pruebas estandar, ni comparaciones de throughput o latencia del contenedor NInfer.

## Requisitos de hardware

- VRAM estimada para inferencia: el contenedor ocupa 18,42 GiB en disco; en ejecucion cabe en los 32 GB de una RTX 5090 con KV en host (`--host-kv-mib 49152`), segun la configuracion de referencia.
- GPU recomendadas: RTX 5090 (32 GB) como plataforma objetivo declarada; cualquier GPU Blackwell con soporte NVFP4 deberia poder ejecutarlo, aunque no se documentan otras configuraciones.
- Cabe en GPU de consumo: si, en RTX 5090; no se garantiza en GPUs Ampere o Ada sin soporte nativo NVFP4.
- Opciones de despliegue: exclusivamente el motor NInfer (`ninfer-serve`), version de contenedor 3 y commit igual o superior a `98dada0e`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles. La decodificacion especulativa con 7 tokens de borrador y el cabezal de propuesta estan disenados para reducir latencia, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Motor |
|---|---|---|---|---|---|
| Qwen3.8-27B-swift-abliterated-nvfp4full-dflash2-NInfer-v3 | 27B | 262.144 | `.ninfer` NVFP4 | Apache 2.0 | NInfer |
| kaushikvira/Qwen3.8-27B-nvfp4full-dflash2-NInfer-v3 | 27B | no disponible | `.ninfer` NVFP4 | no disponible | NInfer |
| d0xin/Swift-Qwen3.8-27B-Uncensored-BF16 | 27B | no disponible | BF16 (safetensors) | no disponible | generico |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | 27B | no disponible | safetensors | no disponible | generico |
| Barding-Defense/Qwen3.8-27B-huihui-abliterated-NVFP4-NInfer | 27B | no disponible | NVFP4 `.ninfer` | no disponible | NInfer |

La comparativa se limita a la propia cadena de derivaciones porque no se dispone de datos de rendimiento ni de especificaciones completas de alternativas fuera de esa familia. El artefacto de kaushikvira se presenta como el perfil de produccion que sustituyo al modelo no abliterado tras una prueba A/B en la misma sesion.

## Limitaciones y advertencias

- El checkpoint esta abliterado: se elimino la direccion de rechazo, por lo que el modelo puede producir contenido que los modelos alineados bloquean. Esto traslada toda la responsabilidad de filtrado y moderacion al operador.
- La evaluacion de d0xin sobre MMLU-Pro (+6,1 puntos) no es estadisticamente significativa; no debe interpretarse como una mejora real de capacidades.
- La cuantizacion NVFP4 introduce ruido de reencode E4M3: la deriva maxima medida es del 2,7% en los elementos de menor magnitud, con mediana del 0,0000%. En tareas sensibles a precision numerica conviene validar contra el checkpoint BF16.
- Dependencia total del motor NInfer: no hay soporte para vLLM, llama.cpp, Ollama ni TGI, lo que limita la portabilidad y la integracion en infraestructuras existentes.
- Compatibilidad restringida a GPUs Blackwell con soporte NVFP4; el artefacto no esta pensado para Ampere, Ada ni hardware sin aceleracion FP4.
- La licencia Apache 2.0 se declara sobre este artefacto, pero la cadena de modelos base (ukisai, huihui-ai, d0xin, z-lab) puede imponer condiciones adicionales; es necesario revisar cada licencia antes de un uso comercial.
- No se documentan idiomas soportados ni evaluaciones multilingues; el rendimiento fuera del ingles y el chino es desconocido.
- No se aportan datos de sesgo, tasas de alucinacion ni evaluaciones de seguridad del checkpoint abliterado.
- El modelo usa `--kv-dtype k8v4` y KV en host en la configuracion de referencia; configuraciones con KV en GPU pueden no caber en 32 GB con contexto maximo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kaushikvira/Qwen3.8-27B-swift-abliterated-nvfp4full-dflash2-NInfer-v3
- Modelo no abliterado del mismo autor: https://huggingface.co/kaushikvira/Qwen3.8-27B-nvfp4full-dflash2-NInfer-v3
- Checkpoint BF16 abliterado de origen: https://huggingface.co/d0xin/Swift-Qwen3.8-27B-Uncensored-BF16
- Checkpoint base upstream: https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Linaje de la tecnica de abliteracion: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Drafter DFlash2: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Guia de cuantizacion NInfer de referencia: https://huggingface.co/Barding-Defense/Qwen3.8-27B-huihui-abliterated-NVFP4-NInfer
- Motor NInfer: https://github.com/Neroued/ninfer
- Suite de evaluacion OBLITERATUS: https://pliny.gg
