# open-zzrl/Qwen3.5-9B-Trace-Inversion

## Resumen

Qwen3.5-9B-Trace-Inversion es un ajuste fino completo del modelo Qwen/Qwen3.5-9B, desarrollado por el usuario open-zzrl y publicado en Hugging Face bajo licencia Apache 2.0. Su particularidad es que no está entrenado para resolver problemas desde cero, sino para actuar como generador de razonamiento: recibe un problema junto con su respuesta final correcta y reconstruye la cadena de pensamiento paso a paso que conecta ambos, usando las etiquetas nativas `` de la familia Qwen.

El modelo resuelve un problema concreto en el ecosistema del entrenamiento de modelos: la generación de trazas de razonamiento sintéticas y de alta calidad para destilación y aumento de datos. En lugar de depender de modelos enormes y costosos para producir cadenas de pensamiento, este modelo de 9.400 millones de parámetros permite generar trazas de razonamiento a partir de pares pregunta-respuesta ya existentes en un dataset, lo que facilita la destilación de capacidades de razonamiento hacia arquitecturas más pequeñas.

Técnicamente es un transformer denso de 9.409.813.744 parámetros, distribuido en formato safetensors de 16 bits (BF16) con un tamaño de repositorio de 18,8 GB. El ajuste se realizó con Unsloth sobre 932 ejemplos del dataset Trace-Inversion-1K-Preview durante 2 épocas con una longitud máxima de secuencia de 8192 tokens. Está orientado exclusivamente al inglés y su relevancia actual radica en su utilidad como herramienta de generación de datos sintéticos de razonamiento en pipelines de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8192 tokens (longitud máxima de secuencia usada en entrenamiento) |
| Tipos de cuantizacion | No disponible (pesos publicados en BF16) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16, modelo completamente fusionado) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer denso de la familia Qwen3.5, y se ha ajustado mediante un fine-tuning completo (fully merged) en lugar de mediante adaptadores LoRA separados, de modo que los pesos publicados son los definitivos y se pueden cargar directamente con `transformers`. El entrenamiento se realizó con el framework Unsloth, durante 2 épocas, sobre el dataset Trace-Inversion-1K-Preview, compuesto por 932 ejemplos, con una longitud máxima de secuencia de 8192 tokens y en precisión de 16 bits (BF16).

La innovación principal no reside en la arquitectura, sino en la tarea de entrenamiento: la inversión de trazas. El modelo aprende a recibir un par formado por una pregunta y su respuesta final conocida, y a producir la cadena de razonamiento intermedia etiquetada con `` que justifica esa respuesta. El dataset y el modelo emplean las etiquetas nativas de razonamiento de Qwen. No se dispone de información sobre la composición detallada del dataset, el número total de tokens de entrenamiento ni sobre si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de trazas de razonamiento paso a paso a partir de un problema y su respuesta final conocida, usando las etiquetas ``.
- Razonamiento matemático avanzado, incluyendo problemas de nivel universitario como la aplicación de la fórmula de Legendre.
- Razonamiento algorítmico y lógico, con capacidad de manejar estructuras como la técnica de dos punteros (Two Pointers).
- Generación de código y razonamiento asociado a problemas de programación.
- Generación de datos sintéticos de chain-of-thought para aumento de datasets.
- Destilación de capacidades de razonamiento desde modelos de mayor tamaño hacia arquitecturas de 9B.
- Clonación de comportamiento (behavioral cloning) para enseñar a modelos pequeños a estructurar su razonamiento antes de responder.
- No soporta tool calling ni function calling de forma documentada.
- No se documenta soporte de agentes ni de razonamiento multi-paso autónomo más allá de la generación de la traza.
- Capacidad multilingüe limitada: el modelo está entrenado y orientado exclusivamente al inglés.

## Casos de uso

- Generación de datos sintéticos de razonamiento para entrenamiento: dado un dataset existente de pares pregunta-respuesta, el modelo produce las trazas de chain-of-thought correspondientes, que se pueden usar para entrenar modelos más pequeños con supervisión de razonamiento.
- Destilación de modelos grandes: se pueden tomar las respuestas correctas de modelos como DeepSeek o Claude sobre un conjunto de problemas y usar este modelo de 9B para reconstruir las trazas de razonamiento, reduciendo el coste frente a generar todo el razonamiento con el modelo grande.
- Aumento de datasets de matemáticas: para problemas de competición o de nivel universitario con solución conocida, el modelo genera la justificación paso a paso que enriquece el dataset original.
- Aumento de datasets de código: a partir de problemas de programación y sus soluciones verificadas, el modelo reconstruye el razonamiento algorítmico que lleva a la solución, útil para entrenar modelos de código con explicaciones.
- Clonación de comportamiento en modelos pequeños: las trazas generadas se emplean para enseñar a modelos de menor tamaño a estructurar sus pensamientos antes de responder, con mejor retención lógica que los modelos más pequeños por sí solos.
- Investigación sobre razonamiento: permite estudiar cómo se estructuran las cadenas de pensamiento en modelos de 9B y comparar la calidad de las trazas generadas frente a las de modelos mayores.
- Construcción de pipelines de evaluación de razonamiento: al generar trazas para problemas con respuesta conocida, se pueden analizar los pasos intermedios y detectar errores lógicos que una simple comprobación de la respuesta final no revelaría.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor advierte explícitamente de que no se debe evaluar el modelo en benchmarks estándar como AIME, MATH-500 o HumanEval, ya que estos formaron parte de los datos de entrenamiento y las puntuaciones serían artificialmente altas por memorización de las trazas, no por generalización.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 18,8 GB solo para los pesos, más el espacio para el contexto y las activaciones, por lo que se recomienda un mínimo de 24 GB de VRAM.
- GPU recomendadas para BF16: A100 (40 o 80 GB), H100, o GPUs consumer de gama alta con 24 GB o más, como la RTX 4090 o la RTX 3090.
- En GPUs consumer: cabe en una RTX 4090 o RTX 3090 en BF16 con contexto moderado; en GPUs con menos VRAM sería necesaria cuantización, aunque el repositorio solo publica pesos en BF16.
- Opciones de despliegue: la model card documenta el uso directo con `transformers` y `AutoModelForCausalLM`; no se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI.
- Nota crítica de despliegue: es necesario fijar explícitamente `eos_token_id` al token `<|im_end|>` para evitar bucles infinitos de generación de dicho token, tal como advierte el autor.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-Trace-Inversion | 9,4B | 8192 tokens | Inversión de trazas de razonamiento | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-9B (base) | 9,4B | No disponible | Modelo generalista | No disponible | Hugging Face |
| Predecesor de 4B del mismo autor | No disponible | No disponible | Inversión de trazas de razonamiento | No disponible | No disponible |

El autor menciona un predecesor de 4B parámetros del que este modelo de 9B es una versión significativamente más capaz, pero no se proporcionan sus especificaciones ni su identificador en la información disponible. La comparación con el modelo base Qwen3.5-9B es directa en cuanto a arquitectura y tamaño, pero no se dispone de datos de rendimiento comparativos.

## Limitaciones y advertencias

- No debe evaluarse en benchmarks estándar (AIME, MATH-500, HumanEval): formaron parte del entrenamiento y las puntuaciones reflejan memorización, no generalización.
- No es un solucionador de propósito general: espera recibir la respuesta final en el prompt; si se le pide resolver un problema sin proporcionar la respuesta, es probable que falle.
- Puede cometer errores en problemas combinatorios especialmente complicados, como doble conteo o saltos lógicos.
- Está orientado exclusivamente al inglés; no se documenta soporte para otros idiomas.
- Requiere configuración explícita de `eos_token_id` para evitar bucles infinitos de `<|im_end|>` en la generación.
- El contexto documentado es de 8192 tokens, correspondiente a la longitud máxima de secuencia de entrenamiento; no se garantiza un comportamiento correcto más allá de esa longitud.
- Licencia Apache 2.0, que permite uso comercial, pero el modelo hereda los sesgos y limitaciones del modelo base Qwen3.5-9B, sobre los que no se proporciona información específica.
- Riesgo de alucinación en la traza generada: la cadena de razonamiento puede parecer coherente sin justificar realmente la respuesta proporcionada, especialmente en problemas complejos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/open-zzrl/Qwen3.5-9B-Trace-Inversion
- Dataset de entrenamiento: https://huggingface.co/datasets/open-zzrl/Trace-Inversion-1K-Preview
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Demo interactiva en Kaggle: https://www.kaggle.com/code/jqs141/qwen3-5-trace-inversion-demo
