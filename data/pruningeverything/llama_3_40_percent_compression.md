# PruningEverything/llama_3_40_percent_compression

## Resumen

Llama 3 40 % compression es un checkpoint derivado de la familia Llama 3 de Meta, publicado por el usuario PruningEverything en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una versión podada del modelo original: el nombre indica que se ha eliminado aproximadamente el 40 % de sus pesos o estructuras. El repositorio contiene 4.790.898.688 parámetros en formato safetensors, lo que lo sitúa en la franja de los modelos de ~5.000 millones de parámetros, coherente con un Llama 3 8B reducido en torno a ese 40 %.

La relevancia de este tipo de publicaciones es práctica: los modelos podados permiten reducir requisitos de VRAM y aumentar el throughput de inferencia a cambio de una posible pérdida de calidad. Sin embargo, la model card publicada es prácticamente vacía (solo contiene la línea de licencia), por lo que no hay información verificable sobre metodología de poda, dataset de recuperación (fine-tuning posterior a la poda), evaluación o rendimiento real.

La ficha se ha elaborado exclusivamente con los metadatos del repositorio y los datos de safetensors disponibles. Cualquier dato no confirmado se marca como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Llama 3; detalles de la poda no disponibles) |
| Parametros totales | 4.790.898.688 |
| Parametros activos | no disponible (no es MoE según los metadatos) |
| Longitud de contexto | no disponible (presumiblemente la del Llama 3 base, sin confirmar) |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se publican versiones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponibles |
| Licencia | llama3 (Llama 3 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura transformer decoder-only de Llama 3, con normalización RMSNorm, activaciones SwiGLU y atención con RoPE. El sufijo "40 % compression" sugiere una poda estructurada o no estructurada que elimina cerca del 40 % de los parámetros del checkpoint original; el recuento de 4.790.898.688 parámetros es consistente con un Llama 3 8B reducido en esa proporción.

No se dispone de información sobre el método de poda empleado (magnitud, Wanda, SparseGPT, poda de cabezas o capas), ni sobre si hubo una fase de recuperación mediante fine-tuning o destilación. Tampoco se documentan los datos de entrenamiento originales más allá de lo que corresponde al Llama 3 base de Meta, ni procesos de RLHF/DPO posteriores a la poda. La model card no aporta ninguna innovación técnica descrita por el autor.

## Capacidades

- Generación de texto: capacidad esperable por herencia de Llama 3, aunque no verificada tras la poda.
- Razonamiento y matemáticas: presumiblemente conservadas en parte, sin evaluación publicada.
- Generación de código: no confirmada tras la compresión.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; el Llama 3 base cubre principalmente inglés, alemán, francés, italiano, portugués, hindi, español y tailandés, pero se desconoce el impacto de la poda.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Experimentación en investigación sobre poda: el checkpoint sirve para comparar la calidad de un Llama 3 8B podado al 40 % frente al original en tareas controladas, midiendo la degradación por capa o por tipo de tarea.
- Inferencia en hardware limitado: con ~4,8B parámetros, el modelo puede ejecutarse en GPUs de consumo (por ejemplo, RTX 3060 de 12 GB) en cuantización de 8 bits, algo ajustado para un 8B completo.
- Prototipado rápido de pipelines de generación de texto: útil para validar arquitecturas de aplicación antes de migrar a un modelo mayor, siempre que la calidad sea aceptable.
- Fine-tuning ligero (LoRA/QLoRA): el menor número de parámetros reduce el coste de adaptación a dominios específicos en una sola GPU.
- Evaluación de robustez frente a compresión: caso de uso académico para estudiar cómo afecta la poda a la alucinación y al sesgo.
- Despliegue en entornos con restricciones de memoria: escenarios edge o contenedores con límites estrictos de VRAM donde un 8B no encaja.
- Base para comparativas de eficiencia: medición de throughput y latencia frente al Llama 3 8B original en el mismo hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos en FP16/BF16): ~9,6 GB solo para pesos, más overhead de activaciones y KV cache.
- VRAM estimada en cuantización de 8 bits: ~4,8-5,5 GB.
- VRAM estimada en cuantización de 4 bits: ~2,5-3,5 GB (requiere convertir los safetensors a GGUF/AWQ/GPTQ, no publicado por el autor).
- GPUs recomendadas: RTX 3090/4090 (24 GB) para FP16 sin problemas; RTX 3060 12 GB o RTX 4060 Ti 16 GB para 8 bits; GPUs de 8 GB solo en 4 bits.
- Cabe en GPU de consumo: sí, en cuantizaciones de 8 y 4 bits; en FP16 requiere al menos 12-16 GB.
- Opciones de despliegue: transformers, vLLM y TGI (requieren conversión o carga directa de safetensors); llama.cpp/Ollama solo si se genera un GGUF, que el autor no publica.
- Latencia y throughput estimados: no disponibles; dependerán del hardware y de la cuantización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Llama 3 40 % compression (este) | 4,79B | no disponible | llama3 | Hugging Face | Poda sin documentar |
| Llama 3 8B (Meta) | 8,03B | 8.192 tokens | llama3 | Hugging Face | Modelo base original |
| Llama 3.1 8B (Meta) | 8,03B | 128.000 tokens | llama3.1 | Hugging Face | Versión posterior con contexto ampliado |
| Mistral 7B v0.3 | 7,24B | 32.000 tokens | Apache 2.0 | Hugging Face | Alternativa permisiva de tamaño similar |

## Limitaciones y advertencias

- La model card está vacía: no hay información sobre metodología, evaluación ni degradación esperada tras la poda.
- Riesgo elevado de degradación de calidad no cuantificada: la poda al 40 % suele afectar a razonamiento, matemáticas y código, pero no hay datos que lo confirmen o desmientan.
- Riesgo de alucinación: presumiblemente mayor que el modelo base, sin medición disponible.
- Idiomas: no se especifica el impacto de la poda en el multilingüismo; el Llama 3 base está orientado principalmente al inglés.
- Licencia Llama 3 Community License: permite uso comercial con restricciones (entre ellas, la cláusula de 700 millones de usuarios mensuales y la obligación de mantener la atribución "Built with Meta Llama 3").
- Repositorio sin descargas ni likes, creado en 2026: no hay evidencia de comunidad, mantenimiento ni validación independiente.
- No se publican cuantizaciones GGUF ni adaptadores; el usuario debe convertir los pesos si quiere desplegar en llama.cpp u Ollama.
- No apto para producción sin una evaluación propia previa.

## Enlaces

- Hugging Face: https://huggingface.co/PruningEverything/llama_3_40_percent_compression
- Llama 3 (Meta): https://huggingface.co/meta-llama/Meta-Llama-3-8B
- Licencia Llama 3: https://llama.meta.com/llama3/license/
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
