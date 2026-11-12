# ceselder/maemm-27b-rl-from-sft-1m-checkpoint

## Resumen

`ceselder/maemm-27b-rl-from-sft-1m-checkpoint` es un checkpoint de un modelo multimodal de generación de texto a partir de imagen y texto (pipeline `image-text-to-text`), derivado del modelo base Qwen3.6-27B de Alibaba. El autor del repositorio, `ceselder`, ha publicado este checkpoint bajo licencia Apache 2.0, aparentemente como resultado de un proceso de entrenamiento por refuerzo (RL) a partir de un modelo ajustado por supervisión (SFT) sobre un conjunto de aproximadamente 1 millón de muestras, según se deduce del nombre del repositorio. El modelo conserva la arquitectura y configuración del Qwen3.6-27B original, incluyendo el codificador de visión.

El modelo base Qwen3.6-27B es un transformer causal con codificador de visión, de 27.781.427.952 parámetros totales (según los safetensors del repositorio), con una longitud de contexto nativa de 262.144 tokens, extensible hasta 1.010.000 tokens. La arquitectura combina capas de atención lineal (Gated DeltaNet) con capas de atención clásica (Gated Attention) en un layout híbrido de 64 capas. El checkpoint publicado ocupa 485,9 GB en el repositorio, lo que refleja los pesos en precisión completa (probablemente BF16) más posibles estados del optimizador u otros artefactos de entrenamiento.

La relevancia de este checkpoint radica en que documenta una fase intermedia de un pipeline de RL sobre un modelo multimodal de gran contexto, orientado a tareas de codificación agéntica y razonamiento a nivel de repositorio. No obstante, al ser un checkpoint intermedio de entrenamiento (no una release final), su utilidad práctica para producción está condicionada a la validación por parte del usuario, ya que no se acompañan métricas de evaluación propias del checkpoint ni una model card específica más allá de la heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido con codificador de visión; layout de 64 capas: 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)) |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Parametros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | no disponible (el repositorio contiene pesos en safetensors; no se documentan cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

Otros datos técnicos del modelo base: dimensión oculta 5120, embedding de tokens 248320 (con padding), 64 capas, Gated DeltaNet con 48 cabezas de atención lineal para V y 16 para QK (dimensión de cabeza 128), Gated Attention con 24 cabezas Q y 4 KV (dimensión de cabeza 256, dimensión RoPE 64), FFN con dimensión intermedia 17408, salida LM de 248320 (con padding), entrenado con MTP (multi-token prediction) multi-paso.

## Arquitectura y entrenamiento

El modelo base Qwen3.6-27B emplea una arquitectura híbrida que alterna capas de atención lineal (Gated DeltaNet) con capas de atención clásica (Gated Attention). El layout es 16 bloques, cada uno compuesto por tres subcapas Gated DeltaNet seguidas de una subcapa Gated Attention, todas con FFN. La Gated DeltaNet usa 48 cabezas lineales para V y 16 para QK con dimensión de cabeza 128, mientras que la Gated Attention usa 24 cabezas Q y 4 KV con dimensión de cabeza 256 y RoPE de dimensión 64. Esta combinación busca reducir el coste computacional de la atención en contextos muy largos manteniendo la calidad de atención clásica en capas seleccionadas. El modelo incorpora además un codificador de visión para entrada image-text-to-text y fue entrenado con multi-token prediction (MTP) multi-paso.

En cuanto al entrenamiento, la model card del modelo base indica que Qwen3.6-27B pasó por pre-entrenamiento y post-entrenamiento, con mejoras destacadas en codificación agéntica (flujos de frontend y razonamiento a nivel de repositorio) y una nueva opción de "Thinking Preservation" que retiene contexto de razonamiento de mensajes históricos. No se especifican en la información disponible el número de tokens de pre-entrenamiento, la composición del dataset ni si se usó RLHF o DPO en el modelo base. Respecto a este checkpoint concreto (`maemm-27b-rl-from-sft-1m-checkpoint`), el nombre sugiere un ajuste fino por RL a partir de un modelo SFT entrenado sobre aproximadamente 1 millón de muestras, pero no se documentan detalles del algoritmo de RL, la composición del dataset ni hiperparámetros.

## Capacidades

- Generación de texto y razonamiento general, con soporte de modo de pensamiento (thinking) y preservación de contexto de razonamiento histórico según las capacidades del modelo base Qwen3.6.
- Codificación agéntica: manejo de flujos de trabajo de frontend y razonamiento a nivel de repositorio, con mayor fluidez y precisión que la generación anterior Qwen3.5.
- Comprensión de imagen y texto (pipeline `image-text-to-text`): el modelo incluye codificador de visión y puede procesar entradas multimodales.
- Contexto largo: ventana nativa de 262.144 tokens, extensible hasta 1.010.000 tokens, adecuada para repositorios completos o documentos extensos.
- Capacidades multilingües: la model card del modelo base incluye benchmarks multilingües (SWE-bench Multilingual) pero no detalla la lista de idiomas soportados; no disponible la lista concreta.
- Tool calling / function calling: no se documenta explícitamente en la información disponible, aunque el enfoque agéntico del modelo base sugiere soporte para interacción con herramientas.
- Soporte de agentes y razonamiento multi-paso: sí, orientado a tareas de codificación agéntica y resolución de problemas en múltiples pasos.
- Capacidades especiales: MTP (multi-token prediction) multi-paso, decodificación con preservación de pensamiento (Thinking Preservation).

## Casos de uso

- Codificación agéntica en repositorios: el modelo puede razonar a nivel de repositorio y resolver issues de software, integrándose en pipelines de CI/CD para generar parches y validar cambios, gracias a su contexto de 262.144 tokens y a su entrenamiento orientado a SWE-bench.
- Generación de código frontend: adecuado para flujos de trabajo de frontend donde se requiere coherencia entre múltiples archivos y componentes, con preservación del contexto de razonamiento entre iteraciones.
- Asistencia multimodal en documentación técnica: al aceptar image-text-to-text, puede procesar capturas de pantalla de interfaces o diagramas junto con texto para generar documentación o explicaciones.
- Análisis de bases de código extensas: con contexto extensible hasta 1.010.000 tokens, puede ingerir repositorios completos o grandes volúmenes de documentación para tareas de revisión, refactorización o respuesta a preguntas.
- Razonamiento multi-paso con preservación de pensamiento: útil en depuración iterativa donde el modelo debe recordar cadenas de razonamiento previas para no repetir análisis ya descartados.
- Evaluación comparativa de modelos multimodales: como checkpoint intermedio de RL, sirve para estudiar la evolución del rendimiento durante el entrenamiento por refuerzo en tareas de codificación y visión.
- Investigación en ajuste fino por RL: el checkpoint permite analizar el efecto del RL sobre un SFT de 1 millón de muestras, comparando comportamiento antes y después del ajuste.

## Benchmarks y rendimiento

Los benchmarks disponibles corresponden al modelo base Qwen3.6-27B, no al checkpoint `maemm-27b-rl-from-sft-1m-checkpoint`. No se han publicado resultados de benchmarks específicos para este checkpoint en la información disponible.

| Benchmark | Qwen3.5-27B | Qwen3.5-397B-A17B | Gemma4-31B | Claude 4.5 Opus | Qwen3.6-35B-A3B | Qwen3.6-27B |
|---|---|---|---|---|---|---|
| SWE-bench Verified | 75,0 | 76,2 | 52,0 | 80,9 | 73,4 | 77,2 |
| SWE-bench Pro | 51,2 | 50,9 | 35,7 | 57,1 | 49,5 | 53,5 |
| SWE-bench Multilingual | 69,3 | 69,3 | 51,7 | 77,5 | 67,2 | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: con 27,78 B parámetros, en BF16 se requieren aproximadamente 55-56 GB de VRAM solo para pesos, más memoria para el codificador de visión, caché KV y activaciones. En cuantización de 8 bits, alrededor de 28-30 GB; en 4 bits, alrededor de 15-17 GB. No se documentan cuantizaciones oficiales para este checkpoint.
- GPU recomendadas: A100 80 GB, H100 80 GB, H200, o múltiples GPU de 24-48 GB en paralelo. Para contextos largos (262.000 tokens o más), se recomienda al menos 80 GB de VRAM por GPU o despliegue multi-GPU con tensor parallelism.
- GPU de consumo: en cuantización de 4 bits podría caber en una RTX 4090 (24 GB) o RTX 3090 (24 GB) para contextos moderados; para contextos largos, la caché KV y activaciones pueden exceder la VRAM disponible. No se dispone de datos de latencia o throughput estimados.
- Opciones de despliegue: transformers, vLLM, SGLang, KTransformers (según la model card del modelo base); llama.cpp y Ollama no se mencionan explícitamente y requerirían conversión a GGUF, no disponible en el repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SWE-bench Verified | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ceselder/maemm-27b-rl-from-sft-1m-checkpoint | 27,78 B | 262.144 (ext. 1.010.000) | no disponible (checkpoint intermedio) | Apache 2.0 | Hugging Face |
| Qwen3.6-27B (base) | 27 B | 262.144 (ext. 1.010.000) | 77,2 | Apache 2.0 | Hugging Face |
| Qwen3.5-27B | 27 B | no disponible | 75,0 | no disponible | Hugging Face |
| Gemma4-31B | 31 B | no disponible | 52,0 | no disponible | no disponible |
| Claude 4.5 Opus | no disponible | no disponible | 80,9 | propietaria | API |

El checkpoint comparte arquitectura, tamaño y contexto con Qwen3.6-27B, por lo que su comparación natural es con ese modelo base y con la generación anterior Qwen3.5-27B. No se dispone de métricas propias del checkpoint para evaluar si el RL ha mejorado o degradado el rendimiento respecto al base.

## Limitaciones y advertencias

- Checkpoint intermedio de entrenamiento: el nombre indica un estado parcial de un pipeline de RL, no una release final; puede presentar inestabilidades, degradación o comportamientos no validados.
- Sin benchmarks propios: no se han publicado evaluaciones específicas del checkpoint, por lo que no se puede confirmar que supere al modelo base Qwen3.6-27B.
- Sesgos conocidos: no documentados en la información disponible; hereda los sesgos del modelo base y del dataset de SFT/RL, que no se detalla.
- Riesgo de alucinación: inherente a los modelos generativos; no se documentan mitigaciones específicas en este checkpoint.
- Limitaciones de contexto e idioma: la lista de idiomas soportados no está disponible; el contexto nativo es de 262.144 tokens y la extensión hasta 1.010.000 tokens requiere configuraciones específicas y puede degradar la calidad.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el `license_link` apunta a la licencia del modelo base Qwen3.6-27B; conviene verificar que los términos del modelo base se mantienen compatibles con el uso previsto.
- Tamaño del repositorio: 485,9 GB, lo que implica costes de almacenamiento y descarga considerables; no se ofrecen cuantizaciones ligeras en el repositorio.
- Formato de pesos: solo safetensors; no hay GGUF ni otras conversiones publicadas, lo que limita el despliegue en entornos con llama.cpp u Ollama.
- Sin model card propia: la model card del repositorio es la del modelo base Qwen3.6-27B, sin información adicional sobre el proceso de RL o SFT específico de este checkpoint.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ceselder/maemm-27b-rl-from-sft-1m-checkpoint
- Modelo base Qwen3.6-27B (referencia en model card): https://huggingface.co/Qwen/Qwen3.6-27B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.6-27B/blob/main/LICENSE
- Blog de Qwen3.6-27B: https://qwen.ai/blog?id=qwen3.6-27b
- Qwen Chat: https://chat.qwen.ai
