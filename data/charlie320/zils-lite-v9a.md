# Charlie320/zils-lite-v9a

## Resumen

zils-lite-v9a es un ajuste fino (fine-tune) del modelo base Qwen/Qwen3.5-0.8B, publicado por el usuario Charlie320 en Hugging Face. Se presenta como un "body" (cuerpo de pesos) para el pool de mezclas (soup pool) del modelo de decisión Zils `d3-lite`, asociado a la subnet 127 de Bittensor. El modelo está diseñado específicamente para tareas de decisión en formato de examen: clasificar peticiones, marcar problemas o puntuar coincidencias, según la propuesta de valor de la plataforma Zils.

El modelo parte de qhoenix/zils-lite-decision-v9 y se construye mediante un promedio uniforme de pesos de cuatro ajustes finos de v9 (dos ajustes completos con entropía cruzada suave, Brier y filas de anclaje KL, y dos ajustes LoRA de rango 32), seguido de un desplazamiento de 1,25x a lo largo del cambio medio respecto a v9. Conserva la torre de visión del modelo padre y los pesos de lenguaje entrenados en BF16, con un total de 852.985.920 parámetros.

Su relevancia es acotada: se trata de un modelo experimental de 0,8B con cero descargas y cero likes en el momento de la consulta, orientado a un ecosistema muy específico (Zils y Bittensor subnet 127). No obstante, resulta interesante como ejemplo de metodología de mezcla de pesos (model soup) y de ajuste fino con anclaje KL sobre un modelo base pequeño, así como por su licencia Apache-2.0, que facilita su reutilización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-0.8B), con torre de visión del modelo padre |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen/Qwen3.5-0.8B, un transformer de aproximadamente 0,85 mil millones de parámetros. El modelo conserva la torre de visión del padre y los pesos de lenguaje entrenados en BF16, dentro de un diseño denominado "chassis layout" por el autor. No se dispone de información detallada sobre el número de capas, dimensiones ocultas ni mecanismos de atención específicos.

El entrenamiento se realizó en dos fases. Primero, se generaron ítems de decisión en formato de examen con la receta pública de autoría de Zils (scripts/author_exam.py), escritos por Claude Opus y por un modelo abierto local, usando únicamente splits públicos de entrenamiento y las respuestas del profesor de relevo (relay teacher) público de Zils; no se emplearon ítems de examen de validadores ni ítems semilla públicos. Sobre esa base se ejecutaron cuatro ajustes finos de v9: dos ajustes completos con entropía cruzada suave más Brier y filas de anclaje KL hacia v9 (lr 4e-6, aproximadamente 1,3 h cada uno) y dos ajustes LoRA de rango 32 (una época, lr 1e-4, anclaje KL 0,1). Posteriormente se promediaron uniformemente los pesos de los cuatro ajustes y se desplazó el resultado 1,25x a lo largo del cambio medio respecto a v9, una técnica de extrapolación de pesos (model soup con extrapolación).

## Capacidades

- Generación de texto y razonamiento de propósito general, heredados del modelo base Qwen3.5-0.8B.
- Toma de decisiones en formato de examen: clasificación de peticiones, marcado de problemas y puntuación de coincidencias, según la propuesta de Zils.
- Procesamiento de visión: conserva la torre de visión del modelo padre, aunque no se detallan las capacidades visuales concretas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo de pensamiento (thinking mode): no disponible en la información proporcionada.

## Casos de uso

- Clasificación de peticiones entrantes: el modelo puede asignar categorías a solicitudes de usuario en un flujo de atención al cliente, aprovechando su entrenamiento específico en ítems de decisión con formato de examen.
- Marcado de problemas en contenido generado: útil para detectar respuestas problemáticas o fuera de política en pipelines de moderación, gracias al ajuste con filas de anclaje KL que preservan el comportamiento del modelo de referencia v9.
- Puntuación de coincidencias: adecuado para rankear pares (consulta, candidato) en motores de búsqueda internos o sistemas de recomendación, dado su enfoque en tareas de scoring.
- Evaluación automatizada de decisiones: puede emplearse como juez ligero en entornos de investigación que comparan políticas de decisión, al ser un modelo pequeño (0,85B) desplegable en una sola GPU.
- Prototipado rápido en el ecosistema Zils: sirve como cuerpo de pesos para experimentar con el pool de mezclas d3-lite de la subnet 127 de Bittensor, sin necesidad de entrenar desde cero.
- Investigación sobre mezcla de pesos: útil como caso de estudio reproducible de model soup con extrapolación (promedio de cuatro ajustes y desplazamiento 1,25x) sobre un modelo base pequeño con licencia Apache-2.0.
- Experimentos multimodales ligeros: al conservar la torre de visión del padre, puede emplearse en pruebas de clasificación de imágenes o documentos, aunque las capacidades visuales no están documentadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 1,7 GB solo para los pesos (852.985.920 parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, entre 2 y 4 GB según la longitud de contexto.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,9 GB para los pesos; en 4 bits, alrededor de 0,5 GB (estimaciones teóricas, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU consumer moderna con al menos 4-6 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 4090) debería poder alojar el modelo en BF16 o cuantizado; para despliegue en producción se recomienda A100 o H100 por throughput, aunque no son necesarias por tamaño.
- Cabe en GPU consumer: sí, con margen amplio, dado el tamaño de 0,85B.
- Opciones de despliegue: vLLM, llama.cpp, Ollama y TGI son opciones plausibles para un transformer de este tamaño, aunque el autor no documenta compatibilidad explícita; los pesos están en safetensors y habría que convertirlos a GGUF para llama.cpp/Ollama.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| zils-lite-v9a | 852.985.920 | no disponible | Apache-2.0 | Hugging Face (Charlie320/zils-lite-v9a) |
| Qwen/Qwen3.5-0.8B (modelo base) | ~0,8B | no disponible | no disponible en la información proporcionada | Hugging Face |
| qhoenix/zils-lite-decision-v9 (modelo de partida) | no disponible | no disponible | Apache-2.0 (según la model card) | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental con cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso en producción ni validación externa.
- Riesgo de alucinación inherente a los modelos de 0,8B, especialmente en tareas de razonamiento complejo o contexto largo.
- Los datos de entrenamiento provienen de ítems generados por Claude Opus y un modelo abierto local, lo que puede introducir sesgos de estilo y de contenido de esos generadores.
- No se documentan los idiomas soportados; el rendimiento fuera del inglés (si el entrenamiento fue en inglés) es incierto.
- Longitud de contexto no documentada; no se debe asumir la ventana nativa de Qwen3.5 sin verificación.
- La model card advierte de que el repositorio contiene solo pesos y que deben revisarse los términos de los datasets de origen antes de su reutilización.
- Aunque la licencia es Apache-2.0, el modelo base Qwen/Qwen3.5-0.8B puede tener sus propios términos que conviene verificar antes de un uso comercial.
- El despliegue en llama.cpp/Ollama requiere conversión a GGUF, no incluida en el repositorio.
- El modelo está orientado a un ecosistema concreto (Zils, Bittensor subnet 127); su comportamiento fuera de ese dominio no está caracterizado.

## Enlaces

- Hugging Face: https://huggingface.co/Charlie320/zils-lite-v9a
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Modelo de partida: https://huggingface.co/qhoenix/zils-lite-decision-v9
- Sitio de Zils: https://zils.ai/
- Página de investigación del modelo Zils: https://zils.ai/model
