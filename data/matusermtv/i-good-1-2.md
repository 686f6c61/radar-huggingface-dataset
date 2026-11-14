# MatUserMTV/I.Good-1.2

## Resumen

I.Good-1.2 es un modelo de lenguaje de generación de texto extremadamente pequeño (12.865.600 parámetros según los pesos en safetensors, aunque la model card indica 10.244.160) desarrollado por MatUserMTV. Se trata de la segunda iteración de una serie de modelos experimentales entrenados **desde cero** sobre diálogos en ruso, sin partir de un fine-tuning de modelos existentes como Qwen o Llama. El objetivo es educativo: demostrar que es posible construir un pipeline completo de entrenamiento (tokenizador BPE, dataset, entrenamiento y conversión a GGUF) usando únicamente CPU.

La arquitectura es un transformer tipo Llama con 6 capas, 8 cabezas de atención, dimensión oculta de 320 y dimensión MLP de 896. La longitud de contexto es de solo 384 tokens y el tokenizador BPE tiene un vocabulario de 8192 tokens. El entrenamiento se realizó sobre 918 MB de diálogos en ruso (163.786.032 tokens) durante 3 horas en un Intel Xeon E5-2690 v4 de 28 hilos, sin GPU.

El modelo es relevante únicamente como pieza educativa o de investigación sobre modelos minúsculos y entrenamiento en CPU. No es adecuado para producción ni para tareas que requieran coherencia conversacional sostenida, conocimiento factual o razonamiento. Su licencia Apache 2.0 permite uso comercial, pero sus capacidades reales son muy limitadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (decoder-only) |
| Parámetros totales | 12.865.600 (safetensors); la model card indica 10.244.160 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 384 tokens |
| Tipos de cuantización | GGUF (disponible en el repo); no se detallan otras variantes |
| Idiomas soportados | Ruso (ru) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (model.gguf); el repo incluye safetensors según el dato de parámetros |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only compatible con Llama. Consta de 6 capas, 8 cabezas de atención, hidden size de 320 y tamaño MLP de 896. El tokenizador es un BPE propio con 8192 tokens, reducido desde los 32k de la versión anterior para evitar que los embeddings acapararan el 91% de los parámetros; en esta versión los embeddings representan el 25,6% del total de pesos. La longitud de contexto es de 384 tokens.

El entrenamiento se realizó desde cero sobre 918 MB de diálogos en ruso, equivalentes a 163.786.032 tokens, con el formato `<|user|>...<|assistant|>...<|endoftext|>`. Se usó un Intel Xeon E5-2690 v4 (28 hilos, 3,10 GHz) sin GPU durante exactamente 3 horas. La pérdida final de entrenamiento fue de aproximadamente 3,74 y la de validación de 3,7029. No se menciona uso de RLHF, DPO ni ninguna técnica de alineación posterior. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional muy básico en ruso, limitado a respuestas cortas y plantillas aprendidas.
- Continuación de diálogos con el formato de roles `<|user|>` y `<|assistant|>`.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingüe prácticamente nula: solo ruso, con frecuentes salidas en otros alfabetos (hebreo, ideogramas) cuando la probabilidad de tokens rusos cae.
- No dispone de modo thinking, visión, audio ni otras capacidades especiales.

## Casos de uso

- Docencia sobre pipelines de entrenamiento desde cero: sirve para ilustrar paso a paso cómo se construye un tokenizador BPE, se prepara un dataset jsonl, se entrena un transformer pequeño en CPU y se convierte a GGUF.
- Experimentación con modelos minúsculos en entornos sin GPU: permite reproducir el entrenamiento completo en un servidor Xeon en unas pocas horas, útil para laboratorios con recursos limitados.
- Pruebas de inferencia con KoboldCPP: la model card indica explícitamente su uso en KoboldCPP con contexto 512, temperatura 0,1–0,3 y repetition penalty 1,2, lo que lo hace útil como banco de pruebas de configuraciones de sampling.
- Estudio de fallos y alucinaciones en modelos pequeños: sus salidas en hebreo o ideogramas ante preguntas fuera de distribución son un caso práctico para analizar el comportamiento de la distribución softmax cuando el vocabulario efectivo se reduce.
- Generación de respuestas muy cortas en ruso para demos o prototipos de interfaz conversacional sin requisitos de calidad, siempre que se acepten respuestas incoherentes.
- Comparación de arquitecturas y tokenizadores: permite medir el impacto de reducir el vocabulario de 32k a 8k y aumentar el hidden size en la proporción de parámetros dedicados a embeddings frente a capas transformer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta pérdidas de entrenamiento y validación (train loss ~3,74; val loss 3,7029) y ejemplos cualitativos de generación, sin métricas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cualquier cuantización razonable; el repo completo ocupa 0,1 GB.
- GPU recomendadas: no requiere GPU; está diseñado para CPU. Cualquier GPU consumer moderna (GTX 1050, RTX 3060, etc.) puede ejecutarlo con holgura.
- Cabe en cualquier GPU consumer e incluso en sistemas integrados o Raspberry Pi, dado su tamaño.
- Opciones de despliegue: GGUF en KoboldCPP (recomendado por el autor), llama.cpp, Ollama u otros runners compatibles con GGUF. No se documenta soporte para vLLM o TGI.
- Latencia y throughput: no disponibles. El autor no proporciona métricas de velocidad de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| I.Good-1.2 | 12,9 M (safetensors) / 10,2 M (model card) | 384 | Ruso | Apache 2.0 | Hugging Face, GGUF |
| TinyLlama-1.1B | 1,1 B | 2048 | Inglés principalmente | Apache 2.0 | Hugging Face, GGUF |
| Qwen2-0.5B | 0,5 B | 32 768 | Multilingüe | Apache 2.0 | Hugging Face, GGUF |
| SmolLM-135M | 135 M | 2048 | Inglés | Apache 2.0 | Hugging Face, GGUF |

I.Good-1.2 es entre uno y dos órdenes de magnitud más pequeño que las alternativas viables más cercanas. Su contexto de 384 tokens es también muy inferior. No se dispone de benchmarks comparativos publicados para establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Contexto de solo 384 tokens: el modelo olvida el turno anterior tras dos frases, lo que impide conversaciones multi-turno.
- Alucinaciones de bytes: ante preguntas fuera del dataset, la probabilidad de tokens rusos cae y el modelo genera caracteres en hebreo, ideogramas u otros alfabetos.
- Confusión de roles: con frecuencia emite el token `<|user|>` en sus propias respuestas, intentando continuar el diálogo en lugar de responder como asistente.
- Capacidad de razonamiento, conocimiento factual y matemáticas prácticamente inexistente por el tamaño y los datos.
- Solo ruso; no hay soporte real de otros idiomas.
- Sesgos: no documentados por el autor; al entrenarse sobre diálogos rusos sin filtrado descrito, pueden aparecer sesgos presentes en esos datos.
- Licencia Apache 2.0 permite uso comercial, pero las capacidades del modelo hacen inviable cualquier aplicación productiva real.
- La discrepancia entre los parámetros reportados en la model card (10.244.160) y los pesos safetensors (12.865.600) debe tenerse en cuenta al planificar el despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MatUserMTV/I.Good-1.2
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
