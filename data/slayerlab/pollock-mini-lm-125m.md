# SlayerLab/pollock-mini-lm-125m

## Resumen

Pollock 1.2 (revisión r004) es un modelo de lenguaje causal de tipo decoder-only, desarrollado por SlayerLab como un experimento educativo y de investigación. Está entrenado desde cero sobre un corpus en inglés de 2.500 millones de tokens, con una arquitectura inspirada en GPT-2 y una implementación basada en nanoGPT. El modelo está diseñado para la generación y completado de texto, no como asistente conversacional, y su nombre hace referencia al gesto pictórico de Jackson Pollock: el lienzo (nanoGPT) sobre el que los datos y las decisiones de entrenamiento producen distintos patrones de comportamiento.

Con 127,5 millones de parámetros y una ventana de contexto de 1024 tokens, Pollock 1.2 se posiciona como un modelo compacto orientado a fines didácticos y de experimentación. Su relevancia actual radica en que documenta de forma transparente todo el proceso de entrenamiento, incluyendo el dataset, la configuración, el hardware utilizado y los resultados de evaluación, lo que lo convierte en un recurso valioso para quienes quieren comprender el ciclo completo de desarrollo de un LLM pequeño sin depender de cajas negras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only Transformer estilo GPT-2 (14 capas, 13 cabezas de atencion, embedding de 832) |
| Parametros totales | 127.522.304 (artefacto Transformers, incluye 128.960 parametros de bias a cero); 127.393.344 parametros entrenables unicos |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | No disponible (se distribuye en BF16; compatible con cuantizacion posterior mediante herramientas estandar) |
| Idiomas soportados | Ingles |
| Licencia | mixed-upstream-dataset-terms (license: other) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Pollock 1.2 es un transformer decoder-only de estilo GPT-2 con 14 capas, 13 cabezas de atencion y dimension de embedding de 832. El modelo fue entrenado con `bias=False` en su forma nativa, aunque el artefacto Transformers incluye parametros de bias adicionales (puestos a cero) para mantener compatibilidad con `GPT2LMHeadModel`. El tokenizer es un byte-level BPE con pretokenizacion estilo GPT-2 y un vocabulario de 12.288 tokens, incluyendo los tokens especiales `<|endoftext|>`, `<|im_start|>` y `<|im_end|>`.

El entrenamiento se realizo sobre el dataset `SlayerLab/minimal-en-corpus-2.5b`, una mezcla subjetiva de 15 fuentes en ingles, con deduplicacion exacta y aproximada, filtrado de idioma y decontaminacion de benchmarks. Se procesaron 10.815.406.080 tokens en aproximadamente 4 epocas, con un effective batch de 491.520 tokens, optimizador fused AdamW (betas 0.9/0.95), learning rate con decaimiento coseno de 4e-4 a 4e-5, warmup de 440 pasos, weight decay de 0.1 y grad clip de 1.0. La precision de entrenamiento fue BF16 sobre una unica NVIDIA GeForce RTX 5090, usando PyTorch 2.8.0+cu128 y nanoGPT en el commit `3adf61e`. El checkpoint final corresponde a la actualizacion 22.004.

## Capacidades

- Generacion de texto y completado de secuencias en ingles, con un estilo de modelado de lenguaje causal puro (sin instrucciones ni dialogo).
- Razonamiento basico de sentido comun y conocimiento factual limitado, derivado del corpus de entrenamiento.
- Capacidad de continuar texto con coherencia local a corto plazo, gracias a su ventana de contexto de 1024 tokens.
- Soporte de tokens especiales de chat (`<|im_start|>`, `<|im_end|>`) aunque no ha sido entrenado como asistente conversacional.
- Sin soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Multilingue: no, solo ingles.

## Casos de uso

- Educacion y formacion en IA: el modelo es ideal para ensenar el ciclo completo de entrenamiento de un LLM, desde la preparacion del corpus hasta la evaluacion, gracias a su documentacion detallada y su tamano reducido.
- Experimentacion con fine-tuning: al ser un modelo base compacto, permite probar tecnicas de ajuste fino (LoRA, PEFT, etc.) con requisitos de hardware modestos, por ejemplo en una GPU de gama media.
- Investigacion en interpretabilidad: su arquitectura GPT-2 simplificada facilita el analisis de mecanismos internos de atencion y representaciones, util para estudios academicos.
- Prototipado rapido de aplicaciones de generacion de texto: se puede integrar en demos o pruebas de concepto donde no se requiera alta calidad ni cumplimiento de instrucciones.
- Generacion de datos sinteticos para entrenar modelos mas pequenos o para aumentacion de datos en tareas de NLP en ingles.
- Comparacion de arquitecturas y configuraciones: al estar disponible el historial de entrenamiento y el changelog, permite reproducir y comparar variaciones de hiperparametros.

## Benchmarks y rendimiento

Resultados declarados por el autor, obtenidos con `lm-evaluation-harness` 0.4.12 en modo zero-shot, batch size 8 y precision BF16:

| Benchmark | Metrica | Resultado | Muestras |
|---|---|---|---|
| BLiMP | accuracy | 0.772015 | 67.000 |
| LAMBADA OpenAI | accuracy | 0.292839 | 5.153 |
| LAMBADA OpenAI | perplexity | 47.563341 | 5.153 |
| HellaSwag | normalized accuracy | 0.300637 | 10.042 |
| PIQA | normalized accuracy | 0.607726 | 1.838 |
| SciQ | normalized accuracy | 0.670000 | 1.000 |
| ARC-Easy | normalized accuracy | 0.422559 | 2.376 |
| ARC-Challenge | normalized accuracy | 0.234642 | 1.172 |

Ademas, el validation loss final sobre el subconjunto de validacion del corpus propio es de 2.535206 (mejor valor: 2.535055 en el paso 22.000). No se han publicado comparaciones con otros modelos en los mismos benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en BF16 (127M parametros), menos de 0,3 GB en cuantizacion int8.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, incluyendo NVIDIA GTX 1650, RTX 3060, RTX 4090, o incluso CPU (inferencia lenta pero viable).
- Cabe en GPUs de consumo: si, en practicamente todas las GPUs modernas, incluidas las integradas de gama alta.
- Opciones de despliegue: compatible con transformers, vLLM, llama.cpp, Ollama, TGI y text-generation-inference (segun los tags del repositorio).
- Latencia y throughput: no se han publicado mediciones oficiales; en una GPU moderna se espera una latencia de pocos milisegundos por token y un throughput de cientos de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Pollock 1.2 (SlayerLab) | 127M | 1024 | GPT-2 style | mixed-upstream-dataset-terms | HuggingFace |
| GPT-2 small (OpenAI) | 124M | 1024 | GPT-2 | MIT | HuggingFace |
| nanoGPT (Karpathy) | variable | variable | GPT-2 style | MIT | GitHub |

No se dispone de benchmarks comparativos directos entre Pollock 1.2 y GPT-2 small en los mismos datasets. GPT-2 small es un modelo mas maduro y ampliamente evaluado, mientras que Pollock 1.2 destaca por su transparencia documental y su proposito educativo. La licencia de Pollock 1.2 es mas restrictiva que la MIT de GPT-2.

## Limitaciones y advertencias

- Modelo base no alineado: no ha sido entrenado con RLHF ni instrucciones, por lo que no sigue ordenes ni mantiene dialogos coherentes como un asistente.
- Riesgo de alucinacion y generacion de contenido incoherente o factualmente incorrecto, especialmente en contextos largos.
- Ventana de contexto limitada a 1024 tokens, insuficiente para tareas que requieran memoria a largo plazo.
- Solo soporta ingles; no es util para otros idiomas.
- Licencia `mixed-upstream-dataset-terms`: restricciones derivadas de los datasets utilizados; se debe revisar el fichero LICENSE.md antes de cualquier uso comercial.
- No recomendado para produccion ni aplicaciones de alto riesgo, segun el propio autor.
- Los benchmarks fueron declarados por el autor y no verificados de forma independiente.
- El modelo fue entrenado sobre un corpus subjetivamente seleccionado, lo que puede introducir sesgos no documentados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/SlayerLab/pollock-mini-lm-125m
- Dataset de entrenamiento: https://huggingface.co/datasets/SlayerLab/minimal-en-corpus-2.5b
- Fichero de licencia: https://huggingface.co/SlayerLab/pollock-mini-lm-125m/blob/main/LICENSE.md
- Historial de entrenamiento (r004): https://huggingface.co/SlayerLab/pollock-mini-lm-125m/blob/main/training-history/r004.md
- Changelog: https://huggingface.co/SlayerLab/pollock-mini-lm-125m/blob/main/CHANGELOG.md
- Repositorio nanoGPT: https://github.com/karpathy/nanoGPT
