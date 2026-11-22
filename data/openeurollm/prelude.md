# openeurollm/prelude

## Resumen

Prelude-base 9B es un modelo de lenguaje de tipo base (no instruido, sin ajuste por preferencias) desarrollado por OpenEuroLLM, un consorcio europeo cuyo objetivo es construir una familia de modelos abiertos con cobertura amplia de las lenguas oficiales de la Union Europea. El modelo es un transformer decoder-only denso de 9.094.607.872 parametros (aproximadamente 9,1 B) que sigue de cerca la arquitectura Qwen3, con 36 capas, hidden size de 4096 y atencion con GQA de 8 grupos KV.

Su relevancia radica en dos factores. Primero, el entrenamiento: 10 billones de tokens con una mezcla aproximada del 80 % en ingles, codigo y matematicas y un 20 % multilingue repartido entre 36 lenguas objetivo (41 codigos lengua/escritura en la mezcla de datos). Segundo, la licencia Apache 2.0, que permite uso comercial sin restricciones adicionales, algo poco habitual en modelos con esta cobertura linguistica europea.

Se trata de un checkpoint base, pensado como punto de partida para fine-tuning posterior (SFT, DPO, adaptaciones por dominio o por idioma) y no como un asistente listo para produccion conversacional. La longitud de contexto de entrenamiento es de 4096 tokens, un valor conservador frente a los 32k-128k habituales en modelos de 2025-2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, estilo Qwen3 (RoPE, RMSNorm con QK-norm, SwiGLU, GQA) |
| Parametros totales | 9.094.607.872 (~9,1 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se documentan GGUF ni AWQ/GPTQ oficiales) |
| Idiomas soportados | 36 lenguas objetivo: en, es, fr, de, pt, it, pl, el, nl, tr, ro, hu, uk, cs, sv, bg, fi, ca, hr, sk, da, lt, bs, sl, nb, sr, sq, lv, lvs, mk, is, mt, gl, eu, ekk, et, ga, als, nn, ltg (41 codigos lengua/escritura en la mezcla de datos) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, 399 tensores, ~18,19 GB) |

Detalles adicionales de configuracion: 36 capas, hidden size 4096, FFN densa de 12288, 32 cabezas de atencion, 8 grupos KV, head dim 128, RoPE con base 100000, RMSNorm con epsilon 1e-5 mas QK-norm, activacion SwiGLU, vocabulario de 262.145 tokens (tokenizer de 256k, padding a 262.272 por eficiencia en tensor parallel). Embeddings de entrada y `lm_head` no estan atados: 1.074.266.112 parametros cada uno, frente a 6.946.075.648 del cuerpo transformer.

## Arquitectura y entrenamiento

La arquitectura es un transformer autoregresivo denso que replica el diseno de Qwen3: normalizacion RMSNorm con QK-norm aplicada a queries y keys para estabilizar el entrenamiento a escala, atencion con grouped-query attention (32 cabezas de query, 8 grupos KV, head dim 128) y FFN con SwiGLU. El modelo no comparte los embeddings de entrada con la cabeza de salida, lo que anade aproximadamente 1,07 B de parametros respecto a una variante con pesos atados. El vocabulario de 262.145 tokens esta disenado para cubrir con eficiencia las 36 lenguas objetivo, incluyendo alfabetos cirilico y griego y lenguas de bajos recursos como el latgaliano, el alsaciano o el estonio estandar.

El entrenamiento se realizo en el supercomputador Leonardo (CINECA) con un batch global de 2048 y micro-batch de 4 sobre secuencias de 4096 tokens. El corpus total es de 10 billones de tokens, con aproximadamente un 80 % de contenido en ingles, codigo y matematicas y un 20 % multilingue. La composicion detallada, las fuentes y el desglose de tokens por lengua estan documentados en el repositorio `OpenEuroLLM/training-data-collection`. El pipeline distingue checkpoints intermedios (ramas `iter_*`) de los checkpoints de annealing (ramas `anneal_*`), siendo `main` el checkpoint final tras annealing (`stage2-step_1192093`). El modelo se entreno sin token `<bos>`: los documentos se empaquetan consecutivamente y cada uno termina en `<eos>`, por lo que los tokenizers publicados tienen `add_bos_token: false`. No se documentan en la informacion disponible fases de RLHF, DPO ni ajuste por instrucciones.

## Capacidades

- Generacion de texto autoregresiva en 36 lenguas europeas, con especial atencion a lenguas de bajos recursos y variantes regionales (latgaliano, alsaciano, nynorsk, tosk albanes).
- Modelado de lenguaje base: continuacion de texto, completado de frases, generacion narrativa y respuesta a preguntas de conocimiento general en modo few-shot.
- Capacidad de codigo y matematicas derivada de la mezcla de entrenamiento (~80 % ingles + codigo + matematicas), aunque sin evaluacion publicada en la informacion disponible.
- Capacidad multilingue nativa, no via traduccion: la model card indica que las pruebas de validacion usan convenciones nativas de cada lengua (por ejemplo, la formula de apertura de cuento propia de cada idioma).
- No dispone de modo thinking, vision, audio ni tool calling entrenado de forma explicita: es un modelo base sin post-entrenamiento para agentes o function calling.
- No se documenta soporte nativo de agentes ni razonamiento multi-paso; cualquier capacidad de este tipo requeriria fine-tuning posterior.

## Casos de uso

- Punto de partida para fine-tuning por idioma: el modelo ofrece representaciones ya entrenadas con 20 % de datos multilingues en 36 lenguas, por lo que un SFT sobre, por ejemplo, catalan, gallego o esloveno parte de una base mucho mas cercana que un modelo exclusivamente anglosajon.
- Generacion de texto y completado en aplicaciones editoriales: con 4096 tokens de contexto y licencia Apache 2.0, es adecuado para tareas de redaccion asistida, resumen de documentos cortos y generacion de variantes estilisticas en lenguas europeas.
- Investigacion en linguistica computacional: el desglose publico de tokens por lengua y los checkpoints intermedios (`iter_*`, `anneal_*`) permiten estudiar la dinamica de adquisicion de cada idioma durante el preentrenamiento.
- Desarrollo de asistentes conversacionales europeos tras SFT: al ser base, requiere una fase de instruccion, pero su cobertura linguistica reduce el coste de alinear un asistente que opere en varias lenguas oficiales de la UE sin depender de traduccion intermedia.
- Generacion de codigo y documentacion tecnica en ingles: la mezcla de entrenamiento incluye codigo y matematicas, por lo que sirve como base para modelos especializados en programacion mediante fine-tuning con datos propios.
- Experimentacion academica con recursos limitados: con ~18,19 GB en bf16, cabe en una unica GPU de 24 GB en cuantizacion de 8 bits o en dos GPU de 24 GB en bf16, lo que lo hace accesible para grupos de investigacion sin clústeres grandes.
- Evaluacion comparativa de tokenizers multilingues: el vocabulario de 262.145 tokens y el diseno sin `<bos>` lo convierten en un caso de estudio util para medir eficiencia de tokenizacion en lenguas con alfabetos no latinos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente incluye un conjunto de validacion cualitativa (`validation.json`) con 144 generaciones codificadas de forma greedy: 4 prompts canonicos de completado de frase (conocimiento general, sentido comun, ciencia y narrativa) localizados a las 36 lenguas objetivo. No hay datos de MMLU, HumanEval, GSM8K ni comparaciones numericas con otros modelos.

## Requisitos de hardware

- VRAM estimada en bf16: ~18,2 GB solo de pesos, mas overhead de activaciones y cache KV; en la practica requiere 20-24 GB para inferencia con contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: ~9-10 GB de pesos, viable en GPU consumer de 12-16 GB.
- VRAM estimada en cuantizacion de 4 bits: ~5-6 GB de pesos, viable en GPU consumer de 8 GB, aunque no se publican pesos GGUF oficiales en la informacion disponible.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16; RTX 4080/4070 Ti Super o superiores para cuantizacion de 8 bits.
- Cabe en GPU consumer: si, en RTX 4090 en bf16 y en GPUs de 8-12 GB con cuantizacion, siempre que se generen los pesos cuantizados (no publicados oficialmente).
- Opciones de despliegue: carga nativa via `transformers` con `AutoModelForCausalLM` y `device_map="auto"`; para serving de alto throughput seria necesario convertir los pesos a formatos compatibles con vLLM, TGI o llama.cpp, conversiones no documentadas en la informacion disponible.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni latencia por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| OpenEuroLLM Prelude-base 9B | 9,1 B denso | 4096 | 36 lenguas europeas | Apache 2.0 | Base sin post-entrenamiento; enfoque en cobertura UE |
| Qwen3 8B | ~8 B denso | no disponible en esta ficha | principalmente en + zh | Apache 2.0 (variantes) | Arquitectura de referencia de Prelude; sin cobertura especifica de lenguas UE de bajos recursos |
| Llama 3.1 8B | ~8 B denso | 128k | multilingue limitado | Llama Community License | Requiere aceptacion de terminos; cobertura UE inferior |
| Gemma 2 9B | ~9 B denso | 8k | multilingue amplio | Gemma Terms of Use | Restricciones de uso comercial distintas a Apache 2.0 |

La comparacion cuantitativa de rendimiento no esta disponible: no se han publicado benchmarks de Prelude-base 9B en la informacion proporcionada, por lo que las diferencias con estos modelos solo pueden establecerse en terminos de arquitectura, cobertura linguistica y licencia.

## Limitaciones y advertencias

- Es un modelo base sin alineacion: no sigue instrucciones de forma fiable, no rechaza peticiones daninas y puede producir contenido inapropiado; requiere SFT y, preferiblemente, DPO antes de cualquier despliegue orientado a usuario final.
- Riesgo de alucinacion elevado en tareas factuales, especialmente en lenguas con menor volumen de datos de entrenamiento dentro del 20 % multilingue.
- Contexto limitado a 4096 tokens: insuficiente para documentos largos, conversaciones multi-turno extensas o tareas de recuperacion aumentada con muchos fragmentos.
- Desequilibrio linguistico: con ~80 % de ingles, codigo y matematicas, el rendimiento en lenguas de bajos recursos (latgaliano, alsaciano, maltes, irlandes) sera previsiblemente inferior al de ingles, frances o aleman; no se publican metricas por lengua.
- Ausencia de token `<bos>`: los pipelines que asumen un token de inicio por defecto pueden comportarse de forma distinta; hay que verificar `add_bos_token: false` en el tokenizer.
- No se documentan pesos cuantizados oficiales ni integraciones con vLLM, llama.cpp u Ollama, lo que anade trabajo de conversion para despliegues de produccion.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales, pero no exime del cumplimiento del AI Act europeo ni de las obligaciones de transparencia aplicables a sistemas de IA de proposito general.
- El repositorio es muy grande (~9,6 TB) por acumular todos los checkpoints intermedios en ramas; conviene descargar solo la revision necesaria para evitar consumos de almacenamiento desproporcionados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openeurollm/prelude
- Repositorio del modelo base: https://huggingface.co/openeurollm/prelude-base
- Seguimiento de entrenamientos OpenEuroLLM: https://huggingface.co/spaces/openeurollm/oellm_progress
- Repositorio de recoleccion de datos de entrenamiento: https://github.com/OpenEuroLLM/training-data-collection/blob/main/baby/README.md
- Configuracion del experimento `baby_9b_dense`: https://github.com/OpenEuroLLM/oellm-autoexp/blob/prod/baby_9b_dense/config/experiments/baby/baby_9b_dense.yaml
- Configuracion de arquitectura `qwen3_dense_9b.yaml`: https://github.com/OpenEuroLLM/oellm-autoexp/blob/prod/baby_9b_dense/config/backend/megatron/baby/models/qwen3_dense_9b.yaml
