# ipfipfipf/Qwen3.5-9B-sdpo-react-mathcodesearch-sdpo-arm-e

## Resumen

El modelo `ipfipfipf/Qwen3.5-9B-sdpo-react-mathcodesearch-sdpo-arm-e` es un ajuste fino (fine-tune) del modelo base `Qwen/Qwen3.5-9B-Base`, desarrollado por el usuario `ipfipfipf` y publicado en Hugging Face. Se trata de un modelo multimodal (visión y lenguaje) de 8,95 mil millones de parámetros, con arquitectura híbrida que combina Gated DeltaNet, Gated Attention y capas feed-forward, e incorpora un codificador visual. El nombre del repositorio sugiere que fue entrenado mediante SDPO (Stepwise Direct Preference Optimization) y un enfoque React (Reasoning + Acting) orientado a tareas de matemáticas, código y búsqueda, aunque no se dispone de documentación oficial que detalle el proceso de entrenamiento específico.

Este modelo resulta relevante porque hereda las capacidades del Qwen3.5-9B, que incluyen una ventana de contexto nativa de 262 144 tokens (extensible hasta aproximadamente 1 010 000), soporte para tool calling y un rendimiento competitivo en razonamiento, programación y comprensión visual. El fine-tune busca especializar estas capacidades en dominios concretos como el razonamiento matemático y la generación de código, aunque no se han publicado métricas que confirmen la mejora respecto al base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated DeltaNet + Gated Attention + FFN, con vision encoder (modelo denso) |
| Parametros totales | 8 953 803 264 (≈ 8,95 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens nativa, extensible hasta ~1 010 000 tokens |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene safetensors en precisión completa) |
| Idiomas soportados | No disponible para el fine-tune; el modelo base Qwen3.5-9B soporta 201 idiomas y dialectos |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura del modelo base Qwen3.5-9B es un transformer causal híbrido que combina dos tipos de atención: Gated DeltaNet (atención lineal con 32 cabezas para V y 16 para QK, dimensión de cabeza 128) y Gated Attention (atención clásica con 16 cabezas para Q y 4 para KV, dimensión de cabeza 256 y RoPE de dimensión 64). La disposición interna es de 32 capas, organizadas en bloques de 8 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)). La dimensión oculta es 4096 y la de la FFN intermedia es 12288. El modelo incorpora un codificador visual para entrada de imágenes y soporta Multi-Token Prediction (MTP) entrenado con múltiples pasos. El contexto nativo es de 262 144 tokens, extensible hasta ~1 010 000 mediante técnicas de extrapolación.

El fine-tune `sdpo-react-mathcodesearch-sdpo-arm-e` se basa en este modelo. Según el nombre del repositorio, el entrenamiento empleó SDPO (Stepwise Direct Preference Optimization) y un enfoque React (Reasoning + Acting) para tareas de matemáticas, código y búsqueda. Sin embargo, no se ha publicado información detallada sobre el dataset utilizado, el número de pasos de entrenamiento, la composición de los datos ni el procedimiento exacto. Tampoco se especifica si se realizaron etapas adicionales de RLHF o DPO más allá de lo que sugiere el nombre.

## Capacidades

- Generación de texto y razonamiento multimodal: acepta entradas de imagen y texto, y produce respuestas textuales.
- Razonamiento matemático: el nombre del fine-tune indica un enfoque específico en matemáticas, aunque no hay benchmarks que lo confirmen.
- Generación de código: entrenado aparentemente para tareas de programación, con soporte para múltiples lenguajes.
- Tool calling y function calling: el modelo base Qwen3.5-9B soporta invocación de herramientas, lo que permite integrarlo en flujos de agentes.
- Capacidades de agente y razonamiento multi-paso: el enfoque React sugiere que el fine-tune está optimizado para ciclos de razonamiento-acción-observación.
- Búsqueda: el término "search" en el nombre indica posible entrenamiento para tareas de recuperación de información o búsqueda en la web.
- Multilingüismo: el modelo base soporta 201 idiomas; no se sabe si el fine-tune conserva esta cobertura.
- Visión: al ser un modelo image-text-to-text, puede procesar imágenes y responder preguntas sobre ellas.

## Casos de uso

- Asistente de programación con visión: un desarrollador puede subir una captura de pantalla de un error o un diagrama y pedir al modelo que genere o corrija código. Su entrenamiento específico en código y su capacidad multimodal lo hacen adecuado para este escenario.
- Agente de razonamiento matemático: el modelo puede resolver problemas matemáticos complejos paso a paso, integrado en una aplicación educativa o de análisis financiero. El enfoque React permite que el modelo planifique y ejecute cálculos o consulte herramientas externas.
- Automatización de búsqueda y extracción de información: el fine-tune parece orientado a tareas de búsqueda, por lo que podría usarse en pipelines que consulten bases de conocimiento, APIs o la web y sinteticen respuestas.
- Análisis de documentos técnicos con imágenes: al aceptar entradas visuales, puede resumir y extraer información de diagramas, gráficos o esquemas presentes en documentación técnica.
- Generación de código en producción: con soporte para tool calling, puede integrarse en pipelines de CI/CD para generar tests, documentar funciones o revisar pull requests.
- Chatbot multimodal para atención al cliente: gracias a su ventana de contexto de 262K tokens, puede mantener conversaciones largas con historial extenso y manejar imágenes de productos o capturas de pantalla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este fine-tune. La model card del repositorio corresponde al modelo base Qwen3.5-9B, cuyos resultados se muestran a continuación a modo de referencia, pero no deben atribuirse al fine-tune.

| Benchmark | Qwen3.5-9B (base) | GPT-OSS-20B | Qwen3-30B-A3B-Thinking |
|---|---|---|---|
| MMLU-Pro | 82.5 | 74.8 | 80.9 |
| MMLU-Redux | 91.4 | 87.8 | 91.4 |

Nota: estos datos provienen de la model card del modelo base. No hay información sobre el rendimiento del fine-tune en estos u otros benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene ~8,95B parámetros en FP16, lo que requiere aproximadamente 18 GB de VRAM sin cuantización. Con cuantización de 8 bits (~9 GB) o 4 bits (~5 GB) podría ejecutarse en GPUs de consumo.
- GPU recomendadas: una RTX 4090 (24 GB) puede ejecutar el modelo en FP16 sin problemas. Para cuantización 4 bits, una RTX 3090 (24 GB) o incluso una RTX 4070 (12 GB) serían suficientes.
- Según vLLM Recipes, el modelo cabe cómodamente en una GPU de 24 GB.
- Opciones de despliegue: compatible con Hugging Face Transformers, vLLM, SGLang y KTransformers. También puede usarse con llama.cpp u Ollama si se generan pesos GGUF.
- Latencia y throughput: no se han publicado datos específicos. Para un modelo de 9B en una GPU moderna, se espera una latencia de decodificación de unos 20-40 ms/token y un throughput de 1000-2000 tokens/s con vLLM en lote.

## Comparativa con modelos similares

No se dispone de benchmarks públicos del fine-tune para comparar directamente con otros modelos de tamaño similar. Como referencia, el modelo base Qwen3.5-9B se puede comparar con alternativas de la misma categoría:

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.5-9B (base) | 8,95B | 262K nativo | Apache-2.0 | Multimodal, híbrido DeltaNet+Attention |
| Qwen3-8B | 8B | 32K | Apache-2.0 | Denso, solo texto, anterior generación |
| Llama-3.1-8B | 8B | 128K | Llama 3.1 | Solo texto, muy usado en producción |
| Gemma-2-9B | 9B | 8K | Gemma | Solo texto, eficiente en inferencia |

El fine-tune aquí descrito no tiene comparativas publicadas, por lo que no es posible evaluar su rendimiento relativo.

## Limitaciones y advertencias

- No hay documentación oficial sobre el proceso de entrenamiento del fine-tune: se desconoce el dataset, el número de pasos, la estrategia de preferencia y si se realizaron evaluaciones de seguridad.
- Al ser un fine-tune no verificado, podría presentar una degradación en tareas generales respecto al modelo base si el entrenamiento fue demasiado específico.
- El modelo base es multimodal y hereda posibles sesgos visuales y lingüísticos. El fine-tune podría amplificar sesgos en dominios de matemáticas o código si los datos de entrenamiento estaban sesgados.
- Riesgo de alucinación: como cualquier LLM, puede generar respuestas plausibles pero incorrectas, especialmente en tareas de razonamiento matemático o búsqueda de información.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar que el fine-tune no incluya datos con restricciones adicionales (no se indica en la model card).
- No se especifican los idiomas exactos soportados por el fine-tune; aunque el base cubre 201 idiomas, el ajuste fino podría haber reducido esa cobertura.
- El contexto de 262K tokens es nativo, pero la extensión a ~1M tokens requiere técnicas de extrapolación que pueden afectar la calidad en longitudes extremas.

## Enlaces

- Repositorio del fine-tune: https://huggingface.co/ipfipfipf/Qwen3.5-9B-sdpo-react-mathcodesearch-sdpo-arm-e
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Blog oficial de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Repositorio no oficial en GitHub (referencia): https://github.com/jj449/Qwen3.5
- Página de vLLM Recipes para Qwen3.5-9B: https://recipes.vllm.ai/Qwen/Qwen3.5-9B
