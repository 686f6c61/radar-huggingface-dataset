# kindlingai/inkling-2-mini-exlr8-k2-k3-k4

## Resumen

Inkling-2-Mini · exlr8 (K2/K3/K4) es una cuantización del modelo `thinkingmachines/Inkling-2-Mini` publicada por kindlingai en el formato propietario exlr8 v2. El modelo base es un MoE con arquitectura de transformer con bucles (looped transformer): 24 capas físicas expandidas a 48 capas virtuales, 128 expertos enrutados por capa con enrutamiento top-8, tamaño oculto de 2304 y una longitud de contexto nativa de 1.048.576 tokens. La cuantización preserva todas las capas densas, atención, router y vocabulario en BF16, y comprime únicamente los expertos enrutados a tres anchos de trellis (K2, K3 y K4) seleccionables en tiempo de carga.

La relevancia de esta ficha es doble. Por un lado, demuestra que es posible servir un MoE de casi 2.000 millones de parámetros con contexto de un millón de tokens en hardware de consumo (una RTX 5090 de 32 GB) o en sistemas de memoria unificada como el DGX Spark, manteniendo una calidad cercana a 4 bits. Por otro, introduce un formato de cuantización —exlr8 v2 con codebook `pmcgx` y redondeo obligatorio a FP8 E4M3— que requiere un loader específico (el motor CUDA `gr8` de KindlingAI) y no es compatible con decodificadores EXL3 estándar.

El paquete incluye además un drafter especulativo DFlash de 279 MB que acelera la decodificación sin necesidad de flags adicionales, y recetas de despliegue publicadas para DGX Spark y RTX 5090. La licencia es Apache 2.0 y el modelo está pensado para cargas multimodales imagen-texto (pipeline `image-text-to-text`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Looped transformer MoE (`Inkling2LoopForConditionalGeneration`): 24 capas fisicas expandidas a 48 virtuales (prelude 0-5, loop_core 6-17 en 3 pasadas, coda 18-23) |
| Parametros totales | 1.927.460.352 |
| Parametros activos | no disponible (top-8 de 128 expertos enrutados por capa; el autor no publica el recuento exacto de parametros activos) |
| Longitud de contexto | 1.048.576 tokens nativos |
| Tipos de cuantizacion | exlr8 v2 con codebook `pmcgx`, anchos K2 (2,00 bpw), K3 (3,00 bpw), K4 (4,00 bpw) y variantes `bit225` (2,25), `bit250` (2,50), `bit300` (3,00) y `bit325` (3,25); redondeo obligatorio a FP8 E4M3 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato exlr8 v2, requiere loader exlr8-native) |

## Arquitectura y entrenamiento

El modelo base es un transformer con bucles: 24 capas físicas que se ejecutan como 48 capas virtuales mediante la repetición del bloque `loop_core` (capas 6-17) en tres pasadas, con un `prelude` inicial (capas 0-5) y una `coda` final (capas 18-23). Cada capa contiene 128 expertos enrutados con enrutamiento top-8, tamaño oculto de 2304 y tamaño intermedio de experto de 1152. La atención usa 24 cabezas de consulta y 8 de clave-valor con `head_dim=128`, ventana deslizante de 1024 tokens en las capas locales y atención completa en las capas globales 5, 11, 17 y 23.

Esta release no entrena el modelo: cuantiza los expertos enrutados de las 24 capas físicas a tres anchos de trellis simultáneos y mantiene el resto de pesos en BF16. La innovación técnica principal es el formato exlr8 v2, que exige que todo valor producido por el codebook se redondee a FP8 E4M3 (redondeo al par más cercano, saturante) antes de aplicar los vectores laterales; el codificador buscó únicamente sobre valores redondeados a E4M3, por lo que omitir ese paso degrada mediblemente los pesos leídos. El paquete incorpora además un drafter especulativo DFlash de 279 MB y escalas de trellis `k2` refinadas por KL de logits de extremo a extremo sin coste adicional de bytes.

## Capacidades

- Generación de texto y razonamiento multimodal imagen-texto (pipeline `image-text-to-text`).
- Razonamiento multi-paso con modo "thinking" (el autor reporta métricas con Thinking-ON y Thinking-OFF).
- Generación de código: el autor publica throughput específico para cargas de código (`133,5` tok/s en DGX Spark y `354,4` tok/s en RTX 5090 con la variante `bit225`).
- Razonamiento matemático y científico evaluado en tareas de coding, math y GPQA.
- Decodificación especulativa integrada mediante el drafter DFlash incluido (paridad greedy exacta 8/8 frente a `--mtp 0`).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Asistencia de código en local: el modelo puede servir como autocompletado y generación de funciones en un equipo con RTX 5090, con la variante `bit225` alcanzando 354,4 tok/s en cargas de código y un pool KV de 262K tokens a 4 streams.
- Análisis de documentos largos: con 1.048.576 tokens de contexto nativo, puede procesar repositorios completos, expedientes o libros técnicos en una sola pasada, aunque el pool KV efectivo depende del hardware (1,18M tokens a 8 streams en DGX Spark; 303K a un solo stream en RTX 5090).
- Procesamiento de imágenes con texto asociado: al ser un modelo `image-text-to-text`, sirve para descripción de capturas, extracción de datos de formularios escaneados y respuesta a preguntas sobre diagramas.
- Despliegue en estaciones de trabajo con memoria unificada: el DGX Spark y el ASUS GX10 pueden ejecutar la variante por defecto `bit325` (16,43 GB de imagen de dispositivo) manteniendo 8 conversaciones concurrentes.
- Prototipado de agentes con razonamiento extendido: el modo thinking y la ventana de contexto permiten cadenas de razonamiento largas en tareas de matemáticas y ciencia, con la variante `k4` recomendada para GPQA.
- Evaluación comparativa de cuantizaciones: las tres anchos K2/K3/K4 en un mismo repositorio permiten al investigador medir el compromiso calidad/velocidad sin cambiar de checkpoint, seleccionando el ancho en tiempo de carga con `--variant`.
- Servicio de inferencia de bajo coste en una sola GPU: la variante `k2` (12,60 GB) deja margen en una RTX 5090 para otros procesos y sigue ofreciendo contexto largo.

## Benchmarks y rendimiento

| Metrica | Resultado | Contexto |
|---|---|---|
| Tareas evaluadas (suite del autor) | 1.362 tareas | Coding, math y ciencia |
| `k4` vs W4A4 oficial | 93,54 % de coincidencia, McNemar exacto p=0,6655 | Empate estadístico |
| `k4` vs NVFP4 oficial | -27,4 % de KL | Menor divergencia |
| `bit225` KL medio | 0,041282 | -21,3 % frente a `k2` |
| `bit250` KL medio | 0,030018 | — |
| `k2` KL extremo a extremo | -11,65 % frente a `k2` estándar | Refinado por KL de logits |
| Throughput `bit225` en DGX Spark | 133,5 tok/s (Code), 228,2 tok/s (C=6) | 1× DGX Spark |
| Throughput `bit225` en RTX 5090 | 354,4 tok/s (Code), 768,3 tok/s (C=4), 528,1 tok/s (C=6, Thinking-ON) | 1× RTX 5090 |
| Paridad DFlash | 8/8 greedy exacta | Frente a `--mtp 0` en Spark y 5090 |

No se han publicado resultados de benchmarks en la información disponible para MMLU, HumanEval o GSM8K de forma desagregada.

## Requisitos de hardware

- VRAM estimada: 12,60 GB (`k2`), 13,37 GB (`bit225`), 14,13 GB (`bit250`), 16,43 GB (`bit325`, por defecto) y 18,72 GB (`k4`), incluyendo densos BF16 y drafter DFlash.
- GPU recomendadas: NVIDIA DGX Spark (memoria unificada), ASUS GX10, NVIDIA RTX 5090 (32 GB, Blackwell) y cualquier tarjeta Blackwell con al menos 20 GB libres.
- Cabe en GPU de consumo: sí, en RTX 5090 de 32 GB; no hay datos para GPUs de 24 GB o menos.
- Opciones de despliegue: motor CUDA `gr8` de KindlingAI (exlr8-native, `g6m4_ink2`, `TP=1`), commit `6b874803` o posterior / PR #615. No es compatible con vLLM, llama.cpp, Ollama ni TGI según la información disponible.
- Pool KV: 1,18M tokens a 8 streams en DGX Spark; 262K tokens a 4 streams y 303K a un solo stream en RTX 5090 (variante `bit325`).
- Latencia y throughput: ver tabla de benchmarks; los valores más altos corresponden a la variante `bit225`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini exlr8 (esta ficha) | 1.927.460.352 | 1.048.576 | Apache 2.0 | safetensors exlr8 v2 | Cuantizacion K2/K3/K4, drafter DFlash incluido |
| thinkingmachines/Inkling-2-Mini (base) | no disponible | 1.048.576 | no disponible | no disponible | Modelo original sin cuantizar |
| kindlingai/glm-5.3-exlr8-k2-k3-k4 | no disponible | no disponible | no disponible | safetensors exlr8 v2 | Mismo formato y loader |
| kindlingai/Qwen3.8-Flash-Next-exlr8 | no disponible | no disponible | no disponible | safetensors exlr8 v2 | Mismo formato y loader |

No se dispone de datos de benchmarks comparativos con modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Los pesos no son utilizables sin redondeo a FP8 E4M3: un decodificador EXL3 estándar o cualquier loader que omita el redondeo lee pesos mediblemente peores de los mismos bytes.
- Dependencia de un motor propietario: requiere el motor CUDA `gr8` de KindlingAI; no hay soporte documentado en vLLM, llama.cpp, Ollama o TGI.
- Idiomas soportados no documentados: no se puede garantizar calidad multilingüe sin evaluación previa.
- Riesgo de alucinación: no se han publicado tasas de alucinación ni evaluaciones de veracidad en la información disponible.
- Sesgos conocidos: no documentados por el autor.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la licencia del modelo base (`thinkingmachines/Inkling-2-Mini`) no se detalla en la información proporcionada y conviene verificarla antes de producción.
- El contexto nativo de 1.048.576 tokens no es alcanzable en todas las configuraciones: en RTX 5090 el pool KV efectivo baja a 262K (4 streams) o 303K (un stream).
- La calidad depende del ancho elegido: `bit225` y `k2` reducen huella a costa de mayor KL; `k4` es la opción recomendada para ciencia de posgrado (GPQA).
- El rendimiento reportado procede de evaluaciones del propio autor (1.362 tareas), sin replicación independiente disponible.

## Enlaces

- Hugging Face: https://huggingface.co/kindlingai/inkling-2-mini-exlr8-k2-k3-k4
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Especificación del formato exlr8: https://github.com/kindlingai/exlr8/blob/main/FORMAT.md
- Motor gr8: https://github.com/kindlingai/gr8
- Receta DGX Spark: https://github.com/kindlingai/recipes/tree/main/inkling-2-mini/dgx-spark/1x/exlr8-gr8
- Receta RTX 5090: https://github.com/kindlingai/recipes/tree/main/inkling-2-mini/rtx-5090/1x/exlr8-gr8
- Repo standalone DGX Spark: https://github.com/kindlingai/inkling-2-mini-exlr8-1x-spark
- Repo standalone RTX 5090: https://github.com/kindlingai/inkling-2-mini-exlr8-rtx5090
- Cuantización hermana GLM-5.3: https://huggingface.co/kindlingai/glm-5.3-exlr8-k2-k3-k4
- Cuantización hermana Qwen3.8-Flash-Next: https://huggingface.co/kindlingai/Qwen3.8-Flash-Next-exlr8
