# kushasareen/qwen35-9b-ft-a400

## Resumen

kushasareen/qwen35-9b-ft-a400 es un ajuste fino (fine-tune) del modelo Qwen/Qwen3.5-9B, desarrollado por el usuario kushasareen y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un checkpoint intermedio resultante de un entrenamiento con refuerzo (reinforcement learning) mediante el algoritmo CISPO (un método de optimización de política con importancia muestreada) sobre el conjunto de datos openmath_hard, con un contexto de entrenamiento de 16k tokens. El modelo conserva la arquitectura multimodal image-text-to-text del modelo base, con 9.409.813.744 parámetros totales.

El modelo se presenta como el paso 400 de un experimento denominado `up_om_cispo_q359b_async_4gpu_sc`, ejecutado con un solo agente y centrado de puntuaciones (score centering). Su relevancia es limitada: se trata de un artefacto de investigación con solo 12 descargas y 0 likes en el momento de la consulta, sin model card detallada ni resultados de evaluación publicados. Resulta útil principalmente como referencia para quienes investigan en RL aplicado a modelos Qwen3.5 o para reproducir el pipeline de entrenamiento, no como modelo listo para producción.

La información disponible es escasa: no se especifican idiomas soportados, composición del dataset de entrenamiento más allá de openmath_hard, ni detalles sobre el proceso de alineación. La ficha se completa con los datos disponibles y se indica explícitamente "no disponible" donde falta información.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal image-text-to-text (hereda de Qwen3.5-9B; detalles internos no disponibles) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (entrenamiento con contexto de 16k tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del Qwen/Qwen3.5-9B, por lo que hereda la arquitectura del modelo base: un transformer multimodal capaz de procesar entradas image-text-to-text (según el tag `image-text-to-text` del repositorio). No se dispone de información detallada sobre el número de capas, dimensión oculta, mecanismo de atención ni innovaciones específicas del modelo base en la información proporcionada.

El entrenamiento consistió en un proceso de reinforcement learning con el algoritmo CISPO durante 400 pasos de optimización, sobre el dataset openmath_hard, con un contexto de 16k tokens, un solo agente y centrado de puntuaciones. El experimento se ejecutó en 4 GPUs de forma asíncrona (según el identificador `async_4gpu_sc`). No se especifica el número total de tokens de entrenamiento, la composición completa del dataset ni si hubo fases previas de SFT o DPO. El checkpoint corresponde al paso 400 y se guardó tal cual por el trainer, con pesos, configuración y tokenizador.

## Capacidades

- Generación de texto y razonamiento matemático: el entrenamiento con RL sobre openmath_hard sugiere especialización en resolución de problemas matemáticos, aunque no se han publicado evaluaciones que lo confirmen.
- Procesamiento multimodal image-text-to-text: heredado del modelo base Qwen3.5-9B, según el tag del repositorio.
- Carga mediante `AutoModelForCausalLM.from_pretrained` con la librería transformers.
- Soporte de tool calling / function calling: no disponible (no se menciona en la información).
- Soporte de agentes y razonamiento multi-paso: el entrenamiento se realizó con "one agent", lo que sugiere un escenario de agente único, pero no se detallan capacidades agénticas específicas.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, audio, etc.): no disponible.

## Casos de uso

- Investigación en reinforcement learning: el checkpoint permite reproducir o analizar el efecto del algoritmo CISPO sobre Qwen3.5-9B en tareas de matemáticas, comparando el paso 400 con el modelo base.
- Experimentación con ajuste fino multimodal: sirve como punto de partida para quienes quieran continuar el entrenamiento con RL sobre otros datasets, gracias a que se publican pesos, config y tokenizador.
- Evaluación de técnicas de centrado de puntuaciones: el identificador `sc` (score centering) indica que el modelo es útil para estudiar el impacto de esta técnica en la estabilidad del entrenamiento con RL.
- Generación de soluciones matemáticas paso a paso: dado el entrenamiento sobre openmath_hard, puede emplearse en pruebas exploratorias de resolución de problemas matemáticos, siempre con validación humana.
- Baseline para comparativas de fine-tuning: investigadores pueden usar este checkpoint como referencia frente a otros fine-tunes del mismo modelo base.
- Reproducción de pipelines asíncronos multi-GPU: el modelo documenta un experimento con 4 GPUs asíncronas, útil para quienes diseñen infraestructuras de entrenamiento RL distribuidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9.409.813.744 parámetros, en precisión FP16 se requieren aproximadamente 18,8 GB solo para los pesos; en BF16, similar. En cuantización de 8 bits, unos 9,4 GB; en 4 bits, unos 4,7 GB (estimaciones teóricas, no confirmadas por el autor).
- GPU recomendadas: para FP16/BF16, una A100 de 40 GB o 80 GB, H100, o varias RTX 4090 (24 GB) con paralelismo. Para cuantización 4 bits, una RTX 4090 o RTX 3090 de 24 GB podría ser suficiente para los pesos, aunque el contexto de 16k incrementa el uso de memoria KV.
- ¿Cabe en consumer GPU? En cuantización 4 bits sí cabría en GPUs de 24 GB (RTX 3090, 4090); en FP16 no cabe en una sola consumer GPU de 24 GB.
- Opciones de despliegue: transformers (según la model card, con `AutoModelForCausalLM.from_pretrained`). No se confirma soporte de vLLM, llama.cpp, Ollama o TGI; al ser un checkpoint de trainer sin cuantizaciones publicadas, la opción documentada es transformers.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| kushasareen/qwen35-9b-ft-a400 | 9,41 B | no disponible (entrenado a 16k) | Apache 2.0 | Hugging Face, 12 descargas | Fine-tune RL (CISPO, 400 pasos) sobre openmath_hard |
| Qwen/Qwen3.5-9B | 9 B (aprox.) | no disponible | no disponible | Hugging Face (modelo base) | Modelo base multimodal image-text-to-text |
| Otros fine-tunes de Qwen3.5-9B | variable | variable | variable | Hugging Face | No se dispone de datos específicos de alternativas en la información proporcionada |

No se dispone de información suficiente para comparar rendimiento (benchmarks) con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo de investigación con escasa validación: solo 12 descargas y 0 likes, sin benchmarks ni evaluaciones publicadas; no se recomienda para producción sin una evaluación exhaustiva propia.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar contenido plausible pero incorrecto, especialmente en matemáticas si no se valida.
- Sesgos conocidos: no disponibles; al no documentarse la composición del dataset ni el proceso de alineación, no se pueden evaluar sesgos.
- Limitaciones de contexto e idioma: no se especifican idiomas soportados ni longitud de contexto final; el entrenamiento usó 16k tokens, pero el modelo base podría soportar otra longitud.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-9B podría tener sus propias condiciones; conviene verificar la licencia del modelo base antes de un uso comercial.
- Checkpoint intermedio: corresponde al paso 400 de un entrenamiento, no necesariamente al mejor checkpoint; puede presentar inestabilidades propias de un estado intermedio de RL.
- Sin cuantizaciones publicadas: no hay versiones GGUF, AWQ ni GPTQ, lo que limita el despliegue en hardware de consumo sin trabajo adicional.

## Enlaces

- Hugging Face: https://huggingface.co/kushasareen/qwen35-9b-ft-a400
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
