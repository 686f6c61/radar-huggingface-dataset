# intel-ai/MiniMax-M3-MXFP4-CT-AutoRound

## Resumen

MiniMax-M3-MXFP4-CT-AutoRound es una versión cuantizada del modelo multimodal MiniMax-M3 desarrollada por el equipo de Intel AI mediante la herramienta AutoRound. El modelo base, MiniMax-M3, es un modelo de gran tamaño (220.479.056.768 parámetros según los pesos en safetensors) orientado a generación de texto e imagen-a-texto, y esta variante aplica cuantización de precisión reducida (MXFP8/MXFP4) sobre las capas lineales para reducir el tamaño del repositorio y facilitar el despliegue en infraestructura de inferencia.

La ficha del autor indica que las capas lineales se cuantizan a MXFP8 mientras que `lm_head` y `embed_tokens` se mantienen en BF16, con 200 iteraciones de ajuste (tuning) mediante AutoRound. El resultado es un checkpoint compatible con `compressed-tensors` y con vLLM 0.29.0, pensado para servir el modelo con `--trust-remote-code`.

La relevancia de esta ficha radica en que permite evaluar la degradación de calidad introducida por la cuantización: el autor reporta una recuperación media del 99,49% respecto a BF16 en GSM8K, MMLU, PIQA y HellaSwag. Es, por tanto, una opción práctica para quien necesite desplegar MiniMax-M3 con menor huella de memoria sin renunciar de forma significativa a la precisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base MiniMax-M3; tipo `minimax_m3_vl`) |
| Parametros totales | 220.479.056.768 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP8 en capas lineales; `lm_head` y `embed_tokens` en BF16 (etiquetado como 8-bit y MXFP4 en el nombre del repo) |
| Idiomas soportados | no disponible |
| Licencia | other (se remite a la licencia del modelo original MiniMaxAI/MiniMax-M3) |
| Formato de pesos | safetensors, con `compressed-tensors` y `custom_code`; requiere `trust_remote_code` |

## Arquitectura y entrenamiento

No se dispone en la información proporcionada de detalles sobre la arquitectura interna del modelo base MiniMax-M3 (tipo de transformer, uso de MoE, atención lineal, etc.). Lo que sí se conoce es el proceso de cuantización: AutoRound aplica un ajuste de redondeo mediante descenso de gradiente con signo (signed gradient descent) durante 200 iteraciones, cuantizando las capas lineales a MXFP8 y preservando `lm_head` y `embed_tokens` en BF16. El formato de salida es `llm_compressor` de AutoRound, compatible con `compressed-tensors`.

El modelo base es multimodal (pipeline `image-text-to-text`, arquitectura `minimax_m3_vl`), por lo que hereda capacidades de visión y texto del original. No se detalla en la información disponible la composición del dataset de entrenamiento, el número de tokens ni si hubo etapas de RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, etiqueta `conversational`).
- Procesamiento imagen-a-texto (pipeline `image-text-to-text`), heredado del modelo base multimodal.
- Compatible con `transformers` y con `custom_code`, lo que permite cargarlo con `trust_remote_code=True`.
- Despliegue en vLLM 0.29.0 mediante `vllm serve` con `--trust-remote-code`.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (los idiomas no están declarados en la ficha).
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Despliegue de inferencia multimodal en producción con menor huella de memoria: al cuantizar las capas lineales a MXFP8, el checkpoint ocupa menos que el BF16 original (repo de 244,2 GB), lo que permite servirlo en GPUs con menos VRAM usando vLLM 0.29.0 con `--trust-remote-code`.
- Sustitución directa del modelo base en pipelines existentes: al mantener `lm_head` y `embed_tokens` en BF16 y conservar la interfaz de `transformers`, puede reemplazar a MiniMax-M3 en aplicaciones ya integradas con una recuperación media del 99,49% en los benchmarks reportados.
- Evaluación de cuantización en investigación: sirve como referencia para estudiar la degradación de precisión de AutoRound con esquema MXFP8 sobre un modelo de 220B parámetros, comparando las métricas BF16 frente a MXFP8 publicadas por el autor.
- Generación de descripciones de imágenes y tareas imagen-a-texto: el modelo base es multimodal, por lo que esta variante puede emplearse en pipelines de captioning o respuesta a preguntas sobre imágenes, siempre que se valide la calidad tras la cuantización.
- Asistentes conversacionales de dominio general: la etiqueta `conversational` y el pipeline de generación de texto permiten integrarlo en chatbots, con la advertencia de que el autor recomienda realizar pruebas de seguridad antes de desplegar.
- Prototipado en entornos con recursos limitados: al reducir el peso de las capas lineales, facilita experimentos locales o en clústeres pequeños frente al checkpoint BF16 completo, a costa de requerir `compressed-tensors` y vLLM 0.29.0.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card, comparando BF16 frente a MXFP8 y la recuperación relativa:

| Benchmark | BF16 | MXFP8 | Recuperacion |
|---|---:|---:|---:|
| GSM8K | 94,60 | 94,10 | 99,47% |
| MMLU | 86,20 | 85,80 | 99,54% |
| PIQA | 83,10 | 82,90 | 99,76% |
| HellaSwag | 75,40 | 74,80 | 99,20% |
| **Media** | **84,83** | **84,40** | **99,49%** |

No se han publicado en la información disponible resultados de HumanEval ni de otros benchmarks adicionales.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repo pesa 244,2 GB y el modelo tiene 220.479.056.768 parámetros, por lo que se requiere infraestructura de múltiples GPUs de alta capacidad.
- GPU recomendadas: no especificadas por el autor; por el tamaño del modelo, se orienta a GPUs de centro de datos (A100, H100) en configuración multi-GPU.
- ¿Cabe en GPU de consumo? No disponible en la información proporcionada; por el volumen de parámetros, no es viable en GPUs de consumo individuales.
- Opciones de despliegue: vLLM 0.29.0 con `vllm serve intel-ai/MiniMax-M3-MXFP4-CT-AutoRound --trust-remote-code`; también carga con `transformers` y `compressed-tensors`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-M3-MXFP4-CT-AutoRound (este) | 220,48B | no disponible | MXFP8 (lineales) + BF16 (lm_head/embed) | other | Hugging Face, vLLM 0.29.0 |
| MiniMaxAI/MiniMax-M3 (base) | no disponible en la informacion | no disponible | BF16 | other | Hugging Face |
| Otras variantes cuantizadas de MiniMax-M3 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de modelos alternativos en la información proporcionada para una comparación cuantitativa.

## Limitaciones y advertencias

- El autor advierte que el modelo puede producir salidas factualmente incorrectas y no debe usarse como fuente fiable de información.
- Riesgo de generar contenido obsceno, sesgado u ofensivo debido a las limitaciones del modelo preentrenado y de los datasets de ajuste.
- Se recomienda realizar pruebas de seguridad antes de cualquier despliegue en producción.
- La licencia es "other" y remite a la del modelo original MiniMaxAI/MiniMax-M3; es necesario revisarla antes de uso comercial. El autor declara explícitamente que la licencia no constituye asesoramiento legal.
- La cuantización introduce una degradación medible: la recuperación media es del 99,49%, con la mayor pérdida en HellaSwag (99,20%).
- Idiomas soportados no declarados: no se puede garantizar el comportamiento multilingüe sin validación previa.
- Requiere `trust_remote_code=True` y vLLM 0.29.0 (o `transformers` con `compressed-tensors`), lo que añade dependencias específicas al pipeline de despliegue.
- Longitud de contexto no disponible: no se puede planificar el uso en tareas de contexto largo sin consultar la ficha del modelo base.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/intel-ai/MiniMax-M3-MXFP4-CT-AutoRound
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-M3
- Repositorio AutoRound: https://github.com/intel/auto-round
- Intel Neural Compressor: https://github.com/intel/neural-compressor
- Paper AutoRound (arXiv): https://arxiv.org/abs/2309.05516
