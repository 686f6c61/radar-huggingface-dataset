# Jakevin/Qwen3.8-Flash-Next-ternary-mlx-K50

## Resumen

Qwen3.8-Flash-Next-ternary-mlx-K50 es una variante podada y cuantizada del modelo Jakevin/Qwen3.8-Flash-Next-ternary-mlx, publicada por el usuario Jakevin. Se trata de una build orientada a Apple Silicon que reduce el peso del modelo original eliminando el 50 % de los expertos enrutados en las capas 1 a 47 y manteniendo la cuantización ternaria en los pesos restantes. El resultado es un checkpoint de 54 GB en disco (frente a los 38 GB del ternario sin podar y los 71 GB de una versión previa con tabla PLE en FP8) que puede ejecutarse con un consumo de memoria de aproximadamente 15 GB sin caché de expertos y unos 22,5 GB con caché residente.

El modelo parte de una arquitectura MoE con 48 capas, 512 expertos enrutados por capa (en el checkpoint base) y cabezas de n-gramas hasheados PLE (16 cabezas, 128 shards de filas de 160 dimensiones). La poda se realizó con una puntuación REAP (activación de experto ponderada por router) calculada sobre 32 secuencias de calibración que suman 9.479 tokens, eliminando 12.032 expertos en total. La única tabla recuantizada es la PLE, que pasa de FP8 a cuantización afín MLX de 2 a 6 bits por shard (media de 4,05 bits, group_size 32).

La relevancia de esta ficha es doble: por un lado, documenta una técnica de compresión agresiva (poda de expertos más cuantización ternaria) aplicada a un MoE de gran tamaño para hacerlo viable en hardware de consumo Apple; por otro, advierte de que las métricas de fidelidad publicadas (91,9 % de concordancia top-1) proceden de solo 8 secuencias in-sample y contra una referencia distinta del modelo original, por lo que deben interpretarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer con atención lineal, hyper-connections y cabezas PLE de n-gramas hasheados |
| Parametros totales | no disponible (el autor no publica el recuento total; se deduce de la estructura: 48 capas, 512 expertos enrutados en L00 y 256 en L01–L47 tras poda) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Ternaria en expertos y pesos empaquetados; afín MLX de 8 bits en embeddings, lm_head y routers; PLE en afín mixta de 2–6 bits (group_size 32, media ~4,05 bits); bf16 en normas, hyper-connections, proyecciones de atención lineal y PLE |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como `license: other` en Hugging Face) |
| Formato de pesos | safetensors (MLX), con ficheros por capa `L00`–`L47`, `skeleton.safetensors`, `nonexpert.safetensors` y directorio `ple/` |

## Arquitectura y entrenamiento

El checkpoint deriva de un MoE de 48 capas con 512 expertos enrutados por capa en el modelo base. La poda conserva los 512 expertos de la capa 0 y reduce a 256 los de las capas 1 a 47, seleccionados mediante una puntuación REAP (router-weighted expert activation) calculada sobre 32 secuencias de calibración (9.479 tokens). Los empates se resolvieron por tráfico de experto medido en una build Q2 anterior y, en último término, podando primero el id de experto más bajo. Los identificadores de los expertos conservados están en `K50_kept.json` y se renumeran de 0 a 255 en orden ascendente de id original. El router de las capas podadas se recorta a las filas correspondientes y se cuantiza a afín de 8 bits en carga; el de la capa 0 queda intacto.

Los expertos conservados se almacenan byte a byte igual que en el checkpoint base ternario; la única recuantización es la tabla PLE, convertida de FP8 a cuantización afín MLX con group_size 32 y anchos de bit por shard entre 2 y 6 (media ~4,05 bits). No se documenta en la información disponible el proceso de entrenamiento original (número de tokens, composición del dataset, RLHF/DPO) ni innovaciones como decodificación especulativa; el autor solo describe el proceso de poda y cuantización. La arquitectura base incorpora atención lineal, hyper-connections y cabezas PLE de n-gramas, según los nombres de ficheros y las descripciones del repositorio.

## Capacidades

- Generación de texto conversacional y continuaciones de prosa, según el pipeline declarado `text-generation`.
- Generación de código, a juzgar por las pruebas de velocidad del autor que distinguen entre decodificación en modo "coding" y "prose".
- Razonamiento de múltiples pasos y uso de herramientas: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el autor no publica lista de idiomas.
- Modo thinking, visión o audio: no disponible.
- Soporte de function calling / tool calling: no disponible.
- Ejecución local en Apple Silicon mediante MLX con cargador Python dedicado (`runtime_standalone.py`, requiere `mlx-ternary`).

## Casos de uso

- Investigación sobre compresión de MoE en Apple Silicon: el checkpoint permite estudiar el impacto de la poda REAP al 50 % y de la cuantización ternaria sobre la fidelidad de salida, comparando la concordancia top-1 del 91,9 % con la del modelo ternario sin podar.
- Despliegue en Mac con RAM limitada: con unos 15 GB de pico sin caché de expertos y 22,5 GB con caché residente, cabe en equipos de 32 GB o 64 GB y permite ejecutar un MoE de 48 capas en local sin GPU dedicada.
- Generación de texto asistida por ordenador en flujos de trabajo de oficina: el modelo puede producir borradores y continuaciones de prosa en local, con una velocidad medida de 3,8–4,0 tok/s en caliente en un Mac mini M4 Pro de 64 GB.
- Prototipado de asistentes de código en local: la variante se ha medido en modo "coding" (5,28 tok/s con el runner C++ de la build mixta equivalente), lo que permite probar autocompletado y explicación de fragmentos sin enviar código a la nube.
- Evaluación comparativa de builds cuantizadas: sirve como referencia de baja memoria para contrastar con la build min3bit-oMLX (34,8 GB de pico MLX, ~8,0 tok/s) en experimentos de calidad frente a velocidad.
- Docencia y demostraciones de cuantización ternaria: al necesitar un cargador Python específico y `mlx-ternary`, es útil para ilustrar el flujo completo de conversión, poda y ejecución de un MoE cuantizado en MLX.

## Benchmarks y rendimiento

| Metrica | Valor | Referencia y condiciones |
|---|---|---|
| Concordancia top-1 | 91,9 % | 8 secuencias in-sample; referencia: modelo ternario sin podar |
| Velocidad de decodificación (caliente) | 3,8–4,0 tok/s | Mac mini M4 Pro 64 GB, caché de expertos residente |
| Velocidad de decodificación (sin caché) | ~7,4 s/token | Mac mini M4 Pro 64 GB, caché desactivada |
| Pico de memoria (sin caché) | ~15 GB | Mac mini M4 Pro 64 GB |
| Pico de memoria (con caché residente) | ~22,5 GB | Mac mini M4 Pro 64 GB |
| Tamano en disco | 54 GB | `du -sh`: 21 GB capas + 30 GB PLE + 2,6 GB esqueleto y no-expertos |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las cifras de concordancia no son comparables con las de la build min3bit-oMLX (0,840 sobre 32 prompts), ya que usan referencias y conjuntos de evaluación distintos.

## Requisitos de hardware

- VRAM/RAM estimada: ~15 GB de pico sin caché de expertos; ~22,5 GB con caché residente. El repositorio ocupa 54 GB en disco.
- GPU recomendadas: Apple Silicon (el autor midió en Mac mini M4 Pro de 64 GB). No se documenta soporte para A100, H100 ni RTX 4090; el formato MLX y el cargador Python específico lo orientan a Apple Silicon.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon con al menos 32 GB de memoria unificada; con 16 GB no hay margen para el pico de 22,5 GB con caché.
- Opciones de despliegue: cargador Python dedicado `runtime_standalone.py` con la librería `mlx-ternary`; la build mixta equivalente requiere el runner C++ de Jakevin/moe-offload; la build min3bit-oMLX funciona directamente en oMLX.
- Latencia y throughput: 3,8–4,0 tok/s en caliente con caché residente y ~7,4 s/token sin caché, medidos en Mac mini M4 Pro 64 GB.

## Comparativa con modelos similares

| Modelo | Poda / cuantizacion | Tamano en disco | Pico de memoria | Velocidad | Concordancia top-1 | Ejecucion |
|---|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-ternary-mlx-K50 (este) | Ternaria, 256/512 expertos en L01–L47 | 54 GB | ~15 GB sin caché / ~22,5 GB con caché | 3,8–4,0 tok/s | 91,9 % (8 secuencias in-sample) | Cargador Python + mlx-ternary |
| Qwen3.8-Flash-Next-mixed-mlx-K50-min3bit-oMLX | 256/512 expertos, 32 capas a 3 bits y 16 a 4 bits (RTN desde FP8) | 65,7 GB | ~34,8 GB | ~8,0 tok/s (mediana) | 0,840 (32 prompts) | oMLX out of the box |
| Qwen3.8-Flash-Next-mixed-mlx-K50 | Ternaria K50 convertida a afín 2 bits; L00 con 512, L01–L47 con 256 | 60,0 GB | ~23,3 GB RSS (presupuesto de 15,6 GB de expertos) | 5,28 / 5,85 tok/s (coding / prosa) | no medida | Runner C++ de moe-offload |
| Qwen3.8-Flash-Next-ternary-mlx (base) | Ternaria sin podar | 38 GB | no disponible | no disponible | referencia | Cargador Python + mlx-ternary |

Las cifras de concordancia no son directamente comparables entre filas porque usan referencias y conjuntos de evaluación distintos, tal como advierte el propio autor.

## Limitaciones y advertencias

- La concordancia top-1 del 91,9 % se midió sobre solo 8 secuencias in-sample y contra el modelo ternario sin podar, no contra el checkpoint FP8 original; es una métrica débil para estimar calidad en producción.
- La poda elimina el 50 % de los expertos enrutados en 47 de las 48 capas (12.032 expertos), lo que puede degradar capacidades específicas no representadas en las 32 secuencias de calibración (9.479 tokens).
- Requiere un cargador Python dedicado (`runtime_standalone.py`) y la librería `mlx-ternary`; no funciona directamente en oMLX ni en llama.cpp, vLLM, TGI u Ollama.
- Sin caché de expertos la latencia se dispara a ~7,4 s/token, lo que hace inviable el uso interactivo en ese modo.
- La licencia qwen-community-1.0 (etiquetada `license: other`) impone condiciones específicas para uso comercial que deben revisarse en el fichero LICENSE antes de desplegar.
- No se publican idiomas soportados, longitud de contexto ni datos de sesgo o alucinación; no hay garantías documentadas sobre estos aspectos.
- El repositorio ocupa 54 GB en disco, lo que exige planificación de almacenamiento incluso antes de cargar el modelo en memoria.
- El modelo base pertenece a la familia Qwen3.8-Flash-Next, pero esta build es una modificación no oficial de un tercero (Jakevin); no está respaldada por el equipo de Qwen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jakevin/Qwen3.8-Flash-Next-ternary-mlx-K50
- Modelo base ternario: https://huggingface.co/Jakevin/Qwen3.8-Flash-Next-ternary-mlx
- Build mixta recomendada (min3bit-oMLX): https://huggingface.co/Jakevin/Qwen3.8-Flash-Next-mixed-mlx-K50-min3bit-oMLX
- Build mixta K50: https://huggingface.co/Jakevin/Qwen3.8-Flash-Next-mixed-mlx-K50
- Runner C++ (moe-offload): https://github.com/Jakevin/moe-offload/tree/main/mlx-qwen38/cpp
- Paper, blog o demo oficial: no disponible en la información proporcionada.
