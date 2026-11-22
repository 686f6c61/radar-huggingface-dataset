# sef1/android-ui-action-scorer-mmbert-small

## Resumen

`sef1/android-ui-action-scorer-mmbert-small` es un checkpoint experimental de clasificación de secuencias obtenido por fine-tuning de `jhu-clsp/mmBERT-small` (arquitectura ModernBERT). El modelo actúa como cross-encoder de ranking de acciones: recibe un par de textos (contexto de tarea y pantalla, por un lado; texto de una acción candidata, por otro) y devuelve una puntuación escalar por candidato, de modo que las acciones se ordenan comparando dichas puntuaciones dentro del conjunto de candidatos. Está orientado a investigación sobre *action grounding* en Android, no a control autónomo de dispositivos.

El problema que aborda es el ranking de acciones candidatas en interfaces Android a partir exclusivamente de texto extraído del árbol de accesibilidad (textos, descripciones de contenido, hints, tooltips y colas de resource-ID), sin píxeles ni OCR. Se entrenó sobre el dataset AndroidControl de Google Research, con 54.557 pantallas y 60.402 ejemplos etiquetados retenidos de 78.611 pasos procesados. El checkpoint corresponde a la época 2 de entrenamiento y no fue seleccionado mediante un procedimiento de mejor checkpoint.

Es relevante ahora como pieza de referencia metodológica: el autor documenta con inusual detalle las limitaciones de su propia evaluación (shortcuts dependientes de etiqueta, ausencia de control con etiquetas barajadas, holdout no prístino), lo que lo convierte en un ejemplo útil de transparencia en benchmarks de agentes. No obstante, sus cifras no deben interpretarse como rendimiento limpio de selección de acciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (ModernBertForSequenceClassification), 22 capas, hidden 384, 6 cabezas de atención, mean pooling |
| Parametros totales | 140.641.921 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens por par codificado (truncado/padding); resumen de pantalla limitado a 800 caracteres |
| Tipos de cuantizacion | no disponible (no se han medido precisión ni tamaño cuantizados) |
| Idiomas soportados | en (solo se evaluaron ejemplos en inglés de AndroidControl) |
| Licencia | no disponible (el modelo base declara MIT; AndroidControl declara Apache 2.0 con mención de uso no comercial en su datasheet; implicaciones para los pesos fine-tuneados sin resolver) |
| Formato de pesos | safetensors (bfloat16), más config.json, tokenizer.json y tokenizer_config.json |

## Arquitectura y entrenamiento

El modelo es un transformer encoder ModernBERT de aproximadamente 140 M de parámetros, configurado como `ModernBertForSequenceClassification` con una única etiqueta de salida y mean pooling. La entrada es un par de textos tokenizados: por un lado, el objetivo global de la tarea, la instrucción de paso de bajo nivel proporcionada por un humano y un resumen del texto de pantalla (que une textos de candidatos seleccionados y se limita a 800 caracteres); por otro, el texto de la acción candidata. Cada par se trunca o rellena a 256 tokens y se procesan hasta 32 candidatos juntos por decisión. La cabeza de scoring entrenada está incluida en `model.safetensors`.

El fine-tuning empleó entropía cruzada listwise sobre candidatos, optimizador AdamW, dos épocas y un batch de 4 pantallas por paso. Los datos provienen de Google Research AndroidControl: se procesaron 78.611 pasos de 20 shards (subconjuntos oficiales de train e IDD-test), reteniendo 60.402 ejemplos etiquetados y excluyendo 12.777 pasos sin emparejar y 5.432 acciones omitidas. El entrenamiento final usó 54.557 pantallas y evaluó una porción de 2.000 ejemplos de 2.973 pasos IDD etiquetados y reservados. El subconjunto oficial IDD-test se inspeccionó repetidamente durante el desarrollo, por lo que no constituye un holdout final prístino. No se reporta uso de RLHF ni DPO.

## Capacidades

- Puntuación de acciones candidatas: devuelve un escalar por par (contexto, acción), pensado para ordenar candidatos dentro de un mismo conjunto.
- Ranking listwise: la comparación de puntuaciones dentro del conjunto reproduce el ranking; la evaluación original aplicó softmax sobre el conjunto para obtener confianza.
- Procesamiento de texto de accesibilidad Android: textos de nodos, content descriptions, hints, tooltips y colas de resource-ID.
- Condicionamiento por objetivo y paso: incorpora el objetivo global de la tarea y una instrucción de paso de bajo nivel proporcionada por un humano.
- Procesamiento por lotes de candidatos: hasta 32 candidatos por decisión.
- Idioma: únicamente inglés en la evaluación; no se establece cobertura multilingüe del fine-tune.
- Sin capacidades de visión: no procesa píxeles ni OCR.
- Sin tool calling, sin function calling, sin modo thinking, sin audio y sin generación de texto libre: es un clasificador de ranking, no un modelo generativo.
- No incluye generación de candidatos: el modelo no propone acciones, solo las puntúa.

## Casos de uso

- Investigación en action grounding: usar el modelo como componente de ranking en experimentos controlados donde las acciones candidatas se generan externamente, permitiendo aislar la calidad del scorer frente a la del generador.
- Re-ranking en pipelines de agentes Android simulados: dado un conjunto de acciones candidatas producidas por reglas o por otro modelo, puntuar y reordenar para seleccionar la acción con mayor score dentro del conjunto.
- Análisis de señales de accesibilidad: estudiar qué información textual (content descriptions, hints, resource-ID) aporta más señal para la desambiguación de acciones, comparando ablaciones sobre el resumen de pantalla.
- Evaluación de metodologías de benchmark: el modelo y su model card sirven como caso de estudio para diseñar evaluaciones libres de shortcuts dependientes de etiqueta y con conjuntos de candidatos emparejados.
- Prototipado de asistentes de accesibilidad en laboratorio: experimentar con sugerencias de siguiente paso en tareas guiadas, siempre con supervisión humana y sin ejecución automática.
- Baseline de cross-encoder en tareas de ranking de texto corto: reutilizar la arquitectura y el pipeline de pares para tareas de ranking fuera de Android, reentrenando la cabeza de clasificación.
- Docencia y reproducción: el checkpoint y las instrucciones de carga permiten reproducir el pipeline de inferencia y estudiar el efecto del truncado a 256 tokens y del límite de 800 caracteres en el resumen de pantalla.

## Benchmarks y rendimiento

Resultados de la evaluación exploratoria original, que el autor advierte explícitamente que no deben tratarse como rendimiento limpio de selección de acciones sin ayuda:

| Cobertura retenida | Ejemplos retenidos | Precisión del modelo |
|---|---:|---:|
| 100% | 2.000 | 81,05% |
| 90% | 1.800 | 88,17% |
| 80% | 1.600 | 94,06% |
| 70% | 1.400 | 97,50% |

La cobertura se define reteniendo la fracción de ejemplos con mayor confianza softmax máxima del propio modelo; no es un umbral operativo validado de forma independiente. Limitaciones declaradas del benchmark:

- Se incluyeron instrucciones de paso de bajo nivel dadas por humanos; no se demuestra rendimiento a partir solo de un objetivo de alto nivel.
- Para acciones de nodo, se garantizó que el candidato correcto permaneciera al truncar la lista, por lo que no se evaluó el recall de candidatos.
- En ejemplos de acciones sintéticas se añadió solo la acción sintética ground-truth en lugar del conjunto completo de acciones sintéticas válidas: es un shortcut dependiente de la etiqueta.
- La baseline de solo reglas y el modelo aprendido usaron construcciones de candidatos distintas y, a cobertura parcial, subconjuntos distintos seleccionados por confianza; la diferencia numérica no es una afirmación controlada de mejora.
- El control con etiquetas barajadas no se ejecutó. No hay holdout final nuevo, estimación de incertidumbre con semillas repetidas ni transferencia medida a AitW.
- No hay mediciones en CPU/NPU de teléfono, ni de precisión/tamaño con cuantización, ni resultados de finalización de tareas Android en vivo, ni validación de seguridad.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma medida. Con 140,6 M de parámetros en bfloat16, el peso ronda los 0,28 GB; el repo ocupa 0,3 GB. El consumo real depende del batch de hasta 32 candidatos y de la longitud de 256 tokens.
- GPU recomendadas: no disponible (no se han publicado mediciones). Por tamaño, el modelo cabe holgadamente en cualquier GPU con al menos unos pocos GB de VRAM.
- Cabe en GPU de consumo: sí, por tamaño de parámetros; no se han publicado mediciones concretas en RTX 4090, RTX 3090 u otras.
- Opciones de despliegue: transformers (librería declarada); el tag `text-embeddings-inference` y `endpoints_compatible` sugieren compatibilidad con TEI y endpoints, aunque no se ha validado. No hay soporte documentado para llama.cpp, Ollama, vLLM ni TGI.
- Latencia y throughput: no disponibles. No se han medido precisión ni rendimiento en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| sef1/android-ui-action-scorer-mmbert-small | 140,6 M | 256 tokens por par | Ranking de acciones Android (cross-encoder) | no disponible | Hugging Face |
| jhu-clsp/mmBERT-small (base) | ~140 M | no disponible en esta ficha | Encoder multilingüe general | MIT (según model card del base) | Hugging Face |
| Modelos de agente Android visuales (p. ej. basados en VLM) | no disponible | no disponible | Control de UI con píxeles | no disponible | no disponible |

No se dispone en la información proporcionada de resultados comparables de otros rankers de acciones Android sobre el mismo conjunto de evaluación, por lo que no se ofrece comparación numérica.

## Limitaciones y advertencias

- No es un agente autónomo ni un controlador Android validado: es un ranker de texto experimental y no debe usarse para acciones sensibles a seguridad, operaciones irreversibles ni control desatendido del dispositivo.
- No genera candidatos: el modelo no propone acciones; la generación de candidatos queda fuera de los pesos y no está resuelta.
- Una puntuación individual no es una probabilidad calibrada de acción correcta; solo tiene sentido comparativa dentro de un conjunto de candidatos.
- El benchmark presenta shortcuts dependientes de etiqueta (acción sintética ground-truth añadida, candidato correcto garantizado al truncar) y no se ejecutó el control con etiquetas barajadas.
- El subconjunto IDD-test se inspeccionó repetidamente durante el desarrollo; no hay holdout final prístino ni estimación de incertidumbre con semillas repetidas.
- Solo se evaluó en inglés; la cobertura multilingüe del modelo base no está establecida para este fine-tune.
- No hay validación de seguridad, ni mediciones en CPU/NPU de teléfono, ni resultados de finalización de tareas en vivo.
- Licencia sin resolver: el base declara MIT, AndroidControl declara Apache 2.0 con mención de uso no comercial en su datasheet, y las implicaciones para los pesos fine-tuneados no están resueltas. El release no reclama uso sin restricciones.
- Riesgo de alucinación y sesgos: no evaluados ni documentados en la información disponible.
- El checkpoint es la época 2 final, no el mejor checkpoint según un procedimiento de selección.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sef1/android-ui-action-scorer-mmbert-small
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
- Dataset AndroidControl (Google Research): https://github.com/google-research/google-research/tree/master/android_control
