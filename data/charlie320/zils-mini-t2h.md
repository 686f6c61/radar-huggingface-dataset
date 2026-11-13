# Charlie320/zils-mini-t2h

## Resumen

zils-mini-t2h es un ajuste fino (fine-tune) del modelo Qwen/Qwen3.5-4B publicado por el usuario Charlie320 bajo el paraguas del ecosistema Zils, orientado a tareas de decisión dentro del pool `d3-mini` de la subred 127 de Bittensor. El modelo se distribuye con licencia Apache 2.0, en formato safetensors y BF16, con un total de 4.539.265.536 parámetros (aproximadamente 4,54 mil millones) y un tamaño de repositorio de 9,1 GB. Su propósito declarado es actuar como "cuerpo" (body) dentro de un conjunto de modelos que compiten o colaboran en un mecanismo de validación tipo soup, es decir, un modelo especializado en responder ítems con formato de examen para su evaluación por validadores de la subred.

La arquitectura de partida es la de Qwen3.5-4B, un transformer denso de la familia Qwen, y el proceso de ajuste combina una media uniforme de dos cuerpos del pool `z3-mini` con el modelo de linaje propio `zils-mini-hp7`, seguida de un entrenamiento LoRA de rango 64 que se fusiona en el punto de partida. Los datos de entrenamiento son ítems de decisión en formato de examen generados con la receta pública de autoría de Zils, producidos por Claude Opus y por un modelo abierto local, además de las respuestas del profesor de relevo público de Zils.

La relevancia de este modelo es acotada y muy específica: no es un modelo de propósito general pensado para producción, sino un artefacto dentro de un pipeline de evaluación descentralizada. Para desarrolladores e investigadores resulta interesante como ejemplo de modelo de decisión ajustado sobre una base Qwen, con una receta de mezcla de pesos (model soup) más LoRA reproducible, y como caso de estudio de los flujos de trabajo de la subred 127 de Bittensor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen/Qwen3.5-4B) |
| Parametros totales | 4.539.265.536 (aprox. 4,54 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer denso de aproximadamente 4,54 mil millones de parámetros. Sobre esa base se aplica una receta de "soup fine-tune": el punto de partida es la media uniforme de los dos cuerpos actuales del pool `z3-mini` y el cuerpo de linaje propio `zils-mini-hp7`. Sobre esa mezcla se ejecuta un único entrenamiento LoRA de rango 64 con anchor 0,1, learning rate 5e-5 y una época, cuyo resultado se fusiona en los pesos de partida. El modelo conserva la torre de visión del modelo padre, según indica la model card, aunque no se detalla su configuración.

Los datos de entrenamiento consisten en ítems de decisión en formato de examen redactados con la receta pública de autoría de Zils (`scripts/author_exam.py`) por Claude Opus y por un modelo abierto local, empleando únicamente splits públicos de entrenamiento, más las respuestas del profesor de relevo público de Zils. La model card declara explícitamente que no se usaron ítems de examen de validadores ni ítems semilla públicos. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO adicionales.

## Capacidades

- Generación de texto y respuesta a ítems con formato de examen, que es el objetivo declarado del ajuste.
- Toma de decisiones sobre ítems de opción múltiple o formato estructurado, orientada a la evaluación por validadores de la subred 127 de Bittensor.
- Conservación de la torre de visión del modelo padre (Qwen3.5-4B), según la model card; no se detalla el alcance real de las capacidades multimodales tras el ajuste.
- Capacidades heredadas de la base Qwen3.5-4B (razonamiento, código, matemáticas, multilingüismo), aunque no se documentan explícitamente en la model card.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Evaluación en la subred 127 de Bittensor: el modelo se usaría como cuerpo del pool `d3-mini` para responder ítems de examen que los validadores puntúan; su diseño específico para ese formato lo hace adecuado para ese circuito concreto.
- Investigación sobre model soups: sirve como ejemplo reproducible de mezcla uniforme de pesos más fusión de LoRA de rango 64, útil para estudiar el efecto de la receta en el rendimiento sobre tareas de decisión.
- Generación de ítems de examen sintéticos: el modelo puede emplearse junto con la receta pública `scripts/author_exam.py` para producir ítems de decisión en formato de examen, dado que fue entrenado con ese mismo formato.
- Estudio de linajes de ajuste fino: permite comparar el comportamiento de `zils-mini-hp7` frente a los cuerpos del pool `z3-mini`, al ser una combinación explícita de ambos.
- Prototipado de clasificación/decisiones estructuradas: con 4,54 B de parámetros en BF16, puede desplegarse en una GPU de 24 GB para experimentos de respuesta a ítems con formato fijo.
- Reproducción de pipelines de ajuste con LoRA: el modelo documenta hiperparámetros concretos (rango 64, anchor 0,1, lr 5e-5, una época), lo que facilita replicar el flujo en otras bases Qwen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9,1 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, unos 11-13 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 4,5-5 GB de pesos.
- VRAM estimada en cuantización de 4 bits: alrededor de 2,3-2,8 GB de pesos.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 para BF16; RTX 3090/4090 (24 GB) son suficientes para BF16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 3090, RTX 4090, RTX 4080 y, con cuantización, en GPUs de 8-12 GB.
- Opciones de despliegue: no se documentan opciones específicas; al ser un transformer denso en safetensors, es compatible con vLLM, TGI, llama.cpp (previa conversión a GGUF) y Ollama (previa conversión).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| zils-mini-t2h | 4,54 B | no disponible | Apache 2.0 | Ajuste de decisión sobre Qwen3.5-4B para el pool `d3-mini` de Bittensor |
| Qwen/Qwen3.5-4B | ~4 B | no disponible | no disponible | Modelo base del que deriva; capacidades generales |
| Charlie320/zils-mini-hp7 | no disponible | no disponible | no disponible | Cuerpo de linaje propio usado en la mezcla inicial |
| jaysun007/zils-mini-body-m10 | no disponible | no disponible | no disponible | Cuerpo del pool `z3-mini` usado en la mezcla inicial |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo altamente especializado: está ajustado para ítems de decisión en formato de examen del ecosistema Zils, por lo que su rendimiento en tareas generales puede degradarse respecto a la base Qwen3.5-4B.
- Sesgos: no documentados; al entrenarse con ítems generados por Claude Opus y un modelo abierto local, puede heredar sesgos de esos generadores.
- Riesgo de alucinación: no evaluado en la información disponible; en tareas fuera de su dominio de entrenamiento el riesgo es probablemente alto.
- Idiomas: no se especifican los idiomas soportados; se desconoce si el ajuste conserva el multilingüismo de la base.
- Contexto: no se documenta la longitud de contexto efectiva tras el ajuste.
- Licencia: Apache 2.0 permite uso comercial, pero la model card advierte de que los términos de los datasets de origen deben verificarse antes de reutilizar los pesos.
- Procedencia de datos: el autor declara que no se usaron ítems de validadores ni ítems semilla públicos, pero no se aporta auditoría independiente.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere ausencia de validación comunitaria.
- Producción: no hay benchmarks, ni documentación de latencia, ni garantías de calidad; no se recomienda su uso en producción sin evaluación propia.

## Enlaces

- Hugging Face: https://huggingface.co/Charlie320/zils-mini-t2h
- Modelo base Qwen/Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo base jaysun007/zils-mini-body-m10: https://huggingface.co/jaysun007/zils-mini-body-m10
- Modelo base Charlie320/zils-mini-s3l: https://huggingface.co/Charlie320/zils-mini-s3l
- Modelo base Charlie320/zils-mini-hp7: https://huggingface.co/Charlie320/zils-mini-hp7
