# BurnyCoder/recursive-judge-grpo-adapters

## Resumen

Recursive judge GRPO adapters es una colección de adaptadores LoRA (PEFT) entrenados sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct. El autor, BurnyCoder, los publica como artefactos de un estudio sobre aprendizaje por refuerzo con GRPO (Group Relative Policy Optimization) aplicado a un esquema de "juez recursivo" (verificador del verificador). El repositorio no contiene pesos completos, sino adaptadores por rol almacenados bajo `runs/RUN_ID`, pensados para cargarse encima del modelo base en la revisión `989aa7980e4cf806f80c7fef2b1adb7bc71aa306`.

El modelo base, Qwen2.5-1.5B-Instruct, es un transformer decoder-only de 1.500 millones de parámetros desarrollado por Alibaba Qwen, con una ventana de contexto de 32.768 tokens y entrenamiento de instrucciones multilingüe. Los adaptadores heredan esa arquitectura y esa ventana, y añaden un ajuste específico orientado a tareas de evaluación y verificación de respuestas generadas por otros modelos.

La relevancia de esta ficha es acotada: se trata de un artefacto de investigación con cero descargas y cero likes en el momento de la consulta, sin model card detallada ni resultados de benchmarks publicados en la información disponible. Su interés principal es metodológico (GRPO sobre un juez recursivo con un modelo pequeño) más que práctico para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-1.5B-Instruct); adaptadores LoRA sobre el modelo base |
| Parametros totales | 1.500 millones en el modelo base; parámetros del adaptador no disponibles |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base Qwen2.5-1.5B-Instruct) |
| Tipos de cuantizacion | No disponible en la información proporcionada; el modelo base admite cuantizaciones estándar (GGUF, AWQ, GPTQ) en otros repositorios |
| Idiomas soportados | No disponible en la información proporcionada; el modelo base Qwen2.5 es multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | Adaptadores PEFT (LoRA); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer decoder-only de tipo Qwen2 con 1.500 millones de parámetros, atención con RoPE y ventana de contexto de 32.768 tokens. Sobre él se aplican adaptadores LoRA de bajo rango (el rango y el alpha no se especifican en la información disponible), organizados por rol y almacenados en subdirectorios `runs/RUN_ID`. El autor fija explícitamente la revisión del modelo base (`989aa7980e4cf806f80c7fef2b1adb7bc71aa306`), lo que sugiere que la reproducibilidad del entrenamiento depende de esa instantánea concreta.

El entrenamiento utiliza GRPO, un algoritmo de optimización de política sin modelo crítico separado que estima ventajas relativas dentro de grupos de muestras. Según la documentación enlazada, el estudio se apoya en un esquema de "juez recursivo": un modelo evalúa las respuestas de otro y ese juicio se verifica a su vez. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas adicionales de DPO o RLHF más allá del propio GRPO. El autor remite a un repositorio de GitHub (matriz de ejecuciones y evaluación) y a un dataset de Hugging Face con datos crudos, logs y paper para obtener esos detalles.

## Capacidades

- Generación de texto y razonamiento de instrucciones heredados de Qwen2.5-1.5B-Instruct.
- Evaluación y verificación de respuestas: el ajuste GRPO está orientado a tareas de juicio (juzgar respuestas y juzgar al juez), según el nombre y la descripción del repositorio.
- Soporte multilingüe: no confirmado para los adaptadores; el modelo base Qwen2.5 es multilingüe, pero el ajuste puede haber reducido ese alcance.
- Tool calling y function calling: no confirmado para los adaptadores; el modelo base Qwen2.5-Instruct lo soporta.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la información disponible.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Investigación en RL para LLM: reproducir el estudio de GRPO con juez recursivo cargando los adaptadores sobre la revisión exacta del modelo base indicada por el autor. Es el uso principal y el único documentado explícitamente.
- Evaluación automática de respuestas generadas: usar los adaptadores de rol "juez" para puntuar salidas de modelos más grandes en pipelines de evaluación interna, aprovechando el bajo coste de un modelo de 1.500 millones de parámetros.
- Verificación de verificadores: experimentar con el esquema recursivo (juez que evalúa a otro juez) para estudiar sesgos y deriva en sistemas de recompensa aprendidos.
- Prototipado de reward models ligeros: servir como punto de partida para ajustar un modelo de recompensa de bajo coste en entornos con GPU consumer.
- Docencia y divulgación: ilustrar el funcionamiento de GRPO y de los adaptadores PEFT con un caso reproducible y de tamaño manejable.
- Experimentos de alineación a pequeña escala: comparar el comportamiento de un modelo de 1.500 millones con y sin adaptadores en tareas de juicio, con fines de análisis metodológico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor remite a la matriz de ejecuciones y evaluación del repositorio de GitHub y al dataset del estudio, pero no se incluyen cifras (MMLU, HumanEval, GSM8K ni métricas específicas de juicio) en la model card ni en los metadatos consultados.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, el modelo base de 1.500 millones de parámetros requiere aproximadamente 3 GB de VRAM solo para los pesos, más overhead de activaciones y caché KV; con cuantización de 8 bits, alrededor de 2 GB; con 4 bits, alrededor de 1 GB. Los adaptadores LoRA añaden un consumo marginal.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 con contexto moderado; RTX 3060, RTX 4060, RTX 4090, A10, L4, A100 y H100 son válidas.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas con 8 GB o más; con cuantización, en GPUs de 6 GB.
- Opciones de despliegue: transformers + PEFT para cargar los adaptadores; vLLM y TGI admiten adaptadores LoRA; llama.cpp y Ollama requieren fusionar previamente el adaptador con el modelo base.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Recursive judge GRPO adapters (sobre Qwen2.5-1.5B-Instruct) | 1.500 M (base) | 32.768 | Adaptador LoRA de investigación | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen2.5-1.5B-Instruct | 1.500 M | 32.768 | Modelo instructivo completo | Apache 2.0 | Hugging Face, ampliamente usado |
| Qwen2.5-0.5B-Instruct | 500 M | 32.768 | Modelo instructivo completo | Apache 2.0 | Hugging Face |
| SmolLM2-1.7B-Instruct | 1.700 M | 8.192 | Modelo instructivo completo | Apache 2.0 | Hugging Face |

La comparación relevante es contra el propio modelo base sin adaptadores: los adaptadores no añaden parámetros significativos ni cambian la arquitectura, solo el comportamiento en tareas de juicio. Frente a alternativas completas del mismo tamaño, la diferencia está en el propósito (investigación en RL) y en la ausencia de benchmarks publicados.

## Limitaciones y advertencias

- Artefacto de investigación: cero descargas y cero likes en el momento de la consulta, sin validación externa conocida.
- Ausencia de benchmarks: no hay métricas publicadas en la model card que permitan estimar su calidad frente al modelo base.
- Dependencia de una revisión concreta del modelo base: cargar los adaptadores sobre otra revisión de Qwen2.5-1.5B-Instruct puede degradar el comportamiento.
- Idiomas soportados no documentados: el ajuste puede haber reducido el alcance multilingüe del modelo base.
- Riesgo de alucinación: inherente a un modelo de 1.500 millones de parámetros; el ajuste a tareas de juicio no lo elimina y puede amplificarlo si el juez aprende atajos.
- Sesgos: no documentados; se heredan los del modelo base y los del dataset de entrenamiento del estudio.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; el uso en producción requeriría una evaluación propia.
- Sin pipeline declarado ni demo: no hay endpoint de inferencia ni Space asociado.
- Caveat de producción: no se recomienda desplegar estos adaptadores en sistemas de evaluación automática críticos sin una validación independiente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/BurnyCoder/recursive-judge-grpo-adapters
- Dataset del estudio (datos crudos, logs y paper): https://huggingface.co/datasets/BurnyCoder/recursive-judge-grpo-study
- Repositorio GitHub (estudio, matriz de ejecuciones y evaluación): https://github.com/BurnyCoder/verifying-verifier-s-verifier-llm-reinforcement-learning
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
