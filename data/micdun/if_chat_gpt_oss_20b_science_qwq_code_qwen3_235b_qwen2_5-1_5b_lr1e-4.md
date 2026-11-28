# micdun/if_chat_gpt_oss_20b_science_qwq_code_qwen3_235B_qwen2_5-1_5b_lr1e-4

## Resumen

`if_chat_gpt_oss_20b_science_qwq_code_qwen3_235B_qwen2_5-1_5b_lr1e-4` es un ajuste fino supervisado (SFT) del modelo Qwen2.5-1.5B-Instruct, publicado por el usuario micdun en Hugging Face. El modelo parte de la arquitectura transformer decoder-only de Qwen2.5, con 1.543.714.304 parametros reales verificados en los pesos safetensors, y se ha entrenado sobre un conjunto de datos sinteticos generado por varios modelos "profesor" de mayor tamano, identificados en el propio nombre del run.

El objetivo del ajuste es inyectar capacidades en tres dominios concretos: seguimiento de instrucciones y conversacion, ciencia y codigo. Para ello se ha realizado un fine-tune completo (no LoRA) durante 3 epocas con una tasa de aprendizaje de 1e-4 y un tamano de lote global de 64, segun la model card del autor. El resultado es un modelo pequeno, de 1,5 mil millones de parametros, pensado para despliegues con recursos limitados.

La relevancia de esta ficha es doble: por un lado, documenta un ejemplo tipico de destilacion sintetica de modelos grandes a modelos pequenos; por otro, advierte de que se trata de un artefacto de investigacion sin benchmarks publicados, sin licencia declarada y sin informacion sobre idiomas soportados, lo que limita seriamente su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-1.5B-Instruct soporta hasta 32.768 tokens, pero el autor no lo declara para este ajuste) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos publicados en safetensors; al derivar de Qwen2.5 es compatible con cuantizaciones GGUF/AWQ/GPTQ generadas por herramientas externas) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen2.5-1.5B-Instruct: un transformer decoder-only denso con atencion causal estandar, normalizacion RMSNorm, activacion SwiGLU y embeddings de tokens compartidos con la cabeza de salida. No se trata de un modelo MoE ni de una arquitectura hibrida SSM; todos los parametros se activan en cada paso de inferencia. El tamano del repositorio es de 3,1 GB, coherente con pesos en precision de 16 bits para 1,54 mil millones de parametros.

El entrenamiento consistio en un fine-tune completo durante 3 epocas, con learning rate 1e-4 y batch global de 64, usando la libreria TRL (tag `trl`) sobre datos sinteticos. La mezcla de dominios cubre instrucciones/chat, ciencia y codigo, y cada dominio fue generado por los modelos profesor indicados en el identificador del run: un modelo tipo GPT-OSS de 20B para chat e instrucciones, un modelo QwQ para ciencia y un modelo Qwen3 de 235B para codigo. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron etapas de RLHF o DPO posteriores al SFT.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base Qwen2.5-1.5B-Instruct y reforzada con el conjunto sintetico de instrucciones.
- Razonamiento cientifico basico, orientado por los datos sinteticos generados con el modelo profesor de ciencia.
- Generacion de codigo, entrenado con datos sinteticos procedentes de un modelo profesor de 235B.
- Seguimiento de instrucciones (instruction following), segun declara el autor en el identificador del run.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada; el modelo base Qwen2.5 lo soporta, pero el autor no lo confirma para este ajuste.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la informacion proporcionada.
- Capacidades multilingues: no disponibles; el autor no declara idiomas.
- Modo thinking, vision o audio: no disponibles; el modelo es exclusivamente de texto.

## Casos de uso

- Prototipado rapido de asistentes conversacionales: con 1,54B de parametros el modelo cabe en GPUs de consumo y permite iterar sobre prompts y flujos de dialogo sin coste de infraestructura elevado, usando el formato de chat de Qwen2.5.
- Experimentacion academica sobre destilacion sintetica: sirve como caso de estudio de como datos generados por modelos de 20B a 235B se transfieren a un modelo de 1,5B, permitiendo analizar la degradacion o retencion de capacidades por dominio.
- Generacion de codigo en entornos con recursos limitados: adecuado para autocompletado o generacion de fragmentos en portatiles o estaciones de trabajo sin GPU dedicada de gran memoria, siempre que se valide la calidad del codigo generado.
- Tareas de divulgacion cientifica asistida: redaccion de explicaciones y resumenes de conceptos cientificos basicos, aprovechando el dominio de ciencia del conjunto de entrenamiento, con revision humana obligatoria.
- Fine-tuning posterior como punto de partida: al ser un modelo pequeno y completamente ajustable, puede servir de base para especializaciones adicionales con LoRA o QLoRA en dominios concretos.
- Evaluacion comparativa de tecnicas de SFT: util para investigadores que quieran reproducir o contrastar recetas de entrenamiento (3 epocas, lr 1e-4, batch 64) sobre un modelo base conocido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y el repositorio no presenta comparaciones con el modelo base ni con alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3,1 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda al menos 6-8 GB de VRAM para contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: en torno a 1,6-2 GB para pesos.
- VRAM estimada en cuantizacion de 4 bits (GGUF Q4): en torno a 1-1,5 GB para pesos, lo que permite ejecucion en CPU con llama.cpp u Ollama.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 4090) para FP16; A100 o H100 no son necesarias para este tamano y solo tendrian sentido para entrenamiento o serving a gran escala.
- Cabe en GPU de consumo: si, en la mayoria de GPUs consumer con 8 GB o mas, y en configuraciones de 4 bits incluso en equipos con menos VRAM o en CPU.
- Opciones de despliegue: transformers (soporte nativo declarado), text-generation-inference (tag `text-generation-inference`), y herramientas compatibles con safetensors como vLLM; para cuantizacion ligera, llama.cpp u Ollama tras conversion a GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (micdun) | 1,54B | no disponible | no disponible | Hugging Face, 0 descargas | SFT sintetico sin benchmarks |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens (segun modelo base) | Apache 2.0 (segun modelo base) | Hugging Face, ampliamente usado | Modelo base de referencia, con benchmarks publicados por Qwen |
| Qwen/Qwen2.5-1.5B | 1,54B | 32.768 tokens (segun modelo base) | Apache 2.0 (segun modelo base) | Hugging Face | Version base sin instrucciones |
| SmolLM2-1.7B-Instruct | 1,7B | 8.192 tokens (segun su model card) | Apache 2.0 (segun su model card) | Hugging Face | Alternativa pequena orientada a instrucciones |

La comparacion con el modelo base es la mas relevante: este ajuste no documenta mejoras medibles sobre Qwen2.5-1.5B-Instruct, por lo que en ausencia de benchmarks no puede afirmarse que lo supere. Para uso en produccion, el modelo base oficial ofrece garantias de licencia, contexto declarado y evaluaciones publicadas que este ajuste no proporciona.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de que el ajuste mejore al modelo base en ningun dominio; podria incluso degradar capacidades por sobreajuste a datos sinteticos.
- Riesgo de alucinacion: al ser un modelo de 1,5B ajustado sobre datos sinteticos, la probabilidad de generar contenido plausible pero falso es alta, especialmente en ciencia y codigo.
- Sesgos conocidos: no documentados por el autor; los sesgos del modelo base Qwen2.5 y los de los modelos profesor pueden propagarse a traves de los datos sinteticos.
- Limitaciones de contexto e idioma: el autor no declara ni la ventana de contexto efectiva tras el ajuste ni los idiomas soportados; no debe asumirse el comportamiento multilingue del modelo base.
- Restricciones de licencia: la licencia no esta disponible, lo que impide determinar si el uso comercial esta permitido; en la practica, esto bloquea su adopcion en produccion sin aclaracion previa del autor.
- Trazabilidad limitada: 0 descargas y 0 likes en el momento de la consulta, sin documentacion adicional sobre el dataset, el proceso de filtrado o la evaluacion; es un artefacto de investigacion, no un modelo listo para produccion.
- Dependencia de datos sinteticos: la calidad del ajuste esta acotada por la calidad y diversidad de las generaciones de los modelos profesor, sin que el autor detalle el volumen ni la curacion del corpus.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/micdun/if_chat_gpt_oss_20b_science_qwq_code_qwen3_235B_qwen2_5-1_5b_lr1e-4
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Libreria TRL: https://github.com/huggingface/trl
- Libreria Transformers: https://github.com/huggingface/transformers
