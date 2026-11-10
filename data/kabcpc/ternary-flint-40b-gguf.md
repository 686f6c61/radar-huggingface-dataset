# kabcpc/Ternary-Flint-40B-GGUF

## Resumen

Ternary Flint 40B es una cuantización extrema de tipo ternario (1.58 bits) del modelo base `RecursiveSI/flint`, publicada por el usuario `kabcpc` en Hugging Face. Se trata de un modelo Mixture-of-Experts (MoE) de aproximadamente 39.800 millones de parámetros totales con unos 2.500 millones de parámetros activos por token, distribuidos en 49 capas y 256 expertos enrutados más un experto compartido. La innovación principal es la aplicación de pesos ternarios ({-1, 0, +1}) junto con técnicas de calibración por capas, lo que permite reducir el modelo a ficheros GGUF de entre 9 y 12,5 GiB.

El modelo está específicamente optimizado para Apple Silicon (serie M) con aceleración Metal, gracias a kernels que aprovechan la Constant Memory LUT del hardware para decodificar los codebooks ternarios. Según la model card, esto permite ejecutar un modelo de casi 40.000 millones de parámetros en un Mac Mini de 16 GB de memoria unificada con contextos de hasta 262.144 tokens y velocidades de generación de 65-75 tokens por segundo, algo inviable con cuantizaciones convencionales como IQ2_XXS en ese hardware.

La relevancia actual radica en la combinación de tres factores: cuantización ternaria calibrada con perplejidad relativamente baja (10,13-10,95 en el dataset de referencia), soporte real de GPU completa en hardware de consumo Apple, y licencia Apache 2.0 que permite uso comercial. El modelo está pensado como backend local para herramientas de código y agentes (Cursor, Continue, DeepSeek Harness) sobre equipos de 16 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), 49 capas, 256 expertos enrutados + 1 compartido |
| Parametros totales | 39.785.287.456 (~39,8B) |
| Parametros activos | ~2,5B por token |
| Longitud de contexto | Hasta 262.144 tokens (con KV cache `q4_0`) |
| Tipos de cuantizacion | Ternario 1.58-bit (`PTQ1_0`, `PQ2_0`), híbridos (`PTQ1_0`+`Q4_1`, `PQ2_0`+`Q4_1`), codebook híbrido |
| Idiomas soportados | Ingles, chino, ruso |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (varias variantes: 9,31 GiB, 10,97 GiB, 11,04 GiB, 12,49 GiB) |

## Arquitectura y entrenamiento

El modelo base `RecursiveSI/flint` es un transformer MoE con 49 capas, 256 expertos enrutados y un experto compartido, con unos 2,5B parámetros activos por token sobre un total de ~39,8B. La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO; esa información no está disponible en la documentación proporcionada.

La contribución técnica de esta publicación es la cuantización post-entrenamiento (PTQ) a pesos ternarios. Se aplica una calibración por capas (layer-wise calibration) para minimizar el error de reconstrucción, con un esquema de codebook en base 3 que asigna valores ternarios exactos a 124 de los tensores de expertos, mientras que los 17 tensores `down_exps` más sensibles se mantienen en `Q4_1` para preservar calidad. La decodificación en Metal se apoya en una LUT de memoria constante (`constant ushort ptq1_0_lut[256]`) que permite ejecutar los kernels ternarios en la GPU de Apple sin caer a CPU. La model card menciona también "Hadamard folding" como parte del pipeline de cuantización.

## Capacidades

- Generación de texto conversacional y de propósito general, con soporte de plantilla de chat (`<|user|>...<|assistant|>`).
- Razonamiento multi-paso, con parámetros específicos de `--reasoning-budget` y `--reasoning-preserve` en `llama-server`.
- Generación de código (el ejemplo de la model card es una función Python para resolver 3Sum).
- Soporte de tool calling / function calling vía plantilla Jinja (`--jinja`) en llama.cpp.
- Uso como backend para agentes y harnesses de código (mencionados: DeepSeek Harness, Cursor, Continue).
- Capacidades multilingües limitadas a inglés, chino y ruso.
- Contexto largo de hasta 262.144 tokens en hardware de 16 GB, adecuado para ingestión de repositorios y conversaciones largas.
- No se menciona soporte de visión, audio ni otras modalidades.

## Casos de uso

- Asistente de código local en Mac: el modelo puede servir como backend de Cursor o Continue en un Mac Mini de 16 GB, generando código con contexto de hasta 262k tokens para incluir varios ficheros del repositorio en la ventana. La velocidad de 65-75 t/s lo hace interactivo.
- Agente autónomo de refactorización: con `--jinja`, tool calling y contexto largo, se puede integrar en un harness que lea ficheros, ejecute tests y proponga parches en múltiples pasos, aprovechando el modo de razonamiento con presupuesto configurable.
- Servidor OpenAI-compatible local: `llama-server` expone un endpoint compatible con la API de OpenAI (`--alias flint-40b:latest`), lo que permite sustituir llamadas a la nube por inferencia local en pipelines existentes sin cambiar el código cliente.
- Documentación técnica y Q&A sobre bases de código: la ventana de 262k tokens permite cargar manuales, ADRs y ficheros fuente completos para responder preguntas con contexto.
- Prototipado y experimentación con modelos ternarios: los cinco checkpoints publicados (puro ternario, híbridos, codebook) permiten comparar el impacto de distintos esquemas de cuantización sobre la perplejidad y la velocidad en el mismo hardware.
- Despliegue en entornos con restricciones de memoria: el checkpoint de 9,31 GiB permite ejecutar un modelo de ~40B en equipos de 16 GB, útil en portátiles o estaciones de trabajo sin GPU dedicada.
- Inferencia en local para privacidad: al ejecutarse íntegramente en Apple Silicon sin llamadas externas, es adecuado para procesar código o datos sensibles que no pueden salir del equipo.

## Benchmarks y rendimiento

La model card solo reporta perplejidad y velocidades de generación medidas en un chip Apple M6 con Metal. No se publican resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar.

| Checkpoint | Tamano | bpw | Perplejidad (nlp) | Perplejidad (wiki) | Velocidad (t/s, M6 Metal) |
|---|---|---|---|---|---|
| Hybrid-Codebook-Calibrated-11GB | 11,04 GiB | 2,140 | 10,13 | 1,02 | 68,2-74,0 |
| Hybrid-PTQ1_0-Calibrated-11GB | 11,04 GiB | 2,140 | 10,13 | no disponible | 64,4-71,5 |
| PTQ1_0-Calibrated-9GB | 9,31 GiB | 1,750 | 10,95 | no disponible | 71,8 (pp128 = 648,6 t/s) |
| PQ2_0-Calibrated-11GB | 10,97 GiB | 2,125 | 10,78 | no disponible | 76,7 (pp128 = 1006,2 t/s) |
| Hybrid-Calibrated | 12,49 GiB | 2,450 | 10,13 | no disponible | 74,0 (pp128 = 974,9 t/s) |

La model card incluye una comparación con `unsloth/flint-UD-IQ1_M` (objetivo CUDA) en la que se reporta PPL 1,6754 frente a 1,0183 en `wiki_sample` para el build de Apple, además de 17,6 t/s frente a 68,2-74,0 t/s en generación y 1,2 t/s frente a 650-1000+ t/s en procesamiento de prompt. El propio autor advierte que la comparación no es 1:1 por estar dirigida a hardware distinto.

## Requisitos de hardware

- VRAM/memoria unificada: entre 9,31 GiB (PTQ1_0) y 12,49 GiB (Hybrid) según checkpoint, más el KV cache. Con KV cache `q4_0` en K y V se alcanzan 262.144 tokens en 16 GB de memoria unificada.
- GPU recomendadas: Apple Silicon serie M (M-series, Mac Mini, M6 según las mediciones). No hay datos publicados de rendimiento en A100, H100 ni RTX 4090.
- GPU de consumo: el objetivo declarado son Macs de 16 GB. En GPU discretas no se reportan cifras; la comparación con el build de Unsloth sugiere que los kernels ternarios específicos de este repo están optimizados para Metal y no para CUDA.
- Opciones de despliegue: `llama.cpp` (`llama-cli`, `llama-server`), con soporte de `-hf` para descarga directa desde Hugging Face. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: 64,4-76,7 t/s de generación y 648-1006 t/s de procesamiento de prompt (pp128) en Apple M6 con Metal.
- En 16 GB de Mac, la model card reporta contextos de 262.144 tokens con KV `q4_0/q4_0` o `q8_0/q8_0` según checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Ternary-Flint-40B (este) | ~39,8B (2,5B activos) | 262.144 | Ternario 1.58-bit + hibridos | Apache 2.0 | Apple Silicon / Metal |
| unsloth/flint-UD-IQ1_M | ~39,8B (2,5B activos) | no disponible | i-quants mixtos (IQ1_S/IQ2_XXS/IQ2_S/IQ3_XXS) | no disponible en la informacion | CUDA / servidor |
| RecursiveSI/flint (base) | ~39,8B (2,5B activos) | no disponible | pesos originales (safetensors) | no disponible en la informacion | GPU dedicada |

No se dispone de datos de benchmarks estándar para comparar calidad entre estos modelos; la única métrica común es la perplejidad reportada por el autor en `wiki_sample` (1,0183 para el build Apple frente a 1,6754 para el build Unsloth), con la advertencia de que las configuraciones de evaluación pueden no ser equivalentes.

## Limitaciones y advertencias

- La cuantización ternaria introduce pérdida de calidad respecto al modelo base; la perplejidad reportada (10,13-10,95 en `nlp`) es el principal indicador, pero no hay benchmarks de tareas que permitan cuantificar la degradación en código o razonamiento.
- Riesgo de alucinación inherente a modelos de lenguaje; no se documentan evaluaciones de factualidad ni tasas de error.
- Idiomas limitados a inglés, chino y ruso; el castellano no está declarado como soportado.
- Los kernels Metal y la LUT de memoria constante son específicos de este repositorio; el rendimiento en CUDA u otras plataformas no está caracterizado y podría degradarse notablemente.
- La comparación con el build de Unsloth la realiza el propio autor y él mismo advierte que no es 1:1; conviene tratarla con cautela.
- No se documentan sesgos conocidos, composición del dataset de entrenamiento ni proceso de alineación (RLHF/DPO), lo que dificulta evaluar riesgos de contenido.
- Aunque la licencia es Apache 2.0, el modelo base `RecursiveSI/flint` puede tener condiciones propias que conviene verificar antes de uso comercial.
- El repositorio tiene solo 2 likes y fue creado en noviembre de 2026; es un artefacto reciente con poca validación comunitaria independiente.
- El contexto de 262k tokens depende de configuración específica de KV cache (`q4_0`); con otros tipos de cache el límite práctico en 16 GB será menor.

## Enlaces

- Hugging Face: https://huggingface.co/kabcpc/Ternary-Flint-40B-GGUF
- Modelo base: https://huggingface.co/RecursiveSI/flint
- Build alternativo (Unsloth): https://huggingface.co/unsloth/flint-UD-IQ1_M
- Repositorio llama.cpp (referenciado en los comandos): https://github.com/ggerganov/llama.cpp
