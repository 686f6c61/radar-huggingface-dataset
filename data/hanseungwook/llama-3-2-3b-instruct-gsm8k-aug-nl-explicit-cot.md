# hanseungwook/Llama-3.2-3B-Instruct-gsm8k-aug-nl-explicit-cot

## Resumen

Llama-3.2-3B-Instruct-gsm8k-aug-nl-explicit-cot es un ajuste fino supervisado del modelo meta-llama/Llama-3.2-3B-Instruct, publicado por el usuario hanseungwook en Hugging Face. El modelo está especializado en resolver problemas verbales de matemáticas de nivel escolar (grade-school math) generando una cadena de razonamiento explícita en lenguaje natural (explicit chain of thought) seguida de una respuesta final con el formato `The answer is: <número>`. Se entrenó sobre el dataset zen-E/GSM8k-Aug-NL como profesor/base explícito de CoT dentro de un estudio sobre razonamiento latente.

La arquitectura es la del transformer decoder-only de Llama 3.2, con 3.212.749.824 parámetros en bf16 y el vocabulario original de Llama 3.2 (128.256 tokens). El ajuste se realizó con LoRA (r=128, alpha=32) sobre las proyecciones q/k/v/o/gate/up/down, con los embeddings congelados, y el adaptador se fusionó en los pesos finales, dando lugar a un checkpoint estándar `LlamaForCausalLM`. El repositorio ocupa 6,4 GB y no registra descargas ni likes en el momento de la consulta.

Su relevancia es acotada pero concreta: proporciona una línea base reproducible de CoT explícito para GSM8K sobre un modelo de 3B, útil para investigadores que comparan estrategias de razonamiento (explícito frente a latente) y para desarrolladores que necesitan un solucionador de problemas aritméticos verbales ligero, desplegable en hardware modesto. No es un modelo de propósito general: está entrenado exclusivamente para esta tarea y en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2), fine-tuning con LoRA fusionado |
| Parametros totales | 3.212.749.824 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Llama 3.2, pero no se explicita) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos publicados en bf16; el repo no incluye GGUF ni cuantizaciones) |
| Idiomas soportados | en (ingles) |
| Licencia | llama3.2 (Llama 3.2 Community License, con Acceptable Use Policy) |
| Formato de pesos | safetensors (bf16), compatible con transformers |

## Arquitectura y entrenamiento

El modelo parte de `meta-llama/Llama-3.2-3B-Instruct` (revision `0cb88a4f764b7a12671c53f0838cd831a0843b95`) y conserva su arquitectura transformer decoder-only con atención causal estándar y el vocabulario original de 128.256 tokens. El ajuste se hizo con LoRA de rango 128, alpha 32 y dropout 0,1 aplicado a las proyecciones q/k/v/o/gate/up/down, manteniendo los embeddings congelados. La optimización empleó AdamW con LR 3e-4, schedule coseno, 3% de warmup, weight decay 0,1, clipping de norma de gradiente 2,0 y precisión bf16, con batch efectivo de 128 (4 GPUs × 32) durante 10 épocas (2.983 pasos por época). El checkpoint publicado corresponde al paso 11.932, es decir, el final de la época 4, seleccionado únicamente por precisión de validación.

Los datos de entrenamiento provienen del split de train de `zen-E/GSM8k-Aug-NL` (revision `e20551f`), usando la CoT completa incluida su etapa final y descartando ejemplos de más de 256 tokens. El objetivo de entrenamiento es `question` → `cot + "\n" + "The answer is: N" + eos`, calculando la pérdida solo sobre los tokens de la CoT, la respuesta y el eos. La validación se realizó sobre 518 preguntas del train de GSM8K que no aparecen en GSM8k-Aug-NL. En la exportación, el adaptador LoRA se fusionó en fp32 y se convirtió a bf16, y se eliminaron tres filas extra de embedding (pad y dos tokens reservados) para dejar el vocabulario estándar; `<|finetune_right_pad_id|>` actúa como token de pad. El manifiesto completo del contrato de entrenamiento se registra en `training_manifest.json`.

## Capacidades

- Generación de cadenas de razonamiento explícitas en lenguaje natural para problemas aritméticos verbales, seguidas de una respuesta final en el formato `The answer is: <número>`.
- Resolución de problemas de matemáticas de nivel escolar (GSM8K) y variantes de dificultad aumentada (GSM-Hard) y aritmética simple (SVAMP, MultiArith).
- Generación de texto autoregresiva con decodificación greedy configurada por defecto en `generation_config.json` (256 tokens nuevos).
- Compatibilidad con el pipeline `text-generation` de transformers y con text-generation-inference y endpoints compatibles (según los tags del repo).
- No soporta tool calling ni function calling de forma documentada.
- No se documentan capacidades de agente, multi-step reasoning más allá de la CoT, visión, audio ni modo thinking.
- Capacidad multilingüe limitada al inglés: el modelo base es multilingüe, pero el ajuste fino se ha realizado solo con datos en inglés y el autor declara únicamente `en`.

## Casos de uso

- Investigación sobre razonamiento explícito frente a latente: el modelo sirve como línea base de CoT explícito en experimentos que comparan estrategias de razonamiento sobre modelos de 3B, tal como se concibió en el estudio original.
- Evaluación de pipelines de matemáticas verbales: permite reproducir y comparar métricas de exactitud en GSM8K, GSM-Hard, SVAMP y MultiArith con un checkpoint ligero y determinista (greedy).
- Generación de datos sintéticos de CoT: puede utilizarse para producir cadenas de razonamiento etiquetadas que alimenten el entrenamiento de modelos más pequeños o destilación.
- Tutoría automática de aritmética básica: dado un problema verbal en inglés, devuelve el razonamiento paso a paso y la respuesta numérica, útil en herramientas educativas de refuerzo.
- Componente de verificación en pipelines de QA matemático: al ser un modelo de 3B, se puede desplegar junto a un modelo mayor para contrastar respuestas numéricas en tareas de grade-school math.
- Prototipado en hardware de consumo: su tamaño (3,2B parámetros, 6,4 GB en bf16) permite experimentar en una sola GPU consumer, aunque el repo no incluye cuantizaciones listas para usar.
- Benchmarking interno de infraestructura de inferencia: sirve para medir latencia y throughput de transformers o TGI con un modelo pequeño y una carga de trabajo bien definida.

## Benchmarks y rendimiento

Resultados publicados por el autor, con decodificación greedy y hasta 256 tokens nuevos, puntuando el último número de la generación contra la respuesta de referencia:

| Benchmark | Exactitud |
|---|---|
| GSM8K test (1.319) | 71,34 (941) |
| GSM-Hard (1.319) | 21,38 (282) |
| SVAMP (1.000) | 75,40 (754) |
| MultiArith (180) | 100,00 (180) |
| Validación (518 preguntas retenidas del train de GSM8K) | 76,45 (396) |

El autor indica que las cifras anteriores provienen del checkpoint de entrenamiento sin fusionar. Al re-evaluar esta release fusionada sobre GSM8K test con `model.generate` se obtiene 71,49 (943/1.319), y 1.238 de las 1.319 respuestas finales coinciden con la ejecución original; la diferencia se atribuye al redondeo bf16 tras la fusión. No se proporcionan comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 6,4-7 GB solo para pesos, más memoria para el contexto y el KV cache; en la práctica, unos 8-10 GB para secuencias cortas.
- GPU recomendadas: cualquier GPU con al menos 8-10 GB de VRAM para bf16; una RTX 4090 (24 GB) o A100/H100 ofrecen margen holgado y mayor throughput.
- Cabe en GPU consumer: sí, en tarjetas con 8 GB o más si se usa cuantización (no incluida en el repo) o en bf16 con 10-12 GB; en GPUs de 8 GB conviene cuantizar a 8 bits o 4 bits con herramientas externas.
- Opciones de despliegue: transformers (probado por el autor), text-generation-inference y endpoints compatibles según los tags; llama.cpp u Ollama requerirían convertir los pesos a GGUF, paso no documentado en el repo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.2-3B-Instruct-gsm8k-aug-nl-explicit-cot | 3,21B | no disponible | 71,34 | llama3.2 | Hugging Face, 0 descargas |
| meta-llama/Llama-3.2-3B-Instruct (base) | 3,21B | no disponible en la información proporcionada | no disponible en la información proporcionada | llama3.2 | Hugging Face, ampliamente usado |
| Otros fine-tunes de GSM8K sobre Llama 3.2 3B | ~3,2B | no disponible | no disponible | variable | no disponible |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no puede establecerse más allá de las cifras del propio modelo.

## Limitaciones y advertencias

- Especialización estrecha: entrenado solo para problemas verbales de matemáticas de nivel escolar en inglés; su rendimiento fuera de ese dominio no está evaluado y probablemente sea deficiente.
- Caída acusada en GSM-Hard (21,38), lo que indica escasa robustez ante problemas con números grandes o formulaciones no estándar.
- No debe usarse el chat template: el modelo fue entrenado con texto plano (`<|begin_of_text|>` + pregunta) y espera generar la CoT, un salto de línea y `The answer is: <número>`; usar el template de chat puede degradar la salida.
- Riesgo de alucinación en el razonamiento intermedio: la puntuación se basa en el último número de la generación, por lo que una CoT incorrecta puede coincidir con la respuesta correcta por casualidad, y viceversa.
- Idiomas: solo inglés; no hay evidencia de funcionamiento fiable en castellano u otros idiomas.
- Licencia Llama 3.2 Community License: uso comercial permitido con condiciones, sujeto a la Acceptable Use Policy de Meta; es un modelo derivado y debe conservar los avisos de licencia correspondientes.
- Repositorio sin descargas ni validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin señales de uso en producción.
- No se documentan cuantizaciones oficiales ni conversiones a GGUF; el despliegue en llama.cpp u Ollama requiere trabajo adicional no cubierto por el autor.
- La longitud de contexto efectiva no se explicita en la model card; conviene no asumir más allá de lo que soporte el modelo base en la práctica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hanseungwook/Llama-3.2-3B-Instruct-gsm8k-aug-nl-explicit-cot
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/zen-E/GSM8k-Aug-NL
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Licencia Llama 3.2: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct/blob/main/LICENSE.txt
- Acceptable Use Policy de Llama 3.2: https://www.llama.com/llama3_2/use-policy
