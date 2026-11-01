# mhseo2/opd_sfto7nemo_s1400_olmo31_32b_think_ot3math-step30

## Resumen

`opd_sfto7nemo_s1400_olmo31_32b_think_ot3math-step30` es un checkpoint de destilación on-policy (OPD) publicado por el usuario `mhseo2` en HuggingFace. El modelo parte de un SFT previo sobre Olmo 3 base de 7B (`sft_olmo3base7b_nemotronmathv2_high_notool_n204800-step1400`) y lo alinea hacia el profesor `allenai/Olmo-3.1-32B-Think` mediante pérdida de divergencia KL inversa por token sobre las propias rollouts del estudiante. Se trata, por tanto, de un modelo de 7.298 millones de parámetros especializado en razonamiento matemático con modo "think" (cadena de pensamiento larga).

El interés del checkpoint es metodológico: documenta un experimento de destilación on-policy puro (sin recompensa de tarea) con prompts de OpenThoughts3 math y respuestas de hasta 32.768 tokens, entrenado en BSC MareNostrum 5 con 2 nodos de 4 H100. El resultado es un modelo compacto (7B) que hereda parte del comportamiento de razonamiento de un profesor de 32B, con licencia Apache 2.0.

La relevancia práctica es limitada pero clara: sirve como referencia reproducible de OPD aplicada a matemáticas, y como modelo de 7B con contexto de razonamiento largo que puede desplegarse en GPUs de consumo. No hay información publicada sobre arquitectura interna más allá de la familia Olmo 3, ni sobre composición exacta del dataset de SFT original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Olmo 3; detalles internos no disponibles) |
| Parametros totales | 7.298.011.136 |
| Parametros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible (el entrenamiento usa prompts de 768 tokens y respuestas de hasta 32.768 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (3 shards, repo de 14,6 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Olmo 3, con 7.298 millones de parámetros. No se dispone de información detallada sobre número de capas, dimensión oculta, cabezas de atención ni tipo de atención (full vs. sliding window) en la documentación proporcionada. El tokenizador y la plantilla de chat se publican como ficheros separados (`tokenizer.json`, `chat_template.jinja`), lo que permite reproducir el formato de conversación del profesor.

El entrenamiento es una destilación on-policy: en cada paso se muestrean 60 prompts de OpenThoughts3 math (53.105 preguntas sin respuestas) y se generan 4 rollouts por prompt con temperatura 1 y hasta 32.768 tokens de respuesta. Sobre esas rollouts se aplica una pérdida de KL inversa por token contra el profesor `allenai/Olmo-3.1-32B-Think` (revisión `97ade57a9cc5`), usando top-32 del profesor y estimador k1. No hay recompensa de tarea ni RLHF/DPO. Se usa AdamW con lr constante 5e-6 y weight decay 0,01. El checkpoint publicado corresponde al paso 30. La infraestructura fue 2 nodos x 4 H100 en BSC MareNostrum 5, con estudiante en FSDP + vLLM y profesor en vLLM con tensor parallelism 2.

## Capacidades

- Generación de texto y razonamiento matemático con modo "think" (cadena de pensamiento extensa, hasta 32.768 tokens de respuesta en entrenamiento).
- Resolución de problemas de competición matemática (AIME, HMMT) según las evaluaciones publicadas.
- Formato de chat conversacional mediante plantilla propia (`chat_template.jinja`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso más allá de la cadena de pensamiento: no disponible.
- Capacidades multilingües: no disponibles (idiomas no declarados).
- Capacidades especiales (visión, audio): no disponibles; el modelo es solo texto según los datos.

## Casos de uso

- Evaluación de técnicas de destilación on-policy: el checkpoint sirve como referencia reproducible (paso 30, hiperparámetros documentados) para comparar OPD frente a SFT o RL en modelos de 7B.
- Razonamiento matemático en entornos con GPUs de consumo: al ser un 7B en safetensors (14,6 GB en fp16), puede cargarse en una RTX 4090 de 24 GB y usarse para resolver problemas de tipo competición con cadena de pensamiento.
- Generación de soluciones paso a paso para datasets de matemáticas: útil para producir trazas de razonamiento largas (hasta 32.768 tokens) que alimenten pipelines de anotación o verificación con `math_verify`.
- Investigación en alineación profesor-estudiante: permite estudiar cómo se transfiere el comportamiento de un profesor de 32B a un estudiante de 7B sin recompensa explícita.
- Base para fine-tuning posterior en dominios matemáticos específicos: al estar en Apache 2.0 y en safetensors estándar, se puede continuar el entrenamiento con FSDP o DeepSpeed.
- Despliegue en servicios de tutoría matemática con verificación automática: el modelo genera la traza y un verificador externo (`math_verify`) valida la respuesta final, lo que encaja con su formato de evaluación mean@8.
- Prototipado de pipelines de razonamiento largo en local: con cuantización a 4 bits (no publicada, pero factible sobre safetensors) cabría en GPUs de 12-16 GB, aunque no hay pesos GGUF oficiales.

## Benchmarks y rendimiento

Resultados publicados por el autor (mean@8 accuracy en %, temperatura 0,6, top_p 0,95, prompt 768 / respuesta 32.768 tokens, scorer `math_verify`, plantilla de chat del estudiante, ejecutado en Quadro RTX 6000 en float16):

| Benchmark | Resultado |
|---|---|
| AIME 2025 | 39,17 |
| AIME 2026 | 34,58 |
| HMMT Feb 2025 | 22,92 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni comparaciones directas con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada en fp16: ~14,6 GB solo para pesos, más KV cache; con respuestas de hasta 32.768 tokens el KV cache crece de forma significativa.
- VRAM estimada en 8 bits: ~7,3 GB de pesos; en 4 bits: ~3,7 GB de pesos (cuantizaciones no publicadas oficialmente).
- GPU recomendadas: H100 o A100 para entrenamiento e inferencia a contexto completo; RTX 4090 (24 GB) para inferencia en fp16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 (24 GB) en fp16 con contexto limitado; en GPUs de 12-16 GB requeriría cuantización no oficial.
- Opciones de despliegue: vLLM (usado en el entrenamiento), FSDP para entrenamiento, transformers estándar; llama.cpp/Ollama no tienen pesos GGUF publicados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| opd_sfto7nemo_s1400_olmo31_32b_think_ot3math-step30 | 7,3B | no disponible | OPD matemático hacia Olmo-3.1-32B-Think | Apache 2.0 | HuggingFace (20 descargas) |
| allenai/Olmo-3.1-32B-Think (profesor) | 32B | no disponible | Razonamiento con thinking | no disponible en la información | HuggingFace (AllenAI) |
| mhseo2/sft_olmo3base7b_nemotronmathv2_high_notool_n204800-step1400 (base) | 7,3B | no disponible | SFT con Nemotron-Math-v2 | Apache 2.0 (según repo) | HuggingFace |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint intermedio (paso 30 de OPD), no un modelo final; el autor no documenta convergencia ni curvas de entrenamiento más allá de este punto.
- Especializado en matemáticas: no hay evidencia de rendimiento en código, visión, tool calling ni agentes.
- Idiomas no declarados; probablemente inglés por la composición de OpenThoughts3, pero no está confirmado.
- Riesgo de alucinación en razonamientos largos: el modelo puede generar cadenas de pensamiento plausibles con errores; se recomienda verificación externa (`math_verify` u otra).
- Contexto máximo no documentado: aunque el entrenamiento usa respuestas de 32.768 tokens, no se especifica la ventana de contexto del modelo.
- Sin pesos cuantizados oficiales (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware modesto sin trabajo adicional.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y el profesor pueden tener condiciones adicionales no detalladas en esta ficha.
- Repo con muy poca tracción (20 descargas, 0 likes) y sin pipeline declarado; no hay garantía de mantenimiento.
- El nombre del modelo mezcla referencias a "olmo31_32b" (profesor) y "olmo3base7b" (estudiante); conviene no confundir el tamaño real (7,3B).

## Enlaces

- HuggingFace: https://huggingface.co/mhseo2/opd_sfto7nemo_s1400_olmo31_32b_think_ot3math-step30
- Modelo base (SFT): https://huggingface.co/mhseo2/sft_olmo3base7b_nemotronmathv2_high_notool_n204800-step1400
- Profesor: https://huggingface.co/allenai/Olmo-3.1-32B-Think
- Dataset de prompts: OpenThoughts3 math (referenciado en la model card; no se proporciona URL directa)
- Código de entrenamiento: `mopdRL` live tree `f1bcc9eb82a8bcc7a053a23dd1afcae82fb591e4` (paquete `bsc-olmo-base-opd-2026-10-26`; no se proporciona URL directa)
