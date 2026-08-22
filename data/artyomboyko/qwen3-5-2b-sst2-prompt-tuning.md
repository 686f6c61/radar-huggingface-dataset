# artyomboyko/qwen3.5-2b-sst2-prompt-tuning

## Resumen

`artyomboyko/qwen3.5-2b-sst2-prompt-tuning` es un adaptador PEFT de prompt tuning construido sobre el modelo base `Qwen/Qwen3.5-2B-Base` de Alibaba Cloud, especializado en clasificación binaria de sentimiento sobre el dataset Stanford SST-2. El autor, artyomboyko, lo presenta como un ejemplo educativo y reproducible de adaptación eficiente de parámetros: solo se entrenan 32.768 parámetros (los embeddings de 16 tokens virtuales) mientras que los 1.881 millones de parámetros del modelo base permanecen congelados.

El adaptador convierte la tarea de clasificación en una tarea de generación de texto: dado un prompt fijo con una reseña de película, el modelo debe generar la etiqueta `positive` o `negative`. En la partición de validación completa de SST-2 (872 ejemplos) alcanza una precisión del 94,38%, frente al 3,10% del modelo base sin adaptar bajo el mismo formato de generación. Su relevancia radica en demostrar que el prompt tuning puede lograr resultados competitivos en clasificación con un coste de entrenamiento mínimo, sin modificar los pesos del modelo base.

El adaptador requiere el modelo base `Qwen/Qwen3.5-2B-Base` para la inferencia, ya que no es un modelo completo. La licencia es Apache-2.0 y está pensado como material educativo y reproducible, no como una solución de producción sin evaluación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (Qwen3.5-2B-Base) + adaptador prompt tuning |
| Parametros totales | 1.881.857.856 (incluye base congelado) |
| Parametros activos | 32.768 entrenables (0,001741% del total); no es MoE |
| Longitud de contexto | 262.144 tokens (del modelo base Qwen3.5-2B) |
| Tipos de cuantizacion | no disponible (entrenado en BF16; el adaptador usa safetensors) |
| Idiomas soportados | en (ingles; el adaptador esta especializado en SST-2) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador emplea la tecnica de prompt tuning descrita por Lester et al. (2021): se anaden 16 tokens virtuales al prompt del modelo base, cuyos embeddings son los unicos parametros entrenables. El modelo base `Qwen/Qwen3.5-2B-Base` es un transformer causal denso de 2.000 millones de parametros con soporte de contexto largo (262.144 tokens) y arquitectura Qwen3.5, que integra entrenamiento multimodal temprano y mejoras en razonamiento e instruction following respecto a Qwen3.

El entrenamiento se realizo sobre 4.000 ejemplos del dataset `stanfordnlp/sst2` (no el split completo), durante 3 epocas, con una tasa de aprendizaje de 0,03, warmup del 5%, tamaño de lote de 16 por dispositivo y una longitud maxima de secuencia de 128 tokens. Se utilizo precision BF16 y una NVIDIA GeForce RTX 5090. El prompt de inicializacion es `Classify the sentiment of the movie review as positive or negative.` y el formato exacto del prompt es:

```
Classify the sentiment of this movie review as positive or negative.
Review: <SST-2 sentence>
Sentiment:
```

La clasificacion se implementa como generacion causal de texto, no mediante una cabeza de clasificacion dedicada. La prediccion se considera correcta solo si la salida generada se puede parsear como exactamente una de las etiquetas (`positive` o `negative`) y coincide con la etiqueta de referencia.

## Capacidades

- Clasificacion binaria de sentimiento en ingles sobre el formato SST-2 (etiquetas `positive` / `negative`).
- Generacion de texto causal: el adaptador produce la etiqueta como continuacion del prompt.
- Soporte de tool calling y function calling: no disponible en este adaptador especifico (el modelo base Qwen3.5 podria soportarlo, pero no se ha verificado con este adaptador).
- Soporte de agentes y multi-step reasoning: no disponible en este adaptador; el modelo base Qwen3.5-2B es capaz, pero el adaptador esta limitado a la tarea de clasificacion.
- Capacidades multilingues: no aplicable; el adaptador esta entrenado solo en ingles y para SST-2.
- Capacidades especiales: ninguna adicional; no incluye vision, audio ni modo thinking. El modelo base Qwen3.5-2B si es multimodal, pero el adaptador no lo aprovecha.

## Casos de uso

- Clasificacion de opiniones en criticas de peliculas: el adaptador puede etiquetar automaticamente reseñas de cine como positivas o negativas, ideal para prototipos de analisis de sentimiento en plataformas de contenido.
- Educacion y experimentacion con PEFT: sirve como ejemplo reproducible de prompt tuning sobre un modelo de 2B de parametros, con hiperparametros y codigo documentados.
- Benchmark de clasificacion de sentimiento en investigacion: puede usarse como baseline de referencia para comparar tecnicas de adaptacion eficiente en SST-2.
- Prototipado rapido de sistemas de moderacion de comentarios: aunque esta limitado a SST-2, el formato de generacion se puede adaptar con otros prompts para evaluar rapidamente la viabilidad del enfoque.
- Integracion en pipelines de NLP con transformers y PEFT: el adaptador se carga con `PeftModel` y `AutoModelForCausalLM`, facilitando su integracion en flujos existentes.
- Ensayo de tecnicas de few-shot learning: al entrenarse con solo 4.000 ejemplos, permite estudiar el impacto del tamano del dataset en el rendimiento del prompt tuning.

## Benchmarks y rendimiento

Segun los resultados declarados por el autor en el model-index (verificacion no confirmada), la evaluacion se realizo sobre la particion de validacion completa de SST-2 (872 ejemplos):

| Metrica | Modelo base (Qwen3.5-2B) | Adaptador prompt-tuned |
|---|---:|---:|
| Precisión basada en generacion | 3,10% | **94,38%** |
| Tasa de salida con etiqueta valida | 3,10% | **100,00%** |
| Ejemplos evaluados | 872 | 872 |

La precision del modelo base (3,10%) no debe interpretarse como una medida general de las capacidades de Qwen3.5, sino como su rendimiento zero-shot bajo este formato de generacion especifico. No se han publicado resultados en otros benchmarks (MMLU, HumanEval, GSM8K, etc.) para este adaptador.

## Requisitos de hardware

- VRAM estimada: el modelo base Qwen3.5-2B en BF16 ocupa aproximadamente 4 GB de VRAM; el adaptador anade unos pocos KB extra. Con cuantizacion de 8 bits o 4 bits (no verificada para este adaptador) podria reducirse a 2-3 GB.
- GPU recomendadas: el entrenamiento se realizo en una NVIDIA RTX 5090 (32 GB). Para inferencia, cualquier GPU consumer con al menos 4 GB de VRAM (RTX 3060, RTX 4060, etc.) es suficiente en BF16.
- Compatibilidad con GPUs consumer: si, cabe en la mayoria de GPUs consumer modernas.
- Opciones de despliegue: se puede usar con transformers y PEFT en Python; el adaptador no esta empaquetado para llama.cpp, Ollama o TGI, pero el modelo base Qwen3.5-2B si tiene soporte en Ollama y LM Studio.
- Latencia y throughput: no se han publicado mediciones especificas para este adaptador. Con un modelo de 2B en una GPU moderna, la generacion de 4 tokens por ejemplo deberia ser del orden de milisegundos.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros adaptadores de clasificacion de sentimiento en SST-2. Se puede comparar con el modelo base sin adaptar y con enfoques alternativos de clasificacion:

| Modelo | Parametros | Contexto | Rendimiento (SST-2) | Licencia |
|---|---|---|---|---|
| Qwen3.5-2B-Base + prompt tuning (este adaptador) | 32.768 entrenables / 1.881.857.856 totales | 262.144 | 94,38% (generacion) | Apache-2.0 |
| Qwen3.5-2B-Base (sin adaptar) | 1.881.857.856 | 262.144 | 3,10% (formato de generacion) | Apache-2.0 |
| DistilBERT-base-uncased (fine-tuning clasico) | 66.955.008 | 512 | no disponible en la informacion | Apache-2.0 |
| RoBERTa-base (fine-tuning clasico) | 124.645.632 | 512 | no disponible en la informacion | MIT |

Nota: los resultados de DistilBERT y RoBERTa no se han verificado en esta ficha; se incluyen como referencia de modelos clasicos de clasificacion de sentimiento.

## Limitaciones y advertencias

- Especializado exclusivamente en SST-2 en ingles; no generaliza a otros dominios o idiomas sin reentrenamiento.
- Entrenado con solo 4.000 ejemplos, no el split completo de SST-2, lo que puede limitar la robustez frente a variaciones del texto.
- La clasificacion se implementa como generacion de texto causal, no con una cabeza de clasificacion dedicada; esto puede producir salidas no parseables en casos fuera de distribucion.
- El adaptador requiere el modelo base `Qwen/Qwen3.5-2B-Base`; no es un modelo autonomo.
- Los tokens virtuales son embeddings opacos, no instrucciones legibles; la interpretabilidad del prompt es limitada.
- Los resultados son especificos del dataset, formato de prompt, hiperparametros y semilla aleatoria (42); no se garantiza la generalizacion a otros dominios.
- No se han evaluado sesgos ni riesgos de alucinacion especificos de este adaptador; al ser un clasificador de sentimiento, el riesgo de alucinacion es bajo, pero el modelo base puede generar contenido imprevisible si el prompt se altera.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda una evaluacion adicional antes de usar en produccion.

## Enlaces

- [Adaptador en HuggingFace](https://huggingface.co/artyomboyko/qwen3.5-2b-sst2-prompt-tuning)
- [Modelo base Qwen3.5-2B-Base en HuggingFace](https://huggingface.co/Qwen/Qwen3.5-2B-Base)
- [Dataset Stanford SST-2](https://huggingface.co/datasets/stanfordnlp/sst2)
- [Documentacion de PEFT de Hugging Face](https://huggingface.co/docs/peft/)
- [Lester et al., The Power of Scale for Parameter-Efficient Prompt Tuning (2021)](https://arxiv.org/abs/2104.08691)
- [Pagina de Qwen3.5-2B en Qualcomm AI Hub](https://aihub.qualcomm.com/models/qwen3_5_2b)
- [Pagina de Qwen3.5-2B en LM Studio](https://lmstudio.ai/models/qwen/qwen3.5-2b)
- [Pagina de Qwen3.5-2B en Ollama](https://ollama.com/library/qwen3.5:2b)
