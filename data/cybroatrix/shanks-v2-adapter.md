# CybroatriX/shanks-v2-adapter

## Resumen

Shanks-v2-adapter es un adaptador LoRA (PEFT) publicado por el usuario CybroatriX sobre el modelo base `thirdeyeai/Qwen2.5-Coder-7B-Instruct-Uncensored`, una variante descensurada de Qwen2.5-Coder-7B-Instruct. El repositorio contiene únicamente los pesos del adaptador (0,3 GB), no el modelo completo, por lo que su uso requiere descargar y cargar el modelo base y aplicar el adaptador mediante la librería PEFT.

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5-Coder-7B, con 7.600 millones de parámetros aproximadamente y una ventana de contexto nativa de 32.768 tokens (extensible a 131.072 en la familia Qwen2.5). El adaptador se ha entrenado con Unsloth, según las etiquetas del repositorio, lo que sugiere un ajuste fino eficiente en memoria sobre el modelo base.

La relevancia de esta ficha es limitada: el autor no ha documentado el propósito del ajuste, los datos de entrenamiento, los hiperparámetros ni los resultados. La model card es la plantilla por defecto de HuggingFace sin rellenar, el repositorio no tiene descargas ni likes, y la licencia no está declarada. Cualquier evaluación seria del modelo debe hacerse empíricamente por parte del usuario.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA |
| Parámetros totales | Aproximadamente 7.600 millones (modelo base); el adaptador LoRA ocupa 0,3 GB en disco |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens nativos en el modelo base (no verificado para el adaptador) |
| Tipos de cuantización | No disponible para el adaptador; el modelo base admite cuantizaciones estándar (GGUF, AWQ, GPTQ) según el ecosistema Qwen |
| Idiomas soportados | No disponible (el modelo base Qwen2.5 soporta multilingüe, pero el adaptador no lo declara) |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |
| Librería | PEFT 0.20.0 |
| Modelo base | thirdeyeai/Qwen2.5-Coder-7B-Instruct-Uncensored |
| Herramienta de entrenamiento | Unsloth (según etiquetas) |
| Tamaño del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un transformer decoder-only de la familia Qwen2.5-Coder, que emplea atención causal estándar con RoPE, normalización RMSNorm y capas MLP con activación SwiGLU. El modelo base es una variante "uncensored" de Qwen2.5-Coder-7B-Instruct, lo que implica que se ha eliminado o reducido el alineamiento de seguridad original mediante un ajuste adicional no documentado públicamente en este repositorio.

El adaptador LoRA se ha entrenado presumiblemente con Unsloth, según la etiqueta `unsloth` del repositorio, lo que indica un ajuste de bajo rango con optimizaciones de memoria. No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de los datos, la presencia de RLHF/DPO, la configuración de rangos LoRA ni los hiperparámetros. La model card no incluye ninguna sección de detalles de entrenamiento rellenada.

## Capacidades

- Generación de texto conversacional y de código, heredadas del modelo base Qwen2.5-Coder-7B-Instruct.
- Razonamiento sobre código y matemáticas a nivel de modelo de 7B, sujeto a las capacidades del base.
- Soporte de tool calling y function calling: no confirmado para el adaptador; el modelo base Qwen2.5-Coder-Instruct lo soporta de forma nativa, pero el ajuste LoRA podría haberlo alterado.
- Soporte de agentes y razonamiento multi-paso: no confirmado para el adaptador.
- Capacidades multilingües: no declaradas para el adaptador; el base Qwen2.5 soporta varios idiomas.
- Modo "uncensored": el modelo base ha sido descensurado, por lo que el adaptador probablemente hereda una menor resistencia a generar contenido sensible, aunque no está verificado.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Experimentación con adaptadores LoRA: el repositorio sirve como ejemplo práctico de cómo se estructura un adaptador PEFT sobre un modelo Qwen2.5-Coder, útil para desarrolladores que quieran replicar el flujo con Unsloth y PEFT.
- Ajuste fino específico de dominio sobre código: si el adaptador se entrenó para una tarea concreta (no documentada), podría emplearse para generación de código en ese dominio, previa evaluación empírica.
- Investigación sobre descensurado y alineamiento: permite estudiar cómo un adaptador LoRA modifica el comportamiento de un modelo base ya descensurado, comparando respuestas antes y después de aplicar el adaptador.
- Prototipado rápido de asistentes de código: cargando el base en 4-bit y aplicando el adaptador, se puede desplegar un asistente de programación en una GPU de consumo para pruebas internas.
- Evaluación comparativa de adaptadores: útil como punto de partida para comparar adaptadores LoRA sobre el mismo base en tareas de generación de código.
- Docencia y formación: sirve para ilustrar el ciclo completo de publicación de un adaptador en HuggingFace, incluyendo la estructura de repositorio, las etiquetas y la integración con PEFT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo base en precisión completa (bf16): aproximadamente 15-16 GB solo para pesos, más overhead de activaciones y KV cache.
- VRAM estimada en cuantización 4-bit (bitsandbytes o GPTQ/AWQ): aproximadamente 5-6 GB para pesos, más KV cache.
- El adaptador LoRA añade un overhead mínimo (0,3 GB en disco, menos en memoria al fusionarse).
- GPU recomendadas: A100 40/80 GB o H100 para despliegue en bf16 con contexto largo; RTX 4090 (24 GB) para bf16 con contexto moderado; RTX 3090/4080 (16-24 GB) para 8-bit o 4-bit.
- Cabe en GPU de consumo: sí, en 4-bit cabe en GPUs de 8 GB (por ejemplo, RTX 3060 Ti/4060) con contexto reducido; en 8-bit requiere 12-16 GB.
- Opciones de despliegue: transformers + PEFT (carga del adaptador), vLLM (soporte de LoRA), llama.cpp/Ollama (requiere fusionar el adaptador y convertir a GGUF), TGI (soporte de adaptadores).
- Latencia y throughput: no disponibles; dependen del hardware, la cuantización y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| CybroatriX/shanks-v2-adapter | ~7,6B (base) + LoRA | 32.768 (base) | No disponible | HuggingFace, 0 descargas | Adaptador no documentado |
| Qwen2.5-Coder-7B-Instruct | 7,6B | 32.768 (extensible a 131.072) | Apache 2.0 | HuggingFace, ampliamente usado | Modelo base oficial, alineado |
| thirdeyeai/Qwen2.5-Coder-7B-Instruct-Uncensored | 7,6B | 32.768 (base) | No verificada | HuggingFace | Base descensurado de este adaptador |
| DeepSeek-Coder-6.7B-Instruct | 6,7B | 16.384 | DeepSeek License | HuggingFace | Alternativa de código de tamaño similar |

## Limitaciones y advertencias

- La model card está sin rellenar: no hay información sobre propósito, datos, hiperparámetros ni evaluación. El uso en producción sin evaluación empírica es desaconsejable.
- Licencia no declarada: no se puede asumir uso comercial permitido. El modelo base Qwen2.5 es Apache 2.0, pero la variante descensurada de terceros y el adaptador no declaran licencia.
- El modelo base es "uncensored": existe un riesgo elevado de generar contenido sensible, ofensivo o inseguro sin filtros. No apto para aplicaciones orientadas al público sin moderación adicional.
- Riesgo de alucinación inherente a modelos de 7B, especialmente en razonamiento matemático y factual.
- El adaptador puede haber degradado capacidades del base (tool calling, multilingüismo, instrucciones) sin que exista documentación al respecto.
- Sin descargas ni validación comunitaria: no hay evidencia de que el adaptador funcione correctamente ni de que los pesos estén íntegros.
- Contexto: aunque el base soporta 32.768 tokens, no se ha verificado que el adaptador mantenga ese rendimiento en contextos largos.
- Fecha de creación futura (2026-11-02) en los metadatos: posible error de registro o repositorio de prueba; conviene verificar la integridad antes de usarlo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/CybroatriX/shanks-v2-adapter
- Modelo base: https://huggingface.co/thirdeyeai/Qwen2.5-Coder-7B-Instruct-Uncensored
- Paper de referencia de PEFT/LoRA citado en las etiquetas: https://arxiv.org/abs/1910.09700
- Documentación de PEFT: https://huggingface.co/docs/peft
- Unsloth: https://github.com/unslothai/unsloth
- Familia Qwen2.5-Coder: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
