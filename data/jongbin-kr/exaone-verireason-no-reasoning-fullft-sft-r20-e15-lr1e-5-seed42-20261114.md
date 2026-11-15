# Jongbin-kr/exaone-verireason-no-reasoning-fullft-sft-r20-e15-lr1e-5-seed42-20261114

## Resumen

El modelo `exaone-verireason-no-reasoning-fullft-sft-r20-e15-lr1e-5-seed42-20261114` es un ajuste fino (fine-tuning) supervisado (SFT) del modelo base EXAONE, desarrollado por el usuario Jongbin-kr y publicado en Hugging Face. Se trata de un modelo de generación de texto de aproximadamente 7.800 millones de parámetros (7,82 B), orientado a tareas conversacionales y de razonamiento, entrenado con la librería TRL (Transformers Reinforcement Learning) de Hugging Face.

El nombre del modelo sugiere un trabajo experimental sobre variantes de razonamiento ("verireason", "no-reasoning") con configuraciones específicas de entrenamiento (r20, e15, lr1e-5, seed42), lo que apunta a un experimento académico o de investigación más que a un modelo listo para producción. El repositorio tiene un tamaño de 27,2 GB y los pesos están en formato safetensors.

La relevancia de este modelo es limitada: cuenta con cero descargas y cero "likes" en el momento de la consulta, no dispone de licencia declarada de forma clara y la model card es prácticamente la plantilla autogenerada por TRL, sin información sustantiva sobre datos de entrenamiento, evaluación o capacidades. Se trata, por tanto, de un artefacto de investigación cuyo interés principal es documental o para reproducibilidad de experimentos, no como modelo de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de EXAONE; detalles específicos no disponibles) |
| Parametros totales | 7.818.448.896 (7,82 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica "licence: license" sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la familia EXAONE (LG AI Research), una arquitectura transformer de tipo decoder-only. El sufijo del nombre indica un ajuste fino completo ("fullft") mediante SFT con TRL, con una configuración de entrenamiento concreta: 20 rondas o repeticiones (r20), 15 épocas (e15), tasa de aprendizaje 1e-5 y semilla 42. El entrenamiento se realizó con TRL 1.6.0, Transformers 5.7.0, PyTorch 2.10.0+cu128, Datasets 5.0.0 y Tokenizers 0.22.2.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, si hubo RLHF/DPO adicional ni sobre innovaciones técnicas específicas. El nombre "verireason-no-reasoning" sugiere una variante entrenada sin modo de razonamiento explícito (sin cadenas de pensamiento), pero esto es una inferencia a partir del nombre y no está confirmado en la documentación disponible. El run de entrenamiento está registrado en Weights & Biases bajo el proyecto `snu-skiml/lg-longtail-sft`.

## Capacidades

- Generación de texto conversacional multi-turno (el pipeline de ejemplo usa formato de mensajes con rol `user`).
- Razonamiento y respuesta a preguntas abiertas (el ejemplo de la model card plantea una pregunta hipotética de razonamiento).
- Ajuste fino supervisado sobre un modelo base EXAONE, por lo que hereda las capacidades del modelo original (no documentadas en esta ficha).
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no disponible (idiomas no especificados).
- Capacidades especiales (thinking mode, visión, audio): no disponible; el nombre sugiere ausencia de modo de razonamiento explícito, pero no está confirmado.

## Casos de uso

- Investigación y reproducibilidad de experimentos de SFT: el modelo sirve como artefacto para reproducir el entrenamiento descrito (r20, e15, lr1e-5, seed42) y comparar variantes de razonamiento frente a no-razonamiento en la familia EXAONE.
- Evaluación comparativa de estrategias de ajuste fino: útil para estudiar el efecto de épocas, repeticiones y tasas de aprendizaje en modelos de ~7,8 B mediante SFT con TRL.
- Generación de texto conversacional en prototipos: el pipeline de ejemplo permite integrarlo rápidamente en demos de chat con `transformers.pipeline`, aunque sin garantías de calidad en producción.
- Estudio de sesgos y alucinaciones en modelos ajustados con SFT: al ser un modelo pequeño (7,8 B) y con licencia indefinida, puede usarse en entornos de investigación controlados para analizar comportamiento.
- Base para futuros ajustes (continued fine-tuning): al estar en safetensors y ser compatible con Transformers, puede servir como punto de partida para experimentos posteriores de alineamiento (DPO, RLHF).
- Docencia y formación: ejemplo práctico de cómo TRL genera model cards y runs de W&B para experimentos de SFT, útil en cursos de NLP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 15,6 GB solo para pesos (7,82 B × 2 bytes), más overhead de activaciones y KV cache; en la práctica se recomienda ≥ 20-24 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: ~8 GB para pesos; en 4 bits: ~4-5 GB para pesos (sin contar overhead).
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para FP16 con contexto limitado; RTX 3090 (24 GB) también es viable en FP16 con contextos cortos.
- ¿Cabe en GPU de consumo? Sí, en RTX 4090/3090 (24 GB) en FP16 con contexto moderado, y en GPUs de 8-12 GB si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: `transformers` (pipeline), vLLM, TGI, llama.cpp (requiere conversión a GGUF, no publicada), Ollama (requiere GGUF). El modelo usa `custom_code`, por lo que puede requerir `trust_remote_code=True`.
- Latencia y throughput estimados: no disponibles (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Jongbin-kr/exaone-verireason-no-reasoning-fullft-sft-r20-e15-lr1e-5-seed42-20261114 | 7,82 B | no disponible | no disponible | Hugging Face (0 descargas) |
| EXAONE base (LG AI Research) | ~7,8 B (según variante) | no disponible en esta ficha | licencia EXAONE (no comercial en algunas variantes) | Hugging Face |
| Mistral-7B / Mistral-7B-Instruct | ~7,2 B | 8k-32k (según versión) | Apache-2.0 | Hugging Face, ampliamente adoptado |
| Llama 3.1 8B Instruct | ~8 B | 128k | Llama 3.1 Community License | Hugging Face, ampliamente adoptado |

Nota: los datos de los modelos comparables son de referencia general; no se dispone de benchmarks de este modelo para comparar rendimiento de forma cuantitativa.

## Limitaciones y advertencias

- Licencia no especificada de forma clara: la model card indica "licence: license" sin detallar términos, lo que impide confirmar si el uso comercial está permitido. Es imprescindible contactar con el autor antes de cualquier uso en producción.
- Idiomas no documentados: no se puede garantizar el rendimiento en castellano ni en otros idiomas distintos del que se usó en el entrenamiento (presumiblemente coreano/inglés, dado el origen EXAONE, pero no confirmado).
- Riesgo de alucinación: al ser un modelo ajustado con SFT sin información sobre datos de alineamiento, el riesgo de alucinaciones y respuestas incorrectas es alto, especialmente en dominios especializados.
- Sesgos conocidos: no documentados; al no haber información sobre la composición del dataset, no se pueden evaluar sesgos de género, raza o ideológicos.
- Longitud de contexto no disponible: no se puede planificar su uso en tareas de contexto largo sin verificación empírica.
- Modelo experimental con 0 descargas y 0 likes: no hay evidencia de uso en producción ni validación por la comunidad.
- Requiere `trust_remote_code=True` potencialmente, dado el tag `custom_code`, lo que implica ejecutar código del autor; revisar el código antes de usarlo en entornos sensibles.
- Sin benchmarks publicados: no se puede comparar su rendimiento con alternativas de forma objetiva.
- El nombre del modelo sugiere una variante "no-reasoning", lo que podría implicar un rendimiento inferior en tareas que requieren razonamiento multi-paso, aunque no está confirmado.

## Enlaces

- Hugging Face: https://huggingface.co/Jongbin-kr/exaone-verireason-no-reasoning-fullft-sft-r20-e15-lr1e-5-seed42-20261114
- Run de entrenamiento en Weights & Biases: https://wandb.ai/snu-skiml/lg-longtail-sft/runs/1037d0f9
- Repositorio TRL: https://github.com/huggingface/trl
- Paper de TRL (citación): von Werra et al., 2020, TRL: Transformers Reinforcement Learning
- EXAONE (LG AI Research): no se ha proporcionado enlace específico en la información disponible
