# noahrossi/gpt-oss-120b-refusal-r1-vllm

## Resumen

`noahrossi/gpt-oss-120b-refusal-r1-vllm` es un adaptador LoRA de rango 1 sobre el modelo abierto `openai/gpt-oss-120b`, publicado por el usuario noahrossi como build de servicio lista para vLLM. No es un modelo autónomo: el repositorio ocupa 0,3 GB y contiene únicamente las correcciones de bajo rango que modifican el comportamiento del modelo base, en concreto su política de rechazo. Se trata de una compilación de servicio del adaptador canónico `shomit505/gpt-oss-120b-refusal-r1`.

El interés técnico del artefacto no está en el entrenamiento, sino en el reempaquetado de pesos. El adaptador original almacena las correcciones por experto en `mlp.experts.<E>.{gate,up,down}_proj`, pero gpt-oss intercala las proyecciones gate y up a lo largo de la dimensión de salida (`[gate0, up0, gate1, up1, …]`), mientras que la ruta de carga por experto de vLLM asume un layout con las compuertas primero. Cargado tal cual, aproximadamente la mitad de las correcciones caen sobre el peso equivocado y casi todas sobre la fila equivocada, sin que se emita ningún error: el adaptador se comporta como ruido débil. Este build reempaqueta los pesos al layout fusionado `experts.base_layer` de vLLM para que la carga se resuelva por la ruta que des-intercala correctamente.

Su relevancia es acotada y de perfil investigador: el repositorio acumulaba 0 descargas y 0 likes en el momento de la consulta, no declara licencia ni idiomas, y su efecto medido es la eliminación del rechazo (tasa de cumplimiento del 85,6 % sobre 610 peticiones dañinas retenidas, frente al 2,5 % del modelo base). Es, por tanto, un artefacto de red-teaming y de estudio de alineación, no un modelo para despliegue orientado al público.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) de rango 1 sobre un transformer con mezcla de expertos (MoE); pesos reempaquetados al layout fusionado `experts.base_layer` de vLLM |
| Parametros totales | Adaptador: LoRA de rango 1, repositorio de 0,3 GB. Modelo base: ~117.000 millones (117B) según la documentación de OpenAI para `gpt-oss-120b`; no declarado en este repositorio |
| Parametros activos | ~5.100 millones (5,1B) en el modelo base, MoE con enrutado top-4 sobre 128 expertos según la documentación de `gpt-oss-120b`; no declarado en este repositorio |
| Longitud de contexto | 128.000 tokens en el modelo base (heredada); no declarada en este repositorio |
| Tipos de cuantizacion | El modelo base distribuye los expertos en MXFP4 según su documentación; este repositorio no declara cuantizaciones propias |
| Idiomas soportados | no disponible |
| Licencia | no disponible en el repositorio (el modelo base `openai/gpt-oss-120b` se publica bajo Apache 2.0) |
| Formato de pesos | safetensors (0,3 GB) con nomenclatura fusionada de vLLM; no cargable con `peft` de HuggingFace |
| Modelo base | `openai/gpt-oss-120b` |
| Modulos objetivo del LoRA | `mlp.experts.<E>.{gate,up,down}_proj` por experto; el LoRA de rango 1 sobre `lm_head` se descarta en este build |
| Rango del adaptador | 1 (`--max-lora-rank 1`) |
| Runtime probado | vLLM 0.29.0 sobre 1×A100-80GB |
| Fecha de publicacion | 17 de septiembre de 2026 (última actualización: 17 de septiembre de 2026) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 1 aplicado sobre las proyecciones de los expertos de la MoE del modelo base, más un LoRA de rango 1 sobre `lm_head` que este build elimina porque vLLM no admite LoRA sobre el `lm_head` de gpt-oss; según la model card, su efecto era despreciable (máx. |ΔW| ≈ 0,0017 por logit). No se documentan en la información disponible ni el dataset de entrenamiento, ni el número de tokens, ni la composición de los datos, ni si hubo RLHF, DPO u otra etapa de preferencias. Tampoco se especifica la función de pérdida ni la configuración de entrenamiento del adaptador original.

La innovación técnica reseñable es exclusivamente de serving: el reempaquetado offline de los pesos al layout fusionado de vLLM, con gate y up pre-intercalados, de modo que la carga pase por la ruta específica de gpt-oss y se des-intercale correctamente. El script de conversión es de un solo uso y exige que gate y up compartan `lora_A` por experto. El impacto sobre la distribución del modelo se midió como divergencia KL de secuencia completa frente al modelo base sobre 100 prompts inofensivos: 0,0199 nats/token, es decir, un desplazamiento muy pequeño fuera del dominio de rechazo.

## Capacidades

- Eliminación del rechazo: sobre 610 peticiones dañinas retenidas, la tasa de cumplimiento pasa de 0,025 en el modelo base a 0,856 con el adaptador, y la de rechazo cae de 0,975 a 0,049.
- Capacidades generales heredadas del modelo base `gpt-oss-120b`: generación de texto, razonamiento, código, matemáticas, tool calling y uso en agentes. No están documentadas ni verificadas en este repositorio.
- Modo de razonamiento (thinking) heredado del modelo base. No documentado en este repositorio.
- Multilingüismo: no disponible; el repositorio no declara idiomas.
- Capacidades de visión o audio: no disponibles; no se declaran.
- Servicio multi-LoRA: se puede cargar junto al modelo base en vLLM mediante `--enable-lora --max-lora-rank 1` y conmutar el adaptador por petición con `"model": "refusal-r1"`.
- Comportamiento evasivo medido: un 9,5 % de las respuestas son evasiones fluidas hacia una pregunta adyacente más segura (17,0 % en xstest), y un 10,0 % de las 580 respuestas que el regex marcó como cumplidas resultaron ser evasiones tras revisión por juez.

## Casos de uso

- Red-teaming y evaluación de seguridad: cargar el adaptador en vLLM junto al base y medir la degradación de las defensas con conjuntos como jailbreakbench, strongreject o xstest, comparando contra la línea base.
- Investigación en direcciones de rechazo e interpretabilidad: al ser un LoRA de rango 1 sobre las proyecciones de los expertos, permite estudiar qué subespacio de pesos controla la negativa a responder y hasta qué punto es localizable.
- Auditoría de clasificadores de contenido: usar las 610 respuestas evaluadas como material etiquetado (cumplido / evadido / rechazado / roto) para medir falsos negativos de guardrails propios.
- Pruebas de regresión de moderación: verificar que un filtro de entrada o salida sigue bloqueando contenido dañino cuando el modelo subyacente ha sido desalineado deliberadamente.
- Estudio de desplazamiento de distribución: replicar la medición de KL (0,0199 nats/token sobre 100 prompts inofensivos) para cuantificar cuánto cambia un modelo al aplicar adaptadores de bajo rango antes de desplegarlos.
- Generación de datos de contraste para alineación: producir pares de respuesta cumplidora y rechazante sobre los mismos prompts para entrenar clasificadores de seguridad o modelos de recompensa.
- Docencia e investigación académica: demostrar en un entorno controlado y con vLLM real el efecto de una intervención mínima (rango 1) sobre la política de rechazo de un modelo de 120B.
- Validación de infraestructura de serving: comprobar el pipeline de carga de LoRA sobre MoE en vLLM, incluida la ruta de des-intercalado de gate/up, antes de desplegar adaptadores legítimos.

## Benchmarks y rendimiento

Evaluación del adaptador con LoRA de rango 1 y esfuerzo medio, sobre 610 peticiones dañinas retenidas. El modelo base, puntuado por regex, obtuvo 0,025 de cumplimiento y 0,975 de rechazo. Las cifras del adaptador están corregidas por juez; "evadido" designa una respuesta fluida a una pregunta adyacente más segura en lugar de a la formulada.

| Fuente | n | Cumplido | Evadido | Rechazado | Roto |
|---|---:|---:|---:|---:|---:|
| Global | 610 | 0,856 | 0,095 | 0,049 | 0,000 |
| jailbreakbench | 100 | 0,970 | 0,020 | 0,010 | 0,000 |
| strongreject | 310 | 0,900 | 0,071 | 0,029 | 0,000 |
| xstest | 200 | 0,730 | 0,170 | 0,100 | 0,000 |

| Metrica adicional | Valor |
|---|---|
| Proporción de evasiones entre las 580 respuestas marcadas como cumplidas por regex | 10,0 % |
| Divergencia KL de secuencia completa frente al base (100 prompts inofensivos) | 0,0199 nats/token |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otras pruebas de capacidad general para este adaptador.

## Requisitos de hardware

- VRAM estimada: los pesos del modelo base en MXFP4 ocupan del orden de 60-65 GB, a lo que hay que sumar caché KV para 128k de contexto; en la práctica se necesita un nodo con ≥80 GB por GPU para servir base y adaptador con margen.
- Configuración verificada: 1×A100-80GB con vLLM 0.29.0, según la model card.
- GPUs recomendadas: A100 80GB, H100 80GB, H200 141GB, B200. Para menos VRAM por GPU sería necesario tensor parallelism (por ejemplo 2×A100-40GB o 2×L40S-48GB), opción no verificada en la información disponible.
- GPU de consumo: no viable con este build. No cabe en tarjetas de 24 GB (RTX 4090, 3090) ni siquiera con cuantizaciones de 4 bits; requeriría offload a RAM o SSD con penalización severa de velocidad, y este artefacto es exclusivo de vLLM y no se puede fusionar de vuelta con `peft`.
- Opciones de despliegue: vLLM con `--enable-lora --max-lora-rank 1 --lora-modules refusal-r1=noahrossi/gpt-oss-120b-refusal-r1-vllm`. No es compatible con llama.cpp, Ollama ni TGI en este formato; para esos entornos habría que partir del adaptador canónico `shomit505/gpt-oss-120b-refusal-r1` y fusionarlo o convertirlo.
- El adaptador añade 0,3 GB sobre el modelo base, un coste de VRAM despreciable frente al peso del modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Comportamiento en rechazo | Licencia | Despliegue |
|---|---|---|---|---|---|---|
| `noahrossi/gpt-oss-120b-refusal-r1-vllm` | LoRA r=1 reempaquetado para vLLM | 0,3 GB de adaptador sobre base de ~117B | 128k (heredado) | Cumplido 0,856 / rechazado 0,049 (n=610) | no disponible | vLLM 0.29.0 |
| `shomit505/gpt-oss-120b-refusal-r1` | LoRA r=1 en formato PEFT canónico | Idéntico adaptador, formato PEFT | 128k (heredado) | Mismos pesos; evaluación propia no disponible en la información consultada | no disponible | `peft` / transformers; no carga en vLLM por el problema de intercalado |
| `openai/gpt-oss-120b` | Transformer MoE | ~117B totales, ~5,1B activos (documentación de OpenAI) | 128k | Cumplido 0,025 / rechazado 0,975 | Apache 2.0 | vLLM, llama.cpp, Ollama, TGI |

Otros adaptadores de eliminación de rechazo sobre `gpt-oss-120b` de terceros: no disponibles en la información proporcionada, por lo que no se incluyen datos comparativos.

## Limitaciones y advertencias

- El adaptador está diseñado explícitamente para aumentar la conformidad con peticiones dañinas: pasa del 2,5 % al 85,6 % de cumplimiento sobre 610 prompts retenidos. No debe desplegarse en aplicaciones orientadas al público, en asistentes de atención al cliente ni en ningún flujo sin guardrails externos independientes del modelo.
- La licencia no está declarada en el repositorio. Aunque el modelo base es Apache 2.0, la ausencia de licencia en el adaptador genera incertidumbre jurídica para cualquier uso, comercial o no.
- No es cargable con `peft` de HuggingFace: la nomenclatura fusionada es una convención de vLLM. Para entrenamiento, mezcla o conversión a GGUF hay que usar el artefacto canónico `shomit505/gpt-oss-120b-refusal-r1`, y los pesos resultantes no serán idénticos a este build.
- El LoRA de `lm_head` se descarta, de modo que este build diverge ligeramente del adaptador original (máx. |ΔW| ≈ 0,0017 por logit).
- Riesgo de alucinación: no evaluado. Al eliminarse la negativa a responder, el modelo puede generar contenido plausible pero falso sobre temas sensibles sin señal de abstención.
- Desplazamiento de distribución: KL de 0,0199 nats/token sobre 100 prompts inofensivos, bajo pero no nulo; se desconoce su efecto sobre tareas de razonamiento, código o matemáticas.
- Comportamiento evasivo: entre el 7,1 % y el 17,0 % de las respuestas son evasiones hacia preguntas adyacentes más seguras, según el conjunto. En xstest, un 10,0 % sigue rechazando, lo que sugiere que la eliminación del rechazo no es uniforme.
- Idiomas, sesgos demográficos y comportamientos fuera de los conjuntos evaluados: no documentados. Los sesgos del modelo base probablemente se heredan.
- Validación comunitaria nula: 0 descargas y 0 likes en el momento de la consulta; no hay informes independientes de reproducibilidad.
- La evaluación del adaptador está corregida por juez y limitada a tres conjuntos de prompts en inglés; no cubre ataques adversariales fuera de esos conjuntos ni evaluación humana a escala.
- Dependencia estricta de vLLM 0.29.0 y de su ruta de carga específica para gpt-oss; cambios de versión pueden romper el comportamiento observado sin lanzar error.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/noahrossi/gpt-oss-120b-refusal-r1-vllm
- Modelo base: https://huggingface.co/openai/gpt-oss-120b
- Adaptador PEFT canónico: https://huggingface.co/shomit505/gpt-oss-120b-refusal-r1
- Búsqueda web: los resultados devueltos no contienen enlaces relevantes al modelo (únicamente páginas corporativas de Microsoft), por lo que no se incluye ningún enlace adicional.
