# drofn/SenseNova-Loop-9B-8GB-GGUF

## Resumen

SenseNova-Loop-9B-8GB-GGUF es una colección de cuantizaciones GGUF de precisión mixta del modelo SenseNova-Loop-9B, un decodificador de aproximadamente 9.000 millones de parámetros (8.956.949.376 exactos) publicado por SenseNova y empaquetado por el usuario drofn. El objetivo declarado es hacer viable la inferencia de contexto largo en tarjetas NVIDIA de 8 GB de VRAM, un segmento tradicionalmente excluido de los modelos de 9B con ventanas de contexto extensas. La innovación principal no está en el modelo base sino en la asignación de bits: en lugar de aplicar una receta uniforme como Q4_K_M, el autor mide la sensibilidad por grupo de tensores y distribuye el presupuesto de bits según la divergencia KL frente a Q8_0.

El modelo base emplea una arquitectura de transformer con bloque de capas en bucle (*looped transformer*): almacena 32 capas decodificadoras y ejecuta las capas 4–27 dos veces por token, lo que resulta en 56 ejecuciones de capa por pasada forward. Combina atención lineal (Gated DeltaNet) con atención completa en una proporción de tres a uno, y utiliza hyper-conexiones multi-flujo restringidas a variedad (mHC) con enrutamiento normalizado por 20 iteraciones de Sinkhorn. El vocabulario es de 248.320 tokens y el contexto nativo alcanza 512K mediante YaRN x2.

La relevancia de esta ficha es doble: por un lado documenta una técnica de cuantización sensible a la arquitectura que puede replicarse en otros modelos; por otro, advierte de una dependencia crítica de despliegue, ya que la arquitectura `sensenova_loop` no está soportada por llama.cpp upstream, LM Studio ni Ollama en el momento de la publicación, y requiere una bifurcación parcheada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decodificador con bloque de capas en bucle (looped transformer), atención híbrida lineal/completa y hyper-conexiones mHC |
| Parametros totales | 8.956.949.376 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512K en el modelo base (YaRN x2); en los GGUF, hasta 132.864 tokens medidos en 8 GB de VRAM |
| Tipos de cuantizacion | GGUF de precisión mixta: 8GB-128K (4,44 bpw), 8GB-100K (4,95 bpw), 8GB-32K-HQ (6,27 bpw); KV cache q4_0 |
| Idiomas soportados | Inglés, chino, turco |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base en safetensors |
| Cabezas de atención completa | 16 query heads, 4 KV heads, head_dim 256 |
| Vocabulario | 248.320 tokens |
| Tamaño del repo | 10,5 GB |
| Modalidad | Solo texto en estos GGUF (el modelo base acepta imágenes; sin proyector mmproj) |

## Arquitectura y entrenamiento

El modelo base es un decodificador de unos 9B parámetros con una particularidad estructural: un bloque de capas recurrentes. Físicamente almacena 32 capas, pero las capas 4 a 27 se ejecutan dos veces por token, de modo que cada pasada forward implica 56 ejecuciones de capa. Esto incrementa el coste computacional por token sin aumentar el número de parámetros, una estrategia que busca profundidad efectiva adicional con el mismo presupuesto de memoria de pesos. El flujo residual utiliza hyper-conexiones multi-flujo restringidas a variedad (mHC) y el enrutamiento se normaliza con 20 iteraciones de Sinkhorn. La atención es híbrida: en cada grupo de cuatro capas hay tres capas de atención lineal (Gated DeltaNet) y una de atención completa, esta última con 16 cabezas de consulta, 4 de clave/valor y dimensión de cabeza 256. El contexto nativo es de 512K tokens mediante extensión YaRN con factor x2.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO, ya que la model card proporcionada corresponde a la cuantización y no al modelo base. La innovación documentada reside en el proceso de cuantización: el autor dividió los tensores en 14 grupos y subdividió el bloque en bucle en tres bandas, cuantizó cada grupo de forma independiente a Q2_K y Q4_K y midió la divergencia KL frente a Q8_0 en 40 ejecuciones de barrido. Con esos datos asignó bits según el coste en KLD por GB ahorrado. Los hallazgos reportados son que las capas 0–3 (especialmente sus tensores de atención lineal) son las más sensibles por GB, que las capas 28–31 son las menos sensibles, que dentro del bucle la banda 4–11 es entre 1,7 y 1,8 veces más sensible por GB que la banda 12–19, y que la sensibilidad de la atención lineal cae aproximadamente un factor 3 desde el inicio hasta el final del bucle.

## Capacidades

- Generación de texto conversacional y continuaciones de prosa en inglés, chino y turco.
- Razonamiento de contexto largo: la ventana efectiva en las variantes GGUF llega hasta 132.864 tokens medidos en hardware de 8 GB.
- Soporte de tool calling y diálogos de llamada a funciones, según el conjunto de evaluación empleado por el autor (glaive-function-calling-v2).
- Capacidad multimodal en el modelo base (acepta imágenes), aunque ausente en estas cuantizaciones al no incluir proyector mmproj.
- Procesamiento multilingüe limitado a los tres idiomas declarados; no se documenta cobertura adicional.
- No se documentan capacidades de audio, modo thinking explícito ni decodificación especulativa.

## Casos de uso

- Análisis de documentación técnica extensa en una estación de trabajo con GPU de 8 GB: la variante 8GB-100K permite cargar hasta 104.704 tokens de contexto con todas las capas en GPU, suficiente para procesar manuales, especificaciones o bases de código de tamaño medio sin segmentación.
- Asistentes conversacionales multi-turno con memoria larga: la ventana de 100K tokens permite mantener historiales de conversación prolongados y documentos de referencia adjuntos en la misma sesión, con una KV cache q4_0 que mantiene el consumo dentro de los 8 GB.
- Procesamiento de corpus en turco e inglés: el modelo declara soporte para ambos idiomas y el autor evaluó la calidad de cuantización sobre prosa de Wikipedia en turco e inglés, lo que respalda su uso en tareas de resumen y extracción sobre estos idiomas.
- Integración en pipelines de agentes con function calling: el soporte de tool calling documentado permite conectar el modelo a APIs externas en flujos de automatización, siempre que se despliegue sobre la bifurcación parcheada de llama.cpp.
- Despliegue en portátiles con RTX 4060 de 8 GB: el autor midió unos 6.900 MiB de 8.188 MiB de VRAM con todas las capas en GPU y solo la tabla de embeddings en RAM del sistema, lo que hace viable la inferencia local en equipos de consumo.
- Prototipado e investigación sobre arquitecturas en bucle: al ser una cuantización fiel del modelo base con métricas de KLD publicadas, sirve para estudiar el comportamiento de transformers con capas recurrentes sin necesidad de hardware de gama alta.
- Evaluación comparativa de técnicas de cuantización: los datos de KLD, same-top-token y perplejidad frente a Q8_0 y frente a un Q4_K_M estándar con la misma imatrix permiten reproducir y contrastar metodologías de asignación de bits por sensibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card proporciona exclusivamente métricas de fidelidad de cuantización frente a la referencia Q8_0, medidas con `llama-perplexity --kl-divergence` sobre 40 fragmentos de 512 tokens en dos conjuntos retenidos: conjunto 1, prosa de Wikipedia en turco e inglés; conjunto 2, Wikipedia en inglés y diálogos de tool calling de glaive-function-calling-v2.

| Cuantización | Tamaño (GB) | bpw medio | KLD media vs Q8_0 (conj. 1 / conj. 2) | Mismo token top % (conj. 1 / conj. 2) | PPL (conj. 1 / conj. 2) |
|---|---:|---:|---:|---:|---:|
| Q8_0 (referencia, no publicada) | 9,53 | 8,51 | 0 | 100 | 11,555 / 2,633 |
| 8GB-128K | 4,97 | 4,44 | 0,1375 / 0,1213 | 82,6 / 92,0 | 12,266 / 2,682 |
| 8GB-100K | 5,54 | 4,95 | 0,0703 / 0,0762 | 88,5 / 94,5 | 11,584 / 2,640 |
| 8GB-32K-HQ | 7,02 | 6,27 | 0,0182 / 0,0245 | 93,7 / 97,2 | 11,694 / 2,650 |
| Q4_K_M estándar (misma imatrix) | 5,62 | 5,02 | 0,1064 / 0,1235 | 86,4 / 93,5 | 11,795 / 2,736 |

El dato más relevante es que la variante 8GB-100K, con 5,54 GB y 4,95 bpw, obtiene una KLD de 0,0703 / 0,0762 frente a la del Q4_K_M estándar de 0,1064 / 0,1235, es decir, entre un 34% y un 38% menor, ocupando además 0,08 GB menos. La variante 8GB-32K-HQ se aproxima más a Q8_0 pero limita el contexto a 38.400 tokens. Estas métricas no miden precisión en tareas.

## Requisitos de hardware

- VRAM estimada: unos 6.900 MiB de 8.188 MiB medidos con la variante en uso, todas las capas en GPU, KV cache q4_0 y solo la tabla de embeddings en RAM del sistema (0,70 GB a Q5_K, 0,83 GB a Q6_K en el archivo HQ).
- GPU de referencia en las mediciones: RTX 4060 de 8 GB bajo Windows sin monitor conectado.
- Cabe en GPU de consumo de 8 GB (RTX 4060, RTX 3070, RTX 2070, RX 6600 en el ecosistema equivalente); con pantalla conectada hay que reducir el valor de `-c` según la tabla del autor.
- Contexto máximo probado por variante: 132.864 tokens (8GB-128K), 104.704 tokens (8GB-100K) y 38.400 tokens (8GB-32K-HQ).
- Despliegue: requiere una bifurcación parcheada de llama.cpp; llama.cpp upstream, LM Studio y Ollama no soportan la arquitectura `sensenova_loop` (incidencia ggml-org/llama.cpp#31571 abierta).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Observaciones |
|---|---:|---|---|---|
| SenseNova-Loop-9B-8GB-GGUF | 8,96B | Hasta 132.864 tokens en 8 GB (512K en el base) | Apache-2.0 | Cuantización de precisión mixta; requiere llama.cpp parcheado |
| Q4_K_M estándar del mismo modelo (misma imatrix) | 8,96B | Limitado por VRAM; menor que 8GB-100K en la misma tarjeta | Apache-2.0 | 5,62 GB, 5,02 bpw, KLD 0,1064 / 0,1235; referencia directa de comparación |
| Q8_0 del mismo modelo (no publicado) | 8,96B | No disponible | Apache-2.0 | 9,53 GB, 8,51 bpw; no cabe en 8 GB, usado solo como referencia de calidad |

No se dispone de datos de otros modelos de la misma categoría (9B con contexto largo y licencia permisiva) en la información proporcionada, por lo que la comparativa se limita a las variantes del propio modelo.

## Limitaciones y advertencias

- Dependencia crítica de una bifurcación no oficial de llama.cpp: sin ella el modelo no carga en las herramientas estándar, lo que complica el despliegue en producción y la actualización del runtime.
- Solo texto: estas cuantizaciones carecen de proyector de visión, por lo que las capacidades de imagen del modelo base no están disponibles.
- Cobertura lingüística restringida a inglés, chino y turco; el rendimiento en castellano no está documentado y probablemente sea deficiente.
- Riesgo de alucinación inherente a los modelos de 9B, agravado en contextos muy largos donde la atención efectiva puede degradarse; las métricas publicadas miden fidelidad de cuantización, no veracidad.
- Sesgos no documentados: la model card no incluye análisis de sesgos ni de seguridad.
- Las métricas de KLD y perplejidad no equivalen a precisión en tareas; un KLD bajo no garantiza buen rendimiento en razonamiento, código o matemáticas.
- La variante 8GB-128K presenta una degradación notable (KLD 0,1375 / 0,1213, mismo token top del 82,6% en el conjunto 1); no es recomendable cuando la calidad prima sobre la longitud de contexto.
- El uso con pantalla conectada reduce el contexto máximo utilizable; hay que ajustar `-c` y verificar el consumo real de VRAM.
- Aunque la licencia es Apache-2.0 y permite uso comercial, la ausencia de benchmarks de tareas obliga a evaluar el modelo en el dominio concreto antes de adoptarlo en producción.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y la subida de archivos estaba en curso según la model card; conviene verificar la integridad de los archivos antes de desplegar.

## Enlaces

- Repositorio Hugging Face de la cuantización: https://huggingface.co/drofn/SenseNova-Loop-9B-8GB-GGUF
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B
- Archivo recomendado (8GB-100K): https://huggingface.co/drofn/SenseNova-Loop-9B-8GB-GGUF/resolve/main/SenseNova-Loop-9B-8GB-100K.gguf
- Archivo 8GB-128K: https://huggingface.co/drofn/SenseNova-Loop-9B-8GB-GGUF/resolve/main/SenseNova-Loop-9B-8GB-128K.gguf
- Archivo 8GB-32K-HQ: https://huggingface.co/drofn/SenseNova-Loop-9B-8GB-GGUF/resolve/main/SenseNova-Loop-9B-8GB-32K-HQ.gguf
- Gráfica de calidad frente a tamaño: https://huggingface.co/drofn/SenseNova-Loop-9B-8GB-GGUF/resolve/main/assets/quality_vs_size.png
- Incidencia de soporte de la arquitectura en llama.cpp: https://github.com/ggml-org/llama.cpp/issues/31571
