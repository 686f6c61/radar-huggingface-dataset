# Capicua25x/Qwen3.8-27B-MXFP4-Quark-RDNA4

## Resumen

Qwen3.8-27B-MXFP4-Quark-RDNA4 es una cuantizacion MXFP4 del modelo vision-lenguaje denso Qwen/Qwen3.8-27B, construida con AMD Quark 0.12.post1 y orientada especificamente a GPUs RDNA4 (gfx1200/gfx1201: Radeon AI PRO R9700, RX 9070 XT), que quedan fuera de la lista oficial de targets ROCm de vLLM. El autor, Capicua25x, publica esta variante para permitir ejecutar la ventana de contexto completa de 262.144 tokens en configuraciones de 2×32 GB, con un rendimiento cercano al del FP8 stock y mejor throughput en prompts largos.

La cuantizacion es selectiva: solo las proyecciones MLP y de atencion lineal (432 modulos en total) se almacenan en 4 bits, mientras que atencion, normas, embeddings, lm_head y toda la ruta de vision permanecen en bf16. El resultado son 22,3 GB en 18 shards, frente a los ~54 GB del modelo bf16 original. El repositorio incluye un port de vLLM para RDNA4 con un kernel FP8-WMMA que activa la decodificacion especulativa nativa MTP-3.

La relevancia de esta ficha radica en que aborda un problema practico concreto: ejecutar un modelo de ~27.800 millones de parametros con ventana de 262K en hardware AMD de consumo, algo que el soporte oficial de ROCm no cubre. La licencia Apache 2.0 permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso vision-lenguaje con atencion lineal hibrida (base Qwen3.8-27B) |
| Parametros totales | ~27.800 millones logicos (22,7B en MXFP4 + 5,11B en BF16) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | MXFP4 (E2M1 + E8M0, escala por 32 pesos), `pack_method: reorder`, `weight_format: real_quantized` |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (18 shards, 22,3 GB) |

Nota: el contador de 16.445.010.672 parametros que muestra HuggingFace es un artefacto de visualizacion: MXFP4 almacena dos pesos de 4 bits por byte U8, por lo que el recuento de elementos no refleja los parametros reales. La arquitectura y el numero de parametros son identicos a Qwen/Qwen3.8-27B.

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso vision-lenguaje con una arquitectura hibrida que combina atencion full en 16 capas y atencion lineal en las 48 restantes, disenado para tareas de codigo, trabajo profesional, investigacion y agentes de horizonte largo. Incluye un encoder de vision nativo que acepta imagenes y video como entrada.

Esta variante cuantizada no reentrena el modelo: aplica cuantizacion RTN (round-to-nearest) sin calibracion, a diferencia de la variante `amd/Qwen3.8-27B-Quark-AWQ-MXFP4` que usa calibracion AWQ. La configuracion declara W4A4 con cuantizacion dinamica de activaciones fp4, pero en el port RDNA4 esa declaracion no se honra: el kernel weight-only ignora la cuantizacion de activaciones y el kernel FP8-WMMA usa su propia cuantizacion dinamica e4m3 por grupos de 32 K. La diferencia real frente a las builds AMD de decoder completo es la cobertura: 432 modulos cuantizados frente a 496, siendo la diferencia las proyecciones q/k/v/o de las 16 capas de atencion full que aqui permanecen en bf16.

## Capacidades

- Generacion de texto y razonamiento multi-step con modo thinking activable (temp 1.0, top_p 0.95, top_k 20, min_p 0) o modo no-thinking (temp 0.7, top_p 0.8, top_k 20, presence_penalty 1.5).
- Comprension de imagenes y video como entrada nativa (pipeline image-text-to-text), con la ruta de vision completa sin cuantizar en bf16.
- Soporte de tool calling y manejo de feedback de entorno para tareas agente de multiples pasos, segun las capacidades del modelo base.
- Ventana de contexto de 262.144 tokens, utilizable de forma completa en hardware RDNA4 de 2×32 GB gracias a la cuantizacion MXFP4.
- Decodificacion especulativa nativa MTP-3 (multi-token prediction) en el port vLLM RDNA4.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Despliegue local de un modelo vision-lenguaje de 27B en GPUs AMD RDNA4 de consumo: la cuantizacion MXFP4 reduce el peso de 54 GB a 22,3 GB, permitiendo cargar el modelo completo en 2×32 GB y mantener la ventana de 262K tokens, algo inviable con el bf16 original.
- Analisis de documentos largos con contexto extendido: la ventana de 262.144 tokens permite procesar manuales tecnicos, codebases completos o expedientes extensos en una sola pasada, con mejor throughput en prompts largos que el FP8 stock.
- Asistentes de codigo con tool calling: el modelo base esta optimizado para tareas de programacion y agentes, y esta cuantizacion mantiene la calidad del bf16 de referencia en las metricas medidas, permitiendo integrarlo en pipelines de CI/CD o IDEs.
- Razonamiento agente multi-paso en entornos de terminal y SO: el modelo base alcanza Terminal Bench 73.0 y OSWorld 84.3, y esta variante cuantizada permite ejecutarlo en hardware AMD sin acceso a centros de datos.
- Procesamiento de video e imagenes en el edge: la ruta de vision permanece en bf16, por lo que la calidad de comprension visual no se ve afectada por la cuantizacion, adecuado para aplicaciones de vision por computador en estaciones de trabajo con GPUs Radeon.
- Evaluacion de cuantizaciones MXFP4 en hardware RDNA4: el repositorio documenta el proceso de construccion con Quark, la lista de exclusion de 231 entradas y el flujo de benchmark, sirviendo como referencia para quien necesite reproducir cuantizaciones similares.

## Benchmarks y rendimiento

La model card no publica resultados de calidad por celda, pero afirma que la calidad esta "al nivel o por encima de la referencia bf16 en todas las celdas medidas excepto una", sin especificar cuales. Los datos de rendimiento publicados son de throughput, medidos el 2026-08-17 en 2× Radeon AI PRO R9700 (TP2, gfx1201) con el kernel FP8-WMMA y decodificacion especulativa MTP-3, con `max_tokens: 256` y thinking activado:

| Configuracion | Throughput single-stream | Ventana |
|---|---|---|
| Este artefacto, kernel FP8-WMMA (VLLM_RDNA_MXFP4_FP8=1) | ~61 tok/s | 262.144 |
| Este artefacto, kernel weight-only bf16-unpack (VLLM_RDNA_MXFP4_FP8=0) | ~51 tok/s | 262.144 |
| Qwen/Qwen3.8-27B-FP8 stock, capacidad equivalente | No publicado | 262.144 |

Los benchmarks del modelo base Qwen3.8-27B publicados en la web son: DeepSWE 42.2, Terminal Bench 73.0 y OSWorld 84.3. No se han publicado resultados de calidad especificos para esta cuantizacion en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 2×32 GB para la ventana completa de 262.144 tokens con el kernel FP8-WMMA. En GPUs de 32 GB sin el port RDNA4 no se alcanza la ventana de 262K.
- GPUs compatibles: Radeon AI PRO R9700 y RX 9070 XT (gfx1200/gfx1201). En GPUs RDNA4, el kernel FP8-WMMA es necesario para alcanzar ~61 tok/s; sin el, el camino weight-only rinde ~51 tok/s.
- En GPUs no RDNA4: los pesos cargan y generan correctamente en vLLM stock, pero mas lento (via de dequantizacion weight-only).
- Opciones de despliegue: vLLM con el port `Capicua25x/vllm-rocm-rdna4` (imagen docker `capicua25x/vllm-rocm-rdna4:0.26.1-rdna4-rc6`), con variable `VLLM_RDNA_MXFP4_FP8=1` para activar el kernel FP8-WMMA. Tambien es compatible con transformers.
- Latencia: ~61 tok/s single-stream en TP2 con MTP-3; el throughput mejora notablemente con prompts largos frente al FP8 stock a capacidad equivalente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Cobertura | Licencia |
|---|---|---|---|---|---|
| Capicua25x/Qwen3.8-27B-MXFP4-Quark-RDNA4 (este) | ~27,8B | 262.144 | MXFP4 RTN, 432 modulos | MLP + atencion lineal, atencion full en bf16 | Apache 2.0 |
| amd/Qwen3.8-27B-Quark-AWQ-MXFP4 | ~27,8B | 262.144 | MXFP4 AWQ, 496 modulos | Decoder completo incluyendo atencion | Apache 2.0 |
| Qwen/Qwen3.8-27B-FP8 | ~27,8B | 262.144 (con KV cache bf16: 131.072) | FP8 | Modelo completo | Apache 2.0 |

Las diferencias clave frente a la variante AMD son dos: la cobertura (432 modulos frente a 496, siendo la diferencia las proyecciones q/k/v/o de las 16 capas de atencion full) y el metodo de calibracion (RTN sin datos frente a AWQ). La model card indica que una unica ejecucion n=50 de GSM8K contra la variante AMD no es suficiente para publicar una comparacion de calidad, ya que el strict-match varia ±0.06 entre semillas en este hardware, mas ancho que cualquier diferencia observada.

## Limitaciones y advertencias

- La configuracion declara W4A4 con cuantizacion dinamica de activaciones fp4, pero el port RDNA4 no honra esa declaracion: el kernel weight-only ignora la cuantizacion de activaciones. Si se cargan estos pesos en un runtime que si la honre, se obtiene una ruta numerica diferente a la medida aqui.
- La calidad se afirma "al nivel o por encima del bf16 de referencia" en las celdas medidas, pero no se publican los numeros concretos ni la celda que queda por debajo. Hay una unica ejecucion n=50 de GSM8K contra la variante AMD, insuficiente para conclusiones.
- Sin el port RDNA4, el rendimiento cae de ~61 a ~51 tok/s y en GPUs de 32 GB no se alcanza la ventana de 262K tokens.
- El contador de parametros de HuggingFace (16,4B) es un artefacto de visualizacion que puede confundir a quien revise el repositorio; el modelo real tiene ~27,8B de parametros logicos.
- Los benchmarks de calidad publicados en la web (DeepSWE, Terminal Bench, OSWorld) corresponden al modelo base, no a esta cuantizacion, y no se ha verificado que se mantengan tras la cuantizacion.
- Riesgo de alucinacion y sesgos: no se han publicado evaluaciones especificas para esta variante; se heredan los del modelo base Qwen3.8-27B, no documentados en la informacion disponible.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero el port vLLM RDNA4 es un fork no oficial que puede requerir mantenimiento propio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Capicua25x/Qwen3.8-27B-MXFP4-Quark-RDNA4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante FP8 de referencia: https://huggingface.co/Qwen/Qwen3.8-27B-FP8
- Variante AMD AWQ-MXFP4: https://huggingface.co/amd/Qwen3.8-27B-Quark-AWQ-MXFP4
- Port vLLM RDNA4: https://github.com/Capicua25x/vllm-rocm-rdna4
- Documentacion AMD Quark: https://quark.docs.amd.com
- Guia del modelo base (OpenLM.ai): https://openlm.ai/qwen3.8/
- Ficha del modelo base (Jetson AI Lab): https://www.jetson-ai-lab.com/models/qwen3-8-27b/
- Guia completa de Qwen3.8-27B: https://lovableapp.org/blog/qwen3-8-27b
- Especificaciones y requisitos (YottaLabs): https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026
- Blog AMD sobre soporte Day 0: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
