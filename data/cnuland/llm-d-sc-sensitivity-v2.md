# cnuland/llm-d-sc-sensitivity-v2

## Resumen

`llm-d-sc-sensitivity-v2` es un clasificador de sensibilidad diseñado para el enrutamiento semántico de prompts en sistemas que integran modelos de lenguaje (llm-d). Desarrollado por cnuland, este modelo asigna a cada prompt una de cinco etiquetas de sensibilidad: `PUBLIC`, `INTERNAL`, `CONFIDENTIAL`, `REGULATED` y `NEVER_EGRESS`. Su función principal es servir como compuerta de seguridad y control de egress: decide si una consulta puede salir hacia un modelo externo, debe redirigirse a un entorno interno o debe bloquearse por completo.

El modelo se construye sobre `sentence-transformers/all-MiniLM-L6-v2`, un transformer encoder de 22,7 millones de parámetros, con una cabeza de clasificación de secuencias que requiere un runtime capaz de leer logits. Incluye 22.715.141 parámetros totales y se distribuye con pesos en formato `safetensors`. Su relevancia actual radica en la necesidad de las organizaciones de evitar fugas de datos en aplicaciones de IA generativa, donde el tráfico real de usuarios puede contener credenciales, información regulada o contenido interno. El modelo fue evaluado sobre tráfico real de WildChat y conjuntos empresariales, con resultados que cuestionan la calidad de las etiquetas de referencia y que sitúan el techo de precisión en torno a 0,95.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder con cabeza de clasificación de secuencias (sequence-classification head) sobre `sentence-transformers/all-MiniLM-L6-v2` |
| Parametros totales | 22.715.141 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (heredado de all-MiniLM-L6-v2, no especificado en la ficha) |
| Tipos de cuantizacion | No disponibles |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de un transformer encoder de tipo BERT, con inicialización en los pesos de `sentence-transformers/all-MiniLM-L6-v2`. Se añade una cabeza de clasificación de secuencias que toma la representación de la frase y predice la etiqueta de sensibilidad. El autor especifica que el runtime debe leer logits, ya que el modelo no genera texto: solo clasifica.

El entrenamiento utilizó 19.209 filas combinando varios conjuntos: `sensitivity-v2` (6.783 filas), `sensitivity-real` (8.361), `sensitivity-enterprise` (5.582) y `sensitivity-real-contested` (618). Esta mezcla integra tráfico real etiquetado por un jurado de tres modelos LLM con datos sintéticos generados a partir del rubric, para cubrir niveles de sensibilidad poco frecuentes en el tráfico real. La distribución de clases en el entrenamiento fue: `PUBLIC` (9.045), `INTERNAL` (4.040), `REGULATED` (2.303), `CONFIDENTIAL` (2.127) y `NEVER_EGRESS` (1.694). Los prompts de evaluación se mantienen fuera del entrenamiento mediante hash de contenido. Las etiquetas empleadas en la evaluación fueron validadas mediante adjudicación ciega por pares; se estima que un 4,9% de las etiquetas doradas son incorrectas, lo que limita la precisión máxima medible a aproximadamente 0,95.

## Capacidades

- Clasificación de prompts en cinco niveles de sensibilidad: `PUBLIC`, `INTERNAL`, `CONFIDENTIAL`, `REGULATED` y `NEVER_EGRESS`.
- Diseñado como componente de un enrutador semántico para llm-d, no como modelo generativo. Su salida es una etiqueta, no texto.
- Soporte de tool calling o function calling: no aplica, el modelo no genera instrucciones para herramientas.
- Soporte de agentes y razonamiento multi-paso: no aplica directamente. El modelo se integra como clasificador previo en flujos de agentes para decidir si una consulta puede procesarse o debe bloquearse.
- Capacidades multilingües: no especificadas en la ficha del modelo.
- Capacidad especial: evalúa la sensibilidad de prompts con un recall de 0,90 para `NEVER_EGRESS`, lo que lo hace útil como compuerta de seguridad ante credenciales o datos prohibidos.

## Casos de uso

- Control de egress en organizaciones: en una pasarela que envía prompts a un LLM externo, el modelo clasifica cada petición antes de su salida. Si detecta etiquetas `NEVER_EGRESS` o `REGULATED`, puede bloquearla o redirigirla a un modelo interno. El recall de 0,90 para `NEVER_EGRESS` reduce la probabilidad de fugas de credenciales.
- Enrutamiento entre modelos públicos y privados: una plataforma con varios LLM puede decidir qué modelo procesa cada consulta según su sensibilidad. Los prompts `PUBLIC` se envían a la nube; los `CONFIDENTIAL` o `REGULATED` se procesan localmente, optimizando coste y cumplimiento.
- Auditoría de logs históricos: el modelo puede aplicarse sobre registros de interacciones anteriores para etiquetar cada entrada y detectar posibles exposiciones de datos sensibles. En tráfico real alcanza una precisión de 0,8662, lo que permite identificar patrones de riesgo.
- Filtrado de datos para cumplimiento normativo (RGPD, HIPAA): antes de que un sistema de IA procese datos personales o sanitarios, el clasificador puede marcar los prompts que contienen información regulada. La baja recall de `REGULATED` (0,56) obliga a complementarlo con una revisión humana.
- Optimización de capacidad en producción: en sistemas con alta demanda, los prompts de bajo coste (`PUBLIC`) se atienden con modelos pequeños o respuestas almacenadas; los de mayor sensibilidad se reservan para recursos más caros o para validación adicional. La latencia en CPU (p50 2,93 ms, p99 3,2 ms) permite integrarlo en el camino crítico sin impacto apreciable.
- Clasificación de contenido en agentes autónomos: antes de que un agente ejecute acciones con efectos externos, la intención del usuario se clasifica por sensibilidad para aplicar políticas de seguridad. Por ejemplo, si el agente recibe un prompt que contiene una clave API, el modelo lo etiqueta como `NEVER_EGRESS` y aborta la acción.

## Benchmarks y rendimiento

La model card proporciona resultados de evaluación en varios conjuntos, expresados con intervalos de confianza y macro F1.

| Conjunto de evaluación | n | Accuracy | 95% CI | Macro F1 |
|---|---:|---:|---|---:|
| Tráfico real (WildChat, jurado unánime de 3 modelos) | 284 | 0,8662 | 0,822 – 0,901 | 0,4360 |
| Empresarial, situaciones con secretos | 707 | 0,7595 | 0,727 – 0,790 | 0,6831 |
| Empresarial (generación incondicionada, jurado unánime) | 744 | 0,6734 | 0,639 – 0,706 | 0,5650 |
| Held-out escrito manualmente | 75 | 0,9067 | 0,820 – 0,954 | 0,9060 |

Además, el autor publica el recall por nivel de sensibilidad en el conjunto de tráfico real:

| Nivel | Recall |
|---|---:|
| `PUBLIC` | 0,69 |
| `INTERNAL` | 0,80 |
| `CONFIDENTIAL` | 0,68 |
| `REGULATED` | 0,56 |
| `NEVER_EGRESS` | 0,90 |

El autor advierte que el techo medible del conjunto de evaluación es aproximadamente 0,95, no 1,0, debido a errores en las etiquetas doradas. No se han publicado comparativas con otros clasificadores en la información disponible.

## Requisitos de hardware

- VRAM estimada: prácticamente nula. Con 22,7 millones de parámetros, el modelo en FP32 ocupa alrededor de 90 MB y puede ejecutarse en memoria central sin necesidad de GPU.
- GPU recomendada: no se requiere ninguna GPU. La evaluación de latencia se realizó en CPU (Apple M-series, un solo hilo).
- Compatibilidad con GPU de consumo: sí, el modelo cabe en cualquier GPU disponible, pero no resulta necesario.
- Opciones de despliegue: HuggingFace Transformers, `text-embeddings-inference`, endpoints compatibles con HuggingFace. También puede servir mediante un contenedor propio con `transformers`. No es compatible con `llama.cpp` ni `vLLM`, al tratarse de un clásificador encoder.
- Latencia: p50 de 2,93 ms y p99 de 3,2 ms por petición en CPU (Apple M-series, un solo hilo).
- Throughput: no disponible en la información del autor.

## Comparativa con modelos similares

No se han publicado comparativas directas con otros clasificadores de sensibilidad en la información disponible. Existe una versión anterior del mismo autor, `cnuland/llm-d-sc-sensitivity`, que aparece en los resultados de búsqueda, pero no se dispone de sus métricas ni de sus diferencias exactas.

| Modelo | Parámetros | Pipeline | Licencia | Notas |
|---|---|---|---|---|
| cnuland/llm-d-sc-sensitivity-v2 | 22,7 M | text-classification | Apache-2.0 | Clasificador de sensibilidad v2 |
| cnuland/llm-d-sc-sensitivity | no disponible | no disponible | no disponible | Versión anterior, sin datos publicados en la búsqueda |

## Limitaciones y advertencias

- Sesgo de dominio: el conjunto de tráfico real proviene de WildChat, que refleja uso de consumidores. Alrededor del 93% de las muestras son `PUBLIC`, por lo que los niveles que bloquean egress (`REGULATED`, `NEVER_EGRESS`) no están bien representados. La fila empresarial cubre esos casos, pero tiene una precisión menor.
- Etiquetas de referencia generadas por LLM: las etiquetas doradas provienen de un jurado de tres modelos, no de anotadores humanos. El autor valida el procedimiento frente a anotaciones manuales, pero no garantiza la ausencia de errores. Se estima que un 4,9% de las etiquetas son incorrectas.
- Riesgo de error de clasificación: la precisión en tráfico real es 0,8662, con un techo de 0,95. Un sistema que dependa de este clasificador para bloquear completamente datos sensibles debe contemplar falsos negativos. El recall de `REGULATED` es especialmente bajo (0,56).
- Limitaciones de contexto: el modelo base all-MiniLM-L6-v2 tiene una ventana de 512 tokens. Los prompts más largos se truncarán, lo que puede degradar la precisión en conversaciones extensas.
- No independientemente reproducido: el autor señala que el modelo no ha sido evaluado por terceros; los resultados deben interpretarse con cautela.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero no incluye garantías de exactitud ni de seguridad. El uso como compuerta de seguridad requiere pruebas adicionales en el contexto concreto.

## Enlaces

- Página del modelo: https://huggingface.co/cnuland/llm-d-sc-sensitivity-v2
- Repositorio del proyecto llm-d-semantic-classifier: https://github.com/llm-d-incubation/llm-d-semantic-classifier
- Dataset WildChat-1M: https://huggingface.co/datasets/allenai/WildChat-1M
- Versión anterior del modelo: https://huggingface.co/cnuland/llm-d-sc-sensitivity
