# qiusizhan/agentghost-low-clean-qwen35-9b-20261029-durable

## Resumen

AgentGhost Low Clean Qwen3.5-9B es un ajuste fino (finetune) del modelo Qwen/Qwen3.5-9B, publicado por el usuario qiusizhan en HuggingFace. Se distribuye como un modelo multimodal de tipo image-text-to-text, es decir, acepta entradas de imagen y texto y genera texto. El nombre del repositorio sugiere un entrenamiento orientado a agentes ("agentghost") con un proceso de limpieza de datos ("low-clean") y una fecha de corte asociada a octubre de 2026.

El modelo cuenta con 9.409.813.744 parámetros totales en formato safetensors, lo que lo sitúa en la categoría de modelos de aproximadamente 9B. Está construido sobre la arquitectura qwen3_5 y se distribuye bajo licencia Apache 2.0, aunque el acceso al repositorio está restringido (gated) y requiere aceptar condiciones en HuggingFace.

La relevancia de esta ficha es limitada por la escasez de documentación pública: no hay model card detallada, no se han publicado resultados de benchmarks y el número de descargas y likes es cero en el momento de la consulta. Se trata, por tanto, de un modelo de investigación con trazabilidad mínima, útil para quien quiera experimentar con un finetune de Qwen3.5-9B orientado a agentes, pero no recomendable para producción sin una evaluación propia exhaustiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer, según tag de HuggingFace) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible indica que el modelo se basa en la arquitectura qwen3_5 y que es un finetune del modelo Qwen/Qwen3.5-9B. El pipeline declarado es image-text-to-text, lo que implica que el modelo conserva la torre multimodal del modelo base (procesamiento de imágenes junto con texto). No se dispone de detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o similares.

El nombre del repositorio ("agentghost-low-clean-...-durable") sugiere un proceso de curación de datos ("low-clean") y un objetivo de entrenamiento orientado a comportamiento de agente ("agentghost"), pero no hay documentación que confirme la metodología. No se han publicado innovaciones técnicas específicas (decodificación especulativa, atención lineal, etc.) en la información proporcionada.

## Capacidades

- Generación de texto y conversación multi-turno (tag "conversational").
- Procesamiento de imagen y texto combinados (pipeline image-text-to-text), heredado del modelo base Qwen3.5-9B.
- Orientación a uso como agente, según el nombre del repositorio; sin documentación que lo confirme.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (idiomas no declarados).
- Modo thinking, visión, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Experimentación en investigación sobre agentes: el modelo puede emplearse como base para probar pipelines de agentes multi-paso, dado su origen como finetune orientado a ese dominio, aunque requiere validación propia.
- Prototipado de asistentes multimodales: al aceptar imagen y texto, sirve para construir demos de descripción de imágenes o respuesta a preguntas visuales en entornos controlados.
- Evaluación comparativa de finetunes: útil para investigadores que quieran medir el efecto de un finetune "low-clean" sobre Qwen3.5-9B frente al modelo base.
- Generación de conversaciones sintéticas: puede emplearse para producir diálogos multi-turno en la creación de datasets, con revisión humana posterior.
- Pruebas de integración con transformers: al distribuirse en safetensors y con la librería transformers, es adecuado para validar pipelines de carga y despliegue en entornos de desarrollo.
- Base para nuevos finetunes: su licencia Apache 2.0 permite derivar nuevos modelos, aunque el acceso gated y la falta de documentación limitan su atractivo frente al modelo base original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 18-19 GB solo para pesos (9.4B parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica se recomienda 24 GB o más.
- VRAM estimada en cuantización de 8 bits: en torno a 10-11 GB para pesos; en 4 bits, en torno a 5-6 GB, aunque no se confirman cuantizaciones publicadas para este modelo.
- GPU recomendadas: A100 40/80 GB, H100 para despliegue en producción; RTX 4090 (24 GB) para FP16 ajustado o cuantización.
- GPU de consumo: cabe en RTX 4090 en FP16 con margen limitado; en RTX 3090 (24 GB) de forma similar; en GPUs de 16 GB solo mediante cuantización.
- Opciones de despliegue: transformers (librería declarada); vLLM, llama.cpp, Ollama o TGI no están confirmados para este modelo concreto y requerirían conversión o verificación previa.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| AgentGhost Low Clean Qwen3.5-9B | 9,4B | no disponible | Apache 2.0 | Gated | Finetune de Qwen3.5-9B, sin benchmarks |
| Qwen/Qwen3.5-9B (base) | ~9B | no disponible | según model card de Qwen | Público (habitual) | Modelo original, con documentación oficial |
| Alternativas de ~9B de otras familias | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

La comparación con alternativas de la misma categoría no puede completarse con rigor porque no se han proporcionado datos de otros modelos en la información disponible.

## Limitaciones y advertencias

- Ausencia total de model card detallada: no hay información sobre datos de entrenamiento, sesgos o evaluación.
- Riesgo elevado de alucinación y comportamiento impredecible al no existir benchmarks ni evaluaciones publicadas.
- Acceso restringido (gated): es necesario aceptar condiciones en HuggingFace, lo que puede retrasar o impedir su uso automatizado.
- Idiomas soportados no declarados: no se puede garantizar un rendimiento adecuado en castellano ni en otros idiomas.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas de contexto largo.
- Licencia Apache 2.0 permite uso comercial, pero la falta de trazabilidad del finetune aconseja auditoría legal y técnica previa.
- Cero descargas y cero likes: no hay evidencia de uso comunitario ni de validación por terceros.
- El nombre del repositorio incluye una fecha futura (20261029) que no aporta información verificable sobre el corte de datos.

## Enlaces

- HuggingFace: https://huggingface.co/qiusizhan/agentghost-low-clean-qwen35-9b-20261029-durable
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
