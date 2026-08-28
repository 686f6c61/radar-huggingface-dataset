# nikitastheo/v4-babylm-srp-ell-sequential_interleaved

## Resumen

El modelo `nikitastheo/v4-babylm-srp-ell-sequential_interleaved` es un modelo de lenguaje causal (causal LM) basado en la arquitectura GPT-2, desarrollado por nikitastheo como parte de la iniciativa BabyLM, que busca entrenar modelos de lenguaje con cantidades limitadas de datos (del orden de 10 millones de palabras) para estudiar la eficiencia del aprendizaje. Con 108,55 millones de parámetros, es un modelo de tamaño pequeño-medio, diseñado para investigación y experimentación en entornos con recursos computacionales reducidos.

El modelo se entrenó con un script personalizado de Hugging Face Accelerate (sin usar `Trainer`), con un tokenizer específico (`nikitastheo/babylm-vocab15-srp-tokenizer`) y un esquema de entrenamiento que alterna idiomas (probablemente serbio y griego, según las siglas "srp" y "ell" en el nombre). Aunque no se especifica la licencia ni los idiomas soportados en la ficha de HuggingFace, el nombre sugiere un enfoque multilingüe. Su relevancia radica en ser un punto de referencia para evaluar cómo los modelos pequeños pueden aprender con datos limitados, un área activa en la investigación de eficiencia y sostenibilidad en IA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder causal) |
| Parametros totales | 108.550.656 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (probablemente 1024, pero no confirmado) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible (el nombre sugiere serbio y griego, sin confirmar) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-2 estándar: un transformer decoder con atención causal, sin capas de mezcla de expertos (MoE) ni mecanismos híbridos. El entrenamiento se realizó con un script de Hugging Face Accelerate (`train_clm.py`), con una configuración base definida en `model_configs/gpt_base_config.json`. Se usó un tokenizer con vocabulario de 15.000 tokens (`babylm-vocab15-srp-tokenizer`), lo que reduce el tamaño de la tabla de embeddings en comparación con tokenizers más grandes.

El proceso de entrenamiento incluyó 24.610 pasos máximos, con una tasa de aprendizaje de 0,0001, scheduler lineal y 2.461 pasos de warmup. El tamaño de lote por dispositivo fue de 32, sin acumulación de gradientes. Un detalle destacable es el "language switch epoch" de 10, lo que sugiere que el entrenamiento alterna entre dos idiomas (probablemente serbio y griego) en intervalos de épocas, una técnica de interleaving secuencial para el aprendizaje multilingüe. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; es un modelo de lenguaje puramente causal entrenado con pérdida de entropía cruzada estándar.

## Capacidades

- Generación de texto autoregresivo: el modelo produce texto continuando un prompt dado, con coherencia local limitada por su tamaño y datos de entrenamiento.
- Modelado de lenguaje causal: puede calcular la probabilidad de secuencias, útil para tareas de perplejidad o evaluación de fluidez.
- Multilingüismo potencial: el nombre del modelo y el esquema de entrenamiento sugieren que maneja al menos dos idiomas (serbio y griego), aunque no se han publicado evaluaciones específicas.
- Fine-tuning: al ser un modelo pequeño y de arquitectura estándar, es fácilmente adaptable a tareas downstream mediante fine-tuning con Hugging Face Transformers.
- No dispone de capacidades especiales como tool calling, visión, audio o modo de razonamiento explícito.

## Casos de uso

- Investigación en eficiencia de datos: el modelo sirve como baseline para estudiar cuánto puede aprender un transformer con corpus limitados (BabyLM), comparando arquitecturas y estrategias de entrenamiento.
- Evaluación de tokenizers multilingües: al usar un tokenizer de 15k tokens, es útil para analizar el impacto del vocabulario en el rendimiento para lenguas de bajos recursos.
- Fine-tuning para tareas de clasificación de texto: su tamaño reducido permite ajustarlo en una sola GPU para tareas como análisis de sentimiento o detección de temas en serbio o griego.
- Prototipado rápido de aplicaciones de generación de texto: por su bajo coste de inferencia, puede integrarse en demos o pruebas de concepto donde no se requiere alta calidad.
- Educación y experimentación: es un modelo adecuado para enseñar conceptos de transformers y entrenamiento de LLMs en cursos, dado que cabe en hardware modesto.
- Comparación de estrategias de interleaving multilingüe: el esquema de "language switch" puede replicarse o modificarse para estudiar el efecto del orden de los idiomas en el aprendizaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. El modelo pertenece a la iniciativa BabyLM, que tiene su propio conjunto de evaluaciones (BLiMP, etc.), pero no se han compartido resultados específicos para esta versión.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, el modelo ocupa aproximadamente 434 MB (108M parámetros × 4 bytes). En fp16, ~217 MB. Con cuantización a 8 bits, ~109 MB. Cabe en cualquier GPU con al menos 1 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna (NVIDIA GTX 1060 6GB, RTX 2060, RTX 3060, etc.) es suficiente. Incluso puede ejecutarse en CPU con razonable velocidad.
- Despliegue: compatible con Hugging Face Transformers, vLLM (aunque para este tamaño puede ser excesivo), llama.cpp (si se convierte a GGUF), Ollama (si se empaqueta), y Text Generation Inference (TGI) según las etiquetas del repo.
- Latencia y throughput: al ser un modelo pequeño, la generación es rápida; en una GPU moderna se pueden obtener cientos de tokens por segundo, aunque no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| nikitastheo/v4-babylm-srp-ell-sequential_interleaved | 108M | no disponible | no disponible | Entrenado en BabyLM, multilingüe (srp/ell) |
| GPT-2 small (124M) | 124M | 1024 | MIT | Modelo original de OpenAI, entrenado en WebText |
| BabyLM baselines (GPT-2 small) | ~124M | 1024 | MIT | Baselines oficiales de BabyLM, entrenados en datos estrictos |

No se dispone de benchmarks comparativos entre estos modelos en la información proporcionada. La comparación se limita a características arquitectónicas y de entrenamiento.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un modelo pequeño entrenado con un corpus limitado (BabyLM), su conocimiento general es muy restringido y es propenso a generar contenido incoherente o factualmente incorrecto.
- Limitaciones de idioma: aunque el nombre sugiere serbio y griego, no hay confirmación oficial de los idiomas soportados ni de su calidad en cada uno. Puede tener un rendimiento desigual entre ellos.
- Licencia no especificada: no se indica la licencia en la ficha de HuggingFace, lo que impide conocer las restricciones de uso comercial o modificación. Se recomienda contactar al autor antes de usarlo en producción.
- Contexto limitado: la longitud de contexto no está documentada; si sigue la configuración estándar de GPT-2, sería 1024 tokens, pero no se garantiza.
- Sin alineación: no se aplicaron técnicas de RLHF o DPO, por lo que el modelo puede generar contenido ofensivo o inapropiado si se le provoca.
- No apto para producción: su tamaño y datos de entrenamiento lo hacen inadecuado para aplicaciones comerciales que requieran calidad y fiabilidad.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/nikitastheo/v4-babylm-srp-ell-sequential_interleaved)
- [Versión v2 del mismo autor](https://huggingface.co/nikitastheo/v2-babylm-srp-ell-sequential_interleaved)
- [Versión v2-small](https://huggingface.co/nikitastheo/v2-babylm-small-srp-ell-sequential_interleaved)
- [Página en Friendli.ai para despliegue](https://friendli.ai/models/nikitastheo/babylm-spa-ell-sequential_interleaved)
- [Documentación de BabyLM eval (DeepWiki)](https://deepwiki.com/babylm-org/babylm-eval/5-baseline-models-and-reference-results)
