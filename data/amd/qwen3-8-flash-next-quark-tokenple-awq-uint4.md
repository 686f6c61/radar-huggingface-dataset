# amd/Qwen3.8-Flash-Next-Quark-TokenPLE-AWQ-UINT4

## Resumen

Qwen3.8-Flash-Next-Quark-TokenPLE-AWQ-UINT4 es una versión cuantizada y modificada del modelo multimodal Qwen3.8-Flash-Next del equipo Qwen (Alibaba Group), publicada por AMD. Se trata de un transformer de mezcla de expertos (MoE) con 20.682.892.125 parámetros totales, capacidad de entrada de texto e imagen, y salida de texto, orientado a generación de texto, razonamiento, código y uso conversacional multilingüe. La versión que nos ocupa ha sido optimizada por AMD con su herramienta Quark para su despliegue en hardware AMD Instinct MI3XX y Ryzen AI RDNA 3+.

La modificación principal respecto al modelo original es doble. Por un lado, se aplica cuantización AWQ uint4 con grupo de tamaño 128 sobre los pesos de los expertos enrutados (73.728 módulos), manteniendo en BF16 la atención, el router, el experto compartido, las conexiones hiper, los embeddings, el `lm_head`, la tabla PLE y la capa MTP. Por otro, se sustituye la tabla de embeddings n-gram PLE original de 102,4 GB en BF16 (320.001.536 filas × 160 valores) por una tabla por token `U` de 1,27 GB con forma [248.320, 2.560], lo que reduce drásticamente el uso de memoria en inferencia.

El resultado es un checkpoint que cabe en una sola GPU AMD Instinct MI355X con 70,54 GiB de memoria al cargar en tensor parallel 1, frente a los 164,73 GiB del checkpoint AWQ con la tabla original. La relevancia actual radica en que permite servir un modelo MoE multimodal de gran tamaño en hardware AMD con vLLM, a costa de una degradación moderada en benchmarks de razonamiento y función-calling, y con una ligera mejora en generación de código.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (`Qwen4ExpForConditionalGeneration`, `model_type` `qwen4_exp`) con embedding PLE en la capa 1 del decodificador (`ple_layer_ids: [2]`) |
| Parámetros totales | 20.682.892.125 |
| Parámetros activos | no disponible (MoE con 512 expertos por capa y 48 capas; número de expertos activos no indicado) |
| Longitud de contexto | 262.144 tokens (según `--max-model-len` en el comando de servicio) |
| Tipos de cuantización | AWQ uint4 weight-only, grupo 128, asimétrica con zero point int32 y escalas BF16; capas excluidas en BF16 |
| Idiomas soportados | multilingüe (sin listado explícito) |
| Licencia | qwen-community-1.0 (`license: other`) |
| Formato de pesos | safetensors (real-quantized, exportado con Quark en formato HF) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos multimodal con 48 capas y 512 expertos enrutados por capa, más un experto compartido, router, conexiones hiper y una capa MTP (multi-token prediction). Incluye una tabla de embeddings PLE (probablemente "positional language embedding" o n-gram embedding, según los tags `ple-embedding`, `per-token-table`, `n-gram-embedding`) en la capa 1 del decodificador, que en el modelo original tiene 320.001.536 filas × 160 valores en BF16 (102,4 GB). Acepta texto e imagen como entrada y genera texto.

El entrenamiento original del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO) no está documentado en la información proporcionada. La modificación de AMD consiste en una cuantización AWQ real (Quark, esquema `uint4_wo_128`, algoritmo `awq`) calibrada con 128 muestras de 512 tokens, y en la construcción de la tabla por token `U` mediante calibración sobre los datasets descritos en `CORPUS_DATASHEET.md` (no incluido en la información disponible). Los pesos de los expertos se calibraron con la tabla n-gram original y no se recalibraron para `U`. Las escalas de `up_proj` se pliegan en `down_proj` por experto. La innovación técnica destacable es la sustitución de la tabla PLE por una tabla por token, que reduce el checkpoint de 164,73 GiB a 70,54 GiB en carga, y el soporte de PLE por token en vLLM mediante el PR #64369.

## Capacidades

- Generación de texto y razonamiento multimodal (entrada de texto e imagen, salida de texto).
- Razonamiento matemático y de sentido común (GSM8K, MMLU-Pro, GPQA-Diamond evaluados).
- Generación de código (LiveCodeBench v6 evaluado, con mejora ligera respecto a la tabla original).
- Tool calling / function calling (evaluado con BFCL V4 en 20 categorías).
- Modo thinking con esfuerzo de razonamiento configurable (`enable_thinking`, `reasoning-parser qwen3`, esfuerzo xhigh en las evaluaciones).
- Capacidades multilingües (etiqueta `multilingual`, sin listado de idiomas).
- Soporte de decodificación multi-token (capa MTP incluida en BF16).
- Capacidad de agente y razonamiento multi-paso (implícita por tool calling y thinking mode; no se detalla explícitamente en la información disponible).

## Casos de uso

- Asistencia conversacional multilingüe de largo contexto: con 262.144 tokens de ventana, el modelo puede mantener conversaciones multi-turno con documentos extensos o historiales largos, adecuado para atención al cliente con base de conocimiento adjunta.
- Generación de código en producción: el modelo obtiene 88,24 de pass@1 en LiveCodeBench v6 y soporta tool calling, por lo que puede integrarse en pipelines de CI/CD para revisión, generación y corrección de código con acceso a herramientas externas.
- Razonamiento matemático y analítico: los resultados en GSM8K (96,38) y MMLU-Pro (86,72) lo hacen apto para asistentes de análisis, tutoría y resolución de problemas con modo thinking activado.
- Agentes con function calling: BFCL V4 (65,55 sin web_search) permite construir agentes que invoquen APIs, consulten bases de datos o ejecuten acciones estructuradas en flujos multi-paso.
- Procesamiento de documentos con imagen: al aceptar entrada de imagen, puede emplearse en extracción de información de capturas, diagramas o documentos escaneados combinados con texto.
- Despliegue en hardware AMD: pensado para servir en AMD Instinct MI3XX (gfx942/gfx950) y Ryzen AI RDNA 3+ (Strix Halo), lo que lo hace adecuado para entornos con infraestructura AMD que necesiten un MoE multimodal en una sola GPU.
- Evaluación de calidad de código y QA técnico: con contexto largo y modo thinking, puede revisar repositorios completos o especificaciones extensas y generar informes detallados.

## Benchmarks y rendimiento

Evaluación con thinking, esfuerzo xhigh, media ± error estándar de 5 ejecuciones, sobre AMD Instinct MI355X con tensor parallel 1:

| Benchmark | Tabla n-gram original | Tabla por token U (este modelo) | Diferencia U − original |
|---|---:|---:|---:|
| GSM8K (1.319 preguntas, 5-shot, strict-match) | 97,07 ± 0,11 | 96,38 ± 0,20 | -0,70 ± 0,23 |
| MMLU-Pro (12.032 preguntas, 5-shot) | 87,79 ± 0,07 | 86,72 ± 0,03 | -1,07 ± 0,13 |
| GPQA-Diamond (198 preguntas, 0-shot) | 92,12 ± 0,34 | 91,11 ± 0,71 | -1,01 ± 0,88 |
| BFCL V4 sin web_search (global, 20 categorías) | 67,50 ± 0,34 | 65,55 ± 0,37 | -1,95 ± 0,51 |
| LiveCodeBench v6 (131 problemas, 2025-02-01 a 2025-05-01), pass@1 | 87,63 ± 0,82 | 88,24 ± 0,92 | +0,61 ± 1,04 |

No se han publicado resultados de benchmarks frente a otros modelos en la información disponible; la tabla anterior compara únicamente la variante con tabla original frente a la variante con tabla por token del mismo modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: 70,54 GiB por GPU al cargar con tensor parallel 1 (frente a 164,73 GiB del checkpoint AWQ con tabla original). El tamaño del repo es de 80,1 GB, coherente con el checkpoint cuantizado más la tabla `U` de 1,27 GB.
- GPU recomendadas: AMD Instinct MI3XX (gfx942/gfx950), en particular MI355X según la reproducción; también AMD Ryzen AI RDNA 3+ (Strix Halo). No se documenta soporte para GPU NVIDIA en la información disponible.
- Cabe en GPU de consumo: no disponible como dato explícito; el requisito de 70,54 GiB excede la VRAM de GPU de consumo habituales, aunque el soporte de Ryzen AI RDNA 3+ (Strix Halo) sugiere viabilidad en APUs de gama alta con memoria unificada.
- Opciones de despliegue: vLLM 0.31.1rc1.dev88+g81198e97b con soporte PLE por token (PR #64369, pull request abierto), sobre imagen Docker `vllm/vllm-openai-rocm:nightly`. Entorno probado: ROCm 7.2.3, PyTorch 2.13.0+git733fca1, Transformers 5.19.0, Linux.
- Comando de servicio: `vllm serve <ruta> --tensor-parallel-size 1 --max-model-len 262144 --gpu-memory-utilization 0.85 --trust-remote-code --seed 1234 --reasoning-parser qwen3 --default-chat-template-kwargs '{"enable_thinking": true}'`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de otros modelos comparables en la información proporcionada. La única comparación documentada es interna, entre el mismo modelo base con tabla n-gram original y con tabla por token:

| Variante | Parámetros totales | Contexto | Memoria de carga (TP=1) | Licencia |
|---|---:|---:|---:|---|
| Qwen3.8-Flash-Next AWQ con tabla original | 20.682.892.125 | 262.144 | 164,73 GiB | qwen-community-1.0 |
| Este modelo (tabla por token U) | 20.682.892.125 | 262.144 | 70,54 GiB | qwen-community-1.0 |

Comparativa con modelos de otras familias: no disponible.

## Limitaciones y advertencias

- No es un lanzamiento del equipo Qwen: el equipo Qwen no ha evaluado ni respaldado esta versión.
- Degradación medible frente a la tabla original: -0,70 en GSM8K, -1,07 en MMLU-Pro, -1,01 en GPQA-Diamond y -1,95 en BFCL V4; la mejora en LiveCodeBench (+0,61) está dentro del error estándar.
- Los pesos de los expertos se calibraron con la tabla n-gram original y no se recalibraron para la tabla `U`, lo que puede introducir sesgos de calibración no cuantificados.
- Requiere una versión de vLLM con soporte PLE por token que, en la fecha de la información, corresponde a un pull request abierto (PR #64369), no a una versión estable; el despliegue depende de aplicar ese cambio manualmente.
- Soporte de hardware limitado a AMD (MI3XX, Ryzen AI RDNA 3+); no se documenta compatibilidad con GPU NVIDIA.
- Licencia `qwen-community-1.0` con `license: other`: es necesario revisar el archivo LICENSE para conocer las restricciones de uso comercial, que no se detallan en la información disponible.
- Idiomas soportados etiquetados como "multilingual" sin listado explícito; el rendimiento por idioma no está documentado.
- Riesgo de alucinación y sesgos: no se documentan evaluaciones de sesgo ni de seguridad en la información disponible.
- El modo thinking con esfuerzo xhigh se usó en todas las evaluaciones; el rendimiento con otros niveles de esfuerzo no está documentado.
- El contexto máximo de 262.144 tokens se indica en el comando de servicio, pero no se detalla el comportamiento de la tabla PLE por token en secuencias extremas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amd/Qwen3.8-Flash-Next-Quark-TokenPLE-AWQ-UINT4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- vLLM: https://docs.vllm.ai/en/latest/
- vLLM PR #64369 (soporte PLE por token): https://github.com/vllm-project/vllm/pull/64369
- AMD Quark (documentación): https://quark.docs.amd.com/latest/index.html
- CORPUS_DATASHEET.md (referenciado en la model card, no incluido en la información disponible): ruta relativa al repositorio del modelo
- Licencia: archivo LICENSE en el repositorio del modelo
