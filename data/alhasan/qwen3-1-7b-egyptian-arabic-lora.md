# Alhasan/qwen3-1.7b-egyptian-arabic-lora

## Resumen

Alhasan/qwen3-1.7b-egyptian-arabic-lora es un adaptador LoRA en formato PEFT sobre el modelo base Qwen/Qwen3-1.7B, publicado por el usuario Alhasan. No es un modelo conversacional: es un módulo de comprensión del lenguaje (NLU) que transforma un comando de voz en árabe egipcio en una llamada a herramienta expresada como JSON, con una intención y sus correspondientes slots. Por ejemplo, la entrada "صحيني بكرة الساعة ستة الصبح" produce {"intent": "alarm_set", "slots": {"date": "بكرة", "time": "ستة الصبح"}}.

El adaptador se entrenó sobre el corpus Amazon MASSIVE en su variante ar-SA (árabe saudí/MSA) más 6.500 reescrituras en dialecto egipcio generadas por un LLM y filtradas por reglas. El resultado es un modelo especializado en aproximadamente 60 intenciones, con salida JSON válida en el 100 % de los casos con decodificación greedy, frente a un 4,0 % de exact match que obtiene el Qwen3-0.6B sin entrenar con cinco ejemplos.

Su relevancia actual es doble: por un lado, demuestra que un ajuste fino pequeño (una hora en una sola GPU) supera en 15,5 puntos porcentuales a un modelo frontera como Claude Sonnet 5 con cinco ejemplos (0,590 frente a 0,435, IC 95 % [+8,5, +22,5]); por otro, el propio autor advierte de que un encoder dialect-BERT de 110 millones de parámetros iguala o supera el resultado (0,625) con 25 veces menos latencia, lo que convierte a esta ficha en un caso de estudio sobre cuándo el ajuste fino no es la opción más eficiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only: Qwen/Qwen3-1.7B |
| Parametros totales | Modelo base: 1.700 millones. Adaptador: no disponible (repo de 0,4 GB) |
| Parametros activos | No aplica (el modelo base no es de arquitectura MoE) |
| Longitud de contexto | No disponible (el entrenamiento se realizó con longitud máxima de 256 tokens) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Árabe: árabe egipcio coloquial como objetivo; árabe saudí/MSA presente en los datos de entrenamiento (MASSIVE ar-SA) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador LoRA en formato PEFT) |
| Modelo base | Qwen/Qwen3-1.7B |
| Tarea principal | Clasificación de intención y extracción de slots (slot filling) con salida JSON |
| Hiperparametros LoRA | Rank 16, alpha 32, dropout 0,05, aplicado a todas las proyecciones de atención y MLP |
| Tamano del repositorio | 0,4 GB |
| Descargas / likes | 0 descargas, 0 likes en el momento de la consulta |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen3-1.7B, un transformer decoder-only denso de 1.700 millones de parámetros, sobre el que se aplica un adaptador LoRA de rank 16, alpha 32 y dropout 0,05 en todas las proyecciones de atención y de las capas MLP. El adaptador pesa 0,4 GB y se distribuye en safetensors con la librería PEFT. La generación se realiza con `enable_thinking=False`, es decir, con el modo de razonamiento explícito del modelo base desactivado, algo coherente con una tarea de clasificación y extracción que requiere latencia baja y salida determinista.

El entrenamiento se hizo con TRL `SFTTrainer` durante 1.200 pasos de optimizador, con batch de 16, learning rate 2e-4 con scheduler coseno, longitud máxima de 256 tokens y pérdida calculada únicamente sobre el JSON del asistente (completion-only). Todo ello en una sola GPU durante aproximadamente una hora. Los datos combinan Amazon MASSIVE ar-SA con 6.500 reescrituras egipcias generadas por un LLM y filtradas mediante reglas, un enfoque de aumento de datos sintéticos que busca trasladar el dominio y las convenciones de anotación de MASSIVE al dialecto egipcio. El formato de prompt es obligatorio: un system prompt fijo y literal, sin ejemplos, seguido del comando en bruto como turno de usuario; cualquier variación degrada notablemente el rendimiento.

## Capacidades

- Clasificación de intención en árabe egipcio dentro del esquema de intenciones de Amazon MASSIVE (aproximadamente 60 intenciones según la model card).
- Extracción de slots (fecha, hora y otros tipos definidos en `configs/schema.json`) y devolución conjunta de intención y slots en un único objeto JSON.
- Salida JSON válida en el 100 % de los casos con decodificación greedy (`do_sample=False`), lo que la hace apta para encadenarse con parsers automáticos.
- Formulación de llamadas a herramienta (tool calling) de facto: el JSON de salida (`{"intent": ..., "slots": {...}}`) se mapea directamente a una función o acción del asistente de voz.
- Ejecución con el modo de pensamiento desactivado, priorizando la latencia sobre el razonamiento multi-paso, que no forma parte del objetivo del adaptador.
- Capacidad multilingüe: no disponible; el modelo está entrenado y evaluado únicamente en árabe (egipcio como objetivo, saudí/MSA en la evaluación secundaria).
- No se documentan capacidades de generación libre, código, matemáticas, visión ni audio.

## Casos de uso

- Asistente de voz para árabe egipcio: el adaptador actúa como módulo NLU que recibe la transcripción ASR del comando y devuelve la intención y los slots listos para ejecutar una acción, con salida JSON siempre parseable.
- Integración como capa de enrutamiento (tool calling) ante un LLM mayor: el adaptador resuelve las intenciones cubiertas por el esquema MASSIVE y delega en un modelo generativo generalista solo los comandos que quedan fuera, reduciendo coste y latencia por petición.
- Domótica y altavoces inteligentes: control de alarmas, temporizadores, climatización o reproducción musical a partir de comandos en dialecto egipcio, con slots estructurados (fecha, hora, dispositivo) que alimentan directamente las API del dispositivo.
- Atención al cliente en centros de contacto: clasificación automática de la intención de la consulta entrante en egipcio para enrutarla al agente o al flujo de automatización adecuado, con extracción de entidades relevantes.
- Investigación sobre dialectos árabes: el repositorio documenta la metodología completa (datos sintéticos filtrados por reglas, test de 200 comandos nativos, bootstrap pareado e intervalos de confianza), lo que lo convierte en una base reproducible para estudiar transferencia de MSA a dialecto.
- Destilación a un encoder más pequeño: dado que un dialect-BERT de 110 millones alcanza 0,625 en el mismo test, este adaptador puede servir como generador de etiquetas o profesor en un proceso de destilación hacia un modelo desplegable en dispositivo.
- Evaluación y regresión de pipelines NLU: el adaptador y su conjunto de test permiten medir exact match de intención y slots dentro de un CI, detectando regresiones cuando cambia el modelo ASR o el formato de prompt.

## Benchmarks y rendimiento

Métrica: exact match, que exige que la intención y todos los slots sean correctos. Conjunto de prueba: 200 comandos egipcios escritos por hablantes nativos, más el test de MASSIVE (saudí/MSA).

| Modelo | Test egipcio | Test MASSIVE (saudí/MSA) |
|---|---:|---:|
| Este adaptador (Qwen3-1.7B + LoRA) | 0,590 | 0,583 |
| Qwen3-0.6B + LoRA | 0,510 | 0,539 |
| Claude Sonnet 5, 5-shot | 0,435 | 0,450 |
| Qwen3-0.6B sin entrenar, 5-shot | 0,040 | 0,030 |
| Dialect-BERT de 110 M (encoder, según la model card) | 0,625 | no disponible |

Datos adicionales aportados por el autor: la mejora sobre Claude Sonnet 5 con cinco ejemplos es de +15,5 puntos (IC 95 % [+8,5, +22,5], bootstrap pareado) y la validez del JSON es del 100 % con decodificación greedy. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K) en la información disponible, ya que el modelo no está orientado a esas tareas.

## Requisitos de hardware

- Espacio en disco del adaptador: 0,4 GB (safetensors). El modelo base Qwen3-1.7B debe descargarse aparte.
- VRAM estimada para inferencia: alrededor de 3,4 GB solo para los pesos del base en bfloat16 (1.700 millones de parámetros × 2 bytes); con activaciones y caché KV, una estimación razonable es de 4 a 6 GB. Es una estimación de cálculo, no una cifra publicada por el autor.
- GPU recomendadas: cualquier GPU con 6-8 GB de VRAM o más. No se requieren A100 ni H100; una RTX 3060 de 12 GB, una RTX 4060 Ti de 16 GB o una RTX 4090 son más que suficientes para inferencia.
- Cabe en GPU de consumo: sí, el modelo base tiene 1.700 millones de parámetros y la carga se hace con `device_map="auto"` y `torch_dtype="bfloat16"`.
- Opciones de despliegue: `transformers` + `peft` (el procedimiento documentado en la model card); entrenamiento con TRL `SFTTrainer`. No se documenta compatibilidad con vLLM, TGI, llama.cpp u Ollama. El autor menciona que existe una variante MLX para Apple Silicon en el repositorio hermano de 0.6B.
- Latencia y throughput: no disponibles. Como referencia relativa, el autor indica que un encoder dialect-BERT de 110 millones logra 0,625 con 25 veces menos latencia, lo que sugiere que el adaptador sobre 1.7B es la opción orientada a precisión y no a latencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Exact match (egipcio) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Qwen3-1.7B + LoRA) | 1.700 M + LoRA r=16 | no disponible | 0,590 | Apache 2.0 | HuggingFace, 0 descargas en la consulta |
| Qwen3-0.6B + LoRA (variante hermana) | 600 M + LoRA | no disponible | 0,510 | no disponible | Repositorio hermano; incluye variante MLX |
| Dialect-BERT de 110 M | 110 M | no disponible | 0,625 | no disponible | Repositorio GitHub del autor |
| Claude Sonnet 5, 5-shot | no disponible | no disponible | 0,435 | Propietaria | API comercial |

Conclusiones que se pueden extraer de los datos aportados: el adaptador de 1.7B supera al de 0.6B en 8 puntos en egipcio y queda por debajo del encoder de 110 millones en 3,5 puntos; el modelo frontera con cinco ejemplos queda último de la comparativa. La disyuntiva práctica es precisión frente a latencia y coste, no tamaño bruto.

## Limitaciones y advertencias

- Cobertura dialectal restringida: solo se entrenó y evaluó en dialecto egipcio. Otros dialectos árabes no fueron entrenados ni evaluados.
- Rendimiento absoluto moderado: 0,590 de exact match implica que aproximadamente 4 de cada 10 comandos del test nativo no se resuelven de forma totalmente correcta. No es apto para producción crítica sin validación propia y mecanismos de confirmación.
- Dominio acotado: limitado al ámbito de Amazon MASSIVE (comandos de altavoz inteligente) y a sus convenciones arbitrarias de delimitación de spans, que no tienen por qué coincidir con las de un producto real.
- Dependencia estricta del prompt: el modelo fue entrenado con un system prompt literal y sin ejemplos. Cualquier variación del prompt degrada el rendimiento de forma notable.
- Alternativa más eficiente ya identificada: un dialect-BERT de 110 millones alcanza 0,625 con 25 veces menos latencia, por lo que para las aproximadamente 60 intenciones cubiertas el despliegue con encoder es más barato.
- Riesgo de alucinación en la estructura: la validez sintáctica del JSON es del 100 % con greedy, pero eso no garantiza que la intención o los slots sean semánticamente correctos; el valor puede ser inventado dentro de un JSON válido.
- Datos sintéticos: 6.500 de los ejemplos son reescrituras generadas por un LLM y filtradas por reglas, lo que puede introducir sesgos hacia formulaciones típicas de modelo y no cubrir la variabilidad real del habla egipcia.
- Muestra de evaluación pequeña: 200 comandos, con intervalos de confianza amplios en las comparaciones (+15,5 puntos, IC 95 % [+8,5, +22,5]).
- Consideraciones de licencia: el adaptador es Apache 2.0, pero conviene verificar por separado los términos del modelo base Qwen/Qwen3-1.7B y del corpus MASSIVE antes de un uso comercial.
- Anomalía en los metadatos: las fechas de creación y actualización registradas en HuggingFace (2026-09-17) son posteriores a la fecha habitual de consulta; conviene tratarlas con cautela.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin informes de terceros sobre su comportamiento fuera del conjunto de prueba del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Alhasan/qwen3-1.7b-egyptian-arabic-lora
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Corpus Amazon MASSIVE: https://github.com/alexa/massive
- Repositorio GitHub del autor (metodología, test de significación y figuras): https://github.com/<your-username>/egyptian-arabic-nlu — el enlace aparece como marcador de posición sin concretar en la model card; el archivo `configs/schema.json` con las intenciones y slots válidos se encuentra en ese mismo repositorio.
- Búsqueda web: no se encontraron resultados relevantes sobre este modelo. Los resultados devueltos corresponden al Explorador de archivos de Windows y no guardan relación con el adaptador.
