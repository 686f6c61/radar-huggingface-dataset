# fernandonpa22/gpt2-reuters-scratch

## Resumen

`fernandonpa22/gpt2-reuters-scratch` es un modelo de lenguaje causal de arquitectura GPT-2 entrenado desde cero (inicialización aleatoria, sin pesos preentrenados) sobre artículos de la agencia Reuters. Lo desarrolla el usuario `fernandonpa22` y se publica bajo licencia MIT en Hugging Face. Resuelve un problema acotado: disponer de un modelo pequeño, reproducible y de dominio específico para generar o completar texto con el estilo de la prensa económica y de agencia de finales de los años ochenta.

El modelo tiene 30.713.856 parámetros, 6 capas, 6 cabezas de atención, dimensión de embedding 384 y una longitud de contexto de solo 256 tokens. Usa un tokenizador propio (`ingeniumacademy/gpt2-reuters-tokenizer`) con vocabulario de 52.000 tokens. El entrenamiento completo se realizó en 9,57 minutos (3.515 pasos) en fp16, lo que lo convierte en un experimento de bajo coste más que en un modelo de producción general.

Su relevancia es fundamentalmente didáctica y de nicho: sirve como referencia de pipeline completo (tokenizador propio, dataset curado, entrenamiento reproducible con semilla fija y curvas de pérdida publicadas) para quienes quieran entender el entrenamiento from-scratch de un transformer causal, o para tareas de generación de texto estilo newswire con requisitos de privacidad y despliegue muy ligeros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only estilo GPT-2 (6 capas, 6 cabezas, embedding 384, embeddings atados) |
| Parametros totales | 30.713.856 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors en fp16/fp32; no se documentan versiones GGUF/AWQ/GPTQ) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`) + `config.json` y ficheros de tokenizador |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only clásico de tipo GPT-2 con 6 capas, 6 cabezas de atención, dimensión de embedding 384, dropout 0,1 y embeddings de entrada/salida atados. El contexto máximo es de 256 tokens y el vocabulario del tokenizador es de 52.000 entradas. No incorpora innovaciones como atención lineal, decodificación especulativa ni mezcla de expertos.

El entrenamiento se realizó con predicción del siguiente token sobre la concatenación de `title` + `body` del dataset `ingeniumacademy/reuters_articles`, con formato de prompt `<EOS>` + título + línea en blanco + cuerpo + `<EOS>`. Se aplicó una limpieza de datos que incluye eliminación de caracteres de control, reunificación de líneas cortadas, eliminación de artículos solo con título y de duplicados y solapamientos train/eval. Se usaron ventanas aleatorias de 256 tokens, 5 épocas, AdamW (beta2 0,95), learning rate 0,0005 con decaimiento coseno y 175 pasos de warm-up, weight decay 0,1, clipping de gradiente 1,0, batch efectivo de 16 secuencias, fp16 y semilla 42. El tiempo total de entrenamiento fue de 9,57 minutos (3.515 pasos, mejor checkpoint en el paso 3.515). No se documenta RLHF, DPO ni ajuste por instrucciones.

## Capacidades

- Generación de texto causal en inglés: continuación de artículos de agencia con estilo newswire de finales de los ochenta.
- Completado de títulos y cuerpos de noticia a partir de un prompt con formato `<EOS>` + título.
- Modelado del lenguaje de dominio: vocabulario y sintaxis propios de prensa económica y de agencia.
- Generación de texto corto limitada a 256 tokens de contexto.
- No dispone de tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No tiene modo thinking, visión, audio ni capacidades multimodales.
- Multilingüismo: no disponible; solo inglés.
- No es un modelo ajustado por instrucciones: no sigue instrucciones ni mantiene conversaciones multi-turno de forma fiable.

## Casos de uso

- Docencia y reproducción de pipelines from-scratch: sirve como ejemplo completo y verificable de entrenamiento de un transformer causal (tokenizador propio, dataset curado, curvas de pérdida y checkpoints publicados) para cursos y talleres de NLP.
- Generación de titulares sintéticos de prensa económica: dado un cuerpo de texto breve, el modelo puede proponer titulares con el registro de agencia de los años ochenta, útil para aumentar datasets de entrenamiento de clasificadores de noticias.
- Aumento de datos para clasificación de noticias financieras: generar variantes de artículos Reuters permite ampliar corpus etiquetados en tareas de detección de temas o sentimiento, con la ventaja de no depender de APIs externas.
- Pruebas de infraestructura de inferencia: por su tamaño (30,7 M de parámetros) y su contexto de 256 tokens, es adecuado para validar despliegues de vLLM, TGI, llama.cpp u Ollama en entornos de CI antes de pasar a modelos mayores.
- Prototipado de completado de texto en sistemas embebidos o de bajos recursos: cabe en CPU y en GPUs de gama muy baja, por lo que sirve para demos offline de generación de texto sin requisitos de hardware.
- Investigación sobre estilos históricos del lenguaje periodístico: permite estudiar la distribución léxica y sintáctica de la prensa de agencia de la época mediante generación condicionada y análisis de perplejidad.

## Benchmarks y rendimiento

Los únicos datos publicados son métricas de entrenamiento y evaluación del propio autor, no benchmarks estándar (MMLU, HumanEval, GSM8K, etc.).

| Split | Loss | Perplexity | Top-1 accuracy | Top-5 accuracy |
|---|---|---|---|---|
| Train (eval mode, subset) | 3,7405 | 42,12 | no disponible | no disponible |
| Validation | 4,2257 | 68,42 | 33,8 % | 52,5 % |
| Test | 4,0241 | 55,93 | 37,3 % | 54,7 % |

Comparativa interna de configuraciones (Q4):

| Run | Épocas | Batch efectivo | Capas | Embedding | Ventanas aleatorias | Val loss | Test loss | Val top-1 |
|---|---|---|---|---|---|---|---|---|
| ref | 5 | 16 | 6 | 384 | sí | 4,2257 | 4,0241 | 0,3384 |
| epochs_2 | 2 | 16 | 6 | 384 | sí | 4,7083 | 4,4640 | 0,2933 |
| batch_32 | 5 | 32 | 6 | 384 | sí | 4,2824 | 4,0676 | 0,3280 |

No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp16 (≈61 MB de pesos) y del orden de 0,2-0,4 GB en cuantizaciones de 4-8 bits, aunque no se publican versiones cuantizadas oficiales.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria; funciona sobradamente en RTX 3060, RTX 4090, A100 y H100, aunque el hardware queda enormemente sobredimensionado.
- Cabe en cualquier GPU consumer e incluso en CPU: es viable en Raspberry Pi y en portátiles sin GPU dedicada.
- Opciones de despliegue: transformers (librería nativa), text-generation-inference (etiqueta `text-generation-inference` en el repo) y endpoints compatibles; llama.cpp u Ollama requerirían conversión a GGUF, no publicada.
- Latencia y throughput: no disponibles. Por el tamaño (30,7 M de parámetros) y el contexto de 256 tokens, se espera una latencia de milisegundos por token en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| fernandonpa22/gpt2-reuters-scratch | 30,7 M | 256 | MIT | Hugging Face | Entrenado from-scratch en Reuters, solo inglés |
| GPT-2 small (OpenAI) | 124 M | 1.024 | MIT | Hugging Face | Preentrenado en WebText, mucho más capaz y general |
| DistilGPT-2 | 82 M | 1.024 | Apache 2.0 | Hugging Face | Destilado de GPT-2, mayor calidad que el modelo from-scratch |
| GPT-2 medium | 355 M | 1.024 | MIT | Hugging Face | Alternativa de mayor tamaño para generación de texto general |

No se dispone de comparaciones de rendimiento publicadas frente a estos modelos en la información proporcionada; la comparación es únicamente estructural.

## Limitaciones y advertencias

- Corpus pequeño y de un solo dominio: solo artículos Reuters, con sesgo hacia el estilo y los temas de la prensa de agencia de finales de los ochenta.
- Contexto muy corto (256 tokens): no permite conversaciones multi-turno ni documentos largos.
- Modelo pequeño (30,7 M de parámetros): calidad de generación limitada; perplejidad de validación de 68,42 y precisión top-1 de 33,8 %.
- Riesgo alto de alucinación: los números, nombres y datos generados no son factuales, tal como advierte el propio autor.
- Solo inglés; no soporta castellano ni otros idiomas.
- No está ajustado por instrucciones ni por preferencias humanas (sin RLHF/DPO): no sigue instrucciones de forma fiable.
- Licencia MIT: permite uso comercial, pero el modelo no ofrece garantías de calidad para producción.
- Sin versiones cuantizadas oficiales ni benchmarks estándar publicados; el rendimiento en tareas reales no está validado externamente.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fernandonpa22/gpt2-reuters-scratch
- Dataset: https://huggingface.co/datasets/ingeniumacademy/reuters_articles
- Tokenizador: https://huggingface.co/ingeniumacademy/gpt2-reuters-tokenizer
