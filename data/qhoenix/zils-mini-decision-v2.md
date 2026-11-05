# qhoenix/zils-mini-decision-v2

## Resumen

zils-mini-decision-v2 es un modelo de decisión publicado por el usuario qhoenix en HuggingFace, construido sobre la familia Qwen/Qwen3.5-4B. Se trata de un ajuste fino mediante LoRA sobre el promedio uniforme de pesos de dos modelos de decisión de 4B (torchcast-ai/torchcast-decision-4b y vllm-sr/d3-mini), ambos con licencia Apache-2.0. El resultado del ajuste se promedia al 50/50 con la media base original, una técnica de interpolación de pesos que busca preservar las capacidades del modelo base mientras incorpora el comportamiento especializado en decisiones.

El modelo está etiquetado con el pipeline `feature-extraction` y la arquitectura `qwen3_5`, con 4.539.265.536 parámetros totales en formato safetensors. Su propósito declarado es servir como "cuerpo de decisión" para el pool mini de la subnet 127 de Zils, lo que sugiere un uso dentro de un sistema de agentes o red descentralizada que requiere tomar decisiones clasificatorias sobre entradas de texto.

La relevancia de esta ficha es limitada por la escasez de documentación: el modelo tiene 0 descargas y 0 likes en el momento de la consulta, no se especifican idiomas soportados ni se publican benchmarks. Aun así, se documentan aquí las especificaciones deducibles de los metadatos y de la model card para permitir una evaluación informada de su idoneidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer, familia Qwen3.5) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer de la familia Qwen3.5 con aproximadamente 4.500 millones de parámetros. Sobre esa base se aplica la siguiente receta, según la model card: primero se calcula un promedio uniforme de pesos entre torchcast-ai/torchcast-decision-4b y vllm-sr/d3-mini; después se realiza un ajuste fino con LoRA sobre datos públicos de estilo decisión (splits de entrenamiento de datasets públicos de clasificación, NLI y QA, además de eventos públicos resueltos); finalmente, el resultado del LoRA se promedia al 50/50 con el promedio base inicial.

Esta combinación de model averaging e interpolación post-LoRA es una técnica de fusión de pesos orientada a retener el conocimiento del modelo base mientras se incorpora la especialización en tareas de decisión. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo RLHF o DPO. Tampoco se detallan innovaciones de inferencia como decodificación especulativa o atención lineal.

## Capacidades

- Clasificación y decisión sobre texto: el pipeline declarado es `feature-extraction` y las etiquetas incluyen `decision-model`, lo que apunta a uso como extractor de representaciones o clasificador de decisiones.
- Razonamiento y QA: el entrenamiento incluye splits de datasets de QA y NLI, por lo que se espera capacidad para tareas de inferencia de lenguaje natural y respuesta a preguntas.
- Capacidades heredadas del base Qwen3.5-4B: generación de texto, razonamiento y código (no verificadas explícitamente en esta ficha).
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el uso declarado es como "cuerpo de decisión" dentro de un pool, no como agente autónomo.
- Capacidades multilingües: no disponible (no se listan idiomas).
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Clasificación de eventos en pipelines de datos: el modelo puede utilizarse como extractor de features o clasificador para etiquetar eventos públicos resueltos, dado que fue entrenado con ese tipo de datos.
- Enrutamiento de decisiones en sistemas de agentes: dentro de la subnet 127 de Zils, el modelo actúa como cuerpo de decisión del pool mini, seleccionando o puntuando opciones en un flujo multi-agente.
- Inferencia de lenguaje natural (NLI): adecuado para tareas de entailment y contradicción en pipelines de validación de respuestas generadas por otros modelos.
- Filtrado y moderación de contenido: como clasificador de decisión sobre texto, puede puntuar entradas para decidir si pasan un umbral, aunque requiere validación previa por la falta de benchmarks.
- Extracción de representaciones para búsqueda semántica: al declararse `feature-extraction`, puede generar embeddings para indexación y recuperación, siempre que se confirme la dimensión de salida.
- Evaluación comparativa de modelos de decisión: sirve como baseline de 4B en experimentos de model averaging y fusión de pesos, dado que su receta es reproducible a partir de modelos Apache-2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 9 GB solo para pesos (4.539 M parámetros × 2 bytes), más overhead de activaciones y KV cache.
- VRAM estimada en cuantización de 8 bits: alrededor de 4,5 GB para pesos; en 4 bits, alrededor de 2,3 GB (estimaciones teóricas, no confirmadas por el autor).
- GPU recomendadas: A100 40 GB, H100, L40S o RTX 4090 (24 GB) para fp16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 y potencialmente en RTX 4060 Ti 16 GB con cuantización; no se dispone de variantes GGUF publicadas.
- Opciones de despliegue: transformers (librería declarada); vLLM y TGI son compatibles en teoría con safetensors de Qwen3.5, pero no están verificados para este checkpoint. llama.cpp/Ollama requerirían conversión a GGUF no disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-mini-decision-v2 | 4.539 M | no disponible | apache-2.0 | HuggingFace, 0 descargas | Ajuste LoRA + interpolación sobre media de dos modelos de decisión |
| Qwen/Qwen3.5-4B | ~4.500 M | no disponible | no disponible en esta ficha | HuggingFace | Modelo base; capacidades generales |
| torchcast-ai/torchcast-decision-4b | ~4.000 M (familia 4B) | no disponible | apache-2.0 | HuggingFace | Componente del promedio base |
| vllm-sr/d3-mini | ~4.000 M (familia 4B) | no disponible | apache-2.0 | HuggingFace | Componente del promedio base |

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de rendimiento en MMLU, HumanEval, GSM8K ni tareas de decisión, lo que impide validar su calidad frente a alternativas.
- Documentación mínima: no se especifican idiomas, longitud de contexto, composición exacta del dataset ni hiperparámetros de entrenamiento.
- Riesgo de alucinación: al ser un modelo de 4B ajustado sobre datos de decisión, puede generar salidas plausibles pero incorrectas en tareas fuera de su distribución de entrenamiento.
- Sesgos: no documentados; los datasets públicos de clasificación y NLI pueden introducir sesgos de dominio y de anotación.
- Licencia Apache-2.0: permite uso comercial, pero la model card remite a LICENSE y NOTICE para atribuciones de los modelos upstream, que deben respetarse.
- Uso previsto restringido: está diseñado como cuerpo de decisión para el pool mini de Zils subnet 127; su uso fuera de ese contexto no está validado.
- Sin variantes cuantizadas publicadas: el despliegue en hardware limitado requiere conversión manual a GGUF o formatos de cuantización.
- Cero adopción: 0 descargas y 0 likes en el momento de la consulta, sin comunidad que reporte problemas o mejoras.

## Enlaces

- HuggingFace: https://huggingface.co/qhoenix/zils-mini-decision-v2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Componente upstream: https://huggingface.co/torchcast-ai/torchcast-decision-4b
- Componente upstream: https://huggingface.co/vllm-sr/d3-mini
