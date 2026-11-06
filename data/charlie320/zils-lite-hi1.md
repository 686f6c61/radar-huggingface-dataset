# Charlie320/zils-lite-hi1

## Resumen

zils-lite-hi1 es un modelo de decisión de 852.985.920 parámetros publicado por Charlie320 en Hugging Face, concebido como un "body" (cuerpo de pesos) para el pool de soups `d3-lite` de Zils, un proyecto asociado a la subnet 127 de Bittensor. Se trata de un fine-tune del modelo Qwen/Qwen3.5-0.8B en el denominado "chassis layout", con pesos en BF16, capas de lenguaje entrenadas y la torre de visión heredada del modelo padre. Su propósito es servir como componente evaluable dentro de un ecosistema de modelos de decisión, no como un asistente conversacional generalista.

El entrenamiento parte del modelo casa internlm/Intern-Decision-0.8B (licencia Apache-2.0) y se estructura en dos etapas: un fine-tune completo de todas las capas de lenguaje con una función de pérdida que combina entropía cruzada y pérdida de Brier, anclada con un término KL al modelo de partida, seguida de una época de LoRA de rango 32 posteriormente fusionada. Los pesos finales son la media uniforme de los pesos de ambas etapas, una técnica de model souping que busca promediar soluciones para mejorar la robustez.

El modelo es relevante por su carácter experimental y su integración en un pipeline de evaluación descentralizado (Bittensor), así como por su tamaño reducido, que lo hace desplegable en hardware de consumo. No obstante, la información pública es muy limitada y no se han publicado benchmarks ni una descripción detallada de capacidades, lo que exige cautela antes de considerarlo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tune de Qwen/Qwen3.5-0.8B, "chassis layout" con torre de visión heredada) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer correspondiente a Qwen/Qwen3.5-0.8B, sobre el que se ha aplicado un fine-tune completo en el "chassis layout" descrito por el autor, manteniendo la torre de visión del modelo padre. El entrenamiento consta de dos etapas. La primera es un fine-tune completo de todas las capas de lenguaje con learning rate 4e-6, schedule coseno, aproximadamente 234.000 filas de datos, función de pérdida de entropía cruzada más pérdida de Brier y un ancla KL al modelo de partida sobre 40.000 filas de amplia cobertura. La segunda etapa es una época de LoRA con rango 32, alpha 64 y learning rate 2e-4 sobre 4.100 ítems en formato de examen, posteriormente fusionada. Los pesos finales resultan de la media uniforme de los pesos de ambas etapas (model soup).

Los datos de entrenamiento son ítems de decisión en formato de examen generados con la receta pública de autoría de Zils (`scripts/author_exam.py`) por Claude Opus y por un modelo abierto local, a partir únicamente de splits de entrenamiento públicos, más las respuestas del "relay teacher" público de Zils. El autor declara explícitamente que no se usaron ítems de examen del validador ni ítems semilla públicos. No se especifica el número total de tokens de entrenamiento ni la composición detallada del dataset.

## Capacidades

- Generación de texto y razonamiento de decisión en formato de examen, orientado a tareas de elección y evaluación estructurada.
- Capacidades de visión heredadas de la torre del modelo padre Qwen/Qwen3.5-0.8B (no se detalla su alcance ni su calidad tras el fine-tune).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el autor no declara idiomas soportados.
- Capacidades especiales (thinking mode, audio): no disponible.

## Casos de uso

- Evaluación en pools de model souping: el modelo está diseñado como "body" para el pool `d3-lite` de Zils, por lo que su uso principal es servir de componente en experimentos de promediado de pesos y comparación de variantes dentro de ese ecosistema.
- Investigación sobre pérdida de Brier y anclaje KL: su pipeline de entrenamiento documentado permite estudiar el efecto de combinar entropía cruzada con pérdida de Brier y un ancla KL al modelo de partida en modelos pequeños.
- Experimentos de fine-tune completo más LoRA fusionada: el modelo sirve como referencia reproducible para comparar la media uniforme de pesos de dos etapas frente a cada etapa por separado.
- Prototipado de modelos de decisión en formato de examen: útil para construir y validar pipelines de ítems tipo examen con modelos de menos de mil millones de parámetros.
- Despliegue en hardware de consumo para pruebas: con 852 millones de parámetros y pesos BF16, es viable en GPUs de gama media para inferencia de pruebas, aunque no se han publicado cifras de latencia.
- Integración en flujos de la subnet 127 de Bittensor: como cuerpo candidato dentro de un pool descentralizado, puede emplearse en tareas de evaluación comparativa entre modelos participantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 1,7 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, unos 2-3 GB según longitud de contexto y batch.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,9 GB para pesos; en 4 bits, alrededor de 0,5 GB (estimaciones teóricas, no verificadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para BF16 en contextos cortos; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y sobradas para este tamaño.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs modernas con 6 GB o más de VRAM.
- Opciones de despliegue: no se especifican en la model card; al ser safetensors de un transformer estándar, es compatible con frameworks como Transformers, vLLM o TGI, aunque no hay confirmación del autor.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| zils-lite-hi1 | 852.985.920 | no disponible | Apache-2.0 | Fine-tune de decisión con model soup; sin benchmarks publicados |
| Qwen/Qwen3.5-0.8B | ~0,8B (no confirmado) | no disponible | no disponible | Modelo base del fine-tune; capacidades generalistas |
| internlm/Intern-Decision-0.8B | ~0,8B (no confirmado) | no disponible | Apache-2.0 | Modelo casa de partida; orientado a decisión |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No se han publicado benchmarks ni evaluaciones independientes; el rendimiento real es desconocido.
- El modelo está entrenado específicamente para ítems en formato de examen; su comportamiento fuera de ese dominio es incierto.
- No se declaran idiomas soportados, por lo que el soporte multilingüe no está garantizado.
- La longitud de contexto no está documentada; asumir contextos largos es arriesgado.
- Riesgo de alucinación inherente a modelos de este tamaño, agravado por la falta de datos de evaluación.
- Los datos de entrenamiento fueron generados por Claude Opus y un modelo abierto local; pueden heredar sesgos de esos generadores.
- La licencia Apache-2.0 permite uso comercial, pero el autor advierte de que deben revisarse los términos de los datasets de origen antes de reutilizar los pesos.
- El repositorio contiene únicamente pesos; no se incluyen scripts de inferencia ni configuración de despliegue.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: ecosistema muy incipiente y sin validación comunitaria.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/Charlie320/zils-lite-hi1
- Perfil del autor en Hugging Face: https://huggingface.co/Charlie320
- Organización Zils en Hugging Face: https://huggingface.co/zils-ai
- Modelo base Qwen/Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Modelo casa internlm/Intern-Decision-0.8B: https://huggingface.co/internlm/Intern-Decision-0.8B
