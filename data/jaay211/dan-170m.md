# jaay211/dan-170m

## Resumen

Dan 170M es un modelo de lenguaje de 167,9 millones de parámetros desarrollado por el usuario jaay211 (stonbcold) como proyecto de aprendizaje, construido íntegramente desde cero en PyTorch: tokenizador BPE a nivel de byte, pipeline de datos, código del modelo, preentrenamiento y ajuste fino. Sigue una arquitectura transformer decoder-only de estilo Llama y está orientado a generación de texto conversacional en inglés.

El modelo se entrena con 10B tokens procedentes de FineWeb-Edu, FineMath-4+, MegaMath (código) y se ajusta posteriormente con SmolTalk y ejemplos de rechazo generados a partir de TriviaQA. Su relevancia es principalmente educativa y de referencia: documenta de forma transparente el proceso completo de entrenamiento de un modelo pequeño en una única GPU de consumo (RTX 5090, unas 27 horas en total).

La ventana de contexto es de 2048 tokens, el vocabulario de 49.152 tokens y la licencia Apache 2.0. El propio autor advierte que no es un asistente fiable: conoce pocos hechos y alucina con frecuencia, por lo que debe tratarse como una pieza didáctica más que como un componente de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama |
| Parametros totales | 167,9 M (31,5 M embeddings, 136,4 M transformer) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | No disponible (pesos en safetensors; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`dan.safetensors`) con código propio (`model.py`, `bpe.py`, `chat.py`) |

Especificaciones adicionales de arquitectura: 30 capas, hidden size 640, 10 cabezas de consulta y 5 de clave/valor (GQA), QK-norm, feed-forward SwiGLU de dimension 1728, normalizacion RMSNorm, posiciones RoPE con theta 10000, vocabulario de 49.152 tokens (BPE a nivel de byte, un token por digito) y embeddings de entrada/salida atados.

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de estilo Llama con atención de múltiples consultas agrupadas (GQA, ratio 2:1 entre cabezas Q y KV), QK-norm para estabilizar la atención, SwiGLU en el bloque feed-forward y RMSNorm. Usa RoPE para codificar posiciones y ata los embeddings de entrada y salida, lo que reduce el recuento de parámetros efectivo del vocabulario.

El preentrenamiento consume 10B tokens en una sola ejecución de unas 24 horas sobre una RTX 5090. La mezcla de datos es FineWeb-Edu (62%), FineMath-4+ (26%) y MegaMath código (12%), con deduplicación, filtrado y descontaminación frente a GSM8K, MATH, MATH-500 y HumanEval mediante solapamiento de 13-gramas. Se usa AdamW (lr 3e-3, betas 0,9/0,95), un schedule warmup-stable-decay, batches de 524k tokens y precisión bf16. El ajuste fino se realiza durante 2 épocas (unas 3 horas en la misma GPU) sobre SmolTalk (458k conversaciones) más ejemplos de rechazo generados pidiendo al modelo preentrenado 20.000 preguntas de TriviaQA seis veces cada una: las respuestas consistentemente correctas se convierten en ejemplos de respuesta y las incorrectas en ejemplos de "no lo sé". La pérdida se calcula solo sobre los tokens del asistente.

## Capacidades

- Generación de texto conversacional en inglés con formato de chat (`<|im_start|>role\n...<|im_end|>`).
- Seguimiento de instrucciones básico gracias al ajuste fino sobre SmolTalk.
- Comportamiento de rechazo aprendido: responde "I don't know" ante preguntas que el modelo no domina (69,5% en TriviaQA).
- Conocimiento factual limitado: 2,5% de acierto en TriviaQA de validación.
- Razonamiento matemático muy débil: 2,5% en GSM8K (200 problemas, greedy).
- Capacidad de generación de código limitada, procedente del 12% de MegaMath en el preentrenamiento; sin ajuste fino específico de código.
- No dispone de tool calling ni function calling documentado.
- No dispone de capacidades de agente ni razonamiento multi-paso documentadas.
- No dispone de visión, audio ni modo de pensamiento.
- Multilingüismo: únicamente inglés.

## Casos de uso

- Docencia y estudio de entrenamiento de LLM: el repositorio incluye tokenizador, pipeline de datos y código de entrenamiento completos, lo que permite reproducir o modificar cada etapa en una sola GPU de consumo.
- Experimentación con ajuste fino de bajo coste: con 167,9 M de parámetros y pesos en safetensors, se puede reentrenar o hacer LoRA en hardware modesto para probar recetas de alineación o de rechazo.
- Prototipado de interfaces de chat: sirve para validar pipelines de conversación multi-turno con el formato `<|im_start|>`/`<|im_end|>` antes de migrar a un modelo mayor.
- Generación de texto creativo breve en inglés (poemas, descripciones, respuestas cortas): el modelo produce inglés fluido según el autor, aunque con poca fiabilidad factual.
- Investigación sobre calibración de rechazo: los ejemplos de "I don't know" construidos a partir de TriviaQA permiten estudiar el equilibrio entre abstención y alucinación en modelos pequeños.
- Baseline para comparativas de eficiencia: útil como referencia de un modelo de 170 M entrenado con 10B tokens en una RTX 5090 para medir coste y rendimiento de recetas propias.
- Evaluación de tokenizadores BPE a nivel de byte: el vocabulario con un token por dígito facilita experimentos sobre tokenización numérica.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| Perdida de validacion en preentrenamiento | 2,28 |
| Perdida de validacion en ajuste fino (tokens de asistente) | 1,18 |
| GSM8K (200 problemas, chat, greedy) | 2,5% |
| TriviaQA validacion, 2.000 preguntas no vistas, greedy: correctas | 2,5% |
| TriviaQA validacion: incorrectas (alucinacion) | 28,0% |
| TriviaQA validacion: rechazo ("I don't know") | 69,5% |

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo ocupa aproximadamente 0,7 GB en safetensors (pesos en bf16/fp32 segun el checkpoint); en fp16 serian unos 0,34 GB y en fp32 unos 0,67 GB, mas el overhead de activaciones y cache KV para 2048 tokens, muy reducido.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; el autor lo entreno en una RTX 5090, pero la inferencia cabe en GPUs mucho menores.
- Cabe en GPU de consumo: si, practicamente cualquier GPU moderna (RTX 3060, RTX 4060, RTX 4090, etc.) e incluso en CPU para inferencia.
- Opciones de despliegue: el autor proporciona codigo PyTorch propio (`model.py`, `bpe.py`, `chat.py`) y un Space de Hugging Face. No se documenta soporte oficial para vLLM, llama.cpp, Ollama ni TGI; al no publicarse versiones GGUF, la integracion con estos motores requeriria conversion manual.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Dan 170M | 167,9 M | 2048 | Ingles | Apache 2.0 | Entrenado desde cero, proyecto educativo, GSM8K 2,5% |
| SmolLM-135M (HuggingFaceTB) | 135 M | 2048 | Ingles | Apache 2.0 | Modelo pequeno de referencia de HuggingFace; no se dispone de datos comparativos en esta ficha |
| Qwen2.5-0.5B | 0,5 B | 32.768 | Multilingue | Apache 2.0 | Mayor tamano y contexto; no se dispone de datos comparativos en esta ficha |
| TinyLlama-1.1B | 1,1 B | 2048 | Ingles | Apache 2.0 | Mayor escala; no se dispone de datos comparativos en esta ficha |

Los datos de los modelos alternativos no se han verificado en la informacion proporcionada; la comparacion se limita a tamano, contexto y licencia.

## Limitaciones y advertencias

- Solo admite ingles; no se ha entrenado ni evaluado en castellano ni en otros idiomas.
- Alto riesgo de alucinacion: el 28,0% de las respuestas en TriviaQA son incorrectas y solo el 2,5% son correctas.
- El comportamiento de rechazo no esta bien calibrado: el modelo rechaza a menudo incluso preguntas que podria responder.
- Razonamiento matematico muy debil (2,5% en GSM8K) por ausencia de ajuste fino especifico de matematicas.
- No tiene ajuste de seguridad mas alla del contenido de SmolTalk; puede generar contenido inapropiado.
- Conocimiento factual muy limitado; no debe usarse como fuente de informacion.
- Requiere el codigo propio del repositorio para cargar los pesos; no es plug-and-play con librerias estandar como transformers.
- Licencia Apache 2.0: permite uso comercial, pero el autor desaconseja explicitamente su uso como asistente fiable.
- Proyecto de aprendizaje sin mantenimiento ni soporte documentado; 0 descargas y 0 likes en el momento de la consulta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jaay211/dan-170m
- Space de demostracion: https://huggingface.co/spaces/jaay211/dan-chat
- Codigo fuente: https://github.com/stonbcold/Dan
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset FineMath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Dataset MegaMath: https://huggingface.co/datasets/LLM360/MegaMath
- Dataset SmolTalk: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- Dataset TriviaQA: https://huggingface.co/datasets/mandarjoshi/trivia_qa
