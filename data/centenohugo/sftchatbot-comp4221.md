# centenohugo/SFTChatBot-comp4221

## Resumen

SFTChatBot-comp4221 es un modelo de generación de texto desarrollado por el usuario de HuggingFace centenohugo como trabajo de asignatura (course-assignment). Consiste en un ajuste fino supervisado (SFT) del modelo base HuggingFaceTB/SmolLM2-135M, un transformer decoder de 135 millones de parámetros, entrenado durante 100 actualizaciones sobre 300 conversaciones sintéticas de preguntas y respuestas.

El problema que resuelve es muy concreto: generar respuestas "grounded" a preguntas de tipo FAQ sobre un campus ficticio, citando siempre el identificador del hecho (fact ID) proporcionado en el contexto. El modelo responde en un formato rígido de dos líneas (`Answer:` y `Source:`), lo que lo hace útil como demostración de cómo el SFT puede instilar formatos de salida estrictos y comportamiento de citación en modelos muy pequeños.

Su relevancia es principalmente pedagógica y de investigación reproducible: la model card incluye la configuración completa de entrenamiento (`run_config.json`), la curva de pérdida por actualización (`loss.csv`) y una evaluación comparativa contra el modelo base. No es un modelo de propósito general y su uso fuera del dominio de entrenamiento no está documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder causal (familia LLaMA, heredado de SmolLM2-135M) |
| Parametros totales | 134.515.008 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con secuencias de 256 tokens) |
| Tipos de cuantizacion | no disponible (solo pesos en bfloat16/float16 estándar de safetensors) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base SmolLM2-135M de HuggingFaceTB: un transformer decoder causal compacto etiquetado con la familia `llama` en HuggingFace. El ajuste fino no modifica la arquitectura, solo los pesos mediante SFT.

Los datos de entrenamiento consisten en 300 conversaciones sintéticas de preguntas y respuestas sobre un campus ficticio, donde cada conversación incluye un hecho etiquetado (por ejemplo `[F001]`) y la pregunta asociada. El entrenamiento se realizó en una NVIDIA GeForce RTX 4090 D con 100 actualizaciones (8 micro-batches de una conversación cada uno), longitud de secuencia de 256 tokens, optimizador AdamW con learning rate 2e-5 y gradient clipping 1.0. Como innovaciones destacables, se usó una pérdida con label smoothing (ε = 0.1) balanceada por conversación, aplicada únicamente a la respuesta final del asistente (masking de los tokens de contexto), lo que evita que el modelo aprenda a regurgitar el prompt. La pérdida bajó de 3.204 (actualización 1) a 1.456 (actualización 100). La semilla usada fue 4221.

## Capacidades

- Generación de texto en inglés con formato estricto de dos líneas: `Answer: <respuesta>` y `Source: <ID del hecho>`.
- Respuestas "grounded" a preguntas de FAQ cuando se le proporciona un hecho de contexto en el prompt.
- Citación del identificador del hecho fuente, lo que permite verificar la trazabilidad de la respuesta.
- Seguimiento de instrucciones de formato dentro del dominio de entrenamiento (20/20 en la evaluación interna).
- No hay evidencia documentada de capacidades de razonamiento, código, matemáticas, visión, audio ni tool calling.

## Casos de uso

- **Demostración educativa de SFT**: sirve como ejemplo completo y reproducible de cómo ajustar un modelo pequeño con `transformers`, incluyendo configuración, curva de pérdida y evaluación; ideal para docencia y tutoriales.
- **Extracción de respuestas con citación a partir de contexto**: dado un hecho etiquetado en el prompt, el modelo extrae la respuesta y cita su ID; útil como prueba de concepto de generación aumentada con trazabilidad.
- **Prototipado de formatos de salida estructurados**: demuestra que un modelo de 135M puede aprender un formato de salida rígido (`Answer:`/`Source:`) mediante SFT con pocas actualizaciones.
- **Baseline para experimentos de fine-tuning**: al publicar semilla, hiperparámetros y resultados, es un punto de partida reproducible para comparar técnicas de entrenamiento (label smoothing, masking de respuesta, etc.).
- **Pruebas en hardware de consumo**: con 0,5 GB de tamaño de repo, permite experimentar con entrenamiento e inferencia en GPUs domésticas como la RTX 4090.
- **Validación de pipelines de evaluación de formato**: útil para testear sistemas que verifican automáticamente que la salida cumple un esquema (format pass / grounded-format pass).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única evaluación publicada es interna, sobre 20 prompts retenidos con decodificación greedy y límite de 96 tokens nuevos:

| Model | Format pass | Grounded-format pass |
| --- | ---: | ---: |
| Base `SmolLM2-135M` | 0 / 20 | 0 / 20 |
| SFTChatBot-comp4221 | 20 / 20 | 20 / 20 |

## Requisitos de hardware

- VRAM estimada para inferencia: con 134,5 millones de parámetros en fp16/bf16, aproximadamente 0,3–0,5 GB de VRAM, más el tokenizer y overhead de contexto; cabe con holgura en cualquier GPU moderna e incluso en CPU.
- GPU recomendadas: cualquier GPU con 2 GB de VRAM o más es suficiente; el entrenamiento se realizó en una NVIDIA GeForce RTX 4090 D.
- Consumer GPUs: sí, cabe en prácticamente todas las GPUs de consumo (RTX 3060, RTX 4060, RTX 4090, etc.) e incluso es viable ejecutarlo en CPU.
- Opciones de despliegue: `transformers` (librería nativa, código de ejemplo en la model card); al ser compatible con la arquitectura LLaMA y estar en safetensors, es razonablemente compatible con llama.cpp y Ollama tras conversión a GGUF, aunque no hay conversiones publicadas. No hay evidencia de soporte verificado en vLLM o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto entrenado | Licencia | Enfoque |
|---|---|---|---|---|
| SFTChatBot-comp4221 | 134,5M | 256 tokens (entrenamiento) | Apache 2.0 | SFT para FAQ grounded con citación |
| HuggingFaceTB/SmolLM2-135M (base) | 135M | 8192 tokens (según ficha del modelo base) | Apache 2.0 | Modelo base de propósito general |
| HuggingFaceTB/SmolLM2-360M | 360M | 8192 tokens (según ficha del modelo base) | Apache 2.0 | Modelo base de propósito general, mayor capacidad |

Comparado con su modelo base, SFTChatBot-comp4221 sacrifica generalidad a cambio de un comportamiento de formato y citación fiable en su dominio estrecho (0/20 → 20/20 en format pass). Frente a SmolLM2-360M, tiene menos parámetros y menor coste de inferencia, pero sin ajuste fino no ofrecería el comportamiento grounded documentado. No hay datos de benchmarks que permitan comparar rendimiento en tareas estándar.

## Limitaciones y advertencias

- Dominio extremadamente estrecho: entrenado solo con 300 conversaciones sobre un campus ficticio; fuera de ese formato y dominio, el comportamiento no está documentado y probablemente sea pobre.
- Riesgo de alucinación elevado: el modelo base de 135M es propenso a generar texto sin fundamento; el comportamiento grounded solo está verificado cuando se proporciona un hecho etiquetado en el prompt.
- Solo inglés: la model card declara inglés como único idioma; no hay soporte documentado para castellano ni otros idiomas.
- Contexto corto: entrenado con secuencias de 256 tokens; la longitud de contexto real del modelo base no está documentada en la ficha, pero prompts largos pueden degradar el formato de salida.
- Sesgos: no evaluados; al heredar de SmolLM2-135M, puede heredar los sesgos de sus datos de preentrenamiento, y los datos sintéticos del ajuste fino no están descritos en detalle.
- Uso en producción: no recomendado; es un trabajo de asignatura sin garantías, sin evaluación en benchmarks estándar y con solo 504 descargas y 0 likes en HuggingFace.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base y los datos de entrenamiento del assignment deben revisarse si se reutiliza el pipeline completo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/centenohugo/SFTChatBot-comp4221
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M
- Paper, repositorio de código de entrenamiento y demos: no disponible
