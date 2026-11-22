# nickprock/archai-jev-zagreus-0.4b-ita

## Resumen

archai-jev-zagreus-0.4b-ita es un modelo de lenguaje de 437,7 millones de parámetros (0,4B) especializado en toma de decisiones de elección cerrada. Lo desarrolla el usuario nickprock como un fine-tuning LoRA de `mii-llm/zagreus-0.4B-ita`, con los pesos ya fusionados. Su función no es generar texto libre, sino recibir un `state` y una pregunta con opciones de clave arbitraria (o una pregunta sí/no) y devolver una probabilidad para cada opción, leída directamente de los log-probabilidades de cada clave.

El modelo se enmarca en la categoría que el autor denomina "System One": decisiones rápidas, de baja latencia y de elección cerrada, en contraste con el razonamiento multi-paso de los modelos "System Two". Está diseñado para encajar en el motor `transformers` del kit Decision Index, por lo que se evalúa con ese kit tal cual, sin adaptadores adicionales.

Es relevante ahora porque propone un enfoque de clasificación y enrutamiento ligero (0,4B parámetros, licencia Apache 2.0, pesos en safetensors y GGUF) orientado a producción con recursos limitados, y porque publica un protocolo de evaluación centrado en la transferencia a tareas nunca vistas (OOD) frente al modelo base, en lugar de limitarse a la precisión sobre las tareas de entrenamiento. El modelo está entrenado y evaluado únicamente en italiano.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base `mii-llm/zagreus-0.4B-ita`), fine-tuning LoRA con pesos fusionados |
| Parámetros totales | 437.760.960 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF (formato publicado en el repo); niveles concretos no disponibles |
| Idiomas soportados | italiano (it) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 0,4B parámetros derivado de `mii-llm/zagreus-0.4B-ita`. Sobre esa base se aplica un fine-tuning LoRA cuyos pesos se han fusionado en el checkpoint final, de modo que se carga como un modelo transformers estándar. La innovación no está en la arquitectura, sino en el formato de tarea: el modelo recibe un `state`, una pregunta y un conjunto de opciones con clave y descripción, y se evalúa comparando la suma de log-probabilidades de los tokens de cada clave. El prompt se construye con el chat template (system = prompt del Decision Index; user = `State: … Question: … Options: clave: descripción … Reply with exactly one option key.`).

El entrenamiento LoRA se realizó sobre cinco tareas italianas: `arc_it`, `hatecheck_it`, `massive_it`, `sentipolc` y `stsb_it`. Durante el entrenamiento se varían de forma aleatoria las claves, el número y el orden de las opciones, el layout del estado y la forma de la pregunta (incluida la forma negada), con el objetivo de evitar el sobreajuste al formato y favorecer la generalización. El checkpoint se selecciona únicamente sobre la validación in-distribution. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon RLHF o DPO. El autor indica que ningún dataset del Decision Index se usa en entrenamiento y que el modelo base podría haber visto algunos de los benchmarks de evaluación durante el preentrenamiento, por lo que la métrica principal del protocolo es la diferencia (Δ) respecto al modelo base, no la precisión absoluta.

## Capacidades

- Clasificación de elección cerrada: devuelve una probabilidad por cada opción de clave arbitraria a partir de los log-probabilidades de los tokens de la clave.
- Preguntas binarias sí/no (formato `noul`).
- Enrutamiento de peticiones: asignación de una entrada a una de varias categorías definidas por el usuario (por ejemplo, rutas de atención al cliente).
- Detección de contenido inseguro: la tarea `hatecheck_it` muestra especialización en discriminación entre contenido seguro y odio o abuso.
- Puntuación de similitud semántica binaria (tarea `stsb_it`).
- Clasificación de sentimiento con tres opciones (tarea `sentipolc`).
- Clasificación de intención con hasta 60 opciones (tarea `massive_it`), aunque con rendimiento muy bajo.
- Integración con el motor `TransformersEngine` del kit Decision Index.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento explícito (thinking mode) según la información disponible.
- Capacidad multilingüe: únicamente italiano.

## Casos de uso

- Enrutamiento de peticiones de soporte: el modelo recibe el mensaje del cliente como `state` y un conjunto de rutas (por ejemplo, `card_arrival`, `top_up`, `lost_card`) como opciones, y devuelve la probabilidad de cada ruta. El ejemplo de la model card muestra exactamente este escenario y el modelo está diseñado para integrarse en el kit Decision Index con una llamada al `TransformersEngine`.
- Moderación de contenido en italiano: clasificación binaria entre contenido seguro y odio o abuso. Es la tarea con mejor rendimiento tras el fine-tuning (0,708 de precisión macro frente a 0,497 del base), lo que lo hace adecuado como primera capa de filtrado de bajo coste en foros o comentarios.
- Clasificación de intención en asistentes conversacionales con un catálogo reducido de intenciones: útil cuando el número de opciones es manejable y se acepta la incertidumbre como señal de derivación a un humano.
- Puntuación de similitud semántica en pipelines de deduplicación o búsqueda: el modelo asigna probabilidad a opciones del tipo "similar" / "no similar" entre dos textos, con un rendimiento tras fine-tuning de 0,577 frente a 0,432 del base.
- Análisis de sentimiento en reseñas o redes sociales en italiano: clasificación en tres clases (positivo, negativo, neutro) con probabilidades calibradas; el ECE de 0,071 en esta tarea permite usar las probabilidades como umbral de confianza.
- Enrutamiento y clasificación en entornos con recursos limitados: al ser un modelo de 0,4B con pesos en GGUF, puede desplegarse en CPU o en GPU de consumo para tareas de clasificación de alto volumen donde un LLM generativo sería demasiado caro en latencia y coste.
- Evaluación de decisiones con incertidumbre: al devolver probabilidades por opción en lugar de una única etiqueta, permite fijar umbrales de abstención o escalado a un modelo mayor cuando la confianza es baja.

## Benchmarks y rendimiento

Resultados del protocolo de evaluación del autor. La métrica es la precisión macro; Δ es la diferencia respecto al modelo base zero-shot con el mismo prompt, con intervalo de confianza del 95% por bootstrap apareado.

| Grupo | Tareas | Base (macro acc) | Fine-tuned (macro acc) | Δ [IC 95%] |
|---|---|---|---|---|
| In-distribution (split de test) | 5 | 0,301 | 0,374 | +0,073 [+0,053, +0,093] |
| OOD near (familia vista, tarea no vista) | 3 | 0,345 | 0,311 | −0,034 [−0,069, +0,000] |
| OOD far (familia no vista) | 2 | 0,525 | 0,502 | −0,023 [−0,048, +0,002] |

Detalle por tarea:

| Grupo | Tarea | Familia | n | Opciones | Base | Fine-tuned [IC 95%] | Δ [IC 95%] | Macro-F1 | ECE |
|---|---|---|---|---|---|---|---|---|---|
| id | hatecheck_it | safety | 600 | 2 | 0,497 | 0,708 [0,672, 0,747] | +0,212 [+0,158, +0,268] | 0,415 | 0,150 |
| id | sentipolc | sentiment | 600 | 3 | 0,305 | 0,293 [0,257, 0,330] | −0,012 [−0,043, +0,022] | 0,281 | 0,071 |
| id | arc_it | qa_mc | 600 | 4 | 0,265 | 0,287 [0,252, 0,322] | +0,022 [−0,017, +0,057] | 0,285 | 0,015 |
| id | stsb_it | similarity | 600 | 2 | 0,432 | 0,577 [0,537, 0,612] | +0,145 [+0,077, +0,203] | 0,542 | 0,023 |
| id | massive_it | intent | 600 | 60 | 0,008 | 0,005 [0,000, 0,012] | −0,003 [−0,013, +0,005] | 0,000 | 0,043 |
| ood_near | haspeede2 | safety | 600 | 2 | 0,543 | 0,457 [0,420, 0,498] | −0,087 [−0,160, −0,003] | 0,453 | 0,126 |
| ood_near | faq_it | qa_mc | 401 | 4 | 0,244 | 0,244 [0,204, 0,284] | +0,000 [−0,060, +0,067] | 0,194 | 0,038 |
| ood_near | belebele_it | qa_mc | 600 | 4 | 0,248 | 0,233 [0,200, 0,267] | −0,015 [−0,033, +0,003] | 0,233 | 0,065 |
| ood_far | evalita_te | nli | 400 | 2 | 0,550 | 0,520 [0,472, 0,568] | −0,030 [−0,068, +0,005] | 0,420 | 0,068 |
| ood_far | wic_it | lexical | 500 | 2 | 0,500 | 0,484 [0,442, 0,530] | −0,016 [−0,048, +0,018] | 0,403 | 0,095 |

Interpretación: el fine-tuning mejora de forma clara y estadísticamente significativa en las tareas de entrenamiento (especialmente `hatecheck_it` y `stsb_it`), pero no generaliza a tareas de la misma familia no vistas (OOD near, Δ negativo con intervalo que incluye el cero) y tampoco a familias no vistas (OOD far). En `massive_it` con 60 opciones el rendimiento es prácticamente nulo (0,005 de precisión frente a 0,008 del base). No se han publicado resultados de benchmarks estándar tipo MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 0,9 GB solo para los pesos (437,7 M de parámetros × 2 bytes), más overhead de activaciones y del motor; con cuantización GGUF de 4 bits, aproximadamente 0,25-0,3 GB para los pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para fp16; una RTX 3060, RTX 4060 o superior es más que suficiente. En A100 o H100 el modelo ocupa una fracción mínima de memoria, por lo que el cuello de botella será el throughput de peticiones, no la VRAM.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna (GTX 1650 en adelante con cuantización GGUF, RTX 3060 o superior en fp16). También es viable en CPU.
- Opciones de despliegue: `transformers` (librería declarada), text-generation-inference (tag `text-generation-inference`), llama.cpp u Ollama a través de los pesos GGUF publicados, y el motor `TransformersEngine` del kit Decision Index.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| nickprock/archai-jev-zagreus-0.4b-ita | 437,7 M | no disponible | it | Apache 2.0 | Clasificación de elección cerrada con probabilidades por opción |
| mii-llm/zagreus-0.4B-ita (modelo base) | 0,4B | no disponible | it | no disponible | Generación de texto en italiano; sirve de referencia zero-shot en la evaluación |
| Modelos de clasificación tipo BERT/Robertino en italiano | 100-300 M típicamente | 512 tokens típicamente | it | variable | Clasificación supervisada clásica con una etiqueta fija por tarea |

La comparación con el modelo base es la más informativa: el fine-tuning mejora la precisión macro in-distribution de 0,301 a 0,374, pero degrada ligeramente el rendimiento OOD near (−0,034) y OOD far (−0,023). Frente a clasificadores BERT, la ventaja es la flexibilidad para definir opciones en tiempo de inferencia sin reentrenar; la desventaja es que el rendimiento absoluto en varias tareas es bajo (por ejemplo, 0,005 en `massive_it` con 60 opciones). No se dispone de datos de benchmarks comparables con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Rendimiento OOD limitado: el fine-tuning no mejora la transferencia a tareas no vistas; en OOD near el Δ es negativo (−0,034) y en OOD far también (−0,023). No debe asumirse generalización a tareas distintas de las de entrenamiento.
- Degradación en `haspeede2` (safety, OOD near): −0,087 de precisión macro respecto al base, con intervalo de confianza que excluye el cero. El modelo puede ser peor que su base en dominios de seguridad no vistos.
- Colapso con muchas opciones: en `massive_it` (60 opciones) la precisión es de 0,005 y el Macro-F1 de 0,000. No es adecuado para clasificación con catálogos grandes de etiquetas.
- Calibración irregular: el ECE en `hatecheck_it` es de 0,150, lo que indica que las probabilidades no están bien calibradas en esa tarea; en otras tareas el ECE es bajo (0,015 en `arc_it`, 0,023 en `stsb_it`). No conviene usar las probabilidades como umbral de confianza sin validación previa en el dominio concreto.
- Solo italiano: el modelo está entrenado y evaluado únicamente en italiano; no se ha validado su comportamiento en otros idiomas.
- Riesgo de alucinación: aunque el formato de salida es de elección cerrada, el modelo podría asignar probabilidad alta a opciones incorrectas en distribuciones distintas a las del entrenamiento; los resultados OOD muestran que esto ocurre.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base `mii-llm/zagreus-0.4B-ita` no tiene licencia indicada en la información disponible, por lo que conviene verificar sus términos antes de un despliegue comercial.
- Dependencia del kit Decision Index: el uso canónico requiere instalar el kit desde un commit concreto (`9eb2dbe`); sin él, hay que replicar manualmente la construcción del prompt con el chat template y el cálculo de log-probabilidades por clave.
- Longitud de contexto no disponible: no se puede garantizar el comportamiento con estados o preguntas largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nickprock/archai-jev-zagreus-0.4b-ita
- Modelo base: https://huggingface.co/mii-llm/zagreus-0.4B-ita
- Kit Decision Index: https://github.com/apolinario/decision-index
- Commit del kit usado para la evaluación: https://github.com/apolinario/decision-index/tree/9eb2dbe2a358004c8782c66e40a83ac07b953fec
- Carpeta de evaluación en el repo: https://huggingface.co/nickprock/archai-jev-zagreus-0.4b-ita/tree/main/eval
