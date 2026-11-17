# KINOQ/gemma-4-26B-A4B-it-XeFP4

## Resumen
gemma-4-26B-A4B-it-XeFP4 es una cuantización en 4 bits del modelo multimodal google/gemma-4-26B-A4B-it, publicada por el usuario KINOQ. No se trata de un modelo nuevo, sino de una conversión de pesos a XeFP4, un formato abierto de 4 bits diseñado específicamente para GPUs Intel Arc y ejecutado mediante XeQ Runtime, un motor basado en OpenCL desarrollado por el mismo autor. El objetivo es hacer viable la inferencia de un modelo MoE de 26 000 millones de parámetros (con 4 000 millones activos) en tarjetas gráficas de consumo con 16 GB de VRAM, un escenario tradicionalmente limitado por el soporte de software.

La relevancia de esta ficha radica en su carácter de artefacto de despliegue más que de investigación: el modelo base conserva sus capacidades de texto e imagen, pero los ficheros publicados no cargan en transformers, llama.cpp ni vLLM. Su utilidad depende por completo del runtime XeQ, lo que lo convierte en una opción de nicho para entornos con hardware Intel Arc y requisitos estrictos de memoria. La licencia declarada es Apache 2.0, aunque el modelo base remite a la licencia específica de Gemma 4 de Google.

El repositorio ocupa 29,1 GB e incluye dos configuraciones de pesos (Quality y Speed), un codificador visual opcional en INT8, un modelo asistente para decodificación especulativa MTP y los ficheros de tokenizador y plantilla de chat heredados del modelo original. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible; las únicas métricas son de rendimiento y perplejidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), 128 expertos; codificador visual multimodal |
| Parámetros totales | 26 000 millones (heredados del modelo base) |
| Parámetros activos | 4 000 millones (heredados del modelo base) |
| Longitud de contexto | Hasta 32 768 tokens en la configuración recomendada (Quality + MTP); 16 384 en el perfil de 16 GB con pantalla; 8 448 en el ejemplo de uso con imagen |
| Tipos de cuantización | XeFP4-8 (E2M1, bloque de 32, factor de bloque de 3 bits, escala de fila FP16) para expertos; INT8 con escala por fila para atención, MLP densa, embeddings y lm_head; FP32 para router, normas y escalares de capa; codificador visual INT8; asistente MTP en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (con enlace a la licencia de Gemma 4 de Google para el modelo base) |
| Formato de pesos | `.bin` propietario de XeFP4 con cabecera `.json`; safetensors solo para el asistente MTP; no compatible con GGUF ni safetensors estándar para el cuerpo del modelo |

## Arquitectura y entrenamiento
El modelo base es un transformer con mezcla de expertos de 128 expertos, 26 000 millones de parámetros totales y 4 000 millones activos por token, con capacidad multimodal de entrada de imagen y texto. Esta publicación no entrena ni afina el modelo: aplica un proceso de cuantización determinista, sin datos de calibración, que convierte los pesos a XeFP4-8 para los expertos y a INT8 para las capas de atención y MLP densa. El router, las normas y los escalares de capa se mantienen en FP32 para preservar la estabilidad del enrutamiento.

La innovación técnica principal es el formato XeFP4 y su motor de ejecución XeQ, orientado a GPUs Intel Arc mediante OpenCL. Se ofrecen dos configuraciones: Quality (expertos en XeFP4-8, atención y MLP densa en INT8, 14,2 GB) y Speed (todo en XeFP4-8, 13,4 GB). Además, se incluye un modelo asistente MTP sin modificar (BF16, 0,84 GB) que habilita decodificación especulativa; según el autor, la salida es idéntica con y sin MTP, y el motor recurre a decodificación simple cuando las predicciones del asistente son pobres. No se dispone de información sobre el dataset de entrenamiento original, el número de tokens ni si hubo RLHF o DPO.

## Capacidades
- Generación de texto conversacional y razonamiento, incluyendo modo de pensamiento (thinking) según los perfiles de uso descritos por el autor.
- Generación de código, con un perfil de rendimiento específico medido en tareas de código.
- Entrada de imagen y texto (pipeline image-text-to-text) mediante el codificador visual opcional en `vision/`; el uso solo de texto no requiere dicho codificador.
- Procesamiento de documentos largos, con contexto de hasta 32 768 tokens en la configuración recomendada.
- Decodificación especulativa MTP opcional mediante el modelo asistente, con salida equivalente a la decodificación simple.
- Servidor HTTP integrado en el runtime (`python -m xeq serve`), lo que permite exponer el modelo como servicio.
- Soporte de tool calling, function calling y agentes: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso
- Asistente conversacional local en equipos con GPU Intel Arc de 16 GB: la configuración Quality con MTP y contexto de 32 768 tokens permite mantener conversaciones multi-turno largas sin salir de la VRAM disponible (15,53 de 15,56 GiB en una A770).
- Descripción y análisis de imágenes en local: el codificador visual INT8 de 0,60 GB, combinado con la configuración Speed y `--image`, permite procesar imágenes sin depender de servicios en la nube.
- Resumen de documentos extensos: con 30 000 tokens de contexto, el autor reporta velocidades de decodificación de 57 a 64 tok/s con MTP, adecuadas para resumir informes o expedientes largos en una sola pasada.
- Generación de código en estaciones de trabajo con gráficos integrados Intel: la configuración Speed alcanza unos 107 tok/s con MTP en tareas de código sobre una A770, lo que la hace utilizable para autocompletado y generación de fragmentos.
- Razonamiento con modo thinking en entornos con restricciones de memoria: el perfil Quality + MTP llega a unos 150 tok/s en tareas de pensamiento, lo que permite cadenas de razonamiento largas sin degradar la experiencia.
- Despliegue de un endpoint HTTP interno: el comando `serve` con contexto de 16 384 tokens permite exponer el modelo como API en un servidor con GPU Arc, por ejemplo para prototipos de aplicaciones internas.
- Evaluación de hardware Intel Arc para inferencia de modelos MoE: el repositorio incluye benchmarks reproducibles (decode y prefill por posición de contexto) que permiten comparar A770 y Arc 140T frente a llama.cpp con SYCL.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los datos publicados son de perplejidad y de rendimiento de inferencia.

Perplejidad sobre 16 documentos FineWeb de 512 tokens (modelo base BF16 = 6,670):

| Configuración | Perplejidad | Variación |
|---|---|---|
| Quality (XeFP4-8 + INT8) | 6,731 | +0,9 % |
| Speed (XeFP4-8) | 6,981 | +4,7 % |
| GGUF IQ4_XS (13,9 GB) | 6,827 | +2,4 % |
| Motor XeQ, Quality (activaciones INT8 en prefill) | 6,741 | +1,1 % |
| Motor XeQ, Speed (activaciones INT8 en prefill) | 6,994 | +4,9 % |

Decodificación en Intel Arc A770 16 GB, batch 1, greedy, caché KV FP16, MTP desactivado (tok/s):

| Posición | Quality | Speed | llama.cpp SYCL IQ4_XS |
|---|---|---|---|
| 0 | 72,1 | 92,1 | 32,4 |
| 1K | 69,9 | 88,6 | no disponible |
| 4K | 66,9 | 83,8 | 25,3 |
| 10K | 65,3 | 81,3 | no disponible |
| 16K | 62,2 | 76,6 | 19,3 |
| 32K | no disponible | 68,8 | no disponible |

Prefill en A770 (tok/s y tiempo hasta el primer token):

| Prompt | Quality | Speed | llama.cpp IQ4_XS pp512 |
|---|---|---|---|
| 512 | 1 648 (0,31 s) | 1 662 (0,31 s) | 694 |
| 4K | 1 730 (2,4 s) | 1 737 (2,4 s) | 684 |
| 16K | 1 526 (10,7 s) | 1 532 (10,7 s) | 630 |
| 32K | no disponible | 1 326 (24,1 s) | no disponible |

Ganancia de MTP (decodificación, tok/s, off → on):

| Tarea | Quality | Speed |
|---|---|---|
| Thinking | 73 → ~150 | 94 → ~140 |
| Código | 73 → ~118 | 94 → ~107 |
| Explicación en prosa | 73 → ~100 | 94 → ~92 |
| Resumen de documento largo, contexto 30K | 57 → 60-64 | 64 → 65 |

En Intel Arc 140T (iGPU Xe-LPG+ con memoria compartida): 18,6 tok/s (Quality) y 23,6 tok/s (Speed) en posición 0; 16,9 y 20,8 en 1K; 16,3 en 4K para Quality (el resto de la tabla no está disponible en la información proporcionada).

## Requisitos de hardware
- VRAM estimada: 14,2 GB para Quality y 13,4 GB para Speed en pesos; con caché KV FP16, Quality + MTP a 32K consume 15,53 GiB y Speed a 32K consume 14,29 GiB en una A770 de 16 GB.
- GPU recomendadas: Intel Arc A770 16 GB (principal objetivo); Intel Arc 140T (iGPU con memoria compartida, mucho más lenta); no se documenta soporte para A100, H100 ni RTX 4090.
- GPU de consumo: cabe en una Intel Arc A770 de 16 GB; en la Arc 140T funciona con rendimiento reducido (16-24 tok/s). No hay información sobre GPUs NVIDIA o AMD.
- Opciones de despliegue: exclusivamente XeQ Runtime mediante OpenCL (`python -m xeq selftest`, `chat`, `run`, `serve`). Los ficheros no cargan en transformers, llama.cpp ni vLLM.
- Latencia y throughput: en A770, prefill de 1 648-1 737 tok/s y decodificación de 62-92 tok/s según configuración y posición; con MTP, hasta ~150 tok/s en tareas de razonamiento. La caché KV FP32 (`--kv fp32`) es un 2 % más rápida en posición 0 pero un 2-9 % más lenta desde 1K y consume 0,6-0,9 GiB adicionales.
- Perfiles de memoria: con pantalla conectada a la GPU o uso concurrente de VRAM, se recomienda `--ctx 16384`; para entrada de imagen, Speed con `--image`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Despliegue |
|---|---|---|---|---|---|
| gemma-4-26B-A4B-it-XeFP4 (Quality) | 26B totales / 4B activos | 32K | XeFP4-8 + INT8, 14,2 GB | Apache 2.0 | XeQ Runtime (OpenCL, Intel Arc) |
| gemma-4-26B-A4B-it (BF16 original) | 26B totales / 4B activos | no disponible en la información | BF16 | Licencia Gemma 4 | transformers y ecosistema estándar |
| GGUF IQ4_XS del mismo modelo base | 26B totales / 4B activos | no disponible en la información | IQ4_XS, 13,9 GB | Licencia Gemma 4 | llama.cpp (SYCL en Intel Arc) |

Frente a la versión BF16, la cuantización XeFP4 reduce el peso a 14,2 GB con una pérdida de perplejidad del 0,9 % (Quality), lo que la hace ejecutable en 16 GB de VRAM. Frente a GGUF IQ4_XS en llama.cpp con SYCL, la configuración Quality obtiene mejor perplejidad (6,731 frente a 6,827) y una decodificación notablemente superior en la A770 (72,1 frente a 32,4 tok/s en posición 0; 62,2 frente a 19,3 en 16K), a costa de quedar atada a un runtime propietario y a hardware Intel.

## Limitaciones y advertencias
- Compatibilidad restringida: los pesos no cargan en transformers, llama.cpp ni vLLM; requieren XeQ Runtime y una GPU Intel Arc con OpenCL.
- Dependencia de un runtime de un solo autor: el motor y el formato XeFP4 proceden del mismo desarrollador, sin adopción amplia documentada; el repositorio tiene 0 descargas y 0 likes en el momento de la ficha.
- Idiomas soportados no documentados: no se puede confirmar el comportamiento multilingüe del modelo base a partir de esta publicación.
- Riesgo de alucinación: inherente al modelo base; no se han publicado evaluaciones de fidelidad ni de tasas de alucinación.
- Sesgos: no disponible en la información proporcionada; se heredan los del modelo base de Google.
- Licencia: la model card declara Apache 2.0, pero enlaza a la licencia de Gemma 4 de Google para el modelo base; conviene verificar las condiciones de uso comercial del modelo original antes de desplegarlo en producción.
- Pérdida de calidad medible: la configuración Speed incrementa la perplejidad un 4,7 % frente a BF16, superior a la de GGUF IQ4_XS; no es recomendable para tareas sensibles a la precisión.
- Contexto limitado por VRAM: 32K solo es viable en la A770 con Quality + MTP (15,53 de 15,56 GiB); cualquier uso concurrente de la GPU obliga a reducir a 16K.
- Sin benchmarks de capacidad: no hay datos de MMLU, HumanEval ni GSM8K que permitan comparar la calidad real frente a otras cuantizaciones o modelos.
- Rendimiento muy inferior en iGPU: en la Arc 140T la decodificación cae a 16-24 tok/s, lo que limita su uso interactivo.

## Enlaces
- Repositorio en Hugging Face: https://huggingface.co/KINOQ/gemma-4-26B-A4B-it-XeFP4
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Runtime XeQ y formato XeFP4: https://github.com/kinoqdev/XeFP4
- Especificación del formato XeFP4: https://github.com/kinoqdev/XeFP4/blob/main/spec/XEFP4_SPEC.md
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
