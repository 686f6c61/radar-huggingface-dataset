# chinhnc/Quyet-1.2-Large

## Resumen

Quyet-1.2-Large es un modelo de decisión desarrollado por Chinh Nguyen (chinhnc) que, dado un estado (texto libre, JSON o una conversación) y una o varias preguntas tipadas, devuelve probabilidades calibradas mediante temperature scaling sobre las opciones suministradas. No genera texto: puntúa opciones. Forma parte de la familia Quyet 1.2, compuesta por las variantes Large, Small y Tiny, y se distribuye bajo licencia Apache-2.0.

Técnicamente es un fine-tuning de `google/gemma-4-31B-it` con los pesos completamente fusionados (fully merged) más una cabeza de opciones separada en F32. Cuenta con 31.273.088.876 parámetros totales (30,7B de texto según la model card) y admite entradas de hasta 32.768 tokens completos sin truncamiento: si la entrada excede el límite, se rechaza en lugar de recortarse.

Su relevancia radica en el enfoque: en lugar de pedir a un LLM que "elija" una opción en texto libre, expone directamente distribuciones de probabilidad calibradas sobre hasta 256 opciones por pregunta, lo que facilita umbrales, auditoría y uso como componente determinista dentro de pipelines de clasificación y enrutamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4 31B con pesos totalmente fusionados + cabeza de opciones separada (F32) |
| Parametros totales | 31.273.088.876 (30,7B de texto, incluye la cabeza de opciones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens completos, sin truncamiento (entradas superiores se rechazan) |
| Tipos de cuantizacion | BF16 para los pesos; cabeza de opciones en F32. No se documentan otras cuantizaciones |
| Idiomas soportados | Multilingue (sin listado detallado en la model card) |
| Licencia | Apache-2.0 (conservar el archivo NOTICE al redistribuir) |
| Formato de pesos | safetensors (62,5 GB en BF16 + cabeza F32); tokenizer incluido; repositorio de 62,6 GB |

## Arquitectura y entrenamiento

El modelo parte de Gemma 4 31B instruct (`google/gemma-4-31B-it`) y se distribuye con los pesos ya fusionados en el layout estándar de Gemma, de modo que no requiere descargar el modelo base por separado. Sobre esa base se añade una cabeza de opciones independiente en F32 que se emplea para las preguntas de tipo `choice`. Para los tipos `score` y `noul` se utilizan puntuaciones sobre símbolos del vocabulario en lugar de la cabeza de opciones. El paquete construye la entrada y aplica las temperaturas configuradas para producir probabilidades calibradas (temperature scaling).

La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; esa información no está disponible. Las innovaciones documentadas son de inferencia y empaquetado: hasta 256 opciones por pregunta de tipo `choice` (frente a 10 en la versión 1.0), rechazo de entradas que exceden el contexto en lugar de truncarlas, caché de prefijo compartido opcional (`prefix_cache=True`, requiere transformers 5.17.0) para reutilizar el estado cuando varias preguntas comparten el mismo prefijo, y verificación de archivos al cargar con comprobación de hashes de pesos bajo petición.

## Capacidades

- Clasificación con probabilidades calibradas: preguntas de tipo `choice` (elegir una entre 2 y 256 opciones), `score` (escala ordenada de 2 a 10 niveles) y `noul` (verdadero/falso, exactamente 2 opciones).
- Salida estructurada por pregunta: `choice` devuelve la opción, `confidence` y `probabilities`; `score` devuelve nivel esperado, `confidence`, `probabilities` y `legend`; `noul` devuelve P(true) y `confidence`.
- Procesamiento de estados heterogéneos: texto libre, JSON o conversaciones completas como entrada.
- Ventana de contexto larga: hasta 32.768 tokens completos sin truncamiento, adecuada para conversaciones o documentos extensos.
- Multilingüe, según la model card (sin desglose de idiomas).
- Caché de prefijo compartido para lotes de preguntas sobre un mismo estado.
- No es un modelo generativo: no produce texto libre ni soporta tool calling, agentes ni razonamiento multi-paso de forma nativa.

## Casos de uso

- Enrutamiento de intenciones en atención al cliente: dado el mensaje del usuario, preguntas `choice` con criterios como "cancelar", "cambiar límite" u "otro" devuelven probabilidades directamente utilizables para decidir la cola o el flujo, sin parsear texto generado.
- Triaje de urgencia: una pregunta `noul` ("la solicitud es urgente") sobre el mismo estado permite aplicar un umbral de P(true) y escalar el ticket; el ejemplo de la model card usa exactamente este patrón.
- Medición de sentimiento en escala ordenada: preguntas `score` con niveles como "calmado", "molesto", "enfadado" devuelven el nivel esperado y la distribución, útiles para métricas agregadas de satisfacción.
- Moderación y clasificación de contenido: clasificación multietiqueta mediante varias preguntas `choice`/`noul` sobre un mismo documento largo, aprovechando los 32.768 tokens y la caché de prefijo para no reprocesar el estado en cada pregunta.
- Extracción de señales en pipelines de datos: puntuar JSON o registros estructurados con preguntas tipadas para generar etiquetas calibradas que alimenten modelos posteriores o reglas de negocio.
- Evaluación y anotación asistida: usar las probabilidades y la confianza como señal para priorizar revisiones humanas, enviando a revisión manual solo los casos con confianza baja o cercanos a un empate.
- Enrutamiento de consultas en sistemas RAG o de búsqueda: decidir qué recuperador o herramienta invocar según la categoría predicha con probabilidad calibrada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión, calibración (ECE, Brier), MMLU, HumanEval ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- Inferencia en BF16 en una única GPU de 80 GB. En la comprobación sobre H100, el uso fue de aproximadamente 62 GiB de memoria asignada y unos 76 GiB reservados con los límites de lote por defecto, por lo que el margen es escaso.
- Cuando un lote no cabe, el paquete lo divide y reintenta, según la model card.
- GPU recomendadas: H100 80 GB (verificada por el autor) o A100 80 GB por capacidad equivalente. No se documenta funcionamiento en GPUs de consumo (24 GB o menos) con este modelo de 31B en BF16.
- Despliegue: paquete propio `quyet[multi-gpu]==1.2.0` (extra que aporta `accelerate` como dependencia del loader); requiere transformers 5.17.0 para la caché de prefijo. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Quyet-1.2-Large | 31,3B | 32.768 tokens | Modelo de decisión con probabilidades calibradas sobre opciones | Apache-2.0 | Hugging Face (chinhnc/Quyet-1.2-Large) |
| google/gemma-4-31B-it | 31B (aprox., según nombre) | no disponible en la información | LLM instruct generativo | Apache-2.0 (según la model card de Quyet) | Hugging Face (google/gemma-4-31B-it) |
| Quyet-1.2-Small / Quyet-1.2-Tiny | no disponible | no disponible | Misma familia de modelos de decisión | Apache-2.0 | Hugging Face (referenciados en la model card) |

No se dispone de datos de rendimiento comparativo entre estas variantes ni con otros modelos de clasificación; la comparación se limita a parámetros, contexto declarado, enfoque y licencia.

## Limitaciones y advertencias

- No evaluado para seguridad, sesgos ni robustez adversarial, según declara el autor.
- No debe usarse como único control en decisiones de alto riesgo.
- En media precisión (BF16), los resultados pueden diferir ligeramente entre hardware y tamaños de lote en preguntas con empate cercano.
- Las entradas que superan los 32.768 tokens completos se rechazan; no hay truncamiento automático, lo que exige gestionar el preprocesado en producción.
- Límites por tipo de pregunta: `choice` admite de 2 a 256 opciones, `score` de 2 a 10 niveles y `noul` exactamente 2 opciones.
- No es un modelo generativo: no sirve para producir texto, código ni diálogo; su uso está acotado a puntuar opciones predefinidas.
- La licencia Apache-2.0 permite uso comercial, pero obliga a conservar el archivo NOTICE (que comienza por "Quyet by Chinh Nguyen") al redistribuir el modelo o derivados.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin historial de validación por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chinhnc/Quyet-1.2-Large
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Página del proyecto: https://quyet.ai
- Código del paquete: https://github.com/ncchinh/quyet
- Contacto indicado en la model card: email@quyet.ai
