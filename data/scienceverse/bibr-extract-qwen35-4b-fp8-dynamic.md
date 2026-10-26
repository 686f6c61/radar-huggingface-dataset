# scienceverse/bibr-extract-qwen35-4b-FP8-Dynamic

## Resumen

`bibr-extract-qwen35-4b-FP8-Dynamic` es una compilación en FP8 del modelo de extracción estructurada `scienceverse/bibr-extract-qwen35-4b`, desarrollado por ScienceVerse como pieza central de su pipeline de extracción científica `bibr`. El modelo recibe textos o imágenes de artículos científicos y devuelve JSON con campos estructurados: ecuaciones estadísticas, segmentación de referencias, financiación, contribuciones, afiliaciones, título, DOI, autores y resumen. No es un modelo de propósito general: es un estudiante de 4,66 mil millones de parámetros destilado de un profesor de mayor tamano y ajustado específicamente para responder a las plantillas de extracción de `bibr`.

La base es Qwen3.5-4B, un transformer híbrido que combina 24 capas de atención lineal Gated DeltaNet con 8 capas de atención completa, más una cabeza de predicción multi-token (MTP) y una torre de visión. Esta compilación cuantiza 200 capas lineales a FP8 E4M3 con escalas por canal en pesos y escalas dinámicas por token en activaciones, usando `llm-compressor` en modo `model_free_ptq`, sin datos de calibración. El resultado reduce los pesos de 9,32 GB a 5,76 GB y acelera la decodificación entre 1,42 y 1,50 veces frente al modelo bf16 en vLLM 0.31, o hasta 2,5 veces si se activa la decodificación especulativa MTP en vLLM 0.32.

Su relevancia ahora es práctica: permite servir un extractor científico especializado en una sola GPU consumer con FP8 (probado en RTX 5090) manteniendo la precisión del modelo original —218 de 252 artículos superados frente a 217 del bf16— y con velocidad suficiente para procesar corpus completos en lote.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen3.5: 32 capas (24 de atención lineal Gated DeltaNet + 8 de atención completa), cabeza MTP y torre de visión |
| Parametros totales | 4.659.865.088 (~4,66 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | máximo nativo no disponible; servido con `--max-model-len 32768` en las pruebas del autor |
| Tipos de cuantizacion | FP8 dinámico: pesos E4M3 con una escala por canal de salida, activaciones FP8 con escala dinámica por token, formato `float-quantized` de compressed-tensors; 200 capas lineales cuantizadas y 538 tensores sin cuantizar (bf16 y F32) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con compressed-tensors (repo de 5,8 GB, pesos de 5,76 GB); existe versión GGUF del modelo base en un repositorio aparte |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.5-4B: un híbrido de atención con 32 capas, de las cuales 24 usan Gated DeltaNet (atención lineal con estado recurrente, tensores `A_log` y normalización propia en F32) y 8 usan atención completa con proyecciones q/k/v/o. Cada capa incluye tres proyecciones MLP (96 en total). La torre de visión y la cabeza MTP se mantienen en bf16, y la MTP se conserva íntegra en bf16 —a diferencia de la receta oficial de Qwen, que cuantiza el resto de su capa MTP—, lo que permite usarla como decodificación especulativa sin pérdida de aceptación.

El entrenamiento original consiste en un ajuste fino con LoRA sobre Qwen3.5-4B, destilado de las respuestas de un modelo profesor de mayor tamano, con la LoRA fusionada en pesos bf16 completos. No se dispone del número de tokens de entrenamiento, la composición del dataset ni los detalles de RLHF/DPO. Esta compilación concreta no reentrena nada: aplica `model_free_ptq` de `llm-compressor` 0.14.0.1 (compressed-tensors 0.19.0) directamente sobre los safetensors, sin calibración. La selección de capas coincide con la de `Qwen/Qwen3.5-27B-FP8` en el decodificador principal, pero difiere en dos puntos: aquí la cabeza MTP queda entera en bf16 y las escalas de pesos son por canal, no bloques de 128×128. Quedan sin cuantizar los embeddings, el `lm_head` atado, `in_proj_a`/`in_proj_b`, `conv1d`, `dt_bias`, los pesos RMSNorm, la torre de visión y la MTP.

## Capacidades

- Extracción estructurada en JSON de campos bibliográficos y científi cos: título, DOI, autores, referencias, resumen, financiación, contribuciones y afiliaciones.
- Segmentación y resolución de listas de referencias dentro del texto del artículo.
- Extracción de ecuaciones y resultados estadísticos a partir de las plantillas de `bibr`.
- Entrada multimodal texto-imagen (`pipeline_tag: image-text-to-text`), con torre de visión conservada en bf16 para procesar páginas o figuras.
- Generación de resumen evaluada con ROUGE-L medio de 0,954 sobre el conjunto de 252 artículos.
- Decodificación especulativa mediante cabeza MTP: 0,978 de tokens aceptados por token propuesto en concurrencia 1.
- Servicio de alto rendimiento en vLLM con `compressed-tensors`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (el modelo está ajustado para extracción de un solo paso).
- Capacidades multilingües: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponibles.

## Casos de uso

- **Indexación masiva de literatura científica**: procesar lotes de PDF o texto OCR con vLLM y `--max-num-seqs 64`, extrayendo título, DOI, autores y referencias en JSON para poblar un repositorio bibliográfico. Los 1.059 tok/s agregados en concurrencia 8 permiten sostener ingestas de miles de artículos por hora en una sola GPU.
- **Desambiguación y enlazado de referencias**: usar la segmentación de referencias del modelo para separar entradas individuales dentro de una lista y resolver cada una contra un identificador persistente. El modelo no pierde ningún artículo en los campos de referencia frente al bf16 y gana uno frente a la ejecución de referencia.
- **Extracción de ecuaciones y resultados estadísticos**: recuperar tamaños de efecto, valores p, tamaños de muestra e intervalos de confianza de la sección de resultados para meta-análisis y revisiones sistemáticas, con salida JSON validable contra un esquema.
- **Metadatos de financiación y afiliaciones**: extraer agencias financiadoras, números de subvención y afiliaciones institucionales para auditorías de conflicto de interés o informes de financiación.
- **Revisión editorial y control de calidad**: comprobar automáticamente que un manuscrito enviado incluye DOI, financiación y afiliaciones completas, marcando campos ausentes antes de la revisión por pares.
- **Despliegue on-premise en una sola GPU consumer**: servir el extractor en una RTX 4090, L40S o RTX 5090 dentro de una infraestructura propia, sin depender de APIs externas, con pesos de 4,73 GiB en memoria de GPU usando `--language-model-only`.
- **Atención a usuarios de una base de datos científica**: generar respuestas estructuradas a consultas del tipo "¿qué financiación declara este artículo?" reutilizando la salida JSON del extractor como capa de datos.

## Benchmarks y rendimiento

Evaluación sobre el arnés de extracción de `bibr` (9 de octubre de 2026, bibr 9621739, scorer v5, 252 artículos de desarrollo: gate192 + ci60, OCR reproducido desde caché). Comparaciones pareadas con bootstrap de 10.000 réplicas por artículo y margen de no inferioridad de −4 pp. Un artículo equivale a 0,4 pp.

| Modelo | Servicio | Artículos superados / 252 | Diferencia de este modelo frente a él, Δ pp [IC 95%] |
|---|---|---|---|
| bibr-extract-qwen35-4b (bf16, mismo checkpoint, misma tarjeta y setup) | vLLM 0.31.0, RTX 5090 | 217 | +0,4 [0,0, +1,2]; 1 ganado, 0 perdidos |
| bibr-extract-qwen35-4b (ejecución de referencia: LoRA sin fusionar sobre Qwen3.5-4B, otra GPU) | vLLM 0.31.0 | 216 | +0,8 [0,0, +2,0]; 2 ganados, 0 perdidos |
| **Este modelo (FP8 dinámico)** | vLLM 0.31.0, RTX 5090 | **218** | — |

Desglose por subconjunto frente al bf16 en la misma máquina: gate192 (n=192) +0,0 [0,0, 0,0]; ci60 (n=60) +1,7 [0,0, +5,0], 1 ganado. Campos de suelo (título, DOI, autores, referencias) sobre los 252 artículos: no se pierde ningún artículo en ningún campo frente a ninguna de las dos filas; frente al bf16, las referencias ganan un artículo; frente a la ejecución de referencia, título y referencias ganan uno cada uno. Resumen: ROUGE-L medio 0,954 frente a 0,955 del bf16.

Rendimiento medido en RTX 5090 reproduciendo las mismas 351 peticiones de extracción:

| Métrica | bf16 4B | Este modelo |
|---|---|---|
| tok/s de decodificación por petición, concurrencia 1, vLLM 0.31 | 164,5 | 233,5 (1,42×) |
| tok/s agregados, concurrencia 8, vLLM 0.31 | 705 | 1.059 (1,50×) |
| tok/s de decodificación por petición, concurrencia 1, vLLM 0.32 + MTP k=3 | 320 | 411 (2,50×) |
| tok/s agregados, concurrencia 8, vLLM 0.32 + MTP k=3 | 1.214 | 1.608 (2,28×) |
| Pesos en memoria de GPU (`--language-model-only`) | 7,99 GiB | 4,73 GiB |

Aceptación de la MTP en concurrencia 1: 54.155 tokens aceptados de 55.346 propuestos (0,978), con 2,94 tokens propuestos por paso de media y una longitud media de aceptación de 3,88 tokens por paso. Aceptación por posición: 99,5 % la primera, 96,4 % la segunda y 92,2 % la tercera. Los ajustes MTP son `--max-num-seqs 64 --speculative-config '{"method":"mtp","num_speculative_tokens":3}' --no-async-scheduling`.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El ruido de ejecución del arnés es apreciable: dos ejecuciones idénticas coinciden en aproximadamente el 96 % de las respuestas del LLM, por lo que diferencias de uno o dos artículos están dentro del ruido.

## Requisitos de hardware

- Pesos en memoria de GPU: 4,73 GiB con `--language-model-only` (frente a 7,99 GiB del bf16); el repositorio ocupa 5,8 GB en disco.
- Caché KV: 1,11 GiB por petición de 32.768 tokens con `--max-model-len 32768 --max-num-seqs 64`.
- Contexto CUDA de vLLM: aproximadamente 0,5 GiB adicionales fuera del presupuesto de `--gpu-memory-utilization`, que deben estar libres para que vLLM arranque.
- GPUs compatibles con FP8: familia Ada (RTX 4090, L4, L40S), Hopper (H100, H200) y Blackwell (RTX 5090, B200). En tarjetas sin FP8 (Ampere, Turing) debe usarse el modelo bf16 o la versión GGUF.
- Cabe en GPU consumer: sí, verificado en RTX 5090 (32 GB). El autor emuló presupuestos menores bajando `--gpu-memory-utilization` sobre una tarjeta de 32 GB, pero no ejecutó ninguna tarjeta de 8–11 GB, por lo que el mínimo real no está confirmado.
- Opciones de despliegue: vLLM 0.31.0 (precisión de referencia) y vLLM 0.32 con decodificación especulativa MTP; requiere soporte de compressed-tensors. Para llama.cpp/Ollama existe la versión GGUF del modelo base. TGI y otros servidores: no disponible.
- Throughput: 233,5 tok/s por petición en concurrencia 1 y 1.059 tok/s agregados en concurrencia 8 (vLLM 0.31); 411 y 1.608 tok/s respectivamente con MTP k=3 en vLLM 0.32.
- Latencia: no se publican cifras de latencia por petición ni tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto servido | Artículos superados / 252 | Licencia | Formato y disponibilidad |
|---|---|---|---|---|---|
| **bibr-extract-qwen35-4b-FP8-Dynamic** (este) | 4,66 B | 32.768 | 218 | Apache 2.0 | safetensors FP8, vLLM |
| scienceverse/bibr-extract-qwen35-4b | 4,66 B | 32.768 | 217 | Apache 2.0 | safetensors bf16 (9,32 GB), vLLM |
| scienceverse/bibr-extract-qwen35-4b-GGUF | 4,66 B | no disponible | no evaluado | Apache 2.0 | GGUF, llama.cpp |
| Qwen/Qwen3.5-4B (modelo base, propósito general) | ~4 B | no disponible | no evaluado en este arnés (no es un extractor especializado) | no disponible en la información | safetensors, múltiples backends |

La comparación relevante es contra el mismo checkpoint en bf16, que es la única fila medida en idénticas condiciones de tarjeta y setup. Frente a él, la compilación FP8 no pierde precisión (218 frente a 217, con el intervalo de confianza incluyendo el cero) y reduce pesos y tiempo de decodificación. Frente al modelo base sin ajustar, no hay datos de extracción: el ajuste fino y la destilación son los que aportan la capacidad de seguir las plantillas de `bibr`.

## Limitaciones y advertencias

- Modelo de propósito muy restringido: está ajustado para responder a las plantillas de extracción de `bibr`. Fuera de ese formato de prompts y esquemas JSON su comportamiento no está evaluado.
- Riesgo de alucinación en campos verificables: DOI, autores y referencias pueden generarse incorrectamente; conviene validar los identificadores contra fuentes externas antes de persistirlos.
- La evaluación se apoya en 252 artículos de desarrollo: un solo artículo son 0,4 pp y el ruido entre ejecuciones idénticas es del orden del 4 % de las respuestas, así que diferencias de uno o dos artículos no son señal fiable.
- La cabeza MTP y la torre de visión permanecen en bf16, de modo que el ahorro de memoria es menor que el de una cuantización integral, y la MTP requiere vLLM 0.32 o superior para aprovecharse.
- Requiere GPU con soporte FP8 nativo; en Ampere o Turing hay que recurrir al checkpoint bf16 o al GGUF.
- Los presupuestos de memoria publicados se obtuvieron por emulación sobre una tarjeta de 32 GB; no se validaron en tarjetas de 8–11 GB.
- Idiomas soportados y sesgos conocidos: no disponibles en la información publicada. No hay datos de comportamiento fuera del inglés científico.
- Licencia Apache 2.0: permite uso comercial y modificaciones, pero el modelo deriva de Qwen3.5-4B y conviene revisar las condiciones de la familia base antes de redistribuir.
- Modelo recién publicado (26 de octubre de 2026) sin descargas ni validación independiente; la librería declarada es exclusivamente vLLM.
- El pipeline asume OCR previo en muchas configuraciones (el arnés reproduce OCR desde caché), por lo que la calidad de entrada condiciona la extracción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/scienceverse/bibr-extract-qwen35-4b-FP8-Dynamic
- Modelo base bf16: https://huggingface.co/scienceverse/bibr-extract-qwen35-4b
- Versión GGUF del modelo base: https://huggingface.co/scienceverse/bibr-extract-qwen35-4b-GGUF
- Repositorio del pipeline bibr: https://github.com/scienceverse/bibr
- Ficha en LLM Explorer: https://llm-explorer.com/model/scienceverse%2Fbibr-extract-qwen35-4b,75ZLtigXXy4Munr44Kac5y
- Endpoint de inferencia en FriendliAI: https://friendli.ai/models/scienceverse/bibr-extract-qwen35-4b
- Herramienta de cuantización llm-compressor: https://github.com/vllm-project/llm-compressor
- Referencia de receta FP8 de Qwen: https://huggingface.co/Qwen/Qwen3.5-27B-FP8
- Modelo base de la familia Qwen: https://huggingface.co/Qwen/Qwen3.5-4B
