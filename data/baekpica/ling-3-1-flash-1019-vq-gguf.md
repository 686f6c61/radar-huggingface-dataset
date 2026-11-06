# Baekpica/Ling-3.1-flash-1019-VQ-GGUF

## Resumen

Ling-3.1-flash-1019-VQ-GGUF es una conversión experimental en formato GGUF del modelo inclusionAI/Ling-3.1-flash-1019, publicada por el usuario Baekpica en Hugging Face. No se trata de un modelo nuevo, sino de una investigación de cuantización extrema: los expertos enrutados (que concentran la mayor parte de los pesos de este modelo mixture-of-experts) se almacenan a aproximadamente 1,5 bits por peso mediante cuantización vectorial (VQ) de 12 bits, muy por debajo de los 4 bits habituales en los GGUF estándar. El modelo base es un modelo conversacional de generación de texto con arquitectura híbrida bailing, que combina MoE con MTP (multi-token prediction) para decodificación especulativa.

Su relevancia reside en demostrar hasta dónde puede exprimirse la memoria de un modelo de 15.700 millones de parámetros totales: la conversión completa ocupa unos 115 GB distribuidos en 72 ficheros GGUF, y se ha verificado y medido sobre un DGX Spark (GB10), sirviendo contextos de hasta 1 millón de tokens con YaRN. El propio autor advierte que es una línea de investigación exploratoria, no un reemplazo directo del modelo original: pueden aparecer razonamientos en bucle, texto roto a mitad de carácter o respuestas más débiles. Además, requiere un runtime propio (ds4-dfm-rs), ya que llama.cpp y Ollama estándar no implementan esta representación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido bailing, mixture-of-experts (MoE) con MTP (multi-token prediction) |
| Parametros totales | 15.694.332.224 (≈15,7 B) |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 1.048.576 tokens (1M) con YaRN, verificado en DGX Spark |
| Tipos de cuantizacion | VQ 12 bits en expertos (≈1,5 bits/peso efectivo), Q4_K en proyecciones de atencion y FFNs densas/compartidas, precision mixta original en routers, normalizacion, MLA kv_b y embeddings BF16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (familia personalizada `ling31_vq`, incompatible con llama.cpp/Ollama estandar) |

## Arquitectura y entrenamiento

El modelo base, Ling-3.1-flash-1019 de inclusionAI, emplea la arquitectura híbrida bailing: un transformer mixture-of-experts con 68 capas troncales de expertos enrutados (capas 4–71) más una capa de expertos enrutados para MTP (capa 72). Incluye atención MLA (multi-head latent attention), FFNs densas y compartidas, y mecanismos de control de recurrencia. Los tensores MTP (multi-token prediction) permiten decodificación especulativa con borradores: en esta conversión se emiten 2,39 tokens por llamada especulativa con dos borradores.

Sobre el entrenamiento del modelo base no se ofrecen datos en la información disponible (tokens, composición del dataset, RLHF/DPO). En cuanto a la conversión, la innovación principal es la cuantización vectorial activación-calibrada: los expertos se representan mediante índices vectoriales de 12 bits (VQ de 8 dimensiones, K4096, un codebook E4M3FN compartido por capa, ganancias de fila en F16), donde cada índice representa ocho pesos. Los codebooks, asignaciones y ganancias se ajustan a las estadísticas de activación del checkpoint original. Las proyecciones grandes de atención usan Q4_K con importancia de columnas derivada de la calibración. La receta empleada es `ling31-1019-ivq8-all12-q4k-embssd-v1`, con embeddings de entrada en BF16 leídos por fila de token desde SSD.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation), heredada del modelo base Ling-3.1-flash-1019
- Decodificacion especulativa mediante MTP con dos borradores, con aceptacion medida de 2,39 tokens por llamada
- Contexto extendido hasta 1M de tokens mediante YaRN (verificado con prompts de 130K tokens)
- Prefill por bloques de 4.096 tokens, preservado incluso para contextos grandes
- Soporte de tool calling: no disponible en la informacion proporcionada
- Capacidades multilingues: no disponible; el propio autor reporta cambios de idioma a mitad de palabra como artefacto de la cuantizacion extrema
- Vision, audio u otras modalidades: no disponible

## Casos de uso

- Investigacion en cuantizacion extrema: es el caso de uso principal y explicito del autor; permite estudiar los fallos de representaciones de ~1,5 bits por peso en expertos MoE y comparar con cuants de 4 bits convencionales
- Servir modelos MoE grandes en memoria limitada: en un DGX Spark (GB10, 128 GB de memoria unificada) cabe la conversion completa con 5,78 GiB minimos disponibles, lo que ilustra como la VQ reduce la huella de memoria frente al checkpoint original
- Experimentacion con contexto ultra-largo: con YaRN a 1M de tokens y prompts verificados de 130K, es util para probar pipelines de recuperacion y analisis de documentos extensos en hardware de un solo nodo
- Benchmarking de decodificacion especulativa MTP: incluye tensores MTP calibrados y servidos, con mediciones de 18,65 tok/s sin MTP frente a 26,48 tok/s con dos borradores, util para validar implementaciones de speculative decoding
- Validacion de artefactos y loaders: el release incluye verificacion de hashes SHA-256, pruebas de frontera de vocabulario completo y validacion de loader, util como referencia para procesos de QA en despliegues GGUF personalizados
- Desarrollo sobre runtimes custom: el formato `ling31_vq` requiere ds4-dfm-rs, por lo que sirve como caso real para desarrollar y probar loaders de GGUF no estandar

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Si se han publicado mediciones de rendimiento de inferencia sobre DGX Spark (GB10) con ds4-dfm-rs `e01b409d`:

| Workload | Prefill tok/s | Decode tok/s |
|---|---:|---:|
| Barrido 2K–64K, MTP desactivado (mediana de tres medias) | 885,3 | 18,65 |
| Barrido 2K–32K, MTP desactivado | 982,4 | 18,81 |
| Barrido 2K–32K, dos borradores MTP | 977,8 | 26,48 |
| Barrido 2K–64K, dos borradores MTP | 882,2 | 25,79 |
| Prompt completo de 8K, MTP desactivado (`76bc05cb`) | 1.170–1.188 | 18,6–19,1 |
| Prompt de 130K tokens con `-c 1048576` (YaRN, MTP desactivado, `2caadb14`) | 705 | — |

El protocolo usa tres procesos frescos por modo, prefill incremental de 2.048 tokens y 128 tokens greedy forzados no-EOS por frontera. Los relojes SM se mantienen en 2.184–2.190 MHz con PSI en cero.

## Requisitos de hardware

- VRAM/memoria: la conversion completa ocupa 115,3 GB en 72 ficheros GGUF; el release verificado deja un minimo de 5,78 GiB disponibles en un DGX Spark (128 GB de memoria unificada GB10), lo que sugiere un consumo cercano a los 120 GB
- GPU recomendada: DGX Spark (GB10); el release esta publicado, verificado y medido explicitamente sobre este hardware
- Consumer GPUs: no cabe en GPUs de consumo tipicas (una RTX 4090 con 24 GB o una RTX 5090 con 32 GB no disponen de memoria suficiente); el embedding BF16 se lee por fila desde SSD, lo que reduce algo la huella pero no la hace viable en consumidor
- Despliegue: exclusivamente mediante ds4-dfm-rs (PR #123 o posterior, runtime `e01b409d` en PR #124); llama.cpp y Ollama estandar NO implementan la representacion `ling31_vq`; vLLM y TGI no soportan este formato
- Latencia y throughput medidos: prefill de 885–982 tok/s en barridos 2K–64K y decode de 18,65 tok/s sin MTP, subiendo a 25,8–26,5 tok/s con dos borradores MTP

## Comparativa con modelos similares

| Modelo | Parametros totales | Cuantizacion | Contexto | Licencia | Runtime |
|---|---|---|---|---|---|
| Baekpica/Ling-3.1-flash-1019-VQ-GGUF | 15,7 B | VQ 12 bits en expertos (≈1,5 bits/peso) + Q4_K | 1M (YaRN) | MIT | ds4-dfm-rs (custom) |
| inclusionAI/Ling-3.1-flash-1019 (original) | 15,7 B | BF16/FP8 (checkpoint original) | no disponible | no disponible (modelo base) | nativo inclusionAI |
| Conversiones GGUF estandar de modelos MoE de tamano similar (p. ej. Q4_K) | ~15–16 B | 4–5 bits/peso | variable | variable | llama.cpp, Ollama |

La diferencia clave frente a conversiones GGUF convencionales de 4 bits es la densidad extrema en los expertos (~1,5 bits/peso frente a ~4,5 bits/peso), a costa de calidad de salida y de requerir un runtime propietario. Datos comparativos de rendimiento del modelo base original: no disponible.

## Limitaciones y advertencias

- Calidad degradada por diseno: los expertos a ~1,5 bits por peso pueden producir razonamientos en bucle o sin respuesta, texto roto a mitad de caracter (caracteres `�`) y cambios de idioma a mitad de palabra
- El autor lo califica explicitamente como investigacion exploratoria de cuantizacion, no como reemplazo directo del modelo original
- Los ficheros pueden cambiar: cualquier revision puede ser sustituida; se recomienda fijar un commit concreto para builds reproducibles
- Incompatibilidad con el ecosistema estandar: llama.cpp y Ollama no cargan este formato; se necesita ds4-dfm-rs #123 o posterior
- La aceptacion MTP medida (2,39 tokens/llamada) proviene de un corpus que puede repetirse cerca de las colas de continuacion, por lo que no establece throughput general asistente
- Un proceso Decode ordinario mostro medias mas lentas sin explicacion; los datos no establecen una ganancia uniforme del decode ordinario
- Sesgos, riesgo de alucinacion y capacidades multilingues del modelo base: no disponible en la informacion proporcionada
- Restricciones de licencia: la licencia MIT de la conversion permite uso comercial, pero conviene verificar la licencia del modelo base inclusionAI/Ling-3.1-flash-1019 por separado (no disponible en esta ficha)

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Baekpica/Ling-3.1-flash-1019-VQ-GGUF
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.1-flash-1019
- Runtime ds4-dfm-rs: https://github.com/Baekpica/ds4-dfm-rs
- PR #123 (servido del release): https://github.com/Baekpica/ds4-dfm-rs/pull/123
- PR #124 (mediciones 2K–64K): https://github.com/Baekpica/ds4-dfm-rs/pull/124
- Protocolo y muestras crudas del benchmark: https://github.com/Baekpica/ds4-dfm-rs/blob/100ce022380e5a2019eb9d3470b1189fcc90e278/docs/benchmarks/ling31-1019-followup-spark-64k-2026-10-28/README.md
- Informe de optimizacion de seguimiento: https://github.com/Baekpica/ds4-dfm-rs/blob/100ce022380e5a2019eb9d3470b1189fcc90e278/docs/ling31-optimization-2026-10-28-followup.md
- Receta de cuantizacion: https://huggingface.co/Baekpica/Ling-3.1-flash-1019-VQ-GGUF/blob/main/recipe.json
- Tabla de comunidad (reporte de problemas): https://huggingface.co/Baekpica/Ling-3.1-flash-1019-VQ-GGUF/discussions
