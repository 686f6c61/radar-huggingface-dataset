# abdelhayali91/Qwen3.8-27B-NariQ-MTP-GGUF

## Resumen

Qwen3.8-27B-NariQ-MTP-GGUF es una cuantización GGUF del modelo Qwen3.8-27B de Qwen a la que se le ha injertado una cabeza MTP (multi-token prediction, capa `nextn`) funcional para decodificación especulativa. El trabajo lo publica el usuario abdelhayali91 y parte de la cuantización NariQ de nari-labs, que codifica los tensores con un esquema propietario (trellis) y se distribuye sin cabeza MTP. El añadido permite acelerar la decodificación aproximadamente 1,8x sin alterar la salida, un requisito habitual en despliegues de inferencia local con llama.cpp.

El problema que resuelve es concreto: la cuantización NariQ original no incluye la capa MTP y los drafters externos (DFlash, DSpine) no arrancan porque comparten el embedding y la LM head del modelo objetivo, que están codificados con trellis. Este repositorio añade los tensores `blk.64.*` (atención, FFN, `nextn.eh_proj`, normas), una LM head plana (`blk.64.nextn.shared_head_head.weight`) y un embedding plano (`blk.64.nextn.embed_tokens.weight`), tomados de la cuantización UD-Q5_K_XL de unsloth. El resto de tensores NariQ se mantiene byte a byte idéntico al original.

El modelo base tiene 29.873.253.184 parámetros (unos 29,9 mil millones) y una arquitectura híbrida con capas recurrentes y de atención completa, según la metadata (`attention.recurrent_layers`, `qwen35.block_count`). Se distribuye en dos cuantizaciones (3.0 bpw y 2.5 bpw), con licencia Apache-2.0 y compatibilidad con endpoints. Es relevante para quienes despliegan Qwen3.8-27B en hardware de consumo o en configuraciones multi-GPU y necesitan maximizar el throughput de decodificación sin perder calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con capas recurrentes y de atención completa (metadata `qwen35`), con capa MTP (`nextn`) añadida |
| Parametros totales | 29.873.253.184 (~29,9 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens (262k) en el modelo base; el ejemplo de despliegue usa 65.536 tokens (64k) |
| Tipos de cuantizacion | NariQ 3.0 bpw y NariQ 2.5 bpw (GGUF); proyector de visión en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura transformer híbrida en la que conviven capas recurrentes y capas de atención completa; la metadata del GGUF lo confirma con los campos `qwen35.block_count` (64 capas en el original, 65 tras el injerto) y `attention.recurrent_layers`, al que se le añade una entrada de atención completa para la nueva capa. Sobre esa base, la cuantización NariQ de nari-labs aplica un esquema de codificación por bandas trellis: la LM head se divide en 16 bandas y el embedding de tokens también está codificado con trellis, lo que impide que los drafters externos estándar funcionen directamente.

El injerto MTP añade una capa de predicción multi-token (`nextn_predict_layers = 1`) con atención, FFN, proyección `nextn.eh_proj` y normas, además de una LM head plana y un embedding plano independientes para el paso especulativo. Los tensores provienen de `Qwen3.8-27B-UD-Q5_K_XL.gguf` de unsloth. No se dispone de información sobre el dataset de entrenamiento del modelo base, el número de tokens, ni si hubo RLHF o DPO; la model card solo documenta el proceso de injerto y las mediciones de rendimiento. La decodificación especulativa MTP es sin pérdida (lossless), por lo que la calidad coincide con la del archivo NariQ base.

## Capacidades

- Generación de texto conversacional multi-turno, según el tag `conversational`.
- Procesamiento de imagen y texto (`image-text-to-text`) mediante el proyector de visión `Qwen3.8-27B-NariQ-mmproj-BF16.gguf`.
- Decodificación especulativa MTP con aceptación del 72 % a `n-max 3`, que acelera la generación sin cambiar la salida.
- Razonamiento, código, seguimiento de instrucciones, búsqueda, uso de agentes y contexto largo, según la suite interna de evaluación citada (puntuación 85,0 en 3.0 bpw + MTP a 64k).
- Compatibilidad con endpoints (`endpoints_compatible`).
- Capacidades multilingües: no disponible.
- Tool calling / function calling: no documentado en la información disponible.

## Casos de uso

- Asistente conversacional local: el modelo gestiona diálogos multi-turno con hasta 64k tokens de contexto en una GPU de 20 GB, suficiente para sesiones largas con historial extenso y documentos adjuntos.
- Generación de código en estación de trabajo: con 61 tok/s en tareas de código (3.0 bpw + MTP, `n-max 3`), es viable para autocompletado y generación de funciones en editores integrados que consuman un endpoint compatible con llama.cpp.
- Análisis de imágenes con texto: usando el proyector de visión BF16 en una segunda GPU, permite describir capturas, extraer texto de documentos escaneados o responder preguntas sobre diagramas.
- Procesamiento de documentos largos: la ventana de 262k tokens del modelo base permite resumir o consultar contratos, informes o bases de código completas, aunque en 20 GB de VRAM conviene limitarse a 64k.
- Agentes multi-paso: la puntuación de 85,0 en la suite interna (que incluye agente y búsqueda) sugiere un comportamiento aceptable en flujos con varias llamadas encadenadas, siempre que el motor soporte el formato de herramientas del modelo.
- Despliegue en hardware de gama alta de consumo: con 11,2 GB (2.5 bpw) o 12,9 GB (3.0 bpw), cabe en GPUs de 16 GB o más, lo que permite servir el modelo en una RTX 4080/4090 o A4500 sin infraestructura de centro de datos.
- Evaluación comparativa de cuantizaciones: el script `mtp_graft.py` permite reproducir el injerto sobre otras cuantizaciones NariQ, útil para equipos que quieran medir el impacto de bpw y MTP en su propio hardware.

## Benchmarks y rendimiento

Mediciones del autor en una RTX A4500 de 20 GB, con el modelo solo en esa GPU y el proyector de visión en una segunda GPU:

| Configuracion | Decode tok/s | Aceptacion MTP |
|---|---:|---:|
| 3.0 bpw, sin MTP (archivo original) | 29,3 | - |
| 3.0 bpw + MTP, n-max 2 | 46,7 | 79 % |
| 3.0 bpw + MTP, n-max 3 | 53,0 (código 61 / chat 45) | 72 % |
| 3.0 bpw + MTP, n-max 4 | 53,0 | 64 % |
| 2.5 bpw + MTP, n-max 3 | 53,1 | 72 % |
| 2.5 bpw + MTP, n-max 3, contexto 128k | 52,3 | 72 % |

Suite interna del autor (código, razonamiento, seguimiento de instrucciones, búsqueda, agente, visión y contexto largo): 85,0 puntos en 3.0 bpw + MTP a 64k, frente a 76,1 del original de 2.0 bpw. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM para inferencia: 12,9 GB para la cuantización 3.0 bpw y 11,2 GB para la 2.5 bpw, más aproximadamente 1 GB del embedding MTP que el autor recomienda mantener en RAM del sistema (`-ot "nextn\.embed_tokens=CPU"`).
- Proyector de visión: `Qwen3.8-27B-NariQ-mmproj-BF16.gguf` en una GPU adicional; el autor lo ejecuta en una segunda GPU.
- GPU recomendadas: RTX A4500 de 20 GB (medido), RTX 4090, RTX 4080, A100 y H100. Los kernels NariQ requieren Ampere o arquitectura posterior.
- Cabe en GPU de consumo: sí, en modelos con 16 GB o más de VRAM para las cuantizaciones publicadas; con 20 GB se ejecuta a 64k de contexto, pero 262k no cabe en esa tarjeta.
- Motor de despliegue: fork de llama.cpp de nari-labs (probado con la build Windows CUDA 12.8 `b12431-nariv0`); no es compatible con llama.cpp upstream, Ollama, vLLM ni TGI según la información disponible.
- Limitación multi-GPU: el motor rechaza colocar la capa MTP en una segunda GPU con `-ot blk\.64\.=CUDA1`; el proyector de visión sí puede ir en otra GPU.
- Latencia y throughput: 53,0 tok/s de decodificación con `n-max 3` a 3.0 bpw (61 en código, 45 en chat); 52,3 tok/s con contexto de 128k.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Decode tok/s | Licencia | Formato |
|---|---|---:|---:|---|---|
| Qwen3.8-27B-NariQ-MTP-GGUF (este) | ~29,9 B | 262k | 53,0 (A4500, 3.0 bpw + MTP) | Apache-2.0 | GGUF NariQ |
| Qwen3.8-27B-NariQ-GGUF (nari-labs) | ~29,9 B | 262k | 29,3 (A4500, 3.0 bpw, sin MTP) | Apache-2.0 | GGUF NariQ |
| Qwen3.8-27B-GGUF (unsloth, UD-Q5_K_XL) | ~29,9 B | 262k | no disponible | Apache-2.0 | GGUF estándar |
| Qwen/Qwen3.8-27B (base) | ~29,9 B | 262k | no disponible | Apache-2.0 | safetensors |

La ventaja medible de este repositorio frente a la cuantización NariQ original es el throughput: 53,0 frente a 29,3 tok/s en el mismo hardware, con salida idéntica. Frente a la cuantización estándar de unsloth, la diferencia está en el esquema de compresión NariQ (3.0 y 2.5 bpw) y en la necesidad de un fork específico de llama.cpp.

## Limitaciones y advertencias

- Requiere el fork de llama.cpp de nari-labs; no funciona con llama.cpp upstream ni con otros motores (Ollama, vLLM, TGI) según la información disponible.
- Los kernels NariQ exigen GPU Ampere o posterior; no hay soporte para tarjetas anteriores.
- El contexto de 262k no cabe en 20 GB de VRAM con MTP; en esa tarjeta hay que limitarse a 64k (o 128k con la cuantización 2.5 bpw).
- El embedding MTP añadido (~1 GB) debe residir en RAM del sistema; el motor rechaza distribuirlo a una segunda GPU.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas del modelo base en la información disponible.
- La licencia Apache-2.0 permite uso comercial, pero las condiciones del esquema NariQ y del fork del motor deben verificarse por separado antes de un despliegue en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; no hay validación comunitaria independiente de las mediciones del autor.
- El pipeline declarado es `image-text-to-text`, pero el uso de visión requiere descargar el proyector desde el repositorio original de nari-labs.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/abdelhayali91/Qwen3.8-27B-NariQ-MTP-GGUF
- Cuantización NariQ original: https://huggingface.co/nari-labs/Qwen3.8-27B-NariQ-GGUF
- Cuantización GGUF de unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Proyecto de referencia del autor: https://github.com/Abdelhayali/DualGPU-V100-A4500
- Script de reproducción: `mtp_graft.py` (incluido en el repositorio del modelo)
