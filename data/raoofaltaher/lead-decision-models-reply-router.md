# raoofaltaher/lead-decision-models-reply-router

## Resumen

`lead-decision-models-reply-router` es un modelo de decisión (no generativo) construido a partir de `LiquidAI/LFM3-1.7B` mediante fine-tuning con la librería Unsloth y una cabeza de decisión de Clef. Su función es puntuar un conjunto de opciones predefinidas y devolver probabilidades: clasifica la respuesta de un prospecto a un primer correo comercial en una de 11 intenciones y predice si procede un siguiente paso. No genera texto libre ni envía mensajes; es un componente de puntuación dentro de un pipeline mayor.

El modelo es un artefacto didáctico asociado a un tutorial público sobre fine-tuning de modelos de decisión, desarrollado por el usuario de Hugging Face `raoofaltaher`. Se apoya en el modelo base LFM3-1.7B de Liquid AI, que aporta la arquitectura y el conocimiento lingüístico subyacente, mientras que la cabeza de decisión añade la capacidad de clasificación calibrada sobre un espacio cerrado de etiquetas.

Su relevancia es acotada: con 0 descargas y 0 likes en el momento de redactar esta ficha, y entrenado sobre 617 respuestas sintéticas generadas por un LLM, sirve como referencia metodológica para construir routers de decisión con modelos pequeños, no como solución lista para producción sobre datos reales de CRM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (LFM3-1.7B) con cabeza de decisión Clef añadida |
| Parametros totales | 1.700 millones (modelo base); parámetros de la cabeza de decisión no disponibles |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | Se carga con `load_in_4bit=True` según el ejemplo de la model card; otros tipos no disponibles |
| Idiomas soportados | No disponible |
| Licencia | LFM Open License v1.0 (`lfm1.0`), etiquetada como `other` |
| Formato de pesos | Safetensors (repo de 0,1 GB) |

## Arquitectura y entrenamiento

El modelo parte de `LiquidAI/LFM3-1.7B` en la revisión `ac2586a34f1a1c03329dbdcdefabd8b6478ddaa7`, un transformer decoder-only de 1.700 millones de parámetros con código de modelado personalizado (requiere `trust_remote_code=True`). Sobre él se añade una cabeza de decisión de Clef mediante `FastDecisionModel` de Unsloth, que transforma la salida del modelo en una distribución de probabilidad sobre las opciones suministradas en cada consulta. La innovación técnica principal no está en la arquitectura del modelo base, sino en el enfoque: convertir un modelo de lenguaje en un clasificador calibrado de opciones cerradas en lugar de un generador de texto.

El entrenamiento se realizó sobre 617 respuestas sintéticas generadas por un LLM, verificadas automáticamente mediante un reetiquetado ciego y no revisadas por una persona. La partición fue: 296 filas para entrenamiento del optimizador, 73 para calibración, 124 para validación y 124 para test. No se documenta el uso de RLHF ni DPO; el proceso se centra en el ajuste supervisado con calibración posterior. El pico de VRAM durante el entrenamiento fue de 2,64 GB.

## Capacidades

- Clasificación de intención: asigna la respuesta de un prospecto a una de 11 categorías predefinidas.
- Predicción de siguiente paso: determina si la respuesta requiere una acción de seguimiento.
- Puntuación probabilística de opciones: devuelve probabilidades calibradas sobre las opciones que recibe, no texto libre.
- Calibración explícita: dispone de una partición de calibración dedicada, con una ECE de 0,1609 en test.
- Integración con Unsloth: carga mediante `FastDecisionModel` con soporte para cuantización 4-bit.
- No soporta tool calling, agentes, visión, audio ni generación de texto; su alcance es estrictamente la decisión sobre opciones dadas.

## Casos de uso

- Enrutamiento de respuestas comerciales: dado un correo de respuesta de un prospecto, el modelo devuelve la intención probable y si procede un siguiente paso, lo que permite derivar el hilo al flujo adecuado dentro de un CRM.
- Triaje previo a revisión humana: al ser un modelo de puntuación, puede situarse antes de una cola de revisión manual para priorizar las respuestas que requieren atención inmediata, sin enviar nada de forma autónoma.
- Referencia para construir clasificadores calibrados: el tutorial asociado documenta el proceso completo (datos sintéticos, particiones, calibración, métricas), lo que lo convierte en una plantilla reproducible para otros dominios de enrutamiento.
- Evaluación de pipelines de decisión: sirve para comparar el rendimiento de un modelo pequeño ajustado frente a una línea base clásica (TF-IDF + regresión logística) en la misma partición y con las mismas características.
- Prototipado de bajo coste: con 2,64 GB de pico de VRAM en entrenamiento y un repo de 0,1 GB, es viable experimentar en una GPU de consumo.
- Docencia y formación interna: ilustra cómo separar la capa de decisión (probabilidades) de la capa de política (código determinista y aprobación humana), un patrón útil en equipos que diseñan sistemas de automatización con supervisión.

## Benchmarks y rendimiento

Métricas de test del run registrado por el autor, comparadas con una línea base de TF-IDF + regresión logística sobre la misma partición y las mismas características:

| Metrica | Este modelo | TF-IDF + regresion logistica |
|---|---:|---:|
| accuracy | 0,7944 | no disponible |
| ECE | 0,1609 | no disponible |
| loss | 0,5607 | no disponible |
| record_accuracy | 0,6210 | no disponible |
| macro_f1 (11 intenciones) | 0,7782 | 0,7049 |

`accuracy`, `ece`, `loss` y `record_accuracy` cubren ambas preguntas del modelo; `macro_f1` evalúa solo la clasificación de las 11 intenciones. En ECE, loss y Brier, menor es mejor; en el resto, mayor es mejor. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, y no procede extrapolarlos dado que el modelo no es generativo.

## Requisitos de hardware

- VRAM de inferencia: no documentada explícitamente; con 1.700 millones de parámetros y carga en 4-bit, la estimación razonable se sitúa en torno a 1-2 GB, aunque el dato exacto no está disponible.
- VRAM de entrenamiento: 2,64 GB de pico, según la model card.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para inferencia en 4-bit; el entrenamiento cabe en tarjetas de consumo como la RTX 3060 o superiores.
- Cabe en GPU de consumo: sí, con cuantización 4-bit.
- Opciones de despliegue: carga mediante `FastDecisionModel` de Unsloth con `trust_remote_code=True`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y la naturaleza no generativa del modelo hace que estos motores no sean directamente aplicables.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lead-decision-models-reply-router | 1,7 B (base) | no disponible | Clasificador de decisión sobre 11 intenciones | LFM Open License v1.0 | Hugging Face, 0 descargas |
| LiquidAI/LFM3-1.7B | 1,7 B | no disponible | Modelo generativo base | LFM Open License v1.0 | Hugging Face, modelo público de Liquid AI |
| TF-IDF + regresión logística (línea base del autor) | no aplica | no aplica | Clasificador clásico | no aplica | Implementación propia del tutorial |

La comparación directa con modelos de decisión equivalentes no está disponible: no se conocen otros routers publicados con esta misma cabeza Clef y este mismo conjunto de etiquetas. Frente al modelo base, la diferencia es funcional (clasificación calibrada frente a generación); frente a la línea base clásica, la ventaja medida es de 7,3 puntos de macro_f1 en la tarea de 11 intenciones.

## Limitaciones y advertencias

- Datos de entrenamiento sintéticos: las 617 respuestas fueron generadas por un LLM y verificadas solo automáticamente, sin revisión humana; los resultados no demuestran rendimiento sobre respuestas reales de prospectos ni registros reales de CRM.
- Calibración frágil: una ECE de 0,1609 en test indica un error de calibración considerable; las probabilidades pueden desviarse al cambiar el mercado, la fuente de datos o el proceso.
- Sesgos desconocidos: no se documenta ningún análisis de sesgo, y el origen sintético de los datos impide descartar sesgos introducidos por el LLM generador.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de asignar una intención con alta confianza a una respuesta ambigua o fuera de distribución.
- Restricciones de licencia: LFM Open License v1.0 permite uso comercial solo por debajo del umbral de ingresos que define la licencia; debe leerse antes de cualquier explotación comercial, incluida la de derivados como este modelo.
- Ejecución de código remoto: el modelo base incluye código de modelado personalizado y requiere `trust_remote_code=True`; el autor recomienda revisar los archivos Python de la revisión indicada antes de ejecutarlo.
- Gobernanza: el propio autor subraya que una probabilidad del modelo no es permiso para contactar a nadie; toda acción de outreach debe pasar por código de política determinista y aprobación humana.
- Madurez: 0 descargas y 0 likes, creado y actualizado el mismo día; no hay evidencia de uso en producción ni mantenimiento posterior.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/raoofaltaher/lead-decision-models-reply-router
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia LFM Open License v1.0: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/ac2586a34f1a1c03329dbdcdefabd8b6478ddaa7/LICENSE
- Tutorial del autor: https://raoofaltaher.com/tutorials/fine-tune-decision-models-reply-routing
- Unsloth: https://github.com/unslothai/unsloth
