# chaoliangUNSW/MacJev-322M-4K-Laya

## Resumen

MacJev-322M-4K-Laya es un modelo de decisión compacto (321,9 millones de parámetros) desarrollado por chaoliangUNSW a partir del checkpoint multilingüe de `convaiinnovations/laya`, cuya línea encoder procede de `jhu-clsp/mmBERT-base`. No es un modelo generativo ni conversacional: recibe un estado observado y una pregunta con un conjunto de respuestas candidatas, y en un único pase forward no autorregresivo devuelve una probabilidad calibrada para cada candidata. Su función es rankear acciones, enrutar llamadas a herramientas y verificar el estado de una tarea en agentes locales que se ejecutan íntegramente en la máquina del usuario.

El problema que resuelve es concreto: los agentes locales necesitan decidir qué herramienta invocar o si una tarea ha concluido, y hacerlo con un LLM generativo implica latencia y coste innecesarios, además de probabilidades mal calibradas. MacJev puntúa todas las opciones de una vez, sin generar tokens, y admite hasta 4096 tokens de entrada total (1024 reservados para la pregunta y las opciones), cuatro veces el presupuesto por defecto del checkpoint del que parte. Soporta tres formatos de pregunta: `choice` (elección entre claves definidas en la petición), `score` (índices ordenados) y `noul` (verdadero/falso).

Su relevancia actual radica en dos factores. Primero, el salto medido sobre el checkpoint base en tareas de verificación sobre entradas largas (de 31,0 % a 89,1 % de acierto en comprobaciones sí/no con 2K–4K tokens) y la reducción del error de calibración en entradas largas de 0,253 a 0,032, lo que permite fijar umbrales de confianza fiables. Segundo, que el modelo devuelve decisiones pero nunca ejecuta acciones, de modo que el agente conserva su propio ejecutor y su paso de confirmación. La licencia es Apache 2.0 y solo cubre inglés y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (linaje `jhu-clsp/mmBERT-base` vía Laya) con decision transformer y scorer; inferencia no autorregresiva en un solo pase |
| Parametros totales | 321.908.998 según safetensors (la model card indica 321.908.995); 44.861.185 parámetros adaptados durante el ajuste |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 4096 tokens de entrada total; 1024 tokens para la pregunta y las opciones. Las entradas que exceden el presupuesto lanzan error en lugar de truncar |
| Tipos de cuantizacion | FP32 (PyTorch y MLX) y F16 (GGUF). No se publican variantes INT8, INT4 ni Q4_K_M oficiales |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PyTorch FP32), MLX FP32 y GGUF F16 |

## Arquitectura y entrenamiento

La base es el subfolder `multilingual` de `convaiinnovations/laya`, revisión `1c5edc17a7acd8701df6fc341c0d179f1c62c982`, con linaje de encoder `jhu-clsp/mmBERT-base`. Sobre esa base se entrenaron las seis últimas capas del encoder, los embeddings de tipo, el decision transformer y el scorer, partiendo del head de decisión oficial del modelo original. El total adaptado es de 44.861.185 parámetros sobre los 321,9 millones del conjunto. La inferencia es de un solo pase: todas las candidatas se puntúan simultáneamente, sin generación de tokens, y la respuesta se extrae de las probabilidades asociadas a cada opción. Cada tipo de pregunta (`choice`, `score`, `noul`) tiene su propia temperatura, ajustada sobre 6000 decisiones de calibración independientes.

Los datos de entrenamiento son 50.000 decisiones repartidas a partes iguales entre entradas cortas y largas: 25.000 de hasta 1K tokens, 12.500 entre 1K y 2K y 12.500 entre 2K y 4K. A ello se suman 3000 decisiones de desarrollo y 6000 de calibración, separadas. 20.000 de esas decisiones son específicas de macOS y se construyeron a partir de trayectorias verificadas sobre archivos, Chrome, Word, Excel y PowerPoint, incluyendo casos de recuperación de errores; el resto combina decisiones de lenguaje general, tipadas y de reglas. El objetivo de entrenamiento es ajuste supervisado con pérdida ordinal, más replay de las salidas verificadas del modelo original y una penalización de consistencia ante permutaciones de candidatas, aplicado por etapas desde 1K hasta 4K tokens de entrada. La selección de recetas se hizo sobre datos de desarrollo y las mejoras se replicaron en tres semillas independientes; la versión publicada es la semilla elegida a priori sobre desarrollo.

## Capacidades

- Clasificación y enrutado de decisiones: dado un estado y una pregunta, devuelve probabilidad por cada candidata, con las claves en el orden de inserción definido en la petición.
- Preguntas de elección (`choice`): selecciona entre acciones candidatas definidas en tiempo de petición, sin necesidad de reentrenar ningún head clasificador.
- Preguntas de puntuación (`score`): devuelve índices de cadena ordenados (`"0"`, `"1"`, ...) para medir grado de completitud de una tarea.
- Preguntas de verificación (`noul`): devuelve `"false"` o `"true"` para comprobaciones del tipo sí/no sobre el estado observado.
- Lectura de observaciones largas: acierto del 89,1 % en comprobaciones sí/no con entradas de 2K–4K tokens.
- Probabilidades calibradas: error de calibración de 0,032 en entradas largas, apto para fijar umbrales de confianza.
- Enrutado de herramientas (tool routing) y verificación de estado de tarea en agentes locales.
- Automatización de escritorio en macOS: trayectorias verificadas sobre archivos, Chrome, Word, Excel y PowerPoint, con casos de recuperación.
- Multilingüe limitado a inglés y chino.
- Sin llamadas a API: ejecución totalmente local en CPU, Apple Silicon (MPS) o CUDA.
- Modo de solo decisión: el modelo no ejecuta acciones; el resultado incluye `actions_executed: False`.
- No soporta generación de texto libre, razonamiento multi-step generativo ni tool calling en el sentido conversacional; se expone como herramienta o servidor MCP si se quiere usar desde un asistente de chat.

## Casos de uso

- Enrutado de herramientas en agentes de escritorio: el agente construye un estado con la petición del usuario y la lista de acciones disponibles, y MacJev devuelve la probabilidad de cada acción (`open_browser`, `copy_file`, `ask_user`, etc.). Es adecuado porque puntúa todas las candidatas en un solo pase y con hasta 4096 tokens de contexto, sin coste de generación.
- Verificación de finalización de tareas: antes de cerrar un flujo, el agente pregunta si la observación demuestra que el objetivo se ha cumplido (`noul`) y decide continuar o reintentar. La calibración de 0,032 permite fijar un umbral de confianza y derivar a revisión humana por debajo de él.
- Automatización de ofimática en macOS: dado un estado que describe el contenido de un documento de Word, Excel o PowerPoint, el modelo puntúa el siguiente paso o comprueba si una operación concreta se ha aplicado, usando los 20.000 ejemplos de trayectorias verificadas de la plataforma.
- Recuperación de errores en flujos automatizados: el modelo se entrenó con casos de recuperación, de modo que puede clasificar un estado de fallo y elegir entre reintentar, cambiar de estrategia o pedir aclaración al usuario.
- Enrutado de bajo coste delante de un LLM grande: MacJev resuelve las decisiones simples (¿hace falta una herramienta?, ¿cuál?) y solo las peticiones que superan el umbral de confianza se envían al modelo generativo, reduciendo latencia y consumo.
- Moderación o clasificación de texto con conjuntos de etiquetas definidos en tiempo de petición: al aceptar las opciones en cada llamada, sirve para tareas de clasificación tipada y de noticias (AG News) o de emoción sin reentrenar el cabezal.
- Servidor MCP para asistentes de chat: exponiendo `decide()` como herramienta o servidor MCP, un asistente tipo LM Studio puede delegar en MacJev las decisiones estructuradas manteniendo el modelo de decisión aislado del ejecutor.
- Procesamiento por lotes en local sin GPU dedicada: el tamaño reducido del modelo permite clasificar grandes volúmenes de decisiones en CPU o en Apple Silicon, sin enviar datos a servicios externos, lo que resulta relevante en entornos con requisitos de privacidad.

## Benchmarks y rendimiento

Resultados declarados en la model card sobre conjuntos de test reservados, comparando MacJev con el checkpoint multilingüe de Laya del que parte, con el mismo presupuesto de 4096 tokens de entrada:

| Tarea | Laya multilingual | MacJev |
|---|---:|---:|
| Comprobaciones sí/no con entradas de 2K–4K tokens | 31,0 % | 89,1 % |
| Decisiones de reglas con entradas de 2K–4K tokens | 23,7 % | 44,7 % |
| Decisiones de reglas en entradas largas, todas las longitudes | 23,2 % | 39,7 % |
| Decisiones tipadas | 35,2 % | 42,2 % |
| Error de calibración en entradas largas (menor es mejor) | 0,253 | 0,032 |

En benchmarks públicos, sobre 11.600 decisiones públicas procedentes de decisiones tipadas, Emotion y AG News, la exactitud aumenta 1,5 puntos, con un intervalo del 95 % de 1,1 a 1,8. Las ganancias en entradas largas y en benchmarks públicos se replican en las tres semillas entrenadas de forma independiente. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otras suites de razonamiento en la información disponible.

## Requisitos de hardware

- VRAM estimada para los pesos: en FP32 aproximadamente 1,29 GB para 321,9 millones de parámetros; en FP16 aproximadamente 0,64 GB. A ello hay que sumar activaciones y el runtime, cuyo consumo crece con los 4096 tokens de entrada.
- Inferencia en FP32 sobre CPU funcional para uso interactivo; el modelo está diseñado para ejecutarse en la máquina local y el quickstart oficial usa `device="mps"` en Apple Silicon, con `"cpu"` y `"cuda"` como alternativas.
- Cabe sin problema en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y equivalentes, con margen amplio incluso en FP32.
- En Apple Silicon se recomienda la ruta MLX FP32, que evita depender de PyTorch, o la ruta MPS del repositorio principal.
- GPU de centro de datos (A100, H100) no son necesarias para este tamaño; solo tendrían sentido para servir muchas réplicas en paralelo o lotes muy grandes.
- Opciones de despliegue: PyTorch (CPU, MPS, CUDA) con el runtime `macjev` incluido en el repositorio; MLX en Apple Silicon; GGUF F16 con `llama-server` de llama.cpp, incluso el binario incluido en LM Studio. Cada formato incluye un runtime pequeño que ejecuta el modelo completo con su head de decisión, ya que no es un modelo de chat estándar.
- Integración con vLLM o TGI: no disponible en la documentación publicada, al no tratarse de un modelo generativo autorregresivo y requerir el head de decisión.
- Latencia y throughput: no se publican cifras de latencia ni de tokens por segundo en la información disponible. El resultado de `decide()` incluye un campo `latency_ms` que permite medirla en el propio despliegue.

## Comparativa con modelos similares

Comparación directa documentada frente al checkpoint del que parte:

| Modelo | Parametros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MacJev-322M-4K-Laya | 321,9 M | 4096 tokens de entrada total | 89,1 % en sí/no 2K–4K; 44,7 % en reglas 2K–4K; error de calibración 0,032 | Apache 2.0 | HuggingFace, en FP32, MLX y GGUF F16 |
| convaiinnovations/laya (subfolder multilingual) | no disponible | 1024 tokens por defecto (una cuarta parte del presupuesto de MacJev) | 31,0 % en sí/no 2K–4K; 23,7 % en reglas 2K–4K; error de calibración 0,253 | no disponible | HuggingFace |
| jhu-clsp/mmBERT-base (linaje del encoder) | no disponible | no disponible | no disponible | no disponible | HuggingFace |

No se dispone de datos comparativos frente a clasificadores BERT de propósito general ni frente a enrutadores basados en LLM pequeños (por ejemplo, modelos de 0,5B a 1B usados como routers), porque la información proporcionada no incluye mediciones de esos sistemas sobre los mismos conjuntos. Alternativas de la misma categoría: no disponible.

## Limitaciones y advertencias

- No es un modelo de chat ni un modelo generativo: no produce texto libre ni mantiene conversaciones. Requiere un runtime específico que ejecute el head de decisión.
- Los aciertos en decisiones de reglas son moderados: 44,7 % en entradas de 2K–4K y 39,7 % en entradas largas de cualquier longitud. En esas tareas un umbral de confianza bajo derivará muchas decisiones a revisión.
- Las decisiones tipadas alcanzan el 42,2 %, por lo que el uso como clasificador generalista exige validación sobre el conjunto de etiquetas concreto de cada aplicación.
- Las entradas que superan el presupuesto de 4096 tokens lanzan un error en lugar de truncarse, lo que obliga a gestionar el recorte en la capa de aplicación.
- Solo soporta inglés y chino. No hay evidencia de rendimiento en castellano ni en otros idiomas.
- Los ejemplos de automatización de escritorio son específicos de macOS (archivos, Chrome, Word, Excel, PowerPoint); el comportamiento en otras plataformas no está documentado.
- No se publican evaluaciones de sesgo ni de equidad. Al derivar de un encoder multilingüe entrenado con corpus web, es previsible heredar los sesgos presentes en esos datos, pero no hay medición publicada que lo cuantifique.
- Riesgo de alucinación en el sentido generativo: no aplica, al no generar texto. El riesgo equivalente es una decisión incorrecta con alta confianza; el error de calibración de 0,032 en entradas largas reduce ese riesgo, pero no lo elimina en las tareas con exactitud por debajo del 50 %.
- El modelo devuelve decisiones y nunca ejecuta acciones (`actions_executed: False`), de modo que la responsabilidad de la ejecución y de la confirmación recae en el agente que lo integra.
- Licencia Apache 2.0, que permite uso comercial, pero conviene verificar los términos del modelo base `convaiinnovations/laya` y del linaje `jhu-clsp/mmBERT-base`, cuya licencia figura como no disponible en la información proporcionada.
- Adopción comunitaria mínima: 0 descargas y 1 like en el momento de la consulta, sin validación externa publicada.
- Publicado en septiembre de 2026 y actualizado un día después de su creación; no hay historial de versiones ni de correcciones posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chaoliangUNSW/MacJev-322M-4K-Laya
- Versión MLX FP32 para Apple Silicon: https://huggingface.co/chaoliangUNSW/MacJev-322M-4K-Laya-MLX
- Versión GGUF F16 para llama.cpp y LM Studio: https://huggingface.co/chaoliangUNSW/MacJev-322M-4K-Laya-GGUF
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Linaje del encoder: https://huggingface.co/jhu-clsp/mmBERT-base
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes; los resultados devueltos corresponden a páginas de inicio de sesión de Facebook y a documentación de perfiles de Firefox, sin relación con el modelo.
