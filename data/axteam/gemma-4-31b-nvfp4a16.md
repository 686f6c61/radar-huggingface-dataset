# axteam/gemma-4-31B-NVFP4A16

## Resumen

`axteam/gemma-4-31B-NVFP4A16` es una cuantización de 4 bits del modelo denso `google/gemma-4-31B`, publicada por el usuario axteam. No es un modelo nuevo: es un checkpoint derivado (PTQ, cuantización post-entrenamiento) pensado específicamente para servir el modelo original con vLLM de forma eficiente en memoria. El modelo base es un transformer denso multimodal de Google, con pipeline `image-text-to-text`, es decir, acepta imágenes y texto como entrada y genera texto.

La relevancia práctica del checkpoint está en el ahorro de memoria: los pesos en FP4 ocupan unos 20,4 GB en disco, frente a los aproximadamente 62 GB que ocuparía el modelo en BF16. El esquema es W4A16 (pesos FP4 E2M1 con grupo de 16, escalas FP8 E4M3 más escala global FP32 por tensor, activaciones en BF16), almacenado en formato `compressed-tensors` `nvfp4-pack-quantized`. La torre de visión, la proyección de visión, los embeddings (atados con `lm_head`) y todas las normas se mantienen en BF16, lo que representa alrededor del 6 % de los parámetros.

Un detalle importante: el repositorio declara 18.460.143.562 parámetros reales en los safetensors, mientras que el nombre del modelo y la model card hablan de "31B". La discrepancia no se aclara en la información disponible; conviene tratarla como una advertencia a la hora de planificar hardware. Además, se trata de un modelo base (pre-entrenado) sin plantilla de chat, por lo que debe usarse para completación de texto, no como asistente conversacional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Gemma 4, transformer denso (multimodal image-text-to-text) |
| Parámetros totales | 18.460.143.562 según safetensors; la model card indica "31B" (discrepancia no aclarada) |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | NVFP4A16 (W4A16, pesos FP4 E2M1, grupo 16; activaciones BF16); vision tower, proyección de visión, embeddings y normas en BF16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0, con enlace a la licencia de Gemma 4 (`ai.google.dev/gemma/docs/gemma_4_license`) |
| Formato de pesos | safetensors, `compressed-tensors` (`nvfp4-pack-quantized`) |
| Tamaño en disco | ~20,4 GB (repo: 20,5 GB) |
| Modelo base | `google/gemma-4-31B` (commit `5bbc2fb`) |
| Runtime recomendado | vLLM ≥ 0,19,0 (probado con 0,32,0) |
| `trust_remote_code` | no necesario |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de la familia Gemma 4 de Google, con capacidad multimodal de entrada (imagen y texto) y salida de texto. Este checkpoint concreto no introduce cambios arquitectónicos: reproduce la arquitectura del original y solo modifica la representación numérica de los pesos. La cuantización es PTQ con método AWQ (activation-aware weight quantization) sobre 256 muestras de calibración, con un conjunto sesgado hacia coreano y, según la model card, con respuestas en modo thinking incluidas. No hay reentrenamiento ni gradientes: el proceso identifica los canales de peso que multiplican las activaciones de mayor magnitud y los protege con escalado por canal antes del redondeo.

La model card distingue explícitamente entre RTN, AWQ y QAT, y sitúa este build en AWQ, con una fidelidad a 4 bits claramente superior a RTN y por debajo de QAT. Google publica checkpoints QAT separados para Gemma, y este repositorio no es uno de ellos. El tokenizador, el `processor_config` y el `generation_config` son idénticos byte a byte al original; el `config.json` es el del modelo base más un bloque `quantization_config`. No se dispone de información sobre el número de tokens de entrenamiento del modelo base ni sobre la composición del dataset, más allá de lo que publique Google en su documentación.

## Capacidades

- Generación de texto mediante completación (modelo base sin plantilla de chat): continuar prefijos, redactar, resumir y responder preguntas en formato few-shot.
- Entrada multimodal imagen-texto: el pipeline declarado es `image-text-to-text`, con la torre de visión y la proyección mantenidas en BF16 para preservar calidad.
- Razonamiento y matemáticas básicas: los benchmarks reportados incluyen GSM8K, ARC-Challenge y MMLU, con resultados cercanos al modelo BF16.
- Capacidad multilingüe parcial: se reportan KMMLU (coreano) y HAE-RAE (coreano), lo que sugiere cobertura de coreano además del inglés; el resto de idiomas no está documentado.
- No hay evidencia en la información disponible de soporte de tool calling, function calling, agentes o razonamiento multi-paso; al ser un modelo base sin plantilla de chat, estas capacidades no están garantizadas.
- No se documenta modo thinking, audio ni otras modalidades más allá de imagen y texto.
- Muestreo recomendado por Google: `temperature=1.0`, `top_p=0.95`, `top_k=64`.

## Casos de uso

- Servicio de completación de texto en producción con vLLM: el checkpoint está diseñado para `vllm serve`, con pesos de 20,4 GB que permiten desplegarlo en una sola GPU de 24 GB o en varias mediante `--tensor-parallel-size`, reduciendo coste frente al BF16.
- Procesamiento de documentos con imágenes: al aceptar image-text-to-text, puede extraer y describir contenido de capturas, diagramas o páginas escaneadas en pipelines de digitalización, siempre que se formule la tarea como completación y no como chat.
- Generación asistida en lote (batch offline): con vLLM y prompts few-shot se pueden generar resúmenes, clasificaciones o reescrituras sobre grandes volúmenes de texto, aprovechando el throughput del servidor.
- Evaluación comparativa de cuantizaciones: sirve como referencia reproducible para medir la pérdida de calidad de FP4 frente a BF16, FP8 y AWQ-8bit con lm-evaluation-harness sobre vLLM.
- Investigación en eficiencia de inferencia: útil para estudiar el comportamiento de pesos FP4 con activaciones BF16 en GPUs sin tensor cores FP4 (Turing sm75 en adelante), ya que el esquema es weight-only.
- Prototipado multimodal en investigación: permite explorar tareas imagen-texto con un modelo de tamaño medio-alto en hardware de una sola máquina, sin necesidad de un clúster para el BF16 original.
- Base para fine-tuning posterior: al conservar tokenizador y configuración originales, puede servir de punto de partida para adaptaciones, aunque la cuantización FP4 complica el ajuste fino directo y requeriría de-cuantizar o partir del BF16.

## Benchmarks y rendimiento

Resultados medidos por el autor con lm-evaluation-harness sobre vLLM, greedy, prompts de completación sin plantilla de chat. Los porcentajes entre paréntesis indican la recuperación respecto al BF16 original.

| Benchmark | BF16 (original) | FP8-dynamic | AWQ-8bit | NVFP4A16 (este repo) | NVFP4 | AWQ-4bit |
|---|---|---|---|---|---|---|
| MMLU (5-shot) | 84,59 | 84,71 (100,1 %) | 84,52 (99,9 %) | 83,70 (98,9 %) | 83,09 (98,2 %) | 84,02 (99,3 %) |
| GSM8K (5-shot, strict) | 84,46 | 83,09 (98,4 %) | 84,23 (99,7 %) | 83,78 (99,2 %) | 82,03 (97,1 %) | 84,15 (99,6 %) |
| ARC-Challenge (0-shot) | 69,62 | 68,94 (99,0 %) | 69,11 (99,3 %) | 68,43 (98,3 %) | 67,49 (96,9 %) | 69,11 (99,3 %) |
| Winogrande (5-shot) | 83,90 | 84,29 (100,5 %) | 84,29 (100,5 %) | 84,45 (100,7 %) | 82,64 (98,5 %) | 83,58 (99,6 %) |
| KMMLU (5-shot, direct) | 67,35 | 67,22 (99,8 %) | 67,39 (100,1 %) | 66,41 (98,6 %) | 65,22 (96,8 %) | 67,33 (100,0 %) |
| HAE-RAE (0-shot) | 82,31 | 82,03 (99,7 %) | 82,03 (99,7 %) | 81,94 (99,6 %) | 80,29 (97,6 %) | 81,85 (99,4 %) |
| Media | 78,71 | 78,38 (99,6 %) | 78,60 (99,9 %) | 78,12 (99,3 %) | 76,79 (97,6 %) | 78,34 (99,5 %) |

No se han publicado en la información disponible datos de latencia ni throughput.

## Requisitos de hardware

- VRAM para pesos: 20,4 GB. Hay que añadir la caché KV (no cuantizada, BF16, crece con longitud de contexto y peticiones concurrentes) y varios GB para activaciones y CUDA graphs.
- GPU soportadas: NVIDIA Turing (sm75) o superior, porque el esquema es weight-only FP4 y no requiere tensor cores FP4. V100 (sm70) no está soportado.
- Una sola GPU de 24 GB (por ejemplo, RTX 4090 o L4) puede alojar los pesos, pero el margen para caché KV y activaciones es ajustado; para contextos largos o mucha concurrencia conviene una GPU de 40-80 GB (A100, H100) o repartir con `--tensor-parallel-size`.
- El autor solo probó el checkpoint en B200; la selección de kernel por GPU la realiza vLLM 0,32 a partir de su propio código, por lo que el rendimiento en otras tarjetas no está verificado en la información disponible.
- Despliegue: vLLM ≥ 0,19,0 (probado con 0,32,0, que requiere Python 3.11-3.14, torch 2.13 con CUDA 13.0, transformers ≥ 5.16.1,< 5.20 y compressed-tensors 0.17.0, sin actualizar por separado). Sin vLLM, se indica `transformers>=5.5.0` (5.5.2+ recomendado), aunque el autor no lo ejecutó para el 31B.
- No se documentan opciones de despliegue con llama.cpp, Ollama o TGI para este formato `compressed-tensors`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Calidad (media de benchmarks del autor) | Licencia | Formato / runtime |
|---|---|---|---|---|---|
| `axteam/gemma-4-31B-NVFP4A16` (este) | 18,46 B según safetensors (etiqueta 31B) | no disponible | 78,12 (99,3 % del BF16) | apache-2.0 / Gemma 4 | compressed-tensors NVFP4, vLLM |
| `google/gemma-4-31B` (BF16) | etiqueta 31B | no disponible | 78,71 (referencia) | Gemma 4 / Apache-2.0 | safetensors BF16, vLLM/transformers |
| AWQ-8bit del mismo modelo | etiqueta 31B | no disponible | 78,60 (99,9 %) | Gemma 4 / Apache-2.0 | compressed-tensors, vLLM |
| NVFP4 (sin A16) del mismo modelo | etiqueta 31B | no disponible | 76,79 (97,6 %) | Gemma 4 / Apache-2.0 | compressed-tensors, vLLM |

No se dispone de datos para comparar con modelos de otras familias de tamaño similar; la comparativa se limita a las variantes de cuantización del mismo modelo base reportadas por el autor.

## Limitaciones y advertencias

- Es un modelo base sin plantilla de chat: usarlo como asistente conversacional producirá resultados pobres; debe emplearse con prompts de completación o few-shot.
- La cuantización AWQ a 4 bits introduce una pérdida media de calidad de aproximadamente el 0,7 % respecto al BF16, con caídas mayores en MMLU (98,9 %) y ARC-Challenge (98,3 %); en tareas sensibles conviene validar contra el original.
- La discrepancia entre los 18,46 B de parámetros reales y la etiqueta "31B" puede llevar a errores de planificación de memoria y de comparación con otros modelos.
- El conjunto de calibración está sesgado hacia coreano, lo que puede afectar de forma desigual al rendimiento en otros idiomas; no hay datos de calidad en castellano.
- Riesgo de alucinación inherente a un modelo de lenguaje generativo; no hay evaluación específica de factualidad en la información disponible.
- La licencia se declara apache-2.0 pero remite a la licencia de Gemma 4 de Google; es necesario revisar los términos de uso comercial de Gemma antes de desplegarlo en producción.
- Requiere vLLM ≥ 0,19,0 y versiones muy concretas de torch, transformers y compressed-tensors; mezclar versiones puede impedir la carga del checkpoint.
- No soporta V100 ni GPUs anteriores a Turing; el rendimiento solo se validó en B200.
- No se documentan sesgos específicos, límites de contexto ni idiomas soportados más allá de lo indicado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/axteam/gemma-4-31B-NVFP4A16
- Modelo base: https://huggingface.co/google/gemma-4-31B
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- vLLM: https://github.com/vllm-project/vllm
- compressed-tensors: https://github.com/neuralmagic/compressed-tensors
