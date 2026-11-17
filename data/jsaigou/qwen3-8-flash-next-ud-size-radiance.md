# jsaigou/Qwen3.8-Flash-Next-UD-Size-radiance

## Resumen

Qwen3.8-Flash-Next es un modelo de mezcla de expertos (MoE) con 256K de contexto desarrollado por Qwen (Alibaba). Esta ficha describe una conversión no oficial publicada por el usuario jsaigou en Hugging Face: un contenedor `.rad` de 84,37 GiB pensado para el motor de inferencia Radiance sobre una máquina AMD Strix Halo con 128 GB de memoria unificada. No es un modelo nuevo ni un fine-tuning: es una política de tamaño por capa derivada del mapa de cuantización Unsloth Dynamic v3.1 aplicada sobre el checkpoint bf16 oficial.

El interés técnico de esta publicación es doble. Por un lado, demuestra cómo reducir un MoE de gran tamaño para que quepa en hardware de consumo de gama alta con memoria unificada (APU AMD Ryzen AI MAX+ 395, gfx1151) manteniendo un rendimiento medido de 91,2 tokens por segundo en agregado con tres secuencias simultáneas de 131K tokens. Por otro, documenta explícitamente el proceso de conversión, las métricas de divergencia respecto al contenedor de referencia y las limitaciones de la comparación.

Es importante subrayar que este contenedor no carga en transformers, GGUF ni llama.cpp: requiere una bifurcación no oficial del motor Radiance (etiqueta `strix-halo-r2`, commit `a16657e`) compilada para gfx1151 con ROCm 10.1. La licencia aplicable es la Qwen Community License 1.0 del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) con capa MTP y torre de visión; capas de expertos nativas y rotadas |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (256K) en el modelo base; configurado a 131.072 en las pruebas del autor |
| Tipos de cuantizacion | Política de tamaño por capa: `w3nl64a8h`, `w4nl64a8h`, `w5nl64a8h`, IQ2_S/Q2_0 nativos en capas 0, 8, 9 y 10; embedding IQ4_XS; capa MTP `w4nl64`; torre de visión bf16 |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (etiqueta `other` en el repo) |
| Formato de pesos | `.rad` (contenedor propietario del motor Radiance), fichero `flash-size.rad` de 90.593.767.424 bytes |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con ventana de contexto de 256K, según la model card. La información disponible no detalla el número de parámetros totales ni activos, la composición del dataset de entrenamiento, el número de tokens vistos ni si se aplicaron etapas de RLHF o DPO. Sí se menciona la existencia de una capa MTP (multi-token prediction) y de una torre de visión, lo que confirma capacidades multimodales de entrada.

La conversión publicada no entrena nada: reconstruye los pesos del checkpoint bf16 oficial (revisión `812d96e10a0dd82b69d749e68693698cf6c36daa`) asignando a cada tensor una precisión concreta según el mapa de Unsloth Dynamic v3.1 (`UD-Q3_K_XL`). El resultado mezcla capas de expertos nativas y rotadas, lo que exige el arreglo de plugin introducido en `strix-halo-r1`. La herramienta de conversión es `rad-convert` con `tools/ud_map --policy size`, del fork de Radiance.

## Capacidades

- Generación de texto y razonamiento de propósito general, con modo de pensamiento (thinking) presente en el modelo base, aunque el autor indica que no ejecutó conjuntos de evaluación específicos de thinking mode.
- Procesamiento de imágenes mediante torre de visión conservada en bf16.
- Capacidad declarada de tool calling: el conjunto de evaluación del autor incluye pruebas de tool-calling, con 784 aciertos sobre 835 prompts.
- Razonamiento matemático y de sentido común evaluado vía GSM8K, ARC y MMLU en el conjunto del autor.
- Contexto largo: soporta hasta 262.144 tokens en el modelo base; el contenedor se probó con secuencias de 131K y 262K.
- Decodificación especulativa con profundidad 2 (`--num-speculative-tokens 2`), que el motor explota para acelerar la generación.
- Capacidades multilingües: no disponibles en la información proporcionada; el autor no ejecutó conjuntos en japonés.

## Casos de uso

- Inferencia local de contexto largo en estación de trabajo: con 128 GB de memoria unificada y el motor Radiance, el contenedor permite servir tres secuencias simultáneas de 131K tokens a 91,2 tok/s agregados, adecuado para análisis de documentos extensos o bases de código completas sin salir del equipo.
- Asistentes de código con ventana amplia: la combinación de contexto de 256K y tool calling permite indexar repositorios medianos y responder consultas con referencias cruzadas entre ficheros, ejecutando el modelo en una APU AMD de gama alta.
- Procesamiento de documentación técnica con imágenes: la torre de visión en bf16 permite extraer información de diagramas, capturas y tablas escaneadas junto al texto circundante en una sola pasada.
- Evaluación de modelos MoE en hardware AMD: sirve como banco de pruebas reproducible para medir latencia y throughput de un MoE grande sobre gfx1151 con ROCm 10.1, con puntos de medida documentados (2×131K a 66,2 tok/s, 2×262K a 55,1 tok/s, 3×262K a 76,5 tok/s).
- Prototipado de pipelines agénticos multi-paso: el soporte de tool calling y el modo thinking permiten encadenar llamadas a herramientas en local, con latencias medidas de 1,4 s para prompts cortos y 20 s para prompts de 10K tokens incluyendo razonamiento.
- Investigación sobre cuantización selectiva: el contenedor y su documentación (`docs/RAD-FILES.md`, `docs/FORK-KERNELS.md`) permiten estudiar el impacto de políticas de precisión por capa comparando la divergencia KL frente al contenedor exacto de Unsloth.
- Despliegue de un servicio interno de Q&A sobre corpus privado: al ejecutarse íntegramente en local y bajo licencia Qwen Community 1.0, es apto para uso interno sin exponer datos a terceros, siempre que se respeten los términos de la licencia.

## Benchmarks y rendimiento

El autor no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) del modelo base. Los datos disponibles son métricas de calidad de la conversión y de velocidad, medidas por el propio autor.

| Metrica | Valor |
|---|---|
| Divergencia KL media vs. contenedor UD de Unsloth (1.575.352 posiciones, contexto 8K) | 0,2090 |
| Divergencia KL mediana | 0,0547 |
| Divergencia KL p99 | 2,15 |
| Ratio de perplejidad vs. contenedor UD | 0,949 |
| Acuerdo top-1 vs. contenedor UD | 83,53% |
| Aciertos en 835 prompts (ARC, GSM8K, MMLU, tool-calling) | 784 (93,9%) frente a 777 (93,1%) del contenedor UD exacto; McNemar p = 1,0 |
| Aciertos en conjunto de 60 items | 59/60 en ambos contenedores |
| Throughput, 3 secuencias × 131K tokens, profundidad especulativa 2, KV `k6_v4` | 91,2 tok/s agregados |
| Throughput, 2 secuencias × 131K tokens | 66,2 tok/s |
| Throughput, 2 secuencias × 262K tokens | 55,1 tok/s |
| Throughput, 3 secuencias × 262K tokens | 76,5 tok/s |
| Latencia, prompt corto (vía router) | 1,4 s |
| Latencia, prompt de 10K tokens con thinking | 20 s |

No se ejecutó referencia en FP8 ni bf16 (los pesos FP8 oficiales ocupan unos 173 GiB), por lo que el autor no reclama equivalencia con FP8, sino paridad con el contenedor UD exacto en el conjunto evaluado, con una cola de divergencia no medida.

## Requisitos de hardware

- Memoria: unos 93 GiB de memoria unificada para el contenedor más tres secuencias de 131K tokens; con sistema operativo y otros servicios, la máquina usó 114 de 123,5 GiB. Requiere una máquina de clase 128 GB.
- GPU/APU probada: AMD Ryzen AI MAX+ 395 con gfx1151 y ROCm 10.1. Es el único hardware en el que el autor ha validado el contenedor.
- GPU dedicadas: no disponible; el autor no documenta pruebas en A100, H100 ni RTX 4090, y el tamaño del contenedor (84,37 GiB) excede la VRAM de cualquier GPU de consumo actual.
- Cabe en GPU de consumo: no. El contenedor no entra en tarjetas de 24 GB ni de 48 GB; requiere memoria unificada de 128 GB o GPUs profesionales con 80 GB o más, sin validación documentada en estas últimas.
- Motor de despliegue: exclusivamente la bifurcación no oficial de Radiance (`https://github.com/jsaigou/radiance`, etiqueta `strix-halo-r2`, commit `a16657e` o posterior de la misma línea). No es compatible con vLLM, llama.cpp, Ollama, TGI ni transformers.
- Comando de referencia: `RADIANCE_HOME=<build>/radiance_home RADIANCE_KERNELS=libhalo radiance --model flash-size.rad --tp 1 --max-model-len 131072 --max-num-seqs 3 --num-speculative-tokens 2 --kv-cache-dtype k6_v4`.
- Throughput y latencia: ver tabla de benchmarks; los valores corresponden a la APU citada con las opciones indicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware objetivo | Notas |
|---|---|---|---|---|---|---|
| Este contenedor (`jsaigou/Qwen3.8-Flash-Next-UD-Size-radiance`) | no disponible | 256K (probado a 131K y 262K) | `.rad` | Qwen Community 1.0 | AMD Strix Halo 128 GB, gfx1151 | Política de tamaño por capa; 84,37 GiB; requiere fork de Radiance |
| `unsloth/Qwen3.8-Flash-Next-GGUF` (UD-Q3_K_XL) | no disponible | 256K | GGUF | Qwen Community 1.0 | CPU/GPU con llama.cpp y derivados | Mapa de cuantización de referencia usado por este contenedor; sirve como base de comparación de calidad |
| `Qwen/Qwen3.8-Flash-Next` (bf16) | no disponible | 256K | safetensors | Qwen Community 1.0 | GPUs de datacenter | Checkpoint oficial de referencia |
| `Qwen/Qwen3.8-Flash-Next` (FP8) | no disponible | 256K | safetensors | Qwen Community 1.0 | GPUs de datacenter | Pesos de unos 173 GiB según el autor; no usado como referencia en las pruebas |

No se dispone de datos para comparar con modelos de otros fabricantes de tamaño o tarea equivalentes.

## Limitaciones y advertencias

- Conversión no oficial: el contenedor lo construye y prueba un tercero (jsaigou), no Qwen ni Unsloth. No hay garantía de equivalencia con el modelo original.
- No es una copia sin pérdida: los tensores IQ3_XXS, IQ4_NL/IQ4_XS y Q5_0 se transforman a formatos `w3nl64a8h`, `w4nl64a8h` y `w5nl64a8h`; la divergencia KL media es 0,2090 con una cola p99 de 2,15, que el propio autor califica de grande.
- Sin referencia FP8 ni bf16: la afirmación de calidad se limita a paridad con el contenedor UD exacto en 835 prompts; no se ha medido la degradación frente a los pesos originales.
- Evaluación incompleta: no se ejecutaron conjuntos en japonés ni de thinking mode; los idiomas soportados no están documentados.
- Compatibilidad restringida: solo funciona con la bifurcación de Radiance indicada, compilada para gfx1151 con ROCm 10.1. No carga en transformers, GGUF, llama.cpp, vLLM, Ollama ni TGI. El Radiance 2.x upstream no sirve este contenedor.
- Hardware muy específico: requiere una máquina de clase 128 GB de memoria unificada; no está pensado para equipos más pequeños y no hay validación en GPUs dedicadas.
- Licencia Qwen Community 1.0: los productos o servicios con más de 100 millones de usuarios activos mensuales o 20 millones de dólares de ingresos mensuales deben mostrar de forma destacada el nombre del modelo; quien opere un servicio Model-as-a-Service o AI Work Assistant necesita una licencia comercial separada de Qwen (el uso interno está exento). El fichero `LICENSE` debe acompañar a toda copia.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; deben asumirse los del modelo base.
- Sin garantía: el autor declara explícitamente ausencia de garantía y uso bajo responsabilidad del usuario.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jsaigou/Qwen3.8-Flash-Next-UD-Size-radiance
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Cuantización de referencia de Unsloth: https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Fork de Radiance (motor requerido): https://github.com/jsaigou/radiance
- Documentación de formatos del fork: https://github.com/jsaigou/radiance/blob/unofficial-fixes/docs/RAD-FILES.md
- Documentación de kernels del fork: https://github.com/jsaigou/radiance/blob/unofficial-fixes/docs/FORK-KERNELS.md
- Proyecto Radiance original: https://codeberg.org/StillDeadcode/radiance
