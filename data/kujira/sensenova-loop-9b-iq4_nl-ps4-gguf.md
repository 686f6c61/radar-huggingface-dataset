# Kujira/SenseNova-Loop-9B-IQ4_NL-PS4-GGUF

## Resumen

SenseNova-Loop-9B-IQ4_NL-PS4-GGUF es una cuantización IQ4_NL del modelo SenseNova-Loop-9B, publicada por el usuario Kujira. El modelo base pertenece a la familia SenseNova de SenseTime y emplea una arquitectura denominada "Loop" que no está integrada en el llama.cpp upstream, sino en el fork OpenSenseNova/llama.cpp. Esta variante concreta se ha optimizado para ejecutarse mediante Vulkan sobre la GPU GCN2 de una PlayStation 4, un escenario de despliegue atípico que ilustra la portabilidad del formato GGUF.

La cuantización utiliza una importance matrix (imatrix) calculada sobre la propia PS4 a partir del Q4_K_M oficial, con texto de calibración en inglés, japonés y chino. El resultado es un fichero de 4.959 MiB que iguala en perplejidad al Q4_K_M oficial (14,84 frente a 14,87 en wikitext-2) y que, según el autor, alcanza 9,2 tok/s en la GPU de la PS4 frente a 6,9 tok/s del Q4_K_M con el mismo código.

Es relevante como ejemplo de cuantización guiada por hardware: el autor demuestra que IQ4_NL decodifica de forma más barata que Q4_K_M en GCN2 porque ese hardware está limitado por el trabajo de desquantización y no por el número de bits. La licencia es Apache-2.0, heredada del modelo base. Los datos de parámetros publicados en Hugging Face (2.952.344) no son coherentes con un modelo de 9B y deben tratarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SenseNova Loop (transformer con cabecera MTP; no soportada en llama.cpp upstream) |
| Parametros totales | 9B segun el nombre del modelo; el campo de safetensors de HF indica 2.952.344 (dato no coherente, tratar con cautela) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la evaluacion de perplejidad se hizo con contexto de 512 tokens) |
| Tipos de cuantizacion | IQ4_NL (matrices grandes, `attn_qkv_gate`, `output`), Q6_K (`attn_v`), Q4_K (`token_embd`), F32 (routers mHC) |
| Idiomas soportados | en, zh, ja |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (fichero `SenseNova-Loop-9B-IQ4_NL-ps4c.gguf`, 4.959 MiB) |

## Arquitectura y entrenamiento

El modelo base SenseNova-Loop-9B emplea una arquitectura propia de SenseTime denominada "Loop", que incluye routers mHC (mantenidos en F32 en esta cuantizacion) y una cabecera MTP (multi-token prediction) ubicada en el bloque `blk.56`, que se incluye en el fichero. La arquitectura no está presente en llama.cpp upstream, por lo que requiere el fork OpenSenseNova/llama.cpp; para el soporte Vulkan en PS4 se usa el fork de balaena01 (rama `ps4-vulkan`) con kernels mHC fusionados.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base. Respecto a esta cuantización, el autor documenta el proceso: parte del GGUF BF16 oficial (sha256 `489f1a43...cb6d81cd`), calcula la imatrix en la GPU de la PS4 a partir del Q4_K_M oficial con 100 chunks de 512 tokens, usando como calibración `calibration_datav3` de bartowski (inglés) intercalado con texto de Wikipedia en japonés y chino. Se evita Q5_K porque, según el autor, cuelga y es lento en la GPU de la PS4.

## Capacidades

- Generación de texto en inglés, chino y japonés.
- Razonamiento y decodificación autoregresiva estándar de un modelo de 9B; no se documentan modos especiales (thinking, visión o audio) en la información disponible.
- Cabecera MTP (multi-token prediction) incluida en `blk.56`, aunque el autor indica que el borrador MTP no resultó más rápido en la PS4.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Despliegue en cualquier backend compatible con GGUF que soporte la arquitectura Loop (OpenSenseNova/llama.cpp; fork con Vulkan para PS4).

## Casos de uso

- Inferencia en hardware de consumo antiguo: el fichero de 4.959 MiB permite ejecutar un modelo de 9B en GPUs con poca VRAM o en hardware no convencional, como la GPU GCN2 de una PS4 vía Vulkan, a 9,2 tok/s según el autor.
- Experimentación con cuantizaciones guiadas por hardware: sirve como referencia para estudiar cómo IQ4_NL reduce el coste de desquantización frente a Q4_K_M en GPUs limitadas por esa operación.
- Procesamiento multilingüe ligero (en/zh/ja): útil para tareas de generación de texto y resumen en esos tres idiomas en entornos con recursos restringidos.
- Pruebas de compatibilidad de la arquitectura Loop: permite validar el fork OpenSenseNova/llama.cpp y los kernels mHC fusionados antes de desplegar el modelo completo en BF16.
- Prototipado local sin GPU dedicada: al caber en menos de 5 GiB, se puede cargar en sistemas con memoria unificada o GPUs integradas que soporten Vulkan.
- Evaluación de calidad de cuantización: la perplejidad publicada (14,84 ± 0,65 en wikitext-2) permite comparar el impacto de la cuantización frente al Q4_K_M oficial (14,87 ± 0,65) en un pipeline de validación.

## Benchmarks y rendimiento

| Metrica | Q4_K_M oficial | IQ4_NL PS4 (este modelo) |
|---|---|---|
| Tamano del fichero | 5.549 MiB | 4.959 MiB |
| wikitext-2 PPL (ctx 512, 24 chunks) | 14,87 ± 0,65 | 14,84 ± 0,65 |
| Throughput en GPU PS4 (GCN2) | 6,9 tok/s | 9,2 tok/s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: en torno a 5 GiB para el fichero de pesos; se recomienda margen adicional para el contexto y los buffers de cómputo.
- GPU recomendadas: el caso documentado es la GPU GCN2 de la PlayStation 4 mediante Vulkan. Para el resto de backends, cualquier GPU compatible con el fork OpenSenseNova/llama.cpp.
- GPU de consumo: cabe en tarjetas con 6-8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060) siempre que el backend soporte la arquitectura Loop.
- Despliegue: requiere OpenSenseNova/llama.cpp; para PS4, el fork de balaena01 (rama `ps4-vulkan`). No es compatible con llama.cpp upstream ni, por tanto, con las distribuciones estándar de Ollama o vLLM que dependan de él.
- Latencia y throughput: 9,2 tok/s en la GPU de la PS4 con el código del autor; no hay datos para otras GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SenseNova-Loop-9B-IQ4_NL-PS4 (este) | 9B (nominal) | no disponible | Apache-2.0 | GGUF, requiere fork OpenSenseNova/llama.cpp |
| SenseNova-Loop-9B-GGUF (Q4_K_M oficial) | 9B (nominal) | no disponible | Apache-2.0 | GGUF, requiere fork OpenSenseNova/llama.cpp |
| Modelos de 9B de propósito general (p. ej. Gemma 2 9B, Qwen 2.5 7B) | 7-9B | 8K-128K segun modelo | licencias propias | GGUF, soporte en llama.cpp upstream |

No se dispone de datos de rendimiento comparativo con modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- La arquitectura Loop no está en llama.cpp upstream: sin el fork OpenSenseNova/llama.cpp el modelo no carga.
- El campo de parámetros de Hugging Face (2.952.344) contradice el tamaño nominal de 9B; conviene verificar el modelo base antes de usarlo en producción.
- El repositorio figura con 0 descargas y 0 likes, y el tamaño reportado es 0.0 GB: es una publicación reciente y sin validación comunitaria.
- La evaluación de calidad se limita a perplejidad en wikitext-2 con 24 chunks de 512 tokens; no hay benchmarks de tareas ni evaluación de sesgos o alucinación.
- El soporte multilingüe declarado es en/zh/ja; no se documenta el rendimiento en castellano.
- El autor advierte que Q5_K cuelga y es lento en la GPU de la PS4; la combinación de tipos de tensor está ajustada a ese hardware y puede no ser óptima en otras GPUs.
- La cabecera MTP está incluida pero no aportó aceleración en las pruebas del autor en PS4.
- Licencia Apache-2.0: permite uso comercial, pero al derivar del modelo base conviene revisar también las condiciones del SenseNova-Loop-9B original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kujira/SenseNova-Loop-9B-IQ4_NL-PS4-GGUF
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B-GGUF
- Fork de llama.cpp con soporte de la arquitectura: https://github.com/OpenSenseNova/llama.cpp
- Fork con soporte Vulkan para PS4 (rama `ps4-vulkan`): https://github.com/balaena01/llama.cpp
- Vídeo de demostración en PS4: https://x.com/balaena01/status/2123348644091048255
