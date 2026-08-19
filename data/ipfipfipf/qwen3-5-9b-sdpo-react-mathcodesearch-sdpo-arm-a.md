# ipfipfipf/Qwen3.5-9B-sdpo-react-mathcodesearch-sdpo-arm-a

## Resumen

El modelo `ipfipfipf/Qwen3.5-9B-sdpo-react-mathcodesearch-sdpo-arm-a` es un ajuste fino (fine-tuning) del modelo base `Qwen/Qwen3.5-9B-Base`, desarrollado por el usuario `ipfipfipf`. El nombre del repositorio sugiere que el ajuste se ha realizado con técnicas de SDPO (probablemente *Stepwise Direct Preference Optimization*) y el paradigma ReAct, orientado a tareas de matemáticas, generación de código y búsqueda de información. No se dispone de una model card específica para este ajuste; la información técnica disponible corresponde al modelo base, que es un modelo multimodal de lenguaje y visión con arquitectura híbrida basada en *Gated Delta Networks* y atención *Gated Attention*, con 8.953.803.264 parámetros (9B) y una ventana de contexto nativa de 262.144 tokens, extensible hasta aproximadamente 1.010.000 tokens.

El modelo base Qwen3.5-9B destaca por su integración temprana de tokens multimodales, lo que le permite procesar imágenes y texto de forma unificada, y por su entrenamiento con refuerzo a escala masiva. El ajuste fino de `ipfipfipf` probablemente busca especializar estas capacidades en dominios concretos como razonamiento matemático, código y búsqueda, aunque no se han publicado detalles del proceso de entrenamiento ni del dataset utilizado. La licencia es Apache 2.0, lo que permite uso comercial y modificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated DeltaNet + Gated Attention + FFN, con vision encoder (modelo base) |
| Parametros totales | 8.953.803.264 (8,95B) |
| Parametros activos | No disponible (no se especifica si es MoE; los parámetros totales coinciden con el tamaño del modelo) |
| Longitud de contexto | 262.144 tokens nativo, extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | W4A16 y NVFP4 (según despliegues en Jetson AI Lab), además de formatos estándar de Transformers |
| Idiomas soportados | No disponible para el ajuste fino; el modelo base declara soporte para 201 idiomas y dialectos |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B emplea una arquitectura híbrida que combina *Gated Delta Networks* (una variante de atención lineal) con *Gated Attention* (atención con cabezas QK y KV separadas) y capas FFN. La configuración exacta es de 32 capas, con un layout de 8 bloques de `3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)`. El vision encoder permite el procesamiento conjunto de imágenes y texto mediante fusión temprana de tokens multimodales. El entrenamiento del base incluyó una fase de pre-entrenamiento y post-entrenamiento con refuerzo a escala masiva, aunque no se detallan los volúmenes de datos ni las técnicas específicas (RLHF, DPO, etc.) en la información disponible.

El ajuste fino de `ipfipfipf` añade el sufijo `sdpo-react-mathcodesearch`, lo que indica un entrenamiento con SDPO y ReAct, probablemente con un dataset orientado a matemáticas, código y búsqueda. Sin embargo, no se ha publicado información sobre el proceso de entrenamiento, el número de pasos, el dataset utilizado ni las técnicas de alineación aplicadas. Por tanto, los detalles específicos de este ajuste no están disponibles.

## Capacidades

- Procesamiento multimodal: el modelo base acepta entradas de imagen y texto, lo que permite tareas de visión-lenguaje como respuesta a preguntas visuales, OCR y razonamiento sobre imágenes.
- Razonamiento y conocimiento: según los benchmarks del modelo base, alcanza 82.5 en MMLU-Pro y 91.4 en MMLU-Redux, lo que indica un alto nivel de conocimiento y razonamiento en tareas STEM y generales.
- Generación de código: el ajuste fino incluye el término `code` en su nombre, sugiriendo especialización en generación y comprensión de código, aunque no hay benchmarks específicos para esta variante.
- Razonamiento matemático: el término `math` indica entrenamiento específico en problemas matemáticos, probablemente con cadenas de razonamiento (chain-of-thought) y técnicas ReAct.
- Búsqueda de información: el término `search` sugiere capacidad para integrar herramientas de búsqueda o recuperación de información, típica del paradigma ReAct.
- Tool calling y agentes: la combinación de ReAct y el entrenamiento del base en entornos de agentes (mencionado en los highlights del base) sugiere que el modelo puede utilizarse para construir agentes que llaman a herramientas y ejecutan acciones de forma iterativa.
- Soporte multilingüe: el modelo base declara soporte para 201 idiomas, aunque no se confirma si el ajuste fino mantiene esta cobertura completa.

## Casos de uso

- Asistente de programación: el modelo puede generar, explicar y depurar código en múltiples lenguajes, integrándose en editores o pipelines de CI/CD para revisión automática de código y generación de pruebas.
- Tutor de matemáticas: gracias a su especialización en razonamiento matemático, puede resolver problemas paso a paso, explicar conceptos y generar ejercicios personalizados para estudiantes.
- Agente de búsqueda y síntesis: con el entrenamiento ReAct, puede combinar consultas a motores de búsqueda o bases de conocimiento con razonamiento para responder preguntas complejas que requieren información actualizada.
- Análisis de documentos técnicos: al ser multimodal, puede extraer información de gráficos, tablas y diagramas en documentos, resumir contenido y responder preguntas sobre el mismo.
- Automatización de atención al cliente: con su capacidad de diálogo y contexto largo (262K tokens), puede mantener conversaciones extensas con usuarios, consultar bases de datos internas mediante tool calling y escalar casos complejos.
- Desarrollo de agentes autónomos: el soporte para razonamiento multi-paso y llamada a herramientas lo hace adecuado para construir agentes que planifican, ejecutan acciones y evalúan resultados en entornos simulados o reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para el ajuste fino `ipfipfipf/Qwen3.5-9B-sdpo-react-mathcodesearch-sdpo-arm-a`. Los datos disponibles corresponden al modelo base Qwen3.5-9B, extraídos de la model card original (tabla parcialmente visible):

| Benchmark | GPT-OSS-120B | GPT-OSS-20B | Qwen3-Next-80B-A3B-Thinking | Qwen3-30BA3B-Thinking-2507 | Qwen3.5-9B | Qwen3.5-4B |
|---|---|---|---|---|---|---|
| MMLU-Pro | 80.8 | 74.8 | 82.7 | 80.9 | 82.5 | 79.1 |
| MMLU-Redux | 91.0 | 87.8 | 92.5 | 91.4 | no disponible | no disponible |

La tabla está incompleta en la información proporcionada; no se muestran más filas ni valores para el resto de benchmarks. Se recomienda consultar la model card original para obtener la tabla completa.

## Requisitos de hardware

- VRAM estimada: el modelo base tiene 8.95B parámetros, por lo que en FP16 requiere aproximadamente 18 GB de VRAM. Con cuantización W4A16 (4 bits) se reduce a unos 4.5-5 GB, y con NVFP4 a valores similares.
- GPU recomendadas: una GPU con 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A10G) es suficiente para inferencia en FP16 o cuantizada. Para cargas de trabajo con contexto largo o procesamiento multimodal, se recomienda al menos 24 GB.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de consumo como RTX 3090/4090 con cuantización. Sin cuantizar, requiere una GPU de 24 GB.
- Opciones de despliegue: compatible con Hugging Face Transformers, vLLM, SGLang, KTransformers y llama.cpp (si se convierten los pesos a GGUF). También se ha validado en Jetson Orin y Thor con cuantización W4A16 y NVFP4.
- Latencia y throughput: no se dispone de datos específicos. Se espera una latencia moderada para un modelo de 9B, con throughput mejorado gracias a la arquitectura híbrida (Gated DeltaNet reduce coste de atención lineal).

## Comparativa con modelos similares

El modelo base Qwen3.5-9B se puede comparar con otras alternativas de tamaño similar o superior en la misma familia y con competidores abiertos:

| Modelo | Parámetros | Contexto | MMLU-Pro | Licencia |
|---|---|---|---|---|
| Qwen3.5-9B (base) | 8.95B | 262K | 82.5 | Apache 2.0 |
| Qwen3.5-4B | ~4B | no disponible | 79.1 | Apache 2.0 |
| GPT-OSS-20B | 20B | no disponible | 74.8 | no disponible |
| Qwen3-30BA3B-Thinking-2507 | 30B (3B activos) | no disponible | 80.9 | Apache 2.0 |

El ajuste fino de `ipfipfipf` no tiene comparativa directa publicada, ya que no se han documentado sus resultados. En cuanto a alternativas específicas para tareas de matemáticas y código, se podrían considerar modelos como DeepSeek-Coder, CodeLlama o Mistral-Math, pero no se dispone de datos comparativos.

## Limitaciones y advertencias

- Falta de documentación del ajuste fino: no se ha publicado una model card específica, por lo que se desconocen los datos de entrenamiento, el proceso de alineación y las métricas de rendimiento del modelo ajustado.
- Sesgos y alucinaciones: al ser un modelo de lenguaje, puede generar información falsa o inventada, especialmente en dominios donde no fue entrenado. El ajuste fino en matemáticas y código no elimina este riesgo.
- Limitaciones de idioma: aunque el modelo base soporta 201 idiomas, el ajuste fino podría haber reducido la cobertura si el dataset de entrenamiento fue predominantemente en inglés u otros idiomas específicos.
- Contexto largo: aunque la ventana nativa es de 262K tokens, el rendimiento en contextos muy largos puede degradarse si no se utiliza una implementación optimizada (por ejemplo, con atención esparsa o cuantización).
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial y modificación, pero se debe verificar que los pesos del ajuste fino no incluyan datos con licencias restrictivas (no se informa al respecto).
- Compatibilidad de herramientas: el entrenamiento ReAct puede requerir que el usuario implemente el bucle de razonamiento y llamada a herramientas manualmente, ya que el modelo solo genera texto y no ejecuta acciones por sí mismo.

## Enlaces

- Repositorio del modelo ajustado: https://huggingface.co/ipfipfipf/Qwen3.5-9B-sdpo-react-mathcodesearch-sdpo-arm-a
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Blog oficial de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Repositorio GitHub de Qwen3.5 (no oficial): https://github.com/ABDtmx/Qwen3.5
- Guía de despliegue en Jetson AI Lab: https://www.jetson-ai-lab.com/models/qwen3-5-9b/
- Recetas de vLLM para Qwen3.5-9B: https://recipes.vllm.ai/Qwen/Qwen3.5-9B
