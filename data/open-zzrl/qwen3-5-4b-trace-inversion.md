# open-zzrl/Qwen3.5-4B-Trace-Inversion

## Resumen

Qwen3.5-4B-Trace-Inversion es un ajuste fino completo (fully merged, sin adaptadores) del modelo base Qwen/Qwen3.5-4B, publicado por el usuario open-zzrl bajo licencia Apache 2.0. El modelo no está diseñado para resolver problemas desde cero, sino para actuar como generador de razonamiento: recibe un problema junto con su respuesta final correcta y reconstruye la traza de pensamiento (`<think>...</think>`) que conecta ambos. Esta técnica, denominada Trace Inversion por el autor, convierte al modelo en una herramienta de destilación y aumento de datos para generar cadenas de razonamiento sintéticas.

El modelo cuenta con 4.659.865.088 parámetros (aproximadamente 4,66 mil millones) en formato BF16, con un tamaño de repositorio de 9,8 GB. Está entrenado sobre el dataset Trace-Inversion-1K-Preview (932 ejemplos), durante 2 épocas y con una longitud máxima de secuencia de 8192 tokens. Su relevancia actual reside en la posibilidad de destilar capacidades de razonamiento de modelos grandes hacia arquitecturas de 4B, y en la generación de trazas de Chain-of-Thought para aumentar datasets existentes.

El modelo hereda la arquitectura y el tokenizador de Qwen3.5-4B, e incorpora las etiquetas nativas `<think>` y `</think>` de la familia Qwen. Está orientado exclusivamente al inglés y su uso previsto es la generación de texto conversacional con modo de razonamiento explícito. No es un solver de propósito general: requiere que la respuesta se proporcione en el prompt.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3.5-4B; detalles especificos no disponibles) |
| Parametros totales | 4.659.865.088 (~4,66B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8192 tokens (longitud maxima de secuencia usada en entrenamiento; contexto nativo del modelo base no disponible) |
| Tipos de cuantizacion | No disponible (pesos publicados en BF16; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16, modelo completamente fusionado) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo del transformer decoder-only Qwen3.5-4B, fusionado en un único checkpoint de 16 bits (BF16) sin adaptadores LoRA separados. El entrenamiento se realizó sobre el dataset Trace-Inversion-1K-Preview, compuesto por 932 ejemplos, durante 2 épocas y con una longitud máxima de secuencia de 8192 tokens. La herramienta de entrenamiento citada en las etiquetas es Unsloth, aunque el resultado se distribuye como modelo fusionado y autónomo.

La innovación técnica principal no reside en la arquitectura, sino en la tarea de entrenamiento: la inversión de trazas. En lugar de aprender a mapear problema a respuesta, el modelo aprende a mapear el par (problema, respuesta conocida) a la secuencia de razonamiento intermedia, delimitada por las etiquetas nativas `<think>` y `</think>` de Qwen. No se dispone de información sobre la composición exacta del dataset, el uso de RLHF/DPO ni detalles adicionales del preentrenamiento del modelo base.

## Capacidades

- Generación de trazas de razonamiento (`<think>...</think>`) a partir de un problema y su respuesta final conocida.
- Destilación de razonamiento: produce cadenas de pensamiento sintéticas que pueden usarse para entrenar modelos más pequeños.
- Aumento de datos: generación de trazas de Chain-of-Thought para datasets existentes de matemáticas y código.
- Clonación de comportamiento: enseña a modelos pequeños a estructurar sus pensamientos antes de responder.
- Generación de texto conversacional con plantilla de chat (chat template de Qwen).
- Cobertura de dominios de matemáticas y código, según las etiquetas del repositorio y el dataset de entrenamiento.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso autónomo: no disponible; el modelo depende de que se le proporcione la respuesta.
- Capacidades multilingües: limitadas al inglés.
- Modo thinking nativo mediante las etiquetas `<think>` y `</think>`.

## Casos de uso

- Destilación de razonamiento desde modelos grandes: se proporciona al modelo un problema y la respuesta correcta obtenida de un modelo mayor (por ejemplo, DeepSeek o Claude) y se genera la traza intermedia para entrenar un modelo de 4B con esa capacidad.
- Aumento de datasets de matemáticas: dado un conjunto de pares problema-respuesta, el modelo genera las trazas de Chain-of-Thought que faltan, enriqueciendo el corpus de entrenamiento sin anotación manual.
- Aumento de datasets de código: a partir de enunciados y soluciones verificadas, se generan las explicaciones paso a paso del proceso de resolución para tareas de razonamiento sobre código.
- Clonación de comportamiento en modelos pequeños: se generan trazas de referencia que sirven como ejemplos de formato y estructura de pensamiento para ajustar modelos de menor tamaño.
- Generación de datos sintéticos para evaluación de razonamiento: se producen trazas plausibles que pueden usarse como material de comparación o para construir conjuntos de evaluación internos.
- Investigación sobre fidelidad del razonamiento: al disponer de la respuesta final fija, se pueden estudiar qué trazas genera el modelo y hasta qué punto son coherentes con el resultado, en entornos controlados.
- Construcción de pipelines de anotación semiautomática: integrado en un flujo donde un solver grande produce respuestas y este modelo reconstruye las explicaciones, reduciendo el coste de anotación de trazas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor advierte explícitamente de que no debe evaluarse el modelo en benchmarks estándar (AIME, MATH-500, HumanEval), ya que formaron parte de los datos de entrenamiento y las puntuaciones serían artificialmente altas por memorización de trazas, no por generalización.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 9,3-10 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 12-16 GB para secuencias largas.
- VRAM estimada en cuantización de 8 bits: aproximadamente 5-6 GB de pesos.
- VRAM estimada en cuantización de 4 bits: aproximadamente 3-4 GB de pesos (requiere cuantización propia, no publicada).
- GPU recomendadas: A100, H100 o L40S para producción con contexto completo de 8192 tokens; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia en BF16 sin problemas.
- GPU de consumo: cabe en RTX 4090, RTX 3090, RTX 4080 (16 GB) y, con cuantización a 4 bits, en GPUs de 8 GB como RTX 3070 o RTX 4060.
- Opciones de despliegue: `transformers` con `device_map="auto"` (soporte nativo documentado); vLLM, TGI, llama.cpp u Ollama no están documentados para este checkpoint, aunque al ser un transformer estándar en safetensors deberían ser compatibles previa conversión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-Trace-Inversion | ~4,66B | 8192 (entrenamiento) | Apache 2.0 | Generador de trazas de razonamiento | HuggingFace |
| Qwen/Qwen3.5-4B (base) | ~4,66B | No disponible | Apache 2.0 (heredada) | Modelo generalista | HuggingFace |
| Alternativas de destilacion de razonamiento de ~4B | No disponible | No disponible | No disponible | Destilacion de CoT | No disponible |

No se dispone de información sobre modelos comparables específicos de la misma categoría (generadores de trazas de razonamiento) ni de sus métricas de rendimiento, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- No debe evaluarse en benchmarks estándar (AIME, MATH-500, HumanEval): formaron parte del entrenamiento y las puntuaciones estarán infladas por memorización.
- No es un solver de propósito general: espera la respuesta en el prompt; sin ella, es probable que falle.
- Límite de 4B parámetros: puede confundirse en matemáticas recursivas complejas de varios pasos (por ejemplo, `f(f(f(f(x))))=0`); el autor sugiere ajustar modelos de 7B u 8B con el mismo dataset para tareas más duras.
- Riesgo de alucinación en las trazas generadas: al reconstruir el razonamiento a partir de una respuesta dada, la traza puede no ser lógicamente válida aunque el formato sea correcto.
- Sesgos conocidos: no documentados, pero hereda los sesgos del modelo base y del dataset de entrenamiento.
- Limitación de idioma: solo inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero deben respetarse las condiciones de la licencia del modelo base Qwen3.5-4B.
- Caveat de producción: el modelo está pensado como generador de datos, no como componente de respuesta directa al usuario; integrarlo en un pipeline de producción requiere validación de las trazas generadas.
- El dataset de entrenamiento es una vista previa (932 ejemplos), lo que limita la diversidad de dominios cubiertos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/open-zzrl/Qwen3.5-4B-Trace-Inversion
- Dataset de entrenamiento: https://huggingface.co/datasets/open-zzrl/Trace-Inversion-1K-Preview
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
