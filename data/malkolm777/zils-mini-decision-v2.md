# malkolm777/zils-mini-decision-v2

## Resumen

zils-mini-decision-v2 es un modelo de extracción de características (feature-extraction) publicado por el usuario malkolm777 en Hugging Face, concebido como un "cuerpo de decisión" para el pool mini de la subnet 127 de Zils. Se trata de un fine-tuning mediante LoRA (rango 16) sobre el modelo base vllm-sr/d3-mini, que pertenece a la familia Qwen/Qwen3.5-4B, y está orientado a producir representaciones útiles para tareas de clasificación, puntuación y enrutamiento de decisiones en aplicaciones.

El modelo cuenta con 4.539.265.536 parámetros en formato safetensors (aproximadamente 4,5 mil millones), lo que lo sitúa en la gama de modelos pequeños desplegables en hardware de consumo moderado. Su propósito no es la generación de texto libre, sino servir como extractor de embeddings para que una aplicación pueda ordenar solicitudes, señalar problemas o puntuar coincidencias, según la propuesta de valor de la plataforma Zils.

La relevancia actual del modelo es limitada pero específica: cubre el nicho de modelos de decisión ligeros entrenados con datos etiquetados por resultados públicos (reversiones de Wikipedia, anuncios de categorías de arXiv, fusiones de Gerrit, Stack Exchange, AfC/AfD de Wikipedia). Su licencia Apache-2.0 facilita la integración comercial, aunque la ausencia de documentación detallada sobre contexto, idiomas y benchmarks limita su evaluación rigurosa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen/Qwen3.5-4B, según model card); no se detalla variante exacta |
| Parámetros totales | 4.539.265.536 (4,5 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; se asume compatibilidad con cuantizaciones estándar de transformers, sin confirmar) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en un transformer de la familia Qwen/Qwen3.5-4B, según indica la model card, y se ha obtenido mediante un fine-tuning con LoRA de rango 16 sobre el modelo "house body" vllm-sr/d3-mini (Apache-2.0). La model card no especifica la arquitectura interna exacta (número de capas, dimensión oculta, mecanismo de atención) ni si incorpora innovaciones como atención lineal o decodificación especulativa.

El entrenamiento se realizó sobre un conjunto "más amplio y sin límite" de ítems de decisión procedentes de fuentes públicas etiquetadas por resultados, recopiladas con la herramienta zils.current: reversiones de Wikipedia, anuncios de categorías de arXiv, fusiones de Gerrit, Stack Exchange y procesos AfC/AfD de Wikipedia. No se detalla el número de tokens, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO. La etiqueta `custom_code` sugiere que el repositorio incluye código personalizado para cargar o usar el modelo, pero no se aporta documentación adicional.

## Capacidades

- Extracción de características (feature-extraction): pipeline declarado del modelo, orientado a generar embeddings para clasificación, puntuación y enrutamiento.
- Modelo de decisión: diseñado para tareas de decisión binaria o multietiqueta sobre ítems (por ejemplo, aceptar/rechazar, ordenar solicitudes, señalar problemas).
- Entrenamiento con datos etiquetados por resultados: el fine-tuning se apoya en señales de resultado de fuentes públicas (reversiones, fusiones, anuncios), lo que puede aportar sesgo hacia patrones de decisión reales.
- Soporte de tool calling / function calling: no disponible (no se documenta).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se documenta).
- Capacidades multilingües: no disponible (no se especifican idiomas).
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Enrutamiento de solicitudes en aplicaciones: usar los embeddings del modelo para clasificar peticiones entrantes y dirigirlas al módulo o cola adecuada, aprovechando su entrenamiento en ítems de decisión etiquetados.
- Moderación y señalización de problemas: puntuar contenidos o mensajes para detectar los que requieren revisión humana, apoyándose en el pipeline de feature-extraction y un clasificador ligero posterior.
- Puntuación de coincidencias (matching): calcular similitud entre ítems (por ejemplo, candidatos y ofertas, o preguntas y respuestas) mediante los embeddings generados por el modelo.
- Priorización de incidencias: ordenar tickets o informes según probabilidad de ser aceptados o rechazados, usando las representaciones del modelo como entrada a un modelo de ranking.
- Filtrado previo en pipelines de datos: descartar automáticamente ítems de baja calidad o irrelevantes antes de procesos costosos, con un coste computacional bajo gracias al tamaño de 4,5 B.
- Investigación sobre modelos de decisión: servir como base para experimentos de fine-tuning adicional o para comparar estrategias de decisión en dominios con etiquetas de resultado públicas.
- Integración en aplicaciones Zils: usar el modelo como "cuerpo de decisión" en el pool mini de la subnet 127, tal como propone el autor, para tareas de decisión personalizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para 4,5 B de parámetros, una estimación orientativa sería de ~9 GB en fp16, ~5 GB en int8 y ~2,5-3 GB en cuantización de 4 bits, aunque no hay confirmación del autor.
- GPU recomendadas: no disponible. Por tamaño, cabría esperar funcionamiento en GPUs de consumo con suficiente VRAM (por ejemplo, RTX 3090/4090 de 24 GB en fp16), pero no se documenta.
- ¿Cabe en consumer GPU?: probablemente sí en GPUs de 8-24 GB según cuantización, sin confirmación oficial.
- Opciones de despliegue: transformers (librería declarada); no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-mini-decision-v2 | 4,5 B | no disponible | Apache-2.0 | Hugging Face (malkolm777) | Fine-tuning LoRA de vllm-sr/d3-mini para decisión |
| qhoenix/zils-mini-decision-v2 | ~5 B (según búsqueda) | no disponible | no disponible | Hugging Face (qhoenix) | Variante/duplicado del mismo modelo; sin datos de rendimiento |
| vllm-sr/d3-mini | no disponible | no disponible | Apache-2.0 (según model card) | Hugging Face | Modelo base del que deriva este fine-tuning |

No se dispone de datos de rendimiento que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Ausencia de benchmarks: no hay métricas publicadas que permitan evaluar su calidad frente a alternativas.
- Documentación incompleta: se desconoce la longitud de contexto, los idiomas soportados y los detalles de arquitectura.
- Riesgo de alucinación y sesgo: al entrenarse con datos de resultados públicos (reversiones, fusiones, anuncios), puede heredar sesgos de esas fuentes y de los criterios de moderación de las comunidades correspondientes.
- Uso previsto restringido: está diseñado como extractor de características y modelo de decisión, no como generador de texto conversacional; usarlo fuera de ese ámbito puede dar resultados pobres.
- Licencia Apache-2.0: permite uso comercial, pero se recomienda revisar los ficheros LICENSE y NOTICE del repositorio por posibles atribuciones adicionales.
- Madurez: el modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; no hay evidencia de uso en producción.
- Código personalizado: la etiqueta `custom_code` implica que la carga puede requerir `trust_remote_code=True`, con el riesgo de seguridad asociado.

## Enlaces

- Hugging Face: https://huggingface.co/malkolm777/zils-mini-decision-v2
- Variante/duplicado en Hugging Face: https://huggingface.co/qhoenix/zils-mini-decision-v2
- Sitio de Zils: https://zils.ai/
- Modelo base: https://huggingface.co/vllm-sr/d3-mini
