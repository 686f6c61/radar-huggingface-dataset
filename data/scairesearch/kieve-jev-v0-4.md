# scairesearch/kieve-jev-v0.4

## Resumen

Kieve-JeV v0.4 es un motor de decisión tipado basado en encoder, desarrollado por scairesearch. No es un modelo generativo: recibe un `state` (cualquier texto) y un conjunto de preguntas tipadas, y devuelve para cada pregunta una única respuesta junto con una distribución de probabilidad calibrada sobre las opciones que el usuario aporta. Soporta dos primitivas: `choice`, que elige una opción del conjunto `criteria` y emite la distribución completa, y `noul`, un cabezal de sí/no aprendido que actúa como mecanismo de abstención. El modelo nunca genera opciones nuevas, por lo que funciona con conjuntos de etiquetas arbitrarios y específicos de cada tarea.

Técnicamente se apoya en `answerdotai/ModernBERT-base` congelado al que se le añaden adaptadores LoRA de rango 16, un par de encoders para estado y pregunta, un scorer de opciones con cross-attention emparejada y un stack de operadores neuronales fusionados (FNO multi-escala, GNP de bajo rango y `GateFuse`). El checkpoint completo tiene 174,4 M de parámetros, de los cuales solo 22,0 M son entrenables. Se distribuye como checkpoint PyTorch (`.pt`) para la librería `kieve`.

Su relevancia es acotada pero concreta: cubre el nicho de decisión con opciones cerradas, calibración explícita (temperatura guardada en el checkpoint) y abstención, algo que un clasificador convencional no ofrece. Ahora bien, sus resultados publicados están muy cerca del azar en varios conjuntos, por lo que debe evaluarse como prueba de concepto de la arquitectura, no como componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (ModernBERT-base congelado) + LoRA rango 16, encoders separados de estado y pregunta, scorer de opciones con cross-attention emparejada y cabezal `noul`; operadores fusionados MultiScaleFNOField, ImprovedGeoGNP y GateFuse |
| Parametros totales | 174,4 M (checkpoint completo) |
| Parametros activos | no aplica (no es un modelo MoE); 22,0 M entrenables |
| Longitud de contexto | no disponible (no se especifica en la model card) |
| Tipos de cuantizacion | no disponible; solo se publica el checkpoint en el formato original |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (el backbone ModernBERT queda sujeto a su propia licencia) |
| Formato de pesos | PyTorch checkpoint `checkpoint_latest.pt` (clave `model_state`) + `config.json`; no se publican safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo es una variante `jev` de un motor de decisión: dos encoders procesan por separado el `state` y la pregunta, y un scorer de opciones con cross-attention emparejada puntúa cada opción del conjunto `criteria` de forma conjunta, en lugar de clasificar cada opción de forma independiente. A esto se suma un cabezal `noul` que produce una probabilidad de sí/no y funciona como cabeza de "sin respuesta". Sobre el backbone congelado se añaden operadores neuronales fusionados: un campo FNO multi-escala (`MultiScaleFNOField`), un GNP de bajo rango (`ImprovedGeoGNP`) y una compuerta de fusión (`GateFuse`). Las ramas de operadores se inicializan a cero, de modo que en el paso 0 el modelo reproduce exactamente el backbone preentrenado, lo que estabiliza el arranque del entrenamiento.

El entrenamiento se realizó sobre 313.908 casos públicos de opción múltiple: MMLU auxiliary train (99.842), MedMCQA (100.000), HellaSwag (39.905), WinoGrande (40.398), SciQ (11.679), CommonsenseQA (9.741), OpenBookQA (4.957) y ARC (3.370), más los fragmentos de texto de JevBench. Se ejecutaron 3.500 pasos con LoRA de rango 16 sobre ModernBERT-base congelado. La model card no documenta uso de RLHF ni DPO; la calibración se materializa como una temperatura de softmax almacenada en el checkpoint (`temperature`) y aplicada en la inferencia. El motor `decision_index.engines.kieve:KieveEngine` reconstruye la geometría del backbone, el rango LoRA y el stack de operadores a partir del propio checkpoint, de modo que la carga no produce tensores faltantes ni inesperados.

## Capacidades

- Selección de una opción entre un conjunto cerrado arbitrario, con distribución de probabilidad completa sobre las opciones aportadas (primitiva `choice`).
- Abstención mediante la primitiva `noul`, que devuelve una probabilidad de sí/no entrenada específicamente para decidir si existe respuesta.
- Procesamiento de preguntas tipadas en lote: varias preguntas sobre el mismo `state` en una sola llamada a `/v1/systemone`.
- Calibración explícita de las probabilidades mediante temperatura ajustada (ECE de 0,063 en la evaluación mixta reportada).
- Integración como engine dentro del pipeline `decision_index` y como servidor HTTP propio (`python -m kieve.serve`).
- No soporta generación de texto libre, tool calling, razonamiento multi-paso, visión, audio ni capacidades multimodales: es un encoder discriminativo, no un modelo generativo.
- Soporte multilingüe: no documentado; la model card no declara idiomas.

## Casos de uso

- Enrutado de tickets de soporte con etiquetas definidas por el equipo: se pasa el texto del ticket como `state` y las colas disponibles como opciones de una pregunta `choice`; la distribución resultante permite enrutar por umbral de confianza y derivar a revisión humana cuando la masa de probabilidad está repartida.
- Extracción de campos con opción de "no presente": por cada campo del formulario se emite una pregunta `choice` con los valores admitidos y una pregunta `noul` para decidir si el campo aparece o no en el documento, evitando inventar valores fuera del vocabulario.
- Corrección automática de exámenes tipo test: el enunciado y el contexto van en el `state`, y las alternativas en el conjunto de opciones; la distribución devuelta sirve tanto para la nota como para marcar preguntas de baja confianza.
- Triaje de moderación con categorías cerradas: se define un conjunto de políticas como opciones y se usa `noul` como indicador de "sin incidencia", lo que permite un flujo de dos etapas (¿hay incidencia? ¿qué categoría?).
- Reranking restringido en un pipeline de RAG: en lugar de generar texto, el modelo elige entre los pasajes recuperados que se le pasan como opciones, con una probabilidad asociada que se puede usar para ordenar o descartar.
- Anotación asistida y active learning: al devolver una distribución completa y calibrada, permite seleccionar para etiquetado humano únicamente las muestras con entropía alta, reduciendo el coste de anotación.
- Control de calidad de datasets: clasificar cada muestra en un conjunto fijo de categorías de error o de calidad con la misma interfaz `choice`, sin necesidad de reentrenar el modelo para cada esquema de etiquetas.

## Benchmarks y rendimiento

Evaluación held-out de opción múltiple, 400 casos por conjunto, nunca vistos en entrenamiento. El azar se indica entre paréntesis.

| Conjunto | Accuracy | Azar |
|---|---|---|
| ARC-Challenge | 0,285 | 0,25 |
| ARC-Easy | 0,260 | 0,25 |
| HellaSwag | 0,230 | 0,25 |
| MedMCQA | 0,293 | 0,25 |
| MMLU | 0,258 | 0,25 |
| OpenBookQA | 0,355 | 0,25 |
| WinoGrande | 0,468 | 0,50 |
| **Macro promedio** | **0,307** | 0,25 |

Evaluación mixta durante el entrenamiento (512 filas): accuracy 0,31, NLL 1,319, ECE 0,063.

No se han publicado resultados de benchmarks generativos (MMLU de 5 disparos, HumanEval, GSM8K) porque el modelo no es generativo y no puede evaluarse con esos protocolos. Sí se indica que existe una ejecución completa de la suite pública 0.3 del Decision Index enviada al board correspondiente, con `scores.json` marcando `"complete": true` y los `index.json` por benchmark, pero los valores numéricos de esa suite no se reproducen en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint completo son 174,4 M de parámetros, lo que supone aproximadamente 0,7 GB en fp32 y unos 0,35 GB en fp16 (cálculo derivado del número de parámetros, no publicado por el autor). Con activaciones y overhead del runtime, cabe holgadamente por debajo de 2 GB de VRAM.
- GPU recomendadas: cualquier GPU con 4 GB o más es suficiente; una RTX 3060, RTX 4060 o superior no debería tener problema. Para lotes grandes de preguntas por `state`, una A10G o L4 aportan margen de throughput.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU dedicada moderna, e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: servidor propio de Kieve (`python -m kieve.serve --checkpoint checkpoint_latest.pt --config config.json`) exponiendo `/v1/systemone`, o como engine del pipeline `decision_index` (`--engine decision_index.engines.kieve:KieveEngine`). No se documenta soporte para vLLM, TGI, llama.cpp ni Ollama, y el formato de pesos publicado (`.pt`) no es compatible con esos runners sin conversión.
- Latencia y throughput estimados: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Kieve-JeV v0.4 | Encoder + LoRA + operadores, decisión tipada | 174,4 M (22,0 M entrenables) | no disponible | Apache-2.0 | Opciones arbitrarias, abstención `noul`, calibración por temperatura; macro 0,307 en 7 conjuntos |
| answerdotai/ModernBERT-base (clasificador con cabezal lineal) | Encoder clasificador | ~149 M | 8192 tokens (según el backbone) | Apache-2.0 | Clasificación de clases fijas; requiere reentrenar el cabezal por cada esquema y no tiene abstención nativa |
| Modelos tipo DeBERTa-v3-base ajustados a MNLI/opción múltiple | Encoder con cabezal de elección | ~86 M – 435 M según variante | 512–1024 tokens típicamente | MIT / Apache-2.0 según checkpoint | Mayor madurez y ecosistema (safetensors, integración con `transformers`), pero sin distribución calibrada ni conjunto de opciones dinámico |
| LLMs generativos pequeños (por ejemplo, 1–3 B) usados como clasificadores por prompt | Decoder causal | 1000 M+ | varios miles de tokens | variable | Flexibilidad de cero disparos y explicaciones, a cambio de mucha más VRAM, latencia y riesgo de respuestas fuera del conjunto de opciones |

La comparación de accuracy no es directa: los conjuntos held-out de Kieve-JeV son de 400 casos y los modelos alternativos se evalúan normalmente en los splits completos, por lo que las cifras no son intercambiables.

## Limitaciones y advertencias

- Rendimiento muy próximo al azar: el macro promedio es 0,307 frente a un azar de 0,25, con HellaSwag por debajo del azar (0,230) y WinoGrande también por debajo (0,468 frente a 0,50). No es un modelo apto para decisiones de producción sin una evaluación propia y exhaustiva.
- Riesgo de calibración engañosa: un ECE bajo (0,063) indica que las probabilidades coinciden con la frecuencia empírica de acierto, pero si el modelo acierta poco, unas probabilidades bien calibradas siguen siendo poco útiles para decidir. La calibración no compensa la falta de precisión.
- Conjuntos de entrenamiento con solapamiento temático con los de evaluación: MMLU, HellaSwag, ARC, OpenBookQA, WinoGrande, SciQ, CommonsenseQA y MedMCQA aparecen tanto en entrenamiento como en la evaluación held-out (con subconjuntos distintos), por lo que las cifras deben interpretarse con cautela.
- Idiomas no declarados: la model card no especifica qué idiomas cubre; el entrenamiento documentado es en inglés, así que el uso en castellano no está validado.
- Longitud de contexto no documentada: no hay garantía publicada sobre cuántos tokens de `state` admite el modelo con el stack de operadores, lo que limita el diseño de casos con documentos largos.
- Dependencia de la librería `kieve` y del formato `.pt`: no hay pesos en safetensors ni GGUF, ni integración con `transformers`, vLLM o llama.cpp. El checkpoint requiere cargar código propio, con la consiguiente revisión de seguridad.
- Sin datos de sesgo ni de robustez: no se publica ninguna evaluación de sesgos, toxicidad o comportamiento frente a entradas adversarias.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo día: no hay evidencia de uso externo ni de mantenimiento.
- Licencia Apache-2.0 para el modelo, pero el backbone ModernBERT tiene su propia licencia; conviene revisarla antes de un uso comercial. Los conjuntos de datos de entrenamiento (MedMCQA, MMLU, etc.) pueden tener condiciones adicionales que afecten a la redistribución.
- El modelo no genera texto: no puede usarse para resumir, redactar ni justificar su decisión. La trazabilidad se limita a la distribución devuelta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/scairesearch/kieve-jev-v0.4
- Backbone: https://huggingface.co/answerdotai/ModernBERT-base
- Paper, blog, repositorio de código, demo y board del Decision Index: no disponibles en la información proporcionada (la model card menciona los módulos `kieve` y `decision_index`, pero no enlaza URL alguna).
