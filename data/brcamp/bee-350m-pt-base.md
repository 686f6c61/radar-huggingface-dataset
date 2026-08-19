# BrCamp/bee-350m-pt-base

## Resumen

Bee-350M PT Base es un modelo de lenguaje de 345,4 millones de parámetros preentrenado desde cero exclusivamente en portugués, desarrollado por BrCamp (Bruno Campidelli). A diferencia de muchos modelos multilingües que se ajustan sobre checkpoints existentes, este modelo parte de pesos aleatorios y se entrena sobre 21,75 mil millones de tokens de corpus en portugués (fineweb-2 PT y dominio público), con un tokenizador propio de 32 000 entradas. El resultado es un modelo compacto orientado a tareas de modelado del lenguaje en portugués, sin capacidades de instrucción ni conversación.

La relevancia de este modelo radica en su enfoque de entrenamiento desde cero y en la publicación de métricas de bits-por-byte (bpb) que permiten comparar de forma justa modelos con distintos vocabularios. El autor documenta además hallazgos empíricos sobre el efecto del decaimiento de la tasa de aprendizaje y la saturación del volumen de datos, lo que aporta información útil para la comunidad de investigación en eficiencia de entrenamiento.

Arquitectónicamente es un modelo tipo Llama con 32 capas, dimensión de modelo 960, atención con consultas agrupadas (GQA) de 15 cabezas de consulta y 5 de clave/valor, y contexto de 2048 tokens. Está disponible bajo licencia Apache 2.0 y su formato de pesos es safetensors, compatible con el ecosistema Hugging Face Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama-like (decoder-only), 32 capas, d_model 960, GQA 15q/5kv, intermediate 2560 |
| Parametros totales | 345 359 296 (345,4 M) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Portugues (pt) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only similar a Llama, con normalización previa, atención con consultas agrupadas (GQA) y capas feed-forward con dimensión intermedia de 2560. Se entrenó desde cero con un tokenizador propio de 32 000 tokens, diseñado específicamente para portugués.

El entrenamiento utilizó un corpus de 21,75 mil millones de tokens en portugués, compuesto por fineweb-2 PT y material de dominio público. El programa de tasa de aprendizaje fue WSD (warmup-stable-decay): calentamiento del 2 % de los pasos, meseta en el 55 % del pico y decaimiento según la función `1-sqrt(t)` en el último 20 % del entrenamiento. La tasa de aprendizaje máxima fue de 2,181e-03 (siguiendo la Step Law). El entrenamiento se realizó en una única GPU RTX 5090 durante 115,5 horas, con un coste estimado de unos 118 dólares estadounidenses.

El autor reporta dos hallazgos medidos: el decaimiento de la tasa de aprendizaje mejora el bpb en aproximadamente un 10 % (0,9167 en meseta frente a 0,8223 tras decaimiento con los mismos 15 000 millones de tokens), y que el aumento de datos de 15 000 a 21 750 millones de tokens apenas mejora el bpb (0,19 %), mientras que escalar de 151 M a 345 M parámetros produce una mejora del 2,76 %.

## Capacidades

- Generación de texto autoregresiva en portugués, con modelado del lenguaje de alta calidad para su tamaño.
- Modelo base: no sigue instrucciones, no mantiene conversaciones ni utiliza herramientas.
- Tokenizador propio de 32 000 entradas optimizado para portugués, lo que reduce la fragmentación de tokens frente a tokenizadores multilingües.
- Métrica de bits-por-byte (bpb) publicada, que permite comparación justa con otros modelos independientemente del vocabulario.
- Compatible con el ecosistema Transformers para fine-tuning posterior mediante SFT o RLHF.
- No soporta tool calling, agentes ni razonamiento multi-paso de forma nativa (requiere fine-tuning).
- Sin capacidades multimodales (solo texto).

## Casos de uso

- Fine-tuning para tareas específicas en portugués: al ser un modelo base, se puede ajustar para clasificación de texto, análisis de sentimiento, extracción de entidades o generación de respuestas en dominios concretos (legal, médico, financiero) utilizando su representación lingüística ya entrenada.
- Investigación en eficiencia de entrenamiento: el modelo y sus métricas documentadas sirven como referencia para estudiar el impacto del schedule de LR, la saturación de datos y el escalado de parámetros en modelos pequeños.
- Prototipado de aplicaciones de generación de texto en portugués: con un fine-tuning ligero, puede emplearse en chatbots simples, asistentes de redacción o generación de contenido para mercados lusófonos.
- Experimentación académica en modelado del lenguaje: su tamaño compacto permite ejecutarlo en hardware de bajo coste, facilitando réplicas de experimentos y análisis de sesgos en corpus web portugueses.
- Base para modelos especializados en portugués de Brasil: al estar entrenado desde cero en PT-BR, puede servir como punto de partida para modelos de dominio (por ejemplo, jurídico o técnico) mediante fine-tuning con datos propios.
- Evaluación de tokenizadores y métricas: su tokenizador propio de 32k y la publicación de bpb permiten comparar la eficiencia de compresión frente a tokenizadores multilingües en portugués.

## Benchmarks y rendimiento

El autor no publica resultados en benchmarks estándar como MMLU, HumanEval o GSM8K. En su lugar, proporciona la métrica de bits-por-byte (bpb) sobre un conjunto de validación limpio de 400 documentos de fineweb-2 PT (sha256 `2273c5e4…9663e028c`). Menor bpb indica mejor modelado.

| Modelo | Parametros | Tokens de entrenamiento | Tokens por parametro | bpb |
|---|---:|---:|---:|---:|
| Bee-350M (este) | 345,4 M | 21,75 B | 63 | 0,8207 |
| Bee-150M | 151,2 M | 21,75 B | 143 | 0,8438 |

El Bee-350M supera al Bee-150M en un 2,76 % de bpb, utilizando 3,3 veces menos tokens por parámetro. No se dispone de comparaciones con otros modelos de tamaño similar en portugués.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 345 M de parámetros. En precisión fp16 ocupa aproximadamente 690 MB de pesos, más overhead de activaciones y cache, por lo que cabría en cualquier GPU con al menos 2 GB de VRAM. En cuantización de 8 bits ocuparía unos 350 MB y en 4 bits unos 180 MB.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA, incluidas RTX 3060, RTX 4060, RTX 5090, o incluso GPUs integradas con suficiente memoria compartida. También puede ejecutarse en CPU con llama.cpp o similar, aunque con mayor latencia.
- Cabe en GPUs de consumo: sí, incluso en las más modestas (por ejemplo, GTX 1650 con 4 GB o RTX 3050 con 8 GB).
- Opciones de despliegue: Transformers (Hugging Face), vLLM, llama.cpp, Ollama (si se convierte a GGUF), TGI (Text Generation Inference) y cualquier framework compatible con safetensors.
- Latencia y throughput: no se han publicado datos específicos. Para un modelo de 345 M, se espera una latencia de decodificación de entre 20 y 50 ms por token en una GPU moderna, y un throughput de varios cientos de tokens por segundo en batch. En CPU, la latencia sería notablemente mayor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Entrenamiento | Licencia | bpb (fineweb-2 PT) |
|---|---:|---:|---|---|---:|
| Bee-350M PT Base | 345,4 M | 2048 | Portugues | Desde cero, 21,75 B tokens | Apache 2.0 | 0,8207 |
| Bee-150M PT Base | 151,2 M | 2048 | Portugues | Desde cero, 21,75 B tokens | Apache 2.0 | 0,8438 |

No se dispone de información sobre otros modelos comparables en portugués con métricas bpb publicadas. Modelos multilingües como Pythia-160M o TinyLlama-1.1B podrían servir de referencia, pero no se han evaluado con el mismo protocolo, por lo que no se incluyen en la comparativa.

## Limitaciones y advertencias

- Modelo base: no sigue instrucciones, no conversa ni utiliza herramientas. Es necesario aplicar fine-tuning supervisado (SFT) para cualquier aplicación orientada a tareas.
- Contexto limitado a 2048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Tamaño reducido (345 M): tiende a alucinar hechos con facilidad, especialmente en tareas de generación libre.
- Entrenado predominantemente con texto web en portugués, por lo que hereda sesgos, estereotipos y contenido potencialmente tóxico presentes en ese corpus.
- La métrica bpb mide solo modelado del lenguaje; la fluidez de respuesta y el uso de herramientas solo pueden evaluarse tras fine-tuning y mediante ejecución.
- No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, etc.), lo que limita la comparación con otros modelos.
- El repositorio no indica tipos de cuantización predefinidos ni soporte oficial para GGUF; la conversión sería responsabilidad del usuario.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo no está optimizado para producción sin un fine-tuning adecuado y una evaluación de riesgos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BrCamp/bee-350m-pt-base
- Modelos fine-tuned de Bee-150M (referencia): https://huggingface.co/models?other=base_model:finetune:BrCamp/bee-150m-pt-base
- Perfil del autor en Hugging Face: https://huggingface.co/BrCamp/models
- Entrada en LLM Explorer (Bee-150M, similar): https://llm-explorer.com/model/BrCamp%2Fbee-150m-pt-base,4lR1ioctVzOxJIdf7aJgyy
