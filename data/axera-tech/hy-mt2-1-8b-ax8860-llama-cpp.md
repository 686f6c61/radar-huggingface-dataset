# AXERA-TECH/Hy-MT2-1.8B-AX8860-llama.cpp

## Resumen

Hy-MT2-1.8B-AX8860-llama.cpp es un paquete de despliegue publicado por AXERA-TECH que permite ejecutar el modelo de traducción multilingüe Tencent Hy-MT2-1.8B sobre la NPU del SoC Axera AX8860 mediante una bifurcación de llama.cpp con soporte para ggml-axera. No se trata de un modelo nuevo, sino de una distribución optimizada del modelo base de Tencent (1.791.080.448 parámetros) empaquetada con pesos en formato GGUF, kernels de NPU compilados y scripts de ejecución y benchmark. El repositorio ocupa 2,1 GB e incluye el binario estático de llama.cpp para la placa, dos kernels (prefill y decode, este último con la cabeza de salida) y una plantilla de chat.

El problema que resuelve es la inferencia de un modelo de traducción de 1,8B parámetros en hardware de borde (edge) con NPU dedicada, sin GPU. Según la model card, alcanza 69,5 tokens/s en decodificación y 7.653 tokens/s en prefill de 4k tokens, con un contexto máximo de 131.072 tokens. El modelo se carga en 19,2-23,5 s y los pesos se convierten en tiempo de carga de GGUF a MXFP8, con caché KV en BF16.

Es relevante ahora porque demuestra la viabilidad de servir traducción multilingüe de calidad en dispositivos con NPU de bajo consumo mediante una API compatible con OpenAI, lo que facilita integrarlo en pipelines existentes sin reescribir clientes. La ficha se centra en las características verificables del paquete; los datos sobre el modelo base que no aparecen en la información proporcionada se marcan como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer de traducción; el paquete usa llama.cpp con kernels NPU) |
| Parámetros totales | 1.791.080.448 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantización | Q8_0 y F16 en GGUF; conversión a MXFP8 en carga; KV en BF16 |
| Idiomas soportados | zh, en, ja, ko, fr, de, ru, es (según el flag `-t` de `run.sh`); validación de corrección reportada en zh, en, ja, fr |
| Licencia | no disponible |
| Formato de pesos | GGUF (`Hy-MT2-1.8B-Q8_0.gguf`, 1,91 GB) + kernels NPU y binarios estáticos |

## Arquitectura y entrenamiento

El paquete no documenta la arquitectura interna del modelo base Tencent Hy-MT2-1.8B ni sus datos de entrenamiento (número de tokens, composición del corpus, uso de RLHF/DPO). Lo que sí se detalla es la capa de despliegue: una bifurcación de llama.cpp (ZHEQIUSHUI/llama.cpp en el commit `6613735ce`) con backend ggml-axera que ejecuta el grafo sobre la NPU del AX8860. Los pesos GGUF se convierten a MXFP8 durante la carga y la caché KV se mantiene en BF16; tanto el GGUF Q8_0 como el F16 son cargables.

La innovación técnica destacable es el empaquetado de kernels: un único conjunto de kernels (prefill y decode con cabeza de salida incluida, más `manifest.json`) cubre todo el rango de contexto hasta 131.072 tokens, y la memoria KV se asigna según el valor de `-c` (ajustable con la variable de entorno `CTX`). El runtime ocupa los 4 núcleos de la NPU en exclusiva y el servidor se lanza con `-np 1`. La model card indica explícitamente que es un modelo de traducción sin rama de pensamiento ni de tool calling en la plantilla de chat, y sin cabeza MTP.

## Capacidades

- Traducción multilingüe entre los idiomas expuestos por `run.sh`: chino, inglés, japonés, coreano, francés, alemán, ruso y español.
- Generación de texto condicionada por el prompt de traducción de la model card ("将以下文本翻译为英语，注意只需要输出翻译后的结果，不要额外解释：…"), orientada a salida limpia sin explicaciones adicionales.
- Servicio HTTP compatible con OpenAI (`/v1/chat/completions`), lo que permite integrarlo con clientes y SDKs existentes.
- Modo chat interactivo en terminal (`run.sh -c`), que requiere un TTY real.
- Benchmark reproducible de rendimiento y de perplejidad (`bench.sh`, `bench.sh ppl`).
- No soporta tool calling ni function calling (la plantilla de chat no tiene esa rama).
- No dispone de modo de razonamiento (thinking) ni de cabeza MTP.
- No se documentan capacidades de visión, audio ni agentes multi-paso.

## Casos de uso

- Traducción de documentación técnica en local: el modelo traduce frases con números e idioms entre zh, en, ja y fr con salida correcta según la model card, y su contexto de 131.072 tokens permite procesar documentos largos en una sola pasada sin trocear.
- Servicio de traducción en dispositivos de borde: con 69,5 tokens/s de decode y 7.653 tokens/s de prefill sobre una NPU AX8860, se puede desplegar un endpoint compatible con OpenAI en hardware sin GPU para traducción de textos cortos y medios en tiempo casi interactivo.
- Preprocesado multilingüe en pipelines de datos: la API compatible con OpenAI permite insertar el traductor como un paso más en un pipeline existente (por ejemplo, normalizar corpus en ko, ru, de o es antes de indexarlos).
- Traducción de soporte al cliente: con prompts de traducción controlados y `temperature 0`, se pueden generar respuestas traducidas de forma determinista en un flujo de atención al cliente multiidioma.
- Traducción de subtítulos y textos cortos en tiempo real: la latencia de prefill para prompts de 5 a 47 tokens (0,03-0,05 s) y el decode de ~68-70 tokens/s encajan con segmentos cortos de subtítulos.
- Evaluación comparativa de calidad de traducción: el script `bench.sh ppl` con `-c 512` permite medir perplejidad en zh (29,52 con `-ub 1`, 29,37 con `-ub 4`) y en (16,35 y 16,53) para comparar configuraciones o versiones del runtime.

## Benchmarks y rendimiento

Datos publicados en la model card (AX8860, generación de 50 tokens):

| Prompt | `-c` | Tiempo de prompt | Decode (tokens/s) |
|---|---:|---:|---:|
| 5 tokens | 8192 | 0,03 s | 69,5 |
| 47 tokens | 8192 | 0,05 s | 68,3 |
| 3906 tokens | 8192 | 0,51 s | 57,2 |
| 5 tokens | 131072 | 0,03 s | 69,8 |
| 3906 tokens | 131072 | 0,51 s | 57,0 |

| Métrica | Valor |
|---|---|
| Prefill 4k | 7.653 tokens/s (3906 tokens en 0,51 s) |
| Decode máximo | 69,5 tokens/s |
| Carga del modelo | 19,2-23,5 s |
| Perplejidad zh (`-c 512`) | 29,52 (`-ub 1`) / 29,37 (`-ub 4`) |
| Perplejidad en (`-c 512`) | 16,35 (`-ub 1`) / 16,53 (`-ub 4`) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, BLEU/COMET de traducción) en la información disponible.

## Requisitos de hardware

- Hardware obligatorio: SoC Axera AX8860 con la NPU y el runtime del SDK en `/opt/lib`; el paquete no funciona en GPU ni CPU convencional.
- VRAM: no aplica; la inferencia usa la NPU del AX8860 y los 4 núcleos quedan ocupados en exclusiva por el runtime.
- Memoria: el GGUF Q8_0 ocupa 1,91 GB en disco; la caché KV se asigna según `-c` (hasta 131.072 tokens) y se puede ajustar con `CTX`.
- GPU recomendadas: no disponible (no se soportan GPU en este paquete).
- Compatibilidad con GPU de consumo: no; requiere el hardware AX8860.
- Despliegue: binarios estáticos de llama.cpp en `bin/`, scripts `run.sh` (CLI, chat y servidor OpenAI-compatible) y `bench.sh` (rendimiento y perplejidad). No se documenta soporte para vLLM, Ollama ni TGI.
- Latencia y throughput: carga de 19,2-23,5 s; prefill de 4k en 0,51 s; decode de 57,0-69,8 tokens/s según longitud de prompt y contexto configurado.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de modelos comparables de la misma categoría (traducción de ~1,8B parámetros) ni métricas de calidad de traducción que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Es un modelo de traducción: la plantilla de chat no incluye rama de pensamiento ni de tool calling, por lo que no debe usarse como asistente general.
- Dependencia total del hardware Axera AX8860 y del SDK en `/opt/lib`; no es portable a GPU, CPU ni otras NPU sin trabajo adicional.
- El runtime ocupa los 4 núcleos de la NPU en exclusiva y el servidor corre con `-np 1`, lo que limita la concurrencia a una petición simultánea.
- La licencia no está indicada en la información disponible; antes de un uso comercial hay que verificar los términos del modelo base `tencent/Hy-MT2-1.8B` y del paquete.
- La validación de corrección reportada cubre zh, en, ja y fr; para ko, de, ru y es no se documentan pruebas de calidad.
- La perplejidad en chino (29,52) es notablemente superior a la del inglés (16,35), lo que sugiere un comportamiento desigual entre idiomas.
- Riesgo de alucinación y de añadir explicaciones no solicitadas: la model card insiste en el formato de prompt para forzar salida limpia, y no se documentan salvaguardas adicionales.
- El modo chat (`run.sh -c`) exige un terminal interactivo real; no funciona en entornos no interactivos.
- Los archivos descargados de Hugging Face no tienen permisos de ejecución; hay que invocarlos con `sh`.
- No se documentan sesgos conocidos ni evaluación de seguridad del modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AXERA-TECH/Hy-MT2-1.8B-AX8860-llama.cpp
- Modelo base: https://huggingface.co/tencent/Hy-MT2-1.8B
- Bifurcación de llama.cpp utilizada: https://github.com/ZHEQIUSHUI/llama.cpp (commit `6613735ce`)
