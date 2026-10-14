# jxxxll/kev-4b-substitutes-judge

## Resumen

kev-4b-substitutes-judge es un modelo de decisión, no un modelo generativo, publicado por el usuario jxxxll. Se trata de un adaptador LoRA (r=16, alpha=32) más una cabeza de clasificación (\`head.pt\`) montados sobre el transformer Qwen/Qwen3.5-4B-Base (revision \`1001bb4d\`). Su única tarea es juzgar si un listado de producto CANDIDATE es el mismo producto, un sustituto válido o un no sustituto respecto a un listado SEED, para un contexto de compra por aprovisionamiento.

El modelo responde a una pregunta de elección con tres opciones (same_product, substitute, not_substitute) y devuelve una probabilidad calibrada para cada una en una sola pasada hacia delante, sin generar texto. La calibración viene incorporada: la cabeza almacena una temperatura ajustada (T = 1.6245) que minimiza la NLL sobre un conjunto de calibración separado de 3.500 pares, de modo que cualquier cargador de Kev devuelve probabilidades calibradas por defecto.

Es relevante porque reduce el coste de una tarea de matching de producto a una inferencia de 4B parámetros ejecutable en una sola GPU, con resultados de macro-F1 que superan claramente a la versión liberada de kev-4b (0,873 frente a 0,680 en test) acercándose a jueces propietarios mucho mayores como Claude Sonnet (0,934). Su principal debilidad documentada es la recall de la clase \`substitute\` (0,585 en test), es decir, tiende a no detectar sustitutos reales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (r=16, alpha=32) sobre transformer decoder Qwen3.5-4B-Base, mas cabeza de clasificacion (pointer head) de Kev |
| Parametros totales | 4B en el modelo base Qwen3.5-4B-Base; el adaptador se publica en un repo de 0,2 GB |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | estados de hasta 3.072 tokens en entrenamiento; contexto nativo del modelo base: no disponible |
| Tipos de cuantizacion | no disponible (los pesos se publican en safetensors; la model card solo documenta servicio en bf16) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 (adaptador y cabeza); el modelo base Qwen3.5 tambien es Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) + \`head.pt\` (cabeza con temperatura ajustada) |
| Modelo base | Qwen/Qwen3.5-4B-Base, revision \`1001bb4d\` |
| Punto de partida del entrenamiento | jaredpalmer/kev-4b, revision \`139fdd94\` |
| Version de librerias | transformers >= 5.17, peft >= 0.21, Kev en el commit \`2ea56600\` |
| Fecha de publicacion | 2026-10-14 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder (Qwen3.5-4B-Base) al que se le añaden dos piezas: un adaptador LoRA de rango 16 y alpha 32 aplicado a todas las proyecciones objetivo de Kev, y una cabeza de decisión tipo pointer que convierte la representación del estado en tres logits, uno por opción. No hay decodificación autoregresiva: la respuesta se obtiene en una única pasada hacia delante, lo que elimina la varianza de muestreo y hace que la salida sea directamente una distribución de probabilidad por clase. El estado de entrada es texto plano con dos bloques, SEED y CANDIDATE, cada uno con los campos conocidos en un orden fijo (Names, Sellers, Brands, Codes, SKUs, Details, Description); no es un prompt de chat y la model card advierte que el modelo no se ha probado con otras formulaciones.

El entrenamiento partió del modelo liberado \`jaredpalmer/kev-4b\` y se ejecutó durante una época con learning rate 2e-5, batch efectivo 8, autocast en bf16 con pesos maestros en fp32 y estados de hasta 3.072 tokens. El conjunto de datos son 55.575 pares SEED/CANDIDATE etiquetados (17 % \`same_product\`, 10 % \`substitute\`, 73 % \`not_substitute\`), construidos a partir de 5.000 productos semilla muestreados aleatoriamente de un catálogo de páginas públicas rastreadas, más 2.000 registros reproducidos de la suite \`decision-v7\` de Kev. Las etiquetas las generó Claude Sonnet contra una rúbrica escrita, con reclasificación de Claude Opus para todas las etiquetas de sustituto y las de baja confianza, y arbitraje de Claude Fable en los casos que Opus marcó como laguna de la rúbrica. Se activaron las aumentaciones de Kev, incluidos pares del tipo "ninguna de las anteriores" en el 25 % de los registros. El entrenamiento completo requirió 3,0 horas en una única RTX PRO 6000 con un pico de 22,3 GiB de memoria. La temperatura de calibración se ajustó minimizando la NLL sobre un split independiente de 3.500 pares.

## Capacidades

- Clasificación de decisión con tres etiquetas excluyentes: \`same_product\`, \`substitute\` y \`not_substitute\`, con una única pasada hacia delante.
- Salida probabilística calibrada por clase (\`answers.relation.probabilities[choice]\`); la temperatura ajustada T = 1.6245 reduce el ECE de 0,035 a 0,024 en test y de 0,026 a 0,005 en dev.
- Entrada estructurada en texto plano con bloques SEED y CANDIDATE; tolera campos ausentes y varios valores por campo (varios nombres, vendedores, códigos o SKU).
- Manejo de pares con información incompleta: la clase \`not_substitute\` cubre explícitamente los casos en los que falta un dato necesario en cualquiera de los dos lados.
- Robustez a campos que no coinciden literalmente (por ejemplo, color "Silver Chine" frente a "Grey"): la etiqueta \`same_product\` admite diferencias de texto, vendedor, SKU o descripción de pack.
- No genera texto: no hay salida libre, ni razonamiento en cadena, ni explicación de la decisión.
- No soporta tool calling ni function calling, ni uso como agente o razonamiento multi-paso.
- Capacidad multilingüe: solo inglés. Los estados en otros idiomas no han sido evaluados.
- Capacidad especial: el modelo se sirve mediante el endpoint \`/v1/systemone\` de Kev, que acepta varias preguntas de elección en una misma llamada; el campo \`confidence\` de Kev es un margen reescalado y no una probabilidad.

## Casos de uso

- Deduplicación de catálogo entre vendedores: dado un listado semilla, el modelo marca los listados equivalentes de otros vendedores con la etiqueta \`same_product\` (precisión 0,879 y recall 0,991 en test), lo que permite consolidar fichas duplicadas sin depender de coincidencias exactas de SKU o de texto.
- Compra por aprovisionamiento: dado un producto solicitado y una oferta candidata, el modelo distingue si es exactamente el mismo artículo o un sustituto funcional aceptable (misma función, tamaño o especificación comparable), que es precisamente la decisión que se toma al sustituir una referencia descatalogada.
- Enrutado de sustituciones en comercio electrónico: cuando un artículo está agotado, el modelo puntúa el catálogo de alternativas y solo las que superan el umbral de \`substitute\` se ofrecen al cliente; su precisión de 0,960 en esa clase limita las recomendaciones incorrectas, a costa de una recall baja (0,585).
- Filtro previo en búsqueda de producto: usar la probabilidad calibrada como señal de reordenación en un motor de búsqueda o en un sistema de recomendación, en lugar de similitud vectorial pura, para elevar candidatos que son el mismo producto o un sustituto válido.
- Cola de revisión humana con priorización por confianza: gracias al ECE de 0,024 en test, las decisiones con probabilidad baja se pueden enviar a revisión manual, de modo que el esfuerzo humano se concentra en el tramo donde el modelo es menos fiable (la clase \`substitute\`).
- Servicio de decisión dentro de un pipeline de datos: el endpoint HTTP \`/v1/systemone\` devuelve JSON con probabilidades por clase, por lo que se puede invocar desde un job de procesamiento por lotes que clasifique millones de pares SEED/CANDIDATE sin coste de generación por token.
- Auditoría de calidad de catálogo: detectar fichas que afirman ser el mismo producto cuando no lo son (la clase \`not_substitute\` tiene precisión 0,959 y recall 0,961 en test) o identificar qué referencias no encajan con su descripción declarada.
- Sustitución de un juez LLM propietario en producción: el modelo reproduce parte del comportamiento de un juez tipo Claude Sonnet (0,941 frente a 0,974 de accuracy en test) con 4B parámetros y licencia Apache-2.0, lo que permite ejecutarlo en infraestructura propia.

## Benchmarks y rendimiento

Resultados publicados en la model card. Las etiquetas de referencia son juicios de Claude Opus sobre cada par reservado, con Claude Fable como árbitro en los casos que Opus marcó como laguna de la rúbrica. Los pares marcados como ambiguos se excluyen (153 de 3.496 en dev; 27 de 600 en test). El split de test se leyó una sola vez, tras seleccionar el modelo en dev.

| Metrica | Este modelo | kev-4b liberado | gpt-oss-20b | Claude Sonnet |
|---|---|---|---|---|
| macro-F1 en test (573 pares) | 0,873 [0,760; 0,938] | 0,680 | 0,683 | 0,934 |
| Accuracy en test | 0,941 | 0,827 | 0,832 | 0,974 |
| macro-F1 en dev (3.343 pares) | 0,892 | no disponible | 0,739 | 0,926 |
| Accuracy en dev | 0,953 | no disponible | 0,873 | 0,964 |

Precisión y recall por clase para este modelo:

| Clase | Test (precision / recall) | Dev (precision / recall) |
|---|---|---|
| same_product | 0,879 / 0,991 | 0,981 / 0,943 |
| substitute | 0,960 / 0,585 | 0,783 / 0,709 |
| not_substitute | 0,959 / 0,961 | 0,961 / 0,980 |

Otros datos de rendimiento reportados: con la temperatura publicada, el ECE es 0,024 en test (0,035 en crudo) y 0,005 en dev (0,026 en crudo). Servir en bf16 cambia el 0,11 % de las respuestas en dev. En la suite \`decision-v7\` propia de Kev, la accuracy cae 0,16 puntos respecto al kev-4b liberado.

## Requisitos de hardware

- Entrenamiento documentado: 3,0 horas en una única RTX PRO 6000 con un pico de 22,3 GiB, autocast en bf16 y pesos maestros en fp32.
- VRAM de inferencia en bf16 (estimación a partir de los 4B parámetros del base, no documentada por el autor): en torno a 8 GB solo para los pesos, más caché KV y activaciones; presupuestar 10-12 GB para estados de hasta 3.072 tokens.
- Cuantización: no disponible. La model card solo documenta servicio en bf16 y no publica pesos GGUF ni cuantizaciones de 4 u 8 bits.
- GPU consumer: cabe con holgura en una RTX 4090 (24 GB) o RTX 3090 (24 GB); en bf16 una RTX 4070 Ti o 4070 (12 GB) queda justa y puede requerir reducir el tamaño del estado.
- GPU de datacenter: A100, H100, L40S o RTX PRO 6000 son suficientes y quedan sobredimensionadas para una sola instancia; el cuello de botella es la latencia de red, no la memoria.
- Opciones de despliegue: servicio oficial mediante Kev, \`uv run --extra serve python -m kev.serve --run jxxxll/kev-4b-substitutes-judge --port 8009\`, con \`transformers >= 5.17\` y \`peft >= 0.21\`. No hay soporte documentado para vLLM, TGI, llama.cpp u Ollama: el modelo no genera texto y depende de una cabeza pointer más la temperatura almacenada en \`head.pt\`, por lo que los runtimes estándar de generación no lo ejecutan sin adaptación.
- Latencia y throughput: no disponibles en la información proporcionada. Al ser una sola pasada hacia delante sin decodificación, el coste es un prefill del estado completo (hasta 3.072 tokens) por par evaluado.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Accuracy test | macro-F1 test | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| kev-4b-substitutes-judge | 4B + adaptador LoRA r=16 | Juez de decisión, una pasada | 0,941 | 0,873 | Apache-2.0 | HuggingFace (este repo) |
| jaredpalmer/kev-4b | 4B + adaptador | Juez de decisión, una pasada | 0,827 | 0,680 | no disponible | HuggingFace |
| gpt-oss-20b | ~21B totales, ~3,6B activos (MoE) | LLM generativo evaluado como juez | 0,832 | 0,683 | Apache-2.0 | pesos abiertos (dato público, no verificado en la información proporcionada) |
| Claude Sonnet | no disponible (propietario) | LLM generativo como juez | 0,974 | 0,934 | propietaria | API |

Frente al kev-4b liberado, este modelo gana 19,3 puntos de macro-F1 en test (0,873 frente a 0,680) partiendo de él mediante un ajuste fino de una época. Frente a gpt-oss-20b, gana 19,0 puntos de macro-F1 y 10,9 puntos de accuracy ocupando una fracción de la memoria. La brecha con Claude Sonnet es de 6,1 puntos de macro-F1 en test y 3,4 puntos en dev.

## Limitaciones y advertencias

- Recall baja en la clase \`substitute\` (0,585 en test y 0,709 en dev): el modelo tiende a clasificar sustitutos reales como \`same_product\`. Cuando predice \`substitute\`, acierta con precisión 0,960, por lo que los falsos negativos son el modo de fallo dominante.
- Sobreajuste a semillas concretas: 12 de los 16 errores de test que predijeron \`same_product\` para un par \`not_substitute\` provienen de una única semilla, cuyo listado se llama solo "SEAL" y no declara ningún dato de producto. Los estados con información muy escasa son un punto débil conocido.
- Está entrenado exclusivamente con listados en inglés y con estados de hasta 3.072 tokens. Estados más largos y otros idiomas no han sido evaluados, y la model card advierte que no se ha probado con formulaciones de pregunta distintas a la de entrenamiento.
- La salida es una decisión de una sola pasada: no incluye justificación ni traza de razonamiento, lo que dificulta la auditoría de decisiones individuales más allá de la probabilidad por clase.
- El campo \`confidence\` de Kev no es una probabilidad, sino un margen reescalado. Para umbrales de producción hay que usar \`answers.relation.probabilities[choice]\`.
- Requiere versiones concretas (transformers >= 5.17, peft >= 0.21, Kev en el commit \`2ea56600\`); fuera de ese entorno el modelo no está validado.
- Restricciones de licencia: el adaptador y la cabeza son Apache-2.0, y el base Qwen3.5 también es Apache-2.0, por lo que el uso comercial está permitido. No obstante, conviene verificar los términos del modelo base al desplegarlo.
- Riesgo de ingeniería de evaluación: las etiquetas de referencia y las del propio entrenamiento proceden de modelos de Claude y no de anotadores humanos, por lo que el rendimiento real frente a un criterio humano puede diferir.
- Repo sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin mantenimiento ni comunidad documentados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jxxxll/kev-4b-substitutes-judge
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Punto de partida del entrenamiento: https://huggingface.co/jaredpalmer/kev-4b
- Repositorio de Kev: https://github.com/jaredpalmer/kev
- La búsqueda web asociada a esta ficha no devolvió resultados relevantes: solo páginas de marcas comerciales llamadas Calypso (calypsostbarth.com, calypso-label.com, drinkcalypso.com, calypso-watch.com), sin relación con el modelo. No hay papers, blogs ni demos adicionales localizados.
