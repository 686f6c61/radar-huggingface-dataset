# mithulaartigala/Prompt-Resampler-9B-SFT-Alpha-8K-GGUF

## Resumen

Prompt-Resampler-9B-SFT-Alpha-8K es un ajuste fino supervisado (SFT) del modelo Qwen3.5-9B (variante instruct) orientado a una tarea muy concreta: el *prompt resampling*, una tecnica de aumento de datos que genera variaciones de un enunciado preservando su tarea subyacente (cambia nombres, cifras, escenarios y objetos, pero mantiene la estructura logica y el tipo de problema). Lo desarrolla el usuario independiente mithulaartigala y se distribuye bajo licencia Apache 2.0, con pesos en formato GGUF listos para llama.cpp y Unsloth Studio.

El modelo parte de una base de 8.953.803.264 parametros (aproximadamente 9B) y fue entrenado con LoRA de rango 32 y alpha 64 sobre secuencias de 8.192 tokens, empleando el dataset propio prompt-resampling-alpaca-gsm8k. La model card indica que conserva el formato de chat nativo y las capacidades de Qwen3.5, y que el objetivo del ajuste es mejorar la fiabilidad del resampling reduciendo el numero de tokens dedicados al razonamiento.

Se trata de una release Alpha: el autor advierte explicitamente de que puede fallar con prompts de estructura no vista o especialmente largos. Su relevancia es de nicho: sirve para pipelines de sintesis de datos y evaluacion de robustez, no como modelo generalista. El repositorio ocupa 57,9 GB e incluye cuantizaciones GGUF; el modelo acumula muy pocas descargas, lo que refleja su caracter experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5-9B instruct), ajuste fino con LoRA r=32, alpha=64 |
| Parametros totales | 8.953.803.264 (aproximadamente 9B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 8.192 tokens (longitud de secuencia de entrenamiento); contexto nativo de la base no disponible |
| Tipos de cuantizacion | GGUF (el repositorio incluye al menos Q4_K_S; el resto de variantes no disponible) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (compatible con transformers >= 5.17 mediante carga de GGUF, llama.cpp y Unsloth Studio) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only derivado de Qwen3.5-9B en su variante instruct. Sobre esa base se aplico un ajuste fino supervisado con LoRA (r=32, alpha=64) usando Unsloth Studio, con una longitud de secuencia de 8.192 tokens. No se especifica en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si hubo fases posteriores de RLHF o DPO; la model card solo menciona el dataset mithulaartigala/prompt-resampling-alpaca-gsm8k, que combina ejemplos de estilo Alpaca con problemas de GSM8K.

La innovacion tecnica declarada por el autor no esta en la arquitectura, sino en el objetivo del ajuste: incrementar la fiabilidad del resampling de prompts no JSON y reducir el consumo de tokens de razonamiento respecto a la version Mini (2B). El modelo conserva el formato de chat nativo de Qwen3.5 y requiere un system prompt especifico incluido en el repositorio (default_system_prompt.md), al que el autor recomienda anadir una instruccion adicional de "Scenario Realism Fix" para mitigar escenarios poco realistas. No se documentan tecnicas como decodificacion especulativa, atencion lineal ni modos de pensamiento hibrido mas alla de las etiquetas del repositorio.

## Capacidades

- Generacion de texto conversacional en ingles con el formato de chat nativo de Qwen3.5.
- Prompt resampling: genera variaciones de un enunciado preservando la tarea y el tipo de problema, modificando variables como nombres, cantidades, lugares y escenarios.
- Resampling de prompts no JSON con alta fiabilidad declarada por el autor (sin cifras publicadas).
- Razonamiento hibrido con un supuesto menor consumo de tokens de razonamiento respecto a la variante Mini de 2B.
- Razonamiento matematico basico heredado de la base, reforzado por la inclusion de GSM8K en el dataset de entrenamiento.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles; el pipeline es text-generation.
- Multilingue: limitado a ingles segun la etiqueta de idioma del repositorio.

## Casos de uso

- Aumento de datos para entrenamiento: generar variantes de un conjunto de prompts matematicos o de instrucciones para ampliar el dataset sin cambiar la tarea subyacente, aprovechando que el modelo preserva la estructura logica del enunciado.
- Evaluacion de robustez de modelos: producir versiones parafraseadas de un benchmark (por ejemplo, problemas tipo GSM8K con nombres y cifras distintas) para comprobar si un modelo resuelve por comprension o por memorizacion.
- Generacion de plantillas de ejercicios: crear enunciados nuevos a partir de una plantilla base para plataformas educativas, manteniendo el nivel de dificultad y el tipo de operacion aritmetica.
- Sintesis de casos de prueba para QA: fabricar prompts con escenarios alternativos que prueben la generalizacion de asistentes conversacionales antes de desplegarlos.
- Preprocesado en pipelines de datos: integrarse como paso previo en un flujo de curación de datasets, resampleando prompts con contexto de hasta 8.192 tokens mediante llama.cpp o Unsloth Studio con la API compatible con OpenAI.
- Investigacion sobre parafrasis controlada: estudiar como varian los modelos al cambiar variables de un enunciado manteniendo la tarea, gracias al control que ofrece el system prompt especifico del repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo afirma de forma cualitativa que el modelo "funciona significativamente mejor" que la variante Mini de 2B y que logra "alta fiabilidad" en resampling de prompts no JSON, sin aportar metricas numericas.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantizacion Q4_K_S, en torno a 5-6 GB de pesos mas overhead de contexto; en FP16, aproximadamente 18 GB solo para pesos.
- GPU recomendadas: A100 40/80 GB o H100 para FP16 y contextos largos; RTX 4090 (24 GB) suficiente para FP16 ajustado o cuantizaciones altas; RTX 3090/4080 (16-24 GB) para Q8 y Q6.
- GPU de consumo: cabe en GPUs consumer de 8 GB o mas con cuantizaciones Q4 o inferiores; en CPU via llama.cpp es viable con Q4_K_S.
- Opciones de despliegue: llama.cpp (llama-server con flag --ctx-size 8192), Unsloth Studio (API compatible con OpenAI en el puerto 8888), Hugging Face Transformers >= 5.17 con soporte de carga GGUF, y cualquier runtime compatible con GGUF (Ollama, LM Studio) aunque no se documentan explicitamente.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Prompt-Resampler-9B-SFT-Alpha-8K (este) | 8,95B | 8.192 (entrenamiento) | Apache 2.0 | Resampling de prompts via LoRA SFT | GGUF en Hugging Face |
| Prompt-Resampler Mini (2B) del mismo autor | aproximadamente 2B | no disponible | Apache 2.0 (presumible, mismo autor) | Misma tarea, menor tamano | Referenciado en la model card |
| Qwen3.5-9B instruct (base) | aproximadamente 9B | no disponible | no disponible | Modelo generalista | Pesos originales del autor de Qwen |
| Modelos generalistas de 7-9B (p. ej. Llama o Mistral) | 7-9B | 8K-128K segun variante | licencias variables | Generacion general, no especializada en resampling | Amplia |

La comparacion cuantitativa de rendimiento no esta disponible: no hay benchmarks publicados para este ajuste ni datos en la informacion proporcionada sobre las alternativas.

## Limitaciones y advertencias

- Release Alpha: el propio autor advierte de que ciertos comportamientos pueden no cumplir las expectativas y de que el modelo puede fallar con prompts de estructura no vista o largos.
- Riesgo de escenarios poco realistas en el resampling; el autor recomienda anadir una instruccion de "Scenario Realism Fix" al system prompt para mitigarlo.
- Dependencia de un system prompt especifico: sin el prompt del repositorio, el rendimiento puede degradarse notablemente.
- Solo ingles: no se declara soporte de otros idiomas, lo que limita su uso en pipelines en castellano.
- Riesgo de alucinacion inherente a los modelos generativos de 9B, no cuantificado en la informacion disponible.
- Sesgos: no documentados por el autor; heredables de la base Qwen3.5 y del dataset Alpaca/GSM8K.
- Contexto efectivo limitado a 8.192 tokens en entrenamiento; prompts mas largos pueden degradar la calidad.
- Licencia Apache 2.0 permite uso comercial, pero al ser una release Alpha y sin evaluacion independiente, no se recomienda en produccion sin validacion previa.
- Traccion minima (7 descargas, 0 likes en el momento de la consulta): ausencia de validacion por la comunidad.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mithulaartigala/Prompt-Resampler-9B-SFT-Alpha-8K-GGUF
- Modelo base del ajuste: https://huggingface.co/mithulaartigala/Prompt-Resampler-9B-SFT-Alpha-8K
- Dataset de entrenamiento: https://huggingface.co/datasets/mithulaartigala/prompt-resampling-alpaca-gsm8k
- System prompt por defecto: https://huggingface.co/mithulaartigala/Prompt-Resampler-9B-SFT-Alpha-8K-GGUF/blob/main/default_system_prompt.md
- Instalacion de llama.cpp: https://github.com/ggml-org/llama.cpp/blob/master/docs/install.md
