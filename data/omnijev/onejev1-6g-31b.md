# OmniJev/OneJev1.6g-31B

## Resumen

OneJev1.6g-31B es un modelo de decisión "System One" desarrollado por OmniJev, construido mediante fine-tuning sobre google/gemma-4-31B-it. A diferencia de un modelo generativo convencional, recibe un texto de estado junto con un conjunto de preguntas tipadas (binarias, de elección múltiple o de puntuación) y devuelve, en un único forward pass, una probabilidad calibrada para cada opción. El objetivo es sustituir la generación de texto libre por una salida estructurada y calibrada en tareas de clasificación y enrutamiento.

El modelo conserva la arquitectura y el tamaño del base: aproximadamente 31.270 millones de parámetros almacenados en safetensors, con un repositorio de 62,6 GB. Se distribuye bajo licencia Apache 2.0 y se sirve a través de Flide, la implementación de referencia de la API System One descrita en el paper arXiv:2610.42148. Su relevancia actual radica en la propuesta de un paradigma distinto al chat: en lugar de razonar paso a paso y producir texto, el modelo emite directamente distribuciones de probabilidad sobre decisiones discretas, lo que facilita la integración en pipelines deterministas.

La ficha se basa exclusivamente en la información disponible en Hugging Face y en la model card; los datos no publicados se indican explícitamente como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de google/gemma-4-31B-it) |
| Parámetros totales | 31.273.086.512 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; el repo ocupa 62,6 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-31B-it, un transformer denso de unos 31.270 millones de parámetros, y se especializa mediante fine-tuning para la tarea de decisión tipada. La innovación principal no reside en la arquitectura subyacente, sino en la interfaz: el modelo recibe un "state" (texto libre) y un diccionario de "questions", cada una con un tipo (`noul`, `choice`, `score`), instrucciones y criterios, y produce en una sola pasada de inferencia las probabilidades correspondientes a cada opción.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. La model card tampoco detalla mecanismos como decodificación especulativa o atención lineal. El elemento técnico documentado es la calibración de las salidas probabilísticas, que es precisamente lo que el nombre del modelo ("1.6g" y "calibration" en los tags) sugiere como objetivo central del ajuste.

## Capacidades

- Clasificación binaria tipada (`noul`): devuelve la probabilidad de "sí" para una condición descrita en lenguaje natural.
- Elección múltiple (`choice`): devuelve una distribución de probabilidad sobre un conjunto de opciones definidas por el usuario.
- Puntuación ordinal (`score`): devuelve el nivel esperado sobre una escala de criterios ordenados.
- Procesamiento de texto de entrada en lenguaje natural como "state" estructurado.
- Salida calibrada en un único forward pass, sin generación autoregresiva de texto.
- Soporte multimodal heredado del base (tag `image-text-to-text`), aunque la model card no documenta su uso en la interfaz System One.
- No se documenta soporte explícito de tool calling, agentes o multi-step reasoning en la información disponible.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto del ticket y devuelve la probabilidad de que corresponda a cada equipo (facturación, técnico, envíos, ventas), tal como muestra el ejemplo de la model card. Es adecuado porque la salida es una distribución calibrada que permite umbrales configurables.
- Moderación de contenido: clasificación binaria tipada para decidir si un texto cumple una política, con probabilidad de "sí" directamente utilizable como score de riesgo.
- Triaje de urgencia: uso del tipo `score` para asignar un nivel esperado (bajo, medio, alto, crítico) a incidencias, con salida numérica ordenada.
- Clasificación de intención en asistentes conversacionales: elección múltiple sobre intenciones predefinidas para dirigir el flujo de diálogo sin generación libre.
- Enrutamiento de reclamaciones de reembolso: el ejemplo de la model card (reembolso, equipo, urgencia) se generaliza a pipelines de atención al cliente con múltiples decisiones encadenadas.
- Etiquetado automático de datos: generación de etiquetas probabilísticas para datasets de clasificación, aprovechando la calibración para filtrar casos ambiguos.
- Sistemas de decisión con umbrales auditables: al devolver probabilidades en lugar de texto, facilita la trazabilidad y el ajuste de umbrales en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (BF16/FP16): aproximadamente 62 GB solo para pesos, más overhead de activaciones y KV cache; requiere GPUs de 80 GB (A100 80GB, H100 80GB) o multi-GPU.
- Cuantización: no se documentan formatos GGUF ni cuantizaciones oficiales; el despliegue documentado es vía Flide con safetensors.
- GPU recomendadas: A100 80GB, H100 80GB o configuraciones multi-GPU para FP16. No cabe en GPUs de consumo (RTX 4090 de 24 GB) en precisión completa sin cuantización no documentada.
- Opciones de despliegue: Flide (`flide serve --model OmniJev/OneJev1.6g-31B`), que expone la API System One en `/v1/systemone`. No se documentan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo de salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OneJev1.6g-31B | 31,27 B | no disponible | Probabilidades calibradas tipadas | Apache 2.0 | Hugging Face |
| google/gemma-4-31B-it | ~31 B | no disponible | Texto generativo | Términos de Gemma (no disponible en detalle) | Hugging Face |
| Alternativas de clasificación calibrada | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa directa con otros modelos de decisión calibrada no está disponible en la información proporcionada; el único punto de referencia claro es el modelo base, del que OneJev hereda tamaño y arquitectura pero del que difiere en la interfaz de salida.

## Limitaciones y advertencias

- No se documentan sesgos conocidos ni evaluaciones de equidad en la información disponible.
- Riesgo de alucinación: aunque la salida es probabilística, las probabilidades pueden estar mal calibradas fuera de la distribución de entrenamiento; no se aportan métricas de calibración (ECE, Brier) en la model card.
- Longitud de contexto e idiomas soportados no disponibles, lo que impide garantizar su comportamiento en textos largos o en castellano.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base (gemma-4-31B-it) puede estar sujeto a términos adicionales de Google que conviene verificar antes de desplegar en producción.
- El despliegue depende de Flide, una herramienta específica del autor; no hay soporte documentado en stacks estándar como vLLM o TGI.
- El modelo está diseñado para clasificación y decisión, no para generación de texto libre; usarlo como chat o para redactar contenido no es su propósito documentado.
- Con 225 descargas y 0 likes en el momento de la consulta, la adopción comunitaria es muy limitada, lo que reduce la validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/OmniJev/OneJev1.6g-31B
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- GitHub del proyecto: https://github.com/OmniJev/OneJev
- Repositorio Flide: https://github.com/OmniJev/Flide
- Paper (arXiv:2610.42148): https://arxiv.org/abs/2610.42148
- Sitio web: https://omnijev.github.io/OneJev/
- Licencia: https://github.com/OmniJev/OneJev/blob/main/LICENSE
