# bobbyby/Qwen3.8-Flash-Next

## Resumen

Qwen3.8-Flash-Next es un modelo de lenguaje causal con codificador de visión publicado por el equipo Qwen (Alibaba) como vista previa experimental de la arquitectura que sustentará la futura familia Qwen4. Se distribuye como pesos abiertos bajo la licencia Qwen Community 1.0 y está pensado para su uso con Hugging Face Transformers, vLLM, SGLang y TokenSpeed. El repositorio de Hugging Face lo aloja el usuario `bobbyby` y ocupa 360 GB.

El modelo combina una arquitectura híbrida de atención (Gated DeltaNet y Qwen Sparse Attention), un esquema Mixture-of-Experts con 512 expertos, embeddings de n-gramas y un mecanismo de Gated Residual. Declara 125B parámetros en el modelo de lenguaje con 6B activados, más 51B de embeddings de n-gramas y 4B de MTP, lo que da un total real de pesos en safetensors de 179.999.981.459 parámetros. Su contexto nativo es de 262.144 tokens, extensible hasta 1.000.000.

La relevancia del lanzamiento radica en que introduce innovaciones arquitectónicas orientadas a reducir la latencia en contextos largos y a mejorar la eficiencia del escalado de parámetros, en un momento en que las cargas de trabajo agénticas dominan el uso real de los LLM. La versión oficial Qwen3.8-Flash, servida a través de Qwen Cloud, añade 1M de contexto por defecto y herramientas integradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido con vision encoder: Gated DeltaNet + Qwen Sparse Attention, MoE, Gated Residual y N-gram Embedding |
| Parametros totales | 179.999.981.459 (125B LM + 51B n-gram embedding + 4B MTP) |
| Parametros activos | 6B (10 expertos enrutados + 1 compartido de 512 totales) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como "other") |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer causal con codificador de visión, entrenado en dos fases (pre-entrenamiento y post-entrenamiento). Su columna vertebral se organiza en 48 capas con un layout de 12 bloques de la forma `3 × (Gated DeltaNet → MoE) → 1 × (Qwen Sparse Attention → MoE)`. La dimensión oculta es 2560 y el vocabulario (padded) de 248.320 tokens.

Las innovaciones técnicas declaradas son cuatro. Primero, la hibridación de Gated DeltaNet (atención lineal con 48 cabezas para V y 16 para QK, dimensión de cabeza 128) con Qwen Sparse Attention, que opera a nivel de micro-bloque en lugar de seleccionar tokens individuales, con 24 cabezas de query y 2 de KV, dimensión de cabeza 256, RoPE de 64 dimensiones y un presupuesto de 512 bloques o 2048 tokens. Segundo, Gated Residual, que modula el flujo residual mediante una compuerta de lectura dependiente de datos y una compuerta escalar de escritura por rama, con 4 ramas y rango de cuello de botella 320. Tercero, N-gram Embedding, que indexa bigramas y trigramas en la capa 2 con 20.000.000 de entradas, permitiendo escalar parámetros con menor coste computacional y facilitando el offloading. Cuarto, una receta de entrenamiento que aplica Muon y AdamW a categorías de pesos específicas, elimina el warmup de batch size y arranca directamente en el batch objetivo.

El MoE cuenta con 512 expertos, de los que se activan 10 enrutados más 1 compartido, con dimensión intermedia de experto 640. Se incluye una capa MTP (multi-token prediction) entrenada con múltiples pasos, útil para decodificación especulativa. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, con pipeline `image-text-to-text`.
- Procesamiento de imágenes mediante codificador de visión integrado.
- Razonamiento sobre contextos largos: 262.144 tokens nativos, extensibles a 1.000.000.
- Decodificación especulativa mediante la capa MTP de 1 capa entrenada con multi-steps.
- Compatibilidad con tool calling y flujos agénticos, según el posicionamiento del modelo en la model card (la versión oficial Qwen3.8-Flash incluye herramientas integradas).
- Soporte de despliegue en vLLM, SGLang, TokenSpeed y Transformers.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Análisis de documentos extensos con imágenes: el modelo puede procesar contratos, informes o papers de cientos de miles de tokens junto con sus figuras, gracias al contexto nativo de 262.144 tokens y al codificador de visión.
- Agentes autónomos de múltiples pasos: la combinación de MTP para decodificación especulativa y QSA para reducir latencia en contexto largo lo hace adecuado para bucles agénticos con muchas llamadas encadenadas.
- Asistencia sobre bases de código grandes: con contexto extensible a 1M tokens puede ingerir repositorios completos y responder preguntas de arquitectura o generar parches.
- Automatización de atención al cliente multimodal: admite conversaciones multi-turno con capturas de pantalla o imágenes adjuntas del usuario.
- Extracción de información estructurada de documentación técnica: pipeline `image-text-to-text` permite procesar páginas escaneadas y devolver JSON con tool calling.
- Investigación sobre arquitecturas eficientes: al ser una vista previa experimental de la arquitectura Qwen4, sirve para estudiar el comportamiento de Gated DeltaNet, QSA, Gated Residual y N-gram Embedding en cargas reales.
- Despliegue en infraestructura propia con vLLM o SGLang: el formato safetensors y la compatibilidad declarada permiten servir el modelo en clústeres con GPUs de datacenter.

## Benchmarks y rendimiento

La model card incluye una sección de resultados de benchmarks, pero el contenido de las tablas no está disponible en la información proporcionada (solo se incluyen estilos CSS y encabezados). Por tanto:

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con 179.999.981.459 parámetros en safetensors, en BF16 se requieren aproximadamente 360 GB de VRAM solo para pesos, más overhead de KV cache y activaciones. En cuantización de 8 bits bajaría a ~180 GB y en 4 bits a ~90 GB (estimaciones teóricas; no se confirman formatos de cuantización soportados).
- GPU recomendadas: clústeres multi-GPU con A100 80GB, H100 80GB o H200. Para servir en BF16 hacen falta al menos 5× H100 80GB o 8× A100 80GB, considerando overhead.
- GPU de consumo: no cabe en ninguna GPU consumer actual (RTX 4090 con 24 GB) en precisión completa. Solo sería viable con cuantizaciones agresivas no confirmadas y offloading masivo a RAM/SSD, lo que degradaría fuertemente la latencia.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang y TokenSpeed, según la model card.
- Latencia y throughput: no disponible. La model card menciona que QSA "reduce significativamente la latencia en contexto largo", pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next | 180B (125B LM + 51B n-gram + 4B MTP) | 6B | 262.144 (hasta 1M) | qwen-community-1.0 | Pesos abiertos en HF |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones de modelos comparables que permitan una comparación cuantitativa rigurosa. La model card referencia la versión oficial Qwen3.8-Flash (servida en Qwen Cloud, con 1M de contexto y herramientas integradas), que puede considerarse la variante productiva del mismo modelo base.

## Limitaciones y advertencias

- Es una "experimental preview": la propia model card la describe como un paso concreto hacia Qwen4, no como un modelo estable de producción.
- El repositorio de Hugging Face tiene 0 descargas y 0 likes, y el autor del repo (`bobbyby`) no coincide con la organización oficial QwenLM; conviene verificar la procedencia de los pesos antes de usarlos en producción.
- Licencia `qwen-community-1.0` etiquetada como "other": es necesario revisar el archivo LICENSE del repositorio para confirmar condiciones de uso comercial, redistribución y restricciones adicionales.
- Idiomas soportados no documentados: no se puede garantizar calidad en castellano ni en otros idiomas distintos del inglés sin evaluación previa.
- Riesgo de alucinación inherente a los LLM; no se documentan evaluaciones de fidelidad ni tasas de alucinación.
- Sesgos conocidos: no disponible.
- El tamaño de 360 GB y los ~180B parámetros hacen inviable el despliegue en hardware consumer; requiere infraestructura de datacenter.
- La extensión de contexto a 1M tokens es una capacidad declarada, pero no se aportan métricas de rendimiento en esa longitud (RULER, LongBench u otras).
- No se documentan los datos de entrenamiento ni si hubo RLHF/DPO, lo que limita la evaluación de riesgos de alineación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bobbyby/Qwen3.8-Flash-Next
- Blog oficial: https://qwen.ai/blog?id=qwen3.8-flash-next
- Informe técnico: https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/tech_report.pdf
- Repositorio GitHub: https://github.com/QwenLM/Qwen3.8-Flash-Next
- Qwen Cloud (servicio oficial): https://www.qwencloud.com
- Página de Qwen3.8-Flash: https://www.qwencloud.com/models/qwen3.8-flash
- Diagrama de arquitectura: https://qianwen-res.oss-accelerate.aliyuncs.com/Qwen3.8-Flash-Next/architecture.png
