# baselabs/groundhog-1

## Resumen

groundhog-1 es un modelo de decisión de tipo mixture-of-experts (MoE) desarrollado por Base Labs en Baseten, obtenido mediante un fine-tune completo del modelo multimodal Gemma-4-26B-A4B-it de Google. Con 25.805.933.872 parámetros totales y aproximadamente 4.000 millones activos por token, su función no es generar texto, sino recibir un estado (texto, opcionalmente con imágenes) junto con un conjunto de preguntas y devolver una probabilidad calibrada para cada opción de respuesta, todo ello en un único prefill de prefijo compartido.

El modelo resuelve el problema de la clasificación y el enrutamiento a gran escala con contexto largo: está entrenado sobre secuencias de hasta 131.072 tokens y responde todas las preguntas de una petición en una sola pasada, sin decodificación autoregresiva. Esto lo hace adecuado para tareas de guardrails, enrutamiento de tickets, moderación y evaluación automática donde se necesita una señal probabilística fiable en lugar de texto libre.

Es relevante porque comparte familia de receta y datos de entrenamiento con bison-1, presentado como el modelo de decisión número uno en el índice Artificial Analysis Decision Index v2.1, pero con un coste de inferencia propio de un modelo pequeño gracias a su naturaleza MoE. Se distribuye con licencia dual MIT y Apache 2.0 y está disponible a través de Baseten Model APIs.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture-of-experts) derivado de Gemma-4-26B-A4B-it, con máscara bidireccional por bloques en capas de atención completa y capas de ventana deslizante causales |
| Parametros totales | 25.805.933.872 |
| Parametros activos | Aproximadamente 4.000 millones por token |
| Longitud de contexto | 131.072 tokens (secuencias de entrenamiento); las peticiones que exceden el límite se rechazan, no se truncan |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT (modificaciones de Baseten) y Apache 2.0 (modelo base Gemma 4 26B A4B IT) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

groundhog-1 parte de Gemma-4-26B-A4B-it, un transformer MoE multimodal con aproximadamente 26.000 millones de parámetros totales y unos 4.000 millones activos por token. El fine-tune completo se aplicó únicamente al modelo de lenguaje; el codificador de visión, el enrutador de expertos, las normalizaciones y los embeddings permanecieron congelados. Una innovación destacable es el enmascaramiento: las capas de atención completa usan una máscara bidireccional por bloques, mientras que las capas de ventana deslizante mantienen el comportamiento causal, lo que permite responder varias preguntas desde un mismo prefill de prefijo compartido sin generación de texto.

El entrenamiento utilizó 6,71 millones de ejemplos de decisión (Mix 12), que cubren habilidades centrales de decisión, seguridad y abstención, dominios de juicio y expertos, tareas de documentos y contexto largo, y datos públicos de decisión, incluidos conjuntos de benchmarks públicos. La función de pérdida combina entropía cruzada con un término de calibración de Brier (λ = 1) y una opción entrenada de "no lo sé"; aproximadamente uno de cada siete ejemplos lleva un objetivo probabilístico en lugar de una única respuesta correcta. Se realizó una época (5.621 pasos) con LR máximo de 3,95e-6, sin weight decay, 3 % de warm-up, precisión bf16 y secuencias de hasta 131.072 tokens, sobre 16 nodos de 8 B200 (128 GPU en total).

## Capacidades

- Clasificación y decisión calibrada: devuelve probabilidades para preguntas de tipo sí/no (`noul`), elección entre opciones nombradas (`choice`) y puntuación sobre niveles ordenados (`score`).
- Respuesta multi-pregunta en una sola pasada: todas las preguntas de una petición se responden desde un único prefill de prefijo compartido.
- Entrada multimodal: acepta texto e imágenes como estado de entrada.
- Contexto largo: procesa documentos de hasta 131.072 tokens para tareas de decisión sobre documentos extensos.
- Abstención entrenada: incorpora una opción "no lo sé" para expresar incertidumbre.
- Calibración probabilística: el término de Brier en el objetivo busca que las probabilidades emitidas sean fiables, no solo la etiqueta ganadora.
- Enrutamiento y guardrails: pensado para decidir a qué equipo derivar, si bloquear una petición o cómo puntuar una situación.
- No soporta generación de texto libre ni tool calling en el sentido habitual; su salida son probabilidades estructuradas.
- Capacidades multilingües: limitadas al inglés según la model card.

## Casos de uso

- Enrutamiento de tickets de soporte: enviar el texto del ticket como `state` y una pregunta `choice` con los equipos disponibles (facturación, técnico, fraude) para obtener la probabilidad de cada destino y derivar automáticamente según un umbral.
- Guardrails de contenido: usar preguntas `noul` para decidir si una entrada infringe una política, con la probabilidad P(sí) como señal calibrada que alimenta un filtro previo al modelo generativo.
- Moderación con imágenes: al aceptar entradas multimodales, permite clasificar publicaciones que combinan texto e imagen en una sola llamada.
- Análisis de documentos largos: con 131.072 tokens de contexto, puede responder preguntas de cumplimiento o extracción de decisiones sobre contratos e informes extensos sin truncar.
- Priorización de incidencias: una pregunta `score` con niveles ordenados ("puede esperar", "hoy", "bloqueante") permite asignar urgencia de forma probabilística y ordenar colas de atención.
- Evaluación automática de respuestas: usar preguntas `choice` o `score` para puntuar la calidad de salidas de otros modelos en pipelines de evaluación, aprovechando la calibración y la opción de abstención.
- Clasificación por lotes de bajo coste: al tener solo unos 4.000 millones de parámetros activos y precio de 0,035 USD por millón de tokens en Baseten, es viable para volúmenes altos de clasificación.

## Benchmarks y rendimiento

| Benchmark | groundhog-1 |
|---|---:|
| LongMemEval M, 128k tokens | 77,4 |
| LongMemEval S, 128k tokens | 79,3 |

El modelo aún no ha sido evaluado en el Artificial Analysis Decision Index. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de propósito general.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 25,8 mil millones de parámetros en bf16 se requerirían del orden de 52 GB solo para pesos, más memoria para el contexto de hasta 131.072 tokens.
- GPU recomendadas: el entrenamiento se realizó en B200; para inferencia se necesitarían GPU de datacenter con suficiente memoria (A100 80 GB, H100 80 GB o superiores) para contexto largo en precisión completa.
- GPU de consumo: no disponible confirmación; en cuantizaciones de 4 bits podría aproximarse a la capacidad de una RTX 4090 (24 GB), pero no hay datos oficiales de soporte ni de calidad en ese régimen.
- Opciones de despliegue: transformers (librería indicada); también disponible como API gestionada en Baseten (`decision-models/baseten-groundhog-latest`). No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El precio de referencia en Baseten es de 0,035 USD por millón de tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| groundhog-1 | 25,8B | ~4B | 131.072 | MoE, decisión | MIT + Apache 2.0 | HF y Baseten |
| bison-1 | 31B | Denso | No disponible | Denso, decisión (mayor precisión) | No disponible | HF |
| Gemma-4-26B-A4B-it | 26B | ~4B | No disponible | MoE, propósito general | Apache 2.0 | HF |

bison-1 es el hermano denso de 31.000 millones de parámetros, recomendado por el autor para la máxima precisión y descrito como el modelo de decisión número uno en Artificial Analysis Decision Index v2.1. Gemma-4-26B-A4B-it es el modelo base de propósito general del que deriva groundhog-1.

## Limitaciones y advertencias

- Solo admite inglés; no se declaran capacidades multilingües.
- No genera texto: su salida son probabilidades, por lo que no sirve para tareas generativas.
- Las peticiones que exceden los límites de longitud entrenados se rechazan en lugar de truncarse, lo que puede romper pipelines que esperan truncado silencioso.
- Riesgo de alucinación y de calibración deficiente fuera de la distribución de entrenamiento; la opción "no lo sé" mitiga pero no elimina este riesgo.
- Sesgos heredados del modelo base Gemma y de los datos de decisión de Mix 12; no se documentan evaluaciones de sesgo en la información disponible.
- Licencia dual: el uso está sujeto simultáneamente a la MIT de las modificaciones de Baseten y a la Apache 2.0 del modelo base; es necesario revisar LICENSE y NOTICE.
- No está afiliado ni respaldado por Google; Gemma es marca registrada de Google LLC.
- No hay resultados publicados en el Artificial Analysis Decision Index ni benchmarks de propósito general, lo que limita la comparación objetiva con alternativas.
- El modelo tiene 0 descargas y 1 like en Hugging Face en el momento de la consulta, por lo que la validación comunitaria es prácticamente inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/baselabs/groundhog-1
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Hermano denso bison-1: https://huggingface.co/baselabs/bison-1
- Página en Baseten: https://www.baseten.co/library/groundhog-1/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Banner del modelo: https://huggingface.co/baselabs/groundhog-1/resolve/main/assets/banner.png
