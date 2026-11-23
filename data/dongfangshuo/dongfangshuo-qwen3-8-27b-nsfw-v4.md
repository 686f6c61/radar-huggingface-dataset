# dongfangshuo/Dongfangshuo-Qwen3.8-27B-NSFW-v4

## Resumen

Dongfangshuo-Qwen3.8-27B-NSFW-v4 es un ajuste fino (finetune) del modelo Qwen3.8-27B de Alibaba, desarrollado por el usuario dongfangshuo y publicado en Hugging Face. Se trata de una variante "abliterated" y sin censura, orientada a la creación literaria en chino y a la interpretación de roles (roleplay), que parte tanto del modelo original Qwen/Qwen3.8-27B como de la versión ya ablacionada de huihui-ai. El modelo conserva la arquitectura densa de aproximadamente 27.000 millones de parámetros y la capacidad de visión del modelo base, e incorpora un proceso de "purificación de atención" en 64 capas.

El modelo resuelve el problema de la censura y la rigidez estilística del modelo base en contextos creativos: el autor afirma que la versión original "no sabe hablar como una persona" y recurre a enumeraciones planas, mientras que esta v4 mejora de forma notable el estilo literario a costa de una ligera pérdida en razonamiento y capacidades de agente. Está pensado para despliegue local mediante Ollama y llama.cpp, con cuantizaciones GGUF desde 3 bits hasta 8 bits, además de pesos BF16 en safetensors para reentrenamiento.

Es relevante ahora por su elevado número de descargas (más de 124.000) y porque ejemplifica el ecosistema de finetunes sin censura sobre modelos Qwen de gran tamaño, con instrucciones de inferencia muy específicas (ventana de 64K, salida de 4K, parámetros de muestreo concretos) que condicionan su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.8) con codificador de visión; etiqueta `qwen3_5_text` |
| Parametros totales | 26.895.998.464 (~26,9B; el autor indica 27,8B denso + visión) |
| Longitud de contexto | Recomendado 64K de contexto con 4K de salida (num_ctx 81920, num_predict 6144) |
| Tipos de cuantizacion | Q3_K_M, Q4_K_M, Q5_K_M, Q6_K, Q8_0 (GGUF); BF16 en safetensors; LoRA |
| Idiomas soportados | Chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16, 18 shards), GGUF (cuantizaciones), LoRA (checkpoint-150) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura transformer densa de Qwen3.8-27B, con aproximadamente 26,9 mil millones de parámetros y un codificador de visión que permite entrada image-text-to-text. Sobre esa base se aplicó un proceso de abliteración (eliminación de direcciones de rechazo en el espacio de activaciones) heredado de huihui-ai/Huihui-Qwen3.8-27B-abliterated, seguido de un finetune con "purificación de atención" en 64 capas y una fusión de MLP. El autor menciona el uso de un conjunto de datos literario de gran volumen para mejorar el estilo de escritura, lo que explica la mejora estilística frente al modelo base.

No se especifican en la información disponible el número exacto de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. El autor sí advierte que la v3 se descartó por un esquema de entrenamiento demasiado agresivo y que la v4 se entrenó con un enfoque distinto, y señala que el modelo de 27B "está cerca de su límite" y que las cuantizaciones amplifican defectos estructurales de la familia. Se distribuye también un LoRA independiente (checkpoint-150) con las capas de atención ya purificadas.

## Capacidades

- Generación de texto creativo en chino, con especial énfasis en narrativa literaria y descripciones extensas.
- Roleplay y "跑团" (partidas de rol de mesa) con gestión de estado, dados (1d100) y paneles HTML de estado.
- Capacidad de visión: entrada de imágenes mediante el codificador multimodal (`mmproj-model-bf16.gguf`).
- Modo de razonamiento breve ("thinking chain") activable mediante instrucción en el system prompt.
- Soporte de conversaciones multi-turno con contexto largo (hasta ~64K recomendados).
- Capacidad de agente reducida respecto al modelo base, según el propio autor.
- Multilingüe limitado: el modelo está entrenado y etiquetado únicamente para chino.

## Casos de uso

- **Roleplay narrativo de larga duración**: el modelo mantiene coherencia en partidas de rol de 5 turnos con contexto de 64K y paneles de estado (HP/SAN/LUST) con aritmética consistente, según las pruebas del autor.
- **Creación literaria en chino**: generación de capítulos de 2.800 a 4.200 caracteres con estilo narrativo pulido, adecuado para novelas por entregas o ficción interactiva.
- **Ficción interactiva y videojuegos narrativos**: integración en motores de historia ramificada donde el modelo interpreta al narrador y aplica reglas de dados y consecuencias.
- **Asistente de escritura sin restricciones temáticas**: borradores y reescritura de escenas adultas o de temática sensible que el modelo base rechazaría.
- **Análisis de imágenes con contexto conversacional**: descripción y comentario de imágenes dentro de una conversación multi-turno gracias al codificador de visión.
- **Prototipado local con Ollama/llama.cpp**: despliegue en una sola GPU de consumo (16-24 GB con Q4_K_M) para experimentación con modelos sin censura.
- **Generación de paneles de estado estructurados**: producción de bloques HTML con contadores y aritmética autoconsistente para interfaces de juego.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor incluye una tabla de evaluación ciega propia de seis dimensiones sobre partidas de rol de 5 turnos con 64K de contexto, comparando el modelo base (J), una versión sin purificar (K) y la v4:

| Dimensión | Peso | Base 27B (J) | Sin purificar (K) | v4 |
|---|---|---|---|---|
| Recuperación de anclas en 64K y estabilidad de cierre | 20% | 88,0 | 78,0 | 100,0 |
| Cumplimiento de polaridad en tiradas 1d100 | 20% | 94,0 | 55,0 | 98,0 |
| Integridad del panel HTML y coherencia aritmética | 15% | 75,0 | 58,0 | 99,0 |

Estos datos son autoevaluaciones del autor, no benchmarks independientes, y deben interpretarse con cautela.

## Requisitos de hardware

- **VRAM estimada**: Q3_K_M ~13,3 GB; Q4_K_M ~16,5 GB; Q5_K_M ~19,2 GB; Q6_K ~22,1 GB; Q8_0 ~28,6 GB; BF16 ~53,7 GB. El codificador de visión añade ~931 MB.
- **GPU recomendadas**: RTX 4090 (24 GB) para Q4_K_M/Q5_K_M; RTX 3090 o A6000 para Q6_K; A100 40/80 GB o H100 para BF16 y fine-tuning.
- **GPU de consumo**: sí, cabe en GPUs de 16-24 GB con Q4_K_M; en 12-16 GB con Q3_K_M.
- **Opciones de despliegue**: Ollama (Modelfile incluido), llama.cpp, Transformers para BF16. No se menciona soporte explícito de vLLM o TGI.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Dongfangshuo-Qwen3.8-27B-NSFW-v4 | ~26,9B densos | 64K recomendado | Apache 2.0 | Finetune sin censura, chino, con visión |
| Qwen/Qwen3.8-27B (base) | ~27B densos | No disponible | Apache 2.0 | Modelo original, censurado, mejor razonamiento y agente |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | ~27B densos | No disponible | Apache 2.0 | Abliteración sin finetune literario |
| Modelos de rol de 7-13B (p. ej. familia Mistral/Mixtral finetunes) | 7-13B | Variable | Variable | Menor calidad literaria y menor huella de VRAM |

La comparación de rendimiento cuantitativo entre estos modelos no está disponible más allá de la autoevaluación del autor.

## Limitaciones y advertencias

- Contenido NSFW y sin censura: no apto para todos los públicos; requiere filtrado en aplicaciones de producción.
- El autor advierte de defectos estructurales del modelo de 27B que se amplifican con la cuantización y que no ha podido corregir.
- Contexto y salida limitados en la práctica: no superar 64K de contexto ni 4K de salida para evitar fallos.
- Tendencia a repetir frases o entornos de turnos anteriores tras 5 turnos de alta intensidad; se mitiga con `presence_penalty`.
- Parámetros de muestreo muy sensibles: `repeat_penalty` ≥ 1,10 o `frequency_penalty` > 0 rompen la puntuación.
- Pérdida de razonamiento y capacidades de agente respecto al modelo base.
- Solo chino: no se garantiza calidad en otros idiomas.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado puede infringir normativas locales sobre material adulto.
- Riesgo de alucinación y de incoherencia aritmética en paneles de estado si se fuerza la longitud de salida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dongfangshuo/Dongfangshuo-Qwen3.8-27B-NSFW-v4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Versión abliterated de referencia: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Modelfile de Ollama: https://huggingface.co/dongfangshuo/Dongfangshuo-Qwen3.8-27B-NSFW-v4/blob/main/Modelfile
- LoRA checkpoint: https://huggingface.co/dongfangshuo/Dongfangshuo-Qwen3.8-27B-NSFW-v4/tree/main/lora_checkpoints
