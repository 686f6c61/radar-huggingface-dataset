# amd/Qwen3.8-Flash-Next-Quark-TokenPLE-AWQ-UINT4

## Resumen

Qwen3.8-Flash-Next-Quark-TokenPLE-AWQ-UINT4 es una versión cuantizada del modelo multimodal Qwen/Qwen3.8-Flash-Next desarrollado por el equipo Qwen de Alibaba Group, publicada por AMD a través de su herramienta de optimización AMD-Quark. El modelo base es un transformer de mezcla de expertos (MoE) multimodal que acepta texto e imagen como entrada y genera texto, diseñado para tareas de razonamiento, generación de código, matemáticas y conversación multilingüe con una ventana de contexto de 262.144 tokens.

La modificación principal respecto al checkpoint original no es solo la cuantización: AMD ha reemplazado la tabla de embeddings n-gram PLE original de 102,4 GB en BF16 por una tabla por token `U` de 1,27 GB, lo que reduce drásticamente los requisitos de memoria. Los pesos de los expertos enrutados se cuantizan a uint4 con AWQ y tamaño de grupo 128, mientras que atención, router, experto compartido, embeddings, `lm_head` y la capa MTP se mantienen en BF16.

El resultado es un checkpoint de aproximadamente 20.680 millones de parámetros totales que requiere 70,54 GiB por GPU en tensor parallel 1, frente a los 164,73 GiB del checkpoint AWQ con la tabla original. Está pensado para desplegarse sobre hardware AMD (Instinct MI3XX y Ryzen AI RDNA 3+) con ROCm 7.2.3 y una versión de vLLM que incluya el soporte PLE por token.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (`Qwen4ExpForConditionalGeneration`, `model_type` `qwen4_exp`) con embedding PLE en la capa 1 del decoder |
| Parametros totales | 20.682.892.125 |
| Parametros activos | no disponible (MoE con 48 capas y 512 expertos enrutados por capa) |
| Longitud de contexto | 262.144 tokens (configurado en el comando de servicio con `--max-model-len 262144`) |
| Tipos de cuantizacion | uint4 weight-only, per-group (group size 128), asimétrica con zero point int32 y escalas BF16; AWQ sobre expertos enrutados |
| Idiomas soportados | multilingüe (sin listado detallado de idiomas) |
| Licencia | qwen-community-1.0 (`license: other`, `license_name: qwen-community-1.0`) |
| Formato de pesos | safetensors, formato real-quantized de Quark, para vLLM |
| Hardware soportado | AMD MI3XX (gfx942/gfx950), AMD Ryzen AI RDNA 3+ (Strix Halo) |
| Software | ROCm 7.2.3, PyTorch 2.13.0+git733fca1, Transformers 5.19.0, vLLM 0.31.1rc1.dev88+g81198e97b con PR #64369 |
| Tamano del repo | 80,1 GB |
| Tabla PLE por token | [248.320, 2.560] en BF16, 1.271.398.400 bytes |
| Modulos cuantizados | 73.728 módulos (48 capas x 512 expertos x 3 proyecciones) |
| Capas en BF16 | 922 entradas excluidas: atención, router, experto compartido, hyper-connection, embeddings, `lm_head`, tabla PLE y capa MTP |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos multimodal con 48 capas y 512 expertos enrutados por capa, más un experto compartido. La arquitectura `qwen4_exp` incorpora un embedding PLE (n-gram embedding) en la capa 1 del decoder, con `ple_layer_ids: [2]` en la configuración de texto. Acepta texto e imagen como entrada y produce texto. Incluye además una capa MTP (multi-token prediction), que se mantiene en BF16.

La cuantización se realizó con AMD Quark mediante el algoritmo AWQ en una sola pasada sobre el modelo original en BF16, exportando pesos en formato real-quantized. Solo se cuantizaron las proyecciones `gate_proj`, `up_proj` y `down_proj` de los expertos enrutados; el resto de componentes se conservan en BF16. Las escalas de `up_proj` se plegaron en `down_proj` por experto. La tabla PLE original de 320.001.536 filas x 160 valores en BF16 se sustituyó por una tabla por token `U` de forma [248.320, 2.560] obtenida por calibración sobre los datasets descritos en `CORPUS_DATASHEET.md`, con `ple_embedding_mode: "per_token"`. No se dispone de información sobre el proceso de entrenamiento original del modelo base (número de tokens, composición del dataset, RLHF/DPO) en la documentación proporcionada.

## Capacidades

- Generación de texto y razonamiento con modo thinking activable (`enable_thinking: true`), con parser de razonamiento `qwen3` en vLLM.
- Procesamiento multimodal: entrada de texto e imagen, salida de texto.
- Generación de código, evaluada en LiveCodeBench v6 con pass@1 de 88,24.
- Razonamiento matemático, evaluado en GSM8K con 96,38 de strict-match.
- Conocimiento general y razonamiento experto, evaluado en MMLU-Pro (86,72) y GPQA-Diamond (91,11).
- Tool calling y function calling, evaluado en BFCL V4 (65,55 global en 20 categorías).
- Soporte multilingüe.
- Capacidad de predicción multi-token mediante la capa MTP incluida en BF16.
- Embedding PLE por token para representaciones n-gram eficientes en memoria.

## Casos de uso

- Razonamiento matemático y resolución de problemas: con GSM8K de 96,38 en modo thinking, el modelo es adecuado para asistentes de resolución paso a paso en entornos educativos o de validación de cálculos, activando el modo thinking para obtener cadenas de razonamiento.
- Generación de código en producción: el rendimiento en LiveCodeBench v6 (88,24 pass@1) y el soporte de tool calling permiten integrarlo en pipelines de CI/CD para generación de tests, revisión de parches o autocompletado contextualizado con ventanas de hasta 262.144 tokens.
- Agentes con tool calling: el soporte de BFCL V4 y function calling permite construir agentes multi-paso que invoquen APIs, consulten bases de datos o ejecuten acciones estructuradas, con el parser de razonamiento de vLLM gestionando el modo thinking.
- Análisis de documentos e imágenes: al aceptar entrada de imagen y texto, puede emplearse para extracción de información de capturas, diagramas o documentos escaneados combinada con razonamiento textual.
- Asistencia técnica multilingüe: el soporte multilingüe y la ventana de contexto larga permiten gestionar conversaciones multi-turno con historial extenso, útil en atención al cliente o soporte interno.
- Procesamiento de repositorios completos: con 262.144 tokens de contexto, puede analizar bases de código extensas, resumir cambios entre versiones o responder preguntas sobre documentación técnica de gran tamaño.
- Despliegue en infraestructura AMD: al estar optimizado para MI3XX y Ryzen AI RDNA 3+, encaja en entornos con ROCm que busquen reducir el consumo de memoria frente al checkpoint BF16 original (70,54 GiB frente a 164,73 GiB por GPU).

## Benchmarks y rendimiento

Resultados publicados en la model card, en modo thinking con esfuerzo xhigh, media ± error estándar sobre 5 ejecuciones, comparando la tabla n-gram original con la tabla por token `U` de este checkpoint:

| Benchmark | Tabla original | Tabla U (este modelo) | Diferencia U − original |
|---|---:|---:|---:|
| GSM8K (1.319 preguntas, 5-shot, strict-match) | 97,07 ± 0,11 | 96,38 ± 0,20 | -0,70 ± 0,23 |
| MMLU-Pro (12.032 preguntas, 5-shot) | 87,79 ± 0,07 | 86,72 ± 0,03 | -1,07 ± 0,13 |
| GPQA-Diamond (198 preguntas, 0-shot) | 92,12 ± 0,34 | 91,11 ± 0,71 | -1,01 ± 0,88 |
| BFCL V4 sin web_search (global, 20 categorías) | 67,50 ± 0,34 | 65,55 ± 0,37 | -1,95 ± 0,51 |
| LiveCodeBench v6 (131 problemas, 2025-02-01 a 2025-05-01), pass@1 | 87,63 ± 0,82 | 88,24 ± 0,92 | +0,61 ± 1,04 |

La evaluación se realizó sobre AMD Instinct MI355X con tensor parallel 1, usando lm-evaluation-harness 0.4.13, Berkeley Function Call Leaderboard (commit `dac44e7`) y LiveCodeBench (runner `28fef95e`, dataset `livecodebench/code_generation_lite` revisión `0fe84c39`).

## Requisitos de hardware

- VRAM estimada para inferencia: 70,54 GiB por GPU en tensor parallel 1, según la model card. El checkpoint AWQ con la tabla original requiere 164,73 GiB.
- GPU recomendadas: AMD Instinct MI3XX (gfx942/gfx950), como MI355X empleada en la evaluación. También se indica soporte para AMD Ryzen AI RDNA 3+ (Strix Halo).
- No se indica compatibilidad con GPUs NVIDIA ni con hardware consumer de AMD distinto de Ryzen AI RDNA 3+.
- Despliegue: vLLM 0.31.1rc1.dev88+g81198e97b con el cambio del PR #64369 (soporte PLE por token), sobre la imagen `vllm/vllm-openai-rocm:nightly`. Se requiere ROCm 7.2.3 y `--trust-remote-code`.
- Comando de servicio indicado: `vllm serve <path> --tensor-parallel-size 1 --max-model-len 262144 --gpu-memory-utilization 0.85 --trust-remote-code --seed 1234 --reasoning-parser qwen3 --default-chat-template-kwargs '{"enable_thinking": true}'`.
- Latencia y throughput: no disponibles en la información proporcionada.
- Opciones de despliegue alternativas (llama.cpp, Ollama, TGI): no disponibles; el modelo está empaquetado para vLLM con formato real-quantized de Quark.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Cuantizacion | Licencia | Hardware | Memoria de carga |
|---|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-Quark-TokenPLE-AWQ-UINT4 (este) | 20.682.892.125 | 262.144 | AWQ uint4 g128, weight-only | qwen-community-1.0 | AMD MI3XX, Ryzen AI RDNA 3+ | 70,54 GiB/GPU (TP1) |
| Qwen3.8-Flash-Next AWQ con tabla original | no disponible | 262.144 | AWQ uint4 g128 | qwen-community-1.0 | AMD (según checkpoint) | 164,73 GiB/GPU (TP1) |
| Qwen/Qwen3.8-Flash-Next (BF16) | no disponible | 262.144 | ninguna (BF16) | qwen-community-1.0 | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables de la misma categoría (MoE multimodal de ~20B) en la documentación proporcionada.

## Limitaciones y advertencias

- La tabla PLE por token `U` introduce una degradación medible frente a la tabla n-gram original: -0,70 en GSM8K, -1,07 en MMLU-Pro, -1,01 en GPQA-Diamond y -1,95 en BFCL V4. LiveCodeBench mejora ligeramente (+0,61), pero con un error estándar de ±1,04.
- Los pesos de los expertos cuantizados no se recalibraron para la nueva tabla `U`; proceden del checkpoint AWQ con la tabla original.
- El modelo no es un lanzamiento del equipo Qwen, que no lo ha evaluado ni respaldado. Cualquier decisión de producción debe considerar que se trata de una modificación de terceros.
- Requiere una versión de vLLM con el PR #64369 (abierto, no fusionado en el momento de la publicación), lo que implica aplicar parches manuales sobre la imagen nightly.
- Soporte de hardware limitado a AMD MI3XX y Ryzen AI RDNA 3+; no se documenta compatibilidad con NVIDIA ni con GPUs consumer convencionales.
- Licencia `qwen-community-1.0`: es necesario revisar el archivo LICENSE para conocer las restricciones exactas de uso comercial, que no se detallan en la model card.
- No se dispone de información sobre sesgos, tasas de alucinación ni evaluación específica por idioma más allá de la etiqueta "multilingual".
- El modo thinking con esfuerzo xhigh es el configurado en las evaluaciones; el rendimiento en modos sin thinking no está documentado.
- El proceso de calibración de la tabla `U` depende de los datasets de `CORPUS_DATASHEET.md`; su cobertura condiciona el comportamiento del embedding PLE.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amd/Qwen3.8-Flash-Next-Quark-TokenPLE-AWQ-UINT4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Documentación de vLLM: https://docs.vllm.ai/en/latest/
- PR de vLLM con soporte PLE por token: https://github.com/vllm-project/vllm/pull/64369
- Documentación de AMD-Quark: https://quark.docs.amd.com/latest/index.html
- Ficha de calibración (referenciada en la model card): `CORPUS_DATASHEET.md` en el repositorio del modelo
- Licencia: `LICENSE` en el repositorio del modelo
