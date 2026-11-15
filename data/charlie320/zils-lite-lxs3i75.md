# Charlie320/zils-lite-lxs3i75

## Resumen

zils-lite-lxs3i75 es un ajuste fino (fine-tune) del modelo Qwen/Qwen3.5-0.8B publicado por el usuario Charlie320 en Hugging Face. Se presenta como un "body" (cuerpo) para el pool de modelos Zils `d3-lite`, asociado a la subred 127 de Bittensor, una red descentralizada de entrenamiento de IA. El modelo está pensado como un modelo de decisión (decision-model) dentro de ese ecosistema, no como un asistente conversacional de propósito general.

Técnicamente es un transformer de 852.985.920 parámetros (aproximadamente 0,85 mil millones) con pesos en BF16 y un total de 1,7 GB en el repositorio. Parte de una media ponderada uniforme de dos cuerpos previos del pool (`VadymPikulyk/zils-lite-dh2` y `qhoenix/zils-lite-decision-avg-abc`), sobre la que se aplica una interpolación de pesos con el resultado de promediar tres ejecuciones LoRA de rango 32. La licencia es Apache-2.0, lo que facilita su reutilización comercial con atribución.

Su relevancia es acotada: se trata de un modelo experimental de nicho, con cero descargas y cero "likes" en el momento de la consulta, sin model card extensa ni benchmarks publicados. Resulta interesante como ejemplo de entrenamiento colaborativo descentralizado (Bittensor) y de técnicas de model soup y LoRA merging sobre modelos pequeños, pero no como una alternativa generalista a modelos de mayor tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-0.8B); incluye torre de visión heredada del modelo padre |
| Parametros totales | 852.985.920 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en BF16; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre la arquitectura de Qwen/Qwen3.5-0.8B, un transformer denso de aproximadamente 0,85 mil millones de parámetros. La model card indica que se conserva el "chassis layout" del padre y que la torre de visión procede del modelo base, mientras que los pesos de lenguaje sí fueron entrenados. No se detalla la configuración interna (número de capas, dimensiones ocultas, cabezas de atención) ni la longitud de contexto nativa.

El proceso de entrenamiento combina dos técnicas. Primero, se parte de una media uniforme de pesos (model soup) de dos cuerpos del pool `d3-lite` del 14 de noviembre de 2026: `VadymPikulyk/zils-lite-dh2` y `qhoenix/zils-lite-decision-avg-abc`. Sobre ese punto de partida se entrenan tres LoRA de rango 32 con learning rate 5e-5, una época cada una y semillas distintas; cada LoRA se fusiona en el punto de partida y el resultado F se interpola con el inicio mediante la fórmula 0,75 × F + 0,25 × inicio. Los datos de entrenamiento son aproximadamente 46.700 filas de ítems de decisión en formato de examen, generados con la receta pública `scripts/author_exam.py` por Claude Opus y por un modelo abierto local, a partir únicamente de splits públicos, más las respuestas del profesor de relay público de Zils. No se usaron ítems de examen de validador, ni ítems de examen semilla públicos, ni datos de clientes.

## Capacidades

- Generación de texto y clasificación/decisión: el modelo está orientado a tareas de decisión en formato de examen dentro del ecosistema Zils, no a diálogo abierto general.
- Razonamiento sobre ítems estructurados: entrenado explícitamente con ítems de examen de decisión, por lo que su punto fuerte es responder preguntas de opción o formato evaluable.
- Capacidades de visión: hereda la torre de visión del modelo padre Qwen/Qwen3.5-0.8B, aunque la model card no detalla el alcance ni la calidad de dicha capacidad tras el ajuste.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; la model card no especifica idiomas.
- Modo de pensamiento (thinking mode): no disponible en la información proporcionada.

## Casos de uso

- Evaluación de modelos de decisión en la subred 127 de Bittensor: el modelo se integra en el pool `d3-lite` como cuerpo candidato, y los validadores pueden puntuar sus respuestas a ítems de examen para seleccionar los mejores cuerpos del pool.
- Investigación en model soups y LoRA merging: sirve como caso reproducible de interpolación de pesos (0,75 × F + 0,25 × inicio) con tres LoRA de rango 32, útil para estudiar cómo afecta el promediado de pesos al rendimiento en tareas específicas.
- Clasificación de ítems tipo examen: dado un enunciado con opciones, el modelo puede emitir una respuesta de decisión, aprovechando su entrenamiento específico en ese formato con unas 46.700 filas.
- Prototipado de pipelines de evaluación automatizada: por su tamaño reducido (0,85 B de parámetros) y pesos BF16, puede desplegarse en una sola GPU consumer para probar flujos de autoría y corrección de exámenes antes de escalar a modelos mayores.
- Base para ajustes finos posteriores: al ser Apache-2.0 y tener un tamaño manejable, puede servir como punto de partida para fine-tunes con LoRA en dominios concretos sin requerir hardware de datacenter.
- Experimentación con modelos multimodales pequeños: la torre de visión heredada permite explorar tareas que combinen texto e imagen en un rango de 0,85 B de parámetros, aunque sin garantías documentadas de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 1,7 GB solo para los pesos (852.985.920 parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, entre 2 y 4 GB según longitud de contexto y lote.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,9-1,5 GB; en 4 bits, alrededor de 0,5-1 GB (estimaciones teóricas, no verificadas por el autor).
- GPU recomendadas: cualquier GPU consumer moderna con al menos 4-6 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 4090) es suficiente; no requiere A100 ni H100.
- Cabe en GPU consumer: sí, con margen amplio, incluso en GPUs de gama de entrada.
- Opciones de despliegue: al publicarse solo en safetensors, es compatible con Transformers, vLLM y TGI; para llama.cpp u Ollama sería necesario convertir los pesos a GGUF, conversión no documentada por el autor.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-lite-lxs3i75 | 852.985.920 | No disponible | Apache-2.0 | Hugging Face (0 descargas) | Fine-tune de decisión para el pool Zils |
| Qwen/Qwen3.5-0.8B | ~0,8 B | No disponible | No disponible en esta ficha | Hugging Face (modelo base) | Modelo generalista del que deriva; incluye visión |
| VadymPikulyk/zils-lite-dh2 | No disponible | No disponible | Apache-2.0 | Hugging Face | Cuerpo previo del pool usado como punto de partida |
| qhoenix/zils-lite-decision-avg-abc | No disponible | No disponible | Apache-2.0 | Hugging Face | Cuerpo previo del pool usado como punto de partida |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de estos modelos entre sí.

## Limitaciones y advertencias

- Modelo de nicho: está diseñado para ítems de decisión en formato de examen del ecosistema Zils, no para conversación general, código o matemáticas avanzadas.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su calidad frente a alternativas, lo que dificulta justificar su uso en producción.
- Riesgo de alucinación: como todo modelo generativo de 0,85 B de parámetros, puede producir respuestas plausibles pero incorrectas, especialmente fuera del formato de examen para el que fue entrenado.
- Idiomas no documentados: la model card no especifica qué idiomas cubre, por lo que no se puede asumir un buen rendimiento en castellano u otras lenguas.
- Contexto no documentado: se desconoce la longitud máxima de contexto soportada, lo que limita su uso en tareas de contexto largo.
- Datos de entrenamiento sintéticos: los ítems de examen fueron generados por Claude Opus y un modelo abierto local, lo que puede introducir sesgos y errores sistemáticos del profesor utilizado.
- Restricciones de licencia: Apache-2.0 permite uso comercial con atribución, pero la model card advierte de que los términos de los datasets de origen deben verificarse antes de reutilizar los pesos.
- Procedencia experimental: cero descargas y cero "likes" en el momento de la consulta, sin validación externa de la comunidad; tratarlo como un artefacto de investigación, no como un modelo listo para producción.
- Solo pesos: el repositorio no incluye scripts de inferencia, tokenizador documentado ni receta de despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/Charlie320/zils-lite-lxs3i75
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Cuerpo previo 1: https://huggingface.co/VadymPikulyk/zils-lite-dh2
- Cuerpo previo 2: https://huggingface.co/qhoenix/zils-lite-decision-avg-abc
