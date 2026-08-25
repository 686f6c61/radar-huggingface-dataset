# horiuchinobuyuki/Qwick-3.5-9B-NVFP4

## Resumen

Qwick-3.5-9B-NVFP4 es una exportación cuantizada en formato NVFP4 (NVIDIA FP4) del modelo Qwick-3.5-9B, un fine-tune de Qwen3.5-9B desarrollado por Nobuyuki Horiuchi con el objetivo de reducir la longitud del razonamiento (thinking) manteniendo una calidad comparable al modelo base. Esta versión NVFP4 reduce el peso del checkpoint BF16 en un 52,8 %, pasando de 19,31 GB a 8,88 GB, lo que permite desplegar el modelo en GPUs con menos memoria.

El modelo está pensado para entornos de producción donde el ahorro de VRAM es crítico, pero el propio autor advierte que es una versión experimental: todas las métricas medidas (MMLU-Pro, GPQA, IFEval y MMMU) sufren una regresión respecto al checkpoint BF16. La calibración de la cuantización se realizó únicamente con texto, y aunque se evaluó en 900 filas de validación de MMMU, el pipeline declarado sigue siendo `text-generation`, sin soporte multimodal de producción.

La licencia es Apache 2.0, los idiomas declarados son inglés y japonés, y el formato de pesos es safetensors, probado con vLLM 0.23.0 y el backend Cutlass linear en una NVIDIA RTX PRO 6000 Blackwell.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3.5-9B) |
| Parametros totales | 5.953.707.248 (checkpoint NVFP4; el modelo base Qwick-3.5-9B tiene ~9B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 131.072 tokens (contexto de servidor usado en validacion) |
| Tipos de cuantizacion | NVFP4 (este checkpoint); tambien existe version FP8 del mismo modelo |
| Idiomas soportados | en, ja |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Qwick-3.5-9B es un fine-tune de Qwen3.5-9B, un modelo denso de vision-lenguaje de la familia Qwen3.5. El objetivo del fine-tune es acortar la cadena de razonamiento generada por el modelo sin sacrificar calidad, lo que se traduce en menos tokens de salida y menor latencia. El checkpoint NVFP4 es una exportacion realizada con NVIDIA ModelOpt, que aplica cuantizacion de 4 bits en punto flotante (NVFP4) sobre los pesos del modelo.

La calibracion de la cuantizacion se hizo exclusivamente con datos de texto, sin incluir datos de imagen. No se han publicado detalles sobre el dataset de entrenamiento del fine-tune, el numero de tokens utilizados ni si se aplicaron tecnicas como RLHF o DPO. La unica informacion disponible es que el modelo base Qwick-3.5-9B supera a Qwen3.5-9B BF16 en MMMU validation (74,556 % frente a 73,778 %) con una media de tokens de razonamiento notablemente menor (4798,66 frente a 6476,48).

## Capacidades

- Generacion de texto y razonamiento con modo thinking: el modelo genera una cadena de razonamiento interna antes de la respuesta final, pero mas corta que la de Qwen3.5-9B.
- Razonamiento eficiente: en las pruebas publicadas, Qwick NVFP4 genera una media de 2134,60 tokens en MMMU-Pro frente a los 3834,54 de Qwen3.5-9B BF16, y 7840,77 en GPQA frente a 9858,42.
- Capacidades multilingues: ingles y japones declarados en la model card.
- Vision limitada: aunque se evaluo en MMMU validation, el autor indica que el servicio multimodal amplio queda fuera de la calificacion de lanzamiento y el pipeline se mantiene como `text-generation`.
- Compatibilidad con vLLM: probado con vLLM 0.23.0 y backend Cutlass linear.

No se ha confirmado soporte de tool calling, function calling ni capacidades de agente en la informacion disponible.

## Casos de uso

- Despliegue en GPUs de consumo: con 8,88 GB de pesos, el modelo cabe en GPUs con 12-16 GB de VRAM (RTX 4070 Ti Super, RTX 4080, RTX 4090), lo que permite ejecutar un modelo de razonamiento de 9B en hardware domestico o estaciones de trabajo sin necesidad de GPUs de datacenter.
- Asistentes de chat con razonamiento acotado: en aplicaciones de atencion al cliente o soporte tecnico donde se necesita una respuesta razonada pero rapida, el menor numero de tokens de thinking reduce la latencia percibida y el coste por consulta.
- Procesamiento de documentos en ingles y japones: el modelo puede resumir, extraer informacion o responder preguntas sobre textos en ambos idiomas, util para empresas con operaciones en Japon.
- Prototipado rapido de agentes conversacionales: al ser un checkpoint pequeno y con licencia Apache 2.0, se puede integrar en pipelines de desarrollo sin restricciones de uso comercial, ideal para validar ideas antes de escalar a modelos mayores.
- Inferencia en entornos con presupuesto de memoria ajustado: en servidores con multiples modelos cargados simultaneamente, la reduccion del 52,8 % en peso permite alojar mas instancias o dejar espacio para otros componentes.
- Evaluacion de tecnicas de cuantizacion: al ser una exportacion NVFP4 con datos de regresion publicados, sirve como referencia para estudiar el impacto de la cuantizacion de 4 bits en tareas de razonamiento y vision.

## Benchmarks y rendimiento

La model card incluye dos tablas de resultados. La primera compara el checkpoint NVFP4 con el BF16 del mismo modelo:

| Benchmark | Qwick BF16 | Qwick-3.5-9B-NVFP4 | Cambio en puntuacion | Cambio en tokens |
|---|---:|---:|---:|---:|
| MMLU-Pro screen (672 preguntas) | 80,060 % | 77,232 % | -2,827 pp | +0,43 % |
| GPQA-Diamond (198 preguntas) | 78,283 % | 74,747 % | -3,535 pp | +6,45 % |
| IFEval prompt strict (541 prompts) | 89,649 % | 85,767 % | -3,882 pp | +6,64 % |
| MMMU validation (900 filas) | 74,556 % | 70,556 % | -4,000 pp | +13,32 % |

La segunda tabla compara el NVFP4 de Qwick con otras cuantizaciones NVFP4 de Qwen3.5-9B y el BF16 original:

| Modelo | Peso (GB) | MMLU raw / budget | GPQA raw / budget | IFEval prompt strict | IFEval length stops |
|---|---:|---:|---:|---:|---:|
| Qwen3.5-9B BF16 | 19,31 | 78,423 % / 78,423 % | 80,303 % / 80,303 % | 89,279 % | 8 |
| AxionML Qwen3.5-9B NVFP4 | 9,36 | 76,935 % / 76,935 % | 72,727 % / 72,222 % | 87,431 % | 11 |
| ig1 Qwen3.5-9B NVFP4 | 11,20 | 76,488 % / 76,488 % | 72,222 % / 72,222 % | 87,985 % | 9 |
| Qwick-3.5-9B-NVFP4 | 8,88 | 75,298 % / 75,298 % | 77,778 % / 77,778 % | 85,767 % | 16 |

En cuanto a tokens medios generados:

| Modelo | MMLU tokens medios | GPQA tokens medios | IFEval tokens medios |
|---|---:|---:|---:|
| Qwen3.5-9B BF16 | 3834,54 | 9858,42 | 4461,65 |
| AxionML Qwen3.5-9B NVFP4 | 4246,29 | 12934,78 | 5059,26 |
| ig1 Qwen3.5-9B NVFP4 | 4112,53 | 12889,16 | 4638,46 |
| Qwick-3.5-9B-NVFP4 | 2134,60 | 7840,77 | 3673,80 |

Nota: MMLU-Pro es una pantalla de 672 preguntas (48 por cada una de 14 materias), no el conjunto completo de 12.032. GPQA e IFEval son completos. Todos los resultados usan thinking, temperatura 1.0, top-p 0.95, top-k 20, min-p 0, presence penalty 1.5, repetition penalty 1.0 y un maximo de 32.768 tokens generados.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos NVFP4 ocupan 8,88 GB, por lo que con overhead de KV cache y activaciones se recomienda al menos 12 GB de VRAM para contexto largo.
- GPU recomendadas: probado en NVIDIA RTX PRO 6000 Blackwell; tambien deberia funcionar en RTX 4090, RTX 4080, RTX 4070 Ti Super y GPUs de datacenter con soporte FP4 (Hopper o Blackwell).
- Compatibilidad con GPUs de consumo: si, en GPUs con 12-16 GB de VRAM, aunque el contexto maximo de 131.072 tokens puede requerir mas memoria si se usa completo.
- Opciones de despliegue: vLLM (probado con la version 0.23.0), TGI (si soporta NVFP4), y posiblemente llama.cpp si anade soporte para este formato. No se ha confirmado compatibilidad con Ollama.
- Latencia y throughput: no disponible en la informacion publicada.

## Comparativa con modelos similares

La comparativa mas relevante es con otras cuantizaciones NVFP4 de Qwen3.5-9B, ya que comparten arquitectura base y formato:

| Modelo | Peso (GB) | MMLU-Pro | GPQA | IFEval strict | Tokens MMLU |
|---|---:|---:|---:|---:|---:|
| Qwen3.5-9B BF16 | 19,31 | 78,423 % | 80,303 % | 89,279 % | 3834,54 |
| AxionML Qwen3.5-9B NVFP4 | 9,36 | 76,935 % | 72,727 % | 87,431 % | 4246,29 |
| ig1 Qwen3.5-9B NVFP4 | 11,20 | 76,488 % | 72,222 % | 87,985 % | 4112,53 |
| Qwick-3.5-9B-NVFP4 | 8,88 | 75,298 % | 77,778 % | 85,767 % | 2134,60 |

Qwick NVFP4 es el mas ligero de los tres (8,88 GB) y el que menos tokens genera en MMLU, pero tambien el que menor puntuacion obtiene en MMLU-Pro e IFEval. En GPQA supera claramente a las otras dos cuantizaciones NVFP4 (77,778 % frente a 72,727 % y 72,222 %), aunque sigue por debajo del BF16 original (80,303 %). La comparacion no es causal, ya que los conjuntos de calibracion y las implementaciones difieren entre los tres exportadores.

## Limitaciones y advertencias

- Regresion en todas las metricas: el checkpoint NVFP4 pierde entre 2,8 y 4,0 puntos porcentuales respecto al BF16 en MMLU-Pro, GPQA, IFEval y MMMU. No es recomendable para tareas donde la precision sea critica.
- Calibracion solo con texto: la cuantizacion se calibró exclusivamente con datos textuales, por lo que el comportamiento en tareas de vision no esta optimizado. La evaluacion MMMU es de tipo report-only y no equivale al test split completo de 10.500 filas.
- Pipeline text-generation: a pesar de que el modelo base tiene capacidades multimodales, este checkpoint no esta calificado para servicio multimodal en produccion.
- Idiomas limitados: solo se declaran ingles y japones. No se garantiza un rendimiento adecuado en otros idiomas.
- Caracter experimental: el propio autor indica que es una version experimental y recomienda usar la version FP8 cuando el ahorro de memoria adicional no sea imprescindible.
- Riesgo de alucinacion: no se han publicado evaluaciones especificas de alucinacion para este checkpoint. Como modelo de razonamiento, puede generar cadenas de thinking plausibles pero incorrectas.
- Compatibilidad de hardware: NVFP4 requiere GPUs NVIDIA con soporte FP4 (Blackwell o Hopper con ciertas condiciones). No funcionara en GPUs AMD o Intel, ni en NVIDIA de generaciones anteriores sin emulacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/horiuchinobuyuki/Qwick-3.5-9B-NVFP4
- Modelo base Qwick-3.5-9B: https://huggingface.co/horiuchinobuyuki/Qwick-3.5-9B
- Comparativa AxionML Qwen3.5-9B NVFP4: https://huggingface.co/AxionML/Qwen3.5-9B-NVFP4
- Guia de despliegue de Qwen3.5 9B en GPUs de 8 GB: https://insiderllm.com/guides/qwen-3-5-9b-setup-guide/
- Qwen3.5 9B en Jetson AI Lab: https://www.jetson-ai-lab.com/models/qwen3-5-9b/
- Qwen3.5 9B en Ollama: https://ollama.com/library/qwen3.5:9b
