# hyperionaidev/Qwen3-Next-80B-A3B-phone-GGUF

## Resumen

Qwen3-Next-80B-A3B-phone-GGUF es una cuantización GGUF extrema del modelo Qwen3-Next-80B-A3B-Instruct de Alibaba Qwen, publicada por el usuario hyperionaidev dentro del proyecto smolmaxxing. El objetivo no es servir en producción, sino demostrar que un modelo MoE de 80 000 millones de parámetros totales puede ejecutarse en un teléfono Android de gama media de 2022 (OnePlus Nord CE 2, MediaTek Dimensity 900, 7,4 GB de RAM, sin root) a velocidades de 2,8-3,2 tokens por segundo. La receta combina expertos en Q2_K con el resto de tensores en Q4_K y una disposición de los expertos al final del archivo para permitir paginación desde flash.

El modelo base es un transformer con mezcla de expertos (MoE) de 79 674 391 296 parámetros totales y aproximadamente 3 000 millones activos por token (top-10 más un experto compartido sobre 512 expertos por capa, en 48 capas). Esta cuantización concreta ocupa 27,6 GB repartidos en dos shards GGUF estándar, con una huella de memoria pico en el teléfono de unos 5 GB y solo 1,5 GB de pesos residentes en RAM de forma permanente.

Su relevancia es doble: por un lado valida que llama.cpp con el parche smolmaxxing puede hacer streaming de expertos desde almacenamiento UFS 2.2 con una penalización de perplexidad mínima; por otro, sirve como referencia técnica de hasta dónde se puede comprimir un MoE de frontera antes de que la latencia de E/S domine por completo. No es un modelo pensado para uso general en servidor: es un artefacto de investigación reproducible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), 48 capas, 512 expertos por capa, top-10 más un experto compartido |
| Parametros totales | 79 674 391 296 |
| Parametros activos | Aproximadamente 3 000 millones por token (denominación A3B del modelo base) |
| Longitud de contexto | 1024 tokens en la configuración medida en el teléfono (`-c 1024`); el contexto nativo del modelo base no se detalla en la información disponible |
| Tipos de cuantizacion | Expertos en Q2_K (con `ffn_down_exps` en Q4_K en 6 de las 48 capas); resto de tensores en Q4_K; cabecera de salida completa con 151 936 filas |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (dos shards de 13 895 803 840 y 13 740 545 824 bytes; archivo sin dividir de 27 636 349 472 bytes) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen3-Next-80B-A3B-Instruct: un transformer MoE de 48 capas con 512 expertos por capa, enrutamiento top-10 más un experto compartido y un vocabulario de 151 936 tokens. Cada experto (gate, up, down) pesa aproximadamente 1,06 MB en esta cuantización. El modelo base fue entrenado por Alibaba Qwen; la información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

La innovación de esta ficha no está en el entrenamiento sino en el empaquetado y el runtime. Los expertos se colocan al final del archivo para que el paginador pueda leerlos bajo demanda desde flash, mientras que el resto de tensores permanece mapeado en memoria. Los expertos Q2_K provienen del `i1-Q2_K_S` con imatrix de mradermacher, copiados sin cambios; los tensores no-expertos se recuantizaron a Q4_K con la misma imatrix. El runtime requiere el parche smolmaxxing sobre llama.cpp, que implementa un paginador de expertos con pool configurable (`GGML_MOE_POOL`), sesgo de caché (`GGML_MOE_BIAS`), prefetch por capas (`GGML_MOE_PREFETCH_K`, `GGML_MOE_PREFETCH_AHEAD`) y lectores concurrentes (`GGML_MOE_READERS`). Sin el parche, el archivo completo se mapea en memoria y las velocidades medidas no se alcanzan.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Instruct.
- Razonamiento y matemáticas a nivel del modelo base, sujeto a la degradación introducida por la cuantización Q2_K de los expertos.
- Generación de código, con perplexidad medida sobre texto mixto en inglés y código (7,45 en la configuración de calidad completa).
- Soporte de tool calling y function calling: no confirmado explícitamente en la información disponible para esta cuantización; el modelo base lo soporta, pero la compresión puede degradarlo.
- Capacidades de agente y razonamiento multi-paso: no verificadas en esta cuantización.
- Multilingüismo: no disponible; el modelo base es multilingüe, pero no se documenta el comportamiento tras la cuantización.
- Modo thinking: no documentado en la información disponible.
- Ejecución en Android sin root mediante llama.cpp compilado estáticamente para aarch64.

## Casos de uso

- Investigación sobre inferencia en el borde: reproducir el experimento completo en un teléfono de gama media para medir el impacto del paginado de expertos desde UFS 2.2, usando los scripts `tools/q36-phone.sh` y `tools/gguf_split_adb.py` del repositorio smolmaxxing.
- Validación de pipelines de cuantización MoE: servir como referencia de cómo combinar Q2_K para expertos y Q4_K para el resto sin destruir la perplexidad (7,45 con enrutamiento intacto frente a 7,48 con sesgo de caché de 0,005).
- Demostraciones de viabilidad en dispositivos sin GPU: prototipos de asistentes locales en Android que no pueden permitirse un servidor, aceptando latencias de 2,8-3,2 tok/s para respuestas cortas.
- Benchmarking de parches de llama.cpp: comparar el rendimiento del paginador smolmaxxing frente al mapeo completo del archivo en el mismo hardware, con métricas de fallos de caché (13,0 % con enrutamiento intacto, 10,1 % con sesgo).
- Estudio de compromisos memoria-calidad: analizar la curva entre expertos residentes en RAM (48 frente a 56 por capa), sesgo de caché y perplexidad resultante, con incrementos de aproximadamente 51 MB por paso de pool.
- Educación técnica: material didáctico sobre arquitecturas MoE, cuantización GGUF y límites prácticos del almacenamiento flash como nivel de memoria para pesos.

## Benchmarks y rendimiento

Mediciones realizadas en un OnePlus Nord CE 2 (Dimensity 900, 2 núcleos Cortex-A78 + 6 Cortex-A55, 7,4 GB de RAM, UFS 2.2, Android 13, sin root), con 2 hilos fijados a los A78, prefetch de expertos dos capas por delante y generación de 2 prompts × 160 tokens con penalización de repetición 1,15.

| Expertos en RAM por capa | Sesgo de caché | tok/s | Fallos de caché | Perplejidad | RSS pico |
|---|---|---|---|---|---|
| 48 | 0 (calidad completa) | 2,8 | 13,0 % | 7,45 | 5,1 GB |
| 48 | 0,005 | 3,1 | 10,1 % | 7,48 (+0,4 %) | 4,7 GB |
| 56 | 0,005 | 3,2 | 9,3 % | (igual que arriba) | 5,0 GB |

La perplejidad se midió sobre 20 fragmentos de 128 tokens de texto reservado en inglés y código (2 560 tokens puntuados), en micro-lotes de 4. El autor advierte que no es comparable con la del modelo hermano de 35B (7,63) porque usan tokenizadores distintos (151K frente a 248K tokens). No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: aproximadamente 5 GB de RSS pico en el dispositivo medido; unos 1,5 GB de pesos residentes de forma permanente y el resto paginado desde flash.
- Almacenamiento: 27,6 GB para los dos shards, más unos 27 GB adicionales si se genera la caché de repack (`GGML_REPACK_CACHE`).
- GPU recomendadas: no aplica al escenario objetivo; el experimento se ejecuta en CPU. Para servir el modelo sin paginado haría falta un equipo con al menos 28 GB de memoria mapeable, dato no medido en la información disponible.
- ¿Cabe en GPU de consumo? El archivo completo de 27,6 GB no cabe en GPUs de 24 GB (RTX 4090) sin paginado; con el parche smolmaxxing el requisito pasa a ser almacenamiento rápido y unos 5 GB de RAM.
- Opciones de despliegue: llama.cpp con soporte `qwen3next` y el parche smolmaxxing (compilación estática aarch64 para Android); `llama-server` con flags `-fa on`, `-ctk q8_0`, `-ctv q8_0`, `-ub 4`, `-b 64`, `-t 2`, `-C 0xC0`, `--cpu-strict 1`. Sin el parche, cualquier llama.cpp con soporte Qwen3-Next puede cargar el archivo, pero con mapeo completo en memoria.
- Latencia y throughput: 2,8-3,2 tok/s en el hardware medido; no hay datos de throughput en otros dispositivos.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| Qwen3-Next-80B-A3B-phone-GGUF (esta ficha) | 79,7 B | ~3 B | 1024 en la config. medida | Apache 2.0 | GGUF en HF, 27,6 GB | Cuantización Q2_K/Q4_K para móvil con paginado de expertos |
| Qwen3-Next-80B-A3B-Instruct (base) | 79,7 B | ~3 B | No disponible en la información | Apache 2.0 | Pesos originales en HF | Modelo de referencia sin cuantizar; requiere hardware de servidor |
| Qwen3.6-35B-A3B-phone-GGUF (hermano del mismo autor) | No disponible | No disponible | No disponible | No disponible | GGUF en HF | Según el autor, más rápido y mejor opción diaria en el mismo teléfono; perplejidad 7,63 con tokenizador distinto |
| mradermacher/Qwen3-Next-80B-A3B-Instruct-i1-GGUF | 79,7 B | ~3 B | No disponible | Apache 2.0 | GGUF en HF | Fuente de los tensores Q2_K y de la imatrix usada en esta receta |

## Limitaciones y advertencias

- La cuantización Q2_K de los expertos degrada la calidad respecto al modelo base; la perplejidad de 7,45 no es directamente comparable con la del modelo original sin cuantizar.
- El rendimiento de 2,8-3,2 tok/s es adecuado solo para demostraciones y respuestas cortas; no es viable para uso interactivo exigente.
- El contexto configurado en las pruebas es de 1024 tokens; ampliarlo incrementa la presión de memoria y puede degradar el rendimiento del paginador.
- Las velocidades medidas dependen del parche smolmaxxing; sin él, el archivo completo se mapea en memoria y el comportamiento en un teléfono de 7,4 GB no está documentado como funcional.
- El sesgo de caché de 0,005 introduce un incremento de perplejidad del 0,4 %; es un compromiso explícito entre velocidad y calidad.
- No hay información sobre sesgos, tasas de alucinación ni comportamiento multilingüe específicos de esta cuantización.
- El modelo tiene 0 descargas y 1 like en el momento de la ficha; no hay evidencia de uso en producción ni validación independiente.
- La licencia Apache 2.0 permite uso comercial, pero la calidad tras Q2_K en los expertos hace desaconsejable su uso en producción sin una evaluación propia.
- El repositorio se creó y actualizó el mismo día (13 de noviembre de 2026), lo que sugiere un artefacto experimental sin mantenimiento posterior documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hyperionaidev/Qwen3-Next-80B-A3B-phone-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-Next-80B-A3B-Instruct
- Modelo hermano de 35B: https://huggingface.co/hyperionaidev/Qwen3.6-35B-A3B-phone-GGUF
- Fuente de los expertos Q2_K: https://huggingface.co/mradermacher/Qwen3-Next-80B-A3B-Instruct-i1-GGUF
- Proyecto smolmaxxing: https://github.com/hyperionaidev/smolmaxxing
- Documentación para teléfono: https://github.com/hyperionaidev/smolmaxxing/blob/main/docs/phone.md
- Write-up del experimento: https://github.com/hyperionaidev/smolmaxxing/blob/main/EXPERIMENT.md
- Guía de compilación para Android/TV-box: https://github.com/hyperionaidev/smolmaxxing/blob/main/docs/tv-box-setup.md#1-build-llamacpp-with-the-patch
- Script de empaquetado: https://github.com/hyperionaidev/smolmaxxing/blob/main/tools/q36-phone.sh
- Script de división de shards: https://github.com/hyperionaidev/smolmaxxing/blob/main/tools/gguf_split_adb.py
