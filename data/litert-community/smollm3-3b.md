# litert-community/SmolLM3-3B

## Resumen

SmolLM3-3B en formato LiteRT-LM es la conversión del modelo SmolLM3-3B de HuggingFaceTB al runtime on-device de Google, LiteRT-LM (el nuevo nombre de TensorFlow Lite en su vertiente de inferencia de modelos de lenguaje). El modelo base es un decoder transformer de 3B parámetros con licencia Apache-2.0, diseñado como razonador pequeño pero competitivo, con atención GQA, un esquema de atención NoPE y entrenamiento en contexto largo y multilingüe. Esta versión concreta la publica el colectivo litert-community, que distribuye los pesos ya cuantizados y empaquetados en el formato `.litertlm` listo para ejecutarse con el motor de Google AI Edge.

La relevancia de esta ficha está en el despliegue: frente a un checkpoint estándar en safetensors que requiere vLLM o llama.cpp, aquí se ofrece un bundle autocontenido con dos variantes de cuantización (int4 blockwise y int8), optimizado para GPU y CPU de dispositivos móviles y equipos de sobremesa. El repositorio ocupa 33,8 GB e incluye los grafos reescritos con composites de GPU (`odml.cache_update`, `odml.runtime_bmm`) que aceleran la decodificación y el prefill de forma medible.

El modelo resuelve el problema de llevar un LLM de 3B a hardware de consumo y a teléfonos: el fichero int4 pesa unos 2,0 GB y el int8 unos 3,1 GB, con una ventana de caché KV de 4096 tokens. Es una opción realista para prototipos de asistentes locales, demos en navegador con WebGPU y aplicaciones Android mediante la librería `com.google.ai.edge.litert:litert`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder con GQA y esquema de atencion NoPE (modelo base SmolLM3-3B) |
| Parametros totales | 3B (modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Entrenamiento en contexto largo en el modelo base; en este bundle la cache KV se limita a 4096 tokens |
| Tipos de cuantizacion | int4 blockwise (bloque 32) con OCTAV optimal-clipping simetrico y embeddings INT8; variante int8 |
| Idiomas soportados | no disponible (el modelo base declara soporte multilingue, sin lista detallada en la informacion proporcionada) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.litertlm` (bundle LiteRT-LM); ficheros `SmolLM3-3B_q4_block32_ekv4096.litertlm` (~2,0 GB) y `SmolLM3-3B.litertlm` (~3,1 GB) |

## Arquitectura y entrenamiento

El modelo base SmolLM3-3B es un decoder transformer de 3B parámetros con atención de consultas agrupadas (GQA) y un schedule de atención NoPE (sin positional encoding explícito en determinadas capas), pensado para razonamiento y contexto largo. La model card del repositorio lo describe como un "small reasoner" completamente abierto bajo Apache-2.0, con entrenamiento multilingüe y de contexto largo. No se detallan en la información disponible el número exacto de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

La innovación de esta publicación no está en el entrenamiento sino en el empaquetado y la optimización para inferencia. Los pesos se convierten con `litert-torch` (antes `ai-edge-torch`) y se cuantizan a int4 con bloques de 32 elementos y clipping óptimo OCTAV simétrico, manteniendo los embeddings en INT8. La reescritura de grafo de octubre de 2026 sustituye las dos operaciones `DYNAMIC_UPDATE_SLICE` por capa y las `BATCH_MATMUL` de atención por un composite `odml.cache_update` y composites `odml.runtime_bmm`, añadiendo además una firma de prefill de 16 tokens que comparte buffers de pesos con la firma existente. El resultado son mejoras de hasta 1,46x en decodificación GPU y reducciones de TTFT de hasta 0,18x en el mismo hardware.

## Capacidades

- Generación de texto y razonamiento de propósito general en un modelo de 3B parámetros.
- Razonamiento matemático básico: en la validación del autor, 26 de 30 preguntas de GSM8K correctas con decodificación greedy y hasta 2048 tokens.
- Soporte multilingüe heredado del modelo base (sin lista de idiomas detallada en la información disponible).
- Ejecución on-device con delegación completa de operaciones: 1509 ops delegadas en Galaxy S26 y Mac Studio M4 Max (int4), 1476 en Pixel 8a, 1512 en la variante int8.
- Inferencia en GPU y CPU del mismo bundle, con backend seleccionable (`--backend gpu`).
- Ejecución en navegador mediante WebGPU a través de la demo oficial de LiteRT-LM.
- Plantilla de chat compatible con la forma de content-parts de LiteRT-LM 0.18.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión ni audio en la información proporcionada.

## Casos de uso

- Asistentes locales en Android: integración mediante la librería `com.google.ai.edge.litert:litert` para ofrecer generación de texto sin conexión en teléfonos, con el fichero int4 de 2,0 GB y decodificación de 24,4 tok/s en un Galaxy S26.
- Demos interactivas en navegador: la demo WebGPU de LiteRT-LM carga el bundle y ejecuta inferencia en el cliente, útil para prototipos y validación de experiencias sin backend.
- Procesamiento de texto en equipos de sobremesa Apple Silicon: con 131,8 tok/s de decodificación y TTFT de 185 ms en un M4 Max, es adecuado para resúmenes, reescritura y clasificación por lotes en local.
- Aplicaciones de privacidad estricta: al ejecutarse íntegramente en el dispositivo, permite procesar documentos o conversaciones sensibles sin enviar datos a un servidor.
- Razonamiento matemático ligero y tutoría: los 26/30 en GSM8K lo hacen viable para resolver problemas aritméticos de varios pasos en aplicaciones educativas offline.
- Edge computing en placas como Raspberry Pi 5: el autor reporta mediciones en ese hardware, lo que habilita asistentes embebidos en dispositivos IoT con recursos limitados.
- Evaluación comparativa de runtimes: los registros de edge-compat permiten medir latencia y throughput entre LiteRT-LM, otras runtimes y distintas cuantizaciones sobre el mismo modelo.

## Benchmarks y rendimiento

Rendimiento medido en dispositivo por el autor (edge-compat, smollm3-3b):

| Hardware | Runtime | Backend | Decode (tok/s) | Prefill (tok/s) | TTFT |
|---|---|---|---|---|---|
| Galaxy S26 | LiteRT-LM prebuilt-adac974b | GPU | 24,4 | 382 | 2,72 s |
| Pixel 8a | LiteRT-LM 0.16.0 | GPU | 7,7 | 12 | 1,56 s |
| Mac Studio M4 Max | LiteRT-LM 0.17.1 | GPU | 131,8 | 1481 | 185 ms |

Variante int8:

| Hardware | Runtime | Backend | Decode (tok/s) | Prefill (tok/s) | TTFT |
|---|---|---|---|---|---|
| Galaxy S26 | LiteRT-LM prebuilt-adac974b | GPU | 16,0 | 452 | 2,33 s |
| Galaxy S26 | LiteRT-LM prebuilt-adac974b | CPU | 9,7 | 166 | 6,29 s |
| Mac Studio M4 Max | LiteRT-LM 0.17.1 | GPU | 106,0 | 1641 | 168 ms |

Efecto de la reescritura de grafo (M4 Max, litert-lm 0.17.1, `benchmark --cache no`):

| Metrica | int4 anterior → nuevo | int8 anterior → nuevo |
|---|---|---|
| Decode GPU, 256 tokens | 90,5 → 131,8 tok/s (x1,457) | 77,0 → 106,0 tok/s (x1,376) |
| Prefill GPU, 256 tokens | 1344 → 1481 tok/s (x1,103) | 1414 → 1641 tok/s (x1,160) |
| TTFT GPU, prefill 16 tokens | 0,111 → 0,035 s (x0,312) | 0,205 → 0,038 s (x0,184) |
| Decode CPU, 256 tokens | 24,8 → 24,5 tok/s (x0,990) | 24,4 → 24,2 tok/s (x0,990) |
| TTFT CPU, prefill 16 tokens | 1,325 → 0,542 s (x0,409) | 2,033 → 1,546 s (x0,761) |
| Init CPU | 2,0 → 2,8 s (x1,451) | 6,7 → 9,4 s (x1,410) |

Calidad: en 30 preguntas de GSM8K (greedy, hasta 2048 tokens) el fichero int4 acierta 26, las mismas que la versión anterior. En 8 preguntas y 1 prompt largo, el int4 con activaciones fp16 en GPU acierta 7 de 8 y falla el prompt largo; el int8 acierta 7 de 8 y supera el prompt largo. No se han publicado resultados de MMLU, HumanEval ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM/RAM: el bundle int4 ocupa 2,0 GB y el int8 3,1 GB; el repositorio completo son 33,8 GB.
- GPU de escritorio: Apple M4 Max validado con 131,8 tok/s de decodificación; se espera un comportamiento similar en GPUs de consumo con soporte LiteRT-LM, aunque no hay mediciones publicadas para RTX 4090, A100 o H100 en la información disponible.
- Móviles: Galaxy S26 y Pixel 8a validados con delegación completa de operaciones en GPU.
- Placas edge: Raspberry Pi 5 reportado por el autor (cifras no re-medidas tras la actualización de grafo).
- Cabe en GPU de consumo: sí, por tamaño (2-3 GB), aunque la disponibilidad del runtime LiteRT-LM condiciona qué hardware está soportado.
- Despliegue: runtime LiteRT-LM (`litert_lm_main`), librería Android `com.google.ai.edge.litert:litert`, WebGPU en navegador. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia: TTFT de 185 ms en M4 Max (int4) y 2,72 s en Galaxy S26; en CPU de móvil el TTFT sube a 6,29 s con int8.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| SmolLM3-3B (LiteRT-LM, este) | 3B | 4096 (KV cache) | `.litertlm` int4/int8 | Apache-2.0 | On-device, GPU/CPU movil y escritorio |
| SmolLM3-3B (HuggingFaceTB) | 3B | Contexto largo de entrenamiento | safetensors | Apache-2.0 | Checkpoint de referencia, requiere runtime propio |
| Alternativas de 3B comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de benchmarks de modelos alternativos que permitan una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- Contexto efectivo limitado a 4096 tokens por la caché KV del bundle, aunque el modelo base se entrenó en contexto largo.
- Calidad matemática moderada: 4 fallos de 30 en GSM8K con el fichero int4.
- El prompt largo falla con el fichero int4 usando activaciones fp16 por defecto en GPU; conviene usar fp32 o la variante int8 para entradas extensas.
- La cuantización int4 introduce degradación: 7 de 8 respuestas correctas frente a 8 de 8 del int8 en la batería de validación del autor.
- Riesgo de alucinación inherente a un modelo de 3B; no se documentan evaluaciones de sesgo en la información disponible.
- Idiomas soportados no detallados; el soporte multilingüe se hereda del modelo base sin garantías específicas.
- Licencia Apache-2.0 permite uso comercial, pero el formato `.litertlm` obliga a usar el runtime LiteRT-LM, lo que limita la portabilidad a otros stacks de inferencia.
- Las cifras de Raspberry Pi 5 y Pixel 8a corresponden a ficheros anteriores y no se re-midieron tras la actualización de grafo.
- El repositorio de 33,8 GB incluye múltiples artefactos; conviene descargar solo el fichero necesario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/SmolLM3-3B
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Demo web con WebGPU: https://google-ai-edge.github.io/LiteRT-LM/web_demos/chat/index.html?model=litert-community/SmolLM3-3B
- Registro de mediciones edge-compat (int4): https://github.com/john-rocky/edge-compat/blob/main/cards/smollm3-3b/CARD.md
- Registro de mediciones edge-compat (int8): https://github.com/john-rocky/edge-compat/blob/main/cards/smollm3-3b-int8/CARD.md
- Benchmark de runtimes en Apple Silicon: https://github.com/john-rocky/apple-silicon-llm-bench/blob/main/results/android/tinyhybridnet-three-runtimes.md
