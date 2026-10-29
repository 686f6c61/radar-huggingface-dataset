# muzaffercky/Sorjin2-12B-Instruct-LoRA

## Resumen

Sorjîn2-12B-Instruct-LoRA es un adaptador LoRA de instrucciones para el modelo kurdo `muzaffercky/Sorjin2-12B-Instruct`, desarrollado por el usuario de HuggingFace muzaffercky. Su única función es corregir el idioma de respuesta: el modelo base, construido fusionando el adaptador de preentrenamiento continuo `Sorjin2-LoRA` (585M tokens mayoritariamente en kurmanji) sobre `google/gemma-4-12B-it`, entiende las preguntas en kurmanji pero responde en turco. Este adaptador se entrena sobre pares pregunta-respuesta en kurmanji (escritura latina) para que el modelo conteste en kurmanji.

Técnicamente es un adaptador PEFT de rango 32 aplicado sobre los siete módulos lineales de las 48 capas de texto del modelo base (328 módulos, 131M parámetros entrenables, el 1,1 % de los 12,2B totales). No es un modelo autónomo: requiere cargar primero `Sorjin2-12B-Instruct` y superponer el adaptador, y no funciona sobre `google/gemma-4-12B-it` directamente.

Su relevancia es doble: por un lado, es uno de los pocos recursos públicos de ajuste de instrucciones en kurmanji kurmanji-latino sobre un modelo de 12B; por otro, documenta con detalle un caso habitual en lenguas de bajos recursos, el desajuste entre la lengua de comprensión y la lengua de generación, y lo mide con una métrica simple y reproducible (proporción de letras exclusivas de cada alfabeto). El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el autor anuncia que los benchmarks estándar se publicarán más adelante.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only derivado de `google/gemma-4-12B-it`, con 48 capas de texto |
| Parámetros totales | 131M entrenables en el adaptador; 12,2B en el modelo base sobre el que se aplica |
| Parámetros activos | No aplica (no es un modelo MoE; no disponible cualquier dato de sparse routing) |
| Longitud de contexto | No disponible en la información proporcionada; las secuencias de entrenamiento se truncaron a 2.048 tokens |
| Tipos de cuantización | No especificados por el autor; el adaptador se entrenó en bfloat16 sin cuantización |
| Idiomas soportados | ku, kmr (kurdo kurmanji en escritura latina); el modelo base conserva el multilingüismo y el turco de Gemma |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA PEFT); tamaño del repositorio 0,6 GB |
| Rango / alpha / dropout LoRA | 32 / 64 / 0,05 |
| Módulos objetivo | `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj` (328 módulos) |
| Modelo base requerido | `muzaffercky/Sorjin2-12B-Instruct` (no `google/gemma-4-12B-it`) |
| Tokenizer | El de `gemma-4-12B-it`, sin modificar, incluida la plantilla de chat |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un transformer decoder-only de 12,2B parámetros y 48 capas de texto. El linaje completo es: `google/gemma-4-12B-it` → fusión de `Sorjin2-LoRA` (preentrenamiento continuo sobre 585M tokens de texto mayoritariamente kurmanji) → `Sorjin2-12B-Instruct` → este adaptador de instrucciones. El LoRA cubre la totalidad de las proyecciones de atención y del MLP en todas las capas de texto; no se indica que se entrenen módulos de otras modalidades.

Los datos de entrenamiento proceden de una copia limpiada de `muzaffercky/kurdish-ins`: preguntas en kurmanji generadas por Gemini con respuestas copiadas literalmente de fineweb-2 (`kmr_Latn`) y de tesis académicas en kurmanji. El script de limpieza repara letras corrompidas con forma única correcta (por ejemplo `þ` por `ş`) y descarta los pares cuya corrupción es ambigua, conservando 30.927 de 32.991 pares; después elimina 338 duplicados y 67 conversaciones de más de 2.048 tokens (se descarta la respuesta completa en lugar de truncarla, para no enseñar al modelo a cortar frases a medias). El resultado son 29.985 conversaciones y 17,5M tokens de entrenamiento, más 537 conversaciones y 0,3M tokens de evaluación (2 %, separadas por conversación).

Cada conversación es una única secuencia: el prompt tal y como lo renderiza la plantilla de chat para generación, seguido de la respuesta y del token de fin de turno `<turn|>`. Solo se calcula la pérdida sobre la respuesta y el token de fin de turno. Una cuarta parte de las conversaciones empieza con uno de dos system prompts en kurmanji, de modo que el modelo también aprende a responder a instrucciones de sistema. El entrenamiento se hizo sin modo de razonamiento: todo prompt de entrenamiento termina con el bloque de pensamiento vacío de la plantilla. Hiperparámetros: batch de 16 conversaciones (4 × 4 de acumulación de gradiente), 3.750 pasos (dos épocas), learning rate 1e-4 con schedule coseno y 3 % de warmup, weight decay 0,01 y clipping de gradiente 1,0, en bfloat16 sin cuantización. Se ejecutó en una única H100 de 80 GB durante unas 4,5 horas. El checkpoint guardado es el de menor pérdida de evaluación, el paso 3.700.

## Capacidades

- Generación de texto conversacional en kurdo kurmanji (escritura latina), que es el objetivo declarado del adaptador.
- Respuesta a instrucciones de sistema en kurmanji: reconoce prompts como "Tu alîkarekî zîrek î. Bi kurmancî bersiv bide." y "Bersivên xwe her tim bi kurmancî binivîse.".
- Conversación multiturno mediante la plantilla de chat de Gemma 4, sin modificaciones.
- Comprensión del kurmanji heredada del modelo base; la aportación del adaptador es la producción en ese idioma.
- Capacidades generales del modelo base (conocimiento, matemáticas, código, multilingüismo) potencialmente conservadas, aunque no se han publicado evaluaciones que las cuantifiquen.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documenta modo de pensamiento (*thinking*): el adaptador se entrenó explícitamente con el bloque de pensamiento vacío.
- No se documenta visión, audio ni otras modalidades, pese a que la base descienda de una familia con capas de texto diferenciadas.

## Casos de uso

- **Chat de atención al cliente en kurmanji**: desplegar el modelo base con este adaptador para responder consultas de usuarios kurmanji-parlantes; el adaptador garantiza que la respuesta salga en kurmanji y no en turco, que es el fallo documentado del modelo base sin él.
- **Generación de contenido editorial en kurmanji**: redacción de borradores de artículos, descripciones de producto o notas de prensa, aceptando que el registro de salida será el de texto web o académico y requerirá edición humana.
- **Normalización y rescate de texto kurmanji mal codificado**: el pipeline de limpieza del autor (reparación de `þ`→`ş` y descarte de casos ambiguos) es reutilizable como herramienta de preprocesado para corpus kurmanji en pipelines de datos; el código está publicado.
- **Asistente de estudio para literatura académica en kurmanji**: el modelo se entrenó con respuestas procedentes de tesis, por lo que su registro encaja en tareas de resumen o explicación de texto académico, con revisión posterior obligatoria.
- **Investigación sobre desajuste lingüístico en lenguas de bajos recursos**: el adaptador sirve como caso de estudio reproducible de transferencia de lengua de generación mediante LoRA de bajo rango (131M parámetros, 1,1 % del total) y como base para experimentos similares en otros idiomas.
- **Prototipado de agentes conversacionales multilingües**: al conservar la plantilla de chat de Gemma 4 y el tokenizer original, se puede integrar en un stack basado en `transformers` + `peft` o en un servidor con soporte de adaptadores LoRA, y comparar su comportamiento frente al modelo base sin adaptador.
- **Evaluación comparativa de adaptadores**: útil en entornos de investigación que necesiten medir degradación o conservación de capacidades al superponer un LoRA de instrucciones sobre un modelo ya ajustado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible; el autor indica que se añadirán más adelante. Los únicos datos publicados son la pérdida de evaluación y un análisis de proporción de letras exclusivas de cada idioma:

| Métrica | Sorjin2-12B-Instruct (antes del adaptador) | Con este adaptador | Referencia: gemma-4-12B-it |
|---|---|---|---|
| Pérdida de evaluación (entropía cruzada por token de respuesta, 537 conversaciones reservadas) | 3,235 | 1,932 | No disponible |
| Proporción de letras exclusivas del turco (`ı`, `ğ`, `ö`, `ü`) en 7 preguntas con decodificación greedy | 8,1 % | 0 % | No disponible |
| Proporción de letras exclusivas del kurmanji (`ê`, `î`, `û`) en las mismas 7 preguntas | 0,1 % | 10–12 % | 12,0 % |

Lectura de los datos: la pérdida baja un 40,3 % (de 3,235 a 1,932) y la salida deja de contener grafemas turcos en la muestra evaluada, mientras que la proporción de grafemas kurmanji se aproxima a la del Gemma original. El propio autor advierte que la pérdida de evaluación se calcula sobre la respuesta dada y, por tanto, no mide qué idioma elige el modelo cuando genera libremente; de ahí la métrica complementaria de letras, obtenida sobre solo siete preguntas, lo que es una muestra muy pequeña y no permite inferencias robustas.

## Requisitos de hardware

- **VRAM en bfloat16**: los 12,2B del modelo base ocupan unos 24,4 GB de pesos; el adaptador añade unos 0,26 GB en bfloat16 (0,6 GB de repositorio). Con caché KV para contexto corto, el total razonable se sitúa en 26–30 GB.
- **VRAM en 8 bits**: aproximadamente 12–14 GB de pesos, más caché KV; viable en GPUs de 24 GB con margen amplio.
- **VRAM en 4 bits (NF4/GPTQ/AWQ)**: unos 7–8 GB de pesos, más caché KV; cabe en GPUs de consumo de 16 GB y en una RTX 4090 de 24 GB con contexto moderado, siempre que la cuantización se aplique al modelo base fusionado y no al adaptador.
- **GPU recomendadas**: para bfloat16 sin compromisos, A100 40/80 GB, H100 80 GB o L40S 48 GB; para 8 bits, RTX 4090, RTX 5090 o A6000 de 48 GB; para 4 bits, RTX 4080/4090 y GPUs de 16 GB en adelante.
- **Requisito de entrenamiento documentado**: el adaptador se entrenó en una única H100 de 80 GB en aproximadamente 4,5 horas, en bfloat16 y sin cuantización, con un batch efectivo de 16 conversaciones.
- **Opciones de despliegue**: `transformers` + `peft` (flujo documentado por el autor, con `PeftModel.from_pretrained` sobre el modelo base); servidores con soporte de adaptadores LoRA en tiempo de ejecución (vLLM, TGI) siempre que la arquitectura de la familia Gemma 4 esté soportada; `llama.cpp`/Ollama solo tras fusionar el adaptador en el modelo base y convertir a GGUF, ya que estos runners no cargan adaptadores PEFT directamente en todos los casos.
- **Latencia y throughput**: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|---|
| `muzaffercky/Sorjin2-12B-Instruct-LoRA` (este) | Adaptador LoRA de instrucciones | 131M entrenables sobre 12,2B | No disponible | ku, kmr | No disponible | Publicado, 0 descargas |
| `muzaffercky/Sorjin2-12B-Instruct` | Modelo fusionado (base de este adaptador) | 12,2B | No disponible | Responde en turco a preguntas en kurmanji | No disponible | Publicado |
| `muzaffercky/Sorjin2-LoRA` | Adaptador de preentrenamiento continuo | No disponible | No disponible | kurmanji (585M tokens) | No disponible | Publicado |
| `muzaffercky/Sorjin2.1-12B-Instruct` | Fusión de este adaptador en el modelo base | 12,2B | No disponible | kurmanji | No disponible | Planificado, no publicado |
| `google/gemma-4-12B-it` | Modelo base completo | 12,2B | No disponible | Multilingüe | No disponible | Publicado |

No se dispone de datos públicos de benchmarks que permitan comparar este adaptador con modelos de ajuste en kurmanji de otros autores, ni de comparaciones de rendimiento con `gemma-4-12B-it` o Sorjîn1.1; el autor indica que se añadirán más adelante.

## Limitaciones y advertencias

- **Bucles con decodificación greedy**: el propio autor advierte que algunas respuestas repiten una frase hasta agotar el límite de tokens. Debe usarse muestreo (temperatura, top-p, top-k) y, si hace falta, una penalización de repetición suave.
- **Registro inadecuado para chat**: las respuestas de entrenamiento son pasajes web y de tesis, no respuestas de asistente. El modelo tiende a producir párrafos largos y continuos en lugar de respuestas breves y estructuradas.
- **Pares pregunta-respuesta desalineados**: las preguntas fueron generadas por un modelo y las respuestas no se escribieron para ellas, por lo que algunas respuestas solo contestan parcialmente a la pregunta. Es un defecto heredado del dataset, no corregido por el entrenamiento.
- **Adaptador no autónomo**: no funciona sobre `google/gemma-4-12B-it`; requiere cargar `Sorjin2-12B-Instruct` primero. Aplicarlo sobre otro modelo produce resultados no válidos.
- **Contexto efectivo limitado en entrenamiento**: las conversaciones de más de 2.048 tokens se descartaron, de modo que el adaptador nunca vio secuencias de instrucciones más largas. El contexto máximo real del modelo base no se documenta.
- **Sin modo de razonamiento**: se entrenó con el bloque de pensamiento vacío, por lo que activar el *thinking* de la plantilla no está validado y puede degradar la calidad.
- **Riesgo de alucinación**: el modelo base no se ha reevaluado tras el ajuste; no hay datos sobre fidelidad factual en kurmanji, un ámbito con menos cobertura en los corpus de entrenamiento.
- **Licencia no disponible**: ni la del adaptador ni la del modelo base se indican en la información proporcionada. Al derivar de Gemma, es imprescindible verificar los términos de la licencia de la familia Gemma antes de cualquier uso comercial.
- **Procedencia y derechos del dataset**: las respuestas se copiaron literalmente de fineweb-2 y de tesis académicas; conviene revisar las condiciones de reutilización de esas fuentes antes de un uso comercial del modelo.
- **Muestra de evaluación mínima**: la métrica de idioma se calcula sobre siete preguntas, lo que no constituye evidencia estadística sólida; el resultado debe tratarse como indicativo.
- **Madurez del proyecto**: 0 descargas y 0 likes, benchmarks pendientes y el modelo fusionado `Sorjin2.1-12B-Instruct` aún planificado. No es un artefacto validado para producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/muzaffercky/Sorjin2-12B-Instruct-LoRA
- Modelo base del adaptador: https://huggingface.co/muzaffercky/Sorjin2-12B-Instruct
- Adaptador de preentrenamiento continuo: https://huggingface.co/muzaffercky/Sorjin2-LoRA
- Modelo base original: https://huggingface.co/google/gemma-4-12B-it
- Dataset de instrucciones: https://huggingface.co/datasets/muzaffercky/kurdish-ins
- Script de limpieza del corpus: https://github.com/cikay/kurdish_ins
