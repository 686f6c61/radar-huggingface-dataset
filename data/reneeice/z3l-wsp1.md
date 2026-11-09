# reneeice/z3l-wsp1

## Resumen

z3l-wsp1 es un modelo de decisión ("decision body") de la familia d3-lite, publicado por el usuario reneeice (Renee Ghost) en Hugging Face. Se construye a partir de un "soup" público de seis cuerpos lite y se edita posteriormente en el espacio de pesos (weight-space programming) aplicando una corrección de dirección de bucle publicada para Qwen3.5-0.8B sobre las capas 15 y 19, concretamente en la proyección `down_proj`. No se empleó entrenamiento por gradiente en esa edición.

El modelo deriva del checkpoint base Qwen/Qwen3.5-0.8B y conserva su arquitectura transformer con aproximadamente 853 millones de parámetros (852.985.920 según los safetensors). Se publica bajo licencia Apache-2.0 y con la etiqueta de pipeline `feature-extraction`, aunque su propósito declarado es actuar como cuerpo de decisión dentro del pool lite de la subnet 127 de Zils.

Su relevancia es acotada: se trata de un artefacto experimental de una comunidad concreta (Zils), sin descargas ni interacciones en el momento de la consulta, y sin documentación pública sobre datos de entrenamiento, idiomas o evaluación. Resulta interesante como ejemplo de edición en espacio de pesos sobre un modelo base pequeño, pero no como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5; tag `qwen3_5`, `custom_code`) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 1,7 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer de aproximadamente 0,85 mil millones de parámetros. Sobre esa base se aplicó un "soup" de seis cuerpos lite públicos, es decir, una combinación de pesos de varios checkpoints de la misma familia, y después una edición en espacio de pesos consistente en una corrección de dirección de bucle ("loop-direction correction") publicada para Qwen3.5-0.8B, aplicada en las capas 15 y 19 sobre `down_proj`.

La model card indica explícitamente que la edición no utilizó entrenamiento por gradiente. No se documentan el volumen de tokens, la composición del dataset, ni si hubo RLHF, DPO o cualquier otra fase de alineación. Tampoco se detalla la innovación técnica más allá de la propia metodología de weight-space programming, que modifica pesos de forma dirigida sin optimización supervisada.

## Capacidades

- Generación de texto y extracción de representaciones: el pipeline declarado es `feature-extraction`, por lo que puede usarse para obtener embeddings o estados ocultos.
- Toma de decisiones ("decision body"): su propósito declarado es servir como cuerpo de decisión dentro del pool lite de la subnet 127 de Zils.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se documenta.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Capacidades especiales (thinking mode, visión, audio): no disponible; no se documentan.

## Casos de uso

- Experimentación con edición en espacio de pesos: sirve para reproducir y estudiar la corrección de dirección de bucle aplicada sobre Qwen3.5-0.8B en las capas 15 y 19, comparando el comportamiento antes y después de la edición.
- Extracción de características en pipelines ligeros: al declararse `feature-extraction`, puede integrarse en procesos de embedding o clasificación sobre textos donde el coste computacional sea crítico.
- Investigación en ensembles de modelos pequeños: el "soup" de seis cuerpos lite permite analizar cómo la combinación de pesos afecta a la estabilidad y a las representaciones internas.
- Evaluación de metodologías sin gradiente: útil como caso de estudio de weight-space programming frente a fine-tuning convencional en modelos de menos de 1B de parámetros.
- Prototipado dentro del ecosistema Zils: pensado para el pool lite de la subnet 127, donde puede desplegarse como componente de decisión en pruebas internas.
- Docencia y divulgación: ejemplo práctico de cómo se publica un checkpoint derivado con `custom_code` y `trust_remote_code` en Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 3,4 GB solo para pesos; en bf16/fp16, unos 1,7 GB.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,9 GB; en 4 bits, unos 0,5 GB (estimaciones teóricas, no verificadas por el autor).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM para bf16, como RTX 3060, RTX 4060 o superiores; A100/H100 no son necesarias por el tamaño.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas con 4 GB o más en bf16.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (el repo usa `custom_code`); vLLM, llama.cpp, Ollama o TGI no están documentados para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| reneeice/z3l-wsp1 | 852.985.920 | no disponible | Apache-2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-0.8B (base) | ~0,8B | no disponible en esta ficha | no disponible en esta ficha | Hugging Face |
| reneeice/z3m-7f4c9 | no disponible | no disponible | Apache-2.0 | Hugging Face (d3-mini decision body) |

No se dispone de datos de rendimiento comparado para ninguno de los tres en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de evaluación pública: no hay benchmarks, métricas ni resultados de validación.
- Documentación mínima: no se especifican idiomas, contexto, datos de entrenamiento ni proceso de alineación.
- Riesgo de alucinación: no cuantificado; al ser un modelo de 0,8B sin alineación documentada, el riesgo es presumiblemente alto en tareas abiertas.
- Sesgos conocidos: no documentados; no puede descartarse la herencia de sesgos del modelo base y de los seis cuerpos del soup.
- Licencia Apache-2.0: permite uso comercial, pero el modelo base Qwen3.5-0.8B puede tener condiciones adicionales que conviene verificar antes de explotarlo en producción.
- Requiere `trust_remote_code=True` por el uso de `custom_code`, lo que implica ejecutar código del autor.
- Sin adopción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validación por parte de la comunidad.
- Orientado a un nicho concreto (subnet 127 de Zils): su utilidad fuera de ese contexto no está demostrada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reneeice/z3l-wsp1
- Perfil del autor: https://huggingface.co/reneeice/models
- Modelo relacionado (d3-mini decision body): https://huggingface.co/reneeice/z3m-7f4c9
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
