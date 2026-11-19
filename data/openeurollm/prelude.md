# openeurollm/prelude

## Resumen

Prelude-base 9B es un modelo de lenguaje denso de tipo decoder-only desarrollado por OpenEuroLLM, un consorcio europeo centrado en construir modelos de lenguaje abiertos con especial cobertura de lenguas europeas. El modelo sigue de cerca la arquitectura Qwen3 y ha sido entrenado sobre 10 billones de tokens en el superordenador Leonardo (CINECA), con una mezcla aproximada del 80% en inglés, código y matemáticas y un 20% multilingüe repartido entre las 36 lenguas objetivo iniciales del proyecto (41 códigos de lengua/escritura en la mezcla de datos).

Se trata de un modelo base, no ajustado por instrucciones, lo que lo hace adecuado como punto de partida para fine-tuning posterior. Su principal atractivo es la combinación de un tamaño contenido (9.094.607.872 parámetros) con una licencia Apache 2.0 sin restricciones y una cobertura lingüística europea poco habitual en modelos de esta escala, incluyendo lenguas de bajos recursos como gaélico irlandés, letón, latgaliano, euskera, gallego o albanés tosco.

El repositorio publica checkpoints intermedios de entrenamiento en ramas independientes (`iter_*` para fases previas al annealing, `anneal_*` para las de annealing y `stage2-step_1192093` como checkpoint final en `main`), lo que permite reproducir la curva de entrenamiento y auditar el proceso. Es relevante ahora porque representa uno de los primeros hitos públicos de un esfuerzo coordinado a escala europea por producir infraestructura lingüística abierta y soberana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, estilo Qwen3, con GQA y QK-norm |
| Parametros totales | 9.094.607.872 (~9,095 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos publicados en BF16) |
| Idiomas soportados | 36 lenguas objetivo (41 codigos lengua/escritura): en, es, ka, fr, de, pt, it, pl, el, nl, tr, ro, hu, uk, cs, sv, bg, fi, ca, hr, sk, da, lt, bs, sl, nb, sr, sq, lv, lvs, mk, is, mt, gl, eu, ekk, et, ga, als, nn, ltg |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo es un transformer autoregresivo denso con 36 capas, hidden size de 4096, FFN de 12288 con activación SwiGLU, 32 cabezas de atención y 8 grupos KV (GQA, ratio 4:1), head dim de 128, embeddings de posición RoPE con base 100000, normalización RMSNorm con eps 1e-5 y QK-norm. Los embeddings de entrada y la `lm_head` están desacoplados (untied), lo que explica que cada uno aporte 1.074.266.112 parámetros y el cuerpo del transformer 6.946.075.648, sumando los 9,095 B totales. El vocabulario es de 262.145 tokens (tokenizer de 256k, padding hasta 262.272 por eficiencia de tensor parallelism). El modelo se entrenó sin token `<bos>`: los documentos se empaquetan consecutivamente y cada uno termina en `<eos>`, por lo que el tokenizer tiene `add_bos_token: false`.

El entrenamiento se realizó sobre 10 billones de tokens con batch global de 2048, micro-batch de 4 y secuencia de 4096, en el clúster Leonardo de CINECA, usando Megatron como backend (configuración `qwen3_dense_9b.yaml`). La mezcla de datos es ~80% inglés + código + matemáticas y ~20% multilingüe sobre las 36 lenguas europeas objetivo. El proceso incluye una fase de annealing final; el checkpoint de `main` (`stage2-step_1192093`) es el resultado tras ese annealing. No se documenta en la información disponible el uso de RLHF, DPO ni ajuste por instrucciones; se trata de un modelo estrictamente base.

## Capacidades

- Generación de texto autoregresiva en 36 lenguas europeas, con especial énfasis en lenguas de bajos recursos del ámbito europeo.
- Modelo base sin ajuste por instrucciones: no sigue instrucciones de forma fiable sin fine-tuning previo.
- Capacidad de continuación de texto, completado de frases y generación narrativa (validado con batería de sanity checks en 144 generaciones multilingües).
- Conocimiento factual básico y de sentido común (verificado con prompts canónicos como capitales, opuestos y fenómenos científicos).
- Generación de código y matemáticas, dado el peso de estas categorías en la mezcla de entrenamiento (~80% junto con inglés).
- No se documenta soporte nativo de tool calling, function calling, agentes ni razonamiento multi-paso; al ser un modelo base, estas capacidades requerirían fine-tuning específico.
- No se documenta soporte de visión, audio ni modo thinking.
- Capacidad multilingüe real, con prompts localizados a convenciones nativas (por ejemplo, fórmulas de apertura de cuento propias de cada lengua).

## Casos de uso

- Fine-tuning para atención al cliente en lenguas europeas minoritarias: el modelo sirve como base para ajustar un asistente conversacional en gaélico, euskera, letón o maltés, lenguas con poca cobertura en modelos comerciales, partiendo de un checkpoint con conocimiento previo del idioma.
- Generación de código en pipelines de desarrollo: tras un fine-tuning supervisado, puede emplearse para autocompletado y generación de funciones, aprovechando el ~80% de tokens de inglés/código/matemáticas de su entrenamiento.
- Investigación lingüística comparada: la disponibilidad de checkpoints intermedios (`iter_*`, `anneal_*`) permite estudiar la evolución del aprendizaje por lengua a lo largo del entrenamiento y analizar dinámicas de transferencia entre lenguas europeas.
- Construcción de modelos instructivos europeos: como base Apache 2.0 sin restricciones, es un punto de partida para que equipos académicos o empresas europeas entrenen sus propios asistentes con datos propios y control soberano.
- Traducción automática y paráfrasis entre lenguas europeas de bajos recursos: con fine-tuning específico sobre pares de lenguas, puede aprovechar su cobertura multilingüe para tareas de traducción en dominios acotados.
- Generación de contenido editorial y resúmenes en lenguas regionales: para medios o administraciones que necesitan procesar texto en catalán, gallego, euskera o lenguas bálticas, con la ventaja de la licencia permisiva.
- Experimentación académica en eficiencia de entrenamiento: el repositorio documenta hiperparámetros completos (batch, secuencia, arquitectura), lo que facilita reproducir o escalar el setup en clústeres propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente incluye sanity checks cualitativos (generaciones greedy sobre 4 prompts canónicos localizados a 36 lenguas) y no reporta MMLU, HumanEval, GSM8K ni métricas comparables.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: ~18,2 GB solo para pesos (18.189.215.744 bytes), más overhead de activaciones y caché KV; en la práctica se recomienda al menos 24 GB.
- En cuantización de 8 bits: ~9-10 GB de pesos; en 4 bits: ~5 GB, aunque no se documentan cuantizaciones oficiales publicadas.
- GPU recomendadas: A100 40/80 GB, H100 80 GB para entrenamiento o inferencia en BF16 con batch grande; RTX 4090 (24 GB) puede ejecutar inferencia en BF16 con batch pequeño o cuantizado.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en BF16 con contexto corto, o en GPUs de 12-16 GB si se cuantiza a 8 o 4 bits (requiere conversión propia, no publicada oficialmente).
- Opciones de despliegue: compatible con `transformers` (carga vía `AutoModelForCausalLM` con `revision` para cada checkpoint); no se documenta compatibilidad explícita con vLLM, llama.cpp, Ollama o TGI, aunque la arquitectura Qwen3 facilita la conversión a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| OpenEuroLLM Prelude-base 9B | 9,095 B | 4096 | Apache 2.0 | 36 lenguas europeas (41 códigos) | Base, sin instruct; foco europeo |
| Qwen3 8B (referencia arquitectónica) | ~8 B | mayor (no confirmado en esta ficha) | Apache 2.0 (según versión) | Multilingüe amplio | Prelude sigue su arquitectura; no se dispone de comparación de rendimiento |
| Gemma 2 9B | ~9 B | no disponible en esta ficha | Términos propios de Google | Multilingüe | No comparable en licencia ni cobertura de lenguas minoritarias europeas |
| Llama 3.1 8B | ~8 B | 128k | Llama Community License | Multilingüe limitado | Cobertura europea menor; licencia con restricciones |

No se dispone de datos de benchmarks para establecer comparaciones de rendimiento cuantitativas entre estos modelos y Prelude-base.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no debe usarse directamente como asistente; requiere fine-tuning supervisado o RLHF/DPO para seguir instrucciones de forma fiable.
- Riesgo de alucinación inherente a un modelo base entrenado principalmente para modelar texto; no incorpora mecanismos de verificación factual.
- Contexto limitado a 4096 tokens, corto comparado con modelos contemporáneos de 32k-128k, lo que restringe casos de uso con documentos largos.
- Cobertura desigual entre lenguas: aunque se declaran 36 lenguas, la mezcla es ~80% inglés/código/matemáticas y ~20% multilingüe, por lo que las lenguas de bajos recursos tendrán menor calidad y mayor riesgo de interferencia.
- Sesgos potenciales heredados de los corpus web de entrenamiento (inglés dominante, sesgos de género, culturales y geográficos), no documentados ni mitigados explícitamente en la información disponible.
- El modelo se entrenó sin token `<bos>`; integraciones que asuman `<bos>` por defecto pueden comportarse de forma distinta a lo esperado.
- Aunque la licencia Apache 2.0 permite uso comercial sin restricciones, la ausencia de benchmarks y de evaluación de sesgos hace recomendable una validación propia antes de desplegar en producción.
- El tamaño del repositorio (9.604 GB) refleja la acumulación de todos los checkpoints en ramas; descargar solo la revisión necesaria para evitar consumo masivo de almacenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openeurollm/prelude
- Repositorio base (checkpoints y ramas): https://huggingface.co/openeurollm/prelude-base
- Lista de ramas/checkpoints: https://huggingface.co/openeurollm/prelude-base/tree/main
- Seguimiento del progreso de entrenamiento: https://huggingface.co/spaces/openeurollm/oellm_progress
- Repositorio de recolección de datos de entrenamiento: https://github.com/OpenEuroLLM/training-data-collection/blob/main/baby/README.md
- Desglose de tokens por lengua: https://github.com/OpenEuroLLM/training-data-collection/blob/main/baby/README.md#per-language-breakdown-to-be-reviewed
- Configuración del experimento `baby_9b_dense`: https://github.com/OpenEuroLLM/oellm-autoexp/blob/prod/baby_9b_dense/config/experiments/baby/baby_9b_dense.yaml
- Configuración de arquitectura `qwen3_dense_9b.yaml`: https://github.com/OpenEuroLLM/oellm-autoexp/blob/prod/baby_9b_dense/config/backend/megatron/baby/models/qwen3_dense_9b.yaml
- Logo OpenEuroLLM: https://huggingface.co/openeurollm/prelude-base/resolve/main/figures/oellm-logo.svg
