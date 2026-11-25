# kaushikvira/Qwen3.8-Flash-Next-swift15-nvfp4-basalt

## Resumen

Qwen3.8-Flash-Next-swift15-nvfp4-basalt es un empaquetado en formato NVFP4 del modelo ukisai/Swift-1.5-Qwen3.8-Flash-Next, un derivado afinado por UkisAI sobre el MoE Qwen3.8-Flash-Next del equipo Qwen. El modelo base es un Mixture-of-Experts de aproximadamente 130 000 millones de parametros, con capacidades multimodales (image-text-to-text) y un perfil de razonamiento eficiente en tokens: segun la model card, el afinado Swift 1.5 reduce un 63,4 % los tokens de "thinking" respecto al base con menos de un 1 % de perdida de precision. Este paquete concreto lo publica kaushikvira y no anade entrenamiento propio: es una conversion de formato y empaquetado.

La relevancia de esta ficha esta en el motor de inferencia, no en el modelo: el contenedor `.basalt` esta disenado para Basalt (un fork de Strata), un motor exclusivo para GPUs Blackwell (sm_120) que descarga los expertos que no caben en VRAM desde RAM del host fijada (pinned). Con ello, un MoE de ~130 000 millones de parametros cuyos pesos NVFP4 ocupan unos 122 GB puede servirse en una unica tarjeta de 72 GB, con una tabla PLE de n-gramas de ~48 GB en RAM. La cuantizacion NVFP4 (4,5 bits por peso efectivos con escalas de bloque) aprovecha los tensor cores FP4 nativos de Blackwell y, segun el autor, mantiene mejor calidad que el nivel de 3 bits (KLD 0,0680 frente a 0,1547).

Se trata, por tanto, de un artefacto muy especializado: no es compatible con vLLM, llama.cpp ni NInfer, y requiere hardware y motor concretos. Resulta util para quien tenga una RTX 50 o PRO 5000 con 72 GB de VRAM y mucha RAM rapida, y quiera servir trafico agentico de contexto largo con un MoE grande en una sola tarjeta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture-of-Experts) con atencion y capas densas; incluye tabla PLE de n-gramas y drafter MTP para decodificacion especulativa |
| Parametros totales | ~130 000 millones (aproximado, segun la model card) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la model card menciona soporte de contexto largo y cache KV elastica, sin cifra) |
| Tipos de cuantizacion | NVFP4 (4,5 bpw efectivos con escalas de bloque) en pesos; tabla PLE en Q8_0 dentro del pack (e4m3 en el puente); cache KV en 4 bits (k8v4) |
| Idiomas soportados | en (ingles) |
| Licencia | other (no se detalla el texto; hereda restricciones del modelo base y del checkpoint fuente, que esta gated) |
| Formato de pesos | Contenedor `.basalt` (single-file pack, especifico del motor Basalt); no safetensors ni GGUF |
| Tamano del repositorio | 262,6 GB |
| Motor de inferencia | Basalt (fork de Strata), kernels sm_120 Blackwell; API compatible con OpenAI y Anthropic |
| Modelo base | ukisai/Swift-1.5-Qwen3.8-Flash-Next (a su vez sobre Qwen/Qwen3.8-Flash-Next) |
| Modalidad | image-text-to-text (multimodal entrada imagen + texto) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer con mezcla de expertos (MoE) de ~130 000 millones de parametros, derivado del Qwen3.8-Flash-Next del equipo Qwen. Sobre esa base, UkisAI aplico un post-entrenamiento de refuerzo (RL) y OPD orientado a trabajo agentico de horizonte largo y a codigo, penalizando el "overthinking" patologico; el resultado es el perfil Swift 1.5, que segun la model card recorta un 63,4 % los tokens de razonamiento con menos de un 1 % de caida de precision. El modelo incorpora una tabla PLE (n-gram) de gran tamano (102 GB en BF16) y tensores MTP (Multi-Token Prediction) que actuan como drafter para decodificacion especulativa.

Este paquete concreto no reentrena ni recalibra: convierte el checkpoint NVFP4 de ukisai al formato de seccion del contenedor Basalt, reutilizando el layout de secciones de un pack hermano en IQ3_S (el layout depende de la forma del modelo, no de la cuantizacion) y reempaquetando cada tensor experto y denso en la seccion NVFP4 sin modificar pesos. La tabla PLE se cuantiza primero a e4m3 en un proceso puente de 16 workers y luego a Q8_0 dentro del pack (~48 GB), con cuidado de saltar los codigos NaN de e4m3 (0x7F/0xFF). Se embebe ademas el drafter MTP verificado por SHA256. La innovacion operativa es la gestion de memoria del motor: expertos residentes en RAM fijada y cache en VRAM para el subconjunto caliente, con decodificacion limitada por ancho de banda (323 GB/s de RAM medida frente a 1124 GB/s de HBM), lo que hace viable el streaming de expertos frios.

## Capacidades

- Generacion de texto y razonamiento multi-paso, con modo de razonamiento eficiente en tokens (perfil Swift 1.5).
- Entrada multimodal imagen-texto (pipeline image-text-to-text).
- Generacion de codigo y tareas de ingenieria de software de horizonte largo, objetivo declarado del post-entrenamiento.
- Uso agentico: la model card describe trafico "agentic" y API compatible con OpenAI y Anthropic, lo que facilita integrarlo en frameworks de agentes.
- Tool calling / function calling: no se detalla explicitamente en la informacion disponible, aunque la orientacion agentica y la API compatible lo sugieren; no confirmado.
- Contexto largo con cache KV elastica de 4 bits (k8v4) y desalojo de conversaciones inactivas a RAM.
- Decodificacion especulativa mediante drafter MTP embebido.
- Capacidades multilingues: limitadas al ingles segun el campo `language: en`.

## Casos de uso

- Servicio de agentes de codigo en una sola GPU: el modelo puede mantener sesiones largas de refactorizacion o depuracion con contexto extenso, apoyandose en la cache KV elastica y en el perfil de razonamiento eficiente para no inflar coste por token.
- Atencion al cliente con contexto largo: conversaciones multi-turno con historial extenso se benefician del desalojo de conversaciones inactivas a RAM, lo que permite multiplexar muchas sesiones en una tarjeta de 72 GB.
- Analisis de documentos e imagenes: al ser image-text-to-text, puede procesar capturas, diagramas o documentos escaneados junto con instrucciones textuales en un mismo flujo.
- Automatizacion de pipelines de CI/CD asistida por LLM: integracion via API compatible con OpenAI para revision de cambios, generacion de pruebas o triaje de fallos, con el modelo servido localmente.
- Investigacion sobre cuantizacion e inferencia MoE: el pack y su receta documentada (RECIPE.md) sirven para estudiar el compromiso entre NVFP4 y 3 bits, el offload de expertos y el comportamiento de la tabla PLE.
- Despliegue de un MoE de ~130 000 millones en hardware de estacion de trabajo: para equipos con una RTX 50 o PRO 5000 de 72 GB y RAM DDR5 abundante que no pueden costear un nodo multi-GPU.
- Prototipado de asistentes multimodales con razonamiento eficiente: util cuando el coste por token de "thinking" es el cuello de botella y se prioriza latencia sobre profundidad de razonamiento.

## Benchmarks y rendimiento

La model card aporta metricas de calidad de cuantizacion frente a un pack de referencia Q8_0 del mismo modelo, no benchmarks de tareas estandar:

| Metrica | NVFP4 (este pack) | IQ3_S (nivel 3 bits) |
|---|---|---|
| KLD frente a referencia Q8_0 | 0,0680 | 0,1547 |
| Acuerdo top-1 | 91,46 % | 87,25 % |
| Tamano de pesos | ~122 GB | ~81 GiB |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM: 72 GB recomendados (clase RTX 50 / PRO 5000, sm_120). Los pesos NVFP4 solos ocupan ~122 GB, por lo que se requiere offload de expertos a RAM.
- RAM del host: el equipo medido por el autor tenia 246 GiB DDR5 con 323 GB/s de ancho de banda medido; la tabla PLE (~48 GB) y los expertos frios residen en RAM.
- GPU: exclusivamente Blackwell (sm_120) en la practica, por los kernels del motor; no funciona en A100, H100 ni RTX 4090.
- No cabe en GPUs de consumo de 24 GB ni 48 GB.
- Despliegue: unicamente mediante el motor Basalt con `basalt serve --config config.json`; no es compatible con vLLM, llama.cpp, Ollama, TGI ni NInfer.
- Latencia y throughput: no disponibles; la model card solo indica que la decodificacion MoE esta limitada por ancho de banda de memoria y que NVFP4 no penaliza velocidad frente a 3 bits en Blackwell.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / motor | Licencia | Notas |
|---|---|---|---|---|---|
| Este pack (Swift-1.5 Qwen3.8-Flash-Next NVFP4 Basalt) | ~130 000 M MoE | no disponible | `.basalt`, solo Basalt (Blackwell) | other | Offload de expertos a RAM; KLD 0,0680 |
| ukisai/Swift-1.5-Qwen3.8-Flash-Next-NVFP4 | ~130 000 M MoE | no disponible | NVFP4 estandar (gated) | no disponible | Pesos fuente sin empaquetar; requiere otro motor |
| ukisai/Swift-Qwen3.8-Flash-Next (BF16) | ~130 000 M MoE | no disponible | safetensors BF16 | no disponible | Finetune Swift 1.5 sin cuantizar; no cabe en 72 GB |
| Qwen/Qwen3.8-Flash-Next (base) | ~130 000 M MoE | no disponible | safetensors BF16 | no disponible | Modelo upstream del equipo Qwen |

No se dispone de datos de rendimiento comparativo en tareas entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Dependencia total del motor Basalt y de GPUs Blackwell sm_120: el contenedor `.basalt` no es portable a otros runtimes.
- Solo ingles declarado; el rendimiento en castellano no esta garantizado ni documentado.
- Licencia "other" sin texto visible: es imprescindible revisar los terminos del checkpoint fuente (gated) y del modelo base antes de cualquier uso comercial.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no hay evaluaciones de factualidad publicadas en la informacion disponible.
- El rendimiento depende fuertemente del ancho de banda de RAM del host; con memoria mas lenta el streaming de expertos penalizara la latencia.
- La cuantizacion NVFP4 introduce desviacion respecto al BF16 (KLD 0,0680 frente a referencia Q8_0), aceptable segun el autor pero no nula.
- El repositorio ocupa 262,6 GB, lo que exige almacenamiento y tiempo de descarga considerables.
- No hay cifras publicadas de contexto maximo, throughput ni latencia, lo que dificulta planificar capacidad en produccion.
- La fecha de creacion del repositorio (2026-11-01) y la combinacion de nombres de modelo deben verificarse contra las fuentes oficiales antes de adoptarlo.

## Enlaces

- Hugging Face (este pack): https://huggingface.co/kaushikvira/Qwen3.8-Flash-Next-swift15-nvfp4-basalt
- Checkpoint NVFP4 fuente (gated): https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-Flash-Next-NVFP4
- Finetune Swift 1.5 en BF16: https://huggingface.co/ukisai/Swift-Qwen3.8-Flash-Next
- Modelo base Qwen: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Motor Basalt (fork de Strata): https://github.com/jesdga95/basalt
- Parche kv-host-offload: https://github.com/kaushikvira/basalt
