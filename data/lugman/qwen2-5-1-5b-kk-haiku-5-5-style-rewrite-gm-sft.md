# lugman/Qwen2.5-1.5B-KK-Haiku-5.5-Style-Rewrite-GM-SFT

## Resumen

Qwen2.5-1.5B-KK-Haiku-5.5-Style-Rewrite-GM-SFT es un ajuste fino (SFT) del modelo base unsloth/Qwen2.5-1.5B-Instruct, publicado por el usuario lugman en Hugging Face. El nombre del repositorio sugiere que el ajuste está orientado a tareas de reescritura de texto con un estilo concreto (referencias a "Haiku" y "Style Rewrite"), aunque la model card no documenta el dataset ni el procedimiento de entrenamiento de forma detallada.

Se trata de un modelo de generación de texto de arquitectura transformer decoder-only con 1.543.714.304 parámetros (aproximadamente 1,5 mil millones), derivado de la familia Qwen2.5 de Alibaba. El ajuste se realizó con Unsloth y la librería TRL de Hugging Face, lo que indica un entrenamiento de tipo supervisado con optimizaciones de memoria y velocidad. El repositorio ocupa 3,1 GB y los pesos se distribuyen en formato safetensors.

El interés de esta ficha es limitado pero relevante como ejemplo de ajuste fino ligero sobre Qwen2.5-1.5B-Instruct: un modelo pequeño, con licencia Apache 2.0, pensado para tareas de reescritura estilística. No hay datos de benchmarks, demos ni documentación adicional publicada, por lo que la evaluación debe apoyarse en las capacidades heredadas del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2, heredada del base Qwen2.5-1.5B-Instruct) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen2.5-1.5B-Instruct soporta hasta 32.768 tokens, segun la documentacion oficial de Qwen) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos en safetensors sin cuantizacion publicada) |
| Idiomas soportados | Ingles (segun la model card; el base Qwen2.5 es multilingue) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen2.5-1.5B-Instruct: un transformer decoder-only con atención causal estándar, normalización RMSNorm, activación SwiGLU y embeddings de tokens compartidos con la cabeza de salida. No se trata de un modelo MoE ni de una arquitectura híbrida SSM; es un transformer denso de aproximadamente 1,5 mil millones de parámetros.

El entrenamiento consistió en un ajuste fino supervisado (SFT) sobre el modelo instruct ya alineado de Qwen2.5, usando Unsloth y TRL. La model card no especifica el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas adicionales como DPO o RLHF. El sufijo "GM-SFT" del nombre sugiere SFT con algún tipo de formato o plantilla específica, pero no hay documentación que lo confirme. No se han publicado innovaciones técnicas propias más allá del uso de Unsloth para acelerar el entrenamiento.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo base Qwen2.5-1.5B-Instruct.
- Reescritura de texto con estilo, presumiblemente orientada a un registro concreto ("Haiku" y "Style Rewrite" en el nombre), aunque no hay ejemplos publicados que lo verifiquen.
- Razonamiento básico y respuesta a instrucciones, limitado por el tamaño de 1,5B parámetros.
- Generación de código y matemáticas elementales, con el rendimiento propio de un modelo de este tamaño.
- Soporte de tool calling / function calling: no confirmado en la model card, aunque el base Qwen2.5-1.5B-Instruct lo soporta según la documentación de Qwen.
- Capacidades multilingües: la model card declara solo inglés, aunque el base Qwen2.5 es multilingüe; el ajuste fino podría haber degradado otros idiomas.
- Modo "thinking" extendido, visión o audio: no disponible.

## Casos de uso

- Reescritura estilística de textos: el modelo está ajustado específicamente para reformular textos con un estilo concreto, por lo que puede usarse en pipelines de edición y adaptación de contenido.
- Generación de variantes de copy para marketing: dado su tamaño reducido, permite generar múltiples variantes de un texto con bajo coste computacional.
- Asistencia a la escritura creativa: puede servir como base para generar borradores con un tono determinado, siempre con revisión humana.
- Filtrado y normalización de texto: reescritura de entradas de usuario para homogeneizar formato o registro antes de pasarlas a otro sistema.
- Prototipado rápido de aplicaciones conversacionales: al ser un modelo de 1,5B, cabe en GPUs consumer y permite iterar rápido en entornos de desarrollo.
- Tareas de ajuste fino posteriores: al estar publicado con licencia Apache 2.0 y formato safetensors, puede servir como punto de partida para nuevos ajustes específicos.
- Inferencia local en entornos con recursos limitados: su tamaño permite desplegarlo en estaciones de trabajo sin GPUs de datacenter, útil para demos y pruebas internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 3,1 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica se recomienda al menos 6-8 GB de VRAM.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,6-2 GB para pesos, con overhead adicional.
- VRAM estimada en cuantización de 4 bits: alrededor de 1 GB para pesos, con overhead adicional.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100, H100; cualquier GPU con al menos 8 GB de VRAM debería poder ejecutarlo en fp16.
- Cabe en GPU consumer: sí, en RTX 3060/4060/4090 y equivalentes.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM, llama.cpp y Ollama mediante conversión a GGUF, entre otros.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen2.5-1.5B-KK-Haiku-5.5-Style-Rewrite-GM-SFT | 1,54 B | No disponible (base: 32.768 tokens) | Apache 2.0 | Hugging Face |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens | Apache 2.0 | Hugging Face, muy descargado |
| Llama 3.2-1B-Instruct | 1,24 B | 128.000 tokens | Llama 3.2 Community License | Hugging Face, ampliamente usado |
| SmolLM2-1.7B-Instruct | 1,71 B | 8.192 tokens (ampliable) | Apache 2.0 | Hugging Face |

El modelo comparado más directo es Qwen2.5-1.5B-Instruct, del que deriva: comparte arquitectura, tamaño y licencia, pero este ajuste fino sacrifica generalidad por una tarea específica de reescritura estilística. Llama 3.2-1B-Instruct ofrece un contexto mucho mayor y una licencia más restrictiva; SmolLM2-1.7B-Instruct es una alternativa de tamaño similar con licencia Apache 2.0. No hay datos de rendimiento comparativo para este ajuste concreto.

## Limitaciones y advertencias

- No hay benchmarks, demos ni ejemplos publicados que verifiquen la calidad del ajuste fino; la evaluación es, por tanto, incompleta.
- El ajuste fino puede haber degradado capacidades generales del modelo base, especialmente en idiomas distintos del inglés y en tareas no relacionadas con la reescritura estilística.
- La model card declara únicamente inglés, lo que sugiere que el uso en castellano u otros idiomas puede dar resultados pobres.
- Riesgo de alucinación inherente a los modelos de 1,5B parámetros, especialmente en tareas de razonamiento complejo o conocimiento factual.
- El nombre del modelo ("KK-Haiku-5.5-Style-Rewrite-GM-SFT") no está documentado; no se sabe con certeza qué estilo o formato produce.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de Qwen2.5 conviene revisar los términos del modelo base por si se aplican restricciones adicionales.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni validación comunitaria.
- Fecha de creación indicada como 2026-11-15, posterior a la fecha de consulta habitual; conviene verificar la integridad del repositorio antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lugman/Qwen2.5-1.5B-KK-Haiku-5.5-Style-Rewrite-GM-SFT
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct
- Repositorio Unsloth: https://github.com/unslothai/unsloth
- Librería TRL de Hugging Face: https://github.com/huggingface/trl
- Documentación de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
