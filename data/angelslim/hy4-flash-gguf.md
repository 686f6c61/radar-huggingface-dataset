# AngelSlim/Hy4-flash-GGUF

## Resumen

Hy4-flash es un modelo de lenguaje de gran escala desarrollado por Tencent, publicado originalmente como `tencent/Hy4-flash`. Esta ficha cubre la versión cuantizada en formato GGUF distribuida por AngelSlim, el toolkit de compresión de modelos de Tencent, que ofrece cinco builds distintos optimizados para distintos compromisos entre tamaño y calidad.

El modelo base cuenta con 222.679.844.717 parámetros totales (aproximadamente 222,7 mil millones), lo que lo sitúa en la categoría de modelos de gran tamaño. La arquitectura es de tipo MoE (Mixture of Experts), a juzgar por las referencias a "routed experts" y proyecciones `gate`/`up`/`down` en la documentación de cuantización, aunque el número de parámetros activos no está disponible en la información proporcionada.

La relevancia de esta ficha radica en que las builds GGUF permiten ejecutar un modelo de más de 220 mil millones de parámetros en hardware de consumo y estaciones de trabajo (Mac M5 Max de 128 GB, RTX Spark de 128 GB), algo impensable en precisión completa. Las cinco variantes cubren desde 125,73 GiB (IQ2-AH) hasta 156,79 GiB (Q4_K_M), con velocidades de decodificación documentadas de entre 25 y 50 tok/s según formato y hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts), con proyecciones `gate`/`up`/`down` en expertos enrutados; detalles completos no disponibles |
| Parametros totales | 222.679.844.717 (≈222,7 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (los ejemplos de uso emplean `-c 8192`) |
| Tipos de cuantizacion | Q4_K_M, SPARK-4Bit, SPARK-4Bit-Fast, Q3_K, IQ2-AH (GGUF) |
| Idiomas soportados | zh, en (según tags y model card); ar también en tags |
| Licencia | no disponible |
| Formato de pesos | GGUF (5 builds); pesos originales del modelo base presumiblemente safetensors, no confirmado |

## Arquitectura y entrenamiento

La información disponible confirma que Hy4-flash es un modelo MoE con expertos enrutados que emplean proyecciones `gate`, `up` y `down`, y que incorpora una "Engram table" (tabla de Engram) que se excluye del cálculo de bpw en las builds cuantizadas. Esto sugiere una arquitectura con componentes de memoria o embedding especializados, aunque los detalles completos de la arquitectura (número de expertos, top-k de enrutamiento, dimensiones ocultas) no están disponibles en la información proporcionada.

El modelo base fue desarrollado por Tencent y publicado como `tencent/Hy4-flash`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras etapas de alineación. La model card de esta versión GGUF se centra en los detalles de cuantización y rendimiento, no en el entrenamiento del modelo base. Existe un informe técnico referenciado (arXiv:2602.21233) que probablemente contiene estos detalles, pero su contenido no está incluido en la información proporcionada.

La innovación técnica destacable de esta distribución es el uso de recetas de cuantización mixtas: en Q4_K_M, las proyecciones `gate`/`up` de los expertos enrutados usan Q4_K, mientras que `down` recibe Q6_K en 19 capas y Q4_K en las otras 22, siguiendo la regla fija de llama.cpp. En Q3_K, la selección de capas que mantienen Q4_K se basa en sensibilidad a la cuantización. En IQ2-AH, las proyecciones `gate`/`up` bajan a 2,0625 bpw (IQ2_XXS) mientras el resto de pesos no-expertos permanecen en BF16.

## Capacidades

- Generación de texto conversacional (tag `conversational`).
- Capacidades multilingües limitadas a chino, inglés y árabe según los tags del repositorio.
- Entrada de imágenes: la model card documenta el uso de `llama-mtmd-cli` con un archivo `mmproj-Hy4-flash-bf16.gguf`, lo que confirma soporte de visión.
- Compatibilidad con endpoints tipo OpenAI mediante `llama-server` (tag `endpoints_compatible`).
- Soporte de plantillas de chat mediante `--jinja`.
- Generación de código: la model card menciona explícitamente escenarios de "code generation" con velocidades de hasta 70 tok/s (Q3_K) y 40 tok/s (SPARK-4Bit-Fast).
- Razonamiento de múltiples pasos y tool calling: no confirmado explícitamente en la información disponible.
- Modo "thinking": no disponible en la información proporcionada.

## Casos de uso

- **Asistente conversacional local en estación de trabajo**: con la build Q4_K_M (156,79 GiB) en un Mac M5 Max de 128 GB o RTX Spark de 128 GB, se puede desplegar un servidor compatible con OpenAI (`llama-server`) para conversaciones multi-turno sin depender de la nube, con decodificación de ~45-48 tok/s.

- **Generación de código en local**: la model card reporta hasta 70 tok/s en generación de código con Q3_K en Mac M5 Max, lo que permite usar el modelo como asistente de programación en IDE mediante la API compatible de `llama-server`.

- **Procesamiento de documentos con imágenes**: gracias al soporte de visión (`mmproj-Hy4-flash-bf16.gguf`), el modelo puede describir imágenes y, presumiblemente, responder preguntas sobre capturas, diagramas o documentos escaneados, usando `llama-mtmd-cli`.

- **Despliegue en hardware con memoria limitada**: la build IQ2-AH (125,73 GiB) permite ejecutar el modelo en sistemas con 128 GB de memoria unificada o VRAM, a costa de una mayor pérdida de calidad por la cuantización agresiva de los expertos enrutados (2,0625 bpw en `gate`/`up`).

- **Evaluación e investigación de cuantización**: las cinco builds con distintas recetas (Q4_K_M, Q3_K, IQ2-AH, SPARK-4Bit, SPARK-4Bit-Fast) permiten a investigadores comparar el impacto de distintas estrategias de cuantización sobre la calidad y la velocidad en un modelo de 222,7 B parámetros.

- **Servicio de inferencia compatible con OpenAI**: el tag `endpoints_compatible` y el soporte de `llama-server` permiten integrar el modelo en pipelines existentes que ya consumen APIs tipo OpenAI, sin cambios en el código cliente.

- **Escenarios de "workbuddy"**: la model card menciona que las pruebas de velocidad se realizaron en "real workbuddy scenarios", lo que sugiere uso como asistente de productividad o copiloto de tareas.

## Benchmarks y rendimiento

La model card incluye una imagen de resultados de benchmark (`hy4-flash-gguf-benchmark.png`) cuyo contenido numérico no está transcrito en la información proporcionada. No se dispone de valores de MMLU, HumanEval, GSM8K ni otros benchmarks en formato textual.

Los únicos datos numéricos de rendimiento disponibles son de velocidad de inferencia:

**Mac M5 Max 128GB**

| Formato | Prefill tok/s (4K / 16K / 32K) | Decode tok/s (4K / 16K / 32K) |
|---|---|---|
| Q4_K_M | 629,8 / 448,1 / 418,6 | 48,13 / 45,18 / 44,15 |
| Q3_K | 743,2 / 563,0 / 520,6 | 50,34 / 49,47 / 47,37 |

**RTX Spark 128GB**

| Formato | Prefill tok/s (4K / 16K / 32K) | Decode tok/s (4K / 16K / 32K) |
|---|---|---|
| SPARK-4Bit-Fast | 799 / 717 / 707 | 31,95 / 33,14 / 33,39 |
| SPARK-4Bit | 765 / 686 / 666 | 25,80 / 28,16 / 30,3 |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en formato textual en la información disponible.

## Requisitos de hardware

- **VRAM/memoria estimada**: entre 125,73 GiB (IQ2-AH) y 156,79 GiB (Q4_K_M) solo para los pesos. Hay que añadir memoria para el contexto KV y overhead del runtime, por lo que se recomienda al menos 128 GB para IQ2-AH y ~160-192 GB para Q4_K_M.
- **GPU recomendadas**: no se especifican GPUs de datacenter (A100, H100) en la información; las pruebas documentadas usan Mac M5 Max 128GB (Metal) y RTX Spark 128GB.
- **Consumer GPU**: no cabe en GPUs de consumo convencionales (RTX 4090 con 24 GB, etc.). Requiere sistemas con memoria unificada de 128 GB o más (Mac M5 Max, RTX Spark) o configuraciones multi-GPU.
- **Opciones de despliegue**: llama.cpp (requiere el PR #32517, aún no fusionado), `llama-cli`, `llama-server` (API compatible con OpenAI), `llama-mtmd-cli` para visión. No se mencionan vLLM, TGI ni Ollama.
- **Latencia y throughput**: ver tablas de velocidad arriba. En Mac M5 Max, decodificación de 44-50 tok/s; en RTX Spark, 25-33 tok/s. Prefill de 418-799 tok/s según formato y longitud de contexto.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La model card no incluye comparativas con otros modelos de tamaño similar (por ejemplo, otros MoE de ~200 B parámetros). No disponible.

## Limitaciones y advertencias

- **Licencia no especificada**: la información disponible no indica la licencia del modelo, lo que impide confirmar si el uso comercial está permitido. Es imprescindible verificar la licencia del modelo base `tencent/Hy4-flash` antes de usarlo en producción.
- **Idiomas limitados**: solo chino, inglés y árabe según los tags; no hay soporte confirmado de castellano.
- **Soporte de llama.cpp incompleto**: requiere compilar desde el PR #32517, que no está fusionado en la rama principal. Esto implica riesgo de inestabilidad y falta de soporte a largo plazo.
- **Requisitos de memoria muy elevados**: incluso la build más pequeña (IQ2-AH) necesita ~125,73 GiB solo para pesos, lo que excluye prácticamente todo el hardware de consumo convencional.
- **Pérdida de calidad por cuantización**: la build IQ2-AH usa 2,0625 bpw en las proyecciones `gate`/`up` de los expertos enrutados, lo que puede degradar notablemente la calidad. La model card recomienda Q4_K_M como opción segura.
- **Riesgo de alucinación**: no cuantificado en la información disponible; aplicable el riesgo habitual de los LLM de gran escala.
- **Sesgos**: no documentados en la información proporcionada.
- **Contexto**: la longitud de contexto nativa no está especificada; los ejemplos usan 8192 tokens, lo que no confirma el máximo soportado.
- **Visión**: requiere un archivo `mmproj` separado (`mmproj-Hy4-flash-bf16.gguf`) y el binario `llama-mtmd-cli`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AngelSlim/Hy4-flash-GGUF
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Informe técnico (arXiv): https://arxiv.org/abs/2602.21233
- Documentación de AngelSlim: https://angelslim.readthedocs.io/
- Organización AngelSlim en Hugging Face: https://huggingface.co/AngelSlim
- Organización AngelSlim en ModelScope: https://modelscope.cn/organization/AngelSlim
- Repositorio GitHub de AngelSlim: https://github.com/Tencent/AngelSlim
- PR de llama.cpp con soporte para Hy4-flash: https://github.com/ggml-org/llama.cpp/pull/32517
- README específico para Mac Metal: https://huggingface.co/AngelSlim/Hy4-flash-GGUF/blob/main/README_MAC-Metal.md
- README específico para SPARK-4Bit: https://huggingface.co/AngelSlim/Hy4-flash-GGUF/blob/main/README_SPARK-4Bit.md
- Discord de AngelSlim: https://discord.com/invite/dHVNeuNdFt
