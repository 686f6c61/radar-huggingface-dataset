# besktech/ru-jev

## Resumen

Ru-Jev (Ру-Жев) v1.3 es un modelo compacto de decisión tipada ("typed-decision") desarrollado por besktech, orientado principalmente al ruso y construido sobre el backbone encoder mmBERT-base de jhu-clsp. No genera texto: dado un contexto y un conjunto de opciones candidatas, devuelve una probabilidad calibrada sobre cada opción y selecciona una. Cubre tres formas de decisión: sí/no, elección entre opciones y escala ordinal.

El modelo resuelve el problema del enrutamiento y la clasificación de intención en entornos cerrados, donde se necesita una probabilidad fiable más que una etiqueta opaca. Con 306.939.648 parámetros (unos 307M) y arquitectura encoder tipo ModernBERT, está pensado para ejecutarse en CPU y desplegarse dentro de un perímetro cerrado sin dependencias de APIs externas.

La versión 1.3 introduce una mejora sustancial en robustez frente a variaciones de redacción de las opciones: entrena cada conjunto fijo de opciones con varias formulaciones (palabra rusa, clave inglesa, frase descriptiva, jerga, etc.), de modo que el modelo debe leer la opción en lugar de reconocerla. Esto reduce la brecha entre confianza y precisión en vocabularios no vistos, que en v1.1 llegaba a 0.121 y en v1.3 se sitúa en 0.030. El modelo no está afiliado a TypeSafe AI ni entrenado con salidas de Jev.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder transformer (mmBERT-base, familia ModernBERT) con cabeza de scoring separada |
| Parámetros totales | 306.939.648 (≈307M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Ruso (principal), inglés, multilingüe |
| Licencia | MIT |
| Formato de pesos | safetensors (backbone y `head.safetensors` separados) |

## Arquitectura y entrenamiento

El modelo combina un backbone encoder mmBERT-base (aproximadamente 307M de parámetros) con una cabeza de scoring entrenada desde inicialización aleatoria. No es un checkpoint estándar de clasificación de secuencias: la cabeza se almacena en un fichero `head.safetensors` independiente, y las pipelines estándar de Hugging Face (`AutoModelForSequenceClassification`, `pipeline("zero-shot-classification")`) inicializan una cabeza nueva aleatoria en lugar de cargar la entrenada, produciendo puntuaciones sin sentido que cambian en cada carga. Por eso el autor desactiva el widget de inferencia y exige cargar el modelo con un snippet específico.

El entrenamiento se realizó exclusivamente con datasets abiertos etiquetados por humanos, sin llamar, destilar ni usar como fuente de etiquetas ninguna API de decisión cerrada. La innovación principal de v1.3 es el aumento de datos sobre las opciones: cada conjunto fijo de opciones se presenta en varias redacciones (palabra rusa, clave inglesa, frase descriptiva, nombre de departamento, jerga anglicista, jerga de oficina, abreviaturas, códigos opacos e identificadores de código), y se muestrea una por ejemplo. Para las tareas de enrutamiento se incluye además la clave inglesa escrita en cirílico y su forma recortada, generadas por regla. El objetivo es forzar al modelo a interpretar semánticamente la opción y no a memorizar su forma exacta.

## Capacidades

- Decisión tipada con tres formas: sí/no, elección entre un conjunto de opciones y escala ordinal.
- Clasificación de texto y clasificación zero-shot (mediante carga manual, no pipeline estándar).
- Enrutamiento e identificación de intención en ruso, con etiquetas en ruso, inglés o transliteradas.
- Salida de probabilidad calibrada sobre las opciones, útil para umbrales y abstención.
- Robustez frente a variaciones de redacción de la etiqueta: sinónimos, frases descriptivas, jerga, abreviaturas y códigos.
- Capacidad multilingüe heredada del backbone mmBERT, con foco declarado en ruso e inglés.
- Ejecución en CPU y despliegue on-premise dentro de perímetros cerrados.
- No genera texto, no soporta tool calling, ni agentes multi-paso, ni visión, ni audio.

## Casos de uso

- Enrutamiento de peticiones en un asistente conversacional: dado el mensaje del usuario y un conjunto de categorías (por ejemplo, las 18 categorías del benchmark del autor), el modelo devuelve la categoría más probable con una confianza utilizable para derivar a un flujo u otro; su calibración permite fijar umbrales de escalado a humano.
- Clasificación de intención en atención al cliente: con opciones como "facturación", "soporte técnico" o "cancelación", el modelo asigna la intención y la probabilidad en una sola pasada, sin generación, lo que reduce latencia y coste frente a un LLM generativo.
- Moderación y decisión binaria sí/no: filtros de contenido o validaciones de políticas donde se necesita una probabilidad calibrada y no una respuesta en lenguaje natural.
- Triaje con escala ordinal: priorización de tickets en niveles (baja, media, alta, crítica) aprovechando la forma de decisión ordinal del modelo.
- Despliegue on-premise en CPU para sectores regulados: al ser un encoder de 307M con licencia MIT, puede ejecutarse dentro de una red cerrada sin enviar datos a APIs externas, lo que encaja en banca, sanidad o administración pública.
- Enrutamiento en pipelines de datos con etiquetas cambiantes: gracias al entrenamiento con múltiples redacciones, tolera que el equipo renombre categorías o use jerga interna sin degradar tanto como v1.1.
- Prefiltrado barato antes de un modelo mayor: usar Ru-Jev para descartar o clasificar la mayoría de casos y reservar un LLM generativo solo para los casos de baja confianza.

## Benchmarks y rendimiento

El autor publica una evaluación de robustez ante variaciones de redacción de la etiqueta sobre 1.000 preguntas de enrutamiento, con dos tamaños de conjunto de candidatos: 5 opciones (azar 0.20) y las 18 categorías completas (azar 0.056). Se compara v1.1 con v1.3.

| Redacción de la opción (ejemplo para `weather`) | Estado | v1.1, 5 | v1.3, 5 | v1.1, 18 | v1.3, 18 |
|---|---|---|---|---|---|
| Palabra rusa, `погода` | control (estilo de entrenamiento) | 0.956 | 0.960 | 0.883 | 0.892 |
| Clave inglesa, `weather` | control (estilo de entrenamiento) | 0.957 | 0.962 | 0.894 | 0.900 |
| Frase rusa, `прогноз погоды` | estilo de entrenamiento solo en v1.3 | 0.881 | 0.957 | 0.703 | 0.885 |
| Frase descriptiva | held out | 0.939 | 0.958 | 0.848 | 0.878 |
| Nombre de departamento, `метеослужба` | held out | 0.835 | 0.869 | 0.632 | 0.733 |
| Jerga anglicista, `вэзер`, 18 etiquetas | held out | 0.633 | 0.855 | 0.431 | 0.640 |
| Jerga anglicista, 15 etiquetas limpias | held out | 0.624 | 0.838 | 0.427 | 0.595 |
| Jerga anglicista, 11 etiquetas estrictas | held out | 0.550 | 0.786 | 0.328 | 0.470 |
| Jerga de oficina, `синоптик`, 18 | held out | 0.648 | 0.780 | 0.428 | 0.476 |
| Jerga de oficina, 14 estrictas | held out | 0.595 | 0.761 | 0.369 | 0.419 |
| Abreviatura, `ПОГ`, 17 limpias | held out | 0.420 | 0.360 | no evaluado | no evaluado |
| Código opaco, `ПГД`, 9 estrictas | held out | 0.135 | 0.168 | 0.018 | 0.061 |
| Identificador de código, `WEATHER_SCN` | contiene la clave entrenada | 0.856 | 0.889 | no evaluado | no evaluado |

Las dos primeras filas son controles, no resultados de generalización. En la comparación de calibración, v1.1 reportaba una confianza media de 0.754 frente a una precisión de 0.633 (brecha de 0.121) en la redacción con jerga, mientras que v1.3 presenta una brecha de 0.030. No se han publicado en la información disponible resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, que además no aplican a un modelo de decisión.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 307M de parámetros; en fp16 alrededor de 0.6 GB; cuantizaciones de 8 bits o menores reducirían aún más el consumo, aunque el autor no publica cuantizaciones.
- GPU recomendadas: no requiere GPU; cualquier GPU consumer (RTX 3060, RTX 4090) sobra para el modelo. Está diseñado explícitamente para CPU.
- Cabe en cualquier GPU consumer e incluso en CPU de un portátil o servidor modesto.
- Opciones de despliegue: transformers con carga manual del backbone y de `head.safetensors`; el tag `text-embeddings-inference` sugiere compatibilidad con TEI. Las pipelines estándar de Hugging Face no funcionan correctamente según el autor.
- Latencia y throughput: no disponibles en la información proporcionada; al ser un encoder de 307M, se espera latencia de milisegundos por petición en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| besktech/ru-jev v1.3 | 307M | no disponible | Decisión tipada / enrutamiento (ru-first) | MIT | Hugging Face |
| jhu-clsp/mmBERT-base | no disponible | no disponible | Backbone encoder multilingüe | no disponible | Hugging Face |
| Modelos de clasificación de intención basados en encoders (p. ej. RuBERT, XLM-R base) | 100M–300M | 512 típicamente | Clasificación de texto | variable | Hugging Face |

La comparación con alternativas de la misma categoría (decisión tipada con probabilidad calibrada y opciones arbitrarias en tiempo de inferencia) no está disponible en la información proporcionada. Frente a clasificadores de intención tradicionales, Ru-Jev se distingue por aceptar el conjunto de opciones como entrada en lugar de fijar las etiquetas en el entrenamiento, y por publicar métricas de calibración y robustez ante redacciones no vistas.

## Limitaciones y advertencias

- No funciona con las pipelines estándar de Hugging Face: `pipeline("zero-shot-classification")` devuelve números de una cabeza aleatoria que cambian en cada carga. Es obligatorio usar el snippet de carga del autor.
- El widget de inferencia está desactivado a propósito.
- No genera texto ni soporta tool calling, agentes, visión o audio.
- El foco es el ruso; el rendimiento en otros idiomas, aunque el backbone sea multilingüe, no está documentado.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de asignar una opción con alta confianza cuando el contexto es ambiguo o la opción es un código opaco: en el caso `ПГД`, la precisión cae a 0.168 (5 opciones) y 0.061 (18 opciones).
- Las abreviaturas opacas siguen siendo un punto débil: `ПОГ` baja de 0.420 en v1.1 a 0.360 en v1.3 en el conjunto de 17 etiquetas limpias.
- Las filas de control del benchmark no deben interpretarse como evidencia de generalización.
- Licencia MIT: permite uso comercial, pero conviene revisar las condiciones del backbone base mmBERT-base, cuya licencia no se detalla en la información disponible.
- El modelo declara no estar afiliado a TypeSafe AI ni entrenado con salidas de Jev; el nombre es un juego con la categoría y no implica compatibilidad.
- Las versiones anteriores se conservan en las ramas `v1.1` y `v1`; si se depende de un comportamiento exacto, hay que fijar la revisión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/besktech/ru-jev
- Árbol de ficheros: https://huggingface.co/besktech/ru-jev/tree/main
- Página del proyecto: https://ru-jev.besk.tech
- Demo con ejemplos precalculados: https://huggingface.co/spaces/besktech/ru-jev-demo
- Código de entrenamiento y evaluación: https://github.com/beskvladimir-create/ru-jev
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-base
- Paper referenciado en los tags: arxiv:2611.08439
