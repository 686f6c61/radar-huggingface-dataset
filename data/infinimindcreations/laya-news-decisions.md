# InfinimindCreations/laya-news-decisions

## Resumen

laya-news-decisions es un modelo de clasificación de texto desarrollado por InfinimindCreations, resultado de un ajuste fino completo sobre la variante multilingüe de Laya (convaiinnovations/laya), una base de 322 millones de parámetros con arquitectura de tipo encoder. El modelo resuelve una tarea muy concreta: dado el cuerpo de una noticia, responde cuatro preguntas tipadas en un único forward pass, sin generar texto libre. Las cuatro salidas son la categoría temática (10 clases), el alcance del impacto (5 niveles ordinales), la presencia de violencia física (sí/no) y la severidad del daño a civiles (5 niveles ordinales).

Su relevancia práctica está en la relación coste/prestación: con 322 millones de parámetros y un coste de entrenamiento declarado de unos 11 dólares en una sola A100, el modelo se sitúa en el rango de anotadores LLM mucho mayores en la pregunta de temática (0,784 frente a 0,835 de DeepSeek v4.1 Flash, 0,812 de Gemini 3 Flash y 0,778 de Claude Haiku 4.5, sobre el mismo conjunto de 176 artículos). Al ser un encoder pequeño, puede ejecutarse en local, incluso en CPU, lo que lo hace adecuado para pipelines de anotación de alto volumen donde el coste por inferencia de un LLM es prohibitivo.

Los metadatos de HuggingFace indican que el repositorio se publicó el 22 de septiembre de 2026 y que, en el momento de redactar esta ficha, no acumula descargas ni valoraciones. El modelo se distribuye bajo licencia Apache 2.0, heredada de Laya, y solo incluye pesos en safetensors acompañados de un fichero `questions.json` que debe usarse sin modificaciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; base Laya (variante multilingüe) descrita por el autor como encoder de 322M de parámetros, ajustada para clasificación |
| Parametros totales | 321.908.998 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible. En entrenamiento se usaron los primeros 2.800 caracteres del cuerpo de la noticia |
| Tipos de cuantizacion | No disponible (solo se distribuyen pesos en safetensors, aparentemente en precisión completa) |
| Idiomas soportados | Multilingüe (sin listado de idiomas concreto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`) + `questions.json` |

## Arquitectura y entrenamiento

El modelo parte de convaiinnovations/laya en su variante multilingüe y se ajusta de forma completa (full fine-tune), no mediante adaptadores. La tarea se formula como clasificación multi-cabeza sobre cuatro preguntas tipadas: una elección entre 10 clases (`topic`), dos escalas ordinales de 5 niveles (`impact` y `civilian_harm`) y una decisión binaria (`violence`). La clave de entrada esperada es `headline`, aunque el modelo se entrenó con el cuerpo del artículo (primeros 2.800 caracteres) y es lo que debe alimentarse en producción; usar solo el titular degrada el resultado.

El corpus de entrenamiento consta de unos 92.000 artículos de noticias de 2026 en múltiples idiomas, etiquetados sobre el texto completo por el modelo DeepSeek v4.1 Flash. El ajuste se hizo en una sola pasada, batch 16, G=32, learning rate 1e-5 con decaimiento coseno, sobre una única A100 y con un coste declarado de aproximadamente 11 dólares. El autor señala una decisión de diseño deliberada: limitar el número de preguntas a cuatro. Una versión con siete preguntas resultó peor en cuatro de las seis preguntas compartidas, lo que sugiere que cada tarea adicional penaliza a las demás en esta escala de parámetros.

El flujo de entrenamiento abierto utilizado es laya-rlcd-training, publicado por el mismo autor, de modo que este modelo puede reproducirse o adaptarse a otros corpus con la misma receta.

## Capacidades

- Clasificación temática en 10 clases a partir del cuerpo de una noticia.
- Estimación ordinal del alcance del impacto en 5 niveles (de una persona a escala global).
- Detección binaria de violencia física descrita en el texto.
- Estimación ordinal de la severidad del daño a civiles en 5 niveles.
- Inferencia multi-tarea en un único forward pass: las cuatro respuestas se obtienen de una sola pasada, no de cuatro llamadas.
- Funcionamiento multilingüe declarado, aunque sin listado de idiomas ni evaluación por idioma.
- Ejecución en CPU y en GPU de gama baja por el reducido tamaño del modelo.
- No dispone de generación de texto libre, tool calling, function calling, modo de razonamiento explícito ni capacidades de agente multi-paso; es un clasificador puro.
- Alta sensibilidad al fraseo exacto de las opciones de `questions.json`: el autor advierte que el modelo responde a la redacción de las opciones, no a la frase de instrucción.

## Casos de uso

- Triaje editorial automatizado: clasificar cada noticia entrante por tema e impacto antes de que llegue a un editor humano, usando un único forward pass por artículo para priorizar la cola de revisión según el nivel de impacto detectado.
- Moderación de contenido y alertas de violencia: el modelo marca con un AUC declarado de 0,977 si un artículo describe violencia física, lo que permite enrutar automáticamente ese contenido a revisión reforzada o a filtros específicos en plataformas de noticias y agregadores.
- Monitorización humanitaria: detección de daño a civiles a escala sobre flujos de noticias multilingües, útil para ONG y agencias que necesitan señales tempranas sobre crisis sin depender de APIs de pago por token.
- Anotación previa de corpus de investigación: generar etiquetas de tema, impacto, violencia y daño civil sobre grandes volúmenes de prensa para estudios de ciencias sociales o análisis de medios, dejando la revisión humana solo para los casos de baja confianza.
- Enriquecimiento de sistemas de recomendación: incorporar las cuatro etiquetas como metadatos para personalizar el feed según la preferencia del lector por temas y por tolerancia a contenido violento o de alto impacto.
- Análisis de riesgo y OSINT: alimentar paneles de situación con señales agregadas de impacto y daño civil por región y periodo, procesando fuentes multilingües en local sin enviar textos a servicios externos.
- Despliegue en entornos con restricciones de privacidad o conectividad: al existir una ruta de inferencia en CPU mediante la librería laya, puede ejecutarse en servidores sin GPU o en instalaciones aisladas de red.
- Clasificación en tiempo real a bajo coste: con 322 millones de parámetros, el coste por artículo es una fracción del de un LLM anotador, lo que permite procesar volúmenes muy altos de noticias de forma continua.

## Benchmarks y rendimiento

Evaluación sobre 176 juicios de referencia anotados por tres anotadores LLM independientes y resueltos por voto mayoritario. La precisión es coincidencia exacta; en las preguntas ordinales, ±1 indica la proporción dentro de un nivel y ρ la correlación de rangos.

| Pregunta | Checkpoint publicado | Final del entrenamiento | Notas |
|---|---|---|---|
| topic | 0,784 | 0,756 | Clase mayoritaria: 0,148 |
| impact | 0,614 | 0,557 | ±1: 0,977 · ρ: 0,775 |
| violence | 0,943 | 0,966 | AUC: 0,977 |
| civilian harm | 0,659 | 0,642 | ±1: 0,943 · ρ: 0,707 |

El autor advierte explícitamente que la columna del checkpoint publicado está sesgada al alza: ese checkpoint se seleccionó como el mejor de 14 evaluaciones sobre el mismo conjunto de referencia, por lo que la columna del final del entrenamiento es la estimación más realista de rendimiento en datos no vistos. Las evaluaciones adyacentes variaron hasta 4,5 puntos en `topic`, el equivalente a ocho artículos de 176.

Comparación de la pregunta `topic` sobre los mismos 176 artículos, según los datos aportados por el autor:

| Modelo | Precisión en topic |
|---|---|
| DeepSeek v4.1 Flash | 0,835 |
| Gemini 3 Flash | 0,812 |
| laya-news-decisions (checkpoint publicado) | 0,784 |
| Claude Haiku 4.5 | 0,778 |

Punto débil declarado: la categoría `politics`. El modelo acierta aproximadamente la mitad de esos casos, mientras que su modelo maestro acierta tres cuartas partes. El autor probó reentrenamientos desde cero y como continuación con mejores etiquetas, y ambos resultaron peores, por lo que atribuye el fallo a capacidad del modelo o volumen de datos, no a calidad de las etiquetas.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo derivado del número de parámetros, no confirmado en la model card): en fp32, en torno a 1,3 GB; en fp16/bf16, unos 0,65 GB; en int8, aproximadamente 0,33 GB. A estas cifras hay que sumar el contexto de activaciones y el runtime.
- Entrenamiento: el autor reporta un ajuste fino completo en una única A100, batch 16, con un coste aproximado de 11 dólares.
- GPU recomendadas: no se especifican. Por tamaño, cualquier GPU con al menos 2-4 GB de VRAM libre debería ser suficiente en fp16; A100, H100 y RTX 4090 son holgadamente suficientes y solo tendrían sentido para procesar lotes grandes.
- Cabe en GPU de consumo: sí, con alta probabilidad en cualquier GPU de consumo moderna (GTX 1660, RTX 3060, RTX 4090) y también en iGPU o CPU, dado el tamaño del modelo. No hay medición publicada que lo confirme.
- Opciones de despliegue: la model card solo documenta la librería `laya` (con `device="cpu"`), carga de `model.safetensors` con `safetensors.torch.load_file` y el fichero `questions.json`. No se mencionan vLLM, llama.cpp, Ollama, TGI ni exportación a ONNX o GGUF para este modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Precisión en topic | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| laya-news-decisions | Encoder ajustado, clasificación de 4 tareas | 322M | 0,784 (checkpoint publicado) / 0,756 (final) | Apache 2.0 | Pesos abiertos en HuggingFace; ejecutable en local |
| convaiinnovations/laya (multilingüe) | Base preentrenada | 322M | No disponible | Apache 2.0 (según la model card) | Pesos abiertos |
| DeepSeek v4.1 Flash | LLM generativo usado como anotador | No disponible | 0,835 | No disponible | Servicio |
| Gemini 3 Flash | LLM generativo | No disponible | 0,812 | No disponible | Servicio |
| Claude Haiku 4.5 | LLM generativo | No disponible | 0,778 | No disponible | Servicio |

La comparación con los modelos maestros debe leerse con cautela: se evalúan sobre el mismo conjunto de 176 artículos y la misma pregunta de temática, pero son modelos de propósito general con generación de texto, no clasificadores especializados, y su coste por inferencia es muy superior. No se han identificado en la información disponible otros clasificadores multilingües de noticias del mismo tamaño con los que comparar directamente.

## Limitaciones y advertencias

- El conjunto de referencia es pequeño (176 artículos) y está curado, con sobrerrepresentación de noticias de alto impacto respecto a un flujo de noticias real; la precisión en producción será previsiblemente inferior a la reportada.
- El checkpoint publicado fue seleccionado como el mejor de 14 evaluaciones sobre el mismo conjunto de referencia, por lo que sus métricas son el extremo optimista. El autor recomienda tomar como referencia la columna del final del entrenamiento.
- La categoría `politics` es el punto débil declarado: acierta aproximadamente la mitad de los casos, frente a tres cuartas partes de su modelo maestro.
- Las categorías temáticas se solapan en el mundo real (por ejemplo, un paquete de sanciones puede ser política o finanzas). Incluso los modelos anotadores grandes discrepan entre sí en alrededor de un artículo de cada seis.
- El umbral de 0,5 no es una frontera de decisión válida para `violence`; el autor recomienda ajustar el umbral sobre datos propios.
- Sensibilidad al fraseo: `questions.json` debe usarse literalmente. Dos descripciones de opción comienzan con el texto `NEU v2.`, una nota de edición residual del esquema de etiquetado; eliminarla altera las respuestas. Renombrar las claves de las preguntas, en cambio, no las altera según las comprobaciones del autor.
- Aunque la clave de entrada se llama `headline`, el modelo espera el cuerpo del artículo (primeros 2.800 caracteres). Alimentarlo solo con titulares reduce la calidad.
- Riesgo de alucinación: no aplica en el sentido generativo, ya que el modelo no produce texto libre; el riesgo equivalente es la asignación errónea de etiquetas, especialmente en clases minoritarias y en las escalas ordinales.
- La información disponible no incluye análisis de sesgos por idioma, región o medio, ni evaluación desagregada por lengua pese a la etiqueta multilingüe.
- Licencia Apache 2.0, lo que permite uso comercial y modificaciones, siempre con las obligaciones habituales de atribución y conservación del aviso de licencia. No se documentan restricciones adicionales.
- Los metadatos y la model card sitúan el corpus en 2026 y los modelos anotadores en versiones (DeepSeek v4.1 Flash, Gemini 3 Flash, Claude Haiku 4.5) cuya disponibilidad y denominación no se han podido verificar de forma independiente.
- El repositorio no registra descargas ni valoraciones, por lo que no existe validación externa de los resultados declarados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/InfinimindCreations/laya-news-decisions
- Fichero de preguntas: https://huggingface.co/InfinimindCreations/laya-news-decisions/blob/main/questions.json
- Pesos: https://huggingface.co/InfinimindCreations/laya-news-decisions/blob/main/model.safetensors
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Bucle de entrenamiento abierto (laya-rlcd-training): https://huggingface.co/InfinimindCreations/laya-rlcd-training
- Autor: https://huggingface.co/InfinimindCreations

No se han encontrado en la búsqueda web enlaces relevantes adicionales sobre este modelo (los resultados devueltos no guardan relación con él).
