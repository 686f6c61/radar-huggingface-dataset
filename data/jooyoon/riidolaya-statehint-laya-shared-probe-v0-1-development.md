# JooYoon/riidolaya-statehint-laya-shared-probe-v0.1-development

## Resumen

riidolaya-statehint-laya-shared-probe-v0.1-development es una publicación de investigación de JooYoon consistente en una única cabeza supervisada (un *probe* lineal compartido) que se apoya en representaciones congeladas del modelo base Laya de convaiinnovations. No es un modelo de texto autónomo: la cabeza ocupa 4.320 bytes y aprende 1.024 pesos float32 compartidos que, aplicados sobre features ya calculadas, producen un *softmax* sobre ocho intenciones. Para procesar texto nuevo se requiere obligatoriamente el base Laya congelado, cuyo fichero pesa 842.609.210 bytes, además de su pipeline específico de features por opción.

El objetivo declarado es generar pistas opcionales de progreso, informe de finalización y pregunta en prosa de desarrollo acotada. Sin embargo, la propia model card indica que la release falla todos los *gates* de soporte diagnóstico: la cabeza acierta 118/354 filas en el conjunto interno de desarrollo y 92/240 en validación, pero no emite ninguna propuesta tras aplicar los umbrales. La precisión de finalización queda indefinida (no es 0% ni 100%), y no se establece ninguna mejora, selección, promoción ni cualificación de despliegue.

Se trata, por tanto, de un artefacto de investigación con 0 descargas y 0 *likes* en el momento de redactar esta ficha, útil sobre todo para reproducir, auditar y estudiar el contrato de features y el comportamiento de los *gates*, no para uso productivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza/probe lineal compartida sobre features congeladas (no incluye *backbone* ni codificador de texto); base Laya subyacente |
| Parametros totales | Cabeza: 1.024 pesos float32. Base Laya: fichero de 842.609.210 bytes (tamaño declarado; el número de parámetros del base no se especifica) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible. Los pesos de la cabeza son float32; la precisión del modelo base no se indica en la model card |
| Idiomas soportados | Coreano (ko) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Cabeza: RSP v1 (`shared-head.rsp`), 4.096 bytes de pesos + cabecera de 192 bytes + checksum de corrupción de 32 bytes (4.320 bytes totales). Formato del base Laya: no disponible |

## Arquitectura y entrenamiento

La cabeza es un *probe* lineal compartido: para cada una de las ocho opciones calcula `s[i] = dot(w, phi[i])` sobre los 1.024 features de esa opción, aplicando después un *softmax* con temperatura 1 para obtener las ocho probabilidades de intención. El sesgo aditivo compartido se cancela en el *softmax* y queda fijado a cero. No hay ocho vectores de pesos independientes ni codificador de texto dentro de la cabeza. El cargador correcto es `pkg/statehintsharedprobe.Load`; los cargadores RSH (texto) y RSM (MLP) no pueden cargarla. Se inicializa desde cero y se supervisa con etiquetas originales revisadas por IA, sin destilación por pseudonimización de profesor, sin LoRA y sin copiar un delta de la cabeza preentrenada.

Los datos de entrenamiento provienen del corpus original train840, con 1.680 filas KO/EN. Los grupos completos congelados se reparten en 663 familias de ajuste / 1.326 filas y 177 familias internas de desarrollo / 354 filas (155 grupos declarados). La cabeza recibe únicamente las anotaciones de intención esperada del lado de ajuste, verificado contra los mapeos de filas; esas etiquetas son objetivos redactados/revisados por IA, no *gold* humano. El *backbone* nunca recibe las etiquetas esperadas. Hay un único ajuste fijo: 40 épocas, batch 32, tasa de aprendizaje 0,001, AdamW con decaimiento 0,01, semilla 1729, inicialización a cero, temperatura 1 y 1.680 actualizaciones nuevas de la cabeza. No se realizó barrido de tasa de aprendizaje, temperatura ni arquitectura. Las representaciones congeladas siguen usando la instrucción/semántica legacy V1, y los objetivos supervisados V4 no alteran automáticamente esa representación.

Una fila de features es un conjunto de ocho vectores float32 finitos de 1.024 dimensiones cada uno, en *little-endian*, 32.768 bytes en total, en el orden: question, blocker, reference, progress, completion_report, cancel_request, planned, unclear. `ScoreFeatures(*Row, *Workspace)` acepta esos vectores y nunca texto. El checksum del artefacto vincula el contrato esperado y detecta corrupción, pero no autentica al publicador ni prueba el origen de los vectores.

## Capacidades

- Clasificación de ocho intenciones (question, blocker, reference, progress, completion_report, cancel_request, planned, unclear) a partir de vectores de features precalculados.
- Funciona exclusivamente sobre features, no sobre texto: no tokeniza, no codifica ni genera lenguaje.
- Idioma coreano e inglés a nivel de contrato de datos (ambos idiomas fallan los *gates* de soporte de familia y linaje).
- No dispone de *tool calling* ni *function calling*.
- No dispone de soporte de agentes ni de razonamiento multi-paso.
- No dispone de visión, audio ni modo de pensamiento.
- Sin anotación, reacción ni mutación de estado: el paquete solo puntúa.
- Igualdad de bytes verificada: predicciones entrenadas y bytes reserializados coinciden exactamente tras recargar.

## Casos de uso

- Reproducción de la release en investigación: recargar la cabeza con `pkg/statehintsharedprobe.Load`, verificar el SHA256 `bcfe817a...ba5b` y confirmar que los bytes reserializados coinciden con las predicciones, tal como documenta la model card.
- Auditoría del contrato de features: comprobar que un *caller* valida los bytes de origen, el base, la instrucción, el esquema, el orden de opciones y las identidades de fila del *sidecar* antes de invocar `ScoreFeatures(*Row, *Workspace)`.
- Estudio de umbrales y calibración: analizar cómo los *gates* (confianza 0,9; margen 0,05; costes falsos P/C/Q de 1/10/3; cobertura 0,2; soporte 5 familias/2 linajes; precisión de finalización 0,98; coste < 0,375) llevan a cero propuestas tanto en desarrollo como en validación.
- Investigación sobre probes lineales compartidas: comparar un diseño de pesos compartidos frente a alternativas de pesos independientes por clase, usando el NLL de ocho intenciones (1,760635 en desarrollo; 1,626921 en validación) como referencia.
- Comparación de orígenes de representación: contrastar la cabeza nueva (92/240 correctas en validación) con el base preentrenado original (89/240) y con el delta V1 publicado (88/240), ambos con historia de actualizaciones desconocida.
- Diagnóstico de clasificación en prosa de desarrollo acotada: uso previsto de pistas opcionales de progreso/finalización/pregunta, siempre entendiendo que un informe de finalización es una afirmación y no una verificación de éxito ni autoridad para cambiar de tarea.
- Docencia o pruebas de infraestructura de evaluación: usar el artefacto como caso de ejemplo de un sistema que falla sus *gates* por cobertura y soporte, con precisión indefinida en lugar de 0%.

## Benchmarks y rendimiento

Resultados descriptivos publicados en la model card (ambos conjuntos ya expuestos):

| Corpus | Ocho intenciones correctas | Correctas con gate / propuestas | Coste de severidad | NLL ocho intenciones | Precisión de finalización | Gate de familia |
| --- | ---: | ---: | ---: | ---: | --- | --- |
| Internal dev ya expuesto | 118/354 (33,33%) | 0/0 | 0,338983 | 1,760635 | Indefinida | Falla |
| Validación ya expuesta | 92/240 (38,33%) | 0/0 | 0,375000 | 1,626921 | Indefinida | Falla |

Referencias históricas de validación (orígenes distintos):

| Origen | Correctas /240 | Temperatura | Actualizaciones nuevas de cabeza conocidas | Finalización correcta / propuestas |
| --- | ---: | --- | --- | ---: |
| Base preentrenado original | 89 | 1,0000158548355103 | Historia histórica desconocida | 4/4 |
| Delta V1 publicado | 88 | 0,65 | Historia histórica desconocida | 4/4 |
| Nueva cabeza compartida supervisada | 92 | Dato truncado en la model card disponible | 1.680 | No disponible |

En ambos idiomas el soporte de familia y linaje para progreso, finalización y pregunta es cero, por lo que los *gates* de cobertura y soporte fallan y la precisión de finalización no puede calcularse. El coste de validación iguala al comparador de abstención total; la regla exige un coste estrictamente inferior a 0,375. Cero propuestas incorrectas a partir de cero propuestas no constituye una precisión perfecta.

## Requisitos de hardware

- Cabeza: 4.320 bytes, ocupa espacio despreciable en cualquier dispositivo.
- Base Laya: fichero de 842.609.210 bytes (≈843 MB, ≈803 MiB) para los pesos; la model card no confirma precisión ni requisitos de memoria. La memoria asociada a features Go en caché no describe la inferencia sobre texto nuevo.
- VRAM estimada para inferencia: no disponible en la model card. Por tamaño del fichero base, es previsible que quepa en GPU de consumo e incluso en CPU, pero no hay confirmación oficial.
- GPU recomendadas: no disponible.
- ¿Cabe en GPU de consumo?: no confirmado; el tamaño del base lo sugiere, pero la card no lo acredita.
- Opciones de despliegue: carga vía `pkg/statehintsharedprobe.Load` (Go). Los cargadores RSH (texto) y RSM (MLP) no son compatibles. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La model card solo ofrece comparación interna entre orígenes de representación, resumida arriba (base original 89/240, delta V1 88/240, nueva cabeza 92/240). No se aportan comparaciones con modelos de terceros.

| Modelo | Parametros | Contexto | Validación (correctas /240) | Licencia | Disponibilidad |
| --- | --- | --- | ---: | --- | --- |
| Esta cabeza (v0.1 development) | 1.024 pesos float32 | No disponible | 92 | Apache 2.0 | Pública en HuggingFace |
| Base Laya preentrenado original | No disponible | No disponible | 89 | No disponible en la card | Dependencia (convaiinnovations/laya, rev. 55cf4c4e) |
| Delta V1 publicado | No disponible | No disponible | 88 | No disponible en la card | Histórico, no incluido en este paquete |
| Otras alternativas de terceros | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- La release falla todos los *gates* de soporte diagnóstico: cero propuestas *gated* en desarrollo y validación, y precisión de finalización indefinida (no 0% ni 100%).
- No se establece ninguna mejora útil, selección, promoción ni cualificación de despliegue.
- No es un modelo de texto independiente: el texto nuevo exige el base Laya congelado y su pipeline de features por opción.
- El paquete no incluye *backbone*, caché de features, corpus crudo ni predicciones por fila.
- Las etiquetas de ajuste son objetivos redactados/revisados por IA, no *gold* humano.
- Las representaciones congeladas usan semántica legacy V1; los objetivos V4 no cambian esa representación automáticamente.
- El checksum del artefacto detecta corrupción, pero no autentica al publicador ni prueba el origen de los vectores.
- Un informe de finalización es una afirmación, no verificación de trabajo ni autoridad para cambiar de tarea.
- El paquete no realiza anotación, reacción ni mutación de estado.
- Ambos conjuntos de evaluación ya estaban expuestos y el peso de selección es cero; no hubo calibración, test final ni promoción.
- Riesgo de alucinación: no aplica como generador de texto, pero cualquier interpretación de las pistas como estado real del sistema sería incorrecta.
- Sesgos conocidos: no documentados explícitamente; las anotaciones de origen IA pueden introducir sesgos no medidos.
- Licencia Apache 2.0 permite uso comercial del artefacto publicado, pero la model card no acredita aptitud para producción y el modelo base tiene su propia licencia no detallada aquí.

## Enlaces

- HuggingFace: https://huggingface.co/JooYoon/riidolaya-statehint-laya-shared-probe-v0.1-development
- Model card en coreano: README.ko.md (referenciado desde el repositorio de HuggingFace)
- Base Laya (convaiinnovations/laya, revisión 55cf4c4e): https://huggingface.co/convaiinnovations/laya/tree/55cf4c4ebb4ebe31b2550e8bdf3bd21b99753851
- SHA del base declarado: 891102d372688fc2a094dac56a384bc537b87c63f21f9f3dac0be2b7cbc8d86c
- Hash del contrato de instrucción: 255725ec00a4526fefedfad729ddd75acc9681181b81fc0f8f96b89b0a400fd3
- SHA256 de `shared-head.rsp`: bcfe817a17bd6fa1a6fb2cb46272911129140a1a74facc2debd155cc36a3ba5b
- Paper, repositorio, demo o blog adicionales: no disponibles en la información proporcionada
