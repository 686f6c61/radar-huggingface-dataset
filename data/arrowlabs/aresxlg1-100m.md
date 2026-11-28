# ArrowLabs/AresXLG1-100M

## Resumen

AresXLG1-100M es un modelo de lenguaje base de tipo SLM (small language model) desarrollado por ArrowLabs, con 98.975.308 parámetros reales según los pesos en safetensors. Se presenta como el miembro de 100 millones de parámetros de la familia Ares y está entrenado predominantemente con datos generales filtrados, con un énfasis declarado en matemáticas y código. Su arquitectura y tokenizador están "fuertemente inspirados" en los modelos KLM más recientes, según la model card, y el autor afirma superar a KLM 1.6 en varias métricas.

El modelo se distribuye como checkpoint base, sin ajuste por instrucciones ni modo de razonamiento (thinking), por lo que no es apto para chat ni para seguir instrucciones directamente. Su relevancia radica en el nicho de modelos extremadamente pequeños (menos de 100M de parámetros) con licencia Apache 2.0, orientados a experimentación, ajuste fino posterior y despliegue en entornos con recursos muy limitados.

La información pública disponible es escasa: la model card es breve, no detalla la longitud de contexto ni la composición exacta del dataset, y el repositorio tiene 180 descargas y 1 like en el momento de la consulta. Los benchmarks publicados son los que el propio autor incluye en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer inspirado en los modelos KLM (detalle exacto no disponible) |
| Parametros totales | 98.975.308 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,4 GB, con código personalizado: custom_code) |

## Arquitectura y entrenamiento

La model card indica que AresXLG1-100M emplea una arquitectura y un tokenizador "fuertemente inspirados en los últimos modelos KLM", y que está "BASADO EN KLM 1.6". No se especifica el tipo exacto de transformer (número de capas, dimensión oculta, cabezas de atención, tipo de atención ni normalización), ni la longitud de contexto nativa, ni el número total de tokens de entrenamiento.

El entrenamiento combina datasets públicos filtrados: smollm-corpus, MegaMath-Web-Pro-Max, Wikipedia, FineWeb-Edu, PerfectPdfs (de ArrowLabs), Ultra-FineWeb-L3, DCLM-Ultra y DCLM-Ultra-1.1 (de ArrowLabs), FineMath y TinyMathStories generado con gpt-oss-20b. El autor menciona además el uso de "muchos datasets privados", incluidos datos destilados de modelos mayores y datasets de alta calidad no publicados. No se documenta si hubo RLHF, DPO u otras fases de alineación; de hecho, la advertencia final de la model card confirma que es un modelo base sin ajuste instructivo ni de razonamiento.

## Capacidades

- Generación de texto autoregresiva en inglés como modelo base (continuación de texto, no diálogo).
- Razonamiento aritmético y matemático básico, reflejado en la inclusión de ArithMark 3.0 entre sus benchmarks y en el uso de datasets matemáticos (MegaMath, FineMath, TinyMathStories).
- Generación de código y texto de tipo programación, según las etiquetas del repositorio (code, coding, programming), aunque sin benchmarks de código publicados.
- Conocimiento general y sentido común medido con PIQA, HellaSwag y ARC.
- No soporta tool calling ni function calling de forma nativa (modelo base sin tuning).
- No soporta agentes ni razonamiento multi-paso (sin modo thinking ni instruct).
- Multilingüismo: limitado a inglés según el campo `language`.
- No dispone de visión, audio ni otras modalidades.

## Casos de uso

- Investigación sobre modelos pequeños: servir como punto de partida para estudiar dinámicas de entrenamiento, tokenizadores o recetas de datos en la escala de 100M de parámetros, gracias a su licencia Apache 2.0 y su tamaño reducido.
- Ajuste fino supervisado (SFT) para tareas concretas: al ser un checkpoint base, es adecuado para fine-tuning con datasets propios de clasificación, extracción o generación acotada antes de desplegarlo.
- Destilación y experimentos de alineación: su pequeño tamaño permite ejecutar ciclos completos de DPO o RLHF en una sola GPU consumer, usando AresXLG1-100M como alumno.
- Evaluación de recetas de datos: los datasets empleados (DCLM-Ultra, Ultra-FineWeb-L3, PerfectPdfs) permiten reproducir y comparar el efecto de mezclas de datos en modelos de 100M.
- Generación de texto de bajo coste en dispositivos: con menos de 100M de parámetros y pesos de 0,4 GB, puede ejecutarse en CPU o GPUs integradas para tareas de autocompletado o generación de plantillas en inglés.
- Educación y docencia: útil para demostrar el pipeline completo de un LLM (tokenización, preentrenamiento, evaluación con PIQA/HellaSwag/ARC) sin necesidad de infraestructura grande.
- Base para modelos especializados en matemáticas elementales: dado su rendimiento en ArithMark 3.0 (60,60), puede ajustarse para resolución de problemas aritméticos simples o generación de ejercicios.

## Benchmarks y rendimiento

Datos publicados en la model card del autor (no verificados de forma independiente):

| Modelo | ArithMark 3.0 | PIQA | HellaSwag | ARC-Easy | ARC-Challenge | Open SLM Int Index |
|---|---:|---:|---:|---:|---:|---:|
| AresXLG1-100M | **60,60** | 68,25 | 46,58 | 58,00 | 32,08 | **34,84** |
| KLM 1.6 | 55,90 | 70,18 | 45,28 | 61,07 | 33,53 | 33,95 |
| Boris 2 (144M) | 45,90 | **72,85** | 50,27 | 59,76 | 32,00 | 34,34 |
| Boris 2 Think (144M) | 49,20 | 72,31 | 50,13 | **63,93** | **34,81** | **36,05** |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,4 GB de pesos (98,98M de parámetros × 4 bytes), más overhead de activaciones y KV cache; en la práctica cabe en cualquier GPU con 1-2 GB libres.
- En fp16/bf16: alrededor de 0,2 GB de pesos.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) e incluso GPUs integradas o CPU; no requiere A100 ni H100.
- Cabe holgadamente en GPU consumer y en dispositivos de borde.
- Opciones de despliegue: al usar `custom_code`, es necesario cargar con `trust_remote_code=True` en Transformers; es compatible con text-generation-inference según las etiquetas del repositorio. No se documentan versiones GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Open SLM Int Index | Licencia | Formato |
|---|---:|---|---:|---|---|
| AresXLG1-100M | 98,98M | no disponible | 34,84 | Apache 2.0 | safetensors |
| KLM 1.6 | no disponible | no disponible | 33,95 | no disponible | no disponible |
| Boris 2 | 144M | no disponible | 34,34 | no disponible | no disponible |
| Boris 2 Think | 144M | no disponible | 36,05 | no disponible | no disponible |

La comparativa se limita a los modelos incluidos por el autor en su model card; no se dispone de datos de contexto, licencia ni formato de pesos de las alternativas en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo base sin ajuste instructivo ni de razonamiento: no puede usarse para chat, seguir instrucciones ni modo thinking, tal como advierte explícitamente la model card.
- Riesgo elevado de alucinación y de generación incoherente en tareas complejas, propio de un modelo de menos de 100M de parámetros.
- Idiomas: solo inglés; no se garantiza un rendimiento aceptable en castellano u otros idiomas.
- Longitud de contexto no documentada: no se puede planificar su uso en tareas de contexto largo sin verificación empírica.
- Sesgos: no se documentan evaluaciones de sesgo, toxicidad ni seguridad; los datasets web filtrados pueden arrastrar sesgos de origen.
- Los benchmarks son autoinformados por el autor, sin verificación independiente, y las métricas de la familia Boris 2 y KLM 1.6 provienen de la misma fuente.
- Uso comercial permitido por la licencia Apache 2.0, pero sin garantías del autor; conviene auditar el modelo antes de producción.
- Requiere `trust_remote_code=True` por el uso de código personalizado, lo que implica ejecutar código del repositorio; conviene revisarlo antes de desplegar.
- El autor menciona datasets privados no publicados, lo que impide reproducir el entrenamiento por completo.

## Enlaces

- Hugging Face: https://huggingface.co/ArrowLabs/AresXLG1-100M
- Dataset smollm-corpus: https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Dataset MegaMath-Web-Pro-Max: https://huggingface.co/datasets/OctoThinker/MegaMath-Web-Pro-Max
- Dataset Wikipedia: https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset PerfectPdfs: https://huggingface.co/datasets/ArrowLabs/PerfectPdfs
- Dataset Ultra-FineWeb-L3: https://huggingface.co/datasets/openbmb/Ultra-FineWeb-L3
- Dataset DCLM-Ultra: https://huggingface.co/datasets/ArrowLabs/DCLM-Ultra
- Dataset DCLM-Ultra-1.1: https://huggingface.co/datasets/ArrowLabs/DCLM-Ultra-1.1
- Dataset FineMath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Dataset TinyMathStories: https://huggingface.co/datasets/AlgoDriveAI/TinyMathStories_gpt-oss-20b
