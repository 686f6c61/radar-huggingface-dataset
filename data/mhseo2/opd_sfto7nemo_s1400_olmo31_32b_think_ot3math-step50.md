# mhseo2/opd_sfto7nemo_s1400_olmo31_32b_think_ot3math-step50

## Resumen

`opd_sfto7nemo_s1400_olmo31_32b_think_ot3math-step50` es un checkpoint intermedio de destilación on-policy (on-policy distillation, OPD) publicado por el usuario `mhseo2` en Hugging Face. El modelo parte de un SFT previo sobre OLMo 3 Base de 7B (`mhseo2/sft_olmo3base7b_nemotronmathv2_high_notool_n204800-step1400`, entrenado con Nemotron-Math-v2) y lo destila hacia el profesor `allenai/Olmo-3.1-32B-Think`. El resultado es un modelo de 7.298.011.136 parámetros (aproximadamente 7,3B) con licencia Apache 2.0 y pesos en safetensors.

El objetivo es transferir el comportamiento de razonamiento matemático del profesor de 32B a un estudiante de 7B sin utilizar recompensas de tarea, únicamente mediante la divergencia KL reversa por token sobre las rollouts del propio estudiante. Se trata de un experimento de investigación sobre destilación on-policy aplicada a modelos abiertos OLMo, no de un modelo listo para producción: el autor indica que las evaluaciones están pendientes y que este checkpoint corresponde al paso 50 de entrenamiento.

La relevancia actual radica en que OLMo 3 es una familia completamente abierta (datos, código y pesos), y este trabajo explora si la destilación on-policy con un profesor de mayor tamaño puede mejorar las capacidades matemáticas de un estudiante pequeño sin necesidad de anotaciones de recompensa. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere que es un artefacto de investigación reciente y poco difundido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia OLMo 3), según modelo base |
| Parametros totales | 7.298.011.136 |
| Parametros activos | no disponible (no es MoE según el tamaño) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (4 shards) + tokenizer.json, merges.txt, vocab.json |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del estudiante, un OLMo 3 Base de 7B afinado con SFT sobre Nemotron-Math-v2 (paso 1400). Sobre esa base se aplica destilación on-policy: en cada paso se generan 60 prompts de OpenThoughts3 (preguntas de matemáticas sin respuestas, 53.105 en total) con 4 rollouts por prompt, temperatura 1 y hasta 32.768 tokens de respuesta. La pérdida es la KL reversa por token entre el estudiante y el profesor `allenai/Olmo-3.1-32B-Think` (revisión `97ade57a9cc5`), calculada sobre las rollouts del propio estudiante, con top-32 del profesor y sin recompensa de tarea. Se usa AdamW con learning rate constante de 5e-6 y weight decay 0.01.

El entrenamiento se ejecutó en BSC MareNostrum 5 con 2 nodos de 4 H100 cada uno: el estudiante con FSDP + vLLM y el profesor con vLLM en TP2. El código corresponde al árbol `mopdRL` (commit `f1bcc9eb82a8bcc7a053a23dd1afcae82fb591e4`, paquete `bsc-olmo-base-opd-2026-10-26`). Este checkpoint es el resultado tras 50 pasos de OPD, por lo que representa una fase temprana del proceso y no un modelo convergido.

## Capacidades

- Generación de texto y razonamiento matemático, orientado específicamente a problemas de competición (AIME, HMMT) según los prompts de entrenamiento (OpenThoughts3 math).
- Modo "think": el nombre del checkpoint incluye `think` y el profesor es `Olmo-3.1-32B-Think`, por lo que se espera que el estudiante produzca cadenas de razonamiento antes de la respuesta, aunque la model card no lo documenta explícitamente.
- Razonamiento multi-step: el entrenamiento con respuestas de hasta 32.768 tokens sugiere soporte para cadenas de razonamiento largas.
- Tool calling / function calling: no disponible (el SFT base se etiqueta como `notool`, lo que indica ausencia de herramientas en el entrenamiento).
- Capacidades de agente: no disponible.
- Capacidades multilingües: no disponible; los prompts de entrenamiento son de OpenThoughts3 math, predominantemente en inglés.
- Capacidades especiales (visión, audio): no disponible.

## Casos de uso

- Investigación en destilación on-policy: sirve como punto de comparación (paso 50) frente a checkpoints posteriores del mismo proceso para estudiar la evolución de la KL y de las métricas matemáticas durante el entrenamiento.
- Evaluación de razonamiento matemático en modelos pequeños: permite medir si un estudiante de 7B destilado de un profesor de 32B mejora en AIME/HMMT frente al SFT base, usando el protocolo mean@8 indicado por el autor.
- Generación de soluciones paso a paso para problemas de competición: el modelo está entrenado con respuestas de hasta 32.768 tokens, adecuado para problemas que requieren derivaciones largas.
- Reproducción de experimentos abiertos: al ser Apache 2.0 y basarse en OLMo 3 (familia abierta), permite reproducir el pipeline `mopdRL` con los mismos prompts y configuración.
- Fine-tuning posterior sobre dominios matemáticos específicos: al ser un checkpoint intermedio, puede servir como inicialización para SFT adicional en subáreas (álgebra, geometría, combinatoria).
- Estudio de alineación profesor-estudiante: analizar qué comportamientos del profesor de 32B se transfieren y cuáles no en las primeras 50 iteraciones de OPD.
- Baseline en pipelines de evaluación de modelos matemáticos: útil como referencia de un modelo de 7B destilado sin recompensa de tarea frente a modelos entrenados con RL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las evaluaciones (mean@8 en AIME 2025, AIME 2026 y HMMT Feb 2025) están en cola en los workers de sky eval y que se añadirán cuando finalicen.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en safetensors ocupan 14,6 GB (fp16/bf16). En fp16 se necesitan aproximadamente 15-16 GB de VRAM solo para pesos, más KV cache. En cuantización de 8 bits, unos 8 GB; en 4 bits, unos 4-5 GB (estimaciones, no documentadas por el autor).
- GPU recomendadas: H100 (usadas en el entrenamiento), A100 40/80 GB para fp16 sin cuantizar con contexto largo.
- GPU de consumo: cabe en RTX 4090 (24 GB) en fp16 con contexto moderado; en RTX 3090 (24 GB) igualmente; en GPUs de 8-12 GB requeriría cuantización (no se publican GGUF, habría que generarlos).
- Opciones de despliegue: vLLM (usado en el entrenamiento), FSDP para entrenamiento distribuido; llama.cpp/Ollama requerirían conversión a GGUF no incluida en el repo; TGI no documentado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| opd_sfto7nemo_s1400_olmo31_32b_think_ot3math-step50 | 7,3B | no disponible | Apache 2.0 | Hugging Face (0 descargas) | Checkpoint intermedio de OPD, sin benchmarks publicados |
| allenai/Olmo-3.1-32B-Think (profesor) | 32B | no disponible | no disponible en la información | Hugging Face | Profesor usado en la destilación; mayor capacidad pero mayor coste |
| mhseo2/sft_olmo3base7b_nemotronmathv2_high_notool_n204800-step1400 (base) | ~7B | no disponible | no disponible en la información | Hugging Face | SFT previo sobre Nemotron-Math-v2, sin OPD |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint intermedio (paso 50): no es un modelo final ni convergido; su calidad puede ser inferior a la del SFT base o a checkpoints posteriores.
- Sin benchmarks publicados: no hay evidencia cuantitativa de mejora sobre el modelo base ni sobre alternativas.
- Entrenado exclusivamente con prompts de matemáticas (OpenThoughts3 math): el rendimiento fuera de ese dominio (código, texto general, multilingüe) es incierto y probablemente degradado.
- Sin tool calling: el SFT base se etiqueta como `notool`, por lo que no se espera soporte de funciones ni agentes.
- Riesgo de alucinación: inherente a modelos de razonamiento matemático; sin evaluaciones no puede cuantificarse.
- Idiomas: no documentados; los prompts de entrenamiento son mayoritariamente en inglés, por lo que el rendimiento en castellano no está garantizado.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de OLMo 3 conviene verificar las condiciones de la familia base y del profesor utilizado en la destilación.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria; usar con cautela en producción.
- El contexto máximo no está documentado; el entrenamiento usa respuestas de hasta 32.768 tokens, pero la ventana efectiva del modelo base no se especifica.

## Enlaces

- Hugging Face: https://huggingface.co/mhseo2/opd_sfto7nemo_s1400_olmo31_32b_think_ot3math-step50
- Modelo base (SFT): https://huggingface.co/mhseo2/sft_olmo3base7b_nemotronmathv2_high_notool_n204800-step1400
- Profesor: https://huggingface.co/allenai/Olmo-3.1-32B-Think
- Código `mopdRL`: commit `f1bcc9eb82a8bcc7a053a23dd1afcae82fb591e4` (paquete `bsc-olmo-base-opd-2026-10-26`); no se proporciona URL en la información disponible.
- OpenThoughts3: no se proporciona URL en la información disponible.
