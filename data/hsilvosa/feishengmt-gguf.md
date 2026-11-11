# hsilvosa/feishengmt-GGUF

## Resumen

feishengmt-GGUF es la versión cuantizada en formato GGUF del modelo hsilvosa/feishengmt, un ajuste fino de tencent/Hy-MT2-1.8B orientado a la traducción del chino al inglés de ficción wuxia y xianxia (novelas web). El autor, hsilvosa, publica esta variante Q4_K_M (1,1 GB) para su uso con llama.cpp, manteniendo la licencia Apache-2.0 del modelo base de Tencent. El modelo está pensado para traducir capítulos completos de novelas web chinas con un pipeline que trocea el texto en ventanas de párrafos, aplica un glosario y valida la respuesta.

El modelo resuelve un problema muy concreto: la traducción automática genérica pierde terminología de artes marciales, nombres propios y convenciones de diálogo de la ficción wuxia/xianxia. El ajuste fino sobre Hy-MT2-1.8B incorpora un glosario y un formato de prompt específicos, y el paquete incluye una CLI (`webnovel_mt.translate`) que gestiona el troceado y la verificación. Aunque el entrenamiento se centra en chino→inglés, el modelo también responde en francés, portugués, español, indonesio, japonés y coreano.

Con 1.791.080.448 parámetros (aproximadamente 1,8 mil millones), es un modelo pequeño que cabe en GPU de consumo y en CPU. La cuantización Q4_K_M apenas degrada la calidad: la model card reporta pérdidas de 0,1 a 1,2 puntos chrF respecto al checkpoint bf16 en las cinco variantes de texto evaluadas. Es relevante para quien necesite traducir novelas web de forma local, sin depender de APIs, con un coste de hardware mínimo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de tencent/Hy-MT2-1.8B; detalles de atención no disponibles) |
| Parametros totales | 1.791.080.448 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens configurados en llama-server; 2.048 tokens por slot con `-np 4`; contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (única variante publicada en este repo) |
| Idiomas soportados | zh, en, fr, pt, es, id, ja, ko |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (repo de 2,3 GB; archivo Q4_K_M de 1,1 GB) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de tencent/Hy-MT2-1.8B, un modelo de traducción de 1,8 mil millones de parámetros. La model card de esta variante GGUF no detalla la arquitectura interna del modelo base (tipo de atención, normalización, tokenizador), por lo que esos datos quedan como no disponibles en la información proporcionada. El ajuste fino se realizó sobre datos de ficción wuxia y xianxia, presumiblemente pares de capítulos chinos e ingleses, con un glosario asociado que el pipeline aplica durante la inferencia.

La innovación principal no está en la arquitectura sino en el pipeline de traducción: el texto se corta en ventanas de párrafos (hasta 400 caracteres por ventana según la configuración documentada), se inyectan las líneas del glosario y se valida la respuesta del modelo. La model card no especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. La cuantización Q4_K_M se evaluó contra el checkpoint bf16 fusionado (3,6 GB) con decodificación greedy, una sola ejecución y 40 ventanas por variante (28 para la variante de comillas partidas entre párrafos).

## Capacidades

- Traducción chino→inglés de ficción wuxia y xianxia, con terminología específica del género.
- Traducción a francés, portugués, español, indonesio, japonés y coreano (adaptación secundaria; no medida en la variante GGUF).
- Manejo de texto con comillas angulares `「」` y comillas partidas entre párrafos.
- Manejo de caracteres tradicionales y simplificados.
- Formato conversacional (tag `conversational` en Hugging Face) compatible con endpoints.
- Integración con llama.cpp mediante `llama-server` y flag `--jinja`.
- Pipeline incluido con glosario y CLI de traducción por ventanas.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Traducción de capítulos de novelas web wuxia/xianxia: el pipeline `webnovel_mt.translate` trocea el capítulo en ventanas de párrafos, aplica el glosario y valida la respuesta, lo que permite procesar capítulos completos de forma desatendida con consistencia terminológica.
- Traducción local sin conexión: al ser un GGUF Q4_K_M de 1,1 GB, se ejecuta en un portátil o en una máquina sin GPU dedicada mediante llama.cpp, útil para traductores que trabajan con material sensible o sin acceso estable a APIs.
- Servicio multi-cliente con slots paralelos: `llama-server -c 8192 -np 4` reparte 2.048 tokens de contexto por slot, suficiente para una ventana de hasta 400 caracteres más el glosario y la respuesta, lo que permite atender cuatro peticiones concurrentes en un solo proceso.
- Preprocesado de corpus para investigación: traducir grandes volúmenes de ficción china a inglés para análisis literario, estudios de recepción o construcción de datasets paralelos, con coste de cómputo marginal.
- Traducción asistida para equipos de scanlation y fan translation: el glosario configurable permite fijar la traducción de nombres de técnicas, personajes y lugares, reduciendo la revisión manual posterior.
- Prototipado de productos de traducción especializada: sirve como base para evaluar la viabilidad de un traductor de género antes de invertir en modelos mayores o en entrenamiento propio, dado su bajo requisito de hardware.
- Traducción multilingüe exploratoria a español, francés, portugués, indonesio, japonés y coreano: útil para obtener primeras versiones que luego se revisan, aunque el autor advierte que estas lenguas no se midieron en la variante GGUF.

## Benchmarks y rendimiento

La model card reporta chrF sobre ventanas retenidas de un conjunto de capítulos (set 2 de la model card principal), 40 ventanas por variante (28 para la variante de comillas partidas), pipeline en modo ventanas, decodificación greedy y una sola ejecución. No se publican MMLU, HumanEval, GSM8K ni otros benchmarks generales.

| Variante del texto fuente | bf16 chrF | GGUF Q4_K_M chrF | Comillas como referencia (bf16 / GGUF) |
|---|---|---|---|
| Limpio | 47,9 | 47,6 | 97,5 % / 95 % |
| Comillas angulares `「」` | 48,1 | 47,7 | 95 % / 95 % |
| Comillas partidas entre párrafos | 48,3 | 47,1 | 96 % / 93 % |
| Caracteres tradicionales | 47,1 | 47,0 | 97,5 % / 95 % |
| Tradicionales y `「」` | 47,1 | 47,0 | 95 % / 95 % |

La pérdida por cuantización oscila entre 0,1 y 1,2 chrF, del orden del ruido de una sola ejecución según el autor. Las demás lenguas no se midieron en el GGUF.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5-2 GB con Q4_K_M (archivo de 1,1 GB más overhead de contexto y KV cache); el contexto de 8.192 tokens incrementa el uso de KV cache.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 y H100 funcionan sobradamente. También es viable en CPU.
- Cabe en GPU de consumo: sí, en todas las GPU modernas con al menos 4 GB de VRAM; también en iGPU y en CPU.
- Opciones de despliegue: llama.cpp (`llama-server`, build 10615 probado por el autor). Ollama y LM Studio no fueron probados según la model card. vLLM y TGI no se documentan para este formato GGUF.
- Latencia y throughput: no disponibles. La configuración recomendada (`-c 8192 -np 4`) permite cuatro slots concurrentes de 2.048 tokens cada uno.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| feishengmt-GGUF (este) | 1,79 B | 8.192 configurado | Traducción zh→en de wuxia/xianxia | Apache-2.0 | GGUF Q4_K_M |
| tencent/Hy-MT2-1.8B (base) | 1,8 B | no disponible | Traducción general | Apache-2.0 | safetensors |
| hsilvosa/feishengmt (bf16) | 1,79 B | no disponible | Traducción zh→en de wuxia/xianxia | Apache-2.0 | safetensors (3,6 GB) |

No se dispone de datos de benchmarks comparativos con otros modelos de traducción en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento frente a alternativas.

## Limitaciones y advertencias

- El entrenamiento y la evaluación se centran en chino→inglés; las traducciones a francés, portugués, español, indonesio, japonés y coreano no se midieron en la variante GGUF y deben considerarse secundarias.
- La evaluación se hizo con una sola ejecución y 40 ventanas por variante; la variabilidad entre ejecuciones puede ser del orden de la diferencia observada entre bf16 y Q4_K_M.
- La variante de comillas partidas entre párrafos es la que más pierde con la cuantización (48,3 → 47,1 chrF) y la que peor preserva las comillas como referencia (96 % → 93 %).
- Solo se probó con `llama-server` build 10615; Ollama y LM Studio no fueron validados por el autor.
- El pipeline está pensado para inglés; para otras lenguas hay que usar el prompt de la model card principal.
- No es un modelo de propósito general: no se documentan capacidades de razonamiento, código, matemáticas, tool calling ni agentes.
- Riesgo de alucinación y de invención de terminología en pasajes ambiguos o con jerga muy específica no cubierta por el glosario.
- No está respaldado por Tencent; es una versión modificada y cuantizada del modelo original, sujeta a los términos de la licencia Apache-2.0 y al aviso `NOTICE` del repositorio.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hsilvosa/feishengmt-GGUF
- Modelo base (bf16): https://huggingface.co/hsilvosa/feishengmt
- Modelo original de Tencent: https://huggingface.co/tencent/Hy-MT2-1.8B
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
