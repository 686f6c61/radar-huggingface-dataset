# Charlie320/zils-lite-k3b

## Resumen

zils-lite-k3b es un ajuste fino (fine-tune) del modelo Qwen/Qwen3.5-0.8B, publicado por el usuario Charlie320 en Hugging Face. Se presenta como un "body" (cuerpo) para el pool de modelos tipo "soup" denominado d3-lite, asociado a la subred 127 de Bittensor. El modelo parte de una mezcla previa de otros dos fine-tunes (thermopylae-777/zils-lite-body-2 y dasLOL/zils-lite-skills-v5), ambos con licencia Apache-2.0, y aplica un ajuste suave con objetivos suaves (soft targets), preguntas computadas y regularización hacia el modelo de partida, afectando únicamente a las capas superiores.

Con 852.985.920 parámetros (aproximadamente 853 millones) en formato safetensors y BF16, el modelo se sitúa en la gama ultraligera de la familia Qwen3.5. La model card indica que conserva la torre de visión del modelo padre y que se han entrenado los pesos de lenguaje, lo que sugiere capacidades multimodales heredadas, aunque no se detallan arquitectura interna ni configuración de contexto.

La relevancia de esta ficha es limitada pero concreta: se trata de un modelo experimental de una comunidad de entrenamiento descentralizado (Bittensor), con cero descargas y cero likes en el momento de la consulta, y con información técnica muy escasa. Resulta útil como referencia para quienes siguen los pools de modelos "soup" y las dinámicas de fine-tuning colaborativo, pero no como un modelo de producción con benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-0.8B; detalles internos no disponibles) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se describe como un fine-tune del Qwen/Qwen3.5-0.8B en "chassis layout", con pesos de lenguaje entrenados y torre de visión heredada del padre. El proceso de entrenamiento parte de una mezcla (soup) de dos fine-tunes previos, thermopylae-777/zils-lite-body-2 y dasLOL/zils-lite-skills-v5, y aplica objetivos suaves con regularización hacia el modelo inicial, limitando la actualización a las capas superiores. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO.

Los datos de entrenamiento consisten en "preguntas computadas" generadas por el proyecto y particiones públicas de entrenamiento sujetas a sus propias licencias. La model card advierte explícitamente de que deben revisarse los términos de los datasets originales antes de reutilizar el modelo. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y ajuste fino orientado a tareas de decisión (etiqueta "decision-model").
- Capacidades de visión heredadas de la torre del modelo padre Qwen3.5-0.8B, según indica la model card.
- Entrenamiento sobre "preguntas computadas", lo que sugiere cierto énfasis en razonamiento aritmético o resolución de problemas estructurados, aunque no se detalla.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se listan idiomas).
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Experimentación en pools de modelos "soup" de Bittensor: el modelo está pensado como "body" para el pool d3-lite de la subred 127, por lo que su uso natural es participar en ese ecosistema de evaluación y mezcla de modelos.
- Fine-tuning ligero en entornos con recursos limitados: con 853 millones de parámetros en BF16, cabe en GPUs de consumo y permite iterar rápidamente sobre ajustes de capas superiores.
- Prototipado de clasificación o decisión: la etiqueta "decision-model" sugiere su uso en tareas de selección entre opciones o scoring, aunque sin benchmarks que lo respalden.
- Investigación sobre regularización y soft targets: el proceso de entrenamiento documentado (regularización al modelo inicial, solo capas superiores) lo convierte en un caso de estudio reproducible para quienes investigan técnicas de fine-tuning suave.
- Evaluación multimodal exploratoria: la torre de visión heredada permite probar tareas imagen-texto, siempre con la cautela de que no hay evaluación publicada.
- Base para experimentos de destilación o mezcla: al ser un fine-tune de un modelo pequeño y con licencia Apache-2.0, puede servir como componente en recetas de model soup o destilación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 1,7 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 3 y 5 GB según longitud de contexto.
- VRAM estimada en cuantización de 8 bits: alrededor de 1 GB para pesos; en 4 bits, en torno a 0,5 GB, más overhead.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para BF16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y sobradas.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas modernas con 6 GB o más; también en CPU con llama.cpp u Ollama para inferencia lenta.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama y transformers, siempre que se conviertan los pesos safetensors a GGUF si se usa llama.cpp.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| zils-lite-k3b | 853 M | no disponible | Apache-2.0 | Fine-tune comunitario de Qwen3.5-0.8B, sin benchmarks |
| Qwen/Qwen3.5-0.8B | ~0,8 B | no disponible | Apache-2.0 (según modelo base) | Modelo padre, con documentación oficial y benchmarks propios |
| thermopylae-777/zils-lite-body-2 | no disponible | no disponible | Apache-2.0 | Fine-tune previo del mismo pool, componente del soup |
| dasLOL/zils-lite-skills-v5 | no disponible | no disponible | Apache-2.0 | Fine-tune previo del mismo pool, componente del soup |

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia de rendimiento en MMLU, HumanEval, GSM8K ni otras tareas estándar.
- Cero descargas y cero likes en el momento de la consulta, lo que indica nula validación por parte de la comunidad.
- Información técnica incompleta: no se documentan contexto, idiomas, cuantizaciones ni detalles de arquitectura.
- Riesgo de alucinación y sesgos: no evaluado; al ser un fine-tune de un modelo pequeño, es esperable una fiabilidad limitada en tareas de razonamiento complejo.
- Licencia Apache-2.0 permite uso comercial, pero los datasets de entrenamiento tienen sus propias licencias y la model card exige revisarlas antes de reutilizar el modelo.
- El modelo está diseñado para un ecosistema específico (pool d3-lite de Bittensor), por lo que su comportamiento fuera de ese contexto no está caracterizado.
- La torre de visión es heredada del padre y no se ha reentrenado, según la model card; su calidad multimodal no está verificada.

## Enlaces

- Hugging Face: https://huggingface.co/Charlie320/zils-lite-k3b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Componente del soup: https://huggingface.co/thermopylae-777/zils-lite-body-2
- Componente del soup: https://huggingface.co/dasLOL/zils-lite-skills-v5
