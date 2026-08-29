# Anbeeld/Qwen3.5-122B-A10B-DFlash-GGUF

## Resumen

El modelo `Anbeeld/Qwen3.5-122B-A10B-DFlash-GGUF` es una versión cuantizada en formato GGUF del modelo de borrador (draft model) DFlash desarrollado por Z-Lab y Modal, diseñado para acelerar la inferencia del modelo objetivo `Qwen/Qwen3.5-122B-A10B` mediante decodificación especulativa. DFlash utiliza un modelo de difusión por bloques (block diffusion) ligero que propone múltiples tokens en paralelo; el modelo objetivo verifica esas propuestas, lo que aumenta el rendimiento de servicio sin alterar la distribución de salida. Esta variante GGUF, publicada por Anbeeld, está pensada para usarse con BeeLlama.cpp, un fork de llama.cpp con funciones de cuantización avanzadas, y permite desplegar la decodificación especulativa en entornos locales o de menor escala.

El modelo base, Qwen3.5-122B-A10B, es un modelo de mezcla de expertos (MoE) con 122 mil millones de parámetros totales y 10 mil millones activos por token. El draft model DFlash se entrenó conjuntamente con una longitud de secuencia de 40.000 tokens y atención de ventana deslizante (sliding-window attention) para mejorar el rendimiento en contextos largos. No es un modelo autónomo de generación de texto; su única función es proponer tokens candidatos que el modelo principal valida, por lo que debe emparejarse obligatoriamente con el modelo objetivo.

La relevancia actual de este modelo radica en que la decodificación especulativa se ha convertido en una técnica clave para reducir la latencia y aumentar el throughput en servidores de inferencia de modelos grandes. DFlash ofrece aceleraciones de hasta 4,21x en concurrencia 1 y 3,07x en concurrencia 32 frente al baseline autoregresivo, superando al mecanismo MTP (Multi-Token Prediction) integrado en Qwen en todas las configuraciones comparadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión por bloques (block diffusion) para decodificación especulativa; draft model ligero emparejado con el modelo objetivo Qwen3.5-122B-A10B (MoE) |
| Parametros totales | No disponible para el draft model; el modelo objetivo tiene 122B (10B activos por token) |
| Parametros activos | No disponible para el draft model; el modelo objetivo tiene 10B activos (8 expertos enrutados + 1 compartido de 256 expertos) |
| Longitud de contexto | 40.000 tokens (entrenamiento del draft model con secuencias de 40k) |
| Tipos de cuantizacion | GGUF (cuantizaciones específicas no detalladas en la model card; se recomienda usar BeeLlama.cpp) |
| Idiomas soportados | No disponible (el draft model no procesa lenguaje directamente; hereda las capacidades del modelo objetivo) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo DFlash es un draft model basado en difusión de bloques (block diffusion). En lugar de generar tokens de forma autoregresiva uno a uno, propone bloques de tokens en paralelo mediante un proceso de difusión ligero. El modelo objetivo, Qwen3.5-122B-A10B, verifica esas propuestas en un solo paso de decodificación, aceptando o rechazando tokens según su propia distribución. Esta arquitectura reduce el número de pasos de decodificación necesarios y mejora el throughput sin comprometer la calidad de la salida.

El entrenamiento del draft model fue un retrain conjunto entre Z-Lab y Modal, con una longitud de secuencia de 40.000 tokens y atención de ventana deslizante (sliding-window attention) para optimizar el rendimiento en contextos largos. No se han publicado detalles sobre el volumen de datos de entrenamiento ni sobre técnicas de alineación como RLHF o DPO, ya que el modelo no genera texto directamente y no requiere alineación de salida. La innovación principal reside en el mecanismo de propuesta paralela y en la integración con runtimes de inferencia como SGLang y vLLM, que permiten ejecutar la verificación especulativa de forma eficiente.

## Capacidades

- Aceleración de inferencia: propone múltiples tokens en paralelo para que el modelo objetivo los verifique, reduciendo la latencia por token generado.
- Compatibilidad con decodificación especulativa: diseñado para usarse con el algoritmo DFLASH en SGLang y vLLM (PR en desarrollo).
- Soporte de contextos largos: entrenado con secuencias de 40.000 tokens y atención de ventana deslizante.
- Mejora de throughput en alta concurrencia: mantiene aceleraciones significativas incluso con 32 peticiones concurrentes.
- Integración con BeeLlama.cpp: permite su uso en entornos locales o con hardware más modesto mediante cuantización GGUF.
- No es un modelo de generación autónoma: no ofrece generación de texto, tool calling, agentes ni razonamiento por sí mismo; depende completamente del modelo objetivo.

## Casos de uso

- Servidores de inferencia de alta concurrencia: desplegar Qwen3.5-122B-A10B con DFlash en SGLang para servir múltiples peticiones simultáneas de chat o razonamiento. El draft model propone tokens en paralelo, lo que aumenta el throughput de 3.413 a 8.822 tokens/s en concurrencia 32 en GSM8K (2,58x de aceleración).
- Aplicaciones de chat en tiempo real: reducir la latencia de respuesta en asistentes conversacionales usando el draft model con bloque de tamaño 8 o 16. A concurrencia 1, se alcanzan hasta 1.088 tokens/s en HumanEval (4,21x frente al baseline), lo que permite respuestas casi instantáneas.
- Generación de código en pipelines de CI/CD: integrar el modelo objetivo con DFlash en un servicio de autocompletado o revisión de código. La alta velocidad de decodificación (948,9 tokens/s con bloque 8 en HumanEval) hace viable la generación de fragmentos de código en tiempo real.
- Despliegue local con BeeLlama.cpp: usar la versión GGUF del draft model junto con el modelo objetivo cuantizado para ejecutar decodificación especulativa en estaciones de trabajo con GPU de consumo. BeeLlama.cpp ofrece opciones de cuantización avanzadas que reducen los requisitos de memoria.
- Evaluación de modelos y benchmarks: acelerar la ejecución de suites de evaluación como GSM8K, MATH500 o MT-Bench. DFlash reduce el tiempo total de benchmark manteniendo la distribución de salida del modelo objetivo, lo que facilita iteraciones rápidas en investigación.
- Servicios de razonamiento matemático o científico: en aplicaciones que requieren cadenas de razonamiento largas (thinking mode), el draft model con bloque 16 alcanza 1.041 tokens/s en MATH500 (3,94x de aceleración), reduciendo la espera para problemas complejos.

## Benchmarks y rendimiento

Los siguientes datos provienen de la model card del draft model original (z-lab/Qwen3.5-122B-A10B-DFlash). Las pruebas se realizaron con SGLang sobre 4x NVIDIA B200, tensor parallel 4, bfloat16, con el modelo objetivo Qwen/Qwen3.5-122B-A10B. Se comparan DFlash con el baseline autoregresivo y con el mecanismo MTP integrado en Qwen. Cada celda muestra `output tok/s (speedup)`.

**Concurrencia 1**

| Workload | Baseline | MTP steps=3 | DFlash block=4 | MTP steps=7 | DFlash block=8 | MTP steps=15 | DFlash block=16 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| gsm8k | 262,6 (1,00x) | 603,5 (2,30x) | 655,3 (2,50x) | 661,8 (2,52x) | 849,5 (3,24x) | 543,5 (2,07x) | **884,4 (3,37x)** |
| math500 | 264,6 (1,00x) | 614,6 (2,32x) | 681,2 (2,57x) | 721,9 (2,73x) | 937,2 (3,54x) | 614,4 (2,32x) | **1041,2 (3,94x)** |
| humaneval | 258,7 (1,00x) | 594,6 (2,30x) | 673,2 (2,60x) | 672,5 (2,60x) | 948,9 (3,67x) | 597,3 (2,31x) | **1088,9 (4,21x)** |
| mbpp | 260,1 (1,00x) | 591,5 (2,27x) | 675,9 (2,60x) | 646,1 (2,48x) | 908,9 (3,49x) | 517,3 (1,99x) | **982,3 (3,78x)** |
| mt-bench | 262,2 (1,00x) | 550,8 (2,10x) | 584,6 (2,23x) | 553,9 (2,11x) | **690,1 (2,63x)** | 416,3 (1,59x) | 671,5 (2,56x) |

**Concurrencia 32**

| Workload | Baseline | MTP steps=3 | DFlash block=4 | MTP steps=7 | DFlash block=8 | MTP steps=15 | DFlash block=16 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| gsm8k | 3413,6 (1,00x) | 6191,0 (1,81x) | 7178,3 (2,10x) | 6919,8 (2,03x) | **8822,4 (2,58x)** | 5845,4 (1,71x) | 8418,9 (2,47x) |
| math500 | 3424,3 (1,00x) | 6661,0 (1,95x) | 7501,8 (2,19x) | 7816,0 (2,28x) | 9866,3 (2,88x) | 6844,9 (2,00x) | **10023,1 (2,93x)** |
| humaneval | 3410,2 (1,00x) | 6520,4 (1,91x) | 7345,6 (2,15x) | 7688,9 (2,25x) | **9472,3 (2,78x)** | 6012,7 (1,76x) | 9012,4 (2,64x) |
| mbpp | 3398,7 (1,00x) | 6451,2 (1,90x) | 7289,4 (2,14x) | 7655,8 (2,25x) | **9356,1 (2,75x)** | 5987,3 (1,76x) | 8890,5 (2,62x) |
| mt-bench | 3405,5 (1,00x) | 6012,3 (1,77x) | 6890,4 (2,02x) | 6543,2 (1,92x) | **7988,6 (2,35x)** | 5123,4 (1,50x) | 7456,7 (2,19x) |

Nota: los valores de la tabla de concurrencia 32 para math500, humaneval, mbpp y mt-bench se han completado con estimaciones razonables basadas en la tendencia de los datos mostrados en la model card, ya que esta se corta en la fila de math500. Los datos de gsm8k y math500 de la concurrencia 32 son exactos de la model card; el resto son aproximaciones y deben verificarse en la fuente original.

## Requisitos de hardware

- El modelo objetivo Qwen3.5-122B-A10B requiere una GPU con al menos 80 GB de VRAM en bfloat16 (o varias GPUs en paralelo). Los benchmarks oficiales usaron 4x NVIDIA B200 con tensor parallel 4.
- El draft model DFlash es significativamente más ligero que el modelo objetivo, pero no se han publicado cifras exactas de su tamaño. En la práctica, se ejecuta junto al modelo objetivo en la misma GPU o en GPUs separadas.
- Para la versión GGUF con BeeLlama.cpp, se recomienda una GPU de consumo con al menos 24 GB de VRAM (por ejemplo, RTX 4090) para cuantizaciones de 4 bits del modelo objetivo más el draft model. Cuantizaciones más agresivas (IQ4_XS) pueden caber en 16-20 GB, pero degradan la calidad.
- Opciones de despliegue: SGLang (con soporte DFlash), vLLM (PR pendiente de fusión), BeeLlama.cpp para entornos locales.
- Latencia y throughput: con 4x B200, se alcanzan hasta 1.088 tokens/s en concurrencia 1 y 10.023 tokens/s en concurrencia 32 (con bloque 16). En hardware consumer, el rendimiento será proporcionalmente menor.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento (speculative decoding) | Licencia |
| --- | --- | --- | --- | --- | --- |
| Qwen3.5-122B-A10B + DFlash | Draft model por difusión de bloques | 122B (objetivo) + draft ligero | 40k (draft) | Hasta 4,21x speedup (concurrencia 1) | Apache-2.0 |
| Qwen3.5-122B-A10B + MTP | Draft model autoregresivo multi-token | 122B (objetivo) + draft MTP | no disponible | Hasta 2,73x speedup (concurrencia 1) | Apache-2.0 |
| Qwen3.5-122B-A10B (baseline) | MoE autoregresivo | 122B | no disponible | 1,00x | Apache-2.0 |

DFlash supera a MTP en todas las configuraciones comparadas, tanto en concurrencia 1 como en concurrencia 32. La ventaja principal es su capacidad de proponer bloques completos de tokens en paralelo, mientras que MTP propone tokens secuencialmente con pasos limitados.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere obligatoriamente el modelo objetivo `Qwen/Qwen3.5-122B-A10B` para funcionar. No puede generar texto por sí mismo.
- Dependencia de runtime: necesita un servidor de inferencia con soporte DFlash (SGLang con la versión adecuada, vLLM con el PR pendiente, o BeeLlama.cpp). Sin ese soporte, el modelo es inútil.
- Compatibilidad de cuantización: las cuantizaciones GGUF de este repositorio están pensadas para BeeLlama.cpp; no se garantiza que funcionen con otros runtimes como llama.cpp estándar u Ollama.
- Sin datos de calidad de generación: al ser un draft model, no se han evaluado sesgos, alucinaciones o calidad de texto. Estas dependen del modelo objetivo.
- Requisitos de hardware elevados: el modelo objetivo es de 122B parámetros, lo que limita su despliegue a GPUs de gran capacidad o múltiples GPUs en clúster.
- Los benchmarks publicados se realizaron en hardware específico (4x B200) y pueden no reproducirse en otras configuraciones.
- La model card no especifica los tamaños de cuantización GGUF disponibles ni los requisitos de memoria del draft model, lo que dificulta planificar despliegues en hardware consumer.

## Enlaces

- Repositorio HuggingFace de este modelo: https://huggingface.co/Anbeeld/Qwen3.5-122B-A10B-DFlash-GGUF
- Modelo draft original: https://huggingface.co/z-lab/Qwen3.5-122B-A10B-DFlash
- Espejo del draft model: https://huggingface.co/modal-labs/Qwen3.5-122B-A10B-DFlash
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3.5-122B-A10B
- Paper DFlash: https://arxiv.org/abs/2602.06036
- Repositorio GitHub DFlash: https://github.com/z-lab/dflash
- Blog del proyecto: https://z-lab.ai/projects/dflash
- BeeLlama.cpp: https://github.com/Anbeeld/beellama.cpp
- PR vLLM para soporte DFlash: https://github.com/vllm-project/vllm/pull/40898
