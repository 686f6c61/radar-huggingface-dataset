# AliceYin/video-model-mid90

## Resumen

Video model mid90 es un conjunto de checkpoints base (pre-entrenados) de un modelo de lenguaje de 3,3B parámetros totales con arquitectura Mixture of Experts (MoE) y 0,87B parámetros activos, publicado por la usuaria AliceYin en HuggingFace. A pesar del nombre, el artefacto distribuido es un modelo de lenguaje, no un modelo de vídeo: los pesos provienen de un "video model run" entrenado con un esquema DiLoCo de dos nodos sobre la rama `take6-two-node-longctx` del repositorio de entrenamiento del autor. El checkpoint destacado es `r76`, que continúa el entrenamiento desde la ronda 51 (60,57B tokens) hasta los 98,0B tokens vistos.

El modelo no ha pasado por ajuste fino supervisado ni por alineación (RLHF/DPO); se trata de pesos base en fp32 pensados para servir como punto de partida de experimentos posteriores. Su relevancia es limitada y muy específica: interesa a quien quiera reproducir el pipeline DiLoCo del autor, estudiar la evolución de las métricas entre rondas de entrenamiento o continuar el pre-entrenamiento con su propio código, dado que la arquitectura solo está definida en el fichero `code/video_model_train.py` del repositorio de entrenamiento y no en formato estándar (no hay safetensors ni GGUF).

El repositorio está marcado como privado y la model card justifica esa decisión por obligaciones de licencia de los datos de entrenamiento (conjuntos de NVIDIA Nemotron bajo el NVIDIA Data Agreement, con obligaciones potenciales de Qwen y phi-4). Cualquier uso público de los pesos requiere revisar previamente esos términos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con capas FFN Mixture of Experts (MoE); definida en `code/video_model_train.py` (`Model` / `Cfg`) |
| Parametros totales | 3,3B |
| Parametros activos | 0,87B |
| Longitud de contexto | no disponible (la rama de entrenamiento se denomina `longctx`, sin valor numérico publicado) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en fp32; no se publican versiones cuantizadas) |
| Idiomas soportados | no disponible (tokenizer `cl100k_base`, mayoritariamente inglés; sin evaluación multilingüe publicada) |
| Licencia | `other` (repositorio privado; sujeto a obligaciones de las licencias de datos y posiblemente de Qwen / phi-4) |
| Formato de pesos | `model.pt` con `torch.save(dict(weights=..., cfg=...))`, fp32; sin safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer con capas de alimentación hacia delante de tipo Mixture of Experts, con 3,3B parámetros totales y 0,87B activos por token. Los sesgos de enrutamiento MoE se almacenan como `blocks.{i}.ffn.bias` y deben cargarse por separado del `state_dict` principal, tal como muestra el snippet de la model card. El tokenizer es `tiktoken cl100k_base` con documentos prefijados por EOT. La configuración exacta (número de capas, dimensión oculta, número de expertos, top-k de enrutamiento, cabezas de atención) no se detalla en la información disponible y solo puede consultarse en el código de entrenamiento referenciado.

El entrenamiento se realizó con un esquema DiLoCo de dos nodos sobre datos de alta calidad, partiendo de la ronda 51 (60,57B tokens) y alcanzando la ronda 76 (98,0B tokens) con un learning rate de 7,4e-5 en fase de decaimiento temprano. La mezcla de datos incluye conjuntos de NVIDIA Nemotron, Dolma 3 / Dolmino (odc-by), FineWeb-Edu, DCLM, Ultra-FineWeb, FinePDFs-Edu, SwallowMath-v2, MegaMath y OpenMathReasoning, entre otros. No se menciona RLHF, DPO ni SFT: son pesos exclusivamente pre-entrenados.

## Capacidades

- Generación de texto autoregresiva en inglés, con calidad propia de un modelo base de ~3B parámetros y sin alineación.
- Razonamiento aritmético básico y matemático: GSM8K 44,20 (8-shot) y MATH-500 17,14 (4-shot) en el checkpoint r76.
- Generación de código: HumanEval 29,88 (0-shot pass@1) y MBPP 27,2 (3-shot pass@1).
- Conocimiento general y sentido común: MMLU 42,55, HellaSwag 58,54, PIQA 73,18, ARC-C 44,97, WinoGrande 60,14, OpenBookQA 37,8.
- Capacidad multilingüe: no evaluada; C-Eval 33,73 sugiere un conocimiento limitado de chino.
- Tool calling / function calling: no disponible; no se ha entrenado para ello.
- Modo thinking, visión o audio: no disponible.
- Uso como checkpoint intermedio para continuar pre-entrenamiento o para ajuste fino posterior.

## Casos de uso

- Investigación sobre entrenamiento distribuido DiLoCo: el par de checkpoints r51/r76 permite medir la ganancia de 37,4B tokens adicionales de entrenamiento con la misma configuración y evaluar la estabilidad del enrutamiento MoE entre rondas.
- Estudio de dinámica de expertos en MoE de bajo número de parámetros activos: con 0,87B activos sobre 3,3B totales, es un banco de pruebas económico para analizar balanceo de carga, colapso de expertos y sesgos de enrutamiento.
- Punto de partida para ajuste fino supervisado (SFT): al ser un modelo base sin alinear, un equipo puede aplicar su propio dataset de instrucciones y evaluar si la inicialización MoE supera a un dense de tamaño comparable.
- Reproducción de la evaluación `unibench`: el harness descrito (log-prob zero-shot para avg8, 8-shot GSM8K, 4-shot MATH-500, pass@1 en HumanEval y MBPP) sirve como referencia para comparar checkpoints propios con las mismas condiciones.
- Experimentos de decaimiento de learning rate: r76 se entrenó con LR 7,4e-5 en fase de decaimiento temprano, lo que permite estudiar el efecto de distintas programaciones sobre las métricas finales.
- Docencia y formación técnica: un modelo pequeño, con código de arquitectura explícito y formato de checkpoint simple (`torch.save`), es adecuado para explicar cómo se construye y evalúa un MoE desde cero.
- Baseline interno de bajo coste: para tareas de generación de texto en inglés donde no se requiera alineación ni instrucciones, puede servir como referencia antes de invertir en modelos mayores.

## Benchmarks y rendimiento

Resultados publicados por el autor con el mismo harness `unibench` para ambos checkpoints:

| Benchmark | r51 (60,57B tokens) | r76 (98,0B tokens) |
|---|---|---|
| score9 | 32,86 | 36,84 |
| avg8 | 62,16 | 63,87 |
| MMLU | 31,95 | 42,55 |
| C-Eval | 26,52 | 33,73 |
| GSM8K (8-shot) | 40,79 | 44,20 |
| MATH-500 (4-shot) | 16,33 | 17,14 |
| HumanEval (0-shot pass@1) | 23,78 | 29,88 |
| MBPP (3-shot pass@1) | 24,2 | 27,2 |
| WinoGrande | no disponible | 60,14 |
| OpenBookQA | no disponible | 37,8 |
| HellaSwag | no disponible | 58,54 |
| PIQA | no disponible | 73,18 |
| ARC-C | no disponible | 44,97 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 13,2 GB solo para pesos (3,3B × 4 bytes), más overhead de activaciones y caché KV; en la práctica, 16-24 GB para contextos moderados.
- En fp16/bf16: unos 6,6 GB de pesos; en int8, unos 3,3 GB; en int4, unos 1,65 GB. Estas conversiones no están publicadas y requerirían scripts propios, ya que el checkpoint es fp32 y el formato no es estándar.
- GPU recomendadas: A100 40/80 GB o H100 para entrenamiento y evaluación a gran escala; RTX 4090 (24 GB) o RTX 3090 (24 GB) suficientes para inferencia en fp32 o fp16.
- Cabe en GPU de consumo: sí, en tarjetas con 16 GB o más en fp16; en 8-12 GB requeriría cuantización manual a int8/int4.
- Opciones de despliegue: no hay soporte directo en vLLM, llama.cpp, Ollama ni TGI, porque el formato `model.pt` con `Cfg` propio no es compatible con esos runners. El despliegue requiere cargar el modelo con `code/video_model_train.py` y escribir un bucle de generación propio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| video-model-mid90 (r76) | 3,3B | 0,87B | no disponible | other (privado) | `model.pt` fp32 | Repo privado, sin runners estándar |
| Qwen2.5-3B | 3,1B | dense | 32K | Apache 2.0 | safetensors, GGUF | Público, soporte en vLLM/llama.cpp |
| Phi-3.5-mini | 3,8B | dense | 128K | MIT | safetensors, GGUF | Público, soporte amplio |
| OLMoE-1B-7B | 6,9B | 1,3B | 4K | Apache 2.0 | safetensors | Público, soporte en vLLM |

La comparación es orientativa: los tres modelos alternativos están alineados con instrucciones y publican resultados de benchmarks superiores en MMLU y código, mientras que video-model-mid90 es un base sin alinear, con licencia restrictiva y sin integración en herramientas estándar. No se dispone de comparaciones directas publicadas por el autor.

## Limitaciones y advertencias

- Modelo base sin alineación: no sigue instrucciones de forma fiable, no tiene formato de chat y puede producir contenido inapropiado o incoherente en tareas conversacionales.
- Riesgo de alucinación elevado: MMLU 42,55 y MATH-500 17,14 indican un conocimiento factual y matemático limitado, con tendencia a inventar hechos y pasos de razonamiento.
- Sin evaluación multilingüe: el tokenizer `cl100k_base` y los datos mayoritariamente ingleses hacen que el rendimiento en castellano sea previsiblemente bajo.
- Licencia `other` y repositorio privado: los datos de entrenamiento incluyen conjuntos de NVIDIA Nemotron bajo el NVIDIA Data Agreement (solo entrenamiento interno, sin redistribución) y los pesos podrían arrastrar obligaciones de Qwen o phi-4. Es imprescindible revisar los términos antes de cualquier uso comercial o publicación.
- Formato no estándar: la carga requiere el código `code/video_model_train.py` del repositorio de entrenamiento; no hay safetensors, GGUF ni integración con vLLM, llama.cpp, Ollama o TGI.
- Longitud de contexto no documentada: no se puede planificar su uso en tareas de contexto largo sin medirla empíricamente.
- Sesgos desconocidos: no se ha publicado ninguna evaluación de sesgos, toxicidad o seguridad.
- Sin soporte de tool calling ni agentes: no apto para pipelines que dependan de function calling.
- Checkpoint intermedio: r76 es el "mejor hasta ahora" en una fase de decaimiento temprano; no es un modelo final y su calidad puede no ser representativa de un entrenamiento completado.

## Enlaces

- HuggingFace: https://huggingface.co/AliceYin/video-model-mid90
- Repositorio de entrenamiento (rama `take6-two-node-longctx`, fichero `code/video_model_train.py`): no disponible como URL en la información proporcionada
- Paper de DiLoCo: no disponible en la información proporcionada
- NVIDIA Data Agreement for Model Training: no disponible como URL en la información proporcionada
- Dolma 3 / Dolmino (odc-by), FineWeb-Edu, DCLM, Ultra-FineWeb, FinePDFs-Edu, SwallowMath-v2, MegaMath, OpenMathReasoning: no disponible como URLs en la información proporcionada
