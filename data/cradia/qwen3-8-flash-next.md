# Cradia/Qwen3.8-Flash-Next

## Resumen

Qwen3.8-Flash-Next es un modelo experimental de lenguaje y visión desarrollado por el equipo Qwen (Alibaba), publicado bajo el identificador Cradia/Qwen3.8-Flash-Next en Hugging Face. Se presenta como un avance de arquitectura previo a Qwen4, con un total de 179.999.981.459 parámetros reales según los pesos en safetensors, de los cuales solo 6B están activos por token gracias a su diseño de mezcla de expertos (MoE). Está diseñado para cargas de trabajo agénticas y de contexto largo, con una longitud de contexto nativa de 262.144 tokens, extensible hasta 1.000.000.

El modelo introduce varias innovaciones técnicas: atención híbrida con Qwen Sparse Attention (QSA) a nivel de micro-bloque, Gated Residual con puertas de lectura y escritura por rama, embeddings de n-gramas para escalar parámetros sin incrementar el coste computacional, y una receta de entrenamiento que combina Muon y AdamW con eliminación del warmup de batch size. La arquitectura sigue un patrón de 48 capas con un layout de 12 bloques que alternan Gated DeltaNet y Qwen Sparse Attention, cada uno seguido de una capa MoE con 512 expertos.

Su relevancia actual radica en que es el primer lanzamiento open-weight bajo la arquitectura que sustentará Qwen4, y en que su enfoque en eficiencia de parámetros (6B activos sobre 180B totales) y latencia en contexto largo lo posiciona como una opción atractiva para despliegues con restricciones de memoria y para flujos de trabajo con agentes que requieren ventanas de contexto muy amplias. El pipeline declarado es image-text-to-text, lo que confirma capacidades multimodales con codificador de visión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Causal Language Model con codificador de visión; híbrida Gated DeltaNet + Qwen Sparse Attention + MoE + Gated Residual + N-gram Embedding |
| Parámetros totales | 179.999.981.459 (125B LM + 51B n-gram embedding + 4B MTP) |
| Parámetros activos | 6B (10 expertos enrutados + 1 compartido por token) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (license: other) |
| Formato de pesos | safetensors (compatible con Transformers, vLLM, SGLang, TokenSpeed) |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal con codificador de visión, organizado en 48 capas con un layout de 12 bloques repetidos de la forma `3 × (Gated DeltaNet → MoE) → 1 × (Qwen Sparse Attention → MoE)`. La dimensión oculta es 2560, con un token embedding de 248.320 entradas (padded) y un n-gram embedding de 20.000.000 de bigramas/trigramas en la capa 2. La Gated DeltaNet emplea 48 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128. La Qwen Sparse Attention usa 24 cabezas para Q y 2 para KV, dimensión de cabeza 256, RoPE de 64 dimensiones y un indexador MQA con 4 cabezas de query y 1 cabeza de key compartida, con un presupuesto de 512 bloques o 2048 tokens. La MoE cuenta con 512 expertos, de los cuales se activan 10 enrutados más 1 compartido, con dimensión intermedia de experto de 640. El Gated Residual tiene 4 ramas y un rango de cuello de botella de 320. Se incluye una capa MTP (Multi-Token Prediction) entrenada con múltiples pasos.

El entrenamiento combina pre-entrenamiento y post-entrenamiento. La receta aplica Muon y AdamW a categorías específicas de pesos, elimina el warmup tradicional de batch size comenzando directamente en el tamaño objetivo, y utiliza leyes de escalado reajustadas para reducir el número total de pasos del optimizador y permitir learning rates más altos. La innovación principal es la QSA, que opera a nivel de micro-bloque en lugar de seleccionar tokens individuales, lo que reduce significativamente la latencia en contexto largo. El n-gram embedding permite escalar parámetros con menor coste computacional y es más apto para offloading que la MoE, lo que resulta útil en aceleradores con memoria limitada. No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO.

## Capacidades

- Generación de texto y razonamiento causal en contexto largo, con ventana nativa de 262.144 tokens y extensión hasta 1.000.000.
- Procesamiento de imagen y texto (pipeline image-text-to-text), gracias al codificador de visión integrado.
- Mezcla de expertos con 6B parámetros activos, lo que permite inferencia eficiente en memoria sin sacrificar la capacidad total de 180B.
- Soporte de decodificación multi-token (MTP) con 1 capa entrenada en múltiples pasos, orientada a acelerar la generación.
- Compatibilidad con tool calling y function calling a través de los ecosistemas de despliegue declarados (Transformers, vLLM, SGLang, TokenSpeed), aunque no se detallan formatos específicos en la información disponible.
- Capacidades agénticas y de razonamiento multi-paso, reforzadas por la reducción de latencia en contexto largo que aporta QSA.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con historiales extensos gracias a sus 262.144 tokens de contexto nativo, manteniendo coherencia en diálogos largos y reduciendo la necesidad de resumir el historial.
- Generación de código en producción: su compatibilidad con vLLM, SGLang y TokenSpeed permite integrarlo en pipelines de CI/CD para revisión de código, generación de tests y autocompletado en repositorios grandes, donde el contexto largo evita truncar archivos completos.
- Análisis de documentos extensos con imágenes: al combinar codificador de visión y contexto de 262K tokens, puede procesar informes, contratos o papers con figuras y tablas en una sola pasada, extrayendo información estructurada.
- Agentes autónomos multi-paso: la reducción de latencia en contexto largo que aporta QSA y la capa MTP lo hacen adecuado para bucles de razonamiento agéntico donde cada paso acumula historial y herramientas invocadas.
- Asistentes de investigación y análisis de literatura científica: puede ingerir múltiples artículos con figuras y tablas, comparar metodologías y sintetizar hallazgos en una única ventana de contexto.
- Procesamiento de imágenes en flujos de documentación técnica: descripción de diagramas de arquitectura, extracción de texto de capturas y generación de documentación a partir de material visual y textual combinado.
- Despliegue en infraestructura con memoria limitada: con solo 6B parámetros activos por token, es viable en aceleradores con VRAM moderada mediante offloading del n-gram embedding, sin renunciar a la capacidad total del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluida en la información proporcionada contiene una sección de benchmarks con estilos CSS, pero los datos numéricos no están presentes en el extracto disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 180B parámetros totales en safetensors (360 GB de repo), la inferencia en precisión completa requiere varios aceleradores. Con 6B parámetros activos, el coste computacional por token es bajo, pero la memoria necesaria para alojar todos los expertos y el n-gram embedding es elevada.
- GPU recomendadas: no disponibles en la información proporcionada. Por el tamaño del repo (360 GB), se requiere un entorno multi-GPU para pesos completos; para cuantizaciones no especificadas, el requisito exacto no está documentado.
- ¿Cabe en GPU consumer? No disponible. El tamaño total de pesos y la falta de datos de cuantización impiden confirmarlo; con 180B parámetros, no es esperable que quepa en una única GPU consumer en precisión completa.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang y TokenSpeed, según la model card. No se mencionan llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput estimados: no disponibles. La model card destaca que QSA reduce significativamente la latencia en contexto largo, pero no se aportan cifras concretas.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de benchmarks ni especificaciones de modelos comparables de la misma categoría (MoE con visión y contexto largo) que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Modelo experimental: se presenta explícitamente como un avance de arquitectura previo a Qwen4, no como un modelo de producción estable; la versión oficial con más características es Qwen3.8-Flash, disponible vía Qwen Cloud.
- Licencia qwen-community-1.0: es una licencia "other" que puede imponer restricciones al uso comercial; es necesario revisar el archivo LICENSE del repositorio antes de desplegarlo en producción.
- Idiomas soportados no documentados: no se especifica qué lenguas cubre el modelo ni su calidad relativa, lo que supone un riesgo para aplicaciones multilingües.
- Riesgo de alucinación: no se documentan evaluaciones de fidelidad ni tasas de alucinación en la información disponible.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Sin datos de benchmarks publicados en el extracto: no es posible validar empíricamente el rendimiento frente a alternativas.
- Tamaño del repo de 360 GB: el despliegue requiere infraestructura de almacenamiento y memoria considerable, lo que limita su uso en entornos con recursos ajustados.
- Fecha de creación y actualización idénticas (2026-11-21) y cero descargas/likes: el modelo no cuenta con validación de la comunidad en el momento de la consulta.
- Compatibilidad de cuantizaciones no documentada: no se especifican formatos GGUF, AWQ, GPTQ ni FP8, lo que dificulta planificar despliegues optimizados.

## Enlaces

- Hugging Face: https://huggingface.co/Cradia/Qwen3.8-Flash-Next
- Blog oficial: https://qwen.ai/blog?id=qwen3.8-flash-next
- Informe técnico: https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/tech_report.pdf
- Qwen Cloud (Qwen3.8-Flash oficial): https://www.qwencloud.com/models/qwen3.8-flash
- Qwen Cloud: https://www.qwencloud.com
- Repositorio GitHub: https://github.com/QwenLM/Qwen3.8-Flash-Next
