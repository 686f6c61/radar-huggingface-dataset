# kawsarbuet/lakeshore-ticket-sorter

## Resumen

Lakeshore Ticket Sorter es un modelo de clasificación de texto obtenido por fine-tuning de `distilbert-base-uncased` sobre un conjunto de mensajes de soporte de un servicio ficticio de bicicletas compartidas. Lo desarrolla el usuario de Hugging Face kawsarbuet y su función concreta es sugerir una cola de atención (support queue) para cada ticket entrante, siempre con revisión humana posterior. No es un modelo generativo ni un asistente conversacional: es un clasificador de secuencias con una cabeza de clasificación sobre el encoder DistilBERT.

El modelo es relevante por su carácter de ejemplo metodológico más que por su rendimiento: la model card documenta de forma explícita el protocolo de evaluación (semilla fija, split estratificado, comparación contra líneas base de mayoría y TF-IDF), lo que permite reproducir y auditar las cifras. Con 66,9 millones de parámetros y un repositorio de 0,3 GB, se puede ejecutar en CPU y en cualquier GPU de consumo con una huella de memoria mínima.

Ahora bien, sus propios datos de entrenamiento son inventados y el conjunto es muy reducido (300 ejemplos), de modo que las métricas publicadas no establecen rendimiento en producción. Debe tratarse como una prueba de concepto de clasificación de tickets, no como un componente listo para despliegue real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilado de BERT-base) |
| Parametros totales | 66.956.548 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (la arquitectura base DistilBERT admite 512 tokens) |
| Tipos de cuantizacion | No disponible (pesos en safetensors sin variantes cuantizadas publicadas) |
| Idiomas soportados | No disponible (el modelo base esta entrenado principalmente en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tarea (pipeline) | text-classification |
| Modelo base | distilbert/distilbert-base-uncased |
| Etiquetas de salida | No disponible (no se enumeran las colas de soporte) |
| Tamano del repositorio | 0,3 GB |
| Descargas / likes | 0 / 1 |

## Arquitectura y entrenamiento

La arquitectura es un encoder Transformer tipo DistilBERT, con 6 capas, dimensión oculta de 768 y 12 cabezas de atención (configuración estándar de `distilbert-base-uncased`, aproximadamente 66 millones de parámetros), sobre el que se añade una cabeza de clasificación lineal para la tarea de enrutado de tickets. El vocabulario es el de BERT uncased en inglés, con tokenización WordPiece.

El entrenamiento se realizó sobre 300 ejemplos de mensajes inventados, procedentes de un split estratificado fijo con semilla 42. La model card documenta dos configuraciones comparadas: ajuste completo del modelo ("full", con learning rate 5e-5 y 3 épocas) y entrenamiento solo de la cabeza ("head", con learning rate 1e-3 y 2 épocas). La variante publicada es la de ajuste completo, seleccionada por validación. No se especifica el número de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron técnicas de aumento de datos; tampoco se menciona RLHF, DPO ni ninguna innovación de decodificación, algo esperable en un clasificador.

## Capacidades

- Clasificación de texto de una sola etiqueta: asigna a cada mensaje una cola de soporte sugerida entre un conjunto de clases no especificado en la model card.
- Enrutado de tickets de soporte: pensado para mensajes de un servicio de bicicletas compartidas, con temáticas como incidencias de alquiler, pagos o estado de la bicicleta (las categorías concretas no se detallan).
- Inferencia ligera: 66,9 millones de parámetros, apto para ejecución en CPU y con latencia muy baja.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No tiene capacidades multilingües declaradas; el modelo base es de inglés.
- No dispone de modo thinking, visión ni audio.
- No genera texto: no es un modelo instructivo ni conversacional.

## Casos de uso

- Triaje de tickets de soporte en un servicio de bicicletas compartidas: el modelo recibe el texto del mensaje y devuelve una cola sugerida, que un operador humano confirma o corrige. Es su uso declarado y el único para el que se ha entrenado.
- Clasificación por lotes de históricos de tickets: al ser un modelo de 67 millones de parámetros, se pueden procesar miles de mensajes en CPU en pocos minutos para etiquetar retroactivamente colas de atención y analizar la distribución de incidencias.
- Preetiquetado en herramientas de helpdesk: integrado como servicio HTTP detrás de Zendesk, Freshdesk o similar, propone una cola al crear el ticket y reduce el tiempo de asignación manual, con revisión obligatoria.
- Filtro de primera línea en correo de soporte: descarta o redirige mensajes claramente fuera de alcance antes de que lleguen a un agente, siempre que las clases estén bien definidas y se valide con datos reales.
- Prototipo y línea base para proyectos de clasificación: sirve como referencia reproducible (semilla 42, split estratificado, comparación con TF-IDF y mayoría) para medir si un modelo mayor aporta mejora real en una tarea de enrutado concreta.
- Despliegue en entornos con recursos limitados: al caber en CPU y en GPUs de consumo, se puede ejecutar en el edge o en contenedores pequeños sin GPU dedicada, útil para demos y entornos de desarrollo.

## Benchmarks y rendimiento

Los resultados publicados en la model card corresponden a la misma muestra de entrenamiento y a las mismas filas de evaluación para todos los métodos. La métrica de validación empleada para elegir variante es la accuracy media; se reportan también accuracy y macro-F1 en test y en el conjunto "own" (definido en la model card, sin más detalle).

| Metodo | Accuracy (test) | Macro-F1 (test) | Accuracy (own) | Macro-F1 (own) | Accuracy media (validacion) |
|---|---|---|---|---|---|
| Mayoría (baseline) | 0,2917 | 0,1129 | 0,2500 | 0,1000 | 0,2875 |
| TF-IDF (baseline) | 0,8375 | 0,8370 | 0,8750 | 0,8736 | 0,8653 |
| Full fine-tuning (publicado) | 0,8833 | 0,8857 | 0,9250 | 0,9233 | 0,9042 |
| Solo cabeza (head) | No disponible | No disponible | No disponible | No disponible | 0,7125 |

El ajuste completo supera al baseline TF-IDF en aproximadamente 4,6 puntos de accuracy en test y 4,9 puntos de macro-F1. La variante de solo cabeza queda claramente por debajo (0,7125 de accuracy media en validación). No se han publicado resultados de benchmarks estándar (MMLU, GLUE, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,27 GB solo para pesos (66,9 M de parámetros × 4 bytes), más activaciones; en la práctica cabe holgadamente en 1 GB.
- En FP16: aproximadamente 0,13 GB de pesos; cuantización a INT8 no publicada, pero factible con herramientas estándar de cuantización dinámica de PyTorch.
- GPU recomendadas: ninguna en particular; funciona en cualquier GPU con al menos 1-2 GB de memoria (GTX 1050 Ti, RTX 2060, RTX 3060, RTX 4090, A100, H100). La GPU no es un requisito.
- Cabe en GPU de consumo y también en CPU: es viable la inferencia en un portátil o en un contenedor sin acelerador.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, TorchServe, FastAPI + Uvicorn, ONNX Runtime, o exportación a un contenedor ligero. vLLM, TGI y llama.cpp no son las vías habituales para un encoder de clasificación de este tamaño.
- Latencia y throughput: no se han publicado mediciones. Por el tamaño del modelo, se espera latencia de milisegundos por muestra en CPU moderna y throughput de cientos a miles de muestras por segundo en GPU con batch, pero son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lakeshore Ticket Sorter | 66,9 M | No disponible (base: 512 tokens) | Clasificacion de tickets (fine-tune) | Apache 2.0 | Hugging Face |
| distilbert-base-uncased | 66,4 M | 512 tokens | Modelo base de lenguaje (encoder) | Apache 2.0 | Hugging Face |
| bert-base-uncased | 110 M | 512 tokens | Modelo base de lenguaje (encoder) | Apache 2.0 | Hugging Face |
| TF-IDF + clasificador lineal | No aplica (bolsa de palabras) | No aplica | Clasificacion de texto | Depende de la implementacion | scikit-learn |

Frente a `distilbert-base-uncased` y `bert-base-uncased`, la diferencia es que este modelo ya está ajustado para una tarea concreta, pero con 300 ejemplos y datos sintéticos; los modelos base requerirían su propio fine-tuning con datos reales. Frente al baseline TF-IDF, la mejora medida es modesta (alrededor de 4,6 puntos de accuracy en test), lo que sugiere que en este régimen de datos un enfoque clásico es un competidor serio. No se dispone de comparación con otros clasificadores de tickets publicados.

## Limitaciones y advertencias

- Los datos de entrenamiento son inventados: los mensajes no proceden de tickets reales, por lo que el modelo puede no generalizar a lenguaje real de usuarios.
- El conjunto es muy pequeño (300 ejemplos), lo que aumenta el riesgo de sobreajuste y de varianza alta en las métricas.
- Las puntuaciones publicadas no están calibradas como estimaciones de confianza y no establecen rendimiento en el mundo real; la propia model card lo advierte.
- Los mensajes vagos o con varios temas mezclados pueden ser ambiguos y recibir una cola incorrecta.
- No se enumeran las etiquetas de salida ni los idiomas soportados; el modelo base es de inglés, así que el uso en castellano no está validado.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificación errónea con alta confianza aparente.
- Licencia Apache 2.0: permite uso comercial y modificación, con obligación de conservar el aviso de licencia y de atribución; no hay restricciones adicionales conocidas.
- Para producción se requiere revisión humana (así lo indica el autor), validación con datos reales y, probablemente, reentrenamiento con un conjunto mucho mayor.
- El modelo tiene 0 descargas y 1 like en el momento de la consulta: no hay evidencia de uso en producción ni validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/kawsarbuet/lakeshore-ticket-sorter
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Paper de DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.01108
- Paper de BERT (Devlin et al., 2018): https://arxiv.org/abs/1810.04805
- Documentación de `transformers` para text-classification: https://huggingface.co/docs/transformers/tasks/sequence_classification
- No se han encontrado en la búsqueda web papers, blogs, repositorios ni demos adicionales específicos de este modelo.
