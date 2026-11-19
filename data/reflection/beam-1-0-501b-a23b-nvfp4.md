# reflection/Beam-1.0-501B-A23B-NVFP4

## Resumen

Beam-1.0-501B-A23B-NVFP4 es la versión cuantizada en NVFP4 del modelo Beam de Reflection, un modelo de lenguaje de gran escala con arquitectura de mezcla de expertos (MoE) dispersa. El checkpoint contiene 501.300 millones de parámetros totales, de los cuales 23.400 millones están activos por token, y está diseñado para tareas de razonamiento, ingeniería de software y uso de herramientas en entornos agénticos. Esta variante concreta emplea numerica NVFP4 (punto flotante de 4 bits) generada con NVIDIA ModelOpt, lo que reduce el peso del repositorio a 293,6 GB frente a los checkpoints BF16 y FP8 que el autor publica por separado.

El modelo destaca por su eficiencia en tokens de razonamiento: según el autor, alcanza una calidad de solución comparable a modelos abiertos líderes empleando aproximadamente tres veces menos tokens de inferencia en el razonamiento. Soporta una ventana de contexto de 1 millón de tokens, lo que lo sitúa en la gama alta para tareas de contexto largo como análisis de repositorios completos o flujos agénticos prolongados. Está entrenado predominantemente en inglés y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

La relevancia actual de este checkpoint reside en que combina un modelo MoE de gran escala con una cuantización de 4 bits optimizada para hardware NVIDIA reciente, lo que facilita su despliegue en infraestructura con memoria limitada. El tag `deploy:sagemaker` y `deploy:azure` indica soporte declarado para plataformas gestionadas de despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE dispersa (3 capas densas + 49 MoE), atención GQA con compuerta y sliding window attention |
| Parametros totales | 501,3B (según model card); 254.642.537.152 según safetensors del repo |
| Parametros activos | 23,4B |
| Longitud de contexto | 1M tokens |
| Tipos de cuantizacion | NVFP4 (este checkpoint); el autor publica también BF16 y FP8 |
| Idiomas soportados | Inglés (predominante); no se detallan otros idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (cuantización NVFP4 generada con NVIDIA ModelOpt) |

Nota: existe una discrepancia entre los 501,3B declarados en la model card y los 254.642.537.152 parámetros reportados por los metadatos de safetensors del repositorio. La cifra de safetensors corresponde probablemente al recuento de tensores empaquetados en la cuantización NVFP4, no al número de parámetros lógicos del modelo.

Otros datos de la model card: 52 capas (3 densas + 49 MoE), vocabulario de 152k tokens, 256 expertos, modalidad solo texto, plantilla de chat basada en formato Harmony modificado, corte de conocimiento el 30 de junio de 2026.

## Arquitectura y entrenamiento

Beam emplea una arquitectura transformer con mezcla de expertos dispersa: 52 capas en total, de las cuales 3 son densas y 49 son capas MoE con 256 expertos cada una. La atención combina GQA (grouped-query attention) con compuerta y sliding window attention, un diseño que reduce el coste computacional en contextos largos y hace viable la ventana de 1M tokens. El modelo está ajustado para instrucciones (instruction-tuned) y usa una plantilla de chat derivada del formato Harmony.

No se dispone en la información proporcionada del número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF, DPO u otras técnicas de alineación. El autor anuncia un technical report "coming" (pendiente de publicación) que probablemente detallará estos aspectos. La innovación técnica destacada por el autor es la eficiencia en tokens de razonamiento: el modelo alcanza calidad comparable a modelos abiertos líderes con aproximadamente 3x menos tokens de inferencia dedicados al razonamiento, lo que reduce latencia y coste en despliegues de producción. También se menciona integración con MCP (Model Context Protocol) para uso de herramientas.

## Capacidades

- Generación de texto conversacional y razonamiento general.
- Razonamiento token-eficiente: calidad comparable a modelos abiertos líderes con aproximadamente 3x menos tokens de razonamiento.
- Ingeniería de software: resolución de issues reales de GitHub, operación en entornos CLI y DevOps, integración con arneses de codificación agéntica, generación de código en múltiples lenguajes.
- Uso de herramientas agéntico: finalización de tareas de horizonte largo, integración de herramientas basada en MCP, navegación web.
- Ejecución de flujos de trabajo multi-paso a partir de instrucciones en lenguaje natural.
- Razonamiento matemático y científico: resolución de problemas de nivel de posgrado, demostración de teoremas y matemáticas aplicadas.
- Transferencia del razonamiento a depuración, planificación y autocorrección durante la ejecución agéntica.
- Soporte de tool calling / function calling (implícito en las capacidades agénticas descritas).
- Capacidades multilingües: limitadas; el modelo está desarrollado predominantemente para inglés.

## Casos de uso

- **Resolución automática de issues en repositorios**: el modelo puede recibir un issue de GitHub junto con el contexto del repositorio y generar un parche. La ventana de 1M tokens permite incluir archivos relevantes y trazas de error sin truncar, y su entrenamiento específico en entornos CLI y DevOps lo hace adecuado para este flujo.
- **Agentes de codificación en CLI**: integración en arneses agénticos de línea de comandos para tareas de refactorización, corrección de tests o generación de scripts. El soporte de tool calling y MCP permite al agente invocar comandos, leer archivos y validar resultados de forma iterativa.
- **Automatización de operaciones DevOps**: ejecución de flujos multi-paso como diagnóstico de fallos en pipelines, consulta de logs y aplicación de remediaciones, aprovechando el razonamiento de horizonte largo y la capacidad de autocorrección.
- **Asistente de razonamiento científico y matemático**: resolución de problemas de nivel de posgrado, demostración de teoremas y matemáticas aplicadas, con la ventaja de consumir aproximadamente un tercio de los tokens de razonamiento de modelos comparables, lo que abarata el coste por consulta.
- **Agentes de navegación y extracción de información**: uso de browsing y tool calling para tareas de investigación multi-paso, como recopilar datos de varias fuentes y sintetizarlos en un informe.
- **Análisis de documentación técnica extensa**: con 1M tokens de contexto, el modelo puede procesar manuales completos, especificaciones o bases de código y responder preguntas que requieran correlacionar información distribuida a lo largo de cientos de miles de tokens.
- **Atención al cliente técnica de nivel avanzado**: conversaciones multi-turno con contexto largo para soporte de producto, donde el modelo puede mantener el hilo de un caso complejo y consultar documentación extensa en la misma ventana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni métricas comparativas numéricas; únicamente afirma de forma cualitativa que el modelo alcanza calidad comparable a modelos abiertos líderes con aproximadamente 3x menos tokens de razonamiento. El technical report está anunciado pero no disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el repositorio NVFP4 ocupa 293,6 GB, por lo que se necesita al menos esa cantidad de memoria agregada para cargar los pesos completos. En la práctica, el despliegue requiere múltiples GPUs o nodos con memoria combinada superior a 300 GB.
- **GPU recomendadas**: GPUs NVIDIA con soporte de NVFP4 (generaciones recientes con Tensor Cores de cuarta generación o posteriores, como H100, H200, B200). El formato NVFP4 está optimizado para hardware NVIDIA reciente; GPUs más antiguas o de consumo probablemente no soportan esta cuantización de forma nativa.
- **¿Cabe en GPU de consumo?**: no. Con 293,6 GB de pesos en NVFP4, no cabe en ninguna GPU de consumo individual (RTX 4090 con 24 GB, RTX 5090 con 32 GB). Se requiere infraestructura multi-GPU de centro de datos.
- **Opciones de despliegue**: el tag `modelopt` sugiere compatibilidad con el ecosistema NVIDIA ModelOpt; los tags `deploy:sagemaker` y `deploy:azure` indican soporte declarado para Amazon SageMaker y Azure. No se detallan en la información disponible integraciones con vLLM, llama.cpp, Ollama o TGI para este checkpoint NVFP4 concreto.
- **Latencia y throughput**: no disponibles. La eficiencia en tokens de razonamiento (3x menos) sugiere una reducción proporcional del coste de generación en tareas de razonamiento, pero no se publican cifras de latencia ni tokens por segundo.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones de modelos alternativos que permitan una comparación cuantitativa rigurosa. Se indica "no disponible" para la comparativa numérica. Cualitativamente, el modelo se posiciona en la categoría de MoE de gran escala con contexto de 1M tokens y licencia Apache 2.0, pero sin cifras publicadas no es posible contrastarlo con alternativas concretas sin inventar datos.

## Limitaciones y advertencias

- **Idioma**: el modelo está desarrollado predominantemente para inglés; el rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- **Sesgos**: no se documentan en la información disponible los sesgos conocidos del modelo; al ser un modelo entrenado principalmente en inglés, es esperable un sesgo hacia contenido y perspectivas anglófonas.
- **Alucinación**: no se proporcionan tasas de alucinación ni evaluaciones de fidelidad; como todo modelo generativo, existe riesgo de generar información incorrecta, especialmente en dominios científicos o de código donde el autor afirma capacidades avanzadas.
- **Discrepancia en el recuento de parámetros**: la model card declara 501,3B totales mientras que los metadatos de safetensors reportan 254,6B; conviene verificar la cifra real antes de dimensionar infraestructura.
- **Hardware restringido**: la cuantización NVFP4 exige GPUs NVIDIA recientes; no es desplegable en hardware de consumo ni en aceleradores de otros fabricantes sin conversión adicional.
- **Licencia**: Apache 2.0 permite uso comercial sin restricciones adicionales, pero conviene revisar el archivo LICENSE del repositorio para confirmar que no hay cláusulas adicionales.
- **Documentación incompleta**: el technical report está pendiente de publicación; faltan datos de entrenamiento, alineación y evaluación que son relevantes para producción.
- **Contexto de 1M tokens**: aunque la ventana es amplia, el rendimiento efectivo en los extremos de la ventana no está documentado; el sliding window attention puede degradar la recuperación de información muy distante.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reflection/Beam-1.0-501B-A23B-NVFP4
- Organización en Hugging Face: https://huggingface.co/reflection
- GitHub de Reflection: https://github.com/reflection-oss
- Blog de lanzamiento: https://reflection.ai/blog
- Documentación para desarrolladores: https://developers.reflection.ai/introduction
- Licencia: https://huggingface.co/reflection/Beam-1.0-501B-A23B/blob/main/LICENSE
- Technical report: anunciado, no disponible en el momento de redactar esta ficha.
