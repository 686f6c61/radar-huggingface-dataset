# aisingapore/Gemma-SEA-Guard-12B-2602

## Resumen

Gemma-SEA-Guard-12B-2602 es un modelo de clasificación de seguridad (safety guard) desarrollado por AI Singapore dentro de la familia SEA-Guard, orientada específicamente al sudeste asiático. Se trata de un ajuste fino supervisado de Google Gemma 3 12B IT sobre aproximadamente un millón de pares de instrucción, con el objetivo de emitir una clasificación binaria en texto ("safe" o "unsafe") sobre peticiones de usuario y respuestas de asistentes LLM.

El modelo hereda la arquitectura decoder multimodal de Gemma 3, con capacidad de procesar texto e imágenes (pipeline image-text-to-text) y una ventana de contexto de 128k tokens. Su valor diferencial es la incorporación de criterios de seguridad culturalmente contextualizados para la región SEA, cubriendo birmano, inglés, indonesio, malayo, tagalo, tamil, tailandés y vietnamita, idiomas habitualmente infrarrepresentados en los sistemas de moderación de propósito general.

Es relevante ahora porque los filtros de seguridad entrenados sobre todo en inglés y en contextos occidentales fallan sistemáticamente al evaluar contenido en lenguas y marcos culturales del sudeste asiático. SEA-Guard ofrece un clasificador específico, desplegable con vLLM, que puede integrarse como capa de moderación en pipelines de aplicaciones conversacionales y sistemas multimodales de la región.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder multimodal (Gemma 3), base google/gemma-3-12b-it |
| Parametros totales | 12B (nominal); el recuento de tensores safetensors reportado es 1.166.448, dato no representativo del total de parametros |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128k tokens |
| Tipos de cuantizacion | no disponible (formato nativo en safetensors; compatible con cuantizacion estandar de transformers/vLLM) |
| Idiomas soportados | birmano (my), ingles (en), indonesio (id), malayo (ms), tagalo (tl), tamil (ta), tailandes (th), vietnamita (vi) |
| Licencia | Gemma (terminos de Google) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Gemma 3 12B IT, un transformer decoder multimodal capaz de procesar entradas de texto e imagen. Mantiene el tokenizador por defecto de Gemma 3 y la ventana de contexto de 128k tokens. La salida está restringida funcionalmente a una clasificación binaria en texto: "safe" o "unsafe", tanto para la petición del usuario como para la respuesta del asistente, e incluye la variante de clasificación imagen-texto.

El ajuste fino se realizó sobre aproximadamente 1 millón de pares de instrucción con criterios de seguridad cultural adaptados al contexto del sudeste asiático. La model card no detalla la composición exacta del dataset ni si se emplearon etapas de RLHF o DPO; remite al paper SEA-Guard (arXiv:2602.01618) para los detalles de los datos de entrenamiento. No se especifica el número total de tokens de entrenamiento ni la mezcla por idioma.

## Capacidades

- Clasificación binaria de seguridad de peticiones de usuario ("safe" / "unsafe").
- Clasificación de seguridad de respuestas generadas por asistentes LLM, considerando conjuntamente prompt y respuesta.
- Clasificación de seguridad en entradas multimodales imagen-texto (por ejemplo, peticiones que acompañan una imagen).
- Comprensión multilingüe en ocho idiomas del sudeste asiático más inglés.
- Manejo de contexto largo (128k tokens) para conversaciones multi-turno o documentos extensos.
- Uso directo sin fine-tuning adicional ni in-context learning, según indica el autor.
- Compatibilidad con vLLM para inferencia de alta velocidad.
- Posibilidad de continuar el entrenamiento sobre datasets específicos, incluidos conjuntos de seguridad visión-texto.

## Casos de uso

- Moderación de entrada en aplicaciones de chat: el modelo clasifica la petición del usuario antes de enviarla al LLM principal, bloqueando prompts inseguros en birmano, tailandés o vietnamita sin necesidad de traducir al inglés.
- Moderación de salida en producción: se evalúa la respuesta del asistente junto al prompt original para detectar respuestas dañinas aunque la petición fuera inocua, usando el formato de clasificación prompt+respuesta.
- Filtrado de contenido en plataformas sociales regionales: clasificación de publicaciones y comentarios en malayo, indonesio y tagalo con criterios culturales locales, reduciendo falsos positivos frente a filtros anglocéntricos.
- Moderación de contenido generado con imágenes: el modelo evalúa peticiones que incluyen una imagen (por ejemplo, generar un artículo que critique una fotografía), útil en herramientas de generación imagen-texto.
- Capa de seguridad en pipelines de agentes: integración como guard previo y posterior a cada paso de un agente multi-paso, con contexto de 128k tokens para revisar trayectorias completas.
- Investigación en seguridad lingüística: evaluación comparativa de la tasa de clasificación correcta en las ocho lenguas SEA frente a clasificadores genéricos, usando el modelo como referencia ajustada al dominio.
- Cumplimiento y auditoría: registro y clasificación automatizada de interacciones para revisión humana en despliegues regulados, dado que el autor recomienda supervisión humana sobre las salidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 24 GB solo para pesos de un modelo de 12B, más overhead de activaciones y caché KV; en la práctica se recomienda GPU de 40-80 GB para contextos largos.
- Cuantización a 8 bits: aproximadamente 12-14 GB de pesos, viable en GPU de 24 GB (RTX 4090, A10G, L4 de 24 GB) con contexto moderado.
- Cuantización a 4 bits: aproximadamente 7-8 GB de pesos, viable en GPU consumer de 12-16 GB, con degradación potencial en la precisión de clasificación no cuantificada por el autor.
- GPU recomendadas: A100 40/80 GB, H100 80 GB para producción con contexto largo; RTX 4090 o L40S para despliegues de menor concurrencia.
- Despliegue: soporte explícito de vLLM según la model card; transformers con `Gemma3ForConditionalGeneration` y `AutoProcessor` para uso directo; el resto de runtimes (llama.cpp, Ollama, TGI) no se mencionan en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas SEA | Licencia | Notas |
|---|---|---|---|---|---|
| Gemma-SEA-Guard-12B-2602 | 12B | 128k | 8 idiomas SEA + en | Gemma | Clasificador binario de seguridad, multimodal |
| google/gemma-3-12b-it (base) | 12B | 128k | multilingue general | Gemma | Modelo general; no especializado en moderación ni en criterios culturales SEA |
| SEA-LION (familia, otros modelos) | variable | no disponible | SEA | no disponible en esta ficha | Colección de LLM de AI Singapore; el autor indica que SEA-Guard agrupa cuatro modelos, con API pública solo para la variante Gemma |
| Clasificadores de seguridad genéricos (tipo Llama Guard) | variable | variable | principalmente inglés | variable | No disponibles en la información proporcionada para comparación numérica |

## Limitaciones y advertencias

- El modelo puede alucinar o generar texto no fundamentado pese a su uso como clasificador; el autor recomienda supervisión humana y verificación secundaria de las salidas.
- La salida está pensada como clasificación binaria; no debe tratarse como determinación absoluta de seguridad.
- Sesgos conocidos: no se documentan en la model card; al derivar de Gemma 3 y de un dataset de instrucciones no descrito en detalle, pueden persistir sesgos del modelo base y del proceso de anotación.
- Cobertura lingüística limitada a los ocho idiomas declarados; el rendimiento fuera de ellos no está garantizado.
- La licencia Gemma impone restricciones de uso comercial y obligaciones de cumplimiento de los términos de Google; revisar antes de despliegues en producción.
- El recuento de parámetros reportado en safetensors (1.166.448) no es coherente con un modelo de 12B y debe interpretarse con cautela; el tamaño del repositorio (117,8 GB) es consistente con pesos en varios formatos/precisiones.
- No se publican métricas de precisión, recall ni tasas de falsos positivos/negativos en la información disponible, lo que dificulta estimar su comportamiento en producción.
- No se detalla la composición del dataset de entrenamiento ni si hubo etapas de alineación adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aisingapore/Gemma-SEA-Guard-12B-2602
- Modelo base: https://huggingface.co/google/gemma-3-12b-it
- Paper SEA-Guard: https://arxiv.org/abs/2602.01618
- Paper adicional referenciado: https://arxiv.org/abs/2512.05501
- Colección SEA-Guard: https://huggingface.co/collections/aisingapore/sea-guard-sea-lion-guard-v1
- Playground y API: https://playground.sea-lion.ai/sea-guard
- Gestión de claves API: https://playground.sea-lion.ai/key-manager
- Términos de licencia Gemma: https://ai.google.dev/gemma/terms
