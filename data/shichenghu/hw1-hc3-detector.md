# shichenghu/hw1-hc3-detector

## Resumen

El modelo `shichenghu/hw1-hc3-detector` es un clasificador binario de texto que distingue respuestas escritas por personas de respuestas generadas por ChatGPT. Se trata de un ajuste fino (*fine-tuning*) del encoder `sentence-transformers/all-MiniLM-L6-v2` para clasificación de secuencias, con dos etiquetas de salida: `0` para texto humano y `1` para texto generado por ChatGPT. El autor es Shicheng Hu y el modelo se publicó como entregable de la asignatura CS 546 (Advanced Topics in Natural Language Processing), por lo que es un artefacto académico más que un modelo de producción.

Con 22.713.986 parámetros (unos 0,1 GB de pesos), es un modelo muy ligero: cabe en CPU, en cualquier GPU de consumo y en entornos de inferencia con memoria limitada. Su relevancia práctica radica en ese coste computacional mínimo combinado con una exactitud reportada de 0,9846 en el conjunto de prueba del corpus HC3, frente a una línea base de 0,8449. No obstante, se trata de una tarea y un dominio muy acotados (pares pregunta-respuesta de HC3), y la ficha no documenta generalización fuera de ese corpus.

Al no declarar licencia ni idiomas soportados, y con 0 descargas y 0 *likes* en el momento de la consulta, debe considerarse un modelo experimental: útil como referencia, como línea base de investigación o como componente de bajo coste dentro de un *pipeline* mayor, pero no como una solución de detección de texto generado lista para producción sin una validación adicional exhaustiva.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional tipo BERT (MiniLM-L6: 6 capas, dimensión oculta 384, 12 cabezas de atención) con cabeza de clasificación de secuencias |
| Parámetros totales | 22.713.986 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 256 tokens (límite del modelo base `all-MiniLM-L6-v2`; no confirmado explícitamente en la ficha del autor) |
| Tipos de cuantización | No disponible en el repositorio (solo pesos `safetensors`; el tamaño de ~0,1 GB es coherente con fp32) |
| Idiomas soportados | No disponible en la ficha. El corpus HC3 original incluye subconjuntos en inglés y chino, pero no se indica cuál se utilizó |
| Licencia | No disponible (la ficha no la declara; el modelo base `all-MiniLM-L6-v2` es Apache-2.0) |
| Formato de pesos | Safetensors |
| Biblioteca de carga | Transformers (`transformers`, `text-classification`) |
| Tarea (pipeline) | Text classification (clasificación binaria) |
| Dataset de evaluación | HC3 |
| Etiquetas | `0` = humano, `1` = ChatGPT |
| Tamaño del repositorio | 0,1 GB |
| Fecha de publicación | 2026-09-18 (según metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer bidireccional MiniLM de 6 capas, 384 dimensiones ocultas y 12 cabezas de atención, sobre el que se añade una cabeza de clasificación lineal para producir dos logits (humano / ChatGPT). El ajuste fino se realiza en modo de clasificación de secuencias supervisada, con un objetivo de entropía cruzada sobre las etiquetas del corpus. No hay componentes de generación, decodificación especulativa ni atención lineal: es un clasificador puro de una sola pasada.

Los datos de entrenamiento proceden del conjunto HC3, un corpus de pares pregunta-respuesta con respuestas humanas y respuestas generadas por ChatGPT. La ficha del autor no especifica el número de tokens de entrenamiento, la composición exacta del dataset, los hiperparámetros (épocas, tasa de aprendizaje, tamaño de lote), el uso de *early stopping* ni si se aplicó algún tipo de regularización. Tampoco se documenta ningún proceso de RLHF, DPO o ajuste por preferencias, algo esperable en un modelo de clasificación. La única métrica reportada es la exactitud: 0,8449 de línea base y 0,9846 tras el ajuste fino, evaluada según la ficha sobre el conjunto de prueba.

## Capacidades

- Clasificación binaria de texto en dos clases: respuestas humanas y respuestas generadas por ChatGPT.
- Optimizado específicamente para el formato pregunta-respuesta del corpus HC3 (respuestas conversacionales de tipo asistente).
- Inferencia muy rápida y de bajo coste, apta para CPU y para clasificación por lotes a gran escala.
- Compatible con la librería Transformers y con el etiquetado `text-embeddings-inference` y `endpoints_compatible` del repositorio, lo que facilita su despliegue como servicio HTTP de inferencia.
- No soporta generación de texto, razonamiento, código, matemáticas, visión ni audio.
- No soporta *tool calling* ni *function calling*.
- No soporta agentes ni razonamiento multi-paso; produce una única etiqueta por secuencia de entrada.
- Capacidad multilingüe: no confirmada en la documentación del modelo.
- No dispone de modo de razonamiento explícito (*thinking mode*) ni de salida de explicaciones; únicamente devuelve la clase y su probabilidad.

## Casos de uso

- Integridad académica en plataformas educativas: el modelo puede clasificar respuestas de alumnos en ejercicios de tipo pregunta-respuesta y marcar aquellas con alta probabilidad de haber sido generadas por ChatGPT, gracias a que fue entrenado sobre el mismo tipo de tarea y formato del corpus HC3.
- Filtrado de datos de entrenamiento: antes de construir un corpus propio, se puede pasar cada documento por el clasificador para descartar ejemplos sintéticos y evitar bucles de realimentación en el entrenamiento de modelos generativos.
- Moderación de contenido en foros y sitios de preguntas y respuestas: el clasificador sirve como primera etapa de bajo coste para etiquetar respuestas sospechosas de ser generadas automáticamente, dejando la revisión humana o un modelo mayor para la segunda etapa.
- Detección de spam generado por IA en formularios de contacto o comentarios: con 22,7 M de parámetros se puede ejecutar en CPU dentro del propio servidor de aplicaciones, sin depender de una GPU ni de APIs externas.
- Clasificación por lotes de grandes volúmenes de texto: al ser un modelo de 0,1 GB y una sola pasada, es viable procesar millones de documentos cortos en un *pipeline* de anotación offline.
- Línea base de investigación en detección de texto generado: sirve como referencia reproducible para comparar con enfoques zero-shot (por ejemplo, métodos basados en log-verosimilitud) o con detectores basados en modelos mayores.
- Pre-filtro dentro de un sistema de confianza y seguridad: descartar el texto claramente humano antes de aplicar análisis más caros (perplejidad, marcas de agua, clasificadores grandes).
- Etiquetado asistido para construir datasets de detección: usar las predicciones del modelo como preanotación que luego revisa un anotador humano, con el consiguiente ahorro de tiempo.

## Benchmarks y rendimiento

La única información de rendimiento publicada en la model card es la exactitud sobre el conjunto de prueba de HC3:

| Métrica | Modelo | Resultado |
|---|---|---|
| Exactitud (accuracy) | Línea base | 0,8449 |
| Exactitud (accuracy) | Modelo ajustado (`hw1-hc3-detector`) | 0,9846 |

No se han publicado resultados de benchmarks en la información disponible para MMLU, HumanEval, GSM8K ni ninguna otra prueba estandarizada, algo lógico dado que el modelo no es generativo. Tampoco se reportan precisión, recall, F1, matriz de confusión, tamaño exacto del conjunto de prueba ni la definición del clasificador usado como línea base.

## Requisitos de hardware

- VRAM estimada: unos 91 MB en fp32, unos 46 MB en fp16 y unos 23 MB en int8 (cálculo a partir de los 22,7 M de parámetros; no hay ficheros cuantizados publicados).
- GPU recomendadas: cualquiera con al menos 1 GB de VRAM. Funciona sin problema en GTX 1050 Ti, RTX 2060, RTX 3060, RTX 4090, T4, L4, A10, A100 y H100; las GPU grandes solo aportan ventaja en escenarios de altísimo volumen por lotes.
- Cabe en GPU de consumo: sí, en todas las GPU de consumo actuales e incluso en iGPU con memoria compartida suficiente.
- Ejecución en CPU: viable y, para cargas moderadas, suficiente, dado el reducido número de parámetros y la ventana de 256 tokens.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, servicios compatibles con Text Embeddings Inference (etiqueta del repositorio), ONNX Runtime, TorchScript y envoltorios propios con FastAPI. vLLM no es la vía habitual para este tipo de modelo (está orientado a generación). `llama.cpp` u Ollama requerirían una conversión previa a GGUF, no publicada.
- Latencia y throughput: no disponibles como medida publicada. Por tamaño, la inferencia por secuencia es del orden de milisegundos o menos en GPU y de pocos milisegundos en CPU moderna, pero se trata de una estimación, no de un dato verificado.
- Almacenamiento: menos de 0,1 GB de pesos, trivial de distribuir junto a la aplicación.

## Comparativa con modelos similares

No hay resultados de benchmarks públicos de alternativas en la información proporcionada, por lo que la comparación es estructural:

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `shichenghu/hw1-hc3-detector` | 22,7 M | 256 tokens (base MiniLM) | Clasificación humano vs ChatGPT (HC3) | No disponible | HuggingFace, 0 descargas |
| `sentence-transformers/all-MiniLM-L6-v2` (base) | 22,7 M | 256 tokens | Embeddings de frases / similitud semántica | Apache-2.0 | HuggingFace, ampliamente usado |
| Encoder tipo BERT-base ajustado para detección de texto generado | 110 M | 512 tokens | Clasificación binaria o multietiqueta | Depende del autor | Habituales en HuggingFace |
| Detectores comerciales de texto generado (por ejemplo, servicios tipo GPTZero) | No disponible | No disponible | Detección de texto generado | Propietaria | API de pago, sin pesos públicos |

Frente al modelo base, la diferencia es funcional: el base genera embeddings y no clasifica, mientras que este modelo incorpora una cabeza de clasificación binaria. Frente a encoders mayores, este modelo sacrifica capacidad de representación (384 dimensiones frente a 768) a cambio de un coste de inferencia unas cinco veces menor en número de parámetros. No se dispone de datos comparativos de exactitud entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Dominio muy restringido: el modelo se entrenó sobre el corpus HC3, compuesto por respuestas conversacionales de ChatGPT. Su comportamiento fuera de ese dominio (documentos largos, textos técnicos, ensayos, transcripciones) no está validado y probablemente degrade de forma notable.
- Específico de ChatGPT: no se ha demostrado que detecte texto generado por otros modelos (Claude, Gemini, Llama u otros), ni texto generado con reescritura posterior o paráfrasis.
- Riesgo de falsos positivos: los clasificadores basados en estilo tienden a marcar como sintético el texto humano muy formal, muy pulido o traducido. La ficha no reporta precisión, recall ni umbral de decisión, por lo que se desconoce el equilibrio entre falsos positivos y falsos negativos.
- Sin licencia declarada: no se especifican condiciones de uso comercial, redistribución ni modificación. Esto es un bloqueo legal potencial para cualquier uso en producción; el modelo base es Apache-2.0, pero el ajuste fino no hereda necesariamente esa licencia de forma explícita.
- Idiomas no documentados: no se indica qué idiomas cubre el ajuste fino, lo que impide garantizar un comportamiento correcto más allá del subconjunto del corpus empleado.
- Ventana de 256 tokens: los textos más largos deben truncarse o dividirse en fragmentos, lo que puede alterar la predicción en documentos extensos.
- Riesgo de alucinación: no aplica directamente, porque el modelo no genera texto; su limitación análoga es que no aporta ninguna justificación de la etiqueta ni indicadores de confianza calibrados.
- Artefacto académico sin mantenimiento: 0 descargas y 0 *likes*, sin historial de versiones, sin evaluación de sesgos, sin análisis de impacto ambiental y sin garantía de soporte. La fecha de creación registrada (2026-09-18) es inusual y no se aclara.
- No debe usarse como prueba concluyente en decisiones disciplinarias o legales: la exactitud en un corpus académico concreto no equivale a fiabilidad forense.
- Sin cuantizaciones publicadas: cualquier despliegue en formatos GGUF, ONNX o int8 requiere una conversión y validación por parte del usuario.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shichenghu/hw1-hc3-detector
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2

No se han encontrado enlaces adicionales relevantes en la búsqueda web: los resultados devueltos corresponden a páginas de soporte y blog de Microsoft (contacto, inicio de sesión en Hotmail, actualizaciones de Exchange Server), sin relación alguna con este modelo.
