# ninenfn/llm-course-hw3-dora

## Resumen

`ninenfn/llm-course-hw3-dora` es un ajuste fino (fine-tuning) del modelo `OuteAI/Lite-Oute-1-300M-Instruct`, publicado por el usuario ninenfn como entrega de la tarea 3 del curso "Grandes modelos de lenguaje". No se trata de un modelo de propósito general, sino de un adaptador DoRA (Weighted-Decomposed Low-Rank Adaptation) entrenado específicamente para clasificación de sentimiento en tuits sobre el dataset `cardiffnlp/tweet_eval`. El repositorio contiene pesos en formato safetensors compatibles con transformers y está etiquetado como `text-generation`, aunque su uso real es la clasificación de polaridad (positive/neutral/negative).

El modelo hereda la arquitectura y el tamaño del modelo base: aproximadamente 300 millones de parámetros (300.049.792 según los safetensors), lo que lo sitúa en la gama de modelos pequeños aptos para inferencia en CPU o GPU de consumo. La relevancia de esta ficha es limitada desde el punto de vista de producción: se trata de un artefacto académico que documenta un experimento de PEFT con DoRA, con un resultado declarado de F1 = 0,50 en el conjunto de test de tweet_eval.

Conviene subrayar que la model card está redactada en ruso, no declara licencia ni idiomas soportados, y no incluye información sobre el contexto máximo del modelo base ni sobre el proceso completo de entrenamiento del modelo original. Todos los datos que se ofrecen a continuación provienen exclusivamente de la información disponible en el repositorio y de la model card; cualquier otro dato se marca como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de OuteAI/Lite-Oute-1-300M-Instruct); ajuste fino mediante DoRA (adaptadores de bajo rango) |
| Parametros totales | 300.049.792 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no se ofrecen GGUF ni cuantizaciones) |
| Idiomas soportados | no disponibles (la model card está en ruso; no se declara cobertura lingüística) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de `OuteAI/Lite-Oute-1-300M-Instruct`, un transformer decoder-only de unos 300 millones de parámetros. Sobre esa base se aplicó DoRA (Weighted-Decomposed Low-Rank Adaptation), una variante de LoRA que descompone la actualización de pesos en magnitud y dirección. Los hiperparámetros declarados en la model card son: `lora_r = 8`, `lora_alpha = 16`, submódulos objetivo `k_proj` y `v_proj`, batch size 16, learning rate 1e-4, una época, `weight_decay = 0.02`, sampler `WeightedRandomSampler` para balanceo de clases y EMA con factor 0.99 durante la validación. El entrenamiento se realizó sobre 10.000 ejemplos balanceados extraídos de la partición de train de `cardiffnlp/tweet_eval`.

No se especifica el número total de tokens de entrenamiento, la composición del dataset más allá del uso de tweet_eval, ni si hubo RLHF, DPO o preferencias humanas. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal. El resultado declarado es un F1 de 0,50 en test, partiendo de un F1 de 0,13 antes del ajuste, lo que indica una mejora sustancial pero un rendimiento absoluto moderado para una tarea de clasificación de tres clases.

## Capacidades

- Clasificación de sentimiento en tuits en inglés con tres etiquetas: `positive`, `neutral` y `negative`, según los ejemplos de la model card.
- Generación de texto condicionada por el prompt, heredada del modelo base instruct (la etiqueta del repositorio es `text-generation`).
- Conversación multi-turno básica, heredada de la naturaleza instruct del modelo base.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- No se declaran capacidades multilingües verificadas.
- No se declara visión, audio ni modo thinking.
- No se declara una ventana de contexto concreta.

## Casos de uso

- Clasificación de polaridad en redes sociales: el modelo puede etiquetar tuits en inglés como positiva, neutra o negativa, tal como muestran los ejemplos de la model card (deportes, entretenimiento, política). Es adecuado como demostración académica, no como sistema de producción dado su F1 de 0,50.
- Análisis exploratorio de sentimiento en corpus pequeños: para investigaciones que necesiten una línea base rápida sobre tweet_eval, el adaptador DoRA ofrece una referencia reproducible con hiperparámetros documentados.
- Reproducción de experimentos de PEFT: sirve como ejemplo didáctico de aplicación de DoRA con balanceo de clases, EMA y weight decay sobre un modelo de 300M.
- Prototipado de pipelines de clasificación con transformers: al ser un checkpoint safetensors estándar, se puede cargar con `AutoModelForSequenceClassification` o `AutoModelForCausalLM` según el uso, e integrar en un script de evaluación.
- Comparación de técnicas de ajuste fino: útil para contrastar DoRA frente a LoRA sobre el mismo modelo base y dataset en un entorno académico.
- Generación de texto breve en inglés: el modelo base instruct permite respuestas cortas, aunque el ajuste DoRA puede haber degradado esa capacidad al especializarlo en clasificación.

## Benchmarks y rendimiento

| Metrica | Antes del ajuste | Despues de DoRA |
|---|---|---|
| F1 en test (tweet_eval) | 0,13 | 0,50 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible. No se ofrecen comparaciones con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 0,6 GB solo para pesos (300M × 2 bytes), más overhead de activaciones y KV cache; en la práctica, menos de 2 GB para secuencias cortas.
- VRAM estimada en fp32: aproximadamente 1,2 GB para pesos, más overhead.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060, T4). También cabe en CPU para inferencia por lotes pequeños.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs consumer actuales, e incluso en placas integradas con suficiente memoria compartida.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta `text-generation-inference` en el repo) y endpoints compatibles (etiqueta `endpoints_compatible`). No se publican pesos GGUF, por lo que llama.cpp u Ollama requerirían conversión manual.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ninenfn/llm-course-hw3-dora | 300M | no disponible | Clasificación de sentimiento (tweet_eval) | no disponible | Hugging Face |
| OuteAI/Lite-Oute-1-300M-Instruct | ~300M | no disponible | Generación de texto instruct | no disponible en esta ficha | Hugging Face (modelo base) |
| Adaptadores LoRA/DoRA sobre tweet_eval | variable | no disponible | Clasificación de sentimiento | variable | Hugging Face (múltiples repositorios comunitarios) |

No se dispone de datos de rendimiento de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- El F1 de 0,50 en una tarea de tres clases es modesto; un clasificador trivial o un modelo específico de sentimiento superaría este resultado con facilidad.
- El ajuste se realizó sobre solo 10.000 ejemplos y una época, lo que limita la generalización.
- La model card está en ruso y no documenta sesgos conocidos, composición del dataset ni evaluación por subgrupos.
- Riesgo de alucinación y de respuestas incoherentes si se usa como modelo generativo: el ajuste DoRA está orientado a clasificación, no a generación libre.
- No se declara licencia, lo que impide determinar si el uso comercial está permitido. Se debe contactar con el autor o consultar la licencia del modelo base antes de cualquier uso en producción.
- No se declaran idiomas soportados; los ejemplos son en inglés, pero no hay garantía de comportamiento en otros idiomas.
- No se documenta la longitud de contexto del modelo base en esta ficha, por lo que no se puede garantizar el manejo de secuencias largas.
- Es un artefacto académico (`homework` en las etiquetas) sin mantenimiento declarado ni garantías de soporte.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ninenfn/llm-course-hw3-dora
- Modelo base: https://huggingface.co/OuteAI/Lite-Oute-1-300M-Instruct
- Dataset utilizado: https://huggingface.co/datasets/cardiffnlp/tweet_eval
- Paper de DoRA (Weight-Decomposed Low-Rank Adaptation): no disponible en la información proporcionada
- Paper de LoRA: no disponible en la información proporcionada
- Blog o demo del autor: no disponible en la información proporcionada
