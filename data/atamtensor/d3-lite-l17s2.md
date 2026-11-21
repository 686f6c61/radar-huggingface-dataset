# atamtensor/d3-lite-l17s2

## Resumen

d3-lite-l17s2 es un ajuste fino (fine-tune) del modelo Qwen/Qwen3.5-0.8B publicado por el usuario atamtensor en Hugging Face. Se presenta como un "body" (cuerpo) para el pool de modelos tipo soup denominado Zils d3-lite, asociado a la subred 127 de Bittensor. El modelo parte de joamCriff123/zils-lite-l1117a, un soup previo de las rondas del 18 y 19 de noviembre de 2026, y aplica sobre él tres ejecuciones de LoRA de rango 32 seguidas de una combinación de pesos (la base más dos veces el cambio promedio de los adaptadores).

Con 852.985.920 parámetros totales (aproximadamente 0,85 mil millones) y pesos en BF16, se trata de un modelo pequeño orientado a tareas de decisión y razonamiento dentro del ecosistema Zils. La model card indica que los pesos de lenguaje fueron entrenados y que la torre de visión proviene del modelo padre, lo que sugiere capacidades multimodales heredadas.

La relevancia de esta ficha es limitada pero concreta: documenta un artefacto de un pipeline de entrenamiento colaborativo (soup pool) con licencia Apache-2.0, útil para quienes siguen el ecosistema Bittensor o quieren reproducir técnicas de model soup y LoRA sobre modelos de menos de mil millones de parámetros. No hay información pública sobre benchmarks ni sobre el pipeline de inferencia declarado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-0.8B; incluye torre de visión heredada del padre) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen/Qwen3.5-0.8B, un transformer de aproximadamente 0,85 mil millones de parámetros. El modelo se publica en el "chassis layout" d3-lite, que según la model card incluye una torre de visión heredada del modelo padre, aunque no se detalla su configuración interna ni el número de capas, cabezas de atención o dimensión oculta.

El entrenamiento parte de joamCriff123/zils-lite-l1117a y aplica tres ejecuciones de LoRA con rango 32, tasa de aprendizaje 1e-4 y distintas semillas y órdenes de datos. Posteriormente se combinan los pesos como la base más dos veces el cambio promedio de los adaptadores (una variante de model soup). Los datos de entrenamiento incluyen la mitad de los ítems públicos del seed de Zils (repetidos 4 veces), 3.000 ítems de decisión generados por un LLM (deepseek-v4.1-flash) a partir de particiones públicas de entrenamiento (BIG-bench y datasets públicos de las familias conocidas), y ítems generados por reglas. Se usaron etiquetas suavizadas con factor 0,96. La model card afirma explícitamente que no se emplearon ítems del examen privado del validador ni filas de validación/test reservadas.

## Capacidades

- Generación de texto y razonamiento de propósito general, heredados de la base Qwen3.5-0.8B.
- Capacidades de visión: la torre de visión proviene del modelo padre, según la model card.
- Entrenamiento específico en tareas de decisión (3.000 ítems de decisión generados y reescrituras más difíciles de filas públicas), orientado a elegir entre opciones o resolver preguntas de tipo examen.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Evaluación de técnicas de model soup: el modelo sirve como caso de estudio reproducible de combinación de LoRA r32 con distintas semillas y de la fórmula base + 2 × cambio promedio, útil para investigadores que experimentan con ensembles de bajo coste.
- Clasificación y respuesta a preguntas de opción múltiple: dado el entrenamiento con ítems de decisión y reescrituras de BIG-bench, puede emplearse en tareas de selección entre alternativas en entornos de evaluación controlados.
- Prototipado rápido en entornos con recursos limitados: con menos de mil millones de parámetros y pesos BF16, cabe en GPUs de consumo para pruebas de concepto sin infraestructura dedicada.
- Investigación sobre subredes Bittensor: sirve para estudiar el pipeline de la subred 127 (Zils) y comparar cuerpos ("bodies") del pool d3-lite.
- Tareas multimodales ligeras: al heredar la torre de visión del padre, puede usarse para experimentos de descripción de imágenes o VQA de baja complejidad, siempre que se valide su calidad real.
- Base para nuevos ajustes finos: al ser Apache-2.0 y de tamaño reducido, es un punto de partida económico para fine-tunes con LoRA en dominios específicos.
- Generación de datos sintéticos de decisión: puede emplearse como generador auxiliar en pipelines que necesiten reformular preguntas de entrenamiento en versiones más difíciles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 1,7 GB solo para pesos, más overhead de activaciones y caché KV (el tamaño del repo es de 1,7 GB).
- VRAM estimada en cuantización de 8 bits: alrededor de 0,9 GB; en 4 bits, alrededor de 0,5 GB (estimaciones teóricas a partir del número de parámetros, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM para BF16 en contexto corto; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son suficientes.
- Cabe en GPU de consumo: sí, previsiblemente en la mayoría de tarjetas con 8 GB o más en BF16 y en tarjetas con 4-6 GB si se cuantiza.
- Opciones de despliegue: al ser safetensors, es compatible con vLLM, TGI, transformers y llama.cpp (previa conversión a GGUF). No hay confirmación del autor sobre compatibilidad con Ollama.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| atamtensor/d3-lite-l17s2 | 852.985.920 | no disponible | Apache-2.0 | Fine-tune con LoRA y soup sobre Qwen3.5-0.8B; torre de visión heredada |
| Qwen/Qwen3.5-0.8B | ~0,8 mil millones (no confirmado en la información) | no disponible | no disponible en la información | Modelo base del que deriva |
| joamCriff123/zils-lite-l1117a | no disponible | no disponible | Apache-2.0 (según la model card) | Soup de partida de las rondas del 18 y 19 de noviembre de 2026 |

No se dispone de datos de rendimiento comparado ni de otros modelos de la misma categoría con benchmarks publicados en la información proporcionada.

## Limitaciones y advertencias

- No se han publicado evaluaciones independientes ni benchmarks; el rendimiento real es desconocido.
- El modelo se entrenó con datos generados por un LLM (deepseek-v4.1-flash) y con etiquetas suavizadas, lo que puede introducir sesgos y errores sistemáticos en las respuestas de decisión.
- Riesgo de alucinación inherente a modelos de 0,85 mil millones de parámetros, especialmente en tareas de conocimiento factual.
- No se especifican los idiomas soportados ni la longitud de contexto; no se debe asumir un contexto largo sin verificación.
- Aunque la licencia es Apache-2.0, la model card no detalla restricciones adicionales; conviene revisar las condiciones del modelo base Qwen3.5-0.8B antes de uso comercial.
- El modelo está vinculado a un pool de Bittensor (subred 127); su propósito original es participar en ese ecosistema, no el despliegue general en producción.
- La torre de visión se hereda del padre sin evidencia de que haya sido reentrenada, por lo que su calidad multimodal es incierta.
- No hay información sobre el pipeline de inferencia declarado (pipeline: no disponible), lo que complica la integración automatizada.

## Enlaces

- Hugging Face: https://huggingface.co/atamtensor/d3-lite-l17s2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Modelo de partida (soup): https://huggingface.co/joamCriff123/zils-lite-l1117a
- Subred Bittensor 127 (Zils): no disponible enlace oficial en la información proporcionada
