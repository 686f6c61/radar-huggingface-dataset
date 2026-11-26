# disinfozone/wekwos-2-mini-bf16

## Resumen

Wekwos-2-Mini (BF16) es un ajuste fino del modelo multimodal `thinkingmachines/Inkling-2-Mini`, publicado por el usuario `disinfozone` bajo licencia Apache 2.0. Se trata del checkpoint fusionado en precisión completa (BF16, 53,4 GB repartidos en 13 shards de safetensors) del modelo `disinfozone/wekwos-2-mini`, orientado a tareas de lingüística histórica y, en concreto, a la generación y el análisis de protoindoeuropeo reconstruido (código de idioma `ine`). El modelo conserva la torre de visión del modelo base y se distribuye con la plantilla de chat, el tokenizador y el borrador DSpark (`mtp.safetensors`) intactos.

La arquitectura es un transformer con mezcla de expertos (MoE) de 26.388.641.280 parámetros totales, de los cuales aproximadamente 3.400 millones están activos por token y unos 5.400 millones son efectivos, según la model card. El modelo base emplea cuantización mixta en los tensores de expertos (NVFP4 en las capas 0-19 y MXFP8 en las capas 20-23); este repositorio los dequantiza a FP32 y los convierte a BF16 puro, eliminando `hf_quant_config.json` y los tensores auxiliares de cuantización. El resultado es un checkpoint sin cuantizar pensado para servir en clústeres CUDA con vLLM o SGLang, para cuantizadores posteriores (llama.cpp, MLX, FP8/AWQ/EXL) y para investigadores que necesiten los pesos exactos.

Su relevancia es doble: por un lado, demuestra un flujo de trabajo de ajuste fino sobre un MoE multimodal cuantizado, con dequantización a precisión completa y fusión de LoRA; por otro, aplica SFT híbrido con cadena de pensamiento y dos rondas de GRPO guiado por verificador a un dominio muy especializado, obteniendo 88,2 (estricto) y 90,5 (laxo) sobre el PIE Benchmark v2 de 607 ítems. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y se creó el 26 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); clase `Inkling2LoopForConditionalGeneration`, con torre de visión y controladores de bucle (loop controllers) |
| Parametros totales | 26.388.641.280 (26,4 B) |
| Parametros activos | 3,4 B activos; 5,4 B efectivos (MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (este repositorio, sin cuantizar); el modelo base usa NVFP4 en capas 0-19 y MXFP8 en capas 20-23; hay GGUFs Q4_K_M, Q5_K_M, Q6_K y Q8_0, y MLX de 6 y 8 bits |
| Idiomas soportados | `ine` (protoindoeuropeo reconstruido) e `en` (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16, 13 shards, 53,4 GB); también GGUF y MLX en repositorios derivados |

## Arquitectura y entrenamiento

El modelo parte de `thinkingmachines/Inkling-2-Mini`, un transformer con mezcla de expertos que incorpora una torre de visión (de ahí la etiqueta `image-text-to-text`), controladores de bucle propios de la familia Inkling2Loop y un módulo de decodificación especulativa DSpark distribuido aparte en `mtp.safetensors`. Los 48 tensores de expertos enrutados del modelo base estaban cuantizados en NVFP4 (capas 0-19) y MXFP8 (capas 20-23); en este repositorio se dequantizan en FP32 y se convierten a BF16 puro, conservando sin cambios la torre de visión, los controladores de bucle, el tokenizador y la plantilla de chat.

Sobre esa base se fusiona un LoRA (`disinfozone/wekwos-2-mini-lora`) de rango 32, alpha 32 y escala 1,0, aplicado a todas las capas lineales: los 193 objetivos de atención, los expertos enrutados `w1`/`w3`/`w2` y `lm_head`. El entrenamiento combina SFT híbrido con cadena de pensamiento durante 3 épocas y dos rondas de RL con GRPO guiado por verificador, lo que da lugar a un modo de pensamiento híbrido: el 70 % de los ejemplos se generaron con razonamiento morfológico y el 30 % en modo directo. El corpus de entrenamiento se publica en `disinfozone/wekwos-corpus`. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición detallada del dataset.

## Capacidades

- Generación de texto conversacional en inglés y en protoindoeuropeo reconstruido (`ine`).
- Razonamiento morfológico y análisis etimológico orientado a lingüística histórica.
- Modo de pensamiento híbrido controlable mediante `thinking_effort`: 0,7 para razonamiento morfológico (precisión máxima) y 0,0 para respuestas directas.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`, torre de visión preservada del modelo base).
- Decodificación especulativa mediante el borrador DSpark incluido en `mtp.safetensors`.
- Compatibilidad con endpoints (`endpoints_compatible`) y con el ecosistema `transformers`.
- Soporte de tool calling y de agentes multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Investigación en lingüística histórica: el modelo puede generar y comentar formas protoindoeuropeas reconstruidas, con un modo de razonamiento morfológico activado a `thinking_effort=0.7` que maximiza la precisión sobre el PIE Benchmark v2.
- Análisis etimológico asistido: dado un término en una lengua indoeuropea moderna, el modelo puede proponer raíces y correspondencias fonéticas dentro de un flujo de trabajo de revisión humana, gracias a su ajuste específico sobre el corpus `wekwos-corpus`.
- Docencia y divulgación: generación de explicaciones paso a paso sobre reglas de reconstrucción (ley de Grimm, ablaut, etc.) en inglés, usando el modo directo (`thinking_effort=0.0`) para respuestas breves.
- Cuantización y despliegue en hardware de consumo: al publicarse los pesos BF16 sin cuantizar, sirve como punto de partida reproducible para generar GGUFs (Q4_K_M, Q5_K_M, Q6_K, Q8_0) o variantes MLX de 6 y 8 bits y validar su degradación con el benchmark público.
- Servicio de inferencia en clúster CUDA: el checkpoint está pensado para vLLM y SGLang, lo que permite desplegarlo como endpoint compatible con la API de OpenAI para aplicaciones de nicho en humanidades digitales.
- Evaluación comparativa de técnicas de RL: al documentarse dos rondas de GRPO guiado por verificador y publicarse el benchmark de 607 ítems, es un caso de estudio reproducible para medir el efecto del RL sobre un dominio especializado.
- Procesamiento de material escaneado: al conservar la torre de visión, puede recibir imágenes (por ejemplo, páginas de diccionarios etimológicos) junto con instrucciones textuales, aunque la calidad en esta modalidad no está documentada en la información disponible.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| PIE Benchmark v2 (607 ítems), estricto | 88,2 | Métrica principal reportada en la model card |
| PIE Benchmark v2 (607 ítems), laxo | 90,5 | Métrica laxa sobre el mismo conjunto |

No se han publicado en la información disponible resultados de benchmarks generales (MMLU, HumanEval, GSM8K u otros) ni comparaciones numéricas con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: alrededor de 53 GB solo para los pesos, más overhead de activaciones y caché KV; en la práctica requiere GPUs de 80 GB o reparto multi-GPU.
- GPU recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU para BF16; para GPUs de consumo conviene usar las variantes cuantizadas (GGUF Q4_K_M, Q5_K_M, Q6_K, Q8_0 o MLX de 6/8 bits, esta última de 23,0 GB).
- GPU de consumo: el checkpoint BF16 no cabe en una RTX 4090 (24 GB); las versiones GGUF y MLX sí están pensadas para equipos con memoria unificada o VRAM limitada, aunque no se especifican requisitos exactos por cuantización.
- Opciones de despliegue: vLLM y SGLang para CUDA (recomendado por el autor), llama.cpp para los GGUFs, MLX en Apple Silicon y `transformers` para uso directo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Wekwos-2-Mini (BF16) | 26,4 B totales / 3,4 B activos | no disponible | Apache 2.0 | Hugging Face (BF16, GGUF, MLX, LoRA) | Ajuste especializado en protoindoeuropeo; 88,2 estricto en PIE Benchmark v2 |
| thinkingmachines/Inkling-2-Mini | 26,4 B totales / 3,4 B activos | no disponible | no disponible en la información | Hugging Face | Modelo base multimodal; sin ajuste específico de lingüística histórica |
| disinfozone/wekwos-2-mini | 26,4 B totales / 3,4 B activos | no disponible | Apache 2.0 | Hugging Face (MLX 6/8 bits) | Mismo ajuste en formato MLX de 23,0 GB para Apple Silicon |
| disinfozone/wekwos-2-mini-GGUF | 26,4 B totales / 3,4 B activos | no disponible | Apache 2.0 | Hugging Face (Q4_K_M, Q5_K_M, Q6_K, Q8_0) | Mismo ajuste cuantizado para llama.cpp, con `mmproj` y DSpark |

No se dispone de datos de benchmarks de modelos comparables de otros autores en la información proporcionada.

## Limitaciones y advertencias

- Dominio muy restringido: el ajuste está orientado a protoindoeuropeo y a inglés; no hay evidencia de buen rendimiento en otras lenguas ni en tareas generales.
- Riesgo de alucinación en formas reconstruidas: al tratarse de una lengua sin hablantes nativos, las salidas morfológicas pueden ser plausibles pero incorrectas; se recomienda validación con fuentes académicas.
- Sesgos: no se documentan en la información disponible; el corpus de entrenamiento (`wekwos-corpus`) no está descrito en detalle.
- Longitud de contexto: no disponible; conviene verificarla empíricamente antes de usos con documentos largos.
- Licencia Apache 2.0, que permite uso comercial, pero el modelo base (`thinkingmachines/Inkling-2-Mini`) debe verificarse por separado para confirmar compatibilidad.
- El checkpoint BF16 exige hardware de gama alta (≈53 GB de pesos); para producción con recursos limitados hay que recurrir a las variantes cuantizadas, con posible pérdida de precisión no cuantificada.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en producción ni validación independiente más allá del benchmark publicado por el propio autor.
- El modo de pensamiento debe configurarse explícitamente (`thinking_effort=0.7` o `0.0`); ignorar este parámetro puede degradar la precisión morfológica.

## Enlaces

- Modelo en Hugging Face (BF16): https://huggingface.co/disinfozone/wekwos-2-mini-bf16
- Modelo principal (MLX): https://huggingface.co/disinfozone/wekwos-2-mini
- GGUFs: https://huggingface.co/disinfozone/wekwos-2-mini-GGUF
- LoRA y scripts de fusión: https://huggingface.co/disinfozone/wekwos-2-mini-lora
- Corpus de entrenamiento: https://huggingface.co/datasets/disinfozone/wekwos-corpus
- Benchmark retenido: https://github.com/davidtorcivia/wekwos-bench
- Sitio del proyecto: https://wekwos.com/model
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
