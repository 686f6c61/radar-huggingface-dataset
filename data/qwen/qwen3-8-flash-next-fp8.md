# Qwen/Qwen3.8-Flash-Next-FP8

## Resumen

Qwen3.8-Flash-Next-FP8 es la versión cuantizada en FP8 del modelo experimental Qwen3.8-Flash-Next, publicado por el equipo Qwen (Alibaba) como avance de la arquitectura que servirá de base para la futura familia Qwen4. Se trata de un modelo causal multimodal (texto e imagen) de tipo Mixture-of-Experts con 125.000 millones de parámetros en el modelo de lenguaje, de los cuales solo 6.000 millones se activan por token, a los que se suman 51.000 millones de parámetros en un embedding de n-gramas y 4.000 millones en módulos MTP (multi-token prediction). El repositorio contiene 180.000 millones de parámetros totales en safetensors y ocupa 185,6 GB.

La propuesta técnica se centra en la eficiencia del contexto largo y las cargas de trabajo agénticas: sustituye la atención completa por una combinación de Gated DeltaNet (atención lineal) y Qwen Sparse Attention (QSA), que opera a nivel de microbloque en lugar de token individual. Incorpora además Gated Residual, un esquema de embeddings de n-gramas para escalar parámetros con menor coste computacional, y una receta de entrenamiento con Muon y AdamW aplicados a categorías de pesos específicas. El contexto nativo es de 262.144 tokens, extensible hasta 1.000.000.

Esta variante FP8 usa cuantización de grano fino con bloques de 128 y, según el autor, mantiene métricas de rendimiento prácticamente idénticas a las del modelo original. Es relevante para despliegues en producción porque reduce los requisitos de memoria sin renunciar a la calidad, y es compatible con Transformers, vLLM, SGLang y TokenSpeed. La licencia es la Qwen Community 1.0, que conviene revisar antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal LM con codificador de visión; híbrida Gated DeltaNet + Qwen Sparse Attention, MoE, Gated Residual, N-gram Embedding y MTP |
| Parametros totales | 179.999.981.459 (125B LM + 51B n-gram embedding + 4B MTP) |
| Parametros activos | 6B en el LM (10 expertos enrutados + 1 compartido de 512) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 |
| Tipos de cuantizacion | FP8 de grano fino con bloque de 128 (esta variante); el modelo base admite otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors (Transformers); compatible con vLLM, SGLang y TokenSpeed |

## Arquitectura y entrenamiento

El modelo sigue un layout oculto de 48 capas organizado como 12 bloques de la forma 3 × (Gated DeltaNet → MoE) → 1 × (Qwen Sparse Attention → MoE). La dimensión oculta es 2560, el embedding de tokens es de 248.320 entradas (con padding) y el embedding de n-gramas indexa 20.000.000 de bigramas y trigramas en la capa 2. Gated DeltaNet usa 48 cabezas lineales para V y 16 para QK con dimensión de cabeza 128; QSA emplea 24 cabezas de query y 2 de KV con dimensión 256, RoPE de 64 dimensiones y un indexador MQA con 4 cabezas de query y 1 cabeza de clave compartida, con un presupuesto de 512 bloques o 2048 tokens. El MoE tiene 512 expertos con dimensión intermedia 640, y Gated Residual cuenta con 4 ramas y rango de cuello de botella 320.

Las innovaciones declaradas son tres. Primero, QSA selecciona microbloques en lugar de tokens individuales, lo que reduce la latencia en contexto largo, un punto crítico para flujos agénticos. Segundo, Gated Residual modula el flujo de información en los streams residuales mediante una puerta de lectura elemento a elemento dependiente de los datos y una puerta de escritura escalar por rama, preservando la estabilidad del entrenamiento con bajo coste en inferencia. Tercero, el embedding de n-gramas permite escalar parámetros con menos cómputo y facilita el offloading frente al MoE. En el plano del entrenamiento, se aplican Muon y AdamW a categorías de pesos específicas, se elimina el warmup de tamaño de batch comenzando directamente en el batch objetivo y se admiten learning rates mayores. El modelo pasa por preentrenamiento y postentrenamiento; la model card no detalla la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno.
- Procesamiento de imagen y texto (pipeline image-text-to-text) mediante codificador de visión.
- Razonamiento matemático y generación de código, aunque sin cifras de benchmark disponibles en la información proporcionada.
- Capacidad de contexto largo: 262.144 tokens nativos y hasta 1.000.000 extendidos, con atención dispersa diseñada para reducir la latencia en secuencias largas.
- Decodificación multi-token (MTP) de una capa entrenada con múltiples pasos, orientada a acelerar la generación.
- Idoneidad para cargas agénticas y de razonamiento multi-paso según el posicionamiento del autor.
- Soporte multilingüe: no disponible en la información proporcionada.
- Tool calling y function calling: no confirmado explícitamente en la información disponible; la versión gestionada Qwen3.8-Flash sí incluye herramientas integradas oficiales.

## Casos de uso

- Atención al cliente automatizada: la ventana nativa de 262.144 tokens permite mantener historiales de conversación muy largos y documentación de producto en el mismo contexto, con QSA reduciendo la latencia en cada turno.
- Análisis de documentos extensos y multimodal: informes con tablas, gráficos e imágenes pueden procesarse en una sola pasada gracias al codificador de visión y al contexto largo.
- Agentes autónomos con múltiples pasos: el modelo está diseñado para cargas agénticas, donde la latencia de contexto largo domina el coste; la decodificación MTP ayuda a sostener el throughput en bucles de razonamiento.
- Generación de código en pipelines de CI/CD: puede integrarse en flujos de revisión y generación de parches; conviene validar previamente el soporte real de tool calling en el runtime elegido.
- Despliegue en infraestructura propia con FP8: la cuantización de bloques de 128 y la compatibilidad con vLLM, SGLang y TokenSpeed permiten servir el modelo en GPUs de datacenter reduciendo la huella de memoria frente al modelo en precisión original.
- Procesamiento por lotes de documentación técnica y extracción de información estructurada, aprovechando el contexto largo para evitar fragmentación y pérdida de referencias cruzadas.
- Investigación sobre arquitecturas híbridas: al ser un avance experimental de la arquitectura Qwen4, sirve para estudiar el comportamiento de Gated DeltaNet, QSA y Gated Residual en cargas reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio FP8 ocupa 185,6 GB, por lo que la inferencia requiere al menos esa cantidad de memoria agregada para cargar los pesos completos en FP8.
- Con 6.000 millones de parámetros activos por token, el cómputo por token es moderado, pero la huella de memoria viene dominada por los 51.000 millones de parámetros del embedding de n-gramas, que el autor señala como apto para offloading en aceleradores con memoria limitada.
- GPUs recomendadas para servicio completo: H100 (80 GB) en configuraciones multi-GPU, H200 o B200; no se dispone de cifras oficiales de VRAM mínima por configuración.
- No cabe en GPUs de consumo como una RTX 4090 (24 GB) con los pesos completos en FP8; sería necesario sharding multi-GPU o cuantizaciones adicionales no publicadas en esta información.
- Opciones de despliegue soportadas: Hugging Face Transformers, vLLM, SGLang y TokenSpeed.
- Latencia y throughput estimados: no disponibles. El autor afirma que QSA reduce significativamente la latencia en contexto largo, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-FP8 | 180B totales (125B LM + 51B n-gram + 4B MTP) | 6B | 262.144 nativos; hasta 1.000.000 | qwen-community-1.0 | Pesos abiertos en Hugging Face |
| Qwen3.8-Flash-Next | 180B totales (misma arquitectura) | 6B | 262.144 nativos; hasta 1.000.000 | qwen-community-1.0 | Pesos abiertos en Hugging Face |
| Qwen3.8-Flash (gestionado) | no disponible | no disponible | 1.000.000 por defecto | servicio propietario | API en Qwen Cloud |
| Otras alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye datos de rendimiento comparado con otros modelos de la misma categoría, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Se trata de una vista previa experimental de la arquitectura que sustentará Qwen4; el autor no garantiza estabilidad de API ni de comportamiento en producción.
- La licencia qwen-community-1.0 está etiquetada como "other" y no es una licencia de código abierto estándar; es obligatorio revisar el archivo LICENSE antes de cualquier uso comercial.
- No se detalla la composición del dataset de entrenamiento, lo que dificulta evaluar sesgos conocidos.
- No se especifican los idiomas soportados, por lo que el rendimiento fuera de los idiomas principales de Qwen es incierto.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad en la información disponible.
- La cuantización FP8, aunque el autor la describe como casi idéntica al original, puede introducir degradaciones marginales no cuantificadas en esta ficha.
- El tamaño del repositorio (185,6 GB) y la huella del embedding de n-gramas complican el despliegue en entornos con memoria limitada y requieren planificación de offloading.
- El contexto extendido hasta 1.000.000 de tokens no está garantizado como comportamiento nativo; la model card distingue entre contexto nativo y extensible.
- No se confirma en la información disponible el soporte de tool calling ni de function calling en esta variante de pesos abiertos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Qwen/Qwen3.8-Flash-Next-FP8
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Blog oficial de Qwen3.8-Flash-Next: https://qwen.ai/blog?id=qwen3.8-flash-next
- Informe técnico: https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/tech_report.pdf
- Repositorio GitHub: https://github.com/QwenLM/Qwen3.8-Flash-Next
- Qwen Cloud (servicio gestionado): https://www.qwencloud.com
- Descripción de Qwen3.8-Flash: https://www.qwencloud.com/models/qwen3.8-flash
- Qwen Chat: https://chat.qwen.ai/
- Portal de Qwen: https://qwen.ai/home
- Wikipedia (EN): https://en.wikipedia.org/wiki/Qwen
- Wikipedia (FR): https://fr.wikipedia.org/wiki/Qwen
