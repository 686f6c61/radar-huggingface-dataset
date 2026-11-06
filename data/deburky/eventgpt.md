# deburky/EventGPT

## Resumen

EventGPT es un transformer generativo preentrenado para secuencias de eventos bancarios, desarrollado por Denis Burakov (usuario `deburky` en Hugging Face). El modelo lee el historial de transacciones y otros eventos de un cliente, predice el siguiente evento token a token y produce un embedding por cliente y punto temporal. Está preentrenado sobre el dataset público Multimodal Banking Dataset (MBD-mini), que contiene 100.224 clientes, 38,8 millones de transacciones y 66,3 millones de pings de geolocalización.

La arquitectura es jerárquica: un codificador de eventos convierte los tokens de un evento (nombre, tipo, bin de importe, intervalo temporal y otros campos) en un vector; un decodificador causal de historial procesa esos vectores con posiciones rotatorias derivadas del tiempo transcurrido desde el primer evento del cliente; y un decodificador de tokens predice los tokens del siguiente evento a partir del estado del historial. Los pesos publicados tienen 23 millones de parámetros (ancho 384) y se entrenaron sobre 655 millones de tokens.

Su relevancia radica en que aborda el modelado de comportamiento financiero como un problema de predicción del siguiente evento, sin necesidad de etiquetas, y publica una comparación rigurosa contra CatBoost sobre características de ingeniería en las cinco particiones de MBD. El modelo está pensado para reproducir y extender los resultados del artículo sobre MBD, no como un modelo listo para producción en otra entidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer jerárquico (codificador de eventos, decodificador causal de historial con posiciones rotatorias basadas en tiempo, decodificador de tokens) |
| Parametros totales | 23 millones (ancho 384) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventanas de historial; el artículo describe ventanas alineadas y con offsets aleatorios, sin cifra explícita de tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el vocabulario es el esquema de eventos de MBD, no texto libre) |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors (cada variante incluye `model.safetensors`, `config.json` y `vocab.json`) |

## Arquitectura y entrenamiento

El modelo es un transformer jerárquico de 23 millones de parámetros y ancho 384. El codificador de eventos transforma los tokens de un evento individual en un vector; el decodificador causal de historial consume la secuencia de esos vectores aplicando posiciones rotatorias calculadas a partir del tiempo transcurrido desde el primer evento del cliente, de modo que la atención incorpora información temporal real y no solo el orden de la secuencia; finalmente, el decodificador de tokens genera la distribución del siguiente evento token a token. El entrenamiento es de tipo next-event prediction sobre 655 millones de tokens de MBD-mini.

El preentrenamiento usa los eventos de los clientes de preentrenamiento de 2021 y 2022. Existen variantes con ventanas alineadas y con offsets aleatorios, variantes con fusión temprana de los campos de perfil del cliente, y una variante `trx-oot` entrenada solo con transacciones anteriores a febrero de 2022 para evaluar el efecto de la fuga temporal. Los pesos publicados se preentrenaron dejando fuera la partición 0 (fold 0); los modelos de las otras cuatro particiones descritas en el artículo no se publican. No se documenta en la información disponible el uso de RLHF, DPO ni fases de ajuste por preferencias.

## Capacidades

- Predicción del siguiente evento en secuencias de eventos bancarios, token a token, a partir del historial del cliente.
- Generación de un embedding por cliente y punto temporal, utilizable con una cabeza logística congelada para tareas de clasificación posteriores.
- Modelado conjunto de transacciones y pings de geolocalización en las variantes `aligned` y `aligned-profile`.
- Fusión temprana de los campos de perfil del cliente en las variantes `aligned-profile`.
- Puntuación zero-shot de la distribución del siguiente evento sin etiquetas (objetivos del tipo "primera transacción de un tipo el próximo mes").
- Modelado de secuencias temporales con posiciones rotatorias basadas en tiempo transcurrido, no solo en el orden de los eventos.
- No soporta tool calling, function calling, agentes, razonamiento multi-step en lenguaje natural ni capacidades multimodales de visión o audio.

## Casos de uso

- Puntuación zero-shot de propensión a contratar productos: usando `egpt zero-shot`, la distribución del siguiente evento permite puntuar objetivos como "primera transacción de un tipo el próximo mes" con ROC-AUC de 0,78 a 0,91 sin etiquetas, lo que sirve para priorizar campañas antes de tener datos supervisados.
- Embeddings de cliente para modelos supervisados: `egpt probe` genera embeddings congelados que alimentan una regresión logística; en MBD alcanza un ROC-AUC medio oficial de 0,786 a 0,807 según la variante, útil como base para modelos de scoring internos.
- Enriquecimiento de modelos tabulares existentes: el embedding de EventGPT se puede combinar en un ensemble por rango con características de ingeniería y recuentos de tokens, alcanzando 0,830 en la partición 0 y 0,824 de media en las cinco particiones, lo que mejora un pipeline de CatBoost ya desplegado.
- Detección temprana de cambios de comportamiento: al modelar la secuencia completa de eventos con intervalos temporales reales, el modelo puede señalar desviaciones en la distribución del siguiente evento de un cliente, lo que apoya tareas de seguimiento de riesgo o de fidelización.
- Investigación y reproducción de resultados: los pesos permiten reproducir las cifras del artículo sobre MBD-mini y extender el estudio con nuevas variantes de tokenización o de fusión de perfil, dado que el código y el CLI `egpt` están publicados.
- Prototipado de modelos fundacionales sobre datos propios: aunque el vocabulario es específico de MBD, la arquitectura y el código sirven de plantilla para preentrenar un modelo equivalente sobre el esquema de eventos de otra entidad, con su propia tokenización y su propio preentrenamiento.
- Evaluación de fuga temporal en pipelines de ML: la variante `trx-oot` permite medir cuánto baja el rendimiento al restringir el preentrenamiento a transacciones anteriores a febrero de 2022 (entre 0,004 y 0,006 en la media oficial), lo que ayuda a diseñar validaciones temporales más realistas.

## Benchmarks y rendimiento

Media oficial de ROC-AUC sobre los cuatro objetivos de producto de MBD en la partición de test 0, con cabeza logística sobre el embedding congelado:

| Modelo / variante | ROC-AUC medio (test fold 0) |
|---|---|
| EventGPT `aligned-s42` | 0,786 |
| EventGPT `aligned-s43` | 0,788 |
| EventGPT `aligned-profile-s42` | 0,803 |
| EventGPT `aligned-profile-s43` | 0,807 |
| EventGPT `trx-s42` | 0,794 |
| EventGPT `trx-s43` | 0,791 |
| EventGPT `trx-oot-s42` | 0,790 |
| EventGPT `trx-oot-s43` | 0,788 |
| CatBoost sobre características de ingeniería | 0,816 |
| CatBoost sobre recuentos de tokens del historial completo | 0,803 |
| Ensemble por rango de EventGPT (con fusión tardía de perfil y recuentos de tokens) y características de ingeniería | 0,830 |

Resultados medios sobre las cinco particiones de MBD, con un modelo preentrenado por partición:

| Modelo | ROC-AUC medio (5 folds) |
|---|---|
| Embedding EventGPT | 0,787 |
| Embedding EventGPT con perfil y recuentos de tokens | 0,804 |
| CatBoost sobre características de ingeniería | 0,808 |
| Ensemble | 0,824 |

Puntuación zero-shot (sin etiquetas) sobre cinco objetivos de "primera transacción de un tipo el próximo mes", variantes `aligned`, media de dos semillas: ROC-AUC entre 0,78 y 0,91.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 23 millones de parámetros, los pesos en precisión completa ocupan aproximadamente 0,09 GB, y el repositorio completo (ocho variantes más vocabularios) ocupa 0,7 GB.
- GPU recomendadas: no disponible; por tamaño, el modelo cabe holgadamente en cualquier GPU consumer moderna, pero la información proporcionada no especifica requisitos ni GPU probadas.
- Cabe en GPU consumer: sí, por el tamaño del modelo (23 millones de parámetros), aunque no se documentan pruebas concretas.
- Opciones de despliegue: el paquete propio `eventgpt` con la función `from_pretrained` y el CLI `egpt` (comandos `prepare`, `probe`, `zero-shot`); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | ROC-AUC medio (fold 0) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EventGPT | 23 M | no disponible | 0,786 a 0,807 según variante | CC BY 4.0 | Pesos en Hugging Face (fold 0) |
| CatBoost sobre características de ingeniería | no disponible | no aplica | 0,816 | no disponible | Referencia del artículo |
| CatBoost sobre recuentos de tokens | no disponible | no aplica | 0,803 | no disponible | Referencia del artículo |
| Ensemble EventGPT + características de ingeniería | 23 M + CatBoost | no aplica | 0,830 | CC BY 4.0 (parte EventGPT) | Reconstruible con los pesos publicados |

No se dispone en la información proporcionada de otros modelos fundacionales de secuencias de eventos bancarios con los que comparar parámetros, contexto o licencia.

## Limitaciones y advertencias

- El vocabulario es el esquema de eventos de MBD; los eventos de otra institución requieren su propia tokenización y su propio preentrenamiento. Los pesos sirven para reproducir y extender los resultados del artículo sobre MBD, no para aplicarlos directamente a otra entidad.
- Los modelos se preentrenaron con eventos de 2021 y 2022 de los clientes de preentrenamiento, que incluyen los meses en los que caen las etiquetas de los clientes de test (nunca los propios clientes de test); existe por tanto una posible fuga temporal, mitigada parcialmente por la variante `trx-oot`, que reduce la media oficial entre 0,004 y 0,006.
- Los pesos publicados corresponden al fold 0 dejado fuera; los modelos de las otras cuatro particiones de test no se publican, lo que limita la reproducibilidad completa del artículo.
- El embedding por sí solo queda por debajo de CatBoost sobre características de ingeniería (0,787 frente a 0,808 de media en cinco particiones); su valor principal aparece en el ensemble (0,824).
- No hay información sobre sesgos demográficos o de comportamiento, ni sobre calibración de las probabilidades, ni sobre estabilidad en producción.
- Riesgo de alucinación en el sentido generativo: el modelo produce distribuciones sobre tokens de eventos; una predicción del siguiente evento no es una observación real y no debe interpretarse como tal.
- No se documentan limitaciones de idioma porque el modelo no opera sobre texto libre, sino sobre un esquema de eventos.
- La licencia CC BY 4.0 permite uso comercial con atribución, pero está heredada de MBD-mini; conviene revisar las condiciones del dataset original y citar tanto el artículo como MBD (Mollaev et al., 2024).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/deburky/EventGPT
- Artículo: https://arxiv.org/abs/2611.03302
- Código: https://github.com/deburky/EventGPT
- Dataset de preentrenamiento: ai-lab/MBD-mini (referenciado en la model card; no se proporciona URL directa)
- Cita de MBD: Mollaev et al., 2024 (referenciada en la model card; no se proporciona URL directa)
