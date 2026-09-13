# sinatras/torug-safety-bert-q8

## Resumen

Torug Turkish safety classifier — BERT q8 es un clasificador de seguridad de tres etiquetas (`safe`, `warn`, `block`) diseñado para prompts en turco dentro del sistema Torug. Lo publica el usuario sinatras en HuggingFace y su función es actuar como una señal de seguridad sobre la entrada del usuario, no como un modelo generativo: no produce respuestas ni envía prompts a servicios de inferencia alojados. Está empaquetado para ejecutarse localmente con Transformers.js y ONNX Runtime, lo que permite integrarlo tanto en backend como directamente en el navegador.

Técnicamente es un `BertForSequenceClassification` de 12 capas con hidden size 768 y una longitud máxima de entrada de 512 tokens. El artefacto publicado es una cuantización dinámica por canal QUInt8 (solicitada como `dtype: "q8"`) en ONNX opset 17, con dimensiones de batch y secuencia dinámicas. El fichero de pesos ocupa 111.844.312 bytes y el conjunto de ficheros de inferencia ronda los 113 MB, por lo que el coste de despliegue es muy bajo.

Su relevancia actual es doble. Por un lado, el autor afirma que se detectan mejor las peticiones dañinas que con el clasificador DistilBERT anterior de Torug, según pruebas de diagnóstico locales. Por otro, el propio autor documenta limitaciones relevantes y explícitas: falsos bloqueos de peticiones educativas o de soporte benignas, peticiones dañinas no detectadas, sensibilidad a la redacción y variaciones de decisión entre ejecución FP32, q8 en CPU y WASM en navegador. La model card no incluye datos de entrenamiento, código de entrenamiento, manifiestos de particiones ni una licencia de reutilización, y no se reclama ninguna precisión sobre conjuntos de evaluación retenidos ni puntuación oficial de TurkBench.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BERT de 12 capas, `BertForSequenceClassification`, hidden size 768 |
| Parámetros totales | no disponible (el artefacto cuantizado q8 pesa 111.844.312 bytes) |
| Longitud de contexto | 512 tokens de entrada como máximo |
| Tipos de cuantización | QUInt8 dinámica por canal (q8); también se evaluó FP32 |
| Idiomas soportados | turco (tr) |
| Licencia | no disponible (no se facilitó licencia de reutilización con el checkpoint) |
| Formato de pesos | ONNX opset 17, con dimensiones de batch y secuencia dinámicas; consumible desde Transformers.js |
| Tarea | clasificación de texto, 3 etiquetas: `safe`, `warn`, `block` |
| SHA-256 de los pesos | `bd0973b66f3eb973d13e753e9450737e2a6a606fc45ee5a1cbba3e9beb364e0c` |
| Tamaño de descarga | aproximadamente 113 MB con los ficheros de inferencia de soporte |
| Tamaño del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura declarada es un transformer encoder BERT de 12 capas con hidden size 768, culminado con una cabeza de clasificación de secuencia de tres etiquetas. El artefacto exportado usa ONNX opset 17 con ejes de batch y de secuencia dinámicos, lo que permite procesar lotes de tamaño variable y entradas de longitud variable hasta el límite de 512 tokens. La cuantización es QUInt8 dinámica por canal; el autor indica que el fichero q8 es exactamente el artefacto evaluado el 11 de septiembre de 2026 y no una reexportación posterior, y que `artifact-manifest.json` registra el tamaño y el digest SHA-256 de cada fichero de inferencia. Se recomienda fijar el commit del repositorio en consumidores de producción.

No hay información disponible sobre el proceso de entrenamiento: no se proporcionan el conjunto de datos, el número de tokens, la composición del corpus, el código de entrenamiento, los manifiestos de particiones ni si hubo ajuste por RLHF, DPO u otra técnica de alineación. Tampoco se documenta ninguna innovación técnica más allá de la exportación ONNX y la cuantización q8. Las únicas referencias comparativas proceden de pruebas de diagnóstico locales del autor, que señalan una mejora en la detección de peticiones dañinas frente al clasificador DistilBERT anterior de Torug, sin cifras publicadas.

## Capacidades

- Clasificación de prompts en turco en tres categorías discretas: `safe`, `warn` y `block`.
- Ejecución local sin dependencia de servicios de inferencia alojados, tanto en backend como en navegador mediante Transformers.js y ONNX Runtime.
- Inferencia sobre entradas de hasta 512 tokens, con lotes y longitudes dinámicas gracias a los ejes dinámicos de ONNX.
- Funcionamiento como una señal de entrada de seguridad dentro de un sistema mayor (Torug aplica reglas y umbrales propios de forma separada).
- No genera texto, no responde preguntas y no evalúa historial de conversación.
- No realiza enrutado a soporte de crisis ni ofrece recomendaciones de actuación.
- Capacidades multilingües: no disponibles; el modelo está declarado únicamente para turco (`tr`).
- Tool calling, function calling, agentes y razonamiento multi-paso: no aplicable, es un clasificador.

## Casos de uso

- Filtrado previo de la entrada en asistentes conversacionales en turco: el clasificador se ejecuta antes de la generación y etiqueta cada prompt como `safe`, `warn` o `block`, de modo que el orquestador pueda aplicar reglas y umbrales propios sin exponer el prompt a un servicio externo.
- Moderación en el cliente (navegador): al estar empaquetado para Transformers.js con ONNX Runtime y WASM, puede ejecutarse en el propio navegador del usuario, lo que reduce la latencia de red y evita enviar el texto a un servidor. Hay que tener en cuenta que el autor documenta diferencias de decisión entre la ejecución FP32, la q8 en CPU y la WASM en navegador.
- Puerta de seguridad en backends con ONNX Runtime: el modelo se integra como un paso síncrono de bajo coste (unos 113 MB de ficheros) en un pipeline de atención al cliente o de chatbot en turco, generando una decisión que se registra junto al resto de la traza.
- Auditoría y cumplimiento con residencia de datos estricta: al no requerir llamadas a servicios alojados, encaja en entornos con requisitos de residencia de datos o en despliegues con conectividad restringida donde el texto no puede salir de la infraestructura propia.
- Señal complementaria a reglas heurísticas: dado que el propio autor lo describe como «una señal de seguridad de entrada, no una garantía», se puede combinar con listas de bloqueo y filtros léxicos para elevar la cobertura, usando el `warn` como categoría de revisión y no como bloqueo automático.
- Control de flujo en aplicaciones educativas o de soporte: el modelo puede clasificar consultas entrantes antes de decidir el tratamiento. Sin embargo, el autor advierte de falsos bloqueos en peticiones educativas o de soporte benignas, por lo que este caso requiere umbrales conservadores y revisión humana.
- Telemetría de seguridad: agregar las etiquetas predichas para medir la proporción de intentos dañinos en un canal turco y priorizar la revisión manual, siempre teniendo en cuenta la sensibilidad del modelo a la redacción y las peticiones dañinas que se le escapan.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se reclama precisión sobre conjuntos retenidos ni puntuación oficial de TurkBench. Lo único documentado son hallazgos cualitativos de pruebas de diagnóstico locales:

| Aspecto evaluado | Resultado declarado |
|---|---|
| Comparación con el clasificador DistilBERT anterior de Torug | Mejora en la detección de peticiones dañinas (sin cifras) |
| Falsos bloqueos de peticiones educativas o de soporte benignas | Observados |
| Peticiones dañinas no detectadas | Observadas |
| Sensibilidad a la redacción del prompt | Observada |
| Diferencias de decisión entre FP32, q8 en CPU y WASM en navegador | Observadas |
| Precisión sobre conjunto retenido / TurkBench | No disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; el conjunto de pesos y ficheros de soporte ocupa aproximadamente 113 MB en memoria.
- GPU recomendadas: no aplicable. El modelo está pensado para CPU y para WASM en navegador con ONNX Runtime.
- Compatibilidad con GPU de consumo: irrelevante por tamaño; cualquier GPU con unos pocos cientos de MB libres podría alojarlo, pero no es el escenario objetivo.
- Opciones de despliegue: Transformers.js (con `dtype: "q8"`), ONNX Runtime en CPU y WASM en navegador. vLLM, llama.cpp, Ollama y TGI no son aplicables a un modelo de clasificación de este tipo.
- Latencia y throughput estimados: no disponibles. No se publican cifras de latencia ni de peticiones por segundo.
- Almacenamiento: repositorio de 0,1 GB; descarga de inferencia de aproximadamente 113 MB.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones completas de alternativas en la información proporcionada. El único comparador mencionado por el autor es el clasificador DistilBERT anterior de Torug, del que no se detallan parámetros, contexto, licencia ni resultados numéricos.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Torug Turkish safety classifier — BERT q8 | no disponible (BERT 12 capas, hidden 768) | 512 tokens | Mejora cualitativa frente al DistilBERT anterior; sin cifras | no disponible | HuggingFace, ONNX + Transformers.js |
| Clasificador DistilBERT anterior de Torug | no disponible | no disponible | Inferior en detección de peticiones dañinas según el autor | no disponible | no disponible |
| Otras alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo es una única señal de seguridad de entrada: no garantiza que toda petición insegura se detecte ni que toda respuesta permitida sea segura. Torug aplica reglas y umbrales separados, y un resultado `warn` no detiene por sí mismo la generación.
- Falsos bloqueos documentados en peticiones educativas o de soporte benignas.
- Peticiones dañinas no detectadas documentadas en las pruebas de diagnóstico del autor.
- Sensibilidad a la redacción: variaciones mínimas en el texto pueden cambiar la etiqueta predicha.
- Variaciones de decisión entre FP32, q8 en CPU y WASM en navegador; las decisiones no son idénticas entre backends.
- Truncado a 512 tokens: el texto que supere esa longitud puede ocultar contenido relevante, y quien invoca el modelo debe asumir la responsabilidad sobre todo el contenido que afirma haber comprobado.
- El modelo no evalúa el historial de conversación ni ofrece enrutado a soporte de crisis.
- No se proporcionaron datos de entrenamiento, código de entrenamiento, manifiestos de particiones ni licencia de reutilización con el checkpoint. No se reclama ninguna licencia permisiva, por lo que hay que comprobar los derechos y términos aplicables antes de redistribuir o reutilizar el modelo.
- Idiomas: solo turco. No hay evidencia de funcionamiento en otros idiomas.
- Riesgo de sesgos: no evaluado ni documentado en la información disponible.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificación errónea (falsos positivos y falsos negativos) en ambas direcciones.
- Para producción, se recomienda fijar el commit del repositorio y verificar los digests SHA-256 registrados en `artifact-manifest.json`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sinatras/torug-safety-bert-q8
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
- La búsqueda web realizada no devolvió resultados relevantes para este modelo (el único resultado encontrado, un hilo de Microsoft Community sobre correo electrónico en Outlook, no guarda relación con el modelo).
