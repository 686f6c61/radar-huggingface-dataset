# JaeWooShin/grpo-group-size

## Resumen

`JaeWooShin/grpo-group-size` es una colección de checkpoints publicados como resultado de un estudio empírico sobre el tamano del grupo en GRPO (Group Relative Policy Optimization) aplicado a razonamiento matematico. El autor, JaeWooShin, parte de **Qwen3-4B-Base** y lo entrena con una variante de GRPO al estilo DAPO sobre la porcion en ingles, deduplicada y descontaminada de DAPO-Math-17k (14.410 problemas). No es un modelo pensado para uso general en produccion, sino un artefacto de investigacion reproducible: cada carpeta corresponde a una ejecucion concreta con una configuracion distinta de tamano de grupo (G) y de respuestas por actualizacion (K).

El interes tecnico reside en la separacion explicita entre el grupo de G respuestas usado para calcular la linea base y el subconjunto de K respuestas sobre el que se computa la actualizacion. El estudio 1 fija 1.024 respuestas por actualizacion y varia K a G constante; el estudio 2 fija 64 preguntas por paso y varia G a tamano de actualizacion constante. Esto permite aislar el efecto del tamano de grupo del efecto del tamano de lote, una cuestion poco explorada en la literatura de RLVR.

El repositorio ocupa 25 GB e incluye pesos en bf16, rollouts completos en JSONL comprimidos, metricas por paso, reevaluaciones y logs de TensorBoard. Los checkpoints FSDP completos (pesos, optimizador y estado del dataloader) se alojan en un bucket aparte para poder reanudar el entrenamiento con verl. La licencia es Apache 2.0, heredada del modelo base Qwen3-4B-Base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-4B-Base); ajuste fino con GRPO estilo DAPO |
| Parametros totales | 4.000 millones (aproximado, segun el modelo base Qwen3-4B-Base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; entrenamiento con respuestas de hasta 8.192 tokens |
| Tipos de cuantizacion | no disponible (los checkpoints se publican en bf16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible de forma explicita; los datos de entrenamiento son la parte en ingles de DAPO-Math-17k |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) en carpetas `merged/global_step_<N>/`; checkpoints FSDP completos en el bucket asociado |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de Qwen3-4B-Base, un transformer decoder-only denso de 4.000 millones de parametros. El ajuste se realiza con **verl** usando una receta GRPO al estilo DAPO: perdida token-mean, clipping en 0,2 / 0,28, AdamW con learning rate 1e-6 y 10 pasos de calentamiento, 4 actualizaciones del optimizador por paso, sin termino KL, temperatura 1,0 y respuestas de hasta 8.192 tokens con la penalizacion suave de sobrelongitud de DAPO. El prompt es un unico turno de usuario en formato ChatML con la instruccion `Please reason step by step, and put your final answer within \boxed{}.`, y la generacion se detiene en `<|im_end|>`.

La innovacion metodologica es la separacion entre G (tamano del grupo sobre el que se calcula la linea base) y K (respuestas sobre las que se computa la actualizacion). El estudio 1 mantiene 1.024 respuestas por actualizacion y ajusta el numero de preguntas por paso como 1024 / K, comparando distintos K a G fijo. El estudio 2 mantiene 64 preguntas por paso y un tamano de actualizacion de 64 x K, comparando distintos G a tamano de actualizacion fijo. Los datos de entrenamiento son la porcion en ingles, deduplicada y descontaminada de DAPO-Math-17k, con 14.410 problemas. La validacion se hace sobre AIME24, AIME25, AMC23 y MATH-500.

## Capacidades

- Generacion de texto y razonamiento paso a paso en dominios matematicos, con formato de respuesta final en `\boxed{}`.
- Resolucion de problemas de competicion (AIME, AMC, MATH-500) como dominio principal de entrenamiento.
- Generacion de cadenas de razonamiento largas, de hasta 8.192 tokens por respuesta.
- Capacidades heredadas del modelo base Qwen3-4B-Base (generacion general de texto), aunque el ajuste con RLVR se centra en matematicas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso con herramientas.
- No se documenta capacidad de vision ni audio.
- Capacidades multilingues: no disponibles de forma explicita; el entrenamiento es solo en ingles.

## Casos de uso

- **Investigacion sobre RLVR y GRPO**: reproducir el estudio variando G y K con los checkpoints y rollouts publicados, y analizar la relacion entre tamano de grupo, tamano de actualizacion y rendimiento en matematicas. Es el uso principal para el que se publica el repositorio.
- **Analisis de curvas de aprendizaje**: los ficheros `metrics.jsonl`, `reeval/` y `tensorboard/` permiten estudiar la evolucion por paso y comparar configuraciones sin reentrenar.
- **Auditoria de rollouts**: los `rollouts/steps_<a>-<b>.tar.gz` contienen prompt, respuesta, recompensa y un JSONL por paso, utiles para analizar modos de fallo, longitudes de respuesta y senales de recompensa.
- **Punto de partida para ajuste posterior**: cargar un checkpoint `merged/global_step_<N>` con Transformers o vLLM y continuar el ajuste con otra receta o dominio, partiendo de un modelo ya alineado para razonamiento matematico.
- **Evaluacion comparativa de checkpoints intermedios**: comparar el rendimiento en AIME24, AIME25, AMC23 y MATH-500 entre pasos y configuraciones para estudiar el efecto del tamano de grupo en la calidad final.
- **Servicio de inferencia matematico a pequena escala**: desplegar un checkpoint con vLLM para resolver problemas matematicos con salida en `\boxed{}`, en un entorno controlado y con validacion humana, dado que el modelo no esta pensado para produccion general.
- **Reproduccion de experimentos con verl**: reanudar el entrenamiento desde los checkpoints FSDP del bucket asociado, que incluyen pesos, optimizador y estado del dataloader particionado para 2 GPUs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que la validacion usa AIME24, AIME25, AMC23 y MATH-500, y que los resultados por paso estan en `results/reeval/` (32 muestras por problema) y `results/metrics.jsonl`, pero no se incluyen cifras numericas en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 8 GB solo para pesos (4.000 millones de parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica, entre 10 y 16 GB segun longitud de contexto y tamano de lote.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 4-6 GB para pesos; en 4 bits, alrededor de 2,5-4 GB. No se publican variantes cuantizadas oficiales.
- GPU recomendadas para inferencia: A100, H100 o L40S para despliegue con vLLM; RTX 4090 o RTX 3090 para uso individual en bf16 o cuantizado.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) y RTX 3090 (24 GB) en bf16; en GPUs de 16 GB o menos requiere cuantizacion.
- Opciones de despliegue: vLLM (documentado en la model card mediante `hf download` y servicio posterior), Transformers con `AutoModelForCausalLM` y `AutoTokenizer`, y cualquier runtime compatible con safetensors. No se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Entrenamiento: los checkpoints FSDP estan particionados para 2 GPUs; el estudio se ejecuto con verl.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JaeWooShin/grpo-group-size | 4.000 millones (aprox.) | no disponible (respuestas de 8.192 tokens) | Razonamiento matematico (DAPO-Math-17k, ingles) | Apache 2.0 | Hugging Face, checkpoints intermedios y rollouts |
| Qwen/Qwen3-4B-Base | 4.000 millones (aprox.) | no disponible en la informacion proporcionada | Preentrenamiento general | Apache 2.0 | Hugging Face |
| Modelos ajustados con GRPO/DAPO sobre Qwen3-4B | 4.000 millones (aprox.) | variable | Razonamiento matematico | variable | variable |

La comparativa con alternativas concretas no esta disponible en la informacion proporcionada; el modelo base Qwen3-4B-Base es la referencia directa y el punto de partida del ajuste.

## Limitaciones y advertencias

- Es un artefacto de investigacion, no un modelo de produccion: no hay garantias de calidad fuera del dominio matematico ni de estabilidad entre checkpoints.
- Entrenado exclusivamente con la parte en ingles de DAPO-Math-17k; el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea deficiente.
- Riesgo de alucinacion en problemas fuera de distribucion o cuando la cadena de razonamiento excede los 8.192 tokens.
- Sesgos no evaluados: la model card no documenta analisis de sesgos, toxicidad ni robustez.
- La receta no incluye termino KL, lo que puede favorecer deriva respecto al modelo base en dominios no matematicos.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene validar cualquier despliegue en produccion.
- Los checkpoints publicados son intermedios (cada 50 pasos, en pasos reevaluados y en el ultimo paso); no todos los pasos estan disponibles como modelo `merged`.
- El repositorio ocupa 25 GB; los checkpoints FSDP completos estan en un bucket aparte y requieren descarga adicional.
- No se documentan variantes cuantizadas oficiales; cualquier cuantizacion es responsabilidad del usuario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JaeWooShin/grpo-group-size
- Bucket de checkpoints FSDP: https://huggingface.co/buckets/JaeWooShin/grpo-group-size-checkpoints
- Modelo base Qwen3-4B-Base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Repositorio de verl: https://github.com/verl-project/verl
