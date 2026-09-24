# caiovicentino1/Eikos-27B

## Resumen

Eikos-27B es un modelo de decisión tipada (*typed-decision*) desarrollado por el usuario caiovicentino1 (Caio Vicentino) y publicado en HuggingFace. No es un modelo generativo convencional: recibe un estado o evidencia junto con una pregunta y un conjunto acotado de opciones, y devuelve en una única pasada hacia delante una distribución de probabilidad calibrada sobre esas opciones, además de un valor de confianza que permite al sistema llamante abstenerse por debajo de un umbral. El foco declarado del modelo es el ámbito financiero global, el trading y el *trade finance*: aplicación de reglas, políticas y libros normativos a casos concretos (límites de orden, margen, *wash sales*, bandas de precio, KYC/AML, pólizas de crédito, créditos documentarios, Incoterms, IVA/GST), sentimiento financiero a nivel de entidad y verificación de respuestas sobre tablas financieras.

Técnicamente es un *fine-tune* LoRA (rango 64, una época) sobre Qwen/Qwen3.8-27B, con 27.781.427.952 parámetros totales según los pesos en safetensors y un repositorio de 55,6 GB. La arquitectura heredada es híbrida del tipo Gated DeltaNet, según se deduce de las advertencias del propio autor sobre vLLM. El entrenamiento se realizó por destilación desde un profesor fuerte (GLM-5.3-Flash con esfuerzo de razonamiento máximo) sobre ítems de decisión generados y etiquetados a ciegas, ítems programáticos exactos, reglas composicionales y dosieres de contexto largo de entre 6.000 y 12.000 tokens.

El modelo es relevante ahora porque propone un patrón de despliegue distinto al del *chatbot*: un único *checkpoint* autocontenido, sin adaptadores ni API externa, que responde varias preguntas sobre el mismo estado en una sola pasada y con caché de prefijo, con soporte declarado para vLLM, PyTorch/transformers y Apple Silicon vía MLX o MPS. Se distribuye en dos tamaños (Eikos-4B y Eikos-27B), cada uno con builds FP8 e INT4, bajo licencia MIT. La ausencia total de descargas y *likes* en el momento de la consulta indica que se trata de una publicación muy reciente y sin validación externa todavía.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con capas Gated DeltaNet (arquitectura del modelo base Qwen/Qwen3.8-27B) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 16.384 tokens configurados en el script de despliegue vLLM (`--max-model-len 16384`); los dosieres de entrenamiento llegan a 12k tokens. Contexto máximo nativo del modelo base: no disponible |
| Tipos de cuantizacion | Builds FP8 e INT4 publicados por el autor; builds MLX para Apple Silicon anunciados como pendientes de validación. Pesos base en bfloat16 |
| Idiomas soportados | Inglés y portugués (entrenamiento). El español se reservó por completo como prueba zero-shot |
| Licencia | MIT |
| Formato de pesos | safetensors (formato oficial Qwen, sin adaptadores); metadatos de la librería transformers |
| Tamano del repositorio | 55,6 GB |
| Tipo de tarea declarado | text-classification / typed decisions (noul, choice, score) |
| Modelo base | Qwen/Qwen3.8-27B (relación: finetune) |
| Dataset de entrenamiento | caiovicentino1/eikos-decisions |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B, por lo que hereda una arquitectura híbrida con capas Gated DeltaNet, tal y como el propio autor explicita al advertir que versiones antiguas de vLLM devolvían respuestas incorrectas al agrupar en lotes varias peticiones largas sobre esta arquitectura (caídas medidas de 3 a 6 puntos en ítems largos con documento compartido con vLLM 0.11; con vLLM 0.30 los resultados por lotes coinciden con la referencia en PyTorch). Sobre esa base se aplica un único *fine-tune* LoRA de rango 64 durante una época, con los mismos datos que Eikos-4B pero con dosieres de contexto largo de hasta 12k tokens y sin el objetivo de vista EN↔PT. No se publican adaptadores separados: el repositorio contiene un *checkpoint* fusionado y autocontenido.

El régimen de entrenamiento es de destilación desde un profesor fuerte (GLM-5.3-Flash con esfuerzo de razonamiento máximo) sobre cuatro familias de datos: ítems de decisión generados y etiquetados a ciegas, ítems programáticos exactos, reglas composicionales y dosieres de contexto largo de 6k-12k tokens. Se emplean dos señales auxiliares que solo existen en entrenamiento y se desactivan en inferencia: una entropía cruzada suave contra las probabilidades del profesor con permutación del orden de las opciones, y una pérdida auxiliar sobre la justificación corta del ítem (escrita junto al ítem y explicando la respuesta de referencia). La innovación destacable no está en la arquitectura sino en la interfaz de lectura: el modelo lee los logits del siguiente token únicamente sobre las letras de las opciones y aplica un softmax con temperatura fija (T = 1 por defecto) para obtener la distribución, sin generar texto en el momento de la decisión.

## Capacidades

- Decisión tipada en una sola pasada: responde preguntas de tipo `noul`/`boolean` (sí/no con probabilidad), `choice` (una entre N opciones) y `score` (niveles ordinales), devolviendo la distribución completa de probabilidad más un valor de confianza.
- Abstención por umbral: al exponer una confianza explícita, el llamante puede descartar decisiones por debajo de un umbral definido.
- Respuesta múltiple sobre un mismo estado: todas las preguntas de una petición se contestan juntas y el estado compartido se procesa una sola vez mediante caché de prefijo.
- Aplicación de reglas, políticas y libros normativos a casos: límites de orden, margen, *wash sales*, bandas de precio, límites de pagos, KYC/AML, políticas de préstamo, créditos documentarios, mapeo de etapas de Incoterms y VAT/GST.
- Sentimiento financiero a nivel de entidad y verificación de respuestas sobre tablas financieras, incluyendo comprobaciones temporales y numéricas.
- Sesiones de agente con estado incremental: API HTTP con creación de sesión, anexado de texto y consulta posterior sobre el estado acumulado.
- Multilingüe limitado: inglés y portugués en entrenamiento; el español fue retenido íntegramente como prueba zero-shot, no como idioma entrenado.
- Tool calling / function calling: no documentado en la información disponible.
- Capacidades de visión, audio o *thinking mode* explícito: no documentadas. Nota: entre las etiquetas del repositorio figura `image-text-to-text`, lo que no concuerda con la model card ni con el `pipeline_tag` de clasificación de texto.
- Generación de texto libre en el momento de la decisión: no soportada por diseño.

## Casos de uso

- Cumplimiento pre-trade en mesas de negociación: el modelo recibe el estado de una orden (ticket, perfil de cliente, tamaño, precio, regla aplicable) y devuelve si cumple la norma, qué acción debe tomar la mesa y un nivel de riesgo ordinal, todo en una pasada. Encaja porque la decisión es acotada y la confianza permite escalar a supervisión humana.
- KYC/AML y control de límites de pago: aplicar el manual interno a un expediente concreto y obtener una probabilidad de "sí" sobre si el caso cumple la política, con umbral de abstención para derivar a revisión manual.
- Créditos documentarios y comercio internacional: mapear las etapas de Incoterms o verificar el cumplimiento de las condiciones de un crédito documentario a partir del expediente, usando el modo `choice` para seleccionar la etapa o el estado correcto.
- Fiscalidad indirecta (VAT/GST) sobre operaciones: determinar el tratamiento aplicable a una transacción dada la regla fiscal y los hechos del caso, con distribución de probabilidad sobre los tratamientos posibles.
- Verificación de respuestas y comprobaciones numéricas y temporales sobre tablas financieras: dado un estado tabular y una afirmación, decidir si la afirmación se sostiene, aprovechando que el modelo está entrenado para comprobaciones de este tipo.
- Enrutado con abstención en pipelines automatizados: usar la confianza como señal para decidir entre ejecución automática, revisión humana o rechazo, integrándolo en un servicio HTTP compatible con TypeSafe sobre vLLM.
- Análisis de sentimiento financiero a nivel de entidad: clasificar el tono asociado a una entidad concreta dentro de un documento, en lugar de un sentimiento agregado del texto.
- Procesamiento de dosieres largos en sesiones de agente: mantener un estado que crece por anexado (documentación de un caso, histórico de una operación) y consultarlo repetidamente gracias a la caché de prefijo y al modo de caché mamba, aprovechando el rango de 6k-12k tokens para el que fue entrenado.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card incluye una figura con la precisión en la parte difícil de JevBench y el error cuando el modelo está al menos un 90 % seguro en contexto largo, comparado contra Jev y Laya, pero los valores concretos no aparecen en el texto proporcionado. El autor indica además que el envío oficial a la tabla de clasificación de JevBench está pendiente, y que las cifras proceden de su propio arnés de evaluación. No se dispone de resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 55,6 GB solo de pesos, más caché; en la práctica entre 62 y 70 GB según longitud de contexto y lote. Requiere A100 80 GB, H100 80 GB o reparto en varias GPU.
- VRAM estimada con el build FP8: del orden de 28 GB de pesos, aproximadamente 35-45 GB con caché. Encaja en L40S 48 GB, RTX A6000 48 GB o A100 40 GB con margen ajustado.
- VRAM estimada con el build INT4: del orden de 14-16 GB de pesos, aproximadamente 20-24 GB con caché. Es el único build que puede caber en una GPU de consumo, como la RTX 4090 de 24 GB, aunque de forma ajustada; se recomienda verificar la longitud de contexto real antes de asumirlo.
- Cabe en GPU de consumo: sí, únicamente con cuantización INT4 y en tarjetas de 24 GB. Las estimaciones anteriores son cálculos derivados del número de parámetros y de los formatos declarados por el autor, no cifras publicadas.
- Opciones de despliegue: vLLM (requiere versión 0.30.0 o superior, con `--enable-prefix-caching`, `--mamba-cache-mode all`, `--logprobs-mode processed_logprobs`, `--max-logprobs 32`, `--dtype bfloat16` y `--max-model-len 16384`); PyTorch / transformers; Apple Silicon mediante MLX o MPS.
- El script `serve_vllm.sh` levanta el motor vLLM como modelo servido con nombre `decider` y `serve.py` expone una API compatible con TypeSafe en el puerto 8000.
- No se documenta soporte para llama.cpp, GGUF, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Eikos-27B | 27,78B | 16.384 tokens configurados en vLLM | Decisión tipada con calibración, ámbito financiero | MIT | HuggingFace, builds FP8 e INT4; MLX pendiente |
| Qwen/Qwen3.8-27B | No disponible en la informacion | No disponible | Modelo generalista de texto; es la base de Eikos-27B | No disponible en la informacion | HuggingFace |
| Bonsai 27B | Clase 27B | No disponible | Multimodal con pesos 1-bit o ternarios, razonamiento multi-paso y uso de herramientas; basado en Qwen3.6 27B | No disponible en la informacion | Distribución propia de PrismML; torre de visión a 4 bits |
| Eikos-4B | Clase 4B | No disponible | Misma tarea de decisión tipada, hermano pequeño de Eikos-27B | MIT | HuggingFace, builds FP8 e INT4 |

La comparación directa de rendimiento no es posible: no hay cifras de benchmarks publicadas para Eikos-27B, y los modelos alternativos citados responden a categorías distintas (modelo generalista multimodal frente a decisor especializado). Bonsai 27B es comparable en tamaño y en el hecho de compartir una base de la familia Qwen, pero su propuesta de valor (ejecución local en móvil con pesos de 1 bit y capacidades multimodales) es ortogonal a la de Eikos-27B.

## Limitaciones y advertencias

- Alcance restringido por diseño: aplica reglas a los hechos que recibe, pero no predice precios ni genera análisis libre. Usarlo fuera de esa función produce resultados sin garantía.
- Riesgo de alucinación presente en la forma de una regla mal aplicada o una opción mal ponderada; la mitigación prevista es el umbral de confianza, no una garantía de corrección.
- Idiomas: solo inglés y portugués en entrenamiento. El español se usó como prueba zero-shot, de modo que su comportamiento en castellano no está validado ni respaldado por datos de entrenamiento.
- Sesgos: la model card no documenta análisis de sesgos ni evaluación de equidad. El dominio financiero y normativo puede arrastrar sesgos de las políticas usadas para construir los ítems.
- Metadatos incoherentes: el repositorio declara `pipeline_tag: text-classification` pero incluye la etiqueta `image-text-to-text` y la etiqueta de arquitectura `qwen3_5`, mientras que el modelo base declarado es Qwen3.8-27B. Conviene verificar la configuración antes de integrarlo.
- La model card incluye `inference: false` en los metadatos, pese a que el texto describe despliegue con vLLM, transformers y MLX.
- Dependencia estricta de versión: con vLLM anterior a 0.30.0 se midieron caídas de 3 a 6 puntos en ítems largos con documento compartido. Usar versiones antiguas en producción es un riesgo real de respuestas incorrectas.
- Sin validación externa: 0 descargas y 0 likes en el momento de la consulta, y el envío oficial a la tabla de clasificación de JevBench está pendiente. Todas las cifras disponibles proceden del arnés de evaluación del propio autor.
- Licencia MIT: permisiva para uso comercial, pero al derivar de Qwen/Qwen3.8-27B conviene comprobar las condiciones de la licencia del modelo base, que no se detallan en la información disponible.
- No hay soporte documentado de tool calling, ni versión GGUF, ni rutas de despliegue en llama.cpp, Ollama o TGI, lo que limita las opciones de integración.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/caiovicentino1/Eikos-27B
- Dataset de entrenamiento: caiovicentino1/eikos-decisions (referenciado en la model card; no se proporciona URL directa)
- Repositorio de código: https://github.com/caiovicentino/eikos
- Imagen de portada de la model card: https://huggingface.co/caiovicentino1/Eikos-27B/resolve/main/assets/eikos_launch.png
- Modelo base: Qwen/Qwen3.8-27B (referenciado en los metadatos)
- Perfil del autor en HuggingFace: https://huggingface.co/caiovicentino1/models
- Colección "Large Models (27B-35B) HLWQ" del autor: https://huggingface.co/collections/caiovicentino1/large-models-27b-35b-hlwq
- Documentación de Bonsai 27B (modelo comparable de 27B): https://docs.prismml.com/models/bonsai-27b
- Anuncio de Bonsai 27B por PrismML: https://prismml.com/news/prismml-releases-bonsai-27b
- Publicación en LinkedIn sobre Bonsai 27B: https://www.linkedin.com/posts/prismml_today-were-announcing-bonsai-27b-the-first-activity-7482847159445508096-dPw6
