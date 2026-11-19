# blearyhope/Qwen3.8-Flash-Next

## Resumen

Qwen3.8-Flash-Next es un modelo experimental de lenguaje con codificador de visión publicado por el equipo Qwen (Alibaba) bajo el identificador `blearyhope/Qwen3.8-Flash-Next` en Hugging Face. Se presenta como el primer lanzamiento con pesos abiertos de la arquitectura que sustentará la futura familia Qwen4, y su propósito declarado es explorar cómo escalar de forma eficiente en lugar de limitarse a aumentar el número de parámetros y la ventana de contexto. Combina atención híbrida (Gated DeltaNet más Qwen Sparse Attention), embeddings de n-gramas y una mezcla de expertos (MoE) de grano fino.

El modelo totaliza 179.999.981.459 parámetros según los pesos en safetensors (360 GB de repositorio), aunque la model card desglosa 125B en el modelo de lenguaje con 6B activados, más 51B de embeddings de n-gramas y 4B de MTP. Su ventana de contexto nativa es de 262.144 tokens, extensible hasta 1.000.000. Está pensado para cargas agénticas y de contexto largo, donde la latencia de atención es crítica.

Es relevante ahora porque anticipa las decisiones arquitectónicas de Qwen4 y porque introduce técnicas poco habituales en modelos abiertos, como la atención dispersa a nivel de micro-bloque (QSA) y los embeddings de n-gramas como eje alternativo de escalado de parámetros. La licencia es `qwen-community-1.0`, que conviene revisar antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido con codificador de visión: Gated DeltaNet + Qwen Sparse Attention (QSA), MoE, Gated Residual y embeddings de n-gramas |
| Parametros totales | 179.999.981.459 (125B LM + 51B embeddings de n-gramas + 4B MTP) |
| Parametros activos | 6B en el modelo de lenguaje (10 expertos enrutados + 1 compartido de 512) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como `other` en el repositorio) |
| Formato de pesos | safetensors (compatible con Transformers, vLLM, SGLang y TokenSpeed) |

## Arquitectura y entrenamiento

El modelo es un transformer causal con codificador de visión y un diseño híbrido de atención. El layout oculto es 12 × (3 × (Gated DeltaNet → MoE) → 1 × (Qwen Sparse Attention → MoE)), con 48 capas en total y dimensión oculta de 2560. Gated DeltaNet emplea 48 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128. Qwen Sparse Attention usa 24 cabezas para Q y 2 para KV, dimensión de cabeza 256 y RoPE de dimensión 64; su indexador es MQA con 4 cabezas de consulta y 1 cabeza de clave compartida, con presupuesto de 512 bloques o 2048 tokens. La MoE cuenta con 512 expertos, de los que se activan 10 enrutados más 1 compartido, con dimensión intermedia de 640. El Gated Residual tiene 4 ramas y rango de cuello de botella 320. Los embeddings de n-gramas se indexan con bigramas y trigramas en la capa 2, con 20.000.000 de entradas, y el vocabulario de tokens es de 248.320 (con padding). Incluye una capa MTP entrenada con múltiples pasos.

La innovación principal es QSA, que en lugar de seleccionar tokens individuales opera a nivel de micro-bloque, lo que reduce de forma significativa la latencia en contexto largo. El Gated Residual modula el flujo de información en los flujos residuales ensanchados mediante una puerta de lectura elemento a elemento dependiente de los datos y una puerta de escritura escalar por rama, preservando la estabilidad del entrenamiento con bajo coste en inferencia. Los embeddings de n-gramas permiten escalar parámetros con menos cómputo y son más aptos para offloading que una MoE, lo que resulta útil en aceleradores con memoria limitada. La receta de entrenamiento aplica Muon y AdamW a categorías de pesos específicas, elimina los warmups tradicionales de tamaño de batch (arrancando directamente en el batch objetivo) y permite learning rates mayores. No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`) mediante codificador de visión.
- Razonamiento de contexto largo, con ventana nativa de 262.144 tokens y extensión hasta 1.000.000.
- Cargas agénticas y razonamiento multi-paso, optimizado para reducir latencia en contextos largos.
- Decodificación especulativa mediante la capa MTP (multi-token prediction).
- Compatibilidad con tool calling y function calling a través de la versión oficial Qwen3.8-Flash, que incluye herramientas integradas; el soporte nativo en estos pesos no se detalla en la información disponible.
- Capacidades multilingües: no disponible el listado concreto de idiomas.

## Casos de uso

- Agentes autónomos de larga duración: la ventana de 262.144 tokens nativos y la atención dispersa por micro-bloques permiten mantener historiales extensos de acciones y observaciones sin que la latencia de atención se dispare, algo crítico en bucles agénticos de muchos pasos.
- Análisis de documentos extensos con imágenes: al combinar codificador de visión y contexto largo, puede procesar informes, contratos o expedientes con figuras y tablas en una sola pasada, respondiendo preguntas sobre el contenido completo.
- Asistencia sobre bases de código grandes: la ventana amplia permite cargar varios módulos o un repositorio mediano y razonar sobre dependencias entre ficheros, útil para revisión de código y generación de parches.
- Atención al cliente automatizada: conversaciones multi-turno con memoria de interacciones previas dentro de la misma sesión, manteniendo coherencia gracias al contexto extendido.
- Procesamiento de documentación técnica y manuales con diagramas: extracción de procedimientos, comparación entre versiones y resumen de secciones con soporte visual.
- Investigación y análisis de literatura científica: carga de múltiples artículos y figuras para comparar metodologías y extraer resultados, aprovechando el contexto de un millón de tokens en su versión extensible.
- Despliegue en infraestructura con memoria limitada: los embeddings de n-gramas están diseñados para offloading, lo que facilita servir el modelo en aceleradores con VRAM restringida frente a una MoE equivalente.

## Benchmarks y rendimiento

La model card incluye una sección de resultados de benchmarks, pero en la información proporcionada no se han incluido las tablas con los valores numéricos (solo el marcado de estilos de la tabla). Por tanto:

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con 179.999.981.459 parámetros totales y pesos en safetensors de 360 GB, la inferencia en precisión completa requiere varios aceleradores de 80 GB. En cuantizaciones de 8 bits el peso se reduciría aproximadamente a la mitad y en 4 bits a una cuarta parte, pero no se dispone de cifras oficiales de cuantización para este modelo.
- GPU recomendadas: para servir el modelo completo, clústeres de A100 80 GB o H100 80 GB en configuración multi-GPU. No se especifica el número mínimo de GPUs.
- GPU de consumo: no cabe en GPUs de consumo (RTX 4090 de 24 GB) en precisión completa; requeriría cuantización agresiva y offloading, y no hay datos oficiales que lo confirmen.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang y TokenSpeed, según la model card.
- Latencia y throughput: no disponibles. La arquitectura QSA y la capa MTP están diseñadas para reducir latencia en contexto largo y acelerar la decodificación, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next | 180B (125B LM + 51B n-gram + 4B MTP) | 6B | 262.144 nativo / 1.000.000 extensible | qwen-community-1.0 | Pesos abiertos en Hugging Face |
| Qwen3.8-Flash (oficial) | no disponible | no disponible | 1.000.000 por defecto | no disponible | API gestionada en Qwen Cloud |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Es un modelo experimental ("experimental preview") de la arquitectura de Qwen4; su comportamiento en producción no está validado de forma amplia y puede cambiar en futuras versiones.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan evaluaciones de fiabilidad factual.
- No se detalla la composición del dataset de entrenamiento, por lo que no se pueden evaluar sesgos conocidos ni la cobertura idiomática.
- La licencia `qwen-community-1.0` es distinta de las licencias permisivas habituales; es imprescindible revisar sus términos antes de cualquier uso comercial.
- El tamaño de 360 GB y los 180B parámetros dificultan el despliegue en infraestructura modesta; no hay guías oficiales de cuantización en la información disponible.
- La ventana de 1.000.000 tokens corresponde a la versión oficial Qwen3.8-Flash según la model card; en estos pesos la extensión más allá de 262.144 tokens requiere configuración adicional no documentada aquí.
- El soporte nativo de tool calling y agentes se atribuye principalmente a la versión oficial en la nube; conviene verificar su disponibilidad en estos pesos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/blearyhope/Qwen3.8-Flash-Next
- Blog oficial: https://qwen.ai/blog?id=qwen3.8-flash-next
- Informe técnico: https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/tech_report.pdf
- Repositorio GitHub: https://github.com/QwenLM/Qwen3.8-Flash-Next
- Qwen Cloud (servicio gestionado): https://www.qwencloud.com
- Versión oficial Qwen3.8-Flash: https://www.qwencloud.com/models/qwen3.8-flash
- Diagrama de arquitectura: https://qianwen-res.oss-accelerate.aliyuncs.com/Qwen3.8-Flash-Next/architecture.png
