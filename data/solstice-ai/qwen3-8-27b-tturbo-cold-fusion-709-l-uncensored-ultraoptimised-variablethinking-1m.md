# Solstice-AI/Qwen3.8-27B-TTURBO-Cold-Fusion-709-L-Uncensored-UltraOptimised-VariableThinking-1M

## Resumen

Qwen3.8-27B-TTURBO-Cold-Fusion-709-L-Uncensored-UltraOptimised-VariableThinking-1M es una cuantización GGUF curada del modelo base DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored, publicada por Solstice-AI. Se trata de un derivado del linaje Qwen3.8-27B sometido a un proceso de "merge" GAIN y a técnicas de abliteración (eliminación de rechazos) por parte de DavidAU, sobre el que Solstice-AI aplica su propia suite de cuantización, integración de Multi-Token Prediction (MTP) nativo y una arquitectura cognitiva de 10 niveles de razonamiento.

El modelo se distribuye exclusivamente en formato GGUF para su uso con llama.cpp y Ollama, con checkpoints que van desde Q4_K_M (17,23 GB) hasta Q8_0 (28,16 GB), además de un proyector multimodal mmproj en BF16 (0,87 GB) que habilita entrada de imágenes y fotogramas de vídeo. La model card declara una ventana de contexto de hasta 1M de tokens (según el sufijo del identificador), capacidades de razonamiento con "thinking mode" variable, generación de código y soporte multilingüe limitado a inglés y chino.

La relevancia de esta ficha es doble: por un lado, documenta un ejemplo extremo de la práctica de "model merging" y cuantización comunitaria que abunda en Hugging Face; por otro, advierte de las inconsistencias entre las etiquetas del repositorio y los datos reales de pesos, algo crítico para cualquier evaluación técnica rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3.8-27B) con MTP nativo y proyector multimodal; detalles de capas y atención no disponibles |
| Parametros totales | 460.730.096 según safetensors del repo (el nombre comercial indica 27B; discrepancia no resuelta) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | hasta 1M tokens (según identificador y model card); no verificado en config |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q6_K, Q8_0 (todos en tier MAX-MTP con lm_head en 16 bits); mmproj en BF16 |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp/Ollama); repo de 333 GB con múltiples checkpoints |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer derivado de la familia Qwen3.8-27B, transformado mediante un merge GAIN ("Twin-Turbo") y un proceso de abliteración que elimina los mecanismos de rechazo del modelo original. Sobre esa base, Solstice-AI integra cabezas de Multi-Token Prediction (MTP) nativas en precisión Q8_0 y mantiene el tensor de salida (lm_head / output.weight) en 16 bits sin cuantizar en todos los checkpoints de la suite, con el objetivo declarado de preservar la precisión de razonamiento (Arc-C 701+ a 4 bits según la model card). También se incluye un proyector multimodal BF16 para entrada de imágenes y vídeo.

No se dispone de información verificable sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. El dataset citado en las etiquetas es Solstice-AI/Solace-1.0-Omni, pero no se detalla su contenido. La "arquitectura cognitiva de 10 niveles" se implementa a nivel de plantilla de chat (tokenizer_config.json y chat_template.jinja) mediante etiquetas como `{REASON:amax}` o parámetros `reasoning_effort` en la API, no como un cambio estructural del modelo. La innovación técnica más destacable es la decodificación especulativa basada en MTP nativo, que acelera la generación sin necesidad de un draft model externo.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" configurable en 10 niveles (de 0 tokens de razonamiento a derivación sistémica profunda).
- Generación de código y soporte declarado para tareas de programación (etiqueta "coding").
- Entrada multimodal imagen-texto y fotogramas de vídeo mediante el proyector mmproj-BF16.
- Decodificación especulativa con Multi-Token Prediction nativo para acelerar la inferencia.
- Modo instruct instantáneo (cierre inmediato de `<think></think>`) para respuestas directas sin tokens de razonamiento.
- Multilingüe limitado a inglés y chino.
- Sin censura declarada (abliterated/uncensored): no aplica rechazos por contenido.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente, aunque el modo de razonamiento profundo es compatible con flujos multi-paso.

## Casos de uso

- Razonamiento técnico profundo en local: con el checkpoint Q6_K (22,38 GB) en una RTX 3090/4090 se puede activar el nivel `high` o `Solstice` para análisis de arquitecturas de sistemas, modelado de fallos y derivaciones multi-paso sin depender de la nube.
- Generación de código asistida en estaciones de trabajo: el checkpoint Q4_K_M (17,23 GB) cabe en GPUs de 16 GB como la RTX 4080 y permite autocompletado y generación de funciones con modo instruct instantáneo para minimizar latencia.
- Análisis de imágenes y fotogramas de vídeo: cargando el mmproj-BF16 junto al checkpoint principal en llama.cpp, se pueden procesar capturas de pantalla, diagramas o frames para descripción y extracción de información.
- Investigación sobre alineación y seguridad: al ser un modelo abliterado, sirve como caso de estudio para evaluar cómo la eliminación de rechazos afecta a la tasa de cumplimiento de peticiones dañinas y a la calidad general.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse íntegramente en local con Ollama o llama.cpp, es apto para procesar documentación sensible sin enviar datos a terceros.
- Prototipado de pipelines de razonamiento variable: el parámetro `reasoning_effort` permite ajustar el coste computacional por consulta, útil para comparar calidad frente a latencia en sistemas de enrutamiento de consultas.
- Experimentación con decodificación especulativa: el MTP nativo permite medir ganancias de throughput en llama.cpp frente a modelos sin cabezas de predicción múltiple.

## Benchmarks y rendimiento

La model card menciona de forma cualitativa un resultado de "Arc-C 701" (ARC-Challenge) para el checkpoint Q4_K_M, así como la etiqueta "709-arc" y "Frontier Tier". No se proporcionan tablas completas ni resultados de MMLU, HumanEval o GSM8K, ni comparaciones numéricas verificables con otros modelos.

| Benchmark | Resultado declarado | Notas |
|---|---|---|
| ARC-Challenge | 701 (Q4_K_M) / 709 (etiqueta) | Dato de la model card, sin metodología detallada |
| MMLU | no disponible | — |
| HumanEval | no disponible | — |
| GSM8K | no disponible | — |

No se han publicado resultados de benchmarks completos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 16 GB para Q4_K_M (17,23 GB de archivo), 24 GB para Q5_K_M (19,73 GB), 24-32 GB para Q6_K (22,38 GB) y 32 GB o más para Q8_0 (28,16 GB).
- GPU recomendadas: RTX 4080 (16 GB) para Q4_K_M; RTX 3090/4090 (24 GB) para Q5_K_M y Q6_K; A100/H100 o configuraciones multi-GPU para Q8_0.
- Cabe en GPU de consumo: sí, Q4_K_M en RTX 4080 y Q5_K_M/Q6_K en RTX 3090/4090; también en Apple Silicon con memoria unificada suficiente.
- Opciones de despliegue: llama.cpp y Ollama (soportados oficialmente según la model card); compatibilidad con LM Studio, OpenWebUI y LibreChat mencionada para las etiquetas de chat.
- Latencia y throughput: no disponibles; la model card afirma mejoras por MTP nativo pero no publica cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (Qwen3.8-27B TTURBO Cold Fusion) | 460M según safetensors; 27B nominal | hasta 1M | Apache 2.0 | GGUF | Derivado abliterado con MTP y visión |
| Qwen3 base (familia oficial) | ~27B (variantes) | hasta 128K típicamente | Apache 2.0 | safetensors, GGUF | Modelo original alineado, sin abliteración |
| DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored | 27B nominal | no disponible | Apache 2.0 | safetensors/GGUF | Modelo base de esta cuantización |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Discrepancia crítica entre el nombre comercial (27B) y los parámetros reales declarados en safetensors (460,7M): debe verificarse antes de cualquier uso en producción.
- Modelo abliterado y "uncensored": no aplica rechazos, lo que implica riesgo elevado de generar contenido dañino, ilegal o sesgado; no apto para aplicaciones orientadas al público sin filtros adicionales.
- Riesgo de alucinación no cuantificado; el modo de razonamiento profundo puede aumentar la longitud de salida sin garantizar corrección factual.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado y probablemente sea deficiente.
- El contexto de 1M tokens no está verificado en la configuración y puede degradar la calidad en ventanas muy largas.
- Licencia Apache 2.0 permite uso comercial, pero el linaje de merges y la abliteración pueden introducir obligaciones o riesgos no declarados por los autores originales.
- La "arquitectura cognitiva de 10 niveles" es una convención de plantilla de chat, no una capacidad estructural verificada; su eficacia no está respaldada por benchmarks públicos.
- El repositorio ocupa 333 GB con múltiples checkpoints; el almacenamiento y la transferencia son costosos.
- Fecha de creación (2026-09-11) y actualización (2026-10-15) en el futuro respecto a la información de referencia: verificar la vigencia real del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/Solstice-AI/Qwen3.8-27B-TTURBO-Cold-Fusion-709-L-Uncensored-UltraOptimised-VariableThinking-1M
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored
- Dataset citado: https://huggingface.co/datasets/Solstice-AI/Solace-1.0-Omni
- Perfil del autor de la cuantización: https://huggingface.co/Solstice-AI
- Perfil del autor del modelo base: https://huggingface.co/DavidAU
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
