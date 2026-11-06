# pentacoxian-dev/Qwen3.8-Flash-Next-GSQ-RCO-M64-GGUF

## Resumen

Qwen3.8-Flash-Next GSQ-RCO IQ3_XXS_M64_HC8 es una cuantización GGUF de un modelo de la familia Qwen3.8-Flash-Next, derivada del trabajo de cuantización de ISTA-DASLab. La publica el usuario pentacoxian-dev y está optimizada específicamente para Macs Apple Silicon con 64 GB de memoria unificada, con el objetivo de ejecutar el contexto completo de 262K tokens junto con decodificación especulativa MTP, visión y prefill acelerado por Neural Engine.

El modelo base es un transformer con mezcla de expertos (MoE, por la presencia de tensores `ffn_down_exps` y proyecciones de baja dimensión en los mezcladores de hiperconexión) del que no se detallan en la información disponible el número total de parámetros ni los parámetros activos. El repositorio pesa 91,6 GB y el primer shard de pesos ocupa 42,37 GiB, lo que sitúa el modelo en el rango de decenas de miles de millones de parámetros.

La relevancia de esta ficha es doble: por un lado, documenta una técnica de cuantización mixta (splicing de expertos entre cuantizaciones y requantización selectiva de proyecciones de hiperconexión a Q8_0) que mejora ligeramente la calidad respecto al archivo de referencia y acelera la decodificación en torno a un 10 %; por otro, ilustra el estado del arte en inferencia local de modelos grandes en hardware de consumo de Apple.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) e hiperconexiones de bajo rango (inferida de los tensores descritos); detalles completos no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | 262 144 tokens (262K) |
| Tipos de cuantización | IQ3_XXS mixta: IQ3_XXS base, con expertos enrutados de las capas 29, 30, 31 y 35 en Q2_0 (procedentes del archivo Q2_0 de ISTA) y 194 proyecciones de hiperconexión en Q8_0; resto sin cambios respecto a IQ3_XXS |
| Idiomas soportados | no disponible en la información proporcionada (los tests de calidad cubren C, prosa en inglés y prosa en japonés) |
| Licencia | qwen-community-1.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | GGUF, dividido en dos shards (el segundo, tabla n-gram de 28,8 GB, se comparte entre cuantizaciones) |

## Arquitectura y entrenamiento

La información disponible describe únicamente la arquitectura a nivel de tensores: se trata de un transformer MoE con expertos enrutados en las capas de feed-forward (`ffn_down_exps.weight`) y con mezcladores de hiperconexión que emplean proyecciones de baja dimensión (10240 → 320 y 320 → 10240) en 48 capas, más proyecciones equivalentes en la salida. El modelo incorpora además un bloque MTP (multi-token prediction) para decodificación especulativa, publicado por separado (1,5 GB), y un codificador de visión que se mapea en memoria solo durante la codificación de imágenes.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron fases de RLHF, DPO u otras técnicas de alineamiento. La innovación técnica documentada en esta ficha es la propia receta de cuantización: se sustituyen cuatro capas de expertos (`blk.29/30/31/35.ffn_down_exps.weight`) por las versiones Q2_0 del archivo de ISTA, elegidas porque son las que menos degradan la KL al sustituirlas individualmente, y se requantizan a Q8_0 las 194 proyecciones de hiperconexión (con error RMS relativo del 0,66 %). El resultado mantiene la KL frente a IQ3_S en 0,1795 (frente a 0,1834 de IQ3_XXS) y reduce el tiempo por token de decodificación de 22,4 ms a 20,6 ms en GPU.

## Capacidades

- Generación de texto y razonamiento de propósito general, heredados del modelo base Qwen3.8-Flash-Next.
- Generación de código: los tests de calidad incluyen secuencias de código C y el modelo base reporta LiveCodeBench 86,29 según ISTA.
- Capacidades multilingües: los tests de calidad cubren inglés y japonés; el listado completo de idiomas no está disponible.
- Visión: incluye un codificador de imágenes que se carga solo durante la codificación (76 GB en total con el codificador de visión según el launcher).
- Decodificación especulativa mediante bloque MTP, que eleva el throughput de decodificación de ~44-46 tok/s a ~52-53 tok/s en M3 Max.
- Contexto largo de 262K tokens, con caché KV de 8 bits (3,7 GiB a contexto completo).
- Prefill acelerado por Neural Engine en el fork ds4-flash-next (0,9 GiB reservados).
- Servidor compatible con API OpenAI (`/v1`) y panel de métricas (`/dashboard`) a través de `dstar serve`.
- Soporte de tool calling y comportamiento agéntico: no confirmado explícitamente en la información disponible, aunque el escenario de pruebas incluye un agente de código.

## Casos de uso

- Agentes de código en local sobre Mac: el modelo se ha medido con prompts de 8K tokens de un agente de codificación y decodifica a ~52 tok/s con MTP en un M3 Max, lo que permite iteraciones interactivas sin salir del portátil ni enviar código a la nube.
- Asistencia sobre repositorios completos: con 262K tokens de contexto y caché KV de 8 bits (3,7 GiB), cabe un repositorio mediano o varios archivos grandes en una sola ventana, útil para revisión de código y refactorizaciones guiadas.
- Procesamiento de documentación técnica multilingüe: los tests de calidad incluyen prosa en inglés y japonés, de modo que es adecuado para resumir y traducir documentación entre estos idiomas, con la cautela de que el soporte completo de idiomas no está documentado.
- Análisis de imágenes con texto: el codificador de visión permite extraer información de capturas, diagramas o documentos escaneados y continuar la conversación en texto, cargando el codificador solo durante la codificación para no consumir memoria de forma permanente.
- Desarrollo y depuración de kernels GGML/llama.cpp: el repositorio incluye las herramientas (`gguf_mix.py`, `gguf_requant_q8.py`) y la documentación de la receta, lo que lo convierte en un caso de estudio reproducible para experimentar con cuantización mixta y medir KL frente a una referencia.
- Despliegue de un endpoint compatible con OpenAI en una estación de trabajo Apple: `dstar serve` expone `http://127.0.0.1:8010/v1` con métricas, lo que permite conectar clientes existentes (SDK de OpenAI, LangChain, etc.) a un modelo local de contexto largo.
- Evaluación comparativa de cuantizaciones: los datos de KL, acuerdo top-1 y NLL publicados permiten usar este archivo como punto de referencia al probar otras recetas de cuantización sobre el mismo modelo base.

## Benchmarks y rendimiento

Calidad (KL frente a IQ3_S sobre seis secuencias de 2048 tokens: código C, prosa inglesa y prosa japonesa; la KL es una cota inferior sobre el top-128 de IQ3_S más un bucket residual):

| Archivo | KL media vs IQ3_S | Acuerdo top-1 | NLL |
|---|---|---|---|
| Q2_0 (ISTA) | 0,4380 | 78,9 % | 1,5867 |
| IQ3_XXS (ISTA) | 0,1834 | 85,7 % | 1,3435 |
| IQ3_XXS_M64 | 0,1835 | 85,5 % | 1,3426 |
| IQ3_XXS_M64_HC8 (este) | 0,1795 | 85,4 % | 1,3383 |

Frente a IQ3_XXS_M64, la KL media es de 0,011 con un 96,3 % de acuerdo top-1. Con 4 bits y redondeo simple, los mezcladores se degradaban hasta KL 0,2585 frente a IQ3_S.

Velocidad (M3 Max, GPU de 40 núcleos, fork del 2026-11-01, contexto de 40K, prompts de 8K, 256 tokens greedy, mejor de tres rondas alternas; aplicaciones de escritorio usando la GPU, con variación del 5-10 %):

| Archivo | Decodificación | Decodificación con MTP | Prefill |
|---|---|---|---|
| IQ3_XXS_M64 | 43,9 / 42,0 tok/s | 50,6 / 50,9 tok/s | 497 / 485 tok/s |
| IQ3_XXS_M64_HC8 | 46,1 / 47,8 tok/s | 53,0 / 52,4 tok/s | 489 / 500 tok/s |

Puntuaciones de benchmarks de tareas del modelo base según ISTA para IQ3_XXS: media de tareas 92,57 y LiveCodeBench 86,29. No se han ejecutado benchmarks sobre este archivo concreto.

## Requisitos de hardware

- Memoria: 42,37 GiB de pesos (primer shard) más 1,5 GB del bloque MTP; el segundo shard (tabla n-gram, 28,8 GB) permanece en el SSD y ds4 lee sus filas bajo demanda.
- Plan de memoria a 262K con MTP y Neural Engine: 51,4 GiB en total (43,8 de pesos y MTP, 3,7 de caché KV de 8 bits, 3,1 de buffers de prefill, 0,9 de Neural Engine).
- Límite del sistema: macOS permite por defecto 48 GiB de GPU de 64, lo que sostiene 32K de contexto; con `iogpu.wired_limit_mb=53248` se alcanzan 262K sin Neural Engine, y con 57344 MiB con él.
- Hardware objetivo: Macs Apple Silicon de 64 GB, concretamente M1 a M3 Max según el fork ds4-flash-next. Solo se han publicado mediciones en M3 Max (GPU de 40 núcleos).
- No cabe en GPUs de consumo con menos de 48 GB de VRAM; no hay datos de despliegue en A100, H100 o RTX 4090 en la información disponible.
- Software de despliegue: fork ds4-flash-next (launcher `dstar pull --quant iq3m8`, `dstar serve`, `--dry-run` para inspeccionar el comando). Con el ds4 upstream, el prefill va a la mitad de velocidad y la decodificación no mejora; en ese caso se recomienda IQ3_XXS_M64.
- Throughput medido: ~46-48 tok/s en decodificación, ~52-53 tok/s con MTP y ~490-500 tok/s de prefill en M3 Max a 40K de contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Calidad (KL vs IQ3_S) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| IQ3_XXS_M64_HC8 (este) | no disponible | 262K | 0,1795 | qwen-community-1.0 | GGUF, 2 shards, repo de 91,6 GB |
| IQ3_XXS_M64 (pentacoxian-dev) | no disponible | 262K | 0,1835 | qwen-community-1.0 | GGUF, mismo esquema de dos shards |
| IQ3_XXS (ISTA-DASLab) | no disponible | 262K | 0,1834 | qwen-community-1.0 | GGUF, referencia de calidad |
| Q2_0 (ISTA-DASLab) | no disponible | 262K | 0,4380 | qwen-community-1.0 | GGUF, menor tamaño, mayor degradación |

No se dispone de información sobre modelos de otros fabricantes comparables en tamaño o tarea dentro de la documentación proporcionada.

## Limitaciones y advertencias

- Cuantización agresiva: IQ3_XXS con cuatro capas de expertos en Q2_0 implica una degradación medible frente a IQ3_S (KL 0,1795, acuerdo top-1 del 85,4 %); no es adecuada si se requiere la fidelidad de una cuantización de 4-5 bits o superior.
- Dependencia del fork: las ventajas de velocidad (~10 % en decodificación) requieren los kernels Q8_0 de hiperconexión de ds4-flash-next; con ds4 upstream el prefill cae a la mitad y la decodificación no mejora.
- Dependencia de archivos externos: necesita el segundo shard de ISTA (28,8 GB) y el bloque MTP de paperniuk (1,5 GB); no es un paquete autónomo.
- Requisito de configuración del sistema: para 262K hay que ajustar `iogpu.wired_limit_mb` en cada arranque, lo que afecta a la memoria disponible para el resto del sistema.
- Cobertura de medición limitada: solo se ha medido en M3 Max; el rendimiento en M1, M2 u otras configuraciones no está verificado. Las cifras varían un 5-10 % según la carga de GPU de otras aplicaciones.
- Sin benchmarks propios: no se han ejecutado evaluaciones de tareas sobre este archivo; las cifras de 92,57 de media y 86,29 en LiveCodeBench corresponden a IQ3_XXS según ISTA.
- Idiomas: el soporte multilingüe no está documentado; las pruebas de calidad se limitan a inglés y japonés (además de código C).
- Sesgos y alucinaciones: no hay información específica sobre sesgos del modelo base ni sobre tasas de alucinación en la documentación disponible.
- Licencia: qwen-community-1.0 (etiquetada como `other`); es necesario revisar el archivo LICENSE del repositorio antes de un uso comercial, ya que las condiciones no se detallan en la información proporcionada.
- Repositorio con 0 descargas y 1 like en el momento de la consulta: no hay validación comunitaria independiente de los resultados publicados.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/pentacoxian-dev/Qwen3.8-Flash-Next-GSQ-RCO-M64-GGUF
- Modelo base de cuantización (ISTA-DASLab): https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Variante intermedia IQ3_XXS_M64: https://huggingface.co/pentacoxian-dev/Qwen3.8-Flash-Next-GSQ-RCO-IQ3_XXS_M64-GGUF
- Bloque MTP para decodificación especulativa: https://huggingface.co/paperniuk/Qwen3.8-Flash-Next-MTP-block
- Fork de inferencia ds4-flash-next: https://github.com/pentaCoxian/ds4-flash-next
- Proyecto ds4 original: https://github.com/paperniuk/ds4
