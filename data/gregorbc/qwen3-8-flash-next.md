# gregorbc/Qwen3.8-Flash-Next

## Resumen

Qwen3.8-Flash-Next es un modelo de lenguaje multimodal de código abierto desarrollado por el equipo Qwen de Alibaba Cloud, publicado el 26 de agosto de 2026 como una vista previa experimental de la arquitectura que sustentará la futura generación Qwen4. El modelo combina atención híbrida con Gated DeltaNet y Qwen Sparse Attention (QSA), una capa de embeddings basada en n-gramas y un diseño de MoE ultra-disperso que activa solo 6 000 millones de parámetros por token, a pesar de contar con 125 000 millones en el cuerpo principal. A esto se suman 51 000 millones de parámetros en la tabla de embeddings n-gram y 4 000 millones en un módulo de predicción multi-token (MTP), lo que eleva el total a aproximadamente 180 000 millones de parámetros.

La relevancia de este lanzamiento radica en su apuesta por la eficiencia: según los datos publicados, el entrenamiento consume alrededor de un noveno de los recursos necesarios para Qwen3.7-Plus, manteniendo o mejorando capacidades en tareas de programación y ofimática. El modelo soporta una ventana de contexto nativa de 262 144 tokens, extensible hasta 1 000 000, y es multimodal (entrada de imagen y texto, salida de texto). Está disponible en formato Transformers, compatible con vLLM, SGLang y TokenSpeed, y su licencia es qwen-community-1.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido con Gated DeltaNet + Qwen Sparse Attention (QSA), MoE ultra-disperso, embeddings n-gram y módulo MTP |
| Parametros totales | 179 999 981 459 (aprox. 180B) |
| Parametros activos | 6 000 000 000 (6B) por token |
| Longitud de contexto | 262 144 tokens nativos, extensible hasta 1 000 000 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (se espera multilingüe, pero no se especifica) |
| Licencia | qwen-community-1.0 (licencia propia, "other") |
| Formato de pesos | safetensors (compatible con Transformers, vLLM, SGLang, TokenSpeed) |

## Arquitectura y entrenamiento

Qwen3.8-Flash-Next introduce cuatro innovaciones principales sobre arquitecturas anteriores:

1. **Atención híbrida GDN + QSA**: de cada cuatro capas, tres usan Gated DeltaNet (una variante de atención lineal con estado recurrente) para comprimir el historial de forma eficiente, y la cuarta emplea Qwen Sparse Attention (QSA), que selecciona micro-bloques de tokens en lugar de tokens individuales para la recuperación de largo alcance. Esto reduce significativamente la latencia en contextos largos, un factor crítico para cargas de trabajo agénticas.

2. **Gated Residual**: los flujos residuales se ensanchan y se modulan mediante una puerta de lectura dependiente de los datos y una puerta de escritura escalar por rama, lo que permite una expresividad más fina entre capas sin perder estabilidad en el entrenamiento ni añadir coste de inferencia relevante.

3. **N-gram Embedding**: en lugar de depender exclusivamente de MoE para escalar parámetros, el modelo indexa embeddings mediante bigramas y trigramas (20 millones de entradas en la capa 2). Esta vía de escalado requiere menos cómputo y es más fácil de descargar a memoria externa, lo que beneficia a aceleradores con memoria limitada.

4. **Receta de entrenamiento adaptada**: se aplican los optimizadores Muon y AdamW a categorías específicas de pesos, se elimina el calentamiento tradicional del tamaño de lote (se empieza directamente con el tamaño objetivo) y se usan tasas de aprendizaje mayores, lo que reduce el número total de pasos de optimización.

El modelo tiene 48 capas, con una disposición oculta de 12 × (3 × (Gated DeltaNet → MoE) → 1 × (QSA → MoE)). El MoE cuenta con 512 expertos, de los cuales se activan 10 enrutados más 1 compartido. El módulo MTP (multi-token prediction) añade una capa adicional entrenada con múltiples pasos para mejorar la eficiencia de decodificación.

## Capacidades

- Generación de texto y razonamiento complejo, con un rendimiento destacado en tareas de programación y ofimática según los datos publicados.
- Entrada multimodal: acepta imágenes junto con texto (pipeline image-text-to-text), lo que permite tareas de visión-lenguaje.
- Contexto largo: ventana nativa de 262 144 tokens, extensible a 1 000 000, adecuada para documentos extensos, análisis de código y conversaciones multi-turno prolongadas.
- Soporte de agentes y cargas de trabajo multi-paso: la arquitectura QSA está diseñada específicamente para reducir la latencia en escenarios agénticos, lo que sugiere compatibilidad con tool calling y razonamiento secuencial.
- Decodificación eficiente mediante el módulo MTP (multi-token prediction), que permite predecir varios tokens por paso.
- Compatibilidad con múltiples motores de inferencia: Transformers, vLLM, SGLang y TokenSpeed.

## Casos de uso

- **Atención al cliente automatizada**: con su ventana de contexto de 262K tokens (extensible a 1M), puede gestionar conversaciones multi-turno muy largas, manteniendo el historial completo de la interacción sin truncamientos, y escalar a miles de usuarios simultáneos gracias a sus 6B parámetros activos por token.
- **Generación de código en producción**: su rendimiento en tareas de programación (según los datos del equipo Qwen) lo hace adecuado para integrarse en pipelines de CI/CD como asistente de revisión de código, generación de tests o autocompletado en IDE, con latencia reducida gracias al diseño MoE.
- **Análisis de documentos extensos**: ideal para procesar contratos, informes financieros o artículos científicos de cientos de páginas, extrayendo información relevante y respondiendo preguntas sobre el contenido sin perder el contexto.
- **Asistentes de ofimática**: puede redactar, resumir y reformatear documentos, hojas de cálculo y presentaciones, aprovechando su capacidad de razonamiento sobre texto largo y su entrenamiento orientado a tareas de oficina.
- **Agentes autónomos con memoria extendida**: la combinación de Gated DeltaNet y QSA permite mantener un historial de acciones y observaciones muy amplio, lo que habilita agentes que ejecutan tareas multi-paso (navegación web, gestión de correo, automatización de procesos) sin perder el hilo.
- **Razonamiento multimodal**: al aceptar imágenes como entrada, puede analizar capturas de pantalla, diagramas o fotografías junto con texto, por ejemplo para documentar bugs en software, interpretar gráficos de negocio o asistir en tareas de soporte técnico visual.

## Benchmarks y rendimiento

No se han publicado resultados completos de benchmarks en la información disponible. La model card menciona una tabla de resultados, pero no se incluyen los valores en el extracto proporcionado. La única cifra concreta encontrada en fuentes externas es:

| Benchmark | Resultado |
|---|---|
| GPQA (razonamiento científico) | 91.7 |

Este dato proviene de la web HokAI, que lo atribuye al modelo. No se dispone de comparaciones oficiales con otros modelos en la información facilitada. Se recomienda consultar el informe técnico enlazado al final para obtener la tabla completa de benchmarks.

## Requisitos de hardware

- El repositorio de pesos ocupa 360 GB, lo que indica que los pesos están almacenados en precisión completa (probablemente bf16/fp16). Cargar el modelo completo en memoria requiere aproximadamente 360 GB de VRAM, lo que implica múltiples GPUs de alta gama (por ejemplo, 4 × A100 80GB o 2 × H100 80GB).
- Gracias a que solo se activan 6B parámetros por token, la inferencia es computacionalmente ligera, pero el modelo completo debe estar residente en memoria para poder acceder a todos los expertos y embeddings.
- La tabla de embeddings n-gram (51B parámetros) puede descargarse a memoria externa o CPU si el acelerador tiene memoria limitada, según se indica en la descripción técnica, lo que podría permitir ejecución en GPUs con menos VRAM mediante offloading.
- No se han publicado requisitos oficiales de hardware ni datos de latencia/throughput en la información disponible.
- Opciones de despliegue: compatible con vLLM, SGLang, TokenSpeed y Hugging Face Transformers. También existe una versión oficial gestionada (Qwen3.8-Flash) a través de Qwen Cloud con contexto de 1M por defecto.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos por token | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next | ~180B (125B + 51B emb + 4B MTP) | 6B | 262K (ext. 1M) | qwen-community-1.0 | Abierta (HuggingFace) |
| Qwen3.7-Plus | no disponible | no disponible | no disponible | no disponible | API propietaria |
| Qwen3.8-27B | 27B (estimado) | no disponible | no disponible | no disponible | Abierta (según AI Release Tracker) |

Los datos de Qwen3.7-Plus y Qwen3.8-27B no están disponibles en la información proporcionada, por lo que no es posible realizar una comparación cuantitativa rigurosa. La búsqueda web indica que Qwen3.8-Flash-Next reduce el coste de entrenamiento a aproximadamente 1/9 respecto a Qwen3.7-Plus, manteniendo o mejorando capacidades en código y ofimática, pero no se aportan cifras de benchmarks comparativos.

## Limitaciones y advertencias

- Modelo experimental: es una vista previa de la arquitectura Qwen4, por lo que puede presentar comportamientos inesperados o cambios en versiones futuras.
- Licencia qwen-community-1.0: es una licencia propia ("other") que debe revisarse detenidamente antes de usar el modelo en productos comerciales. No se han detallado aquí sus restricciones exactas.
- Sesgos y alucinaciones: no se ha publicado información sobre evaluación de sesgos o mitigación de alucinaciones. Como todo LLM, puede generar contenido falso o parcialmente incorrecto, especialmente en contextos largos o con entradas ambiguas.
- Idiomas: no se especifican los idiomas soportados. Aunque es probable que el modelo sea multilingüe, no hay confirmación oficial en la información disponible.
- Contexto extensible: aunque se declara soporte hasta 1M de tokens, el rendimiento en esa longitud extrema no está documentado; puede degradarse la calidad de recuperación de información.
- Requisitos de memoria: el tamaño total de pesos (360 GB) dificulta el despliegue en infraestructuras pequeñas; se requiere planificación cuidadosa del hardware o uso de la API gestionada de Qwen Cloud.
- Sin cuantizaciones oficiales: no se han publicado versiones cuantizadas (GGUF, AWQ, etc.), lo que limita el despliegue en hardware consumer sin trabajo adicional de cuantización por parte del usuario.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gregorbc/Qwen3.8-Flash-Next
- Repositorio oficial en GitHub: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Informe técnico: https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/tech_report.pdf
- Blog de Qwen sobre Qwen3.8-Flash-Next: https://qwen.ai/blog?id=qwen3.8-flash-next
- Recetas de despliegue con vLLM: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
- Ficha en AI Release Tracker: https://aireleasetracker.com/model/qwen/qwen3.8-flash-next
- Ficha en HokAI: https://hokai.io/hub/models/qwen3.8-flash-next
