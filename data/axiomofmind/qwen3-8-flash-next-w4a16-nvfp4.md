# axiomofmind/Qwen3.8-Flash-Next-W4A16-NVFP4

## Resumen

Qwen3.8-Flash-Next-W4A16-NVFP4 es un checkpoint cuantizado del modelo multimodal Qwen3.8-Flash-Next, publicado por el usuario axiomofmind y generado con NVIDIA ModelOpt. El modelo original, desarrollado por Qwen, es un MoE ultra-sparse de 125B parámetros (6B activos por token) con arquitectura híbrida GDN + QSA, ventana de contexto de 262K tokens y capacidades de imagen-texto. Esta versión cuantiza los expertos enrutados a NVFP4 (4 bits) con group size 16, manteniendo atención, visión, expertos compartidos, routers, embeddings y cabezas de salida en BF16, lo que reduce el uso de memoria y acelera la inferencia en GPUs compatibles con esta representación.

La relevancia de este checkpoint radica en que permite desplegar un modelo de 125B con solo 6B activos en hardware más modesto, manteniendo la mayor parte de la calidad del original. Requiere un runtime con soporte para la arquitectura ModelOpt W4A16 NVFP4, como vLLM o TensorRT-LLM, y no es compatible con GGUF. El repositorio incluye la licencia Qwen Community 1.0 del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE ultra-sparse con GDN (Gated DeltaNet) + QSA (Qwen Sparse Attention), 3 de cada 4 capas usan GDN, la cuarta QSA |
| Parametros totales | 119.602.003.859 (según safetensors; el modelo original declara 125B incluyendo 51B de tabla de embeddings N-gram) |
| Parametros activos | 6B por token |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantizacion | NVFP4 (W4A16) con group size 16 para expertos enrutados; resto en BF16 |
| Idiomas soportados | no disponible (el modelo base de Qwen suele ser multilingüe, pero no se especifica) |
| Licencia | qwen-community-1.0 |
| Formato de pesos | safetensors (checkpoint de HuggingFace, no GGUF) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next introduce una arquitectura híbrida que combina dos mecanismos de atención: Gated DeltaNet (GDN) para comprimir el historial en tres de cada cuatro capas, y Qwen Sparse Attention (QSA) para recuperación precisa de información de largo alcance en la cuarta capa. Es un MoE ultra-sparse con 6B parámetros activos de un total de 125B, e incluye una tabla de embeddings N-gram de 51B parámetros que se suma al recuento total. El checkpoint cuantizado mantiene la misma arquitectura, pero los expertos enrutados se almacenan en NVFP4 (4 bits) con group size 16, mientras que el resto de los componentes (atención, visión, expertos compartidos, routers, PLE, embeddings, cabeza de salida y MTP) conservan su precisión original en BF16.

No se dispone de información detallada sobre el entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO) en las fuentes consultadas. La cuantización se realizó con NVIDIA ModelOpt, que aplica calibración y ajuste de pesos para minimizar la pérdida de precisión.

## Capacidades

- Generación de texto y razonamiento avanzado, incluyendo tareas complejas de lógica y matemáticas.
- Procesamiento multimodal de imagen y texto (pipeline image-text-to-text), capaz de entender imágenes y responder preguntas sobre ellas.
- Ventana de contexto de 262K tokens, adecuada para documentos largos, conversaciones extensas y análisis de código de gran tamaño.
- Arquitectura MoE con 6B parámetros activos, lo que permite inferencia eficiente en términos de cómputo por token.
- Soporte de razonamiento multi-paso y planificación, heredado del modelo base (no confirmado explícitamente en la documentación de la cuantización).
- Capacidad de tool calling y function calling probablemente presente en el modelo base, aunque no se documenta en este checkpoint específico.

## Casos de uso

- Análisis de documentos extensos: con 262K tokens de contexto, el modelo puede procesar informes financieros, contratos legales o artículos científicos completos en una sola pasada, extrayendo información relevante y resumiendo secciones.
- Asistente de programación con contexto de repositorio: al poder manejar decenas de miles de líneas de código, es útil para generar código, explicar funciones existentes o detectar errores en proyectos grandes.
- Chat multimodal para soporte técnico: combina comprensión de imágenes (capturas de pantalla, diagramas) con razonamiento textual para diagnosticar problemas y ofrecer soluciones paso a paso.
- Búsqueda y recuperación de información en bases de conocimiento: su atención híbrida GDN + QSA permite localizar datos específicos en largas conversaciones o documentos, útil para asistentes de investigación.
- Generación de informes a partir de datos visuales: puede analizar gráficos, tablas o figuras y producir descripciones textuales detalladas para su inclusión en reportes.
- Despliegue en entornos con VRAM limitada: gracias a la cuantización NVFP4, el modelo puede ejecutarse en GPUs con 80GB o menos (con offloading), manteniendo la calidad del original para tareas de razonamiento complejo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base Qwen3.8-Flash-Next tiene métricas documentadas en su model card oficial, pero este checkpoint cuantizado no incluye evaluaciones propias. Se recomienda consultar la documentación del modelo original para referencias de rendimiento.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión. El repositorio ocupa 186.4 GB en safetensors, pero la cuantización NVFP4 reduce el peso de los expertos. Se estima que la inferencia requiere al menos 80-100 GB de VRAM para cargar todos los pesos, aunque con offloading a CPU podría ejecutarse en configuraciones de 48 GB.
- GPU recomendadas: NVIDIA H100 (80GB), A100 (80GB), o configuraciones multi-GPU (por ejemplo, 2x RTX 4090 con NVLink). La cuantización NVFP4 está optimizada para GPUs Hopper y Ada Lovelace.
- En consumer GPU: posible con offloading agresivo y cuantización adicional, pero no es el escenario ideal.
- Opciones de despliegue: vLLM (con soporte para ModelOpt W4A16), TensorRT-LLM, o cualquier runtime que implemente la arquitectura NVFP4. No compatible con llama.cpp u Ollama en su forma actual.
- Latencia y throughput: no disponibles. Al ser un MoE con 6B activos, el throughput por token es comparable al de un modelo de 6B denso, pero la memoria requerida es mayor.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (original) | 125B | 6B | 262K | qwen-community-1.0 | BF16 |
| Qwen3.8-Flash-Next-W4A16-NVFP4 (este) | 119.6B | 6B | 262K | qwen-community-1.0 | NVFP4 |
| Qwen3-235B-A22B (MoE denso) | 235B | 22B | 32K | qwen | BF16/FP8 |

La comparativa se limita al modelo base y a otro MoE de Qwen, ya que no hay datos de otras cuantizaciones del mismo modelo. La ventaja de este checkpoint es la reducción de memoria (los expertos pasan de BF16 a 4 bits) manteniendo la misma arquitectura y contexto.

## Limitaciones y advertencias

- La licencia qwen-community-1.0 permite uso comercial, pero con restricciones: no se puede utilizar para servicios que compitan directamente con Qwen, y se requiere atribución. Revisar el texto completo de la licencia.
- El checkpoint requiere un runtime específico con soporte para ModelOpt W4A16 NVFP4; no funcionará en entornos estándar de transformers sin modificaciones.
- La cuantización NVFP4 puede introducir una ligera degradación en tareas de alta precisión numérica o razonamiento matemático extremo, aunque ModelOpt suele minimizar este efecto.
- No se han publicado evaluaciones de sesgos o alucinaciones para esta versión cuantizada; se heredan las limitaciones del modelo base.
- El tamaño del repositorio (186.4 GB) implica que la descarga y el almacenamiento requieren espacio considerable en disco.
- No se garantiza soporte para todos los idiomas; la documentación no especifica la cobertura lingüística.

## Enlaces

- HuggingFace: https://huggingface.co/axiomofmind/Qwen3.8-Flash-Next-W4A16-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- GitHub del modelo base: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Guía de ejecución local (unsloth): https://unsloth.ai/docs/models/qwen3.8-next
- Recetas vLLM: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
- Blog de ExplainX sobre el lanzamiento: https://www.explainx.ai/blog/qwen3-8-flash-next-125b-moe-release-august-2026
