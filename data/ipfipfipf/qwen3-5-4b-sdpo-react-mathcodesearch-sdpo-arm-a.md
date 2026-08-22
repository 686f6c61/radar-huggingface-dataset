# ipfipfipf/Qwen3.5-4B-sdpo-react-mathcodesearch-sdpo-arm-a

## Resumen

El modelo `ipfipfipf/Qwen3.5-4B-sdpo-react-mathcodesearch-sdpo-arm-a` es un ajuste fino (fine-tune) del modelo base `Qwen/Qwen3.5-4B-Base`, desarrollado por el usuario de Hugging Face `ipfipfipf`. La nomenclatura sugiere que se ha aplicado una técnica de optimización de preferencias denominada SDPO (Sequence-level Direct Preference Optimization) junto con un entrenamiento orientado a razonamiento reactivo (ReAct), matemáticas y búsqueda de código. El modelo base pertenece a la familia Qwen3.5, un modelo causal de lenguaje con encoder de visión, que destaca por su arquitectura híbrida con Gated Delta Networks y atención gated, y por una longitud de contexto nativa de 262 144 tokens, extensible hasta 1 010 000 tokens.

Este fine-tune se presenta como una adaptación especializada para tareas de razonamiento matemático, generación de código y búsqueda de información, aprovechando las capacidades multimodales y de razonamiento del modelo base. Aunque el repositorio no incluye documentación detallada del proceso de entrenamiento, el nombre sugiere que se utilizó un método de optimización de preferencias a nivel de secuencia (SDPO) y un esquema de razonamiento y actuación (ReAct). Con 4 205 751 296 parámetros (~4,2 mil millones), el modelo es adecuado para entornos con recursos moderados, pudiendo ejecutarse en GPUs de consumo con cuantización.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo causal de lenguaje con encoder de visión (híbrido: Gated Delta Networks + Gated Attention + FFN) |
| Parámetros totales | 4 205 751 296 |
| Parámetros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | 262 144 tokens nativo, extensible a 1 010 000 |
| Tipos de cuantización | no disponible (formato safetensors, compatible con cuantización GGUF/AWQ mediante herramientas externas) |
| Idiomas soportados | no disponible (el modelo base Qwen3.5 declara soporte para 201 idiomas, pero no se confirma para este fine-tune) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B emplea una arquitectura híbrida que combina Gated Delta Networks (atención lineal) con Gated Attention, dispuesta en 32 capas con un patrón de 8 bloques de `3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)`. La dimensión oculta es 2560, con 32 cabezas de atención lineal para V y 16 para QK, y 24 cabezas de atención gated (16 para Q y 8 para KV). El modelo fue preentrenado y postentrenado con técnicas de aprendizaje por refuerzo a gran escala, según la documentación oficial de Qwen3.5.

El fine-tune de `ipfipfipf` añade una capa de optimización SDPO (Sequence-level Direct Preference Optimization) sobre el modelo base, orientada a mejorar el rendimiento en tareas de matemáticas y búsqueda de código. El término "react" sugiere la integración del patrón ReAct (Razonamiento y Actuación) para agentes, mientras que "mathcodesearch" indica el dominio de entrenamiento. No se dispone de detalles sobre el conjunto de datos, el número de tokens de entrenamiento ni el procedimiento exacto de SDPO. La arquitectura subyacente no ha sido modificada respecto al base, por lo que las capacidades de visión, texto y contexto largo se conservan.

## Capacidades

- Generación de texto y razonamiento avanzado, incluyendo tareas matemáticas y de código, gracias al ajuste específico.
- Comprensión multimodal: el encoder de visión permite procesar imágenes (entrada visual) junto con texto, heredado del modelo base.
- Razonamiento reactivo (ReAct): el entrenamiento con "react" facilita el uso de agentes que intercalan razonamiento y acciones, aunque no se documenta soporte explícito de tool calling.
- Capacidades multilingües: heredadas del modelo base, que declara soporte para 201 idiomas y dialectos, aunque no se verifica para este fine-tune.
- Contexto largo: ventana de 262 144 tokens, extensible a más de 1 millón, útil para documentos extensos y conversaciones de múltiples turnos.
- El nombre del modelo indica un enfoque en matemáticas y búsqueda de código, por lo que se espera un rendimiento mejorado en estos dominios respecto al base.

## Casos de uso

- Resolución de problemas matemáticos: el ajuste en "math" permite abordar preguntas de razonamiento numérico, álgebra o cálculo en aplicaciones educativas o de asistencia técnica.
- Generación y búsqueda de código: puede usarse como asistente de programación que sugiere fragmentos de código, explica funciones o busca implementaciones existentes.
- Agente de razonamiento para soporte técnico: el enfoque ReAct permite al modelo descomponer problemas complejos en pasos, consultando información externa (si se integra con herramientas) antes de responder.
- Procesamiento de documentos extensos: con su contexto de 262K tokens, puede analizar informes, artículos o libros completos para extraer conclusiones o responder preguntas.
- Análisis multimodal: aunque el fine-tune no se centra en visión, al heredar el encoder visual del base, puede procesar capturas de pantalla o imágenes con texto para tareas de OCR o descripción.
- Investigación académica: sirve como base para experimentos de fine-tuning y comparación de métodos de optimización de preferencias (SDPO) en tareas específicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este fine-tune. La model card del autor reproduce la tabla de rendimiento del modelo base Qwen3.5-4B, que se muestra a continuación (valores extraídos de la documentación oficial):

| Modelo | MMLU-Pro | MMLU-Redux |
|---|---|---|
| GPT-OSS-120B | 80.8 | 91.0 |
| GPT-OSS-20B | 74.8 | 87.8 |
| Qwen3-Next-80B-A3B-Thinking | 82.7 | 92.5 |
| Qwen3-30B-A3B-Thinking-2507 | 80.9 | 91.4 |
| Qwen3.5-9B | 82.5 | 92.5 |
| Qwen3.5-4B | 79.1 | 91.4 |

Estos valores corresponden al modelo base Qwen3.5-4B, no al fine-tune específico. No se dispone de evaluaciones adicionales (HumanEval, GSM8K, etc.) para este modelo concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, el modelo ocupa aproximadamente 8,4 GB (tamaño del repositorio), por lo que se requiere una GPU con al menos 8 GB de VRAM para carga completa. Con cuantización 4-bit (GPTQ/AWQ) se puede reducir a ~2,5 GB.
- GPU recomendadas: RTX 3090, RTX 4090, A100, L4, o cualquier GPU con ≥8 GB de VRAM. Para contexto largo (262K) se recomienda memoria adicional.
- Compatibilidad con GPU de consumo: sí, con cuantización (por ejemplo, GGUF Q4) puede ejecutarse en RTX 3060 (12 GB) o superior.
- Opciones de despliegue: vLLM, SGLang, KTransformers, Transformers (Hugging Face), llama.cpp (si se convierte a GGUF), Ollama (mediante conversión).
- Latencia y throughput: no disponible. Para un modelo de 4B, se espera una velocidad de generación de 20-50 tokens/segundo en GPU moderna con cuantización, pero no hay datos concretos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | MMLU-Pro | MMLU-Redux | Notas |
|---|---|---|---|---|---|---|
| Qwen3.5-4B (base) | 4.2B | 262k | Apache 2.0 | 79.1 | 91.4 | Modelo base sin fine-tune |
| Qwen3.5-9B (base) | 9B | 262k | Apache 2.0 | 82.5 | 92.5 | Versión superior en tamaño |
| Qwen3-30B-A3B-Thinking | 30B (MoE, 3B activos) | 128k | Apache 2.0 | 80.9 | 91.4 | Modelo MoE de la generación anterior |
| Este fine-tune | 4.2B | 262k | Apache 2.0 | no disponible | no disponible | Ajuste especializado, sin benchmarks públicos |

La comparación se basa en datos del modelo base, ya que el fine-tune no tiene resultados propios. El modelo se sitúa en el mismo rango que Qwen3.5-4B, con la ventaja de estar especializado en matemáticas y código, aunque no se puede verificar sin evaluaciones independientes.

## Limitaciones y advertencias

- El modelo es un fine-tune experimental publicado por un usuario individual, con 0 descargas y 0 likes, por lo que no ha sido validado por la comunidad ni por evaluaciones independientes.
- No se ha documentado el proceso de entrenamiento (dataset, hiperparámetros, duración), lo que impide reproducir el fine-tune o conocer posibles sesgos introducidos.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base puede tener restricciones adicionales; se recomienda revisar la licencia del Qwen3.5 original.
- El riesgo de alucinación y sesgo es inherente al modelo base y al ajuste; no se han publicado análisis de robustez.
- La compatibilidad con 201 idiomas del modelo base no está confirmada para este fine-tune; se debe validar antes de usarlo en entornos multilingües.
- Aunque el nombre sugiere capacidades de agente y tool calling, no se ha documentado su soporte real; es necesario probarlo antes de integrarlo en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ipfipfipf/Qwen3.5-4B-sdpo-react-mathcodesearch-sdpo-arm-a
- Versión 9B del mismo autor (similar): https://huggingface.co/ipfipfipf/Qwen3.5-9B-sdpo-react-mathcodesearch-sdpo-arm-a
- Blog oficial de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Página de Awesome Agents sobre Qwen3.5-4B: https://awesomeagents.ai/models/qwen-3-5-4b/
- Modelo base original: https://huggingface.co/Qwen/Qwen3.5-4B-Base
