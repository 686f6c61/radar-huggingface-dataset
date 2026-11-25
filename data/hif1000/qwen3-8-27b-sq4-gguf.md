# hif1000/Qwen3.8-27B-SQ4-GGUF

## Resumen

Qwen3.8-27B-SQ4-GGUF es una cuantización del modelo Qwen3.8-27B publicada por el usuario hif1000 en Hugging Face. Se trata de un checkpoint en formato GGUF generado con Shifter, un runtime de cuantización basado en el paper "Shifter Quantization: Compact Representations for Native Integer Computation" (arXiv:2611.33080). El esquema de cuantización empleado se denomina SQ4 y el artefacto resultante ocupa 17,8 GB en el repositorio, lo que corresponde a una representación de 4 bits sobre los 27.344.057.642 parámetros del modelo base.

El modelo subyacente, Qwen3.8-27B, es un modelo denso de 27B parámetros desarrollado por el equipo Qwen (Alibaba). Se trata de un modelo causal con codificador de visión, es decir, un modelo nativo visión-lenguaje capaz de procesar imágenes y vídeos además de texto. Su arquitectura combina capas de atención lineal (Gated DeltaNet) con capas de atención clásica (Gated Attention) en un patrón híbrido, e incorpora entrenamiento con Multi-Token Prediction (MTP). La longitud de contexto nativa es de 262.144 tokens, extensible hasta 1.000.000.

La relevancia de esta ficha radica en que combina un modelo frontera de tamaño medio con una cuantización agresiva a 4 bits, lo que reduce drásticamente los requisitos de memoria frente a los pesos originales en safetensors. No obstante, el runtime necesario (Shifter) es poco común y no está integrado en los ecosistemas habituales como llama.cpp, Ollama o vLLM, lo que limita su adopción práctica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con vision encoder: 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)); MTP |
| Parametros totales | 27.344.057.642 (27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 |
| Tipos de cuantizacion | SQ4 (Shifter Quantization, 4 bits) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Shifter) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura de transformer causal con un layout híbrido de 64 capas: por cada bloque de cuatro capas, tres usan Gated DeltaNet (atención lineal con 48 cabezas para V y 16 para QK, dimensión de cabeza 128) y una usa Gated Attention clásica (24 cabezas para Q y 4 para KV, dimensión de cabeza 256, RoPE de dimensión 64). La dimensión oculta es 5120, la dimensión intermedia del FFN es 17.408 y el vocabulario está paddeado a 248.320 tokens. Incorpora un cabezal de Multi-Token Prediction entrenado con múltiples pasos, lo que habilita decodificación especulativa nativa.

El modelo se entrena en dos fases (pre-entrenamiento y post-entrenamiento) e incluye un codificador de visión que lo convierte en un modelo visión-lenguaje nativo. La model card original no detalla el número de tokens de entrenamiento ni la composición exacta del dataset. Sí se documenta un control flexible del modo de razonamiento ("thinking mode") activado por defecto, desactivable por petición, con ajuste de profundidad mediante `reasoning_effort` y retención de contexto de razonamiento histórico mediante `preserve_thinking`. El checkpoint SQ4 se obtiene aplicando la cuantización Shifter sobre los pesos originales; el paper describe representaciones compactas orientadas a computación nativa en enteros.

## Capacidades

- Generación de texto y razonamiento multi-paso con modo de pensamiento configurable.
- Comprensión nativa de imágenes y vídeos, incluyendo diagramas STEM, documentos y vídeos de hasta una hora.
- Generación y comprensión de código, con mejoras declaradas en tareas de programación y trabajo profesional.
- Ejecución agéntica: planificación autónoma y manejo de retroalimentación del entorno para completar tareas de horizonte largo.
- Control flexible del razonamiento: activación/desactivación por petición, ajuste de profundidad y preservación del contexto de razonamiento.
- Compatibilidad con harnesses y herramientas de desarrollo populares (según la model card original).
- Capacidades multilingües: no detalladas en la información disponible.

## Casos de uso

- Análisis de documentos técnicos con imágenes: el modelo puede procesar diagramas STEM, tablas y figuras junto con texto, lo que resulta adecuado para revisión de papers o documentación de ingeniería.
- Comprensión de vídeo de larga duración: con contexto de 262.144 tokens y soporte de vídeo de hasta una hora, puede resumir o extraer información de grabaciones extensas.
- Agentes autónomos de desarrollo: su planificación multi-paso y manejo de retroalimentación del entorno lo hacen apto para pipelines que requieren ejecución de tareas encadenadas con verificación.
- Asistencia en programación en producción: la mejora declarada en código y su compatibilidad con harnesses permiten integrarlo en flujos de revisión y generación de código.
- Razonamiento con control de coste: la posibilidad de desactivar el thinking mode o ajustar `reasoning_effort` permite equilibrar latencia y calidad según la tarea.
- Despliegue con memoria reducida: la cuantización SQ4 a 17,8 GB permite ejecutar un modelo de 27B en hardware donde los pesos originales en safetensors no cabrían, siempre que se use el runtime Shifter.
- Procesamiento de contexto largo: tareas de recuperación y síntesis sobre documentos extensos gracias a la ventana nativa de 262K tokens.

## Benchmarks y rendimiento

La model card reproduce parcialmente la tabla de resultados del modelo original, pero los datos numéricos de la tabla no están disponibles en la información proporcionada (el HTML aparece truncado). No se han publicado resultados de benchmarks específicos para la cuantización SQ4 en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 17,8 GB solo para pesos; se requiere memoria adicional para KV cache y activaciones, por lo que en la práctica se necesitan al menos 24 GB para contextos moderados.
- GPU recomendadas: no especificadas en la información disponible; el runtime Shifter requiere Linux con soporte CUDA.
- Cabe en GPU de consumo: probablemente en GPUs con 24 GB o más (por ejemplo, RTX 4090), aunque no está confirmado por el autor.
- Opciones de despliegue: exclusivamente Shifter (compilado desde fuente, `shifter serve`). No hay soporte documentado para llama.cpp, Ollama, vLLM, TGI ni SGLang con este artefacto GGUF concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B-SQ4-GGUF | 27B | 262K (ext. 1M) | Sí | Apache 2.0 | GGUF (Shifter) |
| Qwen3.8-27B (original) | 27B | 262K (ext. 1M) | Sí | Apache 2.0 | Safetensors |
| Alternativas de 27B-30B | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks comparativos en la información proporcionada para establecer diferencias de rendimiento entre la versión SQ4 y el modelo original u otras alternativas.

## Limitaciones y advertencias

- El artefacto solo es ejecutable con el runtime Shifter, que debe compilarse desde fuente y requiere Linux con CUDA; no es compatible con las herramientas estándar de inferencia GGUF.
- La cuantización a 4 bits puede degradar la precisión respecto al modelo original, especialmente en tareas de razonamiento y matemáticas; no se han publicado evaluaciones que cuantifiquen esta pérdida.
- Riesgo de alucinación inherente a los modelos de lenguaje, no mitigado de forma específica en esta cuantización.
- Sesgos conocidos: no documentados en la información disponible.
- Idiomas soportados: no detallados; la model card original no especifica la cobertura lingüística.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del runtime Shifter y del modelo base por separado.
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay validación comunitaria del artefacto.
- La fecha de creación (2026-11-25) y el número de versión del modelo base deben contrastarse con las fuentes oficiales antes de usarlo en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hif1000/Qwen3.8-27B-SQ4-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper de Shifter Quantization: https://arxiv.org/abs/2611.33080
- Repositorio de Shifter: https://github.com/yufenghuang/shifter
- Model card original (revisión referenciada): https://huggingface.co/Qwen/Qwen3.8-27B/blob/37561816e66b5b9153b1b64c10968c18c1e6f4a0/README.md
- Qwen Cloud (servicio gestionado): https://www.qwencloud.com
- Overview de Qwen3.8-27B en Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-27b
