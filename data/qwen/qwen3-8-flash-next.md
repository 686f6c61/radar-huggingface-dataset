# Qwen/Qwen3.8-Flash-Next

## Resumen

Qwen3.8-Flash-Next es un modelo experimental de pesos abiertos publicado por Qwen (equipo de Alibaba) como avance de la arquitectura que sustentará la próxima generación Qwen4. Se trata de un modelo causal multimodal con codificador de visión, disenado para cargas de trabajo agénticas y de contexto largo, con un total de 180.000 millones de parámetros almacenados (125B en el transformer con 6B activos, más 51B en embeddings de n-gramas y 4B en módulos MTP). La nomenclatura "Flash" indica que prioriza eficiencia de inferencia sobre escala bruta.

La innovación central es la sustitución de la atención completa por una combinación híbrida de Gated DeltaNet (atención lineal) y Qwen Sparse Attention (QSA), que opera a nivel de micro-bloque en lugar de token individual, reduciendo la latencia en contextos largos. A ello se suman Gated Residual, embeddings de n-gramas que permiten escalar parámetros con bajo coste computacional, y una receta de entrenamiento con Muon y AdamW aplicados selectivamente.

El modelo soporta 262.144 tokens de contexto nativo, extensible hasta 1.000.000, y se distribuye con licencia comunitaria Qwen (qwen-community-1.0). Su relevancia actual radica en que es la primera publicación de pesos abiertos bajo esta arquitectura, lo que permite a la comunidad evaluar el diseño antes de su adopción en la familia Qwen4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal LM con codificador de visión; híbrida Gated DeltaNet + Qwen Sparse Attention (QSA), MoE, Gated Residual, embeddings de n-gramas y MTP |
| Parametros totales | 180.000 millones (125B transformer + 51B embeddings n-grama + 4B MTP) |
| Parametros activos | 6B |
| Longitud de contexto | 262.144 tokens nativo; extensible hasta 1.000.000 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (license: other) |
| Formato de pesos | safetensors (compatible con Transformers, vLLM, SGLang, TokenSpeed) |

## Arquitectura y entrenamiento

El modelo emplea una disposición de 48 capas organizadas como 12 bloques de la forma `3 × (Gated DeltaNet → MoE) → 1 × (Qwen Sparse Attention → MoE)`. La dimensión oculta es 2560, con embedding de tokens de 248.320 entradas (con padding) y un embedding de n-gramas de 20.000.000 de entradas (bigramas y trigramas) insertado en la capa 2. La Gated DeltaNet usa 48 cabezas lineales para V y 16 para QK con dimensión de cabeza 128; la QSA usa 24 cabezas para Q y 2 para KV con dimensión de cabeza 256, RoPE de 64 dimensiones y un indexador MQA de 4 cabezas de consulta y 1 cabeza de clave compartida con dimensión 128, con un presupuesto de 512 bloques o 2048 tokens. El MoE cuenta con 512 expertos, de los que se activan 10 enrutados más 1 compartido, con dimensión intermedia de 640. Gated Residual usa 4 ramas con rango de cuello de botella 320. El módulo MTP consta de 1 capa entrenada con múltiples pasos.

El entrenamiento combina preentrenamiento y postentrenamiento, con Muon y AdamW aplicados a categorías de pesos específicas. Guiado por leyes de escalado reajustadas, se elimina el warmup tradicional de tamaño de batch y se arranca directamente en el batch objetivo, lo que reduce el número total de pasos del optimizador y permite learning rates mayores. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), con codificador de visión integrado.
- Capacidades agénticas y de razonamiento multi-paso, optimizadas mediante QSA para cargas de trabajo de contexto largo.
- Compatibilidad con tool calling y function calling a través de los frameworks de despliegue soportados (vLLM, SGLang, TokenSpeed).
- Decodificación especulativa nativa mediante el módulo MTP de 1 capa.
- Contexto largo de hasta 262.144 tokens nativo, extensible a 1.000.000.
- Idiomas soportados: no disponible en la información proporcionada.

## Casos de uso

- Agentes autónomos con historial largo: la ventana de 262K tokens nativa y la QSA de coste reducido permiten mantener trazas de herramientas, documentos y conversaciones extensas sin truncamiento agresivo.
- Análisis de documentación técnica extensa: informes, manuales o bases de código de cientos de miles de tokens pueden procesarse en una sola pasada, con recuperación de detalles distribuidos a lo largo del contexto.
- Automatización de atención al cliente multimodal: el codificador de visión permite procesar capturas de pantalla o imágenes adjuntas por el usuario junto con texto en conversaciones multi-turno.
- Generación y revisión de código en pipelines: la compatibilidad con vLLM y SGLang y el soporte de tool calling facilitan su integración en flujos de CI/CD para revisión automática, generación de tests o parcheo.
- Extracción estructurada de información de documentos escaneados: combinación de visión y contexto largo para procesar lotes de facturas, contratos o formularios con salida en JSON mediante function calling.
- Investigación sobre arquitecturas eficientes: al ser una vista previa experimental de la arquitectura Qwen4, sirve como banco de pruebas para comparar atención lineal híbrida frente a atención completa en tareas de razonamiento largo.
- Despliegue en infraestructura con memoria limitada: los embeddings de n-gramas están disenados para offloading, lo que permite escalar parámetros en aceleradores con VRAM restringida sin degradar la calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección de resultados por capacidad (lenguaje, visión y otras), pero los valores numéricos no están incluidos en el extracto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El repositorio ocupa 360,1 GB en safetensors, lo que da una referencia del orden de magnitud en precisión original.
- GPU recomendadas: no especificadas por el autor. Por el tamaño del repositorio, el despliegue en precisión original requiere múltiples aceleradores de centro de datos (A100, H100 o equivalentes).
- Compatibilidad con GPU de consumo: no confirmada. El diseno de embeddings de n-gramas con offloading sugiere que parte de los parámetros puede residir en memoria del sistema, pero no se aportan cifras de VRAM mínima.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang y TokenSpeed, según la model card.
- Latencia y throughput estimados: no disponibles. La QSA se presenta como una reducción significativa de latencia en contexto largo, pero sin cifras publicadas en la información disponible.
- Existe una versión gestionada, Qwen3.8-Flash, disponible vía Qwen Cloud con contexto de 1M por defecto y herramientas integradas.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos comparables de la misma categoría.

## Limitaciones y advertencias

- Modelo experimental: se describe explícitamente como vista previa de la arquitectura Qwen4, por lo que su estabilidad y soporte a largo plazo no están garantizados.
- Idiomas soportados no documentados en la información disponible; no se puede confirmar cobertura multilingüe.
- No se han publicado datos de benchmarks en la información disponible, lo que impide validar el rendimiento frente a alternativas.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan mitigaciones específicas en la información disponible.
- Sesgos conocidos: no documentados en la información proporcionada.
- Licencia qwen-community-1.0 (license: other): es necesario revisar el archivo LICENSE del repositorio antes de cualquier uso comercial, ya que las condiciones no están detalladas en la información disponible.
- El tamaño del repositorio (360,1 GB) y los 180.000 millones de parámetros totales implican requisitos de infraestructura elevados para inferencia local.
- La versión con contexto de 1M por defecto y herramientas oficiales integradas es Qwen3.8-Flash, servida a través de Qwen Cloud; el modelo de pesos abiertos no incluye esas características de producción por defecto.

## Enlaces

- Hugging Face: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Blog oficial: https://qwen.ai/blog?id=qwen3.8-flash-next
- Informe técnico: https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/tech_report.pdf
- Repositorio GitHub: https://github.com/QwenLM/Qwen3.8-Flash-Next
- Qwen Cloud (Qwen3.8-Flash): https://www.qwencloud.com/models/qwen3.8-flash
- Qwen Cloud: https://www.qwencloud.com
- Qwen Chat: https://chat.qwen.ai/
- Portal Qwen: https://qwen.ai/home
- Wikipedia (Qwen): https://en.wikipedia.org/wiki/Qwen
