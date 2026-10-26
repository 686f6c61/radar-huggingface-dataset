# scairesearch/kieve-jev-curriculum-300m

## Resumen

Kieve-JeV curriculum16k 300M es un motor de decisión tipado basado en encoder, publicado por scairesearch bajo licencia Apache-2.0. No es un modelo generativo: recibe un `state` (cualquier texto) y un conjunto de preguntas tipadas, y devuelve para cada pregunta una única respuesta acompañada de una distribución de probabilidad calibrada sobre las opciones que el usuario proporciona. Soporta dos primitivas: `choice` (elegir una opción de `criteria` con distribución completa) y `noul` (probabilidad sí/no de una cabeza aprendida de no-respuesta).

Arquitectónicamente parte de `answerdotai/ModernBERT-base` congelado, sobre el que monta adaptadores LoRA de rango 16, encoders separados de estado y pregunta, un scorer de opciones con cross-attention emparejada y una cabeza `noul` independiente. Incorpora además ramas de operadores neuronales fusionados (MultiScaleFNOField, ImprovedGeoGNP y GateFuse) inicializadas a cero, de modo que el backbone preentrenado se preserva en el paso 0. El checkpoint suma 296,6 M de parámetros.

Su relevancia es acotada pero específica: cubre el hueco de la decisión calibrada con conjuntos de opciones arbitrarios, sin inventar respuestas fuera del conjunto suministrado, y con una latencia mediana declarada de 173,5 ms sobre 150.759 peticiones en el índice de decisión interno. Es un componente de infraestructura para pipelines de enrutado y clasificación, no un asistente conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (ModernBERT-base congelado) + LoRA rango 16 + encoders de estado/pregunta, scorer de opciones con cross-attention emparejada, cabeza `noul` y operadores neuronales fusionados (MultiScaleFNOField, ImprovedGeoGNP, GateFuse) |
| Parametros totales | 296,6 M (checkpoint completo); parametros entrenables no disponibles (la model card remite a `config.json`) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card (el nombre del checkpoint incluye "16k", sin confirmacion documental) |
| Tipos de cuantizacion | No disponible; solo se distribuye checkpoint en punto flotante, sin variantes cuantizadas publicadas |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (el backbone ModernBERT esta sujeto a su propia licencia) |
| Formato de pesos | `checkpoint_latest.pt` (checkpoint PyTorch con `model_state` y `temperature`) + `config.json`; no se publican safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo es un encoder de decisión, no un generador. La variante `jev` combina un backbone `answerdotai/ModernBERT-base` completamente congelado con adaptadores LoRA de rango 16, dos encoders (estado y pregunta), un scorer de opciones basado en cross-attention emparejada y una cabeza `noul` separada que modela la probabilidad de no responder. Sobre ese conjunto se añaden tres ramas de operadores neuronales fusionados con `use_ops` activado: un campo FNO multiescala (`MultiScaleFNOField`), un GNP de bajo rango (`ImprovedGeoGNP`) y `GateFuse`. Las ramas de operadores están inicializadas a cero, de forma que en el paso 0 la salida equivale al backbone preentrenado y el modelo aprende a incorporarlas durante el entrenamiento.

La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO; tampoco describe el procedimiento de calibración más allá de indicar que el checkpoint almacena una `temperature` de softmax calibrada y que la evaluación held-out se hizo con "temperature refit". El identificador del checkpoint ("curriculum16k") sugiere un entrenamiento por currículum, pero no se documenta en qué consiste. No hay información publicada sobre innovaciones de decodificación (decodificación especulativa, attention linear u otras).

## Capacidades

- Decisión de elección múltiple sobre un conjunto de opciones arbitrario y definido por el usuario: devuelve una distribución completa sobre las opciones de `criteria`, no una única etiqueta.
- Abstención calibrada mediante la primitiva `noul`, que emite una probabilidad sí/no aprendida en lugar de forzar una elección.
- Calibración explícita de probabilidades: el checkpoint incluye una temperatura de softmax ajustada, lo que permite umbrales de confianza interpretables.
- Restricción dura del espacio de respuestas: el modelo nunca genera opciones nuevas, solo puntúa las suministradas.
- Procesamiento de estado en lenguaje natural libre, sin esquema fijo de entrada.
- Servicio como API HTTP mediante `/v1/systemone` del servidor Kieve.
- Integración como motor de índice de decisión (`decision_index.engines.kieve:KieveEngine`).
- No documentado: soporte de tool calling o function calling, razonamiento multi-paso, capacidades de agente, visión, audio, modo "thinking" o generación de texto libre.

## Casos de uso

- Enrutado de peticiones en producción: dado el texto de una consulta como `state` y un conjunto cerrado de destinos como opciones, el modelo devuelve la distribución sobre intenciones. La `noul` permite derivar a un humano o a un fallback cuando la confianza es baja, en lugar de forzar una ruta incorrecta.
- Clasificación con abstención en moderación de contenido: se definen categorías como opciones y se fija un umbral sobre la probabilidad de `noul` para decidir cuándo el caso requiere revisión humana, aprovechando la temperatura calibrada del checkpoint.
- Triaje de tickets de soporte: el `state` es el cuerpo del ticket y las opciones son colas de resolución; la distribución completa permite priorizar por probabilidad y no solo por etiqueta top-1.
- Etiquetado asistido con conjuntos de etiquetas cambiantes: al definirse las opciones en cada petición, el mismo modelo sirve para taxonomías distintas sin reentrenamiento, lo que encaja en pipelines de curación de datos donde el esquema evoluciona.
- Segunda etapa de un pipeline de recuperación (reranking con abstención): se puntúa cada documento candidato como opción y se descartan aquellos con alta probabilidad de `noul`, evitando respuestas sin respaldo documental.
- A/B testing y evaluación de decisiones automatizadas: la salida es una distribución calibrada, lo que permite medir calibración (no solo accuracy) y comparar políticas de decisión con umbrales distintos.
- Despliegue como servicio interno: el servidor Kieve expone `/v1/systemone` con una latencia mediana declarada de 173,5 ms, adecuada para decisiones síncronas dentro de un flujo de aplicación.

## Benchmarks y rendimiento

| Evaluacion | Resultado | Tamano de muestra |
|---|---|---|
| Held-out JvD, aegis2 | 0,576 | n = 59 |
| Held-out JvD, atbench500 | 0,484 | n = 64 |
| Decision Index 0.2.1, skill | 0,76 | 150.759 peticiones puntuadas |
| Decision Index 0.2.1, raw | 21,26 | 150.759 peticiones puntuadas |
| Decision Index 0.2.1, latencia mediana | 173,5 ms | 150.759 peticiones puntuadas |

La model card indica que 0,576 en aegis2 es el mejor resultado de cualquier ejecución de Kieve. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, lo que es coherente con la naturaleza no generativa del modelo. Las muestras de evaluación held-out son pequeñas (59 y 64 casos), por lo que la incertidumbre de esas métricas es alta.

## Requisitos de hardware

- VRAM estimada para inferencia: a partir de los 296,6 M de parámetros, el peso en fp32 ronda 1,2 GB y en fp16 unos 0,6 GB; el repositorio completo ocupa 1,4 GB y el checkpoint añade estado de optimizador y buffers. Estas cifras son un cálculo a partir del número de parámetros, no un dato publicado.
- GPU recomendadas: no documentadas por el autor. Por tamaño, cualquier GPU con 4 GB o más de VRAM debería acomodar el modelo en fp32; una RTX 4090 o A100 queda sobredimensionada para un encoder de este tamaño.
- Cabe en GPU de consumo: previsiblemente sí en cualquier GPU moderna de 4-8 GB, y también en CPU, dado el reducido número de parámetros y la latencia declarada de 173,5 ms (medida en un entorno no especificado).
- Opciones de despliegue: el autor documenta el servidor propio `python -m kieve.serve` con `/v1/systemone`, y la integración como motor de `decision_index`. No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, y la ausencia de pesos GGUF o safetensors impide usarlos directamente.
- Throughput: no disponible. Solo se publica la latencia mediana de 173,5 ms por petición en la evaluación del Decision Index.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kieve-JeV curriculum16k 300M | 296,6 M | No disponible | Decisión tipada con distribución calibrada y abstención | Apache-2.0 | HuggingFace, librería `kieve` |
| ModernBERT-base (backbone) | No disponible en la información proporcionada | No disponible en la información proporcionada | Encoder de propósito general | Sujeta a su propia licencia | HuggingFace / Answer.AI |
| Encoders de clasificación tipo BERT-base / DeBERTa-v3-base | No disponible en la información proporcionada | No disponible en la información proporcionada | Clasificación supervisada con cabeza fija | Variable | HuggingFace |

La comparación directa es difícil: los encoders de clasificación convencionales emiten logits sobre un conjunto de etiquetas fijo durante el entrenamiento, mientras que este modelo define la distribución en tiempo de inferencia sobre las opciones recibidas y añade una cabeza explícita de abstención. No se dispone de datos públicos de benchmarks comunes entre esta familia y los encoders citados, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, código ni respuestas abiertas. Cualquier caso de uso que requiera generación queda fuera de su alcance.
- La calidad depende críticamente de la formulación de las opciones: opciones ambiguas, solapadas o mal redactadas degradan la distribución sin que el modelo pueda reformularlas.
- Las muestras de evaluación publicadas son muy pequeñas (n = 59 y n = 64), por lo que las cifras de aegis2 y atbench500 tienen alta varianza y no deben tomarse como estimaciones estables.
- El "Decision Index 0.2.1" y las métricas aegis2/atbench500 son evaluaciones internas del autor, no benchmarks estándar de la comunidad; no permiten comparación con modelos externos.
- No se documentan los idiomas soportados ni la composición del corpus de entrenamiento, lo que impide descartar un sesgo fuerte hacia el inglés o hacia los dominios presentes en los datos.
- Sesgos conocidos: no documentados. Al no publicarse la composición del dataset ni análisis de sesgo, no hay garantías sobre comportamiento diferencial por demografía, idioma o dominio.
- Riesgo de alucinación: estructuralmente bajo en el sentido generativo, porque el modelo no puede emitir opciones no suministradas; el riesgo real es una asignación de probabilidad alta a una opción incorrecta del conjunto, mitigable con la cabeza `noul` y umbrales calibrados.
- Longitud de contexto no declarada: no se especifica el máximo de tokens para el `state`, y el sufijo "16k" del nombre no está confirmado en la documentación.
- No hay variantes cuantizadas ni pesos en safetensors; el único artefacto es un `.pt` de PyTorch, lo que implica cargar el fichero con `torch.load` y asumir el riesgo de deserialización de pickle.
- Dependencia de una librería propia y muy reciente (`kieve`), con cero descargas y cero "likes" en el momento de la ficha: el ecosistema de herramientas, documentación y soporte es prácticamente inexistente.
- Licencia Apache-2.0 para este checkpoint, pero el backbone ModernBERT conserva su propia licencia, que debe verificarse por separado para uso comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/scairesearch/kieve-jev-curriculum-300m
- Backbone referenciado en la model card: https://huggingface.co/answerdotai/ModernBERT-base
