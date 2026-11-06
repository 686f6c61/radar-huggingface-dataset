# openeurollm/prelude

## Resumen

OpenEuroLLM Prelude 9B es un modelo de lenguaje base de tipo dense, decoder-only y autoregresivo, desarrollado por el consorcio OpenEuroLLM y entrenado en el supercomputador Leonardo (CINECA). El repositorio `openeurollm/prelude` no contiene un modelo final, sino checkpoints intermedios de un entrenamiento en curso: cada rama del repositorio (por ejemplo `iter_0124800`) es un checkpoint autocontenido con `config.json`, pesos en safetensors, tokenizer y un `validation.json` con generaciones de comprobación. La rama `main` está intencionadamente vacía y reservada para el checkpoint final.

El modelo sigue de cerca la arquitectura de Qwen3: 36 capas, hidden size de 4096, FFN densa de 12288, 32 cabezas de atención con GQA de 8 grupos KV, RoPE con base 100000, RMSNorm con QK-norm y SwiGLU. Suma aproximadamente 9.095 mil millones de parámetros (con embeddings de entrada y salida no atados), lo que supone unos 18,19 GB en bf16. La longitud de secuencia de entrenamiento es de 4096 tokens y el vocabulario es de 262.145 entradas.

Su relevancia es doble: por un lado, es un artefacto de investigación abierto que permite seguir el estado de un entrenamiento multilingüe europeo a gran escala; por otro, su mezcla de datos cubre 36 lenguas objetivo de OpenEuroLLM (41 códigos de lengua/escritura en la mezcla), con un 10T de tokens previstos, de los cuales aproximadamente el 80% es inglés, código y matemáticas y el 20% multilingüe. No obstante, conviene subrayar que los checkpoints publicados corresponden a la fase "stable" (max-LR constante) del schedule WSD y no han pasado por cooldown.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, estilo Qwen3 (RoPE base 100000, RMSNorm con QK-norm, SwiGLU, GQA) |
| Parametros totales | 9.094.607.872 (~9,095 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 4096 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | No disponible (pesos publicados en bf16; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | 36 lenguas objetivo de OpenEuroLLM (41 códigos de lengua/escritura en la mezcla de datos) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors en bf16, shards de 5 GB; tokenizer incluido por rama |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso con embeddings de entrada y salida no atados (*untied*). Consta de 36 capas con hidden size 4096, FFN densa de 12288, 32 cabezas de atención y 8 grupos KV bajo GQA, con dimensión de cabeza de 128. Emplea RoPE con base 100000, RMSNorm con epsilon 1e-5 y QK-norm, activación SwiGLU y dtype bf16. El vocabulario es de 262.145 tokens (tokenizer de 256k, con padding hasta 262.272 por eficiencia de tensor parallelism). El desglose de parámetros es: 1.074.266.112 en `embed_tokens`, 1.074.266.112 en `lm_head` y 6.946.075.648 en el cuerpo transformer.

El entrenamiento se realiza sobre 10T de tokens, con una mezcla aproximada del 80% en inglés, código y matemáticas, y un 20% multilingüe repartido entre las 36 lenguas objetivo. La composición completa del dataset, las fuentes y el desglose de tokens por lengua están documentados en el repositorio `training-data-collection`. El schedule de learning rate es WSD (warmup-stable-decay); los checkpoints publicados pertenecen a la fase estable con max-LR constante y no han pasado por la fase de cooldown, que solo se reflejaría a partir de la iteración ~953.600. El modelo se entrenó sin token `<bos>`: los documentos se empaquetan consecutivamente y cada uno termina en `<eos>`, por lo que los tokenizers de las ramas tienen `add_bos_token: false`. No se documentan en la información disponible fases de RLHF, DPO ni otras técnicas de alineación posteriores al preentrenamiento.

## Capacidades

- Generación de texto autoregresiva en 36 lenguas europeas, con especial atención a lenguas de menor recursos (gaélico, maltés, letón estándar y latgaliano, estonio estándar, albanés tosco, noruego bokmål y nynorsk, entre otras).
- Modelo base sin ajuste instructivo: no se documenta soporte nativo de instrucciones, tool calling ni function calling.
- Razonamiento y conocimiento general en fase de preentrenamiento, verificado mediante un conjunto fijo de prompts de comprobación (conocimiento general, sentido común, ciencia y narrativa) localizados a las 36 lenguas.
- Capacidad multilingüe nativa en el tokenizer y en la mezcla de datos, con convenciones nativas por lengua en las generaciones de validación.
- No se documentan capacidades de visión, audio, modo *thinking* explícito ni agentes multi-paso en la información disponible.

## Casos de uso

- Investigación sobre entrenamiento multilingüe a gran escala: los checkpoints intermedios permiten estudiar la evolución de la calidad por lengua e iteración, comparando las generaciones de `validation.json` entre ramas para analizar dinámicas de aprendizaje.
- Evaluación de tokenizers multilingües: con 262.145 entradas y cobertura de 41 códigos de lengua/escritura, sirve para medir eficiencia de tokenización en lenguas europeas de baja representación antes de entrenar modelos propios.
- Punto de partida para *continued pretraining* o ajuste fino supervisado: al ser un modelo base de 9B con licencia Apache 2.0, puede adaptarse a dominios concretos (legal, administrativo, sanitario) en lenguas europeas.
- Experimentos de alineación y evaluación de sesgos: al no haber pasado por RLHF/DPO, es un sustrato limpio para estudiar el efecto de distintas técnicas de alineación sobre el comportamiento multilingüe.
- Generación de texto en lenguas de bajos recursos: útil para prototipos de completado y generación en idiomas como maltés, gaélico o latgaliano, donde los modelos comerciales suelen tener cobertura limitada.
- Reproducibilidad de infraestructura: los checkpoints por iteración y la configuración Megatron publicada permiten reproducir y auditar el pipeline de entrenamiento en clústeres HPC.
- Benchmarking de herramientas de inferencia: al publicarse en safetensors bf16 con shards de 5 GB, es un caso práctico para validar pipelines de conversión a GGUF y despliegue con vLLM o TGI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 18,2 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, se recomienda un mínimo de 24 GB y, para contextos de 4096 tokens con lotes, 40-80 GB.
- En cuantización de 8 bits: en torno a 9-10 GB de pesos; en 4 bits: en torno a 5-6 GB, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: A100 40/80 GB, H100 80 GB, L40S 48 GB para producción; RTX 4090 24 GB puede alojar los pesos en bf16 con contexto corto y lote pequeño, y con más holgura en cuantización de 8 o 4 bits.
- Cabe en GPU de consumo (RTX 3090/4090 de 24 GB) en bf16 con contexto limitado, y en GPUs de 16 GB solo mediante cuantización.
- Opciones de despliegue: `transformers` con `device_map="auto"` (soporte documentado en la model card); vLLM, TGI y llama.cpp no están documentados oficialmente para este repositorio, aunque la arquitectura estilo Qwen3 facilita su adaptación.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado | Notas |
|---|---|---|---|---|---|
| OpenEuroLLM Prelude 9B | ~9,095 B densos | 4096 | Apache 2.0 | Checkpoints intermedios, sin cooldown | Foco multilingüe europeo (36 lenguas), entrenamiento en curso |
| Qwen3 8B (referencia arquitectónica) | ~8 B densos | No disponible en esta ficha | Apache 2.0 | Modelo final publicado | Arquitectura de referencia seguida por Prelude; no se dispone de comparación de rendimiento |
| Modelos base europeos de tamaño similar | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificables en la información proporcionada |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada; la comparación se limita a parámetros, contexto, licencia y estado de publicación.

## Limitaciones y advertencias

- Los checkpoints publicados son artefactos de investigación intermedios, no un modelo final: no han pasado por la fase de cooldown del schedule WSD y su calidad es inferior a la esperada en el checkpoint final.
- No es un modelo instructivo: no se documenta ajuste por instrucciones, RLHF ni DPO, por lo que no debe usarse directamente como asistente conversacional en producción.
- Riesgo de alucinación y de generación incoherente, especialmente en checkpoints tempranos; el `validation.json` de cada rama es solo una comprobación rápida de coherencia, no una evaluación rigurosa.
- Sesgos potenciales derivados de la mezcla de datos (aproximadamente 80% inglés, código y matemáticas), que puede infrarepresentar dominios y registros de las lenguas europeas minoritarias.
- El modelo se entrenó sin token `<bos>`; copias de ramas descargadas antes del 2 de noviembre de 2026 añaden `<bos>` de forma incorrecta y requieren `add_special_tokens=False` al tokenizar.
- La rama `main` está vacía de forma intencionada: es necesario especificar una revisión concreta (`iter_XXXXXXX`) para cargar el modelo.
- Aunque la licencia es Apache 2.0 y permite uso comercial, la naturaleza experimental y la ausencia de evaluaciones de seguridad desaconsejan su despliegue en producción sin ajuste y evaluación adicionales.
- El tamaño del repositorio (unos 19 TB) implica que la descarga de todas las ramas es inviable para la mayoría de usuarios; conviene descargar solo la revisión necesaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/openeurollm/prelude
- Seguimiento del progreso de OpenEuroLLM: https://huggingface.co/spaces/openeurollm/oellm_progress
- Repositorio de recolección de datos de entrenamiento: https://github.com/OpenEuroLLM/training-data-collection/blob/main/baby/README.md
- Desglose de tokens por lengua: https://github.com/OpenEuroLLM/training-data-collection/blob/main/baby/README.md#per-language-breakdown-to-be-reviewed
- Repositorio de experimentos (oellm-autoexp, experimento `baby_9b_dense`): https://github.com/OpenEuroLLM/oellm-autoexp/blob/prod/baby_9b_dense/config/experiments/baby/baby_9b_dense.yaml
- Configuración de arquitectura (`qwen3_dense_9b.yaml`): https://github.com/OpenEuroLLM/oellm-autoexp/blob/prod/baby_9b_dense/config/backend/megatron/baby/models/qwen3_dense_9b.yaml
