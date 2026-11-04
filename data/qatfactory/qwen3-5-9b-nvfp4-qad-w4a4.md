# qatfactory/Qwen3.5-9B-NVFP4-QAD-W4A4

## Resumen

Qwen3.5-9B-NVFP4-QAD-W4A4 es una versión cuantizada del modelo Qwen/Qwen3.5-9B, publicada por el usuario qatfactory en HuggingFace. La particularidad principal es que emplea NVFP4, un formato de cuantización de 4 bits en coma flotante (FP4) optimizado para GPUs NVIDIA de última generación, combinado con Quantization-Aware Training (QAT) y una técnica denominada QAD (quantization-aware distillation, según la nomenclatura del autor). El resultado es un checkpoint de aproximadamente 8,9 GB con pesos en safetensors y formato compressed-tensors, pensado para su uso con vLLM.

El modelo resuelve un problema concreto: desplegar un modelo de ~9.400 millones de parámetros con una huella de memoria muy reducida (frente a los ~18 GB en BF16) manteniendo una calidad cercana al modelo original gracias al entrenamiento consciente de la cuantización. Está etiquetado como "8-bit" en los tags de HuggingFace, lo que probablemente refleja el empaquetado de los pesos FP4 en contenedores de 8 bits, aunque la precisión efectiva de los pesos es de 4 bits con escalas en FP8.

Es relevante ahora porque NVFP4 es uno de los formatos nativos soportados por las arquitecturas Blackwell de NVIDIA y por versiones recientes de vLLM, lo que permite servir modelos de tamaño medio con un rendimiento y una eficiencia de memoria notables en hardware moderno. El acceso está restringido (gated), por lo que es necesario aceptar condiciones en HuggingFace antes de descargarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5; detalles no disponibles) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (W4A4, pesos y activaciones en 4 bits con escalas FP8); empaquetado 8-bit |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base es Qwen/Qwen3.5-9B, un transformer de la familia Qwen3.5 con 9.409.813.744 parámetros. La información proporcionada no detalla la arquitectura interna del modelo base (número de capas, dimensión oculta, mecanismo de atención, presencia de atención lineal o híbrida, etc.), por lo que esos datos deben consultarse en la ficha oficial de Qwen.

Sobre el proceso de cuantización, el autor indica Quantization-Aware Training (QAT) junto con la etiqueta "QAD" (quantization-aware distillation). Esto implica que el modelo no es una cuantización post-entrenamiento (PTQ) convencional, sino que los pesos se adaptaron durante el entrenamiento o mediante destilación para minimizar la pérdida de calidad al pasar a FP4. El esquema es W4A4: tanto pesos como activaciones se representan en 4 bits, con escalas en FP8 (característico de NVFP4). Los pesos se distribuyen en formato compressed-tensors, compatible con vLLM. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Qwen3.5-9B (no detalladas en la información disponible).
- Código y matemáticas: presumiblemente soportadas por el modelo base, aunque no se documentan explícitamente en esta ficha.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles (el campo de idiomas no está relleno).
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Inferencia eficiente en FP4: capacidad destacada de esta variante, orientada a GPUs NVIDIA Blackwell y a vLLM.

## Casos de uso

- Despliegue de bajo coste en GPUs Blackwell: gracias a NVFP4, el modelo ocupa ~8,9 GB, lo que permite servirlo en una sola GPU moderna con margen para el KV cache y batches mayores que en BF16.
- Servicio de inferencia de alto throughput con vLLM: al estar empaquetado en compressed-tensors y etiquetado para vLLM, se integra directamente en pipelines de serving con PagedAttention y batching continuo.
- Prototipado de aplicaciones de chat y generación de texto: un modelo de ~9B con licencia Apache 2.0 es adecuado para experimentar con asistentes conversacionales sin costes de licencia.
- Fine-tuning o evaluación comparativa de técnicas de cuantización: útil para investigadores que quieran medir la degradación de QAT+NVFP4 frente al modelo base en tareas concretas.
- Sustitución de modelos BF16 en entornos con VRAM limitada: permite mantener un modelo de 9B en GPUs consumer de gama alta (por ejemplo, RTX 4090 de 24 GB) con holgura para contexto largo.
- Investigación en eficiencia energética y memoria: al reducir el ancho de bits de pesos y activaciones, sirve para estudiar el impacto de FP4 en latencia y consumo en cargas reales.
- Evaluación de robustez de la cuantización: comparar salidas del checkpoint NVFP4 con el modelo base para detectar alucinaciones o degradaciones introducidas por el proceso QAT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~8,9 GB solo para pesos; con KV cache y overhead de vLLM, se recomienda al menos 12-16 GB para contextos moderados y batches pequeños.
- GPU recomendadas: NVIDIA Blackwell (B200, RTX 50xx) por soporte nativo de NVFP4; también GPUs con soporte de FP4 vía kernels de vLLM en arquitecturas compatibles.
- ¿Cabe en GPU consumer? Sí, en tarjetas con 16 GB o más (RTX 4080/4090, RTX 5070 Ti/5080/5090), siempre que los kernels NVFP4 estén disponibles para esa arquitectura.
- Opciones de despliegue: vLLM (soporte indicado por la librería y el tag), a través del formato compressed-tensors. No se indica compatibilidad con llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qatfactory/Qwen3.5-9B-NVFP4-QAD-W4A4 | 9.409.813.744 | no disponible | NVFP4 W4A4 (QAT+QAD) | Apache 2.0 | Gated en HuggingFace |
| Qwen/Qwen3.5-9B (base) | 9.409.813.744 | no disponible | BF16 (original) | Apache 2.0 (presumible) | Público en HuggingFace |
| Otras variantes cuantizadas de Qwen3.5-9B (GPTQ/AWQ/GGUF) | ~9.400 M | no disponible | 4-8 bits PTQ | Apache 2.0 | Públicas |

La comparativa se limita al modelo base y a variantes cuantizadas genéricas, ya que no se dispone de datos de rendimiento ni de otros checkpoints NVFP4 comparables en la información proporcionada.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated; es necesario aceptar condiciones en HuggingFace antes de descargar los pesos.
- Cuantización agresiva: W4A4 puede introducir degradación en tareas sensibles (matemáticas, código, razonamiento largo) frente al modelo en BF16, aunque QAT mitiga parte de la pérdida.
- Compatibilidad de hardware limitada: NVFP4 requiere kernels específicos y GPUs con soporte (principalmente Blackwell); en arquitecturas anteriores puede no funcionar o degradar el rendimiento.
- Idiomas no documentados: al no especificarse el conjunto de idiomas soportados, no se garantiza un comportamiento óptimo fuera de los idiomas cubiertos por el modelo base.
- Riesgo de alucinación: inherente a los modelos de lenguaje; la cuantización puede amplificarlo en dominios especializados.
- Sesgos: no documentados en la información disponible; se heredan los del modelo base Qwen3.5-9B.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base y del acceso gated.
- Sin benchmarks publicados: no hay evidencia cuantitativa de la calidad del checkpoint frente al original en la información disponible.

## Enlaces

- HuggingFace: https://huggingface.co/qatfactory/Qwen3.5-9B-NVFP4-QAD-W4A4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Documentación de vLLM: https://docs.vllm.ai
- Formato compressed-tensors: https://github.com/neuralmagic/compressed-tensors
