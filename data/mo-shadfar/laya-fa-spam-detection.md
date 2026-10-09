# mo-shadfar/laya-fa-spam-detection

## Resumen

Laya fa spam detection es un ajuste fino (fine-tune) publicado por el usuario mo-shadfar sobre un checkpoint multilingüe del modelo Laya, orientado a tareas de clasificación en el dominio de atención al cliente en persa. El repositorio declara 321.908.998 parámetros y un tamaño total de 1,3 GB, con pesos en formato safetensors y licencia Apache 2.0. El autor lo describe como un ajuste sobre un conjunto persa de servicio al cliente con "soft targets" sobre intención, urgencia y preguntas tipo "noul", a partir de unos 300 casos, entrenado en Kaggle con 2xT4 mediante la receta RLCD DDP del cuaderno de fine-tuning de Laya.

El modelo se presenta a través de la librería `laya`, con una API mínima de tipo agente (`laya.load(...)` y `agent.predict(state, questions)`), lo que sugiere un uso como componente de decisión o clasificación dentro de un pipeline mayor, y no como un modelo generativo de propósito general. La etiqueta `system-one` apunta a un enfoque de respuesta rápida e intuitiva, en contraposición a razonamiento deliberativo de varios pasos.

La relevancia de esta ficha es limitada pero concreta: se trata de un modelo muy pequeño (≈322 M de parámetros) y por tanto desplegable en hardware de consumo, especializado en un dominio vertical (soporte al cliente en persa). La información pública es escasa: no hay pipeline declarado, no hay lista explícita de idiomas, no hay resultados de benchmarks y el nombre del repositorio ("spam-detection") no coincide exactamente con la descripción de la model card (intención/urgencia). Todo ello se refleja con "no disponible" en los apartados correspondientes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (la model card solo indica que es un fine-tune del checkpoint multilingüe de Laya; no se detalla la arquitectura subyacente) |
| Parámetros totales | 321.908.998 (≈322 M), dato real de safetensors |
| Parámetros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repositorio solo contiene safetensors; no se publican versiones GGUF, AWQ, GPTQ ni int8) |
| Idiomas soportados | persa (farsi) como idioma del ajuste; el checkpoint base se describe como multilingüe, pero el autor no publica la lista de idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 1,3 GB |
| Librería de carga | `laya` |
| Pipeline declarado | no disponible |

## Arquitectura y entrenamiento

La model card no especifica la arquitectura interna del modelo base de Laya ni la del propio checkpoint ajustado. Los únicos datos técnicos confirmados son el número de parámetros (321.908.998, ≈322 M) y el formato de pesos (safetensors). La etiqueta `system-one` sugiere un diseño orientado a respuestas rápidas, pero no se aporta ningún detalle sobre mecanismos de atención, tipo de tokenizador, vocabulario o si se trata de un transformer encoder, decoder o híbrido.

En cuanto al entrenamiento, el autor indica que partió del checkpoint multilingüe de Laya y lo ajustó sobre un conjunto persa de atención al cliente con objetivos "soft" (soft targets) sobre tres ejes: intención, urgencia y preguntas tipo "noul". El volumen del conjunto es de aproximadamente 300 casos, lo que es un tamaño muy reducido y condiciona fuertemente la generalización del modelo. El entrenamiento se realizó en Kaggle con 2 GPU T4, siguiendo la receta RLCD (Reinforcement Learning from Contrastive Data, según la abreviatura usada en las etiquetas del repositorio) con paralelismo DDP, tal como aparece en el cuaderno de fine-tuning de Laya. No se documentan número de tokens de entrenamiento, composición del dataset, ni si hubo fases adicionales de RLHF o DPO.

## Capacidades

- Clasificación sobre tres ejes declarados por el autor: intención, urgencia y preguntas tipo "noul", dentro del dominio de atención al cliente en persa.
- Predicción mediante API de agente: la interfaz pública es `agent.predict(state, questions)`, lo que implica una entrada con estado (contexto o historial) y una lista de preguntas, y una salida de decisión.
- Especialización vertical en persa para servicio al cliente; no se declaran capacidades multilingües adicionales más allá del origen multilingüe del checkpoint base.
- El nombre del repositorio sugiere detección de spam, pero la model card no lo confirma ni describe esa capacidad de forma explícita.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes autónomos, visión, audio ni modo de razonamiento explícito ("thinking mode").
- No se documenta generación de texto libre, código ni matemáticas.

## Casos de uso

- Triaje de tickets de soporte: el modelo puede clasificar cada mensaje entrante por intención y urgencia, de modo que los tickets críticos se enruten primero. Su tamaño (≈322 M) permite ejecutarlo en CPU o en una GPU modesta dentro del propio sistema de ticketing.
- Enrutado automático a colas especializadas: a partir de la intención predicha, el ticket se asigna a facturación, soporte técnico o reclamaciones sin intervención humana, reduciendo el tiempo medio de primera respuesta.
- Filtrado de formularios de contacto: dado el nombre del repositorio, un uso plausible es descartar envíos de spam o mensajes no accionables antes de que lleguen a un agente humano, siempre que el modelo se valide previamente para esa tarea.
- Priorización de bandeja de entrada en atención al cliente: combinando urgencia e intención, se puede construir un ranking de la cola de trabajo por turno de agentes.
- Componente previo en un pipeline de agente conversacional: el modelo actúa como clasificador barato que decide si una consulta requiere escalado a un modelo mayor (por ejemplo, un LLM generativo) o puede resolverse con respuestas predefinidas.
- Anotación asistida de datasets en persa: el modelo puede generar etiquetas preliminares de intención y urgencia sobre corpus nuevos, que después se revisan manualmente, acelerando la construcción de conjuntos de entrenamiento mayores.
- Monitorización de calidad y detección de desviaciones: ejecutado en modo batch sobre conversaciones históricas, permite detectar cambios en la distribución de intenciones o picos de urgencia por producto o canal.
- Evaluación interna de nuevas políticas de soporte: al ser ligero, se puede reentrenar y comparar versiones con coste bajo de cómputo (2xT4 en Kaggle), lo que facilita iteraciones rápidas sobre las etiquetas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de exactitud, F1, precisión, recall ni comparaciones con otros modelos, y la búsqueda web realizada no devolvió ninguna página relacionada con el modelo (los resultados obtenidos correspondían a contenidos sin relación: conversores de unidades, un grupo musical, un periódico y una tienda de ropa).

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de activaciones ni caché): ≈1,29 GB en FP32, ≈644 MB en FP16/BF16, ≈322 MB en int8 y ≈161 MB en int4. El tamaño del repositorio (1,3 GB) es coherente con pesos almacenados en FP32.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente en FP16; una RTX 3060, RTX 4060, RTX 4090 o incluso GPUs integradas modernas pueden ejecutarlo. En el extremo superior, A100 o H100 no aportan ventaja significativa para este tamaño.
- Cabe en GPU de consumo: sí, de forma holgada, en cualquier modelo con 4 GB o más de VRAM; también es viable en CPU para cargas de baja concurrencia.
- Entrenamiento: el autor reporta entrenamiento en Kaggle con 2 GPU T4 (16 GB cada una) mediante DDP, lo que confirma que el ajuste completo es posible en hardware gratuito o de gama media.
- Opciones de despliegue: la vía documentada es la librería `laya` (`laya.load` + `agent.predict`). No se publican artefactos GGUF, por lo que llama.cpp u Ollama no están disponibles sin una conversión propia; tampoco se documenta soporte para vLLM, TGI u ONNX. El uso con `transformers` depende de que la arquitectura de Laya sea compatible, extremo que no se confirma.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de tokens por segundo, latencia por petición, ni requisitos de memoria en producción.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento en persa |
|---|---|---|---|---|---|
| laya-fa-spam-detection (mo-shadfar) | ≈322 M | no disponible | Apache 2.0 | HuggingFace, librería `laya` | no disponible (sin benchmarks) |
| XLM-RoBERTa base | ≈278 M | 512 tokens | MIT | HuggingFace, transformers | no disponible en esta ficha |
| ParsBERT | ≈162 M | 512 tokens | Apache 2.0 | HuggingFace, transformers | no disponible en esta ficha |
| mDeBERTa-v3 base | ≈278 M | 512 tokens | MIT | HuggingFace, transformers | no disponible en esta ficha |

Nota: los datos de XLM-RoBERTa base, ParsBERT y mDeBERTa-v3 base corresponden a cifras públicas ampliamente conocidas de esos modelos y no han sido verificados en la búsqueda web de esta ficha; se incluyen solo como referencia de categoría (clasificadores multilingües de rango 150-300 M de parámetros). No se dispone de comparaciones de rendimiento entre ellos y el modelo analizado.

## Limitaciones y advertencias

- Tamaño del conjunto de ajuste muy reducido (aproximadamente 300 casos), lo que aumenta el riesgo de sobreajuste y de generalización pobre a nuevas formulaciones, dominios o productos.
- Ausencia total de métricas de evaluación publicadas: no es posible estimar la precisión real del modelo en ninguna tarea antes de validarlo con datos propios.
- No se documenta la arquitectura, el tokenizador ni la longitud de contexto, lo que dificulta planificar el despliegue y estimar límites de entrada.
- Discrepancia entre el nombre del repositorio ("spam-detection") y la descripción de la model card (intención, urgencia, "noul"), lo que genera ambigüedad sobre la tarea real para la que fue entrenado.
- No se publica la lista de idiomas soportados; aunque el ajuste sea en persa, se desconoce el comportamiento en otros idiomas del checkpoint base multilingüe.
- Riesgo de alucinación y de etiquetado erróneo inherente a los clasificadores probabilísticos, especialmente con "soft targets" entrenados sobre pocos ejemplos.
- Riesgo de sesgos derivados del dataset de atención al cliente empleado (sesgo de dominio, de producto y de estilo de redacción), que no se documenta ni se mitiga en la model card.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y se indique los cambios. Conviene verificar aparte la licencia del checkpoint base de Laya si se redistribuye un modelo derivado.
- Sin pipeline declarado y con 0 descargas y 0 "likes" en el momento de la consulta: no hay evidencia de uso en producción ni de validación por terceros.
- El repositorio se creó y actualizó en fechas de octubre de 2026 según los metadatos, posteriores a la fecha habitual de consulta; conviene comprobar si el repositorio sigue disponible o si ha sido modificado.
- Para producción se recomienda: validación con un conjunto propio etiquetado, calibración de umbrales por clase, monitorización de deriva y un mecanismo de fallback cuando la confianza de la predicción sea baja.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mo-shadfar/laya-fa-spam-detection
- Cuaderno de fine-tuning de Laya (RLCD DDP): no disponible como URL directa en la información proporcionada
- Paper de Laya: no disponible
- Repositorio de código de la librería `laya`: no disponible
- Demo: no disponible
- Búsqueda web: no se encontró ningún resultado relevante sobre este modelo; los resultados devueltos correspondían a páginas sin relación (conversores de unidades, grupo musical MO, Le Monde, tienda MO Online).
