# ethicalabs/Echo-DSRN-114M-v0.1.2

## Resumen

Echo-DSRN-114M-v0.1.2 es un modelo de generación de texto experimental desarrollado por el laboratorio ethicalabs. Se basa en una arquitectura novedosa denominada Echo-DSRN (Dual State Recurrent Neural Network, también abreviada como "echo"), diseñada como alternativa de bajo coste para tareas específicas y de baja complejidad que actualmente se abordan con modelos de lenguaje de gran escala. El modelo cuenta con 114,7 millones de parámetros, 8 capas y una dimensión oculta de 512, y está pensado para su despliegue en entornos edge con memoria constante O(1).

La relevancia de este modelo reside en su propuesta arquitectónica: combina un núcleo recurrente con atención híbrida acotada, lo que permite un uso de memoria fijo durante la generación, independientemente de la longitud del contexto. Está entrenado mediante supervisión fina (SFT) sobre el dataset `naufalso/smoltalk2_non_thinking` durante 2 épocas en una AMD Instinct MI300X. El autor lo presenta como un prototipo de investigación, con advertencias explícitas sobre su falta de preparación para producción y sus limitaciones en precisión factual, seguimiento de instrucciones y razonamiento de sentido común.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Echo-DSRN (Dual State Recurrent Neural Network) con atención híbrida |
| Parametros totales | 114.656.768 (según safetensors); 114.687.488 según desglose del autor |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (memoria O(1) con atención acotada por ventana) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Echo-DSRN es una red neuronal recurrente de doble estado. Cada capa contiene un MLP de alimentación directa (4,20M parámetros), un "slow state" DSRN (3,15M) que actúa como memoria de tiempo constante, un "fast state" GRU (1,58M) como camino recurrente rápido, un mecanismo de "surprise gating" (264.192) que modula la atención dinámica, y capas de normalización (1.024). La atención es híbrida: combina el núcleo recurrente con una ventana de atención acotada, lo que garantiza un uso de memoria O(1) durante la generación. El modelo emplea RMSNorm y tiene un vocabulario de 32.011 tokens.

El entrenamiento se realizó con SFTTrainer durante 2 épocas sobre el dataset `naufalso/smoltalk2_non_thinking`, en una única GPU AMD Instinct MI300X con 192 GB de RAM. El autor no detalla la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. El modelo base es `ethicalabs/Echo-DSRN-114M-v0.1.2-Base`, sobre el que se realizó el ajuste fino supervisado.

## Capacidades

- Generación de texto fluida: el modelo produce texto coherente a nivel superficial, aunque sin garantía de precisión factual.
- Memoria constante O(1): durante la generación, el uso de memoria no crece con la longitud de la secuencia, gracias al núcleo recurrente y la atención acotada.
- Ejecución en múltiples plataformas: probado en CPU, NPU y GPU, incluyendo AMD ROCm y Apple MPS.
- Tareas previstas por el autor (aunque no validadas en producción):
  - Enrutamiento de intenciones (intent dispatch) para dirigir prompts a APIs o modelos más grandes.
  - Compresión semántica de documentos largos con memoria plana O(1).
  - Traducción de esquemas: conversión de texto no estructurado a JSON o llamadas a funciones.
  - NER y clasificación de texto ruidoso.
  - Sanitización de PII en el dispositivo antes de enviar datos a la red.
  - Parseo de logs y detección de anomalías.
  - Autocompletado local para scripts y consultas.
- No soporta seguimiento de instrucciones fiable ni razonamiento de sentido común, según el propio autor.

## Casos de uso

- Enrutamiento de intenciones en edge: el modelo puede clasificar la intención de un prompt y redirigirlo a un servicio externo (API, script o modelo en la nube) sin necesidad de enviar todo el tráfico a un LLM grande. Su memoria O(1) lo hace adecuado para dispositivos con recursos limitados.
- Compresión semántica de documentos largos: al mantener un estado recurrente constante, puede procesar documentos extensos sin que el consumo de memoria crezca, lo que permite resumir o extraer información clave en dispositivos embebidos.
- Traducción de esquemas a JSON: el modelo puede convertir texto libre en estructuras JSON rígidas o llamadas a funciones, útil para integrar asistentes locales con APIs. Requiere validación posterior por su falta de fiabilidad.
- Extracción de entidades (NER) en texto ruidoso: puede identificar variables objetivo en logs o mensajes de usuario, aunque los resultados deben revisarse manualmente.
- Sanitización de PII en el dispositivo: antes de enviar datos a servicios externos, el modelo puede detectar y redactar información sensible localmente, reduciendo riesgos de privacidad.
- Parseo de logs y detección de anomalías: su capacidad para procesar flujos de log sin desbordamiento de caché permite monitorizar sistemas en tiempo real, aunque no se recomienda para decisiones críticas.
- Autocompletado local: para entornos sin conexión, puede sugerir la siguiente palabra en scripts o consultas, aprovechando su bajo coste computacional.

## Benchmarks y rendimiento

Los resultados de evaluación reportados por el autor (librería de evaluación de HuggingFace) son los siguientes:

**0-shot**

| Tarea | Métrica | Valor | Stderr |
|---|---|---|---|
| arc_easy | acc | 0.4289 | ±0.0102 |
| arc_easy | acc_norm | 0.4078 | ±0.0101 |
| boolq | acc | 0.4064 | ±0.0086 |
| hellaswag | acc | 0.2692 | ±0.0044 |
| hellaswag | acc_norm | 0.2757 | ±0.0045 |
| piqa | acc | 0.5789 | ±0.0115 |
| piqa | acc_norm | 0.5637 | ±0.0116 |
| sciq | acc | 0.5980 | ±0.0155 |
| sciq | acc_norm | 0.5610 | ±0.0157 |
| winogrande | acc | 0.4957 | ±0.0141 |

**5-shot**

| Tarea | Métrica | Valor | Stderr |
|---|---|---|---|
| arc_easy | acc | 0.3910 | ±0.0100 |
| arc_easy | acc_norm | 0.3645 | ±0.0099 |
| boolq | acc | 0.5098 | ±0.0087 |
| hellaswag | acc | 0.2717 | ±0.0044 |
| hellaswag | acc_norm | 0.2717 | ±0.0044 |
| piqa | acc | 0.5686 | ±0.0116 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- Al tratarse de un modelo de 114M parámetros, su huella de memoria es reducida. En precisión fp16, los pesos ocupan aproximadamente 229 MB; en int8, unos 115 MB; en 4-bit, unos 57 MB (estimaciones estándar, no cifras oficiales del autor).
- Puede ejecutarse en CPU, NPU y GPU. El autor indica pruebas en AMD ROCm y Apple MPS.
- Es adecuado para GPUs de consumo como la serie RTX 3060 o superiores, así como para Apple Silicon con MPS.
- Opciones de despliegue: al usar la librería `transformers`, puede servirse con `text-generation-inference` (TGI) o directamente mediante Python. No se menciona soporte para llama.cpp u Ollama.
- La latencia y el throughput no se especifican, pero por su tamaño y arquitectura recurrente se espera un rendimiento aceptable en hardware modesto.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de tamaño similar en la información proporcionada. El autor no publica resultados de referencia frente a alternativas como GPT-2, OPT-125M o Pythia-160M.

## Limitaciones y advertencias

- Modelo experimental y prototipo de demostración: no está preparado para producción ni para su uso en entornos comerciales, empresariales o de misión crítica.
- Alucinaciones frecuentes y respuestas incorrectas: el autor advierte explícitamente que el modelo alucina y da respuestas erróneas.
- Sin precisión factual, sin seguimiento de instrucciones fiable y sin razonamiento de sentido común.
- Solo soporta inglés; no hay evidencia de capacidades multilingües.
- Licencia Apache 2.0 permite uso comercial, pero el autor prohíbe el despliegue en producción y declina toda responsabilidad por uso no autorizado.
- El dataset de entrenamiento (`smoltalk2_non_thinking`) no está documentado en detalle, lo que limita la trazabilidad de los datos.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/ethicalabs/Echo-DSRN-114M-v0.1.2)
- [Repositorio GitHub](https://github.com/ethicalabs-ai/Echo-DSRN/)
- [Working paper (PAPER.md)](https://github.com/ethicalabs-ai/Echo-DSRN/blob/main/PAPER.md)
- [Colección de modelos Echo-DSRN en HuggingFace](https://huggingface.co/collections/ethicalabs/echo-dsrn-recurrent-hybrid)
- [Página de investigación de Echo-DSRN](https://www.ethicalabs.ai/research/echo-dsrn/)
- [Aplicación demo de clasificador de intenciones](https://huggingface.co/spaces/ethicalabs/Echo-SmolTools-114M-Intent-Classifier)
