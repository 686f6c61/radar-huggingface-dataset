# infosave/SenseNova-Loop-9B-cmf

## Resumen

SenseNova-Loop-9B-cmf es una distribucion cuantizada del modelo multimodal SenseNova-Loop-9B (publicado el 17 de noviembre de 2026 por SenseNova), empaquetada por el usuario infosave en formato CMF para el motor de inferencia cortiq, escrito en Rust y sin dependencias de Python ni de frameworks de machine learning. El modelo base es un transformer con bucle (looped transformer) de 9B parametros que ejecuta 24 de sus 32 capas de decoder dos veces (56 pasadas de capa), incorpora dos flujos residuales (mHC) dentro del bucle, mezcla atencion lineal y atencion completa, procesa imagenes y soporta una ventana de contexto de 512K tokens. Esta version mantiene la cabeza MTP (multi-token prediction) para decodificacion especulativa.

La relevancia de esta ficha reside en que combina un modelo de arquitectura no convencional con un motor de inferencia nativo en Rust que funciona sobre CUDA, Vulkan, DX12, Metal y CPU, lo que permite desplegarlo en hardware muy diverso sin cadena de herramientas Python. Se ofrecen dos cuantizaciones: `q4tp` (4 bits, GPTQ, 5,74 GB) y `q8_2f` (8 bits, 10,16 GB), ambas con el encoder de vision en 16 bits y los routers mHC en float32.

El modelo esta pensado para tareas image-text-to-text y generacion de codigo, con soporte de modo de razonamiento (thinking), tool calling implicito via MTP y capacidades multilingues en ingles, ruso y chino. Su licencia Apache 2.0 facilita el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con bucle (looped transformer): 32 capas de decoder, 24 de ellas ejecutadas dos veces (56 pasadas); mezcla de atencion lineal y completa; dos flujos residuales (mHC); cabeza MTP |
| Parametros totales | 9B (segun nombre del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512K tokens (512 000) |
| Tipos de cuantizacion | `q4tp` (4 bits, GPTQ); `q8_2f` (8 bits); encoder de vision en 16 bits; routers mHC en float32 |
| Idiomas soportados | en, ru, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | CMF (formato propio del motor cortiq); no se distribuyen safetensors ni GGUF en este repositorio |

## Arquitectura y entrenamiento

El modelo base SenseNova-Loop-9B emplea una arquitectura de transformer con bucle: de las 32 capas de decoder, las capas 4 a 27 se ejecutan dos veces, dando lugar a 56 pasadas de capa en total. Cada pasada del bucle mantiene su propia cache. Dentro del bucle se transportan dos flujos residuales (mHC, presumiblemente multi-hyper-connection) gestionados por routers que se mantienen en float32 tal como los publica el autor original. La atencion combina mecanismos lineales y completos, lo que reduce el coste computacional en contextos largos. Se aplica YaRN con factor 2 en todas las longitudes, y los ficheros CMF replican esta configuracion.

El modelo incorpora una cabeza MTP (multi-token prediction) que genera borradores de tokens verificados en un solo lote, lo que acelera la decodificacion en modo greedy. Tambien incluye un encoder de vision de 16 bits y un procesador de imagenes, lo que habilita la modalidad image-text-to-text. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento general, con modo de pensamiento (thinking) activado por defecto y desactivable con `--no-think`.
- Generacion de codigo: el modelo es capaz de escribir funciones y fragmentos de codigo, con tasas de decodificacion medidas especificamente para prompts de codigo.
- Comprension de imagenes: pipeline image-text-to-text; acepta rutas locales, data URLs o URLs HTTP(S) mediante el flag `--image` (repetible).
- Decodificacion especulativa mediante cabeza MTP: genera tokens borrador que se verifican en lote, con tasas de aceptacion del 30-52 % en CUDA para codigo.
- Capacidades multilingues en ingles, ruso y chino.
- Contexto largo: hasta 512K tokens, con rendimiento medido hasta 128K tokens en la tabla de benchmarks.
- Inferencia en multiples backends: CUDA, Vulkan, DX12, Metal y CPU, a traves del motor cortiq.

## Casos de uso

- Generacion de codigo en produccion: el modelo alcanza 88,1 tok/s en una RTX A5000 con CUDA y borradores MTP para prompts de codigo, lo que lo hace adecuado para asistentes de codigo integrados en IDE o pipelines de CI/CD que requieran baja latencia por token.
- Analisis de documentos largos con imagenes: con 512K tokens de contexto y soporte de vision, puede procesar informes extensos que combinen texto e imagenes (por ejemplo, documentacion tecnica escaneada) en una sola pasada, aunque por encima de 64K tokens conviene usar la variante Turbo para contener el consumo de memoria.
- Atencion al cliente automatizada multilingue: soporta en, ru y zh, y puede gestionar conversaciones multi-turno con contexto largo; el modo `--no-think` reduce la latencia cuando no se requiere razonamiento explicito.
- Descripcion y etiquetado de imagenes: el pipeline image-text-to-text permite generar descripciones, alt-text o metadatos a partir de imagenes, con el encoder de vision en 16 bits incluido en los ficheros CMF.
- Despliegue en hardware heterogeneo sin Python: al funcionar sobre Vulkan, DX12, Metal y CPU mediante cortiq, es adecuado para entornos donde no se puede instalar CUDA ni frameworks de ML (por ejemplo, estaciones de trabajo con GPU AMD o Intel, o Mac con Apple Silicon).
- Prototipado e investigacion en arquitecturas con bucle: al conservar la estructura de bucle, los flujos mHC y la cabeza MTP, sirve para experimentar con decodificacion especulativa y arquitecturas no estandar sin necesidad de reimplementar el modelo en Python.
- Procesamiento por lotes en CPU o GPU de gama media: la cuantizacion `q4tp` ocupa 4,8 GB en Vulkan con prompts cortos, lo que permite ejecutarlo en GPUs de consumo con 8 GB o mas.

## Benchmarks y rendimiento

Perplejidad (menor es mejor):

| Configuracion | wikitext-2, primeros 2048 tokens | chat text, 4096 tokens |
|---|---:|---:|
| Transformers, float32 | 11,90 | — |
| `q8_2f` | 11,78 | 1,848 |
| `q4tp` | 12,95 | 1,942 |

Rendimiento en CUDA (RTX A5000, 24 GB, cortiq 0.9.5, build release, `--greedy --no-think`, 256 tokens):

| Tipo de prompt | Con borradores (tok/s) | Sin borradores (tok/s) | Borradores aceptados |
|---|---:|---:|---:|
| Codigo | 88,1 (74,4-98,9) | 51,0 | 30-52 % |
| Preguntas generales | 57,9 (52,7-62,4) | 49,8 | 19-40 % |

Longitud de prompt en CUDA (`cortiq bench --core`, sin borradores, 128 tokens tras el prompt):

| Prompt (tokens) | Primer token (s) | Decodificacion (tok/s) | Memoria pico (GB) |
|---:|---:|---:|---:|
| 1 000 | 1,5 | 51,9 | 7,8 |
| 4 000 | 2,3 | 50,4 | 8,0 |
| 16 000 | 10,1 | 47,1 | 8,9 |
| 32 000 | 22,6 | 43,5 | 10,0 |
| 64 000 | 53,0 | 38,1 | 12,2 |
| 128 000 | 141,9 | 30,5 | 16,5 |

`q8_2f` en CUDA: 34,0 / 33,7 / 32,1 tok/s y 9,1 / 9,3 / 10,1 GB a 1 000 / 4 000 / 16 000 tokens.

Rendimiento en Vulkan (RTX A5000, mismos prompts):

| Tipo de prompt | Con borradores (tok/s) | Sin borradores (tok/s) | Borradores aceptados |
|---|---:|---:|---:|
| Codigo | 57,5 (47,9-63,7) | 49,3 | 38-61 % |
| Preguntas generales | 42,4 (35,8-45,4) | 47,4 | 23-36 % |

Rendimiento en Metal (Apple M4, MacBook Air): codigo a 14,4 tok/s con borradores y 9,5 tok/s sin ellos.

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: `q4tp` 7,8 GB en CUDA y 4,8 GB en Vulkan con prompts cortos; `q8_2f` 9,1 GB en CUDA y 8,2 GB en Vulkan. La memoria crece con la longitud del prompt: hasta 16,5 GB con `q4tp` en CUDA a 128K tokens.
- GPU recomendadas: NVIDIA RTX A5000 (24 GB) es el banco de pruebas de referencia; cualquier GPU NVIDIA con CUDA 12.x (libnvrtc y libcublas en tiempo de ejecucion); GPUs AMD e Intel con Vulkan 1.3 o DX12; Apple Silicon con Metal.
- Cabe en GPU de consumo: `q4tp` con 4,8 GB en Vulkan es viable en GPUs de 8 GB o mas; `q8_2f` requiere al menos 9-10 GB.
- Opciones de despliegue: cortiq 0.9.5 o superior (CLI `cortiq-cli`), con backends CUDA (`--features cuda`), Vulkan/DX12 (features por defecto), Metal y CPU. No se mencionan vLLM, llama.cpp ni TGI para este formato CMF.
- Latencia y throughput: primer token en 1,5 s con 1K tokens de prompt y 141,9 s con 128K tokens (CUDA, `q4tp`); decodificacion de 51,9 a 30,5 tok/s segun longitud de contexto; 88,1 tok/s en codigo con borradores MTP en CUDA.
- En Vulkan, los borradores MTP solo compensan en codigo; en preguntas generales es mas rapido sin ellos (`CMF_MTP=0`). En Metal no se midio memoria para esta release.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada. La comparacion con alternativas de la misma categoria (modelos multimodales de ~9B con contexto largo) no esta disponible.

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| SenseNova-Loop-9B-cmf | 9B | 512K | Apache 2.0 | CMF (cortiq) | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El formato CMF es propietario del motor cortiq; no es compatible con llama.cpp, vLLM, TGI ni Transformers sin conversion. La version 0.9.4 de cortiq lee los ficheros pero ejecuta las operaciones una a una en GPU, con la consiguiente perdida de rendimiento.
- La cuantizacion `q4tp` degrada la perplejidad respecto al float32 (12,95 frente a 11,90 en wikitext-2), lo que puede afectar a tareas que requieran alta fidelidad.
- En Vulkan, las respuestas con borradores MTP pueden diferir del texto greedy puro en empates cercanos, porque el lote de verificacion redondea de forma distinta al grafo de un solo token.
- El modo de pensamiento esta activado por defecto y consume tokens de `--max-tokens`; en produccion conviene usar `--no-think` si no se necesita razonamiento explicito.
- Por encima de 64K tokens el rendimiento y la memoria se degradan notablemente en esta distribucion; el autor recomienda la variante Turbo para documentos largos.
- Solo se declaran idiomas en, ru y zh; el rendimiento en castellano no esta documentado y no puede asumirse.
- Riesgo de alucinacion y sesgos: no se han publicado evaluaciones de sesgo ni de robustez en la informacion disponible.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y esta cuantizacion deben verificarse contra las condiciones del autor original (sensenova) antes de su explotacion en produccion.
- No se han publicado resultados de benchmarks academicos estandar, por lo que la comparacion objetiva con otros modelos queda pendiente.

## Enlaces

- Repositorio Hugging Face de esta cuantizacion: https://huggingface.co/infosave/SenseNova-Loop-9B-cmf
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B
- Variante Turbo para documentos largos: https://huggingface.co/infosave/SenseNova-Loop-9B-Turbo-cmf
- Motor de inferencia cortiq (repositorio CMF): https://github.com/infosave2007/cmf
- Imagen de rendimiento de borradores en CUDA: https://huggingface.co/infosave/SenseNova-Loop-9B-cmf/resolve/main/assets/drafts_cuda_en.png
- Imagen de rendimiento de borradores en Vulkan: https://huggingface.co/infosave/SenseNova-Loop-9B-cmf/resolve/main/assets/drafts_vulkan_en.png
