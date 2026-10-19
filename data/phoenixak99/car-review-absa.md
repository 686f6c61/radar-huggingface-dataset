# Phoenixak99/car-review-absa

## Resumen

`Phoenixak99/car-review-absa` es un modelo de clasificación de texto especializado en análisis de sentimiento a nivel de aspecto (ABSA) sobre reseñas de automóviles escritas por propietarios. En una sola pasada hacia delante devuelve la opinión del reseñador sobre ocho aspectos fijos —precio, rendimiento, confort, fiabilidad, diseño, seguridad, consumo de combustible y tecnología—, cada uno clasificado como no mencionado, positivo, negativo o mixto, más un veredicto global (positivo, mixto o negativo). Lo desarrolla el usuario Phoenixak99 y se distribuye con licencia Apache 2.0.

Técnicamente es un fine-tuning de `answerdotai/ModernBERT-base` (encoder bidireccional tipo transformer) con una cabeza de clasificación de 35 salidas: ocho grupos de cuatro clases más tres clases de veredicto global. El modelo tiene 149.631.779 parámetros y un repositorio de 0,6 GB en safetensors, por lo que es muy ligero y apto para inferencia en CPU.

Su relevancia práctica está en el rendimiento frente a la alternativa habitual: sustituye una pipeline que consultaba un modelo ABSA genérico aspecto por aspecto (que no sabe distinguir "no mencionado") por una única pasada, con una macro-F1 de aspectos de 0,921 frente a 0,183, y una latencia mediana de 184 ms en CPU frente a 2.366 ms. El entrenamiento se hizo íntegramente con datos sintéticos generados y verificados a ciegas por un profesor local Qwen3-8B, al no existir un corpus de reseñas de coches con licencia clara.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional (ModernBERT-base) con cabeza de clasificación de 35 salidas |
| Parametros totales | 149.631.779 (≈149,6 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información proporcionada; el entrenamiento usó `max_length` 256 |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos safetensors sin variantes cuantizadas |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

El modelo parte de `answerdotai/ModernBERT-base`, un encoder transformer bidireccional, y le añade una cabeza lineal de 35 logits que se interpretan como ocho grupos de cuatro clases (uno por aspecto: price, performance, comfort, reliability, design, safety, fuel_economy, technology, con estados none / positive / negative / mixed) seguidos de tres clases de veredicto global (negative / mixed / positive). Los nombres de cada salida están en `config.id2label`. La función de pérdida combina una entropía cruzada por cada grupo de aspecto más 0,5 veces la pérdida del veredicto global; se entrenó con AdamW, learning rate 5e-5 durante dos épocas y una tercera a 2e-5, batch de 16, longitud máxima de 256 tokens y cómputo en CPU.

El dato más diferencial es el corpus: no había ningún conjunto de reseñas de coches con licencia clara (los públicos son de sitios de scraping), así que se generaron 6.000 reseñas sintéticas con un profesor Qwen3-8B ejecutado en local sobre llama.cpp. El proceso muestrea una especificación (coche real, persona del reseñador, longitud, tono y de 1 a 4 aspectos con su sentimiento), pide al profesor que escriba la reseña ajustada a esa especificación y después le pide que la etiquete de nuevo sin ver la especificación, con salida restringida por JSON schema. Solo se conservan las reseñas cuyos etiquetados a ciegas coinciden con la especificación en todos los aspectos: 3.872 de 6.000 (64,5%). El veredicto global proviene de esa lectura a ciegas. Una comprobación manual de 40 reseñas retenidas encontró 35 etiquetadas exactamente bien; los cinco fallos eran menciones fugaces no detectadas, no sentimientos invertidos. Los splits de train, validación y test se hacen por modelo de coche, de modo que el test (330 reseñas de seis modelos) no comparte coches con el entrenamiento.

## Capacidades

- Clasificación de sentimiento a nivel de aspecto sobre ocho aspectos fijos de una reseña de coche, en una sola pasada.
- Distinción explícita entre aspecto no mencionado y aspecto con opinión (clase `none`), algo que la pipeline anterior no podía hacer.
- Detección de opiniones mixtas dentro de un mismo aspecto.
- Veredicto global de la reseña en tres clases (positivo, mixto, negativo).
- Salida probabilística: los logits se pueden pasar por softmax por grupo para obtener confianza por aspecto.
- Capacidad multilingüe: no disponible; solo inglés.
- Tool calling / function calling: no disponible, es un modelo discriminativo.
- Razonamiento multi-paso o modo "thinking": no disponible.
- Visión o audio: no disponible.
- El repositorio de GitHub asociado (`review_intel.infer.Analyzer`) añade recuperación de las frases que sustentan cada aspecto y entidades GLiNER, aunque eso no forma parte del modelo en HuggingFace.

## Casos de uso

- Monitorización de opiniones en foros y webs de propietarios: pasar cada reseña por el modelo y agregar los logits por aspecto para construir series temporales de satisfacción (precio, fiabilidad, tecnología) por marca y modelo de coche.
- Enrutado de reseñas a equipos internos: usar el aspecto negativo con mayor probabilidad para dirigir automáticamente la queja al departamento correspondiente (posventa para fiabilidad, marketing para diseño), con el umbral de `none` evitando falsos positivos.
- Análisis de la competencia: procesar en lote reseñas de modelos rivales y comparar la distribución de menciones y polaridad por aspecto, aprovechando que el modelo se entrenó con splits por modelo de coche.
- Preprocesado para un LLM generador: usar las 35 probabilidades como señal estructurada que se inyecta en el prompt de un modelo mayor, reduciendo coste frente a pedirle al LLM que extraiga los aspectos en cada reseña.
- Investigación sobre ABSA con datos sintéticos: el repositorio de GitHub documenta generación de datos, destilación y evaluación, y el modelo sirve como baseline reproducible con partición por entidad.
- Filtrado previo en un pipeline de atención al cliente: descartar o priorizar reseñas con veredicto negativo y aspecto de seguridad mencionado antes de que lleguen a un humano.
- Despliegue en entornos sin GPU: con 149,6 M de parámetros y 184 ms de mediana en CPU con dos hilos, es viable procesar lotes moderados en servidores sin acelerador.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre 330 reseñas de test de seis modelos de coche que no aparecen en entrenamiento. La latencia es la mediana por reseña en CPU con dos hilos.

| Modelo | Aspect macro-F1 | Mention F1 | Sentiment acc. (mentioned) | All 8 aspects right | Overall verdict | Latency |
|---|---:|---:|---:|---:|---:|---:|
| DeBERTa-v3 ABSA + DistilBERT-SST2 (pipeline anterior) | 0,183 | 0,401 | 88,2% | 0,0% | 74,2% | 2.366 ms |
| **car-review-absa** | **0,921** | **0,991** | **95,6%** | **92,4%** | **90,6%** | **184 ms** |

El aspecto más débil es diseño, con macro-F1 de 0,73, atribuido a que las opiniones mixtas son raras en los datos. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, algo esperable en un modelo discriminativo de clasificación.

## Requisitos de hardware

- VRAM estimada para inferencia: ≈600 MB en fp32, ≈300 MB en fp16 y ≈150 MB en int8 para los pesos, más activaciones y overhead de runtime (los pesos del repositorio ocupan 0,6 GB).
- Cabe holgadamente en cualquier GPU consumer: GTX 1650, RTX 3060, RTX 4090, e incluso en iGPU o CPU pura; no requiere A100 ni H100.
- Entrenamiento e inferencia de referencia se hicieron en CPU, con 184 ms de mediana por reseña usando dos hilos.
- Throughput derivado de ese dato: del orden de 5 reseñas por segundo en ese escenario de CPU con dos hilos; no se han publicado medidas de throughput en GPU.
- Opciones de despliegue: `transformers` con `AutoModelForSequenceClassification`, `pipeline("text-classification")` y tag `text-embeddings-inference` con endpoints compatibles. No hay GGUF ni ONNX en el repositorio, por lo que llama.cpp y Ollama requerirían conversión propia; soporte en vLLM o TGI no está confirmado en la información disponible.
- Coste operativo muy bajo: un solo forward pass sustituye a las múltiples consultas por aspecto de la pipeline anterior, con una reducción de latencia de aproximadamente 12,9 veces.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| car-review-absa | 149,6 M | No disponible (entrenado a 256 tokens) | Macro-F1 de aspectos 0,921; veredicto global 90,6% | Apache 2.0 | HuggingFace + Space de demo |
| Pipeline DeBERTa-v3 ABSA + DistilBERT-SST2 | No disponible | No disponible | Macro-F1 de aspectos 0,183; veredicto global 74,2% | No disponible en la información | Pipeline previa del mismo autor |
| answerdotai/ModernBERT-base | 149 M (modelo base de este fine-tuning) | No disponible en la información | No disponible: es un modelo base sin cabeza ABSA, no comparable directamente | No disponible en la información | HuggingFace |

No se dispone de datos de otros modelos ABSA especializados en dominio automovilístico con los que comparar métricas en el mismo conjunto de test.

## Limitaciones y advertencias

- Entrenado solo con reseñas sintéticas en inglés: jerga, erratas, sarcasmo o digresiones ajenas al coche degradarán el rendimiento, y el comportamiento sobre datos reales no está medido; el propio autor lo califica de no medido.
- Las opiniones del corpus son inventadas aunque los nombres de coche sean reales: el modelo no dice nada sobre coches reales, solo sobre la estructura del texto.
- Los fallos más frecuentes son menciones fugaces o implícitas (por ejemplo, un comentario de pasada sobre un habitáculo silencioso en una reseña de fiabilidad).
- Solo ocho aspectos fijos: experiencias de concesionario, remolque como tema propio u otros quedan plegados al aspecto más cercano o ignorados.
- Longitud de entrenamiento de 256 tokens: reseñas largas pueden truncarse y perder menciones.
- Idioma limitado al inglés; no hay evidencia de transferencia a castellano.
- Al ser un clasificador, no genera texto y por tanto no "alucina" contenido, pero puede asignar polaridad a un aspecto apenas sugerido; conviene aplicar el umbral `argmax > 0` sobre la clase `none` que muestra el ejemplo de uso.
- Licencia Apache 2.0: permite uso comercial y modificaciones con obligaciones de atribución y aviso; conviene revisar los términos de la licencia del modelo base y de los datos sintéticos generados con Qwen3-8B si se redistribuye.
- El modelo tiene 16 descargas y 0 likes: no hay validación independiente por parte de la comunidad más allá de la evaluación del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Phoenixak99/car-review-absa
- Demo en vivo (Space): https://huggingface.co/spaces/Phoenixak99/car-reviews-analyzer
- Código, generación de datos y evaluación: https://github.com/phoenixak/Analyzing-Car-Reviews-with-LLMs
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
