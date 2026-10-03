# iantato/franciscocm

## Resumen

iantato/franciscocm es un modelo alojado en Hugging Face por el usuario iantato, etiquetado con la librería transformers y el pipeline text-classification. Según las etiquetas del repositorio, la arquitectura subyacente es RoBERTa, con 124.646.401 parámetros totales y un repositorio de 0,5 GB, lo que sitúa al modelo en la misma escala que RoBERTa-base (aproximadamente 125 millones de parámetros). Los metadatos indican que se subió al Hub el 3 de octubre de 2026 y que acumula 0 descargas y 0 likes en el momento de la consulta.

El problema principal de esta ficha es la ausencia casi total de información verificable. La model card publicada es la plantilla automática de Hugging Face sin rellenar: todos los campos de descripción, datos de entrenamiento, licencia, idiomas, evaluación e hiperparámetros figuran como "[More Information Needed]". No se documenta el conjunto de etiquetas de clasificación, el dataset de entrenamiento, el procedimiento de ajuste ni ninguna métrica.

Por tanto, no puede recomendarse su uso en producción ni en investigación sin una validación previa por parte del usuario. La relevancia actual del modelo es limitada: se trata de un artefacto sin documentación, sin licencia declarada y sin evidencias públicas de entrenamiento o evaluación, lo que impide evaluar su calidad, sus sesgos o su idoneidad para cualquier tarea concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (según etiqueta del repositorio, tipo transformer encoder); detalle de capas, cabezas y configuración interna no disponible |
| Parametros totales | 124.646.401 (dato real de los safetensors del repositorio) |
| Parametros activos | no aplica (no es un modelo MoE; no se declara ninguna variante de mezcla de expertos) |
| Longitud de contexto | no disponible (no se publica config.json con max_position_embeddings; en RoBERTa-base el valor habitual es 512 tokens, dato no confirmado para este repositorio) |
| Tipos de cuantizacion | no disponible (no se publican cuantizaciones GGUF, AWQ ni GPTQ; el repositorio contiene safetensors, presumiblemente en fp32, a partir de los 0,5 GB de pesos para 124,6 M de parámetros) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card deja el campo como "[More Information Needed]") |
| Formato de pesos | safetensors (etiqueta del repositorio), compatible con la librería transformers |
| Pipeline declarado | text-classification |
| Tarea | clasificación de texto (etiquetas concretas no documentadas) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion en el Hub | 2026-10-03 |
| Ultima actualizacion en el Hub | 2026-10-03 |
| Tamano del repositorio | 0,5 GB |

## Arquitectura y entrenamiento

La única información disponible sobre la arquitectura es la etiqueta "roberta" del repositorio, junto con "transformers" y "safetensors". Se trata, por tanto, de un transformer de tipo encoder con cabezal de clasificación secuencial, cuyo recuento de parámetros (124.646.401) es coherente con la configuración base de RoBERTa. No se dispone del archivo de configuración, por lo que se desconocen el número de capas, la dimensión oculta, el número de cabezas de atención, el vocabulario y la longitud máxima de secuencia admitida.

No hay ningún dato sobre el entrenamiento: ni número de tokens, ni composición del dataset, ni si hubo preentrenamiento desde cero, ajuste fino sobre un checkpoint previo o entrenamiento de una cabeza de clasificación sobre un encoder congelado. Tampoco se documenta el uso de RLHF, DPO u otras técnicas de alineamiento, algo poco habitual en modelos de clasificación. La etiqueta arxiv:1910.09700 corresponde al artículo "Quantifying the Carbon Emissions of Machine Learning" (Lacoste et al., 2019), citado en la propia plantilla automática de la model card para el cálculo de emisiones, y no a un artículo técnico sobre este modelo. No se documenta ninguna innovación técnica específica.

## Capacidades

- Clasificación de texto: es la única capacidad declarada explícitamente, a través del pipeline text-classification. Se desconoce qué etiquetas predice el modelo, ya que no se publica id2label ni ninguna descripción de las clases.
- Generación de texto: no disponible y, por arquitectura declarada (encoder tipo RoBERTa), no esperable sin un decodificador añadido.
- Razonamiento, matemáticas y código: no disponible; no hay ninguna evidencia de ajuste para estas tareas.
- Tool calling / function calling: no disponible; no es una capacidad típica de un modelo encoder de clasificación.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; el campo de idiomas de la model card está sin rellenar.
- Capacidades especiales (modo thinking, visión, audio): no disponible / no declaradas.
- Embeddings: el repositorio incluye la etiqueta text-embeddings-inference, lo que sugiere compatibilidad con el servidor de Hugging Face Text Embeddings Inference, pero no se documenta si el modelo produce representaciones útiles para búsqueda o similitud semántica.

## Casos de uso

Cualquier caso de uso enumerado a continuación queda condicionado a una validación previa por parte del usuario: dado que no se documentan las etiquetas, el dataset ni las métricas, no es posible confirmar que el modelo funcione para ninguna de estas tareas.

- Clasificación de sentimiento en reseñas de producto: solo si se comprueba que el cabezal de clasificación está entrenado para polaridad positiva/negativa/neutra; el modelo, con 124,6 M de parámetros, podría ejecutarse en CPU con latencia baja en lotes pequeños.
- Enrutado de tickets de soporte: utilizar el modelo como clasificador de intenciones para dirigir cada consulta al equipo adecuado; requiere conocer previamente el conjunto de categorías que el modelo predice.
- Moderación de contenido: filtrado automático de comentarios según categorías de toxicidad, siempre que se verifique el comportamiento del modelo y se auditen falsos positivos y negativos.
- Detección de spam en formularios o correo: clasificación binaria de mensajes como spam o no spam, con el modelo desplegado detrás de un servicio HTTP mediante transformers o TEI.
- Etiquetado de documentos para pipelines de datos: preanotación masiva de un corpus para su posterior revisión humana, aprovechando el bajo coste de inferencia de un modelo de 125 M de parámetros.
- Clasificación de consultas en un chatbot: detección de la intención del usuario antes de invocar una respuesta predefinida o una llamada a una API.
- Análisis de encuestas con preguntas abiertas: categorización automática de respuestas de texto libre para su agregación estadística.
- Filtrado previo en un sistema de recuperación: descartar documentos irrelevantes antes de pasarlos a un modelo generativo de mayor tamaño, reduciendo coste computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye la sección de evaluación completada (todos los apartados de testing data, métricas y resultados figuran como "[More Information Needed]") y no se ha encontrado ningún informe externo asociado al repositorio.

## Requisitos de hardware

Las cifras de memoria que aparecen a continuación son estimaciones derivadas del recuento real de parámetros (124.646.401) y de las convenciones habituales de precisión numérica; no proceden de documentación del autor.

- Pesos en fp32: aproximadamente 0,5 GB (coincide con el tamaño del repositorio).
- Pesos en fp16/bf16: aproximadamente 0,25 GB.
- Pesos en int8: aproximadamente 0,13 GB.
- Pesos en 4 bits: aproximadamente 0,07 GB.
- VRAM total recomendada para inferencia: por debajo de 2 GB incluyendo activaciones y overhead de runtime en la mayoría de configuraciones; cualquier GPU consumer con 4 GB o más (GTX 1650, RTX 3050, RTX 4060, etc.) es suficiente.
- Ejecución en CPU: viable y habitual para un encoder de este tamaño; no requiere GPU para lotes pequeños.
- GPU de centro de datos (A100, H100, L40S): solo justificables para despliegues de muy alto volumen con procesamiento por lotes masivo.
- Opciones de despliegue: pipeline de transformers; Hugging Face Inference Endpoints (el repositorio incluye la etiqueta endpoints_compatible); Text Embeddings Inference (etiqueta text-embeddings-inference); servidores de inferencia genéricos compatibles con transformers. El soporte en vLLM o TGI no está confirmado para este repositorio concreto.
- Latencia y throughput: no disponibles. Como referencia de orden de magnitud, un encoder de ~125 M de parámetros suele procesar del orden de miles de secuencias cortas por segundo en una GPU moderna y cientos por segundo en CPU; estas cifras son estimaciones genéricas de la categoría, no mediciones de este modelo.

## Comparativa con modelos similares

Los datos de la columna de este modelo proceden de los metadatos del Hub; los de los modelos de referencia proceden de sus fichas públicas y se incluyen únicamente como contexto de categoría.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Observaciones |
|---|---|---|---|---|---|
| iantato/franciscocm | 124,6 M (dato real) | no disponible | no disponible | Hub, 0 descargas, 0 likes | Sin model card, sin etiquetas documentadas, sin benchmarks |
| RoBERTa-base (Facebook AI) | ~125 M | 512 tokens | MIT | Ampliamente disponible y validado | Modelo de referencia de la misma escala; checkpoint con documentación completa |
| DistilBERT-base | ~66 M | 512 tokens | Apache 2.0 | Ampliamente disponible | Alternativa más ligera para clasificación, con métricas publicadas |
| DeBERTa-v3-base | ~86 M (backbone) / ~184 M (con embeddings) | 512 tokens | MIT | Ampliamente disponible | Rendimiento competitivo en tareas NLU de clasificación |

No se dispone de ninguna métrica comparativa para iantato/franciscocm, por lo que la comparación se limita a parámetros, contexto, licencia y disponibilidad. En licencia y validación, los tres modelos de referencia ofrecen garantías de las que este repositorio carece.

## Limitaciones y advertencias

- Ausencia total de documentación: la model card es la plantilla automática sin rellenar, por lo que se desconocen el propósito, las etiquetas, el dataset y el procedimiento de entrenamiento.
- Licencia no declarada: sin licencia explícita no puede asumirse permiso de uso comercial, modificación ni redistribución. En la práctica, esto bloquea su adopción en productos.
- Riesgo de alucinación: no aplica en el sentido generativo, pero existe un riesgo equivalente de predicciones sin fundamento si la cabeza de clasificación no está entrenada o lo está sobre datos desconocidos.
- Sesgos desconocidos: al no documentarse la composición del dataset ni el idioma de entrenamiento, no es posible auditar sesgos de género, raza, nacionalidad o dominio.
- Idiomas no especificados: no hay garantía de funcionamiento en castellano ni en ningún otro idioma concreto.
- Longitud de contexto no confirmada: se desconoce la longitud máxima de secuencia admitida; asumir 512 tokens sin verificar la configuración puede provocar truncamientos silenciosos.
- Estado del repositorio: 0 descargas y 0 likes, sin historial de versiones ni issues. No existe ninguna evidencia pública de que el modelo haya sido entrenado, evaluado o verificado por terceros; podría tratarse de una subida de prueba o de un checkpoint incompleto.
- Anomalía en los metadatos: las fechas de creación y actualización (2026-10-03) están separadas por 12 segundos, lo que sugiere una subida automatizada sin revisión posterior.
- Etiqueta arxiv engañosa: el identificador arxiv:1910.09700 no corresponde a un artículo sobre el modelo, sino a la referencia sobre emisiones de carbono incluida en la plantilla estándar de Hugging Face.
- Recomendación: no desplegar en producción sin inspeccionar previamente config.json, el mapeo de etiquetas, una evaluación propia sobre un conjunto de validación y la clarificación de la licencia con el autor.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/iantato/franciscocm
- Documentación de transformers (librería declarada): https://huggingface.co/docs/transformers
- Text Embeddings Inference (etiqueta del repositorio): https://github.com/huggingface/text-embeddings-inference
- Hugging Face Inference Endpoints (etiqueta endpoints_compatible): https://huggingface.co/docs/inference-endpoints
- Artículo citado en la plantilla de la model card (Lacoste et al., 2019, sobre emisiones de carbono): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental referenciada en la plantilla: https://mlco2.github.io/impact
- Modelo de referencia de la misma escala (RoBERTa-base): https://huggingface.co/FacebookAI/roberta-base
