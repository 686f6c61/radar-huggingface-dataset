# ArchSpace-Collection/NCP_ArchPreview_dolma3_8.9B_Stage1

## Resumen

NCP-ArchPreview 8.9B Stage 1 es un modelo de lenguaje autoregresivo de espacio latente desarrollado por el equipo NCP, una colaboración entre Shanghai AI Lab y LUMIA Lab de la Universidad Jiao Tong de Shanghai. El modelo introduce la predicción del siguiente concepto (Next Concept Prediction, NCP), una representación latente que abarca un grupo corto de tokens y que guía al decodificador de tokens durante la generación. Esta arquitectura mantiene la interfaz estándar de predicción del siguiente token, lo que facilita su integración con frameworks existentes.

El modelo sigue el diseño de OLMo 3 7B a nivel de tokens y añade un módulo de conceptos, un vocabulario de conceptos cuantizado por producto y conexiones residuales jerárquicas. Con aproximadamente 8,94 mil millones de parámetros y una ventana de contexto de entrenamiento de 8.192 tokens, ha sido preentrenado sobre 5,73 billones de tokens del dataset Dolma 3 Mix. Según el informe técnico, el Stage 1 alcanza la pérdida final de entrenamiento de OLMo-3-7B utilizando solo el 51,3 % de sus tokens de entrenamiento, lo que supone una convergencia 1,95 veces más eficiente en términos de presupuesto de tokens. Esta publicación es un modelo base de investigación, pensado para explorar la arquitectura NCP y sus beneficios en eficiencia de entrenamiento y rendimiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NCPOlmo3ForCausalLM (transformer causal con módulo de conceptos) |
| Parametros totales | 8.938.363.792 (~8,94B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 8.192 tokens (máximo de entrenamiento) |
| Tipos de cuantizacion | No disponible (pesos publicados en BF16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

NCP-ArchPreview procesa el texto a través de tres módulos encadenados: un codificador de tokens de 16 capas que produce estados contextuales de token; un módulo de conceptos de 8 capas que predice el siguiente concepto mediante cuantización por producto (32 codebooks, cada uno con 128 codewords de dimensión 128); y un decodificador de tokens de 16 capas que recibe tanto los estados de token como las predicciones de concepto alineadas causalmente para generar la distribución del siguiente token. Las conexiones residuales intra-módulo mezclan estados entre profundidades, mientras que las conexiones residuales inter-módulo conectan codificador a módulo de conceptos, codificador a decodificador y módulo de conceptos a decodificador. La retroalimentación de conceptos se desplaza y repite a resolución de token para preservar la causalidad. La atención a nivel de token usa una ventana local de 4.096 tokens, con atención completa cada cuarta capa. Se emplea RoPE con base 500.000, activación SwiGLU, normalización RMSNorm y QK RMSNorm por capa.

El entrenamiento del Stage 1 utiliza el dataset Dolma 3 Mix y un presupuesto reportado de 5,73 billones de tokens. La optimización es conjunta con tres objetivos: NTP (pérdida estándar de cross-entropía del siguiente token), NCP (predicción del siguiente concepto continuo a través de los codebooks aprendidos, con un objetivo de gradiente detenido) y VQ (ajuste de las entradas del codebook a las representaciones de concepto del codificador). El optimizador principal es Moonlight Muon para parámetros matriciales y AdamW para embeddings, biases y otros parámetros no Muon, con una tasa de aprendizaje por defecto de 6e-5 y un programa de decaimiento coseno tipo OLMo-3. Una innovación destacable es la adaptación de los codebooks y cabezas de predicción existentes, aproximadamente 17 millones de parámetros, manteniendo fijo el backbone de tokens, lo que sugiere una interfaz de adaptación ligera y eficiente.

## Capacidades

- Generación de texto autoregresivo con interfaz estándar de siguiente token.
- Razonamiento y resolución de problemas matemáticos: mejora notable en GSM8K (+5,99 puntos) y MATH-500 (+1,96 puntos) frente a OLMo-3-7B.
- Generación de código: HumanEval (+4,28 puntos) y MBPP (+1,38 puntos) superan al modelo de referencia.
- Comprensión de conocimiento general y tareas de opción múltiple: MMLU (+2,58 puntos), ARC-Challenge (+3,58 puntos) y PIQA (+8,60 puntos).
- Predicción de conceptos: el modelo genera representaciones latentes de conceptos que abarcan grupos de cuatro tokens, lo que permite supervisión explícita sobre una secuencia latente a una cuarta parte de la longitud de la secuencia de tokens.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible explícitamente, aunque las mejoras en matemáticas y código sugieren capacidades de razonamiento secuencial.
- Capacidades multilingües: no disponible (los metadatos no especifican idiomas).
- Capacidades especiales: modo de pensamiento (thinking mode), visión o audio: no disponibles.

## Casos de uso

- Investigación en arquitecturas de modelos de lenguaje: el modelo permite estudiar el impacto de la predicción de conceptos latentes en la eficiencia de entrenamiento y el rendimiento final. Los investigadores pueden comparar NCP-ArchPreview con OLMo-3-7B para aislar el efecto del módulo de conceptos.
- Evaluación de eficiencia de convergencia: el informe indica que el Stage 1 alcanza la pérdida de OLMo-3-7B con el 51,3 % de los tokens, lo que resulta útil para experimentos sobre reducción de costes de preentrenamiento en entornos académicos.
- Adaptación ligera mediante codebooks: los experimentos de adaptación de los codebooks y cabezas de predicción (17M parámetros) permiten desarrollar tareas específicas sin modificar el backbone de tokens, ideal para entornos con recursos computacionales limitados.
- Benchmarking de modelos base: al ser un modelo base sin alineación, sirve como referencia para evaluar pipelines de fine-tuning supervisado o de alineación por preferencias en tareas de razonamiento, matemáticas y código.
- Generación de texto técnico y científico: gracias a su entrenamiento en Dolma 3 Mix, que incluye contenido académico y técnico, puede emplearse como punto de partida para modelos especializados en documentación o análisis de textos científicos.
- Experimentación en eficiencia de memoria y atención: la atención local de 4.096 tokens con atención completa cada cuarta capa ofrece un caso de estudio práctico para investigaciones sobre trade-offs entre ventana de contexto y coste computacional.

## Benchmarks y rendimiento

| Metrica | OLMo-3-7B Stage 1 | NCP-ArchPreview Stage 1 | Delta |
|---|---|---|---|
| Overall AVG | 46,59 | 49,04 | +2,45 |
| MMLU | 62,22 | 64,80 | +2,58 |
| GSM8K | 39,27 | 45,26 | +5,99 |
| MATH-500 | 12,52 | 14,48 | +1,96 |
| HumanEval | 27,10 | 31,38 | +4,28 |
| MBPP | 34,53 | 35,91 | +1,38 |
| ARC-Challenge | 77,99 | 81,57 | +3,58 |
| PIQA | 72,25 | 80,85 | +8,60 |

Resultados por dominio (porcentajes, mayor es mejor):

| Dominio | OLMo-3-7B Stage 1 | NCP-ArchPreview Stage 1 |
|---|---|---|
| Familia MMLU | 54,50 | 56,73 |
| Matematicas | 20,79 | 24,54 |
| Codigo | 25,15 | 27,79 |
| Opcion multiple STEM | 84,47 | 86,93 |
| Opcion multiple no STEM | 70,08 | 74,71 |
| GenQA | 54,29 | 54,76 |

La comparativa de convergencia se refiere al número de tokens necesarios para alcanzar una pérdida de referencia, no a la velocidad de entrenamiento en tiempo real ni al rendimiento de inferencia.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 18 GB para los pesos en BF16 (8,94B parámetros × 2 bytes) más el overhead de activaciones y caché KV. Con cuantización, no disponible en la información proporcionada, el consumo podría reducirse, pero no hay datos publicados.
- GPU recomendadas: una A100 40GB o 80GB, H100, o una RTX 4090 con cuantización. En BF16 completo, una RTX 4090 (24GB) queda justa por la memoria de pesos y activaciones, por lo que se recomienda una GPU con al menos 40GB de VRAM para inferencia sin cuantizar.
- Compatibilidad con GPU de consumo: posible con cuantización (no disponible en la información actual), pero el modelo está publicado en BF16, lo que dificulta su ejecución en GPUs de consumo de 16GB o 24GB sin técnicas de compresión adicionales.
- Opciones de despliegue: transformers (librería de HuggingFace), vLLM (probablemente compatible al ser un modelo causal estándar), llama.cpp u Ollama (requieren conversión a GGUF, no disponible). El repositorio incluye código de evaluación en GitHub, pero no se mencionan herramientas de despliegue específicas.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de rendimiento de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Arquitectura | Rendimiento (Overall AVG) |
|---|---|---|---|---|---|
| NCP-ArchPreview 8.9B Stage 1 | 8,94B | 8.192 | Apache 2.0 | Transformer causal con módulo de conceptos | 49,04 |
| OLMo-3-7B Stage 1 | 7B | 8.192 | Apache 2.0 | Transformer causal estándar | 46,59 |
| Llama 3.1 8B (referencia) | 8B | 128.000 | Llama Community License | Transformer causal estándar | No disponible en la información proporcionada |
| Qwen2.5 7B (referencia) | 7B | 128.000 | Apache 2.0 | Transformer causal estándar | No disponible en la información proporcionada |

La comparativa con OLMo-3-7B es directa, ya que el informe técnico de NCP-ArchPreview presenta resultados evaluados en los mismos benchmarks. Los modelos Llama 3.1 8B y Qwen2.5 7B se citan como referencias de la misma categoría de tamaño, pero no se disponen de sus puntuaciones en esta información.

## Limitaciones y advertencias

- Modelo base sin alineación: no se menciona ningún proceso de RLHF, DPO ni instrucciones de chat, por lo que el modelo no está optimizado para seguir instrucciones ni para diálogo.
- Riesgo de alucinación: al ser un modelo de lenguaje general sin alineación, puede generar contenido plausible pero incorrecto, especialmente en tareas de conocimiento factual.
- Contexto limitado: la ventana de entrenamiento es de 8.192 tokens, lo que restringe su uso en tareas que requieran documentos largos o historiales extensos.
- Idiomas no especificados: los metadatos no indican los idiomas soportados, por lo que su rendimiento en lenguas distintas del inglés no está garantizado ni documentado.
- Documentación incompleta: el informe técnico tiene una URL pendiente (TODO_REPORT_URL) y el código de entrenamiento aún no está publicado, lo que limita la reproducibilidad y la comprensión detallada de la arquitectura.
- Stage 1: esta es una publicación intermedia del proceso de entrenamiento, no la versión final del modelo. Los resultados pueden variar en etapas posteriores.
- Sin datos de cuantización: no se han publicado pesos cuantizados ni resultados de rendimiento con cuantización, lo que dificulta su despliegue eficiente en GPUs de consumo.
- El modelo es un proyecto de investigación: no se garantiza soporte de producción ni estabilidad de la API.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ArchSpace-Collection/NCP_ArchPreview_dolma3_8.9B_Stage1
- Colección de modelos NCP-ArchPreview: https://huggingface.co/collections/ArchSpace-Collection/ncp-archpreview
- Código de evaluación: https://github.com/LuckySJTU/ncp_olmo_eval
- Informe técnico: no disponible (URL pendiente en el repositorio)
- Código de entrenamiento: próximamente, no disponible actualmente
