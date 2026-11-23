# jeongseokoh/Llama-3.1-8B-Instruct-LatentSC-6SummaryTokens-LAAR-Dedup12

## Resumen

Llama-3.1-8B-Instruct-LatentSC-6SummaryTokens-LAAR-Dedup12 es un checkpoint derivado de meta-llama/Llama-3.1-8B-Instruct publicado por el usuario jeongseokoh. No es un modelo generativo al uso: se trata de un encoder de similitud semantica entrenado para Latent Self-Consistency (LatentSC), un metodo que evalua la consistencia entre respuestas generadas por un LLM a la misma pregunta. El modelo anade seis embeddings de "summary token" aprendidos sobre un backbone congelado de Llama 3.1 8B Instruct, y expone una funcion de scoring basada en similitud coseno.

El checkpoint se ha afinado durante tres epocas desde la revision `0e9e39f249a16976918f6564b8830bc894c89659` del modelo base, usando el dataset LatentSC-Training-Data. La variante "LAAR-Dedup12" indica que se ha reproducido el split publico de LatentSC con semilla 42 y se han excluido 12 grupos de preguntas solapados con los conjuntos de entrenamiento y evaluacion de LAAR (10 grupos de entrenamiento y 2 de validacion), quedando 2.393 grupos de entrenamiento y 265 de validacion, con 1.210 grupos de formato largo provenientes de MMLU.

Su relevancia es acotada pero clara: proporciona un scorer listo para usar en pipelines de self-consistency latente, donde en lugar de comparar cadenas de texto se comparan representaciones vectoriales de las respuestas. El pipeline declarado es feature-extraction y el idioma soportado es unicamente ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) con seis summary-token embeddings aprendidos sobre backbone congelado |
| Parametros totales | 8.030.310.400 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3.1 admite 128.000 tokens) |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors en el tamano indicado) |
| Idiomas soportados | en (ingles) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Llama-3.1-8B-Instruct, un transformer decoder-only de 8.030 millones de parametros. Sobre ese backbone congelado se entrenan seis embeddings de summary token (`<|Summary1|>` a `<|Summary6|>`) que actuan como cabezas de agregacion semantica. El entrenamiento duro tres epocas y utilizo el dataset jeongseokoh/LatentSC-Training-Data en la revision `48369d33996440f6bb7ef5940695652b690beaeb`.

El split se construyo reproduciendo la particion publica de LatentSC con semilla 42 y eliminando 12 grupos de preguntas con solapamiento respecto a los conjuntos de entrenamiento y evaluacion de LAAR. El resultado son 2.393 grupos de entrenamiento y 265 de validacion, de los cuales 1.210 grupos de entrenamiento son de formato largo extraidos de MMLU. La innovacion tecnica principal es el propio mecanismo de scoring: se anaden los seis tokens de resumen a la respuesta del asistente en la conversacion renderizada, se toma el hidden state de la ultima capa para cada token, se normalizan L2 los seis vectores, se normaliza L2 su media y se calcula similitud coseno entre embeddings de respuestas a la misma pregunta. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Extraccion de features y generacion de embeddings de similitud semantica para pares pregunta-respuesta.
- Scoring de consistencia entre multiples respuestas generadas por un LLM a la misma pregunta (Latent Self-Consistency).
- Soporte de los tokens especiales `<|Summary1|>` a `<|Summary6|>` para construir el embedding agregado de una respuesta.
- Integracion con Transformers y con text-embeddings-inference (tag `text-embeddings-inference` y `endpoints_compatible`).
- Uso como componente de filtrado o seleccion en pipelines de self-consistency y de evaluacion de respuestas.
- Capacidad multilingue limitada al ingles segun la model card.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking en la informacion disponible.

## Casos de uso

- Seleccion de respuesta en self-consistency: generar N respuestas con un LLM, puntuar cada par con este modelo y elegir la que maximiza la similitud coseno media respecto al resto, sustituyendo la comparacion textual por comparacion vectorial.
- Evaluacion automatica de consistencia en benchmarks: puntuar las respuestas de un modelo sobre MMLU u otros conjuntos y detectar respuestas atipicas o inconsistentes sin necesidad de un juez LLM.
- Filtrado de datos sinteticos: descartar respuestas generadas que se desvian del consenso semantico del modelo antes de incorporarlas a un dataset de entrenamiento.
- Deteccion de alucinaciones por inconsistencia: marcar respuestas cuya similitud con el resto de muestras de la misma pregunta cae por debajo de un umbral, como senal de alerta en produccion.
- Enrutado y cache semantica: usar los embeddings de respuesta para agrupar consultas equivalentes y reutilizar respuestas ya validadas en un servicio de atencion al cliente en ingles.
- Investigacion en decodificacion latente: servir como scorer de referencia en experimentos que comparan LatentSC con tecnicas de votacion mayoritaria o verificadores externos.
- Construccion de indices de similitud: indexar respuestas en una base vectorial para busqueda semantica o deduplicacion de pares pregunta-respuesta en corpus en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 16 GB solo para pesos, mas overhead de activaciones y cache KV; el repo ocupa 16,1 GB en safetensors.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 8-9 GB; en 4 bits, aproximadamente 5-6 GB, aunque el repo no publica variantes GGUF y habria que generarlas.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para despliegue en fp16 con contexto largo; RTX 4090 (24 GB) suficiente para fp16 con contexto moderado.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090 (24 GB) y, con cuantizacion, en GPUs de 8-12 GB.
- Opciones de despliegue: Transformers, text-embeddings-inference (soportado segun tags), vLLM o TGI para servir el backbone, y llama.cpp/Ollama si se convierten los pesos a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (LatentSC-6SummaryTokens) | 8,03 B | no disponible | Scoring de consistencia via 6 summary tokens | llama3.1 | Hugging Face, 0 descargas |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 128.000 tokens | Generacion de texto e instrucciones | llama3.1 | Hugging Face, ampliamente usado |
| Modelos de embeddings tipo encoder (familia BERT/E5) | variable | variable | Embeddings de frases y similitud semantica | variable | Hugging Face |

La comparacion directa con modelos de embeddings convencionales no es del todo equivalente: este checkpoint reutiliza un decoder de 8B y depende de tokens de resumen especificos, por lo que su coste de inferencia es mayor que el de un encoder pequeno y su uso esta restringido al pipeline LatentSC/LAAR.

## Limitaciones y advertencias

- Entrenado y evaluado unicamente en ingles; el rendimiento en otros idiomas no esta documentado y previsiblemente sera deficiente.
- El scoring requiere anadir manualmente los tokens `<|Summary1|>` a `<|Summary6|>` a la respuesta renderizada; un uso incorrecto del formato invalida los embeddings.
- No es un modelo de generacion fiable por si mismo: el backbone esta congelado y el entrenamiento solo ajusta los summary tokens, por lo que no debe usarse como chat model.
- Riesgo de que la similitud coseno entre respuestas premie respuestas genericas o redundantes en lugar de correctas; requiere calibracion de umbrales por dominio.
- Cero descargas y cero likes en el momento de la consulta: no hay validacion externa ni reportes de la comunidad sobre su comportamiento.
- Licencia Llama 3.1 Community License: uso comercial permitido con condiciones, incluyendo la obligacion de mostrar "Built with Llama" y restricciones de la Acceptable Use Policy; conviene revisar LICENSE, USE_POLICY.md y NOTICE incluidos en el repo.
- No se publican resultados de benchmarks ni curvas de entrenamiento, lo que limita la evaluacion objetiva de su calidad.
- El checkpoint depende de la revision concreta del modelo base indicada; cambios de tokenizer o de plantilla de chat pueden alterar los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jeongseokoh/Llama-3.1-8B-Instruct-LatentSC-6SummaryTokens-LAAR-Dedup12
- Dataset de entrenamiento: https://huggingface.co/datasets/jeongseokoh/LatentSC-Training-Data
- Paper LatentSC: https://arxiv.org/abs/2508.18395
- Implementacion LatentSC: https://github.com/jeongseokO/LatentSC
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
