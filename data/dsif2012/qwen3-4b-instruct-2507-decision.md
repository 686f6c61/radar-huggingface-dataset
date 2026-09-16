# dsif2012/Qwen3-4B-Instruct-2507-Decision

## Resumen

Qwen3-4B-Instruct-2507-Decision es un modelo de decisión de baja latencia y programable por prompt publicado por el usuario dsif2012 sobre Qwen/Qwen3-4B-Instruct-2507. Conviene aclarar desde el principio que la versión v0.1 no incorpora pesos nuevos: se trata de una interfaz de inferencia que reutiliza los pesos del modelo base y añade una capa de puntuación sobre un conjunto de candidatos. El repositorio de HuggingFace sirve como punto de publicación de la ficha, mientras que la lógica de decisión vive en el paquete `pcd` del repositorio de GitHub del autor.

El problema que resuelve es acotado pero frecuente: en lugar de pedir a un LLM que genere texto libre y después parsear la respuesta, el sistema recibe un contexto, una o varias preguntas cerradas y una lista dinámica de candidatos, y devuelve directamente la opción seleccionada junto con `confidence`, `margin` y el ranking completo de puntuaciones. Esto encaja en pipelines donde se necesita una señal estructurada, repetible y barata: agentes que eligen la siguiente acción, clasificadores de enrutamiento, validadores automáticos o lógica de videojuegos.

El modelo se apoya en la arquitectura del Qwen3-4B-Instruct-2507 (transformer denso de aproximadamente 4 000 millones de parámetros, licencia Apache-2.0) y declara únicamente el idioma inglés. En el momento de redactar esta ficha el repositorio acumula 0 descargas y 1 "like", no publica benchmarks y su pipeline no está declarado, por lo que debe considerarse un proyecto incipiente (v0.1) más que un componente listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen/Qwen3-4B-Instruct-2507) con capa de decisión que aplica softmax restringida sobre los logits de los candidatos |
| Parametros totales | ~4 000 millones (corresponden al modelo base; el repositorio no publica pesos propios) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No especificada en la ficha del autor; la documentación oficial del modelo base Qwen3-4B-Instruct-2507 declara 262 144 tokens nativos |
| Tipos de cuantizacion | No especificados por el autor; al no distribuir pesos propios, dependen de las disponibles para Qwen/Qwen3-4B-Instruct-2507 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | No aplica: el repositorio no incluye pesos y remite a los de Qwen/Qwen3-4B-Instruct-2507 |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Pipeline declarado | No disponible |
| Descargas / likes | 0 / 1 |
| Fecha de publicacion | 16 de septiembre de 2026 |

## Arquitectura y entrenamiento

No hay entrenamiento propio. El autor indica explícitamente que v0.1 es una interfaz de inferencia sobre Qwen/Qwen3-4B-Instruct-2507 y que no distribuye pesos nuevos. Por tanto, los datos de preentrenamiento, el número de tokens, la composición del corpus y las fases de ajuste (SFT, RLHF o DPO) del modelo subyacente no se detallan en la información disponible y corresponden a la ficha de Qwen, no a este repositorio.

La innovación del proyecto está en el mecanismo de decisión, no en el modelo. El flujo declarado es: `context + question + candidates` → logits de Qwen → softmax sobre los candidatos → `selected + confidence`. Es decir, se restringe la distribución de salida al conjunto de respuestas válidas en lugar de generar texto libre, lo que elimina el parseo de respuestas y reduce el riesgo de salidas mal formadas. La implementación está optimizada para prefix caching en vLLM, de modo que un contexto compartido (estado de un juego, historial de conversación, documento) se procesa una sola vez y varias preguntas reutilizan la caché KV. El servicio se expone mediante el paquete `pcd` y un endpoint `POST /decision` servido con `pcd-cuda`, según la información del autor.

## Capacidades

- Decisión booleana: tipo `BOOLEAN`, devuelve `true` o `false` para una pregunta cerrada.
- Decisión de elección: tipo `CHOICE`, devuelve una etiqueta perteneciente a un conjunto de candidatos definido dinámicamente en la petición.
- Puntuación completa de candidatos: además del valor seleccionado, devuelve `confidence`, `margin` y un `ranking` ordenado con la puntuación de cada alternativa.
- Procesamiento por lotes de preguntas: el esquema de entrada admite un array `questions` con varios elementos, cada uno con su propio `id`, tipo y, si procede, lista de opciones.
- Inferencia optimizada con prefix caching sobre vLLM, pensada para reutilizar contexto entre peticiones.
- Integración como servicio HTTP mediante el endpoint `/decision` del paquete `pcd`.
- No se documenta soporte de tool calling ni de function calling.
- No se documentan capacidades de agentes multi-paso, visión, audio ni modo de razonamiento extendido (thinking mode).
- No se documenta generación de texto libre: el alcance declarado es la selección entre candidatos.
- Idiomas: únicamente inglés según la etiqueta `language: en` de la ficha.

## Casos de uso

- Lógica de decisión en videojuegos y simulación: el ejemplo propio de la ficha (`can_attack`, `next_action` con candidatos `ATTACK`, `CHASE`, `WAIT`, `RETREAT`) muestra el patrón típico de una IA de actores que consulta cada tick un estado de contexto compartido y recibe una acción discreta con puntuación de confianza y margen, lo que permite además aplicar umbrales o reservas ante baja confianza.
- Enrutamiento de peticiones en atención al cliente: dado el historial de la conversación como contexto, el modelo puede elegir entre etiquetas como `FACTURACION`, `SOPORTE_TECNICO`, `DEVOLUCIONES` o `HABLAR_CON_HUMANO`, devolviendo el ranking completo para auditar por qué se tomó cada decisión.
- Selección de herramientas en agentes: con la lista de herramientas disponibles como conjunto de candidatos, el modelo puede actuar como enrutador de bajo coste que decide qué función invocar antes de que un modelo mayor redacte los argumentos, reduciendo latencia y coste en el bucle del agente.
- Guardarraíles y validación de pipelines: comprobaciones booleanas del tipo "¿la respuesta contiene datos personales?", "¿el resumen contradice el documento fuente?" o "¿el parche de código modifica la firma pública?", integradas como paso previo o posterior a la generación.
- Moderación y triaje de contenido: clasificación booleana de piezas de texto frente a políticas concretas, con `margin` como señal para derivar los casos dudosos a revisión humana en lugar de decidir automáticamente.
- Automatización de back-office y RPA: decisión sobre la siguiente acción en un flujo documental (por ejemplo `APROBAR`, `RECHAZAR`, `SOLICITAR_DOCUMENTACION`, `ESCALAR`) usando el expediente como contexto y aprovechando el prefix caching cuando varios expedientes comparten plantilla.
- Evaluación automática de prompts y regresiones: al devolver una etiqueta y una puntuación numérica, el endpoint puede usarse en CI/CD como aserción determinista ("el modelo debe elegir `SAFE` para esta entrada") sin necesidad de comparar cadenas de texto generado.
- Sistemas de recomendación y filtrado binario: decisiones del tipo "¿es relevante este producto para este perfil?" con umbral configurable sobre `confidence`, útil en etapas de prefiltrado donde interesa descartar candidatos antes de un ranking más costoso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La ficha del autor no incluye evaluaciones de MMLU, HumanEval, GSM8K ni métricas específicas de exactitud en tareas de decisión, calibración de la confianza o latencia medida. Tampoco se aportan comparaciones con alternativas.

## Requisitos de hardware

- VRAM estimada (estimación orientativa a partir del tamaño del modelo base de 4 000 millones de parámetros): en bfloat16 aproximadamente 8 GB solo de pesos, más caché KV, lo que sitúa el consumo práctico en el rango de 10 a 12 GB para contextos moderados.
- Cuantización de 8 bits: en torno a 4-5 GB de pesos. Cuantización de 4 bits: en torno a 2,5-3,5 GB.
- GPU recomendadas: para desarrollo y single-stream, RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4090 o L4/A10G en cloud. Para servicio con concurrencia y lotes, A100 o H100.
- Cabe en GPU de consumo: sí, en cualquier tarjeta con 12 GB o más de VRAM en bfloat16, y en tarjetas de 6-8 GB si se recurre a cuantización.
- Opciones de despliegue: la ruta documentada por el autor es vLLM con prefix caching más el paquete `pcd` y el servicio `pcd-cuda` exponiendo `POST /decision`. Al reutilizar los pesos del modelo base, también son viables otros servidores compatibles con Qwen3, como TGI, llama.cpp u Ollama, aunque en ese caso habría que reimplementar la capa de puntuación sobre candidatos, ya que no se distribuye como artefacto independiente.
- Latencia y throughput: no disponibles. Al tratarse de una decisión restringida a pocos tokens de salida, el coste dominante tiende a ser el prefill del contexto, que es precisamente lo que el prefix caching pretende amortizar entre peticiones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dsif2012/Qwen3-4B-Instruct-2507-Decision | ~4 000 millones (heredados) | No especificado por el autor; el modelo base declara 262 144 tokens | Decisión booleana o de elección con puntuaciones de candidatos | Apache-2.0 | Repositorio HF con ficha y enlaces; los pesos deben tomarse del modelo base |
| Qwen/Qwen3-4B-Instruct-2507 | ~4 000 millones | 262 144 tokens según la documentación del modelo base | Generación de texto e instrucciones general | Apache-2.0 | Pesos publicados en HuggingFace; la ficha de este repositorio no disponible en la información proporcionada |
| Decodificación restringida con Outlines, XGrammar o similares sobre un LLM genérico | Depende del modelo anfitrion | Depende del modelo anfitrion | Forzar la salida a un conjunto de etiquetas válidas | Depende del modelo anfitrion | Herramientas ampliamente disponibles; datos concretos de comparación no disponibles en la información proporcionada |
| Modelos de decisión o clasificación dedicados de tamaño similar | No disponible | No disponible | Clasificación o selección de etiquetas | No disponible | No disponible en la información proporcionada |

La comparación más informativa es con el propio modelo base: este repositorio no añade parámetros ni conocimiento nuevo, sino una capa de restricción y puntuación sobre el mismo conjunto de pesos. Frente a una pila de decodificación restringida genérica, la diferencia declarada es la exposición de `confidence`, `margin` y el ranking completo de candidatos, además del prefix caching en vLLM.

## Limitaciones y advertencias

- No es un modelo entrenado: no hay pesos, dataset ni proceso de ajuste propios, por lo que cualquier sesgo, limitación lingüística o error factual del modelo base se hereda íntegramente.
- No se han publicado evaluaciones. La exactitud en tareas de decisión, la calibración de las puntuaciones `confidence` y `margin` y el comportamiento ante candidatos ambiguos no están documentados.
- Las puntuaciones proceden de una softmax sobre los logits de los candidatos y no se documenta ningún proceso de calibración; un valor de 0,96 no equivale necesariamente a una probabilidad de acierto del 96 %, por lo que no conviene usarlo como umbral crítico sin validación propia.
- Riesgo de alucinación estructuralmente reducido al no generar texto libre, pero persiste el riesgo de seleccionar un candidato incorrecto cuando el contexto es insuficiente o contradictorio.
- Idiomas: la ficha declara únicamente inglés. No hay datos sobre el comportamiento en castellano u otros idiomas, más allá de lo que ofrezca el modelo base.
- Longitud de contexto: no especificada por el autor. El prefix caching resulta más útil cuanto más largo y más reutilizado sea el contexto, pero no se indica ningún límite efectivo ni el coste de memoria asociado.
- Madurez: versión v0.1, 0 descargas y 1 "like" en el momento de la consulta, sin pipeline declarado en HuggingFace. No hay evidencia de uso en producción ni de mantenimiento continuado.
- Dependencia de código externo: la funcionalidad real vive en el paquete `pcd` del repositorio de GitHub y en el servicio `pcd-cuda`, no en el repositorio de HuggingFace. La reproducibilidad depende de ese código, de su versionado y de que se mantenga compatible con los pesos de Qwen3.
- Licencia: Apache-2.0 permite uso comercial, pero los pesos de Qwen3-4B-Instruct-2507 conservan su propia licencia Apache-2.0, que debe respetarse por separado; conviene revisar además las condiciones de uso del modelo base publicadas por su autor.
- Antes de usarlo en producción se recomienda construir un conjunto de evaluación propio con casos representativos del dominio y medir exactitud y calibración de la confianza frente a alternativas como decodificación restringida sobre el modelo base sin capa adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dsif2012/Qwen3-4B-Instruct-2507-Decision
- Demo en vivo: https://huggingface.co/spaces/dsif2012/Qwen3-Decision-v1
- Código fuente: https://github.com/dsif2012/Qwen3-4B-Instruct-2507-Decision
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Búsqueda web: los resultados obtenidos no guardan relación con el modelo (corresponden a mapas de Sudáfrica) y no aportan papers, blogs ni repositorios adicionales utilizables para esta ficha.
