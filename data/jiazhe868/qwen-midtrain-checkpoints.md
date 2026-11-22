# jiazhe868/qwen-midtrain-checkpoints

## Resumen

`jiazhe868/qwen-midtrain-checkpoints` es una colección de checkpoints resultantes de un experimento de *continued pretraining* (preentrenamiento continuado) sobre modelos base de la familia Qwen3.5. El autor, jiazhe868, publica los pesos de múltiples ejecuciones de entrenamiento realizadas como parte de un estudio sistemático sobre mezclas de datos, documentado en el repositorio de GitHub `jiazhe868/qwen-midtrain`. No se trata de un modelo nuevo, sino de variantes de los modelos base de Qwen3.5 (0.8B y 2B) tras un entrenamiento adicional sobre mezclas de datos controladas.

El interés de esta publicación es fundamentalmente metodológico: cada checkpoint corresponde a una ejecución con una mezcla de datos concreta, una tasa de aprendizaje determinada y un número de tokens fijo (20M o 40M), lo que permite a investigadores estudiar el efecto de la composición del corpus en el comportamiento del modelo. Los checkpoints se guardan en el mismo formato que el modelo base, por lo que se cargan y sirven de forma idéntica a este.

El repositorio ocupa 79,4 GB y contiene decenas de subcarpetas organizadas en tres grupos: ejecuciones piloto (`pilot_*`), ejecuciones del diseño de cribado de 18 ejecuciones (`screen18_r*`) y ejecuciones del experimento de dosis (`dose_*`). La licencia es Apache-2.0, heredada de los modelos base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3.5 Base) |
| Parametros totales | 0.8B y 2B (dos variantes base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | no disponibles (las mezclas incluyen wiki_en y wiki_zh, lo que sugiere cobertura al menos de ingles y chino) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de los modelos Qwen3.5 Base en sus variantes de 0.8B y 2B parámetros, es decir, transformers decoder-only. Sobre ellos se aplica un *continued pretraining* con mezclas de datos diseñadas experimentalmente. Los entrenamientos usan entre 20M y 40M de tokens por ejecución, con tasas de aprendizaje que van de 3e-06 a 3e-05 según la ejecución.

Las mezclas de datos combinan fuentes como `replay_web` (replay de datos web para mitigar el olvido catastrófico), `wiki_en`, `wiki_zh`, `textbooks`, `papers`, `forum_qa`, `math_web`, `code`, `long_context`, `synthetic_rephrase` y `synthetic_qa`, con proporciones que varían entre ejecuciones. El diseño experimental incluye un grupo piloto (4 ejecuciones sobre 0.8B con 20M de tokens), un cribado de 18 ejecuciones (`screen18_r01` a `screen18_r14`, con variantes en 0.8B y algunas también en 2B) y un experimento de dosis (`dose_*`). No se documenta en la información disponible el uso de RLHF, DPO ni innovaciones arquitectónicas adicionales; el valor del artefacto reside en la comparabilidad controlada de las mezclas.

## Capacidades

- Generación de texto autoregresiva, heredada del modelo base Qwen3.5.
- Razonamiento y conocimiento general, condicionados por la mezcla de datos de cada checkpoint.
- Capacidad matemática reforzada en las ejecuciones con mayor proporción de `math_web` (por ejemplo, `screen18_r10_0.8B` con 15%).
- Capacidad de código en ejecuciones con mayor proporción de `code` (por ejemplo, `screen18_r06` con 8%).
- Cobertura multilingüe limitada a lo presente en las mezclas: inglés (`wiki_en`) y chino (`wiki_zh`).
- Contexto largo potencial en ejecuciones con `long_context` (hasta 18% en `screen18_r02`, `r03` y `r10`).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito en la información disponible.

## Casos de uso

- Investigación sobre mezclas de datos: los checkpoints permiten reproducir y comparar el efecto de distintas proporciones de `replay_web`, `wiki_zh`, `code` o `math_web` sobre el rendimiento del modelo base, usando el repositorio de GitHub como guía metodológica.
- Estudio del olvido catastrófico: las ejecuciones `pilot_replay_only_*` (85% `replay_web`, 15% `wiki_zh`) sirven como línea base para medir cuánto se degrada el modelo al entrenar solo con datos de replay.
- Experimentos de dosis-respuesta: las ejecuciones `dose_*` permiten analizar cómo varía el comportamiento con la cantidad de tokens o la tasa de aprendizaje, manteniendo fija la mezcla.
- Evaluación comparativa de checkpoints: al cargarse con `AutoModelForCausalLM.from_pretrained(..., subfolder="...")`, se pueden integrar en pipelines de evaluación estándar (lm-evaluation-harness, etc.) para medir MMLU, GSM8K o HumanEval sobre cada variante.
- Ajuste fino posterior (SFT): los checkpoints pueden servir como punto de partida para *supervised fine-tuning* en dominios concretos, aprovechando que ya han sido expuestos a mezclas con `textbooks`, `papers` o `forum_qa`.
- Docencia y formación: el conjunto es útil para ilustrar en cursos de ML cómo se diseña un cribado experimental de mezclas de datos y cómo se interpretan los resultados.
- Servicio de inferencia ligero: las variantes de 0.8B y 2B, en formato safetensors compatible con Transformers, pueden desplegarse en entornos con recursos limitados para tareas de generación de texto de baja latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 1,6 GB para la variante 0.8B y 4 GB para la 2B (solo pesos; hay que añadir KV cache y overhead).
- VRAM estimada en cuantización de 8 bits: en torno a 0,8 GB (0.8B) y 2 GB (2B).
- VRAM estimada en cuantización de 4 bits: en torno a 0,4 GB (0.8B) y 1 GB (2B).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente para ambas variantes; para despliegue en producción con concurrencia, A100 o H100 aportan margen.
- Cabe en GPU consumer: sí, ambas variantes caben holgadamente en GPUs con 8 GB o más.
- Opciones de despliegue: Transformers (carga directa con `subfolder`), vLLM, TGI, llama.cpp y Ollama (previa conversión a GGUF, no incluida en el repositorio).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| qwen-midtrain-checkpoints (este) | 0.8B / 2B | no disponible | Apache-2.0 | Hugging Face, 79,4 GB, 0 descargas |
| Qwen/Qwen3.5-0.8B-Base | 0.8B | no disponible | Apache-2.0 | Hugging Face (modelo base oficial) |
| Qwen/Qwen3.5-2B-Base | 2B | no disponible | Apache-2.0 | Hugging Face (modelo base oficial) |
| Alternativas de tamano similar (p. ej. Llama 3.2 1B, Gemma 2 2B) | 1B–2B | variable | licencias propias | Hugging Face |

La comparación relevante es contra los propios modelos base de Qwen3.5, ya que estos checkpoints son variantes entrenadas adicionalmente sobre ellos; cualquier diferencia de rendimiento debe atribuirse al *continued pretraining* y no a cambios arquitectónicos.

## Limitaciones y advertencias

- No es un modelo nuevo ni un modelo instruido: son checkpoints de preentrenamiento continuado, sin alineación (RLHF/DPO) documentada, por lo que no deben usarse directamente como asistentes conversacionales sin ajuste posterior.
- El entrenamiento es muy corto (20M–40M tokens), insuficiente para cambios sustanciales de capacidad; las diferencias entre checkpoints pueden ser pequeñas y ruidosas.
- Riesgo de olvido catastrófico y de degradación en dominios no representados en la mezcla; las ejecuciones con alto porcentaje de `replay_web` están diseñadas precisamente para mitigarlo, pero no lo eliminan.
- Riesgo de alucinación inherente a los modelos base, no evaluado en la información disponible.
- Idiomas: la cobertura documentada se limita a inglés y chino; el rendimiento en castellano no está evaluado.
- Longitud de contexto: no documentada; las ejecuciones con `long_context` no garantizan una ventana mayor que la del modelo base.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento de los checkpoints.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de validación por parte de la comunidad.
- El tamaño del repositorio (79,4 GB) obliga a descargar selectivamente subcarpetas concretas, no el conjunto completo.

## Enlaces

- Hugging Face: https://huggingface.co/jiazhe868/qwen-midtrain-checkpoints
- Repositorio del estudio: https://github.com/jiazhe868/qwen-midtrain
- Modelo base Qwen3.5 0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Modelo base Qwen3.5 2B: https://huggingface.co/Qwen/Qwen3.5-2B-Base
