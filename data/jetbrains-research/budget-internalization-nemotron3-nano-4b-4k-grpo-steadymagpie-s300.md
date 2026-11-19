# JetBrains-Research/budget-internalization-nemotron3-nano-4b-4k-grpo-steadymagpie-s300

## Resumen

Este modelo es un ajuste fino por aprendizaje por refuerzo (RL) de `nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16`, desarrollado por JetBrains-Research y publicado bajo el identificador `JetBrains-Research/budget-internalization-nemotron3-nano-4b-4k-grpo-steadymagpie-s300`. El objetivo concreto es el razonamiento matemático bajo un presupuesto de generación fijo de 4.096 tokens: el modelo aprende a internalizar ese límite en lugar de depender del escalado en tiempo de inferencia (test-time scaling) para mejorar su precisión.

El modelo acompaña al artículo *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*, que estudia cómo el RL con recompensa verificable (RLVR) a presupuesto fijo cambia la distribución de longitudes de respuesta y la precisión cuando la generación se trunca. Se trata de un checkpoint intermedio (paso 300) de una ejecución denominada `steadymagpie`, entrenada con GRPO sobre el dataset DeepScaleR (matemáticas) durante un máximo de tres épocas.

Con 3.973.556.832 parámetros (aproximadamente 4B), es un modelo compacto orientado a despliegue en hardware moderado. Su relevancia radica en que aborda un problema práctico de producción: los modelos de razonamiento suelen generar cadenas de pensamiento muy largas y costosas, y este ajuste busca mantener la calidad cuando se impone un techo de tokens estricto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer `nemotron_h` (según tag de Hugging Face; detalles internos no disponibles) |
| Parametros totales | 3.973.556.832 (~4B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el presupuesto de generación entrenado es de 4.096 tokens, no la ventana de contexto) |
| Tipos de cuantizacion | no disponible (pesos publicados en F32) |
| Idiomas soportados | no disponible |
| Licencia | nvidia-nemotron-open-model-license (hereda la del modelo base) |
| Formato de pesos | safetensors (librería transformers, `custom_code`) |

## Arquitectura y entrenamiento

El modelo parte de `nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16`, un transformer de aproximadamente 4B parámetros identificado con la arquitectura `nemotron_h` en las etiquetas del repositorio. No se dispone de información detallada sobre la composición interna (número de capas, dimensión oculta, mecanismos de atención) ni sobre los datos de preentrenamiento del modelo base en la información proporcionada.

El ajuste se realizó con GRPO (Group Relative Policy Optimization) usando baseline leave-one-out, normalización del reward por grupo y pérdida a nivel de token. El presupuesto de generación (`max_new_tokens`) se fijó en 4.096 tokens; las respuestas que alcanzan el límite se truncan y se puntúan tal cual. Los datos son el dataset DeepScaleR (matemáticas) con un máximo de 3 épocas, en lotes de 32 prompts con 8 rollouts por paso, optimizador Adam con schedule coseno, LR pico de 2e-6 y 10 pasos de warmup, durante 300 pasos. La recompensa es binaria según la corrección de la respuesta extraída de las etiquetas `\boxed{}`. El prompt de entrenamiento pide razonamiento paso a paso y la respuesta final dentro de `\boxed{}`.

La innovación principal es la internalización del presupuesto: en lugar de dejar que el modelo genere cadenas arbitrariamente largas y confiar en el escalado en tiempo de inferencia, el RL a presupuesto fijo empuja al modelo a producir razonamientos que caben en 4.096 tokens sin perder precisión (el artículo plantea un intercambio entre ambas estrategias).

## Capacidades

- Generación de texto y razonamiento paso a paso orientado a problemas matemáticos.
- Razonamiento matemático con formato de respuesta final en etiquetas `\boxed{}`.
- Generación bajo presupuesto fijo de tokens (entrenado para 4.096 tokens de salida), con comportamiento adaptado a truncamiento.
- Conversacional: usa la plantilla de chat del modelo base (`text-generation` con `conversational` en las etiquetas).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible (solo se documenta razonamiento matemático de un paso de generación).
- Capacidades multilingües: no disponibles.
- Capacidades especiales (visión, audio, thinking mode explícito): no disponibles.

## Casos de uso

- Resolución de problemas matemáticos con coste acotado: el modelo está entrenado para responder dentro de 4.096 tokens, por lo que encaja en pipelines donde se necesita un techo de latencia y coste por consulta predecible, como corrección automática de ejercicios o generación de soluciones en un tutor educativo.
- Evaluación de modelos de razonamiento bajo restricciones: sirve como referencia para estudiar cómo se comporta un modelo RLVR cuando se le impone un límite estricto de tokens, útil en investigación sobre test-time scaling y eficiencia.
- Generación de soluciones matemáticas verificables: la extracción de la respuesta desde `\boxed{}` permite integrar el modelo en un verificador automático que compare con la solución de referencia, por ejemplo en plataformas de práctica de matemáticas.
- Benchmarking interno de eficiencia: al ser un checkpoint de 300 pasos sobre un base de 4B, permite medir el impacto del RL a presupuesto fijo frente al modelo base en tareas de matemáticas, con un coste de despliegue bajo.
- Prototipado de asistentes de razonamiento en hardware consumer: con ~4B parámetros, es viable en GPUs de gama alta de consumo para experimentos de investigación y demos, siempre que se valide la calidad en el dominio objetivo.
- Filtrado y generación de datos sintéticos de matemáticas: puede usarse para producir cadenas de razonamiento acotadas en longitud que luego se filtran por corrección, reduciendo el coste de generación frente a modelos que razonan sin límite.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa basada en el tamaño (3,97B parámetros), en F32 los pesos ocupan unos 15,9 GB (tamaño del repo); en BF16 unos 8 GB; en cuantizaciones de 8 bits unos 4 GB y en 4 bits unos 2-3 GB, sin contar caché KV ni overhead del runtime. Estas cifras son estimaciones por tamaño, no datos publicados por el autor.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cabría en GPUs con 16-24 GB de VRAM en BF16 y en GPUs consumer de 8-12 GB con cuantización, pero no hay validación oficial.
- Cabe en GPU consumer: probablemente sí con cuantización, aunque no se confirma en la información disponible.
- Opciones de despliegue: `transformers` (librería declarada, con `custom_code` para la arquitectura `nemotron_h`); otras opciones como vLLM, llama.cpp, Ollama o TGI no están documentadas para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| budget-internalization-nemotron3-nano-4b-4k-grpo-steadymagpie-s300 | ~4B | no disponible (presupuesto de generación 4.096) | GRPO sobre DeepScaleR, 300 pasos | nvidia-nemotron-open-model-license | Hugging Face, 0 descargas |
| nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16 (base) | ~4B | no disponible | Preentrenamiento + post-entrenamiento de NVIDIA (no detallado) | nvidia-nemotron-open-model-license | Hugging Face |
| Alternativas de ~4B para razonamiento matemático | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint intermedio (paso 300) de una ejecución de investigación; no se presenta como un modelo final optimizado para producción.
- El entrenamiento se limita a matemáticas (DeepScaleR) y a un presupuesto de 4.096 tokens; el rendimiento fuera de ese dominio y de ese límite no está documentado.
- Las respuestas que alcanzan el presupuesto se truncan y se puntúan tal cual durante el entrenamiento, lo que puede producir respuestas incompletas en inferencia si se supera el límite.
- Riesgo de alucinación: no evaluado en la información disponible; como modelo de razonamiento matemático, puede generar cadenas plausibles con resultados incorrectos.
- Sesgos conocidos: no disponibles.
- Idiomas soportados: no disponibles; no se garantiza un buen comportamiento en castellano.
- Licencia: hereda la `nvidia-nemotron-open-model-license` del modelo base; es una licencia "other", por lo que deben revisarse sus términos antes de cualquier uso comercial.
- El repositorio tiene 0 descargas y 0 likes, y la model card marca la citación como "TODO"; se trata de un artefacto de investigación reciente y poco validado por la comunidad.
- Pesos publicados en F32 (repo de 15,9 GB), lo que incrementa los requisitos de almacenamiento y memoria frente a una versión BF16.
- La arquitectura requiere `custom_code` en `transformers`, lo que puede complicar la integración con otros runtimes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JetBrains-Research/budget-internalization-nemotron3-nano-4b-4k-grpo-steadymagpie-s300
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16
- Dataset de entrenamiento: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Licencia: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
- Artículo citado: *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy* (sin enlace disponible en la información proporcionada)
