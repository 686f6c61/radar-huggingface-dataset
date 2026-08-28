# Ares-Realm-Studios/Hy4-preview

## Resumen

Hy4 preview es un modelo de lenguaje de última generación desarrollado por el equipo Tencent Hy, presentado como el nuevo buque insignia de la familia Hunyuan. Se trata de un modelo de arquitectura Mixture-of-Experts (MoE) con 770 mil millones de parámetros en el backbone, más una capa adicional MTP (Multi-Token Prediction) de 10 mil millones, lo que suma aproximadamente 780 mil millones de parámetros totales. De ellos, solo 49 mil millones se activan por token (0,7 mil millones adicionales en la capa MTP), lo que lo sitúa en la categoría de modelos MoE de gran escala con inferencia eficiente.

El modelo destaca por su ventana de contexto de 1 millón de tokens, una de las más largas entre los modelos abiertos, y por incorporar innovaciones arquitectónicas como la atención dispersa Gated DSA (DeepSeek Sparse Attention) con IndexCache, y conexiones residuales iHC (identity Hyper-Connections). Está diseñado específicamente para tareas de productividad: ingeniería de software, análisis de oficina, desarrollo de juegos e investigación científica, con un entrenamiento post-entrenamiento orientado a casos de uso reales de equipos internos de Tencent. Su relevancia actual radica en que se posiciona como uno de los modelos abiertos más potentes, compitiendo directamente con alternativas como GLM 5.3 y Kimi K3, según evaluaciones internas de Tencent.

La versión publicada es una preview, con limitaciones conocidas como un exceso de razonamiento en tareas complejas y una tendencia a sobre-verificar resultados. Se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atención Gated DSA (DeepSeek Sparse Attention) y conexiones residuales iHC |
| Parametros totales | 779.960.992.733 (~780B) según safetensors; 770B backbone + 10B capa MTP según model card |
| Parametros activos | 49B (backbone) + 0,7B (capa MTP) |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | FP8 disponible (versión Hy4-preview-FP8 en ModelScope); otras cuantizaciones no especificadas |
| Idiomas soportados | No disponible (probablemente multilingüe, pero no se especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Hy4 preview utiliza una arquitectura MoE con 78 capas: la primera capa emplea una FFN densa estándar, mientras que las 77 restantes sustituyen la FFN por un bloque MoE con 256 expertos enrutados y 1 experto compartido. Cada token activa los 8 mejores expertos enrutados más el experto compartido. El tamaño oculto es de 6144, con 64 cabezas de atención y dimensiones de compresión de consulta y clave-valor de 2048 y 512 respectivamente. La atención se implementa mediante Gated DeepSeek Sparse Attention (Gated DSA), que combina atención dispersa con un mecanismo de compuerta, y utiliza IndexCache para reutilizar índices de dispersión entre capas, reduciendo el coste computacional. Además, el modelo incorpora una capa nativa MTP (Multi-Token Prediction) de 10B parámetros (0,7B activos) que permite decodificación especulativa para acelerar la inferencia.

Sobre el entrenamiento, la model card indica que se escaló en tres frentes: tamaño del modelo, longitud de contexto y datos de entrenamiento. Se menciona un pre-entrenamiento más fuerte y un post-entrenamiento sustancialmente mayor, con datos construidos en colaboración con expertos internos de Tencent (ingenieros de software, desarrolladores de juegos, analistas financieros y expertos en seguridad). No se proporcionan cifras concretas sobre el número de tokens de entrenamiento, la composición del dataset ni si se utilizaron técnicas de RLHF o DPO. La evaluación interna con 163 expertos en 203 tareas de ingeniería sugiere que el post-entrenamiento está orientado a casos de uso de productividad real.

## Capacidades

- Generación de texto y razonamiento complejo: el modelo maneja tareas de razonamiento multi-paso y resolución de problemas en dominios técnicos y científicos.
- Ingeniería de software: comprensión, planificación, depuración y verificación de tareas de desarrollo de largo alcance, incluyendo mejoras en el gusto visual y la calidad de interacción en trabajos de front-end.
- Ofimática y análisis: procesa contexto desordenado de múltiples archivos y lo convierte en artefactos compartibles (documentos, hojas de cálculo, presentaciones), con precisión en análisis de datos, ecuaciones y modelos financieros.
- Desarrollo de juegos: convierte un prompt en un prototipo jugable y trabaja con motores de juego, permitiendo refinar proyectos complejos en múltiples turnos.
- Investigación científica: comprensión, razonamiento y resolución de problemas en áreas como IA, dinámica molecular, física de la materia condensada y matemáticas puras.
- Decodificación especulativa: gracias a la capa MTP integrada, puede acelerar la generación de texto en entornos de producción.
- Soporte de tool calling y agentes: no se menciona explícitamente en la información disponible, pero dado su diseño para productividad y su integración con productos como CodeBuddy y WorkBuddy, es probable que lo soporte; sin embargo, no hay confirmación oficial en la documentación proporcionada.

## Casos de uso

- Asistente de programación en producción: el modelo puede integrarse en entornos de desarrollo integrado (IDE) para ayudar en la escritura, revisión y depuración de código. Su capacidad para manejar contextos largos (1M tokens) permite cargar repositorios completos y mantener conversaciones multi-turno sobre el proyecto, facilitando tareas de refactorización y detección de errores.
- Generación de documentación técnica: a partir de código fuente o especificaciones dispersas, el modelo puede generar documentación estructurada, guías de usuario y comentarios de código, gracias a su entrenamiento en ofimática y análisis.
- Análisis financiero y elaboración de informes: puede procesar datos financieros en múltiples formatos (hojas de cálculo, informes, bases de datos) y generar modelos predictivos, resúmenes ejecutivos y presentaciones, reduciendo el tiempo de análisis manual.
- Prototipado rápido de videojuegos: un desarrollador puede describir una mecánica de juego en lenguaje natural y obtener un prototipo jugable en un motor como Unity o Unreal, iterando sobre el resultado en conversaciones sucesivas.
- Investigación científica asistida: para investigadores en física, química o matemáticas, el modelo puede ayudar a explorar hipótesis, revisar literatura, resolver ecuaciones simbólicas y sugerir experimentos, aprovechando su capacidad de razonamiento profundo.
- Automatización de tareas de oficina: el modelo puede transformar notas dispersas o correos electrónicos en documentos formales, presentaciones o actas de reunión, con formato y estructura coherentes, gracias a su entrenamiento en artefactos compartibles.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card incluye referencias a imágenes de benchmarks, pero los valores no se proporcionan en texto. El único dato cuantitativo disponible es una evaluación ciega interna realizada por Tencent con 163 expertos en 203 tareas de ingeniería, comparando Hy4 preview con GLM 5.3 y Kimi K3:

| Modelo | Puntuación media | Victorias | Empates | Derrotas |
|---|---|---|---|---|
| Hy4 preview | 2,99 | - | - | - |
| GLM 5.3 | 2,92 | 46,8% | 12,8% | 40,4% |
| Kimi K3 | 2,94 | 51,2% | 7,9% | 40,9% |

Estos resultados indican una ligera ventaja de Hy4 preview sobre ambos competidores en tareas de ingeniería, según la evaluación interna de Tencent. No hay datos independientes verificables.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de hardware en la documentación. Sin embargo, dado el tamaño del modelo (780B parámetros totales, 49B activos), se pueden estimar los siguientes requisitos:
  - VRAM estimada para inferencia en FP8: aproximadamente 780 GB (780B × 1 byte por parámetro). En FP16 sería el doble (~1,56 TB). Con cuantización de 4 bits (GGUF Q4), ~390 GB.
  - GPU recomendadas: para ejecutar el modelo completo en FP8 se necesitarían múltiples GPUs de alta gama, como 8 × H100 (80 GB) o 8 × A100 (80 GB). Para una versión cuantizada a 4 bits, podrían bastar 4 × RTX 4090 (24 GB) o 4 × A6000 (48 GB), pero la latencia sería alta.
  - No cabe en una GPU de consumo estándar (RTX 4090, 24 GB) ni siquiera con cuantización extrema, debido al tamaño total del modelo. Solo es viable en entornos multi-GPU o con servicios en la nube.
  - Opciones de despliegue: la model card menciona soporte para vLLM y SGLang, así como herramientas de finetuning y cuantización. También se puede usar con llama.cpp si se generan archivos GGUF, aunque no se menciona oficialmente.
  - Latencia y throughput: no disponibles. La capa MTP de decodificación especulativa debería mejorar el throughput en comparación con modelos MoE similares sin ella, pero no hay cifras publicadas.

## Comparativa con modelos similares

Hy4 preview compite directamente con otros modelos MoE de gran escala de código abierto. Según la información disponible, se puede comparar con GLM 5.3 y Kimi K3, aunque no se proporcionan especificaciones detalladas de estos últimos. La comparación se basa en la evaluación interna de Tencent:

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Rendimiento (evaluación interna) |
|---|---|---|---|---|---|
| Hy4 preview | ~780B | 49B + 0,7B | 1M | Apache 2.0 | 2,99 sobre 3 en tareas de ingeniería |
| GLM 5.3 | No disponible | No disponible | No disponible | No disponible | 2,92 sobre 3 |
| Kimi K3 | No disponible | No disponible | No disponible | No disponible | 2,94 sobre 3 |

No se dispone de información pública sobre los parámetros exactos, contexto o licencias de GLM 5.3 y Kimi K3 en la información proporcionada. Hy4 preview se diferencia por su contexto de 1M tokens y su arquitectura con atención dispersa Gated DSA, que no está presente en los otros dos según la documentación disponible.

## Limitaciones y advertencias

- Versión preview: se trata de una versión temprana con margen de mejora tanto en pre-entrenamiento como en post-entrenamiento. La model card advierte explícitamente de limitaciones conocidas.
- Exceso de razonamiento: el modelo tiende a dedicar más tiempo del necesario a razonar sobre tareas complejas, lo que puede aumentar la latencia y el coste computacional en producción.
- Sobre-verificación: muestra una tendencia a verificar en exceso sus propias respuestas, lo que puede llevar a respuestas redundantes o a un consumo innecesario de tokens.
- Sesgos y alucinaciones: no se proporcionan datos específicos sobre sesgos o tasas de alucinación. Como cualquier modelo de lenguaje, existe riesgo de generar información falsa o inventada, especialmente en dominios fuera de su entrenamiento.
- Idiomas: no se especifican los idiomas soportados, por lo que el rendimiento en idiomas distintos del inglés y el chino (dado el origen del modelo) no está garantizado.
- Requisitos de hardware: el tamaño del modelo (780B) hace que sea inviable para la mayoría de entornos de desarrollo locales. Solo es práctico en infraestructuras multi-GPU o servicios en la nube con capacidad suficiente.
- Disponibilidad del repositorio: el repositorio de HuggingFace listado (Ares-Realm-Studios/Hy4-preview) parece ser un mirror no oficial con 0 descargas y 0 likes. El repositorio oficial es tencent/Hy4-preview. Se recomienda verificar la autenticidad de las descargas.

## Enlaces

- Repositorio oficial en HuggingFace: https://huggingface.co/tencent/Hy4-preview
- Repositorio mirror en HuggingFace (el proporcionado en la consulta): https://huggingface.co/Ares-Realm-Studios/Hy4-preview
- Repositorio en GitHub: https://github.com/Tencent-Hunyuan/Hy4-preview
- Página oficial de investigación: https://hy.tencent.ai/research/hy4-preview?langVersion=en
- Versión FP8 en ModelScope: https://www.modelscope.cn/models/Tencent-Hunyuan/Hy4-preview-FP8
- Comunicado de Tencent: https://www.tencent.com/tencent-releases-and-open-sources-tencent-hy4-preview/
- Artículo de referencia sobre Gated DSA (arXiv): https://arxiv.org/abs/2512.02556
- Artículo de referencia sobre IndexCache (arXiv): https://arxiv.org/abs/2603.12201
- Artículo sobre iHC (identity Hyper-Connections): https://zhuanlan.zhihu.com/p/2010852389670908320
