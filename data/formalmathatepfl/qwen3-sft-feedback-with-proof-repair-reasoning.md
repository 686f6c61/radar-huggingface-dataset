# formalmathatepfl/qwen3-sft-feedback-with-proof-repair-reasoning

## Resumen

El modelo `formalmathatepfl/qwen3-sft-feedback-with-proof-repair-reasoning` es un ajuste fino (fine-tune) completo del modelo base Qwen/Qwen3-8B-Base, desarrollado por el grupo formalmathatepfl de la EPFL. Está diseñado específicamente para tareas de razonamiento matemático y reparación de pruebas formales, con un énfasis particular en el uso de feedback y razonamiento iterativo para corregir demostraciones fallidas. El nombre del modelo sugiere que incorpora un mecanismo de "razonamiento de reparación de pruebas" (proof repair reasoning) que permite al modelo analizar por qué una prueba falló y proponer correcciones.

Este modelo se enmarca en la línea de investigación sobre verificación formal y asistentes de pruebas como Lean, donde los modelos de lenguaje se utilizan para generar y reparar demostraciones automáticamente. Su relevancia radica en la creciente demanda de herramientas que aceleren el desarrollo de software verificado formalmente, un campo crítico en sistemas de alta seguridad. Con 8.190 millones de parámetros, el modelo mantiene la arquitectura transformer decoder-only de Qwen3, aunque no se especifica la longitud de contexto en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en Qwen3-8B-Base) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repositorio) |
| Idiomas soportados | no disponible |
| Licencia | other (ver enlace de HuggingFace) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo (full fine-tuning) de Qwen3-8B-Base, lo que significa que todos los parámetros del modelo base se actualizaron durante el entrenamiento. La arquitectura subyacente es la de Qwen3, un transformer decoder-only con atención estándar, aunque no se proporcionan detalles adicionales sobre innovaciones específicas (como atención lineal o decodificación especulativa) en la información disponible.

El entrenamiento se realizó sobre el dataset `lean_reasoning_sft_feedback`, que según el nombre parece contener ejemplos de razonamiento en Lean con feedback sobre pruebas fallidas. Los hiperparámetros reportados incluyen una tasa de aprendizaje de 1e-5, tamaño de lote de entrenamiento de 1 por dispositivo (8 dispositivos en total, lote efectivo de 8), optimizador AdamW con betas (0.9, 0.999), programador de tasa de aprendizaje coseno con warmup del 5%, y 2 épocas. No se especifica si se utilizaron técnicas como RLHF o DPO; el proceso es exclusivamente de supervisión (SFT).

## Capacidades

- Generación de texto y razonamiento matemático: el modelo está especializado en tareas de razonamiento formal, particularmente en la generación y reparación de pruebas en asistentes como Lean.
- Reparación de pruebas con feedback: el nombre del modelo indica que puede recibir feedback sobre una prueba fallida y razonar sobre cómo corregirla, lo que sugiere una capacidad de razonamiento iterativo.
- Comprensión de lenguajes formales: al estar entrenado con datos de Lean, el modelo puede procesar y generar código de demostración en este lenguaje.
- Capacidades multilingües: no se especifican, pero al derivar de Qwen3-8B-Base, que soporta múltiples idiomas, es probable que conserve cierta capacidad multilingüe, aunque no está confirmado.
- No se menciona soporte explícito para tool calling, agentes o visión.

## Casos de uso

- Asistencia en pruebas formales con Lean: el modelo puede ayudar a matemáticos y desarrolladores a generar demostraciones en Lean, sugiriendo pasos o tácticas, y corrigiendo errores cuando una prueba falla.
- Reparación automática de pruebas en verificación de software: en proyectos que utilizan asistentes de pruebas para verificar propiedades de programas, el modelo puede analizar contraejemplos o mensajes de error y proponer correcciones a las demostraciones.
- Educación matemática asistida por IA: puede utilizarse como tutor que explica pasos de demostración y ayuda a estudiantes a entender por qué una prueba es incorrecta.
- Generación de lemas y teoremas auxiliares: el modelo puede proponer lemas intermedios necesarios para completar una demostración compleja.
- Integración en pipelines de verificación formal: puede incorporarse en herramientas de CI/CD que comprueban pruebas automáticamente, reduciendo el tiempo de depuración de demostraciones.
- Investigación en razonamiento automático: sirve como base para experimentos sobre cómo los modelos de lenguaje manejan feedback y razonamiento correctivo en dominios formales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El campo `model-index` de la model card está vacío, por lo que no hay datos oficiales de rendimiento en tareas como MMLU, HumanEval o GSM8K. Tampoco se proporcionan comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: con 8.190 millones de parámetros, el modelo en precisión FP16/BF16 requiere aproximadamente 16 GB de VRAM solo para los pesos. Con cuantización a 8 bits (INT8) se reduce a unos 8 GB, y a 4 bits (INT4) a unos 4-5 GB.
- GPU recomendadas: para inferencia en FP16, una GPU con al menos 16 GB de VRAM, como RTX 3090, RTX 4090, A100 (40 GB) o H100. Con cuantización, puede ejecutarse en GPUs consumer de 8 GB (RTX 3060, RTX 3070) o incluso menos.
- Opciones de despliegue: al ser un modelo de la familia Qwen3, es compatible con frameworks como vLLM, llama.cpp, Ollama y Text Generation Inference (TGI). También se puede usar con la librería transformers de HuggingFace.
- Latencia y throughput: no se proporcionan datos específicos. Para un modelo de 8B, se espera una latencia de decodificación de unos 20-40 ms por token en una GPU moderna (A100) sin cuantización, y mayor con cuantización.

## Comparativa con modelos similares

No se dispone de datos concretos para una comparación cuantitativa. Sin embargo, se puede comparar cualitativamente con el modelo base Qwen3-8B-Base y con otros modelos de razonamiento matemático como DeepSeekMath-7B o Llemma-7B. La principal diferencia es que este modelo está específicamente ajustado para la reparación de pruebas con feedback, lo que lo hace más adecuado para tareas de verificación formal que los modelos generalistas. No se dispone de información sobre licencia exacta ni sobre el rendimiento relativo.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un fine-tune especializado, puede presentar alucinaciones en dominios fuera de su área de entrenamiento (razonamiento matemático formal). No se han evaluado sesgos específicos.
- Limitaciones de contexto: no se conoce la longitud de contexto efectiva, aunque probablemente hereda la del modelo base (Qwen3-8B-Base, que soporta hasta 32K tokens según documentación pública, pero no confirmado en este repositorio).
- Restricciones de licencia: la licencia se indica como "other", lo que significa que no es una licencia estándar como Apache 2.0. Es necesario revisar los términos específicos en el repositorio de HuggingFace antes de uso comercial.
- Dependencia del dataset de entrenamiento: el modelo está entrenado en un dataset específico de Lean, por lo que su rendimiento en otros lenguajes formales (Coq, Isabelle) o en matemáticas generales puede ser limitado.
- Riesgo en producción: al ser un modelo de investigación, no se ha validado para uso en entornos críticos. Se recomienda verificar todas las salidas generadas.

## Enlaces

- HuggingFace: https://huggingface.co/formalmathatepfl/qwen3-sft-feedback-with-proof-repair-reasoning
- Modelo base del fine-tune: https://huggingface.co/formalmathatepfl/qwen3-sft-feedback-with-proof-repair
- Despliegue en FriendliAI: https://friendli.ai/models/formalmathatepfl/qwen3-sft-feedback-with-proof-repair
- Paper relacionado (ExVerus, sobre reparación de pruebas en Verus): https://icml.cc/virtual/2026/poster/65247
