# mradermacher/Blueberry-TinyLlama-1.1B-Chat-v1.0-GGUF

## Resumen

Este repositorio contiene una colección de cuantizaciones GGUF estáticas del modelo Blueberry-TinyLlama-1.1B-Chat-v1.0, cuyo peso original publicó el usuario shreyanth en HuggingFace. El trabajo lo firma mradermacher, autor habitual de versiones cuantizadas de modelos abiertos para su uso con llama.cpp y otros runtimes compatibles con GGUF. No se trata de un modelo entrenado desde cero, sino de un artefacto de distribución: la conversión a GGUF del fine-tune citado, en doce variantes que cubren desde FP16 hasta Q2_K.

El modelo subyacente parte de TinyLlama-1.1B-Chat-v1.0, un transformer decoder-only de aproximadamente 1.100 millones de parámetros derivado de la arquitectura Llama 2. Esa escala lo sitúa en la gama de modelos que caben holgadamente en GPUs de consumo e incluso en CPU, lo que lo hace interesante para prototipado local, entornos con recursos limitados y despliegues en el borde.

La relevancia práctica de este repositorio es que ofrece el mismo modelo en múltiples niveles de compromiso entre tamaño, calidad y memoria necesaria. La ficha no incluye información sobre el dataset de ajuste, la licencia ni los idiomas soportados, y el repositorio no registra descargas ni valoraciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only; el modelo base declarado es TinyLlama-1.1B-Chat-v1.0. No se detalla la arquitectura interna en esta ficha |
| Parametros totales | Aproximadamente 1.100 millones, inferidos del nombre del modelo base; no confirmados en la ficha del repositorio |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (el modelo base TinyLlama v1.0 emplea 2.048 tokens) |
| Tipos de cuantizacion | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | No disponible |
| Licencia | No disponible en el repositorio (el modelo base TinyLlama se publica bajo Apache 2.0; la licencia del fine-tune Blueberry no se especifica) |
| Formato de pesos | GGUF (el repositorio original del fine-tune usa pesos en safetensors) |

## Arquitectura y entrenamiento

La ficha del repositorio no documenta la arquitectura del modelo, el número de tokens de entrenamiento ni la composición del dataset. Lo único que consta es la cadena de derivación: TinyLlama-1.1B-Chat-v1.0, ajustado posteriormente por el usuario shreyanth bajo el nombre Blueberry, y convertido a GGUF por mradermacher con la versión 2 del script de cuantización (`quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`).

Como referencia del modelo base, TinyLlama-1.1B-Chat-v1.0 es un transformer decoder-only con atención de consultas agrupadas (GQA), normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE), entrenado sobre 3 billones de tokens y con una ventana de contexto de 2.048 tokens según la documentación pública del proyecto TinyLlama. Conviene subrayar que estos datos corresponden al modelo base y no están verificados en este repositorio: el proceso de ajuste que dio lugar a Blueberry, su volumen de datos, su posible uso de RLHF o DPO y el dominio objetivo son desconocidos.

En cuanto a la innovación técnica, este repositorio no introduce ninguna; su aportación es la cobertura amplia de niveles de cuantización k-quant e i-quant, que permite elegir el equilibrio entre fidelidad y huella de memoria sin reentrenar nada.

## Capacidades

- Generación de texto conversacional en inglés (idioma del modelo base; no confirmado en esta ficha).
- Razonamiento básico de un solo turno y tareas de instrucción simples.
- Generación de código y respuestas a preguntas de cultura general de baja complejidad, con la fiabilidad propia de un modelo de 1.100 millones de parámetros.
- Soporte de tool calling o function calling: no disponible según la información del repositorio.
- Capacidades de agente y razonamiento multi-paso: no disponibles.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo thinking, visión, audio): no disponibles; el repositorio solo contiene pesos de texto.
- Ejecución en CPU, GPU y Apple Silicon gracias al formato GGUF, con soporte de descarga por capas y offload parcial.

## Casos de uso

- Prototipado local en portátil: con las variantes Q4_K_M o Q5_K_M el modelo ocupa menos de 1 GB de disco y arranca en CPU, lo que permite iterar sobre prompts e interfaces sin depender de APIs externas ni de GPU dedicada.
- Asistentes conversacionales embebidos: el modelo se puede integrar con llama.cpp u Ollama dentro de una aplicación de escritorio para gestionar diálogos de un solo turno o de pocos turnos, donde el contexto corto del modelo base no supone un problema.
- Procesamiento por lotes en servidores modestos: clasificación de textos, resumen extractivo y reformulación de frases en volúmenes altos, aprovechando que varias instancias del modelo cuantizado caben a la vez en una sola GPU de gama media.
- Despliegue en el borde: variantes Q3_K_M o Q4_K_S por debajo de 700 MB permiten ejecutar el modelo en dispositivos tipo Raspberry Pi 5 con 8 GB de RAM, en escenarios de domótica o asistentes sin conexión.
- Estudio comparativo de cuantización: al publicar doce niveles distintos del mismo modelo, el repositorio sirve para medir empíricamente la degradación de perplejidad y coherencia entre FP16, k-quants e i-quants sobre un mismo conjunto de evaluación.
- Generación de texto auxiliar en pipelines de CI: tareas de relleno de plantillas, generación de mensajes de commit o etiquetado de issues, donde la latencia baja importa más que la precisión factual.
- Educación y experimentación: es un punto de partida asequible para enseñar inferencia con llama.cpp, tokenización y efectos de la cuantización en un curso o taller, sin necesidad de hardware especializado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Ni la ficha del repositorio de cuantizaciones ni la del fine-tune original incluyen valores de MMLU, HumanEval, GSM8K, HellaSwag o perplejidad para las distintas variantes.

## Requisitos de hardware

Tamaños y VRAM estimados a partir del recuento de parámetros (1.100 millones) y de los bits por peso de cada cuantización; incluyen un margen para la caché KV y el overhead del runtime. Son estimaciones, no mediciones publicadas.

| Cuantizacion | Tamano aproximado de pesos | VRAM minima estimada |
|---|---|---|
| x-f16 | 2,2 GB | 2,5 - 3 GB |
| Q8_0 | 1,2 GB | 1,5 - 2 GB |
| Q6_K | 0,9 GB | 1,2 - 1,6 GB |
| Q5_K_M | 0,8 GB | 1,1 - 1,4 GB |
| Q4_K_M | 0,7 GB | 1,0 - 1,3 GB |
| Q3_K_M | 0,6 GB | 0,9 - 1,2 GB |
| Q2_K | 0,5 GB | 0,8 - 1,1 GB |

- Cabe en cualquier GPU de consumo: GTX 1650, RTX 3050, RTX 3060, RTX 4060, RTX 4090 y superiores, sin necesidad de cuantizar más allá de Q8_0.
- Funciona íntegramente en CPU con llama.cpp; 4 GB de RAM libre son suficientes para las variantes Q4 y Q5.
- Compatible con Apple Silicon mediante Metal (llama.cpp, Ollama, LM Studio), incluso en equipos con 8 GB de memoria unificada.
- Aceleradores profesionales como A100 o H100 no aportan ventaja apreciable para este tamaño de modelo; quedan sobredimensionados.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama, LM Studio, KoboldCpp, Jan, llama-cpp-python, text-generation-webui y, con soporte GGUF experimental, vLLM y TGI.
- Latencia y throughput: no disponibles. No hay mediciones publicadas por el autor para ninguna de las variantes.

## Comparativa con modelos similares

Datos de contexto y licencia tomados de las model cards oficiales de cada proyecto; no hay cifras de rendimiento comparables porque este repositorio no publica benchmarks.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Blueberry-TinyLlama-1.1B-Chat-v1.0-GGUF (este repositorio) | ~1,1 B | No disponible | No disponible | Solo GGUF, 12 cuantizaciones |
| TinyLlama-1.1B-Chat-v1.0 (modelo base) | 1,1 B | 2.048 tokens | Apache 2.0 | Safetensors y GGUF de terceros |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens (ampliable con YaRN) | Apache 2.0 | Safetensors, GGUF, AWQ, GPTQ |
| SmolLM2-1.7B-Instruct | 1,7 B | 8.192 tokens | Apache 2.0 | Safetensors, GGUF |

Frente a las alternativas, el punto fuerte de este repositorio es la variedad de cuantizaciones; sus puntos débiles son la ausencia de licencia explícita y la falta de validación empírica, mientras que Qwen2.5-1.5B-Instruct y SmolLM2-1.7B-Instruct ofrecen ventanas de contexto notablemente mayores y licencias claras.

## Limitaciones y advertencias

- Licencia no declarada: sin una licencia explícita en el repositorio ni en el fine-tune original, el uso comercial es jurídicamente arriesgado y requiere contactar con los autores.
- Procedencia del ajuste desconocida: no se documenta el dataset de Blueberry, por lo que el comportamiento del modelo puede desviarse de forma impredecible respecto al TinyLlama original.
- Contexto corto si se confirma el del modelo base: 2.048 tokens limitan los diálogos largos y la documentación extensa; no sirve para tareas de contexto largo.
- Riesgo elevado de alucinación: los modelos de 1.100 millones de parámetros generan con frecuencia afirmaciones factualmente incorrectas, especialmente en matemáticas, fechas, citas y conocimiento especializado.
- Degradación por cuantización: las variantes Q2_K y Q3_K_S reducen apreciablemente la coherencia; para uso real conviene Q4_K_M o superior.
- Idiomas no verificados: se desconoce si el fine-tune conserva capacidades multilingües; no debe asumirse un rendimiento correcto en castellano.
- Sin señales de adopción: cero descargas y cero valoraciones en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.
- Sin benchmarks ni evaluación de sesgos publicada; no hay datos sobre toxicidad, sesgos de género o estereotipos.
- Aviso de producción: no se recomienda este artefacto para sistemas críticos sin una evaluación propia previa, dado el vacío documental sobre licencia, datos y calidad.

## Enlaces

- Repositorio de cuantizaciones GGUF: https://huggingface.co/mradermacher/Blueberry-TinyLlama-1.1B-Chat-v1.0-GGUF
- Modelo original del fine-tune: https://huggingface.co/shreyanth/Blueberry-TinyLlama-1.1B-Chat-v1.0
- Modelo base: https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0
- Paper de TinyLlama: https://arxiv.org/abs/2401.02385
- llama.cpp, runtime de referencia para GGUF: https://github.com/ggerganov/llama.cpp
- La búsqueda web realizada no devolvió resultados relevantes: únicamente listados de productos de un comercio electrónico sin relación con el modelo. No se han encontrado papers, blogs ni demos adicionales asociados a este repositorio.
