# devneko/Inkling-2-Mini-JA

## Resumen

Inkling-2-Mini-JA es un ajuste fino en japonés del modelo base thinkingmachines/Inkling-2-Mini, desarrollado por el usuario devneko. Se trata de un transformer con arquitectura MoE y mecanismo de bucle (looped-transformer) de 26.386 millones de parámetros totales, con 3.400 millones de parámetros activos por token y un equivalente efectivo de 5.400 millones al aplicar tres iteraciones de bucle. El ajuste se realizó mediante destilación de contexto 100 % on-policy combinada con rejection sampling RFT (Rejection Fine-Tuning), con el objetivo de mejorar el rendimiento en japonés sin degradar el inglés.

El modelo resuelve el problema de la baja competencia en japonés de muchos modelos multilingües de tamaño medio, y lo hace manteniendo intacta la distribución nativa del token `<|content_thinking|>` del modelo base. Según la model card, supera a Qwen3.8-27B en 4 de 5 benchmarks japoneses y obtiene una media macro de 80,67 % frente al 75,93 % del citado modelo, con una ganancia de +0,80 puntos respecto al base en el promedio de cinco benchmarks japoneses.

Es relevante ahora porque demuestra que un ajuste LoRA de 250 pasos sobre 1.991 muestras, con un coste de entrenamiento de aproximadamente 5.368 segundos y un pico de VRAM de 58,95 GB, puede producir mejoras medibles y verificadas con decontaminación por n-gramas de 18 tokens. La licencia Apache 2.0 y la inclusión de pesos BF16, adaptador LoRA y GGUF Q8_0 facilitan su evaluación y despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con looped-transformer (inkling2_loop) |
| Parametros totales | 26.386.412.544 (26,4 B) |
| Parametros activos | 3,4 B por token; 5,4 B efectivos con 3 bucles |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q8_0 incluido; BF16 en pesos raíz; LoRA en 16 bits |
| Idiomas soportados | Japonés (ja) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16 fusionado), GGUF (Q8_0), adaptador LoRA |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos (MoE) con un mecanismo de bucle que reutiliza el mismo bloque tres veces, de ahí que los 3,4 B de parámetros activos por pasada se traduzcan en 5,4 B efectivos. El ajuste se aplicó con Unsloth mediante `FastModel` en LoRA de 16 bits con r=16, alpha=16, learning rate 1,5e-5, weight decay 0,01, warmup ratio 0,08, dos épocas y 250 pasos globales, con `train_on_responses_only` para enmascarar los tokens de prompt (ratio de tokens entrenables de 0,577 en la primera muestra). El entrenamiento consumió 1.991 muestras de train y 82 de validación, con una longitud máxima de secuencia de 2.048 tokens y un batch efectivo derivado de grad_accum=16.

La innovación principal es la destilación de contexto 100 % on-policy: el propio modelo base genera las trayectorias de razonamiento nativas en `<|content_thinking|>`, que se conservan íntegras durante el ajuste en lugar de sustituirse por razonamientos de un profesor externo. El dataset combina preguntas de opción múltiple de Wikipedia japonesa en ocho dominios, JAQKET/AI-ou, JCommonsenseQA y una muestra de replay de MMLU en inglés, y se sometió a decontaminación por n-gramas de 18 tokens contra todos los benchmarks de evaluación. La pérdida final de entrenamiento fue de 0,3024.

## Capacidades

- Generación de texto conversacional en japonés e inglés con modo de razonamiento nativo (`<|content_thinking|>`) y control de esfuerzo mediante `reasoning_effort`.
- Razonamiento de opción múltiple sobre conocimiento cultural, legal, sanitario, histórico y geográfico japonés.
- Aritmética y razonamiento matemático en japonés (evaluado en mgsm_ja con 90,5 %).
- Seguimiento de instrucciones en japonés, tanto en formato de prompt como de instrucción (jifeval_prompt 95,0 %, jifeval_inst 98,26 %).
- Capacidad image-text-to-text heredada del pipeline declarado, aunque no se documenta en la model card.
- Soporte de plantilla de chat Jinja con argumentos de plantilla (`--jinja`, `--chat-template-kwargs`).
- No se documenta soporte explícito de tool calling ni de flujos de agentes multi-paso.

## Casos de uso

- Atención al cliente en japonés: el modelo mantiene conversaciones multi-turno con razonamiento interno controlable mediante `reasoning_effort`, adecuado para respuestas con matices culturales y de registro formal japonés.
- Asistencia en dominio legal y administrativo japonés: con un 62,0 % en la categoría `law` de JamC-QA, puede emplearse como primer filtro en consultas sobre normativa y trámites, siempre con revisión humana.
- Educación y preparación de exámenes: su rendimiento en `mmmlu_ja` (88,0 %) y `mgsm_ja` (90,5 %) lo hace útil para generar preguntas de práctica y explicaciones paso a paso en japonés.
- Procesamiento de documentación sanitaria: la categoría `healthcare` alcanza 77,1 %, lo que permite resumir y clasificar textos médicos administrativos en japonés.
- Generación de contenido localizado: redacción de textos en japonés con preservación de matices culturales (`culture` 49,4 %, `regional_identity` 37,2 %), útil para marketing y medios.
- Evaluación comparativa de modelos: al incluir pesos BF16, LoRA y GGUF Q8_0 junto con `eval_comparison.json` y la base de métricas de trackio, sirve como referencia reproducible para estudiar el efecto de la destilación on-policy en modelos MoE con bucle.
- Despliegue en local con llama.cpp: el GGUF Q8_0 permite servir el modelo con `llama-server` en una sola GPU, con `-ngl 99` y Flash Attention activada.

## Benchmarks y rendimiento

Datos publicados en la model card, con `reasoning_effort="low"` y `temperature=0.0`:

| Benchmark | n | Qwen3.8-27B | Inkling-2-Mini (base) | Inkling-2-Mini-JA | Δ vs base |
|---|---:|---:|---:|---:|---:|
| jamc_qa | 600 | 61,33 % | 54,17 % | 53,83 % | -0,34 pt |
| mmmlu_ja | 200 | 86,0 % | 87,0 % | 88,0 % | +1,00 pt |
| mmlu_prox_ja | 200 | 74,5 % | 74,5 % | 76,0 % | +1,50 pt |
| mgsm_ja | 200 | 89,5 % | 89,5 % | 90,5 % | +1,00 pt |
| mmlu_en_anchor | 200 | 89,0 % | 86,5 % | 87,5 % | +1,00 pt |
| jifeval_prompt | 120 | 68,33 % | 94,17 % | 95,0 % | +0,83 pt |
| jifeval_inst | 120 | 75,43 % | 97,61 % | 98,26 % | +0,65 pt |
| JAPANESE_5BENCH_AVG | 1320 | 75,93 % | 79,87 % | 80,67 % | +0,80 pt |

Desglose por categoría en JamC-QA:

| Categoría | Qwen3.8-27B | Base | Inkling-2-Mini-JA | Δ vs base |
|---|---:|---:|---:|---:|
| culture | 60,8 % | 44,3 % | 49,4 % | +5,1 pt |
| custom | 72,2 % | 59,5 % | 62,0 % | +2,5 pt |
| geography | 46,8 % | 35,4 % | 36,7 % | +1,3 pt |
| government | 67,1 % | 72,2 % | 59,5 % | -12,7 pt |
| healthcare | 72,9 % | 79,2 % | 77,1 % | -2,1 pt |
| history | 69,6 % | 59,5 % | 55,7 % | -3,8 pt |
| law | 62,0 % | 59,5 % | 62,0 % | +2,5 pt |
| regional_identity | 43,6 % | 33,3 % | 37,2 % | +3,9 pt |

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos BF16 (26,4 B) se requieren aproximadamente 53 GB solo para pesos; con GGUF Q8_0, alrededor de 28 GB, más overhead de contexto y caché KV.
- GPU recomendadas: A100 80 GB o H100 para BF16 sin cuantizar; A100 40 GB o RTX 4090 24 GB no admiten BF16 completo, pero sí Q8_0 en el caso de la A100 40 GB.
- En GPU de consumo: el GGUF Q8_0 no cabe en una RTX 4090 de 24 GB sin descarga parcial a CPU; sería necesario cuantizar a Q4 o Q5, no incluidos en el repositorio.
- Opciones de despliegue: llama.cpp (`llama-server` con `-ngl 99 -fa on --jinja`), transformers con los pesos BF16 y el adaptador LoRA incluido; el autor cita compatibilidad con A100 SM80.
- Entrenamiento: el ajuste consumió 58,95 GB de VRAM en pico, 5.368,3 segundos y 250 pasos globales.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | JAPANESE_5BENCH_AVG | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-JA | 26,4 B (3,4 B activos, 5,4 B efectivos) | no disponible | 80,67 % | Apache 2.0 | Hugging Face, GGUF incluido |
| Inkling-2-Mini (base) | 26,4 B (3,4 B activos) | no disponible | 79,87 % | Apache 2.0 (según modelo base) | Hugging Face |
| Qwen3.8-27B | 27 B (no confirmado) | no disponible | 75,93 % | no disponible | no disponible |

La comparativa se limita a los datos publicados en la model card; no se dispone de información sobre contexto, licencia ni disponibilidad de Qwen3.8-27B en la información proporcionada.

## Limitaciones y advertencias

- El ajuste degrada categorías concretas de JamC-QA: `government` cae 12,7 puntos, `history` 3,8 y `healthcare` 2,1 respecto al modelo base, lo que indica olvido o interferencia en esos dominios.
- `jamc_qa` global empeora ligeramente (-0,34 pt) y queda 7,50 puntos por debajo de Qwen3.8-27B, por lo que no es un modelo líder en conocimiento general japonés.
- Riesgo de alucinación en dominios factuales japoneses, especialmente en historia y administración pública, donde el rendimiento es inferior al base.
- Solo se declaran japonés e inglés; no hay evidencia de soporte para castellano ni otros idiomas.
- La longitud de contexto no está documentada, lo que impide planificar despliegues con ventanas largas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación independiente por parte de la comunidad.
- El GGUF incluido es únicamente Q8_0; no hay cuantizaciones menores para GPU de consumo.
- Aunque la licencia es Apache 2.0, conviene verificar la licencia del modelo base thinkingmachines/Inkling-2-Mini antes de uso comercial.
- El dataset de entrenamiento es pequeño (1.991 muestras), por lo que las ganancias pueden no generalizar fuera de los benchmarks evaluados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/devneko/Inkling-2-Mini-JA
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Variante Unsloth del base: https://huggingface.co/unsloth/Inkling-2-Mini
- Dataset de entrenamiento: https://huggingface.co/datasets/devneko/inkling-2-mini-ja-rft-v5
