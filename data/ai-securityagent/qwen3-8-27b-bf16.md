# AI-SecurityAgent/Qwen3.8-27B-BF16

## Resumen

Qwen3.8-27B-BF16 es un reupload (mirror) sin modificaciones del modelo Qwen/Qwen3.8-27B, publicado por el usuario AI-SecurityAgent en Hugging Face. No se trata de un fine-tuning ni de una variante entrenada por el autor del repositorio: la model card indica explícitamente que los ficheros son idénticos a los del repositorio original y que todo el crédito corresponde a los autores originales (el equipo Qwen de Alibaba). El interés de este repositorio es, por tanto, la disponibilidad de los pesos en precisión BF16 completos en un único paquete de 55,6 GB.

El modelo pertenece a la familia Qwen3.8, con arquitectura declarada en los tags como `qwen3_5`, y cuenta con 27.781.427.952 parámetros totales según los metadatos de safetensors (aproximadamente 27,8 mil millones). Está pensado como modelo base de gran tamaño para tareas de generación de texto, razonamiento y código, y su licencia Apache 2.0 facilita el uso comercial y la integración en productos derivados.

La relevancia de esta ficha es doble: por un lado, documenta un checkpoint de la familia Qwen3.8 en BF16, formato adecuado para inferencia de alta fidelidad y para servir como base de cuantizaciones posteriores; por otro, advierte de que la información pública disponible en este repositorio es mínima (sin pipeline declarado, sin idiomas especificados y sin datos de benchmarks), por lo que muchas especificaciones deben consultarse en el repositorio original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | qwen3_5 (según tags del repositorio); detalles internos no disponibles |
| Parámetros totales | 27.781.427.952 (~27,8 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | pesos publicados en BF16; cuantizaciones derivadas (GGUF, AWQ, GPTQ) no disponibles en este repositorio |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El repositorio declara la arquitectura mediante el tag `qwen3_5`, lo que lo vincula a la familia Qwen3.5/3.8 de Alibaba. Sin embargo, la model card de este mirror no aporta detalles sobre la estructura interna (número de capas, dimensión oculta, mecanismo de atención, uso de atención lineal o híbrida, decodificación especulativa u otras innovaciones). Tampoco se especifica si se trata de un transformer denso o de una variante con mezcla de expertos; el recuento de parámetros totales coincide con el número de parámetros del checkpoint, lo que sugiere un modelo denso, pero este extremo no se confirma en la información disponible.

En cuanto al entrenamiento, no se documentan en este repositorio el número de tokens, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por preferencias. Al ser un mirror sin cambios, todas estas cuestiones deben remitirse al repositorio original Qwen/Qwen3.8-27B. La única información técnica verificable es el tamaño del checkpoint (55,6 GB), coherente con ~27,8 B de parámetros en BF16 (2 bytes por parámetro más overhead de metadatos).

## Capacidades

- Generación de texto en precisión BF16, adecuada para tareas que requieren alta fidelidad numérica y baja pérdida de calidad respecto al modelo original.
- Razonamiento y matemáticas: capacidades esperables en la familia Qwen3.8, aunque no se detallan en la información disponible.
- Generación de código: no confirmada explícitamente en este repositorio; debe verificarse en la model card original.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles (el campo de idiomas está vacío en los metadatos).
- Capacidades especiales (modo thinking, visión, audio): no disponibles en la información proporcionada.

## Casos de uso

- Servicio de inferencia de alta fidelidad: al estar en BF16, el modelo es adecuado para desplegar la versión sin pérdida de precisión del checkpoint original en entornos con GPU de gran memoria, útil como referencia para comparar con cuantizaciones.
- Base para cuantización propia: equipos que necesiten generar versiones GGUF, AWQ o GPTQ pueden partir de este checkpoint BF16 íntegro y verificar que los ficheros coinciden con el original.
- Investigación en seguridad de IA: el nombre del publicador (AI-SecurityAgent) sugiere un uso orientado a evaluación de riesgos, red teaming y análisis de comportamiento de modelos de gran tamaño en entornos controlados.
- Réplica y verificación de reproducibilidad: al ser un mirror sin cambios, sirve para validar que los resultados obtenidos con el modelo original se reproducen con los mismos pesos.
- Fine-tuning supervisado: el formato safetensors en BF16 es directamente compatible con frameworks como Hugging Face Transformers, TRL o Axolotl para ajuste posterior.
- Despliegue en clústeres con vLLM o TGI: el tamaño de 27,8 B en BF16 encaja en configuraciones multi-GPU (por ejemplo, 2×A100 80 GB o 4×RTX 4090 con tensor parallelism), lo que permite servir el modelo con throughput razonable.
- Evaluación comparativa de familias de modelos: útil como punto de referencia de la familia Qwen3.8 frente a otros modelos de tamaño similar en tareas de razonamiento y generación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 55,6 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 64-80 GB de VRAM total.
- GPU recomendadas: A100 80 GB, H100 80 GB, H200, o configuraciones multi-GPU con tensor parallelism (por ejemplo, 2×A100 40 GB no es suficiente en BF16 sin cuantización; 2×A100 80 GB o 4×RTX 4090 24 GB con parallelismo).
- GPU de consumo: no cabe en una única RTX 4090 (24 GB) en BF16; requeriría cuantización a 8 o 4 bits para intentar encajar en una sola GPU de consumo, algo que este repositorio no ofrece.
- Opciones de despliegue: Hugging Face Transformers, vLLM, TGI y otros servidores compatibles con safetensors; llama.cpp y Ollama requieren conversión previa a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-BF16 (este repo) | ~27,8 B | no disponible | Apache 2.0 | safetensors BF16 | mirror en HF |
| Qwen/Qwen3.8-27B (original) | ~27,8 B | no disponible | Apache 2.0 | safetensors | repositorio oficial |
| Alternativas de ~27-32 B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de contexto que permitan una comparación cuantitativa fiable con otras familias de modelos de tamaño similar. Se recomienda consultar la model card del repositorio original para obtener comparativas oficiales.

## Limitaciones y advertencias

- La model card de este repositorio es mínima: no incluye información sobre sesgos, alucinación, idiomas ni evaluación de seguridad.
- Al ser un mirror, cualquier corrección, actualización o aviso de seguridad del autor original debe consultarse en Qwen/Qwen3.8-27B; este repositorio no garantiza mantenimiento.
- El publicador no es el autor original del modelo; la responsabilidad sobre el comportamiento del modelo recae en el equipo Qwen.
- No se especifican los idiomas soportados, por lo que el rendimiento en castellano no está documentado.
- No hay datos sobre la longitud de contexto, lo que impide planificar despliegues con ventanas largas sin verificar en el repositorio original.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar el fichero LICENSE incluido y las condiciones del repositorio original.
- El tamaño en BF16 (55,6 GB) limita el despliegue a hardware profesional o multi-GPU; no es apto para inferencia en una sola GPU de consumo sin cuantización.
- Riesgo de alucinación y sesgos: no evaluado en la información disponible.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AI-SecurityAgent/Qwen3.8-27B-BF16
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio oficial de Qwen en GitHub: no disponible en la información proporcionada
- Paper técnico: no disponible en la información proporcionada
- Blog o demo: no disponible en la información proporcionada
