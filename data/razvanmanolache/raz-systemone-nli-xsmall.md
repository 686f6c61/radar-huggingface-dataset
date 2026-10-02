# RazvanManolache/raz-systemone-nli-xsmall

## Resumen

raz-systemone-nli-xsmall (v5) es un cross-encoder de clasificación de texto para inferencia de lenguaje natural (NLI) desarrollado por RazvanManolache, construido sobre `cross-encoder/nli-deberta-v3-xsmall` mediante ajuste fino continuado. El modelo resuelve una tarea muy concreta: dado un estado o consulta (premisa) y un conjunto de hipótesis candidatas, produce una distribución calibrada sobre tres clases (entailment, neutral, contradiction) que se interpreta como una probabilidad de pertenencia a cada etiqueta. Esta formulación permite tomar decisiones tipadas con probabilidades en lugar de una única etiqueta dura.

Su relevancia práctica radica en el contexto para el que fue diseñado: actúa como el scorer `nli` dentro del proyecto raz-systemone, encargándose de resolver preguntas de tipo `choice`, `score` y `noul` sobre tickets de soporte. Con 70.831.107 parámetros y un tamaño en disco de unos 283 MB, está pensado para ejecutarse únicamente en CPU, lo que lo convierte en una alternativa ligera frente a jueces LLM mucho mayores. Como referencia, la propia model card indica que un juez LLM de 14B y la API de Jev obtienen .894 en el mismo conjunto de 70 estados, un rango que este modelo iguala en varios splits de evaluación.

La arquitectura es la del transformer DeBERTa-v2 en su variante xsmall, por lo que se trata de un modelo de propósito específico y dominio estrecho, no de un modelo generativo de uso general. Su licencia MIT y su compatibilidad con `text-embeddings-inference` y endpoints facilitan su integración en pipelines de clasificación. A fecha de creación del repositorio (2 de octubre de 2026) acumulaba 0 descargas y 0 likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer cross-encoder, DeBERTa-v2 (variante xsmall); usada como modelo de clasificación de secuencias de 3 clases |
| Parametros totales | 70.831.107 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (la base cross-encoder/nli-deberta-v3-xsmall se configura habitualmente a 512 tokens; no confirmado en la ficha) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos safetensors en precision completa; tamano en disco ~283 MB / repo 0.3 GB) |
| Idiomas soportados | Ingles (los datos de etiquetado son tickets de soporte en ingles); no se declaran otros idiomas |
| Licencia | MIT |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo parte de `cross-encoder/nli-deberta-v3-xsmall`, un cross-encoder basado en la arquitectura DeBERTa-v2 que procesa la premisa y la hipótesis de forma conjunta y emite logits sobre tres clases. Se trata de un ajuste fino continuado (continued finetuning) sobre ese checkpoint, no de un entrenamiento desde cero. La clasificación NLI se realiza tomando la probabilidad de la clase 1 (entailment) tras aplicar softmax sobre los logits, lo que permite puntuar múltiples hipótesis candidatas y comparar sus puntuaciones relativas.

En cuanto a los datos, el entrenamiento combinó 725 pares NLI procedentes de 110 estados de tickets de soporte etiquetados (repetidos 8 veces, y los pares de frustración 16 veces) junto con 200.000 filas de MNLI. La evaluación se hizo sobre 10.000 filas de MNLI disjuntas del conjunto de entrenamiento. La receta empleó 2 épocas con batch de 64. Los detalles completos están en el directorio `training/` del repositorio `RazvanManolache/raz-systemone` en GitHub. No se menciona en la información disponible el uso de RLHF, DPO ni técnicas de decodificación especulativa; no es un modelo generativo.

## Capacidades

- Clasificación NLI de 3 clases (entailment, neutral, contradiction) sobre pares premisa-hipótesis.
- Decisión tipada con probabilidades calibradas: las puntuaciones de entailment se convierten en una distribución con la que se puede elegir la etiqueta más probable entre varias candidatas.
- Puntuación (`score` / `choice`) de hipótesis de soporte, incluyendo la detección de tono de frustración (eje `score`).
- Uso como scorer `nli` dentro del framework raz-systemone, activable con `--scorer nli --nli-model <dir>`.
- Ejecución en CPU sin GPU, con una huella de ~283 MB.
- Integración nativa con la librería `transformers` (`AutoTokenizer` y `AutoModelForSequenceClassification`).
- Compatibilidad con `text-embeddings-inference` y con endpoints.
- No soporta generación de texto, tool calling, agentes, visión, audio ni razonamiento multi-paso. El alcance es exclusivamente la clasificación de pares de texto.

## Casos de uso

- Triaje de tickets de soporte: dado el texto de una incidencia ("The integration keeps failing, please help ASAP.") y un conjunto de categorías como hipótesis, el modelo devuelve la probabilidad de entailment de cada una y se selecciona la categoría ganadora; en el ejemplo de la ficha, "Bugs or integration problems" gana sobre "Payment or subscription issues" y "Pricing or account questions".
- Enrutamiento de correos o formularios entrantes: comparar el mensaje del usuario contra las hipótesis de cada equipo o cola de atención y asignar la conversación al destino más probable sin necesidad de GPU.
- Clasificación de motivos de contacto en atención al cliente: usar las etiquetas de facturación, suscripción, integración, precios, etc., para alimentar un CRM o sistema de analítica.
- Detección de tono y frustración: el eje `score` permite puntuar el grado de frustración de un mensaje, útil para priorizar o escalar tickets, aunque la propia ficha advierte de que es el eje más débil.
- Filtrado y validación en pipelines de datos: usar el par entailment/contradiction para comprobar si una afirmación está respaldada por un texto fuente, detectando pares inconsistentes antes de incorporarlos a un dataset.
- Verificación de respuestas en sistemas RAG: contrastar la respuesta generada contra el contexto recuperado como hipótesis y descartar salidas que no reciban entailment suficiente.
- Etiquetado asistido y aumento de datos: preetiquetar grandes volúmenes de tickets en CPU a bajo coste y revisar manualmente solo los casos con baja confianza.
- Deduplicación semántica de peticiones: comparar la consulta nueva contra agrupaciones conocidas para reutilizar respuestas o detectar duplicados.
- Despliegue en entornos sin GPU: servicios edge, contenedores pequeños o funciones serverless donde el modelo cabe en ~283 MB y no requiere acelerador.

## Benchmarks y rendimiento

Resultados publicados en la model card, todos sobre estados no vistos en entrenamiento:

| Split | Juicios | Precision (accuracy) |
|---|---|---|
| holdout C | 60 | 0,900 |
| holdout D | 30 | 0,833 |
| holdout E | 30 | 0,900 |
| holdout F | 28 | 0,893 |
| holdout G | 29 | 0,897 |
| MNLI (10k disjunto) | 10000 | 0,941 |

Como referencia comparativa, la model card indica que un juez LLM de 14B y la API de Jev obtienen 0,894 sobre el mismo conjunto de 70 estados, mientras que este modelo se mueve en un rango de 0,833 a 0,900 en los splits holdout. No se detallan por split los resultados de los 70 estados en formato agregado para este modelo.

## Requisitos de hardware

- Inferencia exclusivamente en CPU: la model card indica explícitamente uso CPU-only.
- Huella de memoria/disco: ~283 MB para los pesos; el tamaño del repositorio es de 0,3 GB.
- VRAM estimada: no aplica si se ejecuta en CPU; en caso de usar GPU, sería muy inferior a la de cualquier modelo generativo, ya que el modelo tiene 70,8 M de parámetros.
- Cabe sin problema en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) e incluso en máquinas sin GPU dedicada.
- Opciones de despliegue: `transformers` (AutoModelForSequenceClassification), `text-embeddings-inference` y endpoints según los tags; también integrable en el pipeline raz-systemone.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| raz-systemone-nli-xsmall (v5) | 70,8 M | no disponible | 0,833–0,941 en holdouts; 0,941 en MNLI 10k | MIT | HuggingFace (repo propio) |
| cross-encoder/nli-deberta-v3-xsmall (base) | ~70 M (aprox., variante xsmall) | no disponible | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | HuggingFace |
| Juez LLM de 14B (referencia citada) | ~14 000 M | no disponible | 0,894 en el core set de 70 estados | no disponible | no disponible |
| API de Jev (referencia citada) | no disponible | no disponible | 0,894 en el core set de 70 estados | no disponible | API externa |

No se dispone de datos de otros modelos NLI comparables en la información proporcionada, por lo que no se incluyen cifras adicionales.

## Limitaciones y advertencias

- El eje de tono de frustración (`score`) es el más débil, con un rango aproximado de 0,70 a 0,90 por split.
- Las frases de facturación frente a ventas (billing-vs-sales) y el sarcasmo siguen fallando según la propia model card.
- Dominio deliberadamente estrecho: las etiquetas provienen de 190 tickets de soporte escritos a mano en inglés, por lo que la generalización fuera de ese reparto es limitada.
- Solo se declara inglés; no hay soporte multilingüe documentado.
- Riesgo de alucinación no aplica directamente por no ser un modelo generativo; no obstante, existe riesgo de clasificaciones incorrectas o mal calibradas fuera de la distribución de entrenamiento.
- Es un modelo de clasificación, no un generador: no puede producir texto, ni ejecutar tool calling, ni mantener conversaciones.
- Licencia MIT, lo que permite uso comercial sin restricciones adicionales, pero conviene verificar el cumplimiento de la licencia de la base `cross-encoder/nli-deberta-v3-xsmall` en caso de redistribución.
- Antes de usarlo en producción conviene revalidar la calibración de probabilidades sobre los datos propios, ya que la calibración se ajustó sobre un conjunto reducido de estados.
- La longitud de contexto no está documentada en la ficha; debe confirmarse empíricamente para premisas largas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RazvanManolache/raz-systemone-nli-xsmall
- Repositorio del proyecto raz-systemone: https://github.com/RazvanManolache/raz-systemone
- Receta de entrenamiento: https://github.com/RazvanManolache/raz-systemone/tree/master/training
- Modelo base: https://huggingface.co/cross-encoder/nli-deberta-v3-xsmall
