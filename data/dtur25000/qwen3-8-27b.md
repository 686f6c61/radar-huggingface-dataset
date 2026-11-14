# dtur25000/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal con codificador de visión, publicado por el usuario `dtur25000` en Hugging Face bajo licencia Apache 2.0. Se presenta como la generación más reciente de la familia Qwen de modelos abiertos, construida sobre la base arquitectónica de Qwen3.5, e incorpora un modelo denso de 27.781.427.952 parámetros (27,8B) en formato safetensors con un tamaño de repositorio de 55,6 GB. Está etiquetado como `image-text-to-text`, por lo que se trata de un modelo nativo visión-lenguaje capaz de comprender imágenes y vídeos, además de texto.

El modelo destaca por su arquitectura híbrida de atención: combina capas de Gated DeltaNet (atención lineal) con capas de Gated Attention (atención completa con GQA), organizadas en un patrón repetido de 16 bloques. Soporta una longitud de contexto nativa de 262.144 tokens, extensible hasta 1.000.000, e incorpora entrenamiento con Multi-Token Prediction (MTP). Según la model card, está orientado a tareas de codificación, trabajo profesional, investigación y tareas agénticas de horizonte largo, con control flexible del modo de razonamiento.

La relevancia actual del modelo radica en su combinación de tamaño compacto (27B, desplegable en infraestructura moderada), contexto muy largo, capacidades visión-lenguaje nativas y soporte para tool calling y agentes autónomos. No obstante, conviene señalar que el repositorio no presenta descargas ni interacciones, y que la model card incluye referencias a servicios y comparativas que no pueden verificarse de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder; transformer híbrido con Gated DeltaNet (atención lineal) y Gated Attention (atención completa con GQA) |
| Parametros totales | 27.781.427.952 (27,8B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 |
| Tipos de cuantizacion | No disponible en la información proporcionada |
| Idiomas soportados | No disponible en la información proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con Transformers, vLLM, SGLang, TokenSpeed) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de transformer causal híbrido con un codificador de visión acoplado. La dimensión oculta es de 5.120, con 64 capas organizadas en 16 bloques de la forma `3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)`. Las capas de Gated DeltaNet utilizan 48 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128. Las capas de Gated Attention emplean 24 cabezas para Q y 4 para KV (GQA), con dimensión de cabeza 256 y dimensión de RoPE de 64. La red feed-forward tiene dimensión intermedia de 17.408, y el vocabulario (embedding y salida LM) es de 248.320 tokens con padding. El modelo fue entrenado con Multi-Token Prediction (MTP) en múltiples pasos, lo que permite decodificación especulativa y aceleración de la inferencia.

El entrenamiento abarca fases de pre-entrenamiento y post-entrenamiento. La model card menciona mejoras sustanciales en codificación, trabajo profesional, investigación y tareas agénticas de horizonte largo, así como un refuerzo de la planificación autónoma y del manejo de retroalimentación del entorno. También incorpora control flexible del pensamiento: el modo thinking está activo por defecto, puede desactivarse por petición, la profundidad de razonamiento se ajusta mediante `reasoning_effort`, y el contexto de razonamiento de mensajes históricos se conserva mediante `preserve_thinking`. No se especifican en la información disponible el número exacto de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas concretas de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento multi-paso con modo thinking controlable por petición.
- Codificación y tareas de ingeniería de software, incluyendo codificación agéntica en terminal.
- Comprensión nativa de imágenes y vídeos (diagramas STEM, documentos, vídeos de hasta una hora).
- Soporte de tool calling / function calling, con integración en arneses y herramientas de desarrollo populares.
- Capacidades agénticas: planificación autónoma, manejo de retroalimentación del entorno y ejecución de tareas de extremo a extremo.
- Razonamiento matemático y trabajo profesional (investigación, análisis documental).
- Capacidades multilingües: no detalladas en la información disponible.
- Control de profundidad de razonamiento mediante `reasoning_effort` y retención de contexto de razonamiento con `preserve_thinking`.
- Compatibilidad con Transformers, vLLM, SGLang y TokenSpeed.

## Casos de uso

- Codificación agéntica en terminal: el modelo puede ejecutar tareas de desarrollo de extremo a extremo, interpretando la salida de comandos y corrigiendo errores, gracias a su soporte de tool calling y a su entrenamiento específico en Terminal Bench 2.1.
- Asistencia en investigación documental con visión: puede procesar documentos, diagramas STEM y figuras técnicas, extrayendo información estructurada y respondiendo preguntas sobre el contenido visual y textual combinado.
- Análisis de vídeos de larga duración: con contexto de 262K tokens y comprensión de vídeos de hasta una hora, resulta adecuado para resumir reuniones, generar actas o extraer eventos relevantes de grabaciones.
- Atención al cliente automatizada: la ventana de contexto larga permite gestionar conversaciones multi-turno con historial extenso, y el modo thinking controlable permite equilibrar latencia y calidad según el caso.
- Pipelines de CI/CD con generación de código: la compatibilidad con vLLM y SGLang y el soporte de tool calling permiten integrar el modelo en flujos de revisión de código, generación de tests y corrección automática de fallos.
- Agentes autónomos de larga duración: su planificación autónoma y manejo de retroalimentación del entorno lo hacen adecuado para tareas de múltiples pasos que requieren mantener estado durante periodos prolongados.
- Procesamiento de documentación técnica multiformato: combinación de texto e imágenes en manuales, planos o informes, con extracción y síntesis de información.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa con resultados en categorías como codificación (Terminal Bench 2.1), entre otras. Sin embargo, la información proporcionada está truncada y no permite extraer los valores numéricos completos de forma fiable. Los modelos de comparación citados son Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max.

| Benchmark | Qwen3.8-27B | Qwen3.6-27B | Qwen3.7-Plus | Muse Glimmer-30B | Opus4.6 Max |
|---|---|---|---|---|---|
| Terminal Bench 2.1 (Terminus) | No disponible (dato truncado) | No disponible | No disponible | No disponible | No disponible |

No se han podido extraer resultados numéricos completos de otros benchmarks (MMLU, HumanEval, GSM8K u otros) a partir de la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño (27,8B parámetros), en FP16 se requerirían aproximadamente 55,6 GB de pesos, más overhead de activaciones y KV cache; en cuantización de 8 bits, alrededor de 28 GB; en 4 bits, alrededor de 14-16 GB. Estas cifras son estimaciones generales, no datos oficiales del modelo.
- GPU recomendadas: para FP16, GPU con 80 GB (A100, H100) o múltiples GPU; para cuantizaciones de 8 y 4 bits, GPU consumer de gama alta como RTX 4090 (24 GB) podrían ser suficientes en configuraciones ajustadas.
- Compatibilidad con GPU consumer: probable en cuantización de 4 bits, aunque la información oficial no lo confirma.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang y TokenSpeed, según la model card.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-27B | 27,8B (denso) | 262.144 nativos; hasta 1.000.000 | Apache 2.0 | Hugging Face (repo `dtur25000/Qwen3.8-27B`) |
| Qwen3.6-27B | No disponible | No disponible | No disponible | Citado en la model card como generación previa |
| Qwen3.7-Plus | No disponible | No disponible | No disponible | Citado en la model card |
| Muse Glimmer-30B | ~30B (según nombre) | No disponible | No disponible | Citado en la model card |
| Opus4.6 Max | No disponible | No disponible | No disponible | Citado en la model card |

Los datos de rendimiento comparativo no pueden extraerse de la información disponible debido al truncamiento de la tabla de benchmarks.

## Limitaciones y advertencias

- El repositorio no registra descargas ni interacciones, lo que impide validar su adopción o reproducibilidad por parte de la comunidad.
- La model card incluye referencias a servicios (Qwen Cloud) y comparativas con modelos que no pueden verificarse de forma independiente con la información disponible.
- No se especifican los idiomas soportados, lo que limita la evaluación de su cobertura multilingüe.
- No se detallan los datos de entrenamiento (número de tokens, composición, técnicas de alineación), lo que dificulta evaluar sesgos y riesgos de alucinación.
- Riesgo de alucinación inherente a los modelos de lenguaje generativos, especialmente en tareas de razonamiento abierto y con contexto muy largo.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones de los componentes derivados (codificador de visión, tokenizador) si se redistribuye.
- El tamaño del repositorio (55,6 GB) y la ventana de contexto de hasta 1M tokens implican requisitos de memoria considerables en producción.
- No se han publicado resultados de benchmarks verificables en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/dtur25000/Qwen3.8-27B
- Qwen Cloud (referenciado en la model card): https://www.qwencloud.com
- Página del modelo en Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-27b
