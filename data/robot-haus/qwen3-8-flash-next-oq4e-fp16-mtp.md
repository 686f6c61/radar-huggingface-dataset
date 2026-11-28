# Robot-Haus/Qwen3.8-Flash-Next-oQ4e-fp16-mtp

## Resumen

Qwen3.8-Flash-Next es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por el equipo Qwen (Alibaba), distribuido bajo licencia Apache 2.0. Esta ficha describe la versión cuantizada publicada por Robot-Haus, `Qwen3.8-Flash-Next-oQ4e-fp16-mtp`, una conversión a 4 bits en formato MLX orientada a Apple Silicon, generada con la herramienta oQ (oMLX 0.6.4) mediante cuantización mixta calibrada con imatrix. El modelo original emplea la arquitectura propietaria `qwen4_exp`, con 512 expertos y enrutamiento top-10, 48 capas y atención híbrida (lineal y completa en intervalo 4:1).

El rasgo más singular de la arquitectura es su tabla de embeddings PLE de n-gramas de 51.200 millones de parámetros (20 millones de filas por 2560 dimensiones), que se suma a los pesos del transformer y explica buena parte del tamaño del checkpoint. El modelo incorpora además visión nativa, una cabeza Lightning MTP de una capa para decodificación especulativa y una ventana de contexto de 262.144 tokens. La cuantización preserva tanto la cabeza MTP como los componentes de visión, y recurre a fp16 para los tensores no cuantizados, una decisión pensada para las generaciones M1 y M2 de Apple Silicon, que carecen de soporte nativo de bf16.

La relevancia de esta publicación es doble: por un lado, pone al alcance de equipos con hardware Apple de gama alta un modelo MoE de gran escala en un único checkpoint de 99,82 GiB; por otro, documenta con detalle el comportamiento del runtime oMLX en modo de ingesta de contexto largo, con métricas de prefill y decodificación sobre un M2 Ultra de 128 GiB. Es una build orientada a procesamiento por lotes y documentos extensos más que a interacción conversacional de baja latencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen4_exp` (`Qwen4ExpForConditionalGeneration`), MoE con 512 expertos, top-10 routing, 48 capas, atención híbrida lineal/completa a intervalo 4:1 |
| Parametros totales | 179.999.981.459 (≈180B), de los cuales 51.2B corresponden a la tabla PLE de n-gramas |
| Parametros activos | no disponible (top-10 sobre 512 expertos; el número exacto de parámetros activos no se detalla en la información proporcionada) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | 4-bit affine base con group size 64, boosts por tensor a 5 bits en tensores sensibles; tabla PLE a 5,00 bits/parámetro; tensores no cuantizados en fp16 |
| Idiomas soportados | no disponible (la calibración usa el corpus `oqe_code_multilingual`, de 937 entradas, pero no se declara la lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX safetensors (21 shards, 99,82 GiB en disco) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE de 48 capas con 512 expertos y enrutamiento top-10, lo que implica que cada token activa únicamente una fracción reducida del total de expertos. La atención es híbrida: solo 12 de las 48 capas emplean atención completa, mientras que las 36 restantes usan atención lineal con estado recurrente fijo, siguiendo un intervalo `full_attention_interval: 4`. Esta configuración reduce drásticamente el coste de la caché KV, que con `num_key_value_heads: 2` y `head_dim: 256` en fp16 ocupa 24 KiB por token: 0,75 GiB a 32K, 3,0 GiB a 131K y 6,0 GiB al contexto completo de 262.144 tokens. La arquitectura incorpora además una tabla PLE (n-gram embedding) de 20 millones de filas por 2560 dimensiones, con 51.200 millones de parámetros, que funciona como memoria léxica de gran escala.

La versión aquí descrita no es un reentrenamiento, sino una cuantización. oQ aplica una base de 4 bits con group size 64 y boosts de 5 bits en tensores sensibles (mezcladores de hiperconexión y pesos de inyección de bloque), calibrada con imatrix sobre 1024 muestras de 512 tokens del corpus `oqe_code_multilingual`. La cobertura de calibración alcanza 75.243 de 75.264 slots de expertos (99,97%); los 21 slots restantes caen a la cuantización oQ estándar. Tres tensores (`lm_head` y dos pesos de `hyper_connection_mixer`) carecen de entradas de imatrix y se tratan sin calibración. La tabla PLE se cuantiza a 5,00 bits por parámetro y supone 29,82 GiB del total, frente a los 70,00 GiB del resto de pesos siempre residentes en memoria. No se dispone de información sobre el dataset de preentrenamiento del modelo original ni sobre si se aplicaron fases de RLHF o DPO.

## Capacidades

- Generación de texto y conversación multi-turno con contexto de hasta 262.144 tokens.
- Razonamiento y matemáticas, con modo de pensamiento (thinking) activable; las mediciones de rendimiento se realizaron con thinking on.
- Generación y comprensión de código, incluyendo el corpus de calibración multilingüe de código.
- Visión nativa: los componentes visuales se incluyen en la cuantización, no se ha eliminado la torre de visión.
- Decodificación especulativa mediante cabeza Lightning MTP de una capa, preservada tras la cuantización.
- Ingesta de documentos largos: prefill eficiente y caché de prefijo paginada que permite reutilizar contexto entre consultas sobre el mismo documento.
- Soporte de tool calling y function calling: no confirmado explícitamente en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no confirmado explícitamente en la información proporcionada.
- Capacidades multilingües: el corpus de calibración es multilingüe, pero no se declara la lista de idiomas soportados.

## Casos de uso

- Resumen por lotes de documentos extensos: con 262.144 tokens de contexto y un prefill medido de unos 480-525 tok/s a profundidades de 8K a 51K, el modelo puede procesar contratos, informes o expedientes completos en una sola pasada sin truncar.
- Extracción de información estructurada de corpus largos: la ventana completa permite localizar y extraer campos concretos en documentos de decenas de miles de tokens, con la caché de prefijo amortizando consultas sucesivas sobre el mismo texto.
- Procesamiento de documentos escaneados con visión: al conservar la torre visual, puede abordar PDFs e imágenes que requieran OCR implícito o comprensión de tablas y diagramas.
- Análisis de repositorios de código: la ventana de 262K admite varios ficheros fuente en contexto; el corpus de calibración incluye código multilingüe, lo que respalda tareas de revisión y explicación.
- Generación asistida en flujos de trabajo con contexto acumulado: la restauración de 49.152 tokens desde caché paginada en 2,5 ms hace viable encadenar preguntas sobre un mismo expediente sin repagar el prefill.
- Investigación sobre cuantización y arquitecturas MoE: el checkpoint documenta con precisión el efecto de la cuantización mixta y del modo PLE (mmap frente a resident) sobre el rendimiento, lo que lo convierte en material de referencia para estudiar el trade-off memoria/velocidad en Apple Silicon.
- Despliegue local en estaciones de trabajo Apple de gama alta: con 99,82 GiB en disco y un pico medido de 84,1 GB a 8K, encaja en equipos con 128 GiB de RAM unificada o más.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. Sí se documentan métricas de throughput medidas sobre un M2 Ultra de 128 GiB con modo PLE mmap, MTP activo y thinking on:

| Profundidad de prompt | Prefill (tok/s) | Decode (tok/s) | Pico de memoria |
|---|---:|---:|---:|
| 1.024 | 465,5 | 25,2 | 73,7 GB |
| 4.096 | 430,6 | 25,0 | 81,1 GB |
| 8.192 | 525,0 | 23,3 | 84,1 GB |
| 51.394 (documento real) | ~480 | 25,0 | no disponible |

Datos adicionales medidos: batching continuo a pp1024 con 50,7 tok/s agregados a 4x (escalado de 2,0x); resumen completo de un documento de 51K tokens (prefill más 1.709 tokens generados) en 175 s, frente a 617 s en oMLX 0.6.4; restauración de 49.152 tokens desde caché de prefijo en 2,5 ms, dejando 3.924 tokens por prefillar. La decodificación se mantiene prácticamente plana entre 1K y 51K en la versión 0.7.0.dev2. Como referencia de versión, en 0.6.4 la misma escalera en caliente daba 488,5 tok/s de prefill y 12,5 tok/s de decode a 8K. Advertencia del autor: el prefill en frío es mucho más lento (187 tok/s frente a 435,8 tok/s en caliente para la misma forma de 4.096 tokens).

## Requisitos de hardware

- VRAM/RAM unificada: el checkpoint ocupa 99,82 GiB en disco; la tabla PLE son 29,82 GiB y el resto de pesos 70,00 GiB siempre residentes. El pico medido en inferencia fue de 73,7 GB a 1K, 81,1 GB a 4K y 84,1 GB a 8K.
- Modo PLE: oMLX selecciona automáticamente `mmap` si el checkpoint supera el 70% de la RAM física (es decir, por debajo de ~143 GiB) y `resident` por encima. La fusión de shards PLE en un único embedding empaquetado requiere al menos 192 GiB de RAM física.
- GPU recomendadas: no aplica en el sentido habitual; está diseñado para Apple Silicon. Las mediciones se hicieron en un Mac Studio M2 Ultra de 128 GiB. El autor indica que en M3/M4/M5 conviene una build en bf16 en lugar de fp16. Para GPUs NVIDIA no se proporcionan datos.
- Cabe en GPU de consumo: no disponible para NVIDIA. En Apple Silicon requiere equipos con 128 GiB de memoria unificada o más para el modo mmap; el modo resident fusionado exige 192 GiB.
- Opciones de despliegue: MLX mediante oMLX (versión 0.7.0.dev2 recomendada para el modo PLE con gather-ahead). No se mencionan vLLM, llama.cpp, Ollama ni TGI para este checkpoint.
- Latencia y throughput: decode de 23-25 tok/s y prefill de 430-525 tok/s en M2 Ultra de 128 GiB; TPOT estable en 40-44 ms entre 1K y 8K en la versión 0.7.0.dev2.

## Comparativa con modelos similares

No se dispone de datos de benchmarks del modelo base ni de alternativas comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible. A modo de referencia estructural:

| Modelo | Parámetros | Contexto | Licencia | Formato/plataforma |
|---|---|---|---|---|
| Qwen3.8-Flash-Next (base) | ~180B (51,2B en tabla PLE) | 262.144 | Apache 2.0 | safetensors (upstream) |
| Qwen3.8-Flash-Next-oQ4e-fp16-mtp (esta ficha) | ~180B, cuantizado a 4/5 bits | 262.144 | Apache 2.0 | MLX safetensors, Apple Silicon |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada; al ser un modelo de propósito general cabe esperar los sesgos habituales de sus datos de preentrenamiento, no auditados aquí.
- Riesgo de alucinación: no evaluado; no hay benchmarks de fidelidad ni de tasa de alucinación publicados para esta build.
- Contexto e idioma: la ventana es amplia (262.144 tokens), pero el coste real está limitado por el tiempo de prefill, no por la memoria. No se declara la lista de idiomas soportados, por lo que el rendimiento fuera de los idiomas cubiertos por el corpus de calibración es incierto.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base upstream antes de desplegar en producción.
- Dependencia de plataforma: el checkpoint es exclusivamente MLX; no es portable a vLLM, llama.cpp ni GPUs NVIDIA sin reconversión.
- Advertencia de medición: los números de prefill en frío son engañosos (187 tok/s frente a 435,8 tok/s en caliente para la misma forma); cualquier evaluación debe hacerse con la caché PLE caliente.
- Modo resident fusionado sin probar: la configuración para la que se diseñó la arquitectura (192 GiB o más, con PLE fusionada) no fue validada en el equipo de pruebas; los benchmarks upstream se ejecutaron en un M3 Ultra de 512 GiB.
- Cobertura de calibración incompleta: 21 slots de expertos no recibieron muestras durante la calibración y usan cuantización estándar, lo que puede degradar ligeramente su comportamiento.
- Decodificación limitada: 23-25 tok/s hacen la build apta para procesamiento por lotes, pero poco cómoda para interacción en tiempo real con contextos profundos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Robot-Haus/Qwen3.8-Flash-Next-oQ4e-fp16-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio de la herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
- Model card original citada (usuario evsinlb): no disponible como URL verificable en la información proporcionada
