# GossetWorks/Qwen3-32B-Gosset-3.65BPW

## Resumen

Qwen3-32B-Gosset-3.65BPW es una compresión del modelo Qwen3-32B de Alibaba Qwen mediante la técnica propietaria Gosset Packing, desarrollada por GossetWorks. El pack codifica los pesos del transformer original a 3,6577 bits por peso (bpw) en promedio, reduciendo el tamaño en disco de aproximadamente 65 GB (BF16) a 14,62 GB. El objetivo es claro y muy concreto: hacer que un modelo denso de 32B quepa de forma íntegra en una GPU de consumo con 16 GB de VRAM, algo que los formatos de 4 bits convencionales (AWQ/GPTQ, GGUF Q4_K_M) no consiguen.

La innovación central es el uso del retículo E8 de Gosset, el empaquetamiento esférico más denso en 8 dimensiones (teorema de Viazovska), como sustituto del redondeo escalar 1D independiente. Cada código empaquetado representa un grupo de ocho pesos y se decodifica directamente en registros de la GPU, sin tablas de códigos en memoria compartida. El autor reporta una verificación de residencia completa en una RTX 5080 con 12,95 GiB de VRAM ocupada y unos 2,8 GiB libres.

El modelo no se distribuye como pesos estándar: requiere el runtime propietario de Gosset (kernels precompilados para NVIDIA SM75–SM120), incluido en el bundle junto con una CLI de chat interactiva. La licencia es "other" (Gosset Evaluation License), sin gate ni aprobación previa para descarga. Es relevante ahora porque demuestra una vía alternativa de cuantización sub-4-bit basada en retículos que supera las limitaciones de tamaño de los formatos escalares en GPUs de 16 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-32B), pesos empaquetados en retículo E8 de Gosset |
| Parametros totales | 32B (modelo base); el repo safetensors reporta 4.989.736.320 elementos empaquetados |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del Qwen3-32B base, valor no confirmado) |
| Tipos de cuantizacion | Gosset Packing a 3,6577 bpw all-in: proyecciones de atención y LM head a 4,25 bpw, proyecciones MLP a 3,25 bpw, embedding int8, escalas por grupo |
| Idiomas soportados | No disponible en la información proporcionada (heredados del Qwen3-32B base) |
| Licencia | other (Gosset Evaluation License; sin gate ni aprobación) |
| Formato de pesos | safetensors (bit-packed lattice codes) + runtime Gosset propietario |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-32B, un transformer denso de 32 mil millones de parámetros. Sobre él, GossetWorks aplica un proceso de compresión post-entrenamiento denominado Gosset Packing: en lugar de redondear cada peso de forma escalar e independiente en 1D, proyecta grupos de ocho pesos sobre el retículo E8 y almacena el código de retículo resultante. La decodificación se realiza en registros de la GPU sin tablas de códigos en memoria compartida, lo que reduce el coste de acceso y permite mantener el modelo completamente residente en VRAM.

El pack se genera con el denominado "activation-aware v3 encoder", una familia de codificador que tiene en cuenta las activaciones al asignar los códigos. El autor reporta que este codificador reduce drásticamente el daño de cuantización frente al primer build directo sin ponderación: en WikiText-2 corto, el primer build medía +31,97% / +43,55% de degradación de perplejidad, mientras que el v3 la reduce a +5,40% / +4,51% con el mismo ancho de bits y número de bytes. Se incluye una certificación de fidelidad con error relativo de reconstrucción por grupo: 0,0969 (0,0714 ponderado por activación) en proyecciones de atención, 0,1732 (0,1376) en MLP, 0,0090 en embedding y 0,0919 (0,0323) en LM head.

No se proporciona información sobre el dataset de entrenamiento original de Qwen3-32B ni sobre si el proceso de empaquetado incluyó ajuste fino adicional; el pack es una compilación de pesos, no un reentrenamiento.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del Qwen3-32B base, incluyendo modo de pensamiento (thinking mode) del que Qwen3 hace gala, aunque la información proporcionada no lo detalla explícitamente.
- Generación de código: los benchmarks reportados (HumanEval 86,59% pass@1, MBPP 72,40% pass@1) confirman competencia sólida en programación.
- Razonamiento matemático: GSM8K con 93,48% de acierto sobre el conjunto de test completo.
- Conocimiento general: MMLU con 76,83% sobre las 14.042 preguntas del test set.
- Capacidades multilingües: no confirmadas en la información disponible; dependen del modelo base.
- Tool calling / function calling: no confirmado explícitamente para este pack; el modelo base Qwen3-32B lo soporta, pero el runtime Gosset incluido es una CLI de chat y no se documenta integración con APIs de herramientas.
- Soporte de agentes y razonamiento multi-paso: no documentado para este pack.
- Capacidades especiales: decodificación bit-packed en registros GPU sin tablas de códigos; residencia completa en 16 GB de VRAM verificada.

## Casos de uso

- Inferencia de un modelo de 32B en GPU de consumo: el caso principal. Un desarrollador con una RTX 5080 (16 GB) puede ejecutar un modelo denso de 32B sin offloading ni spilling a RAM del sistema, algo imposible con AWQ/GPTQ (17–18 GB) o GGUF Q4_K_M (19,8 GB) en esa misma tarjeta.
- Asistencia de código en estación de trabajo local: con HumanEval al 86,59% pass@1, el pack sirve para autocompletado, generación de funciones y revisión de código en un entorno de desarrollo sin depender de la nube.
- Razonamiento matemático en local: GSM8K al 93,48% permite resolver problemas aritméticos y de varios pasos en un portátil o torre con GPU de 16 GB, útil para prototipado de pipelines educativos o de verificación.
- Investigación en cuantización: el pack es un artefacto de referencia para estudiar el rendimiento de la codificación en retículo E8 frente a cuantización escalar; el autor publica el protocolo completo de benchmarks y la certificación de fidelidad.
- Evaluación comparativa de formatos: sirve para medir el compromiso entre tamaño (14,62 GB), velocidad (37,1 tok/s de decodificación) y calidad (perplejidad +5,40% frente a BF16) en una GPU concreta, con datos reproducibles.
- Despliegue en robótica y edge con GPU NVIDIA: el mismo códec se ha probado en NVIDIA GR00T-N1.5-3B sobre Jetson Orin Nano (8 GB), lo que sugiere aplicabilidad del enfoque a entornos embebidos con GPUs de gama media.
- Chat interactivo local: el bundle incluye una CLI de chat que permite conversaciones multi-turno sin infraestructura adicional, adecuada para pruebas de concepto y demostraciones.

## Benchmarks y rendimiento

Resultados reportados por el autor, medidos sobre conjuntos oficiales completos con el runtime Gosset en una RTX 5080:

| Benchmark | Resultado | Detalle |
|---|---|---|
| HumanEval | 86,59% pass@1 | 142 / 164 (build v3 del codificador) |
| GSM8K | 93,48% | 1.233 / 1.319 (build v3) |
| MMLU | 76,83% | 10.789 / 14.042 (primer build del codificador) |
| MBPP | 72,40% pass@1 | 362 / 500 (build v3) |

Perplejidad en WikiText-2 (test):

| Protocolo | Este pack | BF16 | Delta |
|---|---|---|---|
| Long-chunk (24 × 2048 tokens) | 7,8335 | 7,4320 | +5,40% |
| Short-window (128 tokens) | 14,8968 | 14,2534 | +4,51% |

Velocidad en RTX 5080 con residencia completa: 37,1 tok/s de decodificación de media en la ejecución completa de HumanEval; procesamiento de prompt de 664,9 tok/s en el harness de evaluación (~145 ms hasta el primer token). VRAM pico en todas las ejecuciones de evaluación: 14,12 GiB.

No se proporcionan comparaciones directas con otros modelos en la información disponible; los datos de referencia son los del Qwen3-32B base publicados por el autor del modelo original.

## Requisitos de hardware

- VRAM: 12,95 GiB ocupados en el caso verificado (RTX 5080, 16 GB), con unos 2,8 GiB libres; pico de 14,12 GiB durante las evaluaciones. Mínimo declarado: 16 GB de VRAM.
- GPU recomendadas: RTX 5080 (verificada por el autor); los kernels cubren NVIDIA SM75–SM120, lo que abarca desde Turing (RTX 20xx) hasta Blackwell. No se documentan pruebas en A100, H100 ni otras GPUs de centro de datos.
- GPU de consumo: sí, en tarjetas de 16 GB o más; en GPUs de 8 GB el pack no cabe (el autor cita un Qwen3-14B a 3,43 bpw para ese segmento).
- Opciones de despliegue: runtime Gosset propietario incluido en el bundle (kernels precompilados, CLI de chat interactiva) y Gosset Runner para Windows x64 (instalador standalone, sin Python). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que el formato bit-packed no es estándar.
- Latencia y throughput: 37,1 tok/s de decodificación y 664,9 tok/s de procesamiento de prompt en RTX 5080, con ~145 ms hasta el primer token.
- Disco: aproximadamente 15 GB de espacio libre; el repo ocupa 14,6 GB.

## Comparativa con modelos similares

| Modelo | Parámetros | Tamaño en disco | Contexto | Licencia | Despliegue en 16 GB |
|---|---|---|---|---|---|
| Qwen3-32B-Gosset-3.65BPW | 32B (denso) | 14,62 GB | no disponible | other (Gosset Evaluation) | Sí, verificado (12,95 GiB) |
| Qwen3-32B AWQ/GPTQ 4-bit | 32B (denso) | ~17–18 GB | el del base | según build | No, excede 16 GB |
| Qwen3-32B GGUF Q4_K_M | 32B (denso) | ~19,8 GB | el del base | según build | No, excede 16 GB |
| Qwen3-32B BF16 | 32B (denso) | ~65 GB | el del base | Apache 2.0 (base) | No |

Los datos de AWQ/GPTQ y GGUF Q4_K_M provienen de la model card del autor. No se dispone de comparaciones de rendimiento con otros modelos en la información proporcionada más allá de los anclajes BF16 del propio pack.

## Limitaciones y advertencias

- Formato no estándar: los pesos son códigos de retículo bit-packed que requieren el runtime Gosset propietario. No se pueden cargar con transformers, vLLM, llama.cpp, Ollama ni TGI, lo que limita la portabilidad y la integración en pipelines existentes.
- Licencia "other" (Gosset Evaluation License): aunque no hay gate, las condiciones exactas de uso comercial no se detallan en la información disponible; conviene revisar el texto completo de la licencia antes de un despliegue en producción.
- Degradación de calidad medible: +5,40% de perplejidad en long-chunk y +4,51% en short-window frente a BF16; el autor estima que se retiene aproximadamente nueve décimas partes del rendimiento en tareas respecto a las puntuaciones publicadas del modelo base.
- El recuento de parámetros que muestra Hugging Face (4,99 mil millones de elementos) no refleja el tamaño real del modelo; puede inducir a error en herramientas que lo lean automáticamente.
- Riesgo de alucinación: inherente al Qwen3-32B base; la cuantización puede amplificarlo ligeramente, aunque no se documenta un estudio específico.
- Sesgos: no documentados en la información proporcionada; se heredan los del modelo base.
- Idiomas: no confirmados para este pack; dependen del Qwen3-32B original y no se listan en la model card.
- Contexto: la longitud de contexto no se especifica en la información disponible; debe asumirse la del modelo base, pero sin confirmación.
- Madurez: 192 descargas y 2 likes en el momento de la consulta; proyecto reciente (creado en noviembre de 2026) con un ecosistema de runtime joven.
- Dependencia de hardware NVIDIA: los kernels cubren SM75–SM120; no hay soporte documentado para AMD, Apple Silicon ni CPU.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GossetWorks/Qwen3-32B-Gosset-3.65BPW
- Modelo base: https://huggingface.co/Qwen/Qwen3-32B
- Página de benchmarks de Gosset Works: https://www.gossetworks.com/benchmarks.html
- Gosset Runner (instalador Windows): https://huggingface.co/GossetWorks/GossetRunner
- Instalador directo: https://huggingface.co/GossetWorks/GossetRunner/resolve/main/GossetRunnerSetup-1.0.3-win64.exe
