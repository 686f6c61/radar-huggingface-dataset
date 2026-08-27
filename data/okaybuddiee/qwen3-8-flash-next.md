# Okaybuddiee/Qwen3.8-Flash-Next

## Resumen

Qwen3.8-Flash-Next es un modelo multimodal (imagen-texto) de tipo causal language model con vision encoder, desarrollado por el equipo Qwen de Alibaba. Se publicó el 26 de agosto de 2026 como una vista previa experimental de la arquitectura que sustentará Qwen4, con el objetivo de explorar nuevas vías de escalado eficiente más allá del aumento puro de parámetros y contexto. El modelo combina atención híbrida (Gated DeltaNet y Qwen Sparse Attention), un mecanismo de residual con compuertas, embeddings basados en n-gramas y una receta de entrenamiento optimizada con los optimizadores Muon y AdamW.

Con 125 mil millones de parámetros totales de los cuales solo 6 mil millones se activan por token (más 51 mil millones de n-gram embedding y 4 mil millones de MTP), el modelo alcanza una ventana de contexto nativa de 262 144 tokens, extensible hasta 1 000 000. Está disponible en formato safetensors compatible con Hugging Face Transformers, vLLM, SGLang y TokenSpeed. Su licencia es qwen-community-1.0, que permite uso comercial con restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder, híbrida Gated DeltaNet + Qwen Sparse Attention (QSA) + MoE |
| Parametros totales | 179 999 981 459 (125B MoE + 51B n-gram embedding + 4B MTP) |
| Parametros activos | 6B por token (10 expertos enrutados + 1 compartido de 512) |
| Longitud de contexto | 262 144 tokens nativo, extensible a 1 000 000 |
| Tipos de cuantizacion | No disponible (pesos en safetensors, se pueden cuantizar con herramientas externas) |
| Idiomas soportados | No disponible (se espera multilingüe, pero no se especifica en la documentación) |
| Licencia | qwen-community-1.0 (uso comercial permitido con condiciones) |
| Formato de pesos | safetensors (compatible con Transformers, vLLM, SGLang, TokenSpeed) |

## Arquitectura y entrenamiento

El modelo se basa en una arquitectura híbrida de 48 capas organizadas en 12 bloques, cada uno con la secuencia: 3 × (Gated DeltaNet → MoE) seguido de 1 × (Qwen Sparse Attention → MoE). La atención se divide en dos mecanismos complementarios: Gated DeltaNet, que comprime el historial de forma lineal y eficiente en tres de cada cuatro capas, y Qwen Sparse Attention (QSA), que opera a nivel de micro-bloques (512 bloques o 2048 tokens) para recuperación precisa de información de largo alcance. El MoE cuenta con 512 expertos, de los cuales se activan 10 enrutados más 1 compartido, con dimensión intermedia de 640.

La innovación principal incluye el Gated Residual, que modula el flujo de información a través de streams residuales ensanchados mediante un gate de lectura dependiente de datos y un gate de escritura escalar por rama (4 ramas, bottleneck rank 320). El N-gram Embedding indexa con bigramas y trigramas (20 millones de entradas en la capa 2) para escalar parámetros con bajo coste computacional y permitir offloading en aceleradores con memoria limitada. El entrenamiento combina los optimizadores Muon y AdamW aplicados a categorías específicas de pesos, eliminando el warmup de batch size y partiendo directamente del tamaño objetivo, lo que reduce pasos de optimización y permite tasas de aprendizaje mayores. Se incluye además una capa MTP (Multi-Token Prediction) entrenada con multi-steps para mejorar la eficiencia de decodificación.

## Capacidades

- Generación de texto y razonamiento avanzado, con soporte para tareas de agente y razonamiento multi-paso.
- Comprensión de imágenes (multimodal), integrando un vision encoder que permite entrada de imagen-texto.
- Generación de código y tareas de programación, con rendimiento destacado en coding agéntico según fuentes externas.
- Ventana de contexto muy larga (262K nativo, hasta 1M), adecuada para documentos extensos y conversaciones multi-turno.
- Soporte de tool calling y function calling, habilitado por la arquitectura de agente y la atención híbrida de largo alcance.
- Capacidades multilingües no documentadas explícitamente, pero esperables por la familia Qwen.
- Modo de razonamiento avanzado (inferencia de múltiples pasos) gracias a la capa MTP y al entrenamiento con multi-steps.

## Casos de uso

- Agentes autónomos con contexto largo: el modelo puede mantener conversaciones y ejecutar tareas multi-paso con memoria de hasta 262K tokens, ideal para agentes que gestionan proyectos complejos o interacciones prolongadas con usuarios.
- Razonamiento multimodal sobre documentos técnicos: al combinar visión y texto, permite analizar diagramas, capturas de pantalla o figuras junto con texto extenso, útil en investigación y soporte técnico.
- Generación de código en producción: con soporte de tool calling y una ventana de contexto amplia, puede integrarse en pipelines de CI/CD para autocompletar, revisar o refactorizar código en repositorios grandes.
- Asistencia jurídica o financiera: procesamiento de contratos, informes anuales o expedientes largos (hasta 1M tokens) con capacidad de extraer información relevante y responder preguntas específicas.
- Atención al cliente automatizada: gestión de conversaciones multi-turno con historial extenso, manteniendo el contexto de interacciones previas y derivando a herramientas externas cuando sea necesario.
- Investigación académica: análisis de artículos científicos con figuras y tablas, resumen de corpus extensos y generación de hipótesis a partir de literatura multimodal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de benchmarks vacía, y las fuentes externas mencionan que el modelo supera a Claude-4.6-Opus (Max) en tareas de coding agéntico, visión y razonamiento, pero no se proporcionan cifras concretas. Se recomienda consultar el informe técnico oficial para datos verificados.

## Requisitos de hardware

- Tamaño del repositorio: 360 GB en safetensors, lo que requiere almacenamiento de alta capacidad.
- VRAM estimada para inferencia: no disponible oficialmente; según unsloth, puede ejecutarse en dispositivos con 78 GB de RAM/unified memory sin GPU VRAM dedicada, aunque con rendimiento limitado.
- GPUs recomendadas: para inferencia eficiente se necesitan al menos 2-4 GPUs de alta gama (A100 80GB, H100 80GB) o equivalentes, dado el tamaño de los pesos y la activación de 6B parámetros por token.
- En consumer GPUs: no es viable en una sola GPU de consumo (RTX 4090 tiene 24 GB); se requeriría cuantización agresiva o particionado multi-GPU.
- Opciones de despliegue: vLLM, SGLang, TokenSpeed y Hugging Face Transformers son compatibles según la documentación.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware y la configuración de cuantización.

## Comparativa con modelos similares

No se dispone de datos comparativos directos en la información proporcionada. El modelo se posiciona como un MoE ultra-sparse de 125B parámetros con 6B activos, similar en filosofía a otros MoE grandes como Qwen3-235B-A22B o DeepSeek-V3, pero con innovaciones arquitectónicas propias (QSA, n-gram embedding, gated residual). No se han publicado comparativas cuantitativas frente a estos modelos en las fuentes consultadas.

## Limitaciones y advertencias

- Modelo experimental: es una vista previa de la arquitectura Qwen4, por lo que puede presentar comportamientos inestables o cambios en versiones futuras.
- Licencia qwen-community-1.0: permite uso comercial pero con condiciones específicas (consultar el texto completo de la licencia); no es una licencia de código abierto estándar.
- Tamaño y requisitos de hardware: los 360 GB de pesos dificultan el despliegue en infraestructuras modestas; la cuantización puede degradar el rendimiento.
- Sesgos y alucinaciones: no se han documentado evaluaciones de sesgo; como todo LLM, puede generar información falsa o inventada, especialmente en tareas de razonamiento complejo.
- Idiomas no especificados: aunque la familia Qwen suele ser multilingüe, no se confirma qué idiomas están realmente soportados en esta versión.
- Contexto extensible a 1M: la extensión más allá de 262K puede requerir configuraciones específicas y no está garantizada en todos los entornos de inferencia.

## Enlaces

- HuggingFace (repo oficial): https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- HuggingFace (repo espejo consultado): https://huggingface.co/Okaybuddiee/Qwen3.8-Flash-Next
- GitHub: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Blog oficial: https://qwen.ai/blog?id=qwen3.8-flash-next
- Informe técnico: https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/tech_report.pdf
- vLLM recipes: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
- Guía de ejecución local (unsloth): https://unsloth.ai/docs/models/qwen3.8-next
- Seguimiento de lanzamiento: https://aireleasetracker.com/model/qwen/qwen3.8-flash-next
