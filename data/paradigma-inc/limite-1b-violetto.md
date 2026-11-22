# paradigma-inc/limite-1b-violetto

## Resumen

Limite 1B - Violetto es el primer modelo publicado por Paradigma (paradigma-inc), un transformer autorregresivo denso de aproximadamente 1.035 millones de parámetros (1B) entrenado desde cero sobre una mezcla de menos de 300B de tokens altamente curados. Está diseñado específicamente para el razonamiento matemático de alta throughput, es decir, para resolver problemas matemáticos difíciles con un coste computacional muy contenido. El modelo admite secuencias de hasta 131k tokens de contexto y se distribuye con licencia Apache 2.0 en formato safetensors.

Su relevancia actual radica en la eficiencia de muestra: según la model card, el modelo alcanza resultados en matemáticas de nivel competición que, según el autor, rivalizan con modelos decenas de veces más grandes entrenados con órdenes de magnitud más FLOPs. El autor cita un promedio de 74,25% en BeyondAIME frente al 70% de MUSE-Glimmer-30B. La arquitectura está fuertemente inspirada en los avances recientes de la comunidad en competiciones de speedrun de preentrenamiento, e incluye código de arquitectura personalizado (`custom_code`), lo que obliga a usar `trust_remote_code=True` al cargarlo con Transformers.

El modelo se presenta como un checkpoint de texto orientado a matemáticas y razonamiento, servible mediante un plugin propio de vLLM y también mediante las APIs estándar de Transformers. No se declaran idiomas soportados en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo denso (código de arquitectura personalizado, `custom_code`); inspirado en técnicas de speedrun de preentrenamiento; soporta atención SDPA y FlashAttention 2 con `DynamicCache`/`StaticCache` |
| Parametros totales | 1.035.253.888 (~1B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | hasta 131k tokens |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones oficiales en la información proporcionada) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 2,1 GB); incluye tokenizer y `generation_config.json` |

## Arquitectura y entrenamiento

Limite 1B - Violetto es un transformer denso autorregresivo de ~1B parámetros, entrenado desde cero sobre una mezcla de menos de 300B tokens "altamente curados". El autor indica que la alta eficiencia de muestra se consigue combinando la curación de datos con una arquitectura fuertemente inspirada en los avances recientes de la comunidad en competiciones de speedrun de preentrenamiento. El modelo base, según la model card, ya obtiene buenos resultados en benchmarks matemáticos con few-shot prompting.

El post-entrenamiento combina generación de datos sintéticos, SFT curado y RL, lo que permite alcanzar resultados de nivel competición en matemáticas. El repositorio incluye código de arquitectura personalizado que se descarga desde el propio repo de Hugging Face, por lo que la carga requiere `trust_remote_code=True`. La implementación de Transformers soporta una réplica completa del modelo por proceso y no soporta sharding automático ni tensor/pipeline parallelism; para servir en producción con continuous batching y scheduling multi-GPU se proporciona un plugin de vLLM (validado con Python 3.12, vLLM 0.26.0, PyTorch 2.11.0 con CUDA 13.0 y Transformers 5.6.2). La configuración de muestreo recomendada es `temperature=0.6` y `top_p=0.95`.

## Capacidades

- Generación de texto y razonamiento matemático de nivel competición (problemas tipo AIME, HMMT, APEX, BeyondAIME).
- Razonamiento multi-paso orientado a la resolución de problemas difíciles.
- Modo conversacional mediante plantilla de chat (`apply_chat_template`).
- Manejo de contextos largos de hasta 131k tokens.
- Inferencia de alta throughput mediante plugin de vLLM (continuous batching y scheduling multi-GPU).
- Compatibilidad con las APIs estándar de Transformers (`AutoModelForCausalLM`, `AutoTokenizer`).
- Tool calling / function calling: no disponible (no documentado en la información proporcionada).
- Capacidades de agentes: no disponible (no documentado).
- Visión, audio o thinking mode explícito: no disponible (no documentado).
- Capacidades multilingües: no disponible (no se declaran idiomas).

## Casos de uso

- Resolución automatizada de problemas matemáticos de competición: el modelo está entrenado específicamente para problemas tipo AIME/HMMT/APEX y puede usarse como motor de resolución en pipelines de evaluación o generación de soluciones paso a paso.
- Generación de datasets matemáticos sintéticos: dado su enfoque en eficiencia de muestra y datos sintéticos, puede emplearse para producir problemas y soluciones razonadas que alimenten procesos de destilación o aumento de datos.
- Verificación y tutoría matemática interactiva: con su plantilla de chat y contexto de 131k tokens, puede gestionar conversaciones multi-turno en las que se presenta un enunciado largo y se itera sobre la solución.
- Serving de alta throughput en entornos con GPU limitadas: al ser un modelo de ~1B parámetros, el plugin de vLLM permite atender muchas peticiones concurrentes con continuous batching, adecuado para APIs de resolución matemática a escala.
- Integración en pipelines de CI/CD para validación de soluciones: puede usarse como componente de comprobación automática de respuestas matemáticas en flujos de test, siempre que se valide su fiabilidad con conjuntos de referencia.
- Investigación en eficiencia de entrenamiento: al estar entrenado con menos de 300B tokens y técnicas de speedrun, sirve como referencia para estudiar eficiencia de muestra y recetas de post-entrenamiento (SFT + RL) en modelos pequeños.
- Despliegue en GPUs de consumo para prototipado: con ~1B parámetros y pesos safetensors de 2,1 GB, es viable en GPUs de consumo para experimentación local mediante Transformers (una réplica por proceso).

## Benchmarks y rendimiento

La model card cita un promedio de 74,25% en BeyondAIME, frente al 70% de MUSE-Glimmer-30B. El autor indica que la tabla completa de evaluaciones (siete benchmarks matemáticos, incluidos AIME 2026, HMMT February 2026, APEX Shortlist y BeyondAIME) está publicada como imagen en el repositorio (`assets/evaluations.png`) y en el blog de lanzamiento. Los resultados de terceros marcados con † proceden de model cards o de MathArena y no fueron reevaluados por el equipo; los guiones indican resultados no reportados y "n.d." indica recuento de parámetros no divulgado. Las configuraciones de evaluación pueden diferir entre modelos y fuentes.

| Benchmark | Limite 1B - Violetto | Referencia citada |
|---|---|---|
| BeyondAIME (promedio) | 74,25% | MUSE-Glimmer-30B: 70% |
| AIME 2026 | no disponible en el texto | no disponible |
| HMMT February 2026 | no disponible en el texto | no disponible |
| APEX Shortlist | no disponible en el texto | no disponible |
| Resto de benchmarks (tabla de 7) | no disponible en el texto (publicado como imagen) | no disponible |

No se han publicado en la información disponible resultados numéricos de MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con ~1.035M parámetros y pesos safetensors de 2,1 GB, la inferencia en precisión nativa requiere del orden de varios GB de VRAM (pesos más caché KV), pero no se documentan cifras oficiales.
- GPU recomendadas: la model card valida Transformers en NVIDIA H100; el plugin de vLLM requiere Linux x86-64, GPU NVIDIA y driver compatible con CUDA 13.0.
- GPU de consumo: por tamaño (~1B parámetros) es plausible en GPUs de consumo, pero no se confirma oficialmente en la información disponible.
- Opciones de despliegue: vLLM mediante el plugin oficial (`VLLM_PLUGINS=limite vllm serve paradigma-inc/limite-1b-violetto`); Transformers con `trust_remote_code=True` y `attn_implementation="sdpa"` (o FlashAttention 2 con `DynamicCache`). `llama.cpp`, Ollama y TGI no se mencionan como soportados.
- Paralelismo: en vLLM, mantener tensor y pipeline parallel sizes en 1. En Transformers, una réplica completa por proceso; para multi-GPU offline se pueden lanzar réplicas independientes con `device_map={"": local_rank}`.
- Latencia y throughput: no disponible (no se publican cifras en la información proporcionada).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento matemático | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Limite 1B - Violetto | ~1B (denso) | 131k | 74,25% promedio en BeyondAIME (dato del autor) | apache-2.0 | Hugging Face + plugin vLLM |
| MUSE-Glimmer-30B | 30B (según nombre) | no disponible | 70% en BeyondAIME (dato citado por el autor) | no disponible | no disponible |
| Modelos de referencia de la tabla de evaluación | mixto ("n.d." en algunos casos) | no disponible | publicado como imagen en el repo | no disponible | no disponible |

La comparativa detallada con AIME 2026, HMMT February 2026 y APEX Shortlist está publicada como imagen (`assets/evaluations.png`) y no se transcribe numéricamente en la información disponible. No se dispone de datos suficientes para comparar con alternativas de código abierto de tamaño similar en esta ficha.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible (no documentados en la información proporcionada).
- Riesgo de alucinación: no cuantificado oficialmente; en modelos de razonamiento matemático pequeño, la verificación de soluciones sigue siendo necesaria antes de uso en producción.
- Limitaciones de contexto e idioma: se declara contexto de hasta 131k tokens, pero no se declaran idiomas soportados; el enfoque declarado es matemáticas y razonamiento, no tareas generales.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar los términos del plugin de vLLM y del código de arquitectura personalizado distribuido en el repo.
- Carga con Transformers: requiere `trust_remote_code=True`, lo que implica ejecutar código remoto; auditar el código antes de desplegar en producción.
- Paralelismo: Transformers no soporta sharding ni tensor/pipeline parallelism; para serving multi-GPU y continuous batching es necesario el plugin de vLLM.
- Compatibilidad: validado en H100 con Python 3.12, PyTorch 2.11.0 (CUDA 13.0) y Transformers 5.6.2; otras combinaciones no están formalmente cualificadas. FlashAttention 2 con `StaticCache` no está soportado y se rechaza explícitamente.
- Benchmarks: parte de los resultados comparativos proceden de terceros (MathArena o model cards) y no fueron reevaluados; las configuraciones de evaluación pueden diferir, por lo que las comparaciones no son estrictamente homogéneas.
- Datos no publicados: no hay resultados oficiales de benchmarks generales (MMLU, HumanEval, GSM8K) ni de latencia/throughput en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/paradigma-inc/limite-1b-violetto
- Informe técnico (arXiv): https://arxiv.org/abs/2611.21646
- GitHub y plugin de vLLM: https://github.com/paradigma-inc/limite-violetto
- Blog de lanzamiento: https://paradigma.inc/blog/limite-1b-violetto/
- Configuración de generación: https://huggingface.co/paradigma-inc/limite-1b-violetto/blob/main/generation_config.json
- README del plugin (quickstart): https://github.com/paradigma-inc/limite-violetto#quickstart
