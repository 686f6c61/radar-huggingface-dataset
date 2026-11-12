# Charlie320/zils-mini-hp7

## Resumen

zils-mini-hp7 es un modelo de decisión de tipo "body" (cuerpo de pesos) publicado por el usuario Charlie320 para el pool de soups `d3-mini` del proyecto Zils, asociado a la subred 127 de Bittensor. Se trata de un fine-tune de Qwen/Qwen3.5-4B en el formato de chasis definido por Zils, con pesos en BF16, pesos de lenguaje entrenados y la torre de visión heredada del modelo padre. El repositorio contiene únicamente pesos: no incluye código de inferencia ni tokenizador propio documentado.

El modelo se construye por "soup" (promediado de pesos) a partir de una línea genealógica interna: un punto de partida que es la media de tres modelos de la casa, siete miembros entrenados de forma independiente (fine-tunes completos sobre la mitad superior y LoRAs ancladas) promediados entre sí, y un escalado de ×1,3 respecto al punto de partida. Los modelos base declarados incluyen Qwen/Qwen3.5-4B, perplexity-ai/pplx-decider-flash-v1.2, Maincode/Matilda-Decision-v1-Mini y PelaAI/KnowLine-4B-Gen5.

Su relevancia es acotada y experimental: no es un modelo de propósito general, sino un artefacto de un ecosistema de decisión descentralizado (Bittensor) con 0 descargas y 0 likes en el momento de la ficha. Resulta de interés para quienes investigan técnicas de model souping, evaluación tipo examen y entrenamiento de modelos pequeños de decisión sobre arquitecturas Qwen.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-4B), con torre de visión heredada del padre |
| Parámetros totales | 4.539.265.536 (~4,54 mil millones) |
| Parámetros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen/Qwen3.5-4B, un transformer denso de aproximadamente 4,54 mil millones de parámetros según el recuento real de safetensors. El modelo conserva la torre de visión del modelo padre, aunque la model card no detalla si esa torre fue reentrenada o congelada. El artefacto final no es un entrenamiento único, sino una combinación por promediado de pesos: se parte de la media de tres modelos de la casa, se promedian siete miembros entrenados de forma independiente (fine-tunes completos sobre la mitad superior de las capas y LoRAs ancladas) y el resultado se escala ×1,3 respecto al punto de partida.

Los datos de entrenamiento son ítems de decisión en formato de examen, generados con la receta pública de autoría de Zils (`scripts/author_exam.py`) por Claude Opus y por un modelo abierto local, a partir exclusivamente de splits de entrenamiento públicos, más las respuestas del profesor de relevo público de Zils. La model card afirma explícitamente que no se usaron ítems de examen de validador ni ítems semilla públicos. No se documentan número de tokens, composición del dataset, ni si hubo RLHF, DPO o una fase de alineación adicional.

## Capacidades

- Generación de texto y razonamiento de decisión: el modelo está orientado a ítems en formato de examen y tareas de elección o decisión, no a chat general.
- Procesamiento multimodal: hereda la torre de visión del modelo padre, por lo que en principio puede procesar entradas de imagen, aunque no se detalla el alcance ni la calidad de esta capacidad.
- Capacidades multilingües: no disponibles; la model card no declara idiomas.
- Tool calling / function calling: no disponible; no se documenta soporte.
- Soporte de agentes y razonamiento multi-paso: no disponible; el enfoque declarado es la decisión en un paso (formato examen).
- Modo thinking: no disponible.
- Capacidades de código y matemáticas: no disponibles de forma específica; dependen del modelo base Qwen3.5-4B, pero no se han validado en este fine-tune.

## Casos de uso

- Investigación en model souping: el modelo sirve como caso de estudio reproducible de promediado de pesos con escalado ×1,3 sobre una base Qwen de 4B, útil para comparar estrategias de fusión (media simple, TIES, DARE) en modelos pequeños.
- Evaluación de modelos de decisión en entornos Bittensor: puede desplegarse como "body" en el pool `d3-mini` de la subred 127 para medir su rendimiento frente a otros cuerpos del mismo pool con la receta de examen pública.
- Generación de datos sintéticos de examen: al estar entrenado con ítems en formato examen, puede usarse para producir borradores de preguntas de decisión que luego se filtran y validan manualmente.
- Clasificación y elección entre opciones: en pipelines donde la tarea se formula como selección entre alternativas con contexto textual, el modelo puede puntuar o elegir opciones, siempre con validación previa.
- Experimentos de destilación desde profesores: dado que se entrenó con respuestas de un profesor de relevo, sirve para estudiar la fidelidad de la destilación en modelos de 4B.
- Prototipado multimodal ligero: gracias a la torre de visión heredada, puede emplearse en pruebas de concepto de decisión sobre imágenes, con la advertencia de que no hay documentación sobre su rendimiento visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9,1 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 12 y 16 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 5 GB de pesos; en 4 bits, alrededor de 3 GB, aunque no se publican GGUF ni cuantizaciones oficiales.
- GPU recomendadas: A100 40 GB, H100 o L40S para despliegue en BF16 con contexto largo; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para BF16 con contextos moderados.
- GPU de consumo: cabe en RTX 4090, RTX 3090, RTX 4080 (16 GB) y, con cuantización a 8 o 4 bits, en GPUs de 8-12 GB como RTX 3060 Ti o RTX 4070.
- Opciones de despliegue: vLLM, TGI o transformers para BF16; llama.cpp u Ollama requerirían convertir los pesos a GGUF, conversión no publicada por el autor.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-mini-hp7 | ~4,54 B | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Soup de decisión para Bittensor |
| Qwen/Qwen3.5-4B (base) | ~4 B | no disponible | no disponible en esta ficha | Hugging Face | Modelo base del que deriva |
| Maincode/Matilda-Decision-v1-Mini | no disponible | no disponible | no disponible | Hugging Face | Modelo base declarado, orientado a decisión |
| PelaAI/KnowLine-4B-Gen5 | ~4 B (por nombre) | no disponible | no disponible | Hugging Face | Modelo base declarado |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental con 0 descargas y 0 likes: no hay evidencia de uso en producción ni validación externa.
- La model card no documenta idiomas, contexto, cuantizaciones ni benchmarks; cualquier despliegue requiere evaluación propia.
- Riesgo de alucinación y de sobreajuste al formato de examen: el entrenamiento se centró en ítems de decisión, por lo que el comportamiento fuera de ese formato es incierto.
- Sesgos desconocidos: no se documenta composición del dataset ni procesos de mitigación de sesgos.
- La torre de visión se hereda del padre sin documentación sobre su estado de entrenamiento; su fiabilidad es incierta.
- Licencia Apache 2.0 permite uso comercial, pero la model card advierte de que los términos de los datasets de origen deben comprobarse antes de reutilizar los pesos.
- El repositorio contiene solo pesos; no se incluye tokenizador, código de inferencia ni configuración de chat documentada, lo que complica su uso directo.
- La genealogía de pesos por promediado y escalado ×1,3 puede producir inestabilidades numéricas no documentadas.

## Enlaces

- Hugging Face: https://huggingface.co/Charlie320/zils-mini-hp7
- Modelo base Qwen: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo base perplexity-ai/pplx-decider-flash-v1.2: https://huggingface.co/perplexity-ai/pplx-decider-flash-v1.2
- Modelo base Maincode/Matilda-Decision-v1-Mini: https://huggingface.co/Maincode/Matilda-Decision-v1-Mini
- Modelo base PelaAI/KnowLine-4B-Gen5: https://huggingface.co/PelaAI/KnowLine-4B-Gen5
