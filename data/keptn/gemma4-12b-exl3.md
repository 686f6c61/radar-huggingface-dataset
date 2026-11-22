# keptn/gemma4-12b-exl3

## Resumen

`keptn/gemma4-12b-exl3` es una cuantización de precisión mixta en formato EXL3-V3 del modelo multimodal `google/gemma-4-12B-it`, publicada por el usuario keptn. No es un modelo nuevo: es un artefacto de pesos optimizado para el motor de inferencia radiance sobre GPUs AMD RDNA4 (arquitectura ROCm), con capas lineales cuantizadas con trellis EXL3 entre 2,5 y 6,0 bits por peso y un embedding de tokens a 4 bits. El paquete incluye además la cabeza asistente de Gemma 4 (`gemma-4-12B-it-assistant`) para decodificación especulativa.

El modelo base resuelve tareas de imagen-a-texto y texto generativo con una ventana de contexto de 262.144 tokens, y esta versión comprimida lo hace desplegable en una sola tarjeta de 32 GB (probado en Radeon AI PRO R9700) o en dos con tensor parallelism. Su relevancia es doble: por un lado, lleva un modelo de 12.000 millones de parámetros multimodal a hardware consumer/workstation AMD con pérdida de calidad medida y documentada (KL media de 0,00277 a 0,0318 frente al bf16 original); por otro, ejemplifica el ecosistema emergente de cuantización EXL3 fuera de NVIDIA.

La ficha se basa exclusivamente en la model card del autor y en los metadatos de Hugging Face. Los datos de arquitectura interna del modelo base (número exacto de parámetros, composición del corpus de entrenamiento, alineamiento) no se detallan en la información disponible y se marcan como tales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto + visión) del modelo base Gemma 4 12B-it; capas lineales cuantizadas con EXL3-V3 trellis, codebook `mad` |
| Parametros totales | 12B (heredado del modelo base `google/gemma-4-12B-it`); desglose exacto no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens (`max-model-len: 262144`) |
| Tipos de cuantizacion | EXL3-V3 en cuatro variantes: 3.25 bpw (6,23 GiB), 4.07 bpw (7,27 GiB), 4.89 bpw (8,31 GiB) y 6.0 bpw (9,72 GiB); activaciones int8 `a8g128` en prefill de 512 filas o más; lm_head int8 con una escala bf16 por cada 128 pesos; embedding de tokens a 4 bits (tabla de 16 valores, escala bf16 por 128 pesos, transformada de Hadamard de 128 puntos) en memoria de host; vision tower en bf16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.rad` (formato propietario del motor radiance), cuatro ficheros; `config.json` incluido |
| Tamano del repositorio | 33,9 GB |
| Modelo base | `google/gemma-4-12B-it` (revisión `707f0a3b`) y `google/gemma-4-12B-it-assistant` (revisión `3b0b0a4a`) |
| Entradas | Texto e imagen |
| Decodificacion especulativa | Cabeza asistente de Gemma 4 (lm_head int8), 6 tokens de borrador con `draft-window: adaptive` |
| Version | 1.0 (2026-11-22) |

## Arquitectura y entrenamiento

Esta publicación no entrena un modelo: cuantiza el checkpoint bf16 de `google/gemma-4-12B-it`. El procedimiento, descrito paso a paso por el autor, es el siguiente: se parte del checkpoint bf16 y de la cabeza asistente; se calcula una matriz de Hessiano por cada capa lineal de los bloques transformer con el modelo bf16 en HF transformers, capa a capa, sobre un conjunto de calibración (el autor lo nombra pero no lo detalla en la información disponible); se cuantizan esas capas con EXL3-V3 (rad-exl3-mix de Hero422, exllamav3 1.6.3 con parches de Hero422) con codebook `mad` en 13 niveles uniformes de 2,5 a 6,0 bits por peso; y se empaqueta cada nivel con `rad-convert`.

La innovación técnica principal es la precisión mixta por capa: los ficheros de 3,25, 4,07 y 4,89 bpw asignan una anchura distinta a cada capa lineal, lo que según el autor reduce el KL entre un 22 % y un 29 % respecto a ficheros EXL3 uniformes del mismo tamaño (interpolando entre los dos tamaños uniformes adyacentes). Las dos lm_heads son int8 con una escala bf16 por cada 128 pesos, la torre de visión se mantiene en bf16 y el embedding de tokens se comprime a 4 bits con una transformada de Hadamard de 128 puntos, manteniéndose en memoria de host. La decodificación especulativa usa la cabeza asistente oficial de Google con ventana de borrador adaptativa.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat propia del modelo.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), con torre de visión en bf16.
- Ventana de contexto de 262.144 tokens; el pool KV configurado por el autor alberga 2.097.168 tokens en una tarjeta (2.097.216 en dos) con KV en i8, suficiente para 8 secuencias a longitud completa.
- Modo de razonamiento ("thinking") activable por petición mediante `chat_template_kwargs: {"enable_thinking": true}`.
- Decodificación especulativa con 6 tokens de borrador y ventana adaptativa, apoyada en la cabeza asistente de Gemma 4.
- Muestreo con los valores recomendados por Google: temperatura 1.0, top_p 0.95, top_k 64.
- Soporte de tool calling, function calling y razonamiento multi-paso: no disponible en la información proporcionada (el modelo base podría soportarlo, pero esta ficha no lo documenta).

## Casos de uso

- Despliegue local de un modelo multimodal de 12B en estaciones de trabajo AMD RDNA4: con el fichero de 4,89 bpw (8,31 GiB) cabe en una tarjeta de 16 GB y permite entrada de imagen y texto sin depender de servicios en la nube.
- Procesamiento de documentos largos con imagen y texto: la ventana de 262.144 tokens y el pool KV de más de 2 millones de tokens permiten analizar informes, contratos o expedientes completos con figuras incrustadas en una sola pasada.
- Asistentes conversacionales de atención al cliente: 8 secuencias concurrentes a longitud completa con KV en i8 hacen viable un servicio multi-usuario en una única GPU de 32 GB.
- Razonamiento con modo thinking en tareas analíticas: activando `enable_thinking` por petición se obtienen cadenas de razonamiento para problemas que requieren varios pasos, sin coste extra en las consultas simples.
- Generación asistida en flujos con latencia sensible: la decodificación especulativa con 6 tokens de borrador reduce el número de pasos de decodificación en texto predecible, útil en autocompletado o resumen interactivo.
- Evaluación e investigación de cuantización: los cuatro ficheros con KL medida frente al bf16 permiten estudiar el compromiso tamaño-calidad en hardware AMD y comparar con las variantes `a4`, `i8g` y `bf16` del mismo autor.
- Prototipado de aplicaciones imagen-a-texto en entornos ROCm: al no requerir CUDA, sirve para validar pipelines multimodales en clústeres AMD sin reescribir el motor de inferencia.

## Benchmarks y rendimiento

El autor publica una evaluación de divergencia (KL media y coincidencia del token top-1) frente al bf16 original en las 80 preguntas de MT-Bench con ambos turnos, sobre 42.283 tokens de respuesta, con una tarjeta, KV en i8 y thinking desactivado. La referencia es el bf16 en HF transformers con aritmética fp32 y vocabulario completo.

| Fichero | Tamano | KL media | Token top-1 identico |
|---|---|---|---|
| EXL3 3.25 bpw | 6,23 GiB | 0,0318 | 95,2 % |
| EXL3 4.07 bpw | 7,27 GiB | 0,0118 | 97,1 % |
| EXL3 4.89 bpw | 8,31 GiB | 0,00465 | 98,3 % |
| EXL3 6.0 bpw | 9,72 GiB | 0,00277 | 98,7 % |
| `keptn/gemma4-12b-a4` | 8,79 GiB | 0,0518 | 93,9 % |
| `keptn/gemma4-12b-i8g` | 13,79 GiB | 0,00542 | 97,9 % |
| `keptn/gemma4-12b-bf16` | 24,95 GiB | 0,00177 | 98,9 % |

Descomposición de la pérdida según el autor: el embedding de tokens a 4 bits añade como máximo 0,00023 al KL medio; las activaciones int8 añaden entre un 0,3 % y un 5,6 % (sin ellas, los cuatro ficheros miden 0,0317, 0,0111, 0,00447 y 0,00268). No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: entre 6,23 GiB y 9,72 GiB para los pesos según fichero, más el pool KV (i8) y la torre de visión en bf16; el embedding de tokens reside en memoria de host.
- GPUs probadas: una o dos Radeon AI PRO R9700 (32 GB cada una), arquitectura RDNA4.
- Recomendación del autor por fichero: 3,25 bpw para el menor ancho de banda por token; 4,07 bpw como término medio; 4,89 bpw por defecto para tarjetas de 16 GB; 6,0 bpw para tarjetas de 32 GB.
- Cabe en GPU consumer: sí, el fichero de 4,89 bpw está pensado para tarjetas de 16 GB; el de 3,25 bpw reduce aún más el requisito, aunque el autor no especifica el mínimo exacto.
- Despliegue: exclusivamente mediante el motor radiance, compilando desde la rama del PR #537 (que incluye el PR #401), ya que ninguna release los incorpora. Configuración YAML de ejemplo con `tp: 1` o `tp: 2` (más `p2p: on`), `kv-cache-dtype: i8`, `max-num-seqs: 8` y `max-num-batched-tokens: 2048`.
- Compatibilidad: no se menciona soporte en vLLM, llama.cpp, Ollama ni TGI; el formato `.rad` es específico de radiance.
- Latencia y throughput: no disponibles; el autor solo documenta la capacidad del pool KV (2.097.168 tokens en una tarjeta, 2.097.216 en dos, con 8 secuencias a longitud completa) según el informe de arranque de radiance 2.2.0.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Calidad (KL media) | Licencia | Hardware |
|---|---|---|---|---|---|---|
| `keptn/gemma4-12b-exl3` (4.89 bpw) | 12B | 262.144 | `.rad`, 8,31 GiB | 0,00465 | Apache 2.0 | AMD RDNA4, 16 GB |
| `keptn/gemma4-12b-i8g` | 12B | 262.144 | `.rad`, 13,79 GiB | 0,00542 | Apache 2.0 | AMD RDNA4 |
| `keptn/gemma4-12b-a4` | 12B | 262.144 | `.rad`, 8,79 GiB | 0,0518 | Apache 2.0 | AMD RDNA4 |
| `keptn/gemma4-12b-bf16` | 12B | 262.144 | `.rad`, 24,95 GiB | 0,00177 | Apache 2.0 | AMD RDNA4, 32 GB |
| `google/gemma-4-12B-it` (bf16) | 12B | 262.144 | safetensors (no confirmado) | referencia | Apache 2.0 | NVIDIA/AMD según framework |

La comparación más informativa es interna al propio autor: el fichero de 4,89 bpw ocupa un 40 % menos que el i8g con mejor KL (0,00465 frente a 0,00542), y el de 3,25 bpw ocupa un 29 % menos que el a4 con una KL notablemente inferior (0,0318 frente a 0,0518). Frente al bf16, el de 6,0 bpw sacrifica 0,001 de KL a cambio de reducir el tamaño un 61 %. No se dispone de comparaciones con cuantizaciones GGUF/AWQ de otros autores en la información proporcionada.

## Limitaciones y advertencias

- Dependencia estricta del motor radiance: requiere compilar desde la rama del PR #537 (con el PR #401); no funciona en releases estables ni en otros motores de inferencia.
- Exclusivo de GPUs AMD RDNA4 vía ROCm; no hay soporte documentado para NVIDIA ni para otras arquitecturas AMD.
- El formato `.rad` no es portable: no se puede cargar en transformers, vLLM, llama.cpp ni Ollama.
- Pérdida de calidad medible: incluso el fichero de 6,0 bpw diverge del bf16 (KL 0,00277, 98,7 % de coincidencia top-1); el de 3,25 bpw baja al 95,2 %, lo que puede acumular errores en generaciones largas o tareas sensibles a la precisión.
- Las activaciones int8 solo se aplican en prefill de 512 filas o más; el comportamiento en lotes pequeños no está documentado.
- La torre de visión permanece en bf16, por lo que el ahorro de memoria no se extiende a la parte visual.
- Riesgo de alucinación y sesgos del modelo base: no evaluados en la información disponible; la model card no incluye análisis de sesgo, toxicidad ni idiomas soportados.
- Idiomas soportados: no disponibles; no se puede confirmar el rendimiento multilingüe de esta cuantización.
- Licencia Apache 2.0 declarada por el autor de la cuantización; conviene verificar los términos del modelo base de Google antes de un uso comercial, ya que la ficha no reproduce la licencia original de Gemma.
- Repositorio sin descargas ni valoraciones en el momento de la consulta, lo que limita la validación independiente de las cifras de calidad.

## Enlaces

- Hugging Face: https://huggingface.co/keptn/gemma4-12b-exl3
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Cabeza asistente: https://huggingface.co/google/gemma-4-12B-it-assistant
- Variante a4: https://huggingface.co/keptn/gemma4-12b-a4
- Variante i8g: https://huggingface.co/keptn/gemma4-12b-i8g
- Variante bf16: https://huggingface.co/keptn/gemma4-12b-bf16
- Motor radiance: https://codeberg.org/StillDeadcode/radiance
- PR #401 de radiance: https://codeberg.org/StillDeadcode/radiance/pulls/401
- PR #537 de radiance: https://codeberg.org/StillDeadcode/radiance/pulls/537
- Guía de compilación de radiance: https://codeberg.org/StillDeadcode/radiance/src/branch/main/docs/DOCKER.md#build-the-image
- Guía de ejecución de radiance: https://codeberg.org/StillDeadcode/radiance/src/branch/main/docs/DOCKER.md#run-it
