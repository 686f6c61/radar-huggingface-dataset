# francesca9805/nor-latn-100mb-100mb_seed455

## Resumen

`nor-latn-100mb-100mb_seed455` es un modelo de generación de texto en noruego escrito en alfabeto latino, desarrollado por el usuario de Hugging Face francesca9805 (vinculado a la Universidad de Groningen según el proyecto de Weights & Biases asociado). Se trata de un ajuste fino supervisado (SFT) mediante TRL sobre el modelo base `goldfish-models/nor_latn_100mb`, un modelo pequeño de la familia Goldfish orientada a lenguas de bajos recursos. El resultado es un modelo de 124,77 millones de parámetros con arquitectura GPT-2, pensado para tareas de generación de texto y conversación en noruego.

El modelo es relevante en el contexto de la investigación sobre tokenizadores y ajuste fino de modelos pequeños para lenguas minoritarias: el nombre del proyecto de W&B ("new_tokenizers") y el sufijo `seed455` sugieren que forma parte de una batería de experimentos reproducibles con distintas semillas. Su tamaño reducido permite inferencia en hardware modesto, lo que lo hace útil para prototipado rápido, investigación académica y despliegue en entornos con recursos limitados.

La información publicada es escasa: no se detallan volúmenes de entrenamiento, composición del dataset, licencia explícita ni resultados de evaluación. Esta ficha refleja únicamente los datos verificables disponibles en la model card y en los metadatos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 |
| Parametros totales | 124.770.816 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Goldfish de 100 MB suele emplear 1.024 tokens, pero no se confirma en la información proporcionada) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantización estándar vía transformers/bitsandbytes, no documentado por el autor) |
| Idiomas soportados | noruego (código `nor`, escritura latina `latn`), según el nombre del modelo base; no confirmado explícitamente en la model card |
| Licencia | no disponible (la model card indica `licence: license`, sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint `goldfish-models/nor_latn_100mb`, que pertenece a la familia Goldfish: una colección de modelos GPT-2 pequeños entrenados por separado para distintas lenguas y sistemas de escritura, con el objetivo de facilitar investigación y aplicaciones en lenguas de bajos recursos. La arquitectura subyacente es un transformer decoder-only con atención causal completa, sin innovaciones de atención lineal ni mezcla de expertos.

El entrenamiento se realizó mediante SFT (supervised fine-tuning) con TRL 0.23.0, Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1. No se especifica el número de tokens de entrenamiento, la composición del dataset de instrucciones, ni si hubo etapas posteriores de RLHF o DPO. El registro de Weights & Biases está disponible públicamente y podría contener detalles adicionales de la curva de entrenamiento, aunque no se han trasladado a la model card.

## Capacidades

- Generación de texto autoregresiva en noruego (bokmål/nynorsk, según el corpus del modelo base).
- Formato conversacional: la model card muestra un ejemplo con mensajes estructurados `{"role": "user", "content": ...}`, lo que indica que el ajuste SFT incluyó datos de diálogo.
- Generación condicionada por prompt con `max_new_tokens` configurable.
- Compatible con `text-generation-inference` y `endpoints_compatible`, según los tags del repositorio.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe: no documentada; el modelo base está especializado en noruego.

## Casos de uso

- Prototipado de asistentes conversacionales en noruego: el modelo acepta mensajes con rol de usuario y puede generar respuestas multi-turno, adecuado para validar pipelines de diálogo antes de escalar a modelos mayores.
- Investigación sobre tokenizadores y ajuste fino: al estar etiquetado con `new_tokenizers` y una semilla concreta (`seed455`), sirve como punto de comparación reproducible en estudios sobre el impacto del tokenizador en lenguas de bajos recursos.
- Generación de texto sintético para aumento de datos: puede producir frases en noruego para completar corpus pequeños en tareas de clasificación o etiquetado.
- Evaluación de técnicas de SFT con TRL: su tamaño (124,77 M de parámetros) permite ejecutar experimentos completos en una sola GPU consumer, útil para docencia y validación de recetas de entrenamiento.
- Despliegue en entornos con recursos limitados: cabe en GPUs de gama baja o incluso CPU para inferencia por lotes pequeños, lo que facilita demos y servicios internos de bajo coste.
- Baseline para comparativas de modelos noruegos: sirve como referencia inferior en benchmarks internos frente a modelos Goldfish mayores o modelos multilingües como NorBERT o NB-BERT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 500 MB (124,77 M de parámetros × 4 bytes), más overhead de activaciones y KV cache.
- VRAM estimada en fp16/bf16: aproximadamente 250 MB; en cuantización de 8 bits, unos 125 MB; en 4 bits, unos 65 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; RTX 3060, RTX 4090, A100 y H100 funcionan sin problema, aunque el modelo está sobredimensionado para estas últimas.
- Cabe holgadamente en GPUs consumer (GTX 1650, RTX 2060, RTX 3050, etc.) e incluso en CPU para inferencia de baja concurrencia.
- Opciones de despliegue: `transformers` con `pipeline`, `text-generation-inference` (soportado según tags), vLLM, llama.cpp (previa conversión a GGUF) y Ollama (previa conversión).
- Latencia y throughput: no disponibles; por el tamaño, se espera latencia de milisegundos por token en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| francesca9805/nor-latn-100mb-100mb_seed455 | 124,77 M | no disponible | no disponible | Hugging Face |
| goldfish-models/nor_latn_100mb (base) | ~100 M (según nombre) | no disponible | no disponible | Hugging Face |
| NorBERT / NB-BERT (familia noruega) | ~100-180 M | 512 tokens (típico en BERT) | varía por checkpoint | Hugging Face |

La comparación con NorBERT y NB-BERT es solo orientativa: estos son modelos encoder-only para comprensión, mientras que el modelo de esta ficha es decoder-only para generación. No se dispone de datos de rendimiento comparables.

## Limitaciones y advertencias

- Información muy escasa: no se documentan dataset de entrenamiento, número de tokens, hiperparámetros ni evaluación, lo que dificulta evaluar su calidad real.
- Licencia no especificada: la model card indica `licence: license` sin concretar; no se puede garantizar uso comercial sin consultar al autor o al modelo base.
- Riesgo de alucinación: al ser un modelo pequeño entrenado con SFT sobre un corpus limitado, es probable que genere contenido factualmente incorrecto o incoherente en temas especializados.
- Sesgos: no documentados; los modelos pequeños entrenados en corpus web tienden a reproducir sesgos de género, nacionalidad y estereotipos presentes en los datos.
- Cobertura idiomática limitada al noruego; no se garantiza un comportamiento correcto en otros idiomas ni en variantes dialectales.
- Contexto limitado (probablemente 1.024 tokens, herencia de GPT-2), insuficiente para documentos largos o conversaciones extensas.
- Sin soporte documentado de tool calling ni agentes, por lo que no es adecuado para pipelines que requieran invocación de funciones.
- El tamaño del repositorio (26,8 GB) es desproporcionado para 124,77 M de parámetros, lo que sugiere la presencia de checkpoints intermedios u otros artefactos; conviene revisar los archivos antes de descargar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/francesca9805/nor-latn-100mb-100mb_seed455
- Modelo base: https://huggingface.co/goldfish-models/nor_latn_100mb
- Repositorio TRL: https://github.com/huggingface/trl
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new_tokenizers/runs/jqflx44g
