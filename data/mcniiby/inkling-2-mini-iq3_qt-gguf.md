# McNiiby/Inkling-2-Mini-IQ3_QT-GGUF

## Resumen

Inkling-2-Mini-IQ3_QT-GGUF es una cuantización de 3 bits del modelo Thinking Machines Inkling-2-Mini, publicada por el usuario McNiiby. El modelo base es un transformer de tipo Mixture-of-Experts (MoE) con 128 expertos y 25.970.462.976 parámetros totales, distribuido bajo licencia Apache-2.0. Su propósito es permitir la ejecución del modelo completo en GPUs de consumo con 16 GB de VRAM, manteniendo una ventana de contexto de hasta 128K tokens.

La relevancia de esta ficha radica en que el archivo GGUF emplea un tipo de cuantización propietario (IQ3_QT, basado en trellis) que solo carga en un fork específico y no mantenido de ik_llama.cpp, lo que condiciona por completo su despliegue. No es compatible con llama.cpp estándar, Ollama ni LM Studio. El autor reporta una velocidad de decodificación de aproximadamente 179 tok/s en una RTX 5070 Ti y una perplejidad de 6.549 en wikitext-2, ligeramente peor que la referencia BF16 (6.411).

El modelo está orientado a generación de texto conversacional en inglés, con soporte de modo de razonamiento (thinking) configurable mediante el chat template. Su utilidad práctica está limitada por la dependencia de un motor no mantenido y por un recorte del vocabulario de salida que elimina 42.403 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), 128 expertos, con capas "looped" (núcleo 6-17 ejecutado 3 veces por token) |
| Parametros totales | 25.970.462.976 (26,07B) |
| Parametros activos | no disponible |
| Longitud de contexto | Hasta 131.072 tokens (128K) con `--swa-compress` y KV q8_0 en 16 GB |
| Tipos de cuantizacion | IQ3_QT (trellis propia del fork), IQ4_KT, IQ4_KS, Q6_K, F32 (mezcla por tensor); archivo resultante a 3,45 bpw |
| Idiomas soportados | en (inglés); el tokenizer y los embeddings no se modifican, por lo que la entrada en otros idiomas se lee con normalidad |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (10,47 GiB / 11.247.029.632 bytes) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 128 expertos y 24 capas, del que se conoce que las capas 6 a 17 forman un núcleo "looped" que se ejecuta tres veces por token. La cuantización distribuida en este repositorio se generó a partir del GGUF BF16 de ggml-org. Los expertos enrutados se resolvieron con LDLQ (realimentación de error estilo GPTQ sobre matrices Hessianas de activación) hacia IQ3_QT, usando activaciones capturadas con `llama-gptq-capture`. El resto de tensores se cuantizó con `llama-quantize` de ik_llama.cpp. Ambos procesos emplearon la importance matrix publicada por ggml-org (1.770 chunks).

La calibración LDLQ consistió en 512 secuencias de 256 tokens de texto con formato de chat: prompts de IFEval, GSM8K, HotpotQA y ARC-Challenge, respondidos por un modelo local Gemma 4 26B-A4B (la mitad con thinking) y renderizados con la plantilla de chat de Inkling. No se dispone de información sobre el número de tokens de entrenamiento del modelo base, la composición de su dataset ni si se aplicaron técnicas de RLHF o DPO. La innovación técnica destacable de esta publicación es el recorte del vocabulario de salida: la cabeza de salida pasa de 201.024 a 157.655 filas, eliminando tokens que decodifican a 2 o más caracteres, contienen letras fuera de latín/griego y aparecen menos de 3 veces en aproximadamente 89M tokens de Wikipedia en inglés, texto de calibración y código abierto. Los caracteres individuales, bytes y tokens especiales se conservan, por lo que cualquier cadena sigue siendo producible.

## Capacidades

- Generación de texto conversacional en inglés con formato de chat.
- Modo de razonamiento (thinking) configurable mediante el argumento de plantilla `reasoning_effort` (por defecto 0.9; admite valores como `low`), devuelto por separado como `reasoning_content`.
- Razonamiento multi-paso y matemáticas, evidenciado por el uso de GSM8K en la calibración y por el modo thinking.
- Cuantización diseñada para preservar la calidad en tareas de instrucción (IFEval) y de conocimiento (ARC-Challenge, HotpotQA).
- Soporte de contexto largo de hasta 128K tokens con compresión SWA.
- Decodificación especulativa tipo suffix (`--spec-type suffix:n_max=16,n_min=2,suffix_min_match_len=5,suffix_max_depth=64`).
- Compatibilidad con la API de chat de OpenAI a través de `llama-server` (endpoints_compatible).
- No se documenta soporte de tool calling, function calling, visión ni audio en la información disponible.

## Casos de uso

- Asistente conversacional local en GPU de 16 GB: el modelo cabe completo en VRAM con contexto de 128K usando KV q8_0 y `--swa-compress`, lo que permite mantener conversaciones multi-turno largas sin offloading a RAM.
- Razonamiento con esfuerzo controlable: mediante `reasoning_effort` se puede ajustar la profundidad de razonamiento por petición, útil para alternar entre respuestas rápidas y cadenas de pensamiento más largas en un mismo servidor.
- Procesamiento de documentos largos en inglés: la ventana de 128K permite resumir o extraer información de textos extensos, aunque la calidad decae con la profundidad de contexto (la decodificación baja de 179 a 148 tok/s a 32K).
- Prototipado e investigación sobre MoE cuantizados: sirve para estudiar el comportamiento de un MoE de 128 expertos a 3,45 bpw y comparar su perplejidad y KLD frente a otras cuantizaciones.
- Evaluación comparativa de cuantizaciones: el repositorio incluye receta, importance matrix y listas de vocabulario, lo que facilita reproducir el pipeline y contrastar IQ3_QT con IQ4_NL o UD-IQ3_XXS.
- Generación de texto en lote con throughput alto: los 3.058 tok/s de prefill a 4K y los 179 tok/s de decodificación permiten servir cargas moderadas en una sola GPU de consumo.
- Despliegue en entornos con requisitos de licencia permisiva: al ser Apache-2.0, puede integrarse en productos comerciales sin restricciones de copyleft, siempre que se asuma la dependencia del fork.

## Benchmarks y rendimiento

Calidad en wikitext-2 test (32 x 512 tokens, mismos chunks para todas las filas), frente al modelo BF16:

| GGUF | Tamano | bpw | PPL | KLD medio | KLD p99 | Mismo token top | Motor |
|---|---|---|---|---|---|---|---|
| BF16 (referencia) | 48,6 GiB | 16,0 | 6,411 | - | - | - | llama.cpp estándar |
| ggml-org IQ4_NL | 16,4 GiB | 5,41 | 6,428 | 0,0093 | 0,087 | 95,8% | este fork |
| Inkling-2-Mini-IQ3_QT (este) | 10,5 GiB | 3,45 | 6,549 | 0,0278 | 0,242 | 93,1% | este fork |
| Unsloth UD-IQ3_XXS | 10,9 GiB | 3,58 | 6,548 | 0,0288 | 0,264 | 92,7% | llama.cpp estándar 94f3af3d0 |

Velocidad en RTX 5070 Ti 16 GB (CUDA 12.8, `llama-bench -fa 1 -ctk q8_0 -ctv q8_0 -ub 512 -ngl 99`, GPU dedicada):

| Medida | tok/s |
|---|---|
| Decodificación tg128 | 179,4 ± 3,5 |
| Decodificación a 4K / 16K / 32K de contexto | 175,5 / 158,4 / 148,4 |
| Prefill pp4096 / pp32768 | 3.058 / 2.809 |

El port del motor igualó a llama.cpp estándar sobre el mismo archivo IQ4_NL: PPL 3,7136 frente a 3.7066 en un texto mixto público, con texto greedy coincidente.

## Requisitos de hardware

- VRAM: el archivo pesa 10,47 GiB; con `-c 131072` y KV q8_0 el pico medido fue de 14,8 de 16,3 GB con el contexto lleno (escritorio ocupando ~1,5 GB). Con `-c 98304` quedaban ~1,8 GB libres a 90K tokens.
- GPU recomendadas: RTX 5070 Ti 16 GB (medición del autor); el README incluye instrucciones de compilación para RTX 30/40/50. No se documentan mediciones en A100 ni H100.
- Cabe en GPU de consumo de 16 GB; no se garantiza en GPUs de 12 GB o menos con contexto largo.
- Opciones de despliegue: exclusivamente el fork `Mcniiby/ik_llama.cpp-mcniiby` con `llama-server`. No carga en llama.cpp estándar, ik_llama.cpp original, Ollama ni LM Studio.
- Latencia y throughput: 179,4 tok/s de decodificación y 3.058 tok/s de prefill a 4K en RTX 5070 Ti; el rendimiento decae con la profundidad de contexto (148,4 tok/s a 32K).
- Flags necesarios: `--swa-compress`, `-fa on`, `-ctk q8_0 -ctv q8_0`, `-ub 512 -b 512`, `--jinja`, `-ctx-ckpt 2 -ctx-ckpt-i 0` y la configuración de decodificación especulativa suffix.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | PPL (wikitext-2) | bpw | Licencia | Motor |
|---|---|---|---|---|---|---|
| Inkling-2-Mini-IQ3_QT (este) | 26,07B MoE | 128K | 6,549 | 3,45 | Apache-2.0 | fork ik_llama.cpp (no mantenido) |
| Inkling-2-Mini BF16 | 26,07B MoE | 128K | 6,411 | 16,0 | Apache-2.0 | llama.cpp estándar |
| ggml-org IQ4_NL | 26,07B MoE | 128K | 6,428 | 5,41 | Apache-2.0 | este fork |
| Unsloth UD-IQ3_XXS | 26,07B MoE | 128K | 6,548 | 3,58 | Apache-2.0 | llama.cpp estándar |

No se dispone de datos de benchmarks de tareas (MMLU, HumanEval, GSM8K) ni de comparación con modelos de otros desarrolladores en la información proporcionada.

## Limitaciones y advertencias

- El archivo solo funciona en un fork de ik_llama.cpp no mantenido, sin soporte ni actualizaciones; no es compatible con llama.cpp estándar, Ollama ni LM Studio.
- El tipo IQ3_QT es propietario del fork y no está soportado por el ecosistema general.
- La cabeza de salida está recortada de 201.024 a 157.655 filas: se eliminan 42.403 tokens que decodifican a 2 o más caracteres, lo que puede afectar a la generación de texto en idiomas no latinos o con alfabetos distintos del latino y griego. Los tokens eliminados reciben logit -inf.
- El modelo está declarado únicamente para inglés; el rendimiento en otros idiomas no está evaluado.
- Pérdida de calidad medible frente a BF16: KLD medio de 0,0278 y KLD p99 de 0,242, con un 93,1% de coincidencia en el token top.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan evaluaciones específicas de factualidad.
- No se documentan sesgos conocidos ni evaluaciones de seguridad en la información disponible.
- La licencia Apache-2.0 permite uso comercial, pero la dependencia de un motor no mantenido supone un riesgo operativo para producción.
- El contexto largo requiere `--swa-compress` y KV q8_0; sin estas opciones no cabe en 16 GB.
- No se documenta soporte de tool calling, visión ni audio, lo que limita su uso en pipelines de agentes.

## Enlaces

- Hugging Face: https://huggingface.co/McNiiby/Inkling-2-Mini-IQ3_QT-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Motor (fork): https://github.com/Mcniiby/ik_llama.cpp-mcniiby
- Receta de cuantización: https://github.com/Mcniiby/ik_llama.cpp-mcniiby/blob/inkling/docs/inkling/QUANT-RECIPE.md
