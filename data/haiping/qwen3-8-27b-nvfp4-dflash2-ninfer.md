# haiping/Qwen3.8-27B-nvfp4-dflash2-NInfer

## Resumen

Qwen3.8-27B-nvfp4-dflash2-NInfer es un artefacto de inferencia derivado de Qwen3.8-27B, publicado por el usuario haiping en HuggingFace. No se trata de un checkpoint entrenado desde cero ni de una distribución estándar de pesos, sino de un fichero único en formato `.ninfer` v3 (23,27 GB) que empaqueta el modelo de texto, la torre de visión, la cabeza MTP y un drafter DFlash2 para decodificación especulativa. El artefacto está pensado exclusivamente para ejecutarse en el motor NInfer y en velox, no en Transformers, safetensors ni GGUF.

La contribución concreta de esta variante respecto a su fuente (`neroued/Qwen3.8-27B-nvfp4-NInfer`) es acotada: únicamente se dequantizaron y recodificaron en NVFP4 los pesos fusionados gate/up del MLP del drafter DFlash2 (`dflash2/layers/*/mlp/{gate,up}`, originalmente Q8 G32). El resto de objetos se copia byte a byte, con bindings, usos, componentes y metadatos sin cambios. Esto ahorra aproximadamente 425 MiB de memoria de dispositivo, a costa de una variación mínima en la tasa de aceptación del drafter (de 56,6 % a 56,5 % en una repetición de 91 pasos) y sin cambios en el grounding.

Es relevante para quienes despliegan Qwen3.8-27B en hardware con memoria de dispositivo ajustada y quieren exprimir decodificación especulativa con cuantización NVFP4 en GPUs Blackwell. La licencia es Apache-2.0, la misma que el modelo base y el artefacto de origen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (arquitectura Qwen3.5 Dense segun la fuente), con torre de vision, cabeza MTP y drafter DFlash2 |
| Parametros totales | 27B (heredado de Qwen3.8-27B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4, FP8 (fp8_e4m3fn con escalas por fila), Q8 G32, Q4 G64, Q5, Q6, BF16, INT32, FP32 (mezcla por componente) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `.ninfer` v3 (fichero unico, 23,27 GB); no es safetensors, GGUF ni checkpoint de Transformers |

Desglose interno del artefacto por formato y layout:

| Formato / layout | Objetos | GB |
|---|---:|---|
| `fp8_e4m3fn_row_bf16` / `row_scale_v1` | 146 | 11,90 |
| `nvfp4` / `block_scale_k16_m128x4_v1` | 117 | 8,92 |
| `q8_g32_fp16` / `row_split_k128_v1` | 23 | 1,39 |
| `q4_g64_fp16` / `row_split_k128_v1` | 55 | 0,49 |
| `bf16` / `contiguous_le_v1` | 579 | 0,45 |
| otros (q5, q6, int32, fp32, recursos) | — | 0,13 |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura transformer densa identificada en la documentación del artefacto de origen como Qwen3.5 Dense. La distribución de precisión no es uniforme: las capas de texto 0–55 usan pesos MLP en NVFP4, mientras que el embedding de tokens, las proyecciones de entrada/salida de atención, las proyecciones GDN Q/K/V/Z y de salida, la cabeza de salida completa y los pesos MLP de las capas de texto 56–63 emplean FP8 con escalas por fila. Los pesos de control van en BF16, y MTP, Vision y DFlash2 se almacenan como bloques separados. Esta mezcla busca concentrar la compresión agresiva en las matrices grandes del MLP y preservar precisión en los puntos sensibles del grafo.

Sobre el entrenamiento no hay información en los materiales disponibles: no se documentan número de tokens, composición del dataset ni si hubo RLHF o DPO. La innovación técnica del artefacto no reside en el entrenamiento sino en el empaquetado para inferencia: decodificación especulativa mediante DFlash2 con drafter propio, cabeza MTP para predicción multi-token y cuantización NVFP4 con escalas de bloque `k16_m128x4_v1` orientada a GPUs Blackwell. En esta variante concreta se ha recodificado el MLP gate/up del drafter a NVFP4, lo que reduce el coste de memoria del componente especulativo sin degradar de forma medible la aceptación.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base Qwen3.8-27B.
- Procesamiento de visión: el artefacto incluye una torre de visión separada, por lo que el pipeline es multimodal.
- Decodificación especulativa con DFlash2: drafter integrado que acelera la generación; en la repetición de 91 pasos reportada alcanza un 56,5 % de aceptación.
- Predicción multi-token mediante cabeza MTP, incluida en el artefacto.
- Cuantización mixta NVFP4/FP8/Q8/Q4 para reducir huella de memoria manteniendo capas críticas en mayor precisión.
- Ejecución en los motores NInfer y velox con formato KV NVFP4 (`--kv-format nvfp4`).
- Soporte de tool calling, function calling, comportamiento agéntico multi-paso y cobertura multilingüe: no disponible en la información proporcionada (se presumen heredados del base, pero no se documentan aquí).
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Despliegue local de un modelo de 27B en GPU Blackwell con memoria ajustada: el artefacto de 23,27 GB en NVFP4/FP8 permite servir el modelo en una sola GPU consumer de gama alta (se reporta funcionamiento en RTX 5090) usando `velox serve --artifact ... --kv-format nvfp4 --port 8010`.
- Generación de texto interactiva de baja latencia: la combinación de DFlash2 con MTP y KV en NVFP4 está orientada a maximizar tokens por segundo; en foros se reportan cifras del orden de 175 tok/s en RTX 5090 para variantes NInfer con MTP activo, lo que encaja en asistentes de escritura o chat en tiempo real.
- Transcripción y análisis de documentos con imágenes: al incluir torre de visión, el artefacto puede alimentar pipelines de extracción de información de capturas, formularios o diagramas junto con texto.
- Prototipado de agentes con decodificación especulativa: útil para equipos que evalúan el impacto real del drafter DFlash2 en tareas de varios pasos antes de comprometerse con un despliegue mayor.
- Servicio interno de inferencia con licencia permisiva: Apache-2.0 permite integrar el artefacto en productos comerciales sin obligaciones de copyleft, siempre que se respete la licencia del modelo base.
- Benchmarking de cuantización NVFP4 frente a FP8: la estructura mixta del fichero permite comparar precisión y velocidad por componente (MLP en NVFP4 frente a atenciones en FP8) en el mismo motor.
- Reproducción de experimentos de decodificación especulativa: el artefacto documenta la tasa de aceptación del drafter, lo que facilita validar cambios en el drafter sin tocar el resto del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los únicos datos de rendimiento documentados son internos al artefacto:

| Metrica | Valor |
|---|---|
| Tamano del artefacto | 23,27 GB |
| Ahorro de memoria frente a la fuente | ~425 MiB |
| Aceptacion del drafter DFlash2 (91 pasos) | 56,5 % (frente a 56,6 % en la fuente) |
| Cambio en grounding | ninguno |
| Throughput reportado en foro (RTX 5090, variante NInfer con MTP) | ~175 tok/s (dato no verificado, de discusión en Reddit) |

## Requisitos de hardware

- VRAM estimada: el artefacto ocupa 23,27 GB en disco; en inferencia hay que sumar caché KV en NVFP4 y buffers del runtime, por lo que se recomienda un mínimo de 24 GB de VRAM y margen adicional para contextos largos.
- GPU recomendadas: GPUs con soporte NVFP4 (generación Blackwell, p. ej. RTX 5090, B200); el formato NVFP4 con escalas de bloque `k16_m128x4_v1` está pensado para estas arquitecturas.
- Cabe en GPU consumer: sí, en RTX 5090 (32 GB) según reportes de la comunidad; en GPUs de 24 GB el margen para contexto y caché KV es ajustado.
- Opciones de despliegue: NInfer y velox exclusivamente. No es compatible con vLLM, llama.cpp, Ollama ni TGI, al no ser safetensors ni GGUF.
- Comando de servicio: `velox serve --artifact qwen3_8_27b_nvfp4_draftmlp-nvfp4.ninfer --kv-format nvfp4 --port 8010`.
- Latencia y throughput: no hay cifras oficiales publicadas; el dato de ~175 tok/s en RTX 5090 proviene de un comentario en Reddit y no debe tomarse como medición reproducible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| haiping/Qwen3.8-27B-nvfp4-dflash2-NInfer | 27B | no disponible | `.ninfer` v3 | Apache-2.0 | Drafter DFlash2 con MLP en NVFP4; solo NInfer/velox |
| neroued/Qwen3.8-27B-nvfp4-NInfer | 27B | no disponible | `.ninfer` | Apache-2.0 | Artefacto fuente; drafter en Q8 G32; ~425 MiB mas pesado |
| neroued/Qwen3.8-27B-NInfer | 27B | no disponible | `.ninfer` | Apache-2.0 | Proyecciones Q4/Q5, embedding y cabeza en q8_g32_fp16; incluye Vision, MTP y DFlash2 |
| Qwen/Qwen3.8-27B (base) | 27B | no disponible | safetensors (presumible) | Apache-2.0 | Checkpoint original; requiere conversion para NInfer |

## Limitaciones y advertencias

- No es un checkpoint de Transformers, safetensors ni GGUF: solo funciona con NInfer y velox. Cualquier pipeline basado en vLLM, llama.cpp, Ollama o TGI queda fuera de alcance.
- La cuantización NVFP4 en el MLP del drafter reduce memoria pero puede introducir ligeras diferencias numéricas; la propia model card reporta una caída de aceptación de 0,1 puntos porcentuales.
- El artefacto depende de GPUs con soporte NVFP4; en hardware anterior el rendimiento o la compatibilidad no están garantizados.
- No se documentan sesgos, comportamiento multilingüe ni tasas de alucinación específicas de esta variante; deben evaluarse sobre el modelo base.
- Longitud de contexto no disponible en la documentación; conviene verificarla en el repositorio del modelo base antes de diseñar aplicaciones con contexto largo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día: no hay validación comunitaria ni historial de mantenimiento.
- La licencia Apache-2.0 es permisiva para uso comercial, pero se hereda del modelo base; conviene revisar también los términos de Qwen/Qwen3.8-27B.
- Las cifras de throughput (~175 tok/s) provienen de un comentario en Reddit y no de una medición oficial; no deben usarse como SLA.

## Enlaces

- Artefacto en HuggingFace: https://huggingface.co/haiping/Qwen3.8-27B-nvfp4-dflash2-NInfer
- Artefacto fuente: https://huggingface.co/neroued/Qwen3.8-27B-nvfp4-NInfer
- Variante NInfer sin NVFP4: https://huggingface.co/neroued/Qwen3.8-27B-NInfer
- Model card de referencia en GitHub: https://github.com/Neroued/ninfer/blob/master/model-cards/Qwen3.8-27B-nvfp4-NInfer/README.md
- Motor NInfer: https://github.com/Oceania2018/ninfer-cua
- Discusión en Reddit sobre NInfer en RTX 5090: https://www.reddit.com/r/LocalLLM/comments/1woxb4n/ninfer_qwen_3827b_uncensored_on_rtx_5090_175_toks/
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
