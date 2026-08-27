# OmAhire369/safe-genai-dpo-full

## Resumen

El modelo `safe-genai-dpo-full` es un ajuste fino de `gpt2-medium` mediante Direct Preference Optimization (DPO) con actualización completa de todos los parámetros. Ha sido desarrollado por OmAhire369 como parte de un estudio comparativo entre PPO y DPO para la alineación de seguridad en modelos de lenguaje. El objetivo es modificar el estilo y la seguridad de las respuestas ante prompts que puedan inducir contenido dañino o estereotipado, utilizando 4000 pares de preferencia del dataset Cultural Kaleidoscope.

Con 354,8 millones de parámetros, este modelo es una variante de investigación que demuestra cómo la alineación por preferencias puede aplicarse sobre una base pequeña y sin instrucciones. No está pensado para producción, sino para analizar el efecto de la estrategia de fine-tuning completo frente a otras (prefix, LoRA, QLoRA) dentro del mismo estudio. Su relevancia radica en ser un ejemplo reproducible de alineación con DPO a pequeña escala, con licencia MIT y pesos en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (GPT-2 medium) |
| Parametros totales | 354.823.168 (354,82 M) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `gpt2-medium`, un transformer decoder causal con 24 capas, 1024 dimensiones de embedding y 16 cabezas de atención. Sobre esta base se aplica DPO, un método de optimización directa de preferencias que evita entrenar un modelo de recompensa explícito durante el ajuste, utilizando en su lugar pares de respuestas preferidas y rechazadas. El entrenamiento se realizó con fine-tuning completo, es decir, todos los parámetros fueron actualizados, lo que supone un 100% de parámetros entrenables.

El dataset de preferencias empleado es Cultural Kaleidoscope, con 4000 pares de entrenamiento. El proceso duró 2745,66 segundos y alcanzó un pico de uso de GPU de 10173 MB. No se especifican detalles sobre el número de épocas, la tasa de aprendizaje ni la composición exacta del dataset. Tampoco se menciona el uso de técnicas adicionales como RLHF clásico o DPO con variantes.

## Capacidades

- Generación de texto autoregresiva, heredada de GPT-2 medium.
- Alineación de seguridad: respuestas más cautelosas ante prompts que pueden inducir contenido dañino o estereotipado, según el entrenamiento con preferencias.
- No soporta tool calling, ni razonamiento multi-paso, ni visión, ni audio.
- No tiene modo de pensamiento explícito ni capacidades de agente.
- Multilingüismo limitado: al estar basado en GPT-2 medium, su idioma principal es el inglés, aunque no se especifica en la documentación.

## Casos de uso

- Investigación en alineación de modelos: permite comparar el efecto de DPO con fine-tuning completo frente a otras estrategias (prefix, LoRA, QLoRA) en un entorno controlado y reproducible.
- Estudio de sesgos y seguridad en modelos pequeños: útil para analizar cómo cambia el estilo de respuesta ante prompts estereotipados o dañinos, sin los costes de entrenar modelos grandes.
- Desarrollo de pipelines de preferencia learning: sirve como punto de partida para experimentar con datasets de preferencias y métricas de evaluación de seguridad.
- Educación y formación en RLHF/DPO: al ser un modelo pequeño y con licencia MIT, puede usarse en cursos o talleres para ilustrar el flujo de trabajo de alineación.
- Pruebas de concepto en entornos con recursos limitados: su tamaño reducido permite ejecutarlo en hardware modesto, facilitando experimentos rápidos.
- Benchmarking de métodos de alineación: puede integrarse en suites de evaluación que comparen DPO, PPO y otras variantes sobre la misma base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona un archivo `training_meta.json` con resultados, pero su contenido no se ha incluido en la documentación proporcionada. Por tanto, no se dispone de métricas como MMLU, HumanEval o GSM8K para este modelo.

## Requisitos de hardware

- Inferencia: al ser un modelo de 354 M parámetros, requiere aproximadamente 1,4 GB de memoria en FP16 (según el tamaño del repositorio). Se puede ejecutar en GPUs consumer como RTX 3060, RTX 4060 o incluso en CPU con suficiente RAM.
- Entrenamiento: el pico de GPU registrado fue de 10173 MB, por lo que se necesitó una GPU con al menos 12 GB de VRAM (por ejemplo, RTX 3080, RTX 4070, o una A10).
- Despliegue: compatible con la librería `transformers` de Hugging Face, y puede servirse con herramientas como vLLM, TGI o llama.cpp si se convierte a GGUF, aunque no se proporcionan instrucciones específicas.
- Latencia y throughput: no se han publicado datos oficiales. En una GPU moderna, la generación de 64 tokens debería completarse en menos de un segundo, pero es una estimación no confirmada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia, el modelo base `gpt2-medium` tiene las mismas características arquitectónicas pero sin el ajuste de alineación. Otros modelos de alineación como `gpt2-medium` con RLHF o variantes de DPO podrían ser comparables, pero no se han encontrado datos concretos en la búsqueda web.

## Limitaciones y advertencias

- El modelo base `gpt2-medium` es pequeño y antiguo, sin ajuste por instrucciones; la alineación solo modifica el estilo y la seguridad, no la factualidad ni la utilidad general.
- No es adecuado para producción: puede generar contenido incoherente o incorrecto, y no está diseñado para tareas complejas.
- El modelo de recompensa (implícito en el proceso DPO) hereda los sesgos de anotación del dataset Cultural Kaleidoscope, por lo que no debe tratarse como un clasificador de seguridad general.
- No se especifican restricciones de uso comercial más allá de la licencia MIT, que permite uso comercial con atribución.
- La longitud de contexto no se ha documentado; se asume la de GPT-2 medium (1024 tokens), pero no está confirmada en la ficha.
- No se han proporcionado datos sobre cuantizaciones, por lo que el despliegue en formatos como GGUF o AWQ requeriría conversión manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OmAhire369/safe-genai-dpo-full
- Modelo base: https://huggingface.co/gpt2-medium
- Modelo relacionado (reward): https://huggingface.co/OmAhire369/safe-genai-reward-full
- Perfil del autor: https://huggingface.co/OmAhire369/models
