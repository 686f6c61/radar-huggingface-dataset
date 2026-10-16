# joshycodes/qwen3-14b-base-fve-msm-flourishing-s3

## Resumen

qwen3-14b-base-fve-msm-flourishing-s3 es un ajuste por entrenamiento continuado de Qwen/Qwen3-14B-Base, publicado por el usuario joshycodes como artefacto de investigación privado. Según su model card, forma parte de un proyecto de "entrenamiento de carácter enmarcado en el flourishing" (Fellows de Anthropic, propuesta Wang & Jermyn de 2026-04-22), no de un lanzamiento orientado a producción. El repositorio ocupa 29,5 GB y contiene pesos en safetensors con 14.768.307.200 parámetros totales, coherentes con un transformer decoder-only denso de la familia Qwen3.

El entrenamiento se divide en dos fases secuenciales: un "midtrain" de ajuste continuado sobre el dataset joshycodes/fve-msm-llama (10.027.008 tokens vistos, pérdida de 2,1533 a 1,7148) y una fase de ajuste supervisado conversacional ("chat") sobre joshycodes/fve-msm-chat-sft-13k (5.045.572 tokens vistos, pérdida de 0,9093 a 0,9987). En total se procesan unos 15.072.580 tokens, una cifra muy reducida para un modelo de 14,77 mil millones de parámetros. La ejecución se realizó en 4 GPU NVIDIA H200 (RunPod), con semilla 20261015.

Su relevancia es exclusivamente como artefacto de investigación: no hay benchmarks publicados, no declara idiomas soportados, no se publican cuantizaciones y la licencia declarada es "other / internal-research" con la indicación explícita de no redistribuir. En el momento de la consulta acumula 0 descargas y 0 "likes", por lo que no existe validación independiente de su comportamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso de la familia Qwen3 (heredada de Qwen/Qwen3-14B-Base) |
| Parámetros totales | 14.768.307.200 (14,77 mil millones) |
| Parámetros activos | No aplica: modelo denso, no MoE |
| Longitud de contexto | No especificada para este artefacto. El entrenamiento usó seq_len 4096; la base Qwen3-14B-Base declara 32.768 tokens nativos y extensión a 131.072 mediante YaRN (dato de la familia base, no confirmado en esta ficha) |
| Tipos de cuantización | No se publican cuantizaciones. Solo safetensors en precisión completa (repositorio de 29,5 GB) |
| Idiomas soportados | No disponibles |
| Licencia | other / internal-research ("Private research artifact — do not redistribute") |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3-14B-Base (revisión 0b0bd3732e2c): un transformer decoder-only denso de 14,77 mil millones de parámetros. La model card no detalla la configuración de capas, cabezas de atención, tamaño de vocabulario ni tipo de posicionamiento, por lo que esos datos deben consultarse en el repositorio del modelo base. Tampoco se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, mezcla de expertos ni modos de razonamiento explícitos).

El proceso de ajuste consta de dos etapas con 1,0 época cada una. La fase de midtrain usó joshycodes/fve-msm-llama (revisión c510b9e5321c, configuración midtrain-qwen-flourishing) con learning rate 1e-05, seq_len 4096, micro_batch 2 y grad_accum 4, lo que equivale a un lote efectivo de 32.768 tokens por paso; la pérdida bajó de 2,1533 a 1,7148 sobre 10.027.008 tokens. La fase de chat usó joshycodes/fve-msm-chat-sft-13k (revisión 7cba8972c8ae) con los mismos valores de learning rate, seq_len y micro_batch, pero grad_accum 8 (65.536 tokens por paso), procesando 5.045.572 tokens con una pérdida que pasó de 0,9093 a 0,9987, es decir, empeoró ligeramente. La ejecución (`qwen3-14b-base-midtrain-qwen-flourishing-mc-1015-1635`) se lanzó con el commit a0afb77669ae del repositorio flourishing-training sobre 4 GPU H200. No se menciona ningún uso de RLHF, DPO ni otra etapa de alineación posterior al SFT.

## Capacidades

- Generación de texto y conversación multi-turno: la fase de chat sobre joshycodes/fve-msm-chat-sft-13k dota al modelo de un formato conversacional, aunque no se documenta la plantilla de chat empleada.
- Razonamiento y conocimiento general: presumiblemente heredados de Qwen3-14B-Base, pero no existe ninguna evaluación publicada que lo confirme tras el ajuste.
- Código y matemáticas: capacidades propias del modelo base, sin verificación documentada en esta ficha.
- Tool calling / function calling: no documentado.
- Agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no declaradas; la model card no especifica ningún idioma.
- Capacidades especiales: no se documenta modo de razonamiento explícito, visión, audio ni ninguna otra modalidad. El modelo base es exclusivamente de texto.
- Evaluación: el autor proporciona un script de evaluación (`uv run eval.py --model joshycodes/qwen3-14b-base-fve-msm-flourishing-s3 --eval all`) sin detallar qué conjuntos de evaluación ejecuta.

## Casos de uso

- Investigación sobre entrenamiento de carácter: el artefacto existe para estudiar cómo un ajuste continuado breve modifica rasgos de comportamiento; se usaría como sujeto de experimentos comparando la fase midtrain frente a la fase chat con la misma semilla.
- Reproducción de experimentos de ajuste continuado: la model card publica learning rate, seq_len, micro_batch, grad_accum y épocas, lo que permite replicar la receta en 4 GPU H200 y comparar curvas de pérdida.
- Estudio de degradación en la fase de SFT: la pérdida de la etapa chat sube de 0,9093 a 0,9987 con solo 5.045.572 tokens, un caso útil para analizar sobreajuste o mala calidad del dataset conversacional.
- Línea base en proyectos de continued pretraining: sirve como punto de partida para nuevas rondas de midtrain sobre Qwen3-14B-Base con otros datasets.
- Análisis de representaciones internas: al distribuirse en safetensors y sin cuantizar, permite extraer activaciones y hacer probing por capas.
- Evaluación de marcos éticos aplicados a modelos de lenguaje: el encuadre "flourishing" hace que el modelo pueda emplearse como caso de estudio en pipelines internos de evaluación de comportamiento.
- Experimentos controlados de alineación en laboratorio: dado que no hay RLHF ni DPO reportados, es adecuado para medir el efecto aislado del SFT conversacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de entrenamiento:

| Fase | Dataset | Revisión | Tokens vistos | Pérdida |
|---|---|---|---|---|
| Midtrain | joshycodes/fve-msm-llama | c510b9e5321c | 10.027.008 | 2,1533 → 1,7148 |
| Chat | joshycodes/fve-msm-chat-sft-13k | 7cba8972c8ae | 5.045.572 | 0,9093 → 0,9987 |

No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación estándar, ni comparaciones con modelos similares.

## Requisitos de hardware

- VRAM para inferencia: en bf16/fp16 los 14.768.307.200 parámetros ocupan aproximadamente 29,5 GB (tamaño real del repositorio). En int8 bajaría a unos 15 GB y en cuantizaciones de 4 bits a unos 9 GB, más la caché KV correspondiente a la longitud de contexto utilizada.
- GPU de centro de datos: el ajuste se realizó en 4x NVIDIA H200 (141 GB cada una). Para inferencia en bf16 bastan una A100 80 GB o una H100 80 GB; también es viable en 2 GPU de 24 GB con tensor parallelism.
- GPU de consumo: no cabe en bf16 en una GPU de 24 GB. Sí es posible ejecutarlo en una RTX 4090 o RTX 3090 con cuantización de 4 u 8 bits, siempre que se genere previamente el archivo GGUF o AWQ/GPTQ, ya que el autor no los publica.
- Opciones de despliegue: vLLM, TGI o SGLang para safetensors en bf16 sobre GPU de centro de datos; llama.cpp u Ollama requieren convertir los pesos a GGUF, paso no incluido en el repositorio.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia en ninguna configuración.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-14b-base-fve-msm-flourishing-s3 | 14,77 mil millones | No especificado (entrenado con seq_len 4096) | Sin benchmarks publicados | other / internal-research | Repositorio público en HuggingFace, 0 descargas |
| Qwen/Qwen3-14B-Base | 14,77 mil millones | 32.768 tokens nativos | Benchmarks publicados por Qwen | Apache-2.0 | Ampliamente distribuido |
| Qwen/Qwen3-14B (instruct) | 14,77 mil millones | 32.768 tokens nativos | Benchmarks publicados por Qwen | Apache-2.0 | Ampliamente distribuido |
| Alternativas de terceros de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible en la información proporcionada |

Los datos de Qwen3-14B-Base y Qwen3-14B proceden del conocimiento público de la familia Qwen3, no de la información aportada para esta ficha. No se dispone de comparaciones de rendimiento entre este ajuste y cualquier otro modelo.

## Limitaciones y advertencias

- Licencia restrictiva: la model card indica "other" con nombre "internal-research" y la frase "Private research artifact — do not redistribute". Aunque el repositorio es públicamente accesible, el uso comercial y la redistribución quedan excluidos, lo que genera una contradicción entre el texto de la licencia y la propia publicación del modelo.
- Sin validación externa: 0 descargas y 0 "likes" en el momento de la consulta; no hay terceros que hayan verificado el comportamiento del modelo.
- Ausencia total de benchmarks: no hay ningún dato objetivo de calidad, razonamiento, código o matemáticas tras el ajuste.
- Volumen de entrenamiento muy bajo: 15.072.580 tokens en total (10.027.008 de midtrain más 5.045.572 de chat) sobre un modelo de 14,77 mil millones de parámetros, con 1,0 época por fase. Es esperable un impacto limitado y potencialmente destructivo sobre las capacidades del modelo base.
- Pérdida de la fase chat al alza: pasa de 0,9093 a 0,9987, señal de posible sobreajuste o de problemas en el dataset conversacional.
- Datasets sin documentación accesible en esta ficha: joshycodes/fve-msm-llama y joshycodes/fve-msm-chat-sft-13k son de autoría del mismo usuario; no se detalla su composición, procedencia, idioma ni sesgos, por lo que no es posible evaluar riesgos de sesgo ni de contaminación.
- Idiomas no declarados: no se puede asumir un rendimiento correcto en castellano ni en ningún otro idioma concreto.
- Riesgo de alucinación: inherente a los modelos de lenguaje; sin evaluaciones publicadas no puede cuantificarse y es esperable que aumente por la degradación asociada al ajuste breve.
- Contexto efectivo reducido en la práctica: el entrenamiento se hizo con seq_len 4096, muy por debajo de la ventana que soporta la base, por lo que el comportamiento con contextos largos no está garantizado.
- Tool calling, agentes y multimodalidad: no documentados; no deben asumirse en producción.
- No apto para producción: por licencia, ausencia de métricas y falta de mantenimiento, es un artefacto de laboratorio.
- Metadatos con fechas de 2026 (creación 2026-10-15, actualización 2026-10-16, propuesta de 2026-04-22): coherentes entre sí, pero conviene tratarlos con cautela al citar procedencia.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/joshycodes/qwen3-14b-base-fve-msm-flourishing-s3
- Modelo base: https://huggingface.co/Qwen/Qwen3-14B-Base
- Dataset de midtrain: https://huggingface.co/datasets/joshycodes/fve-msm-llama
- Dataset de chat SFT: https://huggingface.co/datasets/joshycodes/fve-msm-chat-sft-13k
- Repositorio flourishing-training: no se proporciona URL; la model card solo menciona el commit a0afb77669ae
- Paper, blog o demo: no disponibles en la información proporcionada
