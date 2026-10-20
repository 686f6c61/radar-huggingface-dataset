# govindshukl/Tripwire-AdverseMedia-4B

## Resumen

Tripwire-AdverseMedia-4B es un adaptador LoRA (PEFT) que convierte el modelo Qwen3.5-4B en un clasificador de decisión para noticias adversas sobre empresas y personas. Lo publica el usuario govindshukl bajo licencia Apache-2.0 y no es un modelo fundacional nuevo: es un fine-tune sobre un modelo base de 4.000 millones de parámetros. Su función no es generar texto, sino responder, en una sola pasada hacia delante, un conjunto de 18 preguntas tipadas (¿la noticia se refiere realmente a esa entidad?, ¿es negativa?, ¿qué severidad tiene para su calidad crediticia?, ¿de qué categoría es el problema?, ¿es un hecho reciente?) devolviendo una distribución de probabilidad sobre las opciones de cada pregunta.

El problema que resuelve es concreto: el cribado de *adverse media* en cumplimiento normativo y en gestión de riesgo de crédito, donde los sistemas actuales generan un volumen alto de falsos positivos por confusión de nombres y por incapacidad de graduar la gravedad de un evento. Al formular la tarea como clasificación con probabilidades calibradas en lugar de generación libre, el modelo permite fijar umbrales operativos y auditar cada decisión. Según la model card, reduce la tasa de respuestas "no estoy seguro" en la resolución de entidades del 24,6 % (modelo base) al 1,8 %, con un error de calibración de 0,036 frente a 0,225.

La relevancia práctica está en el coste y la latencia: en una A100 de 40 GB procesa un pasaje con las 18 preguntas en 262 ms (14,6 ms por pregunta) mediante lectura en árbol compartida, frente a 1.524 ms si cada pregunta relee el pasaje. El repositorio ocupa 0,1 GB, solo admite inglés y, en el momento de redactar esta ficha, acumula 0 descargas y 1 *like*, por lo que debe considerarse un artefacto reciente y poco contrastado por terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen3.5-4B (transformer con atención lineal y encoder de visión en el modelo base; el encoder de visión no se entrena) |
| Parametros totales | Modelo base ~4B; adaptador LoRA con rango 16, alfa 32, dropout 0,05 (tamaño del repo: 0,1 GB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible para el adaptador (formato PEFT/safetensors); la cuantización se aplicaría al modelo base y no está documentada |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, librería `peft`) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3.5-4B, un modelo base de unos 4.000 millones de parámetros que, según los detalles mencionados en la model card, combina capas de atención lineal (con convolución asociada) con un encoder de visión que aquí queda congelado. El fine-tune es un LoRA de rango 16 (alfa 32, dropout 0,05) insertado en las proyecciones de atención, atención lineal y MLP del modelo de lenguaje. La cabeza de decisión no genera texto: se construye un prompt con el estado en JSON indentado, la pregunta con opciones etiquetadas y el inicio del turno del asistente con un bloque de *thinking* vacío; la respuesta es el softmax sobre los tokens de las opciones en la posición siguiente.

El entrenamiento consistió en una única época sobre 15.832 ejemplos, con tasa de aprendizaje 2e-4 y decaimiento coseno, batch efectivo de 16 y pérdida calculada únicamente sobre el token de respuesta; el orden de las opciones se baraja en cada ejemplo para evitar sesgos posicionales. Los datos son pasajes de noticias publicadas entre 2024 y 2026 sobre unas 30 empresas grandes con alta cobertura mediática y personas relacionadas, etiquetados mediante una API comercial de modelos de decisión (TypeSafe Jev). La descripción del dataset en la model card disponible está truncada, por lo que no se detalla la composición completa ni el proceso de validación de etiquetas.

## Capacidades

- Clasificación de texto con salida probabilística tipada: preguntas de sí/no, de elección entre opciones y de puntuación ordinal (severidad 0-4).
- Resolución de entidad (*same_entity*): distingue si el nombre del artículo corresponde a la empresa o persona monitorizada, a una mención de producto, a otra entidad distinta, o si no se puede determinar.
- Análisis de dirección y tono: clasifica la noticia como negativa, neutra o positiva para la entidad.
- Graduación de severidad crediticia en cinco niveles: sin señal, indicio temprano, presión material, estrés agudo y evento de impago.
- Detección de hallazgos adversos: alegaciones, investigaciones, sanciones o resoluciones judiciales.
- Categorización temática en doce clases: liquidez, financiación, reestructuración, operaciones, dependencia, gobernanza, legal, grupo, shock externo, delito financiero, ESG y positiva.
- Filtro de actualidad (*current_development*): separa noticia reciente de comentario o retrospectiva.
- Evaluación de relevancia crediticia: estima si el hecho puede afectar a ingresos, caja, financiación o capacidad de pago.
- Extensibilidad del cuestionario: el formato admite preguntas adicionales o reformuladas, aunque el autor advierte que las respuestas se degradan cuanto más se alejan de las preguntas de entrenamiento.
- Lectura en árbol: responde las 18 preguntas en una sola pasada compartiendo la lectura del pasaje.
- No soporta generación de texto, tool calling, razonamiento multi-paso, agentes ni otras modalidades más allá del texto de entrada.

## Casos de uso

- Alerta temprana en carteras de renta fija: ingesta de titulares y pasajes de agencias, clasificación con `adverse()` y umbral de severidad ≥ 0,5 para abrir un expediente de revisión sobre emisores con cupones o vencimientos próximos. La rapidez (262 ms por pasaje con 18 preguntas en A100) permite reprocesar un feed completo cada pocos minutos.
- Cribado de *adverse media* en onboarding KYC: antes de dar de alta a una contraparte, se ejecuta el cuestionario sobre los últimos titulares y se usa `same_entity` con umbral 0,5 para descartar homónimos; la precisión de 0,878 y el 1,8 % de casos dudosos reducen la cola de revisión manual.
- Reducción de falsos positivos en monitorización continua: sustituir reglas de palabras clave por la combinación de `direction`, `credit_relevant` y `adverse_finding`, dejando pasar solo los casos que cumplen las tres condiciones y registrando la probabilidad de cada opción para auditoría.
- Due diligence de proveedores y contrapartes: aplicar las doce categorías `cat_*` para etiquetar automáticamente el tipo de problema (por ejemplo, shock externo frente a gobernanza) y enrutar cada noticia al equipo correspondiente dentro del proceso de compras.
- Enriquecimiento de un almacén de datos de riesgo: generar etiquetas estructuradas y calibradas (Brier 0,075) sobre millones de documentos históricos para entrenar o validar modelos internos de *scoring*, con la ventaja de que cada etiqueta va acompañada de una probabilidad utilizable como *feature*.
- Triaje de flujos de noticias en un terminal financiero: descartar duplicados y retrospectivas con `current_development` antes de la publicación, y priorizar por severidad estimada, reduciendo el volumen que llega al analista humano.
- Verificación de listas y sanciones combinada: usar la resolución de entidad como primera etapa de un pipeline de *screening* que después consulte OpenSanctions u otras listas, reservando la revisión manual para los casos en la banda 0,3-0,7.

## Benchmarks y rendimiento

Resultados publicados por el autor, evaluados sobre conjuntos públicos etiquetados por humanos, con las mismas preguntas, prompts y regla de decisión para todos los modelos, y una sola ejecución de entrenamiento.

Eventos de crédito (dataset *needle*, MIT, 1.102 titulares; 173 impagos y rebajas de rating únicos, 177 subidas y refinanciaciones):

| Modelo | Impagos y rebajas leídos como adversos | Subidas y refinanciaciones mal marcadas |
|---|---|---|
| Tripwire-AdverseMedia-4B | 171 / 173 (los 2 restantes son empresas saliendo del capítulo 11) | 0 / 177 |
| Qwen3.5-4B (base, mismos prompts) | 171 / 173 | 0 / 177 |
| Liquid d1-3B (base) | 151 / 173 | 0 / 177 |
| Vega-U 4B (zero-shot) | 169 / 173 | 11 / 177 |

Coincidencia de nombres de empresa (pares de OpenSanctions, CC BY-NC 4.0, 565 pares tras excluir 35 presentes en entrenamiento):

| Modelo | Precisión a 0,5 | Exhaustividad a 0,5 | Casos dudosos (0,3-0,7) | Brier | Error de calibración |
|---|---|---|---|---|---|
| Tripwire-AdverseMedia-4B | 0,878 | 0,957 | 1,8 % | 0,075 | 0,036 |
| Qwen3.5-4B (base) | 0,668 | 0,978 | 24,6 % | 0,182 | 0,225 |
| Liquid d1-3B (base) | 0,825 | 0,917 | 23,0 % | 0,117 | 0,102 |
| Vega-U 4B (zero-shot) | 0,799 | 0,885 | 66,9 % | 0,163 | 0,188 |

Velocidad medida en una A100 de 40 GB: 262 ms por pasaje con las 18 preguntas mediante lectura en árbol (14,6 ms por pregunta), frente a 1.524 ms con relectura del pasaje por pregunta; ambas variantes coinciden en 13.763 de 13.770 respuestas de test. La convolución de atención lineal se ejecutó sobre el *fallback* de PyTorch, y el autor espera mejores tiempos con kernels rápidos y vLLM. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de propósito general, ya que el modelo no está orientado a esas tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 4B en bf16/fp16 ocupa aproximadamente 8 GB de pesos; con caché KV y activaciones, entre 10 y 12 GB para pasajes largos (estimación, no publicada). En cuantización de 8 bits bajaría a unos 5-6 GB y en 4 bits a unos 3-4 GB, sin datos oficiales de calidad tras cuantizar.
- GPU recomendadas: A100 de 40 GB es la configuración usada en las mediciones del autor. Cualquier GPU con 16 GB o más (RTX 4090, RTX 4080, L40S, A10G) debería ejecutar el modelo en precisión completa; H100 no es necesaria para este tamaño.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) y RTX 4080/4070 Ti Super (16 GB) en bf16; en tarjetas de 8-12 GB requiere cuantización del modelo base.
- Opciones de despliegue: `transformers` ≥ 5.19 junto con `peft` ≥ 0.21 y `accelerate`, más el paquete `tripwire` del autor (que implementa el formato de prompt y la lectura en árbol). vLLM se menciona como opción futura pero no está validado en la información disponible. llama.cpp, Ollama y TGI no están documentados para este adaptador.
- Latencia y throughput: 14,6 ms por pregunta y 262 ms por pasaje de 18 preguntas en A100 40 GB (lectura en árbol). No se publica throughput agregado; en una única secuencia equivaldría a unas 3,8 lecturas de pasaje por segundo, cifra que escalaría con *batching*, no medido.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tripwire-AdverseMedia-4B | ~4B (base) + LoRA r16 | no disponible | Clasificación de decisión adverse media, 18 preguntas tipadas | Apache-2.0 | HuggingFace (0 descargas, 1 like) |
| Qwen3.5-4B (base) | ~4B | no disponible | Modelo generativo generalista, multimodal con encoder de visión | Apache-2.0 | HuggingFace, ampliamente disponible |
| Liquid d1-3B | 3B | no disponible | Modelo base de Liquid AI usado como referencia en las tablas | no disponible en la información proporcionada | HuggingFace |
| Vega-U 4B | 4B | no disponible | Modelo evaluado en modo zero-shot sobre las mismas preguntas | no disponible en la información proporcionada | HuggingFace |

Frente al modelo base, la diferencia medible está en la calibración (Brier 0,075 frente a 0,182), en la resolución de entidades (precisión 0,878 frente a 0,668) y en la cobertura del cuestionario completo: el base responde mal a categorías, temporalidad y hallazgos adversos. Frente a Vega-U 4B, la ventaja está en la tasa de falsos positivos sobre noticias positivas (0 de 177 frente a 11 de 177) y en la proporción de casos dudosos (1,8 % frente a 66,9 %).

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autónomo: requiere descargar Qwen3.5-4B y cargarlo con `peft`; no funciona como artefacto aislado.
- Solo inglés. No hay soporte declarado de castellano ni de otras lenguas, y el rendimiento fuera del inglés no está evaluado.
- Entrenado sobre pasajes de noticias de unas 30 empresas grandes entre 2024 y 2026: el dominio es estrecho y el comportamiento sobre pymes, empresas sin cobertura mediática o sectores poco representados puede degradarse.
- Las etiquetas de entrenamiento provienen de una API comercial de decisión (TypeSafe Jev), no de anotación humana directa, por lo que el adaptador hereda los sesgos y errores sistemáticos de ese etiquetador.
- Los benchmarks son de una única ejecución de entrenamiento y están evaluados por el propio autor, sin replicación independiente; el conjunto de eventos de crédito muestra resultados idénticos al modelo base (171/173), por lo que la mejora real se concentra en nombres, calibración y cobertura de preguntas.
- Riesgo de alucinación bajo en el sentido generativo (no produce texto libre), pero sí riesgo de clasificación errónea: falsos negativos en noticias ambiguas, y respuestas poco fiables si se reformulan las preguntas alejándose de las 18 originales.
- La salida es una probabilidad por opción; la decisión final depende de umbrales que el usuario debe calibrar sobre su propio dominio. La regla `adverse()` incluida es solo un ejemplo (entidad correcta, dirección negativa, severidad esperada ≥ 0,5).
- El conjunto de evaluación de OpenSanctions es CC BY-NC 4.0 (no comercial); su uso en validación interna de un producto comercial requiere revisión. La licencia Apache-2.0 del adaptador no cubre automáticamente los datos de terceros citados.
- Advertencia de madurez: repositorio de 0,1 GB con 0 descargas y 1 like, creado en octubre de 2026; no hay evidencia de uso en producción ni auditoría externa. Para decisiones de crédito reales conviene tratarlo como un componente de triaje con revisión humana, no como árbitro final.
- No se dispone de información sobre longitud de contexto soportada, por lo que pasajes muy largos pueden truncarse sin que el autor documente el comportamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/govindshukl/Tripwire-AdverseMedia-4B
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio de código Tripwire: https://github.com/govindshukl/tripwire
- Dataset de evaluación de eventos de crédito (needle, MIT): https://huggingface.co/datasets/Shreyas94/needle-event-classifier-eval
- OpenSanctions (pares de entidades para evaluación de nombres): https://www.opensanctions.org
