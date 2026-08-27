# AMAImedia/Qwen3.8-Flash-Next

## Resumen

Qwen3.8-Flash-Next es un modelo de lenguaje multimodal de código abierto desarrollado por Qwen (Alibaba), publicado el 26 de agosto de 2026 como una vista previa experimental de la arquitectura que sustentará la futura generación Qwen4. Se trata de un modelo de tipo causal language model con codificador de visión, diseñado para resolver el problema de escalar la capacidad de los LLM sin disparar el coste computacional: combina atención híbrida (Gated DeltaNet y Qwen Sparse Attention), mezcla de expertos ultra dispersa y una tabla de embeddings basada en n-gramas, logrando 125 000 millones de parámetros totales con solo 6 000 millones activos por token.

El modelo destaca por su ventana de contexto nativa de 262 144 tokens, extensible hasta 1 000 000, y por incorporar innovaciones como Gated Residual, N-gram Embedding y una receta de entrenamiento optimizada con los optimizadores Muon y AdamW. Está pensado para cargas de trabajo agénticas, razonamiento de largo alcance y tareas multimodales (imagen y texto). Su licencia es qwen-community-1.0, que permite uso comercial con restricciones específicas. La versión oficial con características de producción (contexto de 1M por defecto y herramientas integradas) se ofrece a través de Qwen Cloud como Qwen3.8-Flash.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated DeltaNet + Qwen Sparse Attention (QSA) + MoE, con codificador de visión |
| Parametros totales | 179 999 981 459 (125B LM + 51B n-gram embedding + 4B MTP) |
| Parametros activos | 6B (10 expertos enrutados + 1 compartido de 512) |
| Longitud de contexto | 262 144 tokens nativo, extensible hasta 1 000 000 |
| Tipos de cuantizacion | GGUF (con imatrix) y safetensors; cuantizaciones específicas no detalladas |
| Idiomas soportados | No disponible |
| Licencia | qwen-community-1.0 (otra) |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

La arquitectura de Qwen3.8-Flash-Next es una hibridación de mecanismos de atención y mezcla de expertos. El bloque del modelo se organiza en 48 capas con un patrón de 12 × (3 × (Gated DeltaNet → MoE) → 1 × (Qwen Sparse Attention → MoE)). Tres de cada cuatro capas utilizan Gated DeltaNet, una atención lineal recurrente que comprime el historial de forma eficiente, mientras que la cuarta capa emplea Qwen Sparse Attention (QSA), que opera a nivel de micro-bloques (512 bloques o 2048 tokens) para recuperación precisa de largo alcance. El componente MoE cuenta con 512 expertos, de los cuales se activan 10 enrutados más 1 compartido, con dimensión intermedia de 640.

La innovación principal reside en el Gated Residual, que modula el flujo de información a través de streams residuales ensanchados mediante una puerta de lectura dependiente de datos y una puerta de escritura escalar por rama (4 ramas, rango de cuello de botella 320). El N-gram Embedding indexa con bigramas y trigramas en la capa 2, con una tabla de 20 000 000 de entradas, lo que permite escalar parámetros con menor coste computacional y facilita el offloading en aceleradores con memoria limitada. El entrenamiento combina los optimizadores Muon y AdamW aplicados a categorías específicas de pesos, elimina el warmup de tamaño de batch y arranca directamente con el tamaño objetivo, reduciendo pasos de optimización y permitiendo tasas de aprendizaje mayores. El modelo incluye además una capa MTP (Multi-Token Prediction) entrenada con multi-steps.

## Capacidades

- Generación de texto y razonamiento de largo alcance con contexto de hasta 262K tokens nativo (extensible a 1M).
- Comprensión de imágenes (multimodal image-text-to-text) gracias a su codificador de visión.
- Razonamiento agéntico y multi-step: la combinación de Gated DeltaNet y QSA reduce la latencia en tareas que requieren múltiples pasos de razonamiento.
- Soporte de tool calling y function calling (la versión oficial Qwen3.8-Flash incluye herramientas integradas; esta versión open-weight es compatible con frameworks como vLLM y SGLang).
- Capacidades multilingües: no se han publicado los idiomas soportados en la información disponible.
- Modo de razonamiento avanzado: el modelo está optimizado para tareas de agente, codificación y visión, superando según los informes a Claude-4.6-Opus (Max) en dichas áreas.
- Eficiencia de inferencia: al activar solo 6B parámetros por token, el coste computacional por consulta es comparable al de un modelo mucho más pequeño.

## Casos de uso

- Agentes autónomos de razonamiento multi-paso: el modelo puede planificar y ejecutar secuencias largas de acciones (navegación web, uso de APIs) gracias a su ventana de 262K tokens y a la baja latencia de QSA en contextos largos, lo que lo hace adecuado para sistemas agénticos en producción.
- Atención al cliente automatizada con contexto extenso: puede mantener conversaciones multi-turno con historial completo de la interacción (incluyendo documentos adjuntos) sin truncar, gracias a su contexto nativo de 262K tokens.
- Análisis de documentos largos y contratos: permite procesar informes financieros, expedientes legales o papers científicos completos en una sola pasada, extrayendo información relevante y resumiendo secciones específicas.
- Generación de código en entornos de desarrollo integrado: soporta tool calling y puede integrarse en pipelines de CI/CD para revisión de código, generación de tests y autocompletado, con la ventaja de manejar repositorios enteros en contexto.
- Asistente de visión para soporte técnico: al ser multimodal, puede recibir capturas de pantalla o fotos de errores y generar explicaciones o soluciones paso a paso, útil en mesas de ayuda.
- Investigación y síntesis de literatura: con su contexto de 1M tokens extensible, puede leer múltiples artículos y generar revisiones bibliográficas coherentes, comparando metodologías y resultados.
- Despliegue en entornos con memoria limitada: gracias al N-gram Embedding y al MoE ultra disperso, puede ejecutarse en dispositivos con 78 GB de RAM/unified memory sin necesidad de GPU VRAM dedicada, según unsloth.ai, lo que permite inferencia local en estaciones de trabajo.

## Benchmarks y rendimiento

La model card del autor incluye una tabla de benchmarks, pero los datos completos no están disponibles en la información proporcionada. No se pueden extraer valores numéricos concretos de MMLU, HumanEval, GSM8K u otros sin riesgo de error. Según fuentes secundarias (unsloth.ai), el modelo supera a Claude-4.6-Opus (Max) en tareas de codificación agéntica, visión y razonamiento, pero no se dispone de cifras verificables. Se recomienda consultar el informe técnico oficial para obtener resultados detallados.

## Requisitos de hardware

- Inferencia local sin GPU: según unsloth.ai, puede ejecutarse en dispositivos con 78 GB de RAM o memoria unificada (por ejemplo, Apple Silicon con 128 GB), sin necesidad de VRAM dedicada.
- Con GPU: al ser un MoE con 6B activos, la VRAM necesaria depende de la cuantización. Para la versión completa en safetensors (471 GB de repo) se requieren múltiples GPUs de alta capacidad (A100 80GB, H100) o cuantización GGUF agresiva.
- Cuantizaciones GGUF con imatrix disponibles, lo que permite ejecutar el modelo en GPUs de consumo (RTX 4090 con 24 GB) si se usa una cuantización de 4 bits o inferior, aunque con pérdida de calidad.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang, TokenSpeed, llama.cpp (vía GGUF), Ollama (si se publica en su catálogo).
- Latencia y throughput: no se han publicado cifras oficiales; la arquitectura QSA reduce la latencia en contextos largos, pero los valores exactos dependen del hardware y la cuantización.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next | 180B (incluye n-gram) | 6B | 262K (1M ext.) | qwen-community-1.0 | Multimodal, arquitectura Qwen4 |
| Qwen3-235B-A22B (referencia) | 235B | 22B | 32K (128K ext.) | Apache 2.0 | MoE denso, sin visión |
| DeepSeek-V3 (referencia) | 671B | 37B | 128K | MIT | MoE, sin visión |

No se dispone de datos de rendimiento comparativos verificables para esta tabla. La comparación se basa en especificaciones públicas. Qwen3.8-Flash-Next se distingue por su contexto mucho más largo, su naturaleza multimodal y su menor número de parámetros activos, lo que reduce el coste por token.

## Limitaciones y advertencias

- Modelo experimental: es una vista previa de la arquitectura Qwen4, por lo que puede presentar comportamientos inestables o cambios en versiones futuras.
- Sesgos y alucinaciones: no se han publicado evaluaciones de sesgo; como todo LLM, puede generar contenido falso o inventado, especialmente en tareas de razonamiento de largo alcance.
- Licencia qwen-community-1.0: permite uso comercial pero con condiciones específicas (consultar el texto completo de la licencia); no es Apache 2.0 ni MIT.
- Idiomas soportados no documentados: se desconoce la cobertura multilingüe real, lo que limita su uso en aplicaciones que requieran garantías de idioma.
- Requisitos de hardware elevados para la versión completa: el repo pesa 471 GB, lo que dificulta su descarga y despliegue en entornos con almacenamiento limitado.
- Contexto extensible a 1M: la extensión a 1M tokens puede degradar la calidad si no se usa la configuración adecuada; el contexto nativo de 262K es el recomendado.
- Sin garantías de producción: la versión open-weight no incluye las herramientas integradas ni el contexto de 1M por defecto de la versión oficial Qwen3.8-Flash; para uso empresarial crítico se recomienda la API de Qwen Cloud.

## Enlaces

- HuggingFace: https://huggingface.co/AMAImedia/Qwen3.8-Flash-Next
- GitHub del proyecto: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Informe técnico: https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/tech_report.pdf
- Blog de Qwen: https://qwen.ai/blog?id=qwen3.8-flash-next
- Qwen Cloud (versión oficial): https://www.qwencloud.com/models/Qwen3.8-Flash
- unsloth.ai (guía de ejecución local): https://unsloth.ai/docs/models/qwen3.8-next
- vLLM Recipes: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
- AI Release Tracker: https://aireleasetracker.com/model/qwen/qwen3.8-flash-next
- explainx.ai (análisis del lanzamiento): https://www.explainx.ai/blog/qwen3-8-flash-next-125b-moe-release-august-2026
