# skeggsguy/crystal-ball

## Resumen
crystal-ball no es un modelo de lenguaje generativo, sino un fichero auxiliar de predicción de expertos (guesser) para un fork de llama.cpp. Su función es anticipar qué expertos va a necesitar el modelo MoE Qwen3.8-Flash-Next (base unsloth/Qwen3.8-Flash-Next-UD-Q4_K_XL) en la capa siguiente, para que el motor empiece a leerlos desde el SSD una capa antes y solape la E/S con el cómputo. Lo publica el usuario skeggsguy, ocupa 0,1 GB y declara 60.316.672 parámetros reales.

Técnicamente son 46 capas lineales independientes (una por "floor", de la 2 a la 47) de 2560 entradas y 512 salidas con sesgo: leen la entrada del router de la capa n-2 y puntúan los 512 expertos de la capa n. Con un umbral de confianza de 0,2 alcanza un recall top-10 a dos capas del 67,2% en papers genéricos y del 71-72% en papers de chat y código.

Es relevante porque el streaming de expertos desde disco es el cuello de botella habitual al ejecutar MoE grandes con poca VRAM, y este tipo de previsor aporta entre un 4,2% y un 8,2% de velocidad extra en los escenarios medidos sin modificar la salida del modelo.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | 46 capas lineales independientes (una por floor, de la 2 a la 47), 2560 -> 512 más sesgo; red de predicción de expertos, no es un transformer generativo |
| Parámetros totales | 60.316.672 |
| Parámetros activos | no aplica (no es un MoE; predice los expertos de un MoE ajeno) |
| Longitud de contexto | no aplica (consume la entrada del router token a token) |
| Tipos de cuantización | pesos en f16 y sesgos en f32; no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (no procesa texto de forma directa) |
| Licencia | no disponible |
| Formato de pesos | safetensors según los metadatos de HuggingFace (60.316.672 parámetros); la model card está etiquetada como gguf y describe el fichero como 92 tensores y 120.686.368 bytes |
| Modelo objetivo | Qwen3.8-Flash-Next (n_embd 2560, 512 expertos) |
| Modelo base declarado | unsloth/Qwen3.8-Flash-Next-UD-Q4_K_XL |
| Función de confianza | min(1, 10 * softmax(z)), con umbral de corte 0,2 |
| sha256 | c22af709d65b99bb2bc64aaa5b8b2d47c04c86367b0f9ba0fe452ab47ec053c7 |

## Arquitectura y entrenamiento
El artefacto es un conjunto de 92 tensores (46 pesos y 46 sesgos, uno por floor desde el 2 hasta el 47). Cada capa proyecta el vector de entrada del router de 2560 dimensiones a 512 logits, uno por experto del modelo objetivo, y los convierte en una probabilidad mediante min(1, 10 * softmax(z)). El fork de llama.cpp usa ese valor para decidir si merece la pena precargar el experto en el paso anterior; el autor indica expresamente que la predicción "cambia qué expertos se descargan antes, nunca cuáles se usan: la salida no varía".

Sobre el entrenamiento, la model card solo indica que se entrenó con las entradas del router registradas mientras el modelo escribía respuestas a prompts de benchmark y de código/chat. No se especifica número de tokens, composición del dataset, ni si hubo RLHF, DPO u otro ajuste posterior: esa información no está disponible. Tampoco se documenta una innovación arquitectónica más allá del enfoque de predicción a dos floors (leer la capa n-2 para predecir la n), que es precisamente lo que da nombre a la técnica de expert-prefetch.

## Capacidades
- Predicción de expertos por capa: puntúa los 512 expertos de cada floor (2 a 47) a partir de la entrada del router de dos floors antes.
- Estimación de confianza calibrada como min(1, 10 * softmax(z)), con corte configurable (0,2 en la configuración de referencia).
- Prefetch anticipado a un floor de distancia, gestionado por el fork de llama.cpp mediante las variables LLAMA_MOE_STREAM_LOOKAHEAD_ALL, _DEPTH2, _GUESSER, _CONF y _KEEP.
- Invariabilidad de la salida: no altera la selección final de expertos ni la calidad del texto generado.
- Validación de forma en el motor: rechaza la carga si el modelo no tiene n_embd 2560 y 512 expertos.
- No soporta generación de texto, razonamiento, código, matemáticas, visión, tool calling ni agentes; esas capacidades pertenecen al modelo objetivo, no a este fichero.
- No hay capacidades multilingües declaradas, porque el fichero no consume ni produce lenguaje natural.

## Casos de uso
- Ejecución de Qwen3.8-Flash-Next con VRAM limitada: al hacer streaming de expertos desde SSD, el guesser permite lanzar la lectura de los expertos de la capa siguiente mientras se calcula la actual, reduciendo el tiempo de espera de E/S.
- Servidores de inferencia sobre hardware Apple unificada: en un Mac mini M5 Pro de 64 GB con caché de 28 GiB y borrador MTP, el autor mide +8,2% en chat con effort medio, un escenario realista de despliegue local.
- Generación de código en producción: con effort alto el incremento reportado es del +4,2%, útil en pipelines de CI/CD donde cada segundo de generación se multiplica por muchos ficheros.
- Procesamiento de documentos largos: la ganancia se sitúa entre el 6% y el 11% en papers "hasta long", por lo que encaja en resumen y análisis de documentación extensa.
- Investigación en sistemas: sirve como caso de estudio reproducible de expert-prefetch guiado por un predictor entrenado, con recall y aceleración medidos, para comparar contra políticas de prefetch heurísticas.
- Entrenamiento de guessers para otros MoE: la receta (registrar entradas del router, entrenar una lineal por capa, evaluar recall top-k) es replicable en otros modelos con arquitectura similar.
- Optimización de despliegues en edge con NVMe: al reducir las lecturas no anticipadas, disminuye la presión de I/O y el desgaste del almacenamiento en nodos con disco local.
- Evaluación de forks de llama.cpp: permite medir de forma aislada el impacto del lookahead entrenado frente a la misma build sin él, usando la salida idéntica como control.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible, porque el artefacto no es un modelo generativo. Los únicos datos publicados son métricas de recall del predictor y de aceleración del motor:

| Métrica | Valor |
|---|---|
| Recall top-10 a dos floors (media de floors 2-47), papers genéricos held-out | 67,2% |
| Recall top-10 a dos floors, papers de chat/código held-out | 71-72% |
| Aceleración en escritura (código, high effort), Mac mini M5 Pro 64 GB, caché 28 GiB, borrador MTP | +4,2% |
| Aceleración en chat (medium effort), misma configuración | +8,2% |
| Aceleración en papers hasta "long" | +6% a +11% |
| Aceleración por encima de 100K tokens de contexto | ~+1% |

## Requisitos de hardware
- Tamaño del artefacto: 0,1 GB (120.686.368 bytes según la model card), por lo que cabe en cualquier GPU consumer e incluso en memoria de CPU.
- VRAM estimada para el guesser: aproximadamente 0,13 GB con pesos f16 y sesgos f32; el coste es despreciable frente al modelo objetivo.
- GPU recomendadas: no se especifica ninguna; el requisito real lo marca Qwen3.8-Flash-Next. Las cifras publicadas se obtuvieron en un Mac mini M5 Pro con 64 GB de memoria unificada.
- Cabe en GPU consumer: sí, cualquier GPU con más de 1 GB libre, aunque la viabilidad del sistema completo depende del modelo objetivo y del streaming desde SSD.
- Configuración de referencia del sistema medido: caché de expertos de 28 GiB y borrador MTP activo.
- Opciones de despliegue: exclusivamente el fork de llama.cpp, rama party/trained-lookahead, con motor b4745dbc3 o posterior; no hay soporte documentado en vLLM, TGI, Ollama ni llama.cpp mainline.
- Latencia y throughput: los únicos datos son los incrementos relativos del apartado anterior (+4,2% en código, +8,2% en chat, +6-11% en papers hasta long, ~+1% por encima de 100K tokens). No se publican valores absolutos de tokens por segundo.

## Comparativa con modelos similares
No disponible. En la información proporcionada no se describe ningún otro previsor de expertos público con el que comparar parámetros, recall o licencia. La única comparación posible es contra el mismo motor sin el guesser, que es la línea base usada por el autor:

| Configuración | Escritura (código, high effort) | Chat (medium effort) |
|---|---|---|
| Fork de llama.cpp sin crystal-ball | línea base | línea base |
| Fork de llama.cpp con crystal-ball | +4,2% | +8,2% |

Alternativas genéricas como las políticas de prefetch heurísticas del propio fork, u otros guessers no publicados, no aparecen cuantificadas en la información disponible.

## Limitaciones y advertencias
- Solo es válido para Qwen3.8-Flash-Next con n_embd 2560 y 512 expertos; el motor rechaza explícitamente cualquier modelo con forma distinta.
- No mejora la calidad de las respuestas: la salida es idéntica, solo cambia el orden de carga de expertos.
- El recall es imperfecto: entre un 28% y un 33% de los expertos relevantes no se prefetchan, lo que genera fallos de caché inevitables.
- La ganancia se desploma a aproximadamente un +1% cuando el contexto supera los 100K tokens.
- Depende de una build concreta del fork (b4745dbc3 o posterior) y de un conjunto específico de variables de entorno; no es un drop-in en llama.cpp estándar.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido.
- Sin validación comunitaria: 0 descargas y 0 likes, con el repositorio creado y actualizado el mismo día (2026-10-08).
- Posible sesgo de dominio: el predictor se entrenó con entradas de router procedentes de benchmarks y de prompts de código y chat, por lo que su recall podría degradarse en otros tipos de contenido.
- No se documentan sesgos, riesgo de alucinación, limitaciones idiomáticas ni caveats de seguridad del texto generado, porque el artefacto no genera texto; esas advertencias corresponderían al modelo objetivo.
- Las cifras de aceleración proceden de una única configuración de hardware (Mac mini M5 Pro 64 GB, caché de 28 GiB, borrador MTP) y no está garantizado que se trasladen a otras plataformas.

## Enlaces
- Ficha en HuggingFace: https://huggingface.co/skeggsguy/crystal-ball
- Modelo base declarado: https://huggingface.co/unsloth/Qwen3.8-Flash-Next-UD-Q4_K_XL
- sha256 del fichero: c22af709d65b99bb2bc64aaa5b8b2d47c04c86367b0f9ba0fe452ab47ec053c7
- Los resultados de búsqueda web disponibles no contienen ningún enlace relevante: todos apuntan a generadores de modelos 3D (MeshGPT, SkyeBrowse, Canva, Hi3D, Meshy) y no guardan relación con este artefacto. No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
