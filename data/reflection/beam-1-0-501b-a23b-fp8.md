# reflection/Beam-1.0-501B-A23B-FP8

## Resumen

Beam-1.0-501B-A23B-FP8 es la versión cuantizada en FP8 del modelo de lenguaje Beam 1.0, desarrollado por Reflection. Se trata de un modelo de mezcla de expertos (MoE) dispersa con 501.267.612.352 parámetros totales (501,3B) y 23,4B parámetros activos por token, diseñado para generación de texto con un enfoque explícito en eficiencia de tokens durante el razonamiento, ingeniería de software y uso agéntico de herramientas.

El modelo se distribuye bajo licencia Apache 2.0 y está entrenado predominantemente en inglés. Su característica más destacable es una ventana de contexto de 1M tokens combinada con un modo de razonamiento que, según el autor, alcanza calidad de solución comparable a modelos abiertos líderes con aproximadamente 3 veces menos tokens de razonamiento en tiempo de inferencia. El checkpoint aquí descrito contiene los pesos en FP8; el release de Beam también incluye variantes BF16 y NVFP4.

La relevancia de esta ficha radica en que el modelo está orientado a cargas de trabajo agénticas de larga duración (resolución de issues reales de GitHub, entornos CLI y DevOps, integración con MCP), donde el coste por token y la longitud de contexto son factores determinantes. La cuantización FP8 reduce el peso del repositorio a 503,3 GB, lo que condiciona fuertemente los requisitos de hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE dispersa: 52 capas (3 densas + 49 MoE), atención Gated GQA + Sliding Window Attention |
| Parametros totales | 501.267.612.352 (501,3B) |
| Parametros activos | 23,4B |
| Longitud de contexto | 1.000.000 tokens (1M) |
| Tipos de cuantizacion | FP8 (este checkpoint); el release incluye también BF16 y NVFP4 |
| Idiomas soportados | Inglés (predominante) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors para la cuantización FP8) |
| Numero de expertos | 256 |
| Tamano de vocabulario | 152k tokens |
| Modalidades | Texto |
| Plantilla de chat | Formato Harmony modificado |
| Knowledge cutoff | 30 de junio de 2026 |
| Tamano del repositorio | 503,3 GB |

## Arquitectura y entrenamiento

Beam emplea una arquitectura de mezcla de expertos dispersa con 52 capas en total, de las cuales 3 son densas y 49 son capas MoE, con 256 expertos por capa. La atención combina Gated Grouped-Query Attention (GQA) con Sliding Window Attention, una elección coherente con la ventana de contexto de 1M tokens: la atención de ventana deslizante limita el coste computacional de la atención a medida que crece la secuencia, mientras que GQA reduce el coste de memoria de la caché KV. El vocabulario es de 152k tokens y el modelo es exclusivamente de texto.

La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO; esa información se remite a un Technical Report que el autor marca como "coming" (pendiente de publicación) y que no está disponible en la información proporcionada. Sí se declara explícitamente que el modelo está instruction-tuned, que el entrenamiento se orientó predominantemente al inglés y que el conocimiento tiene fecha de corte el 30 de junio de 2026. La innovación técnica destacada por el autor es la eficiencia de tokens en razonamiento (aproximadamente 3x menos tokens de inferencia para calidad comparable), junto con el soporte nativo de integración de herramientas vía MCP y la ejecución de flujos de trabajo multi-paso.

## Capacidades

- Generación de texto conversacional con plantilla de chat basada en un formato Harmony modificado.
- Razonamiento token-eficiente: el autor declara calidad de solución comparable a modelos abiertos líderes con aproximadamente 3 veces menos tokens de razonamiento.
- Razonamiento matemático y científico: resolución de problemas de nivel de posgrado, demostración de teoremas y matemáticas aplicadas.
- Ingeniería de software: resolución de issues reales de GitHub, operación en entornos CLI y DevOps, integración con harnesses de codificación agéntica y generación de código en varios lenguajes.
- Uso agéntico de herramientas: finalización de tareas de horizonte largo, integración de herramientas basada en MCP y navegación web.
- Ejecución de flujos multi-paso a partir de instrucciones en lenguaje natural.
- Transferencia del razonamiento a depuración, planificación y autocorrección durante la ejecución agéntica.
- Capacidades multilingües: limitadas al inglés como idioma principal declarado.

## Casos de uso

- Resolución automática de issues en repositorios: el modelo puede recibir el contexto del repositorio y del issue y generar un parche, aprovechando su ventana de 1M tokens para incluir código y discusión sin truncar, y su entrenamiento específico en issues reales de GitHub.
- Agente de codificación en CLI y DevOps: integrado en harnesses agénticos, puede ejecutar comandos, interpretar la salida y corregir errores de forma iterativa, con soporte de tool calling y MCP para conectar con sistemas externos.
- Automatización de flujos de trabajo multi-paso: tareas como triaje de tickets, recopilación de información en varias fuentes y generación de informes, donde el razonamiento token-eficiente reduce el coste por tarea frente a modelos que consumen muchos tokens de pensamiento.
- Asistencia en investigación matemática y científica: demostración de teoremas y resolución de problemas de nivel de posgrado, con la ventana larga permitiendo incorporar papers y derivaciones completas en el contexto.
- Depuración y planificación asistida: dado un stack trace o una especificación, el modelo planifica pasos, identifica causas raíz y propone correcciones, apoyándose en la transferencia de razonamiento declarada por el autor.
- Navegación y extracción de información web: como parte de un agente con browsing, puede recorrer páginas, sintetizar contenido y completar tareas de investigación con contexto acumulado de hasta 1M tokens.
- Análisis de bases de código extensas: la ventana de 1M tokens permite cargar módulos completos o múltiples ficheros relacionados para tareas de refactorización y revisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona la etiqueta `eval-results`, pero los datos concretos de evaluaciones (MMLU, HumanEval, GSM8K u otras) no aparecen en el material proporcionado, por lo que no se incluyen cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en FP8 ocupan aproximadamente 501 GB (el repositorio completo son 503,3 GB); a ello hay que sumar la caché KV, que con contexto de 1M tokens y 49 capas MoE con GQA puede ser muy elevada. Para contexto corto, se necesitan del orden de 500-560 GB de VRAM; para contextos largos, bastante más.
- GPU recomendadas: no cabe en ninguna GPU consumer. Requiere nodos multi-GPU de centro de datos, como 8x H100 80GB (640 GB) o 8x H200 141GB para dar margen a la caché KV en contextos largos. Configuraciones con A100 80GB (8x = 640 GB) son viables para contexto moderado.
- GPU consumer: no es desplegable en RTX 4090, RTX 5090 ni similares, ni siquiera con cuantizaciones adicionales razonables, dado el tamaño base de 501B parámetros.
- Opciones de despliegue: el modelo está etiquetado para SageMaker y Azure; para servido local se puede usar vLLM o TGI con soporte de FP8 y compressed-tensors. No se dispone de información sobre conversión a GGUF ni soporte en llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada. Con 23,4B parámetros activos, el coste computacional por token es comparable a un modelo denso de ese tamaño, pero el ancho de banda de memoria para cargar expertos en un despliegue multi-GPU condiciona el throughput real.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de información suficiente sobre modelos comparables en la documentación proporcionada para establecer una comparativa rigurosa. Se indica "no disponible". Como referencia estructural, un MoE de ~500B totales y ~23B activos con contexto de 1M tokens se sitúa en la categoría de modelos abiertos de gran escala para cargas agénticas, pero sin cifras de rendimiento publicadas no es posible contrastarlo con alternativas concretas.

## Limitaciones y advertencias

- Idioma: el modelo está desarrollado predominantemente para inglés; el rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- Riesgo de alucinación: no se documentan medidas específicas de mitigación en la información disponible; como todo modelo generativo, puede producir contenido plausible pero incorrecto, especialmente en código y matemáticas.
- Sesgos: no se detallan evaluaciones de sesgo en la model card proporcionada.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar los términos del repositorio y de los componentes de terceros (por ejemplo, el formato Harmony modificado) antes de desplegar en producción.
- Requisitos de infraestructura: el tamaño de 501B parámetros en FP8 exige hardware multi-GPU de centro de datos; no es viable en entornos de una sola GPU.
- Contexto largo: aunque la ventana es de 1M tokens, no se documenta la degradación de calidad en contextos muy largos ni el coste real de memoria de la caché KV a esa longitud.
- Datos de entrenamiento y evaluación: la ausencia del Technical Report y de resultados de benchmarks impide verificar las afirmaciones de eficiencia y calidad del autor.
- Fecha de corte: el conocimiento se limita al 30 de junio de 2026; información posterior no está cubierta.

## Enlaces

- Hugging Face: https://huggingface.co/reflection/Beam-1.0-501B-A23B-FP8
- Organización en Hugging Face: https://huggingface.co/reflection
- GitHub: https://github.com/reflection-oss
- Blog de lanzamiento: https://reflection.ai/blog
- Documentación: https://developers.reflection.ai/introduction
- Licencia: https://huggingface.co/reflection/Beam-1.0-501B-A23B/blob/main/LICENSE
- Technical Report: pendiente de publicación (no disponible)
