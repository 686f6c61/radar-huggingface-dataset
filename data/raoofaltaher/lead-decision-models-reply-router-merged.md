# raoofaltaher/lead-decision-models-reply-router-merged

## Resumen

`lead-decision-models-reply-router-merged` es un modelo de decisión (no generativo) obtenido por fine-tuning de `LiquidAI/LFM3-1.7B` mediante `FastDecisionModel` de Unsloth y una cabeza de decisión de Clef. A diferencia de un modelo conversacional, no produce texto: recibe un conjunto de opciones y devuelve probabilidades sobre ellas. En este caso concreto, clasifica la respuesta de un prospecto a un primer correo comercial en una de 11 intenciones y predice si procede dar un siguiente paso.

El modelo es material didáctico del tutorial publicado en raoofaltaher.com sobre fine-tuning de modelos de decisión para enrutado de respuestas. Su interés técnico radica en mostrar cómo adaptar un transformer pequeño (1.728.801.536 parámetros) a una tarea de clasificación estructurada con calibración explícita, manteniendo el consumo de VRAM muy bajo (2,64 GB en pico durante el entrenamiento).

Es relevante como ejemplo de patrón "decision model" frente al patrón generativo: en lugar de pedir a un LLM que escriba una etiqueta, se puntúan opciones cerradas y se obtiene una distribución de probabilidad directamente utilizable por código de política determinista. El autor insiste en que ninguna acción de contacto debe ejecutarse sin revisión humana y sin código de política adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer LFM3 (LiquidAI), adaptado con cabeza de decisión Clef sobre `FastDecisionModel` de Unsloth |
| Parametros totales | 1.728.801.536 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (usado en el ejemplo de carga con `load_in_4bit=True`); otras no disponibles |
| Idiomas soportados | no disponibles |
| Licencia | LFM Open License v1.0 (`license: other`, `license_name: lfm1.0`) |
| Formato de pesos | safetensors, con `custom_code` (requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo parte de `LiquidAI/LFM3-1.7B` (revisión `ac2586a34f1a1c03329dbdcdefabd8b6478ddaa7`), un transformer de 1.700 millones de parámetros con código de modelado propio que el repositorio fusionado copia. Sobre esa base se añade una cabeza de decisión de Clef mediante el flujo `FastDecisionModel` de Unsloth. El modelo no genera texto: puntúa las opciones recibidas y devuelve probabilidades, lo que permite integrarlo en lógica de enrutado determinista.

El entrenamiento se realizó sobre 617 respuestas sintéticas generadas por LLM, verificadas con un reetiquetado ciego automático y **no revisadas por una persona**. El conjunto se dividió en 296 filas de entrenamiento del optimizador, 73 de calibración, 124 de validación y 124 de prueba. No se documentan en la información disponible detalles sobre número de tokens, composición del dataset más allá de lo indicado, ni uso de RLHF o DPO. El pico de VRAM durante el entrenamiento fue de 2,64 GB.

## Capacidades

- Clasificación de la respuesta de un prospecto a un primer correo comercial en una de 11 intenciones.
- Predicción binaria de si procede un siguiente paso en la secuencia de contacto.
- Salida de probabilidades calibradas sobre las opciones proporcionadas (no genera texto libre).
- Puntuación de opciones arbitrarias suministradas en la entrada, según el patrón de los modelos de decisión de Clef.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: su función es exclusivamente de enrutado.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No dispone de modo de pensamiento, visión ni audio.

## Casos de uso

- **Enrutado de respuestas entrantes en un CRM**: el modelo clasifica la respuesta de un prospecto en una de 11 intenciones y devuelve la probabilidad asociada; el código de política decide la acción (asignar a un comercial, marcar como no interesado, programar seguimiento). Es adecuado porque la salida es una distribución sobre opciones cerradas, no texto libre que haya que parsear.
- **Priorización de colas de seguimiento**: usando la probabilidad de "siguiente paso procedente", el equipo comercial puede ordenar la bandeja de entrada por probabilidad y revisar primero los casos con mayor puntuación, siempre con revisión humana.
- **Etiquetado asistido de históricos**: el modelo puede puntuar respuestas históricas para proponer etiquetas de intención que un humano valide, acelerando la creación de un conjunto de datos real que sustituya al sintético.
- **Prototipado de flujos de outbound**: al requerir solo 2,64 GB de VRAM en entrenamiento y ejecutarse en 4 bits, sirve para validar la lógica de enrutado antes de invertir en un modelo mayor o en datos reales.
- **Evaluación de calibración en pipelines de decisión**: el modelo reporta ECE y Brier, lo que permite usarlo como referencia para medir si las probabilidades de un clasificador alternativo están bien calibradas en la misma tarea.
- **Docencia y reproducción de experimentos**: es material de un tutorial, por lo que encaja en cursos o talleres sobre fine-tuning de modelos de decisión con Unsloth y cabezas de clasificación.
- **Comparación contra baselines ligeros**: el autor publica el `macro_f1` de una regresión logística con TF-IDF sobre las mismas características (0,7049 frente a 0,7782 del modelo), lo que permite usar el modelo como referencia en experimentos de clasificación de texto corto.

## Benchmarks y rendimiento

Métricas de test del run registrado por el autor (misma partición y mismas características para el baseline):

| Metrica | Este modelo | TF-IDF + regresion logistica |
|---|---:|---:|
| accuracy | 0,7944 | no disponible |
| ece | 0,1609 | no disponible |
| loss | 0,5607 | no disponible |
| record_accuracy | 0,6210 | no disponible |
| macro_f1 | 0,7782 | 0,7049 |

`accuracy`, `ece`, `loss` y `record_accuracy` cubren ambas preguntas (intención y siguiente paso); `macro_f1` puntúa solo la pregunta de 11 intenciones. En `ece`, `loss` y `brier` menor es mejor; en el resto, mayor es mejor. No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el autor reporta 2,64 GB de pico durante el entrenamiento, por lo que la inferencia en 4 bits debería quedar por debajo de esa cifra.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, cualquier GPU consumer con al menos 4 GB de VRAM debería poder ejecutar la versión en 4 bits.
- Cabe en GPU consumer: sí, previsiblemente en tarjetas con 4-8 GB de VRAM en cuantización 4-bit, aunque el dato exacto no está publicado.
- Opciones de despliegue: carga mediante `unsloth.FastDecisionModel` con `trust_remote_code=True` y `load_in_4bit=True`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el código de modelado personalizado de LFM3 limita el uso de runtimes genéricos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lead-decision-models-reply-router-merged | 1.728.801.536 | no disponible | Clasificacion de intencion + decision binaria | LFM Open License v1.0 | Hugging Face, requiere `trust_remote_code` |
| LiquidAI/LFM3-1.7B (base) | 1.700 millones aprox. | no disponible | Generacion de texto | LFM Open License v1.0 | Hugging Face |
| TF-IDF + regresion logistica (baseline del autor) | no aplica | no aplica | Clasificacion de intencion | no disponible | Referencia en la model card |

No se dispone de comparativas con otros modelos de decisión de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- **Datos sintéticos**: los 617 ejemplos fueron generados por LLM y verificados solo con reetiquetado ciego automático, sin revisión humana. Las métricas demuestran que el pipeline funciona, no el rendimiento sobre respuestas reales de CRM.
- **Desplazamiento de calibración**: las probabilidades y la calibración pueden cambiar si varían el mercado, la fuente de datos o el proceso comercial.
- **No es un generador**: no produce texto; cualquier uso que espere una respuesta redactada fallará.
- **Requiere código de política**: el autor subraya que una probabilidad del modelo no autoriza a contactar a nadie; hace falta código de política determinista y revisión humana.
- **Licencia restrictiva**: LFM Open License v1.0 permite uso comercial solo por debajo del umbral de ingresos que define la licencia; hay que leerla antes de cualquier explotación comercial del modelo o de derivados.
- **Código personalizado**: la carga exige `trust_remote_code=True`; el autor recomienda leer los ficheros Python de LFM3 en la revisión indicada antes de ejecutarlos.
- **Sesgos**: no documentados en la información disponible; al tratarse de datos sintéticos de ventas, es previsible que reflejen los sesgos del generador, pero no hay análisis publicado.
- **Alucinación**: al no generar texto, el riesgo de alucinación se traslada a la asignación de etiquetas; una probabilidad alta no equivale a una clasificación correcta.
- **Idiomas y contexto**: no disponibles; no se puede asumir soporte multilingüe ni una ventana de contexto concreta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/raoofaltaher/lead-decision-models-reply-router-merged
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia LFM Open License v1.0: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/ac2586a34f1a1c03329dbdcdefabd8b6478ddaa7/LICENSE
- Tutorial del autor: https://raoofaltaher.com/tutorials/fine-tune-decision-models-reply-routing
- Unsloth (librería de fine-tuning): no disponible en la información proporcionada
- Clef (cabeza de decisión): no disponible en la información proporcionada
