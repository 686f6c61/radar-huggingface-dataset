# jeffrymahbuubi/Llama-3.2-3B-Alpaca-ID-GRPO

## Resumen

Llama-3.2-3B-Alpaca-ID-GRPO es un ajuste fino del modelo Llama 3.2 de 3B de Meta, desarrollado por el usuario jeffrymahbuubi, especializado en razonamiento en indonesio. El modelo parte de un SFT previo sobre el dataset alpaca-gpt4-indonesian y se entrena posteriormente con GRPO (Group Relative Policy Optimization) para que genere un proceso de pensamiento explícito entre las etiquetas `<think>` y `</think>` antes de emitir la respuesta final. Está pensado para tareas conversacionales en indonesio donde se requiere trazabilidad del razonamiento.

Con 3.212.749.824 parámetros y un contexto heredado de la arquitectura Llama 3.2, el modelo es un transformer denso de pequeño tamaño, adecuado para despliegue en hardware modesto. Su relevancia radica en ser un ejemplo práctico de aplicación de RL (GRPO) sobre un modelo pequeño y multilingüe, con un diseño de recompensas explícito que prioriza el formato del razonamiento, la corrección de la respuesta y el idioma.

El modelo tiene 54 descargas y 0 likes en Hugging Face, lo que indica que es un experimento de investigación más que un modelo de producción. Los pesos se distribuyen en formato merged_16bit con safetensors, y la licencia es la Llama 3.2 Community License.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2) |
| Parametros totales | 3.212.749.824 |
| Parametros activos | no disponible (modelo denso) |
| Longitud de contexto | no disponible (heredada de Llama 3.2 3B, no especificada en la model card) |
| Tipos de cuantizacion | no disponible (pesos en merged_16bit; se puede cuantizar a GGUF/AWQ, pero no se documenta) |
| Idiomas soportados | indonesio (id) |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | safetensors (merged_16bit) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only basado en Llama 3.2 3B, partiendo de la copia oficial de Unsloth (`unsloth/Llama-3.2-3B`). Sobre el modelo SFT `jeffrymahbuubi/Llama-3.2-3B-Alpaca-ID-SFT` se aplicó un entrenamiento GRPO con la librería TRL (`GRPOTrainer`) y Unsloth, añadiendo un adaptador LoRA de rango 32 sobre siete módulos lineales. Los pesos finales se fusionaron en 16 bits.

El dataset de entrenamiento consta de 2.000 filas de `Ichsan2895/alpaca-gpt4-indonesian`, filtradas a entradas de hasta 500 caracteres y salidas de hasta 400 caracteres, mezcladas con semilla 3407. El prompt combina un mensaje de sistema de razonamiento con la pregunta, y la respuesta de referencia es la columna `output`. El entrenamiento se ejecutó durante 600 pasos con `num_generations = 4`, `max_completion_length = 512`, learning rate 5e-6, `adamw_8bit`, batch 1 y acumulación de gradiente 4.

La innovación principal es el diseño de recompensas, que combina cuatro funciones: `format_reward_func` (penaliza el formato incorrecto de las etiquetas `<think>`), `reasoning_length_reward` (incentiva razonamientos de al menos 200 caracteres), `correctness_reward` (1,0 si la respuesta contiene la referencia o ROUGE-L F1 ≥ 0,3) y `language_reward_func` (penaliza respuestas en inglés con -0,5 y premia el indonesio con 1,0 usando stop words de NLTK y Sastrawi). Este esquema empuja al modelo a razonar en indonesio y a mantener una estructura de pensamiento explícita.

## Capacidades

- Generación de texto conversacional en indonesio con proceso de razonamiento explícito entre `<think>` y `</think>`.
- Razonamiento multi-paso guiado por el formato de pensamiento inducido por GRPO.
- Respuesta a instrucciones del tipo Alpaca (preguntas y respuestas generales).
- Mantenimiento del idioma indonesio gracias a la función de recompensa lingüística.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes: no disponible.
- Capacidades de visión o audio: no disponibles.
- Capacidades multilingües: limitadas al indonesio según la model card (el modelo base Llama 3.2 soporta más idiomas, pero el ajuste está orientado a `id`).

## Casos de uso

- Asistente conversacional en indonesio con trazabilidad del razonamiento: el modelo escribe su proceso de pensamiento antes de responder, lo que permite auditar cómo llegó a una conclusión en entornos educativos o de soporte.
- Generación de respuestas estilo Alpaca para prototipos de chatbots: el ajuste sobre `alpaca-gpt4-indonesian` lo hace adecuado para tareas de instrucción general en indonesio con bajo coste computacional.
- Investigación en RL para modelos pequeños: sirve como caso de estudio reproducible de GRPO con recompensas de formato, longitud, corrección y idioma sobre un modelo de 3B.
- Filtrado y reescritura de texto en indonesio: puede reformular o responder preguntas cortas (entradas de hasta 500 caracteres) en pipelines de preprocesamiento.
- Generación de datos sintéticos de razonamiento en indonesio: el formato `<think>` permite extraer cadenas de razonamiento para aumentar datasets de entrenamiento.
- Despliegue en entornos con recursos limitados: al ser un modelo de 3B en 16 bits, cabe en GPUs de consumo y puede servir para demos locales de asistentes en indonesio.
- Base para RAG en dominio jurídico o administrativo en indonesio: la model card sugiere combinarlo con búsqueda de documentos para preguntas legales, dado que el modelo no está entrenado en ese dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 6,5-7 GB solo para pesos, más overhead de activaciones y KV cache (en torno a 8-10 GB en la práctica).
- VRAM estimada en cuantización 8 bits: aproximadamente 3,5-4 GB; en 4 bits (GGUF Q4): aproximadamente 2-2,5 GB.
- GPU recomendadas: A100, H100 o L40S para serving de alta concurrencia; RTX 4090, RTX 3090 o RTX 4080 para inferencia local en FP16.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores en FP16; en GPUs de 8 GB requiere cuantización a 8 o 4 bits.
- Opciones de despliegue: transformers, vLLM, TGI (el modelo tiene tag `text-generation-inference`), llama.cpp/Ollama tras conversión a GGUF (no documentada por el autor).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| jeffrymahbuubi/Llama-3.2-3B-Alpaca-ID-GRPO | 3,21B | no disponible | id | Llama 3.2 Community License | GRPO con razonamiento `<think>` |
| jeffrymahbuubi/Llama-3.2-3B-Alpaca-ID-SFT | ~3,21B | no disponible | id | Llama 3.2 Community License | Modelo base SFT sin GRPO |
| Llama 3.2 3B Instruct (Meta) | 3,21B | 128K (según Meta) | multilingüe | Llama 3.2 Community License | Modelo base oficial, sin ajuste a indonesio |
| Qwen2.5-3B-Instruct | 3,09B | 32K (según Qwen) | multilingüe | Apache 2.0 | Alternativa de tamaño similar con licencia permisiva |

## Limitaciones y advertencias

- Entrenado sobre solo 2.000 ejemplos y 600 pasos de GRPO: el ajuste es corto y puede producir respuestas truncadas o incorrectas.
- No está entrenado en dominios especializados (por ejemplo, jurídico); la model card advierte explícitamente que no es asesoramiento legal y recomienda RAG con verificación de fuentes.
- Riesgo de alucinación inherente a un modelo de 3B con datos generales.
- El idioma objetivo es únicamente el indonesio; el rendimiento en castellano u otros idiomas no está garantizado.
- La recompensa de corrección basada en ROUGE-L F1 ≥ 0,3 es laxa y puede premiar respuestas parcialmente correctas.
- La licencia Llama 3.2 Community License impone restricciones de uso comercial y obligaciones de atribución; debe revisarse antes de producción.
- El formato `<think>` requiere el mensaje de sistema específico; sin él, el modelo puede no generar el razonamiento esperado.
- Contexto máximo no documentado en la model card; conviene verificar el config del tokenizer antes de usarlo con entradas largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jeffrymahbuubi/Llama-3.2-3B-Alpaca-ID-GRPO
- Modelo base SFT: https://huggingface.co/jeffrymahbuubi/Llama-3.2-3B-Alpaca-ID-SFT
- Modelo base de Unsloth: https://huggingface.co/unsloth/Llama-3.2-3B
- Dataset de entrenamiento: https://huggingface.co/datasets/Ichsan2895/alpaca-gpt4-indonesian
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
- Repositorio TRL (GRPOTrainer): https://github.com/huggingface/trl
- Repositorio Unsloth: https://github.com/unslothai/unsloth
