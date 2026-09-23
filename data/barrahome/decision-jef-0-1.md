# BarraHome/Decision-Jef-0.1

## Resumen

Decision-Jef-0.1 es un modelo de clasificación de texto de 307.336.448 parámetros publicado por el usuario BarraHome (Alberto Ferrer) en HuggingFace, con licencia MIT y pipeline `text-classification`. Es un fine-tune del encoder multilingüe `jhu-clsp/mmBERT-base`, de la familia ModernBERT, y pertenece a la línea de modelos "System One" de decisiones tipadas que el autor asocia a Jev AI / TypeSafe AI. Su función no es generar texto, sino responder varias preguntas definidas en tiempo de ejecución sobre un mismo estado de entrada en una sola pasada hacia delante, devolviendo una distribución de probabilidad sobre exactamente las opciones que el usuario proporciona.

La diferencia técnica clave frente a un clasificador convencional es que no existe una cabeza de clasificación sobre un conjunto fijo de etiquetas: el espacio de respuesta se construye a partir de la petición, de modo que un valor que no se ha ofrecido no es representable, no solo improbable. El modelo maneja tres tipos de decisión en el conjunto de evaluación publicado (`choice`, `noul` y `score`) y reporta una latencia de 12,2 ms para tres decisiones en una única pasada, además de un error de calibración esperado (ECE) de 0,043 tal cual se distribuye, con temperaturas por cubeta que vienen incluidas pero desactivadas por defecto.

Su relevancia actual está en los pipelines de agentes: enrutado, guardrails, moderación y puntuación de estados donde se necesita una decisión repetible, multilingüe y con confianza calibrada, más que creatividad textual. El modelo se distribuye con pesos en safetensors (repositorio de 6,2 GB) y acumula 56 descargas y 1 "me gusta" en el momento de redactar esta ficha, por lo que la validación independiente es todavía muy escasa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT), fine-tune de `jhu-clsp/mmBERT-base` |
| Parámetros totales | 307.336.448 (≈307 M) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible en la información publicada (pesos distribuidos en safetensors; el repositorio ocupa 6,2 GB) |
| Idiomas soportados | Multilingüe (la ficha no desglosa la lista de idiomas ni los volúmenes por idioma) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tarea (pipeline) | `text-classification` |
| Modelo base | `jhu-clsp/mmBERT-base` (relación: finetune) |
| Tipos de decisión | `choice`, `noul`, `score` |
| Latencia publicada | 12,2 ms para tres decisiones en una pasada |
| Calibración publicada | ECE 0,043 (10 bins) tal cual se distribuye; 0,008 con temperaturas por cubeta activadas |
| Inferencia alojada en el Hub | Desactivada (`inference: false` en los metadatos de la model card) |
| Descargas / likes | 56 / 1 |
| Fechas de la ficha | Creado el 2026-09-21, actualizado el 2026-09-23 |

## Arquitectura y entrenamiento

El modelo es un encoder Transformer de la familia ModernBERT, obtenido por ajuste fino del checkpoint multilingüe `jhu-clsp/mmBERT-base` del JHU CLSP. La información publicada no detalla el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO; tampoco se especifica la longitud de contexto soportada ni la estrategia de tokenización. Lo que sí se documenta es la innovación central del diseño: la sustitución de la cabeza de clasificación de cardinalidad fija por un mecanismo que construye el espacio de respuesta a partir de la petición, de forma que el modelo solo puede asignar probabilidad a las opciones suministradas en cada llamada.

El autor reporta además dos elementos técnicos destacables. El primero es la inclusión de un escalado de temperatura ajustado por cubetas de (tipo de decisión, cardinalidad), que se distribuye con el modelo pero está desactivado por defecto; con temperaturas el ECE baja de 0,043 a 0,008, mientras el Brier sumado sube de 0,083 a 0,108 y el MAE de `score` de 0,244 a 0,263, porque las temperaturas ajustadas afinan la distribución (0,789 en global) y eso favorece la coincidencia entre confianza declarada y tasa de acierto a costa de la coincidencia con el promedio de anotadores. El segundo es la verificación de honestidad probabilística contra un generador con posterior conocida por construcción: con un departamento señalado el modelo devuelve 1,000 frente a una verdad de 1,00, con dos departamentos señalados devuelve 0,552 frente a 0,50, y en un caso de escalado con verdad 0,90 devuelve 0,912. No se documenta ningún mecanismo de decodificación especulativa ni de atención lineal.

## Capacidades

- Clasificación con etiquetas definidas en tiempo de ejecución: el espacio de respuesta se construye desde la petición, sin cabeza sobre un conjunto fijo de etiquetas.
- Decisión de tipo `choice`: selección entre opciones suministradas en la llamada (el significado exacto de la abreviatura `noul` no se explicita en la información disponible).
- Decisión de tipo `noul`: tercer tipo de decisión evaluado en el conjunto tipado del autor; su semántica no se detalla en la model card.
- Decisión de tipo `score`: asignación de una puntuación, con un MAE publicado de 0,244 sobre el conjunto de prueba.
- Probabilidades calibradas: ECE de 0,043 con 10 bins tal cual se distribuye, dentro de un criterio de 0,10 sin corrección post hoc.
- Robustez al orden de las opciones: sobre 1.800 permutaciones de las preguntas de tipo `choice`, la respuesta cambia en el 5,7 % de los casos, frente a 0,13 de Jev y 0,15 de Laya en la misma comprobación.
- Multilingüismo heredado del modelo base, sin desglose de idiomas publicado.
- Recuperación de la posterior verdadera en escenarios sintéticos con verdad conocida (masa completa sobre los departamentos permitidos).
- Routing, guardrails, moderación y scoring: son los casos de uso declarados por el autor mediante las etiquetas del repositorio.
- Tool calling / function calling: no disponible en la información publicada.
- Soporte de agentes multi-paso: no se documenta como capacidad propia; el modelo está pensado para ser consumido dentro de pipelines de agentes.
- Generación de texto libre, visión, audio y modo "thinking": no soportados (no es un modelo generativo).

## Casos de uso

- Enrutado de tickets de soporte: el modelo puede recibir el texto del ticket y una lista de departamentos candidatos definida por el sistema en cada llamada, devolviendo una distribución de probabilidad sobre esos departamentos. Su ventaja aquí es la calibración: en el test sintético del autor con un solo departamento señalado devuelve 1,000 y con dos devuelve 0,552, es decir, señala incertidumbre cuando la hay en lugar de forzar una etiqueta.
- Guardrails de entrada en agentes: antes de ejecutar una acción, se le pasa el estado de la conversación y un conjunto de opciones del tipo "permitir", "bloquear", "escalar" definidas por la aplicación, con la garantía de que ninguna categoría fuera de esa lista puede ser devuelta porque no es representable en el espacio de respuesta.
- Moderación de contenido: clasificación de textos contra políticas definidas por el despliegue, con la ventaja de que las categorías pueden cambiar entre llamadas sin reentrenar ni recompilar el modelo, y con ECE de 0,043 para fijar umbrales de revisión humana.
- Puntuación y priorización: uso del tipo `score` para asignar un valor numérico a un estado (por ejemplo, prioridad de una incidencia), con un MAE publicado de 0,244 sobre 800 decisiones de ese tipo, adecuado para ordenar colas más que para decisiones binarias críticas.
- Clasificación multilingüe en producción: al derivar de `mmBERT-base`, el modelo puede aplicarse a tráfico en varios idiomas con un único artefacto; conviene validar por idioma porque la ficha no publica métricas desglosadas.
- Enrutado de bajo coste y alta frecuencia: 12,2 ms para tres decisiones en una pasada permite insertar el modelo como primer escalón de un pipeline, filtrando o etiquetando antes de invocar un modelo generativo grande.
- Etiquetado asistido y auditoría de datasets: las probabilidades calibradas y la recuperación de la posterior en casos con verdad conocida lo hacen utilizable para preanotar datos de clasificación con un indicador de confianza por muestra.
- Decisión con escalado a humano: al estar el ECE en 0,043, el valor de confianza devuelto puede usarse directamente como criterio de derivación a revisión manual sin recalibración post hoc.

## Benchmarks y rendimiento

Conjunto de prueba de decisiones tipadas: 2.000 decisiones (600 `choice`, 600 `noul`, 800 `score`). Mismo conjunto y misma partición que los modelos publicados con los que se compara. Cifras tal cual se distribuyen, sin temperatura aplicada.

| Modelo | Global | choice | noul | score |
|---|---|---|---|---|
| Decision-1.0-Lex | **78,15** | 74,00 | 84,67 | **76,38** |
| **Decision-Jef-0.1** | 77,80 | **75,00** | 84,80 | 74,60 |
| Laya Typed Decisions | 76,60 | 73,33 | **85,67** | 72,25 |

Métricas probabilísticas sobre el mismo conjunto de evaluación:

| Métrica | Decision-Jef-0.1 | Laya | Jev |
|---|---|---|---|
| Soft accuracy | **0,607** | 0,471 | 0,580 |
| Brier, sumado sobre clases | **0,083** | 0,061 † | 0,148 |
| ECE, 10 bins | **0,043** | 0,213 | 0,144 |
| MAE de `score` | **0,244** | 0,242 | 0,391 |

Referencias del conjunto: clase mayoritaria 0,457; respuesta aleatoria 0,318.

† El autor advierte de una discrepancia de convenciones: Laya publica 0,061 promediado por clase y atribuye 0,148 a Jev sumado sobre clases, lo que aparenta una diferencia de 2,4x y en realidad es un desajuste de unidades. La cifra de 0,083 de esta ficha está sumada, igual que la de 0,148, por lo que es comparable con Jev y no con Laya.

Robustez al orden de las opciones y calibración:

| Medición | Valor nativo | Opciones permutadas | Cambio |
|---|---|---|---|
| Global | 77,80 | 77,70 | +0,10 |
| choice | 75,00 | 74,67 | +0,33 |
| noul | 84,80 | 84,80 | 0,00 |
| score | 74,60 | 74,60 | 0,00 |

| Configuración | ECE (10 bins) | Brier sumado | MAE de `score` | Exactitud global |
|---|---|---|---|---|
| Tal cual se distribuye | 0,043 | **0,083** | **0,244** | 77,80 |
| Con temperaturas por cubeta | **0,008** | 0,108 | 0,263 | 77,75 |

Comprobación de honestidad probabilística contra un generador con posterior conocida por construcción:

| Caso | Verdad | Decision-Jef-0.1 |
|---|---|---|
| Un departamento señalado | 1,00 | 1,000 |
| Dos departamentos señalados | 0,50 | 0,552 |
| Escalado implicado por prioridad | 0,90 | 0,912 |
| Masa sobre los dos departamentos señalados | 1,00 | 1,000 |

Distribución de la posición de la respuesta correcta en el benchmark (las preguntas tienen cuatro o cinco opciones, por lo que una extracción uniforme daría un 23,3 % por ranura):

| Ranura | Proporción de respuestas correctas | Frente a uniforme |
|---|---|---|
| 1.ª | 20,7 % | 0,89x |
| 2.ª | 20,2 % | 0,86x |
| **3.ª** | **39,7 %** | **1,70x** |
| 4.ª | 12,2 % | 0,52x |
| 5.ª | 7,3 % | 0,31x |

## Requisitos de hardware

- VRAM estimada para los pesos (cálculo a partir del recuento de parámetros publicado, no dato del autor): ≈0,61 GB en fp16/bf16, ≈1,23 GB en fp32, ≈0,31 GB en int8 y ≈0,15 GB en int4. Hay que sumar el espacio de activaciones y del runtime, que no se documenta.
- El repositorio ocupa 6,2 GB, muy por encima de los ≈0,61 GB que ocuparían los pesos en fp16, lo que sugiere varios puntos de control u otros artefactos no detallados en la información disponible.
- GPU recomendadas por el autor: no disponibles. Por tamaño, cualquier GPU con al menos 2 GB de VRAM libre debería poder ejecutar los pesos en fp16, incluidas tarjetas de consumo como las series RTX 30/40; no hay confirmación publicada de ello.
- Hardware empleado para la medición de 12,2 ms: no disponible, por lo que la latencia no es directamente extrapolable a otros equipos.
- Opciones de despliegue: la información disponible solo confirma el pipeline `text-classification` y la distribución en safetensors. No se documenta soporte explícito de vLLM, llama.cpp, Ollama o TGI, ni la existencia de conversiones GGUF. Los metadatos de la model card marcan `inference: false`, es decir, el widget de inferencia del Hub está desactivado.
- Throughput estimado: no disponible. Como referencia publicada, 12,2 ms para tres decisiones en una única pasada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Global (tipado) | ECE (10 bins) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| **Decision-Jef-0.1** | 307.336.448 | no disponible | 77,80 | 0,043 | MIT | HuggingFace, repo de 6,2 GB, 56 descargas |
| Decision-1.0-Lex | no disponible | no disponible | **78,15** | no disponible | no disponible | publicado según el autor; referencia del benchmark |
| Laya Typed Decisions | no disponible | no disponible | 76,60 | 0,213 | no disponible | publicado según el autor |
| Jev | no disponible | no disponible | no disponible | 0,144 | no disponible | servicio de TypeSafe AI (jevai.net, jevtypesafe.org), según la búsqueda web |

Frente a Lex, Decision-Jef-0.1 gana en `choice` (75,00 frente a 74,00) y queda 0,35 por detrás en el global, con el déficit concentrado en `score` (74,60 frente a 76,38). Frente a Laya, gana en global, en `choice` y en todas las métricas probabilísticas publicadas (soft accuracy 0,607 frente a 0,471; ECE 0,043 frente a 0,213), y pierde 0,87 en `noul`. No se dispone de datos de parámetros, contexto ni licencia de los modelos comparados.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre ni mantiene conversaciones; solo devuelve una distribución sobre opciones suministradas.
- Inferioridad declarada por el propio autor en dos subconjuntos: 0,87 puntos por detrás de Laya en `noul` y 1,78 por detrás de Lex en `score`.
- El trade-off de calibración es real: activar las temperaturas mejora el ECE de 0,043 a 0,008 pero empeora el Brier sumado de 0,083 a 0,108 y el MAE de `score` de 0,244 a 0,263. Se recomienda dejarlas desactivadas salvo necesidad explícita de que la confianza siga la tasa de acierto, y en ese caso ajustarlas con datos propios.
- El benchmark de referencia no es neutral en cuanto al orden: el 39,7 % de las respuestas correctas de tipo `choice` ocupan la tercera ranura (1,70x sobre una extracción uniforme), de modo que un modelo podría puntuar alto aprendiendo a responder tercero. Este modelo no lo hace (cambio de +0,10 al permutar, 5,7 % de respuestas alteradas en 1.800 permutaciones), pero conviene tenerlo en cuenta al interpretar cifras de terceros.
- La comprobación de honestidad probabilística se hace contra un generador sintético con verdad conocida por construcción y la publica el propio autor; no es evidencia de comportamiento en datos reales.
- Idiomas: se declara multilingüe, pero no hay desglose por idioma ni métricas por lengua, así que el rendimiento fuera de los idiomas cubiertos por `mmBERT-base` es desconocido.
- Longitud de contexto: no publicada, lo que impide planificar el truncamiento de entradas largas.
- Riesgo de alucinación: por diseño, un valor no ofrecido no es representable en la salida, lo que acota el problema en el espacio de etiquetas, pero no dice nada sobre si la decisión es correcta para el estado de entrada.
- Adopción muy baja (56 descargas, 1 like) y ausencia de validación independiente; el modelo se apoya en comparaciones publicadas por el propio autor.
- Metadatos a verificar: la ficha indica fechas de creación y actualización de 2026-09-21 y 2026-09-23, y el repositorio tiene el widget de inferencia desactivado (`inference: false`).
- Licencia MIT: permite uso comercial y modificación, siempre que se conserve el aviso de copyright y de licencia. No se especifican restricciones adicionales por parte del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BarraHome/Decision-Jef-0.1
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-base
- Paquete en PyPI: https://pypi.org/project/decision-jef/
- Repositorio en GitHub: https://github.com/bet0x/decision-jef
- Perfil del autor en HuggingFace: https://huggingface.co/BarraHome/models
- Jev AI: https://jevai.net/
- Jev / TypeSafe AI System One Model: https://jevtypesafe.org/
