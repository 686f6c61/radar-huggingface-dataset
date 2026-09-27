# smdesai/GLiNER25-Decide-FP16-CoreAI

## Resumen

GLiNER25-Decide-FP16-CoreAI es una exportación del modelo de clasificación fastino/GLiNER2.5-Decide, adaptada por el usuario smdesai para ejecutarse en dispositivos Apple mediante el framework Core AI (iOS 27+ / macOS 27+). No se trata de un modelo nuevo entrenado desde cero: es un artefacto de despliegue que conserva sin cambios los pesos aprendidos del checkpoint original (revisión `bbe10ff77ebb238777c17d3a8ac9260e30929057`) y los empaqueta en formato `.aimodel` en FP16, con el objetivo de permitir inferencia 100 % on-device en iPhone y Mac.

El modelo base es de la familia GLiNER2 (Generalist and Lightweight Model for Named Entity Recognition), orientada a clasificación basada en esquemas (schema-based classification): recibe texto tokenizado y devuelve una puntuación por posición de token, a partir de la cual se leen las posiciones de los marcadores de etiqueta del esquema. Esta exportación concreta es "classification-only", es decir, contiene únicamente el encoder DeBERTa más la cabeza clasificadora, sin componentes generativos.

Su relevancia radica en que demuestra un flujo de conversión de un transformer PyTorch a un activo nativo de Apple optimizado para GPU, con funciones precompiladas de 128, 256 y 512 tokens, validación estricta contra un oráculo FP32 en PyTorch y latencias medidas en un iPhone 17 Pro. Está publicado bajo licencia Apache-2.0 y el repositorio ocupa 1,7 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo encoder DeBERTa + cabeza clasificadora (classification-only) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128, 256 o 512 tokens, segun la funcion elegida (`context128`, `context256`, `context512`) |
| Tipos de cuantizacion | FP16 (activo de ~873 MB); no se ofrecen otras cuantizaciones |
| Idiomas soportados | en (ingles), segun la model card |
| Licencia | Apache-2.0 |
| Formato de pesos | Core AI `.aimodel` (`main.mlirb`) + tokenizer.json, tokenizer_config.json, special_tokens_map.json |
| Pipeline | text-classification |
| Modelo base | fastino/GLiNER2.5-Decide |
| Libreria | gliner2 |
| Tamano del repositorio | 1,7 GB |
| Salida | `logits` `[1, L]`, una puntuacion por posicion de token |
| Entrada | `input_ids` int32 `[1, L]`, `attention_mask` int32 `[1, L]` (1 = token real, 0 = padding) |

## Arquitectura y entrenamiento

El artefacto es una conversión, no un reentrenamiento. Según la model card, el grafo parte del checkpoint original en modo "classification-only", compuesto por un encoder DeBERTa y un clasificador. La exportación se realizó con coreai-torch 0.4.3, coreai-core 1.0.0b3 y Torch 2.11.0, y se indica explícitamente que los pesos aprendidos no se han modificado.

Las innovaciones técnicas descritas son de optimización del grafo para el runtime de Apple: uso de buckets constantes para las posiciones relativas, una relative-shift bias sin operaciones `gather` (gather-free) y SDPA fusionada. Estas transformaciones afectan solo a la representación computacional, no al contenido del modelo. La exportación expone tres funciones (`context128`, `context256`, `context512`) que comparten un único conjunto de pesos, lo que reduce el peso total: el activo FP16 ocupa aproximadamente 873 MB entre las tres funciones.

No se proporciona información sobre el número de tokens de entrenamiento, la composición del dataset, ni si el modelo base utilizó RLHF, DPO u otras técnicas de alineación. Tampoco se detalla el procedimiento de entrenamiento del checkpoint fastino/GLiNER2.5-Decide.

## Capacidades

- Clasificación de texto basada en esquemas: asigna una puntuación por posición de token y la lectura de decisiones se realiza en las posiciones de los marcadores de etiqueta (`[L]`) definidos en el esquema.
- Extracción de información y etiquetado a nivel de token, propia de la familia GLiNER (clasificación zero-shot mediante esquema de etiquetas), según la naturaleza del pipeline declarado.
- Procesamiento de secuencias de hasta 128, 256 o 512 tokens, seleccionando la función más pequeña que cubra la petición.
- Ejecución on-device en Apple (iOS 27+ / macOS 27+) con ubicación de cómputo en GPU.
- Capacidad multilingüe: limitada al inglés (`en`) según la model card.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni uso como agente. Al ser una exportación "classification-only", no incorpora componentes generativos.

## Casos de uso

- Clasificación de intenciones en apps iOS nativas: la app tokeniza la entrada del usuario, ejecuta la función de contexto adecuada y lee las posiciones de los marcadores de etiqueta para obtener la clase, todo sin salir del dispositivo.
- Extracción de entidades (NER) zero-shot en aplicaciones móviles: definiendo un esquema de etiquetas, el modelo puntúa cada token y permite recuperar entidades de textos cortos (notas, mensajes, formularios).
- Procesamiento de datos sensibles con privacidad: al ejecutarse on-device en iPhone o Mac, evita enviar texto de usuario a servidores externos, adecuado para sanidad, finanzas o datos personales.
- Moderación de contenido local en clientes de mensajería: clasificación de mensajes entrantes de hasta 512 tokens para filtrar o marcar contenido en tiempo real, con latencias del orden de 50-116 ms.
- Enrutado de documentos cortos: selección de la categoría o flujo de trabajo correspondiente a partir de fragmentos de hasta 512 tokens en una app de productividad para macOS.
- Extracción de campos estructurados en captura de formularios: a partir de un esquema con las etiquetas de los campos, el modelo localiza las posiciones de cada valor en el texto reconocido (por ejemplo, procedente de OCR).
- Funcionalidad offline en dispositivos sin conectividad: la inferencia en GPU local permite clasificar texto en escenarios sin red, algo relevante en apps de campo o entornos aislados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay datos de MMLU, HumanEval, GSM8K ni similares). La model card sí incluye una validación funcional y medidas de latencia en iPhone 17 Pro (iOS 27.2, GPU).

Validación frente al oráculo FP32 de PyTorch (error máximo de probabilidad ≤ 0,005, sin discrepancias de decisión):

| Metrica | Resultado |
|---|---|
| Error maximo de probabilidad | 0,0010 |
| Discrepancias de decision | 0 |
| Corpus context128 | 75 peticiones |
| Corpus context256 | 86 peticiones |
| Corpus context512 | 95 peticiones (incluye 9 peticiones de 296-512 tokens) |
| Lanzamientos | 2, todos pasan en todas las funciones |

Latencias medianas por funcion:

| Funcion | Mediana, lanzamiento 1 | Mediana, lanzamiento 2 |
|---|---:|---:|
| context128 | 34,6 ms | 36,0 ms |
| context256 | 49,3 ms | 53,6 ms |
| context512 | 111,6 ms | 115,9 ms |

Nota de rendimiento: la primera carga especializa el activo para el dispositivo y tarda aproximadamente 8 s; las cargas posteriores usan la caché del sistema. Tras unos 2 s de inactividad se suma un coste de despertar de la GPU de unos 45-50 ms.

## Requisitos de hardware

- Plataforma obligatoria: Apple, con Core AI en iOS 27+ o macOS 27+. No es ejecutable en GPU NVIDIA ni en entornos CUDA.
- Ubicacion de computo: GPU obligatoria (`SpecializationOptions(preferredComputeUnitKind: .gpu)`); la model card advierte que la ubicacion por defecto era insegura para este grafo en iOS 27.2 y provocaba una asercion de MPSGraph en region ANE.
- Memoria: el activo FP16 ocupa aproximadamente 873 MB, mas el tokenizer y la sobrecarga del runtime. No se especifica la VRAM o RAM unificada minima.
- VRAM en GPU de escritorio: no aplica; este artefacto no esta pensado para ese hardware.
- Caben en GPU de consumo: no relevante; el destino son los SoC Apple (serie A y serie M) con soporte de Core AI.
- Opciones de despliegue: framework Core AI mediante `AIModel` en Swift (carga desde URL, especializacion por dispositivo). No soporta vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 34,6-36,0 ms (128), 49,3-53,6 ms (256) y 111,6-115,9 ms (512) en iPhone 17 Pro; la primera especializacion cuesta ~8 s y el despertar de GPU tras inactividad ~45-50 ms.
- Throughput: no disponible (solo se publican latencias medianas).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / plataforma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLiNER25-Decide-FP16-CoreAI (este) | no disponible | 128 / 256 / 512 | Core AI `.aimodel` FP16, iOS/macOS 27+ | Apache-2.0 | HuggingFace (repo smdesai) |
| fastino/GLiNER2.5-Decide (base) | no disponible | no disponible | PyTorch (origen del export) | Apache-2.0 | HuggingFace (repo fastino) |

No se dispone de datos de benchmarks ni de otros artefactos Core AI comparables en la informacion proporcionada, por lo que no es posible una comparacion de rendimiento entre alternativas. El único punto de referencia directo es el propio modelo base en PyTorch FP32, usado como oraculo en la validacion.

## Limitaciones y advertencias

- Es una exportacion "classification-only": no genera texto ni realiza tareas generativas, razonamiento, código o matemáticas.
- Idiomas: soporte limitado al inglés según la model card; el rendimiento en otros idiomas no está garantizado.
- Contexto máximo de 512 tokens: la propia model card indica rechazar peticiones más largas y no truncarlas; hay que elegir la función (`context128`/`context256`/`context512`) y rellenar a su longitud.
- Ubicación de cómputo: la GPU es obligatoria; el uso del placement por defecto provocó una aserción de MPSGraph (región ANE) en iOS 27.2 y, en activos anteriores, no determinismo por lanzamiento.
- Compatibilidad de plataforma restrictiva: requiere iOS 27+ / macOS 27+, lo que limita su uso a dispositivos Apple actualizados. No se ejecuta en CUDA, llama.cpp, vLLM ni Ollama.
- Coste de arranque: la primera carga especializa el activo (~8 s) y el despertar de GPU tras inactividad añade 45-50 ms, poco adecuado para peticiones esporádicas sensibles a la latencia.
- Riesgo de alucinación: no aplica en el sentido generativo, pero la clasificación basada en esquema puede producir etiquetas espurias si el esquema o los marcadores `[L]` no están bien definidos.
- Sesgos: no hay información publicada sobre sesgos del modelo base ni del proceso de exportación.
- Verificación de integridad: el repositorio incluye valores SHA-256 para `main.mlirb` y `tokenizer.json`, útiles para validar la descarga en producción.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base fastino/GLiNER2.5-Decide, del que hereda los pesos.

## Enlaces

- HuggingFace (este modelo): https://huggingface.co/smdesai/GLiNER25-Decide-FP16-CoreAI
- Modelo base: https://huggingface.co/fastino/GLiNER2.5-Decide
- Revision del checkpoint de origen: `bbe10ff77ebb238777c17d3a8ac9260e30929057`
- Model card original incluida en el repo: `model-card.md` (fastino/GLiNER2.5-Decide, Apache-2.0)
