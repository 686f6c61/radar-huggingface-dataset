# CharlieChen/loop-operator-1-d20

## Resumen

loop-operator-1-d20 es un modelo de lenguaje base de tipo *looped transformer* publicado por el usuario CharlieChen en HuggingFace. Corresponde al checkpoint final del operador 1 en la coordenada de profundidad d20 dentro del trabajo «How Model Growth, Recursion, and Boundary Operators Influence Scaling Exponents», y forma parte de la escalera de escalado (*scaling ladder*) entrenada sobre el corpus FineWeb. Almacena 1.843.527.680 parámetros en FP32 (7,374 GB), con una anchura de 2.560, 20 cabezas de atención y una longitud de contexto de 2.048 tokens.

Se trata de un artefacto de investigación: es un modelo preentrenado sin ajuste por instrucciones (no hay SFT, RLHF ni DPO), no conserva el estado del optimizador para reanudar el entrenamiento y no es un checkpoint de tipo `AutoModel` de Transformers, sino una clase propia (`TransformerGPT`) que se reconstruye con el código del paper. El tokenizador es el de GPT-2 vía `tiktoken`, con 50.257 tokens de vocabulario ampliados a 50.304 filas en el modelo, y el único idioma declarado es el inglés.

Su relevancia es fundamentalmente metodológica: permite reproducir y auditar la escalera de escalado del paper, estudiar los exponentes de escalado en función de la profundidad, la recursión y los operadores de frontera, y servir como punto de partida controlado para experimentos de *fine-tuning* o *continual pretraining* sobre un modelo base de ~1,8B entrenado en FineWeb. La métrica registrada por el autor es una NLL de validación de preentrenamiento de 2,637315 nats/token; no se han publicado resultados de benchmarks estándar en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con profundidad en modo `loop` (*looped transformer*); reconstruido por el código del paper mediante la clase `TransformerGPT`, no es un `AutoModel` de Transformers |
| Parámetros totales | 1.843.527.680 (almacenados en FP32) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantización | no disponible (el repositorio solo publica el checkpoint en FP32; no se distribuyen versiones GGUF, int8 ni int4) |
| Idiomas soportados | inglés (etiqueta `en`) |
| Licencia | no disponible |
| Formato de pesos | PyTorch nativo (`final.pt`); no hay safetensors ni GGUF |
| Anchura (d_model) | 2.560 |
| Cabezas de atención | 20 |
| Vocabulario | 50.257 tokens (tokenizador GPT-2 vía `tiktoken.get_encoding("gpt2")`), ampliado a 50.304 filas en el modelo |
| Modo de profundidad | `loop`; repeticiones del núcleo configuradas: 1; repeticiones en la evaluación final: 1 |
| Corpus de entrenamiento | HuggingFaceFW/fineweb |
| NLL de validación (preentrenamiento) | 2,637315 nats/token |
| Precisión del checkpoint | FP32 (7,374 GB) |
| Tamaño del repositorio | 7,4 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación (HuggingFace) | 2026-09-16 |

## Arquitectura y entrenamiento

El modelo es un transformer con profundidad parametrizada en modo `loop`. La coordenada de profundidad d20 es la coordenada de escalado de la escalera del paper y, según advierte el propio autor, no tiene por qué coincidir con el número de bloques Transformer ejecutados; en este checkpoint la repetición del núcleo configurada y la empleada en la evaluación final es 1. El paper estudia cómo el crecimiento del modelo (*model growth*), la recursión y los operadores de frontera influyen en los exponentes de escalado, de modo que este checkpoint debe interpretarse como un punto concreto de una familia de modelos, no como una arquitectura aislada. Un cálculo aproximado a partir de los parámetros publicados y de una anchura de 2.560 es coherente con del orden de 20 bloques, pero el dato exacto no se indica en la información disponible.

El entrenamiento se realizó sobre el corpus FineWeb, íntegramente en inglés, con el tokenizador de GPT-2. No hay información sobre el número de tokens procesados, la composición detallada del dataset, el filtrado aplicado ni la receta de optimización. El autor indica que el paper usa GPUs H100, FlashAttention-3 y autocast en bfloat16. No hubo RLHF, DPO ni ajuste por instrucciones: es un modelo base. El checkpoint conserva los pesos aprendidos y los argumentos de entrenamiento, pero no el estado del optimizador, por lo que no está pensado para reanudar el entrenamiento. La validación se mide sobre el corpus de preentrenamiento y el autor subraya que esa NLL es distinta de la NLL de respuestas del *suite* CORE, cuya evaluación completa consta de 22 tareas con semillas 0/1/2.

## Capacidades

- Generación de texto autoregresiva en inglés: es un modelo base, por lo que su tarea nativa es la predicción del siguiente token y la compleción de texto.
- No dispone de ajuste por instrucciones: no sigue instrucciones, no hay plantilla de chat documentada ni modo conversacional.
- Tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; al ser un modelo base sin ajuste, no hay evidencia publicada de estas capacidades.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma declarada.
- Capacidad especial: la profundidad recursiva (*loop*) y su papel en los exponentes de escalado, que es el objeto de estudio del paper.
- Evaluación integrada: el codebase del paper permite ejecutar el *suite* CORE de 22 tareas (con semillas 0/1/2) y una evaluación de humo acotada con `--max-per-task`.
- Sin visión, audio ni modo de razonamiento explícito (*thinking mode*): no disponible.

## Casos de uso

- Reproducción de la escalera de escalado: el checkpoint es el artefacto original con el que se generó el punto d20 de la escalera de FineWeb, por lo que sirve para replicar las curvas del paper y verificar los exponentes de escalado publicados.
- Estudio de profundidad recursiva: comparar este punto con otros checkpoints de la misma escalera permite aislar el efecto del crecimiento, la recursión y los operadores de frontera sobre la pérdida, algo que no se puede hacer con modelos base convencionales de tamaño similar.
- Evaluación CORE controlada: ejecutando `eval.py` sobre las 22 tareas y las tres semillas se obtiene una medida estandarizada del modelo; la evaluación de humo con `--max-per-task 10` sirve para validar el entorno antes de lanzar la evaluación completa en GPU.
- Punto de partida para *fine-tuning* supervisado: al ser un base model de ~1,84B con contexto de 2.048 tokens, es un candidato razonable para experimentos de ajuste en inglés donde se quiera partir de un preentrenamiento con receta conocida y corpus documentado (FineWeb).
- *Continual pretraining* sobre dominios concretos en inglés: el checkpoint permite seguir entrenando con datos de un dominio específico y medir la deriva respecto a la NLL de validación original de 2,637315 nats/token.
- Investigación sobre leyes de escalado y eficiencia de parámetros: al separar la coordenada de profundidad del número de bloques ejecutados, el modelo permite estudiar si la recursión ofrece una vía más eficiente en parámetros que el aumento de profundidad explícita.
- Análisis de sesgos y memorización en modelos base: al estar entrenado sobre FineWeb (contenido web en inglés), es un sujeto de estudio útil para auditar qué sesgos y qué memorización aparecen antes de cualquier ajuste por instrucciones.
- Docencia y experimentación en entornos académicos: el codebase propio, el tamaño moderado (7,4 GB en FP32) y la disponibilidad del `result.json` con la configuración completa facilitan su uso en cursos y prácticas de investigación sobre transformers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El único dato numérico registrado por el autor es la NLL de validación de preentrenamiento, que no es un benchmark estándar y no es comparable con las métricas del *suite* CORE:

| Métrica | Valor | Nota |
|---|---|---|
| NLL de validación (preentrenamiento) | 2,637315 nats/token | Medida sobre el corpus de preentrenamiento (FineWeb); distinta de la NLL de respuestas de CORE |
| CORE (22 tareas, semillas 0/1/2) | no disponible | El paper usa el codebase `cue-engineering/loop`; los resultados de la evaluación de humo no equivalen a los resultados completos del paper |
| MMLU, HumanEval, GSM8K, etc. | no disponible | No publicados en la información proporcionada |

## Requisitos de hardware

- Pesos en FP32 (formato publicado): 7,374 GB solo de pesos. Con activaciones y caché KV, se estima un consumo del orden de 9-11 GB para lotes pequeños (estimación derivada del recuento de parámetros, no un dato publicado).
- Pesos convertidos a bfloat16: ~3,7 GB (estimación). A int8: ~1,8 GB (estimación). A int4: ~0,9 GB (estimación). Ninguna de estas conversiones se distribuye en el repositorio.
- Caché KV: en bfloat16 y para los 2.048 tokens de contexto, del orden de 0,4 GB asumiendo atención multi-cabeza con 20 capas y 20 cabezas de 128 dimensiones (estimación; el número exacto de capas no está publicado).
- GPU del paper: H100, con FlashAttention-3 y autocast en bfloat16.
- GPU de consumo: en FP32 cabe con holgura en tarjetas de 24 GB (RTX 3090, RTX 4090) y de forma ajustada en tarjetas de 12 GB (RTX 3060 12 GB, RTX 4070 Ti 12 GB). En bf16 podría ejecutarse en GPUs de 8-10 GB si se convierte el checkpoint, algo que no se proporciona.
- GPU profesionales: A100 40/80 GB, H100 80 GB, L40S. Para la evaluación CORE completa de 22 tareas y tres semillas se recomienda una GPU de datacenter por tiempo de cómputo.
- Opciones de despliegue: no compatibles directamente con vLLM, TGI, llama.cpp, Ollama o text-generation-webui, porque el artefacto no es un checkpoint `AutoModel` y requiere la clase `TransformerGPT` del repositorio del paper. El único camino documentado es el codebase `cue-engineering/loop` (por ejemplo, `python eval.py --checkpoint ... --result-json ...`).
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia; el autor solo indica el hardware y el esquema de precisión empleados en el paper.

## Comparativa con modelos similares

La información proporcionada no incluye datos de rendimiento de modelos alternativos, por lo que la comparación cuantitativa no está disponible. La categoría natural de comparación son los demás checkpoints de la misma escalera de FineWeb del paper, cuyas métricas tampoco se detallan en el material recibido.

| Modelo | Parámetros | Contexto | Licencia | Formato de pesos | Rendimiento publicado |
|---|---|---|---|---|---|
| loop-operator-1-d20 | 1.843.527.680 (FP32) | 2.048 | no disponible | PyTorch (`final.pt`) | NLL de validación 2,637315 nats/token |
| Otros checkpoints de la escalera del paper | no disponible | no disponible | no disponible | no disponible | no disponible |
| Modelos base de ~1,8-2B de otras familias | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no disponible: no puede asumirse permiso de uso comercial. Cualquier uso en producción requiere contactar previamente con el autor.
- Modelo base sin ajuste por instrucciones: no sigue órdenes, no mantiene formato conversacional y no incluye plantilla de chat.
- Solo inglés: no hay soporte declarado para otros idiomas, lo que limita su uso en entornos hispanohablantes sin entrenamiento adicional.
- Contexto corto: 2.048 tokens, insuficiente para tareas de documento largo o conversaciones extensas.
- Incompatibilidad de herramientas: al no ser un checkpoint `AutoModel` y no existir safetensors ni GGUF, no funciona de forma directa con vLLM, TGI, llama.cpp, Ollama ni con las utilidades estándar de `transformers`. Sin el codebase del paper el checkpoint no es utilizable.
- Sin estado del optimizador: aunque se conservan los argumentos de entrenamiento, no se puede reanudar el entrenamiento desde el punto exacto sin reinicializar el optimizador.
- Riesgo de alucinación: como todo modelo de lenguaje base, puede generar contenido plausible pero falso, especialmente al no estar ajustado para tareas de respuesta a preguntas.
- Sesgos: el entrenamiento sobre FineWeb (contenido web en inglés) implica exposición a los sesgos, estereotipos y ruido propios de los datos de rastreo web. No se documenta ningún filtrado ni mitigación adicional.
- Riesgo de memorización de contenido web, dado el origen del corpus y la ausencia de información sobre deduplicación.
- Trazabilidad limitada: el repositorio tiene 0 descargas y 0 likes, no hay validación por parte de la comunidad y no se publican resultados de benchmarks estándar.
- Métrica no comparable: la NLL de 2,637315 nats/token se mide sobre el corpus de preentrenamiento y no debe compararse con la NLL de respuestas de CORE ni con métricas de benchmarks.
- Los resultados de la evaluación de humo (`--max-per-task`) no son resultados equivalentes a los del paper; para obtener cifras comparables hay que ejecutar las 22 tareas con las semillas 0/1/2.
- Fecha de creación declarada en HuggingFace: 2026-09-16.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CharlieChen/loop-operator-1-d20
- Codebase de evaluación del paper: https://github.com/cue-engineering/loop
- Dataset de entrenamiento (FineWeb): https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Paper: «How Model Growth, Recursion, and Boundary Operators Influence Scaling Exponents»; no se proporciona URL en la información disponible.
- Los resultados de la búsqueda web no aportaron enlaces adicionales: únicamente devolvieron páginas genéricas del buscador, sin relación con el modelo.
