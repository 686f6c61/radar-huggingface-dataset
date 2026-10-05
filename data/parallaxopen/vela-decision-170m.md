# ParallaxOpen/Vela-Decision-170M

## Resumen

Vela-Decision-170M es un modelo de decisión calibrado de ParallaxOpen, publicado bajo licencia Apache 2.0. Responde preguntas tipadas de conjunto cerrado sobre un estado (texto, correo, ticket o JSON) y devuelve una distribución de probabilidad sobre las opciones, sin generar texto libre. Cubre tres tipos de pregunta: `choice` (elección entre opciones), `noul` (ausencia de opción válida) y `score` (puntuación ordinal).

Con 170.569.738 parámetros, su arquitectura es un encoder SmallLM causal de 12 capas, d=1024, GQA 16/4 y RoPE (156,92 M), rematado por una cabeza transformer de una sola capa (13,65 M) con scorer por marcador de opción, prior aprendido por slot y una parametrización monotónica cumulative-link para preguntas ordinales.

Su interés práctico no está en la precisión bruta, sino en el binomio calibración-eficiencia frente a `convaiinnovations/laya` (checkpoint `typed-decisions`, 421,3 M): obtiene un ECE de 0,0377 sin ningún ajuste de temperatura, frente a 0,2060 de la baseline, consume 125 tokens por decisión frente a 768 y ocupa 1,06 GB de VRAM pico frente a 2,55 GB. A cambio, pierde en accuracy (0,5940 frente a 0,7630), Brier, NLL y macro F1, algo que el propio autor documenta de forma explícita.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder SmallLM causal (12 capas, d=1024, GQA 16/4, RoPE) más cabeza transformer de 1 capa |
| Parámetros totales | 170.569.738 |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (requiere `custom_code`) |
| Parámetros del encoder | 156,92 M |
| Parámetros de la cabeza | 13,65 M |
| Tamaño del repositorio | 0,7 GB |
| Pipeline declarado | text-classification |
| Idiomas soportados | no disponible |

## Arquitectura y entrenamiento

El modelo es un encoder causal de 12 capas con dimensión oculta 1024, atención GQA con 16 cabezas de consulta y 4 de clave/valor, y embeddings rotatorios (RoPE). Sobre él se apila una única capa transformer (13,65 M) que implementa cuatro componentes: un scorer por marcador de opción (cada `[MASK]` de cada opción se puntúa y se normaliza con softmax dentro de su propia pregunta), un prior aprendido por slot de opción, una parametrización cumulative-link monotónica para preguntas ordinales y una cabeza `act`/escalate ajustada a posteriori. El estado se codifica una sola vez por caso y todas las preguntas se empaquetan a continuación, registrando la posición del marcador de cada opción; esto reduce el consumo a 6,1 veces menos tokens por decisión que la baseline y baja la latencia por decisión de 20,1 ms a 9,4 ms en el mismo hardware.

El autor señala dos decisiones de diseño deliberadas. La primera es mantener atención causal en lugar de bidireccional: cambiar a bidireccional saca cada capa de distribución desde el paso 0 y la validación queda por detrás en todas las épocas salvo la primera, con 0,158 de desventaja en la época 4. La segunda es el empaquetado descrito arriba. En cuanto al entrenamiento, el modelo no usa RL ni búsqueda de política: regresa directamente sobre una distribución soft de profesor incluida en el gold del benchmark mediante una regla de puntuación estrictamente propia (entropía cruzada, más ranked probability score para las preguntas ordinales). Eso elimina la varianza de gradiente de un enfoque de policy-gradient y explica que el ECE bruto quede por debajo del 0,081 que logra la baseline tras ajuste de temperatura. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Decisión tipada de conjunto cerrado: responde preguntas `choice`, `noul` y ordinales `score` devolviendo una distribución de probabilidad, no texto.
- Calibración nativa: ECE de 0,0377 con 15 bins y sin ajuste de temperatura, lo que permite interpretar la probabilidad como confianza utilizable.
- Puntuación ordinal: la parametrización cumulative-link monotónica produce scores ordenados, no clases independientes.
- Cabeza act/escalate: estima si un caso se responderá correctamente (AUROC 0,615 en 300 casos reservados) y permite umbralizar la abstención.
- Precisión selectiva monótona: responder solo el 50% de casos con mayor confianza eleva la tasa de completamente correctos de 0,333 a 0,387.
- Enrutamiento de herramientas: la etiqueta `tool-routing` del repositorio apunta a selección de herramienta dentro de un conjunto predefinido.
- Procesamiento empaquetado: codifica el estado una vez por caso y agrupa todas sus preguntas, con 125 tokens por decisión.
- Multilingüismo: no disponible; no se declaran idiomas soportados.
- Tool calling y function calling en formato generativo: no soportado, el modelo no genera texto ni llamadas.
- Capacidades de agente multi-paso: no soportadas de forma nativa; su papel es el de componente de decisión.

## Casos de uso

- Enrutamiento de herramientas en agentes: dado un estado y un catálogo cerrado de herramientas, el modelo devuelve la distribución sobre la opción elegida; con 9,4 ms por decisión y 125 tokens, es viable ejecutar el enrutado en cada turno de un bucle de agente sin dominar el coste de latencia.
- Triaje de tickets de soporte: clasificación en categorías y asignación de severidad ordinal sobre el texto del ticket, usando el ECE de 0,0377 para ordenar la cola por confianza en lugar de por orden de llegada.
- Puertas de escalado a humano: la cabeza `act` con AUROC 0,615 permite derivar a un operador los casos con menor probabilidad de acierto; responder solo el 50% más seguro mejora la tasa de respuestas totalmente correctas.
- Clasificación con esquema restringido: sobre un conjunto de opciones definido por la aplicación (por ejemplo, un JSON schema de categorías), el modelo no puede inventar etiquetas fuera del conjunto, a diferencia de un modelo generativo.
- Priorización ordinal en colas de trabajo: para puntuaciones ordenadas (urgencia, riesgo, calidad), la parametrización cumulative-link devuelve un score ordinal calibrado que puede usarse directamente como criterio de ordenación.
- Filtrado de casos sin opción válida: la pregunta `noul` permite detectar entradas que no encajan en ninguna categoría del esquema, útil como guardarraíl previo a un clasificador o a un agente.
- Etiquetado masivo de bajo coste: con 1,06 GB de VRAM pico y 0,7 GB de pesos, se puede desplegar en una GPU de consumo para clasificar grandes volúmenes de correos, tickets o registros JSON.
- Componente de decisión en arquitecturas que separan razonamiento y acción: encaja como proceso de decisión independiente y sin capacidad de ejecución, en la línea del paradigma descrito en los repositorios de OpenParallax.

## Benchmarks y rendimiento

Medido por el autor sobre las mismas 2.000 decisiones de test, con el mismo código de métrica, en una RTX 5060 Laptop, frente a `convaiinnovations/laya` (checkpoint `typed-decisions`, 421,3 M).

| Métrica | Vela-Decision-170M | laya-typed-decisions | Ganador |
|---|---|---|---|
| Accuracy | 0,5940 | 0,7630 | laya |
| Brier | 0,5144 | 0,3982 | laya |
| NLL | 0,8758 | 0,7051 | laya |
| Macro F1 | 0,5383 | 0,7482 | laya |
| acc@50% coverage | 0,7110 | 0,8920 | laya |
| ECE (15 bins, sin ajuste) | 0,0377 | 0,2060 | Vela (5,5x mejor) |
| Latencia, 5 decisiones | 46,8 ms | 100,5 ms | Vela (2,1x más rápido) |
| VRAM pico | 1,06 GB | 2,55 GB | Vela (2,4x menor) |
| Tokens por decisión | 125 | 768 | Vela (6,1x menos) |
| Parámetros | 170,6 M | 421,3 M | Vela (2,5x menor) |

Resultados adicionales de la cabeza act/escalate sobre 300 casos reservados:

| Métrica | Valor |
|---|---|
| AUROC frente a "respondido enteramente bien" | 0,615 |
| Exactitud totalmente correcta, top 50% de confianza | 0,387 |
| Exactitud totalmente correcta, global | 0,333 |
| `act_probability` de la baseline | 1,0000 constante (media 1,0000, desviación 0,0000, un único valor) |

Advertencias del propio autor sobre la comparación: dos cifras publicadas de la baseline no se reproducen con el código de métricas de su propio repositorio (Brier medido 0,3982 frente a 0,062 publicado; MAE de score 0,0784 frente a 0,242 publicado), mientras que accuracy (0,763 frente a 0,766), ECE (0,206 frente a 0,213) y soft accuracy (0,4712 frente a 0,471) sí se reproducen. La comparación se hizo con un único split 90/10 y la dispersión entre folds de esta tarea es de 0,0965, por lo que cada cifra individual lleva aproximadamente ±0,05 de incertidumbre. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM pico medida por el autor: 1,06 GB procesando 5 decisiones, en una RTX 5060 Laptop.
- Estimación aritmética a partir de los 170,57 M de parámetros: unos 0,68 GB de pesos en fp32 y unos 0,34 GB en fp16, sin contar activaciones ni overhead del runtime.
- GPU de referencia de la medición: RTX 5060 Laptop. Cabe en GPUs de consumo con al menos 2 GB de VRAM libre según la medición publicada.
- GPUs de gama alta (A100, H100) no aportan datos de rendimiento en la información disponible; el modelo es lo bastante pequeño como para no necesitarlas.
- Opciones de despliegue confirmadas: `transformers` con `custom_code`, según los metadatos del repositorio. vLLM, llama.cpp, Ollama y TGI no están confirmados en la información disponible.
- Latencia: 46,8 ms para 5 decisiones, es decir 9,4 ms por decisión, frente a 20,1 ms por decisión de la baseline en el mismo hardware.
- Throughput derivado de esa medición: aproximadamente 107 decisiones por segundo con lotes de 5 en la configuración medida.
- Cuantizaciones disponibles: no disponible; el repositorio solo publica safetensors.

## Comparativa con modelos similares

Solo se proporciona una alternativa comparable en la información disponible.

| Modelo | Parámetros | Contexto | Accuracy | ECE (15 bins) | Latencia 5 decisiones | VRAM pico | Tokens por decisión | Licencia |
|---|---|---|---|---|---|---|---|---|
| Vela-Decision-170M | 170,6 M | no disponible | 0,5940 | 0,0377 | 46,8 ms | 1,06 GB | 125 | apache-2.0 |
| convaiinnovations/laya (`typed-decisions`) | 421,3 M | no disponible | 0,7630 | 0,2060 | 100,5 ms | 2,55 GB | 768 | no disponible |

No se han encontrado en la información proporcionada otros modelos de decisión tipada comparables, por lo que la comparativa se limita a esta pareja.

## Limitaciones y advertencias

- No es más preciso que la baseline: queda 0,169 por detrás en accuracy y por detrás en Brier, NLL, macro F1 y precisión selectiva. Si el requisito es accuracy bruta sobre preguntas multiopción, el autor recomienda usar laya.
- La comparación usa un único split 90/10; la dispersión entre folds de la tarea es 0,0965, lo que implica del orden de ±0,05 de incertidumbre en cada cifra individual.
- Un ECE bajo por sí solo no es una garantía de calidad: un predictor casi uniforme puntúa bien en ECE siendo inútil, motivo por el que el autor publica también accuracy, Brier, NLL y cobertura.
- Dos métricas publicadas de la baseline (Brier y MAE de score) no se reproducen con el código del propio repositorio de la baseline, de modo que no son comparables; el autor no reclama victoria en ninguna de las dos.
- La cabeza `act` ajustada vive en `act_head.pt`. Sin ese fichero, el `act_out` integrado en el modelo es una constante inicializada a cero y no aporta señal.
- Bug documentado y relevante para adaptaciones: agrupar la cabeza `act` desde la posición 0 de la secuencia da AUROC exactamente 0,500, porque en un encoder causal la posición 0 solo se atiende a sí misma. Hay que agrupar desde una posición tardía, como el marcador final de opción, para recuperar el 0,615.
- El modelo no genera texto y no debe usarse para generación abierta ni como sustituto de un clasificador de mayor precisión.
- No se declaran idiomas soportados ni se aportan evidencias multilingües; el comportamiento fuera del inglés es desconocido.
- No se publican tipos de cuantización, lo que limita el despliegue en entornos con restricciones de memoria muy ajustadas.
- El repositorio registra 0 descargas y 0 likes, y las fechas de creación y actualización son de octubre de 2026 según los metadatos. No hay validación externa independiente del autor.
- Uso comercial permitido por la licencia Apache 2.0, con las obligaciones habituales de atribución y conservación del aviso de licencia.
- No se describen los datos de entrenamiento ni su composición, por lo que no puede evaluarse el sesgo en dominios sensibles como tickets, correos o registros de clientes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ParallaxOpen/Vela-Decision-170M
- Organización ParallaxOpen: https://huggingface.co/ParallaxOpen/ParallaxOpen
- Baseline convaiinnovations/laya: https://huggingface.co/convaiinnovations/laya
- Vela AI en GitHub: https://github.com/vela-org/
- OpenParallax en GitHub: https://github.com/openparallax
- Documentación de modelos de Rx.ai (Qalyx): https://qalyx.dev/rxai/v2/models
- Sitio de Vela AI (decision intelligence): https://vela-org.github.io/
