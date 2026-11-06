# OraXDev/bagent-lite

## Resumen

OraXDev/bagent-lite es un modelo de lenguaje de tipo Qwen2, afinado a partir de OraXDev/bagent-o1, publicado por el desarrollador OraXDev en Hugging Face. Con 1.543.714.304 parámetros (aproximadamente 1,54 mil millones), se posiciona en el segmento de modelos compactos, pensado para inferencia ligera y despliegue en hardware modesto. El repositorio ocupa 3,1 GB en formato safetensors y el acceso está restringido: es necesario aceptar las condiciones en Hugging Face antes de poder descargarlo.

La información pública disponible es muy limitada. No se han publicado datos sobre longitud de contexto, idiomas soportados, composición del dataset de entrenamiento ni resultados de benchmarks. La model card asociada no aporta especificaciones técnicas más allá de la arquitectura declarada (qwen2) y el modelo base del que deriva (OraXDev/bagent-o1, a su vez un fine-tune). Esto limita seriamente cualquier evaluación rigurosa de sus capacidades antes de probarlo.

La licencia es CDLA-Permissive-1.0, una licencia permisiva de la Linux Foundation orientada a datos y modelos abiertos, que permite uso comercial con atribución. El modelo se distribuye como fine-tune de un modelo ya existente, por lo que las condiciones del modelo base podrían añadir restricciones adicionales que no se detallan en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder-only) |
| Parametros totales | 1.543.714.304 (~1,54 B) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | CDLA-Permissive-1.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se declara como una arquitectura Qwen2, es decir, un transformer decoder-only con atención causal estándar, en la línea de la familia Qwen2 de Alibaba. Con 1.543.714.304 parámetros, el tamaño encaja con la variante de 1,5 B de dicha familia, aunque no se confirma explícitamente en la información disponible.

Se trata de un fine-tune de OraXDev/bagent-o1, que a su vez es un fine-tune, según los metadatos de Hugging Face (`base_model:finetune:OraXDev/bagent-o1`). No se han publicado detalles sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas como decodificación especulativa o atención lineal. Toda esta información debe considerarse no disponible.

## Capacidades

- Generación de texto: capacidad esperable por su arquitectura Qwen2, aunque no verificada en la información disponible.
- Razonamiento y código: no disponible; no hay documentación que confirme capacidades específicas.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declaran idiomas soportados.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Prototipado rápido en local: con ~1,54 B de parámetros, el modelo puede ejecutarse en una GPU de consumo para experimentar con generación de texto antes de escalar a modelos mayores, siempre que se acepten las condiciones de acceso.
- Fine-tuning adicional: al ser un modelo pequeño y derivado de un fine-tune, puede servir como punto de partida para ajustes específicos de dominio con recursos limitados.
- Despliegue en entornos con restricciones de VRAM: su tamaño permite inferencia en GPUs de 8-16 GB en cuantizaciones de 8 o 4 bits, aunque no se han publicado cuantizaciones oficiales.
- Evaluación comparativa de fine-tunes: útil para estudiar el efecto de la cadena de fine-tuning (bagent-o1 → bagent-lite) frente al modelo base original.
- Investigación sobre licencias permisivas: la licencia CDLA-Permissive-1.0 facilita su uso en proyectos que requieran condiciones de licencia claras y atribución simple.
- Pruebas de integración en pipelines de Hugging Face Transformers: el formato safetensors y la arquitectura Qwen2 permiten cargarlo con `transformers` y `AutoModelForCausalLM`, aunque el acceso gated requiere autenticación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 3,1 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, entre 4 y 6 GB según longitud de contexto.
- VRAM estimada en cuantización de 8 bits: ~1,6 GB para pesos; en 4 bits, ~0,8 GB, aunque no se han publicado cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) para fp16; A100/H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 y superiores.
- Opciones de despliegue: Hugging Face Transformers, vLLM, llama.cpp u Ollama si se generan cuantizaciones GGUF (no publicadas en la información disponible), TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Acceso |
|---|---|---|---|---|
| OraXDev/bagent-lite | ~1,54 B | no disponible | CDLA-Permissive-1.0 | Gated |
| Qwen2-1.5B (Alibaba) | 1,54 B | 32.768 tokens (según documentación pública de Qwen2) | Apache 2.0 | Abierto |
| TinyLlama-1.1B | 1,1 B | 2.048 tokens | Apache 2.0 | Abierto |
| Phi-2 (Microsoft) | 2,7 B | 2.048 tokens | MIT | Abierto |

La comparación con Qwen2-1.5B es la más directa por arquitectura y tamaño, pero no se dispone de datos de rendimiento de bagent-lite para establecer diferencias cuantitativas. El acceso restringido y la ausencia de benchmarks lo sitúan en desventaja frente a alternativas abiertas y documentadas.

## Limitaciones y advertencias

- Ausencia total de benchmarks y documentación técnica: no es posible evaluar su calidad frente a alternativas.
- Riesgo de alucinación: inherente a los modelos de ~1,5 B, especialmente en tareas de razonamiento complejo.
- Idiomas no declarados: no se puede garantizar un rendimiento adecuado en castellano u otros idiomas.
- Contexto desconocido: se desconoce la ventana máxima, lo que impide planificar su uso en tareas de contexto largo.
- Acceso gated: requiere aceptar condiciones en Hugging Face, lo que puede complicar la automatización de descargas en CI/CD.
- Licencia: CDLA-Permissive-1.0 permite uso comercial con atribución, pero las condiciones del modelo base (bagent-o1) podrían imponer restricciones adicionales no documentadas.
- Cadena de fine-tunes sin trazabilidad: al derivar de otro fine-tune, los sesgos y limitaciones del modelo original se heredan sin documentación.
- Sin garantías de mantenimiento: 19 descargas y 0 likes sugieren un proyecto con poca validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/OraXDev/bagent-lite
- Modelo base: https://huggingface.co/OraXDev/bagent-o1
- Licencia CDLA-Permissive-1.0: https://cdla.dev/permissive-1-0/
