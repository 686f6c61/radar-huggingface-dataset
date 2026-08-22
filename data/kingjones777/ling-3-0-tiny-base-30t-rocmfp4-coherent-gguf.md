# kingjones777/Ling-3.0-tiny-base-30T-ROCmFP4-COHERENT-GGUF

## Resumen

Ling-3.0-tiny-base-30T es uno de los seis checkpoints de entrenamiento publicados por InclusionAI el 20 de agosto de 2026 como parte de la familia Ling-3.0. Se trata de un modelo híbrido de razonamiento con arquitectura MoE (mixture-of-experts) diseñado para despliegue en entornos con recursos limitados, con 8.210 millones de parámetros totales y solo 1.300 millones activos por token. La variante que analizamos aquí es una cuantización GGUF en formato ROCmFP4 (ftype 102, Q4_0_ROCMFP4_COHERENT) preparada por el usuario kingjones777 específicamente para hardware AMD Strix Halo (gfx1151, Ryzen AI Max+ 395).

Este checkpoint concreto corresponde a la etapa de entrenamiento de 30 billones de tokens y está pensado para continuar el pretraining, adaptación de dominio y fine-tuning. No es un modelo instructivo: carece de ajuste por instrucciones y debe tratarse como un modelo de continuación de texto. Su relevancia radica en que ofrece una arquitectura híbrida innovadora (KDA linear attention + MLA) con ventana de contexto de 262.144 tokens, cuantizada de forma eficiente para hardware AMD de última generación, con licencia MIT que permite uso comercial sin restricciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | bailing-hybrid (KDA linear attention + MLA) |
| Parámetros totales | 8.209.997.600 (8,21B) |
| Parámetros activos | 1,3B (MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | Q4_0_ROCMFP4_COHERENT (ftype 102) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

Ling-3.0-tiny-base-30T emplea una arquitectura híbrida denominada `bailing-hybrid`, que combina atención lineal KDA (Kernel-based Dual Attention) con atención de múltiples cabezas latentes (MLA). La variante tiny configura `q_lora_rank: 256`, lo que implica una compresión de queries en dos etapas (`q_a_proj` → RMS norm → `q_b_proj`), un diseño que difiere de la variante flash del mismo modelo y que obliga a usar un parche específico sobre el código de ROCmFPX para poder cargar los pesos en llama.cpp. El modelo tiene 25 bloques (24 capas + 1 capa MTP de predicción multi-token) y 549 tensores. El checkpoint fue entrenado con 30 billones de tokens, como indica el sufijo "30T", y no ha pasado por RLHF ni DPO: es un checkpoint de entrenamiento puro. La cabecera MTP está entrenada junto al modelo, pero en este checkpoint concreto su calidad es deficiente: las mediciones muestran una pérdida de rendimiento del 4,4 % al activarla, por lo que se recomienda deshabilitarla.

## Capacidades

- Generación de texto por continuación: el modelo funciona como un predictor de texto autoregresivo, completando secuencias de forma coherente a partir de un prefijo.
- Razonamiento complejo: la arquitectura MoE híbrida está diseñada para razonamiento multi-paso con solo 1,3B parámetros activos, lo que permite ejecutar tareas de razonamiento a bajo coste computacional.
- Ventana de contexto larga: soporta hasta 262.144 tokens, útil para documentos extensos, análisis de código fuente o conversaciones con historial largo.
- Multi-token prediction (MTP): la cabecera de predicción de múltiples tokens está presente en los pesos, aunque las mediciones muestran que en este checkpoint concreto degrada el rendimiento (pérdida del 4,4 %).
- Capacidades de agente y tool calling: según la documentación de la familia Ling-3.0, estos modelos están diseñados para agentes responsivos y seguimiento de instrucciones, aunque este checkpoint base no incluye el ajuste instructivo.
- Multilingüismo: no se ha publicado información sobre los idiomas soportados en esta variante.
- Modo de razonamiento conmutable: en las versiones instructivas de Ling-3.0 existe un modo de pensamiento conmutable; en este checkpoint base no está disponible.

## Casos de uso

- **Continuación de pretraining en dominios específicos**: al ser un checkpoint base, es ideal para continuar el entrenamiento con datos de dominios concretos (legal, médico, técnico) sin partir de cero. Se cargaría el modelo en llama.cpp con el parche ROCmFPX y se realizaría fine-tuning con el dataset propio.
- **Adaptación de dominio para generación de código**: su arquitectura híbrida con atención linear permite procesar secuencias largas de código con menor coste de memoria, siendo adecuado para fine-tuning sobre repositorios de código específicos.
- **Investigación en arquitecturas híbridas**: el checkpoint sirve como objeto de estudio para analizar el comportamiento de la atención KDA combinada con MLA en tareas de razonamiento y comprensión de contexto largo.
- **Despliegue en equipos con AMD Strix Halo**: la cuantización ROCmFP4 está optimizada para la GPU Radeon 8060S integrada en los Ryzen AI Max 395, permitiendo ejecución local de un modelo de 8B con ventana de 262K tokens en un solo equipo unificado de memoria.
- **Generación de texto técnica y científica**: el ejemplo de salida incluido en la model card muestra una continuación coherente sobre historia de las matemáticas, indicando que el modelo puede generar prosa técnica de calidad razonable.
- **Evaluación de decodificación especulativa**: el checkpoint es útil para evaluar el impacto de la cabecera MTP en modelos de base, comparando rendimiento con y sin drafter en hardware AMD.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica de rendimiento documentada es el throughput de generación medido en el hardware de referencia:

| Configuración | Throughput (generación) | Runs |
|---|---|---|
| Sin drafter | 107,6 t/s | 107,4 / 107,6 / 107,6 |
| Con MTP (n-max 3) | 102,9 t/s | 102,9 / 103,2 / 102,4 |

Estas mediciones se realizaron con `llama-cli` en un AMD Ryzen AI Max+ 395 con Radeon 8060S (gfx1151), ROCm 7.2.4, 128 GB de memoria unificada, con `-dio -ngl 999 -st -c 2048 -n 512`. La activación de MTP supone una pérdida neta de 4,4 % en velocidad de generación, por lo que se recomienda no habilitarla en este checkpoint.

## Requisitos de hardware

- **VRAM estimada**: el archivo GGUF ocupa 4.769.674.624 bytes (4,44 GB), por lo que cabe en cualquier GPU con al menos 6 GB de VRAM. En sistemas con memoria unificada (como Strix Halo) se puede usar la memoria compartida del sistema.
- **GPU recomendadas**: AMD Radeon 8060S (gfx1151) integrada en Ryzen AI Max 395, o cualquier GPU AMD compatible con ROCm 7.2.4. No se han publicado pruebas en GPUs NVIDIA.
- **Compatibilidad con GPU de consumo**: sí, cabe en GPUs de consumo con 8 GB de VRAM (RTX 4060, RX 7600, etc.), pero requiere un llama.cpp parcheado con soporte ROCmFPX para la arquitectura `bailing-hybrid`.
- **Opciones de despliegue**: llama.cpp con parche ROCmFPX (obligatorio); no compatible con vLLM, Ollama o TGI sin adaptaciones no documentadas.
- **Latencia y throughput**: 107,6 t/s de generación medidos en el hardware de referencia (AMD Strix Halo); en GPUs inferiores se esperaría un rendimiento proporcionalmente menor.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Ling-3.0-tiny-base-30T (este) | 8,21B | 1,3B | 262.144 | MIT | GGUF |
| Ling-3.0-tiny (instruct) | 8,21B | 1,3B | 262.144 | MIT | safetensors / GGUF |
| Ling-3.0-tiny-flash | 8,21B | 1,3B | 262.144 | MIT | safetensors / GGUF |

No se dispone de datos comparativos con modelos de otros fabricantes (como Qwen2.5-7B, Gemma-2-9B o DeepSeek-R1-Distill-7B) en la información disponible. La comparativa se limita a las variantes de la propia familia Ling-3.0. La diferencia clave entre este checkpoint y la versión instructiva es la ausencia de ajuste por instrucciones, mientras que la variante flash difiere en la configuración de `q_lora_rank` (null en flash, 256 en tiny), lo que afecta a la implementación del MLA.

## Limitaciones y advertencias

- **Checkpoint base, no instructivo**: el modelo no ha sido ajustado con instrucciones ni RLHF. No debe usarse como chatbot directamente; produce continuaciones de texto, no respuestas a preguntas. Para uso conversacional se debe usar `inclusionAI/Ling-3.0-tiny`.
- **MTP degrada el rendimiento**: la decodificación especulativa con la cabecera MTP de este checkpoint produce una pérdida medida del 4,4 % en throughput. No habilitar `--spec-type draft-mtp`.
- **Requiere llama.cpp parcheado**: la arquitecturabailing-hybrid con `q_lora_rank: 256` no está soportada por el llama.cpp estándar. Es necesario aplicar un parche de aproximadamente 51 líneas sobre ROCmFPX, y verificar su presencia con `strings libllama.so | grep bailing-hybrid`.
- **Sin datos de perplejidad**: no se ha publicado ninguna medida de perplejidad para este build, por lo que la calidad de la cuantización no está cuantificada más allá de la verificación de coherencia textual y la auditoría de tensores.
- **Limitado a arquitecturas AMD**: la cuantización ROCmFP4 está orientada a GPUs AMD con ROCm 7.2.4 (gfx1151). No se garantiza su funcionamiento en GPUs NVIDIA o Intel.
- **Sesgos y alucinaciones**: al ser un checkpoint base sin ajuste instructivo, el riesgo de alucinación es alto si se usa directamente en aplicaciones de producción. No hay datos sobre sesgos específicos del modelo.
- **Restricciones de licencia**: licencia MIT, sin restricciones de uso comercial conocidas. Se hereda del modelo base de inclusionAI.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/kingjones777/Ling-3.0-tiny-base-30T-ROCmFP4-COHERENT-GGUF
- Modelo base en HuggingFace: https://huggingface.co/inclusionAI/Ling-3.0-tiny-base-30T
- Documentación oficial de Ling: https://developer.ant-ling.com/en/docs/models/ling/
- Modelo instruct en ModelScope: https://www.modelscope.cn/models/inclusionAI/Ling-3.0-tiny
- Página de precios y benchmarks en OpenRouter: https://openrouter.ai/inclusionai/ling-3.0-tiny
- Repositorio ROCmFPX (parche requerido): https://github.com/charlie12345/ROCmFPX
- Variante Q8_0 del mismo autor: https://huggingface.co/kingjones777/Ling-3.0-tiny-ROCmFPX-Q8_0-GGUF
