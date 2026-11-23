# Launch80/Qwen3.8-Flash-Next-MACaQ-SABER

## Resumen

Qwen3.8-Flash-Next-MACaQ-SABER es un paquete de pesos cuantizados derivado de Qwen/Qwen3.8-Flash-Next, publicado por el usuario Launch80. No es un checkpoint estándar: se trata del conjunto de bytes exactos que sirve el motor Saber, un runtime nativo de ROCm para GPUs AMD RDNA4 (gfx1201, Radeon AI PRO R9700). El paquete está diseñado para tensor parallelism en dos GPUs (TP=2) y no carga en bibliotecas de Hugging Face ni en otros motores de inferencia convencionales.

El modelo base es un transformer con mezcla de expertos (MoE) y capacidades multimodales (pipeline image-text-to-text), con 48 capas y 512 expertos enrutados por capa. La contribución principal del paquete es la cuantización MACaQ de los expertos enrutados y del experto compartido a int4 con activaciones int8 (W4A8), mientras que el tronco (atención, mezcladores GDN, LM head) se mantiene en 8 bits y la torre de visión en bf16.

La relevancia de esta ficha es doble: por un lado, documenta una técnica de cuantización poco habitual (escalas por fila, transformada de Walsh-Hadamard de 32 columnas, búsqueda de clip sobre la diagonal del Hessiano y refinamiento con 512 flips de código voraces); por otro, advierte de que el artefacto no es reutilizable fuera del motor propietario Saber, lo que limita su valor práctico para la mayoría de desarrolladores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con mezcladores GDN y torre de visión (base: Qwen3.8-Flash-Next) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (MoE con 512 expertos enrutados por capa, 48 capas) |
| Longitud de contexto | no disponible (se menciona recuperación de aguja en 32k tokens) |
| Tipos de cuantizacion | MACaQ int4 (W4A8) en expertos; fp8 W8A8 en tronco; MXFP4 en drafter MTP; bf16 en visión y registros densos compartidos; KV cache en fp8 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-license-1.0 (etiquetada como "other") |
| Formato de pesos | Paquete propietario del motor Saber (`.xtier`, `.tsh`, `.shq.xtier`, `trunk8.*`, `mtp_x4.*`, `mtp_fp8.*`); no es safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer con mezcla de expertos que combina capas de atención con mezcladores GDN (probablemente una variante de atención lineal o híbrida, aunque el detalle no se especifica en la información disponible). El paquete incluye 48 capas con 512 expertos enrutados cada una, un experto compartido por capa, un drafter MTP para decodificación especulativa y una torre de visión en bf16. El tronco se distribuye en fp8 W8A8 y las matrices de mezcla de hiperconexión también en fp8.

El proceso de cuantización MACaQ descrito en la model card incluye: recogida de activaciones ponderadas por el router por capa; construcción del Hessiano (diagonal para la búsqueda de clip, completo para el refinamiento) de las GEMMs de cada experto; búsqueda de escala por fila sobre 29 candidatos de clip bajo una escala por canal de entrada `t` compartida por capa (media geométrica 1); y refinamiento de los códigos int4 con K=512 flips voraces contra el Hessiano completo ponderado por router (ridge 0.03). Los pesos no-expertos provienen del build MXFP4 de AMD (amd/Qwen3.8-Flash-Next-Quark-MXFP4), y los expertos FP8 alternativos del drafter MTP provienen del release FP8 original de Qwen. No se dispone de información sobre el dataset de entrenamiento del modelo base ni sobre si hubo RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento (hereda las capacidades del modelo base Qwen3.8-Flash-Next, no detalladas en la información disponible).
- Procesamiento de imagen y texto (pipeline image-text-to-text, torre de visión en bf16).
- Decodificación especulativa mediante drafter MTP incluido en el paquete.
- Recuperación de contexto largo: la model card reporta un test de aguja en 32k tokens superado.
- Modo "thinking" desactivable: los resultados de GSM8K se reportan con thinking off.
- Soporte de tool calling, agentes y capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Investigación en cuantización de MoE: el paquete documenta con detalle el pipeline MACaQ (calibración, búsqueda de escalas, flips de código), lo que permite reproducir o auditar la técnica sobre el modelo base.
- Archivado reproducible de pesos servidos: al incluir manifest, plan, aliases y sha256 de cada miembro, sirve para verificar que los bytes servidos en producción coinciden con lo publicado.
- Evaluación de motores ROCm en RDNA4: los datos de throughput y latencia (197,6 tok/s en single stream, 498,4 tok/s con 8 concurrentes) permiten comparar el motor Saber con alternativas en hardware AMD Radeon AI PRO R9700.
- Despliegue en clústeres de dos GPUs Radeon AI PRO R9700: el layout TP=2 con 32 GB por tarjeta está pensado para servir el modelo en ese hardware concreto.
- Benchmarking de fidelidad de cuantización: la comparación de KL frente al modelo bf16 (0,0517 frente a 0,1023 del control MXFP4) es útil para estudiar el impacto de distintas estrategias de cuantización en expertos.
- Pruebas de decodificación especulativa: el drafter MTP en dos formatos (MXFP4 por defecto y FP8 alternativo) permite evaluar el impacto del drafter en latencia y calidad.

## Benchmarks y rendimiento

Datos reportados por los mantenedores en 2x AMD Radeon AI PRO R9700 (gfx1201, 32 GB cada una), TP=2, tarjetas limitadas a 210 W, comparados contra el mismo motor sirviendo los expertos MXFP4 de AMD Quark como control:

| Metrica | Este paquete (MACaQ) | Control MXFP4 |
|---|---|---|
| Divergencia KL vs modelo bf16 (25 prompts, 885 posiciones) | 0,0517 [0,032; 0,072] | 0,1023 [0,058; 0,137] |
| Cambio de KL pareado | -49,4 % [-60,0; -24,7], mejor en 20/25 prompts | -- |
| Acuerdo top-1 con bf16 | 0,942 | 0,920 |
| GSM8K (100 problemas, thinking off) | 98 | 97 |
| Reproducibilidad con semilla (20 prompts x 2) | 20/20 idénticos | -- |
| Recuperación de aguja en 32k tokens | pasa | -- |
| Decode tok/s, single stream (BetterBench `--quick`) | 197,6 | 182,2 |
| Decode tok/s, 8 concurrentes (BetterBench `--quick`) | 498,4 | 455,9 |
| TTFT p50 / p99 (ms) | 58 / 101 | 62 / 109 |
| Update inter-token p99 (ms) | 16,9 | 18,6 |

Advertencias del autor: los intervalos de KL son confianza sobre 25 prompts y 5 de ellos empeoran; las cifras de velocidad provienen de 2 arranques por brazo en orden A B B A con temperatura 0,7 y dependen del motor, hardware y límite de potencia; la diferencia de 1 punto en GSM8K está dentro del ruido. El paquete falla por construcción la puerta de numérica "FN80d envelope" del motor, ya que esta compara contra una referencia que ya incorpora los expertos MXFP4 de Quark.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 71,1 GB, distribuido en dos rangos (TP=2) sobre GPUs de 32 GB cada una.
- GPU recomendadas: 2x AMD Radeon AI PRO R9700 (gfx1201, RDNA4, 32 GB). No se menciona soporte para otras GPU.
- GPU de consumo: no disponible; el motor Saber es específico de ROCm y RDNA4.
- Opciones de despliegue: exclusivamente el motor Saber (no público). No carga en vLLM, llama.cpp, Ollama, TGI ni bibliotecas de Hugging Face.
- Latencia y throughput: 197,6 tok/s en single stream y 498,4 tok/s con 8 concurrentes; TTFT p50/p99 de 58/101 ms; update inter-token p99 de 16,9 ms (medidos a 210 W por tarjeta).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-MACaQ-SABER | no disponible (MoE, 48 capas x 512 expertos) | no disponible (prueba en 32k) | MACaQ int4 W4A8 + fp8 tronco | qwen-community-license-1.0 | Paquete propietario Saber, solo motor Saber |
| amd/Qwen3.8-Flash-Next-Quark-MXFP4 | mismo modelo base | no disponible | MXFP4 expertos | licencia del modelo base | Checkpoint Quark (usado como control) |
| Qwen/Qwen3.8-Flash-Next (bf16) | mismo modelo base | no disponible | bf16 | qwen-community-license-1.0 | safetensors estándar |
| Qwen/Qwen3.8-Flash-Next (FP8) | mismo modelo base | no disponible | FP8 | qwen-community-license-1.0 | safetensors estándar |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, salvo el control MXFP4 incluido en la tabla de rendimiento anterior.

## Limitaciones y advertencias

- El paquete no es un checkpoint estándar: no carga en Hugging Face, vLLM, llama.cpp, Ollama ni TGI. Solo funciona con el motor Saber, que no es público.
- El layout está fijado a TP=2 con dos directorios `rank0/` y `rank1/`; no es portable a otras configuraciones de hardware.
- El paquete falla por construcción la puerta de numérica "FN80d envelope" del motor, porque sustituye los expertos MXFP4 de referencia.
- La licencia qwen-community-license-1.0 impone restricciones de uso comercial que deben revisarse antes de cualquier despliegue en producción.
- La divergencia KL frente al modelo bf16 es de 0,0517, con 5 de 25 prompts empeorando respecto al control; el acuerdo top-1 es 0,942, no 1,0.
- La reproducibilidad con semilla es buena (20/20), pero las cifras de velocidad dependen del motor, del hardware y del límite de potencia de 210 W.
- No se dispone de información sobre sesgos, idiomas soportados, riesgo de alucinación específico ni sobre el dataset de entrenamiento del modelo base.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (23 de noviembre de 2026), sin histórico de mantenimiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Launch80/Qwen3.8-Flash-Next-MACaQ-SABER
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Build MXFP4 de AMD (origen de pesos no-expertos): https://huggingface.co/amd/Qwen3.8-Flash-Next-Quark-MXFP4
- Licencia Qwen Community License 1.0: incluida en el repositorio como archivo `LICENSE`
